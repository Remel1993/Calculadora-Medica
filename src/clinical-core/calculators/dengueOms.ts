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
} from '../types/clinical.ts';
import { WEIGHT_UNITS_KG } from '../units/converters.ts';

const weightField: NumberFieldDef = {
  id: 'weightKg',
  label: 'Peso para cálculo de líquidos (opcional — Normativa 147 MINSA)',
  type: 'number',
  required: false,
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  defaultValue: '',
  min: 2,
  max: 250,
  placeholder: 'Ej. 60 (peso ideal si sobrepeso)',
  helpText:
    'Opcional: calcula cargas IV exactas según Normativa 147 MINSA (usar peso ideal para la talla en sobrepeso/obesidad y peso real en bajo peso).',
};

const warningSignsFields: BooleanFieldDef[] = [
  { id: 'ws_pain', label: 'Signo de alarma: Dolor abdominal intenso y continuo (o a la palpación)', type: 'boolean', defaultValue: false },
  { id: 'ws_vomiting', label: 'Signo de alarma: Vómitos persistentes', type: 'boolean', defaultValue: false },
  { id: 'ws_fluid', label: 'Signo de alarma: Acumulación clínica de líquidos (ascitis, derrame pleural/pericárdico)', type: 'boolean', defaultValue: false },
  { id: 'ws_bleed', label: 'Signo de alarma: Sangrado de mucosas (gingivorragia, epistaxis, metrorragia)', type: 'boolean', defaultValue: false },
  { id: 'ws_lethargy', label: 'Signo de alarma: Letargia o irritabilidad/inquietud', type: 'boolean', defaultValue: false },
  { id: 'ws_liver', label: 'Signo de alarma: Hepatomegalia > 2 cm por debajo del reborde costal', type: 'boolean', defaultValue: false },
  { id: 'ws_labs', label: 'Signo de alarma: Aumento progresivo del hematocrito junto con caída rápida de plaquetas', type: 'boolean', defaultValue: false },
];

const severeFields: BooleanFieldDef[] = [
  { id: 'sev_plasma', label: 'Dengue grave: Extravasación grave de plasma (choque por dengue o distrés respiratorio por acumulación de líquidos)', type: 'boolean', defaultValue: false },
  { id: 'sev_bleed', label: 'Dengue grave: Hemorragia grave según evaluación clínica', type: 'boolean', defaultValue: false },
  { id: 'sev_organ', label: 'Dengue grave: Compromiso grave de órganos (AST/ALT ≥ 1000 U/L, alteración de conciencia/SNC, miocarditis u otro órgano)', type: 'boolean', defaultValue: false },
];

const riskGroupField: BooleanFieldDef = {
  id: 'comorbidityOrSocial',
  label: 'Condición coexistente o riesgo social (Grupo B1 / UAF): embarazo, lactante, adulto mayor, obesidad, diabetes, ERC, hepatopatía o vive solo/lejos',
  type: 'boolean',
  defaultValue: false,
};

export const dengueOmsCalculator: CalculatorDefinition = {
  id: 'dengue-oms',
  name: 'Clasificación y Manejo de Líquidos del Dengue (MINSA Normativa 147 · OMS/OPS)',
  shortName: 'Dengue MINSA 147 / OMS',
  primarySpecialty: 'infectologia',
  secondarySpecialties: ['urgencias', 'pediatria', 'medicina-interna'],
  subcategory: 'diagnostico',
  keywords: ['dengue', 'oms', 'ops', 'minsa', 'normativa 147', 'nicaragua', 'uaf', 'signos de alarma', 'dengue grave', 'arbovirus', 'choque', 'ringer'],
  description:
    'Clasificación clínica en Grupos A, B1 (UAF), B2 y C e hidratación IV exacta según la Normativa 147 del MINSA Nicaragua (cargas de 7 mL/kg en B2 y 10 mL/kg en C con Lactato de Ringer sobre peso ideal) y directrices OMS/OPS.',
  clinicalIndication:
    'Triaje, decisión de ingreso a UAF/hospitalización y cálculo inmediato del volumen de reposición hídrica en pacientes con sospecha o confirmación de dengue.',
  validatedPopulation: 'Adultos, embarazadas y población pediátrica en zonas endémicas (MINSA Nicaragua Normativa 147 / OPS / OMS).',
  contraindications: [
    'La ausencia de signos de alarma en las primeras 48–72 h (fase febril) no descarta progresión durante la defervescencia (fase crítica); reevaluar diariamente.',
    'CONTRAINDICADOS AINEs (ibuprofeno, diclofenaco, ketorolaco), ácido acetilsalicílico (AAS), metamizol IM, corticoides e inyecciones intramusculares por riesgo de hemorragia digestiva/hematomas.',
  ],
  limitations: [
    'En pacientes con sobrepeso u obesidad, calcular las cargas IV con el PESO IDEAL para la talla (Normativa 147) para evitar sobrecarga pulmonar; en bajo peso usar peso real.',
    'Diferencia entre guías: Normativa 147 MINSA Nicaragua inicia B2 con 7 mL/kg en la 1.ª h y C con cargas vigiladas de 10 mL/kg en 1 h con Lactato de Ringer; las guías regionales OPS 2016/2022 indican 10 mL/kg en 1 h en B2 y hasta 20 mL/kg en 15–30 min en choque grave.',
  ],
  version: 'MINSA Nicaragua Normativa 147 · OMS/OPS Directrices Dengue',
  references: [
    {
      citation:
        'Ministerio de Salud de Nicaragua (MINSA). Normativa 147: Guía para el Manejo Clínico del Dengue en Pediatría y Adultos. Managua: MINSA.',
      year: 2020,
    },
    {
      citation:
        'Organización Panamericana de la Salud (OPS). Directrices para el diagnóstico clínico y el tratamiento del dengue, el chikunguña y el zika. Washington, D.C.: OPS; 2022.',
      year: 2022,
    },
    {
      citation:
        'World Health Organization. Dengue: guidelines for diagnosis, treatment, prevention and control. New edition. Geneva: WHO; 2009.',
      year: 2009,
    },
  ],
  fields: [weightField, ...severeFields, ...warningSignsFields, riskGroupField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(dengueOmsCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const weightKg = getCanonicalNumberValue(
      weightField,
      inputs.weightKg as NumberInputValue | undefined,
    ).canonicalValue;
    const severeCount = severeFields.filter((f) => inputs[f.id] === true).length;
    const warningCount = warningSignsFields.filter((f) => inputs[f.id] === true).length;
    const hasRiskGroup = inputs.comorbidityOrSocial === true;

    const buildFluidSecondary = (mlPerKg: number, label: string): SecondaryResultItem[] => {
      if (weightKg === null) return [];
      const volMl = roundClinical(weightKg * mlPerKg, 0);
      return [
        {
          label,
          formattedValue: `${formatClinicalNumber(volMl, 0)} mL`,
          unit: `en 1 hora (${mlPerKg} mL/kg × ${formatClinicalNumber(weightKg, 1)} kg)`,
          note: 'Solución preferida Normativa 147 MINSA: Lactato de Ringer (Hartmann) o SSN 0.9 % (evitar uso exclusivo prolongado de SSN 0.9 %).',
        },
      ];
    };

    if (severeCount > 0) {
      const charge10Ml = weightKg !== null ? roundClinical(weightKg * 10, 0) : null;
      return {
        primaryResult: {
          label: 'Clasificación MINSA 147 / OMS',
          value: 3,
          formattedValue: 'Dengue Grave (Grupo C)',
          unit: `${severeCount} criterio(s) grave(s)`,
        },
        secondaryResults: buildFluidSecondary(10, 'Carga inicial Grupo C (MINSA Normativa 147 · 10 mL/kg/h)'),
        severity: 'critical',
        riskClassification: 'Dengue Grave — Grupo de Manejo C (UCI / Reanimación)',
        clinicalInterpretation:
          'Presencia de extravasación plasmática grave, hemorragia grave o disfunción orgánica grave. Emergencia médica con alto riesgo de choque refractario.',
        guidance: [
          charge10Ml !== null
            ? `Normativa 147 MINSA Nicaragua: Iniciar Lactato de Ringer (o SSN 0.9 %) a 10 mL/kg en 1 hora = ${charge10Ml} mL (guía OPS permite bolos de 10–20 mL/kg en 15–30 min si choque descompensado). Reevaluar pulso, PA, llenado capilar, diuresis (≥ 1 mL/kg/h) y hematocrito.`
            : 'Normativa 147 MINSA Nicaragua: Iniciar Lactato de Ringer (o SSN 0.9 %) a 10 mL/kg en 1 hora (guía OPS 10–20 mL/kg en 15–30 min si choque descompensado), con descenso escalonado 7 → 5 → 3 mL/kg/h si mejora.',
          'Si el choque persiste tras cargas y CAE el hematocrito: sospechar HEMORRAGIA OCULTA y valorar transfusión de paquete globular/hemoderivados (si Hto sube con choque refractario, valorar coloide).',
          'Retirar líquidos IV progresivamente cuando cedan signos de choque, diuresis ≥ 1 mL/kg/h y mejore el hematocrito para evitar edema pulmonar.',
        ],
        formulaUsed: 'Normativa 147 MINSA (Grupo C: 10 mL/kg en 1 h con Lactato de Ringer sobre peso ideal) · Criterios OMS/OPS',
        inputsSummary: `Criterios graves: ${severeCount} · Signos de alarma: ${warningCount}${weightKg !== null ? ` · Peso: ${formatClinicalNumber(weightKg, 1)} kg` : ''}`,
      };
    }

    if (warningCount > 0) {
      const charge7Ml = weightKg !== null ? roundClinical(weightKg * 7, 0) : null;
      return {
        primaryResult: {
          label: 'Clasificación MINSA 147 / OMS',
          value: 2,
          formattedValue: 'Con Signos de Alarma (B2)',
          unit: `${warningCount} signo(s)`,
        },
        secondaryResults: buildFluidSecondary(7, 'Carga inicial Grupo B2 (MINSA Normativa 147 · 7 mL/kg/h)'),
        severity: 'high',
        riskClassification: 'Dengue con Signos de Alarma — Grupo de Manejo B2',
        clinicalInterpretation:
          'Fase crítica inminente o en curso con aumento de permeabilidad capilar. Riesgo de progresión a choque si no se maneja oportunamente.',
        guidance: [
          charge7Ml !== null
            ? `Normativa 147 MINSA Nicaragua: Hospitalización inmediata e iniciar Lactato de Ringer (preferido) o SSN 0.9 % a 7 mL/kg en la 1.ª hora = ${charge7Ml} mL (sobre peso ideal en sobrepeso/obesidad). Guía regional OPS utiliza hasta 10 mL/kg en 1 h.`
            : 'Normativa 147 MINSA Nicaragua: Hospitalización inmediata e iniciar Lactato de Ringer (preferido) o SSN 0.9 % a 7 mL/kg en la 1.ª hora (sobre peso ideal en sobrepeso/obesidad).',
          'Reevaluar al finalizar la 1.ª hora: si mejora clínica y diuresis (≥ 1 mL/kg/h), descender a 5 mL/kg/h (2–4 h) → 3 mL/kg/h → 2 mL/kg/h; si persiste o empeora, repetir 7 mL/kg/h o reclasificar a Grupo C.',
          'Monitorizar signos vitales horarios, balance hídrico estricto y hematocrito/plaquetas seriados.',
        ],
        formulaUsed: 'Normativa 147 MINSA (Grupo B2: 7 mL/kg en 1.ª h con Lactato de Ringer) · Criterios OMS/OPS',
        inputsSummary: `Signos de alarma: ${warningCount}${weightKg !== null ? ` · Peso: ${formatClinicalNumber(weightKg, 1)} kg` : ''}`,
      };
    }

    if (hasRiskGroup) {
      return {
        primaryResult: {
          label: 'Clasificación MINSA 147 / OMS',
          value: 1,
          formattedValue: 'Sin Alarma + Riesgo (B1)',
          unit: 'Grupo B1 / UAF',
        },
        severity: 'moderate',
        riskClassification: 'Dengue sin Signos de Alarma con Condición Asociada — Grupo B1 (UAF)',
        clinicalInterpretation:
          'Sin signos de alarma actuales, pero con comorbilidad o vulnerabilidad social que aumenta el riesgo de complicaciones.',
        guidance: [
          'Normativa 147 MINSA: Ingreso a UAF (Unidad de Atención a Febriles) u observación hospitalaria para seguimiento estrecho.',
          'Priorizar hidratación oral supervisada (SRO); usar líquidos IV de mantenimiento (Lactato de Ringer o SSN) únicamente si no tolera la vía oral.',
          'Vigilar cada 4 h aparición de signos de alarma (especialmente al caer la fiebre) y biometría hemática seriada.',
        ],
        formulaUsed: 'Sin criterios graves ni signos de alarma + condición coexistente/riesgo social (Grupo B1 / UAF)',
        inputsSummary: `Sin alarma · Con condición asociada o riesgo social (Grupo B1)${weightKg !== null ? ` · Peso: ${formatClinicalNumber(weightKg, 1)} kg` : ''}`,
      };
    }

    return {
      primaryResult: {
        label: 'Clasificación MINSA 147 / OMS',
        value: 0,
        formattedValue: 'Sin Signos de Alarma (A)',
        unit: 'Grupo A',
      },
      severity: 'low',
      riskClassification: 'Dengue sin Signos de Alarma — Grupo de Manejo A',
      clinicalInterpretation:
        'Sin signos de alarma ni condiciones de riesgo social/clínico identificadas en esta valoración.',
      guidance: [
        'Manejo ambulatorio con hidratación oral abundante (SRO, agua, jugos naturales sin exceso de azúcar), control térmico con paracetamol/acetaminofén y medios físicos.',
        'Evitar estrictamente AINEs, aspirina, corticoides e inyecciones IM; cita médica de control cada 24–48 h hasta 48 h posdefervescencia.',
      ],
      formulaUsed: 'Sin criterios graves, sin signos de alarma y sin condiciones asociadas (Grupo A)',
      inputsSummary: `Grupo A (sin alarma ni riesgo asociado)${weightKg !== null ? ` · Peso: ${formatClinicalNumber(weightKg, 1)} kg` : ''}`,
    };
  },
};
