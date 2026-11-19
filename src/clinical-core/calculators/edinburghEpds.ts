import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const q1Field: SelectFieldDef = {
  id: 'q1',
  label: '1. He sido capaz de reír y ver el lado bueno de las cosas (últimos 7 días)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Tanto como siempre', points: 0 },
    { value: '1', label: '1 — No tanto ahora', points: 1 },
    { value: '2', label: '2 — Mucho menos ahora', points: 2 },
    { value: '3', label: '3 — No, nada', points: 3 },
  ],
};

const q2Field: SelectFieldDef = {
  id: 'q2',
  label: '2. He mirado el futuro con placer / ilusión',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Tanto como siempre', points: 0 },
    { value: '1', label: '1 — Algo menos de lo que solía hacer', points: 1 },
    { value: '2', label: '2 — Definitivamente menos', points: 2 },
    { value: '3', label: '3 — Prácticamente nunca', points: 3 },
  ],
};

const q3Field: SelectFieldDef = {
  id: 'q3',
  label: '3. Me he culpado sin necesidad cuando las cosas no salían bien',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — No, nunca', points: 0 },
    { value: '1', label: '1 — No muy a menudo', points: 1 },
    { value: '2', label: '2 — Sí, algunas veces', points: 2 },
    { value: '3', label: '3 — Sí, la mayoría de las veces', points: 3 },
  ],
};

const q4Field: SelectFieldDef = {
  id: 'q4',
  label: '4. He estado ansiosa y preocupada sin motivo',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — No, para nada', points: 0 },
    { value: '1', label: '1 — Casi nada', points: 1 },
    { value: '2', label: '2 — Sí, a veces', points: 2 },
    { value: '3', label: '3 — Sí, a menudo', points: 3 },
  ],
};

const q5Field: SelectFieldDef = {
  id: 'q5',
  label: '5. He sentido miedo o pánico sin motivo alguno',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — No, nada', points: 0 },
    { value: '1', label: '1 — No, no mucho', points: 1 },
    { value: '2', label: '2 — Sí, a veces', points: 2 },
    { value: '3', label: '3 — Sí, bastante', points: 3 },
  ],
};

const q6Field: SelectFieldDef = {
  id: 'q6',
  label: '6. Las cosas me oprimen o agobian',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — No, he estado tan bien como siempre', points: 0 },
    { value: '1', label: '1 — No, la mayoría de las veces las he sobrellevado bien', points: 1 },
    { value: '2', label: '2 — Sí, a veces no he podido sobrellevarlas como siempre', points: 2 },
    { value: '3', label: '3 — Sí, la mayor parte del tiempo no he podido sobrellevarlas', points: 3 },
  ],
};

const q7Field: SelectFieldDef = {
  id: 'q7',
  label: '7. Me he sentido tan infeliz que he tenido dificultad para dormir',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — No, nada', points: 0 },
    { value: '1', label: '1 — No muy a menudo', points: 1 },
    { value: '2', label: '2 — Sí, a veces', points: 2 },
    { value: '3', label: '3 — Sí, la mayoría de las veces', points: 3 },
  ],
};

const q8Field: SelectFieldDef = {
  id: 'q8',
  label: '8. Me he sentido triste o desgraciada',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — No, nada', points: 0 },
    { value: '1', label: '1 — No muy a menudo', points: 1 },
    { value: '2', label: '2 — Sí, bastante a menudo', points: 2 },
    { value: '3', label: '3 — Sí, casi siempre', points: 3 },
  ],
};

const q9Field: SelectFieldDef = {
  id: 'q9',
  label: '9. He sido tan infeliz que he estado llorando',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — No, nunca', points: 0 },
    { value: '1', label: '1 — Sólo en ocasiones', points: 1 },
    { value: '2', label: '2 — Sí, bastante a menudo', points: 2 },
    { value: '3', label: '3 — Sí, casi siempre', points: 3 },
  ],
};

const q10Field: SelectFieldDef = {
  id: 'q10',
  label: '10. He pensado en hacerme daño a mí misma',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — No, nunca', points: 0 },
    { value: '1', label: '1 — Casi nunca', points: 1 },
    { value: '2', label: '2 — A veces', points: 2 },
    { value: '3', label: '3 — Sí, bastante a menudo', points: 3 },
  ],
};

export const edinburghEpdsCalculator: CalculatorDefinition = {
  id: 'edinburgh-epds',
  name: 'Escala de Depresión Posparto de Edimburgo (EPDS)',
  shortName: 'Edimburgo (EPDS)',
  primarySpecialty: 'gineco-obstetricia',
  secondarySpecialties: ['psiquiatria', 'medicina-interna'],
  subcategory: 'diagnostico',
  keywords: [
    'edimburgo',
    'edinburgh',
    'epds',
    'depresion posparto',
    'perinatal',
    'puerperio',
    'embarazo',
    'tamizaje',
  ],
  description:
    'Cuestionario validado de 10 ítems (0–30 puntos) para tamizaje de depresión perinatal (durante el embarazo y primer año posparto) en los últimos 7 días.',
  clinicalIndication:
    'Cribado universal de depresión y ansiedad perinatal en control prenatal, puerperio (especialmente 4–8 semanas posparto) y consulta del niño sano.',
  validatedPopulation: 'Mujeres embarazadas y puérperas (validación española García-Esteve et al., 2003; ACOG/USPSTF).',
  contraindications: [
    'Es una herramienta de tamizaje, no diagnóstica: no sustituye la entrevista clínica ni descarta psicosis posparto o trastorno bipolar.',
  ],
  limitations: [
    'Cualquier respuesta ≥ 1 en el ítem 10 (pensamiento de autolesión) exige valoración urgente de seguridad materno-infantil, sin importar el puntaje total.',
    'Durante los primeros 10–14 días posparto ("baby blues" / tristeza puerperal) puede haber falsos positivos transitorios; si puntuación es 10–12, reevaluar en 2 semanas.',
  ],
  version: 'Cox et al. (1987) / Validación Española García-Esteve (2003)',
  references: [
    {
      citation:
        'Cox JL, Holden JM, Sagovsky R. Detection of postnatal depression. Development of the 10-item Edinburgh Postnatal Depression Scale. Br J Psychiatry. 1987;150:782-786.',
      year: 1987,
    },
    {
      citation:
        'Garcia-Esteve L, Ascaso C, Ojuel J, Navarro P. Validation of the Edinburgh Postnatal Depression Scale (EPDS) in Spanish mothers. J Affect Disord. 2003;75(1):71-76.',
      year: 2003,
    },
  ],
  fields: [q1Field, q2Field, q3Field, q4Field, q5Field, q6Field, q7Field, q8Field, q9Field, q10Field],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(edinburghEpdsCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const values = [
      Number(inputs.q1),
      Number(inputs.q2),
      Number(inputs.q3),
      Number(inputs.q4),
      Number(inputs.q5),
      Number(inputs.q6),
      Number(inputs.q7),
      Number(inputs.q8),
      Number(inputs.q9),
      Number(inputs.q10),
    ];

    const total = values.reduce((acc, v) => acc + v, 0);
    const selfHarmScore = values[9];

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (total < 10) {
      severity = 'normal';
      riskClassification = `Tamizaje negativo / Bajo riesgo (${total} / 30 puntos)`;
      clinicalInterpretation =
        'Puntuación < 10 puntos: baja probabilidad de depresión perinatal mayor en el momento actual.';
    } else if (total <= 12) {
      severity = 'moderate';
      riskClassification = `Riesgo limítrofe / Posible depresión (${total} / 30 puntos)`;
      clinicalInterpretation =
        'Puntuación entre 10 y 12 puntos: presencia de síntomas afectivos o ansiosos relevantes; sensibilidad aumentada para depresión menor o incipiente.';
      guidance = [
        'Explorar red de apoyo, descanso, lactancia y estresores psicosociales; repetir EPDS en 2–4 semanas o realizar entrevista clínica.',
      ];
    } else {
      severity = 'high';
      riskClassification = `Tamizaje positivo / Alta probabilidad de depresión perinatal (${total} / 30 puntos)`;
      clinicalInterpretation =
        'Puntuación ≥ 13 puntos (punto de corte clásico): alta probabilidad de episodio depresivo perinatal que amerita evaluación diagnóstica formal.';
      guidance = [
        'Realizar entrevista diagnóstica estructurada (descartar episodio mixto/bipolaridad o psicosis puerperal), valorar psicoterapia y/o farmacoterapia compatible con embarazo/lactancia.',
      ];
    }

    if (selfHarmScore >= 1) {
      severity = 'critical';
      guidance = [
        'ALERTA ÍTEM 10 POSITIVO: Evaluar de inmediato riesgo de autolesión, ideación suicida o daño al recién nacido; garantizar acompañamiento continuo y derivación urgente a salud mental.',
        ...guidance,
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación EPDS (Edimburgo)',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 30)',
      },
      secondaryResults: [
        {
          label: 'Ítem 10 (pensamientos de autolesión)',
          formattedValue: selfHarmScore > 0 ? `POSITIVO (${selfHarmScore}/3)` : 'Negativo (0/3)',
          unit: '',
        },
        {
          label: 'Umbral estándar de cribado positivo',
          formattedValue: total >= 13 ? '≥ 13 (Positivo)' : total >= 10 ? '10–12 (Limítrofe)' : '< 10 (Negativo)',
          unit: '',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: guidance.length > 0 ? guidance : undefined,
      guidanceDisclaimer: 'Instrumento de cribado perinatal; confirmar mediante entrevista clínica.',
      formulaUsed: 'Suma de 10 ítems (0–3 puntos cada uno; rango 0–30)',
      inputsSummary: `EPDS: ${values.join('+')} = ${total}/30 (Ítem 10: ${selfHarmScore})`,
    };
  },
};
