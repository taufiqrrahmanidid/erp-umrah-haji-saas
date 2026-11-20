import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  Download,
  Search,
  Database,
  Layers,
  Key,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';

interface DdlViewerTabProps {
  sqlContentFase1: string;
  sqlContentFase2: string;
  sqlContentFase3: string;
  sqlContentFase4: string;
  sqlContentFase5: string;
  sqlContentFase6: string;
  sqlContentFase7: string;
}

export const DdlViewerTab: React.FC<DdlViewerTabProps> = ({
  sqlContentFase1,
  sqlContentFase2,
  sqlContentFase3,
  sqlContentFase4,
  sqlContentFase5,
  sqlContentFase6,
  sqlContentFase7,
}) => {
  const [activeFase, setActiveFase] = useState<
    'FASE1' | 'FASE2' | 'FASE3' | 'FASE4' | 'FASE5' | 'FASE6' | 'FASE7'
  >('FASE7');
  const [copied, setCopied] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>('ALL');

  const currentSql =
    activeFase === 'FASE7'
      ? sqlContentFase7
      : activeFase === 'FASE6'
      ? sqlContentFase6
      : activeFase === 'FASE5'
      ? sqlContentFase5
      : activeFase === 'FASE4'
      ? sqlContentFase4
      : activeFase === 'FASE3'
      ? sqlContentFase3
      : activeFase === 'FASE2'
      ? sqlContentFase2
      : sqlContentFase1;

  const sectionsFase1 = [
    { id: 'ALL', label: 'Semua Script Modul 1 (Fondasi)' },
    { id: 'TENANT', label: '1. Tenant & Settings' },
    { id: 'RATES_SEQ', label: '2. Kurs & Auto-Number' },
    { id: 'RBAC', label: '3. RBAC & Multi-Tier Broker' },
    { id: 'HR', label: '4. HR & Payroll Dasar' },
    { id: 'BRANCH', label: '5. Master Cabang BRN01' },
    { id: 'CUSTOMER', label: '6. Siskopatuh & Mahram' },
    { id: 'VENDOR', label: '7. Vendor & Asuransi Syariah' },
    { id: 'RLS', label: '8. RLS Policies & Security' },
    { id: 'SEED', label: '9. Initial Master Seed Data' },
  ];

  const sectionsFase2 = [
    { id: 'ALL', label: 'Semua Script Modul 2 (Akuntansi)' },
    { id: 'COA', label: '1. COA Standar Syariah' },
    { id: 'JOURNAL', label: '2. Arsitektur Jurnal 3-Tingkat' },
    { id: 'TAX', label: '3. Engine Pajak PPN & PPh' },
    { id: 'PETTY', label: '4. Kas Kecil (Imprest & Fluktuasi)' },
    { id: 'PAYROLL', label: '5. Gaji, BPJS & PPh 21' },
    { id: 'INTERBRANCH', label: '6. Inter-Branch (RAK & KSO)' },
    { id: 'DOCS', label: '7. Surat & Log Aktivitas' },
    { id: 'SEED_ACC', label: '8. Seed Data Keuangan' },
  ];

  const sectionsFase3 = [
    { id: 'ALL', label: 'Semua Script Modul 3 (Paket & Operasional)' },
    { id: 'PACKAGES', label: '1. Paket Umrah & RAB HPP' },
    { id: 'ALLOCATION', label: '2. Alokasi Tiket & PNR' },
    { id: 'BOOKINGS', label: '3. Transaksi Booking Jamaah' },
    { id: 'PAYMENTS', label: '4. Pembayaran Multi-Payment' },
    { id: 'CASH_ADV', label: '5. Kasbon Mutawwif & e-LPJ' },
    { id: 'ESCROW', label: '6. Escrow Dana & Refund' },
    { id: 'PORTAL', label: '7. Portal Mandiri Jamaah' },
    { id: 'QUERIES', label: '8. Query Operasional Penting' },
  ];

  const sectionsFase4 = [
    { id: 'ALL', label: 'Semua Script Modul 4 (Procurement & Saudi)' },
    { id: 'EXPENSE_INV', label: '1. Expense Request & Multi-Level AP' },
    { id: 'MULTI_BRANCH', label: '2. Multi-Branch Transit (RAK)' },
    { id: 'MULTI_PLANT', label: '3. Multi-Plant Warehouse Perlengkapan' },
    { id: 'HANDOVER_EQUIP', label: '4. Distribusi Logistik Jamaah' },
    { id: 'FIXED_ASSETS', label: '5. Aset Tetap Kantor & Penyusutan' },
    { id: 'TOUR_OPS', label: '6. Tour Operations & Rooming List' },
    { id: 'ITIN_INSURANCE', label: '7. Itinerary, Realisasi & Asuransi' },
    { id: 'REV_RECOG', label: '8. SP Pengakuan Pendapatan Akrual' },
    { id: 'ROOMING_SQL', label: '9. Query Rooming & Bagasi' },
  ];

  const sectionsFase5 = [
    { id: 'ALL', label: 'Semua Script Modul 5 (Valas & Agen)' },
    { id: 'BANK_RECON', label: '1. Rekonsiliasi Bank Otomatis' },
    { id: 'UNREALIZED_FX', label: '2. Kurs Valas & Revaluasi MT940' },
    { id: 'AGENT_COMM', label: '3. Komisi Agen Bertingkat (Multi-Tier)' },
    { id: 'AGENT_WALLET', label: '4. Dompet Agen (Agent Wallets)' },
    { id: 'KSO_MARGIN', label: '5. Margin KSO & Pembagian Laba' },
    { id: 'FX_QUERY', label: '6. Query Valas & Rekonsiliasi' },
  ];

  const sectionsFase6 = [
    { id: 'ALL', label: 'Semua Script Modul 6 (Konsolidasi & Webhook)' },
    { id: 'FINANCIAL_VIEWS', label: '1. Standard Financial Reports (Laba Rugi & Neraca)' },
    { id: 'CONSOLIDATION', label: '2. Logika Konsolidasi & Eliminasi RAK' },
    { id: 'EXECUTIVE_VIEWS', label: '3. Executive Dashboard & Profitabilitas Kloter' },
    { id: 'COMMAND_CENTER', label: '4. View Live Command Center Saudi Ops' },
    { id: 'WEBHOOK_TABLE', label: '5. Webhook Payment Gateway Engine & SP' },
    { id: 'AUDIT_EXPANSION', label: '6. Ekspansi Audit Trail' },
  ];

  const sectionsFase7 = [
    { id: 'ALL', label: 'Semua Script Modul 7 (CRM & Pasca-Trip)' },
    { id: 'THEMING_GCAL', label: '1. Theming JSONB & Integrasi Google Calendar' },
    { id: 'DYNAMIC_LETTERS', label: '2. Modul Surat Keluar Dinamis & Push GCal' },
    { id: 'HAJJ_PORSI', label: '3. Manajemen Antrean Haji Khusus & Valas USD' },
    { id: 'B2B_PROVIDER', label: '4. B2B Provider Wholesale (Visa & LA)' },
    { id: 'SALES_CRM', label: '5. Pre-Trip Sales Pipeline (Kanban & RLS)' },
    { id: 'AUDIO_WHISPER', label: '6. Peminjaman Alat Audio Whisper Receiver' },
    { id: 'ZAMZAM_CERT', label: '7. Logistik Air Zam-zam & Sertifikat Pasca-Trip' },
    { id: 'SURVEY_ROUTING', label: '8. Post-Trip Survey & Smart Google Review Routing' },
    { id: 'ALUMNI_WA', label: '9. Database Alumni & WhatsApp Broadcast' },
  ];

  const activeSections =
    activeFase === 'FASE7'
      ? sectionsFase7
      : activeFase === 'FASE6'
      ? sectionsFase6
      : activeFase === 'FASE5'
      ? sectionsFase5
      : activeFase === 'FASE4'
      ? sectionsFase4
      : activeFase === 'FASE3'
      ? sectionsFase3
      : activeFase === 'FASE2'
      ? sectionsFase2
      : sectionsFase1;

  const filteredSql = React.useMemo(() => {
    if (selectedSection === 'ALL') return currentSql;

    const markersFase1: Record<string, { start: string; end?: string }> = {
      TENANT: { start: '-- 1. STRUKTUR MULTI-TENANT', end: '-- 2. KURS MATA UANG' },
      RATES_SEQ: { start: '-- 2. KURS MATA UANG', end: '-- 3. ROLE-BASED ACCESS CONTROL' },
      RBAC: { start: '-- 3. ROLE-BASED ACCESS CONTROL', end: '-- 4. MANAJEMEN PEGAWAI' },
      HR: { start: '-- 4. MANAJEMEN PEGAWAI', end: '-- 5. MASTER CABANG' },
      BRANCH: { start: '-- 5. MASTER CABANG', end: '-- 6. ENTITAS BISNIS UMRAH' },
      CUSTOMER: { start: '-- 6. ENTITAS BISNIS UMRAH', end: '-- 7. VENDOR & MITRA' },
      VENDOR: { start: '-- 7. VENDOR & MITRA', end: '-- 8. ROW LEVEL SECURITY' },
      RLS: { start: '-- 8. ROW LEVEL SECURITY', end: '-- 9. SEED DATA INISIAL' },
      SEED: { start: '-- 9. SEED DATA INISIAL' },
    };

    const markersFase2: Record<string, { start: string; end?: string }> = {
      COA: { start: '-- 1. MASTER CHART OF ACCOUNTS', end: '-- 2. ARSITEKTUR JURNAL' },
      JOURNAL: { start: '-- 2. ARSITEKTUR JURNAL', end: '-- 3. SISTEM PERPAJAKAN' },
      TAX: { start: '-- 3. SISTEM PERPAJAKAN', end: '-- 4. MANAJEMEN KAS KECIL' },
      PETTY: { start: '-- 4. MANAJEMEN KAS KECIL', end: '-- 5. PENGGAJIAN' },
      PAYROLL: { start: '-- 5. PENGGAJIAN', end: '-- 6. TRANSAKSI ANTAR-CABANG' },
      INTERBRANCH: { start: '-- 6. TRANSAKSI ANTAR-CABANG', end: '-- 7. MANAJEMEN DOKUMEN' },
      DOCS: { start: '-- 7. MANAJEMEN DOKUMEN', end: '-- 8. SEED DATA AKUNTANSI' },
      SEED_ACC: { start: '-- 8. SEED DATA AKUNTANSI' },
    };

    const markersFase3: Record<string, { start: string; end?: string }> = {
      PACKAGES: { start: '-- 1. MASTER PAKET UMRAH', end: '-- 2. BLOK ALOKASI SEAT' },
      ALLOCATION: { start: '-- 2. BLOK ALOKASI SEAT', end: '-- 3. TRANSAKSI PEMESANAN' },
      BOOKINGS: { start: '-- 3. TRANSAKSI PEMESANAN', end: '-- 4. PENERIMAAN PEMBAYARAN' },
      PAYMENTS: { start: '-- 4. PENERIMAAN PEMBAYARAN', end: '-- 5. KASBON MUTAWWIF' },
      CASH_ADV: { start: '-- 5. KASBON MUTAWWIF', end: '-- 6. ESCROW DANA & REFUND' },
      ESCROW: { start: '-- 6. ESCROW DANA & REFUND', end: '-- 7. PORTAL JAMAAH' },
      PORTAL: { start: '-- 7. PORTAL JAMAAH', end: '-- 8. CONTOH QUERY SQL' },
      QUERIES: { start: '-- 8. CONTOH QUERY SQL' },
    };

    const markersFase4: Record<string, { start: string; end?: string }> = {
      EXPENSE_INV: { start: '-- 1. EXPENSE REQUEST & INVOICING', end: '-- 2. MULTI-BRANCH TRANSIT' },
      MULTI_BRANCH: { start: '-- 2. MULTI-BRANCH TRANSIT', end: '-- 3. MULTI-PLANT WAREHOUSE' },
      MULTI_PLANT: { start: '-- 3. MULTI-PLANT WAREHOUSE', end: '-- 4. DISTRIBUSI LOGISTIK' },
      HANDOVER_EQUIP: { start: '-- 4. DISTRIBUSI LOGISTIK', end: '-- 5. ASSET TETAP KANTOR' },
      FIXED_ASSETS: { start: '-- 5. ASSET TETAP KANTOR', end: '-- 6. TOUR OPERATIONS' },
      TOUR_OPS: { start: '-- 6. TOUR OPERATIONS', end: '-- 7. ITINERARY REALISASI' },
      ITIN_INSURANCE: { start: '-- 7. ITINERARY REALISASI', end: '-- 8. STORED PROCEDURE: REVENUE' },
      REV_RECOG: { start: '-- 8. STORED PROCEDURE: REVENUE', end: '-- 9. CONTOH QUERY SQL' },
      ROOMING_SQL: { start: '-- 9. CONTOH QUERY SQL' },
    };

    const markersFase5: Record<string, { start: string; end?: string }> = {
      BANK_RECON: { start: '-- 1. REKONSILIASI BANK OTOMATIS', end: '-- 2. ENGINE MITIGASI KURS VALAS' },
      UNREALIZED_FX: { start: '-- 2. ENGINE MITIGASI KURS VALAS', end: '-- 3. KEMITRAAN BROKER MULTI-TIER' },
      AGENT_COMM: { start: '-- 3. KEMITRAAN BROKER MULTI-TIER', end: '-- 4. AGENT WALLETS' },
      AGENT_WALLET: { start: '-- 4. AGENT WALLETS', end: '-- 5. KEMITRAAN KSO (B2B WHOLESALE)' },
      KSO_MARGIN: { start: '-- 5. KEMITRAAN KSO (B2B WHOLESALE)', end: '-- 6. QUERY SQL' },
      FX_QUERY: { start: '-- 6. QUERY SQL' },
    };

    const markersFase6: Record<string, { start: string; end?: string }> = {
      FINANCIAL_VIEWS: { start: '-- 1. STANDARD FINANCIAL REPORTS', end: '-- 2. LOGIKA KONSOLIDASI' },
      CONSOLIDATION: { start: '-- 2. LOGIKA KONSOLIDASI', end: '-- 3. EXECUTIVE DASHBOARD' },
      EXECUTIVE_VIEWS: { start: '-- 3. EXECUTIVE DASHBOARD', end: '-- 3.3 View Command Center' },
      COMMAND_CENTER: { start: '-- 3.3 View Command Center', end: '-- 4. WEBHOOK PAYMENT' },
      WEBHOOK_TABLE: { start: '-- 4. WEBHOOK PAYMENT', end: '-- 5. EKSPANSI AUDIT' },
      AUDIT_EXPANSION: { start: '-- 5. EKSPANSI AUDIT' },
    };

    const markersFase7: Record<string, { start: string; end?: string }> = {
      THEMING_GCAL: { start: '-- 1. PERLUASAN THEMING', end: '-- 2. MODUL SURAT KELUAR' },
      DYNAMIC_LETTERS: { start: '-- 2. MODUL SURAT KELUAR', end: '-- 3. MANAJEMEN ANTREAN HAJI' },
      HAJJ_PORSI: { start: '-- 3. MANAJEMEN ANTREAN HAJI', end: '-- 4. B2B PROVIDER VISA' },
      B2B_PROVIDER: { start: '-- 4. B2B PROVIDER VISA', end: '-- 5. PRE-TRIP CRM' },
      SALES_CRM: { start: '-- 5. PRE-TRIP CRM', end: '-- 6. PEMINJAMAN ALAT AUDIO' },
      AUDIO_WHISPER: { start: '-- 6. PEMINJAMAN ALAT AUDIO', end: '-- 7. LOGISTIK PASCA-TRIP' },
      ZAMZAM_CERT: { start: '-- 7. LOGISTIK PASCA-TRIP', end: '-- 8. POST-TRIP SURVEY' },
      SURVEY_ROUTING: { start: '-- 8. POST-TRIP SURVEY', end: '-- 9. ALUMNI DATABASE VIEW' },
      ALUMNI_WA: { start: '-- 9. ALUMNI DATABASE VIEW' },
    };

    const targetMap =
      activeFase === 'FASE7'
        ? markersFase7
        : activeFase === 'FASE6'
        ? markersFase6
        : activeFase === 'FASE5'
        ? markersFase5
        : activeFase === 'FASE4'
        ? markersFase4
        : activeFase === 'FASE3'
        ? markersFase3
        : activeFase === 'FASE2'
        ? markersFase2
        : markersFase1;
    const target = targetMap[selectedSection];

    if (target) {
      const startIndex = currentSql.indexOf(target.start);
      if (startIndex !== -1) {
        if (target.end) {
          const endIndex = currentSql.indexOf(target.end);
          return endIndex !== -1 ? currentSql.slice(startIndex, endIndex).trim() : currentSql.slice(startIndex).trim();
        }
        return currentSql.slice(startIndex).trim();
      }
    }

    return currentSql;
  }, [currentSql, activeFase, selectedSection]);

  const handleCopy = () => {
    navigator.clipboard.writeText(filteredSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `erp_umrah_${activeFase.toLowerCase()}_ddl_${selectedSection.toLowerCase()}.sql`;
    const blob = new Blob([filteredSql], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Business Domain DDL Switcher Banner */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">
              Katalog Skema DDL SQL &amp; Stored Procedure Enterprise PostgreSQL
            </h4>
            <p className="text-xs text-slate-400">
              Pilih domain arsitektur basis data untuk melihat struktur tabel, relasi, RLS policies &amp; trigger
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              setActiveFase('FASE7');
              setSelectedSection('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeFase === 'FASE7'
                ? 'bg-emerald-600 text-white shadow ring-2 ring-emerald-400/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            ⭐ CRM, B2B Wholesale &amp; Purna-Trip
          </button>
          <button
            onClick={() => {
              setActiveFase('FASE6');
              setSelectedSection('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeFase === 'FASE6'
                ? 'bg-emerald-600 text-white shadow ring-2 ring-emerald-400/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Konsolidasi &amp; Webhook Gateway
          </button>
          <button
            onClick={() => {
              setActiveFase('FASE5');
              setSelectedSection('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeFase === 'FASE5'
                ? 'bg-emerald-600 text-white shadow ring-2 ring-emerald-400/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Valas FX, Bank &amp; Komisi Agen
          </button>
          <button
            onClick={() => {
              setActiveFase('FASE4');
              setSelectedSection('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeFase === 'FASE4'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Procurement, Gudang &amp; Saudi Ops
          </button>
          <button
            onClick={() => {
              setActiveFase('FASE3');
              setSelectedSection('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeFase === 'FASE3'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Paket, Booking &amp; Escrow VA
          </button>
          <button
            onClick={() => {
              setActiveFase('FASE2');
              setSelectedSection('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeFase === 'FASE2'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Akuntansi Syariah &amp; Payroll GL
          </button>
          <button
            onClick={() => {
              setActiveFase('FASE1');
              setSelectedSection('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeFase === 'FASE1'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Fondasi Multi-Tenant, Cabang &amp; RLS
          </button>
        </div>
      </div>

      {/* Control bar: Section selector + Copy + Download */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Pilih Bab/Modul:</span>
          {activeSections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setSelectedSection(sec.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                selectedSection === sec.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin SQL</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh File .sql</span>
          </button>
        </div>
      </div>

      {/* SQL Code Box */}
      <div className="relative rounded-xl border border-slate-800 bg-slate-950/80 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="ml-2 text-slate-300 font-semibold">
              PostgreSQL 16 Enterprise DDL ({activeFase} - {selectedSection})
            </span>
          </div>
          <span className="text-slate-500">{filteredSql.length.toLocaleString()} karakter</span>
        </div>

        <div className="p-4 max-h-[650px] overflow-auto font-mono text-xs text-slate-300 leading-relaxed whitespace-pre">
          {filteredSql}
        </div>
      </div>
    </div>
  );
};
