import React, { useState } from 'react';
import {
  Users,
  Coins,
  ArrowRight,
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertTriangle,
  BadgeDollarSign,
  UserCheck,
  TrendingDown,
  Layers,
  Scale,
} from 'lucide-react';
import { AgentCommission, RoleCode } from '../../../types/erp.ts';

interface AgentCommissionTabProps {
  commissions: AgentCommission[];
  onDisburseCommission: (commissionId: string) => void;
  currentBranchCode: string;
}

export const AgentCommissionTab: React.FC<AgentCommissionTabProps> = ({
  commissions,
  onDisburseCommission,
  currentBranchCode,
}) => {
  const [filterTrigger, setFilterTrigger] = useState<'ALL' | 'ON_DP' | 'ON_FULL_PAID'>('ALL');
  const [notification, setNotification] = useState<string | null>(null);

  const filteredCommissions = commissions.filter((c) => {
    if (filterTrigger === 'ALL') return true;
    return c.commission_trigger === filterTrigger;
  });

  const totalGross = commissions.reduce((acc, c) => acc + c.gross_commission_amount, 0);
  const totalPph = commissions.reduce((acc, c) => acc + c.pph_21_amount, 0);
  const totalNet = commissions.reduce((acc, c) => acc + c.net_commission_payable, 0);

  const handleDisburse = (id: string, isKso: boolean, agentName: string) => {
    onDisburseCommission(id);
    setNotification(
      `Komisi untuk [${agentName}] Berhasil Dicairkan! ${
        isKso
          ? 'Memotong Kas & Laba/Rugi Cabang KSO Kediri (BUKAN HQ).'
          : 'Memotong Kas & Beban Komisi Kantor Pusat HQ.'
      } PPh 21 telah dipotong otomatis.`
    );
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Kemitraan Broker Multi-Tier (B2C), Commission Splitting &amp; Isolasi L/R Cabang
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
              <strong>Multi-Tier Splitting:</strong> Pemecahan komisi menjadi 2 tagihan (Agen Downline &amp; Bonus Override Upline) dengan hitungan <strong>PPh 21 Progresif (5%)</strong>.{' '}
              <strong>Isolasi L/R Cabang (SANGAT PENTING):</strong> Jika agen terdaftar di Cabang KSO (Kediri <code>C01</code>), beban komisi <strong>HANYA memotong Laba/Rugi KSO</strong> dan menggunakan Kas KSO tersebut (BUKAN kas HQ).
            </p>
          </div>
        </div>

        {/* Triggers Filter */}
        <div className="flex gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setFilterTrigger('ALL')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              filterTrigger === 'ALL' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua Trigger
          </button>
          <button
            onClick={() => setFilterTrigger('ON_DP')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              filterTrigger === 'ON_DP' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Trigger Saat DP
          </button>
          <button
            onClick={() => setFilterTrigger('ON_FULL_PAID')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              filterTrigger === 'ON_FULL_PAID' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Trigger Saat Pelunasan
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 shadow">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs">Total Komisi Kotor (Gross):</span>
          <p className="font-mono font-bold text-white text-lg">Rp {totalGross.toLocaleString('id-ID')}</p>
          <span className="text-[11px] text-slate-500">Sebelum pemotongan PPh 21</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs">Potongan PPh 21 Tenaga Ahli (5%):</span>
          <p className="font-mono font-bold text-amber-400 text-lg">Rp {totalPph.toLocaleString('id-ID')}</p>
          <span className="text-[11px] text-slate-500">Disetor ke kas negara via e-Bupot</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs">Total Komisi Bersih Dibayarkan:</span>
          <p className="font-mono font-bold text-emerald-400 text-lg">Rp {totalNet.toLocaleString('id-ID')}</p>
          <span className="text-[11px] text-emerald-500/80">Net Payable ke rekening agen</span>
        </div>
      </div>

      {/* Table Commissions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs">
          <span className="font-bold text-white">Daftar Hak Komisi Broker &amp; Multi-Tier Splitting</span>
          <span className="text-[10px] text-slate-400 font-mono">
            Pemisahan P&amp;L: is_kso_branch_burden = (branch_id = 'C01')
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Nama Agen &amp; Tipe</th>
                <th className="py-3 px-4">Booking / Jamaah</th>
                <th className="py-3 px-4">Entitas Beban P&amp;L</th>
                <th className="py-3 px-4">Trigger Fee</th>
                <th className="py-3 px-4 text-right">Gross (Rp)</th>
                <th className="py-3 px-4 text-right">PPh 21 (5%)</th>
                <th className="py-3 px-4 text-right">Netto (Rp)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans text-slate-300">
              {filteredCommissions.map((comm) => (
                <tr key={comm.commission_id} className="hover:bg-slate-850/40">
                  <td className="py-3 px-4">
                    <p className="font-bold text-white">{comm.agent_name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                          comm.recipient_type === 'UPLINE_OVERRIDE'
                            ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                            : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                        }`}
                      >
                        {comm.recipient_type === 'UPLINE_OVERRIDE' ? 'UPLINE OVERRIDE' : 'DIRECT AGENT'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="text-cyan-400 block">{comm.booking_number}</span>
                    <span className="text-slate-400 font-sans text-[11px]">{comm.customer_name}</span>
                  </td>
                  <td className="py-3 px-4">
                    {comm.is_kso_branch_burden ? (
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-bold">
                        L/R Cabang KSO Kediri
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                        L/R Kantor Pusat (HQ)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-amber-300 font-semibold">
                    {comm.commission_trigger}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold">
                    Rp {comm.gross_commission_amount.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-amber-400">
                    -Rp {comm.pph_21_amount.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    Rp {comm.net_commission_payable.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        comm.payment_status === 'DISBURSED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {comm.payment_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {comm.payment_status !== 'DISBURSED' ? (
                      <button
                        onClick={() => handleDisburse(comm.commission_id, comm.is_kso_branch_burden, comm.agent_name)}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition shadow"
                      >
                        Cairkan
                      </button>
                    ) : (
                      <span className="text-slate-500 text-[11px] font-mono">Lunas</span>
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
