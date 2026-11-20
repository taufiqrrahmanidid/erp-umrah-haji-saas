import React, { useState } from 'react';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  RotateCcw,
  Search,
  Building,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Plus,
} from 'lucide-react';
import { BankAccount, BankStatement } from '../../../types/erp.ts';

interface BankReconciliationTabProps {
  accounts: BankAccount[];
  statements: BankStatement[];
  onAutoReconcile: (accountId: string) => void;
  onManualMatch: (statementId: string) => void;
}

export const BankReconciliationTab: React.FC<BankReconciliationTabProps> = ({
  accounts,
  statements,
  onAutoReconcile,
  onManualMatch,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.bank_account_id || '');
  const [filterMatched, setFilterMatched] = useState<'ALL' | 'MATCHED' | 'UNMATCHED'>('ALL');
  const [notification, setNotification] = useState<string | null>(null);

  const selectedAccount = accounts.find((a) => a.bank_account_id === selectedAccountId) || accounts[0];

  const filteredStatements = statements
    .filter((s) => s.bank_account_id === selectedAccountId)
    .filter((s) => {
      if (filterMatched === 'MATCHED') return s.is_matched;
      if (filterMatched === 'UNMATCHED') return !s.is_matched;
      return true;
    });

  const matchedCount = statements.filter((s) => s.bank_account_id === selectedAccountId && s.is_matched).length;
  const unmatchedCount = statements.filter((s) => s.bank_account_id === selectedAccountId && !s.is_matched).length;

  const handleRunReconcile = () => {
    onAutoReconcile(selectedAccountId);
    setNotification(
      `Stored Procedure [sp_auto_reconcile_bank_statements] Berhasil Dijalankan! Mencocokkan mutasi rekening koran dengan nomor booking dan pembayaran vendor.`
    );
    setTimeout(() => setNotification(null), 4500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Rekonsiliasi Bank Otomatis (Auto-Reconcile Bank Matcher)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
              Pencocokan otomatis data mutasi rekening koran (<code>bank_statements</code>) dengan penerimaan DP/Pelunasan Jamaah dan pengeluaran PO vendor.{' '}
              Algoritma membandingkan <strong>Nominal Persis</strong> dan <strong>Nomor Referensi / Booking Code</strong> untuk memberi tag <code>is_matched = TRUE</code> secara instan.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunReconcile}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Jalankan Auto-Reconcile Matcher
        </button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 shadow">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Account Cards & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const isSelected = acc.bank_account_id === selectedAccountId;
          return (
            <button
              key={acc.bank_account_id}
              onClick={() => setSelectedAccountId(acc.bank_account_id)}
              className={`p-4 rounded-xl border text-left transition ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-xs text-emerald-400 font-bold">{acc.currency}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                  Cabang: {acc.branch_id}
                </span>
              </div>
              <p className="font-bold text-white text-sm truncate">{acc.bank_name}</p>
              <p className="text-slate-400 font-mono text-xs mt-0.5">{acc.account_number}</p>
              <div className="mt-3 pt-2 border-t border-slate-850 flex justify-between text-xs">
                <span className="text-slate-400">Saldo GL:</span>
                <span className="font-mono font-bold text-white">
                  {acc.currency === 'IDR' ? 'Rp ' : 'SAR '}
                  {acc.current_gl_balance.toLocaleString('id-ID')}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Statements Table with Status Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Mutasi Rekening Koran ({selectedAccount.bank_name})</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
              {matchedCount} Matched • {unmatchedCount} Unmatched
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setFilterMatched('ALL')}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                filterMatched === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua ({statements.filter((s) => s.bank_account_id === selectedAccountId).length})
            </button>
            <button
              onClick={() => setFilterMatched('MATCHED')}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                filterMatched === 'MATCHED' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Matched ({matchedCount})
            </button>
            <button
              onClick={() => setFilterMatched('UNMATCHED')}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                filterMatched === 'UNMATCHED' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Unmatched ({unmatchedCount})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Deskripsi Rekening Koran</th>
                <th className="py-3 px-4">Referensi / No. Booking</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4 text-center">Status Match</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans text-slate-300">
              {filteredStatements.map((stmt) => (
                <tr key={stmt.statement_id} className="hover:bg-slate-850/40">
                  <td className="py-3 px-4 font-mono text-slate-400">{stmt.transaction_date}</td>
                  <td className="py-3 px-4 font-mono font-bold">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        stmt.mutation_type === 'CR'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {stmt.mutation_type === 'CR' ? 'CR (Masuk)' : 'DB (Keluar)'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white font-medium max-w-xs truncate" title={stmt.description}>
                    {stmt.description}
                  </td>
                  <td className="py-3 px-4 font-mono text-cyan-300">{stmt.reference_number || '-'}</td>
                  <td
                    className={`py-3 px-4 text-right font-mono font-bold ${
                      stmt.mutation_type === 'CR' ? 'text-emerald-400' : 'text-slate-300'
                    }`}
                  >
                    Rp {stmt.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {stmt.is_matched ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Matched ({stmt.match_confidence})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <AlertCircle className="w-3 h-3" />
                        Unmatched
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {!stmt.is_matched ? (
                      <button
                        onClick={() => onManualMatch(stmt.statement_id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-[11px] transition"
                      >
                        Match Manual
                      </button>
                    ) : (
                      <span className="text-slate-500 text-[11px] font-mono">Tervalidasi</span>
                    )}
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
