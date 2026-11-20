-- ============================================================================
-- ERP SAAS MULTI-TENANT BIRO PERJALANAN UMRAH & HAJI
-- FASE 5: ENGINE MITIGASI KURS VALAS (UNREALIZED FX), AUTO-RECONCILE BANK,
--         KEMITRAAN BROKER MULTI-TIER, AGENT WALLETS, & MARGIN WHOLESALE KSO
-- Dialect: PostgreSQL 14+
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. REKONSILIASI BANK OTOMATIS (AUTO-RECONCILE BANK)
-- ============================================================================

-- 1.1 Tabel Rekening Bank Biro (Bank Master Accounts)
CREATE TABLE IF NOT EXISTS bank_accounts (
    bank_account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    branch_id VARCHAR(50) NOT NULL, -- 'PST', 'SUB', 'C01'
    bank_name VARCHAR(100) NOT NULL, -- 'Bank Syariah Indonesia', 'Bank Mandiri', 'Al-Rajhi Bank'
    account_number VARCHAR(50) NOT NULL,
    account_holder_name VARCHAR(150) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'IDR' CHECK (currency IN ('IDR', 'SAR', 'USD')),
    coa_code VARCHAR(50) NOT NULL DEFAULT '1010', -- COA Kas & Bank
    current_gl_balance NUMERIC(18, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_bank_acc UNIQUE (tenant_id, account_number)
);

-- 1.2 Tabel Mutasi Rekening Koran Bank (Bank Statements)
CREATE TABLE IF NOT EXISTS bank_statements (
    statement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    bank_account_id UUID NOT NULL REFERENCES bank_accounts(bank_account_id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    value_date DATE NOT NULL,
    description TEXT NOT NULL,
    reference_number VARCHAR(100), -- No referensi mutasi / kode unik
    mutation_type VARCHAR(10) NOT NULL CHECK (mutation_type IN ('CR', 'DB')), -- CR = Uang Masuk, DB = Keluar
    amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
    ending_balance NUMERIC(18, 2) NOT NULL,
    is_matched BOOLEAN NOT NULL DEFAULT FALSE,
    match_confidence VARCHAR(20) DEFAULT 'UNMATCHED' CHECK (match_confidence IN ('EXACT', 'FUZZY', 'MANUAL', 'UNMATCHED')),
    matched_payment_id UUID, -- Terhubung ke booking_payment atau vendor_payment
    matched_journal_id UUID REFERENCES journal_masters(journal_id),
    matched_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 1.3 Stored Procedure Auto-Reconcile Matcher
CREATE OR REPLACE FUNCTION sp_auto_reconcile_bank_statements(
    p_tenant_id UUID,
    p_bank_account_id UUID
)
RETURNS TABLE (
    total_scanned INT,
    total_matched INT,
    total_unmatched INT
) AS $$
DECLARE
    r_stmt RECORD;
    v_booking_id UUID;
    v_journal_id UUID;
    v_matched_count INT := 0;
    v_scanned_count INT := 0;
BEGIN
    FOR r_stmt IN 
        SELECT * FROM bank_statements 
        WHERE tenant_id = p_tenant_id 
          AND bank_account_id = p_bank_account_id 
          AND is_matched = FALSE 
    LOOP
        v_scanned_count := v_scanned_count + 1;

        -- 1. Strategi Match 1: Uang Masuk (CR) dengan Booking Tagihan
        IF r_stmt.mutation_type = 'CR' THEN
            -- Cari booking berdasarkan kode referensi persis di deskripsi mutasi
            SELECT booking_id INTO v_booking_id
            FROM bookings
            WHERE tenant_id = p_tenant_id
              AND (
                  r_stmt.description ILIKE '%' || booking_number || '%'
                  OR r_stmt.reference_number = booking_number
                  OR (net_payable = r_stmt.amount AND status = 'DP_PAID')
              )
            LIMIT 1;

            IF v_booking_id IS NOT NULL THEN
                UPDATE bank_statements
                SET is_matched = TRUE,
                    match_confidence = 'EXACT',
                    matched_payment_id = v_booking_id,
                    matched_at = CURRENT_TIMESTAMP,
                    notes = 'Auto-matched via Booking Number / Exact Nominal'
                WHERE statement_id = r_stmt.statement_id;

                v_matched_count := v_matched_count + 1;
                CONTINUE;
            END IF;
        END IF;

        -- 2. Strategi Match 2: Uang Keluar (DB) dengan Vendor Payment
        IF r_stmt.mutation_type = 'DB' THEN
            SELECT payment_id, journal_id INTO v_booking_id, v_journal_id
            FROM vendor_payments
            WHERE tenant_id = p_tenant_id
              AND amount_idr_at_payment = r_stmt.amount
            LIMIT 1;

            IF v_booking_id IS NOT NULL THEN
                UPDATE bank_statements
                SET is_matched = TRUE,
                    match_confidence = 'EXACT',
                    matched_payment_id = v_booking_id,
                    matched_journal_id = v_journal_id,
                    matched_at = CURRENT_TIMESTAMP,
                    notes = 'Auto-matched dengan Pengeluaran Vendor'
                WHERE statement_id = r_stmt.statement_id;

                v_matched_count := v_matched_count + 1;
            END IF;
        END IF;
    END LOOP;

    RETURN QUERY SELECT v_scanned_count, v_matched_count, (v_scanned_count - v_matched_count);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. ENGINE MITIGASI KURS VALAS (UNREALIZED FX LOSS/GAIN)
-- ============================================================================

-- 2.1 Stored Procedure / Cron Job Akhir Bulan: Revaluasi Kurs Valas
CREATE OR REPLACE FUNCTION sp_revalue_unrealized_fx_monthly(
    p_tenant_id UUID,
    p_period_month VARCHAR(7), -- e.g. '2026-10'
    p_executed_by_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    r_valas RECORD;
    v_sar_latest_rate NUMERIC(18, 4);
    v_usd_latest_rate NUMERIC(18, 4);
    v_total_unrealized_diff NUMERIC(18, 2) := 0;
    v_journal_id UUID;
    v_body_id UUID;
    v_has_mutation BOOLEAN := FALSE;
BEGIN
    -- 1. Ambil kurs penutupan BI terbaru dari tabel exchange_rates
    SELECT rate_to_idr INTO v_sar_latest_rate
    FROM exchange_rates
    WHERE tenant_id = p_tenant_id AND currency_code = 'SAR'
    ORDER BY effective_date DESC LIMIT 1;

    SELECT rate_to_idr INTO v_usd_latest_rate
    FROM exchange_rates
    WHERE tenant_id = p_tenant_id AND currency_code = 'USD'
    ORDER BY effective_date DESC LIMIT 1;

    IF v_sar_latest_rate IS NULL THEN v_sar_latest_rate := 4250.0000; END IF;
    IF v_usd_latest_rate IS NULL THEN v_usd_latest_rate := 16250.0000; END IF;

    -- 2. Buat Master Jurnal Penyesuaian Akhir Bulan (DRAFT_MAKER untuk di-review Manajer Keuangan)
    INSERT INTO journal_masters (
        tenant_id,
        owner_branch_id,
        journal_number,
        transaction_date,
        workflow_stage,
        maker_user_name,
        notes
    ) VALUES (
        p_tenant_id,
        'PST',
        'JRN/ADJ-FX/' || REPLACE(p_period_month, '-', '') || '/' || SUBSTRING(gen_random_uuid()::text, 1, 6),
        CURRENT_DATE,
        'DRAFT_MAKER',
        'CRON_SYSTEM_UNREALIZED_FX',
        'Jurnal Penyesuaian Revaluasi Kurs Valas Akhir Bulan ' || p_period_month || ' (Kurs SAR: ' || v_sar_latest_rate || ', USD: ' || v_usd_latest_rate || ')'
    ) RETURNING journal_id INTO v_journal_id;

    -- Level 2: Body Jurnal
    INSERT INTO journal_bodies (journal_id, body_title, total_debit, total_credit)
    VALUES (v_journal_id, 'Monthly Unrealized Foreign Exchange Revaluation', 0, 0)
    RETURNING body_id INTO v_body_id;

    -- 3. Pindai akun moneter valas di journal_details yang memiliki saldo valas SAR/USD
    FOR r_valas IN 
        SELECT 
            jd.coa_code,
            jd.account_name,
            jd.currency_code,
            SUM(jd.amount_valas) as net_valas,
            SUM(jd.debit - jd.credit) as recorded_idr_balance
        FROM journal_details jd
        JOIN journal_bodies jb ON jd.body_id = jb.body_id
        JOIN journal_masters jm ON jb.journal_id = jm.journal_id
        WHERE jm.tenant_id = p_tenant_id
          AND jd.currency_code IN ('SAR', 'USD')
          AND jm.workflow_stage = 'RELEASED'
        GROUP BY jd.coa_code, jd.account_name, jd.currency_code
        HAVING SUM(jd.amount_valas) <> 0
    LOOP
        DECLARE
            v_current_market_rate NUMERIC(18, 4);
            v_fair_value_idr NUMERIC(18, 2);
            v_diff NUMERIC(18, 2);
        BEGIN
            v_current_market_rate := CASE WHEN r_valas.currency_code = 'SAR' THEN v_sar_latest_rate ELSE v_usd_latest_rate END;
            v_fair_value_idr := r_valas.net_valas * v_current_market_rate;
            v_diff := v_fair_value_idr - r_valas.recorded_idr_balance;

            IF v_diff <> 0 THEN
                v_has_mutation := TRUE;
                v_total_unrealized_diff := v_total_unrealized_diff + ABS(v_diff);

                IF v_diff > 0 THEN
                    -- Aset Valas terapresiasi (Untung Selisih Kurs Belum Terealisasi)
                    INSERT INTO journal_details (body_id, coa_code, account_name, debit, credit, description)
                    VALUES (v_body_id, r_valas.coa_code, r_valas.account_name, v_diff, 0, 'Revaluasi Nilai Wajar Valas ' || r_valas.currency_code);

                    INSERT INTO journal_details (body_id, coa_code, account_name, debit, credit, description)
                    VALUES (v_body_id, '4350', 'Laba Selisih Kurs Belum Terealisasi (Unrealized)', 0, v_diff, 'Pengakuan Laba Revaluasi Akhir Bulan');
                ELSE
                    -- Aset Valas terdepresiasi (Rugi Selisih Kurs Belum Terealisasi)
                    INSERT INTO journal_details (body_id, coa_code, account_name, debit, credit, description)
                    VALUES (v_body_id, '6300', 'Rugi Selisih Kurs Belum Terealisasi (Unrealized)', ABS(v_diff), 0, 'Pengakuan Rugi Revaluasi Akhir Bulan');

                    INSERT INTO journal_details (body_id, coa_code, account_name, debit, credit, description)
                    VALUES (v_body_id, r_valas.coa_code, r_valas.account_name, 0, ABS(v_diff), 'Penyesuaian Penurunan Nilai Akun Valas ' || r_valas.currency_code);
                END IF;
            END IF;
        END;
    END LOOP;

    -- Update total body
    UPDATE journal_bodies
    SET total_debit = v_total_unrealized_diff,
        total_credit = v_total_unrealized_diff
    WHERE body_id = v_body_id;

    RETURN v_journal_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. KEMITRAAN BROKER MULTI-TIER (B2C), COMMISSION SPLITTING & ISOLASI P&L
-- ============================================================================

-- 3.1 Tabel Komisi Agen (Agent Commissions)
CREATE TABLE IF NOT EXISTS agent_commissions (
    commission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    branch_id VARCHAR(50) NOT NULL, -- Cabang tempat agen terdaftar ('PST', 'SUB', 'C01')
    agent_id UUID NOT NULL REFERENCES users(user_id),
    upline_id UUID REFERENCES users(user_id),
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('DIRECT_AGENT', 'UPLINE_OVERRIDE')),
    commission_trigger VARCHAR(30) NOT NULL DEFAULT 'ON_DP'
        CHECK (commission_trigger IN ('ON_DP', 'ON_HALF_PAID', 'ON_FULL_PAID')),
    gross_commission_amount NUMERIC(18, 2) NOT NULL,
    pph_21_rate NUMERIC(5, 2) NOT NULL DEFAULT 5.00, -- PPh 21 Progresif Bukan Pegawai (5%)
    pph_21_amount NUMERIC(18, 2) GENERATED ALWAYS AS ((gross_commission_amount * pph_21_rate) / 100) STORED,
    net_commission_payable NUMERIC(18, 2) GENERATED ALWAYS AS (gross_commission_amount - ((gross_commission_amount * pph_21_rate) / 100)) STORED,
    is_kso_branch_burden BOOLEAN NOT NULL DEFAULT FALSE, -- Jika TRUE, beban komisi potong L/R KSO & kas KSO
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING'
        CHECK (payment_status IN ('PENDING', 'APPROVED', 'DISBURSED', 'CANCELLED')),
    journal_id UUID REFERENCES journal_masters(journal_id),
    disbursed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3.2 Stored Procedure: Splitting Komisi Multi-Tier (Downline + Upline)
CREATE OR REPLACE FUNCTION sp_generate_multi_tier_commission(
    p_booking_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_booking RECORD;
    v_customer RECORD;
    v_agent RECORD;
    v_upline RECORD;
    v_base_commission NUMERIC(18, 2) := 1500000; -- Default komisi dasar per jamaah
    v_upline_override NUMERIC(18, 2) := 300000;  -- Bonus override upline
    v_is_kso BOOLEAN := FALSE;
BEGIN
    SELECT * INTO v_booking FROM bookings WHERE booking_id = p_booking_id;
    SELECT * INTO v_customer FROM customers WHERE customer_id = v_booking.customer_id;

    IF v_customer.agent_id IS NULL THEN
        RETURN; -- Jamaah mendaftar organik tanpa agen broker
    END IF;

    SELECT * INTO v_agent FROM users WHERE user_id = v_customer.agent_id;
    v_is_kso := (v_agent.branch_id = 'C01');

    -- Baris 1: Komisi Agen Langsung (Downline)
    INSERT INTO agent_commissions (
        tenant_id,
        booking_id,
        branch_id,
        agent_id,
        upline_id,
        recipient_type,
        commission_trigger,
        gross_commission_amount,
        pph_21_rate,
        is_kso_branch_burden,
        payment_status
    ) VALUES (
        v_booking.tenant_id,
        p_booking_id,
        v_agent.branch_id,
        v_agent.user_id,
        v_agent.upline_agent_id,
        'DIRECT_AGENT',
        'ON_DP',
        v_base_commission,
        5.00,
        v_is_kso,
        'PENDING'
    );

    -- Baris 2: Komisi Override Upline (jika ada upline_id)
    IF v_agent.upline_agent_id IS NOT NULL THEN
        INSERT INTO agent_commissions (
            tenant_id,
            booking_id,
            branch_id,
            agent_id,
            upline_id,
            recipient_type,
            commission_trigger,
            gross_commission_amount,
            pph_21_rate,
            is_kso_branch_burden,
            payment_status
        ) VALUES (
            v_booking.tenant_id,
            p_booking_id,
            v_agent.branch_id,
            v_agent.upline_agent_id,
            NULL,
            'UPLINE_OVERRIDE',
            'ON_DP',
            v_upline_override,
            5.00,
            v_is_kso,
            'PENDING'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. AGENT WALLETS & DEPOSIT MUTATION (FITUR SISIPAN FASE 5)
-- ============================================================================

-- 4.1 Tabel Dompet Saldo Agen (Agent Wallets)
CREATE TABLE IF NOT EXISTS agent_wallets (
    wallet_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    agent_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    current_balance NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (current_balance >= 0),
    last_topup_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'FROZEN', 'SUSPENDED')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_agent_wallet UNIQUE (agent_user_id)
);

-- 4.2 Tabel Mutasi Saldo Dompet Agen (Wallet Mutations)
CREATE TABLE IF NOT EXISTS wallet_mutations (
    mutation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES agent_wallets(wallet_id) ON DELETE CASCADE,
    mutation_type VARCHAR(30) NOT NULL 
        CHECK (mutation_type IN ('TOPUP_DEPOSIT', 'PAYMENT_BOOKING_DEDUCTION', 'COMMISSION_CASHOUT', 'REFUND_INTO_WALLET')),
    amount NUMERIC(18, 2) NOT NULL,
    balance_before NUMERIC(18, 2) NOT NULL,
    balance_after NUMERIC(18, 2) NOT NULL,
    reference_no VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4.3 Stored Procedure: Pembayaran Booking via Saldo Deposit Agen
CREATE OR REPLACE FUNCTION sp_pay_booking_via_agent_wallet(
    p_booking_id UUID,
    p_agent_user_id UUID,
    p_amount NUMERIC(18, 2)
)
RETURNS BOOLEAN AS $$
DECLARE
    v_wallet RECORD;
    v_booking RECORD;
    v_balance_before NUMERIC(18, 2);
    v_balance_after NUMERIC(18, 2);
BEGIN
    SELECT * INTO v_wallet FROM agent_wallets WHERE agent_user_id = p_agent_user_id FOR UPDATE;
    IF v_wallet IS NULL THEN
        RAISE EXCEPTION 'Dompet agen tidak ditemukan!';
    END IF;

    IF v_wallet.current_balance < p_amount THEN
        RAISE EXCEPTION 'Saldo dompet agen tidak mencukupi! Saldo saat ini: Rp %, dibutuhkan: Rp %',
            TO_CHAR(v_wallet.current_balance, 'FM999,999,999'), TO_CHAR(p_amount, 'FM999,999,999');
    END IF;

    v_balance_before := v_wallet.current_balance;
    v_balance_after := v_balance_before - p_amount;

    -- 1. Potong saldo dompet
    UPDATE agent_wallets
    SET current_balance = v_balance_after,
        updated_at = CURRENT_TIMESTAMP
    WHERE wallet_id = v_wallet.wallet_id;

    -- 2. Catat riwayat mutasi dompet
    INSERT INTO wallet_mutations (
        wallet_id,
        mutation_type,
        amount,
        balance_before,
        balance_after,
        reference_no,
        notes
    ) VALUES (
        v_wallet.wallet_id,
        'PAYMENT_BOOKING_DEDUCTION',
        p_amount,
        v_balance_before,
        v_balance_after,
        'BKG-PAY-' || p_booking_id,
        'Pemotongan Saldo Deposit Agen untuk Pelunasan Booking Jamaah'
    );

    -- 3. Update status pembayaran booking
    UPDATE bookings
    SET total_paid = total_paid + p_amount,
        outstanding_balance = GREATEST(net_payable - (total_paid + p_amount), 0),
        status = CASE WHEN (net_payable - (total_paid + p_amount)) <= 0 THEN 'FULLY_PAID' ELSE 'DP_PAID' END
    WHERE booking_id = p_booking_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. KEMITRAAN KSO (B2B WHOLESALE) & PERHITUNGAN MARGIN
-- ============================================================================

-- 5.1 Tabel Margin & Settlement Kemitraan KSO
CREATE TABLE IF NOT EXISTS kso_wholesale_margins (
    settlement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    branch_id VARCHAR(50) NOT NULL DEFAULT 'C01', -- Cabang KSO
    package_id UUID NOT NULL REFERENCES packages(package_id),
    booking_id UUID NOT NULL REFERENCES bookings(booking_id),
    customer_name VARCHAR(150) NOT NULL,
    public_selling_price NUMERIC(18, 2) NOT NULL, -- Jamaah bayar ke KSO (misal Rp 29.500.000)
    hq_nett_price NUMERIC(18, 2) NOT NULL,        -- HQ tagih Harga Nett ke KSO (misal Rp 26.500.000)
    kso_gross_margin NUMERIC(18, 2) GENERATED ALWAYS AS (public_selling_price - hq_nett_price) STORED, -- Margin Laba KSO Rp 3.000.000
    pph_23_rate NUMERIC(5, 2) NOT NULL DEFAULT 2.00, -- PPh 23 / Final Jasa Bagi Hasil (2%)
    pph_23_amount NUMERIC(18, 2) GENERATED ALWAYS AS (((public_selling_price - hq_nett_price) * pph_23_rate) / 100) STORED,
    kso_net_margin NUMERIC(18, 2) GENERATED ALWAYS AS ((public_selling_price - hq_nett_price) - (((public_selling_price - hq_nett_price) * pph_23_rate) / 100)) STORED,
    settlement_status VARCHAR(30) NOT NULL DEFAULT 'PENDING'
        CHECK (settlement_status IN ('PENDING', 'INVOICED_BY_HQ', 'SETTLED')),
    hq_invoice_journal_id UUID REFERENCES journal_masters(journal_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. QUERY SQL: DETEKSI & SIMULASI MITIGASI UNREALIZED FX LOSS/GAIN
-- ============================================================================
/*
SELECT 
    jd.coa_code,
    jd.account_name,
    jd.currency_code,
    SUM(jd.amount_valas) AS total_valas_outstanding,
    SUM(jd.debit - jd.credit) AS recorded_book_value_idr,
    CASE 
        WHEN jd.currency_code = 'SAR' THEN 4250.0000 
        ELSE 16250.0000 
    END AS bi_closing_exchange_rate,
    SUM(jd.amount_valas) * (CASE WHEN jd.currency_code = 'SAR' THEN 4250.0000 ELSE 16250.0000 END) AS fair_market_value_idr,
    (SUM(jd.amount_valas) * (CASE WHEN jd.currency_code = 'SAR' THEN 4250.0000 ELSE 16250.0000 END)) - SUM(jd.debit - jd.credit) AS potential_unrealized_fx_gain_loss
FROM journal_details jd
JOIN journal_bodies jb ON jd.body_id = jb.body_id
JOIN journal_masters jm ON jb.journal_id = jm.journal_id
WHERE jd.currency_code IN ('SAR', 'USD')
  AND jm.workflow_stage = 'RELEASED'
GROUP BY jd.coa_code, jd.account_name, jd.currency_code
HAVING SUM(jd.amount_valas) <> 0;
*/
