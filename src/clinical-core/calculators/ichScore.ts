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
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const gcsField: SelectFieldDef = {
  id: 'gcsGroup',
  label: 'Escala de Coma de Glasgow inicial',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '13 – 15 puntos (+0)', points: 0 },
    { value: '1', label: '5 – 12 puntos (+1)', points: 1 },
    { value: '2', label: '3 – 4 puntos (+2)', points: 2 },
  ],
};

const volModeField: SelectFieldDef = {
  id: 'volumeMode',
  label: 'Modo de ingreso del volumen del hematoma',
  type: 'select',
  defaultValue: 'direct',
  options: [
    { value: 'direct', label: 'Selección directa (< 30 mL vs ≥ 30 mL)' },
    { value: 'abc2', label: 'Calcular volumen por fórmula ABC / 2 (en cm y cortes)' },
  ],
};

const volDirectField: SelectFieldDef = {
  id: 'vol30',
  label: 'Volumen estimado de la hemorragia intracerebral',
  type: 'select',
  defaultValue: '0',
  visibleWhen: (i) => i.volumeMode === 'direct',
  options: [
    { value: '0', label: '< 30 mL (+0)', points: 0 },
    { value: '1', label: '≥ 30 mL (+1)', points: 1 },
  ],
};

const dimAField: NumberFieldDef = {
  id: 'dimA',
  label: 'A — Diámetro mayor de la hemorragia en TC (cm)',
  type: 'number',
  canonicalUnit: 'cm',
  units: [{ id: 'cm', label: 'cm', toCanonical: (v) => v, min: 0.1, max: 20, step: 0.1 }],
  defaultUnitId: 'cm',
  min: 0.1,
  max: 20,
  placeholder: '4.5',
  visibleWhen: (i) => i.volumeMode === 'abc2',
};

const dimBField: NumberFieldDef = {
  id: 'dimB',
  label: 'B — Diámetro perpendicular a A en el mismo corte (cm)',
  type: 'number',
  canonicalUnit: 'cm',
  units: [{ id: 'cm', label: 'cm', toCanonical: (v) => v, min: 0.1, max: 20, step: 0.1 }],
  defaultUnitId: 'cm',
  min: 0.1,
  max: 20,
  placeholder: '3.0',
  visibleWhen: (i) => i.volumeMode === 'abc2',
};

const dimCField: NumberFieldDef = {
  id: 'dimC',
  label: 'C — Altura vertical (n.º cortes ponderados × grosor de corte en cm)',
  type: 'number',
  canonicalUnit: 'cm',
  units: [{ id: 'cm', label: 'cm', toCanonical: (v) => v, min: 0.1, max: 20, step: 0.1 }],
  defaultUnitId: 'cm',
  min: 0.1,
  max: 20,
  placeholder: '4.0',
  visibleWhen: (i) => i.volumeMode === 'abc2',
};

const ivhField: BooleanFieldDef = {
  id: 'ivh',
  label: 'Presencia de hemorragia intraventricular (HIV) (+1)',
  type: 'boolean',
  defaultValue: false,
};

const infratentorialField: BooleanFieldDef = {
  id: 'infratentorial',
  label: 'Origen infratentorial (cerebelo o tronco encefálico) (+1)',
  type: 'boolean',
  defaultValue: false,
};

const age80Field: BooleanFieldDef = {
  id: 'age80',
  label: 'Edad ≥ 80 años (+1)',
  type: 'boolean',
  defaultValue: false,
};

const MORTALITY_30D: Record<number, string> = {
  0: '0 %',
  1: '13 %',
  2: '26 %',
  3: '72 %',
  4: '97 %',
  5: '100 %',
  6: '100 % (estimada)',
};

export const ichScoreCalculator: CalculatorDefinition = {
  id: 'ich-score',
  name: 'ICH Score (Hemorragia Intracerebral)',
  shortName: 'ICH Score',
  primarySpecialty: 'neurologia',
  secondarySpecialties: ['urgencias'],
  subcategory: 'gravedad',
  keywords: ['ich', 'hemorragia intracerebral', 'hic', 'abc/2', 'hemphill', 'mortalidad'],
  description:
    'Estratificación pronóstica de mortalidad a 30 días en hemorragia intracerebral espontánea (0–6 puntos), con cálculo opcional de volumen por ABC/2.',
  clinicalIndication:
    'Comunicación pronóstica estandarizada y estratificación clínica en adultos con hemorragia intraparenquimatosa espontánea no traumática.',
  validatedPopulation: 'Adultos con hemorragia intracerebral primaria espontánea.',
  contraindications: [
    'NO utilizar de forma aislada para limitar precozmente el tratamiento o establecer órdenes de no reanimación (guías AHA/ASA 2022 advierten contra la profecía autocumplida en las primeras 24–48 h).',
  ],
  limitations: [
    'La fórmula ABC/2 sobrestima hematomas muy irregulares o multilobulares.',
    'La mortalidad observada en la cohorte original de 2001 puede diferir en centros con neurointensivismo y cirugía mínimamente invasiva moderna.',
  ],
  version: 'Hemphill JC et al. (Stroke 2001) + Kothari ABC/2',
  references: [
    {
      citation: 'Hemphill JC 3rd, Bonovich DC, Besmertis L, Manley GT, Johnston SC. The ICH score: a simple, reliable grading scale for intracerebral hemorrhage. Stroke. 2001;32(4):891-897.',
      year: 2001,
    },
    {
      citation: 'Greenberg SM, Ziai WC, Cordonnier C, et al. 2022 Guideline for the Management of Patients With Spontaneous Intracerebral Hemorrhage. Stroke. 2022;53(7):e282-e361.',
      year: 2022,
    },
  ],
  fields: [
    gcsField,
    volModeField,
    volDirectField,
    dimAField,
    dimBField,
    dimCField,
    ivhField,
    infratentorialField,
    age80Field,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(ichScoreCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    let volPts = 0;
    let computedVolMl: number | null = null;
    if (inputs.volumeMode === 'abc2') {
      const a = getCanonicalNumberValue(dimAField, inputs.dimA as NumberInputValue).canonicalValue!;
      const b = getCanonicalNumberValue(dimBField, inputs.dimB as NumberInputValue).canonicalValue!;
      const c = getCanonicalNumberValue(dimCField, inputs.dimC as NumberInputValue).canonicalValue!;
      computedVolMl = roundClinical((a * b * c) / 2, 1);
      volPts = computedVolMl >= 30 ? 1 : 0;
    } else {
      volPts = Number(inputs.vol30);
    }

    const score =
      Number(inputs.gcsGroup) +
      volPts +
      (inputs.ivh === true ? 1 : 0) +
      (inputs.infratentorial === true ? 1 : 0) +
      (inputs.age80 === true ? 1 : 0);

    const mortality = MORTALITY_30D[score] ?? '100 %';

    let severity: SeverityLevel = 'normal';
    if (score === 0) severity = 'normal';
    else if (score === 1) severity = 'low';
    else if (score === 2) severity = 'moderate';
    else if (score === 3) severity = 'high';
    else severity = 'critical';

    return {
      primaryResult: {
        label: 'Puntuación ICH Score',
        value: score,
        formattedValue: String(score),
        unit: 'puntos (de 6)',
      },
      secondaryResults: [
        {
          label: 'Mortalidad a 30 días (cohorte Hemphill 2001)',
          formattedValue: mortality,
          unit: '',
        },
        ...(computedVolMl !== null
          ? [
              {
                label: 'Volumen calculado (ABC / 2)',
                formattedValue: formatClinicalNumber(computedVolMl, 1),
                unit: 'mL',
                note: computedVolMl >= 30 ? '≥ 30 mL (+1 punto)' : '< 30 mL (0 puntos)',
              },
            ]
          : []),
      ],
      severity,
      riskClassification: `ICH Score ${score} / 6 (Mortalidad 30 d cohorte original: ${mortality})`,
      clinicalInterpretation:
        'A mayor puntuación se incrementa progresivamente la mortalidad a 30 días y la probabilidad de discapacidad funcional grave.',
      guidanceDisclaimer:
        'Las guías AHA/ASA 2022 desaconsejan utilizar el ICH Score como base única para decisiones de adecuación terapéutica precoz.',
      formulaUsed: 'GCS (0–2) + Volumen ≥30 mL (0/1) + HIV (0/1) + Infratentorial (0/1) + Edad ≥80 (0/1)',
      inputsSummary: `ICH Score: ${score} / 6${computedVolMl !== null ? ` · Volumen: ${computedVolMl} mL` : ''}`,
    };
  },
};
