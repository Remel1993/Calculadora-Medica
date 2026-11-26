import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const ecogField: SelectFieldDef = {
  id: 'ecogGrade',
  label: 'Capacidad funcional del paciente (ECOG / Zubrod / OMS)',
  type: 'select',
  defaultValue: '1',
  options: [
    {
      value: '0',
      label: 'ECOG 0 — Totalmente activo, capaz de realizar todas sus actividades previas sin restricción',
      points: 0,
    },
    {
      value: '1',
      label: 'ECOG 1 — Restringido para actividad física intensa; ambulatorio y capaz de trabajos ligeros',
      points: 1,
    },
    {
      value: '2',
      label: 'ECOG 2 — Ambulatorio y capaz de autocuidado, incapaz de trabajar; levantado > 50 % del día',
      points: 2,
    },
    {
      value: '3',
      label: 'ECOG 3 — Autocuidado limitado; confinado a cama o sillón > 50 % de las horas de vigilia',
      points: 3,
    },
    {
      value: '4',
      label: 'ECOG 4 — Completamente incapacitado; nulo autocuidado; confinado 100 % a cama o sillón',
      points: 4,
    },
    {
      value: '5',
      label: 'ECOG 5 — Fallecido',
      points: 5,
    },
  ],
};

interface EcogMeta {
  kpsEquivalent: string;
  severity: SeverityLevel;
  riskClassification: string;
  interpretation: string;
  guidance: string[];
}

const ECOG_META: Record<string, EcogMeta> = {
  '0': {
    kpsEquivalent: '100 % (normal, sin quejas) a 90 % (actividad normal con síntomas menores)',
    severity: 'normal',
    riskClassification: 'ECOG 0 · Estado funcional óptimo',
    interpretation:
      'Paciente completamente activo sin limitación funcional por enfermedad oncológica. Apto para esquemas estándar de tratamiento sistémico, cirugía oncológica o ensayos clínicos.',
    guidance: [
      'Apto desde el punto de vista funcional para terapia oncológica estándar de intensidad completa (sujeto a función orgánica basal).',
    ],
  },
  '1': {
    kpsEquivalent: '80 % (actividad normal con esfuerzo) a 70 % (autocuidado sin capacidad laboral/activa)',
    severity: 'low',
    riskClassification: 'ECOG 1 · Limitación leve (ambulatorio)',
    interpretation:
      'Síntomas leves o restricción para esfuerzos intensos, pero conserva autonomía completa y actividad cotidiana ligera. Elegible para la mayoría de protocolos de quimioterapia e inmunoterapia.',
    guidance: [
      'Candidato habitual a tratamiento oncológico activo estándar; vigilar evolución del estado nutricional y control sintomático.',
    ],
  },
  '2': {
    kpsEquivalent: '60 % (asistencia ocasional) a 50 % (requiere asistencia considerable y atención frecuente)',
    severity: 'moderate',
    riskClassification: 'ECOG 2 · Estado funcional limítrofe (> 50 % despierto fuera de cama)',
    interpretation:
      'Autocuidado conservado pero incapaz de actividad laboral y pasa hasta la mitad del día en reposo. Mayor riesgo de toxicidad hematológica e infecciosa con poliquimioterapia intensiva.',
    guidance: [
      'Individualizar beneficio/riesgo: considerar ajuste de dosis, monoterapia, terapia dirigida menos tóxica o valoración geriátrica integral si adulto mayor.',
      'Integrar soporte paliativo temprano paralelo al tratamiento oncológico (ASCO).',
    ],
  },
  '3': {
    kpsEquivalent: '40 % (incapacitado, cuidados especiales) a 30 % (muy incapacitado, hospitalización indicada)',
    severity: 'high',
    riskClassification: 'ECOG 3 · Deterioro funcional grave (> 50 % en cama/sillón)',
    interpretation:
      'Dependencia significativa para autocuidado y encamamiento > 50 % del día. La quimioterapia citotóxica convencional suele producir más toxicidad que beneficio, salvo tumores altamente quimiosensibles o deterioro agudo reversible.',
    guidance: [
      'Priorizar cuidados paliativos especializados, control de síntomas y discusión de objetivos terapéuticos.',
      'Descartar causas potencialmente reversibles del deterioro (dolor mal controlado, hipercalcemia, anemia grave, infección o compresión medular) antes de asumir pronóstico definitivo.',
    ],
  },
  '4': {
    kpsEquivalent: '20 % (muy enfermo, soporte activo necesario) a 10 % (moribundo)',
    severity: 'critical',
    riskClassification: 'ECOG 4 · Postración total (100 % en cama/sillón)',
    interpretation:
      'Incapacidad total para el autocuidado. Contraindicación habitual para quimioterapia citotóxica por altísima mortalidad relacionada con el tratamiento (salvo excepciones muy seleccionadas de urgencia oncológica en tumor germinal/linfoma altamente sensible).',
    guidance: [
      'Enfoque prioritario en cuidados paliativos, confort, control de disnea/dolor y soporte familiar.',
    ],
  },
  '5': {
    kpsEquivalent: '0 % (Fallecido)',
    severity: 'critical',
    riskClassification: 'ECOG 5 · Fallecido',
    interpretation: 'Equivalente a KPS 0 % (evento terminal en escalas de registro y ensayos clínicos).',
    guidance: ['Registro de desenlace en seguimiento clínico o ensayo terapéutico.'],
  },
};

export const ecogKarnofskyCalculator: CalculatorDefinition = {
  id: 'oncology-ecog-karnofsky',
  name: 'Estado Funcional Oncológico: Escala ECOG (Zubrod) y Equivalencia Karnofsky (KPS)',
  shortName: 'ECOG / Karnofsky (KPS)',
  primarySpecialty: 'oncologia',
  secondarySpecialties: ['medicina-interna', 'geriatria', 'hematologia'],
  subcategory: 'gravedad',
  keywords: [
    'ecog',
    'zubrod',
    'karnofsky',
    'kps',
    'estado funcional',
    'performance status',
    'oncologia',
    'paliativos',
    'quimioterapia',
  ],
  description:
    'Evaluación estandarizada del estado funcional (Performance Status) mediante la escala ECOG/OMS (0–5) con su equivalencia clínica validada en el Índice de Karnofsky (100 %–0 %).',
  clinicalIndication:
    'Valoración basal previa al inicio o continuación de tratamiento sistémico, elegibilidad en protocolos oncológicos, pronóstico y activación de cuidados paliativos.',
  validatedPopulation: 'Adultos con patología oncológica sólida, hematológica o enfermedad crónica avanzada.',
  contraindications: [
    'No usar una puntuación aislada tomada durante un evento agudo reversible (ej. fractura dolorosa no tratada o sepsis en recuperación) para excluir definitivamente al paciente de tratamiento curativo sin reevaluación.',
  ],
  limitations: [
    'En adultos mayores (≥ 65–70 años), ECOG 0–1 puede ocultar fragilidad o polifarmacia; complementar con Valoración Geriátrica Integral (CFS, Barthel, Lawton, MNA).',
  ],
  version: 'Oken et al. (Am J Clin Oncol 1982) · Karnofsky (1949) · Ma et al. (2010)',
  references: [
    {
      citation:
        'Oken MM, Creech RH, Tormey DC, et al. Toxicity and response criteria of the Eastern Cooperative Oncology Group. Am J Clin Oncol. 1982;5(6):649-655.',
      year: 1982,
    },
    {
      citation:
        'Ma C, Bandukwala S, Burman D, et al. Interconversion of three measures of performance status: an empirical analysis. Eur J Cancer. 2010;46(18):3175-3183.',
      year: 2010,
    },
  ],
  fields: [ecogField],
  calculate(inputs: CalculatorInputsState) {
    const errors = validateCalculatorInputs(ecogKarnofskyCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors.map((e) => e.message).join(' '));
    }

    const grade = String(inputs.ecogGrade ?? '1');
    const meta = ECOG_META[grade] ?? ECOG_META['1'];

    return {
      primaryResult: {
        label: 'Grado ECOG / Zubrod',
        value: Number(grade),
        formattedValue: `ECOG ${grade}`,
        unit: '',
      },
      secondaryResults: [
        {
          label: 'Equivalencia Karnofsky (KPS)',
          formattedValue: meta.kpsEquivalent,
          unit: '',
        },
      ],
      severity: meta.severity,
      riskClassification: meta.riskClassification,
      clinicalInterpretation: meta.interpretation,
      guidance: meta.guidance,
      guidanceDisclaimer:
        'La decisión de tratamiento oncológico integra biología tumoral, estadio, intención (curativa vs. paliativa), edad fisiológica y preferencia del paciente.',
      formulaUsed: 'Escala ECOG (0–5) ↔ Equivalencia empírica Karnofsky (ECOG 0: 90–100 %, 1: 70–80 %, 2: 50–60 %, 3: 30–40 %, 4: 10–20 %, 5: 0 %)',
      inputsSummary: `ECOG=${grade}`,
    };
  },
};
