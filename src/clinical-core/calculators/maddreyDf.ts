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
import { BILIRUBIN_UNITS_MG_DL } from '../units/converters.ts';

const ptPatientField: NumberFieldDef = {
  id: 'ptPatient',
  label: 'Tiempo de protrombina (TP) del paciente',
  type: 'number',
  canonicalUnit: 'seg',
  units: [{ id: 'sec', label: 'segundos', toCanonical: (v) => v, min: 8, max: 120, step: 0.1 }],
  defaultUnitId: 'sec',
  min: 8,
  max: 120,
  placeholder: '20.5',
  helpText: 'Usar TP en segundos (NO sustituir por INR).',
};

const ptControlField: NumberFieldDef = {
  id: 'ptControl',
  label: 'Tiempo de protrombina (TP) control del laboratorio',
  type: 'number',
  canonicalUnit: 'seg',
  units: [{ id: 'sec', label: 'segundos', toCanonical: (v) => v, min: 8, max: 20, step: 0.1 }],
  defaultUnitId: 'sec',
  defaultValue: '12.0',
  min: 8,
  max: 20,
  placeholder: '12.0',
};

const bilirubinField: NumberFieldDef = {
  id: 'bilirubin',
  label: 'Bilirrubina total',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: BILIRUBIN_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 0.1,
  max: 50,
  placeholder: '8.5',
};

export const maddreyDfCalculator: CalculatorDefinition = {
  id: 'maddrey-df',
  name: 'Función Discriminante de Maddrey (Hepatitis Alcohólica)',
  shortName: 'Maddrey (DF)',
  primarySpecialty: 'gastroenterologia',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'gravedad',
  keywords: ['maddrey', 'hepatitis alcoholica', 'funcion discriminante', 'corticoides', 'prednisolona', 'bilirrubina'],
  description:
    'Evalúa la gravedad de la hepatitis alcohólica aguda a partir de la prolongación del tiempo de protrombina (segundos) y la bilirrubina sérica total.',
  clinicalIndication:
    'Estratificación de mortalidad temprana en hepatitis alcohólica aguda para valorar elegibilidad de corticoterapia sistémica.',
  validatedPopulation: 'Adultos con diagnóstico clínico/histológico de hepatitis asociada al alcohol.',
  requiredLabsNote: 'Requiere tiempo de protrombina en segundos (del paciente y control) y bilirrubina total.',
  contraindications: [
    'No utilizar en otras causas de ictericia aguda no alcohólica.',
    'No introducir el INR en lugar del TP en segundos.',
  ],
  limitations: [
    'La variabilidad entre reactivos de TP de distintos laboratorios puede afectar el resultado; algunas guías complementan con MELD (≥ 20–21) o GAHS.',
    'Si se inicia prednisolona en DF ≥ 32, evaluar respuesta al día 7 mediante el modelo de Lille.',
  ],
  version: 'Maddrey modificado (1989) / EASL-AASLD',
  references: [
    {
      citation:
        'Maddrey WC, Boitnott JK, Bedine MS, Weber FL Jr, Mezey E, White RI Jr. Corticosteroid therapy of alcoholic hepatitis. Gastroenterology. 1978;75(2):193-199.',
      year: 1978,
    },
    {
      citation:
        'Crabb DW, Im GY, Szabo G, Mellinger JL, Lucey MR. Diagnosis and Treatment of Alcohol-Associated Liver Diseases: 2019 Practice Guidance from the AASLD. Hepatology. 2020;71(1):306-333.',
      year: 2020,
    },
  ],
  fields: [ptPatientField, ptControlField, bilirubinField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(maddreyDfCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const ptPat = getCanonicalNumberValue(ptPatientField, inputs.ptPatient as NumberInputValue).canonicalValue!;
    const ptCtrl = getCanonicalNumberValue(ptControlField, inputs.ptControl as NumberInputValue).canonicalValue!;
    const bil = getCanonicalNumberValue(bilirubinField, inputs.bilirubin as NumberInputValue).canonicalValue!;

    const ptDiff = ptPat - ptCtrl;
    const df = roundClinical(4.6 * ptDiff + bil, 1);

    let severity: SeverityLevel = 'moderate';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (df < 32) {
      severity = 'moderate';
      riskClassification = `Hepatitis alcohólica no grave (DF = ${formatClinicalNumber(df, 1)} < 32)`;
      clinicalInterpretation =
        'Mortalidad a 28 días relativamente baja (< 10–15 %). Habitualmente no se beneficia de corticoides sistémicos.';
      guidance = [
        'Abstinencia alcohólica estricta, soporte nutricional intensivo y manejo médico de soporte.',
      ];
    } else {
      severity = df >= 60 ? 'critical' : 'high';
      riskClassification = `Hepatitis alcohólica grave (DF = ${formatClinicalNumber(df, 1)} ≥ 32)`;
      clinicalInterpretation =
        'Asociada a elevada mortalidad a corto plazo (30–50 % a 28 días sin tratamiento específico).';
      guidance = [
        'Evaluar inicio de prednisolona (habitualmente 40 mg/día) tras descartar infección activa no controlada, hemorragia digestiva alta o falla renal grave.',
        'Reevaluar respuesta terapéutica al día 7 (score de Lille).',
      ];
    }

    return {
      primaryResult: {
        label: 'Función Discriminante de Maddrey',
        value: df,
        formattedValue: formatClinicalNumber(df, 1),
        unit: 'puntos',
      },
      secondaryResults: [
        { label: 'Prolongación TP (paciente − control)', formattedValue: formatClinicalNumber(ptDiff, 1), unit: 'segundos' },
        { label: 'Umbral de gravedad', formattedValue: '≥ 32.0', unit: 'puntos' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'Descartar sepsis o sangrado digestivo activo antes de considerar corticoterapia.',
      formulaUsed: 'DF = 4.6 × (TP paciente − TP control [seg]) + Bilirrubina total [mg/dL]',
      inputsSummary: `TP paciente: ${ptPat} s · TP control: ${ptCtrl} s · Bilirrubina: ${formatClinicalNumber(bil, 2)} mg/dL`,
    };
  },
};
