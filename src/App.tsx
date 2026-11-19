import {
  History,
  LayoutGrid,
  Moon,
  Search,
  Star,
  Sun,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { CALCULATOR_BY_ID } from './clinical-core/registries/catalog.ts';
import type {
  CalculationOutput,
  CalculatorDefinition,
  SpecialtyId,
} from './clinical-core/types/clinical.ts';
import {
  appendHistoryEntry,
  clearHistory,
  loadFavorites,
  loadHistory,
  loadTheme,
  removeHistoryEntry,
  saveFavorites,
  saveTheme,
  type HistoryEntry,
  type ThemeMode,
} from './storage/localStore.ts';
import { CalculatorView } from './ui/components/CalculatorView.tsx';
import { OfflineIndicator } from './ui/components/PWAControls.tsx';
import { FavoritesView } from './ui/views/FavoritesView.tsx';
import { HomeView } from './ui/views/HomeView.tsx';
import { HistoryView } from './ui/views/HistoryView.tsx';
import { SpecialtiesView } from './ui/views/SpecialtiesView.tsx';

type NavTab = 'inicio' | 'especialidades' | 'favoritos' | 'historial';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme());
  const [activeTab, setActiveTab] = useState<NavTab>('inicio');
  const [selectedCalculatorId, setSelectedCalculatorId] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<SpecialtyId | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());

  useEffect(() => {
    registerSW({ immediate: true });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveTheme(theme);

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#0B111A' : '#0F172A');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      saveFavorites(next);
      return next;
    });
  };

  const handleSaveHistory = (calc: CalculatorDefinition, output: CalculationOutput) => {
    const entry: HistoryEntry = {
      id: `${calc.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      calculatorId: calc.id,
      calculatorName: calc.shortName,
      timestamp: new Date().toISOString(),
      inputsSummary: output.inputsSummary,
      resultText: `${output.primaryResult.formattedValue} ${output.primaryResult.unit}`,
      riskClassification: output.riskClassification,
      severity: output.severity,
    };
    setHistory(appendHistoryEntry(entry));
  };

  const handleNavigateTab = (tab: NavTab) => {
    setActiveTab(tab);
    setSelectedCalculatorId(null);
    if (tab !== 'especialidades') {
      setSelectedSpecialty(null);
    }
  };

  const handleSelectSpecialty = (id: SpecialtyId | null) => {
    setActiveTab('especialidades');
    setSelectedCalculatorId(null);
    setSelectedSpecialty(id);
  };

  const activeCalculator = selectedCalculatorId
    ? CALCULATOR_BY_ID[selectedCalculatorId] ?? null
    : null;

  const navItems: { id: NavTab; label: string; icon: typeof Search }[] = [
    { id: 'inicio', label: 'Inicio', icon: Search },
    { id: 'especialidades', label: 'Especialidades', icon: LayoutGrid },
    { id: 'favoritos', label: 'Favoritos', icon: Star },
    { id: 'historial', label: 'Historial', icon: History },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B111A] dark:text-slate-100">
      {/* Top Bar: 3-zone contract on desktop, compact 52px bar on mobile */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleNavigateTab('inicio')}
            className="text-left text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0"
          >
            Calculadora Médica Integral
          </button>

          {/* Zone 2: 4 concise single-line text nav links (Desktop) */}
          <nav
            aria-label="Navegación principal"
            className="hidden md:flex items-center gap-6 text-sm font-medium"
          >
            {navItems.map((item) => {
              const isActive = !activeCalculator && activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigateTab(item.id)}
                  className={`border-b-2 py-4 transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'border-sky-600 text-slate-950 dark:border-sky-400 dark:text-white'
                      : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Header Action (Theme Switch) */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
                  <span className="hidden sm:inline">Modo claro</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-slate-600" aria-hidden="true" />
                  <span className="hidden sm:inline">Modo oscuro</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <OfflineIndicator />

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-24 sm:px-6 md:pb-12">
        {activeCalculator ? (
          <CalculatorView
            calculator={activeCalculator}
            isFavorite={favorites.includes(activeCalculator.id)}
            onBack={() => setSelectedCalculatorId(null)}
            onToggleFavorite={handleToggleFavorite}
            onSaveHistory={handleSaveHistory}
          />
        ) : activeTab === 'inicio' ? (
          <HomeView
            favorites={favorites}
            onSelectCalculator={(id) => setSelectedCalculatorId(id)}
            onToggleFavorite={handleToggleFavorite}
            onSelectSpecialty={(id) => handleSelectSpecialty(id)}
          />
        ) : activeTab === 'especialidades' ? (
          <SpecialtiesView
            selectedSpecialty={selectedSpecialty}
            favorites={favorites}
            onSelectSpecialty={setSelectedSpecialty}
            onSelectCalculator={(id) => setSelectedCalculatorId(id)}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : activeTab === 'favoritos' ? (
          <FavoritesView
            favorites={favorites}
            onSelectCalculator={(id) => setSelectedCalculatorId(id)}
            onToggleFavorite={handleToggleFavorite}
            onGoHome={() => handleNavigateTab('inicio')}
          />
        ) : (
          <HistoryView
            history={history}
            onOpenCalculator={(id) => setSelectedCalculatorId(id)}
            onRemoveEntry={(id) => setHistory(removeHistoryEntry(id))}
            onClearAll={() => setHistory(clearHistory())}
          />
        )}
      </main>

      {/* Mobile Bottom Tab Bar (< 768px) */}
      <nav
        aria-label="Navegación móvil"
        className="fixed right-0 bottom-0 left-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md md:hidden dark:border-slate-800 dark:bg-slate-950/95"
      >
        <div className="grid h-16 grid-cols-4 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = !activeCalculator && activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigateTab(item.id)}
                className={`flex min-h-[48px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'text-sky-600 dark:text-sky-400'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
