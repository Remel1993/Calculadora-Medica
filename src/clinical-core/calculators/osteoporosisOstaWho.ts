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
  SecondaryResultItem,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';
import { AGE_UNITS_YEARS, WEIGHT_UNITS_KG } from '../units/converters.ts';

const modeField: SelectFieldDef = {
  id: 'mode',
  label: 'Herramienta a evaluar',
  type: 'select',
  defaultValue: 'who_dxa',
  options: [
    {
      value: 'who_dxa',
      label: 'Clasificación Densitométrica OMS / ISCD (T-score o Z-score DXA)',
      description: 'Interpreta densitometría ósea DXA diferenciando posmenopáusicas / ≥ 50 años (T-score) de jóvenes (Z-score).',
    },
    {
      value: 'osta',
      label: 'Índice OSTA (cribado clínico previo a DXA sin densitometría)',
      description: 'Fórmula de Koh (0.2 × [Peso kg − Edad años]) para priorizar indicación de DXA en mujeres posmenopáusicas.',
    },
  ],
};

const populationField: SelectFieldDef = {
  id: 'population',
  label: 'Grupo poblacional (criterio ISCD / OMS)',
  type: 'select',
  defaultValue: 'postmeno_ge50',
  options: [
    { value: 'postmeno_ge50', label: 'Mujer posmenopáusica o varón ≥ 50 años (usar T-score)' },
    { value: 'premeno_lt50', label: 'Mujer premenopáusica o varón < 50 años (usar Z-score)' },
  ],
  visibleWhen: (inputs) => inputs.mode !== 'osta',
};

const tScoreField: NumberFieldDef = {
  id: 'tScore',
  label: 'Peor T-score DXA (columna lumbar, cuello femoral o cadera total)',
  type: 'number',
  canonicalUnit: 'DE',
  units: [{ id: 'sd', label: 'DE', toCanonical: (v) => v, min: -7, max: 5, step: 0.1 }],
  defaultUnitId: 'sd',
  defaultValue: '-2.1',
  min: -7,
  max: 5,
  placeholder: '-2.1',
  visibleWhen: (inputs) => inputs.mode !== 'osta' && inputs.population !== 'premeno_lt50',
};

const zScoreField: NumberFieldDef = {
  id: 'zScore',
  label: 'Peor Z-score DXA (comparado con población de igual edad y sexo)',
  type: 'number',
  canonicalUnit: 'DE',
  units: [{ id: 'sd', label: 'DE', toCanonical: (v) => v, min: -7, max: 5, step: 0.1 }],
  defaultUnitId: 'sd',
  defaultValue: '-1.8',
  min: -7,
  max: 5,
  placeholder: '-1.8',
  visibleWhen: (inputs) => inputs.mode !== 'osta' && inputs.population === 'premeno_lt50',
};

const fragilityFractureField: BooleanFieldDef = {
  id: 'fragilityFracture',
  label: '¿Antecedente de fractura mayor por fragilidad (cadera o vértebra)?',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Sí',
  falseLabel: 'No',
  helpText: 'Una fractura de cadera o vertebral por fragilidad (bajo impacto) establece diagnóstico clínico de osteoporosis grave incluso con T-score > -2.5.',
  visibleWhen: (inputs) => inputs.mode !== 'osta',
};

const weightField: NumberFieldDef = {
  id: 'weight',
  label: 'Peso corporal',
  type: 'number',
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  defaultValue: '54',
  min: 25,
  max: 250,
  placeholder: '54',
  visibleWhen: (inputs) => inputs.mode === 'osta',
};

const ageField: NumberFieldDef = {
  id: 'age',
  label: 'Edad',
  type: 'number',
  canonicalUnit: 'años',
  units: AGE_UNITS_YEARS,
  defaultUnitId: 'years',
  defaultValue: '68',
  min: 35,
  max: 110,
  placeholder: '68',
  visibleWhen: (inputs) => inputs.mode === 'osta',
};

export const osteoporosisOstaWhoCalculator: CalculatorDefinition = {
  id: 'osteoporosis-osta-who',
  name: 'Osteoporosis: Clasificación Densitométrica OMS/ISCD e Índice OSTA',
  shortName: 'Osteoporosis (OMS / OSTA)',
  primarySpecialty: 'medicina-interna',
  secondarySpecialties: ['geriatria', 'traumatologia', 'gineco-obstetricia'],
  subcategory: 'diagnostico',
  keywords: [
    'osteoporosis',
    'osteopenia',
    'densitometria',
    'dxa',
    't-score',
    'z-score',
    'osta',
    'fragilidad',
    'fractura',
  ],
  description:
    'Interpreta la densitometría ósea DXA según los criterios de la OMS/ISCD (diferenciando T-score y Z-score) y ofrece el índice clínico OSTA para priorizar el cribado con DXA.',
  clinicalIndication:
    'Consulta externa de medicina interna, geriatría, ginecología y reumatología para diagnóstico densitométrico o selección clínica de candidatas a densitometría.',
  validatedPopulation: 'OSTA validado en mujeres posmenopáusicas (≥ 45 años); criterios DXA OMS/ISCD en adultos.',
  contraindications: [
    'En menores de 50 años o mujeres premenopáusicas NO debe usarse el T-score para diagnosticar osteoporosis aislada; utilizar el Z-score según ISCD.',
  ],
  limitations: [
    'La decisión de iniciar tratamiento antirresortivo/osteoformador depende también de la edad, antecedentes de fractura, uso de corticoides y riesgo absoluto de fractura a 10 años.',
    'OSTA es solo una regla de cribado para solicitar DXA; no sustituye a la densitometría ni evalúa causas secundarias.',
  ],
  version: 'OMS (1994) · Posiciones Oficiales ISCD (2023) · Koh OSTA (2001)',
  references: [
    {
      citation:
        'WHO Study Group. Assessment of fracture risk and its application to screening for postmenopausal osteoporosis. World Health Organ Tech Rep Ser. 1994;843:1-129.',
      year: 1994,
    },
    {
      citation:
        'Koh LK, Sedrine WB, Torralba TP, et al. A simple tool to identify Asian women at increased risk of osteoporosis (OSTA). Osteoporos Int. 2001;12(8):699-705.',
      year: 2001,
    },
  ],
  fields: [modeField, populationField, tScoreField, zScoreField, fragilityFractureField, weightField, ageField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(osteoporosisOstaWhoCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    if (inputs.mode === 'osta') {
      const weight = getCanonicalNumberValue(weightField, inputs.weight as NumberInputValue).canonicalValue!;
      const age = getCanonicalNumberValue(ageField, inputs.age as NumberInputValue).canonicalValue!;
      const osta = roundClinical(0.2 * (weight - age), 1);

      let severity: SeverityLevel = 'normal';
      let riskClassification = '';
      let clinicalInterpretation = '';
      const guidance: string[] = [];

      if (osta >= -1) {
        severity = 'low';
        riskClassification = `Riesgo bajo en OSTA (${formatClinicalNumber(osta, 1)} ≥ -1)`;
        clinicalInterpretation =
          'Baja probabilidad de osteoporosis densitométrica (~3%); habitualmente no precisa DXA urgente salvo otros factores de riesgo (corticoides, fractura previa).';
        guidance.push('Asegurar aporte adecuado de calcio dietético, vitamina D, ejercicio con carga y prevención de caídas.');
      } else if (osta >= -4) {
        severity = 'moderate';
        riskClassification = `Riesgo intermedio en OSTA (${formatClinicalNumber(osta, 1)} · -1 a -4)`;
        clinicalInterpretation =
          'Riesgo intermedio (~15% de osteoporosis); se recomienda solicitar densitometría ósea (DXA) para confirmación.';
        guidance.push('Solicitar DXA de columna lumbar y cadera y valorar factores de riesgo secundarios.');
      } else {
        severity = 'high';
        riskClassification = `Riesgo alto en OSTA (${formatClinicalNumber(osta, 1)} < -4)`;
        clinicalInterpretation =
          'Probabilidad elevada de osteoporosis (> 50–60% en cohortes de validación) por edad avanzada y bajo peso corporal.';
        guidance.push('Indicación prioritaria de DXA de cadera y columna lumbar más estudio de causas secundarias.');
      }

      return {
        primaryResult: {
          label: 'Índice OSTA',
          value: osta,
          formattedValue: formatClinicalNumber(osta, 1),
          unit: 'pts',
        },
        severity,
        riskClassification,
        clinicalInterpretation,
        guidance,
        formulaUsed: 'OSTA = 0.2 × (Peso [kg] − Edad [años])',
        inputsSummary: `Peso ${roundClinical(weight, 1)} kg · Edad ${roundClinical(age, 0)} años · OSTA ${formatClinicalNumber(osta, 1)}`,
      };
    }

    const fragility = Boolean(inputs.fragilityFracture);
    const isYoung = inputs.population === 'premeno_lt50';

    if (isYoung) {
      const z = getCanonicalNumberValue(zScoreField, inputs.zScore as NumberInputValue).canonicalValue!;
      const lowBmd = z <= -2.0;

      let severity: SeverityLevel = 'normal';
      let riskClassification = '';
      let clinicalInterpretation = '';
      const guidance: string[] = [];

      if (fragility) {
        severity = 'high';
        riskClassification = `Fractura por fragilidad en < 50 años / premenopausia (Z-score ${formatClinicalNumber(z, 1)})`;
        clinicalInterpretation =
          'La presencia de fractura por fragilidad mayor indica fragilidad ósea clínicamente significativa independientemente del Z-score aislado.';
        guidance.push('Estudio obligatorio de osteoporosis secundaria (hiperparatiroidismo, celiaquía, Cushing, hipogonadismo, mieloma, corticoides) y valoración por Endocrinología/Reumatología.');
      } else if (lowBmd) {
        severity = 'moderate';
        riskClassification = `Masa ósea por debajo de lo esperado para la edad (Z-score ≤ -2.0 · ${formatClinicalNumber(z, 1)})`;
        clinicalInterpretation =
          'Según ISCD, en premenopáusicas y varones < 50 años un Z-score ≤ -2.0 se define como "por debajo del rango esperado para la edad" (no diagnosticar osteoporosis solo por DXA).';
        guidance.push('Investigar causas secundarias de pérdida ósea (déficit vitamina D, malabsorción, fármacos, amenorrea/hipogonadismo).');
      } else {
        severity = 'normal';
        riskClassification = `Dentro del rango esperado para la edad (Z-score > -2.0 · ${formatClinicalNumber(z, 1)})`;
        clinicalInterpretation = 'Densidad mineral ósea acorde con la edad cronológica y sexo.';
        guidance.push('Mantener hábitos saludables de salud ósea (calcio dietético, vitamina D y ejercicio de impacto/fuerza).');
      }

      return {
        primaryResult: {
          label: 'Z-score DXA',
          value: z,
          formattedValue: formatClinicalNumber(z, 1),
          unit: 'DE',
        },
        severity,
        riskClassification,
        clinicalInterpretation,
        guidance,
        formulaUsed: 'Criterios ISCD para mujeres premenopáusicas y varones < 50 años (Z-score)',
        inputsSummary: `Joven/<50 a · Z-score ${formatClinicalNumber(z, 1)} · Fractura fragilidad: ${fragility ? 'Sí' : 'No'}`,
      };
    }

    const t = getCanonicalNumberValue(tScoreField, inputs.tScore as NumberInputValue).canonicalValue!;
    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (t <= -2.5 && fragility) {
      severity = 'critical';
      riskClassification = `Osteoporosis grave / establecida (T-score ${formatClinicalNumber(t, 1)} + fractura por fragilidad)`;
      clinicalInterpretation =
        'Cumple criterio densitométrico OMS de osteoporosis (T-score ≤ -2.5) junto con fractura mayor por fragilidad.';
      guidance.push('Indicación clara de tratamiento farmacológico específico (bifosfonato, denosumab o terapia osteoformadora en muy alto riesgo), calcio/vitamina D y prevención de caídas.');
    } else if (fragility) {
      severity = 'high';
      riskClassification = `Osteoporosis clínica por fractura de fragilidad (T-score ${formatClinicalNumber(t, 1)})`;
      clinicalInterpretation =
        'Aunque el T-score supere -2.5, una fractura por fragilidad de cadera o vértebra confiere diagnóstico clínico de osteoporosis y alto riesgo de refractura.';
      guidance.push('Evaluar tratamiento farmacológico preventivo secundario, estudio analítico básico (calcio, fósforo, PTH, 25-OH-D, función renal) y prevención de caídas.');
    } else if (t <= -2.5) {
      severity = 'high';
      riskClassification = `Osteoporosis (T-score ≤ -2.5 · ${formatClinicalNumber(t, 1)})`;
      clinicalInterpretation =
        'Cumple criterio densitométrico OMS de osteoporosis (T-score ≤ -2.5 DE).';
      guidance.push('Descartar causas secundarias (analítica ósea básica) e iniciar tratamiento farmacológico junto con optimización de calcio/vitamina D y ejercicio de fuerza.');
    } else if (t < -1.0) {
      severity = 'moderate';
      riskClassification = `Osteopenia / Masa ósea baja (T-score -1.0 a -2.4 · ${formatClinicalNumber(t, 1)})`;
      clinicalInterpretation =
        'Masa ósea disminuida en rango de osteopenia según la OMS.';
      guidance.push('Individualizar necesidad de tratamiento según riesgo clínico de fractura (edad, antecedentes familiares de fractura de cadera, corticoides, caídas) y repetir DXA en 2–5 años.');
    } else {
      severity = 'normal';
      riskClassification = `Densidad mineral ósea normal (T-score ≥ -1.0 · ${formatClinicalNumber(t, 1)})`;
      clinicalInterpretation = 'Sin criterios densitométricos de osteopenia ni osteoporosis.';
      guidance.push('Mantener medidas preventivas generales (ejercicio de carga, vitamina D adecuada y evitar tabaco/alcohol excesivo).');
    }

    const secondaryResults: SecondaryResultItem[] = [
      { label: 'Categoría OMS', formattedValue: t <= -2.5 ? 'Osteoporosis' : t < -1.0 ? 'Osteopenia' : 'Normal', unit: '' },
    ];

    return {
      primaryResult: {
        label: 'T-score DXA',
        value: t,
        formattedValue: formatClinicalNumber(t, 1),
        unit: 'DE',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'Criterios densitométricos OMS 1994 (Normal ≥ -1.0 · Osteopenia -1.0 a -2.4 · Osteoporosis ≤ -2.5)',
      inputsSummary: `≥50 a / Posmenopausia · T-score ${formatClinicalNumber(t, 1)} · Fractura fragilidad: ${fragility ? 'Sí' : 'No'}`,
    };
  },
};
