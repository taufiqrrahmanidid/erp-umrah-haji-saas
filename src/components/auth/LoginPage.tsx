import React, { useState } from 'react';
import {
  Building2,
  Shield,
  KeyRound,
  User,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Database,
  Globe2,
} from 'lucide-react';
import { Tenant, ResolvedBranch, RoleCode } from '../../types/erp.ts';
import { DEMO_PROFILES } from '../../utils/rbacRules.ts';
import { DemoAccountProfile } from '../../types/auth.ts';

interface LoginPageProps {
  availableTenants: Tenant[];
  availableBranches: ResolvedBranch[];
  onLoginSuccess: (
    userProfile: DemoAccountProfile,
    tenant: Tenant,
    branch: ResolvedBranch,
    role: RoleCode
  ) => void;
  onCancel?: () => void;
  isOverlay?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  availableTenants,
  availableBranches,
  onLoginSuccess,
  onCancel,
  isOverlay = false,
}) => {
  const ownerProfile = DEMO_PROFILES.find((p) => p.role === 'OWNER_CLEVEL') || DEMO_PROFILES[0];
  const [selectedTenantId, setSelectedTenantId] = useState<string>(availableTenants[0]?.tenant_id || '');
  const [selectedBranchCode, setSelectedBranchCode] = useState<string>(availableBranches[0]?.branch_code || '');
  const [username, setUsername] = useState<string>(ownerProfile.sampleCredentials.username);
  const [password, setPassword] = useState<string>(ownerProfile.sampleCredentials.pass);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedDemoProfile, setSelectedDemoProfile] = useState<DemoAccountProfile>(ownerProfile);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSelectDemo = (profile: DemoAccountProfile) => {
    setSelectedDemoProfile(profile);
    setUsername(profile.sampleCredentials.username);
    setPassword(profile.sampleCredentials.pass);
    setSelectedBranchCode(profile.branchCode);
    setErrorMsg(null);
  };

  const handleQuickLogin = (profile: DemoAccountProfile) => {
    handleSelectDemo(profile);
    const tenant = availableTenants.find((t) => t.tenant_id === selectedTenantId) || availableTenants[0];
    const branch = availableBranches.find((b) => b.branch_code === profile.branchCode) || availableBranches[0];
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess(profile, tenant, branch, profile.role);
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Harap isi nama pengguna dan kata sandi.');
      return;
    }

    // Match with demo profile or fallback
    const userLower = username.trim().toLowerCase();
    let matchedProfile = DEMO_PROFILES.find(
      (p) => p.username.toLowerCase() === userLower
    );

    if (!matchedProfile) {
      if (userLower === 'owner' || userLower === 'bambang' || userLower === 'ceo') {
        matchedProfile = DEMO_PROFILES.find((p) => p.role === 'OWNER_CLEVEL');
      } else if (userLower === 'saas' || userLower === 'superadmin' || userLower === 'sysadmin') {
        matchedProfile = DEMO_PROFILES.find((p) => p.role === 'ADMIN_SAAS');
      } else if (userLower === 'it' || userLower === 'it_tenant' || userLower === 'admin_it') {
        matchedProfile = DEMO_PROFILES.find((p) => p.id === 'demo-it-tenant');
      }
    }

    if (!matchedProfile) {
      matchedProfile = {
        id: 'custom-user',
        username: username.trim(),
        fullName: username.trim().toUpperCase(),
        email: `${username.trim()}@alharamain.co.id`,
        role: (selectedDemoProfile?.role || 'ADMIN_HQ') as RoleCode,
        roleTitle: 'Pengguna Sistem ERP',
        branchCode: selectedBranchCode,
        branchName: availableBranches.find((b) => b.branch_code === selectedBranchCode)?.branch_name || 'Cabang',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        badgeColor: 'bg-emerald-600 text-white',
        description: 'Sesi kustom dengan hak akses berbasis RBAC terpilih.',
        sampleCredentials: { username, pass: password },
        defaultPhase: 'CRM_B2B',
        defaultTab: 'CRM_LEADS_B2B',
      };
    }

    const tenant = availableTenants.find((t) => t.tenant_id === selectedTenantId) || availableTenants[0];
    const targetBranchCode = matchedProfile.branchCode || selectedBranchCode;
    const branch = availableBranches.find((b) => b.branch_code === targetBranchCode) || availableBranches[0];

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess(matchedProfile, tenant, branch, matchedProfile.role);
    }, 450);
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden ${isOverlay ? 'fixed inset-0 z-50 overflow-y-auto bg-slate-950/95 backdrop-blur-md' : ''}`}>
      {/* Background Islamic / Modern Geometric Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl w-full mx-auto relative z-10 space-y-8">
        {/* Top Header & Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900 border border-emerald-500/30 shadow-lg shadow-emerald-950/50 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <span className="text-sm font-bold bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-200 bg-clip-text text-transparent">
                SaaS ERP Umrah &amp; Haji Enterprise
              </span>
              <span className="ml-2 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                Enterprise Portal
              </span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Masuk ke Portal ERP Biro Umrah &amp; Haji
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Sistem manajemen terpadu kantor pusat dan cabang mandiri. Hak akses modul dan wewenang formulir operasional disesuaikan secara otomatis menurut peran jabatan Anda.
          </p>
        </div>

        {/* Main Grid: Form Left, Demo RBAC Profiles Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Login Form */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-sm space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-400" />
                <span>Masuk Akun Pengguna</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Masukkan nama pengguna dan kata sandi resmi Anda.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Nama Pengguna / Email</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: ceo_owner atau admin_pusat"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Kata Sandi</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Info */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-emerald-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Ingat sesi browser ini</span>
                </label>
                <span className="text-[11px] text-emerald-400/90 hover:underline cursor-pointer">
                  Bantuan Sandi
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/60 transition-all border border-emerald-400/30 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Mengotentikasi Sesi...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Masuk ke Dashboard ERP</span>
                  </>
                )}
              </button>

              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full py-2 text-xs text-slate-400 hover:text-white text-center cursor-pointer"
                >
                  Kembali ke Workspace Sebelumnya
                </button>
              )}
            </form>

            {/* Security Footer Notice & Quick Password Reference */}
            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-2.5">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="font-semibold">Kredensial Login Resmi Sistem:</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5 text-[10px] font-mono">
                <div
                  onClick={() => {
                    const p = DEMO_PROFILES.find((x) => x.role === 'ADMIN_SAAS');
                    if (p) handleSelectDemo(p);
                  }}
                  className="p-2 rounded-lg bg-slate-950 border border-purple-800/60 hover:border-purple-500 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <span className="text-purple-300 font-bold">1. Super Admin SaaS:</span>
                  <span>User: <strong className="text-white">admin_saas</strong> | Pass: <strong className="text-amber-400">SaaS@Super2026</strong></span>
                </div>
                <div
                  onClick={() => {
                    const p = DEMO_PROFILES.find((x) => x.id === 'demo-it-tenant');
                    if (p) handleSelectDemo(p);
                  }}
                  className="p-2 rounded-lg bg-slate-950 border border-teal-800/60 hover:border-teal-500 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <span className="text-teal-300 font-bold">2. Admin IT Tenant:</span>
                  <span>User: <strong className="text-white">admin_it_tenant</strong> | Pass: <strong className="text-amber-400">TenantIT@2026</strong></span>
                </div>
                <div
                  onClick={() => {
                    const p = DEMO_PROFILES.find((x) => x.role === 'OWNER_CLEVEL');
                    if (p) handleSelectDemo(p);
                  }}
                  className="p-2 rounded-lg bg-slate-950 border border-amber-800/60 hover:border-amber-500 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <span className="text-amber-300 font-bold">3. Pemilik (Owner):</span>
                  <span>User: <strong className="text-white">ceo_owner</strong> | Pass: <strong className="text-amber-400">Owner@2026</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Demo Profiles Quick Switcher */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">
                    Pilih Akun Jabatan &amp; Hak Akses (1-Klik Masuk)
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                  {DEMO_PROFILES.length} Jabatan Tersedia
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Pilih peran di bawah ini untuk menguji bagaimana formulir dan alur operasional enterprise beradaptasi secara otomatis sesuai tanggung jawab masing-masing jabatan.
              </p>

              {/* Profiles List */}
              <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
                {DEMO_PROFILES.map((profile) => {
                  const isSelected = selectedDemoProfile.id === profile.id;

                  return (
                    <div
                      key={profile.id}
                      onClick={() => handleSelectDemo(profile)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-slate-850 border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={profile.avatarUrl}
                          alt={profile.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-white">
                              {profile.fullName}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${profile.badgeColor}`}
                            >
                              {profile.role}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                              Cabang: {profile.branchCode}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {profile.description}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1 font-mono">
                            <span>User: <strong className="text-slate-300">{profile.username}</strong></span>
                            <span>•</span>
                            <span>Pass: <strong className="text-slate-300">{profile.sampleCredentials.pass}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickLogin(profile);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <span>Masuk Sekarang</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Business Pillars Explanatory Callout */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl space-y-1">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> Tata Kelola Terpusat
                </span>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Pengawasan eksekutif real-time untuk kantor pusat dan pengawasan cabang mandiri.
                </p>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl space-y-1">
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Otorisasi Cabang
                </span>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Kantor cabang mandiri mengelola kuota, kas kecil, dan jamaah daerah dengan aman.
                </p>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl space-y-1">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Globe2 className="w-3.5 h-3.5" /> Perlindungan Margin
                </span>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Harga pokok paket terlindungi; kantor cabang dan mitra menerima harga nett resmi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
