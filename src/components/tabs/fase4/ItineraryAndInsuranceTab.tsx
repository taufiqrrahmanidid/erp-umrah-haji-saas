import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Coins,
  FileText,
  BadgeDollarSign,
  HeartHandshake,
  UserCheck,
  Send,
} from 'lucide-react';
import {
  Itinerary,
  ItineraryRealization,
  InsurancePolicy,
  RoleCode,
} from '../../../types/erp.ts';

interface ItineraryAndInsuranceTabProps {
  itineraries: Itinerary[];
  realizations: ItineraryRealization[];
  insurances: InsurancePolicy[];
  onAddRealization: (real: ItineraryRealization) => void;
  onAddInsurance: (ins: InsurancePolicy) => void;
  currentBranchCode: string;
}

export const ItineraryAndInsuranceTab: React.FC<ItineraryAndInsuranceTabProps> = ({
  itineraries,
  realizations,
  insurances,
  onAddRealization,
  onAddInsurance,
  currentBranchCode,
}) => {
  const [subTab, setSubTab] = useState<'ITINERARY' | 'FIELD_EXPENSE_TYPE' | 'INSURANCE'>('ITINERARY');

  // Realization Form
  const [selectedItinId, setSelectedItinId] = useState<string>(itineraries[0]?.itinerary_id || '');
  const [realStatus, setRealStatus] = useState<ItineraryRealization['status']>('COMPLETED');
  const [delayReason, setDelayReason] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=400&q=80');
  const [notification, setNotification] = useState<string | null>(null);

  // Field Expense Simulator (Operasional vs Talangan Jamaah)
  const [expenseType, setExpenseType] = useState<'PURE_OPERATIONAL' | 'CUSTOMER_LOAN'>('CUSTOMER_LOAN');
  const [loanPurpose, setLoanPurpose] = useState<'KURSI_RODA' | 'DAM_TAMATTU' | 'OBAT_EMERGENCY'>('KURSI_RODA');
  const [loanAmountSar, setLoanAmountSar] = useState<number>(250);
  const [targetCustomer, setTargetCustomer] = useState('Hj. Siti Aminah');

  // Insurance Form
  const [policyNo, setPolicyNo] = useState(`POL/SYR/${new Date().getFullYear()}/00${insurances.length + 1}`);
  const [coverageType, setCoverageType] = useState<'JAMAAH' | 'MUTHAWIF' | 'MUKIBIN' | 'EMPLOYEE'>('JAMAAH');
  const [totalPax, setTotalPax] = useState<number>(45);
  const [premiumPerPax, setPremiumPerPax] = useState<number>(350000);

  const handleUpdateRealization = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedItin = itineraries.find((i) => i.itinerary_id === selectedItinId) || itineraries[0];

    const newReal: ItineraryRealization = {
      realization_id: `real-${Date.now()}`,
      itinerary_id: selectedItin.itinerary_id,
      activity_name: selectedItin.activity_name,
      actual_time: new Date().toISOString(),
      status: realStatus,
      updated_by_user_name: 'Rahmat Hidayat (Tour Leader)',
      delay_reason: realStatus === 'DELAYED' ? delayReason : undefined,
      photo_evidence_url: photoUrl,
    };

    onAddRealization(newReal);
    setNotification(
      `Realisasi Itinerary [${selectedItin.activity_name}] Berhasil Diperbarui! Status: ${realStatus}. Bukti foto terlampir.`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateInsurance = (e: React.FormEvent) => {
    e.preventDefault();

    const totalPremium = totalPax * premiumPerPax;

    const newIns: InsurancePolicy = {
      insurance_id: `ins-${Date.now()}`,
      policy_number: policyNo,
      vendor_id: 'vnd-03',
      vendor_name: 'PT Asuransi Syariah Amanah Bersama',
      coverage_type: coverageType,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      total_participants: totalPax,
      premium_per_person: premiumPerPax,
      total_premium: totalPremium,
      status: 'RELEASED',
      journal_reference: `JRN/INS-POL/${Date.now()}`,
    };

    onAddInsurance(newIns);
    setNotification(
      `Polis Asuransi Syariah [${newIns.policy_number}] Diterbitkan! Auto-Jurnal (Debit: [5000] Beban Asuransi HPP, Kredit: [2100] Utang Vendor Asuransi) telah digenerate!`
    );
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Live Itinerary Realization, Talangan Operasional vs Jamaah &amp; Asuransi Terpadu
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
              <strong>Itinerary Aktual:</strong> Realisasi jadwal ibadah real-time oleh Tour Leader dilengkapi foto bukti.{' '}
              <strong>Pemisahan Akuntansi Talangan:</strong> Pengeluaran rombongan dicatat sebagai beban operasional, sedangkan talangan jamaah (Dam / Kursi Roda) dicatat sebagai <em>Piutang Customer</em> (tidak membebani laba/rugi biro).{' '}
              <strong>Asuransi Syariah:</strong> Penerbitan polis otomatis men-generate jurnal HPP &amp; Utang Vendor.
            </p>
          </div>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setSubTab('ITINERARY')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              subTab === 'ITINERARY' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Itinerary
          </button>
          <button
            onClick={() => setSubTab('FIELD_EXPENSE_TYPE')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              subTab === 'FIELD_EXPENSE_TYPE' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Talangan Jamaah (Piutang)
          </button>
          <button
            onClick={() => setSubTab('INSURANCE')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              subTab === 'INSURANCE' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Modul Asuransi Polis
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 shadow">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* SUB-TAB 1: LIVE ITINERARY */}
      {subTab === 'ITINERARY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Update Realisasi */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
              <Clock className="w-4 h-4 text-teal-400" />
              Update Realisasi Itinerary
            </h4>

            <form onSubmit={handleUpdateRealization} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Pilih Rencana Kegiatan</label>
                <select
                  value={selectedItinId}
                  onChange={(e) => setSelectedItinId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  {itineraries.map((itin) => (
                    <option key={itin.itinerary_id} value={itin.itinerary_id}>
                      Hari ke-{itin.day_number}: {itin.activity_name} ({itin.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Status Realisasi</label>
                <select
                  value={realStatus}
                  onChange={(e) => setRealStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-semibold"
                >
                  <option value="COMPLETED">COMPLETED (Selesai Tepat Waktu)</option>
                  <option value="ON_TRACK">ON_TRACK (Sedang Berlangsung)</option>
                  <option value="DELAYED">DELAYED (Tertunda / Lalu Lintas Macet)</option>
                  <option value="RESCHEDULED">RESCHEDULED (Jadwal Ulang)</option>
                </select>
              </div>

              {realStatus === 'DELAYED' && (
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Alasan Keterlambatan</label>
                  <input
                    type="text"
                    value={delayReason}
                    onChange={(e) => setDelayReason(e.target.value)}
                    placeholder="Misal: Antrean Imigrasi Bandara Padat"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-amber-300"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-slate-400 font-medium block mb-1">URL Foto Bukti Kegiatan</label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300 font-mono text-[11px]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Posting Realisasi Kegiatan
              </button>
            </form>
          </div>

          {/* Timeline Realisasi */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Timeline Realisasi Lapangan Hari Ini
            </h4>

            <div className="space-y-3">
              {realizations.map((r) => (
                <div key={r.realization_id} className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{r.activity_name}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Diupdate oleh: <strong className="text-slate-300">{r.updated_by_user_name}</strong> • Waktu:{' '}
                      <span className="font-mono text-cyan-300">{r.actual_time}</span>
                    </p>
                    {r.delay_reason && (
                      <p className="text-amber-400 text-[11px]">Alasan delay: {r.delay_reason}</p>
                    )}
                  </div>

                  {r.photo_evidence_url && (
                    <div className="shrink-0 flex items-center gap-2">
                      <img
                        src={r.photo_evidence_url}
                        alt="Bukti Itinerary"
                        className="w-14 h-14 rounded-lg object-cover border border-slate-800"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: FIELD EXPENSE TYPE (OPERASIONAL VS TALANGAN JAMAAH) */}
      {subTab === 'FIELD_EXPENSE_TYPE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
              <Coins className="w-4 h-4 text-amber-400" />
              Pencatatan Talangan Jamaah Lapangan
            </h4>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setNotification(
                  `Talangan Jamaah [${targetCustomer}] untuk ${loanPurpose} sebesar SAR ${loanAmountSar} Berhasil Dicatat! Jurnal Dibuat: Debit [1130] Piutang Customer / Talangan Jamaah (TIDAK Membebani Biaya Rombongan).`
                );
                setTimeout(() => setNotification(null), 5000);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-slate-400 font-medium block mb-1">Jenis Pengeluaran</label>
                <select
                  value={expenseType}
                  onChange={(e) => setExpenseType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-semibold"
                >
                  <option value="CUSTOMER_LOAN">Talangan Jamaah (Piutang Customer / Dam / Kursi Roda)</option>
                  <option value="PURE_OPERATIONAL">Operasional Rombongan (Beban Biaya Paket)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Nama Jamaah Bersangkutan</label>
                <input
                  type="text"
                  value={targetCustomer}
                  onChange={(e) => setTargetCustomer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Tujuan Talangan</label>
                <select
                  value={loanPurpose}
                  onChange={(e) => setLoanPurpose(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value="KURSI_RODA">Sewa Kursi Roda &amp; Pendorong Thawaf/Sai</option>
                  <option value="DAM_TAMATTU">Denda Dam Tamattu' (Kambing)</option>
                  <option value="OBAT_EMERGENCY">Biaya Pengobatan Emergency Rumah Sakit</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Nominal Talangan (SAR)</label>
                <input
                  type="number"
                  value={loanAmountSar}
                  onChange={(e) => setLoanAmountSar(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono font-bold text-amber-300"
                  required
                />
              </div>

              <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-800/40 text-[11px] text-amber-200 space-y-1">
                <p className="font-semibold text-white">Logika Akuntansi Ketat:</p>
                <p>
                  • Talangan pribadi jamaah <strong>TIDAK BOLEH</strong> mendebit Beban Operasional Rombongan (agar tidak merusak margin paket).
                </p>
                <p>
                  • Sistem mendebit <code>[1130] Piutang Customer</code> dan mengkredit <code>[1020] Kas Valas Saudi / Muthawif</code>. Tagihan ini ditagihkan ke jamaah sebelum kepulangan.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Catat Talangan &amp; Buat Piutang
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Perbandingan Akuntansi: Operasional vs Piutang Talangan Jamaah
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold text-[10px]">
                  KATEGORI 1: OPERASIONAL ROMBONGAN
                </span>
                <p className="text-white font-semibold">Tips Sopir Bus, Air Zamzam Tambahan, Ziarah</p>
                <div className="text-[11px] text-slate-400 space-y-1 border-t border-slate-850 pt-2">
                  <p>• <strong>Debit:</strong> [5100] Beban Operasional Lapangan Saudi</p>
                  <p>• <strong>Kredit:</strong> [1020] Kas Valas / Cash Advance</p>
                  <p>• Efek L/R: Memotong laba bersih rombongan.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-amber-800/40 space-y-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold text-[10px]">
                  KATEGORI 2: TALANGAN JAMAAH
                </span>
                <p className="text-white font-semibold">Kursi Roda Tawaf, Bayar Dam Kambing Pribadi</p>
                <div className="text-[11px] text-slate-400 space-y-1 border-t border-slate-850 pt-2">
                  <p>• <strong>Debit:</strong> [1130] Piutang Customer / Jamaah</p>
                  <p>• <strong>Kredit:</strong> [1020] Kas Valas / Cash Advance</p>
                  <p className="text-emerald-400 font-semibold">• Efek L/R: Netral (Aset piutang bertambah, kas berkurang).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: INTEGRATED INSURANCE */}
      {subTab === 'INSURANCE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Penerbitan Polis Asuransi Terpadu
            </h4>

            <form onSubmit={handleCreateInsurance} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Nomor Polis Asuransi</label>
                <input
                  type="text"
                  value={policyNo}
                  onChange={(e) => setPolicyNo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-cyan-300 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Cakupan Perlindungan (coverage_type)</label>
                <select
                  value={coverageType}
                  onChange={(e) => setCoverageType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-semibold"
                >
                  <option value="JAMAAH">JAMAAH (Seluruh Jamaah Kloter)</option>
                  <option value="MUTHAWIF">MUTHAWIF (Pembimbing Ibadah)</option>
                  <option value="MUKIBIN">MUKIBIN (Petugas Lapangan Saudi)</option>
                  <option value="EMPLOYEE">EMPLOYEE (Karyawan Kantor Tetap)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Total Peserta</label>
                  <input
                    type="number"
                    value={totalPax}
                    onChange={(e) => setTotalPax(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Premi / Org (Rp)</label>
                  <input
                    type="number"
                    value={premiumPerPax}
                    onChange={(e) => setPremiumPerPax(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-400 block">Total Nilai Premi:</span>
                <span className="font-mono font-bold text-white text-base">
                  Rp {(totalPax * premiumPerPax).toLocaleString('id-ID')}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Terbitkan Polis &amp; Auto-Jurnal
              </button>
            </form>
          </div>

          {/* Daftar Polis */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <BadgeDollarSign className="w-4 h-4 text-cyan-400" />
              Daftar Polis Asuransi Syariah Aktif
            </h4>

            <div className="space-y-3">
              {insurances.map((ins) => (
                <div key={ins.insurance_id} className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-emerald-400">{ins.policy_number}</span>
                      <p className="font-bold text-white text-sm mt-0.5">{ins.vendor_name}</p>
                      <p className="text-[11px] text-slate-400">
                        Cakupan: <strong className="text-cyan-300">{ins.coverage_type}</strong> ({ins.total_participants} Peserta) • Periode: {ins.start_date} s/d {ins.end_date}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-white text-sm block">
                        Rp {ins.total_premium.toLocaleString('id-ID')}
                      </span>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {ins.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-300">
                        Auto-Jurnal: <span className="font-mono text-emerald-400">{ins.journal_reference}</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Debit: [5000] Beban Asuransi Syariah Paket | Kredit: [2100] Utang Vendor Asuransi
                      </p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
