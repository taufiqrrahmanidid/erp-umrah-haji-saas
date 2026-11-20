import React, { useState } from 'react';
import {
  Coins,
  Receipt,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  Upload,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { CashAdvance, FieldExpenseClaim, RoleCode } from '../../../types/erp.ts';

interface CashAdvanceAndElpjTabProps {
  advances: CashAdvance[];
  claims: FieldExpenseClaim[];
  onDisburseAdvance: (advanceId: string) => void;
  onAddClaim: (newClaim: FieldExpenseClaim) => void;
  onClearAdvance: (advanceId: string) => void;
  currentRole: RoleCode;
  currentBranchCode: string;
}

export const CashAdvanceAndElpjTab: React.FC<CashAdvanceAndElpjTabProps> = ({
  advances,
  claims,
  onDisburseAdvance,
  onAddClaim,
  onClearAdvance,
  currentRole,
  currentBranchCode,
}) => {
  const [selectedAdvanceId, setSelectedAdvanceId] = useState<string>(advances[0]?.advance_id || '');

  // Form input E-LPJ klaim nota Saudi
  const [claimCategory, setClaimCategory] = useState<FieldExpenseClaim['expense_category']>('TIPS_DRIVER_BUS_SAUDI');
  const [claimDesc, setClaimDesc] = useState('');
  const [claimAmountSar, setClaimAmountSar] = useState<number>(300);
  const [receiptUrl, setReceiptUrl] = useState('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80');
  const [notification, setNotification] = useState<string | null>(null);

  const selectedAdvance = advances.find((a) => a.advance_id === selectedAdvanceId) || advances[0];

  // Calculate total claims for selected advance
  const currentClaims = claims.filter((c) => c.advance_id === selectedAdvanceId);
  const totalClaimedSar = currentClaims.reduce((acc, curr) => acc + curr.amount_sar, 0);
  const remainingSar = selectedAdvance ? selectedAdvance.amount_valas - totalClaimedSar : 0;

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();

    const newClaim: FieldExpenseClaim = {
      claim_id: `claim-${Date.now()}`,
      advance_id: selectedAdvance.advance_id,
      expense_date: new Date().toISOString().split('T')[0],
      expense_category: claimCategory,
      description: claimDesc,
      amount_sar: claimAmountSar,
      receipt_photo_url: receiptUrl,
      verified_by_finance: true,
    };

    onAddClaim(newClaim);
    setClaimDesc('');
    setNotification(`Klaim E-LPJ SAR ${claimAmountSar} berhasil diunggah dan mengurangi saldo talangan Muthawif.`);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Operasional Lapangan: Cash Advance (Dana Talangan) &amp; E-LPJ Struk Saudi
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
              Alur talangan operasional Muthawif &amp; Tour Leader di Saudi Arabia:
              <strong> 1. Pengajuan 3-Stage:</strong> Saat dicairkan (RELEASED), sistem mendebit <em>Piutang Cash Advance</em> (belum memotong laba/rugi).
              <strong> 2. E-LPJ Mobile:</strong> Muthawif mengunggah nota/struk riil pengeluaran di Makkah &amp; Madinah.
              <strong> 3. Clearing Kepulangan:</strong> Finance melakukan rekonsiliasi dan memposting ke <em>Beban Operasional Rombongan</em> sesungguhnya.
            </p>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 shadow">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Grid: Cash Advance Card vs E-LPJ Uploader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Cash Advance Card & Workflow (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              Detail Dana Talangan (Cash Advance)
            </h4>
            <span className="text-xs font-mono text-cyan-400">{selectedAdvance?.advance_number}</span>
          </div>

          {selectedAdvance && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Penerima Dana:</span>
                  <span className="font-bold text-white">{selectedAdvance.recipient_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rombongan / Kloter:</span>
                  <span className="font-mono text-cyan-400 font-bold">{selectedAdvance.project_group_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Plafon Valas Saudi:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    SAR {selectedAdvance.amount_valas.toLocaleString()} (Rp {selectedAdvance.amount_idr_base.toLocaleString('id-ID')})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tujuan Talangan:</span>
                  <span className="text-slate-200 text-right max-w-[200px]">{selectedAdvance.purpose}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between">
                  <span className="text-slate-400">Status Otorisasi:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                    {selectedAdvance.workflow_status}
                  </span>
                </div>
              </div>

              {/* Sisa Saldo Talangan Box */}
              <div className="grid grid-cols-2 gap-2 text-center font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-sans block">Total Terpakai (Nota)</span>
                  <span className="text-sm font-bold text-rose-400">SAR {totalClaimedSar.toLocaleString()}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-emerald-500 uppercase font-sans block">Sisa Kas Fisik</span>
                  <span className="text-sm font-bold text-emerald-400">SAR {remainingSar.toLocaleString()}</span>
                </div>
              </div>

              {/* Action: Clearing Kepulangan */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onClearAdvance(selectedAdvance.advance_id)}
                  className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 transition"
                >
                  <FileCheck2 className="w-4 h-4" />
                  Clearing Kepulangan &amp; Posting Beban GL
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: E-LPJ Nota Struk Saudi Uploader & History (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Form E-LPJ Struk */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                Upload Nota / E-LPJ Pengeluaran Lapangan Saudi
              </h4>
              <span className="text-xs font-mono text-emerald-400">Muthawif Mobile App</span>
            </div>

            <form onSubmit={handleSubmitClaim} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Kategori Pengeluaran Saudi</label>
                  <select
                    aria-label="Kategori Pengeluaran Saudi"
                    value={claimCategory}
                    onChange={(e) => setClaimCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="TIPS_DRIVER_BUS_SAUDI">Tips Driver Bus SAPTCO Saudi</option>
                    <option value="EXTRA_CATERING_JEDDAH">Extra Konsumsi / Snack Jamaah</option>
                    <option value="KURSI_RODA_THAWAF">Sewa Kursi Roda Resmi Thawaf</option>
                    <option value="OBAT_EMERGENCY_MAKKAH">Obat Emergency Apotek Nahdi</option>
                    <option value="SIM_CARD_CREW">SIM Card Saudi Kru &amp; Mutawif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Nominal Nota (SAR)</label>
                  <input
                    type="number"
                    value={claimAmountSar}
                    onChange={(e) => setClaimAmountSar(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Uraian Pengeluaran</label>
                <input
                  type="text"
                  placeholder="Misal: Biaya sewa kursi roda dorong thawaf putaran 1-7 untuk jamaah..."
                  value={claimDesc}
                  onChange={(e) => setClaimDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">URL Foto Bukti / Struk Fisik</label>
                <input
                  type="url"
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-[11px]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Nota Struk ke E-LPJ
              </button>
            </form>
          </div>

          {/* List of Claims */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
            <h4 className="font-bold text-white text-sm">
              Daftar Struk Masuk ({currentClaims.length} Nota Terverifikasi)
            </h4>

            <div className="space-y-2.5">
              {currentClaims.map((c) => (
                <div
                  key={c.claim_id}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={c.receipt_photo_url}
                      alt="Receipt"
                      className="w-12 h-12 object-cover rounded-lg border border-slate-700"
                    />
                    <div>
                      <span className="font-bold text-white block">{c.description}</span>
                      <span className="text-[11px] text-slate-400">{c.expense_category} • {c.expense_date}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-amber-400 text-sm block">
                      SAR {c.amount_sar.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                      <CheckCircle2 className="w-3 h-3" /> Verifikasi Finance
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
