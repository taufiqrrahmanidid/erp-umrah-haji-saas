import React, { useState } from 'react';
import {
  CreditCard,
  Send,
  CheckCircle2,
  AlertTriangle,
  Code,
  Layers,
  Building,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  QrCode,
  FileText,
  Clock,
  Key,
} from 'lucide-react';
import {
  Booking,
  PaymentGatewayWebhook,
  JournalMaster,
} from '../../../types/erp.ts';

interface PaymentGatewayWebhookTabProps {
  bookings: Booking[];
  webhooks: PaymentGatewayWebhook[];
  onTriggerWebhook: (payload: {
    booking_id: string;
    booking_number: string;
    amount: number;
    payment_channel: string;
    gateway_provider: 'MIDTRANS' | 'XENDIT';
  }) => void;
}

export const PaymentGatewayWebhookTab: React.FC<PaymentGatewayWebhookTabProps> = ({
  bookings,
  webhooks,
  onTriggerWebhook,
}) => {
  const [selectedBookingNumber, setSelectedBookingNumber] = useState<string>(
    bookings[0]?.booking_number || 'BKG/C01/2026/10/0001'
  );
  const [gatewayProvider, setGatewayProvider] = useState<'MIDTRANS' | 'XENDIT'>('MIDTRANS');
  const [paymentChannel, setPaymentChannel] = useState<string>('BSI_VA');
  const [customAmount, setCustomAmount] = useState<number>(15000000);
  const [selectedWebhookPayload, setSelectedWebhookPayload] = useState<PaymentGatewayWebhook | null>(null);
  const [simulatedSuccessAlert, setSimulatedSuccessAlert] = useState<string | null>(null);

  const targetBooking = bookings.find((b) => b.booking_number === selectedBookingNumber) || bookings[0];

  const handleSimulatePayment = () => {
    if (!targetBooking) return;
    const amountToPay = customAmount > 0 ? customAmount : targetBooking.outstanding_balance;
    
    onTriggerWebhook({
      booking_id: targetBooking.booking_id,
      booking_number: targetBooking.booking_number,
      amount: amountToPay,
      payment_channel: paymentChannel,
      gateway_provider: gatewayProvider,
    });

    setSimulatedSuccessAlert(
      `Webhook callback ${gatewayProvider} (${paymentChannel}) berhasil diproses! Jurnal 3-Level kas masuk otomatis terbit dan status booking ${targetBooking.booking_number} diperbarui.`
    );

    setTimeout(() => {
      setSimulatedSuccessAlert(null);
    }, 6000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Payment Gateway Webhook Engine (Midtrans / Xendit Callback)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
              Integrasi backend otomatis untuk notifikasi pembayaran jamaah via Virtual Account &amp; QRIS.{' '}
              Mengeksekusi Stored Procedure <code>sp_handle_payment_gateway_webhook</code>: Validasi SHA-512 signature, update saldo booking, dan <strong>auto-generate Jurnal 3-Level (Maker DRAFT)</strong> akun <code>[1010] Kas/Bank Clearing</code> vs <code>[2160] Titipan Dana Paket</code>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Webhook Listener Active
          </span>
        </div>
      </div>

      {simulatedSuccessAlert && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium">{simulatedSuccessAlert}</span>
        </div>
      )}

      {/* Grid: Simulator & Flow Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Simulator */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Simulator Notifikasi Webhook
            </h4>
            <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded text-slate-400">
              POST /api/webhooks/payment
            </span>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pilih Invoice / Booking Jamaah:
              </label>
              <select
                value={selectedBookingNumber}
                onChange={(e) => setSelectedBookingNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
              >
                {bookings.map((b) => (
                  <option key={b.booking_id} value={b.booking_number}>
                    {b.booking_number} - {b.customer_name} (Sisa: Rp {b.outstanding_balance.toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
            </div>

            {targetBooking && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Nama Jamaah:</span>
                  <span className="text-white font-bold">{targetBooking.customer_name}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Cabang Pemilik:</span>
                  <span className="text-cyan-400 font-mono font-bold">{targetBooking.branch_id}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Tagihan:</span>
                  <span className="text-white font-mono">Rp {targetBooking.net_payable.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Sisa Piutang:</span>
                  <span className="text-amber-400 font-mono font-bold">Rp {targetBooking.outstanding_balance.toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Provider Gateway:
                </label>
                <select
                  value={gatewayProvider}
                  onChange={(e) => setGatewayProvider(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                >
                  <option value="MIDTRANS">Midtrans SNAP</option>
                  <option value="XENDIT">Xendit Invoice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kanal Pembayaran:
                </label>
                <select
                  value={paymentChannel}
                  onChange={(e) => setPaymentChannel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                >
                  <option value="BSI_VA">BSI Virtual Account</option>
                  <option value="MANDIRI_VA">Mandiri Virtual Account</option>
                  <option value="QRIS">QRIS Dinamis (Gopay/Shopee)</option>
                  <option value="CREDIT_CARD">Credit Card Visa/MC</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Nominal Pembayaran (Settlement):
                </label>
                {targetBooking && (
                  <button
                    onClick={() => setCustomAmount(targetBooking.outstanding_balance)}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    Set Sisa Tagihan Penuh
                  </button>
                )}
              </div>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-emerald-400 font-mono font-bold"
                placeholder="Masukkan nominal bayar..."
              />
            </div>

            {/* Simulated Signature Key Preview */}
            <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
                <Key className="w-3 h-3 text-amber-400" />
                Simulated SHA-512 Signature Hash:
              </span>
              <p className="font-mono text-[10px] text-slate-400 break-all bg-slate-900 p-1.5 rounded">
                SHA512({targetBooking?.booking_number || 'BKG-01'} + '200' + {customAmount} + 'server_key_live_x882')
              </p>
            </div>

            <button
              onClick={handleSimulatePayment}
              disabled={!targetBooking || customAmount <= 0}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Simulasikan Webhook Settlement</span>
            </button>
          </div>
        </div>

        {/* Right: Flow Architecture & Auto Journal Specification */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Arsitektur Otomasi 3-Level Journal dari Webhook
            </h4>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 font-bold">
              maker: SYSTEM_GATEWAY_WEBHOOK
            </span>
          </div>

          {/* Stepper Pipeline */}
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div className="space-y-0.5">
                <strong className="text-white">Penerimaan Payload &amp; Validasi Enkripsi</strong>
                <p className="text-slate-400 text-[11px]">
                  HTTP POST callback diterima dari Midtrans/Xendit. Backend memverifikasi signature key SHA-512 dengan server key rahasia untuk menangkal tampering/replay attack.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div className="space-y-0.5">
                <strong className="text-white">Penerbitan Auto-Journal 3-Level (Maker Draft)</strong>
                <p className="text-slate-400 text-[11px]">
                  Menerbitkan Master Journal berstatus <code>DRAFT_MAKER</code> pada cabang pemilik order:
                </p>
                <div className="p-2 bg-slate-900 rounded font-mono text-[11px] space-y-1 mt-1 border border-slate-800">
                  <div className="text-emerald-400 flex justify-between">
                    <span>(D) 1010 - Kas &amp; Bank Payment Gateway Clearing</span>
                    <span>Rp {customAmount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="text-amber-400 flex justify-between pl-4">
                    <span>(K) 2160 - Titipan Dana Paket Jamaah (Liabilitas)</span>
                    <span>Rp {customAmount.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div className="space-y-0.5">
                <strong className="text-white">Penyelarasan Saldo Booking &amp; Kepatuhan Siskopatuh</strong>
                <p className="text-slate-400 text-[11px]">
                  Menambah <code>total_paid</code> dan mengurangi <code>outstanding_balance</code>. Jika sisa nol, status beralih menjadi <code>FULLY_PAID</code> dan QR Siskopatuh siap diterbitkan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Webhook Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs">
          <div>
            <h4 className="font-bold text-white text-sm">
              Riwayat Webhook Logs &amp; Audit Trail Callback
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Tabel <code>payment_gateway_webhooks</code> merekam seluruh payload raw JSON untuk audit trail rekonsiliasi kas clearing.
            </p>
          </div>
          <span className="font-mono text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            Total Logs: {webhooks.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Order ID (Booking)</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4 text-right">Nominal (Gross)</th>
                <th className="py-3 px-4 text-center">Status Transaksi</th>
                <th className="py-3 px-4">Ref. Jurnal</th>
                <th className="py-3 px-4 text-center">Payload JSON</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {webhooks.map((wh) => (
                <tr key={wh.webhook_id} className="hover:bg-slate-850/40">
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {new Date(wh.created_at).toLocaleString('id-ID', {
                      dateStyle: 'short',
                      timeStyle: 'medium',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold text-[10px]">
                      {wh.gateway_provider}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-cyan-400 font-sans">
                    {wh.order_id}
                  </td>
                  <td className="py-3 px-4 font-sans text-white text-[11px]">
                    {wh.payment_channel}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                    Rp {wh.gross_amount.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20 uppercase">
                      {wh.transaction_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-amber-300 font-mono text-[11px]">
                    {wh.journal_reference}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedWebhookPayload(wh)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-[11px] transition inline-flex items-center gap-1"
                    >
                      <Code className="w-3 h-3" />
                      <span>Raw JSON</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Payload Modal */}
      {selectedWebhookPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                Raw Webhook Payload JSON ({selectedWebhookPayload.gateway_provider} - {selectedWebhookPayload.order_id})
              </h4>
              <button
                onClick={() => setSelectedWebhookPayload(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded"
              >
                ✕ Tutup
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[350px]">
              {JSON.stringify(selectedWebhookPayload.raw_payload, null, 2)}
            </pre>

            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Signature Key: Verified ✓ SHA-512 Match</span>
              <button
                onClick={() => setSelectedWebhookPayload(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
