import React from 'react';
import { GeneralMaster } from '../../types/erp.ts';

interface RegionalLocationSelectorProps {
  generalMasters: GeneralMaster[];
  selectedIsland: string;
  onSelectIsland: (islandCode: string) => void;
  selectedProvince: string;
  onSelectProvince: (provinceCode: string, provinceName: string) => void;
  selectedCity: string;
  onSelectCity: (cityCode: string, cityName: string) => void;
  disabled?: boolean;
}

export const RegionalLocationSelector: React.FC<RegionalLocationSelectorProps> = ({
  generalMasters,
  selectedIsland,
  onSelectIsland,
  selectedProvince,
  onSelectProvince,
  selectedCity,
  onSelectCity,
  disabled = false,
}) => {
  // Extract Islands
  const islands = generalMasters.filter(
    (gm) => gm.head_code === 'ISLND' && gm.child_code !== '*'
  );

  // Extract Provinces filtered by selected Island (or all if not selected)
  const provinces = generalMasters.filter(
    (gm) =>
      gm.head_code === 'PROP' &&
      gm.child_code !== '*' &&
      (!selectedIsland || gm.cd1 === selectedIsland)
  );

  // Extract Cities filtered by selected Province (or all in island)
  const cities = generalMasters.filter((gm) => {
    if (gm.head_code !== 'CITY' || gm.child_code === '*') return false;
    if (selectedProvince) {
      return gm.cd1 === selectedProvince;
    }
    if (selectedIsland) {
      // Find all province codes in island
      const allowedProvCodes = provinces.map((p) => p.child_code);
      return gm.cd1 ? allowedProvCodes.includes(gm.cd1) : true;
    }
    return true;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* 1. Pulau */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Pulau
        </label>
        <select
          disabled={disabled}
          value={selectedIsland}
          onChange={(e) => {
            const island = e.target.value;
            onSelectIsland(island);
            // Reset dependent province & city if no longer valid
            onSelectProvince('', '');
            onSelectCity('', '');
          }}
          className="w-full bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#98C3BC] transition-all"
        >
          <option value="">-- Pilih Pulau --</option>
          {islands.map((isl) => (
            <option key={isl.child_code} value={isl.child_code}>
              {isl.description} ({isl.child_code})
            </option>
          ))}
        </select>
      </div>

      {/* 2. Provinsi */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Provinsi
        </label>
        <select
          disabled={disabled}
          value={selectedProvince}
          onChange={(e) => {
            const provCode = e.target.value;
            const provObj = provinces.find((p) => p.child_code === provCode);
            onSelectProvince(provCode, provObj ? provObj.description : '');
            onSelectCity('', '');
          }}
          className="w-full bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#98C3BC] transition-all"
        >
          <option value="">-- Pilih Provinsi --</option>
          {provinces.map((pr) => (
            <option key={pr.child_code} value={pr.child_code}>
              {pr.description}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Kota / Kabupaten */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Kota / Kabupaten
        </label>
        <select
          disabled={disabled}
          value={selectedCity}
          onChange={(e) => {
            const cityCode = e.target.value;
            const cityObj = cities.find((c) => c.child_code === cityCode);
            onSelectCity(cityCode, cityObj ? cityObj.description : '');
          }}
          className="w-full bg-white dark:bg-slate-950 border border-[#C0DDD6] dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#98C3BC] transition-all"
        >
          <option value="">-- Pilih Kota / Kab --</option>
          {cities.map((ct) => (
            <option key={ct.child_code} value={ct.child_code}>
              {ct.description}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
