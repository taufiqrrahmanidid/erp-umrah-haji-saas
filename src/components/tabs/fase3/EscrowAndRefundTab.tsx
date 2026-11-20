import React, { useState } from 'react';
import {
  PiggyBank,
  RefreshCw,
  Ban,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Send,
  Building,
} from 'lucide-react';
import {
  SavingAccount,
  SavingMutation,
  BookingCancellation,
  Booking,
  RoleCode,
} from '../../../types/erp.ts';

interface EscrowAndRefundTabProps {
  savingAccounts: SavingAccount[];
  savingMutations: SavingMutation[];
  cancellations: BookingCancellation[];
  bookings: Booking[];
  onConvertSaving: (customerId: string, bookingId: string, amount: number) => void;
  onApproveRefund: (cancellationId: string) => void;
  currentBranchCode: string;
}

export const EscrowAndRefundTab: React.FC<EscrowAndRefundTabProps> = ({
  savingAccounts,
  savingMutations,
  cancellations,
  bookings,
  onConvertSaving,
  onApproveRefund,
  currentBranchCode,
}) => {
  const [subTab, setSubTab] = useState<'ESCROW' | 'REFUND'>('ESCROW');

  // Conversion form state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    savingAccounts[0]?.customer_id || 'cust-01'
  );
  const [targetBookingId, setTargetBookingId] = useState<string>(
    bookings.find((b) => b.outstanding_balance > 0)?.booking_id || bookings[0]?.booking_id || ''
  );
  const [convertAmount, setConvertAmount] = useState<number>(15000000);
  const [notification, setNotification] = useState<string | null>(null);

  const selectedAccount = savingAccounts.find((a) => a.customer_id === selectedCustomerId) || savingAccounts[0];
  const targetBooking = bookings.find((b) => b.booking_id === targetBookingId);

  const handleExecuteConversion = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAccount || selectedAccount.current_balance < convertAmount) {
      alert('Gagal: Saldo tabungan escrow tidak mencukupi!');
      return;
    }

    onConvertSaving(selectedCustomerId, targetBookingId, convertAmount);
    setNotification(
      `Stored Procedure [sp_convert_saving_to_booking_payment] Berhasil! Rp ${convertAmount.toLocaleString('id-ID')} dari Tabungan Escrow telah dikonversi untuk melunasi booking ${targetBooking?.booking_number}.`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Tabungan Umrah (Escrow) &amp; Modul Pembatalan / Refund Booking
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
              <strong>Tabungan Escrow:</strong> Dana tabungan jamaah terisolasi secara akuntansi dari invoice paket
              hingga jamaah memilih konversi pelunasan (Checkout) melalui Stored Procedure{' '}
              <code className="text-cyan-400 font-mono">sp_convert_saving_to_booking_payment</code>.
              <strong> Refund Engine:</strong> Otomatisasi pemotongan penalti fee tiket/hotel hangus dan auto-jurnal kas keluar.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSubTab('ESCROW')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              subTab === 'ESCROW'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <PiggyBank className="w-3.5 h-3.5" />
            Tabungan Escrow Jamaah
          </button>
          <button
            onClick={() => setSubTab('REFUND')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              subTab === 'REFUND'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            Pembatalan &amp; Refund ({cancellations.length})
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 shadow">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Subtab 1: Escrow & Conversion */}
      {subTab === 'ESCROW' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sisi Kiri: Rekening Tabungan & Form Konversi (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-emerald-400" />
                Konversi Saldo Escrow ke Pelunasan
              </h4>
              <span className="text-xs font-mono text-emerald-400">Stored Procedure</span>
            </div>

            {/* Active Account Balance Card */}
            {selectedAccount && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/50 to-slate-950 border border-emerald-800/60 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                      Rekening Escrow BSI Mandiri
                    </span>
                    <h5 className="font-bold text-white text-sm">{selectedAccount.customer_name}</h5>
                    <span className="font-mono text-slate-400 text-xs">{selectedAccount.account_number}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    {selectedAccount.status}
                  </span>
                </div>

                <div className="pt-2 border-t border-emerald-900/60 flex justify-between items-end">
                  <span className="text-xs text-slate-400">Saldo Tersedia:</span>
                  <span className="font-mono font-bold text-emerald-400 text-lg">
                    Rp {selectedAccount.current_balance.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleExecuteConversion} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Pilih Akun Tabungan Jamaah</label>
                <select
                  aria-label="Pilih Akun Tabungan Jamaah"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                >
                  {savingAccounts.map((acc) => (
                    <option key={acc.saving_account_id} value={acc.customer_id}>
                      {acc.customer_name} ({acc.account_number}) - Saldo: Rp {acc.current_balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Pilih Booking Tagihan Tujuan</label>
                <select
                  aria-label="Pilih Booking Tagihan Tujuan"
                  value={targetBookingId}
                  onChange={(e) => setTargetBookingId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                >
                  {bookings.map((b) => (
                    <option key={b.booking_id} value={b.booking_id}>
                      {b.booking_number} ({b.customer_name}) - Sisa: Rp {b.outstanding_balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Jumlah Nominal yang Dikonversi (IDR)</label>
                <input
                  type="number"
                  value={convertAmount}
                  onChange={(e) => setConvertAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Eksekusi Konversi Pelunasan (Checkout)
              </button>
            </form>
          </div>

          {/* Sisi Kanan: Riwayat Mutasi Tabungan Escrow (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm">
                Riwayat Mutasi Tabungan Escrow (saving_mutations)
              </h4>
              <span className="text-xs text-slate-400">Virtual Account BSI Sync</span>
            </div>

            <div className="space-y-3">
              {savingMutations.map((m) => (
                <div
                  key={m.mutation_id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                          m.mutation_type === 'DEPOSIT'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}
                      >
                        {m.mutation_type}
                      </span>
                      <span className="font-mono text-slate-400">{m.reference_number}</span>
                    </div>
                    <p className="text-slate-300 mt-1">{m.notes}</p>
                    <span className="text-[10px] text-slate-500">{m.created_at}</span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono font-bold text-sm block ${
                        m.mutation_type === 'DEPOSIT' ? 'text-emerald-400' : 'text-purple-400'
                      }`}
                    >
                      {m.mutation_type === 'DEPOSIT' ? '+' : '-'}Rp {m.amount.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Saldo Akhir: Rp {m.balance_after.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Refund & Booking Cancellation */}
      {subTab === 'REFUND' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-400" />
                Modul Pembatalan &amp; Pengembalian Dana (booking_cancellations)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Kalkulasi penalti tiket/hotel hangus &amp; auto-jurnal kas keluar saat berstatus RELEASED
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2.5">No. Pembatalan</th>
                  <th className="px-3 py-2.5">Nama Jamaah &amp; Alasan</th>
                  <th className="px-3 py-2.5 text-right">Dana Masuk Awal</th>
                  <th className="px-3 py-2.5 text-right text-rose-400">Penalti Fee</th>
                  <th className="px-3 py-2.5 text-right text-emerald-400">Dana Bersih Refund</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                  <th className="px-3 py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-mono">
                {cancellations.map((c) => (
                  <tr key={c.cancellation_id} className="hover:bg-slate-800/40">
                    <td className="px-3 py-2.5 text-cyan-400 font-bold">{c.cancellation_number}</td>
                    <td className="px-3 py-2.5 font-sans">
                      <div className="font-semibold text-white">{c.customer_name}</div>
                      <div className="text-[11px] text-slate-400">{c.reason}</div>
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-300">
                      Rp {c.total_paid_initial.toLocaleString('id-ID')}
                    </td>
                    <td className="px-3 py-2.5 text-right text-rose-400 font-bold">
                      -Rp {c.penalty_fee.toLocaleString('id-ID')}
                    </td>
                    <td className="px-3 py-2.5 text-right text-emerald-400 font-bold">
                      Rp {c.refund_amount.toLocaleString('id-ID')}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                          c.refund_status === 'RELEASED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {c.refund_status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {c.refund_status !== 'RELEASED' && (
                        <button
                          onClick={() => onApproveRefund(c.cancellation_id)}
                          className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow"
                        >
                          Rilis Refund (RELEASED)
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
