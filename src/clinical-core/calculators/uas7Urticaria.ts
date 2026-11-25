import {
  getCanonicalNumberValue,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SecondaryResultItem,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const modeField: SelectFieldDef = {
  id: 'mode',
  label: 'Modalidad de registro',
  type: 'select',
  defaultValue: 'weekly',
  options: [
    {
      value: 'weekly',
      label: 'UAS7 semanal (suma de diario de 7 días: 0–42 pts)',
      description: 'Introduce el total semanal de habones (0–21) y prurito (0–21) del diario del paciente.',
    },
    {
      value: 'daily',
      label: 'UAS de un día (evaluación puntual en consulta: 0–6 pts)',
      description: 'Puntúa habones (0–3) y prurito (0–3) de las últimas 24 horas.',
    },
  ],
};

const weeklyWhealsField: NumberFieldDef = {
  id: 'weeklyWheals',
  label: 'Suma semanal de habones / ronchas en 7 días (0 a 21 puntos)',
  type: 'number',
  canonicalUnit: 'pts',
  units: [{ id: 'pts', label: 'pts', toCanonical: (v) => v, min: 0, max: 21, step: 1 }],
  defaultUnitId: 'pts',
  defaultValue: '10',
  min: 0,
  max: 21,
  placeholder: '10',
  helpText: 'Cada día puntúa: 0 ninguno · 1 leve (< 20/24 h) · 2 moderado (20–50/24 h) · 3 intenso (> 50/24 h o áreas confluentes).',
  visibleWhen: (inputs) => inputs.mode !== 'daily',
};

const weeklyItchField: NumberFieldDef = {
  id: 'weeklyItch',
  label: 'Suma semanal de prurito en 7 días (0 a 21 puntos)',
  type: 'number',
  canonicalUnit: 'pts',
  units: [{ id: 'pts', label: 'pts', toCanonical: (v) => v, min: 0, max: 21, step: 1 }],
  defaultUnitId: 'pts',
  defaultValue: '11',
  min: 0,
  max: 21,
  placeholder: '11',
  helpText: 'Cada día puntúa: 0 ninguno · 1 leve · 2 moderado (molesto sin alterar sueño) · 3 intenso (interfiere actividad diaria o sueño).',
  visibleWhen: (inputs) => inputs.mode !== 'daily',
};

const dailyWhealsField: SelectFieldDef = {
  id: 'dailyWheals',
  label: 'Habones / ronchas en las últimas 24 horas (0–3)',
  type: 'select',
  defaultValue: '2',
  options: [
    { value: '0', label: '0 · Ninguno', points: 0 },
    { value: '1', label: '1 · Leve (< 20 habones / 24 h)', points: 1 },
    { value: '2', label: '2 · Moderado (20–50 habones / 24 h)', points: 2 },
    { value: '3', label: '3 · Intenso (> 50 habones / 24 h o grandes áreas confluentes)', points: 3 },
  ],
  visibleWhen: (inputs) => inputs.mode === 'daily',
};

const dailyItchField: SelectFieldDef = {
  id: 'dailyItch',
  label: 'Prurito en las últimas 24 horas (0–3)',
  type: 'select',
  defaultValue: '2',
  options: [
    { value: '0', label: '0 · Ninguno', points: 0 },
    { value: '1', label: '1 · Leve (presente pero no molesto)', points: 1 },
    { value: '2', label: '2 · Moderado (molesto, no interfiere con actividad ni sueño)', points: 2 },
    { value: '3', label: '3 · Intenso (dificulta la actividad diaria o el sueño)', points: 3 },
  ],
  visibleWhen: (inputs) => inputs.mode === 'daily',
};

export const uas7UrticariaCalculator: CalculatorDefinition = {
  id: 'uas7-urticaria',
  name: 'UAS7 — Índice de Actividad de Urticaria Crónica Espontánea',
  shortName: 'UAS7 (Urticaria Crónica)',
  primarySpecialty: 'dermatologia',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'gravedad',
  keywords: [
    'uas7',
    'uas',
    'urticaria',
    'ronchas',
    'habones',
    'prurito',
    'omalizumab',
    'dermatologia',
    'alergia',
  ],
  description:
    'Cuantifica la actividad clínica de la urticaria crónica espontánea (UCE) mediante la suma de habones y prurito en 7 días consecutivos (UAS7: 0–42) o en 24 h (UAS: 0–6).',
  clinicalIndication:
    'Seguimiento estándar de gravedad y respuesta terapéutica en urticaria crónica espontánea (antihistamínicos H1, omalizumab, ciclosporina).',
  validatedPopulation: 'Adolescentes y adultos con urticaria crónica espontánea.',
  contraindications: [
    'No está validado para urticaria aguda aislada, angioedema hereditario sin habones ni urticarias inducibles aisladas (usar UCT o pruebas de provocación).',
  ],
  limitations: [
    'La actividad de la UCE fluctúa de un día a otro; el UAS de un solo día puede subestimar o sobrestimar la carga real respecto al diario completo de 7 días (UAS7).',
    'No mide directamente la presencia ni frecuencia de angioedema asociado ni el impacto en calidad de vida (CU-Q2oL / UCT).',
  ],
  version: 'EAACI / GA²LEN / EuroGuiDerm / APAAACI (2022)',
  references: [
    {
      citation:
        'Zuberbier T, Abdul Latiff AH, Abuzakouk M, et al. The international EAACI/GA²LEN/EuroGuiDerm/APAAACI guideline for the definition, classification, diagnosis, and management of urticaria. Allergy. 2022;77(3):734-766.',
      year: 2022,
    },
    {
      citation:
        'Stull D, McBride D, Tian H, et al. Analysis of disease activity categories in chronic spontaneous/idiopathic urticaria using the UAS7. Br J Dermatol. 2017;177(4):1093-1101.',
      year: 2017,
    },
  ],
  fields: [modeField, weeklyWhealsField, weeklyItchField, dailyWhealsField, dailyItchField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(uas7UrticariaCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const mode = String(inputs.mode);

    if (mode === 'daily') {
      const w = Number(inputs.dailyWheals);
      const i = Number(inputs.dailyItch);
      const uas = w + i;

      let severity: SeverityLevel = 'normal';
      let riskClassification = '';
      if (uas === 0) {
        severity = 'normal';
        riskClassification = 'Sin actividad hoy (UAS diario 0/6)';
      } else if (uas <= 2) {
        severity = 'low';
        riskClassification = 'Actividad diaria leve (UAS 1–2/6)';
      } else if (uas <= 4) {
        severity = 'moderate';
        riskClassification = 'Actividad diaria moderada (UAS 3–4/6)';
      } else {
        severity = 'high';
        riskClassification = 'Actividad diaria intensa (UAS 5–6/6)';
      }

      return {
        primaryResult: {
          label: 'UAS diario (24 h)',
          value: uas,
          formattedValue: `${uas} / 6`,
          unit: 'puntos',
        },
        secondaryResults: [
          { label: 'Habones (24 h)', formattedValue: `${w} / 3`, unit: 'pts' },
          { label: 'Prurito (24 h)', formattedValue: `${i} / 3`, unit: 'pts' },
        ],
        severity,
        riskClassification,
        clinicalInterpretation:
          'Puntuación puntual de las últimas 24 horas. Para clasificar control terapéutico global según guías EAACI/GA²LEN se requiere la suma de 7 días consecutivos (UAS7).',
        guidance: [
          'Entregar diario de síntomas de 7 días al paciente para calcular el UAS7 completo en la próxima revisión.',
        ],
        formulaUsed: 'UAS diario = Habones (0–3) + Prurito (0–3)',
        inputsSummary: `UAS diario ${uas}/6 (Habones ${w} · Prurito ${i})`,
      };
    }

    const wSum = getCanonicalNumberValue(weeklyWhealsField, inputs.weeklyWheals as NumberInputValue).canonicalValue!;
    const iSum = getCanonicalNumberValue(weeklyItchField, inputs.weeklyItch as NumberInputValue).canonicalValue!;
    const uas7 = Math.round(wSum + iSum);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (uas7 === 0) {
      severity = 'normal';
      riskClassification = 'Control completo / sin actividad (UAS7 = 0)';
      clinicalInterpretation = 'Ausencia total de habones y prurito durante los 7 días evaluados.';
      guidance.push('Objetivo terapéutico alcanzado; valorar mantenimiento o descenso escalonado si persiste en control sostenido.');
    } else if (uas7 <= 6) {
      severity = 'low';
      riskClassification = 'Urticaria bien controlada (UAS7 = 1–6)';
      clinicalInterpretation = 'Actividad mínima compatible con buen control clínico semanal.';
      guidance.push('Continuar pauta actual y reevaluar adherencia y calidad de vida.');
    } else if (uas7 <= 15) {
      severity = 'moderate';
      riskClassification = 'Actividad leve de UCE (UAS7 = 7–15)';
      clinicalInterpretation = 'Actividad leve pero persistente durante la semana; el control sintomático aún es incompleto.';
      guidance.push('Si está con antihistamínico H1 de 2.ª generación a dosis estándar, considerar optimizar dosis (hasta 4× según guía EAACI).');
    } else if (uas7 <= 27) {
      severity = 'high';
      riskClassification = 'Actividad moderada de UCE (UAS7 = 16–27)';
      clinicalInterpretation = 'Carga sintomática moderada con impacto relevante en el confort y sueño del paciente.';
      guidance.push(
        'Optimizar antihistamínico H1 de 2.ª generación; si persiste ≥ 2–4 semanas (habitualmente UAS7 ≥ 16), valorar escalón terapéutico con omalizumab según guía vigente.',
      );
    } else {
      severity = 'critical';
      riskClassification = 'Actividad grave de UCE (UAS7 = 28–42)';
      clinicalInterpretation = 'Urticaria crónica espontánea grave con gran afectación diaria y del descanso nocturno.';
      guidance.push(
        'Requiere optimización prioritaria del tratamiento en Dermatología/Alergología (escalón a omalizumab o inmunomodulador según respuesta a antihistamínicos en dosis altas).',
      );
    }

    const secondaryResults: SecondaryResultItem[] = [
      { label: 'Habones semanal (7 días)', formattedValue: `${Math.round(wSum)} / 21`, unit: 'pts' },
      { label: 'Prurito semanal (7 días)', formattedValue: `${Math.round(iSum)} / 21`, unit: 'pts' },
    ];

    return {
      primaryResult: {
        label: 'UAS7 semanal',
        value: uas7,
        formattedValue: `${uas7} / 42`,
        unit: 'puntos',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'UAS7 = Suma semanal de habones (0–21) + Suma semanal de prurito (0–21)',
      inputsSummary: `UAS7 ${uas7}/42 (Habones ${Math.round(wSum)} · Prurito ${Math.round(iSum)})`,
    };
  },
};
