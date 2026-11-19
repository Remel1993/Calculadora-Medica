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
  SeverityLevel,
} from '../types/clinical.ts';
import { GLUCOSE_UNITS_MG_DL, INSULIN_UNITS_UIU_ML } from '../units/converters.ts';

const fastingGlucoseField: NumberFieldDef = {
  id: 'fastingGlucose',
  label: 'Glucosa plasmática en ayunas',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: GLUCOSE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 40,
  max: 600,
  placeholder: '98',
  helpText: 'Requiere ayuno estricto de 8 a 12 horas.',
};

const fastingInsulinField: NumberFieldDef = {
  id: 'fastingInsulin',
  label: 'Insulina sérica en ayunas',
  type: 'number',
  canonicalUnit: 'µUI/mL',
  units: INSULIN_UNITS_UIU_ML,
  defaultUnitId: 'uiu_ml',
  min: 0.5,
  max: 400,
  placeholder: '14',
  helpText: 'Conversión aplicada: 1 µUI/mL = 6.945 pmol/L (estándar clínico habitual).',
};

export const homaIrBCalculator: CalculatorDefinition = {
  id: 'homa-ir-b',
  name: 'Índices HOMA-IR y HOMA-B',
  shortName: 'HOMA-IR / B',
  primarySpecialty: 'endocrinologia',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'formulas',
  keywords: [
    'homa',
    'homa-ir',
    'homa-b',
    'resistencia a la insulina',
    'celula beta',
    'insulinorresistencia',
    'matthews',
  ],
  description:
    'Estimación basal de resistencia a la insulina (HOMA-IR) y función secretora de célula beta pancreática (HOMA-B) a partir de glucemia e insulinemia en ayunas.',
  clinicalIndication:
    'Evaluación orientativa de insulinorresistencia metabólica en investigación clínica o valoración endocrinológica complementaria.',
  validatedPopulation: 'Adultos sin insulinoterapia exógena ni hipoglucemia en el momento de la toma.',
  requiredLabsNote: 'Requiere glucosa e insulina medidas simultáneamente tras 8–12 horas de ayuno.',
  contraindications: [
    'No utilizar en pacientes tratados con insulina exógena (la insulina medida no refleja secreción endógena).',
    'HOMA-B no es matemáticamente válido si la glucemia en ayunas es ≤ 63 mg/dL (≤ 3.5 mmol/L).',
  ],
  limitations: [
    'No existe un punto de corte diagnóstico universal para HOMA-IR: varía según población, edad, IMC y método de inmunoensayo de insulina (en diversas guías latinoamericanas y europeas se citan referencias entre 2.0 y 2.6, y ≥ 3.0 como resistencia marcada).',
    'En diabetes mellitus de larga evolución con disfunción severa de célula beta, HOMA-IR puede subestimar la resistencia real si la insulina en ayunas está agotada.',
    'Las guías clínicas estándar (ADA) no recomiendan HOMA-IR de rutina para diagnosticar prediabetes o diabetes frente a HbA1c, glucemia basal o PTOG.',
  ],
  version: 'Matthews et al. (HOMA1, 1985)',
  references: [
    {
      citation:
        'Matthews DR, Hosker JP, Rudenski AS, Naylor BA, Treacher DF, Turner RC. Homeostasis model assessment: insulin resistance and beta-cell function from fasting plasma glucose and insulin concentrations in man. Diabetologia. 1985;28(7):412-419.',
      year: 1985,
    },
    {
      citation:
        'Wallace TM, Levy JC, Matthews DR. Use and abuse of HOMA modeling. Diabetes Care. 2004;27(6):1487-1495.',
      year: 2004,
    },
  ],
  fields: [fastingGlucoseField, fastingInsulinField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(homaIrBCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const gluRes = getCanonicalNumberValue(
      fastingGlucoseField,
      inputs.fastingGlucose as NumberInputValue,
    );
    const insRes = getCanonicalNumberValue(
      fastingInsulinField,
      inputs.fastingInsulin as NumberInputValue,
    );

    const gluMgDl = gluRes.canonicalValue!;
    const gluMmol = gluMgDl / 18.0182;
    const insUiu = insRes.canonicalValue!;

    const rawHomaIr = (gluMmol * insUiu) / 22.5;
    const homaIr = roundClinical(rawHomaIr, 2);

    const secondaryResults: SecondaryResultItem[] = [];

    if (gluMmol > 3.55) {
      const rawHomaB = (20 * insUiu) / (gluMmol - 3.5);
      const homaB = roundClinical(rawHomaB, 1);
      secondaryResults.push({
        label: 'HOMA-B (función estimada de célula β)',
        formattedValue: formatClinicalNumber(homaB, 1),
        unit: '%',
        note: 'Valor teórico de referencia en adultos sanos ~100 % (interpretar siempre junto con HOMA-IR)',
      });
    } else {
      secondaryResults.push({
        label: 'HOMA-B',
        formattedValue: 'No calculable',
        unit: '—',
        note: 'La glucemia en ayunas ≤ 64 mg/dL (≤ 3.55 mmol/L) indefine el denominador (G_mmol - 3.5)',
      });
    }

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (homaIr < 2.0) {
      severity = 'normal';
      riskClassification = `HOMA-IR < 2.0 (${homaIr.toFixed(2)})`;
      clinicalInterpretation =
        'Sensibilidad a la insulina conservada respecto a los umbrales poblacionales habituales (< 2.0–2.5).';
    } else if (homaIr < 2.6) {
      severity = 'low';
      riskClassification = `HOMA-IR zona limítrofe (2.0 – 2.59)`;
      clinicalInterpretation =
        'Rango intermedio dependiente del método de laboratorio y grupo étnico. Valorar contexto metabólico (triglicéridos, HDL, perímetro abdominal).';
    } else if (homaIr < 4.0) {
      severity = 'moderate';
      riskClassification = `HOMA-IR compatible con resistencia a la insulina (2.6 – 3.99)`;
      clinicalInterpretation =
        'Sugiere resistencia a la insulina moderada. Evaluar glucemia basal, HbA1c, perfil lipídico y factores cardiometabólicos.';
    } else {
      severity = 'high';
      riskClassification = `HOMA-IR marcadamente elevado (≥ 4.0)`;
      clinicalInterpretation =
        'Alta probabilidad de insulinorresistencia significativa (si no hay uso de insulina exógena ni falta de ayuno).';
    }

    return {
      primaryResult: {
        label: 'Índice HOMA-IR',
        value: homaIr,
        formattedValue: formatClinicalNumber(homaIr, 2),
        unit: 'índice',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: [
        'Interpretar siempre con referencia local de laboratorio y criterios diagnósticos estándar de glucemia/HbA1c.',
      ],
      guidanceDisclaimer: 'Índice fisiopatológico orientativo; no es criterio diagnóstico aislado de diabetes.',
      formulaUsed: 'HOMA-IR = (Glucosa mmol/L × Insulina µUI/mL) / 22.5 · HOMA-B = (20 × Insulina) / (Glucosa mmol/L - 3.5)',
      inputsSummary: `Glucosa ayunas: ${gluRes.rawNumber} ${gluRes.unitLabel} · Insulina ayunas: ${insRes.rawNumber} ${insRes.unitLabel}`,
    };
  },
};
