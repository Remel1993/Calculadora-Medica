import { getCanonicalNumberValue, validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SeverityLevel,
} from '../types/clinical.ts';

function makeDomainField(
  id: string,
  label: string,
  max: number,
  helpText: string,
): NumberFieldDef {
  return {
    id,
    label,
    type: 'number',
    canonicalUnit: 'puntos',
    units: [{ id: 'pts', label: `pts (0–${max})`, toCanonical: (v) => v, max }],
    defaultUnitId: 'pts',
    defaultValue: '0',
    min: 0,
    max,
    placeholder: String(max),
    helpText,
  };
}

const visuospatialField = makeDomainField(
  'visuospatial',
  '1. Visuoespacial / Ejecutiva (0–5 pts)',
  5,
  'Trazo alternante 1-A-2-B-3-C-4-D-5-E (1 pt) + Cubo (1 pt) + Reloj: contorno, números, manecillas 11:10 (3 pts).',
);

const namingField = makeDomainField(
  'naming',
  '2. Identificación / Denominación (0–3 pts)',
  3,
  'Denominación de los 3 animales ilustrados (león, rinoceronte, camello).',
);

const attentionField = makeDomainField(
  'attention',
  '3. Atención (0–6 pts)',
  6,
  'Dígitos directo e inverso (2 pts) + Vigilancia de letra A (1 pt) + Restas seriadas 100−7 cinco veces (0–3 pts).',
);

const languageField = makeDomainField(
  'language',
  '4. Lenguaje (0–3 pts)',
  3,
  'Repetición exacta de 2 frases (2 pts) + Fluidez fonémica ≥ 11 palabras en 1 minuto (1 pt).',
);

const abstractionField = makeDomainField(
  'abstraction',
  '5. Abstracción (0–2 pts)',
  2,
  'Semejanza categorial de 2 pares de conceptos (tren-bicicleta, reloj-regla).',
);

const recallField = makeDomainField(
  'recall',
  '6. Recuerdo diferido sin pistas (0–5 pts)',
  5,
  'Solo puntúan las palabras recordadas espontáneamente sin pista categorial ni de elección múltiple.',
);

const orientationField = makeDomainField(
  'orientation',
  '7. Orientación (0–6 pts)',
  6,
  'Día del mes, mes, año, día de la semana, lugar y localidad/ciudad (1 pt c/u).',
);

const lowEducationField: BooleanFieldDef = {
  id: 'lowEducation',
  label: '¿Escolaridad total ≤ 12 años? (Sumar +1 punto si puntuación bruta < 30)',
  type: 'boolean',
  trueLabel: 'Sí (≤ 12 años: +1 pt)',
  falseLabel: 'No (> 12 años: 0 pts)',
  defaultValue: false,
};

export const mocaTestCalculator: CalculatorDefinition = {
  id: 'moca-test',
  name: 'Evaluación Cognitiva de Montreal (MoCA)',
  shortName: 'Test MoCA',
  primarySpecialty: 'neurologia',
  secondarySpecialties: ['geriatria', 'psiquiatria'],
  subcategory: 'diagnostico',
  keywords: [
    'moca',
    'montreal',
    'deterioro cognitivo',
    'demencia',
    'alzheimer',
    'neurologia',
    'cognitivo',
    'tamizaje',
  ],
  description:
    'Evaluación Cognitiva de Montreal (0–30 puntos) con guía didáctica paso a paso, láminas visuales vectoriales offline (trazo alternante, cubo, lienzo de reloj y animales) y ajuste automático por escolaridad (≤ 12 años).',
  clinicalIndication:
    'Tamizaje neurocognitivo en adultos con queja de memoria o sospecha de deterioro cognitivo leve (DCL), especialmente cuando el MMSE es normal pero persiste sospecha clínica.',
  validatedPopulation: 'Adultos y adultos mayores (Nasreddine et al., 2005; validado en español).',
  contraindications: [
    'No aplicar ni interpretar como demencia durante delirium agudo, depresión grave no tratada, intoxicación o déficit visual/auditivo severo no corregido.',
  ],
  limitations: [
    'Las láminas visuales integradas reproducen los estímulos estándar para administración clínica directa en consulta móvil sin internet; para certificación oficial o ensayos clínicos consultar mocacognition.com.',
    'En poblaciones con muy baja escolaridad (< 4–6 años) o analfabetismo existen versiones adaptadas (MoCA-B / Básico), ya que el punto de corte estándar ≥ 26 puede sobreestimar deterioro.',
  ],
  version: 'Nasreddine et al. (MoCA v8.1, 2005)',
  references: [
    {
      citation:
        'Nasreddine ZS, Phillips NA, Bédirian V, et al. The Montreal Cognitive Assessment, MoCA: a brief screening tool for mild cognitive impairment. J Am Geriatr Soc. 2005;53(4):695-699.',
      year: 2005,
    },
  ],
  fields: [
    visuospatialField,
    namingField,
    attentionField,
    languageField,
    abstractionField,
    recallField,
    orientationField,
    lowEducationField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(mocaTestCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const v = getCanonicalNumberValue(visuospatialField, inputs.visuospatial as NumberInputValue).canonicalValue!;
    const n = getCanonicalNumberValue(namingField, inputs.naming as NumberInputValue).canonicalValue!;
    const a = getCanonicalNumberValue(attentionField, inputs.attention as NumberInputValue).canonicalValue!;
    const l = getCanonicalNumberValue(languageField, inputs.language as NumberInputValue).canonicalValue!;
    const ab = getCanonicalNumberValue(abstractionField, inputs.abstraction as NumberInputValue).canonicalValue!;
    const r = getCanonicalNumberValue(recallField, inputs.recall as NumberInputValue).canonicalValue!;
    const o = getCanonicalNumberValue(orientationField, inputs.orientation as NumberInputValue).canonicalValue!;
    const lowEdu = inputs.lowEducation === true;

    const rawTotal = v + n + a + l + ab + r + o;
    const eduBonus = lowEdu && rawTotal < 30 ? 1 : 0;
    const finalScore = Math.min(30, rawTotal + eduBonus);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let interpretation = '';
    let guidance: string[] = [];

    if (finalScore >= 26) {
      severity = 'normal';
      riskClassification = `Desempeño cognitivo normal (${finalScore} / 30 puntos)`;
      interpretation =
        'Puntuación ≥ 26 puntos: dentro del rango normal esperado en el tamizaje MoCA.';
    } else if (finalScore >= 18) {
      severity = 'moderate';
      riskClassification = `Sospecha de Deterioro Cognitivo Leve / DCL (${finalScore} / 30 puntos)`;
      interpretation =
        'Puntuación 18–25 puntos: compatible con deterioro cognitivo leve (o estadio leve), según contexto funcional y escolaridad.';
      guidance = [
        'Evaluar actividades instrumentales de la vida diaria (Lawton-Brody), descartar causas reversibles (TSH, B12, folato, fármacos anticolinérgicos, depresión) y considerar estudio neuropsicológico.',
      ];
    } else if (finalScore >= 10) {
      severity = 'high';
      riskClassification = `Deterioro cognitivo moderado (${finalScore} / 30 puntos)`;
      interpretation =
        'Puntuación 10–17 puntos: compromiso cognitivo significativo de múltiples dominios.';
      guidance = [
        'Estudio etiológico completo (neuroimagen estructural, laboratorio metabólico), valoración de funcionalidad y red de cuidados.',
      ];
    } else {
      severity = 'critical';
      riskClassification = `Deterioro cognitivo grave (${finalScore} / 30 puntos)`;
      interpretation =
        'Puntuación < 10 puntos: deterioro cognitivo severo en la prueba de tamizaje.';
      guidance = [
        'Valoración integral por Neurología/Geriatría, evaluación de seguridad en el domicilio y apoyo al cuidador.',
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación Total MoCA',
        value: finalScore,
        formattedValue: String(finalScore),
        unit: 'puntos (de 30)',
      },
      secondaryResults: [
        {
          label: 'Suma bruta de dominios',
          formattedValue: String(rawTotal),
          unit: '/ 30 pts',
        },
        {
          label: 'Ajuste por escolaridad (≤ 12 años)',
          formattedValue: eduBonus > 0 ? '+1 punto aplicado' : '0 puntos',
          unit: '',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation: interpretation,
      guidance: guidance.length > 0 ? guidance : undefined,
      guidanceDisclaimer: 'Confirmar hallazgos considerando escolaridad real, estado anímico y funcionalidad previa.',
      formulaUsed: 'Suma de 7 dominios (máx. 30) + 1 punto si escolaridad ≤ 12 años y bruto < 30',
      inputsSummary: `Visuo:${v} · Denom:${n} · Aten:${a} · Leng:${l} · Abst:${ab} · Rec:${r} · Orien:${o}${eduBonus ? ' (+1 esc.)' : ''} = ${finalScore}/30`,
    };
  },
};
