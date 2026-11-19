import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

function make07Field(id: string, label: string, helpText: string, labels: string[]): SelectFieldDef {
  return {
    id,
    label,
    helpText,
    type: 'select',
    defaultValue: '0',
    options: labels.map((text, idx) => ({
      value: String(idx),
      label: `${idx} — ${text}`,
      points: idx,
    })),
  };
}

const nauseaField = make07Field(
  'nausea',
  '1. Náuseas y vómitos',
  'Preguntar si siente náuseas o ha vomitado y observar.',
  [
    'Sin náuseas ni vómitos',
    'Náuseas leves sin vómitos',
    '2 (intermedio)',
    '3 (intermedio)',
    'Náuseas intermitentes con arcadas',
    '5 (intermedio)',
    '6 (intermedio)',
    'Náuseas constantes, arcadas frecuentes y vómitos',
  ],
);

const tremorField = make07Field(
  'tremor',
  '2. Temblor',
  'Observar con brazos extendidos y dedos separados.',
  [
    'Sin temblor',
    'No visible, pero perceptible en punta de los dedos',
    '2 (intermedio)',
    '3 (intermedio)',
    'Moderado con brazos extendidos',
    '5 (intermedio)',
    '6 (intermedio)',
    'Grave incluso con brazos sin extender',
  ],
);

const sweatsField = make07Field(
  'sweats',
  '3. Sudoración paroxística',
  'Observar palmas de las manos y frente.',
  [
    'Sin sudoración visible',
    'Apenas perceptible, palmas húmedas',
    '2 (intermedio)',
    '3 (intermedio)',
    'Gotas de sudor evidentes en la frente',
    '5 (intermedio)',
    '6 (intermedio)',
    'Sudoración profusa / empapado',
  ],
);

const anxietyField = make07Field(
  'anxiety',
  '4. Ansiedad',
  'Preguntar si se siente nervioso y observar actitud.',
  [
    'Sin ansiedad, tranquilo',
    'Ligeramente ansioso',
    '2 (intermedio)',
    '3 (intermedio)',
    'Moderadamente ansioso o en guardia',
    '5 (intermedio)',
    '6 (intermedio)',
    'Equivalente a estados de pánico agudo',
  ],
);

const agitationField = make07Field(
  'agitation',
  '5. Agitación',
  'Observación psicomotora.',
  [
    'Actividad normal',
    'Ligeramente mayor a lo normal',
    '2 (intermedio)',
    '3 (intermedio)',
    'Moderadamente inquieto / agitado',
    '5 (intermedio)',
    '6 (intermedio)',
    'Deambula constantemente o se agita de forma continua',
  ],
);

const tactileField = make07Field(
  'tactile',
  '6. Alteraciones táctiles',
  'Prurito, hormigueos, sensación de insectos en la piel.',
  [
    'Ninguna',
    'Muy leves (prurito/hormigueo ocasional)',
    'Leves',
    'Moderadas',
    'Alucinaciones táctiles moderadamente graves',
    'Alucinaciones táctiles graves',
    'Alucinaciones táctiles muy graves',
    'Alucinaciones táctiles continuas',
  ],
);

const auditoryField = make07Field(
  'auditory',
  '7. Alteraciones auditivas',
  'Hipersensibilidad al sonido o alucinaciones auditivas.',
  [
    'Ninguna',
    'Muy leve hipersensibilidad o molestia',
    'Leve',
    'Moderada',
    'Alucinaciones auditivas moderadamente graves',
    'Alucinaciones auditivas graves',
    'Alucinaciones auditivas muy graves',
    'Alucinaciones auditivas continuas',
  ],
);

const visualField = make07Field(
  'visual',
  '8. Alteraciones visuales',
  'Fotofobia o alucinaciones visuales.',
  [
    'Ninguna',
    'Muy leve sensibilidad visual',
    'Leve',
    'Moderada',
    'Alucinaciones visuales moderadamente graves',
    'Alucinaciones visuales graves',
    'Alucinaciones visuales muy graves',
    'Alucinaciones visuales continuas',
  ],
);

const headacheField = make07Field(
  'headache',
  '9. Cefalea / Plenitud cefálica',
  'No puntuar mareo aislado ni aturdimiento.',
  [
    'Ausente',
    'Muy leve',
    'Leve',
    'Moderada',
    'Moderadamente grave',
    'Grave',
    'Muy grave',
    'Extremadamente grave',
  ],
);

const orientationField: SelectFieldDef = {
  id: 'orientation',
  label: '10. Orientación y enturbiamiento del sensorio',
  helpText: 'Preguntar fecha, lugar, persona y realizar restas seriadas.',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 — Orientado y realiza restas seriadas', points: 0 },
    { value: '1', label: '1 — No puede hacer restas seriadas o duda en la fecha', points: 1 },
    { value: '2', label: '2 — Desorientado en fecha por ≤ 2 días', points: 2 },
    { value: '3', label: '3 — Desorientado en fecha por > 2 días', points: 3 },
    { value: '4', label: '4 — Desorientado en lugar y/o persona', points: 4 },
  ],
};

export const ciwaArCalculator: CalculatorDefinition = {
  id: 'ciwa-ar',
  name: 'Escala CIWA-Ar (Abstinencia Alcohólica)',
  shortName: 'CIWA-Ar',
  primarySpecialty: 'psiquiatria',
  secondarySpecialties: ['urgencias', 'medicina-interna'],
  subcategory: 'gravedad',
  keywords: ['ciwa-ar', 'ciwa', 'abstinencia', 'alcohol', 'delirium tremens', 'benzodiacepinas'],
  description:
    'Escala estándar de 10 ítems (0–67 puntos) para monitorizar la gravedad del síndrome de abstinencia alcohólica y guiar terapia dirigida por síntomas.',
  clinicalIndication:
    'Valoración y seguimiento horario/seriado de pacientes hospitalizados o en urgencias con síndrome de abstinencia alcohólica.',
  validatedPopulation: 'Adultos con abstinencia alcohólica sin delirium grave no comunicable.',
  contraindications: [
    'No es fiable en pacientes intubados, con sedación profunda, encefalopatía hepática avanzada o incapacidad para responder preguntas verbales.',
  ],
  limitations: [
    'Sus síntomas pueden superponerse con sepsis, hipoglucemia, trauma craneal o abstinencia a otros sedantes.',
    'La escala no reemplaza la profilaxis con tiamina ni la corrección de magnesio, potasio y glucosa.',
  ],
  version: 'Sullivan et al. (1989)',
  references: [
    {
      citation:
        'Sullivan JT, Sykora K, Schneiderman J, Naranjo CA, Sellers EM. Assessment of alcohol withdrawal: the revised clinical institute withdrawal assessment for alcohol scale (CIWA-Ar). Br J Addict. 1989;84(11):1353-1357.',
      year: 1989,
    },
  ],
  fields: [
    nauseaField,
    tremorField,
    sweatsField,
    anxietyField,
    agitationField,
    tactileField,
    auditoryField,
    visualField,
    headacheField,
    orientationField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(ciwaArCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const vals = [
      Number(inputs.nausea),
      Number(inputs.tremor),
      Number(inputs.sweats),
      Number(inputs.anxiety),
      Number(inputs.agitation),
      Number(inputs.tactile),
      Number(inputs.auditory),
      Number(inputs.visual),
      Number(inputs.headache),
      Number(inputs.orientation),
    ];
    const total = vals.reduce((a, b) => a + b, 0);

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (total <= 9) {
      severity = 'low';
      riskClassification = `Abstinencia leve / mínima (${total} / 67 puntos)`;
      clinicalInterpretation =
        'Síntomas leves (CIWA-Ar < 10); habitualmente no requiere benzodiacepinas salvo protocolo de dosis fija por riesgo previo.';
      guidance = [
        'Medidas de soporte, hidratación, tiamina (antes de soluciones glucosadas) y reevaluación clínica periódica.',
      ];
    } else if (total <= 18) {
      severity = 'moderate';
      riskClassification = `Abstinencia moderada (${total} / 67 puntos)`;
      clinicalInterpretation =
        'Abstinencia moderada (10–18 puntos); suele indicar necesidad de tratamiento farmacológico dirigido por síntomas.';
      guidance = [
        'Administrar benzodiacepina según protocolo institucional (diazepam/lorazepam) y reevaluar CIWA-Ar en 1 hora.',
      ];
    } else {
      severity = 'critical';
      riskClassification = `Abstinencia grave / Riesgo de delirium tremens (${total} / 67 puntos)`;
      clinicalInterpretation =
        'Abstinencia grave (≥ 19 puntos) con riesgo elevado de convulsiones y delirium tremens.';
      guidance = [
        'Tratamiento inmediato con benzodiacepinas IV tituladas según protocolo, monitorización continua, corrección hidroelectrolítica y tiamina parenteral.',
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación CIWA-Ar',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 67)',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer:
        'Asegurar administración de tiamina y descartar patología orgánica concomitante (infección, traumatismo, hepatopatía).',
      formulaUsed: 'Suma de 9 ítems (0–7 pts) + Orientación (0–4 pts)',
      inputsSummary: `CIWA-Ar: ${vals.join('+')} = ${total}/67`,
    };
  },
};
