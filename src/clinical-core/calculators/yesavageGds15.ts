import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SeverityLevel,
} from '../types/clinical.ts';

// Yesavage GDS-15: items 1, 5, 7, 11, 13 are reverse-scored (No = 1 pt; Yes = 0 pt)
const gdsItems: Array<BooleanFieldDef & { scoreOnTrue: boolean }> = [
  { id: 'q1', label: '1. ¿Está básicamente satisfecho(a) con su vida? (No = +1)', type: 'boolean', defaultValue: true, trueLabel: 'Sí (0)', falseLabel: 'No (+1)', scoreOnTrue: false },
  { id: 'q2', label: '2. ¿Ha abandonado muchas de sus actividades e intereses? (Sí = +1)', type: 'boolean', defaultValue: false, trueLabel: 'Sí (+1)', falseLabel: 'No (0)', scoreOnTrue: true },
  { id: 'q3', label: '3. ¿Siente que su vida está vacía? (Sí = +1)', type: 'boolean', defaultValue: false, trueLabel: 'Sí (+1)', falseLabel: 'No (0)', scoreOnTrue: true },
  { id: 'q4', label: '4. ¿Se aburre con frecuencia? (Sí = +1)', type: 'boolean', defaultValue: false, trueLabel: 'Sí (+1)', falseLabel: 'No (0)', scoreOnTrue: true },
  { id: 'q5', label: '5. ¿Está de buen humor la mayor parte del tiempo? (No = +1)', type: 'boolean', defaultValue: true, trueLabel: 'Sí (0)', falseLabel: 'No (+1)', scoreOnTrue: false },
  { id: 'q6', label: '6. ¿Tiene miedo de que algo malo le vaya a pasar? (Sí = +1)', type: 'boolean', defaultValue: false, trueLabel: 'Sí (+1)', falseLabel: 'No (0)', scoreOnTrue: true },
  { id: 'q7', label: '7. ¿Se siente feliz la mayor parte del tiempo? (No = +1)', type: 'boolean', defaultValue: true, trueLabel: 'Sí (0)', falseLabel: 'No (+1)', scoreOnTrue: false },
  { id: 'q8', label: '8. ¿Se siente con frecuencia desamparado(a) o indefenso(a)? (Sí = +1)', type: 'boolean', defaultValue: false, trueLabel: 'Sí (+1)', falseLabel: 'No (0)', scoreOnTrue: true },
  { id: 'q9', label: '9. ¿Prefiere quedarse en casa en lugar de salir y hacer cosas nuevas? (Sí = +1)', type: 'boolean', defaultValue: false, trueLabel: 'Sí (+1)', falseLabel: 'No (0)', scoreOnTrue: true },
  { id: 'q10', label: '10. ¿Cree que tiene más problemas de memoria que la mayoría de la gente? (Sí = +1)', type: 'boolean', defaultValue: false, trueLabel: 'Sí (+1)', falseLabel: 'No (0)', scoreOnTrue: true },
  { id: 'q11', label: '11. ¿Piensa que es maravilloso estar vivo(a) ahora? (No = +1)', type: 'boolean', defaultValue: true, trueLabel: 'Sí (0)', falseLabel: 'No (+1)', scoreOnTrue: false },
  { id: 'q12', label: '12. ¿Se siente bastante inútil en la situación en que está actualmente? (Sí = +1)', type: 'boolean', defaultValue: false, trueLabel: 'Sí (+1)', falseLabel: 'No (0)', scoreOnTrue: true },
  { id: 'q13', label: '13. ¿Se siente lleno(a) de energía? (No = +1)', type: 'boolean', defaultValue: true, trueLabel: 'Sí (0)', falseLabel: 'No (+1)', scoreOnTrue: false },
  { id: 'q14', label: '14. ¿Siente que su situación es desesperada / sin solución? (Sí = +1)', type: 'boolean', defaultValue: false, trueLabel: 'Sí (+1)', falseLabel: 'No (0)', scoreOnTrue: true },
  { id: 'q15', label: '15. ¿Cree que la mayoría de la gente está mejor que usted? (Sí = +1)', type: 'boolean', defaultValue: false, trueLabel: 'Sí (+1)', falseLabel: 'No (0)', scoreOnTrue: true },
];

export const yesavageGds15Calculator: CalculatorDefinition = {
  id: 'yesavage-gds15',
  name: 'Escala de Depresión Geriátrica de Yesavage (GDS-15)',
  shortName: 'Yesavage (GDS-15)',
  primarySpecialty: 'geriatria',
  secondarySpecialties: ['psiquiatria', 'medicina-interna'],
  subcategory: 'diagnostico',
  keywords: [
    'yesavage',
    'gds-15',
    'gds15',
    'depresion geriatrica',
    'anciano',
    'geriatria',
    'salud mental',
    'consulta externa',
  ],
  description:
    'Escala de cribado de depresión específica para adultos mayores (15 preguntas dicotómicas Sí/No, evitando síntomas somáticos ambiguos de la vejez).',
  clinicalIndication:
    'Tamizaje anual de depresión en consulta externa geriátrica, ante quejas de memoria ("pseudodemencia depresiva"), insomnio o pérdida funcional inexplicada.',
  validatedPopulation: 'Adultos mayores ≥ 65 años cognitivamente intactos o con deterioro cognitivo leve.',
  contraindications: [
    'Pierde fiabilidad en demencia moderada-grave (MMSE < 14–15 o incapacidad de comprender preguntas dicotómicas); en esos casos usar escala de Cornell para depresión en demencia.',
  ],
  limitations: [
    'Es un instrumento de tamizaje: una puntuación ≥ 5 requiere entrevista clínica (criterios DSM-5/CIE-11) y descartar duelo reciente, hipotiroidismo, déficit B12 o fármacos depresores.',
    'No incluye un ítem explícito de ideación suicida; explorar siempre riesgo autolítico si el cribado resulta positivo.',
  ],
  version: 'Sheikh & Yesavage GDS-15 (1986)',
  references: [
    {
      citation:
        'Sheikh JI, Yesavage JA. Geriatric Depression Scale (GDS): recent evidence and development of a shorter version. Clin Gerontol. 1986;5(1-2):165-173.',
      year: 1986,
    },
    {
      citation:
        'Martínez de la Iglesia J, Onís Vilches MC, Dueñas Herrero R, et al. Versión española del cuestionario de Yesavage abreviado (GDS) para el despistaje de depresión en mayores de 65 años. Medifam. 2002;12(10):620-630.',
      year: 2002,
    },
  ],
  fields: gdsItems,
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(yesavageGds15Calculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const total = gdsItems.reduce((sum, item) => {
      const val = Boolean(inputs[item.id]);
      const addsPoint = item.scoreOnTrue ? val : !val;
      return sum + (addsPoint ? 1 : 0);
    }, 0);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (total <= 4) {
      severity = 'normal';
      riskClassification = 'Normal / Sin síntomas depresivos significativos (0–4 pts)';
      clinicalInterpretation =
        'Resultado negativo para depresión geriátrica en el tamizaje actual.';
      guidance.push('Mantener cribado periódico en consulta externa o si aparecen cambios vitales/duelo.');
    } else if (total <= 8) {
      severity = 'moderate';
      riskClassification = 'Depresión leve / cribado positivo (5–8 pts)';
      clinicalInterpretation =
        'Síntomas depresivos leves sugestivos de depresión menor o episodio depresivo leve; merece confirmación clínica.';
      guidance.push(
        'Evaluar criterios diagnósticos clínicos, causas orgánicas (TSH, B12, folato, fármacos) e iniciar intervenciones psicosociales, activación conductual o seguimiento estrecho.',
      );
    } else if (total <= 11) {
      severity = 'high';
      riskClassification = 'Depresión moderada (9–11 pts)';
      clinicalInterpretation =
        'Alta probabilidad de episodio depresivo clínicamente relevante con afectación del bienestar y potencial impacto funcional.';
      guidance.push(
        'Explorar activamente ideación suicida o de desesperanza, realizar diagnóstico clínico y valorar psicoterapia y/o tratamiento antidepresivo seguro en el adulto mayor.',
      );
    } else {
      severity = 'critical';
      riskClassification = 'Depresión grave (12–15 pts)';
      clinicalInterpretation =
        'Puntuación altamente sugestiva de depresión mayor grave; alto riesgo de deterioro funcional, aislamiento y autolesión.';
      guidance.push(
        'Evaluación prioritaria del riesgo suicida (y soporte familiar/cuidador), valoración psiquiátrica/geriátrica y abordaje terapéutico estructurado.',
      );
    }

    return {
      primaryResult: {
        label: 'Yesavage GDS-15',
        value: total,
        formattedValue: `${total} / 15`,
        unit: 'puntos',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'Suma de 15 ítems (No = 1 en ítems 1, 5, 7, 11, 13; Sí = 1 en los demás)',
      inputsSummary: `GDS-15 ${total}/15 pts`,
    };
  },
};
