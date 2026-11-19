import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const consciousnessField: SelectFieldDef = {
  id: 'consciousness',
  label: '1. Nivel de conciencia',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Normal (incluye sueño) (0)', points: 0 },
    { value: '5', label: 'Desorientado / letárgico (+5)', points: 5 },
  ],
};

const cyanosisField: SelectFieldDef = {
  id: 'cyanosis',
  label: '2. Cianosis',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Ninguna (0)', points: 0 },
    { value: '4', label: 'Con la agitación (+4)', points: 4 },
    { value: '5', label: 'En reposo (+5)', points: 5 },
  ],
};

const stridorField: SelectFieldDef = {
  id: 'stridor',
  label: '3. Estridor inspiratorio',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Ninguno (0)', points: 0 },
    { value: '1', label: 'Con la agitación (+1)', points: 1 },
    { value: '2', label: 'En reposo (+2)', points: 2 },
  ],
};

const airEntryField: SelectFieldDef = {
  id: 'airEntry',
  label: '4. Entrada de aire',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Normal (0)', points: 0 },
    { value: '1', label: 'Disminuida (+1)', points: 1 },
    { value: '2', label: 'Marcadamente disminuida (+2)', points: 2 },
  ],
};

const retractionsField: SelectFieldDef = {
  id: 'retractions',
  label: '5. Tiraje / retracciones',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Ninguno (0)', points: 0 },
    { value: '1', label: 'Leves (+1)', points: 1 },
    { value: '2', label: 'Moderadas (+2)', points: 2 },
    { value: '3', label: 'Graves (+3)', points: 3 },
  ],
};

export const westleyCroupCalculator: CalculatorDefinition = {
  id: 'westley-croup',
  name: 'Escala de Westley (Laringotraqueobronquitis / Crup)',
  shortName: 'Westley (Crup)',
  primarySpecialty: 'pediatria',
  secondarySpecialties: ['urgencias'],
  subcategory: 'gravedad',
  keywords: ['westley', 'crup', 'laringotraqueobronquitis', 'estridor', 'pediatria', 'dexametasona', 'adrenalina'],
  description:
    'Escala clínica de 5 parámetros (0–17 puntos) para graduar la gravedad de la obstrucción de vía aérea superior en el crup infantil y orientar el manejo inicial.',
  clinicalIndication:
    'Evaluación inicial y respuesta al tratamiento en niños con sospecha clínica de laringotraqueobronquitis aguda (tos perruna, disfonía, estridor).',
  validatedPopulation: 'Pacientes pediátricos (típicamente de 6 meses a 6 años).',
  contraindications: [
    'Descartar causas graves de estridor agudo como epiglotitis, traqueítis bacteriana, cuerpo extraño o absceso retrofaríngeo antes de asumir crup viral.',
  ],
  limitations: [
    'Evaluar idealmente con el niño tranquilo; el llanto intenso puede elevar transitoriamente el estridor y las retracciones.',
    'La saturación de oxígeno puede mantenerse normal hasta estadios avanzados de fatiga respiratoria.',
  ],
  version: 'Westley et al. (1978)',
  references: [
    {
      citation:
        'Westley CR, Cotton EK, Brooks JG. Nebulized racemic epinephrine by IPPB for the treatment of croup: a double-blind study. Am J Dis Child. 1978;132(5):484-487.',
      year: 1978,
    },
  ],
  fields: [consciousnessField, cyanosisField, stridorField, airEntryField, retractionsField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(westleyCroupCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const total =
      Number(inputs.consciousness) +
      Number(inputs.cyanosis) +
      Number(inputs.stridor) +
      Number(inputs.airEntry) +
      Number(inputs.retractions);

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (total <= 2) {
      severity = 'low';
      riskClassification = `Crup leve (${total} / 17 puntos)`;
      clinicalInterpretation = 'Obstrucción leve sin estridor en reposo ni hipoxemia.';
      guidance = [
        'Dexametasona dosis única oral (habitualmente 0.15–0.6 mg/kg, máx. 10–16 mg según guía local), ambiente tranquilo e hidratación.',
        'Egreso con pautas claras de signos de alarma si mantiene buena tolerancia.',
      ];
    } else if (total <= 7) {
      severity = 'moderate';
      riskClassification = `Crup moderado (${total} / 17 puntos)`;
      clinicalInterpretation = 'Obstrucción moderada (habitualmente con estridor en reposo y tiraje leve-moderado).';
      guidance = [
        'Dexametasona sistémica (0.6 mg/kg VO/IM/IV) + valorar adrenalina nebulizada si presenta dificultad respiratoria persistente o estridor marcado en reposo.',
        'Observar al menos 2–4 horas tras adrenalina nebulizada para vigilar efecto rebote.',
      ];
    } else if (total <= 11) {
      severity = 'high';
      riskClassification = `Crup grave (${total} / 17 puntos)`;
      clinicalInterpretation = 'Compromiso significativo de la vía aérea superior con alto esfuerzo respiratorio.';
      guidance = [
        'Adrenalina nebulizada inmediata + dexametasona (0.6 mg/kg) + oxígeno suplementario si SpO₂ < 92 %.',
        'Observación hospitalaria estrecha / valoración de ingreso por riesgo de agotamiento.',
      ];
    } else {
      severity = 'critical';
      riskClassification = `Falla respiratoria inminente (${total} / 17 puntos)`;
      clinicalInterpretation = 'Obstrucción crítica con cianosis y/o alteración del estado mental.';
      guidance = [
        'Emergencia médica: adrenalina nebulizada continua/repetida, corticoide parenteral, oxigenación y preparación inmediata para manejo avanzado de vía aérea.',
      ];
    }

    return {
      primaryResult: {
        label: 'Escala de Westley',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 17)',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'Confirmar dosis por peso y descartar diagnósticos diferenciales de estridor agudo.',
      formulaUsed: 'Conciencia (0,5) + Cianosis (0,4,5) + Estridor (0–2) + Entrada aire (0–2) + Tiraje (0–3)',
      inputsSummary: `Westley: Conciencia(${inputs.consciousness}) + Cianosis(${inputs.cyanosis}) + Estridor(${inputs.stridor}) + Aire(${inputs.airEntry}) + Tiraje(${inputs.retractions}) = ${total}/17`,
    };
  },
};
