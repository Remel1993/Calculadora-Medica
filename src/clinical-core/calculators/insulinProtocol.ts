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
import { GLUCOSE_UNITS_MG_DL } from '../units/converters.ts';

const protocolModeField: SelectFieldDef = {
  id: 'protocolMode',
  label: 'Modo de cálculo según protocolo institucional',
  type: 'select',
  defaultValue: 'direct_fsi',
  options: [
    {
      value: 'direct_fsi',
      label: 'Protocolo directo (FSI y Ratio I:C configurables)',
      description: 'Introduce directamente el factor de sensibilidad y el ratio de carbohidratos de tu protocolo.',
    },
    {
      value: 'tdd_rule',
      label: 'Estimación por Dosis Diaria Total (Regla 1800 / 500)',
      description: 'Calcula FSI (1800 o 1500 / DDT) y ratio de carbohidratos (500 / DDT).',
    },
  ],
};

const currentGlucoseField: NumberFieldDef = {
  id: 'currentGlucose',
  label: 'Glucemia capilar o sérica actual',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: GLUCOSE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 20,
  max: 1000,
  placeholder: '240',
};

const targetGlucoseField: NumberFieldDef = {
  id: 'targetGlucose',
  label: 'Glucemia objetivo del protocolo',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: GLUCOSE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  defaultValue: '120',
  min: 80,
  max: 200,
  placeholder: '120',
  helpText: 'Habitualmente 100–140 mg/dL en esquema basal-bolo; 140–180 mg/dL en paciente hospitalizado estándar.',
};

const directFsiField: NumberFieldDef = {
  id: 'directFsi',
  label: 'Factor de Sensibilidad a la Insulina (FSI)',
  type: 'number',
  canonicalUnit: 'mg/dL por 1 U',
  units: [{ id: 'mg_dl_u', label: 'mg/dL / U', toCanonical: (v) => v }],
  defaultUnitId: 'mg_dl_u',
  defaultValue: '40',
  min: 5,
  max: 200,
  placeholder: '40',
  visibleWhen: (inputs) => inputs.protocolMode === 'direct_fsi',
  helpText: 'Cuántos mg/dL desciende la glucemia con 1 unidad de insulina rápida.',
};

const directIcRatioField: NumberFieldDef = {
  id: 'directIcRatio',
  label: 'Ratio Insulina : Carbohidratos (g por 1 U, opcional si sin ingesta)',
  type: 'number',
  canonicalUnit: 'g/U',
  units: [{ id: 'g_u', label: 'g / U', toCanonical: (v) => v }],
  defaultUnitId: 'g_u',
  defaultValue: '12',
  min: 2,
  max: 60,
  placeholder: '12',
  required: false,
  visibleWhen: (inputs) => inputs.protocolMode === 'direct_fsi',
};

const tddField: NumberFieldDef = {
  id: 'tdd',
  label: 'Dosis Diaria Total habitual de insulina (DDT)',
  type: 'number',
  canonicalUnit: 'U/día',
  units: [{ id: 'u_day', label: 'U/día', toCanonical: (v) => v }],
  defaultUnitId: 'u_day',
  min: 5,
  max: 300,
  placeholder: '45',
  visibleWhen: (inputs) => inputs.protocolMode === 'tdd_rule',
};

const insulinTypeField: SelectFieldDef = {
  id: 'insulinType',
  label: 'Tipo de insulina prandial / correctora',
  type: 'select',
  defaultValue: 'rapid',
  visibleWhen: (inputs) => inputs.protocolMode === 'tdd_rule',
  options: [
    { value: 'rapid', label: 'Análogo rápido (Lispro, Aspart, Glulisina) — Regla 1800' },
    { value: 'regular', label: 'Insulina Regular / Cristalina — Regla 1500' },
  ],
};

const carbsField: NumberFieldDef = {
  id: 'carbs',
  label: 'Carbohidratos de la ingesta actual (0 si es solo corrección)',
  type: 'number',
  canonicalUnit: 'g',
  units: [{ id: 'g', label: 'gramos', toCanonical: (v) => v }],
  defaultUnitId: 'g',
  defaultValue: '0',
  min: 0,
  max: 300,
  placeholder: '0',
};

export const insulinProtocolCalculator: CalculatorDefinition = {
  id: 'insulin-protocol',
  name: 'Cálculo de Insulina según Protocolo Configurable',
  shortName: 'Protocolo Insulina',
  primarySpecialty: 'endocrinologia',
  secondarySpecialties: ['medicina-interna', 'urgencias'],
  subcategory: 'dosificacion',
  keywords: [
    'insulina',
    'bolo',
    'correccion',
    'fsi',
    'sensibilidad',
    'carbohidratos',
    'regla 1800',
    'escala movil',
  ],
  description:
    'Herramienta parametrizable de apoyo para calcular dosis orientativas de corrección y cobertura prandial según el FSI y ratio institucional configurado.',
  clinicalIndication:
    'Apoyo aritmético en consulta o planta para esquemas basal-bolo personalizados (no sustituye protocolo de cetoacidosis/infusión IV).',
  validatedPopulation: 'Pacientes en esquema subcutáneo basal-bolo con parámetros individuales o institucionales definidos por su médico.',
  contraindications: [
    'NUNCA administrar insulina correctora si la glucemia es < 70 mg/dL (activar protocolo de hipoglucemia).',
    'No utilizar como guía de perfusión intravenosa en cetoacidosis diabética ni estado hiperosmolar.',
  ],
  limitations: [
    'No descuenta automáticamente la insulina activa residual (IOB, "insulin on board") de bolos administrados en las últimas 3–4 horas; verificar antes de corregir.',
    'Las reglas 1800/1500 y 500 son aproximaciones iniciales que requieren ajuste clínico según función renal, corticoides, sepsis, dieta NPO y edad.',
    'Las dosis se muestran redondeadas a 0.5 U y a entero más cercano para verificación segura del clínico.',
  ],
  version: 'ADA Basal-Bolo / Regla 1800-1500-500',
  references: [
    {
      citation:
        'American Diabetes Association. Diabetes Care in the Hospital: Standards of Care in Diabetes. Diabetes Care. 2024;47(Suppl. 1):S295-S306.',
      year: 2024,
    },
    {
      citation:
        'Walsh J, Roberts R, Bailey T. Guidelines for optimal bolus calculator settings in adults. J Diabetes Sci Technol. 2011;5(1):129-135.',
      year: 2011,
    },
  ],
  fields: [
    protocolModeField,
    currentGlucoseField,
    targetGlucoseField,
    directFsiField,
    directIcRatioField,
    tddField,
    insulinTypeField,
    carbsField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(insulinProtocolCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const mode = inputs.protocolMode as string;
    const gluRes = getCanonicalNumberValue(
      currentGlucoseField,
      inputs.currentGlucose as NumberInputValue,
    );
    const tgtRes = getCanonicalNumberValue(
      targetGlucoseField,
      inputs.targetGlucose as NumberInputValue,
    );
    const carbsRes = getCanonicalNumberValue(carbsField, inputs.carbs as NumberInputValue);

    const currentGlu = gluRes.canonicalValue!;
    const targetGlu = tgtRes.canonicalValue!;
    const carbs = carbsRes.canonicalValue!;

    let fsi = 40;
    let icRatio: number | null = 12;

    if (mode === 'direct_fsi') {
      const fsiRes = getCanonicalNumberValue(
        directFsiField,
        inputs.directFsi as NumberInputValue,
      );
      const icRes = getCanonicalNumberValue(
        directIcRatioField,
        inputs.directIcRatio as NumberInputValue,
      );
      fsi = fsiRes.canonicalValue!;
      icRatio = icRes.canonicalValue;
    } else {
      const tddRes = getCanonicalNumberValue(tddField, inputs.tdd as NumberInputValue);
      const tdd = tddRes.canonicalValue!;
      const numerator = inputs.insulinType === 'regular' ? 1500 : 1800;
      fsi = numerator / tdd;
      icRatio = 500 / tdd;
    }

    // Hypoglycemia safety lock
    if (currentGlu < 70) {
      return {
        primaryResult: {
          label: 'Dosis correctora bloqueada por seguridad',
          value: 0,
          formattedValue: '0',
          unit: 'Unidades',
        },
        secondaryResults: [
          {
            label: 'Glucemia actual',
            formattedValue: formatClinicalNumber(currentGlu, 0),
            unit: 'mg/dL',
            note: 'Umbral de hipoglucemia (< 70 mg/dL)',
          },
        ],
        severity: 'critical',
        riskClassification: 'Alerta de Hipoglucemia (< 70 mg/dL)',
        clinicalInterpretation:
          'No administrar insulina de corrección. Priorizar protocolo de hipoglucemia y reevaluar glucemia a los 15 minutos.',
        guidance: [
          'Evaluar tolerancia oral (15–20 g de carbohidratos de absorción rápida si está consciente) o dextrosa IV según protocolo institucional.',
        ],
        guidanceDisclaimer: 'Alerta de seguridad clínica; verificar estado de conciencia y causas desencadenantes.',
        formulaUsed: 'Bloqueo de seguridad cuando Glucemia < 70 mg/dL',
        inputsSummary: `Glucemia actual: ${gluRes.rawNumber} ${gluRes.unitLabel}`,
      };
    }

    const correctionRaw = Math.max(0, (currentGlu - targetGlu) / fsi);
    const prandialRaw = carbs > 0 && icRatio && icRatio > 0 ? carbs / icRatio : 0;
    const totalRaw = correctionRaw + prandialRaw;

    const totalHalfUnit = Math.round(totalRaw * 2) / 2;
    const totalWholeUnit = Math.round(totalRaw);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';

    if (currentGlu <= targetGlu && carbs === 0) {
      severity = 'normal';
      riskClassification = 'Dentro o debajo del objetivo (0 U de corrección)';
    } else if (currentGlu < 180) {
      severity = 'low';
      riskClassification = 'Hiperglucemia leve / Cobertura prandial';
    } else if (currentGlu < 250) {
      severity = 'moderate';
      riskClassification = 'Hiperglucemia moderada (180 – 249 mg/dL)';
    } else {
      severity = 'high';
      riskClassification = 'Hiperglucemia marcada (≥ 250 mg/dL)';
    }

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Componente de corrección',
        formattedValue: formatClinicalNumber(roundClinical(correctionRaw, 2), 2),
        unit: 'U (exacto)',
        note: `FSI aplicado: 1 U cada ${roundClinical(fsi, 1)} mg/dL sobre ${roundClinical(targetGlu, 0)} mg/dL`,
      },
      {
        label: 'Componente prandial (carbohidratos)',
        formattedValue: formatClinicalNumber(roundClinical(prandialRaw, 2), 2),
        unit: 'U (exacto)',
        note: icRatio ? `Ratio I:C aplicado: 1 U por ${roundClinical(icRatio, 1)} g` : 'Sin carbohidratos / Ratio no aplicado',
      },
      {
        label: 'Redondeo a entero estándar (jeringa/pluma 1 U)',
        formattedValue: String(totalWholeUnit),
        unit: 'U',
      },
    ];

    const guidance = [
      'Verificar que no exista insulina rápida activa (IOB) de una dosis previa en las últimas 3–4 horas antes de administrar corrección.',
    ];
    if (currentGlu >= 250) {
      guidance.push(
        'Con glucemia ≥ 250 mg/dL valorar cetonas en sangre/orina y estado ácido-base si el paciente presenta síntomas o diabetes tipo 1.',
      );
    }

    return {
      primaryResult: {
        label: 'Dosis orientativa total (redondeo a 0.5 U)',
        value: totalHalfUnit,
        formattedValue: formatClinicalNumber(totalHalfUnit, 1),
        unit: 'Unidades',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation: `Cálculo aritmético de ${totalRaw.toFixed(2)} U (${totalHalfUnit.toFixed(1)} U redondeado a medio punto; ${totalWholeUnit} U a entero) según los parámetros configurados.`,
      guidance,
      guidanceDisclaimer:
        'Herramienta de apoyo aritmético; la prescripción final depende del criterio médico, función renal y dieta actual.',
      formulaUsed: 'Dosis = max(0, (Glucemia - Objetivo) / FSI) + (Carbohidratos / Ratio I:C)',
      inputsSummary: `Glucemia: ${roundClinical(currentGlu, 0)} mg/dL · Objetivo: ${roundClinical(targetGlu, 0)} mg/dL · Carbohidratos: ${carbs} g`,
    };
  },
};
