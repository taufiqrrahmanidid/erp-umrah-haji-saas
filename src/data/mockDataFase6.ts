import {
  FinancialReportItem,
  ConsolidationReportRow,
  KloterProfitability,
  SeatLoadFactor,
  CommandCenterItem,
  PaymentGatewayWebhook,
} from '../types/erp.ts';

// 1. FINANCIAL REPORT ITEMS (STAND-ALONE)
export const mockProfitLossItems: FinancialReportItem[] = [
  { coa_code: '4100', account_name: 'Pendapatan Paket Umrah & Haji', category: 'REVENUE', debit: 0, credit: 1327500000, ending_balance: 1327500000 },
  { coa_code: '4150', account_name: 'Pendapatan B2B Perlengkapan KSO', category: 'REVENUE', debit: 0, credit: 55000000, ending_balance: 55000000 },
  { coa_code: '4300', account_name: 'Pendapatan Selisih Kurs Terealisasi', category: 'REVENUE', debit: 0, credit: 4500000, ending_balance: 4500000 },
  { coa_code: '5000', account_name: 'HPP Tiket Pesawat & Visa', category: 'COGS', debit: 650000000, credit: 0, ending_balance: 650000000 },
  { coa_code: '5010', account_name: 'HPP Hotel Makkah & Madinah', category: 'COGS', debit: 380000000, credit: 0, ending_balance: 380000000 },
  { coa_code: '5020', account_name: 'HPP Katering & Handling Saudi', category: 'COGS', debit: 95000000, credit: 0, ending_balance: 95000000 },
  { coa_code: '6100', account_name: 'Beban Gaji & Tunjangan Pegawai', category: 'OPEX', debit: 42500000, credit: 0, ending_balance: 42500000 },
  { coa_code: '6120', account_name: 'Beban Komisi Broker & Agen B2C', category: 'OPEX', debit: 28500000, credit: 0, ending_balance: 28500000 },
  { coa_code: '6150', account_name: 'Beban Sewa Kantor & Operasional Cabang', category: 'OPEX', debit: 15000000, credit: 0, ending_balance: 15000000 },
  { coa_code: '6200', account_name: 'Beban Penyusutan Aktiva Tetap', category: 'OPEX', debit: 8500000, credit: 0, ending_balance: 8500000 },
];

export const mockBalanceSheetItems: FinancialReportItem[] = [
  { coa_code: '1010', account_name: 'Kas & Rekening Bank IDR (BSI/Mandiri)', category: 'ASSET', debit: 1695250000, credit: 0, ending_balance: 1695250000 },
  { coa_code: '1020', account_name: 'Kas & Rekening Valas Saudi (SAR)', category: 'ASSET', debit: 785400000, credit: 0, ending_balance: 785400000 },
  { coa_code: '1130', account_name: 'Piutang Jamaah & Talangan Lapangan', category: 'ASSET', debit: 35000000, credit: 0, ending_balance: 35000000 },
  { coa_code: '1150', account_name: 'Uang Muka Vendor Maskapai & Hotel', category: 'ASSET', debit: 420000000, credit: 0, ending_balance: 420000000 },
  { coa_code: '1300', account_name: 'Persediaan Koper & Kain Batik', category: 'ASSET', debit: 115000000, credit: 0, ending_balance: 115000000 },
  { coa_code: '1500', account_name: 'Aktiva Tetap Kantor & Kendaraan', category: 'ASSET', debit: 675000000, credit: 0, ending_balance: 675000000 },
  { coa_code: '1590', account_name: 'Akumulasi Penyusutan Aktiva Tetap', category: 'ASSET', debit: 0, credit: 229500000, ending_balance: -229500000 },
  { coa_code: '2100', account_name: 'Utang Usaha Vendor Hotel & Asuransi', category: 'LIABILITY', debit: 0, credit: 185000000, ending_balance: 185000000 },
  { coa_code: '2160', account_name: 'Titipan Dana Paket Jamaah (Liabilitas)', category: 'LIABILITY', debit: 0, credit: 2150000000, ending_balance: 2150000000 },
  { coa_code: '3100', account_name: 'Modal Saham Disetor', category: 'EQUITY', debit: 0, credit: 800000000, ending_balance: 800000000 },
  { coa_code: '3200', account_name: 'Laba Ditahan & Tahun Berjalan', category: 'EQUITY', debit: 0, credit: 361150000, ending_balance: 361150000 },
];

// 2. CONSOLIDATION REPORT ROWS (WITH AUTOMATED INTERCOMPANY ELIMINATIONS)
export const mockConsolidationRows: ConsolidationReportRow[] = [
  {
    report_section: 'ASSETS',
    coa_code: '1010',
    account_name: 'Kas & Rekening Bank Operasional',
    hq_balance: 1450250000,
    mandiri_branches_balance: 185000000,
    kso_branches_balance: 60000000,
    elimination_debit: 0,
    elimination_credit: 0,
    consolidated_balance: 1695250000,
  },
  {
    report_section: 'ASSETS',
    coa_code: '1200',
    account_name: 'RAK Aktiva (Rekening Antar Kantor)',
    hq_balance: 115000000,
    mandiri_branches_balance: 0,
    kso_branches_balance: 0,
    elimination_debit: 0,
    elimination_credit: 115000000, // Otomatis Dieliminasi!
    consolidated_balance: 0,
  },
  {
    report_section: 'ASSETS',
    coa_code: '1140',
    account_name: 'Piutang B2B Wholesale Mitra KSO',
    hq_balance: 265000000,
    mandiri_branches_balance: 0,
    kso_branches_balance: 0,
    elimination_debit: 0,
    elimination_credit: 265000000, // Otomatis Dieliminasi!
    consolidated_balance: 0,
  },
  {
    report_section: 'LIABILITIES',
    coa_code: '2200',
    account_name: 'RAK Pasiva (Utang Antar Kantor)',
    hq_balance: 0,
    mandiri_branches_balance: 115000000,
    kso_branches_balance: 0,
    elimination_debit: 115000000, // Otomatis Dieliminasi!
    elimination_credit: 0,
    consolidated_balance: 0,
  },
  {
    report_section: 'LIABILITIES',
    coa_code: '2140',
    account_name: 'Utang B2B ke Kantor Pusat (KSO)',
    hq_balance: 0,
    mandiri_branches_balance: 0,
    kso_branches_balance: 265000000,
    elimination_debit: 265000000, // Otomatis Dieliminasi!
    elimination_credit: 0,
    consolidated_balance: 0,
  },
  {
    report_section: 'LIABILITIES',
    coa_code: '2160',
    account_name: 'Titipan Dana Paket Jamaah Belum Terbang',
    hq_balance: 1550000000,
    mandiri_branches_balance: 380000000,
    kso_branches_balance: 220000000,
    elimination_debit: 0,
    elimination_credit: 0,
    consolidated_balance: 2150000000,
  },
  {
    report_section: 'REVENUE',
    coa_code: '4100',
    account_name: 'Pendapatan Paket Umrah & Haji',
    hq_balance: 950000000,
    mandiri_branches_balance: 280000000,
    kso_branches_balance: 97500000,
    elimination_debit: 0,
    elimination_credit: 0,
    consolidated_balance: 1327500000,
  },
];

// 3. KLOTER PROFITABILITY
export const mockKloterProfitabilities: KloterProfitability[] = [
  {
    manifest_id: 'mnf-01',
    manifest_code: 'MNF-2026-REG-01',
    group_name: 'Kloter Rahmatan Lil Alamin 1 (CGK-JED)',
    package_name: 'Paket Umrah Reguler Awal Musim 9 Hari',
    manifest_status: 'SCHEDULED',
    total_passengers: 45,
    total_revenue_idr: 1327500000,
    total_realized_cogs_idr: 1080000000,
    gross_profit_idr: 247500000,
    profit_margin_percent: 18.64,
  },
  {
    manifest_id: 'mnf-02',
    manifest_code: 'MNF-2026-VIP-02',
    group_name: 'Kloter VIP Syawal Clock Tower',
    package_name: 'Paket Umrah VIP Menara Jam Makkah 12 Hari',
    manifest_status: 'DEPARTED',
    total_passengers: 30,
    total_revenue_idr: 1350000000,
    total_realized_cogs_idr: 1050000000,
    gross_profit_idr: 300000000,
    profit_margin_percent: 22.22,
  },
];

// 4. SEAT LOAD FACTORS
export const mockSeatLoadFactors: SeatLoadFactor[] = [
  {
    allocation_id: 'fa-01',
    airline_name: 'Saudia Airlines',
    pnr_code: 'SV817',
    route_path: 'CGK-JED / MED-CGK',
    package_name: 'Paket Umrah Reguler Awal Musim 9 Hari',
    departure_date: '2026-10-15',
    total_seats: 45,
    booked_seats: 45,
    available_seats: 0,
    seat_utilization_percent: 100.0,
  },
  {
    allocation_id: 'fa-02',
    airline_name: 'Garuda Indonesia',
    pnr_code: 'GA980',
    route_path: 'CGK-JED / JED-CGK',
    package_name: 'Paket Umrah VIP Menara Jam Makkah 12 Hari',
    departure_date: '2026-10-28',
    total_seats: 35,
    booked_seats: 30,
    available_seats: 5,
    seat_utilization_percent: 85.71,
  },
];

// 5. COMMAND CENTER LIVE TRACKING
export const mockCommandCenterItems: CommandCenterItem[] = [
  {
    manifest_id: 'mnf-02',
    manifest_code: 'MNF-2026-VIP-02',
    group_name: 'Kloter VIP Syawal Clock Tower',
    manifest_status: 'DEPARTED',
    bus_number_saudi: 'BUS-VIP SAPTCO-07',
    muthawif_name: 'Ustadz Dr. Zulkifli',
    tour_leader_name: 'H. Irfan Hakim',
    mukibin_name: 'Abdullah Mukibin',
    day_number: 1,
    current_activity: 'Check-in Hotel Makkah Clock Tower & Thawaf Wajib',
    planned_time: '2026-10-09T14:30:00Z',
    realization_status: 'ON_TRACK',
    actual_time: '2026-10-09T14:40:00Z',
    photo_evidence_url: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=400&q=80',
  },
  {
    manifest_id: 'mnf-01',
    manifest_code: 'MNF-2026-REG-01',
    group_name: 'Kloter Rahmatan Lil Alamin 1',
    manifest_status: 'SCHEDULED',
    bus_number_saudi: 'BUS-01 DALLAH',
    muthawif_name: 'Ustadz Ahmad Al-Habsyi',
    tour_leader_name: 'Rahmat Hidayat',
    mukibin_name: 'Faisal Basri',
    day_number: 0,
    current_activity: 'Persiapan Manasik Terakhir di Lounge Terminal 3 CGK',
    planned_time: '2026-10-15T08:00:00Z',
    realization_status: 'ON_TRACK',
  },
];

// 6. PAYMENT GATEWAY WEBHOOK LOGS
export const mockPaymentWebhooks: PaymentGatewayWebhook[] = [
  {
    webhook_id: 'wh-01',
    gateway_provider: 'MIDTRANS',
    event_type: 'payment.success',
    order_id: 'BKG/C01/2026/10/0001',
    transaction_id: 'midtrans-tx-992019482',
    payment_channel: 'BSI_VA',
    gross_amount: 19500000,
    transaction_status: 'settlement',
    raw_payload: {
      transaction_time: '2026-10-09 11:20:00',
      transaction_status: 'settlement',
      transaction_id: 'midtrans-tx-992019482',
      status_message: 'midtrans payment notification',
      status_code: '200',
      signature_key: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      payment_type: 'bank_transfer',
      order_id: 'BKG/C01/2026/10/0001',
      gross_amount: '19500000.00',
      fraud_status: 'accept',
      currency: 'IDR',
      va_numbers: [{ bank: 'bsi', va_number: '9882081928310001' }],
    },
    is_processed: true,
    journal_reference: 'JRN/PG/202610/0044',
    created_at: '2026-10-09T11:20:05Z',
  },
];
