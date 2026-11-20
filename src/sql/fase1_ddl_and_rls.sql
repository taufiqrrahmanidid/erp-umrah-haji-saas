-- ============================================================================
-- ERP SAAS MULTI-TENANT BIRO PERJALANAN UMRAH & HAJI
-- FASE 1: FONDASI SAAS, RBAC HIERARKI, HR, MASTER DATA & LOGISTIK SISKOPATUH
-- Dialect: PostgreSQL 14+
-- ============================================================================

-- 0. EKSTENSI DATABASE
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. FUNGSI TRIGGER GLOBAL (created_at & updated_at)
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. MODUL TENANT, CONFIG (SETTINGS) & THEME VISUAL
-- ============================================================================

-- 2.1 Tabel Tenants
CREATE TABLE IF NOT EXISTS tenants (
    tenant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL UNIQUE,
    subscription_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' 
        CHECK (subscription_status IN ('TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'EXPIRED')),
    max_branches INT NOT NULL DEFAULT 5,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 2.2 Tabel App Settings (Mendukung Konfigurasi SaaS, Tenant, & Cabang)
CREATE TABLE IF NOT EXISTS app_settings (
    setting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    branch_id VARCHAR(50) DEFAULT NULL, -- NULL = Level Tenant / Global SaaS
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_branch_setting UNIQUE (tenant_id, branch_id, setting_key)
);

CREATE TRIGGER trg_app_settings_updated_at
    BEFORE UPDATE ON app_settings
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Indeks performa untuk JSONB queries dan pencarian setting
CREATE INDEX IF NOT EXISTS idx_app_settings_lookup 
    ON app_settings (tenant_id, branch_id, setting_key);
CREATE INDEX IF NOT EXISTS idx_app_settings_value_gin 
    ON app_settings USING gin (setting_value);

-- Catatan struktur setting_value untuk:
-- A. ui_theme_config:
--    {"primary_color": "#0d9488", "accent_color": "#f59e0b", "login_bg_url": "https://...", "dashboard_bg_url": "https://..."}
-- B. google_calendar_config:
--    {"calendar_id": "c_12345@group.calendar.google.com", "sync_enabled": true, "oauth_token_ref": "token_vault_id"}
-- C. purchasing_limits:
--    {"direct_purchasing_limit": 1000000, "currency": "IDR"}

-- ============================================================================
-- 3. MASTER KURS & AUTO-NUMBERING DOKUMEN
-- ============================================================================

-- 3.1 Tabel Exchange Rates (Master Kurs Valas)
CREATE TABLE IF NOT EXISTS exchange_rates (
    rate_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    currency_code VARCHAR(10) NOT NULL CHECK (currency_code IN ('USD', 'SAR', 'EUR', 'MYR')),
    buy_rate NUMERIC(18, 4) NOT NULL CHECK (buy_rate > 0),
    sell_rate NUMERIC(18, 4) NOT NULL CHECK (sell_rate > 0),
    middle_rate NUMERIC(18, 4) GENERATED ALWAYS AS ((buy_rate + sell_rate) / 2) STORED,
    effective_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_rate_date UNIQUE (tenant_id, currency_code, effective_date)
);

CREATE TRIGGER trg_exchange_rates_updated_at
    BEFORE UPDATE ON exchange_rates
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_exchange_rates_lookup 
    ON exchange_rates (tenant_id, currency_code, effective_date DESC);

-- 3.2 Tabel Document Sequences (Auto-Numbering per Cabang)
CREATE TABLE IF NOT EXISTS document_sequences (
    sequence_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    owner_branch_id VARCHAR(50) NOT NULL,
    doc_type VARCHAR(50) NOT NULL CHECK (doc_type IN ('INV', 'KWT', 'MNF', 'PO', 'SPK', 'JRN', 'REG')),
    format_pattern VARCHAR(100) NOT NULL DEFAULT '{DOC}/{BRANCH}/{YYYY}/{MM}/{SEQ}',
    current_year INT NOT NULL,
    current_month INT NOT NULL,
    last_number INT NOT NULL DEFAULT 0,
    padding_length INT NOT NULL DEFAULT 4,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_branch_doc_seq UNIQUE (tenant_id, owner_branch_id, doc_type, current_year, current_month)
);

CREATE TRIGGER trg_document_sequences_updated_at
    BEFORE UPDATE ON document_sequences
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Fungsi generator nomor dokumen atomik
CREATE OR REPLACE FUNCTION generate_document_number(
    p_tenant_id UUID,
    p_branch_id VARCHAR(50),
    p_doc_type VARCHAR(50)
)
RETURNS TEXT AS $$
DECLARE
    v_year INT := EXTRACT(YEAR FROM CURRENT_DATE);
    v_month INT := EXTRACT(MONTH FROM CURRENT_DATE);
    v_last_no INT;
    v_pad_len INT := 4;
    v_pattern VARCHAR(100) := '{DOC}/{BRANCH}/{YYYY}/{MM}/{SEQ}';
    v_seq_str TEXT;
    v_doc_no TEXT;
BEGIN
    INSERT INTO document_sequences (
        tenant_id, owner_branch_id, doc_type, current_year, current_month, last_number, padding_length, format_pattern
    )
    VALUES (
        p_tenant_id, p_branch_id, p_doc_type, v_year, v_month, 1, 4, v_pattern
    )
    ON CONFLICT (tenant_id, owner_branch_id, doc_type, current_year, current_month)
    DO UPDATE SET 
        last_number = document_sequences.last_number + 1,
        updated_at = CURRENT_TIMESTAMP
    RETURNING last_number, padding_length, format_pattern INTO v_last_no, v_pad_len, v_pattern;

    v_seq_str := LPAD(v_last_no::TEXT, v_pad_len, '0');
    v_doc_no := REPLACE(v_pattern, '{DOC}', p_doc_type);
    v_doc_no := REPLACE(v_doc_no, '{BRANCH}', p_branch_id);
    v_doc_no := REPLACE(v_doc_no, '{YYYY}', v_year::TEXT);
    v_doc_no := REPLACE(v_doc_no, '{MM}', LPAD(v_month::TEXT, 2, '0'));
    v_doc_no := REPLACE(v_doc_no, '{SEQ}', v_seq_str);

    RETURN v_doc_no;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. MODUL USERS, RBAC & MULTI-TIER BROKER
-- ============================================================================

-- 4.1 Tabel Roles
CREATE TABLE IF NOT EXISTS roles (
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_code VARCHAR(50) NOT NULL UNIQUE,
    role_name VARCHAR(100) NOT NULL,
    role_portal VARCHAR(50) NOT NULL 
        CHECK (role_portal IN ('SAAS', 'INTERNAL_HQ', 'BRANCH', 'AGENT_NETWORK', 'PILGRIM', 'SAUDI_HANDLING')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data Master Roles
INSERT INTO roles (role_code, role_name, role_portal, description) VALUES
('ADMIN_SAAS', 'Admin SaaS / Platform Superadmin', 'SAAS', 'Akses penuh ke seluruh konfigurasi multi-tenant'),
('ADMIN_HQ', 'Admin Tenant / Head Quarter', 'INTERNAL_HQ', 'Pengelola pusat biro perjalanan umrah'),
('ADMIN_BRANCH', 'Admin Cabang (Mandiri / KSO)', 'BRANCH', 'Pengelola operasional cabang lokal'),
('INTERNAL_SALES', 'Sales Internal Pusat/Cabang', 'INTERNAL_HQ', 'Petugas penjualan internal biro perjalanan'),
('AGENT_COORDINATOR', 'Koordinator Agen (Upline)', 'AGENT_NETWORK', 'Pimpinan konsorsium / koordinator pondok pesantren & agen'),
('BRANCH_AGENT', 'Agen Cabang (Downline)', 'AGENT_NETWORK', 'Agen perorangan / sub-broker penjaring jamaah'),
('JAMAAH', 'Jamaah (Pilgrim Portal)', 'PILGRIM', 'Akses portal mandiri jamaah umrah/haji'),
('MUTHAWIF', 'Muthawif Pembimbing Ibadah', 'SAUDI_HANDLING', 'Pembimbing ibadah di Makkah & Madinah'),
('TOUR_LEADER', 'Tour Leader (TL)', 'SAUDI_HANDLING', 'Pimpinan rombongan keberangkatan Indonesia-Saudi'),
('MUKIBIN', 'Mukibin (Tim Handling Saudi)', 'SAUDI_HANDLING', 'Tim logistik lapangan handling hotel, airport & koper Saudi')
ON CONFLICT (role_code) DO NOTHING;

-- 4.2 Tabel Users
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE, -- NULL untuk ADMIN_SAAS
    owner_branch_id VARCHAR(50) NOT NULL DEFAULT 'HQ',
    branch_id VARCHAR(50) NOT NULL DEFAULT 'HQ',
    upline_id UUID REFERENCES users(user_id) ON DELETE SET NULL, -- Self-referencing FK Multi-Tier Agen/Broker
    phone_number VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    profile_photo_url TEXT, -- Identifikasi visual Muthawif, TL, Mukibin bagi Jamaah
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_users_tenant_branch 
    ON users (tenant_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_users_upline_tree 
    ON users (upline_id);

-- 4.3 Tabel Relasi User Roles
CREATE TABLE IF NOT EXISTS user_roles (
    user_role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_role UNIQUE (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_lookup 
    ON user_roles (user_id, role_id);

-- ============================================================================
-- 5. MODUL HR DASAR & PEGAWAI (Pusat, Mandiri, KSO)
-- ============================================================================

-- 5.1 Tabel Employees
CREATE TABLE IF NOT EXISTS employees (
    employee_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    owner_branch_id VARCHAR(50) NOT NULL,
    user_id UUID UNIQUE REFERENCES users(user_id) ON DELETE SET NULL,
    branch_id VARCHAR(50) NOT NULL,
    nik_karyawan VARCHAR(50) NOT NULL,
    jabatan VARCHAR(100) NOT NULL,
    tanggal_masuk DATE NOT NULL,
    status_karyawan VARCHAR(50) NOT NULL CHECK (status_karyawan IN ('PUSAT', 'MANDIRI', 'KSO')),
    status_aktif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_nik_karyawan UNIQUE (tenant_id, nik_karyawan)
);

CREATE TRIGGER trg_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_employees_tenant_branch 
    ON employees (tenant_id, branch_id, status_karyawan);

-- 5.2 Tabel Attendances (Kehadiran / Absensi dengan Geolocation)
CREATE TABLE IF NOT EXISTS attendances (
    attendance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    owner_branch_id VARCHAR(50) NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL CHECK (status IN ('PRESENT', 'LATE', 'ABSENT', 'ON_DUTY_FIELD', 'OFF')),
    latitude_in NUMERIC(10, 7),
    longitude_in NUMERIC(10, 7),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_employee_daily_attendance UNIQUE (tenant_id, employee_id, attendance_date)
);

CREATE TRIGGER trg_attendances_updated_at
    BEFORE UPDATE ON attendances
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_attendances_date_emp 
    ON attendances (tenant_id, attendance_date, employee_id);

-- 5.3 Tabel Leave Requests (Pengajuan Izin / Cuti)
CREATE TABLE IF NOT EXISTS leave_requests (
    leave_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    owner_branch_id VARCHAR(50) NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('ANNUAL', 'SICK', 'HAJJ_DUTY', 'SPECIAL', 'MATERNITY')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    approval_status VARCHAR(50) NOT NULL DEFAULT 'PENDING' 
        CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    approver_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    approval_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_leave_requests_updated_at
    BEFORE UPDATE ON leave_requests
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 5.4 Tabel Payroll Components
CREATE TABLE IF NOT EXISTS payroll_components (
    payroll_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    owner_branch_id VARCHAR(50) NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    period_month INT NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    period_year INT NOT NULL CHECK (period_year >= 2020),
    gaji_pokok NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (gaji_pokok >= 0),
    tunjangan_tetap NUMERIC(18, 2) NOT NULL DEFAULT 0,
    tunjangan_tidak_tetap NUMERIC(18, 2) NOT NULL DEFAULT 0,
    bpjs_kesehatan NUMERIC(18, 2) NOT NULL DEFAULT 0,
    bpjs_ketenagakerjaan NUMERIC(18, 2) NOT NULL DEFAULT 0,
    pph_21 NUMERIC(18, 2) NOT NULL DEFAULT 0,
    potongan_lain NUMERIC(18, 2) NOT NULL DEFAULT 0,
    gaji_bersih NUMERIC(18, 2) GENERATED ALWAYS AS (
        (gaji_pokok + tunjangan_tetap + tunjangan_tidak_tetap) -
        (bpjs_kesehatan + bpjs_ketenagakerjaan + pph_21 + potongan_lain)
    ) STORED,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'UNPAID' 
        CHECK (payment_status IN ('UNPAID', 'APPROVED', 'PAID')),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_employee_period UNIQUE (tenant_id, employee_id, period_year, period_month)
);

CREATE TRIGGER trg_payroll_components_updated_at
    BEFORE UPDATE ON payroll_components
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================================
-- 6. GENERIC MASTER DATA & LOGIKA MASTER CABANG (BRANCH)
-- ============================================================================

-- 6.1 Tabel Universal Master Data (Read-only untuk Cabang, Hanya Admin Pusat yang mengelola)
CREATE TABLE IF NOT EXISTS general_masters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    head_code VARCHAR(50) NOT NULL,
    child_code VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    cd1 VARCHAR(100), -- Posisi aktif: '1' = Aktif/Digunakan, '0' = Tidak digunakan
    cd2 VARCHAR(100), -- Branch Type: 'HQ', 'MANDIRI', 'KSO'
    cd3 VARCHAR(100), -- Parent Branch ID (Self-referencing untuk KSO Franchise Bertingkat)
    cd4 VARCHAR(100), -- Metadata tambahan
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_head_child UNIQUE (tenant_id, head_code, child_code)
);

CREATE TRIGGER trg_general_masters_updated_at
    BEFORE UPDATE ON general_masters
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_general_masters_lookup 
    ON general_masters (tenant_id, head_code, child_code);

-- 6.2 View Query Penarikan Data Cabang (Branch) dari general_masters
-- Aturan Khusus:
-- - Filter: head_code = 'BRN01'
-- - Abaikan: child_code = '*' (Header / Group name)
-- - cd1 = '1' sebagai status cabang aktif
-- - cd2 = branch_type ('HQ', 'MANDIRI', 'KSO')
-- - cd3 = parent_branch_code
CREATE OR REPLACE VIEW v_branches AS
SELECT 
    gm.tenant_id,
    gm.child_code AS branch_code,
    gm.description AS branch_name,
    gm.cd1 AS is_active_indicator,
    (gm.cd1 = '1') AS is_active,
    COALESCE(gm.cd2, 'MANDIRI') AS branch_type,
    gm.cd3 AS parent_branch_code,
    gm.cd4 AS extra_info,
    gm.created_at,
    gm.updated_at
FROM general_masters gm
WHERE gm.head_code = 'BRN01'
  AND gm.child_code <> '*';

-- View Cabang dengan Hierarki Rekursif (untuk KSO dan Sub-Cabang KSO)
CREATE OR REPLACE VIEW v_branches_hierarchy AS
WITH RECURSIVE branch_tree AS (
    -- Root Cabang (HQ atau Cabang Utama tanpa parent)
    SELECT 
        b.tenant_id,
        b.branch_code,
        b.branch_name,
        b.is_active,
        b.branch_type,
        b.parent_branch_code,
        1 AS hierarchy_level,
        ARRAY[b.branch_code::text] AS path
    FROM v_branches b
    WHERE b.parent_branch_code IS NULL OR b.parent_branch_code = '' OR b.branch_type = 'HQ'

    UNION ALL

    -- Anak Cabang (Sub-KSO / Franchise downline)
    SELECT 
        c.tenant_id,
        c.branch_code,
        c.branch_name,
        c.is_active,
        c.branch_type,
        c.parent_branch_code,
        t.hierarchy_level + 1 AS hierarchy_level,
        t.path || c.branch_code::text AS path
    FROM v_branches c
    INNER JOIN branch_tree t 
        ON c.tenant_id = t.tenant_id 
       AND c.parent_branch_code = t.branch_code
)
SELECT * FROM branch_tree;

-- ============================================================================
-- 7. MASTER PELANGGAN (BIODATA KOMPREHENSIF SISKOPATUH & GEOLOCATION)
-- ============================================================================

CREATE TABLE IF NOT EXISTS customers (
    customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    owner_branch_id VARCHAR(50) NOT NULL,
    user_id UUID UNIQUE REFERENCES users(user_id) ON DELETE SET NULL, -- Akun login Portal Jamaah
    agent_id UUID REFERENCES users(user_id) ON DELETE SET NULL, -- Broker / Koordinator penanggung jawab

    -- Kategori 1: Basic
    full_name VARCHAR(255) NOT NULL,
    birth_place VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    gender CHAR(1) NOT NULL CHECK (gender IN ('L', 'P')),
    blood_type VARCHAR(5) CHECK (blood_type IN ('A', 'B', 'AB', 'O')),

    -- Kategori 2: Domisili & GPS (Logistik Koper & Penjemputan)
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100),
    postal_code VARCHAR(20),
    home_latitude NUMERIC(10, 7),
    home_longitude NUMERIC(10, 7),

    -- Kategori 3: Siskopatuh & Imigrasi
    nik VARCHAR(20) NOT NULL,
    passport_number VARCHAR(50) NOT NULL,
    passport_expiry DATE NOT NULL,
    fathers_name VARCHAR(255) NOT NULL,
    mahram_id UUID REFERENCES customers(customer_id) ON DELETE SET NULL, -- Self-referencing FK Mahram
    mahram_relation VARCHAR(50), -- SUAMI, AYAH, KAKAK_KANDUNG, ANAK_LAKI, ADIK_LAKI
    siskopatuh_qr_code TEXT NOT NULL, -- QR Siskopatuh & ID Tag Bagasi Jamaah

    -- Kategori 4: Logistik & Medis
    jacket_size VARCHAR(10) CHECK (jacket_size IN ('S', 'M', 'L', 'XL', 'XXL', 'XXXL')),
    shoe_size VARCHAR(10),
    medical_notes TEXT,
    emergency_contact JSONB NOT NULL, -- {"name": "Nama Kontak", "relation": "Keluarga", "phone": "0812..."}

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_tenant_nik UNIQUE (tenant_id, nik),
    CONSTRAINT uq_tenant_passport UNIQUE (tenant_id, passport_number)
);

CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Indeks performa pencarian identitas & logistik
CREATE INDEX IF NOT EXISTS idx_customers_tenant_branch 
    ON customers (tenant_id, owner_branch_id);
CREATE INDEX IF NOT EXISTS idx_customers_nik 
    ON customers (tenant_id, nik);
CREATE INDEX IF NOT EXISTS idx_customers_passport 
    ON customers (tenant_id, passport_number);
CREATE INDEX IF NOT EXISTS idx_customers_agent 
    ON customers (agent_id);
CREATE INDEX IF NOT EXISTS idx_customers_mahram 
    ON customers (mahram_id);
CREATE INDEX IF NOT EXISTS idx_customers_coords 
    ON customers (home_latitude, home_longitude);

-- 7.2 Trigger Validasi Mahram Siskopatuh
-- Aturan: Jamaah Perempuan berusia < 45 tahun WAJIB memiliki mahram yang terdaftar
CREATE OR REPLACE FUNCTION fn_validate_mahram_siskopatuh()
RETURNS TRIGGER AS $$
DECLARE
    v_age_years INT;
    v_mahram_gender CHAR(1);
BEGIN
    -- Hitung usia jamaah saat didaftarkan
    v_age_years := DATE_PART('year', AGE(CURRENT_DATE, NEW.birth_date));

    IF NEW.gender = 'P' AND v_age_years < 45 THEN
        -- Wajib ada mahram
        IF NEW.mahram_id IS NULL THEN
            RAISE EXCEPTION 'Aturan Siskopatuh: Jamaah wanita di bawah 45 tahun (%) wajib memiliki Mahram yang terdaftar!', NEW.full_name;
        END IF;

        -- Validasi gender mahram
        SELECT gender INTO v_mahram_gender FROM customers WHERE customer_id = NEW.mahram_id;
        IF v_mahram_gender <> 'L' THEN
            RAISE EXCEPTION 'Aturan Siskopatuh: Mahram yang ditunjuk harus berjenis kelamin Laki-laki!';
        END IF;
    END IF;

    -- Cegah self-mahram
    IF NEW.customer_id IS NOT NULL AND NEW.mahram_id = NEW.customer_id THEN
        RAISE EXCEPTION 'Jamaah tidak dapat menjadi mahram untuk dirinya sendiri!';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_mahram_siskopatuh
    BEFORE INSERT OR UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION fn_validate_mahram_siskopatuh();

-- ============================================================================
-- 8. MASTER VENDOR & WORKFLOW REGISTRASI TENDER
-- ============================================================================

-- 8.1 Tabel Vendors (Mencakup ASURANSI Mitra Syariah, Hotel, Maskapai, dll.)
CREATE TABLE IF NOT EXISTS vendors (
    vendor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    owner_branch_id VARCHAR(50) NOT NULL DEFAULT 'HQ',
    vendor_code VARCHAR(50) NOT NULL,
    vendor_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'ASURANSI',        -- Perusahaan Asuransi Syariah Perjalanan Umrah/Haji
        'AIRLINE',         -- Maskapai Penerbangan (SV, GA, Lion, dll.)
        'HOTEL_MAKKAH',    -- Provider Hotel di Makkah
        'HOTEL_MADINAH',   -- Provider Hotel di Madinah
        'VISA_PROVIDER',   -- Provider Muasasah / Visa Umrah
        'BUS_TRANSPORT',   -- Transportasi Bus Saudi (SAPTCO, Rawahel, dll.)
        'CATERING',        -- Katering Jamaah Indonesia di Makkah/Madinah
        'MUTAWIF_SERVICE', -- Penyedia Jasa Muthawif & Guide
        'HANDLING_SAUDI'   -- Handling Airport & Koper Jeddah/Madinah
    )),
    is_syariah_compliant BOOLEAN NOT NULL DEFAULT TRUE,
    contact_person VARCHAR(100),
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_vendor_code UNIQUE (tenant_id, vendor_code)
);

CREATE TRIGGER trg_vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_vendors_tenant_cat 
    ON vendors (tenant_id, category, is_active);

-- 8.2 Tabel Vendor Registrations (Workflow Tender / Pendaftaran Vendor Baru)
CREATE TABLE IF NOT EXISTS vendor_registrations (
    registration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    owner_branch_id VARCHAR(50) NOT NULL DEFAULT 'HQ',
    vendor_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    tender_number VARCHAR(100) NOT NULL,
    submitted_documents JSONB NOT NULL, -- {"siup": "url", "nib": "url", "polis_syariah": "url", "sertifikat_ojk": "url"}
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_REVIEW' 
        CHECK (status IN ('PENDING_REVIEW', 'VERIFIED', 'REJECTED')),
    reviewer_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    review_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    approved_vendor_id UUID REFERENCES vendors(vendor_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_vendor_registrations_updated_at
    BEFORE UPDATE ON vendor_registrations
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_vendor_registrations_status 
    ON vendor_registrations (tenant_id, status);

-- ============================================================================
-- 9. FONDASI 3-LEVEL JOURNAL & 3-STAGE WORKFLOW (FINANSIAL & BUKU BESAR GL)
-- ============================================================================

-- Level 1: Journal Masters (Header Transaksi Finansial)
CREATE TABLE IF NOT EXISTS journal_masters (
    journal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    owner_branch_id VARCHAR(50) NOT NULL,
    journal_number VARCHAR(100) NOT NULL,
    transaction_date DATE NOT NULL,
    workflow_stage VARCHAR(50) NOT NULL DEFAULT 'DRAFT_MAKER' 
        CHECK (workflow_stage IN ('DRAFT_MAKER', 'APPROVED', 'RELEASED')),
    maker_user_id UUID NOT NULL REFERENCES users(user_id),
    approver_user_id UUID REFERENCES users(user_id),
    releaser_user_id UUID REFERENCES users(user_id),
    reference_module VARCHAR(50) NOT NULL, -- 'PACKAGE_BOOKING', 'DIRECT_PURCHASE', 'PAYROLL', 'TENDER'
    reference_id UUID,
    notes TEXT,
    total_debit NUMERIC(18, 2) NOT NULL DEFAULT 0,
    total_credit NUMERIC(18, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_journal_no UNIQUE (tenant_id, journal_number)
);

CREATE TRIGGER trg_journal_masters_updated_at
    BEFORE UPDATE ON journal_masters
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Level 2: Journal Bodies (Grup Transaksi / Sub-Ledger per Objek Biaya / Jamaah)
CREATE TABLE IF NOT EXISTS journal_bodies (
    body_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id UUID NOT NULL REFERENCES journal_masters(journal_id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    owner_branch_id VARCHAR(50) NOT NULL,
    sub_ledger_code VARCHAR(50), -- Misal: KODE_PAKET, ID_JAMAAH, ID_VENDOR
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Level 3: Journal Details (Baris Akun Debit/Kredit GL dengan Mata Uang Asing & Kurs)
CREATE TABLE IF NOT EXISTS journal_details (
    detail_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    body_id UUID NOT NULL REFERENCES journal_bodies(body_id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    owner_branch_id VARCHAR(50) NOT NULL,
    account_code VARCHAR(50) NOT NULL, -- Chart of Accounts (COA)
    currency_code VARCHAR(10) NOT NULL DEFAULT 'IDR',
    exchange_rate NUMERIC(18, 4) NOT NULL DEFAULT 1.0,
    amount_valas NUMERIC(18, 2) NOT NULL DEFAULT 0,
    debit_amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
    credit_amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Validasi Balance Debit = Credit sebelum Transaksi dapat APPROVED atau RELEASED
CREATE OR REPLACE FUNCTION fn_check_journal_balance()
RETURNS TRIGGER AS $$
DECLARE
    v_sum_debit NUMERIC(18, 2);
    v_sum_credit NUMERIC(18, 2);
BEGIN
    IF NEW.workflow_stage IN ('APPROVED', 'RELEASED') THEN
        SELECT 
            COALESCE(SUM(jd.debit_amount), 0),
            COALESCE(SUM(jd.credit_amount), 0)
        INTO v_sum_debit, v_sum_credit
        FROM journal_bodies jb
        JOIN journal_details jd ON jb.body_id = jd.body_id
        WHERE jb.journal_id = NEW.journal_id;

        IF v_sum_debit <> v_sum_credit THEN
            RAISE EXCEPTION 'Validasi GL Gagal: Total Debit (%) tidak sama dengan Total Credit (%) pada Jurnal %!',
                v_sum_debit, v_sum_credit, NEW.journal_number;
        END IF;

        IF v_sum_debit = 0 THEN
            RAISE EXCEPTION 'Validasi GL Gagal: Nilai transaksi tidak boleh 0 untuk stage %!', NEW.workflow_stage;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_verify_journal_balance
    BEFORE UPDATE OF workflow_stage ON journal_masters
    FOR EACH ROW EXECUTE FUNCTION fn_check_journal_balance();

-- ============================================================================
-- 10. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Aktifkan RLS pada tabel operasional
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- 10.1 Helper Function untuk Hierarki Agen (Downline CTE)
CREATE OR REPLACE FUNCTION fn_is_user_downline(p_target_agent_id UUID, p_caller_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_downline BOOLEAN := FALSE;
BEGIN
    IF p_target_agent_id IS NULL OR p_caller_user_id IS NULL THEN
        RETURN FALSE;
    END IF;

    IF p_target_agent_id = p_caller_user_id THEN
        RETURN TRUE;
    END IF;

    -- Telusuri silsilah keagenan secara rekursif
    WITH RECURSIVE downline_tree AS (
        SELECT user_id, upline_id
        FROM users
        WHERE upline_id = p_caller_user_id
        UNION ALL
        SELECT u.user_id, u.upline_id
        FROM users u
        INNER JOIN downline_tree dt ON u.upline_id = dt.user_id
    )
    SELECT EXISTS (
        SELECT 1 FROM downline_tree WHERE user_id = p_target_agent_id
    ) INTO v_is_downline;

    RETURN v_is_downline;
END;
$$ LANGUAGE plpgsql STABLE;

-- 10.2 Kebijakan RLS untuk CUSTOMERS
-- Aturan:
-- 1. Admin SaaS / HQ: Melihat semua data dalam tenant
-- 2. Admin Cabang: Hanya melihat data di mana owner_branch_id sesuai
-- 3. Koordinator Agen: Melihat jamaah miliknya dan downline-nya
-- 4. Agen Cabang: Hanya melihat jamaah miliknya sendiri
-- 5. Jamaah: Hanya melihat profil jamaah miliknya sendiri
-- 6. Petugas Lapangan (Muthawif / TL / Mukibin): Melihat data jamaah pada cabang / penugasan
DROP POLICY IF EXISTS p_customers_isolation ON customers;

CREATE POLICY p_customers_isolation ON customers
FOR ALL
USING (
    -- Isolasi Tenant Wajib
    tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    AND (
        -- 1. Admin SaaS atau Admin HQ
        current_setting('app.current_role', true) IN ('ADMIN_SAAS', 'ADMIN_HQ')
        OR
        -- 2. Admin Cabang
        (
            current_setting('app.current_role', true) = 'ADMIN_BRANCH'
            AND owner_branch_id = current_setting('app.current_branch_id', true)
        )
        OR
        -- 3. Koordinator Agen (Upline)
        (
            current_setting('app.current_role', true) = 'AGENT_COORDINATOR'
            AND fn_is_user_downline(agent_id, NULLIF(current_setting('app.current_user_id', true), '')::UUID)
        )
        OR
        -- 4. Agen Cabang (Downline Tunggal)
        (
            current_setting('app.current_role', true) = 'BRANCH_AGENT'
            AND agent_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID
        )
        OR
        -- 5. Portal Jamaah (Akses mandiri)
        (
            current_setting('app.current_role', true) = 'JAMAAH'
            AND user_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID
        )
        OR
        -- 6. Petugas Lapangan (Muthawif, TL, Mukibin)
        (
            current_setting('app.current_role', true) IN ('MUTHAWIF', 'TOUR_LEADER', 'MUKIBIN')
            AND owner_branch_id = current_setting('app.current_branch_id', true)
        )
    )
);

-- 10.3 Kebijakan RLS untuk JOURNAL_MASTERS (GL & Finansial)
DROP POLICY IF EXISTS p_journal_masters_isolation ON journal_masters;

CREATE POLICY p_journal_masters_isolation ON journal_masters
FOR ALL
USING (
    tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    AND (
        current_setting('app.current_role', true) IN ('ADMIN_SAAS', 'ADMIN_HQ')
        OR
        (
            current_setting('app.current_role', true) = 'ADMIN_BRANCH'
            AND owner_branch_id = current_setting('app.current_branch_id', true)
        )
    )
);

-- 10.4 Kebijakan RLS untuk EMPLOYEES & PAYROLL
DROP POLICY IF EXISTS p_employees_isolation ON employees;

CREATE POLICY p_employees_isolation ON employees
FOR ALL
USING (
    tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    AND (
        current_setting('app.current_role', true) IN ('ADMIN_SAAS', 'ADMIN_HQ')
        OR
        (
            current_setting('app.current_role', true) = 'ADMIN_BRANCH'
            AND owner_branch_id = current_setting('app.current_branch_id', true)
        )
        OR
        -- Pegawai hanya boleh melihat data dirinya
        (
            user_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID
        )
    )
);

-- 10.5 View Keamanan Harga untuk Cabang KSO (Menyembunyikan HPP Asli HQ)
-- Cabang KSO TIDAK BOLEH melihat HPP asli milik HQ, hanya Harga Nett KSO
CREATE OR REPLACE VIEW v_kso_package_pricing_secured AS
SELECT 
    gm.tenant_id,
    gm.child_code AS package_code,
    gm.description AS package_name,
    CASE 
        WHEN current_setting('app.current_role', true) IN ('ADMIN_SAAS', 'ADMIN_HQ') THEN 
            (gm.cd1)::NUMERIC -- HPP Asli HQ (Hanya terlihat oleh HQ)
        ELSE 
            NULL -- Disembunyikan dari Cabang KSO
    END AS hpp_asli_hq,
    (gm.cd2)::NUMERIC AS harga_nett_kso, -- Harga yang dibayar Cabang KSO ke HQ
    (gm.cd3)::NUMERIC AS harga_jual_jamaah -- Harga publish resmi ke jamaah
FROM general_masters gm
WHERE gm.head_code = 'PKG01'
  AND gm.child_code <> '*';

-- ============================================================================
-- CONTOH CARA MENGUJI RLS DALAM SESSION POSTGRESQL:
-- ============================================================================
-- SET LOCAL app.current_tenant_id = 'c1234567-0000-0000-0000-000000000001';
-- SET LOCAL app.current_role = 'ADMIN_BRANCH';
-- SET LOCAL app.current_branch_id = 'C01';
-- SET LOCAL app.current_user_id = 'u1234567-0000-0000-0000-000000000002';
-- SELECT * FROM customers; -- Otomatis hanya menampilkan baris milik Branch C01!
-- ============================================================================
