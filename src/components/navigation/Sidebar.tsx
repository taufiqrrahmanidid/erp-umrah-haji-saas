import React, { useState } from 'react';
import {
  Sparkles,
  Scale,
  Coins,
  ShoppingCart,
  Package,
  ListFilter,
  Building2,
  Code,
  Search,
  ChevronDown,
  ChevronRight,
  Pin,
  PinOff,
  PanelLeftClose,
  PanelLeftOpen,
  Lock,
  LogOut,
  UserCheck,
  Shield,
  MapPin,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { RoleCode, ResolvedBranch, Tenant } from '../../types/erp.ts';
import { checkMenuAccess } from '../../utils/rbacRules.ts';
import { DemoAccountProfile } from '../../types/auth.ts';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  phaseId: string;
}

export interface PhaseGroup {
  id: string;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  items: MenuItem[];
}

interface SidebarProps {
  phaseGroups: PhaseGroup[];
  activePhase: string;
  activeTab: string;
  onSelectTab: (phaseId: string, tabId: string) => void;
  currentRole: RoleCode;
  currentUserProfile: DemoAccountProfile | null;
  currentBranch: ResolvedBranch;
  currentTenant: Tenant;
  onLogout: () => void;
  onOpenLoginModal: () => void;
  // Auto-hide and pinning states
  isPinned: boolean;
  onTogglePin: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  theme?: 'sage' | 'dark' | 'light';
  // Resizable sidebar width
  sidebarWidth?: number;
  onSidebarWidthChange?: (width: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  phaseGroups,
  activePhase,
  activeTab,
  onSelectTab,
  currentRole,
  currentUserProfile,
  currentBranch,
  currentTenant,
  onLogout,
  onOpenLoginModal,
  isPinned,
  onTogglePin,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  theme = 'sage',
  sidebarWidth = 300,
  onSidebarWidthChange,
}) => {
  const isLight = theme === 'light';
  const isSage = theme === 'sage';
  const [currentWidth, setCurrentWidth] = useState<number>(sidebarWidth);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  React.useEffect(() => {
    setCurrentWidth(sidebarWidth);
  }, [sidebarWidth]);

  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startW = currentWidth;

    const handleMouseMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      const nextW = Math.min(Math.max(startW + delta, 240), 480);
      setCurrentWidth(nextW);
      onSidebarWidthChange?.(nextW);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({
    MODULE_MASTER: true,
    MODULE_CRM_B2B: true,
    MODULE_PACKAGES: true,
    MODULE_PROCUREMENT: false,
    MODULE_OPERATIONS: false,
    MODULE_FINANCE: false,
    MODULE_ACCOUNTING: false,
    MODULE_POST_TRIP: false,
    MODULE_SECURITY_DDL: false,
    // legacy fallback keys
    FASE7: true,
    FASE6: true,
    FASE5: false,
    FASE4: false,
    FASE3: false,
    FASE2: false,
    FASE1: false,
    DDL: false,
  });
  const [filterByRoleOnly, setFilterByRoleOnly] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const togglePhaseExpand = (phaseId: string) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  // Determine effective collapse state:
  // If not pinned and not hovered, it auto-hides / collapses to mini rail!
  const effectiveCollapsed = !isPinned ? !isHovered : isCollapsed;

  // Hilangkan konfigurasi teknis & DDL bila bukan SaaS Admin atau Super Admin HQ
  const isSuperAdminOrTenantHq =
    currentRole === 'ADMIN_SAAS' || currentRole === 'ADMIN_HQ';

  // INVISIBLE MENU RBAC: Saring hanya menu yang benar-benar diizinkan oleh peran pengguna
  const filteredPhaseGroups = phaseGroups
    .filter((group) => {
      // Modul konfigurasi sistem & DDL teknis HANYA untuk SaaS Admin dan HQ Super Admin
      if (
        (group.id === 'MODULE_SECURITY_DDL' ||
          group.id === 'DDL' ||
          group.id.includes('SECURITY')) &&
        !isSuperAdminOrTenantHq
      ) {
        return false;
      }
      return true;
    })
    .map((group) => {
      const items = group.items.filter((item) => {
        // Hilangkan setting & DDL bila bukan admin rbac saas / super admin tenan
        if (
          (item.id === 'DATABASE_DDL_SCHEMA' ||
            item.id === 'DDL_VIEWER' ||
            item.id === 'SECURITY_RBAC_RLS' ||
            item.id === 'RLS_SIMULATOR') &&
          !isSuperAdminOrTenantHq
        ) {
          return false;
        }

        // Invisible menu untuk RBAC: Jika role tidak berwenang, HILANGKAN TOTAL dari menu!
        const access = checkMenuAccess(item.id, currentRole);
        if (!access.isAccessible) {
          return false;
        }

        // Search filter (jika ada pencarian kata kunci)
        const matchesQuery =
          !searchQuery.trim() ||
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.badge && item.badge.toLowerCase().includes(searchQuery.toLowerCase())) ||
          group.title.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesQuery;
      });

      return {
        ...group,
        items,
      };
    })
    .filter((group) => group.items.length > 0); // Drop empty groups completely

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        onMouseEnter={() => !isPinned && setIsHovered(true)}
        onMouseLeave={() => !isPinned && setIsHovered(false)}
        style={{
          width: effectiveCollapsed ? '5rem' : `${currentWidth}px`,
        }}
        className={`fixed top-0 left-0 bottom-0 z-50 bg-slate-900 border-r border-slate-800 transition-[width,transform] ${
          isResizing ? 'duration-0 select-none' : 'duration-200'
        } ease-in-out flex flex-col shadow-2xl shadow-black/60 ${
          isMobileOpen
            ? 'translate-x-0'
            : 'max-lg:-translate-x-full'
        }`}
      >
        {/* Dynamic Horizontal Drag Resizer on Right Border / Vertical Scrollbar Area */}
        {!effectiveCollapsed && (
          <div
            onMouseDown={handleMouseDownResize}
            title="Geser ke kanan / kiri untuk mengatur lebar sidebar"
            className={`absolute top-0 right-0 bottom-0 w-3 -mr-1.5 cursor-col-resize z-50 flex items-center justify-center select-none group transition-colors ${
              isResizing
                ? 'bg-emerald-500/60 shadow-lg shadow-emerald-500/50'
                : 'hover:bg-emerald-500/25'
            }`}
          >
            <div
              className={`w-1 h-12 rounded-full transition-all ${
                isResizing
                  ? 'bg-white h-16 shadow-lg'
                  : 'bg-slate-700 group-hover:bg-emerald-400'
              }`}
            />
          </div>
        )}
        {/* Top Header & Brand */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/40">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-950/40 border border-emerald-400/30 shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            {!effectiveCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-200 bg-clip-text text-transparent truncate">
                    ERP Umrah &amp; Haji
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
                    Enterprise
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentTenant.company_name}
                </p>
              </div>
            )}
          </div>

          {/* Pin & Collapse Controls */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Auto-Hide Pin Toggle (Desktop) */}
            <button
              type="button"
              onClick={onTogglePin}
              title={
                isPinned
                  ? 'Matikan Pin (Aktifkan Mode Auto-Hide / Otomatis Sembunyi)'
                  : 'Aktifkan Pin (Kunci Sidebar Tetap Terbuka)'
              }
              className={`p-1.5 rounded-lg text-xs hidden lg:flex items-center justify-center transition-all ${
                isPinned
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
            </button>

            {/* Collapse / Expand Toggle */}
            <button
              type="button"
              onClick={onToggleCollapse}
              title={effectiveCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 hidden lg:flex items-center justify-center transition-all"
            >
              {effectiveCollapsed ? (
                <PanelLeftOpen className="w-3.5 h-3.5" />
              ) : (
                <PanelLeftClose className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Bar / Auto-Hide State Banner */}
        {!effectiveCollapsed && !isPinned && (
          <div className="bg-amber-950/40 border-b border-amber-900/50 px-3 py-1 flex items-center justify-between text-[10px] text-amber-300">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Mode Auto-Hide Aktif (Hover untuk membuka)
            </span>
            <button
              onClick={onTogglePin}
              className="underline text-[10px] text-amber-400 hover:text-white"
            >
              Kunci
            </button>
          </div>
        )}

        {/* Dynamic Search & Invisible Menu RBAC Indicator (Expanded Only) */}
        {!effectiveCollapsed && (
          <div
            className={`p-3.5 border-b space-y-2.5 transition-colors ${
              isLight
                ? 'border-slate-200 bg-slate-50/70'
                : 'border-slate-800/80 bg-slate-950/20'
            }`}
          >
            <div className="relative">
              <Search
                className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                  isLight ? 'text-slate-400' : 'text-slate-500'
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari alur kerja atau modul..."
                className={`w-full rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isLight
                    ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
                    : 'bg-slate-950 border border-slate-700/80 text-slate-200 placeholder-slate-500'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
                >
                  ×
                </button>
              )}
            </div>

            {/* Otorisasi Wewenang Jabatan */}
            <div className="flex items-center justify-between px-1 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-semibold">Otorisasi Jabatan:</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40 truncate max-w-[140px]">
                {currentUserProfile?.roleTitle || currentRole}
              </span>
            </div>
          </div>
        )}

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3 scrollbar-thin">
          {filteredPhaseGroups.map((group) => {
            const GroupIcon = group.icon;
            const isGroupActive = activePhase === group.id;
            const isExpanded = expandedPhases[group.id] || searchQuery.trim().length > 0;

            if (effectiveCollapsed) {
              // Collapsed Mini Rail Icon View
              return (
                <div key={group.id} className="relative group/tooltip flex justify-center py-1">
                  <button
                    onClick={() => {
                      if (group.items.length > 0) {
                        onSelectTab(group.id, group.items[0].id);
                      }
                    }}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                      isGroupActive
                        ? `${group.accentColor} text-white shadow-lg shadow-emerald-950/50 ring-2 ring-emerald-400/40`
                        : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-750'
                    }`}
                  >
                    <GroupIcon className="w-5 h-5" />
                  </button>

                  {/* Floating Hover Tooltip for collapsed view */}
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 shadow-2xl z-50 invisible group-hover/tooltip:visible pointer-events-none whitespace-nowrap min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-white">{group.title}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded ${group.badgeBg} text-white font-mono`}>
                        {group.badge}
                      </span>
                    </div>
                    <div className="space-y-0.5 text-[11px] text-slate-400">
                      {group.items.slice(0, 4).map((it) => (
                        <div key={it.id} className="flex items-center gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                          <span className="truncate">{it.label}</span>
                        </div>
                      ))}
                      {group.items.length > 4 && (
                        <div className="text-[10px] text-slate-500 pl-3">
                          +{group.items.length - 4} modul lainnya
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // Expanded Full Accordion View
            return (
              <div
                key={group.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isGroupActive
                    ? 'border-slate-700 bg-slate-950/40 shadow-sm'
                    : 'border-slate-800/60 bg-transparent'
                }`}
              >
                {/* Phase Group Header Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => togglePhaseExpand(group.id)}
                  className={`w-full p-2.5 flex items-center justify-between text-left transition-all ${
                    isGroupActive
                      ? 'bg-slate-800/70 text-white'
                      : 'hover:bg-slate-850/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isGroupActive ? group.accentColor + ' text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <GroupIcon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-xs font-bold truncate">{group.title}</span>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold ${group.badgeBg} text-white`}
                      >
                        {group.badge}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 text-slate-400">
                    <span className="text-[10px] font-mono text-slate-500">
                      {group.items.length}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </div>
                </button>

                {/* Sub-Tabs Items List (Semua item di sini 100% diotorisasi via Invisible Menu) */}
                {isExpanded && (
                  <div
                    className={`p-1.5 space-y-1.5 border-t ${
                      isLight
                        ? 'bg-slate-50/50 border-slate-200'
                        : 'bg-slate-950/30 border-slate-800/50'
                    }`}
                  >
                    {group.items.map((tab) => {
                      const TabIcon = tab.icon;
                      const isActive =
                        activePhase === group.id && activeTab === tab.id;

                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            onSelectTab(group.id, tab.id);
                            if (window.innerWidth < 1024) {
                              onCloseMobile();
                            }
                          }}
                          className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between gap-2.5 text-xs sm:text-sm transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-700/30 border border-emerald-400/40'
                              : isLight
                              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <TabIcon
                              className={`w-4 h-4 shrink-0 ${
                                isActive
                                  ? 'text-white'
                                  : isLight
                                  ? 'text-slate-500'
                                  : 'text-slate-400'
                              }`}
                            />
                            <span className="truncate">{tab.label}</span>
                          </div>

                          {tab.badge ? (
                            <span
                              className={`text-[10px] sm:text-xs px-2 py-0.5 rounded font-mono font-medium shrink-0 ${
                                isActive
                                  ? 'bg-black/30 text-white'
                                  : isLight
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {tab.badge}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* User Session & Role Card at Bottom */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 shrink-0">
          {effectiveCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={onOpenLoginModal}
                title={`Profil: ${currentUserProfile?.fullName || 'Pengguna'} (${currentRole})`}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500/80 p-0.5 hover:scale-105 transition-transform"
              >
                <img
                  src={
                    currentUserProfile?.avatarUrl ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
                  }
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              </button>
              <button
                type="button"
                onClick={onLogout}
                title="Keluar / Ganti Akun"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 truncate">
                  <img
                    src={
                      currentUserProfile?.avatarUrl ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
                    }
                    alt="Avatar"
                    className="w-9 h-9 rounded-full object-cover border border-emerald-500/80 shrink-0"
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">
                      {currentUserProfile?.fullName || 'H. Muhammad Ridwan'}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="font-mono font-bold text-emerald-400">
                        {currentRole}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 font-mono">
                        {currentBranch.branch_code}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  title="Keluar ke Halaman Login"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Pure Enterprise Status & Direct Logout */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
                <span className="text-slate-400 font-medium truncate max-w-[160px]">
                  {currentBranch.branch_name}
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 font-semibold flex items-center gap-1 border border-rose-800/60 transition-colors shrink-0"
                  title="Keluar dari Aplikasi (Logout)"
                >
                  <LogOut className="w-3 h-3 text-rose-400" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
