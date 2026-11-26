import {
  formatClinicalNumber,
  roundClinical,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const loadingDoseField: SelectFieldDef = {
  id: 'loadingGrams',
  label: 'Dosis de impregnación IV de Sulfato de Magnesio (MgSO₄)',
  type: 'select',
  defaultValue: '4',
  options: [
    { value: '4', label: '4 g IV (Esquema Zuspan / OMS estándar en 20 min)' },
    { value: '6', label: '6 g IV (Esquema Sibai / alternativa ACOG en 20 min)' },
  ],
};

const loadingTimeField: SelectFieldDef = {
  id: 'loadingMinutes',
  label: 'Tiempo de infusión de la dosis de carga',
  type: 'select',
  defaultValue: '20',
  options: [
    { value: '15', label: '15 minutos' },
    { value: '20', label: '20 minutos (estándar)' },
  ],
};

const maintRateField: SelectFieldDef = {
  id: 'maintGramsHour',
  label: 'Dosis de mantenimiento IV horaria',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '1', label: '1 g/hora (Esquema Zuspan / OMS estándar)' },
    { value: '2', label: '2 g/hora (Esquema Sibai / protocolo alternativo)' },
  ],
};

const loadingPrepField: SelectFieldDef = {
  id: 'loadingPrep',
  label: 'Dilución de dosis de impregnación IV',
  type: 'select',
  required: false,
  defaultValue: '100ml',
  options: [
    { value: '100ml', label: '100 mL de SS 0.9 % / RL (estándar internacional)' },
    { value: '200ml', label: '200 mL de SSN / RL / D5% (Normativa 109 MINSA Nicaragua)' },
  ],
};

const bagPrepField: SelectFieldDef = {
  id: 'bagPrep',
  label: 'Preparación estándar de la bolsa de mantenimiento',
  type: 'select',
  defaultValue: '20g_500ml',
  options: [
    { value: '20g_500ml', label: '20 g de MgSO₄ en 500 mL de SS 0.9 % / RL (40 mg/mL)' },
    { value: '8g_420ml', label: '8 g de MgSO₄ al 10 % (80 mL) + 420 mL de SSN = 500 mL (Normativa 109 MINSA · 16 mg/mL)' },
    { value: '10g_500ml', label: '10 g de MgSO₄ en 500 mL de SS 0.9 % / RL (20 mg/mL)' },
    { value: '10g_250ml', label: '10 g de MgSO₄ en 250 mL de SS 0.9 % / RL (40 mg/mL)' },
  ],
};

export const obstetricMgso4Calculator: CalculatorDefinition = {
  id: 'obstetric-mgso4',
  name: 'Sulfato de Magnesio Obstétrico (Esquema Zuspan · MINSA Normativa 109)',
  shortName: 'MgSO₄ Obstétrico (MINSA 109)',
  primarySpecialty: 'gineco-obstetricia',
  secondarySpecialties: ['urgencias'],
  subcategory: 'dosificacion',
  keywords: ['sulfato de magnesio', 'mgso4', 'zuspan', 'preeclampsia', 'eclampsia', 'neuroproteccion', 'obstetricia', 'normativa 109', 'minsa', 'nicaragua'],
  description:
    'Cálculo seguro de preparación, gotas/microgotas y velocidad en bomba (mL/h) para impregnación y mantenimiento IV con MgSO₄ según Esquema Zuspan / Sibai y Normativa 109 MINSA Nicaragua.',
  clinicalIndication:
    'Profilaxis de eclampsia en preeclampsia con criterios de severidad, tratamiento de crisis eclámptica y neuroprotección fetal (< 32 semanas).',
  validatedPopulation: 'Gestantes y puérperas (misma dosis de impregnación de 4 g en insuficiencia renal u oliguria, pero reduciendo o suspendiendo mantenimiento y vigilando magnesemia).',
  contraindications: [
    'Contraindicado en miastenia gravis, bloqueo auriculoventricular avanzado o hipocalcemia grave.',
    'En lesión renal aguda u oliguria (< 30 mL/h) el mantenimiento habitual de 1–2 g/h produce toxicidad rápida: requiere ajuste y niveles séricos de magnesio.',
  ],
  limitations: [
    'Nunca administrar la dosis de carga en bolo rápido sin control: la infusión rápida puede causar parada cardiorrespiratoria o hipotensión grave.',
    'Verificar cada hora: reflejo rotuliano presente, frecuencia respiratoria (≥ 13 rpm según Normativa 109 MINSA / ≥ 12–16 rpm según ACOG) y diuresis ≥ 30 mL/h. Tener disponible Gluconato de Calcio 1 g (10 mL al 10 %) IV como antídoto.',
  ],
  version: 'Esquema Zuspan · Normativa 109 MINSA Nicaragua · OMS / ACOG PB 222',
  references: [
    {
      citation: 'Ministerio de Salud de Nicaragua (MINSA). Normativa 109: Protocolos para la Atención de las Complicaciones Obstétricas (Preeclampsia/Eclampsia, Esquema Zuspan). Managua: MINSA.',
      year: 2018,
    },
    {
      citation: 'World Health Organization. WHO recommendations for prevention and treatment of pre-eclampsia and eclampsia. Geneva: WHO; 2011.',
      year: 2011,
    },
    {
      citation: 'ACOG Practice Bulletin No. 222: Gestational Hypertension and Preeclampsia. Obstet Gynecol. 2020;135(6):e237-e260.',
      year: 2020,
    },
  ],
  fields: [loadingDoseField, loadingTimeField, loadingPrepField, maintRateField, bagPrepField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(obstetricMgso4Calculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const loadingG = Number(inputs.loadingGrams);
    const loadingMin = Number(inputs.loadingMinutes);
    const loadingPrep = (inputs.loadingPrep as string) || '100ml';
    const maintGPerH = Number(inputs.maintGramsHour);
    const bagPrep = inputs.bagPrep as string;

    const loadingVolMl = loadingPrep === '200ml' ? 200 : 100;
    const loadingRateMlH = roundClinical((loadingVolMl * 60) / loadingMin, 0);

    let bagGrams = 20;
    let bagVolMl = 500;
    if (bagPrep === '8g_420ml') {
      bagGrams = 8;
      bagVolMl = 500; // 80 mL MgSO4 10% (8 amp de 1 g/10 mL) + 420 mL SSN = 500 mL totales
    } else if (bagPrep === '10g_500ml') {
      bagGrams = 10;
      bagVolMl = 500;
    } else if (bagPrep === '10g_250ml') {
      bagGrams = 10;
      bagVolMl = 250;
    }

    const concGPerMl = bagGrams / bagVolMl;
    const maintRateMlH = roundClinical(maintGPerH / concGPerMl, 1);
    const bagDurationH = roundClinical(bagGrams / maintGPerH, 1);
    const macroDropsPerMin = roundClinical(maintRateMlH / 3, 0);
    const microDropsPerMin = roundClinical(maintRateMlH, 0);

    const severity: SeverityLevel = 'info';

    return {
      primaryResult: {
        label: 'Velocidad de mantenimiento en bomba',
        value: maintRateMlH,
        formattedValue: formatClinicalNumber(maintRateMlH, 1),
        unit: 'mL/h',
      },
      secondaryResults: [
        {
          label: `Impregnación (${loadingG} g diluidos en ${loadingVolMl} mL a pasar en ${loadingMin} min)`,
          formattedValue: `${loadingRateMlH} mL/h`,
          unit: `(${loadingVolMl} mL en ${loadingMin} min)`,
        },
        {
          label: 'Concentración de bolsa de mantenimiento',
          formattedValue: `${Math.round(concGPerMl * 1000)} mg/mL`,
          unit:
            bagPrep === '8g_420ml'
              ? `(80 mL MgSO₄ 10 % + 420 mL SSN = 500 mL · dura ${bagDurationH} h · ≈ ${microDropsPerMin} microgotas/min o ${macroDropsPerMin} gotas/min)`
              : `(${bagGrams} g en ${bagVolMl} mL · dura ${bagDurationH} h)`,
        },
        {
          label: 'Antídoto de seguridad disponible a pie de cama',
          formattedValue: 'Gluconato de calcio 1 g IV',
          unit: '(10 mL al 10 % en 3–5 min si toxicidad)',
        },
      ],
      severity,
      riskClassification: `Impregnación ${loadingG} g (${loadingRateMlH} mL/h) → Mantenimiento ${maintGPerH} g/h (${maintRateMlH} mL/h)`,
      clinicalInterpretation:
        `Administrar ${loadingG} g IV en ${loadingMin} min (${loadingVolMl} mL a ${loadingRateMlH} mL/h) seguido de perfusión continua de ${maintGPerH} g/h (${maintRateMlH} mL/h; ≈ ${microDropsPerMin} microgotas/min o ${macroDropsPerMin} gotas/min con equipo de venoclisis estándar).`,
      guidance: [
        'Normativa 109 MINSA (Zuspan): Carga 4 g de MgSO₄ al 10 % (4 ampollas de 1 g/10 mL) en 200 mL de SSN/RL/D5% en 5–15 min; mantenimiento c/8 h con 8 g en 420 mL de SSN a 60 microgotas/min (20 gotas/min = 1 g/h) hasta 24 h posparto o última convulsión. Si recurre convulsión > 15 min poscarga, administrar refuerzo de 2 g IV en 100 mL en ~5 min.',
        'Suspender inmediatamente el mantenimiento si abolición de reflejos osteotendinosos, FR < 13 rpm (Normativa 109) o diuresis < 30 mL/h (en 4 h previas). Control estricto de líquidos IV totales.',
        'Emergencia hipertensiva (PAS ≥ 160 o PAD ≥ 110 mmHg): Hidralazina 5 mg IV bolo lento c/15 min (máx 4 dosis), Labetalol IV (10 mg inicial) o Nifedipina acción rápida VÍA ORAL únicamente (NUNCA sublingual).',
      ],
      formulaUsed: 'Velocidad (mL/h) = Dosis horaria (g/h) / Concentración (g/mL) · Normativa 109 MINSA: 8 g (80 mL) + 420 mL SSN = 500 mL',
      inputsSummary: `Carga: ${loadingG} g/${loadingMin} min (${loadingVolMl} mL) · Mant: ${maintGPerH} g/h en mezcla ${bagGrams} g/${bagVolMl} mL`,
    };
  },
};
