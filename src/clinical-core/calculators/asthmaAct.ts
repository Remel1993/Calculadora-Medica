import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const activityField: SelectFieldDef = {
  id: 'activity',
  label: '1. Durante las últimas 4 semanas, ¿cuánto tiempo le impidió el asma hacer su trabajo, estudios o tareas habituales?',
  type: 'select',
  defaultValue: '5',
  options: [
    { value: '1', label: '1 — Siempre', points: 1 },
    { value: '2', label: '2 — La mayoría del tiempo', points: 2 },
    { value: '3', label: '3 — Algo de tiempo', points: 3 },
    { value: '4', label: '4 — Un poco de tiempo', points: 4 },
    { value: '5', label: '5 — Nunca', points: 5 },
  ],
};

const dyspneaField: SelectFieldDef = {
  id: 'dyspnea',
  label: '2. Durante las últimas 4 semanas, ¿con qué frecuencia sintió falta de aire?',
  type: 'select',
  defaultValue: '5',
  options: [
    { value: '1', label: '1 — Más de una vez al día', points: 1 },
    { value: '2', label: '2 — Una vez al día', points: 2 },
    { value: '3', label: '3 — De 3 a 6 veces por semana', points: 3 },
    { value: '4', label: '4 — Una o dos veces por semana', points: 4 },
    { value: '5', label: '5 — Nunca', points: 5 },
  ],
};

const nocturnalField: SelectFieldDef = {
  id: 'nocturnal',
  label: '3. ¿Con qué frecuencia los síntomas de asma lo despertaron por la noche o más temprano de lo habitual?',
  type: 'select',
  defaultValue: '5',
  options: [
    { value: '1', label: '1 — 4 o más noches por semana', points: 1 },
    { value: '2', label: '2 — 2 a 3 noches por semana', points: 2 },
    { value: '3', label: '3 — Una vez por semana', points: 3 },
    { value: '4', label: '4 — Una o dos veces en total', points: 4 },
    { value: '5', label: '5 — Nunca', points: 5 },
  ],
};

const rescueField: SelectFieldDef = {
  id: 'rescue',
  label: '4. ¿Con qué frecuencia usó su inhalador de rescate (salbutamol / SABA)?',
  type: 'select',
  defaultValue: '5',
  options: [
    { value: '1', label: '1 — 3 o más veces al día', points: 1 },
    { value: '2', label: '2 — 1 o 2 veces al día', points: 2 },
    { value: '3', label: '3 — 2 o 3 veces por semana', points: 3 },
    { value: '4', label: '4 — Una vez a la semana o menos', points: 4 },
    { value: '5', label: '5 — Nunca', points: 5 },
  ],
};

const selfRatingField: SelectFieldDef = {
  id: 'selfRating',
  label: '5. ¿Cómo calificaría el control de su asma en las últimas 4 semanas?',
  type: 'select',
  defaultValue: '5',
  options: [
    { value: '1', label: '1 — Nada controlada', points: 1 },
    { value: '2', label: '2 — Mal controlada', points: 2 },
    { value: '3', label: '3 — Algo controlada', points: 3 },
    { value: '4', label: '4 — Bien controlada', points: 4 },
    { value: '5', label: '5 — Totalmente controlada', points: 5 },
  ],
};

export const asthmaActCalculator: CalculatorDefinition = {
  id: 'asthma-act',
  name: 'Test de Control del Asma (ACT — Asthma Control Test)',
  shortName: 'ACT (Asma)',
  primarySpecialty: 'neumologia',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'gravedad',
  keywords: [
    'asma',
    'act',
    'asthma control test',
    'gina',
    'control asmatico',
    'inhalador',
    'salbutamol',
    'disnea',
  ],
  description:
    'Cuestionario validado de 5 preguntas (5–25 puntos) para evaluar el grado de control del asma durante las últimas 4 semanas en consulta externa.',
  clinicalIndication:
    'Seguimiento ambulatorio de pacientes ≥ 12 años con diagnóstico de asma para decidir mantenimiento o ajuste escalonado del tratamiento.',
  validatedPopulation: 'Adultos y adolescentes ≥ 12 años con diagnóstico confirmado de asma.',
  contraindications: [
    'No usar para evaluar una crisis asmática aguda en urgencias (para agudizaciones utilizar Pulmonary Score o criterios GINA de crisis).',
    'En niños de 4 a 11 años debe utilizarse la versión pediátrica Childhood ACT (c-ACT, 7 ítems).',
  ],
  limitations: [
    'Evalúa solo las últimas 4 semanas; no sustituye la medición de función pulmonar (espirometría / FEV₁) ni la valoración del riesgo futuro de exacerbaciones.',
    'Un cambio de ≥ 3 puntos respecto a controles previos corresponde a la diferencia mínima clínicamente importante (MCID).',
  ],
  version: 'Nathan et al. (2004) / GINA',
  references: [
    {
      citation:
        'Nathan RA, Sorkness CA, Kosinski M, et al. Development of the asthma control test: a survey for assessing asthma control. J Allergy Clin Immunol. 2004;113(1):59-65.',
      year: 2004,
    },
    {
      citation:
        'Global Initiative for Asthma (GINA). Global Strategy for Asthma Management and Prevention. Updated 2024.',
      year: 2024,
    },
  ],
  fields: [activityField, dyspneaField, nocturnalField, rescueField, selfRatingField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(asthmaActCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const a = Number(inputs.activity);
    const d = Number(inputs.dyspnea);
    const n = Number(inputs.nocturnal);
    const r = Number(inputs.rescue);
    const s = Number(inputs.selfRating);
    const total = a + d + n + r + s;

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (total === 25) {
      severity = 'normal';
      riskClassification = 'Asma totalmente controlada (25 / 25 puntos)';
      clinicalInterpretation =
        'Control clínico óptimo en las últimas 4 semanas sin síntomas limitantes ni uso de medicación de rescate.';
      guidance = [
        'Mantener tratamiento controlador actual; considerar descenso escalonado solo si permanece estable ≥ 3 meses (GINA).',
      ];
    } else if (total >= 20) {
      severity = 'low';
      riskClassification = `Asma bien controlada (${total} / 25 puntos)`;
      clinicalInterpretation =
        'Puntuación ≥ 20 indica buen control general del asma, aunque persisten síntomas ocasionales a vigilar.';
      guidance = [
        'Verificar adherencia y técnica inhalatoria; reforzar plan de acción escrito.',
      ];
    } else if (total >= 16) {
      severity = 'moderate';
      riskClassification = `Asma no bien controlada / Parcial (${total} / 25 puntos)`;
      clinicalInterpretation =
        'Puntuación < 20 refleja control insuficiente del asma y mayor riesgo de exacerbaciones.';
      guidance = [
        'Antes de escalar tratamiento, revisar técnica inhalatoria, adherencia, exposición a alérgenos/tabaco y comorbilidades (rinitis, ERGE).',
        'Valorar ascenso de escalón terapéutico según guías GINA / GEMA.',
      ];
    } else {
      severity = 'high';
      riskClassification = `Asma muy mal controlada (${total} / 25 puntos)`;
      clinicalInterpretation =
        'Control deficiente grave con síntomas frecuentes o limitación importante de la vida diaria.';
      guidance = [
        'Revisar de forma prioritaria adherencia, técnica del dispositivo y desencadenantes.',
        'Ajustar terapia controladora (CSI/formoterol o escalón superior según GINA), valorar función pulmonar y descartar exacerbación en curso.',
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación ACT',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 25)',
      },
      secondaryResults: [
        {
          label: 'Umbral de buen control (≥ 20 puntos)',
          formattedValue: total >= 20 ? 'Alcanzado' : 'No alcanzado',
          unit: '',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer:
        'Complementar siempre con exploración física, adherencia, técnica inhalatoria y espirometría.',
      formulaUsed: 'Suma de 5 ítems (1 – 5 pts cada uno; rango 5 – 25)',
      inputsSummary: `ACT: ${a}+${d}+${n}+${r}+${s} = ${total}/25`,
    };
  },
};
