import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const respField: SelectFieldDef = {
  id: 'respiration',
  label: 'Respiración — PaO₂/FiO₂ (mmHg)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '≥ 400 mmHg', points: 0 },
    { value: '1', label: '< 400 mmHg', points: 1 },
    { value: '2', label: '< 300 mmHg', points: 2 },
    { value: '3', label: '< 200 mmHg con soporte respiratorio', points: 3 },
    { value: '4', label: '< 100 mmHg con soporte respiratorio', points: 4 },
  ],
};

const coagField: SelectFieldDef = {
  id: 'coagulation',
  label: 'Coagulación — Plaquetas (×10³/µL)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '≥ 150', points: 0 },
    { value: '1', label: '< 150', points: 1 },
    { value: '2', label: '< 100', points: 2 },
    { value: '3', label: '< 50', points: 3 },
    { value: '4', label: '< 20', points: 4 },
  ],
};

const liverField: SelectFieldDef = {
  id: 'liver',
  label: 'Hígado — Bilirrubina total',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '< 1.2 mg/dL (< 20 µmol/L)', points: 0 },
    { value: '1', label: '1.2 – 1.9 mg/dL (20 – 32 µmol/L)', points: 1 },
    { value: '2', label: '2.0 – 5.9 mg/dL (33 – 101 µmol/L)', points: 2 },
    { value: '3', label: '6.0 – 11.9 mg/dL (102 – 204 µmol/L)', points: 3 },
    { value: '4', label: '≥ 12.0 mg/dL (≥ 204 µmol/L)', points: 4 },
  ],
};

const cardioField: SelectFieldDef = {
  id: 'cardiovascular',
  label: 'Cardiovascular — PAM / Vasopresores (dosis ≥ 1 h en µg/kg/min)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'PAM ≥ 70 mmHg (sin vasopresores)', points: 0 },
    { value: '1', label: 'PAM < 70 mmHg', points: 1 },
    { value: '2', label: 'Dopamina ≤ 5 o Dobutamina (cualquier dosis)', points: 2 },
    { value: '3', label: 'Dopamina 5.1–15, Adrenalina ≤ 0.1 o Noradrenalina ≤ 0.1', points: 3 },
    { value: '4', label: 'Dopamina > 15, Adrenalina > 0.1 o Noradrenalina > 0.1', points: 4 },
  ],
};

const cnsField: SelectFieldDef = {
  id: 'cns',
  label: 'Sistema Nervioso Central — Escala de Coma de Glasgow',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Glasgow 15', points: 0 },
    { value: '1', label: 'Glasgow 13 – 14', points: 1 },
    { value: '2', label: 'Glasgow 10 – 12', points: 2 },
    { value: '3', label: 'Glasgow 6 – 9', points: 3 },
    { value: '4', label: 'Glasgow < 6', points: 4 },
  ],
};

const renalField: SelectFieldDef = {
  id: 'renal',
  label: 'Renal — Creatinina sérica o Diuresis',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Cr < 1.2 mg/dL (< 110 µmol/L)', points: 0 },
    { value: '1', label: 'Cr 1.2 – 1.9 mg/dL (110 – 170 µmol/L)', points: 1 },
    { value: '2', label: 'Cr 2.0 – 3.4 mg/dL (171 – 299 µmol/L)', points: 2 },
    { value: '3', label: 'Cr 3.5 – 4.9 mg/dL o diuresis < 500 mL/24 h', points: 3 },
    { value: '4', label: 'Cr ≥ 5.0 mg/dL o diuresis < 200 mL/24 h', points: 4 },
  ],
};

export const sofaCalculator: CalculatorDefinition = {
  id: 'sofa',
  name: 'Escala SOFA (Sequential Organ Failure Assessment)',
  shortName: 'SOFA',
  primarySpecialty: 'urgencias',
  secondarySpecialties: ['medicina-interna', 'infectologia'],
  subcategory: 'gravedad',
  keywords: ['sofa', 'sepsis', 'sepsis-3', 'disfuncion organica', 'uci', 'fallo multiorganico'],
  description:
    'Evalúa la gravedad de la disfunción orgánica en seis sistemas fisiológicos y define el criterio operativo de sepsis (incremento agudo ≥ 2 puntos).',
  clinicalIndication:
    'Diagnóstico operativo de sepsis (Sepsis-3) y seguimiento secuencial diario de disfunción orgánica en urgencias y UCI.',
  validatedPopulation: 'Adultos críticos o con sospecha de infección/sepsis (en pediatría usar pSOFA).',
  requiredLabsNote: 'Requiere gasometría arterial (PaO₂/FiO₂), plaquetas, bilirrubina y creatinina séricas.',
  contraindications: [
    'No utilizar los umbrales de adultos directamente en población pediátrica (usar pSOFA ajustado por edad).',
  ],
  limitations: [
    'Para definir sepsis según Sepsis-3 se requiere un incremento agudo ΔSOFA ≥ 2 puntos respecto al estado basal del paciente (si se desconoce el basal, se asume 0).',
    'En pacientes sedados e intubados, la valoración del componente neurológico (Glasgow) suele estimarse sobre el último valor previo a la sedación o asumirse basal si no es evaluable.',
  ],
  version: 'Vincent et al. (1996) / Sepsis-3 (2016)',
  references: [
    {
      citation:
        'Vincent JL, Moreno R, Takala J, et al. The SOFA (Sepsis-related Organ Failure Assessment) score to describe organ dysfunction/failure. Intensive Care Med. 1996;22(7):707-710.',
      year: 1996,
    },
    {
      citation:
        'Singer M, Deutschman CS, Seymour CW, et al. The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3). JAMA. 2016;315(8):801-810.',
      year: 2016,
    },
  ],
  fields: [respField, coagField, liverField, cardioField, cnsField, renalField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(sofaCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const r = Number(inputs.respiration);
    const co = Number(inputs.coagulation);
    const l = Number(inputs.liver);
    const ca = Number(inputs.cardiovascular);
    const cns = Number(inputs.cns);
    const re = Number(inputs.renal);
    const total = r + co + l + ca + cns + re;

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (total <= 1) {
      severity = 'normal';
      riskClassification = `SOFA ${total} / 24 puntos (Sin disfunción orgánica relevante)`;
      clinicalInterpretation =
        'Por debajo del umbral de incremento ≥ 2 puntos para Sepsis-3 respecto a un basal de 0.';
    } else if (total <= 5) {
      severity = 'moderate';
      riskClassification = `SOFA ${total} / 24 puntos (Disfunción orgánica leve-moderada)`;
      clinicalInterpretation =
        'Si representa un cambio agudo ≥ 2 puntos en un paciente con infección, cumple criterio Sepsis-3. Mortalidad aproximada < 10–15 % en cohortes iniciales.';
    } else if (total <= 11) {
      severity = 'high';
      riskClassification = `SOFA ${total} / 24 puntos (Disfunción orgánica significativa)`;
      clinicalInterpretation =
        'Disfunción multiorgánica moderada-grave con mortalidad hospitalaria sustancial (≈ 15–50 % según tendencia evolutiva).';
    } else {
      severity = 'critical';
      riskClassification = `SOFA ${total} / 24 puntos (Fallo multiorgánico grave)`;
      clinicalInterpretation =
        'Disfunción orgánica crítica con mortalidad elevada (> 50 % si persiste o asciende en las primeras 48–96 h).';
    }

    return {
      primaryResult: {
        label: 'Puntuación SOFA total',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 24)',
      },
      secondaryResults: [
        {
          label: 'Desglose por órganos (Resp / Coag / Híg / CV / SNC / Ren)',
          formattedValue: `${r} · ${co} · ${l} · ${ca} · ${cns} · ${re}`,
          unit: 'pts',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: [
        'Recalcular cada 24–48 horas: la tendencia ascendente o estacionaria del SOFA es un predictor pronóstico más fuerte que el valor aislado inicial.',
      ],
      formulaUsed: 'Suma de 6 sistemas orgánicos (0 – 4 puntos cada uno)',
      inputsSummary: `Resp:${r} Coag:${co} Híg:${l} CV:${ca} SNC:${cns} Ren:${re} (Total: ${total})`,
    };
  },
};
