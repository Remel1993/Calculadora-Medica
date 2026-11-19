import {
  getCanonicalNumberValue,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';
import { BP_UNITS_MMHG, CREATININE_UNITS_MG_DL } from '../units/converters.ts';

const ageGroupField: SelectFieldDef = {
  id: 'ageGroup',
  label: 'Grupo etario pediátrico (ajusta PAM y Creatinina)',
  type: 'select',
  defaultValue: '60_143m',
  options: [
    { value: 'lt1m', label: '< 1 mes (Neonato)' },
    { value: '1_11m', label: '1 – 11 meses' },
    { value: '12_23m', label: '12 – 23 meses (1 año)' },
    { value: '24_59m', label: '24 – 59 meses (2 – 4 años)' },
    { value: '60_143m', label: '60 – 143 meses (5 – 11 años)' },
    { value: '144_216m', label: '144 – 216 meses (12 – 17 años)' },
  ],
};

const respField: SelectFieldDef = {
  id: 'respiration',
  label: 'Respiración — PaO₂/FiO₂ (o SpO₂/FiO₂ pediátrica)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — PaO₂/FiO₂ ≥ 400 (o SpO₂/FiO₂ ≥ 292)', points: 0 },
    { value: '1', label: '1 — PaO₂/FiO₂ 300–399 (o SpO₂/FiO₂ 264–291)', points: 1 },
    { value: '2', label: '2 — PaO₂/FiO₂ 200–299 (o SpO₂/FiO₂ 221–263)', points: 2 },
    { value: '3', label: '3 — PaO₂/FiO₂ 100–199 c/soporte (o SpO₂/FiO₂ 148–220 c/soporte)', points: 3 },
    { value: '4', label: '4 — PaO₂/FiO₂ < 100 c/soporte (o SpO₂/FiO₂ < 148 c/soporte)', points: 4 },
  ],
};

const coagField: SelectFieldDef = {
  id: 'coagulation',
  label: 'Coagulación — Plaquetas (×10³/µL)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — ≥ 150', points: 0 },
    { value: '1', label: '1 — 100 – 149', points: 1 },
    { value: '2', label: '2 — 50 – 99', points: 2 },
    { value: '3', label: '3 — 20 – 49', points: 3 },
    { value: '4', label: '4 — < 20', points: 4 },
  ],
};

const liverField: SelectFieldDef = {
  id: 'liver',
  label: 'Hígado — Bilirrubina total',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — < 1.2 mg/dL', points: 0 },
    { value: '1', label: '1 — 1.2 – 1.9 mg/dL', points: 1 },
    { value: '2', label: '2 — 2.0 – 5.9 mg/dL', points: 2 },
    { value: '3', label: '3 — 6.0 – 11.9 mg/dL', points: 3 },
    { value: '4', label: '4 — ≥ 12.0 mg/dL', points: 4 },
  ],
};

const vasoField: SelectFieldDef = {
  id: 'vasoactive',
  label: 'Cardiovascular — Vasopresores / Inotrópicos (si NO recibe, se evalúa PAM por edad)',
  type: 'select',
  defaultValue: 'none',
  options: [
    { value: 'none', label: 'Sin fármacos vasoactivos (evaluar PAM abajo)' },
    { value: '2', label: 'Dopamina ≤ 5 µg/kg/min o Dobutamina (cualquier dosis) (+2)', points: 2 },
    { value: '3', label: 'Dopamina > 5 o Adrenalina/Noradrenalina ≤ 0.1 µg/kg/min (+3)', points: 3 },
    { value: '4', label: 'Dopamina > 15 o Adrenalina/Noradrenalina > 0.1 µg/kg/min (+4)', points: 4 },
  ],
};

const mapField: NumberFieldDef = {
  id: 'map',
  label: 'Presión Arterial Media (PAM)',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  min: 15,
  max: 180,
  placeholder: '68',
  visibleWhen: (i) => i.vasoactive === 'none',
};

const cnsField: SelectFieldDef = {
  id: 'cns',
  label: 'Sistema Nervioso Central — Glasgow Pediátrica / Estándar',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Glasgow 15', points: 0 },
    { value: '1', label: '1 — Glasgow 13 – 14', points: 1 },
    { value: '2', label: '2 — Glasgow 10 – 12', points: 2 },
    { value: '3', label: '3 — Glasgow 6 – 9', points: 3 },
    { value: '4', label: '4 — Glasgow < 6', points: 4 },
  ],
};

const crField: NumberFieldDef = {
  id: 'creatinine',
  label: 'Creatinina sérica (evaluada con umbrales del grupo etario)',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: CREATININE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 0.1,
  max: 15,
  placeholder: '0.5',
};

const MAP_THRESHOLD_BY_AGE: Record<string, number> = {
  lt1m: 46,
  '1_11m': 55,
  '12_23m': 60,
  '24_59m': 62,
  '60_143m': 65,
  '144_216m': 67,
};

// [score1Min, score2Min, score3Min, score4Min] in mg/dL
const CR_THRESHOLDS_BY_AGE: Record<string, [number, number, number, number]> = {
  lt1m: [0.8, 1.0, 1.2, 1.6],
  '1_11m': [0.3, 0.5, 0.8, 1.2],
  '12_23m': [0.4, 0.6, 1.1, 1.5],
  '24_59m': [0.6, 0.9, 1.6, 2.3],
  '60_143m': [0.7, 1.1, 1.8, 2.6],
  '144_216m': [1.0, 1.7, 2.9, 4.2],
};

function scorePediatricCr(ageGroup: string, cr: number): number {
  const [s1, s2, s3, s4] = CR_THRESHOLDS_BY_AGE[ageGroup] ?? CR_THRESHOLDS_BY_AGE['60_143m'];
  if (cr >= s4) return 4;
  if (cr >= s3) return 3;
  if (cr >= s2) return 2;
  if (cr >= s1) return 1;
  return 0;
}

export const psofaCalculator: CalculatorDefinition = {
  id: 'psofa',
  name: 'pSOFA (Pediatric Sequential Organ Failure Assessment)',
  shortName: 'pSOFA',
  primarySpecialty: 'pediatria',
  secondarySpecialties: ['urgencias', 'infectologia'],
  subcategory: 'gravedad',
  keywords: ['psofa', 'sepsis pediatrica', 'disfuncion organica', 'ucip', 'matics', 'prism'],
  description:
    'Adaptación pediátrica validada del SOFA (Matics 2017, 0–24 pts) con puntos de corte ajustados por edad para PAM, creatinina y SpO₂/FiO₂.',
  clinicalIndication:
    'Cuantificación de disfunción orgánica múltiple en UCIP y urgencias pediátricas ante sospecha de sepsis o enfermedad crítica.',
  validatedPopulation: 'Pacientes pediátricos desde neonatos a término (< 1 mes) hasta 17 años.',
  requiredLabsNote: 'Requiere plaquetas, bilirrubina, creatinina y PaO₂/FiO₂ o SpO₂/FiO₂.',
  contraindications: [
    'En neonatos prematuros de muy bajo peso o recién nacidos en las primeras horas de vida, las cifras fisiológicas de creatinina materna y bilirrubina neonatal requieren interpretación especializada (nSOFA).',
  ],
  limitations: [
    'Implementa pSOFA abierta y reproducible en lugar de PRISM III (cuyos pesos de regresión multivariada son propietarios bajo licencia institucional).',
    'En 2024 el consenso Phoenix Sepsis Score propuso criterios complementarios específicos de sepsis pediátrica; pSOFA continúa siendo estándar para cuantificación secuencial diaria de órganos.',
  ],
  version: 'Matics TJ & Sanchez-Pinto LN (JAMA Pediatr 2017)',
  references: [
    {
      citation: 'Matics TJ, Sanchez-Pinto LN. Adaptation and Validation of a Pediatric Sequential Organ Failure Assessment Score and Evaluation of the Sepsis-3 Definitions in Critically Ill Children. JAMA Pediatr. 2017;171(10):e172352.',
      year: 2017,
    },
  ],
  fields: [ageGroupField, respField, coagField, liverField, vasoField, mapField, cnsField, crField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(psofaCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const ageGroup = inputs.ageGroup as string;
    const resp = Number(inputs.respiration);
    const coag = Number(inputs.coagulation);
    const liver = Number(inputs.liver);
    const cns = Number(inputs.cns);
    const cr = getCanonicalNumberValue(crField, inputs.creatinine as NumberInputValue).canonicalValue!;
    const renal = scorePediatricCr(ageGroup, cr);

    let cv = 0;
    if (inputs.vasoactive === 'none') {
      const mapVal = getCanonicalNumberValue(mapField, inputs.map as NumberInputValue).canonicalValue!;
      const mapMin = MAP_THRESHOLD_BY_AGE[ageGroup] ?? 65;
      cv = mapVal < mapMin ? 1 : 0;
    } else {
      cv = Number(inputs.vasoactive);
    }

    const total = resp + coag + liver + cv + cns + renal;

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (total <= 1) {
      severity = 'normal';
      riskClassification = `pSOFA ${total} / 24 puntos (Sin disfunción relevante)`;
      clinicalInterpretation = 'Por debajo del umbral ≥ 2 puntos de disfunción orgánica pediátrica.';
    } else if (total <= 5) {
      severity = 'moderate';
      riskClassification = `pSOFA ${total} / 24 puntos (Disfunción orgánica leve-moderada)`;
      clinicalInterpretation = 'Disfunción orgánica pediátrica significativa; si hay infección sospechada y ΔpSOFA ≥ 2, vigilar evolución a sepsis grave.';
    } else if (total <= 11) {
      severity = 'high';
      riskClassification = `pSOFA ${total} / 24 puntos (Disfunción multiorgánica importante)`;
      clinicalInterpretation = 'Riesgo elevado de requerimiento de soporte intensivo en UCIP.';
    } else {
      severity = 'critical';
      riskClassification = `pSOFA ${total} / 24 puntos (Fallo multiorgánico crítico)`;
      clinicalInterpretation = 'Disfunción orgánica grave con alta mortalidad en cohorte de validación pediátrica.';
    }

    return {
      primaryResult: {
        label: 'Puntuación pSOFA total',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 24)',
      },
      secondaryResults: [
        { label: 'Desglose (Resp / Coag / Híg / CV / SNC / Ren)', formattedValue: `${resp} · ${coag} · ${liver} · ${cv} · ${cns} · ${renal}`, unit: 'pts' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      formulaUsed: 'Suma de 6 sistemas ajustados por edad (0 – 4 puntos c/u)',
      inputsSummary: `Grupo: ${ageGroup} · Cr: ${cr} mg/dL (Ren:${renal}) · Total pSOFA: ${total}`,
    };
  },
};
