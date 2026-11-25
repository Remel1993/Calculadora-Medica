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
  label: 'Disnea, capacidad para hablar y postura',
  type: 'select',
  defaultValue: 'paragraphs',
  options: [
    { value: 'paragraphs', label: 'Habla en párrafos completos; disnea solo al caminar; puede acostarse' },
    { value: 'sentences', label: 'Habla en frases; disnea al hablar; prefiere estar sentado' },
    { value: 'words', label: 'Habla con palabras sueltas; disnea en reposo; inclinado hacia adelante y agitado' },
  ],
};

const rrField: SelectFieldDef = {
  id: 'respRate',
  label: 'Frecuencia respiratoria y musculatura accesoria',
  type: 'select',
  defaultValue: 'lt20',
  options: [
    { value: 'lt20', label: 'FR normal o < 20 rpm, sin uso de músculos accesorios' },
    { value: '20_30', label: 'FR 20 – 30 rpm (uso leve/moderado de músculos accesorios)' },
    { value: 'gt30', label: 'FR > 30 rpm o uso evidente de músculos accesorios' },
  ],
};

const hrField: SelectFieldDef = {
  id: 'heartRate',
  label: 'Frecuencia cardíaca',
  type: 'select',
  defaultValue: 'lt100',
  options: [
    { value: 'lt100', label: '< 100 lpm' },
    { value: '100_120', label: '100 – 120 lpm' },
    { value: 'gt120', label: '> 120 lpm' },
  ],
};

const spo2Field: SelectFieldDef = {
  id: 'spo2',
  label: 'Saturación periférica de oxígeno (SpO₂ aire ambiente)',
  type: 'select',
  defaultValue: 'gt95',
  options: [
    { value: 'gt95', label: '> 95 %' },
    { value: '90_95', label: '90 – 95 %' },
    { value: 'lt90', label: '< 90 %' },
  ],
};

const pefField: SelectFieldDef = {
  id: 'pef',
  label: 'Flujo espiratorio pico (PEF / FEM) respecto al predicho o mejor personal',
  type: 'select',
  defaultValue: 'gt70',
  options: [
    { value: 'gt70', label: '> 70 % (o no medido si todos los demás signos son leves)' },
    { value: '51_70', label: '51 – 70 %' },
    { value: 'le50', label: '≤ 50 %' },
  ],
};

export const asthmaCrisisAdultCalculator: CalculatorDefinition = {
  id: 'asthma-crisis-adult',
  name: 'Gravedad de Crisis Asmática en Adultos (GEMA / GINA)',
  shortName: 'Crisis Asma (GEMA/GINA)',
  primarySpecialty: 'urgencias',
  secondarySpecialties: ['neumologia', 'medicina-interna'],
  subcategory: 'gravedad',
  keywords: [
    'asma',
    'crisis asmatica',
    'exacerbacion',
    'gina',
    'gema',
    'adulto',
    'pef',
    'status asmaticus',
    'broncoespasmo',
  ],
  description:
    'Clasificación clínica jerárquica de exacerbación aguda de asma en adultos y adolescentes en 4 categorías separadas: Leve, Moderada, Grave o Riesgo vital inminente.',
  clinicalIndication:
    'Triaje de urgencias y consulta de atención inmediata en pacientes ≥ 12 años con agudización asmática.',
  validatedPopulation: 'Adultos y adolescentes ≥ 12 años con exacerbación aguda de asma.',
  contraindications: [
    'No esperar a medir PEF para iniciar tratamiento en pacientes graves o con signos de riesgo vital inminente.',
  ],
  limitations: [
    'La presencia de un único criterio en una categoría superior clasifica todo el episodio en esa gravedad (regla jerárquica GEMA 5.4 / GINA 2024).',
    'Descartar diagnósticos alternativos (EPOC reagudizada, insuficiencia cardíaca, TEP, disfunción de cuerdas vocales, cuerpo extraño).',
  ],
  version: 'GEMA 5.4 / GINA (2024)',
  references: [
    {
      citation:
        'GEMA 5.4. Guía Española para el Manejo del Asma. Sociedad Española de Neumología y Cirugía Torácica (SEPAR), 2024.',
      year: 2024,
    },
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
    const moderateFeatures: string[] = [];

    if (inputs.speech === 'words') severeFeatures.push('Habla palabras sueltas');
    else if (inputs.speech === 'sentences') moderateFeatures.push('Habla en frases');

    if (inputs.respRate === 'gt30') severeFeatures.push('FR > 30 / musc. accesoria');
    else if (inputs.respRate === '20_30') moderateFeatures.push('FR 20–30 rpm');

    if (inputs.heartRate === 'gt120') severeFeatures.push('FC > 120 lpm');
    else if (inputs.heartRate === '100_120') moderateFeatures.push('FC 100–120 lpm');

    if (inputs.spo2 === 'lt90') severeFeatures.push('SpO₂ < 90 %');
    else if (inputs.spo2 === '90_95') moderateFeatures.push('SpO₂ 90–95 %');

    if (inputs.pef === 'le50') severeFeatures.push('PEF ≤ 50 %');
    else if (inputs.pef === '51_70') moderateFeatures.push('PEF 51–70 %');

    let tierValue = 1;
    let tierLabel = 'Leve';
    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (lifeThreatening) {
      tierValue = 4;
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
      tierValue = 3;
      tierLabel = 'Grave';
      severity = 'high';
      riskClassification = `Crisis asmática grave (${severeFeatures.length} criterio${severeFeatures.length > 1 ? 's' : ''})`;
      clinicalInterpretation = `Presenta criterios de gravedad (${severeFeatures.join(', ')}). Requiere manejo intensivo inmediato en urgencias.`;
      guidance = [
        'Oxigenoterapia controlada para mantener SpO₂ 93–95 % en adultos.',
        'SABA inhalado repetido + bromuro de ipratropio + corticoide sistémico precoz (oral o IV).',
        'Reevaluar clínica y SpO₂/PEF a los 60 minutos; considerar sulfato de magnesio IV si no responde.',
      ];
    } else if (moderateFeatures.length > 0) {
      tierValue = 2;
      tierLabel = 'Moderada';
      severity = 'moderate';
      riskClassification = `Crisis asmática moderada (${moderateFeatures.length} criterio${moderateFeatures.length > 1 ? 's' : ''})`;
      clinicalInterpretation = `Presenta criterios de crisis moderada (${moderateFeatures.join(', ')}) sin signos de gravedad extrema ni riesgo vital.`;
      guidance = [
        'SABA inhalado repetido (4–10 inhalaciones con cámara cada 20 min durante la primera hora) + corticoide oral sistémico precoz (prednisona/prednisolona 40–50 mg).',
        'Oxigenoterapia si SpO₂ < 93 % y reevaluación clínica + PEF a los 60 minutos antes de decidir alta u hospitalización.',
      ];
    } else {
      tierValue = 1;
      tierLabel = 'Leve';
      severity = 'low';
      riskClassification = 'Crisis asmática leve';
      clinicalInterpretation =
        'Crisis leve: paciente habla en párrafos, FC < 100 lpm, FR < 20 rpm, SpO₂ > 95 % y PEF > 70 %.';
      guidance = [
        'SABA inhalado (p. ej., 2–4 inhalaciones con cámara cada 20 min durante la primera hora según respuesta) y valorar corticoide oral corto solo si respuesta incompleta o alto riesgo de recaída.',
        'Confirmar técnica inhalatoria, tratamiento controlador con corticoide inhalado (GINA Track 1) y plan de acción antes del alta.',
      ];
    }

    return {
      primaryResult: {
        label: 'Categoría de crisis asmática',
        value: tierValue,
        formattedValue: tierLabel,
        unit: '',
      },
      secondaryResults: [
        {
          label: 'Criterios graves / moderados',
          formattedValue: `${severeFeatures.length} graves · ${moderateFeatures.length} mod.`,
          unit: '',
          note:
            severeFeatures.length > 0
              ? `Graves: ${severeFeatures.join(' · ')}`
              : moderateFeatures.length > 0
                ? `Moderados: ${moderateFeatures.join(' · ')}`
                : 'Todos los parámetros en rango leve',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer:
        'Un solo criterio de categoría superior clasifica toda la exacerbación en ese nivel de gravedad (GEMA 5.4 / GINA).',
      formulaUsed:
        'Clasificación jerárquica GEMA/GINA: Riesgo vital > Grave (≥ 1 criterio) > Moderada (≥ 1 criterio) > Leve',
      inputsSummary: lifeThreatening
        ? 'Riesgo vital inminente (conciencia/tórax silente)'
        : severeFeatures.length > 0
          ? `Grave (${severeFeatures.join(', ')})`
          : moderateFeatures.length > 0
            ? `Moderada (${moderateFeatures.join(', ')})`
            : 'Leve (0 criterios moderados o graves)',
    };
  },
};
