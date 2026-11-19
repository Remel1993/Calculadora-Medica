import {
  getCanonicalNumberValue,
  roundClinical,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  DateFieldDef,
  NumberFieldDef,
  NumberInputValue,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const methodField: SelectFieldDef = {
  id: 'method',
  label: 'Método de cálculo de la edad gestacional',
  type: 'select',
  defaultValue: 'lmp',
  options: [
    { value: 'lmp', label: 'Fecha de Última Menstruación (FUM / Regla de Naegele)' },
    { value: 'usg', label: 'Ultrasonido / Ecografía previa conocida (datación por LCC/biometría)' },
  ],
};

const lmpDateField: DateFieldDef = {
  id: 'lmpDate',
  label: 'Fecha de Última Menstruación (primer día del último sangrado)',
  type: 'date',
  visibleWhen: (i) => i.method === 'lmp',
};

const cycleLenField: NumberFieldDef = {
  id: 'cycleDays',
  label: 'Duración habitual del ciclo menstrual (días)',
  type: 'number',
  canonicalUnit: 'días',
  units: [{ id: 'days', label: 'días', toCanonical: (v) => v, min: 21, max: 45, step: 1 }],
  defaultUnitId: 'days',
  defaultValue: '28',
  min: 21,
  max: 45,
  placeholder: '28',
  helpText: 'Estándar de Naegele: 28 días. Para ciclos regulares distintos se ajusta +(ciclo - 28) días.',
  visibleWhen: (i) => i.method === 'lmp',
};

const usgDateField: DateFieldDef = {
  id: 'usgDate',
  label: 'Fecha en que se realizó el ultrasonido de referencia',
  type: 'date',
  visibleWhen: (i) => i.method === 'usg',
};

const usgWeeksField: NumberFieldDef = {
  id: 'usgWeeks',
  label: 'Semanas reportadas en ese ultrasonido',
  type: 'number',
  canonicalUnit: 'sem',
  units: [{ id: 'wk', label: 'semanas', toCanonical: (v) => v, min: 4, max: 42, step: 1 }],
  defaultUnitId: 'wk',
  min: 4,
  max: 42,
  placeholder: '11',
  visibleWhen: (i) => i.method === 'usg',
};

const usgDaysField: NumberFieldDef = {
  id: 'usgDays',
  label: 'Días adicionales reportados (0 – 6)',
  type: 'number',
  canonicalUnit: 'días',
  units: [{ id: 'd', label: 'días', toCanonical: (v) => v, min: 0, max: 6, step: 1 }],
  defaultUnitId: 'd',
  defaultValue: '0',
  min: 0,
  max: 6,
  placeholder: '3',
  visibleWhen: (i) => i.method === 'usg',
};

const evalDateField: DateFieldDef = {
  id: 'evalDate',
  label: 'Fecha de evaluación clínica (por defecto hoy)',
  type: 'date',
  defaultToday: true,
};

function parseIsoUtc(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function formatIsoToEs(utcMs: number): string {
  const dt = new Date(utcMs);
  const d = String(dt.getUTCDate()).padStart(2, '0');
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const y = dt.getUTCFullYear();
  return `${d}/${m}/${y}`;
}

const MS_PER_DAY = 86400000;

export const gestationalAgeCalculator: CalculatorDefinition = {
  id: 'gestational-age',
  name: 'Edad Gestacional y Fecha Probable de Parto (FPP)',
  shortName: 'Edad Gestacional / FPP',
  primarySpecialty: 'gineco-obstetricia',
  secondarySpecialties: ['urgencias'],
  subcategory: 'formulas',
  keywords: ['edad gestacional', 'fpp', 'fum', 'naegele', 'embarazo', 'parto', 'ecografia', 'obstetricia'],
  description:
    'Cálculo exacto de edad gestacional en semanas + días, trimestre actual y Fecha Probable de Parto (40 semanas / 280 días) mediante FUM o ecografía de datación.',
  clinicalIndication:
    'Control prenatal, datación obstétrica, valoración de viabilidad/prematuridad y definición de embarazo a término o en vías de prolongación.',
  validatedPopulation: 'Gestantes con FUM confiable (ciclos regulares sin anticoncepción hormonal reciente) o ultrasonido del 1.er trimestre.',
  contraindications: [
    'En ciclos irregulares, lactancia, amenorrea previa o uso reciente de anticonceptivos, la FUM es poco confiable y debe redatarse por ecografía.',
  ],
  limitations: [
    'Consenso ACOG/SMFM: la medición de longitud cráneo-caudal (LCC) en el primer trimestre (< 14 semanas) es el método más preciso; si difiere > 5 días (antes de 9 sem) o > 7 días (9–13+6 sem) respecto a la FUM, prevalece la ecografía.',
  ],
  version: 'Regla de Naegele (+280 días) / Consenso ACOG Datación',
  references: [
    {
      citation: 'American College of Obstetricians and Gynecologists (ACOG). Committee Opinion No. 700: Methods for Estimating the Due Date. Obstet Gynecol. 2017;129(5):e150-e154.',
      year: 2017,
    },
  ],
  fields: [methodField, lmpDateField, cycleLenField, usgDateField, usgWeeksField, usgDaysField, evalDateField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(gestationalAgeCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const evalMs = parseIsoUtc(inputs.evalDate as string);
    let totalDaysGestation = 0;
    let fppMs = 0;
    let formulaUsed = '';

    if (inputs.method === 'lmp') {
      const lmpMs = parseIsoUtc(inputs.lmpDate as string);
      const cycleDays = getCanonicalNumberValue(cycleLenField, inputs.cycleDays as NumberInputValue).canonicalValue!;
      const cycleOffset = Math.round(cycleDays) - 28;
      const effectiveLmpMs = lmpMs + cycleOffset * MS_PER_DAY;
      totalDaysGestation = Math.round((evalMs - effectiveLmpMs) / MS_PER_DAY);
      fppMs = effectiveLmpMs + 280 * MS_PER_DAY;
      formulaUsed = cycleOffset === 0 ? 'FPP = FUM + 280 días (40 semanas)' : `FPP = FUM + 280 + (${cycleOffset}) días por ciclo de ${cycleDays} d`;
    } else {
      const usgMs = parseIsoUtc(inputs.usgDate as string);
      const usgW = getCanonicalNumberValue(usgWeeksField, inputs.usgWeeks as NumberInputValue).canonicalValue!;
      const usgD = getCanonicalNumberValue(usgDaysField, inputs.usgDays as NumberInputValue).canonicalValue!;
      const daysAtUsg = Math.round(usgW) * 7 + Math.round(usgD);
      const daysElapsedSinceUsg = Math.round((evalMs - usgMs) / MS_PER_DAY);
      if (daysElapsedSinceUsg < 0) {
        throw new Error('La fecha de evaluación no puede ser anterior a la fecha del ultrasonido.');
      }
      totalDaysGestation = daysAtUsg + daysElapsedSinceUsg;
      fppMs = usgMs + (280 - daysAtUsg) * MS_PER_DAY;
      formulaUsed = 'EG actual = EG en ecografía + días transcurridos · FPP = Fecha eco + (280 - días EG eco)';
    }

    if (totalDaysGestation < 0) {
      throw new Error('La fecha de evaluación es anterior al inicio estimado de la gestación.');
    }
    if (totalDaysGestation > 315) {
      throw new Error('La edad gestacional calculada supera 45 semanas (315 días); verifica las fechas ingresadas.');
    }

    const weeks = Math.floor(totalDaysGestation / 7);
    const remDays = totalDaysGestation % 7;
    const fppStr = formatIsoToEs(fppMs);
    const daysRemaining = 280 - totalDaysGestation;

    let trimester = '1.er trimestre (< 14+0 sem)';
    if (totalDaysGestation >= 28 * 7) trimester = '3.er trimestre (≥ 28+0 sem)';
    else if (totalDaysGestation >= 14 * 7) trimester = '2.º trimestre (14+0 – 27+6 sem)';

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    if (weeks < 20) {
      severity = 'info';
      riskClassification = `${trimester} · Embarazo < 20 semanas`;
    } else if (weeks < 37) {
      severity = 'low';
      riskClassification = `${trimester} · Rango pretérmino si iniciara trabajo de parto`;
    } else if (weeks < 39) {
      severity = 'normal';
      riskClassification = 'Término temprano (37+0 – 38+6 semanas)';
    } else if (weeks < 41) {
      severity = 'normal';
      riskClassification = 'Término completo (39+0 – 40+6 semanas)';
    } else if (weeks < 42) {
      severity = 'moderate';
      riskClassification = 'Término tardío (41+0 – 41+6 semanas)';
    } else {
      severity = 'high';
      riskClassification = 'Embarazo postérmino (≥ 42+0 semanas)';
    }

    const decimalWeeks = roundClinical(totalDaysGestation / 7, 1);

    return {
      primaryResult: {
        label: 'Edad Gestacional actual',
        value: decimalWeeks,
        formattedValue: `${weeks}+${remDays}`,
        unit: 'semanas+días',
      },
      secondaryResults: [
        { label: 'Fecha Probable de Parto (FPP — 40+0 sem)', formattedValue: fppStr, unit: '' },
        { label: 'Clasificación gestacional', formattedValue: trimester, unit: '' },
        {
          label: daysRemaining >= 0 ? 'Días restantes hasta las 40+0 semanas' : 'Días transcurridos tras las 40+0 semanas',
          formattedValue: String(Math.abs(daysRemaining)),
          unit: 'días',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation: `Gestación calculada de ${weeks} semanas y ${remDays} días (${totalDaysGestation} días totales), con FPP estimada el ${fppStr}.`,
      formulaUsed,
      inputsSummary: `Método: ${inputs.method === 'lmp' ? 'FUM' : 'Ecografía'} · EG: ${weeks}+${remDays} sem · FPP: ${fppStr}`,
    };
  },
};
