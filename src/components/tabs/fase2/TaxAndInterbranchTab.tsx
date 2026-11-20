import React, { useState } from 'react';
import {
  BadgePercent,
  GitCompare,
  ArrowRightLeft,
  Building,
  CheckCircle2,
  FileText,
  Calculator,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

export const TaxAndInterbranchTab: React.FC = () => {
  // Tax Calculator State (PO Vendor with PPh 23 & PPN)
  const [poGrossAmount, setPoGrossAmount] = useState<number>(50000000); // 50 Juta
  const [vendorCategory, setVendorCategory] = useState<'BUS_TRANSPORT' | 'HOTEL_SEWA' | 'HONOR_MUTHAWIF'>('BUS_TRANSPORT');
  const [includePpn, setIncludePpn] = useState<boolean>(true);

  // Interbranch transaction simulation
  const [transferAmount, setTransferAmount] = useState<number>(25000000);
  const [transferType, setTransferType] = useState<'MANDIRI_RAK' | 'KSO_B2B'>('KSO_B2B');

  // Calculate taxes based on selection:
  // BUS_TRANSPORT: PPh 23 (2%)
  // HOTEL_SEWA: PPh Final 4(2) (10%)
  // HONOR_MUTHAWIF: PPh 21 (5%)
  const taxRates = {
    BUS_TRANSPORT: { name: 'PPh Pasal 23 (Jasa Sewa Angkutan/Handling)', rate: 0.02, coa: '2108-UTANG-PPH23' },
    HOTEL_SEWA: { name: 'PPh Final Pasal 4 Ayat 2 (Sewa Ruang/Gedung)', rate: 0.10, coa: '2107-UTANG-PPH-FINAL' },
    HONOR_MUTHAWIF: { name: 'PPh Pasal 21 (Tenaga Ahli/Pembimbing Ibadah)', rate: 0.05, coa: '2107-UTANG-PPH21' },
  };

  const selectedTax = taxRates[vendorCategory];
  const whtAmount = poGrossAmount * selectedTax.rate;
  const ppnAmount = includePpn ? poGrossAmount * 0.11 : 0;
  const netPayableVendor = poGrossAmount + ppnAmount - whtAmount;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <BadgePercent className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Modul Perpajakan (Withholding Tax / WHT) &amp; Rekonsiliasi Antar-Cabang (Eliminasi)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
              Arsitektur otomatisasi pemotongan pajak (PPh 23, PPh 21, PPN 11%) pada transaksi PO Vendor dan
              pembagian margin KSO, serta logika penjurnalan eliminasi konsolidasi:
              <strong> HQ vs Mandiri</strong> menggunakan akun <em>RAK (Rekening Antar Kantor)</em>, sedangkan
              <strong> HQ vs KSO</strong> menggunakan akun <em>Piutang/Utang Mitra KSO</em> (entitas B2B terpisah).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ========================================================
            BAGIAN 1: SIMULATOR PERPAJAKAN (WHT & PPN)
        ======================================================== */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              Skenario Pemotongan Pajak PO Vendor (WHT &amp; PPN)
            </h4>
            <span className="text-xs font-mono text-amber-400">Tax Engine</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Nilai Transaksi Bruto (IDR)</label>
              <input
                type="number"
                value={poGrossAmount}
                onChange={(e) => setPoGrossAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Jenis Objek Jasa / Pajak</label>
              <select
                aria-label="Jenis Objek Jasa / Pajak"
                value={vendorCategory}
                onChange={(e) => setVendorCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
              >
                <option value="BUS_TRANSPORT">Sewa Bus / Transportasi Saudi (PPh 23 - 2%)</option>
                <option value="HOTEL_SEWA">Sewa Tempat Manasik / Hall (PPh Final 4(2) - 10%)</option>
                <option value="HONOR_MUTHAWIF">Honorarium Muthawif / TL (PPh 21 - 5%)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <span className="font-bold text-white block">Kenakan PPN 11% (Pajak Masukan)</span>
                <span className="text-[11px] text-slate-400">
                  Dapat dikreditkan di akun 1108-PPN-MASUKAN
                </span>
              </div>
              <input
                type="checkbox"
                checked={includePpn}
                onChange={(e) => setIncludePpn(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded bg-slate-900 border-slate-700 cursor-pointer"
              />
            </div>

            {/* Tax Calculation Result Card */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                Hasil Kalkulasi Potongan Pajak &amp; Kas Dibayarkan:
              </span>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-slate-300">
                  <span>Tagihan Bruto Vendor:</span>
                  <span className="font-mono font-bold text-white">
                    Rp {poGrossAmount.toLocaleString('id-ID')}
                  </span>
                </div>

                {includePpn && (
                  <div className="flex justify-between text-cyan-300">
                    <span>(+) PPN 11% Masukan:</span>
                    <span className="font-mono font-bold">
                      +Rp {ppnAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-rose-400">
                  <span>(-) Potongan {selectedTax.name}:</span>
                  <span className="font-mono font-bold">
                    -Rp {whtAmount.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                  <span className="text-emerald-400">Net Kas Dibayar ke Vendor:</span>
                  <span className="font-mono text-emerald-400">
                    Rp {netPayableVendor.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Generated Journal Entries Preview */}
            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-1 font-mono text-[11px]">
              <span className="text-[10px] text-slate-400 font-sans font-bold block mb-1">
                Auto-Jurnal 3-Level yang Terbentuk (Buku Besar):
              </span>
              <div className="text-emerald-400">
                (D) Beban Jasa Vendor &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: Rp {poGrossAmount.toLocaleString('id-ID')}
              </div>
              {includePpn && (
                <div className="text-cyan-400">
                  (D) 1108-PPN-MASUKAN &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: Rp {ppnAmount.toLocaleString('id-ID')}
                </div>
              )}
              <div className="text-amber-400 pl-4">
                (C) {selectedTax.coa} (Utang Pajak) : Rp {whtAmount.toLocaleString('id-ID')}
              </div>
              <div className="text-rose-400 pl-4">
                (C) 1102-BSI-IDR (Kas/Bank Keluar) &nbsp;: Rp {netPayableVendor.toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            BAGIAN 2: LOGIKA REKONSILIASI ANTAR CABANG (ELIMINASI)
        ======================================================== */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
              Rekonsiliasi Antar Cabang: RAK vs B2B KSO
            </h4>
            <span className="text-xs font-mono text-cyan-400">Eliminasi GL</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Nilai Transaksi Mutasi Antar Cabang (IDR)</label>
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Bentuk Hubungan Cabang</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTransferType('MANDIRI_RAK')}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    transferType === 'MANDIRI_RAK'
                      ? 'bg-purple-950/40 border-purple-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <strong className="block text-xs">HQ vs Mandiri</strong>
                  <span className="text-[10px]">Akun RAK (Konsolidasi Otomatis)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTransferType('KSO_B2B')}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    transferType === 'KSO_B2B'
                      ? 'bg-cyan-950/40 border-cyan-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <strong className="block text-xs">HQ vs KSO (Franchise)</strong>
                  <span className="text-[10px]">Akun Piutang/Utang B2B Mitra</span>
                </button>
              </div>
            </div>

            {/* Logic comparison box */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {transferType === 'MANDIRI_RAK'
                  ? 'Aturan Penjurnalan HQ vs Cabang Mandiri:'
                  : 'Aturan Penjurnalan HQ vs Cabang KSO (Mitra B2B):'}
              </h5>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {transferType === 'MANDIRI_RAK'
                  ? 'Cabang Mandiri merupakan satu entitas hukum fiskal dengan HQ. Transaksi menggunakan akun RAK (Rekening Antar Kantor: 1105-RAK-MANDIRI) yang pada laporan keuangan konsolidasian dieliminasi menjadi nol (0).'
                  : 'Cabang KSO adalah entitas badan usaha / mitra pihak ketiga yang terpisah secara hukum. Tidak boleh menggunakan akun RAK; wajib menggunakan akun 1106-PIUTANG-MITRA-KSO atau 2102-UTANG-KSO-BAGIHASIL.'}
              </p>
            </div>

            {/* Generated Two-Sided Journal Preview */}
            <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 space-y-2.5 text-[11px] font-mono">
              <div>
                <span className="text-[10px] text-purple-400 font-sans font-bold block">
                  1. Sisi Buku Besar Kantor Pusat (HQ Jakarta):
                </span>
                {transferType === 'MANDIRI_RAK' ? (
                  <>
                    <div className="text-emerald-400">(D) 1105-RAK-MANDIRI: Rp {transferAmount.toLocaleString('id-ID')}</div>
                    <div className="text-rose-400 pl-4">(C) 1102-BSI-IDR: Rp {transferAmount.toLocaleString('id-ID')}</div>
                  </>
                ) : (
                  <>
                    <div className="text-emerald-400">(D) 1106-PIUTANG-MITRA-KSO: Rp {transferAmount.toLocaleString('id-ID')}</div>
                    <div className="text-rose-400 pl-4">(C) 1102-BSI-IDR: Rp {transferAmount.toLocaleString('id-ID')}</div>
                  </>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] text-cyan-400 font-sans font-bold block">
                  2. Sisi Buku Besar Cabang Lokal (Kediri):
                </span>
                {transferType === 'MANDIRI_RAK' ? (
                  <>
                    <div className="text-emerald-400">(D) 1101-C01-KAS: Rp {transferAmount.toLocaleString('id-ID')}</div>
                    <div className="text-rose-400 pl-4">(C) 1105-RAK-PUSAT: Rp {transferAmount.toLocaleString('id-ID')}</div>
                  </>
                ) : (
                  <>
                    <div className="text-emerald-400">(D) 1101-C01-KAS: Rp {transferAmount.toLocaleString('id-ID')}</div>
                    <div className="text-rose-400 pl-4">(C) 2102-UTANG-MITRA-HQ: Rp {transferAmount.toLocaleString('id-ID')}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
