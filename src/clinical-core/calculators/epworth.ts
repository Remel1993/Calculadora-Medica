import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const ESS_OPTIONS = [
  { value: '0', label: '0 — Nunca se dormiría', points: 0 },
  { value: '1', label: '1 — Ligera probabilidad', points: 1 },
  { value: '2', label: '2 — Moderada probabilidad', points: 2 },
  { value: '3', label: '3 — Alta probabilidad', points: 3 },
];

function makeEssField(id: string, label: string): SelectFieldDef {
  return {
    id,
    label,
    type: 'select',
    defaultValue: '0',
    options: ESS_OPTIONS,
  };
}

const sittingReading = makeEssField('sittingReading', '1. Sentado y leyendo');
const watchingTv = makeEssField('watchingTv', '2. Viendo la televisión');
const publicInactive = makeEssField(
  'publicInactive',
  '3. Sentado e inactivo en un lugar público (cine, reunión)',
);
const carPassenger = makeEssField(
  'carPassenger',
  '4. Como pasajero en un coche durante 1 hora sin parar',
);
const lyingAfternoon = makeEssField(
  'lyingAfternoon',
  '5. Recostado para descansar por la tarde cuando las circunstancias lo permiten',
);
const sittingTalking = makeEssField('sittingTalking', '6. Sentado y conversando con alguien');
const afterLunch = makeEssField(
  'afterLunch',
  '7. Sentado tranquilamente después de una comida sin alcohol',
);
const carTraffic = makeEssField(
  'carTraffic',
  '8. En un automóvil al detenerse unos minutos en el tráfico',
);

export const epworthCalculator: CalculatorDefinition = {
  id: 'epworth',
  name: 'Escala de Somnolencia de Epworth (ESS — SAOS)',
  shortName: 'Epworth (ESS)',
  primarySpecialty: 'neumologia',
  secondarySpecialties: ['medicina-interna', 'neurologia'],
  subcategory: 'diagnostico',
  keywords: [
    'epworth',
    'ess',
    'somnolencia',
    'cansancio',
    'fatiga diurna',
    'saos',
    'apnea',
    'sueno',
    'narcolepsia',
  ],
  description:
    'Cuestionario estándar de 8 situaciones cotidianas para cuantificar la somnolencia diurna excesiva, utilizado habitualmente junto con STOP-BANG en sospecha de SAOS.',
  clinicalIndication:
    'Evaluación de somnolencia diurna subjetiva en pacientes con sospecha de SAOS, privación crónica de sueño, hipersomnia o seguimiento de respuesta a CPAP.',
  validatedPopulation: 'Adultos ≥ 18 años en medicina general, neumología y medicina del sueño.',
  contraindications: [
    'No evalúa directamente eventos apneicos nocturnos; no debe usarse como prueba única para descartar SAOS.',
  ],
  limitations: [
    'Mide propensión subjetiva a quedarse dormido, no cansancio físico aislado ni insomnio.',
    'Un puntaje normal (≤ 10) no excluye SAOS moderado o grave, especialmente en pacientes con hiperalerta o que evitan situaciones sedentarias.',
    'Puede subestimar la somnolencia por sesgo de reporte en conductores profesionales o pacientes que no manejan ni leen con frecuencia.',
  ],
  version: 'Johns MW (1991)',
  references: [
    {
      citation:
        'Johns MW. A new method for measuring daytime sleepiness: the Epworth sleepiness scale. Sleep. 1991;14(6):540-545.',
      year: 1991,
    },
    {
      citation:
        'Johns MW. Reliability and factor analysis of the Epworth Sleepiness Scale. Sleep. 1992;15(4):376-381.',
      year: 1992,
    },
  ],
  fields: [
    sittingReading,
    watchingTv,
    publicInactive,
    carPassenger,
    lyingAfternoon,
    sittingTalking,
    afterLunch,
    carTraffic,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(epworthCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const items = [
      Number(inputs.sittingReading),
      Number(inputs.watchingTv),
      Number(inputs.publicInactive),
      Number(inputs.carPassenger),
      Number(inputs.lyingAfternoon),
      Number(inputs.sittingTalking),
      Number(inputs.afterLunch),
      Number(inputs.carTraffic),
    ];

    const total = items.reduce((sum, val) => sum + val, 0);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (total <= 5) {
      severity = 'normal';
      riskClassification = `Somnolencia diurna normal baja (${total} / 24 puntos)`;
      clinicalInterpretation =
        'Dentro de límites fisiológicos habituales; baja propensión a somnolencia diurna.';
    } else if (total <= 10) {
      severity = 'low';
      riskClassification = `Somnolencia diurna normal alta (${total} / 24 puntos)`;
      clinicalInterpretation =
        'Puntuación dentro del rango normal superior (≤ 10), aunque amerita revisar higiene del sueño si refiere fatiga subjetiva.';
    } else if (total <= 12) {
      severity = 'moderate';
      riskClassification = `Somnolencia diurna excesiva leve (${total} / 24 puntos)`;
      clinicalInterpretation =
        'Supera el umbral clínico estándar (> 10 puntos). Sugiere somnolencia diurna excesiva leve.';
      guidance = [
        'Correlacionar con STOP-BANG, higiene del sueño, fármacos sedantes y comorbilidades (hipotiroidismo, depresión).',
      ];
    } else if (total <= 15) {
      severity = 'high';
      riskClassification = `Somnolencia diurna excesiva moderada (${total} / 24 puntos)`;
      clinicalInterpretation =
        'Somnolencia diurna excesiva moderada con potencial impacto funcional y riesgo aumentado en conducción o maquinaria.';
      guidance = [
        'Evaluar estudio dirigido de trastornos respiratorios del sueño (polisomnografía / poligrafía) si hay ronquido o STOP-BANG ≥ 3.',
        'Advertir precaución al conducir vehículos o operar maquinaria mientras se estudia la causa.',
      ];
    } else {
      severity = 'critical';
      riskClassification = `Somnolencia diurna excesiva grave (${total} / 24 puntos)`;
      clinicalInterpretation =
        'Somnolencia diurna grave con riesgo elevado de microsueños involuntarios y accidentes.';
      guidance = [
        'Priorizar valoración médica especializada en trastornos del sueño (SAOS, hipersomnia central, narcolepsia).',
        'Recomendar evitar conducción de vehículos y actividades de riesgo hasta estudio y control clínico.',
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación Epworth (ESS)',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 24)',
      },
      secondaryResults: [
        {
          label: 'Umbral de somnolencia excesiva (> 10 pts)',
          formattedValue: total >= 11 ? 'Positivo' : 'Negativo',
          unit: '',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: guidance.length > 0 ? guidance : undefined,
      guidanceDisclaimer:
        'Complementar con STOP-BANG y valoración clínica integral del sueño.',
      formulaUsed: 'Suma de 8 ítems situacionales (0 – 3 puntos cada uno)',
      inputsSummary: `Ítems ESS: ${items.join('+')} (Total: ${total}/24)`,
    };
  },
};
