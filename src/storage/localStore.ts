import type { SeverityLevel } from '../clinical-core/types/clinical.ts';

export type ThemeMode = 'light' | 'dark';

export interface HistoryEntry {
  id: string;
  calculatorId: string;
  calculatorName: string;
  timestamp: string;
  inputsSummary: string;
  resultText: string;
  riskClassification: string;
  severity: SeverityLevel;
}

const KEYS = {
  THEME: 'cmi_v1_theme',
  FAVORITES: 'cmi_v1_favorites',
  HISTORY: 'cmi_v1_history',
} as const;

const MAX_HISTORY_ENTRIES = 100;

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota errors cleanly without crashing clinical workflow
  }
}

export function loadTheme(): ThemeMode {
  const saved = safeRead<string | null>(KEYS.THEME, null);
  if (saved === 'dark' || saved === 'light') {
    return saved;
  }
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function saveTheme(theme: ThemeMode): void {
  safeWrite(KEYS.THEME, theme);
}

export function loadFavorites(): string[] {
  const data = safeRead<unknown>(KEYS.FAVORITES, []);
  return Array.isArray(data) ? data.filter((item): item is string => typeof item === 'string') : [];
}

export function saveFavorites(favorites: string[]): void {
  safeWrite(KEYS.FAVORITES, favorites);
}

export function loadHistory(): HistoryEntry[] {
  const data = safeRead<unknown>(KEYS.HISTORY, []);
  return Array.isArray(data) ? (data as HistoryEntry[]) : [];
}

export function appendHistoryEntry(entry: HistoryEntry): HistoryEntry[] {
  const current = loadHistory();
  const next = [entry, ...current].slice(0, MAX_HISTORY_ENTRIES);
  safeWrite(KEYS.HISTORY, next);
  return next;
}

export function removeHistoryEntry(id: string): HistoryEntry[] {
  const current = loadHistory();
  const next = current.filter((item) => item.id !== id);
  safeWrite(KEYS.HISTORY, next);
  return next;
}

export function clearHistory(): HistoryEntry[] {
  safeWrite(KEYS.HISTORY, []);
  return [];
}
