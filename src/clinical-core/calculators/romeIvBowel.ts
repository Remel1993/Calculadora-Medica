import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SecondaryResultItem,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const syndromeField: SelectFieldDef = {
  id: 'syndrome',
  label: 'Trastorno funcional intestinal a evaluar (Criterios de Roma IV)',
  type: 'select',
  defaultValue: 'ibs',
  options: [
    { value: 'ibs', label: 'Síndrome de Intestino Irritable (SII)' },
    { value: 'constipation', label: 'Estreñimiento Funcional (EF)' },
  ],
};

const chronicityField: BooleanFieldDef = {
  id: 'chronicity',
  label: '¿Inicio de los síntomas ≥ 6 meses antes y actividad en los últimos 3 meses?',
  type: 'boolean',
  defaultValue: true,
  trueLabel: 'Sí (≥ 6 m)',
  falseLabel: 'No (< 6 m)',
};

const alarmFlagsField: BooleanFieldDef = {
  id: 'alarmFlags',
  label: '¿Presenta algún signo de alarma (rectorragia, pérdida de peso, anemia, inicio ≥ 50 años, masa o historia familiar de CCR/EII)?',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Sí (Alarma)',
  falseLabel: 'No',
};

// IBS fields
const ibsPainFreqField: BooleanFieldDef = {
  id: 'ibsPainFreq',
  label: 'Dolor abdominal recurrente al menos 1 día/semana en los últimos 3 meses',
  type: 'boolean',
  defaultValue: true,
  trueLabel: 'Sí',
  falseLabel: 'No',
  visibleWhen: (inputs) => inputs.syndrome !== 'constipation',
};

const ibsDefecationField: BooleanFieldDef = {
  id: 'ibsDefecation',
  label: '1. Relacionado con la defecación (alivia o empeora)',
  type: 'boolean',
  defaultValue: true,
  trueLabel: 'Sí',
  falseLabel: 'No',
  visibleWhen: (inputs) => inputs.syndrome !== 'constipation',
};

const ibsFreqChangeField: BooleanFieldDef = {
  id: 'ibsFreqChange',
  label: '2. Asociado a un cambio en la frecuencia de las deposiciones',
  type: 'boolean',
  defaultValue: true,
  trueLabel: 'Sí',
  falseLabel: 'No',
  visibleWhen: (inputs) => inputs.syndrome !== 'constipation',
};

const ibsFormChangeField: BooleanFieldDef = {
  id: 'ibsFormChange',
  label: '3. Asociado a un cambio en la forma / consistencia de las heces (Bristol)',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Sí',
  falseLabel: 'No',
  visibleWhen: (inputs) => inputs.syndrome !== 'constipation',
};

// Functional Constipation fields (need >= 2 of 6 in >25% of defecations, not meeting IBS)
const fcStrainingField: BooleanFieldDef = {
  id: 'fcStraining',
  label: '1. Esfuerzo defecatorio excesivo en > 25% de las deposiciones',
  type: 'boolean',
  defaultValue: true,
  trueLabel: 'Sí',
  falseLabel: 'No',
  visibleWhen: (inputs) => inputs.syndrome === 'constipation',
};

const fcHardStoolsField: BooleanFieldDef = {
  id: 'fcHardStools',
  label: '2. Heces duras o caprinas (Bristol 1–2) en > 25% de las deposiciones',
  type: 'boolean',
  defaultValue: true,
  trueLabel: 'Sí',
  falseLabel: 'No',
  visibleWhen: (inputs) => inputs.syndrome === 'constipation',
};

const fcIncompleteField: BooleanFieldDef = {
  id: 'fcIncomplete',
  label: '3. Sensación de evacuación incompleta en > 25% de las deposiciones',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Sí',
  falseLabel: 'No',
  visibleWhen: (inputs) => inputs.syndrome === 'constipation',
};

const fcObstructionField: BooleanFieldDef = {
  id: 'fcObstruction',
  label: '4. Sensación de obstrucción/bloqueo anorrectal en > 25% de las deposiciones',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Sí',
  falseLabel: 'No',
  visibleWhen: (inputs) => inputs.syndrome === 'constipation',
};

const fcManualField: BooleanFieldDef = {
  id: 'fcManual',
  label: '5. Maniobras manuales para facilitar defecación en > 25% de los episodios',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Sí',
  falseLabel: 'No',
  visibleWhen: (inputs) => inputs.syndrome === 'constipation',
};

const fcLessThan3Field: BooleanFieldDef = {
  id: 'fcLessThan3',
  label: '6. Menos de 3 deposiciones espontáneas por semana',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Sí',
  falseLabel: 'No',
  visibleWhen: (inputs) => inputs.syndrome === 'constipation',
};

export const romeIvBowelCalculator: CalculatorDefinition = {
  id: 'rome-iv-bowel',
  name: 'Criterios de Roma IV — Síndrome de Intestino Irritable y Estreñimiento Funcional',
  shortName: 'Roma IV (SII / Estreñimiento)',
  primarySpecialty: 'gastroenterologia',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'diagnostico',
  keywords: [
    'roma iv',
    'rome iv',
    'sii',
    'colon irritable',
    'intestino irritable',
    'estrenimiento funcional',
    'gastroenterologia',
    'consulta externa',
  ],
  description:
    'Evalúa de forma estructurada los criterios diagnósticos positivos de Roma IV (2016) para Síndrome de Intestino Irritable (SII) y Estreñimiento Funcional junto con signos de alarma.',
  clinicalIndication:
    'Diagnóstico positivo en consulta externa de trastornos de la interacción intestino-cerebro evitando estudios invasivos innecesarios cuando no hay signos de alarma.',
  validatedPopulation: 'Adultos en atención primaria y gastroenterología ambulatoria.',
  contraindications: [
    'NO diagnosticar trastorno funcional sin estudiar primero signos de alarma (hemorragia digestiva, pérdida ponderal involuntaria, anemia ferropénica, fiebre, síntomas nocturnos o inicio > 50 años).',
  ],
  limitations: [
    'En SII con predominio de diarrea o mixto, las guías ACG/AGA recomiendan serología celíaca y calprotectina fecal/PCR para descartar enfermedad celíaca y enfermedad inflamatoria intestinal.',
    'En Estreñimiento Funcional, el diagnóstico excluye criterios de SII y estreñimiento secundario a fármacos (opioides, calcioantagonistas, hierro) o hipotiroidismo.',
  ],
  version: 'Criterios de Roma IV (Lacy et al., Gastroenterology 2016)',
  references: [
    {
      citation:
        'Lacy BE, Mearin F, Chang L, et al. Bowel Disorders. Gastroenterology. 2016;150(6):1393-1407.e5.',
      year: 2016,
    },
  ],
  fields: [
    syndromeField,
    chronicityField,
    alarmFlagsField,
    ibsPainFreqField,
    ibsDefecationField,
    ibsFreqChangeField,
    ibsFormChangeField,
    fcStrainingField,
    fcHardStoolsField,
    fcIncompleteField,
    fcObstructionField,
    fcManualField,
    fcLessThan3Field,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(romeIvBowelCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const isConstipation = inputs.syndrome === 'constipation';
    const chronic = Boolean(inputs.chronicity);
    const alarm = Boolean(inputs.alarmFlags);

    if (isConstipation) {
      const count =
        (inputs.fcStraining ? 1 : 0) +
        (inputs.fcHardStools ? 1 : 0) +
        (inputs.fcIncomplete ? 1 : 0) +
        (inputs.fcObstruction ? 1 : 0) +
        (inputs.fcManual ? 1 : 0) +
        (inputs.fcLessThan3 ? 1 : 0);

      const meetsCriteria = chronic && count >= 2 && !alarm;
      let severity: SeverityLevel = 'normal';
      let riskClassification = '';
      let clinicalInterpretation = '';
      const guidance: string[] = [];

      if (alarm) {
        severity = 'critical';
        riskClassification = 'Presencia de signos de alarma — Descartar causa orgánica';
        clinicalInterpretation =
          'Aunque cumpla síntomas compatibles con estreñimiento, la presencia de banderas rojas impide establecer diagnóstico funcional sin estudio etiológico.';
        guidance.push('Priorizar colonoscopia y estudio analítico según signo de alarma (anemia, rectorragia, pérdida de peso o edad ≥ 50 años sin cribado).');
      } else if (chronic && count >= 2) {
        severity = 'moderate';
        riskClassification = `Cumple Roma IV para Estreñimiento Funcional (${count}/6 criterios)`;
        clinicalInterpretation =
          'Cumple ≥ 2 de 6 síntomas de estreñimiento con cronicidad ≥ 6 meses y sin signos de alarma (asumiendo ausencia de criterios de SII y heces blandas raras sin laxantes).';
        guidance.push(
          'Revisar fármacos estreñidores (opioides, hierro, anticolinérgicos), optimizar fibra soluble gradual, hidratación y actividad física; valorar laxantes osmóticos (polietilenglicol) si persiste.',
        );
      } else {
        severity = 'low';
        riskClassification = `No cumple Roma IV completos para Estreñimiento Funcional (${count}/6)`;
        clinicalInterpretation = !chronic
          ? 'No cumple requisito temporal de Roma IV (inicio ≥ 6 meses y actividad últimos 3 meses).'
          : 'No alcanza el mínimo de 2 criterios en > 25% de las deposiciones.';
        guidance.push('Reevaluar evolución temporal y hábitos dietéticos/farmacológicos.');
      }

      return {
        primaryResult: {
          label: 'Roma IV — Estreñimiento Funcional',
          value: count,
          formattedValue: meetsCriteria ? 'Cumple Roma IV' : alarm ? 'Estudiar alarma' : 'No cumple',
          unit: `(${count}/6 ítems)`,
        },
        secondaryResults: [
          { label: 'Criterios presentes', formattedValue: `${count} / 6`, unit: '(umbral ≥ 2)' },
        ],
        severity,
        riskClassification,
        clinicalInterpretation,
        guidance,
        formulaUsed: 'Roma IV Estreñimiento Funcional: ≥ 2/6 criterios (>25% veces) + cronicidad ≥ 6 m + sin alarma',
        inputsSummary: `Estreñimiento ${count}/6 · ≥6m: ${chronic ? 'Sí' : 'No'} · Alarma: ${alarm ? 'Sí' : 'No'}`,
      };
    }

    const ibsPain = Boolean(inputs.ibsPainFreq);
    const ibsCriteriaCount =
      (inputs.ibsDefecation ? 1 : 0) +
      (inputs.ibsFreqChange ? 1 : 0) +
      (inputs.ibsFormChange ? 1 : 0);

    const meetsIbs = chronic && ibsPain && ibsCriteriaCount >= 2 && !alarm;
    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (alarm) {
      severity = 'critical';
      riskClassification = 'Signos de alarma presentes — No diagnosticar SII sin estudio orgánico';
      clinicalInterpretation =
        'Los criterios de Roma IV solo permiten diagnóstico positivo de SII en ausencia de signos de alarma; requiere descartar neoplasia colorrectal, EII o malabsorción.';
      guidance.push('Solicitar hemograma, ferritina, PCR/calprotectina fecal, serología celíaca y colonoscopia según edad/hallazgos.');
    } else if (chronic && ibsPain && ibsCriteriaCount >= 2) {
      severity = 'moderate';
      riskClassification = `Cumple criterios de Roma IV para SII (${ibsCriteriaCount}/3 criterios asociados)`;
      clinicalInterpretation =
        'Presenta dolor abdominal recurrente (≥ 1 día/semana) asociado a ≥ 2 criterios defecatorios con cronicidad ≥ 6 meses y sin signos de alarma.';
      guidance.push(
        'Clasificar subtipo según escala de Bristol (SII-E estreñimiento, SII-D diarrea, SII-M mixto); solicitar estudios mínimos guiados por subtipo (descartar celiaquía/EII en SII-D) e iniciar manejo sintomático y dietético (dieta baja en FODMAP supervisada si procede).',
      );
    } else {
      severity = 'low';
      riskClassification = `No cumple criterios de Roma IV para SII (${ibsCriteriaCount}/3)`;
      clinicalInterpretation =
        'No reúne la combinación completa de dolor recurrente ≥ 1 día/semana, ≥ 2 criterios asociados y cronicidad ≥ 6 meses.';
      guidance.push('Considerar dolor abdominal funcional, dispepsia funcional o estreñimiento funcional según síntoma predominante.');
    }

    const secondaryResults: SecondaryResultItem[] = [
      { label: 'Criterios asociados al dolor', formattedValue: `${ibsCriteriaCount} / 3`, unit: '(umbral ≥ 2)' },
    ];

    return {
      primaryResult: {
        label: 'Roma IV — SII',
        value: ibsCriteriaCount,
        formattedValue: meetsIbs ? 'Cumple Roma IV' : alarm ? 'Estudiar alarma' : 'No cumple',
        unit: `(${ibsCriteriaCount}/3 ítems)`,
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'Roma IV SII: Dolor ≥1 d/sem + ≥2/3 criterios defecatorios + ≥6 meses + sin alarma',
      inputsSummary: `SII dolor ≥1d/sem: ${ibsPain ? 'Sí' : 'No'} · Criterios ${ibsCriteriaCount}/3 · ≥6m: ${chronic ? 'Sí' : 'No'} · Alarma: ${alarm ? 'Sí' : 'No'}`,
    };
  },
};
