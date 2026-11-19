import {
  formatClinicalNumber,
  getCanonicalNumberValue,
  roundClinical,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SeverityLevel,
  UnitOption,
} from '../types/clinical.ts';
import { CHOLESTEROL_UNITS_MG_DL } from '../units/converters.ts';

const TG_UNITS_MG_DL: UnitOption[] = [
  { id: 'mg_dl', label: 'mg/dL', toCanonical: (v) => v, min: 20, max: 3000, step: 1 },
  { id: 'mmol_l', label: 'mmol/L', toCanonical: (v) => v * 88.57, min: 0.2, max: 34, step: 0.1 },
];

const tcField: NumberFieldDef = {
  id: 'tc',
  label: 'Colesterol total (CT)',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: CHOLESTEROL_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 40,
  max: 800,
  placeholder: '215',
};

const hdlField: NumberFieldDef = {
  id: 'hdl',
  label: 'Colesterol HDL (c-HDL)',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: CHOLESTEROL_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 5,
  max: 200,
  placeholder: '46',
};

const tgField: NumberFieldDef = {
  id: 'tg',
  label: 'Triglicéridos (TG)',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: TG_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 20,
  max: 3000,
  placeholder: '180',
};

export const ldlNonHdlCalculator: CalculatorDefinition = {
  id: 'ldl-non-hdl',
  name: 'Cálculo de c-LDL (Friedewald y Sampson/NIH) y Colesterol No-HDL',
  shortName: 'c-LDL / No-HDL',
  primarySpecialty: 'endocrinologia',
  secondarySpecialties: ['cardiologia', 'medicina-interna'],
  subcategory: 'formulas',
  keywords: ['ldl', 'colesterol', 'friedewald', 'sampson', 'no-hdl', 'dislipidemia', 'trigliceridos', 'martin-hopkins'],
  description:
    'Calcula el colesterol No-HDL y estima el c-LDL mediante las ecuaciones validadas de Friedewald (TG < 400 mg/dL) y Sampson/NIH 2020 (válida hasta TG 800 mg/dL).',
  clinicalIndication:
    'Evaluación del perfil lipídico aterogénico y seguimiento de metas lipídicas cuando no se dispone de c-LDL directo.',
  validatedPopulation: 'Adultos en evaluación de riesgo cardiovascular y dislipidemias.',
  requiredLabsNote: 'Requiere colesterol total, c-HDL y triglicéridos simultáneos.',
  contraindications: [
    'La fórmula de Friedewald es inválida con triglicéridos ≥ 400 mg/dL y pierde exactitud con c-LDL < 70 mg/dL e hipertrigliceridemia.',
    'Ninguna ecuación estimada sustituye al ensayo directo si triglicéridos > 800 mg/dL o en disbetalipoproteinemia tipo III.',
  ],
  limitations: [
    'La ecuación de Martin-Hopkins utiliza una tabla estratificada propietaria/extensa de 180 factores según TG y No-HDL; aquí se implementa Sampson/NIH 2020 como alternativa cerrada de alta precisión publicada en JAMA Cardiology para TG hasta 800 mg/dL y LDL muy bajo.',
    'Las guías ESC/EAS y ACC/AHA recomiendan usar Colesterol No-HDL y ApoB como objetivos secundarios o preferentes en hipertrigliceridemia y diabetes.',
  ],
  version: 'Friedewald (1972) & Sampson/NIH (2020)',
  references: [
    {
      citation:
        'Sampson M, Ling C, Sun Q, et al. A New Equation for Calculation of Low-Density Lipoprotein Cholesterol in Patients With Normolipidemia and/or Hypertriglyceridemia. JAMA Cardiol. 2020;5(5):540-548.',
      year: 2020,
    },
    {
      citation:
        'Friedewald WT, Levy RI, Fredrickson DS. Estimation of the concentration of low-density lipoprotein cholesterol in plasma, without use of the preparative ultracentrifuge. Clin Chem. 1972;18(6):499-502.',
      year: 1972,
    },
  ],
  fields: [tcField, hdlField, tgField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(ldlNonHdlCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const tc = getCanonicalNumberValue(tcField, inputs.tc as NumberInputValue).canonicalValue!;
    const hdl = getCanonicalNumberValue(hdlField, inputs.hdl as NumberInputValue).canonicalValue!;
    const tg = getCanonicalNumberValue(tgField, inputs.tg as NumberInputValue).canonicalValue!;

    if (hdl >= tc) {
      throw new Error('El colesterol HDL debe ser menor que el colesterol total.');
    }

    const nonHdl = roundClinical(tc - hdl, 1);
    const friedewaldValid = tg < 400;
    const friedewaldRaw = tc - hdl - tg / 5;
    const friedewald = friedewaldValid ? roundClinical(Math.max(0, friedewaldRaw), 1) : null;

    const sampsonValid = tg <= 800;
    const sampsonRaw =
      tc / 0.948 -
      hdl / 0.971 -
      (tg / 8.56 + (tg * nonHdl) / 2140 - (tg * tg) / 16100) -
      9.44;
    const sampson = sampsonValid ? roundClinical(Math.max(0, sampsonRaw), 1) : null;

    const tgHdlRatio = roundClinical(tg / hdl, 2);

    const primaryVal = sampson !== null ? sampson : nonHdl;
    const primaryLabel =
      sampson !== null ? 'c-LDL estimado (Sampson / NIH 2020)' : 'Colesterol No-HDL (TG > 800 mg/dL)';

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (tg > 800) {
      severity = 'high';
      riskClassification = `Hipertrigliceridemia grave (TG ${roundClinical(tg, 0)} mg/dL) — Usar No-HDL`;
      clinicalInterpretation =
        'Con triglicéridos > 800 mg/dL las ecuaciones estimativas de c-LDL no son fiables y existe riesgo elevado de pancreatitis aguda (especialmente > 500–1000 mg/dL).';
    } else if (sampson! >= 190) {
      severity = 'high';
      riskClassification = `c-LDL muy elevado (≥ 190 mg/dL)`;
      clinicalInterpretation = 'Nivel compatible con hipercolesterolemia grave; evaluar causa primaria/familiar y riesgo cardiovascular global.';
    } else if (sampson! >= 160) {
      severity = 'moderate';
      riskClassification = `c-LDL alto (160 – 189 mg/dL)`;
      clinicalInterpretation = 'Interpretar según categoría de riesgo cardiovascular del paciente (SCORE2 / Framingham / ASCVD).';
    } else if (sampson! >= 100) {
      severity = 'low';
      riskClassification = `c-LDL 100 – 159 mg/dL`;
      clinicalInterpretation = 'Las metas terapéuticas varían según riesgo cardiovascular (p. ej. < 100, < 70 o < 55 mg/dL en muy alto riesgo).';
    } else {
      severity = 'normal';
      riskClassification = `c-LDL < 100 mg/dL (No-HDL ${formatClinicalNumber(nonHdl, 1)} mg/dL)`;
      clinicalInterpretation = 'Valor por debajo de 100 mg/dL; en prevención secundaria o muy alto riesgo las guías buscan metas más estrictas (< 70 o < 55 mg/dL).';
    }

    return {
      primaryResult: {
        label: primaryLabel,
        value: primaryVal,
        formattedValue: formatClinicalNumber(primaryVal, 1),
        unit: 'mg/dL',
      },
      secondaryResults: [
        {
          label: 'c-LDL Friedewald',
          formattedValue: friedewald !== null ? formatClinicalNumber(friedewald, 1) : 'No válido (TG ≥ 400)',
          unit: friedewald !== null ? 'mg/dL' : '',
          note: friedewald !== null && tg >= 200 ? 'Precaución: con TG elevados puede subestimar c-LDL' : undefined,
        },
        { label: 'Colesterol No-HDL', formattedValue: formatClinicalNumber(nonHdl, 1), unit: 'mg/dL' },
        { label: 'Índice TG / HDL', formattedValue: formatClinicalNumber(tgHdlRatio, 2), unit: '' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: [
        'Las metas de c-LDL y No-HDL dependen del riesgo cardiovascular global individual, no únicamente del valor aislado.',
      ],
      guidanceDisclaimer: 'Si TG > 400 mg/dL preferir Colesterol No-HDL, ApoB o medición directa de c-LDL.',
      formulaUsed: 'No-HDL = CT − HDL · Friedewald = CT − HDL − TG/5 · Sampson = CT/0.948 − HDL/0.971 − (TG/8.56 + TG×NoHDL/2140 − TG²/16100) − 9.44',
      inputsSummary: `CT: ${roundClinical(tc, 1)} · HDL: ${roundClinical(hdl, 1)} · TG: ${roundClinical(tg, 1)} mg/dL`,
    };
  },
};
