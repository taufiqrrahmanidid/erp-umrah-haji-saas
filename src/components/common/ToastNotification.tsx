import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastData {
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
}

interface ToastNotificationProps {
  toast: ToastData | null;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-600/60 bg-emerald-950/90 text-emerald-100',
    warning: 'border-amber-600/60 bg-amber-950/90 text-amber-100',
    error: 'border-rose-600/60 bg-rose-950/90 text-rose-100',
    info: 'border-cyan-600/60 bg-cyan-950/90 text-cyan-100',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div
        className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start gap-3 ${
          borders[toast.type]
        }`}
      >
        {icons[toast.type]}
        <div className="flex-1 text-xs">
          {toast.title && <p className="font-bold text-sm mb-0.5">{toast.title}</p>}
          <p className="leading-snug opacity-95">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/20 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
