import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const scaleField: SelectFieldDef = {
  id: 'scale',
  label: 'Escala de riesgo de caídas',
  type: 'select',
  defaultValue: 'morse',
  options: [
    { value: 'morse', label: 'Escala de Morse (Hospitalización)' },
    { value: 'downton', label: 'Escala de Downton (Geriátrica / Consulta)' },
  ],
};

// Morse Fall Scale (0-125)
const morseHistory: SelectFieldDef = {
  id: 'morseHistory',
  label: '1. Antecedente de caídas (últimos 3 meses)',
  type: 'select',
  defaultValue: '0',
  visibleWhen: (i) => i.scale !== 'downton',
  options: [
    { value: '0', label: 'No (0)', points: 0 },
    { value: '25', label: 'Sí (+25)', points: 25 },
  ],
};
const morseSecondaryDx: SelectFieldDef = {
  id: 'morseSecondaryDx',
  label: '2. Diagnóstico secundario (≥ 2 diagnósticos médicos)',
  type: 'select',
  defaultValue: '0',
  visibleWhen: (i) => i.scale !== 'downton',
  options: [
    { value: '0', label: 'No (0)', points: 0 },
    { value: '15', label: 'Sí (+15)', points: 15 },
  ],
};
const morseAid: SelectFieldDef = {
  id: 'morseAid',
  label: '3. Ayuda para deambular',
  type: 'select',
  defaultValue: '0',
  visibleWhen: (i) => i.scale !== 'downton',
  options: [
    { value: '0', label: 'Ninguna / reposo en cama / asistencia enfermería (0)', points: 0 },
    { value: '15', label: 'Muletas / bastón / andador (+15)', points: 15 },
    { value: '30', label: 'Se apoya en muebles o paredes (+30)', points: 30 },
  ],
};
const morseIv: SelectFieldDef = {
  id: 'morseIv',
  label: '4. Terapia intravenosa / catéter venoso salinizado o heparinizado',
  type: 'select',
  defaultValue: '0',
  visibleWhen: (i) => i.scale !== 'downton',
  options: [
    { value: '0', label: 'No (0)', points: 0 },
    { value: '20', label: 'Sí (+20)', points: 20 },
  ],
};
const morseGait: SelectFieldDef = {
  id: 'morseGait',
  label: '5. Marcha',
  type: 'select',
  defaultValue: '0',
  visibleWhen: (i) => i.scale !== 'downton',
  options: [
    { value: '0', label: 'Normal / reposo en cama / inmóvil (0)', points: 0 },
    { value: '10', label: 'Débil (pasos cortos, inclinación) (+10)', points: 10 },
    { value: '20', label: 'Alterada / inestable (dificultad para levantarse/balance) (+20)', points: 20 },
  ],
};
const morseMental: SelectFieldDef = {
  id: 'morseMental',
  label: '6. Estado mental',
  type: 'select',
  defaultValue: '0',
  visibleWhen: (i) => i.scale !== 'downton',
  options: [
    { value: '0', label: 'Orientado en sus propias capacidades (0)', points: 0 },
    { value: '15', label: 'Sobrestima capacidades / olvida limitaciones (+15)', points: 15 },
  ],
};

// Downton Fall Risk Index (0-11, >=3 high risk)
function makeDowntonBool(id: string, label: string): BooleanFieldDef {
  return {
    id,
    label,
    type: 'boolean',
    trueLabel: 'Sí (+1)',
    falseLabel: 'No (0)',
    defaultValue: false,
    visibleWhen: (i) => i.scale === 'downton',
  };
}

const dtFalls = makeDowntonBool('dtFalls', '1. Caídas previas');
const dtSedatives = makeDowntonBool('dtSedatives', '2a. Medicación: Tranquilizantes / sedantes');
const dtDiuretics = makeDowntonBool('dtDiuretics', '2b. Medicación: Diuréticos');
const dtHypotensives = makeDowntonBool('dtHypotensives', '2c. Medicación: Hipotensores (no diuréticos)');
const dtAntipark = makeDowntonBool('dtAntipark', '2d. Medicación: Antiparkinsonianos');
const dtAntidep = makeDowntonBool('dtAntidep', '2e. Medicación: Antidepresivos');
const dtVisual = makeDowntonBool('dtVisual', '3a. Déficit sensorial: Alteraciones visuales');
const dtAuditory = makeDowntonBool('dtAuditory', '3b. Déficit sensorial: Alteraciones auditivas');
const dtLimb = makeDowntonBool('dtLimb', '3c. Déficit sensorial/motor: Alteración en extremidades (ictus, neuropatía)');
const dtMental = makeDowntonBool('dtMental', '4. Estado mental: Confuso / desorientado');
const dtGait = makeDowntonBool('dtGait', '5. Deambulación: Segura con ayuda, insegura o imposible');

export const fallRiskCalculator: CalculatorDefinition = {
  id: 'fall-risk',
  name: 'Riesgo de Caídas — Escalas de Morse y Downton',
  shortName: 'Caídas (Morse / Downton)',
  primarySpecialty: 'geriatria',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'gravedad',
  keywords: ['morse', 'downton', 'caidas', 'geriatria', 'hospitalizacion', 'seguridad paciente'],
  description:
    'Evalúa el riesgo de caídas mediante la Escala de Morse (0–125 puntos en hospitalización) o el Índice de J.H. Downton (0–11 puntos en atención geriátrica y consulta).',
  clinicalIndication:
    'Prevención de caídas al ingreso hospitalario, en consulta geriátrica, tras cambios de medicación o tras una caída previa.',
  validatedPopulation: 'Adultos hospitalizados (Morse) y adultos mayores hospitalizados o comunitarios (Downton).',
  contraindications: [
    'No utilizar en pacientes pediátricos (emplear Humpty Dumpty u otra escala pediátrica).',
  ],
  limitations: [
    'La puntuación identifica factores modificables (medicación sedante/hipotensora, ayudas técnicas, calzado, iluminación), por lo que debe traducirse en intervenciones multifactoriales.',
  ],
  version: 'Morse (1989) & Downton (1993)',
  references: [
    {
      citation:
        'Morse JM, Morse RM, Tylko SJ. Development of a scale to identify the fall-prone patient. Can J Aging. 1989;8(4):366-377.',
      year: 1989,
    },
    {
      citation:
        'Downton JH. Falls in the Elderly. London: Edward Arnold; 1993:64-80.',
      year: 1993,
    },
  ],
  fields: [
    scaleField,
    morseHistory,
    morseSecondaryDx,
    morseAid,
    morseIv,
    morseGait,
    morseMental,
    dtFalls,
    dtSedatives,
    dtDiuretics,
    dtHypotensives,
    dtAntipark,
    dtAntidep,
    dtVisual,
    dtAuditory,
    dtLimb,
    dtMental,
    dtGait,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(fallRiskCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const isDownton = inputs.scale === 'downton';
    let total = 0;
    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (!isDownton) {
      total =
        Number(inputs.morseHistory) +
        Number(inputs.morseSecondaryDx) +
        Number(inputs.morseAid) +
        Number(inputs.morseIv) +
        Number(inputs.morseGait) +
        Number(inputs.morseMental);

      if (total < 25) {
        severity = 'low';
        riskClassification = `Riesgo bajo (Morse ${total} / 125)`;
        clinicalInterpretation = 'Riesgo bajo de caídas durante la estancia; mantener precauciones universales.';
        guidance = ['Cama en posición baja, timbre al alcance, iluminación adecuada y calzado antideslizante.'];
      } else if (total <= 44) {
        severity = 'moderate';
        riskClassification = `Riesgo moderado (Morse ${total} / 125)`;
        clinicalInterpretation = 'Riesgo moderado de caída intrahospitalaria; requiere medidas preventivas estándar.';
        guidance = ['Implementar protocolo estándar de prevención de caídas, asistencia en transferencias y revisión de vías/sujeciones.'];
      } else {
        severity = 'high';
        riskClassification = `Riesgo alto (Morse ${total} / 125 ≥ 45)`;
        clinicalInterpretation = 'Alto riesgo de caída con potencial lesión; requiere medidas preventivas intensivas.';
        guidance = [
          'Identificación visual de alto riesgo, asistencia obligatoria para deambulación/baño, revisión de fármacos sedantes/hipotensores y vigilancia frecuente.',
        ];
      }
    } else {
      const dtItems = [
        Boolean(inputs.dtFalls),
        Boolean(inputs.dtSedatives),
        Boolean(inputs.dtDiuretics),
        Boolean(inputs.dtHypotensives),
        Boolean(inputs.dtAntipark),
        Boolean(inputs.dtAntidep),
        Boolean(inputs.dtVisual),
        Boolean(inputs.dtAuditory),
        Boolean(inputs.dtLimb),
        Boolean(inputs.dtMental),
        Boolean(inputs.dtGait),
      ];
      total = dtItems.filter(Boolean).length;

      if (total < 3) {
        severity = 'low';
        riskClassification = `Riesgo bajo (Downton ${total} / 11 < 3)`;
        clinicalInterpretation = 'Menor de 3 puntos en el índice de Downton; riesgo bajo de caídas.';
        guidance = ['Fomentar ejercicio de equilibrio/fuerza y revisión periódica de visión y medicación.'];
      } else {
        severity = total >= 5 ? 'critical' : 'high';
        riskClassification = `Alto riesgo de caídas (Downton ${total} / 11 ≥ 3)`;
        clinicalInterpretation = 'Puntuación ≥ 3 en escala de Downton: alto riesgo de caídas que amerita intervención multifactorial.';
        guidance = [
          'Conciliación farmacológica (desprescribir benzodiacepinas/sedantes o ajustar hipotensores si hay ortostatismo), corrección visual/auditiva, fisioterapia y adaptación domiciliaria.',
        ];
      }
    }

    return {
      primaryResult: {
        label: isDownton ? 'Índice de Downton' : 'Escala de Morse',
        value: total,
        formattedValue: String(total),
        unit: isDownton ? 'puntos (de 11)' : 'puntos (de 125)',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'Reevaluar tras cambios clínicos, traslados de unidad, medicación nueva o episodio de caída.',
      formulaUsed: isDownton
        ? 'Downton: Suma de 11 factores binarios (corte ≥ 3 = alto riesgo)'
        : 'Morse: Suma de 6 ítems ponderados (0–125; ≥ 45 = alto riesgo)',
      inputsSummary: `${isDownton ? 'Downton' : 'Morse'}: ${total} puntos`,
    };
  },
};
