import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SeverityLevel,
} from '../types/clinical.ts';

const fields: BooleanFieldDef[] = [
  {
    id: 'activeCancer',
    label: 'Cáncer activo (+1)',
    helpText: 'Tratamiento actual, en los últimos 6 meses o manejo paliativo.',
    type: 'boolean',
    trueLabel: 'Sí (+1)',
    falseLabel: 'No (0)',
    defaultValue: false,
  },
  {
    id: 'paralysis',
    label: 'Parálisis, paresia o inmovilización reciente con férula/yeso en extremidad inferior (+1)',
    type: 'boolean',
    trueLabel: 'Sí (+1)',
    falseLabel: 'No (0)',
    defaultValue: false,
  },
  {
    id: 'bedriddenSurgery',
    label: 'Encamamiento > 3 días o cirugía mayor en las últimas 12 semanas (+1)',
    type: 'boolean',
    trueLabel: 'Sí (+1)',
    falseLabel: 'No (0)',
    defaultValue: false,
  },
  {
    id: 'tenderness',
    label: 'Dolor localizado a lo largo del trayecto venoso profundo (+1)',
    type: 'boolean',
    trueLabel: 'Sí (+1)',
    falseLabel: 'No (0)',
    defaultValue: false,
  },
  {
    id: 'entireLegSwollen',
    label: 'Edema de toda la extremidad inferior (+1)',
    type: 'boolean',
    trueLabel: 'Sí (+1)',
    falseLabel: 'No (0)',
    defaultValue: false,
  },
  {
    id: 'calfSwelling',
    label: 'Aumento del perímetro de pantorrilla > 3 cm respecto a la pierna contralateral (+1)',
    helpText: 'Medido 10 cm por debajo de la tuberosidad tibial.',
    type: 'boolean',
    trueLabel: 'Sí (+1)',
    falseLabel: 'No (0)',
    defaultValue: false,
  },
  {
    id: 'pittingEdema',
    label: 'Edema con fóvea confinado a la extremidad sintomática (+1)',
    type: 'boolean',
    trueLabel: 'Sí (+1)',
    falseLabel: 'No (0)',
    defaultValue: false,
  },
  {
    id: 'collateralVeins',
    label: 'Venas superficiales colaterales (no varicosas) (+1)',
    type: 'boolean',
    trueLabel: 'Sí (+1)',
    falseLabel: 'No (0)',
    defaultValue: false,
  },
  {
    id: 'previousDvt',
    label: 'TVP previamente documentada (+1)',
    type: 'boolean',
    trueLabel: 'Sí (+1)',
    falseLabel: 'No (0)',
    defaultValue: false,
  },
  {
    id: 'alternativeDiagnosis',
    label: 'Diagnóstico alternativo al menos tan probable como TVP (-2)',
    helpText: 'Ej. celulitis, rotura de quiste de Baker, insuficiencia venosa crónica, desgarro muscular.',
    type: 'boolean',
    trueLabel: 'Sí (-2)',
    falseLabel: 'No (0)',
    defaultValue: false,
  },
];

export const wellsTvpCalculator: CalculatorDefinition = {
  id: 'wells-tvp',
  name: 'Criterios de Wells para TVP (Trombosis Venosa Profunda)',
  shortName: 'Wells TVP',
  primarySpecialty: 'medicina-interna',
  secondarySpecialties: ['urgencias'],
  subcategory: 'diagnostico',
  keywords: [
    'wells',
    'tvp',
    'dvt',
    'trombosis venosa profunda',
    'dimero d',
    'ecografia doppler',
    'edema pierna',
  ],
  description:
    'Regla de probabilidad clínica pretest para estimar la probabilidad de trombosis venosa profunda de extremidad inferior.',
  clinicalIndication:
    'Estratificación de probabilidad pretest en pacientes ambulatorios o de urgencias con sospecha de TVP de miembro inferior.',
  validatedPopulation: 'Adultos no hospitalizados ni embarazadas con sospecha clínica de TVP.',
  contraindications: [
    'Menor validez aislada en pacientes hospitalizados prolongados, embarazadas o sospecha de TVP de miembro superior.',
  ],
  limitations: [
    'No es una prueba diagnóstica definitiva: sirve para decidir el algoritmo de Dímero D vs. Ecografía Doppler venosa por compresión.',
    'Un Dímero D negativo excluye TVP de forma segura solo cuando la probabilidad pretest es baja/improbable.',
  ],
  version: 'Wells PS et al. (2003, modelo 2 y 3 niveles)',
  references: [
    {
      citation:
        'Wells PS, Anderson DR, Rodger M, et al. Evaluation of D-dimer in the diagnosis of suspected deep-vein thrombosis. N Engl J Med. 2003;349(13):1227-1235.',
      year: 2003,
    },
  ],
  fields,
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(wellsTvpCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    let score = 0;
    const positiveIds = [
      'activeCancer',
      'paralysis',
      'bedriddenSurgery',
      'tenderness',
      'entireLegSwollen',
      'calfSwelling',
      'pittingEdema',
      'collateralVeins',
      'previousDvt',
    ];
    for (const id of positiveIds) {
      if (inputs[id] === true) score += 1;
    }
    if (inputs.alternativeDiagnosis === true) {
      score -= 2;
    }

    const twoTier = score >= 2 ? 'TVP probable (≥ 2 puntos)' : 'TVP improbable (< 2 puntos)';
    let threeTier = '';
    let severity: SeverityLevel = 'low';
    let guidance: string[] = [];

    if (score <= 0) {
      threeTier = 'Probabilidad baja (≤ 0 puntos)';
      severity = 'low';
      guidance = [
        'Según algoritmo validado, realizar Dímero D de alta sensibilidad: si es negativo, suele excluir TVP sin necesidad de ecografía; si es positivo, realizar ecografía Doppler.',
      ];
    } else if (score <= 2) {
      threeTier = 'Probabilidad moderada (1 – 2 puntos)';
      severity = 'moderate';
      guidance =
        score < 2
          ? [
              'En modelo de 2 niveles (< 2: improbable), considerar Dímero D; si es positivo (o si se aplica modelo de 3 niveles con probabilidad intermedia), realizar ecografía Doppler venosa.',
            ]
          : [
              'Con ≥ 2 puntos (TVP probable), se recomienda realizar directamente ecografía Doppler venosa por compresión.',
            ];
    } else {
      threeTier = 'Probabilidad alta (≥ 3 puntos)';
      severity = 'high';
      guidance = [
        'Realizar ecografía Doppler venosa por compresión directamente (el Dímero D negativo no excluye TVP en probabilidad alta).',
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación Wells TVP',
        value: score,
        formattedValue: String(score),
        unit: 'puntos',
      },
      secondaryResults: [
        {
          label: 'Modelo de 2 niveles (Wells 2003)',
          formattedValue: twoTier,
          unit: '',
        },
        {
          label: 'Modelo clásico de 3 niveles',
          formattedValue: threeTier,
          unit: '',
        },
      ],
      severity,
      riskClassification: `${twoTier} · ${threeTier}`,
      clinicalInterpretation:
        score >= 2
          ? 'Probabilidad clínica pretest elevada para TVP. Requiere confirmación por imagen.'
          : 'Probabilidad clínica pretest baja/improbable para TVP.',
      guidance,
      guidanceDisclaimer: 'Algoritmo de probabilidad pretest; confirmar con estudios complementarios según disponibilidad.',
      formulaUsed: 'Suma de 9 criterios clínicos (+1 c/u) menos 2 puntos si diagnóstico alternativo igual o más probable',
      inputsSummary: `Puntuación total: ${score} puntos (${twoTier})`,
    };
  },
};
