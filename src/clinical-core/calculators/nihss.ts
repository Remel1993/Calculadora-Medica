import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const item1a: SelectFieldDef = {
  id: 'i1a',
  label: '1a. Nivel de conciencia',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Alerta, responde vivamente', points: 0 },
    { value: '1', label: '1 — Somnoliento, pero responde ante estímulo mínimo', points: 1 },
    { value: '2', label: '2 — Estuporoso, requiere estímulos repetidos o dolorosos', points: 2 },
    { value: '3', label: '3 — Coma, solo respuestas reflejas o ninguna respuesta', points: 3 },
  ],
};

const item1b: SelectFieldDef = {
  id: 'i1b',
  label: '1b. Preguntas de orientación (mes actual y edad)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Responde ambas correctamente', points: 0 },
    { value: '1', label: '1 — Responde una correctamente (o intubado/barrera idiomática)', points: 1 },
    { value: '2', label: '2 — No responde ninguna (o afasia/estupor)', points: 2 },
  ],
};

const item1c: SelectFieldDef = {
  id: 'i1c',
  label: '1c. Órdenes motoras (abrir/cerrar ojos y apretar/soltar mano no parética)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Realiza ambas tareas correctamente', points: 0 },
    { value: '1', label: '1 — Realiza una tarea correctamente', points: 1 },
    { value: '2', label: '2 — No realiza ninguna tarea', points: 2 },
  ],
};

const item2: SelectFieldDef = {
  id: 'i2',
  label: '2. Mirada conjugada horizontal',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Normal', points: 0 },
    { value: '1', label: '1 — Parálisis parcial de la mirada (o parálisis aislada de par craneal)', points: 1 },
    { value: '2', label: '2 — Desviación forzada o paresia total que no vence maniobra oculocefálica', points: 2 },
  ],
};

const item3: SelectFieldDef = {
  id: 'i3',
  label: '3. Campos visuales',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Sin pérdida visual', points: 0 },
    { value: '1', label: '1 — Hemianopsia parcial (cuadrantanopsia)', points: 1 },
    { value: '2', label: '2 — Hemianopsia homónima completa', points: 2 },
    { value: '3', label: '3 — Hemianopsia bilateral (ceguera, incluida ceguera cortical)', points: 3 },
  ],
};

const item4: SelectFieldDef = {
  id: 'i4',
  label: '4. Parálisis facial',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Movimientos normales simétricos', points: 0 },
    { value: '1', label: '1 — Paresia menor (borramiento del surco nasogeniano, asimetría al sonreír)', points: 1 },
    { value: '2', label: '2 — Parálisis parcial (debilidad total o casi total facial inferior)', points: 2 },
    { value: '3', label: '3 — Parálisis completa unilateral o bilateral (superior e inferior)', points: 3 },
  ],
};

const limbOptions = [
  { value: '0', label: '0 — Mantiene extremidad sin claudicar (10 s brazo / 5 s pierna) o no valorable por amputación', points: 0 },
  { value: '1', label: '1 — Claudica antes del tiempo límite sin golpear la cama', points: 1 },
  { value: '2', label: '2 — Algún esfuerzo contra gravedad, pero cae a la cama antes del tiempo límite', points: 2 },
  { value: '3', label: '3 — Sin esfuerzo contra gravedad (cae inmediatamente, pero mueve en plano)', points: 3 },
  { value: '4', label: '4 — Ningún movimiento (plejía)', points: 4 },
];

const item5a: SelectFieldDef = { id: 'i5a', label: '5a. Motor brazo izquierdo (90° sentado / 45° supino, 10 s)', type: 'select', defaultValue: '0', options: limbOptions };
const item5b: SelectFieldDef = { id: 'i5b', label: '5b. Motor brazo derecho (90° sentado / 45° supino, 10 s)', type: 'select', defaultValue: '0', options: limbOptions };
const item6a: SelectFieldDef = { id: 'i6a', label: '6a. Motor pierna izquierda (30° supino, 5 s)', type: 'select', defaultValue: '0', options: limbOptions };
const item6b: SelectFieldDef = { id: 'i6b', label: '6b. Motor pierna derecha (30° supino, 5 s)', type: 'select', defaultValue: '0', options: limbOptions };

const item7: SelectFieldDef = {
  id: 'i7',
  label: '7. Ataxia de miembros (dedo-nariz y talón-rodilla)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Ausente (o no valorable por parálisis/comprensión)', points: 0 },
    { value: '1', label: '1 — Presente en una extremidad', points: 1 },
    { value: '2', label: '2 — Presente en dos extremidades', points: 2 },
  ],
};

const item8: SelectFieldDef = {
  id: 'i8',
  label: '8. Sensibilidad (al pinchazo)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Normal, sin pérdida sensitiva', points: 0 },
    { value: '1', label: '1 — Pérdida sensitiva leve a moderada', points: 1 },
    { value: '2', label: '2 — Pérdida sensitiva grave o total (o coma/déficit bilateral)', points: 2 },
  ],
};

const item9: SelectFieldDef = {
  id: 'i9',
  label: '9. Mejor lenguaje / Afasia',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Sin afasia, normal', points: 0 },
    { value: '1', label: '1 — Afasia leve a moderada (errores de nominación o comprensión parcial)', points: 1 },
    { value: '2', label: '2 — Afasia grave (comunicación fragmentada)', points: 2 },
    { value: '3', label: '3 — Mutismo o afasia global (sin comunicación utilizable / coma)', points: 3 },
  ],
};

const item10: SelectFieldDef = {
  id: 'i10',
  label: '10. Disartria',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Normal (o intubado/barrera mecánica no evaluable)', points: 0 },
    { value: '1', label: '1 — Disartria leve a moderada (arrastra algunas palabras pero comprensible)', points: 1 },
    { value: '2', label: '2 — Disartria grave (ininteligible o mudo/anartria)', points: 2 },
  ],
};

const item11: SelectFieldDef = {
  id: 'i11',
  label: '11. Extinción e inatención (negligencia)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Sin anomalía', points: 0 },
    { value: '1', label: '1 — Inatención o extinción en una modalidad sensorial (visual, táctil, auditiva o espacial)', points: 1 },
    { value: '2', label: '2 — Heminatención profunda o extinción en más de una modalidad', points: 2 },
  ],
};

const ALL_NIHSS_FIELDS = [
  item1a,
  item1b,
  item1c,
  item2,
  item3,
  item4,
  item5a,
  item5b,
  item6a,
  item6b,
  item7,
  item8,
  item9,
  item10,
  item11,
];

export const nihssCalculator: CalculatorDefinition = {
  id: 'nihss',
  name: 'Escala NIHSS (National Institutes of Health Stroke Scale)',
  shortName: 'NIHSS',
  primarySpecialty: 'neurologia',
  secondarySpecialties: ['urgencias'],
  subcategory: 'gravedad',
  keywords: ['nihss', 'ictus', 'acv', 'stroke', 'trombolisis', 'trombectomia', 'codigo ictus'],
  description:
    'Cuantificación estandarizada del déficit neurológico agudo en el ictus (11 dominios / 15 subítems, 0–42 puntos).',
  clinicalIndication:
    'Evaluación inicial, seguimiento evolutivo y estratificación en Código Ictus para decisiones de reperfusión aguda.',
  validatedPopulation: 'Adultos con sospecha o diagnóstico de ictus isquémico o hemorrágico agudo.',
  contraindications: [
    'No sustituye a la neuroimagen urgente (TC/RM) para diferenciar ictus isquémico de hemorragia antes de trombólisis.',
  ],
  limitations: [
    'Ponderada hacia circulación anterior (hemisferio izquierdo): un ictus de circulación posterior (tronco/cerebelo) puede causar discapacidad grave con NIHSS bajo (0–4).',
    'Un NIHSS bajo no contraindica reperfusión si el déficit es funcionalmente incapacitante (p. ej. afasia aislada o hemianopsia).',
  ],
  version: 'Brott T et al. (Stroke 1989 — versión oficial 15 subítems)',
  references: [
    {
      citation: 'Brott T, Adams HP Jr, Olinger CP, et al. Measurements of acute cerebral infarction: a clinical examination scale. Stroke. 1989;20(7):864-870.',
      year: 1989,
    },
    {
      citation: 'Powers WJ, Rabinstein AA, Ackerson T, et al. Guidelines for the Early Management of Patients With Acute Ischemic Stroke: 2019 Update. Stroke. 2019;50(12):e344-e418.',
      year: 2019,
    },
  ],
  fields: ALL_NIHSS_FIELDS,
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(nihssCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const total = ALL_NIHSS_FIELDS.reduce((sum, f) => sum + Number(inputs[f.id] ?? 0), 0);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (total === 0) {
      severity = 'normal';
      riskClassification = 'Sin déficit medible en NIHSS (0 puntos)';
      clinicalInterpretation = 'No excluye ictus de fosa posterior (vértigo central, ataxia troncal, diplopía) ni AIT resuelto.';
    } else if (total <= 4) {
      severity = 'low';
      riskClassification = `Ictus leve (${total} / 42 puntos)`;
      clinicalInterpretation =
        'Déficit neurológico menor; evaluar si el déficit es funcionalmente discapacitante para definir elegibilidad de reperfusión.';
    } else if (total <= 15) {
      severity = 'moderate';
      riskClassification = `Ictus moderado (${total} / 42 puntos)`;
      clinicalInterpretation =
        'Déficit moderado; puntuaciones ≥ 6 orientan a descartar oclusión de gran vaso mediante angio-TC urgente en ventana terapéutica.';
    } else if (total <= 20) {
      severity = 'high';
      riskClassification = `Ictus moderado-grave (${total} / 42 puntos)`;
      clinicalInterpretation =
        'Déficit extenso con alta probabilidad de oclusión de gran vaso y riesgo de transformación hemorrágica o edema.';
    } else {
      severity = 'critical';
      riskClassification = `Ictus grave (${total} / 42 puntos)`;
      clinicalInterpretation =
        'Déficit neurológico severo con alto riesgo de mortalidad y dependencia funcional; manejo prioritario en unidad de ictus / neurocríticos.';
    }

    return {
      primaryResult: {
        label: 'Puntuación NIHSS total',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 42)',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: [
        'Activar protocolo de Código Ictus, registrar hora de inicio/última vez visto bien y realizar TC craneal simple (+ angio-TC si procede) sin demora.',
      ],
      formulaUsed: 'Suma de los 15 subítems oficiales NIHSS (0 – 42 puntos)',
      inputsSummary: `NIHSS total: ${total} / 42 puntos`,
    };
  },
};
