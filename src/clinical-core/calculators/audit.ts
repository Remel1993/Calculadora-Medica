import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const q1: SelectFieldDef = {
  id: 'q1',
  label: '1. ¿Con qué frecuencia consume alguna bebida alcohólica?',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Nunca', points: 0 },
    { value: '1', label: '1 — Una o menos veces al mes', points: 1 },
    { value: '2', label: '2 — De 2 a 4 veces al mes', points: 2 },
    { value: '3', label: '3 — De 2 a 3 veces a la semana', points: 3 },
    { value: '4', label: '4 — 4 o más veces a la semana', points: 4 },
  ],
};

const q2: SelectFieldDef = {
  id: 'q2',
  label: '2. ¿Cuántas consumiciones (bebidas estándar) suele tomar en un día de consumo normal?',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — 1 o 2 (o no bebe)', points: 0 },
    { value: '1', label: '1 — 3 o 4', points: 1 },
    { value: '2', label: '2 — 5 o 6', points: 2 },
    { value: '3', label: '3 — 7 a 9', points: 3 },
    { value: '4', label: '4 — 10 o más', points: 4 },
  ],
};

const FREQ_0_4 = [
  { value: '0', label: '0 — Nunca', points: 0 },
  { value: '1', label: '1 — Menos de una vez al mes', points: 1 },
  { value: '2', label: '2 — Mensualmente', points: 2 },
  { value: '3', label: '3 — Semanalmente', points: 3 },
  { value: '4', label: '4 — A diario o casi a diario', points: 4 },
];

const q3: SelectFieldDef = {
  id: 'q3',
  label: '3. ¿Con qué frecuencia toma 6 o más bebidas alcohólicas en un solo día?',
  type: 'select',
  defaultValue: '0',
  options: FREQ_0_4,
};

const q4: SelectFieldDef = {
  id: 'q4',
  label: '4. ¿Con qué frecuencia en el último año fue incapaz de parar de beber una vez había empezado?',
  type: 'select',
  defaultValue: '0',
  options: FREQ_0_4,
};

const q5: SelectFieldDef = {
  id: 'q5',
  label: '5. ¿Con qué frecuencia en el último año no pudo hacer lo que se esperaba de usted por haber bebido?',
  type: 'select',
  defaultValue: '0',
  options: FREQ_0_4,
};

const q6: SelectFieldDef = {
  id: 'q6',
  label: '6. ¿Con qué frecuencia en el último año necesitó beber en ayunas para recuperarse tras haber bebido mucho?',
  type: 'select',
  defaultValue: '0',
  options: FREQ_0_4,
};

const q7: SelectFieldDef = {
  id: 'q7',
  label: '7. ¿Con qué frecuencia en el último año tuvo remordimientos o sentimientos de culpa después de haber bebido?',
  type: 'select',
  defaultValue: '0',
  options: FREQ_0_4,
};

const q8: SelectFieldDef = {
  id: 'q8',
  label: '8. ¿Con qué frecuencia en el último año no pudo recordar lo que sucedió la noche anterior por haber bebido?',
  type: 'select',
  defaultValue: '0',
  options: FREQ_0_4,
};

const q9: SelectFieldDef = {
  id: 'q9',
  label: '9. ¿Usted o alguna otra persona ha resultado herido porque usted había bebido?',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — No', points: 0 },
    { value: '2', label: '2 — Sí, pero no en el curso del último año', points: 2 },
    { value: '4', label: '4 — Sí, en el último año', points: 4 },
  ],
};

const q10: SelectFieldDef = {
  id: 'q10',
  label: '10. ¿Algún familiar, amigo, médico o profesional sanitario ha mostrado preocupación por su consumo o sugerido dejarlo?',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — No', points: 0 },
    { value: '2', label: '2 — Sí, pero no en el curso del último año', points: 2 },
    { value: '4', label: '4 — Sí, en el último año', points: 4 },
  ],
};

export const auditCalculator: CalculatorDefinition = {
  id: 'audit',
  name: 'Cuestionario AUDIT (Consumo de Alcohol — OMS)',
  shortName: 'AUDIT (OMS)',
  primarySpecialty: 'psiquiatria',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'diagnostico',
  keywords: ['audit', 'alcohol', 'consumo', 'dependencia', 'oms', 'who', 'adicciones', 'babor'],
  description:
    'Test oficial de la OMS de 10 ítems (0–40 puntos) para identificar consumo de riesgo, consumo perjudicial y probable dependencia alcohólica.',
  clinicalIndication:
    'Tamizaje sistemático de trastornos por consumo de alcohol en atención primaria, consulta externa y hospitalización.',
  validatedPopulation: 'Adultos en atención primaria a nivel internacional (OMS / Babor et al.).',
  contraindications: [
    'No evalúa síntomas agudos de abstinencia (para abstinencia utilizar CIWA-Ar).',
  ],
  limitations: [
    'Las preguntas 9 y 10 solo puntúan 0, 2 o 4.',
    'En mujeres y adultos mayores ≥ 65 años algunos autores sugieren umbrales ligeramente menores (≥ 7 para consumo de riesgo).',
  ],
  version: 'OMS / Babor et al. (2001)',
  references: [
    {
      citation:
        'Babor TF, Higgins-Biddle JC, Saunders JB, Monteiro MG. AUDIT: The Alcohol Use Disorders Identification Test. Guidelines for Use in Primary Care. 2nd ed. World Health Organization; 2001.',
      year: 2001,
    },
  ],
  fields: [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(auditCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const vals = [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10].map((f) => Number(inputs[f.id]));
    const total = vals.reduce((a, b) => a + b, 0);
    const auditC = vals[0] + vals[1] + vals[2];

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (total <= 7) {
      severity = 'normal';
      riskClassification = `Zona I — Consumo de bajo riesgo (${total} / 40 puntos)`;
      clinicalInterpretation = 'Sin evidencia de consumo de riesgo ni trastorno por uso de alcohol.';
      guidance = ['Educación preventiva sobre límites de bajo riesgo (OMS).'];
    } else if (total <= 15) {
      severity = 'moderate';
      riskClassification = `Zona II — Consumo de riesgo (${total} / 40 puntos)`;
      clinicalInterpretation = 'Consumo por encima de los límites de bajo riesgo; riesgo de daño orgánico o accidentes.';
      guidance = ['Intervención breve motivacional y consejos estructurados para reducir el consumo (OMS).'];
    } else if (total <= 19) {
      severity = 'high';
      riskClassification = `Zona III — Consumo perjudicial (${total} / 40 puntos)`;
      clinicalInterpretation = 'Consumo asociado ya a consecuencias físicas, psicológicas o sociales.';
      guidance = [
        'Consejo médico breve intensivo, seguimiento periódico y evaluación de función hepática / comorbilidades.',
      ];
    } else {
      severity = 'critical';
      riskClassification = `Zona IV — Probable dependencia alcohólica (${total} / 40 puntos)`;
      clinicalInterpretation = 'Alta probabilidad de dependencia física o psicológica al alcohol.';
      guidance = [
        'Derivación especializada para diagnóstico formal y plan terapéutico; vigilar riesgo de síndrome de abstinencia al suspender el consumo (CIWA-Ar).',
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación AUDIT total',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 40)',
      },
      secondaryResults: [
        {
          label: 'Subescala AUDIT-C (ítems 1–3 de consumo)',
          formattedValue: `${auditC} / 12`,
          unit: 'pts',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'Suma de ítems 1–8 (0–4 pts) + ítems 9–10 (0, 2 o 4 pts)',
      inputsSummary: `AUDIT: ${total}/40 (AUDIT-C: ${auditC}/12)`,
    };
  },
};
