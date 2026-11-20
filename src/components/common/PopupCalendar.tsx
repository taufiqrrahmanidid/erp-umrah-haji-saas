import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface PopupCalendarProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const PopupCalendar: React.FC<PopupCalendarProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Pilih Tanggal...',
  className = '',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date or default to current date
  const parsed = value ? new Date(value) : new Date();
  const validDate = isNaN(parsed.getTime()) ? new Date() : parsed;

  const [currentYear, setCurrentYear] = useState(validDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(validDate.getMonth()); // 0-11

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
      }
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSetToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  // Format value to Indonesian localized string
  const displayFormatted = value
    ? (() => {
        const d = new Date(value);
        if (isNaN(d.getTime())) return value;
        return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      })()
    : '';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Input trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium border bg-white dark:bg-slate-950 border-[#C0DDD6] dark:border-slate-800 text-slate-800 dark:text-white hover:border-[#98C3BC] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#98C3BC]"
      >
        <span className={displayFormatted ? 'font-semibold' : 'text-slate-400'}>
          {displayFormatted || placeholder}
        </span>
        <CalendarIcon className="w-4 h-4 text-[#2E6B60] dark:text-emerald-400 shrink-0" />
      </button>

      {/* Popup Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1.5 w-72 rounded-2xl p-3.5 shadow-2xl border bg-white dark:bg-slate-900 border-[#98C3BC] dark:border-slate-700 text-slate-800 dark:text-white animate-fadeIn">
          {/* Header Month / Year controls */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[#C0DDD6]/60 dark:border-slate-800">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-[#F4F8F7] dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 font-bold text-xs">
              <span className="text-[#1E4E46] dark:text-emerald-400">
                {monthNames[currentMonth]}
              </span>
              <span>{currentYear}</span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-[#F4F8F7] dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1">
            {daysOfWeek.map((d) => (
              <div key={d} className="py-0.5">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-xs">
            {/* Empty slots for offset */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="p-1" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const formattedMonth = String(currentMonth + 1).padStart(2, '0');
              const formattedDay = String(day).padStart(2, '0');
              const currentStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
              const isSelected = value === currentStr;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`p-1.5 rounded-lg text-center font-medium transition-all ${
                    isSelected
                      ? 'bg-[#98C3BC] dark:bg-emerald-600 text-[#13302B] dark:text-white font-bold shadow-sm'
                      : 'hover:bg-[#EBF5F3] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer quick action */}
          <div className="mt-3 pt-2 border-t border-[#C0DDD6]/60 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={handleSetToday}
              className="font-bold text-[#1E4E46] dark:text-emerald-400 hover:underline"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
