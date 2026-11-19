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
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';
import { ALBUMIN_UNITS_G_DL, BILIRUBIN_UNITS_MG_DL } from '../units/converters.ts';

const bilirubinField: NumberFieldDef = {
  id: 'bilirubin',
  label: 'Bilirrubina total',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: BILIRUBIN_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 0.1,
  max: 50,
  placeholder: '2.4',
};

const albuminField: NumberFieldDef = {
  id: 'albumin',
  label: 'Albúmina sérica',
  type: 'number',
  canonicalUnit: 'g/dL',
  units: ALBUMIN_UNITS_G_DL,
  defaultUnitId: 'g_dl',
  min: 0.5,
  max: 7.0,
  placeholder: '3.1',
};

const inrField: NumberFieldDef = {
  id: 'inr',
  label: 'INR',
  type: 'number',
  canonicalUnit: 'INR',
  units: [{ id: 'inr', label: 'INR', toCanonical: (v) => v, min: 0.5, max: 12, step: 0.05 }],
  defaultUnitId: 'inr',
  min: 0.5,
  max: 12,
  placeholder: '1.6',
};

const ascitesField: SelectFieldDef = {
  id: 'ascites',
  label: 'Ascitis',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '1', label: 'Ausente (1 pt)', points: 1 },
    { value: '2', label: 'Leve / controlada con diuréticos (2 pts)', points: 2 },
    { value: '3', label: 'Moderada a severa / refractaria (3 pts)', points: 3 },
  ],
};

const encephalopathyField: SelectFieldDef = {
  id: 'encephalopathy',
  label: 'Encefalopatía hepática',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '1', label: 'Ausente (1 pt)', points: 1 },
    { value: '2', label: 'Grado I – II (o controlada) (2 pts)', points: 2 },
    { value: '3', label: 'Grado III – IV (3 pts)', points: 3 },
  ],
};

export const childPughCalculator: CalculatorDefinition = {
  id: 'child-pugh',
  name: 'Clasificación de Child-Pugh (Cirrosis Hepática)',
  shortName: 'Child-Pugh',
  primarySpecialty: 'gastroenterologia',
  secondarySpecialties: ['medicina-interna', 'cirugia-general'],
  subcategory: 'gravedad',
  keywords: ['child-pugh', 'child', 'cirrosis', 'hepatopatia', 'ascitis', 'encefalopatia', 'insuficiencia hepatica'],
  description:
    'Evalúa el pronóstico y la gravedad de la cirrosis hepática (5–15 puntos, Clases A, B y C) y orienta el riesgo quirúrgico y ajuste farmacológico.',
  clinicalIndication:
    'Estadificación pronóstica en pacientes con cirrosis hepática compensada o descompensada y valoración preoperatoria o posológica.',
  validatedPopulation: 'Adultos con cirrosis hepática establecida.',
  requiredLabsNote: 'Requiere bilirrubina total, albúmina sérica e INR recientes.',
  contraindications: [
    'No valida gravedad en falla hepática aguda fulminante sin cirrosis previa.',
    'El INR pierde precisión si el paciente recibe anticoagulantes antagonistas de la vitamina K o DOACs.',
  ],
  limitations: [
    'En enfermedades colestásicas crónicas (CBP/CEP), algunas guías ajustan los cortes de bilirrubina a < 4, 4–10 y > 10 mg/dL.',
    'Contiene parámetros parcialmente subjetivos (ascitis y encefalopatía); para priorización de trasplante hepático se prefiere MELD / MELD-Na.',
  ],
  version: 'Pugh et al. (1973)',
  references: [
    {
      citation:
        'Pugh RN, Murray-Lyon IM, Dawson JL, Pietroni MC, Williams R. Transection of the oesophagus for bleeding oesophageal varices. Br J Surg. 1973;60(8):646-649.',
      year: 1973,
    },
  ],
  fields: [bilirubinField, albuminField, inrField, ascitesField, encephalopathyField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(childPughCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const bilRes = getCanonicalNumberValue(bilirubinField, inputs.bilirubin as NumberInputValue);
    const albRes = getCanonicalNumberValue(albuminField, inputs.albumin as NumberInputValue);
    const inrRes = getCanonicalNumberValue(inrField, inputs.inr as NumberInputValue);

    const bil = bilRes.canonicalValue!;
    const alb = albRes.canonicalValue!;
    const inr = inrRes.canonicalValue!;

    const bilPts = bil < 2.0 ? 1 : bil <= 3.0 ? 2 : 3;
    const albPts = alb > 3.5 ? 1 : alb >= 2.8 ? 2 : 3;
    const inrPts = inr < 1.7 ? 1 : inr <= 2.3 ? 2 : 3;
    const ascPts = Number(inputs.ascites);
    const encPts = Number(inputs.encephalopathy);

    const total = bilPts + albPts + inrPts + ascPts + encPts;

    let childClass: 'A' | 'B' | 'C' = 'A';
    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let survivalNote = '';

    if (total <= 6) {
      childClass = 'A';
      severity = 'low';
      survivalNote = 'Supervivencia aprox. 1 año: ~100 % · 2 años: ~85 %';
      riskClassification = `Clase A — Enfermedad compensada (${total} / 15 puntos)`;
      clinicalInterpretation =
        'Cirrosis hepática compensada con reserva funcional relativamente preservada y menor riesgo perioperatorio (~10 % mortalidad en cirugía abdominal mayor).';
    } else if (total <= 9) {
      childClass = 'B';
      severity = 'moderate';
      survivalNote = 'Supervivencia aprox. 1 año: ~80 % · 2 años: ~60 %';
      riskClassification = `Clase B — Compromiso funcional significativo (${total} / 15 puntos)`;
      clinicalInterpretation =
        'Disfunción hepática moderada; muchos fármacos de metabolismo hepático requieren reducción de dosis y la cirugía mayor conlleva riesgo elevado (~30 %).';
    } else {
      childClass = 'C';
      severity = 'critical';
      survivalNote = 'Supervivencia aprox. 1 año: ~45 % · 2 años: ~35 %';
      riskClassification = `Clase C — Cirrosis descompensada (${total} / 15 puntos)`;
      clinicalInterpretation =
        'Enfermedad hepática avanzada descompensada con alto riesgo de mortalidad y complicaciones; evaluar elegibilidad para trasplante hepático o cuidados integrales.';
    }

    return {
      primaryResult: {
        label: `Child-Pugh Clase ${childClass}`,
        value: total,
        formattedValue: `${total} (Clase ${childClass})`,
        unit: 'puntos (5–15)',
      },
      secondaryResults: [
        { label: 'Supervivencia estimada', formattedValue: survivalNote, unit: '' },
        { label: 'Desglose (Bil/Alb/INR/Asc/Enc)', formattedValue: `${bilPts}/${albPts}/${inrPts}/${ascPts}/${encPts}`, unit: 'pts' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: [
        'Calcular también MELD-Na cuando se evalúe pronóstico a corto plazo o derivación a programa de trasplante.',
        'Revisar ficha técnica para ajuste posológico hepático (especialmente en Child-Pugh B y C).',
      ],
      guidanceDisclaimer: 'La mortalidad quirúrgica depende además del tipo de cirugía y puntuación MELD.',
      formulaUsed: 'Suma de 5 parámetros (1–3 pts c/u): Bilirrubina + Albúmina + INR + Ascitis + Encefalopatía',
      inputsSummary: `Bil: ${formatClinicalNumber(bil, 2)} mg/dL · Alb: ${formatClinicalNumber(alb, 2)} g/dL · INR: ${formatClinicalNumber(inr, 2)} · Ascitis: ${ascPts} · Encefalopatía: ${encPts}`,
    };
  },
};
