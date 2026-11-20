import React, { useState, useEffect } from 'react';
import {
  Code,
  Network,
  Users,
  ShieldCheck,
  Palette,
  Layers,
  Briefcase,
  Database,
  Building2,
  FileCheck2,
  ExternalLink,
  Info,
  ListFilter,
  FileSpreadsheet,
  BadgePercent,
  Wallet,
  Mail,
  Inbox,
  History,
  Package,
  Plane,
  Coins,
  PiggyBank,
  Compass,
  Ticket,
  ChevronRight,
  Sparkles,
  ShoppingCart,
  Boxes,
  Luggage,
  Calendar,
  TrendingUp,
  FileCheck,
  Scale,
  CreditCard,
  Award,
  Star,
  Radio,
  Droplet,
  Smartphone,
} from 'lucide-react';

import rawSqlFase1 from './sql/fase1_ddl_and_rls.sql?raw';
import rawSqlFase2 from './sql/fase2_ddl_and_accounting.sql?raw';
import rawSqlFase3 from './sql/fase3_ddl_and_operations.sql?raw';
import rawSqlFase4 from './sql/fase4_ddl_and_enterprise.sql?raw';
import rawSqlFase5 from './sql/fase5_ddl_and_enterprise.sql?raw';
import rawSqlFase6 from './sql/fase6_ddl_and_consolidation.sql?raw';
import rawSqlFase7 from './sql/fase7_ddl_and_advanced_crm.sql?raw';

import { Header } from './components/Header.tsx';

// Fase 1 Components
import { DdlViewerTab } from './components/tabs/DdlViewerTab.tsx';
import { BranchResolverTab } from './components/tabs/BranchResolverTab.tsx';
import { SiskopatuhValidatorTab } from './components/tabs/SiskopatuhValidatorTab.tsx';
import { RlsSimulatorTab } from './components/tabs/RlsSimulatorTab.tsx';
import { ThemeConfigTab } from './components/tabs/ThemeConfigTab.tsx';
import { JournalArchitectureTab } from './components/tabs/JournalArchitectureTab.tsx';
import { HrAndMasterTab } from './components/tabs/HrAndMasterTab.tsx';

// Fase 2 Components
import { MasterDataSplitScreen } from './components/tabs/fase2/MasterDataSplitScreen.tsx';
import { CoaAndRequestsTab } from './components/tabs/fase2/CoaAndRequestsTab.tsx';
import { TaxAndInterbranchTab } from './components/tabs/fase2/TaxAndInterbranchTab.tsx';
import { PettyCashAndPayrollTab } from './components/tabs/fase2/PettyCashAndPayrollTab.tsx';
import { DocumentAndGCalTab } from './components/tabs/fase2/DocumentAndGCalTab.tsx';
import { InboxAndAuditTab } from './components/tabs/fase2/InboxAndAuditTab.tsx';

// Fase 3 Components
import { PackageRabAndSeatsTab } from './components/tabs/fase3/PackageRabAndSeatsTab.tsx';
import { BookingsAndSalesTab } from './components/tabs/fase3/BookingsAndSalesTab.tsx';
import { CashAdvanceAndElpjTab } from './components/tabs/fase3/CashAdvanceAndElpjTab.tsx';
import { EscrowAndRefundTab } from './components/tabs/fase3/EscrowAndRefundTab.tsx';
import { JamaahPortalDashboardTab } from './components/tabs/fase3/JamaahPortalDashboardTab.tsx';

// Fase 4 Components
import { ProcurementAndValasTab } from './components/tabs/fase4/ProcurementAndValasTab.tsx';
import { WarehouseAndAssetsTab } from './components/tabs/fase4/WarehouseAndAssetsTab.tsx';
import { TourOpsAndLuggageTab } from './components/tabs/fase4/TourOpsAndLuggageTab.tsx';
import { ItineraryAndInsuranceTab } from './components/tabs/fase4/ItineraryAndInsuranceTab.tsx';
import { RevenueRecognitionTab } from './components/tabs/fase4/RevenueRecognitionTab.tsx';

// Fase 5 Components
import { UnrealizedFxTab } from './components/tabs/fase5/UnrealizedFxTab.tsx';
import { BankReconciliationTab } from './components/tabs/fase5/BankReconciliationTab.tsx';
import { AgentCommissionTab } from './components/tabs/fase5/AgentCommissionTab.tsx';
import { AgentWalletTab } from './components/tabs/fase5/AgentWalletTab.tsx';
import { KsoB2BMarginTab } from './components/tabs/fase5/KsoB2BMarginTab.tsx';

// Fase 6 Components
import { FinancialReportsTab } from './components/tabs/fase6/FinancialReportsTab.tsx';
import { ExecutiveAndCommandCenterTab } from './components/tabs/fase6/ExecutiveAndCommandCenterTab.tsx';
import { PaymentGatewayWebhookTab } from './components/tabs/fase6/PaymentGatewayWebhookTab.tsx';

// Fase 7 Components
import { SalesCrmAndB2BTab } from './components/tabs/fase7/SalesCrmAndB2BTab.tsx';
import { PostTripAndLogisticsTab } from './components/tabs/fase7/PostTripAndLogisticsTab.tsx';
import { SurveyAndCampaignsTab } from './components/tabs/fase7/SurveyAndCampaignsTab.tsx';
import { ThemingAndCalendarTab } from './components/tabs/fase7/ThemingAndCalendarTab.tsx';

// Dynamic Sidebar, Login, Workflow Toolbar & RBAC / RLS Enforcement
import { Sidebar, PhaseGroup } from './components/navigation/Sidebar.tsx';
import { LoginPage } from './components/auth/LoginPage.tsx';
import { RlsPolicyBanner } from './components/common/RlsPolicyBanner.tsx';
import { ToastNotification, ToastData } from './components/common/ToastNotification.tsx';
import { DEMO_PROFILES, checkMenuAccess, checkFormActionPermission } from './utils/rbacRules.ts';
import { DemoAccountProfile } from './types/auth.ts';
import { Lock } from 'lucide-react';

import {
  mockTenants,
  mockAppSettings,
  mockExchangeRates,
  mockDocumentSequences,
  mockUsers,
  mockEmployees,
  mockAttendances,
  mockLeaveRequests,
  mockPayrollComponents,
  mockGeneralMasters,
  mockResolvedBranches,
  mockCustomers,
  mockVendors,
  mockVendorRegistrations,
  mockJournalMasters,
} from './data/mockData.ts';

import {
  mockChartOfAccounts,
  mockMasterDataRequests,
  mockOfficeExpenses,
  mockPayrollRun,
  mockDocumentTemplates,
  mockOutgoingLetters,
  mockAuditLogs,
  mockGeneralLedgerEntries,
} from './data/mockDataFase2.ts';

import {
  mockPackages,
  mockFlightAllocations,
  mockPackageRabs,
  mockBookings,
  mockCashAdvances,
  mockFieldExpenseClaims,
  mockJamaahAdministrations,
  mockSavingAccounts,
  mockSavingMutations,
  mockBookingCancellations,
  mockManasikEvents,
  mockManasikAttendances,
  mockRoommateAllocations,
  mockGroupGalleries,
  mockJamaahDashboardSummary,
} from './data/mockDataFase3.ts';

import {
  mockPurchaseRequests,
  mockTenders,
  mockPurchaseOrders,
  mockVendorPayments,
  mockPlants,
  mockPlantInventories,
  mockGoodsReceipts,
  mockGoodsIssues,
  mockEquipmentHandovers,
  mockFixedAssets,
  mockAssetDisposals,
  mockManifests,
  mockRoomingLists,
  mockLuggageTrackings,
  mockItineraries,
  mockItineraryRealizations,
  mockInsurancePolicies,
} from './data/mockDataFase4.ts';

import {
  mockBankAccounts,
  mockBankStatements,
  mockUnrealizedFxItems,
  mockAgentCommissions,
  mockAgentWallets,
  mockWalletMutations,
  mockKsoWholesaleMargins,
} from './data/mockDataFase5.ts';

import {
  mockProfitLossItems,
  mockBalanceSheetItems,
  mockConsolidationRows,
  mockKloterProfitabilities,
  mockSeatLoadFactors,
  mockCommandCenterItems,
  mockPaymentWebhooks,
} from './data/mockDataFase6.ts';

import {
  mockBranchSettings,
  mockDynamicTemplates,
  mockOutgoingLetters as mockOutgoingLettersFase7,
  mockHajjPortions,
  mockB2BProviderOrders,
  mockSalesLeads,
  mockEquipmentLoans,
  mockPostTripZamzamPickups,
  mockPostTripCertificates,
  mockCustomerSurveys,
  mockAlumniDatabase,
  mockWhatsAppCampaigns,
  mockWAMessageLogs,
} from './data/mockDataFase7.ts';

import {
  Tenant,
  ResolvedBranch,
  RoleCode,
  Customer,
  AppSetting,
  GeneralMaster,
  ChartOfAccount,
  MasterDataRequest,
  OfficeExpense,
  PayrollRun,
  OutgoingLetter,
  AuditLog,
  GeneralLedgerEntry,
  JournalMaster,
  PackageItem,
  Booking,
  CashAdvance,
  FieldExpenseClaim,
  SavingAccount,
  SavingMutation,
  BookingCancellation,
  ManasikAttendance,
  PurchaseRequest,
  PurchaseOrder,
  VendorPayment,
  GoodsIssue,
  EquipmentHandover,
  AssetDisposal,
  LuggageTracking,
  ItineraryRealization,
  InsurancePolicy,
  Manifest,
  BankStatement,
  AgentCommission,
  AgentWallet,
  WalletMutation,
  KsoWholesaleMargin,
  KloterProfitability,
  CommandCenterItem,
  PaymentGatewayWebhook,
  SalesLead,
  B2BProviderOrder,
  HajjPortion,
  EquipmentLoan,
  PostTripZamzamPickup,
  PostTripCertificate,
  CustomerSurvey,
  AlumniDatabaseRecord,
  WhatsAppCampaign,
  WAMessageLog,
  BranchSettingsConfig,
  DynamicDocumentTemplate,
  OutgoingLetterRecord,
} from './types/erp.ts';

export default function App() {
  // Authentication & RBAC User Session State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<DemoAccountProfile>(DEMO_PROFILES[0]);
  const [currentTenant, setCurrentTenant] = useState<Tenant>(mockTenants[0]);
  const [currentBranch, setCurrentBranch] = useState<ResolvedBranch>(mockResolvedBranches[0]);
  const [currentRole, setCurrentRole] = useState<RoleCode>(DEMO_PROFILES[0].role);

  // Dynamic Sidebar Controls: Auto-Hide, Pinning & Collapse
  const [isPinned, setIsPinned] = useState<boolean>(true);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(300);

  // Responsive device viewport detection (Mobile < 1024px has zero left padding)
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUserProfile(DEMO_PROFILES[0]);
    setShowLoginModal(false);
    showNotification('info', 'Keluar dari Aplikasi', 'Anda telah berhasil keluar dari seluruh sesi aplikasi ERP.');
  };

  // Theme Mode: Sage (#98C3BC & #C0DDD6), Dark & Light Mode Persistence (Default: sage)
  const [theme, setTheme] = useState<'sage' | 'dark' | 'light'>(() => {
    return (localStorage.getItem('erp_theme') as 'sage' | 'dark' | 'light') || 'sage';
  });

  useEffect(() => {
    localStorage.setItem('erp_theme', theme);
    document.documentElement.classList.remove('theme-sage', 'dark', 'light');
    if (theme === 'sage') {
      document.documentElement.classList.add('theme-sage');
    } else if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'sage' ? 'dark' : prev === 'dark' ? 'light' : 'sage'));
  };

  // Global Toast Notification System for RBAC & Form Submissions
  const [toast, setToast] = useState<ToastData | null>(null);

  const showNotification = (
    type: 'success' | 'warning' | 'error' | 'info',
    title: string,
    message: string
  ) => {
    setToast({ type, title, message });
  };

  const handleRoleChange = (role: RoleCode) => {
    setCurrentRole(role);
    const matchedProfile = DEMO_PROFILES.find((p) => p.role === role);
    if (matchedProfile) {
      setCurrentUserProfile(matchedProfile);
      // Invisible Menu Redirection: Jika tab saat ini tidak berizin, arahkan otomatis ke modul berwenang
      const access = checkMenuAccess(activeTab, role);
      if (!access.isAccessible) {
        setActivePhase(matchedProfile.defaultPhase);
        setActiveTab(matchedProfile.defaultTab);
      }
    } else {
      const access = checkMenuAccess(activeTab, role);
      if (!access.isAccessible) {
        setActivePhase('MODULE_CRM_B2B');
        setActiveTab('CRM_LEADS_B2B');
      }
    }
    showNotification(
      'info',
      'Peran RBAC Diperbarui',
      `Sesi kini menggunakan wewenang ${role}. Akses menu dan visibilitas data disesuaikan otomatis.`
    );
  };

  const handleBranchChange = (branch: ResolvedBranch) => {
    setCurrentBranch(branch);
    showNotification(
      'info',
      'Isolasi Cabang RLS Beralih',
      `Row-Level Security kini mengisolasi data transaksi milik Cabang [${branch.branch_code}] ${branch.branch_name}.`
    );
  };

  const handleLoginSuccess = (
    profile: DemoAccountProfile,
    tenant: Tenant,
    branch: ResolvedBranch,
    role: RoleCode
  ) => {
    setCurrentUserProfile(profile);
    setCurrentTenant(tenant);
    setCurrentBranch(branch);
    setCurrentRole(role);
    setIsLoggedIn(true);
    setShowLoginModal(false);
    setActivePhase(profile.defaultPhase);
    setActiveTab(profile.defaultTab);
    showNotification(
      'success',
      'Autentikasi Berhasil',
      `Selamat datang, ${profile.fullName}! Sesi aktif sebagai ${profile.roleTitle} di Cabang ${branch.branch_code}.`
    );
  };

  // Active Business Module & Tab Selector (Default ke Dashboard Eksekutif C-Level / Bisnis)
  const [activePhase, setActivePhase] = useState<string>(
    DEMO_PROFILES[0].defaultPhase || 'MODULE_FINANCE'
  );
  const [activeTab, setActiveTab] = useState<string>(
    DEMO_PROFILES[0].defaultTab || 'EXECUTIVE_DASHBOARD'
  );

  // Shared Data States
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>(mockChartOfAccounts);
  const [masterRequests, setMasterRequests] = useState<MasterDataRequest[]>(mockMasterDataRequests);
  const [officeExpenses, setOfficeExpenses] = useState<OfficeExpense[]>(mockOfficeExpenses);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([mockPayrollRun]);
  const [outgoingLetters, setOutgoingLetters] = useState<OutgoingLetter[]>(mockOutgoingLetters);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [journalMasters, setJournalMasters] = useState<JournalMaster[]>(mockJournalMasters);

  // Fase 3 State
  const [packages, setPackages] = useState<PackageItem[]>(mockPackages);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [cashAdvances, setCashAdvances] = useState<CashAdvance[]>(mockCashAdvances);
  const [fieldClaims, setFieldClaims] = useState<FieldExpenseClaim[]>(mockFieldExpenseClaims);
  const [savingAccounts, setSavingAccounts] = useState<SavingAccount[]>(mockSavingAccounts);
  const [savingMutations, setSavingMutations] = useState<SavingMutation[]>(mockSavingMutations);
  const [cancellations, setCancellations] = useState<BookingCancellation[]>(mockBookingCancellations);
  const [manasikAttendances, setManasikAttendances] = useState<ManasikAttendance[]>(mockManasikAttendances);

  // Fase 4 State
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(mockPurchaseRequests);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [vendorPayments, setVendorPayments] = useState<VendorPayment[]>(mockVendorPayments);
  const [goodsIssues, setGoodsIssues] = useState<GoodsIssue[]>(mockGoodsIssues);
  const [equipmentHandovers, setEquipmentHandovers] = useState<EquipmentHandover[]>(mockEquipmentHandovers);
  const [fixedAssets, setFixedAssets] = useState(mockFixedAssets);
  const [assetDisposals, setAssetDisposals] = useState<AssetDisposal[]>(mockAssetDisposals);
  const [manifests, setManifests] = useState<Manifest[]>(mockManifests);
  const [luggageList, setLuggageList] = useState<LuggageTracking[]>(mockLuggageTrackings);
  const [itineraryRealizations, setItineraryRealizations] = useState<ItineraryRealization[]>(mockItineraryRealizations);
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>(mockInsurancePolicies);

  // Fase 5 State
  const [bankStatements, setBankStatements] = useState<BankStatement[]>(mockBankStatements);
  const [commissions, setCommissions] = useState<AgentCommission[]>(mockAgentCommissions);
  const [wallets, setWallets] = useState<AgentWallet[]>(mockAgentWallets);
  const [walletMutations, setWalletMutations] = useState<WalletMutation[]>(mockWalletMutations);
  const [ksoMargins, setKsoMargins] = useState<KsoWholesaleMargin[]>(mockKsoWholesaleMargins);

  // Fase 6 State
  const [kloterProfitabilities, setKloterProfitabilities] = useState<KloterProfitability[]>(mockKloterProfitabilities);
  const [commandCenterItems, setCommandCenterItems] = useState<CommandCenterItem[]>(mockCommandCenterItems);
  const [paymentWebhooks, setPaymentWebhooks] = useState<PaymentGatewayWebhook[]>(mockPaymentWebhooks);

  // Fase 7 State
  const [salesLeads, setSalesLeads] = useState<SalesLead[]>(mockSalesLeads);
  const [b2bOrders, setB2bOrders] = useState<B2BProviderOrder[]>(mockB2BProviderOrders);
  const [hajjPortions, setHajjPortions] = useState<HajjPortion[]>(mockHajjPortions);
  const [equipmentLoans, setEquipmentLoans] = useState<EquipmentLoan[]>(mockEquipmentLoans);
  const [zamzamPickups, setZamzamPickups] = useState<PostTripZamzamPickup[]>(mockPostTripZamzamPickups);
  const [certificates, setCertificates] = useState<PostTripCertificate[]>(mockPostTripCertificates);
  const [customerSurveys, setCustomerSurveys] = useState<CustomerSurvey[]>(mockCustomerSurveys);
  const [alumniRecords, setAlumniRecords] = useState<AlumniDatabaseRecord[]>(mockAlumniDatabase);
  const [campaigns, setCampaigns] = useState<WhatsAppCampaign[]>(mockWhatsAppCampaigns);
  const [waMessageLogs, setWaMessageLogs] = useState<WAMessageLog[]>(mockWAMessageLogs);
  const [branchSettings, setBranchSettings] = useState<BranchSettingsConfig[]>(mockBranchSettings);
  const [dynamicTemplates, setDynamicTemplates] = useState<DynamicDocumentTemplate[]>(mockDynamicTemplates);
  const [outgoingLettersFase7, setOutgoingLettersFase7] = useState<OutgoingLetterRecord[]>(mockOutgoingLettersFase7);

  // Fase 6 Webhook Handler: Stored Procedure Equivalent
  const handleTriggerWebhook = (payload: {
    booking_id: string;
    booking_number: string;
    amount: number;
    payment_channel: string;
    gateway_provider: 'MIDTRANS' | 'XENDIT';
  }) => {
    // 1. Update Booking Balance & Status
    setBookings((prev) =>
      prev.map((b) =>
        b.booking_number === payload.booking_number
          ? {
              ...b,
              total_paid: b.total_paid + payload.amount,
              outstanding_balance: Math.max(b.net_payable - (b.total_paid + payload.amount), 0),
              status: b.net_payable - (b.total_paid + payload.amount) <= 0 ? 'FULLY_PAID' : 'DP_PAID',
            }
          : b
      )
    );

    // 2. Generate 3-Level Auto Journal (Maker DRAFT)
    const newJrnNumber = `JRN/PG/${new Date().toISOString().slice(0, 7).replace('-', '')}/${Date.now().toString().slice(-4)}`;
    const newJrn: JournalMaster = {
      journal_id: `jrn-pg-${Date.now()}`,
      tenant_id: '11111111-1111-1111-1111-111111111111',
      branch_id: currentBranch.branch_code,
      owner_branch_id: currentBranch.branch_code,
      journal_number: newJrnNumber,
      transaction_date: new Date().toISOString().slice(0, 10),
      doc_no: payload.booking_number,
      doc_date: new Date().toISOString().slice(0, 10),
      workflow_stage: 'DRAFT_MAKER',
      workflow_status: 'DRAFT_MAKER',
      total_debit: payload.amount,
      total_credit: payload.amount,
      maker_user_name: 'SYSTEM_GATEWAY_WEBHOOK',
      notes: `Penerimaan Otomatis ${payload.gateway_provider} (${payload.payment_channel}) untuk ${payload.booking_number}`,
      bodies: [],
    };
    setJournalMasters([newJrn, ...journalMasters]);

    // 3. Catat Riwayat Webhook Logs
    const newWebhook: PaymentGatewayWebhook = {
      webhook_id: `wh-${Date.now()}`,
      gateway_provider: payload.gateway_provider,
      event_type: 'payment.success',
      order_id: payload.booking_number,
      transaction_id: `tx-${payload.gateway_provider.toLowerCase()}-${Date.now().toString().slice(-8)}`,
      payment_channel: payload.payment_channel,
      gross_amount: payload.amount,
      transaction_status: 'settlement',
      raw_payload: {
        order_id: payload.booking_number,
        gross_amount: payload.amount,
        payment_type: payload.payment_channel,
        transaction_time: new Date().toISOString(),
        transaction_status: 'settlement',
        signature_key: `sha512-${Date.now()}`,
        status_code: '200',
        va_numbers: [{ bank: 'bsi', va_number: '9882081928310001' }],
      },
      is_processed: true,
      journal_reference: newJrnNumber,
      created_at: new Date().toISOString(),
    };
    setPaymentWebhooks([newWebhook, ...paymentWebhooks]);
    showNotification(
      'success',
      'Webhook Settlement Diterima',
      `Pembayaran ${payload.gateway_provider} Rp ${payload.amount.toLocaleString('id-ID')} berhasil diverifikasi & Jurnal Auto-Maker terbit.`
    );
  };

  const handleUpdateActivityStatus = (
    manifestId: string,
    newStatus: 'ON_TRACK' | 'DELAYED' | 'COMPLETED',
    notes?: string
  ) => {
    setCommandCenterItems((prev) =>
      prev.map((item) =>
        item.manifest_id === manifestId
          ? {
              ...item,
              realization_status: newStatus,
              delay_reason: newStatus === 'DELAYED' ? notes : undefined,
              actual_time: new Date().toISOString(),
            }
          : item
      )
    );
    showNotification(
      'info',
      'Status Kloter Saudi Diperbarui',
      `Jadwal penugasan manifes ${manifestId} dialihkan ke status [${newStatus}].`
    );
  };

  // Fase 7 Handlers with RBAC & RLS Enforcement
  const handleUpdateLeadStage = (leadId: string, newStage: SalesLead['pipeline_stage']) => {
    const check = checkFormActionPermission('UPDATE_LEAD', currentRole);
    if (!check.allowed) {
      showNotification('warning', 'Aksi Dibatasi RBAC', check.message || 'Peran Anda tidak diizinkan mengubah status prospek.');
      return;
    }
    setSalesLeads((prev) =>
      prev.map((l) => (l.lead_id === leadId ? { ...l, pipeline_stage: newStage } : l))
    );
    showNotification(
      'success',
      'Status Prospek Diperbarui',
      `Lead berhasil dialihkan ke tahap [${newStage}] di bawah naungan Cabang ${currentBranch.branch_code}.`
    );
  };

  const handleAddSalesLead = (lead: Omit<SalesLead, 'lead_id' | 'total_potential_revenue' | 'created_at'>) => {
    const check = checkFormActionPermission('CREATE_LEAD', currentRole);
    if (!check.allowed) {
      showNotification('warning', 'Aksi Dibatasi RBAC', check.message || 'Peran Anda tidak diizinkan menambah prospek.');
      return;
    }
    // RLS Enforcement: non-HQ users must belong to their resolved branch
    const branchToAssign =
      currentRole === 'ADMIN_HQ' || currentRole === 'ADMIN_SAAS'
        ? lead.branch_id
        : currentBranch.branch_code;

    const newLead: SalesLead = {
      ...lead,
      branch_id: branchToAssign,
      lead_id: `lead-${Date.now()}`,
      total_potential_revenue: lead.estimated_pax * lead.estimated_budget_per_pax,
      created_at: new Date().toISOString(),
    };
    setSalesLeads([newLead, ...salesLeads]);
    showNotification(
      'success',
      'Lead Baru Berhasil Ditambahkan',
      `Prospek "${lead.lead_name}" (${lead.estimated_pax} Pax) berhasil didaftarkan ke Pipeline Cabang [${branchToAssign}].`
    );
  };

  const handleGenerateB2bJournal = (orderId: string) => {
    const check = checkFormActionPermission('APPROVE_JOURNAL', currentRole);
    if (!check.allowed) {
      showNotification('warning', 'Wewenang Akuntansi Dibutuhkan', check.message || 'Posting jurnal otomatis B2B memerlukan hak akses Finance HQ / Super Admin.');
      return;
    }
    const target = b2bOrders.find((o) => o.order_id === orderId);
    if (!target) return;
    const jrnRef = `JRN/B2B/${new Date().toISOString().slice(0, 7).replace('-', '')}/${orderId.slice(0, 4)}`;
    setB2bOrders((prev) =>
      prev.map((o) =>
        o.order_id === orderId
          ? {
              ...o,
              journal_reference: jrnRef,
              payment_status: 'PAID_SETTLED',
              paid_amount_idr: o.total_amount_idr,
            }
          : o
      )
    );
    const newJrn: JournalMaster = {
      journal_id: `jrn-b2b-${Date.now()}`,
      tenant_id: '11111111-1111-1111-1111-111111111111',
      branch_id: target.owner_branch_id,
      owner_branch_id: target.owner_branch_id,
      journal_number: jrnRef,
      transaction_date: new Date().toISOString().slice(0, 10),
      doc_no: target.order_number,
      doc_date: new Date().toISOString().slice(0, 10),
      workflow_stage: 'DRAFT_MAKER',
      workflow_status: 'DRAFT_MAKER',
      total_debit: target.total_amount_idr,
      total_credit: target.total_amount_idr,
      maker_user_name: 'B2B_WHOLESALE_ENGINE',
      notes: `Penjualan Wholesale ${target.order_type} (${target.qty_pax} Pax) ke ${target.buyer_travel_name}`,
      bodies: [],
    };
    setJournalMasters([newJrn, ...journalMasters]);
    showNotification(
      'success',
      'Jurnal B2B Berhasil Diterbitkan',
      `Jurnal piutang/kas ${jrnRef} sebesar Rp ${target.total_amount_idr.toLocaleString('id-ID')} telah diposting.`
    );
  };

  const handleAddB2bOrder = (
    order: Omit<B2BProviderOrder, 'order_id' | 'total_amount_usd' | 'total_amount_idr' | 'created_at'>
  ) => {
    const check = checkFormActionPermission('CREATE_B2B_ORDER', currentRole);
    if (!check.allowed) {
      showNotification('warning', 'Aksi Dibatasi RBAC', check.message || 'Pemesanan Wholesale B2B dibatasi untuk divisi Marketing atau Cabang.');
      return;
    }
    const newOrd: B2BProviderOrder = {
      ...order,
      order_id: `b2b-${Date.now()}`,
      total_amount_usd: order.qty_pax * order.unit_price_usd,
      total_amount_idr: order.qty_pax * order.unit_price_usd * order.exchange_rate,
      created_at: new Date().toISOString(),
    };
    setB2bOrders([newOrd, ...b2bOrders]);
    showNotification(
      'success',
      'Order B2B Wholesale Dibuat',
      `Pesanan ${order.buyer_travel_name} (${order.qty_pax} Pax) berhasil dicatat ke sistem.`
    );
  };

  const handleRevalueHajjCurrency = (newRate: number) => {
    const check = checkFormActionPermission('REVALUASI_VALAS', currentRole);
    if (!check.allowed) {
      showNotification(
        'warning',
        'Aksi Dibatasi RBAC',
        check.message || 'Revaluasi Valas BI Rate hanya diizinkan untuk Direksi HQ / Super Admin.'
      );
      return;
    }
    setHajjPortions((prev) =>
      prev.map((p) => {
        if (p.status !== 'WAITING_LIST') return p;
        const currentVal = p.bpih_deposit_usd * newRate;
        const initialVal = p.bpih_deposit_usd * p.exchange_rate_booking;
        return {
          ...p,
          current_exchange_rate: newRate,
          current_idr_valuation: currentVal,
          unrealized_gain_loss: currentVal - initialVal,
        };
      })
    );
    showNotification(
      'success',
      'Revaluasi Porsi Haji BPIH Valas Berhasil',
      `Seluruh deposit antrean haji dinilai ulang dengan kurs baru Rp ${newRate.toLocaleString('id-ID')}/USD.`
    );
  };

  const handleReturnEquipment = (
    loanId: string,
    condition: EquipmentLoan['condition_returned'],
    penaltyAmount: number,
    notes: string,
    deductionTarget: EquipmentLoan['deduction_target']
  ) => {
    setEquipmentLoans((prev) =>
      prev.map((l) =>
        l.loan_id === loanId
          ? {
              ...l,
              condition_returned: condition,
              penalty_fee_amount: penaltyAmount,
              penalty_notes: notes,
              deduction_target: deductionTarget,
              returned_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
              status: condition === 'GOOD_WORKING' ? 'RETURNED_CLEAR' : 'PENALTY_CHARGED',
            }
          : l
      )
    );
    showNotification(
      'success',
      'Pengembalian Whisper Dicatat',
      `Receiver berhasil dikembalikan (Kondisi: ${condition}). Denda: Rp ${penaltyAmount.toLocaleString('id-ID')}.`
    );
  };

  const handleUpdateZamzamStatus = (
    pickupId: string,
    newStatus: PostTripZamzamPickup['pickup_status'],
    trackingNo?: string
  ) => {
    setZamzamPickups((prev) =>
      prev.map((z) =>
        z.pickup_id === pickupId
          ? {
              ...z,
              pickup_status: newStatus,
              claimed_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
              courier_tracking_no: trackingNo || z.courier_tracking_no,
            }
          : z
      )
    );
    showNotification(
      'success',
      'Status Logistik Zamzam Diperbarui',
      `Alokasi air zamzam diubah ke status [${newStatus}].`
    );
  };

  const handleSubmitSurvey = (
    survey: Omit<
      CustomerSurvey,
      'survey_id' | 'routed_destination' | 'cs_ticket_id' | 'cs_resolution_status' | 'created_at'
    >
  ) => {
    const isPublic = survey.star_rating >= 4;
    const newSrv: CustomerSurvey = {
      ...survey,
      survey_id: `srv-${Date.now()}`,
      routed_destination: isPublic ? 'GOOGLE_REVIEW_PUBLIC' : 'INTERNAL_CS_TICKET',
      cs_ticket_id: isPublic ? undefined : `CS-TCK-${Date.now().toString().slice(-6)}`,
      cs_resolution_status: isPublic ? 'NONE' : 'OPEN',
      created_at: new Date().toISOString(),
    };
    setCustomerSurveys([newSrv, ...customerSurveys]);
    showNotification(
      'success',
      isPublic ? 'Ulasan Publik: Diarahkan ke Google Review' : 'Ulasan Kritis: Tiket CS Dibuat',
      isPublic
        ? `Rating ${survey.star_rating}⭐ dialihkan otomatis ke Google Maps Review Biro.`
        : `Rating ${survey.star_rating}⭐ memicu pembukaan tiket komplain internal SLA 24 jam.`
    );
  };

  const handleSendBroadcastCampaign = (campaignId: string) => {
    const check = checkFormActionPermission('SEND_CAMPAIGN', currentRole);
    if (!check.allowed) {
      showNotification('warning', 'Aksi Dibatasi RBAC', check.message || 'Pengiriman broadcast WhatsApp dibatasi untuk tim Marketing/HQ.');
      return;
    }
    setCampaigns((prev) =>
      prev.map((c) =>
        c.campaign_id === campaignId
          ? {
              ...c,
              campaign_status: 'COMPLETED',
              total_sent: c.total_recipients,
              total_delivered: Math.max(1, c.total_recipients - 2),
              total_failed: 2,
            }
          : c
      )
    );
    const targetCmp = campaigns.find((c) => c.campaign_id === campaignId);
    if (targetCmp) {
      const newLogs: WAMessageLog[] = [
        {
          log_id: `log-${Date.now()}-1`,
          campaign_id: campaignId,
          recipient_phone: '081299887766',
          recipient_name: 'H. Bambang Soeprapto',
          rendered_body: targetCmp.message_template.replace('{{nama_jamaah}}', 'H. Bambang Soeprapto'),
          delivery_status: 'READ',
          sent_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        },
        {
          log_id: `log-${Date.now()}-2`,
          campaign_id: campaignId,
          recipient_phone: '081299887767',
          recipient_name: 'Hj. Dewi Sartika',
          rendered_body: targetCmp.message_template.replace('{{nama_jamaah}}', 'Hj. Dewi Sartika'),
          delivery_status: 'DELIVERED',
          sent_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        },
      ];
      setWaMessageLogs([...newLogs, ...waMessageLogs]);
    }
    showNotification(
      'success',
      'WhatsApp Broadcast Terkirim',
      'Pesan personalisasi terkirim ke antrean gateway WhatsApp resmi.'
    );
  };

  const handleCreateCampaign = (
    campaign: Omit<
      WhatsAppCampaign,
      'campaign_id' | 'total_sent' | 'total_delivered' | 'total_failed' | 'campaign_status' | 'created_at'
    >
  ) => {
    const newCmp: WhatsAppCampaign = {
      ...campaign,
      campaign_id: `cmp-${Date.now()}`,
      total_sent: 0,
      total_delivered: 0,
      total_failed: 0,
      campaign_status: 'SCHEDULED',
      created_at: new Date().toISOString(),
    };
    setCampaigns([newCmp, ...campaigns]);
    showNotification(
      'success',
      'Kampanye Broadcast Dijadwalkan',
      `Target audiens ${campaign.target_audience} siap dikirimi broadcast.`
    );
  };

  const handleUpdateBranchTheme = (
    branchId: string,
    updatedTheme: BranchSettingsConfig['ui_theme_config']
  ) => {
    setBranchSettings((prev) =>
      prev.map((b) => (b.branch_id === branchId ? { ...b, ui_theme_config: updatedTheme } : b))
    );
    showNotification(
      'success',
      'Tema Cabang Disimpan ke JSONB',
      `Palet warna primer, aksen, dan kop surat Cabang [${branchId}] berhasil disimpan.`
    );
  };

  const handleUpdateCalendarConfig = (
    branchId: string,
    updatedConfig: BranchSettingsConfig['google_calendar_config']
  ) => {
    setBranchSettings((prev) =>
      prev.map((b) => (b.branch_id === branchId ? { ...b, google_calendar_config: updatedConfig } : b))
    );
    showNotification(
      'success',
      'OAuth Google Calendar Diperbarui',
      `Konfigurasi sinkronisasi kalender Cabang [${branchId}] berhasil disimpan.`
    );
  };

  const handleIssueOutgoingLetter = (
    letter: Omit<OutgoingLetterRecord, 'letter_id' | 'letter_number' | 'gcal_sync_status' | 'created_at'>
  ) => {
    const newLtr: OutgoingLetterRecord = {
      ...letter,
      letter_id: `ltr-${Date.now()}`,
      letter_number: `OUT/RESMI/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`,
      gcal_sync_status: 'SYNCED',
      google_calendar_event_id: `gcal_evt_${Date.now()}`,
      gcal_last_synced_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      created_at: new Date().toISOString(),
    };
    setOutgoingLettersFase7([newLtr, ...outgoingLettersFase7]);
    showNotification(
      'success',
      'Surat Keluar Diterbitkan & Disinkronkan',
      `Nomor surat ${newLtr.letter_number} resmi terbit dan agenda terdorong ke Google Calendar.`
    );
  };

  const handleTriggerGcalSync = (letterId: string) => {
    setOutgoingLettersFase7((prev) =>
      prev.map((l) =>
        l.letter_id === letterId
          ? {
              ...l,
              gcal_sync_status: 'SYNCED',
              google_calendar_event_id: `gcal_evt_${Date.now()}`,
              gcal_last_synced_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
            }
          : l
      )
    );
    showNotification(
      'success',
      'Google Calendar Synced',
      `Surat ${letterId} berhasil disinkronkan ke kalender cabang.`
    );
  };

  // Fase 5 Handlers
  const handleTriggerRevaluation = () => {
    const newJrn: JournalMaster = {
      journal_id: `jrn-unrealized-${Date.now()}`,
      tenant_id: '11111111-1111-1111-1111-111111111111',
      branch_id: 'PST',
      owner_branch_id: 'PST',
      journal_number: `JRN/REV/202610/${Date.now().toString().slice(-4)}`,
      transaction_date: '2026-10-31',
      doc_no: 'CRON-REVAL-2026-10',
      doc_date: '2026-10-31',
      workflow_stage: 'DRAFT_MAKER',
      workflow_status: 'DRAFT_MAKER',
      total_debit: 13500000,
      total_credit: 13500000,
      maker_user_name: 'CRON_AUTO_REVALUATION',
      notes: 'Penyesuaian Unrealized Gain/Loss Kurs Valas Akhir Bulan Sesuai Kurs Tengah BI (SAR/USD)',
      bodies: [],
    };
    setJournalMasters([newJrn, ...journalMasters]);
  };

  const handleAutoReconcile = () => {
    setBankStatements((prev) =>
      prev.map((s) =>
        s.statement_id === 'stmt-01'
          ? {
              ...s,
              is_matched: true,
              matched_journal_id: 'jrn-1001',
            }
          : s
      )
    );
  };

  const handleManualMatch = (statementId: string) => {
    setBankStatements((prev) =>
      prev.map((s) =>
        s.statement_id === statementId
          ? {
              ...s,
              is_matched: true,
              matched_journal_id: 'jrn-1001',
            }
          : s
      )
    );
  };

  const handleDisburseCommission = (commissionId: string) => {
    setCommissions((prev) =>
      prev.map((c) =>
        c.commission_id === commissionId
          ? {
              ...c,
              payment_status: 'DISBURSED',
              disbursed_at: new Date().toISOString(),
            }
          : c
      )
    );
  };

  const handleTopupWallet = (walletId: string, amount: number) => {
    setWallets((prev) =>
      prev.map((w) =>
        w.wallet_id === walletId
          ? {
              ...w,
              current_balance: w.current_balance + amount,
              last_topup_at: new Date().toISOString(),
            }
          : w
      )
    );

    const targetW = wallets.find((w) => w.wallet_id === walletId) || wallets[0];
    const newMut: WalletMutation = {
      mutation_id: `wmut-${Date.now()}`,
      wallet_id: walletId,
      mutation_type: 'TOPUP_DEPOSIT',
      amount,
      balance_before: targetW.current_balance,
      balance_after: targetW.current_balance + amount,
      reference_no: `TOPUP/VA/${Date.now().toString().slice(-6)}`,
      notes: 'Top-Up Saldo Deposit Agen via Virtual Account BSI',
      created_at: new Date().toISOString(),
    };
    setWalletMutations([newMut, ...walletMutations]);
  };

  const handlePayViaWallet = (walletId: string, bookingId: string, amount: number) => {
    setWallets((prev) =>
      prev.map((w) =>
        w.wallet_id === walletId
          ? {
              ...w,
              current_balance: w.current_balance - amount,
            }
          : w
      )
    );

    const targetW = wallets.find((w) => w.wallet_id === walletId) || wallets[0];
    const newMut: WalletMutation = {
      mutation_id: `wmut-${Date.now()}`,
      wallet_id: walletId,
      mutation_type: 'PAYMENT_BOOKING_DEDUCTION',
      amount,
      balance_before: targetW.current_balance,
      balance_after: targetW.current_balance - amount,
      reference_no: `BKG-PAY-${bookingId}`,
      notes: 'Pemotongan Saldo Deposit Agen untuk Pelunasan Booking Jamaah',
      created_at: new Date().toISOString(),
    };
    setWalletMutations([newMut, ...walletMutations]);

    setBookings((prev) =>
      prev.map((b) =>
        b.booking_id === bookingId
          ? {
              ...b,
              total_paid: b.total_paid + amount,
              outstanding_balance: Math.max(b.net_payable - (b.total_paid + amount), 0),
              status: b.net_payable - (b.total_paid + amount) <= 0 ? 'FULLY_PAID' : 'DP_PAID',
            }
          : b
      )
    );
  };

  const handleSettleMargin = (settlementId: string) => {
    setKsoMargins((prev) =>
      prev.map((m) =>
        m.settlement_id === settlementId
          ? {
              ...m,
              settlement_status: 'SETTLED',
            }
          : m
      )
    );
  };

  // Fase 4 Handlers
  const handleAddRequest = (ro: PurchaseRequest) => setPurchaseRequests([ro, ...purchaseRequests]);
  const handleAddOrder = (po: PurchaseOrder) => setPurchaseOrders([po, ...purchaseOrders]);
  const handleAddPayment = (vp: VendorPayment) => setVendorPayments([vp, ...vendorPayments]);
  const handleAddIssue = (gi: GoodsIssue) => setGoodsIssues([gi, ...goodsIssues]);
  const handleAddHandover = (ho: EquipmentHandover) => setEquipmentHandovers([ho, ...equipmentHandovers]);
  const handleDisposeAsset = (disp: AssetDisposal) => {
    setAssetDisposals([disp, ...assetDisposals]);
    setFixedAssets((prev) =>
      prev.map((a) => (a.asset_id === disp.asset_id ? { ...a, status: 'DISPOSED' } : a))
    );
  };
  const handleRecognizeRevenue = (manifestId: string) => {
    setManifests((prev) =>
      prev.map((m) =>
        m.manifest_id === manifestId
          ? { ...m, status: 'DEPARTED', revenue_recognized: true }
          : m
      )
    );
    const newJrn: JournalMaster = {
      journal_id: `jrn-rev-${Date.now()}`,
      tenant_id: '11111111-1111-1111-1111-111111111111',
      branch_id: currentBranch.branch_code,
      owner_branch_id: currentBranch.branch_code,
      journal_number: `JRN/REV/${Date.now().toString().slice(-6)}`,
      transaction_date: new Date().toISOString().slice(0, 10),
      doc_no: `MNF-${manifestId}`,
      doc_date: new Date().toISOString().slice(0, 10),
      workflow_stage: 'RELEASED',
      workflow_status: 'RELEASED',
      total_debit: 1327500000,
      total_credit: 1327500000,
      maker_user_name: 'AUTO_SP_RECOGNIZE_REVENUE',
      notes: `Pengakuan Pendapatan Manifest Terbangkan Jamaah (MNF-${manifestId})`,
      bodies: [],
    };
    setJournalMasters([newJrn, ...journalMasters]);
  };

  // =========================================================================
  // ENTERPRISE BIRO UMRAH & HAJI WORKFLOW TAB DEFINITIONS
  // Disusun murni berdasarkan Logika Bisnis Enterprise (Tanpa istilah Fase 1-7)
  // =========================================================================

  // 1. Master Data & Konfigurasi Enterprise
  const moduleMasterTabs = [
    {
      id: 'MASTER_BRANCH',
      label: 'Cabang & Entitas Bisnis',
      icon: Network,
      badge: 'Multi-Cabang & KSO',
      phaseId: 'MODULE_MASTER',
    },
    {
      id: 'MASTER_SISKOPATUH',
      label: 'Integrasi Siskopatuh Kemenag',
      icon: FileCheck2,
      badge: 'Verifikasi Kemenag',
      phaseId: 'MODULE_MASTER',
    },
    {
      id: 'MASTER_COA',
      label: 'Bagan Akun (Single COA)',
      icon: FileSpreadsheet,
      badge: 'Single COA Syariah',
      phaseId: 'MODULE_MASTER',
    },
    {
      id: 'MASTER_HR_VENDOR',
      label: 'SDM Pegawai, Kurs & Vendor',
      icon: Briefcase,
      badge: 'Master SDM & Rekanan',
      phaseId: 'MODULE_MASTER',
    },
    {
      id: 'MASTER_JOURNAL_ARCH',
      label: 'Jurnal Transaksi Multi-Valas',
      icon: Layers,
      badge: 'SAR / USD / IDR',
      phaseId: 'MODULE_MASTER',
    },
    {
      id: 'MASTER_SPLIT_SCREEN',
      label: 'Master Data & Audit Trail',
      icon: ListFilter,
      badge: 'Dual Audit Trail',
      phaseId: 'MODULE_MASTER',
    },
  ];

  // 2. CRM Leads & Keagenan B2B
  const moduleCrmTabs = [
    {
      id: 'CRM_LEADS_B2B',
      label: 'Pipeline Prospek & B2B Wholesale',
      icon: Briefcase,
      badge: 'Kanban & Porsi BPIH',
      phaseId: 'MODULE_CRM_B2B',
    },
    {
      id: 'CRM_AGENT_COMM',
      label: 'Komisi Agen Multi-Tier',
      icon: Users,
      badge: 'Upline & Downline',
      phaseId: 'MODULE_CRM_B2B',
    },
    {
      id: 'CRM_AGENT_WALLET',
      label: 'Dompet Deposit Agen',
      icon: Wallet,
      badge: 'Deposit Saldo',
      phaseId: 'MODULE_CRM_B2B',
    },
    {
      id: 'CRM_KSO_MARGIN',
      label: 'Margin Wholesale Cabang KSO',
      icon: TrendingUp,
      badge: 'B2B & PPh 23',
      phaseId: 'MODULE_CRM_B2B',
    },
  ];

  // 3. Paket Umrah & Haji, Kuota & Pendaftaran
  const modulePackagesTabs = [
    {
      id: 'PACKAGE_RAB_SEATS',
      label: 'Master Paket & Kuota Kursi',
      icon: Package,
      badge: 'RAB Locking',
      phaseId: 'MODULE_PACKAGES',
    },
    {
      id: 'BOOKING_REGISTRATION',
      label: 'Pendaftaran & Registrasi Booking',
      icon: Users,
      badge: 'Endorsement & Kamar',
      phaseId: 'MODULE_PACKAGES',
    },
    {
      id: 'ESCROW_REFUND',
      label: 'Tabungan Escrow & Refund',
      icon: PiggyBank,
      badge: 'Escrow Syariah',
      phaseId: 'MODULE_PACKAGES',
    },
    {
      id: 'JAMAAH_PORTAL',
      label: 'Portal Layanan Jamaah',
      icon: Compass,
      badge: 'Self-Service Jamaah',
      phaseId: 'MODULE_PACKAGES',
    },
  ];

  // 4. Pengadaan (Procurement) & Logistik Perlengkapan
  const moduleProcurementTabs = [
    {
      id: 'PROCUREMENT_VALAS',
      label: 'Pengadaan Hotel, Pesawat & Visa',
      icon: ShoppingCart,
      badge: 'Tender Hotel SAR',
      phaseId: 'MODULE_PROCUREMENT',
    },
    {
      id: 'WAREHOUSE_LUGGAGE',
      label: 'Gudang Logistik & Resi Koper',
      icon: Boxes,
      badge: 'Resi Pengiriman',
      phaseId: 'MODULE_PROCUREMENT',
    },
  ];

  // 5. Operasional Keberangkatan & Saudi Ops
  const moduleOperationsTabs = [
    {
      id: 'MANIFEST_HANDLING',
      label: 'Manifes Bandara & Rooming List',
      icon: Compass,
      badge: 'Rooming & Handling',
      phaseId: 'MODULE_OPERATIONS',
    },
    {
      id: 'ITINERARY_INSURANCE',
      label: 'Jadwal Perjalanan & Asuransi',
      icon: Calendar,
      badge: 'Muassasah Saudi',
      phaseId: 'MODULE_OPERATIONS',
    },
    {
      id: 'CASH_ADVANCE_ELPJ',
      label: 'Uang Muka Muthawif & LPJ',
      icon: Coins,
      badge: 'Field Riyal Ops',
      phaseId: 'MODULE_OPERATIONS',
    },
    {
      id: 'COMMAND_CENTER',
      label: 'Pusat Kendali Operasi Saudi',
      icon: Compass,
      badge: 'Live Ops 24/7',
      phaseId: 'MODULE_OPERATIONS',
    },
  ];

  // 6. Kasir, Payroll & Payment Gateway
  const moduleFinanceTabs = [
    {
      id: 'PAYMENT_WEBHOOK',
      label: 'Kanal Pembayaran & Gateway',
      icon: CreditCard,
      badge: 'Midtrans / Xendit',
      phaseId: 'MODULE_FINANCE',
    },
    {
      id: 'PETTY_CASH_PAYROLL',
      label: 'Kas Kecil & Penggajian',
      icon: Wallet,
      badge: 'Imprest Fund',
      phaseId: 'MODULE_FINANCE',
    },
    {
      id: 'TAX_INTERBRANCH',
      label: 'Pajak & Rekonsiliasi Cabang',
      icon: BadgePercent,
      badge: 'PPh 23 & PPN 1.1%',
      phaseId: 'MODULE_FINANCE',
    },
  ];

  // 7. Akuntansi Syariah & Finansial Konsolidasi
  const moduleAccountingTabs = [
    {
      id: 'FINANCIAL_CONSOLIDATION',
      label: 'Laporan Keuangan Konsolidasi',
      icon: Scale,
      badge: 'Eliminasi RAK & KSO',
      phaseId: 'MODULE_ACCOUNTING',
    },
    {
      id: 'REVENUE_RECOGNITION',
      label: 'Pengakuan Pendapatan Paket',
      icon: TrendingUp,
      badge: 'Amortisasi Uang Muka',
      phaseId: 'MODULE_ACCOUNTING',
    },
    {
      id: 'UNREALIZED_FX',
      label: 'Revaluasi Kurs & Valas',
      icon: Coins,
      badge: 'Kurs BI Akhir Bulan',
      phaseId: 'MODULE_ACCOUNTING',
    },
    {
      id: 'BANK_RECONCILIATION',
      label: 'Rekonsiliasi Rekening Bank',
      icon: FileCheck,
      badge: 'Statement Matcher',
      phaseId: 'MODULE_ACCOUNTING',
    },
    {
      id: 'INBOX_AUDIT_GL',
      label: 'Persetujuan Jurnal & Buku Besar',
      icon: Inbox,
      badge: 'Maker-Checker Audit',
      phaseId: 'MODULE_ACCOUNTING',
    },
  ];

  // 8. Purna Ibadah, Evaluasi Jamaah & Komunikasi
  const modulePostTripTabs = [
    {
      id: 'SURVEY_CAMPAIGNS',
      label: 'Evaluasi Jamaah & Siaran WhatsApp',
      icon: Star,
      badge: 'Kepuasan & Siaran',
      phaseId: 'MODULE_POST_TRIP',
    },
    {
      id: 'BRANDING_DOCS_GCAL',
      label: 'Template Surat Resmi & Kalender Manasik',
      icon: Palette,
      badge: 'Surat & Manasik',
      phaseId: 'MODULE_POST_TRIP',
    },
    {
      id: 'POSTTRIP_LOGISTICS',
      label: 'Pengembalian Audio Whisper & Zamzam',
      icon: Compass,
      badge: 'Logistik Purna',
      phaseId: 'MODULE_POST_TRIP',
    },
  ];

  // 9. Tata Kelola, Keamanan RBAC & Database SQL
  const moduleSecurityTabs = [
    {
      id: 'DATABASE_DDL_SCHEMA',
      label: 'Skema Data & Konfigurasi TI',
      icon: Code,
      badge: 'Admin IT Only',
      phaseId: 'MODULE_SECURITY_DDL',
    },
  ];

  // Dynamic Current Tabs Resolution with backward-compatibility
  const currentTabs =
    activePhase === 'MODULE_MASTER' || activePhase === 'FASE1' || activePhase === 'FASE2'
      ? moduleMasterTabs
      : activePhase === 'MODULE_CRM_B2B' || activePhase === 'CRM_B2B' || activePhase === 'FASE7' || activePhase === 'FASE5'
      ? moduleCrmTabs
      : activePhase === 'MODULE_PACKAGES' || activePhase === 'FASE3' || activePhase === 'PACKAGES'
      ? modulePackagesTabs
      : activePhase === 'MODULE_PROCUREMENT' || activePhase === 'FASE4' || activePhase === 'PROCUREMENT'
      ? moduleProcurementTabs
      : activePhase === 'MODULE_OPERATIONS' || activePhase === 'OPERATIONS'
      ? moduleOperationsTabs
      : activePhase === 'MODULE_FINANCE' || activePhase === 'FINANCE'
      ? moduleFinanceTabs
      : activePhase === 'MODULE_ACCOUNTING' || activePhase === 'FASE6' || activePhase === 'ACCOUNTING'
      ? moduleAccountingTabs
      : activePhase === 'MODULE_POST_TRIP' || activePhase === 'POST_TRIP'
      ? modulePostTripTabs
      : activePhase === 'MODULE_SECURITY_DDL' || activePhase === 'DDL' || activePhase === 'SECURITY_DDL'
      ? moduleSecurityTabs
      : moduleCrmTabs;

  const phaseTitles: Record<string, string> = {
    MODULE_MASTER: 'Master Data & Entitas Bisnis',
    MODULE_CRM_B2B: 'CRM Prospek & Kemitraan',
    MODULE_PACKAGES: 'Paket & Pendaftaran Jamaah',
    MODULE_PROCUREMENT: 'Pengadaan & Logistik',
    MODULE_OPERATIONS: 'Operasional & Saudi Ops',
    MODULE_FINANCE: 'Kasir & Pembayaran',
    MODULE_ACCOUNTING: 'Akuntansi & Keuangan Konsolidasi',
    MODULE_POST_TRIP: 'Purna Ibadah & Evaluasi',
    MODULE_SECURITY_DDL: 'Administrasi Sistem TI',
    // Fallback legacy phase keys:
    FASE7: 'CRM Prospek & Kemitraan',
    FASE6: 'Akuntansi & Keuangan Konsolidasi',
    FASE5: 'CRM Prospek & Kemitraan',
    FASE4: 'Pengadaan & Logistik',
    FASE3: 'Paket & Pendaftaran Jamaah',
    FASE2: 'Master Data & Entitas Bisnis',
    FASE1: 'Master Data & Entitas Bisnis',
    DDL: 'Administrasi Sistem TI',
  };

  const isSuperAdminOrTenantHq =
    currentRole === 'ADMIN_SAAS' || currentRole === 'ADMIN_HQ';

  const phaseGroups: PhaseGroup[] = [
    {
      id: 'MODULE_MASTER',
      title: 'Master Data & Entitas',
      badge: '6 Modul',
      icon: Building2,
      accentColor: 'bg-emerald-600',
      badgeBg: 'bg-emerald-800/80',
      items: moduleMasterTabs,
    },
    {
      id: 'MODULE_CRM_B2B',
      title: 'CRM Prospek & Kemitraan',
      badge: '4 Modul',
      icon: Briefcase,
      accentColor: 'bg-blue-600',
      badgeBg: 'bg-blue-800/80',
      items: moduleCrmTabs,
    },
    {
      id: 'MODULE_PACKAGES',
      title: 'Paket & Pendaftaran',
      badge: '4 Modul',
      icon: Package,
      accentColor: 'bg-teal-600',
      badgeBg: 'bg-teal-800/80',
      items: modulePackagesTabs,
    },
    {
      id: 'MODULE_PROCUREMENT',
      title: 'Pengadaan & Logistik',
      badge: '2 Modul',
      icon: ShoppingCart,
      accentColor: 'bg-amber-600',
      badgeBg: 'bg-amber-800/80',
      items: moduleProcurementTabs,
    },
    {
      id: 'MODULE_OPERATIONS',
      title: 'Operasional & Saudi Ops',
      badge: '4 Modul',
      icon: Compass,
      accentColor: 'bg-cyan-600',
      badgeBg: 'bg-cyan-800/80',
      items: moduleOperationsTabs,
    },
    {
      id: 'MODULE_FINANCE',
      title: 'Kasir & Pembayaran',
      badge: '3 Modul',
      icon: CreditCard,
      accentColor: 'bg-purple-600',
      badgeBg: 'bg-purple-800/80',
      items: moduleFinanceTabs,
    },
    {
      id: 'MODULE_ACCOUNTING',
      title: 'Akuntansi & Keuangan',
      badge: '5 Modul',
      icon: Scale,
      accentColor: 'bg-indigo-600',
      badgeBg: 'bg-indigo-800/80',
      items: moduleAccountingTabs,
    },
    {
      id: 'MODULE_POST_TRIP',
      title: 'Purna Ibadah & Evaluasi',
      badge: '3 Modul',
      icon: Star,
      accentColor: 'bg-rose-600',
      badgeBg: 'bg-rose-800/80',
      items: modulePostTripTabs,
    },
    ...(isSuperAdminOrTenantHq
      ? [
          {
            id: 'MODULE_SECURITY_DDL',
            title: 'Administrasi Sistem TI',
            badge: 'Admin Only',
            icon: ShieldCheck,
            accentColor: 'bg-slate-600',
            badgeBg: 'bg-slate-800/80',
            items: moduleSecurityTabs,
          },
        ]
      : []),
  ];

  const activePhaseTitle = phaseTitles[activePhase] || 'Biro Umrah & Haji Enterprise';
  const activeTabLabel =
    currentTabs.find((t) => t.id === activeTab)?.label || activePhaseTitle;

  // Dedicated Login Screen if not logged in
  if (!isLoggedIn) {
    return (
      <LoginPage
        availableTenants={mockTenants}
        availableBranches={mockResolvedBranches}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const accessCheck = checkMenuAccess(activeTab, currentRole);

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        theme === 'light'
          ? 'bg-slate-100 text-slate-900'
          : theme === 'sage'
          ? 'bg-[#F4F8F7] text-[#162C27]'
          : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Toast Notification Container */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Quick Login / Profile Switcher Modal */}
      {showLoginModal && (
        <LoginPage
          availableTenants={mockTenants}
          availableBranches={mockResolvedBranches}
          onLoginSuccess={handleLoginSuccess}
          onCancel={() => setShowLoginModal(false)}
          isOverlay={true}
        />
      )}

      {/* Dynamic Auto-Hiding & Resizable Sidebar */}
      <Sidebar
        phaseGroups={phaseGroups}
        activePhase={activePhase}
        activeTab={activeTab}
        onSelectTab={(phaseId, tabId) => {
          setActivePhase(phaseId);
          setActiveTab(tabId);
        }}
        currentRole={currentRole}
        currentUserProfile={currentUserProfile}
        currentBranch={currentBranch}
        currentTenant={currentTenant}
        onLogout={handleLogout}
        onOpenLoginModal={() => setShowLoginModal(true)}
        isPinned={isPinned}
        onTogglePin={() => {
          setIsPinned(!isPinned);
          showNotification(
            'info',
            !isPinned ? 'Sidebar Terkunci (Pinned)' : 'Mode Auto-Hide Aktif',
            !isPinned
              ? 'Sidebar akan tetap terbuka permanen di layar.'
              : 'Sidebar akan otomatis ciut/sembunyi saat kursor berpindah.'
          );
        }}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        theme={theme}
        sidebarWidth={sidebarWidth}
        onSidebarWidthChange={setSidebarWidth}
      />

      {/* Main Content Layout Container (dynamically padded based on draggable sidebar width) */}
      <div
        className={`flex-1 flex flex-col transition-[padding] duration-150 ease-out ${
          !isPinned || isCollapsed ? 'lg:pl-20' : ''
        }`}
        style={{
          paddingLeft: isDesktop && isPinned && !isCollapsed ? `${sidebarWidth}px` : undefined,
        }}
      >
        {/* Top Header */}
        <Header
          currentTenant={currentTenant}
          onTenantChange={(t) => {
            setCurrentTenant(t);
            showNotification('info', 'Tenant Diperbarui', `Beralih ke entitas ${t.company_name}.`);
          }}
          availableTenants={mockTenants}
          currentBranch={currentBranch}
          onBranchChange={handleBranchChange}
          availableBranches={mockResolvedBranches}
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          currentUserProfile={currentUserProfile}
          onOpenLoginModal={() => setShowLoginModal(true)}
          onLogout={handleLogout}
          onToggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)}
          isPinned={isPinned}
          onTogglePin={() => setIsPinned(!isPinned)}
          activePhaseTitle={activePhaseTitle}
          activeTabLabel={activeTabLabel}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Main Content Workspace (Murni Aplikasi Form Berdasarkan RBAC) */}
        <main className="flex-1 w-full mx-auto px-3 sm:px-6 lg:px-[5%] py-5 space-y-5">
          {/* RBAC Access Restriction Card */}
          {!accessCheck.isAccessible ? (
            <div className="bg-slate-900 border border-rose-900/40 rounded-2xl p-8 text-center max-w-2xl mx-auto space-y-4 my-8 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto shadow-lg">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Akses Dibatasi oleh Kebijakan Keamanan (RBAC &amp; RLS)
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {accessCheck.reason}
              </p>
              <div className="p-3 bg-slate-950 rounded-xl text-xs text-slate-400 font-mono inline-block border border-slate-800">
                Sesi Saat Ini: <strong className="text-rose-400">{currentRole}</strong> • Cabang: <strong className="text-cyan-400">{currentBranch.branch_code}</strong>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                <button
                  onClick={() => {
                    const hqProfile = DEMO_PROFILES[0];
                    handleLoginSuccess(hqProfile, currentTenant, mockResolvedBranches[0], 'ADMIN_HQ');
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-lg transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Beralih ke Super Admin HQ (Full Access)</span>
                </button>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                >
                  Pilih Profil Lain
                </button>
              </div>
            </div>
          ) : (
            <>

        {/* ========================================================================= */}
        {/* 1. MASTER DATA & KONFIGURASI ENTERPRISE                                    */}
        {/* ========================================================================= */}
        {(activeTab === 'MASTER_BRANCH' || activeTab === 'FASE1_BRANCH') && (
          <BranchResolverTab
            generalMasters={mockGeneralMasters}
            currentRole={currentRole}
          />
        )}

        {(activeTab === 'MASTER_SISKOPATUH' || activeTab === 'FASE1_SISKOPATUH') && (
          <SiskopatuhValidatorTab
            customers={mockCustomers}
            onAddCustomer={(newCust) => console.log('New customer', newCust)}
          />
        )}

        {(activeTab === 'MASTER_COA' || activeTab === 'FASE2_COA_REQUESTS') && (
          <CoaAndRequestsTab
            coas={chartOfAccounts}
            requests={masterRequests}
            onApproveRequest={() => {}}
            onRejectRequest={() => {}}
            onSubmitNewRequest={(req) => setMasterRequests([req, ...masterRequests])}
            currentBranchCode={currentBranch.branch_code}
            currentRole={currentRole}
          />
        )}

        {(activeTab === 'MASTER_HR_VENDOR' || activeTab === 'FASE1_HR') && (
          <HrAndMasterTab
            employees={mockEmployees}
            attendances={mockAttendances}
            leaveRequests={mockLeaveRequests}
            payrolls={mockPayrollComponents}
            exchangeRates={mockExchangeRates}
            sequences={mockDocumentSequences}
            vendors={mockVendors}
            vendorRegistrations={mockVendorRegistrations}
          />
        )}

        {(activeTab === 'MASTER_JOURNAL_ARCH' || activeTab === 'FASE1_JOURNAL') && (
          <JournalArchitectureTab
            journals={journalMasters}
          />
        )}

        {(activeTab === 'MASTER_SPLIT_SCREEN' || activeTab === 'FASE2_SPLIT_SCREEN') && (
          <MasterDataSplitScreen
            generalMasters={mockGeneralMasters}
            onSaveMaster={() => {}}
            onDeleteMaster={() => {}}
            currentRole={currentRole}
          />
        )}

        {/* ========================================================================= */}
        {/* 2. CRM LEADS & KEAGENAN B2B                                               */}
        {/* ========================================================================= */}
        {(activeTab === 'CRM_LEADS_B2B' || activeTab === 'FASE7_SALES_B2B') && (
          <SalesCrmAndB2BTab
            salesLeads={salesLeads}
            b2bOrders={b2bOrders}
            hajjPortions={hajjPortions}
            currentRole={currentRole}
            currentUserId="usr-hq-01"
            currentBranchCode={currentBranch.branch_code}
            onUpdateLeadStage={handleUpdateLeadStage}
            onAddSalesLead={handleAddSalesLead}
            onGenerateB2bJournal={handleGenerateB2bJournal}
            onAddB2bOrder={handleAddB2bOrder}
            onRevalueHajjCurrency={handleRevalueHajjCurrency}
          />
        )}

        {(activeTab === 'CRM_AGENT_COMM' || activeTab === 'FASE5_AGENT_COMM') && (
          <AgentCommissionTab
            commissions={commissions}
            onDisburseCommission={handleDisburseCommission}
            currentBranchCode={currentBranch.branch_code}
          />
        )}

        {(activeTab === 'CRM_AGENT_WALLET' || activeTab === 'FASE5_AGENT_WALLET') && (
          <AgentWalletTab
            wallets={wallets}
            mutations={walletMutations}
            bookings={bookings}
            onTopupWallet={handleTopupWallet}
            onPayViaWallet={handlePayViaWallet}
          />
        )}

        {(activeTab === 'CRM_KSO_MARGIN' || activeTab === 'FASE5_KSO_MARGIN') && (
          <KsoB2BMarginTab
            margins={ksoMargins}
            onSettleMargin={handleSettleMargin}
            currentRole={currentRole}
            currentBranchCode={currentBranch.branch_code}
          />
        )}

        {/* ========================================================================= */}
        {/* 3. PAKET, KUOTA & PENDAFTARAN                                             */}
        {/* ========================================================================= */}
        {(activeTab === 'PACKAGE_RAB_SEATS' || activeTab === 'FASE3_PACKAGES') && (
          <PackageRabAndSeatsTab
            packages={packages}
            allocations={mockFlightAllocations}
            rabs={mockPackageRabs}
            onReleasePackage={(pkgId) =>
              setPackages((prev) =>
                prev.map((p) => (p.package_id === pkgId ? { ...p, workflow_status: 'RELEASED', is_locked: true } : p))
              )
            }
            onAddPackage={(newPkg) => setPackages((prev) => [newPkg, ...prev])}
            currentBranchCode={currentBranch.branch_code}
            currentRole={currentRole}
          />
        )}

        {(activeTab === 'BOOKING_REGISTRATION' || activeTab === 'FASE3_SALES') && (
          <BookingsAndSalesTab
            bookings={bookings}
            customers={mockCustomers}
            packages={packages}
            rabs={mockPackageRabs}
            onAddBooking={(b) => setBookings((prev) => [b, ...prev])}
            onUpdateBooking={(updated) =>
              setBookings((prev) => prev.map((b) => (b.booking_id === updated.booking_id ? updated : b)))
            }
            currentBranchCode={currentBranch.branch_code}
            currentRole={currentRole}
          />
        )}

        {(activeTab === 'ESCROW_REFUND' || activeTab === 'FASE3_ESCROW') && (
          <EscrowAndRefundTab
            savingAccounts={savingAccounts}
            savingMutations={savingMutations}
            cancellations={cancellations}
            bookings={bookings}
            onConvertSaving={(custId, bkgId, amt) => {
              setSavingAccounts((prev) =>
                prev.map((a) => (a.customer_id === custId ? { ...a, current_balance: a.current_balance - amt } : a))
              );
            }}
            onApproveRefund={(canId) => {
              setCancellations((prev) =>
                prev.map((c) => (c.cancellation_id === canId ? { ...c, refund_status: 'APPROVED' } : c))
              );
            }}
            currentBranchCode={currentBranch.branch_code}
          />
        )}

        {(activeTab === 'JAMAAH_PORTAL' || activeTab === 'FASE3_PORTAL') && (
          <JamaahPortalDashboardTab
            summary={mockJamaahDashboardSummary}
            roommates={mockRoommateAllocations}
            galleries={mockGroupGalleries}
            adminTracking={mockJamaahAdministrations}
            attendances={manasikAttendances}
            onScanAttendance={(attId) => {
              setManasikAttendances((prev) =>
                prev.map((a) => (a.attendance_id === attId ? { ...a, is_present: true } : a))
              );
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* 4. PENGADAAN & LOGISTIK PERLENGKAPAN                                      */}
        {/* ========================================================================= */}
        {(activeTab === 'PROCUREMENT_VALAS' || activeTab === 'FASE4_PROCUREMENT') && (
          <ProcurementAndValasTab
            requests={purchaseRequests}
            tenders={mockTenders}
            orders={purchaseOrders}
            payments={vendorPayments}
            onAddRequest={handleAddRequest}
            onAddOrder={handleAddOrder}
            onAddPayment={handleAddPayment}
            currentBranchCode={currentBranch.branch_code}
            currentRole={currentRole}
          />
        )}

        {(activeTab === 'WAREHOUSE_LUGGAGE' || activeTab === 'FASE4_WAREHOUSE') && (
          <WarehouseAndAssetsTab
            plants={mockPlants}
            inventories={mockPlantInventories}
            issues={goodsIssues}
            handovers={equipmentHandovers}
            assets={fixedAssets}
            disposals={assetDisposals}
            onAddIssue={handleAddIssue}
            onAddHandover={handleAddHandover}
            onDisposeAsset={handleDisposeAsset}
            currentBranchCode={currentBranch.branch_code}
            currentRole={currentRole}
          />
        )}

        {(activeTab === 'POSTTRIP_LOGISTICS' || activeTab === 'FASE7_LOGISTICS') && (
          <PostTripAndLogisticsTab
            equipmentLoans={equipmentLoans}
            zamzamPickups={zamzamPickups}
            certificates={certificates}
            onReturnEquipment={handleReturnEquipment}
            onUpdateZamzamStatus={handleUpdateZamzamStatus}
          />
        )}

        {/* ========================================================================= */}
        {/* 5. OPERASIONAL & SAUDI OPS                                                 */}
        {/* ========================================================================= */}
        {(activeTab === 'MANIFEST_HANDLING' || activeTab === 'FASE4_TOUROPS') && (
          <TourOpsAndLuggageTab
            manifests={manifests}
            roomings={mockRoomingLists}
            luggages={luggageList}
            onAddLuggageScan={(scan) => setLuggageList([scan, ...luggageList])}
            currentRole={currentRole}
            currentUserId="usr-hq-01"
          />
        )}

        {(activeTab === 'ITINERARY_INSURANCE' || activeTab === 'FASE4_ITINERARY_INS') && (
          <ItineraryAndInsuranceTab
            itineraries={mockItineraries}
            realizations={itineraryRealizations}
            insurances={insurancePolicies}
            onAddRealization={(r) => setItineraryRealizations([r, ...itineraryRealizations])}
            onAddInsurance={(i) => setInsurancePolicies([i, ...insurancePolicies])}
            currentBranchCode={currentBranch.branch_code}
          />
        )}

        {(activeTab === 'CASH_ADVANCE_ELPJ' || activeTab === 'FASE3_CASH_ADVANCE') && (
          <CashAdvanceAndElpjTab
            advances={cashAdvances}
            claims={fieldClaims}
            onDisburseAdvance={(id) =>
              setCashAdvances((prev) =>
                prev.map((ca) => (ca.advance_id === id ? { ...ca, status: 'DISBURSED' } : ca))
              )
            }
            onAddClaim={(c) => setFieldClaims([c, ...fieldClaims])}
            onClearAdvance={(id) =>
              setCashAdvances((prev) =>
                prev.map((ca) => (ca.advance_id === id ? { ...ca, status: 'SETTLED' } : ca))
              )
            }
            currentRole={currentRole}
            currentBranchCode={currentBranch.branch_code}
          />
        )}

        {(activeTab === 'COMMAND_CENTER' || activeTab === 'FASE6_EXECUTIVE_DASHBOARD') && (
          <ExecutiveAndCommandCenterTab
            kloterProfitabilities={kloterProfitabilities}
            seatLoadFactors={mockSeatLoadFactors}
            commandCenterItems={commandCenterItems}
            onUpdateActivityStatus={handleUpdateActivityStatus}
          />
        )}

        {/* ========================================================================= */}
        {/* 6. KASIR, PAYROLL & PAYMENT GATEWAY                                        */}
        {/* ========================================================================= */}
        {(activeTab === 'PAYMENT_WEBHOOK' || activeTab === 'FASE6_WEBHOOK_GATEWAY') && (
          <PaymentGatewayWebhookTab
            bookings={bookings}
            webhooks={paymentWebhooks}
            onTriggerWebhook={handleTriggerWebhook}
          />
        )}

        {(activeTab === 'PETTY_CASH_PAYROLL' || activeTab === 'FASE2_PETTY_PAYROLL') && (
          <PettyCashAndPayrollTab
            expenses={officeExpenses}
            payrollRun={payrollRuns[0] || mockPayrollRun}
            onAddExpense={(exp) => setOfficeExpenses([exp, ...officeExpenses])}
            onGeneratePayrollJournal={() => {}}
            currentBranchCode={currentBranch.branch_code}
            currentRole={currentRole}
          />
        )}

        {(activeTab === 'TAX_INTERBRANCH' || activeTab === 'FASE2_TAX') && (
          <TaxAndInterbranchTab />
        )}

        {/* ========================================================================= */}
        {/* 7. AKUNTANSI SYARIAH & KONSOLIDASI                                         */}
        {/* ========================================================================= */}
        {(activeTab === 'FINANCIAL_CONSOLIDATION' || activeTab === 'FASE6_FINANCIAL_REPORTS') && (
          <FinancialReportsTab
            profitLossItems={mockProfitLossItems}
            balanceSheetItems={mockBalanceSheetItems}
            consolidationRows={mockConsolidationRows}
            currentRole={currentRole}
            currentBranchCode={currentBranch.branch_code}
          />
        )}

        {(activeTab === 'REVENUE_RECOGNITION' || activeTab === 'FASE4_REV_RECOG') && (
          <RevenueRecognitionTab
            manifests={manifests}
            onTriggerDeparture={handleRecognizeRevenue}
          />
        )}

        {(activeTab === 'UNREALIZED_FX' || activeTab === 'FASE5_UNREALIZED_FX') && (
          <UnrealizedFxTab
            fxItems={mockUnrealizedFxItems}
            onTriggerRevaluation={handleTriggerRevaluation}
            currentRole={currentRole}
          />
        )}

        {(activeTab === 'BANK_RECONCILIATION' || activeTab === 'FASE5_BANK_RECON') && (
          <BankReconciliationTab
            accounts={mockBankAccounts}
            statements={bankStatements}
            onAutoReconcile={handleAutoReconcile}
            onManualMatch={handleManualMatch}
          />
        )}

        {(activeTab === 'INBOX_AUDIT_GL' || activeTab === 'FASE2_INBOX_AUDIT') && (
          <InboxAndAuditTab
            journals={journalMasters}
            expenses={officeExpenses}
            payrollRun={payrollRuns[0] || mockPayrollRun}
            auditLogs={auditLogs}
            glEntries={mockGeneralLedgerEntries}
            onApproveJournal={() => {}}
            onReleaseJournal={() => {}}
            currentBranchCode={currentBranch.branch_code}
            currentRole={currentRole}
          />
        )}

        {/* ========================================================================= */}
        {/* 8. PURNA IBADAH, SURVEI & CRM PEMASARAN                                   */}
        {/* ========================================================================= */}
        {(activeTab === 'SURVEY_CAMPAIGNS' ||
          activeTab === 'SURVEY_REVIEWS' ||
          activeTab === 'WA_CAMPAIGNS' ||
          activeTab === 'FASE7_SURVEY_WA') && (
          <SurveyAndCampaignsTab
            surveys={customerSurveys}
            alumniRecords={alumniRecords}
            campaigns={campaigns}
            messageLogs={waMessageLogs}
            onSubmitSurvey={handleSubmitSurvey}
            onSendBroadcastCampaign={handleSendBroadcastCampaign}
            onCreateCampaign={handleCreateCampaign}
          />
        )}

        {(activeTab === 'BRANDING_DOCS_GCAL' ||
          activeTab === 'BRANDING_GCAL' ||
          activeTab === 'DOCUMENTS_LETTERS' ||
          activeTab === 'FASE7_THEMING_GCAL' ||
          activeTab === 'FASE2_DOCS') && (
          <ThemingAndCalendarTab
            branchSettings={branchSettings}
            templates={dynamicTemplates}
            outgoingLetters={outgoingLettersFase7}
            onUpdateBranchTheme={handleUpdateBranchTheme}
            onUpdateCalendarConfig={handleUpdateCalendarConfig}
            onIssueOutgoingLetter={handleIssueOutgoingLetter}
            onTriggerGcalSync={handleTriggerGcalSync}
          />
        )}

        {/* ========================================================================= */}
        {/* 9. TATA KELOLA, KEAMANAN RBAC & DATABASE SQL                              */}
        {/* ========================================================================= */}
        {(activeTab === 'SECURITY_RBAC_RLS' || activeTab === 'FASE1_RLS') && (
          <RlsSimulatorTab
            currentRole={currentRole}
            onRoleChange={setCurrentRole}
            customers={mockCustomers}
            generalMasters={mockGeneralMasters}
            users={mockUsers}
            currentBranchCode={currentBranch.branch_code}
          />
        )}

        {(activeTab === 'DATABASE_DDL_SCHEMA' ||
          activeTab === 'DDL_VIEWER' ||
          activePhase === 'DDL' ||
          activePhase === 'MODULE_SECURITY_DDL') && (
          <DdlViewerTab
            sqlContentFase1={rawSqlFase1}
            sqlContentFase2={rawSqlFase2}
            sqlContentFase3={rawSqlFase3}
            sqlContentFase4={rawSqlFase4}
            sqlContentFase5={rawSqlFase5}
            sqlContentFase6={rawSqlFase6}
            sqlContentFase7={rawSqlFase7}
          />
        )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-slate-950 border-t border-slate-900 py-4 text-center text-xs text-slate-500">
          <div className="w-full mx-auto px-3 sm:px-6 lg:px-[5%] flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              SaaS ERP Biro Perjalanan Umrah &amp; Haji Enterprise • Platform Terpadu Multi-Tenant, Akuntansi Syariah &amp; Saudi Ops
            </span>
            <div className="flex items-center gap-2 text-slate-400">
              <span>Sistem Manajemen Operasional Terpadu</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
