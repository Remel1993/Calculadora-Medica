import {
  formatClinicalNumber,
  getCanonicalNumberValue,
  roundClinical,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SecondaryResultItem,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';
import {
  ELECTROLYTE_UNITS_MEQ_L,
  GLUCOSE_UNITS_MG_DL,
  WEIGHT_UNITS_KG,
} from '../units/converters.ts';

const weightField: NumberFieldDef = {
  id: 'weight',
  label: 'Peso corporal del paciente',
  type: 'number',
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  min: 20,
  max: 250,
  placeholder: '70',
};

const glucoseField: NumberFieldDef = {
  id: 'glucose',
  label: 'Glucosa plasmática actual',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: GLUCOSE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 40,
  max: 2000,
  placeholder: '420',
};

const priorDiabetesField: BooleanFieldDef = {
  id: 'priorDiabetes',
  label: '¿Antecedente conocido de diabetes (incluye uso de iSGLT2 o CAD euglucémica)?',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No / Debut',
  defaultValue: true,
};

const phField: NumberFieldDef = {
  id: 'ph',
  label: 'pH arterial o venoso',
  type: 'number',
  canonicalUnit: 'pH',
  units: [{ id: 'ph', label: 'pH', toCanonical: (v) => v }],
  defaultUnitId: 'ph',
  min: 6.5,
  max: 7.7,
  placeholder: '7.18',
};

const hco3Field: NumberFieldDef = {
  id: 'hco3',
  label: 'Bicarbonato sérico (HCO₃⁻)',
  type: 'number',
  canonicalUnit: 'mEq/L',
  units: ELECTROLYTE_UNITS_MEQ_L,
  defaultUnitId: 'meq_l',
  min: 1,
  max: 45,
  placeholder: '12',
};

const ketonesField: SelectFieldDef = {
  id: 'ketones',
  label: 'Cetonemia (β-hidroxibutirato) o cetonuria',
  type: 'select',
  defaultValue: 'positive',
  options: [
    {
      value: 'positive',
      label: 'Positiva significativa (β-hidroxibutirato ≥ 3.0 mmol/L o cetonuria ≥ 2+)',
    },
    {
      value: 'borderline',
      label: 'Leve / limítrofe (β-hidroxibutirato 1.0–2.9 mmol/L o cetonuria trazas/1+)',
    },
    {
      value: 'negative',
      label: 'Negativa (β-hidroxibutirato < 1.0 mmol/L o cetonuria negativa)',
    },
  ],
};

const sodiumField: NumberFieldDef = {
  id: 'sodium',
  label: 'Sodio sérico medido (Na⁺)',
  type: 'number',
  canonicalUnit: 'mEq/L',
  units: ELECTROLYTE_UNITS_MEQ_L,
  defaultUnitId: 'meq_l',
  min: 100,
  max: 190,
  placeholder: '132',
};

const potassiumField: NumberFieldDef = {
  id: 'potassium',
  label: 'Potasio sérico actual (K⁺ — OBLIGATORIO antes de iniciar insulina)',
  type: 'number',
  canonicalUnit: 'mEq/L',
  units: ELECTROLYTE_UNITS_MEQ_L,
  defaultUnitId: 'meq_l',
  min: 1.5,
  max: 9.0,
  placeholder: '4.1',
  helpText: 'Consenso ADA 2024: si K⁺ < 3.5 mEq/L, diferir insulina y reponer potasio primero.',
};

const mentalStatusField: SelectFieldDef = {
  id: 'mentalStatus',
  label: 'Estado neurológico',
  type: 'select',
  defaultValue: 'alert',
  options: [
    { value: 'alert', label: 'Alerta y orientado' },
    { value: 'drowsy', label: 'Somnoliento / obnubilado' },
    { value: 'stupor', label: 'Estupor o coma' },
  ],
};

export const hyperglycemicCrisesCalculator: CalculatorDefinition = {
  id: 'hyperglycemic-crises-ada',
  name: 'Crisis Hiperglucémicas (CAD y EHH — Criterios ADA 2024, Potasio e Insulina IV)',
  shortName: 'Crisis CAD / EHH (ADA 2024)',
  primarySpecialty: 'urgencias',
  secondarySpecialties: ['endocrinologia', 'medicina-interna'],
  subcategory: 'dosificacion',
  keywords: [
    'cetoacidosis',
    'cad',
    'dka',
    'estado hiperosmolar',
    'ehh',
    'hhs',
    'insulina iv',
    'potasio',
    'diabetes',
    'urgencias',
    'ada 2024',
  ],
  description:
    'Clasifica Cetoacidosis Diabética (leve, moderada, grave), Estado Hiperosmolar Hiperglucémico (EHH) o cuadro mixto según el Consenso ADA/EASD/JBDS 2024, aplicando bloqueo de seguridad por hipokalemia y cálculo de infusión IV.',
  clinicalIndication:
    'Atención inicial en urgencias y UCI de adultos con hiperglucemia aguda, sospecha de cetoacidosis (incluyendo CAD euglucémica) o estado hiperosmolar.',
  validatedPopulation: 'Adultos ≥ 18 años con crisis hiperglucémica (ADA/EASD/JBDS 2024).',
  requiredLabsNote: 'Requiere glucemia, gasometría (pH y HCO₃⁻), cetonas (β-hidroxibutirato u orina), Na⁺ y K⁺.',
  contraindications: [
    'NUNCA iniciar insulina IV si el potasio sérico es < 3.5 mEq/L (riesgo de arritmia ventricular letal y parálisis respiratoria); reponer K⁺ primero.',
    'En pacientes pediátricos (< 18 años) existen protocolos específicos ISPAD (habitualmente sin bolo inicial de insulina y con vigilancia estricta de edema cerebral).',
  ],
  limitations: [
    'La fórmula de osmolaridad efectiva usada aquí es 2 × Na⁺ medido + Glucosa / 18 (sin sumar urea, que es osmólito inefectivo).',
    'La tasa estándar de reposición hídrica debe individualizarse en insuficiencia cardíaca, enfermedad renal avanzada o ancianos frágiles.',
  ],
  version: 'ADA/EASD/JBDS Consensus Report (Umpierrez et al., 2024)',
  references: [
    {
      citation:
        'Umpierrez GE, Davis GM, ElSayed NA, et al. Hyperglycemic Crises in Adults With Diabetes: A Consensus Report. Diabetes Care. 2024;47(8):1257-1275.',
      year: 2024,
    },
  ],
  fields: [
    weightField,
    glucoseField,
    priorDiabetesField,
    phField,
    hco3Field,
    ketonesField,
    sodiumField,
    potassiumField,
    mentalStatusField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(hyperglycemicCrisesCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const weight = getCanonicalNumberValue(weightField, inputs.weight as NumberInputValue).canonicalValue!;
    const glucose = getCanonicalNumberValue(glucoseField, inputs.glucose as NumberInputValue).canonicalValue!;
    const priorDm = inputs.priorDiabetes === true;
    const ph = getCanonicalNumberValue(phField, inputs.ph as NumberInputValue).canonicalValue!;
    const hco3 = getCanonicalNumberValue(hco3Field, inputs.hco3 as NumberInputValue).canonicalValue!;
    const ketones = inputs.ketones as 'positive' | 'borderline' | 'negative';
    const sodium = getCanonicalNumberValue(sodiumField, inputs.sodium as NumberInputValue).canonicalValue!;
    const potassium = getCanonicalNumberValue(potassiumField, inputs.potassium as NumberInputValue).canonicalValue!;
    const mental = inputs.mentalStatus as 'alert' | 'drowsy' | 'stupor';

    const effectiveOsm = roundClinical(2 * sodium + glucose / 18, 1);
    const correctedNa = roundClinical(sodium + 0.016 * Math.max(0, glucose - 100), 1);
    const correctedNaHillier = roundClinical(sodium + 0.024 * Math.max(0, glucose - 100), 1);

    // 2024 ADA DKA Criteria:
    // D: Glucose >= 200 mg/dL OR prior diabetes
    // K: BHB >= 3.0 mmol/L or urine ketones >= 2+
    // A: pH < 7.30 and/or HCO3 < 18 mEq/L
    const meetsDkaD = glucose >= 200 || priorDm;
    const meetsDkaK = ketones === 'positive';
    const meetsDkaA = ph < 7.3 || hco3 < 18;
    const isDka = meetsDkaD && meetsDkaK && meetsDkaA;

    // 2024 ADA HHS Criteria:
    // Glucose >= 600 mg/dL, Effective Osm > 300 mOsm/kg, pH >= 7.30, HCO3 >= 15, BHB < 3.0 (MUST exclude significant ketosis!)
    const isHyperosmolar = glucose >= 600 && effectiveOsm > 300;
    const isHhsPure = isHyperosmolar && !isDka && ketones !== 'positive' && ph >= 7.3 && hco3 >= 15;
    const isMixedKetosisAlkalosis = !isDka && meetsDkaD && meetsDkaK && ph >= 7.3 && hco3 >= 18;
    const isMixed = (isDka || isMixedKetosisAlkalosis) && isHyperosmolar;

    let dkaSeverityLabel = '';
    if (isDka) {
      if (ph < 7.0 || hco3 < 10 || mental === 'stupor') {
        dkaSeverityLabel = 'CAD Grave';
      } else if (ph < 7.25 || hco3 < 15 || mental === 'drowsy') {
        dkaSeverityLabel = 'CAD Moderada';
      } else {
        dkaSeverityLabel = 'CAD Leve';
      }
    }

    let diagnosisTitle = '';
    let severity: SeverityLevel = 'moderate';
    let interpretation = '';

    if (isMixed) {
      diagnosisTitle = isMixedKetosisAlkalosis
        ? 'Cuadro Mixto: Cetosis significativa (alcalosis enmascarante) + EHH'
        : `Cuadro Mixto: ${dkaSeverityLabel} + Estado Hiperosmolar (EHH)`;
      severity = 'critical';
      interpretation = isMixedKetosisAlkalosis
        ? 'Hiperosmolaridad (osmolaridad efectiva > 300 mOsm/kg) y glucemia ≥ 600 mg/dL asociadas a cetosis significativa (β-HB ≥ 3.0 o cetonuria ≥ 2+) con pH/HCO₃⁻ preservados o elevados (sospechar alcalosis metabólica concomitante por vómitos o diuréticos que enmascara la cetoacidosis). NO tratar como EHH puro.'
        : 'Cumple simultáneamente criterios de cetoacidosis diabética y estado hiperosmolar hiperglucémico (osmolaridad efectiva > 300 mOsm/kg y glucemia ≥ 600 mg/dL).';
    } else if (isDka) {
      const euglycemicNote = glucose < 200 ? ' (CAD Euglucémica)' : '';
      diagnosisTitle = `${dkaSeverityLabel}${euglycemicNote} (Criterios ADA 2024)`;
      severity = dkaSeverityLabel === 'CAD Grave' ? 'critical' : 'high';
      interpretation =
        glucose < 200
          ? 'Cumple criterios de CAD con glucemia < 200 mg/dL (CAD euglucémica; investigar uso de iSGLT2, ayuno, embarazo o alcohol). Requiere dextrosa desde el inicio junto con insulina para aclarar cetonas.'
          : 'Cumple la tríada diagnóstica ADA 2024: hiperglucemia/diabetes previa + cetosis significativa + acidosis metabólica.';
    } else if (isMixedKetosisAlkalosis) {
      diagnosisTitle = 'Cetoacidosis potencial enmascarada por alcalosis (Cetonas positivas con pH ≥ 7.30)';
      severity = 'high';
      interpretation =
        'Cetonemia/cetonuria significativa con pH ≥ 7.30 y HCO₃⁻ ≥ 18 mEq/L: cuadro compatible con trastorno ácido-base mixto (cetoacidosis diabética + alcalosis metabólica por vómitos, aspiración gástrica o diuréticos). Calcular Brecha Aniónica (Anion Gap) y cloro sérico.';
    } else if (isHhsPure) {
      diagnosisTitle = 'Estado Hiperosmolar Hiperglucémico (EHH — ADA 2024)';
      severity = 'critical';
      interpretation =
        'Hiperglucemia severa (≥ 600 mg/dL) e hiperosmolaridad efectiva (> 300 mOsm/kg) sin cetoacidosis significativa; déficit hídrico severo predominante.';
    } else {
      diagnosisTitle = 'Hiperglucemia sin criterios completos de CAD ni EHH';
      severity = glucose >= 250 ? 'moderate' : 'low';
      interpretation =
        'Los datos introducidos no completan criterios formales de CAD ni de EHH según ADA 2024; evaluar deshidratación, causa precipitante y tendencia metabólica.';
    }

    const requiresIvProtocol = isDka || isHhsPure || isMixed || isMixedKetosisAlkalosis;

    // Potassium safety gate & Insulin calculation
    const insulinBlocked = potassium < 3.5;
    // ADA 2024: DKA / Mixed (including masked ketoacidosis) 0.1 U/kg/h; Pure HHS 0.05 U/kg/h after initial fluid resuscitation
    const infusionRatePerKg = isHhsPure ? 0.05 : 0.1;
    const insulinUnitsPerHour = insulinBlocked
      ? 0
      : roundClinical(weight * infusionRatePerKg, 1);

    let kRule = '';
    if (potassium < 3.5) {
      severity = 'critical';
      kRule =
        'BLOQUEO DE SEGURIDAD: K⁺ < 3.5 mEq/L. NO iniciar insulina todavía. Administrar KCl IV (10–20 mEq/h por vía periférica o hasta 20–40 mEq/h solo por acceso venoso central con monitorización ECG continua) hasta K⁺ ≥ 3.5 mEq/L.';
    } else if (potassium <= 5.0) {
      kRule =
        'K⁺ 3.5–5.0 mEq/L: Seguro iniciar insulina IV y añadir 10–20 mEq de KCl por cada litro de solución IV (máximo 10–20 mEq/h en vía periférica) para mantener K⁺ entre 4.0 y 5.0 mEq/L.';
    } else {
      kRule =
        'K⁺ > 5.0 mEq/L: Seguro iniciar insulina IV sin añadir potasio inicial en líquidos; reevaluar K⁺ cada 2 horas (descenderá con la insulina).';
    }

    const guidance: string[] = [kRule];
    if (requiresIvProtocol) {
      guidance.push(
        `Hidratación inicial: cristaloides isotónicos (NaCl 0.9% o Ringer lactato) 500–1000 mL/h durante las primeras 2–4 h según estado hemodinámico y cardiovascular.`,
      );
      if (!insulinBlocked) {
        if (isHhsPure) {
          guidance.push(
            `EHH puro: iniciar infusión de insulina regular IV a 0.05 U/kg/h (${formatClinicalNumber(insulinUnitsPerHour, 1)} U/h) tras iniciar reposición de volumen; objetivo descenso glucémico 50–75 mg/dL/h.`,
          );
        } else {
          guidance.push(
            `CAD / Mixto: infusión continua de insulina regular IV a 0.1 U/kg/h (${formatClinicalNumber(insulinUnitsPerHour, 1)} U/h en bomba, dilución estándar 1 U/mL = ${formatClinicalNumber(insulinUnitsPerHour, 1)} mL/h).`,
          );
        }
      }
      if (glucose < 250) {
        guidance.push(
          'Glucemia actual < 250 mg/dL: añadir solución glucosada al 5% o 10% (100–125 mL/h) en paralelo a la insulina para prevenir hipoglucemia hasta resolver acidosis/cetonemia.',
        );
      } else {
        guidance.push(
          'Añadir solución glucosada 5–10% cuando la glucemia descienda por debajo de 250 mg/dL, manteniendo insulina hasta resolución de cetosis/acidosis (BHB < 0.6, pH ≥ 7.3, HCO₃⁻ ≥ 18).',
        );
      }
      if (isMixedKetosisAlkalosis) {
        guidance.push(
          'Trastorno mixto sospechado: calcular Anion Gap y lactato para confirmar cetoacidosis encubierta por alcalosis metabólica.',
        );
      }
    } else {
      guidance.push(
        'Si requiere manejo intrahospitalario sin CAD/EHH, valorar esquema basal-bolo por peso (RABBIT-2) e hidratación oral/IV según tolerancia.',
      );
    }

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Estado de seguridad del Potasio (K⁺)',
        formattedValue: insulinBlocked ? 'BLOQUEADO (K⁺ < 3.5)' : 'Apto para insulina IV',
        unit: `${formatClinicalNumber(potassium, 1)} mEq/L`,
      },
      {
        label: 'Osmolaridad sérica efectiva',
        formattedValue: formatClinicalNumber(effectiveOsm, 1),
        unit: 'mOsm/kg',
        note: effectiveOsm > 300 ? 'Hiperosmolar (> 300 mOsm/kg)' : 'Rango sin hiperosmolaridad crítica',
      },
      {
        label: 'Sodio corregido por glucemia (Katz)',
        formattedValue: formatClinicalNumber(correctedNa, 1),
        unit: 'mEq/L',
        note:
          glucose > 400
            ? `Con glucosa > 400 mg/dL, el factor de Hillier (2.4 mEq/L por c/100 mg/dL) estima ${formatClinicalNumber(correctedNaHillier, 1)} mEq/L.`
            : undefined,
      },
    ];

    return {
      primaryResult: {
        label: insulinBlocked
          ? 'Infusión de Insulina IV (DIFERIDA por K⁺ < 3.5)'
          : requiresIvProtocol
            ? `Infusión de Insulina Regular IV (${infusionRatePerKg} U/kg/h)`
            : 'Evaluación metabólica aguda',
        value: insulinBlocked ? 0 : insulinUnitsPerHour,
        formattedValue: insulinBlocked
          ? '0 (Diferir)'
          : requiresIvProtocol
            ? formatClinicalNumber(insulinUnitsPerHour, 1)
            : 'Sin perfusión IV',
        unit: insulinBlocked ? 'Reponer K⁺ primero' : requiresIvProtocol ? 'U/hora' : '',
      },
      secondaryResults,
      severity,
      riskClassification: diagnosisTitle,
      clinicalInterpretation: interpretation,
      guidance,
      guidanceDisclaimer:
        'Protocolo orientativo ADA/EASD/JBDS 2024; monitorizar glucemia horaria y electrolitos/gasometría venosa cada 2–4 horas.',
      formulaUsed:
        'Osm efectiva = 2×Na + Gluc/18; Infusión ADA 2024 = 0.1 U/kg/h (CAD/Mixto) o 0.05 U/kg/h (EHH), bloqueada si K⁺ < 3.5 mEq/L',
      inputsSummary: `Peso: ${weight} kg · Gluc: ${glucose} mg/dL · pH: ${ph} · HCO₃⁻: ${hco3} · K⁺: ${potassium} mEq/L · Osm ef.: ${effectiveOsm}`,
    };
  },
};
