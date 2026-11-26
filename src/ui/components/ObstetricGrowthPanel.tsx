import { Baby, BarChart3, Scale, Table2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
  IOM_2009_TARGETS,
  classifyPrePregnancyBmi,
  computeHadlockEfw1985,
  evaluateFetalWeight,
  evaluateMaternalFetalBalance,
  evaluateMaternalWeightGain,
  getFetalGrowthSeries,
  getIomCurveSeries,
  type PregnancyPlurality,
} from '../../clinical-core/data/obstetricWeightStandards.ts';
import {
  formatClinicalNumber,
  parseStrictNumber,
  roundClinical,
} from '../../clinical-core/math/precision.ts';
import type { CalculatorInputsState, NumberInputValue } from '../../clinical-core/types/clinical.ts';
import { ScrollableTableShell } from './ScrollableTableShell.tsx';

interface ObstetricGrowthPanelProps {
  inputs: CalculatorInputsState;
}

type PanelTab = 'maternal' | 'fetal' | 'combined';

function parseNum(raw: NumberInputValue | undefined): number | null {
  if (!raw || typeof raw.value !== 'string') return null;
  const num = parseStrictNumber(raw.value);
  return num !== null && num > 0 ? num : null;
}

function getWeightKg(raw: NumberInputValue | undefined): number | null {
  const num = parseNum(raw);
  if (num === null) return null;
  if (raw?.unitId === 'lb') return roundClinical(num * 0.45359237, 2);
  return num;
}

function getHeightM(raw: NumberInputValue | undefined): number | null {
  const num = parseNum(raw);
  if (num === null) return null;
  return raw?.unitId === 'cm' ? num / 100 : num;
}

function getMm(raw: NumberInputValue | undefined): number | null {
  const num = parseNum(raw);
  if (num === null) return null;
  return raw?.unitId === 'cm' ? num * 10 : num;
}

function getGrams(raw: NumberInputValue | undefined): number | null {
  const num = parseNum(raw);
  if (num === null) return null;
  return raw?.unitId === 'kg' ? num * 1000 : num;
}

const BADGE_CLASSES: Record<string, string> = {
  normal: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  info: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
  low: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
  moderate: 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300',
  high: 'bg-orange-100 text-orange-900 dark:bg-orange-950/60 dark:text-orange-300',
  critical: 'bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300',
};

export const ObstetricGrowthPanel: React.FC<ObstetricGrowthPanelProps> = ({ inputs }) => {
  const [activeTab, setActiveTab] = useState<PanelTab>('maternal');

  const weeksRaw = parseNum(inputs.gestationalWeeks as NumberInputValue | undefined);
  const weeks = weeksRaw !== null ? Math.min(42, Math.max(4, weeksRaw)) : null;
  const plurality: PregnancyPlurality = inputs.plurality === 'twin' ? 'twin' : 'singleton';

  const preWeightKg = getWeightKg(inputs.preWeight as NumberInputValue | undefined);
  const currentWeightKg = getWeightKg(inputs.currentWeight as NumberInputValue | undefined);
  const heightM = getHeightM(inputs.height as NumberInputValue | undefined);

  const fetalMode = (inputs.fetalInputMode as string) || 'direct';
  const efwGrams = useMemo(() => {
    if (fetalMode === 'none') return null;
    if (fetalMode === 'direct') {
      return getGrams(inputs.efwGrams as NumberInputValue | undefined);
    }
    const bpd = getMm(inputs.bpdMm as NumberInputValue | undefined);
    const hc = getMm(inputs.hcMm as NumberInputValue | undefined);
    const ac = getMm(inputs.acMm as NumberInputValue | undefined);
    const fl = getMm(inputs.flMm as NumberInputValue | undefined);
    if (bpd && hc && ac && fl) {
      return computeHadlockEfw1985({ bpdMm: bpd, hcMm: hc, acMm: ac, flMm: fl });
    }
    return null;
  }, [fetalMode, inputs]);

  const maternalEval = useMemo(() => {
    if (
      weeks === null ||
      preWeightKg === null ||
      currentWeightKg === null ||
      heightM === null ||
      heightM < 1.1 ||
      heightM > 2.2
    ) {
      return null;
    }
    return evaluateMaternalWeightGain({
      preWeightKg,
      currentWeightKg,
      heightM,
      weeks,
      plurality,
    });
  }, [weeks, preWeightKg, currentWeightKg, heightM, plurality]);

  const fetalEval = useMemo(() => {
    if (weeks === null || weeks < 10 || efwGrams === null) return null;
    return evaluateFetalWeight(efwGrams, weeks);
  }, [weeks, efwGrams]);

  const balance = useMemo(() => {
    if (!maternalEval || efwGrams === null) return null;
    return evaluateMaternalFetalBalance(maternalEval.actualGainKg, efwGrams, plurality);
  }, [maternalEval, efwGrams, plurality]);

  const activeCategory = useMemo(() => {
    if (maternalEval) return maternalEval.bmiCategory;
    if (preWeightKg && heightM && heightM >= 1.1) {
      return classifyPrePregnancyBmi(preWeightKg / (heightM * heightM));
    }
    return 'normal';
  }, [maternalEval, preWeightKg, heightM]);

  const iomSeries = useMemo(
    () => getIomCurveSeries(activeCategory, plurality),
    [activeCategory, plurality],
  );

  const fetalSeries = useMemo(() => getFetalGrowthSeries(14, 40), []);

  // SVG dimensions
  const svgW = 560;
  const svgH = 270;
  const padL = 46;
  const padR = 36;
  const padT = 18;
  const padB = 30;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  // Maternal SVG scales
  const matXMin = 0;
  const matXMax = iomSeries[iomSeries.length - 1]?.weeks ?? 41;
  const matYMinRaw = Math.min(
    0,
    ...(maternalEval ? [maternalEval.actualGainKg - 1] : []),
  );
  const matYMaxRaw = Math.max(
    iomSeries[iomSeries.length - 1]?.maxKg ?? 18,
    ...(maternalEval ? [maternalEval.actualGainKg + 1.5] : []),
  );
  const matYMin = Math.floor(matYMinRaw);
  const matYMax = Math.ceil(matYMaxRaw + 1);

  const mapMatX = (w: number) => padL + ((w - matXMin) / Math.max(1, matXMax - matXMin)) * plotW;
  const mapMatY = (kg: number) =>
    padT + plotH - ((kg - matYMin) / Math.max(1, matYMax - matYMin)) * plotH;

  const matBandPath = useMemo(() => {
    if (iomSeries.length === 0) return '';
    const top = iomSeries
      .map((pt, i) => `${i === 0 ? 'M' : 'L'}${mapMatX(pt.weeks).toFixed(1)},${mapMatY(pt.maxKg).toFixed(1)}`)
      .join(' ');
    const bot = [...iomSeries]
      .reverse()
      .map((pt) => `L${mapMatX(pt.weeks).toFixed(1)},${mapMatY(pt.minKg).toFixed(1)}`)
      .join(' ');
    return `${top} ${bot} Z`;
  }, [iomSeries, matYMin, matYMax]);

  const matLinePath = (key: 'minKg' | 'midKg' | 'maxKg') =>
    iomSeries
      .map((pt, i) => `${i === 0 ? 'M' : 'L'}${mapMatX(pt.weeks).toFixed(1)},${mapMatY(pt[key]).toFixed(1)}`)
      .join(' ');

  const matYTicks = useMemo(() => {
    const count = 5;
    const step = (matYMax - matYMin) / count;
    return Array.from({ length: count + 1 }, (_, i) => matYMin + step * i);
  }, [matYMin, matYMax]);

  const matXTicks = useMemo(() => {
    const ticks = [0, 8, 13, 20, 28, 34, matXMax];
    return Array.from(new Set(ticks)).filter((t) => t <= matXMax);
  }, [matXMax]);

  // Fetal SVG scales
  const fetXMin = 14;
  const fetXMax = 40;
  const fetYMin = 0;
  const fetYMax = Math.max(4600, ...(fetalEval ? [fetalEval.efwGrams + 250] : []));

  const mapFetX = (w: number) => padL + ((w - fetXMin) / (fetXMax - fetXMin)) * plotW;
  const mapFetY = (g: number) => padT + plotH - ((g - fetYMin) / (fetYMax - fetYMin)) * plotH;

  const fetBandPath = (upper: 'p97' | 'p90', lower: 'p3' | 'p10') => {
    const top = fetalSeries
      .map((pt, i) => `${i === 0 ? 'M' : 'L'}${mapFetX(pt.weeks).toFixed(1)},${mapFetY(pt[upper]).toFixed(1)}`)
      .join(' ');
    const bot = [...fetalSeries]
      .reverse()
      .map((pt) => `L${mapFetX(pt.weeks).toFixed(1)},${mapFetY(pt[lower]).toFixed(1)}`)
      .join(' ');
    return `${top} ${bot} Z`;
  };

  const fetLinePath = (key: 'p3' | 'p10' | 'p50' | 'p90' | 'p97') =>
    fetalSeries
      .map((pt, i) => `${i === 0 ? 'M' : 'L'}${mapFetX(pt.weeks).toFixed(1)},${mapFetY(pt[key]).toFixed(1)}`)
      .join(' ');

  const fetYTicks = [0, 1000, 2000, 3000, 4000, ...(fetYMax > 4700 ? [5000] : [])];
  const fetXTicks = [14, 18, 22, 26, 30, 34, 38, 40];

  const bmiMeta = IOM_2009_TARGETS[activeCategory];
  const lastIomPt = iomSeries[iomSeries.length - 1];
  const lastFetPt = fetalSeries[fetalSeries.length - 1];

  // Combined reference table (selected clinical milestone weeks 12..40)
  const combinedRows = useMemo(() => {
    const milestoneWeeks = [12, 16, 20, 24, 28, 30, 32, 34, 36, 37, 38, 39, 40];
    return milestoneWeeks.map((w) => {
      const mat = iomSeries.find((r) => r.weeks === w) ?? iomSeries[iomSeries.length - 1];
      const fet = fetalSeries.find((r) => r.weeks === w);
      return {
        weeks: w,
        matMin: mat?.minKg ?? 0,
        matMax: mat?.maxKg ?? 0,
        fetP10: fet?.p10 ?? null,
        fetP50: fet?.p50 ?? null,
        fetP90: fet?.p90 ?? null,
      };
    });
  }, [iomSeries, fetalSeries]);

  const closestTableWeek = useMemo(() => {
    if (weeks === null) return null;
    let best = combinedRows[0].weeks;
    let diff = Math.abs(weeks - best);
    for (const r of combinedRows) {
      const d = Math.abs(weeks - r.weeks);
      if (d < diff) {
        best = r.weeks;
        diff = d;
      }
    }
    return best;
  }, [weeks, combinedRows]);

  const plottedFetalX =
    fetalEval !== null ? Math.min(40, Math.max(14, fetalEval.weeks)) : null;

  return (
    <section
      id="obstetric-growth-panel"
      className="-mx-2.5 min-w-0 overflow-hidden rounded-none border-x-0 border-y border-sky-200 bg-white px-3.5 py-4 sm:mx-0 sm:rounded-2xl sm:border sm:p-6 dark:border-sky-900/60 dark:bg-slate-900"
    >
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between sm:pb-4 dark:border-slate-800">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400">
              <BarChart3 className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-900 sm:text-base dark:text-slate-100">
              Gráficas de Ganancia Materna (IOM 2009) y Peso Fetal (Hadlock 1991)
            </h2>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            Seguimiento visual en tiempo real de la curva ponderal materna según IMC pregestacional ({bmiMeta.label} · {bmiMeta.bmiRangeLabel}) y percentiles ecográficos fetales por semana.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-3 grid grid-cols-3 gap-1.5 rounded-xl bg-slate-100 p-1 sm:mt-4 dark:bg-slate-950">
        <button
          type="button"
          onClick={() => setActiveTab('maternal')}
          className={`flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold sm:text-sm ${
            activeTab === 'maternal'
              ? 'bg-white text-sky-700 shadow-xs dark:bg-slate-800 dark:text-sky-300'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Scale className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Ganancia Materna</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('fetal')}
          className={`flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold sm:text-sm ${
            activeTab === 'fetal'
              ? 'bg-white text-sky-700 shadow-xs dark:bg-slate-800 dark:text-sky-300'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Baby className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Peso Fetal</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('combined')}
          className={`flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold sm:text-sm ${
            activeTab === 'combined'
              ? 'bg-white text-sky-700 shadow-xs dark:bg-slate-800 dark:text-sky-300'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Table2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Relación y Tabla</span>
        </button>
      </div>

      {/* TAB 1: MATERNAL IOM CURVE */}
      {activeTab === 'maternal' && (
        <div className="mt-4 space-y-3">
          {maternalEval && (
            <div className="border-l-2 border-sky-500/75 py-1 pl-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 sm:text-sm dark:text-slate-100">
                    Ganancia actual a las {formatClinicalNumber(maternalEval.weeks, 1)} semanas ({bmiMeta.label})
                  </div>
                  <div className="font-mono text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                    Incremento: <strong className="text-slate-800 dark:text-slate-200">{maternalEval.actualGainKg >= 0 ? '+' : ''}{formatClinicalNumber(maternalEval.actualGainKg, 1)} kg</strong> · Meta IOM: {formatClinicalNumber(maternalEval.expected.minKg, 1)}–{formatClinicalNumber(maternalEval.expected.maxKg, 1)} kg
                  </div>
                </div>
                <span className={`rounded-lg px-2.5 py-1 font-mono text-xs font-bold tabular-nums ${BADGE_CLASSES[maternalEval.severity] ?? BADGE_CLASSES.info}`}>
                  {maternalEval.status === 'within'
                    ? 'Dentro de meta IOM'
                    : maternalEval.status === 'below'
                      ? 'Por debajo'
                      : 'Por encima'}
                </span>
              </div>
            </div>
          )}

          <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white p-1.5 sm:rounded-xl sm:p-2.5 dark:border-slate-800 dark:bg-slate-950">
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="h-auto w-full select-none"
              role="img"
              aria-label={`Curva IOM de ganancia de peso gestacional para IMC ${bmiMeta.label}`}
            >
              {matYTicks.map((val, idx) => {
                const y = mapMatY(val);
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
                      {formatClinicalNumber(val, 0)}
                    </text>
                  </g>
                );
              })}

              {matXTicks.map((w) => {
                const x = mapMatX(w);
                return (
                  <g key={w}>
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
                      {w}s
                    </text>
                  </g>
                );
              })}

              {/* 13-week trimester transition marker */}
              <line
                x1={mapMatX(13)}
                x2={mapMatX(13)}
                y1={padT}
                y2={svgH - padB}
                stroke="currentColor"
                className="text-slate-300 dark:text-slate-700"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* Recommended IOM corridor */}
              <path d={matBandPath} fill="rgba(16, 185, 129, 0.16)" />
              <path d={matLinePath('minKg')} fill="none" stroke="#059669" strokeWidth="1.8" strokeDasharray="4 3" />
              <path d={matLinePath('midKg')} fill="none" stroke="#10b981" strokeWidth="2.2" />
              <path d={matLinePath('maxKg')} fill="none" stroke="#059669" strokeWidth="1.8" strokeDasharray="4 3" />

              {lastIomPt && (
                <>
                  <text x={svgW - padR + 4} y={mapMatY(lastIomPt.maxKg) + 3} className="fill-emerald-700 font-mono text-[9px] font-bold dark:fill-emerald-400">Máx</text>
                  <text x={svgW - padR + 4} y={mapMatY(lastIomPt.midKg) + 3} className="fill-emerald-600 font-mono text-[9px] dark:fill-emerald-300">Med</text>
                  <text x={svgW - padR + 4} y={mapMatY(lastIomPt.minKg) + 3} className="fill-emerald-700 font-mono text-[9px] font-bold dark:fill-emerald-400">Mín</text>
                </>
              )}

              {/* Trajectory from week 0 to patient point */}
              {maternalEval && (
                <g>
                  <line
                    x1={mapMatX(0)}
                    y1={mapMatY(0)}
                    x2={mapMatX(Math.min(matXMax, maternalEval.weeks))}
                    y2={mapMatY(maternalEval.actualGainKg)}
                    stroke="#0284c7"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx={mapMatX(Math.min(matXMax, maternalEval.weeks))}
                    cy={mapMatY(maternalEval.actualGainKg)}
                    r="6"
                    className="fill-sky-600 stroke-white dark:fill-sky-400 dark:stroke-slate-950"
                    strokeWidth="2.2"
                  />
                </g>
              )}

              <text x={padL} y={11} className="fill-slate-500 font-mono text-[10px] font-semibold dark:fill-slate-400">
                Ganancia (kg)
              </text>
            </svg>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-slate-100 pt-2 text-[11px] text-slate-600 dark:border-slate-800 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-4 rounded-xs bg-emerald-500/25 border border-emerald-600/50" />
                <strong>Banda recomendada IOM</strong> ({bmiMeta.label})
              </span>
              {maternalEval && (
                <span className="flex items-center gap-1.5 font-semibold text-sky-700 dark:text-sky-400">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-600 dark:bg-sky-400" />
                  Paciente ({maternalEval.actualGainKg >= 0 ? '+' : ''}{formatClinicalNumber(maternalEval.actualGainKg, 1)} kg · {formatClinicalNumber(maternalEval.weeks, 1)} s)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FETAL WEIGHT CURVE */}
      {activeTab === 'fetal' && (
        <div className="mt-4 space-y-3">
          {fetalEval ? (
            <div className="border-l-2 border-sky-500/75 py-1 pl-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 sm:text-sm dark:text-slate-100">
                    {fetalEval.classification}
                  </div>
                  <div className="font-mono text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                    PFE: <strong className="text-slate-800 dark:text-slate-200">{fetalEval.efwGrams} g</strong> · P50 Hadlock: {fetalEval.bands.p50} g (P10–P90: {fetalEval.bands.p10}–{fetalEval.bands.p90} g)
                  </div>
                </div>
                <span className={`rounded-lg px-2.5 py-1 font-mono text-xs font-bold tabular-nums ${BADGE_CLASSES[fetalEval.severity] ?? BADGE_CLASSES.info}`}>
                  {fetalEval.percentileFormatted}
                </span>
              </div>

              {/* Percentile bar */}
              <div className="mt-3">
                <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className="flex h-full w-full">
                    <div className="h-full bg-orange-400/75 dark:bg-orange-500/60" style={{ width: '8%' }} title="< P3" />
                    <div className="h-full bg-amber-300/80 dark:bg-amber-500/50" style={{ width: '12%' }} title="P3–P10" />
                    <div className="h-full bg-emerald-400/85 dark:bg-emerald-500/65" style={{ width: '60%' }} title="P10–P90 (AEG)" />
                    <div className="h-full bg-amber-300/80 dark:bg-amber-500/50" style={{ width: '12%' }} title="P90–P97" />
                    <div className="h-full bg-orange-400/75 dark:bg-orange-500/60" style={{ width: '8%' }} title="> P97" />
                  </div>
                  {(() => {
                    const p = Math.max(1, Math.min(99, fetalEval.percentile));
                    const pos =
                      p <= 3
                        ? (p / 3) * 8
                        : p <= 10
                          ? 8 + ((p - 3) / 7) * 12
                          : p <= 90
                            ? 20 + ((p - 10) / 80) * 60
                            : p <= 97
                              ? 80 + ((p - 90) / 7) * 12
                              : 92 + ((p - 97) / 3) * 8;
                    return (
                      <div
                        className="absolute top-0 bottom-0 w-1.5 -translate-x-1/2 rounded-full bg-slate-900 ring-2 ring-white dark:bg-white dark:ring-slate-950"
                        style={{ left: `${pos}%` }}
                      />
                    );
                  })()}
                </div>
                <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-500 tabular-nums dark:text-slate-400">
                  <span>P3 ({fetalEval.bands.p3}g)</span>
                  <span>P10 ({fetalEval.bands.p10}g)</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">P50 ({fetalEval.bands.p50}g)</span>
                  <span>P90 ({fetalEval.bands.p90}g)</span>
                  <span>P97 ({fetalEval.bands.p97}g)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-300">
              Ingresa una edad gestacional ≥ 10 semanas y un peso fetal estimado (o biometría Hadlock) en el formulario superior para ubicar al feto sobre la curva.
            </div>
          )}

          <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white p-1.5 sm:rounded-xl sm:p-2.5 dark:border-slate-800 dark:bg-slate-950">
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="h-auto w-full select-none"
              role="img"
              aria-label="Curva de percentiles de peso fetal Hadlock 1991 (14 a 40 semanas)"
            >
              {fetYTicks.map((val) => {
                const y = mapFetY(val);
                return (
                  <g key={val}>
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
                      {val}
                    </text>
                  </g>
                );
              })}

              {fetXTicks.map((w) => {
                const x = mapFetX(w);
                return (
                  <g key={w}>
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
                      {w}s
                    </text>
                  </g>
                );
              })}

              <path d={fetBandPath('p97', 'p3')} fill="rgba(245, 158, 11, 0.08)" />
              <path d={fetBandPath('p90', 'p10')} fill="rgba(16, 185, 129, 0.14)" />

              <path d={fetLinePath('p3')} fill="none" stroke="#ea580c" strokeWidth="1.4" strokeDasharray="4 3" />
              <path d={fetLinePath('p10')} fill="none" stroke="#0284c7" strokeWidth="1.4" strokeDasharray="2 3" />
              <path d={fetLinePath('p50')} fill="none" stroke="#059669" strokeWidth="2.4" />
              <path d={fetLinePath('p90')} fill="none" stroke="#0284c7" strokeWidth="1.4" strokeDasharray="2 3" />
              <path d={fetLinePath('p97')} fill="none" stroke="#ea580c" strokeWidth="1.4" strokeDasharray="4 3" />

              {lastFetPt && (
                <>
                  <text x={svgW - padR + 4} y={mapFetY(lastFetPt.p97) + 3} className="fill-orange-600 font-mono text-[9px] font-bold dark:fill-orange-400">P97</text>
                  <text x={svgW - padR + 4} y={mapFetY(lastFetPt.p90) + 3} className="fill-sky-600 font-mono text-[9px] dark:fill-sky-400">P90</text>
                  <text x={svgW - padR + 4} y={mapFetY(lastFetPt.p50) + 3} className="fill-emerald-700 font-mono text-[9px] font-bold dark:fill-emerald-400">P50</text>
                  <text x={svgW - padR + 4} y={mapFetY(lastFetPt.p10) + 3} className="fill-sky-600 font-mono text-[9px] dark:fill-sky-400">P10</text>
                  <text x={svgW - padR + 4} y={mapFetY(lastFetPt.p3) + 3} className="fill-orange-600 font-mono text-[9px] font-bold dark:fill-orange-400">P3</text>
                </>
              )}

              {fetalEval && plottedFetalX !== null && (
                <g>
                  <line
                    x1={mapFetX(plottedFetalX)}
                    x2={mapFetX(plottedFetalX)}
                    y1={padT}
                    y2={svgH - padB}
                    stroke="#0284c7"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx={mapFetX(plottedFetalX)}
                    cy={mapFetY(fetalEval.efwGrams)}
                    r="6"
                    className="fill-sky-600 stroke-white dark:fill-sky-400 dark:stroke-slate-950"
                    strokeWidth="2.2"
                  />
                </g>
              )}

              <text x={padL} y={11} className="fill-slate-500 font-mono text-[10px] font-semibold dark:fill-slate-400">
                PFE (g)
              </text>
            </svg>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-slate-100 pt-2 text-[11px] text-slate-600 dark:border-slate-800 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-4 bg-emerald-600" />
                <strong>P50</strong> (Mediana Hadlock)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-4 border-t-2 border-dotted border-sky-600" />
                P10 / P90 (Zona AEG)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-orange-600" />
                P3 / P97 (Alerta RCIU / Macrosomía)
              </span>
              {fetalEval && (
                <span className="flex items-center gap-1.5 font-semibold text-sky-700 dark:text-sky-400">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-600 dark:bg-sky-400" />
                  Feto ({fetalEval.efwGrams} g · {fetalEval.percentileFormatted})
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MATERNAL-FETAL RELATIONSHIP & WEEKLY TABLE */}
      {activeTab === 'combined' && (
        <div className="mt-4 space-y-3">
          {balance && maternalEval && (
            <div className="border-b border-slate-200/80 pb-3 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-900 sm:text-sm dark:text-slate-100">
                Desglose proporcional: Ganancia Materna vs. Peso Fetal ({formatClinicalNumber(maternalEval.weeks, 1)} sem)
              </div>
              <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                <div className="border-l-2 border-slate-300 pl-2.5 py-0.5 dark:border-slate-700">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Ganancia total materna</div>
                  <div className="font-mono text-base font-bold text-slate-900 tabular-nums dark:text-slate-100">
                    {balance.maternalGainKg >= 0 ? '+' : ''}{formatClinicalNumber(balance.maternalGainKg, 1)} kg
                  </div>
                </div>
                <div className="border-l-2 border-sky-500/70 pl-2.5 py-0.5">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Peso fetal estimado (PFE)</div>
                  <div className="font-mono text-base font-bold text-sky-700 tabular-nums dark:text-sky-400">
                    {formatClinicalNumber(balance.efwKg, 2)} kg
                  </div>
                </div>
                <div className="border-l-2 border-emerald-500/70 pl-2.5 py-0.5">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Ganancia materna neta sin feto</div>
                  <div className="font-mono text-base font-bold text-emerald-700 tabular-nums dark:text-emerald-400">
                    {balance.netMaternalExclFetusKg >= 0 ? '+' : ''}{formatClinicalNumber(balance.netMaternalExclFetusKg, 1)} kg
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {balance.interpretation}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span>
              Tabla combinada: Meta materna <strong>IOM 2009 ({bmiMeta.label})</strong> + Peso fetal <strong>Hadlock 1991</strong>:
            </span>
            {closestTableWeek !== null && (
              <span className="rounded bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
                Semana resaltada: {closestTableWeek} sem
              </span>
            )}
          </div>

          <ScrollableTableShell
            compactHeightClass="max-h-[380px]"
            ariaLabel="Tabla combinada IOM 2009 y Hadlock 1991 por edad gestacional"
          >
            <table className="w-full min-w-[460px] border-separate border-spacing-0 text-left text-[11px] sm:text-xs">
              <thead className="text-slate-700 dark:text-slate-200">
                <tr>
                  <th
                    scope="col"
                    className="sticky top-0 left-0 z-30 min-w-[84px] border-b border-r border-slate-200 bg-slate-100 px-2.5 py-2 font-semibold dark:border-slate-700 dark:bg-slate-800 group-data-[scrolled-x=true]/scroll:shadow-[4px_0_12px_-4px_rgba(15,23,42,0.14)] dark:group-data-[scrolled-x=true]/scroll:shadow-[4px_0_12px_-4px_rgba(0,0,0,0.5)]"
                  >
                    EG
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-20 border-b border-r border-slate-200 bg-slate-100 px-2 py-2 text-right font-semibold text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400"
                  >
                    Meta Materna (kg)
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-20 border-b border-r border-slate-200 bg-slate-100 px-2 py-2 text-right font-semibold dark:border-slate-700 dark:bg-slate-800"
                  >
                    Feto P10 (g)
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-20 border-b border-r border-slate-200 bg-slate-100 px-2 py-2 text-right font-bold text-sky-700 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-400"
                  >
                    Feto P50 (g)
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-20 border-b border-slate-200 bg-slate-100 px-2 py-2 text-right font-semibold dark:border-slate-700 dark:bg-slate-800"
                  >
                    Feto P90 (g)
                  </th>
                </tr>
              </thead>
              <tbody>
                {combinedRows.map((row, rowIdx) => {
                  const isClosest = closestTableWeek === row.weeks;
                  const isLast = rowIdx === combinedRows.length - 1;
                  const borderRow = isLast ? '' : 'border-b border-slate-100 dark:border-slate-800';
                  return (
                    <tr
                      key={row.weeks}
                      className={`group/row ${
                        isClosest
                          ? 'bg-sky-50 font-semibold text-sky-950 dark:bg-sky-950/60 dark:text-sky-100'
                          : 'bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <th
                        scope="row"
                        className={`sticky left-0 z-10 min-w-[84px] border-r border-slate-200 px-2.5 py-2 text-left whitespace-nowrap dark:border-slate-800 group-data-[scrolled-x=true]/scroll:shadow-[4px_0_12px_-4px_rgba(15,23,42,0.12)] dark:group-data-[scrolled-x=true]/scroll:shadow-[4px_0_12px_-4px_rgba(0,0,0,0.45)] ${borderRow} ${
                          isClosest
                            ? 'bg-sky-50 font-semibold text-sky-950 dark:bg-sky-950 dark:text-sky-100'
                            : 'bg-white font-medium text-slate-800 group-hover/row:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:group-hover/row:bg-slate-800'
                        }`}
                      >
                        {row.weeks} sem
                      </th>
                      <td className={`border-r border-slate-100 px-2 py-2 text-right font-mono tabular-nums text-emerald-700 dark:border-slate-800 dark:text-emerald-400 ${borderRow}`}>
                        {formatClinicalNumber(row.matMin, 1)}–{formatClinicalNumber(row.matMax, 1)}
                      </td>
                      <td className={`border-r border-slate-100 px-2 py-2 text-right font-mono tabular-nums dark:border-slate-800 ${borderRow}`}>
                        {row.fetP10 ?? '—'}
                      </td>
                      <td className={`border-r border-slate-100 px-2 py-2 text-right font-mono font-bold tabular-nums text-sky-700 dark:border-slate-800 dark:text-sky-400 ${borderRow}`}>
                        {row.fetP50 ?? '—'}
                      </td>
                      <td className={`px-2 py-2 text-right font-mono tabular-nums ${borderRow}`}>
                        {row.fetP90 ?? '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollableTableShell>
        </div>
      )}
    </section>
  );
};
