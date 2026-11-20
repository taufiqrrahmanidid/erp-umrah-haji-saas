import React, { useState } from 'react';
import {
  Compass,
  Plane,
  Luggage,
  Users,
  Hotel,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Scan,
  MapPin,
  Camera,
  ShieldCheck,
  Terminal,
  Key,
} from 'lucide-react';
import {
  Manifest,
  RoomingListEntry,
  LuggageTracking,
  RoleCode,
} from '../../../types/erp.ts';

interface TourOpsAndLuggageTabProps {
  manifests: Manifest[];
  roomings: RoomingListEntry[];
  luggages: LuggageTracking[];
  onAddLuggageScan: (scan: LuggageTracking) => void;
  currentRole: RoleCode;
  currentUserId: string;
}

export const TourOpsAndLuggageTab: React.FC<TourOpsAndLuggageTabProps> = ({
  manifests,
  roomings,
  luggages,
  onAddLuggageScan,
  currentRole,
  currentUserId,
}) => {
  const [subTab, setSubTab] = useState<'MANIFESTS' | 'ROOMING' | 'LUGGAGE_SCAN' | 'SQL_JOIN'>('MANIFESTS');

  // Scanner Simulator State
  const [selectedManifestId, setSelectedManifestId] = useState<string>(manifests[0]?.manifest_id || '');
  const [scannedQrCode, setScannedQrCode] = useState('SISKO-3506123456780001');
  const [scanLocation, setScanLocation] = useState<LuggageTracking['scan_location']>('MAKKAH_HOTEL');
  const [scanStatus, setScanStatus] = useState<LuggageTracking['scan_status']>('ARRIVED_AT_ROOM');
  const [scanNotes, setScanNotes] = useState('Koper telah diantar bellboy ke Kamar 1402');
  const [notification, setNotification] = useState<string | null>(null);

  // Rooming list filter
  const [selectedHotelLocation, setSelectedHotelLocation] = useState<'MAKKAH' | 'MADINAH'>('MAKKAH');

  const filteredRoomings = roomings.filter((r) => r.hotel_location === selectedHotelLocation);

  const handleExecuteScan = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedManifest = manifests.find((m) => m.manifest_id === selectedManifestId) || manifests[0];

    const newScan: LuggageTracking = {
      tracking_id: `lug-${Date.now()}`,
      manifest_id: selectedManifest.manifest_id,
      customer_id: 'cust-01',
      customer_name: 'Hj. Siti Aminah',
      qr_tag_scanned: scannedQrCode,
      luggage_number: 'KPR-01 (Koper Bagasi 24")',
      scan_location: scanLocation,
      scanned_by_mukibin_name: 'Faisal Basri (Mukibin Saudi Airport & Hotel)',
      scan_status: scanStatus,
      notes: scanNotes,
      scanned_at: new Date().toISOString(),
    };

    onAddLuggageScan(newScan);
    setNotification(
      `Barcode Koper [${scannedQrCode}] Berhasil Di-scan di Lokasi [${scanLocation}]! Status: ${scanStatus}. Data langsung tersinkron ke Portal Jamaah.`
    );
    setTimeout(() => setNotification(null), 4500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Tour Operations: Manifest Kloter, Rooming List &amp; Pelacakan QR Koper
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
              <strong>Otorisasi Petugas:</strong> Muthawif, Tour Leader (TL), dan Mukibin hanya dapat mengakses data kloter rombongannya sendiri.{' '}
              <strong>Pelacakan Barcode:</strong> Tim Mukibin memindai koper berbasis <code>siskopatuh_qr_code</code> di setiap checkpoint Saudi.{' '}
              <strong>Rooming List:</strong> Pengelompokan kamar hotel (Quad/Triple/Double) dengan pemisahan gender ketat.
            </p>
          </div>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setSubTab('MANIFESTS')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              subTab === 'MANIFESTS' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Manifest Kloter
          </button>
          <button
            onClick={() => setSubTab('ROOMING')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              subTab === 'ROOMING' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Rooming List Kamar
          </button>
          <button
            onClick={() => setSubTab('LUGGAGE_SCAN')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              subTab === 'LUGGAGE_SCAN' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Scan QR Koper (Mukibin)
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 shadow">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* SUB-TAB 1: MANIFESTS */}
      {subTab === 'MANIFESTS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {manifests.map((mnf) => (
              <div
                key={mnf.manifest_id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-400 text-sm">{mnf.manifest_code}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          mnf.status === 'DEPARTED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {mnf.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-base mt-1">{mnf.group_name}</h4>
                    <p className="text-xs text-slate-400">{mnf.package_name}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Total Jamaah:</span>
                    <span className="font-mono font-bold text-white text-sm">{mnf.total_jamaah} Pax</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Penerbangan (PNR):</span>
                    <span className="font-mono font-bold text-cyan-300 flex items-center gap-1 mt-0.5">
                      <Plane className="w-3.5 h-3.5" />
                      {mnf.departure_flight_pnr}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Bus Saudi:</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block">{mnf.bus_number_saudi}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Muthawif Pembimbing:</span>
                    <span className="font-semibold text-slate-300 mt-0.5 block">{mnf.muthawif_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Tour Leader (TL):</span>
                    <span className="font-semibold text-slate-300 mt-0.5 block">{mnf.tl_name}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
                  <span>Petugas Mukibin: <strong className="text-slate-300">{mnf.mukibin_name}</strong></span>
                  {mnf.revenue_recognized && (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Revenue Recognized
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ROOMING LIST */}
      {subTab === 'ROOMING' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div>
              <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                <Hotel className="w-4 h-4 text-emerald-400" />
                Alokasi Kamar Hotel Jamaah ({selectedHotelLocation})
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Pengelompokan kamar berdasarkan nomor kamar dan jenis kelamin untuk memastikan integritas syariah.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedHotelLocation('MAKKAH')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedHotelLocation === 'MAKKAH'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                Hotel Makkah
              </button>
              <button
                onClick={() => setSelectedHotelLocation('MADINAH')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedHotelLocation === 'MADINAH'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                Hotel Madinah
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Hotel</th>
                    <th className="py-3 px-4">No. Kamar</th>
                    <th className="py-3 px-4">Tipe Kamar</th>
                    <th className="py-3 px-4">Gender</th>
                    <th className="py-3 px-4">Nama Jamaah</th>
                    <th className="py-3 px-4">No. Paspor</th>
                    <th className="py-3 px-4">Kontak HP</th>
                    <th className="py-3 px-4">Pemegang Kunci</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans text-slate-300">
                  {filteredRoomings.map((r) => (
                    <tr key={r.room_id} className="hover:bg-slate-850/40">
                      <td className="py-3 px-4 text-slate-200 font-semibold">{r.hotel_name}</td>
                      <td className="py-3 px-4 font-mono font-bold text-cyan-300">{r.room_number}</td>
                      <td className="py-3 px-4 font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300">
                          {r.room_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            r.gender === 'L' ? 'bg-blue-500/10 text-blue-400' : 'bg-pink-500/10 text-pink-400'
                          }`}
                        >
                          {r.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{r.customer_name}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{r.passport_number}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{r.phone_number}</td>
                      <td className="py-3 px-4">
                        {r.is_key_holder ? (
                          <span className="flex items-center gap-1 font-bold text-amber-400 text-[11px]">
                            <Key className="w-3.5 h-3.5" />
                            Key Holder
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LUGGAGE SCANNER MUKIBIN */}
      {subTab === 'LUGGAGE_SCAN' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scanner Simulator Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
              <Scan className="w-4 h-4 text-cyan-400" />
              Simulator Scanner Barcode Mukibin
            </h4>

            <form onSubmit={handleExecuteScan} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Pilih Kloter / Manifest</label>
                <select
                  value={selectedManifestId}
                  onChange={(e) => setSelectedManifestId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  {manifests.map((m) => (
                    <option key={m.manifest_id} value={m.manifest_id}>
                      {m.manifest_code} - {m.group_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">
                  Hasil Scan Barcode (siskopatuh_qr_code)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={scannedQrCode}
                    onChange={(e) => setScannedQrCode(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-cyan-300 font-mono font-bold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setScannedQrCode(`SISKO-${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                    title="Simulate Random Barcode"
                  >
                    Random
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Lokasi Scan (Checkpoint Saudi)</label>
                <select
                  value={scanLocation}
                  onChange={(e) => setScanLocation(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-semibold"
                >
                  <option value="AIRPORT_DEPARTURE">1. Bandara Keberangkatan CGK/SUB</option>
                  <option value="JEDDAH_ARRIVAL">2. Bandara Kedatangan Jeddah / Madinah</option>
                  <option value="MAKKAH_HOTEL">3. Hotel Makkah (Lobby / Kamar)</option>
                  <option value="MADINAH_HOTEL">4. Hotel Madinah (Lobby / Kamar)</option>
                  <option value="AIRPORT_RETURN">5. Bandara Kepulangan</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Status Koper</label>
                <select
                  value={scanStatus}
                  onChange={(e) => setScanStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-semibold"
                >
                  <option value="RECEIVED_AT_AIRPORT">RECEIVED_AT_AIRPORT (Diterima di Lounge)</option>
                  <option value="LOADED_TO_BUS">LOADED_TO_BUS (Masuk Bagasi Bus Rombongan)</option>
                  <option value="ARRIVED_AT_ROOM">ARRIVED_AT_ROOM (Telah di Depan Pintu Kamar)</option>
                  <option value="IN_STORAGE">IN_STORAGE (Disimpan di Penitipan Hotel)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Catatan Tambahan Mukibin</label>
                <textarea
                  value={scanNotes}
                  onChange={(e) => setScanNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition flex items-center justify-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5" />
                Catat Checkpoint Scan Koper
              </button>
            </form>
          </div>

          {/* Timeline Pelacakan Koper */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <Luggage className="w-4 h-4 text-emerald-400" />
              Log Pelacakan Koper Jamaah (Live Telemetri)
            </h4>

            <div className="space-y-3">
              {luggages.map((lug) => (
                <div
                  key={lug.tracking_id}
                  className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{lug.customer_name}</span>
                      <span className="font-mono text-[10px] text-cyan-300 font-bold">{lug.qr_tag_scanned}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        {lug.scan_status}
                      </span>
                    </div>
                    <p className="text-slate-300 font-semibold">{lug.luggage_number}</p>
                    <p className="text-slate-400 text-[11px]">{lug.notes}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-cyan-400 text-[10px] block mb-1">
                      Lokasi: {lug.scan_location}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Discan oleh: <strong className="text-slate-300">{lug.scanned_by_mukibin_name}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: SQL QUERY JOIN ROOMING */}
      {subTab === 'SQL_JOIN' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              Contoh Query SQL (JOIN): Laporan Rooming List Berdasarkan Data Manifest
            </h4>
            <span className="text-xs text-indigo-400 font-mono">Dialect: PostgreSQL 14+</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
            <pre className="text-slate-300">
{`-- ============================================================================
-- QUERY REPORT: ROOMING LIST ALOKASI KAMAR QUAD / TRIPLE / DOUBLE
-- Menggabungkan data manifests, rooming_lists, dan customers
-- ============================================================================
SELECT 
    m.manifest_code,
    m.group_name,
    rl.hotel_location,
    rl.hotel_name,
    rl.room_number,
    rl.room_type,
    rl.gender,
    c.full_name AS jamaah_name,
    c.passport_number,
    c.phone_number,
    rl.is_key_holder,
    COUNT(c.customer_id) OVER(
        PARTITION BY rl.manifest_id, rl.hotel_location, rl.room_number
    ) AS total_occupants
FROM rooming_lists rl
JOIN manifests m ON rl.manifest_id = m.manifest_id
JOIN customers c ON rl.customer_id = c.customer_id
WHERE m.manifest_code = 'MNF-2026-REG-01'
  AND rl.hotel_location = 'MAKKAH'
ORDER BY 
    rl.room_number ASC, 
    rl.is_key_holder DESC, 
    c.full_name ASC;`}
            </pre>
          </div>

          <div className="p-4 rounded-lg bg-indigo-950/20 border border-indigo-800/40 text-indigo-200 text-xs space-y-1">
            <p className="font-semibold text-white">Analisis Optimasi Performa Query:</p>
            <p>
              • Menggunakan Window Function <code>COUNT() OVER(PARTITION BY ...)</code> untuk menghitung okupansi kamar seketika tanpa memerlukan subquery tambahan.
            </p>
            <p>
              • Compound Index yang direkomendasikan: <code>CREATE INDEX idx_rooming_manifest_hotel ON rooming_lists(manifest_id, hotel_location, room_number);</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
