-- ============================================================================
-- ERP SAAS MULTI-TENANT BIRO PERJALANAN UMRAH & HAJI
-- FASE 2: CORE ACCOUNTING, PAYROLL, TAX (WHT), 3-STAGE WORKFLOW & MASTER FORM
-- Dialect: PostgreSQL 14+
-- ============================================================================

-- 0. EKSTENSI DATABASE
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TATA KELOLA MASTER DATA & SINGLE CHART OF ACCOUNTS (COA)
-- ============================================================================

-- 1.1 Tabel Single Chart of Accounts (COA Tunggal Bebas Duplikasi)
-- Hanya Admin Pusat (HQ) yang dapat melakukan INSERT, UPDATE, DELETE
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    coa_code VARCHAR(50) NOT NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    coa_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN (
        'ASSET',            -- Kas, Bank, Piutang, Perlengkapan
        'LIABILITY',        -- Utang Usaha, Utang Pajak, DP Jamaah
        'EQUITY',           -- Modal Disetor, Laba Ditahan
        'REVENUE',          -- Pendapatan Paket Umrah/Haji, Jasa Handling
        'EXPENSE_DIRECT',   -- HPP / Beban Pokok Penjualan (Tiket, Hotel, Visa)
        'EXPENSE_OPEX'      -- Beban Operasional Kantor & Gaji
    )),
    normal_balance CHAR(1) NOT NULL CHECK (normal_balance IN ('D', 'C')),
    parent_coa_code VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_tax_account BOOLEAN NOT NULL DEFAULT FALSE,
    tax_type VARCHAR(50), -- 'PPN_MASUKAN', 'PPN_KELUARAN', 'PPH_21', 'PPH_23', 'PPH_FINAL_4_2'
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_chart_of_accounts PRIMARY KEY (tenant_id, coa_code)
);

CREATE TRIGGER trg_coa_updated_at
    BEFORE UPDATE ON chart_of_accounts
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 1.2 Tabel Pengajuan Master Data dari Cabang ke Pusat (Master Data Requests)
CREATE TABLE IF NOT EXISTS master_data_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    branch_id_pengaju VARCHAR(50) NOT NULL,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('ADD_COA', 'ADD_MASTER')),
    request_payload JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    submitted_by_user_id UUID NOT NULL REFERENCES users(user_id),
    approved_by_user_id UUID REFERENCES users(user_id),
    notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_master_data_requests_updated_at
    BEFORE UPDATE ON master_data_requests
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_master_data_req_status 
    ON master_data_requests (tenant_id, branch_id_pengaju, status);

-- 1.3 Stored Procedure: Persetujuan Proposal & Ekstraksi JSONB ke Master Tujuan
CREATE OR REPLACE PROCEDURE sp_approve_master_request(
    p_request_id UUID,
    p_approver_user_id UUID,
    p_notes TEXT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_req RECORD;
    v_head_code VARCHAR(50);
    v_child_code VARCHAR(50);
    v_desc VARCHAR(255);
    v_cd1 VARCHAR(100);
    v_cd2 VARCHAR(100);
    v_cd3 VARCHAR(100);
    v_cd4 VARCHAR(100);
    v_coa_code VARCHAR(50);
    v_coa_name VARCHAR(255);
    v_acc_type VARCHAR(50);
    v_norm_bal CHAR(1);
BEGIN
    SELECT * INTO v_req FROM master_data_requests WHERE request_id = p_request_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request dengan ID % tidak ditemukan.', p_request_id;
    END IF;

    IF v_req.status <> 'PENDING' THEN
        RAISE EXCEPTION 'Hanya pengajuan berstatus PENDING yang dapat disetujui.';
    END IF;

    IF v_req.request_type = 'ADD_MASTER' THEN
        v_head_code  := v_req.request_payload->>'head_code';
        v_child_code := v_req.request_payload->>'child_code';
        v_desc       := v_req.request_payload->>'description';
        v_cd1        := v_req.request_payload->>'cd1';
        v_cd2        := v_req.request_payload->>'cd2';
        v_cd3        := v_req.request_payload->>'cd3';
        v_cd4        := v_req.request_payload->>'cd4';

        INSERT INTO general_masters (tenant_id, head_code, child_code, description, cd1, cd2, cd3, cd4)
        VALUES (v_req.tenant_id, v_head_code, v_child_code, v_desc, v_cd1, v_cd2, v_cd3, v_cd4)
        ON CONFLICT (tenant_id, head_code, child_code)
        DO UPDATE SET description = EXCLUDED.description, cd1 = EXCLUDED.cd1, cd2 = EXCLUDED.cd2, updated_at = CURRENT_TIMESTAMP;

    ELSIF v_req.request_type = 'ADD_COA' THEN
        v_coa_code := v_req.request_payload->>'coa_code';
        v_coa_name := v_req.request_payload->>'coa_name';
        v_acc_type := v_req.request_payload->>'account_type';
        v_norm_bal := v_req.request_payload->>'normal_balance';

        INSERT INTO chart_of_accounts (tenant_id, coa_code, coa_name, account_type, normal_balance)
        VALUES (v_req.tenant_id, v_coa_code, v_coa_name, v_acc_type, v_norm_bal)
        ON CONFLICT (tenant_id, coa_code)
        DO UPDATE SET coa_name = EXCLUDED.coa_name, updated_at = CURRENT_TIMESTAMP;
    END IF;

    UPDATE master_data_requests
    SET status = 'APPROVED',
        approved_by_user_id = p_approver_user_id,
        notes = p_notes,
        reviewed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE request_id = p_request_id;
END;
$$;

-- ============================================================================
-- 2. 3-LEVEL JOURNAL STRUCTURE & 3-STAGE WORKFLOW (DEFINITIF FASE 2)
-- ============================================================================

-- 2.1 Level 1: Header Jurnal Dokumen
CREATE TABLE IF NOT EXISTS journal_masters (
    journal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    branch_id VARCHAR(50) NOT NULL,
    doc_date DATE NOT NULL,
    doc_no VARCHAR(100) NOT NULL,
    doc_type VARCHAR(50) NOT NULL CHECK (doc_type IN (
        'MANUAL_JOURNAL', 'PAYROLL_AUTO', 'PO_EXPENSE', 'PETTY_CASH',
        'INTERBRANCH_RAK', 'KSO_SETTLEMENT', 'ISSUED_MATERIAL', 'CUSTOMER_DP'
    )),
    notes TEXT,
    workflow_status VARCHAR(50) NOT NULL DEFAULT 'DRAFT_MAKER' 
        CHECK (workflow_status IN ('DRAFT_MAKER', 'APPROVED', 'RELEASED', 'REJECTED')),
    maker_id UUID NOT NULL REFERENCES users(user_id),
    approver_id UUID REFERENCES users(user_id),
    releaser_id UUID REFERENCES users(user_id),
    made_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    source_document_ref VARCHAR(100),
    auto_inherited BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_journal_doc_no UNIQUE (tenant_id, doc_no)
);

CREATE TRIGGER trg_journal_masters_fase2_updated_at
    BEFORE UPDATE ON journal_masters
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_journal_masters_status 
    ON journal_masters (tenant_id, branch_id, workflow_status, doc_date DESC);

-- 2.2 Level 2: Rekap per COA (Base Amount selalu IDR)
CREATE TABLE IF NOT EXISTS journal_bodies (
    body_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id UUID NOT NULL REFERENCES journal_masters(journal_id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    coa_code VARCHAR(50) NOT NULL,
    debit_base_amount NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (debit_base_amount >= 0),
    credit_base_amount NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (credit_base_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_journal_body_coa FOREIGN KEY (tenant_id, coa_code)
        REFERENCES chart_of_accounts(tenant_id, coa_code) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_journal_bodies_coa 
    ON journal_bodies (tenant_id, coa_code);

-- 2.3 Level 3: Sub-Ledger / Analytics Tagging (Valas, Vendor, Jamaah, Material)
CREATE TABLE IF NOT EXISTS journal_details (
    detail_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    body_id UUID NOT NULL REFERENCES journal_bodies(body_id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    currency_code VARCHAR(10) NOT NULL DEFAULT 'IDR',
    foreign_rate NUMERIC(18, 4) NOT NULL DEFAULT 1.0,
    foreign_amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
    vendor_id UUID REFERENCES vendors(vendor_id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(customer_id) ON DELETE SET NULL,
    material_code VARCHAR(50),
    project_group_id VARCHAR(50),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_journal_details_tagging 
    ON journal_details (vendor_id, customer_id, material_code);

-- 2.4 Trigger Double-Entry Balance Check Sebelum APPROVED / RELEASED
CREATE OR REPLACE FUNCTION fn_verify_journal_fase2_balance()
RETURNS TRIGGER AS $$
DECLARE
    v_total_debit NUMERIC(18, 2);
    v_total_credit NUMERIC(18, 2);
BEGIN
    IF NEW.workflow_status IN ('APPROVED', 'RELEASED') THEN
        SELECT 
            COALESCE(SUM(debit_base_amount), 0),
            COALESCE(SUM(credit_base_amount), 0)
        INTO v_total_debit, v_total_credit
        FROM journal_bodies
        WHERE journal_id = NEW.journal_id;

        IF v_total_debit <> v_total_credit THEN
            RAISE EXCEPTION 'Validasi Gagal: Jurnal % tidak balance! Total Debit = Rp %, Total Credit = Rp %',
                NEW.doc_no, v_total_debit, v_total_credit;
        END IF;

        IF v_total_debit = 0 THEN
            RAISE EXCEPTION 'Validasi Gagal: Nilai transaksi pada jurnal % tidak boleh nol.', NEW.doc_no;
        END IF;
    END IF;

    IF NEW.workflow_status = 'APPROVED' AND OLD.workflow_status = 'DRAFT_MAKER' THEN
        NEW.approved_at = CURRENT_TIMESTAMP;
    ELSIF NEW.workflow_status = 'RELEASED' AND OLD.workflow_status IN ('DRAFT_MAKER', 'APPROVED') THEN
        NEW.released_at = CURRENT_TIMESTAMP;
    ELSIF NEW.workflow_status = 'REJECTED' THEN
        NEW.rejected_at = CURRENT_TIMESTAMP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_verify_journal_fase2_balance
    BEFORE UPDATE OF workflow_status ON journal_masters
    FOR EACH ROW EXECUTE FUNCTION fn_verify_journal_fase2_balance();

-- ============================================================================
-- 3. MODUL KAS KECIL (PETTY CASH) & EXPENSES
-- ============================================================================

CREATE TABLE IF NOT EXISTS office_expenses (
    expense_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    branch_id VARCHAR(50) NOT NULL,
    expense_date DATE NOT NULL,
    expense_no VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'ATK', 'KONSUMSI_MANASIK', 'BIAYA_KURIR_PASPOR', 'OPERASIONAL_BANDARA', 'UTILITAS_LISTRIK_AIR'
    )),
    description TEXT NOT NULL,
    amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
    paid_from_coa_code VARCHAR(50) NOT NULL, -- Misal Kas Kecil Cabang Kediri (1101-C01)
    expense_coa_code VARCHAR(50) NOT NULL,   -- Misal Beban Operasional Cabang
    receipt_doc_url TEXT,
    created_by_user_id UUID NOT NULL REFERENCES users(user_id),
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT_MAKER' 
        CHECK (status IN ('DRAFT_MAKER', 'APPROVED', 'RELEASED', 'REJECTED')),
    journal_id UUID REFERENCES journal_masters(journal_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_expense_no UNIQUE (tenant_id, expense_no)
);

CREATE TRIGGER trg_office_expenses_updated_at
    BEFORE UPDATE ON office_expenses
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================================
-- 4. MODUL PAYROLL & AUTO-JURNAL PPh 21 / BPJS
-- ============================================================================

CREATE TABLE IF NOT EXISTS payrolls (
    payroll_run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    branch_id VARCHAR(50) NOT NULL,
    payroll_period_month INT NOT NULL CHECK (payroll_period_month BETWEEN 1 AND 12),
    payroll_period_year INT NOT NULL CHECK (payroll_period_year >= 2024),
    payroll_no VARCHAR(100) NOT NULL,
    total_gaji_pokok NUMERIC(18, 2) NOT NULL DEFAULT 0,
    total_tunjangan NUMERIC(18, 2) NOT NULL DEFAULT 0,
    total_bpjs_kesehatan NUMERIC(18, 2) NOT NULL DEFAULT 0,
    total_bpjs_ketenagakerjaan NUMERIC(18, 2) NOT NULL DEFAULT 0,
    total_pph21 NUMERIC(18, 2) NOT NULL DEFAULT 0,
    total_kasbon_deduction NUMERIC(18, 2) NOT NULL DEFAULT 0,
    total_gaji_netto NUMERIC(18, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT_MAKER' 
        CHECK (status IN ('DRAFT_MAKER', 'APPROVED', 'RELEASED')),
    prepared_by_user_id UUID NOT NULL REFERENCES users(user_id),
    released_by_user_id UUID REFERENCES users(user_id),
    journal_id UUID REFERENCES journal_masters(journal_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_branch_payroll_period UNIQUE (tenant_id, branch_id, payroll_period_year, payroll_period_month)
);

CREATE TRIGGER trg_payrolls_updated_at
    BEFORE UPDATE ON payrolls
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TABLE IF NOT EXISTS payroll_details (
    detail_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id UUID NOT NULL REFERENCES payrolls(payroll_run_id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    gaji_pokok NUMERIC(18, 2) NOT NULL DEFAULT 0,
    tunjangan NUMERIC(18, 2) NOT NULL DEFAULT 0,
    bpjs_kesehatan NUMERIC(18, 2) NOT NULL DEFAULT 0,
    bpjs_ketenagakerjaan NUMERIC(18, 2) NOT NULL DEFAULT 0,
    pph21 NUMERIC(18, 2) NOT NULL DEFAULT 0,
    kasbon_deduction NUMERIC(18, 2) NOT NULL DEFAULT 0,
    gaji_netto NUMERIC(18, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. MODUL ADMINISTRASI SURAT KELUAR DINAMIS & INTEGRASI GOOGLE CALENDAR
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_templates (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    branch_id VARCHAR(50), -- NULL untuk template global SaaS/HQ
    template_name VARCHAR(255) NOT NULL,
    template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('SURAT_KELUAR', 'SPK', 'INVITATION')),
    html_content TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_document_templates_updated_at
    BEFORE UPDATE ON document_templates
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TABLE IF NOT EXISTS outgoing_letters (
    letter_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    branch_id VARCHAR(50) NOT NULL,
    template_id UUID NOT NULL REFERENCES document_templates(template_id),
    letter_number VARCHAR(100) NOT NULL, -- Di-generate otomatis dari document_sequences Fase 1
    recipient_name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    event_date DATE, -- Tanggal acara/tenggat waktu
    rendered_body_html TEXT NOT NULL,
    google_calendar_event_id VARCHAR(255),
    gcal_sync_status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (gcal_sync_status IN ('PENDING', 'SYNCED', 'FAILED', 'NOT_APPLICABLE')),
    created_by_user_id UUID NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_letter_number UNIQUE (tenant_id, letter_number)
);

CREATE TRIGGER trg_outgoing_letters_updated_at
    BEFORE UPDATE ON outgoing_letters
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================================
-- 6. INBOX VIEWS (ANTEAN KERJA MULTI-DOKUMEN 3-STAGE AUTHORIZATION)
-- ============================================================================

-- 6.1 Antrean Maker: Dokumen DRAFT_MAKER milik user
CREATE OR REPLACE VIEW v_inbox_maker AS
SELECT 
    jm.tenant_id,
    jm.branch_id,
    jm.journal_id AS document_id,
    'JOURNAL' AS document_category,
    jm.doc_no AS document_number,
    jm.doc_type AS transaction_type,
    jm.doc_date AS document_date,
    jm.workflow_status,
    jm.maker_id AS user_id,
    u.full_name AS maker_name,
    jm.notes,
    jm.made_at AS submission_timestamp
FROM journal_masters jm
JOIN users u ON jm.maker_id = u.user_id
WHERE jm.workflow_status = 'DRAFT_MAKER';

-- 6.2 Antrean Approval: Dokumen DRAFT_MAKER siap divalidasi Approver
CREATE OR REPLACE VIEW v_inbox_approval AS
SELECT 
    jm.tenant_id,
    jm.branch_id,
    jm.journal_id AS document_id,
    'JOURNAL' AS document_category,
    jm.doc_no AS document_number,
    jm.doc_type AS transaction_type,
    jm.doc_date AS document_date,
    jm.workflow_status,
    jm.maker_id,
    u.full_name AS maker_name,
    jm.notes,
    jm.made_at AS submission_timestamp
FROM journal_masters jm
JOIN users u ON jm.maker_id = u.user_id
WHERE jm.workflow_status = 'DRAFT_MAKER';

-- 6.3 Antrean Releaser: Dokumen APPROVED siap dirilis ke Buku Besar (GL)
CREATE OR REPLACE VIEW v_inbox_releaser AS
SELECT 
    jm.tenant_id,
    jm.branch_id,
    jm.journal_id AS document_id,
    'JOURNAL' AS document_category,
    jm.doc_no AS document_number,
    jm.doc_type AS transaction_type,
    jm.doc_date AS document_date,
    jm.workflow_status,
    jm.approver_id,
    u.full_name AS approver_name,
    jm.notes,
    jm.approved_at AS approval_timestamp
FROM journal_masters jm
LEFT JOIN users u ON jm.approver_id = u.user_id
WHERE jm.workflow_status = 'APPROVED';

-- ============================================================================
-- 7. KEAMANAN DATA & AUDIT LOG GENERIK (AUDIT TRAILS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    user_id UUID,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_lookup 
    ON audit_logs (tenant_id, table_name, record_id, created_at DESC);

-- Trigger PostgreSQL Generik untuk Audit Log
CREATE OR REPLACE FUNCTION fn_audit_log_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_tenant_id UUID;
    v_record_id VARCHAR(100);
    v_user_id UUID;
    v_old_data JSONB := NULL;
    v_new_data JSONB := NULL;
BEGIN
    v_user_id := NULLIF(current_setting('app.current_user_id', true), '')::UUID;

    IF TG_OP = 'INSERT' THEN
        v_tenant_id := (to_jsonb(NEW)->>'tenant_id')::UUID;
        v_record_id := COALESCE(to_jsonb(NEW)->>'journal_id', to_jsonb(NEW)->>'expense_id', to_jsonb(NEW)->>'request_id', to_jsonb(NEW)->>'id', 'UNKNOWN');
        v_new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        v_tenant_id := (to_jsonb(NEW)->>'tenant_id')::UUID;
        v_record_id := COALESCE(to_jsonb(NEW)->>'journal_id', to_jsonb(NEW)->>'expense_id', to_jsonb(NEW)->>'request_id', to_jsonb(NEW)->>'id', 'UNKNOWN');
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        v_tenant_id := (to_jsonb(OLD)->>'tenant_id')::UUID;
        v_record_id := COALESCE(to_jsonb(OLD)->>'journal_id', to_jsonb(OLD)->>'expense_id', to_jsonb(OLD)->>'request_id', to_jsonb(OLD)->>'id', 'UNKNOWN');
        v_old_data := to_jsonb(OLD);
    END IF;

    INSERT INTO audit_logs (
        tenant_id, table_name, record_id, action_type, old_data, new_data, user_id, ip_address
    ) VALUES (
        COALESCE(v_tenant_id, '00000000-0000-0000-0000-000000000000'::UUID),
        TG_TABLE_NAME,
        v_record_id,
        TG_OP,
        v_old_data,
        v_new_data,
        v_user_id,
        COALESCE(current_setting('app.client_ip', true), '127.0.0.1')
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Pasang Trigger Audit Log ke Tabel-tabel Kritis
CREATE TRIGGER trg_audit_journal_masters
    AFTER INSERT OR UPDATE OR DELETE ON journal_masters
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log_trigger();

CREATE TRIGGER trg_audit_office_expenses
    AFTER INSERT OR UPDATE OR DELETE ON office_expenses
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log_trigger();

CREATE TRIGGER trg_audit_master_data_requests
    AFTER INSERT OR UPDATE OR DELETE ON master_data_requests
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log_trigger();

-- ============================================================================
-- 8. QUERY VIEW: MUTASI BUKU BESAR (GENERAL LEDGER) PER CABANG
-- ============================================================================
-- Aturan Baku: Jurnal HANYA memengaruhi Buku Besar jika berstatus 'RELEASED'
CREATE OR REPLACE VIEW v_general_ledger_mutations AS
SELECT 
    jm.tenant_id,
    jm.branch_id,
    jb.coa_code,
    coa.coa_name,
    coa.account_type,
    coa.normal_balance,
    jm.doc_date,
    jm.doc_no,
    jm.doc_type,
    jm.notes,
    jb.debit_base_amount,
    jb.credit_base_amount,
    -- Mutasi Netto berdasarkan saldo normal
    CASE 
        WHEN coa.normal_balance = 'D' THEN (jb.debit_base_amount - jb.credit_base_amount)
        ELSE (jb.credit_base_amount - jb.debit_base_amount)
    END AS net_movement,
    jm.released_at,
    u_rel.full_name AS releaser_name
FROM journal_masters jm
JOIN journal_bodies jb ON jm.journal_id = jb.journal_id
JOIN chart_of_accounts coa ON jb.tenant_id = coa.tenant_id AND jb.coa_code = coa.coa_code
LEFT JOIN users u_rel ON jm.releaser_id = u_rel.user_id
WHERE jm.workflow_status = 'RELEASED'
ORDER BY jm.doc_date ASC, jm.created_at ASC;
