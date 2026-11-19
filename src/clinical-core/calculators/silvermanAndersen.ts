import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const chestField: SelectFieldDef = {
  id: 'thoracoabdominal',
  label: '1. Disociación toracoabdominal (movimiento de tórax y abdomen)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Sincronizados (tórax y abdomen se expanden juntos)', points: 0 },
    { value: '1', label: '1 — Tórax fijo / mínima elevación al expandir abdomen', points: 1 },
    { value: '2', label: '2 — Disociación franca ("en balancín" / sube abdomen, hunde tórax)', points: 2 },
  ],
};

const intercostalField: SelectFieldDef = {
  id: 'intercostal',
  label: '2. Tiraje intercostal',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Ausente', points: 0 },
    { value: '1', label: '1 — Discreto / apenas visible', points: 1 },
    { value: '2', label: '2 — Acentuado y constante', points: 2 },
  ],
};

const xiphoidField: SelectFieldDef = {
  id: 'xiphoid',
  label: '3. Retracción xifoidea (esternal inferior)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Ausente', points: 0 },
    { value: '1', label: '1 — Discreta', points: 1 },
    { value: '2', label: '2 — Marcada', points: 2 },
  ],
};

const nasalField: SelectFieldDef = {
  id: 'nasalFlaring',
  label: '4. Aleteo nasal',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Ausente', points: 0 },
    { value: '1', label: '1 — Mínimo / discreto', points: 1 },
    { value: '2', label: '2 — Marcado', points: 2 },
  ],
};

const gruntField: SelectFieldDef = {
  id: 'grunting',
  label: '5. Quejido espiratorio',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Ausente', points: 0 },
    { value: '1', label: '1 — Audible únicamente con estetoscopio', points: 1 },
    { value: '2', label: '2 — Audible a distancia (sin estetoscopio)', points: 2 },
  ],
};

export const silvermanAndersenCalculator: CalculatorDefinition = {
  id: 'silverman-andersen',
  name: 'Escala de Silverman-Andersen (Dificultad Respiratoria Neonatal)',
  shortName: 'Silverman-Andersen',
  primarySpecialty: 'gineco-obstetricia',
  secondarySpecialties: ['pediatria', 'urgencias'],
  subcategory: 'gravedad',
  keywords: ['silverman', 'andersen', 'neonato', 'dificultad respiratoria', 'distres', 'cpap', 'recien nacido'],
  description:
    'Cuantificación clínica de la gravedad de la dificultad respiratoria del recién nacido (0–10 pts; a mayor puntuación, mayor gravedad respiratoria).',
  clinicalIndication:
    'Evaluación inicial y vigilancia seriada en sala de partos y UCIN de taquipnea transitoria, síndrome de dificultad respiratoria (SDR) o aspiración meconial.',
  validatedPopulation: 'Recién nacidos a término y prematuros con respiración espontánea.',
  contraindications: [
    'No aplicable en recién nacidos ya sometidos a ventilación mecánica invasiva o bloqueo neuromuscular.',
    '¡No confundir dirección del puntaje con Apgar!: en Silverman-Andersen, 0 es normal y 10 es gravedad extrema.',
  ],
  limitations: [
    'No incluye la frecuencia respiratoria ni la saturación de oxígeno (SpO₂), por lo que siempre debe interpretarse junto con oximetría, gasometría y exploración clínica.',
  ],
  version: 'Silverman WA & Andersen DH (Pediatrics 1956)',
  references: [
    {
      citation: 'Silverman WA, Andersen DH. A controlled clinical trial of effects of water mist on obstructive respiratory signs, death rate and necropsy findings among premature infants. Pediatrics. 1956;17(1):1-10.',
      year: 1956,
    },
  ],
  fields: [chestField, intercostalField, xiphoidField, nasalField, gruntField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(silvermanAndersenCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const total =
      Number(inputs.thoracoabdominal) +
      Number(inputs.intercostal) +
      Number(inputs.xiphoid) +
      Number(inputs.nasalFlaring) +
      Number(inputs.grunting);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (total === 0) {
      severity = 'normal';
      riskClassification = 'Sin dificultad respiratoria (0 / 10 puntos)';
      clinicalInterpretation = 'Mecánica ventilatoria neonatal normal sin signos de esfuerzo respiratorio.';
    } else if (total <= 3) {
      severity = 'low';
      riskClassification = `Dificultad respiratoria leve (${total} / 10 puntos)`;
      clinicalInterpretation = 'Trabajo respiratorio leve; vigilar evolución cada 15–30 minutos, termorregulación y SpO₂.';
      guidance = ['Monitorización continua de SpO₂, frecuencia respiratoria y glucemia; valorar O₂ suplementario si desaturación según metas neonatales.'];
    } else if (total <= 6) {
      severity = 'high';
      riskClassification = `Dificultad respiratoria moderada (${total} / 10 puntos)`;
      clinicalInterpretation = 'Esfuerzo respiratorio significativo con riesgo de fatiga muscular o hipoxemia progresiva.';
      guidance = ['Evaluar inicio precoz de presión positiva continua nasal (CPAP nasal), radiografía de tórax y gasometría en unidad neonatal.'];
    } else {
      severity = 'critical';
      riskClassification = `Dificultad respiratoria grave (${total} / 10 puntos)`;
      clinicalInterpretation = 'Insuficiencia respiratoria inminente o establecida con agotamiento ventilatorio grave.';
      guidance = ['Soporte ventilatorio urgente en UCIN (valorar intubación / ventilación mecánica / surfactante si SDR prematuro) y monitorización intensiva.'];
    }

    return {
      primaryResult: {
        label: 'Puntuación Silverman-Andersen',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (0 normal – 10 grave)',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: guidance.length > 0 ? guidance : undefined,
      formulaUsed: 'Disociación TA + Tiraje IC + Retracción xifoidea + Aleteo nasal + Quejido (0–2 c/u)',
      inputsSummary: `Silverman-Andersen: ${total} / 10 puntos`,
    };
  },
};
