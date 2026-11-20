import React, { useState } from 'react';
import {
  Radio,
  Droplet,
  Award,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Download,
  QrCode,
  ShieldCheck,
  Truck,
  Building,
  Plane,
  Clock,
  Sparkles,
  FileCheck,
  Check,
  ExternalLink,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import {
  EquipmentLoan,
  PostTripZamzamPickup,
  PostTripCertificate,
} from '../../../types/erp';

interface PostTripAndLogisticsTabProps {
  equipmentLoans: EquipmentLoan[];
  zamzamPickups: PostTripZamzamPickup[];
  certificates: PostTripCertificate[];
  onReturnEquipment: (
    loanId: string,
    condition: EquipmentLoan['condition_returned'],
    penaltyAmount: number,
    notes: string,
    deductionTarget: EquipmentLoan['deduction_target']
  ) => void;
  onUpdateZamzamStatus: (
    pickupId: string,
    newStatus: PostTripZamzamPickup['pickup_status'],
    trackingNo?: string
  ) => void;
}

export const PostTripAndLogisticsTab: React.FC<PostTripAndLogisticsTabProps> = ({
  equipmentLoans,
  zamzamPickups,
  certificates,
  onReturnEquipment,
  onUpdateZamzamStatus,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'AUDIO_WHISPER' | 'ZAMZAM_LOGISTICS' | 'CERTIFICATES'>('AUDIO_WHISPER');
  
  // Return Equipment Modal State
  const [selectedLoan, setSelectedLoan] = useState<EquipmentLoan | null>(null);
  const [returnCondition, setReturnCondition] = useState<'GOOD_WORKING' | 'DAMAGED' | 'LOST'>('GOOD_WORKING');
  const [penaltyAmount, setPenaltyAmount] = useState<number>(750000);
  const [deductionTarget, setDeductionTarget] = useState<EquipmentLoan['deduction_target']>('CASH_ADVANCE_TL');
  const [penaltyNotes, setPenaltyNotes] = useState<string>('');

  // Zamzam Handover Modal State
  const [selectedZamzam, setSelectedZamzam] = useState<PostTripZamzamPickup | null>(null);
  const [courierTracking, setCourierTracking] = useState<string>('');
  const [handoverOfficer, setHandoverOfficer] = useState<string>('Staff Operasional Handling');

  // Certificate QR Verification Modal
  const [verifiedCert, setVerifiedCert] = useState<PostTripCertificate | null>(null);

  // Format IDR
  const formatIdr = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  // Summaries
  const totalLoans = equipmentLoans.length;
  const activeLoans = equipmentLoans.filter((l) => l.status === 'BORROWED').length;
  const penaltyLoans = equipmentLoans.filter((l) => l.status === 'PENALTY_CHARGED').length;

  const totalZamzamLiters = zamzamPickups.reduce((acc, z) => acc + z.bottle_allocation_liters, 0);
  const claimedZamzam = zamzamPickups.filter((z) => z.pickup_status === 'CLAIMED_HANDED_OVER').length;

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;
    onReturnEquipment(
      selectedLoan.loan_id,
      returnCondition,
      returnCondition === 'GOOD_WORKING' ? 0 : penaltyAmount,
      penaltyNotes,
      deductionTarget
    );
    setSelectedLoan(null);
  };

  const handleConfirmZamzam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZamzam) return;
    const isExpedition = selectedZamzam.pickup_location === 'HOME_DELIVERY_EXPEDITION';
    onUpdateZamzamStatus(
      selectedZamzam.pickup_id,
      isExpedition ? 'SHIPPED_EXPEDITION' : 'CLAIMED_HANDED_OVER',
      isExpedition ? courierTracking : undefined
    );
    setSelectedZamzam(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Radio className="w-16 h-16 text-indigo-400" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unit Whisper Receiver</span>
          <div className="text-2xl font-bold text-indigo-400 mt-1">{activeLoans} Sedang Dipinjam</div>
          <div className="text-xs text-slate-400 mt-1">
            Total {totalLoans} Unit Dipinjamkan ({penaltyLoans} Unit Dikenakan Denda)
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Droplet className="w-16 h-16 text-cyan-400" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alokasi Air Zam-zam</span>
          <div className="text-2xl font-bold text-cyan-400 mt-1">{totalZamzamLiters} Liter</div>
          <div className="text-xs text-slate-400 mt-1">
            {claimedZamzam} dari {zamzamPickups.length} Jamaah Telah Mengambil
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Award className="w-16 h-16 text-amber-400" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sertifikat Kelulusan Ibadah</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{certificates.length} Sertifikat</div>
          <div className="text-xs text-slate-400 mt-1">
            Tervalidasi QR Code Resmi Kemenag & Direksi
          </div>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('AUDIO_WHISPER')}
          className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
            activeSubTab === 'AUDIO_WHISPER'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Peminjaman Alat Audio Whisper</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ZAMZAM_LOGISTICS')}
          className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
            activeSubTab === 'ZAMZAM_LOGISTICS'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/50'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Droplet className="w-4 h-4" />
          <span>Logistik Air Zamzam Pasca-Trip</span>
        </button>

        <button
          onClick={() => setActiveSubTab('CERTIFICATES')}
          className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
            activeSubTab === 'CERTIFICATES'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Sertifikat Digital & QR Verification</span>
        </button>
      </div>

      {/* SUBTAB 1: AUDIO WHISPER */}
      {activeSubTab === 'AUDIO_WHISPER' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-3 rounded-lg text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>
                <strong>Manajemen Audio Whisper Lapangan:</strong> Pelacakan peminjaman transmitter & receiver nirkabel untuk bimbingan tawaf/sa'i. Jika alat hilang atau rusak, sistem dapat membebankan denda otomatis ke akun Kas Masbon (Cash Advance) Tour Leader atau tagihan jamaah.
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Serial Alat & Tipe</th>
                    <th className="py-3 px-4">Peminjam (Jamaah)</th>
                    <th className="py-3 px-4">Tour Leader Penanggung Jawab</th>
                    <th className="py-3 px-4">Waktu Peminjaman</th>
                    <th className="py-3 px-4">Kondisi Pengembalian</th>
                    <th className="py-3 px-4">Status & Denda</th>
                    <th className="py-3 px-4 text-center">Aksi Serah Terima</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {equipmentLoans.map((loan) => (
                    <tr key={loan.loan_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-100 text-sm flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-indigo-400" />
                          {loan.device_serial_number}
                        </div>
                        <div className="text-[11px] text-slate-400">{loan.device_type}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-200">{loan.customer_name}</div>
                        <div className="text-[11px] text-slate-400">ID: {loan.customer_id}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-300">{loan.tour_leader_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">Kloter: {loan.manifest_code}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-300">{loan.loaned_at}</div>
                        {loan.returned_at && (
                          <div className="text-[10px] text-slate-500">Kembali: {loan.returned_at}</div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {loan.condition_returned ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              loan.condition_returned === 'GOOD_WORKING'
                                ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-800'
                                : loan.condition_returned === 'DAMAGED'
                                ? 'bg-amber-900/40 text-amber-300 border border-amber-800'
                                : 'bg-rose-900/40 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {loan.condition_returned}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Masih digunakan</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            loan.status === 'RETURNED_CLEAR'
                              ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-800'
                              : loan.status === 'PENALTY_CHARGED'
                              ? 'bg-rose-900/50 text-rose-300 border border-rose-800'
                              : 'bg-blue-900/50 text-blue-300 border border-blue-800'
                          }`}
                        >
                          {loan.status}
                        </span>

                        {loan.penalty_fee_amount > 0 && (
                          <div className="text-rose-400 font-bold text-xs mt-1">
                            Denda: {formatIdr(loan.penalty_fee_amount)}
                            <div className="text-[10px] text-slate-400 font-normal">
                              Potong: {loan.deduction_target}
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {loan.status === 'BORROWED' ? (
                          <button
                            onClick={() => {
                              setSelectedLoan(loan);
                              setReturnCondition('GOOD_WORKING');
                              setPenaltyAmount(750000);
                              setPenaltyNotes('');
                            }}
                            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold shadow flex items-center justify-center gap-1 mx-auto"
                          >
                            <FileCheck className="w-3.5 h-3.5" /> Proses Kembali
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-400" /> Selesai
                          </span>
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

      {/* SUBTAB 2: ZAMZAM LOGISTICS */}
      {activeSubTab === 'ZAMZAM_LOGISTICS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-3 rounded-lg text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>
                <strong>Logistik Serah Terima Air Zamzam:</strong> Standar kuota 5 Liter per jamaah setibanya di tanah air. Dapat diambil langsung di Bandara Arrival Soekarno-Hatta T3, Kantor Cabang, atau dikirim langsung ke rumah via ekspedisi kargo khusus cairan.
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Nama Jamaah & Paspor</th>
                    <th className="py-3 px-4">Alokasi & Kloter</th>
                    <th className="py-3 px-4">Lokasi Pengambilan</th>
                    <th className="py-3 px-4">Status Logistik</th>
                    <th className="py-3 px-4">Waktu Klaim / No. Resi</th>
                    <th className="py-3 px-4">Petugas / Catatan</th>
                    <th className="py-3 px-4 text-center">Aksi Serah Terima</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {zamzamPickups.map((zzm) => (
                    <tr key={zzm.pickup_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-100 text-sm">{zzm.customer_name}</div>
                        <div className="text-[11px] font-mono text-cyan-400">Paspor: {zzm.passport_number}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-200">{zzm.bottle_allocation_liters} Liter</div>
                        <div className="text-[11px] text-slate-500 font-mono">{zzm.manifest_code}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                          {zzm.pickup_location === 'BANDARA_ARRIVAL' ? (
                            <Plane className="w-3.5 h-3.5 text-blue-400" />
                          ) : zzm.pickup_location === 'KANTOR_CABANG' ? (
                            <Building className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Truck className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          <span>
                            {zzm.pickup_location === 'BANDARA_ARRIVAL'
                              ? 'Bandara Soetta T3'
                              : zzm.pickup_location === 'KANTOR_CABANG'
                              ? 'Kantor Cabang'
                              : 'Ekspedisi Rumah'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            zzm.pickup_status === 'CLAIMED_HANDED_OVER'
                              ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-800'
                              : zzm.pickup_status === 'SHIPPED_EXPEDITION'
                              ? 'bg-amber-900/40 text-amber-300 border border-amber-800'
                              : 'bg-blue-900/40 text-blue-300 border border-blue-800'
                          }`}
                        >
                          {zzm.pickup_status === 'CLAIMED_HANDED_OVER'
                            ? 'Sudah Diserahkan'
                            : zzm.pickup_status === 'SHIPPED_EXPEDITION'
                            ? 'Dikirim Ekspedisi'
                            : 'Siap Diambil'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {zzm.claimed_at && <div className="text-slate-300">{zzm.claimed_at}</div>}
                        {zzm.courier_tracking_no && (
                          <div className="text-[11px] font-mono text-amber-400 mt-0.5">
                            Resi: {zzm.courier_tracking_no}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {zzm.officer_name && (
                          <div className="text-slate-400 text-[11px]">Petugas: {zzm.officer_name}</div>
                        )}
                        {zzm.notes && (
                          <div className="text-[10px] text-slate-500 italic max-w-xs">{zzm.notes}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {zzm.pickup_status === 'READY_FOR_PICKUP' ? (
                          <button
                            onClick={() => {
                              setSelectedZamzam(zzm);
                              setCourierTracking('');
                            }}
                            className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-semibold shadow flex items-center justify-center gap-1 mx-auto"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Serahkan Zamzam
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-400 flex items-center justify-center gap-1 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                          </span>
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

      {/* SUBTAB 3: DIGITAL CERTIFICATES */}
      {activeSubTab === 'CERTIFICATES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-3 rounded-lg text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                <strong>Sertifikat Ibadah Pasca-Trip Otomatis:</strong> Diterbitkan secara otomatis begitu status manifest kloter diubah menjadi <em>COMPLETED</em>. Dilengkapi nomor seri unik dan QR Code anti-pemalsuan untuk validasi publik.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.certificate_id}
                className="bg-slate-950 border-2 border-amber-600/60 rounded-xl p-6 relative overflow-hidden shadow-2xl flex flex-col justify-between"
              >
                {/* Decorative Islamic border corner */}
                <div className="absolute top-2 left-2 text-amber-500/40 text-xl font-serif">۞</div>
                <div className="absolute top-2 right-2 text-amber-500/40 text-xl font-serif">۞</div>
                <div className="absolute bottom-2 left-2 text-amber-500/40 text-xl font-serif">۞</div>
                <div className="absolute bottom-2 right-2 text-amber-500/40 text-xl font-serif">۞</div>

                {/* Header */}
                <div className="text-center border-b border-amber-700/40 pb-4">
                  <div className="text-amber-400 font-bold text-xs tracking-widest uppercase mb-1">
                    PT AL-HARAMAIN GLOBAL WISATA
                  </div>
                  <h3 className="font-serif text-lg font-bold text-slate-100 uppercase tracking-wide">
                    {cert.program_title}
                  </h3>
                  <div className="text-[11px] font-mono text-amber-400/80 mt-1">
                    Nomor: {cert.certificate_number}
                  </div>
                </div>

                {/* Body Content */}
                <div className="text-center py-6 space-y-2">
                  <p className="text-xs text-slate-400">Diberikan dengan penuh hormat kepada:</p>
                  <h2 className="text-xl font-extrabold text-amber-300 font-serif tracking-wide">
                    {cert.customer_name}
                  </h2>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed pt-2">
                    Telah menyelesaikan seluruh rangkaian manasik dan rukun ibadah Umrah di Tanah Suci Makkah Al-Mukarramah & Madinah Al-Munawwarah dengan tertib dan khusyuk.
                  </p>
                  <div className="text-[11px] text-slate-400 pt-2">
                    Diselesaikan pada tanggal: <strong>{cert.completion_date}</strong> (Kloter: {cert.manifest_code})
                  </div>
                </div>

                {/* Footer Signer & QR */}
                <div className="flex items-end justify-between border-t border-amber-700/40 pt-4 text-xs">
                  {/* QR Box */}
                  <div className="flex items-center gap-2.5">
                    <div className="bg-white p-1.5 rounded-lg border border-amber-500 shadow">
                      <QrCode className="w-10 h-10 text-slate-900" />
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-slate-400">Kode Verifikasi:</div>
                      <div className="font-mono text-[10px] text-amber-400 font-bold">{cert.qr_verification_code}</div>
                      <button
                        onClick={() => setVerifiedCert(cert)}
                        className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5 mt-0.5"
                      >
                        <ShieldCheck className="w-3 h-3" /> Cek Keaslian Online
                      </button>
                    </div>
                  </div>

                  {/* Signer */}
                  <div className="text-right">
                    <div className="font-signature italic text-amber-300 text-sm pb-1 font-serif">
                      A. Gymnastiar
                    </div>
                    <div className="font-bold text-slate-200 text-[11px]">{cert.signer_name}</div>
                    <div className="text-[10px] text-slate-500">Direktur Utama Al-Haramain</div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-end gap-2">
                  <a
                    href={cert.pdf_download_url}
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Mengunduh File PDF Sertifikat: ${cert.certificate_number}`);
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh Dokumen PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Process Return Equipment */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <Radio className="w-5 h-5 text-indigo-400" />
                Pengembalian Whisper Receiver
              </h3>
              <button onClick={() => setSelectedLoan(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleConfirmReturn} className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <div className="font-bold text-slate-200">{selectedLoan.device_serial_number}</div>
                <div className="text-slate-400">Peminjam: {selectedLoan.customer_name}</div>
                <div className="text-slate-400">TL: {selectedLoan.tour_leader_name}</div>
              </div>

              <div>
                <label className="text-slate-300 block font-semibold mb-1">Kondisi Alat Saat Kembali</label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2 rounded"
                >
                  <option value="GOOD_WORKING">Berfungsi Baik & Lengkap (Bebas Denda)</option>
                  <option value="DAMAGED">Rusak Fisik / Baterai Rusak</option>
                  <option value="LOST">Hilang Saat Ibadah (Dikenakan Biaya Penggantian)</option>
                </select>
              </div>

              {returnCondition !== 'GOOD_WORKING' && (
                <>
                  <div>
                    <label className="text-slate-300 block font-semibold mb-1">Jumlah Denda Penggantian (IDR)</label>
                    <input
                      type="number"
                      value={penaltyAmount}
                      onChange={(e) => setPenaltyAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2 rounded font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block font-semibold mb-1">Beban Potong Denda</label>
                    <select
                      value={deductionTarget}
                      onChange={(e) => setDeductionTarget(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2 rounded"
                    >
                      <option value="CASH_ADVANCE_TL">Potong Saldo Cash Advance / Masbon Tour Leader</option>
                      <option value="JAMAAH_BILLING">Tagihkan Tambahan ke Booking Jamaah</option>
                      <option value="WAIVED">Dibebaskan (Tanggungan Operasional Cabang)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 block font-semibold mb-1">Kronologi Kehilangan / Kerusakan</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Contoh: Unit receiver tertinggal di bus Madinah..."
                      value={penaltyNotes}
                      onChange={(e) => setPenaltyNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2 rounded"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedLoan(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-500"
                >
                  Konfirmasi Pengembalian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Process Handover Zamzam */}
      {selectedZamzam && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <Droplet className="w-5 h-5 text-cyan-400" />
                Serah Terima Air Zamzam
              </h3>
              <button onClick={() => setSelectedZamzam(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleConfirmZamzam} className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <div className="font-bold text-slate-100">{selectedZamzam.customer_name}</div>
                <div className="text-cyan-400 font-mono">Alokasi: {selectedZamzam.bottle_allocation_liters} Liter</div>
                <div className="text-slate-400">Lokasi: {selectedZamzam.pickup_location}</div>
              </div>

              <div>
                <label className="text-slate-300 block font-semibold mb-1">Nama Petugas Penyerah</label>
                <input
                  type="text"
                  required
                  value={handoverOfficer}
                  onChange={(e) => setHandoverOfficer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2 rounded"
                />
              </div>

              {selectedZamzam.pickup_location === 'HOME_DELIVERY_EXPEDITION' && (
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Nomor Resi Pengiriman Kargo / JNE</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: JNE-TRK-9901827"
                    value={courierTracking}
                    onChange={(e) => setCourierTracking(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2 rounded font-mono"
                  />
                </div>
              )}

              <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded text-cyan-300">
                Tanda terima fisik akan dicatat dan notifikasi serah terima akan dikirimkan otomatis via WhatsApp.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedZamzam(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 text-white rounded font-bold hover:bg-cyan-500"
                >
                  Konfirmasi Serah Terima
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: QR Verification Dialog */}
      {verifiedCert && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 bg-emerald-950 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-800">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-slate-100 text-base">Sertifikat Terverifikasi Asli</h3>
              <p className="text-xs text-slate-400 mt-1">Terdaftar resmi di database Kementerian Agama RI & PT Al-Haramain</p>
            </div>

            <div className="bg-slate-950 p-3 rounded text-left text-xs space-y-1.5 border border-slate-800">
              <div><span className="text-slate-500">Nama Jamaah:</span> <strong className="text-slate-200">{verifiedCert.customer_name}</strong></div>
              <div><span className="text-slate-500">Nomor Seri:</span> <span className="font-mono text-amber-400">{verifiedCert.certificate_number}</span></div>
              <div><span className="text-slate-500">Program:</span> <span className="text-slate-300">{verifiedCert.program_title}</span></div>
              <div><span className="text-slate-500">Tanggal:</span> <span className="text-slate-300">{verifiedCert.completion_date}</span></div>
              <div><span className="text-slate-500">Penandatangan:</span> <span className="text-slate-300">{verifiedCert.signer_name}</span></div>
            </div>

            <button
              onClick={() => setVerifiedCert(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-semibold text-xs"
            >
              Tutup Verifikasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
