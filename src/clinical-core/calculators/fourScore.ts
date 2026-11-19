import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const eyeField: SelectFieldDef = {
  id: 'eye',
  label: 'E — Respuesta ocular',
  type: 'select',
  defaultValue: '4',
  options: [
    { value: '4', label: '4 — Párpados abiertos, sigue objetos o parpadea a la orden', points: 4 },
    { value: '3', label: '3 — Párpados abiertos pero no sigue objetos', points: 3 },
    { value: '2', label: '2 — Párpados cerrados, pero abre a voz alta', points: 2 },
    { value: '1', label: '1 — Párpados cerrados, pero abre al dolor', points: 1 },
    { value: '0', label: '0 — Párpados permanecen cerrados incluso con dolor', points: 0 },
  ],
};

const motorField: SelectFieldDef = {
  id: 'motor',
  label: 'M — Respuesta motora',
  type: 'select',
  defaultValue: '4',
  options: [
    { value: '4', label: '4 — Pulgar arriba, puño o signo de la paz a la orden', points: 4 },
    { value: '3', label: '3 — Localiza el estímulo doloroso', points: 3 },
    { value: '2', label: '2 — Respuesta en flexión al dolor', points: 2 },
    { value: '1', label: '1 — Respuesta en extensión al dolor', points: 1 },
    { value: '0', label: '0 — Sin respuesta al dolor o estatus mioclónico generalizado', points: 0 },
  ],
};

const brainstemField: SelectFieldDef = {
  id: 'brainstem',
  label: 'B — Reflejos del tronco encefálico',
  type: 'select',
  defaultValue: '4',
  options: [
    { value: '4', label: '4 — Reflejos fotomotor y corneal presentes', points: 4 },
    { value: '3', label: '3 — Una pupila midriática y arreactiva', points: 3 },
    { value: '2', label: '2 — Reflejos fotomotor o corneal ausentes', points: 2 },
    { value: '1', label: '1 — Reflejos fotomotor y corneal ausentes', points: 1 },
    { value: '0', label: '0 — Reflejos fotomotor, corneal y tusígeno ausentes', points: 0 },
  ],
};

const respField: SelectFieldDef = {
  id: 'respiration',
  label: 'R — Patrón respiratorio',
  type: 'select',
  defaultValue: '4',
  options: [
    { value: '4', label: '4 — No intubado, respiración regular', points: 4 },
    { value: '3', label: '3 — No intubado, respiración de Cheyne-Stokes', points: 3 },
    { value: '2', label: '2 — No intubado, respiración irregular', points: 2 },
    { value: '1', label: '1 — Intubado, respira por encima de la frecuencia del ventilador', points: 1 },
    { value: '0', label: '0 — Intubado, respira a frecuencia del ventilador o apnea', points: 0 },
  ],
};

export const fourScoreCalculator: CalculatorDefinition = {
  id: 'four-score',
  name: 'FOUR Score (Full Outline of UnResponsiveness)',
  shortName: 'FOUR Score',
  primarySpecialty: 'neurologia',
  secondarySpecialties: ['urgencias'],
  subcategory: 'gravedad',
  keywords: ['four', 'four score', 'coma', 'intubado', 'tronco encefalico', 'wijdicks', 'uci'],
  description:
    'Escala de coma de 4 dominios (0–16 pts) que prescinde del componente verbal e incorpora reflejos de tronco y respiración, ideal en pacientes intubados.',
  clinicalIndication:
    'Evaluación neurológica en pacientes intubados, con afasia o en estado de coma profundo en UCI y urgencias.',
  validatedPopulation: 'Adultos y pacientes críticos neurointensivos (validada también en cohortes pediátricas).',
  contraindications: [
    'Bloqueo neuromuscular farmacológico o sedación profunda no revertida invalidan la evaluación motora y de reflejos.',
  ],
  limitations: [
    'Un FOUR Score de 0 puntos (E0 M0 B0 R0) orienta a disfunción troncal extrema y debe activar la valoración protocolaria de muerte encefálica, pero NO equivale por sí solo al diagnóstico de muerte encefálica (requiere excluir confusores y pruebas formales de apnea/reflejos completos).',
  ],
  version: 'Wijdicks EFM et al. (Ann Neurol 2005)',
  references: [
    {
      citation:
        'Wijdicks EF, Bamlet WR, Maramattom BV, Manno EM, McClelland RL. Validation of a new coma scale: The FOUR score. Ann Neurol. 2005;58(4):585-593.',
      year: 2005,
    },
  ],
  fields: [eyeField, motorField, brainstemField, respField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(fourScoreCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const e = Number(inputs.eye);
    const m = Number(inputs.motor);
    const b = Number(inputs.brainstem);
    const r = Number(inputs.respiration);
    const total = e + m + b + r;

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (total === 16) {
      severity = 'normal';
      riskClassification = 'Estado neurológico íntegro (16 / 16 puntos)';
      clinicalInterpretation = 'Respuesta ocular, motora, de tronco encefálico y respiración conservadas.';
    } else if (total >= 12) {
      severity = 'low';
      riskClassification = `Alteración leve-moderada (${total} / 16 puntos)`;
      clinicalInterpretation = 'Reflejos de tronco habitualmente conservados; vigilar evolución clínica.';
    } else if (total >= 8) {
      severity = 'high';
      riskClassification = `Alteración grave (${total} / 16 puntos)`;
      clinicalInterpretation =
        'Deterioro significativo del nivel de conciencia; puntuaciones ≤ 8–9 se asocian a mayor mortalidad y necesidad de soporte en UCI.';
    } else {
      severity = 'critical';
      riskClassification = `Coma profundo / Disfunción crítica (${total} / 16 puntos)`;
      clinicalInterpretation =
        total === 0
          ? 'Ausencia completa de respuestas en los 4 dominios (E0 M0 B0 R0). Descartar hipotermia/sedantes/metabólico y aplicar protocolo formal de tronco.'
          : 'Compromiso neurológico crítico con alta mortalidad hospitalaria y riesgo de herniación/disfunción troncal.';
    }

    return {
      primaryResult: {
        label: 'Puntuación FOUR Score',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 16)',
      },
      secondaryResults: [
        { label: 'Desglose (E · M · B · R)', formattedValue: `E${e} M${m} B${b} R${r}`, unit: '' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      formulaUsed: 'E (0–4) + M (0–4) + B (0–4) + R (0–4)',
      inputsSummary: `E${e} M${m} B${b} R${r} (Total: ${total}/16)`,
    };
  },
};
