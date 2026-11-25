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
  SeverityLevel,
} from '../types/clinical.ts';
import { AGE_UNITS_YEARS, ALBUMIN_UNITS_G_DL } from '../units/converters.ts';

const ageField: NumberFieldDef = {
  id: 'age',
  label: 'Edad',
  type: 'number',
  canonicalUnit: 'años',
  units: AGE_UNITS_YEARS,
  defaultUnitId: 'years',
  defaultValue: '52',
  min: 18,
  max: 110,
  placeholder: '52',
};

const bmiField: NumberFieldDef = {
  id: 'bmi',
  label: 'Índice de Masa Corporal (IMC)',
  type: 'number',
  canonicalUnit: 'kg/m²',
  units: [{ id: 'kg_m2', label: 'kg/m²', toCanonical: (v) => v, min: 12, max: 75, step: 0.1 }],
  defaultUnitId: 'kg_m2',
  defaultValue: '31.5',
  min: 12,
  max: 75,
  placeholder: '31.5',
};

const diabetesOrIfgField: BooleanFieldDef = {
  id: 'diabetesOrIfg',
  label: 'Diabetes mellitus tipo 2 o glucemia basal alterada (≥ 100–110 mg/dL)',
  type: 'boolean',
  defaultValue: true,
  trueLabel: 'Sí',
  falseLabel: 'No',
};

const astField: NumberFieldDef = {
  id: 'ast',
  label: 'AST (TGO)',
  type: 'number',
  canonicalUnit: 'U/L',
  units: [{ id: 'u_l', label: 'U/L', toCanonical: (v) => v, min: 4, max: 2000, step: 1 }],
  defaultUnitId: 'u_l',
  defaultValue: '46',
  min: 4,
  max: 2000,
  placeholder: '46',
};

const astUlnField: NumberFieldDef = {
  id: 'astUln',
  label: 'Límite superior normal (LSN) de AST de su laboratorio (para APRI)',
  type: 'number',
  canonicalUnit: 'U/L',
  units: [{ id: 'u_l', label: 'U/L', toCanonical: (v) => v, min: 15, max: 80, step: 1 }],
  defaultUnitId: 'u_l',
  defaultValue: '40',
  min: 15,
  max: 80,
  placeholder: '40',
};

const altField: NumberFieldDef = {
  id: 'alt',
  label: 'ALT (TGP)',
  type: 'number',
  canonicalUnit: 'U/L',
  units: [{ id: 'u_l', label: 'U/L', toCanonical: (v) => v, min: 4, max: 2000, step: 1 }],
  defaultUnitId: 'u_l',
  defaultValue: '58',
  min: 4,
  max: 2000,
  placeholder: '58',
};

const plateletsField: NumberFieldDef = {
  id: 'platelets',
  label: 'Plaquetas',
  type: 'number',
  canonicalUnit: '×10⁹/L',
  units: [
    { id: '10e9_l', label: '×10⁹/L (mil/µL)', toCanonical: (v) => v, min: 15, max: 1000, step: 1 },
  ],
  defaultUnitId: '10e9_l',
  defaultValue: '195',
  min: 15,
  max: 1000,
  placeholder: '195',
};

const albuminField: NumberFieldDef = {
  id: 'albumin',
  label: 'Albúmina sérica',
  type: 'number',
  canonicalUnit: 'g/dL',
  units: ALBUMIN_UNITS_G_DL,
  defaultUnitId: 'g_dl',
  defaultValue: '4.1',
  min: 1.0,
  max: 6.5,
  placeholder: '4.1',
};

export const masldApriNfsCalculator: CalculatorDefinition = {
  id: 'masld-apri-nfs',
  name: 'APRI y NAFLD Fibrosis Score (NFS) — Fibrosis Hepática / MASLD',
  shortName: 'APRI y NFS (Fibrosis Hepática)',
  primarySpecialty: 'gastroenterologia',
  secondarySpecialties: ['medicina-interna', 'endocrinologia'],
  subcategory: 'diagnostico',
  keywords: [
    'apri',
    'nfs',
    'nafld fibrosis score',
    'masld',
    'higado graso',
    'esteatosis',
    'fibrosis hepatica',
    'cirrosis',
    'gastroenterologia',
  ],
  description:
    'Calcula simultáneamente el NAFLD Fibrosis Score (NFS, Angulo 2007) y el índice APRI (Wai 2003) para cribado no invasivo de fibrosis avanzada (F3–F4) en consulta externa.',
  clinicalIndication:
    'Estratificación ambulatoria de pacientes con hígado graso metabólico (MASLD/NAFLD) o hepatopatía crónica para decidir elastografía (FibroScan) o derivación a Hepatología.',
  validatedPopulation: 'Adultos con MASLD/NAFLD (NFS) o hepatitis crónica/hepatopatía viral (APRI).',
  contraindications: [
    'No interpretar durante hepatitis aguda (transaminasas > 5–10× LSN elevan falsamente el APRI) ni en trombocitopenia hematológica no hepática.',
  ],
  limitations: [
    'En ≥ 65 años el umbral inferior clásico de NFS (-1.455) pierde especificidad; McPherson (2017) propone elevar el corte inferior a +0.12 en mayores de 65 años.',
    'Las guías EASL/AASLD actuales suelen preferir FIB-4 como primer paso y NFS o ELF/elastografía como herramientas complementarias.',
  ],
  requiredLabsNote: 'Requiere AST, ALT, plaquetas y albúmina sérica.',
  version: 'Angulo (2007) · Wai (2003) · Ajuste etario McPherson (2017)',
  references: [
    {
      citation:
        'Angulo P, Hui JM, Marchesini G, et al. The NAFLD fibrosis score: a noninvasive system that identifies liver fibrosis in patients with NAFLD. Hepatology. 2007;45(4):846-854.',
      year: 2007,
    },
    {
      citation:
        'Wai CT, Greenson JK, Fontana RJ, et al. A simple noninvasive index can predict both significant fibrosis and cirrhosis in patients with chronic hepatitis C. Hepatology. 2003;38(2):518-526.',
      year: 2003,
    },
  ],
  fields: [ageField, bmiField, diabetesOrIfgField, astField, astUlnField, altField, plateletsField, albuminField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(masldApriNfsCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const age = getCanonicalNumberValue(ageField, inputs.age as NumberInputValue).canonicalValue!;
    const bmi = getCanonicalNumberValue(bmiField, inputs.bmi as NumberInputValue).canonicalValue!;
    const dm = inputs.diabetesOrIfg ? 1 : 0;
    const ast = getCanonicalNumberValue(astField, inputs.ast as NumberInputValue).canonicalValue!;
    const astUln = getCanonicalNumberValue(astUlnField, inputs.astUln as NumberInputValue).canonicalValue!;
    const alt = getCanonicalNumberValue(altField, inputs.alt as NumberInputValue).canonicalValue!;
    const platelets = getCanonicalNumberValue(plateletsField, inputs.platelets as NumberInputValue).canonicalValue!;
    const albumin = getCanonicalNumberValue(albuminField, inputs.albumin as NumberInputValue).canonicalValue!;

    const astAltRatio = ast / alt;
    const nfsRaw =
      -1.675 +
      0.037 * age +
      0.094 * bmi +
      1.13 * dm +
      0.99 * astAltRatio -
      0.013 * platelets -
      0.66 * albumin;
    const nfs = roundClinical(nfsRaw, 2);
    const apri = roundClinical(((ast / astUln) / platelets) * 100, 2);

    const lowerCutoff = age >= 65 ? 0.12 : -1.455;

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (nfs > 0.676 || apri > 1.5) {
      severity = 'high';
      riskClassification =
        nfs > 0.676
          ? `NFS > 0.676 (${formatClinicalNumber(nfs, 2)}) · Alta probabilidad de fibrosis avanzada (F3–F4)`
          : `APRI > 1.5 (${formatClinicalNumber(apri, 2)}) · Riesgo elevado de fibrosis significativa/cirrosis`;
      clinicalInterpretation =
        'Al menos uno de los índices supera el umbral de alto riesgo para fibrosis hepática avanzada.';
      guidance.push(
        'Solicitar elastografía de transición (FibroScan) o test ELF y derivar a Gastroenterología/Hepatología para estadificación y cribado de complicaciones si se confirma F3–F4.',
      );
    } else if (nfs < lowerCutoff && apri < 0.5) {
      severity = 'low';
      riskClassification = `Riesgo bajo de fibrosis avanzada (NFS ${formatClinicalNumber(nfs, 2)} · APRI ${formatClinicalNumber(apri, 2)})`;
      clinicalInterpretation =
        'Alto valor predictivo negativo para descartar fibrosis avanzada (F3–F4) en atención primaria.';
      guidance.push(
        'Manejo de factores metabólicos (pérdida de peso 7–10%, control glucémico/lipídico) y repetir evaluación no invasiva (FIB-4/NFS) cada 1–3 años.',
      );
    } else {
      severity = 'moderate';
      riskClassification = `Zona indeterminada / riesgo intermedio (NFS ${formatClinicalNumber(nfs, 2)} · APRI ${formatClinicalNumber(apri, 2)})`;
      clinicalInterpretation =
        'El resultado queda en rango indeterminado para excluir o confirmar fibrosis avanzada.';
      guidance.push(
        'Complementar con FIB-4 y/o elastografía hepática (FibroScan) para definir riesgo real de fibrosis F3–F4.',
      );
    }

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Índice APRI',
        formattedValue: formatClinicalNumber(apri, 2),
        unit: apri < 0.5 ? '(< 0.5 bajo)' : apri > 1.5 ? '(> 1.5 alto)' : '(0.5–1.5 indet.)',
      },
      {
        label: 'Relación AST / ALT',
        formattedValue: formatClinicalNumber(roundClinical(astAltRatio, 2), 2),
        unit: '',
      },
      {
        label: age >= 65 ? 'Corte inferior NFS (≥ 65 años)' : 'Cortes NFS estándar',
        formattedValue: age >= 65 ? '< 0.12 (McPherson)' : '< -1.455 / > 0.676',
        unit: '',
      },
    ];

    return {
      primaryResult: {
        label: 'NAFLD Fibrosis Score (NFS)',
        value: nfs,
        formattedValue: formatClinicalNumber(nfs, 2),
        unit: 'pts',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed:
        'NFS = −1.675 + 0.037×Edad + 0.094×IMC + 1.13×DM + 0.99×(AST/ALT) − 0.013×Plaq − 0.66×Alb · APRI = (AST/LSN)/Plaq × 100',
      inputsSummary: `NFS ${formatClinicalNumber(nfs, 2)} · APRI ${formatClinicalNumber(apri, 2)} · Edad ${roundClinical(age, 0)} a`,
    };
  },
};
