import React, { useState } from 'react';
import {
  Coins,
  Play,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  FileText,
  Clock,
  ShieldCheck,
  Building,
  Terminal,
} from 'lucide-react';
import { UnrealizedFxItem, RoleCode } from '../../../types/erp.ts';

interface UnrealizedFxTabProps {
  fxItems: UnrealizedFxItem[];
  onTriggerRevaluation: (periodMonth: string) => void;
  currentRole: RoleCode;
}

export const UnrealizedFxTab: React.FC<UnrealizedFxTabProps> = ({
  fxItems,
  onTriggerRevaluation,
  currentRole,
}) => {
  const [periodMonth, setPeriodMonth] = useState('2026-10');
  const [sarRate, setSarRate] = useState<number>(4250.0);
  const [usdRate, setUsdRate] = useState<number>(16250.0);
  const [notification, setNotification] = useState<string | null>(null);
  const [revalued, setRevalued] = useState(false);

  // Totals
  const totalGain = fxItems.filter((i) => i.unrealized_diff > 0).reduce((acc, i) => acc + i.unrealized_diff, 0);
  const totalLoss = fxItems.filter((i) => i.unrealized_diff < 0).reduce((acc, i) => acc + Math.abs(i.unrealized_diff), 0);
  const netUnrealized = totalGain - totalLoss;

  const handleRunRevaluation = () => {
    onTriggerRevaluation(periodMonth);
    setRevalued(true);
    setNotification(
      `Stored Procedure [sp_revalue_unrealized_fx_monthly] Berhasil Dieksekusi untuk periode ${periodMonth}! Jurnal Penyesuaian DRAFT_MAKER dibuat otomatis untuk di-review Manajer Keuangan. Net Selisih Kurs: ${
        netUnrealized >= 0 ? '+' : '-'
      }Rp ${Math.abs(netUnrealized).toLocaleString('id-ID')}`
    );
    setTimeout(() => setNotification(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Engine Mitigasi Kurs Valas (Unrealized Foreign Exchange Loss/Gain)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
              <strong>Cron Job Akhir Bulan:</strong> Memindai seluruh pos moneter valas (Kas SAR/USD, Uang Muka Hotel Makkah, Utang Maskapai) di tabel <code>journal_details</code>.{' '}
              Bandingkan dengan kurs penutupan Bank Indonesia (BI) terbaru dari <code>exchange_rates</code>.{' '}
              Otomatis men-generate <strong>Jurnal Penyesuaian 3-Level</strong> berstatus <code>DRAFT_MAKER</code> (pembuat: sistem) untuk persetujuan Manajer Keuangan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-cyan-400 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            Cron: 59 23 28-31 * *
          </span>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800 text-cyan-200 text-xs flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="leading-relaxed">{notification}</span>
        </div>
      )}

      {/* Control Panel & Rate Comparator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h4 className="font-semibold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
            <Clock className="w-4 h-4 text-cyan-400" />
            Parameter Revaluasi Valas Akhir Bulan
          </h4>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-medium block mb-1">Periode Bulan Buku</label>
              <input
                type="month"
                value={periodMonth}
                onChange={(e) => setPeriodMonth(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Kurs BI Penutupan (SAR)</label>
                <input
                  type="number"
                  step="0.5"
                  value={sarRate}
                  onChange={(e) => setSarRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-cyan-300 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium block mb-1">Kurs BI Penutupan (USD)</label>
                <input
                  type="number"
                  step="5"
                  value={usdRate}
                  onChange={(e) => setUsdRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-emerald-300 font-mono font-bold"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <span className="font-semibold text-slate-300 block">Ringkasan Efek Laba / Rugi:</span>
              <div className="flex justify-between text-slate-400">
                <span>Potensi Untung Valas (Laba):</span>
                <span className="font-mono text-emerald-400 font-bold">+Rp {totalGain.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Potensi Rugi Valas (Beban):</span>
                <span className="font-mono text-amber-400 font-bold">-Rp {totalLoss.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold text-white border-t border-slate-850 pt-2">
                <span>Net Unrealized FX Gain/Loss:</span>
                <span className={`font-mono ${netUnrealized >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {netUnrealized >= 0 ? '+' : '-'}Rp {Math.abs(netUnrealized).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <button
              onClick={handleRunRevaluation}
              className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition flex items-center justify-center gap-2 shadow"
            >
              <Play className="w-4 h-4 fill-current" />
              Jalankan SP Revaluasi &amp; Generate Jurnal
            </button>
          </div>
        </div>

        {/* Posisi Akun Valas Scanner Results */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Posisi Akun Moneter Valas Belum Terevaluasi
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              Query: journal_details (currency_code IN ('SAR', 'USD'))
            </span>
          </div>

          <div className="space-y-3">
            {fxItems.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-400">{item.coa_code}</span>
                    <span className="font-bold text-white">{item.account_name}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
                      {item.currency_code}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Saldo Valas: <strong className="text-slate-200 font-mono">{item.net_valas.toLocaleString()} {item.currency_code}</strong> • Tercatat di Buku: <span className="font-mono">Rp {item.recorded_idr_balance.toLocaleString('id-ID')}</span>
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Nilai Wajar Kurs BI ({item.bi_closing_rate}): <strong className="text-white font-mono">Rp {item.fair_value_idr.toLocaleString('id-ID')}</strong>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Penyesuaian Unrealized:</span>
                  <span
                    className={`font-mono font-bold text-sm flex items-center justify-end gap-1 ${
                      item.unrealized_diff >= 0 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {item.unrealized_diff >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {item.unrealized_diff >= 0 ? '+' : '-'} Rp {Math.abs(item.unrealized_diff).toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {item.unrealized_diff >= 0 ? 'Laba Belum Terealisasi' : 'Rugi Belum Terealisasi'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Generated Journal Box Preview */}
          {revalued && (
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/60 space-y-3 text-xs animate-in fade-in">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-bold text-cyan-400 font-mono">
                  JRN/ADJ-FX/{periodMonth.replace('-', '')}/0081 (DRAFT_MAKER)
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-bold text-[10px]">
                  Menunggu Approval Manajer Keuangan
                </span>
              </div>
              <div className="space-y-1 text-slate-300 font-mono text-[11px]">
                <p>• (D) [1020] Kas Valas SAR: Rp 5.950.000 (Apresiasi Aset Kas)</p>
                <p>• (D) [1150] Uang Muka Hotel SAR: Rp 8.400.000 (Apresiasi Piutang)</p>
                <p className="text-emerald-400">• (K) [4350] Laba Selisih Kurs Belum Terealisasi: Rp 14.350.000</p>
                <p>• (D) [6300] Rugi Selisih Kurs Belum Terealisasi: Rp 3.750.000</p>
                <p className="text-amber-400">• (K) [2105] Utang Tiket Maskapai USD: Rp 3.750.000 (Kenaikan Liabilitas)</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
