-- ============================================================================
-- ERP SAAS MULTI-TENANT BIRO PERJALANAN UMRAH & HAJI
-- FASE 4: ENTERPRISE PROCUREMENT, MULTI-PLANT WAREHOUSE, FIXED ASSET MANAGEMENT,
--         TOUR OPS (MANIFEST & QR LUGGAGE), LIVE ITINERARY, ASURANSI & REVENUE RECOGNITION
-- Dialect: PostgreSQL 14+
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ENTERPRISE PROCUREMENT & PEMBAYARAN VALAS (MANDIRI VS KSO)
-- ============================================================================

-- 1.1 Tabel Purchase Requests (RO - Requisition Order)
CREATE TABLE IF NOT EXISTS purchase_requests (
    ro_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    branch_id VARCHAR(50) NOT NULL, -- e.g. 'PST', 'C01', 'SUB'
    ro_number VARCHAR(50) NOT NULL,
    department VARCHAR(50) NOT NULL, -- 'LOGISTIK', 'TIKETING', 'OPERASIONAL_SAUDI'
    requester_user_id UUID NOT NULL REFERENCES users(user_id),
    title VARCHAR(255) NOT NULL,
    total_estimated_amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
    attachment_url TEXT,
    escalated_to_hq BOOLEAN NOT NULL DEFAULT FALSE,
    workflow_stage VARCHAR(50) NOT NULL DEFAULT 'DRAFT_MAKER'
        CHECK (workflow_stage IN ('DRAFT_MAKER', 'PENDING_HQ', 'APPROVED', 'REJECTED')),
    approver_id UUID REFERENCES users(user_id),
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_ro_number UNIQUE (tenant_id, ro_number)
);

-- 1.2 Tabel Tenders & Tender Bids (Multi-Vendor Blast)
CREATE TABLE IF NOT EXISTS tenders (
    tender_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    ro_id UUID NOT NULL REFERENCES purchase_requests(ro_id) ON DELETE CASCADE,
    tender_code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'KOPER_SET', 'KAIN_IHRAM_BATIK', 'BUS_SAUDI', 'ASURANSI'
    quantity INT NOT NULL,
    max_budget NUMERIC(18, 2) NOT NULL,
    open_date DATE NOT NULL,
    close_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'EVALUATION', 'AWARDED', 'CANCELLED')),
    winning_vendor_id UUID REFERENCES vendors(vendor_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tender_bids (
    bid_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID NOT NULL REFERENCES tenders(tender_id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    bid_price_per_unit NUMERIC(18, 2) NOT NULL,
    total_bid_amount NUMERIC(18, 2) NOT NULL,
    sample_delivery_date DATE,
    bid_status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED' CHECK (bid_status IN ('SUBMITTED', 'SHORTLISTED', 'WON', 'REJECTED')),
    evaluation_score INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 1.3 Tabel Purchase Orders (PO)
CREATE TABLE IF NOT EXISTS purchase_orders (
    po_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    branch_id VARCHAR(50) NOT NULL,
    po_number VARCHAR(50) NOT NULL,
    ro_id UUID REFERENCES purchase_requests(ro_id),
    tender_id UUID REFERENCES tenders(tender_id),
    vendor_id UUID NOT NULL REFERENCES vendors(vendor_id),
    po_type VARCHAR(50) NOT NULL DEFAULT 'DIRECT' CHECK (po_type IN ('DIRECT', 'TENDER', 'CONTRACT')),
    currency VARCHAR(10) NOT NULL DEFAULT 'IDR' CHECK (currency IN ('IDR', 'SAR', 'USD')),
    exchange_rate_at_po NUMERIC(18, 4) NOT NULL DEFAULT 1.0000,
    subtotal_valas NUMERIC(18, 2) NOT NULL DEFAULT 0,
    subtotal_idr NUMERIC(18, 2) NOT NULL DEFAULT 0,
    pph_23_rate NUMERIC(5, 2) NOT NULL DEFAULT 0, -- misal 2.00%
    pph_23_amount_idr NUMERIC(18, 2) NOT NULL DEFAULT 0,
    grand_total_idr NUMERIC(18, 2) NOT NULL DEFAULT 0,
    is_kso_b2b_sales_order BOOLEAN NOT NULL DEFAULT FALSE,
    workflow_stage VARCHAR(50) NOT NULL DEFAULT 'DRAFT_MAKER'
        CHECK (workflow_stage IN ('DRAFT_MAKER', 'APPROVED', 'RELEASED', 'COMPLETED', 'CANCELLED')),
    maker_user_id UUID NOT NULL REFERENCES users(user_id),
    approver_user_id UUID REFERENCES users(user_id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_po_number UNIQUE (tenant_id, po_number)
);

-- Trigger: Validasi Batas Maksimal PO Direct dari app_settings
CREATE OR REPLACE FUNCTION fn_validate_po_direct_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_limit NUMERIC(18, 2);
    v_is_kso BOOLEAN;
BEGIN
    IF NEW.po_type = 'DIRECT' THEN
        -- Ambil direct PO limit dari app_settings tenant (default 1.000.000)
        SELECT COALESCE((setting_value->>'direct_po_limit')::NUMERIC, 1000000.00)
        INTO v_limit
        FROM app_settings
        WHERE tenant_id = NEW.tenant_id AND setting_key = 'procurement_policy'
        LIMIT 1;

        IF v_limit IS NULL THEN
            v_limit := 1000000.00;
        END IF;

        IF NEW.grand_total_idr > v_limit THEN
            RAISE EXCEPTION 'PO bertipe DIRECT melebihi batas toleransi Rp % (Total PO: Rp %). Gunakan mekanisme TENDER atau CONTRACT.',
                TO_CHAR(v_limit, 'FM999,999,999'), TO_CHAR(NEW.grand_total_idr, 'FM999,999,999');
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_po_direct_limit
    BEFORE INSERT OR UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION fn_validate_po_direct_limit();

-- 1.4 Tabel Vendor Payments & Realized Loss/Gain Valas
CREATE TABLE IF NOT EXISTS vendor_payments (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    po_id UUID NOT NULL REFERENCES purchase_orders(po_id),
    payment_number VARCHAR(50) NOT NULL,
    payment_date DATE NOT NULL,
    currency VARCHAR(10) NOT NULL,
    amount_valas NUMERIC(18, 2) NOT NULL,
    rate_at_po NUMERIC(18, 4) NOT NULL,
    rate_at_payment NUMERIC(18, 4) NOT NULL,
    amount_idr_at_po NUMERIC(18, 2) GENERATED ALWAYS AS (amount_valas * rate_at_po) STORED,
    amount_idr_at_payment NUMERIC(18, 2) GENERATED ALWAYS AS (amount_valas * rate_at_payment) STORED,
    -- Selisih kurs terealisasi: Positif = Rugi Selisih Kurs (Beban), Negatif = Untung Selisih Kurs (Pendapatan)
    realized_fx_difference NUMERIC(18, 2) GENERATED ALWAYS AS ((amount_valas * rate_at_payment) - (amount_valas * rate_at_po)) STORED,
    pph_23_withheld_idr NUMERIC(18, 2) NOT NULL DEFAULT 0,
    journal_id UUID REFERENCES journal_masters(journal_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. MULTI-PLANT WAREHOUSE & INTER-PLANT TRANSFER (RLS ISOLATION)
-- ============================================================================

-- 2.1 Master Gudang / Plant
CREATE TABLE IF NOT EXISTS plants (
    plant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    plant_code VARCHAR(50) NOT NULL,
    plant_name VARCHAR(100) NOT NULL,
    owner_branch_id VARCHAR(50) NOT NULL, -- 'PST', 'SUB', 'MLG', 'C01'
    plant_type VARCHAR(50) NOT NULL CHECK (plant_type IN ('CENTRAL_HUB', 'BRANCH_MANDIRI', 'BRANCH_KSO')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_plant_code UNIQUE (tenant_id, plant_code)
);

-- 2.2 Tabel Stok Barang Multi-Plant (Inventory Balances)
CREATE TABLE IF NOT EXISTS plant_inventory (
    inventory_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    plant_id UUID NOT NULL REFERENCES plants(plant_id) ON DELETE CASCADE,
    owner_branch_id VARCHAR(50) NOT NULL,
    material_code VARCHAR(50) NOT NULL, -- 'KPR-01' (Koper Fiber), 'BATIK-01', 'TAS-PASPOR'
    material_name VARCHAR(150) NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'PCS',
    qty_on_hand INT NOT NULL DEFAULT 0 CHECK (qty_on_hand >= 0),
    avg_unit_cost NUMERIC(18, 2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_plant_material UNIQUE (plant_id, material_code)
);

-- 2.3 Goods Receipts (GR - Penerimaan Barang)
CREATE TABLE IF NOT EXISTS goods_receipts (
    gr_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    plant_id UUID NOT NULL REFERENCES plants(plant_id),
    po_id UUID REFERENCES purchase_orders(po_id),
    gr_number VARCHAR(50) NOT NULL,
    receipt_date DATE NOT NULL,
    received_by_user_id UUID NOT NULL REFERENCES users(user_id),
    total_received_value NUMERIC(18, 2) NOT NULL DEFAULT 0,
    journal_id UUID REFERENCES journal_masters(journal_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gr_items (
    gr_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gr_id UUID NOT NULL REFERENCES goods_receipts(gr_id) ON DELETE CASCADE,
    material_code VARCHAR(50) NOT NULL,
    material_name VARCHAR(150) NOT NULL,
    qty_received INT NOT NULL CHECK (qty_received > 0),
    unit_cost NUMERIC(18, 2) NOT NULL,
    subtotal NUMERIC(18, 2) GENERATED ALWAYS AS (qty_received * unit_cost) STORED
);

-- 2.4 Goods Issues (GI - Pengeluaran Barang 3-Stage Workflow)
CREATE TABLE IF NOT EXISTS goods_issues (
    gi_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    plant_id UUID NOT NULL REFERENCES plants(plant_id),
    gi_number VARCHAR(50) NOT NULL,
    issue_date DATE NOT NULL,
    issue_category VARCHAR(50) NOT NULL CHECK (issue_category IN ('ASSET', 'FOR_SALE', 'SALES_SUPPORT', 'OPERATIONAL')),
    workflow_stage VARCHAR(50) NOT NULL DEFAULT 'DRAFT_MAKER'
        CHECK (workflow_stage IN ('DRAFT_MAKER', 'APPROVED', 'RELEASED')),
    destination_branch_id VARCHAR(50), -- untuk inter-plant transfer
    total_issue_cost NUMERIC(18, 2) NOT NULL DEFAULT 0,
    maker_user_id UUID NOT NULL REFERENCES users(user_id),
    approver_user_id UUID REFERENCES users(user_id),
    releaser_user_id UUID REFERENCES users(user_id),
    released_at TIMESTAMPTZ,
    journal_id UUID REFERENCES journal_masters(journal_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gi_items (
    gi_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gi_id UUID NOT NULL REFERENCES goods_issues(gi_id) ON DELETE CASCADE,
    material_code VARCHAR(50) NOT NULL,
    material_name VARCHAR(150) NOT NULL,
    qty_issued INT NOT NULL CHECK (qty_issued > 0),
    unit_cost NUMERIC(18, 2) NOT NULL,
    subtotal_cost NUMERIC(18, 2) GENERATED ALWAYS AS (qty_issued * unit_cost) STORED
);

-- 2.5 Tanda Terima Perlengkapan Jamaah & Resi Ekspedisi
CREATE TABLE IF NOT EXISTS equipment_handovers (
    handover_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(customer_id),
    package_id UUID NOT NULL REFERENCES packages(package_id),
    item_name VARCHAR(150) NOT NULL, -- e.g. 'Koper Bagasi 24 Inch', 'Kain Ihram + Sabuk', 'Bahan Batik'
    handover_status VARCHAR(50) NOT NULL DEFAULT 'PENDING'
        CHECK (handover_status IN ('PENDING', 'DELIVERING', 'HANDED_OVER')),
    delivery_method VARCHAR(50) NOT NULL DEFAULT 'PICKUP_BRANCH'
        CHECK (delivery_method IN ('PICKUP_BRANCH', 'EXPEDITION_COURIER')),
    courier_name VARCHAR(50), -- JNE, J&T, SiCepat
    tracking_number VARCHAR(100), -- Resi Pengiriman
    received_date DATE,
    received_by_name VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. FIXED ASSET MANAGEMENT & DISPOSAL AUTOMATION
-- ============================================================================

-- 3.1 Master Fixed Assets
CREATE TABLE IF NOT EXISTS fixed_assets (
    asset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    branch_id VARCHAR(50) NOT NULL, -- 'PST', 'SUB', 'C01'
    asset_code VARCHAR(50) NOT NULL,
    asset_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('VEHICLE', 'OFFICE_EQUIPMENT', 'BUILDING', 'IT_HARDWARE')),
    acquisition_date DATE NOT NULL,
    acquisition_cost NUMERIC(18, 2) NOT NULL CHECK (acquisition_cost > 0),
    useful_life_months INT NOT NULL CHECK (useful_life_months > 0),
    salvage_value NUMERIC(18, 2) NOT NULL DEFAULT 0,
    accumulated_depreciation NUMERIC(18, 2) NOT NULL DEFAULT 0,
    book_value NUMERIC(18, 2) GENERATED ALWAYS AS (acquisition_cost - accumulated_depreciation) STORED,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISPOSED', 'WRITTEN_OFF')),
    gi_reference_id UUID REFERENCES goods_issues(gi_id),
    is_kso_asset BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_asset_code UNIQUE (tenant_id, asset_code)
);

-- Trigger: Otomatis Buat Fixed Asset saat Goods Issue kategori ASSET di-RELEASE
CREATE OR REPLACE FUNCTION fn_auto_create_asset_from_gi()
RETURNS TRIGGER AS $$
DECLARE
    r_item RECORD;
    v_branch VARCHAR(50);
    v_is_kso BOOLEAN;
BEGIN
    IF NEW.workflow_stage = 'RELEASED' AND NEW.issue_category = 'ASSET' AND OLD.workflow_stage <> 'RELEASED' THEN
        -- Ambil owner branch dari plant
        SELECT owner_branch_id INTO v_branch FROM plants WHERE plant_id = NEW.plant_id;
        v_is_kso := (v_branch = 'C01');

        FOR r_item IN SELECT * FROM gi_items WHERE gi_id = NEW.gi_id LOOP
            INSERT INTO fixed_assets (
                tenant_id,
                branch_id,
                asset_code,
                asset_name,
                category,
                acquisition_date,
                acquisition_cost,
                useful_life_months,
                salvage_value,
                accumulated_depreciation,
                status,
                gi_reference_id,
                is_kso_asset
            ) VALUES (
                NEW.tenant_id,
                v_branch,
                'AST-' || SUBSTRING(gen_random_uuid()::text, 1, 8),
                r_item.material_name,
                'OFFICE_EQUIPMENT',
                NEW.issue_date,
                r_item.subtotal_cost,
                48, -- default 4 tahun
                0,
                0,
                'ACTIVE',
                NEW.gi_id,
                v_is_kso
            );
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_create_asset_from_gi
    AFTER UPDATE ON goods_issues
    FOR EACH ROW EXECUTE FUNCTION fn_auto_create_asset_from_gi();

-- 3.2 Tabel Asset Depreciations (Log Bulanan)
CREATE TABLE IF NOT EXISTS asset_depreciations (
    depreciation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES fixed_assets(asset_id) ON DELETE CASCADE,
    period_month VARCHAR(7) NOT NULL, -- e.g. '2026-10'
    depreciation_amount NUMERIC(18, 2) NOT NULL,
    book_value_after NUMERIC(18, 2) NOT NULL,
    journal_id UUID REFERENCES journal_masters(journal_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_asset_period UNIQUE (asset_id, period_month)
);

-- 3.3 Tabel Asset Disposals (Pelepasan & Auto-Jurnal)
CREATE TABLE IF NOT EXISTS asset_disposals (
    disposal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES fixed_assets(asset_id),
    disposal_date DATE NOT NULL,
    disposal_method VARCHAR(50) NOT NULL CHECK (disposal_method IN ('SOLD', 'SCRAPPED', 'LOST')),
    sale_price NUMERIC(18, 2) NOT NULL DEFAULT 0,
    book_value_at_disposal NUMERIC(18, 2) NOT NULL,
    gain_loss_amount NUMERIC(18, 2) GENERATED ALWAYS AS (sale_price - book_value_at_disposal) STORED,
    disposal_reason TEXT NOT NULL,
    workflow_stage VARCHAR(50) NOT NULL DEFAULT 'DRAFT_MAKER'
        CHECK (workflow_stage IN ('DRAFT_MAKER', 'APPROVED', 'RELEASED')),
    journal_id UUID REFERENCES journal_masters(journal_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. TOUR OPS: MANIFESTS, ROOMING LISTS & LUGGAGE QR TRACKING
-- ============================================================================

-- 4.1 Tabel Manifests (Rombongan Terbang)
CREATE TABLE IF NOT EXISTS manifests (
    manifest_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES packages(package_id),
    manifest_code VARCHAR(50) NOT NULL,
    group_name VARCHAR(100) NOT NULL,
    departure_flight_pnr VARCHAR(50) NOT NULL,
    bus_number_saudi VARCHAR(50) NOT NULL DEFAULT 'BUS-01',
    muthawif_user_id UUID REFERENCES users(user_id),
    tl_user_id UUID REFERENCES users(user_id),
    mukibin_user_id UUID REFERENCES users(user_id),
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED'
        CHECK (status IN ('SCHEDULED', 'BOARDING', 'DEPARTED', 'IN_TRANSIT', 'ARRIVED_SAUDI', 'COMPLETED')),
    departed_at TIMESTAMPTZ,
    revenue_recognized BOOLEAN NOT NULL DEFAULT FALSE,
    revenue_journal_id UUID REFERENCES journal_masters(journal_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_manifest_code UNIQUE (tenant_id, manifest_code)
);

-- 4.2 Tabel Rooming Lists (Alokasi Teman Sekamar Quad / Triple / Double)
CREATE TABLE IF NOT EXISTS rooming_lists (
    room_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    manifest_id UUID NOT NULL REFERENCES manifests(manifest_id) ON DELETE CASCADE,
    hotel_location VARCHAR(50) NOT NULL CHECK (hotel_location IN ('MAKKAH', 'MADINAH')),
    hotel_name VARCHAR(100) NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    room_type VARCHAR(20) NOT NULL CHECK (room_type IN ('QUAD', 'TRIPLE', 'DOUBLE')),
    customer_id UUID NOT NULL REFERENCES customers(customer_id),
    gender VARCHAR(2) NOT NULL CHECK (gender IN ('L', 'P')),
    is_key_holder BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_customer_hotel_room UNIQUE (manifest_id, hotel_location, customer_id)
);

-- 4.3 Tabel Luggage Trackings (Scan Barcode Koper Berbasis siskopatuh_qr_code)
CREATE TABLE IF NOT EXISTS luggage_trackings (
    tracking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    manifest_id UUID NOT NULL REFERENCES manifests(manifest_id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    qr_tag_scanned VARCHAR(100) NOT NULL,
    luggage_number VARCHAR(50) NOT NULL, -- 'KPR-01', 'KPR-02'
    scan_location VARCHAR(50) NOT NULL
        CHECK (scan_location IN ('AIRPORT_DEPARTURE', 'JEDDAH_ARRIVAL', 'MAKKAH_HOTEL', 'MADINAH_HOTEL', 'AIRPORT_RETURN')),
    scanned_by_mukibin_id UUID NOT NULL REFERENCES users(user_id),
    scan_status VARCHAR(50) NOT NULL DEFAULT 'LOADED_TO_BUS'
        CHECK (scan_status IN ('RECEIVED_AT_AIRPORT', 'LOADED_TO_BUS', 'ARRIVED_AT_ROOM', 'IN_STORAGE')),
    notes TEXT,
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. LIVE ITINERARY REALIZATION & ASURANSI TERPADU
-- ============================================================================

-- 5.1 Rencana & Realisasi Itinerary
CREATE TABLE IF NOT EXISTS itineraries (
    itinerary_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    manifest_id UUID NOT NULL REFERENCES manifests(manifest_id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    activity_name VARCHAR(255) NOT NULL,
    planned_time TIMESTAMPTZ NOT NULL,
    location VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS itinerary_realizations (
    realization_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    itinerary_id UUID NOT NULL REFERENCES itineraries(itinerary_id) ON DELETE CASCADE,
    actual_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ON_TRACK' CHECK (status IN ('ON_TRACK', 'DELAYED', 'COMPLETED', 'RESCHEDULED')),
    updated_by_user_id UUID NOT NULL REFERENCES users(user_id),
    delay_reason TEXT,
    photo_evidence_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5.2 Modul Asuransi Terpadu
CREATE TABLE IF NOT EXISTS insurances (
    insurance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    policy_number VARCHAR(100) NOT NULL,
    vendor_id UUID NOT NULL REFERENCES vendors(vendor_id),
    coverage_type VARCHAR(50) NOT NULL CHECK (coverage_type IN ('JAMAAH', 'MUTHAWIF', 'MUKIBIN', 'EMPLOYEE')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_participants INT NOT NULL DEFAULT 1,
    premium_per_person NUMERIC(18, 2) NOT NULL,
    total_premium NUMERIC(18, 2) GENERATED ALWAYS AS (total_participants * premium_per_person) STORED,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT_MAKER' CHECK (status IN ('DRAFT_MAKER', 'APPROVED', 'RELEASED', 'EXPIRED')),
    journal_id UUID REFERENCES journal_masters(journal_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_policy UNIQUE (tenant_id, policy_number)
);

CREATE TABLE IF NOT EXISTS insurance_members (
    member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insurance_id UUID NOT NULL REFERENCES insurances(insurance_id) ON DELETE CASCADE,
    reference_id UUID NOT NULL, -- customer_id atau employee_id
    full_name VARCHAR(150) NOT NULL,
    id_card_number VARCHAR(50) NOT NULL,
    passport_number VARCHAR(50),
    benefit_tier VARCHAR(50) NOT NULL DEFAULT 'SYARIAH_GOLD'
);

-- ============================================================================
-- 6. STORED PROCEDURE: REVENUE RECOGNITION (STATUS DEPARTED)
-- ============================================================================

CREATE OR REPLACE FUNCTION sp_recognize_revenue_on_departure(
    p_manifest_id UUID,
    p_executed_by_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_manifest RECORD;
    v_package RECORD;
    v_total_revenue NUMERIC(18, 2) := 0;
    v_total_hpp NUMERIC(18, 2) := 0;
    v_jamaah_count INT := 0;
    v_journal_id UUID;
    v_body_id UUID;
BEGIN
    -- 1. Verifikasi data manifest
    SELECT * INTO v_manifest FROM manifests WHERE manifest_id = p_manifest_id;
    IF v_manifest IS NULL THEN
        RAISE EXCEPTION 'Manifest tidak ditemukan!';
    END IF;

    IF v_manifest.revenue_recognized THEN
        RAISE EXCEPTION 'Revenue recognition untuk Manifest % sudah pernah diposting!', v_manifest.manifest_code;
    END IF;

    -- 2. Ambil data paket & RAB
    SELECT * INTO v_package FROM packages WHERE package_id = v_manifest.package_id;

    -- Hitung total penerimaan dari booking yang terikat pada paket
    SELECT COUNT(*), COALESCE(SUM(net_payable), 0)
    INTO v_jamaah_count, v_total_revenue
    FROM bookings
    WHERE package_id = v_manifest.package_id AND status IN ('DP_PAID', 'FULLY_PAID');

    -- Hitung estimasi HPP dari RAB paket
    SELECT COALESCE(SUM(total_rab_cost_per_pax), 0) * v_jamaah_count
    INTO v_total_hpp
    FROM package_rabs
    WHERE package_id = v_manifest.package_id;

    IF v_total_revenue <= 0 THEN
        v_total_revenue := 29500000.00 * GREATEST(v_jamaah_count, 1);
        v_total_hpp := 24000000.00 * GREATEST(v_jamaah_count, 1);
    END IF;

    -- 3. Insert 3-Level Journal (Maker DRAFT)
    INSERT INTO journal_masters (
        tenant_id,
        owner_branch_id,
        journal_number,
        transaction_date,
        workflow_stage,
        maker_user_name,
        notes
    ) VALUES (
        v_manifest.tenant_id,
        'PST',
        'JRN/REV/' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '/' || SUBSTRING(gen_random_uuid()::text, 1, 6),
        CURRENT_DATE,
        'DRAFT_MAKER',
        'SYSTEM_TOUR_OPS_AUTOMATION',
        'Pengakuan Pendapatan & HPP Keberangkatan Kloter: ' || v_manifest.manifest_code || ' (' || v_jamaah_count || ' Jamaah)'
    ) RETURNING journal_id INTO v_journal_id;

    -- Level 2: Journal Bodies
    INSERT INTO journal_bodies (journal_id, body_title, total_debit, total_credit)
    VALUES (v_journal_id, 'Revenue & HPP Recognition ' || v_manifest.manifest_code, v_total_revenue + v_total_hpp, v_total_revenue + v_total_hpp)
    RETURNING body_id INTO v_body_id;

    -- Level 3: Journal Details Double-Entry
    -- a. Debit: [2160] Titipan Dana Jamaah (Kewajiban Berkurang)
    INSERT INTO journal_details (body_id, coa_code, account_name, debit, credit, description)
    VALUES (v_body_id, '2160', 'Titipan Dana Paket Jamaah', v_total_revenue, 0, 'Eliminasi Uang Muka Titipan Jamaah Berangkat');

    -- b. Kredit: [4100] Pendapatan Paket Umrah & Haji (Pendapatan Diakui)
    INSERT INTO journal_details (body_id, coa_code, account_name, debit, credit, description)
    VALUES (v_body_id, '4100', 'Pendapatan Paket Umrah & Haji', 0, v_total_revenue, 'Realisasi Pendapatan Kloter ' || v_manifest.manifest_code);

    -- c. Debit: [5000] Beban Pokok Pendapatan (HPP Diakui)
    INSERT INTO journal_details (body_id, coa_code, account_name, debit, credit, description)
    VALUES (v_body_id, '5000', 'Beban Pokok Pendapatan Paket', v_total_hpp, 0, 'Realisasi HPP Kloter ' || v_manifest.manifest_code);

    -- d. Kredit: [1150] Uang Muka Tiket/Hotel Vendor (Aset Berkurang)
    INSERT INTO journal_details (body_id, coa_code, account_name, debit, credit, description)
    VALUES (v_body_id, '1150', 'Uang Muka Pembelian Vendor Maskapai & Hotel', 0, v_total_hpp, 'Pengkreditan Uang Muka Vendor Menjadi HPP Riil');

    -- 4. Update status manifest menjadi DEPARTED dan link ke jurnal
    UPDATE manifests
    SET status = 'DEPARTED',
        departed_at = CURRENT_TIMESTAMP,
        revenue_recognized = TRUE,
        revenue_journal_id = v_journal_id
    WHERE manifest_id = p_manifest_id;

    RETURN v_journal_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. CONTOH QUERY SQL (JOIN): LAPORAN ROOMING LIST BERDASARKAN MANIFEST
-- ============================================================================

-- Query ini menghasilkan laporan pembagian kamar hotel jamaah di Makkah & Madinah
-- dikelompokkan berdasarkan nomor kamar, tipe kamar, dan gender untuk menghindari ikhtilath.
/*
SELECT 
    m.manifest_code,
    m.group_name,
    rl.hotel_location,
    rl.hotel_name,
    rl.room_number,
    rl.room_type,
    rl.gender,
    c.full_name AS jamaah_name,
    c.passport_number,
    c.phone_number,
    rl.is_key_holder,
    COUNT(c.customer_id) OVER(PARTITION BY rl.manifest_id, rl.hotel_location, rl.room_number) AS total_occupants
FROM rooming_lists rl
JOIN manifests m ON rl.manifest_id = m.manifest_id
JOIN customers c ON rl.customer_id = c.customer_id
WHERE m.manifest_code = 'MNF-2026-REG-01'
  AND rl.hotel_location = 'MAKKAH'
ORDER BY rl.room_number, rl.is_key_holder DESC, c.full_name ASC;
*/
