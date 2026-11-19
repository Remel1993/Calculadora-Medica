import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const syndromeField: SelectFieldDef = {
  id: 'syndrome',
  label: 'Tipo de Síndrome Coronario Agudo',
  type: 'select',
  defaultValue: 'nstemi',
  options: [
    { value: 'nstemi', label: 'SCASEST / Angina Inestable (0 – 7 puntos)' },
    { value: 'stemi', label: 'IAMCEST / STEMI (0 – 14 puntos)' },
  ],
};

// NSTEMI fields (7 binary criteria)
const nstemiFields: BooleanFieldDef[] = [
  {
    id: 'n_age65',
    label: 'Edad ≥ 65 años (+1)',
    type: 'boolean',
    defaultValue: false,
    visibleWhen: (i) => i.syndrome === 'nstemi',
  },
  {
    id: 'n_riskFactors',
    label: '≥ 3 factores de riesgo de enfermedad coronaria (+1)',
    helpText: 'Historia familiar, HTA, hipercolesterolemia, diabetes o tabaquismo actual.',
    type: 'boolean',
    defaultValue: false,
    visibleWhen: (i) => i.syndrome === 'nstemi',
  },
  {
    id: 'n_knownCad',
    label: 'Enfermedad coronaria conocida (estenosis previa ≥ 50 %) (+1)',
    type: 'boolean',
    defaultValue: false,
    visibleWhen: (i) => i.syndrome === 'nstemi',
  },
  {
    id: 'n_asaUse',
    label: 'Uso de ácido acetilsalicílico (AAS) en los últimos 7 días (+1)',
    type: 'boolean',
    defaultValue: false,
    visibleWhen: (i) => i.syndrome === 'nstemi',
  },
  {
    id: 'n_severeAngina',
    label: 'Angina grave reciente (≥ 2 episodios en las últimas 24 h) (+1)',
    type: 'boolean',
    defaultValue: false,
    visibleWhen: (i) => i.syndrome === 'nstemi',
  },
  {
    id: 'n_stDeviation',
    label: 'Desviación del segmento ST ≥ 0.5 mm en ECG (+1)',
    type: 'boolean',
    defaultValue: false,
    visibleWhen: (i) => i.syndrome === 'nstemi',
  },
  {
    id: 'n_markers',
    label: 'Marcadores cardíacos elevados (troponina / CK-MB) (+1)',
    type: 'boolean',
    defaultValue: false,
    visibleWhen: (i) => i.syndrome === 'nstemi',
  },
];

// STEMI fields
const stemiAgeField: SelectFieldDef = {
  id: 's_age',
  label: 'Edad',
  type: 'select',
  defaultValue: '0',
  visibleWhen: (i) => i.syndrome === 'stemi',
  options: [
    { value: '0', label: '< 65 años', points: 0 },
    { value: '2', label: '65 – 74 años', points: 2 },
    { value: '3', label: '≥ 75 años', points: 3 },
  ],
};

const stemiBoolFields: BooleanFieldDef[] = [
  {
    id: 's_dmHtnAngina',
    label: 'Antecedente de diabetes mellitus, HTA o angina (+1)',
    type: 'boolean',
    defaultValue: false,
    visibleWhen: (i) => i.syndrome === 'stemi',
  },
  {
    id: 's_sbp100',
    label: 'Presión arterial sistólica < 100 mmHg (+3)',
    type: 'boolean',
    defaultValue: false,
    visibleWhen: (i) => i.syndrome === 'stemi',
  },
  {
    id: 's_hr100',
    label: 'Frecuencia cardíaca > 100 lpm (+2)',
    type: 'boolean',
    defaultValue: false,
    visibleWhen: (i) => i.syndrome === 'stemi',
  },
  {
    id: 's_killip',
    label: 'Clase Killip II – IV (insuficiencia cardíaca / choque) (+2)',
    type: 'boolean',
    defaultValue: false,
    visibleWhen: (i) => i.syndrome === 'stemi',
  },
  {
    id: 's_weight67',
    label: 'Peso < 67 kg (+1)',
    type: 'boolean',
    defaultValue: false,
    visibleWhen: (i) => i.syndrome === 'stemi',
  },
  {
    id: 's_antSte',
    label: 'Elevación ST anterior o bloqueo de rama izquierda (BRI) (+1)',
    type: 'boolean',
    defaultValue: false,
    visibleWhen: (i) => i.syndrome === 'stemi',
  },
  {
    id: 's_time4h',
    label: 'Tiempo hasta tratamiento > 4 horas (+1)',
    type: 'boolean',
    defaultValue: false,
    visibleWhen: (i) => i.syndrome === 'stemi',
  },
];

const NSTEMI_RISK_14D: Record<number, string> = {
  0: '4.7 %',
  1: '4.7 %',
  2: '8.3 %',
  3: '13.2 %',
  4: '19.9 %',
  5: '26.2 %',
  6: '40.9 %',
  7: '40.9 %',
};

const STEMI_MORTALITY_30D: Record<number, string> = {
  0: '0.8 %',
  1: '1.6 %',
  2: '2.2 %',
  3: '4.4 %',
  4: '7.3 %',
  5: '12.4 %',
  6: '16.1 %',
  7: '23.4 %',
  8: '26.8 %',
};

export const timiRiskCalculator: CalculatorDefinition = {
  id: 'timi-risk',
  name: 'TIMI Risk Score (SCASEST e IAMCEST)',
  shortName: 'TIMI Risk',
  primarySpecialty: 'cardiologia',
  secondarySpecialties: ['urgencias'],
  subcategory: 'gravedad',
  keywords: ['timi', 'scasest', 'iamcest', 'stemi', 'nstemi', 'angina inestable', 'infarto'],
  description:
    'Estratificación pronóstica de mortalidad y eventos isquémicos tempranos en síndrome coronario agudo (con o sin elevación del ST).',
  clinicalIndication:
    'Evaluación pronóstica en pacientes con diagnóstico establecido o altamente probable de SCASEST (14 días) o IAMCEST (30 días).',
  validatedPopulation: 'Adultos con síndrome coronario agudo confirmado o sospecha clínica alta.',
  requiredLabsNote: 'Requiere ECG de 12 derivaciones y biomarcadores cardíacos (troponina/CK-MB en SCASEST).',
  contraindications: [
    'No utilizar como herramienta de exclusión para dar de alta dolor torácico indiferenciado de bajo riesgo (para ello usar HEART Score o algoritmos con troponina seriada).',
  ],
  limitations: [
    'En SCASEST, las guías ESC actuales prefieren GRACE Score para decidir el momento óptimo de coronariografía invasiva (< 24 h si GRACE > 140).',
    'En IAMCEST, la reperfusión emergente (ICP primaria o fibrinólisis según ventana) nunca debe retrasarse por el cálculo de escalas.',
  ],
  version: 'Antman et al. (JAMA 2000) & Morrow et al. (Circulation 2000)',
  references: [
    {
      citation:
        'Antman EM, Cohen M, Bernink PJ, et al. The TIMI risk score for unstable angina/non-ST elevation MI. JAMA. 2000;284(7):835-842.',
      year: 2000,
    },
    {
      citation:
        'Morrow DA, Antman EM, Charlesworth A, et al. TIMI risk score for ST-elevation myocardial infarction: A convenient, bedside, clinical score for risk assessment at presentation. Circulation. 2000;102(17):2031-2037.',
      year: 2000,
    },
  ],
  fields: [syndromeField, ...nstemiFields, stemiAgeField, ...stemiBoolFields],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(timiRiskCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    if (inputs.syndrome === 'nstemi') {
      let score = 0;
      for (const f of nstemiFields) {
        if (inputs[f.id] === true) score += 1;
      }
      const eventRisk = NSTEMI_RISK_14D[score] ?? '40.9 %';

      let severity: SeverityLevel = 'low';
      let risk = '';
      if (score <= 2) {
        severity = 'low';
        risk = `Riesgo bajo SCASEST (${score} / 7 puntos)`;
      } else if (score <= 4) {
        severity = 'moderate';
        risk = `Riesgo intermedio SCASEST (${score} / 7 puntos)`;
      } else {
        severity = 'critical';
        risk = `Riesgo alto SCASEST (${score} / 7 puntos)`;
      }

      return {
        primaryResult: {
          label: 'TIMI Score (SCASEST / Angina Inestable)',
          value: score,
          formattedValue: String(score),
          unit: 'puntos (de 7)',
        },
        secondaryResults: [
          {
            label: 'Riesgo combinado a 14 días (muerte, IAM o revascularización urgente)',
            formattedValue: eventRisk,
            unit: 'cohorte Antman 2000',
          },
        ],
        severity,
        riskClassification: risk,
        clinicalInterpretation: `Riesgo estimado del ${eventRisk} de mortalidad, reinfarto o isquemia recurrente grave a 14 días.`,
        formulaUsed: 'Suma de 7 criterios clínicos/ECG/biomarcadores (1 punto c/u)',
        inputsSummary: `SCASEST · Puntuación: ${score} / 7`,
      };
    }

    // STEMI
    let score = Number(inputs.s_age || 0);
    if (inputs.s_dmHtnAngina === true) score += 1;
    if (inputs.s_sbp100 === true) score += 3;
    if (inputs.s_hr100 === true) score += 2;
    if (inputs.s_killip === true) score += 2;
    if (inputs.s_weight67 === true) score += 1;
    if (inputs.s_antSte === true) score += 1;
    if (inputs.s_time4h === true) score += 1;

    const mortality = score >= 9 ? '> 35.9 %' : STEMI_MORTALITY_30D[score] ?? 'N/D';
    let severity: SeverityLevel = 'low';
    let risk = '';
    if (score <= 2) {
      severity = 'low';
      risk = `Riesgo bajo IAMCEST (${score} / 14 puntos)`;
    } else if (score <= 5) {
      severity = 'moderate';
      risk = `Riesgo intermedio IAMCEST (${score} / 14 puntos)`;
    } else {
      severity = 'critical';
      risk = `Riesgo alto IAMCEST (${score} / 14 puntos)`;
    }

    return {
      primaryResult: {
        label: 'TIMI Score (IAMCEST / STEMI)',
        value: score,
        formattedValue: String(score),
        unit: 'puntos (de 14)',
      },
      secondaryResults: [
        {
          label: 'Mortalidad estimada a 30 días (InTIME-II)',
          formattedValue: mortality,
          unit: 'cohorte Morrow 2000',
        },
      ],
      severity,
      riskClassification: risk,
      clinicalInterpretation: `Mortalidad estimada a 30 días de ${mortality} en la cohorte original de fibrinólisis.`,
      guidance: [
        'Priorizar estrategia de reperfusión emergente (ICP primaria o fibrinólisis según tiempos de traslado).',
      ],
      formulaUsed: 'Edad (0/2/3) + DM/HTA/Angina (1) + PAS<100 (3) + FC>100 (2) + Killip II-IV (2) + Peso<67 (1) + STE ant/BRI (1) + Tiempo>4h (1)',
      inputsSummary: `IAMCEST · Puntuación: ${score} / 14`,
    };
  },
};
