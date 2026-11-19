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
import { WEIGHT_UNITS_KG } from '../units/converters.ts';

const modeField: SelectFieldDef = {
  id: 'mode',
  label: 'Método de estimación de la deshidratación',
  type: 'select',
  defaultValue: 'clinical',
  options: [
    { value: 'clinical', label: 'Estimación clínica (% según signos y gravedad)' },
    { value: 'weight_loss', label: 'Por pérdida de peso documentada (peso previo vs actual)' },
  ],
};

const ageGroupField: SelectFieldDef = {
  id: 'ageGroup',
  label: 'Grupo etario pediátrico',
  type: 'select',
  defaultValue: 'infant',
  visibleWhen: (i) => i.mode === 'clinical',
  options: [
    { value: 'infant', label: 'Lactante / Niño pequeño (< 10–15 kg: leve 5 %, mod 10 %, grave 15 %)' },
    { value: 'older', label: 'Niño mayor / Adolescente (leve 3 %, mod 6 %, grave 9 %)' },
  ],
};

const clinicalSeverityField: SelectFieldDef = {
  id: 'clinicalGrade',
  label: 'Grado clínico de deshidratación',
  type: 'select',
  defaultValue: 'moderate',
  visibleWhen: (i) => i.mode === 'clinical',
  options: [
    { value: 'mild', label: 'Leve — Mucosas secas, sed aumentada, diuresis ligeramente reducida' },
    { value: 'moderate', label: 'Moderada — Ojos hundidos, pliegue lento, oliguria, taquicardia' },
    { value: 'severe', label: 'Grave — Letargia, llenado capilar > 3 s, hipotensión / choque' },
  ],
};

const currentWeightField: NumberFieldDef = {
  id: 'currentWeight',
  label: 'Peso actual del paciente',
  type: 'number',
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  min: 1.5,
  max: 120,
  placeholder: '12',
};

const previousWeightField: NumberFieldDef = {
  id: 'previousWeight',
  label: 'Peso previo reciente (sano)',
  type: 'number',
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  min: 1.5,
  max: 120,
  placeholder: '13',
  visibleWhen: (i) => i.mode === 'weight_loss',
};

const bolusField: NumberFieldDef = {
  id: 'bolusGiven',
  label: 'Bolos de reanimación IV ya administrados (a descontar del déficit si aplica)',
  type: 'number',
  canonicalUnit: 'mL',
  units: [{ id: 'ml', label: 'mL', toCanonical: (v) => v, min: 0, max: 5000, step: 10 }],
  defaultUnitId: 'ml',
  defaultValue: '0',
  min: 0,
  max: 5000,
  placeholder: '0',
  required: false,
};

function calcHollidayDaily(w: number): number {
  if (w <= 10) return w * 100;
  if (w <= 20) return 1000 + (w - 10) * 50;
  return 1500 + (w - 20) * 20;
}

export const pediatricDehydrationCalculator: CalculatorDefinition = {
  id: 'pediatric-dehydration',
  name: 'Déficit de Líquidos y Deshidratación Pediátrica',
  shortName: 'Deshidratación Pediátrica',
  primarySpecialty: 'pediatria',
  secondarySpecialties: ['urgencias'],
  subcategory: 'liquidos',
  keywords: ['deshidratacion', 'deficit de liquidos', 'pediatria', 'rehidratacion', 'sro', 'gastroenteritis'],
  description:
    'Calcula el porcentaje de deshidratación, el déficit total de volumen (mL) y la pauta combinada con mantenimiento de 24 h (reposición 50 % en 8 h + 50 % en 16 h).',
  clinicalIndication:
    'Planificación de rehidratación oral (SRO) o intravenosa en niños con gastroenteritis aguda, pérdidas gastrointestinales o deshidratación.',
  validatedPopulation: 'Lactantes y niños (> 1 mes a 18 años) con deshidratación isotónica/hipovolémica.',
  contraindications: [
    'En deshidratación hipernatrémica (Na⁺ > 150 mEq/L) o cetoacidosis diabética NO corregir el déficit en 24 h: debe reponerse lentamente en 48–72 horas para prevenir edema cerebral.',
    'En desnutrición aguda grave (OMS), la reposición IV rápida está contraindicada salvo choque establecido; usar protocolos específicos (ReSoMal / pautas OMS).',
  ],
  limitations: [
    'En deshidratación leve y moderada sin íleo, shock ni vómitos incoercibles, la terapia de rehidratación oral (SRO 50–100 mL/kg en 4 horas) es el tratamiento de primera elección sobre la vía intravenosa.',
  ],
  version: 'AAP / ESPGHAN / Nelson Pediatrics',
  references: [
    {
      citation: 'Guarino A, Ashkenazi S, Gendrel D, et al. European Society for Pediatric Gastroenterology, Hepatology, and Nutrition/European Society for Pediatric Infectious Diseases evidence-based guidelines for the management of acute gastroenteritis in children in Europe. J Pediatr Gastroenterol Nutr. 2014;59(1):132-152.',
      year: 2014,
    },
  ],
  fields: [modeField, ageGroupField, clinicalSeverityField, currentWeightField, previousWeightField, bolusField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(pediatricDehydrationCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const mode = inputs.mode as string;
    const currW = getCanonicalNumberValue(currentWeightField, inputs.currentWeight as NumberInputValue).canonicalValue!;
    const bolus = getCanonicalNumberValue(bolusField, inputs.bolusGiven as NumberInputValue).canonicalValue ?? 0;

    let pctDehydration = 0;
    let refWeight = currW;

    if (mode === 'weight_loss') {
      const prevW = getCanonicalNumberValue(previousWeightField, inputs.previousWeight as NumberInputValue).canonicalValue!;
      if (currW > prevW) {
        throw new Error('El peso actual no puede ser mayor que el peso previo sano para calcular pérdida.');
      }
      pctDehydration = ((prevW - currW) / prevW) * 100;
      refWeight = prevW;
    } else {
      const isInfant = inputs.ageGroup === 'infant';
      const grade = inputs.clinicalGrade as string;
      if (grade === 'mild') pctDehydration = isInfant ? 5 : 3;
      else if (grade === 'moderate') pctDehydration = isInfant ? 10 : 6;
      else pctDehydration = isInfant ? 15 : 9;
    }

    const pctRounded = roundClinical(pctDehydration, 1);
    const totalDeficitMl = roundClinical(pctDehydration * 10 * refWeight, 0);
    const netDeficitMl = Math.max(0, totalDeficitMl - bolus);
    const maintenance24h = roundClinical(calcHollidayDaily(currW), 0);

    // First 8h = 1/2 net deficit + 1/3 maintenance; Next 16h = 1/2 net deficit + 2/3 maintenance
    const first8hTotal = roundClinical(netDeficitMl * 0.5 + maintenance24h / 3, 0);
    const next16hTotal = roundClinical(netDeficitMl * 0.5 + (maintenance24h * 2) / 3, 0);
    const rateFirst8h = roundClinical(first8hTotal / 8, 1);
    const rateNext16h = roundClinical(next16hTotal / 16, 1);
    const shockBolus20 = roundClinical(currW * 20, 0);

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let guidance: string[] = [];

    if (pctRounded < 5) {
      severity = 'low';
      riskClassification = `Deshidratación leve (${pctRounded.toFixed(1)} %)`;
      guidance = [
        `Primera línea: rehidratación oral (SRO hipoosmolar ≈ ${roundClinical(currW * 50, 0)} mL en 4 horas) más reposición de pérdidas continuas.`,
      ];
    } else if (pctRounded < 10) {
      severity = 'moderate';
      riskClassification = `Deshidratación moderada (${pctRounded.toFixed(1)} %)`;
      guidance = [
        `Si tolera vía oral o SNG: SRO 50–100 mL/kg (${roundClinical(currW * 50, 0)}–${roundClinical(currW * 100, 0)} mL) en 4 horas.`,
        `Si requiere vía IV: solución isotónica con corrección de déficit neto + mantenimiento en 24 h (descartar antes hipernatremia).`,
      ];
    } else {
      severity = 'critical';
      riskClassification = `Deshidratación grave (≥ 10 %: ${pctRounded.toFixed(1)} %)`;
      guidance = [
        `Ante signos de choque/hipoperfusión administrar bolo inicial de cristaloide isotónico (NaCl 0.9 % o Ringer Lactato) a 20 mL/kg = ${shockBolus20} mL y reevaluar.`,
        'Monitorizar electrolitos (Na⁺, K⁺, glucemia, gasometría) antes de ajustar soluciones definitivas.',
      ];
    }

    return {
      primaryResult: {
        label: 'Déficit estimado de líquidos',
        value: totalDeficitMl,
        formattedValue: formatClinicalNumber(totalDeficitMl, 0),
        unit: 'mL totales',
      },
      secondaryResults: [
        {
          label: 'Porcentaje de deshidratación',
          formattedValue: formatClinicalNumber(pctRounded, 1),
          unit: '%',
        },
        {
          label: 'Mantenimiento Holliday-Segar (24 h)',
          formattedValue: formatClinicalNumber(maintenance24h, 0),
          unit: 'mL/24 h',
        },
        {
          label: 'Pauta IV orientativa: primeras 8 horas (50 % déficit neto + 1/3 mant.)',
          formattedValue: `${formatClinicalNumber(first8hTotal, 0)} mL (${formatClinicalNumber(rateFirst8h, 1)} mL/h)`,
          unit: '',
        },
        {
          label: 'Pauta IV orientativa: siguientes 16 horas (50 % déficit neto + 2/3 mant.)',
          formattedValue: `${formatClinicalNumber(next16hTotal, 0)} mL (${formatClinicalNumber(rateNext16h, 1)} mL/h)`,
          unit: '',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation: `Déficit total calculado de ${totalDeficitMl} mL (${pctRounded.toFixed(1)} % del peso corporal)${bolus > 0 ? `; déficit residual tras descontar ${bolus} mL de bolos = ${netDeficitMl} mL` : ''}.`,
      guidance,
      guidanceDisclaimer: 'En hipernatremia (> 150 mEq/L) extender la corrección del déficit a 48–72 h.',
      formulaUsed: 'Déficit (mL) = % deshidratación × 10 × Peso (kg)',
      inputsSummary: `Peso actual: ${roundClinical(currW, 2)} kg · Deshidratación: ${pctRounded.toFixed(1)} %`,
    };
  },
};
