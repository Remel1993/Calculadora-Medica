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

const sexField: SelectFieldDef = {
  id: 'sex',
  label: 'Sexo del paciente pediátrico',
  type: 'select',
  defaultValue: 'male',
  options: [
    { value: 'male', label: 'Niño (+13 cm en talla diana)' },
    { value: 'female', label: 'Niña (-13 cm en talla diana)' },
  ],
};

const motherHeightField: NumberFieldDef = {
  id: 'motherHeight',
  label: 'Talla de la madre',
  type: 'number',
  canonicalUnit: 'cm',
  units: [
    { id: 'cm', label: 'cm', toCanonical: (v) => v, min: 120, max: 210, step: 0.5 },
    { id: 'm', label: 'm', toCanonical: (v) => v * 100, min: 1.2, max: 2.1, step: 0.01 },
  ],
  defaultUnitId: 'cm',
  defaultValue: '160',
  min: 120,
  max: 210,
  placeholder: '160',
};

const fatherHeightField: NumberFieldDef = {
  id: 'fatherHeight',
  label: 'Talla del padre',
  type: 'number',
  canonicalUnit: 'cm',
  units: [
    { id: 'cm', label: 'cm', toCanonical: (v) => v, min: 130, max: 225, step: 0.5 },
    { id: 'm', label: 'm', toCanonical: (v) => v * 100, min: 1.3, max: 2.25, step: 0.01 },
  ],
  defaultUnitId: 'cm',
  defaultValue: '174',
  min: 130,
  max: 225,
  placeholder: '174',
};

const prevHeightField: NumberFieldDef = {
  id: 'prevHeight',
  label: 'Talla previa del niño (opcional, para velocidad de crecimiento)',
  type: 'number',
  canonicalUnit: 'cm',
  units: [{ id: 'cm', label: 'cm', toCanonical: (v) => v, min: 40, max: 205, step: 0.1 }],
  defaultUnitId: 'cm',
  defaultValue: '',
  required: false,
  min: 40,
  max: 205,
  placeholder: 'Opcional (ej. 112.0)',
};

const currHeightField: NumberFieldDef = {
  id: 'currHeight',
  label: 'Talla actual del niño (opcional, para velocidad de crecimiento)',
  type: 'number',
  canonicalUnit: 'cm',
  units: [{ id: 'cm', label: 'cm', toCanonical: (v) => v, min: 40, max: 210, step: 0.1 }],
  defaultUnitId: 'cm',
  defaultValue: '',
  required: false,
  min: 40,
  max: 210,
  placeholder: 'Opcional (ej. 117.5)',
};

const intervalMonthsField: NumberFieldDef = {
  id: 'intervalMonths',
  label: 'Intervalo entre ambas mediciones (en meses, ideal ≥ 6 meses)',
  type: 'number',
  canonicalUnit: 'meses',
  units: [{ id: 'months', label: 'meses', toCanonical: (v) => v, min: 3, max: 36, step: 0.5 }],
  defaultUnitId: 'months',
  defaultValue: '12',
  required: false,
  min: 3,
  max: 36,
  placeholder: '12',
};

export const targetHeightVelocityCalculator: CalculatorDefinition = {
  id: 'target-height-velocity',
  name: 'Talla Diana Familiar (Tanner) y Velocidad de Crecimiento Pediátrica',
  shortName: 'Talla Diana y Velocidad',
  primarySpecialty: 'pediatria',
  secondarySpecialties: ['endocrinologia'],
  subcategory: 'formulas',
  keywords: [
    'talla diana',
    'talla genetica',
    'tanner',
    'velocidad de crecimiento',
    'talla baja',
    'pediatria',
    'endocrinologia',
    'nino sano',
  ],
  description:
    'Calcula la talla diana parental (método de Tanner ± 8.5 cm) y, si se introducen dos tallas seriadas, anualiza la velocidad de crecimiento (cm/año).',
  clinicalIndication:
    'Control de niño sano y evaluación de talla baja o aceleración puberal en consulta de pediatría y endocrinología pediátrica.',
  validatedPopulation: 'Niños y adolescentes con tallas biológicas parentales conocidas.',
  contraindications: [
    'No aplica si uno o ambos progenitores presentan displasia esquelética o talla baja patológica genética/endocrina.',
  ],
  limitations: [
    'La velocidad de crecimiento medida en intervalos < 4–6 meses amplifica errores de técnica de tallado; se recomienda intervalo mínimo de 6 meses (ideal 12 meses).',
    'Valores orientativos prepuberales normales de velocidad de crecimiento suelen ser ~5–7 cm/año desde los 4 años hasta el inicio de la pubertad.',
  ],
  version: 'Tanner et al. (1970)',
  references: [
    {
      citation:
        'Tanner JM, Goldstein H, Whitehouse RH. Standards for children\'s height at ages 2-9 years allowing for height of parents. Arch Dis Child. 1970;45(244):755-762.',
      year: 1970,
    },
    {
      citation:
        'Cohen P, Rogol AD, Deal CL, et al. Consensus statement on the diagnosis and treatment of children with idiopathic short stature. J Clin Endocrinol Metab. 2008;93(11):4210-4217.',
      year: 2008,
    },
  ],
  fields: [sexField, motherHeightField, fatherHeightField, prevHeightField, currHeightField, intervalMonthsField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(targetHeightVelocityCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const isMale = inputs.sex !== 'female';
    const mother = getCanonicalNumberValue(motherHeightField, inputs.motherHeight as NumberInputValue).canonicalValue!;
    const father = getCanonicalNumberValue(fatherHeightField, inputs.fatherHeight as NumberInputValue).canonicalValue!;

    const targetHeight = roundClinical((mother + father + (isMale ? 13 : -13)) / 2, 1);
    const minRange = roundClinical(targetHeight - 8.5, 1);
    const maxRange = roundClinical(targetHeight + 8.5, 1);

    const prevCheck = getCanonicalNumberValue(prevHeightField, inputs.prevHeight as NumberInputValue);
    const currCheck = getCanonicalNumberValue(currHeightField, inputs.currHeight as NumberInputValue);
    const intCheck = getCanonicalNumberValue(intervalMonthsField, inputs.intervalMonths as NumberInputValue);

    let velocity: number | null = null;
    if (prevCheck.canonicalValue !== null && currCheck.canonicalValue !== null) {
      const months = intCheck.canonicalValue ?? 12;
      if (currCheck.canonicalValue < prevCheck.canonicalValue) {
        throw new Error('La talla actual no puede ser menor que la talla previa.');
      }
      velocity = roundClinical(((currCheck.canonicalValue - prevCheck.canonicalValue) / months) * 12, 1);
    }

    let severity: SeverityLevel = 'normal';
    let riskClassification = `Talla diana ${formatClinicalNumber(targetHeight, 1)} cm (carril genético ${formatClinicalNumber(minRange, 1)}–${formatClinicalNumber(maxRange, 1)} cm)`;
    let clinicalInterpretation =
      'Rango esperado de talla adulta final (± 8.5 cm ≈ ± 2 DE) asumiendo potencial genético familiar estándar y adecuado entorno nutricional/endocrino.';
    const guidance: string[] = [
      'Ubicar la talla diana a los 18–19 años en la curva OMS del paciente para comprobar si su canal de crecimiento actual es concordante con el potencial familiar.',
    ];

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Carril genético esperado (± 8.5 cm)',
        formattedValue: `${formatClinicalNumber(minRange, 1)} – ${formatClinicalNumber(maxRange, 1)}`,
        unit: 'cm',
      },
    ];

    if (velocity !== null) {
      secondaryResults.push({
        label: 'Velocidad de crecimiento anualizada',
        formattedValue: formatClinicalNumber(velocity, 1),
        unit: 'cm/año',
      });

      if (velocity < 4.0) {
        severity = 'high';
        riskClassification = `Velocidad de crecimiento lenta (${formatClinicalNumber(velocity, 1)} cm/año < 4 cm/año)`;
        clinicalInterpretation +=
          ` Una velocidad de ${formatClinicalNumber(velocity, 1)} cm/año está por debajo de lo esperado en etapa prepuberal (> 4–5 cm/año); requiere descartar hipotiroidismo, celiaquía, déficit de GH o enfermedad crónica.`;
        guidance.push('Solicitar edad ósea, cribado tiroideo, celiaquía, IGF-1/hemograma y derivar a Endocrinología Pediátrica si persiste velocidad lenta o caída de carril.');
      } else {
        severity = 'normal';
        clinicalInterpretation += ` Velocidad anualizada estimada de ${formatClinicalNumber(velocity, 1)} cm/año (interpretar siempre según edad, etapa puberal de Tanner y percentil de velocidad).`;
      }
    } else if (prevCheck.canonicalValue !== null || currCheck.canonicalValue !== null) {
      secondaryResults.push({
        label: 'Velocidad de crecimiento anualizada',
        formattedValue: 'Pendiente',
        unit: '',
        note: 'Ingresa tanto la talla previa como la talla actual para calcular la velocidad de crecimiento (cm/año).',
      });
    }

    return {
      primaryResult: {
        label: 'Talla Diana Familiar',
        value: targetHeight,
        formattedValue: formatClinicalNumber(targetHeight, 1),
        unit: 'cm',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: `Talla diana = (Talla madre + Talla padre ${isMale ? '+ 13' : '− 13'}) / 2 ± 8.5 cm`,
      inputsSummary: `${isMale ? 'Niño' : 'Niña'} · Madre ${mother} cm · Padre ${father} cm${
        velocity !== null ? ` · Vel. ${formatClinicalNumber(velocity, 1)} cm/año` : ''
      }`,
    };
  },
};
