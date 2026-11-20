import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Plus,
  ArrowRight,
  ShieldAlert,
  Layers,
  Sparkles,
  Search,
  Filter,
  Eye,
  X,
  HelpCircle,
  BookOpen,
  Info,
} from 'lucide-react';
import { ChartOfAccount, MasterDataRequest, RoleCode } from '../../../types/erp.ts';
import { CollapsibleCard } from '../../common/CollapsibleCard.tsx';
import { ResizableTh, useResizableColumns } from '../../common/ResizableTable.tsx';

interface CoaAndRequestsTabProps {
  coas: ChartOfAccount[];
  requests: MasterDataRequest[];
  onApproveRequest: (requestId: string, notes: string) => void;
  onRejectRequest: (requestId: string, notes: string) => void;
  onSubmitNewRequest: (req: MasterDataRequest) => void;
  currentRole: RoleCode;
  currentBranchCode: string;
}

export const CoaAndRequestsTab: React.FC<CoaAndRequestsTabProps> = ({
  coas,
  requests,
  onApproveRequest,
  onRejectRequest,
  onSubmitNewRequest,
  currentRole,
  currentBranchCode,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'COA' | 'REQUESTS'>('COA');

  // Search and Filters for COA
  const [coaSearch, setCoaSearch] = useState('');
  const [coaTypeFilter, setCoaTypeFilter] = useState<string>('ALL');
  const [coaBalanceFilter, setCoaBalanceFilter] = useState<string>('ALL');

  // Modal View Detail COA
  const [selectedCoaDetail, setSelectedCoaDetail] = useState<ChartOfAccount | null>(null);

  // Form pengajuan baru dari Cabang
  const [requestType, setRequestType] = useState<'ADD_COA' | 'ADD_MASTER'>('ADD_COA');
  const [coaCode, setCoaCode] = useState('');
  const [coaName, setCoaName] = useState('');
  const [accountType, setAccountType] = useState<ChartOfAccount['account_type']>('ASSET');
  const [normalBalance, setNormalBalance] = useState<'D' | 'C'>('D');
  const [masterHeadCode, setMasterHeadCode] = useState('PKG01');
  const [masterChildCode, setMasterChildCode] = useState('');
  const [masterDesc, setMasterDesc] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Resizable table columns
  type CoaColKey = 'code' | 'name' | 'type' | 'normal' | 'tax' | 'status' | 'actions';
  const { widths, startResize } = useResizableColumns<CoaColKey>({
    code: 110,
    name: 280,
    type: 140,
    normal: 100,
    tax: 120,
    status: 90,
    actions: 100,
  });

  const isHqAdmin =
    currentRole === 'ADMIN_HQ' ||
    currentRole === 'ADMIN_SAAS' ||
    currentRole === 'OWNER_CLEVEL';

  // Helper function to decode 4-digit COA hierarchy
  const decodeCoaDigits = (code: string) => {
    const cleanDigits = code.replace(/[^0-9]/g, '');
    const d1 = cleanDigits[0] || '1';
    const d2 = cleanDigits[1] || '1';
    const d3 = cleanDigits[2] || '1';
    const d4 = cleanDigits[3] || '1';

    let jenisDesc = 'Aset (Harta / Assets)';
    if (d1 === '2') jenisDesc = 'Kewajiban / Liabilitas (Liabilities)';
    else if (d1 === '3') jenisDesc = 'Ekuitas / Modal Bersih (Equity)';
    else if (d1 === '4') jenisDesc = 'Pendapatan Usaha (Revenue)';
    else if (d1 === '5') jenisDesc = 'Beban Pokok Penjualan / HPP Umrah (COGS)';
    else if (d1 === '6') jenisDesc = 'Beban Operasional Kantor (OPEX)';

    let kelompokDesc = 'Aset Lancar';
    if (d1 === '1') {
      if (d2 === '1') kelompokDesc = 'Aset Lancar (Current Assets)';
      else if (d2 === '2') kelompokDesc = 'Aset Tetap (Fixed Assets & Perlengkapan)';
      else kelompokDesc = 'Aset Lain-lain & Uang Jaminan';
    } else if (d1 === '2') {
      if (d2 === '1') kelompokDesc = 'Liabilitas Jangka Pendek (Utang Tiket/Hotel/Escrow)';
      else kelompokDesc = 'Liabilitas Jangka Panjang';
    } else if (d1 === '4') {
      kelompokDesc = 'Pendapatan Paket Umrah & Jasa Pendukung';
    } else if (d1 === '5') {
      kelompokDesc = 'Beban Langsung Land Arrangement (LA Saudi & Visa)';
    }

    let bagianDesc = 'Kas dan Setara Kas';
    if (d1 === '1' && d2 === '1') {
      if (d3 === '0' || d3 === '1') bagianDesc = 'Kas dan Setara Kas';
      else if (d3 === '2') bagianDesc = 'Piutang Usaha & Piutang Jamaah';
      else if (d3 === '3') bagianDesc = 'Persediaan Koper & Seragam Manasik';
      else if (d3 === '4') bagianDesc = 'Uang Muka Hotel Saudi / Biaya Dibayar di Muka';
      else bagianDesc = 'Aset Lancar Operasional Lainnya';
    } else {
      bagianDesc = `Komponen Akun Level 3 (Sub-Kelompok ${d3})`;
    }

    let spesifikDesc = 'Kas di Bank (Cabang / Nama Bank tertentu)';
    if (d4 === '1') spesifikDesc = 'Kas Kecil / Kas Tunai Operasional';
    else if (d4 === '2') spesifikDesc = 'Kas di Bank (Cabang/Nama Bank tertentu)';
    else if (d4 === '3') spesifikDesc = 'Kas dalam Perjalanan / Kliring Giro';
    else if (d4 === '4') spesifikDesc = 'Rekening Escrow Penampungan Jamaah (BPS-BPIH)';
    else spesifikDesc = `Rekening Spesifik Unit Transaksi (${d4})`;

    return { d1, d2, d3, d4, jenisDesc, kelompokDesc, bagianDesc, spesifikDesc };
  };

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();

    let payload: any = {};
    if (requestType === 'ADD_COA') {
      payload = {
        coa_code: coaCode.trim().toUpperCase(),
        coa_name: coaName.trim(),
        account_type: accountType,
        normal_balance: normalBalance,
      };
    } else {
      payload = {
        head_code: masterHeadCode.trim().toUpperCase(),
        child_code: masterChildCode.trim().toUpperCase(),
        description: masterDesc.trim(),
        cd1: '1',
      };
    }

    const newReq: MasterDataRequest = {
      request_id: `req-${Date.now()}`,
      tenant_id: '11111111-1111-1111-1111-111111111111',
      branch_id_pengaju: currentBranchCode,
      request_type: requestType,
      request_payload: payload,
      status: 'PENDING',
      submitted_by_name: `Staf Cabang ${currentBranchCode}`,
      notes: requestNotes,
      created_at: new Date().toISOString(),
    };

    onSubmitNewRequest(newReq);
    setSuccessNotice(
      `Pengajuan proposal [${requestType}] berhasil dikirim ke antrean review Admin HQ Jakarta.`
    );
    setRequestNotes('');
    setCoaCode('');
    setCoaName('');
    setMasterChildCode('');
    setMasterDesc('');
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  // Filter COA List
  const filteredCoas = coas.filter((c) => {
    const searchLow = coaSearch.toLowerCase();
    const matchesSearch =
      c.coa_code.toLowerCase().includes(searchLow) || c.coa_name.toLowerCase().includes(searchLow);
    const matchesType = coaTypeFilter === 'ALL' ? true : c.account_type === coaTypeFilter;
    const matchesBalance = coaBalanceFilter === 'ALL' ? true : c.normal_balance === coaBalanceFilter;
    return matchesSearch && matchesType && matchesBalance;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Card (Collapsible) */}
      <CollapsibleCard
        title="Bagan Akun Standar Terpusat (Single Chart of Accounts)"
        subtitle="Satu bagan akun universal tanpa duplikasi valas, bank, atau vendor di level COA"
        icon={FileSpreadsheet}
        defaultOpen={true}
        headerRight={
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSubTab('COA')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'COA'
                  ? 'bg-[#98C3BC] text-[#13302B] dark:bg-emerald-600 dark:text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-[#C0DDD6] dark:border-slate-700'
              }`}
            >
              Daftar COA Tunggal ({coas.length})
            </button>
            <button
              onClick={() => setActiveSubTab('REQUESTS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'REQUESTS'
                  ? 'bg-[#98C3BC] text-[#13302B] dark:bg-emerald-600 dark:text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-[#C0DDD6] dark:border-slate-700'
              }`}
            >
              Proposal Cabang ({requests.filter((r) => r.status === 'PENDING').length} Pending)
            </button>
          </div>
        }
      >
        <div className="p-3.5 rounded-xl bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-[#1E4E46] dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              1. Murni Single COA
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Akun universal ringkas (misal: 1101 Kas, 1102 Bank, 2101 Utang Vendor). Tidak ada pemecahan akun per mata uang, per bank, atau per vendor di bagan akun.
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-[#1E4E46] dark:text-cyan-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" />
              2. Dimensi Valas di Jurnal
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Rincian mata uang (SAR, USD, IDR) dan kurs konversi dicatat pada dimensi baris jurnal transaksi (journal_details) tanpa membuat duplikasi COA.
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-[#1E4E46] dark:text-amber-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
              3. Dimensi Bank &amp; Vendor
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Rekening bank spesifik dan identitas vendor (Airlines, Hotel, Visa) dicatat di sub-ledger jurnal (journal_bodies), menjaga buku besar tetap rapi.
            </p>
          </div>
        </div>
      </CollapsibleCard>

      {successNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 shadow">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Subtab 1: Single Chart of Accounts */}
      {activeSubTab === 'COA' && (
        <CollapsibleCard
          title="Daftar Bagan Akun Buku Besar (COA List)"
          subtitle="Tabel interaktif dengan kolom yang dapat diperlebar/diperkecil, pencarian, filter klasifikasi, dan view detail hierarki kode"
          icon={BookOpen}
          defaultOpen={true}
        >
          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-[#F4F8F7] dark:bg-slate-950 p-3 rounded-xl border border-[#C0DDD6] dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter Tipe:
              </span>

              {/* Filter Account Type */}
              <select
                value={coaTypeFilter}
                onChange={(e) => setCoaTypeFilter(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">Semua Tipe Akun</option>
                <option value="ASSET">ASSET (Aset)</option>
                <option value="LIABILITY">LIABILITY (Kewajiban)</option>
                <option value="EQUITY">EQUITY (Modal)</option>
                <option value="REVENUE">REVENUE (Pendapatan)</option>
                <option value="EXPENSE_HPP">EXPENSE_HPP (HPP Umrah)</option>
                <option value="EXPENSE_OPEX">EXPENSE_OPEX (Beban Operasional)</option>
              </select>

              {/* Filter Normal Balance */}
              <select
                value={coaBalanceFilter}
                onChange={(e) => setCoaBalanceFilter(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">Semua Saldo Normal</option>
                <option value="D">Debet (D)</option>
                <option value="C">Kredit (C)</option>
              </select>

              {(coaTypeFilter !== 'ALL' || coaBalanceFilter !== 'ALL' || coaSearch) && (
                <button
                  type="button"
                  onClick={() => {
                    setCoaTypeFilter('ALL');
                    setCoaBalanceFilter('ALL');
                    setCoaSearch('');
                  }}
                  className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                >
                  Reset Filter
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={coaSearch}
                onChange={(e) => setCoaSearch(e.target.value)}
                placeholder="Cari kode atau nama akun COA..."
                className="w-full bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
              />
            </div>
          </div>

          {/* Resizable Table Container */}
          <div className="overflow-x-auto rounded-xl border border-[#C0DDD6] dark:border-slate-800">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-[#EBF5F3] dark:bg-slate-950 text-[#1E4E46] dark:text-slate-200 border-b border-[#C0DDD6] dark:border-slate-800">
                  <ResizableTh width={widths.code} onResize={(e) => startResize('code', e)}>
                    Kode COA
                  </ResizableTh>
                  <ResizableTh width={widths.name} onResize={(e) => startResize('name', e)}>
                    Nama Akun Buku Besar
                  </ResizableTh>
                  <ResizableTh width={widths.type} onResize={(e) => startResize('type', e)}>
                    Klasifikasi Tipe
                  </ResizableTh>
                  <ResizableTh width={widths.normal} onResize={(e) => startResize('normal', e)} align="center">
                    Saldo Normal
                  </ResizableTh>
                  <ResizableTh width={widths.tax} onResize={(e) => startResize('tax', e)}>
                    Kategori Pajak
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
                {filteredCoas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      Tidak ada akun yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredCoas.map((c) => (
                    <tr
                      key={c.coa_code}
                      onClick={() => setSelectedCoaDetail(c)}
                      className="hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                    >
                      <td className="px-3.5 py-3 font-mono font-bold text-[#1E4E46] dark:text-emerald-400">
                        {c.coa_code}
                      </td>
                      <td className="px-3.5 py-3 font-semibold text-slate-900 dark:text-white">
                        {c.coa_name}
                      </td>
                      <td className="px-3.5 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.account_type === 'ASSET'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                              : c.account_type === 'LIABILITY'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30'
                              : c.account_type === 'REVENUE'
                              ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                          }`}
                        >
                          {c.account_type}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {c.normal_balance}
                      </td>
                      <td className="px-3.5 py-3">
                        {c.is_tax_account ? (
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                            {c.tax_type}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-3.5 py-3 text-center">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                          Aktif
                        </span>
                      </td>
                      <td
                        className="px-3.5 py-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedCoaDetail(c)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-slate-800 dark:text-white flex items-center gap-1 mx-auto transition-colors"
                          title="Lihat Rincian & Analisis Kode"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CollapsibleCard>
      )}

      {/* Subtab 2: Master Data Requests (Cabang Proposal & HQ Approval) */}
      {activeSubTab === 'REQUESTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sisi Kiri: Form Pengajuan Usulan dari Cabang (5 cols) */}
          <div className="lg:col-span-5">
            <CollapsibleCard
              title="Form Pengajuan Proposal Cabang"
              subtitle={`Usulan akun baru dari Cabang: ${currentBranchCode}`}
              icon={Send}
              defaultOpen={true}
            >
              <form onSubmit={handleSubmitProposal} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Jenis Pengajuan</label>
                  <select
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value as any)}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
                  >
                    <option value="ADD_COA">Tambah Akun COA Baru</option>
                    <option value="ADD_MASTER">Tambah Master Data Baru (general_masters)</option>
                  </select>
                </div>

                {requestType === 'ADD_COA' ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Usulan Kode COA</label>
                        <input
                          type="text"
                          placeholder="Contoh: 1113"
                          value={coaCode}
                          onChange={(e) => setCoaCode(e.target.value)}
                          className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono uppercase"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Tipe Akun</label>
                        <select
                          value={accountType}
                          onChange={(e) => setAccountType(e.target.value as any)}
                          className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                        >
                          <option value="ASSET">ASSET</option>
                          <option value="LIABILITY">LIABILITY</option>
                          <option value="EXPENSE_OPEX">EXPENSE_OPEX</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Nama Akun COA</label>
                      <input
                        type="text"
                        placeholder="Contoh: Kas Operasional Khusus Kediri"
                        value={coaName}
                        onChange={(e) => setCoaName(e.target.value)}
                        className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Head Code</label>
                        <select
                          value={masterHeadCode}
                          onChange={(e) => setMasterHeadCode(e.target.value)}
                          className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                        >
                          <option value="PKG01">PKG01 (Paket Umrah)</option>
                          <option value="BRN01">BRN01 (Cabang)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Child Code Baru</label>
                        <input
                          type="text"
                          placeholder="Contoh: UMR-KDR-NEW"
                          value={masterChildCode}
                          onChange={(e) => setMasterChildCode(e.target.value)}
                          className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono uppercase"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Deskripsi Entitas</label>
                      <input
                        type="text"
                        placeholder="Contoh: Paket Umrah Ramadhan Kediri"
                        value={masterDesc}
                        onChange={(e) => setMasterDesc(e.target.value)}
                        className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Catatan Alasan Pengajuan</label>
                  <textarea
                    rows={2}
                    placeholder="Alasan bisnis pengajuan akun/master baru..."
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  Kirim Usulan ke Admin HQ
                </button>
              </form>
            </CollapsibleCard>
          </div>

          {/* Sisi Kanan: Daftar Antrean Permohonan Master Data (7 cols) */}
          <div className="lg:col-span-7">
            <CollapsibleCard
              title="Antrean Usulan Master Data Cabang"
              subtitle={
                isHqAdmin
                  ? 'Mode Admin HQ: Wewenang Verifikasi & Approval Permohonan Cabang'
                  : 'Mode Cabang: Memantau status review oleh Admin HQ'
              }
              icon={Clock}
              defaultOpen={true}
            >
              <div className="space-y-3">
                {requests.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    Belum ada riwayat permohonan master data.
                  </p>
                ) : (
                  requests.map((r) => {
                    const isPending = r.status === 'PENDING';
                    const isApproved = r.status === 'APPROVED';

                    return (
                      <div
                        key={r.request_id}
                        className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                          isPending
                            ? 'bg-[#F4F8F7] dark:bg-slate-950 border-amber-300 dark:border-amber-900/60'
                            : isApproved
                            ? 'bg-emerald-50/50 dark:bg-slate-950 border-emerald-300 dark:border-emerald-900/60'
                            : 'bg-rose-50/50 dark:bg-slate-950 border-rose-300 dark:border-rose-900/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-[11px] font-bold text-[#1E4E46] dark:text-cyan-400">
                              {r.request_id}
                            </span>
                            <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                              {r.request_type === 'ADD_COA'
                                ? `Tambah COA: ${r.request_payload.coa_code} - ${r.request_payload.coa_name}`
                                : `Tambah Master: [${r.request_payload.head_code}] ${r.request_payload.description}`}
                            </h5>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isPending
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300'
                                : isApproved
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300'
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                          Alasan: "{r.notes}" • Pengaju: {r.submitted_by_name} ({r.branch_id_pengaju})
                        </p>

                        {isPending && isHqAdmin && (
                          <div className="flex items-center gap-2 pt-2 border-t border-[#C0DDD6] dark:border-slate-800">
                            <button
                              type="button"
                              onClick={() => onApproveRequest(r.request_id, 'Disetujui oleh HQ')}
                              className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Setujui Usulan</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onRejectRequest(r.request_id, 'Ditolak: Duplikasi COA')}
                              className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Tolak</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CollapsibleCard>
          </div>
        </div>
      )}

      {/* Modal View Detail & Analisis Dekomposisi 4-Digit COA */}
      {selectedCoaDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#C0DDD6] dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#C0DDD6]/40 dark:bg-emerald-950 text-[#1E4E46] dark:text-emerald-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Detail Akun: {selectedCoaDetail.coa_code} - {selectedCoaDetail.coa_name}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Struktur Hierarki Digit &amp; Klasifikasi Akuntansi
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCoaDetail(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 text-xs">
              {/* Box 1: Ringkasan Akun */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[11px]">Kode Akun</span>
                  <strong className="font-mono text-base text-[#1E4E46] dark:text-emerald-400">
                    {selectedCoaDetail.coa_code}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Nama Buku Besar</span>
                  <strong className="text-slate-900 dark:text-white text-sm">
                    {selectedCoaDetail.coa_name}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Klasifikasi Tipe</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedCoaDetail.account_type}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Saldo Normal</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {selectedCoaDetail.normal_balance === 'D' ? 'Debet (D)' : 'Kredit (C)'}
                  </span>
                </div>
              </div>

              {/* Box 2: Dekomposisi 4-Digit Akun Terpilih */}
              {(() => {
                const dec = decodeCoaDigits(selectedCoaDetail.coa_code);
                return (
                  <div className="border border-[#C0DDD6] dark:border-slate-800 rounded-xl p-4 space-y-3 bg-white dark:bg-slate-900">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Analisis Dekomposisi Kode Akun ({selectedCoaDetail.coa_code}):
                    </h4>

                    <div className="space-y-2 text-slate-700 dark:text-slate-300">
                      <div className="flex items-start gap-2 p-2 rounded-lg bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6]/50 dark:border-slate-800">
                        <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Digit 1 ({dec.d1})
                        </span>
                        <div className="pt-0.5">
                          <span>-&gt; Jenisnya adalah <strong>{dec.jenisDesc}</strong>.</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-2 rounded-lg bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6]/50 dark:border-slate-800">
                        <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          Digit 2 ({dec.d2})
                        </span>
                        <div className="pt-0.5">
                          <span>-&gt; Masuk kelompok <strong>{dec.kelompokDesc}</strong>.</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-2 rounded-lg bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6]/50 dark:border-slate-800">
                        <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          Digit 3 ({dec.d3})
                        </span>
                        <div className="pt-0.5">
                          <span>-&gt; Merupakan bagian dari <strong>{dec.bagianDesc}</strong>.</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-2 rounded-lg bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6]/50 dark:border-slate-800">
                        <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Digit 4 ({dec.d4})
                        </span>
                        <div className="pt-0.5">
                          <span>-&gt; Merupakan rekening spesifik yaitu <strong>{dec.spesifikDesc}</strong>.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Box 3: Contoh Ilustrasi Resmi (Kode 1112) sesuai permintaan spesifikasi */}
              <div className="border border-emerald-300 dark:border-emerald-800/80 rounded-xl p-4 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Contoh Ilustrasi (Kode 1112):</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300 font-medium pl-1 leading-relaxed">
                  <p>• <strong>Digit 1 (1)</strong> -&gt; Jenisnya adalah Aset.</p>
                  <p>• <strong>Digit 2 (1)</strong> -&gt; Masuk kelompok Aset Lancar.</p>
                  <p>• <strong>Digit 3 (1)</strong> -&gt; Merupakan bagian dari Kas dan Setara Kas.</p>
                  <p>• <strong>Digit 4 (2)</strong> -&gt; Merupakan rekening spesifik yaitu Kas di Bank (Cabang/Nama Bank tertentu).</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedCoaDetail(null)}
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
