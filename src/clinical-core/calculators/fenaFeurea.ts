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
  BUN_OR_UREA_UNITS_MG_DL_BUN,
  CREATININE_UNITS_MG_DL,
  ELECTROLYTE_UNITS_MEQ_L,
  URINE_CREATININE_UNITS_MG_DL,
} from '../units/converters.ts';

const modeField: SelectFieldDef = {
  id: 'mode',
  label: 'Índice a calcular',
  type: 'select',
  defaultValue: 'fena',
  options: [
    { value: 'fena', label: 'FENa (Fracción Excretada de Sodio)' },
    { value: 'feurea', label: 'FEUrea (Útil si recibe diuréticos)' },
  ],
};

const serumCrField: NumberFieldDef = {
  id: 'serumCr',
  label: 'Creatinina sérica',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: CREATININE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 0.2,
  max: 25,
  placeholder: '2.0',
};

const urineCrField: NumberFieldDef = {
  id: 'urineCr',
  label: 'Creatinina urinaria',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: URINE_CREATININE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 5,
  max: 600,
  placeholder: '80',
};

const serumNaField: NumberFieldDef = {
  id: 'serumNa',
  label: 'Sodio sérico (Na⁺p)',
  type: 'number',
  canonicalUnit: 'mEq/L',
  units: ELECTROLYTE_UNITS_MEQ_L,
  defaultUnitId: 'meq_l',
  min: 100,
  max: 190,
  placeholder: '138',
  visibleWhen: (inputs) => inputs.mode === 'fena',
};

const urineNaField: NumberFieldDef = {
  id: 'urineNa',
  label: 'Sodio urinario (Na⁺u)',
  type: 'number',
  canonicalUnit: 'mEq/L',
  units: ELECTROLYTE_UNITS_MEQ_L,
  defaultUnitId: 'meq_l',
  min: 1,
  max: 300,
  placeholder: '15',
  visibleWhen: (inputs) => inputs.mode === 'fena',
};

const serumUreaField: NumberFieldDef = {
  id: 'serumUrea',
  label: 'BUN o Urea sérica',
  type: 'number',
  canonicalUnit: 'BUN mg/dL',
  units: BUN_OR_UREA_UNITS_MG_DL_BUN,
  defaultUnitId: 'bun_mg_dl',
  min: 1,
  max: 300,
  placeholder: '35',
  visibleWhen: (inputs) => inputs.mode === 'feurea',
};

const urineUreaField: NumberFieldDef = {
  id: 'urineUrea',
  label: 'BUN o Urea urinaria',
  type: 'number',
  canonicalUnit: 'BUN mg/dL',
  units: BUN_OR_UREA_UNITS_MG_DL_BUN,
  defaultUnitId: 'bun_mg_dl',
  min: 5,
  max: 3000,
  placeholder: '400',
  visibleWhen: (inputs) => inputs.mode === 'feurea',
  helpText: 'Nota: la concentración urinaria de urea/BUN suele ser mucho más alta que la sérica.',
};

export const fenaFeureaCalculator: CalculatorDefinition = {
  id: 'fena-feurea',
  name: 'Fracción Excretada de Sodio (FENa) y Urea (FEUrea)',
  shortName: 'FENa / FEUrea',
  primarySpecialty: 'nefrologia',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'diagnostico',
  keywords: [
    'fena',
    'feurea',
    'fraccion excretada',
    'prerrenal',
    'nta',
    'necrosis tubular aguda',
    'diureticos',
    'sodio urinario',
  ],
  description:
    'Índices urinarios bioquímicos orientativos para diferenciar azoemia prerrenal frente a lesión tubular intrínseca (NTA) en lesión renal aguda.',
  clinicalIndication:
    'Estudio diagnóstico de lesión renal aguda oligúrica; preferir FEUrea cuando el paciente ha recibido diuréticos recientes.',
  validatedPopulation: 'Adultos con lesión renal aguda oligúrica (sin obstrucción posrenal ni enfermedad renal crónica avanzada previa).',
  requiredLabsNote: 'Requiere muestras simultáneas de suero y orina puntual (creatinina, sodio y/o urea/BUN).',
  contraindications: [
    'Poca utilidad aislada en ERC preexistente avanzada, uropatía obstructiva crónica o diuresis osmótica.',
  ],
  limitations: [
    'Los diuréticos (furosemida, tiazidas) aumentan falsamente la FENa (> 1–2 %) incluso en estados prerrenales; en ese caso usar FEUrea.',
    'Puede observarse FENa < 1 % en causas intrínsecas no clásicas de NTA: nefropatía por contraste, rabdomiólisis, glomerulonefritis aguda o sepsis temprana.',
    'La FEUrea también pierde especificidad en diuresis osmótica, glucosuria intensa o lesión renal asociada a sepsis.',
  ],
  version: 'Espinel (1976) / Carvounis (2002)',
  references: [
    {
      citation:
        'Espinel CH. The FENa test. Use in the differential diagnosis of acute renal failure. JAMA. 1976;236(6):579-581.',
      year: 1976,
    },
    {
      citation:
        'Carvounis CP, Nisar S, Guro-Razuman S. Significance of the fractional excretion of urea in the differential diagnosis of acute renal failure. Kidney Int. 2002;62(6):2223-2229.',
      year: 2002,
    },
  ],
  fields: [
    modeField,
    serumCrField,
    urineCrField,
    serumNaField,
    urineNaField,
    serumUreaField,
    urineUreaField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(fenaFeureaCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const mode = inputs.mode as string;
    const sCrRes = getCanonicalNumberValue(serumCrField, inputs.serumCr as NumberInputValue);
    const uCrRes = getCanonicalNumberValue(urineCrField, inputs.urineCr as NumberInputValue);
    const sCr = sCrRes.canonicalValue!;
    const uCr = uCrRes.canonicalValue!;

    if (mode === 'fena') {
      const sNaRes = getCanonicalNumberValue(serumNaField, inputs.serumNa as NumberInputValue);
      const uNaRes = getCanonicalNumberValue(urineNaField, inputs.urineNa as NumberInputValue);
      const sNa = sNaRes.canonicalValue!;
      const uNa = uNaRes.canonicalValue!;

      const rawFena = ((uNa * sCr) / (sNa * uCr)) * 100;
      const fena = roundClinical(rawFena, 2);

      let severity: SeverityLevel = 'info';
      let riskClassification = '';
      let clinicalInterpretation = '';

      if (fena < 1.0) {
        severity = 'low';
        riskClassification = 'FENa < 1.0 % (Orientación prerrenal)';
        clinicalInterpretation =
          'Sugiere reabsorción tubular ávida de sodio compatible con hipoperfusión prerrenal (descartar excepciones como contraste, rabdomiólisis o glomerulonefritis temprana).';
      } else if (fena <= 2.0) {
        severity = 'moderate';
        riskClassification = 'FENa 1.0 – 2.0 % (Zona indeterminada)';
        clinicalInterpretation =
          'Valor intermedio no concluyente. Integrar con sedimento urinario, FEUrea y respuesta clínica a reposición si está indicada.';
      } else {
        severity = 'high';
        riskClassification = 'FENa > 2.0 % (Orientación tubular intrínseca / NTA)';
        clinicalInterpretation =
          'Compatible con lesión tubular intrínseca (necrosis tubular aguda), salvo uso reciente de diuréticos o insuficiencia suprarrenal.';
      }

      const secondaryResults: SecondaryResultItem[] = [
        {
          label: 'Sodio urinario (Na⁺u)',
          formattedValue: formatClinicalNumber(uNa, 1),
          unit: 'mEq/L',
          note: uNa < 20 ? '< 20 mEq/L apoya estado prerrenal' : uNa > 40 ? '> 40 mEq/L apoya daño tubular' : undefined,
        },
      ];

      return {
        primaryResult: {
          label: 'FENa',
          value: fena,
          formattedValue: formatClinicalNumber(fena, 2),
          unit: '%',
        },
        secondaryResults,
        severity,
        riskClassification,
        clinicalInterpretation,
        guidance: [
          'Correlacionar siempre con microscopía del sedimento urinario (cilindros granulosos pardo-terrosos en NTA) y estado volémico.',
        ],
        guidanceDisclaimer: 'Índice orientativo; pierde validez bajo tratamiento reciente con diuréticos.',
        formulaUsed: 'FENa (%) = [(Na⁺u × Crp) / (Na⁺p × Cru)] × 100',
        inputsSummary: `Crp: ${sCrRes.rawNumber} ${sCrRes.unitLabel} · Cru: ${uCrRes.rawNumber} ${uCrRes.unitLabel} · Na⁺p: ${sNaRes.rawNumber} · Na⁺u: ${uNaRes.rawNumber}`,
      };
    }

    // FEUrea mode
    const sUreaRes = getCanonicalNumberValue(
      serumUreaField,
      inputs.serumUrea as NumberInputValue,
    );
    const uUreaRes = getCanonicalNumberValue(
      urineUreaField,
      inputs.urineUrea as NumberInputValue,
    );
    const sUrea = sUreaRes.canonicalValue!;
    const uUrea = uUreaRes.canonicalValue!;

    const rawFeurea = ((uUrea * sCr) / (sUrea * uCr)) * 100;
    const feurea = roundClinical(rawFeurea, 1);

    let severity: SeverityLevel = 'info';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (feurea <= 35) {
      severity = 'low';
      riskClassification = 'FEUrea ≤ 35 % (Orientación prerrenal)';
      clinicalInterpretation =
        'Reabsorción proximal conservada de urea compatible con azoemia prerrenal, manteniendo utilidad incluso con uso reciente de diuréticos.';
    } else if (feurea <= 50) {
      severity = 'moderate';
      riskClassification = 'FEUrea 35.1 – 50.0 % (Zona indeterminada)';
      clinicalInterpretation =
        'Rango intermedio. Correlacionar con sedimento urinario, historia clínica y tendencia de creatinina.';
    } else {
      severity = 'high';
      riskClassification = 'FEUrea > 50 % (Orientación intrínseca / NTA)';
      clinicalInterpretation =
        'Sugiere pérdida de capacidad de reabsorción tubular compatible con necrosis tubular aguda u otra lesión intrínseca.';
    }

    return {
      primaryResult: {
        label: 'FEUrea',
        value: feurea,
        formattedValue: formatClinicalNumber(feurea, 1),
        unit: '%',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: [
        'Integrar junto con sedimento urinario, ecografía renal (descartar obstrucción) y hemodinamia.',
      ],
      guidanceDisclaimer: 'Índice diagnóstico orientativo; no sustituye la valoración clínica completa.',
      formulaUsed: 'FEUrea (%) = [(Urea_u × Crp) / (Urea_p × Cru)] × 100',
      inputsSummary: `Crp: ${sCrRes.rawNumber} ${sCrRes.unitLabel} · Cru: ${uCrRes.rawNumber} ${uCrRes.unitLabel} · Urea/BUN_p: ${sUreaRes.rawNumber} ${sUreaRes.unitLabel} · Urea/BUN_u: ${uUreaRes.rawNumber} ${uUreaRes.unitLabel}`,
    };
  },
};
