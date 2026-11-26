import {
  getCanonicalNumberValue,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';
import { AGE_UNITS_YEARS } from '../units/converters.ts';

const ageField: NumberFieldDef = {
  id: 'age',
  label: 'Edad',
  type: 'number',
  canonicalUnit: 'años',
  units: AGE_UNITS_YEARS,
  defaultUnitId: 'years',
  min: 18,
  max: 115,
  placeholder: '62',
};

const sexField: SelectFieldDef = {
  id: 'sex',
  label: 'Sexo biológico',
  type: 'select',
  defaultValue: 'male',
  options: [
    { value: 'male', label: 'Masculino (Edad en puntos)' },
    { value: 'female', label: 'Femenino (Edad - 10 en puntos)' },
  ],
};

const boolFields: BooleanFieldDef[] = [
  { id: 'nursingHome', label: 'Residente en asilo / centro sociosanitario (+10)', type: 'boolean', defaultValue: false },
  { id: 'neoplastic', label: 'Enfermedad neoplásica activa (+30)', type: 'boolean', defaultValue: false },
  { id: 'liver', label: 'Hepatopatía crónica (+20)', type: 'boolean', defaultValue: false },
  { id: 'chf', label: 'Insuficiencia cardíaca congestiva (+10)', type: 'boolean', defaultValue: false },
  { id: 'cerebrovascular', label: 'Enfermedad cerebrovascular (+10)', type: 'boolean', defaultValue: false },
  { id: 'renal', label: 'Enfermedad renal crónica (+10)', type: 'boolean', defaultValue: false },
  { id: 'alteredMental', label: 'Alteración del estado mental (+20)', type: 'boolean', defaultValue: false },
  { id: 'rr30', label: 'Frecuencia respiratoria ≥ 30 rpm (+20)', type: 'boolean', defaultValue: false },
  { id: 'sbp90', label: 'Presión arterial sistólica < 90 mmHg (+20)', type: 'boolean', defaultValue: false },
  { id: 'tempExtreme', label: 'Temperatura < 35 °C o ≥ 40 °C (+15)', type: 'boolean', defaultValue: false },
  { id: 'hr125', label: 'Frecuencia cardíaca ≥ 125 lpm (+10)', type: 'boolean', defaultValue: false },
  { id: 'ph735', label: 'pH arterial < 7.35 (+30)', type: 'boolean', defaultValue: false },
  { id: 'bun30', label: 'BUN ≥ 30 mg/dL (Urea ≥ 64 mg/dL / ≥ 11 mmol/L) (+20)', type: 'boolean', defaultValue: false },
  { id: 'na130', label: 'Sodio sérico < 130 mEq/L (+20)', type: 'boolean', defaultValue: false },
  { id: 'glu250', label: 'Glucosa ≥ 250 mg/dL (≥ 14 mmol/L) (+10)', type: 'boolean', defaultValue: false },
  { id: 'hct30', label: 'Hematocrito < 30 % (+10)', type: 'boolean', defaultValue: false },
  { id: 'pao2_60', label: 'PaO₂ < 60 mmHg o SpO₂ < 90 % (+10)', type: 'boolean', defaultValue: false },
  { id: 'effusion', label: 'Derrame pleural en radiografía de tórax (+10)', type: 'boolean', defaultValue: false },
];

export const psiPortCalculator: CalculatorDefinition = {
  id: 'psi-port',
  name: 'Escala de Fine (PSI / PORT) — Índice de Gravedad de Neumonía',
  shortName: 'Escala de Fine (PSI)',
  primarySpecialty: 'neumologia',
  secondarySpecialties: ['infectologia', 'urgencias', 'medicina-interna'],
  subcategory: 'gravedad',
  keywords: [
    'fine',
    'escala de fine',
    'indice de fine',
    'psi',
    'port',
    'neumonia',
    'nac',
    'mortalidad',
    'hospitalizacion',
  ],
  description:
    'Escala de Fine (Pneumonia Severity Index / PORT): estratificación de mortalidad a 30 días en neumonía adquirida en la comunidad (20 variables clínicas, analíticas y radiográficas en Clases I–V).',
  clinicalIndication:
    'Identificación segura de pacientes de bajo riesgo (Clases I–II de Fine) candidatos a manejo ambulatorio en NAC (preferido sobre CURB-65 por guías ATS/IDSA 2019).',
  validatedPopulation: 'Adultos inmunocompetentes con neumonía adquirida en la comunidad.',
  requiredLabsNote: 'Requiere gasometría/oximetría, BUN, Na⁺, glucosa, hematocrito y radiografía de tórax para las Clases II–V.',
  contraindications: [
    'No utilizar en menores de 18 años ni en neumonía nosocomial o pacientes gravemente inmunodeprimidos.',
  ],
  limitations: [
    'La edad tiene un peso elevado, por lo que jóvenes con neumonía grave focalizada o hipoxemia pueden obtener puntuaciones engañosamente bajas si no se evalúa el cuadro completo.',
    'Las clases I–III no descartan necesidad de ingreso si existen vómitos incoercibles, hipoxemia, inestabilidad social o fracaso ambulatorio previo.',
  ],
  version: 'Fine MJ et al. (NEJM 1997)',
  references: [
    {
      citation:
        'Fine MJ, Auble TE, Yealy DM, et al. A prediction rule to identify low-risk patients with community-acquired pneumonia. N Engl J Med. 1997;336(4):243-250.',
      year: 1997,
    },
    {
      citation:
        'Metlay JP, Waterer GW, Long AC, et al. Diagnosis and Treatment of Adults with Community-acquired Pneumonia. Am J Respir Crit Care Med. 2019;200(7):e45-e67.',
      year: 2019,
    },
  ],
  fields: [ageField, sexField, ...boolFields],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(psiPortCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const age = getCanonicalNumberValue(ageField, inputs.age as NumberInputValue).canonicalValue!;
    const isFemale = inputs.sex === 'female';

    // Step 1: Class I screen (age <= 50, no comorbidities, normal vitals/mental status)
    const hasStep1Risk =
      age > 50 ||
      inputs.neoplastic === true ||
      inputs.liver === true ||
      inputs.chf === true ||
      inputs.cerebrovascular === true ||
      inputs.renal === true ||
      inputs.alteredMental === true ||
      inputs.rr30 === true ||
      inputs.sbp90 === true ||
      inputs.tempExtreme === true ||
      inputs.hr125 === true;

    if (!hasStep1Risk) {
      return {
        primaryResult: {
          label: 'Clase de Riesgo PSI / PORT',
          value: 0,
          formattedValue: 'Clase I',
          unit: 'criterio de tamizaje Paso 1',
        },
        secondaryResults: [
          {
            label: 'Mortalidad estimada a 30 días (Fine 1997)',
            formattedValue: '0.1 %',
            unit: 'Clase I',
          },
        ],
        severity: 'normal',
        riskClassification: 'Clase I — Riesgo muy bajo',
        clinicalInterpretation:
          'Cumple criterios de Paso 1 (≤ 50 años, sin comorbilidades ni alteración de signos vitales). Mortalidad a 30 días ≈ 0.1 %.',
        guidance: [
          'Candidato habitual a manejo ambulatorio si tolera vía oral, tiene SpO₂ adecuada y soporte domiciliario.',
        ],
        formulaUsed: 'Paso 1 Fine (1997): Edad ≤ 50 sin comorbilidades ni signos vitales alterados',
        inputsSummary: `Edad ${age} años · Sin comorbilidades ni alteración vital (Clase I)`,
      };
    }

    let score = isFemale ? age - 10 : age;
    const weights: Record<string, number> = {
      nursingHome: 10,
      neoplastic: 30,
      liver: 20,
      chf: 10,
      cerebrovascular: 10,
      renal: 10,
      alteredMental: 20,
      rr30: 20,
      sbp90: 20,
      tempExtreme: 15,
      hr125: 10,
      ph735: 30,
      bun30: 20,
      na130: 20,
      glu250: 10,
      hct30: 10,
      pao2_60: 10,
      effusion: 10,
    };

    for (const [id, pts] of Object.entries(weights)) {
      if (inputs[id] === true) score += pts;
    }

    let riskClass = 'Clase II';
    let mortality = '0.6 %';
    let severity: SeverityLevel = 'low';
    let guidance: string[] = [];

    if (score <= 70) {
      riskClass = 'Clase II';
      mortality = '0.6 %';
      severity = 'low';
      guidance = ['Riesgo bajo: considerar manejo ambulatorio salvo hipoxemia o barreras clínicas/sociales.'];
    } else if (score <= 90) {
      riskClass = 'Clase III';
      mortality = '0.9 – 2.8 %';
      severity = 'moderate';
      guidance = ['Riesgo moderado-bajo: valorar observación breve o ingreso corto según evolución y oximetría.'];
    } else if (score <= 130) {
      riskClass = 'Clase IV';
      mortality = '8.2 – 9.3 %';
      severity = 'high';
      guidance = ['Riesgo moderado-alto: hospitalización recomendada.'];
    } else {
      riskClass = 'Clase V';
      mortality = '27.0 – 29.2 %';
      severity = 'critical';
      guidance = ['Riesgo alto: hospitalización y valoración de ingreso a UCI según criterios ATS/IDSA.'];
    }

    return {
      primaryResult: {
        label: `Puntuación PSI / PORT (${riskClass})`,
        value: score,
        formattedValue: String(score),
        unit: 'puntos',
      },
      secondaryResults: [
        {
          label: 'Clase de Riesgo',
          formattedValue: riskClass,
          unit: '',
        },
        {
          label: 'Mortalidad estimada a 30 días (Fine 1997)',
          formattedValue: mortality,
          unit: '',
        },
      ],
      severity,
      riskClassification: `${riskClass} (${score} puntos)`,
      clinicalInterpretation: `Mortalidad a 30 días estimada en ${mortality} según la cohorte PORT.`,
      guidance,
      formulaUsed: 'Edad (M: edad; F: edad - 10) + Comorbilidades + Examen físico + Laboratorio/Rx',
      inputsSummary: `Edad ${age} (${isFemale ? 'F' : 'M'}) · Puntuación: ${score} (${riskClass})`,
    };
  },
};
