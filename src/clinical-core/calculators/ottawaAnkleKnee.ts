import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const regionField: SelectFieldDef = {
  id: 'region',
  label: 'Región anatómica evaluada',
  type: 'select',
  defaultValue: 'ankle_foot',
  options: [
    { value: 'ankle_foot', label: 'Tobillo y/o Pie (Reglas de Ottawa)' },
    { value: 'knee', label: 'Rodilla (Regla de Ottawa)' },
  ],
};

// Tobillo y pie
const ankleZonePain: BooleanFieldDef = {
  id: 'anklePain',
  label: 'Dolor en zona maleolar + sensibilidad ósea en borde posterior (6 cm distales) o punta del maléolo lateral o medial',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.region !== 'knee',
};

const midfootZonePain: BooleanFieldDef = {
  id: 'midfootPain',
  label: 'Dolor en mediopié + sensibilidad ósea en base del 5.º metatarsiano o hueso navicular (escafoides)',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.region !== 'knee',
};

const ankleUnableSteps: BooleanFieldDef = {
  id: 'ankleUnableSteps',
  label: 'Incapacidad para dar 4 pasos (cargar peso en ambos pies) inmediatamente y en urgencias',
  type: 'boolean',
  trueLabel: 'Incapaz',
  falseLabel: 'Camina 4 pasos',
  defaultValue: false,
  visibleWhen: (i) => i.region !== 'knee',
};

// Rodilla
const kneeAge55: BooleanFieldDef = {
  id: 'kneeAge55',
  label: 'Edad ≥ 55 años',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.region === 'knee',
};

const kneePatella: BooleanFieldDef = {
  id: 'kneePatella',
  label: 'Sensibilidad ósea aislada en la rótula (sin otra sensibilidad ósea en la rodilla)',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.region === 'knee',
};

const kneeFibula: BooleanFieldDef = {
  id: 'kneeFibula',
  label: 'Sensibilidad ósea en la cabeza del peroné',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.region === 'knee',
};

const kneeFlex90: BooleanFieldDef = {
  id: 'kneeNoFlex90',
  label: 'Incapacidad para flexionar la rodilla a 90°',
  type: 'boolean',
  trueLabel: 'Incapaz',
  falseLabel: 'Flexiona ≥ 90°',
  defaultValue: false,
  visibleWhen: (i) => i.region === 'knee',
};

const kneeUnableSteps: BooleanFieldDef = {
  id: 'kneeUnableSteps',
  label: 'Incapacidad para dar 4 pasos inmediatamente tras el trauma y en urgencias (aunque cojee)',
  type: 'boolean',
  trueLabel: 'Incapaz',
  falseLabel: 'Camina 4 pasos',
  defaultValue: false,
  visibleWhen: (i) => i.region === 'knee',
};

export const ottawaAnkleKneeCalculator: CalculatorDefinition = {
  id: 'ottawa-ankle-knee',
  name: 'Reglas de Ottawa (Tobillo, Pie y Rodilla)',
  shortName: 'Reglas de Ottawa',
  primarySpecialty: 'traumatologia',
  secondarySpecialties: ['urgencias'],
  subcategory: 'diagnostico',
  keywords: ['ottawa', 'esguince', 'tobillo', 'pie', 'rodilla', 'radiografia', 'fractura', 'trauma'],
  description:
    'Reglas de decisión clínica altamente sensibles (~98–99 %) para determinar la necesidad de radiografías tras trauma agudo cerrado de tobillo, mediopié o rodilla.',
  clinicalIndication:
    'Traumatismo agudo no penetrante de tobillo, pie o rodilla en urgencias o atención primaria (primeros 10 días).',
  validatedPopulation: 'Adultos y niños ≥ 5 años colaboradores (en menores de 5 años o pacientes con déficit sensitivo disminuye fiabilidad).',
  contraindications: [
    'No aplicar en pacientes intoxicados, politraumatizados con lesiones distractoras graves, alteración del estado de alerta, embarazo o neuropatía periférica (pie diabético/Charcot).',
  ],
  limitations: [
    'Tienen sensibilidad cercana al 98–99 % para descartar fractura clínicamente significativa, pero especificidad moderada (una regla positiva indica radiografía, no confirma fractura).',
    'Si persiste dolor incapacitante tras 5–7 días pese a regla negativa inicial, reevaluar clínicamente.',
  ],
  version: 'Stiell et al. (1992 / 1995)',
  references: [
    {
      citation:
        'Stiell IG, Greenberg GH, McKnight RD, et al. Decision rules for the use of radiography in acute ankle injuries. Refinement and prospective validation. JAMA. 1993;269(9):1127-1132.',
      year: 1993,
    },
    {
      citation:
        'Stiell IG, Wells GA, Hoag RH, et al. Implementation of the Ottawa Knee Rule for the use of radiography in acute knee injuries. JAMA. 1997;278(23):2075-2079.',
      year: 1997,
    },
  ],
  fields: [
    regionField,
    ankleZonePain,
    midfootZonePain,
    ankleUnableSteps,
    kneeAge55,
    kneePatella,
    kneeFibula,
    kneeFlex90,
    kneeUnableSteps,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(ottawaAnkleKneeCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const isKnee = inputs.region === 'knee';
    let positives = 0;
    let xrayDetail = '';

    if (!isKnee) {
      const ankle = Boolean(inputs.anklePain);
      const midfoot = Boolean(inputs.midfootPain);
      const noSteps = Boolean(inputs.ankleUnableSteps);
      positives = Number(ankle) + Number(midfoot) + Number(noSteps);

      if (positives > 0) {
        const series: string[] = [];
        if (ankle || noSteps) series.push('Serie de tobillo');
        if (midfoot || noSteps) series.push('Serie de pie si hay dolor en mediopié o incapacidad para caminar');
        xrayDetail = series.join(' / ');
      }
    } else {
      const criteria = [
        Boolean(inputs.kneeAge55),
        Boolean(inputs.kneePatella),
        Boolean(inputs.kneeFibula),
        Boolean(inputs.kneeNoFlex90),
        Boolean(inputs.kneeUnableSteps),
      ];
      positives = criteria.filter(Boolean).length;
      if (positives > 0) {
        xrayDetail = 'Radiografía de rodilla indicada';
      }
    }

    const indicated = positives > 0;
    const severity: SeverityLevel = indicated ? 'moderate' : 'normal';
    const riskClassification = indicated
      ? `Radiografía indicada (${positives} criterio${positives > 1 ? 's' : ''} positivo${positives > 1 ? 's' : ''})`
      : 'Regla negativa — Radiografía NO indicada inicialmente';

    const clinicalInterpretation = indicated
      ? `Cumple criterios de Ottawa (${xrayDetail}); se justifica estudio radiográfico para descartar fractura clínicamente relevante.`
      : 'No cumple ninguno de los criterios de Ottawa; la probabilidad de fractura clínicamente significativa es < 1–2 % (sensibilidad ~98–99 %).';

    return {
      primaryResult: {
        label: isKnee ? 'Ottawa Rodilla' : 'Ottawa Tobillo / Pie',
        value: positives,
        formattedValue: indicated ? 'Solicitar Rx' : 'Sin Rx',
        unit: `${positives} criterio(s)`,
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: indicated
        ? [`Solicitar ${xrayDetail} y manejar inmovilización/analgesia según hallazgos.`]
        : ['Manejo conservador sintomático (analgesia, reposo relativo, elevación, reevaluación si no mejora en 5–7 días).'],
      guidanceDisclaimer: 'Aplicar solo en paciente alerta, colaborador y sin déficit sensitivo distal.',
      formulaUsed: isKnee
        ? 'Positiva si ≥ 1 de: Edad ≥ 55, rótula aislada, cabeza del peroné, flexión < 90° o < 4 pasos'
        : 'Positiva si sensibilidad en zona maleolar/mediopié o incapacidad para dar 4 pasos',
      inputsSummary: `${isKnee ? 'Rodilla' : 'Tobillo/Pie'} · Criterios positivos: ${positives}`,
    };
  },
};
