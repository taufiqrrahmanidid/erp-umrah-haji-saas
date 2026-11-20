-- =================================================================================================
-- SISTEM INFORMASI ENTERPRISE RESOURCE PLANNING (ERP) SAAS BIRO PERJALANAN UMRAH & HAJI KHUSUS
-- SKEMA BASIS DATA POSTGRESQL & LOGIKA BISNIS: FASE 7 (ADVANCED CRM, B2B PROVIDER VISA,
-- LOGISTIK PASCA-TRIP, THEMING, SURAT DINAMIS, & INTEGRASI GOOGLE CALENDAR)
-- =================================================================================================

-- -------------------------------------------------------------------------------------------------
-- 1. PERLUASAN THEMING & GOOGLE CALENDAR MULTI-CABANG (JSONB CONFIGURATION)
-- -------------------------------------------------------------------------------------------------

-- Tabel konfigurasi pengaturan aplikasi per cabang (HQ, Mandiri, KSO, Sub-KSO)
CREATE TABLE IF NOT EXISTS branch_settings_config (
    config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    branch_id VARCHAR(50) NOT NULL REFERENCES branches(branch_id) ON DELETE CASCADE,
    
    -- 1. Visual Theming JSONB
    ui_theme_config JSONB NOT NULL DEFAULT '{
        "primary_color": "#059669",
        "secondary_color": "#0d9488",
        "accent_color": "#d97706",
        "dark_mode": true,
        "login_bg_url": "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1920&q=80",
        "dashboard_bg_url": "https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?auto=format&fit=crop&w=1920&q=80",
        "logo_url": "/assets/brand-logo.svg",
        "company_watermark": "PT AL-HARAMAIN TOUR & TRAVEL"
    }'::jsonb,

    -- 2. Google Calendar OAuth & Sync Config JSONB (Terisolasi per Cabang)
    google_calendar_config JSONB NOT NULL DEFAULT '{
        "is_enabled": true,
        "calendar_id": "primary",
        "oauth_client_id": "gcal_client_saas_9812",
        "oauth_access_token": "ya29.a0AfH6SM...",
        "oauth_refresh_token": "1//04...",
        "token_expires_at": "2026-12-31T23:59:59Z",
        "auto_sync_letters": true,
        "auto_sync_manasik": true,
        "auto_sync_departures": true
    }'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_branch_settings UNIQUE (tenant_id, branch_id)
);

CREATE INDEX IF NOT EXISTS idx_branch_settings_tenant_branch ON branch_settings_config(tenant_id, branch_id);

-- -------------------------------------------------------------------------------------------------
-- 2. MODUL SURAT KELUAR DINAMIS & PUSH INTEGRASI GOOGLE CALENDAR
-- -------------------------------------------------------------------------------------------------

-- Tabel master template surat menyurat dinamis
CREATE TABLE IF NOT EXISTS dynamic_document_templates (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    branch_id VARCHAR(50) REFERENCES branches(branch_id) ON DELETE SET NULL, -- NULL jika global template
    template_name VARCHAR(150) NOT NULL,
    template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('SURAT_KELUAR', 'SPK', 'INVITATION', 'SURAT_KEMENAG', 'TANDA_TERIMA')),
    template_subject_pattern VARCHAR(255) NOT NULL, -- Contoh: "Undangan Manasik Akbar - {{nama_jamaah}}"
    html_content TEXT NOT NULL, -- Mendukung tag: {{nama_tujuan}}, {{nomor_paspor}}, {{tanggal_acara}}, {{lokasi_acara}}, {{nama_cabang}}
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabel surat keluar yang diterbitkan dengan sinkronisasi Google Calendar
CREATE TABLE IF NOT EXISTS outgoing_letter_records (
    letter_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    branch_id VARCHAR(50) NOT NULL REFERENCES branches(branch_id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES dynamic_document_templates(template_id),
    letter_number VARCHAR(100) NOT NULL UNIQUE, -- Dihasilkan otomatis via document_sequences
    recipient_name VARCHAR(200) NOT NULL,
    recipient_email VARCHAR(150),
    recipient_phone VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    event_date DATE,
    event_start_time TIME,
    event_end_time TIME,
    event_location VARCHAR(255),
    rendered_html TEXT NOT NULL,
    google_calendar_event_id VARCHAR(255),
    gcal_sync_status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (gcal_sync_status IN ('PENDING', 'SYNCED', 'FAILED', 'NOT_APPLICABLE')),
    gcal_last_synced_at TIMESTAMPTZ,
    created_by_user_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- PSEUDOCODE / FUNCTION PUSH KE GOOGLE CALENDAR:
-- Ketika outgoing_letter_records disimpan dan memiliki event_date,
-- sistem memanggil API Google Calendar v3 menggunakan token OAuth dari branch_settings_config.
CREATE OR REPLACE FUNCTION fn_trigger_outgoing_letter_gcal_sync()
RETURNS TRIGGER AS $$
DECLARE
    v_calendar_config JSONB;
    v_is_enabled BOOLEAN;
    v_cal_id VARCHAR;
BEGIN
    -- 1. Ambil konfigurasi Google Calendar milik cabang yang bersangkutan
    SELECT google_calendar_config INTO v_calendar_config
    FROM branch_settings_config
    WHERE tenant_id = NEW.tenant_id AND branch_id = NEW.branch_id;

    IF v_calendar_config IS NOT NULL THEN
        v_is_enabled := COALESCE((v_calendar_config->>'is_enabled')::boolean, false);
        v_cal_id := COALESCE(v_calendar_config->>'calendar_id', 'primary');

        -- 2. Jika event_date terisi dan GCal enabled, jadwalkan push event
        IF NEW.event_date IS NOT NULL AND v_is_enabled = true THEN
            -- Di lingkungan real production, notifikasi pg_notify dikirim ke worker Node.js / queue
            PERFORM pg_notify(
                'gcal_event_push_queue',
                json_build_object(
                    'letter_id', NEW.letter_id,
                    'tenant_id', NEW.tenant_id,
                    'branch_id', NEW.branch_id,
                    'calendar_id', v_cal_id,
                    'event_title', NEW.subject,
                    'event_date', NEW.event_date,
                    'start_time', NEW.event_start_time,
                    'recipient', NEW.recipient_name,
                    'location', NEW.event_location
                )::text
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_outgoing_letter_gcal
AFTER INSERT OR UPDATE OF event_date ON outgoing_letter_records
FOR EACH ROW EXECUTE FUNCTION fn_trigger_outgoing_letter_gcal_sync();

-- -------------------------------------------------------------------------------------------------
-- 3. MANAJEMEN ANTREAN HAJI KHUSUS & NOMOR PORSI (BPIH VALAS / USD)
-- -------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS hajj_portions (
    portion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    branch_id VARCHAR(50) NOT NULL REFERENCES branches(branch_id) ON DELETE CASCADE,
    customer_id VARCHAR(50) NOT NULL,
    booking_id VARCHAR(50) NOT NULL,
    porsi_number VARCHAR(50) NOT NULL UNIQUE, -- Contoh: "3000892711" dari Kemenag RI
    spph_number VARCHAR(100), -- Surat Pendaftaran Pergi Haji
    registration_date DATE NOT NULL,
    estimated_departure_year INT NOT NULL, -- Estimasi Tahun Keberangkatan (Contoh: 2031)
    
    -- Saldo Setoran BPIH Kemenag dalam USD (Standar Setoran Awal $4,000 / $4,500)
    bpih_deposit_usd NUMERIC(15,2) NOT NULL DEFAULT 4000.00,
    exchange_rate_booking NUMERIC(15,2) NOT NULL, -- Kurs saat pendaftaran (Contoh: Rp 15.800)
    bpih_deposit_idr_initial NUMERIC(15,2) GENERATED ALWAYS AS (bpih_deposit_usd * exchange_rate_booking) STORED,
    
    -- Kurs Sekarang & Unrealized Revaluasi Tabungan Haji Jangka Panjang
    current_exchange_rate NUMERIC(15,2) NOT NULL DEFAULT 16000.00,
    current_idr_valuation NUMERIC(15,2) GENERATED ALWAYS AS (bpih_deposit_usd * current_exchange_rate) STORED,
    unrealized_gain_loss NUMERIC(15,2) GENERATED ALWAYS AS ((bpih_deposit_usd * current_exchange_rate) - (bpih_deposit_usd * exchange_rate_booking)) STORED,
    
    status VARCHAR(50) NOT NULL DEFAULT 'WAITING_LIST' CHECK (status IN ('WAITING_LIST', 'READY_DEPARTURE', 'DEPARTED', 'CANCELLED_REFUND')),
    kemenag_status_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hajj_portions_porsi ON hajj_portions(porsi_number);
CREATE INDEX IF NOT EXISTS idx_hajj_portions_year ON hajj_portions(estimated_departure_year);

-- STORED PROCEDURE REVALUASI KURS HAJI VALAS:
CREATE OR REPLACE FUNCTION sp_revalue_hajj_portion_usd(
    p_tenant_id UUID,
    p_new_bi_rate NUMERIC
)
RETURNS TABLE (
    total_portions_updated INT,
    total_gain_loss_idr NUMERIC
) AS $$
DECLARE
    v_updated_count INT;
    v_total_gain_loss NUMERIC;
BEGIN
    UPDATE hajj_portions
    SET current_exchange_rate = p_new_bi_rate,
        updated_at = CURRENT_TIMESTAMP
    WHERE tenant_id = p_tenant_id
      AND status = 'WAITING_LIST';

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;

    SELECT SUM(unrealized_gain_loss) INTO v_total_gain_loss
    FROM hajj_portions
    WHERE tenant_id = p_tenant_id
      AND status = 'WAITING_LIST';

    RETURN QUERY SELECT v_updated_count, COALESCE(v_total_gain_loss, 0);
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------------------------------------------------
-- 4. B2B PROVIDER VISA & LA WHOLESALE (GROSIR TRAVEL EKSTERNAL / NON-KSO)
-- -------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS b2b_provider_orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    owner_branch_id VARCHAR(50) NOT NULL REFERENCES branches(branch_id),
    order_number VARCHAR(100) NOT NULL UNIQUE,
    buyer_travel_name VARCHAR(200) NOT NULL, -- Nama Biro Travel Eksternal Pembeli
    buyer_pic_name VARCHAR(150) NOT NULL,
    buyer_phone VARCHAR(50) NOT NULL,
    buyer_email VARCHAR(150),
    order_type VARCHAR(50) NOT NULL CHECK (order_type IN ('VISA_ONLY', 'LA_ONLY', 'COMBO_VISA_LA')),
    
    qty_pax INT NOT NULL CHECK (qty_pax > 0),
    unit_price_usd NUMERIC(15,2) NOT NULL,
    total_amount_usd NUMERIC(15,2) GENERATED ALWAYS AS (qty_pax * unit_price_usd) STORED,
    exchange_rate NUMERIC(15,2) NOT NULL DEFAULT 16000.00,
    total_amount_idr NUMERIC(15,2) GENERATED ALWAYS AS (qty_pax * unit_price_usd * exchange_rate) STORED,
    
    muasasah_provider_name VARCHAR(150) DEFAULT 'DALLAH_VISA_SAUDI',
    visa_approval_code VARCHAR(100), -- No Approval E-Visa
    target_departure_date DATE,
    
    payment_status VARCHAR(50) NOT NULL DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PARTIALLY_PAID', 'PAID_SETTLED', 'CANCELLED')),
    paid_amount_idr NUMERIC(15,2) NOT NULL DEFAULT 0,
    journal_reference VARCHAR(100),
    
    created_by_user VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- STORED PROCEDURE AUTO-JURNAL PENJUALAN PROVIDER B2B (Memicu Piutang Eksternal vs Pendapatan):
CREATE OR REPLACE FUNCTION sp_generate_b2b_provider_journal(
    p_order_id UUID
)
RETURNS VARCHAR AS $$
DECLARE
    v_order RECORD;
    v_journal_id VARCHAR;
    v_journal_no VARCHAR;
BEGIN
    SELECT * INTO v_order FROM b2b_provider_orders WHERE order_id = p_order_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order B2B Provider tidak ditemukan!';
    END IF;

    v_journal_id := 'jrn-b2b-' || SUBSTRING(p_order_id::text, 1, 8);
    v_journal_no := 'JRN/B2B/' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '/' || SUBSTRING(p_order_id::text, 1, 4);

    -- Di level basis data, jurnal 3-level dibuat:
    -- Debit  : [1150] Piutang B2B Travel Eksternal (IDR total_amount_idr)
    -- Kredit : [4120] Pendapatan Wholesale Provider Visa & LA (IDR total_amount_idr)
    
    UPDATE b2b_provider_orders
    SET journal_reference = v_journal_no,
        payment_status = CASE WHEN paid_amount_idr >= total_amount_idr THEN 'PAID_SETTLED' ELSE payment_status END
    WHERE order_id = p_order_id;

    RETURN v_journal_no;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------------------------------------------------
-- 5. PRE-TRIP CRM (SALES PIPELINE KANBAN & ROW LEVEL SECURITY)
-- -------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS sales_leads (
    lead_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    branch_id VARCHAR(50) NOT NULL REFERENCES branches(branch_id) ON DELETE CASCADE,
    sales_user_id VARCHAR(50) NOT NULL,
    sales_user_name VARCHAR(150) NOT NULL,
    lead_name VARCHAR(200) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    city VARCHAR(100),
    
    interested_package_type VARCHAR(100) NOT NULL, -- Contoh: "Umrah Ramadhan 12 Hari", "Haji Khusus Furoda"
    estimated_pax INT NOT NULL DEFAULT 1 CHECK (estimated_pax > 0),
    estimated_budget_per_pax NUMERIC(15,2) NOT NULL DEFAULT 35000000,
    total_potential_revenue NUMERIC(15,2) GENERATED ALWAYS AS (estimated_pax * estimated_budget_per_pax) STORED,
    
    pipeline_stage VARCHAR(50) NOT NULL DEFAULT 'NEW_LEAD' CHECK (pipeline_stage IN (
        'NEW_LEAD',
        'FOLLOW_UP_1',
        'FOLLOW_UP_2',
        'QUOTATION_SENT',
        'WON_BOOKED',
        'LOST'
    )),
    lost_reason TEXT,
    converted_booking_id VARCHAR(50),
    notes TEXT,
    next_follow_up_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sales_leads_stage ON sales_leads(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_sales_leads_sales_user ON sales_leads(sales_user_id);

-- RLS UNTUK SALES LEADS:
-- Sales user hanya boleh melihat prospek miliknya sendiri.
-- Admin Cabang & Koordinator Agen melihat seluruh leads di cabangnya.
-- Admin SaaS & Admin HQ melihat seluruh leads di seluruh tenant.
ALTER TABLE sales_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_sales_leads_isolation ON sales_leads
FOR ALL
USING (
    current_setting('app.current_role', true) IN ('ADMIN_SAAS', 'ADMIN_HQ')
    OR (
        current_setting('app.current_role', true) IN ('ADMIN_BRANCH', 'AGENT_COORDINATOR')
        AND branch_id = current_setting('app.current_branch_id', true)
    )
    OR (
        current_setting('app.current_role', true) IN ('INTERNAL_SALES', 'BRANCH_AGENT')
        AND sales_user_id = current_setting('app.current_user_id', true)
    )
);

-- -------------------------------------------------------------------------------------------------
-- 6. PEMINJAMAN ALAT AUDIO (WHISPER RECEIVER) LAPANGAN & POTONG CASH ADVANCE
-- -------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS equipment_loans (
    loan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    branch_id VARCHAR(50) NOT NULL REFERENCES branches(branch_id) ON DELETE CASCADE,
    manifest_id VARCHAR(50) NOT NULL,
    tour_leader_id VARCHAR(50) NOT NULL,
    tour_leader_name VARCHAR(150) NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    
    device_type VARCHAR(50) NOT NULL DEFAULT 'WHISPER_RECEIVER_AUDIO',
    device_serial_number VARCHAR(100) NOT NULL,
    loaned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    returned_at TIMESTAMPTZ,
    
    condition_returned VARCHAR(50) CHECK (condition_returned IN ('GOOD_WORKING', 'DAMAGED', 'LOST')),
    penalty_fee_amount NUMERIC(15,2) NOT NULL DEFAULT 0, -- Contoh: Rp 750.000 jika receiver hilang
    deduction_target VARCHAR(50) DEFAULT 'CASH_ADVANCE_TL' CHECK (deduction_target IN ('CASH_ADVANCE_TL', 'JAMAAH_BILLING', 'WAIVED')),
    cash_advance_id VARCHAR(50), -- Id Cash advance Tour Leader yang dipotong otomatis
    penalty_notes TEXT,
    
    status VARCHAR(50) NOT NULL DEFAULT 'BORROWED' CHECK (status IN ('BORROWED', 'RETURNED_CLEAR', 'PENALTY_CHARGED'))
);

-- STORED PROCEDURE PENYELESAIAN PEMINJAMAN DENGAN DENDA KEHILANGAN:
CREATE OR REPLACE FUNCTION sp_return_audio_equipment(
    p_loan_id UUID,
    p_condition VARCHAR,
    p_penalty_amount NUMERIC,
    p_notes TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE equipment_loans
    SET condition_returned = p_condition,
        penalty_fee_amount = CASE WHEN p_condition IN ('DAMAGED', 'LOST') THEN p_penalty_amount ELSE 0 END,
        returned_at = CURRENT_TIMESTAMP,
        status = CASE WHEN p_condition = 'GOOD_WORKING' THEN 'RETURNED_CLEAR' ELSE 'PENALTY_CHARGED' END,
        penalty_notes = p_notes
    WHERE loan_id = p_loan_id;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------------------------------------------------
-- 7. LOGISTIK PASCA-TRIP (AIR ZAM-ZAM & AUTO-SERTIFIKAT BERDASARKAN ITINERARY)
-- -------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS post_trip_zamzam_pickups (
    pickup_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    branch_id VARCHAR(50) NOT NULL REFERENCES branches(branch_id) ON DELETE CASCADE,
    manifest_id VARCHAR(50) NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    customer_name VARCHAR(200) NOT NULL,
    passport_number VARCHAR(50) NOT NULL,
    
    bottle_allocation_liters INT NOT NULL DEFAULT 5, -- Standar 5 Liter per Jamaah
    pickup_location VARCHAR(50) NOT NULL DEFAULT 'BANDARA_ARRIVAL' CHECK (pickup_location IN ('BANDARA_ARRIVAL', 'KANTOR_CABANG', 'HOME_DELIVERY_EXPEDITION')),
    pickup_status VARCHAR(50) NOT NULL DEFAULT 'READY_FOR_PICKUP' CHECK (pickup_status IN ('READY_FOR_PICKUP', 'CLAIMED_HANDED_OVER', 'SHIPPED_EXPEDITION')),
    claimed_at TIMESTAMPTZ,
    recipient_signature_url TEXT,
    courier_tracking_no VARCHAR(100),
    officer_name VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS post_trip_certificates (
    certificate_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    manifest_id VARCHAR(50) NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    certificate_number VARCHAR(100) NOT NULL UNIQUE,
    program_title VARCHAR(200) NOT NULL, -- Contoh: "Sertifikat Badal Umrah / Umrah Reguler 12 Hari"
    completion_date DATE NOT NULL,
    signer_name VARCHAR(150) NOT NULL DEFAULT 'KH. Abdullah Gymnastiar / Direktur Utama',
    pdf_download_url TEXT NOT NULL,
    qr_verification_code VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------------------------------------
-- 8. POST-TRIP SURVEY & SMART GOOGLE REVIEW ROUTING (PSEUDOCODE & SCHEMA)
-- -------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS customer_surveys (
    survey_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    customer_id VARCHAR(50) NOT NULL,
    customer_name VARCHAR(200) NOT NULL,
    manifest_id VARCHAR(50) NOT NULL,
    star_rating INT NOT NULL CHECK (star_rating BETWEEN 1 AND 5),
    muthawif_rating INT CHECK (muthawif_rating BETWEEN 1 AND 5),
    hotel_rating INT CHECK (hotel_rating BETWEEN 1 AND 5),
    catering_rating INT CHECK (catering_rating BETWEEN 1 AND 5),
    feedback_notes TEXT,
    
    -- Smart Routing Decision Result:
    -- Bintang 4-5 -> diarahkan ke public Google Maps Review URL cabang
    -- Bintang 1-3 -> diarahkan ke internal complaint ticket tertutup ke Direksi/CS
    routed_destination VARCHAR(50) NOT NULL CHECK (routed_destination IN ('GOOGLE_REVIEW_PUBLIC', 'INTERNAL_CS_TICKET')),
    cs_ticket_id VARCHAR(50),
    cs_resolution_status VARCHAR(50) DEFAULT 'NONE' CHECK (cs_resolution_status IN ('NONE', 'OPEN', 'IN_INVESTIGATION', 'RESOLVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- PSEUDOCODE SMART GOOGLE REVIEW ROUTING TRIGGER:
CREATE OR REPLACE FUNCTION fn_smart_route_survey_feedback()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.star_rating >= 4 THEN
        NEW.routed_destination := 'GOOGLE_REVIEW_PUBLIC';
    ELSE
        NEW.routed_destination := 'INTERNAL_CS_TICKET';
        NEW.cs_ticket_id := 'CS-TCK-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || SUBSTRING(NEW.survey_id::text, 1, 4);
        NEW.cs_resolution_status := 'OPEN';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_route_survey
BEFORE INSERT ON customer_surveys
FOR EACH ROW EXECUTE FUNCTION fn_smart_route_survey_feedback();

-- -------------------------------------------------------------------------------------------------
-- 9. ALUMNI DATABASE VIEW & WHATSAPP BROADCAST CAMPAIGNS
-- -------------------------------------------------------------------------------------------------

-- View Database Alumni Jamaah (Jamaah yang pernah berangkat pada Manifest DEPARTED atau COMPLETED)
CREATE OR REPLACE VIEW v_alumni_database AS
SELECT 
    c.customer_id,
    c.tenant_id,
    c.branch_id,
    c.full_name,
    c.nik,
    c.phone_number,
    c.email,
    c.city,
    COUNT(m.manifest_id) AS total_trips_completed,
    MAX(m.departed_at) AS last_trip_date,
    STRING_AGG(DISTINCT m.package_name, ', ') AS package_history,
    CASE 
        WHEN COUNT(m.manifest_id) >= 3 THEN 'PLATINUM_ALUMNI'
        WHEN COUNT(m.manifest_id) = 2 THEN 'GOLD_ALUMNI'
        ELSE 'SILVER_ALUMNI'
    END AS loyalty_badge
FROM customers c
JOIN bookings b ON c.customer_id = b.customer_id
JOIN manifests m ON b.package_id = m.package_id
WHERE m.status IN ('DEPARTED', 'COMPLETED', 'ARRIVED_SAUDI')
GROUP BY c.customer_id, c.tenant_id, c.branch_id, c.full_name, c.nik, c.phone_number, c.email, c.city;

-- Tabel Master Kampanye WhatsApp Broadcast
CREATE TABLE IF NOT EXISTS whatsapp_campaigns (
    campaign_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    branch_id VARCHAR(50) NOT NULL REFERENCES branches(branch_id) ON DELETE CASCADE,
    campaign_name VARCHAR(200) NOT NULL,
    campaign_type VARCHAR(50) NOT NULL CHECK (campaign_type IN (
        'PROMO_EARLY_BIRD',
        'MANASIK_REMINDER',
        'PELUNASAN_REMINDER',
        'REUNI_ALUMNI',
        'ZAMZAM_PICKUP_INFO'
    )),
    target_audience VARCHAR(50) NOT NULL CHECK (target_audience IN (
        'ALL_ALUMNI',
        'PLATINUM_ALUMNI_ONLY',
        'UNPAID_BOOKINGS',
        'UPCOMING_MANASIK_GUESTS'
    )),
    message_template TEXT NOT NULL, -- Mendukung variabel: {{nama_jamaah}}, {{nama_paket}}, {{sisa_tagihan}}
    scheduled_send_at TIMESTAMPTZ,
    total_recipients INT NOT NULL DEFAULT 0,
    total_sent INT NOT NULL DEFAULT 0,
    total_delivered INT NOT NULL DEFAULT 0,
    total_failed INT NOT NULL DEFAULT 0,
    campaign_status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (campaign_status IN (
        'DRAFT',
        'SCHEDULED',
        'SENDING',
        'COMPLETED',
        'PAUSED'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Detail Log Pengiriman Pesan WhatsApp per Penerima
CREATE TABLE IF NOT EXISTS wa_message_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES whatsapp_campaigns(campaign_id) ON DELETE CASCADE,
    recipient_phone VARCHAR(50) NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    rendered_body TEXT NOT NULL,
    delivery_status VARCHAR(50) NOT NULL DEFAULT 'QUEUED' CHECK (delivery_status IN (
        'QUEUED',
        'SENT',
        'DELIVERED',
        'READ',
        'FAILED'
    )),
    sent_at TIMESTAMPTZ,
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_wa_logs_campaign ON wa_message_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_wa_logs_status ON wa_message_logs(delivery_status);

-- =================================================================================================
-- AKHIR DARI SKEMA FASE 7
-- =================================================================================================
