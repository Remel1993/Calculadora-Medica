import { Baby, BarChart3, Ruler, Scale, Table2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import type { WhoIndicatorId, WhoSex } from '../../clinical-core/data/whoGrowthStandards.ts';
import { formatClinicalNumber, roundClinical } from '../../clinical-core/math/precision.ts';
import {
  WHO_INDICATOR_META,
  evaluateWhoIndicator,
  formatAgeMonthsLabel,
  getWhoPercentilesAtAge,
  getWhoReferenceTableRows,
  type WhoEvaluationResult,
} from '../../clinical-core/math/whoLms.ts';
import type { CalculatorInputsState, NumberInputValue } from '../../clinical-core/types/clinical.ts';

interface PediatricGrowthPanelProps {
  inputs: CalculatorInputsState;
  onUpdateSex?: (sex: WhoSex) => void;
}

type PanelTab = 'scale' | 'chart' | 'table';
type AgeWindow = '0-24' | '24-60' | '60-120' | '120-228';

function parseNumericInput(raw: NumberInputValue | undefined, factor = 1): number | null {
  if (!raw || typeof raw.value !== 'string') return null;
  const cleaned = raw.value.trim().replace(',', '.');
  if (!cleaned) return null;
  const num = Number(cleaned);
  if (!Number.isFinite(num) || num < 0) return null;
  return num * factor;
}

function getCanonicalWeightKg(raw: NumberInputValue | undefined): number | null {
  const num = parseNumericInput(raw, 1);
  if (num === null || num <= 0) return null;
  if (raw?.unitId === 'lb') return roundClinical(num * 0.45359237, 2);
  if (raw?.unitId === 'g') return roundClinical(num / 1000, 2);
  return num;
}

function getDefaultWindowForAge(ageMonths: number, indicator: WhoIndicatorId): AgeWindow {
  if (ageMonths <= 24) return '0-24';
  if (ageMonths <= 60) return '24-60';
  if (ageMonths <= 120 || indicator === 'wfa') return '60-120';
  return '120-228';
}

function getAvailableWindows(indicator: WhoIndicatorId): { id: AgeWindow; label: string; min: number; max: number }[] {
  const all: { id: AgeWindow; label: string; min: number; max: number }[] = [
    { id: '0-24', label: '0–2 años', min: 0, max: 24 },
    { id: '24-60', label: '2–5 años', min: 24, max: 60 },
    { id: '60-120', label: '5–10 años', min: 60, max: 120 },
    { id: '120-228', label: '10–19 años', min: 120, max: 228 },
  ];
  const maxM = WHO_INDICATOR_META[indicator].maxMonths;
  return all.filter((w) => w.min < maxM);
}

const ZONE_BADGE_COLORS: Record<string, string> = {
  normal: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  info: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
  low: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
  moderate: 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300',
  high: 'bg-orange-100 text-orange-900 dark:bg-orange-950/60 dark:text-orange-300',
  critical: 'bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300',
};

const PercentileBar: React.FC<{
  title: string;
  icon: React.ReactNode;
  evaluation: WhoEvaluationResult;
}> = ({ title, icon, evaluation }) => {
  const clampedPct = Math.max(1.5, Math.min(98.5, evaluation.percentile));
  const unit = WHO_INDICATOR_META[evaluation.indicator].unit;
  const badgeClass = ZONE_BADGE_COLORS[evaluation.severity] ?? ZONE_BADGE_COLORS.info;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4 dark:border-slate-800 dark:bg-slate-950/60">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-sky-700 shadow-xs dark:bg-slate-900 dark:text-sky-400">
            {icon}
          </span>
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold text-slate-900 sm:text-sm dark:text-slate-100">
              {title}
            </div>
            <div className="font-mono text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
              Medido: <strong className="text-slate-800 dark:text-slate-200">{formatClinicalNumber(evaluation.value, 1)} {unit}</strong> · Promedio P50: {evaluation.p50} {unit}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`rounded-lg px-2.5 py-1 font-mono text-xs font-bold tabular-nums ${badgeClass}`}>
            {evaluation.percentileFormatted}
          </span>
          <span className="font-mono text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
            Z {evaluation.zScore > 0 ? '+' : ''}{formatClinicalNumber(evaluation.zScore, 2)}
          </span>
        </div>
      </div>

      {/* Visual Percentile Scale Bar */}
      <div className="mt-3">
        <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          {/* Colored clinical zones proportional to visual scale */}
          <div className="flex h-full w-full">
            <div className="h-full bg-orange-400/75 dark:bg-orange-500/60" style={{ width: '8%' }} title="< P3" />
            <div className="h-full bg-amber-300/80 dark:bg-amber-500/50" style={{ width: '12%' }} title="P3–P15" />
            <div className="h-full bg-emerald-400/85 dark:bg-emerald-500/65" style={{ width: '60%' }} title="P15–P85 (Zona central)" />
            <div className="h-full bg-amber-300/80 dark:bg-amber-500/50" style={{ width: '12%' }} title="P85–P97" />
            <div className="h-full bg-orange-400/75 dark:bg-orange-500/60" style={{ width: '8%' }} title="> P97" />
          </div>
          {/* Marker pin */}
          <div
            className="absolute top-0 bottom-0 w-1.5 -translate-x-1/2 rounded-full bg-slate-900 ring-2 ring-white dark:bg-white dark:ring-slate-950"
            style={{
              left: `${
                clampedPct <= 3
                  ? (clampedPct / 3) * 8
                  : clampedPct <= 15
                    ? 8 + ((clampedPct - 3) / 12) * 12
                    : clampedPct <= 85
                      ? 20 + ((clampedPct - 15) / 70) * 60
                      : clampedPct <= 97
                        ? 80 + ((clampedPct - 85) / 12) * 12
                        : 92 + ((clampedPct - 97) / 3) * 8
              }%`,
            }}
          />
        </div>
        <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-500 tabular-nums dark:text-slate-400">
          <span>P3 ({evaluation.p3})</span>
          <span>P15 ({evaluation.p15})</span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">P50 ({evaluation.p50})</span>
          <span>P85 ({evaluation.p85})</span>
          <span>P97 ({evaluation.p97})</span>
        </div>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
        <strong className="font-semibold">{evaluation.classification}:</strong> {evaluation.parentExplanation}
      </p>
    </div>
  );
};

export const PediatricGrowthPanel: React.FC<PediatricGrowthPanelProps> = ({
  inputs,
  onUpdateSex,
}) => {
  const rawAge = inputs.ageMonths as NumberInputValue | undefined;
  const ageFactor = rawAge?.unitId === 'years' ? 12 : 1;
  const parsedAge = parseNumericInput(rawAge, ageFactor);
  const ageMonths = parsedAge !== null ? Math.min(228, Math.max(0, parsedAge)) : null;

  const sex: WhoSex = inputs.sex === 'female' ? 'female' : 'male';
  const weightKg = getCanonicalWeightKg(inputs.weight as NumberInputValue | undefined);
  const heightCm = parseNumericInput(inputs.height as NumberInputValue | undefined, 1);
  const headCircCm = parseNumericInput(inputs.headCircumference as NumberInputValue | undefined, 1);

  const bmi =
    weightKg !== null && heightCm !== null && heightCm > 20
      ? roundClinical(weightKg / Math.pow(heightCm / 100, 2), 1)
      : null;

  const [activeTab, setActiveTab] = useState<PanelTab>('scale');
  const [selectedIndicator, setSelectedIndicator] = useState<WhoIndicatorId>('wfa');
  const [ageWindow, setAgeWindow] = useState<AgeWindow>('0-24');

  // Keep chart indicator and age window sensible when age changes
  useEffect(() => {
    if (ageMonths === null) return;
    let nextIndicator = selectedIndicator;
    if (ageMonths > 120 && nextIndicator === 'wfa') {
      nextIndicator = 'lhfa';
      setSelectedIndicator('lhfa');
    } else if (ageMonths > 60 && nextIndicator === 'hcfa') {
      nextIndicator = 'lhfa';
      setSelectedIndicator('lhfa');
    }
    setAgeWindow(getDefaultWindowForAge(ageMonths, nextIndicator));
  }, [ageMonths]);

  const handleSelectIndicator = (next: WhoIndicatorId) => {
    setSelectedIndicator(next);
    const windows = getAvailableWindows(next);
    if (!windows.some((w) => w.id === ageWindow)) {
      setAgeWindow(windows[windows.length - 1].id);
    }
  };

  const wfaEval =
    ageMonths !== null && ageMonths <= 120 && weightKg !== null
      ? evaluateWhoIndicator('wfa', sex, ageMonths, weightKg)
      : null;
  const lhfaEval =
    ageMonths !== null && heightCm !== null && heightCm >= 30 && heightCm <= 220
      ? evaluateWhoIndicator('lhfa', sex, ageMonths, heightCm)
      : null;
  const bmiEval =
    ageMonths !== null && bmi !== null && bmi >= 6 && bmi <= 60
      ? evaluateWhoIndicator('bmifa', sex, ageMonths, bmi)
      : null;
  const hcfaEval =
    ageMonths !== null && ageMonths <= 60 && headCircCm !== null && headCircCm >= 20 && headCircCm <= 65
      ? evaluateWhoIndicator('hcfa', sex, ageMonths, headCircCm)
      : null;

  const availableWindows = getAvailableWindows(selectedIndicator);
  const currentWindow =
    availableWindows.find((w) => w.id === ageWindow) ?? availableWindows[0];

  const chartSeries = useMemo(() => {
    const start = currentWindow.min;
    const end = Math.min(currentWindow.max, WHO_INDICATOR_META[selectedIndicator].maxMonths);
    const step = end - start <= 36 ? 1 : end - start <= 60 ? 2 : 3;
    const pts: {
      m: number;
      p3: number;
      p15: number;
      p50: number;
      p85: number;
      p97: number;
    }[] = [];
    for (let m = start; m <= end; m += step) {
      const b = getWhoPercentilesAtAge(selectedIndicator, sex, m);
      if (b) pts.push({ m, ...b });
    }
    if (pts.length > 0 && pts[pts.length - 1].m !== end) {
      const b = getWhoPercentilesAtAge(selectedIndicator, sex, end);
      if (b) pts.push({ m: end, ...b });
    }
    return pts;
  }, [currentWindow, selectedIndicator, sex]);

  const childPointValue = useMemo(() => {
    if (ageMonths === null) return null;
    if (ageMonths < currentWindow.min || ageMonths > currentWindow.max) return null;
    if (selectedIndicator === 'wfa') return weightKg;
    if (selectedIndicator === 'lhfa') return heightCm;
    if (selectedIndicator === 'bmifa') return bmi;
    if (selectedIndicator === 'hcfa') return headCircCm;
    return null;
  }, [ageMonths, currentWindow, selectedIndicator, weightKg, heightCm, bmi, headCircCm]);

  const tableRows = useMemo(
    () => getWhoReferenceTableRows(selectedIndicator, sex),
    [selectedIndicator, sex],
  );

  // Closest age row in reference table for highlighting
  const closestRowMonth = useMemo(() => {
    if (ageMonths === null || tableRows.length === 0) return null;
    let best = tableRows[0].ageMonths;
    let bestDiff = Math.abs(ageMonths - best);
    for (const r of tableRows) {
      const d = Math.abs(ageMonths - r.ageMonths);
      if (d < bestDiff) {
        best = r.ageMonths;
        bestDiff = d;
      }
    }
    return best;
  }, [ageMonths, tableRows]);

  // SVG chart dimensions & coordinate mappers
  const svgW = 560;
  const svgH = 270;
  const padL = 44;
  const padR = 34;
  const padT = 18;
  const padB = 30;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const yMinRaw = Math.min(
    ...chartSeries.map((d) => d.p3),
    ...(childPointValue !== null ? [childPointValue] : []),
  );
  const yMaxRaw = Math.max(
    ...chartSeries.map((d) => d.p97),
    ...(childPointValue !== null ? [childPointValue] : []),
  );
  const yPad = Math.max(0.5, (yMaxRaw - yMinRaw) * 0.08);
  const yMin = yMinRaw - yPad;
  const yMax = yMaxRaw + yPad;
  const xMin = currentWindow.min;
  const xMax = currentWindow.max;

  const mapX = (m: number) => padL + ((m - xMin) / Math.max(1, xMax - xMin)) * plotW;
  const mapY = (v: number) => padT + plotH - ((v - yMin) / Math.max(0.1, yMax - yMin)) * plotH;

  const buildPath = (key: 'p3' | 'p15' | 'p50' | 'p85' | 'p97') =>
    chartSeries
      .map((pt, i) => `${i === 0 ? 'M' : 'L'}${mapX(pt.m).toFixed(1)},${mapY(pt[key]).toFixed(1)}`)
      .join(' ');

  const buildBandPath = (upper: 'p85' | 'p97', lower: 'p15' | 'p3') => {
    if (chartSeries.length === 0) return '';
    const top = chartSeries
      .map((pt, i) => `${i === 0 ? 'M' : 'L'}${mapX(pt.m).toFixed(1)},${mapY(pt[upper]).toFixed(1)}`)
      .join(' ');
    const bot = [...chartSeries]
      .reverse()
      .map((pt) => `L${mapX(pt.m).toFixed(1)},${mapY(pt[lower]).toFixed(1)}`)
      .join(' ');
    return `${top} ${bot} Z`;
  };

  const indicatorMeta = WHO_INDICATOR_META[selectedIndicator];
  const lastPoint = chartSeries[chartSeries.length - 1];

  const yTicks = useMemo(() => {
    const count = 5;
    const step = (yMax - yMin) / count;
    return Array.from({ length: count + 1 }, (_, i) => yMin + step * i);
  }, [yMin, yMax]);

  const xTicks = useMemo(() => {
    const span = xMax - xMin;
    const step = span <= 24 ? 3 : span <= 60 ? 6 : 12;
    const out: number[] = [];
    for (let m = xMin; m <= xMax; m += step) out.push(m);
    if (out[out.length - 1] !== xMax) out.push(xMax);
    return out;
  }, [xMin, xMax]);

  return (
    <section
      id="pediatric-growth-panel"
      className="w-full min-w-0 overflow-hidden rounded-xl border border-sky-200 bg-white p-3.5 sm:rounded-2xl sm:p-6 dark:border-sky-900/60 dark:bg-slate-900"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between sm:pb-4 dark:border-slate-800">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400">
              <Baby className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-900 sm:text-base dark:text-slate-100">
              Escala, Curvas y Tabla de Percentiles OMS (Guía para Papás y Pediatras)
            </h2>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            Visualiza en qué percentil se encuentra tu hijo según los estándares oficiales de la OMS (0 a 19 años) y consulta los valores esperados por edad.
          </p>
        </div>

        {/* Sex switcher synced with form */}
        <div className="grid shrink-0 grid-cols-2 gap-1 self-start rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => onUpdateSex?.('male')}
            className={`min-h-[36px] rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
              sex === 'male'
                ? 'bg-white text-sky-700 shadow-xs dark:bg-slate-900 dark:text-sky-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Niño
          </button>
          <button
            type="button"
            onClick={() => onUpdateSex?.('female')}
            className={`min-h-[36px] rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
              sex === 'female'
                ? 'bg-white text-rose-700 shadow-xs dark:bg-slate-900 dark:text-rose-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Niña
          </button>
        </div>
      </div>

      {/* Main View Tabs */}
      <div className="mt-3 grid grid-cols-3 gap-1.5 rounded-xl bg-slate-100 p-1 sm:mt-4 dark:bg-slate-950">
        <button
          type="button"
          onClick={() => setActiveTab('scale')}
          className={`flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold sm:text-sm ${
            activeTab === 'scale'
              ? 'bg-white text-sky-700 shadow-xs dark:bg-slate-800 dark:text-sky-300'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Scale className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Escala Papás</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('chart')}
          className={`flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold sm:text-sm ${
            activeTab === 'chart'
              ? 'bg-white text-sky-700 shadow-xs dark:bg-slate-800 dark:text-sky-300'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Gráfica Curvas</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('table')}
          className={`flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold sm:text-sm ${
            activeTab === 'table'
              ? 'bg-white text-sky-700 shadow-xs dark:bg-slate-800 dark:text-sky-300'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Table2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Tabla Edades</span>
        </button>
      </div>

      {/* TAB 1: PARENT-FRIENDLY PERCENTILE SCALE */}
      {activeTab === 'scale' && (
        <div className="mt-4 space-y-3">
          {!wfaEval && !lhfaEval && !bmiEval ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4 text-center dark:border-slate-700 dark:bg-slate-950/50">
              <p className="text-xs font-medium text-slate-700 sm:text-sm dark:text-slate-300">
                Introduce arriba la <strong>edad</strong>, el <strong>peso</strong> y la <strong>talla</strong> de tu hijo para ver su barra visual de percentiles en tiempo real, o cambia a <strong>Gráfica Curvas</strong> / <strong>Tabla Edades</strong> para consultar los valores OMS por edad.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-sky-50/80 px-3 py-2 text-xs text-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
                <span>
                  Evaluación para <strong>{sex === 'male' ? 'Niño' : 'Niña'}</strong> de{' '}
                  <strong>{ageMonths !== null ? formatAgeMonthsLabel(ageMonths) : '—'}</strong>
                </span>
                <span className="text-[11px] opacity-85">
                  Zona verde (P15–P85) y P3–P97 = rango habitual OMS
                </span>
              </div>

              {wfaEval && (
                <PercentileBar
                  title="Peso para la edad (0–10 años)"
                  icon={<Scale className="h-4 w-4" />}
                  evaluation={wfaEval}
                />
              )}

              {lhfaEval && (
                <PercentileBar
                  title={ageMonths !== null && ageMonths < 24 ? 'Longitud para la edad (< 2 años)' : 'Estatura / Talla para la edad'}
                  icon={<Ruler className="h-4 w-4" />}
                  evaluation={lhfaEval}
                />
              )}

              {bmiEval && (
                <PercentileBar
                  title="IMC para la edad (proporción peso-estatura)"
                  icon={<BarChart3 className="h-4 w-4" />}
                  evaluation={bmiEval}
                />
              )}

              {hcfaEval && (
                <PercentileBar
                  title="Perímetro cefálico para la edad (0–5 años)"
                  icon={<Baby className="h-4 w-4" />}
                  evaluation={hcfaEval}
                />
              )}

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] leading-relaxed text-slate-600 sm:text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <strong>¿Cómo se lee un percentil?</strong> Un percentil no es una calificación escolar ni significa que P90 sea “mejor” que P25. Significa en qué posición se ubica respecto a 100 niños sanos de su misma edad y sexo. Que crezca siguiendo su propio carril (por ejemplo siempre alrededor de P25 o siempre alrededor de P75) suele ser señal de crecimiento sano.
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2 & 3 INDICATOR SELECTOR */}
      {(activeTab === 'chart' || activeTab === 'table') && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'wfa', label: 'Peso (0–10 a)' },
                { id: 'lhfa', label: 'Talla (0–19 a)' },
                { id: 'bmifa', label: 'IMC (0–19 a)' },
                { id: 'hcfa', label: 'P. Cefálico (0–5 a)' },
              ] as { id: WhoIndicatorId; label: string }[]
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectIndicator(item.id)}
                className={`min-h-[38px] rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  selectedIndicator === item.id
                    ? 'border-sky-600 bg-sky-50 text-sky-800 dark:border-sky-500 dark:bg-sky-950/60 dark:text-sky-300'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* TAB 2: INTERACTIVE WHO CURVES SVG */}
          {activeTab === 'chart' && (
            <div className="space-y-3">
              {/* Age window filter */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {indicatorMeta.label} · {sex === 'male' ? 'Niños' : 'Niñas'}
                </span>
                <div className="flex flex-wrap gap-1">
                  {availableWindows.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setAgeWindow(w.id)}
                      className={`min-h-[32px] rounded-md px-2 py-1 text-[11px] font-medium ${
                        currentWindow.id === w.id
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950">
                <svg
                  viewBox={`0 0 ${svgW} ${svgH}`}
                  className="h-auto w-full select-none"
                  role="img"
                  aria-label={`Gráfica OMS ${indicatorMeta.label} para ${sex === 'male' ? 'niños' : 'niñas'}`}
                >
                  {/* Grid lines */}
                  {yTicks.map((val, idx) => {
                    const y = mapY(val);
                    return (
                      <g key={idx}>
                        <line
                          x1={padL}
                          x2={svgW - padR}
                          y1={y}
                          y2={y}
                          stroke="currentColor"
                          className="text-slate-200 dark:text-slate-800"
                          strokeWidth="1"
                        />
                        <text
                          x={padL - 6}
                          y={y + 3.5}
                          textAnchor="end"
                          className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
                        >
                          {formatClinicalNumber(val, 1)}
                        </text>
                      </g>
                    );
                  })}

                  {xTicks.map((m) => {
                    const x = mapX(m);
                    const label = m < 24 ? `${m}m` : `${formatClinicalNumber(m / 12, m % 12 === 0 ? 0 : 1)}a`;
                    return (
                      <g key={m}>
                        <line
                          x1={x}
                          x2={x}
                          y1={padT}
                          y2={svgH - padB}
                          stroke="currentColor"
                          className="text-slate-100 dark:text-slate-800/70"
                          strokeWidth="1"
                        />
                        <text
                          x={x}
                          y={svgH - 10}
                          textAnchor="middle"
                          className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
                        >
                          {label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Outer band P3-P97 */}
                  <path d={buildBandPath('p97', 'p3')} fill="rgba(245, 158, 11, 0.08)" />
                  {/* Healthy central band P15-P85 */}
                  <path d={buildBandPath('p85', 'p15')} fill="rgba(16, 185, 129, 0.14)" />

                  {/* Percentile curves */}
                  <path d={buildPath('p3')} fill="none" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="4 3" />
                  <path d={buildPath('p15')} fill="none" stroke="#0284c7" strokeWidth="1.3" strokeDasharray="2 3" />
                  <path d={buildPath('p50')} fill="none" stroke="#059669" strokeWidth="2.4" />
                  <path d={buildPath('p85')} fill="none" stroke="#0284c7" strokeWidth="1.3" strokeDasharray="2 3" />
                  <path d={buildPath('p97')} fill="none" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="4 3" />

                  {/* Right-edge labels */}
                  {lastPoint && (
                    <>
                      <text x={svgW - padR + 4} y={mapY(lastPoint.p97) + 3} className="fill-orange-600 font-mono text-[9px] font-bold dark:fill-orange-400">P97</text>
                      <text x={svgW - padR + 4} y={mapY(lastPoint.p85) + 3} className="fill-sky-600 font-mono text-[9px] dark:fill-sky-400">P85</text>
                      <text x={svgW - padR + 4} y={mapY(lastPoint.p50) + 3} className="fill-emerald-700 font-mono text-[9px] font-bold dark:fill-emerald-400">P50</text>
                      <text x={svgW - padR + 4} y={mapY(lastPoint.p15) + 3} className="fill-sky-600 font-mono text-[9px] dark:fill-sky-400">P15</text>
                      <text x={svgW - padR + 4} y={mapY(lastPoint.p3) + 3} className="fill-orange-600 font-mono text-[9px] font-bold dark:fill-orange-400">P3</text>
                    </>
                  )}

                  {/* Patient measurement pin */}
                  {ageMonths !== null && childPointValue !== null && (
                    <g>
                      <line
                        x1={mapX(ageMonths)}
                        x2={mapX(ageMonths)}
                        y1={padT}
                        y2={svgH - padB}
                        stroke="#0284c7"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                      />
                      <circle
                        cx={mapX(ageMonths)}
                        cy={mapY(childPointValue)}
                        r="6"
                        className="fill-sky-600 stroke-white dark:fill-sky-400 dark:stroke-slate-950"
                        strokeWidth="2.2"
                      />
                    </g>
                  )}

                  {/* Y-axis unit */}
                  <text
                    x={padL}
                    y={11}
                    className="fill-slate-500 font-mono text-[10px] font-semibold dark:fill-slate-400"
                  >
                    {indicatorMeta.unit}
                  </text>
                </svg>

                {/* Legend */}
                <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-slate-100 pt-2 text-[11px] text-slate-600 dark:border-slate-800 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-0.5 w-4 bg-emerald-600" />
                    <strong>P50</strong> (Promedio)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-0.5 w-4 border-t-2 border-dotted border-sky-600" />
                    P15 / P85 (Zona central)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-orange-600" />
                    P3 / P97 (Límites habituales)
                  </span>
                  {ageMonths !== null && childPointValue !== null && (
                    <span className="flex items-center gap-1.5 font-semibold text-sky-700 dark:text-sky-400">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-600 dark:bg-sky-400" />
                      Tu hijo ({formatClinicalNumber(childPointValue, 1)} {indicatorMeta.unit})
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PARENT-FRIENDLY AGE REFERENCE TABLE */}
          {activeTab === 'table' && (
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span>
                  Valores de referencia OMS para <strong>{indicatorMeta.label}</strong> ({sex === 'male' ? 'Niños' : 'Niñas'}) en <strong>{indicatorMeta.unit}</strong>:
                </span>
                {closestRowMonth !== null && (
                  <span className="rounded bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
                    Fila resaltada: edad más cercana
                  </span>
                )}
              </div>

              <div className="max-h-[380px] w-full overflow-x-auto overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full min-w-[340px] border-collapse text-left text-[11px] sm:text-xs">
                  <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <tr>
                      <th className="px-2.5 py-2 font-semibold">Edad</th>
                      <th className="px-2 py-2 text-right font-semibold text-orange-700 dark:text-orange-400">
                        P3 <span className="hidden sm:inline font-normal">(Bajo)</span>
                      </th>
                      <th className="px-2 py-2 text-right font-semibold">P15</th>
                      <th className="px-2 py-2 text-right font-bold text-emerald-700 dark:text-emerald-400">
                        P50 <span className="hidden sm:inline font-normal">(Prom.)</span>
                      </th>
                      <th className="px-2 py-2 text-right font-semibold">P85</th>
                      <th className="px-2 py-2 text-right font-semibold text-orange-700 dark:text-orange-400">
                        P97 <span className="hidden sm:inline font-normal">(Alto)</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {tableRows.map((row) => {
                      const isClosest = closestRowMonth === row.ageMonths;
                      return (
                        <tr
                          key={row.ageMonths}
                          className={
                            isClosest
                              ? 'bg-sky-50 font-semibold text-sky-950 dark:bg-sky-950/50 dark:text-sky-100'
                              : 'bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60'
                          }
                        >
                          <td className="px-2.5 py-2 whitespace-nowrap">{row.ageLabel}</td>
                          <td className="px-2 py-2 text-right font-mono tabular-nums">{row.p3}</td>
                          <td className="px-2 py-2 text-right font-mono tabular-nums">{row.p15}</td>
                          <td className="px-2 py-2 text-right font-mono font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                            {row.p50}
                          </td>
                          <td className="px-2 py-2 text-right font-mono tabular-nums">{row.p85}</td>
                          <td className="px-2 py-2 text-right font-mono tabular-nums">{row.p97}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
