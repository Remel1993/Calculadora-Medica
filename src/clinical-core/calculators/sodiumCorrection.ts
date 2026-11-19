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
} from '../types/clinical.ts';
import { ELECTROLYTE_UNITS_MEQ_L, GLUCOSE_UNITS_MG_DL } from '../units/converters.ts';

const sodiumField: NumberFieldDef = {
  id: 'sodium',
  label: 'Sodio sérico medido (Na⁺)',
  type: 'number',
  canonicalUnit: 'mEq/L',
  units: ELECTROLYTE_UNITS_MEQ_L,
  defaultUnitId: 'meq_l',
  min: 90,
  max: 190,
  placeholder: '128',
};

const glucoseField: NumberFieldDef = {
  id: 'glucose',
  label: 'Glucosa sérica',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: GLUCOSE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 20,
  max: 2000,
  placeholder: '520',
};

export const sodiumCorrectionCalculator: CalculatorDefinition = {
  id: 'sodium-correction',
  name: 'Corrección de Sodio por Hiperglucemia (Katz y Hillier)',
  shortName: 'Sodio corregido',
  primarySpecialty: 'medicina-interna',
  secondarySpecialties: ['endocrinologia', 'urgencias'],
  subcategory: 'liquidos',
  keywords: [
    'sodio corregido',
    'hiperglucemia',
    'katz',
    'hillier',
    'cetoacidosis',
    'estado hiperosmolar',
    'hiponatremia translocacional',
  ],
  description:
    'Estima la natremia real ajustada por el desplazamiento osmótico de agua inducido por la hiperglucemia (fórmulas de Katz 1.6 y Hillier 2.4).',
  clinicalIndication:
    'Evaluación de hiponatremia aparente en cetoacidosis diabética, estado hiperosmolar hiperglucémico o hiperglucemia marcada.',
  validatedPopulation: 'Adultos y población general con hiperglucemia (> 100 mg/dL).',
  requiredLabsNote: 'Requiere sodio sérico y glucemia obtenidos simultáneamente.',
  contraindications: [
    'No corrige otras causas de pseudohiponatremia (hipertrigliceridemia o paraproteinemia grave en fotometría indirecta).',
  ],
  limitations: [
    'Controversia entre guías: Katz (1973) propone +1.6 mEq/L por cada 100 mg/dL de glucosa > 100; Hillier et al. (1999) demostraron que un factor de +2.4 mEq/L se ajusta mejor cuando la glucosa supera 400 mg/dL.',
    'Las guías de crisis hiperglucémicas (ADA / JBDS) suelen usar 1.6 como regla general y 2.4 en hiperglucemias extremas (> 400 mg/dL). Esta herramienta muestra ambas fórmulas.',
  ],
  version: 'Katz (1973) & Hillier (1999)',
  references: [
    {
      citation:
        'Katz MA. Hyperglycemia-induced hyponatremia—calculation of expected serum sodium depression. N Engl J Med. 1973;289(16):843-844.',
      year: 1973,
    },
    {
      citation:
        'Hillier TA, Abbott RD, Barrett EJ. Hyponatremia: evaluating the correction factor for hyperglycemia. Am J Med. 1999;106(4):399-403.',
      year: 1999,
    },
  ],
  fields: [sodiumField, glucoseField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(sodiumCorrectionCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const naRes = getCanonicalNumberValue(sodiumField, inputs.sodium as NumberInputValue);
    const gluRes = getCanonicalNumberValue(glucoseField, inputs.glucose as NumberInputValue);

    const na = naRes.canonicalValue!;
    const glu = gluRes.canonicalValue!;
    const excess100 = Math.max(0, (glu - 100) / 100);

    const katz = roundClinical(na + 1.6 * excess100, 1);
    const hillier = roundClinical(na + 2.4 * excess100, 1);

    const useHillierPrimary = glu > 400;
    const primaryVal = useHillierPrimary ? hillier : katz;
    const primaryLabel =
      glu <= 100
        ? 'Sodio sin corrección (glucosa ≤ 100 mg/dL)'
        : useHillierPrimary
          ? 'Sodio corregido — Hillier (factor 2.4, glucosa > 400)'
          : 'Sodio corregido — Katz (factor 1.6)';

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (primaryVal < 135) {
      severity = primaryVal < 125 ? 'high' : 'moderate';
      riskClassification = `Hiponatremia real persistente (${primaryVal.toFixed(1)} mEq/L)`;
      clinicalInterpretation =
        'Incluso tras corregir por hiperglucemia, la natremia estimada permanece baja. Evaluar pérdida real de sodio o exceso de agua libre.';
    } else if (primaryVal <= 145) {
      severity = 'normal';
      riskClassification = `Normonatremia corregida (${primaryVal.toFixed(1)} mEq/L)`;
      clinicalInterpretation =
        'La aparente hiponatremia medida se explica por efecto osmótico translocacional de la glucosa. Al descender la glucemia con insulina, el sodio sérico tenderá a ascender.';
    } else {
      severity = primaryVal > 155 ? 'critical' : 'high';
      riskClassification = `Hipernatremia subyacente (${primaryVal.toFixed(1)} mEq/L)`;
      clinicalInterpretation =
        'El sodio corregido revela déficit significativo de agua libre enmascarado por la hiperglucemia (frecuente en estado hiperosmolar).';
    }

    return {
      primaryResult: {
        label: primaryLabel,
        value: primaryVal,
        formattedValue: formatClinicalNumber(primaryVal, 1),
        unit: 'mEq/L',
      },
      secondaryResults: [
        {
          label: 'Fórmula de Katz (factor 1.6)',
          formattedValue: formatClinicalNumber(katz, 1),
          unit: 'mEq/L',
        },
        {
          label: 'Fórmula de Hillier (factor 2.4)',
          formattedValue: formatClinicalNumber(hillier, 1),
          unit: 'mEq/L',
          note: 'Mayor exactitud reportada cuando glucosa > 400 mg/dL',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: [
        'Monitorizar sodio medido y corregido cada 2–4 horas durante el tratamiento de crisis hiperglucémicas.',
      ],
      guidanceDisclaimer: 'Orientativo para interpretar tonicidad y reposición hidroelectrolítica.',
      formulaUsed:
        glu <= 100
          ? 'Glucosa ≤ 100 mg/dL: no requiere factor de corrección'
          : useHillierPrimary
            ? 'Na⁺ corr (Hillier) = Na⁺ + 2.4 × [(Glucosa mg/dL - 100) / 100]'
            : 'Na⁺ corr (Katz) = Na⁺ + 1.6 × [(Glucosa mg/dL - 100) / 100]',
      inputsSummary: `Na⁺ medido: ${naRes.rawNumber} ${naRes.unitLabel} · Glucosa: ${gluRes.rawNumber} ${gluRes.unitLabel}`,
    };
  },
};
