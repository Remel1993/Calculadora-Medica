import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const eyeField: SelectFieldDef = {
  id: 'eye',
  label: 'Apertura ocular (O)',
  type: 'select',
  defaultValue: '4',
  options: [
    { value: '4', label: '4 — Espontánea', points: 4 },
    { value: '3', label: '3 — Al estímulo verbal / orden', points: 3 },
    { value: '2', label: '2 — Al estímulo doloroso (presión)', points: 2 },
    { value: '1', label: '1 — Ninguna apertura ocular', points: 1 },
  ],
};

const verbalField: SelectFieldDef = {
  id: 'verbal',
  label: 'Respuesta verbal (V)',
  helpText: 'En pacientes intubados o con afasia previa, documentar la limitación (el cálculo numérico mínimo asigna 1 o considerar FOUR Score).',
  type: 'select',
  defaultValue: '5',
  options: [
    { value: '5', label: '5 — Orientado y conversando', points: 5 },
    { value: '4', label: '4 — Desorientado / confuso', points: 4 },
    { value: '3', label: '3 — Palabras inapropiadas o sueltas', points: 3 },
    { value: '2', label: '2 — Sonidos incomprensibles (gemidos)', points: 2 },
    { value: '1', label: '1 — Ninguna respuesta verbal (o intubado: documentar V-NT)', points: 1 },
  ],
};

const motorField: SelectFieldDef = {
  id: 'motor',
  label: 'Respuesta motora (M)',
  type: 'select',
  defaultValue: '6',
  options: [
    { value: '6', label: '6 — Obedece órdenes sencillas', points: 6 },
    { value: '5', label: '5 — Localiza el estímulo doloroso', points: 5 },
    { value: '4', label: '4 — Retirada normal al dolor (flexión normal)', points: 4 },
    { value: '3', label: '3 — Flexión anormal (decorticación)', points: 3 },
    { value: '2', label: '2 — Extensión anormal (descerebración)', points: 2 },
    { value: '1', label: '1 — Ninguna respuesta motora', points: 1 },
  ],
};

const pupilsField: SelectFieldDef = {
  id: 'pupilNonReactive',
  label: 'Reactividad pupilar a la luz (para GCS-P)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Ambas pupilas reactivas (0)', points: 0 },
    { value: '1', label: 'Una pupila no reactiva (-1)', points: -1 },
    { value: '2', label: 'Ninguna pupila reactiva (-2)', points: -2 },
  ],
};

export const glasgowCalculator: CalculatorDefinition = {
  id: 'glasgow',
  name: 'Escala de Coma de Glasgow (GCS y GCS-P)',
  shortName: 'Glasgow (GCS)',
  primarySpecialty: 'neurologia',
  secondarySpecialties: ['urgencias', 'cirugia-general'],
  subcategory: 'gravedad',
  keywords: ['glasgow', 'gcs', 'gcs-p', 'coma', 'tce', 'conciencia', 'pupilas', 'trauma craneoencefalico'],
  description:
    'Evaluación estructurada del nivel de conciencia mediante respuesta ocular, verbal y motora (3–15 pts), complementada con reactividad pupilar (GCS-P, 1–15 pts).',
  clinicalIndication:
    'Valoración neurológica inicial y seriación evolutiva en traumatismo craneoencefálico (TCE), ictus, alteración del estado mental y paciente crítico.',
  validatedPopulation: 'Adultos y niños mayores de 5 años (para lactantes y preverbales utilizar Glasgow pediátrica).',
  contraindications: [
    'La puntuación total pierde fiabilidad bajo sedación profunda, bloqueo neuromuscular o intubación orotraqueal (en intubados utilizar FOUR Score o reportar componentes individuales O_Vnt_M).',
  ],
  limitations: [
    'Siempre registrar el desglose por componentes (O + V + M) además de la suma total; dos pacientes con GCS 8 pueden tener pronósticos distintos.',
    'La escala GCS-P (Brennan 2018) resta 0, 1 o 2 puntos según la pérdida de reactividad pupilar y mejora la discriminación pronóstica en TCE grave.',
  ],
  version: 'Teasdale & Jennett (1974 / Rev. 2014) + GCS-P (Brennan 2018)',
  references: [
    {
      citation: 'Teasdale G, Jennett B. Assessment of coma and impaired consciousness. A practical scale. Lancet. 1974;2(7872):81-84.',
      year: 1974,
    },
    {
      citation: 'Brennan PM, Murray GD, Teasdale GM. Simplifying the use of prognostic information in traumatic brain injury. Part 1: The GCS-Pupils score: an extended index of clinical severity. J Neurosurg. 2018;128(6):1612-1620.',
      year: 2018,
    },
  ],
  fields: [eyeField, verbalField, motorField, pupilsField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(glasgowCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const eye = Number(inputs.eye);
    const verbal = Number(inputs.verbal);
    const motor = Number(inputs.motor);
    const pupilPenalty = Number(inputs.pupilNonReactive);

    const gcs = eye + verbal + motor;
    const gcsP = gcs - pupilPenalty;

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] | undefined;

    if (gcs >= 13) {
      severity = gcs === 15 ? 'normal' : 'low';
      riskClassification = gcs === 15 ? 'Normal / Sin alteración (GCS 15)' : `Compromiso leve (GCS ${gcs} / 15)`;
      clinicalInterpretation =
        gcs === 15
          ? 'Nivel de conciencia íntegro en los tres dominios evaluados.'
          : 'En contexto de TCE corresponde a traumatismo craneoencefálico leve (valorar signos de alarma para TC craneal según reglas validadas).';
    } else if (gcs >= 9) {
      severity = 'moderate';
      riskClassification = `Compromiso moderado (GCS ${gcs} / 15)`;
      clinicalInterpretation =
        'En TCE corresponde a gravedad moderada. Requiere monitorización neurológica estrecha, neuroimagen urgente y vigilancia de vía aérea.';
    } else {
      severity = 'critical';
      riskClassification = `Compromiso grave / Coma (GCS ${gcs} / 15)`;
      clinicalInterpretation =
        'Puntuación ≤ 8 compatible con estado de coma y compromiso grave del nivel de conciencia.';
      guidance = [
        'Evaluar protección definitiva de la vía aérea (intubación orotraqueal según causa reversible vs estructural), estabilidad hemodinámica y TC craneal urgente.',
      ];
    }

    return {
      primaryResult: {
        label: 'Escala de Coma de Glasgow (GCS)',
        value: gcs,
        formattedValue: String(gcs),
        unit: 'puntos (3 – 15)',
      },
      secondaryResults: [
        {
          label: 'GCS-Pupilas (GCS-P)',
          formattedValue: String(gcsP),
          unit: 'puntos (1 – 15)',
          note: pupilPenalty > 0 ? `Resta ${pupilPenalty} por arreactividad pupilar` : 'Ambas pupilas reactivas',
        },
        {
          label: 'Desglose (O · V · M)',
          formattedValue: `O${eye} V${verbal} M${motor}`,
          unit: '',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'GCS = Ocular (1–4) + Verbal (1–5) + Motora (1–6); GCS-P = GCS - Pupilas no reactivas (0–2)',
      inputsSummary: `O${eye} V${verbal} M${motor} (GCS ${gcs}) · Pupilas no reactivas: ${pupilPenalty} (GCS-P ${gcsP})`,
    };
  },
};
