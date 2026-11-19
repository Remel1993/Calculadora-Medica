import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const ageField: SelectFieldDef = {
  id: 'ageGroup',
  label: 'Edad del paciente (modificación de McIsaac)',
  type: 'select',
  defaultValue: '15_44',
  options: [
    { value: '3_14', label: '3 – 14 años', points: 1 },
    { value: '15_44', label: '15 – 44 años', points: 0 },
    { value: '45plus', label: '≥ 45 años', points: -1 },
  ],
};

const boolFields: BooleanFieldDef[] = [
  {
    id: 'exudate',
    label: 'Exudado o tumefacción amigdalina (+1)',
    type: 'boolean',
    defaultValue: false,
  },
  {
    id: 'nodes',
    label: 'Adenopatías cervicales anteriores dolorosas (+1)',
    type: 'boolean',
    defaultValue: false,
  },
  {
    id: 'fever',
    label: 'Fiebre > 38.0 °C (por anamnesis o medida) (+1)',
    type: 'boolean',
    defaultValue: false,
  },
  {
    id: 'noCough',
    label: 'Ausencia de tos (+1)',
    type: 'boolean',
    defaultValue: false,
  },
];

export const centorMcisaacCalculator: CalculatorDefinition = {
  id: 'centor-mcisaac',
  name: 'Criterios de Centor / McIsaac (Faringoamigdalitis)',
  shortName: 'Centor / McIsaac',
  primarySpecialty: 'infectologia',
  secondarySpecialties: ['urgencias', 'pediatria'],
  subcategory: 'diagnostico',
  keywords: [
    'centor',
    'mcisaac',
    'faringitis',
    'amigdalitis',
    'estreptococo',
    'ebhga',
    'antibiotico',
  ],
  description:
    'Estima la probabilidad clínica de faringoamigdalitis por estreptococo betahemolítico del grupo A (EBHGA) en mayores de 3 años.',
  clinicalIndication:
    'Orientar la necesidad de prueba antigénica rápida / cultivo faríngeo frente a manejo sintomático en faringoamigdalitis aguda.',
  validatedPopulation: 'Pacientes ≥ 3 años con faringoamigdalitis aguda (Centor original en adultos; McIsaac añade ajuste por edad desde 3 años).',
  contraindications: [
    'No utilizar en menores de 3 años (la infección estreptocócica clásica es infrecuente y suele presentarse distinto).',
    'No reemplaza la evaluación inmediata ante sospecha de absceso periamigdalino, epiglotitis o difteria.',
  ],
  limitations: [
    'Incluso con la puntuación máxima (4–5 puntos), la probabilidad de EBHGA es ≈ 50–56 %; por ello no es diagnóstica por sí sola.',
    'Controversia entre guías: IDSA recomienda confirmar con test rápido/cultivo en puntuaciones ≥ 2–3 antes de prescribir antibiótico, mientras que algunas guías europeas (NICE/ESCMID) emplean umbrales más restrictivos para antibióticos.',
  ],
  version: 'McIsaac et al. (CMAJ 1998)',
  references: [
    {
      citation:
        'McIsaac WJ, White D, Tannenbaum D, Low DE. A clinical score to reduce unnecessary antibiotic use in patients with sore throat. CMAJ. 1998;158(1):75-83.',
      year: 1998,
    },
    {
      citation:
        'Shulman ST, Bisno AL, Clegg HW, et al. Clinical Practice Guideline for the Diagnosis and Management of Group A Streptococcal Pharyngitis: 2012 Update by the IDSA. Clin Infect Dis. 2012;55(10):e86-e102.',
      year: 2012,
    },
  ],
  fields: [ageField, ...boolFields],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(centorMcisaacCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    let score = 0;
    if (inputs.ageGroup === '3_14') score += 1;
    else if (inputs.ageGroup === '45plus') score -= 1;

    for (const f of boolFields) {
      if (inputs[f.id] === true) score += 1;
    }

    const probMap: Record<number, string> = {
      [-1]: '1 – 2.5 %',
      0: '1 – 2.5 %',
      1: '5 – 10 %',
      2: '11 – 17 %',
      3: '28 – 35 %',
      4: '51 – 53 %',
      5: '51 – 53 %',
    };
    const prob = probMap[score] ?? 'N/D';

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let guidance: string[] = [];

    if (score <= 1) {
      severity = 'normal';
      riskClassification = `Probabilidad baja (${score} punto${score === 1 ? '' : 's'} · ≈ ${prob})`;
      guidance = [
        'Habitualmente de etiología viral: manejo sintomático; no se recomienda test rápido ni antibióticos de rutina.',
      ];
    } else if (score <= 3) {
      severity = 'moderate';
      riskClassification = `Probabilidad intermedia (${score} puntos · ≈ ${prob})`;
      guidance = [
        'Recomendada prueba antigénica rápida de EBHGA (o cultivo si aplica); tratar con antibiótico solo si la prueba es positiva.',
      ];
    } else {
      severity = 'high';
      riskClassification = `Probabilidad alta (${score} puntos · ≈ ${prob})`;
      guidance = [
        'Considerar test rápido de EBHGA (o tratamiento empírico según protocolo local si no hay disponibilidad de test y alta sospecha clínica).',
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación McIsaac (Centor modificado)',
        value: score,
        formattedValue: String(score),
        unit: 'puntos (rango -1 a 5)',
      },
      secondaryResults: [
        {
          label: 'Probabilidad estimada de EBHGA (McIsaac)',
          formattedValue: prob,
          unit: 'en cultivo faríngeo',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation: `Probabilidad estimada del ${prob} de faringitis estreptocócica por grupo A.`,
      guidance,
      guidanceDisclaimer: 'Evitar antibioticoterapia automática sin confirmación microbiológica cuando haya pruebas rápidas disponibles.',
      formulaUsed: 'Edad (3–14: +1, ≥45: -1) + Exudado (+1) + Adenopatías (+1) + Fiebre >38°C (+1) + Sin tos (+1)',
      inputsSummary: `Puntuación McIsaac: ${score}`,
    };
  },
};
