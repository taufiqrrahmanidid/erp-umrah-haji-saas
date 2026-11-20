import React, { useState } from 'react';
import {
  Wallet,
  Coins,
  CreditCard,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  DollarSign,
  ArrowRight,
  Send,
  Building,
} from 'lucide-react';
import { OfficeExpense, PayrollRun, JournalMaster, RoleCode } from '../../../types/erp.ts';

interface PettyCashAndPayrollTabProps {
  expenses: OfficeExpense[];
  payrollRun: PayrollRun;
  onAddExpense: (expense: OfficeExpense) => void;
  onGeneratePayrollJournal: () => void;
  currentBranchCode: string;
  currentRole: RoleCode;
}

export const PettyCashAndPayrollTab: React.FC<PettyCashAndPayrollTabProps> = ({
  expenses,
  payrollRun,
  onAddExpense,
  onGeneratePayrollJournal,
  currentBranchCode,
  currentRole,
}) => {
  const [subTab, setSubTab] = useState<'PETTY_CASH' | 'PAYROLL'>('PETTY_CASH');

  // Form input Petty Cash
  const [expenseDate, setExpenseDate] = useState('2026-10-09');
  const [category, setCategory] = useState<OfficeExpense['category']>('ATK');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(350000);
  const [notification, setNotification] = useState<string | null>(null);

  const isKsoBranch = currentBranchCode !== 'C00';

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();

    const newExp: OfficeExpense = {
      expense_id: `exp-${Date.now()}`,
      tenant_id: '11111111-1111-1111-1111-111111111111',
      branch_id: currentBranchCode,
      expense_date: expenseDate,
      expense_no: `EXP/${currentBranchCode}/${new Date().getFullYear()}/${String(
        new Date().getMonth() + 1
      ).padStart(2, '0')}/${String(expenses.length + 1).padStart(3, '0')}`,
      category,
      description,
      amount,
      paid_from_coa_code: isKsoBranch ? `1101-${currentBranchCode}` : '1101-001',
      expense_coa_code: isKsoBranch ? '6102-BEBAN-OPEX-KEDIRI' : '6101-BEBAN-OPEX-HQ',
      status: 'DRAFT_MAKER',
      created_by_name: `Staf Admin ${currentBranchCode}`,
      created_at: new Date().toISOString(),
    };

    onAddExpense(newExp);
    setDescription('');
    setNotification(
      `Pengeluaran Kas Kecil nomor ${newExp.expense_no} berhasil dicatat (Status: DRAFT_MAKER).`
    );
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Modul Office Operations, Petty Cash &amp; Auto-Jurnal Payroll
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
              <strong>Kas Kecil (Petty Cash):</strong> Pengeluaran operasional cabang KSO mengkredit Kas Lokal KSO
              dan men-debit Beban Opex KSO. <strong>Payroll Engine:</strong> Perhitungan gaji, BPJS, PPh 21, dan
              kasbon yang saat di-release otomatis menerbitkan 3-Level Journal ke antrean Buku Besar.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSubTab('PETTY_CASH')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              subTab === 'PETTY_CASH'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            Kas Kecil Cabang ({expenses.length})
          </button>
          <button
            onClick={() => setSubTab('PAYROLL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              subTab === 'PAYROLL'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Payroll &amp; Auto-Jurnal GL
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 shadow">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Subtab 1: Petty Cash */}
      {subTab === 'PETTY_CASH' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Entri Kas Kecil (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Catat Pengeluaran Kas Kecil
              </h4>
              <span className="text-xs font-mono text-cyan-400">Cabang: {currentBranchCode}</span>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Tanggal Transaksi</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Kategori Pengeluaran</label>
                <select
                  aria-label="Kategori Pengeluaran"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                >
                  <option value="ATK">Alat Tulis Kantor (ATK)</option>
                  <option value="KONSUMSI_MANASIK">Konsumsi Snack Manasik / Rapat</option>
                  <option value="BIAYA_KURIR_PASPOR">Kurir Ekspedisi Paspor ke HQ</option>
                  <option value="OPERASIONAL_BANDARA">Operasional Penjemputan / Handling</option>
                  <option value="UTILITAS_LISTRIK_AIR">Utilitas Listrik / Air Cabang</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Nominal Pengeluaran (IDR)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Keterangan / Uraian Nota</label>
                <textarea
                  rows={2}
                  placeholder="Misal: Pembelian materai 10.000 untuk berkas akad jamaah..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-500 font-sans block">
                  Simulasi Akun Terpengaruh:
                </span>
                <div className="text-emerald-400">(D) {isKsoBranch ? '6102-BEBAN-OPEX-KEDIRI' : '6101-BEBAN-OPEX-HQ'}</div>
                <div className="text-rose-400">(C) {isKsoBranch ? `1101-${currentBranchCode} (Kas Kecil KSO)` : '1101-001 (Kas HQ)'}</div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Simpan ke DRAFT_MAKER
              </button>
            </form>
          </div>

          {/* List Riwayat Kas Kecil (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm">
                Daftar Buku Kas Kecil (office_expenses)
              </h4>
              <span className="text-xs text-slate-400">{expenses.length} Transaksi Tercatat</span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-3 py-2.5">No. Pengeluaran</th>
                    <th className="px-3 py-2.5">Tanggal</th>
                    <th className="px-3 py-2.5">Kategori &amp; Uraian</th>
                    <th className="px-3 py-2.5 text-right">Nominal (IDR)</th>
                    <th className="px-3 py-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-mono">
                  {expenses.map((exp) => (
                    <tr key={exp.expense_id} className="hover:bg-slate-800/40">
                      <td className="px-3 py-2.5 text-cyan-400 font-bold">{exp.expense_no}</td>
                      <td className="px-3 py-2.5 text-slate-400">{exp.expense_date}</td>
                      <td className="px-3 py-2.5 font-sans">
                        <div className="font-semibold text-white">{exp.category}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{exp.description}</div>
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-emerald-400">
                        Rp {exp.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                            exp.status === 'RELEASED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          }`}
                        >
                          {exp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Payroll Engine & Auto-Journal */}
      {subTab === 'PAYROLL' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-400 font-bold text-sm">
                    {payrollRun.payroll_no}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Periode: Oktober 2026 ({payrollRun.status})
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Rekapitulasi Gaji Pokok, Tunjangan, BPJS, PPh 21, dan Potongan Kasbon
                </p>
              </div>

              <button
                onClick={onGeneratePayrollJournal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition flex items-center gap-2"
              >
                <FileCheck2 className="w-4 h-4" />
                Generate Auto-Jurnal 3-Level (Buku Besar)
              </button>
            </div>

            {/* Payroll Breakdown Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Total Gaji Pokok &amp; Tunjangan</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  Rp {(payrollRun.total_gaji_pokok + payrollRun.total_tunjangan).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Iuran BPJS (Kesehatan + Ketenagakerjaan)</span>
                <span className="font-mono font-bold text-rose-400 text-sm">
                  Rp {(payrollRun.total_bpjs_kesehatan + payrollRun.total_bpjs_ketenagakerjaan).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">PPh Pasal 21 Terutang</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  Rp {payrollRun.total_pph21.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Gaji Bersih (Take Home Pay)</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">
                  Rp {payrollRun.total_gaji_netto.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Auto-Journal Preview Box */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block">
                Skema Double-Entry 3-Level Journal yang Terbentuk Otomatis saat Release:
              </span>

              <div className="bg-slate-900 rounded p-3 font-mono text-xs text-slate-300 space-y-1 border border-slate-800">
                <div className="text-emerald-400">
                  (D) 6101-BEBAN-GAJI-KARYAWAN &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: Rp {(payrollRun.total_gaji_pokok + payrollRun.total_tunjangan).toLocaleString('id-ID')}
                </div>
                <div className="text-rose-400 pl-6">
                  (C) 2105-UTANG-GAJI (Netto) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: Rp {payrollRun.total_gaji_netto.toLocaleString('id-ID')}
                </div>
                <div className="text-amber-400 pl-6">
                  (C) 2107-UTANG-PPH21 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: Rp {payrollRun.total_pph21.toLocaleString('id-ID')}
                </div>
                <div className="text-amber-400 pl-6">
                  (C) 2106-UTANG-BPJS &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: Rp {(payrollRun.total_bpjs_kesehatan + payrollRun.total_bpjs_ketenagakerjaan).toLocaleString('id-ID')}
                </div>
                <div className="text-cyan-400 pl-6">
                  (C) 1101-C01-KASBON (Pelunasan Kasbon) : Rp {payrollRun.total_kasbon_deduction.toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
