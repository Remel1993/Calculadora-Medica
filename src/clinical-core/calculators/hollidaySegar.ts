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

const weightField: NumberFieldDef = {
  id: 'weight',
  label: 'Peso del paciente',
  type: 'number',
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  min: 1,
  max: 150,
  placeholder: '16',
};

const restrictionField: SelectFieldDef = {
  id: 'factor',
  label: 'Factor de mantenimiento clínico',
  type: 'select',
  defaultValue: '1',
  helpText: 'En ciertas patologías (SIADH, meningitis, cardiopatía, ventilación mecánica o LRA) puede indicarse restricción hídrica (70–80 % o 2/3 del basal).',
  options: [
    { value: '1', label: '100 % — Mantenimiento estándar Holliday-Segar' },
    { value: '0.8', label: '80 % — Restricción leve' },
    { value: '0.67', label: '67 % (2/3) — Restricción hídrica moderada' },
  ],
};

export const hollidaySegarCalculator: CalculatorDefinition = {
  id: 'holliday-segar',
  name: 'Líquidos de Mantenimiento Pediátrico (Holliday-Segar / 4-2-1)',
  shortName: 'Holliday-Segar',
  primarySpecialty: 'pediatria',
  secondarySpecialties: ['urgencias', 'cirugia-general'],
  subcategory: 'liquidos',
  keywords: ['holliday', 'segar', '4-2-1', 'liquidos', 'mantenimiento', 'pediatria', 'sueroterapia'],
  description:
    'Estima los requerimientos basales diarios (mL/24 h) y horarios (mL/h) de líquidos de mantenimiento según el peso corporal.',
  clinicalIndication:
    'Cálculo de líquidos basales de mantenimiento en niños mayores de 28 días (hospitalización, ayuno preoperatorio o reposición junto con déficit).',
  validatedPopulation: 'Pacientes pediátricos de 28 días a 18 años (1 – 150 kg; suele limitarse a ~2,400–2,500 mL/día en adolescentes/adultos).',
  contraindications: [
    'NO aplicar directamente en neonatos en los primeros días de vida (tienen requerimientos progresivos por edad postnatal y peso al nacer).',
    'No usar el 100 % estándar sin ajuste en anuria/oliguria, lesión renal aguda avanzada, insuficiencia cardíaca congestiva o SIADH.',
  ],
  limitations: [
    'Seguridad electrolítica (Guía AAP 2018): para líquidos IV de mantenimiento en pacientes de 28 días a 18 años se recomiendan soluciones ISOTÓNICAS (p. ej. NaCl 0.9 % con dextrosa 5 % + KCl apropiado tras comprobar diuresis) para evitar hiponatremia hospitalaria grave.',
  ],
  version: 'Holliday MA & Segar WE (Pediatrics 1957) + Guía AAP 2018',
  references: [
    {
      citation: 'Holliday MA, Segar WE. The maintenance need for water in parenteral fluid therapy. Pediatrics. 1957;19(5):823-832.',
      year: 1957,
    },
    {
      citation: 'Feld LG, Neuspiel DR, Foster BA, et al. Clinical Practice Guideline: Maintenance Intravenous Fluids in Children. Pediatrics. 2018;142(6):e20183083.',
      year: 2018,
    },
  ],
  fields: [weightField, restrictionField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(hollidaySegarCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const weight = getCanonicalNumberValue(weightField, inputs.weight as NumberInputValue).canonicalValue!;
    const factor = Number(inputs.factor || '1');

    let dailyBase = 0;
    let hourlyBase = 0;

    if (weight <= 10) {
      dailyBase = weight * 100;
      hourlyBase = weight * 4;
    } else if (weight <= 20) {
      dailyBase = 1000 + (weight - 10) * 50;
      hourlyBase = 40 + (weight - 10) * 2;
    } else {
      dailyBase = 1500 + (weight - 20) * 20;
      hourlyBase = 60 + (weight - 20) * 1;
    }

    const dailyAdjusted = roundClinical(dailyBase * factor, 0);
    const hourlyAdjusted = roundClinical(hourlyBase * factor, 1);

    return {
      primaryResult: {
        label: 'Ritmo de infusión de mantenimiento',
        value: hourlyAdjusted,
        formattedValue: formatClinicalNumber(hourlyAdjusted, 1),
        unit: 'mL/h',
      },
      secondaryResults: [
        {
          label: 'Volumen total en 24 horas (100-50-20)',
          formattedValue: formatClinicalNumber(dailyAdjusted, 0),
          unit: 'mL/24 h',
          note: dailyAdjusted > 2500 ? 'Supera 2,500 mL/24 h; valorar techo estándar adulto según clínica' : undefined,
        },
        {
          label: 'Requerimiento basal al 100 %',
          formattedValue: `${formatClinicalNumber(roundClinical(hourlyBase, 1), 1)} mL/h (${formatClinicalNumber(roundClinical(dailyBase, 0), 0)} mL/día)`,
          unit: '',
        },
      ],
      severity: 'info',
      riskClassification: `Mantenimiento al ${Math.round(factor * 100)} % (${hourlyAdjusted.toFixed(1)} mL/h)`,
      clinicalInterpretation:
        'Volumen de mantenimiento basal calculado por regla 4-2-1 mL/kg/h (equivalente a 100-50-20 mL/kg/24 h).',
      guidance: [
        'En mantenimiento intravenoso hospitalario (> 28 días – 18 años) utilizar solución isotónica con dextrosa según guía AAP 2018, añadiendo KCl solo tras confirmar diuresis adecuada y potasio normal.',
      ],
      formulaUsed: '≤10 kg: 4 mL/kg/h | 11–20 kg: 40 + 2 mL/kg/h | >20 kg: 60 + 1 mL/kg/h',
      inputsSummary: `Peso: ${roundClinical(weight, 2)} kg · Factor: ${Math.round(factor * 100)} %`,
    };
  },
};
