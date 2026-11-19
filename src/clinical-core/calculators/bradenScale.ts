import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const sensoryField: SelectFieldDef = {
  id: 'sensory',
  label: '1. Percepción sensorial (respuesta a presión/malestar)',
  type: 'select',
  defaultValue: '4',
  options: [
    { value: '1', label: '1 — Completamente limitada', points: 1 },
    { value: '2', label: '2 — Muy limitada', points: 2 },
    { value: '3', label: '3 — Ligeramente limitada', points: 3 },
    { value: '4', label: '4 — Sin limitaciones', points: 4 },
  ],
};

const moistureField: SelectFieldDef = {
  id: 'moisture',
  label: '2. Exposición a la humedad',
  type: 'select',
  defaultValue: '4',
  options: [
    { value: '1', label: '1 — Constantemente húmeda', points: 1 },
    { value: '2', label: '2 — Muy húmeda (cambio sábanas c/turno)', points: 2 },
    { value: '3', label: '3 — Ocasionalmente húmeda', points: 3 },
    { value: '4', label: '4 — Raramente húmeda', points: 4 },
  ],
};

const activityField: SelectFieldDef = {
  id: 'activity',
  label: '3. Actividad física',
  type: 'select',
  defaultValue: '4',
  options: [
    { value: '1', label: '1 — Encamado', points: 1 },
    { value: '2', label: '2 — En silla (no camina)', points: 2 },
    { value: '3', label: '3 — Deambula ocasionalmente', points: 3 },
    { value: '4', label: '4 — Deambula frecuentemente', points: 4 },
  ],
};

const mobilityField: SelectFieldDef = {
  id: 'mobility',
  label: '4. Movilidad (cambios de posición corporal)',
  type: 'select',
  defaultValue: '4',
  options: [
    { value: '1', label: '1 — Completamente inmóvil', points: 1 },
    { value: '2', label: '2 — Muy limitada', points: 2 },
    { value: '3', label: '3 — Ligeramente limitada', points: 3 },
    { value: '4', label: '4 — Sin limitaciones', points: 4 },
  ],
};

const nutritionField: SelectFieldDef = {
  id: 'nutrition',
  label: '5. Nutrición (patrón habitual de ingesta)',
  type: 'select',
  defaultValue: '4',
  options: [
    { value: '1', label: '1 — Muy pobre', points: 1 },
    { value: '2', label: '2 — Probablemente inadecuada', points: 2 },
    { value: '3', label: '3 — Adecuada', points: 3 },
    { value: '4', label: '4 — Excelente', points: 4 },
  ],
};

const frictionField: SelectFieldDef = {
  id: 'friction',
  label: '6. Fricción y cizallamiento',
  type: 'select',
  defaultValue: '3',
  options: [
    { value: '1', label: '1 — Problema importante (requiere asistencia máxima)', points: 1 },
    { value: '2', label: '2 — Problema potencial (roza al moverse)', points: 2 },
    { value: '3', label: '3 — Sin problema aparente', points: 3 },
  ],
};

export const bradenScaleCalculator: CalculatorDefinition = {
  id: 'braden-scale',
  name: 'Escala de Braden (Riesgo de Lesiones / Úlceras por Presión)',
  shortName: 'Escala de Braden',
  primarySpecialty: 'geriatria',
  secondarySpecialties: ['medicina-interna', 'dermatologia'],
  subcategory: 'gravedad',
  keywords: ['braden', 'ulceras por presion', 'upp', 'escaras', 'geriatria', 'encamado', 'lesiones por presion'],
  description:
    'Evalúa el riesgo de desarrollar lesiones por presión mediante 6 subescalas (6–23 puntos; a menor puntuación, mayor riesgo).',
  clinicalIndication:
    'Valoración periódica en pacientes hospitalizados, geriátricos, en cuidados intensivos o encamados en domicilio.',
  validatedPopulation: 'Adultos hospitalizados, en residencias sociosanitarias y atención domiciliaria.',
  contraindications: [
    'No usar la versión estándar de adultos en neonatos o pediatría pequeña (existe Braden Q).',
  ],
  limitations: [
    'No sustituye la inspección directa diaria de la piel en prominencias óseas ni la evaluación de perfusión tisular en pacientes críticos con vasopresores.',
  ],
  version: 'Bergstrom et al. (1987)',
  references: [
    {
      citation:
        'Bergstrom N, Braden BJ, Laguzza A, Holman V. The Braden Scale for Predicting Pressure Sore Risk. Nurs Res. 1987;36(4):205-210.',
      year: 1987,
    },
  ],
  fields: [sensoryField, moistureField, activityField, mobilityField, nutritionField, frictionField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(bradenScaleCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const total =
      Number(inputs.sensory) +
      Number(inputs.moisture) +
      Number(inputs.activity) +
      Number(inputs.mobility) +
      Number(inputs.nutrition) +
      Number(inputs.friction);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (total >= 19) {
      severity = 'normal';
      riskClassification = `Sin riesgo aparente (${total} / 23 puntos)`;
      clinicalInterpretation = 'Riesgo bajo de lesiones por presión en este momento.';
      guidance = ['Reevaluar periódicamente si cambian movilidad, estado nutricional o hemodinamia.'];
    } else if (total >= 15) {
      severity = 'low';
      riskClassification = `Riesgo leve (${total} / 23 puntos)`;
      clinicalInterpretation = 'Riesgo leve de úlceras por presión (en adultos mayores de 75 años el umbral clínico de riesgo puede considerarse ≤ 18).';
      guidance = ['Cambios posturales regulares, protección de talones, control de humedad y soporte nutricional.'];
    } else if (total >= 13) {
      severity = 'moderate';
      riskClassification = `Riesgo moderado (${total} / 23 puntos)`;
      clinicalInterpretation = 'Riesgo moderado que requiere plan preventivo estructurado.';
      guidance = ['Programa estricto de cambios posturales cada 2–3 horas, superficies especiales de manejo de presión y valoración nutricional.'];
    } else if (total >= 10) {
      severity = 'high';
      riskClassification = `Riesgo alto (${total} / 23 puntos)`;
      clinicalInterpretation = 'Riesgo alto de lesión por presión; requiere medidas preventivas intensivas.';
      guidance = ['Superficie de alivio de presión dinámica/alta especificación, cambios posturales frecuentes, descarga de talones e inspección cutánea diaria.'];
    } else {
      severity = 'critical';
      riskClassification = `Riesgo muy alto / severo (${total} / 23 puntos)`;
      clinicalInterpretation = 'Riesgo crítico de deterioro de la integridad cutánea.';
      guidance = ['Protocolo máximo de prevención de UPP: superficie antiescaras avanzada, movilización asistida sin cizallamiento, cuidado barrera de humedad y optimización proteico-calórica.'];
    }

    return {
      primaryResult: {
        label: 'Puntuación de Braden',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (6–23)',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'En la escala de Braden, menor puntaje equivale a mayor riesgo.',
      formulaUsed: 'Suma de 6 subescalas (Percepción + Humedad + Actividad + Movilidad + Nutrición + Fricción)',
      inputsSummary: `Braden: ${inputs.sensory}+${inputs.moisture}+${inputs.activity}+${inputs.mobility}+${inputs.nutrition}+${inputs.friction} = ${total}/23`,
    };
  },
};
