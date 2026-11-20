import React, { useState } from 'react';
import { User, Check, Camera, RefreshCw } from 'lucide-react';

// Modest hijab photos for women (Muslimah with hijab)
export const HIJAB_PHOTOS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', // Professional modern hijab
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80', // Smiling woman in hijab
  'https://images.unsplash.com/photo-1584999734482-0311a23880b9?auto=format&fit=crop&w=300&q=80', // Soft pastel hijab
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80', // Formal navy hijab
  'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?auto=format&fit=crop&w=300&q=80', // Emerald tone hijab
  'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=300&q=80', // Casual hijab
];

// High quality portraits for men
export const MALE_PHOTOS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', // Executive gentleman
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', // Smiling professional
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80', // Senior leader / KH
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80', // Young sales agent
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80', // Muthawif / religious scholar
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80', // Branch manager
];

/**
 * Deterministic helper to get a realistic photo for a person based on their name & gender.
 * For Perempuan ('P'), it ALWAYS guarantees a photo of a woman wearing a hijab.
 */
export function getPersonPhoto(
  name: string = 'User',
  gender: 'L' | 'P' = 'L',
  customUrl?: string
): string {
  if (customUrl && customUrl.trim().length > 5) {
    return customUrl;
  }

  // Hash the name string to pick consistently from the pool
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash);

  if (gender === 'P') {
    return HIJAB_PHOTOS[index % HIJAB_PHOTOS.length];
  }
  return MALE_PHOTOS[index % MALE_PHOTOS.length];
}

interface PersonAvatarProps {
  name: string;
  gender?: 'L' | 'P';
  photoUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showGenderBadge?: boolean;
  className?: string;
}

export const PersonAvatar: React.FC<PersonAvatarProps> = ({
  name,
  gender = 'L',
  photoUrl,
  size = 'md',
  showGenderBadge = false,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const effectivePhoto = getPersonPhoto(name, gender, photoUrl);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  }[size];

  const badgeSizeClasses = {
    xs: 'w-2.5 h-2.5 text-[8px]',
    sm: 'w-3.5 h-3.5 text-[9px]',
    md: 'w-4 h-4 text-[10px]',
    lg: 'w-5 h-5 text-xs',
    xl: 'w-6 h-6 text-sm',
  }[size];

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || 'U';

  const isFemale = gender === 'P';

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        className={`${sizeClasses} rounded-full overflow-hidden ring-2 ${
          isFemale
            ? 'ring-emerald-400 dark:ring-emerald-500'
            : 'ring-blue-400 dark:ring-blue-500'
        } bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all`}
        title={`${name} (${isFemale ? 'Perempuan - Berjilbab' : 'Laki-laki'})`}
      >
        {!imgError ? (
          <img
            src={effectivePhoto}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {showGenderBadge && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${badgeSizeClasses} rounded-full flex items-center justify-center font-black shadow-md border-2 border-white dark:border-slate-900 ${
            isFemale
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-600 text-white'
          }`}
          title={isFemale ? 'Perempuan (Berjilbab)' : 'Laki-laki'}
        >
          {isFemale ? '♀' : '♂'}
        </span>
      )}
    </div>
  );
};

export const GenderBadge: React.FC<{ gender?: 'L' | 'P'; withHijabNotice?: boolean }> = ({
  gender = 'L',
  withHijabNotice = true,
}) => {
  const isFemale = gender === 'P';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
        isFemale
          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
          : 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700'
      }`}
    >
      <span className="font-bold text-xs">{isFemale ? '♀' : '♂'}</span>
      <span>{isFemale ? (withHijabNotice ? 'Perempuan (Berjilbab)' : 'Perempuan') : 'Laki-laki'}</span>
    </span>
  );
};

interface GenderPhotoSelectorProps {
  gender: 'L' | 'P';
  onGenderChange: (newGender: 'L' | 'P') => void;
  photoUrl: string;
  onPhotoChange: (newUrl: string) => void;
  personName?: string;
  label?: string;
}

export const GenderPhotoSelector: React.FC<GenderPhotoSelectorProps> = ({
  gender,
  onGenderChange,
  photoUrl,
  onPhotoChange,
  personName = 'Pengguna',
  label = 'Jenis Kelamin & Foto Profil',
}) => {
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const isFemale = gender === 'P';
  const photoOptions = isFemale ? HIJAB_PHOTOS : MALE_PHOTOS;

  const handleGenderSwitch = (nextGender: 'L' | 'P') => {
    onGenderChange(nextGender);
    // Automatically switch default photo to match the new gender
    const defaultPhotoForGender = getPersonPhoto(personName, nextGender);
    onPhotoChange(defaultPhotoForGender);
  };

  return (
    <div className="space-y-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label} <span className="text-rose-500">*</span>
        </label>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {isFemale ? 'Foto Otomatis Berjilbab' : 'Foto Resmi Laki-laki'}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Gender Segmented Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => handleGenderSwitch('L')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              gender === 'L'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>♂</span>
            <span>Laki-laki</span>
          </button>

          <button
            type="button"
            onClick={() => handleGenderSwitch('P')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              gender === 'P'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>♀</span>
            <span>Perempuan (Berjilbab)</span>
          </button>
        </div>

        {/* Current Photo Preview & Quick Select Button */}
        <div className="flex items-center gap-2.5">
          <PersonAvatar
            name={personName}
            gender={gender}
            photoUrl={photoUrl}
            size="md"
            showGenderBadge={true}
          />

          <button
            type="button"
            onClick={() => setShowPhotoPicker(!showPhotoPicker)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Pilih Foto ({isFemale ? 'Koleksi Jilbab' : 'Koleksi Pria'})</span>
          </button>
        </div>
      </div>

      {/* Expanded Photo Picker Grid */}
      {showPhotoPicker && (
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2 animate-fadeIn">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Pilih dari foto resmi {isFemale ? 'Muslimah Berjilbab' : 'Laki-laki'} atau masukkan URL foto:
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            {photoOptions.map((optUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onPhotoChange(optUrl);
                  setShowPhotoPicker(false);
                }}
                className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all hover:scale-105 ${
                  (photoUrl || getPersonPhoto(personName, gender)) === optUrl
                    ? 'border-emerald-500 ring-2 ring-emerald-400/50 scale-105'
                    : 'border-transparent opacity-80 hover:opacity-100'
                }`}
              >
                <img src={optUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                {(photoUrl || getPersonPhoto(personName, gender)) === optUrl && (
                  <span className="absolute inset-0 bg-emerald-600/40 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="pt-1">
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => onPhotoChange(e.target.value)}
              placeholder="Atau tempel URL foto kustom (https://...)"
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
