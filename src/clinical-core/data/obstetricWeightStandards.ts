import { zScoreToPercentile } from '../math/whoLms.ts';
import { formatClinicalNumber, roundClinical } from '../math/precision.ts';
import type { SeverityLevel } from '../types/clinical.ts';

export type PrePregnancyBmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese';
export type PregnancyPlurality = 'singleton' | 'twin';

export interface IomTargetMeta {
  category: PrePregnancyBmiCategory;
  label: string;
  bmiRangeLabel: string;
  singletonTotalMinKg: number;
  singletonTotalMaxKg: number;
  singletonWeeklyMinKg: number;
  singletonWeeklyMaxKg: number;
  singletonWeeklyMeanKg: number;
  twinTotalMinKg: number | null;
  twinTotalMaxKg: number | null;
}

export const IOM_2009_TARGETS: Record<PrePregnancyBmiCategory, IomTargetMeta> = {
  underweight: {
    category: 'underweight',
    label: 'Bajo peso',
    bmiRangeLabel: '< 18.5 kg/m²',
    singletonTotalMinKg: 12.5,
    singletonTotalMaxKg: 18.0,
    singletonWeeklyMinKg: 0.44,
    singletonWeeklyMaxKg: 0.58,
    singletonWeeklyMeanKg: 0.51,
    twinTotalMinKg: null,
    twinTotalMaxKg: null,
  },
  normal: {
    category: 'normal',
    label: 'Normopeso',
    bmiRangeLabel: '18.5 – 24.9 kg/m²',
    singletonTotalMinKg: 11.5,
    singletonTotalMaxKg: 16.0,
    singletonWeeklyMinKg: 0.35,
    singletonWeeklyMaxKg: 0.5,
    singletonWeeklyMeanKg: 0.42,
    twinTotalMinKg: 17.0,
    twinTotalMaxKg: 25.0,
  },
  overweight: {
    category: 'overweight',
    label: 'Sobrepeso',
    bmiRangeLabel: '25.0 – 29.9 kg/m²',
    singletonTotalMinKg: 7.0,
    singletonTotalMaxKg: 11.5,
    singletonWeeklyMinKg: 0.23,
    singletonWeeklyMaxKg: 0.33,
    singletonWeeklyMeanKg: 0.28,
    twinTotalMinKg: 14.0,
    twinTotalMaxKg: 23.0,
  },
  obese: {
    category: 'obese',
    label: 'Obesidad',
    bmiRangeLabel: '≥ 30.0 kg/m²',
    singletonTotalMinKg: 5.0,
    singletonTotalMaxKg: 9.0,
    singletonWeeklyMinKg: 0.17,
    singletonWeeklyMaxKg: 0.27,
    singletonWeeklyMeanKg: 0.22,
    twinTotalMinKg: 11.0,
    twinTotalMaxKg: 19.0,
  },
};

export function classifyPrePregnancyBmi(bmi: number): PrePregnancyBmiCategory {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

export interface IomExpectedGainAtWeek {
  weeks: number;
  minKg: number;
  maxKg: number;
  midKg: number;
  totalMinKg: number;
  totalMaxKg: number;
  weeklyMinKg: number;
  weeklyMaxKg: number;
  hasOfficialTwinTarget: boolean;
}

/**
 * Piecewise IOM/NAM 2009 gestational weight gain trajectory:
 * - First trimester (0–13 weeks): standard 0.5–2.0 kg for singletons (scaled proportionally for twins).
 * - Weeks 13–40 (singletons): linear interpolation to the official IOM total gain target at 40 weeks
 *   (whose slopes match the published 2nd/3rd trimester rates of 0.44–0.58, 0.35–0.50, 0.23–0.33, 0.17–0.27 kg/wk).
 * - Weeks 40–42 (singletons): continues with the published 2nd/3rd trimester weekly rate.
 * - Twins (IOM 2009 provisional): anchored to 37–38 weeks term targets (17–25, 14–23, 11–19 kg).
 */
export function getIomExpectedGainAtWeek(
  category: PrePregnancyBmiCategory,
  plurality: PregnancyPlurality,
  weeks: number,
): IomExpectedGainAtWeek {
  const meta = IOM_2009_TARGETS[category];
  const ga = Math.max(0, Math.min(42, weeks));

  if (plurality === 'twin') {
    const hasOfficial = meta.twinTotalMinKg !== null && meta.twinTotalMaxKg !== null;
    // If underweight + twin (no official IOM range), reference normopeso lower safety floor only as orientation and flag hasOfficialTwinTarget=false
    const termMin = meta.twinTotalMinKg ?? 17.0;
    const termMax = meta.twinTotalMaxKg ?? 25.0;
    const tri1Min = 1.0;
    const tri1Max = 2.5;
    const termWeek = 38;
    const weeklyMin = (termMin - tri1Min) / (termWeek - 13);
    const weeklyMax = (termMax - tri1Max) / (termWeek - 13);

    let minKg: number;
    let maxKg: number;
    if (ga <= 13) {
      minKg = (tri1Min * ga) / 13;
      maxKg = (tri1Max * ga) / 13;
    } else {
      minKg = tri1Min + weeklyMin * (ga - 13);
      maxKg = tri1Max + weeklyMax * (ga - 13);
    }

    return {
      weeks: ga,
      minKg: roundClinical(minKg, 1),
      maxKg: roundClinical(maxKg, 1),
      midKg: roundClinical((minKg + maxKg) / 2, 1),
      totalMinKg: termMin,
      totalMaxKg: termMax,
      weeklyMinKg: roundClinical(weeklyMin, 2),
      weeklyMaxKg: roundClinical(weeklyMax, 2),
      hasOfficialTwinTarget: hasOfficial,
    };
  }

  const tri1Min = 0.5;
  const tri1Max = 2.0;
  let minKg: number;
  let maxKg: number;

  if (ga <= 13) {
    minKg = (tri1Min * ga) / 13;
    maxKg = (tri1Max * ga) / 13;
  } else if (ga <= 40) {
    const frac = (ga - 13) / (40 - 13);
    minKg = tri1Min + frac * (meta.singletonTotalMinKg - tri1Min);
    maxKg = tri1Max + frac * (meta.singletonTotalMaxKg - tri1Max);
  } else {
    const extraWeeks = ga - 40;
    minKg = meta.singletonTotalMinKg + extraWeeks * meta.singletonWeeklyMinKg;
    maxKg = meta.singletonTotalMaxKg + extraWeeks * meta.singletonWeeklyMaxKg;
  }

  return {
    weeks: ga,
    minKg: roundClinical(minKg, 1),
    maxKg: roundClinical(maxKg, 1),
    midKg: roundClinical((minKg + maxKg) / 2, 1),
    totalMinKg: meta.singletonTotalMinKg,
    totalMaxKg: meta.singletonTotalMaxKg,
    weeklyMinKg: meta.singletonWeeklyMinKg,
    weeklyMaxKg: meta.singletonWeeklyMaxKg,
    hasOfficialTwinTarget: true,
  };
}

export function getIomCurveSeries(
  category: PrePregnancyBmiCategory,
  plurality: PregnancyPlurality,
): IomExpectedGainAtWeek[] {
  const maxWeek = plurality === 'twin' ? 39 : 41;
  const rows: IomExpectedGainAtWeek[] = [];
  for (let w = 0; w <= maxWeek; w += 1) {
    rows.push(getIomExpectedGainAtWeek(category, plurality, w));
  }
  return rows;
}

export interface MaternalGainEvaluation {
  prePregnancyBmi: number;
  bmiCategory: PrePregnancyBmiCategory;
  bmiMeta: IomTargetMeta;
  plurality: PregnancyPlurality;
  weeks: number;
  preWeightKg: number;
  currentWeightKg: number;
  actualGainKg: number;
  expected: IomExpectedGainAtWeek;
  status: 'below' | 'within' | 'above';
  statusLabel: string;
  severity: SeverityLevel;
  observedWeeklyRate2nd3rdTri: number | null;
  deviationFromBandKg: number;
}

export function evaluateMaternalWeightGain(params: {
  preWeightKg: number;
  currentWeightKg: number;
  heightM: number;
  weeks: number;
  plurality: PregnancyPlurality;
}): MaternalGainEvaluation {
  const prePregnancyBmi = roundClinical(
    params.preWeightKg / (params.heightM * params.heightM),
    1,
  );
  const bmiCategory = classifyPrePregnancyBmi(prePregnancyBmi);
  const bmiMeta = IOM_2009_TARGETS[bmiCategory];
  const actualGainKg = roundClinical(params.currentWeightKg - params.preWeightKg, 1);
  const expected = getIomExpectedGainAtWeek(bmiCategory, params.plurality, params.weeks);

  let status: 'below' | 'within' | 'above' = 'within';
  let statusLabel = 'Ganancia adecuada para la edad gestacional (IOM 2009)';
  let severity: SeverityLevel = 'normal';
  let deviationFromBandKg = 0;

  if (actualGainKg < expected.minKg) {
    status = 'below';
    deviationFromBandKg = roundClinical(actualGainKg - expected.minKg, 1);
    const deficit = Math.abs(deviationFromBandKg);
    severity = deficit >= 3 || actualGainKg < -2 ? 'high' : 'moderate';
    statusLabel = `Ganancia ponderal por debajo de la meta IOM (${formatClinicalNumber(deviationFromBandKg, 1)} kg respecto al límite inferior)`;
  } else if (actualGainKg > expected.maxKg) {
    status = 'above';
    deviationFromBandKg = roundClinical(actualGainKg - expected.maxKg, 1);
    severity = deviationFromBandKg >= 3 ? 'high' : 'moderate';
    statusLabel = `Ganancia ponderal por encima de la meta IOM (+${formatClinicalNumber(deviationFromBandKg, 1)} kg respecto al límite superior)`;
  }

  let observedWeeklyRate2nd3rdTri: number | null = null;
  if (params.weeks > 13) {
    // Approximate 2nd/3rd trimester pace assuming midpoint 1st trimester gain (~1.25 kg singleton, ~1.75 kg twin)
    const tri1Anchor = params.plurality === 'twin' ? 1.75 : 1.25;
    observedWeeklyRate2nd3rdTri = roundClinical(
      (actualGainKg - tri1Anchor) / (params.weeks - 13),
      2,
    );
  }

  return {
    prePregnancyBmi,
    bmiCategory,
    bmiMeta,
    plurality: params.plurality,
    weeks: params.weeks,
    preWeightKg: params.preWeightKg,
    currentWeightKg: params.currentWeightKg,
    actualGainKg,
    expected,
    status,
    statusLabel,
    severity,
    observedWeeklyRate2nd3rdTri,
    deviationFromBandKg,
  };
}

/**
 * Hadlock et al. (1985) 4-parameter EFW formula (AJOG 1985;151:333-337):
 * log10(EFW) = 1.3596 + 0.0064*HC + 0.0424*AC + 0.174*FL + 0.00061*BPD*AC - 0.00386*AC*FL
 * Biometric inputs in cm (converted from mm here).
 */
export function computeHadlockEfw1985(biometryMm: {
  bpdMm: number;
  hcMm: number;
  acMm: number;
  flMm: number;
}): number {
  const bpd = biometryMm.bpdMm / 10;
  const hc = biometryMm.hcMm / 10;
  const ac = biometryMm.acMm / 10;
  const fl = biometryMm.flMm / 10;
  const log10Efw =
    1.3596 +
    0.0064 * hc +
    0.0424 * ac +
    0.174 * fl +
    0.00061 * bpd * ac -
    0.00386 * ac * fl;
  return roundClinical(Math.pow(10, log10Efw), 0);
}

/**
 * Hadlock et al. (1991) sonographic fetal weight standard (Radiology 1991;181:129-133):
 * ln(EFW_mean) = 0.578 + 0.332 * GA - 0.00354 * GA^2 (validated 10–40 weeks).
 * Uniform percentage dispersion SD = 13.265% of mean (matching published Table 1 P10 = mean * 0.83, P90 = mean * 1.17).
 */
const HADLOCK_1991_CV = 0.13265;

export interface FetalWeightBandsAtGa {
  weeks: number;
  evaluatedGa: number;
  isAbove40Weeks: boolean;
  p3: number;
  p10: number;
  p50: number;
  p90: number;
  p97: number;
}

export function getHadlockFetalPercentilesAtGa(weeks: number): FetalWeightBandsAtGa | null {
  if (!Number.isFinite(weeks) || weeks < 10) return null;
  const isAbove40Weeks = weeks > 40;
  const evaluatedGa = Math.min(40, Math.max(10, weeks));
  const p50Exact = Math.exp(0.578 + 0.332 * evaluatedGa - 0.00354 * evaluatedGa * evaluatedGa);

  return {
    weeks,
    evaluatedGa,
    isAbove40Weeks,
    p3: roundClinical(p50Exact * (1 - 1.88079 * HADLOCK_1991_CV), 0),
    p10: roundClinical(p50Exact * (1 - 1.28155 * HADLOCK_1991_CV), 0),
    p50: roundClinical(p50Exact, 0),
    p90: roundClinical(p50Exact * (1 + 1.28155 * HADLOCK_1991_CV), 0),
    p97: roundClinical(p50Exact * (1 + 1.88079 * HADLOCK_1991_CV), 0),
  };
}

export interface FetalWeightEvaluation {
  efwGrams: number;
  weeks: number;
  bands: FetalWeightBandsAtGa;
  zScore: number;
  percentile: number;
  percentileFormatted: string;
  classification: string;
  severity: SeverityLevel;
  explanation: string;
}

export function evaluateFetalWeight(
  efwGrams: number,
  weeks: number,
): FetalWeightEvaluation | null {
  const bands = getHadlockFetalPercentilesAtGa(weeks);
  if (!bands || !Number.isFinite(efwGrams) || efwGrams <= 0) return null;

  const sd = bands.p50 * HADLOCK_1991_CV;
  const zScore = roundClinical((efwGrams - bands.p50) / sd, 2);
  const percentile = roundClinical(zScoreToPercentile(zScore), 1);
  const percentileFormatted =
    percentile < 1
      ? '< P1'
      : percentile > 99
        ? '> P99'
        : `P${Math.round(percentile)}`;

  let classification: string;
  let severity: SeverityLevel;
  let explanation: string;

  if (efwGrams < bands.p3 || percentile < 3) {
    classification = `Peso fetal < P3 — Sospecha de RCIU / PEG severo (${percentileFormatted})`;
    severity = 'high';
    explanation =
      'Peso fetal estimado por debajo del percentil 3 para la edad gestacional (Hadlock 1991). Criterio de alerta para restricción de crecimiento fetal; requiere Doppler fetoplacentario (arteria umbilical, ACM) y seguimiento estrecho.';
  } else if (efwGrams < bands.p10 || percentile < 10) {
    classification = `Pequeño para la edad gestacional — PEG P3–P10 (${percentileFormatted})`;
    severity = 'moderate';
    explanation =
      'Peso fetal estimado entre el percentil 3 y 10. Diferenciar pequeño constitucional vs. restricción de crecimiento mediante Doppler uterino/umbilical, volumen de líquido amniótico y curva de crecimiento seriada.';
  } else if (efwGrams <= bands.p90 && percentile <= 90) {
    classification = `Peso fetal adecuado para la edad gestacional — AEG (${percentileFormatted})`;
    severity = 'normal';
    explanation =
      'Peso fetal estimado dentro del rango normal P10–P90 para la edad gestacional según estándar sonográfico de Hadlock (1991).';
  } else if (efwGrams <= bands.p97 && percentile <= 97 && efwGrams < 4000) {
    classification = `Grande para la edad gestacional — GEG P90–P97 (${percentileFormatted})`;
    severity = 'low';
    explanation =
      'Peso fetal estimado por encima del percentil 90. Valorar tamizaje/control glucémico materno, ganancia ponderal gestacional y seguimiento biométrico.';
  } else {
    classification =
      efwGrams >= 4000
        ? `Macrosomía / Peso fetal > P97 (${percentileFormatted}, ${efwGrams} g)`
        : `Peso fetal > P97 — GEG marcado (${percentileFormatted})`;
    severity = efwGrams >= 4500 ? 'high' : 'moderate';
    explanation =
      'Peso fetal estimado superior al percentil 97 o ≥ 4,000 g. Descartar diabetes gestacional o pregestacional y planificar vía del parto valorando biometría clínica y pélvica.';
  }

  return {
    efwGrams: roundClinical(efwGrams, 0),
    weeks,
    bands,
    zScore,
    percentile,
    percentileFormatted,
    classification,
    severity,
    explanation,
  };
}

export function getFetalGrowthSeries(startWeek = 14, endWeek = 40): FetalWeightBandsAtGa[] {
  const rows: FetalWeightBandsAtGa[] = [];
  for (let w = startWeek; w <= endWeek; w += 1) {
    const b = getHadlockFetalPercentilesAtGa(w);
    if (b) rows.push(b);
  }
  return rows;
}

export interface MaternalFetalBalance {
  maternalGainKg: number;
  efwKg: number;
  netMaternalExclFetusKg: number;
  fetalShareOfGainPct: number | null;
  interpretation: string;
}

export function evaluateMaternalFetalBalance(
  maternalGainKg: number,
  efwGrams: number,
  plurality: PregnancyPlurality,
): MaternalFetalBalance {
  const efwKg = roundClinical(efwGrams / 1000, 2);
  const netMaternalExclFetusKg = roundClinical(maternalGainKg - efwKg, 2);
  const fetalShareOfGainPct =
    maternalGainKg > 0.5 ? roundClinical((efwKg / maternalGainKg) * 100, 1) : null;

  const interpretation =
    plurality === 'twin'
      ? `Al descontar el peso estimado de un feto (${formatClinicalNumber(efwKg, 2)} kg), la ganancia restante de ${formatClinicalNumber(netMaternalExclFetusKg, 1)} kg incluye al segundo gemelo, placentas, líquido amniótico, expansión plasmática y tejido materno.`
      : netMaternalExclFetusKg < 2.5 && efwKg >= 1.5
        ? `Ganancia materna neta sin feto reducida (${formatClinicalNumber(netMaternalExclFetusKg, 1)} kg): el feto representa una proporción alta de la ganancia total; considerar además placenta (~0.5–0.7 kg), líquido amniótico (~0.8 kg) y volumen plasmático/uterino (~2–3 kg), por lo que la paciente podría estar movilizando reservas maternas.`
        : `Al restar el peso fetal estimado (${formatClinicalNumber(efwKg, 2)} kg), quedan ${formatClinicalNumber(netMaternalExclFetusKg, 1)} kg correspondientes al resto de componentes fisiológicos del embarazo (placenta, líquido amniótico, útero, mamas, expansión plasmática/líquido extracelular y reservas maternas).`;

  return {
    maternalGainKg: roundClinical(maternalGainKg, 1),
    efwKg,
    netMaternalExclFetusKg,
    fetalShareOfGainPct,
    interpretation,
  };
}
