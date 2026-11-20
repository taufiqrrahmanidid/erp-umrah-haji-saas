import React, { useState, useMemo } from 'react';
import {
  ListFilter,
  Plus,
  Search,
  Save,
  RotateCcw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Database,
  Tag,
  CheckCircle2,
  Lock,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { GeneralMaster, RoleCode } from '../../../types/erp.ts';

interface MasterDataSplitScreenProps {
  generalMasters: GeneralMaster[];
  onSaveMaster: (item: GeneralMaster) => void;
  onDeleteMaster: (id: string) => void;
  currentRole: RoleCode;
}

export const MasterDataSplitScreen: React.FC<MasterDataSplitScreenProps> = ({
  generalMasters,
  onSaveMaster,
  onDeleteMaster,
  currentRole,
}) => {
  // Extract distinct headers (head_code)
  const distinctHeaders = useMemo(() => {
    const map = new Map<string, { head_code: string; title: string; count: number }>();

    generalMasters.forEach((gm) => {
      if (!map.has(gm.head_code)) {
        // Look for header title in child_code = '*'
        const headerRow = generalMasters.find(
          (r) => r.head_code === gm.head_code && r.child_code === '*'
        );
        map.set(gm.head_code, {
          head_code: gm.head_code,
          title: headerRow ? headerRow.description : `Master Kategori ${gm.head_code}`,
          count: 0,
        });
      }
      if (gm.child_code !== '*') {
        map.get(gm.head_code)!.count += 1;
      }
    });

    return Array.from(map.values());
  }, [generalMasters]);

  // Selected active header on Left
  const [selectedHeadCode, setSelectedHeadCode] = useState<string>(
    distinctHeaders[0]?.head_code || 'BRN01'
  );
  const [searchHeader, setSearchHeader] = useState('');
  const [searchChild, setSearchChild] = useState('');

  // Sisi Kanan Atas Form State (Add / Edit)
  const [editMode, setEditMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    child_code: '',
    description: '',
    cd1: '',
    cd2: '',
    cd3: '',
    cd4: '',
  });

  // Pagination for Right-Bottom List - Default 20 rows & customizable
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // New Header Modal State
  const [isNewHeaderModalOpen, setIsNewHeaderModalOpen] = useState(false);
  const [newHeaderCode, setNewHeaderCode] = useState('');
  const [newHeaderTitle, setNewHeaderTitle] = useState('');

  // Status notice
  const [notification, setNotification] = useState<string | null>(null);

  const isLocked = currentRole !== 'ADMIN_HQ' && currentRole !== 'ADMIN_SAAS' && currentRole !== 'OWNER_CLEVEL';

  // Filter headers by search
  const filteredHeaders = distinctHeaders.filter(
    (h) =>
      h.head_code.toLowerCase().includes(searchHeader.toLowerCase()) ||
      h.title.toLowerCase().includes(searchHeader.toLowerCase())
  );

  // Active child items for selected head_code (excluding '*')
  const activeChildItems = useMemo(() => {
    return generalMasters.filter(
      (gm) => gm.head_code === selectedHeadCode && gm.child_code !== '*'
    );
  }, [generalMasters, selectedHeadCode]);

  // Filtered child items by search
  const filteredChildItems = useMemo(() => {
    if (!searchChild.trim()) return activeChildItems;
    const q = searchChild.toLowerCase();
    return activeChildItems.filter(
      (c) =>
        c.child_code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.cd1 && c.cd1.toLowerCase().includes(q)) ||
        (c.cd2 && c.cd2.toLowerCase().includes(q)) ||
        (c.cd3 && c.cd3.toLowerCase().includes(q)) ||
        (c.cd4 && c.cd4.toLowerCase().includes(q))
    );
  }, [activeChildItems, searchChild]);

  // Paginated child items
  const paginatedChildren = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredChildItems.slice(startIndex, startIndex + pageSize);
  }, [filteredChildItems, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredChildItems.length / pageSize) || 1;

  // Handle Select Header on Left
  const handleSelectHeader = (headCode: string) => {
    setSelectedHeadCode(headCode);
    setCurrentPage(1);
    setSearchChild('');
    handleResetForm();
  };

  // Click row in Right-Bottom to Edit
  const handleSelectChildForEdit = (child: GeneralMaster) => {
    setEditMode('EDIT');
    setEditingId(child.id);
    setFormData({
      child_code: child.child_code,
      description: child.description,
      cd1: child.cd1 || '',
      cd2: child.cd2 || '',
      cd3: child.cd3 || '',
      cd4: child.cd4 || '',
    });
  };

  // Reset form
  const handleResetForm = () => {
    setEditMode('ADD');
    setEditingId(null);
    setFormData({
      child_code: '',
      description: '',
      cd1: '',
      cd2: '',
      cd3: '',
      cd4: '',
    });
  };

  // Save child
  const handleSubmitChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      setNotification('Tabel general_masters dikunci (Read-Only) untuk Cabang! Hanya Admin Pusat atau C-Level yang dapat menambah/mengubah data.');
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    const payload: GeneralMaster = {
      id: editingId || `gm-${Date.now()}`,
      tenant_id: '11111111-1111-1111-1111-111111111111',
      head_code: selectedHeadCode,
      child_code: formData.child_code.trim().toUpperCase(),
      description: formData.description.trim(),
      cd1: formData.cd1 ? formData.cd1.trim() : null,
      cd2: formData.cd2 ? formData.cd2.trim() : null,
      cd3: formData.cd3 ? formData.cd3.trim() : null,
      cd4: formData.cd4 ? formData.cd4.trim() : null,
    };

    onSaveMaster(payload);
    handleResetForm();
    setNotification(
      editMode === 'ADD'
        ? `Berhasil menambahkan child code [${payload.child_code}] ke kategori [${selectedHeadCode}].`
        : `Berhasil memperbarui data child code [${payload.child_code}].`
    );
    setTimeout(() => setNotification(null), 3000);
  };

  // Delete child
  const handleDeleteCurrent = () => {
    if (!editingId) return;
    if (isLocked) {
      setNotification('Tabel general_masters dikunci untuk Cabang!');
      setTimeout(() => setNotification(null), 4000);
      return;
    }
    onDeleteMaster(editingId);
    handleResetForm();
    setNotification(`Baris master data berhasil dihapus.`);
    setTimeout(() => setNotification(null), 3000);
  };

  // Create new header category
  const handleCreateHeader = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      setNotification('Hanya Admin Pusat yang dapat membuat header master baru.');
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    const head = newHeaderCode.trim().toUpperCase();
    const title = newHeaderTitle.trim();

    const headerItem: GeneralMaster = {
      id: `gm-head-${Date.now()}`,
      tenant_id: '11111111-1111-1111-1111-111111111111',
      head_code: head,
      child_code: '*', // Header identifier
      description: title,
      cd1: null,
      cd2: null,
      cd3: null,
      cd4: null,
    };

    onSaveMaster(headerItem);
    setSelectedHeadCode(head);
    setIsNewHeaderModalOpen(false);
    setNewHeaderCode('');
    setNewHeaderTitle('');
    setNotification(`Header baru [${head}] - ${title} berhasil dibuat!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const selectedHeaderMeta = distinctHeaders.find((h) => h.head_code === selectedHeadCode);

  return (
    <div className="space-y-6 text-sm">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">
                Form Master Data Universal (Split-Screen Master-Detail)
              </h3>
              <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Pengelolaan tabel universal <code className="text-cyan-400 font-mono font-bold">general_masters</code>.
                Sisi Kiri menampilkan List Header (<code className="font-mono text-cyan-300">head_code</code>), Sisi Kanan Atas
                form input detail (<code className="font-mono text-cyan-300">child_code</code>), dan Sisi Kanan Bawah Daftar Child
                memanjang hingga bawah layar dengan dukungan 20 baris per halaman, filter pencarian, dan perbesaran ukuran teks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLocked ? (
              <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-sm font-bold">
                <Lock className="w-4 h-4" /> Read-Only Cabang (Kunci HQ)
              </span>
            ) : (
              <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-sm font-bold">
                <CheckCircle2 className="w-4 h-4" /> Akses Penuh (Admin HQ / Owner)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Split-Screen Main Layout: Left (4 cols) & Right (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================
            SISI KIRI: LIST HEADER (head_code)
        ======================================================== */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <ListFilter className="w-5 h-5 text-cyan-400" />
              Sisi Kiri: Daftar Header Kategori
            </h4>
            <span className="text-sm font-mono text-slate-300 font-bold">{filteredHeaders.length} Header</span>
          </div>

          {/* Search Box & + Tambah Header */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kode atau judul header..."
                value={searchHeader}
                onChange={(e) => setSearchHeader(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={() => setIsNewHeaderModalOpen(true)}
              disabled={isLocked}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-sm shadow transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Header Baru
            </button>
          </div>

          {/* Header Category Items List - Tall view */}
          <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
            {filteredHeaders.map((head) => {
              const isSelected = head.head_code === selectedHeadCode;

              return (
                <div
                  key={head.head_code}
                  onClick={() => handleSelectHeader(head.head_code)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-md ring-1 ring-cyan-500/40'
                      : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-cyan-300">
                        {head.head_code}
                      </span>
                      <span className="text-sm font-bold text-slate-100">{head.title}</span>
                    </div>
                    <span className="text-xs text-slate-400 block font-medium">
                      Universal Key: {head.head_code}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isSelected
                        ? 'bg-cyan-400 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-300 font-semibold'
                    }`}
                  >
                    {head.count} data
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            SISI KANAN: ATAS (FORM ADD/EDIT) & BAWAH (DATAGRID LIST)
        ======================================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* Notification Banner */}
          {notification && (
            <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-700 text-emerald-200 text-sm flex items-center gap-2.5 shadow">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-semibold">{notification}</span>
            </div>
          )}

          {/* SISI KANAN ATAS: FORM ADD / EDIT DETAIL (child_code) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                    editMode === 'EDIT'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  Mode: {editMode === 'EDIT' ? 'Edit Detail' : 'Tambah Detail'}
                </span>
                <h4 className="font-bold text-white text-base">
                  Sisi Kanan Atas: Form Child Detail
                </h4>
              </div>

              <span className="text-sm font-mono text-cyan-300 font-bold bg-cyan-950/60 px-3 py-1 rounded-lg border border-cyan-800">
                Header Aktif: {selectedHeadCode} ({selectedHeaderMeta?.title})
              </span>
            </div>

            <form onSubmit={handleSubmitChild} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* head_code: Otomatis Read-Only */}
                <div>
                  <label className="block text-slate-300 mb-1.5 font-semibold text-xs">
                    head_code (Otomatis / Read-Only)
                  </label>
                  <input
                    type="text"
                    value={selectedHeadCode}
                    readOnly
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-cyan-400 font-mono font-bold text-sm cursor-not-allowed"
                  />
                </div>

                {/* child_code */}
                <div>
                  <label className="block text-slate-300 mb-1.5 font-semibold text-xs">
                    child_code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: C01, PKG-01, ISL30"
                    value={formData.child_code}
                    onChange={(e) => setFormData({ ...formData, child_code: e.target.value })}
                    disabled={isLocked || editMode === 'EDIT'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-sm uppercase focus:outline-none focus:border-cyan-500 disabled:opacity-60"
                    required
                  />
                </div>

                {/* description */}
                <div>
                  <label className="block text-slate-300 mb-1.5 font-semibold text-xs">
                    description (Nama / Keterangan) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Deskripsi nilai master..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={isLocked}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium text-sm focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              {/* Extra Attributes: cd1, cd2, cd3, cd4 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold text-xs">cd1 (Status Aktif / HPP / Relasi)</label>
                  <input
                    type="text"
                    placeholder="Nilai cd1..."
                    value={formData.cd1}
                    onChange={(e) => setFormData({ ...formData, cd1: e.target.value })}
                    disabled={isLocked}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold text-xs">cd2 (Tipe / Nett KSO)</label>
                  <input
                    type="text"
                    placeholder="Nilai cd2..."
                    value={formData.cd2}
                    onChange={(e) => setFormData({ ...formData, cd2: e.target.value })}
                    disabled={isLocked}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold text-xs">cd3 (Parent / Publish)</label>
                  <input
                    type="text"
                    placeholder="Nilai cd3..."
                    value={formData.cd3}
                    onChange={(e) => setFormData({ ...formData, cd3: e.target.value })}
                    disabled={isLocked}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold text-xs">cd4 (Metadata Tambahan)</label>
                  <input
                    type="text"
                    placeholder="Nilai cd4..."
                    value={formData.cd4}
                    onChange={(e) => setFormData({ ...formData, cd4: e.target.value })}
                    disabled={isLocked}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
                  />
                </div>
              </div>

              {/* Action Buttons: Simpan, Batal, Hapus */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isLocked}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm shadow transition flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editMode === 'EDIT' ? 'Simpan Perubahan' : 'Simpan Data Baru'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Batal / Reset Form</span>
                  </button>
                </div>

                {editMode === 'EDIT' && (
                  <button
                    type="button"
                    onClick={handleDeleteCurrent}
                    disabled={isLocked}
                    className="px-4 py-2.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-sm transition flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Baris Ini</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* SISI KANAN BAWAH: LIST CHILD (DATAGRID TINGGI MEMANJANG SAMPAI KE BAWAH) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <Tag className="w-5 h-5 text-emerald-400" />
                  Sisi Kanan Bawah: Daftar Child ({filteredChildItems.length} Data dalam Header &apos;{selectedHeadCode}&apos;)
                </h4>
                <span className="text-xs text-slate-400">Klik salah satu baris untuk membuka dan mengedit data di formulir atas</span>
              </div>

              {/* Child Search & Page Size Selector */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari kode/nama child..."
                    value={searchChild}
                    onChange={(e) => {
                      setSearchChild(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-48 bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>Tampil:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-cyan-300 font-bold"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20 (Standar)</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List Child Table Container: Extended to bottom screen with scroll */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 min-h-[380px] max-h-[640px] overflow-y-auto">
              <table className="w-full text-left text-sm text-slate-200">
                <thead className="bg-slate-950 text-slate-300 uppercase font-mono text-xs border-b border-slate-800 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3.5 font-bold">child_code</th>
                    <th className="px-4 py-3.5 font-bold">description</th>
                    <th className="px-4 py-3.5 text-center font-bold">cd1</th>
                    <th className="px-4 py-3.5 text-center font-bold">cd2</th>
                    <th className="px-4 py-3.5 text-center font-bold">cd3</th>
                    <th className="px-4 py-3.5 font-bold">cd4</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-mono">
                  {paginatedChildren.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center text-slate-400 font-sans text-sm">
                        Belum ada child data untuk header {selectedHeadCode}. Gunakan form di atas untuk menambahkan data baru.
                      </td>
                    </tr>
                  ) : (
                    paginatedChildren.map((item) => {
                      const isCurrentlyEdited = editingId === item.id;

                      return (
                        <tr
                          key={item.id}
                          onClick={() => handleSelectChildForEdit(item)}
                          className={`cursor-pointer transition-colors ${
                            isCurrentlyEdited
                              ? 'bg-cyan-950/60 text-cyan-100 font-semibold ring-1 ring-inset ring-cyan-500'
                              : 'hover:bg-slate-800/70 text-slate-200'
                          }`}
                        >
                          <td className="px-4 py-3.5 font-black text-cyan-400 text-sm">{item.child_code}</td>
                          <td className="px-4 py-3.5 font-sans font-semibold text-white text-sm">{item.description}</td>
                          <td className="px-4 py-3.5 text-center text-slate-300">{item.cd1 || '-'}</td>
                          <td className="px-4 py-3.5 text-center text-purple-300 font-medium">{item.cd2 || '-'}</td>
                          <td className="px-4 py-3.5 text-center text-amber-300 font-medium">{item.cd3 || '-'}</td>
                          <td className="px-4 py-3.5 text-slate-300 text-xs">{item.cd4 || '-'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm pt-2 gap-2">
              <span className="text-slate-300 font-medium">
                Menampilkan {filteredChildItems.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
                {Math.min(currentPage * pageSize, filteredChildItems.length)} dari {filteredChildItems.length} baris
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage <= 1}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-semibold flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Sebelumnya
                </button>
                <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono font-bold text-cyan-400 text-sm">
                  Hal {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-semibold flex items-center gap-1"
                >
                  Berikutnya <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Tambah Header Kategori Baru */}
      {isNewHeaderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h4 className="font-bold text-white text-lg">Tambah Kategori Header Baru</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Header ini akan disimpan sebagai grup utama di tabel <code className="text-cyan-300">general_masters</code> dengan penanda <code>child_code = &apos;*&apos;</code>.
            </p>

            <form onSubmit={handleCreateHeader} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Kode Header (head_code)</label>
                <input
                  type="text"
                  placeholder="Contoh: HTL01, AIR01, JKT01"
                  value={newHeaderCode}
                  onChange={(e) => setNewHeaderCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono uppercase focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Judul / Nama Kategori</label>
                <input
                  type="text"
                  placeholder="Contoh: Master Hotel Makkah & Madinah"
                  value={newHeaderTitle}
                  onChange={(e) => setNewHeaderTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewHeaderModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-md"
                >
                  Simpan Header
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
