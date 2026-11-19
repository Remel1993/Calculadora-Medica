import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SeverityLevel,
} from '../types/clinical.ts';

const fields: BooleanFieldDef[] = [
  {
    id: 'sex',
    label: 'S — Sexo masculino',
    type: 'boolean',
    trueLabel: 'Sí (+1)',
    falseLabel: 'No (0)',
    pointsWhenTrue: 1,
    defaultValue: false,
  },
  {
    id: 'age',
    label: 'A — Edad < 19 años o > 45 años',
    type: 'boolean',
    trueLabel: 'Sí (+1)',
    falseLabel: 'No (0)',
    pointsWhenTrue: 1,
    defaultValue: false,
  },
  {
    id: 'depression',
    label: 'D — Depresión o desesperanza',
    type: 'boolean',
    trueLabel: 'Sí (+1)',
    falseLabel: 'No (0)',
    pointsWhenTrue: 1,
    defaultValue: false,
  },
  {
    id: 'previousAttempt',
    label: 'P — Intento de suicidio previo o atención psiquiátrica previa',
    type: 'boolean',
    trueLabel: 'Sí (+1)',
    falseLabel: 'No (0)',
    pointsWhenTrue: 1,
    defaultValue: false,
  },
  {
    id: 'ethanol',
    label: 'E — Consumo excesivo de alcohol u otras drogas',
    type: 'boolean',
    trueLabel: 'Sí (+1)',
    falseLabel: 'No (0)',
    pointsWhenTrue: 1,
    defaultValue: false,
  },
  {
    id: 'rationalLoss',
    label: 'R — Pérdida del pensamiento racional (psicosis, intoxicación aguda, delirio)',
    type: 'boolean',
    trueLabel: 'Sí (+1)',
    falseLabel: 'No (0)',
    pointsWhenTrue: 1,
    defaultValue: false,
  },
  {
    id: 'socialSupport',
    label: 'S — Falta de soporte social (aislamiento, pérdida reciente)',
    type: 'boolean',
    trueLabel: 'Sí (+1)',
    falseLabel: 'No (0)',
    pointsWhenTrue: 1,
    defaultValue: false,
  },
  {
    id: 'organizedPlan',
    label: 'O — Plan suicida organizado o letalidad alta',
    type: 'boolean',
    trueLabel: 'Sí (+1)',
    falseLabel: 'No (0)',
    pointsWhenTrue: 1,
    defaultValue: false,
  },
  {
    id: 'noSpouse',
    label: 'N — Sin pareja estable (soltero, divorciado, viudo)',
    type: 'boolean',
    trueLabel: 'Sí (+1)',
    falseLabel: 'No (0)',
    pointsWhenTrue: 1,
    defaultValue: false,
  },
  {
    id: 'sickness',
    label: 'S — Enfermedad médica crónica, dolorosa o incapacitante',
    type: 'boolean',
    trueLabel: 'Sí (+1)',
    falseLabel: 'No (0)',
    pointsWhenTrue: 1,
    defaultValue: false,
  },
];

export const sadPersonsCalculator: CalculatorDefinition = {
  id: 'sad-persons',
  name: 'Escala SAD PERSONS (Evaluación de Riesgo Suicida)',
  shortName: 'SAD PERSONS',
  primarySpecialty: 'psiquiatria',
  secondarySpecialties: ['urgencias', 'medicina-interna'],
  subcategory: 'gravedad',
  keywords: [
    'sad persons',
    'suicidio',
    'riesgo suicida',
    'autolesion',
    'ideacion',
    'patterson',
    'psiquiatria',
  ],
  description:
    'Regla mnemotécnica clásica de 10 factores de riesgo (0–10 puntos) para apoyar la evaluación estructurada inicial del riesgo suicida.',
  clinicalIndication:
    'Estructuración rápida de factores de riesgo en urgencias y consulta externa ante ideación o conducta autolesiva.',
  validatedPopulation: 'Adultos evaluados en urgencias o consulta médica (Patterson et al., 1983).',
  contraindications: [
    'NUNCA dar el alta basándose únicamente en un puntaje bajo de SAD PERSONS si el paciente presenta ideación activa, plan organizado, acceso a medios letales o intento reciente.',
  ],
  limitations: [
    'Revisiones sistemáticas (Warden et al. 2014; NICE) advierten baja sensibilidad para predecir suicidio consumado o repetición a corto plazo cuando se usa de forma aislada.',
    'La existencia de plan organizado, intento previo de alta letalidad o pérdida del pensamiento racional exige valoración psiquiátrica urgente aunque el puntaje total sea < 5.',
  ],
  version: 'Patterson et al. (1983)',
  references: [
    {
      citation:
        'Patterson WM, Dohn HH, Bird J, Patterson GA. Evaluation of suicidal patients: the SAD PERSONS scale. Psychosomatics. 1983;24(4):343-349.',
      year: 1983,
    },
    {
      citation:
        'Warden S, Spiwak R, Sareen J, Bolton JM. The SAD PERSONS scale for suicide risk assessment: a systematic review. Arch Suicide Res. 2014;18(4):313-326.',
      year: 2014,
    },
  ],
  fields,
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(sadPersonsCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const total = fields.reduce((sum, f) => sum + (inputs[f.id] === true ? 1 : 0), 0);
    const hasCriticalRedFlag =
      inputs.organizedPlan === true ||
      inputs.previousAttempt === true ||
      inputs.rationalLoss === true;

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (total <= 2 && !hasCriticalRedFlag) {
      severity = 'low';
      riskClassification = `Riesgo bajo en escala (${total} / 10 puntos)`;
      clinicalInterpretation =
        'Pocos factores demográficos/clínicos acumulados en la escala clásica.';
      guidance = [
        'Confirmar ausencia de ideación activa o acceso a medios letales mediante entrevista clínica directa; seguimiento ambulatorio y plan de seguridad.',
      ];
    } else if (total <= 4 && !hasCriticalRedFlag) {
      severity = 'moderate';
      riskClassification = `Riesgo bajo-moderado (${total} / 10 puntos)`;
      clinicalInterpretation =
        'Acumulación moderada de factores de riesgo que amerita seguimiento cercano.';
      guidance = [
        'Valoración psicosocial, involucrar red familiar de apoyo (con consentimiento/seguridad), restringir medios letales y cita prioritaria en salud mental.',
      ];
    } else if (total <= 6) {
      severity = 'high';
      riskClassification = `Riesgo moderado-alto (${total} / 10 puntos${hasCriticalRedFlag ? ' · bandera roja crítica' : ''})`;
      clinicalInterpretation =
        'Riesgo clínicamente significativo que en la escala original orienta a considerar observación o ingreso según criterio clínico.';
      guidance = [
        'Mantener observación continua en entorno seguro hasta valoración psiquiátrica formal; no dejar solo al paciente.',
      ];
    } else {
      severity = 'critical';
      riskClassification = `Riesgo alto (${total} / 10 puntos)`;
      clinicalInterpretation =
        'Múltiples factores de riesgo de conducta suicida grave; alta probabilidad de requerir ingreso o contención especializada.';
      guidance = [
        'Vigilancia estrecha ininterrumpida, retiro de objetos de riesgo e interconsulta psiquiátrica urgente para hospitalización/manejo intensivo.',
      ];
    }

    if (hasCriticalRedFlag && total <= 4) {
      severity = 'high';
      riskClassification = `Alerta clínica prioritaria (${total} / 10 pts · plan/intento/psicosis presente)`;
      guidance = [
        'La presencia de plan organizado, intento previo o pérdida de juicio anula un puntaje bajo: requiere evaluación psiquiátrica presencial antes de definir egreso.',
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación SAD PERSONS',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 10)',
      },
      secondaryResults: [
        {
          label: 'Banderas rojas críticas (plan / intento previo / psicosis)',
          formattedValue: hasCriticalRedFlag ? 'Presentes' : 'Ausentes',
          unit: '',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer:
        'Las guías NICE y psiquiátricas recomiendan usar escalas solo como complemento a la entrevista clínica integral y plan de seguridad.',
      formulaUsed: 'Suma de 10 criterios dicotómicos (1 punto cada uno)',
      inputsSummary: `SAD PERSONS: ${total}/10 (Banderas rojas: ${hasCriticalRedFlag ? 'Sí' : 'No'})`,
    };
  },
};
