import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Calculator,
  CheckCircle2,
  Info,
  RotateCcw,
  ShieldAlert,
  Star,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
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
    icon: CheckCircle2,
    tag: 'Referencia / Normal',
  },
  low: {
    container:
      'border-sky-200 bg-sky-50/70 dark:border-sky-900/70 dark:bg-sky-950/30',
    labelClass: 'text-sky-800 dark:text-sky-300',
    icon: Info,
    tag: 'Riesgo bajo / Leve',
  },
  moderate: {
    container:
      'border-amber-200 bg-amber-50/80 dark:border-amber-900/70 dark:bg-amber-950/30',
    labelClass: 'text-amber-900 dark:text-amber-300',
    icon: AlertTriangle,
    tag: 'Riesgo moderado',
  },
  high: {
    container:
      'border-orange-300 bg-orange-50/80 dark:border-orange-900/70 dark:bg-orange-950/30',
    labelClass: 'text-orange-900 dark:text-orange-300',
    icon: AlertCircle,
    tag: 'Riesgo alto',
  },
  critical: {
    container:
      'border-rose-300 bg-rose-50/80 dark:border-rose-900/70 dark:bg-rose-950/30',
    labelClass: 'text-rose-900 dark:text-rose-300',
    icon: ShieldAlert,
    tag: 'Crítico / Muy alto',
  },
  info: {
    container:
      'border-slate-200 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900/60',
    labelClass: 'text-slate-800 dark:text-slate-200',
    icon: Info,
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
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setInputs(createInitialInputs(calculator));
    setErrors([]);
    setOutput(null);
    setSubmitError(null);
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
    setSubmitError(null);
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateCalculatorInputs(calculator, inputs);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setOutput(null);
      setSubmitError('Revisa los campos señalados antes de calcular.');
      return;
    }

    try {
      const calculated = calculator.calculate(inputs);
      setErrors([]);
      setSubmitError(null);
      setOutput(calculated);
      onSaveHistory(calculator, calculated);
    } catch (err) {
      setOutput(null);
      setSubmitError(err instanceof Error ? err.message : 'Error al ejecutar el cálculo.');
    }
  };

  const handleReset = () => {
    setInputs(createInitialInputs(calculator));
    setErrors([]);
    setOutput(null);
    setSubmitError(null);
  };

  const primarySpec = SPECIALTY_MAP[calculator.primarySpecialty];
  const secondarySpecs = calculator.secondarySpecialties.map((id) => SPECIALTY_MAP[id].name);
  const severityStyle = output ? SEVERITY_STYLES[output.severity] : null;
  const SeverityIcon = severityStyle?.icon;

  return (
    <div className="space-y-6">
      {/* Top breadcrumb / action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span>Volver al listado</span>
        </button>

        <button
          type="button"
          onClick={() => onToggleFavorite(calculator.id)}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap"
        >
          <Star
            className={`h-4 w-4 shrink-0 ${isFavorite ? 'fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400' : ''}`}
          />
          <span>{isFavorite ? 'En favoritos' : 'Guardar favorito'}</span>
        </button>
      </div>

      {/* Header & Clinical Context */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-sky-700 dark:text-sky-400">
            {primarySpec.name}
          </span>
          {secondarySpecs.length > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span>También en: {secondarySpecs.join(', ')}</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span>{SUBCATEGORY_LABELS[calculator.subcategory]}</span>
        </div>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
          {calculator.name}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
          {calculator.description}
        </p>

        <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2 dark:border-slate-800">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Indicación clínica
            </h2>
            <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-300">
              {calculator.clinicalIndication}
            </p>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Población validada
            </h2>
            <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-300">
              {calculator.validatedPopulation}
            </p>
            {calculator.requiredLabsNote && (
              <p className="mt-2 text-xs font-medium text-sky-800 dark:text-sky-300">
                Pruebas requeridas: {calculator.requiredLabsNote}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main 2-column Console: Form Inputs (left) & Result + Evidence (right) */}
      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        {/* Form Section */}
        <form
          onSubmit={handleCalculate}
          noValidate
          className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Parámetros clínicos
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Versión: {calculator.version}
            </span>
          </div>

          <div className="mt-5 space-y-5">
            {calculator.fields.map((field) => {
              if (field.visibleWhen && !field.visibleWhen(inputs)) {
                return null;
              }
              const fieldError = errorByField[field.id];

              if (field.type === 'number') {
                const val = (inputs[field.id] as NumberInputValue) ?? {
                  value: '',
                  unitId: field.defaultUnitId,
                };
                return (
                  <div key={field.id} className="space-y-1.5">
                    <label
                      htmlFor={`field-${field.id}`}
                      className="block text-sm font-medium text-slate-800 dark:text-slate-200"
                    >
                      {field.label}
                    </label>
                    <div className="flex items-stretch gap-2">
                      <input
                        id={`field-${field.id}`}
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        value={val.value}
                        placeholder={field.placeholder}
                        onChange={(e) =>
                          handleNumberChange(field.id, { value: e.target.value })
                        }
                        aria-invalid={Boolean(fieldError)}
                        className={`min-h-[46px] min-w-0 flex-1 rounded-xl border bg-slate-50 px-3.5 py-2.5 font-mono text-base tabular-nums text-slate-900 transition-colors focus:bg-white focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900 ${
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
                          className="min-h-[46px] shrink-0 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        >
                          {field.units.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex min-h-[46px] shrink-0 items-center rounded-xl border border-slate-200 bg-slate-100 px-3.5 text-sm font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300">
                          {field.units[0]?.label}
                        </div>
                      )}
                    </div>
                    {field.helpText && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {field.helpText}
                      </p>
                    )}
                    {fieldError && (
                      <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
                        {fieldError}
                      </p>
                    )}
                  </div>
                );
              }

              if (field.type === 'select') {
                const selectedVal = (inputs[field.id] as string) ?? '';
                const useSingleCol = field.options.length > 2 && field.options.some((o) => Boolean(o.description));
                return (
                  <div key={field.id} className="space-y-2">
                    <span className="block text-sm font-medium text-slate-800 dark:text-slate-200">
                      {field.label}
                    </span>
                    {field.helpText && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {field.helpText}
                      </p>
                    )}
                    <div className={`grid gap-2 ${useSingleCol ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
                      {field.options.map((opt) => {
                        const active = selectedVal === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleValueChange(field.id, opt.value)}
                            aria-pressed={active}
                            className={`flex min-h-[46px] items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                              active
                                ? 'border-sky-600 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/50 dark:text-sky-200'
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="block">{opt.label}</span>
                              {opt.description && (
                                <span className="mt-0.5 block text-xs font-normal opacity-80">
                                  {opt.description}
                                </span>
                              )}
                            </div>
                            {typeof opt.points === 'number' && (
                              <span className="shrink-0 font-mono text-xs tabular-nums opacity-75">
                                {opt.points >= 0 ? `+${opt.points}` : opt.points}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {fieldError && (
                      <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
                        {fieldError}
                      </p>
                    )}
                  </div>
                );
              }

              if (field.type === 'date') {
                const dateVal = typeof inputs[field.id] === 'string' ? (inputs[field.id] as string) : '';
                return (
                  <div key={field.id} className="space-y-1.5">
                    <label
                      htmlFor={`field-${field.id}`}
                      className="block text-sm font-medium text-slate-800 dark:text-slate-200"
                    >
                      {field.label}
                    </label>
                    <input
                      id={`field-${field.id}`}
                      type="date"
                      value={dateVal}
                      onChange={(e) => handleValueChange(field.id, e.target.value)}
                      aria-invalid={Boolean(fieldError)}
                      className={`min-h-[46px] w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 font-mono text-base text-slate-900 transition-colors focus:bg-white focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900 ${
                        fieldError
                          ? 'border-rose-500 focus:ring-rose-500/30'
                          : 'border-slate-300 focus:border-sky-600 focus:ring-sky-600/20 dark:border-slate-700 dark:focus:border-sky-500'
                      }`}
                    />
                    {field.helpText && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {field.helpText}
                      </p>
                    )}
                    {fieldError && (
                      <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
                        {fieldError}
                      </p>
                    )}
                  </div>
                );
              }

              // Boolean field (Clinical criterion toggle)
              const boolVal = inputs[field.id] === true;
              return (
                <div
                  key={field.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/60"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <span className="block text-sm font-medium text-slate-800 dark:text-slate-200">
                        {field.label}
                      </span>
                      {field.helpText && (
                        <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                          {field.helpText}
                        </span>
                      )}
                    </div>

                    <div className="grid shrink-0 grid-cols-2 gap-1.5 rounded-lg bg-slate-200/80 p-1 dark:bg-slate-800">
                      <button
                        type="button"
                        onClick={() => handleValueChange(field.id, false)}
                        aria-pressed={!boolVal}
                        className={`min-h-[40px] rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                          !boolVal
                            ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                      >
                        {field.falseLabel ?? 'No'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleValueChange(field.id, true)}
                        aria-pressed={boolVal}
                        className={`min-h-[40px] rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                          boolVal
                            ? 'bg-sky-600 text-white shadow-xs dark:bg-sky-500 dark:text-slate-950'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                      >
                        {field.trueLabel ?? 'Sí'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {submitError && (
            <div
              role="alert"
              className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row dark:border-slate-800">
            <button
              type="submit"
              className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 whitespace-nowrap"
            >
              <Calculator className="h-4 w-4 shrink-0" />
              <span>Calcular resultado</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              <RotateCcw className="h-4 w-4 shrink-0" />
              <span>Limpiar campos</span>
            </button>
          </div>
        </form>

        {/* Right Column: Result Display + Safety / Limitations / References */}
        <div className="space-y-6 lg:col-span-5">
          {output && severityStyle && SeverityIcon ? (
            <section
              aria-live="polite"
              className={`rounded-2xl border p-5 sm:p-6 ${severityStyle.container}`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                <SeverityIcon className={`h-4 w-4 shrink-0 ${severityStyle.labelClass}`} />
                <span className={severityStyle.labelClass}>{severityStyle.tag}</span>
              </div>

              <div className="mt-3">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {output.primaryResult.label}
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-mono text-4xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-slate-50">
                    {output.primaryResult.formattedValue}
                  </span>
                  <span className="font-mono text-sm font-medium text-slate-600 dark:text-slate-300">
                    {output.primaryResult.unit}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-900/10 pt-4 dark:border-white/10">
                <div className={`text-sm font-bold ${severityStyle.labelClass}`}>
                  {output.riskClassification}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                  {output.clinicalInterpretation}
                </p>
              </div>

              {output.secondaryResults && output.secondaryResults.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-slate-900/10 pt-4 dark:border-white/10">
                  {output.secondaryResults.map((item) => (
                    <div
                      key={item.label}
                      className="flex flex-col gap-0.5 rounded-xl bg-white/70 px-3.5 py-2.5 dark:bg-slate-900/60"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs text-slate-600 dark:text-slate-300">
                          {item.label}
                        </span>
                        <span className="font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                          {item.formattedValue}{' '}
                          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                            {item.unit}
                          </span>
                        </span>
                      </div>
                      {item.note && (
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {item.note}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {output.guidance && output.guidance.length > 0 && (
                <div className="mt-4 border-t border-slate-900/10 pt-4 dark:border-white/10">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                    Conducta orientativa (según guía)
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                    {output.guidance.map((line) => (
                      <li key={line}>• {line}</li>
                    ))}
                  </ul>
                  {output.guidanceDisclaimer && (
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                      {output.guidanceDisclaimer}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4 border-t border-slate-900/10 pt-3 text-xs text-slate-600 dark:border-white/10 dark:text-slate-400">
                <span className="font-semibold">Fórmula aplicada:</span>{' '}
                <span className="font-mono">{output.formulaUsed}</span>
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center dark:border-slate-700 dark:bg-slate-900/40">
              <Calculator className="mx-auto h-7 w-7 text-slate-400 dark:text-slate-500" />
              <h3 className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                Resultado clínico
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Completa los parámetros y pulsa <strong>Calcular resultado</strong> para visualizar el valor, la clasificación de riesgo y la interpretación clínica.
              </p>
            </section>
          )}

          {/* Contraindications, Limitations & References */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>Cuándo no usar y limitaciones</span>
            </h2>

            {calculator.contraindications.length > 0 && (
              <div className="mt-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-400">
                  Contraindicaciones / Exclusiones
                </h3>
                <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {calculator.contraindications.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Limitaciones y consideraciones
              </h3>
              <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {calculator.limitations.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Referencias bibliográficas</span>
              </h3>
              <ul className="mt-2 space-y-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {calculator.references.map((ref) => (
                  <li key={ref.citation}>
                    {ref.citation}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
