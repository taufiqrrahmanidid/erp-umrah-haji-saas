import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  BadgeDollarSign,
  FileCheck2,
  ArrowRight,
  Send,
  Building,
  Calendar,
  Search,
  Filter,
  Eye,
  Edit3,
  X,
  Save,
  Clock,
  UserCheck,
  Lock,
  ChevronLeft,
  ChevronRight,
  FileText,
  DollarSign,
} from 'lucide-react';
import {
  Booking,
  Customer,
  PackageItem,
  PackageRab,
  RoleCode,
} from '../../../types/erp.ts';
import { CollapsibleCard } from '../../common/CollapsibleCard.tsx';
import { PopupCalendar } from '../../common/PopupCalendar.tsx';
import { ResizableTh, useResizableColumns } from '../../common/ResizableTable.tsx';
import {
  PersonAvatar,
  GenderBadge,
  GenderPhotoSelector,
  getPersonPhoto,
} from '../../../utils/personAvatars.tsx';

interface BookingsAndSalesTabProps {
  bookings: Booking[];
  customers: Customer[];
  packages: PackageItem[];
  rabs: PackageRab[];
  onAddBooking: (newBooking: Booking) => void;
  onUpdateBooking?: (updatedBooking: Booking) => void;
  currentBranchCode: string;
  currentRole?: RoleCode;
}

export const BookingsAndSalesTab: React.FC<BookingsAndSalesTabProps> = ({
  bookings: initialBookings,
  customers,
  packages,
  rabs,
  onAddBooking,
  onUpdateBooking,
  currentBranchCode,
  currentRole = 'ADMIN_HQ',
}) => {
  const [bookingList, setBookingList] = useState<Booking[]>(initialBookings);

  // Booking Form State (Maker)
  const [bookingDate, setBookingDate] = useState('2026-10-12');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.customer_id || '');
  const [selectedPackageId, setSelectedPackageId] = useState<string>(packages[0]?.package_id || '');
  const [bookingType, setBookingType] = useState<'REGULAR' | 'ENDORSEMENT' | 'PAID_TALENT'>('REGULAR');
  const [roomType, setRoomType] = useState<'QUAD' | 'TRIPLE' | 'DOUBLE'>('QUAD');
  const [endorsementReason, setEndorsementReason] = useState('Promosi Kampanye Media Sosial Instagram & TikTok Religi');
  const [initialDpPaid, setInitialDpPaid] = useState<number>(10000000); // 10 Juta
  const [formNotes, setFormNotes] = useState('Pendaftaran jamaah via front-office kantor cabang');
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pagination & Filtering State (20 rows per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [stageFilter, setStageFilter] = useState<string>('ALL');

  // Modals
  const [viewBookingDetail, setViewBookingDetail] = useState<Booking | null>(null);
  const [editBookingModal, setEditBookingModal] = useState<Booking | null>(null);

  // Edit Modal Form State
  const [editCustName, setEditCustName] = useState('');
  const [editPkgId, setEditPkgId] = useState('');
  const [editType, setEditType] = useState<'REGULAR' | 'ENDORSEMENT' | 'PAID_TALENT'>('REGULAR');
  const [editRoom, setEditRoom] = useState<'QUAD' | 'TRIPLE' | 'DOUBLE'>('QUAD');
  const [editDate, setEditDate] = useState('');
  const [editDp, setEditDp] = useState<number>(0);
  const [editEndorseReason, setEditEndorseReason] = useState('');
  const [editGender, setEditGender] = useState<'L' | 'P'>('L');
  const [editPhotoUrl, setEditPhotoUrl] = useState<string>('');

  const selectedCustomer = customers.find((c) => c.customer_id === selectedCustomerId) || customers[0];
  const selectedPackage = packages.find((p) => p.package_id === selectedPackageId) || packages[0];
  const selectedRab = rabs.find((r) => r.package_id === selectedPackageId);

  // Jamaah Gender & Photo states for current booking form
  const [custGender, setCustGender] = useState<'L' | 'P'>(selectedCustomer?.gender || 'L');
  const [custPhotoUrl, setCustPhotoUrl] = useState<string>(selectedCustomer?.photo_url || '');

  React.useEffect(() => {
    if (selectedCustomer) {
      setCustGender(selectedCustomer.gender || 'L');
      setCustPhotoUrl(selectedCustomer.photo_url || '');
    }
  }, [selectedCustomerId]);

  // Pricing Calculation
  const basePrice = selectedRab?.public_selling_price || 29500000;
  const roomUpgradeFee = roomType === 'DOUBLE' ? 4000000 : roomType === 'TRIPLE' ? 2000000 : 0;
  const grossTotal = basePrice + roomUpgradeFee;
  const isEndorsement = bookingType === 'ENDORSEMENT';
  const finalPayable = isEndorsement ? 0 : grossTotal;

  // Mahram validation helper (female age < 45 requires mahram)
  const calculateAge = (bDate: string) => {
    const today = new Date();
    const birth = new Date(bDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const customerAge = selectedCustomer ? calculateAge(selectedCustomer.birth_date) : 30;
  const isMahramValid =
    selectedCustomer?.gender === 'L' ||
    customerAge >= 45 ||
    (selectedCustomer?.mahram_id !== null && selectedCustomer?.mahram_id !== undefined);

  // Handle Form Submit: Create New Booking (Maker Stage)
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isMahramValid) {
      setErrorMessage(
        'Validasi Siskopatuh Gagal: Jamaah wanita di bawah 45 tahun wajib memiliki Mahram terdaftar dalam sistem!'
      );
      setTimeout(() => setErrorMessage(null), 6000);
      return;
    }

    const bookingNo = `BKG/${currentBranchCode}/${new Date().getFullYear()}/${String(
      new Date().getMonth() + 1
    ).padStart(2, '0')}/${String(bookingList.length + 1).padStart(4, '0')}`;

    const newBkg: Booking = {
      booking_id: `bkg-${Date.now()}`,
      tenant_id: '11111111-1111-1111-1111-111111111111',
      branch_id: currentBranchCode,
      booking_number: bookingNo,
      customer_id: selectedCustomer.customer_id,
      customer_name: selectedCustomer.full_name,
      gender: custGender,
      photo_url: custPhotoUrl || getPersonPhoto(selectedCustomer.full_name, custGender),
      package_id: selectedPackage.package_id,
      package_name: selectedPackage.package_name,
      project_group_id: `KLOTER-${currentBranchCode}-01`,
      booking_type: bookingType,
      status: isEndorsement
        ? 'FULLY_PAID'
        : initialDpPaid >= finalPayable
        ? 'FULLY_PAID'
        : initialDpPaid > 0
        ? 'DP_PAID'
        : 'INQUIRY',
      room_type: roomType,
      package_price: grossTotal,
      discount_amount: isEndorsement ? grossTotal : 0,
      net_payable: finalPayable,
      total_paid: isEndorsement ? 0 : initialDpPaid,
      outstanding_balance: isEndorsement ? 0 : Math.max(finalPayable - initialDpPaid, 0),
      endorsement_reason: isEndorsement ? endorsementReason : undefined,
      booking_date: bookingDate,
      workflow_stage: 'DRAFT_MAKER',
      maker_name: `Maker Sales (${currentRole})`,
      created_at: new Date().toISOString(),
    };

    setBookingList([newBkg, ...bookingList]);
    onAddBooking(newBkg);

    setNotification(
      isEndorsement
        ? `Booking Endorsement ${bookingNo} BERHASIL DISIMPAN (DRAFT_MAKER)! Tagihan kas jamaah di-bypass Rp 0 dan diarahkan ke Beban Promosi.`
        : `Booking Reguler ${bookingNo} BERHASIL DIBUAT (DRAFT_MAKER)! Menunggu verifikasi Approver Finance & Releaser Tiket.`
    );
    setTimeout(() => setNotification(null), 5000);
  };

  // Workflow Action: Approver or Releaser Advancement
  const handleAdvanceWorkflowStage = (bookingId: string, targetStage: 'APPROVED' | 'RELEASED') => {
    setBookingList((prev) =>
      prev.map((b) => {
        if (b.booking_id !== bookingId) return b;
        const updated = { ...b, workflow_stage: targetStage };
        if (targetStage === 'APPROVED') {
          updated.approver_name = `Supervisor Finance (${currentRole})`;
        } else if (targetStage === 'RELEASED') {
          updated.releaser_name = `Direktur Operasional (${currentRole})`;
          if (b.status === 'INQUIRY') updated.status = 'DP_PAID';
        }
        if (onUpdateBooking) onUpdateBooking(updated);
        return updated;
      })
    );

    setNotification(
      targetStage === 'RELEASED'
        ? `Booking ID ${bookingId} BERHASIL DIRELEASER! Alokasi kursi resmi dikonfirmasi & voucher diterbitkan.`
        : `Booking ID ${bookingId} DISETUJUI (APPROVED) oleh Supervisor Finance. Siap ke tahap Releaser.`
    );
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle Edit Booking Open
  const handleOpenEdit = (b: Booking) => {
    setEditBookingModal(b);
    setEditCustName(b.customer_name);
    setEditPkgId(b.package_id);
    setEditType(b.booking_type);
    setEditRoom(b.room_type);
    setEditDate(b.booking_date || b.created_at.split('T')[0]);
    setEditDp(b.total_paid);
    setEditEndorseReason(b.endorsement_reason || '');
    setEditGender(b.gender || 'L');
    setEditPhotoUrl(b.photo_url || getPersonPhoto(b.customer_name, b.gender || 'L'));
  };

  // Handle Save Edit Booking
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBookingModal) return;

    const targetPkg = packages.find((p) => p.package_id === editPkgId) || packages[0];
    const targetRab = rabs.find((r) => r.package_id === editPkgId);
    const baseP = targetRab?.public_selling_price || targetPkg.quota_seats * 1000;
    const roomFee = editRoom === 'DOUBLE' ? 4000000 : editRoom === 'TRIPLE' ? 2000000 : 0;
    const grossP = baseP + roomFee;
    const isEnd = editType === 'ENDORSEMENT';
    const netP = isEnd ? 0 : grossP;

    const updated: Booking = {
      ...editBookingModal,
      customer_name: editCustName,
      gender: editGender,
      photo_url: editPhotoUrl,
      package_id: targetPkg.package_id,
      package_name: targetPkg.package_name,
      booking_type: editType,
      room_type: editRoom,
      booking_date: editDate,
      package_price: grossP,
      discount_amount: isEnd ? grossP : 0,
      net_payable: netP,
      total_paid: isEnd ? 0 : editDp,
      outstanding_balance: isEnd ? 0 : Math.max(netP - editDp, 0),
      endorsement_reason: isEnd ? editEndorseReason : undefined,
    };

    setBookingList((prev) => prev.map((b) => (b.booking_id === updated.booking_id ? updated : b)));
    if (onUpdateBooking) onUpdateBooking(updated);

    setEditBookingModal(null);
    setNotification(`Data Booking ${updated.booking_number} berhasil diperbarui.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Resizable table columns
  type BkgCol = 'date' | 'bkgNo' | 'cust' | 'pkg' | 'type' | 'room' | 'net' | 'stage' | 'status' | 'actions';
  const bkgCols = useResizableColumns<BkgCol>({
    date: 110,
    bkgNo: 150,
    cust: 180,
    pkg: 200,
    type: 110,
    room: 80,
    net: 130,
    stage: 120,
    status: 100,
    actions: 130,
  });

  // Filtered & Search Bookings
  const filteredBookings = useMemo(() => {
    return bookingList.filter((b) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        b.booking_number.toLowerCase().includes(q) ||
        b.customer_name.toLowerCase().includes(q) ||
        b.package_name.toLowerCase().includes(q);

      const matchesType = typeFilter === 'ALL' || b.booking_type === typeFilter;
      const matchesStage = stageFilter === 'ALL' || (b.workflow_stage || 'RELEASED') === stageFilter;

      return matchesSearch && matchesType && matchesStage;
    });
  }, [bookingList, searchQuery, typeFilter, stageFilter]);

  // Pagination (20 rows per page)
  const totalPages = Math.ceil(filteredBookings.length / pageSize) || 1;
  const paginatedBookings = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredBookings.slice(startIdx, startIdx + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-white text-base">
                Modul Sales &amp; Bookings (Pendaftaran, Mahram Siskopatuh &amp; Skema Endorsement)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Maker &bull; Approver &bull; Releaser
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Pendaftaran booking jamaah dengan pengecekan aturan Mahram Siskopatuh secara otomatis.
              Mendukung skema <strong>ENDORSEMENT (Artis / Influencer / Tokoh)</strong> di mana tagihan kas/piutang jamaah
              di-bypass (Rp 0) dan secara otomatis dijurnal ke akun <strong>Beban Promosi / Pemasaran</strong>.
              Tabel daftar booking menampilkan <strong>20 baris per halaman</strong> lengkap dengan detail view &amp; edit.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Role Aktif: <strong className="text-white font-mono">{currentRole}</strong> ({currentBranchCode})</span>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-700/60 text-emerald-200 text-xs flex items-center gap-2.5 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-700/60 text-rose-200 text-xs flex items-center gap-2.5 shadow-lg animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Grid: Booking Form vs Endorsement Auto-Journal Logic */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Booking Registration (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-cyan-400" />
              Form Pendaftaran Kursi Paket &amp; Endorsement
            </h4>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-bold">
              MAKER STAGE
            </span>
          </div>

          <form onSubmit={handleSubmitBooking} className="space-y-3.5 text-xs">
            {/* Tanggal Pendaftaran dengan Popup Calendar */}
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">
                Tanggal Pendaftaran Booking (Mode Popup) <span className="text-rose-500">*</span>
              </label>
              <PopupCalendar
                value={bookingDate}
                onChange={(d) => setBookingDate(d)}
                className="w-full"
              />
            </div>

            {/* Select Customer */}
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">
                Pilih Calon Jamaah (Master Jamaah) <span className="text-rose-500">*</span>
              </label>
              <select
                aria-label="Pilih Calon Jamaah"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:ring-1 focus:ring-cyan-500"
              >
                {customers.map((c) => (
                  <option key={c.customer_id} value={c.customer_id}>
                    {c.full_name} ({c.gender === 'L' ? 'Laki-laki' : 'Perempuan'}, {calculateAge(c.birth_date)} Thn) - NIK: {c.nik}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender & Photo Selector with Modest Hijab Option for Women */}
            <GenderPhotoSelector
              label="Jenis Kelamin & Foto Profil Jamaah"
              gender={custGender}
              onGenderChange={(g) => setCustGender(g)}
              photoUrl={custPhotoUrl}
              onPhotoChange={(url) => setCustPhotoUrl(url)}
              personName={selectedCustomer?.full_name || 'Jamaah'}
            />

            {/* Siskopatuh Mahram Warning / Valid status */}
            {selectedCustomer && (
              <div
                className={`p-3 rounded-xl border text-[11px] flex items-start gap-2 ${
                  isMahramValid
                    ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800 text-rose-300'
                }`}
              >
                {isMahramValid ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block">
                    {isMahramValid ? 'Syarat Mahram Terpenuhi (Valid)' : 'Peringatan Mahram Siskopatuh!'}
                  </span>
                  <span>
                    {isMahramValid
                      ? `Jamaah memenuhi syarat keberangkatan Kemenag. Usia: ${customerAge} Thn.`
                      : 'Jamaah wanita di bawah 45 tahun WAJIB memiliki Mahram resmi sebelum booking diproses!'}
                  </span>
                </div>
              </div>
            )}

            {/* Select Package */}
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">
                Pilih Paket Umrah <span className="text-rose-500">*</span>
              </label>
              <select
                aria-label="Pilih Paket Umrah"
                value={selectedPackageId}
                onChange={(e) => setSelectedPackageId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:ring-1 focus:ring-cyan-500"
              >
                {packages.map((pkg) => (
                  <option key={pkg.package_id} value={pkg.package_id}>
                    [{pkg.package_code}] {pkg.package_name} - Sisa Kuota: {pkg.quota_seats - pkg.booked_seats} Seat
                  </option>
                ))}
              </select>
            </div>

            {/* Booking Type: Regular vs Endorsement */}
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Tipe Skema Booking</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBookingType('REGULAR')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    bookingType === 'REGULAR'
                      ? 'bg-cyan-600/30 border-cyan-500 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Reguler Jamaah
                </button>
                <button
                  type="button"
                  onClick={() => setBookingType('ENDORSEMENT')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    bookingType === 'ENDORSEMENT'
                      ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Endorsement (Artis / Tokoh)
                </button>
              </div>
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Tipe Kamar Hotel</label>
              <select
                aria-label="Tipe Kamar Hotel"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
              >
                <option value="QUAD">QUAD (Sekamar Ber-4) - Termasuk Paket Dasar</option>
                <option value="TRIPLE">TRIPLE (Sekamar Ber-3) - Upgrade +Rp 2.000.000</option>
                <option value="DOUBLE">DOUBLE (Sekamar Ber-2) - Upgrade +Rp 4.000.000</option>
              </select>
            </div>

            {/* Endorsement Fields vs Reguler DP */}
            {isEndorsement ? (
              <div className="p-3.5 bg-purple-950/30 rounded-xl border border-purple-800/60 space-y-2 text-xs">
                <label className="block text-purple-300 font-bold text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Alasan &amp; Komitmen Kontrak Endorsement
                </label>
                <input
                  type="text"
                  value={endorsementReason}
                  onChange={(e) => setEndorsementReason(e.target.value)}
                  placeholder="Contoh: 10 Reels Instagram & 2 Liputan TV"
                  className="w-full bg-slate-900 border border-purple-700/60 rounded-lg px-3 py-2 text-white text-xs"
                  required
                />
                <span className="text-[11px] text-purple-300/80 block leading-relaxed">
                  Tagihan Rp {grossTotal.toLocaleString('id-ID')} akan otomatis <strong>di-bypass (Rp 0)</strong> dan dibebankan ke Beban Promosi Pemasaran Pusat setelah approval.
                </span>
              </div>
            ) : (
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Setoran Awal (DP Seat Dibayar) (Rp)
                </label>
                <input
                  type="number"
                  value={initialDpPaid}
                  onChange={(e) => setInitialDpPaid(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold text-emerald-400"
                  required
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Catatan Pendaftaran</label>
              <input
                type="text"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Simpan &amp; Proses Booking Jamaah (Maker)</span>
            </button>
          </form>
        </div>

        {/* Right Preview: Endorsement Journal & Summary (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3.5">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Logika Otomatisasi Jurnal &amp; Otorisasi RBAC Endorsement
            </h4>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Nilai Riil Paket (Include Kamar):</span>
                <span className="font-mono font-bold text-white text-sm">
                  Rp {grossTotal.toLocaleString('id-ID')}
                </span>
              </div>

              {isEndorsement ? (
                <div className="bg-purple-950/40 p-3.5 rounded-xl border border-purple-800 font-mono text-xs space-y-1.5 text-purple-200">
                  <span className="text-[10px] uppercase font-sans font-bold text-purple-400 block mb-1">
                    Auto-Jurnal Bypass (Beban Promosi / Pemasaran):
                  </span>
                  <div className="text-emerald-400">
                    (D) 6201-BEBAN-PROMOSI-ENDORSE &nbsp;&nbsp;&nbsp;: Rp {grossTotal.toLocaleString('id-ID')}
                  </div>
                  <div className="text-cyan-400 pl-4">
                    (C) 4101-PENDAPATAN-UMRAH &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: Rp {grossTotal.toLocaleString('id-ID')}
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans mt-2 pt-1 border-t border-purple-800/40">
                    *Tagihan kas dari jamaah artis/influencer di-bypass 100%. Hak kursi langsung dijamin setelah otorisasi Releaser C-Level.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 font-mono text-xs space-y-1 text-slate-300">
                  <span className="text-[10px] uppercase font-sans font-bold text-emerald-400 block mb-1">
                    Jurnal Standar Pembayaran Jamaah Reguler:
                  </span>
                  <div className="text-emerald-400">
                    (D) 1102-BSI-IDR (Kas/Bank Masuk) &nbsp;&nbsp;: Rp {initialDpPaid.toLocaleString('id-ID')}
                  </div>
                  <div className="text-rose-400 pl-4">
                    (C) 2103-DP-JAMAAH (Titipan Dana) &nbsp;&nbsp;: Rp {initialDpPaid.toLocaleString('id-ID')}
                  </div>
                </div>
              )}
            </div>

            {/* Maker - Approver - Releaser Rules Guidance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-slate-300 block">1. Maker (Sales)</span>
                <span className="text-slate-500">Mendaftarkan data jamaah, paket, &amp; dokumen mahram.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-cyan-300 block">2. Approver (Finance/Ops)</span>
                <span className="text-slate-500">Memvalidasi bukti transfer DP atau kontrak endorsement.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-emerald-300 block">3. Releaser (C-Level)</span>
                <span className="text-slate-500">Mengunci nomor seat &amp; merilis voucher Siskopatuh resmi.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings List Table (PAGINATED 20 ROWS PER PAGE) */}
      <CollapsibleCard
        title={`Daftar Booking Terdaftar (${filteredBookings.length} Total Jamaah)`}
        subtitle="Daftar tabel dinamis ditampilkan tepat 20 baris per halaman, lengkap dengan fitur View Detail, Edit Detail, dan Otorisasi Maker-Approver-Releaser"
        icon={Users}
        defaultOpen={true}
        headerRight={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              Hal. {currentPage} dari {totalPages} (Tampil 20 Row/Hal)
            </span>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Filter & Search Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F4F8F7] dark:bg-slate-950 p-3 rounded-xl border border-[#C0DDD6] dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Skema:
              </span>
              {['ALL', 'REGULAR', 'ENDORSEMENT'].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTypeFilter(t);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    typeFilter === t
                      ? 'bg-[#98C3BC] text-[#13302B] dark:bg-emerald-600 dark:text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-[#C0DDD6] dark:border-slate-700'
                  }`}
                >
                  {t === 'ALL' ? 'Semua Tipe' : t}
                </button>
              ))}

              <span className="font-semibold text-slate-600 dark:text-slate-400 ml-2">Tahap:</span>
              {['ALL', 'DRAFT_MAKER', 'APPROVED', 'RELEASED'].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStageFilter(s);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    stageFilter === s
                      ? 'bg-[#98C3BC] text-[#13302B] dark:bg-purple-600 dark:text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-[#C0DDD6] dark:border-slate-700'
                  }`}
                >
                  {s === 'ALL' ? 'Semua Tahap' : s}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari no. booking / nama jamaah..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-[#C0DDD6] dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse min-w-[950px]">
              <thead className="bg-[#EBF5F3] dark:bg-slate-950 text-[#1E4E46] dark:text-slate-300 font-bold border-b border-[#C0DDD6] dark:border-slate-800">
                <tr>
                  <ResizableTh width={bkgCols.widths.date} onResize={(e) => bkgCols.startResize('date', e)}>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Tgl Booking
                    </span>
                  </ResizableTh>
                  <ResizableTh width={bkgCols.widths.bkgNo} onResize={(e) => bkgCols.startResize('bkgNo', e)}>
                    No. Booking
                  </ResizableTh>
                  <ResizableTh width={bkgCols.widths.cust} onResize={(e) => bkgCols.startResize('cust', e)}>
                    Nama Calon Jamaah
                  </ResizableTh>
                  <ResizableTh width={bkgCols.widths.pkg} onResize={(e) => bkgCols.startResize('pkg', e)}>
                    Paket Umrah
                  </ResizableTh>
                  <ResizableTh width={bkgCols.widths.type} onResize={(e) => bkgCols.startResize('type', e)}>
                    Tipe Booking
                  </ResizableTh>
                  <ResizableTh width={bkgCols.widths.room} onResize={(e) => bkgCols.startResize('room', e)}>
                    Kamar
                  </ResizableTh>
                  <ResizableTh width={bkgCols.widths.net} onResize={(e) => bkgCols.startResize('net', e)}>
                    <div className="text-right">Tagihan Netto</div>
                  </ResizableTh>
                  <ResizableTh width={bkgCols.widths.stage} onResize={(e) => bkgCols.startResize('stage', e)}>
                    <div className="text-center">Workflow Stage</div>
                  </ResizableTh>
                  <ResizableTh width={bkgCols.widths.status} onResize={(e) => bkgCols.startResize('status', e)}>
                    <div className="text-center">Status Bayar</div>
                  </ResizableTh>
                  <ResizableTh width={bkgCols.widths.actions} onResize={(e) => bkgCols.startResize('actions', e)}>
                    <div className="text-center">Aksi Detail</div>
                  </ResizableTh>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C0DDD6]/60 dark:divide-slate-800 bg-white dark:bg-slate-900/60 font-mono text-xs">
                {paginatedBookings.length > 0 ? (
                  paginatedBookings.map((b) => {
                    const st = b.workflow_stage || 'RELEASED';
                    return (
                      <tr key={b.booking_id} className="hover:bg-[#F4F8F7]/80 dark:hover:bg-slate-800/40 transition">
                        <td className="px-3.5 py-3 text-slate-700 dark:text-slate-300 font-sans">
                          {b.booking_date || b.created_at.split('T')[0]}
                        </td>
                        <td className="px-3.5 py-3 font-bold text-cyan-700 dark:text-cyan-400">
                          {b.booking_number}
                        </td>
                        <td className="px-3.5 py-3 font-sans font-medium text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2.5">
                            <PersonAvatar
                              name={b.customer_name}
                              gender={b.gender}
                              photoUrl={b.photo_url}
                              size="sm"
                              showGenderBadge={true}
                            />
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold">{b.customer_name}</span>
                                <GenderBadge gender={b.gender} />
                              </div>
                              {b.endorsement_reason && (
                                <span className="text-[10px] text-purple-600 dark:text-purple-400 truncate block max-w-[170px] italic">
                                  "{b.endorsement_reason}"
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3.5 py-3 font-sans text-slate-700 dark:text-slate-300 text-[11px]">
                          {b.package_name}
                        </td>
                        <td className="px-3.5 py-3 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.booking_type === 'ENDORSEMENT'
                                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {b.booking_type}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 font-sans text-center font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                          {b.room_type}
                        </td>
                        <td className="px-3.5 py-3 text-right font-bold">
                          {b.net_payable === 0 ? (
                            <span className="text-purple-600 dark:text-purple-400">Rp 0 (Bypass)</span>
                          ) : (
                            <span className="text-emerald-700 dark:text-emerald-400">
                              Rp {b.net_payable.toLocaleString('id-ID')}
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-3 text-center font-sans">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              st === 'RELEASED'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : st === 'APPROVED'
                                ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            }`}
                          >
                            {st}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-center font-sans">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              b.status === 'FULLY_PAID'
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                                : b.status === 'DP_PAID'
                                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400'
                                : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-center font-sans">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewBookingDetail(b)}
                              title="Lihat Detail Booking"
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#C0DDD6] dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(b)}
                              title="Edit Detail Booking"
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-200 dark:hover:bg-cyan-900 text-cyan-700 dark:text-cyan-300"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Quick Workflow Action Button based on RBAC */}
                            {st === 'DRAFT_MAKER' && (
                              <button
                                type="button"
                                onClick={() => handleAdvanceWorkflowStage(b.booking_id, 'APPROVED')}
                                title="Approve Booking"
                                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-cyan-600 hover:bg-cyan-500 text-white"
                              >
                                Approve
                              </button>
                            )}
                            {st === 'APPROVED' && (
                              <button
                                type="button"
                                onClick={() => handleAdvanceWorkflowStage(b.booking_id, 'RELEASED')}
                                title="Release Seat & Voucher"
                                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                              >
                                Release
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-slate-400 font-sans">
                      Tidak ada booking terdaftar yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls (20 rows per page) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400">
            <div>
              Menampilkan{' '}
              <strong className="text-slate-900 dark:text-white font-mono">
                {filteredBookings.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </strong>{' '}
              -{' '}
              <strong className="text-slate-900 dark:text-white font-mono">
                {Math.min(currentPage * pageSize, filteredBookings.length)}
              </strong>{' '}
              dari{' '}
              <strong className="text-slate-900 dark:text-white font-mono">
                {filteredBookings.length}
              </strong>{' '}
              booking terdaftar (20 row/halaman)
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 rounded-lg border border-[#C0DDD6] dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 font-semibold"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-1.5 rounded-lg font-bold font-mono transition ${
                    currentPage === p
                      ? 'bg-[#98C3BC] text-[#13302B] dark:bg-emerald-600 dark:text-white shadow-sm'
                      : 'border border-[#C0DDD6] dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 rounded-lg border border-[#C0DDD6] dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 font-semibold"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </CollapsibleCard>

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW DETAIL BOOKING LENGKAP                                     */}
      {/* ========================================================================= */}
      {viewBookingDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto text-slate-800 dark:text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#C0DDD6] dark:border-slate-800">
              <div className="flex items-center gap-3">
                <PersonAvatar
                  name={viewBookingDetail.customer_name}
                  gender={viewBookingDetail.gender}
                  photoUrl={viewBookingDetail.photo_url}
                  size="lg"
                  showGenderBadge={true}
                />
                <div>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold text-xs block">
                    {viewBookingDetail.booking_number}
                  </span>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2 flex-wrap">
                    <span>{viewBookingDetail.customer_name}</span>
                    <GenderBadge gender={viewBookingDetail.gender} />
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {viewBookingDetail.gender === 'P' ? 'Jamaah Perempuan (Berjilbab)' : 'Jamaah Laki-laki'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewBookingDetail(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[11px]">Tanggal Booking</span>
                  <strong className="font-mono text-slate-900 dark:text-white">
                    {viewBookingDetail.booking_date || viewBookingDetail.created_at.split('T')[0]}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Tipe Skema</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {viewBookingDetail.booking_type}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Paket Umrah</span>
                  <strong className="text-slate-900 dark:text-white">{viewBookingDetail.package_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Tipe Kamar Hotel</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">
                    {viewBookingDetail.room_type}
                  </span>
                </div>
              </div>

              {/* Endorsement Details if applicable */}
              {viewBookingDetail.booking_type === 'ENDORSEMENT' && (
                <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/70 dark:bg-purple-950/20 space-y-1.5">
                  <span className="font-bold text-purple-900 dark:text-purple-300 block text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-500" /> Komitmen Kontrak Endorsement:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 italic text-[11px]">
                    "{viewBookingDetail.endorsement_reason || 'Promosi Media Sosial & Kampanye Biro Umrah'}"
                  </p>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 pt-1 font-mono font-bold">
                    Biaya Paket Rp {viewBookingDetail.package_price.toLocaleString('id-ID')} di-bypass (Rp 0 ke jamaah, dialokasikan ke Akun Beban Promosi).
                  </div>
                </div>
              )}

              {/* Financial Breakdown */}
              <div className="p-3.5 rounded-xl border border-[#C0DDD6] dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  Ringkasan Keuangan:
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Harga Paket Riil:</span>
                  <span className="font-mono font-bold">
                    Rp {viewBookingDetail.package_price.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Diskon / Bypass Endorse:</span>
                  <span className="font-mono font-bold text-purple-600">
                    -Rp {viewBookingDetail.discount_amount.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#C0DDD6] dark:border-slate-800 pt-1.5">
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Netto Tagihan:</span>
                  <span className="font-mono font-bold text-emerald-600 text-sm">
                    Rp {viewBookingDetail.net_payable.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total DP Dibayar:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    Rp {viewBookingDetail.total_paid.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sisa Piutang Jamaah:</span>
                  <span className="font-mono font-bold text-rose-600">
                    Rp {viewBookingDetail.outstanding_balance.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Maker Approver Releaser Signatures */}
              <div className="p-3.5 rounded-xl bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 space-y-1.5 text-[11px]">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Jejak Audit &amp; Otorisasi RBAC:
                </span>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Maker (Pendaftar):</span>
                  <strong className="text-slate-900 dark:text-white">
                    {viewBookingDetail.maker_name || 'Staff Front-Office'}
                  </strong>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Approver (Finance):</span>
                  <strong className="text-slate-900 dark:text-white">
                    {viewBookingDetail.approver_name || 'Supervisor Finance Cabang'}
                  </strong>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Releaser (C-Level):</span>
                  <strong className="text-slate-900 dark:text-white">
                    {viewBookingDetail.releaser_name || 'Direktur Operasional HQ'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewBookingDetail(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#98C3BC] text-[#13302B] dark:bg-slate-800 dark:text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT DETAIL BOOKING                                              */}
      {/* ========================================================================= */}
      {editBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto text-slate-800 dark:text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#C0DDD6] dark:border-slate-800">
              <div>
                <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold text-xs block">
                  {editBookingModal.booking_number}
                </span>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Edit Detail Data Booking
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditBookingModal(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Nama Calon Jamaah
                </label>
                <input
                  type="text"
                  required
                  value={editCustName}
                  onChange={(e) => setEditCustName(e.target.value)}
                  className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              {/* Edit Modal Gender & Photo Selector */}
              <GenderPhotoSelector
                label="Jenis Kelamin & Foto Jamaah"
                gender={editGender}
                onGenderChange={(g) => setEditGender(g)}
                photoUrl={editPhotoUrl}
                onPhotoChange={(u) => setEditPhotoUrl(u)}
                personName={editCustName || 'Jamaah'}
              />

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Tanggal Booking (Popup Calendar)
                </label>
                <PopupCalendar
                  value={editDate}
                  onChange={(d) => setEditDate(d)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Pilih Paket Umrah
                </label>
                <select
                  value={editPkgId}
                  onChange={(e) => setEditPkgId(e.target.value)}
                  className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                >
                  {packages.map((p) => (
                    <option key={p.package_id} value={p.package_id}>
                      {p.package_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Tipe Booking
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="REGULAR">Reguler Jamaah</option>
                    <option value="ENDORSEMENT">Endorsement Artis</option>
                    <option value="PAID_TALENT">Paid Talent / Muthawif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Tipe Kamar
                  </label>
                  <select
                    value={editRoom}
                    onChange={(e) => setEditRoom(e.target.value as any)}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="QUAD">QUAD (Sekamar 4)</option>
                    <option value="TRIPLE">TRIPLE (Sekamar 3)</option>
                    <option value="DOUBLE">DOUBLE (Sekamar 2)</option>
                  </select>
                </div>
              </div>

              {editType === 'ENDORSEMENT' ? (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Komitmen Kontrak Endorsement
                  </label>
                  <input
                    type="text"
                    value={editEndorseReason}
                    onChange={(e) => setEditEndorseReason(e.target.value)}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Setoran Awal (DP Seat Dibayar) (Rp)
                  </label>
                  <input
                    type="number"
                    value={editDp}
                    onChange={(e) => setEditDp(Number(e.target.value))}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 font-mono text-emerald-600 font-bold"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#C0DDD6] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditBookingModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white flex items-center gap-1.5 shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
