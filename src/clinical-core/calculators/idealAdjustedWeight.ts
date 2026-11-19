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
import { AGE_UNITS_YEARS, WEIGHT_UNITS_KG } from '../units/converters.ts';

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

const heightField: NumberFieldDef = {
  id: 'height',
  label: 'Estatura (Talla)',
  type: 'number',
  canonicalUnit: 'cm',
  units: [
    { id: 'cm', label: 'cm', toCanonical: (v) => v, min: 130, max: 230, step: 0.5 },
    { id: 'm', label: 'm', toCanonical: (v) => v * 100, min: 1.3, max: 2.3, step: 0.01 },
  ],
  defaultUnitId: 'cm',
  min: 130,
  max: 230,
  placeholder: '170',
};

const weightField: NumberFieldDef = {
  id: 'weight',
  label: 'Peso corporal real',
  type: 'number',
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  min: 25,
  max: 350,
  placeholder: '92',
};

const ageField: NumberFieldDef = {
  id: 'age',
  label: 'Edad',
  type: 'number',
  canonicalUnit: 'años',
  units: AGE_UNITS_YEARS,
  defaultUnitId: 'years',
  min: 18,
  max: 110,
  placeholder: '42',
};

const waistField: NumberFieldDef = {
  id: 'waist',
  label: 'Circunferencia de cintura (opcional, para índice cintura-talla)',
  type: 'number',
  required: false,
  canonicalUnit: 'cm',
  units: [{ id: 'cm', label: 'cm', toCanonical: (v) => v, min: 40, max: 220, step: 0.5 }],
  defaultUnitId: 'cm',
  min: 40,
  max: 220,
  placeholder: '96',
};

export const idealAdjustedWeightCalculator: CalculatorDefinition = {
  id: 'ideal-adjusted-weight',
  name: 'Peso Ideal / Ajustado (Devine), TMB (Mifflin-St Jeor) e Índice Cintura-Talla',
  shortName: 'Peso Ideal / Ajustado / TMB',
  primarySpecialty: 'endocrinologia',
  secondarySpecialties: ['medicina-interna', 'urgencias'],
  subcategory: 'formulas',
  keywords: [
    'peso ideal',
    'peso ajustado',
    'devine',
    'mifflin',
    'tmb',
    'metabolismo basal',
    'cintura talla',
    'nutricion',
    'obesidad',
  ],
  description:
    'Calcula el peso corporal ideal (fórmula de Devine), peso corporal ajustado (factor 0.4 para dosificación en obesidad), tasa metabólica basal (Mifflin-St Jeor) e índice cintura-talla.',
  clinicalIndication:
    'Cálculo de dosis farmacológicas en pacientes con sobrepeso u obesidad (aminoglucósidos, aciclovir, heparinas, etc.), soporte nutricional y evaluación de adiposidad central.',
  validatedPopulation: 'Adultos ≥ 18 años con talla ≥ 152.4 cm (5 pies) para Devine.',
  contraindications: [
    'No utilizar la fórmula de Devine en pediatría ni en talla < 152 cm sin validar extrapolación.',
    'Mifflin-St Jeor estima gasto energético basal en adultos; en pacientes críticos intubados suele emplearse calorimetría indirecta o ecuaciones específicas (Penn State).',
  ],
  limitations: [
    'El factor 0.4 en peso ajustado es estándar en farmacocinética general, pero algunos antibióticos específicos usan factores distintos (p. ej. 0.45 o peso real/ideal según ficha técnica).',
    'En ventilación mecánica protectora (6 mL/kg), el volumen corriente debe calcularse con Peso Predicho (PBW ARDSNet: 50/45.5 + 0.91×[cm − 152.4]), prácticamente equivalente a Devine.',
  ],
  version: 'Devine (1974) & Mifflin-St Jeor (1990)',
  references: [
    {
      citation:
        'Devine BJ. Gentamicin therapy. Drug Intell Clin Pharm. 1974;8:650-655.',
      year: 1974,
    },
    {
      citation:
        'Mifflin MD, St Jeor ST, Hill LA, et al. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr. 1990;51(2):241-247.',
      year: 1990,
    },
  ],
  fields: [sexField, heightField, weightField, ageField, waistField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(idealAdjustedWeightCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const isMale = inputs.sex === 'male';
    const heightCm = getCanonicalNumberValue(heightField, inputs.height as NumberInputValue).canonicalValue!;
    const actualKg = getCanonicalNumberValue(weightField, inputs.weight as NumberInputValue).canonicalValue!;
    const age = getCanonicalNumberValue(ageField, inputs.age as NumberInputValue).canonicalValue!;
    const waistCm = getCanonicalNumberValue(waistField, inputs.waist as NumberInputValue).canonicalValue;

    const heightInches = heightCm / 2.54;
    const baseKg = isMale ? 50.0 : 45.5;
    const ibw = roundClinical(baseKg + 2.3 * (heightInches - 60), 1);
    const adjBw = roundClinical(ibw + 0.4 * (actualKg - ibw), 1);
    const bmr = roundClinical(10 * actualKg + 6.25 * heightCm - 5 * age + (isMale ? 5 : -161), 0);
    const pctOverIbw = roundClinical(((actualKg - ibw) / ibw) * 100, 1);
    const whtr = waistCm !== null ? roundClinical(waistCm / heightCm, 2) : null;

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (actualKg > ibw * 1.2) {
      severity = 'moderate';
      riskClassification = `Peso real > 120 % del ideal (+${formatClinicalNumber(pctOverIbw, 1)} %) — Usar Peso Ajustado según fármaco`;
      clinicalInterpretation =
        'En pacientes con peso > 120 % del peso ideal, muchos fármacos hidrofílicos requieren dosis basadas en Peso Ideal o Peso Ajustado (factor 0.4).';
    } else if (actualKg < ibw * 0.85) {
      severity = 'low';
      riskClassification = `Peso real < 85 % del ideal (${formatClinicalNumber(pctOverIbw, 1)} %)`;
      clinicalInterpretation =
        'Peso inferior al ideal teórico; en bajo peso suele dosificarse por peso corporal real.';
    } else {
      severity = 'normal';
      riskClassification = `Peso cercano al ideal (${pctOverIbw >= 0 ? '+' : ''}${formatClinicalNumber(pctOverIbw, 1)} %)`;
      clinicalInterpretation = 'El peso real se encuentra próximo al peso ideal de Devine.';
    }

    const guidance = [
      heightCm < 152.4
        ? 'Advertencia: talla < 152.4 cm (60 pulgadas); la ecuación de Devine extrapolada por debajo de 60 pulgadas debe interpretarse con cautela.'
        : 'Confirmar en la ficha del fármaco si la posología recomienda peso real, peso ideal (Devine) o peso ajustado.',
    ];
    if (whtr !== null) {
      guidance.push(
        whtr >= 0.5
          ? `Índice cintura-talla = ${formatClinicalNumber(whtr, 2)} (≥ 0.50): indica adiposidad central aumentada y mayor riesgo cardiometabólico.`
          : `Índice cintura-talla = ${formatClinicalNumber(whtr, 2)} (< 0.50): dentro de rango saludable ("mantén tu cintura por debajo de la mitad de tu altura").`,
      );
    }

    return {
      primaryResult: {
        label: 'Peso Ideal (Devine)',
        value: ibw,
        formattedValue: formatClinicalNumber(ibw, 1),
        unit: 'kg',
      },
      secondaryResults: [
        { label: 'Peso Corporal Ajustado (factor 0.4)', formattedValue: formatClinicalNumber(adjBw, 1), unit: 'kg', note: actualKg <= ibw ? 'Peso real ≤ ideal: habitualmente se usa peso real' : undefined },
        { label: 'TMB (Mifflin-St Jeor)', formattedValue: String(bmr), unit: 'kcal/día' },
        ...(whtr !== null
          ? [{ label: 'Índice Cintura-Talla (ICT)', formattedValue: formatClinicalNumber(whtr, 2), unit: whtr >= 0.5 ? '(≥ 0.50 elevado)' : '(< 0.50 normal)' }]
          : []),
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'Para nutrición clínica, multiplicar la TMB por el factor de actividad física / estrés clínico correspondiente.',
      formulaUsed: 'Devine: (50 ó 45.5) + 2.3×(talla_in − 60) · Ajustado: PI + 0.4×(PR − PI) · Mifflin: 10×kg + 6.25×cm − 5×edad + (+5 / −161)',
      inputsSummary: `${isMale ? 'Masculino' : 'Femenino'} · Talla: ${heightCm} cm · Peso real: ${roundClinical(actualKg, 1)} kg · Edad: ${age} años`,
    };
  },
};
