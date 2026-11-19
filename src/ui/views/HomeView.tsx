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
  compareCalculatorsAlphabetically,
  getCalculatorsBySpecialty,
  searchCalculators,
} from '../../clinical-core/registries/catalog.ts';
import { SPECIALTIES } from '../../clinical-core/registries/specialties.ts';
import type { SpecialtyId } from '../../clinical-core/types/clinical.ts';
import type { HistoryEntry, ThemeMode } from '../../storage/localStore.ts';
import { CalculatorCard } from '../components/CalculatorCard.tsx';
import { PWAInstallButton } from '../components/PWAControls.tsx';

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

// Custom offline medical SVG icons matching the specialty tiles
const KidneysIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M9.5 6.5C7.2 5 4.5 6.8 4.5 10c0 3 2.2 4.8 4.4 4.2 1.2-.3 1.4-1.5 1-2.5-.3-.8-.2-1.7.4-2.3.7-.7.5-2.1-.8-2.9Z" fill="currentColor" fillOpacity="0.18" />
    <path d="M14.5 6.5C16.8 5 19.5 6.8 19.5 10c0 3-2.2 4.8-4.4 4.2-1.2-.3-1.4-1.5-1-2.5.3-.8.2-1.7-.4-2.3-.7-.7-.5-2.1.8-2.9Z" fill="currentColor" fillOpacity="0.18" />
    <path d="M10.5 11.5v5.5c0 1.4.4 2.5.8 3" />
    <path d="M13.5 11.5v5.5c0 1.4-.4 2.5-.8 3" />
  </svg>
);

const GlucometerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="6.5" y="3" width="11" height="15" rx="4" fill="currentColor" fillOpacity="0.14" />
    <rect x="9" y="5.5" width="6" height="4.5" rx="1" />
    <path d="M12 18v3" />
    <circle cx="12" cy="13.5" r="1.3" fill="currentColor" />
  </svg>
);

const ScalpelIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M19.5 4.5 9.5 14.5l-2 2-3.5 1.5 1.5-3.5 2-2 10-10a1.4 1.4 0 0 1 2 2Z" fill="currentColor" fillOpacity="0.18" />
    <path d="M4 20h14" />
  </svg>
);

const MicrobeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.2" />
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    <circle cx="10.5" cy="11" r="0.8" fill="currentColor" />
    <circle cx="13.8" cy="13.2" r="0.8" fill="currentColor" />
  </svg>
);

const SirenIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M7 18v-5a5 5 0 0 1 10 0v5" fill="currentColor" fillOpacity="0.2" />
    <path d="M5 18h14v2H5z" />
    <path d="M12 3v2M5.2 6.2l1.4 1.4M18.8 6.2l-1.4 1.4M3 12h2M19 12h2" />
  </svg>
);

const ObstetricsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="12" cy="5.5" r="2.2" fill="currentColor" fillOpacity="0.2" />
    <path d="M9.5 9.5h4.2c1.2 0 2.1.8 2.1 2.2 0 2.5-1.2 4.3-2.5 5.3V21h-3.8v-4c-1.1-.8-1.5-2.2-1.5-4.3 0-1.9.7-3.2 1.5-3.2Z" fill="currentColor" fillOpacity="0.16" />
  </svg>
);

interface FeaturedTile {
  id: SpecialtyId;
  label: string;
  bgClass: string;
  iconClass: string;
  renderIcon: (cls: string) => React.ReactNode;
}

const FEATURED_SPECIALTIES: FeaturedTile[] = [
  {
    id: 'medicina-interna',
    label: 'Medicina Interna',
    bgClass: 'bg-sky-100/90 border-sky-200/80 dark:bg-sky-950/50 dark:border-sky-800/70',
    iconClass: 'text-sky-700 dark:text-sky-300',
    renderIcon: (cls) => <Stethoscope className={cls} />,
  },
  {
    id: 'cardiologia',
    label: 'Cardiología',
    bgClass: 'bg-rose-100/90 border-rose-200/80 dark:bg-rose-950/50 dark:border-rose-800/70',
    iconClass: 'text-rose-600 dark:text-rose-300',
    renderIcon: (cls) => <Heart className={`${cls} fill-current/20`} />,
  },
  {
    id: 'pediatria',
    label: 'Pediatría',
    bgClass: 'bg-emerald-100/90 border-emerald-200/80 dark:bg-emerald-950/50 dark:border-emerald-800/70',
    iconClass: 'text-emerald-700 dark:text-emerald-300',
    renderIcon: (cls) => <Baby className={cls} />,
  },
  {
    id: 'gineco-obstetricia',
    label: 'Ginecología y Obstetricia',
    bgClass: 'bg-purple-100/90 border-purple-200/80 dark:bg-purple-950/50 dark:border-purple-800/70',
    iconClass: 'text-purple-700 dark:text-purple-300',
    renderIcon: (cls) => <ObstetricsIcon className={cls} />,
  },
  {
    id: 'neurologia',
    label: 'Neurología',
    bgClass: 'bg-orange-100/90 border-orange-200/80 dark:bg-orange-950/50 dark:border-orange-800/70',
    iconClass: 'text-orange-600 dark:text-orange-300',
    renderIcon: (cls) => <Brain className={cls} />,
  },
  {
    id: 'nefrologia',
    label: 'Nefrología',
    bgClass: 'bg-cyan-100/90 border-cyan-200/80 dark:bg-cyan-950/50 dark:border-cyan-800/70',
    iconClass: 'text-teal-700 dark:text-teal-300',
    renderIcon: (cls) => <KidneysIcon className={cls} />,
  },
  {
    id: 'endocrinologia',
    label: 'Endocrinología',
    bgClass: 'bg-indigo-100/90 border-indigo-200/80 dark:bg-indigo-950/50 dark:border-indigo-800/70',
    iconClass: 'text-indigo-700 dark:text-indigo-300',
    renderIcon: (cls) => <GlucometerIcon className={cls} />,
  },
  {
    id: 'cirugia-general',
    label: 'Cirugía General',
    bgClass: 'bg-blue-100/90 border-blue-200/80 dark:bg-blue-950/50 dark:border-blue-800/70',
    iconClass: 'text-blue-700 dark:text-blue-300',
    renderIcon: (cls) => <ScalpelIcon className={cls} />,
  },
  {
    id: 'infectologia',
    label: 'Infectología',
    bgClass: 'bg-lime-100/85 border-lime-200/80 dark:bg-emerald-950/50 dark:border-emerald-800/70',
    iconClass: 'text-emerald-700 dark:text-emerald-300',
    renderIcon: (cls) => <MicrobeIcon className={cls} />,
  },
  {
    id: 'urgencias',
    label: 'Urgencias y Emergencias',
    bgClass: 'bg-red-100/90 border-red-200/80 dark:bg-red-950/50 dark:border-red-800/70',
    iconClass: 'text-red-600 dark:text-red-300',
    renderIcon: (cls) => <SirenIcon className={cls} />,
  },
];

export const HomeView: React.FC<HomeViewProps> = ({
  favorites,
  history,
  theme,
  onToggleTheme,
  onSelectCalculator,
  onToggleFavorite,
  onSelectSpecialty,
  onNavigateTab,
}) => {
  const [query, setQuery] = useState('');
  const [showAllCatalog, setShowAllCatalog] = useState(false);

  const results = useMemo(() => searchCalculators(query), [query]);

  const favoriteCalculators = useMemo(
    () =>
      favorites
        .map((id) => CALCULATOR_BY_ID[id])
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .sort(compareCalculatorsAlphabetically),
    [favorites],
  );

  const remainingSpecialties = useMemo(
    () =>
      SPECIALTIES.filter(
        (spec) =>
          !FEATURED_SPECIALTIES.some((f) => f.id === spec.id) &&
          getCalculatorsBySpecialty(spec.id).length > 0,
      ),
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
  const firstFavorite = favoriteCalculators[0] ?? null;

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
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/35 bg-white/10 shadow-inner backdrop-blur-xs sm:h-16 sm:w-16">
              <svg viewBox="0 0 48 48" className="h-10 w-10 text-cyan-300 sm:h-11 sm:w-11" fill="none" aria-hidden="true">
                <path
                  d="M24 41C24 41 7 30.2 7 17.8C7 11.9 11.6 7.5 17.2 7.5C20.5 7.5 23.1 9.2 24 11.4C24.9 9.2 27.5 7.5 30.8 7.5C36.4 7.5 41 11.9 41 17.8C41 30.2 24 41 24 41Z"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  strokeLinejoin="round"
                  fill="currentColor"
                  fillOpacity="0.14"
                />
                <path
                  d="M11 23H17L20 16L24 30L28 20L30.5 23H37"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar (ej. IMC, TFG, Wells, Glasgow...)"
              aria-label="Buscar calculadoras médicas"
              className="min-h-[48px] w-full min-w-0 bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none sm:min-h-[52px] sm:text-base dark:text-slate-100 dark:placeholder:text-slate-500"
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
          {/* SPECIALTY PASTEL TILES GRID (10 core tiles like reference, 3 cols on small phones -> 5 cols on sm+/desktop) */}
          <section aria-label="Especialidades principales" className="min-w-0 space-y-2.5">
            <div className="grid grid-cols-2 gap-2 min-[360px]:grid-cols-3 sm:grid-cols-5 sm:gap-3">
              {FEATURED_SPECIALTIES.map((tile) => (
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
                    {tile.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Subtle shortcut row for the remaining 8 specialties */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
              <div className="flex flex-wrap items-center gap-1.5">
                {remainingSpecialties.slice(0, 4).map((spec) => (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => onSelectSpecialty(spec.id)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-sky-300 hover:text-sky-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-sky-700 dark:hover:text-sky-300"
                  >
                    {spec.shortName}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onSelectSpecialty(null)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
              >
                <span>Ver las {SPECIALTIES.length} especialidades</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
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
                    Calculadoras, escalas, scores y fórmulas para tu práctica médica diaria.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAllCatalog((prev) => !prev)}
                className="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-1.5 self-start rounded-full border border-cyan-300/50 bg-slate-950/25 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-950/40 sm:self-center sm:text-sm whitespace-nowrap"
              >
                <span>{showAllCatalog ? 'Ocultar lista' : 'Explorar'}</span>
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

          {/* BOTTOM 3-CARD REAL UTILITY SUMMARY (Últimos Usados · Favoritos · Guías y Referencias) */}
          <section aria-label="Resumen rápido" className="grid min-w-0 gap-2.5 sm:grid-cols-3 sm:gap-3">
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

            {/* Favoritos */}
            <button
              type="button"
              onClick={() =>
                firstFavorite
                  ? onSelectCalculator(firstFavorite.id)
                  : onNavigateTab('favoritos')
              }
              className="flex min-h-[74px] w-full min-w-0 items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3.5 text-left shadow-xs hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-700"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 sm:text-sm dark:text-slate-100">
                  <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-500" />
                  <span className="truncate">Favoritos</span>
                </div>
                <div className="mt-1 truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {firstFavorite ? firstFavorite.shortName : 'Sin favoritos'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {favorites.length > 0
                    ? `${favorites.length} ${favorites.length === 1 ? 'guardada' : 'guardadas'}`
                    : 'Marca con estrella las más usadas'}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            </button>

            {/* Guías y Referencias */}
            <button
              type="button"
              onClick={() => onSelectSpecialty(null)}
              className="flex min-h-[74px] w-full min-w-0 items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3.5 text-left shadow-xs hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-700"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 sm:text-sm dark:text-slate-100">
                  <BookOpen className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                  <span className="truncate">Guías y Referencias</span>
                </div>
                <div className="mt-1 truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {CALCULATOR_CATALOG.length} escalas validadas
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Basado en guías actualizadas
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
