import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SeverityLevel,
} from '../types/clinical.ts';

function makeDn4(id: string, label: string): BooleanFieldDef {
  return {
    id,
    label,
    type: 'boolean',
    trueLabel: 'Sí (+1)',
    falseLabel: 'No (0)',
    defaultValue: false,
  };
}

const dn1 = makeDn4('q1', '1. [Entrevista] ¿El dolor tiene característica de quemazón / ardor?');
const dn2 = makeDn4('q2', '2. [Entrevista] ¿El dolor tiene característica de frío doloroso?');
const dn3 = makeDn4('q3', '3. [Entrevista] ¿El dolor tiene característica de descargas eléctricas?');
const dn4 = makeDn4('q4', '4. [Entrevista] ¿Se acompaña de hormigueo en la zona dolorosa?');
const dn5 = makeDn4('q5', '5. [Entrevista] ¿Se acompaña de sensación de pinchazos / alfileres?');
const dn6 = makeDn4('q6', '6. [Entrevista] ¿Se acompaña de entumecimiento / acorchamiento?');
const dn7 = makeDn4('q7', '7. [Entrevista] ¿Se acompaña de picor / prurito en la zona?');
const dn8 = makeDn4('q8', '8. [Examen físico] Hipoestesia al tacto (algodón) en la zona dolorosa');
const dn9 = makeDn4('q9', '9. [Examen físico] Hipoestesia al pinchazo en la zona dolorosa');
const dn10 = makeDn4('q10', '10. [Examen físico] Alodinia: dolor provocado o aumentado al cepillar suavemente');

export const dn4PainCalculator: CalculatorDefinition = {
  id: 'dn4-pain',
  name: 'Cuestionario DN4 (Dolor Neuropático)',
  shortName: 'DN4 (Dolor Neuropático)',
  primarySpecialty: 'neurologia',
  secondarySpecialties: ['traumatologia', 'medicina-interna', 'endocrinologia'],
  subcategory: 'diagnostico',
  keywords: ['dn4', 'dolor neuropatico', 'neuropatia diabetica', 'lumbociatalgia', 'alodinia', 'neuralgia'],
  description:
    'Instrumento clínico-exploratorio de 10 ítems (7 de entrevista + 3 de examen sensitivo) para diferenciar dolor con componente neuropático de dolor nociceptivo puro.',
  clinicalIndication:
    'Evaluación de lumbociatalgia, polineuropatía diabética, neuralgia postherpética, síndrome de túnel carpiano o dolor neuropático periférico/central.',
  validatedPopulation: 'Adultos con dolor crónico o subagudo localizado (≥ 3 meses en cohorte original; amplio uso clínico en consulta externa).',
  contraindications: [
    'Requiere examen sensitivo básico del territorio doloroso para completar los ítems 8–10.',
  ],
  limitations: [
    'Un puntaje ≥ 4/10 presenta sensibilidad ~83 % y especificidad ~90 % para dolor neuropático, pero no sustituye la demostración anatómica de lesión o enfermedad del sistema somatosensorial (criterios NeuPSIG).',
  ],
  version: 'Bouhassira et al. (Pain, 2005)',
  references: [
    {
      citation:
        'Bouhassira D, Attal N, Alchaar H, et al. Comparison of pain syndromes associated with nervous or somatic lesions and development of a new neuropathic pain diagnostic questionnaire (DN4). Pain. 2005;114(1-2):29-36.',
      year: 2005,
    },
  ],
  fields: [dn1, dn2, dn3, dn4, dn5, dn6, dn7, dn8, dn9, dn10],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(dn4PainCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const interviewPts =
      Number(Boolean(inputs.q1)) +
      Number(Boolean(inputs.q2)) +
      Number(Boolean(inputs.q3)) +
      Number(Boolean(inputs.q4)) +
      Number(Boolean(inputs.q5)) +
      Number(Boolean(inputs.q6)) +
      Number(Boolean(inputs.q7));
    const examPts =
      Number(Boolean(inputs.q8)) + Number(Boolean(inputs.q9)) + Number(Boolean(inputs.q10));
    const total = interviewPts + examPts;
    const positive = total >= 4;

    const severity: SeverityLevel = positive ? (total >= 7 ? 'high' : 'moderate') : 'low';

    return {
      primaryResult: {
        label: 'Puntuación DN4',
        value: total,
        formattedValue: `${total} / 10`,
        unit: positive ? '(Positivo ≥ 4)' : '(Negativo < 4)',
      },
      secondaryResults: [
        { label: 'Subescala entrevista (ítems 1–7)', formattedValue: String(interviewPts), unit: 'de 7' },
        { label: 'Subescala exploración física (ítems 8–10)', formattedValue: String(examPts), unit: 'de 3' },
      ],
      severity,
      riskClassification: positive
        ? `Probable dolor neuropático (DN4 = ${total} / 10 ≥ 4)`
        : `Dolor neuropático poco probable (DN4 = ${total} / 10 < 4)`,
      clinicalInterpretation: positive
        ? 'Cumple el punto de corte validado (≥ 4/10) sugerente de componente neuropático (sensibilidad ~83 %, especificidad ~90 %).'
        : 'Puntuación por debajo del punto de corte (4/10); orienta a dolor predominantemente nociceptivo o nociplástico, salvo sospecha clínica muy fuerte.',
      guidance: positive
        ? [
            'Investigar etiología somatosensorial (radiculopatía, polineuropatía metabólica, atrapamiento, postherpética) y valorar tratamiento específico de primera línea si procede.',
          ]
        : ['Evaluar mecanismos nociceptivos o musculoesqueléticos predominantes.'],
      guidanceDisclaimer: 'Cribado clínico; confirmar distribución neuroanatómica compatible.',
      formulaUsed: 'Suma de 10 ítems binarios (7 entrevista + 3 exploración; corte ≥ 4/10)',
      inputsSummary: `Entrevista: ${interviewPts}/7 · Exploración: ${examPts}/3 · Total: ${total}/10`,
    };
  },
};
