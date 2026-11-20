-- ============================================================================
-- ERP SAAS MULTI-TENANT BIRO PERJALANAN UMRAH & HAJI
-- FASE 6: STANDARD FINANCIAL REPORTS, FULL CONSOLIDATION (ELIMINASI RAK & B2B),
--         EXECUTIVE DASHBOARD, COMMAND CENTER, & WEBHOOK PAYMENT GATEWAY
-- Dialect: PostgreSQL 14+
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. STANDARD FINANCIAL REPORTS (RELEASED JOURNALS ONLY)
-- ============================================================================

-- 1.1 View General Ledger (Buku Besar) Mutasi per COA
CREATE OR REPLACE VIEW v_financial_general_ledger AS
SELECT 
    jm.tenant_id,
    jm.owner_branch_id,
    jm.journal_id,
    jm.journal_number,
    jm.transaction_date,
    jd.coa_code,
    jd.account_name,
    jd.currency_code,
    jd.amount_valas,
    jd.debit AS debit_idr,
    jd.credit AS credit_idr,
    (jd.debit - jd.credit) AS net_movement_idr,
    jd.description,
    jm.workflow_stage
FROM journal_masters jm
JOIN journal_bodies jb ON jm.journal_id = jb.journal_id
JOIN journal_details jd ON jb.body_id = jd.body_id
WHERE jm.workflow_stage = 'RELEASED';

-- 1.2 View Profit & Loss (Laba Rugi Stand-Alone per Cabang)
CREATE OR REPLACE VIEW v_financial_profit_loss AS
SELECT 
    jm.tenant_id,
    jm.owner_branch_id,
    TO_CHAR(jm.transaction_date, 'YYYY-MM') AS period_month,
    -- Pendapatan (Akun 4xxx)
    SUM(CASE WHEN jd.coa_code LIKE '4%' THEN (jd.credit - jd.debit) ELSE 0 END) AS total_revenue,
    -- HPP (Akun 5xxx)
    SUM(CASE WHEN jd.coa_code LIKE '5%' THEN (jd.debit - jd.credit) ELSE 0 END) AS total_cogs,
    -- Laba Kotor
    SUM(CASE WHEN jd.coa_code LIKE '4%' THEN (jd.credit - jd.debit) ELSE 0 END) - 
    SUM(CASE WHEN jd.coa_code LIKE '5%' THEN (jd.debit - jd.credit) ELSE 0 END) AS gross_profit,
    -- Beban Operasional / OPEX (Akun 6xxx)
    SUM(CASE WHEN jd.coa_code LIKE '6%' THEN (jd.debit - jd.credit) ELSE 0 END) AS total_opex,
    -- Laba Bersih Operasional
    (SUM(CASE WHEN jd.coa_code LIKE '4%' THEN (jd.credit - jd.debit) ELSE 0 END) - 
     SUM(CASE WHEN jd.coa_code LIKE '5%' THEN (jd.debit - jd.credit) ELSE 0 END)) -
    SUM(CASE WHEN jd.coa_code LIKE '6%' THEN (jd.debit - jd.credit) ELSE 0 END) AS net_operating_profit
FROM journal_masters jm
JOIN journal_bodies jb ON jm.journal_id = jb.journal_id
JOIN journal_details jd ON jb.body_id = jd.body_id
WHERE jm.workflow_stage = 'RELEASED'
GROUP BY jm.tenant_id, jm.owner_branch_id, TO_CHAR(jm.transaction_date, 'YYYY-MM');

-- 1.3 View Balance Sheet (Neraca Stand-Alone per Cabang)
CREATE OR REPLACE VIEW v_financial_balance_sheet AS
SELECT 
    jm.tenant_id,
    jm.owner_branch_id,
    -- Aset Lancar (10xx s/d 13xx)
    SUM(CASE WHEN jd.coa_code >= '1000' AND jd.coa_code < '1400' THEN (jd.debit - jd.credit) ELSE 0 END) AS current_assets,
    -- Aset Tetap Bersih (14xx s/d 19xx)
    SUM(CASE WHEN jd.coa_code >= '1400' AND jd.coa_code < '2000' THEN (jd.debit - jd.credit) ELSE 0 END) AS fixed_assets,
    -- Total Aset
    SUM(CASE WHEN jd.coa_code >= '1000' AND jd.coa_code < '2000' THEN (jd.debit - jd.credit) ELSE 0 END) AS total_assets,
    -- Kewajiban / Liabilitas Jangka Pendek (20xx s/d 29xx)
    SUM(CASE WHEN jd.coa_code >= '2000' AND jd.coa_code < '3000' THEN (jd.credit - jd.debit) ELSE 0 END) AS total_liabilities,
    -- Ekuitas (30xx s/d 39xx)
    SUM(CASE WHEN jd.coa_code >= '3000' AND jd.coa_code < '4000' THEN (jd.credit - jd.debit) ELSE 0 END) AS total_equity
FROM journal_masters jm
JOIN journal_bodies jb ON jm.journal_id = jb.journal_id
JOIN journal_details jd ON jb.body_id = jd.body_id
WHERE jm.workflow_stage = 'RELEASED'
GROUP BY jm.tenant_id, jm.owner_branch_id;

-- ============================================================================
-- 2. LOGIKA KONSOLIDASI 'ALL' & ELIMINASI INTERCOMPANY
-- ============================================================================

-- Function: Menghasilkan Laporan Konsolidasi Grup dengan Jurnal Eliminasi Otomatis
CREATE OR REPLACE FUNCTION sp_get_consolidated_financial_report(
    p_tenant_id UUID,
    p_period_month VARCHAR(7) -- '2026-10'
)
RETURNS TABLE (
    report_section VARCHAR(50),
    coa_code VARCHAR(20),
    account_name VARCHAR(150),
    hq_balance NUMERIC(18, 2),
    mandiri_branches_balance NUMERIC(18, 2),
    kso_branches_balance NUMERIC(18, 2),
    elimination_debit NUMERIC(18, 2),
    elimination_credit NUMERIC(18, 2),
    consolidated_balance NUMERIC(18, 2)
) AS $$
BEGIN
    RETURN QUERY
    WITH raw_balances AS (
        SELECT 
            jd.coa_code,
            jd.account_name,
            -- Saldo Pusat (HQ)
            SUM(CASE WHEN jm.owner_branch_id = 'PST' THEN (jd.debit - jd.credit) ELSE 0 END) AS b_hq,
            -- Saldo Cabang Mandiri (SUB, MLG)
            SUM(CASE WHEN jm.owner_branch_id IN ('SUB', 'MLG') THEN (jd.debit - jd.credit) ELSE 0 END) AS b_mandiri,
            -- Saldo Cabang KSO (C01)
            SUM(CASE WHEN jm.owner_branch_id = 'C01' THEN (jd.debit - jd.credit) ELSE 0 END) AS b_kso
        FROM journal_masters jm
        JOIN journal_bodies jb ON jm.journal_id = jb.journal_id
        JOIN journal_details jd ON jb.body_id = jd.body_id
        WHERE jm.tenant_id = p_tenant_id
          AND jm.workflow_stage = 'RELEASED'
          AND TO_CHAR(jm.transaction_date, 'YYYY-MM') = p_period_month
        GROUP BY jd.coa_code, jd.account_name
    )
    SELECT 
        CASE 
            WHEN rb.coa_code LIKE '1%' THEN 'ASSETS'
            WHEN rb.coa_code LIKE '2%' THEN 'LIABILITIES'
            WHEN rb.coa_code LIKE '3%' THEN 'EQUITY'
            WHEN rb.coa_code LIKE '4%' THEN 'REVENUE'
            ELSE 'EXPENSES'
        END::VARCHAR(50) AS report_section,
        rb.coa_code::VARCHAR(20),
        rb.account_name::VARCHAR(150),
        rb.b_hq,
        rb.b_mandiri,
        rb.b_kso,
        -- Jurnal Eliminasi Otomatis:
        -- 1. Eliminasi Akun RAK [1200] & [2200] antara HQ dan Mandiri
        -- 2. Eliminasi B2B Intercompany Piutang KSO [1140] vs Utang KSO [2140]
        CASE 
            WHEN rb.coa_code = '2200' THEN ABS(rb.b_mandiri) -- Eliminasi RAK Pasiva
            WHEN rb.coa_code = '2140' THEN ABS(rb.b_kso)     -- Eliminasi Utang KSO ke Pusat
            ELSE 0 
        END AS elimination_debit,
        CASE 
            WHEN rb.coa_code = '1200' THEN ABS(rb.b_hq)      -- Eliminasi RAK Aktiva
            WHEN rb.coa_code = '1140' THEN ABS(rb.b_hq)      -- Eliminasi Piutang Pusat ke KSO
            ELSE 0 
        END AS elimination_credit,
        -- Saldo Akhir Terkonsolidasi Bebas Double Counting
        CASE 
            WHEN rb.coa_code IN ('1200', '2200', '1140', '2140') THEN 0
            ELSE (rb.b_hq + rb.b_mandiri + rb.b_kso)
        END AS consolidated_balance
    FROM raw_balances rb
    ORDER BY rb.coa_code ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. EXECUTIVE DASHBOARD & COMMAND CENTER LIVE TRACKING
-- ============================================================================

-- 3.1 View Profitabilitas per Rombongan / Kloter (Revenue vs HPP Riil)
CREATE OR REPLACE VIEW v_kloter_profitability AS
SELECT 
    m.manifest_id,
    m.manifest_code,
    m.group_name,
    p.package_name,
    m.status AS manifest_status,
    COUNT(b.booking_id) AS total_passengers,
    COALESCE(SUM(b.net_payable), 0) AS total_revenue_idr,
    COALESCE(SUM(pr.total_rab_cost_per_pax), 0) * COUNT(b.booking_id) AS total_realized_cogs_idr,
    COALESCE(SUM(b.net_payable), 0) - (COALESCE(SUM(pr.total_rab_cost_per_pax), 0) * COUNT(b.booking_id)) AS gross_profit_idr,
    CASE 
        WHEN COALESCE(SUM(b.net_payable), 0) > 0 THEN 
            ROUND(((COALESCE(SUM(b.net_payable), 0) - (COALESCE(SUM(pr.total_rab_cost_per_pax), 0) * COUNT(b.booking_id))) / COALESCE(SUM(b.net_payable), 1)) * 100, 2)
        ELSE 0
    END AS profit_margin_percent
FROM manifests m
JOIN packages p ON m.package_id = p.package_id
LEFT JOIN package_rabs pr ON p.package_id = pr.package_id
LEFT JOIN bookings b ON p.package_id = b.package_id AND b.status IN ('DP_PAID', 'FULLY_PAID')
GROUP BY m.manifest_id, m.manifest_code, m.group_name, p.package_name, m.status;

-- 3.2 View Seat Load Factor (Utilitas Block Seat Pesawat)
CREATE OR REPLACE VIEW v_seat_load_factor AS
SELECT 
    fa.allocation_id,
    fa.airline_name,
    fa.pnr_code,
    fa.route_path,
    p.package_name,
    p.departure_date,
    fa.total_seats,
    fa.held_seats AS booked_seats,
    fa.available_seats,
    ROUND((fa.held_seats::NUMERIC / fa.total_seats::NUMERIC) * 100, 2) AS seat_utilization_percent
FROM flight_allocations fa
JOIN packages p ON fa.package_id = p.package_id;

-- 3.3 View Command Center Live Tracking (Monitoring Seluruh Kloter Lapangan)
CREATE OR REPLACE VIEW v_command_center_live_tracking AS
SELECT 
    m.manifest_id,
    m.manifest_code,
    m.group_name,
    m.status AS manifest_status,
    m.bus_number_saudi,
    u_muthawif.full_name AS muthawif_name,
    u_tl.full_name AS tour_leader_name,
    u_mukibin.full_name AS mukibin_name,
    i.day_number,
    i.activity_name AS current_scheduled_activity,
    i.planned_time,
    ir.status AS realization_status,
    ir.actual_time,
    ir.delay_reason,
    ir.photo_evidence_url
FROM manifests m
LEFT JOIN users u_muthawif ON m.muthawif_user_id = u_muthawif.user_id
LEFT JOIN users u_tl ON m.tl_user_id = u_tl.user_id
LEFT JOIN users u_mukibin ON m.mukibin_user_id = u_mukibin.user_id
LEFT JOIN itineraries i ON m.manifest_id = i.manifest_id
LEFT JOIN itinerary_realizations ir ON i.itinerary_id = ir.itinerary_id
ORDER BY m.manifest_code ASC, i.day_number DESC;

-- ============================================================================
-- 4. WEBHOOK PAYMENT GATEWAY (MIDTRANS / XENDIT CALLBACK INTEGRATION)
-- ============================================================================

-- 4.1 Tabel Riwayat Webhook Logs
CREATE TABLE IF NOT EXISTS payment_gateway_webhooks (
    webhook_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    gateway_provider VARCHAR(50) NOT NULL DEFAULT 'MIDTRANS' CHECK (gateway_provider IN ('MIDTRANS', 'XENDIT', 'DOKU')),
    event_type VARCHAR(50) NOT NULL, -- 'payment.success', 'settlement', 'expire'
    order_id VARCHAR(100) NOT NULL,  -- booking_number
    transaction_id VARCHAR(100) NOT NULL,
    payment_channel VARCHAR(50) NOT NULL, -- 'BSI_VA', 'MANDIRI_VA', 'QRIS', 'CREDIT_CARD'
    gross_amount NUMERIC(18, 2) NOT NULL,
    transaction_status VARCHAR(50) NOT NULL, -- 'settlement', 'capture', 'pending', 'deny'
    raw_payload JSONB NOT NULL,
    signature_key VARCHAR(255),
    is_processed BOOLEAN NOT NULL DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    journal_id UUID REFERENCES journal_masters(journal_id),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4.2 Stored Procedure: Handler Webhook Payment Gateway
CREATE OR REPLACE FUNCTION sp_handle_payment_gateway_webhook(
    p_tenant_id UUID,
    p_order_id VARCHAR(100),       -- booking_number
    p_amount NUMERIC(18, 2),
    p_payment_channel VARCHAR(50),
    p_gateway_tx_id VARCHAR(100),
    p_raw_payload JSONB
)
RETURNS UUID AS $$
DECLARE
    v_booking RECORD;
    v_journal_id UUID;
    v_body_id UUID;
    v_webhook_id UUID;
    v_branch_id VARCHAR(50);
BEGIN
    -- 1. Cari data booking
    SELECT * INTO v_booking FROM bookings 
    WHERE tenant_id = p_tenant_id AND booking_number = p_order_id;

    IF v_booking IS NULL THEN
        RAISE EXCEPTION 'Booking dengan nomor % tidak ditemukan!', p_order_id;
    END IF;

    v_branch_id := v_booking.branch_id;

    -- 2. Generate 3-Level Journal (Maker DRAFT) untuk Penerimaan Kas Masuk
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
        v_branch_id,
        'JRN/PG/' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '/' || SUBSTRING(gen_random_uuid()::text, 1, 6),
        CURRENT_DATE,
        'DRAFT_MAKER',
        'SYSTEM_GATEWAY_WEBHOOK',
        'Penerimaan Otomatis Payment Gateway ' || p_payment_channel || ' untuk ' || p_order_id
    ) RETURNING journal_id INTO v_journal_id;

    -- Level 2: Body Jurnal
    INSERT INTO journal_bodies (journal_id, body_title, total_debit, total_credit)
    VALUES (v_journal_id, 'Payment Gateway Settlement ' || p_order_id, p_amount, p_amount)
    RETURNING body_id INTO v_body_id;

    -- Level 3: Details Double-Entry
    -- Debit: [1010] Kas/Bank Payment Gateway Clearing
    INSERT INTO journal_details (body_id, coa_code, account_name, debit, credit, description)
    VALUES (v_body_id, '1010', 'Kas & Bank Payment Gateway Gateway Clearing', p_amount, 0, 'Penerimaan ' || p_payment_channel);

    -- Kredit: [2160] Titipan Dana Paket Jamaah
    INSERT INTO journal_details (body_id, coa_code, account_name, debit, credit, description)
    VALUES (v_body_id, '2160', 'Titipan Dana Paket Jamaah', 0, p_amount, 'Pelunasan / DP Invoice ' || p_order_id);

    -- 3. Update saldo bayar booking
    UPDATE bookings
    SET total_paid = total_paid + p_amount,
        outstanding_balance = GREATEST(net_payable - (total_paid + p_amount), 0),
        status = CASE WHEN (net_payable - (total_paid + p_amount)) <= 0 THEN 'FULLY_PAID' ELSE 'DP_PAID' END
    WHERE booking_id = v_booking.booking_id;

    -- 4. Catat riwayat log webhook
    INSERT INTO payment_gateway_webhooks (
        tenant_id,
        gateway_provider,
        event_type,
        order_id,
        transaction_id,
        payment_channel,
        gross_amount,
        transaction_status,
        raw_payload,
        is_processed,
        processed_at,
        journal_id
    ) VALUES (
        p_tenant_id,
        'MIDTRANS',
        'payment.success',
        p_order_id,
        p_gateway_tx_id,
        p_payment_channel,
        p_amount,
        'settlement',
        p_raw_payload,
        TRUE,
        CURRENT_TIMESTAMP,
        v_journal_id
    ) RETURNING webhook_id INTO v_webhook_id;

    RETURN v_webhook_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. EKSPANSI AUDIT LOG UNTUK SELURUH TABEL OPERASIONAL
-- ============================================================================

-- Audit log trigger generik diaplikasikan ke tabel procurement, fixed assets, dan manifests
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_audit_trail_generic') THEN
        DROP TRIGGER IF EXISTS trg_audit_purchase_orders ON purchase_orders;
        CREATE TRIGGER trg_audit_purchase_orders
            AFTER INSERT OR UPDATE OR DELETE ON purchase_orders
            FOR EACH ROW EXECUTE FUNCTION fn_audit_trail_generic();

        DROP TRIGGER IF EXISTS trg_audit_fixed_assets ON fixed_assets;
        CREATE TRIGGER trg_audit_fixed_assets
            AFTER INSERT OR UPDATE OR DELETE ON fixed_assets
            FOR EACH ROW EXECUTE FUNCTION fn_audit_trail_generic();

        DROP TRIGGER IF EXISTS trg_audit_manifests ON manifests;
        CREATE TRIGGER trg_audit_manifests
            AFTER INSERT OR UPDATE OR DELETE ON manifests
            FOR EACH ROW EXECUTE FUNCTION fn_audit_trail_generic();
    END IF;
END $$;
