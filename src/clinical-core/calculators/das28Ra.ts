import {
  formatClinicalNumber,
  getCanonicalNumberValue,
  roundClinical,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SecondaryResultItem,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const variantField: SelectFieldDef = {
  id: 'variant',
  label: 'Marcador inflamatorio utilizado',
  type: 'select',
  defaultValue: 'esr',
  options: [
    { value: 'esr', label: 'DAS28-VSG (Velocidad de Sedimentación Globular en mm/h)' },
    { value: 'crp', label: 'DAS28-PCR (Proteína C Reactiva en mg/L)' },
  ],
};

const tjcField: NumberFieldDef = {
  id: 'tjc',
  label: 'NAD28 · Articulaciones dolorosas (0 a 28)',
  type: 'number',
  canonicalUnit: 'articulaciones',
  units: [{ id: 'joints', label: 'art. (0–28)', toCanonical: (v) => v, min: 0, max: 28, step: 1 }],
  defaultUnitId: 'joints',
  defaultValue: '4',
  min: 0,
  max: 28,
  placeholder: '4',
  helpText: 'Evalúa hombros, codos, muñecas, MCF (10), IFP (10) y rodillas.',
};

const sjcField: NumberFieldDef = {
  id: 'sjc',
  label: 'NAT28 · Articulaciones tumefactas / inflamadas (0 a 28)',
  type: 'number',
  canonicalUnit: 'articulaciones',
  units: [{ id: 'joints', label: 'art. (0–28)', toCanonical: (v) => v, min: 0, max: 28, step: 1 }],
  defaultUnitId: 'joints',
  defaultValue: '2',
  min: 0,
  max: 28,
  placeholder: '2',
};

const ghField: NumberFieldDef = {
  id: 'gh',
  label: 'Evaluación global del paciente (EVA / GH, 0 a 100 mm)',
  type: 'number',
  canonicalUnit: 'mm',
  units: [{ id: 'mm', label: 'mm (0–100)', toCanonical: (v) => v, min: 0, max: 100, step: 1 }],
  defaultUnitId: 'mm',
  defaultValue: '35',
  min: 0,
  max: 100,
  placeholder: '35',
  helpText: '0 = excelente / sin actividad; 100 = peor estado posible.',
};

const esrField: NumberFieldDef = {
  id: 'esr',
  label: 'VSG (mm/h)',
  type: 'number',
  canonicalUnit: 'mm/h',
  units: [{ id: 'mm_h', label: 'mm/h', toCanonical: (v) => v, min: 1, max: 200, step: 1 }],
  defaultUnitId: 'mm_h',
  defaultValue: '28',
  min: 1,
  max: 200,
  placeholder: '28',
  visibleWhen: (inputs) => inputs.variant !== 'crp',
};

const crpField: NumberFieldDef = {
  id: 'crp',
  label: 'PCR (Proteína C Reactiva)',
  type: 'number',
  canonicalUnit: 'mg/L',
  units: [
    { id: 'mg_l', label: 'mg/L', toCanonical: (v) => v, min: 0, max: 500, step: 0.5 },
    { id: 'mg_dl', label: 'mg/dL', toCanonical: (v) => v * 10, min: 0, max: 50, step: 0.1 },
  ],
  defaultUnitId: 'mg_l',
  defaultValue: '12',
  min: 0,
  max: 500,
  placeholder: '12',
  helpText: '1 mg/dL equivale a 10 mg/L (la fórmula usa mg/L).',
  visibleWhen: (inputs) => inputs.variant === 'crp',
};

export const das28RaCalculator: CalculatorDefinition = {
  id: 'das28-ra',
  name: 'DAS28 (VSG y PCR) — Actividad de Artritis Reumatoide',
  shortName: 'DAS28 (Artritis Reumatoide)',
  primarySpecialty: 'medicina-interna',
  secondarySpecialties: ['traumatologia'],
  subcategory: 'gravedad',
  keywords: [
    'das28',
    'artritis reumatoide',
    'reumatologia',
    'vsg',
    'pcr',
    'remision',
    'treat to target',
    'consulta externa',
  ],
  description:
    'Cuantifica la actividad inflamatoria de la artritis reumatoide en 28 articulaciones mediante las ecuaciones validadas DAS28-VSG (Prevoo 1995) y DAS28-PCR (Fransen).',
  clinicalIndication:
    'Seguimiento ambulatorio "treat-to-target" (T2T) en artritis reumatoide para valorar remisión o necesidad de ajuste de FAME.',
  validatedPopulation: 'Adultos con diagnóstico de artritis reumatoide.',
  contraindications: [
    'No usar como herramienta diagnóstica inicial de artritis (para diagnóstico utilizar criterios ACR/EULAR 2010).',
  ],
  limitations: [
    'No evalúa articulaciones de los pies, tobillos ni caderas; en pacientes con afectación predominante de pies puede subestimar la actividad.',
    'El DAS28-PCR tiende a dar valores ligeramente más bajos que el DAS28-VSG (no deben intercambiarse en visitas seriadas del mismo paciente).',
    'Infecciones intercurrentes o fibromialgia concomitante pueden elevar la VSG/PCR o la EVA/NAD28 sin sinovitis activa real.',
  ],
  requiredLabsNote: 'Requiere VSG (mm/h) o PCR (mg/L o mg/dL) reciente.',
  version: 'Prevoo et al. (1995) · EULAR Treat-to-Target',
  references: [
    {
      citation:
        'Prevoo ML, van \'t Hof MA, Kuper HH, van Leeuwen MA, van de Putte LB, van Riel PL. Modified disease activity scores that include twenty-eight-joint counts. Arthritis Rheum. 1995;38(1):44-48.',
      year: 1995,
    },
    {
      citation:
        'Smolen JS, Landewé RBM, Bergstra SA, et al. EULAR recommendations for the management of rheumatoid arthritis with synthetic and biological disease-modifying antirheumatic drugs: 2022 update. Ann Rheum Dis. 2023;82(1):3-18.',
      year: 2023,
    },
  ],
  fields: [variantField, tjcField, sjcField, ghField, esrField, crpField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(das28RaCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const isCrp = inputs.variant === 'crp';
    const tjc = getCanonicalNumberValue(tjcField, inputs.tjc as NumberInputValue).canonicalValue!;
    const sjc = getCanonicalNumberValue(sjcField, inputs.sjc as NumberInputValue).canonicalValue!;
    const gh = getCanonicalNumberValue(ghField, inputs.gh as NumberInputValue).canonicalValue!;

    let das28 = 0;
    let labSummary = '';

    if (isCrp) {
      const crpMgL = getCanonicalNumberValue(crpField, inputs.crp as NumberInputValue).canonicalValue!;
      das28 = roundClinical(
        0.56 * Math.sqrt(tjc) +
          0.28 * Math.sqrt(sjc) +
          0.36 * Math.log(crpMgL + 1) +
          0.014 * gh +
          0.96,
        2,
      );
      labSummary = `PCR ${formatClinicalNumber(crpMgL, 1)} mg/L`;
    } else {
      const esr = getCanonicalNumberValue(esrField, inputs.esr as NumberInputValue).canonicalValue!;
      das28 = roundClinical(
        0.56 * Math.sqrt(tjc) +
          0.28 * Math.sqrt(sjc) +
          0.7 * Math.log(esr) +
          0.014 * gh,
        2,
      );
      labSummary = `VSG ${roundClinical(esr, 0)} mm/h`;
    }

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (das28 < 2.6) {
      severity = 'normal';
      riskClassification = `Remisión clínica (< 2.6 · ${formatClinicalNumber(das28, 2)})`;
      clinicalInterpretation =
        'Actividad inflamatoria controlada en rango de remisión según puntos de corte EULAR.';
      guidance.push(
        'Objetivo terapéutico alcanzado; mantener esquema actual y vigilar seguridad de FAME y posibles síntomas en articulaciones no incluidas (pies).',
      );
    } else if (das28 < 3.2) {
      severity = 'low';
      riskClassification = `Actividad baja (2.6 a < 3.2 · ${formatClinicalNumber(das28, 2)})`;
      clinicalInterpretation =
        'Baja actividad de la enfermedad; aceptable como meta alternativa en enfermedad de larga evolución si la remisión no es factible.';
      guidance.push('Continuar monitoreo cada 3–6 meses y valorar si es posible optimizar para alcanzar remisión completa (< 2.6).');
    } else if (das28 <= 5.1) {
      severity = 'high';
      riskClassification = `Actividad moderada (3.2–5.1 · ${formatClinicalNumber(das28, 2)})`;
      clinicalInterpretation =
        'Actividad inflamatoria moderada persistente con riesgo de progresión estructural articular si no se ajusta tratamiento.';
      guidance.push(
        'Revisar adherencia terapéutica y remitir/ajustar con Reumatología para optimizar FAME sintéticos o valorar terapia biológica/dirigida según estrategia Treat-to-Target.',
      );
    } else {
      severity = 'critical';
      riskClassification = `Actividad alta (> 5.1 · ${formatClinicalNumber(das28, 2)})`;
      clinicalInterpretation =
        'Alta actividad inflamatoria de artritis reumatoide; alto riesgo de daño erosivo y discapacidad funcional.';
      guidance.push(
        'Valoración prioritaria por Reumatología para intensificación terapéutica (FAME/terapia dirigida y terapia puente si procede), descartando infección activa concomitante.',
      );
    }

    const secondaryResults: SecondaryResultItem[] = [
      { label: 'Modalidad', formattedValue: isCrp ? 'DAS28-PCR' : 'DAS28-VSG', unit: '' },
      { label: 'Recuento articular', formattedValue: `NAD ${tjc}/28 · NAT ${sjc}/28`, unit: '' },
    ];

    return {
      primaryResult: {
        label: isCrp ? 'DAS28-PCR' : 'DAS28-VSG',
        value: das28,
        formattedValue: formatClinicalNumber(das28, 2),
        unit: 'pts',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: isCrp
        ? '0.56×√NAD + 0.28×√NAT + 0.36×ln(PCR[mg/L]+1) + 0.014×EVA + 0.96'
        : '0.56×√NAD + 0.28×√NAT + 0.70×ln(VSG) + 0.014×EVA',
      inputsSummary: `NAD ${tjc} · NAT ${sjc} · EVA ${gh} mm · ${labSummary}`,
    };
  },
};
