import React, { useState } from 'react';
import {
  Boxes,
  Truck,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Barcode,
  ExternalLink,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  Plant,
  PlantInventory,
  GoodsIssue,
  EquipmentHandover,
  FixedAsset,
  AssetDisposal,
  RoleCode,
} from '../../../types/erp.ts';

interface WarehouseAndAssetsTabProps {
  plants: Plant[];
  inventories: PlantInventory[];
  issues: GoodsIssue[];
  handovers: EquipmentHandover[];
  assets: FixedAsset[];
  disposals: AssetDisposal[];
  onAddIssue: (gi: GoodsIssue) => void;
  onAddHandover: (handover: EquipmentHandover) => void;
  onDisposeAsset: (disposal: AssetDisposal) => void;
  currentBranchCode: string;
  currentRole: RoleCode;
}

export const WarehouseAndAssetsTab: React.FC<WarehouseAndAssetsTabProps> = ({
  plants,
  inventories,
  issues,
  handovers,
  assets,
  disposals,
  onAddIssue,
  onAddHandover,
  onDisposeAsset,
  currentBranchCode,
  currentRole,
}) => {
  const [subTab, setSubTab] = useState<'PLANT_STOCK' | 'INTER_PLANT' | 'HANDOVER' | 'FIXED_ASSETS'>('PLANT_STOCK');

  // Perspective filter for RLS Isolation testing
  const [selectedPlantPerspective, setSelectedPlantPerspective] = useState<string>(
    currentBranchCode === 'C01'
      ? 'PLANT-KSO-KEDIRI'
      : currentBranchCode === 'SUB'
      ? 'PLANT-SUB-JUANDA'
      : 'PLANT-HQ-JKT'
  );

  // Form Pengeluaran Barang / Inter-Plant Transfer
  const [issueCategory, setIssueCategory] = useState<'ASSET' | 'FOR_SALE' | 'SALES_SUPPORT' | 'OPERATIONAL'>('SALES_SUPPORT');
  const [targetBranchId, setTargetBranchId] = useState<'SUB' | 'C01'>('SUB');
  const [issueQty, setIssueQty] = useState<number>(20);
  const [notification, setNotification] = useState<string | null>(null);

  // Form Tanda Terima Perlengkapan
  const [handoverCustName, setHandoverCustName] = useState('Hj. Siti Aminah');
  const [handoverItem, setHandoverItem] = useState('Koper Bagasi 24 Inch & Tas Paspor');
  const [deliveryMethod, setDeliveryMethod] = useState<'PICKUP_BRANCH' | 'EXPEDITION_COURIER'>('EXPEDITION_COURIER');
  const [courierName, setCourierName] = useState('JNE Express');
  const [trackingNo, setTrackingNo] = useState('JNE9918274819');

  // Form Disposal Aset
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.asset_id || '');
  const [disposalPrice, setDisposalPrice] = useState<number>(3500000);
  const [disposalReason, setDisposalReason] = useState('Unit aus / peremajaan hardware');

  // RLS Isolation Logic:
  // Central HQ only sees HQ inventory
  // Surabaya only sees Surabaya inventory
  // Kediri KSO only sees KSO inventory
  const filteredInventory = inventories.filter((inv) => {
    if (selectedPlantPerspective === 'ALL_ADMIN') return true;
    return inv.plant_code === selectedPlantPerspective;
  });

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();

    const isTransferToKso = targetBranchId === 'C01';
    const isAsset = issueCategory === 'ASSET';

    const newGi: GoodsIssue = {
      gi_id: `gi-${Date.now()}`,
      plant_id: 'plt-pst-01',
      plant_code: 'PLANT-HQ-JKT',
      gi_number: `GI/HQ/${new Date().getFullYear()}/00${issues.length + 1}`,
      issue_date: new Date().toISOString().split('T')[0],
      issue_category: issueCategory,
      workflow_stage: 'RELEASED',
      destination_branch_id: targetBranchId,
      total_issue_cost: issueQty * 230000,
      maker_name: 'Warehouse Officer HQ',
      approver_name: 'Kepala Logistik',
      releaser_name: 'Finance Controller',
      journal_reference: isAsset
        ? `JRN/FIXED-ASSET/AUTO/${Date.now()}`
        : isTransferToKso
        ? `JRN/B2B-SALES-KSO/${Date.now()}`
        : `JRN/RAK-MUTASI-SUB/${Date.now()}`,
      items: [
        {
          material_code: isAsset ? 'SCANNER-BIOMETRIK' : 'KPR-FIBER-24',
          material_name: isAsset ? 'Mesin Scanner Tasheel Baru' : 'Koper Fiber Exclusive 24 Inch',
          qty_issued: issueQty,
          unit_cost: 230000,
          subtotal_cost: issueQty * 230000,
        },
      ],
    };

    onAddIssue(newGi);

    let msg = `Goods Issue [${newGi.gi_number}] status RELEASED! `;
    if (isAsset) {
      msg += 'Trigger Otomatis: Dibuat data master Fixed Asset baru!';
    } else if (isTransferToKso) {
      msg += 'Pengiriman ke KSO: Dicatat sebagai Penjualan B2B (Revenue HQ & Piutang Mitra KSO).';
    } else {
      msg += 'Pengiriman ke Mandiri: Dicatat sebagai Mutasi Gudang / Goods in Transit (Jurnal RAK).';
    }

    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCreateHandover = (e: React.FormEvent) => {
    e.preventDefault();

    const newH: EquipmentHandover = {
      handover_id: `eh-${Date.now()}`,
      booking_id: 'bkg-01',
      booking_number: 'BKG/C01/2026/10/0001',
      customer_id: 'cust-01',
      customer_name: handoverCustName,
      item_name: handoverItem,
      handover_status: deliveryMethod === 'EXPEDITION_COURIER' ? 'DELIVERING' : 'HANDED_OVER',
      delivery_method: deliveryMethod,
      courier_name: deliveryMethod === 'EXPEDITION_COURIER' ? courierName : undefined,
      tracking_number: deliveryMethod === 'EXPEDITION_COURIER' ? trackingNo : undefined,
      received_date: deliveryMethod === 'PICKUP_BRANCH' ? new Date().toISOString().split('T')[0] : undefined,
      received_by_name: deliveryMethod === 'PICKUP_BRANCH' ? handoverCustName : undefined,
      notes: 'Tercatat di Portal Jamaah untuk pelacakan resi ekspedisi.',
    };

    onAddHandover(newH);
    setNotification(
      `Tanda Terima Perlengkapan tersimpan! Jamaah dapat melacak status resi ${trackingNo} langsung di Portal Jamaah.`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  const handleExecuteDisposal = (e: React.FormEvent) => {
    e.preventDefault();

    const targetAsset = assets.find((a) => a.asset_id === selectedAssetId) || assets[0];
    const bookValue = targetAsset.book_value;
    const gainLoss = disposalPrice - bookValue;

    const newDisp: AssetDisposal = {
      disposal_id: `dsp-${Date.now()}`,
      asset_id: targetAsset.asset_id,
      asset_name: targetAsset.asset_name,
      asset_code: targetAsset.asset_code,
      disposal_date: new Date().toISOString().split('T')[0],
      disposal_method: 'SOLD',
      sale_price: disposalPrice,
      book_value_at_disposal: bookValue,
      gain_loss_amount: gainLoss,
      disposal_reason: disposalReason,
      workflow_stage: 'RELEASED',
      journal_reference: `JRN/DISP-${gainLoss >= 0 ? 'GAIN' : 'LOSS'}/${Date.now()}`,
    };

    onDisposeAsset(newDisp);
    setNotification(
      `Disposal Aset [${targetAsset.asset_name}] Berhasil! Nilai Buku: Rp ${bookValue.toLocaleString(
        'id-ID'
      )} ➔ Harga Jual: Rp ${disposalPrice.toLocaleString('id-ID')} (${
        gainLoss >= 0 ? 'Untung' : 'Rugi'
      } Rp ${Math.abs(gainLoss).toLocaleString('id-ID')}). Jurnal DRAFT_MAKER telah digenerate!`
    );
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Multi-Plant Warehouse, Manajemen Stok &amp; Fixed Asset Management
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
              <strong>Otorisasi Cabang:</strong> Stok fisik koper dan logistik terisolasi otomatis menurut unit cabang operasional.{' '}
              <strong>Inter-Plant:</strong> HQ ➔ Mandiri dicatat sebagai <em>Mutasi RAK / Goods in Transit</em>, sedangkan HQ ➔ KSO dicatat sebagai <em>Penjualan B2B</em>.{' '}
              <strong>Asset Automation:</strong> Pengeluaran kategori ASSET otomatis membuat master <em>fixed_assets</em>.
            </p>
          </div>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setSubTab('PLANT_STOCK')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              subTab === 'PLANT_STOCK' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Stok Fisik Gudang
          </button>
          <button
            onClick={() => setSubTab('INTER_PLANT')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              subTab === 'INTER_PLANT' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Inter-Plant &amp; RAK vs B2B
          </button>
          <button
            onClick={() => setSubTab('HANDOVER')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              subTab === 'HANDOVER' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tanda Terima &amp; Resi Koper
          </button>
          <button
            onClick={() => setSubTab('FIXED_ASSETS')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              subTab === 'FIXED_ASSETS' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Fixed Assets &amp; Disposal
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 shadow">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* SUB-TAB 1: PLANT STOCK & RLS ISOLATION DEMO */}
      {subTab === 'PLANT_STOCK' && (
        <div className="space-y-4">
          {/* RLS Perspective Switcher */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-white text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Filter Wilayah Unit Gudang Cabang:
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Pilih perspektif unit gudang untuk memantau ketersediaan barang per lokasi cabang operasional.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={() => setSelectedPlantPerspective('PLANT-HQ-JKT')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  selectedPlantPerspective === 'PLANT-HQ-JKT'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                Gudang Pusat (HQ)
              </button>
              <button
                onClick={() => setSelectedPlantPerspective('PLANT-SUB-JUANDA')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  selectedPlantPerspective === 'PLANT-SUB-JUANDA'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                Gudang Surabaya (Mandiri)
              </button>
              <button
                onClick={() => setSelectedPlantPerspective('PLANT-MLG-KLOJEN')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  selectedPlantPerspective === 'PLANT-MLG-KLOJEN'
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                Gudang Malang (Mandiri)
              </button>
              <button
                onClick={() => setSelectedPlantPerspective('PLANT-KSO-KEDIRI')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  selectedPlantPerspective === 'PLANT-KSO-KEDIRI'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                Gudang Kediri (KSO)
              </button>
            </div>
          </div>

          {/* Table Inventory */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs">
              <span className="font-semibold text-white">
                Inventaris Terfilter ({filteredInventory.length} Baris Data Ditemukan)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Otorisasi Wewenang Cabang Aktif
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Kode Plant</th>
                    <th className="py-3 px-4">Pemilik Cabang</th>
                    <th className="py-3 px-4">Kode Material</th>
                    <th className="py-3 px-4">Nama Barang</th>
                    <th className="py-3 px-4">Qty on Hand</th>
                    <th className="py-3 px-4">HPP Rata-Rata</th>
                    <th className="py-3 px-4">Total Nilai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {filteredInventory.map((inv) => (
                    <tr key={inv.inventory_id} className="hover:bg-slate-850/40">
                      <td className="py-3 px-4 text-cyan-400 font-bold">{inv.plant_code}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                          {inv.owner_branch_id}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-emerald-400">{inv.material_code}</td>
                      <td className="py-3 px-4 font-sans text-white">{inv.material_name}</td>
                      <td className="py-3 px-4 text-amber-300 font-bold">
                        {inv.qty_on_hand} {inv.unit}
                      </td>
                      <td className="py-3 px-4">Rp {inv.avg_unit_cost.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4 text-white font-bold">
                        Rp {(inv.qty_on_hand * inv.avg_unit_cost).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: INTER-PLANT TRANSFER & RAK VS B2B */}
      {subTab === 'INTER_PLANT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Pengeluaran Stok */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
              <Truck className="w-4 h-4 text-indigo-400" />
              Goods Issue (GI) &amp; Transfer Cabang
            </h4>

            <form onSubmit={handleCreateIssue} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Kategori Pengeluaran (issue_category)</label>
                <select
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-semibold"
                >
                  <option value="SALES_SUPPORT">SALES_SUPPORT (Mutasi Perlengkapan Koper ke Cabang)</option>
                  <option value="ASSET">ASSET (Otomatis Masuk Master Fixed Assets)</option>
                  <option value="FOR_SALE">FOR_SALE (Dijual Langsung / Retail)</option>
                  <option value="OPERATIONAL">OPERATIONAL (Beban Operasional Kantor)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Tujuan Cabang Penerima</label>
                <select
                  value={targetBranchId}
                  onChange={(e) => setTargetBranchId(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value="SUB">Cabang Mandiri Surabaya (Jurnal RAK Mutasi Gudang)</option>
                  <option value="C01">Cabang Mitra KSO Kediri (Jurnal Penjualan B2B)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Jumlah Unit Dikeluarkan</label>
                <input
                  type="number"
                  value={issueQty}
                  onChange={(e) => setIssueQty(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono font-bold"
                  required
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">Simulasi Aturan Akuntansi:</p>
                <p>
                  • HQ ➔ Mandiri: <em>Debit RAK Cabang, Kredit Persediaan HQ</em> (Mutasi antar gudang dalam konsolidasi).
                </p>
                <p>
                  • HQ ➔ KSO: <em>Debit Piutang Mitra KSO, Kredit Penjualan B2B &amp; HPP</em> (Entitas terpisah).
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Release Goods Issue &amp; Auto-Jurnal
              </button>
            </form>
          </div>

          {/* Riwayat Goods Issues */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Riwayat Pengeluaran Barang &amp; Jurnal yang Dihasilkan
            </h4>

            <div className="space-y-3">
              {issues.map((gi) => (
                <div key={gi.gi_id} className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-mono font-bold text-indigo-400">{gi.gi_number}</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Kategori: <strong className="text-white">{gi.issue_category}</strong> • Tujuan:{' '}
                        <span className="font-mono text-cyan-300">{gi.destination_branch_id || 'INTERNAL'}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-white text-sm">
                        Rp {gi.total_issue_cost.toLocaleString('id-ID')}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {gi.workflow_stage}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-300">
                        Auto-Jurnal: <span className="font-mono text-emerald-400">{gi.journal_reference}</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {gi.destination_branch_id === 'C01'
                          ? 'Debit: [1140] Piutang Mitra KSO | Kredit: [4150] Pendapatan B2B Perlengkapan'
                          : gi.issue_category === 'ASSET'
                          ? 'Debit: [1500] Peralatan Kantor Baru | Kredit: [1300] Persediaan Material'
                          : 'Debit: [1200] RAK Cabang Surabaya | Kredit: [1300] Persediaan Koper HQ'}
                      </p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: EQUIPMENT HANDOVERS & COURIER TRACKING */}
      {subTab === 'HANDOVER' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Buat Handover */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
              <Package className="w-4 h-4 text-emerald-400" />
              Tanda Terima &amp; Pengiriman Koper
            </h4>

            <form onSubmit={handleCreateHandover} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Nama Jamaah</label>
                <input
                  type="text"
                  value={handoverCustName}
                  onChange={(e) => setHandoverCustName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Item Perlengkapan</label>
                <input
                  type="text"
                  value={handoverItem}
                  onChange={(e) => setHandoverItem(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Metode Penyerahan</label>
                <select
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value="EXPEDITION_COURIER">Kirim Ekspedisi Kurir (Resi JNE/J&amp;T)</option>
                  <option value="PICKUP_BRANCH">Ambil Sendiri di Kantor Cabang</option>
                </select>
              </div>

              {deliveryMethod === 'EXPEDITION_COURIER' && (
                <>
                  <div>
                    <label className="text-slate-400 font-medium block mb-1">Nama Ekspedisi</label>
                    <input
                      type="text"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium block mb-1">Nomor Resi Pelacakan</label>
                    <input
                      type="text"
                      value={trackingNo}
                      onChange={(e) => setTrackingNo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-cyan-300 font-mono font-bold"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Simpan &amp; Sync ke Portal Jamaah
              </button>
            </form>
          </div>

          {/* Daftar Status Handover */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <Barcode className="w-4 h-4 text-cyan-400" />
              Status Tanda Terima Perlengkapan &amp; Pelacakan Resi Jamaah
            </h4>

            <div className="space-y-3">
              {handovers.map((h) => (
                <div key={h.handover_id} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{h.customer_name}</span>
                      <span className="font-mono text-[10px] text-slate-400">({h.booking_number})</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          h.handover_status === 'HANDED_OVER'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        }`}
                      >
                        {h.handover_status}
                      </span>
                    </div>
                    <p className="text-slate-300 font-semibold">{h.item_name}</p>
                    <p className="text-[11px] text-slate-400">
                      Metode: {h.delivery_method === 'EXPEDITION_COURIER' ? 'Ekspedisi Kurir' : 'Ambil di Cabang'}
                      {h.courier_name && ` (${h.courier_name})`}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    {h.tracking_number ? (
                      <div>
                        <span className="text-[10px] text-slate-400 block">No. Resi Pengiriman:</span>
                        <span className="font-mono font-bold text-cyan-400 text-xs">{h.tracking_number}</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[10px] text-slate-400 block">Penerima Langsung:</span>
                        <span className="font-semibold text-slate-300">{h.received_by_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: FIXED ASSETS & DISPOSAL AUTOMATION */}
      {subTab === 'FIXED_ASSETS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Disposal Aset */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              Pelepasan / Disposal Aset
            </h4>

            <form onSubmit={handleExecuteDisposal} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Pilih Master Aset</label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  {assets.map((a) => (
                    <option key={a.asset_id} value={a.asset_id}>
                      {a.asset_code} - {a.asset_name} (Nilai Buku: Rp {a.book_value.toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Harga Jual / Pelepasan (Rp)</label>
                <input
                  type="number"
                  value={disposalPrice}
                  onChange={(e) => setDisposalPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Alasan Pelepasan</label>
                <textarea
                  value={disposalReason}
                  onChange={(e) => setDisposalReason(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">Auto-Jurnal Disposal:</p>
                <p>• Menghapus Akumulasi Penyusutan &amp; Nilai Perolehan Aset.</p>
                <p>• Mencatat Kas Penerimaan Penjualan.</p>
                <p>• Otomatis mengakui Laba / Rugi Pelepasan Aset (Gain/Loss on Disposal).</p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Eksekusi Disposal &amp; Jurnal
              </button>
            </form>
          </div>

          {/* Master Aset & Riwayat Disposal */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-400" />
                Daftar Aktiva Tetap (Fixed Assets)
              </h4>

              <div className="space-y-3">
                {assets.map((ast) => (
                  <div key={ast.asset_id} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400">{ast.asset_code}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold">
                          {ast.category}
                        </span>
                        {ast.is_kso_asset && (
                          <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-300 font-bold">
                            Aset KSO Kediri
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-white text-sm">{ast.asset_name}</p>
                      <p className="text-[11px] text-slate-400">
                        Perolehan: Rp {ast.acquisition_cost.toLocaleString('id-ID')} • Akumulasi Susut: Rp {ast.accumulated_depreciation.toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block">Nilai Buku (Book Value):</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        Rp {ast.book_value.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Riwayat Disposal */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                Riwayat Pelepasan Aset &amp; Gain/Loss
              </h4>

              <div className="space-y-2">
                {disposals.map((d) => (
                  <div key={d.disposal_id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">{d.asset_name} ({d.asset_code})</p>
                      <p className="text-[11px] text-slate-400">
                        Harga Jual: Rp {d.sale_price.toLocaleString('id-ID')} • Nilai Buku: Rp {d.book_value_at_disposal.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-emerald-400 font-bold block">
                        Jurnal: {d.journal_reference}
                      </span>
                      <span className="font-mono text-cyan-300 text-[11px]">
                        Laba Pelepasan: +Rp {d.gain_loss_amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
