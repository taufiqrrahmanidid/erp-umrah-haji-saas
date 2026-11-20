import React, { useState } from 'react';
import {
  Compass,
  QrCode,
  Calendar,
  Building,
  Plane,
  Users,
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Luggage,
  Sparkles,
  Ticket,
  Scan,
} from 'lucide-react';
import {
  JamaahDashboardSummary,
  RoommateAllocation,
  GroupGallery,
  JamaahAdministration,
  ManasikAttendance,
} from '../../../types/erp.ts';

interface JamaahPortalDashboardTabProps {
  summary: JamaahDashboardSummary;
  roommates: RoommateAllocation[];
  galleries: GroupGallery[];
  adminTracking: JamaahAdministration[];
  attendances: ManasikAttendance[];
  onScanAttendance: (attendanceId: string) => void;
}

export const JamaahPortalDashboardTab: React.FC<JamaahPortalDashboardTabProps> = ({
  summary,
  roommates,
  galleries,
  adminTracking,
  attendances,
  onScanAttendance,
}) => {
  const [activePortalSection, setActivePortalSection] = useState<
    'OVERVIEW' | 'MANASIK_TICKET' | 'DOCS_TRACKING' | 'ROOMMATES' | 'GALLERY'
  >('OVERVIEW');

  const currentAdmin = adminTracking[0];
  const currentAttendance = attendances[0];

  const adminStages = [
    { key: 'COLLECTED_BY_BRANCH', label: '1. Berkas di Cabang' },
    { key: 'SENT_TO_HQ', label: '2. Dikirim ke HQ' },
    { key: 'RECEIVED_BY_HQ', label: '3. Diterima Tim Visa' },
    { key: 'BIOMETRIC_DONE', label: '4. Biometrik Tasheel' },
    { key: 'SISKOPATUH_REGISTERED', label: '5. Siskopatuh Kemenag' },
    { key: 'VISA_ISSUED', label: '6. E-Visa Terbit' },
  ];

  return (
    <div className="space-y-6">
      {/* Companion Hero Header */}
      <div className="relative rounded-2xl overflow-hidden border border-emerald-800/80 shadow-2xl p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                PORTAL JAMAAH MANDIRI
              </span>
              <span className="text-xs font-mono text-emerald-300">
                SQL VIEW: v_jamaah_dashboard
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Ahlan Wa Sahlan, {summary.customer_name}
            </h2>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              <span>Paspor: <strong className="font-mono text-cyan-300">{summary.passport_number}</strong></span>
              <span>•</span>
              <span>Paket: <strong className="text-white">{summary.package_name}</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActivePortalSection('OVERVIEW')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activePortalSection === 'OVERVIEW'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Ringkasan Ibadah
            </button>
            <button
              onClick={() => setActivePortalSection('MANASIK_TICKET')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activePortalSection === 'MANASIK_TICKET'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              Tiket QR Manasik
            </button>
            <button
              onClick={() => setActivePortalSection('DOCS_TRACKING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activePortalSection === 'DOCS_TRACKING'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Status Visa &amp; Dokumen
            </button>
            <button
              onClick={() => setActivePortalSection('ROOMMATES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activePortalSection === 'ROOMMATES'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Teman Sekamar
            </button>
            <button
              onClick={() => setActivePortalSection('GALLERY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activePortalSection === 'GALLERY'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Album Rombongan
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: OVERVIEW COMPANION */}
      {activePortalSection === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sisi Kiri: Kartu Identitas Siskopatuh & ID Tag Bagasi (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Luggage className="w-4 h-4 text-emerald-400" />
                ID Bagasi &amp; QR Siskopatuh
              </h4>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                Official Label
              </span>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-100 text-slate-900 rounded-xl p-4 shadow-lg border-2 border-dashed border-amber-300 text-center space-y-3">
              <span className="text-[9px] uppercase font-extrabold text-amber-900 tracking-wider block">
                KEMENTERIAN AGAMA RI • SISKOPATUH UMRAH
              </span>

              <div className="bg-white p-2.5 rounded-lg border border-amber-300 shadow-sm w-32 h-32 mx-auto flex flex-col items-center justify-center">
                <QrCode className="w-24 h-24 text-slate-900" />
                <span className="text-[7px] font-mono font-bold mt-1">ID TAG BAGASI</span>
              </div>

              <div>
                <h5 className="font-black text-slate-900 text-sm">{summary.customer_name}</h5>
                <p className="font-mono text-[11px] font-bold text-slate-700">
                  {summary.siskopatuh_qr_code}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-700 pt-2 border-t border-amber-300">
                <div>Jaket: <strong>Size {summary.jacket_size}</strong></div>
                <div>Gol Darah: <strong>{summary.blood_type}</strong></div>
              </div>
            </div>

            {/* Escrow Balance Banner */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Saldo Tabungan Escrow Anda:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  Rp {summary.escrow_saving_balance.toLocaleString('id-ID')}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Aktif
              </span>
            </div>
          </div>

          {/* Sisi Kanan: Flight, Hotel & Petugas Lapangan (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Itinerary & Flight Grid */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Plane className="w-4 h-4 text-cyan-400" />
                Rincian Jadwal Perjalanan &amp; Hotel
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[11px]">Keberangkatan &amp; Kepulangan:</span>
                  <div className="font-bold text-white text-sm">
                    {summary.departure_date} - {summary.return_date}
                  </div>
                  <div className="text-cyan-400 font-semibold">{summary.airline_name}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[11px]">Hotel Makkah &amp; Madinah:</span>
                  <div className="font-bold text-white text-sm">{summary.hotel_makkah}</div>
                  <div className="text-slate-300">{summary.hotel_madinah}</div>
                </div>
              </div>
            </div>

            {/* Petugas Lapangan: Muthawif & Mukibin Saudi */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Petugas Pembimbing Ibadah &amp; Handling Saudi Anda
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Muthawif */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3.5">
                  <img
                    src={summary.muthawif_photo}
                    alt="Muthawif"
                    className="w-14 h-14 object-cover rounded-xl border-2 border-emerald-500 shadow"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Muthawif Pembimbing Ibadah
                    </span>
                    <h5 className="font-bold text-white text-sm">{summary.muthawif_name}</h5>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      WA: {summary.muthawif_phone}
                    </p>
                  </div>
                </div>

                {/* Mukibin */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3.5">
                  <img
                    src={summary.mukibin_photo}
                    alt="Mukibin"
                    className="w-14 h-14 object-cover rounded-xl border-2 border-cyan-500 shadow"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                      Mukibin Tim Handling Saudi
                    </span>
                    <h5 className="font-bold text-white text-sm">{summary.mukibin_name}</h5>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      WA: {summary.mukibin_phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: TIKET QR MANASIK */}
      {activePortalSection === 'MANASIK_TICKET' && (
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-5 text-center">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <Ticket className="w-5 h-5 text-emerald-400" />
              E-Tiket Manasik Akbar &amp; Pengambilan Perlengkapan
            </h4>
            <span className="text-xs font-mono text-cyan-400">
              {currentAttendance?.qr_ticket_code}
            </span>
          </div>

          <div className="bg-gradient-to-br from-emerald-950/60 to-slate-950 p-6 rounded-2xl border border-emerald-800/80 shadow-xl space-y-4">
            <div className="bg-white p-4 rounded-xl w-44 h-44 mx-auto shadow-2xl flex flex-col items-center justify-center border-4 border-emerald-500">
              <QrCode className="w-36 h-36 text-slate-950" />
            </div>

            <div className="space-y-1">
              <h5 className="text-lg font-black text-white">{summary.customer_name}</h5>
              <p className="text-xs text-slate-300">
                Tunjukkan QR Code ini kepada panitia di pintu masuk aula hotel.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-800 font-mono">
              <div className="p-2.5 rounded bg-slate-900">
                <span className="text-slate-500 block text-[10px] font-sans">Status Kehadiran</span>
                {currentAttendance?.is_present ? (
                  <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Hadir
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold">Belum Check-In</span>
                )}
              </div>
              <div className="p-2.5 rounded bg-slate-900">
                <span className="text-slate-500 block text-[10px] font-sans">Konsumsi &amp; Snack</span>
                {currentAttendance?.souvenir_snack_collected ? (
                  <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Diambil
                  </span>
                ) : (
                  <span className="text-slate-400">Belum Diambil</span>
                )}
              </div>
            </div>

            {/* Simulator: Tombol Scan Staf di Pintu Masuk */}
            <div className="pt-2">
              <button
                onClick={() => onScanAttendance(currentAttendance?.attendance_id)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow flex items-center justify-center gap-2 mx-auto transition"
              >
                <Scan className="w-4 h-4" />
                Simulasi Scan QR Petugas Pintu Masuk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: STATUS DOKUMEN & VISA TRACKING */}
      {activePortalSection === 'DOCS_TRACKING' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h4 className="font-bold text-white text-base">
                Alur Tracking Administrasi Paspor &amp; Visa Umrah
              </h4>
              <p className="text-xs text-slate-400">
                Melacak pergerakan fisik paspor dari cabang hingga penerbitan E-Visa Saudi
              </p>
            </div>
            <span className="font-mono text-cyan-400 text-xs bg-cyan-950/60 px-3 py-1 rounded border border-cyan-800">
              Posisi Paspor: {currentAdmin?.passport_physical_location}
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {adminStages.map((stg, idx) => {
              const currentIdx = adminStages.findIndex((s) => s.key === currentAdmin?.workflow_stage);
              const isPastOrCurrent = idx <= currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <div
                  key={stg.key}
                  className={`p-3 rounded-xl border text-center space-y-1 transition ${
                    isCurrent
                      ? 'bg-cyan-950/50 border-cyan-500 text-cyan-300 shadow-lg'
                      : isPastOrCurrent
                      ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-600'
                  }`}
                >
                  <div className="flex justify-center">
                    {isPastOrCurrent ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  <span className="text-[11px] font-bold block">{stg.label}</span>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono block">
              Catatan Terakhir Petugas Visa:
            </span>
            <p className="text-slate-300">{currentAdmin?.notes}</p>
            {currentAdmin?.visa_number && (
              <div className="font-mono text-emerald-400 font-bold pt-1">
                Nomor E-Visa Resmi: {currentAdmin.visa_number}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: TEMAN SEKAMAR (ROOMMATES) */}
      {activePortalSection === 'ROOMMATES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Daftar Teman Sekamar (Roommates) di Makkah &amp; Madinah
            </h4>
            <span className="text-xs text-slate-400">Tipe Kamar: QUAD (Sekamar Ber-4)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Makkah Room */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-bold text-emerald-400 text-xs">MAKKAH - ANJUM HOTEL</span>
                <span className="font-mono text-xs text-slate-300">Room 1204</span>
              </div>
              <div className="space-y-2 text-xs">
                {roommates.filter((r) => r.city === 'MAKKAH').map((rm, i) => (
                  <div key={rm.allocation_id} className="flex items-center gap-2 text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-mono text-[10px]">
                      {i + 1}
                    </span>
                    <span className="font-medium">{rm.customer_name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Madinah Room */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-bold text-cyan-400 text-xs">MADINAH - ROVE AL MADINAH</span>
                <span className="font-mono text-xs text-slate-300">Room 802</span>
              </div>
              <div className="space-y-2 text-xs">
                {roommates.filter((r) => r.city === 'MADINAH').map((rm, i) => (
                  <div key={rm.allocation_id} className="flex items-center gap-2 text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-mono text-[10px]">
                      {i + 1}
                    </span>
                    <span className="font-medium">{rm.customer_name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: DIGITAL ALBUM FOTO ROMBONGAN */}
      {activePortalSection === 'GALLERY' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-400" />
              Digital Album Dokumentasi Rombongan (group_galleries)
            </h4>
            <span className="text-xs text-slate-400">Kloter: KLOTER-KDR-01</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {galleries.map((gal) => (
              <div
                key={gal.gallery_id}
                className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow group hover:border-slate-700 transition"
              >
                <img
                  src={gal.photo_url}
                  alt={gal.photo_title}
                  className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="p-3 space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 block font-mono">
                    {gal.location_tag}
                  </span>
                  <p className="text-xs text-white font-medium line-clamp-1">{gal.photo_title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
