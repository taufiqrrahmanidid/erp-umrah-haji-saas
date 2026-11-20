import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  Layers,
  MapPin,
  Eye,
  Edit2,
  Trash2,
  Save,
  X,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Phone,
  Mail,
  Home,
} from 'lucide-react';
import { GeneralMaster, RoleCode, ResolvedBranch } from '../../types/erp.ts';
import { mockResolvedBranches } from '../../data/mockData.ts';
import { CollapsibleCard } from '../common/CollapsibleCard.tsx';
import { RegionalLocationSelector } from '../common/RegionalLocationSelector.tsx';
import { ResizableTh, useResizableColumns } from '../common/ResizableTable.tsx';

interface BranchResolverTabProps {
  generalMasters: GeneralMaster[];
  currentRole: RoleCode;
}

export const BranchResolverTab: React.FC<BranchResolverTabProps> = ({
  generalMasters,
  currentRole,
}) => {
  const [branches, setBranches] = useState<ResolvedBranch[]>(mockResolvedBranches);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'ALL' | 'HQ' | 'MANDIRI' | 'KSO'>('ALL');
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);
  const [selectedIslandFilter, setSelectedIslandFilter] = useState('');
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState('');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewBranch, setViewBranch] = useState<ResolvedBranch | null>(null);
  const [editBranch, setEditBranch] = useState<ResolvedBranch | null>(null);
  const [deleteConfirmBranch, setDeleteConfirmBranch] = useState<ResolvedBranch | null>(null);

  // Form State for Adding / Editing Branch
  const [formBranch, setFormBranch] = useState<Partial<ResolvedBranch>>({
    branch_code: '',
    branch_name: '',
    branch_type: 'MANDIRI',
    parent_branch_code: 'C00',
    is_active: true,
    address_1: '',
    address_2: '',
    island_code: 'ISL30',
    province_code: 'PV35',
    province_name: 'JAWA TIMUR',
    city_code: '3571',
    city_name: 'KOTA KEDIRI',
    district: '',
    village: '',
    rt: '001',
    rw: '001',
    postal_code: '',
  });

  // Resizable table columns
  type BranchColKey =
    | 'code'
    | 'name'
    | 'type'
    | 'parent'
    | 'city'
    | 'province'
    | 'address'
    | 'status'
    | 'actions';

  const { widths, startResize } = useResizableColumns<BranchColKey>({
    code: 90,
    name: 240,
    type: 110,
    parent: 110,
    city: 150,
    province: 140,
    address: 230,
    status: 100,
    actions: 140,
  });

  // Access rights
  const canManage =
    currentRole === 'ADMIN_SAAS' || currentRole === 'ADMIN_HQ' || currentRole === 'OWNER_CLEVEL';

  const islands = generalMasters.filter((gm) => gm.head_code === 'ISLND' && gm.child_code !== '*');
  const provinces = generalMasters.filter((gm) => gm.head_code === 'PROP' && gm.child_code !== '*');

  // Filtered branches
  const filteredBranches = branches.filter((b) => {
    const matchesSearch =
      b.branch_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.city_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.address_1 || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActive = filterActiveOnly ? b.is_active : true;
    const matchesType = selectedTypeFilter === 'ALL' ? true : b.branch_type === selectedTypeFilter;
    const matchesIsland = selectedIslandFilter ? b.island_code === selectedIslandFilter : true;
    const matchesProvince = selectedProvinceFilter ? b.province_code === selectedProvinceFilter : true;
    return matchesSearch && matchesActive && matchesType && matchesIsland && matchesProvince;
  });

  const handleToggleActive = (code: string) => {
    if (!canManage) return;
    setBranches((prev) =>
      prev.map((b) => (b.branch_code === code ? { ...b, is_active: !b.is_active } : b))
    );
  };

  const handleOpenAddModal = () => {
    setFormBranch({
      branch_code: '',
      branch_name: '',
      branch_type: 'MANDIRI',
      parent_branch_code: 'C00',
      is_active: true,
      address_1: '',
      address_2: '',
      island_code: 'ISL30',
      province_code: 'PV35',
      province_name: 'JAWA TIMUR',
      city_code: '3571',
      city_name: 'KOTA KEDIRI',
      district: '',
      village: '',
      rt: '001',
      rw: '001',
      postal_code: '',
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (b: ResolvedBranch) => {
    setEditBranch(b);
    setFormBranch({ ...b });
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBranch.branch_code || !formBranch.branch_name) return;

    if (editBranch) {
      // Update existing
      setBranches((prev) =>
        prev.map((b) =>
          b.branch_code === editBranch.branch_code ? ({ ...b, ...formBranch } as ResolvedBranch) : b
        )
      );
      setEditBranch(null);
    } else {
      // Add new
      const newObj: ResolvedBranch = {
        tenant_id: '11111111-1111-1111-1111-111111111111',
        branch_code: formBranch.branch_code.trim().toUpperCase(),
        branch_name: formBranch.branch_name.trim(),
        is_active: formBranch.is_active ?? true,
        branch_type: formBranch.branch_type || 'MANDIRI',
        parent_branch_code: formBranch.branch_type === 'HQ' ? null : formBranch.parent_branch_code || 'C00',
        address_1: formBranch.address_1,
        address_2: formBranch.address_2,
        island_code: formBranch.island_code,
        province_code: formBranch.province_code,
        province_name: formBranch.province_name,
        city_code: formBranch.city_code,
        city_name: formBranch.city_name,
        district: formBranch.district,
        village: formBranch.village,
        rt: formBranch.rt,
        rw: formBranch.rw,
        postal_code: formBranch.postal_code,
      };
      setBranches([newObj, ...branches]);
      setShowAddModal(false);
    }
  };

  const handleDeleteBranch = (code: string) => {
    if (!canManage) return;
    setBranches((prev) => prev.filter((b) => b.branch_code !== code));
    setDeleteConfirmBranch(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card (Collapsible) */}
      <CollapsibleCard
        title="Manajemen Unit Kantor Cabang & Entitas Bisnis"
        subtitle="Pengawasan menyeluruh struktur Kantor Pusat (HQ), Cabang Mandiri, Cabang KSO, dan Sub-KSO"
        icon={Building2}
        defaultOpen={true}
        headerRight={
          canManage && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Cabang Baru</span>
            </button>
          )
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-[#C0DDD6] dark:border-slate-800 bg-[#F4F8F7]/50 dark:bg-slate-950">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Kantor Unit</span>
            <p className="text-2xl font-extrabold text-[#1E4E46] dark:text-emerald-400 mt-1">{branches.length}</p>
            <span className="text-[10px] text-slate-500">Seluruh terdaftar di sistem</span>
          </div>
          <div className="p-4 rounded-xl border border-[#C0DDD6] dark:border-slate-800 bg-[#F4F8F7]/50 dark:bg-slate-950">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Kantor Pusat (HQ)</span>
            <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
              {branches.filter((b) => b.branch_type === 'HQ').length}
            </p>
            <span className="text-[10px] text-slate-500">Pusat konsolidasi finansial</span>
          </div>
          <div className="p-4 rounded-xl border border-[#C0DDD6] dark:border-slate-800 bg-[#F4F8F7]/50 dark:bg-slate-950">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Cabang Mandiri</span>
            <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
              {branches.filter((b) => b.branch_type === 'MANDIRI').length}
            </p>
            <span className="text-[10px] text-slate-500">Otonom penuh biro</span>
          </div>
          <div className="p-4 rounded-xl border border-[#C0DDD6] dark:border-slate-800 bg-[#F4F8F7]/50 dark:bg-slate-950">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Cabang KSO &amp; Sub-KSO</span>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              {branches.filter((b) => b.branch_type === 'KSO').length}
            </p>
            <span className="text-[10px] text-slate-500">Kerja sama operasional mitra</span>
          </div>
        </div>
      </CollapsibleCard>

      {/* Main Table Card (Collapsible) */}
      <CollapsibleCard
        title="Daftar Cabang & Entitas Bisnis Terpadu"
        subtitle="Daftar tabel dinamis dengan kolom yang dapat diperlebar/diperkecil, view detail, edit & delete"
        icon={FileSpreadsheet}
        defaultOpen={true}
      >
        {/* Filter and Search Bar with Regional Cascading */}
        <div className="space-y-3 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F4F8F7] dark:bg-slate-950 p-3 rounded-xl border border-[#C0DDD6] dark:border-slate-800">
            {/* Type Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Tipe Cabang:
              </span>
              {(['ALL', 'HQ', 'MANDIRI', 'KSO'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    selectedTypeFilter === type
                      ? 'bg-[#98C3BC] text-[#13302B] dark:bg-emerald-600 dark:text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-[#C0DDD6] dark:border-slate-800'
                  }`}
                >
                  {type === 'ALL' ? 'Semua Tipe' : type}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setFilterActiveOnly(!filterActiveOnly)}
                className={`px-3 py-1.5 rounded-xl font-semibold border transition-all ${
                  filterActiveOnly
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-[#C0DDD6] dark:border-slate-800'
                }`}
              >
                {filterActiveOnly ? 'Hanya Cabang Aktif' : 'Semua Status'}
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari kode, nama, kota, alamat..."
                className="w-full bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
              />
            </div>
          </div>

          {/* Regional Filter Bar (Pulau & Provinsi) */}
          <div className="flex flex-wrap items-center gap-3 text-xs bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-[#C0DDD6] dark:border-slate-800">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Filter Wilayah:
            </span>

            {/* Filter Pulau */}
            <select
              value={selectedIslandFilter}
              onChange={(e) => {
                setSelectedIslandFilter(e.target.value);
                setSelectedProvinceFilter('');
              }}
              className="bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="">Semua Pulau</option>
              {islands.map((isl) => (
                <option key={isl.child_code} value={isl.child_code}>
                  {isl.description}
                </option>
              ))}
            </select>

            {/* Filter Provinsi */}
            <select
              value={selectedProvinceFilter}
              onChange={(e) => setSelectedProvinceFilter(e.target.value)}
              className="bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="">Semua Provinsi</option>
              {provinces
                .filter((p) => (!selectedIslandFilter ? true : p.cd1 === selectedIslandFilter))
                .map((pr) => (
                  <option key={pr.child_code} value={pr.child_code}>
                    {pr.description}
                  </option>
                ))}
            </select>

            {(selectedIslandFilter || selectedProvinceFilter || searchTerm || selectedTypeFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedIslandFilter('');
                  setSelectedProvinceFilter('');
                  setSearchTerm('');
                  setSelectedTypeFilter('ALL');
                  setFilterActiveOnly(false);
                }}
                className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-semibold ml-auto"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Resizable Table Container */}
        <div className="overflow-x-auto rounded-xl border border-[#C0DDD6] dark:border-slate-800">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#EBF5F3] dark:bg-slate-950 text-[#1E4E46] dark:text-slate-200 border-b border-[#C0DDD6] dark:border-slate-800">
                <ResizableTh width={widths.code} onResize={(e) => startResize('code', e)}>
                  Kode
                </ResizableTh>
                <ResizableTh width={widths.name} onResize={(e) => startResize('name', e)}>
                  Nama Unit Cabang
                </ResizableTh>
                <ResizableTh width={widths.type} onResize={(e) => startResize('type', e)}>
                  Tipe Cabang
                </ResizableTh>
                <ResizableTh width={widths.parent} onResize={(e) => startResize('parent', e)}>
                  Induk KSO
                </ResizableTh>
                <ResizableTh width={widths.city} onResize={(e) => startResize('city', e)}>
                  Kota / Kab
                </ResizableTh>
                <ResizableTh width={widths.province} onResize={(e) => startResize('province', e)}>
                  Provinsi
                </ResizableTh>
                <ResizableTh width={widths.address} onResize={(e) => startResize('address', e)}>
                  Alamat 1 &amp; 2
                </ResizableTh>
                <ResizableTh width={widths.status} onResize={(e) => startResize('status', e)} align="center">
                  Status
                </ResizableTh>
                <ResizableTh width={widths.actions} onResize={(e) => startResize('actions', e)} align="center">
                  Aksi
                </ResizableTh>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C0DDD6]/60 dark:divide-slate-800/80 text-xs">
              {filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Tidak ada cabang yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredBranches.map((branch) => {
                  const isHq = branch.branch_type === 'HQ';
                  const isKso = branch.branch_type === 'KSO';

                  return (
                    <tr
                      key={branch.branch_code}
                      onClick={() => setViewBranch(branch)}
                      className="hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                    >
                      {/* Kode */}
                      <td className="px-3.5 py-3 font-mono font-bold text-[#1E4E46] dark:text-emerald-400">
                        {branch.branch_code}
                      </td>

                      {/* Nama Cabang */}
                      <td className="px-3.5 py-3 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 shrink-0" />
                          <span className="truncate">{branch.branch_name}</span>
                        </div>
                      </td>

                      {/* Tipe Cabang */}
                      <td className="px-3.5 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isHq
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                              : isKso
                              ? 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-300 dark:border-sky-500/30'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30'
                          }`}
                        >
                          {branch.branch_type}
                        </span>
                      </td>

                      {/* Induk */}
                      <td className="px-3.5 py-3 font-mono text-slate-500 dark:text-slate-400">
                        {branch.parent_branch_code ? (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                            {branch.parent_branch_code}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Pusat</span>
                        )}
                      </td>

                      {/* Kota */}
                      <td className="px-3.5 py-3 text-slate-700 dark:text-slate-300 font-medium">
                        {branch.city_name || '-'}
                      </td>

                      {/* Provinsi */}
                      <td className="px-3.5 py-3 text-slate-600 dark:text-slate-400">
                        {branch.province_name || '-'}
                      </td>

                      {/* Alamat */}
                      <td className="px-3.5 py-3 text-slate-600 dark:text-slate-400">
                        <div className="truncate max-w-[220px]" title={`${branch.address_1 || ''} ${branch.address_2 || ''}`}>
                          {branch.address_1 || '-'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3.5 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            branch.is_active
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                          }`}
                        >
                          {branch.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td
                        className="px-3.5 py-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewBranch(branch)}
                            className="p-1 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                            title="Lihat Detail Lengkap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {canManage && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(branch)}
                                className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                title="Edit Cabang"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmBranch(branch)}
                                className="p-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                title="Hapus Cabang"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CollapsibleCard>

      {/* Modal: View Detail Cabang */}
      {viewBranch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#C0DDD6] dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#C0DDD6]/40 dark:bg-emerald-950 text-[#1E4E46] dark:text-emerald-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Detail Unit Cabang {viewBranch.branch_code}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Informasi profil alamat &amp; hierarki operasional
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewBranch(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[11px]">Nama Cabang</span>
                  <strong className="text-slate-900 dark:text-white text-sm">{viewBranch.branch_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Tipe Cabang</span>
                  <strong className="text-slate-900 dark:text-white">{viewBranch.branch_type}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Induk Konsolidasi</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {viewBranch.parent_branch_code || 'Head Quarter (Pusat)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Status Operasional</span>
                  <span className={viewBranch.is_active ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                    {viewBranch.is_active ? 'Aktif Beroperasi' : 'Nonaktif'}
                  </span>
                </div>
              </div>

              {/* Detail Alamat Lengkap */}
              <div className="border border-[#C0DDD6] dark:border-slate-800 rounded-xl p-4 space-y-2.5">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Alamat Lengkap Kantor
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400 text-[11px]">Alamat 1:</span>
                    <p className="font-semibold">{viewBranch.address_1 || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Alamat 2 (Gedung/Kavling):</span>
                    <p className="font-semibold">{viewBranch.address_2 || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Pulau:</span>
                    <p className="font-semibold">{viewBranch.island_code || 'ISL30 (JAWA)'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Provinsi:</span>
                    <p className="font-semibold">{viewBranch.province_name || viewBranch.province_code || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Kota / Kabupaten:</span>
                    <p className="font-semibold">{viewBranch.city_name || viewBranch.city_code || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Kecamatan:</span>
                    <p className="font-semibold">{viewBranch.district || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Desa / Kelurahan:</span>
                    <p className="font-semibold">{viewBranch.village || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">RT / RW &amp; Kode Pos:</span>
                    <p className="font-semibold">
                      RT {viewBranch.rt || '-'} / RW {viewBranch.rw || '-'} • Kode Pos: {viewBranch.postal_code || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewBranch(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#98C3BC] text-[#13302B] dark:bg-slate-800 dark:text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tambah / Edit Cabang */}
      {(showAddModal || editBranch) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#C0DDD6] dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {editBranch ? `Edit Data Cabang ${editBranch.branch_code}` : 'Registrasi Unit Cabang Baru'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditBranch(null);
                }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Kode Cabang (Unik) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editBranch}
                    value={formBranch.branch_code || ''}
                    onChange={(e) => setFormBranch({ ...formBranch, branch_code: e.target.value })}
                    placeholder="Contoh: C04, C05"
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Nama Unit Cabang <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formBranch.branch_name || ''}
                    onChange={(e) => setFormBranch({ ...formBranch, branch_name: e.target.value })}
                    placeholder="Contoh: Cabang Malang (Mandiri)"
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tipe Unit</label>
                  <select
                    value={formBranch.branch_type || 'MANDIRI'}
                    onChange={(e) =>
                      setFormBranch({
                        ...formBranch,
                        branch_type: e.target.value as 'HQ' | 'MANDIRI' | 'KSO',
                      })
                    }
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
                  >
                    <option value="MANDIRI">MANDIRI (Otonom Penuh)</option>
                    <option value="KSO">KSO (Kerja Sama Operasional)</option>
                    <option value="HQ">HQ (Kantor Pusat)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Induk Konsolidasi (Parent Branch)
                  </label>
                  <select
                    value={formBranch.parent_branch_code || 'C00'}
                    onChange={(e) => setFormBranch({ ...formBranch, parent_branch_code: e.target.value })}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
                  >
                    <option value="C00">C00 - Head Quarter (Pusat)</option>
                    {branches
                      .filter((b) => b.branch_code !== formBranch.branch_code && b.branch_code !== 'C00')
                      .map((b) => (
                        <option key={b.branch_code} value={b.branch_code}>
                          {b.branch_code} - {b.branch_name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Regional Cascading Location Filter (Pulau, Provinsi, Kota) */}
              <div className="border border-[#C0DDD6] dark:border-slate-800 rounded-xl p-3.5 space-y-3 bg-[#F4F8F7]/50 dark:bg-slate-950">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  Wilayah Domisili (Data Master General):
                </span>
                <RegionalLocationSelector
                  generalMasters={generalMasters}
                  selectedIsland={formBranch.island_code || ''}
                  onSelectIsland={(code) => setFormBranch((prev) => ({ ...prev, island_code: code }))}
                  selectedProvince={formBranch.province_code || ''}
                  onSelectProvince={(code, name) =>
                    setFormBranch((prev) => ({ ...prev, province_code: code, province_name: name }))
                  }
                  selectedCity={formBranch.city_code || ''}
                  onSelectCity={(code, name) =>
                    setFormBranch((prev) => ({ ...prev, city_code: code, city_name: name }))
                  }
                />
              </div>

              {/* Detail Alamat Spesifik (Alamat 1, Alamat 2, Kecamatan, Desa, RT, RW, Kode Pos) */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Alamat 1 (Nama Jalan / Nomor)
                    </label>
                    <input
                      type="text"
                      value={formBranch.address_1 || ''}
                      onChange={(e) => setFormBranch({ ...formBranch, address_1: e.target.value })}
                      placeholder="Jl. Pahlawan No. 10"
                      className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Alamat 2 (Gedung / Ruko / Lantai)
                    </label>
                    <input
                      type="text"
                      value={formBranch.address_2 || ''}
                      onChange={(e) => setFormBranch({ ...formBranch, address_2: e.target.value })}
                      placeholder="Ruko Sentra Niaga Blok B-2"
                      className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kecamatan</label>
                    <input
                      type="text"
                      value={formBranch.district || ''}
                      onChange={(e) => setFormBranch({ ...formBranch, district: e.target.value })}
                      placeholder="Kecamatan"
                      className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Desa / Kelurahan</label>
                    <input
                      type="text"
                      value={formBranch.village || ''}
                      onChange={(e) => setFormBranch({ ...formBranch, village: e.target.value })}
                      placeholder="Desa"
                      className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">RT / RW</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={formBranch.rt || ''}
                        onChange={(e) => setFormBranch({ ...formBranch, rt: e.target.value })}
                        placeholder="RT"
                        className="w-1/2 bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-2 py-2 text-xs font-medium text-slate-900 dark:text-white text-center"
                      />
                      <span>/</span>
                      <input
                        type="text"
                        value={formBranch.rw || ''}
                        onChange={(e) => setFormBranch({ ...formBranch, rw: e.target.value })}
                        placeholder="RW"
                        className="w-1/2 bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-2 py-2 text-xs font-medium text-slate-900 dark:text-white text-center"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kode Pos</label>
                    <input
                      type="text"
                      value={formBranch.postal_code || ''}
                      onChange={(e) => setFormBranch({ ...formBranch, postal_code: e.target.value })}
                      placeholder="65123"
                      className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#C0DDD6] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditBranch(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{editBranch ? 'Perbarui Cabang' : 'Simpan Cabang Baru'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete */}
      {deleteConfirmBranch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Konfirmasi Hapus Cabang
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus unit cabang{' '}
              <strong className="text-rose-600 font-bold">
                {deleteConfirmBranch.branch_code} - {deleteConfirmBranch.branch_name}
              </strong>
              ? Data transaksi historis tetap terlindungi.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmBranch(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteBranch(deleteConfirmBranch.branch_code)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white"
              >
                Ya, Hapus Cabang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
