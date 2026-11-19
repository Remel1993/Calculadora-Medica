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
import { BP_UNITS_MMHG, HR_UNITS_BPM } from '../units/converters.ts';

const hrField: NumberFieldDef = {
  id: 'hr',
  label: 'Frecuencia cardíaca (FC)',
  type: 'number',
  canonicalUnit: 'lpm',
  units: HR_UNITS_BPM,
  defaultUnitId: 'bpm',
  min: 20,
  max: 260,
  placeholder: '110',
};

const sbpField: NumberFieldDef = {
  id: 'sbp',
  label: 'Presión arterial sistólica (PAS)',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  min: 40,
  max: 300,
  placeholder: '95',
};

const dbpField: NumberFieldDef = {
  id: 'dbp',
  label: 'Presión arterial diastólica (PAD, opcional para Índice Modificado)',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  min: 20,
  max: 200,
  placeholder: '60',
  required: false,
};

export const shockIndexCalculator: CalculatorDefinition = {
  id: 'shock-index',
  name: 'Índice de Choque (Shock Index) y Modificado',
  shortName: 'Índice de Choque',
  primarySpecialty: 'urgencias',
  secondarySpecialties: ['cardiologia', 'medicina-interna'],
  subcategory: 'gravedad',
  keywords: ['shock index', 'indice de choque', 'choque', 'trauma', 'hemorragia', 'sepsis', 'msi'],
  description:
    'Cociente FC / PAS para detección temprana de inestabilidad hemodinámica oculta antes de que aparezca hipotensión franca.',
  clinicalIndication:
    'Triaje rápido en trauma, hemorragia aguda, sepsis y urgencias cardiovasculares en adultos no embarazados.',
  validatedPopulation: 'Adultos (18–65 años principalmente; en obstetricia y pediatría se usan puntos de corte específicos).',
  contraindications: [
    'Menor sensibilidad en pacientes tratados con betabloqueadores, calcioantagonistas no dihidropiridínicos o marcapasos con frecuencia fija.',
    'En embarazo/posparto aplicar el Índice de Choque Obstétrico (umbral ≥ 0.9–1.0).',
  ],
  limitations: [
    'En adultos mayores hipertensos basales puede subestimar el choque inicial o requerir el Índice de Choque por Edad (Edad × SI).',
    'No sustituye marcadores de perfusión tisular (lactato, llenado capilar, diuresis).',
  ],
  version: 'Allgöwer & Burri (1967) / MSI (Liu 2012)',
  references: [
    {
      citation: 'Allgöwer M, Burri C. Shock index. Dtsch Med Wochenschr. 1967;92(43):1947-1950.',
      year: 1967,
    },
    {
      citation:
        'Liu YC, Liu JH, Fang ZA, et al. Modified shock index and mortality rate of emergency patients. World J Emerg Med. 2012;3(2):114-117.',
      year: 2012,
    },
  ],
  fields: [hrField, sbpField, dbpField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(shockIndexCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const hr = getCanonicalNumberValue(hrField, inputs.hr as NumberInputValue).canonicalValue!;
    const sbp = getCanonicalNumberValue(sbpField, inputs.sbp as NumberInputValue).canonicalValue!;
    const dbpVal = getCanonicalNumberValue(dbpField, inputs.dbp as NumberInputValue).canonicalValue;

    const si = roundClinical(hr / sbp, 2);
    const secondaryResults: SecondaryResultItem[] = [];

    if (dbpVal !== null) {
      if (sbp <= dbpVal) {
        throw new Error('La PAS debe ser mayor que la PAD.');
      }
      const pam = (sbp + 2 * dbpVal) / 3;
      const msi = roundClinical(hr / pam, 2);
      secondaryResults.push({
        label: 'Índice de Choque Modificado (FC / PAM)',
        formattedValue: formatClinicalNumber(msi, 2),
        unit: 'ratio',
        note: msi > 1.3 ? 'MSI > 1.3 asociado a mayor riesgo de inestabilidad/mortalidad' : 'Rango MSI habitual: 0.7 – 1.3',
      });
    }

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (si < 0.8) {
      severity = 'normal';
      riskClassification = 'Rango habitual en adultos (0.5 – 0.79)';
      clinicalInterpretation = 'Sin datos de choque oculto por este cociente.';
    } else if (si < 1.0) {
      severity = 'moderate';
      riskClassification = 'Elevado / Alerta temprana (0.80 – 0.99)';
      clinicalInterpretation =
        'Sugiere respuesta simpática compensadora o depleción de volumen temprana aun con PAS conservada.';
    } else if (si < 1.4) {
      severity = 'high';
      riskClassification = 'Alto riesgo de choque (1.00 – 1.39)';
      clinicalInterpretation =
        'Frecuencia cardíaca igual o superior a la PAS. Asociado a hemorragia significativa, sepsis o requerimiento de reanimación activa.';
    } else {
      severity = 'critical';
      riskClassification = 'Choque grave / Riesgo crítico (≥ 1.40)';
      clinicalInterpretation =
        'Inestabilidad hemodinámica grave con alto riesgo de necesidad de transfusión masiva, vasopresores o ingreso a UCI.';
    }

    return {
      primaryResult: {
        label: 'Índice de Choque (FC / PAS)',
        value: si,
        formattedValue: formatClinicalNumber(si, 2),
        unit: 'ratio',
      },
      secondaryResults: secondaryResults.length > 0 ? secondaryResults : undefined,
      severity,
      riskClassification,
      clinicalInterpretation,
      formulaUsed: 'SI = FC (lpm) / PAS (mmHg)',
      inputsSummary: `FC: ${hr} lpm · PAS: ${sbp} mmHg${dbpVal !== null ? ` · PAD: ${dbpVal} mmHg` : ''}`,
    };
  },
};
