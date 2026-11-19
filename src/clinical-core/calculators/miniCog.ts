import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const recallField: SelectFieldDef = {
  id: 'wordRecall',
  label: '1. Recuerdo diferido de 3 palabras (después de dibujar el reloj)',
  type: 'select',
  defaultValue: '3',
  options: [
    { value: '0', label: '0 palabras recordadas', points: 0 },
    { value: '1', label: '1 palabra recordada', points: 1 },
    { value: '2', label: '2 palabras recordadas', points: 2 },
    { value: '3', label: '3 palabras recordadas', points: 3 },
  ],
};

const clockField: SelectFieldDef = {
  id: 'clockDraw',
  label: '2. Prueba del dibujo del reloj (colocar todos los números y manecillas en las 11:10)',
  type: 'select',
  defaultValue: '2',
  options: [
    {
      value: '2',
      label: 'Reloj normal (+2 pts)',
      description: 'Todos los números 1–12 en orden/posición correcta y manecillas marcando las 11:10.',
      points: 2,
    },
    {
      value: '0',
      label: 'Reloj anormal o incapaz de completarlo (0 pts)',
      description: 'Omisión/desorden de números o manecillas incorrectas.',
      points: 0,
    },
  ],
};

export const miniCogCalculator: CalculatorDefinition = {
  id: 'mini-cog',
  name: 'Mini-Cog (Tamizaje de Deterioro Cognitivo)',
  shortName: 'Mini-Cog',
  primarySpecialty: 'geriatria',
  secondarySpecialties: ['psiquiatria', 'neurologia', 'medicina-interna'],
  subcategory: 'diagnostico',
  keywords: ['mini-cog', 'minicog', 'demencia', 'deterioro cognitivo', 'alzheimer', 'geriatria', 'reloj'],
  description:
    'Prueba breve de tamizaje cognitivo (0–5 puntos) basada en recuerdo de 3 palabras y dibujo del reloj, libre de restricciones de copyright para uso clínico.',
  clinicalIndication:
    'Cribado rápido de deterioro cognitivo o demencia en adultos mayores durante consulta externa o valoración geriátrica.',
  validatedPopulation: 'Adultos mayores en atención primaria y comunidad (Borson et al., 2000).',
  contraindications: [
    'No es una prueba diagnóstica definitiva; no aplicar durante síndrome confusional agudo (delirium) o déficit visual/motor no corregido.',
  ],
  limitations: [
    'Aunque tiene menor sesgo educativo que otras escalas, el analfabetismo grave o barrera idiomática puede dificultar el dibujo del reloj.',
  ],
  version: 'Borson et al. (2000 / 2003)',
  references: [
    {
      citation:
        'Borson S, Scanlan J, Brush M, Vitaliano P, Dokmak A. The mini-cog: a cognitive "vital signs" measure for dementia screening in multi-lingual elderly. Int J Geriatr Psychiatry. 2000;15(11):1021-1027.',
      year: 2000,
    },
  ],
  fields: [recallField, clockField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(miniCogCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const recall = Number(inputs.wordRecall);
    const clock = Number(inputs.clockDraw);
    const total = recall + clock;
    const isPositive = total < 3;

    return {
      primaryResult: {
        label: 'Puntuación Mini-Cog',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 5)',
      },
      secondaryResults: [
        {
          label: 'Resultado del tamizaje (< 3 = positivo)',
          formattedValue: isPositive ? 'Positivo (sugiere deterioro)' : 'Negativo',
          unit: '',
        },
      ],
      severity: (isPositive ? 'high' : 'normal') as SeverityLevel,
      riskClassification: isPositive
        ? `Tamizaje positivo para deterioro cognitivo (${total} / 5 puntos)`
        : `Tamizaje negativo (${total} / 5 puntos)`,
      clinicalInterpretation: isPositive
        ? 'Puntuación < 3 sugiere alta probabilidad de deterioro cognitivo que amerita estudio diagnóstico formal.'
        : 'Puntuación ≥ 3 indica baja probabilidad de demencia manifiesta en el momento del cribado (no descarta deterioro cognitivo leve inicial si persiste queja subjetiva).',
      guidance: isPositive
        ? [
            'Completar evaluación neuropsicológica/clínica, entrevistar a informante cercano y descartar causas reversibles (B12, TSH, depresión, fármacos anticolinérgicos/benzodiacepinas).',
          ]
        : undefined,
      formulaUsed: 'Recuerdo de 3 palabras (0–3 pts) + Prueba del reloj (0 o 2 pts)',
      inputsSummary: `Palabras: ${recall}/3, Reloj: ${clock}/2 (Total: ${total}/5)`,
    };
  },
};
