import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  Building2,
  MapPin,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { RoleCode, ResolvedBranch, Tenant } from '../../types/erp.ts';
import { getActiveRlsPolicies, DEMO_PROFILES } from '../../utils/rbacRules.ts';
import { DemoAccountProfile } from '../../types/auth.ts';

interface RlsPolicyBannerProps {
  currentRole: RoleCode;
  currentBranch: ResolvedBranch;
  currentTenant: Tenant;
  currentUserProfile: DemoAccountProfile | null;
  onQuickSwitchProfile: (profile: DemoAccountProfile) => void;
}

export const RlsPolicyBanner: React.FC<RlsPolicyBannerProps> = ({
  currentRole,
  currentBranch,
  currentTenant,
  currentUserProfile,
  onQuickSwitchProfile,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const activePolicies = getActiveRlsPolicies(
    currentRole,
    currentBranch.branch_code,
    currentTenant.tenant_id
  );

  const isHppMasked = currentRole === 'ADMIN_BRANCH' || currentRole === 'BRANCH_AGENT';
  const isBypassed = currentRole === 'ADMIN_HQ' || currentRole === 'ADMIN_SAAS';

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-xl transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Active Security State Summary */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              isBypassed
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                : 'bg-cyan-950/80 text-cyan-400 border-cyan-800'
            }`}
          >
            {isBypassed ? <ShieldCheck className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-white">
                PostgreSQL Row-Level Security (RLS) &amp; RBAC Terpasang
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  isBypassed
                    ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                    : 'bg-cyan-900/60 text-cyan-300 border border-cyan-700'
                }`}
              >
                {isBypassed ? 'HQ BYPASS (Semua Cabang)' : `RLS Terisolasi (${currentBranch.branch_code})`}
              </span>
              {isHppMasked && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                  <EyeOff className="w-3 h-3" />
                  HPP Asli Di-Masking (Harga Nett)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Sesi: <strong className="text-slate-200">{currentUserProfile?.fullName || 'Pengguna'}</strong> ({currentRole}) • Cabang: <strong className="text-cyan-300">{currentBranch.branch_code} - {currentBranch.branch_name}</strong>
            </p>
          </div>
        </div>

        {/* Right: Quick Role Simulator Buttons & Details Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick simulation buttons for common testing */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-[11px]">
            <span className="text-slate-500 px-1.5">Uji Peran:</span>
            {DEMO_PROFILES.slice(0, 4).map((p) => {
              const isCurrent = currentRole === p.role && currentBranch.branch_code === p.branchCode;
              return (
                <button
                  key={p.id}
                  onClick={() => onQuickSwitchProfile(p)}
                  className={`px-2 py-1 rounded-lg font-medium transition-all ${
                    isCurrent
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={`${p.fullName} - ${p.description}`}
                >
                  {p.roleTitle.split(' ')[0]} {p.branchCode !== 'C00' ? `(${p.branchCode})` : ''}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs border border-slate-700/60 transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isExpanded ? 'Tutup Aturan RLS' : 'Lihat Kebijakan RLS'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded RLS Policy Rules Inspection */}
      {isExpanded && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Kebijakan Keamanan PostgreSQL yang Sedang Aktif di Sesi Ini:
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Enforced by PostgreSQL Kernel / RLS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {activePolicies.map((pol, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-400 text-[11px] truncate">
                    {pol.policy_name}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      pol.enforcement === 'BYPASS'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : pol.enforcement === 'MASKED'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}
                  >
                    {pol.enforcement}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">
                  {pol.description}
                </p>
                <div className="text-[9px] text-slate-500 font-mono">
                  Tabel target: {pol.table_target}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
