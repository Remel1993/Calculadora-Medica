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
} from '../types/clinical.ts';
import { HEIGHT_UNITS_M, WEIGHT_UNITS_KG } from '../units/converters.ts';

const weightField: NumberFieldDef = {
  id: 'weight',
  label: 'Peso corporal',
  type: 'number',
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  min: 0.4,
  max: 350,
  placeholder: '18',
};

const heightField: NumberFieldDef = {
  id: 'height',
  label: 'Talla / Longitud',
  type: 'number',
  canonicalUnit: 'm',
  units: HEIGHT_UNITS_M,
  defaultUnitId: 'cm',
  min: 0.25,
  max: 2.5,
  placeholder: '110',
};

export const bsaMostellerCalculator: CalculatorDefinition = {
  id: 'bsa-mosteller',
  name: 'Superficie Corporal (Mosteller, Haycock y Du Bois)',
  shortName: 'Superficie Corporal',
  primarySpecialty: 'pediatria',
  secondarySpecialties: ['oncologia', 'medicina-interna', 'urgencias'],
  subcategory: 'formulas',
  keywords: ['superficie corporal', 'bsa', 'sc', 'mosteller', 'haycock', 'dubois', 'pediatria', 'quimioterapia'],
  description:
    'Cálculo de superficie corporal (m²) mediante Mosteller (estándar pediátrico y general), mostrando simultáneamente Haycock (neonatos/lactantes) y Du Bois.',
  clinicalIndication:
    'Dosificación de fármacos indexados por m², reposición de quemados, evaluación hemodinámica y cálculo de índice cardíaco en pediatría y adultos.',
  validatedPopulation: 'Neonatos, población pediátrica y adultos (0.4–350 kg; 25–250 cm).',
  contraindications: [
    'En neonatos prematuros extremos o edema masivo (anasarca), la superficie corporal calculada por peso actual puede sobrestimar el área real para dosificación citotóxica o renal.',
  ],
  limitations: [
    'La fórmula de Haycock presenta excelente ajuste en lactantes pequeños y neonatos (< 15 kg); Mosteller es la preferida por consenso en práctica pediátrica general por su facilidad y exactitud equivalente.',
  ],
  version: 'Mosteller (NEJM 1987) / Haycock (1978) / Du Bois (1916)',
  references: [
    {
      citation: 'Mosteller RD. Simplified calculation of body-surface area. N Engl J Med. 1987;317(17):1098.',
      year: 1987,
    },
    {
      citation: 'Haycock GB, Schwartz GJ, Wisotsky DH. Geometric method for measuring body surface area: a height-weight formula validated in infants, children, and adults. J Pediatr. 1978;93(1):62-66.',
      year: 1978,
    },
  ],
  fields: [weightField, heightField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(bsaMostellerCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const weightKg = getCanonicalNumberValue(weightField, inputs.weight as NumberInputValue).canonicalValue!;
    const heightM = getCanonicalNumberValue(heightField, inputs.height as NumberInputValue).canonicalValue!;
    const heightCm = heightM * 100;

    const mosteller = roundClinical(Math.sqrt((weightKg * heightCm) / 3600), 2);
    const haycock = roundClinical(0.024265 * Math.pow(weightKg, 0.5378) * Math.pow(heightCm, 0.3964), 2);
    const dubois = roundClinical(0.007184 * Math.pow(weightKg, 0.425) * Math.pow(heightCm, 0.725), 2);

    return {
      primaryResult: {
        label: 'Superficie corporal (Mosteller)',
        value: mosteller,
        formattedValue: formatClinicalNumber(mosteller, 2),
        unit: 'm²',
      },
      secondaryResults: [
        {
          label: 'Fórmula de Haycock (preferida en lactantes < 10–15 kg)',
          formattedValue: formatClinicalNumber(haycock, 2),
          unit: 'm²',
        },
        {
          label: 'Fórmula de Du Bois & Du Bois (adultos)',
          formattedValue: formatClinicalNumber(dubois, 2),
          unit: 'm²',
        },
      ],
      severity: 'info',
      riskClassification: `${formatClinicalNumber(mosteller, 2)} m² (Mosteller)`,
      clinicalInterpretation:
        'Superficie corporal calculada para ajuste posológico o indexación fisiológica según el protocolo clínico aplicable.',
      formulaUsed: 'Mosteller = √[(Peso kg × Talla cm) / 3600]',
      inputsSummary: `Peso: ${roundClinical(weightKg, 2)} kg · Talla: ${roundClinical(heightCm, 1)} cm`,
    };
  },
};
