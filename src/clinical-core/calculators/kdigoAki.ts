import {
  formatClinicalNumber,
  getCanonicalNumberValue,
  roundClinical,
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
import { CREATININE_UNITS_MG_DL } from '../units/converters.ts';

const baselineCrField: NumberFieldDef = {
  id: 'baselineCr',
  label: 'Creatinina basal (últimos 7 días o 3 meses previos)',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: CREATININE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 0.2,
  max: 15,
  placeholder: '0.9',
};

const currentCrField: NumberFieldDef = {
  id: 'currentCr',
  label: 'Creatinina sérica actual',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: CREATININE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 0.2,
  max: 25,
  placeholder: '1.6',
};

const acute48hField: BooleanFieldDef = {
  id: 'acute48hRise',
  label: '¿El incremento ≥ 0.3 mg/dL ocurrió en ≤ 48 horas?',
  helpText:
    'El criterio de aumento absoluto ≥ 0.3 mg/dL (26.5 µmol/L) exige documentación dentro de una ventana de 48 horas.',
  type: 'boolean',
  trueLabel: 'Sí (≤ 48 h)',
  falseLabel: 'No / Desconocido',
  defaultValue: true,
};

const rrtField: BooleanFieldDef = {
  id: 'rrt',
  label: '¿Inicio de terapia de reemplazo renal (TRR / diálisis)?',
  type: 'boolean',
  trueLabel: 'Sí (Estadio 3)',
  falseLabel: 'No',
  defaultValue: false,
};

const urineOutputField: SelectFieldDef = {
  id: 'urineOutput',
  label: 'Criterio de gasto urinario (opcional / si está medido)',
  type: 'select',
  defaultValue: 'none',
  options: [
    { value: 'none', label: 'No evaluado / Normal (≥ 0.5 mL/kg/h)' },
    {
      value: 'stage1',
      label: 'Oliguria < 0.5 mL/kg/h durante 6 – 12 horas',
      description: 'Criterio KDIGO Estadio 1',
    },
    {
      value: 'stage2',
      label: 'Oliguria < 0.5 mL/kg/h durante ≥ 12 horas',
      description: 'Criterio KDIGO Estadio 2',
    },
    {
      value: 'stage3',
      label: '< 0.3 mL/kg/h durante ≥ 24 h o anuria ≥ 12 h',
      description: 'Criterio KDIGO Estadio 3',
    },
  ],
};

export const kdigoAkiCalculator: CalculatorDefinition = {
  id: 'kdigo-aki',
  name: 'Estadificación de Lesión Renal Aguda (KDIGO / AKIN)',
  shortName: 'KDIGO LRA',
  primarySpecialty: 'nefrologia',
  secondarySpecialties: ['urgencias', 'medicina-interna'],
  subcategory: 'diagnostico',
  keywords: [
    'kdigo',
    'akin',
    'lra',
    'ira',
    'aki',
    'lesion renal aguda',
    'oliguria',
    'creatinina',
    'anuria',
  ],
  description:
    'Clasificación diagnóstica y de gravedad de la lesión renal aguda según criterios unificados KDIGO 2012 (integra criterios de creatinina y diuresis).',
  clinicalIndication:
    'Detección y estadificación de lesión renal aguda (LRA) en hospitalización, urgencias y UCI.',
  validatedPopulation: 'Adultos (y criterios adaptados en pediatría excepto umbral absoluto ≥ 4.0 mg/dL, donde en < 18 años aplica TFGe < 35 mL/min/1.73 m²).',
  requiredLabsNote: 'Requiere creatinina actual y basal (o medición seriada en 48 h) y opcionalmente diuresis horaria.',
  contraindications: [
    'No utilizar para diagnosticar enfermedad renal crónica ni aplicar si no existe contexto temporal agudo (48 h o 7 días).',
  ],
  limitations: [
    'Unifica y reemplaza operativamente a RIFLE y AKIN (el Estadio 1 incluye el incremento ≥ 0.3 mg/dL en 48 h heredado de AKIN).',
    'Si los criterios de creatinina y diuresis corresponden a estadios distintos, KDIGO clasifica por el estadio más grave.',
    'La creatinina sérica es un marcador tardío: puede tardar 24–48 h en elevarse tras una caída abrupta del FG.',
  ],
  version: 'KDIGO AKI Guideline (2012)',
  references: [
    {
      citation:
        'Kidney Disease: Improving Global Outcomes (KDIGO) Acute Kidney Injury Work Group. KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl. 2012;2(1):1-138.',
      year: 2012,
    },
  ],
  fields: [baselineCrField, currentCrField, acute48hField, urineOutputField, rrtField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(kdigoAkiCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const baseRes = getCanonicalNumberValue(
      baselineCrField,
      inputs.baselineCr as NumberInputValue,
    );
    const currRes = getCanonicalNumberValue(
      currentCrField,
      inputs.currentCr as NumberInputValue,
    );
    const acute48h = inputs.acute48hRise === true;
    const rrt = inputs.rrt === true;
    const uo = inputs.urineOutput as string;

    const baseCr = baseRes.canonicalValue!;
    const currCr = currRes.canonicalValue!;
    const diff = currCr - baseCr;
    const ratio = currCr / baseCr;

    let crStage = 0;
    if (rrt || ratio >= 3.0 || (currCr >= 4.0 && (ratio >= 1.5 || (acute48h && diff >= 0.3)))) {
      crStage = 3;
    } else if (ratio >= 2.0) {
      crStage = 2;
    } else if (ratio >= 1.5 || (acute48h && diff >= 0.3)) {
      crStage = 1;
    }

    let uoStage = 0;
    if (uo === 'stage3') uoStage = 3;
    else if (uo === 'stage2') uoStage = 2;
    else if (uo === 'stage1') uoStage = 1;

    const finalStage = rrt ? 3 : Math.max(crStage, uoStage);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (finalStage === 0) {
      severity = 'normal';
      riskClassification = 'Sin criterios de LRA (KDIGO Estadio 0)';
      clinicalInterpretation =
        'Los valores introducidos no cumplen criterios de lesión renal aguda por creatinina ni diuresis.';
      guidance = [
        'Si existe sospecha clínica de daño renal incipiente, repetir creatinina y vigilar diuresis en las próximas 24–48 horas.',
      ];
    } else if (finalStage === 1) {
      severity = 'low';
      riskClassification = 'LRA Estadio 1 (KDIGO)';
      clinicalInterpretation =
        'Lesión renal aguda leve (incremento ≥ 0.3 mg/dL en 48 h, 1.5–1.9× basal o oliguria 6–12 h).';
      guidance = [
        'Revisar estado de volemia/perfusión, suspender nefrotóxicos evitables, ajustar dosis de fármacos y monitorizar creatinina y diuresis.',
      ];
    } else if (finalStage === 2) {
      severity = 'moderate';
      riskClassification = 'LRA Estadio 2 (KDIGO)';
      clinicalInterpretation =
        'Lesión renal aguda moderada (incremento 2.0–2.9× basal u oliguria ≥ 12 h). Mayor riesgo de progresión y complicaciones electrolíticas.';
      guidance = [
        'Evaluación etiológica activa (prerrenal, intrínseca, posrenal mediante ecografía si procede), vigilancia de potasio y equilibrio ácido-base.',
      ];
    } else {
      severity = 'critical';
      riskClassification = 'LRA Estadio 3 (KDIGO)';
      clinicalInterpretation =
        'Lesión renal aguda grave (≥ 3.0× basal, Cr ≥ 4.0 mg/dL con incremento agudo, oliguria/anuria grave o inicio de TRR).';
      guidance = [
        'Valoración prioritaria por Nefrología/Cuidados Críticos para estudio y evaluación de indicaciones urgentes de terapia de reemplazo renal.',
      ];
    }

    return {
      primaryResult: {
        label: 'Estadio KDIGO de LRA',
        value: finalStage,
        formattedValue: finalStage === 0 ? '0' : `Estadio ${finalStage}`,
        unit: 'KDIGO',
      },
      secondaryResults: [
        {
          label: 'Relación Cr actual / Cr basal',
          formattedValue: formatClinicalNumber(ratio, 2),
          unit: '× basal',
        },
        {
          label: 'Cambio absoluto de creatinina',
          formattedValue: `${diff >= 0 ? '+' : ''}${formatClinicalNumber(roundClinical(diff, 2), 2)}`,
          unit: 'mg/dL',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'Criterio diagnóstico estadificatorio; confirmar ventana temporal clínica de 48 h / 7 días.',
      formulaUsed: 'Máximo estadio entre criterio de Creatinina sérica (relativo/absoluto), Diuresis y TRR',
      inputsSummary: `Cr basal: ${baseRes.rawNumber} ${baseRes.unitLabel} · Cr actual: ${currRes.rawNumber} ${currRes.unitLabel} · Razón: ${ratio.toFixed(2)}×`,
    };
  },
};
