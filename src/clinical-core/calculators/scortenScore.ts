import {
  formatClinicalNumber,
  getCanonicalNumberValue,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SecondaryResultItem,
  SeverityLevel,
} from '../types/clinical.ts';
import {
  AGE_UNITS_YEARS,
  BUN_OR_UREA_UNITS_MG_DL_BUN,
  ELECTROLYTE_UNITS_MEQ_L,
  GLUCOSE_UNITS_MG_DL,
  HR_UNITS_BPM,
} from '../units/converters.ts';

const ageField: NumberFieldDef = {
  id: 'age',
  label: '1. Edad (corte ≥ 40 años)',
  type: 'number',
  canonicalUnit: 'años',
  units: [
    { id: 'years', label: 'años', toCanonical: (v) => v, min: 1, max: 120, step: 1 },
    ...AGE_UNITS_YEARS.filter((u) => u.id !== 'years'),
  ],
  defaultUnitId: 'years',
  defaultValue: '45',
  min: 1,
  max: 120,
  placeholder: '45',
};

const malignancyField: BooleanFieldDef = {
  id: 'malignancy',
  label: '2. Neoplasia maligna / cáncer asociado (+1)',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Sí (+1)',
  falseLabel: 'No',
};

const hrField: NumberFieldDef = {
  id: 'hr',
  label: '3. Frecuencia cardíaca (corte ≥ 120 lpm)',
  type: 'number',
  canonicalUnit: 'lpm',
  units: HR_UNITS_BPM,
  defaultUnitId: 'bpm',
  defaultValue: '105',
  min: 30,
  max: 240,
  placeholder: '105',
};

const bsaDetachedField: NumberFieldDef = {
  id: 'bsaDetached',
  label: '4. Superficie corporal con desprendimiento epidérmico inicial (corte ≥ 10%)',
  type: 'number',
  canonicalUnit: '%',
  units: [{ id: 'pct', label: '% SCT', toCanonical: (v) => v, min: 0, max: 100, step: 1 }],
  defaultUnitId: 'pct',
  defaultValue: '12',
  min: 0,
  max: 100,
  placeholder: '12',
  helpText: 'SSJ: < 10% SCT · Solapamiento SSJ-NET: 10–30% SCT · NET: > 30% SCT.',
};

const bunField: NumberFieldDef = {
  id: 'bun',
  label: '5. Urea o BUN sérico (corte Urea > 10 mmol/L / BUN > 28 mg/dL)',
  type: 'number',
  canonicalUnit: 'BUN mg/dL',
  units: BUN_OR_UREA_UNITS_MG_DL_BUN,
  defaultUnitId: 'bun_mg_dl',
  defaultValue: '22',
  min: 1,
  max: 300,
  placeholder: '22',
  helpText: 'Urea > 10 mmol/L equivale a Urea > 60 mg/dL o BUN > 28 mg/dL.',
};

const hco3Field: NumberFieldDef = {
  id: 'hco3',
  label: '6. Bicarbonato sérico (corte < 20 mEq/L)',
  type: 'number',
  canonicalUnit: 'mEq/L',
  units: ELECTROLYTE_UNITS_MEQ_L,
  defaultUnitId: 'meq_l',
  defaultValue: '22',
  min: 2,
  max: 55,
  placeholder: '22',
};

const glucoseField: NumberFieldDef = {
  id: 'glucose',
  label: '7. Glucosa sérica (corte > 252 mg/dL / > 14 mmol/L)',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: GLUCOSE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  defaultValue: '130',
  min: 20,
  max: 1500,
  placeholder: '130',
};

const MORTALITY_BY_SCORE: Record<number, string> = {
  0: '3.2%',
  1: '3.2%',
  2: '12.1%',
  3: '35.3%',
  4: '58.3%',
  5: '> 90% (~90.0%)',
  6: '> 90%',
  7: '> 90%',
};

export const scortenScoreCalculator: CalculatorDefinition = {
  id: 'scorten-sjs-ten',
  name: 'SCORTEN — Gravedad en Síndrome de Stevens-Johnson y Necrólisis Epidérmica Tóxica',
  shortName: 'SCORTEN (SSJ / NET)',
  primarySpecialty: 'dermatologia',
  secondarySpecialties: ['urgencias', 'medicina-interna'],
  subcategory: 'gravedad',
  keywords: [
    'scorten',
    'stevens johnson',
    'ssj',
    'net',
    'ten',
    'necrolisis epidermica toxica',
    'farmacodermia',
    'dermatologia',
  ],
  description:
    'Predice la mortalidad hospitalaria en el Síndrome de Stevens-Johnson (SSJ) y la Necrólisis Epidérmica Tóxica (NET) mediante 7 variables clínicas y analíticas.',
  clinicalIndication:
    'Estratificación pronóstica al ingreso (día 1) y al día 3 en pacientes con SSJ, solapamiento SSJ-NET o NET para decidir traslado a Unidad de Quemados o UCI.',
  validatedPopulation: 'Pacientes con diagnóstico confirmado o altamente sospechoso de SSJ, solapamiento SSJ-NET o NET.',
  contraindications: [
    'No utilizar en otras dermatosis ampollares o eritrodermias (p. ej., síndrome de piel escaldada estafilocócica, pénfigo, DRESS sin desprendimiento epidérmico).',
  ],
  limitations: [
    'Debe calcularse al ingreso (primeras 24 h) y repetirse al día 3 para mejorar la capacidad discriminativa pronóstica.',
    'Las cohortes recientes con manejo intensivo en centros de referencia muestran supervivencias algo mejores que la serie original de 2000, aunque la estratificación relativa sigue siendo válida.',
  ],
  requiredLabsNote: 'Requiere Urea/BUN, bicarbonato sérico (gasometría o bioquímica) y glucemia.',
  version: 'Bastuji-Garin et al. (2000)',
  references: [
    {
      citation:
        'Bastuji-Garin S, Fouchard N, Bertocchi M, Roujeau JC, Revuz J, Wolkenstein P. SCORTEN: a severity-of-illness score for toxic epidermal necrolysis. J Invest Dermatol. 2000;115(2):149-153.',
      year: 2000,
    },
    {
      citation:
        'Creamer D, Walsh SA, Dziewulski P, et al. UK guidelines for the management of Stevens-Johnson syndrome/toxic epidermal necrolysis in adults 2016. Br J Dermatol. 2016;174(6):1194-1227.',
      year: 2016,
    },
  ],
  fields: [ageField, malignancyField, hrField, bsaDetachedField, bunField, hco3Field, glucoseField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(scortenScoreCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const age = getCanonicalNumberValue(ageField, inputs.age as NumberInputValue).canonicalValue!;
    const malignancy = Boolean(inputs.malignancy);
    const hr = getCanonicalNumberValue(hrField, inputs.hr as NumberInputValue).canonicalValue!;
    const bsa = getCanonicalNumberValue(bsaDetachedField, inputs.bsaDetached as NumberInputValue).canonicalValue!;
    const bun = getCanonicalNumberValue(bunField, inputs.bun as NumberInputValue).canonicalValue!;
    const hco3 = getCanonicalNumberValue(hco3Field, inputs.hco3 as NumberInputValue).canonicalValue!;
    const glucose = getCanonicalNumberValue(glucoseField, inputs.glucose as NumberInputValue).canonicalValue!;

    const pAge = age >= 40 ? 1 : 0;
    const pMalignancy = malignancy ? 1 : 0;
    const pHr = hr >= 120 ? 1 : 0;
    const pBsa = bsa >= 10 ? 1 : 0;
    const pBun = bun > 28.015 ? 1 : 0; // > 10 mmol/L serum urea
    const pHco3 = hco3 < 20 ? 1 : 0;
    const pGlu = glucose > 252.26 ? 1 : 0; // > 14 mmol/L glucose

    const total = pAge + pMalignancy + pHr + pBsa + pBun + pHco3 + pGlu;
    const mortality = MORTALITY_BY_SCORE[total] ?? '> 90%';

    let phenotype = 'Síndrome de Stevens-Johnson (SSJ < 10% SCT)';
    if (bsa > 30) phenotype = 'Necrólisis Epidérmica Tóxica (NET > 30% SCT)';
    else if (bsa >= 10) phenotype = 'Solapamiento SSJ–NET (10–30% SCT)';

    let severity: SeverityLevel = 'moderate';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [
      'Suspender de inmediato todo fármaco sospechoso (evaluar algoritmo ALDEN) y evitar traumatismos cutáneos.',
      'Garantizar soporte hidroelectrolítico, termorregulación, analgesia, cuidado ocular oftalmológico precoz y cuidado mucocutáneo estéril.',
    ];

    if (total <= 1) {
      severity = 'moderate';
      riskClassification = `SCORTEN ${total}/7 · Mortalidad esperada ${mortality}`;
      clinicalInterpretation =
        'Riesgo basal relativamente bajo, pero todo SSJ/NET requiere vigilancia estrecha hospitalaria ante posible progresión del desprendimiento en las primeras 72 horas.';
      guidance.push('Recalcular SCORTEN al día 3 de evolución y vigilar afectación mucosa (ocular, oral, genital y respiratoria).');
    } else if (total === 2) {
      severity = 'high';
      riskClassification = `SCORTEN 2/7 · Mortalidad esperada ${mortality}`;
      clinicalInterpretation =
        'Riesgo moderado-alto de mortalidad hospitalaria; indicado ingreso en unidad de monitorización continua o Unidad de Quemados según extensión.';
      guidance.push('Valorar traslado precoz a Unidad de Quemados o UCI, especialmente si SCT ≥ 10%.');
    } else {
      severity = 'critical';
      riskClassification = `SCORTEN ${total}/7 · Mortalidad esperada ${mortality}`;
      clinicalInterpretation =
        'Riesgo crítico de mortalidad y complicaciones sistémicas (sepsis cutánea, fallo respiratorio, desequilibrio hidroelectrolítico).';
      guidance.push(
        'Indicación prioritaria de ingreso en Unidad de Quemados o UCI con equipo multidisciplinario (Dermatología, Cuidados Intensivos, Oftalmología).',
      );
    }

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Mortalidad hospitalaria estimada',
        formattedValue: mortality,
        unit: '',
      },
      {
        label: 'Fenotipo por % SCT desprendida',
        formattedValue: phenotype,
        unit: '',
      },
    ];

    return {
      primaryResult: {
        label: 'SCORTEN Total',
        value: total,
        formattedValue: `${total} / 7`,
        unit: 'puntos',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'SCORTEN (0–7) = Edad ≥40 + Cáncer + FC ≥120 + SCT ≥10% + Urea >10 mmol/L + HCO₃⁻ <20 + Glucosa >14 mmol/L',
      inputsSummary: `SCORTEN ${total}/7 · SCT ${formatClinicalNumber(bsa, 0)}% · Mortalidad ${mortality}`,
    };
  },
};
