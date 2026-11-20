import React, { useState } from 'react';
import {
  FileText,
  Building,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Download,
  Filter,
  PieChart,
  Scale,
  Sparkles,
} from 'lucide-react';
import {
  FinancialReportItem,
  ConsolidationReportRow,
  RoleCode,
} from '../../../types/erp.ts';

interface FinancialReportsTabProps {
  profitLossItems: FinancialReportItem[];
  balanceSheetItems: FinancialReportItem[];
  consolidationRows: ConsolidationReportRow[];
  currentRole: RoleCode;
  currentBranchCode: string;
}

export const FinancialReportsTab: React.FC<FinancialReportsTabProps> = ({
  profitLossItems,
  balanceSheetItems,
  consolidationRows,
  currentRole,
  currentBranchCode,
}) => {
  const [reportType, setReportType] = useState<'PL' | 'BS' | 'CONSOLIDATION' | 'GL'>('CONSOLIDATION');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('ALL');

  const totalRevenue = profitLossItems.filter((i) => i.category === 'REVENUE').reduce((acc, i) => acc + i.ending_balance, 0);
  const totalCogs = profitLossItems.filter((i) => i.category === 'COGS').reduce((acc, i) => acc + i.ending_balance, 0);
  const grossProfit = totalRevenue - totalCogs;
  const totalOpex = profitLossItems.filter((i) => i.category === 'OPEX').reduce((acc, i) => acc + i.ending_balance, 0);
  const netProfit = grossProfit - totalOpex;

  const totalAssets = balanceSheetItems.filter((i) => i.category === 'ASSET').reduce((acc, i) => acc + i.ending_balance, 0);
  const totalLiabilities = balanceSheetItems.filter((i) => i.category === 'LIABILITY').reduce((acc, i) => acc + i.ending_balance, 0);
  const totalEquity = balanceSheetItems.filter((i) => i.category === 'EQUITY').reduce((acc, i) => acc + i.ending_balance, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Standard Financial Reports &amp; Konsolidasi Perusahaan Grup
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
              Data laporan keuangan <strong>HANYA bersumber dari jurnal berstatus RELEASED</strong>.{' '}
              Mendukung filter <strong>Stand-Alone Cabang</strong> (PST, SUB, MLG, C01) dan <strong>Konsolidasi Penuh ('ALL')</strong> dengan eliminasi otomatis akun <em>RAK Intercompany</em> dan saldo <em>B2B KSO</em> untuk mencegah double-counting.
            </p>
          </div>
        </div>

        {/* Filter Branch */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Entitas:
          </span>
          <select
            value={selectedBranchFilter}
            onChange={(e) => setSelectedBranchFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-bold rounded-lg p-2"
          >
            <option value="ALL">Grup Konsolidasi Penuh (ALL)</option>
            <option value="PST">Kantor Pusat (HQ Jakarta)</option>
            <option value="SUB">Cabang Mandiri (Surabaya)</option>
            <option value="MLG">Cabang Mandiri (Malang)</option>
            <option value="C01">Cabang Mitra KSO (Kediri)</option>
          </select>
        </div>
      </div>

      {/* Report Sub-Tabs Switcher */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setReportType('CONSOLIDATION')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
            reportType === 'CONSOLIDATION'
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Matriks Eliminasi Konsolidasi</span>
        </button>
        <button
          onClick={() => setReportType('PL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
            reportType === 'PL' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Laba Rugi (Profit &amp; Loss)
        </button>
        <button
          onClick={() => setReportType('BS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
            reportType === 'BS' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Neraca (Balance Sheet)
        </button>
        <button
          onClick={() => setReportType('GL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
            reportType === 'GL' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Buku Besar (General Ledger)
        </button>
      </div>

      {/* REPORT 1: CONSOLIDATION MATRIX WITH INTERCOMPANY ELIMINATIONS */}
      {reportType === 'CONSOLIDATION' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-white text-sm">
                Matriks Konsolidasi Grup &amp; Jurnal Eliminasi Otomatis
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Mengeliminasi RAK [1200]/[2200] dan Piutang/Utang B2B KSO [1140]/[2140] secara presisi.
              </p>
            </div>
            <span className="font-mono text-emerald-400 text-xs px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 font-bold">
              Formula: Konsolidasi = HQ + Mandiri + KSO - Eliminasi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">COA</th>
                  <th className="py-3 px-4">Nama Akun Buku Besar</th>
                  <th className="py-3 px-4 text-right">Pusat (HQ)</th>
                  <th className="py-3 px-4 text-right">Cab. Mandiri</th>
                  <th className="py-3 px-4 text-right">Cab. KSO</th>
                  <th className="py-3 px-4 text-right text-amber-400">Eliminasi (D)</th>
                  <th className="py-3 px-4 text-right text-amber-400">Eliminasi (K)</th>
                  <th className="py-3 px-4 text-right text-emerald-400">Saldo Konsolidasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {consolidationRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-850/40">
                    <td className="py-3 px-4 text-cyan-400 font-bold">{row.coa_code}</td>
                    <td className="py-3 px-4 font-sans text-white font-medium">{row.account_name}</td>
                    <td className="py-3 px-4 text-right">Rp {row.hq_balance.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4 text-right">Rp {row.mandiri_branches_balance.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4 text-right">Rp {row.kso_branches_balance.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4 text-right text-amber-400 font-bold">
                      {row.elimination_debit > 0 ? `Rp ${row.elimination_debit.toLocaleString('id-ID')}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right text-amber-400 font-bold">
                      {row.elimination_credit > 0 ? `Rp ${row.elimination_credit.toLocaleString('id-ID')}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-bold text-sm">
                      Rp {row.consolidated_balance.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 2: PROFIT & LOSS */}
      {reportType === 'PL' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-xs">Total Pendapatan (Omzet):</span>
              <p className="font-mono font-bold text-white text-base">Rp {totalRevenue.toLocaleString('id-ID')}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-xs">Total HPP Paket:</span>
              <p className="font-mono font-bold text-amber-400 text-base">Rp {totalCogs.toLocaleString('id-ID')}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-xs">Laba Kotor (Gross Profit):</span>
              <p className="font-mono font-bold text-cyan-300 text-base">Rp {grossProfit.toLocaleString('id-ID')}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-emerald-800/40 space-y-1">
              <span className="text-slate-400 text-xs">Laba Bersih (Net Profit):</span>
              <p className="font-mono font-bold text-emerald-400 text-base">Rp {netProfit.toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
            <div className="p-4 border-b border-slate-800 text-xs font-bold text-white">
              Rincian Laporan Laba Rugi Komprehensif
            </div>
            <div className="divide-y divide-slate-800 text-xs font-mono">
              {profitLossItems.map((item, idx) => (
                <div key={idx} className="p-3.5 flex justify-between items-center hover:bg-slate-850/40">
                  <div>
                    <span className="text-cyan-400 font-bold mr-2">{item.coa_code}</span>
                    <span className="text-white font-sans font-medium">{item.account_name}</span>
                  </div>
                  <span
                    className={`font-bold ${
                      item.category === 'REVENUE'
                        ? 'text-emerald-400'
                        : item.category === 'COGS'
                        ? 'text-amber-400'
                        : 'text-slate-300'
                    }`}
                  >
                    Rp {item.ending_balance.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3: BALANCE SHEET */}
      {reportType === 'BS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-xs">Total Aset (Aktiva):</span>
              <p className="font-mono font-bold text-emerald-400 text-base">Rp {totalAssets.toLocaleString('id-ID')}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-xs">Total Liabilitas (Kewajiban &amp; Titipan):</span>
              <p className="font-mono font-bold text-amber-400 text-base">Rp {totalLiabilities.toLocaleString('id-ID')}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-xs">Total Ekuitas &amp; Laba:</span>
              <p className="font-mono font-bold text-cyan-300 text-base">Rp {totalEquity.toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
            <div className="p-4 border-b border-slate-800 text-xs font-bold text-white">
              Posisi Neraca (Aktiva vs Pasiva Seimbang)
            </div>
            <div className="divide-y divide-slate-800 text-xs font-mono">
              {balanceSheetItems.map((item, idx) => (
                <div key={idx} className="p-3.5 flex justify-between items-center hover:bg-slate-850/40">
                  <div>
                    <span className="text-cyan-400 font-bold mr-2">{item.coa_code}</span>
                    <span className="text-white font-sans font-medium">{item.account_name}</span>
                  </div>
                  <span className="font-bold text-white">
                    Rp {item.ending_balance.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REPORT 4: GENERAL LEDGER */}
      {reportType === 'GL' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-xs space-y-3">
          <h4 className="font-bold text-white text-sm">General Ledger (Mutasi per COA dari Jurnal RELEASED)</h4>
          <p className="text-slate-400 text-[11px]">
            Seluruh data buku besar terisolasi sesuai RLS cabang dan hanya menarik data transaksi yang telah melalui 3-stage authorization definitif.
          </p>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-slate-300 space-y-2">
            <p>• COA 1010 [Kas &amp; Bank]: Total Mutasi Debit Rp 1.850.000.000 | Kredit Rp 154.750.000</p>
            <p>• COA 1020 [Kas Valas SAR]: Total Mutasi Debit SAR 185.000 | Kredit SAR 100.000</p>
            <p>• COA 2160 [Titipan Dana Jamaah]: Tereliminasi otomatis saat status manifest DEPARTED</p>
            <p>• COA 4100 [Pendapatan Umrah]: Diakui definitif setelah kloter terbang</p>
          </div>
        </div>
      )}
    </div>
  );
};
