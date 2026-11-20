import React, { useState, useMemo } from 'react';
import {
  Users,
  Briefcase,
  TrendingUp,
  DollarSign,
  Plus,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  RefreshCw,
  Search,
  Filter,
  Layers,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Eye,
  X,
  FileSpreadsheet,
  Kanban,
  List,
  Target,
  Award,
  ChevronRight,
  BadgePercent,
} from 'lucide-react';
import {
  SalesLead,
  B2BProviderOrder,
  HajjPortion,
  RoleCode,
  AgentCommissionSetting,
} from '../../../types/erp';
import { CollapsibleCard } from '../../common/CollapsibleCard.tsx';
import { PopupCalendar } from '../../common/PopupCalendar.tsx';
import { ResizableTh, useResizableColumns } from '../../common/ResizableTable.tsx';
import { mockAgentCommissionSettings } from '../../../data/mockDataFase7.ts';

interface SalesCrmAndB2BTabProps {
  salesLeads: SalesLead[];
  b2bOrders: B2BProviderOrder[];
  hajjPortions: HajjPortion[];
  currentRole: RoleCode;
  currentUserId: string;
  currentBranchCode: string;
  onUpdateLeadStage: (leadId: string, newStage: SalesLead['pipeline_stage']) => void;
  onAddSalesLead: (lead: Omit<SalesLead, 'lead_id' | 'total_potential_revenue' | 'created_at'>) => void;
  onGenerateB2bJournal: (orderId: string) => void;
  onAddB2bOrder: (order: Omit<B2BProviderOrder, 'order_id' | 'total_amount_usd' | 'total_amount_idr' | 'created_at'>) => void;
  onRevalueHajjCurrency: (newRate: number) => void;
}

export const SalesCrmAndB2BTab: React.FC<SalesCrmAndB2BTabProps> = ({
  salesLeads,
  b2bOrders,
  hajjPortions,
  currentRole,
  currentUserId,
  currentBranchCode,
  onUpdateLeadStage,
  onAddSalesLead,
  onGenerateB2bJournal,
  onAddB2bOrder,
  onRevalueHajjCurrency,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'CRM_KANBAN' | 'B2B_WHOLESALE' | 'HAJJ_PORTIONS'>('CRM_KANBAN');
  const [crmViewMode, setCrmViewMode] = useState<'KANBAN' | 'LIST'>('LIST');
  const [rlsFilterMode, setRlsFilterMode] = useState<'ALL_HQ' | 'MY_LEADS_ONLY'>(
    ['INTERNAL_SALES', 'BRANCH_AGENT'].includes(currentRole) ? 'MY_LEADS_ONLY' : 'ALL_HQ'
  );

  // Search & Filter for CRM List
  const [crmSearch, setCrmSearch] = useState('');
  const [crmStageFilter, setCrmStageFilter] = useState<string>('ALL');

  // Modals
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showAddB2bModal, setShowAddB2bModal] = useState(false);
  const [viewLeadDetail, setViewLeadDetail] = useState<SalesLead | null>(null);

  // Available Sales Reps by Branch
  const salesRepresentatives = [
    { id: 'USR-SALES-01', name: 'Rizky Alamsyah', branch: 'BRANCH-JKT-HQ', branchType: 'HQ' as const, label: 'Rizky Alamsyah (Sales HQ Pusat)' },
    { id: 'USR-SALES-04', name: 'Fahmi Prasetyo', branch: 'BRANCH-JKT-HQ', branchType: 'HQ' as const, label: 'Fahmi Prasetyo (Sales HQ Pusat)' },
    { id: 'USR-SALES-05', name: 'Budi Santoso', branch: 'BRANCH-SUB-01', branchType: 'MANDIRI' as const, label: 'Budi Santoso (Sales Mandiri Surabaya)' },
    { id: 'USR-SALES-06', name: 'Ahmad Fauzi', branch: 'BRANCH-KDR-01', branchType: 'KSO' as const, label: 'Ahmad Fauzi (Sales KSO Kediri)' },
    { id: 'USR-SALES-07', name: 'Sri Rahayu', branch: 'BRANCH-BLT-01', branchType: 'SUB_KSO' as const, label: 'Sri Rahayu (Sales Sub-KSO Blitar)' },
  ];

  // New Lead Form State
  const [newLeadForm, setNewLeadForm] = useState({
    registration_date: '2026-10-11',
    lead_name: '',
    phone_number: '',
    email: '',
    city: 'Jakarta Selatan',
    interested_package_type: 'Umrah Ramadhan Lailatul Qadar 16 Hari (Bintang 5)',
    estimated_pax: 2,
    estimated_budget_per_pax: 35000000,
    pipeline_stage: 'NEW_LEAD' as SalesLead['pipeline_stage'],
    sales_rep_id: 'USR-SALES-01',
    followup_count: 1,
    followup_result: 'Follow up awal: Prospek meminta brosur paket dan konfirmasi jadwal manasik.',
    agent_name: '',
    agent_commission_tier: 'TIER_GOLD',
    notes: '',
    next_follow_up_date: '2026-10-18',
  });

  // New B2B Order Form State
  const [newB2bForm, setNewB2bForm] = useState({
    order_number: `B2B/ORD/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
    buyer_travel_name: '',
    buyer_pic_name: '',
    buyer_phone: '',
    buyer_email: '',
    order_type: 'VISA_ONLY' as B2BProviderOrder['order_type'],
    qty_pax: 20,
    unit_price_usd: 215,
    exchange_rate: 16250,
    muasasah_provider_name: 'DALLAH_VISA_SAUDI',
    visa_approval_code: '',
    target_departure_date: '2026-11-01',
    payment_status: 'UNPAID' as B2BProviderOrder['payment_status'],
    paid_amount_idr: 0,
  });

  // Hajj Revaluation Currency State
  const [newBiRate, setNewBiRate] = useState<number>(16400);

  // Resizable table columns: CRM Leads List (registration_date is FIRST column)
  type LeadCol = 'regDate' | 'name' | 'sales' | 'package' | 'pax' | 'revenue' | 'stage' | 'followup' | 'agent' | 'actions';
  const leadCols = useResizableColumns<LeadCol>({
    regDate: 140,
    name: 200,
    sales: 170,
    package: 220,
    pax: 75,
    revenue: 150,
    stage: 150,
    followup: 240,
    agent: 170,
    actions: 90,
  });

  // Resizable table columns: B2B
  type B2bCol = 'order' | 'type' | 'pax' | 'total' | 'muasasah' | 'status' | 'actions';
  const b2bCols = useResizableColumns<B2bCol>({
    order: 220,
    type: 140,
    pax: 130,
    total: 180,
    muasasah: 180,
    status: 140,
    actions: 130,
  });

  // Filter Leads based on simulated RLS & search
  const visibleLeads = useMemo(() => {
    return salesLeads.filter((lead) => {
      if (rlsFilterMode === 'MY_LEADS_ONLY') {
        const isMine = lead.sales_user_id === currentUserId || lead.sales_user_id === 'USR-SALES-01';
        if (!isMine) return false;
      }
      const searchLow = crmSearch.toLowerCase();
      const matchesSearch =
        lead.lead_name.toLowerCase().includes(searchLow) ||
        (lead.phone_number || '').includes(searchLow) ||
        (lead.city || '').toLowerCase().includes(searchLow) ||
        (lead.sales_user_name || '').toLowerCase().includes(searchLow) ||
        (lead.interested_package_type || '').toLowerCase().includes(searchLow);
      const matchesStage = crmStageFilter === 'ALL' ? true : lead.pipeline_stage === crmStageFilter;
      return matchesSearch && matchesStage;
    });
  }, [salesLeads, rlsFilterMode, currentUserId, crmSearch, crmStageFilter]);

  // Format IDR & USD
  const formatIdr = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  const formatUsd = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // Pipeline summary
  const totalPipelineRevenue = visibleLeads.reduce((acc, lead) => acc + lead.total_potential_revenue, 0);
  const totalLeadsCount = visibleLeads.length;
  const wonLeadsCount = visibleLeads.filter((l) => l.pipeline_stage === 'WON_BOOKED').length;

  // B2B Summary
  const totalB2bUsd = b2bOrders.reduce((acc, o) => acc + o.total_amount_usd, 0);
  const totalB2bIdr = b2bOrders.reduce((acc, o) => acc + o.total_amount_idr, 0);

  // Hajj Summary
  const totalHajjUsdDeposit = hajjPortions.reduce((acc, p) => acc + p.bpih_deposit_usd, 0);
  const totalUnrealizedGainLoss = hajjPortions.reduce((acc, p) => acc + p.unrealized_gain_loss, 0);

  // Stages configuration for Kanban & Badges
  const kanbanStages: { id: SalesLead['pipeline_stage']; label: string; color: string; badge: string }[] = [
    { id: 'NEW_LEAD', label: 'Prospek Baru', color: 'border-slate-500/50 bg-slate-900/40', badge: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200' },
    { id: 'FOLLOW_UP_1', label: 'Follow Up #1', color: 'border-blue-500/50 bg-blue-950/20', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300' },
    { id: 'FOLLOW_UP_2', label: 'Follow Up #2 (Konsultasi)', color: 'border-indigo-500/50 bg-indigo-950/20', badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300' },
    { id: 'QUOTATION_SENT', label: 'Penawaran & RAB Terkirim', color: 'border-amber-500/50 bg-amber-950/20', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300' },
    { id: 'WON_BOOKED', label: 'Deal / Terdaftar (Booking)', color: 'border-emerald-500/50 bg-emerald-950/20', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' },
    { id: 'LOST', label: 'Batal / Closed Lost', color: 'border-rose-500/50 bg-rose-950/20', badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300' },
  ];

  const getStageBadge = (stage: SalesLead['pipeline_stage']) => {
    const s = kanbanStages.find((k) => k.id === stage);
    return s ? s.badge : 'bg-slate-100 text-slate-700';
  };

  const getStageLabel = (stage: SalesLead['pipeline_stage']) => {
    const s = kanbanStages.find((k) => k.id === stage);
    return s ? s.label : stage;
  };

  // C-LEVEL EXECUTIVE SALES STATS (Grouped by HQ, Mandiri, KSO, Sub-KSO)
  const salesPerformanceData = useMemo(() => {
    return salesRepresentatives.map((rep) => {
      const repLeads = salesLeads.filter(
        (l) => l.sales_user_id === rep.id || l.sales_user_name?.toLowerCase().includes(rep.name.toLowerCase())
      );
      const totalLeads = repLeads.length;
      const stageCounts = {
        new: repLeads.filter((l) => l.pipeline_stage === 'NEW_LEAD').length,
        follow1: repLeads.filter((l) => l.pipeline_stage === 'FOLLOW_UP_1').length,
        follow2: repLeads.filter((l) => l.pipeline_stage === 'FOLLOW_UP_2').length,
        quotation: repLeads.filter((l) => l.pipeline_stage === 'QUOTATION_SENT').length,
        won: repLeads.filter((l) => l.pipeline_stage === 'WON_BOOKED').length,
        lost: repLeads.filter((l) => l.pipeline_stage === 'LOST').length,
      };
      const totalPax = repLeads.reduce((acc, l) => acc + (l.estimated_pax || 0), 0);
      const totalPotential = repLeads.reduce((acc, l) => acc + (l.total_potential_revenue || 0), 0);
      const winRate = totalLeads > 0 ? Math.round((stageCounts.won / totalLeads) * 100) : 0;

      return {
        ...rep,
        totalLeads,
        stageCounts,
        totalPax,
        totalPotential,
        winRate,
      };
    });
  }, [salesLeads, salesRepresentatives]);

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    const rep = salesRepresentatives.find((r) => r.id === newLeadForm.sales_rep_id) || salesRepresentatives[0];
    const tierSetting = mockAgentCommissionSettings.find((t) => t.tier_code === newLeadForm.agent_commission_tier);
    const commPerPax = tierSetting ? tierSetting.commission_per_pax_idr : 1500000;
    const estimatedComm = newLeadForm.agent_name ? Number(newLeadForm.estimated_pax) * commPerPax : 0;

    onAddSalesLead({
      branch_id: rep.branch,
      sales_user_id: rep.id,
      sales_user_name: rep.name,
      branch_type: rep.branchType,
      lead_name: newLeadForm.lead_name,
      phone_number: newLeadForm.phone_number,
      email: newLeadForm.email,
      city: newLeadForm.city,
      interested_package_type: newLeadForm.interested_package_type,
      estimated_pax: Number(newLeadForm.estimated_pax),
      estimated_budget_per_pax: Number(newLeadForm.estimated_budget_per_pax),
      pipeline_stage: newLeadForm.pipeline_stage,
      registration_date: newLeadForm.registration_date,
      followup_count: Number(newLeadForm.followup_count),
      followup_result: newLeadForm.followup_result,
      agent_name: newLeadForm.agent_name || undefined,
      agent_commission_tier: newLeadForm.agent_commission_tier,
      estimated_agent_commission: estimatedComm,
      notes: newLeadForm.notes,
      next_follow_up_date: newLeadForm.next_follow_up_date,
    });
    setShowAddLeadModal(false);
  };

  const handleCreateB2bOrder = (e: React.FormEvent) => {
    e.preventDefault();
    onAddB2bOrder({
      owner_branch_id: currentBranchCode,
      order_number: newB2bForm.order_number,
      buyer_travel_name: newB2bForm.buyer_travel_name,
      buyer_pic_name: newB2bForm.buyer_pic_name,
      buyer_phone: newB2bForm.buyer_phone,
      buyer_email: newB2bForm.buyer_email,
      order_type: newB2bForm.order_type,
      qty_pax: Number(newB2bForm.qty_pax),
      unit_price_usd: Number(newB2bForm.unit_price_usd),
      exchange_rate: Number(newB2bForm.exchange_rate),
      muasasah_provider_name: newB2bForm.muasasah_provider_name,
      visa_approval_code: newB2bForm.visa_approval_code || undefined,
      target_departure_date: newB2bForm.target_departure_date,
      payment_status: newB2bForm.payment_status,
      paid_amount_idr: Number(newB2bForm.paid_amount_idr),
      created_by_user: currentUserId,
    });
    setShowAddB2bModal(false);
  };

  return (
    <div className="space-y-6 text-sm">
      {/* Top Banner KPI Card (Collapsible) */}
      <CollapsibleCard
        title="Ringkasan Performa CRM, B2B Wholesale & Valas Haji"
        subtitle="Metrik pipeline prospek jemaah, omset grosir visa B2B, dan setoran porsi BPIH Kemenag"
        icon={TrendingUp}
        defaultOpen={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">Total Prospek Calon Jamaah</span>
            <div className="text-xl font-black text-slate-900 dark:text-white flex items-center justify-between">
              <span>{totalLeadsCount} Leads</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                {wonLeadsCount} Deal Won
              </span>
            </div>
            <div className="text-xs text-slate-500">Estimasi Nilai Pipeline: <strong>{formatIdr(totalPipelineRevenue)}</strong></div>
          </div>

          <div className="bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">Penjualan Wholesale B2B</span>
            <div className="text-xl font-black text-blue-700 dark:text-blue-400">
              {formatUsd(totalB2bUsd)}
            </div>
            <div className="text-xs text-slate-500">
              Setara {formatIdr(totalB2bIdr)} ({b2bOrders.length} Order Agen)
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">Deposit Valas Haji (BPIH)</span>
            <div className="text-xl font-black text-amber-700 dark:text-amber-400">
              {formatUsd(totalHajjUsdDeposit)}
            </div>
            <div className="text-xs text-slate-500">
              {hajjPortions.length} Jamaah Terdaftar Porsi Kemenag
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">Unrealized FX Gain/Loss Valas</span>
            <div className={`text-xl font-black ${totalUnrealizedGainLoss >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'}`}>
              {totalUnrealizedGainLoss >= 0 ? '+' : ''}{formatIdr(totalUnrealizedGainLoss)}
            </div>
            <div className="text-xs text-slate-500">
              Selisih Kurs Booking vs Kurs Acuan BI
            </div>
          </div>
        </div>
      </CollapsibleCard>

      {/* C-LEVEL EXECUTIVE REPORT: TOTAL PROSPEK & PROGRES CALON JAMAAH TIAP SALES (HQ, MANDIRI, KSO & SUB-KSO) */}
      <CollapsibleCard
        title="Ringkasan Eksekutif C-Level: Prospek & Progres Tiap Sales (HQ, Mandiri, KSO & Sub-KSO)"
        subtitle="Monitoring ketercapaian target calon jamaah, sebaran tahap pipeline, kuota pax, dan win rate tiap tenaga pemasar biro"
        icon={Target}
        defaultOpen={true}
        headerRight={
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
            Akses Direksi &amp; Owner C-Level
          </span>
        }
      >
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-[#C0DDD6] dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#EBF5F3] dark:bg-slate-950 text-[#1E4E46] dark:text-slate-200 border-b border-[#C0DDD6] dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3.5 font-bold">Tenaga Sales</th>
                  <th className="py-3 px-3 font-semibold">Tipe Cabang</th>
                  <th className="py-3 px-2.5 text-center font-bold">Total Prospek</th>
                  <th className="py-3 px-2 text-center text-slate-600 font-medium">Baru</th>
                  <th className="py-3 px-2 text-center text-blue-600 font-medium">Follow 1</th>
                  <th className="py-3 px-2 text-center text-indigo-600 font-medium">Follow 2</th>
                  <th className="py-3 px-2 text-center text-amber-600 font-medium">Penawaran</th>
                  <th className="py-3 px-2 text-center text-emerald-600 font-bold">Closing Won</th>
                  <th className="py-3 px-2 text-center text-rose-600 font-medium">Lost</th>
                  <th className="py-3 px-3 text-center font-bold">Total Pax</th>
                  <th className="py-3 px-3.5 text-right font-bold">Potensi Omset</th>
                  <th className="py-3 px-3 text-center font-bold">Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C0DDD6]/60 dark:divide-slate-800 font-mono">
                {salesPerformanceData.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="py-2.5 px-3.5 font-sans font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{rep.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          rep.branchType === 'HQ'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : rep.branchType === 'MANDIRI'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : rep.branchType === 'KSO'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {rep.branchType === 'HQ'
                          ? 'HQ Pusat'
                          : rep.branchType === 'MANDIRI'
                          ? 'Cabang Mandiri'
                          : rep.branchType === 'KSO'
                          ? 'Cabang KSO'
                          : 'Sub-KSO'}
                      </span>
                    </td>
                    <td className="py-2.5 px-2.5 text-center font-bold text-slate-900 dark:text-white">
                      {rep.totalLeads}
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-600">{rep.stageCounts.new}</td>
                    <td className="py-2.5 px-2 text-center text-blue-600 font-semibold">{rep.stageCounts.follow1}</td>
                    <td className="py-2.5 px-2 text-center text-indigo-600 font-semibold">{rep.stageCounts.follow2}</td>
                    <td className="py-2.5 px-2 text-center text-amber-600 font-semibold">{rep.stageCounts.quotation}</td>
                    <td className="py-2.5 px-2 text-center text-emerald-600 font-bold bg-emerald-50/50 dark:bg-emerald-950/20">
                      {rep.stageCounts.won}
                    </td>
                    <td className="py-2.5 px-2 text-center text-rose-500">{rep.stageCounts.lost}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                      {rep.totalPax} Pax
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-bold text-emerald-700 dark:text-emerald-400">
                      {formatIdr(rep.totalPotential)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{rep.winRate}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#EBF5F3] dark:bg-slate-950 border-t border-[#C0DDD6] dark:border-slate-800 font-bold">
                <tr>
                  <td colSpan={2} className="py-2.5 px-3.5 text-slate-700 dark:text-slate-300 font-sans">
                    TOTAL KONSOLIDASI SELURUH CABANG:
                  </td>
                  <td className="py-2.5 px-2.5 text-center text-slate-900 dark:text-white font-mono">
                    {salesPerformanceData.reduce((acc, r) => acc + r.totalLeads, 0)} Leads
                  </td>
                  <td colSpan={6}></td>
                  <td className="py-2.5 px-3 text-center font-mono">
                    {salesPerformanceData.reduce((acc, r) => acc + r.totalPax, 0)} Pax
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-mono text-emerald-700 dark:text-emerald-400">
                    {formatIdr(salesPerformanceData.reduce((acc, r) => acc + r.totalPotential, 0))}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </CollapsibleCard>

      {/* Sub Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#C0DDD6] dark:border-slate-800 pb-3 gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('CRM_KANBAN')}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeSubTab === 'CRM_KANBAN'
                ? 'bg-[#98C3BC] text-[#13302B] dark:bg-emerald-600 dark:text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-[#C0DDD6] dark:border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pre-Trip Sales Pipeline CRM</span>
            <span className="bg-[#C0DDD6]/60 dark:bg-emerald-950 text-[#1E4E46] dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {salesLeads.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('B2B_WHOLESALE')}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeSubTab === 'B2B_WHOLESALE'
                ? 'bg-[#98C3BC] text-[#13302B] dark:bg-blue-600 dark:text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-[#C0DDD6] dark:border-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>B2B Provider Visa &amp; LA Wholesale</span>
            <span className="bg-[#C0DDD6]/60 dark:bg-blue-950 text-[#1E4E46] dark:text-blue-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {b2bOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('HAJJ_PORTIONS')}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeSubTab === 'HAJJ_PORTIONS'
                ? 'bg-[#98C3BC] text-[#13302B] dark:bg-amber-600 dark:text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-[#C0DDD6] dark:border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Antrean Haji Khusus &amp; Revaluasi Valas</span>
            <span className="bg-[#C0DDD6]/60 dark:bg-amber-950 text-[#1E4E46] dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {hajjPortions.length}
            </span>
          </button>
        </div>

        {/* Action Button depending on subtab */}
        {activeSubTab === 'CRM_KANBAN' && (
          <div className="flex items-center gap-2">
            {/* View Mode Switcher: List vs Kanban */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => setCrmViewMode('LIST')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  crmViewMode === 'LIST'
                    ? 'bg-[#98C3BC] text-[#13302B] dark:bg-emerald-600 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Tabel List (Daftar Pipeline CRM)"
              >
                <List className="w-4 h-4" />
                <span>Tabel List (Standar)</span>
              </button>
              <button
                type="button"
                onClick={() => setCrmViewMode('KANBAN')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  crmViewMode === 'KANBAN'
                    ? 'bg-[#98C3BC] text-[#13302B] dark:bg-emerald-600 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Papan Kanban"
              >
                <Kanban className="w-4 h-4" />
                <span>Kanban</span>
              </button>
            </div>

            <button
              onClick={() => setShowAddLeadModal(true)}
              className="px-4 py-2 bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Prospek Lead (CRM)</span>
            </button>
          </div>
        )}

        {activeSubTab === 'B2B_WHOLESALE' && (
          <button
            onClick={() => setShowAddB2bModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Order Wholesale Baru</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: CRM PIPELINE (LIST TABLE & KANBAN) */}
      {/* ========================================================================= */}
      {activeSubTab === 'CRM_KANBAN' && (
        <div className="space-y-4">
          {/* Tampilan Tabel List (Default / Requested) */}
          {crmViewMode === 'LIST' && (
            <CollapsibleCard
              title={`Daftar Pipeline Prospek CRM (${visibleLeads.length} Prospek Terdata)`}
              subtitle="Tabel dinamis dengan kolom resizable, tanggal pendaftaran di awal kolom, nama sales PIC, progress follow-up & hasil, serta komisi agen"
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
                    value={crmStageFilter}
                    onChange={(e) => setCrmStageFilter(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="ALL">Semua Tahapan</option>
                    {kanbanStages.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={crmSearch}
                    onChange={(e) => setCrmSearch(e.target.value)}
                    placeholder="Cari prospek, telepon, sales, paket..."
                    className="w-full bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
                  />
                </div>
              </div>

              {/* Resizable Table: Pipeline CRM */}
              <div className="overflow-x-auto rounded-xl border border-[#C0DDD6] dark:border-slate-800">
                <table className="w-full text-left border-collapse min-w-[1100px]">
                  <thead>
                    <tr className="bg-[#EBF5F3] dark:bg-slate-950 text-[#1E4E46] dark:text-slate-200 border-b border-[#C0DDD6] dark:border-slate-800">
                      {/* Kolom 1: Tanggal Pendaftaran di awal kolom sesuai permintaan */}
                      <ResizableTh width={leadCols.widths.regDate} onResize={(e) => leadCols.startResize('regDate', e)}>
                        Tgl Pendaftaran
                      </ResizableTh>
                      <ResizableTh width={leadCols.widths.name} onResize={(e) => leadCols.startResize('name', e)}>
                        Nama Calon Jamaah
                      </ResizableTh>
                      <ResizableTh width={leadCols.widths.sales} onResize={(e) => leadCols.startResize('sales', e)}>
                        Sales PIC
                      </ResizableTh>
                      <ResizableTh width={leadCols.widths.package} onResize={(e) => leadCols.startResize('package', e)}>
                        Paket Diminati
                      </ResizableTh>
                      <ResizableTh width={leadCols.widths.pax} onResize={(e) => leadCols.startResize('pax', e)} align="center">
                        Pax
                      </ResizableTh>
                      <ResizableTh width={leadCols.widths.revenue} onResize={(e) => leadCols.startResize('revenue', e)}>
                        Potensi Nilai
                      </ResizableTh>
                      <ResizableTh width={leadCols.widths.stage} onResize={(e) => leadCols.startResize('stage', e)}>
                        Tahapan Pipeline
                      </ResizableTh>
                      <ResizableTh width={leadCols.widths.followup} onResize={(e) => leadCols.startResize('followup', e)}>
                        Progress Follow-Up &amp; Hasil
                      </ResizableTh>
                      <ResizableTh width={leadCols.widths.agent} onResize={(e) => leadCols.startResize('agent', e)}>
                        Agen &amp; Komisi
                      </ResizableTh>
                      <ResizableTh width={leadCols.widths.actions} onResize={(e) => leadCols.startResize('actions', e)} align="center">
                        Aksi
                      </ResizableTh>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C0DDD6]/60 dark:divide-slate-800/80 text-xs">
                    {visibleLeads.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-slate-400">
                          Tidak ada prospek lead yang sesuai kriteria pencarian.
                        </td>
                      </tr>
                    ) : (
                      visibleLeads.map((lead) => (
                        <tr
                          key={lead.lead_id}
                          onClick={() => setViewLeadDetail(lead)}
                          className="hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                        >
                          {/* 1. Tanggal Pendaftaran */}
                          <td className="px-3.5 py-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                            {lead.registration_date || lead.created_at?.split(' ')[0] || '2026-03-20'}
                          </td>

                          {/* 2. Nama Calon Jamaah */}
                          <td className="px-3.5 py-3 font-semibold text-slate-900 dark:text-white">
                            <div>{lead.lead_name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{lead.phone_number} • {lead.city}</div>
                          </td>

                          {/* 3. Sales PIC */}
                          <td className="px-3.5 py-3 text-slate-700 dark:text-slate-300">
                            <div className="font-semibold">{lead.sales_user_name}</div>
                            <span className="text-[10px] text-slate-500">
                              {lead.branch_type ? `[${lead.branch_type}]` : '[HQ]'}
                            </span>
                          </td>

                          {/* 4. Paket */}
                          <td className="px-3.5 py-3 text-slate-600 dark:text-slate-400">
                            <div className="truncate max-w-[210px]" title={lead.interested_package_type}>
                              {lead.interested_package_type}
                            </div>
                          </td>

                          {/* 5. Pax */}
                          <td className="px-3.5 py-3 text-center font-bold text-slate-900 dark:text-white">
                            {lead.estimated_pax}
                          </td>

                          {/* 6. Potensi Nilai */}
                          <td className="px-3.5 py-3 font-semibold text-emerald-700 dark:text-emerald-400 font-mono">
                            {formatIdr(lead.total_potential_revenue)}
                          </td>

                          {/* 7. Tahapan */}
                          <td className="px-3.5 py-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStageBadge(lead.pipeline_stage)}`}>
                              {getStageLabel(lead.pipeline_stage)}
                            </span>
                          </td>

                          {/* 8. Progress Follow-Up & Hasil */}
                          <td className="px-3.5 py-3 text-slate-700 dark:text-slate-300">
                            <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                              <span className="bg-[#98C3BC]/30 dark:bg-emerald-950 px-1.5 py-0.5 rounded text-[10px]">
                                Ke-{lead.followup_count || 1}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5" title={lead.followup_result}>
                              {lead.followup_result || 'Follow up berkala via WhatsApp & telpon.'}
                            </p>
                          </td>

                          {/* 9. Agen & Komisi */}
                          <td className="px-3.5 py-3 text-slate-600 dark:text-slate-400 text-[11px]">
                            {lead.agent_name ? (
                              <div>
                                <span className="font-semibold text-slate-900 dark:text-white block">{lead.agent_name}</span>
                                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-[10px]">
                                  {lead.estimated_agent_commission ? formatIdr(lead.estimated_agent_commission) : 'Tier Komisi'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Direct Sales</span>
                            )}
                          </td>

                          {/* 10. Aksi */}
                          <td
                            className="px-3.5 py-3 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => setViewLeadDetail(lead)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-slate-800 dark:text-white flex items-center gap-1 mx-auto"
                            >
                              <Eye className="w-3.5 h-3.5" />
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

          {/* Tampilan Kanban Board */}
          {crmViewMode === 'KANBAN' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 overflow-x-auto min-h-[550px] pb-4">
              {kanbanStages.map((stage) => {
                const stageLeads = visibleLeads.filter((l) => l.pipeline_stage === stage.id);
                const stagePotential = stageLeads.reduce((acc, l) => acc + l.total_potential_revenue, 0);

                return (
                  <div
                    key={stage.id}
                    className={`flex flex-col rounded-2xl border p-3 min-w-[240px] ${stage.color} backdrop-blur-sm`}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#C0DDD6] dark:border-slate-800">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{stage.label}</span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${stage.badge}`}>
                        {stageLeads.length}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 mb-3 flex items-center justify-between">
                      <span>Estimasi:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{formatIdr(stagePotential)}</span>
                    </div>

                    {/* Cards */}
                    <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[500px] pr-1">
                      {stageLeads.length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-[#C0DDD6] dark:border-slate-800 rounded-xl">
                          Belum ada prospek
                        </div>
                      ) : (
                        stageLeads.map((lead) => (
                          <div
                            key={lead.lead_id}
                            onClick={() => setViewLeadDetail(lead)}
                            className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-700/80 hover:border-emerald-500 rounded-xl p-3 shadow-xs hover:shadow-md transition-all space-y-2 text-xs cursor-pointer group"
                          >
                            <div className="flex items-start justify-between">
                              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{lead.lead_name}</h4>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#C0DDD6]/40 text-[#1E4E46] dark:bg-slate-800 dark:text-emerald-400 rounded-md">
                                {lead.estimated_pax} Pax
                              </span>
                            </div>

                            <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                              {lead.interested_package_type}
                            </div>

                            <div className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">
                              {formatIdr(lead.total_potential_revenue)}
                            </div>

                            <div className="pt-1.5 border-t border-[#C0DDD6]/40 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                              <span>PIC: {lead.sales_user_name}</span>
                              <span>F/Up #{lead.followup_count || 1}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: B2B WHOLESALE ORDERS */}
      {/* ========================================================================= */}
      {activeSubTab === 'B2B_WHOLESALE' && (
        <CollapsibleCard
          title={`Daftar Transaksi Wholesale B2B Provider (${b2bOrders.length} Pesanan)`}
          subtitle="Penerbitan visa umrah, LA paket darat, dan invoicing antar-travel biro mitra"
          icon={Briefcase}
          defaultOpen={true}
        >
          <div className="overflow-x-auto rounded-xl border border-[#C0DDD6] dark:border-slate-800">
            <table className="w-full text-left border-collapse min-w-[900px] text-xs">
              <thead className="bg-[#EBF5F3] dark:bg-slate-950 text-[#1E4E46] dark:text-slate-200 border-b border-[#C0DDD6] dark:border-slate-800">
                <tr>
                  <ResizableTh width={b2bCols.widths.order} onResize={(e) => b2bCols.startResize('order', e)}>
                    No. Order / Travel Pembeli
                  </ResizableTh>
                  <ResizableTh width={b2bCols.widths.type} onResize={(e) => b2bCols.startResize('type', e)}>
                    Tipe Layanan
                  </ResizableTh>
                  <ResizableTh width={b2bCols.widths.pax} onResize={(e) => b2bCols.startResize('pax', e)} align="center">
                    Pax &amp; Harga Satuan
                  </ResizableTh>
                  <ResizableTh width={b2bCols.widths.total} onResize={(e) => b2bCols.startResize('total', e)}>
                    Total Nilai Invoice
                  </ResizableTh>
                  <ResizableTh width={b2bCols.widths.muasasah} onResize={(e) => b2bCols.startResize('muasasah', e)}>
                    Muasasah Saudi
                  </ResizableTh>
                  <ResizableTh width={b2bCols.widths.status} onResize={(e) => b2bCols.startResize('status', e)} align="center">
                    Status Pembayaran
                  </ResizableTh>
                  <ResizableTh width={b2bCols.widths.actions} onResize={(e) => b2bCols.startResize('actions', e)} align="center">
                    Jurnal Otomatis
                  </ResizableTh>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C0DDD6]/60 dark:divide-slate-800">
                {b2bOrders.map((ord) => (
                  <tr key={ord.order_id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="px-3.5 py-3">
                      <div className="font-mono font-bold text-slate-900 dark:text-white">{ord.order_number}</div>
                      <div className="font-medium text-slate-600 dark:text-slate-400">{ord.buyer_travel_name} (PIC: {ord.buyer_pic_name})</div>
                    </td>
                    <td className="px-3.5 py-3 font-semibold text-slate-700 dark:text-slate-300">
                      {ord.order_type}
                    </td>
                    <td className="px-3.5 py-3 text-center">
                      <span className="font-bold text-slate-900 dark:text-white">{ord.qty_pax} Pax</span>
                      <span className="block text-[11px] text-slate-500 font-mono">@{formatUsd(ord.unit_price_usd)}</span>
                    </td>
                    <td className="px-3.5 py-3">
                      <div className="font-bold font-mono text-blue-700 dark:text-blue-400">{formatUsd(ord.total_amount_usd)}</div>
                      <div className="text-[11px] text-slate-500 font-mono">≈ {formatIdr(ord.total_amount_idr)}</div>
                    </td>
                    <td className="px-3.5 py-3 text-slate-600 dark:text-slate-400">
                      {ord.muasasah_provider_name}
                    </td>
                    <td className="px-3.5 py-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.payment_status === 'PAID_SETTLED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {ord.payment_status}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => onGenerateB2bJournal(ord.order_id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-blue-600 dark:text-white"
                      >
                        Generate GL
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleCard>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: HAJJ PORTIONS & UNREALIZED FX */}
      {/* ========================================================================= */}
      {activeSubTab === 'HAJJ_PORTIONS' && (
        <CollapsibleCard
          title={`Antrean Porsi Haji Khusus & Revaluasi Kurs (${hajjPortions.length} Jamaah)`}
          subtitle="Simulasi PSAK revaluasi selisih kurs valas setoran BPIH USD terhadap kurs tengah BI"
          icon={Layers}
          defaultOpen={true}
          headerRight={
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Kurs BI:</span>
              <input
                type="number"
                value={newBiRate}
                onChange={(e) => setNewBiRate(Number(e.target.value))}
                className="w-24 bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-lg px-2 py-1 text-xs font-mono font-bold"
              />
              <button
                type="button"
                onClick={() => onRevalueHajjCurrency(newBiRate)}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-[#98C3BC] text-[#13302B] dark:bg-amber-600 dark:text-white"
              >
                Revaluasi
              </button>
            </div>
          }
        >
          <div className="overflow-x-auto rounded-xl border border-[#C0DDD6] dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#EBF5F3] dark:bg-slate-950 text-[#1E4E46] dark:text-slate-200 border-b border-[#C0DDD6] dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3.5 font-bold">Nama Jamaah Haji</th>
                  <th className="py-3 px-3.5 font-bold font-mono">No. Porsi Kemenag</th>
                  <th className="py-3 px-3 text-center">Tahun Estimasi</th>
                  <th className="py-3 px-3.5">Deposit USD</th>
                  <th className="py-3 px-3.5">Valuasi Kurs Kini</th>
                  <th className="py-3 px-3.5">Unrealized Gain/Loss</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C0DDD6]/60 dark:divide-slate-800">
                {hajjPortions.map((por) => (
                  <tr key={por.portion_id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="px-3.5 py-3 font-semibold text-slate-900 dark:text-white">{por.customer_name}</td>
                    <td className="px-3.5 py-3 font-mono font-bold text-amber-700 dark:text-amber-400">{por.porsi_number}</td>
                    <td className="px-3.5 py-3 text-center font-bold">{por.estimated_departure_year}</td>
                    <td className="px-3.5 py-3 font-mono font-bold">{formatUsd(por.bpih_deposit_usd)}</td>
                    <td className="px-3.5 py-3 font-mono text-slate-700 dark:text-slate-300">{formatIdr(por.current_idr_valuation)}</td>
                    <td className="px-3.5 py-3 font-mono font-bold">
                      <span className={por.unrealized_gain_loss >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'}>
                        {por.unrealized_gain_loss >= 0 ? '+' : ''}{formatIdr(por.unrealized_gain_loss)}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {por.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleCard>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW DETAIL PROSPEK CRM LEAD */}
      {/* ========================================================================= */}
      {viewLeadDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#C0DDD6] dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#C0DDD6]/40 dark:bg-emerald-950 text-[#1E4E46] dark:text-emerald-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Detail Prospek: {viewLeadDetail.lead_name}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Tgl Daftar: <strong>{viewLeadDetail.registration_date || '2026-03-20'}</strong> • Sales: {viewLeadDetail.sales_user_name}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewLeadDetail(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[11px]">Tanggal Pendaftaran</span>
                  <strong className="text-slate-900 dark:text-white text-xs font-mono">{viewLeadDetail.registration_date || '2026-03-20'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Telepon / WhatsApp</span>
                  <strong className="font-mono text-emerald-700 dark:text-emerald-400 text-xs">{viewLeadDetail.phone_number}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Kota Domisili</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{viewLeadDetail.city}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Sales Yang Menghandle</span>
                  <span className="font-bold text-slate-900 dark:text-white">{viewLeadDetail.sales_user_name}</span>
                </div>
              </div>

              {/* Progress Follow Up & Hasil */}
              <div className="p-3.5 rounded-xl border border-[#C0DDD6] dark:border-slate-800 space-y-2 bg-[#F4F8F7]/60 dark:bg-slate-950/60">
                <span className="font-bold text-[#1E4E46] dark:text-emerald-400 block text-xs">
                  Progress Pipeline &amp; Catatan Follow-Up:
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Follow-up Keberapa Kali:</span>
                  <span className="font-bold px-2 py-0.5 rounded-md bg-[#98C3BC] text-[#13302B] dark:bg-emerald-600 dark:text-white font-mono">
                    Follow-up Ke-{viewLeadDetail.followup_count || 1}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Hasil &amp; Respon Calon Jamaah:</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-[#C0DDD6] dark:border-slate-800">
                    {viewLeadDetail.followup_result || 'Calon jamaah merespon positif dan sedang mencocokkan jadwal libur keluarga.'}
                  </p>
                </div>
              </div>

              {/* Relasi Komisi Agen */}
              <div className="p-3.5 rounded-xl border border-[#C0DDD6] dark:border-slate-800 space-y-2">
                <span className="font-bold text-[#1E4E46] dark:text-emerald-400 block text-xs">
                  Relasi Mitra / Komisi Agen Perujuk:
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Nama Agen Afiliasi:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {viewLeadDetail.agent_name || 'Direct / Tanpa Agen'}
                  </span>
                </div>
                {viewLeadDetail.agent_name && (
                  <div className="flex items-center justify-between pt-1 border-t border-[#C0DDD6]/60 dark:border-slate-800">
                    <span className="text-slate-500">Estimasi Komisi Agen:</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {viewLeadDetail.estimated_agent_commission ? formatIdr(viewLeadDetail.estimated_agent_commission) : 'Rp 1.500.000 / pax'}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl border border-[#C0DDD6] dark:border-slate-800 space-y-2">
                <span className="font-bold text-[#1E4E46] dark:text-emerald-400 block text-xs">
                  Paket &amp; Estimasi Nilai Penjualan:
                </span>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {viewLeadDetail.interested_package_type} ({viewLeadDetail.estimated_pax} Pax)
                </p>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">Total Potensi Omset:</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                    {formatIdr(viewLeadDetail.total_potential_revenue)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#C0DDD6] dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400">Ubah Tahap:</span>
                <select
                  value={viewLeadDetail.pipeline_stage}
                  onChange={(e) => {
                    const newSt = e.target.value as SalesLead['pipeline_stage'];
                    onUpdateLeadStage(viewLeadDetail.lead_id, newSt);
                    setViewLeadDetail({ ...viewLeadDetail, pipeline_stage: newSt });
                  }}
                  className="bg-[#F4F8F7] dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-2 py-1 rounded-lg border border-[#C0DDD6] dark:border-slate-700"
                >
                  <option value="NEW_LEAD">Prospek Baru</option>
                  <option value="FOLLOW_UP_1">Follow Up #1</option>
                  <option value="FOLLOW_UP_2">Follow Up #2</option>
                  <option value="QUOTATION_SENT">Quotation Sent</option>
                  <option value="WON_BOOKED">Won / Booked ⭐</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setViewLeadDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#98C3BC] text-[#13302B] dark:bg-slate-800 dark:text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD PROSPECT / SALES LEAD FORM WITH POPUP CALENDAR & FULL FIELDS */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#C0DDD6] dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Tambah Prospek Jamaah Baru (Sales Pipeline)
              </h3>
              <button onClick={() => setShowAddLeadModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5 text-xs">
              {/* Tanggal Pendaftaran dengan PopupCalendar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <PopupCalendar
                    label="Tanggal Pendaftaran Prospek"
                    required={true}
                    value={newLeadForm.registration_date}
                    onChange={(val) => setNewLeadForm({ ...newLeadForm, registration_date: val })}
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">
                    Nama Sales Yang Menghandle <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newLeadForm.sales_rep_id}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, sales_rep_id: e.target.value })}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium"
                  >
                    {salesRepresentatives.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">
                  Nama Calon Jamaah / Kontak <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bpk. H. Sukarno & Keluarga"
                  value={newLeadForm.lead_name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, lead_name: e.target.value })}
                  className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">
                    No. WhatsApp / Telepon <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="081234567890"
                    value={newLeadForm.phone_number}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone_number: e.target.value })}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">Kota Asal / Domisili</label>
                  <input
                    type="text"
                    value={newLeadForm.city}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, city: e.target.value })}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">Paket Yang Diminati</label>
                <input
                  type="text"
                  required
                  value={newLeadForm.interested_package_type}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, interested_package_type: e.target.value })}
                  className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">Estimasi Jumlah Pax</label>
                  <input
                    type="number"
                    min="1"
                    value={newLeadForm.estimated_pax}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, estimated_pax: Number(e.target.value) })}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">Budget per Pax (IDR)</label>
                  <input
                    type="number"
                    value={newLeadForm.estimated_budget_per_pax}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, estimated_budget_per_pax: Number(e.target.value) })}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Progress Follow Up & Hasil */}
              <div className="p-3 rounded-xl bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 space-y-2">
                <span className="font-bold text-[#1E4E46] dark:text-emerald-400 block text-xs">
                  Progress Pipeline &amp; Follow-Up:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">Follow-up Keberapa Kali</label>
                    <input
                      type="number"
                      min="1"
                      value={newLeadForm.followup_count}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, followup_count: Number(e.target.value) })}
                      className="w-full bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">Tahapan Saat Ini</label>
                    <select
                      value={newLeadForm.pipeline_stage}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, pipeline_stage: e.target.value as SalesLead['pipeline_stage'] })}
                      className="w-full bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    >
                      <option value="NEW_LEAD">Prospek Baru</option>
                      <option value="FOLLOW_UP_1">Follow Up #1</option>
                      <option value="FOLLOW_UP_2">Follow Up #2</option>
                      <option value="QUOTATION_SENT">Quotation Sent</option>
                      <option value="WON_BOOKED">Won / Booked ⭐</option>
                      <option value="LOST">Lost</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">Hasil &amp; Catatan Follow-Up</label>
                  <input
                    type="text"
                    value={newLeadForm.followup_result}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, followup_result: e.target.value })}
                    placeholder="Contoh: Tertarik paket Ramadhan; menunggu konfirmasi suami."
                    className="w-full bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Relasi Komisi Agen */}
              <div className="p-3 rounded-xl bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 space-y-2">
                <span className="font-bold text-[#1E4E46] dark:text-emerald-400 block text-xs">
                  Relasi Mitra Agen &amp; Skema Komisi (Master Data):
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">Nama Agen / Mitra (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Contoh: Ustadz Abdullah"
                      value={newLeadForm.agent_name}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, agent_name: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">Pilih Tier Komisi Agen</label>
                    <select
                      value={newLeadForm.agent_commission_tier}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, agent_commission_tier: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    >
                      {mockAgentCommissionSettings.map((tier) => (
                        <option key={tier.setting_id} value={tier.tier_code}>
                          {tier.tier_name} - Rp {tier.commission_per_pax_idr.toLocaleString('id-ID')}/pax
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tanggal Follow Up Berikutnya dengan PopupCalendar */}
              <div>
                <PopupCalendar
                  label="Jadwal Follow-Up Berikutnya"
                  value={newLeadForm.next_follow_up_date}
                  onChange={(val) => setNewLeadForm({ ...newLeadForm, next_follow_up_date: val })}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#C0DDD6] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white font-bold rounded-xl shadow-sm transition-all"
                >
                  Simpan Prospek Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add B2B Order */}
      {showAddB2bModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#C0DDD6] dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Tambah Order Wholesale B2B
              </h3>
              <button onClick={() => setShowAddB2bModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateB2bOrder} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">Nama Biro Travel Pembeli</label>
                <input
                  type="text"
                  required
                  placeholder="PT. Amanah Travel Bersaudara"
                  value={newB2bForm.buyer_travel_name}
                  onChange={(e) => setNewB2bForm({ ...newB2bForm, buyer_travel_name: e.target.value })}
                  className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">Nama PIC Pembeli</label>
                  <input
                    type="text"
                    required
                    value={newB2bForm.buyer_pic_name}
                    onChange={(e) => setNewB2bForm({ ...newB2bForm, buyer_pic_name: e.target.value })}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">Telepon PIC</label>
                  <input
                    type="text"
                    required
                    value={newB2bForm.buyer_phone}
                    onChange={(e) => setNewB2bForm({ ...newB2bForm, buyer_phone: e.target.value })}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">Jumlah Pax</label>
                  <input
                    type="number"
                    min="1"
                    value={newB2bForm.qty_pax}
                    onChange={(e) => setNewB2bForm({ ...newB2bForm, qty_pax: Number(e.target.value) })}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block font-semibold mb-1">Harga per Pax (USD)</label>
                  <input
                    type="number"
                    value={newB2bForm.unit_price_usd}
                    onChange={(e) => setNewB2bForm({ ...newB2bForm, unit_price_usd: Number(e.target.value) })}
                    className="w-full bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <PopupCalendar
                  label="Target Tanggal Keberangkatan"
                  required={true}
                  value={newB2bForm.target_departure_date}
                  onChange={(val) => setNewB2bForm({ ...newB2bForm, target_departure_date: val })}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#C0DDD6] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddB2bModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm"
                >
                  Simpan Order B2B
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
