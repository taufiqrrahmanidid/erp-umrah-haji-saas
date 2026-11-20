import React from 'react';
import {
  Menu,
  Pin,
  PinOff,
  LogOut,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { Tenant, ResolvedBranch, RoleCode } from '../types/erp.ts';
import { DemoAccountProfile } from '../types/auth.ts';

interface HeaderProps {
  currentTenant: Tenant;
  onTenantChange?: (tenant: Tenant) => void;
  availableTenants?: Tenant[];
  currentBranch: ResolvedBranch;
  onBranchChange?: (branch: ResolvedBranch) => void;
  availableBranches?: ResolvedBranch[];
  currentRole: RoleCode;
  onRoleChange?: (role: RoleCode) => void;
  currentUserProfile: DemoAccountProfile | null;
  onOpenLoginModal?: () => void;
  onLogout: () => void;
  // Sidebar Controls
  onToggleMobileSidebar: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
  activePhaseTitle: string;
  activeTabLabel: string;
  // Theme Controls
  theme: 'sage' | 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUserProfile,
  onLogout,
  onToggleMobileSidebar,
  isPinned,
  onTogglePin,
  activePhaseTitle,
  activeTabLabel,
  theme,
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';
  const isSage = theme === 'sage';

  // Sanitize label to eliminate any technical fallback text or numbered prefix
  const cleanTabLabel = (activeTabLabel || activePhaseTitle)
    .replace(/^[0-9]+\.\s*/, '')
    .trim();

  return (
    <header
      className={`border-b sticky top-0 z-30 shadow-sm transition-colors ${
        isDark
          ? 'bg-slate-900 border-slate-800 text-white'
          : isSage
          ? 'bg-white border-[#C0DDD6] text-slate-900'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* 5% Margin Kiri & Kanan Container */}
      <div className="w-full mx-auto px-3 sm:px-6 lg:px-[5%]">
        <div className="flex items-center justify-between py-3 gap-3 sm:gap-4">
          {/* Left: Hamburger, Pin & Clean Active Menu Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 overflow-hidden">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className={`p-2 rounded-xl transition-colors lg:hidden shrink-0 ${
                isDark
                  ? 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
              title="Buka Menu Navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Pin / Auto-Hide Indicator */}
            <button
              type="button"
              onClick={onTogglePin}
              className={`p-2 rounded-xl text-xs sm:text-sm hidden lg:flex items-center gap-2 transition-all ${
                isPinned
                  ? isDark
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                    : isSage
                    ? 'bg-[#F4F9F8] text-[#1E4E46] border border-[#C0DDD6] hover:bg-[#EBF5F3]'
                    : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                  : 'bg-amber-950/70 text-amber-300 border border-amber-800/80 hover:bg-amber-900'
              }`}
              title={
                isPinned
                  ? 'Sidebar Terkunci (Klik untuk Mode Auto-Hide)'
                  : 'Mode Auto-Hide Aktif (Klik untuk Mengunci Sidebar)'
              }
            >
              {isPinned ? (
                <Pin className="w-4 h-4 text-[#98C3BC]" />
              ) : (
                <PinOff className="w-4 h-4 text-amber-400" />
              )}
              <span className="font-semibold hidden xl:inline text-xs sm:text-sm">
                {isPinned ? 'Sidebar Terkunci' : 'Auto-Hide'}
              </span>
            </button>

            {/* Clean Module Title (Bebas dari Nomor 1. 2. 3. dan Teks Redundan) */}
            <div className="flex items-center gap-2 truncate">
              <span
                className={`font-extrabold text-sm sm:text-base tracking-tight truncate ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {cleanTabLabel}
              </span>
            </div>
          </div>

          {/* Right: Theme Switcher, User Avatar & Direct Logout */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm shrink-0">
            {/* Theme Toggle (Sage Mint #98C3BC, Dark, Light) */}
            <button
              type="button"
              onClick={onToggleTheme}
              className={`px-2.5 py-1.5 rounded-xl transition-all border flex items-center gap-1.5 font-bold ${
                theme === 'sage'
                  ? 'bg-[#C0DDD6]/60 text-[#163630] border-[#98C3BC]'
                  : isDark
                  ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-750'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
              title="Ganti Tema Tampilan (Default: Sage Mint #98C3BC & #C0DDD6, Dark, Light)"
            >
              {theme === 'sage' ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#2C6258]" />
                  <span className="text-[11px] hidden sm:inline">Sage #98C3BC</span>
                </>
              ) : isDark ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] hidden sm:inline">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[11px] hidden sm:inline">Light</span>
                </>
              )}
            </button>

            {/* User Avatar & Name */}
            <div
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border ${
                isDark
                  ? 'bg-slate-950/70 border-slate-800 text-slate-200'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <img
                src={
                  currentUserProfile?.avatarUrl ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
                }
                alt="Avatar"
                className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-[#98C3BC]"
              />
              <span className="hidden lg:inline font-bold text-xs max-w-[130px] truncate">
                {currentUserProfile?.fullName?.split(' ')[0] || 'User'}
              </span>
            </div>

            {/* Direct Logout Button (Keluar Semua Dari Aplikasi) */}
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 shadow-sm dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60 dark:hover:bg-rose-900/60"
              title="Keluar dari Aplikasi (Logout)"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
