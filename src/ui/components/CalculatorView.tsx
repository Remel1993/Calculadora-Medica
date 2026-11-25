import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import {
  ClinicalAlertOctagonIcon,
  ClinicalCheckShieldIcon,
  ClinicalConsoleIcon,
  ClinicalEvidenceBookIcon,
  ClinicalInfoPulseIcon,
  ClinicalResetIcon,
  ClinicalSafetyShieldIcon,
  ClinicalStarIcon,
  ClinicalWarningIcon,
} from '../icons/clinicalUiIcons.tsx';
import {
  createInitialInputs,
  validateCalculatorInputs,
} from '../../clinical-core/math/precision.ts';
import { SPECIALTY_MAP, SUBCATEGORY_LABELS } from '../../clinical-core/registries/specialties.ts';
import type {
  CalculationOutput,
  CalculatorDefinition,
  CalculatorInputsState,
  NumberInputValue,
  SeverityLevel,
  ValidationError,
} from '../../clinical-core/types/clinical.ts';
import {
  ClinicalVisualGuide,
  SUPPORTED_VISUAL_GUIDE_IDS,
} from './ClinicalVisualGuides.tsx';
import { MocaInteractiveGuide } from './MocaInteractiveGuide.tsx';
import { ObstetricGrowthPanel } from './ObstetricGrowthPanel.tsx';
import { PediatricGrowthPanel } from './PediatricGrowthPanel.tsx';

interface CalculatorViewProps {
  calculator: CalculatorDefinition;
  isFavorite: boolean;
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
  onSaveHistory: (calculator: CalculatorDefinition, output: CalculationOutput) => void;
}

const SEVERITY_STYLES: Record<
  SeverityLevel,
  {
    container: string;
    labelClass: string;
    icon: React.ComponentType<{ className?: string }>;
    tag: string;
  }
> = {
  normal: {
    container:
      'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/70 dark:bg-emerald-950/30',
    labelClass: 'text-emerald-800 dark:text-emerald-300',
    icon: ClinicalCheckShieldIcon,
    tag: 'Referencia / Normal',
  },
  low: {
    container:
      'border-sky-200 bg-sky-50/70 dark:border-sky-900/70 dark:bg-sky-950/30',
    labelClass: 'text-sky-800 dark:text-sky-300',
    icon: ClinicalInfoPulseIcon,
    tag: 'Riesgo bajo / Leve',
  },
  moderate: {
    container:
      'border-amber-200 bg-amber-50/80 dark:border-amber-900/70 dark:bg-amber-950/30',
    labelClass: 'text-amber-900 dark:text-amber-300',
    icon: ClinicalWarningIcon,
    tag: 'Riesgo moderado',
  },
  high: {
    container:
      'border-orange-300 bg-orange-50/80 dark:border-orange-900/70 dark:bg-orange-950/30',
    labelClass: 'text-orange-900 dark:text-orange-300',
    icon: ClinicalAlertOctagonIcon,
    tag: 'Riesgo alto',
  },
  critical: {
    container:
      'border-rose-300 bg-rose-50/80 dark:border-rose-900/70 dark:bg-rose-950/30',
    labelClass: 'text-rose-900 dark:text-rose-300',
    icon: ClinicalSafetyShieldIcon,
    tag: 'Crítico / Muy alto',
  },
  info: {
    container:
      'border-slate-200 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900/60',
    labelClass: 'text-slate-800 dark:text-slate-200',
    icon: ClinicalInfoPulseIcon,
    tag: 'Informativo',
  },
};

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  calculator,
  isFavorite,
  onBack,
  onToggleFavorite,
  onSaveHistory,
}) => {
  const [inputs, setInputs] = useState<CalculatorInputsState>(() =>
    createInitialInputs(calculator),
  );
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [output, setOutput] = useState<CalculationOutput | null>(null);
  const [isOutputStale, setIsOutputStale] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showClinicalInfo, setShowClinicalInfo] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setInputs(createInitialInputs(calculator));
    setErrors([]);
    setOutput(null);
    setIsOutputStale(false);
    setSubmitError(null);
    setShowClinicalInfo(false);
    setResetCounter((c) => c + 1);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [calculator]);

  const errorByField = errors.reduce(
    (acc, err) => {
      acc[err.fieldId] = err.message;
      return acc;
    },
    {} as Record<string, string>,
  );

  const handleNumberChange = (fieldId: string, patch: Partial<NumberInputValue>) => {
    setInputs((prev) => {
      const current = (prev[fieldId] as NumberInputValue) ?? { value: '', unitId: '' };
      return {
        ...prev,
        [fieldId]: {
          ...current,
          ...patch,
        },
      };
    });
    if (errors.length > 0) {
      setErrors((prev) => prev.filter((e) => e.fieldId !== fieldId));
    }
    if (output !== null) {
      setIsOutputStale(true);
    }
    setSubmitError(null);
  };

  const handleValueChange = (fieldId: string, value: string | boolean) => {
    setInputs((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    if (errors.length > 0) {
      setErrors((prev) => prev.filter((e) => e.fieldId !== fieldId));
    }
    if (output !== null) {
      setIsOutputStale(true);
    }
    setSubmitError(null);
  };

  const formRef = useRef<HTMLFormElement | null>(null);

  const handleFieldFocusScroll = (el: HTMLElement) => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      window.setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 240);
    }
  };

  const handleEnterAdvance = (
    e: React.KeyboardEvent<HTMLInputElement>,
    isLastTextField: boolean,
  ) => {
    if (e.key !== 'Enter') return;
    if (isLastTextField) {
      return;
    }
    const form = formRef.current;
    if (!form) return;
    const focusables = Array.from(
      form.querySelectorAll<HTMLInputElement>('input[type="text"], input[type="date"]'),
    ).filter((el) => !el.disabled && el.offsetParent !== null);
    const idx = focusables.indexOf(e.currentTarget);
    const next = idx >= 0 ? focusables[idx + 1] : undefined;
    if (next) {
      e.preventDefault();
      next.focus();
    }
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const validationErrors = validateCalculatorInputs(calculator, inputs);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setOutput(null);
      setIsOutputStale(false);
      setSubmitError('Revisa los campos señalados antes de calcular.');
      return;
    }

    try {
      const calculated = calculator.calculate(inputs);
      setErrors([]);
      setSubmitError(null);
      setOutput(calculated);
      setIsOutputStale(false);
      onSaveHistory(calculator, calculated);

      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        window.requestAnimationFrame(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      }
    } catch (err) {
      setOutput(null);
      setIsOutputStale(false);
      setSubmitError(err instanceof Error ? err.message : 'Error al ejecutar el cálculo.');
    }
  };

  const handleReset = () => {
    setInputs(createInitialInputs(calculator));
    setErrors([]);
    setOutput(null);
    setIsOutputStale(false);
    setSubmitError(null);
    setResetCounter((c) => c + 1);
  };

  const primarySpec = SPECIALTY_MAP[calculator.primarySpecialty];
  const secondarySpecs = calculator.secondarySpecialties.map((id) => SPECIALTY_MAP[id].name);
  const severityStyle = output ? SEVERITY_STYLES[output.severity] : null;
  const SeverityIcon = severityStyle?.icon;

  return (
    <div className="w-full min-w-0 space-y-3.5 sm:space-y-6">
      {/* Top breadcrumb / action bar */}
      <div className="flex w-full min-w-0 items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 sm:gap-2 sm:px-3.5 sm:text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span className="sm:hidden">Volver</span>
          <span className="hidden sm:inline">Volver al listado</span>
        </button>

        <button
          type="button"
          onClick={() => onToggleFavorite(calculator.id)}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 sm:gap-2 sm:px-3.5 sm:text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
        >
          <ClinicalStarIcon
            filled={isFavorite}
            className={`h-[18px] w-[18px] shrink-0 ${isFavorite ? 'text-amber-500 dark:text-amber-400' : ''}`}
          />
          <span className="sm:hidden">{isFavorite ? 'Favorito' : 'Guardar'}</span>
          <span className="hidden sm:inline">
            {isFavorite ? 'En favoritos' : 'Guardar favorito'}
          </span>
        </button>
      </div>

      {/* Header & Clinical Context (collapsible on mobile to prioritize input fields) */}
      <section className="w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 sm:rounded-2xl sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex w-full min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 sm:text-xs dark:text-slate-400">
          <span className="font-semibold text-sky-700 dark:text-sky-400">
            {primarySpec.name}
          </span>
          {secondarySpecs.length > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="min-w-0 break-words">
                También en: {secondarySpecs.join(', ')}
              </span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span>{SUBCATEGORY_LABELS[calculator.subcategory]}</span>
        </div>

        <h1 className="mt-1.5 break-words text-lg font-bold tracking-tight text-slate-900 text-balance sm:mt-2 sm:text-2xl lg:text-3xl dark:text-slate-100">
          {calculator.name}
        </h1>
        <p className="mt-1 max-w-3xl break-words text-xs leading-relaxed text-slate-600 sm:mt-2 sm:text-sm lg:text-base dark:text-slate-300">
          {calculator.description}
        </p>

        {/* Mobile disclosure toggle for clinical indication & validated population */}
        <button
          type="button"
          onClick={() => setShowClinicalInfo((prev) => !prev)}
          aria-expanded={showClinicalInfo}
          className="mt-2.5 flex min-h-[42px] w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 md:hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <span className="min-w-0 truncate">Indicación clínica y población validada</span>
          {showClinicalInfo ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
          )}
        </button>

        <div
          className={`${showClinicalInfo ? 'grid' : 'hidden'} mt-3 min-w-0 gap-3 border-t border-slate-100 pt-3 text-xs sm:text-sm md:mt-4 md:grid md:grid-cols-2 md:gap-4 md:pt-4 dark:border-slate-800`}
        >
          <div className="min-w-0">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs dark:text-slate-400">
              Indicación clínica
            </h2>
            <p className="mt-1 break-words leading-relaxed text-slate-700 dark:text-slate-300">
              {calculator.clinicalIndication}
            </p>
          </div>
          <div className="min-w-0">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs dark:text-slate-400">
              Población validada
            </h2>
            <p className="mt-1 break-words leading-relaxed text-slate-700 dark:text-slate-300">
              {calculator.validatedPopulation}
            </p>
            {calculator.requiredLabsNote && (
              <p className="mt-1.5 break-words text-xs font-medium text-sky-800 dark:text-sky-300">
                Pruebas requeridas: {calculator.requiredLabsNote}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main 2-column Console: Form Inputs (left) & Result + Evidence (right) */}
      <div className="grid w-full min-w-0 gap-4 sm:gap-6 lg:grid-cols-12 lg:items-start">
        {/* Form Section */}
        <form
          ref={formRef}
          onSubmit={handleCalculate}
          noValidate
          className="w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 sm:rounded-2xl sm:p-6 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex min-w-0 items-center justify-between gap-2 border-b border-slate-100 pb-2.5 sm:pb-4 dark:border-slate-800">
            <h2 className="shrink-0 text-sm font-semibold text-slate-900 sm:text-base dark:text-slate-100">
              Parámetros clínicos
            </h2>
            <span className="min-w-0 truncate text-right text-[11px] text-slate-500 sm:text-xs dark:text-slate-400">
              v{calculator.version}
            </span>
          </div>

          <div className="mt-3.5 min-w-0 space-y-3.5 sm:mt-5 sm:space-y-4">
            {calculator.id === 'moca-test' && (
              <MocaInteractiveGuide
                inputs={inputs}
                resetCounter={resetCounter}
                onUpdateNumber={(fieldId, val) => handleNumberChange(fieldId, { value: val })}
                onUpdateBoolean={(fieldId, val) => handleValueChange(fieldId, val)}
              />
            )}
            {calculator.id === 'who-growth' && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-200 bg-sky-50/70 px-3 py-2 text-xs text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200">
                <span>¿Solo quieres consultar las curvas o la tabla por edades?</span>
                <button
                  type="button"
                  onClick={() => {
                    document
                      .getElementById('pediatric-growth-panel')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="font-semibold text-sky-700 underline underline-offset-2 hover:text-sky-800 dark:text-sky-300"
                >
                  Ir a Tabla y Gráfica OMS ↓
                </button>
              </div>
            )}
            {calculator.id === 'obstetric-weight-gain' && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-200 bg-sky-50/70 px-3 py-2 text-xs text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200">
                <span>¿Deseas ver directamente la gráfica materna, fetal o tabla semanal?</span>
                <button
                  type="button"
                  onClick={() => {
                    document
                      .getElementById('obstetric-growth-panel')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="font-semibold text-sky-700 underline underline-offset-2 hover:text-sky-800 dark:text-sky-300"
                >
                  Ir a Gráficas Materna y Fetal ↓
                </button>
              </div>
            )}
            {(() => {
              const VISUAL_AFTER_FIELD: Record<string, string> = {
                'diabetic-foot-wagner-pedis-wifi': 'scaleMode',
                'tanner-stages': 'sex',
                'ottawa-ankle-knee': 'region',
                'burns-parkland': 'hoursElapsed',
              };
              const hasVisualGuide = SUPPORTED_VISUAL_GUIDE_IDS.has(calculator.id);
              const afterFieldId = VISUAL_AFTER_FIELD[calculator.id] ?? null;

              const visibleTextFieldIds = calculator.fields
                .filter(
                  (f) =>
                    (f.type === 'number' || f.type === 'date') &&
                    (!f.visibleWhen || f.visibleWhen(inputs)),
                )
                .map((f) => f.id);
              const lastTextFieldId =
                visibleTextFieldIds[visibleTextFieldIds.length - 1] ?? null;

              const renderField = (field: (typeof calculator.fields)[number]) => {
              if (field.visibleWhen && !field.visibleWhen(inputs)) {
                return null;
              }
              const fieldError = errorByField[field.id];
              const isLastTextField = field.id === lastTextFieldId;

              if (field.type === 'number') {
                const val = (inputs[field.id] as NumberInputValue) ?? {
                  value: '',
                  unitId: field.defaultUnitId,
                };
                const allowsNegative =
                  field.min < 0 || field.units.some((u) => (u.min ?? field.min) < 0);
                return (
                  <div key={field.id} className="min-w-0 space-y-1">
                    <label
                      htmlFor={`field-${field.id}`}
                      className="block break-words text-xs font-medium text-slate-800 sm:text-sm dark:text-slate-200"
                    >
                      {field.label}
                    </label>
                    <div className="flex w-full min-w-0 items-stretch gap-2">
                      <input
                        id={`field-${field.id}`}
                        type="text"
                        inputMode={allowsNegative ? 'text' : 'decimal'}
                        enterKeyHint={isLastTextField ? 'done' : 'next'}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        value={val.value}
                        placeholder={field.placeholder}
                        onFocus={(e) => handleFieldFocusScroll(e.currentTarget)}
                        onKeyDown={(e) => handleEnterAdvance(e, isLastTextField)}
                        onChange={(e) =>
                          handleNumberChange(field.id, { value: e.target.value })
                        }
                        aria-invalid={Boolean(fieldError)}
                        className={`min-h-[44px] w-0 min-w-0 flex-1 rounded-lg border bg-slate-50 px-3 py-2 font-mono text-base tabular-nums text-slate-900 transition-colors focus:bg-white focus:outline-none focus:ring-2 sm:rounded-xl sm:px-3.5 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900 ${
                          fieldError
                            ? 'border-rose-500 focus:ring-rose-500/30'
                            : 'border-slate-300 focus:border-sky-600 focus:ring-sky-600/20 dark:border-slate-700 dark:focus:border-sky-500'
                        }`}
                      />
                      {field.units.length > 1 ? (
                        <select
                          aria-label={`Unidad para ${field.label}`}
                          value={val.unitId}
                          onChange={(e) =>
                            handleNumberChange(field.id, { unitId: e.target.value })
                          }
                          className="min-h-[44px] max-w-[46%] min-w-0 shrink-0 rounded-lg border border-slate-300 bg-slate-100 px-2 py-2 text-base font-medium text-slate-800 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20 sm:rounded-xl sm:px-3 sm:text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        >
                          {field.units.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex min-h-[44px] max-w-[46%] shrink-0 items-center truncate rounded-lg border border-slate-200 bg-slate-100 px-2.5 text-xs font-medium text-slate-600 sm:rounded-xl sm:px-3.5 sm:text-sm dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300">
                          <span className="truncate">{field.units[0]?.label}</span>
                        </div>
                      )}
                    </div>
                    {field.helpText && (
                      <p className="break-words text-[11px] leading-snug text-slate-500 sm:text-xs dark:text-slate-400">
                        {field.helpText}
                      </p>
                    )}
                    {fieldError && (
                      <p
                        role="alert"
                        className="break-words text-xs font-medium text-rose-600 dark:text-rose-400"
                      >
                        {fieldError}
                      </p>
                    )}
                  </div>
                );
              }

              if (field.type === 'select') {
                const selectedVal = (inputs[field.id] as string) ?? '';
                const hasDescriptions = field.options.some((o) => Boolean(o.description));
                const allShortLabels =
                  !hasDescriptions && field.options.every((o) => o.label.length <= 16);
                const gridColsClass = hasDescriptions
                  ? 'grid-cols-1'
                  : allShortLabels
                    ? 'grid-cols-2'
                    : 'grid-cols-1 sm:grid-cols-2';

                return (
                  <div key={field.id} className="min-w-0 space-y-1.5">
                    <span className="block break-words text-xs font-medium text-slate-800 sm:text-sm dark:text-slate-200">
                      {field.label}
                    </span>
                    {field.helpText && (
                      <p className="break-words text-[11px] leading-snug text-slate-500 sm:text-xs dark:text-slate-400">
                        {field.helpText}
                      </p>
                    )}
                    <div className={`grid w-full min-w-0 gap-1.5 sm:gap-2 ${gridColsClass}`}>
                      {field.options.map((opt) => {
                        const active = selectedVal === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleValueChange(field.id, opt.value)}
                            aria-pressed={active}
                            className={`flex min-h-[44px] w-full min-w-0 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs font-medium sm:rounded-xl sm:px-3.5 sm:py-2.5 sm:text-sm ${
                              active
                                ? 'border-sky-600 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/50 dark:text-sky-200'
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <span className="block break-words leading-snug">{opt.label}</span>
                              {opt.description && (
                                <span className="mt-0.5 block break-words text-[11px] font-normal opacity-80 sm:text-xs">
                                  {opt.description}
                                </span>
                              )}
                            </div>
                            {typeof opt.points === 'number' && (
                              <span className="shrink-0 font-mono text-[11px] tabular-nums opacity-75 sm:text-xs">
                                {opt.points >= 0 ? `+${opt.points}` : opt.points}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {fieldError && (
                      <p
                        role="alert"
                        className="break-words text-xs font-medium text-rose-600 dark:text-rose-400"
                      >
                        {fieldError}
                      </p>
                    )}
                  </div>
                );
              }

              if (field.type === 'date') {
                const dateVal = typeof inputs[field.id] === 'string' ? (inputs[field.id] as string) : '';
                return (
                  <div key={field.id} className="min-w-0 space-y-1">
                    <label
                      htmlFor={`field-${field.id}`}
                      className="block break-words text-xs font-medium text-slate-800 sm:text-sm dark:text-slate-200"
                    >
                      {field.label}
                    </label>
                    <input
                      id={`field-${field.id}`}
                      type="date"
                      value={dateVal}
                      onFocus={(e) => handleFieldFocusScroll(e.currentTarget)}
                      onChange={(e) => handleValueChange(field.id, e.target.value)}
                      aria-invalid={Boolean(fieldError)}
                      className={`block min-h-[44px] w-full min-w-0 max-w-full rounded-lg border bg-slate-50 px-3 py-2 font-mono text-base text-slate-900 transition-colors focus:bg-white focus:outline-none focus:ring-2 sm:rounded-xl sm:px-3.5 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900 ${
                        fieldError
                          ? 'border-rose-500 focus:ring-rose-500/30'
                          : 'border-slate-300 focus:border-sky-600 focus:ring-sky-600/20 dark:border-slate-700 dark:focus:border-sky-500'
                      }`}
                    />
                    {field.helpText && (
                      <p className="break-words text-[11px] leading-snug text-slate-500 sm:text-xs dark:text-slate-400">
                        {field.helpText}
                      </p>
                    )}
                    {fieldError && (
                      <p
                        role="alert"
                        className="break-words text-xs font-medium text-rose-600 dark:text-rose-400"
                      >
                        {fieldError}
                      </p>
                    )}
                  </div>
                );
              }

              // Boolean field (Clinical criterion toggle)
              const boolVal = inputs[field.id] === true;
              const falseLabel = field.falseLabel ?? 'No';
              const trueLabel = field.trueLabel ?? 'Sí';
              const compactRow = falseLabel.length <= 10 && trueLabel.length <= 10;

              return (
                <div
                  key={field.id}
                  className="w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 sm:rounded-xl sm:p-3.5 dark:border-slate-800 dark:bg-slate-950/60"
                >
                  <div
                    className={`flex min-w-0 gap-2.5 ${
                      compactRow
                        ? 'items-center justify-between'
                        : 'flex-col sm:flex-row sm:items-center sm:justify-between'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="block break-words text-xs font-medium leading-snug text-slate-800 sm:text-sm dark:text-slate-200">
                        {field.label}
                      </span>
                      {field.helpText && (
                        <span className="mt-0.5 block break-words text-[11px] leading-snug text-slate-500 sm:text-xs dark:text-slate-400">
                          {field.helpText}
                        </span>
                      )}
                    </div>

                    <div className="grid max-w-full shrink-0 grid-cols-2 gap-1 rounded-lg bg-slate-200/80 p-1 dark:bg-slate-800">
                      <button
                        type="button"
                        onClick={() => handleValueChange(field.id, false)}
                        aria-pressed={!boolVal}
                        className={`min-h-[38px] min-w-0 rounded-md px-2.5 py-1 text-center text-xs font-semibold leading-tight sm:min-h-[40px] sm:px-3 ${
                          compactRow ? 'whitespace-nowrap' : 'whitespace-normal'
                        } ${
                          !boolVal
                            ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                      >
                        {falseLabel}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleValueChange(field.id, true)}
                        aria-pressed={boolVal}
                        className={`min-h-[38px] min-w-0 rounded-md px-2.5 py-1 text-center text-xs font-semibold leading-tight sm:min-h-[40px] sm:px-3 ${
                          compactRow ? 'whitespace-nowrap' : 'whitespace-normal'
                        } ${
                          boolVal
                            ? 'bg-sky-600 text-white shadow-xs dark:bg-sky-500 dark:text-slate-950'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                      >
                        {trueLabel}
                      </button>
                    </div>
                  </div>
                </div>
              );
              };

              return (
                <>
                  {hasVisualGuide && afterFieldId === null && (
                    <ClinicalVisualGuide
                      calculatorId={calculator.id}
                      inputs={inputs}
                      onSelectValue={(fieldId, val) => handleValueChange(fieldId, val)}
                    />
                  )}
                  {calculator.fields.map((field) => {
                    const node = renderField(field);
                    if (!node) return null;
                    return (
                      <React.Fragment key={field.id}>
                        {node}
                        {hasVisualGuide && afterFieldId === field.id && (
                          <ClinicalVisualGuide
                            calculatorId={calculator.id}
                            inputs={inputs}
                            onSelectValue={(fieldId, val) => handleValueChange(fieldId, val)}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </>
              );
            })()}
          </div>

          {submitError && (
            <div
              role="alert"
              className="mt-3.5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 sm:mt-4 sm:rounded-xl sm:px-3.5 sm:py-2.5 sm:text-sm dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200"
            >
              <ClinicalAlertOctagonIcon className="h-4 w-4 shrink-0" />
              <span className="min-w-0 break-words">{submitError}</span>
            </div>
          )}

          {/* Action Buttons: single horizontal row on mobile & desktop */}
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2 border-t border-slate-100 pt-3.5 sm:mt-6 sm:flex sm:gap-3 sm:pt-5 dark:border-slate-800">
            <button
              type="submit"
              className="inline-flex min-h-[44px] min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 sm:min-h-[48px] sm:px-5 sm:py-3 whitespace-nowrap"
            >
              <ClinicalConsoleIcon className="h-4 w-4 shrink-0" />
              <span className="min-[380px]:hidden">Calcular</span>
              <span className="hidden min-[380px]:inline">Calcular resultado</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 sm:min-h-[48px] sm:gap-2 sm:px-5 sm:py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              <ClinicalResetIcon className="h-4 w-4 shrink-0" />
              <span className="sm:hidden">Limpiar</span>
              <span className="hidden sm:inline">Limpiar campos</span>
            </button>
          </div>
        </form>

        {/* Right Column: Result Display + Safety / Limitations / References */}
        <div ref={resultRef} className="w-full min-w-0 space-y-4 sm:space-y-6 lg:col-span-5">
          {output && severityStyle && SeverityIcon ? (
            <section
              aria-live="polite"
              className={`w-full min-w-0 select-text overflow-hidden rounded-xl border p-4 sm:rounded-2xl sm:p-6 ${severityStyle.container}`}
            >
              {isOutputStale && (
                <div
                  role="status"
                  className="mb-3 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-100/90 px-3 py-2 text-xs font-medium text-amber-950 dark:border-amber-700/70 dark:bg-amber-950/70 dark:text-amber-200"
                >
                  <ClinicalWarningIcon className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" />
                  <span>Parámetros modificados — pulsa Calcular resultado para actualizar.</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                <SeverityIcon className={`h-4 w-4 shrink-0 ${severityStyle.labelClass}`} />
                <span className={`min-w-0 break-words ${severityStyle.labelClass}`}>
                  {severityStyle.tag}
                </span>
              </div>

              <div className="mt-2.5 min-w-0 sm:mt-3">
                <span className="block break-words text-xs font-medium text-slate-600 dark:text-slate-300">
                  {output.primaryResult.label}
                </span>
                <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="font-mono text-3xl font-bold tracking-tight tabular-nums text-slate-900 break-words sm:text-4xl dark:text-slate-50">
                    {output.primaryResult.formattedValue}
                  </span>
                  <span className="font-mono text-sm font-medium text-slate-600 break-words dark:text-slate-300">
                    {output.primaryResult.unit}
                  </span>
                </div>
              </div>

              <div className="mt-3.5 min-w-0 border-t border-slate-900/10 pt-3.5 sm:mt-4 sm:pt-4 dark:border-white/10">
                <div className={`break-words text-sm font-bold ${severityStyle.labelClass}`}>
                  {output.riskClassification}
                </div>
                <p className="mt-1 break-words text-xs leading-relaxed text-slate-800 sm:mt-1.5 sm:text-sm dark:text-slate-200">
                  {output.clinicalInterpretation}
                </p>
              </div>

              {output.secondaryResults && output.secondaryResults.length > 0 && (
                <div className="mt-3.5 min-w-0 space-y-2 border-t border-slate-900/10 pt-3.5 sm:mt-4 sm:pt-4 dark:border-white/10">
                  {output.secondaryResults.map((item) => (
                    <div
                      key={item.label}
                      className="flex min-w-0 flex-col gap-0.5 rounded-lg bg-white/70 px-3 py-2 sm:rounded-xl sm:px-3.5 sm:py-2.5 dark:bg-slate-900/60"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                        <span className="min-w-0 break-words text-xs text-slate-600 dark:text-slate-300">
                          {item.label}
                        </span>
                        <span className="min-w-0 max-w-full font-mono text-sm font-semibold tabular-nums text-slate-900 break-words dark:text-slate-100">
                          {item.formattedValue}{' '}
                          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                            {item.unit}
                          </span>
                        </span>
                      </div>
                      {item.note && (
                        <span className="break-words text-[11px] text-slate-600 sm:text-xs dark:text-slate-400">
                          {item.note}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {output.guidance && output.guidance.length > 0 && (
                <div className="mt-3.5 min-w-0 border-t border-slate-900/10 pt-3.5 sm:mt-4 sm:pt-4 dark:border-white/10">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                    Conducta orientativa (según guía)
                  </h3>
                  <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-slate-800 sm:mt-2 sm:space-y-1.5 sm:text-sm dark:text-slate-200">
                    {output.guidance.map((line) => (
                      <li key={line} className="break-words">
                        • {line}
                      </li>
                    ))}
                  </ul>
                  {output.guidanceDisclaimer && (
                    <p className="mt-2 break-words text-[11px] text-slate-600 sm:text-xs dark:text-slate-400">
                      {output.guidanceDisclaimer}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-3.5 min-w-0 border-t border-slate-900/10 pt-3 text-[11px] text-slate-600 sm:mt-4 sm:text-xs dark:border-white/10 dark:text-slate-400">
                <span className="font-semibold">Fórmula aplicada:</span>{' '}
                <span className="font-mono break-words [overflow-wrap:anywhere]">
                  {output.formulaUsed}
                </span>
              </div>
            </section>
          ) : (
            <section className="w-full min-w-0 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4 text-center sm:rounded-2xl sm:p-6 dark:border-slate-700 dark:bg-slate-900/40">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-200/70 dark:bg-sky-950/60 dark:text-sky-400 dark:ring-sky-800/60">
                <ClinicalConsoleIcon className="h-6 w-6" />
              </span>
              <h3 className="mt-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                Resultado clínico
              </h3>
              <p className="mt-1 break-words text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Completa los parámetros y pulsa <strong>Calcular resultado</strong> para visualizar el valor, la clasificación de riesgo y la interpretación clínica.
              </p>
            </section>
          )}

          {/* Contraindications, Limitations & References */}
          <section className="w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 sm:rounded-2xl sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <ClinicalSafetyShieldIcon className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Cuándo no usar y limitaciones</span>
            </h2>

            {calculator.contraindications.length > 0 && (
              <div className="mt-3 min-w-0">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-400">
                  Contraindicaciones / Exclusiones
                </h3>
                <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {calculator.contraindications.map((item) => (
                    <li key={item} className="break-words">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-3.5 min-w-0 sm:mt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Limitaciones y consideraciones
              </h3>
              <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {calculator.limitations.map((item) => (
                  <li key={item} className="break-words">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 min-w-0 border-t border-slate-100 pt-3.5 sm:mt-5 sm:pt-4 dark:border-slate-800">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <ClinicalEvidenceBookIcon className="h-4 w-4 shrink-0" />
                <span>Referencias bibliográficas</span>
              </h3>
              <ul className="mt-2 select-text space-y-1.5 text-xs leading-relaxed text-slate-600 sm:space-y-2 dark:text-slate-300">
                {calculator.references.map((ref) => (
                  <li key={ref.citation} className="break-words [overflow-wrap:anywhere]">
                    {ref.citation}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {calculator.id === 'who-growth' && (
          <div className="w-full min-w-0 lg:col-span-12">
            <PediatricGrowthPanel
              inputs={inputs}
              onUpdateSex={(nextSex) => handleValueChange('sex', nextSex)}
            />
          </div>
        )}
        {calculator.id === 'obstetric-weight-gain' && (
          <div className="w-full min-w-0 lg:col-span-12">
            <ObstetricGrowthPanel inputs={inputs} />
          </div>
        )}
      </div>
    </div>
  );
};
