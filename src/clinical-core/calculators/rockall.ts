import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const modeField: SelectFieldDef = {
  id: 'mode',
  label: 'Modalidad de evaluación',
  type: 'select',
  defaultValue: 'complete',
  options: [
    { value: 'pre', label: 'Pre-endoscópico (0–7)' },
    { value: 'complete', label: 'Completo con endoscopia (0–11)' },
  ],
};

const ageField: SelectFieldDef = {
  id: 'age',
  label: 'Edad del paciente',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '< 60 años (0)', points: 0 },
    { value: '1', label: '60 – 79 años (+1)', points: 1 },
    { value: '2', label: '≥ 80 años (+2)', points: 2 },
  ],
};

const shockField: SelectFieldDef = {
  id: 'shock',
  label: 'Estado hemodinámico (Shock)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Sin shock: PAS ≥ 100 y FC < 100 (0)', points: 0 },
    { value: '1', label: 'Taquicardia: PAS ≥ 100 y FC ≥ 100 (+1)', points: 1 },
    { value: '2', label: 'Hipotensión: PAS < 100 mmHg (+2)', points: 2 },
  ],
};

const comorbidityField: SelectFieldDef = {
  id: 'comorbidity',
  label: 'Comorbilidades mayores',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Ninguna comorbilidad mayor (0)', points: 0 },
    { value: '2', label: 'Cardiopatía isquémica, IC u otra mayor (+2)', points: 2 },
    { value: '3', label: 'Insuficiencia renal, hepática o cáncer diseminado (+3)', points: 3 },
  ],
};

const diagnosisField: SelectFieldDef = {
  id: 'diagnosis',
  label: 'Diagnóstico endoscópico',
  type: 'select',
  defaultValue: '0',
  visibleWhen: (inputs) => inputs.mode === 'complete',
  options: [
    { value: '0', label: 'Mallory-Weiss o sin lesión ni estigmas (0)', points: 0 },
    { value: '1', label: 'Todos los demás diagnósticos (úlcera, erosiones, etc.) (+1)', points: 1 },
    { value: '2', label: 'Neoplasia maligna de TGI alto (+2)', points: 2 },
  ],
};

const stigmataField: SelectFieldDef = {
  id: 'stigmata',
  label: 'Estigmas mayores de hemorragia reciente',
  type: 'select',
  defaultValue: '0',
  visibleWhen: (inputs) => inputs.mode === 'complete',
  options: [
    { value: '0', label: 'Ninguno o solo mancha oscura (Forrest IIc/III) (0)', points: 0 },
    { value: '2', label: 'Sangre en TGI alto, coágulo adherido, vaso visible o chorro (+2)', points: 2 },
  ],
};

export const rockallCalculator: CalculatorDefinition = {
  id: 'rockall',
  name: 'Escala de Rockall (Hemorragia Digestiva Alta)',
  shortName: 'Rockall',
  primarySpecialty: 'gastroenterologia',
  secondarySpecialties: ['urgencias', 'medicina-interna'],
  subcategory: 'gravedad',
  keywords: ['rockall', 'hemorragia digestiva alta', 'resangrado', 'mortalidad', 'endoscopia', 'hda'],
  description:
    'Estima el riesgo de resangrado y mortalidad en hemorragia digestiva alta en su versión clínica pre-endoscópica (0–7) o completa post-endoscopia (0–11).',
  clinicalIndication:
    'Estratificación pronóstica de pacientes con hemorragia digestiva alta antes y después de la endoscopia.',
  validatedPopulation: 'Adultos con hemorragia digestiva alta aguda.',
  contraindications: [
    'Para decidir el alta segura sin endoscopia en urgencias es preferible Glasgow-Blatchford sobre Rockall clínico.',
  ],
  limitations: [
    'Rockall pre-endoscópico tiene menor sensibilidad que Glasgow-Blatchford para predecir necesidad de transfusión o intervención.',
    'La versión completa requiere hallazgos endoscópicos confirmados.',
  ],
  version: 'Rockall et al. (Gut, 1996)',
  references: [
    {
      citation:
        'Rockall TA, Logan RF, Devlin HB, Northfield TC. Risk assessment after acute upper gastrointestinal haemorrhage. Gut. 1996;38(3):316-321.',
      year: 1996,
    },
  ],
  fields: [modeField, ageField, shockField, comorbidityField, diagnosisField, stigmataField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(rockallCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const isComplete = inputs.mode === 'complete';
    const clinicalPts = Number(inputs.age) + Number(inputs.shock) + Number(inputs.comorbidity);
    const endoPts = isComplete ? Number(inputs.diagnosis) + Number(inputs.stigmata) : 0;
    const total = clinicalPts + endoPts;
    const maxPts = isComplete ? 11 : 7;

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (isComplete) {
      if (total <= 2) {
        severity = 'low';
        riskClassification = `Riesgo bajo (Rockall completo ${total} / 11)`;
        clinicalInterpretation = 'Bajo riesgo de resangrado (~4–5 %) y muy baja mortalidad (< 0.5 %).';
      } else if (total <= 4) {
        severity = 'moderate';
        riskClassification = `Riesgo intermedio (Rockall completo ${total} / 11)`;
        clinicalInterpretation = 'Riesgo moderado de resangrado y mortalidad hospitalaria; requiere vigilancia clínica intrahospitalaria.';
      } else {
        severity = total >= 8 ? 'critical' : 'high';
        riskClassification = `Riesgo alto (Rockall completo ${total} / 11)`;
        clinicalInterpretation = 'Riesgo elevado de resangrado (> 25–40 %) y mortalidad significativa; vigilancia estrecha y optimización multidisciplinaria.';
      }
    } else {
      if (total === 0) {
        severity = 'low';
        riskClassification = 'Riesgo muy bajo pre-endoscópico (0 / 7)';
        clinicalInterpretation = 'Mortalidad reportada muy baja (< 0.5 %). Aun así, contrastar con Glasgow-Blatchford si se evalúa egreso.';
      } else if (total <= 2) {
        severity = 'moderate';
        riskClassification = `Riesgo bajo-intermedio pre-endoscópico (${total} / 7)`;
        clinicalInterpretation = 'Completar evaluación endoscópica para establecer diagnóstico y riesgo definitivo.';
      } else {
        severity = total >= 5 ? 'critical' : 'high';
        riskClassification = `Riesgo alto pre-endoscópico (${total} / 7)`;
        clinicalInterpretation = 'Alto riesgo clínico de complicaciones y mortalidad; prioridad en estabilización y endoscopia.';
      }
    }

    return {
      primaryResult: {
        label: isComplete ? 'Rockall Completo' : 'Rockall Pre-endoscópico',
        value: total,
        formattedValue: String(total),
        unit: `puntos (de ${maxPts})`,
      },
      secondaryResults: [
        { label: 'Componente clínico', formattedValue: String(clinicalPts), unit: 'de 7' },
        ...(isComplete
          ? [{ label: 'Componente endoscópico', formattedValue: String(endoPts), unit: 'de 4' }]
          : []),
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: [
        isComplete
          ? 'Puntuación ≤ 2 post-endoscopia se asocia con baja tasa de resangrado y puede apoyar egreso temprano si hay estabilidad clínica.'
          : 'Completar el puntaje completo tras realizar la endoscopia digestiva alta.',
      ],
      guidanceDisclaimer: 'La estratificación debe integrarse con hallazgos de Forrest y estabilidad hemodinámica.',
      formulaUsed: isComplete
        ? 'Edad (0–2) + Shock (0–2) + Comorbilidad (0,2,3) + Diagnóstico (0–2) + Estigmas (0,2)'
        : 'Edad (0–2) + Shock (0–2) + Comorbilidad (0,2,3)',
      inputsSummary: `Modalidad: ${isComplete ? 'Completa' : 'Pre-endoscópica'} · Clínico: ${clinicalPts}${isComplete ? ` · Endoscópico: ${endoPts}` : ''}`,
    };
  },
};
