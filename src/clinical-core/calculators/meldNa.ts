import {
  formatClinicalNumber,
  getCanonicalNumberValue,
  roundClinical,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SeverityLevel,
} from '../types/clinical.ts';
import {
  BILIRUBIN_UNITS_MG_DL,
  CREATININE_UNITS_MG_DL,
  ELECTROLYTE_UNITS_MEQ_L,
} from '../units/converters.ts';

const bilirubinField: NumberFieldDef = {
  id: 'bilirubin',
  label: 'Bilirrubina total',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: BILIRUBIN_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 0.1,
  max: 50,
  placeholder: '3.2',
};

const inrField: NumberFieldDef = {
  id: 'inr',
  label: 'INR',
  type: 'number',
  canonicalUnit: 'INR',
  units: [{ id: 'inr', label: 'INR', toCanonical: (v) => v, min: 0.5, max: 12, step: 0.05 }],
  defaultUnitId: 'inr',
  min: 0.5,
  max: 12,
  placeholder: '1.8',
};

const creatinineField: NumberFieldDef = {
  id: 'creatinine',
  label: 'Creatinina sérica',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: CREATININE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 0.1,
  max: 25,
  placeholder: '1.5',
};

const sodiumField: NumberFieldDef = {
  id: 'sodium',
  label: 'Sodio sérico (Na⁺)',
  type: 'number',
  canonicalUnit: 'mEq/L',
  units: ELECTROLYTE_UNITS_MEQ_L,
  defaultUnitId: 'meq_l',
  min: 100,
  max: 170,
  placeholder: '130',
};

const dialysisField: BooleanFieldDef = {
  id: 'dialysis',
  label: 'Diálisis ≥ 2 veces en la última semana (o HVVC ≥ 24 h)',
  type: 'boolean',
  trueLabel: 'Sí (Cr=4.0)',
  falseLabel: 'No',
  defaultValue: false,
};

export const meldNaCalculator: CalculatorDefinition = {
  id: 'meld-na',
  name: 'MELD / MELD-Na (Pronóstico en Hepatopatía Crónica)',
  shortName: 'MELD / MELD-Na',
  primarySpecialty: 'gastroenterologia',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'gravedad',
  keywords: ['meld', 'meld-na', 'cirrosis', 'trasplante hepatico', 'hepatopatia', 'mortalidad 90 dias'],
  description:
    'Calcula los puntajes MELD clásico y MELD-Na (rango 6–40) según reglas UNOS/OPTN para estimar mortalidad a 3 meses y prioridad en enfermedad hepática avanzada.',
  clinicalIndication:
    'Evaluación pronóstica de mortalidad a 90 días en cirrosis descompensada, hepatitis alcohólica grave y valoración para trasplante hepático.',
  validatedPopulation: 'Pacientes ≥ 12 años con enfermedad hepática crónica terminal.',
  requiredLabsNote: 'Requiere bilirrubina total, INR, creatinina y sodio sérico simultáneos.',
  contraindications: [
    'El INR no refleja función sintética si el paciente recibe anticoagulantes orales.',
    'Valores artificialmente alterados por hemólisis o sepsis no controlada deben interpretarse con cautela.',
  ],
  limitations: [
    'Desde julio de 2023, UNOS adoptó MELD 3.0 (incorporando sexo femenino y albúmina sérica); MELD-Na sigue ampliamente vigente en múltiples guías y sistemas nacionales.',
    'Regla UNOS: valores < 1.0 se fijan en 1.0; creatinina > 4.0 o con diálisis se fija en 4.0; sodio se acota entre 125 y 137 mEq/L.',
  ],
  version: 'UNOS/OPTN MELD-Na (2016)',
  references: [
    {
      citation:
        'Kamath PS, Wiesner RH, Malinchoc M, et al. A model to predict survival in patients with end-stage liver disease. Hepatology. 2001;33(2):464-470.',
      year: 2001,
    },
    {
      citation:
        'Kim WR, Biggins SW, Kremers WK, et al. Hyponatremia and mortality among patients on the liver-transplant waiting list. N Engl J Med. 2008;359(10):1018-1026.',
      year: 2008,
    },
  ],
  fields: [bilirubinField, inrField, creatinineField, sodiumField, dialysisField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(meldNaCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const bilRaw = getCanonicalNumberValue(bilirubinField, inputs.bilirubin as NumberInputValue).canonicalValue!;
    const inrRaw = getCanonicalNumberValue(inrField, inputs.inr as NumberInputValue).canonicalValue!;
    const crRaw = getCanonicalNumberValue(creatinineField, inputs.creatinine as NumberInputValue).canonicalValue!;
    const naRaw = getCanonicalNumberValue(sodiumField, inputs.sodium as NumberInputValue).canonicalValue!;
    const onDialysis = Boolean(inputs.dialysis);

    const bil = Math.max(1.0, bilRaw);
    const inr = Math.max(1.0, inrRaw);
    const cr = onDialysis ? 4.0 : Math.min(4.0, Math.max(1.0, crRaw));
    const na = Math.min(137, Math.max(125, naRaw));

    const meldRaw =
      (0.957 * Math.log(cr) + 0.378 * Math.log(bil) + 1.12 * Math.log(inr) + 0.643) * 10;
    const meldI = Math.min(40, Math.max(6, Math.round(meldRaw)));

    const meldNaRaw =
      meldI > 11
        ? meldI + 1.32 * (137 - na) - 0.033 * meldI * (137 - na)
        : meldI;
    const meldNa = Math.min(40, Math.max(6, Math.round(meldNaRaw)));

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let mortality90d = '';
    let clinicalInterpretation = '';

    if (meldNa <= 9) {
      severity = 'low';
      mortality90d = '~1.9 %';
      riskClassification = `Riesgo bajo (MELD-Na ${meldNa} / 40)`;
      clinicalInterpretation = 'Mortalidad estimada a 3 meses baja (< 2 %); seguimiento ambulatorio habitual.';
    } else if (meldNa <= 19) {
      severity = 'moderate';
      mortality90d = '~6 %';
      riskClassification = `Riesgo moderado (MELD-Na ${meldNa} / 40)`;
      clinicalInterpretation = 'Riesgo intermedio a 90 días; considerar valoración por hepatología y evaluación de elegibilidad para trasplante (≥ 15 puntos).';
    } else if (meldNa <= 29) {
      severity = 'high';
      mortality90d = '~19.6 %';
      riskClassification = `Riesgo alto (MELD-Na ${meldNa} / 40)`;
      clinicalInterpretation = 'Mortalidad significativa a 3 meses (~20 %); manejo especializado estrecho y priorización de estudio para trasplante.';
    } else if (meldNa <= 39) {
      severity = 'critical';
      mortality90d = '~52.6 %';
      riskClassification = `Riesgo muy alto (MELD-Na ${meldNa} / 40)`;
      clinicalInterpretation = 'Riesgo crítico de mortalidad a corto plazo (> 50 % a 90 días); requiere manejo hospitalario intensivo.';
    } else {
      severity = 'critical';
      mortality90d = '~71.3 %';
      riskClassification = `Riesgo extremo (MELD-Na ${meldNa} / 40)`;
      clinicalInterpretation = 'Máxima gravedad pronóstica en enfermedad hepática terminal.';
    }

    return {
      primaryResult: {
        label: 'Puntuación MELD-Na',
        value: meldNa,
        formattedValue: String(meldNa),
        unit: 'puntos (6–40)',
      },
      secondaryResults: [
        { label: 'MELD clásico (sin Na⁺)', formattedValue: String(meldI), unit: 'puntos' },
        { label: 'Mortalidad 90 días (Wiesner)', formattedValue: mortality90d, unit: '' },
        { label: 'Valores UNOS acotados', formattedValue: `Bil ${formatClinicalNumber(bil, 1)} · INR ${formatClinicalNumber(inr, 1)} · Cr ${formatClinicalNumber(cr, 1)} · Na ${Math.round(na)}`, unit: '' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: [
        'Un MELD-Na ≥ 15 suele marcar beneficio potencial de supervivencia con trasplante hepático (confirmar criterios de centro trasplantador).',
      ],
      guidanceDisclaimer: 'Las estimaciones de mortalidad provienen de cohortes clásicas UNOS/Wiesner.',
      formulaUsed: 'MELD-Na = MELD(i) + 1.32×(137−Na) − [0.033×MELD(i)×(137−Na)] si MELD(i)>11',
      inputsSummary: `Bil: ${formatClinicalNumber(bilRaw, 2)} · INR: ${formatClinicalNumber(inrRaw, 2)} · Cr: ${formatClinicalNumber(crRaw, 2)}${onDialysis ? ' (Diálisis)' : ''} · Na⁺: ${naRaw} mEq/L`,
    };
  },
};
