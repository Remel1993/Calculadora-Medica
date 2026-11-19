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
import { HEIGHT_UNITS_M, WEIGHT_UNITS_KG } from '../units/converters.ts';

const weightField: NumberFieldDef = {
  id: 'weight',
  label: 'Peso corporal',
  type: 'number',
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  min: 20,
  max: 400,
  placeholder: '70',
  helpText: 'Peso actual medido en adultos.',
};

const heightField: NumberFieldDef = {
  id: 'height',
  label: 'Talla',
  type: 'number',
  canonicalUnit: 'm',
  units: HEIGHT_UNITS_M,
  defaultUnitId: 'cm',
  min: 0.9,
  max: 2.5,
  placeholder: '170',
  helpText: 'Estatura sin calzado.',
};

export const imcCalculator: CalculatorDefinition = {
  id: 'imc',
  name: 'Índice de Masa Corporal (IMC)',
  shortName: 'IMC',
  primarySpecialty: 'medicina-interna',
  secondarySpecialties: ['endocrinologia'],
  subcategory: 'formulas',
  keywords: ['imc', 'bmi', 'peso', 'talla', 'obesidad', 'sobrepeso', 'antropometria', 'quetelet'],
  description: 'Relación entre peso y talla al cuadrado para clasificar el estado ponderal en adultos.',
  clinicalIndication:
    'Tamizaje inicial del estado nutricional y estratificación ponderal en consulta externa de adultos.',
  validatedPopulation: 'Adultos ≥ 18 años (puntos de corte OMS).',
  contraindications: [
    'No utilizar estos puntos de corte en menores de 18 años (requiere percentiles / puntuación Z para edad y sexo).',
    'No refleja adiposidad real en embarazo, ascitis, edema severo o deportistas con masa muscular muy elevada.',
  ],
  limitations: [
    'No distingue entre masa grasa, masa muscular y retención hídrica.',
    'No evalúa distribución de grasa visceral (complementar con perímetro abdominal cuando sea pertinente).',
    'En adultos de origen asiático, la OMS describe puntos de corte de acción más bajos (sobrepeso ≥ 23.0 kg/m²).',
  ],
  version: 'OMS Adultos (2000 / 2004)',
  references: [
    {
      citation: 'World Health Organization. Obesity: preventing and managing the global epidemic. WHO Technical Report Series 894.',
      year: 2000,
    },
    {
      citation: 'WHO Expert Consultation. Appropriate body-mass index for Asian populations and its implications. Lancet. 2004;363(9403):157-163.',
      year: 2004,
    },
  ],
  fields: [weightField, heightField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(imcCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const weightRes = getCanonicalNumberValue(weightField, inputs.weight as NumberInputValue);
    const heightRes = getCanonicalNumberValue(heightField, inputs.height as NumberInputValue);

    const weightKg = weightRes.canonicalValue!;
    const heightM = heightRes.canonicalValue!;

    const rawBmi = weightKg / (heightM * heightM);
    const bmi = roundClinical(rawBmi, 1);

    const minHealthyKg = roundClinical(18.5 * heightM * heightM, 1);
    const maxHealthyKg = roundClinical(24.9 * heightM * heightM, 1);

    let riskClassification = '';
    let clinicalInterpretation = '';
    let severity: SeverityLevel = 'normal';

    if (bmi < 18.5) {
      severity = 'moderate';
      riskClassification = 'Bajo peso (< 18.5 kg/m²)';
      clinicalInterpretation =
        'IMC por debajo del rango de referencia ponderal. Valorar estado nutricional, pérdida ponderal involuntaria o patología subyacente.';
    } else if (bmi < 25.0) {
      severity = 'normal';
      riskClassification = 'Normopeso (18.5 – 24.9 kg/m²)';
      clinicalInterpretation =
        'IMC dentro del rango ponderal de referencia de la OMS para adultos.';
    } else if (bmi < 30.0) {
      severity = 'low';
      riskClassification = 'Sobrepeso (25.0 – 29.9 kg/m²)';
      clinicalInterpretation =
        'IMC en rango de sobrepeso. Evaluar factores de riesgo cardiometabólico y composición corporal.';
    } else if (bmi < 35.0) {
      severity = 'moderate';
      riskClassification = 'Obesidad grado I (30.0 – 34.9 kg/m²)';
      clinicalInterpretation =
        'Obesidad grado I según clasificación OMS. Riesgo aumentado de comorbilidades metabólicas y cardiovasculares.';
    } else if (bmi < 40.0) {
      severity = 'high';
      riskClassification = 'Obesidad grado II (35.0 – 39.9 kg/m²)';
      clinicalInterpretation =
        'Obesidad grado II según clasificación OMS. Riesgo elevado de complicaciones cardiometabólicas y mecánicas.';
    } else {
      severity = 'critical';
      riskClassification = 'Obesidad grado III (≥ 40.0 kg/m²)';
      clinicalInterpretation =
        'Obesidad grado III (severa). Asociada a riesgo muy elevado de morbimortalidad cardiometabólica.';
    }

    return {
      primaryResult: {
        label: 'Índice de Masa Corporal',
        value: bmi,
        formattedValue: formatClinicalNumber(bmi, 1),
        unit: 'kg/m²',
      },
      secondaryResults: [
        {
          label: 'Rango ponderal de referencia para esta talla',
          formattedValue: `${minHealthyKg.toFixed(1)} – ${maxHealthyKg.toFixed(1)}`,
          unit: 'kg',
          note: 'Calculado para IMC 18.5 – 24.9 kg/m²',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: [
        'Interpretar junto con perímetro de cintura, masa muscular y comorbilidades metabólicas.',
      ],
      guidanceDisclaimer: 'Orientación clínica general; no sustituye la valoración nutricional integral.',
      formulaUsed: 'IMC = Peso (kg) / [Talla (m)]²',
      inputsSummary: `Peso: ${weightRes.rawNumber} ${weightRes.unitLabel} · Talla: ${heightRes.rawNumber} ${heightRes.unitLabel}`,
    };
  },
};
