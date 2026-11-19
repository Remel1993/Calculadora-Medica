import { Search, Star, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
  CALCULATOR_BY_ID,
  CALCULATOR_CATALOG,
  getCalculatorsBySpecialty,
  searchCalculators,
} from '../../clinical-core/registries/catalog.ts';
import { SPECIALTIES } from '../../clinical-core/registries/specialties.ts';
import type { SpecialtyId } from '../../clinical-core/types/clinical.ts';
import { CalculatorCard } from '../components/CalculatorCard.tsx';
import { PWAInstallButton } from '../components/PWAControls.tsx';

interface HomeViewProps {
  favorites: string[];
  onSelectCalculator: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSelectSpecialty: (id: SpecialtyId) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  favorites,
  onSelectCalculator,
  onToggleFavorite,
  onSelectSpecialty,
}) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchCalculators(query), [query]);

  const favoriteCalculators = useMemo(
    () =>
      favorites
        .map((id) => CALCULATOR_BY_ID[id])
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [favorites],
  );

  const activeSpecialties = useMemo(
    () =>
      SPECIALTIES.filter((spec) => getCalculatorsBySpecialty(spec.id).length > 0),
    [],
  );

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
              Consulta clínica rápida y sin conexión
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Busca calculadoras, escalas validadas o acrónimos clínicos. Todos los cálculos se ejecutan localmente en tu dispositivo.
            </p>
          </div>
          <div className="shrink-0">
            <PWAInstallButton />
          </div>
        </div>

        <div className="relative mt-5">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, acrónimo o condición (ej. IMC, TFGe, Anion Gap, neumonía)..."
            aria-label="Buscar calculadoras médicas"
            className="min-h-[50px] w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pr-12 pl-12 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-500 dark:focus:bg-slate-900"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Limpiar búsqueda"
              className="absolute top-1/2 right-2 inline-flex min-h-[40px] min-w-[40px] -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </section>

      {/* Favorites Quick Access (when not searching) */}
      {!query && favoriteCalculators.length > 0 && (
        <section aria-labelledby="favorites-quick-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2
              id="favorites-quick-heading"
              className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span>Tus favoritos</span>
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {favoriteCalculators.map((calc) => (
              <CalculatorCard
                key={calc.id}
                calculator={calc}
                isFavorite={true}
                onSelect={onSelectCalculator}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </section>
      )}

      {/* Search Results / Pilot Catalog */}
      <section aria-labelledby="catalog-heading" className="space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <h2
            id="catalog-heading"
            className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            {query
              ? `Resultados de búsqueda (${results.length})`
              : `Catálogo clínico disponible (${CALCULATOR_CATALOG.length})`}
          </h2>
        </div>

        {results.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {results.map((calc) => (
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
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              No se encontraron herramientas para “{query}”.
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Prueba con términos como IMC, CKD-EPI, creatinina, Anion Gap o CURB-65.
            </p>
          </div>
        )}
      </section>

      {/* Active Specialties Shortcut */}
      {!query && (
        <section aria-labelledby="active-specs-heading" className="space-y-3">
          <h2
            id="active-specs-heading"
            className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Especialidades con herramientas activas
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {activeSpecialties.map((spec) => {
              const count = getCalculatorsBySpecialty(spec.id).length;
              return (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => onSelectSpecialty(spec.id)}
                  className="flex min-h-[72px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-700"
                >
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {spec.name}
                  </span>
                  <span className="mt-1 font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                    {count} {count === 1 ? 'herramienta' : 'herramientas'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
