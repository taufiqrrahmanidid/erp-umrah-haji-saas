import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  badge?: React.ReactNode;
}

export const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  subtitle,
  icon: Icon,
  headerRight,
  children,
  defaultOpen = true,
  className = '',
  badge,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 shadow-sm overflow-hidden bg-white dark:bg-slate-900 border-[#C0DDD6] dark:border-slate-800 ${className}`}
    >
      <div
        className="px-5 py-4 flex items-center justify-between cursor-pointer select-none transition-colors border-b border-transparent data-[open=true]:border-[#C0DDD6] dark:data-[open=true]:border-slate-800 bg-[#F4F8F7]/60 dark:bg-slate-900 hover:bg-[#EBF5F3] dark:hover:bg-slate-850"
        data-open={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 truncate">
          {Icon && (
            <div className="p-2 rounded-xl bg-[#C0DDD6]/40 dark:bg-emerald-950/60 text-[#1E4E46] dark:text-emerald-400 border border-[#98C3BC]/50 dark:border-emerald-800 shrink-0">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div className="truncate">
            <div className="flex items-center gap-2 truncate">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight truncate">
                {title}
              </h3>
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {headerRight}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title={isOpen ? 'Ciutkan Panel (Collapse)' : 'Bentangkan Panel (Expand)'}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && <div className="p-5 animate-fadeIn">{children}</div>}
    </div>
  );
};
