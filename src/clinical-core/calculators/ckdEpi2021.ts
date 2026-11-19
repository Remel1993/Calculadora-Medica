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
import { AGE_UNITS_YEARS, CREATININE_UNITS_MG_DL } from '../units/converters.ts';

const creatinineField: NumberFieldDef = {
  id: 'creatinine',
  label: 'Creatinina sérica',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: CREATININE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 0.1,
  max: 30,
  placeholder: '1.0',
  helpText: 'Valor estable de creatinina sérica (método estandarizado IDMS).',
};

const ageField: NumberFieldDef = {
  id: 'age',
  label: 'Edad',
  type: 'number',
  canonicalUnit: 'años',
  units: AGE_UNITS_YEARS,
  defaultUnitId: 'years',
  min: 18,
  max: 120,
  placeholder: '50',
  helpText: 'Validado únicamente en población adulta (≥ 18 años).',
};

const sexField: SelectFieldDef = {
  id: 'sex',
  label: 'Sexo biológico',
  type: 'select',
  defaultValue: 'female',
  options: [
    { value: 'female', label: 'Femenino' },
    { value: 'male', label: 'Masculino' },
  ],
};

export const ckdEpi2021Calculator: CalculatorDefinition = {
  id: 'ckd-epi-2021',
  name: 'TFGe — CKD-EPI 2021 (Creatinina)',
  shortName: 'CKD-EPI 2021',
  primarySpecialty: 'nefrologia',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'formulas',
  keywords: [
    'tfge',
    'egfr',
    'ckd-epi',
    'filtrado glomerular',
    'renal',
    'creatinina',
    'kdigo',
    'erc',
  ],
  description:
    'Estimación de la tasa de filtración glomerular basada en creatinina sérica sin factor racial (ecuación 2021).',
  clinicalIndication:
    'Evaluación y estadificación de la función renal estable en adultos con sospecha o seguimiento de enfermedad renal crónica (ERC).',
  validatedPopulation: 'Adultos ≥ 18 años con función renal en estado estacionario.',
  requiredLabsNote: 'Requiere creatinina sérica reciente obtenida mediante ensayo trazable a IDMS.',
  contraindications: [
    'No utilizar en Lesión Renal Aguda (LRA/IRA) ni cuando la creatinina sérica está cambiando rápidamente.',
    'No validada en menores de 18 años (usar ecuaciones pediátricas como Schwartz modificada / CKiD).',
    'Poco fiable en embarazo, amputaciones mayores, parálisis, desnutrición severa o masa muscular extrema.',
  ],
  limitations: [
    'Controversia/actualización: sustituye a la ecuación CKD-EPI 2009 al eliminar el coeficiente racial (recomendación NKF/ASN y KDIGO 2024). En ciertas poblaciones no estadounidenses puede requerir validación local.',
    'Las categorías G1 y G2 (≥ 60 mL/min/1.73 m²) NO definen ERC por sí solas sin marcadores de daño renal (p. ej. albuminuria ≥ 30 mg/g).',
    'Para ajuste de dosis de fármacos en extremos de peso corporal, considerar desindexar la TFGe por superficie corporal o contrastar con Cockcroft-Gault.',
  ],
  version: 'CKD-EPI Creatinine 2021 (Race-Free)',
  references: [
    {
      citation:
        'Inker LA, Eneanya ND, Coresh J, et al. New Creatinine- and Cystatin C-Based Equations to Estimate GFR without Race. N Engl J Med. 2021;385(19):1737-1749.',
      year: 2021,
    },
    {
      citation:
        'KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease. Kidney Int. 2024;105(4S):S117-S314.',
      year: 2024,
    },
  ],
  fields: [creatinineField, ageField, sexField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(ckdEpi2021Calculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const crRes = getCanonicalNumberValue(
      creatinineField,
      inputs.creatinine as NumberInputValue,
    );
    const ageRes = getCanonicalNumberValue(ageField, inputs.age as NumberInputValue);
    const sex = inputs.sex as string;

    const scr = crRes.canonicalValue!;
    const age = ageRes.canonicalValue!;
    const isFemale = sex === 'female';

    const kappa = isFemale ? 0.7 : 0.9;
    const alpha = isFemale ? -0.241 : -0.302;
    const sexFactor = isFemale ? 1.012 : 1.0;

    const ratio = scr / kappa;
    const rawEgfr =
      142 *
      Math.pow(Math.min(ratio, 1), alpha) *
      Math.pow(Math.max(ratio, 1), -1.2) *
      Math.pow(0.9938, age) *
      sexFactor;

    const egfr = roundClinical(rawEgfr, 0);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (egfr >= 90) {
      severity = 'normal';
      riskClassification = 'Categoría G1 (≥ 90 mL/min/1.73 m²)';
      clinicalInterpretation =
        'Filtración glomerular normal o elevada. Solo clasifica como ERC si existen marcadores persistentes de daño renal (> 3 meses).';
    } else if (egfr >= 60) {
      severity = 'low';
      riskClassification = 'Categoría G2 (60 – 89 mL/min/1.73 m²)';
      clinicalInterpretation =
        'Descenso leve respecto a adultos jóvenes. Evaluar albuminuria (RAC) y sedimento urinario antes de catalogar ERC.';
    } else if (egfr >= 45) {
      severity = 'moderate';
      riskClassification = 'Categoría G3a (45 – 59 mL/min/1.73 m²)';
      clinicalInterpretation =
        'Descenso leve a moderado de la función renal. Confirmar cronicidad (> 3 meses) si es primera medición y revisar ajuste de fármacos nefrotóxicos.';
    } else if (egfr >= 30) {
      severity = 'moderate';
      riskClassification = 'Categoría G3b (30 – 44 mL/min/1.73 m²)';
      clinicalInterpretation =
        'Descenso moderado a grave de la TFGe. Mayor riesgo de progresión, complicaciones metabólicas y eventos cardiovasculares.';
    } else if (egfr >= 15) {
      severity = 'high';
      riskClassification = 'Categoría G4 (15 – 29 mL/min/1.73 m²)';
      clinicalInterpretation =
        'Descenso grave de la función renal. Requiere seguimiento especializado estrecho por Nefrología y vigilancia de complicaciones de ERC avanzada.';
    } else {
      severity = 'critical';
      riskClassification = 'Categoría G5 (< 15 mL/min/1.73 m²)';
      clinicalInterpretation =
        'Fallo renal según umbral de TFGe. Requiere valoración nefrológica prioritaria para manejo integral y planificación terapéutica.';
    }

    return {
      primaryResult: {
        label: 'TFGe (CKD-EPI 2021)',
        value: egfr,
        formattedValue: formatClinicalNumber(egfr, 0),
        unit: 'mL/min/1.73 m²',
      },
      secondaryResults: [
        {
          label: 'Creatinina normalizada',
          formattedValue: formatClinicalNumber(scr, 2),
          unit: 'mg/dL',
        },
        {
          label: 'Valor sin redondear',
          formattedValue: formatClinicalNumber(rawEgfr, 1),
          unit: 'mL/min/1.73 m²',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: [
        'Completar estadificación KDIGO combinando categoría G con relación albúmina/creatinina urinaria (A1–A3).',
        'En caso de discordancia clínica o extremos de masa muscular, considerar estimación con cistatina C (CKD-EPI Cr-Cys 2021).',
      ],
      guidanceDisclaimer: 'Orientación basada en guías KDIGO; confirmar estabilidad clínica antes de estadificar ERC.',
      formulaUsed:
        '142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^(-1.200) × 0.9938^Edad × (1.012 si femenino)',
      inputsSummary: `Scr: ${crRes.rawNumber} ${crRes.unitLabel} · Edad: ${age} años · Sexo: ${isFemale ? 'Femenino' : 'Masculino'}`,
    };
  },
};
