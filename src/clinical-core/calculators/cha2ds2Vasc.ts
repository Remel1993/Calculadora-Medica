import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const ageGroupField: SelectFieldDef = {
  id: 'ageGroup',
  label: 'Edad',
  type: 'select',
  defaultValue: 'under65',
  options: [
    { value: 'under65', label: '< 65 años', points: 0 },
    { value: '65_74', label: '65 – 74 años', points: 1 },
    { value: '75plus', label: '≥ 75 años', points: 2 },
  ],
};

const sexField: SelectFieldDef = {
  id: 'sex',
  label: 'Sexo biológico',
  type: 'select',
  defaultValue: 'male',
  helpText: 'Suma +1 en CHA₂DS₂-VASc (AHA/ACC), pero 0 puntos en CHA₂DS₂-VA (ESC 2024).',
  options: [
    { value: 'male', label: 'Masculino (0)' },
    { value: 'female', label: 'Femenino (+1 en VASc / 0 en VA)' },
  ],
};

const booleanCriteria: BooleanFieldDef[] = [
  {
    id: 'chf',
    label: 'C — Insuficiencia cardíaca o disfunción ventricular izquierda (+1)',
    type: 'boolean',
    trueLabel: 'Presente (+1)',
    falseLabel: 'Ausente (0)',
    defaultValue: false,
  },
  {
    id: 'htn',
    label: 'H — Hipertensión arterial (+1)',
    type: 'boolean',
    trueLabel: 'Presente (+1)',
    falseLabel: 'Ausente (0)',
    defaultValue: false,
  },
  {
    id: 'diabetes',
    label: 'D — Diabetes mellitus (+1)',
    type: 'boolean',
    trueLabel: 'Presente (+1)',
    falseLabel: 'Ausente (0)',
    defaultValue: false,
  },
  {
    id: 'stroke',
    label: 'S₂ — Ictus previo, AIT o tromboembolia sistémica (+2)',
    type: 'boolean',
    trueLabel: 'Presente (+2)',
    falseLabel: 'Ausente (0)',
    defaultValue: false,
  },
  {
    id: 'vascular',
    label: 'V — Enfermedad vascular (IAM previo, EAP o placa aórtica compleja) (+1)',
    type: 'boolean',
    trueLabel: 'Presente (+1)',
    falseLabel: 'Ausente (0)',
    defaultValue: false,
  },
];

export const cha2ds2VascCalculator: CalculatorDefinition = {
  id: 'cha2ds2-vasc',
  name: 'CHA₂DS₂-VASc y CHA₂DS₂-VA (Riesgo Embólico en FA)',
  shortName: 'CHA₂DS₂-VASc/VA',
  primarySpecialty: 'medicina-interna',
  secondarySpecialties: ['cardiologia'],
  subcategory: 'gravedad',
  keywords: [
    'cha2ds2',
    'cha2ds2-vasc',
    'cha2ds2-va',
    'fibrilacion auricular',
    'anticoagulacion',
    'ictus',
    'stroke',
    'fa',
  ],
  description:
    'Estratificación del riesgo tromboembólico anual en fibrilación auricular no valvular (calcula simultáneamente CHA₂DS₂-VA ESC 2024 y CHA₂DS₂-VASc ACC/AHA).',
  clinicalIndication:
    'Evaluación de indicación de anticoagulación oral en adultos con fibrilación auricular o flutter auricular.',
  validatedPopulation: 'Adultos con fibrilación auricular sin estenosis mitral moderada-grave ni prótesis valvular mecánica.',
  contraindications: [
    'No usar para omitir anticoagulación en estenosis mitral reumática moderada-grave ni en portadores de prótesis valvulares mecánicas (tienen indicación directa de AVK independientemente del score).',
    'En miocardiopatía hipertrófica o amiloidosis cardíaca con FA suele indicarse anticoagulación independientemente de la puntuación.',
  ],
  limitations: [
    'Actualización / divergencia entre guías: las guías ESC 2024 adoptaron CHA₂DS₂-VA (eliminando la categoría sexo femenino como punto separado, recomendando anticoagulación con ≥ 2 y considerándola con 1), mientras que ACC/AHA 2023 mantienen CHA₂DS₂-VASc (≥ 2 en varones / ≥ 3 en mujeres).',
    'El riesgo de ictus es dinámico; reevaluar periódicamente si aparecen nuevas comorbilidades o cumple 65 / 75 años.',
  ],
  version: 'ESC 2024 (CHA₂DS₂-VA) & ACC/AHA 2023 (CHA₂DS₂-VASc)',
  references: [
    {
      citation:
        'Van Gelder IC, Rienstra M, Bunting KV, et al. 2024 ESC Guidelines for the management of atrial fibrillation. Eur Heart J. 2024;45(36):3314-3414.',
      year: 2024,
    },
    {
      citation:
        'Joglar JA, Chung MK, Armbruster AL, et al. 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation. Circulation. 2024;149(1):e1-e156.',
      year: 2024,
    },
  ],
  fields: [ageGroupField, sexField, ...booleanCriteria],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(cha2ds2VascCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    let vaScore = 0;
    if (inputs.ageGroup === '65_74') vaScore += 1;
    else if (inputs.ageGroup === '75plus') vaScore += 2;

    if (inputs.chf === true) vaScore += 1;
    if (inputs.htn === true) vaScore += 1;
    if (inputs.diabetes === true) vaScore += 1;
    if (inputs.stroke === true) vaScore += 2;
    if (inputs.vascular === true) vaScore += 1;

    const isFemale = inputs.sex === 'female';
    const vascScore = vaScore + (isFemale ? 1 : 0);

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (vaScore === 0) {
      severity = 'normal';
      riskClassification = 'Riesgo embólico bajo (CHA₂DS₂-VA: 0)';
      clinicalInterpretation =
        'Riesgo tromboembólico anual muy bajo (< 1 %/año). Tanto ESC 2024 como ACC/AHA 2023 coinciden en no iniciar anticoagulación oral por riesgo embólico en ausencia de otras indicaciones.';
      guidance = [
        'Reevaluar los factores de riesgo tromboembólico de forma periódica.',
      ];
    } else if (vaScore === 1) {
      severity = 'moderate';
      riskClassification = 'Riesgo embólico intermedio (CHA₂DS₂-VA: 1)';
      clinicalInterpretation =
        'Riesgo intermedio. Ambas guías (ESC 2024 con VA = 1; ACC/AHA con VASc = 1 en hombres o 2 en mujeres) sugieren considerar anticoagulación oral valorando beneficio neto frente a riesgo hemorrágico y preferencias del paciente.';
      guidance = [
        'Individualizar anticoagulación oral y evaluar factores modificables de sangrado (HAS-BLED).',
      ];
    } else {
      severity = vaScore >= 4 ? 'critical' : 'high';
      riskClassification = `Riesgo embólico elevado (CHA₂DS₂-VA: ${vaScore} / CHA₂DS₂-VASc: ${vascScore})`;
      clinicalInterpretation =
        'Puntuación en rango de indicación clara de anticoagulación oral (≥ 2 en CHA₂DS₂-VA; equivalente a ≥ 2 en varones / ≥ 3 en mujeres en CHA₂DS₂-VASc).';
      guidance = [
        'Indicada anticoagulación oral crónica (ACOD preferidos sobre AVK en FA no valvular salvo contraindicación como prótesis mecánica o estenosis mitral moderada-grave).',
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación CHA₂DS₂-VA (ESC 2024)',
        value: vaScore,
        formattedValue: String(vaScore),
        unit: 'puntos (de 8)',
      },
      secondaryResults: [
        {
          label: 'Puntuación CHA₂DS₂-VASc (ACC/AHA)',
          formattedValue: String(vascScore),
          unit: 'puntos (de 9)',
          note: isFemale ? 'Incluye +1 por sexo femenino' : 'Sin punto adicional por sexo',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'Evaluar siempre junto con riesgo hemorrágico modificable y función renal para ajuste de ACOD.',
      formulaUsed: 'C(+1) + H(+1) + A₂(≥75: +2 / 65–74: +1) + D(+1) + S₂(+2) + V(+1) [+ Sc(+1 solo en VASc)]',
      inputsSummary: `CHA₂DS₂-VA: ${vaScore} · CHA₂DS₂-VASc: ${vascScore}`,
    };
  },
};
