import {
  formatClinicalNumber,
  getCanonicalNumberValue,
  roundClinical,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';
import { BP_UNITS_MMHG, CHOLESTEROL_UNITS_MG_DL } from '../units/converters.ts';

const ageField: NumberFieldDef = {
  id: 'age',
  label: 'Edad (validado 30 – 74 años)',
  type: 'number',
  canonicalUnit: 'años',
  units: [{ id: 'years', label: 'años', toCanonical: (v) => v, min: 30, max: 74, step: 1 }],
  defaultUnitId: 'years',
  min: 30,
  max: 74,
  placeholder: '55',
};

const sexField: SelectFieldDef = {
  id: 'sex',
  label: 'Sexo biológico',
  type: 'select',
  defaultValue: 'male',
  options: [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Femenino' },
  ],
};

const totalCholField: NumberFieldDef = {
  id: 'totalChol',
  label: 'Colesterol total',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: CHOLESTEROL_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 80,
  max: 500,
  placeholder: '210',
};

const hdlCholField: NumberFieldDef = {
  id: 'hdlChol',
  label: 'Colesterol HDL',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: CHOLESTEROL_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 10,
  max: 150,
  placeholder: '45',
};

const sbpField: NumberFieldDef = {
  id: 'sbp',
  label: 'Presión arterial sistólica (PAS)',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  min: 80,
  max: 250,
  placeholder: '132',
};

const treatedBpField: BooleanFieldDef = {
  id: 'treatedBp',
  label: '¿En tratamiento antihipertensivo actual?',
  type: 'boolean',
  trueLabel: 'Sí (tratada)',
  falseLabel: 'No (no tratada)',
  defaultValue: false,
};

const smokerField: BooleanFieldDef = {
  id: 'smoker',
  label: 'Tabaquismo actual',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
};

const diabetesField: BooleanFieldDef = {
  id: 'diabetes',
  label: 'Diabetes mellitus',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
};

export const framinghamCvdCalculator: CalculatorDefinition = {
  id: 'framingham-cvd',
  name: 'Riesgo Cardiovascular a 10 Años (Framingham General CVD 2008)',
  shortName: 'Framingham CVD',
  primarySpecialty: 'cardiologia',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'gravedad',
  keywords: [
    'framingham',
    'riesgo cardiovascular',
    'rcv',
    'colesterol',
    'prevencion primaria',
    'dagostino',
  ],
  description:
    'Estima el riesgo absoluto a 10 años de un primer evento cardiovascular mayor (coronario, ictus, enfermedad arterial periférica o insuficiencia cardíaca).',
  clinicalIndication:
    'Prevención primaria en adultos de 30 a 74 años sin enfermedad cardiovascular aterosclerótica establecida.',
  validatedPopulation: 'Adultos de 30–74 años sin evento cardiovascular previo (cohorte Framingham Heart Study).',
  requiredLabsNote: 'Requiere colesterol total y colesterol HDL séricos recientes.',
  contraindications: [
    'No utilizar en prevención secundaria (antecedente de IAM, ictus, revascularización o EAP ya implican riesgo muy alto directamente).',
    'No utilizar en hipercolesterolemia familiar o fuera del rango de 30–74 años.',
  ],
  limitations: [
    'Controversia de calibración: derivado en población estadounidense; puede sobrestimar el riesgo absoluto en ciertas poblaciones europeas o latinoamericanas, por lo que guías locales pueden preferir tablas OMS/OPS HEARTS, SCORE2 o ecuaciones nacionales recalibradas.',
    'No incluye historia familiar prematura, enfermedad renal crónica, lipoproteína(a) ni calcio coronario.',
  ],
  version: "D'Agostino et al. (Circulation 2008, modelo lipídico)",
  references: [
    {
      citation:
        "D'Agostino RB Sr, Vasan RS, Pencina MJ, et al. General cardiovascular risk profile for use in primary care: the Framingham Heart Study. Circulation. 2008;117(6):743-753.",
      year: 2008,
    },
  ],
  fields: [
    ageField,
    sexField,
    totalCholField,
    hdlCholField,
    sbpField,
    treatedBpField,
    smokerField,
    diabetesField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(framinghamCvdCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const age = getCanonicalNumberValue(ageField, inputs.age as NumberInputValue).canonicalValue!;
    const tc = getCanonicalNumberValue(totalCholField, inputs.totalChol as NumberInputValue)
      .canonicalValue!;
    const hdl = getCanonicalNumberValue(hdlCholField, inputs.hdlChol as NumberInputValue)
      .canonicalValue!;
    const sbp = getCanonicalNumberValue(sbpField, inputs.sbp as NumberInputValue).canonicalValue!;
    const isFemale = inputs.sex === 'female';
    const treated = inputs.treatedBp === true;
    const smoker = inputs.smoker === true ? 1 : 0;
    const diabetes = inputs.diabetes === true ? 1 : 0;

    let sum = 0;
    let s0 = 0.88936;
    let meanSum = 23.9802;

    if (!isFemale) {
      s0 = 0.88936;
      meanSum = 23.9802;
      sum =
        3.06117 * Math.log(age) +
        1.1237 * Math.log(tc) +
        -0.93263 * Math.log(hdl) +
        (treated ? 1.99881 : 1.93303) * Math.log(sbp) +
        0.65451 * smoker +
        0.57367 * diabetes;
    } else {
      s0 = 0.95012;
      meanSum = 26.1931;
      sum =
        2.32888 * Math.log(age) +
        1.20904 * Math.log(tc) +
        -0.70833 * Math.log(hdl) +
        (treated ? 2.82263 : 2.76157) * Math.log(sbp) +
        0.52873 * smoker +
        0.69154 * diabetes;
    }

    const rawRiskPct = (1 - Math.pow(s0, Math.exp(sum - meanSum))) * 100;
    const riskPct = roundClinical(Math.min(99.9, Math.max(0.1, rawRiskPct)), 1);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (riskPct < 10) {
      severity = 'normal';
      riskClassification = `Riesgo bajo (< 10 % a 10 años)`;
      clinicalInterpretation =
        'Riesgo cardiovascular general estimado bajo en el modelo Framingham 2008. Enfatizar hábitos de vida saludables.';
    } else if (riskPct < 20) {
      severity = 'moderate';
      riskClassification = `Riesgo intermedio (10 – 19.9 % a 10 años)`;
      clinicalInterpretation =
        'Riesgo moderado; evaluar potenciadores de riesgo, perfil lipídico objetivo y necesidad de estatinas/control tensional según guía clínica.';
    } else {
      severity = 'high';
      riskClassification = `Riesgo alto (≥ 20 % a 10 años)`;
      clinicalInterpretation =
        'Riesgo cardiovascular general elevado a 10 años. Requiere intervención intensiva multifactorial sobre lípidos, presión arterial, glucemia y tabaquismo.';
    }

    return {
      primaryResult: {
        label: 'Riesgo cardiovascular general a 10 años',
        value: riskPct,
        formattedValue: formatClinicalNumber(riskPct, 1),
        unit: '%',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: [
        'Si tu región emplea tablas calibradas OMS/OPS HEARTS o SCORE2, contrastar este resultado antes de iniciar farmacoterapia preventiva.',
      ],
      guidanceDisclaimer: 'Aplicable solo en prevención primaria (30–74 años).',
      formulaUsed: "1 - S₀(10)^exp(Σβ·X - MeanSum) [D'Agostino 2008]",
      inputsSummary: `${isFemale ? 'Mujer' : 'Hombre'} ${age} años · CT ${roundClinical(tc, 0)} mg/dL · HDL ${roundClinical(hdl, 0)} mg/dL · PAS ${sbp} mmHg`,
    };
  },
};
