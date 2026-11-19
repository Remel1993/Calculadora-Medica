import { LogOut, X } from 'lucide-react';
import React, { useEffect } from 'react';

interface ExitConfirmModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirmExit: () => void;
}

export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
  open,
  onCancel,
  onConfirmExit,
}) => {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-confirm-title"
      aria-describedby="exit-confirm-description"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/pwa-192x192.png"
              alt="Calculadora Médica Integral"
              className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 object-cover shadow-xs dark:border-slate-700"
            />
            <div className="min-w-0">
              <h2
                id="exit-confirm-title"
                className="text-base font-bold leading-snug text-slate-900 dark:text-slate-100"
              >
                ¿Deseas salir de la aplicación?
              </h2>
              <p className="text-[11px] font-medium text-sky-700 dark:text-sky-400">
                Calculadora Médica Integral
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Cerrar diálogo"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p
          id="exit-confirm-description"
          className="mt-3 text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300"
        >
          Tus favoritos y el historial clínico local permanecerán guardados de forma segura en este dispositivo.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            No, continuar
          </button>
          <button
            type="button"
            onClick={onConfirmExit}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Sí, salir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
