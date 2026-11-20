import React, { useState } from 'react';
import {
  QrCode,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  User,
  MapPin,
  Luggage,
  HeartPulse,
  Compass,
  FileCheck2,
  Calendar,
  Search,
  Filter,
  Eye,
  Plus,
  Save,
  X,
  Phone,
  FileSpreadsheet,
} from 'lucide-react';
import { Customer, GeneralMaster } from '../../types/erp.ts';
import { mockGeneralMasters } from '../../data/mockData.ts';
import { CollapsibleCard } from '../common/CollapsibleCard.tsx';
import { PopupCalendar } from '../common/PopupCalendar.tsx';
import { RegionalLocationSelector } from '../common/RegionalLocationSelector.tsx';
import { ResizableTh, useResizableColumns } from '../common/ResizableTable.tsx';
import {
  PersonAvatar,
  GenderBadge,
  GenderPhotoSelector,
  getPersonPhoto,
} from '../../utils/personAvatars.tsx';

interface SiskopatuhValidatorTabProps {
  customers: Customer[];
  onAddCustomer?: (customer: Customer) => void;
  generalMasters?: GeneralMaster[];
}

export const SiskopatuhValidatorTab: React.FC<SiskopatuhValidatorTabProps> = ({
  customers: initialCustomers,
  onAddCustomer,
  generalMasters = mockGeneralMasters,
}) => {
  const [customerList, setCustomerList] = useState<Customer[]>(initialCustomers);

  // Form Entry: Nama 3 bagian (Awal, Tengah, Akhir)
  const [firstName, setFirstName] = useState('Fatimah');
  const [middleName, setMiddleName] = useState('Azzahra');
  const [lastName, setLastName] = useState('Al-Habsyi');
  const [birthDate, setBirthDate] = useState('2000-05-15'); // Usia 26 (< 45 th, triggers Mahram)
  const [gender, setGender] = useState<'L' | 'P'>('P');
  const [photoUrl, setPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
  );
  const [bloodType, setBloodType] = useState<'A' | 'B' | 'AB' | 'O'>('B');
  const [nik, setNik] = useState('3571025505000001');
  const [passportNo, setPassportNo] = useState('X9988112');
  const [passportExpiry, setPassportExpiry] = useState('2034-12-31');
  const [fathersName, setFathersName] = useState('H. Ahmad Dahlan');
  const [selectedMahramId, setSelectedMahramId] = useState<string>('');
  const [mahramRelation, setMahramRelation] = useState('AYAH_KANDUNG');

  // Regional & Detail Alamat
  const [islandCode, setIslandCode] = useState('ISL30');
  const [provinceCode, setProvinceCode] = useState('PV35');
  const [provinceName, setProvinceName] = useState('JAWA TIMUR');
  const [cityCode, setCityCode] = useState('3571');
  const [cityName, setCityName] = useState('KOTA KEDIRI');
  const [address1, setAddress1] = useState('Jl. Hayam Wuruk No. 88');
  const [address2, setAddress2] = useState('Perum Harmoni Indah Blok B3');
  const [district, setDistrict] = useState('Kota');
  const [village, setVillage] = useState('Balowerti');
  const [rt, setRt] = useState('003');
  const [rw, setRw] = useState('002');
  const [postalCode, setPostalCode] = useState('64129');

  // Logistik & Medis
  const [jacketSize, setJacketSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL'>('M');
  const [shoeSize, setShoeSize] = useState('38');
  const [medicalNotes, setMedicalNotes] = useState('Alergi debu gurun ringan');
  const [emergencyName, setEmergencyName] = useState('H. Ahmad Dahlan');
  const [emergencyPhone, setEmergencyPhone] = useState('081299887700');
  const [emergencyRelation, setEmergencyRelation] = useState('Ayah Kandung');

  // Interactive Inspection & Modals
  const [inspectedCustomer, setInspectedCustomer] = useState<Customer>(customerList[0] || initialCustomers[0]);
  const [detailCustomerModal, setDetailCustomerModal] = useState<Customer | null>(null);

  // Search & Filters for List
  const [searchName, setSearchName] = useState('');
  const [filterGender, setFilterGender] = useState<'ALL' | 'L' | 'P'>('ALL');
  const [filterMahramStatus, setFilterMahramStatus] = useState<'ALL' | 'MAHRAM' | 'MANDIRI'>('ALL');
  const [filterCity, setFilterCity] = useState('');

  // Validation feedback state
  const [validationResult, setValidationResult] = useState<{
    status: 'IDLE' | 'SUCCESS' | 'ERROR';
    message: string;
    details?: string;
  }>({ status: 'IDLE', message: '' });

  // Resizable table columns
  type JamaahColKey =
    | 'name'
    | 'genderAge'
    | 'passport'
    | 'mahram'
    | 'city'
    | 'logistics'
    | 'actions';

  const { widths, startResize } = useResizableColumns<JamaahColKey>({
    name: 240,
    genderAge: 130,
    passport: 160,
    mahram: 170,
    city: 140,
    logistics: 140,
    actions: 130,
  });

  // Calculate age
  const calculateAge = (bDate: string) => {
    const today = new Date();
    const birth = new Date(bDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return isNaN(age) ? 0 : age;
  };

  const currentAge = calculateAge(birthDate);
  const requiresMahram = gender === 'P' && currentAge < 45;

  // Potential male mahrams from customers
  const malePilgrims = customerList.filter((c) => c.gender === 'L');

  // Submit & Validation Trigger
  const handleValidateAndRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (gender === 'P' && currentAge < 45) {
      if (!selectedMahramId) {
        setValidationResult({
          status: 'ERROR',
          message: 'Validasi Siskopatuh Kemenag & Syarat Mahram Menggagalkan Transaksi!',
          details: `Aturan Siskopatuh Kemenag & Regulasi Muasasah Saudi: Jamaah wanita berusia ${currentAge} tahun (< 45 tahun) WAJIB didampingi Mahram Laki-laki yang sah!`,
        });
        return;
      }

      const mahram = customerList.find((c) => c.customer_id === selectedMahramId);
      if (mahram && mahram.gender !== 'L') {
        setValidationResult({
          status: 'ERROR',
          message: 'Validasi Siskopatuh Gagal: Mahram Harus Laki-Laki!',
          details: `Mahram terpilih (${mahram.full_name}) berjenis kelamin Perempuan. Syarat mahram wajib Laki-Laki (Suami / Ayah / Saudara Kandung).`,
        });
        return;
      }
    }

    const compiledFullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
    const generatedQr = `SISKOPATUH-3571-${passportNo}-BAGASI-${String(Date.now()).slice(-4)}`;
    const mahramObj = customerList.find((c) => c.customer_id === selectedMahramId);

    const newCust: Customer = {
      customer_id: `cust-gen-${Date.now()}`,
      tenant_id: '11111111-1111-1111-1111-111111111111',
      owner_branch_id: 'C01',
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      full_name: compiledFullName,
      birth_place: cityName || 'Kediri',
      birth_date: birthDate,
      gender,
      blood_type: bloodType,
      address: `${address1}, RT ${rt}/RW ${rw}, Kel. ${village}, Kec. ${district}, ${cityName}, ${provinceName}`,
      address_1: address1,
      address_2: address2,
      island_code: islandCode,
      province_code: provinceCode,
      province: provinceName,
      city_code: cityCode,
      city: cityName,
      district,
      village,
      rt,
      rw,
      postal_code: postalCode,
      home_latitude: -7.8189,
      home_longitude: 112.0195,
      nik,
      passport_number: passportNo,
      passport_expiry: passportExpiry,
      fathers_name: fathersName,
      mahram_id: selectedMahramId || null,
      mahram_name: mahramObj?.full_name,
      mahram_relation: requiresMahram ? mahramRelation : undefined,
      siskopatuh_qr_code: generatedQr,
      jacket_size: jacketSize,
      shoe_size: shoeSize,
      medical_notes: medicalNotes,
      emergency_contact: {
        name: emergencyName,
        relation: emergencyRelation,
        phone: emergencyPhone,
      },
      photo_url: photoUrl,
    };

    setCustomerList([newCust, ...customerList]);
    setInspectedCustomer(newCust);
    if (onAddCustomer) {
      onAddCustomer(newCust);
    }

    setValidationResult({
      status: 'SUCCESS',
      message: 'Validasi Siskopatuh Berhasil & Data Jamaah Tersimpan!',
      details: `Data jamaah lolos verifikasi Siskopatuh. Baris data berhasil dibuat dengan kode bagasi: ${generatedQr}`,
    });
  };

  // Filtered customer list
  const filteredCustomers = customerList.filter((c) => {
    const searchLow = searchName.toLowerCase();
    const matchesName =
      (c.full_name || '').toLowerCase().includes(searchLow) ||
      (c.first_name || '').toLowerCase().includes(searchLow) ||
      (c.middle_name || '').toLowerCase().includes(searchLow) ||
      (c.last_name || '').toLowerCase().includes(searchLow) ||
      (c.passport_number || '').toLowerCase().includes(searchLow) ||
      (c.nik || '').includes(searchLow);

    const matchesGender = filterGender === 'ALL' ? true : c.gender === filterGender;
    const matchesMahram =
      filterMahramStatus === 'ALL'
        ? true
        : filterMahramStatus === 'MAHRAM'
        ? !!c.mahram_name
        : !c.mahram_name;
    const matchesCity = filterCity ? (c.city || '').toLowerCase().includes(filterCity.toLowerCase()) : true;

    return matchesName && matchesGender && matchesMahram && matchesCity;
  });

  return (
    <div className="space-y-6">
      {/* 1. Collapsible Card: Panduan Kepatuhan Siskopatuh */}
      <CollapsibleCard
        title="Modul Registrasi & Validasi Siskopatuh Kemenag"
        subtitle="Verifikasi integrasi data jamaah, aturan mahram usia < 45 tahun, dan penerbitan Tag Bagasi QR"
        icon={FileCheck2}
        defaultOpen={true}
      >
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">
          Sesuai regulasi Kementerian Agama RI dan Muasasah Arab Saudi, seluruh data jamaah harus mencakup nama 3 kata (nama awal, tengah, akhir), data paspor resmi, serta validasi mahram bagi jamaah wanita usia subur (&lt; 45 tahun). Tag bagasi digital dicetak dengan barcode Siskopatuh untuk pelacakan koper di bandara Jeddah/Madinah.
        </p>
      </CollapsibleCard>

      {/* 2. Grid: Form Pendaftaran Jamaah vs Tag Bagasi QR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Form Entri Jamaah (7 Cols) */}
        <div className="lg:col-span-7">
          <CollapsibleCard
            title="Formulir Entri Data Calon Jamaah"
            subtitle="Dilengkapi nama 3 kata, popup calendar, dan filter pulau/provinsi/kota dari data master"
            icon={User}
            defaultOpen={true}
          >
            <form onSubmit={handleValidateAndRegister} className="space-y-4 text-xs">
              {/* Bagian Nama (Nama Awal, Nama Tengah, Nama Akhir) */}
              <div className="p-3.5 rounded-xl border border-[#C0DDD6] dark:border-slate-800 bg-[#F4F8F7]/60 dark:bg-slate-950 space-y-2">
                <span className="font-bold text-[#1E4E46] dark:text-emerald-400 block text-xs">
                  Format Nama Jamaah (Standar Paspor 3 Kata):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Nama Awal <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Contoh: Fatimah"
                      className="w-full bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Nama Tengah
                    </label>
                    <input
                      type="text"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      placeholder="Contoh: Azzahra"
                      className="w-full bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Nama Akhir <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Contoh: Al-Habsyi"
                      className="w-full bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
                    />
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-1">
                  Hasil Nama Lengkap:{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {[firstName, middleName, lastName].filter(Boolean).join(' ') || '-'}
                  </strong>
                </div>
              </div>

              {/* Gender & Modest Hijab Photo Selector */}
              <div className="sm:col-span-3">
                <GenderPhotoSelector
                  label="Jenis Kelamin & Foto Profil Jamaah"
                  gender={gender}
                  onGenderChange={(g) => setGender(g)}
                  photoUrl={photoUrl}
                  onPhotoChange={(u) => setPhotoUrl(u)}
                  personName={[firstName, middleName, lastName].filter(Boolean).join(' ') || 'Fatimah'}
                />
              </div>

              {/* Tanggal Lahir (PopupCalendar) & Golongan Darah */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div>
                  <PopupCalendar
                    label="Tanggal Lahir"
                    required={true}
                    value={birthDate}
                    onChange={(val) => setBirthDate(val)}
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Usia Saat Ini: <strong className="text-slate-800 dark:text-slate-200">{currentAge} Tahun</strong>
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Golongan Darah
                  </label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value as 'A' | 'B' | 'AB' | 'O')}
                    className="w-full bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>
              </div>

              {/* Status Mahram Alert Banner */}
              <div
                className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                  requiresMahram
                    ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300'
                }`}
              >
                {requiresMahram ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div className="text-[11px] leading-relaxed">
                  {requiresMahram ? (
                    <>
                      <strong className="font-bold">Ketentuan Mahram Aktif:</strong> Jamaah wanita berusia {currentAge} tahun (&lt; 45 tahun). Wajib memilih mahram pendamping laki-laki.
                    </>
                  ) : (
                    <>
                      <strong className="font-bold">Mahram Mandiri:</strong>{' '}
                      {gender === 'L'
                        ? 'Jamaah laki-laki dapat bepergian mandiri / muhrim rombongan.'
                        : `Jamaah wanita berusia ${currentAge} tahun (>= 45 tahun) diperkenankan tanpa mahram khusus.`}
                    </>
                  )}
                </div>
              </div>

              {/* Mahram Selector & Relation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Pilih Mahram Pendamping {requiresMahram && <span className="text-rose-500">*</span>}
                  </label>
                  <select
                    value={selectedMahramId}
                    onChange={(e) => setSelectedMahramId(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
                  >
                    <option value="">-- Tanpa Mahram / Belum Ditentukan --</option>
                    {malePilgrims.map((m) => (
                      <option key={m.customer_id} value={m.customer_id}>
                        {m.full_name} (L) - Paspor: {m.passport_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Hubungan Mahram
                  </label>
                  <select
                    value={mahramRelation}
                    onChange={(e) => setMahramRelation(e.target.value)}
                    disabled={!selectedMahramId}
                    className="w-full bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#98C3BC] disabled:opacity-50"
                  >
                    <option value="SUAMI">Suami</option>
                    <option value="AYAH_KANDUNG">Ayah Kandung</option>
                    <option value="KAKAK_KANDUNG">Kakak Kandung Laki-laki</option>
                    <option value="ANAK_KANDUNG">Anak Laki-laki Dewasa</option>
                  </select>
                </div>
              </div>

              {/* NIK, Paspor & PopupCalendar Expired */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    NIK KTP (16 Digit) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Nomor Paspor RI <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={passportNo}
                    onChange={(e) => setPassportNo(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
                  />
                </div>

                <div>
                  <PopupCalendar
                    label="Masa Berlaku Paspor"
                    required={true}
                    value={passportExpiry}
                    onChange={(val) => setPassportExpiry(val)}
                  />
                </div>
              </div>

              {/* Nama Ayah Kandung */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Nama Ayah Kandung (Untuk Bin/Binti) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fathersName}
                  onChange={(e) => setFathersName(e.target.value)}
                  placeholder="Contoh: H. Ahmad Dahlan"
                  className="w-full bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
                />
              </div>

              {/* Cascading Regional Location Filter (Pulau, Provinsi, Kota) */}
              <div className="p-3.5 rounded-xl border border-[#C0DDD6] dark:border-slate-800 bg-[#F4F8F7]/60 dark:bg-slate-950 space-y-2">
                <span className="font-bold text-[#1E4E46] dark:text-emerald-400 block text-xs">
                  Domisili Wilayah (Filter General Master):
                </span>
                <RegionalLocationSelector
                  generalMasters={generalMasters}
                  selectedIsland={islandCode}
                  onSelectIsland={(code) => setIslandCode(code)}
                  selectedProvince={provinceCode}
                  onSelectProvince={(code, name) => {
                    setProvinceCode(code);
                    setProvinceName(name);
                  }}
                  selectedCity={cityCode}
                  onSelectCity={(code, name) => {
                    setCityCode(code);
                    setCityName(name);
                  }}
                />
              </div>

              {/* Detail Alamat 1, Alamat 2, RT/RW, Desa, Kecamatan, Kode Pos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Alamat 1 (Jalan/Nomor)</label>
                  <input
                    type="text"
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Alamat 2 (Kompleks/Blok)</label>
                  <input
                    type="text"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kecamatan</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Desa/Kelurahan</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">RT / RW</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={rt}
                      onChange={(e) => setRt(e.target.value)}
                      className="w-1/2 bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-1.5 py-1.5 text-xs text-center text-slate-900 dark:text-white"
                    />
                    <span>/</span>
                    <input
                      type="text"
                      value={rw}
                      onChange={(e) => setRw(e.target.value)}
                      className="w-1/2 bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-1.5 py-1.5 text-xs text-center text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kode Pos</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Uji Validasi Siskopatuh &amp; Daftarkan Jamaah</span>
                </button>
              </div>
            </form>

            {/* Validation Feedback Banner */}
            {validationResult.status !== 'IDLE' && (
              <div
                className={`mt-4 p-4 rounded-xl border transition-all ${
                  validationResult.status === 'SUCCESS'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {validationResult.status === 'SUCCESS' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                  )}
                  <div>
                    <p className="font-bold text-xs">{validationResult.message}</p>
                    <p className="text-[11px] mt-1 opacity-90 leading-relaxed font-mono">
                      {validationResult.details}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CollapsibleCard>
        </div>

        {/* Kolom Kanan: Tag Bagasi QR Siskopatuh Digital (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <CollapsibleCard
            title="Tag Bagasi & QR Siskopatuh Digital"
            subtitle="Label koper resmi untuk pemindaian bandara & logistik Saudi"
            icon={Luggage}
            defaultOpen={true}
          >
            {/* Tag Bagasi Mockup */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 text-slate-900 rounded-xl p-4 shadow-lg border-2 border-dashed border-amber-300 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-800">
                    KEMENTERIAN AGAMA RI • SISKOPATUH
                  </span>
                  <h5 className="font-black text-base text-slate-900 leading-tight mt-0.5">
                    {inspectedCustomer.full_name}
                  </h5>
                  <p className="text-[10px] text-slate-700 font-medium">
                    binti/bin {inspectedCustomer.fathers_name}
                  </p>
                </div>

                {/* QR Box */}
                <div className="bg-white p-2 rounded-lg border border-amber-300 shadow-sm flex flex-col items-center">
                  <QrCode className="w-14 h-14 text-slate-900" />
                  <span className="text-[8px] font-mono text-slate-600 mt-0.5 font-bold">SCAN PETUGAS</span>
                </div>
              </div>

              {/* Tag Details */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-amber-200/80 text-[10px]">
                <div>
                  <span className="text-slate-500 block">Nomor Paspor:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {inspectedCustomer.passport_number}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Cabang / Maktab:</span>
                  <span className="font-bold text-slate-900">{inspectedCustomer.owner_branch_id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Status Mahram:</span>
                  <span className="font-bold text-slate-900">
                    {inspectedCustomer.mahram_name || 'Mandiri / Muhrim'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Ukuran Jaket:</span>
                  <span className="font-bold text-slate-900">
                    Size {inspectedCustomer.jacket_size} ({inspectedCustomer.blood_type})
                  </span>
                </div>
              </div>

              {/* Barcode String Footer */}
              <div className="mt-3 pt-2 bg-amber-200/60 -mx-4 -mb-4 px-4 py-1.5 flex items-center justify-between text-[9px] font-mono font-bold text-slate-800">
                <span>{inspectedCustomer.siskopatuh_qr_code}</span>
                <span>MAKKAH 1447H</span>
              </div>
            </div>

            {/* Geolocation */}
            <div className="mt-3 p-3 rounded-xl bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> Domisili Penjemputan:
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                  {inspectedCustomer.home_latitude}, {inspectedCustomer.home_longitude}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {inspectedCustomer.address}
              </p>
            </div>
          </CollapsibleCard>
        </div>
      </div>

      {/* 3. Collapsible Card: Tabel Daftar Jamaah Terdaftar */}
      <CollapsibleCard
        title={`Daftar Jamaah Terdaftar (${customerList.length} Jamaah)`}
        subtitle="Tabel dinamis dengan kolom resizable, filter pencarian nama, filter gender & status mahram, serta view detail"
        icon={FileSpreadsheet}
        defaultOpen={true}
      >
        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-[#F4F8F7] dark:bg-slate-950 p-3 rounded-xl border border-[#C0DDD6] dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>

            {/* Filter Gender */}
            {(['ALL', 'L', 'P'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setFilterGender(g)}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  filterGender === g
                    ? 'bg-[#98C3BC] text-[#13302B] dark:bg-emerald-600 dark:text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-[#C0DDD6] dark:border-slate-800'
                }`}
              >
                {g === 'ALL' ? 'Semua Gender' : g === 'L' ? 'Laki-Laki' : 'Perempuan'}
              </button>
            ))}

            {/* Filter Mahram */}
            <select
              value={filterMahramStatus}
              onChange={(e) => setFilterMahramStatus(e.target.value as 'ALL' | 'MAHRAM' | 'MANDIRI')}
              className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">Semua Mahram</option>
              <option value="MAHRAM">Punya Mahram</option>
              <option value="MANDIRI">Mandiri</option>
            </select>
          </div>

          {/* Search by Name / Passport / NIK */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Cari nama jamaah, paspor, NIK..."
              className="w-full bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
            />
          </div>
        </div>

        {/* Resizable Table Container */}
        <div className="overflow-x-auto rounded-xl border border-[#C0DDD6] dark:border-slate-800">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#EBF5F3] dark:bg-slate-950 text-[#1E4E46] dark:text-slate-200 border-b border-[#C0DDD6] dark:border-slate-800">
                <ResizableTh width={widths.name} onResize={(e) => startResize('name', e)}>
                  Nama Jamaah (3 Kata)
                </ResizableTh>
                <ResizableTh width={widths.genderAge} onResize={(e) => startResize('genderAge', e)}>
                  Gender &amp; Usia
                </ResizableTh>
                <ResizableTh width={widths.passport} onResize={(e) => startResize('passport', e)}>
                  No. Paspor &amp; NIK
                </ResizableTh>
                <ResizableTh width={widths.mahram} onResize={(e) => startResize('mahram', e)}>
                  Status Mahram
                </ResizableTh>
                <ResizableTh width={widths.city} onResize={(e) => startResize('city', e)}>
                  Kota Domisili
                </ResizableTh>
                <ResizableTh width={widths.logistics} onResize={(e) => startResize('logistics', e)}>
                  Ukuran Logistik
                </ResizableTh>
                <ResizableTh width={widths.actions} onResize={(e) => startResize('actions', e)} align="center">
                  Aksi
                </ResizableTh>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C0DDD6]/60 dark:divide-slate-800/80 text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ada data jamaah yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const age = calculateAge(c.birth_date);
                  const isInspected = inspectedCustomer.customer_id === c.customer_id;

                  return (
                    <tr
                      key={c.customer_id}
                      onClick={() => setInspectedCustomer(c)}
                      className={`hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                        isInspected ? 'bg-emerald-50/60 dark:bg-emerald-950/20' : ''
                      }`}
                    >
                      {/* Nama */}
                      <td className="px-3.5 py-3 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          <PersonAvatar
                            name={c.full_name}
                            gender={c.gender}
                            photoUrl={c.photo_url}
                            size="sm"
                            showGenderBadge={true}
                          />
                          <div>
                            <span className="font-bold">{c.full_name}</span>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">
                              binti/bin {c.fathers_name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Gender & Usia */}
                      <td className="px-3.5 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <GenderBadge gender={c.gender} />
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {age} th
                          </span>
                        </div>
                      </td>

                      {/* Paspor & NIK */}
                      <td className="px-3.5 py-3 font-mono">
                        <div className="text-[#1E4E46] dark:text-emerald-400 font-bold">
                          {c.passport_number}
                        </div>
                        <div className="text-[10px] text-slate-500">{c.nik}</div>
                      </td>

                      {/* Mahram */}
                      <td className="px-3.5 py-3">
                        {c.mahram_name ? (
                          <div className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{c.mahram_name}</span>
                          </div>
                        ) : c.gender === 'P' && age < 45 ? (
                          <div className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Wajib Mahram!
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Mandiri</span>
                        )}
                      </td>

                      {/* Kota */}
                      <td className="px-3.5 py-3 text-slate-700 dark:text-slate-300">
                        {c.city || '-'}
                      </td>

                      {/* Logistik */}
                      <td className="px-3.5 py-3 text-slate-600 dark:text-slate-400">
                        Jaket: <strong className="text-slate-900 dark:text-white">{c.jacket_size}</strong> • Sepatu:{' '}
                        <strong className="text-slate-900 dark:text-white">{c.shoe_size}</strong>
                      </td>

                      {/* Aksi */}
                      <td
                        className="px-3.5 py-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailCustomerModal(c)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#98C3BC] hover:bg-[#86b5ad] text-[#13302B] dark:bg-slate-800 dark:text-cyan-300 flex items-center gap-1 transition-colors"
                            title="Lihat Detail Profil Jamaah"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Detail</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CollapsibleCard>

      {/* Modal: View Detail Profil Jamaah */}
      {detailCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#C0DDD6] dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#C0DDD6] dark:border-slate-800">
              <div className="flex items-center gap-3">
                <PersonAvatar
                  name={detailCustomerModal.full_name}
                  gender={detailCustomerModal.gender}
                  photoUrl={detailCustomerModal.photo_url}
                  size="lg"
                  showGenderBadge={true}
                />
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2 flex-wrap">
                    <span>{detailCustomerModal.full_name}</span>
                    <GenderBadge gender={detailCustomerModal.gender} />
                  </h3>
                  <span className="text-xs text-slate-500">
                    No. Paspor: {detailCustomerModal.passport_number} • NIK: {detailCustomerModal.nik} • {detailCustomerModal.gender === 'P' ? 'Perempuan (Berjilbab)' : 'Laki-laki'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailCustomerModal(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Ringkasan */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F4F8F7] dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[11px]">Nama Sesuai Paspor</span>
                  <strong className="text-slate-900 dark:text-white text-sm">
                    {detailCustomerModal.full_name}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Ayah Kandung</span>
                  <strong className="text-slate-900 dark:text-white">
                    {detailCustomerModal.fathers_name}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Gender &amp; Lahir</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {detailCustomerModal.gender === 'L' ? 'Laki-Laki' : 'Perempuan'} • {detailCustomerModal.birth_place},{' '}
                    {detailCustomerModal.birth_date} ({calculateAge(detailCustomerModal.birth_date)} th)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Golongan Darah</span>
                  <span className="font-bold text-rose-600">{detailCustomerModal.blood_type}</span>
                </div>
              </div>

              {/* Status Mahram & Siskopatuh */}
              <div className="border border-[#C0DDD6] dark:border-slate-800 rounded-xl p-3.5 space-y-2">
                <span className="font-bold text-[#1E4E46] dark:text-emerald-400 block text-xs">
                  Validasi Mahram &amp; Siskopatuh Kemenag:
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400 text-[11px]">Pendamping Mahram:</span>
                    <p className="font-semibold">{detailCustomerModal.mahram_name || 'Mandiri'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Hubungan:</span>
                    <p className="font-semibold">{detailCustomerModal.mahram_relation || 'Tanpa Mahram'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Masa Berlaku Paspor:</span>
                    <p className="font-semibold">{detailCustomerModal.passport_expiry}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Kode Tag Bagasi:</span>
                    <p className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {detailCustomerModal.siskopatuh_qr_code}
                    </p>
                  </div>
                </div>
              </div>

              {/* Alamat Lengkap */}
              <div className="border border-[#C0DDD6] dark:border-slate-800 rounded-xl p-3.5 space-y-2">
                <span className="font-bold text-[#1E4E46] dark:text-emerald-400 block text-xs">
                  Alamat Lengkap &amp; Domisili:
                </span>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  {detailCustomerModal.address}
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                  <div>Pulau: {detailCustomerModal.island_code || 'ISL30 (JAWA)'}</div>
                  <div>Provinsi: {detailCustomerModal.province || '-'}</div>
                  <div>Kota/Kab: {detailCustomerModal.city || '-'}</div>
                  <div>Kode Pos: {detailCustomerModal.postal_code || '-'}</div>
                </div>
              </div>

              {/* Logistik & Medis */}
              <div className="border border-[#C0DDD6] dark:border-slate-800 rounded-xl p-3.5 space-y-2">
                <span className="font-bold text-[#1E4E46] dark:text-emerald-400 block text-xs">
                  Perlengkapan &amp; Catatan Medis:
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                  <div>Ukuran Jaket: <strong>{detailCustomerModal.jacket_size}</strong></div>
                  <div>Ukuran Sepatu: <strong>{detailCustomerModal.shoe_size}</strong></div>
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-[11px] pt-1">
                  Catatan Medis: <span className="font-medium">{detailCustomerModal.medical_notes || 'Sehat'}</span>
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Kontak Darurat:{' '}
                  <strong>
                    {detailCustomerModal.emergency_contact?.name} (
                    {detailCustomerModal.emergency_contact?.relation}) -{' '}
                    {detailCustomerModal.emergency_contact?.phone}
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setDetailCustomerModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#98C3BC] text-[#13302B] dark:bg-slate-800 dark:text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
