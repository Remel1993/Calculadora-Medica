import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const ageField: SelectFieldDef = {
  id: 'ageGroup',
  label: 'Grupo etario',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '≤ 40 años (0)', points: 0 },
    { value: '1', label: '41 – 60 años (+1)', points: 1 },
    { value: '2', label: '61 – 74 años (+2)', points: 2 },
    { value: '3', label: '≥ 75 años (+3)', points: 3 },
  ],
};

const surgeryField: SelectFieldDef = {
  id: 'surgeryType',
  label: 'Tipo de procedimiento quirúrgico actual',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Ninguno / Paciente médico (0)', points: 0 },
    { value: '1', label: 'Cirugía menor planeada (< 45 min) (+1)', points: 1 },
    { value: '2', label: 'Cirugía mayor abierta, laparoscópica (> 45 min) o artroscópica (+2)', points: 2 },
    { value: '5', label: 'Artroplastia electiva mayor de cadera o rodilla (+5)', points: 5 },
  ],
};

const weightedBoolFields: Array<{ field: BooleanFieldDef; pts: number }> = [
  // +1 factors
  { field: { id: 'p1_bmi25', label: '+1: Sobrepeso u obesidad (IMC > 25 kg/m²)', type: 'boolean', defaultValue: false }, pts: 1 },
  { field: { id: 'p1_varicose', label: '+1: Várices o edema actual en miembros inferiores', type: 'boolean', defaultValue: false }, pts: 1 },
  { field: { id: 'p1_priorMajorSurg', label: '+1: Cirugía mayor previa (< 1 mes)', type: 'boolean', defaultValue: false }, pts: 1 },
  { field: { id: 'p1_acuteMedical', label: '+1: IAM, insuficiencia cardíaca, sepsis o neumonía/EPOC grave (< 1 mes)', type: 'boolean', defaultValue: false }, pts: 1 },
  { field: { id: 'p1_bedRestMed', label: '+1: Paciente médico actualmente en reposo en cama', type: 'boolean', defaultValue: false }, pts: 1 },
  { field: { id: 'p1_ibd', label: '+1: Enfermedad inflamatoria intestinal crónica', type: 'boolean', defaultValue: false }, pts: 1 },
  { field: { id: 'p1_estrogen', label: '+1: Anticonceptivos orales, terapia hormonal o embarazo/posparto (< 1 mes)', type: 'boolean', defaultValue: false }, pts: 1 },
  // +2 factors
  { field: { id: 'p2_malignancy', label: '+2: Cáncer activo o previo', type: 'boolean', defaultValue: false }, pts: 2 },
  { field: { id: 'p2_bed72h', label: '+2: Inmovilización en cama > 72 horas o yeso inmovilizador (< 1 mes)', type: 'boolean', defaultValue: false }, pts: 2 },
  { field: { id: 'p2_cvc', label: '+2: Acceso venoso central actual', type: 'boolean', defaultValue: false }, pts: 2 },
  // +3 factors
  { field: { id: 'p3_priorVte', label: '+3: Antecedente personal de TVP o TEP', type: 'boolean', defaultValue: false }, pts: 3 },
  { field: { id: 'p3_familyVte', label: '+3: Historia familiar de trombosis', type: 'boolean', defaultValue: false }, pts: 3 },
  { field: { id: 'p3_thrombophilia', label: '+3: Trombofilia conocida (Factor V Leiden, protrombina, SAF, TIH, etc.)', type: 'boolean', defaultValue: false }, pts: 3 },
  // +5 factors
  { field: { id: 'p5_stroke', label: '+5: Ictus reciente (< 1 mes)', type: 'boolean', defaultValue: false }, pts: 5 },
  { field: { id: 'p5_fractureTrauma', label: '+5: Fractura de cadera/pelvis/pierna o politraumatismo (< 1 mes)', type: 'boolean', defaultValue: false }, pts: 5 },
  { field: { id: 'p5_spinalCord', label: '+5: Lesión medular aguda con parálisis (< 1 mes)', type: 'boolean', defaultValue: false }, pts: 5 },
];

export const capriniCalculator: CalculatorDefinition = {
  id: 'caprini',
  name: 'Escala de Caprini (Riesgo de TEV Perioperatorio)',
  shortName: 'Caprini TEV',
  primarySpecialty: 'cirugia-general',
  secondarySpecialties: ['hematologia', 'medicina-interna'],
  subcategory: 'diagnostico',
  keywords: ['caprini', 'tromboprofilaxis', 'tev', 'tvp', 'tep', 'cirugia', 'perioperatorio'],
  description:
    'Estratificación del riesgo de enfermedad tromboembólica venosa (TVP/TEP) en pacientes quirúrgicos para guiar tromboprofilaxis mecánica y/o farmacológica.',
  clinicalIndication:
    'Evaluación preoperatoria o posoperatoria temprana en cirugía general, abdominopélvica, bariátrica, plástica y urológica (guías ACCP).',
  validatedPopulation: 'Adultos sometidos a cirugía no ortopédica general/abdominopélvica/torácica/plástica.',
  contraindications: [
    'Antes de indicar tromboprofilaxis farmacológica, valorar siempre el riesgo de sangrado quirúrgico activo, coagulopatía o anestesia neuroaxial reciente.',
  ],
  limitations: [
    'En cirugía ortopédica mayor (prótesis de cadera/rodilla, fractura de cadera) las guías recomiendan tromboprofilaxis sistemática de alto riesgo independientemente del puntaje.',
    'Algunos grupos de cirugía oncológica/plástica distinguen riesgo muy alto (≥ 9 puntos) para profilaxis extendida tras el alta.',
  ],
  version: 'Caprini JA (2005) / Guías ACCP 9.ª ed.',
  references: [
    {
      citation: 'Caprini JA. Thrombosis risk assessment as a guide to quality patient care. Dis Mon. 2005;51(2-3):70-78.',
      year: 2005,
    },
    {
      citation: 'Gould MK, Garcia DA, Wren SM, et al. Prevention of VTE in nonorthopedic surgical patients: Antithrombotic Therapy and Prevention of Thrombosis, 9th ed: ACCP Guidelines. Chest. 2012;141(2 Suppl):e227S-e277S.',
      year: 2012,
    },
  ],
  fields: [ageField, surgeryField, ...weightedBoolFields.map((w) => w.field)],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(capriniCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    let score = Number(inputs.ageGroup) + Number(inputs.surgeryType);
    for (const item of weightedBoolFields) {
      if (inputs[item.field.id] === true) score += item.pts;
    }

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (score === 0) {
      severity = 'normal';
      riskClassification = 'Riesgo muy bajo (0 puntos)';
      clinicalInterpretation = 'Incidencia basal estimada de TEV sintomática < 0.5 %.';
      guidance = ['Deambulación precoz; generalmente no requiere profilaxis farmacológica ni mecánica específica.'];
    } else if (score <= 2) {
      severity = 'low';
      riskClassification = `Riesgo bajo (${score} puntos)`;
      clinicalInterpretation = 'Incidencia estimada de TEV sintomática ≈ 1.5 %.';
      guidance = ['Profilaxis mecánica (compresión neumática intermitente o medias elásticas) + deambulación precoz.'];
    } else if (score <= 4) {
      severity = 'moderate';
      riskClassification = `Riesgo moderado (${score} puntos)`;
      clinicalInterpretation = 'Incidencia estimada de TEV sintomática ≈ 3.0 %.';
      guidance = ['Considerar profilaxis farmacológica (HBPM o HNF) o mecánica si el riesgo hemorrágico es elevado, según protocolo quirúrgico.'];
    } else {
      severity = score >= 9 ? 'critical' : 'high';
      riskClassification =
        score >= 9
          ? `Riesgo muy alto (${score} puntos)`
          : `Riesgo alto (${score} puntos)`;
      clinicalInterpretation =
        score >= 9
          ? 'Riesgo tromboembólico muy elevado (≥ 6 – 10 % sin profilaxis).'
          : 'Riesgo tromboembólico alto (≈ 6 % sin profilaxis).';
      guidance = [
        'Tromboprofilaxis combinada (farmacológica con HBPM/HNF + mecánica) salvo contraindicación por sangrado; en cirugía oncológica abdominopélvica mayor valorar profilaxis extendida (hasta 4 semanas) según guía ACCP/ASCO.',
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación de Caprini',
        value: score,
        formattedValue: String(score),
        unit: 'puntos',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'Verificar siempre la ausencia de hemorragia activa, trombocitopenia o incompatibilidad con catéter epidural.',
      formulaUsed: 'Suma ponderada de factores de riesgo de +1, +2, +3 y +5 puntos',
      inputsSummary: `Caprini total: ${score} puntos`,
    };
  },
};
