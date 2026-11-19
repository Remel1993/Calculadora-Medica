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
import { AGE_UNITS_YEARS } from '../units/converters.ts';

const ageField: NumberFieldDef = {
  id: 'age',
  label: 'Edad',
  type: 'number',
  canonicalUnit: 'años',
  units: AGE_UNITS_YEARS,
  defaultUnitId: 'years',
  min: 18,
  max: 110,
  placeholder: '54',
};

const astField: NumberFieldDef = {
  id: 'ast',
  label: 'AST (TGO)',
  type: 'number',
  canonicalUnit: 'U/L',
  units: [{ id: 'u_l', label: 'U/L', toCanonical: (v) => v, min: 5, max: 3000, step: 1 }],
  defaultUnitId: 'u_l',
  min: 5,
  max: 3000,
  placeholder: '48',
};

const altField: NumberFieldDef = {
  id: 'alt',
  label: 'ALT (TGP)',
  type: 'number',
  canonicalUnit: 'U/L',
  units: [{ id: 'u_l', label: 'U/L', toCanonical: (v) => v, min: 5, max: 3000, step: 1 }],
  defaultUnitId: 'u_l',
  min: 5,
  max: 3000,
  placeholder: '42',
};

const plateletsField: NumberFieldDef = {
  id: 'platelets',
  label: 'Plaquetas',
  type: 'number',
  canonicalUnit: '10⁹/L',
  units: [
    { id: '10e9_l', label: '×10³/µL (10⁹/L)', toCanonical: (v) => v, min: 10, max: 1500, step: 1 },
    { id: 'cells_ul', label: 'cél/µL (/mm³)', toCanonical: (v) => v / 1000, min: 10000, max: 1500000, step: 1000 },
  ],
  defaultUnitId: '10e9_l',
  min: 10,
  max: 1500,
  placeholder: '190',
};

export const fib4Calculator: CalculatorDefinition = {
  id: 'fib-4',
  name: 'Índice FIB-4 (Fibrosis Hepática en MASLD / Hepatopatía)',
  shortName: 'FIB-4',
  primarySpecialty: 'gastroenterologia',
  secondarySpecialties: ['medicina-interna', 'endocrinologia'],
  subcategory: 'diagnostico',
  keywords: [
    'fib-4',
    'fib4',
    'higado graso',
    'masld',
    'nafld',
    'esteatosis',
    'fibrosis hepatica',
    'ast',
    'alt',
    'plaquetas',
  ],
  description:
    'Índice no invasivo de tamizaje de fibrosis hepática avanzada (F3–F4) mediante edad, AST, ALT y recuento plaquetario.',
  clinicalIndication:
    'Estratificación inicial de fibrosis hepática en pacientes con hígado graso metabólico (MASLD/NAFLD), diabetes tipo 2 o hepatopatía crónica.',
  validatedPopulation: 'Adultos de 35 a 65 años (precaución en < 35 y ≥ 65 años).',
  requiredLabsNote: 'Requiere AST, ALT y biometría hemática con plaquetas en estado basal estable.',
  contraindications: [
    'No utilizar durante hepatitis aguda o elevación transitoria marcada de transaminasas (falso positivo por AST elevada).',
    'No fiable en trombocitopenia de causa no hepática o esplenectomía.',
  ],
  limitations: [
    'En menores de 35 años el rendimiento diagnóstico es bajo; en ≥ 65 años el punto de corte inferior recomendado para descartar fibrosis sube de 1.30 a 2.00 (McPherson et al., 2017) para evitar falsos positivos.',
    'Un resultado intermedio (1.30 – 2.67) requiere una segunda prueba (elastografía hepática o panel ELF).',
  ],
  version: 'Sterling et al. (2006) / EASL-AASLD MASLD',
  references: [
    {
      citation:
        'Sterling RK, Lissen E, Clumeck N, et al. Development of a simple noninvasive index to predict significant fibrosis in patients with HIV/HCV coinfection. Hepatology. 2006;43(6):1317-1325.',
      year: 2006,
    },
    {
      citation:
        'EASL-EASD-EASO Clinical Practice Guidelines on the management of metabolic dysfunction-associated steatotic liver disease (MASLD). J Hepatol. 2024;81(3):492-542.',
      year: 2024,
    },
  ],
  fields: [ageField, astField, altField, plateletsField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(fib4Calculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const age = getCanonicalNumberValue(ageField, inputs.age as NumberInputValue).canonicalValue!;
    const ast = getCanonicalNumberValue(astField, inputs.ast as NumberInputValue).canonicalValue!;
    const alt = getCanonicalNumberValue(altField, inputs.alt as NumberInputValue).canonicalValue!;
    const pltRes = getCanonicalNumberValue(plateletsField, inputs.platelets as NumberInputValue);
    const plt = pltRes.canonicalValue!;

    const rawFib4 = (age * ast) / (plt * Math.sqrt(alt));
    const fib4 = roundClinical(rawFib4, 2);
    const lowCutoff = age >= 65 ? 2.0 : 1.3;

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (fib4 < lowCutoff) {
      severity = 'low';
      riskClassification = `Bajo riesgo de fibrosis avanzada (FIB-4 < ${lowCutoff.toFixed(2)})`;
      clinicalInterpretation =
        'Alto valor predictivo negativo (> 90 %) para descartar fibrosis hepática avanzada (F3–F4).';
      guidance = [
        'Continuar manejo de factores metabólicos (peso, glucemia, lípidos) y reevaluar FIB-4 cada 1–3 años.',
      ];
    } else if (fib4 <= 2.67) {
      severity = 'moderate';
      riskClassification = `Riesgo indeterminado (FIB-4 ${lowCutoff.toFixed(2)} – 2.67)`;
      clinicalInterpretation =
        'No descarta ni confirma fibrosis avanzada; requiere evaluación complementaria secuencial.';
      guidance = [
        'Solicitar elastografía de transición (FibroScan) o biomarcadores serológicos de segunda línea (ELF) según guías MASLD.',
      ];
    } else {
      severity = 'high';
      riskClassification = 'Alto riesgo de fibrosis avanzada / cirrosis (FIB-4 > 2.67)';
      clinicalInterpretation =
        'Alta probabilidad de fibrosis significativa/avanzada (F3–F4); requiere confirmación especializada.';
      guidance = [
        'Referir a Gastroenterología / Hepatología para elastografía, estudio etiológico completo y vigilancia de complicaciones hepáticas.',
      ];
    }

    if (age < 35) {
      guidance.push('Precaución: en menores de 35 años el FIB-4 tiene sensibilidad limitada.');
    }

    return {
      primaryResult: {
        label: 'Índice FIB-4',
        value: fib4,
        formattedValue: formatClinicalNumber(fib4, 2),
        unit: 'puntos',
      },
      secondaryResults: [
        { label: 'Umbral inferior aplicado', formattedValue: `< ${lowCutoff.toFixed(2)}`, unit: age >= 65 ? '(edad ≥ 65)' : '(edad < 65)' },
        { label: 'Relación AST / ALT', formattedValue: formatClinicalNumber(ast / alt, 2), unit: '' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'Herramienta de cribado; interpretar fuera de brotes agudos de citólisis hepática.',
      formulaUsed: 'FIB-4 = (Edad × AST) / (Plaquetas [10⁹/L] × √ALT)',
      inputsSummary: `Edad: ${age} años · AST: ${ast} U/L · ALT: ${alt} U/L · Plaquetas: ${pltRes.rawNumber} ${pltRes.unitLabel}`,
    };
  },
};
