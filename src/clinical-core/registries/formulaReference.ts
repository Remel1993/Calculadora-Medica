import {
  createInitialInputs,
  parseStrictNumber,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorFieldDef,
  CalculatorInputsState,
  NumberFieldDef,
} from '../types/clinical.ts';

export interface FormulaVariableSummary {
  id: string;
  label: string;
  type: CalculatorFieldDef['type'];
  detail: string;
}

export interface CalculatorFormulaReferenceInfo {
  formulaUsed: string;
  variables: FormulaVariableSummary[];
}

function getValidNumericSample(field: NumberFieldDef): string {
  const unit = field.units.find((u) => u.id === field.defaultUnitId) ?? field.units[0];
  const candidates = [field.defaultValue, field.placeholder];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const parsed = parseStrictNumber(candidate);
    if (parsed === null || !unit) continue;
    const canonical = unit.toCanonical(parsed);
    if (Number.isFinite(canonical) && canonical >= field.min && canonical <= field.max) {
      return candidate.trim();
    }
  }

  const canonicalMid = (field.min + field.max) / 2;
  if (!unit) {
    return String(Math.round(canonicalMid * 10) / 10);
  }
  const b = unit.toCanonical(0);
  const a = unit.toCanonical(1) - b;
  const displayVal = a > 0 && Number.isFinite(a) ? (canonicalMid - b) / a : canonicalMid;
  return String(Math.round(displayVal * 10) / 10);
}

function buildSampleInputs(calc: CalculatorDefinition): CalculatorInputsState {
  const state = createInitialInputs(calc);

  for (const field of calc.fields) {
    if (field.type === 'number') {
      state[field.id] = {
        value: field.required === false ? '' : getValidNumericSample(field),
        unitId: field.defaultUnitId,
      };
    } else if (field.type === 'select') {
      const current = typeof state[field.id] === 'string' ? (state[field.id] as string) : '';
      if (!current && field.options.length > 0) {
        state[field.id] = field.options[0].value;
      }
    } else if (field.type === 'date') {
      const lowerId = field.id.toLowerCase();
      if (!state[field.id]) {
        if (lowerId.includes('lmp') || lowerId.includes('fur') || lowerId.includes('birth')) {
          state[field.id] = '2025-01-01';
        } else {
          state[field.id] = '2025-05-21';
        }
      } else if (lowerId.includes('lmp') || lowerId.includes('fur')) {
        state[field.id] = '2025-01-01';
      }
    }
  }

  // Targeted cross-field sanity adjustments for reference formula extraction
  if (calc.id === 'gestational-age') {
    state.lmpDate = '2025-01-01';
    state.evalDate = '2025-05-21';
  } else if (calc.id === 'target-height-velocity') {
    state.prevDate = '2024-05-01';
    state.currDate = '2025-05-01';
    state.prevHeight = { value: '110', unitId: 'cm' };
    state.currHeight = { value: '116', unitId: 'cm' };
  }

  return state;
}

function summarizeField(field: CalculatorFieldDef): FormulaVariableSummary {
  if (field.type === 'number') {
    const unitNames = field.units.map((u) => u.label).join(' / ');
    return {
      id: field.id,
      label: field.label,
      type: field.type,
      detail: `Unidades: ${unitNames} · Rango validado: ${field.min} – ${field.max} ${field.canonicalUnit}`,
    };
  }

  if (field.type === 'boolean') {
    const pts =
      typeof field.pointsWhenTrue === 'number'
        ? ` (${field.pointsWhenTrue >= 0 ? '+' : ''}${field.pointsWhenTrue} pts si ${field.trueLabel ?? 'Sí'})`
        : '';
    return {
      id: field.id,
      label: field.label,
      type: field.type,
      detail: `Criterio dicotómico: ${field.trueLabel ?? 'Sí'} / ${field.falseLabel ?? 'No'}${pts}`,
    };
  }

  if (field.type === 'select') {
    const optionsText = field.options
      .map((opt) =>
        typeof opt.points === 'number'
          ? `${opt.label} (${opt.points >= 0 ? '+' : ''}${opt.points} pts)`
          : opt.label,
      )
      .join(' · ');
    return {
      id: field.id,
      label: field.label,
      type: field.type,
      detail: optionsText,
    };
  }

  return {
    id: field.id,
    label: field.label,
    type: field.type,
    detail: 'Fecha de calendario (AAAA-MM-DD)',
  };
}

const FORMULA_CACHE = new Map<string, CalculatorFormulaReferenceInfo>();

export function getCalculatorFormulaReference(
  calc: CalculatorDefinition,
): CalculatorFormulaReferenceInfo {
  const cached = FORMULA_CACHE.get(calc.id);
  if (cached) {
    return cached;
  }

  let formulaUsed = '';
  try {
    const sample = buildSampleInputs(calc);
    const errors = validateCalculatorInputs(calc, sample);
    if (errors.length === 0) {
      const result = calc.calculate(sample);
      formulaUsed = result.formulaUsed;
    }
  } catch {
    formulaUsed = '';
  }

  if (!formulaUsed.trim()) {
    formulaUsed = `${calc.version}: evaluación clínica estructurada sobre ${calc.fields.length} parámetros validados.`;
  }

  const info: CalculatorFormulaReferenceInfo = {
    formulaUsed,
    variables: calc.fields.map(summarizeField),
  };

  FORMULA_CACHE.set(calc.id, info);
  return info;
}
