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
  SeverityLevel,
} from '../types/clinical.ts';

const wbcField: NumberFieldDef = {
  id: 'wbc',
  label: 'Leucocitos totales (WBC)',
  type: 'number',
  canonicalUnit: 'cél/µL',
  units: [
    { id: '10e3_ul', label: '×10³/µL (miles)', toCanonical: (v) => v * 1000, min: 0.05, max: 300, step: 0.1 },
    { id: 'cells_ul', label: 'cél/µL (/mm³)', toCanonical: (v) => v, min: 50, max: 300000, step: 10 },
  ],
  defaultUnitId: '10e3_ul',
  min: 50,
  max: 300000,
  placeholder: '2.4',
};

const segsField: NumberFieldDef = {
  id: 'segsPercent',
  label: 'Neutrófilos segmentados (%)',
  type: 'number',
  canonicalUnit: '%',
  units: [{ id: 'pct', label: '%', toCanonical: (v) => v, min: 0, max: 100, step: 0.5 }],
  defaultUnitId: 'pct',
  min: 0,
  max: 100,
  placeholder: '22',
};

const bandsField: NumberFieldDef = {
  id: 'bandsPercent',
  label: 'Bandas / cayados (%) (0 si no se reportan por separado)',
  type: 'number',
  canonicalUnit: '%',
  units: [{ id: 'pct', label: '%', toCanonical: (v) => v, min: 0, max: 100, step: 0.5 }],
  defaultUnitId: 'pct',
  defaultValue: '0',
  min: 0,
  max: 100,
  placeholder: '0',
};

export const absoluteNeutrophilCountCalculator: CalculatorDefinition = {
  id: 'anc-ran',
  name: 'Recuento Absoluto de Neutrófilos (RAN / ANC)',
  shortName: 'RAN / ANC (Neutrófilos)',
  primarySpecialty: 'hematologia',
  secondarySpecialties: ['infectologia', 'medicina-interna', 'urgencias', 'pediatria'],
  subcategory: 'formulas',
  keywords: ['ran', 'anc', 'neutropenia', 'neutrofilos', 'neutropenia febril', 'quimioterapia', 'hemograma'],
  description:
    'Calcula el Recuento Absoluto de Neutrófilos (RAN / ANC) a partir de leucocitos totales, segmentados y bandas, y gradúa el nivel de neutropenia.',
  clinicalIndication:
    'Evaluación de riesgo infeccioso en pacientes con fiebre postquimioterapia, aplasia medular, fármacos mielosupresores o sospecha de neutropenia febril.',
  validatedPopulation: 'Adultos y niños ≥ 1 año (en neonatos y lactantes pequeños los rangos fisiológicos varían).',
  requiredLabsNote: 'Requiere biometría hemática con fórmula diferencial.',
  contraindications: [
    'Si el laboratorio ya reporta el recuento absoluto automatizado en cél/µL (o ×10³/µL), preferirlo cuando la diferencia manual no muestre blastos o formas inmaduras.',
  ],
  limitations: [
    'La definición clásica de neutropenia febril (IDSA/ASCO/ESMO) es RAN < 500 cél/µL (o < 1,000 con descenso previsto < 500 en las próximas 48 h) más fiebre (≥ 38.3 °C única o ≥ 38.0 °C sostenida ≥ 1 h).',
  ],
  version: 'IDSA / ASCO Neutropenia Grading',
  references: [
    {
      citation:
        'Freifeld AG, Bow EJ, Sepkowitz KA, et al. Clinical practice guideline for the use of antimicrobial agents in neutropenic patients with cancer: 2010 update by the IDSA. Clin Infect Dis. 2011;52(4):e56-e93.',
      year: 2011,
    },
  ],
  fields: [wbcField, segsField, bandsField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(absoluteNeutrophilCountCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const wbcRes = getCanonicalNumberValue(wbcField, inputs.wbc as NumberInputValue);
    const wbcCells = wbcRes.canonicalValue!;
    const segs = getCanonicalNumberValue(segsField, inputs.segsPercent as NumberInputValue).canonicalValue!;
    const bands = getCanonicalNumberValue(bandsField, inputs.bandsPercent as NumberInputValue).canonicalValue!;

    if (segs + bands > 100) {
      throw new Error('La suma de % segmentados y % bandas no puede superar el 100 %.');
    }

    const anc = roundClinical(wbcCells * ((segs + bands) / 100), 0);
    const ancK = roundClinical(anc / 1000, 2);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (anc >= 1500) {
      severity = 'normal';
      riskClassification = `Recuento normal (RAN ${anc} cél/µL ≥ 1,500)`;
      clinicalInterpretation = 'Sin neutropenia.';
      guidance = ['Seguimiento habitual según cuadro clínico.'];
    } else if (anc >= 1000) {
      severity = 'low';
      riskClassification = `Neutropenia leve (RAN ${anc} cél/µL — 1,000 a 1,499)`;
      clinicalInterpretation = 'Neutropenia leve; riesgo infeccioso discretamente aumentado según causa.';
      guidance = ['Vigilar evolución hematológica y fármacos potencialmente mielotóxicos.'];
    } else if (anc >= 500) {
      severity = 'moderate';
      riskClassification = `Neutropenia moderada (RAN ${anc} cél/µL — 500 a 999)`;
      clinicalInterpretation = 'Riesgo moderado de infección; si se espera caída < 500 en 48 h y hay fiebre, manejar como neutropenia febril.';
      guidance = ['Precauciones infecciosas y vigilancia clínica estrecha; reevaluar con hemograma seriado si está en nadir postquimioterapia.'];
    } else if (anc >= 100) {
      severity = 'high';
      riskClassification = `Neutropenia grave / severa (RAN ${anc} cél/µL < 500)`;
      clinicalInterpretation = 'Alto riesgo de infecciones bacterianas y fúngicas graves.';
      guidance = [
        'Si presenta fiebre (≥ 38.3 °C o ≥ 38.0 °C por 1 h) o signos de infección: EMERGENCIA — hemocultivos e inicio empírico inmediato (< 60 min) de antibiótico IV antipseudomónico (p. ej. cefepime, piperacilina-tazobactam o meropenem).',
      ];
    } else {
      severity = 'critical';
      riskClassification = `Neutropenia profunda (RAN ${anc} cél/µL < 100)`;
      clinicalInterpretation = 'Riesgo crítico de sepsis fulminante con mínima respuesta inflamatoria local (ausencia de pus o infiltrados floridos).';
      guidance = [
        'Aislamiento protector según protocolo, valoración hematológica/infectológica urgente y antibióticoterapia IV inmediata ante fiebre o deterioro clínico.',
      ];
    }

    return {
      primaryResult: {
        label: 'Recuento Absoluto de Neutrófilos (RAN)',
        value: anc,
        formattedValue: String(anc),
        unit: 'cél/µL',
      },
      secondaryResults: [
        { label: 'Equivalente en miles/µL (10⁹/L)', formattedValue: formatClinicalNumber(ancK, 2), unit: '×10³/µL' },
        { label: '% Neutrófilos totales (Seg + Bandas)', formattedValue: formatClinicalNumber(segs + bands, 1), unit: '%' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'En neutropenia profunda los signos clásicos de infección pueden estar ausentes.',
      formulaUsed: 'RAN (cél/µL) = Leucocitos (cél/µL) × (% Segmentados + % Bandas) / 100',
      inputsSummary: `Leucocitos: ${wbcRes.rawNumber} ${wbcRes.unitLabel} · Seg: ${segs}% · Bandas: ${bands}%`,
    };
  },
};
