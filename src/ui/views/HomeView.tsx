import {
  Activity,
  ArrowRight,
  Baby,
  BookOpen,
  Brain,
  Calculator,
  ChevronRight,
  Droplets,
  Heart,
  History,
  LayoutGrid,
  Menu,
  Moon,
  Search,
  Star,
  Stethoscope,
  Sun,
  Wind,
  X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
  CALCULATOR_BY_ID,
  CALCULATOR_CATALOG,
  searchCalculators,
} from '../../clinical-core/registries/catalog.ts';
import { SPECIALTIES } from '../../clinical-core/registries/specialties.ts';
import type { SpecialtyId } from '../../clinical-core/types/clinical.ts';
import type { HistoryEntry, ThemeMode } from '../../storage/localStore.ts';
import { CalculatorCard } from '../components/CalculatorCard.tsx';
import { PWAInstallButton } from '../components/PWAControls.tsx';
import {
  HOME_SPECIALTY_ORDER,
  SPECIALTY_VISUALS,
} from '../registries/specialtyVisuals.tsx';

type NavTab = 'inicio' | 'especialidades' | 'favoritos' | 'historial';

interface HomeViewProps {
  favorites: string[];
  history: HistoryEntry[];
  theme: ThemeMode;
  onToggleTheme: () => void;
  onSelectCalculator: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSelectSpecialty: (id: SpecialtyId | null) => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenReferences: () => void;
}

function formatRelativeTimeEs(isoTimestamp: string): string {
  const diffMs = Date.now() - new Date(isoTimestamp).getTime();
  if (!Number.isFinite(diffMs) || diffMs < 0) return 'reciente';
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export const HomeView: React.FC<HomeViewProps> = ({
  favorites,
  history,
  theme,
  onToggleTheme,
  onSelectCalculator,
  onToggleFavorite,
  onSelectSpecialty,
  onNavigateTab,
  onOpenReferences,
}) => {
  const [query, setQuery] = useState('');
  const [showAllCatalog, setShowAllCatalog] = useState(false);

  const results = useMemo(() => searchCalculators(query), [query]);

  const totalCitations = useMemo(
    () => CALCULATOR_CATALOG.reduce((sum, calc) => sum + calc.references.length, 0),
    [],
  );

  const quickAccessItems = [
    {
      id: 'curb-65',
      label: 'CURB-65',
      icon: Wind,
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      id: 'heart-score',
      label: 'HEART Score',
      icon: Heart,
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
    {
      id: 'glasgow',
      label: 'Glasgow',
      icon: Brain,
      iconColor: 'text-sky-600 dark:text-sky-400',
    },
    {
      id: 'holliday-segar',
      label: 'Cálculo de Líquidos',
      icon: Droplets,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'who-growth',
      label: 'Percentiles OMS',
      icon: Baby,
      iconColor: 'text-teal-600 dark:text-teal-400',
    },
    {
      id: 'acute-diarrhea-plan',
      label: 'EDA Plan A/B/C',
      icon: Activity,
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
  ].filter((item) => Boolean(CALCULATOR_BY_ID[item.id]));

  const latestHistory = history[0] ?? null;

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-6">
      {/* HERO BANNER + FLOATING SEARCH BAR */}
      <div className="relative">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#06245A] via-[#0B3D91] to-[#0A64BC] px-4 pt-4 pb-11 text-white shadow-md sm:rounded-3xl sm:px-7 sm:pt-6 sm:pb-12">
          {/* ECG Waveform SVG Backdrop */}
          <svg
            viewBox="0 0 800 160"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 bottom-2 h-24 w-full opacity-25 sm:h-28"
            aria-hidden="true"
          >
            <path
              d="M0 95 L90 95 L108 82 L120 105 L136 42 L152 128 L166 95 L250 95 L268 85 L278 102 L292 50 L306 122 L318 95 L430 95 L446 78 L458 108 L472 34 L488 134 L504 95 L610 95 L626 84 L638 104 L652 52 L666 122 L680 95 L800 95"
              fill="none"
              stroke="#67E8F9"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Subtle radial glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 -right-10 h-44 w-44 rounded-full bg-cyan-400/20 blur-2xl"
          />

          {/* Top Controls inside Hero (Mobile quick menu + Theme toggle + Desktop PWA install) */}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onSelectSpecialty(null)}
              aria-label="Abrir todas las especialidades"
              className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-cyan-200">
              <span>{CALCULATOR_CATALOG.length} herramientas clínicas validadas · 100% offline</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <PWAInstallButton />
              </div>
              <button
                type="button"
                onClick={onToggleTheme}
                aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full border border-white/25 bg-white/10 text-white hover:bg-white/20 md:hidden"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-amber-300" />
                ) : (
                  <Moon className="h-4 w-4 text-cyan-100" />
                )}
              </button>
            </div>
          </div>

          {/* Center-left Brand Lockup */}
          <div className="relative z-10 mt-2 flex items-center gap-3.5 sm:mt-3 sm:gap-5">
            <img
              src="/pwa-192x192.png"
              alt="Icono de Calculadora Médica Integral"
              className="h-14 w-14 shrink-0 rounded-2xl border border-cyan-300/40 object-cover shadow-md sm:h-16 sm:w-16"
            />

            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-white text-balance sm:text-3xl">
                Calculadora Médica Integral
              </h1>
              <p className="mt-1 text-xs font-medium tracking-wide text-cyan-200 sm:text-sm">
                Calcular • Evaluar • Decidir
              </p>
            </div>
          </div>
        </section>

        {/* Overlapping White Search Card */}
        <div className="relative z-20 mx-2 -mt-7 sm:mx-5 sm:-mt-7">
          <div className="flex items-center rounded-2xl border border-slate-200/90 bg-white px-3 shadow-lg shadow-slate-900/8 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
            <Search className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden="true" />
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
              placeholder="Buscar (ej. IMC, TFG, Wells, Glasgow...)"
              aria-label="Buscar calculadoras médicas"
              className="min-h-[48px] w-full min-w-0 bg-transparent px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none sm:min-h-[52px] dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Limpiar búsqueda"
                className="inline-flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSelectSpecialty(null)}
                aria-label="Explorar por especialidad"
                title="Explorar todas las especialidades"
                className="inline-flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-900/60"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="mt-2 flex justify-end sm:hidden">
            <PWAInstallButton />
          </div>
        </div>
      </div>

      {/* LIVE SEARCH RESULTS (when user types in search bar) */}
      {query.trim().length > 0 ? (
        <section aria-labelledby="search-results-heading" className="min-w-0 space-y-3 pt-1">
          <div className="flex items-center justify-between gap-2">
            <h2
              id="search-results-heading"
              className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm dark:text-slate-400"
            >
              Resultados de búsqueda ({results.length})
            </h2>
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs font-semibold text-sky-700 hover:underline dark:text-sky-400"
            >
              Volver al inicio
            </button>
          </div>

          {results.length > 0 ? (
            <div className="grid min-w-0 gap-2.5 sm:gap-3 md:grid-cols-2">
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
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center sm:p-8 dark:border-slate-800 dark:bg-slate-900">
              <p className="break-words text-sm font-medium text-slate-800 dark:text-slate-200">
                No se encontraron herramientas para “{query}”.
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Prueba con términos como IMC, CKD-EPI, EDA, Percentiles, Anion Gap o CURB-65.
              </p>
            </div>
          )}
        </section>
      ) : (
        <>
          {/* ALL SPECIALTY PASTEL TILES GRID (all 18 specialties with drawings) */}
          <section aria-label="Especialidades clínicas" className="min-w-0 space-y-2.5">
            <div className="grid grid-cols-2 gap-2 min-[360px]:grid-cols-3 sm:grid-cols-5 sm:gap-3 lg:grid-cols-6">
              {HOME_SPECIALTY_ORDER.map((id) => {
                const tile = SPECIALTY_VISUALS[id];
                return (
                  <button
                    key={tile.id}
                    type="button"
                    onClick={() => onSelectSpecialty(tile.id)}
                    className={`group flex min-h-[86px] w-full min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 py-2.5 text-center shadow-xs transition-transform hover:-translate-y-0.5 sm:min-h-[104px] sm:gap-2 sm:px-3 sm:py-3 ${tile.bgClass}`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center sm:h-10 sm:w-10 ${tile.iconClass}`}>
                      {tile.renderIcon('h-7 w-7 sm:h-8 sm:w-8')}
                    </span>
                    <span className="line-clamp-2 w-full break-words text-[11px] font-semibold leading-tight text-slate-800 sm:text-xs dark:text-slate-100">
                      {tile.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ROYAL BLUE FEATURE BANNER ("Más de 120 herramientas clínicas") */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0A3C96] via-[#0F55C2] to-[#1481D8] p-4 text-white shadow-sm sm:p-5">
            <svg
              viewBox="0 0 400 100"
              preserveAspectRatio="none"
              className="pointer-events-none absolute right-0 bottom-0 h-full w-2/3 opacity-20"
              aria-hidden="true"
            >
              <path
                d="M0 60 L120 60 L140 44 L152 74 L168 20 L184 85 L198 60 L400 60"
                fill="none"
                stroke="#A5F3FC"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15 backdrop-blur-xs sm:h-14 sm:w-14">
                  <Calculator className="h-7 w-7 text-cyan-200 sm:h-8 sm:w-8" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold leading-snug text-white sm:text-lg">
                    Más de {Math.floor(CALCULATOR_CATALOG.length / 10) * 10} herramientas clínicas ({CALCULATOR_CATALOG.length})
                  </h2>
                  <p className="mt-0.5 text-xs leading-snug text-blue-100 sm:text-sm">
                    {SPECIALTIES.length} especialidades clínicas con calculadoras, escalas y scores validados.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectSpecialty(null)}
                className="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-1.5 self-start rounded-full border border-cyan-300/50 bg-slate-950/25 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-950/40 sm:self-center sm:text-sm whitespace-nowrap"
              >
                <span>Explorar</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* ACCESO RÁPIDO */}
          <section aria-labelledby="quick-access-heading" className="min-w-0 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h2
                id="quick-access-heading"
                className="flex items-center gap-2 text-base font-bold text-slate-900 sm:text-lg dark:text-slate-100"
              >
                <Star className="h-5 w-5 fill-amber-400 text-amber-500 shrink-0" />
                <span>Acceso Rápido</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowAllCatalog((prev) => !prev)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800 sm:text-sm dark:text-sky-400"
              >
                <span>{showAllCatalog ? 'Ver menos' : 'Ver todas'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
              {quickAccessItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectCalculator(item.id)}
                    className="flex min-h-[46px] min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-800 shadow-xs hover:border-sky-300 hover:bg-sky-50/40 sm:text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-sky-700 dark:hover:bg-slate-800/70"
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${item.iconColor}`} aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* BOTTOM 2-CARD REAL UTILITY SUMMARY (Últimos Usados · Guías y Referencias Validadas) */}
          <section aria-label="Resumen rápido" className="grid min-w-0 gap-2.5 sm:grid-cols-2 sm:gap-3">
            {/* Últimos Usados */}
            <button
              type="button"
              onClick={() =>
                latestHistory
                  ? onSelectCalculator(latestHistory.calculatorId)
                  : onNavigateTab('historial')
              }
              className="flex min-h-[74px] w-full min-w-0 items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3.5 text-left shadow-xs hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-700"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 sm:text-sm dark:text-slate-100">
                  <History className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                  <span className="truncate">Últimos Usados</span>
                </div>
                <div className="mt-1 truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {latestHistory ? latestHistory.calculatorName : 'Sin cálculos recientes'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {latestHistory ? formatRelativeTimeEs(latestHistory.timestamp) : 'Se guardan localmente'}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            </button>

            {/* Guías y Referencias Validadas */}
            <button
              type="button"
              onClick={onOpenReferences}
              className="flex min-h-[74px] w-full min-w-0 items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3.5 text-left shadow-xs hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-700"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 sm:text-sm dark:text-slate-100">
                  <BookOpen className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                  <span className="truncate">Guías y referencias validadas</span>
                </div>
                <div className="mt-1 truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {CALCULATOR_CATALOG.length} escalas · {totalCitations} citas bibliográficas
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Toca para consultar la bibliografía usada
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
          </section>

          {/* EXPANDABLE ALPHABETICAL FULL CATALOG (when Explorar / Ver todas is toggled) */}
          {showAllCatalog && (
            <section aria-labelledby="full-catalog-heading" className="min-w-0 space-y-3 pt-1">
              <div className="flex items-baseline justify-between gap-4">
                <h2
                  id="full-catalog-heading"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm dark:text-slate-400"
                >
                  Catálogo alfabético completo ({CALCULATOR_CATALOG.length})
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAllCatalog(false)}
                  className="text-xs font-semibold text-sky-700 hover:underline dark:text-sky-400"
                >
                  Contraer
                </button>
              </div>

              <div className="grid min-w-0 gap-2.5 sm:gap-3 md:grid-cols-2">
                {CALCULATOR_CATALOG.map((calc) => (
                  <CalculatorCard
                    key={calc.id}
                    calculator={calc}
                    isFavorite={favorites.includes(calc.id)}
                    onSelect={onSelectCalculator}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};
