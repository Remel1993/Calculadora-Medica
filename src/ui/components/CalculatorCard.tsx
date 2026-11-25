import { ChevronRight } from 'lucide-react';
import React from 'react';
import { SPECIALTY_MAP, SUBCATEGORY_LABELS } from '../../clinical-core/registries/specialties.ts';
import type { CalculatorDefinition } from '../../clinical-core/types/clinical.ts';
import { ClinicalStarIcon } from '../icons/clinicalUiIcons.tsx';

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
    <div className="group flex w-full min-w-0 items-stretch justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3.5 transition-colors hover:border-sky-300 sm:gap-3 sm:p-4 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-700">
      <button
        type="button"
        onClick={() => onSelect(calculator.id)}
        className="flex w-full min-w-0 flex-1 flex-col items-start text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
      >
        <div className="flex w-full min-w-0 items-center gap-1.5 text-[11px] text-slate-500 sm:gap-2 sm:text-xs dark:text-slate-400">
          <span className="shrink-0 font-medium text-sky-700 dark:text-sky-400">
            {primarySpec.name}
          </span>
          <span aria-hidden="true" className="shrink-0">·</span>
          <span className="min-w-0 truncate">{subcategoryLabel}</span>
        </div>

        <h3 className="mt-1 w-full break-words text-sm font-semibold leading-snug text-slate-900 group-hover:text-sky-700 sm:mt-1.5 sm:text-base dark:text-slate-100 dark:group-hover:text-sky-400">
          {calculator.name}
        </h3>

        <p className="mt-1 w-full line-clamp-2 break-words text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
          {calculator.description}
        </p>

        <div className="mt-2 w-full min-w-0 text-[11px] font-medium text-slate-500 sm:mt-3 sm:text-xs dark:text-slate-400">
          <span className="line-clamp-2 break-words">{calculator.validatedPopulation}</span>
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
          <ClinicalStarIcon
            filled={isFavorite}
            className={`h-[18px] w-[18px] ${isFavorite ? 'text-amber-500 dark:text-amber-400' : ''}`}
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
