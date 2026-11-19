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
} from '../types/clinical.ts';
import { WEIGHT_UNITS_KG } from '../units/converters.ts';

const directionField: SelectFieldDef = {
  id: 'direction',
  label: 'Sentido del cálculo',
  type: 'select',
  defaultValue: 'dose_to_rate',
  options: [
    { value: 'dose_to_rate', label: 'Dosis prescrita → Velocidad de bomba (mL/h)' },
    { value: 'rate_to_dose', label: 'Velocidad de bomba (mL/h) → Dosis recibida' },
  ],
};

const doseUnitField: SelectFieldDef = {
  id: 'doseUnit',
  label: 'Unidad de dosis de la infusión',
  type: 'select',
  defaultValue: 'mcg_kg_min',
  options: [
    { value: 'mcg_kg_min', label: 'mcg/kg/min (ej. Noradrenalina, Dopamina, Dobutamina)' },
    { value: 'mcg_min', label: 'mcg/min (ej. Nitroglicerina, Noradrenalina fija)' },
    { value: 'mg_h', label: 'mg/h (ej. Furosemida, Midazolam, Nicardipino)' },
    { value: 'mcg_kg_h', label: 'mcg/kg/h (ej. Dexmedetomidina, Fentanilo)' },
  ],
};

const drugAmountField: NumberFieldDef = {
  id: 'drugAmountMg',
  label: 'Cantidad total de fármaco en la bolsa/jeringa',
  type: 'number',
  canonicalUnit: 'mg',
  units: [
    { id: 'mg', label: 'mg', toCanonical: (v) => v, min: 0.1, max: 50000, step: 0.5 },
    { id: 'mcg', label: 'mcg', toCanonical: (v) => v / 1000, min: 100, max: 50000000, step: 100 },
  ],
  defaultUnitId: 'mg',
  min: 0.1,
  max: 50000,
  placeholder: '8',
  helpText: 'Ej.: 2 ampollas de 4 mg de Noradrenalina = 8 mg.',
};

const volumeField: NumberFieldDef = {
  id: 'volumeMl',
  label: 'Volumen total de la dilución',
  type: 'number',
  canonicalUnit: 'mL',
  units: [{ id: 'ml', label: 'mL', toCanonical: (v) => v, min: 1, max: 2000, step: 1 }],
  defaultUnitId: 'ml',
  min: 1,
  max: 2000,
  placeholder: '250',
};

const weightField: NumberFieldDef = {
  id: 'weight',
  label: 'Peso del paciente',
  type: 'number',
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  min: 0.5,
  max: 350,
  placeholder: '70',
  visibleWhen: (i) => i.doseUnit === 'mcg_kg_min' || i.doseUnit === 'mcg_kg_h',
};

const desiredDoseField: NumberFieldDef = {
  id: 'desiredDose',
  label: 'Dosis objetivo',
  type: 'number',
  canonicalUnit: 'dosis',
  units: [{ id: 'dose', label: 'según unidad arriba', toCanonical: (v) => v, min: 0.001, max: 10000, step: 0.01 }],
  defaultUnitId: 'dose',
  min: 0.001,
  max: 10000,
  placeholder: '0.1',
  visibleWhen: (i) => i.direction === 'dose_to_rate',
};

const pumpRateField: NumberFieldDef = {
  id: 'pumpRate',
  label: 'Velocidad actual de bomba',
  type: 'number',
  canonicalUnit: 'mL/h',
  units: [{ id: 'ml_h', label: 'mL/h', toCanonical: (v) => v, min: 0.1, max: 1000, step: 0.1 }],
  defaultUnitId: 'ml_h',
  min: 0.1,
  max: 1000,
  placeholder: '15',
  visibleWhen: (i) => i.direction === 'rate_to_dose',
};

const UNIT_LABELS: Record<string, string> = {
  mcg_kg_min: 'mcg/kg/min',
  mcg_min: 'mcg/min',
  mg_h: 'mg/h',
  mcg_kg_h: 'mcg/kg/h',
};

export const infusionCalculator: CalculatorDefinition = {
  id: 'infusion-calculator',
  name: 'Calculadora de Infusiones Continuas (mL/h ↔ Dosis)',
  shortName: 'Infusiones IV',
  primarySpecialty: 'urgencias',
  secondarySpecialties: ['cardiologia', 'pediatria'],
  subcategory: 'dosificacion',
  keywords: [
    'infusion',
    'bomba',
    'ml/h',
    'mcg/kg/min',
    'noradrenalina',
    'dopamina',
    'dobutamina',
    'vasopresores',
  ],
  description:
    'Conversión bidireccional entre dosis farmacológica de infusión continua y velocidad de bomba de perfusión (mL/h) según concentración preparada.',
  clinicalIndication:
    'Preparación y verificación aritmética de perfusiones de fármacos vasoactivos, sedoanalgesia o infusiones continuas en urgencias y UCI.',
  validatedPopulation: 'Adultos y pediatría (verificando siempre la dilución institucional estándar).',
  contraindications: [
    'No utilizar para fármacos dosificados en Unidades Internacionales (p. ej. insulina o vasopresina en UI/h) mediante este conversor de masa (mg/mcg).',
  ],
  limitations: [
    'Realizar doble verificación independiente de la dilución preparada (mg o mcg en volumen total mL) antes de programar la bomba.',
  ],
  version: 'Conversor dimensional exacto',
  references: [
    {
      citation:
        'Institute for Safe Medication Practices (ISMP). Guidelines for Standard Order Sets and Safe Infusion Pump Concentration Practices.',
      year: 2020,
    },
  ],
  fields: [
    directionField,
    doseUnitField,
    drugAmountField,
    volumeField,
    weightField,
    desiredDoseField,
    pumpRateField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(infusionCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const direction = inputs.direction as string;
    const doseUnit = inputs.doseUnit as string;
    const drugMg = getCanonicalNumberValue(
      drugAmountField,
      inputs.drugAmountMg as NumberInputValue,
    ).canonicalValue!;
    const volumeMl = getCanonicalNumberValue(volumeField, inputs.volumeMl as NumberInputValue)
      .canonicalValue!;

    const concMgPerMl = drugMg / volumeMl;
    const concMcgPerMl = concMgPerMl * 1000;

    const needsWeight = doseUnit === 'mcg_kg_min' || doseUnit === 'mcg_kg_h';
    const weightKg = needsWeight
      ? getCanonicalNumberValue(weightField, inputs.weight as NumberInputValue).canonicalValue!
      : 1;

    if (direction === 'dose_to_rate') {
      const dose = getCanonicalNumberValue(
        desiredDoseField,
        inputs.desiredDose as NumberInputValue,
      ).canonicalValue!;

      let mlPerHour = 0;
      if (doseUnit === 'mcg_kg_min') {
        mlPerHour = (dose * weightKg * 60) / concMcgPerMl;
      } else if (doseUnit === 'mcg_min') {
        mlPerHour = (dose * 60) / concMcgPerMl;
      } else if (doseUnit === 'mg_h') {
        mlPerHour = dose / concMgPerMl;
      } else {
        // mcg_kg_h
        mlPerHour = (dose * weightKg) / concMcgPerMl;
      }

      const rateRounded = roundClinical(mlPerHour, 2);
      const mgPerHour = roundClinical(rateRounded * concMgPerMl, 2);

      return {
        primaryResult: {
          label: 'Velocidad de bomba de infusión',
          value: rateRounded,
          formattedValue: formatClinicalNumber(rateRounded, 2),
          unit: 'mL/h',
        },
        secondaryResults: [
          {
            label: 'Concentración de la mezcla',
            formattedValue: `${formatClinicalNumber(roundClinical(concMcgPerMl, 1), 1)} mcg/mL (${formatClinicalNumber(roundClinical(concMgPerMl, 3), 3)} mg/mL)`,
            unit: '',
          },
          {
            label: 'Aporte horario equivalente',
            formattedValue: formatClinicalNumber(mgPerHour, 2),
            unit: 'mg/h',
          },
        ],
        severity: 'info',
        riskClassification: `Concentración: ${roundClinical(concMcgPerMl, 1)} mcg/mL`,
        clinicalInterpretation: `Para administrar ${dose} ${UNIT_LABELS[doseUnit]} con una mezcla de ${drugMg} mg en ${volumeMl} mL se requieren ${rateRounded.toFixed(2)} mL/h.`,
        guidance: [
          'Confirmar la concentración exacta programada en la bomba inteligente y la permeabilidad de la vía (vía central para vasopresores según protocolo).',
        ],
        formulaUsed: 'Velocidad (mL/h) = Flujo horario requerido de fármaco / Concentración (mg o mcg por mL)',
        inputsSummary: `${drugMg} mg / ${volumeMl} mL · Dosis: ${dose} ${UNIT_LABELS[doseUnit]}${needsWeight ? ` · Peso: ${weightKg} kg` : ''}`,
      };
    }

    // rate_to_dose
    const rate = getCanonicalNumberValue(pumpRateField, inputs.pumpRate as NumberInputValue)
      .canonicalValue!;

    let calcDose = 0;
    if (doseUnit === 'mcg_kg_min') {
      calcDose = (rate * concMcgPerMl) / (weightKg * 60);
    } else if (doseUnit === 'mcg_min') {
      calcDose = (rate * concMcgPerMl) / 60;
    } else if (doseUnit === 'mg_h') {
      calcDose = rate * concMgPerMl;
    } else {
      calcDose = (rate * concMcgPerMl) / weightKg;
    }

    const doseRounded = roundClinical(calcDose, 3);

    return {
      primaryResult: {
        label: 'Dosis administrada actual',
        value: doseRounded,
        formattedValue: formatClinicalNumber(doseRounded, 3),
        unit: UNIT_LABELS[doseUnit],
      },
      secondaryResults: [
        {
          label: 'Concentración de la mezcla',
          formattedValue: `${formatClinicalNumber(roundClinical(concMcgPerMl, 1), 1)} mcg/mL`,
          unit: `(${formatClinicalNumber(roundClinical(concMgPerMl, 3), 3)} mg/mL)`,
        },
      ],
      severity: 'info',
      riskClassification: `${doseRounded.toFixed(3)} ${UNIT_LABELS[doseUnit]}`,
      clinicalInterpretation: `A ${rate} mL/h de una dilución de ${drugMg} mg en ${volumeMl} mL, el paciente recibe ${doseRounded.toFixed(3)} ${UNIT_LABELS[doseUnit]}.`,
      formulaUsed: 'Dosis = [Velocidad (mL/h) × Concentración] / Factor tiempo-peso',
      inputsSummary: `${drugMg} mg / ${volumeMl} mL · Bomba: ${rate} mL/h${needsWeight ? ` · Peso: ${weightKg} kg` : ''}`,
    };
  },
};
