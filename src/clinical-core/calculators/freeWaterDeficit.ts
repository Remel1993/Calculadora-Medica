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
import { ELECTROLYTE_UNITS_MEQ_L, WEIGHT_UNITS_KG } from '../units/converters.ts';

const weightField: NumberFieldDef = {
  id: 'weight',
  label: 'Peso corporal',
  type: 'number',
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  min: 10,
  max: 300,
  placeholder: '70',
};

const currentNaField: NumberFieldDef = {
  id: 'currentNa',
  label: 'Sodio sérico actual (Na⁺)',
  type: 'number',
  canonicalUnit: 'mEq/L',
  units: ELECTROLYTE_UNITS_MEQ_L,
  defaultUnitId: 'meq_l',
  min: 145.1,
  max: 210,
  placeholder: '158',
};

const targetNaField: NumberFieldDef = {
  id: 'targetNa',
  label: 'Sodio objetivo final',
  type: 'number',
  canonicalUnit: 'mEq/L',
  units: ELECTROLYTE_UNITS_MEQ_L,
  defaultUnitId: 'meq_l',
  defaultValue: '140',
  min: 135,
  max: 145,
  placeholder: '140',
};

const tbwProfileField: SelectFieldDef = {
  id: 'tbwProfile',
  label: 'Perfil corporal (Agua Corporal Total — ACT)',
  type: 'select',
  defaultValue: 'adult_male',
  options: [
    { value: 'adult_male', label: 'Hombre adulto (< 65 años) — 60 % del peso' },
    { value: 'adult_female', label: 'Mujer adulta (< 65 años) — 50 % del peso' },
    { value: 'elderly_male', label: 'Hombre adulto mayor (≥ 65 años) — 50 % del peso' },
    { value: 'elderly_female', label: 'Mujer adulta mayor (≥ 65 años) — 45 % del peso' },
  ],
};

const TBW_FACTORS: Record<string, number> = {
  adult_male: 0.6,
  adult_female: 0.5,
  elderly_male: 0.5,
  elderly_female: 0.45,
};

export const freeWaterDeficitCalculator: CalculatorDefinition = {
  id: 'free-water-deficit',
  name: 'Déficit de Agua Libre (Hipernatremia)',
  shortName: 'Déficit Agua Libre',
  primarySpecialty: 'medicina-interna',
  secondarySpecialties: ['urgencias'],
  subcategory: 'liquidos',
  keywords: [
    'deficit agua libre',
    'hipernatremia',
    'agua corporal total',
    'act',
    'adrogue',
    'sodio alto',
  ],
  description:
    'Calcula el volumen estimado de agua libre faltante en hipernatremia y el volumen máximo orientativo para las primeras 24 horas.',
  clinicalIndication:
    'Planificación inicial de reposición hídrica en adultos con hipernatremia (> 145 mEq/L).',
  validatedPopulation: 'Adultos con hipernatremia.',
  requiredLabsNote: 'Requiere sodio sérico actual (si hay hiperglucemia concomitante, utilizar primero el sodio corregido).',
  contraindications: [
    'No utilizar la fórmula de adultos directamente en neonatos o lactantes con deshidratación hipernatrémica grave sin protocolo pediátrico específico.',
    'Si el paciente presenta inestabilidad hemodinámica o hipovolemia franca, priorizar primero la restauración intravascular con cristaloides isotónicos.',
  ],
  limitations: [
    'La fórmula estima un déficit estático y NO contabiliza las pérdidas continuas (insensibles, fiebre, diuresis osmótica o diabetes insípida), que deben sumarse aparte.',
    'Una corrección demasiado rápida en hipernatremia crónica (> 10–12 mEq/L en 24 h) conlleva riesgo grave de edema cerebral.',
  ],
  version: 'Adrogué & Madias (2000)',
  references: [
    {
      citation: 'Adrogué HJ, Madias NE. Hypernatremia. N Engl J Med. 2000;342(20):1493-1499.',
      year: 2000,
    },
  ],
  fields: [weightField, tbwProfileField, currentNaField, targetNaField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(freeWaterDeficitCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const wRes = getCanonicalNumberValue(weightField, inputs.weight as NumberInputValue);
    const curRes = getCanonicalNumberValue(
      currentNaField,
      inputs.currentNa as NumberInputValue,
    );
    const tgtRes = getCanonicalNumberValue(
      targetNaField,
      inputs.targetNa as NumberInputValue,
    );
    const profile = inputs.tbwProfile as string;

    const weightKg = wRes.canonicalValue!;
    const currentNa = curRes.canonicalValue!;
    const targetNa = tgtRes.canonicalValue!;

    if (currentNa <= targetNa) {
      throw new Error('El sodio actual debe ser mayor al sodio objetivo para calcular un déficit de agua libre.');
    }

    const factor = TBW_FACTORS[profile] ?? 0.5;
    const tbw = weightKg * factor;
    const totalDeficitL = roundClinical(tbw * (currentNa / targetNa - 1), 2);

    const dropNeeded = currentNa - targetNa;
    const safe24hDrop = Math.min(dropNeeded, 10);
    const target24hNa = currentNa - safe24hDrop;
    const water24hL = roundClinical(tbw * (currentNa / target24hNa - 1), 2);
    const rate24hMlH = roundClinical((water24hL * 1000) / 24, 0);

    let severity: SeverityLevel = 'moderate';
    let riskClassification = '';

    if (currentNa < 150) {
      severity = 'low';
      riskClassification = 'Hipernatremia leve (145.1 – 149.9 mEq/L)';
    } else if (currentNa < 160) {
      severity = 'moderate';
      riskClassification = 'Hipernatremia moderada (150 – 159.9 mEq/L)';
    } else {
      severity = 'critical';
      riskClassification = 'Hipernatremia grave (≥ 160 mEq/L)';
    }

    return {
      primaryResult: {
        label: 'Déficit total de agua libre estimado',
        value: totalDeficitL,
        formattedValue: formatClinicalNumber(totalDeficitL, 2),
        unit: 'Litros',
      },
      secondaryResults: [
        {
          label: 'Agua Corporal Total (ACT) estimada',
          formattedValue: formatClinicalNumber(roundClinical(tbw, 1), 1),
          unit: 'Litros',
          note: `Factor ACT aplicado: ${(factor * 100).toFixed(0)} %`,
        },
        {
          label: `Volumen orientativo primeras 24 h (descenso ≤ ${safe24hDrop.toFixed(1)} mEq/L)`,
          formattedValue: `${formatClinicalNumber(water24hL, 2)} L (${formatClinicalNumber(rate24hMlH, 0)} mL/h)`,
          unit: 'sin pérdidas continuas',
          note: 'En hipernatremia crónica evitar descensos > 10 mEq/L en 24 h (riesgo de edema cerebral)',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation:
        dropNeeded > 10
          ? `Para corregir ${dropNeeded.toFixed(1)} mEq/L hasta ${targetNa} mEq/L se requieren ${totalDeficitL.toFixed(2)} L en total, distribuidos en más de 24–48 h si la instauración es crónica o desconocida.`
          : `El descenso requerido (${dropNeeded.toFixed(1)} mEq/L) está dentro del límite de 10 mEq/L para 24 h.`,
      guidance: [
        'Reevaluar sodio sérico cada 4–6 horas durante la reposición para ajustar el ritmo de infusión.',
        'Sumar las pérdidas urinarias e insensibles en curso al volumen calculado.',
      ],
      guidanceDisclaimer: 'Cálculo orientativo; ajustar según estado volémico, cronicidad y respuesta bioquímica.',
      formulaUsed: 'Déficit (L) = ACT × [(Na⁺ actual / Na⁺ objetivo) - 1]',
      inputsSummary: `Peso: ${wRes.rawNumber} ${wRes.unitLabel} · Na⁺ actual: ${currentNa} mEq/L · Objetivo: ${targetNa} mEq/L`,
    };
  },
};
