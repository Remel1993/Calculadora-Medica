import {
  WHO_BMIFA_FEMALE,
  WHO_BMIFA_MALE,
  WHO_HCFA_FEMALE,
  WHO_HCFA_MALE,
  WHO_LHFA_FEMALE,
  WHO_LHFA_MALE,
  WHO_WFA_FEMALE,
  WHO_WFA_MALE,
  type LmsTuple,
  type WhoIndicatorId,
  type WhoSex,
} from '../data/whoGrowthStandards.ts';
import type { SeverityLevel } from '../types/clinical.ts';
import { formatClinicalNumber, roundClinical } from './precision.ts';

export const WHO_PERCENTILE_Z = {
  p3: -1.880793608151251,
  p15: -1.0364333894937898,
  p50: 0,
  p85: 1.0364333894937898,
  p97: 1.880793608151251,
} as const;

export interface WhoIndicatorRange {
  minMonths: number;
  maxMonths: number;
  label: string;
  shortLabel: string;
  unit: string;
  decimals: number;
}

export const WHO_INDICATOR_META: Record<WhoIndicatorId, WhoIndicatorRange> = {
  wfa: {
    minMonths: 0,
    maxMonths: 120,
    label: 'Peso para la edad (0–10 años)',
    shortLabel: 'Peso',
    unit: 'kg',
    decimals: 1,
  },
  lhfa: {
    minMonths: 0,
    maxMonths: 228,
    label: 'Longitud / Talla para la edad (0–19 años)',
    shortLabel: 'Talla',
    unit: 'cm',
    decimals: 1,
  },
  bmifa: {
    minMonths: 0,
    maxMonths: 228,
    label: 'IMC para la edad (0–19 años)',
    shortLabel: 'IMC',
    unit: 'kg/m²',
    decimals: 1,
  },
  hcfa: {
    minMonths: 0,
    maxMonths: 60,
    label: 'Perímetro cefálico para la edad (0–5 años)',
    shortLabel: 'Perímetro cefálico',
    unit: 'cm',
    decimals: 1,
  },
};

export interface WhoPercentilesRow {
  ageMonths: number;
  ageLabel: string;
  p3: number;
  p15: number;
  p50: number;
  p85: number;
  p97: number;
}

export interface WhoEvaluationResult {
  indicator: WhoIndicatorId;
  sex: WhoSex;
  ageMonths: number;
  value: number;
  zScore: number;
  percentile: number;
  percentileFormatted: string;
  p3: number;
  p15: number;
  p50: number;
  p85: number;
  p97: number;
  severity: SeverityLevel;
  classification: string;
  parentExplanation: string;
}

function getSeries(indicator: WhoIndicatorId, sex: WhoSex): readonly LmsTuple[] {
  if (indicator === 'wfa') return sex === 'male' ? WHO_WFA_MALE : WHO_WFA_FEMALE;
  if (indicator === 'lhfa') return sex === 'male' ? WHO_LHFA_MALE : WHO_LHFA_FEMALE;
  if (indicator === 'bmifa') return sex === 'male' ? WHO_BMIFA_MALE : WHO_BMIFA_FEMALE;
  return sex === 'male' ? WHO_HCFA_MALE : WHO_HCFA_FEMALE;
}

export function getInterpolatedLms(
  indicator: WhoIndicatorId,
  sex: WhoSex,
  ageMonths: number,
): LmsTuple | null {
  const meta = WHO_INDICATOR_META[indicator];
  if (!Number.isFinite(ageMonths) || ageMonths < meta.minMonths || ageMonths > meta.maxMonths) {
    return null;
  }
  const series = getSeries(indicator, sex);
  const clamped = Math.max(meta.minMonths, Math.min(meta.maxMonths, ageMonths));
  const lo = Math.floor(clamped);
  const hi = Math.min(series.length - 1, Math.ceil(clamped));
  const frac = clamped - lo;
  const [l0, m0, s0] = series[lo];
  if (frac === 0 || lo === hi) {
    return [l0, m0, s0];
  }
  const [l1, m1, s1] = series[hi];
  return [
    l0 + (l1 - l0) * frac,
    m0 + (m1 - m0) * frac,
    s0 + (s1 - s0) * frac,
  ];
}

export function valueAtZScore(l: number, m: number, s: number, z: number): number {
  if (Math.abs(l) < 1e-7) {
    return m * Math.exp(s * z);
  }
  return m * Math.pow(1 + l * s * z, 1 / l);
}

/**
 * Normal CDF Phi(z) accurate to < 1.5e-7 (Abramowitz & Stegun 26.2.17)
 */
export function zScoreToPercentile(z: number): number {
  if (!Number.isFinite(z)) return 50;
  if (z <= -6) return 0.01;
  if (z >= 6) return 99.99;

  const absZ = Math.abs(z);
  const t = 1 / (1 + 0.2316419 * absZ);
  const d = 0.3989422804014327 * Math.exp((-absZ * absZ) / 2);
  const p =
    d *
    t *
    (0.31938153 +
      t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const cdf = z >= 0 ? 1 - p : p;
  return Math.max(0.01, Math.min(99.99, cdf * 100));
}

export function formatPercentileLabel(percentile: number): string {
  if (percentile < 0.1) return '< P0.1';
  if (percentile > 99.9) return '> P99.9';
  if (percentile < 1 || percentile > 99) return `P${formatClinicalNumber(percentile, 1)}`;
  return `P${Math.round(percentile)}`;
}

export function computeWhoZScore(
  indicator: WhoIndicatorId,
  sex: WhoSex,
  ageMonths: number,
  value: number,
): number | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  const lms = getInterpolatedLms(indicator, sex, ageMonths);
  if (!lms) return null;
  const [l, m, s] = lms;

  let z =
    Math.abs(l) < 1e-7
      ? Math.log(value / m) / s
      : (Math.pow(value / m, l) - 1) / (l * s);

  // Official WHO 2006/2007 tail restriction for WFA and BMIFA beyond +/- 3 SD
  if ((indicator === 'wfa' || indicator === 'bmifa') && Math.abs(z) > 3) {
    if (z > 3) {
      const sd3pos = valueAtZScore(l, m, s, 3);
      const sd2pos = valueAtZScore(l, m, s, 2);
      const sd23pos = sd3pos - sd2pos;
      if (sd23pos > 0) {
        z = 3 + (value - sd3pos) / sd23pos;
      }
    } else {
      const sd3neg = valueAtZScore(l, m, s, -3);
      const sd2neg = valueAtZScore(l, m, s, -2);
      const sd23neg = sd2neg - sd3neg;
      if (sd23neg > 0) {
        z = -3 + (value - sd3neg) / sd23neg;
      }
    }
  }

  return roundClinical(z, 2);
}

export function getWhoPercentilesAtAge(
  indicator: WhoIndicatorId,
  sex: WhoSex,
  ageMonths: number,
): { p3: number; p15: number; p50: number; p85: number; p97: number } | null {
  const lms = getInterpolatedLms(indicator, sex, ageMonths);
  if (!lms) return null;
  const [l, m, s] = lms;
  const dec = WHO_INDICATOR_META[indicator].decimals;
  return {
    p3: roundClinical(valueAtZScore(l, m, s, WHO_PERCENTILE_Z.p3), dec),
    p15: roundClinical(valueAtZScore(l, m, s, WHO_PERCENTILE_Z.p15), dec),
    p50: roundClinical(valueAtZScore(l, m, s, WHO_PERCENTILE_Z.p50), dec),
    p85: roundClinical(valueAtZScore(l, m, s, WHO_PERCENTILE_Z.p85), dec),
    p97: roundClinical(valueAtZScore(l, m, s, WHO_PERCENTILE_Z.p97), dec),
  };
}

export function evaluateWhoIndicator(
  indicator: WhoIndicatorId,
  sex: WhoSex,
  ageMonths: number,
  value: number,
): WhoEvaluationResult | null {
  const zScore = computeWhoZScore(indicator, sex, ageMonths, value);
  const bands = getWhoPercentilesAtAge(indicator, sex, ageMonths);
  if (zScore === null || !bands) return null;

  const percentile = roundClinical(zScoreToPercentile(zScore), 1);
  const percentileFormatted = formatPercentileLabel(percentile);
  const under5 = ageMonths < 60;
  const childNoun = sex === 'male' ? 'niños' : 'niñas';
  const roundedPct = Math.max(1, Math.min(99, Math.round(percentile)));
  const peerPhrase =
    percentile < 1
      ? `Está por debajo del percentil 1 (valor menor al 99% de los ${childNoun} de su edad).`
      : percentile > 99
        ? `Está por encima del percentil 99 (valor mayor al 99% de los ${childNoun} de su edad).`
        : `De cada 100 ${childNoun} sanos de su misma edad, aproximadamente ${roundedPct} tienen un valor menor y ${100 - roundedPct} tienen un valor mayor.`;

  let severity: SeverityLevel = 'normal';
  let classification = '';
  let parentExplanation = '';

  if (indicator === 'lhfa') {
    if (zScore < -3) {
      severity = 'high';
      classification = 'Talla baja severa (< P0.1 · Z < −3 DE)';
      parentExplanation = `La estatura está muy por debajo de lo esperado para su edad. ${peerPhrase} Se recomienda valoración pediátrica.`;
    } else if (zScore < -2) {
      severity = 'moderate';
      classification = 'Talla baja (< P3 · Z < −2 DE)';
      parentExplanation = `La estatura está por debajo del rango habitual (< P3). ${peerPhrase} Conviene revisar la curva previa y la estatura familiar en consulta.`;
    } else if (zScore <= 2) {
      severity = 'normal';
      classification = `Talla adecuada para la edad (${percentileFormatted})`;
      parentExplanation = `Estatura dentro del rango normal esperado para su edad (entre P3 y P97). ${peerPhrase}`;
    } else {
      severity = 'info';
      classification = `Talla alta para la edad (${percentileFormatted} · Z > +2 DE)`;
      parentExplanation = `La estatura supera el percentil 97 (más alto que el promedio). ${peerPhrase}`;
    }
  } else if (indicator === 'wfa') {
    if (zScore < -3) {
      severity = 'high';
      classification = 'Bajo peso severo para la edad (< P0.1 · Z < −3 DE)';
      parentExplanation = `El peso está muy por debajo de lo esperado para su edad. ${peerPhrase} Requiere evaluación pediátrica pronta.`;
    } else if (zScore < -2) {
      severity = 'moderate';
      classification = 'Bajo peso para la edad (< P3 · Z < −2 DE)';
      parentExplanation = `El peso está por debajo de lo esperado (< P3). ${peerPhrase} Debe interpretarse junto con su estatura (IMC/edad).`;
    } else if (zScore <= 1) {
      severity = 'normal';
      classification = `Peso adecuado para la edad (${percentileFormatted})`;
      parentExplanation = `Peso dentro del rango normal esperado para su edad. ${peerPhrase}`;
    } else if (zScore <= 2) {
      severity = 'low';
      classification = `Peso por encima de la mediana (${percentileFormatted} · Z +1 a +2 DE)`;
      parentExplanation = `Peso en rango alto; si también es alto en estatura puede ser proporcional. ${peerPhrase} Revisar siempre el IMC/edad.`;
    } else {
      severity = 'moderate';
      classification = `Peso elevado para la edad (${percentileFormatted} · Z > +2 DE)`;
      parentExplanation = `Peso por encima del percentil 97 para la edad. ${peerPhrase} Confirmar proporción corporal con el IMC para la edad.`;
    }
  } else if (indicator === 'hcfa') {
    if (zScore < -2) {
      severity = 'high';
      classification = `Perímetro cefálico bajo (< P3 · Z < −2 DE)`;
      parentExplanation = `El tamaño de la cabeza está por debajo del percentil 3. ${peerPhrase} Se recomienda revisión médica y seguimiento de su curva.`;
    } else if (zScore <= 2) {
      severity = 'normal';
      classification = `Perímetro cefálico adecuado (${percentileFormatted})`;
      parentExplanation = `El perímetro cefálico se encuentra dentro del rango esperado (P3–P97). ${peerPhrase}`;
    } else {
      severity = 'moderate';
      classification = `Perímetro cefálico elevado (> P97 · Z > +2 DE)`;
      parentExplanation = `El tamaño de la cabeza supera el percentil 97. ${peerPhrase} Conviene valoración pediátrica y comparar mediciones previas.`;
    }
  } else {
    // BMI-for-age
    if (zScore < -3) {
      severity = 'critical';
      classification = 'Delgadez / Emaciación severa (< P0.1 · Z < −3 DE)';
      parentExplanation = `La relación peso-estatura es muy baja. ${peerPhrase} Requiere atención médica prioritaria.`;
    } else if (zScore < -2) {
      severity = 'high';
      classification = 'Bajo peso para la talla / Emaciación (< P3 · Z < −2 DE)';
      parentExplanation = `El peso es bajo en proporción a su estatura. ${peerPhrase} Se recomienda valoración nutricional pediátrica.`;
    } else if (zScore <= 1) {
      severity = 'normal';
      classification = `Estado nutricional normal (${percentileFormatted})`;
      parentExplanation = `Proporción saludable entre peso y estatura para su edad. ${peerPhrase}`;
    } else if (under5) {
      if (zScore <= 2) {
        severity = 'low';
        classification = `Riesgo de sobrepeso (< 5 años: ${percentileFormatted} · Z +1 a +2 DE)`;
        parentExplanation = `Está en el límite superior de la normalidad (P85–P97). ${peerPhrase} Vigilar hábitos de alimentación y actividad física en control sano.`;
      } else if (zScore <= 3) {
        severity = 'moderate';
        classification = `Sobrepeso infantil (< 5 años: ${percentileFormatted} · Z +2 a +3 DE)`;
        parentExplanation = `El peso para su estatura supera el rango habitual infantil (> P97). ${peerPhrase} Se recomienda orientación alimentaria con su pediatra.`;
      } else {
        severity = 'high';
        classification = `Obesidad infantil (< 5 años: ${percentileFormatted} · Z > +3 DE)`;
        parentExplanation = `El IMC está significativamente elevado para su edad. ${peerPhrase} Conviene seguimiento pediátrico integral.`;
      }
    } else {
      if (zScore <= 2) {
        severity = 'moderate';
        classification = `Sobrepeso (5–19 años: ${percentileFormatted} · Z +1 a +2 DE)`;
        parentExplanation = `El IMC está por encima del percentil 85 para su edad. ${peerPhrase} Se sugiere reforzar hábitos saludables y valoración médica.`;
      } else if (zScore <= 3) {
        severity = 'high';
        classification = `Obesidad (5–19 años: ${percentileFormatted} · Z +2 a +3 DE)`;
        parentExplanation = `El IMC supera el percentil 97 para su edad. ${peerPhrase} Se recomienda seguimiento médico y nutricional.`;
      } else {
        severity = 'high';
        classification = `Obesidad grave (5–19 años: ${percentileFormatted} · Z > +3 DE)`;
        parentExplanation = `El IMC está muy por encima del rango esperado. ${peerPhrase} Requiere acompañamiento pediátrico especializado.`;
      }
    }
  }

  return {
    indicator,
    sex,
    ageMonths,
    value,
    zScore,
    percentile,
    percentileFormatted,
    ...bands,
    severity,
    classification,
    parentExplanation,
  };
}

export function formatAgeMonthsLabel(months: number): string {
  if (months === 0) return 'Recién nacido (0 m)';
  if (months < 24) return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  const years = months / 12;
  if (Number.isInteger(years)) {
    return `${years} años (${months} m)`;
  }
  return `${formatClinicalNumber(years, 1)} años (${months} m)`;
}

const STANDARD_MILESTONES_MONTHS = [
  0, 1, 2, 3, 4, 6, 9, 12, 15, 18, 24, 30, 36, 42, 48, 54, 60, 72, 84, 96, 108, 120, 132, 144, 156,
  168, 180, 192, 204, 216, 228,
];

export function getWhoReferenceTableRows(
  indicator: WhoIndicatorId,
  sex: WhoSex,
): WhoPercentilesRow[] {
  const maxM = WHO_INDICATOR_META[indicator].maxMonths;
  return STANDARD_MILESTONES_MONTHS.filter((m) => m <= maxM).map((m) => {
    const bands = getWhoPercentilesAtAge(indicator, sex, m)!;
    return {
      ageMonths: m,
      ageLabel: formatAgeMonthsLabel(m),
      ...bands,
    };
  });
}
