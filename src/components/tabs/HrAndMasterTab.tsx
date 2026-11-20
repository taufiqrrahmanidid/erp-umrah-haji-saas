import React, { useState } from 'react';
import {
  Users,
  Briefcase,
  MapPin,
  CalendarCheck,
  CreditCard,
  Building,
  ShieldCheck,
  BadgePercent,
  CheckCircle2,
  Clock,
  FileCheck,
  DollarSign,
  ArrowRight,
  Plus,
  Eye,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Filter,
  Phone,
  Mail,
  Shield,
  Calendar,
  Layers,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';
import {
  Employee,
  Attendance,
  LeaveRequest,
  PayrollComponent,
  ExchangeRate,
  DocumentSequence,
  Vendor,
  VendorRegistration,
  GeneralMaster,
  AgentCommissionSetting,
} from '../../types/erp.ts';
import { mockGeneralMasters } from '../../data/mockData.ts';
import { mockAgentCommissionSettings } from '../../data/mockDataFase7.ts';
import { CollapsibleCard } from '../common/CollapsibleCard.tsx';
import { PopupCalendar } from '../common/PopupCalendar.tsx';
import { RegionalLocationSelector } from '../common/RegionalLocationSelector.tsx';
import { ResizableTh, useResizableColumns } from '../common/ResizableTable.tsx';
import {
  PersonAvatar,
  GenderBadge,
  GenderPhotoSelector,
  getPersonPhoto,
} from '../../utils/personAvatars.tsx';

interface HrAndMasterTabProps {
  employees: Employee[];
  attendances: Attendance[];
  leaveRequests: LeaveRequest[];
  payrolls: PayrollComponent[];
  exchangeRates: ExchangeRate[];
  sequences: DocumentSequence[];
  vendors: Vendor[];
  vendorRegistrations: VendorRegistration[];
  generalMasters?: GeneralMaster[];
}

export const HrAndMasterTab: React.FC<HrAndMasterTabProps> = ({
  employees: initialEmployees,
  attendances,
  leaveRequests,
  payrolls,
  exchangeRates: initialExchangeRates,
  sequences,
  vendors: initialVendors,
  vendorRegistrations,
  generalMasters = mockGeneralMasters,
}) => {
  const [subTab, setSubTab] = useState<'HR' | 'RATES_SEQ' | 'VENDORS' | 'COMMISSIONS'>('HR');

  // --- 4. KOMISI AGEN STATE ---
  const [commissionTiers, setCommissionTiers] = useState<AgentCommissionSetting[]>(mockAgentCommissionSettings);
  const [showAddTierModal, setShowAddTierModal] = useState(false);
  const [viewTierDetail, setViewTierDetail] = useState<AgentCommissionSetting | null>(null);
  const [newTierCode, setNewTierCode] = useState('TIER_VIP');
  const [newTierName, setNewTierName] = useState('Mitra VIP Korporat');
  const [newCommissionReguler, setNewCommissionReguler] = useState(1750000);
  const [newCommissionRamadhan, setNewCommissionRamadhan] = useState(2250000);
  const [newTargetPax, setNewTargetPax] = useState(25);
  const [newBonusAchievement, setNewBonusAchievement] = useState(15000000);
  const [newApplicableBranch, setNewApplicableBranch] = useState<'ALL' | 'HQ' | 'MANDIRI' | 'KSO' | 'SUB_KSO'>('ALL');
  const [newTierNotes, setNewTierNotes] = useState('Skema komisi khusus instansi dan komunitas pengajian besar.');

  // --- 1. HR PEGAWAI STATE ---
  const [employeeList, setEmployeeList] = useState<Employee[]>(initialEmployees);
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [viewEmpDetail, setViewEmpDetail] = useState<Employee | null>(null);
  const [empSearch, setEmpSearch] = useState('');
  const [empStatusFilter, setEmpStatusFilter] = useState<'ALL' | 'PUSAT' | 'MANDIRI' | 'KSO'>('ALL');

  // Form Entry Pegawai
  const [empNik, setEmpNik] = useState('');
  const [empName, setEmpName] = useState('');
  const [empGender, setEmpGender] = useState<'L' | 'P'>('L');
  const [empPhotoUrl, setEmpPhotoUrl] = useState<string>('');
  const [empJabatan, setEmpJabatan] = useState('Staf Operasional Cabang');
  const [empBranch, setEmpBranch] = useState('C01');
  const [empStatus, setEmpStatus] = useState<'PUSAT' | 'MANDIRI' | 'KSO'>('KSO');
  const [empTanggalMasuk, setEmpTanggalMasuk] = useState('2024-03-01');
  const [empGajiPokok, setEmpGajiPokok] = useState(6500000);
  const [empTunjangan, setEmpTunjangan] = useState(1500000);
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  // Regional Alamat Pegawai
  const [empIsland, setEmpIsland] = useState('ISL30');
  const [empProvince, setEmpProvince] = useState('PV35');
  const [empProvinceName, setEmpProvinceName] = useState('JAWA TIMUR');
  const [empCity, setEmpCity] = useState('3571');
  const [empCityName, setEmpCityName] = useState('KOTA KEDIRI');
  const [empAddress1, setEmpAddress1] = useState('');
  const [empDistrict, setEmpDistrict] = useState('');
  const [empVillage, setEmpVillage] = useState('');
  const [empRt, setEmpRt] = useState('001');
  const [empRw, setEmpRw] = useState('001');
  const [empPostal, setEmpPostal] = useState('64129');

  // --- 2. KURS VALAS STATE ---
  const [rateList, setRateList] = useState<ExchangeRate[]>(() =>
    initialExchangeRates.map((r) => ({
      ...r,
      valid_until: r.currency_code === 'SAR' ? '2026-10-31' : '2026-10-25',
      source_rate: r.currency_code === 'SAR' ? 'Al Rajhi Bank Saudi & Reuters' : 'Bank Indonesia (JISDOR)',
    }))
  );
  const [rateSearch, setRateSearch] = useState('');
  const [showAddRateModal, setShowAddRateModal] = useState(false);

  // Form Entry Kurs
  const [newCurrency, setNewCurrency] = useState<'SAR' | 'USD' | 'EUR' | 'MYR'>('SAR');
  const [newBuyRate, setNewBuyRate] = useState(4220);
  const [newSellRate, setNewSellRate] = useState(4295);
  const [newMiddleRate, setNewMiddleRate] = useState(4257);
  const [newEffectiveDate, setNewEffectiveDate] = useState('2026-10-10');
  const [newValidUntil, setNewValidUntil] = useState('2026-10-31');
  const [newSourceRate, setNewSourceRate] = useState('Bank Indonesia & Al Rajhi Spot');

  // --- 3. VENDOR & MITRA ASURANSI STATE ---
  const [vendorList, setVendorList] = useState<Vendor[]>(() =>
    initialVendors.map((v) => ({
      ...v,
      island_code: 'ISL30',
      province_name: 'DKI JAKARTA',
      city_name: 'JAKARTA SELATAN',
      policy_number: v.category === 'ASURANSI' ? 'POL-SYR-2026-8819' : undefined,
      ojk_permit_number: v.category === 'ASURANSI' ? 'KEP-882/NB.2/2021 (OJK Syariah)' : undefined,
    }))
  );
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorCatFilter, setVendorCatFilter] = useState<string>('ALL');
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [viewVendorDetail, setViewVendorDetail] = useState<Vendor | null>(null);

  // Form Entry Vendor
  const [venCode, setVenCode] = useState('');
  const [venName, setVenName] = useState('');
  const [venCategory, setVenCategory] = useState<Vendor['category']>('ASURANSI');
  const [venContact, setVenContact] = useState('');
  const [venPhone, setVenPhone] = useState('');
  const [venEmail, setVenEmail] = useState('');
  const [venAddress, setVenAddress] = useState('');
  const [venPolicyNo, setVenPolicyNo] = useState('POL-SYR-2026-9901');
  const [venOjkPermit, setVenOjkPermit] = useState('OJK-SYR-2023/PPIU');
  const [venIsland, setVenIsland] = useState('ISL30');
  const [venProvince, setVenProvince] = useState('PV31');
  const [venProvinceName, setVenProvinceName] = useState('DKI JAKARTA');
  const [venCity, setVenCity] = useState('3174');
  const [venCityName, setVenCityName] = useState('JAKARTA SELATAN');

  // Resizable Columns: Employees
  type EmpCol = 'nik' | 'name' | 'jabatan' | 'branch' | 'status' | 'tgl' | 'actions';
  const empCols = useResizableColumns<EmpCol>({
    nik: 120,
    name: 240,
    jabatan: 180,
    branch: 100,
    status: 110,
    tgl: 120,
    actions: 100,
  });

  // Resizable Columns: Rates
  type RateCol = 'curr' | 'desc' | 'effective' | 'valid' | 'source' | 'rates';
  const rateCols = useResizableColumns<RateCol>({
    curr: 90,
    desc: 170,
    effective: 120,
    valid: 120,
    source: 210,
    rates: 200,
  });

  // Resizable Columns: Vendors
  type VenCol = 'code' | 'name' | 'cat' | 'city' | 'contact' | 'syariah' | 'actions';
  const venCols = useResizableColumns<VenCol>({
    code: 110,
    name: 240,
    cat: 150,
    city: 140,
    contact: 160,
    syariah: 110,
    actions: 100,
  });

  // Add Employee Handler
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empNik.trim() || !empName.trim()) return;

    const newEmp: Employee = {
      employee_id: `emp-gen-${Date.now()}`,
      tenant_id: '11111111-1111-1111-1111-111111111111',
      owner_branch_id: empBranch,
      user_id: `usr-${empNik}`,
      branch_id: empBranch,
      nik_karyawan: empNik.trim().toUpperCase(),
      user_name: empName.trim(),
      gender: empGender,
      photo_url: empPhotoUrl || getPersonPhoto(empName, empGender),
      jabatan: empJabatan.trim(),
      tanggal_masuk: empTanggalMasuk,
      status_karyawan: empStatus,
      status_aktif: true,
      email: empEmail.trim(),
      phone: empPhone.trim(),
      address_1: empAddress1.trim(),
      island_code: empIsland,
      province_code: empProvince,
      province_name: empProvinceName,
      city_code: empCity,
      city_name: empCityName,
      district: empDistrict,
      village: empVillage,
      rt: empRt,
      rw: empRw,
      postal_code: empPostal,
      gaji_pokok: empGajiPokok,
      tunjangan: empTunjangan,
    };

    setEmployeeList([newEmp, ...employeeList]);
    setShowAddEmpModal(false);
    setEmpNik('');
    setEmpName('');
    setEmpGender('L');
    setEmpPhotoUrl('');
    setEmpAddress1('');
  };

  // Add Exchange Rate Handler
  const handleAddRate = (e: React.FormEvent) => {
    e.preventDefault();
    const newRate: ExchangeRate = {
      rate_id: `rate-gen-${Date.now()}`,
      tenant_id: '11111111-1111-1111-1111-111111111111',
      currency_code: newCurrency,
      buy_rate: newBuyRate,
      sell_rate: newSellRate,
      middle_rate: newMiddleRate,
      effective_date: newEffectiveDate,
      valid_until: newValidUntil,
      source_rate: newSourceRate,
      updated_at: new Date().toISOString(),
    };

    setRateList([newRate, ...rateList]);
    setShowAddRateModal(false);
  };

  // Add Vendor Handler
  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!venCode.trim() || !venName.trim()) return;

    const newVen: Vendor = {
      vendor_id: `ven-gen-${Date.now()}`,
      tenant_id: '11111111-1111-1111-1111-111111111111',
      owner_branch_id: 'C00',
      vendor_code: venCode.trim().toUpperCase(),
      vendor_name: venName.trim(),
      category: venCategory,
      is_syariah_compliant: true,
      contact_person: venContact.trim(),
      phone: venPhone.trim(),
      email: venEmail.trim(),
      address: venAddress.trim(),
      island_code: venIsland,
      province_code: venProvince,
      province_name: venProvinceName,
      city_code: venCity,
      city_name: venCityName,
      policy_number: venCategory === 'ASURANSI' ? venPolicyNo : undefined,
      ojk_permit_number: venCategory === 'ASURANSI' ? venOjkPermit : undefined,
      is_active: true,
    };

    setVendorList([newVen, ...vendorList]);
    setShowAddVendorModal(false);
    setVenCode('');
    setVenName('');
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F4F8F7] dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 p-3 rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSubTab('HR')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              subTab === 'HR'
                ? 'bg-[#98C3BC] text-[#13302B] dark:bg-emerald-600 dark:text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-[#C0DDD6] dark:border-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. SDM Pegawai &amp; Presensi</span>
          </button>

          <button
            onClick={() => setSubTab('RATES_SEQ')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              subTab === 'RATES_SEQ'
                ? 'bg-[#98C3BC] text-[#13302B] dark:bg-emerald-600 dark:text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-[#C0DDD6] dark:border-slate-700'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>2. Master Kurs Valas &amp; Sumber Kurs</span>
          </button>

          <button
            onClick={() => setSubTab('VENDORS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              subTab === 'VENDORS'
                ? 'bg-[#98C3BC] text-[#13302B] dark:bg-emerald-600 dark:text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-[#C0DDD6] dark:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>3. Vendor &amp; Mitra Asuransi Syariah</span>
          </button>

          <button
            onClick={() => setSubTab('COMMISSIONS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              subTab === 'COMMISSIONS'
                ? 'bg-[#98C3BC] text-[#13302B] dark:bg-emerald-600 dark:text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-[#C0DDD6] dark:border-slate-700'
            }`}
          >
            <BadgePercent className="w-4 h-4" />
            <span>4. Setingan Komisi Agen (Tier &amp; CRM)</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 font-mono hidden md:inline">
          Master SDM, Kurs &amp; Rekanan Enterprise
        </span>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: SDM PEGAWAI, ABSENSI & PAYROLL */}
      {/* ========================================================================= */}
      {subTab === 'HR' && (
        <div className="space-y-6">
          {/* Collapsible Card: Daftar Pegawai */}
          <CollapsibleCard
            title={`Data SDM Pegawai (${employeeList.length} Pegawai)`}
            subtitle="Daftar tabel dinamis dengan kolom resizable, filter cabang, pencarian, dan formulir pendaftaran pegawai baru"
            icon={Briefcase}
            defaultOpen={true}
            headerRight={
              <button
                type="button"
                onClick={() => setShowAddEmpModal(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Entry Pegawai Baru</span>
              </button>
            }
          >
            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-[#F4F8F7] dark:bg-slate-950 p-3 rounded-xl border border-[#C0DDD6] dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Status Pegawai:
                </span>
                {(['ALL', 'PUSAT', 'MANDIRI', 'KSO'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setEmpStatusFilter(st)}
                    className={`px-3 py-1 rounded-xl font-bold transition-all ${
                      empStatusFilter === st
                        ? 'bg-[#98C3BC] text-[#13302B] dark:bg-emerald-600 dark:text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-[#C0DDD6] dark:border-slate-800'
                    }`}
                  >
                    {st === 'ALL' ? 'Semua' : st}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                  placeholder="Cari nama atau NIK pegawai..."
                  className="w-full bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
                />
              </div>
            </div>

            {/* Resizable Table Pegawai */}
            <div className="overflow-x-auto rounded-xl border border-[#C0DDD6] dark:border-slate-800">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-[#EBF5F3] dark:bg-slate-950 text-[#1E4E46] dark:text-slate-200 border-b border-[#C0DDD6] dark:border-slate-800">
                    <ResizableTh width={empCols.widths.nik} onResize={(e) => empCols.startResize('nik', e)}>
                      NIK Karyawan
                    </ResizableTh>
                    <ResizableTh width={empCols.widths.name} onResize={(e) => empCols.startResize('name', e)}>
                      Nama Pegawai
                    </ResizableTh>
                    <ResizableTh width={empCols.widths.jabatan} onResize={(e) => empCols.startResize('jabatan', e)}>
                      Jabatan
                    </ResizableTh>
                    <ResizableTh width={empCols.widths.branch} onResize={(e) => empCols.startResize('branch', e)}>
                      Unit Cabang
                    </ResizableTh>
                    <ResizableTh width={empCols.widths.status} onResize={(e) => empCols.startResize('status', e)}>
                      Status Kerja
                    </ResizableTh>
                    <ResizableTh width={empCols.widths.tgl} onResize={(e) => empCols.startResize('tgl', e)}>
                      Tgl Masuk
                    </ResizableTh>
                    <ResizableTh width={empCols.widths.actions} onResize={(e) => empCols.startResize('actions', e)} align="center">
                      Aksi
                    </ResizableTh>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C0DDD6]/60 dark:divide-slate-800/80 text-xs">
                  {employeeList
                    .filter((emp) => {
                      const matchesSearch =
                        (emp.user_name || '').toLowerCase().includes(empSearch.toLowerCase()) ||
                        emp.nik_karyawan.toLowerCase().includes(empSearch.toLowerCase());
                      const matchesStatus =
                        empStatusFilter === 'ALL' ? true : emp.status_karyawan === empStatusFilter;
                      return matchesSearch && matchesStatus;
                    })
                    .map((emp) => (
                      <tr
                        key={emp.employee_id}
                        onClick={() => setViewEmpDetail(emp)}
                        className="hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                      >
                        <td className="px-3.5 py-3 font-mono font-bold text-[#1E4E46] dark:text-emerald-400">
                          {emp.nik_karyawan}
                        </td>
                        <td className="px-3.5 py-3 font-semibold text-slate-900 dark:text-white">
                          {emp.user_name}
                        </td>
                        <td className="px-3.5 py-3 text-slate-700 dark:text-slate-300">
                          {emp.jabatan}
                        </td>
                        <td className="px-3.5 py-3 font-mono text-slate-600 dark:text-slate-400">
                          {emp.branch_id}
                        </td>
                        <td className="px-3.5 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              emp.status_karyawan === 'PUSAT'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300'
                                : emp.status_karyawan === 'KSO'
                                ? 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300'
                            }`}
                          >
                            {emp.status_karyawan}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-slate-500 dark:text-slate-400">
                          {emp.tanggal_masuk}
                        </td>
                        <td
                          className="px-3.5 py-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setViewEmpDetail(emp)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-slate-800 dark:text-white flex items-center gap-1 mx-auto"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Detail</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CollapsibleCard>

          {/* Attendances & Payroll Components */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CollapsibleCard
              title="Presensi & Geolokasi Lapangan"
              subtitle="Catatan jam masuk dan titik koordinat GPS muthawif & staf"
              icon={CalendarCheck}
              defaultOpen={true}
            >
              <div className="space-y-2.5">
                {attendances.map((att) => (
                  <div
                    key={att.attendance_id}
                    className="p-3 rounded-xl bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 flex items-start justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {att.employee_name}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {att.notes}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-[#1E4E46] dark:text-cyan-400 font-mono">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        {att.latitude_in}, {att.longitude_in}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                      {att.status}
                    </span>
                  </div>
                ))}
              </div>
            </CollapsibleCard>

            <CollapsibleCard
              title="Komponen Gaji & Slip Payroll"
              subtitle="Rincian gaji pokok, tunjangan, dan potongan BPJS & PPh21"
              icon={CreditCard}
              defaultOpen={true}
            >
              <div className="space-y-3">
                {payrolls.map((pr) => (
                  <div
                    key={pr.payroll_id}
                    className="p-3 rounded-xl bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{pr.employee_name}</span>
                      <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                        Take Home: Rp {pr.gaji_bersih.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500 bg-white dark:bg-slate-900 p-2 rounded-lg border border-[#C0DDD6]/60 dark:border-slate-800">
                      <div>
                        Gaji Pokok: <span className="text-slate-800 dark:text-white block font-mono">Rp {pr.gaji_pokok.toLocaleString()}</span>
                      </div>
                      <div>
                        Tunjangan: <span className="text-slate-800 dark:text-white block font-mono">Rp {(pr.tunjangan_tetap + pr.tunjangan_tidak_tetap).toLocaleString()}</span>
                      </div>
                      <div>
                        BPJS &amp; PPh: <span className="text-rose-600 dark:text-rose-400 block font-mono">Rp {(pr.bpjs_kesehatan + pr.bpjs_ketenagakerjaan + pr.pph_21).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleCard>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: KURS VALAS, MASA BERLAKU & SUMBER KURS */}
      {/* ========================================================================= */}
      {subTab === 'RATES_SEQ' && (
        <div className="space-y-6">
          <CollapsibleCard
            title={`Master Kurs Transaksi Valas & Sumber Kurs (${rateList.length} Mata Uang)`}
            subtitle="Pendaftaran kurs harian, masa berlaku tarif (dari-sampai), dan sumber rujukan resmi (Bank Indonesia, Al Rajhi, SAR Spot)"
            icon={DollarSign}
            defaultOpen={true}
            headerRight={
              <button
                type="button"
                onClick={() => setShowAddRateModal(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Pendaftaran Kurs Baru</span>
              </button>
            }
          >
            {/* Resizable Table Kurs */}
            <div className="overflow-x-auto rounded-xl border border-[#C0DDD6] dark:border-slate-800">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-[#EBF5F3] dark:bg-slate-950 text-[#1E4E46] dark:text-slate-200 border-b border-[#C0DDD6] dark:border-slate-800">
                    <ResizableTh width={rateCols.widths.curr} onResize={(e) => rateCols.startResize('curr', e)}>
                      Mata Uang
                    </ResizableTh>
                    <ResizableTh width={rateCols.widths.desc} onResize={(e) => rateCols.startResize('desc', e)}>
                      Deskripsi Valas
                    </ResizableTh>
                    <ResizableTh width={rateCols.widths.effective} onResize={(e) => rateCols.startResize('effective', e)}>
                      Berlaku Mulai
                    </ResizableTh>
                    <ResizableTh width={rateCols.widths.valid} onResize={(e) => rateCols.startResize('valid', e)}>
                      Masa Berlaku S/D
                    </ResizableTh>
                    <ResizableTh width={rateCols.widths.source} onResize={(e) => rateCols.startResize('source', e)}>
                      Sumber Kurs Resmi
                    </ResizableTh>
                    <ResizableTh width={rateCols.widths.rates} onResize={(e) => rateCols.startResize('rates', e)} align="right">
                      Tarif (Beli / Middle / Jual)
                    </ResizableTh>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C0DDD6]/60 dark:divide-slate-800/80 text-xs">
                  {rateList.map((rate) => (
                    <tr
                      key={rate.rate_id}
                      className="hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                    >
                      <td className="px-3.5 py-3 font-mono font-bold text-[#1E4E46] dark:text-emerald-400">
                        <span className="px-2 py-0.5 rounded-lg bg-[#C0DDD6]/40 dark:bg-emerald-950 border border-[#98C3BC]">
                          {rate.currency_code}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 font-semibold text-slate-900 dark:text-white">
                        {rate.currency_code === 'SAR'
                          ? 'Saudi Riyal (Riyal Arab Saudi)'
                          : rate.currency_code === 'USD'
                          ? 'US Dollar (Dolar Amerika)'
                          : rate.currency_code === 'EUR'
                          ? 'Euro Eropa'
                          : 'Ringgit Malaysia'}
                      </td>
                      <td className="px-3.5 py-3 text-slate-700 dark:text-slate-300">
                        {rate.effective_date}
                      </td>
                      <td className="px-3.5 py-3">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                          {rate.valid_until || '2026-10-31'}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-slate-600 dark:text-slate-400">
                        <span className="font-medium text-slate-900 dark:text-slate-200">
                          {rate.source_rate || 'Bank Indonesia'}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono">
                        <div className="text-[11px] text-slate-500">
                          Beli: Rp {rate.buy_rate.toLocaleString()} • Jual: Rp {rate.sell_rate.toLocaleString()}
                        </div>
                        <div className="text-emerald-700 dark:text-emerald-400 font-bold text-xs mt-0.5">
                          Middle: Rp {rate.middle_rate.toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleCard>

          {/* Document Sequence Numbers */}
          <CollapsibleCard
            title="Penomoran Otomatis Dokumen ERP (document_sequences)"
            subtitle="Konfigurasi kode sequence faktur, kuitansi, manifest, dan SPK per unit cabang"
            icon={FileCheck}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sequences.map((seq) => (
                <div
                  key={seq.sequence_id}
                  className="p-3.5 rounded-xl bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Dokumen {seq.doc_type} (Cabang: {seq.owner_branch_id})
                    </span>
                    <span className="font-mono text-[#1E4E46] dark:text-cyan-400 font-bold bg-[#C0DDD6]/40 dark:bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-[#98C3BC]">
                      No Terakhir: {seq.last_number}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-[#C0DDD6]/60 dark:border-slate-800">
                    Pola Format: <span className="text-amber-700 dark:text-amber-300 font-bold">{seq.format_pattern}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Berikutnya:{' '}
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                      {seq.doc_type}/{seq.owner_branch_id}/{seq.current_year}/{String(seq.current_month).padStart(2, '0')}/{String(seq.last_number + 1).padStart(seq.padding_length, '0')}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </CollapsibleCard>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: VENDOR & MITRA ASURANSI SYARIAH */}
      {/* ========================================================================= */}
      {subTab === 'VENDORS' && (
        <div className="space-y-6">
          <CollapsibleCard
            title={`Master Vendor & Mitra Asuransi Syariah (${vendorList.length} Rekanan)`}
            subtitle="Pendaftaran vendor perhotelan Saudi, maskapai, katering, dan asuransi jiwa/perjalanan syariah resmi berizin OJK"
            icon={ShieldCheck}
            defaultOpen={true}
            headerRight={
              <button
                type="button"
                onClick={() => setShowAddVendorModal(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Entry Vendor / Asuransi Baru</span>
              </button>
            }
          >
            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-[#F4F8F7] dark:bg-slate-950 p-3 rounded-xl border border-[#C0DDD6] dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Kategori Vendor:
                </span>
                <select
                  value={vendorCatFilter}
                  onChange={(e) => setVendorCatFilter(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">Semua Kategori</option>
                  <option value="ASURANSI">ASURANSI (Mitra Asuransi Syariah)</option>
                  <option value="AIRLINE">AIRLINE (Maskapai Penerbangan)</option>
                  <option value="HOTEL_MAKKAH">HOTEL_MAKKAH</option>
                  <option value="HOTEL_MADINAH">HOTEL_MADINAH</option>
                  <option value="VISA_PROVIDER">VISA_PROVIDER</option>
                  <option value="BUS_TRANSPORT">BUS_TRANSPORT</option>
                  <option value="CATERING">CATERING</option>
                </select>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  placeholder="Cari nama atau kode vendor..."
                  className="w-full bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
                />
              </div>
            </div>

            {/* Resizable Table Vendor */}
            <div className="overflow-x-auto rounded-xl border border-[#C0DDD6] dark:border-slate-800">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-[#EBF5F3] dark:bg-slate-950 text-[#1E4E46] dark:text-slate-200 border-b border-[#C0DDD6] dark:border-slate-800">
                    <ResizableTh width={venCols.widths.code} onResize={(e) => venCols.startResize('code', e)}>
                      Kode Vendor
                    </ResizableTh>
                    <ResizableTh width={venCols.widths.name} onResize={(e) => venCols.startResize('name', e)}>
                      Nama Perusahaan Vendor
                    </ResizableTh>
                    <ResizableTh width={venCols.widths.cat} onResize={(e) => venCols.startResize('cat', e)}>
                      Kategori Layanan
                    </ResizableTh>
                    <ResizableTh width={venCols.widths.city} onResize={(e) => venCols.startResize('city', e)}>
                      Domisili Kota
                    </ResizableTh>
                    <ResizableTh width={venCols.widths.contact} onResize={(e) => venCols.startResize('contact', e)}>
                      PIC &amp; Kontak
                    </ResizableTh>
                    <ResizableTh width={venCols.widths.syariah} onResize={(e) => venCols.startResize('syariah', e)} align="center">
                      Standar Syariah
                    </ResizableTh>
                    <ResizableTh width={venCols.widths.actions} onResize={(e) => venCols.startResize('actions', e)} align="center">
                      Aksi
                    </ResizableTh>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C0DDD6]/60 dark:divide-slate-800/80 text-xs">
                  {vendorList
                    .filter((v) => {
                      const matchesSearch =
                        v.vendor_name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
                        v.vendor_code.toLowerCase().includes(vendorSearch.toLowerCase());
                      const matchesCat =
                        vendorCatFilter === 'ALL' ? true : v.category === vendorCatFilter;
                      return matchesSearch && matchesCat;
                    })
                    .map((ven) => (
                      <tr
                        key={ven.vendor_id}
                        onClick={() => setViewVendorDetail(ven)}
                        className="hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                      >
                        <td className="px-3.5 py-3 font-mono font-bold text-[#1E4E46] dark:text-emerald-400">
                          {ven.vendor_code}
                        </td>
                        <td className="px-3.5 py-3 font-semibold text-slate-900 dark:text-white">
                          {ven.vendor_name}
                        </td>
                        <td className="px-3.5 py-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              ven.category === 'ASURANSI'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-300'
                                : ven.category === 'AIRLINE'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300'
                            }`}
                          >
                            {ven.category}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-slate-700 dark:text-slate-300">
                          {ven.city_name || 'Jakarta'}
                        </td>
                        <td className="px-3.5 py-3 text-slate-600 dark:text-slate-400">
                          <div>{ven.contact_person}</div>
                          <div className="text-[10px] text-slate-500">{ven.phone}</div>
                        </td>
                        <td className="px-3.5 py-3 text-center">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Compliant</span>
                          </span>
                        </td>
                        <td
                          className="px-3.5 py-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setViewVendorDetail(ven)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-slate-800 dark:text-white flex items-center gap-1 mx-auto"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Detail</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CollapsibleCard>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: SETINGAN KOMISI AGEN (TIER & RELASI CRM)                        */}
      {/* ========================================================================= */}
      {subTab === 'COMMISSIONS' && (
        <div className="space-y-6">
          <CollapsibleCard
            title={`Master Setingan Komisi Agen & Mitra Afiliasi (${commissionTiers.length} Tier Aktif)`}
            subtitle="Konfigurasi komisi reguler per pax, komisi Ramadhan, target penjualan, dan bonus insentif terhubung langsung ke Pipeline CRM & Agent Wallet"
            icon={BadgePercent}
            defaultOpen={true}
            headerRight={
              <button
                type="button"
                onClick={() => setShowAddTierModal(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Tier Komisi Baru</span>
              </button>
            }
          >
            {/* Penjelasan Integrasi CRM & Wallet */}
            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 mb-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                <span className="font-bold text-sm block mb-0.5">Integrasi Otomatis CRM Pipeline &amp; Dompet Deposit Agen:</span>
                Setingan komisi yang dikonfigurasi di bawah ini terhubung langsung ke <strong>Formulir Prospek CRM Pipeline</strong>. Saat staf sales memilih Agen Perujuk dan Tier Komisi, sistem otomatis mengalikan jumlah pax dengan nominal komisi per pax. Saat booking lunas, komisi siap dicairkan ke saldo <strong>Agent Wallet</strong> melalui alur Maker-Approver-Releaser.
              </div>
            </div>

            {/* Table of Commission Tiers */}
            <div className="overflow-x-auto rounded-xl border border-[#C0DDD6] dark:border-slate-800">
              <table className="w-full text-left border-collapse min-w-[850px] text-xs">
                <thead className="bg-[#EBF5F3] dark:bg-slate-950 text-[#1E4E46] dark:text-slate-200 border-b border-[#C0DDD6] dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-3.5 font-bold font-mono">Kode Tier</th>
                    <th className="py-3 px-3.5 font-bold">Nama Peringkat Tier</th>
                    <th className="py-3 px-3.5 text-right font-bold">Komisi Reguler / Pax</th>
                    <th className="py-3 px-3.5 text-right font-bold">Komisi Ramadhan / Pax</th>
                    <th className="py-3 px-3 text-center font-bold">Target Min.</th>
                    <th className="py-3 px-3.5 text-right font-bold">Bonus Insentif</th>
                    <th className="py-3 px-3 text-center font-semibold">Cabang Berlaku</th>
                    <th className="py-3 px-3 text-center font-semibold">Status</th>
                    <th className="py-3 px-3 text-center font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C0DDD6]/60 dark:divide-slate-800">
                  {commissionTiers.map((tier) => (
                    <tr
                      key={tier.setting_id}
                      onClick={() => setViewTierDetail(tier)}
                      className="hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                    >
                      <td className="px-3.5 py-3 font-mono font-bold text-purple-700 dark:text-purple-400">
                        {tier.tier_code}
                      </td>
                      <td className="px-3.5 py-3 font-bold text-slate-900 dark:text-white">
                        {tier.tier_name}
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        Rp {tier.commission_per_pax_idr.toLocaleString('id-ID')}
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono font-bold text-amber-700 dark:text-amber-400">
                        Rp {tier.commission_ramadhan_pax_idr.toLocaleString('id-ID')}
                      </td>
                      <td className="px-3.5 py-3 text-center font-bold text-slate-800 dark:text-slate-200">
                        {tier.target_minimum_pax} Pax
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                        Rp {tier.bonus_achievement_idr.toLocaleString('id-ID')}
                      </td>
                      <td className="px-3.5 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#98C3BC]/40 dark:bg-slate-800 text-[#1E4E46] dark:text-white">
                          {tier.applicable_branch_type}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {tier.is_active ? 'Aktif' : 'Non-Aktif'}
                        </span>
                      </td>
                      <td
                        className="px-3.5 py-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setViewTierDetail(tier)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-slate-800 dark:text-white flex items-center gap-1 mx-auto"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleCard>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: FORM ENTRY PEGAWAI BARU */}
      {/* ========================================================================= */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#C0DDD6] dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Registrasi &amp; Entry Data Pegawai Baru
              </h3>
              <button
                type="button"
                onClick={() => setShowAddEmpModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    NIK Karyawan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={empNik}
                    onChange={(e) => setEmpNik(e.target.value)}
                    placeholder="Contoh: EMP-HQ-004"
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 font-mono uppercase font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Nama Lengkap Pegawai <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    placeholder="Contoh: Ust. Hamdan Rasyid, S.Ag."
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 font-medium"
                  />
                </div>
              </div>

              {/* Gender & Photo Selector with Modest Hijab Option for Women */}
              <GenderPhotoSelector
                label="Jenis Kelamin & Foto Profil Pegawai"
                gender={empGender}
                onGenderChange={(g) => setEmpGender(g)}
                photoUrl={empPhotoUrl}
                onPhotoChange={(u) => setEmpPhotoUrl(u)}
                personName={empName || 'Pegawai'}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Jabatan</label>
                  <input
                    type="text"
                    value={empJabatan}
                    onChange={(e) => setEmpJabatan(e.target.value)}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Unit Cabang</label>
                  <select
                    value={empBranch}
                    onChange={(e) => setEmpBranch(e.target.value)}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2"
                  >
                    <option value="C00">C00 - Pusat Jakarta</option>
                    <option value="C01">C01 - Cabang Kediri (KSO)</option>
                    <option value="C02">C02 - Sub-Cabang Blitar</option>
                    <option value="C03">C03 - Cabang Surabaya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Status Pegawai</label>
                  <select
                    value={empStatus}
                    onChange={(e) => setEmpStatus(e.target.value as any)}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2"
                  >
                    <option value="PUSAT">PUSAT</option>
                    <option value="MANDIRI">MANDIRI</option>
                    <option value="KSO">KSO</option>
                  </select>
                </div>
              </div>

              {/* Tanggal Masuk via PopupCalendar & Gaji */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <PopupCalendar
                    label="Tanggal Masuk Kerja"
                    required={true}
                    value={empTanggalMasuk}
                    onChange={(val) => setEmpTanggalMasuk(val)}
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Gaji Pokok (IDR)</label>
                  <input
                    type="number"
                    value={empGajiPokok}
                    onChange={(e) => setEmpGajiPokok(Number(e.target.value))}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tunjangan (IDR)</label>
                  <input
                    type="number"
                    value={empTunjangan}
                    onChange={(e) => setEmpTunjangan(Number(e.target.value))}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              {/* Domisili via RegionalLocationSelector */}
              <div className="p-3.5 rounded-xl border border-[#C0DDD6] dark:border-slate-800 bg-[#F4F8F7]/60 dark:bg-slate-950 space-y-2">
                <span className="font-bold text-[#1E4E46] dark:text-emerald-400 block text-xs">
                  Wilayah Domisili Pegawai (General Master):
                </span>
                <RegionalLocationSelector
                  generalMasters={generalMasters}
                  selectedIsland={empIsland}
                  onSelectIsland={(code) => setEmpIsland(code)}
                  selectedProvince={empProvince}
                  onSelectProvince={(code, name) => {
                    setEmpProvince(code);
                    setEmpProvinceName(name);
                  }}
                  selectedCity={empCity}
                  onSelectCity={(code, name) => {
                    setEmpCity(code);
                    setEmpCityName(name);
                  }}
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Alamat Domisili Jalan/RT/RW</label>
                <input
                  type="text"
                  value={empAddress1}
                  onChange={(e) => setEmpAddress1(e.target.value)}
                  placeholder="Jl. Merbabu No. 12"
                  className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#C0DDD6] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddEmpModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Pegawai Baru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FORM PENDAFTARAN KURS VALAS */}
      {/* ========================================================================= */}
      {showAddRateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#C0DDD6] dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Pendaftaran &amp; Pembaruan Kurs Valas
              </h3>
              <button
                type="button"
                onClick={() => setShowAddRateModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Mata Uang Valas</label>
                <select
                  value={newCurrency}
                  onChange={(e) => setNewCurrency(e.target.value as any)}
                  className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 font-bold"
                >
                  <option value="SAR">SAR - Saudi Riyal</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="MYR">MYR - Ringgit Malaysia</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kurs Beli (IDR)</label>
                  <input
                    type="number"
                    required
                    value={newBuyRate}
                    onChange={(e) => setNewBuyRate(Number(e.target.value))}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kurs Middle (IDR)</label>
                  <input
                    type="number"
                    required
                    value={newMiddleRate}
                    onChange={(e) => setNewMiddleRate(Number(e.target.value))}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kurs Jual (IDR)</label>
                  <input
                    type="number"
                    required
                    value={newSellRate}
                    onChange={(e) => setNewSellRate(Number(e.target.value))}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PopupCalendar
                  label="Masa Berlaku Dari"
                  required={true}
                  value={newEffectiveDate}
                  onChange={(val) => setNewEffectiveDate(val)}
                />
                <PopupCalendar
                  label="Masa Berlaku Sampai"
                  required={true}
                  value={newValidUntil}
                  onChange={(val) => setNewValidUntil(val)}
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Sumber Kurs Resmi (Market Source)
                </label>
                <input
                  type="text"
                  required
                  value={newSourceRate}
                  onChange={(e) => setNewSourceRate(e.target.value)}
                  placeholder="Contoh: Bank Indonesia (JISDOR), Al Rajhi Bank Saudi, Reuters Spot"
                  className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#C0DDD6] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddRateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Tarif Kurs</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: FORM ENTRY VENDOR & MITRA ASURANSI */}
      {/* ========================================================================= */}
      {showAddVendorModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#C0DDD6] dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Registrasi Vendor &amp; Mitra Asuransi Syariah
              </h3>
              <button
                type="button"
                onClick={() => setShowAddVendorModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVendor} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Kode Vendor <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={venCode}
                    onChange={(e) => setVenCode(e.target.value)}
                    placeholder="Contoh: VEN-ASR-02"
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 font-mono uppercase font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Nama Perusahaan Vendor / Asuransi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={venName}
                    onChange={(e) => setVenName(e.target.value)}
                    placeholder="Contoh: PT Asuransi Takaful Keluarga Syariah"
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kategori Layanan</label>
                  <select
                    value={venCategory}
                    onChange={(e) => setVenCategory(e.target.value as any)}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 font-bold"
                  >
                    <option value="ASURANSI">ASURANSI (Mitra Asuransi Syariah)</option>
                    <option value="AIRLINE">AIRLINE (Maskapai Penerbangan)</option>
                    <option value="HOTEL_MAKKAH">HOTEL_MAKKAH</option>
                    <option value="HOTEL_MADINAH">HOTEL_MADINAH</option>
                    <option value="VISA_PROVIDER">VISA_PROVIDER</option>
                    <option value="BUS_TRANSPORT">BUS_TRANSPORT</option>
                    <option value="CATERING">CATERING</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">PIC &amp; Penanggung Jawab</label>
                  <input
                    type="text"
                    value={venContact}
                    onChange={(e) => setVenContact(e.target.value)}
                    placeholder="Contoh: Bpk. H. Rahmat Hidayat"
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              {venCategory === 'ASURANSI' && (
                <div className="p-3 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-purple-900 dark:text-purple-300 font-semibold mb-1">
                      Nomor Polis Kerjasama
                    </label>
                    <input
                      type="text"
                      value={venPolicyNo}
                      onChange={(e) => setVenPolicyNo(e.target.value)}
                      placeholder="POL-SYR-2026-9901"
                      className="w-full bg-white dark:bg-slate-950 border border-purple-300 dark:border-purple-800 rounded-xl px-3 py-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-900 dark:text-purple-300 font-semibold mb-1">
                      Izin OJK / Dewan Syariah Nasional
                    </label>
                    <input
                      type="text"
                      value={venOjkPermit}
                      onChange={(e) => setVenOjkPermit(e.target.value)}
                      placeholder="KEP-091/NB.2/2023"
                      className="w-full bg-white dark:bg-slate-950 border border-purple-300 dark:border-purple-800 rounded-xl px-3 py-2 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Regional Filter Selector */}
              <div className="p-3.5 rounded-xl border border-[#C0DDD6] dark:border-slate-800 bg-[#F4F8F7]/60 dark:bg-slate-950 space-y-2">
                <span className="font-bold text-[#1E4E46] dark:text-emerald-400 block text-xs">
                  Domisili Kantor Rekanan (General Master):
                </span>
                <RegionalLocationSelector
                  generalMasters={generalMasters}
                  selectedIsland={venIsland}
                  onSelectIsland={(code) => setVenIsland(code)}
                  selectedProvince={venProvince}
                  onSelectProvince={(code, name) => {
                    setVenProvince(code);
                    setVenProvinceName(name);
                  }}
                  selectedCity={venCity}
                  onSelectCity={(code, name) => {
                    setVenCity(code);
                    setVenCityName(name);
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nomor Telepon</label>
                  <input
                    type="text"
                    value={venPhone}
                    onChange={(e) => setVenPhone(e.target.value)}
                    placeholder="+62 21 829910"
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Alamat Email</label>
                  <input
                    type="email"
                    value={venEmail}
                    onChange={(e) => setVenEmail(e.target.value)}
                    placeholder="partner@asuransi.co.id"
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Alamat Kantor Lengkap</label>
                <input
                  type="text"
                  value={venAddress}
                  onChange={(e) => setVenAddress(e.target.value)}
                  placeholder="Gedung Takaful Lt. 8, Jl. M.T. Haryono"
                  className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#C0DDD6] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddVendorModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Vendor / Mitra</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: VIEW DETAIL PEGAWAI */}
      {/* ========================================================================= */}
      {viewEmpDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#C0DDD6] dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Detail Profil Pegawai: {viewEmpDetail.user_name}
              </h3>
              <button
                type="button"
                onClick={() => setViewEmpDetail(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#F4F8F7] dark:bg-slate-950">
                <div>
                  <span className="text-slate-400 block text-[11px]">NIK Karyawan</span>
                  <strong className="font-mono text-slate-900 dark:text-white">{viewEmpDetail.nik_karyawan}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Jabatan</span>
                  <strong className="text-slate-900 dark:text-white">{viewEmpDetail.jabatan}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Cabang Penempatan</span>
                  <span className="font-mono font-bold text-emerald-600">{viewEmpDetail.branch_id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Tanggal Masuk</span>
                  <span>{viewEmpDetail.tanggal_masuk}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl border border-[#C0DDD6] dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">Domisili &amp; Alamat:</span>
                <p className="text-slate-600 dark:text-slate-400">
                  {viewEmpDetail.address_1 || 'Alamat kantor cabang resmi'}, {viewEmpDetail.city_name || 'Kediri'}, {viewEmpDetail.province_name || 'Jawa Timur'}
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewEmpDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#98C3BC] text-[#13302B] dark:bg-slate-800 dark:text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: VIEW DETAIL VENDOR / ASURANSI */}
      {/* ========================================================================= */}
      {viewVendorDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#C0DDD6] dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Detail Vendor: {viewVendorDetail.vendor_name}
              </h3>
              <button
                type="button"
                onClick={() => setViewVendorDetail(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#F4F8F7] dark:bg-slate-950">
                <div>
                  <span className="text-slate-400 block text-[11px]">Kode Vendor</span>
                  <strong className="font-mono text-slate-900 dark:text-white">{viewVendorDetail.vendor_code}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Kategori</span>
                  <span className="font-bold text-purple-600">{viewVendorDetail.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">PIC Penanggung Jawab</span>
                  <strong>{viewVendorDetail.contact_person}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Kontak Telepon</span>
                  <span className="font-mono">{viewVendorDetail.phone}</span>
                </div>
              </div>

              {viewVendorDetail.category === 'ASURANSI' && (
                <div className="p-3 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 space-y-1">
                  <span className="font-bold text-purple-900 dark:text-purple-300 block text-xs">Informasi Polis Syariah &amp; OJK:</span>
                  <div className="text-[11px] text-slate-700 dark:text-slate-300">
                    No Polis: <strong className="font-mono">{viewVendorDetail.policy_number || 'POL-SYR-2026-8819'}</strong>
                  </div>
                  <div className="text-[11px] text-slate-700 dark:text-slate-300">
                    Izin Regulator: <span className="font-medium">{viewVendorDetail.ojk_permit_number || 'OJK & DSN MUI'}</span>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl border border-[#C0DDD6] dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">Alamat Kantor:</span>
                <p className="text-slate-600 dark:text-slate-400">
                  {viewVendorDetail.address}, {viewVendorDetail.city_name || 'Jakarta'}, {viewVendorDetail.province_name || 'DKI Jakarta'}
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewVendorDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#98C3BC] text-[#13302B] dark:bg-slate-800 dark:text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: FORM TAMBAH TIER KOMISI AGEN BARU */}
      {/* ========================================================================= */}
      {showAddTierModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#C0DDD6] dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <BadgePercent className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Tambah Peringkat &amp; Setingan Komisi Agen
              </h3>
              <button onClick={() => setShowAddTierModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newT: AgentCommissionSetting = {
                  setting_id: `comm-tier-${Date.now()}`,
                  tier_code: newTierCode.trim().toUpperCase(),
                  tier_name: newTierName.trim(),
                  commission_per_pax_idr: Number(newCommissionReguler),
                  commission_ramadhan_pax_idr: Number(newCommissionRamadhan),
                  target_minimum_pax: Number(newTargetPax),
                  bonus_achievement_idr: Number(newBonusAchievement),
                  applicable_branch_type: newApplicableBranch,
                  is_active: true,
                  notes: newTierNotes,
                };
                setCommissionTiers([...commissionTiers, newT]);
                setShowAddTierModal(false);
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">
                    Kode Tier <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: TIER_VIP"
                    value={newTierCode}
                    onChange={(e) => setNewTierCode(e.target.value)}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">
                    Nama Peringkat / Mitra <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Mitra Prioritas Gold"
                    value={newTierName}
                    onChange={(e) => setNewTierName(e.target.value)}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">
                    Komisi Reguler / Pax (Rp)
                  </label>
                  <input
                    type="number"
                    value={newCommissionReguler}
                    onChange={(e) => setNewCommissionReguler(Number(e.target.value))}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">
                    Komisi Ramadhan / Pax (Rp)
                  </label>
                  <input
                    type="number"
                    value={newCommissionRamadhan}
                    onChange={(e) => setNewCommissionRamadhan(Number(e.target.value))}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold text-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">
                    Target Min. Jamaah (Pax)
                  </label>
                  <input
                    type="number"
                    value={newTargetPax}
                    onChange={(e) => setNewTargetPax(Number(e.target.value))}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">
                    Bonus Insentif Target (Rp)
                  </label>
                  <input
                    type="number"
                    value={newBonusAchievement}
                    onChange={(e) => setNewBonusAchievement(Number(e.target.value))}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">
                  Berlaku Untuk Cabang
                </label>
                <select
                  value={newApplicableBranch}
                  onChange={(e) => setNewApplicableBranch(e.target.value as any)}
                  className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="ALL">Semua Cabang (Pusat &amp; Mitra Daerah)</option>
                  <option value="HQ">Khusus HQ Pusat Jakarta</option>
                  <option value="MANDIRI">Khusus Cabang Mandiri</option>
                  <option value="KSO">Khusus Cabang KSO</option>
                  <option value="SUB_KSO">Khusus Sub-KSO</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">
                  Catatan Kualifikasi Tier
                </label>
                <textarea
                  rows={2}
                  value={newTierNotes}
                  onChange={(e) => setNewTierNotes(e.target.value)}
                  className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#C0DDD6] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTierModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Tier Komisi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: VIEW DETAIL TIER KOMISI AGEN */}
      {/* ========================================================================= */}
      {viewTierDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#C0DDD6] dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Detail Skema Tier: {viewTierDetail.tier_name}
              </h3>
              <button
                type="button"
                onClick={() => setViewTierDetail(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[11px]">Kode Tier</span>
                  <strong className="font-mono text-purple-700 dark:text-purple-400 text-sm">{viewTierDetail.tier_code}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Komisi Reguler / Pax</span>
                  <strong className="font-mono text-emerald-700 dark:text-emerald-400 text-sm">
                    Rp {viewTierDetail.commission_per_pax_idr.toLocaleString('id-ID')}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Komisi Musim Ramadhan</span>
                  <strong className="font-mono text-amber-700 dark:text-amber-400 text-sm">
                    Rp {viewTierDetail.commission_ramadhan_pax_idr.toLocaleString('id-ID')}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Target Minimum Pax</span>
                  <span className="font-bold text-slate-900 dark:text-white">{viewTierDetail.target_minimum_pax} Jamaah</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-[#C0DDD6] dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">Bonus Pencapaian &amp; Target:</span>
                <p className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  Rp {viewTierDetail.bonus_achievement_idr.toLocaleString('id-ID')} (Cair otomatis jika target kuota terpenuhi)
                </p>
                {viewTierDetail.notes && (
                  <p className="text-slate-600 dark:text-slate-400 italic text-[11px] pt-1">
                    "{viewTierDetail.notes}"
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewTierDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#98C3BC] text-[#13302B] dark:bg-slate-800 dark:text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
