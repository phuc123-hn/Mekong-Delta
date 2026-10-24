'use client';

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

export function Spinner({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <span
      role="status"
      aria-label="Đang tải"
      style={{ width: size, height: size }}
      className={`inline-block animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400 ${className}`}
    />
  );
}

export function LoadingBlock({ label = 'Đang tải dữ liệu...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
      <Spinner />
      <span className="text-sm">{label}</span>
    </div>
  );
}

const ALERT_STYLE = {
  error: 'border-red-500/40 bg-red-500/10 text-red-200',
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  warning: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-100',
  info: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-100',
} as const;

export function Alert({ kind = 'info', title, children, action }: { kind?: keyof typeof ALERT_STYLE; title?: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-4 py-3 text-sm ${ALERT_STYLE[kind]}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {title && <p className="font-semibold">{title}</p>}
          {children && <div className={title ? 'mt-1 leading-relaxed opacity-90' : 'leading-relaxed'}>{children}</div>}
        </div>
        {action}
      </div>
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-700 px-6 py-12 text-center">
      <p className="text-base font-semibold text-slate-200">{title}</p>
      {children && <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">{children}</p>}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-sub">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

/** Thông báo nổi tự tắt sau vài giây */
export function useToast() {
  const [toast, setToast] = useState<{ text: string; kind: 'success' | 'error' | 'info' } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const show = useCallback((text: string, kind: 'success' | 'error' | 'info' = 'success', ms = 4000) => {
    clearTimeout(timer.current);
    setToast({ text, kind });
    timer.current = setTimeout(() => setToast(null), ms);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const node = toast ? (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-[2000] flex justify-center px-4">
      <div className={`pointer-events-auto max-w-md rounded-lg border px-4 py-3 text-sm shadow-xl ${ALERT_STYLE[toast.kind === 'error' ? 'error' : toast.kind === 'info' ? 'info' : 'success']} bg-slate-900`}>
        {toast.text}
      </div>
    </div>
  ) : null;

  return { toast: node, show };
}

export function Modal({ open, title, onClose, children, footer, wide }: { open: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className={`relative flex max-h-[90vh] w-full flex-col rounded-xl border border-slate-700 bg-slate-900 shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="btn btn-ghost px-3 py-1" aria-label="Đóng">
            Đóng
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-3 border-t border-slate-800 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
