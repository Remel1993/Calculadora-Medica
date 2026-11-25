import { ArrowLeft, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import {
  getCalculatorsBySpecialty,
  searchCalculatorsInSpecialty,
} from '../../clinical-core/registries/catalog.ts';
import { SPECIALTIES, SPECIALTY_MAP } from '../../clinical-core/registries/specialties.ts';
import type { SpecialtyId } from '../../clinical-core/types/clinical.ts';
import { CalculatorCard } from '../components/CalculatorCard.tsx';
import { ClinicalFolderIcon, ClinicalSearchIcon } from '../icons/clinicalUiIcons.tsx';
import { SPECIALTY_VISUALS } from '../registries/specialtyVisuals.tsx';

interface SpecialtiesViewProps {
  selectedSpecialty: SpecialtyId | null;
  favorites: string[];
  onSelectSpecialty: (id: SpecialtyId | null) => void;
  onSelectCalculator: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const SpecialtiesView: React.FC<SpecialtiesViewProps> = ({
  selectedSpecialty,
  favorites,
  onSelectSpecialty,
  onSelectCalculator,
  onToggleFavorite,
}) => {
  const [specialtyQuery, setSpecialtyQuery] = useState('');

  useEffect(() => {
    setSpecialtyQuery('');
  }, [selectedSpecialty]);

  const items = useMemo(
    () => (selectedSpecialty ? getCalculatorsBySpecialty(selectedSpecialty) : []),
    [selectedSpecialty],
  );

  const filteredItems = useMemo(
    () =>
      selectedSpecialty
        ? searchCalculatorsInSpecialty(selectedSpecialty, specialtyQuery)
        : [],
    [selectedSpecialty, specialtyQuery],
  );

  if (selectedSpecialty) {
    const spec = SPECIALTY_MAP[selectedSpecialty];
    const visual = SPECIALTY_VISUALS[selectedSpecialty];
    const hasQuery = specialtyQuery.trim().length > 0;

    return (
      <div className="w-full min-w-0 space-y-4 sm:space-y-6">
        <button
          type="button"
          onClick={() => onSelectSpecialty(null)}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 sm:text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span>Todas las especialidades</span>
        </button>

        <section className="w-full min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:rounded-2xl sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-3.5">
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ring-black/5 dark:ring-white/10 ${visual.badgeBgClass} ${visual.iconClass}`}
            >
              {visual.renderIcon('h-7 w-7')}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="break-words text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
                {spec.name}
              </h1>
              <p className="mt-1 break-words text-xs leading-relaxed text-slate-600 sm:mt-1.5 sm:text-sm dark:text-slate-300">
                {spec.description}
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-3.5 dark:border-slate-800">
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 transition-colors focus-within:border-sky-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-600/20 dark:border-slate-700 dark:bg-slate-950 dark:focus-within:border-sky-500 dark:focus-within:bg-slate-900">
                <ClinicalSearchIcon className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                <input
                  type="search"
                  enterKeyHint="search"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={specialtyQuery}
                  onChange={(e) => setSpecialtyQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  placeholder={`Buscar solo en ${spec.name}...`}
                  aria-label={`Buscar herramientas dentro de ${spec.name}`}
                  className="min-h-[44px] w-full min-w-0 bg-transparent px-2.5 py-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-sm dark:text-slate-100 dark:placeholder:text-slate-500"
                />
                {specialtyQuery && (
                  <button
                    type="button"
                    onClick={() => setSpecialtyQuery('')}
                    aria-label="Limpiar búsqueda en especialidad"
                    className="inline-flex min-h-[34px] min-w-[34px] shrink-0 items-center justify-center rounded-lg bg-slate-200/80 text-slate-600 hover:bg-slate-300/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span>
                  {hasQuery
                    ? `${filteredItems.length} de ${items.length} ${items.length === 1 ? 'herramienta' : 'herramientas'} en ${spec.shortName}`
                    : `${items.length} ${items.length === 1 ? 'herramienta disponible' : 'herramientas disponibles'} en esta especialidad`}
                </span>
                {hasQuery && (
                  <button
                    type="button"
                    onClick={() => setSpecialtyQuery('')}
                    className="font-semibold text-sky-700 hover:underline dark:text-sky-400"
                  >
                    Mostrar todas
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 ring-1 ring-slate-200/80 dark:bg-slate-800/80 dark:text-slate-400 dark:ring-slate-700">
              <ClinicalFolderIcon className="h-6 w-6" />
            </span>
            <h2 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">
              Sin herramientas registradas en esta categoría
            </h2>
            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Explora otras especialidades clínicas o utiliza el buscador general en la pantalla de inicio.
            </p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid min-w-0 gap-2.5 sm:gap-3 md:grid-cols-2">
            {filteredItems.map((calc) => (
              <CalculatorCard
                key={calc.id}
                calculator={calc}
                isFavorite={favorites.includes(calc.id)}
                onSelect={onSelectCalculator}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center sm:p-8 dark:border-slate-800 dark:bg-slate-900">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-200/80 dark:bg-sky-950/60 dark:text-sky-400 dark:ring-sky-800/60">
              <ClinicalSearchIcon className="h-6 w-6" />
            </span>
            <h2 className="mt-3 break-words text-sm font-semibold text-slate-900 sm:text-base dark:text-slate-100">
              Sin coincidencias en {spec.name} para “{specialtyQuery}”
            </h2>
            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Este buscador muestra únicamente herramientas pertenecientes a {spec.name}. Para buscar escalas de otras áreas, utiliza el buscador general en Inicio.
            </p>
            <button
              type="button"
              onClick={() => setSpecialtyQuery('')}
              className="mt-4 inline-flex min-h-[40px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Limpiar búsqueda
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
          Especialidades clínicas
        </h1>
        <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
          Organización modular sin duplicación: las escalas transversales aparecen en todas sus especialidades pertinentes.
        </p>
      </div>

      <div className="grid min-w-0 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
        {SPECIALTIES.map((spec) => {
          const count = getCalculatorsBySpecialty(spec.id).length;
          const visual = SPECIALTY_VISUALS[spec.id];
          return (
            <button
              key={spec.id}
              type="button"
              onClick={() => onSelectSpecialty(spec.id)}
              className="flex min-h-[104px] w-full min-w-0 flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-sky-300 sm:min-h-[126px] sm:rounded-2xl sm:p-5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-700"
            >
              <div className="flex w-full min-w-0 items-start gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/5 dark:ring-white/10 ${visual.badgeBgClass} ${visual.iconClass}`}
                >
                  {visual.renderIcon('h-6 w-6')}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="break-words text-sm font-semibold text-slate-900 sm:text-base dark:text-slate-100">
                    {spec.name}
                  </h2>
                  <p className="mt-1 break-words text-xs leading-relaxed text-slate-600 sm:mt-1.5 dark:text-slate-400">
                    {spec.description}
                  </p>
                </div>
              </div>
              <div className="mt-3 font-mono text-xs font-medium tabular-nums text-slate-500 sm:mt-4 dark:text-slate-400">
                {`${count} ${count === 1 ? 'herramienta activa' : 'herramientas activas'}`}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
