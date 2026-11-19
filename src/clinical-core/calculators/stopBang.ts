import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SeverityLevel,
} from '../types/clinical.ts';

const snoringField: BooleanFieldDef = {
  id: 'snoring',
  label: 'S — Ronquidos fuertes',
  helpText: '¿Ronca más fuerte que al hablar o se escucha a través de puertas cerradas?',
  type: 'boolean',
  trueLabel: 'Sí (+1)',
  falseLabel: 'No (0)',
  pointsWhenTrue: 1,
  defaultValue: false,
};

const tiredField: BooleanFieldDef = {
  id: 'tired',
  label: 'T — Cansancio o somnolencia diurna',
  helpText: '¿Se siente con frecuencia cansado, fatigado o con sueño durante el día?',
  type: 'boolean',
  trueLabel: 'Sí (+1)',
  falseLabel: 'No (0)',
  pointsWhenTrue: 1,
  defaultValue: false,
};

const observedField: BooleanFieldDef = {
  id: 'observed',
  label: 'O — Apneas presenciadas',
  helpText: '¿Alguien ha observado que deja de respirar o se ahoga mientras duerme?',
  type: 'boolean',
  trueLabel: 'Sí (+1)',
  falseLabel: 'No (0)',
  pointsWhenTrue: 1,
  defaultValue: false,
};

const pressureField: BooleanFieldDef = {
  id: 'pressure',
  label: 'P — Hipertensión arterial',
  helpText: '¿Tiene diagnóstico o tratamiento actual para hipertensión arterial?',
  type: 'boolean',
  trueLabel: 'Sí (+1)',
  falseLabel: 'No (0)',
  pointsWhenTrue: 1,
  defaultValue: false,
};

const bmiField: BooleanFieldDef = {
  id: 'bmi35',
  label: 'B — IMC > 35 kg/m²',
  helpText: 'Índice de masa corporal superior a 35 kg/m².',
  type: 'boolean',
  trueLabel: 'Sí (+1)',
  falseLabel: 'No (0)',
  pointsWhenTrue: 1,
  defaultValue: false,
};

const ageField: BooleanFieldDef = {
  id: 'age50',
  label: 'A — Edad > 50 años',
  type: 'boolean',
  trueLabel: 'Sí (+1)',
  falseLabel: 'No (0)',
  pointsWhenTrue: 1,
  defaultValue: false,
};

const neckField: BooleanFieldDef = {
  id: 'neck40',
  label: 'N — Perímetro cervical > 40 cm',
  helpText: 'Circunferencia del cuello > 40 cm (corte estándar STOP-BANG; algunas guías ajustan > 43 cm en varones / > 41 cm en mujeres).',
  type: 'boolean',
  trueLabel: 'Sí (+1)',
  falseLabel: 'No (0)',
  pointsWhenTrue: 1,
  defaultValue: false,
};

const genderField: BooleanFieldDef = {
  id: 'male',
  label: 'G — Sexo masculino',
  type: 'boolean',
  trueLabel: 'Sí (+1)',
  falseLabel: 'No (0)',
  pointsWhenTrue: 1,
  defaultValue: false,
};

export const stopBangCalculator: CalculatorDefinition = {
  id: 'stop-bang',
  name: 'Cuestionario STOP-BANG (Tamizaje de SAOS)',
  shortName: 'STOP-BANG',
  primarySpecialty: 'neumologia',
  secondarySpecialties: ['medicina-interna', 'cirugia-general'],
  subcategory: 'diagnostico',
  keywords: [
    'stop-bang',
    'stopbang',
    'saos',
    'aos',
    'apnea del sueno',
    'ronquido',
    'somnolencia',
    'preoperatorio',
    'epworth',
  ],
  description:
    'Instrumento validado de 8 ítems para cribado de síndrome de apnea obstructiva del sueño (SAOS) en consulta externa y valoración preoperatoria.',
  clinicalIndication:
    'Tamizaje inicial de SAOS moderado a grave en adultos con ronquido, somnolencia diurna, HTA resistente, obesidad o previo a cirugía electiva.',
  validatedPopulation: 'Adultos ≥ 18 años en población quirúrgica y consulta médica general.',
  contraindications: [
    'No es una prueba diagnóstica confirmatoria; un puntaje alto no sustituye la polisomnografía ni la poligrafía respiratoria.',
  ],
  limitations: [
    'Posee alta sensibilidad pero especificidad moderada: puede generar falsos positivos en varones mayores con hipertensión sin apneas.',
    'Complementar con la Escala de Somnolencia de Epworth (ESS) para cuantificar la repercusión clínica diurna.',
    'En pacientes pediátricos se requieren cuestionarios específicos (p. ej. PSQ de Chervin), no STOP-BANG.',
  ],
  version: 'Chung et al. (2008 / 2016)',
  references: [
    {
      citation:
        'Chung F, Yegneswaran B, Liao P, et al. STOP questionnaire: a tool to screen patients for obstructive sleep apnea. Anesthesiology. 2008;108(5):812-821.',
      year: 2008,
    },
    {
      citation:
        'Chung F, Abdullah HR, Liao P. STOP-Bang Questionnaire: A Practical Approach to Screen for Obstructive Sleep Apnea. Chest. 2016;149(3):631-638.',
      year: 2016,
    },
  ],
  fields: [
    snoringField,
    tiredField,
    observedField,
    pressureField,
    bmiField,
    ageField,
    neckField,
    genderField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(stopBangCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const s = inputs.snoring === true ? 1 : 0;
    const t = inputs.tired === true ? 1 : 0;
    const o = inputs.observed === true ? 1 : 0;
    const p = inputs.pressure === true ? 1 : 0;
    const b = inputs.bmi35 === true ? 1 : 0;
    const a = inputs.age50 === true ? 1 : 0;
    const n = inputs.neck40 === true ? 1 : 0;
    const g = inputs.male === true ? 1 : 0;

    const stopScore = s + t + o + p;
    const total = stopScore + b + a + n + g;

    // Chung et al. Chest 2016: score 3-4 with >=2 STOP items + (male OR BMI>35 OR neck>40) upgrades to high risk
    const upgradedIntermediateToHigh =
      total >= 3 && total <= 4 && stopScore >= 2 && (g === 1 || b === 1 || n === 1);

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (total <= 2) {
      severity = 'low';
      riskClassification = `Riesgo bajo de SAOS (${total} / 8 puntos)`;
      clinicalInterpretation =
        'Baja probabilidad de síndrome de apnea obstructiva del sueño moderado o grave.';
      guidance = [
        'Si persiste sospecha clínica o somnolencia diurna marcada (Epworth ≥ 11), reevaluar causas alternativas o seguimiento en consulta.',
      ];
    } else if (total <= 4 && !upgradedIntermediateToHigh) {
      severity = 'moderate';
      riskClassification = `Riesgo intermedio de SAOS (${total} / 8 puntos)`;
      clinicalInterpretation =
        'Probabilidad intermedia de SAOS moderado a grave; requiere correlación con síntomas diurnos y comorbilidades.';
      guidance = [
        'Aplicar la Escala de Somnolencia de Epworth y explorar factores de riesgo cardiovascular o quirúrgico para decidir estudio de sueño.',
      ];
    } else {
      severity = 'high';
      riskClassification = upgradedIntermediateToHigh
        ? `Riesgo alto de SAOS (${total} / 8 pts · reclasificado por STOP ≥ 2 + factor Bang)`
        : `Riesgo alto de SAOS (${total} / 8 puntos)`;
      clinicalInterpretation = upgradedIntermediateToHigh
        ? 'Según el algoritmo de dos pasos de Chung (2016), ≥ 2 criterios STOP combinados con sexo masculino, IMC > 35 o cuello > 40 cm confieren riesgo alto de SAOS moderado-grave.'
        : 'Alta probabilidad de SAOS moderado a grave (IAH ≥ 15 eventos/h).';
      guidance = [
        'Derivar para estudio objetivo del sueño (polisomnografía o poligrafía respiratoria) según disponibilidad clínica.',
        'En contexto preoperatorio, alertar al equipo de anestesiología para vigilancia respiratoria posoperatoria.',
      ];
    }

    const activeItems: string[] = [];
    if (s) activeItems.push('S');
    if (t) activeItems.push('T');
    if (o) activeItems.push('O');
    if (p) activeItems.push('P');
    if (b) activeItems.push('B');
    if (a) activeItems.push('A');
    if (n) activeItems.push('N');
    if (g) activeItems.push('G');

    return {
      primaryResult: {
        label: 'Puntuación STOP-BANG',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 8)',
      },
      secondaryResults: [
        {
          label: 'Subpuntuación STOP (síntomas + HTA)',
          formattedValue: `${stopScore} / 4`,
          unit: 'pts',
        },
        {
          label: 'Criterio Chung 2016 (STOP ≥ 2 + varón/IMC>35/cuello>40)',
          formattedValue: upgradedIntermediateToHigh ? 'Cumplido (riesgo alto)' : 'No aplica',
          unit: '',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer:
        'Herramienta de cribado; el diagnóstico definitivo requiere estudio objetivo del sueño.',
      formulaUsed: 'Suma dicotómica de 8 criterios (S-T-O-P-B-A-N-G) + regla Chung 2016',
      inputsSummary:
        activeItems.length > 0
          ? `Criterios (${total}/8): ${activeItems.join(', ')}`
          : '0 de 8 criterios positivos',
    };
  },
};
