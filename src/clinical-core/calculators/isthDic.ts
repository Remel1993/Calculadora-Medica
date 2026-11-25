import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SecondaryResultItem,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const hasUnderlyingDisorderField: BooleanFieldDef = {
  id: 'hasUnderlyingDisorder',
  label: '¿Existe un trastorno subyacente conocido asociado a CID? (Prerrequisito ISTH)',
  type: 'boolean',
  defaultValue: true,
  trueLabel: 'Sí',
  falseLabel: 'No',
  helpText: 'Ej.: sepsis, trauma grave, neoplasia maligna, complicación obstétrica, insuficiencia hepática aguda o hemólisis intravascular.',
};

const plateletsField: SelectFieldDef = {
  id: 'platelets',
  label: '1. Recuento de plaquetas',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '> 100 ×10⁹/L (> 100 000/µL)', points: 0 },
    { value: '1', label: '50–100 ×10⁹/L (50 000–100 000/µL)', points: 1 },
    { value: '2', label: '< 50 ×10⁹/L (< 50 000/µL)', points: 2 },
  ],
};

const fibrinMarkersField: SelectFieldDef = {
  id: 'fibrinMarkers',
  label: '2. Marcadores relacionados con fibrina (Dímero D / PDF)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Sin aumento (dentro de rango normal)', points: 0 },
    { value: '2', label: 'Aumento moderado (p. ej., > LSN hasta < 5–10× LSN)', points: 2 },
    { value: '3', label: 'Aumento intenso / marcado (p. ej., ≥ 5–10× LSN)', points: 3 },
  ],
};

const ptProlongationField: SelectFieldDef = {
  id: 'ptProlongation',
  label: '3. Prolongación del Tiempo de Protrombina (sobre el control)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '< 3 segundos', points: 0 },
    { value: '1', label: '≥ 3 a < 6 segundos', points: 1 },
    { value: '2', label: '≥ 6 segundos', points: 2 },
  ],
};

const fibrinogenField: SelectFieldDef = {
  id: 'fibrinogen',
  label: '4. Fibrinógeno sérico',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '≥ 100 mg/dL (≥ 1.0 g/L)', points: 0 },
    { value: '1', label: '< 100 mg/dL (< 1.0 g/L)', points: 1 },
  ],
};

export const isthDicCalculator: CalculatorDefinition = {
  id: 'isth-dic',
  name: 'Criterios ISTH de Coagulación Intravascular Diseminada (CID Manifiesta)',
  shortName: 'Score ISTH (CID)',
  primarySpecialty: 'hematologia',
  secondarySpecialties: ['urgencias', 'medicina-interna'],
  subcategory: 'diagnostico',
  keywords: [
    'isth',
    'cid',
    'dic',
    'coagulacion intravascular diseminada',
    'dimero d',
    'fibrinogeno',
    'plaquetas',
    'hematologia',
  ],
  description:
    'Sistema de puntuación de la International Society on Thrombosis and Haemostasis (ISTH) para el diagnóstico de CID manifiesta (Overt DIC).',
  clinicalIndication:
    'Evaluación diagnóstica y seguimiento diario en pacientes con patología predisponente (sepsis, trauma, neoplasia, obstetricia) y alteración de la coagulación.',
  validatedPopulation: 'Adultos y pacientes críticos con trastorno predisponente conocido para CID.',
  contraindications: [
    'No debe aplicarse si no existe una enfermedad subyacente capaz de desencadenar CID.',
  ],
  limitations: [
    'En cirrosis hepática grave, el TP prolongado y la trombocitopenia pueden elevar artificialmente el puntaje sin CID verdadera.',
    'La definición de aumento "moderado" vs. "intenso" de Dímero D depende de los puntos de corte validados de cada laboratorio.',
    'En CID obstétrica, el fibrinógeno basal está fisiológicamente elevado en el embarazo (< 200 mg/dL ya es crítico en hemorragia posparto).',
  ],
  requiredLabsNote: 'Requiere biometría hemática (plaquetas), TP, fibrinógeno y Dímero D o PDF.',
  version: 'ISTH Scientific Subcommittee on DIC (Taylor et al., 2001)',
  references: [
    {
      citation:
        'Taylor FB Jr, Toh CH, Hoots WK, Wada H, Levi M. Towards definition, clinical and laboratory criteria, and a scoring system for disseminated intravascular coagulation. Thromb Haemost. 2001;86(5):1327-1330.',
      year: 2001,
    },
    {
      citation:
        'Wada H, Thachil J, Di Nisio M, et al. Guidance for diagnosis and treatment of DIC from harmonization of the recommendations from three guidelines. J Thromb Haemost. 2013;11(4):761-767.',
      year: 2013,
    },
  ],
  fields: [
    hasUnderlyingDisorderField,
    plateletsField,
    fibrinMarkersField,
    ptProlongationField,
    fibrinogenField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(isthDicCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const hasDisorder = Boolean(inputs.hasUnderlyingDisorder);
    const plt = Number(inputs.platelets);
    const fib = Number(inputs.fibrinMarkers);
    const pt = Number(inputs.ptProlongation);
    const fbg = Number(inputs.fibrinogen);
    const total = plt + fib + pt + fbg;

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (!hasDisorder) {
      severity = 'info';
      riskClassification = `Prerrequisito ausente (puntaje de laboratorio ${total}/8)`;
      clinicalInterpretation =
        'El algoritmo ISTH exige una patología predisponente conocida; sin ella, estos parámetros aislados no permiten diagnosticar CID.';
      guidance.push(
        'Investigar otras causas de coagulopatía o trombocitopenia (hepatopatía, déficit de vitamina K, microangiopatía trombótica, fármacos).',
      );
    } else if (total >= 5) {
      severity = 'critical';
      riskClassification = 'Compatible con CID manifiesta (≥ 5 puntos)';
      clinicalInterpretation =
        'Cumple criterios ISTH para coagulación intravascular diseminada manifiesta en presencia de trastorno desencadenante.';
      guidance.push(
        'El pilar terapéutico es el control urgente de la causa subyacente (sepsis, foco infeccioso, evacuación obstétrica, etc.).',
        'Monitorizar seriación diaria (o cada 6–12 h en fase aguda) y reponer hemoderivados según hemorragia activa o riesgo invasivo.',
      );
    } else {
      severity = total >= 3 ? 'moderate' : 'low';
      riskClassification = 'No sugestivo de CID manifiesta (< 5 puntos)';
      clinicalInterpretation =
        'No alcanza el umbral diagnóstico de CID manifiesta (puede tratarse de fase compensada o no manifiesta).';
      guidance.push(
        'Repetir perfil de coagulación cada 24 horas si persiste el cuadro predisponente o deterioro clínico.',
      );
    }

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Umbral diagnóstico ISTH',
        formattedValue: '≥ 5 pts',
        unit: '',
      },
      {
        label: 'Desglose (Plaq / Fibrina / TP / Fbg)',
        formattedValue: `${plt} + ${fib} + ${pt} + ${fbg}`,
        unit: 'pts',
      },
    ];

    return {
      primaryResult: {
        label: 'Score ISTH de CID',
        value: total,
        formattedValue: `${total} / 8`,
        unit: 'puntos',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'ISTH CID = Plaquetas (0–2) + Dímero D/PDF (0–3) + Prolongación TP (0–2) + Fibrinógeno (0–1)',
      inputsSummary: `Trastorno base: ${hasDisorder ? 'Sí' : 'No'} · ISTH ${total}/8`,
    };
  },
};
