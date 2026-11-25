import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const cfsField: SelectFieldDef = {
  id: 'cfsLevel',
  label: 'Nivel funcional basal (2 semanas previas a la enfermedad aguda actual)',
  type: 'select',
  defaultValue: '3',
  options: [
    {
      value: '1',
      label: '1 — Muy en forma',
      description: 'Robusto, activo, enérgico y motivado; realiza ejercicio regularmente y está entre los más sanos de su edad.',
      points: 1,
    },
    {
      value: '2',
      label: '2 — En forma',
      description: 'Sin síntomas de enfermedad activa pero menos en forma que el nivel 1; ejercicio o actividad ocasional/estacional.',
      points: 2,
    },
    {
      value: '3',
      label: '3 — Bien manejado',
      description: 'Problemas médicos bien controlados, sin actividad física regular más allá de caminar de rutina.',
      points: 3,
    },
    {
      value: '4',
      label: '4 — Viviendo con fragilidad muy leve (vulnerable)',
      description: 'Independiente sin ayuda ajena, pero los síntomas limitan actividades; refiere sentirse "más lento" o cansado durante el día.',
      points: 4,
    },
    {
      value: '5',
      label: '5 — Fragilidad leve',
      description: 'Enlentecimiento evidente y necesidad de ayuda en actividades instrumentales de alto orden (finanzas, transporte, medicación, trabajo pesado).',
      points: 5,
    },
    {
      value: '6',
      label: '6 — Fragilidad moderada',
      description: 'Requiere ayuda en todas las actividades exteriores y tareas domésticas; suele necesitar apoyo con escaleras y supervisión al bañarse o vestirse.',
      points: 6,
    },
    {
      value: '7',
      label: '7 — Fragilidad grave',
      description: 'Completamente dependiente para el cuidado personal (causa física o cognitiva), aunque clínicamente estable y sin alto riesgo inminente de muerte (< 6 meses).',
      points: 7,
    },
    {
      value: '8',
      label: '8 — Fragilidad muy grave',
      description: 'Completamente dependiente y próximo al final de la vida; habitualmente incapaz de recuperarse incluso de una enfermedad leve.',
      points: 8,
    },
    {
      value: '9',
      label: '9 — Enfermo terminal',
      description: 'Acercándose al final de la vida (expectativa de vida < 6 meses), aunque no necesariamente presente fragilidad grave.',
      points: 9,
    },
  ],
};

export const clinicalFrailtyScaleCalculator: CalculatorDefinition = {
  id: 'clinical-frailty-scale',
  name: 'Escala de Fragilidad Clínica (CFS — Rockwood 2.0)',
  shortName: 'Fragilidad Clínica (CFS)',
  primarySpecialty: 'geriatria',
  secondarySpecialties: ['medicina-interna', 'urgencias'],
  subcategory: 'gravedad',
  keywords: [
    'fragilidad',
    'cfs',
    'rockwood',
    'geriatria',
    'uci',
    'anciano',
    'vulnerabilidad',
    'valoracion geriatrica',
  ],
  description:
    'Clasifica el estado basal de fragilidad y reserva fisiológica del adulto mayor en 9 niveles (CFS 1 a 9) según la versión revisada de Rockwood (2020).',
  clinicalIndication:
    'Valoración geriátrica rápida en consulta, urgencias, triaje de medicina intensiva y estratificación prequirúrgica en ≥ 65 años.',
  validatedPopulation: 'Adultos mayores de 65 años (evaluando siempre su estado BASAL de 2 semanas antes del proceso agudo).',
  contraindications: [
    'No está validada en personas < 65 años ni en adultos con discapacidad estable de larga evolución no progresiva (parálisis cerebral, lesión medular crónica, discapacidad intelectual).',
  ],
  limitations: [
    'Error frecuente: puntuar el estado durante un delirium o infección aguda. Siempre debe clasificarse la situación funcional 2 semanas antes del evento agudo.',
    'Debe guiar una valoración geriátrica integral y metas proporcionales de cuidado, nunca utilizarse de forma aislada para negar atención médica.',
  ],
  version: 'Rockwood Clinical Frailty Scale v2.0 (2020)',
  references: [
    {
      citation:
        'Rockwood K, Song X, MacKnight C, et al. A global clinical measure of fitness and frailty in elderly people. CMAJ. 2005;173(5):489-495.',
      year: 2005,
    },
    {
      citation:
        'Rockwood K, Theou O. Using the Clinical Frailty Scale in Allocating Scarce Health Care Resources. Can Geriatr J. 2020;23(3):210-215.',
      year: 2020,
    },
  ],
  fields: [cfsField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(clinicalFrailtyScaleCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const level = Number(inputs.cfsLevel);
    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (level <= 3) {
      severity = 'normal';
      riskClassification = `CFS ${level} — Sin fragilidad (robusto / bien manejado)`;
      clinicalInterpretation =
        'Reserva fisiológica conservada sin criterios clínicos de fragilidad ni dependencia funcional.';
      guidance.push('Promover ejercicio multicomponente (fuerza, equilibrio y aeróbico) y prevención habitual.');
    } else if (level === 4) {
      severity = 'low';
      riskClassification = 'CFS 4 — Fragilidad muy leve / vulnerable';
      clinicalInterpretation =
        'Independiente en actividades diarias, pero con menor reserva fisiológica y vulnerabilidad aumentada ante descompensaciones agudas o cirugías.';
      guidance.push(
        'Optimizar nutrición proteica, revisión de medicación (criterios STOPP/START), ejercicio de fuerza y cribado de sarcopenia.',
      );
    } else if (level <= 6) {
      severity = 'moderate';
      riskClassification =
        level === 5 ? 'CFS 5 — Fragilidad leve' : 'CFS 6 — Fragilidad moderada';
      clinicalInterpretation =
        'Fragilidad establecida con dependencia progresiva en actividades instrumentales o básicas y mayor riesgo de delirium, caídas, hospitalización y declive funcional.';
      guidance.push(
        'Realizar Valoración Geriátrica Integral (VGI), revisar riesgo de caídas, desprescribir fármacos inapropiados y prevenir delirium hospitalario.',
      );
    } else if (level <= 8) {
      severity = 'high';
      riskClassification =
        level === 7 ? 'CFS 7 — Fragilidad grave' : 'CFS 8 — Fragilidad muy grave';
      clinicalInterpretation =
        'Dependencia completa para el cuidado personal y muy baja reserva fisiológica; alta mortalidad intrahospitalaria ante cuadros graves.';
      guidance.push(
        'Alinear objetivos de cuidado con paciente y familia, priorizar confort, soporte al cuidador y valorar proporcionalidad de intervenciones invasivas.',
      );
    } else {
      severity = 'critical';
      riskClassification = 'CFS 9 — Situación terminal (< 6 meses)';
      clinicalInterpretation =
        'Expectativa de vida estimada inferior a 6 meses independiente del grado previo de dependencia física.';
      guidance.push(
        'Activar enfoque de cuidados paliativos, control estricto de síntomas y adecuación del esfuerzo terapéutico.',
      );
    }

    return {
      primaryResult: {
        label: 'Clinical Frailty Scale (CFS)',
        value: level,
        formattedValue: `CFS ${level}`,
        unit: 'de 9',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'Escala ordinal Rockwood CFS v2.0 (1 a 9) basada en función basal previa',
      inputsSummary: `Nivel CFS seleccionado: ${level} / 9`,
    };
  },
};
