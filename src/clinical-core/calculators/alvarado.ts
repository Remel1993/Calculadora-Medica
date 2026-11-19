import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SeverityLevel,
} from '../types/clinical.ts';

const fields: BooleanFieldDef[] = [
  { id: 'migration', label: 'M — Migración del dolor hacia fosa ilíaca derecha (+1)', type: 'boolean', defaultValue: false },
  { id: 'anorexia', label: 'A — Anorexia / hiporexia (+1)', type: 'boolean', defaultValue: false },
  { id: 'nausea', label: 'N — Náuseas o vómitos (+1)', type: 'boolean', defaultValue: false },
  { id: 'tenderness', label: 'T — Dolor a la palpación en cuadrante inferior derecho (+2)', type: 'boolean', defaultValue: false },
  { id: 'rebound', label: 'R — Signo de rebote / Blumberg positivo (+1)', type: 'boolean', defaultValue: false },
  { id: 'fever', label: 'E — Temperatura elevada > 37.3 °C (+1)', type: 'boolean', defaultValue: false },
  { id: 'leukocytosis', label: 'L — Leucocitosis > 10,000 /µL (> 10 ×10⁹/L) (+2)', type: 'boolean', defaultValue: false },
  { id: 'leftShift', label: 'S — Desviación a la izquierda / Neutrofilia > 75 % (+1)', type: 'boolean', defaultValue: false },
];

export const alvaradoCalculator: CalculatorDefinition = {
  id: 'alvarado',
  name: 'Escala de Alvarado (MANTRELS — Apendicitis Aguda)',
  shortName: 'Alvarado',
  primarySpecialty: 'cirugia-general',
  secondarySpecialties: ['urgencias', 'gineco-obstetricia'],
  subcategory: 'diagnostico',
  keywords: ['alvarado', 'mantrels', 'apendicitis', 'dolor abdominal', 'fid', 'cirugia'],
  description:
    'Estratificación de probabilidad clínica de apendicitis aguda basada en 8 criterios clínicos y de biometría hemática (0–10 puntos).',
  clinicalIndication:
    'Evaluación inicial en urgencias de pacientes con dolor en fosa ilíaca derecha para orientar observación, estudio de imagen (ecografía/TC) o valoración quirúrgica.',
  validatedPopulation: 'Adultos y escolares/adolescentes (varones adultos principalmente; menor especificidad en mujeres en edad fértil y niños pequeños).',
  requiredLabsNote: 'Requiere biometría hemática completa (leucocitos y diferencial de neutrófilos).',
  contraindications: [
    'NO utilizar como criterio diagnóstico ni de exclusión único en mujeres embarazadas: la leucocitosis fisiológica del embarazo y el desplazamiento cefálico del apéndice alteran su validez; priorizar ecografía/RM.',
  ],
  limitations: [
    'Las guías WSES Jerusalén (2020) prefieren el AIR Score o la combinación con ecografía/TC sobre Alvarado aislado en adultos por menor especificidad en mujeres jóvenes (patología ginecológica simuladora).',
    'Una puntuación baja (< 5) reduce la probabilidad pero no descarta apendicitis al 100 % si persiste sospecha clínica.',
  ],
  version: 'Alvarado A (Ann Emerg Med 1986)',
  references: [
    {
      citation: 'Alvarado A. A practical score for the early diagnosis of acute appendicitis. Ann Emerg Med. 1986;15(5):557-564.',
      year: 1986,
    },
    {
      citation: 'Di Saverio S, Podda M, De Simone B, et al. Diagnosis and treatment of acute appendicitis: 2020 update of the WSES Jerusalem guidelines. World J Emerg Surg. 2020;15(1):27.',
      year: 2020,
    },
  ],
  fields,
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(alvaradoCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const score =
      (inputs.migration === true ? 1 : 0) +
      (inputs.anorexia === true ? 1 : 0) +
      (inputs.nausea === true ? 1 : 0) +
      (inputs.tenderness === true ? 2 : 0) +
      (inputs.rebound === true ? 1 : 0) +
      (inputs.fever === true ? 1 : 0) +
      (inputs.leukocytosis === true ? 2 : 0) +
      (inputs.leftShift === true ? 1 : 0);

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (score <= 4) {
      severity = 'low';
      riskClassification = `Probabilidad baja (${score} / 10 puntos)`;
      clinicalInterpretation = 'Apendicitis aguda poco probable con esta puntuación aislada.';
      guidance = [
        'Investigar diagnósticos diferenciales y reevaluar clínicamente (o realizar estudio de imagen si persisten síntomas o factores de riesgo).',
      ];
    } else if (score <= 6) {
      severity = 'moderate';
      riskClassification = `Probabilidad intermedia / equívoca (${score} / 10 puntos)`;
      clinicalInterpretation = 'Zona indeterminada compatible con apendicitis posible.';
      guidance = [
        'Observación clínica seriada y estudio de imagen (ecografía abdominal inicial o TC según disponibilidad y perfil del paciente).',
      ];
    } else {
      severity = 'high';
      riskClassification = `Probabilidad alta (${score} / 10 puntos)`;
      clinicalInterpretation = 'Alta probabilidad clínica de apendicitis aguda (especialmente en puntuación ≥ 7–8 en varones).';
      guidance = [
        'Valoración prioritaria por cirugía general; confirmar con imagen (ecografía/TC) en mujeres en edad fértil, adultos mayores o cuadros atípicos según guía WSES.',
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación de Alvarado',
        value: score,
        formattedValue: String(score),
        unit: 'puntos (de 10)',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'No reemplaza la exploración quirúrgica seriada ni la imagen en embarazadas o casos atípicos.',
      formulaUsed: 'Migración(1)+Anorexia(1)+Náuseas(1)+Dolor CID(2)+Rebote(1)+Fiebre(1)+Leucos(2)+Neutrofilia(1)',
      inputsSummary: `Alvarado: ${score} / 10 puntos`,
    };
  },
};
