import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const IPSS_FREQ_OPTIONS = [
  { value: '0', label: '0 — Ninguna vez', points: 0 },
  { value: '1', label: '1 — Menos de 1 vez de cada 5', points: 1 },
  { value: '2', label: '2 — Menos de la mitad de las veces', points: 2 },
  { value: '3', label: '3 — Alrededor de la mitad de las veces', points: 3 },
  { value: '4', label: '4 — Más de la mitad de las veces', points: 4 },
  { value: '5', label: '5 — Casi siempre', points: 5 },
];

function makeIpssField(id: string, label: string): SelectFieldDef {
  return {
    id,
    label,
    type: 'select',
    defaultValue: '0',
    options: IPSS_FREQ_OPTIONS,
  };
}

const q1 = makeIpssField('q1', '1. Vaciado incompleto: sensación de no vaciar del todo la vejiga (último mes)');
const q2 = makeIpssField('q2', '2. Polaquiuria: necesidad de volver a orinar antes de 2 horas');
const q3 = makeIpssField('q3', '3. Intermitencia: chorro urinario que se detiene y vuelve a empezar');
const q4 = makeIpssField('q4', '4. Urgencia: dificultad para aguantar las ganas de orinar');
const q5 = makeIpssField('q5', '5. Chorro débil: disminución de la fuerza o calibre del chorro');
const q6 = makeIpssField('q6', '6. Esfuerzo / pujo: necesidad de apretar o hacer fuerza para iniciar la micción');

const q7: SelectFieldDef = {
  id: 'q7',
  label: '7. Nicturia: ¿cuántas veces se levanta a orinar durante la noche?',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Ninguna', points: 0 },
    { value: '1', label: '1 vez', points: 1 },
    { value: '2', label: '2 veces', points: 2 },
    { value: '3', label: '3 veces', points: 3 },
    { value: '4', label: '4 veces', points: 4 },
    { value: '5', label: '5 o más veces', points: 5 },
  ],
};

const qolField: SelectFieldDef = {
  id: 'qol',
  label: '8. Calidad de vida (QoL): ¿Cómo se sentiría si tuviera que pasar el resto de su vida orinando así?',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '0', label: '0 — Encantado', points: 0 },
    { value: '1', label: '1 — Muy satisfecho', points: 1 },
    { value: '2', label: '2 — Más bien satisfecho', points: 2 },
    { value: '3', label: '3 — Indiferente / regular', points: 3 },
    { value: '4', label: '4 — Más bien insatisfecho', points: 4 },
    { value: '5', label: '5 — Muy insatisfecho', points: 5 },
    { value: '6', label: '6 — Fatal / intolerable', points: 6 },
  ],
};

export const ipssProstateCalculator: CalculatorDefinition = {
  id: 'ipss-prostate',
  name: 'Escala IPSS (Síntomas Prostáticos e Hiperplasia Prostática Benigna)',
  shortName: 'IPSS (HPB / Urología)',
  primarySpecialty: 'urologia',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'diagnostico',
  keywords: ['ipss', 'prostata', 'hpb', 'hiperplasia prostatica', 'sintomas urinarios', 'urologia', 'nicturia'],
  description:
    'Cuestionario Internacional de Síntomas Prostáticos (0–35 puntos en 7 ítems de vaciado y llenado + índice de calidad de vida 0–6) para graduar síntomas del tracto urinario inferior (STUI).',
  clinicalIndication:
    'Valoración inicial, seguimiento evolutivo y respuesta terapéutica en varones (habitualmente > 45–50 años) con síntomas del tracto urinario inferior compatibles con HPB.',
  validatedPopulation: 'Varones adultos con síntomas urinarios bajos (STUI/HPB).',
  contraindications: [
    'No diferencia por sí solo entre HPB, prostatitis, estenosis uretral, vejiga hiperactiva, infección urinaria o cáncer de próstata.',
    'Ante retención aguda de orina, hematuria macroscópica, infección recurrente o deterioro renal, derivar a Urología.',
  ],
  limitations: [
    'El ítem 8 (calidad de vida) no se suma al puntaje de síntomas (0–35), pero es clave para decidir manejo expectante vs farmacológico según molestia percibida.',
  ],
  version: 'Barry et al. AUA/WHO IPSS (1992)',
  references: [
    {
      citation:
        'Barry MJ, Fowler FJ Jr, O’Leary MP, et al. The American Urological Association symptom index for benign prostatic hyperplasia. J Urol. 1992;148(5):1549-1557.',
      year: 1992,
    },
  ],
  fields: [q1, q2, q3, q4, q5, q6, q7, qolField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(ipssProstateCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const total =
      Number(inputs.q1) +
      Number(inputs.q2) +
      Number(inputs.q3) +
      Number(inputs.q4) +
      Number(inputs.q5) +
      Number(inputs.q6) +
      Number(inputs.q7);
    const qol = Number(inputs.qol);

    const voiding = Number(inputs.q1) + Number(inputs.q3) + Number(inputs.q5) + Number(inputs.q6);
    const storage = Number(inputs.q2) + Number(inputs.q4) + Number(inputs.q7);

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (total <= 7) {
      severity = 'low';
      riskClassification = `Sintomatología leve (IPSS ${total} / 35 · QoL ${qol}/6)`;
      clinicalInterpretation = 'Síntomas urinarios leves.';
      guidance = [
        'Habitualmente candidato a vigilancia activa y medidas conductuales (reducir líquidos nocturnos, cafeína/alcohol, doble micción), salvo QoL muy afectada.',
      ];
    } else if (total <= 19) {
      severity = 'moderate';
      riskClassification = `Sintomatología moderada (IPSS ${total} / 35 · QoL ${qol}/6)`;
      clinicalInterpretation = 'Síntomas moderados con impacto variable en la calidad de vida.';
      guidance = [
        'Completar EGO, creatinina sérica, tacto rectal y valoración individualizada de terapia médica (alfabloqueador y/o inhibidor 5-alfa reductasa si volumen prostático aumentado).',
      ];
    } else {
      severity = 'high';
      riskClassification = `Sintomatología grave (IPSS ${total} / 35 · QoL ${qol}/6)`;
      clinicalInterpretation = 'Carga sintomática severa; mayor riesgo de complicaciones obstructivas y deterioro de calidad de vida.';
      guidance = [
        'Evaluar residuo postmiccional, función renal, PSA según edad/guía y valorar derivación a Urología para terapia médica combinada o intervención.',
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación IPSS',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 35)',
      },
      secondaryResults: [
        { label: 'Calidad de vida (QoL)', formattedValue: `${qol} / 6`, unit: '' },
        { label: 'Síntomas vaciado / almacenamiento', formattedValue: `${voiding} / 20 · ${storage} / 15`, unit: '' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'Descartar siempre infección urinaria, hematuria y retención urinaria.',
      formulaUsed: 'IPSS = Suma ítems 1–7 (0–35 pts) + Ítem 8 Calidad de Vida separado (0–6)',
      inputsSummary: `IPSS: ${total}/35 (Vaciado: ${voiding}, Llenado: ${storage}) · QoL: ${qol}/6`,
    };
  },
};
