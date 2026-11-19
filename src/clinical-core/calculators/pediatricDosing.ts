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
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';
import { WEIGHT_UNITS_KG } from '../units/converters.ts';

const weightField: NumberFieldDef = {
  id: 'weight',
  label: 'Peso del paciente pediátrico',
  type: 'number',
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  min: 0.5,
  max: 120,
  placeholder: '14.5',
};

const basisField: SelectFieldDef = {
  id: 'doseBasis',
  label: 'Base de prescripción de la dosis',
  type: 'select',
  defaultValue: 'per_day',
  options: [
    { value: 'per_day', label: 'Dosis diaria total (mg/kg/día repartida en tomas)' },
    { value: 'per_dose', label: 'Dosis por toma (mg/kg/dosis)' },
  ],
};

const doseMgKgField: NumberFieldDef = {
  id: 'doseMgKg',
  label: 'Dosis indicada por kg',
  type: 'number',
  canonicalUnit: 'mg/kg',
  units: [{ id: 'mg_kg', label: 'mg/kg', toCanonical: (v) => v, min: 0.01, max: 500, step: 0.1 }],
  defaultUnitId: 'mg_kg',
  min: 0.01,
  max: 500,
  placeholder: '50',
  helpText: 'Ej.: Amoxicilina 50–90 mg/kg/día, o Paracetamol 10–15 mg/kg/dosis.',
};

const frequencyField: SelectFieldDef = {
  id: 'dosesPerDay',
  label: 'Frecuencia de administración',
  type: 'select',
  defaultValue: '3',
  options: [
    { value: '1', label: 'Cada 24 h (1 vez al día)' },
    { value: '2', label: 'Cada 12 h (2 veces al día)' },
    { value: '3', label: 'Cada 8 h (3 veces al día)' },
    { value: '4', label: 'Cada 6 h (4 veces al día)' },
    { value: '6', label: 'Cada 4 h (6 veces al día)' },
  ],
};

const concMgField: NumberFieldDef = {
  id: 'concMg',
  label: 'Concentración del fármaco: miligramos (mg)',
  type: 'number',
  canonicalUnit: 'mg',
  units: [{ id: 'mg', label: 'mg', toCanonical: (v) => v, min: 0.1, max: 10000, step: 1 }],
  defaultUnitId: 'mg',
  min: 0.1,
  max: 10000,
  placeholder: '250',
  required: false,
  helpText: 'Opcional para calcular mL por toma (ej. 250 mg en 5 mL).',
};

const concMlField: NumberFieldDef = {
  id: 'concMl',
  label: 'Concentración del fármaco: volumen de referencia (mL)',
  type: 'number',
  canonicalUnit: 'mL',
  units: [{ id: 'ml', label: 'mL', toCanonical: (v) => v, min: 0.5, max: 1000, step: 0.5 }],
  defaultUnitId: 'ml',
  defaultValue: '5',
  min: 0.5,
  max: 1000,
  placeholder: '5',
  required: false,
};

const maxDailyField: NumberFieldDef = {
  id: 'maxDailyMg',
  label: 'Tope máximo diario adulto / ficha técnica (mg/día, opcional)',
  type: 'number',
  canonicalUnit: 'mg/día',
  units: [{ id: 'mg', label: 'mg/día', toCanonical: (v) => v, min: 1, max: 50000, step: 10 }],
  defaultUnitId: 'mg',
  min: 1,
  max: 50000,
  placeholder: '3000',
  required: false,
  helpText: 'Si se indica, la calculadora limita o advierte si la dosis calculada por peso supera el máximo de adulto.',
};

export const pediatricDosingCalculator: CalculatorDefinition = {
  id: 'pediatric-dosing',
  name: 'Calculadora de Dosificación Pediátrica por Peso (mg ↔ mL)',
  shortName: 'Dosis Pediátrica',
  primarySpecialty: 'pediatria',
  secondarySpecialties: ['urgencias'],
  subcategory: 'dosificacion',
  keywords: ['dosificacion pediatrica', 'dosis por peso', 'jarabe', 'suspension', 'mg/kg/dia', 'ml por toma'],
  description:
    'Conversión aritmética exacta de dosis pediátrica por peso (mg/kg/día o mg/kg/dosis) a miligramos y mililitros por toma según concentración del preparado.',
  clinicalIndication:
    'Prescripción y verificación de dosis y volumen de jarabes, suspensiones o soluciones IV en población pediátrica.',
  validatedPopulation: 'Neonatos, lactantes y niños (siempre verificar la dosis recomendada por edad gestacional/postnatal en fichas oficiales).',
  contraindications: [
    'Nunca sobrepasar la dosis máxima estándar de adulto cuando el cálculo ponderal en niños grandes/obesos la exceda.',
  ],
  limitations: [
    'No sustituye el vademécum pediátrico (el clínico introduce la dosis mg/kg válida para la indicación, edad y función renal del paciente).',
    'En pacientes pediátricos con obesidad significativa ciertos fármacos hidrofílicos requieren calcular con peso ideal o ajustado.',
  ],
  version: 'Cálculo posológico ponderal estándar',
  references: [
    {
      citation: 'Committee on Drugs, American Academy of Pediatrics. Guidelines for pediatric drug dosing and safe medication administration in children.',
      year: 2020,
    },
  ],
  fields: [weightField, basisField, doseMgKgField, frequencyField, concMgField, concMlField, maxDailyField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(pediatricDosingCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const weight = getCanonicalNumberValue(weightField, inputs.weight as NumberInputValue).canonicalValue!;
    const doseMgKg = getCanonicalNumberValue(doseMgKgField, inputs.doseMgKg as NumberInputValue).canonicalValue!;
    const dosesPerDay = Number(inputs.dosesPerDay);
    const basis = inputs.doseBasis as string;

    const concMg = getCanonicalNumberValue(concMgField, inputs.concMg as NumberInputValue).canonicalValue;
    const concMl = getCanonicalNumberValue(concMlField, inputs.concMl as NumberInputValue).canonicalValue;
    const maxDaily = getCanonicalNumberValue(maxDailyField, inputs.maxDailyMg as NumberInputValue).canonicalValue;

    let dailyMgRaw = 0;
    let perDoseMgRaw = 0;
    if (basis === 'per_day') {
      dailyMgRaw = weight * doseMgKg;
      perDoseMgRaw = dailyMgRaw / dosesPerDay;
    } else {
      perDoseMgRaw = weight * doseMgKg;
      dailyMgRaw = perDoseMgRaw * dosesPerDay;
    }

    const capped = maxDaily !== null && dailyMgRaw > maxDaily;
    const effectiveDailyMg = capped ? maxDaily! : dailyMgRaw;
    const effectivePerDoseMg = effectiveDailyMg / dosesPerDay;

    const perDoseRounded = roundClinical(effectivePerDoseMg, 1);
    const dailyRounded = roundClinical(effectiveDailyMg, 1);

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Dosis diaria total',
        formattedValue: formatClinicalNumber(dailyRounded, 1),
        unit: 'mg/día',
        note: capped ? `Limitada al tope máximo configurado (cálculo sin tope: ${roundClinical(dailyMgRaw, 1)} mg/día)` : undefined,
      },
    ];

    let mlPerDose: number | null = null;
    if (concMg !== null && concMl !== null && concMg > 0) {
      mlPerDose = roundClinical((effectivePerDoseMg * concMl) / concMg, 2);
      secondaryResults.unshift({
        label: `Volumen a administrar por toma (${concMg} mg / ${concMl} mL)`,
        formattedValue: formatClinicalNumber(mlPerDose, 2),
        unit: 'mL/toma',
      });
    }

    let severity: SeverityLevel = 'info';
    let riskClassification = `${formatClinicalNumber(perDoseRounded, 1)} mg por toma (${dosesPerDay}×/día)`;
    if (capped) {
      severity = 'moderate';
      riskClassification = `Tope máximo diario aplicado (${dailyRounded} mg/día)`;
    } else if (weight >= 40 && maxDaily === null) {
      severity = 'low';
      riskClassification = `${formatClinicalNumber(perDoseRounded, 1)} mg/toma — Verificar dosis máxima de adulto`;
    }

    return {
      primaryResult: {
        label: 'Dosis por toma',
        value: perDoseRounded,
        formattedValue: formatClinicalNumber(perDoseRounded, 1),
        unit: 'mg/toma',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation: `${dosesPerDay} toma(s) al día para un paciente de ${roundClinical(weight, 2)} kg${mlPerDose !== null ? `, equivalentes a ${formatClinicalNumber(mlPerDose, 2)} mL por toma` : ''}.`,
      formulaUsed:
        basis === 'per_day'
          ? 'Dosis/toma = (Peso × mg/kg/día) / N.º tomas · Volumen = (Dosis × mL ref.) / mg ref.'
          : 'Dosis/toma = Peso × mg/kg/dosis · Dosis diaria = Dosis/toma × N.º tomas',
      inputsSummary: `Peso: ${roundClinical(weight, 2)} kg · ${doseMgKg} mg/kg · ${dosesPerDay} tomas/día`,
    };
  },
};
