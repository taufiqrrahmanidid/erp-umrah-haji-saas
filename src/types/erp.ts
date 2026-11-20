export interface Tenant {
  tenant_id: string;
  company_name: string;
  domain: string;
  subscription_status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'EXPIRED';
  max_branches: number;
  contact_email: string;
  contact_phone: string;
  created_at: string;
  updated_at: string;
}

export interface UiThemeConfig {
  primary_color: string;
  accent_color: string;
  login_bg_url: string;
  dashboard_bg_url: string;
  logo_url: string;
  kop_surat_text: string;
}

export interface GoogleCalendarConfig {
  calendar_id: string;
  sync_enabled: boolean;
  oauth_token_ref: string;
  calendar_name: string;
  last_synced_at?: string;
}

export interface AppSetting {
  setting_id: string;
  tenant_id: string | null;
  branch_id: string | null;
  setting_key: string;
  setting_value: any;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ExchangeRate {
  rate_id: string;
  tenant_id: string;
  currency_code: 'USD' | 'SAR' | 'EUR' | 'MYR';
  buy_rate: number;
  sell_rate: number;
  middle_rate: number;
  effective_date: string;
  valid_until?: string;
  source_rate?: string; // e.g. "Bank Indonesia", "Al Rajhi Bank Saudi", "Reuters SAR Spot"
  updated_at: string;
}

export interface DocumentSequence {
  sequence_id: string;
  tenant_id: string;
  owner_branch_id: string;
  doc_type: 'INV' | 'KWT' | 'MNF' | 'PO' | 'SPK' | 'JRN' | 'REG';
  format_pattern: string;
  current_year: number;
  current_month: number;
  last_number: number;
  padding_length: number;
}

export type RoleCode =
  | 'ADMIN_SAAS'
  | 'ADMIN_HQ'
  | 'OWNER_CLEVEL'
  | 'ADMIN_BRANCH'
  | 'INTERNAL_SALES'
  | 'AGENT_COORDINATOR'
  | 'BRANCH_AGENT'
  | 'JAMAAH'
  | 'MUTHAWIF'
  | 'TOUR_LEADER'
  | 'MUKIBIN';

export interface Role {
  role_id: string;
  role_code: RoleCode;
  role_name: string;
  role_portal: 'SAAS' | 'INTERNAL_HQ' | 'BRANCH' | 'AGENT_NETWORK' | 'PILGRIM' | 'SAUDI_HANDLING';
  description: string;
}

export interface User {
  user_id: string;
  tenant_id: string | null;
  owner_branch_id: string;
  branch_id: string;
  upline_id: string | null;
  phone_number: string;
  email: string;
  username: string;
  full_name: string;
  profile_photo_url: string;
  gender?: 'L' | 'P';
  is_active: boolean;
  role_codes: RoleCode[];
  created_at: string;
}

export interface Employee {
  employee_id: string;
  tenant_id: string;
  owner_branch_id: string;
  user_id: string;
  branch_id: string;
  nik_karyawan: string;
  jabatan: string;
  tanggal_masuk: string;
  status_karyawan: 'PUSAT' | 'MANDIRI' | 'KSO';
  status_aktif: boolean;
  user_name?: string;
  gender?: 'L' | 'P';
  photo_url?: string;
  email?: string;
  phone?: string;
  address_1?: string;
  address_2?: string;
  island_code?: string;
  province_code?: string;
  province_name?: string;
  city_code?: string;
  city_name?: string;
  district?: string;
  village?: string;
  rt?: string;
  rw?: string;
  postal_code?: string;
  gaji_pokok?: number;
  tunjangan?: number;
}

export interface Attendance {
  attendance_id: string;
  tenant_id: string;
  owner_branch_id: string;
  employee_id: string;
  employee_name: string;
  attendance_date: string;
  check_in_time: string;
  check_out_time: string | null;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'ON_DUTY_FIELD' | 'OFF';
  latitude_in: number;
  longitude_in: number;
  notes?: string;
}

export interface LeaveRequest {
  leave_id: string;
  tenant_id: string;
  owner_branch_id: string;
  employee_id: string;
  employee_name: string;
  leave_type: 'ANNUAL' | 'SICK' | 'HAJJ_DUTY' | 'SPECIAL' | 'MATERNITY';
  start_date: string;
  end_date: string;
  reason: string;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approver_name?: string;
  approval_notes?: string;
}

export interface PayrollComponent {
  payroll_id: string;
  tenant_id: string;
  owner_branch_id: string;
  employee_id: string;
  employee_name: string;
  period_month: number;
  period_year: number;
  gaji_pokok: number;
  tunjangan_tetap: number;
  tunjangan_tidak_tetap: number;
  bpjs_kesehatan: number;
  bpjs_ketenagakerjaan: number;
  pph_21: number;
  potongan_lain: number;
  gaji_bersih: number;
  payment_status: 'UNPAID' | 'APPROVED' | 'PAID';
}

export interface GeneralMaster {
  id: string;
  tenant_id: string;
  head_code: string;
  child_code: string;
  description: string;
  cd1: string | null; // active indicator or custom
  cd2: string | null; // branch_type or custom
  cd3: string | null; // parent_branch_code or custom
  cd4: string | null; // metadata
}

export interface ResolvedBranch {
  tenant_id: string;
  branch_code: string;
  branch_name: string;
  is_active: boolean;
  branch_type: 'HQ' | 'MANDIRI' | 'KSO';
  parent_branch_code: string | null;
  extra_info?: string | null;
  // Detail Alamat Lengkap Sesuai Permintaan
  address_1?: string;
  address_2?: string;
  island_code?: string;
  province_code?: string;
  province_name?: string;
  city_code?: string;
  city_name?: string;
  district?: string; // kecamatan
  village?: string;  // desa / kelurahan
  rt?: string;
  rw?: string;
  postal_code?: string;
}

export interface Customer {
  customer_id: string;
  tenant_id: string;
  owner_branch_id: string;
  user_id?: string;
  agent_id?: string;
  agent_name?: string;
  // Detail Nama (Nama Awal, Nama Tengah, Nama Akhir)
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  full_name: string;
  birth_place: string;
  birth_date: string;
  gender: 'L' | 'P';
  blood_type: 'A' | 'B' | 'AB' | 'O';
  // Domisili & Detail Alamat Lengkap
  address: string;
  address_1?: string;
  address_2?: string;
  island_code?: string;
  province_code?: string;
  province?: string;
  city_code?: string;
  city: string;
  district?: string; // kecamatan
  village?: string;  // desa
  rt?: string;
  rw?: string;
  postal_code?: string;
  home_latitude: number;
  home_longitude: number;
  // Siskopatuh / Imigrasi
  nik: string;
  passport_number: string;
  passport_expiry: string;
  fathers_name: string;
  mahram_id: string | null;
  mahram_name?: string;
  mahram_relation?: string;
  siskopatuh_qr_code: string;
  // Logistik & Medis
  jacket_size: 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
  shoe_size: string;
  medical_notes: string;
  emergency_contact: {
    name: string;
    relation: string;
    phone: string;
  };
  photo_url?: string;
}

export interface Vendor {
  vendor_id: string;
  tenant_id: string;
  owner_branch_id: string;
  vendor_code: string;
  vendor_name: string;
  category:
    | 'ASURANSI'
    | 'AIRLINE'
    | 'HOTEL_MAKKAH'
    | 'HOTEL_MADINAH'
    | 'VISA_PROVIDER'
    | 'BUS_TRANSPORT'
    | 'CATERING'
    | 'MUTAWIF_SERVICE'
    | 'HANDLING_SAUDI';
  is_syariah_compliant: boolean;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  address_1?: string;
  address_2?: string;
  island_code?: string;
  province_code?: string;
  province_name?: string;
  city_code?: string;
  city_name?: string;
  district?: string;
  village?: string;
  rt?: string;
  rw?: string;
  postal_code?: string;
  policy_number?: string;
  ojk_permit_number?: string;
  is_active: boolean;
}

export interface VendorRegistration {
  registration_id: string;
  tenant_id: string;
  owner_branch_id: string;
  vendor_name: string;
  category: string;
  tender_number: string;
  submitted_documents: Record<string, string>;
  status: 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
  reviewer_name?: string;
  review_notes?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface JournalDetail {
  detail_id: string;
  account_code: string;
  account_name: string;
  currency_code: string;
  exchange_rate: number;
  amount_valas: number;
  debit_amount: number;
  credit_amount: number;
  notes?: string;
}

export interface JournalBody {
  body_id: string;
  journal_id?: string;
  sub_ledger_type?: string;
  sub_ledger_code: string;
  description: string;
  details: JournalDetail[];
}

export interface JournalMaster {
  journal_id: string;
  tenant_id: string;
  owner_branch_id?: string;
  branch_id?: string;
  journal_number?: string;
  doc_no?: string;
  doc_date?: string;
  transaction_date?: string;
  doc_type?: string;
  workflow_stage?: 'DRAFT_MAKER' | 'APPROVED' | 'RELEASED';
  workflow_status?: 'DRAFT_MAKER' | 'APPROVED' | 'RELEASED' | 'REJECTED';
  maker_user_name?: string;
  maker_id?: string;
  maker_name?: string;
  approver_user_name?: string;
  approver_id?: string;
  approver_name?: string;
  releaser_user_name?: string;
  releaser_id?: string;
  releaser_name?: string;
  made_at?: string;
  approved_at?: string;
  released_at?: string;
  created_at?: string;
  reference_module?: string;
  source_document_ref?: string;
  auto_inherited?: boolean;
  notes: string;
  total_debit: number;
  total_credit: number;
  bodies: JournalBody[];
}

// ==========================================
// FASE 2: TYPES FOR ACCOUNTING, PAYROLL & TAX
// ==========================================

export interface ChartOfAccount {
  coa_code: string;
  tenant_id: string;
  coa_name: string;
  account_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE_DIRECT' | 'EXPENSE_OPEX';
  normal_balance: 'D' | 'C';
  parent_coa_code?: string;
  is_active: boolean;
  is_tax_account: boolean;
  tax_type?: 'PPN_MASUKAN' | 'PPN_KELUARAN' | 'PPH_21' | 'PPH_23' | 'PPH_FINAL_4_2';
}

export interface MasterDataRequest {
  request_id: string;
  tenant_id: string;
  branch_id_pengaju: string;
  request_type: 'ADD_COA' | 'ADD_MASTER';
  request_payload: any;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submitted_by_name: string;
  approved_by_name?: string;
  notes?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface OfficeExpense {
  expense_id: string;
  tenant_id: string;
  branch_id: string;
  expense_date: string;
  expense_no: string;
  category: 'ATK' | 'KONSUMSI_MANASIK' | 'BIAYA_KURIR_PASPOR' | 'OPERASIONAL_BANDARA' | 'UTILITAS_LISTRIK_AIR';
  description: string;
  amount: number;
  paid_from_coa_code: string;
  expense_coa_code: string;
  status: 'DRAFT_MAKER' | 'APPROVED' | 'RELEASED' | 'REJECTED';
  created_by_name: string;
  journal_id?: string;
  created_at: string;
}

export interface PayrollRun {
  payroll_run_id: string;
  tenant_id: string;
  branch_id: string;
  payroll_period_month: number;
  payroll_period_year: number;
  payroll_no: string;
  total_gaji_pokok: number;
  total_tunjangan: number;
  total_bpjs_kesehatan: number;
  total_bpjs_ketenagakerjaan: number;
  total_pph21: number;
  total_kasbon_deduction: number;
  total_gaji_netto: number;
  status: 'DRAFT_MAKER' | 'APPROVED' | 'RELEASED';
  prepared_by_name: string;
  journal_id?: string;
  created_at: string;
}

export interface DocumentTemplate {
  template_id: string;
  tenant_id: string;
  branch_id: string | null;
  template_name: string;
  template_type: 'SURAT_KELUAR' | 'SPK' | 'INVITATION';
  html_content: string;
  is_active: boolean;
}

export interface OutgoingLetter {
  letter_id: string;
  tenant_id: string;
  branch_id: string;
  template_id: string;
  template_name: string;
  letter_number: string;
  recipient_name: string;
  subject: string;
  event_date: string | null;
  rendered_body_html: string;
  google_calendar_event_id?: string;
  gcal_sync_status: 'PENDING' | 'SYNCED' | 'FAILED' | 'NOT_APPLICABLE';
  created_by_name: string;
  created_at: string;
}

export interface AuditLog {
  log_id: string;
  tenant_id: string;
  table_name: string;
  record_id: string;
  action_type: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data: any;
  new_data: any;
  user_name: string;
  ip_address: string;
  created_at: string;
}

export interface InboxItem {
  document_id: string;
  document_category: 'JOURNAL' | 'PETTY_CASH' | 'PAYROLL' | 'MASTER_REQUEST';
  document_number: string;
  transaction_type: string;
  document_date: string;
  branch_id: string;
  workflow_status: 'DRAFT_MAKER' | 'APPROVED' | 'RELEASED' | 'REJECTED';
  maker_name: string;
  approver_name?: string;
  releaser_name?: string;
  notes: string;
  amount?: number;
  timestamp: string;
}

export interface GeneralLedgerEntry {
  doc_date: string;
  doc_no: string;
  doc_type: string;
  branch_id: string;
  coa_code: string;
  coa_name: string;
  account_type: string;
  normal_balance: 'D' | 'C';
  debit_base_amount: number;
  credit_base_amount: number;
  net_movement: number;
  running_balance?: number;
  notes: string;
  released_at: string;
}

// ==========================================
// FASE 3: TYPES FOR PACKAGES, SALES, OPERASIONAL & PORTAL
// ==========================================

export interface PackageItem {
  package_id: string;
  tenant_id: string;
  package_code: string;
  package_name: string;
  package_type: 'REGULER_9D' | 'REGULER_12D' | 'VIP_CLOCK_TOWER' | 'RAMADHAN_ITIKAF' | 'HAJI_KHUSUS';
  departure_date: string;
  return_date: string;
  duration_days: number;
  hotel_makkah: string;
  hotel_madinah: string;
  airline_name: string;
  quota_seats: number;
  booked_seats: number;
  workflow_status: 'DRAFT_MAKER' | 'APPROVED' | 'RELEASED' | 'CLOSED';
  maker_name: string;
  approver_name?: string;
  releaser_name?: string;
  released_at?: string;
  is_locked: boolean;
}

export interface FlightAllocation {
  allocation_id: string;
  package_id: string;
  airline_name: string;
  pnr_code: string;
  flight_number_go: string;
  flight_number_back: string;
  route_path: string;
  total_seats: number;
  held_seats: number;
  available_seats: number;
  deposit_per_seat: number;
  full_payment_due_date: string;
}

export interface PackageRab {
  rab_id: string;
  package_id: string;
  cost_ticket_flight: number;
  cost_la_saudi: number;
  cost_hotel_makkah: number;
  cost_hotel_madinah: number;
  cost_visa_muasasah: number;
  cost_equipment_luggage: number;
  cost_syariah_insurance: number;
  cost_muthawif_tl_fee: number;
  cost_management_fee: number;
  total_hpp_per_pax: number;
  margin_target: number;
  kso_nett_price: number;
  public_selling_price: number;
}

export interface Booking {
  booking_id: string;
  tenant_id: string;
  branch_id: string;
  booking_number: string;
  customer_id: string;
  customer_name: string;
  package_id: string;
  package_name: string;
  agent_id?: string;
  agent_name?: string;
  project_group_id: string;
  booking_type: 'REGULAR' | 'ENDORSEMENT' | 'PAID_TALENT';
  status: 'INQUIRY' | 'DP_PAID' | 'FULLY_PAID' | 'CANCELLED';
  room_type: 'QUAD' | 'TRIPLE' | 'DOUBLE';
  package_price: number;
  discount_amount: number;
  net_payable: number;
  total_paid: number;
  outstanding_balance: number;
  endorsement_reason?: string;
  booking_date?: string;
  gender?: 'L' | 'P';
  photo_url?: string;
  workflow_stage?: 'DRAFT_MAKER' | 'APPROVED' | 'RELEASED';
  maker_name?: string;
  approver_name?: string;
  releaser_name?: string;
  created_at: string;
}

export interface CashAdvance {
  advance_id: string;
  tenant_id: string;
  branch_id: string;
  advance_number: string;
  project_group_id: string;
  recipient_name: string;
  recipient_role: 'MUTHAWIF' | 'TOUR_LEADER' | 'MUKIBIN';
  currency_code: string;
  amount_valas: number;
  exchange_rate: number;
  amount_idr_base: number;
  purpose: string;
  workflow_status: 'DRAFT_MAKER' | 'APPROVED' | 'RELEASED' | 'SETTLED';
  created_at: string;
  disbursed_at?: string;
}

export interface FieldExpenseClaim {
  claim_id: string;
  advance_id: string;
  expense_date: string;
  expense_category: 'EXTRA_CATERING_JEDDAH' | 'TIPS_DRIVER_BUS_SAUDI' | 'KURSI_RODA_THAWAF' | 'OBAT_EMERGENCY_MAKKAH' | 'SIM_CARD_CREW';
  description: string;
  amount_sar: number;
  receipt_photo_url: string;
  verified_by_finance: boolean;
}

export interface JamaahAdministration {
  admin_id: string;
  booking_id: string;
  customer_name: string;
  workflow_stage: 'COLLECTED_BY_BRANCH' | 'SENT_TO_HQ' | 'RECEIVED_BY_HQ' | 'BIOMETRIC_DONE' | 'SISKOPATUH_REGISTERED' | 'VISA_ISSUED';
  passport_physical_location: string;
  biometric_appointment_date?: string;
  siskopatuh_id?: string;
  visa_number?: string;
  visa_expiry_date?: string;
  notes?: string;
  updated_at: string;
}

export interface SavingAccount {
  saving_account_id: string;
  customer_id: string;
  customer_name: string;
  account_number: string;
  current_balance: number;
  target_amount: number;
  target_package_type: string;
  status: 'ACTIVE' | 'FROZEN' | 'CLOSED';
}

export interface SavingMutation {
  mutation_id: string;
  saving_account_id: string;
  mutation_type: 'DEPOSIT' | 'WITHDRAWAL' | 'CONVERT_TO_BOOKING';
  amount: number;
  balance_after: number;
  reference_number: string;
  payment_channel: string;
  notes: string;
  created_at: string;
}

export interface BookingCancellation {
  cancellation_id: string;
  booking_id: string;
  booking_number: string;
  customer_name: string;
  cancellation_number: string;
  cancellation_date: string;
  reason: string;
  total_paid_initial: number;
  penalty_fee: number;
  refund_amount: number;
  refund_status: 'DRAFT_MAKER' | 'APPROVED' | 'RELEASED';
  created_at: string;
}

export interface ManasikEvent {
  event_id: string;
  branch_id: string;
  event_title: string;
  event_date: string;
  start_time: string;
  location_hall: string;
  speaker_name: string;
  google_calendar_event_id?: string;
}

export interface ManasikAttendance {
  attendance_id: string;
  event_id: string;
  booking_id: string;
  customer_id: string;
  customer_name: string;
  qr_ticket_code: string;
  is_present: boolean;
  scanned_at?: string;
  souvenir_snack_collected: boolean;
}

export interface RoommateAllocation {
  allocation_id: string;
  package_id: string;
  city: 'MAKKAH' | 'MADINAH';
  hotel_name: string;
  room_number: string;
  customer_name: string;
  room_type: 'QUAD' | 'TRIPLE' | 'DOUBLE';
}

export interface GroupGallery {
  gallery_id: string;
  project_group_id: string;
  photo_title: string;
  photo_url: string;
  location_tag: string;
}

export interface JamaahDashboardSummary {
  customer_name: string;
  passport_number: string;
  siskopatuh_qr_code: string;
  jacket_size: string;
  blood_type: string;
  booking_number: string;
  booking_status: string;
  booking_type: string;
  room_type: string;
  package_name: string;
  departure_date: string;
  return_date: string;
  hotel_makkah: string;
  hotel_madinah: string;
  airline_name: string;
  visa_admin_stage: string;
  visa_number?: string;
  muthawif_name: string;
  muthawif_phone: string;
  muthawif_photo: string;
  mukibin_name: string;
  mukibin_phone: string;
  mukibin_photo: string;
  escrow_saving_balance: number;
  manasik_qr_code: string;
  manasik_attendance_status: boolean;
}

// ============================================================================
// FASE 4 ENTERPRISE TYPES
// ============================================================================

export interface PurchaseRequest {
  ro_id: string;
  tenant_id: string;
  branch_id: string;
  ro_number: string;
  department: 'LOGISTIK' | 'TIKETING' | 'OPERASIONAL_SAUDI';
  requester_name: string;
  title: string;
  total_estimated_amount: number;
  attachment_url?: string;
  escalated_to_hq: boolean;
  workflow_stage: 'DRAFT_MAKER' | 'PENDING_HQ' | 'APPROVED' | 'REJECTED';
  approver_name?: string;
  approved_at?: string;
  notes?: string;
  created_at: string;
}

export interface TenderBid {
  bid_id: string;
  tender_id: string;
  vendor_id: string;
  vendor_name: string;
  bid_price_per_unit: number;
  total_bid_amount: number;
  sample_delivery_date?: string;
  bid_status: 'SUBMITTED' | 'SHORTLISTED' | 'WON' | 'REJECTED';
  evaluation_score: number;
  created_at: string;
}

export interface Tender {
  tender_id: string;
  tenant_id: string;
  ro_id: string;
  tender_code: string;
  title: string;
  category: 'KOPER_SET' | 'KAIN_IHRAM_BATIK' | 'BUS_SAUDI' | 'ASURANSI';
  quantity: number;
  max_budget: number;
  open_date: string;
  close_date: string;
  status: 'OPEN' | 'EVALUATION' | 'AWARDED' | 'CANCELLED';
  winning_vendor_id?: string;
  winning_vendor_name?: string;
  bids: TenderBid[];
  created_at: string;
}

export interface PurchaseOrder {
  po_id: string;
  tenant_id: string;
  branch_id: string;
  po_number: string;
  ro_id?: string;
  tender_id?: string;
  vendor_id: string;
  vendor_name: string;
  po_type: 'DIRECT' | 'TENDER' | 'CONTRACT';
  currency: 'IDR' | 'SAR' | 'USD';
  exchange_rate_at_po: number;
  subtotal_valas: number;
  subtotal_idr: number;
  pph_23_rate: number;
  pph_23_amount_idr: number;
  grand_total_idr: number;
  is_kso_b2b_sales_order: boolean;
  workflow_stage: 'DRAFT_MAKER' | 'APPROVED' | 'RELEASED' | 'COMPLETED' | 'CANCELLED';
  maker_name: string;
  approver_name?: string;
  approved_at?: string;
  created_at: string;
}

export interface VendorPayment {
  payment_id: string;
  tenant_id: string;
  po_id: string;
  po_number: string;
  payment_number: string;
  payment_date: string;
  currency: string;
  amount_valas: number;
  rate_at_po: number;
  rate_at_payment: number;
  amount_idr_at_po: number;
  amount_idr_at_payment: number;
  realized_fx_difference: number; // Positif = Rugi Selisih Kurs (Beban), Negatif = Untung Selisih Kurs
  pph_23_withheld_idr: number;
  journal_reference: string;
  created_at: string;
}

export interface Plant {
  plant_id: string;
  tenant_id: string;
  plant_code: string;
  plant_name: string;
  owner_branch_id: string;
  plant_type: 'CENTRAL_HUB' | 'BRANCH_MANDIRI' | 'BRANCH_KSO';
  is_active: boolean;
}

export interface PlantInventory {
  inventory_id: string;
  plant_id: string;
  plant_code: string;
  owner_branch_id: string;
  material_code: string;
  material_name: string;
  unit: string;
  qty_on_hand: number;
  avg_unit_cost: number;
}

export interface GoodsReceipt {
  gr_id: string;
  plant_id: string;
  plant_code: string;
  po_id: string;
  po_number: string;
  gr_number: string;
  receipt_date: string;
  received_by_name: string;
  total_received_value: number;
  journal_reference: string;
  items: {
    material_code: string;
    material_name: string;
    qty_received: number;
    unit_cost: number;
    subtotal: number;
  }[];
}

export interface GoodsIssue {
  gi_id: string;
  plant_id: string;
  plant_code: string;
  gi_number: string;
  issue_date: string;
  issue_category: 'ASSET' | 'FOR_SALE' | 'SALES_SUPPORT' | 'OPERATIONAL';
  workflow_stage: 'DRAFT_MAKER' | 'APPROVED' | 'RELEASED';
  destination_branch_id?: string;
  total_issue_cost: number;
  maker_name: string;
  approver_name?: string;
  releaser_name?: string;
  journal_reference?: string;
  items: {
    material_code: string;
    material_name: string;
    qty_issued: number;
    unit_cost: number;
    subtotal_cost: number;
  }[];
}

export interface EquipmentHandover {
  handover_id: string;
  booking_id: string;
  booking_number: string;
  customer_id: string;
  customer_name: string;
  item_name: string;
  handover_status: 'PENDING' | 'DELIVERING' | 'HANDED_OVER';
  delivery_method: 'PICKUP_BRANCH' | 'EXPEDITION_COURIER';
  courier_name?: string;
  tracking_number?: string;
  received_date?: string;
  received_by_name?: string;
  notes?: string;
}

export interface FixedAsset {
  asset_id: string;
  tenant_id: string;
  branch_id: string;
  asset_code: string;
  asset_name: string;
  category: 'VEHICLE' | 'OFFICE_EQUIPMENT' | 'BUILDING' | 'IT_HARDWARE';
  acquisition_date: string;
  acquisition_cost: number;
  useful_life_months: number;
  salvage_value: number;
  accumulated_depreciation: number;
  book_value: number;
  status: 'ACTIVE' | 'DISPOSED' | 'WRITTEN_OFF';
  is_kso_asset: boolean;
}

export interface AssetDisposal {
  disposal_id: string;
  asset_id: string;
  asset_name: string;
  asset_code: string;
  disposal_date: string;
  disposal_method: 'SOLD' | 'SCRAPPED' | 'LOST';
  sale_price: number;
  book_value_at_disposal: number;
  gain_loss_amount: number; // sale_price - book_value
  disposal_reason: string;
  workflow_stage: 'DRAFT_MAKER' | 'APPROVED' | 'RELEASED';
  journal_reference: string;
}

export interface Manifest {
  manifest_id: string;
  tenant_id: string;
  package_id: string;
  package_name: string;
  manifest_code: string;
  group_name: string;
  departure_flight_pnr: string;
  bus_number_saudi: string;
  muthawif_user_id: string;
  muthawif_name: string;
  tl_user_id: string;
  tl_name: string;
  mukibin_user_id: string;
  mukibin_name: string;
  status: 'SCHEDULED' | 'BOARDING' | 'DEPARTED' | 'IN_TRANSIT' | 'ARRIVED_SAUDI' | 'COMPLETED';
  departed_at?: string;
  revenue_recognized: boolean;
  revenue_journal_id?: string;
  total_jamaah: number;
}

export interface RoomingListEntry {
  room_id: string;
  manifest_id: string;
  manifest_code: string;
  hotel_location: 'MAKKAH' | 'MADINAH';
  hotel_name: string;
  room_number: string;
  room_type: 'QUAD' | 'TRIPLE' | 'DOUBLE';
  customer_id: string;
  customer_name: string;
  passport_number: string;
  phone_number: string;
  gender: 'L' | 'P';
  is_key_holder: boolean;
}

export interface LuggageTracking {
  tracking_id: string;
  manifest_id: string;
  customer_id: string;
  customer_name: string;
  qr_tag_scanned: string;
  luggage_number: string;
  scan_location: 'AIRPORT_DEPARTURE' | 'JEDDAH_ARRIVAL' | 'MAKKAH_HOTEL' | 'MADINAH_HOTEL' | 'AIRPORT_RETURN';
  scanned_by_mukibin_name: string;
  scan_status: 'RECEIVED_AT_AIRPORT' | 'LOADED_TO_BUS' | 'ARRIVED_AT_ROOM' | 'IN_STORAGE';
  notes?: string;
  scanned_at: string;
}

export interface Itinerary {
  itinerary_id: string;
  manifest_id: string;
  day_number: number;
  activity_name: string;
  planned_time: string;
  location: string;
  description: string;
}

export interface ItineraryRealization {
  realization_id: string;
  itinerary_id: string;
  activity_name: string;
  actual_time: string;
  status: 'ON_TRACK' | 'DELAYED' | 'COMPLETED' | 'RESCHEDULED';
  updated_by_user_name: string;
  delay_reason?: string;
  photo_evidence_url?: string;
}

export interface InsurancePolicy {
  insurance_id: string;
  policy_number: string;
  vendor_id: string;
  vendor_name: string;
  coverage_type: 'JAMAAH' | 'MUTHAWIF' | 'MUKIBIN' | 'EMPLOYEE';
  start_date: string;
  end_date: string;
  total_participants: number;
  premium_per_person: number;
  total_premium: number;
  status: 'DRAFT_MAKER' | 'APPROVED' | 'RELEASED' | 'EXPIRED';
  journal_reference: string;
}

// ============================================================================
// FASE 5 ENTERPRISE TYPES: VALAS, BANK RECON, BROKER & KSO WHOLESALE
// ============================================================================

export interface BankAccount {
  bank_account_id: string;
  tenant_id: string;
  branch_id: string;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  currency: 'IDR' | 'SAR' | 'USD';
  coa_code: string;
  current_gl_balance: number;
  is_active: boolean;
}

export interface BankStatement {
  statement_id: string;
  tenant_id: string;
  bank_account_id: string;
  transaction_date: string;
  value_date: string;
  description: string;
  reference_number: string;
  mutation_type: 'CR' | 'DB';
  amount: number;
  ending_balance: number;
  is_matched: boolean;
  match_confidence: 'EXACT' | 'FUZZY' | 'MANUAL' | 'UNMATCHED';
  matched_payment_id?: string;
  matched_at?: string;
  notes?: string;
}

export interface UnrealizedFxItem {
  coa_code: string;
  account_name: string;
  currency_code: 'SAR' | 'USD';
  net_valas: number;
  recorded_idr_balance: number;
  bi_closing_rate: number;
  fair_value_idr: number;
  unrealized_diff: number; // Positif = Untung Kurs Belum Terealisasi, Negatif = Rugi
}

export interface AgentCommission {
  commission_id: string;
  tenant_id: string;
  booking_id: string;
  booking_number: string;
  customer_name: string;
  branch_id: string;
  agent_id: string;
  agent_name: string;
  upline_id?: string;
  upline_name?: string;
  recipient_type: 'DIRECT_AGENT' | 'UPLINE_OVERRIDE';
  commission_trigger: 'ON_DP' | 'ON_HALF_PAID' | 'ON_FULL_PAID';
  gross_commission_amount: number;
  pph_21_rate: number;
  pph_21_amount: number;
  net_commission_payable: number;
  is_kso_branch_burden: boolean;
  payment_status: 'PENDING' | 'APPROVED' | 'DISBURSED' | 'CANCELLED';
  gender?: 'L' | 'P';
  photo_url?: string;
  customer_gender?: 'L' | 'P';
  customer_photo_url?: string;
  journal_reference?: string;
  created_at: string;
}

export interface AgentWallet {
  wallet_id: string;
  agent_user_id: string;
  agent_name: string;
  gender?: 'L' | 'P';
  photo_url?: string;
  phone_number?: string;
  branch_id: string;
  current_balance: number;
  last_topup_at?: string;
  status: 'ACTIVE' | 'FROZEN' | 'SUSPENDED';
}

export interface WalletMutation {
  mutation_id: string;
  wallet_id: string;
  mutation_type: 'TOPUP_DEPOSIT' | 'PAYMENT_BOOKING_DEDUCTION' | 'COMMISSION_CASHOUT' | 'REFUND_INTO_WALLET';
  amount: number;
  balance_before: number;
  balance_after: number;
  reference_no: string;
  notes: string;
  created_at: string;
}

export interface KsoWholesaleMargin {
  settlement_id: string;
  branch_id: string;
  package_name: string;
  booking_number: string;
  customer_name: string;
  public_selling_price: number;
  hq_nett_price: number;
  kso_gross_margin: number;
  pph_23_rate: number;
  pph_23_amount: number;
  kso_net_margin: number;
  settlement_status: 'PENDING' | 'INVOICED_BY_HQ' | 'SETTLED';
}

// ============================================================================
// FASE 6 ENTERPRISE TYPES: REPORTS, CONSOLIDATION, DASHBOARD & WEBHOOK
// ============================================================================

export interface FinancialReportItem {
  coa_code: string;
  account_name: string;
  category: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'COGS' | 'OPEX';
  debit: number;
  credit: number;
  ending_balance: number;
}

export interface ConsolidationReportRow {
  report_section: 'ASSETS' | 'LIABILITIES' | 'EQUITY' | 'REVENUE' | 'EXPENSES';
  coa_code: string;
  account_name: string;
  hq_balance: number;
  mandiri_branches_balance: number;
  kso_branches_balance: number;
  elimination_debit: number;
  elimination_credit: number;
  consolidated_balance: number;
}

export interface KloterProfitability {
  manifest_id: string;
  manifest_code: string;
  group_name: string;
  package_name: string;
  manifest_status: string;
  total_passengers: number;
  total_revenue_idr: number;
  total_realized_cogs_idr: number;
  gross_profit_idr: number;
  profit_margin_percent: number;
}

export interface SeatLoadFactor {
  allocation_id: string;
  airline_name: string;
  pnr_code: string;
  route_path: string;
  package_name: string;
  departure_date: string;
  total_seats: number;
  booked_seats: number;
  available_seats: number;
  seat_utilization_percent: number;
}

export interface CommandCenterItem {
  manifest_id: string;
  manifest_code: string;
  group_name: string;
  manifest_status: string;
  bus_number_saudi: string;
  muthawif_name: string;
  tour_leader_name: string;
  mukibin_name: string;
  day_number: number;
  current_activity: string;
  planned_time: string;
  realization_status: 'ON_TRACK' | 'DELAYED' | 'COMPLETED' | 'RESCHEDULED';
  actual_time?: string;
  delay_reason?: string;
  photo_evidence_url?: string;
}

export interface PaymentGatewayWebhook {
  webhook_id: string;
  gateway_provider: 'MIDTRANS' | 'XENDIT';
  event_type: string;
  order_id: string;
  transaction_id: string;
  payment_channel: string;
  gross_amount: number;
  transaction_status: string;
  raw_payload: Record<string, any>;
  is_processed: boolean;
  journal_reference: string;
  created_at: string;
}

// ============================================================================
// FASE 7 TYPES: ADVANCED CRM, B2B VISA, LOGISTICS, SURAT, THEMING, CAMPAIGNS
// ============================================================================

export interface BranchThemeConfig {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  dark_mode: boolean;
  login_bg_url: string;
  dashboard_bg_url: string;
  logo_url: string;
  company_watermark: string;
}

export interface GoogleCalendarBranchConfig {
  is_enabled: boolean;
  calendar_id: string;
  oauth_client_id: string;
  oauth_access_token: string;
  token_expires_at: string;
  auto_sync_letters: boolean;
  auto_sync_manasik: boolean;
  auto_sync_departures: boolean;
}

export interface BranchSettingsConfig {
  config_id: string;
  tenant_id: string;
  branch_id: string;
  branch_name: string;
  ui_theme_config: BranchThemeConfig;
  google_calendar_config: GoogleCalendarBranchConfig;
  updated_at: string;
}

export interface DynamicDocumentTemplate {
  template_id: string;
  branch_id?: string;
  template_name: string;
  template_type: 'SURAT_KELUAR' | 'SPK' | 'INVITATION' | 'SURAT_KEMENAG' | 'TANDA_TERIMA';
  template_subject_pattern: string;
  html_content: string;
  is_active: boolean;
  created_at: string;
}

export interface OutgoingLetterRecord {
  letter_id: string;
  branch_id: string;
  template_id: string;
  letter_number: string;
  recipient_name: string;
  recipient_email?: string;
  recipient_phone?: string;
  subject: string;
  event_date?: string;
  event_start_time?: string;
  event_end_time?: string;
  event_location?: string;
  rendered_html: string;
  google_calendar_event_id?: string;
  gcal_sync_status: 'PENDING' | 'SYNCED' | 'FAILED' | 'NOT_APPLICABLE';
  gcal_last_synced_at?: string;
  created_by_user_id: string;
  created_at: string;
}

export interface HajjPortion {
  portion_id: string;
  branch_id: string;
  customer_id: string;
  customer_name: string;
  gender?: 'L' | 'P';
  photo_url?: string;
  booking_id: string;
  porsi_number: string;
  spph_number: string;
  registration_date: string;
  estimated_departure_year: number;
  bpih_deposit_usd: number;
  exchange_rate_booking: number;
  bpih_deposit_idr_initial: number;
  current_exchange_rate: number;
  current_idr_valuation: number;
  unrealized_gain_loss: number;
  status: 'WAITING_LIST' | 'READY_DEPARTURE' | 'DEPARTED' | 'CANCELLED_REFUND';
  kemenag_status_notes?: string;
}

export interface B2BProviderOrder {
  order_id: string;
  owner_branch_id: string;
  order_number: string;
  buyer_travel_name: string;
  buyer_pic_name: string;
  buyer_phone: string;
  buyer_email?: string;
  order_type: 'VISA_ONLY' | 'LA_ONLY' | 'COMBO_VISA_LA';
  qty_pax: number;
  unit_price_usd: number;
  total_amount_usd: number;
  exchange_rate: number;
  total_amount_idr: number;
  muasasah_provider_name: string;
  visa_approval_code?: string;
  target_departure_date: string;
  payment_status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID_SETTLED' | 'CANCELLED';
  paid_amount_idr: number;
  journal_reference?: string;
  created_by_user: string;
  created_at: string;
}

export interface SalesLead {
  lead_id: string;
  branch_id: string;
  sales_user_id: string;
  sales_user_name: string;
  sales_gender?: 'L' | 'P';
  sales_photo_url?: string;
  lead_name: string;
  gender?: 'L' | 'P';
  photo_url?: string;
  phone_number: string;
  email?: string;
  city: string;
  interested_package_type: string;
  estimated_pax: number;
  estimated_budget_per_pax: number;
  total_potential_revenue: number;
  pipeline_stage: 'NEW_LEAD' | 'FOLLOW_UP_1' | 'FOLLOW_UP_2' | 'QUOTATION_SENT' | 'WON_BOOKED' | 'LOST';
  lost_reason?: string;
  converted_booking_id?: string;
  notes?: string;
  registration_date?: string;
  branch_type?: 'HQ' | 'MANDIRI' | 'KSO' | 'SUB_KSO';
  followup_count?: number;
  followup_result?: string;
  agent_id?: string;
  agent_name?: string;
  agent_commission_tier?: string;
  estimated_agent_commission?: number;
  next_follow_up_date?: string;
  created_at: string;
}

export interface AgentCommissionSetting {
  setting_id: string;
  tier_code: string;
  tier_name: string;
  commission_per_pax_idr: number;
  commission_ramadhan_pax_idr: number;
  target_minimum_pax: number;
  bonus_achievement_idr: number;
  applicable_branch_type: 'ALL' | 'HQ' | 'MANDIRI' | 'KSO' | 'SUB_KSO';
  is_active: boolean;
  notes?: string;
}

export interface EquipmentLoan {
  loan_id: string;
  branch_id: string;
  manifest_id: string;
  manifest_code: string;
  tour_leader_id: string;
  tour_leader_name: string;
  customer_id: string;
  customer_name: string;
  device_type: string;
  device_serial_number: string;
  loaned_at: string;
  returned_at?: string;
  condition_returned?: 'GOOD_WORKING' | 'DAMAGED' | 'LOST';
  penalty_fee_amount: number;
  deduction_target: 'CASH_ADVANCE_TL' | 'JAMAAH_BILLING' | 'WAIVED';
  cash_advance_id?: string;
  penalty_notes?: string;
  status: 'BORROWED' | 'RETURNED_CLEAR' | 'PENALTY_CHARGED';
}

export interface PostTripZamzamPickup {
  pickup_id: string;
  branch_id: string;
  manifest_id: string;
  manifest_code: string;
  customer_id: string;
  customer_name: string;
  passport_number: string;
  bottle_allocation_liters: number;
  pickup_location: 'BANDARA_ARRIVAL' | 'KANTOR_CABANG' | 'HOME_DELIVERY_EXPEDITION';
  pickup_status: 'READY_FOR_PICKUP' | 'CLAIMED_HANDED_OVER' | 'SHIPPED_EXPEDITION';
  claimed_at?: string;
  recipient_signature_url?: string;
  courier_tracking_no?: string;
  officer_name?: string;
  notes?: string;
}

export interface PostTripCertificate {
  certificate_id: string;
  manifest_id: string;
  manifest_code: string;
  customer_id: string;
  customer_name: string;
  certificate_number: string;
  program_title: string;
  completion_date: string;
  signer_name: string;
  pdf_download_url: string;
  qr_verification_code: string;
}

export interface CustomerSurvey {
  survey_id: string;
  customer_id: string;
  customer_name: string;
  manifest_id: string;
  manifest_code: string;
  star_rating: number;
  muthawif_rating: number;
  hotel_rating: number;
  catering_rating: number;
  feedback_notes: string;
  routed_destination: 'GOOGLE_REVIEW_PUBLIC' | 'INTERNAL_CS_TICKET';
  cs_ticket_id?: string;
  cs_resolution_status: 'NONE' | 'OPEN' | 'IN_INVESTIGATION' | 'RESOLVED';
  created_at: string;
}

export interface AlumniDatabaseRecord {
  customer_id: string;
  branch_id: string;
  full_name: string;
  nik: string;
  phone_number: string;
  email: string;
  city: string;
  total_trips_completed: number;
  last_trip_date: string;
  package_history: string;
  loyalty_badge: 'SILVER_ALUMNI' | 'GOLD_ALUMNI' | 'PLATINUM_ALUMNI';
}

export interface WhatsAppCampaign {
  campaign_id: string;
  branch_id: string;
  campaign_name: string;
  campaign_type: 'PROMO_EARLY_BIRD' | 'MANASIK_REMINDER' | 'PELUNASAN_REMINDER' | 'REUNI_ALUMNI' | 'ZAMZAM_PICKUP_INFO';
  target_audience: 'ALL_ALUMNI' | 'PLATINUM_ALUMNI_ONLY' | 'UNPAID_BOOKINGS' | 'UPCOMING_MANASIK_GUESTS';
  message_template: string;
  scheduled_send_at?: string;
  total_recipients: number;
  total_sent: number;
  total_delivered: number;
  total_failed: number;
  campaign_status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'PAUSED';
  created_at: string;
}

export interface WAMessageLog {
  log_id: string;
  campaign_id: string;
  recipient_phone: string;
  recipient_name: string;
  rendered_body: string;
  delivery_status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  sent_at?: string;
  error_message?: string;
}





