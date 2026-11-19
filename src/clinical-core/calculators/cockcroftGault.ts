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
  SecondaryResultItem,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';
import {
  AGE_UNITS_YEARS,
  CREATININE_UNITS_MG_DL,
  HEIGHT_UNITS_M,
  WEIGHT_UNITS_KG,
} from '../units/converters.ts';

const ageField: NumberFieldDef = {
  id: 'age',
  label: 'Edad',
  type: 'number',
  canonicalUnit: 'años',
  units: AGE_UNITS_YEARS,
  defaultUnitId: 'years',
  min: 18,
  max: 110,
  placeholder: '65',
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
  placeholder: '72',
};

const heightField: NumberFieldDef = {
  id: 'height',
  label: 'Talla (opcional, para peso ideal/ajustado)',
  type: 'number',
  canonicalUnit: 'm',
  units: HEIGHT_UNITS_M,
  defaultUnitId: 'cm',
  min: 1.2,
  max: 2.3,
  placeholder: '170',
  required: false,
  helpText:
    'Si se introduce, calcula automáticamente peso ideal (Devine) y peso ajustado en sobrepeso/obesidad.',
};

const creatinineField: NumberFieldDef = {
  id: 'creatinine',
  label: 'Creatinina sérica',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: CREATININE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 0.2,
  max: 25,
  placeholder: '1.2',
};

const sexField: SelectFieldDef = {
  id: 'sex',
  label: 'Sexo biológico',
  type: 'select',
  defaultValue: 'male',
  options: [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Femenino (× 0.85)' },
  ],
};

function calcCrCl(age: number, weightKg: number, scrMgDl: number, isFemale: boolean): number {
  const base = ((140 - age) * weightKg) / (72 * scrMgDl);
  return isFemale ? base * 0.85 : base;
}

export const cockcroftGaultCalculator: CalculatorDefinition = {
  id: 'cockcroft-gault',
  name: 'Aclaramiento de Creatinina — Cockcroft-Gault',
  shortName: 'Cockcroft-Gault',
  primarySpecialty: 'nefrologia',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'formulas',
  keywords: [
    'cockcroft',
    'gault',
    'aclaramiento',
    'creatinina',
    'crcl',
    'dosis',
    'ajuste renal',
    'peso ajustado',
  ],
  description:
    'Estimación del aclaramiento de creatinina (mL/min, sin indexar a 1.73 m²) orientada principalmente al ajuste posológico de fármacos.',
  clinicalIndication:
    'Ajuste de dosis de medicamentos con eliminación renal en adultos, especialmente cuando la ficha técnica se basa en Cockcroft-Gault.',
  validatedPopulation: 'Adultos ≥ 18 años con función renal estable.',
  requiredLabsNote: 'Requiere creatinina sérica estable.',
  contraindications: [
    'No utilizar en Lesión Renal Aguda con creatinina sérica fluctuante.',
    'No validada en pacientes pediátricos (< 18 años), embarazo, ascitis masiva o anasarca.',
  ],
  limitations: [
    'Desarrollada originalmente con ensayos de creatinina no estandarizados a IDMS; puede sobrestimar el FG real respecto a CKD-EPI.',
    'En pacientes obesos (peso real > 120 % del peso ideal), el uso de peso real sobrestima el CrCl; las guías farmacológicas suelen preferir Peso Ajustado (ABW).',
    'En pacientes con bajo peso (< peso ideal), se recomienda utilizar el peso corporal real.',
    'En ancianos frágiles con sarcopenia y creatinina muy baja (< 0.7 mg/dL), puede sobrestimar el aclaramiento real (evitar redondear arbitrariamente creatinina sin criterio clínico).',
  ],
  version: 'Cockcroft-Gault (1976) + Devine/Winter',
  references: [
    {
      citation:
        'Cockcroft DW, Gault MH. Prediction of creatinine clearance from serum creatinine. Nephron. 1976;16(1):31-41.',
      year: 1976,
    },
    {
      citation:
        'Winter MA, Guhr KN, Berg GM. Impact of various body weights and serum creatinine concentrations on the bias and accuracy of the Cockcroft-Gault equation. Pharmacotherapy. 2012;32(7):604-612.',
      year: 2012,
    },
  ],
  fields: [ageField, sexField, weightField, heightField, creatinineField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(cockcroftGaultCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const ageRes = getCanonicalNumberValue(ageField, inputs.age as NumberInputValue);
    const weightRes = getCanonicalNumberValue(weightField, inputs.weight as NumberInputValue);
    const heightRes = getCanonicalNumberValue(heightField, inputs.height as NumberInputValue);
    const crRes = getCanonicalNumberValue(
      creatinineField,
      inputs.creatinine as NumberInputValue,
    );
    const isFemale = inputs.sex === 'female';

    const age = ageRes.canonicalValue!;
    const actualWeight = weightRes.canonicalValue!;
    const scr = crRes.canonicalValue!;

    const actualCrCl = roundClinical(calcCrCl(age, actualWeight, scr, isFemale), 0);
    let primaryCrCl = actualCrCl;
    let primaryLabel = 'CrCl estimado (peso real)';
    const secondaryResults: SecondaryResultItem[] = [];

    if (heightRes.canonicalValue !== null) {
      const heightInches = heightRes.canonicalValue * 39.3700787;
      const baseIbw = isFemale ? 45.5 : 50.0;
      const ibw = Math.max(30, baseIbw + 2.3 * (heightInches - 60));
      const ibwRounded = roundClinical(ibw, 1);
      const ibwCrCl = roundClinical(calcCrCl(age, ibw, scr, isFemale), 0);

      if (actualWeight > ibw * 1.2) {
        const abw = ibw + 0.4 * (actualWeight - ibw);
        const abwRounded = roundClinical(abw, 1);
        const abwCrCl = roundClinical(calcCrCl(age, abw, scr, isFemale), 0);
        primaryCrCl = abwCrCl;
        primaryLabel = `CrCl con peso ajustado (${abwRounded} kg)`;
        secondaryResults.push(
          {
            label: 'CrCl con peso real',
            formattedValue: formatClinicalNumber(actualCrCl, 0),
            unit: 'mL/min',
            note: 'Puede sobrestimar en sobrepeso/obesidad (> 120 % del peso ideal)',
          },
          {
            label: `CrCl con peso ideal (${ibwRounded} kg)`,
            formattedValue: formatClinicalNumber(ibwCrCl, 0),
            unit: 'mL/min',
          },
        );
      } else if (actualWeight < ibw) {
        primaryCrCl = actualCrCl;
        primaryLabel = 'CrCl con peso real (menor al peso ideal)';
        secondaryResults.push({
          label: `CrCl con peso ideal (${ibwRounded} kg)`,
          formattedValue: formatClinicalNumber(ibwCrCl, 0),
          unit: 'mL/min',
          note: 'En bajo peso se prefiere usar el peso real',
        });
      } else {
        primaryCrCl = ibwCrCl;
        primaryLabel = `CrCl con peso ideal (${ibwRounded} kg)`;
        secondaryResults.push({
          label: 'CrCl con peso real',
          formattedValue: formatClinicalNumber(actualCrCl, 0),
          unit: 'mL/min',
        });
      }
    }

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (primaryCrCl >= 60) {
      severity = 'normal';
      riskClassification = 'Aclaramiento ≥ 60 mL/min';
      clinicalInterpretation =
        'Generalmente no requiere reducción posológica renal en la mayoría de fármacos estándar (verificar ficha técnica específica).';
    } else if (primaryCrCl >= 30) {
      severity = 'moderate';
      riskClassification = 'Descenso moderado (30 – 59 mL/min)';
      clinicalInterpretation =
        'Numerosos antimicrobianos, anticoagulantes directos y fármacos hidrosolubles requieren ajuste de dosis o intervalo.';
    } else if (primaryCrCl >= 15) {
      severity = 'high';
      riskClassification = 'Descenso grave (15 – 29 mL/min)';
      clinicalInterpretation =
        'Riesgo elevado de toxicidad farmacológica por acumulación. Revisar cada prescripción y evitar nefrotóxicos.';
    } else {
      severity = 'critical';
      riskClassification = 'Aclaramiento crítico (< 15 mL/min)';
      clinicalInterpretation =
        'Aclaramiento compatible con fallo renal avanzado. Ajuste estricto o contraindicación de múltiples fármacos.';
    }

    return {
      primaryResult: {
        label: primaryLabel,
        value: primaryCrCl,
        formattedValue: formatClinicalNumber(primaryCrCl, 0),
        unit: 'mL/min',
      },
      secondaryResults: secondaryResults.length > 0 ? secondaryResults : undefined,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: [
        'Consultar la tabla de ajuste posológico del fármaco específico (algunos medicamentos usan TFGe CKD-EPI desindexada o CrCl).',
      ],
      guidanceDisclaimer: 'Cálculo orientativo; no sustituye la evaluación farmacocinética clínica.',
      formulaUsed: 'CrCl = [(140 - Edad) × Peso (kg) / (72 × Scr mg/dL)] × (0.85 si femenino)',
      inputsSummary: `Edad: ${age} años · Sexo: ${isFemale ? 'Femenino' : 'Masculino'} · Peso: ${weightRes.rawNumber} ${weightRes.unitLabel} · Scr: ${crRes.rawNumber} ${crRes.unitLabel}`,
    };
  },
};
