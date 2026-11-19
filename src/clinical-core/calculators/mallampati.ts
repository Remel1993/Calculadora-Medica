import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const mallampatiClassField: SelectFieldDef = {
  id: 'mallampatiClass',
  label: 'Visibilidad orofaríngea (paciente sentado, boca abierta al máximo, lengua protruida sin fonación)',
  type: 'select',
  defaultValue: '1',
  options: [
    {
      value: '1',
      label: 'Clase I',
      description: 'Visibilidad completa de paladar blando, úvula, fauces y pilares amigdalinos.',
      points: 1,
    },
    {
      value: '2',
      label: 'Clase II',
      description: 'Visibilidad de paladar blando, úvula y fauces (pilares ocultos por la lengua).',
      points: 2,
    },
    {
      value: '3',
      label: 'Clase III',
      description: 'Visibilidad únicamente del paladar blando y la base de la úvula.',
      points: 3,
    },
    {
      value: '4',
      label: 'Clase IV',
      description: 'Paladar blando no visible; solo se observa el paladar duro.',
      points: 4,
    },
  ],
};

export const mallampatiCalculator: CalculatorDefinition = {
  id: 'mallampati',
  name: 'Clasificación de Mallampati Modificada (Vía Aérea y SAOS)',
  shortName: 'Mallampati',
  primarySpecialty: 'cirugia-general',
  secondarySpecialties: ['urgencias', 'neumologia'],
  subcategory: 'diagnostico',
  keywords: [
    'mallampati',
    'via aerea dificil',
    'intubacion',
    'laringoscopia',
    'anestesia',
    'saos',
    'orofaringe',
    'samsoon',
  ],
  description:
    'Evaluación anatómica clínica de la cavidad orofaríngea (modificación de Samsoon y Young) para estimar dificultad de intubación y estrechez anatómica en SAOS.',
  clinicalIndication:
    'Valoración preanestésica, preparación de vía aérea en urgencias y exploración física de pacientes con sospecha de SAOS.',
  validatedPopulation: 'Adultos colaboradores en posición sentada (extrapolable con reservas en urgencias).',
  contraindications: [
    'No utilizar como único criterio para descartar intubación difícil ni cuando la postura o falta de cooperación impiden la exploración estandarizada.',
  ],
  limitations: [
    'Sensibilidad y valor predictivo positivo limitados si se evalúa de forma aislada; debe integrarse con apertura bucal, distancia tiromentoniana, movilidad cervical y escala LEMON.',
    'La fonación ("ahhh") o la posición supina alteran la clasificación real.',
    'En SAOS, una clase III–IV aumenta la sospecha anatómica de colapso faríngeo (índice de Friedman), pero no confirma el diagnóstico.',
  ],
  version: 'Mallampati (1985) / Samsoon y Young (1987)',
  references: [
    {
      citation:
        'Mallampati SR, Gatt SP, Gugino LD, et al. A clinical sign to predict difficult tracheal intubation: a prospective study. Can Anaesth Soc J. 1985;32(4):429-434.',
      year: 1985,
    },
    {
      citation:
        'Samsoon GLT, Young JRB. Difficult tracheal intubation: a retrospective study. Anaesthesia. 1987;42(5):487-490.',
      year: 1987,
    },
  ],
  fields: [mallampatiClassField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(mallampatiCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const grade = Number(inputs.mallampatiClass);
    const romanMap: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' };
    const roman = romanMap[grade] ?? String(grade);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (grade === 1) {
      severity = 'normal';
      riskClassification = 'Clase I — Vía aérea favorable';
      clinicalInterpretation =
        'Excelente exposición orofaríngea; baja probabilidad de laringoscopia difícil por desproporción lengua-faringe.';
    } else if (grade === 2) {
      severity = 'low';
      riskClassification = 'Clase II — Riesgo bajo de vía aérea difícil';
      clinicalInterpretation =
        'Exposición adecuada de úvula y paladar blando; habitualmente asociada a laringoscopia sin dificultad mayor.';
    } else if (grade === 3) {
      severity = 'high';
      riskClassification = 'Clase III — Predictor de posible vía aérea difícil';
      clinicalInterpretation =
        'Reducción significativa del espacio orofaríngeo (mayor asociación con Cormack-Lehane III–IV y estrechez faríngea en SAOS).';
      guidance = [
        'Completar valoración multifactorial de vía aérea (apertura oral, distancia tiromentoniana, extensión cervical) y preparar dispositivos alternativos (videolaringoscopio / bujía) si se planea intubación.',
      ];
    } else {
      severity = 'critical';
      riskClassification = 'Clase IV — Alto riesgo de intubación difícil';
      clinicalInterpretation =
        'Ausencia de visibilidad del paladar blando; mayor riesgo de dificultad en laringoscopia directa, ventilación con mascarilla facial y estrechez anatómica en SAOS.';
      guidance = [
        'Prever plan avanzado de vía aérea difícil (videolaringoscopia, dispositivos supraglóticos o intubación vigil según contexto clínico y protocolos ASA/DAS).',
      ];
    }

    return {
      primaryResult: {
        label: 'Clasificación de Mallampati',
        value: grade,
        formattedValue: `Clase ${roman}`,
        unit: '(I – IV)',
      },
      secondaryResults: [
        {
          label: 'Asociación con vía aérea difícil (Clase III–IV)',
          formattedValue: grade >= 3 ? 'Positiva' : 'Baja',
          unit: '',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: guidance.length > 0 ? guidance : undefined,
      guidanceDisclaimer:
        'Valorar siempre junto con distancia tiromentoniana, apertura bucal, movilidad cervical y antecedentes de vía aérea.',
      formulaUsed: 'Clasificación anatómica directa (Grados I – IV de Samsoon y Young)',
      inputsSummary: `Mallampati Clase ${roman}`,
    };
  },
};
