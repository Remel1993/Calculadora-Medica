import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const ctFindingsField: SelectFieldDef = {
  id: 'grade',
  label: 'Hallazgos de sangre subaracnoidea e intraventricular en TC craneal inicial',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '0', label: 'Grado 0 — Sin sangre subaracnoidea ni intraventricular visible en TC', points: 0 },
    { value: '1', label: 'Grado 1 — HSA focal o difusa fina (< 1 mm) SIN hemorragia intraventricular', points: 1 },
    { value: '2', label: 'Grado 2 — HSA focal o difusa fina (< 1 mm) CON hemorragia intraventricular', points: 2 },
    { value: '3', label: 'Grado 3 — HSA gruesa (≥ 1 mm) SIN hemorragia intraventricular', points: 3 },
    { value: '4', label: 'Grado 4 — HSA gruesa (≥ 1 mm) CON hemorragia intraventricular', points: 4 },
  ],
};

export const fisherModificadaCalculator: CalculatorDefinition = {
  id: 'fisher-modificada',
  name: 'Escala de Fisher Modificada (Vasoespasmo en HSA)',
  shortName: 'Fisher Modificada',
  primarySpecialty: 'neurologia',
  secondarySpecialties: ['urgencias'],
  subcategory: 'gravedad',
  keywords: ['fisher', 'fisher modificada', 'vasoespasmo', 'hsa', 'hemorragia subaracnoidea', 'tc'],
  description:
    'Predicción del riesgo de vasoespasmo cerebral sintomático tras hemorragia subaracnoidea aneurismática según TC simple inicial.',
  clinicalIndication:
    'Estratificación radiológica inicial en HSA aneurismática para vigilancia de isquemia cerebral tardía y vasoespasmo.',
  validatedPopulation: 'Adultos con HSA aneurismática evaluados mediante TC craneal simple en fase aguda.',
  contraindications: [
    'No utilizar para graduar hemorragia intraparenquimatosa pura sin HSA ni HSA traumática aislada con el mismo valor pronóstico de aneurisma.',
  ],
  limitations: [
    'La escala de Fisher original (1980) asignaba riesgo paradójicamente menor al grado 4 frente al 3; la versión modificada de Frontera (2006) corrige esta inconsistencia logrando progresión monotónica del riesgo.',
  ],
  version: 'Frontera JA et al. (Neurosurgery 2006)',
  references: [
    {
      citation: 'Frontera JA, Claassen J, Schmidt JM, et al. Prediction of symptomatic vasospasm after subarachnoid hemorrhage: the modified fisher scale. Neurosurgery. 2006;59(1):21-27.',
      year: 2006,
    },
  ],
  fields: [ctFindingsField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(fisherModificadaCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const grade = Number(inputs.grade);
    const map: Record<number, { risk: string; or: string; sev: SeverityLevel; interp: string }> = {
      0: {
        risk: 'Muy bajo (≈ 0 % en serie Frontera)',
        or: 'Referencia (0–1)',
        sev: 'normal',
        interp: 'Sin sangre visible en TC (HSA diagnosticada por punción lumbar/RM). Riesgo mínimo de vasoespasmo sintomático.',
      },
      1: {
        risk: 'Moderado-bajo (≈ 24 %)',
        or: 'Referencia (0–1)',
        sev: 'low',
        interp: 'Sangre subaracnoidea fina sin componente intraventricular.',
      },
      2: {
        risk: 'Moderado (≈ 33 %)',
        or: 'OR 1.6 (IC 95 % 1.0–2.5)',
        sev: 'moderate',
        interp: 'La presencia de sangre intraventricular eleva el riesgo de vasoespasmo e hidrocefalia aguda.',
      },
      3: {
        risk: 'Moderado-alto (≈ 33 %)',
        or: 'OR 1.6 (IC 95 % 1.1–2.2)',
        sev: 'high',
        interp: 'Coágulo cisternal grueso (≥ 1 mm) asociado a riesgo sustancial de isquemia cerebral tardía.',
      },
      4: {
        risk: 'Alto (≈ 40 %)',
        or: 'OR 2.2 (IC 95 % 1.6–3.1)',
        sev: 'critical',
        interp: 'Máximo riesgo de vasoespasmo sintomático e isquemia cerebral tardía por coexistencia de HSA gruesa + hemorragia intraventricular.',
      },
    };

    const item = map[grade] ?? map[1];

    return {
      primaryResult: {
        label: 'Fisher Modificada',
        value: grade,
        formattedValue: `Grado ${grade}`,
        unit: 'de 4',
      },
      secondaryResults: [
        { label: 'Incidencia de vasoespasmo sintomático (Frontera 2006)', formattedValue: item.risk, unit: '' },
        { label: 'Odds Ratio crudo frente a grados 0–1', formattedValue: item.or, unit: '' },
      ],
      severity: item.sev,
      riskClassification: `Fisher Modificada Grado ${grade}`,
      clinicalInterpretation: item.interp,
      guidance: [
        'Considerar nimodipino oral/enteral profiláctico según protocolo de HSA y monitorización con Doppler transcraneal / exploración neurológica seriada.',
      ],
      formulaUsed: 'Espesor de sangre subaracnoidea (<1 mm vs ≥1 mm) + presencia de hemorragia intraventricular',
      inputsSummary: `Fisher Modificada: Grado ${grade}`,
    };
  },
};
