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

const bagPrepField: SelectFieldDef = {
  id: 'bagPrep',
  label: 'Preparación estándar de la bolsa de mantenimiento',
  type: 'select',
  defaultValue: '20g_500ml',
  options: [
    { value: '20g_500ml', label: '20 g de MgSO₄ en 500 mL de SS 0.9 % / RL (40 mg/mL)' },
    { value: '10g_500ml', label: '10 g de MgSO₄ en 500 mL de SS 0.9 % / RL (20 mg/mL)' },
    { value: '10g_250ml', label: '10 g de MgSO₄ en 250 mL de SS 0.9 % / RL (40 mg/mL)' },
  ],
};

export const obstetricMgso4Calculator: CalculatorDefinition = {
  id: 'obstetric-mgso4',
  name: 'Sulfato de Magnesio Obstétrico (Esquema Zuspan / Sibai IV)',
  shortName: 'MgSO₄ Obstétrico',
  primarySpecialty: 'gineco-obstetricia',
  secondarySpecialties: ['urgencias'],
  subcategory: 'dosificacion',
  keywords: ['sulfato de magnesio', 'mgso4', 'zuspan', 'preeclampsia', 'eclampsia', 'neuroproteccion', 'obstetricia'],
  description:
    'Cálculo seguro de preparación y velocidad en bomba (mL/h) para impregnación y mantenimiento intravenoso con MgSO₄ en preeclampsia con datos de severidad y eclampsia.',
  clinicalIndication:
    'Profilaxis de eclampsia en preeclampsia con criterios de severidad, tratamiento de crisis eclámptica y neuroprotección fetal (< 32 semanas).',
  validatedPopulation: 'Gestantes y puérperas (misma dosis de impregnación de 4 g en insuficiencia renal u oliguria, pero reduciendo o suspendiendo mantenimiento y vigilando magnesemia).',
  contraindications: [
    'Contraindicado en miastenia gravis, bloqueo auriculoventricular avanzado o hipocalcemia grave.',
    'En lesión renal aguda u oliguria (< 25–30 mL/h) el mantenimiento habitual de 1–2 g/h produce toxicidad rápida: requiere ajuste y niveles séricos de magnesio.',
  ],
  limitations: [
    'Nunca administrar la dosis de carga en bolo rápido sin bomba/control: la infusión rápida puede causar parada cardiorrespiratoria o hipotensión grave.',
    'Debe verificarse clínicamente cada hora: reflejo rotuliano presente, frecuencia respiratoria ≥ 12–16 rpm y diuresis ≥ 25–30 mL/h. Tener disponible Gluconato de Calcio 1 g (10 mL al 10 %) IV como antídoto.',
  ],
  version: 'Esquema Zuspan (OMS / ACOG PB 222)',
  references: [
    {
      citation: 'World Health Organization. WHO recommendations for prevention and treatment of pre-eclampsia and eclampsia. Geneva: WHO; 2011.',
      year: 2011,
    },
    {
      citation: 'ACOG Practice Bulletin No. 222: Gestational Hypertension and Preeclampsia. Obstet Gynecol. 2020;135(6):e237-e260.',
      year: 2020,
    },
  ],
  fields: [loadingDoseField, loadingTimeField, maintRateField, bagPrepField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(obstetricMgso4Calculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const loadingG = Number(inputs.loadingGrams);
    const loadingMin = Number(inputs.loadingMinutes);
    const maintGPerH = Number(inputs.maintGramsHour);
    const bagPrep = inputs.bagPrep as string;

    // Standard loading dilution in 100 mL total (or 250 mL if 6g institutional; using 100 mL compatible)
    const loadingVolMl = 100;
    const loadingRateMlH = roundClinical((loadingVolMl * 60) / loadingMin, 0);

    let bagGrams = 20;
    let bagVolMl = 500;
    if (bagPrep === '10g_500ml') {
      bagGrams = 10;
      bagVolMl = 500;
    } else if (bagPrep === '10g_250ml') {
      bagGrams = 10;
      bagVolMl = 250;
    }

    const concGPerMl = bagGrams / bagVolMl;
    const maintRateMlH = roundClinical(maintGPerH / concGPerMl, 1);
    const bagDurationH = roundClinical(bagGrams / maintGPerH, 1);

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
          unit: `(${bagGrams} g en ${bagVolMl} mL · dura ${bagDurationH} h)`,
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
        `Administrar ${loadingG} g IV en ${loadingMin} min (100 mL a ${loadingRateMlH} mL/h) seguido de perfusión continua de ${maintGPerH} g/h (${maintRateMlH} mL/h con la dilución seleccionada).`,
      guidance: [
        'Suspender inmediatamente el mantenimiento si abolición de reflejos osteotendinosos, FR < 12 rpm o diuresis < 25–30 mL/h; mantener mínimo hasta 24 h posparto o tras la última convulsión.',
        'Control estricto de aporte hídrico total IV (habitualmente ≤ 80 mL/h en preeclampsia severa para evitar edema agudo de pulmón).',
      ],
      formulaUsed: 'Velocidad (mL/h) = Dosis horaria (g/h) / Concentración (g/mL)',
      inputsSummary: `Carga: ${loadingG} g/${loadingMin} min · Mant: ${maintGPerH} g/h en mezcla ${bagGrams} g/${bagVolMl} mL`,
    };
  },
};
