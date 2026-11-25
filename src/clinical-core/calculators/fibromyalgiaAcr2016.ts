import {
  getCanonicalNumberValue,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SecondaryResultItem,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const wpiField: NumberFieldDef = {
  id: 'wpi',
  label: 'WPI — Índice de Dolor Generalizado (número de áreas dolorosas en la última semana, 0–19)',
  type: 'number',
  canonicalUnit: 'áreas',
  units: [{ id: 'areas', label: 'áreas (0–19)', toCanonical: (v) => v, min: 0, max: 19, step: 1 }],
  defaultUnitId: 'areas',
  defaultValue: '9',
  min: 0,
  max: 19,
  placeholder: '9',
  helpText:
    'Incluye 19 áreas: mandíbula (I/D), cintura escapular (I/D), brazo (I/D), antebrazo (I/D), cadera/glúteo (I/D), muslo (I/D), pierna (I/D), cuello, espalda alta, espalda baja, tórax y abdomen.',
};

const fatigueField: SelectFieldDef = {
  id: 'fatigue',
  label: 'SSS-1 · Fatiga (última semana)',
  type: 'select',
  defaultValue: '2',
  options: [
    { value: '0', label: '0 · Sin problema', points: 0 },
    { value: '1', label: '1 · Leve o intermitente', points: 1 },
    { value: '2', label: '2 · Moderada / considerable (frecuente)', points: 2 },
    { value: '3', label: '3 · Grave / generalizada / continua', points: 3 },
  ],
};

const wakingUnrefreshedField: SelectFieldDef = {
  id: 'wakingUnrefreshed',
  label: 'SSS-2 · Despertar sin descanso / sueño no reparador',
  type: 'select',
  defaultValue: '2',
  options: [
    { value: '0', label: '0 · Sin problema', points: 0 },
    { value: '1', label: '1 · Leve o intermitente', points: 1 },
    { value: '2', label: '2 · Moderado / frecuente', points: 2 },
    { value: '3', label: '3 · Grave / continuo', points: 3 },
  ],
};

const cognitiveField: SelectFieldDef = {
  id: 'cognitive',
  label: 'SSS-3 · Síntomas cognitivos ("fibroniebla", memoria, concentración)',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '0', label: '0 · Sin problema', points: 0 },
    { value: '1', label: '1 · Leve o intermitente', points: 1 },
    { value: '2', label: '2 · Moderado / frecuente', points: 2 },
    { value: '3', label: '3 · Grave / continuo', points: 3 },
  ],
};

const headacheField: BooleanFieldDef = {
  id: 'headache',
  label: 'SSS-4a · Cefalea en los últimos 6 meses (+1)',
  type: 'boolean',
  defaultValue: true,
  trueLabel: 'Sí (+1)',
  falseLabel: 'No',
};

const abdominalPainField: BooleanFieldDef = {
  id: 'abdominalPain',
  label: 'SSS-4b · Dolor o cólicos en abdomen inferior en los últimos 6 meses (+1)',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Sí (+1)',
  falseLabel: 'No',
};

const depressionField: BooleanFieldDef = {
  id: 'depression',
  label: 'SSS-4c · Depresión en los últimos 6 meses (+1)',
  type: 'boolean',
  defaultValue: true,
  trueLabel: 'Sí (+1)',
  falseLabel: 'No',
};

const generalizedRegionsField: BooleanFieldDef = {
  id: 'generalizedRegions',
  label: '¿Dolor generalizado en ≥ 4 de las 5 regiones corporales? (excluida mandíbula, tórax y abdomen)',
  type: 'boolean',
  defaultValue: true,
  trueLabel: 'Sí (≥ 4/5)',
  falseLabel: 'No (< 4/5)',
  helpText: 'Las 5 regiones son: superior izquierda, superior derecha, inferior izquierda, inferior derecha y axial (cuello/espalda).',
};

const duration3MonthsField: BooleanFieldDef = {
  id: 'duration3Months',
  label: '¿Los síntomas han estado presentes a nivel similar durante ≥ 3 meses?',
  type: 'boolean',
  defaultValue: true,
  trueLabel: 'Sí (≥ 3 m)',
  falseLabel: 'No (< 3 m)',
};

export const fibromyalgiaAcr2016Calculator: CalculatorDefinition = {
  id: 'fibromyalgia-acr-2016',
  name: 'Criterios Diagnósticos de Fibromialgia ACR 2016 (WPI + SSS)',
  shortName: 'Fibromialgia ACR 2016',
  primarySpecialty: 'medicina-interna',
  secondarySpecialties: ['traumatologia', 'neurologia'],
  subcategory: 'diagnostico',
  keywords: [
    'fibromialgia',
    'acr 2016',
    'wpi',
    'sss',
    'dolor cronico',
    'dolor generalizado',
    'reumatologia',
    'consulta externa',
  ],
  description:
    'Evalúa los criterios diagnósticos revisados de fibromialgia del American College of Rheumatology (Wolfe et al., 2016) combinando WPI (0–19), SSS (0–12), dolor generalizado (≥ 4/5 regiones) y cronicidad (≥ 3 meses).',
  clinicalIndication:
    'Consulta externa de medicina interna, reumatología y clínica del dolor en pacientes con dolor musculoesquelético crónico difuso, fatiga y sueño no reparador.',
  validatedPopulation: 'Adultos con dolor crónico musculoesquelético difuso.',
  contraindications: [
    'El diagnóstico es clínico y exige descartar imitadores tratables (hipotiroidismo, polimialgia reumática, artritis inflamatoria, miopatía, déficit grave de vitamina D, apnea del sueño).',
  ],
  limitations: [
    'Según ACR 2016, un diagnóstico de fibromialgia es válido independientemente de la coexistencia de otras enfermedades médicas (ya no es un diagnóstico de exclusión absoluta, pero requiere estudio básico).',
    'La puntuación de severidad de fibromialgia (FS = WPI + SSS, de 0 a 31) permite seguir la evolución sintomática en consulta.',
  ],
  version: 'Wolfe et al. · ACR 2016 Revisions',
  references: [
    {
      citation:
        'Wolfe F, Clauw DJ, Fitzcharles MA, et al. 2016 Revisions to the 2010/2011 fibromyalgia diagnostic criteria. Semin Arthritis Rheum. 2016;46(3):319-329.',
      year: 2016,
    },
  ],
  fields: [
    wpiField,
    fatigueField,
    wakingUnrefreshedField,
    cognitiveField,
    headacheField,
    abdominalPainField,
    depressionField,
    generalizedRegionsField,
    duration3MonthsField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(fibromyalgiaAcr2016Calculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const wpi = Math.round(getCanonicalNumberValue(wpiField, inputs.wpi as NumberInputValue).canonicalValue!);
    const sss =
      Number(inputs.fatigue) +
      Number(inputs.wakingUnrefreshed) +
      Number(inputs.cognitive) +
      (inputs.headache ? 1 : 0) +
      (inputs.abdominalPain ? 1 : 0) +
      (inputs.depression ? 1 : 0);

    const fs = wpi + sss;
    const generalized = Boolean(inputs.generalizedRegions);
    const chronic = Boolean(inputs.duration3Months);

    const scoreThresholdMet = (wpi >= 7 && sss >= 5) || (wpi >= 4 && wpi <= 6 && sss >= 9);
    const allCriteriaMet = scoreThresholdMet && generalized && chronic;

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (allCriteriaMet) {
      severity = fs >= 20 ? 'high' : 'moderate';
      riskClassification = `Cumple criterios ACR 2016 de Fibromialgia (FS ${fs}/31)`;
      clinicalInterpretation =
        `Cumple los 3 requisitos ACR 2016: umbral WPI/SSS (${wpi} y ${sss}), dolor generalizado en ≥ 4/5 regiones y duración ≥ 3 meses.`;
      guidance.push(
        'Solicitar estudio básico si no se ha hecho (hemograma, PCR/VSG, TSH, perfil bioquímico/CK) para descartar diagnósticos concomitantes tratables.',
        'Priorizar manejo multimodal no farmacológico (educación terapéutica, ejercicio aeróbico/fuerza gradual, higiene del sueño y terapia cognitivo-conductual) y valorar farmacoterapia dirigida si persiste limitación.',
      );
    } else {
      severity = scoreThresholdMet ? 'low' : 'normal';
      riskClassification = `No cumple criterios ACR 2016 completos (FS ${fs}/31)`;
      const missing: string[] = [];
      if (!scoreThresholdMet) missing.push('umbral WPI/SSS (WPI ≥ 7 + SSS ≥ 5 o WPI 4–6 + SSS ≥ 9)');
      if (!generalized) missing.push('dolor generalizado en ≥ 4/5 regiones');
      if (!chronic) missing.push('duración ≥ 3 meses');
      clinicalInterpretation = `No cumple todos los criterios ACR 2016; falta: ${missing.join(', ')}.`;
      guidance.push(
        'Evaluar dolor regional localizado, trastorno miofascial, artropatía, neuropatía o trastorno del sueño/ánimo según presentación.',
      );
    }

    const secondaryResults: SecondaryResultItem[] = [
      { label: 'WPI (Dolor generalizado)', formattedValue: `${wpi} / 19`, unit: 'áreas' },
      { label: 'SSS (Severidad síntomas)', formattedValue: `${sss} / 12`, unit: 'pts' },
      { label: 'Escala de Severidad (FS = WPI + SSS)', formattedValue: `${fs} / 31`, unit: 'pts' },
    ];

    return {
      primaryResult: {
        label: 'Criterios ACR 2016',
        value: fs,
        formattedValue: allCriteriaMet ? 'Cumple criterios' : 'No cumple',
        unit: `(FS ${fs}/31)`,
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: '(WPI ≥7 y SSS ≥5) O (WPI 4–6 y SSS ≥9) + ≥4/5 regiones + ≥3 meses',
      inputsSummary: `WPI ${wpi}/19 · SSS ${sss}/12 · FS ${fs}/31 · Regiones ≥4/5: ${generalized ? 'Sí' : 'No'} · ≥3m: ${chronic ? 'Sí' : 'No'}`,
    };
  },
};
