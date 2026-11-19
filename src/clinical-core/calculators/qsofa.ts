import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
} from '../types/clinical.ts';

const fields: BooleanFieldDef[] = [
  {
    id: 'rr22',
    label: 'Frecuencia respiratoria ≥ 22 rpm (+1)',
    type: 'boolean',
    defaultValue: false,
  },
  {
    id: 'alteredMental',
    label: 'Alteración del estado mental (Glasgow < 15) (+1)',
    type: 'boolean',
    defaultValue: false,
  },
  {
    id: 'sbp100',
    label: 'Presión arterial sistólica ≤ 100 mmHg (+1)',
    type: 'boolean',
    defaultValue: false,
  },
];

export const qsofaCalculator: CalculatorDefinition = {
  id: 'qsofa',
  name: 'qSOFA (Quick Sequential Organ Failure Assessment)',
  shortName: 'qSOFA',
  primarySpecialty: 'urgencias',
  secondarySpecialties: ['medicina-interna', 'infectologia'],
  subcategory: 'gravedad',
  keywords: ['qsofa', 'sepsis', 'sepsis-3', 'infeccion', 'urgencias', 'mortalidad'],
  description:
    'Puntuación rápida a pie de cama (3 variables clínicas) que identifica riesgo aumentado de mala evolución en pacientes con sospecha de infección.',
  clinicalIndication:
    'Valoración pronóstica rápida fuera de UCI en pacientes con infección sospechada o confirmada.',
  validatedPopulation: 'Adultos con sospecha de infección fuera de UCI (Sepsis-3).',
  contraindications: [
    'NO utilizar qSOFA como herramienta única de cribado para descartar sepsis.',
  ],
  limitations: [
    'Advertencia de guías vigentes: La Surviving Sepsis Campaign (2021) recomienda en contra de usar qSOFA frente a SIRS, NEWS/NEWS2 o MEWS como prueba ÚNICA de tamizaje de sepsis por su baja sensibilidad temprana.',
    'Un qSOFA < 2 no descarta sepsis ni necesidad de antibióticos/reanimación si existen otros datos de disfunción orgánica o hipoperfusión.',
  ],
  version: 'Sepsis-3 (Singer et al. 2016) + SSC 2021',
  references: [
    {
      citation:
        'Singer M, Deutschman CS, Seymour CW, et al. The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3). JAMA. 2016;315(8):801-810.',
      year: 2016,
    },
    {
      citation:
        'Evans L, Rhodes A, Alhazzani W, et al. Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2021. Intensive Care Med. 2021;47:1181-1247.',
      year: 2021,
    },
  ],
  fields,
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(qsofaCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    let score = 0;
    for (const f of fields) {
      if (inputs[f.id] === true) score += 1;
    }

    if (score >= 2) {
      return {
        primaryResult: {
          label: 'Puntuación qSOFA',
          value: score,
          formattedValue: String(score),
          unit: 'puntos (de 3)',
        },
        severity: 'critical',
        riskClassification: `qSOFA Positivo (${score} / 3 puntos) — Alto riesgo`,
        clinicalInterpretation:
          'Riesgo significativamente aumentado de mortalidad hospitalaria y estancia prolongada en UCI en pacientes con sospecha de infección.',
        guidance: [
          'Evaluar disfunción orgánica formal mediante escala SOFA, medir lactato sérico, hemocultivos e iniciar manejo integral temprano de sepsis según protocolo institucional.',
        ],
        formulaUsed: 'Suma de 3 criterios clínicos: FR ≥ 22 + GCS < 15 + PAS ≤ 100',
        inputsSummary: `qSOFA: ${score} / 3 puntos`,
      };
    }

    return {
      primaryResult: {
        label: 'Puntuación qSOFA',
        value: score,
        formattedValue: String(score),
        unit: 'puntos (de 3)',
      },
      severity: score === 1 ? 'moderate' : 'low',
      riskClassification: `qSOFA < 2 (${score} / 3 puntos) — No descarta sepsis`,
      clinicalInterpretation:
        'Puntuación inferior al umbral ≥ 2; sin embargo, por su sensibilidad limitada no excluye sepsis ni disfunción orgánica incipiente.',
      guidance: [
        'Complementar con NEWS2, SIRS, lactato y búsqueda dirigida de disfunción orgánica (SOFA) si persiste sospecha clínica de infección.',
      ],
      formulaUsed: 'Suma de 3 criterios clínicos: FR ≥ 22 + GCS < 15 + PAS ≤ 100',
      inputsSummary: `qSOFA: ${score} / 3 puntos`,
    };
  },
};
