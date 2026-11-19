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
import { BP_UNITS_MMHG } from '../units/converters.ts';

const sbpField: NumberFieldDef = {
  id: 'sbp',
  label: 'Presión arterial sistólica (PAS)',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  min: 40,
  max: 300,
  placeholder: '120',
};

const dbpField: NumberFieldDef = {
  id: 'dbp',
  label: 'Presión arterial diastólica (PAD)',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  min: 20,
  max: 200,
  placeholder: '80',
};

export const mapPamCalculator: CalculatorDefinition = {
  id: 'map-pam',
  name: 'Presión Arterial Media (PAM)',
  shortName: 'PAM',
  primarySpecialty: 'cardiologia',
  secondarySpecialties: ['urgencias', 'medicina-interna'],
  subcategory: 'formulas',
  keywords: ['pam', 'map', 'presion arterial media', 'perfusion', 'sepsis', 'hipotension'],
  description: 'Estima la presión de perfusión tisular promedio durante un ciclo cardíaco completo.',
  clinicalIndication:
    'Monitorización hemodinámica básica en urgencias, choque, sepsis (meta habitual ≥ 65 mmHg) y neurocríticos.',
  validatedPopulation: 'Adultos y población general con medición de presión arterial sistólica y diastólica.',
  contraindications: [
    'En taquicardia extrema la diástole se acorta y la fórmula estándar (1/3 PAS + 2/3 PAD) puede subestimar ligeramente la PAM real medida por línea arterial.',
  ],
  limitations: [
    'No reemplaza la medición invasiva intraarterial en pacientes con choque grave o vasopresores a dosis altas.',
  ],
  version: 'Fórmula estándar (1/3 PAS + 2/3 PAD)',
  references: [
    {
      citation:
        'Evans L, Rhodes A, Alhazzani W, et al. Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2021. Intensive Care Med. 2021;47(11):1181-1247.',
      year: 2021,
    },
  ],
  fields: [sbpField, dbpField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(mapPamCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const sbp = getCanonicalNumberValue(sbpField, inputs.sbp as NumberInputValue).canonicalValue!;
    const dbp = getCanonicalNumberValue(dbpField, inputs.dbp as NumberInputValue).canonicalValue!;

    if (sbp <= dbp) {
      throw new Error('La presión arterial sistólica (PAS) debe ser mayor que la diastólica (PAD).');
    }

    const pam = roundClinical((sbp + 2 * dbp) / 3, 1);
    const pulsePressure = roundClinical(sbp - dbp, 0);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (pam < 65) {
      severity = 'critical';
      riskClassification = `Hipoperfusión / PAM baja (< 65 mmHg)`;
      clinicalInterpretation =
        'Por debajo del umbral mínimo habitual de perfusión orgánica (65 mmHg en adultos). Evaluar signos de hipoperfusión, volemia y soporte vasopresor según contexto.';
    } else if (pam <= 105) {
      severity = 'normal';
      riskClassification = 'Rango fisiológico habitual (65 – 105 mmHg)';
      clinicalInterpretation = 'Presión arterial media dentro de rangos habituales de perfusión tisular.';
    } else if (pam < 130) {
      severity = 'moderate';
      riskClassification = 'PAM elevada (106 – 129 mmHg)';
      clinicalInterpretation = 'Elevación moderada; valorar contexto hipertensivo y lesión de órgano diana.';
    } else {
      severity = 'high';
      riskClassification = 'PAM marcadamente elevada (≥ 130 mmHg)';
      clinicalInterpretation = 'Evaluar posible emergencia o urgencia hipertensiva según presencia de daño agudo a órgano diana.';
    }

    return {
      primaryResult: {
        label: 'Presión Arterial Media (PAM)',
        value: pam,
        formattedValue: formatClinicalNumber(pam, 1),
        unit: 'mmHg',
      },
      secondaryResults: [
        {
          label: 'Presión de pulso (PAS - PAD)',
          formattedValue: formatClinicalNumber(pulsePressure, 0),
          unit: 'mmHg',
          note: pulsePressure < 25 ? 'Presión de pulso estrecha (< 25 mmHg)' : undefined,
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      formulaUsed: 'PAM = (PAS + 2 × PAD) / 3',
      inputsSummary: `PAS: ${sbp} mmHg · PAD: ${dbp} mmHg`,
    };
  },
};
