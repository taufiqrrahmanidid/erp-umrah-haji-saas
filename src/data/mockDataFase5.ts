import {
  BankAccount,
  BankStatement,
  UnrealizedFxItem,
  AgentCommission,
  AgentWallet,
  WalletMutation,
  KsoWholesaleMargin,
} from '../types/erp.ts';

// 1. BANK ACCOUNTS & STATEMENTS
export const mockBankAccounts: BankAccount[] = [
  {
    bank_account_id: 'bnk-01',
    tenant_id: '11111111-1111-1111-1111-111111111111',
    branch_id: 'PST',
    bank_name: 'Bank Syariah Indonesia (BSI Giro Operasional)',
    account_number: '7100293819',
    account_holder_name: 'PT Biro Umrah Barokah Utama',
    currency: 'IDR',
    coa_code: '1010',
    current_gl_balance: 1450250000,
    is_active: true,
  },
  {
    bank_account_id: 'bnk-02',
    tenant_id: '11111111-1111-1111-1111-111111111111',
    branch_id: 'PST',
    bank_name: 'Al-Rajhi Bank Saudi (Valas SAR)',
    account_number: 'SA8280000192837461',
    account_holder_name: 'PT Biro Umrah Makkah Branch Office',
    currency: 'SAR',
    coa_code: '1020',
    current_gl_balance: 185000, // SAR 185,000
    is_active: true,
  },
  {
    bank_account_id: 'bnk-03',
    tenant_id: '11111111-1111-1111-1111-111111111111',
    branch_id: 'C01',
    bank_name: 'Bank Mandiri Giro KSO Kediri',
    account_number: '1440092817261',
    account_holder_name: 'Mitra KSO Kediri Operasional',
    currency: 'IDR',
    coa_code: '1011',
    current_gl_balance: 245000000,
    is_active: true,
  },
];

export const mockBankStatements: BankStatement[] = [
  {
    statement_id: 'stmt-01',
    tenant_id: '11111111-1111-1111-1111-111111111111',
    bank_account_id: 'bnk-01',
    transaction_date: '2026-10-08',
    value_date: '2026-10-08',
    description: 'TRF BSI NET BKG/C01/2026/10/0001 HJ SITI AMINAH DP PELUNASAN',
    reference_number: 'BKG/C01/2026/10/0001',
    mutation_type: 'CR',
    amount: 10000000,
    ending_balance: 1450250000,
    is_matched: true,
    match_confidence: 'EXACT',
    matched_payment_id: 'bkg-01',
    matched_at: '2026-10-08T14:00:00Z',
    notes: 'Auto-reconciled: Reference booking number matched',
  },
  {
    statement_id: 'stmt-02',
    tenant_id: '11111111-1111-1111-1111-111111111111',
    bank_account_id: 'bnk-01',
    transaction_date: '2026-10-08',
    value_date: '2026-10-08',
    description: 'BI-FAST PEMBAYARAN KOPER BAGASI CV BERKAH BAGASI MANDIRI',
    reference_number: 'PO/PST/2026/10/001',
    mutation_type: 'DB',
    amount: 112700000,
    ending_balance: 1337550000,
    is_matched: true,
    match_confidence: 'EXACT',
    matched_payment_id: 'po-01',
    matched_at: '2026-10-08T14:05:00Z',
    notes: 'Auto-reconciled: Matched with PO payment after PPh 23',
  },
  {
    statement_id: 'stmt-03',
    tenant_id: '11111111-1111-1111-1111-111111111111',
    bank_account_id: 'bnk-01',
    transaction_date: '2026-10-09',
    value_date: '2026-10-09',
    description: 'TRANSFER ATM MANDIRI SETORAN AWAL JAMAAH A.N H. SULAIMAN',
    reference_number: 'ATM98201948',
    mutation_type: 'CR',
    amount: 5000000,
    ending_balance: 1342550000,
    is_matched: false,
    match_confidence: 'UNMATCHED',
    notes: 'Belum terhubung ke booking ID manapun, butuh pencocokan',
  },
];

// 2. UNREALIZED FX SCANNER DATA
export const mockUnrealizedFxItems: UnrealizedFxItem[] = [
  {
    coa_code: '1020',
    account_name: 'Kas & Rekening Valas Saudi (SAR)',
    currency_code: 'SAR',
    net_valas: 85000, // SAR 85,000
    recorded_idr_balance: 355300000, // Kurs historis @ 4.180 = Rp 355.300.000
    bi_closing_rate: 4250.0, // Kurs penutupan BI akhir bulan
    fair_value_idr: 361250000, // 85,000 x 4.250 = Rp 361.250.000
    unrealized_diff: 5950000, // Untung Selisih Kurs Belum Terealisasi Rp 5.950.000
  },
  {
    coa_code: '1150',
    account_name: 'Uang Muka Hotel Makkah Zamzam (SAR)',
    currency_code: 'SAR',
    net_valas: 120000, // SAR 120,000
    recorded_idr_balance: 501600000, // Kurs saat DP @ 4.180 = Rp 501.600.000
    bi_closing_rate: 4250.0,
    fair_value_idr: 510000000,
    unrealized_diff: 8400000, // Untung Valas Rp 8.400.000
  },
  {
    coa_code: '2105',
    account_name: 'Utang Tiket Maskapai Saudia Airlines (USD)',
    currency_code: 'USD',
    net_valas: -25000, // Kewajiban USD 25,000
    recorded_idr_balance: -402500000, // Kurs PO @ 16.100 = Rp 402.500.000
    bi_closing_rate: 16250.0, // Dolar naik ➔ Utang membesar ➔ Rugi Kurs
    fair_value_idr: -406250000,
    unrealized_diff: -3750000, // Rugi Selisih Kurs Belum Terealisasi Rp -3.750.000
  },
];

// 3. AGENT COMMISSIONS (MULTI-TIER SPLITTING)
export const mockAgentCommissions: AgentCommission[] = [
  {
    commission_id: 'comm-01',
    tenant_id: '11111111-1111-1111-1111-111111111111',
    booking_id: 'bkg-01',
    booking_number: 'BKG/C01/2026/10/0001',
    customer_name: 'Hj. Siti Aminah',
    branch_id: 'C01', // Milik KSO Kediri
    agent_id: 'usr-agent-01',
    agent_name: 'Ustadz Hendra Gunawan (Agent Downline Kediri)',
    upline_id: 'usr-coord-01',
    upline_name: 'H. Mahfudz (Koordinator Upline Jawa Timur)',
    recipient_type: 'DIRECT_AGENT',
    commission_trigger: 'ON_DP',
    gross_commission_amount: 1500000,
    pph_21_rate: 5.0,
    pph_21_amount: 75000,
    net_commission_payable: 1425000,
    is_kso_branch_burden: true, // Memotong P&L Cabang KSO Kediri!
    payment_status: 'APPROVED',
    journal_reference: 'JRN/COMM-KSO/202610/001',
    created_at: '2026-10-08T09:00:00Z',
  },
  {
    commission_id: 'comm-02',
    tenant_id: '11111111-1111-1111-1111-111111111111',
    booking_id: 'bkg-01',
    booking_number: 'BKG/C01/2026/10/0001',
    customer_name: 'Hj. Siti Aminah',
    branch_id: 'C01',
    agent_id: 'usr-coord-01',
    agent_name: 'H. Mahfudz (Koordinator Upline Jawa Timur)',
    recipient_type: 'UPLINE_OVERRIDE',
    commission_trigger: 'ON_DP',
    gross_commission_amount: 300000,
    pph_21_rate: 5.0,
    pph_21_amount: 15000,
    net_commission_payable: 285000,
    is_kso_branch_burden: true, // Memotong P&L Cabang KSO Kediri!
    payment_status: 'APPROVED',
    journal_reference: 'JRN/COMM-OVERRIDE/202610/002',
    created_at: '2026-10-08T09:00:00Z',
  },
  {
    commission_id: 'comm-03',
    tenant_id: '11111111-1111-1111-1111-111111111111',
    booking_id: 'bkg-sub-02',
    booking_number: 'BKG/SUB/2026/10/0088',
    customer_name: 'Bpk. Ridwan Kamil',
    branch_id: 'SUB', // Cabang Mandiri Surabaya ➔ Beban HQ/Cabang Pusat
    agent_id: 'usr-agent-sub',
    agent_name: 'Syamsul Ma’arif (Agent Surabaya)',
    recipient_type: 'DIRECT_AGENT',
    commission_trigger: 'ON_FULL_PAID',
    gross_commission_amount: 1750000,
    pph_21_rate: 5.0,
    pph_21_amount: 87500,
    net_commission_payable: 1662500,
    is_kso_branch_burden: false,
    payment_status: 'PENDING',
    created_at: '2026-10-09T08:30:00Z',
  },
];

// 4. AGENT WALLETS & MUTATIONS
export const mockAgentWallets: AgentWallet[] = [
  {
    wallet_id: 'wal-01',
    agent_user_id: 'usr-agent-01',
    agent_name: 'Ustadz Hendra Gunawan',
    branch_id: 'C01',
    current_balance: 35000000, // Rp 35 Juta Saldo Deposit
    last_topup_at: '2026-10-07T11:00:00Z',
    status: 'ACTIVE',
  },
  {
    wallet_id: 'wal-02',
    agent_user_id: 'usr-agent-sub',
    agent_name: 'Syamsul Ma’arif',
    branch_id: 'SUB',
    current_balance: 8500000,
    last_topup_at: '2026-10-05T09:30:00Z',
    status: 'ACTIVE',
  },
];

export const mockWalletMutations: WalletMutation[] = [
  {
    mutation_id: 'wmut-01',
    wallet_id: 'wal-01',
    mutation_type: 'TOPUP_DEPOSIT',
    amount: 50000000,
    balance_before: 0,
    balance_after: 50000000,
    reference_no: 'TOPUP/BSI/202610/0819',
    notes: 'Top-Up Saldo Deposit Agen via Virtual Account BSI',
    created_at: '2026-10-05T10:00:00Z',
  },
  {
    mutation_id: 'wmut-02',
    wallet_id: 'wal-01',
    mutation_type: 'PAYMENT_BOOKING_DEDUCTION',
    amount: 15000000,
    balance_before: 50000000,
    balance_after: 35000000,
    reference_no: 'BKG-PAY-bkg-01',
    notes: 'Potong Saldo Deposit Agen untuk Pelunasan DP Booking Hj. Siti Aminah',
    created_at: '2026-10-07T11:15:00Z',
  },
];

// 5. KSO WHOLESALE MARGINS
export const mockKsoWholesaleMargins: KsoWholesaleMargin[] = [
  {
    settlement_id: 'kso-margin-01',
    branch_id: 'C01',
    package_name: 'Paket Umrah Reguler Awal Musim 9 Hari',
    booking_number: 'BKG/C01/2026/10/0001',
    customer_name: 'Hj. Siti Aminah',
    public_selling_price: 29500000, // Jamaah bayar ke KSO
    hq_nett_price: 26500000, // HQ menagih Harga Nett ke KSO
    kso_gross_margin: 3000000, // Laba Kotor KSO Kediri
    pph_23_rate: 2.0, // PPh 23 Jasa Wholesale (2%)
    pph_23_amount: 60000,
    kso_net_margin: 2940000, // Laba Bersih KSO setelah pajak
    settlement_status: 'INVOICED_BY_HQ',
  },
  {
    settlement_id: 'kso-margin-02',
    branch_id: 'C01',
    package_name: 'Paket Umrah VIP Menara Jam Makkah 12 Hari',
    booking_number: 'BKG/C01/2026/10/0002',
    customer_name: 'H. Bambang Trihatmodjo',
    public_selling_price: 45000000,
    hq_nett_price: 40500000,
    kso_gross_margin: 4500000,
    pph_23_rate: 2.0,
    pph_23_amount: 90000,
    kso_net_margin: 4410000,
    settlement_status: 'PENDING',
  },
];
