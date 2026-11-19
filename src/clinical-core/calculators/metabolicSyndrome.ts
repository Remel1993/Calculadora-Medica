import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SeverityLevel,
} from '../types/clinical.ts';

const waistField: BooleanFieldDef = {
  id: 'waist',
  label: '1. Obesidad abdominal (cintura ≥ 90–94 cm en hombres o ≥ 80–88 cm en mujeres según población)',
  type: 'boolean',
  trueLabel: 'Cumple (+1)',
  falseLabel: 'No',
  defaultValue: false,
};

const tgField: BooleanFieldDef = {
  id: 'triglycerides',
  label: '2. Triglicéridos ≥ 150 mg/dL (1.7 mmol/L) o en tratamiento específico para TG',
  type: 'boolean',
  trueLabel: 'Cumple (+1)',
  falseLabel: 'No',
  defaultValue: false,
};

const hdlField: BooleanFieldDef = {
  id: 'lowHdl',
  label: '3. c-HDL bajo (< 40 mg/dL en hombres o < 50 mg/dL en mujeres) o tratamiento específico',
  type: 'boolean',
  trueLabel: 'Cumple (+1)',
  falseLabel: 'No',
  defaultValue: false,
};

const bpField: BooleanFieldDef = {
  id: 'bloodPressure',
  label: '4. Presión arterial ≥ 130/85 mmHg o en tratamiento antihipertensivo',
  type: 'boolean',
  trueLabel: 'Cumple (+1)',
  falseLabel: 'No',
  defaultValue: false,
};

const glucoseField: BooleanFieldDef = {
  id: 'glucose',
  label: '5. Glucemia en ayunas ≥ 100 mg/dL (5.6 mmol/L) o tratamiento hipoglucemiante',
  type: 'boolean',
  trueLabel: 'Cumple (+1)',
  falseLabel: 'No',
  defaultValue: false,
};

export const metabolicSyndromeCalculator: CalculatorDefinition = {
  id: 'metabolic-syndrome',
  name: 'Criterios de Síndrome Metabólico (Consenso Armonizado / ATP III)',
  shortName: 'Síndrome Metabólico',
  primarySpecialty: 'endocrinologia',
  secondarySpecialties: ['medicina-interna', 'cardiologia'],
  subcategory: 'diagnostico',
  keywords: ['sindrome metabolico', 'atp iii', 'idf', 'armonizado', 'resistencia insulina', 'obesidad abdominal'],
  description:
    'Evalúa los 5 criterios del Consenso Armonizado (IDF / AHA / NHLBI / WHF 2009) para identificar síndrome metabólico (≥ 3 de 5 componentes).',
  clinicalIndication:
    'Identificación de riesgo cardiometabólico agrupado en consulta de atención primaria, medicina interna y endocrinología.',
  validatedPopulation: 'Adultos (en Latinoamérica/Asia se suelen usar cortes de cintura ≥ 90 cm en hombres y ≥ 80 cm en mujeres; en EE. UU./ATP III ≥ 102 cm y ≥ 88 cm).',
  contraindications: [
    'No sustituye calculadoras de riesgo cardiovascular global a 10 años.',
  ],
  limitations: [
    'Controversia entre guías: NCEP ATP III (2001) empleaba cintura ≥ 102/88 cm y glucemia ≥ 110 mg/dL (actualizada a ≥ 100 mg/dL en AHA/NHLBI 2005); IDF 2005 exigía obesidad central como requisito obligatorio, mientras que el Consenso Armonizado 2009 requiere cualquier combinación de ≥ 3 de 5 criterios.',
  ],
  version: 'Consenso Armonizado IDF/AHA/NHLBI (2009)',
  references: [
    {
      citation:
        'Alberti KGMM, Eckel RH, Grundy SM, et al. Harmonizing the metabolic syndrome: a joint interim statement of the IDF, NHLBI, AHA, WHF, IAS, and IASO. Circulation. 2009;120(16):1640-1645.',
      year: 2009,
    },
  ],
  fields: [waistField, tgField, hdlField, bpField, glucoseField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(metabolicSyndromeCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const items = [
      Boolean(inputs.waist),
      Boolean(inputs.triglycerides),
      Boolean(inputs.lowHdl),
      Boolean(inputs.bloodPressure),
      Boolean(inputs.glucose),
    ];
    const count = items.filter(Boolean).length;
    const metSyn = count >= 3;

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (count === 0) {
      severity = 'normal';
      riskClassification = 'Sin criterios de síndrome metabólico (0 / 5)';
      clinicalInterpretation = 'Ninguno de los componentes cardiometabólicos evaluados está presente.';
    } else if (!metSyn) {
      severity = 'low';
      riskClassification = `No cumple criterios diagnósticos (${count} / 5 — requiere ≥ 3)`;
      clinicalInterpretation =
        'Aunque no alcanza el umbral de síndrome metabólico, los factores presentes incrementan el riesgo cardiovascular y ameritan abordaje preventivo.';
    } else {
      severity = count >= 4 ? 'high' : 'moderate';
      riskClassification = `Criterios positivos de Síndrome Metabólico (${count} / 5)`;
      clinicalInterpretation =
        'Cumple ≥ 3 criterios diagnósticos; se asocia con mayor riesgo de enfermedad cardiovascular aterosclerótica, diabetes tipo 2 y MASLD.';
    }

    return {
      primaryResult: {
        label: 'Criterios cumplidos',
        value: count,
        formattedValue: `${count} / 5`,
        unit: metSyn ? '(Positivo)' : '(Negativo)',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: [
        'Abordaje integral: modificación intensiva del estilo de vida (pérdida ponderal 5–10 %, dieta mediterránea/DASH, ejercicio aeróbico y de fuerza) y control específico de PA, lípidos y glucemia.',
      ],
      guidanceDisclaimer: 'Aplicar puntos de corte de perímetro abdominal acordes con el origen étnico/regional del paciente.',
      formulaUsed: 'Suma de 5 criterios Armonizados (≥ 3 criterios = Síndrome Metabólico)',
      inputsSummary: `Cintura: ${items[0] ? 'Sí' : 'No'} · TG: ${items[1] ? 'Sí' : 'No'} · HDL: ${items[2] ? 'Sí' : 'No'} · PA: ${items[3] ? 'Sí' : 'No'} · Glucosa: ${items[4] ? 'Sí' : 'No'}`,
    };
  },
};
