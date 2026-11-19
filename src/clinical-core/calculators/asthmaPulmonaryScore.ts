import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const ageGroupField: SelectFieldDef = {
  id: 'ageGroup',
  label: 'Grupo de edad (define umbrales de frecuencia respiratoria)',
  type: 'select',
  defaultValue: 'lt6',
  options: [
    { value: 'lt6', label: 'Menor de 6 años' },
    { value: 'ge6', label: '6 años o más' },
  ],
};

const respRateLt6Field: SelectFieldDef = {
  id: 'rrLt6',
  label: '1. Frecuencia respiratoria (< 6 años)',
  type: 'select',
  defaultValue: '0',
  visibleWhen: (inputs) => inputs.ageGroup !== 'ge6',
  options: [
    { value: '0', label: '0 — ≤ 30 rpm', points: 0 },
    { value: '1', label: '1 — 31 a 45 rpm', points: 1 },
    { value: '2', label: '2 — 46 a 60 rpm', points: 2 },
    { value: '3', label: '3 — > 60 rpm', points: 3 },
  ],
};

const respRateGe6Field: SelectFieldDef = {
  id: 'rrGe6',
  label: '1. Frecuencia respiratoria (≥ 6 años)',
  type: 'select',
  defaultValue: '0',
  visibleWhen: (inputs) => inputs.ageGroup === 'ge6',
  options: [
    { value: '0', label: '0 — ≤ 20 rpm', points: 0 },
    { value: '1', label: '1 — 21 a 35 rpm', points: 1 },
    { value: '2', label: '2 — 36 a 50 rpm', points: 2 },
    { value: '3', label: '3 — > 50 rpm', points: 3 },
  ],
};

const wheezingField: SelectFieldDef = {
  id: 'wheezing',
  label: '2. Sibilancias',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — No (ausentes)', points: 0 },
    { value: '1', label: '1 — Final de la espiración (estetoscopio)', points: 1 },
    { value: '2', label: '2 — Toda la espiración (estetoscopio)', points: 2 },
    {
      value: '3',
      label: '3 — Inspiración y espiración sin estetoscopio (o tórax silente)',
      points: 3,
    },
  ],
};

const accessoryField: SelectFieldDef = {
  id: 'accessory',
  label: '3. Uso de musculatura accesoria (esternocleidomastoideo / tiraje)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — No', points: 0 },
    { value: '1', label: '1 — Incremento leve', points: 1 },
    { value: '2', label: '2 — Aumentado (tiraje evidente)', points: 2 },
    { value: '3', label: '3 — Actividad máxima', points: 3 },
  ],
};

const spo2Field: SelectFieldDef = {
  id: 'spo2Band',
  label: 'Saturación de O₂ (SpO₂) basal (integración GEMA)',
  helpText: 'Según GEMA, si la gravedad por Pulmonary Score y SpO₂ difieren, prevalece la mayor gravedad.',
  type: 'select',
  defaultValue: 'gt94',
  options: [
    { value: 'gt94', label: '> 94 % (Leve)' },
    { value: '91_94', label: '91 – 94 % (Moderada)' },
    { value: 'lt91', label: '< 91 % (Grave)' },
  ],
};

export const asthmaPulmonaryScoreCalculator: CalculatorDefinition = {
  id: 'asthma-pulmonary-score',
  name: 'Pulmonary Score (Crisis Asmática Pediátrica / GEMA)',
  shortName: 'Pulmonary Score',
  primarySpecialty: 'pediatria',
  secondarySpecialties: ['neumologia', 'urgencias'],
  subcategory: 'gravedad',
  keywords: [
    'pulmonary score',
    'asma',
    'crisis asmatica',
    'broncoespasmo',
    'gema',
    'sibilancias',
    'pediatria',
    'urgencias',
  ],
  description:
    'Escala clínica validada (0–9 puntos) integrada con SpO₂ según GEMA para clasificar la gravedad de la crisis asmática aguda en urgencias.',
  clinicalIndication:
    'Estratificación inicial y reevaluación seriada tras broncodilatadores en crisis asmática aguda (especialmente en población pediátrica).',
  validatedPopulation: 'Niños y adolescentes (1 – 18 años) con crisis asmática aguda; usada ampliamente en urgencias.',
  contraindications: [
    'Ante signos de parada respiratoria inminente (bradipnea, bradicardia, agotamiento extremo, cianosis o alteración de conciencia), iniciar reanimación inmediata sin demora.',
  ],
  limitations: [
    'El tórax silente por obstrucción bronquial extrema se puntúa con 3 en sibilancias aunque no se ausculten ruidos.',
    'En menores de 2 años con primer episodio sibilante considerar diagnóstico diferencial con bronquiolitis (donde se emplean escalas como Wood-Downes-Ferrés).',
    'Para adultos con crisis asmática se recomienda complementar con criterios GINA de adulto (FC, FR, SpO₂, habla y PEF).',
  ],
  version: 'Smith SR et al. (2002) / GEMA 5.4',
  references: [
    {
      citation:
        'Smith SR, Baty JD, Hodge D 3rd. Validation of the pulmonary score: an asthma severity score for children. Acad Emerg Med. 2002;9(2):99-104.',
      year: 2002,
    },
    {
      citation:
        'GEMA 5.4. Guía Española para el Manejo del Asma. Sociedad Española de Neumología y Cirugía Torácica (SEPAR), 2024.',
      year: 2024,
    },
  ],
  fields: [
    ageGroupField,
    respRateLt6Field,
    respRateGe6Field,
    wheezingField,
    accessoryField,
    spo2Field,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(asthmaPulmonaryScoreCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const rr = inputs.ageGroup === 'ge6' ? Number(inputs.rrGe6) : Number(inputs.rrLt6);
    const wh = Number(inputs.wheezing);
    const acc = Number(inputs.accessory);
    const score = rr + wh + acc;

    const scoreGrade = score <= 3 ? 1 : score <= 6 ? 2 : 3;
    const spo2Grade =
      inputs.spo2Band === 'lt91' ? 3 : inputs.spo2Band === '91_94' ? 2 : 1;
    const finalGrade = Math.max(scoreGrade, spo2Grade);

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (finalGrade === 1) {
      severity = 'low';
      riskClassification = `Crisis asmática leve (Score ${score} / 9 · SpO₂ > 94 %)`;
      clinicalInterpretation =
        'Obstrucción bronquial leve sin hipoxemia significativa.';
      guidance = [
        'SABA inhalado (salbutamol con cámara espaciadora) y reevaluar respuesta clínica a los 15–20 minutos.',
      ];
    } else if (finalGrade === 2) {
      severity = 'moderate';
      riskClassification =
        scoreGrade < spo2Grade
          ? `Crisis asmática moderada (Score ${score} / 9 · elevada por SpO₂ 91–94 %)`
          : `Crisis asmática moderada (Score ${score} / 9)`;
      clinicalInterpretation =
        'Crisis moderada que requiere tratamiento broncodilatador repetido y corticoide sistémico precoz.';
      guidance = [
        'Salbutamol inhalado en tandas iniciales + corticoide oral sistémico precoz (p. ej. prednisona/prednisolona o dexametasona según protocolo) y oxígeno si SpO₂ < 94 %.',
        'Valorar bromuro de ipratropio asociado según respuesta inicial.',
      ];
    } else {
      severity = 'critical';
      riskClassification =
        scoreGrade < spo2Grade
          ? `Crisis asmática grave (Score ${score} / 9 · elevada por SpO₂ < 91 %)`
          : `Crisis asmática grave (Score ${score} / 9)`;
      clinicalInterpretation =
        'Compromiso ventilatorio grave con alto riesgo de fatiga respiratoria e insuficiencia respiratoria aguda.';
      guidance = [
        'Oxigenoterapia para mantener SpO₂ objetivo (≥ 94 %), SABA + bromuro de ipratropio repetidos/nebulizados y corticoide sistémico inmediato (oral o IV según tolerancia).',
        'Considerar sulfato de magnesio IV si mala respuesta inicial y monitorización continua / valoración por UCIP.',
      ];
    }

    const scoreLabel = scoreGrade === 1 ? 'Leve' : scoreGrade === 2 ? 'Moderada' : 'Grave';
    const spo2Label =
      spo2Grade === 1 ? '> 94 % (Leve)' : spo2Grade === 2 ? '91–94 % (Moderada)' : '< 91 % (Grave)';

    return {
      primaryResult: {
        label: 'Pulmonary Score',
        value: score,
        formattedValue: String(score),
        unit: 'puntos (de 9)',
      },
      secondaryResults: [
        {
          label: 'Gravedad aislada por Pulmonary Score',
          formattedValue: `${scoreLabel} (${score} pts)`,
          unit: '',
        },
        {
          label: 'Gravedad por SpO₂ (GEMA)',
          formattedValue: spo2Label,
          unit: '',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer:
        'Las dosis farmacológicas deben ajustarse por peso y protocolo institucional vigente.',
      formulaUsed: 'FR (0–3) + Sibilancias (0–3) + Musc. accesoria (0–3); clasificación final = máx(Score, SpO₂)',
      inputsSummary: `Edad:${inputs.ageGroup === 'ge6' ? '≥6a' : '<6a'} FR:${rr} Sib:${wh} Musc:${acc} SpO₂:${inputs.spo2Band}`,
    };
  },
};
