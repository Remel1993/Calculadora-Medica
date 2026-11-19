import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const consciousnessField: BooleanFieldDef = {
  id: 'alteredMental',
  label: 'Somnolencia, confusión o tórax silente (riesgo vital inminente)',
  helpText: 'Cualquier alteración del nivel de conciencia o ausencia de ruidos respiratorios por obstrucción extrema.',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
};

const speechField: SelectFieldDef = {
  id: 'speech',
  label: 'Capacidad para hablar y postura',
  type: 'select',
  defaultValue: 'sentences',
  options: [
    { value: 'sentences', label: 'Habla en frases; prefiere estar sentado' },
    { value: 'words', label: 'Habla con palabras sueltas; inclinado hacia adelante y agitado' },
  ],
};

const rrField: SelectFieldDef = {
  id: 'respRate',
  label: 'Frecuencia respiratoria y musculatura accesoria',
  type: 'select',
  defaultValue: 'lt30',
  options: [
    { value: 'lt30', label: 'FR aumentada pero ≤ 30 rpm, sin uso de músculos accesorios' },
    { value: 'gt30', label: 'FR > 30 rpm o uso evidente de músculos accesorios' },
  ],
};

const hrField: SelectFieldDef = {
  id: 'heartRate',
  label: 'Frecuencia cardíaca',
  type: 'select',
  defaultValue: '100_120',
  options: [
    { value: '100_120', label: '≤ 120 lpm (habitualmente 100–120 lpm)' },
    { value: 'gt120', label: '> 120 lpm' },
  ],
};

const spo2Field: SelectFieldDef = {
  id: 'spo2',
  label: 'Saturación periférica de oxígeno (SpO₂ aire ambiente)',
  type: 'select',
  defaultValue: '90_95',
  options: [
    { value: '90_95', label: '90 – 95 % (o > 95 %)' },
    { value: 'lt90', label: '< 90 %' },
  ],
};

const pefField: SelectFieldDef = {
  id: 'pef',
  label: 'Flujo espiratorio pico (PEF) respecto al predicho o mejor personal',
  type: 'select',
  defaultValue: 'gt50',
  options: [
    { value: 'gt50', label: '> 50 % (o no disponible en triaje inicial)' },
    { value: 'le50', label: '≤ 50 %' },
  ],
};

export const asthmaCrisisAdultCalculator: CalculatorDefinition = {
  id: 'asthma-crisis-adult',
  name: 'Gravedad de Crisis Asmática en Adultos (GINA)',
  shortName: 'Crisis Asma (GINA)',
  primarySpecialty: 'urgencias',
  secondarySpecialties: ['neumologia', 'medicina-interna'],
  subcategory: 'gravedad',
  keywords: [
    'asma',
    'crisis asmatica',
    'exacerbacion',
    'gina',
    'adulto',
    'pef',
    'status asmaticus',
    'broncoespasmo',
  ],
  description:
    'Clasificación clínica rápida de exacerbación aguda de asma en adultos y adolescentes según criterios GINA (Leve/Moderada, Grave o Riesgo vital inminente).',
  clinicalIndication:
    'Triaje de urgencias y consulta de atención inmediata en pacientes ≥ 12 años con agudización asmática.',
  validatedPopulation: 'Adultos y adolescentes ≥ 12 años con exacerbación aguda de asma.',
  contraindications: [
    'No esperar a medir PEF para iniciar tratamiento en pacientes graves o con signos de riesgo vital inminente.',
  ],
  limitations: [
    'La clasificación GINA agrupa las crisis leves y moderadas en una misma categoría de manejo inicial ambulatorio/urgencias.',
    'La presencia de un único criterio de gravedad (o de riesgo vital) clasifica el episodio en la categoría superior.',
    'Descartar diagnósticos alternativos (EPOC reagudizada, insuficiencia cardíaca, TEP, disfunción de cuerdas vocales, cuerpo extraño).',
  ],
  version: 'GINA (2024)',
  references: [
    {
      citation:
        'Global Initiative for Asthma (GINA). Global Strategy for Asthma Management and Prevention (Section: Management of Worsening Asthma and Exacerbations). Updated 2024.',
      year: 2024,
    },
  ],
  fields: [consciousnessField, speechField, rrField, hrField, spo2Field, pefField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(asthmaCrisisAdultCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const lifeThreatening = inputs.alteredMental === true;
    const severeFeatures: string[] = [];

    if (inputs.speech === 'words') severeFeatures.push('Habla palabras sueltas');
    if (inputs.respRate === 'gt30') severeFeatures.push('FR > 30 / musc. accesoria');
    if (inputs.heartRate === 'gt120') severeFeatures.push('FC > 120 lpm');
    if (inputs.spo2 === 'lt90') severeFeatures.push('SpO₂ < 90 %');
    if (inputs.pef === 'le50') severeFeatures.push('PEF ≤ 50 %');

    let tierValue = 1;
    let tierLabel = 'Leve a Moderada';
    let severity: SeverityLevel = 'moderate';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (lifeThreatening) {
      tierValue = 3;
      tierLabel = 'Riesgo vital inminente';
      severity = 'critical';
      riskClassification = 'Crisis asmática con riesgo vital inminente';
      clinicalInterpretation =
        'Presencia de somnolencia, confusión o tórax silente: alto riesgo de paro respiratorio e hipercapnia aguda.';
      guidance = [
        'Activar atención crítica / UCI de inmediato y preparar soporte ventilatorio avanzado si procede.',
        'Administrar oxígeno suplementario (objetivo SpO₂ 93–95 %), SABA + bromuro de ipratropio y corticoide IV sistémico sin demora.',
      ];
    } else if (severeFeatures.length > 0) {
      tierValue = 2;
      tierLabel = 'Grave';
      severity = 'high';
      riskClassification = `Crisis asmática grave (${severeFeatures.length} criterio${severeFeatures.length > 1 ? 's' : ''})`;
      clinicalInterpretation = `Presenta criterios GINA de gravedad (${severeFeatures.join(', ')}). Requiere manejo intensivo inmediato en urgencias.`;
      guidance = [
        'Oxigenoterapia controlada para mantener SpO₂ 93–95 % en adultos.',
        'SABA inhalado repetido + bromuro de ipratropio + corticoide sistémico precoz (oral o IV).',
        'Reevaluar clínica y SpO₂/PEF a los 60 minutos; considerar sulfato de magnesio IV si no responde.',
      ];
    } else {
      tierValue = 1;
      tierLabel = 'Leve a Moderada';
      severity = 'low';
      riskClassification = 'Crisis asmática leve a moderada';
      clinicalInterpretation =
        'Sin criterios de gravedad extrema ni signos de riesgo vital según GINA.';
      guidance = [
        'SABA repetido (p. ej., 4–10 inhalaciones con cámara cada 20 min durante la primera hora) + corticoide oral (prednisolona/prednisona) si respuesta incompleta o factores de riesgo.',
        'Reevaluar a la hora y confirmar plan de acción y seguimiento antes del alta.',
      ];
    }

    return {
      primaryResult: {
        label: 'Categoría de exacerbación (GINA)',
        value: tierValue,
        formattedValue: tierLabel,
        unit: '',
      },
      secondaryResults: [
        {
          label: 'Criterios de gravedad presentes',
          formattedValue: String(severeFeatures.length),
          unit: 'de 5',
          note: severeFeatures.length > 0 ? severeFeatures.join(' · ') : 'Ninguno',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer:
        'Un solo criterio de categoría superior clasifica toda la exacerbación en ese nivel de gravedad (GINA).',
      formulaUsed: 'Clasificación jerárquica GINA: Riesgo vital > Grave (≥ 1 criterio) > Leve/Moderada',
      inputsSummary: lifeThreatening
        ? 'Riesgo vital inminente (conciencia/tórax silente)'
        : severeFeatures.length > 0
          ? `Grave (${severeFeatures.join(', ')})`
          : 'Leve a moderada (0 criterios de gravedad)',
    };
  },
};
