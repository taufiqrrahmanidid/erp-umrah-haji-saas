import React, { useState } from 'react';
import {
  Inbox,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Clock,
  ArrowRight,
  UserCheck,
  History,
  Database,
  Check,
  X,
  Send,
  Eye,
} from 'lucide-react';
import {
  JournalMaster,
  OfficeExpense,
  PayrollRun,
  AuditLog,
  GeneralLedgerEntry,
  RoleCode,
} from '../../../types/erp.ts';

interface InboxAndAuditTabProps {
  journals: JournalMaster[];
  expenses: OfficeExpense[];
  payrollRun: PayrollRun;
  auditLogs: AuditLog[];
  glEntries: GeneralLedgerEntry[];
  onApproveJournal: (journalId: string) => void;
  onReleaseJournal: (journalId: string) => void;
  currentRole: RoleCode;
  currentBranchCode: string;
}

export const InboxAndAuditTab: React.FC<InboxAndAuditTabProps> = ({
  journals,
  expenses,
  payrollRun,
  auditLogs,
  glEntries,
  onApproveJournal,
  onReleaseJournal,
  currentRole,
  currentBranchCode,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'INBOX' | 'GL_MUTATION' | 'AUDIT_LOGS'>('INBOX');
  const [inboxStage, setInboxStage] = useState<'MAKER' | 'APPROVAL' | 'RELEASER'>('APPROVAL');

  // Filter documents for Inbox based on stage
  const draftJournals = journals.filter((j) => (j.workflow_status || j.workflow_stage) === 'DRAFT_MAKER');
  const approvedJournals = journals.filter((j) => (j.workflow_status || j.workflow_stage) === 'APPROVED');
  const releasedJournals = journals.filter((j) => (j.workflow_status || j.workflow_stage) === 'RELEASED');

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Inbox 3-Stage Authorization, Mutasi Buku Besar (GL) &amp; Audit Logs
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
              <strong>Inbox Workflow:</strong> Antrean kerja multi-dokumen (Maker &rarr; Approval &rarr; Releaser).{' '}
              <strong>General Ledger:</strong> Transaksi HANYA memengaruhi saldo Buku Besar jika berstatus <em>RELEASED</em>.{' '}
              <strong>Audit Trail:</strong> Sistem merekam jejak riwayat perubahan data (audit trail) secara otomatis.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('INBOX')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'INBOX'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Inbox 3-Stage Antrean
          </button>
          <button
            onClick={() => setActiveSubTab('GL_MUTATION')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'GL_MUTATION'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            Mutasi GL Cabang (v_gl)
          </button>
          <button
            onClick={() => setActiveSubTab('AUDIT_LOGS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'AUDIT_LOGS'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Audit Logs ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Subtab 1: Inbox 3-Stage Workflow */}
      {activeSubTab === 'INBOX' && (
        <div className="space-y-5">
          {/* Stage Filter Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setInboxStage('MAKER')}
              className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                inboxStage === 'MAKER'
                  ? 'bg-slate-800 border-amber-500 shadow'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 font-mono">
                  v_inbox_maker
                </span>
                <h5 className="font-bold text-white text-sm">DRAFT_MAKER</h5>
                <p className="text-[11px] text-slate-400">Dokumen dalam proses drafting</p>
              </div>
              <span className="font-mono text-lg font-bold text-amber-400">
                {draftJournals.length}
              </span>
            </button>

            <button
              onClick={() => setInboxStage('APPROVAL')}
              className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                inboxStage === 'APPROVAL'
                  ? 'bg-slate-800 border-cyan-500 shadow'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono">
                  v_inbox_approval
                </span>
                <h5 className="font-bold text-white text-sm">SIAP APPROVAL</h5>
                <p className="text-[11px] text-slate-400">Menunggu validasi Approver</p>
              </div>
              <span className="font-mono text-lg font-bold text-cyan-400">
                {draftJournals.length}
              </span>
            </button>

            <button
              onClick={() => setInboxStage('RELEASER')}
              className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                inboxStage === 'RELEASER'
                  ? 'bg-slate-800 border-emerald-500 shadow'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono">
                  v_inbox_releaser
                </span>
                <h5 className="font-bold text-white text-sm">SIAP RELEASE GL</h5>
                <p className="text-[11px] text-slate-400">Menunggu rilis keuangan HQ</p>
              </div>
              <span className="font-mono text-lg font-bold text-emerald-400">
                {approvedJournals.length}
              </span>
            </button>
          </div>

          {/* Inbox Items Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm">
                Antrean Dokumen Terkait:{' '}
                <span className="font-mono text-cyan-400">v_inbox_{inboxStage.toLowerCase()}</span>
              </h4>
              <span className="text-xs text-slate-400">User Context: {currentRole}</span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-3 py-2.5">No. Dokumen</th>
                    <th className="px-3 py-2.5">Tipe Transaksi</th>
                    <th className="px-3 py-2.5">Tanggal</th>
                    <th className="px-3 py-2.5">Cabang</th>
                    <th className="px-3 py-2.5 text-right">Total Debit/Credit</th>
                    <th className="px-3 py-2.5 text-center">Status</th>
                    <th className="px-3 py-2.5 text-right">Aksi Otorisasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-mono">
                  {inboxStage === 'APPROVAL' &&
                    draftJournals.map((j) => (
                      <tr key={j.journal_id} className="hover:bg-slate-800/40">
                        <td className="px-3 py-2.5 font-bold text-cyan-400">{j.journal_number || j.doc_no}</td>
                        <td className="px-3 py-2.5 text-slate-300">{j.reference_module || j.doc_type || 'JOURNAL'}</td>
                        <td className="px-3 py-2.5 text-slate-400">{j.transaction_date || j.doc_date}</td>
                        <td className="px-3 py-2.5 text-slate-300">{j.owner_branch_id || j.branch_id || 'C01'}</td>
                        <td className="px-3 py-2.5 text-right text-emerald-400 font-bold">
                          Rp {j.total_debit.toLocaleString('id-ID')}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                            DRAFT_MAKER
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            onClick={() => onApproveJournal(j.journal_id)}
                            className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] shadow transition"
                          >
                            Approve Dokumen
                          </button>
                        </td>
                      </tr>
                    ))}

                  {inboxStage === 'RELEASER' &&
                    approvedJournals.map((j) => (
                      <tr key={j.journal_id} className="hover:bg-slate-800/40">
                        <td className="px-3 py-2.5 font-bold text-cyan-400">{j.journal_number || j.doc_no}</td>
                        <td className="px-3 py-2.5 text-slate-300">{j.reference_module || j.doc_type || 'JOURNAL'}</td>
                        <td className="px-3 py-2.5 text-slate-400">{j.transaction_date || j.doc_date}</td>
                        <td className="px-3 py-2.5 text-slate-300">{j.owner_branch_id || j.branch_id || 'C01'}</td>
                        <td className="px-3 py-2.5 text-right text-emerald-400 font-bold">
                          Rp {j.total_debit.toLocaleString('id-ID')}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                            APPROVED
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            onClick={() => onReleaseJournal(j.journal_id)}
                            className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow transition"
                          >
                            Release ke Buku Besar
                          </button>
                        </td>
                      </tr>
                    ))}

                  {inboxStage === 'MAKER' &&
                    draftJournals.map((j) => (
                      <tr key={j.journal_id} className="hover:bg-slate-800/40">
                        <td className="px-3 py-2.5 font-bold text-cyan-400">{j.journal_number || j.doc_no}</td>
                        <td className="px-3 py-2.5 text-slate-300">{j.reference_module || j.doc_type || 'JOURNAL'}</td>
                        <td className="px-3 py-2.5 text-slate-400">{j.transaction_date || j.doc_date}</td>
                        <td className="px-3 py-2.5 text-slate-300">{j.owner_branch_id || j.branch_id || 'C01'}</td>
                        <td className="px-3 py-2.5 text-right text-emerald-400 font-bold">
                          Rp {j.total_debit.toLocaleString('id-ID')}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                            DRAFT_MAKER
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right text-slate-500 text-[11px]">
                          Menunggu Review Approver
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Mutasi Buku Besar (v_general_ledger_mutations) */}
      {activeSubTab === 'GL_MUTATION' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h4 className="font-bold text-white text-sm">
                Mutasi Buku Besar per Cabang (<code className="text-emerald-400 font-mono">v_general_ledger_mutations</code>)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Aturan Baku: Hanya jurnal berstatus <strong>RELEASED</strong> yang masuk ke Buku Besar
              </p>
            </div>

            <span className="text-xs px-2.5 py-1 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800 font-mono">
              Status: RELEASED ONLY
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2.5">Tanggal</th>
                  <th className="px-3 py-2.5">No. Dokumen</th>
                  <th className="px-3 py-2.5">Cabang</th>
                  <th className="px-3 py-2.5">Kode &amp; Nama Akun COA</th>
                  <th className="px-3 py-2.5 text-right">Debit (IDR)</th>
                  <th className="px-3 py-2.5 text-right">Credit (IDR)</th>
                  <th className="px-3 py-2.5 text-right">Mutasi Netto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-mono">
                {glEntries.map((gl, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="px-3 py-2.5 text-slate-400">{gl.doc_date}</td>
                    <td className="px-3 py-2.5 text-cyan-400 font-bold">{gl.doc_no}</td>
                    <td className="px-3 py-2.5 text-slate-300">{gl.branch_id}</td>
                    <td className="px-3 py-2.5 font-sans">
                      <span className="font-mono text-purple-300 font-bold mr-1">{gl.coa_code}</span>
                      <span className="text-white">{gl.coa_name}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-emerald-400 font-bold">
                      {gl.debit_base_amount > 0 ? `Rp ${gl.debit_base_amount.toLocaleString('id-ID')}` : '-'}
                    </td>
                    <td className="px-3 py-2.5 text-right text-rose-400 font-bold">
                      {gl.credit_base_amount > 0 ? `Rp ${gl.credit_base_amount.toLocaleString('id-ID')}` : '-'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-white">
                      Rp {gl.net_movement.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 3: Audit Logs */}
      {activeSubTab === 'AUDIT_LOGS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h4 className="font-bold text-white text-sm">
                Rekaman Audit Trail Otomatis (<code className="text-purple-400 font-mono">audit_logs</code>)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Dihasilkan otomatis oleh modul Audit Trail Enterprise
              </p>
            </div>
            <span className="text-xs font-mono text-purple-400">{auditLogs.length} Aktivitas Terekam</span>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.log_id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        log.action_type === 'INSERT'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : log.action_type === 'UPDATE'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {log.action_type}
                    </span>
                    <span className="font-mono text-cyan-400 font-bold">
                      Tabel: {log.table_name}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="font-mono text-slate-300">ID: {log.record_id}</span>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(log.created_at).toLocaleTimeString('id-ID')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px]">
                  {log.old_data && (
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-[9px] uppercase font-bold text-rose-400 font-sans block">
                        Old Data (Sebelum):
                      </span>
                      {JSON.stringify(log.old_data)}
                    </div>
                  )}
                  {log.new_data && (
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-[9px] uppercase font-bold text-emerald-400 font-sans block">
                        New Data (Sesudah):
                      </span>
                      {JSON.stringify(log.new_data)}
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>Eksekutor: <strong className="text-slate-300">{log.user_name}</strong></span>
                  <span className="font-mono">IP: {log.ip_address}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
