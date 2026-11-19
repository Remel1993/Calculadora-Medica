import {
  formatClinicalNumber,
  getCanonicalNumberValue,
  roundClinical,
  validateCalculatorInputs,
} from '../math/precision.ts';
import {
  evaluateWhoIndicator,
  formatAgeMonthsLabel,
} from '../math/whoLms.ts';
import type { WhoSex } from '../data/whoGrowthStandards.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SecondaryResultItem,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';
import { WEIGHT_UNITS_KG } from '../units/converters.ts';

const ageMonthsField: NumberFieldDef = {
  id: 'ageMonths',
  label: 'Edad del niño o adolescente',
  type: 'number',
  canonicalUnit: 'meses',
  units: [
    { id: 'months', label: 'meses (0–228)', toCanonical: (v) => v, min: 0, max: 228, step: 1 },
    { id: 'years', label: 'años (0–19)', toCanonical: (v) => v * 12, min: 0, max: 19, step: 0.5 },
  ],
  defaultUnitId: 'months',
  min: 0,
  max: 228,
  placeholder: '36',
  helpText: 'Usa meses en menores de 2 años para mayor precisión (ej. 6, 12, 18 meses).',
};

const sexField: SelectFieldDef = {
  id: 'sex',
  label: 'Sexo biológico',
  type: 'select',
  defaultValue: 'male',
  options: [
    { value: 'male', label: 'Niño / Masculino' },
    { value: 'female', label: 'Niña / Femenino' },
  ],
};

const weightField: NumberFieldDef = {
  id: 'weight',
  label: 'Peso actual',
  type: 'number',
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  min: 1.0,
  max: 180,
  placeholder: '14.5',
};

const heightField: NumberFieldDef = {
  id: 'height',
  label: 'Longitud (< 2 años acostado) o Talla (≥ 2 años de pie)',
  type: 'number',
  canonicalUnit: 'cm',
  units: [{ id: 'cm', label: 'cm', toCanonical: (v) => v, min: 35, max: 210, step: 0.5 }],
  defaultUnitId: 'cm',
  min: 35,
  max: 210,
  placeholder: '96',
};

const headCircField: NumberFieldDef = {
  id: 'headCircumference',
  label: 'Perímetro cefálico (opcional, solo 0–5 años)',
  type: 'number',
  required: false,
  canonicalUnit: 'cm',
  units: [{ id: 'cm', label: 'cm', toCanonical: (v) => v, min: 25, max: 62, step: 0.1 }],
  defaultUnitId: 'cm',
  min: 25,
  max: 62,
  placeholder: '49.5',
  visibleWhen: (inputs) => {
    const raw = inputs.ageMonths as NumberInputValue | undefined;
    if (!raw || raw.value === '') return true;
    const num = Number(raw.value.replace(',', '.'));
    if (!Number.isFinite(num)) return true;
    const months = raw.unitId === 'years' ? num * 12 : num;
    return months <= 60;
  },
  helpText: 'Útil en control de recién nacidos, lactantes y preescolares (≤ 60 meses).',
};

const zIndicatorField: SelectFieldDef = {
  id: 'zIndicator',
  label: 'Indicador si introduces un Puntaje Z manual',
  type: 'select',
  defaultValue: 'bmifa',
  options: [
    { value: 'bmifa', label: 'IMC para la edad (cálculo automático por defecto)' },
    { value: 'wfa', label: 'Peso para la edad (0–10 años)' },
    { value: 'hfa', label: 'Talla / Longitud para la edad (0–19 años)' },
  ],
};

const zScoreField: NumberFieldDef = {
  id: 'zScore',
  label: 'Puntaje Z manual (opcional — dejar vacío para cálculo automático OMS)',
  type: 'number',
  required: false,
  canonicalUnit: 'DE',
  units: [{ id: 'z', label: 'Z (DE)', toCanonical: (v) => v, min: -6, max: 6, step: 0.1 }],
  defaultUnitId: 'z',
  min: -6,
  max: 6,
  placeholder: 'Automático',
  helpText: 'Normalmente se deja vacío: la app calcula automáticamente los percentiles y puntajes Z con las tablas oficiales OMS.',
};

function formatSignedZ(z: number): string {
  return `${z > 0 ? '+' : ''}${formatClinicalNumber(z, 2)} DE`;
}

export const whoGrowthCalculator: CalculatorDefinition = {
  id: 'who-growth',
  name: 'Crecimiento Infantil OMS — Percentiles, Tabla y Gráfica para Papás y Pediatras',
  shortName: 'Percentiles Pediátricos OMS',
  primarySpecialty: 'pediatria',
  secondarySpecialties: ['endocrinologia'],
  subcategory: 'formulas',
  keywords: [
    'oms',
    'crecimiento',
    'percentiles',
    'percentil',
    'tabla',
    'grafica',
    'curva',
    'z-score',
    'pediatria',
    'papas',
    'padres',
    'peso',
    'talla',
    'estatura',
    'perimetro cefalico',
    'imc pediatrico',
    'desnutricion',
  ],
  description:
    'Calcula automáticamente los percentiles y puntajes Z oficiales de la OMS (0 a 19 años) para peso, estatura, IMC y perímetro cefálico, e incluye una escala visual, gráfica interactiva y tabla por edades pensada también para madres y padres.',
  clinicalIndication:
    'Control del niño sano, seguimiento longitudinal del crecimiento, orientación comprensible para padres y detección de desnutrición, talla baja, sobrepeso u obesidad infantil.',
  validatedPopulation: 'Recién nacidos, lactantes, niños y adolescentes de 0 a 19 años (0 a 228 meses).',
  contraindications: [
    'Las tablas OMS están validadas para nacidos a término; en prematuros < 37 semanas debe usarse edad corregida hasta los 24 meses (o gráficas Fenton/Intergrowth-21st en periodo neonatal).',
    'En niños con síndromes genéticos específicos (p. ej. síndrome de Down, acondroplasia, Turner) deben emplearse curvas específicas para esa condición.',
  ],
  limitations: [
    'En menores de 24 meses las curvas OMS utilizan longitud medida acostado (decúbito supino); a partir de los 24 meses utilizan estatura de pie (~0.7 cm menos).',
    'El indicador Peso para la edad de la OMS cubre de 0 a 10 años (0–120 meses); de 10 a 19 años la proporción peso/talla se evalúa con el IMC para la edad.',
    'Un percentil aislado (por ejemplo P10 o P90) puede ser completamente normal según la talla familiar; lo más importante es que el niño siga su propio carril de crecimiento de forma armónica.',
  ],
  version: 'Tablas Oficiales OMS LMS (2006 / 2007)',
  references: [
    {
      citation:
        'WHO Multicentre Growth Reference Study Group. WHO Child Growth Standards: Length/height-for-age, weight-for-age, weight-for-length, weight-for-height, head circumference-for-age and BMI-for-age. Geneva: World Health Organization; 2006.',
      year: 2006,
    },
    {
      citation:
        'de Onis M, Onyango AW, Borghi E, et al. Development of a WHO growth reference for school-aged children and adolescents (5–19 years). Bull World Health Organ. 2007;85(9):660-667.',
      year: 2007,
    },
  ],
  fields: [
    ageMonthsField,
    sexField,
    weightField,
    heightField,
    headCircField,
    zIndicatorField,
    zScoreField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(whoGrowthCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const ageMonths = getCanonicalNumberValue(ageMonthsField, inputs.ageMonths as NumberInputValue)
      .canonicalValue!;
    const sex = (inputs.sex as WhoSex) === 'female' ? 'female' : 'male';
    const weight = getCanonicalNumberValue(weightField, inputs.weight as NumberInputValue)
      .canonicalValue!;
    const heightCm = getCanonicalNumberValue(heightField, inputs.height as NumberInputValue)
      .canonicalValue!;
    const headCirc = getCanonicalNumberValue(
      headCircField,
      inputs.headCircumference as NumberInputValue,
    ).canonicalValue;
    const manualZ = getCanonicalNumberValue(zScoreField, inputs.zScore as NumberInputValue)
      .canonicalValue;
    const zIndicator = inputs.zIndicator as string;

    const ageYears = ageMonths / 12;
    const heightM = heightCm / 100;
    const bmi = roundClinical(weight / (heightM * heightM), 1);
    const under5 = ageMonths < 60;

    // Automatic official WHO LMS calculations
    const wfaEval = ageMonths <= 120 ? evaluateWhoIndicator('wfa', sex, ageMonths, weight) : null;
    const lhfaEval = evaluateWhoIndicator('lhfa', sex, ageMonths, heightCm);
    const bmiEval = evaluateWhoIndicator('bmifa', sex, ageMonths, bmi);
    const hcfaEval =
      headCirc !== null && ageMonths <= 60
        ? evaluateWhoIndicator('hcfa', sex, ageMonths, headCirc)
        : null;

    // Preserve explicit manual Z-score override if supplied
    if (manualZ !== null) {
      let severity: SeverityLevel = 'normal';
      let riskClassification = '';
      let clinicalInterpretation = '';

      if (zIndicator === 'hfa') {
        if (manualZ < -3) {
          severity = 'high';
          riskClassification = `Talla baja severa / Desmedro grave (Z = ${formatClinicalNumber(manualZ, 1)} < −3 DE)`;
        } else if (manualZ < -2) {
          severity = 'moderate';
          riskClassification = `Talla baja / Retraso del crecimiento (Z = ${formatClinicalNumber(manualZ, 1)} < −2 DE)`;
        } else if (manualZ <= 2) {
          severity = 'normal';
          riskClassification = `Talla adecuada para la edad (Z = ${formatClinicalNumber(manualZ, 1)})`;
        } else {
          severity = 'info';
          riskClassification = `Talla alta para la edad (Z = +${formatClinicalNumber(manualZ, 1)} > +2 DE)`;
        }
        clinicalInterpretation =
          'Clasificación OMS manual de longitud/talla para la edad; contrastar con talla diana familiar y velocidad de crecimiento.';
      } else if (zIndicator === 'wfa') {
        if (manualZ < -3) {
          severity = 'high';
          riskClassification = `Bajo peso severo para la edad (Z = ${formatClinicalNumber(manualZ, 1)} < −3 DE)`;
        } else if (manualZ < -2) {
          severity = 'moderate';
          riskClassification = `Bajo peso para la edad (Z = ${formatClinicalNumber(manualZ, 1)} < −2 DE)`;
        } else if (manualZ <= 1) {
          severity = 'normal';
          riskClassification = `Peso adecuado para la edad (Z = ${formatClinicalNumber(manualZ, 1)})`;
        } else {
          severity = 'low';
          riskClassification = `Peso elevado para la edad (Z > +1 DE) — Evaluar IMC/edad`;
        }
        clinicalInterpretation =
          'El indicador Peso/Edad no distingue entre bajo peso por talla baja y emaciación; interpretar siempre junto a IMC/edad.';
      } else {
        if (manualZ < -3) {
          severity = 'critical';
          riskClassification = 'Desnutrición aguda severa / Emaciación grave (Z < −3 DE)';
        } else if (manualZ < -2) {
          severity = 'high';
          riskClassification = 'Desnutrición aguda moderada / Emaciación (Z −3 a −2 DE)';
        } else if (manualZ <= 1) {
          severity = 'normal';
          riskClassification = 'Estado nutricional normal (Z −2 a +1 DE)';
        } else if (under5) {
          if (manualZ <= 2) {
            severity = 'low';
            riskClassification = 'Riesgo de sobrepeso (< 5 años: Z +1 a +2 DE)';
          } else if (manualZ <= 3) {
            severity = 'moderate';
            riskClassification = 'Sobrepeso infantil (< 5 años: Z +2 a +3 DE)';
          } else {
            severity = 'high';
            riskClassification = 'Obesidad infantil (< 5 años: Z > +3 DE)';
          }
        } else if (manualZ <= 2) {
          severity = 'moderate';
          riskClassification = 'Sobrepeso (5–19 años: Z +1 a +2 DE)';
        } else if (manualZ <= 3) {
          severity = 'high';
          riskClassification = 'Obesidad (5–19 años: Z > +2 DE)';
        } else {
          severity = 'high';
          riskClassification = 'Obesidad grave (5–19 años: Z > +3 DE)';
        }
        clinicalInterpretation = under5
          ? 'Clasificación oficial OMS 2006 para menores de 5 años (IMC/edad).'
          : 'Clasificación oficial OMS 2007 para niños y adolescentes de 5 a 19 años (IMC/edad).';
      }

      return {
        primaryResult: {
          label: 'IMC Pediátrico (Puntaje Z manual)',
          value: bmi,
          formattedValue: formatClinicalNumber(bmi, 1),
          unit: 'kg/m²',
        },
        secondaryResults: [
          {
            label: 'Puntaje Z OMS evaluado',
            formattedValue: formatSignedZ(manualZ),
            unit: '',
          },
          ...(wfaEval
            ? [
                {
                  label: 'Peso/Edad OMS automático',
                  formattedValue: `${wfaEval.percentileFormatted} (${formatSignedZ(wfaEval.zScore)})`,
                  unit: '',
                },
              ]
            : []),
          ...(lhfaEval
            ? [
                {
                  label: 'Talla/Edad OMS automático',
                  formattedValue: `${lhfaEval.percentileFormatted} (${formatSignedZ(lhfaEval.zScore)})`,
                  unit: '',
                },
              ]
            : []),
        ],
        severity,
        riskClassification,
        clinicalInterpretation,
        guidance: [
          'Evaluar tendencia longitudinal en la gráfica OMS y no únicamente una medición aislada.',
          ...(manualZ < -3
            ? [
                'Desnutrición aguda severa: descartar edema bilateral, hipoglucemia, hipotermia o infección y activar protocolo terapéutico urgente.',
              ]
            : []),
        ],
        guidanceDisclaimer: 'En < 2 años usar longitud en decúbito y tablas OMS 0–2 años.',
        formulaUsed: 'Puntaje Z manual sobre cortes oficiales OMS (2006 / 2007)',
        inputsSummary: `Edad: ${formatAgeMonthsLabel(ageMonths)} · Sexo: ${sex === 'male' ? 'Niño' : 'Niña'} · Peso: ${weight} kg · Talla: ${heightCm} cm · Z manual: ${manualZ}`,
      };
    }

    if (!bmiEval || !lhfaEval) {
      throw new Error('La edad o medidas introducidas están fuera del rango OMS (0–228 meses).');
    }

    // Determine overall highest clinical alert among BMI, height, weight, and head circumference
    const severityRank: Record<SeverityLevel, number> = {
      normal: 0,
      info: 1,
      low: 2,
      moderate: 3,
      high: 4,
      critical: 5,
    };
    const allEvals = [bmiEval, lhfaEval, ...(wfaEval ? [wfaEval] : []), ...(hcfaEval ? [hcfaEval] : [])];
    let overallSeverity: SeverityLevel = bmiEval.severity;
    for (const ev of allEvals) {
      if (severityRank[ev.severity] > severityRank[overallSeverity]) {
        overallSeverity = ev.severity;
      }
    }

    const secondaryResults: SecondaryResultItem[] = [];

    if (wfaEval) {
      secondaryResults.push({
        label: 'Peso para la edad (OMS 0–10 años)',
        formattedValue: wfaEval.percentileFormatted,
        unit: `(${formatSignedZ(wfaEval.zScore)})`,
        note: `${formatClinicalNumber(weight, 1)} kg · Rango normal P3–P97: ${wfaEval.p3}–${wfaEval.p97} kg (promedio P50: ${wfaEval.p50} kg). ${wfaEval.parentExplanation}`,
      });
    } else {
      secondaryResults.push({
        label: 'Peso para la edad',
        formattedValue: `${formatClinicalNumber(weight, 1)} kg`,
        unit: '',
        note: 'La OMS no usa curvas de Peso/Edad después de los 10 años por la variación puberal; a partir de esa edad el peso se valora con el IMC para la edad.',
      });
    }

    secondaryResults.push({
      label: ageMonths < 24 ? 'Longitud para la edad (OMS < 2 años)' : 'Talla para la edad (OMS ≥ 2 años)',
      formattedValue: lhfaEval.percentileFormatted,
      unit: `(${formatSignedZ(lhfaEval.zScore)})`,
      note: `${formatClinicalNumber(heightCm, 1)} cm · Rango normal P3–P97: ${lhfaEval.p3}–${lhfaEval.p97} cm (promedio P50: ${lhfaEval.p50} cm). ${lhfaEval.parentExplanation}`,
    });

    secondaryResults.push({
      label: 'IMC para la edad (proporción peso / estatura)',
      formattedValue: bmiEval.percentileFormatted,
      unit: `(${formatClinicalNumber(bmi, 1)} kg/m² · ${formatSignedZ(bmiEval.zScore)})`,
      note: `Rango P3–P97: ${bmiEval.p3}–${bmiEval.p97} kg/m² (promedio P50: ${bmiEval.p50} kg/m²). ${bmiEval.parentExplanation}`,
    });

    if (hcfaEval && headCirc !== null) {
      secondaryResults.push({
        label: 'Perímetro cefálico para la edad (OMS 0–5 años)',
        formattedValue: hcfaEval.percentileFormatted,
        unit: `(${formatClinicalNumber(headCirc, 1)} cm · ${formatSignedZ(hcfaEval.zScore)})`,
        note: `Rango normal P3–P97: ${hcfaEval.p3}–${hcfaEval.p97} cm (promedio P50: ${hcfaEval.p50} cm). ${hcfaEval.parentExplanation}`,
      });
    }

    const guidance: string[] = [
      'Un solo control muestra una foto del momento; lo más importante es verificar en su cartilla o consulta que el niño siga de forma estable su propio carril de percentil.',
      'Revisa la gráfica de curvas y la tabla de referencia OMS más arriba (en el panel interactivo) para comparar visualmente con los valores esperados para su edad.',
    ];

    if (bmiEval.zScore < -2 || lhfaEval.zScore < -2 || (wfaEval && wfaEval.zScore < -2)) {
      guidance.push(
        'Se detectó al menos un parámetro por debajo de P3 (Z < −2 DE): se recomienda valoración presencial por pediatría para revisar curva previa, alimentación y causas tratables.',
      );
    }
    if (bmiEval.zScore > (under5 ? 2 : 1)) {
      guidance.push(
        'IMC por encima del rango esperado para la edad: fomentar alimentación equilibrada en familia (evitar bebidas azucaradas), juego activo diario y control pediátrico periódico sin dietas restrictivas extremas.',
      );
    }
    if (hcfaEval && (hcfaEval.zScore < -2 || hcfaEval.zScore > 2)) {
      guidance.push(
        'Perímetro cefálico fuera de P3–P97: debe ser evaluado por su pediatra comparando mediciones seriadas y antecedentes familiares.',
      );
    }

    const headlineParts = [
      wfaEval ? `Peso ${wfaEval.percentileFormatted}` : null,
      `Talla ${lhfaEval.percentileFormatted}`,
      `IMC ${bmiEval.percentileFormatted}`,
    ].filter(Boolean);

    return {
      primaryResult: {
        label: 'Percentil IMC para la edad (OMS)',
        value: bmiEval.percentile,
        formattedValue: bmiEval.percentileFormatted,
        unit: `IMC ${formatClinicalNumber(bmi, 1)} kg/m² · ${formatSignedZ(bmiEval.zScore)}`,
      },
      secondaryResults,
      severity: overallSeverity,
      riskClassification: `${bmiEval.classification} · ${headlineParts.join(' | ')}`,
      clinicalInterpretation: bmiEval.parentExplanation,
      guidance,
      guidanceDisclaimer:
        'Herramienta informativa basada en estándares oficiales OMS (2006/2007). No sustituye el examen físico ni el seguimiento pediátrico.',
      formulaUsed:
        'Método Box-Cox LMS oficial OMS (2006 para 0–5 años / 2007 para 5–19 años) con interpolación mensual exacta',
      inputsSummary: `${sex === 'male' ? 'Niño' : 'Niña'} · ${formatAgeMonthsLabel(ageMonths)} (${formatClinicalNumber(ageYears, 1)} años) · Peso ${weight} kg · Talla ${heightCm} cm · IMC ${formatClinicalNumber(bmi, 1)}`,
    };
  },
};
