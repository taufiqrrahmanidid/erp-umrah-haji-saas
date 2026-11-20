import React, { useState } from 'react';
import {
  Plane,
  Compass,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Camera,
  MapPin,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building,
} from 'lucide-react';
import {
  KloterProfitability,
  SeatLoadFactor,
  CommandCenterItem,
} from '../../../types/erp.ts';

interface ExecutiveAndCommandCenterTabProps {
  kloterProfitabilities: KloterProfitability[];
  seatLoadFactors: SeatLoadFactor[];
  commandCenterItems: CommandCenterItem[];
  onUpdateActivityStatus?: (
    manifestId: string,
    newStatus: 'ON_TRACK' | 'DELAYED' | 'COMPLETED',
    notes?: string
  ) => void;
}

export const ExecutiveAndCommandCenterTab: React.FC<
  ExecutiveAndCommandCenterTabProps
> = ({
  kloterProfitabilities,
  seatLoadFactors,
  commandCenterItems,
  onUpdateActivityStatus,
}) => {
  const [activeSubView, setActiveSubView] = useState<
    'EXECUTIVE' | 'COMMAND_CENTER' | 'SEAT_LOAD'
  >('EXECUTIVE');
  const [selectedManifestFilter, setSelectedManifestFilter] =
    useState<string>('ALL');
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(
    null
  );

  // Aggregated executive metrics
  const totalPassengers = kloterProfitabilities.reduce(
    (acc, k) => acc + k.total_passengers,
    0
  );
  const totalRevenue = kloterProfitabilities.reduce(
    (acc, k) => acc + k.total_revenue_idr,
    0
  );
  const totalCogs = kloterProfitabilities.reduce(
    (acc, k) => acc + k.total_realized_cogs_idr,
    0
  );
  const totalGrossProfit = totalRevenue - totalCogs;
  const overallMargin =
    totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;

  const totalSeatsAllocated = seatLoadFactors.reduce(
    (acc, s) => acc + s.total_seats,
    0
  );
  const totalSeatsBooked = seatLoadFactors.reduce(
    (acc, s) => acc + s.booked_seats,
    0
  );
  const overallSeatLoadFactor =
    totalSeatsAllocated > 0
      ? (totalSeatsBooked / totalSeatsAllocated) * 100
      : 0;

  const filteredCommandItems =
    selectedManifestFilter === 'ALL'
      ? commandCenterItems
      : commandCenterItems.filter(
          (item) => item.manifest_id === selectedManifestFilter
        );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Executive Dashboard &amp; Command Center Live Tracking
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
              Monitoring tingkat tinggi untuk dewan direksi dan tim operasional
              lapangan: <strong>Profitabilitas Riil per Kloter</strong>,{' '}
              <strong>Utilisasi Seat Pesawat (Seat Load Factor)</strong>, serta{' '}
              <strong>Live Telemetri Saudi Ops</strong> (Posisi Bus, Muthawif,
              TL, dan bukti foto kegiatan real-time).
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveSubView('EXECUTIVE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubView === 'EXECUTIVE'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Profitabilitas Kloter</span>
          </button>
          <button
            onClick={() => setActiveSubView('SEAT_LOAD')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubView === 'SEAT_LOAD'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>Seat Load Factor</span>
          </button>
          <button
            onClick={() => setActiveSubView('COMMAND_CENTER')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubView === 'COMMAND_CENTER'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Command Center Lapangan</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Jamaah Kloter
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-mono font-bold text-white">
              {totalPassengers}
            </span>
            <span className="text-xs text-slate-400">Pax Terdaftar</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Akumulasi Omzet Kloter
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-mono font-bold text-emerald-400">
              Rp {(totalRevenue / 1000000).toLocaleString('id-ID')}M
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Laba Kotor &amp; Margin
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-mono font-bold text-cyan-300">
              Rp {(totalGrossProfit / 1000000).toLocaleString('id-ID')}M
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold font-mono">
              {overallMargin.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Seat Load Factor
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-mono font-bold text-amber-400">
              {overallSeatLoadFactor.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400">
              {totalSeatsBooked}/{totalSeatsAllocated} Seat
            </span>
          </div>
        </div>
      </div>

      {/* SUBVIEW 1: KLOTER PROFITABILITY */}
      {activeSubView === 'EXECUTIVE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
          <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-white text-sm">
                Analisis Profitabilitas Riil per Rombongan / Kloter
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Mengombinasikan data <code>bookings</code> (Revenue) dan{' '}
                <code>package_rabs</code> (HPP riil per pax) untuk menghitung
                margin kotor tiap keberangkatan.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                View: v_kloter_profitability
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Kode Manifest</th>
                  <th className="py-3 px-4">Nama Rombongan / Kloter</th>
                  <th className="py-3 px-4">Paket Umrah</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Pax</th>
                  <th className="py-3 px-4 text-right">Realisasi Omzet</th>
                  <th className="py-3 px-4 text-right">Total HPP Riil</th>
                  <th className="py-3 px-4 text-right text-cyan-400">
                    Gross Profit
                  </th>
                  <th className="py-3 px-4 text-right text-emerald-400">
                    Margin %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {kloterProfitabilities.map((item) => (
                  <tr key={item.manifest_id} className="hover:bg-slate-850/40">
                    <td className="py-3.5 px-4 font-bold text-cyan-400">
                      {item.manifest_code}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-white font-medium">
                      {item.group_name}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-300 text-[11px]">
                      {item.package_name}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          item.manifest_status === 'DEPARTED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : item.manifest_status === 'SCHEDULED'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {item.manifest_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-white">
                      {item.total_passengers}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium">
                      Rp {item.total_revenue_idr.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-right text-amber-300">
                      Rp {item.total_realized_cogs_idr.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-cyan-300 text-sm">
                      Rp {item.gross_profit_idr.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                        {item.profit_margin_percent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBVIEW 2: SEAT LOAD FACTOR */}
      {activeSubView === 'SEAT_LOAD' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
          <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-white text-sm">
                Seat Load Factor (Utilitas Block Seat Maskapai)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Pelacakan serapan kursi penerbangan untuk mitigasi kerugian seat
                hangus / unassigned seat.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                View: v_seat_load_factor
              </span>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {seatLoadFactors.map((slf) => (
                <div
                  key={slf.allocation_id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4.5 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4 text-cyan-400" />
                        <h5 className="font-bold text-white text-sm">
                          {slf.airline_name}
                        </h5>
                        <span className="text-xs font-mono bg-slate-900 text-amber-300 px-2 py-0.5 rounded border border-slate-800 font-semibold">
                          PNR: {slf.pnr_code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Rute: {slf.route_path} • Terbang: {slf.departure_date}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-bold font-mono text-emerald-400">
                        {slf.seat_utilization_percent}%
                      </span>
                      <p className="text-[10px] text-slate-400">Load Factor</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          slf.seat_utilization_percent >= 90
                            ? 'bg-emerald-500'
                            : slf.seat_utilization_percent >= 70
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${slf.seat_utilization_percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>Terisi: {slf.booked_seats} Seat</span>
                      <span>Sisa: {slf.available_seats} Seat</span>
                      <span>Total: {slf.total_seats} Seat</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-xs">
                    <span className="text-slate-400 truncate max-w-[280px]">
                      {slf.package_name}
                    </span>
                    <span
                      className={`font-semibold text-[11px] ${
                        slf.available_seats === 0
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {slf.available_seats === 0 ? '✓ FULLY BOOKED' : '⚠️ OPEN SEAT'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 3: COMMAND CENTER LIVE TRACKING */}
      {activeSubView === 'COMMAND_CENTER' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Command Center Telemetri Lapangan (Saudi Arabia Ops)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoring pergerakan kloter, armada bus Saudi, tim pendamping,
                dan status kepatuhan jadwal ibadah.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Pilih Kloter:</span>
              <select
                value={selectedManifestFilter}
                onChange={(e) => setSelectedManifestFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-cyan-400 font-bold rounded-lg p-2"
              >
                <option value="ALL">Semua Kloter Lapangan</option>
                {kloterProfitabilities.map((k) => (
                  <option key={k.manifest_id} value={k.manifest_id}>
                    {k.manifest_code} - {k.group_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredCommandItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4"
              >
                {/* Header Manifest */}
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-sm border border-cyan-500/20">
                      H-{item.day_number}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">
                          {item.group_name}
                        </span>
                        <span className="font-mono text-xs text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                          {item.manifest_code}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-500" />
                          Bus: <strong className="text-white">{item.bus_number_saudi}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Muthawif:{' '}
                          <strong className="text-emerald-400">
                            {item.muthawif_name}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Tour Leader:{' '}
                          <strong className="text-cyan-300">
                            {item.tour_leader_name}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Mukibin:{' '}
                          <strong className="text-amber-300">
                            {item.mukibin_name}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                        item.realization_status === 'ON_TRACK'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : item.realization_status === 'DELAYED'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {item.realization_status === 'ON_TRACK' && (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      {item.realization_status === 'DELAYED' && (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )}
                      {item.realization_status}
                    </span>
                  </div>
                </div>

                {/* Real-time Activity Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      Aktivitas Sesuai Itinerary
                    </span>
                    <h5 className="text-white font-bold text-sm">
                      {item.current_activity}
                    </h5>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        Jadwal: {new Date(item.planned_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} AST
                      </span>
                      {item.actual_time && (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Realisasi: {new Date(item.actual_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} AST
                        </span>
                      )}
                      {item.delay_reason && (
                        <span className="text-amber-400 text-xs">
                          ⚠️ {item.delay_reason}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Proof photo */}
                  <div className="flex items-center gap-3">
                    {item.photo_evidence_url ? (
                      <button
                        onClick={() => setSelectedPhotoModal(item.photo_evidence_url!)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-cyan-400 hover:bg-slate-800 font-bold transition"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Lihat Bukti Foto</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">
                        Belum ada foto bukti
                      </span>
                    )}

                    {onUpdateActivityStatus && (
                      <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                        <button
                          onClick={() =>
                            onUpdateActivityStatus(
                              item.manifest_id,
                              'ON_TRACK',
                              'Pelaksanaan tepat waktu'
                            )
                          }
                          className="px-2 py-1 text-[11px] text-emerald-400 hover:bg-emerald-500/20 rounded font-bold transition"
                          title="Set On Track"
                        >
                          On Track
                        </button>
                        <button
                          onClick={() =>
                            onUpdateActivityStatus(
                              item.manifest_id,
                              'DELAYED',
                              'Antrian imigrasi/kemacetan Jeddah-Makkah'
                            )
                          }
                          className="px-2 py-1 text-[11px] text-amber-400 hover:bg-amber-500/20 rounded font-bold transition"
                          title="Set Delay"
                        >
                          Delay
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Evidence Modal */}
      {selectedPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                Bukti Foto Realisasi Kegiatan Lapangan (Saudi Ops)
              </h4>
              <button
                onClick={() => setSelectedPhotoModal(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
              <img
                src={selectedPhotoModal}
                alt="Evidence"
                className="w-full max-h-[380px] object-cover"
              />
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Geo-tag: Makkah Clock Tower • Verified by Tour Leader</span>
              <button
                onClick={() => setSelectedPhotoModal(null)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
