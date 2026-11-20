import React, { useState, useRef, useCallback } from 'react';

/**
 * Hook to manage Excel-like resizable table columns.
 * Allows dragging column border handles to expand or shrink width dynamically.
 */
export function useResizableColumns<T extends string>(initialWidths: Record<T, number>) {
  const [widths, setWidths] = useState<Record<T, number>>(initialWidths);
  const activeColRef = useRef<T | null>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const startResize = useCallback(
    (col: T, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      activeColRef.current = col;
      startXRef.current = e.clientX;
      startWidthRef.current = widths[col] || 120;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!activeColRef.current) return;
        const delta = moveEvent.clientX - startXRef.current;
        const newWidth = Math.max(50, startWidthRef.current + delta);
        setWidths((prev) => ({
          ...prev,
          [activeColRef.current!]: newWidth,
        }));
      };

      const handleMouseUp = () => {
        activeColRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [widths]
  );

  return { widths, setWidths, startResize };
}

interface ResizableThProps {
  width?: number;
  onResize?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const ResizableTh: React.FC<ResizableThProps> = ({
  width,
  onResize,
  children,
  className = '',
  align = 'left',
}) => {
  const alignClass =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  return (
    <th
      style={width ? { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` } : undefined}
      className={`relative px-3.5 py-3 text-xs font-bold select-none group ${alignClass} ${className}`}
    >
      <div className="truncate flex items-center justify-between gap-1">
        <span className="truncate">{children}</span>
      </div>
      {onResize && (
        <div
          onMouseDown={onResize}
          title="Geser untuk memperlebar / memperkecil kolom (Excel Resize)"
          className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity z-10"
        >
          <div className="w-0.5 h-full bg-[#98C3BC] dark:bg-emerald-500 hover:w-1 hover:bg-emerald-400" />
        </div>
      )}
    </th>
  );
};
