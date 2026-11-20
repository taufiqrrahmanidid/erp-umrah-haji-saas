import React, { useState } from 'react';
import {
  FileText,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  BadgeDollarSign,
  ShieldCheck,
  Building,
  UserCheck,
  Send,
  Plus,
  Trash2,
  Save,
  X,
  Search,
  BookOpen,
  Calendar,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { JournalMaster, RoleCode } from '../../types/erp.ts';
import { CollapsibleCard } from '../common/CollapsibleCard.tsx';
import { PopupCalendar } from '../common/PopupCalendar.tsx';
import { ResizableTh, useResizableColumns } from '../common/ResizableTable.tsx';

interface JournalArchitectureTabProps {
  journals: JournalMaster[];
  currentRole?: RoleCode;
  currentBranchCode?: string;
}

export const JournalArchitectureTab: React.FC<JournalArchitectureTabProps> = ({
  journals: initialJournals,
  currentRole = 'ADMIN_HQ',
  currentBranchCode = 'C00',
}) => {
  const [journals, setJournals] = useState<JournalMaster[]>(initialJournals);
  const [selectedJournal, setSelectedJournal] = useState<JournalMaster>(journals[0]);

  // Test simulation state for updating stage
  const [stageError, setStageError] = useState<string | null>(null);
  const [stageSuccess, setStageSuccess] = useState<string | null>(null);

  // Manual Journal Form State
  const [manualJournalNo, setManualJournalNo] = useState(
    `JRN/${currentBranchCode}/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(
      journals.length + 1
    ).padStart(4, '0')}`
  );
  const [manualDate, setManualDate] = useState('2026-10-11');
  const [manualBranch, setManualBranch] = useState(currentBranchCode);
  const [manualDescription, setManualDescription] = useState('Beban Operasional Kantor & Konsumsi Manasik Cabang');
  const [manualSubLedger, setManualSubLedger] = useState('SUB-OPR-KDR-01');

  interface JournalLineItem {
    id: string;
    account_code: string;
    account_name: string;
    currency_code: 'IDR' | 'SAR' | 'USD';
    amount_valas: number;
    exchange_rate: number;
    debit_amount: number;
    credit_amount: number;
    memo: string;
  }

  const [journalLines, setJournalLines] = useState<JournalLineItem[]>([
    {
      id: 'line-1',
      account_code: '6101',
      account_name: 'Beban Operasional Kantor & Utilitas',
      currency_code: 'IDR',
      amount_valas: 0,
      exchange_rate: 1,
      debit_amount: 3500000,
      credit_amount: 0,
      memo: 'Biaya Konsumsi Rapat Manasik & Listrik',
    },
    {
      id: 'line-2',
      account_code: '1101',
      account_name: 'Kas Operasional Kantor Cabang',
      currency_code: 'IDR',
      amount_valas: 0,
      exchange_rate: 1,
      debit_amount: 0,
      credit_amount: 3500000,
      memo: 'Pembayaran Kas Tunai',
    },
  ]);

  // Workflow stages
  const stages: Array<'DRAFT_MAKER' | 'APPROVED' | 'RELEASED'> = [
    'DRAFT_MAKER',
    'APPROVED',
    'RELEASED',
  ];

  // Calculate live total debit and credit for manual entry
  const totalManualDebit = journalLines.reduce((acc, l) => acc + Number(l.debit_amount || 0), 0);
  const totalManualCredit = journalLines.reduce((acc, l) => acc + Number(l.credit_amount || 0), 0);
  const isManualBalanced = totalManualDebit === totalManualCredit && totalManualDebit > 0;

  const handleAddLine = () => {
    setJournalLines([
      ...journalLines,
      {
        id: `line-${Date.now()}`,
        account_code: '6102',
        account_name: 'Beban Pemasaran & Brosur Manasik',
        currency_code: 'IDR',
        amount_valas: 0,
        exchange_rate: 1,
        debit_amount: 0,
        credit_amount: 0,
        memo: '',
      },
    ]);
  };

  const handleRemoveLine = (id: string) => {
    if (journalLines.length <= 2) {
      setStageError('Jurnal minimal harus memiliki 2 baris (Debit & Kredit)!');
      setTimeout(() => setStageError(null), 4000);
      return;
    }
    setJournalLines(journalLines.filter((l) => l.id !== id));
  };

  const handleLineChange = (id: string, field: keyof JournalLineItem, value: any) => {
    setJournalLines(
      journalLines.map((line) => {
        if (line.id !== id) return line;
        const updated = { ...line, [field]: value };

        // Auto update account_name if account_code changes
        if (field === 'account_code') {
          if (value === '1101') updated.account_name = 'Kas Tunai Operasional';
          else if (value === '1102') updated.account_name = 'Kas di Bank BSI Operasional';
          else if (value === '1103') updated.account_name = 'Piutang Usaha Jamaah';
          else if (value === '2101') updated.account_name = 'Utang Vendor Tiket & Hotel';
          else if (value === '5101') updated.account_name = 'HPP Tiket Pesawat & Visa';
          else if (value === '6101') updated.account_name = 'Beban Operasional & Listrik';
          else if (value === '6102') updated.account_name = 'Beban Pemasaran & Promosi';
          else if (value === '6103') updated.account_name = 'Beban Sewa Bus & Transportasi';
          else if (value === '6104') updated.account_name = 'Beban Konsumsi & Catering Manasik';
        }

        return updated;
      })
    );
  };

  const handleResetManualForm = () => {
    setManualJournalNo(
      `JRN/${manualBranch}/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(
        journals.length + 1
      ).padStart(4, '0')}`
    );
    setManualDate('2026-10-11');
    setManualDescription('');
    setManualSubLedger('SUB-OPR-01');
    setJournalLines([
      {
        id: 'line-1',
        account_code: '6101',
        account_name: 'Beban Operasional & Listrik',
        currency_code: 'IDR',
        amount_valas: 0,
        exchange_rate: 1,
        debit_amount: 0,
        credit_amount: 0,
        memo: '',
      },
      {
        id: 'line-2',
        account_code: '1101',
        account_name: 'Kas Tunai Operasional',
        currency_code: 'IDR',
        amount_valas: 0,
        exchange_rate: 1,
        debit_amount: 0,
        credit_amount: 0,
        memo: '',
      },
    ]);
  };

  const handleSaveManualJournal = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isManualBalanced) {
      setStageError(
        `Jurnal Operasional Tidak Seimbang! Total Debit: Rp ${totalManualDebit.toLocaleString('id-ID')} | Total Kredit: Rp ${totalManualCredit.toLocaleString('id-ID')}. Harap samakan nilai Debit dan Kredit.`
      );
      setTimeout(() => setStageError(null), 5000);
      return;
    }

    const newJournalObj: JournalMaster = {
      journal_id: `jrn-manual-${Date.now()}`,
      tenant_id: '11111111-1111-1111-1111-111111111111',
      branch_id: manualBranch,
      journal_number: manualJournalNo,
      transaction_date: manualDate,
      workflow_stage: 'DRAFT_MAKER',
      maker_id: 'usr-staf-ops',
      maker_name: 'Staf Operasional Cabang',
      total_debit: totalManualDebit,
      total_credit: totalManualCredit,
      notes: manualDescription,
      created_at: new Date().toISOString(),
      bodies: [
        {
          body_id: `jb-${Date.now()}`,
          journal_id: `jrn-manual-${Date.now()}`,
          sub_ledger_type: 'OPERATIONAL_EXPENSE',
          sub_ledger_code: manualSubLedger,
          description: manualDescription,
          details: journalLines.map((l, idx) => ({
            detail_id: `jd-${Date.now()}-${idx}`,
            body_id: `jb-${Date.now()}`,
            account_code: l.account_code,
            account_name: l.account_name,
            currency_code: l.currency_code,
            amount_valas: l.amount_valas,
            exchange_rate: l.exchange_rate,
            debit_amount: Number(l.debit_amount || 0),
            credit_amount: Number(l.credit_amount || 0),
            notes: l.memo || manualDescription,
          })),
        },
      ],
    };

    setJournals([newJournalObj, ...journals]);
    setSelectedJournal(newJournalObj);
    setStageSuccess(
      `Jurnal Operasional Manual [${manualJournalNo}] berhasil dibuat dan masuk antrean status DRAFT_MAKER!`
    );
    setTimeout(() => setStageSuccess(null), 5000);
  };

  const handleAdvanceStage = (targetStage: 'DRAFT_MAKER' | 'APPROVED' | 'RELEASED') => {
    setStageError(null);
    setStageSuccess(null);

    // Calculate total debit vs total credit
    let totalDebit = 0;
    let totalCredit = 0;

    selectedJournal.bodies.forEach((body) => {
      body.details.forEach((det) => {
        totalDebit += det.debit_amount;
        totalCredit += det.credit_amount;
      });
    });

    // Check Trigger fn_check_journal_balance
    if (targetStage === 'APPROVED' || targetStage === 'RELEASED') {
      if (totalDebit !== totalCredit) {
        setStageError(
          `Trigger fn_check_journal_balance GAGAL: Total Debit (Rp ${totalDebit.toLocaleString(
            'id-ID'
          )}) tidak seimbang dengan Total Credit (Rp ${totalCredit.toLocaleString(
            'id-ID'
          )})! Transaksi ditolak.`
        );
        return;
      }

      if (totalDebit === 0) {
        setStageError('Validasi GL Gagal: Transaksi bernilai Rp 0 tidak dapat di-approve/release.');
        return;
      }
    }

    // Success
    const updated = { ...selectedJournal, workflow_stage: targetStage };
    setSelectedJournal(updated);
    setJournals(journals.map((j) => (j.journal_id === updated.journal_id ? updated : j)));
    setStageSuccess(
      `Status Jurnal ${updated.journal_number} berhasil diperbarui ke [${targetStage}]. Double-Entry Terverifikasi Seimbang!`
    );
  };

  return (
    <div className="space-y-6 text-sm">
      {/* Intro Header & Action Banner (Collapsible) */}
      <CollapsibleCard
        title="Arsitektur Akuntansi 3-Level Journal & 3-Stage Workflow"
        subtitle="Fondasi General Ledger Buku Besar biro: journal_masters (Header), journal_bodies (Sub-Ledger), dan journal_details (Entry Valas & Balance)"
        icon={Layers}
        defaultOpen={true}
      >
        {/* Visual Hierarchy Diagram Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Level 1 Card */}
          <div className="bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 p-4 rounded-xl space-y-2 border-t-4 border-t-purple-500 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">
                Level 1 (Header)
              </span>
              <span className="font-mono text-xs text-slate-500">journal_masters</span>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Master Jurnal &amp; Workflow</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Nomor Dokumen unik (JRN/BRANCH/YYYY/MM/XXXX), Maker ID, Approver ID, Releaser ID, dan tahap workflow.
            </p>
          </div>

          {/* Level 2 Card */}
          <div className="bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 p-4 rounded-xl space-y-2 border-t-4 border-t-cyan-500 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-cyan-600 dark:text-cyan-400 tracking-wider">
                Level 2 (Sub-Ledger)
              </span>
              <span className="font-mono text-xs text-slate-500">journal_bodies</span>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Grup Objek Biaya &amp; Paket</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Mengelompokkan transaksi ke dalam sub-ledger objek spesifik: Kode Paket Umrah, ID Jamaah, atau Vendor Operasional.
            </p>
          </div>

          {/* Level 3 Card */}
          <div className="bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 p-4 rounded-xl space-y-2 border-t-4 border-t-emerald-500 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                Level 3 (Entry)
              </span>
              <span className="font-mono text-xs text-slate-500">journal_details</span>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Baris GL Valas &amp; Balance</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Menyimpan kode akun COA, valas (SAR/USD), kurs acuan, serta nilai mutasi Debit &amp; Credit terverifikasi imbang.
            </p>
          </div>
        </div>
      </CollapsibleCard>

      {/* FORMULIR PEMBUATAN JURNAL OPERASIONAL SECARA MANUAL (INLINE COLLAPSIBLE CARD) */}
      <CollapsibleCard
        title="Formulir Pembuatan Jurnal Operasional Secara Manual (Double-Entry GL)"
        subtitle="Entri biaya operasional cabang, belanja manasik, dan beban kantor dengan validasi keseimbangan Debit & Kredit otomatis"
        icon={Plus}
        defaultOpen={true}
        headerRight={
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            Maker Stage: DRAFT_MAKER
          </span>
        }
      >
        <form onSubmit={handleSaveManualJournal} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-xs">
                No. Jurnal Operasional <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={manualJournalNo}
                onChange={(e) => setManualJournalNo(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <PopupCalendar
                label="Tanggal Transaksi Operasional"
                required={true}
                value={manualDate}
                onChange={(val) => setManualDate(val)}
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-xs">
                Unit Entitas / Cabang <span className="text-rose-500">*</span>
              </label>
              <select
                value={manualBranch}
                onChange={(e) => setManualBranch(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 font-semibold text-slate-900 dark:text-white text-sm"
              >
                <option value="C00">C00 - Pusat Jakarta (HQ)</option>
                <option value="C01">C01 - Cabang Kediri (KSO Mandiri)</option>
                <option value="C02">C02 - Sub-Cabang Blitar (Sub KSO)</option>
                <option value="C03">C03 - Cabang Surabaya (Mandiri)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-xs">
                Kode Sub-Ledger Biaya
              </label>
              <input
                type="text"
                value={manualSubLedger}
                onChange={(e) => setManualSubLedger(e.target.value)}
                placeholder="Contoh: SUB-OPR-KDR-01"
                className="w-full bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-xs">
              Keterangan / Narasi Transaksi Operasional <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={manualDescription}
              onChange={(e) => setManualDescription(e.target.value)}
              placeholder="Contoh: Pembayaran Biaya Operasional Sewa Ruangan Manasik, Konsumsi Snack, & Listrik Kantor Cabang"
              className="w-full bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium text-sm"
            />
          </div>

          {/* Multi-line Entry Table */}
          <div className="border border-[#C0DDD6] dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-[#EBF5F3] dark:bg-slate-950 px-4 py-2.5 border-b border-[#C0DDD6] dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white text-xs">
                Rincian Akun Double-Entry (Debit &amp; Kredit Mutasi)
              </span>
              <button
                type="button"
                onClick={handleAddLine}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-emerald-600 dark:text-white flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris Akun</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F8F7] dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-semibold border-b border-[#C0DDD6] dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Kode Akun (COA)</th>
                    <th className="py-2.5 px-3">Nama Akun Buku Besar</th>
                    <th className="py-2.5 px-3">Memo / Catatan Baris</th>
                    <th className="py-2.5 px-3 text-right">Debit (IDR)</th>
                    <th className="py-2.5 px-3 text-right">Kredit (IDR)</th>
                    <th className="py-2.5 px-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C0DDD6]/60 dark:divide-slate-800">
                  {journalLines.map((line) => (
                    <tr key={line.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3">
                        <select
                          value={line.account_code}
                          onChange={(e) => handleLineChange(line.id, 'account_code', e.target.value)}
                          className="w-36 bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-700 rounded-lg px-2 py-1.5 font-mono font-bold text-xs"
                        >
                          <option value="1101">1101 - Kas Tunai</option>
                          <option value="1102">1102 - Kas Bank BSI</option>
                          <option value="1103">1103 - Piutang Usaha</option>
                          <option value="2101">2101 - Utang Vendor</option>
                          <option value="5101">5101 - HPP Umrah</option>
                          <option value="6101">6101 - Beban Operasional</option>
                          <option value="6102">6102 - Beban Promosi</option>
                          <option value="6103">6103 - Beban Sewa & Transport</option>
                          <option value="6104">6104 - Beban Konsumsi Manasik</option>
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={line.account_name}
                          onChange={(e) => handleLineChange(line.id, 'account_name', e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-700 rounded-lg px-2 py-1.5 font-medium text-xs text-slate-800 dark:text-white"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={line.memo}
                          onChange={(e) => handleLineChange(line.id, 'memo', e.target.value)}
                          placeholder="Memo baris..."
                          className="w-full bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-800 dark:text-white"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          value={line.debit_amount}
                          onChange={(e) => handleLineChange(line.id, 'debit_amount', Number(e.target.value))}
                          className="w-32 bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-700 rounded-lg px-2 py-1.5 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          value={line.credit_amount}
                          onChange={(e) => handleLineChange(line.id, 'credit_amount', Number(e.target.value))}
                          className="w-32 bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-700 rounded-lg px-2 py-1.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400 text-xs"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(line.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#EBF5F3] dark:bg-slate-950 font-bold border-t border-[#C0DDD6] dark:border-slate-800">
                  <tr>
                    <td colSpan={3} className="py-2.5 px-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                      TOTAL MUTASI DEBIT &amp; KREDIT:
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700 dark:text-emerald-400 text-sm">
                      Rp {totalManualDebit.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-600 dark:text-rose-400 text-sm">
                      Rp {totalManualCredit.toLocaleString('id-ID')}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Status Validasi Seimbang */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
              isManualBalanced
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {isManualBalanced ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span className="font-bold text-xs">
                {isManualBalanced
                  ? 'Status Double-Entry: Seimbang (Balanced) & Memenuhi Standar Pembukuan Akuntansi'
                  : `Status: Belum Seimbang! (Selisih Mutasi: Rp ${Math.abs(totalManualDebit - totalManualCredit).toLocaleString('id-ID')})`}
              </span>
            </div>
            <span className="text-xs font-mono font-semibold">
              Debit: Rp {totalManualDebit.toLocaleString('id-ID')} | Kredit: Rp {totalManualCredit.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#C0DDD6] dark:border-slate-800">
            <button
              type="button"
              onClick={handleResetManualForm}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Form</span>
            </button>
            <button
              type="submit"
              disabled={!isManualBalanced}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#98C3BC] hover:bg-[#86b5ad] disabled:opacity-50 text-[#13302B] dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white flex items-center gap-2 shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Jurnal Operasional (DRAFT_MAKER)</span>
            </button>
          </div>
        </form>
      </CollapsibleCard>

      {/* Interactive Journal Inspector & Stage Workflow Runner */}
      <CollapsibleCard
        title={`Inspeksi Dokumen Jurnal: ${selectedJournal.journal_number}`}
        subtitle="Rincian baris akun debit-kredit, validasi keseimbangan GL, dan perpindahan status Maker-Approver-Releaser"
        icon={BookOpen}
        defaultOpen={true}
      >
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-[#C0DDD6] dark:border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-base text-[#1E4E46] dark:text-cyan-400">
                  {selectedJournal.journal_number}
                </span>
                <span
                  className={`text-xs uppercase font-bold px-2.5 py-0.5 rounded-full ${
                    selectedJournal.workflow_stage === 'RELEASED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-300'
                      : selectedJournal.workflow_stage === 'APPROVED'
                      ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-400 border border-cyan-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-300'
                  }`}
                >
                  {selectedJournal.workflow_stage}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {selectedJournal.notes} • Tanggal Transaksi: <strong>{selectedJournal.transaction_date}</strong> • Cabang: {selectedJournal.branch_id}
              </p>
            </div>

            {/* Workflow Stage Progress Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold mr-1">Ubah Tahap Workflow:</span>
              {stages.map((stg) => (
                <button
                  key={stg}
                  onClick={() => handleAdvanceStage(stg)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedJournal.workflow_stage === stg
                      ? 'bg-[#98C3BC] text-[#13302B] dark:bg-purple-600 dark:text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border border-[#C0DDD6] dark:border-slate-700'
                  }`}
                >
                  {stg}
                </button>
              ))}
            </div>
          </div>

          {/* Error / Success Notifications */}
          {stageError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{stageError}</span>
            </div>
          )}
          {stageSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{stageSuccess}</span>
            </div>
          )}

          {/* Daftar Jurnal Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-xs text-slate-500 font-bold shrink-0">Pilih Dokumen:</span>
            {journals.map((j) => (
              <button
                key={j.journal_id}
                type="button"
                onClick={() => setSelectedJournal(j)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
                  selectedJournal.journal_id === j.journal_id
                    ? 'bg-[#98C3BC] text-[#13302B] dark:bg-slate-800 dark:text-cyan-300 border border-[#7fafA6] shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-[#C0DDD6] dark:border-slate-800 hover:text-slate-900'
                }`}
              >
                {j.journal_number}
              </button>
            ))}
          </div>

          {/* 3-Level Breakdown Tree for Selected Journal */}
          <div className="space-y-4">
            <h5 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">
              Daftar Sub-Ledger Body &amp; Rincian Detail Akun Double-Entry
            </h5>

            {selectedJournal.bodies.map((body, bIndex) => (
              <div key={body.body_id} className="bg-white dark:bg-slate-950 rounded-xl border border-[#C0DDD6] dark:border-slate-800 overflow-hidden">
                <div className="bg-[#EBF5F3] dark:bg-slate-900/90 px-4 py-2.5 border-b border-[#C0DDD6] dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-purple-700 dark:text-purple-400 font-bold">Body #{bIndex + 1}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-bold text-slate-900 dark:text-white">{body.description}</span>
                  </div>
                  <span className="font-mono text-emerald-700 dark:text-cyan-400 text-xs font-semibold">
                    Sub-Ledger: {body.sub_ledger_code}
                  </span>
                </div>

                {/* Table of Details */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                    <thead className="bg-[#F4F8F7] dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase font-mono text-[11px] border-b border-[#C0DDD6] dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-2.5">Kode Akun (COA)</th>
                        <th className="px-4 py-2.5">Nama Akun GL</th>
                        <th className="px-3 py-2.5">Mata Uang &amp; Kurs</th>
                        <th className="px-4 py-2.5 text-right">Debit (IDR)</th>
                        <th className="px-4 py-2.5 text-right">Credit (IDR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C0DDD6]/60 dark:divide-slate-800 font-mono">
                      {body.details.map((det) => (
                        <tr key={det.detail_id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                          <td className="px-4 py-2.5 font-bold text-cyan-700 dark:text-cyan-400">
                            {det.account_code}
                          </td>
                          <td className="px-4 py-2.5 font-sans font-medium text-slate-900 dark:text-slate-200">
                            {det.account_name}
                            {det.notes && (
                              <span className="block text-[11px] text-slate-500 font-normal">{det.notes}</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">
                            {det.currency_code} @ {det.exchange_rate.toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                            Rp {det.debit_amount.toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-2.5 text-right font-bold text-rose-600 dark:text-rose-400">
                            Rp {det.credit_amount.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
};
