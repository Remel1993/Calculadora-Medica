import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const HAMA_OPTIONS = [
  { value: '0', label: '0 — Ausente', points: 0 },
  { value: '1', label: '1 — Leve', points: 1 },
  { value: '2', label: '2 — Moderado', points: 2 },
  { value: '3', label: '3 — Grave', points: 3 },
  { value: '4', label: '4 — Muy grave / Incapacitante', points: 4 },
];

function makeHamaField(id: string, label: string, helpText: string): SelectFieldDef {
  return {
    id,
    label,
    helpText,
    type: 'select',
    defaultValue: '0',
    options: HAMA_OPTIONS,
  };
}

const f1 = makeHamaField(
  'anxiousMood',
  '1. Estado de ánimo ansioso',
  'Preocupaciones, anticipación de lo peor, aprensión temerosa e irritabilidad.',
);
const f2 = makeHamaField(
  'tension',
  '2. Tensión',
  'Sensación de tensión, fatigabilidad, sobresalto fácil, llanto fácil, temblor o inquietud.',
);
const f3 = makeHamaField(
  'fears',
  '3. Temores',
  'Miedo a la oscuridad, desconocidos, quedarse solo, animales, tráfico o multitudes.',
);
const f4 = makeHamaField(
  'insomnia',
  '4. Insomnio',
  'Dificultad para conciliar el sueño, sueño interrumpido, despertar cansado o pesadillas.',
);
const f5 = makeHamaField(
  'intellectual',
  '5. Intelectual (cognitivo)',
  'Dificultad de concentración o fallos de memoria.',
);
const f6 = makeHamaField(
  'depressedMood',
  '6. Estado de ánimo deprimido',
  'Pérdida de interés, falta de disfrute en pasatiempos, tristeza o despertar precoz.',
);
const f7 = makeHamaField(
  'somaticMuscular',
  '7. Síntomas somáticos (musculares)',
  'Dolores musculares, rigidez, sacudidas mioclónicas, bruxismo o voz vacilante.',
);
const f8 = makeHamaField(
  'somaticSensory',
  '8. Síntomas somáticos (sensoriales)',
  'Acúfenos, visión borrosa, sofocos o escalofríos, sensación de debilidad u hormigueos.',
);
const f9 = makeHamaField(
  'cardiovascular',
  '9. Síntomas cardiovasculares',
  'Taquicardia, palpitaciones, dolor precordial o sensación de desmayo.',
);
const f10 = makeHamaField(
  'respiratory',
  '10. Síntomas respiratorios',
  'Opresión torácica, sensación de ahogo, suspiros o disnea.',
);
const f11 = makeHamaField(
  'gastrointestinal',
  '11. Síntomas gastrointestinales',
  'Disfagia, meteorismo, dispepsia, náuseas, pirosis o cambios del hábito intestinal.',
);
const f12 = makeHamaField(
  'genitourinary',
  '12. Síntomas genitourinarios',
  'Polaquiuria, urgencia miccional, amenorrea o disfunción sexual.',
);
const f13 = makeHamaField(
  'autonomic',
  '13. Síntomas autonómicos',
  'Boca seca, rubor, palidez, tendencia a sudar, vértigo o cefalea tensional.',
);
const f14 = makeHamaField(
  'behavior',
  '14. Comportamiento durante la entrevista',
  'Inquietud, temblor de manos, ceño fruncido, fascies tensa, suspiros o taquipnea.',
);

export const hamiltonAnxietyCalculator: CalculatorDefinition = {
  id: 'hamilton-anxiety',
  name: 'Escala de Ansiedad de Hamilton (HAM-A)',
  shortName: 'Hamilton (HAM-A)',
  primarySpecialty: 'psiquiatria',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'gravedad',
  keywords: [
    'hamilton',
    'ham-a',
    'hama',
    'ansiedad',
    'tag',
    'salud mental',
    'psiquiatria',
    'somatico',
  ],
  description:
    'Escala heteroadministrada clásica de 14 ítems (0–56 puntos) para cuantificar la gravedad de la ansiedad psíquica y somática.',
  clinicalIndication:
    'Cuantificación de gravedad sintomática y seguimiento de respuesta terapéutica en trastornos de ansiedad en consulta externa.',
  validatedPopulation: 'Adultos evaluados por clínica de ansiedad (escala diseñada para aplicación por el clínico).',
  contraindications: [
    'No constituye por sí sola un diagnóstico psiquiátrico ni sustituye descartar causas médicas de síntomas somáticos (hipertiroidismo, arritmias, feocromocitoma, abstinencia).',
  ],
  limitations: [
    'Evalúa gravedad, no realiza diagnóstico diferencial entre trastorno de ansiedad generalizada, pánico o depresión ansiosa.',
    'La puntuación puede elevarse en enfermedades médicas agudas por el peso de los 7 ítems somáticos.',
    'En la literatura existen dos cortes de referencia: clásico de Hamilton (≤ 17 leve, 18–24 leve-moderada, 25–30 moderada-grave, > 30 grave) y Matza 2010 (≤ 7 remisión/normal, 8–14 leve, 15–23 moderada, ≥ 24 grave).',
  ],
  version: 'Hamilton M (1959) / Matza (2010)',
  references: [
    {
      citation:
        'Hamilton M. The assessment of anxiety states by rating. Br J Med Psychol. 1959;32(1):50-55.',
      year: 1959,
    },
    {
      citation:
        'Matza LS, Morlock R, Sexton C, Malley K, Feltner D. Identifying HAM-A cutoffs for mild, moderate, and severe generalized anxiety disorder. Int J Methods Psychiatr Res. 2010;19(4):223-232.',
      year: 2010,
    },
  ],
  fields: [f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12, f13, f14],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(hamiltonAnxietyCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const v1 = Number(inputs.anxiousMood);
    const v2 = Number(inputs.tension);
    const v3 = Number(inputs.fears);
    const v4 = Number(inputs.insomnia);
    const v5 = Number(inputs.intellectual);
    const v6 = Number(inputs.depressedMood);
    const v7 = Number(inputs.somaticMuscular);
    const v8 = Number(inputs.somaticSensory);
    const v9 = Number(inputs.cardiovascular);
    const v10 = Number(inputs.respiratory);
    const v11 = Number(inputs.gastrointestinal);
    const v12 = Number(inputs.genitourinary);
    const v13 = Number(inputs.autonomic);
    const v14 = Number(inputs.behavior);

    const psychic = v1 + v2 + v3 + v4 + v5 + v6 + v14;
    const somatic = v7 + v8 + v9 + v10 + v11 + v12 + v13;
    const total = psychic + somatic;

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (total <= 7) {
      severity = 'normal';
      riskClassification = `Sin ansiedad clínica / Remisión (${total} / 56 puntos)`;
      clinicalInterpretation =
        'Puntuación dentro de rango normal o de remisión sintomática según puntos de corte de Matza et al.';
    } else if (total <= 17) {
      severity = 'low';
      riskClassification = `Ansiedad leve (${total} / 56 puntos)`;
      clinicalInterpretation =
        'Sintomatología ansiosa leve (rango clásico ≤ 17; nótese que Matza 2010 ubica 15–17 en rango moderado inicial).';
      guidance = [
        'Descartar desencadenantes médicos o farmacológicos (cafeína, simpaticomiméticos, tiroides) y considerar psicoeducación / intervención psicoterapéutica.',
      ];
    } else if (total <= 24) {
      severity = 'moderate';
      riskClassification = `Ansiedad leve a moderada (${total} / 56 puntos)`;
      clinicalInterpretation =
        'Gravedad moderada con afectación clínica apreciable en esfera psíquica y/o somática.';
      guidance = [
        'Evaluar diagnóstico específico (TAG, trastorno de pánico), tamizar depresión (p. ej. riesgo suicida si ítem 6 elevado) y valorar manejo psicoterapéutico y/o farmacológico.',
      ];
    } else if (total <= 30) {
      severity = 'high';
      riskClassification = `Ansiedad moderada a grave (${total} / 56 puntos)`;
      clinicalInterpretation =
        'Carga ansiosa elevada con probable deterioro funcional significativo en la vida cotidiana.';
      guidance = [
        'Abordaje clínico estructurado, descartar patología orgánica concomitante y valorar interconsulta o seguimiento estrecho.',
      ];
    } else {
      severity = 'critical';
      riskClassification = `Ansiedad grave (${total} / 56 puntos)`;
      clinicalInterpretation =
        'Sintomatología ansiosa muy grave e incapacitante; requiere atención clínica prioritaria.';
      guidance = [
        'Evaluar seguridad del paciente, comorbilidad depresiva y necesidad de valoración especializada prioritaria.',
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación HAM-A total',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 56)',
      },
      secondaryResults: [
        {
          label: 'Subescala de ansiedad psíquica (ítems 1–6, 14)',
          formattedValue: `${psychic} / 28`,
          unit: 'pts',
        },
        {
          label: 'Subescala de ansiedad somática (ítems 7–13)',
          formattedValue: `${somatic} / 28`,
          unit: 'pts',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: guidance.length > 0 ? guidance : undefined,
      guidanceDisclaimer:
        'Instrumento cuantitativo de apoyo; nunca sustituye la entrevista clínica ni la exclusión de causas orgánicas.',
      formulaUsed: 'Suma de 14 ítems (0 – 4 pts c/u) = Psíquica + Somática',
      inputsSummary: `Psíquica:${psychic} Somática:${somatic} (Total: ${total}/56)`,
    };
  },
};
