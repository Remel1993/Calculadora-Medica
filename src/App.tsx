import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import {
  ClinicalHistoryIcon,
  ClinicalHomeIcon,
  ClinicalMoonIcon,
  ClinicalResetIcon,
  ClinicalSpecialtiesIcon,
  ClinicalStarIcon,
  ClinicalSunIcon,
} from './ui/icons/clinicalUiIcons.tsx';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { ExitConfirmModal } from './ui/components/ExitConfirmModal.tsx';
import { OfflineIndicator } from './ui/components/PWAControls.tsx';
import { FavoritesView } from './ui/views/FavoritesView.tsx';
import { HomeView } from './ui/views/HomeView.tsx';
import { HistoryView } from './ui/views/HistoryView.tsx';
import { ReferencesView } from './ui/views/ReferencesView.tsx';
import { SpecialtiesView } from './ui/views/SpecialtiesView.tsx';

type NavTab = 'inicio' | 'especialidades' | 'favoritos' | 'historial';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme());
  const [activeTab, setActiveTab] = useState<NavTab>('inicio');
  const [selectedCalculatorId, setSelectedCalculatorId] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<SpecialtyId | null>(null);
  const [showReferences, setShowReferences] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [hasExitedWebSession, setHasExitedWebSession] = useState(false);

  const hasGuardEntryRef = useRef(false);
  const exitingRef = useRef(false);

  useEffect(() => {
    registerSW({ immediate: true });
  }, []);

  const ensureHistoryGuard = useCallback(() => {
    if (typeof window === 'undefined' || Capacitor.isNativePlatform() || exitingRef.current) {
      return;
    }
    if (!hasGuardEntryRef.current) {
      window.history.pushState({ calcMedGuard: true }, '');
      hasGuardEntryRef.current = true;
    }
  }, []);

  const handleMobileBack = useCallback(() => {
    if (showExitConfirm) {
      setShowExitConfirm(false);
      return;
    }
    if (selectedCalculatorId !== null) {
      setSelectedCalculatorId(null);
      return;
    }
    if (showReferences) {
      setShowReferences(false);
      return;
    }
    if (activeTab === 'especialidades' && selectedSpecialty !== null) {
      setSelectedSpecialty(null);
      return;
    }
    if (activeTab !== 'inicio') {
      setActiveTab('inicio');
      return;
    }
    setShowExitConfirm(true);
  }, [showExitConfirm, selectedCalculatorId, showReferences, activeTab, selectedSpecialty]);

  const handleMobileBackRef = useRef(handleMobileBack);
  handleMobileBackRef.current = handleMobileBack;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (Capacitor.isNativePlatform()) {
      const listenerPromise = CapacitorApp.addListener('backButton', () => {
        handleMobileBackRef.current();
      });
      return () => {
        void listenerPromise.then((handle) => handle.remove());
      };
    }

    const armOnInteraction = () => {
      ensureHistoryGuard();
    };

    const handlePopState = () => {
      if (exitingRef.current) return;
      hasGuardEntryRef.current = false;
      handleMobileBackRef.current();
      ensureHistoryGuard();
    };

    window.addEventListener('pointerdown', armOnInteraction, { passive: true });
    window.addEventListener('keydown', armOnInteraction, { passive: true });
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('pointerdown', armOnInteraction);
      window.removeEventListener('keydown', armOnInteraction);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [ensureHistoryGuard]);

  const handleConfirmExit = useCallback(() => {
    setShowExitConfirm(false);
    if (Capacitor.isNativePlatform()) {
      void CapacitorApp.exitApp();
      return;
    }
    exitingRef.current = true;
    window.close();
    if (hasGuardEntryRef.current) {
      hasGuardEntryRef.current = false;
      window.history.back();
    }
    window.setTimeout(() => {
      if (exitingRef.current) {
        setHasExitedWebSession(true);
      }
    }, 250);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isTextEntryElement = (el: Element | null): boolean => {
      if (!el) return false;
      if (el instanceof HTMLTextAreaElement) return !el.readOnly && !el.disabled;
      if (el instanceof HTMLInputElement) {
        const nonKeyboardTypes = ['checkbox', 'radio', 'button', 'submit', 'reset', 'file', 'range', 'color', 'hidden'];
        return !el.readOnly && !el.disabled && !nonKeyboardTypes.includes(el.type);
      }
      return false;
    };

    const updateKeyboardState = () => {
      const activeIsInput = isTextEntryElement(document.activeElement);
      const vv = window.visualViewport;
      const viewportShrunk = vv ? vv.height < window.innerHeight * 0.78 : false;
      setIsKeyboardOpen(activeIsInput || viewportShrunk);
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (isTextEntryElement(event.target as Element | null)) {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      window.requestAnimationFrame(() => {
        updateKeyboardState();
      });
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    window.visualViewport?.addEventListener('resize', updateKeyboardState);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      window.visualViewport?.removeEventListener('resize', updateKeyboardState);
    };
  }, []);

  useEffect(() => {
    const timers = new WeakMap<HTMLButtonElement, number>();

    const handleButtonClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest('button');
      if (!button || button.disabled) {
        return;
      }

      const existingTimer = timers.get(button);
      if (existingTimer !== undefined) {
        window.clearTimeout(existingTimer);
      }

      button.classList.remove('btn-tapped');
      void button.offsetWidth;
      button.classList.add('btn-tapped');

      const timerId = window.setTimeout(() => {
        button.classList.remove('btn-tapped');
        timers.delete(button);
      }, 190);
      timers.set(button, timerId);
    };

    document.addEventListener('click', handleButtonClick);
    return () => {
      document.removeEventListener('click', handleButtonClick);
    };
  }, []);

  useEffect(() => {
    const active = document.activeElement;
    if (
      active instanceof HTMLInputElement ||
      active instanceof HTMLTextAreaElement ||
      active instanceof HTMLSelectElement
    ) {
      active.blur();
    }
    setIsKeyboardOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [selectedCalculatorId, activeTab, selectedSpecialty, showReferences]);

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
    ensureHistoryGuard();
    setActiveTab(tab);
    setSelectedCalculatorId(null);
    setShowReferences(false);
    if (tab !== 'especialidades') {
      setSelectedSpecialty(null);
    }
  };

  const handleSelectSpecialty = (id: SpecialtyId | null) => {
    ensureHistoryGuard();
    setActiveTab('especialidades');
    setSelectedCalculatorId(null);
    setShowReferences(false);
    setSelectedSpecialty(id);
  };

  const handleSelectCalculator = (id: string) => {
    ensureHistoryGuard();
    setSelectedCalculatorId(id);
    setShowReferences(false);
  };

  const activeCalculator = selectedCalculatorId
    ? CALCULATOR_BY_ID[selectedCalculatorId] ?? null
    : null;

  const navItems: {
    id: NavTab;
    label: string;
    renderIcon: (active: boolean, className: string) => React.ReactNode;
  }[] = [
    {
      id: 'inicio',
      label: 'Inicio',
      renderIcon: (_active, cls) => <ClinicalHomeIcon className={cls} />,
    },
    {
      id: 'especialidades',
      label: 'Especialidades',
      renderIcon: (_active, cls) => <ClinicalSpecialtiesIcon className={cls} />,
    },
    {
      id: 'favoritos',
      label: 'Favoritos',
      renderIcon: (active, cls) => <ClinicalStarIcon filled={active} className={cls} />,
    },
    {
      id: 'historial',
      label: 'Historial',
      renderIcon: (_active, cls) => <ClinicalHistoryIcon className={cls} />,
    },
  ];

  const isMobileHomeHero = !activeCalculator && !showReferences && activeTab === 'inicio';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B111A] dark:text-slate-100">
      {/* Top Bar: 3-zone contract on desktop, compact 48px bar on mobile subviews */}
      <header
        className={`sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 ${
          isMobileHomeHero ? 'hidden md:block' : ''
        }`}
      >
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-4 px-4 sm:gap-8 sm:px-6 md:h-14">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleNavigateTab('inicio')}
            className="flex min-w-0 items-center gap-2.5 text-left text-sm font-bold tracking-tight text-slate-900 sm:text-base dark:text-slate-100 whitespace-nowrap"
          >
            <img
              src="/pwa-192x192.png"
              alt=""
              className="h-7 w-7 shrink-0 rounded-lg border border-slate-200 object-cover shadow-2xs dark:border-slate-700"
            />
            <span className="truncate">Calculadora Médica Integral</span>
          </button>

          {/* Zone 2: 4 concise single-line text nav links (Desktop) */}
          <nav
            aria-label="Navegación principal"
            className="hidden md:flex items-center gap-6 text-sm font-medium"
          >
            {navItems.map((item) => {
              const isActive = !activeCalculator && !showReferences && activeTab === item.id;
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
              className="inline-flex min-h-[38px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 sm:min-h-[40px] sm:px-3 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              {theme === 'dark' ? (
                <>
                  <ClinicalSunIcon className="h-4 w-4 text-amber-400" />
                  <span className="hidden sm:inline">Modo claro</span>
                </>
              ) : (
                <>
                  <ClinicalMoonIcon className="h-4 w-4 text-slate-600" />
                  <span className="hidden sm:inline">Modo oscuro</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <OfflineIndicator />

      {/* Main Content */}
      <main
        className={`mx-auto w-full min-w-0 max-w-6xl overflow-x-clip px-3.5 pt-3.5 sm:px-6 sm:pt-6 md:pb-12 ${
          isKeyboardOpen ? 'pb-6' : 'pb-20'
        }`}
      >
        {activeCalculator ? (
          <CalculatorView
            calculator={activeCalculator}
            isFavorite={favorites.includes(activeCalculator.id)}
            onBack={() => setSelectedCalculatorId(null)}
            onToggleFavorite={handleToggleFavorite}
            onSaveHistory={handleSaveHistory}
          />
        ) : showReferences ? (
          <ReferencesView onBack={() => setShowReferences(false)} />
        ) : activeTab === 'inicio' ? (
          <HomeView
            favorites={favorites}
            history={history}
            theme={theme}
            onToggleTheme={toggleTheme}
            onSelectCalculator={handleSelectCalculator}
            onToggleFavorite={handleToggleFavorite}
            onSelectSpecialty={(id) => handleSelectSpecialty(id)}
            onNavigateTab={handleNavigateTab}
            onOpenReferences={() => {
              ensureHistoryGuard();
              setShowReferences(true);
            }}
          />
        ) : activeTab === 'especialidades' ? (
          <SpecialtiesView
            selectedSpecialty={selectedSpecialty}
            favorites={favorites}
            onSelectSpecialty={(id) => {
              ensureHistoryGuard();
              setSelectedSpecialty(id);
            }}
            onSelectCalculator={handleSelectCalculator}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : activeTab === 'favoritos' ? (
          <FavoritesView
            favorites={favorites}
            onSelectCalculator={handleSelectCalculator}
            onToggleFavorite={handleToggleFavorite}
            onGoHome={() => handleNavigateTab('inicio')}
          />
        ) : (
          <HistoryView
            history={history}
            onOpenCalculator={handleSelectCalculator}
            onRemoveEntry={(id) => setHistory(removeHistoryEntry(id))}
            onClearAll={() => setHistory(clearHistory())}
          />
        )}
      </main>

      {/* Mobile Bottom Tab Bar (< 768px, hidden while virtual keyboard is open) */}
      {!isKeyboardOpen && (
        <nav
          aria-label="Navegación móvil"
          className="fixed right-0 bottom-0 left-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden dark:border-slate-800 dark:bg-slate-950/95"
        >
        <div className="grid h-14 grid-cols-4 items-center">
          {navItems.map((item) => {
            const isActive = !activeCalculator && !showReferences && activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigateTab(item.id)}
                className={`relative flex min-h-[44px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'text-sky-600 dark:text-sky-400'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 right-4 left-4 h-0.5 rounded-full bg-sky-600 dark:bg-sky-400"
                  />
                )}
                {item.renderIcon(isActive, 'h-[21px] w-[21px]')}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
        </nav>
      )}

      <ExitConfirmModal
        open={showExitConfirm}
        onCancel={() => setShowExitConfirm(false)}
        onConfirmExit={handleConfirmExit}
      />

      {hasExitedWebSession && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="session-ended-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <img
              src="/pwa-192x192.png"
              alt="Calculadora Médica Integral"
              className="mx-auto h-14 w-14 rounded-2xl border border-slate-200 object-cover shadow-xs dark:border-slate-700"
            />
            <h2
              id="session-ended-title"
              className="mt-3 text-base font-bold text-slate-900 dark:text-slate-100"
            >
              Sesión finalizada
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
              Has salido de Calculadora Médica Integral. Ya puedes cerrar esta ventana de forma segura.
            </p>
            <button
              type="button"
              onClick={() => {
                exitingRef.current = false;
                setHasExitedWebSession(false);
                ensureHistoryGuard();
              }}
              className="mt-5 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            >
              <ClinicalResetIcon className="h-4 w-4" />
              <span>Volver a entrar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
