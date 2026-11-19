import { History, Trash2 } from 'lucide-react';
import React from 'react';
import type { HistoryEntry } from '../../storage/localStore.ts';

interface HistoryViewProps {
  history: HistoryEntry[];
  onOpenCalculator: (id: string) => void;
  onRemoveEntry: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onOpenCalculator,
  onRemoveEntry,
  onClearAll,
}) => {
  const formatTimestamp = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('es-ES', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
            Historial local de cálculos
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
            Guardado únicamente en este dispositivo. No almacena nombres ni identificadores de pacientes.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-rose-950/30 whitespace-nowrap"
          >
            <Trash2 className="h-4 w-4" />
            <span>Borrar historial</span>
          </button>
        )}
      </div>

      {history.length > 0 ? (
        <div className="space-y-2.5 sm:space-y-3">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="flex w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3.5 sm:gap-3 sm:p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <button
                type="button"
                onClick={() => onOpenCalculator(entry.calculatorId)}
                className="w-full min-w-0 flex-1 text-left"
              >
                <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500 sm:text-xs dark:text-slate-400">
                  <span className="font-mono tabular-nums">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-sky-700 dark:text-sky-400">
                    {entry.calculatorName}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="font-mono text-base font-bold tabular-nums text-slate-900 break-words sm:text-lg dark:text-slate-100">
                    {entry.resultText}
                  </span>
                  <span className="break-words text-xs font-medium text-slate-600 dark:text-slate-300">
                    — {entry.riskClassification}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 break-words text-xs text-slate-500 dark:text-slate-400">
                  {entry.inputsSummary}
                </p>
              </button>

              <button
                type="button"
                onClick={() => onRemoveEntry(entry.id)}
                aria-label={`Eliminar registro de ${entry.calculatorName}`}
                className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-rose-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <History className="mx-auto h-7 w-7 text-slate-400 dark:text-slate-500" />
          <h2 className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            Sin cálculos recientes
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Cada cálculo completado se registrará aquí localmente para consulta rápida durante la guardia o consulta.
          </p>
        </div>
      )}
    </div>
  );
};
