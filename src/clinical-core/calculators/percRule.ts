import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
} from '../types/clinical.ts';

const fields: BooleanFieldDef[] = [
  { id: 'age50', label: 'Edad ≥ 50 años', type: 'boolean', defaultValue: false },
  { id: 'hr100', label: 'Frecuencia cardíaca ≥ 100 lpm', type: 'boolean', defaultValue: false },
  { id: 'spo2', label: 'Saturación de O₂ (SpO₂) < 95 % al aire ambiente', type: 'boolean', defaultValue: false },
  { id: 'legSwelling', label: 'Edema unilateral de extremidad inferior', type: 'boolean', defaultValue: false },
  { id: 'hemoptysis', label: 'Hemoptisis', type: 'boolean', defaultValue: false },
  { id: 'surgeryTrauma', label: 'Cirugía o traumatismo reciente (últimas 4 semanas)', type: 'boolean', defaultValue: false },
  { id: 'priorVte', label: 'Antecedente de TVP o TEP previo', type: 'boolean', defaultValue: false },
  { id: 'estrogen', label: 'Uso exógeno de estrógenos (anticonceptivos, TRH)', type: 'boolean', defaultValue: false },
];

export const percRuleCalculator: CalculatorDefinition = {
  id: 'perc-rule',
  name: 'Regla PERC (Pulmonary Embolism Rule-out Criteria)',
  shortName: 'PERC Rule',
  primarySpecialty: 'urgencias',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'diagnostico',
  keywords: ['perc', 'tep', 'embolia pulmonar', 'exclusion', 'dimero d'],
  description:
    'Criterios de exclusión clínica para descartar tromboembolia pulmonar sin necesidad de Dímero D ni imagen cuando la probabilidad pretest es muy baja.',
  clinicalIndication:
    'Pacientes en urgencias con sospecha de TEP en los que el clínico estima una probabilidad pretest baja (< 15 %).',
  validatedPopulation: 'Adultos en urgencias con probabilidad clínica previa baja (< 15 %) de TEP.',
  contraindications: [
    'NO aplicar si el clínico estima probabilidad pretest intermedia o alta (≥ 15 %): un PERC negativo en probabilidad moderada/alta NO excluye TEP.',
    'No validada en embarazadas ni en pacientes hospitalizados con múltiples comorbilidades.',
  ],
  limitations: [
    'Solo es válida cuando los 8 criterios son simultáneamente negativos (0 puntos).',
    'Con ≥ 1 criterio positivo, la regla no confirma TEP, sino que indica continuar el algoritmo diagnóstico (p. ej. Dímero D o Wells).',
  ],
  version: 'Kline et al. (2004 / 2008)',
  references: [
    {
      citation:
        'Kline JA, Courtney DM, Kabrhel C, et al. Prospective multicenter evaluation of the pulmonary embolism rule-out criteria. J Thromb Haemost. 2008;6(5):772-780.',
      year: 2008,
    },
  ],
  fields,
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(percRuleCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    let count = 0;
    for (const f of fields) {
      if (inputs[f.id] === true) count += 1;
    }

    if (count === 0) {
      return {
        primaryResult: {
          label: 'Criterios PERC positivos',
          value: 0,
          formattedValue: '0 / 8 (PERC Negativo)',
          unit: 'criterios',
        },
        severity: 'normal',
        riskClassification: 'PERC Negativo — Exclusión clínica en probabilidad baja',
        clinicalInterpretation:
          'Todos los criterios están ausentes. En un paciente con probabilidad clínica pretest baja (< 15 %), el riesgo residual de TEP es < 2 % y no requiere Dímero D.',
        guidance: [
          'Investigar diagnósticos alternativos de los síntomas (dolor torácico musculoesquelético, ansiedad, infección respiratoria, etc.).',
        ],
        guidanceDisclaimer: 'Válido únicamente si la impresión clínica previa era de baja probabilidad.',
        formulaUsed: 'Negativo solo si los 8 criterios están ausentes (0 / 8)',
        inputsSummary: '0 de 8 criterios presentes',
      };
    }

    return {
      primaryResult: {
        label: 'Criterios PERC positivos',
        value: count,
        formattedValue: `${count} / 8 (PERC Positivo)`,
        unit: 'criterios',
      },
      severity: 'moderate',
      riskClassification: `PERC Positivo (${count} criterio${count > 1 ? 's' : ''}) — No excluye TEP`,
      clinicalInterpretation:
        'Al estar presente al menos un criterio PERC, no se puede descartar TEP clínicamente mediante esta regla (esto NO significa que el paciente tenga TEP).',
      guidance: [
        'Aplicar escala de Wells para TEP y solicitar Dímero D o estudio de imagen según probabilidad pretest.',
      ],
      formulaUsed: 'Positivo si ≥ 1 de 8 criterios está presente',
      inputsSummary: `${count} de 8 criterios presentes`,
    };
  },
};
