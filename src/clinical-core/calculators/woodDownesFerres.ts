import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const wheezingField: SelectFieldDef = {
  id: 'wheezing',
  label: '1. Sibilancias',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'No (0)', points: 0 },
    { value: '1', label: 'Al final de la espiración (+1)', points: 1 },
    { value: '2', label: 'Toda la espiración (+2)', points: 2 },
    { value: '3', label: 'Inspiratorias y espiratorias (+3)', points: 3 },
  ],
};

const retractionsField: SelectFieldDef = {
  id: 'retractions',
  label: '2. Tiraje / uso de musculatura accesoria',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'No (0)', points: 0 },
    { value: '1', label: 'Subcostal / intercostal inferior (+1)', points: 1 },
    { value: '2', label: 'Previo + supraclavicular + aleteo nasal (+2)', points: 2 },
    { value: '3', label: 'Previo + intercostal superior / supraesternal (+3)', points: 3 },
  ],
};

const rrField: SelectFieldDef = {
  id: 'respRate',
  label: '3. Frecuencia respiratoria',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '< 30 rpm (0)', points: 0 },
    { value: '1', label: '31 – 45 rpm (+1)', points: 1 },
    { value: '2', label: '46 – 60 rpm (+2)', points: 2 },
    { value: '3', label: '> 60 rpm (+3)', points: 3 },
  ],
};

const hrField: SelectFieldDef = {
  id: 'heartRate',
  label: '4. Frecuencia cardíaca',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '< 120 lpm (0)', points: 0 },
    { value: '1', label: '> 120 lpm (+1)', points: 1 },
  ],
};

const ventilationField: SelectFieldDef = {
  id: 'ventilation',
  label: '5. Ventilación / entrada de aire pulmonar',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Buena, simétrica (0)', points: 0 },
    { value: '1', label: 'Regular, simétrica (+1)', points: 1 },
    { value: '2', label: 'Muy disminuida (+2)', points: 2 },
    { value: '3', label: 'Tórax silente (+3)', points: 3 },
  ],
};

const cyanosisField: SelectFieldDef = {
  id: 'cyanosis',
  label: '6. Cianosis',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'No (0)', points: 0 },
    { value: '1', label: 'Sí (+1)', points: 1 },
  ],
};

export const woodDownesFerresCalculator: CalculatorDefinition = {
  id: 'wood-downes-ferres',
  name: 'Escala de Wood-Downes Modificada (Ferrés — Bronquiolitis)',
  shortName: 'Wood-Downes-Ferrés',
  primarySpecialty: 'pediatria',
  secondarySpecialties: ['urgencias'],
  subcategory: 'gravedad',
  keywords: ['wood-downes', 'ferres', 'bronquiolitis', 'lactante', 'sibilancias', 'vrs', 'dificultad respiratoria'],
  description:
    'Escala clínica de 6 parámetros (0–14 puntos) ampliamente utilizada en urgencias pediátricas hispanohablantes para graduar la gravedad de la bronquiolitis aguda.',
  clinicalIndication:
    'Valoración clínica inicial y monitorización evolutiva de lactantes (< 2 años) con bronquiolitis aguda.',
  validatedPopulation: 'Lactantes < 24 meses con bronquiolitis aguda.',
  contraindications: [
    'No utilizar como sustituto de criterios de alarma independientes (apneas en < 1–3 meses, imposibilidad de alimentación, SpO₂ < 90–92 %).',
  ],
  limitations: [
    'La puntuación de FR (< 30 rpm = 0) puede subestimar riesgo en lactantes muy pequeños con bradipnea o apneas por agotamiento.',
    'La versión original de Wood-Downes (1972) usaba PaO₂/FiO₂; la modificación de Ferrés (1988) sustituyó gasometría por parámetros puramente clínicos.',
  ],
  version: 'Wood-Downes modificada por Ferrés (1988)',
  references: [
    {
      citation:
        'Ferrés J, Mangues MA, Farre R, et al. Escala clínica de Wood-Downes modificada en bronquiolitis. An Esp Pediatr. 1988.',
      year: 1988,
    },
    {
      citation:
        'Ralston SL, Lieberthal AS, Meissner HC, et al. Clinical practice guideline: the diagnosis, management, and prevention of bronchiolitis. Pediatrics. 2014;134(5):e1474-e1502.',
      year: 2014,
    },
  ],
  fields: [wheezingField, retractionsField, rrField, hrField, ventilationField, cyanosisField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(woodDownesFerresCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const total =
      Number(inputs.wheezing) +
      Number(inputs.retractions) +
      Number(inputs.respRate) +
      Number(inputs.heartRate) +
      Number(inputs.ventilation) +
      Number(inputs.cyanosis);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (total === 0) {
      severity = 'normal';
      riskClassification = 'Sin dificultad respiratoria (0 / 14 puntos)';
      clinicalInterpretation = 'Ausencia de signos clínicos de gravedad en la escala.';
      guidance = ['Mantener lavados nasales suaves, tomas fraccionadas y vigilancia de signos de alarma.'];
    } else if (total <= 3) {
      severity = 'low';
      riskClassification = `Bronquiolitis leve (${total} / 14 puntos)`;
      clinicalInterpretation = 'Trabajo respiratorio leve; suele ser tributaria de manejo ambulatorio si mantiene hidratación y SpO₂ adecuada.';
      guidance = [
        'Medidas de soporte: desobstrucción nasal con suero fisiológico, hidratación oral fraccionada y control evolutivo en 24–48 h.',
        'Evitar broncodilatadores, corticoides y antibióticos de rutina según guías AAP/NICE.',
      ];
    } else if (total <= 7) {
      severity = 'moderate';
      riskClassification = `Bronquiolitis moderada (${total} / 14 puntos)`;
      clinicalInterpretation = 'Dificultad respiratoria moderada que requiere observación en urgencias o ingreso hospitalario.';
      guidance = [
        'Monitorizar SpO₂, administrar O₂ suplementario si SpO₂ < 90–92 %, valorar hidratación IV/SNG si no tolera vía oral.',
      ];
    } else {
      severity = total >= 11 ? 'critical' : 'high';
      riskClassification = `Bronquiolitis grave (${total} / 14 puntos)`;
      clinicalInterpretation = 'Insuficiencia respiratoria grave o riesgo de claudicación respiratoria.';
      guidance = [
        'Ingreso hospitalario prioritario / UCIP, soporte con cánula nasal de alto flujo (CNAF) o CPAP/ventilación no invasiva según respuesta.',
      ];
    }

    return {
      primaryResult: {
        label: 'Wood-Downes-Ferrés',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 14)',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'Valorar siempre edad (< 3 meses), prematuridad, apneas e ingesta oral además del puntaje.',
      formulaUsed: 'Sibilancias (0–3) + Tiraje (0–3) + FR (0–3) + FC (0–1) + Ventilación (0–3) + Cianosis (0–1)',
      inputsSummary: `WDF total: ${total}/14`,
    };
  },
};
