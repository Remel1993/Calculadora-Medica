import { ArrowLeft, FolderKanban } from 'lucide-react';
import React from 'react';
import { getCalculatorsBySpecialty } from '../../clinical-core/registries/catalog.ts';
import { SPECIALTIES, SPECIALTY_MAP } from '../../clinical-core/registries/specialties.ts';
import type { SpecialtyId } from '../../clinical-core/types/clinical.ts';
import { CalculatorCard } from '../components/CalculatorCard.tsx';

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
    const items = getCalculatorsBySpecialty(selectedSpecialty);

    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => onSelectSpecialty(null)}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Todas las especialidades</span>
        </button>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {spec.name}
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
            {spec.description}
          </p>
        </section>

        {items.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Especialidades clínicas
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Organización modular sin duplicación: las escalas transversales aparecen en todas sus especialidades pertinentes.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SPECIALTIES.map((spec) => {
          const count = getCalculatorsBySpecialty(spec.id).length;
          return (
            <button
              key={spec.id}
              type="button"
              onClick={() => onSelectSpecialty(spec.id)}
              className="flex min-h-[120px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left transition-colors hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-700"
            >
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {spec.name}
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {spec.description}
                </p>
              </div>
              <div className="mt-4 font-mono text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400">
                {`${count} ${count === 1 ? 'herramienta activa' : 'herramientas activas'}`}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
