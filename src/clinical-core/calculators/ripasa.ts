import {
  formatClinicalNumber,
  roundClinical,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const sexField: SelectFieldDef = {
  id: 'sex',
  label: 'Sexo biológico',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '1', label: 'Masculino (+1.0)', points: 1 },
    { value: '0.5', label: 'Femenino (+0.5)', points: 0.5 },
  ],
};

const ageField: SelectFieldDef = {
  id: 'ageGroup',
  label: 'Edad',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '1', label: '< 40 años (+1.0)', points: 1 },
    { value: '0.5', label: '≥ 40 años (+0.5)', points: 0.5 },
  ],
};

const durationField: SelectFieldDef = {
  id: 'duration',
  label: 'Duración de los síntomas hasta la valoración',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '1', label: '< 48 horas (+1.0)', points: 1 },
    { value: '0.5', label: '≥ 48 horas (+0.5)', points: 0.5 },
  ],
};

const boolCriteria: Array<{ field: BooleanFieldDef; pts: number }> = [
  { field: { id: 'rifPain', label: 'Dolor espontáneo en fosa ilíaca derecha (FID) (+0.5)', type: 'boolean', defaultValue: false }, pts: 0.5 },
  { field: { id: 'migration', label: 'Migración del dolor hacia FID (+0.5)', type: 'boolean', defaultValue: false }, pts: 0.5 },
  { field: { id: 'anorexia', label: 'Anorexia (+1.0)', type: 'boolean', defaultValue: false }, pts: 1.0 },
  { field: { id: 'nausea', label: 'Náuseas o vómitos (+1.0)', type: 'boolean', defaultValue: false }, pts: 1.0 },
  { field: { id: 'tenderness', label: 'Dolor a la palpación en FID (+1.0)', type: 'boolean', defaultValue: false }, pts: 1.0 },
  { field: { id: 'guarding', label: 'Resistencia / defensa muscular en FID (+2.0)', type: 'boolean', defaultValue: false }, pts: 2.0 },
  { field: { id: 'rebound', label: 'Signo de rebote / Blumberg positivo (+1.0)', type: 'boolean', defaultValue: false }, pts: 1.0 },
  { field: { id: 'rovsing', label: 'Signo de Rovsing positivo (+2.0)', type: 'boolean', defaultValue: false }, pts: 2.0 },
  { field: { id: 'fever', label: 'Fiebre (> 37.0 °C y < 39.0 °C) (+1.0)', type: 'boolean', defaultValue: false }, pts: 1.0 },
  { field: { id: 'wbc', label: 'Leucocitosis (+1.0)', type: 'boolean', defaultValue: false }, pts: 1.0 },
  { field: { id: 'negUa', label: 'Examen general de orina (EGO) negativo (+1.0)', type: 'boolean', defaultValue: false }, pts: 1.0 },
  {
    field: {
      id: 'foreignNric',
      label: 'Criterio original Chong: documento de identidad extranjero (+1.0)',
      helpText: 'Parámetro demográfico de la cohorte original de Brunéi; fuera de ese entorno suele dejarse desmarcado (0).',
      type: 'boolean',
      defaultValue: false,
    },
    pts: 1.0,
  },
];

export const ripasaCalculator: CalculatorDefinition = {
  id: 'ripasa',
  name: 'Escala RIPASA (Apendicitis Aguda)',
  shortName: 'RIPASA',
  primarySpecialty: 'cirugia-general',
  secondarySpecialties: ['urgencias'],
  subcategory: 'diagnostico',
  keywords: ['ripasa', 'apendicitis', 'rovsing', 'fid', 'chong', 'cirugia'],
  description:
    'Escala diagnóstica de 15 variables (rango 1.5–16.0 pts) desarrollada para mejorar la sensibilidad frente a Alvarado en sospecha de apendicitis aguda.',
  clinicalIndication:
    'Evaluación de dolor en fosa ilíaca derecha en urgencias, especialmente útil en poblaciones asiáticas y latinoamericanas.',
  validatedPopulation: 'Adolescentes y adultos con dolor en fosa ilíaca derecha sospechoso de apendicitis.',
  requiredLabsNote: 'Requiere biometría hemática (leucocitos) y examen general de orina.',
  contraindications: [
    'No validada como regla única en gestantes ni en lactantes/preescolares.',
  ],
  limitations: [
    'El criterio original "extranjero" (+1.0) proviene del contexto epidemiológico de Brunéi (Chong 2010); en adaptaciones occidentales/latinoamericanas suele omitirse manteniendo el umbral ≥ 7.5.',
    'Aunque ofrece mayor sensibilidad que Alvarado, su especificidad aislada sigue requiriendo confirmación por imagen en casos dudosos.',
  ],
  version: 'Chong CF et al. (Singapore Med J 2010)',
  references: [
    {
      citation: 'Chong CF, Adi MI, Thien A, et al. Development of the RIPASA score: a new appendicitis scoring system for the diagnosis of acute appendicitis. Singapore Med J. 2010;51(3):220-225.',
      year: 2010,
    },
  ],
  fields: [sexField, ageField, durationField, ...boolCriteria.map((c) => c.field)],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(ripasaCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    let score = Number(inputs.sex) + Number(inputs.ageGroup) + Number(inputs.duration);
    for (const item of boolCriteria) {
      if (inputs[item.field.id] === true) score += item.pts;
    }
    score = roundClinical(score, 1);

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (score < 5.0) {
      severity = 'low';
      riskClassification = `Probabilidad baja (< 5.0: ${score.toFixed(1)} pts)`;
      clinicalInterpretation = 'Apendicitis aguda improbable.';
      guidance = ['Valorar diagnósticos diferenciales (urinario, ginecológico, gastroenteritis) y signos de alarma.'];
    } else if (score < 7.5) {
      severity = 'moderate';
      riskClassification = `Probabilidad baja-intermedia (5.0 – 7.0: ${score.toFixed(1)} pts)`;
      clinicalInterpretation = 'Probabilidad intermedia; se recomienda observación activa y estudio de imagen (ecografía/TC) antes de decidir cirugía.';
      guidance = ['Reevaluación clínica seriada y apoyo con ecografía o tomografía abdominal.'];
    } else if (score < 12.0) {
      severity = 'high';
      riskClassification = `Probabilidad alta (7.5 – 11.5: ${score.toFixed(1)} pts)`;
      clinicalInterpretation = 'Supera el punto de corte óptimo (≥ 7.5) para diagnóstico probable de apendicitis aguda.';
      guidance = ['Valoración quirúrgica prioritaria; realizar imagen si existen dudas diagnósticas o riesgo anestésico elevado.'];
    } else {
      severity = 'critical';
      riskClassification = `Probabilidad muy alta / diagnóstica (≥ 12.0: ${score.toFixed(1)} pts)`;
      clinicalInterpretation = 'Cuadro altamente sugestivo de apendicitis aguda establecida.';
      guidance = ['Interconsulta urgente a cirugía general para preparación preoperatoria.'];
    }

    return {
      primaryResult: {
        label: 'Puntuación RIPASA',
        value: score,
        formattedValue: formatClinicalNumber(score, 1),
        unit: 'puntos (de 16)',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'Demografía (sexo, edad) + Síntomas/duración + Signos clínicos + Leucocitos + EGO negativo',
      inputsSummary: `RIPASA: ${score.toFixed(1)} / 16.0 puntos`,
    };
  },
};
