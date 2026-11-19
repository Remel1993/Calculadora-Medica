import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const dilationField: SelectFieldDef = {
  id: 'dilation',
  label: '1. Dilatación cervical (cm)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Cerrado (0 cm)', points: 0 },
    { value: '1', label: '1 — 1 – 2 cm', points: 1 },
    { value: '2', label: '2 — 3 – 4 cm', points: 2 },
    { value: '3', label: '3 — ≥ 5 cm', points: 3 },
  ],
};

const effacementField: SelectFieldDef = {
  id: 'effacement',
  label: '2. Borramiento cervical (%)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — 0 – 30 % (largo / > 2 cm)', points: 0 },
    { value: '1', label: '1 — 40 – 50 % (1 – 2 cm)', points: 1 },
    { value: '2', label: '2 — 60 – 70 % (0.5 – 1 cm)', points: 2 },
    { value: '3', label: '3 — ≥ 80 % (< 0.5 cm)', points: 3 },
  ],
};

const stationField: SelectFieldDef = {
  id: 'station',
  label: '3. Estación fetal / Plano de DeLee (cm respecto a espinas ciáticas)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — -3 (libre / por encima del estrecho)', points: 0 },
    { value: '1', label: '1 — -2 (I plano de Hodge)', points: 1 },
    { value: '2', label: '2 — -1 o 0 (II – III plano de Hodge)', points: 2 },
    { value: '3', label: '3 — +1 o +2 (encajado profundo)', points: 3 },
  ],
};

const consistencyField: SelectFieldDef = {
  id: 'consistency',
  label: '4. Consistencia del cuello uterino',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Firme / duro', points: 0 },
    { value: '1', label: '1 — Intermedio / medio', points: 1 },
    { value: '2', label: '2 — Blando', points: 2 },
  ],
};

const positionField: SelectFieldDef = {
  id: 'position',
  label: '5. Posición del cuello uterino',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Posterior', points: 0 },
    { value: '1', label: '1 — Medio / Central', points: 1 },
    { value: '2', label: '2 — Anterior', points: 2 },
  ],
};

export const bishopCalculator: CalculatorDefinition = {
  id: 'bishop',
  name: 'Índice / Test de Bishop (Maduración Cervical)',
  shortName: 'Índice de Bishop',
  primarySpecialty: 'gineco-obstetricia',
  secondarySpecialties: [],
  subcategory: 'diagnostico',
  keywords: ['bishop', 'cervix', 'induccion', 'parto', 'maduracion cervical', 'obstetricia'],
  description:
    'Evaluación de madurez cervical (0–13 puntos) para predecir la probabilidad de éxito de inducción del trabajo de parto y necesidad de maduración previa.',
  clinicalIndication:
    'Valoración obstétrica previa a la inducción del trabajo de parto en gestaciones a término o con indicación médica de finalización.',
  validatedPopulation: 'Gestantes con presentación cefálica de vértice candidatas a parto vaginal.',
  contraindications: [
    'No realizar tacto vaginal para Bishop ante hemorragia vaginal activa de causa no aclarada (descartar placenta previa primero por ecografía) o rotura prematura de membranas sin trabajo de parto salvo indicación estricta.',
  ],
  limitations: [
    'El punto de corte entre cuello desfavorable y favorable suele situarse en ≤ 6 vs > 6 (algunos protocolos consideran favorable ≥ 8).',
  ],
  version: 'Bishop EH (Obstet Gynecol 1964 — 0–13 puntos)',
  references: [
    {
      citation: 'Bishop EH. Pelvic scoring for elective induction. Obstet Gynecol. 1964;24:266-268.',
      year: 1964,
    },
    {
      citation: 'ACOG Practice Bulletin No. 107: Induction of Labor. Obstet Gynecol. 2009;114(2 Pt 1):386-397.',
      year: 2009,
    },
  ],
  fields: [dilationField, effacementField, stationField, consistencyField, positionField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(bishopCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const d = Number(inputs.dilation);
    const e = Number(inputs.effacement);
    const s = Number(inputs.station);
    const c = Number(inputs.consistency);
    const p = Number(inputs.position);
    const total = d + e + s + c + p;

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (total <= 6) {
      severity = 'moderate';
      riskClassification = `Cérvix desfavorable (Bishop ≤ 6: ${total} / 13 pts)`;
      clinicalInterpretation =
        'Baja probabilidad de inducción exitosa solo con oxitocina; mayor riesgo de inducción fallida si no se madura previamente el cuello.';
      guidance = [
        'Considerar maduración cervical previa (prostaglandinas o método mecánico con balón transcervical) antes de iniciar oxitocina, salvo contraindicación (ej. cesárea previa para misoprostol).',
      ];
    } else if (total === 7) {
      severity = 'low';
      riskClassification = `Zona intermedia (Bishop 7 / 13 pts)`;
      clinicalInterpretation = 'Maduración cervical intermedia; valorar paridad y condiciones obstétricas globales.';
      guidance = ['Individualizar entre maduración cervical breve o inicio cuidadoso con oxitocina según paridad e indicación.'];
    } else {
      severity = 'normal';
      riskClassification = `Cérvix favorable (Bishop ≥ 8: ${total} / 13 pts)`;
      clinicalInterpretation =
        'Cuello uterino maduro con alta probabilidad de parto vaginal exitoso tras inducción (similar al inicio espontáneo).';
      guidance = ['Apto para inducción directa con oxitocina (y amniotomía cuando proceda) sin requerir prostaglandinas previas.'];
    }

    return {
      primaryResult: {
        label: 'Puntuación de Bishop',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 13)',
      },
      secondaryResults: [
        { label: 'Desglose (Dil · Borr · Est · Cons · Pos)', formattedValue: `${d} · ${e} · ${s} · ${c} · ${p}`, unit: 'pts' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'Dilatación (0–3) + Borramiento (0–3) + Estación (0–3) + Consistencia (0–2) + Posición (0–2)',
      inputsSummary: `Bishop: ${total} / 13 puntos`,
    };
  },
};
