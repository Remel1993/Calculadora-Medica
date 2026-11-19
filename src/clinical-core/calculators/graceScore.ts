import {
  getCanonicalNumberValue,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';
import {
  AGE_UNITS_YEARS,
  BP_UNITS_MMHG,
  CREATININE_UNITS_MG_DL,
  HR_UNITS_BPM,
} from '../units/converters.ts';

const ageField: NumberFieldDef = {
  id: 'age',
  label: 'Edad',
  type: 'number',
  canonicalUnit: 'años',
  units: AGE_UNITS_YEARS,
  defaultUnitId: 'years',
  min: 18,
  max: 110,
  placeholder: '64',
};

const hrField: NumberFieldDef = {
  id: 'hr',
  label: 'Frecuencia cardíaca al ingreso',
  type: 'number',
  canonicalUnit: 'lpm',
  units: HR_UNITS_BPM,
  defaultUnitId: 'bpm',
  min: 20,
  max: 250,
  placeholder: '88',
};

const sbpField: NumberFieldDef = {
  id: 'sbp',
  label: 'Presión arterial sistólica (PAS) al ingreso',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  min: 40,
  max: 280,
  placeholder: '125',
};

const crField: NumberFieldDef = {
  id: 'creatinine',
  label: 'Creatinina sérica inicial',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: CREATININE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 0.1,
  max: 20,
  placeholder: '1.1',
};

const killipField: SelectFieldDef = {
  id: 'killip',
  label: 'Clasificación de Killip-Kimball al ingreso',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '1', label: 'Killip I — Sin signos de insuficiencia cardíaca', points: 0 },
    { value: '2', label: 'Killip II — Estertores basales, S3 o ingurgitación yugular', points: 20 },
    { value: '3', label: 'Killip III — Edema agudo de pulmón franco', points: 39 },
    { value: '4', label: 'Killip IV — Choque cardiogénico', points: 59 },
  ],
};

const arrestField: BooleanFieldDef = {
  id: 'cardiacArrest',
  label: 'Paro cardíaco al ingreso (+39)',
  type: 'boolean',
  defaultValue: false,
};

const stDevField: BooleanFieldDef = {
  id: 'stDeviation',
  label: 'Desviación del segmento ST en el ECG (+28)',
  type: 'boolean',
  defaultValue: false,
};

const markersField: BooleanFieldDef = {
  id: 'elevatedMarkers',
  label: 'Enzimas/marcadores cardíacos elevados (troponina/CK-MB) (+14)',
  type: 'boolean',
  defaultValue: false,
};

function getAgePoints(age: number): number {
  if (age < 30) return 0;
  if (age < 40) return 8;
  if (age < 50) return 25;
  if (age < 60) return 41;
  if (age < 70) return 58;
  if (age < 80) return 75;
  if (age < 90) return 91;
  return 100;
}

function getHrPoints(hr: number): number {
  if (hr < 50) return 0;
  if (hr < 70) return 3;
  if (hr < 90) return 9;
  if (hr < 110) return 15;
  if (hr < 150) return 24;
  if (hr < 200) return 38;
  return 46;
}

function getSbpPoints(sbp: number): number {
  if (sbp < 80) return 58;
  if (sbp < 100) return 53;
  if (sbp < 120) return 43;
  if (sbp < 140) return 34;
  if (sbp < 160) return 24;
  if (sbp < 200) return 10;
  return 0;
}

function getCrPoints(cr: number): number {
  if (cr < 0.4) return 1;
  if (cr < 0.8) return 4;
  if (cr < 1.2) return 7;
  if (cr < 1.6) return 10;
  if (cr < 2.0) return 13;
  if (cr < 4.0) return 21;
  return 28;
}

export const graceScoreCalculator: CalculatorDefinition = {
  id: 'grace-score',
  name: 'GRACE Risk Score (Nomograma Intrahospitalario)',
  shortName: 'GRACE Score',
  primarySpecialty: 'cardiologia',
  secondarySpecialties: ['urgencias'],
  subcategory: 'gravedad',
  keywords: ['grace', 'sca', 'scasest', 'coronariografia', 'mortalidad intrahospitalaria', 'killip'],
  description:
    'Estratificación del riesgo de mortalidad intrahospitalaria en síndrome coronario agudo (nomograma validado de Granger et al.).',
  clinicalIndication:
    'Estratificación pronóstica en SCASEST para guiar la urgencia de la estrategia invasiva (coronariografía < 24 h si GRACE > 140).',
  validatedPopulation: 'Adultos con síndrome coronario agudo (IAMCEST, SCASEST, angina inestable).',
  requiredLabsNote: 'Requiere creatinina sérica, biomarcadores cardíacos y ECG inicial.',
  contraindications: [
    'No usar como prueba de exclusión de dolor torácico sin diagnóstico de SCA.',
  ],
  limitations: [
    'Implementa el nomograma discreto original de mortalidad intrahospitalaria (Granger 2003). GRACE 2.0 emplea splines no lineales continuos para estimar porcentajes exactos a 6 meses/1–3 años.',
    'Las guías ESC 2023 de SCA utilizan GRACE > 140 como criterio de alto riesgo para estrategia invasiva precoz (< 24 h) en SCASEST.',
  ],
  version: 'GRACE 1.0 Nomograma Intrahospitalario (Granger 2003)',
  references: [
    {
      citation:
        'Granger CB, Goldberg RJ, Dabbous O, et al. Predictors of hospital mortality in the global registry of acute coronary events. Arch Intern Med. 2003;163(19):2345-2353.',
      year: 2003,
    },
    {
      citation:
        'Byrne RA, Rossello X, Coughlan JJ, et al. 2023 ESC Guidelines for the management of acute coronary syndromes. Eur Heart J. 2023;44(38):3720-3826.',
      year: 2023,
    },
  ],
  fields: [ageField, hrField, sbpField, crField, killipField, arrestField, stDevField, markersField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(graceScoreCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const age = getCanonicalNumberValue(ageField, inputs.age as NumberInputValue).canonicalValue!;
    const hr = getCanonicalNumberValue(hrField, inputs.hr as NumberInputValue).canonicalValue!;
    const sbp = getCanonicalNumberValue(sbpField, inputs.sbp as NumberInputValue).canonicalValue!;
    const crRes = getCanonicalNumberValue(crField, inputs.creatinine as NumberInputValue);
    const cr = crRes.canonicalValue!;

    const killipPointsMap: Record<string, number> = { '1': 0, '2': 20, '3': 39, '4': 59 };
    const killipPts = killipPointsMap[inputs.killip as string] ?? 0;

    const score =
      getAgePoints(age) +
      getHrPoints(hr) +
      getSbpPoints(sbp) +
      getCrPoints(cr) +
      killipPts +
      (inputs.cardiacArrest === true ? 39 : 0) +
      (inputs.stDeviation === true ? 28 : 0) +
      (inputs.elevatedMarkers === true ? 14 : 0);

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (score <= 108) {
      severity = 'low';
      riskClassification = `Riesgo bajo (GRACE ≤ 108: ${score} puntos)`;
      clinicalInterpretation = 'Mortalidad intrahospitalaria estimada < 1 % en la cohorte GRACE.';
      guidance = ['En SCASEST sin criterios de muy alto riesgo, valorar estrategia invasiva selectiva o programada.'];
    } else if (score <= 140) {
      severity = 'moderate';
      riskClassification = `Riesgo intermedio (GRACE 109 – 140: ${score} puntos)`;
      clinicalInterpretation = 'Mortalidad intrahospitalaria estimada del 1 – 3 %.';
      guidance = ['Vigilancia hospitalaria estrecha y valoración cardiológica para coronariografía durante el ingreso (< 72 h).'];
    } else {
      severity = 'critical';
      riskClassification = `Riesgo alto (GRACE > 140: ${score} puntos)`;
      clinicalInterpretation = 'Mortalidad intrahospitalaria estimada > 3 %.';
      guidance = [
        'En SCASEST, GRACE > 140 orienta a estrategia invasiva temprana (coronariografía en < 24 horas) salvo contraindicación, o inmediata si existen criterios de muy alto riesgo.',
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación GRACE (intrahospitalaria)',
        value: score,
        formattedValue: String(score),
        unit: 'puntos',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'En IAMCEST o SCASEST con choque/arritmias malignas/dolor refractario, no demorar la intervención emergente.',
      formulaUsed: 'Suma por estratos de Edad, FC, PAS, Creatinina, Killip, Paro al ingreso, ST y Biomarcadores',
      inputsSummary: `Edad ${age} · FC ${hr} · PAS ${sbp} · Cr ${crRes.rawNumber} ${crRes.unitLabel} · Killip ${inputs.killip}`,
    };
  },
};
