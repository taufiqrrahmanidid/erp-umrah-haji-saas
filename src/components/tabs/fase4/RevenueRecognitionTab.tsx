import React, { useState } from 'react';
import {
  TrendingUp,
  Plane,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileText,
  BadgeDollarSign,
  ArrowRight,
  ShieldCheck,
  Building,
  Layers,
  Terminal,
} from 'lucide-react';
import { Manifest, JournalMaster } from '../../../types/erp.ts';

interface RevenueRecognitionTabProps {
  manifests: Manifest[];
  onTriggerDeparture: (manifestId: string) => void;
}

export const RevenueRecognitionTab: React.FC<RevenueRecognitionTabProps> = ({
  manifests,
  onTriggerDeparture,
}) => {
  const [selectedManifestId, setSelectedManifestId] = useState<string>(
    manifests.find((m) => m.status !== 'DEPARTED')?.manifest_id || manifests[0]?.manifest_id || ''
  );
  const [notification, setNotification] = useState<string | null>(null);

  const selectedManifest = manifests.find((m) => m.manifest_id === selectedManifestId) || manifests[0];
  const isAlreadyDeparted = selectedManifest?.status === 'DEPARTED';

  // Sample Calculation Values
  const jamaahCount = selectedManifest?.total_jamaah || 45;
  const packagePricePerPax = 29500000;
  const estimatedHppPerPax = 24000000;
  const totalRevenue = jamaahCount * packagePricePerPax;
  const totalHpp = jamaahCount * estimatedHppPerPax;
  const grossProfit = totalRevenue - totalHpp;

  const handleExecuteTrigger = () => {
    if (isAlreadyDeparted) {
      alert('Manifest ini sudah berstatus DEPARTED dan jurnal pengakuan pendapatan telah dibuat!');
      return;
    }

    onTriggerDeparture(selectedManifest.manifest_id);
    setNotification(
      `Stored Procedure [sp_recognize_revenue_on_departure] Berhasil Dijalankan! Status Manifest [${selectedManifest.manifest_code}] diubah menjadi DEPARTED. 3-Level Journal (Maker) pengakuan Pendapatan Rp ${totalRevenue.toLocaleString(
        'id-ID'
      )} dan HPP Rp ${totalHpp.toLocaleString('id-ID')} telah diposting otomatis!`
    );
    setTimeout(() => setNotification(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Revenue &amp; HPP Recognition Engine (Status Manifest: DEPARTED)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
              Sesuai standar PSAK/Syariah Biro Perjalanan: Uang yang disetor jamaah sebelum terbang berstatus <em>Titipan / Uang Muka (Liabilitas)</em>.{' '}
              Saat kloter berstatus <strong>DEPARTED</strong> (Pesawat lepas landas), Stored Procedure <code>sp_recognize_revenue_on_departure</code> secara otomatis mengeksekusi <strong>Pengakuan Pendapatan</strong> dan <strong>Pengakuan HPP</strong> ke Buku Besar.
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 font-mono text-xs flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <span>sp_recognize_revenue_on_departure</span>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="leading-relaxed">{notification}</span>
        </div>
      )}

      {/* Main Execution Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Execution Trigger Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h4 className="font-semibold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
            <Plane className="w-4 h-4 text-cyan-400" />
            Eksekusi Stored Procedure Keberangkatan
          </h4>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-medium block mb-1">Pilih Manifest / Kloter</label>
              <select
                value={selectedManifestId}
                onChange={(e) => setSelectedManifestId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-medium"
              >
                {manifests.map((m) => (
                  <option key={m.manifest_id} value={m.manifest_id}>
                    {m.manifest_code} - {m.group_name} ({m.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Kode Kloter:</span>
                <span className="font-mono font-bold text-white">{selectedManifest.manifest_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Jamaah:</span>
                <span className="font-mono font-bold text-cyan-300">{selectedManifest.total_jamaah} Orang</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Flight PNR:</span>
                <span className="font-mono text-slate-300">{selectedManifest.departure_flight_pnr}</span>
              </div>
              <div className="flex justify-between border-t border-slate-850 pt-2">
                <span className="text-slate-400">Status Manifest:</span>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                    selectedManifest.status === 'DEPARTED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {selectedManifest.status}
                </span>
              </div>
            </div>

            {/* Financial Preview Box */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <span className="font-semibold text-slate-300 block">Kalkulasi Otomatis Jurnal:</span>
              <div className="flex justify-between text-slate-400">
                <span>Pengakuan Pendapatan (Omzet):</span>
                <span className="font-mono font-bold text-emerald-400">
                  Rp {totalRevenue.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Pengakuan HPP Paket:</span>
                <span className="font-mono font-bold text-amber-400">
                  Rp {totalHpp.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-white font-bold border-t border-slate-850 pt-1.5">
                <span>Estimasi Laba Kotor Kloter:</span>
                <span className="font-mono text-cyan-300">
                  Rp {grossProfit.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <button
              onClick={handleExecuteTrigger}
              disabled={isAlreadyDeparted}
              className={`w-full py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 text-xs ${
                isAlreadyDeparted
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              {isAlreadyDeparted ? 'Telah Diakui (DEPARTED)' : 'Trigger Status DEPARTED & Buat Jurnal'}
            </button>
          </div>
        </div>

        {/* Right: Generated 3-Level Journal Visualizer */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Struktur Jurnal 3-Level Hasil Eksekusi SP Revenue Recognition
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              STATUS: DRAFT_MAKER
            </span>
          </div>

          <div className="space-y-4">
            {/* Level 1: Master Header */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-mono font-bold text-cyan-400">
                  JRN/REV/{new Date().getFullYear()}10/{selectedManifest.manifest_code}
                </span>
                <p className="text-slate-300 font-semibold mt-0.5">
                  Pengakuan Pendapatan &amp; HPP Keberangkatan Kloter: {selectedManifest.group_name}
                </p>
                <p className="text-[11px] text-slate-400">
                  Maker: <strong>SYSTEM_TOUR_OPS_AUTOMATION</strong> • Cabang: <strong>PST (Pusat)</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Total Transaksi Double-Entry:</span>
                <span className="font-mono font-bold text-white text-sm">
                  Rp {(totalRevenue + totalHpp).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Level 2 & 3: Journal Details Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Kode COA</th>
                    <th className="py-3 px-4">Nama Akun Buku Besar</th>
                    <th className="py-3 px-4">Uraian Transaksi</th>
                    <th className="py-3 px-4 text-right">Debit (Rp)</th>
                    <th className="py-3 px-4 text-right">Kredit (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {/* Row 1: Debit Titipan Dana */}
                  <tr className="hover:bg-slate-850/40">
                    <td className="py-3 px-4 text-cyan-400 font-bold">2160</td>
                    <td className="py-3 px-4 font-sans text-white">Titipan Dana Paket Jamaah</td>
                    <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">
                      Eliminasi Kewajiban Uang Muka Jamaah Berangkat
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                      {totalRevenue.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">0</td>
                  </tr>

                  {/* Row 2: Kredit Pendapatan */}
                  <tr className="hover:bg-slate-850/40">
                    <td className="py-3 px-4 text-cyan-400 font-bold">4100</td>
                    <td className="py-3 px-4 font-sans text-white">Pendapatan Paket Umrah &amp; Haji</td>
                    <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">
                      Realisasi Omzet Resmi Kloter {selectedManifest.manifest_code}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">0</td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                      {totalRevenue.toLocaleString('id-ID')}
                    </td>
                  </tr>

                  {/* Row 3: Debit HPP */}
                  <tr className="hover:bg-slate-850/40">
                    <td className="py-3 px-4 text-amber-400 font-bold">5000</td>
                    <td className="py-3 px-4 font-sans text-white">Beban Pokok Pendapatan (HPP Paket)</td>
                    <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">
                      Realisasi Beban Modal Tiket, Hotel &amp; Visa
                    </td>
                    <td className="py-3 px-4 text-right text-amber-400 font-bold">
                      {totalHpp.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">0</td>
                  </tr>

                  {/* Row 4: Kredit Uang Muka Vendor */}
                  <tr className="hover:bg-slate-850/40">
                    <td className="py-3 px-4 text-amber-400 font-bold">1150</td>
                    <td className="py-3 px-4 font-sans text-white">Uang Muka Vendor Tiket / Hotel</td>
                    <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">
                      Pengkreditan Uang Muka Menjadi HPP Riil
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">0</td>
                    <td className="py-3 px-4 text-right text-amber-400 font-bold">
                      {totalHpp.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-950/80 font-mono text-xs border-t border-slate-800">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 text-right font-bold text-slate-400">
                      TOTAL BALANCE (DOUBLE-ENTRY):
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">
                      Rp {(totalRevenue + totalHpp).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">
                      Rp {(totalRevenue + totalHpp).toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-center justify-between">
              <span>Status Jurnal: Seimbang (Balanced) • Debit = Kredit</span>
              <span className="font-bold">PSAK 72 / Syariah Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
