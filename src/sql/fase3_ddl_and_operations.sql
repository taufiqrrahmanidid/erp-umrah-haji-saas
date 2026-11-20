-- ============================================================================
-- ERP SAAS MULTI-TENANT BIRO PERJALANAN UMRAH & HAJI
-- FASE 3: FRONT-END OPERATIONS, MASTER PAKET RAB, BLOCK SEAT, SALES & ENDORSEMENT,
--         CASH ADVANCE & E-LPJ, ESCROW TABUNGAN, DOKUMEN & PORTAL JAMAAH
-- Dialect: PostgreSQL 14+
-- ============================================================================

-- 0. EKSTENSI DATABASE
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. MASTER PAKET, BLOCK SEAT & RAB DINAMIS (WORKFLOW LOCKING)
-- ============================================================================

-- 1.1 Tabel Master Paket Umrah / Haji
CREATE TABLE IF NOT EXISTS packages (
    package_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    package_code VARCHAR(50) NOT NULL,
    package_name VARCHAR(255) NOT NULL,
    package_type VARCHAR(50) NOT NULL CHECK (package_type IN ('REGULER_9D', 'REGULER_12D', 'VIP_CLOCK_TOWER', 'RAMADHAN_ITIKAF', 'HAJI_KHUSUS')),
    departure_date DATE NOT NULL,
    return_date DATE NOT NULL,
    duration_days INT NOT NULL DEFAULT 9,
    hotel_makkah VARCHAR(100) NOT NULL,
    hotel_madinah VARCHAR(100) NOT NULL,
    airline_name VARCHAR(100) NOT NULL,
    quota_seats INT NOT NULL DEFAULT 45,
    booked_seats INT NOT NULL DEFAULT 0,
    workflow_status VARCHAR(50) NOT NULL DEFAULT 'DRAFT_MAKER'
        CHECK (workflow_status IN ('DRAFT_MAKER', 'APPROVED', 'RELEASED', 'CLOSED')),
    maker_id UUID NOT NULL REFERENCES users(user_id),
    approver_id UUID REFERENCES users(user_id),
    releaser_id UUID REFERENCES users(user_id),
    released_at TIMESTAMPTZ,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_package_code UNIQUE (tenant_id, package_code)
);

CREATE TRIGGER trg_packages_updated_at
    BEFORE UPDATE ON packages
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 1.2 Tabel Block Seat Pesawat (Flight Allocations)
CREATE TABLE IF NOT EXISTS flight_allocations (
    allocation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES packages(package_id) ON DELETE CASCADE,
    airline_name VARCHAR(100) NOT NULL,
    pnr_code VARCHAR(50) NOT NULL,
    flight_number_go VARCHAR(50) NOT NULL,
    flight_number_back VARCHAR(50) NOT NULL,
    route_path VARCHAR(100) NOT NULL, -- Misal CGK-JED, MED-CGK
    total_seats INT NOT NULL CHECK (total_seats > 0),
    held_seats INT NOT NULL DEFAULT 0,
    available_seats INT GENERATED ALWAYS AS (total_seats - held_seats) STORED,
    deposit_per_seat NUMERIC(18, 2) NOT NULL DEFAULT 0,
    full_payment_due_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_pnr UNIQUE (tenant_id, pnr_code)
);

-- 1.3 Tabel Rincian RAB HPP Modal per Jamaah (Package RABs)
CREATE TABLE IF NOT EXISTS package_rabs (
    rab_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    package_id UUID NOT NULL UNIQUE REFERENCES packages(package_id) ON DELETE CASCADE,
    cost_ticket_flight NUMERIC(18, 2) NOT NULL DEFAULT 0,
    cost_la_saudi NUMERIC(18, 2) NOT NULL DEFAULT 0,
    cost_hotel_makkah NUMERIC(18, 2) NOT NULL DEFAULT 0,
    cost_hotel_madinah NUMERIC(18, 2) NOT NULL DEFAULT 0,
    cost_visa_muasasah NUMERIC(18, 2) NOT NULL DEFAULT 0,
    cost_equipment_luggage NUMERIC(18, 2) NOT NULL DEFAULT 0,
    cost_syariah_insurance NUMERIC(18, 2) NOT NULL DEFAULT 0,
    cost_muthawif_tl_fee NUMERIC(18, 2) NOT NULL DEFAULT 0,
    cost_management_fee NUMERIC(18, 2) NOT NULL DEFAULT 0,
    total_hpp_per_pax NUMERIC(18, 2) GENERATED ALWAYS AS (
        cost_ticket_flight + cost_la_saudi + cost_hotel_makkah + cost_hotel_madinah +
        cost_visa_muasasah + cost_equipment_luggage + cost_syariah_insurance +
        cost_muthawif_tl_fee + cost_management_fee
    ) STORED,
    margin_target NUMERIC(18, 2) NOT NULL DEFAULT 0,
    kso_nett_price NUMERIC(18, 2) NOT NULL DEFAULT 0, -- Harga yang dibayar Cabang KSO ke HQ
    public_selling_price NUMERIC(18, 2) NOT NULL DEFAULT 0, -- Harga publish resmi jamaah
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_package_rabs_updated_at
    BEFORE UPDATE ON package_rabs
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Trigger Locking Permanen saat Paket RELEASED
CREATE OR REPLACE FUNCTION fn_lock_package_rab_on_release()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.workflow_status = 'RELEASED' AND (OLD.workflow_status <> 'RELEASED' OR OLD.workflow_status IS NULL) THEN
        NEW.is_locked := TRUE;
        NEW.released_at := CURRENT_TIMESTAMP;
    END IF;

    -- Cegah perubahan data jika sudah locked
    IF OLD.is_locked = TRUE AND NEW.workflow_status = 'RELEASED' THEN
        IF NEW.quota_seats < OLD.booked_seats THEN
            RAISE EXCEPTION 'Paket % terkunci permanen. Kuota tidak boleh diperkecil di bawah jumlah jamaah terdaftar!', NEW.package_code;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lock_package_on_release
    BEFORE UPDATE OF workflow_status ON packages
    FOR EACH ROW EXECUTE FUNCTION fn_lock_package_rab_on_release();

-- Cegah edit RAB jika paket sudah terkunci
CREATE OR REPLACE FUNCTION fn_prevent_rab_modification_if_locked()
RETURNS TRIGGER AS $$
DECLARE
    v_locked BOOLEAN;
BEGIN
    SELECT is_locked INTO v_locked FROM packages WHERE package_id = NEW.package_id;
    IF v_locked = TRUE THEN
        RAISE EXCEPTION 'Komponen RAB dan Harga Jual Paket ini telah terkunci permanen (RELEASED)!';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_rab_modification
    BEFORE UPDATE ON package_rabs
    FOR EACH ROW EXECUTE FUNCTION fn_prevent_rab_modification_if_locked();

-- ============================================================================
-- 2. MODUL SALES & BOOKINGS (PENDAFTARAN & VALIDASI ENDORSEMENT)
-- ============================================================================

CREATE TABLE IF NOT EXISTS bookings (
    booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    branch_id VARCHAR(50) NOT NULL,
    booking_number VARCHAR(100) NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE RESTRICT,
    package_id UUID NOT NULL REFERENCES packages(package_id) ON DELETE RESTRICT,
    agent_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    project_group_id VARCHAR(50), -- ID Rombongan / Manifest
    booking_type VARCHAR(50) NOT NULL DEFAULT 'REGULAR'
        CHECK (booking_type IN ('REGULAR', 'ENDORSEMENT', 'PAID_TALENT')),
    status VARCHAR(50) NOT NULL DEFAULT 'INQUIRY'
        CHECK (status IN ('INQUIRY', 'DP_PAID', 'FULLY_PAID', 'CANCELLED')),
    room_type VARCHAR(20) NOT NULL DEFAULT 'QUAD'
        CHECK (room_type IN ('QUAD', 'TRIPLE', 'DOUBLE')),
    package_price NUMERIC(18, 2) NOT NULL,
    discount_amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
    net_payable NUMERIC(18, 2) NOT NULL,
    total_paid NUMERIC(18, 2) NOT NULL DEFAULT 0,
    outstanding_balance NUMERIC(18, 2) GENERATED ALWAYS AS (net_payable - total_paid) STORED,
    endorsement_reason TEXT,
    marketing_expense_journal_id UUID,
    created_by_user_id UUID NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_booking_number UNIQUE (tenant_id, booking_number)
);

CREATE TRIGGER trg_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Trigger Sinkronisasi Kuota Pesawat & Held Seats
CREATE OR REPLACE FUNCTION fn_update_package_booked_seats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE packages 
        SET booked_seats = booked_seats + 1 
        WHERE package_id = NEW.package_id;

        UPDATE flight_allocations
        SET held_seats = held_seats + 1
        WHERE package_id = NEW.package_id;

    ELSIF TG_OP = 'UPDATE' AND NEW.status = 'CANCELLED' AND OLD.status <> 'CANCELLED' THEN
        UPDATE packages 
        SET booked_seats = GREATEST(booked_seats - 1, 0)
        WHERE package_id = NEW.package_id;

        UPDATE flight_allocations
        SET held_seats = GREATEST(held_seats - 1, 0)
        WHERE package_id = NEW.package_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_seats_on_booking
    AFTER INSERT OR UPDATE OF status ON bookings
    FOR EACH ROW EXECUTE FUNCTION fn_update_package_booked_seats();

-- ============================================================================
-- 3. MODUL OPERASIONAL LAPANGAN: CASH ADVANCE & E-LPJ
-- ============================================================================

-- 3.1 Pengajuan Dana Talangan Tour Leader / Muthawif (Cash Advances)
CREATE TABLE IF NOT EXISTS cash_advances (
    advance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    branch_id VARCHAR(50) NOT NULL,
    advance_number VARCHAR(100) NOT NULL,
    project_group_id VARCHAR(50) NOT NULL, -- Kloter / Manifest Rombongan
    recipient_user_id UUID NOT NULL REFERENCES users(user_id),
    recipient_role VARCHAR(50) NOT NULL CHECK (recipient_role IN ('MUTHAWIF', 'TOUR_LEADER', 'MUKIBIN')),
    currency_code VARCHAR(10) NOT NULL DEFAULT 'SAR',
    amount_valas NUMERIC(18, 2) NOT NULL,
    exchange_rate NUMERIC(18, 4) NOT NULL DEFAULT 4250.0,
    amount_idr_base NUMERIC(18, 2) GENERATED ALWAYS AS (amount_valas * exchange_rate) STORED,
    purpose TEXT NOT NULL,
    workflow_status VARCHAR(50) NOT NULL DEFAULT 'DRAFT_MAKER'
        CHECK (workflow_status IN ('DRAFT_MAKER', 'APPROVED', 'RELEASED', 'SETTLED')),
    approved_by UUID REFERENCES users(user_id),
    disbursed_by UUID REFERENCES users(user_id),
    disbursed_at TIMESTAMPTZ,
    journal_id UUID REFERENCES journal_masters(journal_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_advance_number UNIQUE (tenant_id, advance_number)
);

CREATE TRIGGER trg_cash_advances_updated_at
    BEFORE UPDATE ON cash_advances
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 3.2 Pertanggungjawaban Nota Lapangan Saudi (E-LPJ Struk Pengeluaran)
CREATE TABLE IF NOT EXISTS field_expense_claims (
    claim_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advance_id UUID NOT NULL REFERENCES cash_advances(advance_id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    expense_date DATE NOT NULL,
    expense_category VARCHAR(50) NOT NULL CHECK (expense_category IN (
        'EXTRA_CATERING_JEDDAH', 'TIPS_DRIVER_BUS_SAUDI', 'KURSI_RODA_THAWAF', 'OBAT_EMERGENCY_MAKKAH', 'SIM_CARD_CREW'
    )),
    description TEXT NOT NULL,
    amount_sar NUMERIC(18, 2) NOT NULL CHECK (amount_sar > 0),
    receipt_photo_url TEXT NOT NULL,
    verified_by_finance BOOLEAN NOT NULL DEFAULT FALSE,
    finance_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. ADMINISTRASI DOKUMEN & TRACKING SISKOPATUH
-- ============================================================================

CREATE TABLE IF NOT EXISTS jamaah_administrations (
    admin_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL UNIQUE REFERENCES bookings(booking_id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    workflow_stage VARCHAR(50) NOT NULL DEFAULT 'COLLECTED_BY_BRANCH' CHECK (workflow_stage IN (
        'COLLECTED_BY_BRANCH',    -- 1. Dokumen fisik dikumpulkan di Cabang
        'SENT_TO_HQ',             -- 2. Dikirim via kurir ekspedisi ke HQ
        'RECEIVED_BY_HQ',         -- 3. Diterima Tim Visa Kantor Pusat
        'BIOMETRIC_DONE',         -- 4. Rekam Biometrik Bio Visa Saudi selesai
        'SISKOPATUH_REGISTERED',  -- 5. Terdaftar di Siskopatuh Kemenag
        'VISA_ISSUED'             -- 6. Visa Umrah Elektronik Terbit
    )),
    passport_physical_location VARCHAR(100) NOT NULL DEFAULT 'CABANG_LOKAL',
    biometric_appointment_date DATE,
    siskopatuh_id VARCHAR(100),
    visa_number VARCHAR(100),
    visa_expiry_date DATE,
    notes TEXT,
    updated_by_user_id UUID REFERENCES users(user_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_jamaah_administrations_updated_at
    BEFORE UPDATE ON jamaah_administrations
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================================
-- 5. TABUNGAN UMRAH (ESCROW) & PEMBAYARAN INVOICE
-- ============================================================================

-- 5.1 Rekening Tabungan Escrow per Jamaah
CREATE TABLE IF NOT EXISTS saving_accounts (
    saving_account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    customer_id UUID NOT NULL UNIQUE REFERENCES customers(customer_id) ON DELETE RESTRICT,
    account_number VARCHAR(50) NOT NULL,
    current_balance NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (current_balance >= 0),
    target_amount NUMERIC(18, 2) NOT NULL DEFAULT 35000000,
    target_package_type VARCHAR(50) DEFAULT 'REGULER_9D',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'FROZEN', 'CLOSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_saving_acc_no UNIQUE (tenant_id, account_number)
);

CREATE TRIGGER trg_saving_accounts_updated_at
    BEFORE UPDATE ON saving_accounts
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 5.2 Mutasi Tabungan Escrow
CREATE TABLE IF NOT EXISTS saving_mutations (
    mutation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saving_account_id UUID NOT NULL REFERENCES saving_accounts(saving_account_id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    mutation_type VARCHAR(20) NOT NULL CHECK (mutation_type IN ('DEPOSIT', 'WITHDRAWAL', 'CONVERT_TO_BOOKING')),
    amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
    balance_after NUMERIC(18, 2) NOT NULL,
    reference_number VARCHAR(100) NOT NULL,
    payment_channel VARCHAR(50) NOT NULL DEFAULT 'BSI_VA',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5.3 Invoice & Pembayaran Tagihan Paket
CREATE TABLE IF NOT EXISTS invoices (
    invoice_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    invoice_type VARCHAR(50) NOT NULL CHECK (invoice_type IN ('DP_SEAT', 'PELUNASAN', 'BIAYA_UPGRADE_ROOM')),
    amount NUMERIC(18, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PAID', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_invoice_number UNIQUE (tenant_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    payment_number VARCHAR(100) NOT NULL,
    payment_date DATE NOT NULL,
    amount_paid NUMERIC(18, 2) NOT NULL CHECK (amount_paid > 0),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('BSI_VA', 'BANK_TRANSFER', 'QRIS', 'ESCROW_CONVERSION', 'CASH')),
    cashier_user_id UUID NOT NULL REFERENCES users(user_id),
    journal_id UUID REFERENCES journal_masters(journal_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_payment_number UNIQUE (tenant_id, payment_number)
);

-- Stored Procedure: Konversi Tabungan Escrow ke Pembayaran Paket
CREATE OR REPLACE PROCEDURE sp_convert_saving_to_booking_payment(
    p_customer_id UUID,
    p_booking_id UUID,
    p_amount NUMERIC(18, 2),
    p_user_id UUID
)
LANGUAGE plpgsql AS $$
DECLARE
    v_saving RECORD;
    v_booking RECORD;
    v_inv_id UUID;
    v_inv_no TEXT;
    v_pay_no TEXT;
    v_new_bal NUMERIC(18, 2);
BEGIN
    SELECT * INTO v_saving FROM saving_accounts WHERE customer_id = p_customer_id FOR UPDATE;
    IF NOT FOUND OR v_saving.current_balance < p_amount THEN
        RAISE EXCEPTION 'Saldo tabungan escrow tidak mencukupi untuk konversi pelunasan (Saldo: Rp %, Diminta: Rp %)',
            COALESCE(v_saving.current_balance, 0), p_amount;
    END IF;

    SELECT * INTO v_booking FROM bookings WHERE booking_id = p_booking_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking ID tidak valid!';
    END IF;

    v_new_bal := v_saving.current_balance - p_amount;
    UPDATE saving_accounts 
    SET current_balance = v_new_bal, updated_at = CURRENT_TIMESTAMP
    WHERE saving_account_id = v_saving.saving_account_id;

    -- Catat mutasi penarikan konversi
    INSERT INTO saving_mutations (
        saving_account_id, tenant_id, mutation_type, amount, balance_after, reference_number, payment_channel, notes
    ) VALUES (
        v_saving.saving_account_id, v_saving.tenant_id, 'CONVERT_TO_BOOKING', p_amount, v_new_bal,
        'CONV-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD-HH24MISS'), 'ESCROW_CONVERSION',
        'Konversi Saldo Tabungan ke Pelunasan Booking ' || v_booking.booking_number
    );

    -- Terbitkan invoice dan payment
    v_inv_no := 'INV-CONV/' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '/' || SUBSTRING(gen_random_uuid()::text, 1, 6);
    INSERT INTO invoices (tenant_id, booking_id, invoice_number, invoice_date, due_date, invoice_type, amount, status)
    VALUES (v_booking.tenant_id, p_booking_id, v_inv_no, CURRENT_DATE, CURRENT_DATE, 'PELUNASAN', p_amount, 'PAID')
    RETURNING invoice_id INTO v_inv_id;

    v_pay_no := 'PAY-CONV/' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '/' || SUBSTRING(gen_random_uuid()::text, 1, 6);
    INSERT INTO payments (tenant_id, invoice_id, booking_id, payment_number, payment_date, amount_paid, payment_method, cashier_user_id)
    VALUES (v_booking.tenant_id, v_inv_id, p_booking_id, v_pay_no, CURRENT_DATE, p_amount, 'ESCROW_CONVERSION', p_user_id);

    -- Update akumulasi pembayaran pada booking
    UPDATE bookings
    SET total_paid = total_paid + p_amount,
        status = CASE WHEN (net_payable - (total_paid + p_amount)) <= 0 THEN 'FULLY_PAID' ELSE 'DP_PAID' END
    WHERE booking_id = p_booking_id;
END;
$$;

-- ============================================================================
-- 6. MODUL PEMBATALAN & REFUND BOOKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS booking_cancellations (
    cancellation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    booking_id UUID NOT NULL UNIQUE REFERENCES bookings(booking_id) ON DELETE RESTRICT,
    cancellation_number VARCHAR(100) NOT NULL,
    cancellation_date DATE NOT NULL,
    reason TEXT NOT NULL,
    total_paid_initial NUMERIC(18, 2) NOT NULL,
    penalty_fee NUMERIC(18, 2) NOT NULL DEFAULT 0, -- Biaya pembatalan tiket/hotel hangus
    refund_amount NUMERIC(18, 2) GENERATED ALWAYS AS (total_paid_initial - penalty_fee) STORED,
    refund_status VARCHAR(50) NOT NULL DEFAULT 'DRAFT_MAKER'
        CHECK (refund_status IN ('DRAFT_MAKER', 'APPROVED', 'RELEASED')),
    requested_by_user_id UUID NOT NULL REFERENCES users(user_id),
    approved_by_user_id UUID REFERENCES users(user_id),
    disbursed_at TIMESTAMPTZ,
    journal_id UUID REFERENCES journal_masters(journal_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_booking_cancellations_updated_at
    BEFORE UPDATE ON booking_cancellations
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================================
-- 7. PORTAL JAMAAH (MANASIK TICKET QR, ROOMMATES & SUPER VIEW)
-- ============================================================================

-- 7.1 Tabel Dokumen Mandiri Jamaah (Customer Documents)
CREATE TABLE IF NOT EXISTS customer_documents (
    doc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    doc_type VARCHAR(50) NOT NULL CHECK (doc_type IN ('PASPOR', 'VAKSIN_MENINGITIS', 'KTP', 'BUKU_NIKAH', 'FOTO_LATAR_PUTIH')),
    file_url TEXT NOT NULL,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    verification_notes TEXT,
    verified_by UUID REFERENCES users(user_id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7.2 Event Manasik & Tiket QR Absensi
CREATE TABLE IF NOT EXISTS manasik_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    branch_id VARCHAR(50) NOT NULL,
    event_title VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    location_hall VARCHAR(255) NOT NULL,
    speaker_name VARCHAR(100) NOT NULL,
    google_calendar_event_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS manasik_attendances (
    attendance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES manasik_events(event_id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    qr_ticket_code VARCHAR(100) NOT NULL,
    is_present BOOLEAN NOT NULL DEFAULT FALSE,
    scanned_at TIMESTAMPTZ,
    scanned_by_user_id UUID REFERENCES users(user_id),
    souvenir_snack_collected BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_event_booking UNIQUE (event_id, booking_id)
);

-- 7.3 Alokasi Teman Sekamar (Roommates) di Saudi
CREATE TABLE IF NOT EXISTS roommates_allocations (
    allocation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES packages(package_id) ON DELETE CASCADE,
    city VARCHAR(50) NOT NULL CHECK (city IN ('MAKKAH', 'MADINAH')),
    hotel_name VARCHAR(100) NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    room_type VARCHAR(20) NOT NULL CHECK (room_type IN ('QUAD', 'TRIPLE', 'DOUBLE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7.4 Galeri Digital Rombongan (Group Galleries)
CREATE TABLE IF NOT EXISTS group_galleries (
    gallery_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    project_group_id VARCHAR(50) NOT NULL,
    photo_title VARCHAR(255) NOT NULL,
    photo_url TEXT NOT NULL,
    location_tag VARCHAR(100), -- Masjidil Haram, Raudhah, Jabal Uhud
    uploaded_by UUID REFERENCES users(user_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7.5 SQL View: v_jamaah_dashboard (Super View Companion Portal Jamaah)
CREATE OR REPLACE VIEW v_jamaah_dashboard AS
SELECT 
    c.customer_id,
    c.user_id,
    c.tenant_id,
    c.full_name,
    c.nik,
    c.passport_number,
    c.passport_expiry,
    c.siskopatuh_qr_code,
    c.jacket_size,
    c.blood_type,
    b.booking_id,
    b.booking_number,
    b.status AS booking_status,
    b.booking_type,
    b.room_type,
    b.net_payable,
    b.total_paid,
    b.outstanding_balance,
    p.package_id,
    p.package_code,
    p.package_name,
    p.departure_date,
    p.return_date,
    p.hotel_makkah,
    p.hotel_madinah,
    p.airline_name,
    ja.workflow_stage AS visa_admin_stage,
    ja.visa_number,
    m.full_name AS muthawif_name,
    m.phone_number AS muthawif_phone,
    m.profile_photo_url AS muthawif_photo,
    muk.full_name AS mukibin_name,
    muk.phone_number AS mukibin_phone,
    muk.profile_photo_url AS mukibin_photo,
    sa.current_balance AS escrow_saving_balance,
    ma.qr_ticket_code AS manasik_qr_code,
    ma.is_present AS manasik_attendance_status
FROM customers c
JOIN bookings b ON c.customer_id = b.customer_id
JOIN packages p ON b.package_id = p.package_id
LEFT JOIN jamaah_administrations ja ON b.booking_id = ja.booking_id
LEFT JOIN saving_accounts sa ON c.customer_id = sa.customer_id
LEFT JOIN manasik_attendances ma ON b.booking_id = ma.booking_id
LEFT JOIN users m ON m.role_codes @> ARRAY['MUTHAWIF']::varchar[] AND m.tenant_id = c.tenant_id
LEFT JOIN users muk ON muk.role_codes @> ARRAY['MUKIBIN']::varchar[] AND muk.tenant_id = c.tenant_id;
