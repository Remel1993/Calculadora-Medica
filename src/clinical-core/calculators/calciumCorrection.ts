import {
  formatClinicalNumber,
  getCanonicalNumberValue,
  roundClinical,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SeverityLevel,
} from '../types/clinical.ts';
import { ALBUMIN_UNITS_G_DL, CALCIUM_UNITS_MG_DL } from '../units/converters.ts';

const calciumField: NumberFieldDef = {
  id: 'calcium',
  label: 'Calcio sérico total medido',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: CALCIUM_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 3.0,
  max: 20.0,
  placeholder: '7.8',
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
  placeholder: '2.5',
};

export const calciumCorrectionCalculator: CalculatorDefinition = {
  id: 'calcium-correction',
  name: 'Corrección de Calcio por Albúmina (Payne)',
  shortName: 'Calcio corregido',
  primarySpecialty: 'endocrinologia',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'formulas',
  keywords: [
    'calcio corregido',
    'payne',
    'hipocalcemia',
    'hipercalcemia',
    'albumina',
    'hipoalbuminemia',
  ],
  description:
    'Estima la calcemia total corregida para concentraciones alteradas de albúmina sérica mediante la ecuación clásica de Payne.',
  clinicalIndication:
    'Tamizaje inicial cuando existe hipoalbuminemia y no se dispone de medición directa de calcio iónico.',
  validatedPopulation: 'Adultos ambulatorios u hospitalizados estables con hipoalbuminemia.',
  requiredLabsNote: 'Requiere calcio sérico total y albúmina sérica de la misma muestra.',
  contraindications: [
    'No sustituye al calcio iónico en pacientes críticos, UCI, enfermedad renal crónica avanzada, trasfusión masiva o alteraciones graves del pH.',
  ],
  limitations: [
    'La fórmula de Payne asume unión constante a albúmina, la cual se altera por el pH (la alcalosis aumenta la unión y reduce el calcio iónico; la acidosis lo aumenta), ácidos grasos libres o paraproteínas.',
    'Estudios recientes muestran discordancia frecuente entre el calcio corregido por Payne y el calcio iónico medido en hospitalizados.',
  ],
  version: 'Fórmula de Payne (1973)',
  references: [
    {
      citation:
        'Payne RB, Little AJ, Williams RB, Milner JR. Interpretation of serum calcium in patients with abnormal serum proteins. Br Med J. 1973;4(5893):643-646.',
      year: 1973,
    },
    {
      citation:
        'Lian IA, Åsberg A. Should total calcium be adjusted for albumin? A retrospective observational study of laboratory data from central Norway. BMJ Open. 2018;8(4):e017703.',
      year: 2018,
    },
  ],
  fields: [calciumField, albuminField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(calciumCorrectionCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const caRes = getCanonicalNumberValue(calciumField, inputs.calcium as NumberInputValue);
    const albRes = getCanonicalNumberValue(albuminField, inputs.albumin as NumberInputValue);

    const caMgDl = caRes.canonicalValue!;
    const albGdl = albRes.canonicalValue!;

    const rawCorrMgDl = caMgDl + 0.8 * (4.0 - albGdl);
    const corrMgDl = roundClinical(rawCorrMgDl, 2);
    const corrMmolL = roundClinical(rawCorrMgDl / 4.008, 2);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (corrMgDl < 8.5) {
      severity = corrMgDl < 7.5 ? 'critical' : 'moderate';
      riskClassification =
        corrMgDl < 7.5
          ? 'Hipocalcemia grave estimada (< 7.5 mg/dL)'
          : 'Hipocalcemia estimada (< 8.5 mg/dL)';
      clinicalInterpretation =
        'Calcemia corregida por debajo del rango de referencia habitual (8.5–10.5 mg/dL). Evaluar síntomas neuromusculares, QT en ECG y confirmar con calcio iónico.';
    } else if (corrMgDl <= 10.5) {
      severity = 'normal';
      riskClassification = 'Normocalcemia estimada (8.5 – 10.5 mg/dL)';
      clinicalInterpretation =
        'Dentro del rango de referencia habitual tras ajuste por albúmina.';
    } else if (corrMgDl < 12.0) {
      severity = 'moderate';
      riskClassification = 'Hipercalcemia leve estimada (10.6 – 11.9 mg/dL)';
      clinicalInterpretation =
        'Elevación leve; investigar PTH, vitamina D y función renal.';
    } else if (corrMgDl < 14.0) {
      severity = 'high';
      riskClassification = 'Hipercalcemia moderada estimada (12.0 – 13.9 mg/dL)';
      clinicalInterpretation =
        'Elevación moderada; valorar hidratación, ECG y etiología (hiperparatiroidismo, neoplasia).';
    } else {
      severity = 'critical';
      riskClassification = 'Hipercalcemia grave estimada (≥ 14.0 mg/dL)';
      clinicalInterpretation =
        'Hipercalcemia grave con riesgo de compromiso neurológico, renal y arrítmico; requiere confirmación urgente con calcio iónico y evaluación hospitalaria.';
    }

    return {
      primaryResult: {
        label: 'Calcio corregido por albúmina',
        value: corrMgDl,
        formattedValue: formatClinicalNumber(corrMgDl, 2),
        unit: 'mg/dL',
      },
      secondaryResults: [
        {
          label: 'Equivalente en unidades SI',
          formattedValue: formatClinicalNumber(corrMmolL, 2),
          unit: 'mmol/L',
          note: 'Rango habitual aproximado: 2.12 – 2.62 mmol/L',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: [
        'Si existe trastorno ácido-base, enfermedad crítica o discordancia con la clínica, medir directamente calcio iónico sérico.',
      ],
      guidanceDisclaimer: 'Fórmula de estimación bioquímica; el calcio iónico es el patrón de referencia fisiológico.',
      formulaUsed: 'Ca²⁺ corr (mg/dL) = Ca²⁺ total (mg/dL) + 0.8 × (4.0 - Albúmina g/dL)',
      inputsSummary: `Ca²⁺ medido: ${caRes.rawNumber} ${caRes.unitLabel} · Albúmina: ${albRes.rawNumber} ${albRes.unitLabel}`,
    };
  },
};
