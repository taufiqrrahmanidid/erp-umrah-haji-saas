import React, { useState } from 'react';
import {
  Mail,
  Calendar,
  FileText,
  Send,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Building,
  UserCheck,
} from 'lucide-react';
import { DocumentTemplate, OutgoingLetter, AppSetting } from '../../../types/erp.ts';

interface DocumentAndGCalTabProps {
  templates: DocumentTemplate[];
  letters: OutgoingLetter[];
  appSettings: AppSetting[];
  onGenerateLetter: (newLetter: OutgoingLetter) => void;
  currentBranchCode: string;
}

export const DocumentAndGCalTab: React.FC<DocumentAndGCalTabProps> = ({
  templates,
  letters,
  appSettings,
  onGenerateLetter,
  currentBranchCode,
}) => {
  // Find current branch Google Calendar config
  const calConfigSetting = appSettings.find(
    (s) => s.setting_key === 'google_calendar_config' && s.branch_id === currentBranchCode
  ) || appSettings.find((s) => s.setting_key === 'google_calendar_config');

  const calendarConfig = calConfigSetting?.setting_value || {
    calendar_id: 'primary_agenda@group.calendar.google.com',
    calendar_name: 'Agenda Manasik & Kloter Cabang',
    sync_enabled: true,
  };

  // Form states
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.template_id || '');
  const [recipientName, setRecipientName] = useState('Hj. Siti Aminah & H. Budi Santoso');
  const [subject, setSubject] = useState('Undangan Bimbingan Manasik Akbar Kloter 1 1447H');
  const [eventDate, setEventDate] = useState('2026-10-25');
  const [syncToGcal, setSyncToGcal] = useState(true);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const selectedTemplate = templates.find((t) => t.template_id === selectedTemplateId) || templates[0];

  // Render template HTML dynamically replacing {{nama_tujuan}} and {{tanggal_acara}}
  const renderedPreview = React.useMemo(() => {
    if (!selectedTemplate) return '';
    let content = selectedTemplate.html_content;
    content = content.replace(/\{\{nama_tujuan\}\}/g, recipientName || '[Nama Penerima]');
    content = content.replace(/\{\{tanggal_acara\}\}/g, eventDate || '[Tanggal Acara]');
    return content;
  }, [selectedTemplate, recipientName, eventDate]);

  const handleCreateAndPush = (e: React.FormEvent) => {
    e.preventDefault();

    const gcalEventId = syncToGcal
      ? `gcal_evt_${currentBranchCode}_${Date.now()}`
      : undefined;

    const letterNo = `SK/${currentBranchCode}/${new Date().getFullYear()}/${String(
      new Date().getMonth() + 1
    ).padStart(2, '0')}/${String(letters.length + 1).padStart(4, '0')}`;

    const newLetter: OutgoingLetter = {
      letter_id: `let-${Date.now()}`,
      tenant_id: '11111111-1111-1111-1111-111111111111',
      branch_id: currentBranchCode,
      template_id: selectedTemplate.template_id,
      template_name: selectedTemplate.template_name,
      letter_number: letterNo,
      recipient_name: recipientName,
      subject,
      event_date: eventDate,
      rendered_body_html: renderedPreview,
      google_calendar_event_id: gcalEventId,
      gcal_sync_status: syncToGcal ? 'SYNCED' : 'NOT_APPLICABLE',
      created_by_name: `Admin Cabang ${currentBranchCode}`,
      created_at: new Date().toISOString(),
    };

    onGenerateLetter(newLetter);
    setSuccessNotice(
      `Surat Keluar ${letterNo} berhasil diterbitkan ${
        syncToGcal
          ? `dan otomatis disinkronkan ke Google Calendar Cabang (${calendarConfig.calendar_id})!`
          : '!'
      }`
    );
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Administrasi Dokumen, Surat Keluar Dinamis &amp; Auto-Push Google Calendar
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
              Menerbitkan surat keluar dinamis dari <code className="text-cyan-400 font-mono">document_templates</code> dengan
              variabel <code className="text-amber-300 font-mono">{`{{nama_tujuan}}`}</code> dan{' '}
              <code className="text-amber-300 font-mono">{`{{tanggal_acara}}`}</code>.
              Setiap kali surat beragenda dibuat, sistem membaca konfigurasi kalender cabang terkait dari{' '}
              <code className="text-cyan-400 font-mono">app_settings</code> dan otomatis membuat event di Google Calendar cabang tersebut.
            </p>
          </div>
        </div>
      </div>

      {successNotice && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 shadow">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Grid: Generator Form vs Live Rendered Letter with GCal status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Letter Generator (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Generator Surat Keluar Dinamis
            </h4>
            <span className="text-xs font-mono text-cyan-400">Cabang: {currentBranchCode}</span>
          </div>

          <form onSubmit={handleCreateAndPush} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Pilih Template Dokumen</label>
              <select
                aria-label="Pilih Template Dokumen"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-500"
              >
                {templates.map((tmpl) => (
                  <option key={tmpl.template_id} value={tmpl.template_id}>
                    {tmpl.template_name} ({tmpl.template_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Nama Penerima ({`{{nama_tujuan}}`})</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Perihal / Subject Surat</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                Tanggal Acara / Tenggat ({`{{tanggal_acara}}`})
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            {/* Google Calendar Sync Box */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  Auto-Push ke Google Calendar Cabang
                </span>
                <input
                  type="checkbox"
                  checked={syncToGcal}
                  onChange={(e) => setSyncToGcal(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Target Kalender: <strong className="text-cyan-400 font-mono">{calendarConfig.calendar_id}</strong>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Terbitkan Surat &amp; Sinkronkan Agenda
            </button>
          </form>
        </div>

        {/* Right Preview: Rendered HTML Letter with GCal status (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Live Preview Dokumen Surat Resmi
              </h4>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                HTML Interpolation
              </span>
            </div>

            {/* Simulated Paper Document */}
            <div className="bg-white text-slate-900 rounded-xl p-6 shadow-2xl border border-slate-300 font-serif min-h-[280px]">
              <div className="text-center pb-3 border-b-2 border-slate-900">
                <h3 className="font-black text-sm tracking-wide text-emerald-900 uppercase">
                  PT AL-HARAMAIN TOUR &amp; TRAVEL INDONESIA
                </h3>
                <p className="text-[10px] text-slate-600 font-sans">
                  Kantor Cabang: Kediri Jawa Timur • Izin PPIU Kemenag No. 921/2021
                </p>
              </div>

              <div className="py-3 text-[11px] font-sans flex justify-between text-slate-600">
                <span>Nomor: SK/{currentBranchCode}/2026/10/XXXX</span>
                <span>Kediri, {new Date().toLocaleDateString('id-ID')}</span>
              </div>

              <div
                className="prose prose-sm text-slate-800 text-xs leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderedPreview }}
              />

              <div className="mt-6 pt-3 border-t border-slate-200 flex justify-end font-sans text-xs">
                <div className="text-center">
                  <p className="text-[10px] text-slate-500">Pimpinan Cabang Kediri,</p>
                  <div className="h-10"></div>
                  <p className="font-bold text-slate-900 underline">Ust. Ahmad Fauzan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Outgoing Letters History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <h4 className="font-bold text-white text-sm">
          Daftar Surat Keluar Terbitan Cabang &amp; Status Google Calendar (outgoing_letters)
        </h4>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-3 py-2.5">No. Surat Keluar</th>
                <th className="px-3 py-2.5">Penerima &amp; Perihal</th>
                <th className="px-3 py-2.5">Tanggal Acara</th>
                <th className="px-3 py-2.5">Google Calendar Event ID</th>
                <th className="px-3 py-2.5 text-center">Status GCal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-mono">
              {letters.map((letItem) => (
                <tr key={letItem.letter_id} className="hover:bg-slate-800/40">
                  <td className="px-3 py-2.5 text-cyan-400 font-bold">{letItem.letter_number}</td>
                  <td className="px-3 py-2.5 font-sans">
                    <div className="font-semibold text-white">{letItem.recipient_name}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{letItem.subject}</div>
                  </td>
                  <td className="px-3 py-2.5 text-slate-300">{letItem.event_date || '-'}</td>
                  <td className="px-3 py-2.5 text-purple-300">{letItem.google_calendar_event_id || '-'}</td>
                  <td className="px-3 py-2.5 text-center font-sans">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        letItem.gcal_sync_status === 'SYNCED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {letItem.gcal_sync_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
