import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const vomitingField: BooleanFieldDef = {
  id: 'vomiting',
  label: 'Vómitos (+1)',
  type: 'boolean',
  defaultValue: false,
};

const rifPainField: BooleanFieldDef = {
  id: 'rifPain',
  label: 'Dolor en fosa ilíaca derecha (+1)',
  type: 'boolean',
  defaultValue: false,
};

const reboundField: SelectFieldDef = {
  id: 'rebound',
  label: 'Signo de rebote o defensa muscular abdominal',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Ausente (0)', points: 0 },
    { value: '1', label: 'Leve (+1)', points: 1 },
    { value: '2', label: 'Moderada (+2)', points: 2 },
    { value: '3', label: 'Intensa / abdomen en tabla (+3)', points: 3 },
  ],
};

const tempField: BooleanFieldDef = {
  id: 'temp385',
  label: 'Temperatura corporal ≥ 38.5 °C (+1)',
  type: 'boolean',
  defaultValue: false,
};

const pmnField: SelectFieldDef = {
  id: 'pmn',
  label: 'Polimorfonucleares / Neutrófilos (%)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '< 70 % (0)', points: 0 },
    { value: '1', label: '70 – 84 % (+1)', points: 1 },
    { value: '2', label: '≥ 85 % (+2)', points: 2 },
  ],
};

const wbcField: SelectFieldDef = {
  id: 'wbc',
  label: 'Recuento leucocitario (×10³/µL o ×10⁹/L)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '< 10.0 (0)', points: 0 },
    { value: '1', label: '10.0 – 14.9 (+1)', points: 1 },
    { value: '2', label: '≥ 15.0 (+2)', points: 2 },
  ],
};

const crpField: SelectFieldDef = {
  id: 'crp',
  label: 'Proteína C Reactiva (PCR)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '< 10 mg/L (< 1.0 mg/dL) (0)', points: 0 },
    { value: '1', label: '10 – 49 mg/L (1.0 – 4.9 mg/dL) (+1)', points: 1 },
    { value: '2', label: '≥ 50 mg/L (≥ 5.0 mg/dL) (+2)', points: 2 },
  ],
};

export const airScoreCalculator: CalculatorDefinition = {
  id: 'air-score',
  name: 'AIR Score (Appendicitis Inflammatory Response)',
  shortName: 'AIR Score',
  primarySpecialty: 'cirugia-general',
  secondarySpecialties: ['urgencias'],
  subcategory: 'diagnostico',
  keywords: ['air', 'apendicitis', 'pcr', 'proteina c reactiva', 'andersson', 'wses'],
  description:
    'Escala de respuesta inflamatoria en apendicitis (0–12 pts) que incorpora gradación de defensa abdominal y Proteína C Reactiva (PCR) para reducir apendicectomías blancas.',
  clinicalIndication:
    'Estratificación diagnóstica en sospecha de apendicitis aguda recomendada por las guías WSES (2020) en adultos.',
  validatedPopulation: 'Adultos y niños mayores con dolor en fosa ilíaca derecha.',
  requiredLabsNote: 'Requiere biometría hemática (leucocitos, % neutrófilos) y Proteína C Reactiva (PCR).',
  contraindications: [
    'En síntomas de evolución muy temprana (< 12 horas), la PCR puede no haberse elevado aún.',
    'No utilizar como criterio único en embarazo o inmunosupresión grave.',
  ],
  limitations: [
    'El grupo de riesgo intermedio (5–8 pts) es un estrato de observación/imagen obligada, no de confirmación ni descarte.',
  ],
  version: 'Andersson M & Andersson RE (World J Surg 2008)',
  references: [
    {
      citation: 'Andersson M, Andersson RE. The appendicitis inflammatory response score: a tool for the diagnosis of acute appendicitis that outperforms the Alvarado score. World J Surg. 2008;32(8):1843-1849.',
      year: 2008,
    },
    {
      citation: 'Di Saverio S, Podda M, De Simone B, et al. 2020 update of the WSES Jerusalem guidelines. World J Emerg Surg. 2020;15(1):27.',
      year: 2020,
    },
  ],
  fields: [vomitingField, rifPainField, reboundField, tempField, pmnField, wbcField, crpField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(airScoreCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const score =
      (inputs.vomiting === true ? 1 : 0) +
      (inputs.rifPain === true ? 1 : 0) +
      Number(inputs.rebound) +
      (inputs.temp385 === true ? 1 : 0) +
      Number(inputs.pmn) +
      Number(inputs.wbc) +
      Number(inputs.crp);

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (score <= 4) {
      severity = 'low';
      riskClassification = `Riesgo bajo (${score} / 12 puntos)`;
      clinicalInterpretation = 'Baja probabilidad de apendicitis aguda (alto valor predictivo negativo en adultos).';
      guidance = ['Valorar manejo ambulatorio con reevaluación programada en 12–24 h si persisten los síntomas.'];
    } else if (score <= 8) {
      severity = 'moderate';
      riskClassification = `Riesgo intermedio (${score} / 12 puntos)`;
      clinicalInterpretation = 'Zona indeterminada; requiere observación clínica activa y estudio de imagen (ecografía o TC) para definir conducta.';
      guidance = ['Solicitar ecografía abdominal / TC y reevaluación clínica y analítica seriada en 4–8 horas.'];
    } else {
      severity = 'high';
      riskClassification = `Riesgo alto (${score} / 12 puntos)`;
      clinicalInterpretation = 'Alta probabilidad de apendicitis aguda con alta especificidad clínica e inflamatoria.';
      guidance = ['Valoración quirúrgica urgente (considerar imagen confirmatoria en mujeres jóvenes, ancianos o comorbilidad compleja).'];
    }

    return {
      primaryResult: {
        label: 'Puntuación AIR Score',
        value: score,
        formattedValue: String(score),
        unit: 'puntos (de 12)',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'Vómitos(1)+Dolor FID(1)+Rebote/Defensa(0–3)+Temp≥38.5(1)+PMN(0–2)+Leucos(0–2)+PCR(0–2)',
      inputsSummary: `AIR Score: ${score} / 12 puntos`,
    };
  },
};
