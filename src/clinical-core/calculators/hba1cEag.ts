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
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';
import { GLUCOSE_UNITS_MG_DL } from '../units/converters.ts';

const modeField: SelectFieldDef = {
  id: 'mode',
  label: 'Dirección de conversión',
  type: 'select',
  defaultValue: 'a1c_to_eag',
  options: [
    { value: 'a1c_to_eag', label: 'HbA1c (%) → Glucosa promedio estimada (eAG)' },
    { value: 'eag_to_a1c', label: 'Glucosa promedio (eAG) → HbA1c estimada (%)' },
  ],
};

const hba1cField: NumberFieldDef = {
  id: 'hba1c',
  label: 'Hemoglobina glucosilada (HbA1c NGSP)',
  type: 'number',
  canonicalUnit: '%',
  units: [{ id: 'pct', label: '% (NGSP)', toCanonical: (v) => v, min: 3.5, max: 20, step: 0.1 }],
  defaultUnitId: 'pct',
  min: 3.5,
  max: 20,
  placeholder: '7.4',
  visibleWhen: (inputs) => inputs.mode !== 'eag_to_a1c',
};

const eagField: NumberFieldDef = {
  id: 'eag',
  label: 'Glucosa promedio estimada / CGM (eAG)',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: GLUCOSE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 50,
  max: 550,
  placeholder: '165',
  visibleWhen: (inputs) => inputs.mode === 'eag_to_a1c',
};

export const hba1cEagCalculator: CalculatorDefinition = {
  id: 'hba1c-eag',
  name: 'Conversión HbA1c ↔ Glucosa Promedio Estimada (eAG — Estudio ADAG)',
  shortName: 'HbA1c ↔ eAG',
  primarySpecialty: 'endocrinologia',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'formulas',
  keywords: ['hba1c', 'eag', 'hemoglobina glucosilada', 'adag', 'ifcc', 'glucosa promedio', 'diabetes'],
  description:
    'Convierte bidireccionalmente entre HbA1c (% NGSP y mmol/mol IFCC) y glucosa promedio estimada (mg/dL y mmol/L) mediante la ecuación del estudio ADAG.',
  clinicalIndication:
    'Educación terapéutica y correlación entre HbA1c de laboratorio, automonitoreo capilar y monitoreo continuo de glucosa (GMI/promedio de 90 días).',
  validatedPopulation: 'Adultos con y sin diabetes (estudio internacional ADAG: diabetes tipo 1, tipo 2 y controles).',
  contraindications: [
    'La relación entre HbA1c y glucemia promedio se altera en hemoglobinopatías, anemia ferropénica o hemolítica, transfusiones recientes, esplenectomía, embarazo avanzado y enfermedad renal crónica avanzada.',
  ],
  limitations: [
    'El cálculo asume una vida media eritrocitaria normal (~120 días). La variabilidad interindividual significa que un mismo valor de HbA1c corresponde a un rango de eAG (±15 %).',
    'No sustituye el análisis de variabilidad glucémica ni hipoglucemias en CGM/automonitoreo.',
  ],
  version: 'Nathan et al. ADAG (2008) / ADA',
  references: [
    {
      citation:
        'Nathan DM, Kuenen J, Borg R, et al. Translating the A1C assay into estimated average glucose values. Diabetes Care. 2008;31(8):1473-1478.',
      year: 2008,
    },
  ],
  fields: [modeField, hba1cField, eagField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(hba1cEagCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const toA1c = inputs.mode === 'eag_to_a1c';
    let a1cPct: number;
    let eagMgDl: number;

    if (toA1c) {
      eagMgDl = getCanonicalNumberValue(eagField, inputs.eag as NumberInputValue).canonicalValue!;
      a1cPct = (eagMgDl + 46.7) / 28.7;
    } else {
      a1cPct = getCanonicalNumberValue(hba1cField, inputs.hba1c as NumberInputValue).canonicalValue!;
      eagMgDl = 28.7 * a1cPct - 46.7;
    }

    const a1cRounded = roundClinical(a1cPct, 1);
    const eagMgRounded = roundClinical(eagMgDl, 0);
    const eagMmolRounded = roundClinical(eagMgDl / 18.0182, 1);
    const ifccMmolMol = roundClinical((a1cPct - 2.152) / 0.09148, 0);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (a1cPct < 5.7) {
      severity = 'normal';
      riskClassification = `Rango normoglucémico (< 5.7 % · eAG ${eagMgRounded} mg/dL)`;
      clinicalInterpretation = 'Corresponde a exposición glucémica promedio dentro de rangos no diabéticos (confirmar diagnóstico siempre con pruebas estandarizadas).';
    } else if (a1cPct < 6.5) {
      severity = 'low';
      riskClassification = `Rango de prediabetes / riesgo aumentado (5.7 – 6.4 % · eAG ${eagMgRounded} mg/dL)`;
      clinicalInterpretation = 'En pacientes sin diabetes previa sugiere prediabetes según criterios ADA; en diabetes tratada refleja control glucémico estricto.';
    } else if (a1cPct <= 7.0) {
      severity = 'low';
      riskClassification = `Control en meta general ADA (< 7.0 % · eAG ${eagMgRounded} mg/dL)`;
      clinicalInterpretation = 'Alcanza el objetivo general (< 7.0 %) para la mayoría de adultos con diabetes no gestacional.';
    } else if (a1cPct <= 8.5) {
      severity = 'moderate';
      riskClassification = `Control glucémico subóptimo (7.1 – 8.5 % · eAG ${eagMgRounded} mg/dL)`;
      clinicalInterpretation = 'Exposición hiperglucémica sostenida; valorar intensificación o adherencia terapéutica salvo metas individualizadas menos estrictas.';
    } else {
      severity = a1cPct >= 10 ? 'critical' : 'high';
      riskClassification = `Descontrol glucémico marcado (> 8.5 % · eAG ${eagMgRounded} mg/dL)`;
      clinicalInterpretation = 'Hiperglucemia crónica significativa con riesgo elevado de complicaciones micro y macrovasculares.';
    }

    return {
      primaryResult: toA1c
        ? {
            label: 'HbA1c estimada (NGSP)',
            value: a1cRounded,
            formattedValue: formatClinicalNumber(a1cRounded, 1),
            unit: '%',
          }
        : {
            label: 'Glucosa promedio estimada (eAG)',
            value: eagMgRounded,
            formattedValue: String(eagMgRounded),
            unit: 'mg/dL',
          },
      secondaryResults: [
        { label: 'eAG en mmol/L', formattedValue: formatClinicalNumber(eagMmolRounded, 1), unit: 'mmol/L' },
        { label: 'HbA1c en SI (IFCC)', formattedValue: String(ifccMmolMol), unit: 'mmol/mol' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: [
        'Individualizar la meta de HbA1c según edad, expectativa de vida, riesgo de hipoglucemia y comorbilidades (ADA Standards of Care).',
      ],
      guidanceDisclaimer: 'Referencia educativa ADAG; el diagnóstico de diabetes requiere método certificado NGSP.',
      formulaUsed: 'eAG (mg/dL) = 28.7 × HbA1c (%) − 46.7 · IFCC (mmol/mol) = (HbA1c − 2.152) / 0.09148',
      inputsSummary: toA1c
        ? `eAG introducida: ${roundClinical(eagMgDl, 0)} mg/dL → HbA1c: ${formatClinicalNumber(a1cRounded, 1)}%`
        : `HbA1c introducida: ${formatClinicalNumber(a1cPct, 1)}% → eAG: ${eagMgRounded} mg/dL (${formatClinicalNumber(eagMmolRounded, 1)} mmol/L)`,
    };
  },
};
