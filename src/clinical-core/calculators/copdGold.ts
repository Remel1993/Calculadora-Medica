import {
  formatClinicalNumber,
  getCanonicalNumberValue,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const exacerbationsField: SelectFieldDef = {
  id: 'exacerbations',
  label: 'Historial de exacerbaciones en los últimos 12 meses',
  type: 'select',
  defaultValue: 'low',
  options: [
    { value: 'low', label: '0 o 1 exacerbación moderada (sin hospitalización)' },
    { value: 'high', label: '≥ 2 exacerbaciones moderadas o ≥ 1 con hospitalización' },
  ],
};

const mmrcField: SelectFieldDef = {
  id: 'mmrc',
  label: 'Escala de disnea mMRC (Modified Medical Research Council)',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '0', label: 'Grado 0 — Disnea solo con ejercicio intenso', points: 0 },
    { value: '1', label: 'Grado 1 — Disnea al andar deprisa en llano o subir pendiente leve', points: 1 },
    { value: '2', label: 'Grado 2 — Camina más lento que personas de su edad o se detiene en llano', points: 2 },
    { value: '3', label: 'Grado 3 — Se detiene por falta de aire tras ~100 m o pocos minutos', points: 3 },
    { value: '4', label: 'Grado 4 — Disnea que impide salir de casa o al vestirse/desvestirse', points: 4 },
  ],
};

const catField: NumberFieldDef = {
  id: 'catScore',
  label: 'Puntuación CAT (COPD Assessment Test, opcional)',
  type: 'number',
  required: false,
  canonicalUnit: 'pts',
  units: [{ id: 'pts', label: 'puntos (0–40)', toCanonical: (v) => v, min: 0, max: 40, step: 1 }],
  defaultUnitId: 'pts',
  min: 0,
  max: 40,
  placeholder: '12',
  helpText: 'Si se introduce (0–40), CAT ≥ 10 clasifica carga sintomática alta junto con mMRC ≥ 2.',
};

const fev1Field: NumberFieldDef = {
  id: 'fev1Percent',
  label: 'FEV₁ posbroncodilatador (% predicho, opcional)',
  type: 'number',
  required: false,
  canonicalUnit: '%',
  units: [{ id: 'pct', label: '% predicho', toCanonical: (v) => v, min: 10, max: 130, step: 1 }],
  defaultUnitId: 'pct',
  min: 10,
  max: 130,
  placeholder: '58',
  helpText: 'Clasifica gravedad espirométrica GOLD 1–4 cuando la relación FEV₁/FVC < 0.70.',
};

export const copdGoldCalculator: CalculatorDefinition = {
  id: 'copd-gold',
  name: 'EPOC — Clasificación GOLD (ABE), mMRC y CAT',
  shortName: 'EPOC GOLD (ABE)',
  primarySpecialty: 'neumologia',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'diagnostico',
  keywords: ['epoc', 'copd', 'gold', 'abe', 'mmrc', 'cat', 'disnea', 'fev1', 'espirometria'],
  description:
    'Clasifica la Enfermedad Pulmonar Obstructiva Crónica en grupos GOLD A, B o E integrando disnea (mMRC), impacto sintomático (CAT) y exacerbaciones, más grado espirométrico GOLD 1–4.',
  clinicalIndication:
    'Evaluación inicial y estratificación clínica de pacientes adultos con diagnóstico espirométrico confirmado de EPOC (FEV₁/FVC posbroncodilatador < 0.70).',
  validatedPopulation: 'Adultos ≥ 40 años con diagnóstico espirométrico de EPOC.',
  contraindications: [
    'No utilizar para diagnosticar EPOC sin confirmación espirométrica previa (FEV₁/FVC pos-BD < 0.70).',
    'No aplica para clasificar exacerbación aguda de EPOC en curso (evaluar gasometría, trabajo respiratorio y criterios de hospitalización).',
  ],
  limitations: [
    'Desde GOLD 2023–2025 los antiguos grupos C y D se fusionaron en el Grupo E (Exacerbador).',
    'La elección entre LABA+LAMA vs triple terapia (LABA+LAMA+ICS) en Grupo E y Grupo B depende además del recuento de eosinófilos en sangre (≥ 300 cél/µL o ≥ 100 cél/µL).',
  ],
  version: 'GOLD 2024 / 2025 (Esquema ABE)',
  references: [
    {
      citation:
        'Global Initiative for Chronic Obstructive Lung Disease (GOLD). Global Strategy for Prevention, Diagnosis and Management of COPD: 2024 Report. Eur Respir J. 2024.',
      year: 2024,
    },
  ],
  fields: [exacerbationsField, mmrcField, catField, fev1Field],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(copdGoldCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const highExac = inputs.exacerbations === 'high';
    const mmrc = Number(inputs.mmrc);
    const catVal = getCanonicalNumberValue(catField, inputs.catScore as NumberInputValue).canonicalValue;
    const fev1Val = getCanonicalNumberValue(fev1Field, inputs.fev1Percent as NumberInputValue).canonicalValue;

    const highSymptoms = mmrc >= 2 || (catVal !== null && catVal >= 10);

    let group: 'A' | 'B' | 'E' = 'A';
    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (highExac) {
      group = 'E';
      severity = 'high';
      riskClassification = 'GOLD Grupo E (Alto riesgo de exacerbaciones)';
      clinicalInterpretation =
        '≥ 2 exacerbaciones moderadas o ≥ 1 hospitalización en el último año, independientemente del nivel de disnea basal.';
      guidance = [
        'Terapia inicial orientativa GOLD: doble broncodilatación (LABA + LAMA); valorar triple terapia (LABA + LAMA + ICS) si eosinófilos ≥ 300 cél/µL.',
        'Vacunación (influenza, neumococo, VRS, COVID-19, dTpa), cese tabáquico y rehabilitación pulmonar.',
      ];
    } else if (highSymptoms) {
      group = 'B';
      severity = 'moderate';
      riskClassification = 'GOLD Grupo B (Carga sintomática alta, bajo riesgo de exacerbación)';
      clinicalInterpretation = `Carga sintomática elevada (mMRC ${mmrc}${catVal !== null ? `, CAT ${catVal}` : ''}) con 0–1 exacerbación ambulatoria al año.`;
      guidance = [
        'Terapia inicial orientativa GOLD: combinación LABA + LAMA.',
        'Rehabilitación pulmonar, técnica inhalatoria, cese tabáquico y vacunación vigente.',
      ];
    } else {
      group = 'A';
      severity = 'low';
      riskClassification = 'GOLD Grupo A (Pocos síntomas, bajo riesgo de exacerbación)';
      clinicalInterpretation = `Baja carga sintomática (mMRC ${mmrc}${catVal !== null ? `, CAT ${catVal}` : ''}) y 0–1 exacerbación ambulatoria sin ingreso.`;
      guidance = [
        'Terapia inicial orientativa GOLD: un broncodilatador (de acción corta o preferiblemente prolongada según disponibilidad).',
        'Cese tabáquico, actividad física regular y esquema de vacunación respiratoria.',
      ];
    }

    let spirometryGrade = 'No introducido';
    if (fev1Val !== null) {
      if (fev1Val >= 80) spirometryGrade = `GOLD 1 — Leve (FEV₁ ${formatClinicalNumber(fev1Val, 0)} %)`;
      else if (fev1Val >= 50) spirometryGrade = `GOLD 2 — Moderada (FEV₁ ${formatClinicalNumber(fev1Val, 0)} %)`;
      else if (fev1Val >= 30) spirometryGrade = `GOLD 3 — Grave (FEV₁ ${formatClinicalNumber(fev1Val, 0)} %)`;
      else spirometryGrade = `GOLD 4 — Muy grave (FEV₁ ${formatClinicalNumber(fev1Val, 0)} %)`;
    }

    return {
      primaryResult: {
        label: 'Clasificación GOLD ABE',
        value: group === 'A' ? 1 : group === 'B' ? 2 : 3,
        formattedValue: `Grupo ${group}`,
        unit: fev1Val !== null ? spirometryGrade.split(' — ')[0] : '',
      },
      secondaryResults: [
        { label: 'Disnea mMRC', formattedValue: `Grado ${mmrc}`, unit: mmrc >= 2 ? '(≥ 2: sintomático)' : '(0–1)' },
        ...(catVal !== null
          ? [{ label: 'Cuestionario CAT', formattedValue: String(catVal), unit: '/ 40 pts' }]
          : []),
        { label: 'Gravedad espirométrica (FEV₁)', formattedValue: spirometryGrade, unit: '' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'Orientación basada en reporte GOLD; confirmar FEV₁/FVC < 0.70 pos-BD y revisar eosinófilos en sangre.',
      formulaUsed: 'GOLD ABE: (≥2 exac. mod o ≥1 hosp → E) | si no: (mMRC ≥2 o CAT ≥10 → B; otro → A)',
      inputsSummary: `Exacerbaciones: ${highExac ? '≥2 o ≥1 hosp' : '0–1 sin hosp'} · mMRC: ${mmrc}${catVal !== null ? ` · CAT: ${catVal}` : ''}${fev1Val !== null ? ` · FEV₁: ${fev1Val}%` : ''}`,
    };
  },
};
