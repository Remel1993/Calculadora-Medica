import {
  formatClinicalNumber,
  getCanonicalNumberValue,
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

const egfrField: NumberFieldDef = {
  id: 'egfr',
  label: 'Tasa de Filtración Glomerular estimada (TFGe / eGFR)',
  type: 'number',
  canonicalUnit: 'mL/min/1.73 m²',
  units: [{ id: 'ml_min', label: 'mL/min/1.73 m²', toCanonical: (v) => v }],
  defaultUnitId: 'ml_min',
  min: 1,
  max: 180,
  placeholder: '52',
  helpText: 'Puede calcularse previamente con la herramienta CKD-EPI 2021.',
};

const albuminuriaModeField: SelectFieldDef = {
  id: 'albuminuriaMode',
  label: 'Método para clasificar albuminuria (Categoría A1–A3)',
  type: 'select',
  defaultValue: 'acr',
  options: [
    { value: 'acr', label: 'Cociente Albúmina/Creatinina en orina (CAC / ACR)' },
    { value: 'category', label: 'Selección directa de categoría A1, A2 o A3' },
  ],
};

const acrField: NumberFieldDef = {
  id: 'acr',
  label: 'Cociente Albúmina/Creatinina urinaria (CAC / ACR)',
  type: 'number',
  canonicalUnit: 'mg/g',
  units: [
    { id: 'mg_g', label: 'mg/g', toCanonical: (v) => v },
    { id: 'mg_mmol', label: 'mg/mmol', toCanonical: (v) => v * 8.84, max: 1131 },
  ],
  defaultUnitId: 'mg_g',
  min: 0,
  max: 10000,
  placeholder: '120',
  visibleWhen: (i) => i.albuminuriaMode === 'acr',
};

const aCategoryField: SelectFieldDef = {
  id: 'aCategory',
  label: 'Categoría de albuminuria persistente',
  type: 'select',
  defaultValue: 'A1',
  visibleWhen: (i) => i.albuminuriaMode === 'category',
  options: [
    { value: 'A1', label: 'A1 — Normal a ligeramente elevada (< 30 mg/g o < 3 mg/mmol)' },
    { value: 'A2', label: 'A2 — Moderadamente elevada (30 – 300 mg/g o 3 – 30 mg/mmol)' },
    { value: 'A3', label: 'A3 — Gravemente elevada (> 300 mg/g o > 30 mg/mmol)' },
  ],
};

type CkdRiskTier = 'low' | 'moderate' | 'high' | 'very_high';

const KDIGO_HEATMAP: Record<string, Record<'A1' | 'A2' | 'A3', CkdRiskTier>> = {
  G1: { A1: 'low', A2: 'moderate', A3: 'high' },
  G2: { A1: 'low', A2: 'moderate', A3: 'high' },
  G3a: { A1: 'moderate', A2: 'high', A3: 'very_high' },
  G3b: { A1: 'high', A2: 'very_high', A3: 'very_high' },
  G4: { A1: 'very_high', A2: 'very_high', A3: 'very_high' },
  G5: { A1: 'very_high', A2: 'very_high', A3: 'very_high' },
};

export const kdigoCkdCalculator: CalculatorDefinition = {
  id: 'kdigo-ckd',
  name: 'Clasificación KDIGO de Enfermedad Renal Crónica (ERC: G1–G5 y A1–A3)',
  shortName: 'KDIGO ERC (Crónica)',
  primarySpecialty: 'nefrologia',
  secondarySpecialties: ['medicina-interna', 'endocrinologia'],
  subcategory: 'diagnostico',
  keywords: [
    'kdigo',
    'erc',
    'ckd',
    'enfermedad renal cronica',
    'albuminuria',
    'filtrado glomerular',
    'g1',
    'g3a',
    'a2',
    'mapa de calor',
  ],
  description:
    'Estadifica la Enfermedad Renal Crónica según el mapa pronóstico KDIGO 2012/2024 combinando categoría de filtrado glomerular (G1–G5) y albuminuria (A1–A3).',
  clinicalIndication:
    'Estratificación pronóstica, frecuencia de seguimiento y criterios de derivación a Nefrología en pacientes con ERC, diabetes o hipertensión.',
  validatedPopulation: 'Adultos con evaluación de TFGe y albuminuria sostenida ≥ 3 meses.',
  contraindications: [
    'No utilizar durante Lesión Renal Aguda (LRA); la definición de ERC exige cronicidad > 3 meses (para LRA usar KDIGO LRA).',
    'En categorías G1-A1 y G2-A1 no existe diagnóstico de ERC salvo que coexistan otros marcadores de daño renal estructural o urinario > 3 meses.',
  ],
  limitations: [
    'Requiere confirmar albuminuria persistente (≥ 2 de 3 determinaciones positivas en 3–6 meses) antes de etiquetar ERC.',
  ],
  version: 'KDIGO CKD Clinical Practice Guideline (2012 / 2024)',
  references: [
    {
      citation:
        'Kidney Disease: Improving Global Outcomes (KDIGO) CKD Work Group. KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease. Kidney Int. 2024;105(4S):S117-S314.',
      year: 2024,
    },
  ],
  fields: [egfrField, albuminuriaModeField, acrField, aCategoryField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(kdigoCkdCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const egfrRes = getCanonicalNumberValue(egfrField, inputs.egfr as NumberInputValue);
    const egfr = egfrRes.canonicalValue!;

    let gCat: 'G1' | 'G2' | 'G3a' | 'G3b' | 'G4' | 'G5' = 'G1';
    let gDesc = '';
    if (egfr >= 90) {
      gCat = 'G1';
      gDesc = 'Normal o elevado';
    } else if (egfr >= 60) {
      gCat = 'G2';
      gDesc = 'Ligeramente disminuido';
    } else if (egfr >= 45) {
      gCat = 'G3a';
      gDesc = 'Ligera a moderadamente disminuido';
    } else if (egfr >= 30) {
      gCat = 'G3b';
      gDesc = 'Moderada a gravemente disminuido';
    } else if (egfr >= 15) {
      gCat = 'G4';
      gDesc = 'Gravemente disminuido';
    } else {
      gCat = 'G5';
      gDesc = 'Fallo renal';
    }

    let aCat: 'A1' | 'A2' | 'A3' = 'A1';
    let aDesc = '';
    if (inputs.albuminuriaMode === 'acr') {
      const acrRes = getCanonicalNumberValue(acrField, inputs.acr as NumberInputValue);
      const acr = acrRes.canonicalValue!;
      if (acr < 30) {
        aCat = 'A1';
        aDesc = 'Normal a ligeramente elevada (< 30 mg/g)';
      } else if (acr <= 300) {
        aCat = 'A2';
        aDesc = 'Moderadamente elevada (30–300 mg/g)';
      } else {
        aCat = 'A3';
        aDesc = 'Gravemente elevada (> 300 mg/g)';
      }
    } else {
      aCat = inputs.aCategory as 'A1' | 'A2' | 'A3';
      aDesc =
        aCat === 'A1'
          ? 'Normal a ligeramente elevada (< 30 mg/g)'
          : aCat === 'A2'
            ? 'Moderadamente elevada (30–300 mg/g)'
            : 'Gravemente elevada (> 300 mg/g)';
    }

    const tier = KDIGO_HEATMAP[gCat][aCat];
    const stageCode = `${gCat}-${aCat}`;

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let followUp = '';
    let guidance: string[] = [];

    if (tier === 'low') {
      severity = 'normal';
      riskClassification = `Riesgo bajo / Sin ERC salvo daño estructural (${stageCode})`;
      followUp = '1 vez al año (si hay otros marcadores de ERC)';
      guidance = [
        'Si no existen alteraciones del sedimento, imagen renal o tubulopatía ≥ 3 meses, no cumple criterios de ERC. Control preventivo anual en factores de riesgo.',
      ];
    } else if (tier === 'moderate') {
      severity = 'low';
      riskClassification = `Riesgo moderadamente aumentado — Amarillo (${stageCode})`;
      followUp = '1–2 veces al año';
      guidance = [
        'Control estricto de PA, optimización metabólica, evaluar iSGLT2 / bloqueo SRAA según albuminuria y comorbilidades, y evitar nefrotóxicos.',
      ];
    } else if (tier === 'high') {
      severity = 'high';
      riskClassification = `Riesgo alto — Naranja (${stageCode})`;
      followUp = '2–3 veces al año';
      guidance = [
        'Terapia nefroprotectora intensiva (iSGLT2, IECA/ARA-II, finerenona si DM2 y albuminuria según guías), ajuste posológico renal y vigilancia electrolítica.',
      ];
    } else {
      severity = 'critical';
      riskClassification = `Riesgo muy alto — Rojo (${stageCode})`;
      followUp = '3–4 o más veces al año (manejo conjunto con Nefrología)';
      guidance = [
        'Derivación recomendada a Nefrología (indicada especialmente en TFGe < 30 mL/min/1.73 m², CAC > 300 mg/g o progresión rápida) y cribado de complicaciones (anemia, metabolismo óseo-mineral, acidosis).',
      ];
    }

    const stageNumeric = gCat === 'G1' ? 1 : gCat === 'G2' ? 2 : gCat === 'G3a' || gCat === 'G3b' ? 3 : gCat === 'G4' ? 4 : 5;

    return {
      primaryResult: {
        label: 'Categoría KDIGO ERC',
        value: stageNumeric,
        formattedValue: stageCode,
        unit: `(${gDesc})`,
      },
      secondaryResults: [
        { label: 'Categoría TFGe', formattedValue: `${gCat} (${formatClinicalNumber(egfr, 0)} mL/min/1.73 m²)`, unit: gDesc },
        { label: 'Categoría Albuminuria', formattedValue: aCat, unit: aDesc },
        { label: 'Frecuencia orientativa de control (KDIGO)', formattedValue: followUp, unit: '' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation: `Estadio ${stageCode}: riesgo pronóstico ${tier === 'low' ? 'bajo' : tier === 'moderate' ? 'moderado' : tier === 'high' ? 'alto' : 'muy alto'} de progresión renal, eventos cardiovasculares y mortalidad.`,
      guidance,
      guidanceDisclaimer: 'Confirmar persistencia ≥ 3 meses para diagnóstico definitivo de ERC.',
      formulaUsed: 'Matriz pronóstica KDIGO 2024: Categoría TFGe (G1–G5) × Albuminuria (A1–A3)',
      inputsSummary: `TFGe: ${formatClinicalNumber(egfr, 1)} mL/min/1.73 m² (${gCat}) · Albuminuria: ${aCat}`,
    };
  },
};
