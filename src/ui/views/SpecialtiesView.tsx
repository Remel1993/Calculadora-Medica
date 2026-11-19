import { ArrowLeft, FolderKanban } from 'lucide-react';
import React from 'react';
import { getCalculatorsBySpecialty } from '../../clinical-core/registries/catalog.ts';
import { SPECIALTIES, SPECIALTY_MAP } from '../../clinical-core/registries/specialties.ts';
import type { SpecialtyId } from '../../clinical-core/types/clinical.ts';
import { CalculatorCard } from '../components/CalculatorCard.tsx';
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
  if (selectedSpecialty) {
    const spec = SPECIALTY_MAP[selectedSpecialty];
    const visual = SPECIALTY_VISUALS[selectedSpecialty];
    const items = getCalculatorsBySpecialty(selectedSpecialty);

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
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${visual.badgeBgClass} ${visual.iconClass}`}
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
        </section>

        {items.length > 0 ? (
          <div className="grid min-w-0 gap-2.5 sm:gap-3 md:grid-cols-2">
            {items.map((calc) => (
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
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
            <FolderKanban className="mx-auto h-7 w-7 text-slate-400 dark:text-slate-500" />
            <h2 className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              Sin herramientas registradas en esta categoría
            </h2>
            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Explora otras especialidades clínicas o utiliza el buscador general en la pantalla de inicio.
            </p>
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
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${visual.badgeBgClass} ${visual.iconClass}`}
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
