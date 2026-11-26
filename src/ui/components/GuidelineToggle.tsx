import { Globe, MapPin } from 'lucide-react';
import React from 'react';
import type { GuidelineScope } from '../../clinical-core/types/clinical.ts';

interface GuidelineToggleProps {
  value: GuidelineScope;
  onChange: (scope: GuidelineScope) => void;
  variant?: 'header' | 'hero' | 'inline';
  label?: string;
  internationalLabel?: string;
  nicaraguaLabel?: string;
  className?: string;
}

export const GuidelineToggle: React.FC<GuidelineToggleProps> = ({
  value,
  onChange,
  variant = 'inline',
  label = 'Guía clínica',
  internationalLabel = 'Internacional',
  nicaraguaLabel = 'Nicaragua (MINSA)',
  className = '',
}) => {
  if (variant === 'hero') {
    return (
      <div
        role="group"
        aria-label="Seleccionar estándar clínico global"
        className={`inline-flex items-center rounded-full border border-white/25 bg-slate-950/25 p-0.5 text-[11px] font-semibold backdrop-blur-xs sm:text-xs ${className}`}
      >
        <button
          type="button"
          onClick={() => onChange('international')}
          aria-pressed={value === 'international'}
          className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors whitespace-nowrap sm:px-3 ${
            value === 'international'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-cyan-100 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Globe className="h-3.5 w-3.5 shrink-0" />
          <span>Internacional</span>
        </button>
        <button
          type="button"
          onClick={() => onChange('nicaragua')}
          aria-pressed={value === 'nicaragua'}
          className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors whitespace-nowrap sm:px-3 ${
            value === 'nicaragua'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-cyan-100 hover:bg-white/10 hover:text-white'
          }`}
        >
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="sm:hidden">Nicaragua</span>
          <span className="hidden sm:inline">Nicaragua (MINSA)</span>
        </button>
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <div
        role="group"
        aria-label="Estándar de guías clínicas"
        className={`inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[11px] font-semibold dark:border-slate-800 dark:bg-slate-900 sm:text-xs ${className}`}
      >
        <button
          type="button"
          onClick={() => onChange('international')}
          aria-pressed={value === 'international'}
          title="Guías Internacionales (OMS / OPS / guías globales)"
          className={`inline-flex min-h-[34px] items-center gap-1 rounded-md px-2 py-1 transition-colors whitespace-nowrap sm:px-2.5 ${
            value === 'international'
              ? 'bg-white text-sky-700 shadow-2xs dark:bg-slate-800 dark:text-sky-300'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Globe className="h-3.5 w-3.5 shrink-0" />
          <span className="sm:hidden">Int.</span>
          <span className="hidden sm:inline">Internacional</span>
        </button>
        <button
          type="button"
          onClick={() => onChange('nicaragua')}
          aria-pressed={value === 'nicaragua'}
          title="Normativas MINSA Nicaragua"
          className={`inline-flex min-h-[34px] items-center gap-1 rounded-md px-2 py-1 transition-colors whitespace-nowrap sm:px-2.5 ${
            value === 'nicaragua'
              ? 'bg-white text-sky-700 shadow-2xs dark:bg-slate-800 dark:text-sky-300'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="sm:hidden">Nic.</span>
          <span className="hidden sm:inline">Nicaragua</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/70 ${className}`}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 sm:text-xs dark:text-slate-300">
        {label}:
      </span>
      <div
        role="group"
        aria-label={label}
        className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900"
      >
        <button
          type="button"
          onClick={() => onChange('international')}
          aria-pressed={value === 'international'}
          className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-md px-2.5 py-1 transition-colors whitespace-nowrap sm:px-3 ${
            value === 'international'
              ? 'bg-sky-600 text-white shadow-2xs dark:bg-sky-500 dark:text-slate-950'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
          }`}
        >
          <Globe className="h-3.5 w-3.5 shrink-0" />
          <span>{internationalLabel}</span>
        </button>
        <button
          type="button"
          onClick={() => onChange('nicaragua')}
          aria-pressed={value === 'nicaragua'}
          className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-md px-2.5 py-1 transition-colors whitespace-nowrap sm:px-3 ${
            value === 'nicaragua'
              ? 'bg-sky-600 text-white shadow-2xs dark:bg-sky-500 dark:text-slate-950'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
          }`}
        >
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>{nicaraguaLabel}</span>
        </button>
      </div>
    </div>
  );
};
