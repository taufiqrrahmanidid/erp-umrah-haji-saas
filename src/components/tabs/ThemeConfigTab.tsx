import React, { useState } from 'react';
import {
  Palette,
  Calendar,
  Image,
  Sparkles,
  Save,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import { AppSetting, ResolvedBranch, UiThemeConfig, GoogleCalendarConfig } from '../../types/erp.ts';

interface ThemeConfigTabProps {
  appSettings: AppSetting[];
  currentBranch: ResolvedBranch;
  onUpdateSetting: (settingKey: string, newValue: any) => void;
}

export const ThemeConfigTab: React.FC<ThemeConfigTabProps> = ({
  appSettings,
  currentBranch,
  onUpdateSetting,
}) => {
  // Find current theme setting
  const themeSetting = appSettings.find(
    (s) => s.setting_key === 'ui_theme_config' && s.branch_id === currentBranch.branch_code
  ) || appSettings.find((s) => s.setting_key === 'ui_theme_config' && s.branch_id === 'C00')!;

  const calendarSetting = appSettings.find(
    (s) => s.setting_key === 'google_calendar_config' && s.branch_id === currentBranch.branch_code
  ) || appSettings.find((s) => s.setting_key === 'google_calendar_config');

  // Form states
  const [themeForm, setThemeForm] = useState<UiThemeConfig>({
    primary_color: themeSetting.setting_value.primary_color || '#047857',
    accent_color: themeSetting.setting_value.accent_color || '#d97706',
    login_bg_url:
      themeSetting.setting_value.login_bg_url ||
      'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1920&q=80',
    dashboard_bg_url:
      themeSetting.setting_value.dashboard_bg_url ||
      'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1920&q=80',
    logo_url:
      themeSetting.setting_value.logo_url ||
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80',
    kop_surat_text:
      themeSetting.setting_value.kop_surat_text ||
      `PT AL-HARAMAIN TOUR & TRAVEL - CABANG ${currentBranch.branch_name.toUpperCase()}`,
  });

  const [calendarForm, setCalendarForm] = useState<GoogleCalendarConfig>({
    calendar_id: calendarSetting?.setting_value?.calendar_id || 'agenda_umrah@group.calendar.google.com',
    calendar_name: calendarSetting?.setting_value?.calendar_name || 'Jadwal Manasik & Kloter',
    sync_enabled: calendarSetting?.setting_value?.sync_enabled ?? true,
    oauth_token_ref: calendarSetting?.setting_value?.oauth_token_ref || 'oauth_vault_token_sec',
    last_synced_at: calendarSetting?.setting_value?.last_synced_at || new Date().toISOString(),
  });

  const [savedNotification, setSavedNotification] = useState(false);

  const handleSaveTheme = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSetting('ui_theme_config', themeForm);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const handleSaveCalendar = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSetting('google_calendar_config', calendarForm);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Konfigurasi SaaS, Theming Visual &amp; Integrasi Google Calendar
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Tersimpan di tabel <code className="text-cyan-400 font-mono">app_settings</code> bertipe{' '}
                <code className="text-cyan-400 font-mono">JSONB</code>. Mendukung penyesuaian warna brand, background
                halaman login, dashboard banner, kop surat resmi, serta integrasi agenda manasik Google Calendar spesifik per cabang.
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-400">
            Branch Context: {currentBranch.branch_code} ({currentBranch.branch_type})
          </div>
        </div>
      </div>

      {/* Grid: Settings Forms vs Live Visual Mockup Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Theme & Calendar Config (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Form 1: UI Theme Config */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-400" />
                Pengaturan Visual Cabang (<code className="font-mono text-emerald-400">ui_theme_config</code>)
              </h4>
              <span className="text-xs text-slate-400 font-mono">JSONB Record</span>
            </div>

            <form onSubmit={handleSaveTheme} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Warna Utama (Primary Color)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={themeForm.primary_color}
                      onChange={(e) => setThemeForm({ ...themeForm, primary_color: e.target.value })}
                      className="w-10 h-9 rounded bg-slate-950 border border-slate-800 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={themeForm.primary_color}
                      onChange={(e) => setThemeForm({ ...themeForm, primary_color: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Warna Aksen (Accent Color)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={themeForm.accent_color}
                      onChange={(e) => setThemeForm({ ...themeForm, accent_color: e.target.value })}
                      className="w-10 h-9 rounded bg-slate-950 border border-slate-800 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={themeForm.accent_color}
                      onChange={(e) => setThemeForm({ ...themeForm, accent_color: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  URL Gambar Background Login Cabang
                </label>
                <input
                  type="url"
                  value={themeForm.login_bg_url}
                  onChange={(e) => setThemeForm({ ...themeForm, login_bg_url: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  URL Gambar Background Dashboard Utama
                </label>
                <input
                  type="url"
                  value={themeForm.dashboard_bg_url}
                  onChange={(e) => setThemeForm({ ...themeForm, dashboard_bg_url: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  Teks Kop Surat Resmi Cabang
                </label>
                <input
                  type="text"
                  value={themeForm.kop_surat_text}
                  onChange={(e) => setThemeForm({ ...themeForm, kop_surat_text: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  Simpan Konfigurasi Tema JSONB
                </button>
              </div>
            </form>
          </div>

          {/* Form 2: Google Calendar Integration Config */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Integrasi Agenda Cabang (<code className="font-mono text-cyan-400">google_calendar_config</code>)
              </h4>
              <span className="text-xs text-slate-400 font-mono">OAuth 2.0 Integration</span>
            </div>

            <form onSubmit={handleSaveCalendar} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Google Calendar ID</label>
                  <input
                    type="text"
                    value={calendarForm.calendar_id}
                    onChange={(e) => setCalendarForm({ ...calendarForm, calendar_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Nama Kalender</label>
                  <input
                    type="text"
                    value={calendarForm.calendar_name}
                    onChange={(e) => setCalendarForm({ ...calendarForm, calendar_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div>
                  <span className="font-bold text-white block">Sinkronisasi Otomatis Jadwal Manasik</span>
                  <span className="text-[11px] text-slate-400">
                    Otomatis membuat agenda di Google Calendar jamaah saat jadwal manasik diterbitkan
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={calendarForm.sync_enabled}
                  onChange={(e) => setCalendarForm({ ...calendarForm, sync_enabled: e.target.checked })}
                  className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  Simpan Kalender JSONB
                </button>

                <span className="text-[11px] text-slate-400">
                  Sinkronisasi Terakhir: {new Date(calendarForm.last_synced_at || '').toLocaleTimeString()}
                </span>
              </div>
            </form>
          </div>

          {savedNotification && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Konfigurasi JSONB berhasil diperbarui dan diterapkan ke session aktif!</span>
            </div>
          )}
        </div>

        {/* Right Preview: Live Rendering of Configured Theme (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Live Preview Portal Cabang
              </h4>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                Real-Time CSS
              </span>
            </div>

            {/* Simulated Login Card with Background */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400">Preview Halaman Login Cabang:</span>
              <div
                className="relative rounded-xl overflow-hidden border border-slate-700 shadow-xl h-64 flex items-center justify-center p-4 bg-cover bg-center"
                style={{ backgroundImage: `url(${themeForm.login_bg_url})` }}
              >
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]"></div>

                {/* Login Card in preview */}
                <div className="relative z-10 w-full max-w-xs bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 shadow-2xl text-center space-y-2.5">
                  <div
                    className="w-10 h-10 mx-auto rounded-lg flex items-center justify-center shadow-md text-white font-bold"
                    style={{ backgroundColor: themeForm.primary_color }}
                  >
                    UMR
                  </div>
                  <h6 className="font-bold text-white text-xs">
                    Masuk Portal Cabang {currentBranch.branch_code}
                  </h6>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{themeForm.kop_surat_text}</p>
                  <div className="space-y-1.5 pt-1 text-[10px]">
                    <div className="bg-slate-950/80 border border-slate-800 rounded px-2 py-1 text-left text-slate-500">
                      username / email
                    </div>
                    <div className="bg-slate-950/80 border border-slate-800 rounded px-2 py-1 text-left text-slate-500">
                      ••••••••••••
                    </div>
                    <button
                      type="button"
                      className="w-full py-1.5 rounded font-bold text-white shadow transition"
                      style={{ backgroundColor: themeForm.primary_color }}
                    >
                      Masuk Sistem
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Dashboard Header Banner */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-slate-400">
                Preview Banner Dashboard Cabang:
              </span>
              <div
                className="relative rounded-xl overflow-hidden border border-slate-700 shadow-lg p-4 bg-cover bg-center flex flex-col justify-end min-h-[120px]"
                style={{ backgroundImage: `url(${themeForm.dashboard_bg_url})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
                <div className="relative z-10 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: themeForm.accent_color }}
                    >
                      CABANG RESMI
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {currentBranch.branch_code}
                    </span>
                  </div>
                  <h5 className="font-extrabold text-white text-sm drop-shadow">
                    {currentBranch.branch_name}
                  </h5>
                  <p className="text-[10px] text-slate-300 drop-shadow">{themeForm.kop_surat_text}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
