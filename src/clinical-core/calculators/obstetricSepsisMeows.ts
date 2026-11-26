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
  SeverityLevel,
} from '../types/clinical.ts';
import { BP_UNITS_MMHG, HR_UNITS_BPM, RR_UNITS_RPM, TEMP_UNITS_C } from '../units/converters.ts';

const tempField: NumberFieldDef = {
  id: 'temperature',
  label: 'Temperatura corporal',
  type: 'number',
  canonicalUnit: '°C',
  units: TEMP_UNITS_C,
  defaultUnitId: 'c',
  defaultValue: '37.2',
  min: 25,
  max: 44,
  placeholder: '37.2',
  helpText: 'SOS asigna 0 pts entre 36.0 y 38.4 °C.',
};

const sbpField: NumberFieldDef = {
  id: 'sbp',
  label: 'Presión arterial sistólica (PAS)',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  defaultValue: '112',
  min: 40,
  max: 260,
  placeholder: '112',
  helpText: 'SOS: > 90 mmHg = 0 pts · 70–90 mmHg = +2 · < 70 mmHg = +4. MEOWS alerta roja si PAS < 90 o ≥ 160 mmHg.',
};

const hrField: NumberFieldDef = {
  id: 'heartRate',
  label: 'Frecuencia cardíaca materna (FC)',
  type: 'number',
  canonicalUnit: 'lpm',
  units: HR_UNITS_BPM,
  defaultUnitId: 'bpm',
  defaultValue: '96',
  min: 25,
  max: 240,
  placeholder: '96',
  helpText: 'Adaptado al embarazo: SOS = 0 pts hasta ≤ 119 lpm; +1 si 120–129; +2 si 130–149; +3 si 150–179; +4 si ≥ 180 lpm.',
};

const rrField: NumberFieldDef = {
  id: 'respiratoryRate',
  label: 'Frecuencia respiratoria (FR)',
  type: 'number',
  canonicalUnit: 'rpm',
  units: RR_UNITS_RPM,
  defaultUnitId: 'rpm',
  defaultValue: '18',
  min: 2,
  max: 70,
  placeholder: '18',
  helpText: 'SOS: 12–24 rpm = 0 pts · 10–11 = +1 · 25–34 o 6–9 = +2 · 35–49 = +3 · ≥ 50 o ≤ 5 = +4. MEOWS alerta roja si FR ≥ 25 o < 10 rpm.',
};

const spo2Field: NumberFieldDef = {
  id: 'spo2',
  label: 'Saturación periférica de oxígeno (SpO₂)',
  type: 'number',
  canonicalUnit: '%',
  units: [{ id: 'pct', label: '%', toCanonical: (v) => v, min: 50, max: 100, step: 1 }],
  defaultUnitId: 'pct',
  defaultValue: '98',
  min: 50,
  max: 100,
  placeholder: '98',
  helpText: 'SOS: ≥ 92 % = 0 pts · 90–91 % = +1 · 85–89 % = +3 · < 85 % = +4.',
};

const wbcField: NumberFieldDef = {
  id: 'wbc',
  label: 'Leucocitos totales',
  type: 'number',
  canonicalUnit: '×10³/µL',
  units: [
    { id: 'k_ul', label: '×10³/µL (miles/mm³)', toCanonical: (v) => v, min: 0.1, max: 100, step: 0.1 },
    { id: 'cells_ul', label: 'células/µL', toCanonical: (v) => v / 1000, min: 100, max: 100000, step: 100 },
  ],
  defaultUnitId: 'k_ul',
  defaultValue: '12.5',
  min: 0.1,
  max: 100,
  placeholder: '12.5',
  helpText: 'SOS: 5.7–16.9 ×10³/µL = 0 pts · 17–24.9 = +2 · 25–39.9 = +3 · ≥ 40 o < 1.0 = +4.',
};

const bandsField: NumberFieldDef = {
  id: 'immatureNeutrophilsPct',
  label: 'Neutrófilos inmaduros / bandas en frotis (%)',
  type: 'number',
  required: false,
  canonicalUnit: '%',
  units: [{ id: 'pct', label: '%', toCanonical: (v) => v, min: 0, max: 80, step: 1 }],
  defaultUnitId: 'pct',
  defaultValue: '2',
  min: 0,
  max: 80,
  placeholder: '2',
  helpText: 'Criterio SOS: ≥ 10 % suma +2 puntos (desviación a la izquierda). Si no está disponible, dejar en < 10 % y consignar limitación.',
};

const lactateField: NumberFieldDef = {
  id: 'lactate',
  label: 'Lactato sérico / arterial',
  type: 'number',
  required: false,
  canonicalUnit: 'mmol/L',
  units: [
    { id: 'mmol_l', label: 'mmol/L', toCanonical: (v) => v, min: 0.2, max: 25, step: 0.1 },
    { id: 'mg_dl', label: 'mg/dL', toCanonical: (v) => v / 9.01, min: 2, max: 225, step: 1 },
  ],
  defaultUnitId: 'mmol_l',
  defaultValue: '1.4',
  min: 0.2,
  max: 25,
  placeholder: '1.4',
  helpText: 'Criterio SOS: ≥ 4.0 mmol/L suma +2 puntos. Nota: el trabajo de parto activo puede elevar transitoriamente el lactato.',
};

const neuroAlteredField: BooleanFieldDef = {
  id: 'neuroAltered',
  label: 'Alteración del estado de conciencia / no responde o solo al dolor (alerta MEOWS)',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
};

const oliguriaField: BooleanFieldDef = {
  id: 'oliguria',
  label: 'Oliguria (< 30 mL/h durante ≥ 2 h o anuria)',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
};

function scoreTempSos(t: number): number {
  if (t >= 41.0 || t < 30.0) return 4;
  if (t >= 39.0 || t < 32.0) return 3;
  if (t < 34.0) return 2;
  if (t >= 38.5 || t < 36.0) return 1;
  return 0; // 36.0–38.4
}

function scoreSbpSos(sbp: number): number {
  if (sbp < 70) return 4;
  if (sbp <= 90) return 2;
  return 0;
}

function scoreHrSos(hr: number): number {
  if (hr >= 180) return 4;
  if (hr >= 150) return 3;
  if (hr >= 130) return 2;
  if (hr >= 120) return 1;
  return 0;
}

function scoreRrSos(rr: number): number {
  if (rr >= 50 || rr <= 5) return 4;
  if (rr >= 35) return 3;
  if (rr >= 25 || rr < 10) return 2;
  if (rr < 12) return 1;
  return 0; // 12–24
}

function scoreSpo2Sos(spo2: number): number {
  if (spo2 < 85) return 4;
  if (spo2 <= 89) return 3;
  if (spo2 <= 91) return 1;
  return 0;
}

function scoreWbcSos(wbc: number): number {
  if (wbc >= 40 || wbc < 1) return 4;
  if (wbc >= 25) return 3;
  if (wbc >= 17 || wbc < 3) return 2;
  if (wbc < 5.7) return 1;
  return 0; // 5.7–16.9
}

export const obstetricSepsisMeowsCalculator: CalculatorDefinition = {
  id: 'obstetric-sepsis-meows',
  name: 'Sepsis en Obstetricia (SOS — Albright) y Alerta Materna Temprana (MEOWS)',
  shortName: 'Sepsis Obstétrica (SOS)',
  primarySpecialty: 'gineco-obstetricia',
  secondarySpecialties: ['urgencias', 'infectologia'],
  subcategory: 'gravedad',
  keywords: [
    'sepsis obstetrica',
    'sos',
    'albright',
    'meows',
    'alerta temprana materna',
    'corioamnionitis',
    'endometritis',
    'sepsis puerperal',
    'uci',
    'obstetricia',
  ],
  description:
    'Calcula el Sepsis in Obstetrics Score (SOS, Albright 2014, 0–28 puntos) adaptado a la fisiología del embarazo junto con disparadores de Alerta Materna Temprana (MEOWS) para detectar riesgo de deterioro y necesidad de UCI.',
  clinicalIndication:
    'Triaje en urgencias, sala de partos o puerperio de gestantes o puérperas con sospecha de infección/sepsis (corioamnionitis, pielonefritis, endometritis, mastitis, neumonía).',
  validatedPopulation: 'Mujeres embarazadas y en periodo posparto (hasta 6 semanas) con sospecha de infección o sepsis.',
  contraindications: [
    'No usar como único criterio para descartar sepsis si existe compromiso fetal agudo, choque o disfunción orgánica evidente (la fisiología materna puede enmascarar signos iniciales).',
  ],
  limitations: [
    'Durante el trabajo de parto activo y el expulsivo, el lactato puede elevarse fisiológicamente (> 2–4 mmol/L) y el recuento leucocitario puede subir sin sepsis.',
    'Un SOS < 6 tiene alto valor predictivo negativo (~98.6 %) para ingreso a UCI en las cohortes de validación, pero no descarta infección que requiera antibioticoterapia.',
    'Las alertas MEOWS varían ligeramente entre sistemas (CMQCC, UK CEMACH/MBRRACE); aquí se incluyen sus umbrales rojos universales de riesgo agudo.',
  ],
  requiredLabsNote: 'Constantes vitales + biometría hemática (leucocitos y bandas %) + lactato sérico.',
  version: 'SOS Albright (2014) · MEOWS',
  references: [
    {
      citation:
        'Albright CM, Ali TN, Lopes V, Rouse DJ, Anderson BL. The Sepsis in Obstetrics Score: a model to identify risk of morbidity from sepsis in pregnancy. Am J Obstet Gynecol. 2014;211(1):39.e1-39.e8.',
      year: 2014,
    },
    {
      citation:
        'Albright CM, Has P, Rouse DJ, Hughes BL. Internal Validation of the Sepsis in Obstetrics Score to Identify Risk of Morbidity From Sepsis in Pregnancy. Obstet Gynecol. 2017;130(4):747-755.',
      year: 2017,
    },
    {
      citation:
        'Society for Maternal-Fetal Medicine (SMFM); Shields AD, Plante LA, et al. SMFM Consult Series #67: Maternal sepsis. Am J Obstet Gynecol. 2023;229(3):B2-B19.',
      year: 2023,
    },
  ],
  fields: [
    tempField,
    sbpField,
    hrField,
    rrField,
    spo2Field,
    wbcField,
    bandsField,
    lactateField,
    neuroAlteredField,
    oliguriaField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(obstetricSepsisMeowsCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const temp = getCanonicalNumberValue(tempField, inputs.temperature as NumberInputValue).canonicalValue!;
    const sbp = getCanonicalNumberValue(sbpField, inputs.sbp as NumberInputValue).canonicalValue!;
    const hr = getCanonicalNumberValue(hrField, inputs.heartRate as NumberInputValue).canonicalValue!;
    const rr = getCanonicalNumberValue(rrField, inputs.respiratoryRate as NumberInputValue).canonicalValue!;
    const spo2 = getCanonicalNumberValue(spo2Field, inputs.spo2 as NumberInputValue).canonicalValue!;
    const wbc = getCanonicalNumberValue(wbcField, inputs.wbc as NumberInputValue).canonicalValue!;
    const bands = getCanonicalNumberValue(bandsField, inputs.immatureNeutrophilsPct as NumberInputValue).canonicalValue ?? 0;
    const lactate = getCanonicalNumberValue(lactateField, inputs.lactate as NumberInputValue).canonicalValue ?? 0;
    const neuroAltered = inputs.neuroAltered === true;
    const oliguria = inputs.oliguria === true;

    const pTemp = scoreTempSos(temp);
    const pSbp = scoreSbpSos(sbp);
    const pHr = scoreHrSos(hr);
    const pRr = scoreRrSos(rr);
    const pSpo2 = scoreSpo2Sos(spo2);
    const pWbc = scoreWbcSos(wbc);
    const pBands = bands >= 10 ? 2 : 0;
    const pLactate = lactate >= 4.0 ? 2 : 0;

    const sosTotal = pTemp + pSbp + pHr + pRr + pSpo2 + pWbc + pBands + pLactate;

    // MEOWS Red physiological triggers
    const meowsRedTriggers: string[] = [];
    if (temp < 35.0 || temp >= 38.0) meowsRedTriggers.push(`Temp ${formatClinicalNumber(temp, 1)} °C`);
    if (sbp < 90 || sbp >= 160) meowsRedTriggers.push(`PAS ${roundClinical(sbp, 0)} mmHg`);
    if (hr < 40 || hr > 120) meowsRedTriggers.push(`FC ${roundClinical(hr, 0)} lpm`);
    if (rr < 10 || rr >= 25) meowsRedTriggers.push(`FR ${roundClinical(rr, 0)} rpm`);
    if (spo2 < 95) meowsRedTriggers.push(`SpO₂ ${roundClinical(spo2, 0)} %`);
    if (neuroAltered) meowsRedTriggers.push('Alteración del nivel de conciencia');
    if (oliguria) meowsRedTriggers.push('Oliguria (< 30 mL/h)');

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (sosTotal >= 6 || neuroAltered || sbp < 90) {
      severity = 'critical';
      riskClassification =
        sosTotal >= 6
          ? `SOS ≥ 6 (${sosTotal}/28) — Alto riesgo de sepsis grave e ingreso a UCI`
          : `SOS ${sosTotal}/28 con signo crítico MEOWS (${meowsRedTriggers.join(', ')})`;
      clinicalInterpretation =
        sosTotal >= 6
          ? 'Un puntaje SOS ≥ 6 supera el umbral validado por Albright et al. para morbilidad grave por sepsis obstétrica y necesidad probable de cuidados intensivos.'
          : 'Aunque el SOS cuantitativo es < 6, existen signos críticos de alarma materna (hipotensión o deterioro neurológico) que requieren activación inmediata de código sepsis.';
      guidance.push(
        'Activar protocolo de sepsis materna ("hora dorada"): hemocultivos + cultivos de foco previo a antibióticos sin retrasar inicio de antimicrobianos IV de amplio espectro en < 1 h.',
        'Reanimación hídrica cautelosa guiada por respuesta (cristaloides balanceados 30 mL/kg si hipotensión o lactato ≥ 4 mmol/L, evitando sobrecarga si preeclampsia concomitante).',
        'Valoración conjunta por Obstetricia y Medicina Crítica / UCI, monitoreo fetal continuo (si feto viable) y control del foco infeccioso.',
      );
    } else if (sosTotal >= 3 || meowsRedTriggers.length > 0) {
      severity = 'high';
      riskClassification = `SOS ${sosTotal}/28 (Riesgo intermedio) · ${meowsRedTriggers.length} alerta(s) MEOWS`;
      clinicalInterpretation =
        'Puntaje SOS por debajo del corte de UCI (6 pts), pero con alteración fisiológica o disparadores MEOWS que exigen evaluación médica presencial inmediata, toma de laboratorio completa y vigilancia seriada.';
      guidance.push(
        'Evaluar foco infeccioso (vía urinaria, útero/anexos, pulmón, herida quirúrgica, mama), solicitar lactato/hemocultivos y repetir constantes cada 15–30 min.',
        'Si lactato ≥ 2 mmol/L o ≥ 2 alertas rojas persistentes, escalar manejo como sepsis materna probable.',
      );
    } else {
      severity = 'normal';
      riskClassification = `SOS ${sosTotal}/28 (< 6) — Riesgo bajo de deterioro grave / UCI`;
      clinicalInterpretation =
        'Sin criterios SOS de alto riesgo ni disparadores MEOWS agudos en los parámetros ingresados (alto valor predictivo negativo para UCI, aunque debe vigilarse evolución clínica si hay sospecha de infección).';
      guidance.push(
        'Continuar vigilancia clínica habitual y reevaluar si aparece fiebre, taquicardia materna persistente, taquipnea fetal o nuevo deterioro.',
      );
    }

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Desglose SOS (Temp / PAS / FC / FR / SpO₂ / Leuco / Bandas / Lactato)',
        formattedValue: `${pTemp} / ${pSbp} / ${pHr} / ${pRr} / ${pSpo2} / ${pWbc} / ${pBands} / ${pLactate}`,
        unit: 'pts',
      },
      {
        label: 'Disparadores de Alerta Temprana (MEOWS)',
        formattedValue: `${meowsRedTriggers.length}`,
        unit: meowsRedTriggers.length > 0 ? 'alerta(s)' : 'sin alertas',
        note: meowsRedTriggers.length > 0 ? meowsRedTriggers.join(' · ') : 'Constantes dentro de rango basal MEOWS.',
      },
      {
        label: 'Lactato sérico evaluado',
        formattedValue: formatClinicalNumber(lactate, 1),
        unit: 'mmol/L',
        note: lactate >= 4 ? '≥ 4.0 mmol/L (+2 pts SOS · hipoperfusión significativa).' : lactate >= 2 ? '2.0–3.9 mmol/L (zona intermedia; repetir tras reanimación).' : '< 2.0 mmol/L.',
      },
    ];

    return {
      primaryResult: {
        label: 'Sepsis in Obstetrics Score (SOS)',
        value: sosTotal,
        formattedValue: `${sosTotal} / 28`,
        unit: sosTotal >= 6 ? 'Umbral crítico ≥ 6' : 'pts (corte ≥ 6)',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer:
        'Ninguna escala reemplaza el juicio clínico; ante sospecha firme de sepsis materna o compromiso fetal iniciar antibióticos y resucitación sin demora.',
      formulaUsed: 'Albright Sepsis in Obstetrics Score (0–28 pts) + verificación simultánea MEOWS',
      inputsSummary: `T ${formatClinicalNumber(temp, 1)}°C · PAS ${roundClinical(sbp, 0)} · FC ${roundClinical(hr, 0)} · FR ${roundClinical(rr, 0)} · SpO₂ ${roundClinical(spo2, 0)}% · Leuco ${formatClinicalNumber(wbc, 1)}k · Bandas ${roundClinical(bands, 0)}% · Lactato ${formatClinicalNumber(lactate, 1)}`,
    };
  },
};
