import { Star } from 'lucide-react';
import React from 'react';
import {
  CALCULATOR_BY_ID,
  compareCalculatorsAlphabetically,
} from '../../clinical-core/registries/catalog.ts';
import { CalculatorCard } from '../components/CalculatorCard.tsx';

interface FavoritesViewProps {
  favorites: string[];
  onSelectCalculator: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onGoHome: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  onSelectCalculator,
  onToggleFavorite,
  onGoHome,
}) => {
  const items = favorites
    .map((id) => CALCULATOR_BY_ID[id])
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort(compareCalculatorsAlphabetically);

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
          Calculadoras favoritas
        </h1>
        <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
          Acceso directo guardado localmente en tu dispositivo.
        </p>
      </div>

      {items.length > 0 ? (
        <div className="grid min-w-0 gap-2.5 sm:gap-3 md:grid-cols-2">
          {items.map((calc) => (
            <CalculatorCard
              key={calc.id}
              calculator={calc}
              isFavorite={true}
              onSelect={onSelectCalculator}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <Star className="mx-auto h-7 w-7 text-slate-400 dark:text-slate-500" />
          <h2 className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            Aún no tienes favoritos
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Pulsa el ícono de estrella en cualquier calculadora o escala para fijarla aquí y acceder en un toque durante la consulta.
          </p>
          <button
            type="button"
            onClick={onGoHome}
            className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            Explorar calculadoras
          </button>
        </div>
      )}
    </div>
  );
};
