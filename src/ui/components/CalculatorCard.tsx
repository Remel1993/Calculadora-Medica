import { ChevronRight, Star } from 'lucide-react';
import React from 'react';
import { SPECIALTY_MAP, SUBCATEGORY_LABELS } from '../../clinical-core/registries/specialties.ts';
import type { CalculatorDefinition } from '../../clinical-core/types/clinical.ts';

interface CalculatorCardProps {
  calculator: CalculatorDefinition;
  isFavorite: boolean;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const CalculatorCard: React.FC<CalculatorCardProps> = ({
  calculator,
  isFavorite,
  onSelect,
  onToggleFavorite,
}) => {
  const primarySpec = SPECIALTY_MAP[calculator.primarySpecialty];
  const subcategoryLabel = SUBCATEGORY_LABELS[calculator.subcategory];

  return (
    <div className="group flex items-stretch justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-700">
      <button
        type="button"
        onClick={() => onSelect(calculator.id)}
        className="flex min-w-0 flex-1 flex-col items-start text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
      >
        <div className="flex w-full items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium text-sky-700 dark:text-sky-400">
            {primarySpec.name}
          </span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{subcategoryLabel}</span>
        </div>

        <h3 className="mt-1.5 text-base font-semibold leading-snug text-slate-900 group-hover:text-sky-700 dark:text-slate-100 dark:group-hover:text-sky-400">
          {calculator.name}
        </h3>

        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {calculator.description}
        </p>

        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>{calculator.validatedPopulation}</span>
        </div>
      </button>

      <div className="flex shrink-0 flex-col items-end justify-between">
        <button
          type="button"
          onClick={() => onToggleFavorite(calculator.id)}
          aria-label={
            isFavorite
              ? `Quitar ${calculator.shortName} de favoritos`
              : `Agregar ${calculator.shortName} a favoritos`
          }
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-amber-500 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-amber-400"
        >
          <Star
            className={`h-4 w-4 ${isFavorite ? 'fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400' : ''}`}
          />
        </button>

        <button
          type="button"
          onClick={() => onSelect(calculator.id)}
          aria-label={`Abrir ${calculator.name}`}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-400 transition-colors group-hover:text-sky-600 dark:text-slate-500 dark:group-hover:text-sky-400"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
