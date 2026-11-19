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
  BP_UNITS_MMHG,
  HR_UNITS_BPM,
  RR_UNITS_RPM,
  TEMP_UNITS_C,
} from '../units/converters.ts';

const rrField: NumberFieldDef = {
  id: 'rr',
  label: 'Frecuencia respiratoria',
  type: 'number',
  canonicalUnit: 'rpm',
  units: RR_UNITS_RPM,
  defaultUnitId: 'rpm',
  min: 4,
  max: 70,
  placeholder: '18',
};

const spo2ScaleField: SelectFieldDef = {
  id: 'spo2Scale',
  label: 'Escala de SpO₂ aplicable',
  type: 'select',
  defaultValue: 'scale1',
  helpText: 'Usar Escala 2 únicamente cuando exista diagnóstico confirmado de insuficiencia respiratoria hipercápnica (p. ej. EPOC retenedor con meta 88–92 %).',
  options: [
    { value: 'scale1', label: 'Escala 1 — Estándar (meta SpO₂ ≥ 96 %)' },
    { value: 'scale2', label: 'Escala 2 — Hipercapnia crónica (meta SpO₂ 88–92 %)' },
  ],
};

const spo2Field: NumberFieldDef = {
  id: 'spo2',
  label: 'Saturación periférica de O₂ (SpO₂)',
  type: 'number',
  canonicalUnit: '%',
  units: [{ id: 'pct', label: '%', toCanonical: (v) => v, min: 40, max: 100, step: 1 }],
  defaultUnitId: 'pct',
  min: 40,
  max: 100,
  placeholder: '97',
};

const o2Field: BooleanFieldDef = {
  id: 'onOxygen',
  label: '¿Recibe oxígeno suplementario? (+2)',
  type: 'boolean',
  trueLabel: 'Oxígeno suplementario (+2)',
  falseLabel: 'Aire ambiente (0)',
  defaultValue: false,
};

const sbpField: NumberFieldDef = {
  id: 'sbp',
  label: 'Presión arterial sistólica (PAS)',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  min: 40,
  max: 280,
  placeholder: '120',
};

const hrField: NumberFieldDef = {
  id: 'hr',
  label: 'Frecuencia cardíaca / Pulso',
  type: 'number',
  canonicalUnit: 'lpm',
  units: HR_UNITS_BPM,
  defaultUnitId: 'bpm',
  min: 20,
  max: 250,
  placeholder: '78',
};

const consciousnessField: SelectFieldDef = {
  id: 'consciousness',
  label: 'Nivel de conciencia (escala ACVPU)',
  type: 'select',
  defaultValue: 'A',
  options: [
    { value: 'A', label: 'A — Alerta', points: 0 },
    { value: 'CVPU', label: 'C / V / P / U — Confusión nueva o respuesta solo a Voz / Dolor / Inconsciente', points: 3 },
  ],
};

const tempField: NumberFieldDef = {
  id: 'temp',
  label: 'Temperatura corporal',
  type: 'number',
  canonicalUnit: '°C',
  units: TEMP_UNITS_C,
  defaultUnitId: 'c',
  min: 28,
  max: 44,
  placeholder: '36.8',
};

export const news2Calculator: CalculatorDefinition = {
  id: 'news2',
  name: 'NEWS2 (National Early Warning Score 2)',
  shortName: 'NEWS2',
  primarySpecialty: 'urgencias',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'gravedad',
  keywords: ['news2', 'news', 'deterioro clinico', 'sepsis', 'triaje', 'alerta temprana'],
  description:
    'Sistema estandarizado de alerta temprana basado en 6 constantes fisiológicas + oxigenoterapia para detectar deterioro clínico agudo y sepsis.',
  clinicalIndication:
    'Triaje en urgencias, monitorización en hospitalización y cribado de deterioro agudo/sepsis en adultos.',
  validatedPopulation: 'Adultos ≥ 16 años (no embarazadas).',
  contraindications: [
    'No utilizar en menores de 16 años (usar PEWS) ni en gestantes (usar MEOWS obstétrico).',
  ],
  limitations: [
    'Una puntuación total baja (p. ej. 3 puntos) puede corresponder a un parámetro aislado en +3 (puntuación extrema roja), lo que exige revisión médica urgente igualmente.',
    'La Escala 2 de SpO₂ solo debe usarse tras indicación médica documentada de riesgo de insuficiencia respiratoria hipercápnica.',
  ],
  version: 'Royal College of Physicians (NEWS2, 2017)',
  references: [
    {
      citation:
        'Royal College of Physicians. National Early Warning Score (NEWS) 2: Standardising the assessment of acute-illness severity in the NHS. London: RCP; 2017.',
      year: 2017,
    },
  ],
  fields: [
    rrField,
    spo2ScaleField,
    spo2Field,
    o2Field,
    sbpField,
    hrField,
    consciousnessField,
    tempField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(news2Calculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const rr = getCanonicalNumberValue(rrField, inputs.rr as NumberInputValue).canonicalValue!;
    const spo2 = getCanonicalNumberValue(spo2Field, inputs.spo2 as NumberInputValue)
      .canonicalValue!;
    const onO2 = inputs.onOxygen === true;
    const scale2 = inputs.spo2Scale === 'scale2';
    const sbp = getCanonicalNumberValue(sbpField, inputs.sbp as NumberInputValue).canonicalValue!;
    const hr = getCanonicalNumberValue(hrField, inputs.hr as NumberInputValue).canonicalValue!;
    const cnsPts = inputs.consciousness === 'CVPU' ? 3 : 0;
    const temp = getCanonicalNumberValue(tempField, inputs.temp as NumberInputValue)
      .canonicalValue!;

    // 1. RR
    let rrPts = 0;
    if (rr <= 8 || rr >= 25) rrPts = 3;
    else if (rr >= 21) rrPts = 2;
    else if (rr <= 11) rrPts = 1;

    // 2. SpO2
    let spo2Pts = 0;
    if (!scale2) {
      if (spo2 <= 91) spo2Pts = 3;
      else if (spo2 <= 93) spo2Pts = 2;
      else if (spo2 <= 95) spo2Pts = 1;
    } else {
      if (spo2 <= 83) spo2Pts = 3;
      else if (spo2 <= 85) spo2Pts = 2;
      else if (spo2 <= 87) spo2Pts = 1;
      else if (spo2 <= 92 || !onO2) spo2Pts = 0;
      else if (spo2 <= 94) spo2Pts = 1;
      else if (spo2 <= 96) spo2Pts = 2;
      else spo2Pts = 3;
    }

    // 3. O2
    const o2Pts = onO2 ? 2 : 0;

    // 4. SBP
    let sbpPts = 0;
    if (sbp <= 90 || sbp >= 220) sbpPts = 3;
    else if (sbp <= 100) sbpPts = 2;
    else if (sbp <= 110) sbpPts = 1;

    // 5. HR
    let hrPts = 0;
    if (hr <= 40 || hr >= 131) hrPts = 3;
    else if (hr >= 111) hrPts = 2;
    else if (hr <= 50 || hr >= 91) hrPts = 1;

    // 6. Temp
    let tempPts = 0;
    if (temp <= 35.0) tempPts = 3;
    else if (temp >= 39.1) tempPts = 2;
    else if (temp <= 36.0 || temp >= 38.1) tempPts = 1;

    const paramScores = [rrPts, spo2Pts, o2Pts, sbpPts, hrPts, cnsPts, tempPts];
    const hasRedSingle = [rrPts, spo2Pts, sbpPts, hrPts, cnsPts, tempPts].some((p) => p === 3);
    const total = paramScores.reduce((a, b) => a + b, 0);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (total >= 7) {
      severity = 'critical';
      riskClassification = `Riesgo clínico ALTO (NEWS2 ${total} puntos)`;
      clinicalInterpretation =
        'Riesgo elevado de deterioro agudo grave o parada/ingreso a UCI. Requiere valoración médica emergente.';
      guidance = [
        'Evaluación urgente por equipo médico/críticos, monitorización continua y considerar sepsis si existe sospecha infecciosa.',
      ];
    } else if (total >= 5) {
      severity = 'high';
      riskClassification = `Riesgo clínico MEDIO (NEWS2 ${total} puntos)`;
      clinicalInterpretation =
        'Umbral clave de alerta clínica (≥ 5): riesgo significativo de deterioro agudo o sepsis en curso.';
      guidance = [
        'Valoración clínica urgente por médico responsable, aumentar frecuencia de vigilancia (mínimo horaria) y descartar sepsis.',
      ];
    } else if (hasRedSingle) {
      severity = 'moderate';
      riskClassification = `Riesgo BAJO-MEDIO por parámetro extremo (+3 en una variable · Total ${total})`;
      clinicalInterpretation =
        'Aunque la suma global es < 5, existe al menos un parámetro fisiológico en rango rojo (+3 puntos).';
      guidance = [
        'Revisión médica prioritaria en planta/urgencias y aumento de la frecuencia de control de constantes (al menos cada hora).',
      ];
    } else {
      severity = total === 0 ? 'normal' : 'low';
      riskClassification = `Riesgo clínico BAJO (NEWS2 ${total} puntos)`;
      clinicalInterpretation =
        'Parámetros fisiológicos sin signos de deterioro agudo significativo por escala NEWS2.';
      guidance = [
        total === 0
          ? 'Continuar monitorización habitual según protocolo asistencial (p. ej. cada 12 h).'
          : 'Mantener vigilancia clínica periódica (cada 4–6 h) y reevaluar ante cualquier cambio sintomático.',
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación NEWS2',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 20)',
      },
      secondaryResults: [
        {
          label: 'Parámetro único extremo (+3)',
          formattedValue: hasRedSingle ? 'Presente' : 'No',
          unit: '',
        },
        {
          label: 'Desglose (FR · SpO₂ · O₂ · PAS · FC · ACVPU · Temp)',
          formattedValue: paramScores.join(' · '),
          unit: 'pts',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'Suma ponderada RCP NEWS2 (Escala 1 o 2 de SpO₂)',
      inputsSummary: `FR ${rr} · SpO₂ ${spo2}% (${onO2 ? 'O₂' : 'Aire'}) · PAS ${sbp} · FC ${hr} · Temp ${temp.toFixed(1)} °C`,
    };
  },
};
