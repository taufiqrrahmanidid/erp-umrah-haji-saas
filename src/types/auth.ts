import { RoleCode, Tenant, ResolvedBranch, User } from './erp.ts';

export interface PermissionSet {
  canManageTenants: boolean;
  canManageBranches: boolean;
  canViewAllBranches: boolean;
  canViewRealHpp: boolean;
  canAccessFinance: boolean;
  canApproveJournals: boolean;
  canManageSalesAndLeads: boolean;
  canManageB2B: boolean;
  canManageLogistics: boolean;
  canManageSurveysAndWA: boolean;
  canManageTheming: boolean;
  canManageProcurement: boolean;
  canAccessSaudiOps: boolean;
  canAccessAgentNetwork: boolean;
  canAccessPilgrimPortal: boolean;
  canCreateRecords: boolean;
  canDeleteRecords: boolean;
}

export interface RlsPolicyRule {
  policy_name: string;
  table_target: string;
  enforcement: 'RESTRICTED' | 'BYPASS' | 'MASKED' | 'TENANT_ONLY';
  description: string;
}

export interface AuthSession {
  isAuthenticated: boolean;
  user: User;
  tenant: Tenant;
  branch: ResolvedBranch;
  role: RoleCode;
  token?: string;
  loginTime?: string;
  permissions: PermissionSet;
  activeRlsPolicies: RlsPolicyRule[];
}

export interface DemoAccountProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: RoleCode;
  roleTitle: string;
  branchCode: string;
  branchName: string;
  avatarUrl: string;
  gender?: 'L' | 'P';
  badgeColor: string;
  description: string;
  sampleCredentials: { username: string; pass: string };
  defaultPhase: string;
  defaultTab: string;
}
