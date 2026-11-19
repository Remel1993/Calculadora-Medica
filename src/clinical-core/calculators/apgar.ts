import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const appearanceField: SelectFieldDef = {
  id: 'appearance',
  label: 'A — Apariencia (Coloración de la piel)',
  type: 'select',
  defaultValue: '2',
  options: [
    { value: '0', label: '0 — Cianosis generalizada o palidez marcada', points: 0 },
    { value: '1', label: '1 — Cuerpo rosado, extremidades cianóticas (acrocianosis)', points: 1 },
    { value: '2', label: '2 — Completamente rosado', points: 2 },
  ],
};

const pulseField: SelectFieldDef = {
  id: 'pulse',
  label: 'P — Pulso (Frecuencia cardíaca)',
  type: 'select',
  defaultValue: '2',
  options: [
    { value: '0', label: '0 — Ausente', points: 0 },
    { value: '1', label: '1 — < 100 lpm', points: 1 },
    { value: '2', label: '2 — ≥ 100 lpm', points: 2 },
  ],
};

const grimaceField: SelectFieldDef = {
  id: 'grimace',
  label: 'G — Gesticulación (Irritabilidad refleja al estímulo)',
  type: 'select',
  defaultValue: '2',
  options: [
    { value: '0', label: '0 — Sin respuesta', points: 0 },
    { value: '1', label: '1 — Mueca o llanto débil al estímulo', points: 1 },
    { value: '2', label: '2 — Llanto vigoroso, tos o estornudo', points: 2 },
  ],
};

const activityField: SelectFieldDef = {
  id: 'activity',
  label: 'A — Actividad (Tono muscular)',
  type: 'select',
  defaultValue: '2',
  options: [
    { value: '0', label: '0 — Flácido / hipotonía marcada', points: 0 },
    { value: '1', label: '1 — Alguna flexión de extremidades', points: 1 },
    { value: '2', label: '2 — Movimiento activo y flexión vigorosa', points: 2 },
  ],
};

const respirationField: SelectFieldDef = {
  id: 'respiration',
  label: 'R — Respiración (Esfuerzo respiratorio)',
  type: 'select',
  defaultValue: '2',
  options: [
    { value: '0', label: '0 — Ausente (apnea)', points: 0 },
    { value: '1', label: '1 — Lenta, irregular o llanto débil', points: 1 },
    { value: '2', label: '2 — Buena, llanto vigoroso', points: 2 },
  ],
};

export const apgarCalculator: CalculatorDefinition = {
  id: 'apgar',
  name: 'Puntuación de Apgar (Adaptación Neonatal)',
  shortName: 'Apgar Neonatal',
  primarySpecialty: 'gineco-obstetricia',
  secondarySpecialties: ['pediatria'],
  subcategory: 'gravedad',
  keywords: ['apgar', 'neonato', 'recien nacido', 'reanimacion neonatal', 'parto'],
  description:
    'Evaluación estandarizada de la vitalidad y adaptación extrauterina del recién nacido al 1.º y 5.º minuto de vida (0–10 puntos).',
  clinicalIndication:
    'Documentación universal del estado fisiológico del recién nacido al minuto 1 y 5 (y cada 5 min hasta minuto 20 si < 7) para evaluar respuesta a la estabilización.',
  validatedPopulation: 'Recién nacidos inmediatamente tras el nacimiento (en prematuros puede ser fisiológicamente menor por inmadurez del tono/reflejos).',
  contraindications: [
    'CRÍTICO (Guías AAP/AHA NRP): NO esperar al puntaje de Apgar del primer minuto para iniciar la reanimación neonatal; las maniobras de estabilización se deciden en los primeros 30–60 s según respiración, tono y FC.',
  ],
  limitations: [
    'Un Apgar bajo al minuto 1 no predice por sí solo daño neurológico a largo plazo ni define asfixia perinatal (la cual requiere además acidemia metabólica en cordón y encefalopatía neonatal).',
    'Anestesia materna, prematuridad, malformaciones congénitas o succión vigorosa pueden reducir el puntaje independientemente de hipoxia.',
  ],
  version: 'Apgar V (1953) / Consenso AAP-ACOG 2015',
  references: [
    {
      citation: 'Apgar V. A proposal for a new method of evaluation of the newborn infant. Curr Res Anesth Analg. 1953;32(4):260-267.',
      year: 1953,
    },
    {
      citation: 'American Academy of Pediatrics Committee on Fetus and Newborn; ACOG Committee on Obstetric Practice. The Apgar Score. Pediatrics. 2015;136(4):819-822.',
      year: 2015,
    },
  ],
  fields: [appearanceField, pulseField, grimaceField, activityField, respirationField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(apgarCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const total =
      Number(inputs.appearance) +
      Number(inputs.pulse) +
      Number(inputs.grimace) +
      Number(inputs.activity) +
      Number(inputs.respiration);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (total >= 7) {
      severity = 'normal';
      riskClassification = `Adaptación neonatal adecuada (${total} / 10 puntos)`;
      clinicalInterpretation = 'Recién nacido vigoroso con buena transición cardiorrespiratoria.';
      guidance = ['Cuidados neonatales de rutina (calor, secado, contacto piel con piel si procede) y reevaluación al minuto 5.'];
    } else if (total >= 4) {
      severity = 'moderate';
      riskClassification = `Depresión neonatal moderada (${total} / 10 puntos)`;
      clinicalInterpretation = 'Transición comprometida que requiere apoyo de estabilización inmediata y monitorización.';
      guidance = ['Aplicar pasos iniciales de reanimación neonatal NRP (aspiración solo si obstrucción, estimulación, ventilación con presión positiva si apnea/FC < 100) y repetir Apgar cada 5 min hasta ≥ 7.'];
    } else {
      severity = 'critical';
      riskClassification = `Depresión neonatal grave (${total} / 10 puntos)`;
      clinicalInterpretation = 'Compromiso cardiorrespiratorio severo al nacimiento.';
      guidance = ['Reanimación neonatal avanzada inmediata según algoritmo NRP (VPP efectiva, valoración de intubación/compresiones si FC < 60 lpm pese a ventilación) y gasometría de cordón si persiste bajo al min 5.'];
    }

    return {
      primaryResult: {
        label: 'Puntuación de Apgar',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 10)',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'Apariencia (0–2) + Pulso (0–2) + Gesticulación (0–2) + Actividad (0–2) + Respiración (0–2)',
      inputsSummary: `Apgar: ${total} / 10 (A:${inputs.appearance} P:${inputs.pulse} G:${inputs.grimace} A:${inputs.activity} R:${inputs.respiration})`,
    };
  },
};
