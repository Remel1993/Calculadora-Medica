import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SeverityLevel,
} from '../types/clinical.ts';

const fields: BooleanFieldDef[] = [
  {
    id: 'hypertension',
    label: 'H — Hipertensión no controlada (PAS > 160 mmHg) (+1)',
    type: 'boolean',
    trueLabel: 'Presente (+1)',
    falseLabel: 'Ausente (0)',
    defaultValue: false,
  },
  {
    id: 'renal',
    label: 'A — Función renal alterada (+1)',
    helpText: 'Diálisis crónica, trasplante renal o creatinina sérica > 2.26 mg/dL (> 200 µmol/L).',
    type: 'boolean',
    trueLabel: 'Presente (+1)',
    falseLabel: 'Ausente (0)',
    defaultValue: false,
  },
  {
    id: 'liver',
    label: 'A — Función hepática alterada (+1)',
    helpText: 'Cirrosis o bilirrubina > 2× LSN junto con AST/ALT/FA > 3× LSN.',
    type: 'boolean',
    trueLabel: 'Presente (+1)',
    falseLabel: 'Ausente (0)',
    defaultValue: false,
  },
  {
    id: 'stroke',
    label: 'S — Antecedente de ictus (+1)',
    type: 'boolean',
    trueLabel: 'Presente (+1)',
    falseLabel: 'Ausente (0)',
    defaultValue: false,
  },
  {
    id: 'bleeding',
    label: 'B — Antecedente de hemorragia mayor o predisposición hemorrágica (+1)',
    helpText: 'Hemorragia mayor previa, diátesis hemorrágica o anemia significativa.',
    type: 'boolean',
    trueLabel: 'Presente (+1)',
    falseLabel: 'Ausente (0)',
    defaultValue: false,
  },
  {
    id: 'labileInr',
    label: 'L — INR lábil (solo si toma antagonistas de vitamina K) (+1)',
    helpText: 'INR inestable/elevado o tiempo en rango terapéutico (TTR) < 60 %.',
    type: 'boolean',
    trueLabel: 'Presente (+1)',
    falseLabel: 'No / N.A. (0)',
    defaultValue: false,
  },
  {
    id: 'elderly',
    label: 'E — Edad > 65 años (+1)',
    type: 'boolean',
    trueLabel: 'Presente (+1)',
    falseLabel: 'Ausente (0)',
    defaultValue: false,
  },
  {
    id: 'drugs',
    label: 'D — Fármacos predisponentes (antiagregantes o AINEs concomitantes) (+1)',
    type: 'boolean',
    trueLabel: 'Presente (+1)',
    falseLabel: 'Ausente (0)',
    defaultValue: false,
  },
  {
    id: 'alcohol',
    label: 'D — Consumo excesivo de alcohol (≥ 8 bebidas/semana) (+1)',
    type: 'boolean',
    trueLabel: 'Presente (+1)',
    falseLabel: 'Ausente (0)',
    defaultValue: false,
  },
];

export const hasBledCalculator: CalculatorDefinition = {
  id: 'has-bled',
  name: 'Escala HAS-BLED (Riesgo Hemorrágico)',
  shortName: 'HAS-BLED',
  primarySpecialty: 'cardiologia',
  secondarySpecialties: ['medicina-interna', 'hematologia'],
  subcategory: 'gravedad',
  keywords: [
    'has-bled',
    'hasbled',
    'sangrado',
    'hemorragia',
    'anticoagulacion',
    'fibrilacion auricular',
  ],
  description:
    'Evalúa el riesgo anual de hemorragia mayor en pacientes candidatos o en tratamiento con anticoagulación oral, enfocándose en factores modificables.',
  clinicalIndication:
    'Valoración paralela de factores de riesgo hemorrágico al indicar o revisar anticoagulación en fibrilación auricular.',
  validatedPopulation: 'Adultos con fibrilación auricular bajo anticoagulación.',
  contraindications: [
    'NO utilizar un HAS-BLED ≥ 3 como excusa aislada para suspender o negar anticoagulación en pacientes con riesgo embólico elevado.',
  ],
  limitations: [
    'Varios componentes son dinámicos y corregibles (PAS > 160 mmHg, INR lábil, AINEs/antiagregantes innecesarios, consumo de alcohol).',
    'Las guías ESC 2024 enfatizan abordar todos los factores modificables de sangrado en lugar de depender únicamente de un umbral numérico.',
  ],
  version: 'Pisters et al. (2010)',
  references: [
    {
      citation:
        'Pisters R, Lane DA, Nieuwlaat R, et al. A novel user-friendly score (HAS-BLED) to assess 1-year risk of major bleeding in patients with atrial fibrillation. Chest. 2010;138(5):1093-1100.',
      year: 2010,
    },
  ],
  fields,
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(hasBledCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    let score = 0;
    for (const f of fields) {
      if (inputs[f.id] === true) score += 1;
    }

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (score <= 2) {
      severity = score === 0 ? 'normal' : 'low';
      riskClassification = `Riesgo hemorrágico bajo-moderado (${score} / 9 puntos)`;
      clinicalInterpretation =
        'Riesgo basal de sangrado mayor relativamente bajo (≈ 1–2 %/año en cohortes originales).';
      guidance = [
        'Mantener control tensional y evitar AINEs o antiagregación concomitante no indicada.',
      ];
    } else {
      severity = score >= 5 ? 'critical' : 'high';
      riskClassification = `Riesgo hemorrágico elevado (${score} / 9 puntos)`;
      clinicalInterpretation =
        'Puntuación ≥ 3 indica riesgo aumentado de hemorragia mayor. Requiere seguimiento clínico más estrecho y corrección activa de factores modificables (NO contraindica por sí sola la anticoagulación).';
      guidance = [
        'Corregir hipertensión arterial (PAS ≤ 140–160 mmHg), retirar AINEs/antiagregantes si no son estrictamente necesarios, moderar alcohol y optimizar TTR (o valorar ACOD).',
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación HAS-BLED',
        value: score,
        formattedValue: String(score),
        unit: 'puntos (de 9)',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'Herramienta para reducir riesgo modificable y planificar seguimiento; nunca contraindica automáticamente anticoagular.',
      formulaUsed: 'Suma de 9 factores de riesgo hemorrágico (1 punto cada uno)',
      inputsSummary: `Puntuación HAS-BLED: ${score} / 9`,
    };
  },
};
