import type { UnitOption } from '../types/clinical.ts';

/**
 * Standard clinical unit conversion factors.
 * Every unit group defines explicit conversion to a single canonical unit,
 * preventing accidental mixing of incompatible units.
 */

export const WEIGHT_UNITS_KG: UnitOption[] = [
  {
    id: 'kg',
    label: 'kg',
    toCanonical: (v) => v,
    min: 0.5,
    max: 400,
    step: 0.1,
  },
  {
    id: 'lb',
    label: 'lb',
    toCanonical: (v) => v * 0.45359237,
    min: 1.1,
    max: 880,
    step: 0.1,
  },
];

export const HEIGHT_UNITS_M: UnitOption[] = [
  {
    id: 'cm',
    label: 'cm',
    toCanonical: (v) => v / 100,
    min: 40,
    max: 250,
    step: 0.5,
  },
  {
    id: 'm',
    label: 'm',
    toCanonical: (v) => v,
    min: 0.4,
    max: 2.5,
    step: 0.01,
  },
];

export const CREATININE_UNITS_MG_DL: UnitOption[] = [
  {
    id: 'mg_dl',
    label: 'mg/dL',
    toCanonical: (v) => v,
    min: 0.1,
    max: 30,
    step: 0.01,
  },
  {
    id: 'umol_l',
    label: 'µmol/L',
    toCanonical: (v) => v / 88.4,
    min: 9,
    max: 2652,
    step: 1,
  },
];

export const ELECTROLYTE_UNITS_MEQ_L: UnitOption[] = [
  {
    id: 'meq_l',
    label: 'mEq/L',
    toCanonical: (v) => v,
    step: 0.1,
  },
  {
    id: 'mmol_l',
    label: 'mmol/L',
    toCanonical: (v) => v,
    step: 0.1,
  },
];

export const ALBUMIN_UNITS_G_DL: UnitOption[] = [
  {
    id: 'g_dl',
    label: 'g/dL',
    toCanonical: (v) => v,
    min: 0.5,
    max: 7.0,
    step: 0.1,
  },
  {
    id: 'g_l',
    label: 'g/L',
    toCanonical: (v) => v / 10,
    min: 5,
    max: 70,
    step: 1,
  },
];

export const AGE_UNITS_YEARS: UnitOption[] = [
  {
    id: 'years',
    label: 'años',
    toCanonical: (v) => v,
    min: 18,
    max: 120,
    step: 1,
  },
];

export const GLUCOSE_UNITS_MG_DL: UnitOption[] = [
  {
    id: 'mg_dl',
    label: 'mg/dL',
    toCanonical: (v) => v,
    min: 15,
    max: 2000,
    step: 1,
  },
  {
    id: 'mmol_l',
    label: 'mmol/L',
    toCanonical: (v) => v * 18.0182,
    min: 0.8,
    max: 111,
    step: 0.1,
  },
];

/** Canonical unit: mg/dL of BUN (Nitrogen) */
export const BUN_OR_UREA_UNITS_MG_DL_BUN: UnitOption[] = [
  {
    id: 'bun_mg_dl',
    label: 'BUN mg/dL',
    toCanonical: (v) => v,
    min: 1,
    max: 300,
    step: 0.5,
  },
  {
    id: 'urea_mg_dl',
    label: 'Urea mg/dL',
    toCanonical: (v) => v / 2.1428,
    min: 2,
    max: 643,
    step: 1,
  },
  {
    id: 'mmol_l',
    label: 'mmol/L',
    toCanonical: (v) => v * 2.8011,
    min: 0.4,
    max: 107,
    step: 0.1,
  },
];

export const URINE_CREATININE_UNITS_MG_DL: UnitOption[] = [
  {
    id: 'mg_dl',
    label: 'mg/dL',
    toCanonical: (v) => v,
    min: 5,
    max: 600,
    step: 1,
  },
  {
    id: 'mmol_l',
    label: 'mmol/L',
    toCanonical: (v) => v * 11.3122,
    min: 0.4,
    max: 53,
    step: 0.1,
  },
];

export const CALCIUM_UNITS_MG_DL: UnitOption[] = [
  {
    id: 'mg_dl',
    label: 'mg/dL',
    toCanonical: (v) => v,
    min: 3.0,
    max: 20.0,
    step: 0.1,
  },
  {
    id: 'mmol_l',
    label: 'mmol/L',
    toCanonical: (v) => v * 4.008,
    min: 0.75,
    max: 5.0,
    step: 0.05,
  },
];

export const INSULIN_UNITS_UIU_ML: UnitOption[] = [
  {
    id: 'uiu_ml',
    label: 'µUI/mL',
    toCanonical: (v) => v,
    min: 0.5,
    max: 500,
    step: 0.5,
  },
  {
    id: 'pmol_l',
    label: 'pmol/L',
    toCanonical: (v) => v / 6.945,
    min: 3.5,
    max: 3472,
    step: 1,
  },
];

export const OSMOLARITY_UNITS_MOSM_KG: UnitOption[] = [
  {
    id: 'mosm_kg',
    label: 'mOsm/kg',
    toCanonical: (v) => v,
    min: 200,
    max: 500,
    step: 1,
  },
];

export const ETHANOL_UNITS_MG_DL: UnitOption[] = [
  {
    id: 'mg_dl',
    label: 'mg/dL',
    toCanonical: (v) => v,
    min: 0,
    max: 800,
    step: 1,
  },
  {
    id: 'mmol_l',
    label: 'mmol/L',
    toCanonical: (v) => v * 4.607,
    min: 0,
    max: 174,
    step: 0.5,
  },
];

export const TEMP_UNITS_C: UnitOption[] = [
  {
    id: 'c',
    label: '°C',
    toCanonical: (v) => v,
    min: 24,
    max: 45,
    step: 0.1,
  },
  {
    id: 'f',
    label: '°F',
    toCanonical: (v) => (v - 32) * (5 / 9),
    min: 75,
    max: 113,
    step: 0.1,
  },
];

export const CHOLESTEROL_UNITS_MG_DL: UnitOption[] = [
  {
    id: 'mg_dl',
    label: 'mg/dL',
    toCanonical: (v) => v,
    min: 10,
    max: 600,
    step: 1,
  },
  {
    id: 'mmol_l',
    label: 'mmol/L',
    toCanonical: (v) => v * 38.67,
    min: 0.3,
    max: 15.5,
    step: 0.1,
  },
];

export const BILIRUBIN_UNITS_MG_DL: UnitOption[] = [
  {
    id: 'mg_dl',
    label: 'mg/dL',
    toCanonical: (v) => v,
    min: 0.1,
    max: 50,
    step: 0.1,
  },
  {
    id: 'umol_l',
    label: 'µmol/L',
    toCanonical: (v) => v / 17.104,
    min: 1.7,
    max: 855,
    step: 1,
  },
];

export const BP_UNITS_MMHG: UnitOption[] = [
  {
    id: 'mmhg',
    label: 'mmHg',
    toCanonical: (v) => v,
    step: 1,
  },
];

export const HR_UNITS_BPM: UnitOption[] = [
  {
    id: 'bpm',
    label: 'lpm',
    toCanonical: (v) => v,
    step: 1,
  },
];

export const RR_UNITS_RPM: UnitOption[] = [
  {
    id: 'rpm',
    label: 'rpm',
    toCanonical: (v) => v,
    step: 1,
  },
];


