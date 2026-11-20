import React, { useState } from 'react';
import {
  TrendingUp,
  Building,
  CheckCircle2,
  AlertTriangle,
  BadgeDollarSign,
  ArrowRight,
  ShieldCheck,
  Scale,
  FileSpreadsheet,
  Receipt,
} from 'lucide-react';
import { KsoWholesaleMargin, RoleCode } from '../../../types/erp.ts';

interface KsoB2BMarginTabProps {
  margins: KsoWholesaleMargin[];
  onSettleMargin: (settlementId: string) => void;
  currentRole: RoleCode;
  currentBranchCode: string;
}

export const KsoB2BMarginTab: React.FC<KsoB2BMarginTabProps> = ({
  margins,
  onSettleMargin,
  currentRole,
  currentBranchCode,
}) => {
  const [notification, setNotification] = useState<string | null>(null);

  const totalPublic = margins.reduce((acc, m) => acc + m.public_selling_price, 0);
  const totalHqNett = margins.reduce((acc, m) => acc + m.hq_nett_price, 0);
  const totalGrossMargin = margins.reduce((acc, m) => acc + m.kso_gross_margin, 0);
  const totalPph23 = margins.reduce((acc, m) => acc + m.pph_23_amount, 0);
  const totalNetMargin = margins.reduce((acc, m) => acc + m.kso_net_margin, 0);

  const handleExecuteSettle = (id: string, custName: string) => {
    onSettleMargin(id);
    setNotification(
      `Settlement Margin KSO untuk [${custName}] Berhasil! HQ menerbitkan Tagihan B2B Harga Nett, KSO mengakui Laba Margin Bersih setelah dipotong PPh 23 (2%). Jurnal telah diposting!`
    );
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Kemitraan KSO (B2B Wholesale) &amp; Perhitungan Margin Bersih
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
              <strong>Mekanisme Harga Nett KSO:</strong> Jamaah membayar harga normal ke KSO (misal Rp 29.500.000).{' '}
              Kantor Pusat (HQ) menagih <strong>'Harga Nett'</strong> ke KSO (misal Rp 26.500.000).{' '}
              Selisih pembayaran otomatis diakui sebagai <strong>Laba/Margin Cabang KSO</strong> dengan pemotongan <strong>PPh Pasal 23 / PPh Final (2%)</strong> saat pembagian margin dieksekusi.
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800 text-cyan-300 font-mono text-xs flex items-center gap-1.5">
          <Building className="w-4 h-4" />
          <span>Mitra KSO Kediri (C01)</span>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 shadow">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Margin Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs">Total Pembayaran Jamaah (Gross):</span>
          <p className="font-mono font-bold text-white text-base">Rp {totalPublic.toLocaleString('id-ID')}</p>
          <span className="text-[11px] text-slate-500">Diterima rekening KSO</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs">Tagihan Harga Nett HQ (B2B):</span>
          <p className="font-mono font-bold text-amber-400 text-base">Rp {totalHqNett.toLocaleString('id-ID')}</p>
          <span className="text-[11px] text-slate-500">Wajib disetor ke Pusat HQ</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs">Laba Kotor Margin KSO:</span>
          <p className="font-mono font-bold text-cyan-300 text-base">Rp {totalGrossMargin.toLocaleString('id-ID')}</p>
          <span className="text-[11px] text-slate-500">Sebelum dipotong PPh 23</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-emerald-800/40 space-y-1">
          <span className="text-slate-400 text-xs">Laba Bersih KSO (Net Margin):</span>
          <p className="font-mono font-bold text-emerald-400 text-base">Rp {totalNetMargin.toLocaleString('id-ID')}</p>
          <span className="text-[11px] text-emerald-400/80">Setelah PPh 23 (2%): Rp {totalPph23.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Table Wholesale Margins */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs">
          <span className="font-bold text-white">Daftar Margin Wholesale Paket Cabang KSO Kediri</span>
          <span className="text-[10px] text-slate-400 font-mono">
            Rumus: Margin = Harga Jamaah - Tagihan Nett HQ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">No. Booking &amp; Jamaah</th>
                <th className="py-3 px-4">Nama Paket Umrah</th>
                <th className="py-3 px-4 text-right">Harga Jamaah (Rp)</th>
                <th className="py-3 px-4 text-right">Tagihan Nett HQ (Rp)</th>
                <th className="py-3 px-4 text-right">Margin Kotor KSO</th>
                <th className="py-3 px-4 text-right">PPh 23 (2%)</th>
                <th className="py-3 px-4 text-right">Laba Bersih KSO</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans text-slate-300">
              {margins.map((m) => (
                <tr key={m.settlement_id} className="hover:bg-slate-850/40">
                  <td className="py-3 px-4 font-mono">
                    <span className="text-cyan-400 font-bold block">{m.booking_number}</span>
                    <span className="text-white font-sans text-xs">{m.customer_name}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-200">{m.package_name}</td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                    Rp {m.public_selling_price.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-amber-400">
                    Rp {m.hq_nett_price.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-cyan-300">
                    +Rp {m.kso_gross_margin.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-amber-400">
                    -Rp {m.pph_23_amount.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    Rp {m.kso_net_margin.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.settlement_status === 'SETTLED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : m.settlement_status === 'INVOICED_BY_HQ'
                          ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {m.settlement_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {m.settlement_status !== 'SETTLED' ? (
                      <button
                        onClick={() => handleExecuteSettle(m.settlement_id, m.customer_name)}
                        className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-[11px] transition shadow"
                      >
                        Settle Margin
                      </button>
                    ) : (
                      <span className="text-slate-500 text-[11px] font-mono">Terselesaikan</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
