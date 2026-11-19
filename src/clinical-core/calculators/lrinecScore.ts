import {
  formatClinicalNumber,
  getCanonicalNumberValue,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SeverityLevel,
} from '../types/clinical.ts';
import { ELECTROLYTE_UNITS_MEQ_L, GLUCOSE_UNITS_MG_DL } from '../units/converters.ts';

const crpField: NumberFieldDef = {
  id: 'crp',
  label: 'Proteína C reactiva (PCR)',
  type: 'number',
  canonicalUnit: 'mg/L',
  units: [
    { id: 'mg_l', label: 'mg/L', toCanonical: (v) => v, min: 0, max: 1000, step: 1 },
    { id: 'mg_dl', label: 'mg/dL', toCanonical: (v) => v * 10, min: 0, max: 100, step: 0.1 },
  ],
  defaultUnitId: 'mg_l',
  min: 0,
  max: 1000,
  placeholder: '185',
  helpText: 'Umbral LRINEC: ≥ 150 mg/L (equivalente a ≥ 15 mg/dL).',
};

const wbcField: NumberFieldDef = {
  id: 'wbc',
  label: 'Leucocitos totales',
  type: 'number',
  canonicalUnit: '×10³/µL',
  units: [
    { id: '10e3_ul', label: '×10³/µL', toCanonical: (v) => v, min: 0.1, max: 150, step: 0.1 },
    { id: 'cells_ul', label: 'cél/µL (/mm³)', toCanonical: (v) => v / 1000, min: 100, max: 150000, step: 100 },
  ],
  defaultUnitId: '10e3_ul',
  min: 0.1,
  max: 150,
  placeholder: '19.5',
};

const hbField: NumberFieldDef = {
  id: 'hb',
  label: 'Hemoglobina',
  type: 'number',
  canonicalUnit: 'g/dL',
  units: [
    { id: 'g_dl', label: 'g/dL', toCanonical: (v) => v, min: 3, max: 22, step: 0.1 },
    { id: 'g_l', label: 'g/L', toCanonical: (v) => v / 10, min: 30, max: 220, step: 1 },
  ],
  defaultUnitId: 'g_dl',
  min: 3,
  max: 22,
  placeholder: '10.6',
};

const sodiumField: NumberFieldDef = {
  id: 'sodium',
  label: 'Sodio sérico (Na⁺)',
  type: 'number',
  canonicalUnit: 'mEq/L',
  units: ELECTROLYTE_UNITS_MEQ_L,
  defaultUnitId: 'meq_l',
  min: 100,
  max: 175,
  placeholder: '131',
};

const creatinineField: NumberFieldDef = {
  id: 'creatinine',
  label: 'Creatinina sérica',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: [
    { id: 'mg_dl', label: 'mg/dL', toCanonical: (v) => v, min: 0.2, max: 20, step: 0.1 },
    { id: 'umol_l', label: 'µmol/L', toCanonical: (v) => v / 88.4, min: 18, max: 1768, step: 1 },
  ],
  defaultUnitId: 'mg_dl',
  min: 0.2,
  max: 20,
  placeholder: '1.8',
  helpText: 'Umbral original Wong (2004): > 1.6 mg/dL (> 141 µmol/L).',
};

const glucoseField: NumberFieldDef = {
  id: 'glucose',
  label: 'Glucosa sérica',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: GLUCOSE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 20,
  max: 1500,
  placeholder: '210',
};

export const lrinecScoreCalculator: CalculatorDefinition = {
  id: 'lrinec-score',
  name: 'LRINEC Score (Sospecha de Fascitis Necrotizante)',
  shortName: 'LRINEC Score',
  primarySpecialty: 'urgencias',
  secondarySpecialties: ['cirugia-general', 'infectologia', 'dermatologia'],
  subcategory: 'diagnostico',
  keywords: ['lrinec', 'fascitis necrotizante', 'infeccion partes blandas', 'celulitis', 'gangrena', 'cirugia urgente'],
  description:
    'Indicador de riesgo de laboratorio para fascitis necrotizante (0–13 puntos) basado en PCR, leucocitos, hemoglobina, sodio, creatinina y glucosa.',
  clinicalIndication:
    'Apoyo diagnóstico en infecciones graves de piel y partes blandas para distinguir fascitis necrotizante temprana de celulitis grave.',
  validatedPopulation: 'Adultos con infección grave de partes blandas ingresados en urgencias o cirugía.',
  requiredLabsNote: 'Requiere PCR, hemograma, electrolitos, creatinina y glucosa sérica.',
  contraindications: [
    'NUNCA utilizar un LRINEC bajo (≤ 5 puntos) para descartar fascitis necrotizante ni retrasar el desbridamiento quirúrgico cuando hay signos clínicos de alarma.',
  ],
  limitations: [
    'Advertencia crítica de seguridad: estudios externos y metaanálisis (Fernando et al., Ann Surg 2019) demostraron sensibilidad limitada (~59–68 % para LRINEC ≥ 6). El dolor desproporcionado respecto a los hallazgos cutáneos, rápida progresión, ampollas hemorrágicas, crepitación, anestesia cutánea o inestabilidad hemodinámica obligan a exploración quirúrgica urgente aunque el LRINEC sea bajo.',
  ],
  version: 'Wong et al. (Crit Care Med, 2004)',
  references: [
    {
      citation:
        'Wong CH, Khin LW, Heng KS, Tan KC, Low CO. The LRINEC (Laboratory Risk Indicator for Necrotizing Fasciitis) score: a tool for distinguishing necrotizing fasciitis from other soft tissue infections. Crit Care Med. 2004;32(7):1535-1541.',
      year: 2004,
    },
    {
      citation:
        'Fernando SM, Tran A, Cheng W, et al. Necrotizing Soft Tissue Infection: Diagnostic Accuracy of Physical Examination, Imaging, and LRINEC Score: A Systematic Review and Meta-Analysis. Ann Surg. 2019;269(1):58-65.',
      year: 2019,
    },
  ],
  fields: [crpField, wbcField, hbField, sodiumField, creatinineField, glucoseField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(lrinecScoreCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const crp = getCanonicalNumberValue(crpField, inputs.crp as NumberInputValue).canonicalValue!;
    const wbc = getCanonicalNumberValue(wbcField, inputs.wbc as NumberInputValue).canonicalValue!;
    const hb = getCanonicalNumberValue(hbField, inputs.hb as NumberInputValue).canonicalValue!;
    const na = getCanonicalNumberValue(sodiumField, inputs.sodium as NumberInputValue).canonicalValue!;
    const cr = getCanonicalNumberValue(creatinineField, inputs.creatinine as NumberInputValue).canonicalValue!;
    const glu = getCanonicalNumberValue(glucoseField, inputs.glucose as NumberInputValue).canonicalValue!;

    const pCrp = crp >= 150 ? 4 : 0;
    const pWbc = wbc > 25 ? 2 : wbc >= 15 ? 1 : 0;
    const pHb = hb < 11.0 ? 2 : hb <= 13.5 ? 1 : 0;
    const pNa = na < 135 ? 2 : 0;
    const pCr = cr > 1.6 ? 2 : 0;
    const pGlu = glu > 180 ? 1 : 0;

    const total = pCrp + pWbc + pHb + pNa + pCr + pGlu;

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (total <= 5) {
      severity = 'low';
      riskClassification = `Riesgo bajo en laboratorio (LRINEC ${total} / 13) — NO descarta infección necrotizante`;
      clinicalInterpretation =
        'En la cohorte original correspondió a < 50 % de probabilidad, pero su sensibilidad externa (~68 %) impide excluir fascitis necrotizante si la clínica es sospechosa.';
      guidance = [
        'Si existe dolor desproporcionado, progresión rápida, toxicidad sistémica, crepitación o bulas hemorrágicas: solicitar valoración quirúrgica inmediata pese a LRINEC ≤ 5.',
      ];
    } else if (total <= 7) {
      severity = 'high';
      riskClassification = `Riesgo intermedio (LRINEC ${total} / 13 — 50 a 75 % probabilidad)`;
      clinicalInterpretation =
        'Alteración bioquímica significativa compatible con infección necrotizante de partes blandas.';
      guidance = [
        'Interconsulta urgente a Cirugía General, hemocultivos, antibióticoterapia empírica de amplio espectro (cobertura polimicrobiana + antitoxina tipo clindamicina/linezolid) y reevaluación seriada horaria.',
      ];
    } else {
      severity = 'critical';
      riskClassification = `Alto riesgo (LRINEC ${total} / 13 ≥ 8 — > 75 % probabilidad)`;
      clinicalInterpretation =
        'Alta probabilidad bioquímica de fascitis necrotizante; emergencia médico-quirúrgica.';
      guidance = [
        'EMERGENCIA QUIRÚRGICA: Desbridamiento quirúrgico inmediato sin demorar por estudios de imagen complejos, resucitación hemodinámica y antibióticoterapia IV inmediata.',
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación LRINEC',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 13)',
      },
      secondaryResults: [
        { label: 'Desglose (PCR/WBC/Hb/Na/Cr/Glu)', formattedValue: `${pCrp}/${pWbc}/${pHb}/${pNa}/${pCr}/${pGlu}`, unit: 'pts' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'El diagnóstico definitivo de fascitis necrotizante es clínico-quirúrgico ("finger test" / hallazgos operatorios).',
      formulaUsed: 'PCR ≥150 (+4) + WBC (0,1,2) + Hb (0,1,2) + Na <135 (+2) + Cr >1.6 (+2) + Glu >180 (+1)',
      inputsSummary: `PCR: ${formatClinicalNumber(crp, 0)} mg/L · WBC: ${wbc} · Hb: ${hb} · Na: ${na} · Cr: ${formatClinicalNumber(cr, 2)} · Glu: ${glu}`,
    };
  },
};
