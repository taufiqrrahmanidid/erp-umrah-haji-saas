import { RoleCode } from '../types/erp.ts';
import { PermissionSet, RlsPolicyRule, DemoAccountProfile } from '../types/auth.ts';

export const ROLE_PERMISSIONS: Record<RoleCode, PermissionSet> = {
  ADMIN_SAAS: {
    canManageTenants: true,
    canManageBranches: true,
    canViewAllBranches: true,
    canViewRealHpp: true,
    canAccessFinance: true,
    canApproveJournals: true,
    canManageSalesAndLeads: true,
    canManageB2B: true,
    canManageLogistics: true,
    canManageSurveysAndWA: true,
    canManageTheming: true,
    canManageProcurement: true,
    canAccessSaudiOps: true,
    canAccessAgentNetwork: true,
    canAccessPilgrimPortal: true,
    canCreateRecords: true,
    canDeleteRecords: true,
  },
  ADMIN_HQ: {
    canManageTenants: false,
    canManageBranches: true,
    canViewAllBranches: true,
    canViewRealHpp: true,
    canAccessFinance: true,
    canApproveJournals: true,
    canManageSalesAndLeads: true,
    canManageB2B: true,
    canManageLogistics: true,
    canManageSurveysAndWA: true,
    canManageTheming: true,
    canManageProcurement: true,
    canAccessSaudiOps: true,
    canAccessAgentNetwork: true,
    canAccessPilgrimPortal: true,
    canCreateRecords: true,
    canDeleteRecords: true,
  },
  OWNER_CLEVEL: {
    canManageTenants: false,
    canManageBranches: true,
    canViewAllBranches: true,
    canViewRealHpp: true,
    canAccessFinance: true,
    canApproveJournals: true,
    canManageSalesAndLeads: true,
    canManageB2B: true,
    canManageLogistics: true,
    canManageSurveysAndWA: true,
    canManageTheming: true,
    canManageProcurement: true,
    canAccessSaudiOps: true,
    canAccessAgentNetwork: true,
    canAccessPilgrimPortal: true,
    canCreateRecords: true,
    canDeleteRecords: true,
  },
  ADMIN_BRANCH: {
    canManageTenants: false,
    canManageBranches: false,
    canViewAllBranches: false,
    canViewRealHpp: false, // Masked HPP for KSO / Branch!
    canAccessFinance: true,
    canApproveJournals: false, // Cannot approve journals at HQ level, can only submit
    canManageSalesAndLeads: true,
    canManageB2B: true,
    canManageLogistics: true,
    canManageSurveysAndWA: true,
    canManageTheming: true,
    canManageProcurement: false,
    canAccessSaudiOps: false,
    canAccessAgentNetwork: true,
    canAccessPilgrimPortal: true,
    canCreateRecords: true,
    canDeleteRecords: false,
  },
  INTERNAL_SALES: {
    canManageTenants: false,
    canManageBranches: false,
    canViewAllBranches: false,
    canViewRealHpp: false,
    canAccessFinance: false,
    canApproveJournals: false,
    canManageSalesAndLeads: true,
    canManageB2B: true,
    canManageLogistics: false,
    canManageSurveysAndWA: true,
    canManageTheming: false,
    canManageProcurement: false,
    canAccessSaudiOps: false,
    canAccessAgentNetwork: true,
    canAccessPilgrimPortal: false,
    canCreateRecords: true,
    canDeleteRecords: false,
  },
  AGENT_COORDINATOR: {
    canManageTenants: false,
    canManageBranches: false,
    canViewAllBranches: false,
    canViewRealHpp: false,
    canAccessFinance: false,
    canApproveJournals: false,
    canManageSalesAndLeads: true,
    canManageB2B: false,
    canManageLogistics: false,
    canManageSurveysAndWA: false,
    canManageTheming: false,
    canManageProcurement: false,
    canAccessSaudiOps: false,
    canAccessAgentNetwork: true,
    canAccessPilgrimPortal: false,
    canCreateRecords: true,
    canDeleteRecords: false,
  },
  BRANCH_AGENT: {
    canManageTenants: false,
    canManageBranches: false,
    canViewAllBranches: false,
    canViewRealHpp: false,
    canAccessFinance: false,
    canApproveJournals: false,
    canManageSalesAndLeads: true,
    canManageB2B: false,
    canManageLogistics: false,
    canManageSurveysAndWA: false,
    canManageTheming: false,
    canManageProcurement: false,
    canAccessSaudiOps: false,
    canAccessAgentNetwork: false,
    canAccessPilgrimPortal: false,
    canCreateRecords: true,
    canDeleteRecords: false,
  },
  JAMAAH: {
    canManageTenants: false,
    canManageBranches: false,
    canViewAllBranches: false,
    canViewRealHpp: false,
    canAccessFinance: false,
    canApproveJournals: false,
    canManageSalesAndLeads: false,
    canManageB2B: false,
    canManageLogistics: false,
    canManageSurveysAndWA: true, // can fill survey
    canManageTheming: false,
    canManageProcurement: false,
    canAccessSaudiOps: false,
    canAccessAgentNetwork: false,
    canAccessPilgrimPortal: true,
    canCreateRecords: false,
    canDeleteRecords: false,
  },
  MUTHAWIF: {
    canManageTenants: false,
    canManageBranches: false,
    canViewAllBranches: false,
    canViewRealHpp: false,
    canAccessFinance: false,
    canApproveJournals: false,
    canManageSalesAndLeads: false,
    canManageB2B: false,
    canManageLogistics: true, // can manage whisper receiver & zamzam
    canManageSurveysAndWA: false,
    canManageTheming: false,
    canManageProcurement: false,
    canAccessSaudiOps: true,
    canAccessAgentNetwork: false,
    canAccessPilgrimPortal: false,
    canCreateRecords: true,
    canDeleteRecords: false,
  },
  TOUR_LEADER: {
    canManageTenants: false,
    canManageBranches: false,
    canViewAllBranches: false,
    canViewRealHpp: false,
    canAccessFinance: false,
    canApproveJournals: false,
    canManageSalesAndLeads: false,
    canManageB2B: false,
    canManageLogistics: true,
    canManageSurveysAndWA: false,
    canManageTheming: false,
    canManageProcurement: false,
    canAccessSaudiOps: true,
    canAccessAgentNetwork: false,
    canAccessPilgrimPortal: false,
    canCreateRecords: true,
    canDeleteRecords: false,
  },
  MUKIBIN: {
    canManageTenants: false,
    canManageBranches: false,
    canViewAllBranches: false,
    canViewRealHpp: false,
    canAccessFinance: false,
    canApproveJournals: false,
    canManageSalesAndLeads: false,
    canManageB2B: false,
    canManageLogistics: true,
    canManageSurveysAndWA: false,
    canManageTheming: false,
    canManageProcurement: false,
    canAccessSaudiOps: true,
    canAccessAgentNetwork: false,
    canAccessPilgrimPortal: false,
    canCreateRecords: true,
    canDeleteRecords: false,
  },
};

export function getActiveRlsPolicies(
  role: RoleCode,
  branchCode: string,
  tenantId: string
): RlsPolicyRule[] {
  const policies: RlsPolicyRule[] = [
    {
      policy_name: 'tenant_isolation_policy',
      table_target: 'ALL_TABLES',
      enforcement: 'TENANT_ONLY',
      description: `Menyaring seluruh query dengan tenant_id = '${tenantId.slice(0, 8)}...'`,
    },
  ];

  if (role === 'ADMIN_SAAS' || role === 'ADMIN_HQ' || role === 'OWNER_CLEVEL') {
    policies.push({
      policy_name:
        role === 'OWNER_CLEVEL'
          ? 'executive_oversight_rls_bypass'
          : 'admin_hq_bypass_branch_policy',
      table_target: 'sales_leads, bookings, journals, manifests, financial_reports',
      enforcement: 'BYPASS',
      description:
        role === 'OWNER_CLEVEL'
          ? 'Business Owner / C-Level: Akses agregasi eksekutif lintas cabang tanpa restriksi isolasi.'
          : 'Super Admin / Direksi HQ bebas mengakses seluruh cabang tanpa filter branch_id.',
    });
  } else {
    policies.push({
      policy_name: `branch_isolation_policy_${branchCode.toLowerCase()}`,
      table_target: 'sales_leads, bookings, journals, warehouse, petty_cash',
      enforcement: 'RESTRICTED',
      description: `Row-Level Security aktif: Hanya data dengan branch_id = '${branchCode}' yang dapat dibaca dan diedit.`,
    });
  }

  if (role === 'ADMIN_BRANCH') {
    policies.push({
      policy_name: 'kso_hpp_masking_policy',
      table_target: 'packages, wholesale_margin, purchase_orders',
      enforcement: 'MASKED',
      description: 'HPP Asli Pusat disembunyikan. Hanya harga Nett Cabang KSO yang ditampilkan.',
    });
  }

  if (role === 'AGENT_COORDINATOR') {
    policies.push({
      policy_name: 'agent_tree_hierarchy_rls',
      table_target: 'agent_wallets, commissions, bookings',
      enforcement: 'RESTRICTED',
      description: 'Hanya menampilkan data downline agen dalam pohon afiliasi Koordinator.',
    });
  }

  if (role === 'BRANCH_AGENT') {
    policies.push({
      policy_name: 'agent_self_only_rls',
      table_target: 'agent_wallets, bookings',
      enforcement: 'RESTRICTED',
      description: 'Hanya menampilkan transaksi dan jamaah binaan ID pribadi agen.',
    });
  }

  if (role === 'JAMAAH') {
    policies.push({
      policy_name: 'pilgrim_portal_self_rls',
      table_target: 'customers, saving_accounts, bookings, surveys',
      enforcement: 'RESTRICTED',
      description: 'Hanya membaca data invoice, jadwal manasik, dan paspor jamaah bersangkutan.',
    });
  }

  if (role === 'MUTHAWIF' || role === 'TOUR_LEADER' || role === 'MUKIBIN') {
    policies.push({
      policy_name: 'saudi_field_ops_rls',
      table_target: 'manifests, audio_receiver_loans, zamzam_pickups, luggage_tracking',
      enforcement: 'RESTRICTED',
      description: 'Akses terbatas pada manifes keberangkatan aktif dan logistik kloter penugasan.',
    });
  }

  return policies;
}

export const DEMO_PROFILES: DemoAccountProfile[] = [
  {
    id: 'demo-saas',
    username: 'admin_saas',
    fullName: 'Super Admin SaaS Platform',
    email: 'sysadmin@umrah-erp.id',
    role: 'ADMIN_SAAS',
    roleTitle: 'Super Admin SaaS (Full Access)',
    branchCode: 'C00',
    branchName: 'Kantor Pusat & Pengawasan Global Platform',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    gender: 'L',
    badgeColor: 'bg-purple-600 text-white',
    description: 'Akses penuh tanpa batas: Mengelola seluruh tenant biro, lisensi, sistem core database, konfigurasi global, dan audit platform.',
    sampleCredentials: { username: '', pass: '' },
    defaultPhase: 'MODULE_MASTER',
    defaultTab: 'MASTER_BRANCH',
  },
  {
    id: 'demo-it-tenant',
    username: 'admin_it_tenant',
    fullName: 'Agus Setiawan, S.T.',
    email: 'it.admin@alharamain.co.id',
    role: 'ADMIN_HQ',
    roleTitle: 'Admin IT & Keamanan Tenan',
    branchCode: 'C00',
    branchName: 'Kantor Pusat Jakarta',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    gender: 'L',
    badgeColor: 'bg-teal-600 text-white',
    description: 'Administrator TI Biro Perjalanan: Manajemen akun staf biro, integrasi API & webhook, konfigurasi cabang, dan keamanan internal tenant.',
    sampleCredentials: { username: '', pass: '' },
    defaultPhase: 'MODULE_MASTER',
    defaultTab: 'MASTER_BRANCH',
  },
  {
    id: 'demo-c-level',
    username: 'ceo_owner',
    fullName: 'Ir. H. Bambang Soedibyo, M.B.A.',
    email: 'bambang.owner@alharamain.co.id',
    role: 'OWNER_CLEVEL',
    roleTitle: 'Pemilik & Komisaris Utama (Owner)',
    branchCode: 'C00',
    branchName: 'Kantor Pusat Jakarta (Pengawasan Cabang Mandiri)',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    gender: 'L',
    badgeColor: 'bg-amber-600 text-white',
    description: 'Pemilik Biro Perjalanan Umrah & Haji: Pengawasan menyeluruh atas Kantor Pusat (HQ) dan seluruh Cabang Mandiri, arus kas konsolidasi, kuota jemaah, dan performa keuangan.',
    sampleCredentials: { username: '', pass: '' },
    defaultPhase: 'MODULE_ACCOUNTING',
    defaultTab: 'FINANCIAL_CONSOLIDATION',
  },
  {
    id: 'demo-hq',
    username: 'admin_pusat',
    fullName: 'H. Muhammad Ridwan, M.M.',
    email: 'direksi@alharamain.co.id',
    role: 'ADMIN_HQ',
    roleTitle: 'Direktur Operasional Pusat',
    branchCode: 'C00',
    branchName: 'Kantor Pusat Jakarta',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    gender: 'L',
    badgeColor: 'bg-emerald-600 text-white',
    description: 'Operasional penuh: Konsolidasi seluruh cabang, otorisasi jurnal pembukuan & penetapan HPP paket.',
    sampleCredentials: { username: '', pass: '' },
    defaultPhase: 'CRM_B2B',
    defaultTab: 'CRM_LEADS_B2B',
  },
  {
    id: 'demo-branch-kdr',
    username: 'admin_kediri',
    fullName: 'Ust. Ahmad Fauzan',
    email: 'kediri@alharamain.co.id',
    role: 'ADMIN_BRANCH',
    roleTitle: 'Kepala Cabang Kediri (KSO)',
    branchCode: 'C01',
    branchName: 'Cabang Kediri KSO',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    gender: 'L',
    badgeColor: 'bg-blue-600 text-white',
    description: 'Operasional Cabang Kediri: Penjualan paket daerah, entri pengeluaran kas kecil & penanganan pendaftaran jemaah.',
    sampleCredentials: { username: '', pass: '' },
    defaultPhase: 'CRM_B2B',
    defaultTab: 'CRM_LEADS_B2B',
  },
  {
    id: 'demo-branch-bdg',
    username: 'admin_bandung',
    fullName: 'Rizki Pratama, S.E.',
    email: 'bandung@alharamain.co.id',
    role: 'ADMIN_BRANCH',
    roleTitle: 'Branch Manager Bandung (Mandiri)',
    branchCode: 'C02',
    branchName: 'Cabang Bandung Mandiri',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    gender: 'L',
    badgeColor: 'bg-indigo-600 text-white',
    description: 'Operasional Cabang Mandiri Priangan: Manajemen kas kecil, pendaftaran jemaah, dan branding kantor daerah.',
    sampleCredentials: { username: '', pass: '' },
    defaultPhase: 'POST_TRIP',
    defaultTab: 'BRANDING_GCAL',
  },
  {
    id: 'demo-sales',
    username: 'sales_executive',
    fullName: 'Nadia Safitri, S.I.Kom',
    email: 'nadia.sales@alharamain.co.id',
    role: 'INTERNAL_SALES',
    roleTitle: 'Sales & CRM Executive',
    branchCode: 'C00',
    branchName: 'Kantor Pusat Jakarta',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    gender: 'P',
    badgeColor: 'bg-emerald-600 text-white',
    description: 'Akses CRM Pipeline Leads, B2B Provider Wholesale, WA Broadcast, & Porsi Haji BPIH.',
    sampleCredentials: { username: '', pass: '' },
    defaultPhase: 'CRM_B2B',
    defaultTab: 'CRM_LEADS_B2B',
  },
  {
    id: 'demo-muthawif',
    username: 'ust_fatih_muthawif',
    fullName: 'Ust. Fatih Al-Makki, Lc.',
    email: 'muthawif.fatih@alharamain.co.id',
    role: 'MUTHAWIF',
    roleTitle: 'Muthawif Pembimbing Saudi',
    branchCode: 'C00',
    branchName: 'Operasional Saudi Arabia',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    gender: 'L',
    badgeColor: 'bg-teal-600 text-white',
    description: 'Akses Manifes Kloter, Pengembalian Whisper Receiver, Tracking Koper & Distribusi Air Zamzam.',
    sampleCredentials: { username: '', pass: '' },
    defaultPhase: 'PROCUREMENT',
    defaultTab: 'POSTTRIP_LOGISTICS',
  },
  {
    id: 'demo-upline',
    username: 'gus_miftah_coord',
    fullName: 'KH. Miftahul Huda',
    email: 'gus.miftah@pondok.org',
    role: 'AGENT_COORDINATOR',
    roleTitle: 'Koordinator Kemitraan (Upline)',
    branchCode: 'C01',
    branchName: 'Cabang Kediri KSO',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    gender: 'L',
    badgeColor: 'bg-purple-600 text-white',
    description: 'Pohon Kemitraan Downline Agen, Pemantauan Komisi Multi-Tier & Deposit Pendaftaran Jamaah.',
    sampleCredentials: { username: '', pass: '' },
    defaultPhase: 'CRM_B2B',
    defaultTab: 'CRM_AGENT_COMM',
  },
  {
    id: 'demo-jamaah',
    username: 'jamaah_portal',
    fullName: 'Hj. Siti Aminah',
    email: 'siti.aminah@gmail.com',
    role: 'JAMAAH',
    roleTitle: 'Portal Jamaah Mandiri',
    branchCode: 'C00',
    branchName: 'Jamaah Terdaftar',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80',
    gender: 'P',
    badgeColor: 'bg-emerald-600 text-white',
    description: 'Self-service portal jamaah: Jadwal Manasik, Tiket QR, E-Invoice & Form Review Layanan.',
    sampleCredentials: { username: '', pass: '' },
    defaultPhase: 'PACKAGES',
    defaultTab: 'JAMAAH_PORTAL',
  },
];

export function checkMenuAccess(
  tabId: string,
  role: RoleCode
): { isAccessible: boolean; reason?: string } {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return { isAccessible: true };

  // Konfigurasi teknis database, DDL, & RLS simulator HANYA untuk Super Admin SaaS dan Admin Tenant HQ!
  if (
    tabId === 'DATABASE_DDL_SCHEMA' ||
    tabId === 'DDL_VIEWER' ||
    tabId === 'SECURITY_RBAC_RLS' ||
    tabId === 'RLS_SIMULATOR' ||
    tabId === 'MODULE_SECURITY_DDL'
  ) {
    if (role !== 'ADMIN_SAAS' && role !== 'ADMIN_HQ') {
      return {
        isAccessible: false,
        reason: 'Konfigurasi teknis database & DDL hanya dapat diakses oleh Super Admin SaaS dan Admin Tenant HQ.',
      };
    }
  }

  // Super Admin SaaS & HQ have universal access
  if (role === 'ADMIN_SAAS' || role === 'ADMIN_HQ') {
    return { isAccessible: true };
  }

  // Business Owner / C-Level Executive: Akses penuh ke seluruh modul bisnis, finansial, operasional & review (tanpa DDL teknis)
  if (role === 'OWNER_CLEVEL') {
    return { isAccessible: true };
  }

  // Jamaah only has access to Pilgrim Portal and Survey
  if (role === 'JAMAAH') {
    if (
      tabId === 'FASE3_PORTAL' ||
      tabId === 'JAMAAH_PORTAL' ||
      tabId === 'FASE7_SURVEY_WA' ||
      tabId === 'SURVEY_REVIEWS' ||
      tabId === 'SURVEY_CAMPAIGNS'
    ) {
      return { isAccessible: true };
    }
    return {
      isAccessible: false,
      reason: 'Halaman ini khusus Staf Internal / Biro. Jamaah hanya dapat mengakses Portal Jamaah & Form Review.',
    };
  }

  // Muthawif / TL / Mukibin
  if (role === 'MUTHAWIF' || role === 'TOUR_LEADER' || role === 'MUKIBIN') {
    if (
      tabId === 'FASE7_LOGISTICS' ||
      tabId === 'POSTTRIP_LOGISTICS' ||
      tabId === 'FASE4_TOUROPS' ||
      tabId === 'MANIFEST_HANDLING' ||
      tabId === 'FASE4_ITINERARY_INS' ||
      tabId === 'ITINERARY_INSURANCE' ||
      tabId === 'FASE3_CASH_ADVANCE' ||
      tabId === 'CASH_ADVANCE_ELPJ' ||
      tabId === 'COMMAND_CENTER' ||
      tabId === 'FASE6_EXECUTIVE_DASHBOARD' ||
      tabId === 'FASE1_SISKOPATUH' ||
      tabId === 'MASTER_SISKOPATUH'
    ) {
      return { isAccessible: true };
    }
    return {
      isAccessible: false,
      reason: 'Role Lapangan Saudi dibatasi pada Manifes, Audio Whisper, Koper, & E-LPJ.',
    };
  }

  // Agent Coordinator & Downline
  if (role === 'AGENT_COORDINATOR' || role === 'BRANCH_AGENT') {
    if (
      tabId === 'FASE5_AGENT_COMM' ||
      tabId === 'CRM_AGENT_COMM' ||
      tabId === 'FASE5_AGENT_WALLET' ||
      tabId === 'CRM_AGENT_WALLET' ||
      tabId === 'CRM_KSO_MARGIN' ||
      tabId === 'FASE3_SALES' ||
      tabId === 'BOOKING_REGISTRATION' ||
      tabId === 'FASE7_SALES_B2B' ||
      tabId === 'CRM_LEADS_B2B' ||
      tabId === 'FASE3_PACKAGES' ||
      tabId === 'PACKAGE_RAB_SEATS'
    ) {
      return { isAccessible: true };
    }
    return {
      isAccessible: false,
      reason: 'Portal Agen Kemitraan dibatasi pada Komisi, Wallet, Pendaftaran, & CRM Leads.',
    };
  }

  // Internal Sales
  if (role === 'INTERNAL_SALES') {
    if (
      tabId.startsWith('CRM') ||
      tabId.startsWith('PACKAGE') ||
      tabId === 'BOOKING_REGISTRATION' ||
      tabId === 'SURVEY_REVIEWS' ||
      tabId === 'SURVEY_CAMPAIGNS' ||
      tabId === 'WA_CAMPAIGNS' ||
      tabId === 'MASTER_SISKOPATUH' ||
      tabId.startsWith('FASE7') ||
      tabId.startsWith('FASE3') ||
      tabId === 'FASE5_AGENT_COMM' ||
      tabId === 'FASE1_SISKOPATUH'
    ) {
      return { isAccessible: true };
    }
    if (
      tabId.startsWith('ACCOUNTING') ||
      tabId.startsWith('FINANCE') ||
      tabId.startsWith('FASE6') ||
      tabId === 'FASE2_COA_REQUESTS' ||
      tabId === 'MASTER_COA' ||
      tabId === 'FASE2_TAX' ||
      tabId === 'TAX_INTERBRANCH'
    ) {
      return {
        isAccessible: false,
        reason: 'Menu Akuntansi & Laporan Konsolidasi dibatasi khusus Divisi Finance / Direksi HQ.',
      };
    }
  }

  // ADMIN_BRANCH
  if (role === 'ADMIN_BRANCH') {
    if (tabId === 'DATABASE_DDL_SCHEMA' || tabId === 'DDL_VIEWER') {
      return {
        isAccessible: false,
        reason: 'Akses DDL Database hanya diizinkan untuk Tim Database / Super Admin HQ.',
      };
    }
    return { isAccessible: true };
  }

  return { isAccessible: true };
}

export function checkFormActionPermission(
  actionName: string,
  role: RoleCode
): { allowed: boolean; message?: string } {
  if (role === 'ADMIN_SAAS' || role === 'ADMIN_HQ' || role === 'OWNER_CLEVEL') {
    return { allowed: true };
  }

  if (role === 'JAMAAH') {
    if (actionName === 'SUBMIT_SURVEY') return { allowed: true };
    return {
      allowed: false,
      message: 'Akses Ditolak: Akun Jamaah tidak memiliki wewenang untuk mengubah data operasional biro.',
    };
  }

  if (actionName === 'DELETE_RECORD' || actionName === 'REVALUASI_VALAS') {
    return {
      allowed: false,
      message: 'Aksi Ditolak: Penghapusan data master atau revaluasi valas hanya diizinkan untuk Direksi HQ / Super Admin.',
    };
  }

  if (actionName === 'APPROVE_JOURNAL' || actionName === 'POSTING_JURNAL_OTOMATIS') {
    if (role === 'ADMIN_BRANCH') {
      return {
        allowed: false,
        message: 'Aksi Ditolak: Cabang hanya dapat membuat usulan (draft) jurnal. Otorisasi posting dipegang Finance HQ.',
      };
    }
  }

  if (actionName === 'DISCOUNT_WHOLESALE_B2B' && (role === 'BRANCH_AGENT' || role === 'AGENT_COORDINATOR')) {
    return {
      allowed: false,
      message: 'Aksi Ditolak: Diskon khusus wholesale B2B membutuhkan persetujuan Manajemen Cabang/Pusat.',
    };
  }

  return { allowed: true };
}
