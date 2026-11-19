import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const nyhaClassField: SelectFieldDef = {
  id: 'nyhaClass',
  label: 'Limitación funcional por síntomas de insuficiencia cardíaca (disnea, fatiga o palpitaciones)',
  type: 'select',
  defaultValue: 'I',
  options: [
    {
      value: 'I',
      label: 'Clase I — Sin limitación física',
      description: 'La actividad física ordinaria no provoca disnea, fatiga ni palpitaciones.',
    },
    {
      value: 'II',
      label: 'Clase II — Limitación leve',
      description: 'Confortable en reposo, pero la actividad física ordinaria produce síntomas.',
    },
    {
      value: 'III',
      label: 'Clase III — Limitación marcada',
      description: 'Confortable en reposo, pero actividades menores que las ordinarias provocan síntomas.',
    },
    {
      value: 'IV',
      label: 'Clase IV — Incapacidad o síntomas en reposo',
      description: 'Incapacidad para cualquier actividad física sin molestias; síntomas presentes incluso en reposo.',
    },
  ],
};

export const nyhaCalculator: CalculatorDefinition = {
  id: 'nyha',
  name: 'Clasificación Funcional NYHA (New York Heart Association)',
  shortName: 'NYHA',
  primarySpecialty: 'cardiologia',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'diagnostico',
  keywords: ['nyha', 'insuficiencia cardiaca', 'clase funcional', 'disnea', 'cardiologia'],
  description: 'Clasificación clínica estándar (I–IV) de la capacidad funcional en pacientes con insuficiencia cardíaca.',
  clinicalIndication: 'Seguimiento evolutivo y documentación estandarizada de síntomas en insuficiencia cardíaca.',
  validatedPopulation: 'Adultos con diagnóstico establecido de insuficiencia cardíaca.',
  contraindications: ['No reemplaza la fracción de eyección (FEVI), péptidos natriuréticos ni pruebas objetivas de capacidad funcional.'],
  limitations: [
    'Evaluación subjetiva sujeta a variabilidad interobservador y adaptación conductual del paciente (reducir actividad para evitar síntomas).',
  ],
  version: 'NYHA Functional Classification (1994 rev.)',
  references: [
    {
      citation:
        'The Criteria Committee of the New York Heart Association. Nomenclature and Criteria for Diagnosis of Diseases of the Heart and Great Vessels. 9th ed. Little, Brown & Co; 1994.',
      year: 1994,
    },
  ],
  fields: [nyhaClassField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(nyhaCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const cls = inputs.nyhaClass as string;
    const map: Record<
      string,
      { num: number; severity: SeverityLevel; risk: string; interp: string }
    > = {
      I: {
        num: 1,
        severity: 'normal',
        risk: 'NYHA Clase funcional I',
        interp: 'Sin limitación funcional para la actividad habitual. Mantener tratamiento modificador de enfermedad según fenotipo de FEVI.',
      },
      II: {
        num: 2,
        severity: 'low',
        risk: 'NYHA Clase funcional II',
        interp: 'Limitación leve. Evaluar optimización terapéutica de cuatro pilares (ICFEr) y adherencia.',
      },
      III: {
        num: 3,
        severity: 'high',
        risk: 'NYHA Clase funcional III',
        interp: 'Limitación física marcada; mayor riesgo de hospitalización y mortalidad. Valorar optimización de terapia médica, dispositivos o rehabilitación.',
      },
      IV: {
        num: 4,
        severity: 'critical',
        risk: 'NYHA Clase funcional IV',
        interp: 'Insuficiencia cardíaca sintomática en reposo o con mínimo esfuerzo. Evaluar signos de congestión/hipoperfusión y valoración por unidad especializada de IC avanzada.',
      },
    };

    const selected = map[cls] ?? map.I;
    return {
      primaryResult: {
        label: 'Clasificación NYHA',
        value: selected.num,
        formattedValue: `Clase ${cls}`,
        unit: 'de IV',
      },
      severity: selected.severity,
      riskClassification: selected.risk,
      clinicalInterpretation: selected.interp,
      formulaUsed: 'Clasificación clínica categórica I – IV basada en umbral de esfuerzo sintomático',
      inputsSummary: `Clase seleccionada: NYHA ${cls}`,
    };
  },
};
