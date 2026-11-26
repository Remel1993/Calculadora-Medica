import React, { useMemo, useState } from 'react';
import { extractAcronymsFromText } from '../../clinical-core/registries/clinicalGlossary.ts';

interface AcronymLegendProps {
  /** Combined visible text from the active calculator, output, or reference table */
  sourceText: string;
  /** Optional className override */
  className?: string;
  /** Maximum items shown before optional expand toggle (default 10) */
  initialLimit?: number;
}

export const AcronymLegend: React.FC<AcronymLegendProps> = ({
  sourceText,
  className = '',
  initialLimit = 10,
}) => {
  const [expanded, setExpanded] = useState(false);

  const items = useMemo(() => extractAcronymsFromText(sourceText), [sourceText]);

  if (items.length === 0) {
    return null;
  }

  const hasOverflow = items.length > initialLimit;
  const visibleItems = expanded || !hasOverflow ? items : items.slice(0, initialLimit);

  return (
    <aside
      aria-label="Leyenda de siglas médicas"
      className={`rounded-xl border border-slate-200/80 bg-slate-50/75 px-3 py-2.5 text-[11px] leading-relaxed text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          Leyenda de siglas ({items.length})
        </span>
        {hasOverflow && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="font-medium text-sky-700 hover:underline dark:text-sky-400"
          >
            {expanded ? 'Ver menos' : `Ver todas (${items.length})`}
          </button>
        )}
      </div>

      <dl className="mt-1.5 flex flex-wrap gap-x-3.5 gap-y-1">
        {visibleItems.map((entry) => (
          <div key={entry.sigla} className="inline-flex min-w-0 max-w-full flex-wrap items-baseline gap-1">
            <dt className="font-mono font-semibold text-slate-700 dark:text-slate-200">
              {entry.sigla}:
            </dt>
            <dd className="break-words">{entry.significado}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
};
