import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const PHQ9_OPTIONS = [
  { value: '0', label: '0 — Nunca', points: 0 },
  { value: '1', label: '1 — Varios días', points: 1 },
  { value: '2', label: '2 — Más de la mitad de los días', points: 2 },
  { value: '3', label: '3 — Casi todos los días', points: 3 },
];

function makePhqField(id: string, label: string): SelectFieldDef {
  return {
    id,
    label,
    type: 'select',
    defaultValue: '0',
    options: PHQ9_OPTIONS,
  };
}

const f1 = makePhqField('q1', '1. Poco interés o placer en hacer las cosas (últimas 2 semanas)');
const f2 = makePhqField('q2', '2. Se ha sentido decaído(a), deprimido(a) o sin esperanzas');
const f3 = makePhqField('q3', '3. Dificultad para quedarse o permanecer dormido(a), o dormir demasiado');
const f4 = makePhqField('q4', '4. Se ha sentido cansado(a) o con poca energía');
const f5 = makePhqField('q5', '5. Sin apetito o ha comido en exceso');
const f6 = makePhqField(
  'q6',
  '6. Se ha sentido mal con usted mismo(a), o que es un fracaso o ha quedado mal consigo/su familia',
);
const f7 = makePhqField(
  'q7',
  '7. Dificultad para concentrarse en cosas (leer, ver televisión)',
);
const f8 = makePhqField(
  'q8',
  '8. Se ha movido o hablado tan lento que otras personas lo notaron, o lo contrario (inquietud)',
);
const f9 = makePhqField(
  'q9',
  '9. Pensamientos de que estaría mejor muerto(a) o de lastimarse de alguna manera',
);

export const phq9Calculator: CalculatorDefinition = {
  id: 'phq-9',
  name: 'Cuestionario PHQ-9 (Depresión — Tamizaje y Gravedad)',
  shortName: 'PHQ-9',
  primarySpecialty: 'psiquiatria',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'diagnostico',
  keywords: ['phq-9', 'phq9', 'depresion', 'salud mental', 'tamizaje', 'suicidio', 'kroenke'],
  description:
    'Instrumento validado de 9 ítems (0–27 puntos) para cribado, estratificación de gravedad y seguimiento de síntomas depresivos en las últimas 2 semanas.',
  clinicalIndication:
    'Tamizaje y seguimiento longitudinal de episodio depresivo en atención primaria, medicina interna y consulta externa.',
  validatedPopulation: 'Adultos y adolescentes ≥ 12 años en atención primaria y consulta externa.',
  contraindications: [
    'No establece por sí solo diagnóstico de trastorno depresivo mayor; descartar trastorno bipolar, duelo agudo, hipotiroidismo o efectos farmacológicos.',
  ],
  limitations: [
    'Cualquier puntuación ≥ 1 en el ítem 9 requiere evaluación inmediata de riesgo suicida, independientemente del puntaje total.',
    'Un punto de corte ≥ 10 tiene sensibilidad y especificidad ~88 % para episodio depresivo mayor (Kroenke et al.).',
  ],
  version: 'Kroenke et al. (2001)',
  references: [
    {
      citation:
        'Kroenke K, Spitzer RL, Williams JB. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med. 2001;16(9):606-613.',
      year: 2001,
    },
  ],
  fields: [f1, f2, f3, f4, f5, f6, f7, f8, f9],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(phq9Calculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const vals = [
      Number(inputs.q1),
      Number(inputs.q2),
      Number(inputs.q3),
      Number(inputs.q4),
      Number(inputs.q5),
      Number(inputs.q6),
      Number(inputs.q7),
      Number(inputs.q8),
      Number(inputs.q9),
    ];
    const total = vals.reduce((a, b) => a + b, 0);
    const suicideItem = vals[8];

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (total <= 4) {
      severity = 'normal';
      riskClassification = `Depresión mínima / Sin síntomas (${total} / 27 puntos)`;
      clinicalInterpretation = 'Sin evidencia de episodio depresivo clínicamente significativo.';
    } else if (total <= 9) {
      severity = 'low';
      riskClassification = `Depresión leve (${total} / 27 puntos)`;
      clinicalInterpretation = 'Síntomas depresivos leves; vigilar evolución clínica.';
      guidance = [
        'Conducta expectante activa, psicoeducación, higiene del sueño y repetir PHQ-9 en 2–4 semanas.',
      ];
    } else if (total <= 14) {
      severity = 'moderate';
      riskClassification = `Depresión moderada (${total} / 27 puntos)`;
      clinicalInterpretation = 'Supera el umbral diagnóstico clínico (≥ 10 puntos).';
      guidance = [
        'Considerar psicoterapia estructurada y/o tratamiento antidepresivo según contexto y preferencia del paciente.',
      ];
    } else if (total <= 19) {
      severity = 'high';
      riskClassification = `Depresión moderadamente grave (${total} / 27 puntos)`;
      clinicalInterpretation = 'Carga sintomática importante con impacto funcional probable.';
      guidance = [
        'Se recomienda iniciar manejo activo (farmacoterapia y/o psicoterapia) con seguimiento estrecho.',
      ];
    } else {
      severity = 'critical';
      riskClassification = `Depresión grave (${total} / 27 puntos)`;
      clinicalInterpretation = 'Sintomatología depresiva grave que requiere intervención clínica prioritaria.';
      guidance = [
        'Iniciar farmacoterapia combinada con psicoterapia y valorar derivación prioritaria a salud mental / psiquiatría.',
      ];
    }

    if (suicideItem >= 1) {
      if (severity === 'normal' || severity === 'low') {
        severity = 'high';
      }
      guidance = [
        'ALERTA ÍTEM 9 POSITIVO: Evaluar de inmediato ideación, plan, intención, medios letales y red de apoyo (puede apoyarse en SAD PERSONS).',
        ...guidance,
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación PHQ-9',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 27)',
      },
      secondaryResults: [
        {
          label: 'Ítem 9 (ideación de muerte/autolesión)',
          formattedValue: suicideItem > 0 ? `Positivo (${suicideItem}/3)` : 'Negativo (0/3)',
          unit: '',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: guidance.length > 0 ? guidance : undefined,
      guidanceDisclaimer: 'Confirmar diagnóstico mediante entrevista clínica criterios DSM-5/CIE-11.',
      formulaUsed: 'Suma de 9 ítems (0 – 3 pts c/u; rango 0 – 27)',
      inputsSummary: `PHQ-9: ${vals.join('+')} = ${total}/27 (Ítem 9: ${suicideItem})`,
    };
  },
};
