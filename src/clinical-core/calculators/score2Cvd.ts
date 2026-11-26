import {
  formatClinicalNumber,
  getCanonicalNumberValue,
  roundClinical,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SecondaryResultItem,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';
import { BP_UNITS_MMHG, CHOLESTEROL_UNITS_MG_DL } from '../units/converters.ts';

const regionField: SelectFieldDef = {
  id: 'region',
  label: 'Región de riesgo cardiovascular (calibración ESC 2021)',
  type: 'select',
  defaultValue: 'moderate',
  options: [
    {
      value: 'low',
      label: 'Riesgo bajo (p. ej. España, Francia, Reino Unido, Suiza, Noruega, Bélgica)',
      description: 'Mortalidad CV estandarizada < 100 / 100 000 hab.',
    },
    {
      value: 'moderate',
      label: 'Riesgo moderado (p. ej. Alemania, Italia, Portugal, Grecia, Suecia)',
      description: 'Mortalidad CV estandarizada 100 a < 150 / 100 000 hab.',
    },
    {
      value: 'high',
      label: 'Riesgo alto (p. ej. Polonia, Hungría, República Checa, Turquía)',
      description: 'Mortalidad CV estandarizada 150 a < 300 / 100 000 hab.',
    },
    {
      value: 'very_high',
      label: 'Riesgo muy alto (p. ej. Rumanía, Rusia, Ucrania, Lituania, Bulgaria)',
      description: 'Mortalidad CV estandarizada ≥ 300 / 100 000 hab.',
    },
  ],
  helpText:
    'En países no europeos (p. ej. Latinoamérica), seleccionar el nivel de riesgo basal epidemiológico más cercano como referencia orientativa.',
};

const sexField: SelectFieldDef = {
  id: 'sex',
  label: 'Sexo biológico',
  type: 'select',
  defaultValue: 'male',
  options: [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Femenino' },
  ],
};

const ageField: NumberFieldDef = {
  id: 'age',
  label: 'Edad (40 a 69 años)',
  type: 'number',
  canonicalUnit: 'años',
  units: [{ id: 'years', label: 'años', toCanonical: (v) => v, min: 40, max: 69, step: 1 }],
  defaultUnitId: 'years',
  defaultValue: '55',
  min: 40,
  max: 69,
  placeholder: '55',
  helpText: 'SCORE2 aplica estrictamente entre 40 y 69 años; en ≥ 70 años corresponde SCORE2-OP.',
};

const smokerField: BooleanFieldDef = {
  id: 'smoker',
  label: 'Tabaquismo actual',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Fumador actual',
  falseLabel: 'No fuma',
};

const sbpField: NumberFieldDef = {
  id: 'sbp',
  label: 'Presión arterial sistólica (PAS)',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  defaultValue: '132',
  min: 80,
  max: 240,
  placeholder: '132',
};

const totalCholField: NumberFieldDef = {
  id: 'totalChol',
  label: 'Colesterol total',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: CHOLESTEROL_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  defaultValue: '215',
  min: 70,
  max: 500,
  placeholder: '215',
};

const hdlCholField: NumberFieldDef = {
  id: 'hdlChol',
  label: 'Colesterol HDL (c-HDL)',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: CHOLESTEROL_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  defaultValue: '48',
  min: 15,
  max: 150,
  placeholder: '48',
};

const SCORE2_PARAMS = {
  male: {
    s0: 0.9605,
    age: 0.3742,
    smoking: 0.6012,
    sbp: 0.2777,
    tchol: 0.1458,
    hdl: -0.2698,
    ageSmoking: -0.0755,
    ageSbp: -0.0255,
    ageTchol: -0.0281,
    ageHdl: 0.0426,
    scales: {
      low: [-0.5699, 0.7476],
      moderate: [-0.1565, 0.8009],
      high: [0.3207, 0.936],
      very_high: [0.5836, 0.8294],
    } as Record<string, [number, number]>,
  },
  female: {
    s0: 0.9776,
    age: 0.4648,
    smoking: 0.7744,
    sbp: 0.3131,
    tchol: 0.1002,
    hdl: -0.2606,
    ageSmoking: -0.1088,
    ageSbp: -0.0277,
    ageTchol: -0.0226,
    ageHdl: 0.0613,
    scales: {
      low: [-0.738, 0.7019],
      moderate: [-0.3143, 0.7701],
      high: [0.571, 0.9369],
      very_high: [0.9412, 0.8329],
    } as Record<string, [number, number]>,
  },
};

export const score2CvdCalculator: CalculatorDefinition = {
  id: 'score2-cvd',
  name: 'SCORE2 (ESC 2021) — Riesgo Cardiovascular a 10 Años',
  shortName: 'SCORE2 (ESC 2021)',
  primarySpecialty: 'cardiologia',
  secondarySpecialties: ['medicina-interna', 'endocrinologia'],
  subcategory: 'diagnostico',
  keywords: [
    'score2',
    'esc 2021',
    'riesgo cardiovascular',
    'prevencion primaria',
    'estatinas',
    'colesterol',
    'no hdl',
    'cardiologia',
    'consulta externa',
  ],
  description:
    'Estima el riesgo a 10 años de evento cardiovascular fatal y no fatal (IAM, ictus, muerte CV) en personas aparentemente sanas de 40 a 69 años mediante el modelo calibrado ESC SCORE2.',
  clinicalIndication:
    'Prevención primaria cardiovascular en consulta externa para estratificar riesgo y definir intensidad de objetivos de c-LDL, presión arterial e intervención en estilo de vida.',
  validatedPopulation: 'Adultos de 40 a 69 años sin enfermedad cardiovascular previa, diabetes mellitus ni ERC grave.',
  contraindications: [
    'NO utilizar en pacientes con enfermedad cardiovascular aterosclerótica establecida (prevención secundaria = riesgo muy alto), diabetes mellitus (usar SCORE2-Diabetes), ERC moderada-grave ni hipercolesterolemia familiar (riesgo alto/muy alto directo).',
    'No utilizar fuera del rango 40–69 años (en ≥ 70 años emplear SCORE2-OP).',
  ],
  limitations: [
    'Calibrado específicamente para las 4 regiones de mortalidad cardiovascular de Europa/ESC; fuera de Europa requiere seleccionar la región de riesgo basal equivalente como aproximación.',
    'La guía ESC 2021 utiliza puntos de corte dependientes de la edad (< 50 años vs. 50–69 años) para evitar el infratratamiento en jóvenes y el sobretratamiento en mayores.',
  ],
  requiredLabsNote: 'Requiere colesterol total y c-HDL recientes (calcula automáticamente colesterol no-HDL).',
  version: 'Hageman et al. · ESC SCORE2 Working Group (Eur Heart J 2021)',
  references: [
    {
      citation:
        'SCORE2 working group and ESC Cardiovascular risk collaboration. SCORE2 risk prediction algorithms: new models to estimate 10-year risk of cardiovascular disease in Europe. Eur Heart J. 2021;42(25):2439-2454.',
      year: 2021,
    },
    {
      citation:
        'Visseren FLJ, Mach F, Smulders YM, et al. 2021 ESC Guidelines on cardiovascular disease prevention in clinical practice. Eur Heart J. 2021;42(34):3227-3337.',
      year: 2021,
    },
  ],
  fields: [regionField, sexField, ageField, smokerField, sbpField, totalCholField, hdlCholField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(score2CvdCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const region = String(inputs.region);
    const sex = inputs.sex === 'female' ? 'female' : 'male';
    const age = getCanonicalNumberValue(ageField, inputs.age as NumberInputValue).canonicalValue!;
    const smoking = inputs.smoker ? 1 : 0;
    const sbp = getCanonicalNumberValue(sbpField, inputs.sbp as NumberInputValue).canonicalValue!;
    const tcMgDl = getCanonicalNumberValue(totalCholField, inputs.totalChol as NumberInputValue).canonicalValue!;
    const hdlMgDl = getCanonicalNumberValue(hdlCholField, inputs.hdlChol as NumberInputValue).canonicalValue!;

    if (hdlMgDl >= tcMgDl) {
      throw new Error('El colesterol HDL debe ser menor que el colesterol total.');
    }

    const tcMmol = tcMgDl / 38.67;
    const hdlMmol = hdlMgDl / 38.67;
    const nonHdlMgDl = roundClinical(tcMgDl - hdlMgDl, 0);

    const p = SCORE2_PARAMS[sex];
    const cage = (age - 60) / 5;
    const csbp = (sbp - 120) / 20;
    const ctchol = tcMmol - 6;
    const chdl = (hdlMmol - 1.3) / 0.5;

    const lp =
      p.age * cage +
      p.smoking * smoking +
      p.sbp * csbp +
      p.tchol * ctchol +
      p.hdl * chdl +
      p.ageSmoking * cage * smoking +
      p.ageSbp * cage * csbp +
      p.ageTchol * cage * ctchol +
      p.ageHdl * cage * chdl;

    const uncalibratedRisk = 1 - Math.pow(p.s0, Math.exp(lp));
    const [scale1, scale2] = p.scales[region] ?? p.scales.moderate;
    const calibratedRisk =
      1 - Math.exp(-Math.exp(scale1 + scale2 * Math.log(-Math.log(1 - uncalibratedRisk))));
    const riskPct = roundClinical(Math.max(0.1, Math.min(99.9, calibratedRisk * 100)), 1);

    // ESC 2021 age-stratified thresholds
    const isUnder50 = age < 50;
    const highThreshold = isUnder50 ? 2.5 : 5.0;
    const veryHighThreshold = isUnder50 ? 7.5 : 10.0;

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (riskPct < highThreshold) {
      severity = 'low';
      riskClassification = `Riesgo bajo a moderado (${formatClinicalNumber(riskPct, 1)}% · < ${highThreshold}% para edad ${isUnder50 ? '< 50' : '50–69'} años)`;
      clinicalInterpretation =
        'Por debajo del umbral ESC 2021 de tratamiento farmacológico rutinario en prevención primaria.';
      guidance.push(
        'Enfocar manejo en optimización de estilo de vida (dieta mediterránea, ejercicio aeróbico/fuerza, cese tabáquico) y reevaluación periódica de factores de riesgo.',
      );
    } else if (riskPct < veryHighThreshold) {
      severity = 'high';
      riskClassification = `Riesgo cardiovascular ALTO (${formatClinicalNumber(riskPct, 1)}% · ${highThreshold} a < ${veryHighThreshold}% para edad ${isUnder50 ? '< 50' : '50–69'} años)`;
      clinicalInterpretation =
        'Riesgo elevado a 10 años según umbrales ESC 2021; considerar tratamiento reductor de factores de riesgo además del estilo de vida.';
      guidance.push(
        'Valorar inicio o intensificación de estatina (objetivo escalonado ESC: c-LDL < 100 mg/dL en paso 1 e intensificar a < 70 mg/dL según beneficio/riesgo) y control estricto de PA.',
      );
    } else {
      severity = 'critical';
      riskClassification = `Riesgo cardiovascular MUY ALTO (${formatClinicalNumber(riskPct, 1)}% · ≥ ${veryHighThreshold}% para edad ${isUnder50 ? '< 50' : '50–69'} años)`;
      clinicalInterpretation =
        'Riesgo muy elevado de evento cardiovascular fatal o no fatal a 10 años; requiere intervención preventiva intensiva sin demora.';
      guidance.push(
        'Se recomienda tratamiento farmacológico intensivo de lípidos (meta final ESC: c-LDL < 55 mg/dL y reducción ≥ 50% respecto al basal) y control riguroso de PA y tabaquismo tras decisión compartida.',
      );
    }

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Colesterol No-HDL',
        formattedValue: `${nonHdlMgDl}`,
        unit: 'mg/dL',
      },
      {
        label: 'Cortes ESC 2021 para su edad',
        formattedValue: `Alto ≥ ${highThreshold}% · Muy alto ≥ ${veryHighThreshold}%`,
        unit: '',
      },
    ];

    return {
      primaryResult: {
        label: 'Riesgo SCORE2 a 10 años',
        value: riskPct,
        formattedValue: `${formatClinicalNumber(riskPct, 1)}%`,
        unit: '10 años',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'Modelo SCORE2 ESC 2021 con coeficientes sexo-específicos y recalibración regional',
      inputsSummary: `${sex === 'male' ? 'Varón' : 'Mujer'}, ${roundClinical(age, 0)} a · PAS ${roundClinical(sbp, 0)} · CT ${roundClinical(tcMgDl, 0)} / HDL ${roundClinical(hdlMgDl, 0)} mg/dL · Región ${region}`,
    };
  },
};
