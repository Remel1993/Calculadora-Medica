import type {
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  UnitOption,
  ValidationError,
} from '../types/clinical.ts';

/**
 * Rounds a floating-point number safely to the specified decimal places
 * without introducing binary floating-point artifacts like 1.005 -> 1.00.
 */
export function roundClinical(value: number, decimals: number): number {
  if (!Number.isFinite(value)) {
    throw new Error('El resultado numérico no es finito.');
  }
  const factor = Math.pow(10, decimals);
  const shifted = Number(`${Math.round(Number(`${value}e${decimals}`))}e-${decimals}`);
  if (Number.isFinite(shifted)) {
    return shifted;
  }
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function formatClinicalNumber(value: number, decimals: number): string {
  const rounded = roundClinical(value, decimals);
  return rounded.toFixed(decimals);
}

/**
 * Parses raw user numeric input safely (accepts comma or dot decimal separator).
 * Rejects NaN, Infinity, scientific notation tricks, or non-numeric garbage.
 */
export function parseStrictNumber(raw: string): number | null {
  const trimmed = raw.trim().replace(',', '.');
  if (trimmed === '') {
    return null;
  }
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return null;
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed;
}

export function getCanonicalNumberValue(
  field: NumberFieldDef,
  input: NumberInputValue | undefined,
): { canonicalValue: number | null; unitLabel: string; rawNumber: number | null } {
  const unitId = input?.unitId || field.defaultUnitId;
  const unit = field.units.find((u) => u.id === unitId) ?? field.units[0];
  if (!unit) {
    throw new Error(`Unidad no configurada para el campo ${field.id}`);
  }
  const rawNumber = parseStrictNumber(input?.value ?? '');
  if (rawNumber === null) {
    return { canonicalValue: null, unitLabel: unit.label, rawNumber: null };
  }
  const canonicalValue = unit.toCanonical(rawNumber);
  return { canonicalValue, unitLabel: unit.label, rawNumber };
}

function getDisplayUnitBounds(
  field: NumberFieldDef,
  unit: UnitOption,
): { min: number; max: number } {
  const b = unit.toCanonical(0);
  const a = unit.toCanonical(1) - b;

  if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0) {
    return { min: unit.min ?? field.min, max: unit.max ?? field.max };
  }
  if (Math.abs(a - 1) < 1e-12 && Math.abs(b) < 1e-12) {
    return { min: field.min, max: field.max };
  }

  const rawMin = (field.min - b) / a;
  const rawMax = (field.max - b) / a;

  const stepStr = unit.step && unit.step > 0 ? String(unit.step) : '';
  const dotIdx = stepStr.indexOf('.');
  const decimals = stepStr ? (dotIdx === -1 ? 0 : Math.min(3, stepStr.length - dotIdx - 1)) : 2;
  const factor = Math.pow(10, decimals);

  let displayMin = roundClinical(rawMin, decimals);
  if (unit.toCanonical(displayMin) < field.min) {
    displayMin = roundClinical(Math.ceil(rawMin * factor - 1e-9) / factor, decimals);
  }

  let displayMax = roundClinical(rawMax, decimals);
  if (unit.toCanonical(displayMax) > field.max) {
    displayMax = roundClinical(Math.floor(rawMax * factor + 1e-9) / factor, decimals);
  }

  if (displayMin > displayMax) {
    return { min: roundClinical(rawMin, 2), max: roundClinical(rawMax, 2) };
  }

  return { min: displayMin, max: displayMax };
}

export function validateCalculatorInputs(
  definition: CalculatorDefinition,
  inputs: CalculatorInputsState,
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const field of definition.fields) {
    if (field.visibleWhen && !field.visibleWhen(inputs)) {
      continue;
    }

    const rawVal = inputs[field.id];
    const isRequired = field.required !== false;

    if (field.type === 'number') {
      const numInput = (rawVal as NumberInputValue | undefined) ?? {
        value: '',
        unitId: field.defaultUnitId,
      };
      const trimmed = (numInput.value ?? '').trim();

      if (trimmed === '') {
        if (isRequired) {
          errors.push({
            fieldId: field.id,
            message: `Ingresa un valor para ${field.label}.`,
          });
        }
        continue;
      }

      const parsed = parseStrictNumber(trimmed);
      if (parsed === null) {
        errors.push({
          fieldId: field.id,
          message: `Valor numérico inválido en ${field.label}.`,
        });
        continue;
      }

      const unit =
        field.units.find((u) => u.id === numInput.unitId) ?? field.units[0];
      const canonical = unit.toCanonical(parsed);

      if (!Number.isFinite(canonical)) {
        errors.push({
          fieldId: field.id,
          message: `Valor fuera de rango numérico en ${field.label}.`,
        });
        continue;
      }

      if (canonical < field.min || canonical > field.max) {
        const { min: displayMin, max: displayMax } = getDisplayUnitBounds(field, unit);
        errors.push({
          fieldId: field.id,
          message: `${field.label} debe estar entre ${displayMin} y ${displayMax} ${unit.label}.`,
        });
      }
    } else if (field.type === 'select') {
      if (isRequired && (typeof rawVal !== 'string' || rawVal.trim() === '')) {
        errors.push({
          fieldId: field.id,
          message: `Selecciona una opción para ${field.label}.`,
        });
      }
    } else if (field.type === 'boolean') {
      if (isRequired && typeof rawVal !== 'boolean') {
        errors.push({
          fieldId: field.id,
          message: `Indica Sí o No en ${field.label}.`,
        });
      }
    } else if (field.type === 'date') {
      const strVal = typeof rawVal === 'string' ? rawVal.trim() : '';
      if (strVal === '') {
        if (isRequired) {
          errors.push({
            fieldId: field.id,
            message: `Selecciona una fecha válida para ${field.label}.`,
          });
        }
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(strVal)) {
        errors.push({
          fieldId: field.id,
          message: `Formato de fecha inválido en ${field.label} (usar AAAA-MM-DD).`,
        });
      } else {
        const [y, m, d] = strVal.split('-').map(Number);
        const dt = new Date(Date.UTC(y, m - 1, d));
        if (
          dt.getUTCFullYear() !== y ||
          dt.getUTCMonth() !== m - 1 ||
          dt.getUTCDate() !== d
        ) {
          errors.push({
            fieldId: field.id,
            message: `Fecha inexistente en el calendario para ${field.label}.`,
          });
        }
      }
    }
  }

  return errors;
}

function getLocalTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function createInitialInputs(definition: CalculatorDefinition): CalculatorInputsState {
  const state: CalculatorInputsState = {};
  for (const field of definition.fields) {
    if (field.type === 'number') {
      state[field.id] = {
        value: field.defaultValue ?? '',
        unitId: field.defaultUnitId,
      };
    } else if (field.type === 'select') {
      state[field.id] = field.defaultValue ?? '';
    } else if (field.type === 'boolean') {
      state[field.id] = field.defaultValue ?? false;
    } else if (field.type === 'date') {
      state[field.id] = field.defaultValue ?? (field.defaultToday ? getLocalTodayIso() : '');
    }
  }
  return state;
}
