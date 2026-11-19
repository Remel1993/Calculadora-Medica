import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const ageField: BooleanFieldDef = {
  id: 'age60',
  label: 'A — Edad ≥ 60 años (+1)',
  type: 'boolean',
  defaultValue: false,
};

const bpField: BooleanFieldDef = {
  id: 'bpHigh',
  label: 'B — Presión arterial ≥ 140/90 mmHg en la evaluación inicial (PAS ≥ 140 o PAD ≥ 90) (+1)',
  type: 'boolean',
  defaultValue: false,
};

const clinicalField: SelectFieldDef = {
  id: 'clinicalFeatures',
  label: 'C — Características clínicas del AIT',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '2', label: 'Debilidad focal unilateral (+2)', points: 2 },
    { value: '1', label: 'Alteración del habla sin debilidad (+1)', points: 1 },
    { value: '0', label: 'Otros síntomas aislados (+0)', points: 0 },
  ],
};

const durationField: SelectFieldDef = {
  id: 'duration',
  label: 'D — Duración de los síntomas',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '2', label: '≥ 60 minutos (+2)', points: 2 },
    { value: '1', label: '10 – 59 minutos (+1)', points: 1 },
    { value: '0', label: '< 10 minutos (+0)', points: 0 },
  ],
};

const diabetesField: BooleanFieldDef = {
  id: 'diabetes',
  label: 'D — Diabetes mellitus (+1)',
  type: 'boolean',
  defaultValue: false,
};

export const abcd2Calculator: CalculatorDefinition = {
  id: 'abcd2',
  name: 'ABCD² Score (Riesgo de Ictus tras AIT)',
  shortName: 'ABCD²',
  primarySpecialty: 'neurologia',
  secondarySpecialties: ['urgencias', 'medicina-interna'],
  subcategory: 'gravedad',
  keywords: ['abcd2', 'ait', 'isquemia transitoria', 'ictus', 'tia', 'riesgo'],
  description:
    'Estratificación del riesgo precoz de ictus isquémico a 2, 7 y 90 días tras un ataque isquémico transitorio (AIT).',
  clinicalIndication:
    'Valoración pronóstica inicial de pacientes con sospecha de AIT para priorizar estudio neurovascular e ingreso/clínica rápida de AIT.',
  validatedPopulation: 'Adultos con diagnóstico clínico de ataque isquémico transitorio.',
  contraindications: [
    'NO utilizar para descartar estudio neurovascular urgente en pacientes con ABCD² bajo (0–3).',
  ],
  limitations: [
    'Advertencia clínica fundamental (guías AHA/ASA y ESO): hasta el 20 % de los pacientes con estenosis carotídea crítica sintomática o fuente cardioembólica (FA) presentan puntuaciones ABCD² < 4.',
    'La evaluación mediante neuroimagen (RM difusión), Doppler/angio-TC carotídeo y ECG no debe omitirse por un puntaje bajo.',
  ],
  version: 'Johnston SC et al. (Lancet 2007)',
  references: [
    {
      citation: 'Johnston SC, Rothwell PM, Nguyen-Huynh MN, et al. Validation and refinement of scores to predict very early stroke risk after transient ischaemic attack. Lancet. 2007;369(9558):283-292.',
      year: 2007,
    },
  ],
  fields: [ageField, bpField, clinicalField, durationField, diabetesField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(abcd2Calculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const score =
      (inputs.age60 === true ? 1 : 0) +
      (inputs.bpHigh === true ? 1 : 0) +
      Number(inputs.clinicalFeatures) +
      Number(inputs.duration) +
      (inputs.diabetes === true ? 1 : 0);

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let risk2d = '1.0 %';
    let risk7d = '1.2 %';
    let risk90d = '3.1 %';
    let guidance: string[] = [];

    if (score <= 3) {
      severity = 'low';
      riskClassification = `Riesgo bajo (${score} / 7 puntos)`;
      guidance = [
        'Aunque el riesgo estadístico es menor, realizar estudio neurovascular (imagen cerebral + vasos supraaórticos) y ECG de forma prioritaria (< 24–48 h).',
      ];
    } else if (score <= 5) {
      severity = 'moderate';
      riskClassification = `Riesgo moderado (${score} / 7 puntos)`;
      risk2d = '4.1 %';
      risk7d = '5.9 %';
      risk90d = '9.8 %';
      guidance = [
        'Recomendada evaluación hospitalaria u observación rápida con estudio vascular e inicio temprano de prevención secundaria tras descartar hemorragia.',
      ];
    } else {
      severity = 'critical';
      riskClassification = `Riesgo alto (${score} / 7 puntos)`;
      risk2d = '8.1 %';
      risk7d = '11.7 %';
      risk90d = '17.8 %';
      guidance = [
        'Ingreso hospitalario / unidad de ictus recomendado para neuroimagen urgente, estudio carotídeo-cardíaco inmediato y antiagregación/manejo dirigido.',
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación ABCD²',
        value: score,
        formattedValue: String(score),
        unit: 'puntos (de 7)',
      },
      secondaryResults: [
        { label: 'Riesgo de ictus a 2 días', formattedValue: risk2d, unit: '' },
        { label: 'Riesgo de ictus a 7 días', formattedValue: risk7d, unit: '' },
        { label: 'Riesgo de ictus a 90 días', formattedValue: risk90d, unit: '' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation: `Riesgo estimado de ictus tras AIT de ${risk2d} a 48 horas y ${risk90d} a 90 días en la cohorte combinada de Johnston.`,
      guidance,
      guidanceDisclaimer: 'Un puntaje bajo no excluye estenosis carotídea crítica ni fibrilación auricular.',
      formulaUsed: 'Edad≥60 (1) + PA≥140/90 (1) + Clínica (0/1/2) + Duración (0/1/2) + Diabetes (1)',
      inputsSummary: `ABCD² total: ${score} / 7 puntos`,
    };
  },
};
