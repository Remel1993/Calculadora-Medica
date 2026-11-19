import {
  formatClinicalNumber,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SeverityLevel,
} from '../types/clinical.ts';

const fields: BooleanFieldDef[] = [
  {
    id: 'dvtSigns',
    label: 'Signos y síntomas clínicos de TVP (+3.0)',
    helpText: 'Edema unilateral y dolor a la palpación venosa profunda.',
    type: 'boolean',
    trueLabel: 'Sí (+3.0)',
    falseLabel: 'No (0)',
    defaultValue: false,
  },
  {
    id: 'peMostLikely',
    label: 'TEP es el diagnóstico más probable o igual de probable que otro (+3.0)',
    type: 'boolean',
    trueLabel: 'Sí (+3.0)',
    falseLabel: 'No (0)',
    defaultValue: false,
  },
  {
    id: 'tachycardia',
    label: 'Frecuencia cardíaca > 100 lpm (+1.5)',
    type: 'boolean',
    trueLabel: 'Sí (+1.5)',
    falseLabel: 'No (0)',
    defaultValue: false,
  },
  {
    id: 'immobSurgery',
    label: 'Inmovilización ≥ 3 días o cirugía en las últimas 4 semanas (+1.5)',
    type: 'boolean',
    trueLabel: 'Sí (+1.5)',
    falseLabel: 'No (0)',
    defaultValue: false,
  },
  {
    id: 'prevDvtPe',
    label: 'Antecedente objetivado de TVP o TEP previo (+1.5)',
    type: 'boolean',
    trueLabel: 'Sí (+1.5)',
    falseLabel: 'No (0)',
    defaultValue: false,
  },
  {
    id: 'hemoptysis',
    label: 'Hemoptisis (+1.0)',
    type: 'boolean',
    trueLabel: 'Sí (+1.0)',
    falseLabel: 'No (0)',
    defaultValue: false,
  },
  {
    id: 'malignancy',
    label: 'Neoplasia maligna activa (+1.0)',
    helpText: 'En tratamiento actual, en los últimos 6 meses o paliativo.',
    type: 'boolean',
    trueLabel: 'Sí (+1.0)',
    falseLabel: 'No (0)',
    defaultValue: false,
  },
];

export const wellsTepCalculator: CalculatorDefinition = {
  id: 'wells-tep',
  name: 'Criterios de Wells para TEP (Tromboembolia Pulmonar)',
  shortName: 'Wells TEP',
  primarySpecialty: 'medicina-interna',
  secondarySpecialties: ['urgencias'],
  subcategory: 'diagnostico',
  keywords: [
    'wells',
    'tep',
    'pe',
    'embolia pulmonar',
    'tromboembolia pulmonar',
    'angiotac',
    'dimero d',
  ],
  description:
    'Regla de predicción clínica pretest para estimar la probabilidad de tromboembolia pulmonar aguda.',
  clinicalIndication:
    'Estratificación de probabilidad pretest en pacientes hemodinámicamente estables con sospecha clínica de TEP.',
  validatedPopulation: 'Adultos con sospecha de TEP sin inestabilidad hemodinámica/choque.',
  contraindications: [
    'En pacientes con inestabilidad hemodinámica (choque o hipotensión persistente), NO esperar reglas pretest: seguir algoritmo inmediato de TEP de alto riesgo (angio-TC o ecocardiografía a pie de cama).',
  ],
  limitations: [
    'El criterio "TEP es el diagnóstico más probable" introduce un componente subjetivo dependiente de la experiencia clínica.',
    'En embarazo, la validez de Wells es limitada y se prefieren algoritmos dedicados (p. ej. YEARS adaptado a gestación).',
  ],
  version: 'Wells PS et al. (2000, modelos 2 y 3 niveles)',
  references: [
    {
      citation:
        'Wells PS, Anderson DR, Rodger M, et al. Derivation of a simple clinical model to categorize patients probability of pulmonary embolism. Thromb Haemost. 2000;83(3):416-420.',
      year: 2000,
    },
    {
      citation:
        'Konstantinides SV, Meyer G, Becattini C, et al. 2019 ESC Guidelines for the diagnosis and management of acute pulmonary embolism. Eur Heart J. 2020;41(4):543-603.',
      year: 2020,
    },
  ],
  fields,
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(wellsTepCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    let score = 0;
    if (inputs.dvtSigns === true) score += 3.0;
    if (inputs.peMostLikely === true) score += 3.0;
    if (inputs.tachycardia === true) score += 1.5;
    if (inputs.immobSurgery === true) score += 1.5;
    if (inputs.prevDvtPe === true) score += 1.5;
    if (inputs.hemoptysis === true) score += 1.0;
    if (inputs.malignancy === true) score += 1.0;

    const twoTier = score > 4.0 ? 'TEP probable (> 4.0 puntos)' : 'TEP improbable (≤ 4.0 puntos)';
    let threeTier = '';
    let severity: SeverityLevel = 'low';
    let guidance: string[] = [];

    if (score < 2.0) {
      threeTier = 'Probabilidad baja (< 2.0 puntos)';
      severity = 'low';
      guidance = [
        'Considerar regla PERC si la probabilidad clínica global es muy baja; de lo contrario solicitar Dímero D (ajustado por edad en > 50 años si protocolo local lo contempla).',
      ];
    } else if (score <= 6.0) {
      threeTier = 'Probabilidad intermedia (2.0 – 6.0 puntos)';
      severity = score > 4.0 ? 'high' : 'moderate';
      guidance =
        score <= 4.0
          ? [
              'Con ≤ 4.0 puntos (TEP improbable), solicitar Dímero D de alta sensibilidad; si es positivo, realizar angio-TC pulmonar.',
            ]
          : [
              'Con > 4.0 puntos (TEP probable), proceder directamente a angio-TC pulmonar (o gammagrafía V/Q si está contraindicada).',
            ];
    } else {
      threeTier = 'Probabilidad alta (> 6.0 puntos)';
      severity = 'critical';
      guidance = [
        'Realizar angio-TC pulmonar directamente; no utilizar Dímero D para descartar TEP en probabilidad alta.',
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación Wells TEP',
        value: score,
        formattedValue: formatClinicalNumber(score, 1),
        unit: 'puntos',
      },
      secondaryResults: [
        {
          label: 'Modelo de 2 niveles (ESC / Christopher)',
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
        score > 4.0
          ? 'Probabilidad clínica pretest elevada para TEP (> 4 puntos). Indicado estudio de imagen confirmatorio directo.'
          : 'Probabilidad clínica pretest baja/improbable (≤ 4 puntos).',
      guidance,
      guidanceDisclaimer: 'Aplicable solo en pacientes hemodinámicamente estables.',
      formulaUsed: '3.0 (signos TVP) + 3.0 (TEP más probable) + 1.5 (FC>100, inmov/cx, TEP/TVP previo) + 1.0 (hemoptisis, cáncer)',
      inputsSummary: `Puntuación total: ${score.toFixed(1)} puntos (${twoTier})`,
    };
  },
};
