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
  SecondaryResultItem,
  SeverityLevel,
} from '../types/clinical.ts';
import { CREATININE_UNITS_MG_DL } from '../units/converters.ts';

const heightCmField: NumberFieldDef = {
  id: 'heightCm',
  label: 'Talla / Longitud del paciente pediátrico',
  type: 'number',
  canonicalUnit: 'cm',
  units: [
    { id: 'cm', label: 'cm', toCanonical: (v) => v, min: 45, max: 210, step: 0.5 },
    { id: 'm', label: 'm', toCanonical: (v) => v * 100, min: 0.45, max: 2.1, step: 0.01 },
  ],
  defaultUnitId: 'cm',
  defaultValue: '125',
  min: 45,
  max: 210,
  placeholder: '125',
};

const creatinineField: NumberFieldDef = {
  id: 'creatinine',
  label: 'Creatinina sérica (método enzimático IDMS)',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: CREATININE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  defaultValue: '0.55',
  min: 0.1,
  max: 25,
  placeholder: '0.55',
  helpText: 'Ecuación CKiD 2009 calibrada para creatinina enzimática trazable a IDMS.',
};

const ageYearsField: NumberFieldDef = {
  id: 'ageYears',
  label: 'Edad (orientativa para interpretación < 2 años)',
  type: 'number',
  canonicalUnit: 'años',
  units: [{ id: 'years', label: 'años', toCanonical: (v) => v, min: 0.1, max: 18, step: 0.5 }],
  defaultUnitId: 'years',
  defaultValue: '8',
  min: 0.1,
  max: 18,
  placeholder: '8',
  helpText: 'En menores de 2 años el filtrado glomerular fisiológico es menor por maduración renal progresiva.',
};

export const pediatricSchwartzCalculator: CalculatorDefinition = {
  id: 'pediatric-schwartz',
  name: 'TFGe Pediátrica — Fórmula Bedside de Schwartz (CKiD)',
  shortName: 'Schwartz Pediátrico (TFGe)',
  primarySpecialty: 'nefrologia',
  secondarySpecialties: ['pediatria'],
  subcategory: 'formulas',
  keywords: [
    'schwartz',
    'tfge',
    'filtrado glomerular',
    'pediatria',
    'nefrologia',
    'creatinina',
    'ckid',
    'renal',
  ],
  description:
    'Estima la tasa de filtración glomerular pediátrica (mL/min/1.73 m²) mediante la ecuación Bedside de Schwartz actualizada (CKiD 2009: 0.413 × Talla / Cr).',
  clinicalIndication:
    'Evaluación de función renal, estadificación de ERC KDIGO y ajuste posológico renal en niños y adolescentes.',
  validatedPopulation: 'Niños y adolescentes de 1 a 16 años (en < 1–2 años los valores normales de TFG son fisiológicamente más bajos que en adultos).',
  contraindications: [
    'No utilizar en lesión renal aguda con creatinina rápidamente cambiante.',
    'Pierde exactitud en desnutrición severa, amiotrofia grave, amputaciones o embarazo adolescente.',
  ],
  limitations: [
    'La constante k = 0.413 requiere creatinina sérica medida por método enzimático estandarizado IDMS (si se usa método Jaffe antiguo, los resultados pueden subestimar la TFG).',
    'En adolescentes mayores o complexión atípica, la ecuación CKiD U25 (con sexo/edad o cistatina C) ofrece mayor precisión que k = 0.413.',
  ],
  requiredLabsNote: 'Creatinina sérica enzimática (IDMS) y talla reciente en cm.',
  version: 'Schwartz Bedside CKiD (2009)',
  references: [
    {
      citation:
        'Schwartz GJ, Muñoz A, Schneider MF, et al. New equations to estimate GFR in children with CKD. J Am Soc Nephrol. 2009;20(3):629-637.',
      year: 2009,
    },
    {
      citation:
        'KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease. Kidney Int. 2024;105(4S):S117-S314.',
      year: 2024,
    },
  ],
  fields: [heightCmField, creatinineField, ageYearsField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(pediatricSchwartzCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const heightCm = getCanonicalNumberValue(heightCmField, inputs.heightCm as NumberInputValue).canonicalValue!;
    const cr = getCanonicalNumberValue(creatinineField, inputs.creatinine as NumberInputValue).canonicalValue!;
    const age = getCanonicalNumberValue(ageYearsField, inputs.ageYears as NumberInputValue).canonicalValue!;

    const egfr = roundClinical((0.413 * heightCm) / cr, 1);

    let stage = 'G1';
    let severity: SeverityLevel = 'normal';
    let riskClassification = '';

    if (age < 2) {
      severity = egfr < 50 ? 'high' : 'info';
      riskClassification = `TFGe ${formatClinicalNumber(egfr, 1)} mL/min/1.73 m² (< 2 años: evaluar según referencia etaria)`;
    } else if (egfr >= 90) {
      stage = 'G1';
      severity = 'normal';
      riskClassification = 'TFGe normal o alta (≥ 90 mL/min/1.73 m² · Estadio G1 si hay daño renal)';
    } else if (egfr >= 60) {
      stage = 'G2';
      severity = 'low';
      riskClassification = 'Descenso leve (60–89 mL/min/1.73 m² · Estadio KDIGO G2)';
    } else if (egfr >= 45) {
      stage = 'G3a';
      severity = 'moderate';
      riskClassification = 'Descenso leve-moderado (45–59 mL/min/1.73 m² · Estadio KDIGO G3a)';
    } else if (egfr >= 30) {
      stage = 'G3b';
      severity = 'moderate';
      riskClassification = 'Descenso moderado-grave (30–44 mL/min/1.73 m² · Estadio KDIGO G3b)';
    } else if (egfr >= 15) {
      stage = 'G4';
      severity = 'high';
      riskClassification = 'Descenso grave (15–29 mL/min/1.73 m² · Estadio KDIGO G4)';
    } else {
      stage = 'G5';
      severity = 'critical';
      riskClassification = 'Fallo renal (< 15 mL/min/1.73 m² · Estadio KDIGO G5)';
    }

    const clinicalInterpretation =
      age < 2
        ? 'En menores de 2 años la TFG madura progresivamente (neonatos ~20–40, 1 año ~70–90 mL/min/1.73 m²); no aplicar directamente los cortes G1–G2 de niños mayores sin tablas etarias.'
        : `Con talla ${formatClinicalNumber(heightCm, 1)} cm y creatinina ${formatClinicalNumber(cr, 2)} mg/dL, la TFGe estimada corresponde a categoría KDIGO ${stage}.`;

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Categoría KDIGO (≥ 2 años)',
        formattedValue: age < 2 ? 'No aplica (< 2 a)' : stage,
        unit: '',
      },
      {
        label: 'Constante aplicada',
        formattedValue: 'k = 0.413',
        unit: '(IDMS)',
      },
    ];

    return {
      primaryResult: {
        label: 'TFGe Pediátrica (Schwartz CKiD)',
        value: egfr,
        formattedValue: formatClinicalNumber(egfr, 1),
        unit: 'mL/min/1.73 m²',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance:
        egfr < 60 && age >= 2
          ? [
              'Verificar hidratación, descartar uropatía obstructiva o nefrotoxicidad, ajustar dosis de fármacos de eliminación renal y derivar a Nefrología Pediátrica.',
            ]
          : ['Correlacionar siempre con sedimento urinario, relación albuminuria/creatininuria y presión arterial por percentil pediátrico.'],
      formulaUsed: 'TFGe = 0.413 × Talla (cm) / Creatinina sérica (mg/dL)',
      inputsSummary: `Edad ${formatClinicalNumber(age, 1)} a · Talla ${formatClinicalNumber(heightCm, 1)} cm · Cr ${formatClinicalNumber(cr, 2)} mg/dL`,
    };
  },
};
