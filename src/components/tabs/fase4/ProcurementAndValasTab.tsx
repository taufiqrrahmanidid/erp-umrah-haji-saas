import React, { useState } from 'react';
import {
  ShoppingCart,
  Send,
  Building,
  CheckCircle2,
  AlertTriangle,
  Coins,
  BadgeDollarSign,
  TrendingDown,
  TrendingUp,
  FileCheck2,
  FileText,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  PurchaseRequest,
  Tender,
  PurchaseOrder,
  VendorPayment,
  RoleCode,
} from '../../../types/erp.ts';

interface ProcurementAndValasTabProps {
  requests: PurchaseRequest[];
  tenders: Tender[];
  orders: PurchaseOrder[];
  payments: VendorPayment[];
  onAddRequest: (ro: PurchaseRequest) => void;
  onAddOrder: (po: PurchaseOrder) => void;
  onAddPayment: (payment: VendorPayment) => void;
  currentBranchCode: string;
  currentRole: RoleCode;
}

export const ProcurementAndValasTab: React.FC<ProcurementAndValasTabProps> = ({
  requests,
  tenders,
  orders,
  payments,
  onAddRequest,
  onAddOrder,
  onAddPayment,
  currentBranchCode,
  currentRole,
}) => {
  const [subTab, setSubTab] = useState<'RO_TENDER' | 'PO_LIST' | 'VALAS_PAYMENT'>('RO_TENDER');

  // Form New RO
  const [roTitle, setRoTitle] = useState('Pengadaan Koper Fiber Tambahan Kloter 2');
  const [roDept, setRoDept] = useState<'LOGISTIK' | 'TIKETING' | 'OPERASIONAL_SAUDI'>('LOGISTIK');
  const [roAmount, setRoAmount] = useState<number>(12500000);
  const [roAttachment, setRoAttachment] = useState('https://storage.googleapis.com/spec-koper-2026.pdf');
  const [notification, setNotification] = useState<string | null>(null);

  // Form New PO Direct vs Tender
  const [poType, setPoType] = useState<'DIRECT' | 'TENDER' | 'CONTRACT'>('DIRECT');
  const [poVendorName, setPoVendorName] = useState('Toko Perlengkapan Barokah');
  const [poAmountIdr, setPoAmountIdr] = useState<number>(850000); // Default di bawah 1jt
  const [poCurrency, setPoCurrency] = useState<'IDR' | 'SAR' | 'USD'>('IDR');
  const [poPphRate, setPoPphRate] = useState<number>(2.0);

  // Form Valas FX Settlement Simulation
  const [selectedPoValasId, setSelectedPoValasId] = useState<string>(
    orders.find((o) => o.currency !== 'IDR')?.po_id || orders[0]?.po_id || ''
  );
  const [todayExchangeRate, setTodayExchangeRate] = useState<number>(4235.0); // Kurs hari bayar
  const [settleAmountValas, setSettleAmountValas] = useState<number>(12000); // SAR 12,000

  const isKsoBranch = currentBranchCode === 'C01';
  const directPoLimit = 1000000; // 1 Juta dari app_settings

  const handleCreateRO = (e: React.FormEvent) => {
    e.preventDefault();

    const isEscalateToHq = !isKsoBranch && currentBranchCode !== 'PST';

    const newRo: PurchaseRequest = {
      ro_id: `ro-${Date.now()}`,
      tenant_id: '11111111-1111-1111-1111-111111111111',
      branch_id: currentBranchCode,
      ro_number: `RO/${currentBranchCode}/${new Date().getFullYear()}/00${requests.length + 1}`,
      department: roDept,
      requester_name: `Staff Logistik ${currentBranchCode}`,
      title: roTitle,
      total_estimated_amount: roAmount,
      attachment_url: roAttachment,
      escalated_to_hq: isEscalateToHq,
      workflow_stage: isEscalateToHq ? 'PENDING_HQ' : 'DRAFT_MAKER',
      notes: isEscalateToHq
        ? 'Cabang Mandiri: Wajib eskalasi ke HQ untuk persetujuan anggaran pusat.'
        : isKsoBranch
        ? 'Cabang KSO: Pengadaan independen, disetujui Kepala Cabang KSO.'
        : 'Pusat: Approval internal HQ.',
      created_at: new Date().toISOString(),
    };

    onAddRequest(newRo);
    setNotification(
      `Purchase Request (RO) berhasil dibuat! ${
        isEscalateToHq
          ? 'Status: PENDING_HQ (Otomatis dieskalasi ke Kantor Pusat)'
          : isKsoBranch
          ? 'Status: Mandiri KSO (Disetujui Kepala KSO)'
          : 'Status: Kantor Pusat HQ'
      }`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();

    // Check direct PO limit constraint
    if (poType === 'DIRECT' && poAmountIdr > directPoLimit) {
      alert(
        `Gagal membuat PO! PO bertipe DIRECT dibatasi maksimal Rp ${directPoLimit.toLocaleString(
          'id-ID'
        )} sesuai konfigurasi app_settings. Untuk nilai Rp ${poAmountIdr.toLocaleString(
          'id-ID'
        )}, silakan gunakan metode TENDER atau CONTRACT!`
      );
      return;
    }

    const pphAmount = (poAmountIdr * poPphRate) / 100;
    const isB2B = isKsoBranch;

    const newPo: PurchaseOrder = {
      po_id: `po-${Date.now()}`,
      tenant_id: '11111111-1111-1111-1111-111111111111',
      branch_id: currentBranchCode,
      po_number: `PO/${currentBranchCode}/${new Date().getFullYear()}/00${orders.length + 1}`,
      vendor_id: `vnd-${Date.now()}`,
      vendor_name: isB2B ? 'Kantor Pusat HQ (Sales Order B2B KSO)' : poVendorName,
      po_type: poType,
      currency: poCurrency,
      exchange_rate_at_po: poCurrency === 'SAR' ? 4180 : poCurrency === 'USD' ? 16200 : 1.0,
      subtotal_valas: poCurrency === 'IDR' ? poAmountIdr : poAmountIdr / 4180,
      subtotal_idr: poAmountIdr,
      pph_23_rate: poPphRate,
      pph_23_amount_idr: pphAmount,
      grand_total_idr: poAmountIdr - pphAmount,
      is_kso_b2b_sales_order: isB2B,
      workflow_stage: 'APPROVED',
      maker_name: `Procurement Officer (${currentBranchCode})`,
      approver_name: isKsoBranch ? 'Kepala Cabang KSO Kediri' : 'Direktur Operasional HQ',
      approved_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    onAddOrder(newPo);
    setNotification(
      `Purchase Order [${newPo.po_number}] berhasil diterbitkan! ${
        isB2B ? 'Otomatis dicatat sebagai Sales Order B2B di sisi Pusat HQ.' : ''
      }`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  const handleExecuteValasPayment = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedPo = orders.find((o) => o.po_id === selectedPoValasId) || orders[1];
    const rateAtPo = selectedPo?.exchange_rate_at_po || 4180.0;
    const amountIdrAtPo = settleAmountValas * rateAtPo;
    const amountIdrAtPayment = settleAmountValas * todayExchangeRate;
    const fxDiff = amountIdrAtPayment - amountIdrAtPo; // Positif = Rugi Selisih Kurs, Negatif = Untung

    const newPayment: VendorPayment = {
      payment_id: `vp-${Date.now()}`,
      tenant_id: '11111111-1111-1111-1111-111111111111',
      po_id: selectedPo.po_id,
      po_number: selectedPo.po_number,
      payment_number: `VPAY/${new Date().getFullYear()}/00${payments.length + 1}`,
      payment_date: new Date().toISOString().split('T')[0],
      currency: 'SAR',
      amount_valas: settleAmountValas,
      rate_at_po: rateAtPo,
      rate_at_payment: todayExchangeRate,
      amount_idr_at_po: amountIdrAtPo,
      amount_idr_at_payment: amountIdrAtPayment,
      realized_fx_difference: fxDiff,
      pph_23_withheld_idr: 0,
      journal_reference: `JRN/FX-${fxDiff >= 0 ? 'LOSS' : 'GAIN'}/${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    onAddPayment(newPayment);
    setNotification(
      `Pembayaran Valas SAR ${settleAmountValas.toLocaleString()} Berhasil! Selisih Kurs Terealisasi: Rp ${Math.abs(
        fxDiff
      ).toLocaleString('id-ID')} (${
        fxDiff >= 0 ? 'RUGI Selisih Kurs / Beban' : 'UNTUNG Selisih Kurs / Pendapatan'
      }). Jurnal DRAFT_MAKER telah digenerate!`
    );
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Enterprise Procurement &amp; Pembayaran Valas (Mandiri vs KSO)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
              <strong>Aturan Hierarki:</strong> RO Cabang Mandiri di-eskalasi ke HQ. Cabang KSO melakukan pengadaan mandiri
              (PO disetujui Kepala KSO). Pembelian KSO ke HQ dicatat sebagai <em>Sales Order B2B</em> di sisi HQ.{' '}
              <strong>Pembayaran Valas:</strong> Otomatis menghitung <em>Realized FX Loss/Gain</em> antara kurs PO vs kurs hari H.
            </p>
          </div>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setSubTab('RO_TENDER')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              subTab === 'RO_TENDER' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            RO &amp; Tender Blast
          </button>
          <button
            onClick={() => setSubTab('PO_LIST')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              subTab === 'PO_LIST' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            PO (Direct Limit vs Tender)
          </button>
          <button
            onClick={() => setSubTab('VALAS_PAYMENT')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              subTab === 'VALAS_PAYMENT' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Valas Realized FX Loss/Gain
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 shadow">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* SUB-TAB 1: RO & TENDER BLAST */}
      {subTab === 'RO_TENDER' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Buat RO */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Form Purchase Request (RO)
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                Cabang: {currentBranchCode}
              </span>
            </div>

            <form onSubmit={handleCreateRO} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Departemen Pemohon</label>
                <select
                  value={roDept}
                  onChange={(e) => setRoDept(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value="LOGISTIK">Logistik &amp; Perlengkapan Koper</option>
                  <option value="TIKETING">Tiketing &amp; Visa Airlines</option>
                  <option value="OPERASIONAL_SAUDI">Operasional Saudi &amp; Bus</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Judul Pengadaan</label>
                <input
                  type="text"
                  value={roTitle}
                  onChange={(e) => setRoTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Estimasi Anggaran (Rp)</label>
                <input
                  type="number"
                  value={roAmount}
                  onChange={(e) => setRoAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">URL Attachment Dokumen Spek</label>
                <input
                  type="url"
                  value={roAttachment}
                  onChange={(e) => setRoAttachment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300 font-mono text-[11px]"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">Logika Eskalasi Cabang:</p>
                <p>
                  • Cabang Mandiri: <em>Wajib eskalasi ke HQ</em> (Status: PENDING_HQ).
                </p>
                <p>
                  • Cabang KSO ({currentBranchCode === 'C01' ? 'Aktif' : 'Non-aktif'}):{' '}
                  <em>Approval mandiri</em> Kepala KSO dan menjadi Utang KSO internal.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Submit RO &amp; Cek Eskalasi
              </button>
            </form>
          </div>

          {/* Daftar RO & Tender Blast */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-cyan-400" />
                Daftar Purchase Requests &amp; Status Eskalasi
              </h4>

              <div className="space-y-3">
                {requests.map((ro) => (
                  <div
                    key={ro.ro_id}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-400">{ro.ro_number}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold">
                          {ro.department}
                        </span>
                        {ro.escalated_to_hq && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 font-bold">
                            Eskalasi ke HQ
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-slate-200">{ro.title}</p>
                      <p className="text-slate-400 text-[11px]">{ro.notes}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-mono font-bold text-slate-200">
                        Rp {ro.total_estimated_amount.toLocaleString('id-ID')}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ro.workflow_stage === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : ro.workflow_stage === 'PENDING_HQ'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {ro.workflow_stage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tender Blast Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                  <BadgeDollarSign className="w-4 h-4 text-emerald-400" />
                  Sistem Tender Blast ke Multi-Vendor
                </h4>
                <span className="text-xs text-emerald-400 font-medium">Status: AWARDED</span>
              </div>

              {tenders.map((tnd) => (
                <div key={tnd.tender_id} className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-white text-xs">{tnd.title}</p>
                      <p className="text-[11px] text-slate-400">
                        Kode: <span className="font-mono text-cyan-300">{tnd.tender_code}</span> • Target: {tnd.quantity} Set • Max Budget: Rp {tnd.max_budget.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                      Pemenang: {tnd.winning_vendor_name}
                    </span>
                  </div>

                  <div className="border-t border-slate-850 pt-2">
                    <p className="text-[11px] text-slate-400 font-semibold mb-2">Penawaran Masuk (Tender Bids):</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {tnd.bids.map((b) => (
                        <div
                          key={b.bid_id}
                          className={`p-2.5 rounded-lg border text-[11px] ${
                            b.bid_status === 'WON'
                              ? 'bg-emerald-950/20 border-emerald-600/40 text-emerald-200'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex justify-between font-semibold">
                            <span>{b.vendor_name}</span>
                            <span className="font-mono">Rp {b.bid_price_per_unit.toLocaleString('id-ID')} / pcs</span>
                          </div>
                          <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                            <span>Score: {b.evaluation_score}/100</span>
                            <span className="font-bold uppercase text-slate-300">{b.bid_status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PO DIRECT LIMIT VS TENDER */}
      {subTab === 'PO_LIST' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Buat PO dengan Validasi Limit */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              Penerbitan PO &amp; Limit Guard
            </h4>

            <form onSubmit={handleCreatePO} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Tipe Purchase Order (PO)</label>
                <select
                  value={poType}
                  onChange={(e) => setPoType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-semibold"
                >
                  <option value="DIRECT">DIRECT (Batas Limit Default Rp 1.000.000)</option>
                  <option value="TENDER">TENDER (Pengadaan Besar Multi-Vendor)</option>
                  <option value="CONTRACT">CONTRACT (Vendor Hotel &amp; Maskapai Saudi)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Nama Vendor</label>
                <input
                  type="text"
                  value={isKsoBranch ? 'Kantor Pusat HQ (Otomatis B2B KSO)' : poVendorName}
                  disabled={isKsoBranch}
                  onChange={(e) => setPoVendorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Mata Uang</label>
                  <select
                    value={poCurrency}
                    onChange={(e) => setPoCurrency(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                  >
                    <option value="IDR">IDR (Rupiah)</option>
                    <option value="SAR">SAR (Riyal)</option>
                    <option value="USD">USD (Dollar)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">PPh 23 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={poPphRate}
                    onChange={(e) => setPoPphRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Total Nilai PO (IDR)</label>
                <input
                  type="number"
                  value={poAmountIdr}
                  onChange={(e) => setPoAmountIdr(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono font-bold"
                  required
                />
              </div>

              {/* Alert jika melampaui limit */}
              {poType === 'DIRECT' && poAmountIdr > directPoLimit && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-[11px] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Peringatan Trigger Database:</strong> PO DIRECT melampaui batas toleransi default (Rp 1.000.000). Transaksi akan di-reject jika tidak diubah ke TENDER atau CONTRACT!
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Terbitkan Purchase Order
              </button>
            </form>
          </div>

          {/* Daftar PO */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Daftar Purchase Orders (PO) Aktif
            </h4>

            <div className="space-y-3">
              {orders.map((po) => (
                <div
                  key={po.po_id}
                  className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-400">{po.po_number}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold">
                        Tipe: {po.po_type}
                      </span>
                      {po.is_kso_b2b_sales_order && (
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-300 font-bold">
                          KSO B2B Sales Order
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-slate-200">{po.vendor_name}</p>
                    <p className="text-slate-400 text-[11px]">
                      Cabang: {po.branch_id} • Disetujui oleh: {po.approver_name || '-'}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-white">
                      {po.currency !== 'IDR' && (
                        <span className="text-cyan-400 mr-1.5 font-normal">
                          {po.currency} {po.subtotal_valas.toLocaleString()} •
                        </span>
                      )}
                      Rp {po.grand_total_idr.toLocaleString('id-ID')}
                    </p>
                    {po.pph_23_amount_idr > 0 && (
                      <p className="text-[10px] text-slate-400">
                        PPh 23 Dipotong: Rp {po.pph_23_amount_idr.toLocaleString('id-ID')}
                      </p>
                    )}
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {po.workflow_stage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: VALAS FX LOSS / GAIN AUTO-JOURNAL */}
      {subTab === 'VALAS_PAYMENT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Pembayaran Valas */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
              <Coins className="w-4 h-4 text-cyan-400" />
              Eksekusi Pembayaran Valas (SAR/USD)
            </h4>

            <form onSubmit={handleExecuteValasPayment} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Pilih PO Valas Vendor</label>
                <select
                  value={selectedPoValasId}
                  onChange={(e) => setSelectedPoValasId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  {orders
                    .filter((o) => o.currency !== 'IDR')
                    .map((o) => (
                      <option key={o.po_id} value={o.po_id}>
                        {o.po_number} - {o.vendor_name} ({o.currency} {o.subtotal_valas.toLocaleString()})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Nominal Valas Dibayar (SAR)</label>
                <input
                  type="number"
                  value={settleAmountValas}
                  onChange={(e) => setSettleAmountValas(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">
                  Kurs Hari Pembayaran (IDR / SAR)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={todayExchangeRate}
                  onChange={(e) => setTodayExchangeRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono font-bold text-cyan-300"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Kurs saat PO: <strong>Rp 4.180,00</strong> / SAR
                </span>
              </div>

              {/* Live FX Calculation Preview */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <p className="font-semibold text-slate-300">Kalkulasi Selisih Kurs Terealisasi:</p>
                <div className="flex justify-between text-slate-400">
                  <span>Nilai saat PO (4.180):</span>
                  <span className="font-mono">Rp {(settleAmountValas * 4180).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Nilai saat Bayar ({todayExchangeRate}):</span>
                  <span className="font-mono">
                    Rp {(settleAmountValas * todayExchangeRate).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between font-bold">
                  <span>Selisih Kurs:</span>
                  <span
                    className={`font-mono flex items-center gap-1 ${
                      todayExchangeRate >= 4180 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {todayExchangeRate >= 4180 ? (
                      <>
                        <TrendingDown className="w-3.5 h-3.5" />
                        Rugi FX Rp {Math.abs((settleAmountValas * (todayExchangeRate - 4180))).toLocaleString('id-ID')}
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-3.5 h-3.5" />
                        Untung FX Rp {Math.abs((settleAmountValas * (4180 - todayExchangeRate))).toLocaleString('id-ID')}
                      </>
                    )}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition flex items-center justify-center gap-1.5"
              >
                <Coins className="w-3.5 h-3.5" />
                Posting Bayar &amp; Auto-Jurnal FX
              </button>
            </form>
          </div>

          {/* Riwayat Pembayaran Valas & Jurnal Realized Gain/Loss */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <BadgeDollarSign className="w-4 h-4 text-emerald-400" />
              Riwayat Pembayaran Valas &amp; Jurnal Realized FX Loss/Gain
            </h4>

            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.payment_id} className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-mono font-bold text-cyan-400">{p.payment_number}</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Ref PO: <span className="font-mono text-slate-300">{p.po_number}</span> • Tanggal: {p.payment_date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-white text-sm">
                        {p.currency} {p.amount_valas.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Kurs PO: {p.rate_at_po} ➔ Bayar: {p.rate_at_payment}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-300">
                        Jurnal Realized FX: <span className="font-mono text-emerald-400">{p.journal_reference}</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {p.realized_fx_difference >= 0
                          ? 'Debit: [6200] Beban Selisih Kurs Terealisasi'
                          : 'Kredit: [4300] Pendapatan Selisih Kurs Terealisasi'}
                      </p>
                    </div>
                    <span
                      className={`font-mono font-bold px-2.5 py-1 rounded-full text-xs ${
                        p.realized_fx_difference >= 0
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      }`}
                    >
                      {p.realized_fx_difference >= 0 ? '+' : '-'} Rp{' '}
                      {Math.abs(p.realized_fx_difference).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
