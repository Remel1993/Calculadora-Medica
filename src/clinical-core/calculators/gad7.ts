import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const GAD7_OPTIONS = [
  { value: '0', label: '0 — Nunca', points: 0 },
  { value: '1', label: '1 — Varios días', points: 1 },
  { value: '2', label: '2 — Más de la mitad de los días', points: 2 },
  { value: '3', label: '3 — Casi todos los días', points: 3 },
];

function makeGadField(id: string, label: string): SelectFieldDef {
  return {
    id,
    label,
    type: 'select',
    defaultValue: '0',
    options: GAD7_OPTIONS,
  };
}

const g1 = makeGadField('g1', '1. Sentirse nervioso(a), ansioso(a) o con los nervios de punta (últimas 2 sem)');
const g2 = makeGadField('g2', '2. No poder dejar de preocuparse o no poder controlar la preocupación');
const g3 = makeGadField('g3', '3. Preocuparse demasiado por diferentes cosas');
const g4 = makeGadField('g4', '4. Dificultad para relajarse');
const g5 = makeGadField('g5', '5. Estar tan inquieto(a) que es difícil permanecer sentado(a)');
const g6 = makeGadField('g6', '6. Molestarse o ponerse irritable fácilmente');
const g7 = makeGadField('g7', '7. Sentir miedo como si algo terrible pudiera pasar');

export const gad7Calculator: CalculatorDefinition = {
  id: 'gad-7',
  name: 'Escala GAD-7 (Trastorno de Ansiedad Generalizada)',
  shortName: 'GAD-7',
  primarySpecialty: 'psiquiatria',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'diagnostico',
  keywords: ['gad-7', 'gad7', 'ansiedad', 'tag', 'salud mental', 'spitzer', 'cribado'],
  description:
    'Escala breve autoadministrable de 7 ítems (0–21 puntos) para cribado y cuantificación de gravedad del trastorno de ansiedad generalizada.',
  clinicalIndication:
    'Detección rápida de ansiedad en atención primaria y monitoreo de respuesta terapéutica.',
  validatedPopulation: 'Adultos ≥ 18 años en atención primaria (Spitzer et al., 2006).',
  contraindications: [
    'No diferencia entre trastornos de ansiedad específicos ni descarta patología orgánica (hipertiroidismo, arritmias, abstinencia).',
  ],
  limitations: [
    'Un punto de corte ≥ 10 posee sensibilidad ~89 % y especificidad ~82 % para TAG; también es útil para tamizar pánico, ansiedad social y TEPT.',
  ],
  version: 'Spitzer et al. (2006)',
  references: [
    {
      citation:
        'Spitzer RL, Kroenke K, Williams JB, Löwe B. A brief measure for assessing generalized anxiety disorder: the GAD-7. Arch Intern Med. 2006;166(10):1092-1097.',
      year: 2006,
    },
  ],
  fields: [g1, g2, g3, g4, g5, g6, g7],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(gad7Calculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const vals = [
      Number(inputs.g1),
      Number(inputs.g2),
      Number(inputs.g3),
      Number(inputs.g4),
      Number(inputs.g5),
      Number(inputs.g6),
      Number(inputs.g7),
    ];
    const total = vals.reduce((a, b) => a + b, 0);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (total <= 4) {
      severity = 'normal';
      riskClassification = `Ansiedad mínima (${total} / 21 puntos)`;
      clinicalInterpretation = 'Sin síntomas de ansiedad generalizada clínicamente relevantes.';
    } else if (total <= 9) {
      severity = 'low';
      riskClassification = `Ansiedad leve (${total} / 21 puntos)`;
      clinicalInterpretation = 'Ansiedad leve por debajo del punto de corte diagnóstico (10 pts).';
      guidance = ['Seguimiento en consulta, técnicas de manejo del estrés e higiene del sueño.'];
    } else if (total <= 14) {
      severity = 'moderate';
      riskClassification = `Ansiedad moderada (${total} / 21 puntos)`;
      clinicalInterpretation = 'Supera el umbral de cribado positivo (≥ 10 puntos).';
      guidance = [
        'Confirmar diagnóstico clínico, tamizar depresión asociada (PHQ-9) y valorar terapia cognitivo-conductual y/o farmacoterapia.',
      ];
    } else {
      severity = 'high';
      riskClassification = `Ansiedad grave (${total} / 21 puntos)`;
      clinicalInterpretation = 'Ansiedad grave con alta probabilidad de repercusión funcional diaria.';
      guidance = [
        'Indicar manejo activo (psicoterapia + farmacoterapia según guías) y descartar comorbilidad depresiva o riesgo autolesivo.',
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación GAD-7',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 21)',
      },
      secondaryResults: [
        {
          label: 'Umbral de cribado positivo (≥ 10 pts)',
          formattedValue: total >= 10 ? 'Positivo' : 'Negativo',
          unit: '',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: guidance.length > 0 ? guidance : undefined,
      formulaUsed: 'Suma de 7 ítems (0 – 3 pts c/u; rango 0 – 21)',
      inputsSummary: `GAD-7: ${vals.join('+')} = ${total}/21`,
    };
  },
};
