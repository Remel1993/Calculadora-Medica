import {
  getCanonicalNumberValue,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';
import {
  AGE_UNITS_YEARS,
  BP_UNITS_MMHG,
  CREATININE_UNITS_MG_DL,
  ELECTROLYTE_UNITS_MEQ_L,
  HR_UNITS_BPM,
  RR_UNITS_RPM,
  TEMP_UNITS_C,
} from '../units/converters.ts';

const tempField: NumberFieldDef = {
  id: 'temp',
  label: 'Temperatura central/rectal (°C)',
  type: 'number',
  canonicalUnit: '°C',
  units: TEMP_UNITS_C,
  defaultUnitId: 'c',
  min: 24,
  max: 45,
  placeholder: '37.5',
};

const mapField: NumberFieldDef = {
  id: 'map',
  label: 'Presión Arterial Media (PAM)',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  min: 20,
  max: 240,
  placeholder: '85',
};

const hrField: NumberFieldDef = {
  id: 'hr',
  label: 'Frecuencia cardíaca',
  type: 'number',
  canonicalUnit: 'lpm',
  units: HR_UNITS_BPM,
  defaultUnitId: 'bpm',
  min: 20,
  max: 260,
  placeholder: '92',
};

const rrField: NumberFieldDef = {
  id: 'rr',
  label: 'Frecuencia respiratoria',
  type: 'number',
  canonicalUnit: 'rpm',
  units: RR_UNITS_RPM,
  defaultUnitId: 'rpm',
  min: 2,
  max: 80,
  placeholder: '20',
};

const oxyField: SelectFieldDef = {
  id: 'oxygenation',
  label: 'Oxigenación (A-aDO₂ si FiO₂ ≥ 0.50; PaO₂ si FiO₂ < 0.50)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'A-aDO₂ < 200 (FiO₂ ≥ 0.5) o PaO₂ > 70 mmHg (FiO₂ < 0.5)', points: 0 },
    { value: '1', label: 'PaO₂ 61 – 70 mmHg (FiO₂ < 0.5)', points: 1 },
    { value: '2', label: 'A-aDO₂ 200 – 349 mmHg (FiO₂ ≥ 0.5)', points: 2 },
    { value: '3', label: 'A-aDO₂ 350 – 499 (FiO₂ ≥ 0.5) o PaO₂ 55 – 60 (FiO₂ < 0.5)', points: 3 },
    { value: '4', label: 'A-aDO₂ ≥ 500 (FiO₂ ≥ 0.5) o PaO₂ < 55 mmHg (FiO₂ < 0.5)', points: 4 },
  ],
};

const acidBaseSourceField: SelectFieldDef = {
  id: 'acidBaseSource',
  label: 'Medición ácido-base disponible',
  type: 'select',
  defaultValue: 'ph',
  options: [
    { value: 'ph', label: 'pH arterial (preferido)' },
    { value: 'hco3', label: 'HCO₃⁻ sérico (solo si no hay gasometría arterial)' },
  ],
};

const phField: NumberFieldDef = {
  id: 'ph',
  label: 'pH arterial',
  type: 'number',
  canonicalUnit: 'pH',
  units: [{ id: 'ph', label: 'pH', toCanonical: (v) => v, min: 6.5, max: 7.9, step: 0.01 }],
  defaultUnitId: 'ph',
  min: 6.5,
  max: 7.9,
  placeholder: '7.40',
  visibleWhen: (i) => i.acidBaseSource === 'ph',
};

const hco3Field: NumberFieldDef = {
  id: 'hco3',
  label: 'Bicarbonato sérico (HCO₃⁻)',
  type: 'number',
  canonicalUnit: 'mEq/L',
  units: ELECTROLYTE_UNITS_MEQ_L,
  defaultUnitId: 'meq_l',
  min: 2,
  max: 65,
  placeholder: '24',
  visibleWhen: (i) => i.acidBaseSource === 'hco3',
};

const naField: NumberFieldDef = {
  id: 'sodium',
  label: 'Sodio sérico (Na⁺)',
  type: 'number',
  canonicalUnit: 'mEq/L',
  units: ELECTROLYTE_UNITS_MEQ_L,
  defaultUnitId: 'meq_l',
  min: 90,
  max: 200,
  placeholder: '140',
};

const kField: NumberFieldDef = {
  id: 'potassium',
  label: 'Potasio sérico (K⁺)',
  type: 'number',
  canonicalUnit: 'mEq/L',
  units: ELECTROLYTE_UNITS_MEQ_L,
  defaultUnitId: 'meq_l',
  min: 1.5,
  max: 10.0,
  placeholder: '4.1',
};

const crField: NumberFieldDef = {
  id: 'creatinine',
  label: 'Creatinina sérica',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: CREATININE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 0.1,
  max: 25,
  placeholder: '1.0',
};

const arfField: BooleanFieldDef = {
  id: 'acuteRenalFailure',
  label: '¿Fracaso renal agudo? (duplica puntuación de creatinina)',
  type: 'boolean',
  defaultValue: false,
};

const hctField: NumberFieldDef = {
  id: 'hematocrit',
  label: 'Hematocrito (%)',
  type: 'number',
  canonicalUnit: '%',
  units: [{ id: 'pct', label: '%', toCanonical: (v) => v, min: 10, max: 75, step: 0.5 }],
  defaultUnitId: 'pct',
  min: 10,
  max: 75,
  placeholder: '40',
};

const wbcField: NumberFieldDef = {
  id: 'wbc',
  label: 'Leucocitos (×10³/µL)',
  type: 'number',
  canonicalUnit: '×10³/µL',
  units: [{ id: 'k_ul', label: '×10³/µL', toCanonical: (v) => v, min: 0.1, max: 150, step: 0.1 }],
  defaultUnitId: 'k_ul',
  min: 0.1,
  max: 150,
  placeholder: '9.5',
};

const gcsField: NumberFieldDef = {
  id: 'gcs',
  label: 'Escala de Coma de Glasgow (3 – 15)',
  type: 'number',
  canonicalUnit: 'puntos',
  units: [{ id: 'pts', label: 'pts', toCanonical: (v) => v, min: 3, max: 15, step: 1 }],
  defaultUnitId: 'pts',
  defaultValue: '15',
  min: 3,
  max: 15,
  placeholder: '15',
};

const ageField: NumberFieldDef = {
  id: 'age',
  label: 'Edad',
  type: 'number',
  canonicalUnit: 'años',
  units: AGE_UNITS_YEARS,
  defaultUnitId: 'years',
  min: 18,
  max: 115,
  placeholder: '58',
};

const chronicField: SelectFieldDef = {
  id: 'chronicHealth',
  label: 'Antecedente de insuficiencia orgánica crónica grave o inmunosupresión',
  helpText: 'Cirrosis con hipertensión portal, IC NYHA IV, EPOC grave con hipoxia/hipercapnia, diálisis crónica o inmunocompromiso.',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Ausente', points: 0 },
    { value: '2', label: 'Presente — Paciente posquirúrgico programado', points: 2 },
    { value: '5', label: 'Presente — Paciente no quirúrgico o posquirúrgico urgente', points: 5 },
  ],
};

function scoreTemp(t: number): number {
  if (t >= 41 || t < 30) return 4;
  if (t >= 39 || t < 32) return 3;
  if (t < 34) return 2;
  if (t >= 38.5 || t < 36) return 1;
  return 0;
}

function scoreMap(m: number): number {
  if (m >= 160 || m < 50) return 4;
  if (m >= 130) return 3;
  if (m >= 110 || m < 70) return 2;
  return 0;
}

function scoreHr(hr: number): number {
  if (hr >= 180 || hr < 40) return 4;
  if (hr >= 140 || hr < 55) return 3;
  if (hr >= 110 || hr < 70) return 2;
  return 0;
}

function scoreRr(rr: number): number {
  if (rr >= 50 || rr < 6) return 4;
  if (rr >= 35) return 3;
  if (rr < 10) return 2;
  if (rr >= 25 || rr < 12) return 1;
  return 0;
}

function scorePh(ph: number): number {
  if (ph >= 7.7 || ph < 7.15) return 4;
  if (ph >= 7.6 || ph < 7.25) return 3;
  if (ph < 7.33) return 2;
  if (ph >= 7.5) return 1;
  return 0;
}

function scoreHco3(h: number): number {
  if (h >= 52 || h < 15) return 4;
  if (h >= 41 || h < 18) return 3;
  if (h < 22) return 2;
  if (h >= 32) return 1;
  return 0;
}

function scoreNa(na: number): number {
  if (na >= 180 || na < 111) return 4;
  if (na >= 160 || na < 120) return 3;
  if (na >= 155 || na < 130) return 2;
  if (na >= 150) return 1;
  return 0;
}

function scoreK(k: number): number {
  if (k >= 7 || k < 2.5) return 4;
  if (k >= 6) return 3;
  if (k < 3) return 2;
  if (k >= 5.5 || k < 3.5) return 1;
  return 0;
}

function scoreCr(cr: number, isArf: boolean): number {
  let pts = 0;
  if (cr >= 3.5) pts = 4;
  else if (cr >= 2.0) pts = 3;
  else if (cr >= 1.5 || cr < 0.6) pts = 2;
  return isArf ? pts * 2 : pts;
}

function scoreHct(hct: number): number {
  if (hct >= 60 || hct < 20) return 4;
  if (hct >= 50 || hct < 30) return 2;
  if (hct >= 46) return 1;
  return 0;
}

function scoreWbc(wbc: number): number {
  if (wbc >= 40 || wbc < 1) return 4;
  if (wbc >= 20 || wbc < 3) return 2;
  if (wbc >= 15) return 1;
  return 0;
}

function scoreAge(age: number): number {
  if (age >= 75) return 6;
  if (age >= 65) return 5;
  if (age >= 55) return 3;
  if (age >= 45) return 2;
  return 0;
}

export const apacheIiCalculator: CalculatorDefinition = {
  id: 'apache-ii',
  name: 'APACHE II (Gravedad en Cuidados Intensivos)',
  shortName: 'APACHE II',
  primarySpecialty: 'medicina-interna',
  secondarySpecialties: ['urgencias'],
  subcategory: 'gravedad',
  keywords: ['apache', 'apache ii', 'uci', 'mortalidad', 'gravedad', 'fisiologia aguda'],
  description:
    'Sistema de clasificación pronóstica en UCI basado en las 12 peores variables fisiológicas de las primeras 24 horas, edad y comorbilidad crónica.',
  clinicalIndication:
    'Estratificación de gravedad al ingreso a UCI (primeras 24 horas) y comparación de gravedad entre cohortes.',
  validatedPopulation: 'Adultos ≥ 18 años ingresados en UCI (no validado en quemados ni cirugía cardíaca CABG en cohorte original).',
  requiredLabsNote: 'Requiere gasometría (pH y PaO₂/A-aDO₂), Na⁺, K⁺, creatinina, hematocrito y leucocitos.',
  contraindications: [
    'No utilizar para decidir limitación del esfuerzo terapéutico de forma individual.',
    'No validado en pacientes pediátricos (< 16–18 años).',
  ],
  limitations: [
    'Debe calcularse con el peor valor de las primeras 24 horas en UCI.',
    'La estimación exacta de mortalidad hospitalaria de Knaus et al. depende además del peso específico del diagnóstico principal de ingreso (50 categorías diagnósticas); aquí se muestra el rango orientativo por tramo de puntuación.',
  ],
  version: 'Knaus WA et al. (Crit Care Med 1985)',
  references: [
    {
      citation:
        'Knaus WA, Draper EA, Wagner DP, Zimmerman JE. APACHE II: a severity of disease classification system. Crit Care Med. 1985;13(10):818-829.',
      year: 1985,
    },
  ],
  fields: [
    tempField,
    mapField,
    hrField,
    rrField,
    oxyField,
    acidBaseSourceField,
    phField,
    hco3Field,
    naField,
    kField,
    crField,
    arfField,
    hctField,
    wbcField,
    gcsField,
    ageField,
    chronicField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(apacheIiCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const temp = getCanonicalNumberValue(tempField, inputs.temp as NumberInputValue).canonicalValue!;
    const map = getCanonicalNumberValue(mapField, inputs.map as NumberInputValue).canonicalValue!;
    const hr = getCanonicalNumberValue(hrField, inputs.hr as NumberInputValue).canonicalValue!;
    const rr = getCanonicalNumberValue(rrField, inputs.rr as NumberInputValue).canonicalValue!;
    const oxyPts = Number(inputs.oxygenation);
    const acidPts =
      inputs.acidBaseSource === 'ph'
        ? scorePh(getCanonicalNumberValue(phField, inputs.ph as NumberInputValue).canonicalValue!)
        : scoreHco3(
            getCanonicalNumberValue(hco3Field, inputs.hco3 as NumberInputValue).canonicalValue!,
          );
    const na = getCanonicalNumberValue(naField, inputs.sodium as NumberInputValue).canonicalValue!;
    const k = getCanonicalNumberValue(kField, inputs.potassium as NumberInputValue).canonicalValue!;
    const cr = getCanonicalNumberValue(crField, inputs.creatinine as NumberInputValue)
      .canonicalValue!;
    const isArf = inputs.acuteRenalFailure === true;
    const hct = getCanonicalNumberValue(hctField, inputs.hematocrit as NumberInputValue)
      .canonicalValue!;
    const wbc = getCanonicalNumberValue(wbcField, inputs.wbc as NumberInputValue).canonicalValue!;
    const gcs = getCanonicalNumberValue(gcsField, inputs.gcs as NumberInputValue).canonicalValue!;
    const age = getCanonicalNumberValue(ageField, inputs.age as NumberInputValue).canonicalValue!;
    const chronicPts = Number(inputs.chronicHealth);

    const aps =
      scoreTemp(temp) +
      scoreMap(map) +
      scoreHr(hr) +
      scoreRr(rr) +
      oxyPts +
      acidPts +
      scoreNa(na) +
      scoreK(k) +
      scoreCr(cr, isArf) +
      scoreHct(hct) +
      scoreWbc(wbc) +
      (15 - Math.round(gcs));

    const agePts = scoreAge(age);
    const total = aps + agePts + chronicPts;

    let mortalityRange = '';
    let severity: SeverityLevel = 'low';
    if (total <= 9) {
      mortalityRange = '≈ 4 % (no qx) / ≈ 3 % (posqx)';
      severity = 'low';
    } else if (total <= 14) {
      mortalityRange = '≈ 8 % (no qx) / ≈ 7 % (posqx)';
      severity = 'low';
    } else if (total <= 19) {
      mortalityRange = '≈ 25 % (no qx) / ≈ 12 % (posqx)';
      severity = 'moderate';
    } else if (total <= 24) {
      mortalityRange = '≈ 40 % (no qx) / ≈ 30 % (posqx)';
      severity = 'high';
    } else if (total <= 29) {
      mortalityRange = '≈ 55 % (no qx) / ≈ 35 % (posqx)';
      severity = 'high';
    } else if (total <= 34) {
      mortalityRange = '≈ 73 – 75 %';
      severity = 'critical';
    } else {
      mortalityRange = '> 85 %';
      severity = 'critical';
    }

    return {
      primaryResult: {
        label: 'Puntuación APACHE II',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 71)',
      },
      secondaryResults: [
        { label: 'APS (Fisiología Aguda, 12 variables)', formattedValue: String(aps), unit: 'pts' },
        { label: 'Puntos por Edad', formattedValue: String(agePts), unit: 'pts' },
        { label: 'Puntos por Salud Crónica', formattedValue: String(chronicPts), unit: 'pts' },
        {
          label: 'Mortalidad hospitalaria aproximada (Knaus 1985)',
          formattedValue: mortalityRange,
          unit: 'orientativa',
        },
      ],
      severity,
      riskClassification:
        total < 15
          ? `Gravedad baja-moderada (${total} pts)`
          : total < 25
            ? `Gravedad moderada-alta (${total} pts)`
            : `Gravedad crítica (${total} pts)`,
      clinicalInterpretation:
        'Puntuación global de severidad fisiológica aguda + reserva biológica en las primeras 24 horas de UCI.',
      formulaUsed: 'APACHE II = APS (12 variables) + Edad (0–6) + Salud Crónica (0/2/5)',
      inputsSummary: `APS: ${aps} · Edad: ${age} (+${agePts}) · Crónica: +${chronicPts} · Total: ${total}`,
    };
  },
};
