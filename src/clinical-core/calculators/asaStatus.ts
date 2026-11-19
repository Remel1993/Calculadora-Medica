import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const asaClassField: SelectFieldDef = {
  id: 'asaClass',
  label: 'Clasificación ASA Physical Status (estado físico basal)',
  type: 'select',
  defaultValue: '1',
  options: [
    {
      value: '1',
      label: 'ASA I — Paciente sano normal',
      description: 'Sin enfermedad orgánica, fisiológica ni psiquiátrica; no fumador, consumo mínimo o nulo de alcohol.',
      points: 1,
    },
    {
      value: '2',
      label: 'ASA II — Enfermedad sistémica leve',
      description: 'Sin limitación funcional sustancial (ej. fumador, bebedor social, embarazo, obesidad IMC 30–39.9, HTA/DM bien controladas).',
      points: 2,
    },
    {
      value: '3',
      label: 'ASA III — Enfermedad sistémica grave',
      description: 'Limitación funcional sustancial (ej. DM/HTA mal controladas, EPOC, IMC ≥ 40, ERC en diálisis, IAM/ictus > 3 meses).',
      points: 3,
    },
    {
      value: '4',
      label: 'ASA IV — Enfermedad sistémica grave que amenaza constantemente la vida',
      description: 'Ej. IAM/ictus < 3 meses, isquemia cardíaca activa, disfunción valvular grave, sepsis, CID, SDRA o ERC terminal sin diálisis regular.',
      points: 4,
    },
    {
      value: '5',
      label: 'ASA V — Paciente moribundo que no se espera que sobreviva sin la cirugía',
      description: 'Ej. aneurisma aórtico roto, trauma masivo, hemorragia intracraneal con efecto de masa, fallo multiorgánico isquémico.',
      points: 5,
    },
    {
      value: '6',
      label: 'ASA VI — Paciente declarado en muerte encefálica para donación de órganos',
      description: 'Mantenimiento de perfusión orgánica con fines de procuración para trasplante.',
      points: 6,
    },
  ],
};

const emergencyField: BooleanFieldDef = {
  id: 'isEmergency',
  label: '¿Cirugía de emergencia / urgencia inmediata? (añade sufijo "E")',
  helpText: 'Se define emergencia cuando cualquier demora en el tratamiento incrementaría significativamente la amenaza a la vida o a una extremidad.',
  type: 'boolean',
  trueLabel: 'Emergencia (E)',
  falseLabel: 'Programada / Electiva',
  defaultValue: false,
};

const ROMAN: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
};

export const asaStatusCalculator: CalculatorDefinition = {
  id: 'asa',
  name: 'Clasificación ASA Physical Status (Riesgo Preoperatorio)',
  shortName: 'ASA Status',
  primarySpecialty: 'cirugia-general',
  secondarySpecialties: ['urgencias'],
  subcategory: 'diagnostico',
  keywords: ['asa', 'anestesia', 'preoperatorio', 'riesgo quirurgico', 'emergencia'],
  description:
    'Sistema universal de la American Society of Anesthesiologists para categorizar el estado físico fisiológico preoperatorio del paciente (ASA I–VI y modificador E).',
  clinicalIndication:
    'Valoración preanestésica y comunicación estandarizada del estado basal del paciente previo a un procedimiento quirúrgico o invasivo.',
  validatedPopulation: 'Población general (adultos, pediatría y obstetricia según ejemplos oficiales ASA 2020).',
  contraindications: [
    'No es por sí sola una calculadora de riesgo cardíaco específico ni de complejidad quirúrgica (para riesgo cardiovascular perioperatorio complementar con RCRI / índice de Lee o NSQIP).',
  ],
  limitations: [
    'Existe variabilidad moderada interobservador entre clases II y III.',
    'La clasificación ASA no incluye el riesgo intrínseco del procedimiento quirúrgico ni la experiencia técnica, aunque sí correlaciona con morbimortalidad global.',
  ],
  version: 'ASA House of Delegates (2014 / Ejemplos rev. 2020)',
  references: [
    {
      citation: 'American Society of Anesthesiologists. Statement on ASA Physical Status Classification System. Approved 2014, last amended December 13, 2020.',
      year: 2020,
    },
  ],
  fields: [asaClassField, emergencyField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(asaStatusCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const cls = Number(inputs.asaClass);
    const isE = inputs.isEmergency === true && cls < 6;
    const label = `ASA ${ROMAN[cls]}${isE ? 'E' : ''}`;

    const sevMap: Record<number, SeverityLevel> = {
      1: 'normal',
      2: 'low',
      3: 'moderate',
      4: 'high',
      5: 'critical',
      6: 'info',
    };

    const interpMap: Record<number, string> = {
      1: 'Estado físico óptimo sin comorbilidad sistémica.',
      2: 'Comorbilidad sistémica leve controlada; riesgo anestésico perioperatorio bajo.',
      3: 'Enfermedad sistémica grave con limitación funcional; requiere optimización preoperatoria cuando la urgencia lo permita.',
      4: 'Enfermedad sistémica descompensada o amenaza vital constante; alto riesgo perioperatorio.',
      5: 'Riesgo vital extremo e inminente sin intervención quirúrgica emergente.',
      6: 'Donante en muerte encefálica bajo soporte fisiológico.',
    };

    return {
      primaryResult: {
        label: 'Clasificación ASA',
        value: cls,
        formattedValue: label,
        unit: isE ? 'con modificador de emergencia' : 'programada / electiva',
      },
      severity: isE && cls >= 3 ? 'critical' : sevMap[cls] ?? 'info',
      riskClassification: `${label}${isE ? ' (Procedimiento de emergencia)' : ''}`,
      clinicalInterpretation: `${interpMap[cls]}${isE ? ' El modificador "E" indica aumento adicional del riesgo por imposibilidad de optimización electiva.' : ''}`,
      formulaUsed: 'Categoría fisiológica ASA I–VI + modificador de emergencia (E)',
      inputsSummary: `Clasificación asignada: ${label}`,
    };
  },
};
