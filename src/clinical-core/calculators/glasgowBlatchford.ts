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
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';
import {
  BP_UNITS_MMHG,
  BUN_OR_UREA_UNITS_MG_DL_BUN,
  HR_UNITS_BPM,
} from '../units/converters.ts';

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

const hbField: NumberFieldDef = {
  id: 'hemoglobin',
  label: 'Hemoglobina (Hb)',
  type: 'number',
  canonicalUnit: 'g/dL',
  units: [
    { id: 'g_dl', label: 'g/dL', toCanonical: (v) => v, min: 2, max: 24, step: 0.1 },
    { id: 'g_l', label: 'g/L', toCanonical: (v) => v / 10, min: 20, max: 240, step: 1 },
  ],
  defaultUnitId: 'g_dl',
  min: 2,
  max: 24,
  placeholder: '11.2',
};

const bunField: NumberFieldDef = {
  id: 'bun',
  label: 'BUN o Urea sérica',
  type: 'number',
  canonicalUnit: 'BUN mg/dL',
  units: BUN_OR_UREA_UNITS_MG_DL_BUN,
  defaultUnitId: 'bun_mg_dl',
  min: 1,
  max: 300,
  placeholder: '22',
  helpText: 'Selecciona BUN mg/dL, Urea mg/dL o mmol/L para evitar errores de conversión.',
};

const sbpField: NumberFieldDef = {
  id: 'sbp',
  label: 'Presión arterial sistólica (PAS)',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  min: 40,
  max: 260,
  placeholder: '112',
};

const hrField: NumberFieldDef = {
  id: 'hr',
  label: 'Frecuencia cardíaca',
  type: 'number',
  canonicalUnit: 'lpm',
  units: HR_UNITS_BPM,
  defaultUnitId: 'bpm',
  min: 25,
  max: 240,
  placeholder: '96',
};

const melenaField: BooleanFieldDef = {
  id: 'melena',
  label: 'Presentación con melena',
  type: 'boolean',
  trueLabel: 'Sí (+1)',
  falseLabel: 'No (0)',
  defaultValue: false,
};

const syncopeField: BooleanFieldDef = {
  id: 'syncope',
  label: 'Síncope al ingreso',
  type: 'boolean',
  trueLabel: 'Sí (+2)',
  falseLabel: 'No (0)',
  defaultValue: false,
};

const liverField: BooleanFieldDef = {
  id: 'liverDisease',
  label: 'Antecedente o evidencia de hepatopatía',
  type: 'boolean',
  trueLabel: 'Sí (+2)',
  falseLabel: 'No (0)',
  defaultValue: false,
};

const hfField: BooleanFieldDef = {
  id: 'heartFailure',
  label: 'Insuficiencia cardíaca',
  type: 'boolean',
  trueLabel: 'Sí (+2)',
  falseLabel: 'No (0)',
  defaultValue: false,
};

export const glasgowBlatchfordCalculator: CalculatorDefinition = {
  id: 'glasgow-blatchford',
  name: 'Escala de Glasgow-Blatchford (GBS — Hemorragia Digestiva Alta)',
  shortName: 'Glasgow-Blatchford',
  primarySpecialty: 'gastroenterologia',
  secondarySpecialties: ['urgencias', 'medicina-interna'],
  subcategory: 'gravedad',
  keywords: [
    'gbs',
    'glasgow-blatchford',
    'hemorragia digestiva alta',
    'hda',
    'sangrado digestivo',
    'melena',
    'hematemesis',
    'endoscopia',
  ],
  description:
    'Estratifica el riesgo pre-endoscópico en hemorragia digestiva alta (0–23 puntos) para predecir necesidad de transfusión, intervención endoscópica/quirúrgica o muerte.',
  clinicalIndication:
    'Evaluación inicial en urgencias de pacientes adultos con hemorragia digestiva alta aguda (hematemesis, melena o vómito en posos de café).',
  validatedPopulation: 'Adultos ≥ 18 años con hemorragia digestiva alta aguda no variceal o mixta.',
  requiredLabsNote: 'Requiere hemoglobina y BUN/urea sérica, además de signos vitales.',
  contraindications: [
    'No utilizar como único criterio para alta ambulatoria si existe sospecha de sangrado variceal activo, inestabilidad hemodinámica o comorbilidad grave.',
  ],
  limitations: [
    'Aunque el punto de corte clásico de muy bajo riesgo es GBS = 0, las guías ESGE (2021) y estudios multicéntricos (Stanley et al., BMJ 2017) avalan que GBS ≤ 1 identifica muy bajo riesgo con seguridad similar para manejo ambulatorio.',
    'Tiene alta sensibilidad pero baja especificidad para predecir intervención en puntuaciones intermedias o altas.',
  ],
  version: 'Blatchford et al. (2000) / ESGE 2021',
  references: [
    {
      citation:
        'Blatchford O, Murray WR, Blatchford M. A risk score to predict need for treatment for upper-gastrointestinal haemorrhage. Lancet. 2000;356(9238):1318-1321.',
      year: 2000,
    },
    {
      citation:
        'Gralnek IM, Stanley AJ, Morris AJ, et al. Endoscopic diagnosis and management of nonvariceal upper gastrointestinal hemorrhage (NVUGIH): ESGE Guideline Update 2021. Endoscopy. 2021;53(3):300-332.',
      year: 2021,
    },
  ],
  fields: [sexField, hbField, bunField, sbpField, hrField, melenaField, syncopeField, liverField, hfField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(glasgowBlatchfordCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const sex = inputs.sex as string;
    const hbRes = getCanonicalNumberValue(hbField, inputs.hemoglobin as NumberInputValue);
    const bunRes = getCanonicalNumberValue(bunField, inputs.bun as NumberInputValue);
    const sbpRes = getCanonicalNumberValue(sbpField, inputs.sbp as NumberInputValue);
    const hrRes = getCanonicalNumberValue(hrField, inputs.hr as NumberInputValue);

    const hb = hbRes.canonicalValue!;
    const bunMgDl = bunRes.canonicalValue!;
    const ureaMmolL = roundClinical(bunMgDl / 2.8011, 2);
    const sbp = sbpRes.canonicalValue!;
    const hr = hrRes.canonicalValue!;

    let bunPts = 0;
    if (ureaMmolL >= 25.0) bunPts = 6;
    else if (ureaMmolL >= 10.0) bunPts = 4;
    else if (ureaMmolL >= 8.0) bunPts = 3;
    else if (ureaMmolL >= 6.5) bunPts = 2;

    let hbPts = 0;
    if (sex === 'male') {
      if (hb < 10.0) hbPts = 6;
      else if (hb < 12.0) hbPts = 3;
      else if (hb < 13.0) hbPts = 1;
    } else {
      if (hb < 10.0) hbPts = 6;
      else if (hb < 12.0) hbPts = 1;
    }

    let sbpPts = 0;
    if (sbp < 90) sbpPts = 3;
    else if (sbp < 100) sbpPts = 2;
    else if (sbp < 110) sbpPts = 1;

    const hrPts = hr >= 100 ? 1 : 0;
    const melenaPts = inputs.melena ? 1 : 0;
    const syncopePts = inputs.syncope ? 2 : 0;
    const liverPts = inputs.liverDisease ? 2 : 0;
    const hfPts = inputs.heartFailure ? 2 : 0;

    const total = bunPts + hbPts + sbpPts + hrPts + melenaPts + syncopePts + liverPts + hfPts;

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (total <= 1) {
      severity = 'low';
      riskClassification = `Muy bajo riesgo (GBS ${total} / 23 puntos)`;
      clinicalInterpretation =
        'Probabilidad muy baja (< 1–2 %) de requerir transfusión o intervención endoscópica urgente.';
      guidance = [
        'Candidato potencial a manejo ambulatorio y endoscopia diferida (ESGE/ACG), siempre que no haya hematemesis activa, sospecha variceal ni barreras de seguimiento.',
      ];
    } else if (total <= 5) {
      severity = 'moderate';
      riskClassification = `Riesgo moderado (GBS ${total} / 23 puntos)`;
      clinicalInterpretation =
        'Riesgo significativo de requerir ingreso hospitalario, evaluación endoscópica temprana y posible terapia hemostática.';
      guidance = [
        'Hospitalización, accesos venosos, tipificación/cruce y endoscopia digestiva alta en las primeras 24 horas tras estabilización.',
      ];
    } else {
      severity = total >= 12 ? 'critical' : 'high';
      riskClassification = `Alto riesgo (GBS ${total} / 23 puntos)`;
      clinicalInterpretation =
        'Alta probabilidad de requerir transfusión, intervención endoscópica/radiológica/quirúrgica y vigilancia estrecha.';
      guidance = [
        'Reanimación hemodinámica prioritaria, reserva de hemoderivados y endoscopia precoz tras estabilización inicial.',
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación Glasgow-Blatchford (GBS)',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 23)',
      },
      secondaryResults: [
        { label: 'Urea equivalente', formattedValue: formatClinicalNumber(ureaMmolL, 1), unit: 'mmol/L' },
        { label: 'Puntos BUN/Urea + Hb', formattedValue: `${bunPts} + ${hbPts}`, unit: 'pts' },
        { label: 'Puntos hemodinámica + clínica', formattedValue: `${sbpPts + hrPts} + ${melenaPts + syncopePts + liverPts + hfPts}`, unit: 'pts' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'Complementar siempre con evaluación clínica directa y estratificación endoscópica (Rockall / Forrest).',
      formulaUsed: 'BUN/Urea (0–6) + Hb por sexo (0–6) + PAS (0–3) + FC≥100 (+1) + Melena (+1) + Síncope (+2) + Hepatopatía (+2) + IC (+2)',
      inputsSummary: `Sexo: ${sex === 'male' ? 'M' : 'F'} · Hb: ${hbRes.rawNumber} ${hbRes.unitLabel} · BUN/Urea: ${bunRes.rawNumber} ${bunRes.unitLabel} · PAS: ${sbp} · FC: ${hr}`,
    };
  },
};
