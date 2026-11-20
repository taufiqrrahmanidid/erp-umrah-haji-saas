import React, { useState } from 'react';
import {
  Palette,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Building2,
  Lock,
  Plus,
  Eye,
  Check,
  Send,
  Sliders,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import {
  BranchSettingsConfig,
  DynamicDocumentTemplate,
  OutgoingLetterRecord,
} from '../../../types/erp';

interface ThemingAndCalendarTabProps {
  branchSettings: BranchSettingsConfig[];
  templates: DynamicDocumentTemplate[];
  outgoingLetters: OutgoingLetterRecord[];
  onUpdateBranchTheme: (branchId: string, updatedTheme: BranchSettingsConfig['ui_theme_config']) => void;
  onUpdateCalendarConfig: (branchId: string, updatedConfig: BranchSettingsConfig['google_calendar_config']) => void;
  onIssueOutgoingLetter: (letter: Omit<OutgoingLetterRecord, 'letter_id' | 'letter_number' | 'gcal_sync_status' | 'created_at'>) => void;
  onTriggerGcalSync: (letterId: string) => void;
}

export const ThemingAndCalendarTab: React.FC<ThemingAndCalendarTabProps> = ({
  branchSettings,
  templates,
  outgoingLetters,
  onUpdateBranchTheme,
  onUpdateCalendarConfig,
  onIssueOutgoingLetter,
  onTriggerGcalSync,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'THEMING_JSONB' | 'GCAL_INTEGRATION' | 'DYNAMIC_LETTERS'>('THEMING_JSONB');
  
  // Selected Branch for Theme Editing
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branchSettings[0]?.branch_id || 'BRANCH-JKT-HQ');
  const currentSetting = branchSettings.find((b) => b.branch_id === selectedBranchId) || branchSettings[0];

  // Theme Local Form State
  const [themeState, setThemeState] = useState(currentSetting.ui_theme_config);

  // Sync with selected branch
  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
    const target = branchSettings.find((b) => b.branch_id === branchId);
    if (target) {
      setThemeState(target.ui_theme_config);
    }
  };

  // Google Calendar Local State
  const [gcalState, setGcalState] = useState(currentSetting.google_calendar_config);

  // New Outgoing Letter Form State
  const [showNewLetterModal, setShowNewLetterModal] = useState(false);
  const [newLetterForm, setNewLetterForm] = useState({
    template_id: templates[0]?.template_id || '',
    recipient_name: '',
    recipient_email: '',
    recipient_phone: '',
    subject: '',
    event_date: '2026-04-20',
    event_start_time: '08:30',
    event_end_time: '12:00',
    event_location: 'Auditorium Utama Kantor Cabang',
  });

  // Letter HTML Preview Modal State
  const [previewLetter, setPreviewLetter] = useState<OutgoingLetterRecord | null>(null);

  const handleSaveTheme = () => {
    onUpdateBranchTheme(selectedBranchId, themeState);
    alert(`Tema visual JSONB untuk cabang ${currentSetting.branch_name} berhasil disimpan!`);
  };

  const handleSaveGcal = () => {
    onUpdateCalendarConfig(selectedBranchId, gcalState);
    alert(`Konfigurasi Google Calendar untuk cabang ${currentSetting.branch_name} berhasil diperbarui!`);
  };

  const handleIssueLetterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selTemplate = templates.find((t) => t.template_id === newLetterForm.template_id);
    const rendered = selTemplate
      ? selTemplate.html_content
          .replace('{{nama_tujuan}}', newLetterForm.recipient_name)
          .replace('{{tanggal_acara}}', newLetterForm.event_date)
          .replace('{{lokasi_acara}}', newLetterForm.event_location)
      : 'Konten Surat';

    onIssueOutgoingLetter({
      branch_id: selectedBranchId,
      template_id: newLetterForm.template_id,
      recipient_name: newLetterForm.recipient_name,
      recipient_email: newLetterForm.recipient_email || undefined,
      recipient_phone: newLetterForm.recipient_phone || undefined,
      subject: newLetterForm.subject || `Surat Resmi: ${newLetterForm.recipient_name}`,
      event_date: newLetterForm.event_date,
      event_start_time: newLetterForm.event_start_time,
      event_end_time: newLetterForm.event_end_time,
      event_location: newLetterForm.event_location,
      rendered_html: rendered,
      created_by_user_id: 'USR-OPS-HQ',
    });
    setShowNewLetterModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Palette className="w-16 h-16 text-emerald-400" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Theming Terisolasi (JSONB)</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{branchSettings.length} Konfigurasi Cabang</div>
          <div className="text-xs text-slate-400 mt-1">Palet warna, logo, dan wallpaper independen</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Calendar className="w-16 h-16 text-blue-400" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sinkronisasi Google Calendar</span>
          <div className="text-2xl font-bold text-blue-400 mt-1">
            {branchSettings.filter((b) => b.google_calendar_config.is_enabled).length} Cabang Terhubung
          </div>
          <div className="text-xs text-slate-400 mt-1">Auto-push event surat, manasik, & penerbangan</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <FileText className="w-16 h-16 text-amber-400" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Surat Keluar Dinamis</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{outgoingLetters.length} Surat Diterbitkan</div>
          <div className="text-xs text-slate-400 mt-1">{templates.length} Template Standar Kemenag & Operasional</div>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('THEMING_JSONB')}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
              activeSubTab === 'THEMING_JSONB'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Kustomisasi Brand Theming Cabang (JSONB)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('GCAL_INTEGRATION')}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
              activeSubTab === 'GCAL_INTEGRATION'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Integrasi Google Calendar Cabang</span>
          </button>

          <button
            onClick={() => setActiveSubTab('DYNAMIC_LETTERS')}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
              activeSubTab === 'DYNAMIC_LETTERS'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Surat Keluar Dinamis & Auto-Push GCal</span>
            <span className="bg-amber-950 text-amber-300 text-xs px-2 py-0.5 rounded-full border border-amber-800">
              {outgoingLetters.length}
            </span>
          </button>
        </div>

        {activeSubTab === 'DYNAMIC_LETTERS' && (
          <button
            onClick={() => setShowNewLetterModal(true)}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Terbitkan Surat Baru</span>
          </button>
        )}
      </div>

      {/* SUBTAB 1: THEMING JSONB CONFIG */}
      {activeSubTab === 'THEMING_JSONB' && (
        <div className="space-y-6">
          {/* Branch Switcher Selector */}
          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-400" />
              Pilih Cabang untuk Kustomisasi Tema:
            </span>
            <select
              value={selectedBranchId}
              onChange={(e) => handleBranchChange(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-1.5 rounded focus:outline-none focus:border-emerald-500"
            >
              {branchSettings.map((b) => (
                <option key={b.branch_id} value={b.branch_id}>
                  {b.branch_name} ({b.branch_id})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Theming Form Controls */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
              <div>
                <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  Pengaturan Palet Warna & Identitas Visual
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Tersimpan dalam kolom <code>ui_theme_config JSONB</code> pada tabel PostgreSQL, memungkinkan tiap cabang KSO memiliki identitas unik tanpa mengubah kode aplikasi.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-300 block font-semibold mb-1">Warna Utama (Primary)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeState.primary_color}
                        onChange={(e) => setThemeState({ ...themeState, primary_color: e.target.value })}
                        className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={themeState.primary_color}
                        onChange={(e) => setThemeState({ ...themeState, primary_color: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-2 py-1 rounded font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 block font-semibold mb-1">Warna Sekunder</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeState.secondary_color}
                        onChange={(e) => setThemeState({ ...themeState, secondary_color: e.target.value })}
                        className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={themeState.secondary_color}
                        onChange={(e) => setThemeState({ ...themeState, secondary_color: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-2 py-1 rounded font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 block font-semibold mb-1">Aksen Sorotan</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeState.accent_color}
                        onChange={(e) => setThemeState({ ...themeState, accent_color: e.target.value })}
                        className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={themeState.accent_color}
                        onChange={(e) => setThemeState({ ...themeState, accent_color: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-2 py-1 rounded font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Teks Watermark Cetak Dokumen</label>
                  <input
                    type="text"
                    value={themeState.company_watermark}
                    onChange={(e) => setThemeState({ ...themeState, company_watermark: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block font-semibold mb-1">URL Logo Resmi Cabang</label>
                  <input
                    type="text"
                    value={themeState.logo_url}
                    onChange={(e) => setThemeState({ ...themeState, logo_url: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-3 py-2 rounded font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Wallpaper Latar Belakang Login</label>
                  <input
                    type="text"
                    value={themeState.login_bg_url}
                    onChange={(e) => setThemeState({ ...themeState, login_bg_url: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-3 py-2 rounded font-mono text-[11px]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveTheme}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded shadow transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Simpan Konfigurasi JSONB Tema Cabang
                  </button>
                </div>
              </div>
            </div>

            {/* Live Interactive Preview Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  Live Preview Penerapan Tema ({currentSetting.branch_name})
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Representasi antarmuka pengguna (portal jamaah / dashboard agen) dengan tema aktif di atas.
                </p>
              </div>

              {/* Mockup Card */}
              <div
                className="rounded-xl p-6 shadow-2xl relative overflow-hidden border border-slate-700"
                style={{
                  backgroundColor: '#090d16',
                  backgroundImage: `linear-gradient(rgba(10, 15, 29, 0.85), rgba(10, 15, 29, 0.95)), url(${themeState.dashboard_bg_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Header Mockup */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow"
                      style={{ backgroundColor: themeState.primary_color }}
                    >
                      AH
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 text-sm">{currentSetting.branch_name}</div>
                      <div className="text-[10px] text-slate-400">ERP & CRM Multi-Branch Engine</div>
                    </div>
                  </div>

                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded text-white shadow"
                    style={{ backgroundColor: themeState.accent_color }}
                  >
                    PRODUKSI AKTIF
                  </span>
                </div>

                {/* Simulated Content */}
                <div className="py-6 space-y-3">
                  <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 backdrop-blur-sm">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Ringkasan Omset Cabang</span>
                    <div
                      className="text-lg font-bold mt-0.5"
                      style={{ color: themeState.primary_color }}
                    >
                      Rp 4.850.000.000
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="flex-1 py-2 rounded text-xs font-bold text-white shadow"
                      style={{ backgroundColor: themeState.primary_color }}
                    >
                      Booking Baru
                    </button>
                    <button
                      className="flex-1 py-2 rounded text-xs font-bold text-white shadow"
                      style={{ backgroundColor: themeState.secondary_color }}
                    >
                      Manifest Kloter
                    </button>
                  </div>
                </div>

                {/* Footer Watermark */}
                <div className="text-center pt-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                  Watermark: {themeState.company_watermark}
                </div>
              </div>

              {/* JSONB Raw Snapshot */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
                <span className="text-slate-500 text-[10px] block mb-1">Snapshot Kolom ui_theme_config JSONB:</span>
                {JSON.stringify(themeState, null, 2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: GOOGLE CALENDAR OAUTH */}
      {activeSubTab === 'GCAL_INTEGRATION' && (
        <div className="space-y-6">
          {/* Branch Switcher */}
          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-400" />
              Pilih Cabang untuk Sinkronisasi Kalender:
            </span>
            <select
              value={selectedBranchId}
              onChange={(e) => {
                setSelectedBranchId(e.target.value);
                const target = branchSettings.find((b) => b.branch_id === e.target.value);
                if (target) setGcalState(target.google_calendar_config);
              }}
              className="bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-1.5 rounded focus:outline-none focus:border-blue-500"
            >
              {branchSettings.map((b) => (
                <option key={b.branch_id} value={b.branch_id}>
                  {b.branch_name} ({b.branch_id})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* OAuth Connection Status & Settings */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
              <div>
                <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  Koneksi Google Calendar API v3 Cabang
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Tiap cabang memiliki akun Google Workspace dan ID kalender tersendiri sehingga jadwal manasik dan surat keluar tidak saling tumpang tindih.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
                  <div>
                    <span className="font-bold text-slate-200 block">Status Integrasi Kalender</span>
                    <span className="text-slate-400 text-[11px]">
                      {gcalState.is_enabled ? 'Aktif dan Terhubung via OAuth 2.0' : 'Non-Aktif / Terputus'}
                    </span>
                  </div>
                  <button
                    onClick={() => setGcalState({ ...gcalState, is_enabled: !gcalState.is_enabled })}
                    className={`px-3 py-1.5 rounded text-xs font-bold ${
                      gcalState.is_enabled
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {gcalState.is_enabled ? 'Terhubung (ON)' : 'Hubungkan (OFF)'}
                  </button>
                </div>

                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Target Google Calendar ID</label>
                  <input
                    type="text"
                    value={gcalState.calendar_id}
                    onChange={(e) => setGcalState({ ...gcalState, calendar_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-3 py-2 rounded font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block font-semibold mb-1">OAuth Client ID (Google Cloud Console)</label>
                  <input
                    type="text"
                    value={gcalState.oauth_client_id}
                    onChange={(e) => setGcalState({ ...gcalState, oauth_client_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-3 py-2 rounded font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="font-bold text-slate-300 block">Opsi Sinkronisasi Otomatis:</span>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gcalState.auto_sync_letters}
                      onChange={(e) => setGcalState({ ...gcalState, auto_sync_letters: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span className="text-slate-300">Auto-Push Jadwal dari Surat Keluar & Undangan</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gcalState.auto_sync_manasik}
                      onChange={(e) => setGcalState({ ...gcalState, auto_sync_manasik: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span className="text-slate-300">Auto-Push Agenda Bimbingan Manasik Akbar</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gcalState.auto_sync_departures}
                      onChange={(e) => setGcalState({ ...gcalState, auto_sync_departures: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span className="text-slate-300">Auto-Push Jadwal Keberangkatan & Kepulangan Kloter</span>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveGcal}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Simpan Konfigurasi Kalender Cabang
                  </button>
                </div>
              </div>
            </div>

            {/* Architecture Explainer */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
              <div>
                <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Mekanisme Trigger Basis Data (fn_trigger_outgoing_letter_gcal_sync)
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Arsitektur event-driven asinkron menggunakan PostgreSQL <code>pg_notify</code> untuk performa tinggi tanpa memblokir transaksi database:
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                  <span>Surat keluar disimpan ke tabel <code>outgoing_letter_records</code> dengan tanggal dan jam acara.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                  <span>Trigger <code>trg_outgoing_letter_gcal</code> memeriksa izin OAuth di <code>branch_settings_config</code> milik cabang terkait.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                  <span>Notifikasi <code>PERFORM pg_notify('gcal_event_push_queue', ...)</code> dikirimkan ke worker backend untuk disinkronkan ke Google Calendar v3 API.</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded text-xs text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Terisolasi per-cabang: Cabang Bandung tidak akan memodifikasi kalender Cabang Jakarta HQ.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: DYNAMIC LETTERS & GCAL PUSH */}
      {activeSubTab === 'DYNAMIC_LETTERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-3 rounded-lg text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                <strong>Modul Surat Keluar Dinamis Terpadu:</strong> Penerbitan surat resmi berkop biro perjalanan umrah dengan nomor surat otomatis, penyesuaian placeholder variabel jamaah, serta push otomatis ke Google Calendar cabang.
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Nomor Surat & Perihal</th>
                    <th className="py-3 px-4">Penerima & Kontak</th>
                    <th className="py-3 px-4">Jadwal Acara & Lokasi</th>
                    <th className="py-3 px-4">Status Sinkronisasi GCal</th>
                    <th className="py-3 px-4 text-center">Aksi Dokumen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {outgoingLetters.map((letter) => (
                    <tr key={letter.letter_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-100 text-sm">{letter.subject}</div>
                        <div className="text-[11px] font-mono text-amber-400 mt-0.5">{letter.letter_number}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{letter.recipient_name}</div>
                        <div className="text-[11px] text-slate-400">
                          {letter.recipient_email || letter.recipient_phone || '-'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {letter.event_date ? (
                          <>
                            <div className="font-semibold text-slate-200">
                              {letter.event_date} ({letter.event_start_time || '08:00'} WIB)
                            </div>
                            <div className="text-[11px] text-slate-400">{letter.event_location || '-'}</div>
                          </>
                        ) : (
                          <div className="text-slate-500 italic">Bukan Acara Berjadwal</div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            letter.gcal_sync_status === 'SYNCED'
                              ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-800'
                              : letter.gcal_sync_status === 'PENDING'
                              ? 'bg-blue-900/50 text-blue-300 border border-blue-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          {letter.gcal_sync_status}
                        </span>

                        {letter.google_calendar_event_id && (
                          <div className="text-[10px] font-mono text-blue-400 mt-1">
                            Evt ID: {letter.google_calendar_event_id}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setPreviewLetter(letter)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold flex items-center gap-1 shadow"
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </button>

                          {letter.gcal_sync_status === 'PENDING' && (
                            <button
                              onClick={() => onTriggerGcalSync(letter.letter_id)}
                              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow"
                            >
                              <RefreshCw className="w-3.5 h-3.5" /> Push GCal
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Issue New Letter */}
      {showNewLetterModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                Terbitkan Surat Keluar Dinamis
              </h3>
              <button onClick={() => setShowNewLetterModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleIssueLetterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block font-semibold mb-1">Pilih Master Template Surat</label>
                <select
                  value={newLetterForm.template_id}
                  onChange={(e) => {
                    const t = templates.find((tmp) => tmp.template_id === e.target.value);
                    setNewLetterForm({
                      ...newLetterForm,
                      template_id: e.target.value,
                      subject: t ? t.template_subject_pattern.replace('{{nama_jamaah}}', newLetterForm.recipient_name || 'Jamaah') : '',
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2 rounded focus:outline-none focus:border-amber-500"
                >
                  {templates.map((tmpl) => (
                    <option key={tmpl.template_id} value={tmpl.template_id}>
                      {tmpl.template_name} ({tmpl.template_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 block font-semibold mb-1">Nama Jamaah / Penerima</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: H. Bambang Soeprapto & Keluarga"
                  value={newLetterForm.recipient_name}
                  onChange={(e) => setNewLetterForm({ ...newLetterForm, recipient_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2 rounded focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Email Penerima</label>
                  <input
                    type="email"
                    value={newLetterForm.recipient_email}
                    onChange={(e) => setNewLetterForm({ ...newLetterForm, recipient_email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={newLetterForm.recipient_phone}
                    onChange={(e) => setNewLetterForm({ ...newLetterForm, recipient_phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Tanggal Acara</label>
                  <input
                    type="date"
                    value={newLetterForm.event_date}
                    onChange={(e) => setNewLetterForm({ ...newLetterForm, event_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Waktu Mulai</label>
                  <input
                    type="time"
                    value={newLetterForm.event_start_time}
                    onChange={(e) => setNewLetterForm({ ...newLetterForm, event_start_time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Waktu Selesai</label>
                  <input
                    type="time"
                    value={newLetterForm.event_end_time}
                    onChange={(e) => setNewLetterForm({ ...newLetterForm, event_end_time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block font-semibold mb-1">Lokasi / Tempat Acara</label>
                <input
                  type="text"
                  value={newLetterForm.event_location}
                  onChange={(e) => setNewLetterForm({ ...newLetterForm, event_location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2 rounded"
                />
              </div>

              <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded text-blue-300 text-[11px] flex items-center gap-2">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Setelah diterbitkan, acara akan langsung dijadwalkan ke Google Calendar cabang secara otomatis.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewLetterModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded font-bold hover:bg-amber-500"
                >
                  Terbitkan & Push GCal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Preview Letter Document */}
      {previewLetter && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-100 text-base">{previewLetter.subject}</h3>
                <span className="text-xs font-mono text-amber-400">{previewLetter.letter_number}</span>
              </div>
              <button onClick={() => setPreviewLetter(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Document Render Canvas */}
            <div className="bg-white text-slate-900 p-6 rounded-lg shadow-inner max-h-[60vh] overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: previewLetter.rendered_html }} />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <div className="text-slate-400">
                Status GCal: <strong className="text-emerald-400">{previewLetter.gcal_sync_status}</strong>
              </div>
              <button
                onClick={() => setPreviewLetter(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium"
              >
                Tutup Dokumen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
