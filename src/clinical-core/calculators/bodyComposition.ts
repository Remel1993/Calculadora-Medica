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
import { AGE_UNITS_YEARS, HEIGHT_UNITS_M, WEIGHT_UNITS_KG } from '../units/converters.ts';

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

const ageField: NumberFieldDef = {
  id: 'age',
  label: 'Edad',
  type: 'number',
  canonicalUnit: 'años',
  units: AGE_UNITS_YEARS,
  defaultUnitId: 'years',
  min: 18,
  max: 110,
  placeholder: '38',
  helpText: 'Ecuación de Deurenberg validada en adultos ≥ 18 años.',
};

const weightField: NumberFieldDef = {
  id: 'weight',
  label: 'Peso corporal',
  type: 'number',
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  min: 25,
  max: 350,
  placeholder: '70',
  helpText: 'Peso corporal actual medido sin sobrecarga hídrica aguda.',
};

const heightField: NumberFieldDef = {
  id: 'height',
  label: 'Talla',
  type: 'number',
  canonicalUnit: 'm',
  units: HEIGHT_UNITS_M,
  defaultUnitId: 'cm',
  min: 1.2,
  max: 2.3,
  placeholder: '170',
  helpText: 'Estatura sin calzado.',
};

export const bodyCompositionCalculator: CalculatorDefinition = {
  id: 'body-composition-ffmi',
  name: 'Índice de Biomasa / Composición Corporal (FFMI, % Grasa y Masa Magra)',
  shortName: 'Índice de Biomasa / FFMI',
  primarySpecialty: 'medicina-interna',
  secondarySpecialties: ['endocrinologia', 'geriatria'],
  subcategory: 'formulas',
  keywords: [
    'biomasa',
    'indice de biomasa',
    'composicion corporal',
    'masa magra',
    'masa libre de grasa',
    'masa grasa',
    'ffmi',
    'fmi',
    'deurenberg',
    'boer',
    'glim',
    'sarcopenia',
    'desnutricion',
    'imc',
    'antropometria',
  ],
  description:
    'Estima la composición corporal compartimental en adultos: Índice de Masa Libre de Grasa o Biomasa Magra (FFMI, criterio GLIM 2019), porcentaje de grasa corporal (Deurenberg 1991), masa grasa, masa magra (Boer 1984) e IMC.',
  clinicalIndication:
    'Valoración nutricional integral, cribado fenotípico de desnutrición/sarcopenia según criterios GLIM (FFMI bajo) y diferenciación orientativa entre exceso adiposo y masa muscular cuando el IMC aislado resulta insuficiente.',
  validatedPopulation: 'Adultos ≥ 18 años (Deurenberg 1991, Schutz 2002 y criterios GLIM 2019).',
  contraindications: [
    'No utilizar estas ecuaciones en menores de 18 años (en pediatría aplicar estándares OMS y valoración antropométrica específica).',
    'No es fiable en embarazo, ascitis, derrame pleural masivo ni edema severo o anasarca, ya que el agua extracelular distorsiona el peso y la masa magra estimada.',
  ],
  limitations: [
    'Es una estimación antropométrica indirecta basada en IMC, edad y sexo; no sustituye la bioimpedancia eléctrica (BIA), absorciometría dual (DEXA) ni plicometría clínica.',
    'La fórmula de Deurenberg puede sobreestimar el % de grasa en deportistas muy musculados y subestimarlo en adultos mayores con obesidad sarcopénica.',
    'En práctica clínica en español, algunos profesionales usan "índice de biomasa" como sinónimo coloquial de IMC; por ello se muestra también el IMC OMS junto al FFMI.',
  ],
  version: 'Deurenberg (1991) · Boer (1984) · GLIM (2019)',
  references: [
    {
      citation:
        'Deurenberg P, Weststrate JA, Seidell JC. Body mass index as a measure of body fatness: age- and sex-specific prediction formulas. Br J Nutr. 1991;65(2):105-114.',
      year: 1991,
    },
    {
      citation:
        'Cederholm T, Jensen GL, Correia MITD, et al. GLIM criteria for the diagnosis of malnutrition – A consensus report from the global clinical nutrition community. Clin Nutr. 2019;38(1):1-9.',
      year: 2019,
    },
    {
      citation:
        'Boer P. Estimated lean body mass as an index for normalization of body fluid volumes in humans. Am J Physiol. 1984;247(4 Pt 2):F632-F636.',
      year: 1984,
    },
    {
      citation:
        'Schutz Y, Kyle UUG, Pichard C. Fat-free mass index and fat mass index percentiles in Caucasians aged 18–98 y. Int J Obes Relat Metab Disord. 2002;26(7):953-960.',
      year: 2002,
    },
  ],
  fields: [sexField, ageField, weightField, heightField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(bodyCompositionCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const isMale = inputs.sex === 'male';
    const ageYears = getCanonicalNumberValue(ageField, inputs.age as NumberInputValue).canonicalValue!;
    const weightRes = getCanonicalNumberValue(weightField, inputs.weight as NumberInputValue);
    const heightRes = getCanonicalNumberValue(heightField, inputs.height as NumberInputValue);

    const weightKg = weightRes.canonicalValue!;
    const heightM = heightRes.canonicalValue!;
    const heightCm = heightM * 100;

    const rawBmi = weightKg / (heightM * heightM);
    const bmi = roundClinical(rawBmi, 1);

    // Deurenberg et al. (1991): %BF = 1.20 * BMI + 0.23 * age - 10.8 * sex - 5.4 (sex: 1=M, 0=F)
    const sexFactor = isMale ? 1 : 0;
    const rawFatPct = 1.2 * rawBmi + 0.23 * ageYears - 10.8 * sexFactor - 5.4;
    const clampedFatPct = Math.min(75, Math.max(3, rawFatPct));
    const fatPctWasClamped = rawFatPct !== clampedFatPct;
    const fatPct = roundClinical(clampedFatPct, 1);

    const fatMassKg = roundClinical(weightKg * (fatPct / 100), 1);
    const ffmKg = roundClinical(weightKg - fatMassKg, 1);
    const ffmi = roundClinical(ffmKg / (heightM * heightM), 1);
    const fmi = roundClinical(fatMassKg / (heightM * heightM), 1);

    // Boer (1984) Lean Body Mass (kg)
    const rawBoerLbm = isMale
      ? 0.407 * weightKg + 0.267 * heightCm - 19.2
      : 0.252 * weightKg + 0.473 * heightCm - 48.3;
    const boerLbmKg = roundClinical(Math.max(10, rawBoerLbm), 1);

    // GLIM 2019 reduced muscle mass cutoffs: < 17.0 kg/m² (men), < 15.0 kg/m² (women)
    const glimCutoff = isMale ? 17.0 : 15.0;
    const schutzUpperRef = isMale ? 20.0 : 17.5;
    const highAdiposityCutoff = isMale ? 25.0 : 32.0;

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (ffmi < glimCutoff) {
      severity = ffmi < glimCutoff - 1.5 ? 'high' : 'moderate';
      riskClassification = `Biomasa magra reducida — Criterio GLIM (FFMI < ${glimCutoff.toFixed(1)} kg/m²)`;
      clinicalInterpretation =
        `El FFMI estimado (${formatClinicalNumber(ffmi, 1)} kg/m²) se sitúa por debajo del umbral fenotípico GLIM 2019 para masa muscular reducida en ${isMale ? 'varones (< 17.0 kg/m²)' : 'mujeres (< 15.0 kg/m²)'}. Correlacionar con pérdida ponderal, ingesta, inflamación y fuerza muscular (dinamometría).`;
    } else if (ffmi <= schutzUpperRef) {
      if (bmi >= 30.0 || fatPct >= highAdiposityCutoff) {
        severity = bmi >= 35.0 ? 'high' : 'moderate';
        riskClassification = `Biomasa magra conservada con adiposidad elevada (${formatClinicalNumber(fatPct, 1)} % grasa)`;
        clinicalInterpretation =
          'El índice de masa libre de grasa supera el umbral mínimo GLIM, pero el porcentaje de grasa corporal estimado e IMC sugieren exceso de tejido adiposo. Valorar perfil cardiometabólico y perímetro abdominal.';
      } else if (bmi < 18.5) {
        severity = 'low';
        riskClassification = 'Bajo peso ponderal con FFMI limítrofe conservado';
        clinicalInterpretation =
          'Aunque el FFMI supera el corte GLIM, el IMC es < 18.5 kg/m². Vigilar reservas energéticas y tendencia ponderal.';
      } else {
        severity = 'normal';
        riskClassification = 'Composición corporal y biomasa magra en rango de referencia';
        clinicalInterpretation =
          `FFMI dentro del rango habitual adulto (${isMale ? '≥ 17.0' : '≥ 15.0'} kg/m²) con adiposidad estimada y relación peso-talla equilibradas.`;
      }
    } else if (bmi >= 30.0 && fatPct >= highAdiposityCutoff) {
      severity = 'moderate';
      riskClassification = 'Biomasa magra elevada acompañada de exceso adiposo';
      clinicalInterpretation =
        'Tanto el FFMI como la masa grasa estimada están incrementados. En obesidad, la ecuación de Deurenberg puede sobreestimar o distorsionar los compartimentos; confirmar mediante BIA o DEXA si se requiere seguimiento nutricional estricto.';
    } else {
      severity = 'normal';
      riskClassification = 'Biomasa magra elevada (alta muscularidad / complexión robusta)';
      clinicalInterpretation =
        'FFMI superior al promedio poblacional de referencia. Si el paciente realiza entrenamiento de fuerza, el IMC puede sobrestimar el riesgo adiposo debido a la mayor masa muscular.';
    }

    const guidance: string[] = [
      `Umbral fenotípico GLIM 2019 de masa muscular reducida: < ${glimCutoff.toFixed(1)} kg/m² (${isMale ? 'hombres' : 'mujeres'}).`,
      'Para confirmar sarcopenia o desnutrición, combinar con fuerza de prensión (dinamometría), perímetro de pantorrilla/cintura o bioimpedancia/DEXA según disponibilidad.',
    ];

    if (fatPctWasClamped) {
      guidance.push(
        'Nota técnica: los valores extremos ingresados produjeron un porcentaje teórico fuera de rango fisiológico (3–75 %) en la regresión de Deurenberg; interpretar con cautela.',
      );
    }

    return {
      primaryResult: {
        label: 'Índice de Masa Libre de Grasa (FFMI)',
        value: ffmi,
        formattedValue: formatClinicalNumber(ffmi, 1),
        unit: 'kg/m²',
      },
      secondaryResults: [
        {
          label: 'Índice de Masa Corporal (IMC)',
          formattedValue: formatClinicalNumber(bmi, 1),
          unit: 'kg/m²',
        },
        {
          label: 'Porcentaje de Grasa Corporal (Deurenberg)',
          formattedValue: formatClinicalNumber(fatPct, 1),
          unit: '%',
        },
        {
          label: 'Masa Libre de Grasa / Biomasa Magra (FFM)',
          formattedValue: formatClinicalNumber(ffmKg, 1),
          unit: 'kg',
        },
        {
          label: 'Masa Grasa Estimada',
          formattedValue: formatClinicalNumber(fatMassKg, 1),
          unit: 'kg',
        },
        {
          label: 'Índice de Masa Grasa (FMI)',
          formattedValue: formatClinicalNumber(fmi, 1),
          unit: 'kg/m²',
        },
        {
          label: 'Masa Corporal Magra (Boer 1984)',
          formattedValue: formatClinicalNumber(boerLbmKg, 1),
          unit: 'kg',
          note: 'Referencia farmacocinética / compartimental alternativa',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer:
        'Estimación antropométrica indirecta; no sustituye técnicas instrumentales de composición corporal (BIA, DEXA) ni el juicio clínico.',
      formulaUsed:
        '%Grasa (Deurenberg) = 1.20×IMC + 0.23×Edad − 10.8×Sexo(H=1,M=0) − 5.4 · FFM = Peso×(1 − %Grasa/100) · FFMI = FFM / Talla(m)²',
      inputsSummary: `${isMale ? 'Masculino' : 'Femenino'} · ${ageYears} años · Peso: ${weightRes.rawNumber} ${weightRes.unitLabel} · Talla: ${heightRes.rawNumber} ${heightRes.unitLabel}`,
    };
  },
};
