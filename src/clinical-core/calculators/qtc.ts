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
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';
import { HR_UNITS_BPM } from '../units/converters.ts';

const qtField: NumberFieldDef = {
  id: 'qt',
  label: 'Intervalo QT medido (en ECG)',
  type: 'number',
  canonicalUnit: 'ms',
  units: [{ id: 'ms', label: 'ms', toCanonical: (v) => v, min: 150, max: 900, step: 1 }],
  defaultUnitId: 'ms',
  min: 150,
  max: 900,
  placeholder: '400',
  helpText: 'Medido desde el inicio del QRS hasta el final de la onda T (preferentemente en DII o V5/V6).',
};

const hrField: NumberFieldDef = {
  id: 'hr',
  label: 'Frecuencia cardíaca (FC)',
  type: 'number',
  canonicalUnit: 'lpm',
  units: HR_UNITS_BPM,
  defaultUnitId: 'bpm',
  min: 25,
  max: 240,
  placeholder: '75',
};

const sexField: SelectFieldDef = {
  id: 'sex',
  label: 'Sexo (umbrales clínicos)',
  type: 'select',
  defaultValue: 'male',
  options: [
    { value: 'male', label: 'Masculino (normal < 450 ms)' },
    { value: 'female', label: 'Femenino (normal < 460 ms)' },
  ],
};

const formulaField: SelectFieldDef = {
  id: 'primaryFormula',
  label: 'Fórmula principal seleccionada',
  type: 'select',
  defaultValue: 'fridericia',
  helpText: 'Se calculan las 4 fórmulas simultáneamente; Fridericia y Framingham son más precisas fuera de 60–100 lpm.',
  options: [
    { value: 'fridericia', label: 'Fridericia (recomendada en taquicardia/bradicardia)' },
    { value: 'bazett', label: 'Bazett (clásica; sobrestima si FC > 100 lpm)' },
    { value: 'framingham', label: 'Framingham (lineal)' },
    { value: 'hodges', label: 'Hodges (lineal)' },
  ],
};

export const qtcCalculator: CalculatorDefinition = {
  id: 'qtc',
  name: 'QT Corregido (QTc — Bazett, Fridericia, Framingham y Hodges)',
  shortName: 'QTc (4 fórmulas)',
  primarySpecialty: 'cardiologia',
  secondarySpecialties: ['urgencias', 'medicina-interna'],
  subcategory: 'formulas',
  keywords: [
    'qtc',
    'qt corregido',
    'bazett',
    'fridericia',
    'framingham',
    'hodges',
    'torsades',
    'ecg',
    'arritmia',
  ],
  description:
    'Corrección del intervalo QT según la frecuencia cardíaca mediante las cuatro ecuaciones clínicas validadas.',
  clinicalIndication:
    'Evaluación de prolongación del QT antes o durante el uso de fármacos que prolongan el QT, alteraciones electrolíticas (K⁺, Mg²⁺, Ca²⁺) o síndrome de QT largo.',
  validatedPopulation: 'Adultos en ritmo sinusal regular con QRS estrecho (< 120 ms).',
  contraindications: [
    'En fibrilación auricular con RR muy variable usar promedio de 5–10 latidos.',
    'En bloqueo de rama o ritmo de marcapasos (QRS ≥ 120 ms), el QT total incluye la duración aumentada del QRS y requiere ajuste (p. ej. índice JT o fórmula específica).',
  ],
  limitations: [
    'La fórmula de Bazett sobrestima significativamente el QTc en taquicardia (FC > 100 lpm) y lo subestima en bradicardia (FC < 60 lpm). Guías actuales (AHA/ACC/HRS) prefieren Fridericia o ecuaciones lineales fuera de frecuencias normales.',
    'Un QTc ≥ 500 ms (o incremento > 60 ms respecto al basal) se asocia a riesgo elevado de Torsades de Pointes.',
  ],
  version: 'Bazett / Fridericia / Framingham / Hodges',
  references: [
    {
      citation:
        'Rautaharju PM, Surawicz B, Gettes LS, et al. AHA/ACCF/HRS Recommendations for the Standardization and Interpretation of the Electrocardiogram: Part IV: The ST Segment, T and U Waves, and the QT Interval. Circulation. 2009;119(10):e241-e250.',
      year: 2009,
    },
    {
      citation: 'Vandenberk B, Vandael E, Robyns T, et al. Which QT Correction Formulae to Use for QT Monitoring? J Am Heart Assoc. 2016;5(6):e003264.',
      year: 2016,
    },
  ],
  fields: [qtField, hrField, sexField, formulaField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(qtcCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const qt = getCanonicalNumberValue(qtField, inputs.qt as NumberInputValue).canonicalValue!;
    const hr = getCanonicalNumberValue(hrField, inputs.hr as NumberInputValue).canonicalValue!;
    const isFemale = inputs.sex === 'female';
    const primaryFormula = (inputs.primaryFormula as string) || 'fridericia';

    const rrSec = 60 / hr;
    const bazett = roundClinical(qt / Math.sqrt(rrSec), 0);
    const fridericia = roundClinical(qt / Math.cbrt(rrSec), 0);
    const framingham = roundClinical(qt + 154 * (1 - rrSec), 0);
    const hodges = roundClinical(qt + 1.75 * (hr - 60), 0);

    const mapVal: Record<string, { label: string; value: number; eq: string }> = {
      fridericia: { label: 'QTc Fridericia', value: fridericia, eq: 'QT / RR^(1/3)' },
      bazett: { label: 'QTc Bazett', value: bazett, eq: 'QT / √RR' },
      framingham: { label: 'QTc Framingham', value: framingham, eq: 'QT + 154 × (1 - RR)' },
      hodges: { label: 'QTc Hodges', value: hodges, eq: 'QT + 1.75 × (FC - 60)' },
    };

    const chosen = mapVal[primaryFormula] ?? mapVal.fridericia;
    const upperNormal = isFemale ? 460 : 450;

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (chosen.value < 350) {
      severity = 'moderate';
      riskClassification = `QTc corto (< 350 ms)`;
      clinicalInterpretation = 'Valor por debajo del rango habitual; considerar síndrome de QT corto o hipercalcemia/hiperpotasemia si es persistente.';
    } else if (chosen.value < upperNormal) {
      severity = 'normal';
      riskClassification = `QTc normal (< ${upperNormal} ms)`;
      clinicalInterpretation = 'Duración del intervalo QTc dentro de límites de referencia para el sexo seleccionado.';
    } else if (chosen.value < 500) {
      severity = 'moderate';
      riskClassification = `QTc prolongado (${upperNormal} – 499 ms)`;
      clinicalInterpretation =
        'Prolongación moderada del QTc. Revisar fármacos prolongadores del QT, potasio, magnesio y calcio.';
    } else {
      severity = 'critical';
      riskClassification = `QTc marcadamente prolongado (≥ 500 ms)`;
      clinicalInterpretation =
        'Alto riesgo de Torsades de Pointes. Suspender fármacos desencadenantes si procede, corregir K⁺/Mg²⁺ y mantener monitorización ECG continua.';
    }

    const hrWarning =
      hr > 100 || hr < 60
        ? [
            `Con FC ${hr} lpm fuera de 60–100 lpm, Bazett (${bazett} ms) tiende a distorsionar el valor; priorizar Fridericia (${fridericia} ms) o Framingham (${framingham} ms).`,
          ]
        : undefined;

    return {
      primaryResult: {
        label: chosen.label,
        value: chosen.value,
        formattedValue: String(chosen.value),
        unit: 'ms',
      },
      secondaryResults: [
        { label: 'Fridericia (QT / RR¹ᐟ³)', formattedValue: String(fridericia), unit: 'ms' },
        { label: 'Bazett (QT / √RR)', formattedValue: String(bazett), unit: 'ms' },
        { label: 'Framingham (lineal)', formattedValue: String(framingham), unit: 'ms' },
        { label: 'Hodges (lineal)', formattedValue: String(hodges), unit: 'ms' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: hrWarning,
      formulaUsed: `${chosen.eq} (RR = ${(rrSec * 1000).toFixed(0)} ms)`,
      inputsSummary: `QT: ${qt} ms · FC: ${hr} lpm · Sexo: ${isFemale ? 'Femenino' : 'Masculino'}`,
    };
  },
};
