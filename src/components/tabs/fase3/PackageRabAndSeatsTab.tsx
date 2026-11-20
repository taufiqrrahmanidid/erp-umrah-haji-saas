import React, { useState } from 'react';
import {
  Package,
  Plane,
  Calculator,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Plus,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building,
  Calendar,
  DollarSign,
  Save,
  X,
  Search,
  Filter,
  UserCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  PackageItem,
  FlightAllocation,
  PackageRab,
  RoleCode,
} from '../../../types/erp.ts';
import { CollapsibleCard } from '../../common/CollapsibleCard.tsx';
import { PopupCalendar } from '../../common/PopupCalendar.tsx';
import { ResizableTh, useResizableColumns } from '../../common/ResizableTable.tsx';

interface PackageRabAndSeatsTabProps {
  packages: PackageItem[];
  allocations: FlightAllocation[];
  rabs: PackageRab[];
  onReleasePackage: (packageId: string) => void;
  onAddPackage?: (newPkg: PackageItem, newAlloc: FlightAllocation, newRab: PackageRab) => void;
  currentRole: RoleCode;
  currentBranchCode: string;
}

export const PackageRabAndSeatsTab: React.FC<PackageRabAndSeatsTabProps> = ({
  packages: initialPackages,
  allocations: initialAllocations,
  rabs: initialRabs,
  onReleasePackage,
  onAddPackage,
  currentRole,
  currentBranchCode,
}) => {
  const [packages, setPackages] = useState<PackageItem[]>(initialPackages);
  const [allocations, setAllocations] = useState<FlightAllocation[]>(initialAllocations);
  const [rabs, setRabs] = useState<PackageRab[]>(initialRabs);

  const [selectedPkgId, setSelectedPkgId] = useState<string>(packages[0]?.package_id || '');
  const [catalogPerspective, setCatalogPerspective] = useState<'PUBLIC_SALES' | 'KSO_NETT'>(
    currentBranchCode === 'C01' ? 'KSO_NETT' : 'PUBLIC_SALES'
  );
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Modal State: Tambah Paket Baru
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [viewDetailModal, setViewDetailModal] = useState<PackageItem | null>(null);

  // Form Fields: Paket Header
  const [formPkgCode, setFormPkgCode] = useState(`UMR-SYW-${Math.floor(100 + Math.random() * 900)}`);
  const [formPkgName, setFormPkgName] = useState('Paket Umrah Syawal Berkah Bintang 4 (9 Hari)');
  const [formPkgType, setFormPkgType] = useState<PackageItem['package_type']>('REGULER_9D');
  const [formDepartureDate, setFormDepartureDate] = useState('2026-11-20');
  const [formReturnDate, setFormReturnDate] = useState('2026-11-28');
  const [formDurationDays, setFormDurationDays] = useState(9);
  const [formHotelMakkah, setFormHotelMakkah] = useState('Anjum Hotel Makkah (Bintang 4)');
  const [formHotelMadinah, setFormHotelMadinah] = useState('Rove Al Madinah (Bintang 4)');
  const [formAirlineName, setFormAirlineName] = useState('Saudia Airlines (SV) Direct');
  const [formQuotaSeats, setFormQuotaSeats] = useState(45);

  // Form Fields: Flight Allocation
  const [formPnrCode, setFormPnrCode] = useState('SV-JKT-8891');
  const [formFlightGo, setFormFlightGo] = useState('SV-819 (CGK - JED)');
  const [formFlightBack, setFormFlightBack] = useState('SV-820 (MED - CGK)');
  const [formRoutePath, setFormRoutePath] = useState('CGK - JED // MED - CGK');
  const [formDueDate, setFormDueDate] = useState('2026-10-30');
  const [formDepositPerSeat, setFormDepositPerSeat] = useState(5000000);

  // Form Fields: RAB Components (IDR per Pax)
  const [costFlight, setCostFlight] = useState(14500000);
  const [costLaSaudi, setCostLaSaudi] = useState(2800000);
  const [costHotelMak, setCostHotelMak] = useState(3300000);
  const [costHotelMad, setCostHotelMad] = useState(2200000);
  const [costVisa, setCostVisa] = useState(2400000);
  const [costEquipment, setCostEquipment] = useState(1200000);
  const [costInsurance, setCostInsurance] = useState(350000);
  const [costMuthawif, setCostMuthawif] = useState(650000);
  const [costMgmtFee, setCostMgmtFee] = useState(400000);
  const [targetMargin, setTargetMargin] = useState(3500000);

  // Calculations
  const calculatedHppPerPax =
    costFlight +
    costLaSaudi +
    costHotelMak +
    costHotelMad +
    costVisa +
    costEquipment +
    costInsurance +
    costMuthawif +
    costMgmtFee;

  const calculatedKsoNett = calculatedHppPerPax + 1500000;
  const calculatedPublicPrice = calculatedHppPerPax + targetMargin;

  const selectedPkg = packages.find((p) => p.package_id === selectedPkgId) || packages[0];
  const selectedAllocation = allocations.find((a) => a.package_id === selectedPkgId);
  const selectedRab = rabs.find((r) => r.package_id === selectedPkgId);

  const isKsoRole = currentRole === 'ADMIN_BRANCH' && currentBranchCode === 'C01';

  // Role permissions check
  const isApproverRole =
    currentRole === 'ADMIN_HQ' ||
    currentRole === 'OWNER_CLEVEL' ||
    currentRole === 'ADMIN_BRANCH';
  const isReleaserRole =
    currentRole === 'ADMIN_HQ' ||
    currentRole === 'OWNER_CLEVEL';

  // Handle Workflow Stage Transitions (Approver / Releaser)
  const handleAdvanceWorkflow = (packageId: string, targetStage: 'APPROVED' | 'RELEASED') => {
    setPackages((prev) =>
      prev.map((pkg) => {
        if (pkg.package_id !== packageId) return pkg;
        const updated = { ...pkg, workflow_status: targetStage };
        if (targetStage === 'APPROVED') {
          updated.approver_name = `Supervisor Ops (${currentRole})`;
        } else if (targetStage === 'RELEASED') {
          updated.releaser_name = `Direktur Keuangan (${currentRole})`;
          updated.released_at = new Date().toISOString();
          updated.is_locked = true;
          onReleasePackage(packageId);
        }
        return updated;
      })
    );

    setNotification(
      targetStage === 'RELEASED'
        ? `Paket ${selectedPkg?.package_code} BERHASIL DIRELEASE & DIKUNCI! Seluruh komponen HPP terkunci aman (Read-Only) dan katalog aktif.`
        : `Paket ${selectedPkg?.package_code} BERHASIL DISETUJUI (APPROVED) oleh Operasional. Siap diajukan ke tahap Releaser C-Level!`
    );
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle Form Submit: Create New Package
  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();

    const newPkgId = `pkg-${Date.now()}`;
    const newPkg: PackageItem = {
      package_id: newPkgId,
      tenant_id: '11111111-1111-1111-1111-111111111111',
      package_code: formPkgCode.trim().toUpperCase(),
      package_name: formPkgName.trim(),
      package_type: formPkgType,
      departure_date: formDepartureDate,
      return_date: formReturnDate,
      duration_days: Number(formDurationDays),
      hotel_makkah: formHotelMakkah.trim(),
      hotel_madinah: formHotelMadinah.trim(),
      airline_name: formAirlineName.trim(),
      quota_seats: Number(formQuotaSeats),
      booked_seats: 0,
      workflow_status: 'DRAFT_MAKER',
      maker_name: `Product Specialist (${currentRole})`,
      is_locked: false,
    };

    const newAlloc: FlightAllocation = {
      allocation_id: `alloc-${Date.now()}`,
      package_id: newPkgId,
      airline_name: formAirlineName.trim(),
      pnr_code: formPnrCode.trim().toUpperCase(),
      flight_number_go: formFlightGo.trim(),
      flight_number_back: formFlightBack.trim(),
      route_path: formRoutePath.trim(),
      total_seats: Number(formQuotaSeats),
      held_seats: 0,
      available_seats: Number(formQuotaSeats),
      deposit_per_seat: Number(formDepositPerSeat),
      full_payment_due_date: formDueDate,
    };

    const newRab: PackageRab = {
      rab_id: `rab-${Date.now()}`,
      package_id: newPkgId,
      cost_ticket_flight: Number(costFlight),
      cost_la_saudi: Number(costLaSaudi),
      cost_hotel_makkah: Number(costHotelMak),
      cost_hotel_madinah: Number(costHotelMad),
      cost_visa_muasasah: Number(costVisa),
      cost_equipment_luggage: Number(costEquipment),
      cost_syariah_insurance: Number(costInsurance),
      cost_muthawif_tl_fee: Number(costMuthawif),
      cost_management_fee: Number(costMgmtFee),
      total_hpp_per_pax: calculatedHppPerPax,
      margin_target: Number(targetMargin),
      kso_nett_price: calculatedKsoNett,
      public_selling_price: calculatedPublicPrice,
    };

    setPackages([newPkg, ...packages]);
    setAllocations([newAlloc, ...allocations]);
    setRabs([newRab, ...rabs]);
    setSelectedPkgId(newPkgId);

    if (onAddPackage) {
      onAddPackage(newPkg, newAlloc, newRab);
    }

    setShowAddPackageModal(false);
    setNotification(
      `Paket Baru ${newPkg.package_code} berhasil dibuat dengan status DRAFT_MAKER! Menunggu peninjauan Approver & Releaser.`
    );
    setTimeout(() => setNotification(null), 5000);
  };

  // Filtered packages
  const filteredPackages = packages.filter((p) => {
    const matchesFilter = filterStatus === 'ALL' || p.workflow_status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.package_name.toLowerCase().includes(q) ||
      p.package_code.toLowerCase().includes(q) ||
      p.airline_name.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Intro Header & Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-white text-base">
                Master Paket, Block Seat Pesawat &amp; RAB Dinamis
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Maker &bull; Approver &bull; Releaser RBAC
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Manajemen alokasi kursi PNR maskapai untuk mencegah overbooking, penyusunan RAB modal HPP per jamaah,
              dan mekanisme <strong>Workflow Locking</strong>: Saat paket berstatus <em>RELEASED</em>, seluruh komponen
              biaya terkunci permanen (Read-Only). Katalog Cabang KSO hanya menampilkan <strong>Harga Nett KSO</strong> (HPP asli disembunyikan).
            </p>
          </div>
        </div>

        {/* Perspective toggle and Add Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setCatalogPerspective('PUBLIC_SALES')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                catalogPerspective === 'PUBLIC_SALES'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Katalog Sales / HQ
            </button>
            <button
              onClick={() => setCatalogPerspective('KSO_NETT')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                catalogPerspective === 'KSO_NETT'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Katalog Cabang KSO
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddPackageModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-950/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Input Paket Baru (Maker)</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-700/60 text-emerald-200 text-xs flex items-center gap-2.5 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Status:
          </span>
          {['ALL', 'DRAFT_MAKER', 'APPROVED', 'RELEASED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                filterStatus === st
                  ? 'bg-slate-700 text-white border border-slate-600'
                  : 'text-slate-400 hover:text-white bg-slate-950'
              }`}
            >
              {st === 'ALL' ? 'Semua' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari paket / maskapai..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500"
          />
        </div>
      </div>

      {/* Package Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredPackages.map((pkg) => {
          const isSelected = pkg.package_id === selectedPkgId;
          const pkgRab = rabs.find((r) => r.package_id === pkg.package_id);

          return (
            <div
              key={pkg.package_id}
              onClick={() => setSelectedPkgId(pkg.package_id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all space-y-3 ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {pkg.package_code}
                    </span>
                    <span className="text-[10px] text-slate-400">({pkg.duration_days}H)</span>
                  </div>
                  <h4 className="font-bold text-white text-sm mt-0.5">{pkg.package_name}</h4>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      pkg.workflow_status === 'RELEASED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : pkg.workflow_status === 'APPROVED'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {pkg.workflow_status}
                  </span>
                  {pkg.is_locked ? (
                    <span className="flex items-center gap-1 text-[10px] text-rose-400 font-semibold">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                      <Unlock className="w-3 h-3" /> Editable
                    </span>
                  )}
                </div>
              </div>

              {/* Departure date */}
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Berangkat: <strong className="text-slate-300 font-mono">{pkg.departure_date}</strong></span>
                <span className="truncate max-w-[120px] text-right font-medium">{pkg.airline_name}</span>
              </div>

              {/* Price according to perspective */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {catalogPerspective === 'KSO_NETT' ? 'Harga Nett KSO:' : 'Harga Publish Jamaah:'}
                </span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {pkgRab
                    ? catalogPerspective === 'KSO_NETT'
                      ? `Rp ${pkgRab.kso_nett_price.toLocaleString('id-ID')}`
                      : `Rp ${pkgRab.public_selling_price.toLocaleString('id-ID')}`
                    : '-'}
                </span>
              </div>

              {/* Quota Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Terisi: {pkg.booked_seats} Seat</span>
                  <span>Sisa: {pkg.quota_seats - pkg.booked_seats} Seat</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${Math.min((pkg.booked_seats / pkg.quota_seats) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Pane: Selected Package & RAB Breakdown */}
      {selectedPkg && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: PNR & Flight Allocation (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Plane className="w-4 h-4 text-cyan-400" />
                  Alokasi Kursi Pesawat &amp; PNR Maskapai
                </h4>
                <span className="text-xs font-mono font-bold text-cyan-300">
                  PNR: {selectedAllocation?.pnr_code || 'BELUM_ADA'}
                </span>
              </div>

              {selectedAllocation ? (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Maskapai</span>
                      <strong className="text-white text-xs">{selectedAllocation.airline_name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Rute</span>
                      <strong className="text-white text-xs">{selectedAllocation.route_path}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Flight Berangkat</span>
                      <span className="font-mono text-cyan-400 font-bold">{selectedAllocation.flight_number_go}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Flight Pulang</span>
                      <span className="font-mono text-cyan-400 font-bold">{selectedAllocation.flight_number_back}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Total Kuota Seat:</span>
                      <strong className="font-mono text-white text-sm">{selectedAllocation.total_seats} Seat</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Seat Tersedia (Open):</span>
                      <strong className="font-mono text-emerald-400 text-sm">{selectedAllocation.available_seats} Seat</strong>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <span className="text-slate-400">Deposit Per Kursi:</span>
                      <strong className="font-mono text-amber-400">
                        Rp {selectedAllocation.deposit_per_seat.toLocaleString('id-ID')}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Jatuh Tempo Pelunasan:</span>
                      <span className="font-mono text-rose-400 font-bold">{selectedAllocation.full_payment_due_date}</span>
                    </div>
                  </div>

                  {/* Hotel Information */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-300 block">Hotel &amp; Akomodasi:</span>
                    <div className="text-slate-400 flex items-start gap-1.5">
                      <Building className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>Makkah: <strong className="text-white">{selectedPkg.hotel_makkah}</strong></span>
                    </div>
                    <div className="text-slate-400 flex items-start gap-1.5">
                      <Building className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>Madinah: <strong className="text-white">{selectedPkg.hotel_madinah}</strong></span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">Belum ada alokasi PNR tiket untuk paket ini.</p>
              )}
            </div>

            {/* Workflow Approval Card (Maker - Approver - Releaser) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Alur Otorisasi RBAC Paket
                </h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedPkg.workflow_status === 'RELEASED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : selectedPkg.workflow_status === 'APPROVED'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {selectedPkg.workflow_status}
                </span>
              </div>

              {/* Timeline Maker -> Approver -> Releaser */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">1. MAKER (Pembuat Draft)</span>
                    <span className="font-semibold text-white">{selectedPkg.maker_name || 'Product Specialist'}</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">2. APPROVER (Verifikasi Ops &amp; Finance)</span>
                    <span className="font-semibold text-white">
                      {selectedPkg.approver_name || (selectedPkg.workflow_status === 'DRAFT_MAKER' ? 'Menunggu Approval' : '-')}
                    </span>
                  </div>
                  {selectedPkg.workflow_status === 'APPROVED' || selectedPkg.workflow_status === 'RELEASED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-400" />
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">3. RELEASER (Kunci &amp; Rilis C-Level)</span>
                    <span className="font-semibold text-white">
                      {selectedPkg.releaser_name || (selectedPkg.workflow_status === 'RELEASED' ? 'Direktur Keuangan' : 'Menunggu Rilis')}
                    </span>
                  </div>
                  {selectedPkg.workflow_status === 'RELEASED' ? (
                    <Lock className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-600" />
                  )}
                </div>
              </div>

              {/* Action Buttons based on RBAC */}
              <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                {selectedPkg.workflow_status === 'DRAFT_MAKER' && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceWorkflow(selectedPkg.package_id, 'APPROVED')}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center gap-2 shadow transition"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Setujui Paket (Approver Ops/Finance)</span>
                  </button>
                )}

                {selectedPkg.workflow_status === 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceWorkflow(selectedPkg.package_id, 'RELEASED')}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow transition"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Rilis &amp; Kunci Paket Permanen (Releaser C-Level)</span>
                  </button>
                )}

                {selectedPkg.workflow_status === 'RELEASED' && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs text-center font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Paket Telah Dirilis &amp; Terkunci Otomatis (Read-Only)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic RAB Components Table (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-white text-sm">
                    Rincian Anggaran Biaya (RAB) Modal HPP Per Pax
                  </h4>
                </div>
                {selectedPkg.is_locked ? (
                  <span className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 font-bold">
                    <Lock className="w-3.5 h-3.5" /> Biaya Terkunci (Locked)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">
                    <Unlock className="w-3.5 h-3.5" /> Dapat Diedit (Draft)
                  </span>
                )}
              </div>

              {selectedRab ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="px-3.5 py-2.5">Komponen Biaya</th>
                          <th className="px-3.5 py-2.5 text-right">Nominal (IDR / Pax)</th>
                          <th className="px-3.5 py-2.5">Keterangan Vendor Rekanan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-mono text-xs">
                        <tr className="hover:bg-slate-800/40">
                          <td className="px-3.5 py-2.5 font-sans text-white">Tiket Pesawat Return</td>
                          <td className="px-3.5 py-2.5 text-right text-emerald-400 font-bold">
                            Rp {selectedRab.cost_ticket_flight.toLocaleString('id-ID')}
                          </td>
                          <td className="px-3.5 py-2.5 font-sans text-slate-400">{selectedPkg.airline_name}</td>
                        </tr>
                        <tr className="hover:bg-slate-800/40">
                          <td className="px-3.5 py-2.5 font-sans text-white">Land Arrangement (LA) Saudi</td>
                          <td className="px-3.5 py-2.5 text-right text-emerald-400 font-bold">
                            Rp {selectedRab.cost_la_saudi.toLocaleString('id-ID')}
                          </td>
                          <td className="px-3.5 py-2.5 font-sans text-slate-400">Bus SAPTCO &amp; Handling Airport</td>
                        </tr>
                        <tr className="hover:bg-slate-800/40">
                          <td className="px-3.5 py-2.5 font-sans text-white">Hotel Makkah</td>
                          <td className="px-3.5 py-2.5 text-right text-emerald-400 font-bold">
                            Rp {selectedRab.cost_hotel_makkah.toLocaleString('id-ID')}
                          </td>
                          <td className="px-3.5 py-2.5 font-sans text-slate-400">{selectedPkg.hotel_makkah}</td>
                        </tr>
                        <tr className="hover:bg-slate-800/40">
                          <td className="px-3.5 py-2.5 font-sans text-white">Hotel Madinah</td>
                          <td className="px-3.5 py-2.5 text-right text-emerald-400 font-bold">
                            Rp {selectedRab.cost_hotel_madinah.toLocaleString('id-ID')}
                          </td>
                          <td className="px-3.5 py-2.5 font-sans text-slate-400">{selectedPkg.hotel_madinah}</td>
                        </tr>
                        <tr className="hover:bg-slate-800/40">
                          <td className="px-3.5 py-2.5 font-sans text-white">Visa Muasasah &amp; BRN</td>
                          <td className="px-3.5 py-2.5 text-right text-emerald-400 font-bold">
                            Rp {selectedRab.cost_visa_muasasah.toLocaleString('id-ID')}
                          </td>
                          <td className="px-3.5 py-2.5 font-sans text-slate-400">Muasasah Saudi Tasheel</td>
                        </tr>
                        <tr className="hover:bg-slate-800/40">
                          <td className="px-3.5 py-2.5 font-sans text-white">Perlengkapan &amp; Koper</td>
                          <td className="px-3.5 py-2.5 text-right text-emerald-400 font-bold">
                            Rp {selectedRab.cost_equipment_luggage.toLocaleString('id-ID')}
                          </td>
                          <td className="px-3.5 py-2.5 font-sans text-slate-400">Koper Fiber, Kain Ihram, Mukena, Batik</td>
                        </tr>
                        <tr className="hover:bg-slate-800/40">
                          <td className="px-3.5 py-2.5 font-sans text-white">Asuransi Perjalanan Syariah</td>
                          <td className="px-3.5 py-2.5 text-right text-emerald-400 font-bold">
                            Rp {selectedRab.cost_syariah_insurance.toLocaleString('id-ID')}
                          </td>
                          <td className="px-3.5 py-2.5 font-sans text-slate-400">Mitra Takaful Keluarga</td>
                        </tr>
                        <tr className="hover:bg-slate-800/40">
                          <td className="px-3.5 py-2.5 font-sans text-white">Honor Muthawif &amp; Tour Leader</td>
                          <td className="px-3.5 py-2.5 text-right text-emerald-400 font-bold">
                            Rp {selectedRab.cost_muthawif_tl_fee.toLocaleString('id-ID')}
                          </td>
                          <td className="px-3.5 py-2.5 font-sans text-slate-400">Bimbingan Ibadah Penuh</td>
                        </tr>
                        <tr className="hover:bg-slate-800/40">
                          <td className="px-3.5 py-2.5 font-sans text-white">Management Fee &amp; Overhead</td>
                          <td className="px-3.5 py-2.5 text-right text-emerald-400 font-bold">
                            Rp {selectedRab.cost_management_fee.toLocaleString('id-ID')}
                          </td>
                          <td className="px-3.5 py-2.5 font-sans text-slate-400">Operasional Biro &amp; Pusat</td>
                        </tr>
                      </tbody>
                      {/* Total HPP Footer */}
                      <tfoot className="bg-slate-950 font-mono text-xs border-t border-slate-800 font-bold">
                        <tr>
                          <td className="px-3.5 py-3 font-sans text-slate-300">TOTAL HPP MODAL (Per Pax):</td>
                          <td className="px-3.5 py-3 text-right text-amber-400 text-sm">
                            Rp {selectedRab.total_hpp_per_pax.toLocaleString('id-ID')}
                          </td>
                          <td className="px-3.5 py-3 font-sans text-slate-400 text-[11px]">
                            {isKsoRole ? '[Disembunyikan dari KSO]' : 'Modal Pokok Bersih'}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Price Calculation Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/60 space-y-1">
                      <span className="text-[10px] text-cyan-300 uppercase font-sans font-bold block">
                        Harga Nett Cabang KSO (cd2)
                      </span>
                      <span className="font-mono font-bold text-cyan-300 text-base">
                        Rp {selectedRab.kso_nett_price.toLocaleString('id-ID')}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Harga modal transfer yang disetor Cabang KSO ke rekening Pusat
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 space-y-1">
                      <span className="text-[10px] text-emerald-300 uppercase font-sans font-bold block">
                        Public Selling Price (cd3)
                      </span>
                      <span className="font-mono font-bold text-emerald-300 text-base">
                        Rp {selectedRab.public_selling_price.toLocaleString('id-ID')}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Harga publish resmi brosur ke calon jamaah (Margin: Rp {selectedRab.margin_target.toLocaleString('id-ID')})
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-6 text-center">
                  Belum ada komponen RAB yang dibuat untuk paket ini.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INPUT PAKET BARU & KOMPONEN RAB (MAKER - APPROVER - RELEASER)       */}
      {/* ========================================================================= */}
      {showAddPackageModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-5 animate-fadeIn max-h-[92vh] overflow-y-auto text-slate-200">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    Formulir Input Paket Baru &amp; Komponen RAB
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pembuatan draft paket oleh Maker, terhubung ke otorisasi Approver dan Releaser RBAC
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPackageModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-5 text-xs">
              {/* Section 1: Identitas Paket */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h5 className="font-bold text-emerald-400 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                  <Package className="w-4 h-4" /> 1. Identitas &amp; Jadwal Paket
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Kode Paket <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formPkgCode}
                      onChange={(e) => setFormPkgCode(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-400 font-semibold mb-1">
                      Nama Paket Brosur <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formPkgName}
                      onChange={(e) => setFormPkgName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Tipe Paket</label>
                    <select
                      value={formPkgType}
                      onChange={(e) => setFormPkgType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="REGULER_9D">Reguler 9 Hari</option>
                      <option value="REGULER_12D">Reguler 12 Hari</option>
                      <option value="VIP_CLOCK_TOWER">VIP Royal Clock Tower</option>
                      <option value="RAMADHAN_ITIKAF">Ramadhan Itikaf</option>
                      <option value="HAJI_KHUSUS">Haji Khusus / Furoda</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Tgl Keberangkatan (Popup)
                    </label>
                    <PopupCalendar
                      value={formDepartureDate}
                      onChange={(d) => setFormDepartureDate(d)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Tgl Kepulangan (Popup)
                    </label>
                    <PopupCalendar
                      value={formReturnDate}
                      onChange={(d) => setFormReturnDate(d)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Total Kuota Seat</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formQuotaSeats}
                      onChange={(e) => setFormQuotaSeats(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Maskapai</label>
                    <input
                      type="text"
                      value={formAirlineName}
                      onChange={(e) => setFormAirlineName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Hotel Makkah</label>
                    <input
                      type="text"
                      value={formHotelMakkah}
                      onChange={(e) => setFormHotelMakkah(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Hotel Madinah</label>
                    <input
                      type="text"
                      value={formHotelMadinah}
                      onChange={(e) => setFormHotelMadinah(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Alokasi Tiket & PNR */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h5 className="font-bold text-cyan-400 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                  <Plane className="w-4 h-4" /> 2. Alokasi Tiket Pesawat &amp; PNR
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Kode Booking PNR Maskapai
                    </label>
                    <input
                      type="text"
                      required
                      value={formPnrCode}
                      onChange={(e) => setFormPnrCode(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Flight Berangkat</label>
                    <input
                      type="text"
                      value={formFlightGo}
                      onChange={(e) => setFormFlightGo(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Flight Pulang</label>
                    <input
                      type="text"
                      value={formFlightBack}
                      onChange={(e) => setFormFlightBack(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Jatuh Tempo Pelunasan Tiket (Popup)
                    </label>
                    <PopupCalendar
                      value={formDueDate}
                      onChange={(d) => setFormDueDate(d)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Deposit Per Kursi (Rp)</label>
                    <input
                      type="number"
                      value={formDepositPerSeat}
                      onChange={(e) => setFormDepositPerSeat(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Komponen Rincian Anggaran Biaya (RAB) */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h5 className="font-bold text-amber-400 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                  <DollarSign className="w-4 h-4" /> 3. Komponen Biaya RAB HPP (IDR / Pax)
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Tiket Pesawat (Rp)</label>
                    <input
                      type="number"
                      value={costFlight}
                      onChange={(e) => setCostFlight(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">LA Saudi &amp; Bus (Rp)</label>
                    <input
                      type="number"
                      value={costLaSaudi}
                      onChange={(e) => setCostLaSaudi(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Hotel Makkah (Rp)</label>
                    <input
                      type="number"
                      value={costHotelMak}
                      onChange={(e) => setCostHotelMak(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Hotel Madinah (Rp)</label>
                    <input
                      type="number"
                      value={costHotelMad}
                      onChange={(e) => setCostHotelMad(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Visa Muasasah &amp; Asuransi Saudi (Rp)</label>
                    <input
                      type="number"
                      value={costVisa}
                      onChange={(e) => setCostVisa(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Perlengkapan &amp; Koper (Rp)</label>
                    <input
                      type="number"
                      value={costEquipment}
                      onChange={(e) => setCostEquipment(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Asuransi Syariah (Rp)</label>
                    <input
                      type="number"
                      value={costInsurance}
                      onChange={(e) => setCostInsurance(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Honor Muthawif &amp; TL (Rp)</label>
                    <input
                      type="number"
                      value={costMuthawif}
                      onChange={(e) => setCostMuthawif(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Management Fee (Rp)</label>
                    <input
                      type="number"
                      value={costMgmtFee}
                      onChange={(e) => setCostMgmtFee(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Target Margin Profit (Rp)</label>
                    <input
                      type="number"
                      value={targetMargin}
                      onChange={(e) => setTargetMargin(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-emerald-400"
                    />
                  </div>
                </div>

                {/* Live Computation Bar */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold">Total HPP Modal / Pax:</span>
                    <strong className="text-sm font-mono text-amber-400">
                      Rp {calculatedHppPerPax.toLocaleString('id-ID')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold">Harga Nett KSO (cd2):</span>
                    <strong className="text-sm font-mono text-cyan-400">
                      Rp {calculatedKsoNett.toLocaleString('id-ID')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold">Public Selling Price (cd3):</span>
                    <strong className="text-sm font-mono text-emerald-400">
                      Rp {calculatedPublicPrice.toLocaleString('id-ID')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* RBAC Notice */}
              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/60 flex items-center gap-2.5 text-xs text-purple-200">
                <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />
                <span>
                  Paket akan disimpan sebagai <strong>DRAFT_MAKER</strong>. Anda dapat meminta peninjauan verifikasi dari <strong>Approver Operasional</strong> dan otorisasi akhir <strong>Releaser C-Level</strong> agar paket aktif di katalog &amp; modul pendaftaran.
                </span>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddPackageModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Draft Paket Baru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
