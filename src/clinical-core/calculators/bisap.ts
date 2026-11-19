import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SeverityLevel,
} from '../types/clinical.ts';

const fields: BooleanFieldDef[] = [
  { id: 'bun25', label: 'B — BUN > 25 mg/dL (Urea > 53.6 mg/dL o > 8.9 mmol/L) (+1)', type: 'boolean', defaultValue: false },
  { id: 'mental', label: 'I — Deterioro del estado mental (Glasgow < 15, desorientación o letargia) (+1)', type: 'boolean', defaultValue: false },
  {
    id: 'sirs',
    label: 'S — SIRS presente (≥ 2 criterios: T <36 o >38°C, FC >90, FR >20 o PaCO₂ <32, Leucos <4k o >12k) (+1)',
    type: 'boolean',
    defaultValue: false,
  },
  { id: 'age60', label: 'A — Edad > 60 años (+1)', type: 'boolean', defaultValue: false },
  { id: 'effusion', label: 'P — Derrame pleural en radiografía o TC de tórax (+1)', type: 'boolean', defaultValue: false },
];

const MORTALITY_BY_SCORE: Record<number, string> = {
  0: '0.1 – 0.2 %',
  1: '0.5 – 0.7 %',
  2: '1.9 – 2.0 %',
  3: '5.3 – 8.0 %',
  4: '12.7 – 19.0 %',
  5: '22.5 – 27.0 %',
};

export const bisapCalculator: CalculatorDefinition = {
  id: 'bisap',
  name: 'BISAP Score (Pancreatitis Aguda al Ingreso)',
  shortName: 'BISAP',
  primarySpecialty: 'gastroenterologia',
  secondarySpecialties: ['urgencias', 'cirugia-general'],
  subcategory: 'gravedad',
  keywords: ['bisap', 'pancreatitis', 'sirs', 'derrame pleural', 'bun', 'mortalidad'],
  description:
    'Sistema pronóstico simple en las primeras 24 horas de pancreatitis aguda (0–5 pts) para predecir mortalidad intrahospitalaria y fallo orgánico persistente.',
  clinicalIndication:
    'Estratificación temprana al ingreso en pancreatitis aguda sin necesidad de esperar 48 horas como en Ranson.',
  validatedPopulation: 'Adultos en las primeras 24 horas de hospitalización por pancreatitis aguda.',
  requiredLabsNote: 'Requiere BUN sérico, biometría hemática para SIRS e imagen torácica (Rx o TC).',
  contraindications: [
    'No sustituye la clasificación de Atlanta Revisada basada en fallo orgánico persistente (> 48 h) ni la vigilancia hemodinámica/respiratoria continua.',
  ],
  limitations: [
    'Un BISAP < 3 no garantiza curso leve si aparece disfunción orgánica progresiva o necrosis pancreática infectada posterior.',
  ],
  version: 'Wu BU et al. (Gut 2008 / Papachristou 2010)',
  references: [
    {
      citation: 'Wu BU, Johannes RS, Sun X, Tabak Y, Conwell DL, Banks PA. The early prediction of mortality in acute pancreatitis: a large population-based study. Gut. 2008;57(12):1698-1703.',
      year: 2008,
    },
  ],
  fields,
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(bisapCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const score = fields.filter((f) => inputs[f.id] === true).length;
    const mortality = MORTALITY_BY_SCORE[score] ?? '22.5 %';

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (score <= 2) {
      severity = score === 0 ? 'normal' : 'low';
      riskClassification = `Riesgo bajo (BISAP ${score} / 5 puntos)`;
      clinicalInterpretation = `Mortalidad intrahospitalaria estimada < 2 % (${mortality}).`;
      guidance = ['Reanimación guiada por metas, analgesia adecuada y reevaluación clínica continua en las primeras 48 horas.'];
    } else {
      severity = score >= 4 ? 'critical' : 'high';
      riskClassification = `Riesgo alto (BISAP ${score} / 5 puntos — Umbral ≥ 3)`;
      clinicalInterpretation = `Incremento significativo del riesgo de fallo orgánico persistente y mortalidad intrahospitalaria (≈ ${mortality}).`;
      guidance = ['Vigilancia estrecha de perfusión, diuresis y oxigenación; considerar unidad de cuidados intermedios o UCI.'];
    }

    return {
      primaryResult: {
        label: 'Puntuación BISAP',
        value: score,
        formattedValue: String(score),
        unit: 'puntos (de 5)',
      },
      secondaryResults: [
        { label: 'Mortalidad intrahospitalaria estimada (Wu 2008)', formattedValue: mortality, unit: '' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'BUN>25 (1) + Estado mental alterado (1) + SIRS (1) + Edad>60 (1) + Derrame pleural (1)',
      inputsSummary: `BISAP: ${score} / 5 puntos`,
    };
  },
};
