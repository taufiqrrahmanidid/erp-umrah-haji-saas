import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Coins,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  Building,
  CreditCard,
  Send,
  Eye,
  X,
  Search,
  Filter,
  UserCheck,
  Lock,
  Sparkles,
  Save,
  Clock,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { AgentWallet, WalletMutation, Booking, RoleCode } from '../../../types/erp.ts';
import { CollapsibleCard } from '../../common/CollapsibleCard.tsx';
import { PopupCalendar } from '../../common/PopupCalendar.tsx';
import { ResizableTh, useResizableColumns } from '../../common/ResizableTable.tsx';

interface ExtendedAgentWallet extends AgentWallet {
  account_number_bsi?: string;
  phone_number?: string;
  registered_date?: string;
  workflow_stage?: 'DRAFT_MAKER' | 'APPROVED' | 'RELEASED';
  maker_name?: string;
  approver_name?: string;
  releaser_name?: string;
}

interface ExtendedTopupRequest {
  request_id: string;
  wallet_id: string;
  agent_name: string;
  branch_id: string;
  amount: number;
  request_date: string;
  workflow_stage: 'DRAFT_MAKER' | 'APPROVED' | 'RELEASED';
  maker_name: string;
  approver_name?: string;
  releaser_name?: string;
  notes: string;
}

interface AgentWalletTabProps {
  wallets: AgentWallet[];
  mutations: WalletMutation[];
  bookings: Booking[];
  onTopupWallet: (walletId: string, amount: number) => void;
  onPayViaWallet: (walletId: string, bookingId: string, amount: number) => void;
  currentRole?: RoleCode;
  currentBranchCode?: string;
}

export const AgentWalletTab: React.FC<AgentWalletTabProps> = ({
  wallets: initialWallets,
  mutations: initialMutations,
  bookings,
  onTopupWallet,
  onPayViaWallet,
  currentRole = 'ADMIN_HQ',
  currentBranchCode = 'C00',
}) => {
  // Enhanced Wallet List with Maker-Approver-Releaser metadata
  const [walletList, setWalletList] = useState<ExtendedAgentWallet[]>(() =>
    initialWallets.map((w, idx) => ({
      ...w,
      account_number_bsi: `9882 0819 2831 00${idx + 1}`,
      phone_number: `08129881120${idx + 1}`,
      registered_date: '2026-03-15',
      workflow_stage: 'RELEASED',
      maker_name: 'Staf Administrasi Agen',
      approver_name: 'Supervisor Finance',
      releaser_name: 'Direktur Keuangan HQ',
    }))
  );

  const [mutations, setMutations] = useState<WalletMutation[]>(initialMutations);
  const [selectedWalletId, setSelectedWalletId] = useState<string>(walletList[0]?.wallet_id || '');
  const [selectedBookingId, setSelectedBookingId] = useState<string>(bookings[0]?.booking_id || '');
  const [paymentAmount, setPaymentAmount] = useState<number>(10000000);
  const [paymentMethod, setPaymentMethod] = useState<'WALLET_DEPOSIT' | 'BANK_TRANSFER'>('WALLET_DEPOSIT');
  const [notification, setNotification] = useState<string | null>(null);

  // Search & Filter
  const [walletSearch, setWalletSearch] = useState('');
  const [walletStageFilter, setWalletStageFilter] = useState<string>('ALL');

  // Modals
  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [viewWalletDetail, setViewWalletDetail] = useState<ExtendedAgentWallet | null>(null);

  // Form Tambah Agen Wallet Baru State
  const [newAgentCode, setNewAgentCode] = useState(`AGT-${Math.floor(100 + Math.random() * 900)}`);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentBranch, setNewAgentBranch] = useState(currentBranchCode);
  const [newAgentVa, setNewAgentVa] = useState(`9882 0819 2831 ${Math.floor(100 + Math.random() * 900)}`);
  const [newAgentPhone, setNewAgentPhone] = useState('');
  const [newInitialDeposit, setNewInitialDeposit] = useState<number>(5000000);
  const [newRegDate, setNewRegDate] = useState('2026-10-12');

  // Top-Up Request Queue with Maker-Approver-Releaser workflow
  const [topupRequests, setTopupRequests] = useState<ExtendedTopupRequest[]>([
    {
      request_id: 'top-req-001',
      wallet_id: walletList[0]?.wallet_id || 'w-01',
      agent_name: walletList[0]?.agent_name || 'Ustadz Ahmad Fauzi',
      branch_id: walletList[0]?.branch_id || 'C01',
      amount: 15000000,
      request_date: '2026-10-11',
      workflow_stage: 'DRAFT_MAKER',
      maker_name: 'Staf Kasir Cabang (Maker)',
      notes: 'Setoran Tunai Agen via Teller BSI Kantor Cabang Kediri',
    },
    {
      request_id: 'top-req-002',
      wallet_id: walletList[1]?.wallet_id || 'w-02',
      agent_name: walletList[1]?.agent_name || 'Hj. Siti Mardiah',
      branch_id: walletList[1]?.branch_id || 'C00',
      amount: 25000000,
      request_date: '2026-10-10',
      workflow_stage: 'APPROVED',
      maker_name: 'Staf Kemitraan HQ (Maker)',
      approver_name: 'Finance Manager (Approver)',
      notes: 'Transfer Bank Mandiri ke Rekening Penampungan BSI Biro',
    },
  ]);

  // Form Request Top-Up State
  const [topupWalletId, setTopupWalletId] = useState<string>(walletList[0]?.wallet_id || '');
  const [topupAmountInput, setTopupAmountInput] = useState<number>(10000000);
  const [topupDateInput, setTopupDateInput] = useState('2026-10-12');
  const [topupNotesInput, setTopupNotesInput] = useState('Top-up Saldo Deposit Pelunasan Tiket Jamaah');

  // Resizable columns for wallet list table
  type WalletCol = 'id' | 'agent' | 'branch' | 'va' | 'balance' | 'stage' | 'status' | 'regDate' | 'actions';
  const walletCols = useResizableColumns<WalletCol>({
    id: 110,
    agent: 200,
    branch: 110,
    va: 160,
    balance: 150,
    stage: 140,
    status: 100,
    regDate: 120,
    actions: 140,
  });

  const selectedWallet = walletList.find((w) => w.wallet_id === selectedWalletId) || walletList[0] || {
    wallet_id: 'default',
    agent_name: 'Pilih Agen',
    current_balance: 0,
    branch_id: 'C00',
  };
  const selectedBooking = bookings.find((b) => b.booking_id === selectedBookingId) || bookings[0];

  // RBAC Permission Helpers
  const canMake = ['INTERNAL_SALES', 'STAF_ADMIN_OPERASIONAL', 'BRANCH_AGENT', 'ADMIN_BRANCH', 'ADMIN_HQ', 'ADMIN_SAAS', 'OWNER_CLEVEL'].includes(currentRole);
  const canApprove = ['FINANCE_CENTRAL', 'FINANCE_BRANCH', 'ADMIN_HQ', 'ADMIN_SAAS', 'OWNER_CLEVEL'].includes(currentRole);
  const canRelease = ['ADMIN_HQ', 'ADMIN_SAAS', 'OWNER_CLEVEL'].includes(currentRole);

  // 1. Tambah Agent Wallet Baru (Maker Stage)
  const handleCreateAgentWallet = (e: React.FormEvent) => {
    e.preventDefault();
    const newWalletObj: ExtendedAgentWallet = {
      wallet_id: `w-${Date.now()}`,
      agent_user_id: newAgentCode,
      agent_name: newAgentName,
      branch_id: newAgentBranch,
      current_balance: 0,
      status: 'ACTIVE',
      account_number_bsi: newAgentVa,
      phone_number: newAgentPhone,
      registered_date: newRegDate,
      workflow_stage: 'DRAFT_MAKER',
      maker_name: `Maker (${currentRole})`,
    };

    setWalletList([newWalletObj, ...walletList]);
    setShowAddWalletModal(false);
    setNotification(
      `Pendaftaran Agen Wallet [${newAgentName}] berhasil dibuat oleh Maker! Menunggu Approval Finance dan Releaser Direksi.`
    );
    setTimeout(() => setNotification(null), 5000);
  };

  // 2. Transisi Workflow Dompet (Maker -> Approval -> Release)
  const handleUpdateWalletStage = (walletId: string, targetStage: 'APPROVED' | 'RELEASED') => {
    setWalletList((prev) =>
      prev.map((w) => {
        if (w.wallet_id !== walletId) return w;
        const updated = { ...w, workflow_stage: targetStage };
        if (targetStage === 'APPROVED') {
          updated.approver_name = `Approver (${currentRole})`;
        } else if (targetStage === 'RELEASED') {
          updated.releaser_name = `Releaser (${currentRole})`;
          updated.current_balance = w.current_balance > 0 ? w.current_balance : 5000000;
        }
        return updated;
      })
    );

    setNotification(
      `Status Dompet Agen berhasil diperbarui menjadi [${targetStage}] sesuai wewenang RBAC (${currentRole})!`
    );
    setTimeout(() => setNotification(null), 4500);
  };

  // 3. Permohonan Top-up Baru (Maker Stage)
  const handleCreateTopupRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const targetW = walletList.find((w) => w.wallet_id === topupWalletId);
    if (!targetW) return;

    const newReq: ExtendedTopupRequest = {
      request_id: `top-req-${Date.now()}`,
      wallet_id: targetW.wallet_id,
      agent_name: targetW.agent_name,
      branch_id: targetW.branch_id,
      amount: Number(topupAmountInput),
      request_date: topupDateInput,
      workflow_stage: 'DRAFT_MAKER',
      maker_name: `Maker (${currentRole})`,
      notes: topupNotesInput,
    };

    setTopupRequests([newReq, ...topupRequests]);
    setShowTopupModal(false);
    setNotification(
      `Permohonan Top-Up Rp ${Number(topupAmountInput).toLocaleString('id-ID')} berhasil diajukan (DRAFT_MAKER)!`
    );
    setTimeout(() => setNotification(null), 5000);
  };

  // 4. Update Workflow Top-Up (Approval -> Release)
  const handleUpdateTopupStage = (requestId: string, targetStage: 'APPROVED' | 'RELEASED') => {
    const req = topupRequests.find((r) => r.request_id === requestId);
    if (!req) return;

    if (targetStage === 'RELEASED') {
      onTopupWallet(req.wallet_id, req.amount);

      const targetW = walletList.find((w) => w.wallet_id === req.wallet_id);
      const balanceBefore = targetW?.current_balance || 0;
      const balanceAfter = balanceBefore + req.amount;

      const newMut: WalletMutation = {
        mutation_id: `mut-${Date.now()}`,
        wallet_id: req.wallet_id,
        mutation_type: 'TOPUP_DEPOSIT',
        amount: req.amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference_no: req.request_id,
        notes: `Release Top-Up Dana: ${req.notes}`,
        created_at: new Date().toISOString(),
      };
      setMutations([newMut, ...mutations]);

      setWalletList((prev) =>
        prev.map((w) => (w.wallet_id === req.wallet_id ? { ...w, current_balance: w.current_balance + req.amount } : w))
      );
    }

    setTopupRequests((prev) =>
      prev.map((r) =>
        r.request_id === requestId
          ? {
              ...r,
              workflow_stage: targetStage,
              ...(targetStage === 'APPROVED' ? { approver_name: `Approver (${currentRole})` } : { releaser_name: `Releaser (${currentRole})` }),
            }
          : r
      )
    );

    setNotification(
      targetStage === 'RELEASED'
        ? `Dana Top-Up Rp ${req.amount.toLocaleString('id-ID')} BERHASIL DIRELEASER dan masuk ke saldo aktif agen!`
        : `Permohonan Top-Up disetujui (APPROVED) oleh Finance. Menunggu Releaser C-Level.`
    );
    setTimeout(() => setNotification(null), 5000);
  };

  // 5. Eksekusi Pembayaran Booking via Wallet
  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'WALLET_DEPOSIT') {
      if (selectedWallet.current_balance < paymentAmount) {
        setNotification(
          `Gagal: Saldo deposit agen (Rp ${selectedWallet.current_balance.toLocaleString(
            'id-ID'
          )}) tidak mencukupi untuk pembayaran sebesar Rp ${paymentAmount.toLocaleString('id-ID')}! Silakan lakukan Top-Up terlebih dahulu.`
        );
        setTimeout(() => setNotification(null), 5000);
        return;
      }
      onPayViaWallet(selectedWallet.wallet_id, selectedBooking.booking_id, paymentAmount);

      const newMut: WalletMutation = {
        mutation_id: `mut-${Date.now()}`,
        wallet_id: selectedWallet.wallet_id,
        mutation_type: 'PAYMENT_BOOKING_DEDUCTION',
        amount: paymentAmount,
        balance_before: selectedWallet.current_balance,
        balance_after: selectedWallet.current_balance - paymentAmount,
        reference_no: selectedBooking.booking_number,
        notes: `Potong Saldo Deposit: Pelunasan Booking ${selectedBooking.booking_number}`,
        created_at: new Date().toISOString(),
      };
      setMutations([newMut, ...mutations]);

      setWalletList((prev) =>
        prev.map((w) =>
          w.wallet_id === selectedWallet.wallet_id ? { ...w, current_balance: w.current_balance - paymentAmount } : w
        )
      );

      setNotification(
        `Pembayaran Berhasil! Rp ${paymentAmount.toLocaleString(
          'id-ID'
        )} telah dipotong langsung dari Saldo Deposit Agen untuk pelunasan booking ${selectedBooking.booking_number}.`
      );
    } else {
      setNotification(
        `Instruksi Pembayaran Transfer Bank Diterbitkan untuk booking ${selectedBooking.booking_number}. Menunggu mutasi bank masuk.`
      );
    }

    setTimeout(() => setNotification(null), 5000);
  };

  // Filtered wallet list
  const filteredWallets = walletList.filter((w) => {
    const q = walletSearch.toLowerCase();
    const matchesSearch =
      w.agent_name.toLowerCase().includes(q) ||
      w.branch_id.toLowerCase().includes(q) ||
      (w.account_number_bsi || '').includes(q);
    const matchesStage = walletStageFilter === 'ALL' ? true : w.workflow_stage === walletStageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6 text-sm">
      {/* Header Banner */}
      <CollapsibleCard
        title="Agent Wallets &amp; Opsi Pembayaran Deposit Booking (Maker - Approver - Releaser)"
        subtitle="Pengelolaan rekening penampungan deposit agen, verifikasi bertingkat RBAC, dan pembayaran instan tanpa jeda manual"
        icon={Wallet}
        defaultOpen={true}
        headerRight={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddWalletModal(true)}
              disabled={!canMake}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#98C3BC] hover:bg-[#86b5ad] disabled:opacity-50 text-[#13302B] dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Dompet Agen Baru</span>
            </button>
            <button
              type="button"
              onClick={() => setShowTopupModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-[#C0DDD6] dark:border-slate-700 hover:bg-slate-100 flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>Ajukan Top-Up Saldo</span>
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">Total Dompet Agen</span>
            <div className="text-xl font-black text-slate-900 dark:text-white">{walletList.length} Agen</div>
            <span className="text-[11px] text-emerald-600 font-bold block">
              {walletList.filter((w) => w.workflow_stage === 'RELEASED').length} Saldo Terverifikasi Aktif
            </span>
          </div>

          <div className="bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">Total Saldo Terhimpun</span>
            <div className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-400">
              Rp {walletList.reduce((acc, w) => acc + w.current_balance, 0).toLocaleString('id-ID')}
            </div>
            <span className="text-[11px] text-slate-500 block">Rekening Penampungan Escrow BSI</span>
          </div>

          <div className="bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">Antrean Top-Up Verifikasi</span>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400">
              {topupRequests.filter((r) => r.workflow_stage !== 'RELEASED').length} Menunggu
            </div>
            <span className="text-[11px] text-slate-500 block">Alur Maker - Approver - Releaser</span>
          </div>

          <div className="bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">Wewenang Role Anda</span>
            <div className="text-sm font-bold text-purple-700 dark:text-purple-300 font-mono">{currentRole}</div>
            <span className="text-[11px] text-slate-500 block">
              {canRelease ? 'Akses Releaser (Penuh)' : canApprove ? 'Akses Approver (Keuangan)' : 'Akses Maker (Input)'}
            </span>
          </div>
        </div>
      </CollapsibleCard>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* DAFTAR AGENT WALLET TABLE (DENGAN RESIZABLE COLUMNS & HOVER) */}
      <CollapsibleCard
        title={`Daftar Dompet Agen & Rekening VA BSI (${filteredWallets.length} Akun)`}
        subtitle="Format tabel dinamis dengan status Maker-Approver-Releaser, mutasi saldo, dan detail rekening per agen"
        icon={FileSpreadsheet}
        defaultOpen={true}
      >
        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-[#F4F8F7] dark:bg-slate-950 p-3 rounded-xl border border-[#C0DDD6] dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter Tahap:
            </span>
            <select
              value={walletStageFilter}
              onChange={(e) => setWalletStageFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">Semua Tahap</option>
              <option value="DRAFT_MAKER">DRAFT_MAKER</option>
              <option value="APPROVED">APPROVED</option>
              <option value="RELEASED">RELEASED (Aktif)</option>
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={walletSearch}
              onChange={(e) => setWalletSearch(e.target.value)}
              placeholder="Cari agen, cabang, no VA..."
              className="w-full bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#C0DDD6] dark:border-slate-800">
          <table className="w-full text-left border-collapse min-w-[950px] text-xs">
            <thead>
              <tr className="bg-[#EBF5F3] dark:bg-slate-950 text-[#1E4E46] dark:text-slate-200 border-b border-[#C0DDD6] dark:border-slate-800">
                <ResizableTh width={walletCols.widths.id} onResize={(e) => walletCols.startResize('id', e)}>
                  ID Dompet
                </ResizableTh>
                <ResizableTh width={walletCols.widths.agent} onResize={(e) => walletCols.startResize('agent', e)}>
                  Nama Agen Mitra
                </ResizableTh>
                <ResizableTh width={walletCols.widths.branch} onResize={(e) => walletCols.startResize('branch', e)}>
                  Cabang
                </ResizableTh>
                <ResizableTh width={walletCols.widths.va} onResize={(e) => walletCols.startResize('va', e)}>
                  No. VA BSI
                </ResizableTh>
                <ResizableTh width={walletCols.widths.balance} onResize={(e) => walletCols.startResize('balance', e)}>
                  Saldo Deposit
                </ResizableTh>
                <ResizableTh width={walletCols.widths.stage} onResize={(e) => walletCols.startResize('stage', e)}>
                  Tahap Workflow
                </ResizableTh>
                <ResizableTh width={walletCols.widths.status} onResize={(e) => walletCols.startResize('status', e)} align="center">
                  Status
                </ResizableTh>
                <ResizableTh width={walletCols.widths.regDate} onResize={(e) => walletCols.startResize('regDate', e)}>
                  Tgl Terdaftar
                </ResizableTh>
                <ResizableTh width={walletCols.widths.actions} onResize={(e) => walletCols.startResize('actions', e)} align="center">
                  Aksi &amp; Wewenang
                </ResizableTh>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C0DDD6]/60 dark:divide-slate-800/80">
              {filteredWallets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Tidak ada dompet agen yang sesuai filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredWallets.map((w) => (
                  <tr
                    key={w.wallet_id}
                    onClick={() => setViewWalletDetail(w)}
                    className="hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                  >
                    <td className="px-3.5 py-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {w.wallet_id}
                    </td>
                    <td className="px-3.5 py-3 font-semibold text-slate-900 dark:text-white">
                      <div>{w.agent_name}</div>
                      <span className="text-[10px] text-slate-500 font-mono">{w.phone_number || '0812-xxx-xxx'}</span>
                    </td>
                    <td className="px-3.5 py-3 font-mono font-bold text-cyan-700 dark:text-cyan-400">
                      {w.branch_id}
                    </td>
                    <td className="px-3.5 py-3 font-mono text-slate-700 dark:text-slate-300">
                      {w.account_number_bsi || '9882 0819 2831 001'}
                    </td>
                    <td className="px-3.5 py-3 font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      Rp {w.current_balance.toLocaleString('id-ID')}
                    </td>
                    <td className="px-3.5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          w.workflow_stage === 'RELEASED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                            : w.workflow_stage === 'APPROVED'
                            ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                        }`}
                      >
                        {w.workflow_stage || 'RELEASED'}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {w.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 font-mono text-slate-500">
                      {w.registered_date || '2026-03-15'}
                    </td>
                    <td
                      className="px-3.5 py-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewWalletDetail(w)}
                          className="px-2 py-1 rounded-lg text-[11px] font-bold bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-slate-800 dark:text-white flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Detail</span>
                        </button>

                        {/* RBAC Action Buttons */}
                        {w.workflow_stage === 'DRAFT_MAKER' && canApprove && (
                          <button
                            type="button"
                            onClick={() => handleUpdateWalletStage(w.wallet_id, 'APPROVED')}
                            className="px-2 py-1 rounded-lg text-[11px] font-bold bg-cyan-600 hover:bg-cyan-500 text-white"
                            title="Approve Data Agen (Wewenang Finance)"
                          >
                            Approve
                          </button>
                        )}
                        {w.workflow_stage === 'APPROVED' && canRelease && (
                          <button
                            type="button"
                            onClick={() => handleUpdateWalletStage(w.wallet_id, 'RELEASED')}
                            className="px-2 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                            title="Release Akun & Saldo (Wewenang Direksi)"
                          >
                            Release
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CollapsibleCard>

      {/* ANTREAN TOP-UP DENGAN MAKER-APPROVER-RELEASER */}
      <CollapsibleCard
        title={`Antrean Permohonan Top-Up Saldo Agen (${topupRequests.length} Transaksi)`}
        subtitle="Alur otorisasi 3 tingkat: Maker mengajukan, Approver memverifikasi bukti transfer, Releaser mencairkan saldo ke akun aktif"
        icon={Coins}
        defaultOpen={true}
      >
        <div className="overflow-x-auto rounded-xl border border-[#C0DDD6] dark:border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#EBF5F3] dark:bg-slate-950 text-[#1E4E46] dark:text-slate-200 border-b border-[#C0DDD6] dark:border-slate-800">
              <tr>
                <th className="py-3 px-3.5 font-bold font-mono">No. Permohonan</th>
                <th className="py-3 px-3.5 font-bold">Nama Agen &amp; Cabang</th>
                <th className="py-3 px-3.5 text-right font-bold">Nominal Top-Up</th>
                <th className="py-3 px-3 font-mono">Tgl Pengajuan</th>
                <th className="py-3 px-3.5">Keterangan / Bukti</th>
                <th className="py-3 px-3 text-center font-bold">Tahap Workflow</th>
                <th className="py-3 px-3 text-center font-bold">Aksi Otorisasi RBAC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C0DDD6]/60 dark:divide-slate-800 font-mono">
              {topupRequests.map((req) => (
                <tr key={req.request_id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <td className="px-3.5 py-3 font-bold text-slate-800 dark:text-slate-200">{req.request_id}</td>
                  <td className="px-3.5 py-3 font-sans font-bold text-slate-900 dark:text-white">
                    {req.agent_name} <span className="font-mono text-cyan-600">({req.branch_id})</span>
                  </td>
                  <td className="px-3.5 py-3 text-right font-bold text-emerald-700 dark:text-emerald-400">
                    Rp {req.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-3.5 py-3 text-slate-600 dark:text-slate-400">{req.request_date}</td>
                  <td className="px-3.5 py-3 font-sans text-slate-600 dark:text-slate-400">{req.notes}</td>
                  <td className="px-3.5 py-3 text-center font-sans">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        req.workflow_stage === 'RELEASED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                          : req.workflow_stage === 'APPROVED'
                          ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                      }`}
                    >
                      {req.workflow_stage}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 text-center font-sans">
                    {req.workflow_stage === 'DRAFT_MAKER' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateTopupStage(req.request_id, 'APPROVED')}
                        disabled={!canApprove}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white"
                      >
                        Setujui (Approver)
                      </button>
                    )}
                    {req.workflow_stage === 'APPROVED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateTopupStage(req.request_id, 'RELEASED')}
                        disabled={!canRelease}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white"
                      >
                        Release Dana (Cairkan)
                      </button>
                    )}
                    {req.workflow_stage === 'RELEASED' && (
                      <span className="text-emerald-600 text-xs font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Saldo Masuk
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleCard>

      {/* Main Forms Arena: Pembayaran Booking & Riwayat Mutasi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment via Wallet Form */}
        <div className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2 border-b border-[#C0DDD6] dark:border-slate-800 pb-3">
            <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Checkout Pembayaran Tiket / Paket Jamaah via Dompet
          </h4>

          <form onSubmit={handleExecutePayment} className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                Pilih Booking Jamaah Terdaftar
              </label>
              <select
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
              >
                {bookings.map((b) => (
                  <option key={b.booking_id} value={b.booking_id}>
                    {b.booking_number} - {b.customer_name} ({b.package_name}) - Tagihan: Rp {b.net_payable.toLocaleString('id-ID')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                Pilih Dompet Agen Pembayar
              </label>
              <select
                value={selectedWalletId}
                onChange={(e) => setSelectedWalletId(e.target.value)}
                className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-medium"
              >
                {walletList.map((w) => (
                  <option key={w.wallet_id} value={w.wallet_id}>
                    {w.agent_name} ({w.branch_id}) - Saldo: Rp {w.current_balance.toLocaleString('id-ID')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                Nominal Pembayaran (Rp)
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm"
                required
              />
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Opsi Saluran Pembayaran</label>
              <div className="space-y-2">
                <label
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                    paymentMethod === 'WALLET_DEPOSIT'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-slate-900 dark:text-white'
                      : 'bg-[#F4F8F7] dark:bg-slate-950 border-[#C0DDD6] dark:border-slate-800 text-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymethod"
                    checked={paymentMethod === 'WALLET_DEPOSIT'}
                    onChange={() => setPaymentMethod('WALLET_DEPOSIT')}
                    className="mt-0.5 text-emerald-600"
                  />
                  <div>
                    <span className="font-bold block text-xs">Potong Saldo Deposit Dompet Agen</span>
                    <span className="text-[11px] text-slate-500">
                      Saldo tersedia: <strong>Rp {selectedWallet.current_balance.toLocaleString('id-ID')}</strong> (Langsung Terbit Kuitansi Otomatis)
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                    paymentMethod === 'BANK_TRANSFER'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-slate-900 dark:text-white'
                      : 'bg-[#F4F8F7] dark:bg-slate-950 border-[#C0DDD6] dark:border-slate-800 text-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymethod"
                    checked={paymentMethod === 'BANK_TRANSFER'}
                    onChange={() => setPaymentMethod('BANK_TRANSFER')}
                    className="mt-0.5 text-emerald-600"
                  />
                  <div>
                    <span className="font-bold block text-xs">Bayar via Transfer Virtual Account (BSI VA)</span>
                    <span className="text-[11px] text-slate-500">
                      Jamaah/Agen transfer ke Virtual Account Bank Syariah Indonesia biro
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              Proses Pembayaran Booking Jamaah
            </button>
          </form>
        </div>

        {/* Ledger Mutasi Dompet */}
        <div className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2 border-b border-[#C0DDD6] dark:border-slate-800 pb-3">
            <History className="w-4 h-4 text-cyan-600" />
            Riwayat Mutasi Saldo Dompet Agen
          </h4>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {mutations.map((m) => (
              <div key={m.mutation_id} className="p-3 rounded-xl bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between items-start">
                  <span
                    className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded ${
                      m.mutation_type === 'TOPUP_DEPOSIT'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {m.mutation_type}
                  </span>
                  <span
                    className={`font-mono font-bold text-xs ${
                      m.mutation_type === 'TOPUP_DEPOSIT' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {m.mutation_type === 'TOPUP_DEPOSIT' ? '+' : '-'} Rp {m.amount.toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">{m.notes}</p>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-[#C0DDD6]/60 dark:border-slate-800 font-mono">
                  <span>Ref: {m.reference_no}</span>
                  <span>Saldo Sisa: Rp {m.balance_after.toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL 1: FORM TAMBAH DOMPET AGEN BARU (MAKER) */}
      {showAddWalletModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#C0DDD6] dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Tambah &amp; Registrasi Dompet Agen Baru (Maker)
              </h3>
              <button onClick={() => setShowAddWalletModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgentWallet} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">
                    Kode ID Agen <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAgentCode}
                    onChange={(e) => setNewAgentCode(e.target.value)}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">
                    Cabang Afiliasi <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newAgentBranch}
                    onChange={(e) => setNewAgentBranch(e.target.value)}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 font-semibold"
                  >
                    <option value="C00">C00 - Pusat Jakarta (HQ)</option>
                    <option value="C01">C01 - Cabang Kediri (KSO)</option>
                    <option value="C02">C02 - Sub-Cabang Blitar (Sub KSO)</option>
                    <option value="C03">C03 - Cabang Surabaya (Mandiri)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">
                  Nama Lengkap Agen / Tokoh Mitra <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: KH. Abdullah Gymnastiar (Mitra Prioritas)"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">
                    No. Virtual Account BSI <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAgentVa}
                    onChange={(e) => setNewAgentVa(e.target.value)}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">
                    No. WhatsApp Agen
                  </label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={newAgentPhone}
                    onChange={(e) => setNewAgentPhone(e.target.value)}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">
                  Komitmen Saldo Deposit Awal (Rp)
                </label>
                <input
                  type="number"
                  value={newInitialDeposit}
                  onChange={(e) => setNewInitialDeposit(Number(e.target.value))}
                  className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-emerald-600 text-sm"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  *Saldo awal akan disuntikkan setelah akun di-release oleh Direksi.
                </span>
              </div>

              <div>
                <PopupCalendar
                  label="Tanggal Registrasi Akun"
                  required={true}
                  value={newRegDate}
                  onChange={(val) => setNewRegDate(val)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#C0DDD6] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddWalletModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Pendaftaran (DRAFT_MAKER)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FORM AJUKAN TOP-UP SALDO (MAKER) */}
      {showTopupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#C0DDD6] dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Pengajuan Top-Up Saldo Deposit Agen (Maker Stage)
              </h3>
              <button onClick={() => setShowTopupModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTopupRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">
                  Pilih Dompet Agen Penerima <span className="text-rose-500">*</span>
                </label>
                <select
                  value={topupWalletId}
                  onChange={(e) => setTopupWalletId(e.target.value)}
                  className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium"
                >
                  {walletList.map((w) => (
                    <option key={w.wallet_id} value={w.wallet_id}>
                      {w.agent_name} ({w.branch_id}) - Saldo Kini: Rp {w.current_balance.toLocaleString('id-ID')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">
                  Nominal Top-Up (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="500000"
                  value={topupAmountInput}
                  onChange={(e) => setTopupAmountInput(Number(e.target.value))}
                  className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold text-sm text-emerald-600"
                />
              </div>

              <div>
                <PopupCalendar
                  label="Tanggal Setoran / Mutasi Bank"
                  required={true}
                  value={topupDateInput}
                  onChange={(val) => setTopupDateInput(val)}
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">
                  Keterangan / Berita Transfer Bank
                </label>
                <input
                  type="text"
                  value={topupNotesInput}
                  onChange={(e) => setTopupNotesInput(e.target.value)}
                  placeholder="Contoh: Bukti setoran teller BSI No. Ref 9821820"
                  className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#C0DDD6] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTopupModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Ajukan Top-Up (DRAFT_MAKER)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW DETAIL DOMPET AGEN */}
      {viewWalletDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#C0DDD6] dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Detail Dompet: {viewWalletDetail.agent_name}
              </h3>
              <button
                type="button"
                onClick={() => setViewWalletDetail(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[11px]">Kode ID Agen</span>
                  <strong className="font-mono text-purple-700 dark:text-purple-400 text-sm">{viewWalletDetail.agent_user_id}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Cabang Afiliasi</span>
                  <strong className="font-mono text-cyan-700 dark:text-cyan-400 text-sm">{viewWalletDetail.branch_id}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Nomor VA BSI</span>
                  <strong className="font-mono text-slate-900 dark:text-white">{viewWalletDetail.account_number_bsi}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Saldo Deposit Aktif</span>
                  <strong className="font-mono text-emerald-700 dark:text-emerald-400 text-sm">
                    Rp {viewWalletDetail.current_balance.toLocaleString('id-ID')}
                  </strong>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-[#C0DDD6] dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">Jejak Otorisasi RBAC:</span>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Tahap Terakhir:</span>
                  <span className="font-bold font-mono text-emerald-600">{viewWalletDetail.workflow_stage}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Maker:</span>
                  <span className="font-medium">{viewWalletDetail.maker_name || 'Staf Input'}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Approver:</span>
                  <span className="font-medium">{viewWalletDetail.approver_name || 'Finance'}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Releaser:</span>
                  <span className="font-medium">{viewWalletDetail.releaser_name || 'Direksi HQ'}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewWalletDetail(null)}
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
