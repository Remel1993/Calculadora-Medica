import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const historyField: SelectFieldDef = {
  id: 'history',
  label: 'H — Historia clínica (sospecha de dolor torácico coronario)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Ligeramente sospechosa', points: 0 },
    { value: '1', label: 'Moderadamente sospechosa', points: 1 },
    { value: '2', label: 'Altamente sospechosa', points: 2 },
  ],
};

const ecgField: SelectFieldDef = {
  id: 'ecg',
  label: 'E — Electrocardiograma (ECG)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Normal', points: 0 },
    {
      value: '1',
      label: 'Alteraciones inespecíficas de repolarización, BRI/BRD, marcapasos o HVI',
      points: 1,
    },
    { value: '2', label: 'Desviación significativa del segmento ST (depresión/elevación)', points: 2 },
  ],
};

const ageField: SelectFieldDef = {
  id: 'age',
  label: 'A — Edad',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '< 45 años', points: 0 },
    { value: '1', label: '45 – 64 años', points: 1 },
    { value: '2', label: '≥ 65 años', points: 2 },
  ],
};

const riskFactorsField: SelectFieldDef = {
  id: 'riskFactors',
  label: 'R — Factores de riesgo cardiovascular',
  helpText: 'HTA, hipercolesterolemia, diabetes, obesidad (IMC > 30), tabaquismo, historia familiar positiva (< 65 años).',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Sin factores de riesgo conocidos', points: 0 },
    { value: '1', label: '1 o 2 factores de riesgo', points: 1 },
    { value: '2', label: '≥ 3 factores de riesgo o enfermedad aterosclerótica previa', points: 2 },
  ],
};

const troponinField: SelectFieldDef = {
  id: 'troponin',
  label: 'T — Troponina inicial',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '≤ Límite superior normal (LSN)', points: 0 },
    { value: '1', label: '1 – 3 × LSN', points: 1 },
    { value: '2', label: '> 3 × LSN', points: 2 },
  ],
};

export const heartScoreCalculator: CalculatorDefinition = {
  id: 'heart-score',
  name: 'HEART Score (Dolor Torácico en Urgencias)',
  shortName: 'HEART Score',
  primarySpecialty: 'cardiologia',
  secondarySpecialties: ['urgencias'],
  subcategory: 'gravedad',
  keywords: ['heart', 'dolor toracico', 'sca', 'troponina', 'mace', 'urgencias', 'infarto'],
  description:
    'Estratificación del riesgo de eventos cardiovasculares mayores (MACE) a 6 semanas en pacientes con dolor torácico no traumático en urgencias.',
  clinicalIndication:
    'Evaluación inicial del dolor torácico indiferenciado en urgencias para decidir alta precoz con seguimiento vs. observación/ingreso.',
  validatedPopulation: 'Adultos ≥ 21 años que acuden a urgencias por dolor torácico sin elevación franca del ST.',
  requiredLabsNote: 'Requiere ECG de 12 derivaciones y determinación de troponina sérica (considerar troponina seriada a 0/1–3 h según ensayo).',
  contraindications: [
    'No utilizar en IAM con elevación del ST (IAMCEST) ni inestabilidad hemodinámica manifiesta (activar código infarto directo).',
  ],
  limitations: [
    'La valoración de la historia clínica ("sospecha") tiene componente subjetivo.',
    'Con troponina de alta sensibilidad (hs-cTn), un HEART ≤ 3 combinado con protocolo de troponina seriada negativa (HEART Pathway) reduce aún más el riesgo residual de MACE (< 1 %).',
  ],
  version: 'Six et al. (2008) / Backus et al. (2013)',
  references: [
    {
      citation:
        'Backus BE, Six AJ, Kelder JC, et al. A prospective validation of the HEART score for chest pain patients at the emergency department. Int J Cardiol. 2013;168(3):2153-2158.',
      year: 2013,
    },
  ],
  fields: [historyField, ecgField, ageField, riskFactorsField, troponinField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(heartScoreCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const score =
      Number(inputs.history) +
      Number(inputs.ecg) +
      Number(inputs.age) +
      Number(inputs.riskFactors) +
      Number(inputs.troponin);

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (score <= 3) {
      severity = 'low';
      riskClassification = `Riesgo bajo (${score} / 10 puntos)`;
      clinicalInterpretation =
        'Riesgo estimado de MACE a 6 semanas del 0.9 – 1.7 % en las cohortes de validación.';
      guidance = [
        'Candidato a valoración de alta precoz con seguimiento ambulatorio si la troponina seriada (0/1–3 h según protocolo local) es negativa y no existen diagnósticos alternativos graves (TEP, disección aórtica).',
      ];
    } else if (score <= 6) {
      severity = 'moderate';
      riskClassification = `Riesgo moderado (${score} / 10 puntos)`;
      clinicalInterpretation =
        'Riesgo estimado de MACE a 6 semanas del 12 – 16.6 %.';
      guidance = [
        'Recomendada observación hospitalaria, seriación de troponinas/ECG y estudio no invasivo (prueba de detección de isquemia o angio-TC coronario según perfil).',
      ];
    } else {
      severity = 'critical';
      riskClassification = `Riesgo alto (${score} / 10 puntos)`;
      clinicalInterpretation =
        'Riesgo elevado de MACE a 6 semanas (50 – 65 %).';
      guidance = [
        'Ingreso hospitalario y valoración cardiológica prioritaria para estrategia invasiva temprana (coronariografía).',
      ];
    }

    return {
      primaryResult: {
        label: 'HEART Score',
        value: score,
        formattedValue: String(score),
        unit: 'puntos (de 10)',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'Siempre descartar otras causas potencialmente mortales de dolor torácico (TEP, disección aórtica, neumotórax).',
      formulaUsed: 'Historia (0–2) + ECG (0–2) + Edad (0–2) + Factores de riesgo (0–2) + Troponina (0–2)',
      inputsSummary: `H:${inputs.history} E:${inputs.ecg} A:${inputs.age} R:${inputs.riskFactors} T:${inputs.troponin} (Total: ${score})`,
    };
  },
};
