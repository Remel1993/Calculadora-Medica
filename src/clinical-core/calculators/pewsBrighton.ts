import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const behaviorField: SelectFieldDef = {
  id: 'behavior',
  label: '1. Conducta / Estado neurológico',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Jugando o comportamiento apropiado para la edad', points: 0 },
    { value: '1', label: '1 — Dormido', points: 1 },
    { value: '2', label: '2 — Irritable', points: 2 },
    { value: '3', label: '3 — Letárgico, confuso o respuesta reducida al dolor', points: 3 },
  ],
};

const cardioField: SelectFieldDef = {
  id: 'cardiovascular',
  label: '2. Cardiovascular',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Sonrosado o llenado capilar 1 – 2 segundos', points: 0 },
    { value: '1', label: '1 — Pálido o llenado capilar 3 segundos', points: 1 },
    { value: '2', label: '2 — Grisáceo, llenado capilar 4 s o taquicardia > 20 lpm sobre el límite normal para la edad', points: 2 },
    { value: '3', label: '3 — Grisáceo/moteado, llenado capilar ≥ 5 s, taquicardia > 30 lpm sobre lo normal o bradicardia', points: 3 },
  ],
};

const respField: SelectFieldDef = {
  id: 'respiratory',
  label: '3. Respiratorio',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Parámetros normales para la edad, sin retracciones ni tiraje', points: 0 },
    { value: '1', label: '1 — FR > 10 rpm sobre lo normal, uso de músculos accesorios o FiO₂ > 30 % (≥ 3 L/min)', points: 1 },
    { value: '2', label: '2 — FR > 20 rpm sobre lo normal, retracciones/tiraje o FiO₂ ≥ 40 % (≥ 6 L/min)', points: 2 },
    { value: '3', label: '3 — FR ≥ 5 rpm por debajo de lo normal con retracciones/quejido, o FiO₂ ≥ 50 % (≥ 8 L/min)', points: 3 },
  ],
};

const nebField: BooleanFieldDef = {
  id: 'nebulizers',
  label: 'Modificador (+2): Nebulizaciones continuas o cada 15–20 minutos',
  type: 'boolean',
  defaultValue: false,
};

const vomitField: BooleanFieldDef = {
  id: 'postopVomiting',
  label: 'Modificador (+2): Vómitos persistentes posoperatorios',
  type: 'boolean',
  defaultValue: false,
};

export const pewsBrightonCalculator: CalculatorDefinition = {
  id: 'pews-brighton',
  name: 'PEWS (Pediatric Early Warning Score — Brighton)',
  shortName: 'PEWS (Brighton)',
  primarySpecialty: 'pediatria',
  secondarySpecialties: ['urgencias'],
  subcategory: 'gravedad',
  keywords: ['pews', 'brighton', 'monaghan', 'alerta temprana', 'deterioro pediatrico', 'ucip'],
  description:
    'Sistema de alerta temprana pediátrica (Monaghan 2005) en 3 dominios clínicos (0–9 pts) más modificadores por broncoespasmo refractario o vómito posoperatorio (máx. 13 pts).',
  clinicalIndication:
    'Detección temprana de deterioro clínico y necesidad de escalamiento asistencial o ingreso a UCIP en niños hospitalizados o en urgencias.',
  validatedPopulation: 'Población pediátrica (0 – 16 años) usando rangos normales de FC y FR específicos para su edad.',
  contraindications: [
    'No sustituye el juicio clínico directo ante signos evidentes de choque o insuficiencia respiratoria inminente.',
  ],
  limitations: [
    'Existen múltiples variantes locales de PEWS (Brighton, Bedside PEWS de Parshuram, etc.); esta implementación corresponde fielmente al Brighton PEWS clásico de Monaghan (2005).',
    'Una puntuación baja no descarta deterioro si existe un parámetro aislado en +3.',
  ],
  version: 'Brighton PEWS (Monaghan A, Paediatr Nurs 2005)',
  references: [
    {
      citation: 'Monaghan A. Detecting and managing deterioration in children. Paediatr Nurs. 2005;17(1):32-35.',
      year: 2005,
    },
  ],
  fields: [behaviorField, cardioField, respField, nebField, vomitField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(pewsBrightonCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const b = Number(inputs.behavior);
    const c = Number(inputs.cardiovascular);
    const r = Number(inputs.respiratory);
    const mods = (inputs.nebulizers === true ? 2 : 0) + (inputs.postopVomiting === true ? 2 : 0);
    const total = b + c + r + mods;
    const hasSingle3 = b === 3 || c === 3 || r === 3;

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (total >= 5) {
      severity = 'critical';
      riskClassification = `PEWS Alto (${total} / 13 puntos)`;
      clinicalInterpretation = 'Alto riesgo de deterioro clínico agudo y probable requerimiento de cuidados intensivos pediátricos.';
      guidance = ['Evaluación médica inmediata a pie de cama, monitorización continua y activar equipo de respuesta rápida / UCIP según protocolo.'];
    } else if (total >= 3 || hasSingle3) {
      severity = 'high';
      riskClassification = `PEWS Moderado / Alerta (${total} / 13 puntos${hasSingle3 ? ' · dominio en +3' : ''})`;
      clinicalInterpretation = 'Signos de deterioro clínico incipiente o compromiso relevante de al menos un sistema.';
      guidance = ['Valoración pediátrica prioritaria, aumentar frecuencia de vigilancia de constantes y reevaluar respuesta terapéutica.'];
    } else if (total >= 1) {
      severity = 'low';
      riskClassification = `PEWS Bajo (${total} / 13 puntos)`;
      clinicalInterpretation = 'Alteración leve; mantener vigilancia clínica periódica.';
      guidance = ['Reevaluar constantes según pauta de hospitalización/observación.'];
    } else {
      severity = 'normal';
      riskClassification = 'PEWS 0 puntos (Estable)';
      clinicalInterpretation = 'Sin datos de alerta temprana en los dominios evaluados.';
    }

    return {
      primaryResult: {
        label: 'Puntuación PEWS (Brighton)',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 13)',
      },
      secondaryResults: [
        { label: 'Desglose (Cond · CV · Resp + Mod)', formattedValue: `${b} · ${c} · ${r}${mods > 0 ? ` (+${mods})` : ''}`, unit: 'pts' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: guidance.length > 0 ? guidance : undefined,
      formulaUsed: 'Conducta (0–3) + Cardiovascular (0–3) + Respiratorio (0–3) + Modificadores (+2 c/u)',
      inputsSummary: `Cond:${b} CV:${c} Resp:${r} Mod:+${mods} (Total: ${total})`,
    };
  },
};
