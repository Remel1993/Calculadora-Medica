import { ArrowLeft, ArrowUpRight, BookOpen, Search, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { CALCULATOR_CATALOG } from '../../clinical-core/registries/catalog.ts';
import { SPECIALTIES, SPECIALTY_MAP } from '../../clinical-core/registries/specialties.ts';
import type { SpecialtyId } from '../../clinical-core/types/clinical.ts';
import { SPECIALTY_VISUALS } from '../registries/specialtyVisuals.tsx';

interface ReferencesViewProps {
  onBack: () => void;
  onSelectCalculator: (id: string) => void;
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export const ReferencesView: React.FC<ReferencesViewProps> = ({
  onBack,
  onSelectCalculator,
}) => {
  const [query, setQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState<SpecialtyId | 'all'>('all');

  const totalCitations = useMemo(
    () => CALCULATOR_CATALOG.reduce((sum, calc) => sum + calc.references.length, 0),
    [],
  );

  const filteredCalculators = useMemo(() => {
    const q = normalizeText(query);
    return CALCULATOR_CATALOG.filter((calc) => {
      if (
        specialtyFilter !== 'all' &&
        calc.primarySpecialty !== specialtyFilter &&
        !calc.secondarySpecialties.includes(specialtyFilter)
      ) {
        return false;
      }

      if (!q) return true;

      const haystack = normalizeText(
        [
          calc.name,
          calc.shortName,
          calc.version,
          calc.validatedPopulation,
          SPECIALTY_MAP[calc.primarySpecialty].name,
          ...calc.references.map((r) => `${r.citation} ${r.year} ${r.note ?? ''}`),
        ].join(' '),
      );

      return haystack.includes(q);
    });
  }, [query, specialtyFilter]);

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 sm:text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span>Volver al inicio</span>
        </button>

        <div className="font-mono text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400">
          {CALCULATOR_CATALOG.length} herramientas · {totalCitations} referencias
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:rounded-2xl sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
              Guías y referencias validadas
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
              Bibliografía clínica, versiones de escalas y guías de práctica médica que respaldan cada calculadora incluida en el catálogo offline.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-[1fr_240px]">
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-950">
            <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              placeholder="Buscar por escala, autor, guía o año..."
              aria-label="Buscar en bibliografía y guías"
              className="min-h-[42px] w-full min-w-0 bg-transparent px-2.5 py-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-sm dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Limpiar búsqueda bibliográfica"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value as SpecialtyId | 'all')}
            aria-label="Filtrar referencias por especialidad"
            className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-base font-medium text-slate-800 focus:border-sky-500 focus:outline-none sm:text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value="all">Todas las especialidades ({SPECIALTIES.length})</option>
            {SPECIALTIES.map((spec) => (
              <option key={spec.id} value={spec.id}>
                {spec.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Mostrando {filteredCalculators.length} de {CALCULATOR_CATALOG.length} herramientas
      </div>

      {filteredCalculators.length > 0 ? (
        <div className="space-y-3">
          {filteredCalculators.map((calc) => {
            const spec = SPECIALTY_MAP[calc.primarySpecialty];
            const visual = SPECIALTY_VISUALS[calc.primarySpecialty];
            return (
              <article
                key={calc.id}
                className="rounded-xl border border-slate-200 bg-white p-4 sm:rounded-2xl sm:p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${visual.badgeBgClass} ${visual.iconClass}`}
                    >
                      {visual.renderIcon('h-5 w-5')}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-sky-700 dark:text-sky-400">
                        {spec.name}
                      </div>
                      <h2 className="break-words text-sm font-bold text-slate-900 sm:text-base dark:text-slate-100">
                        {calc.name}
                      </h2>
                      <p className="mt-0.5 break-words text-xs text-slate-500 dark:text-slate-400">
                        Versión: {calc.version} · Población: {calc.validatedPopulation}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectCalculator(calc.id)}
                    className="inline-flex min-h-[38px] shrink-0 items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-sky-700 dark:hover:text-sky-300"
                  >
                    <span>Abrir cálculo</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <ul className="mt-3 select-text space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  {calc.references.map((ref, idx) => (
                    <li
                      key={`${calc.id}-ref-${idx}`}
                      className="text-xs leading-relaxed text-slate-700 sm:text-sm dark:text-slate-300"
                    >
                      <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                        [{ref.year}]
                      </span>{' '}
                      <span>{ref.citation}</span>
                      {ref.note && (
                        <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">
                          Nota: {ref.note}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            No se encontraron referencias para “{query}”.
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Prueba buscando por nombre de escala, sociedad científica (ADA, ESC, GINA, KDIGO, OMS) o año.
          </p>
        </div>
      )}
    </div>
  );
};
