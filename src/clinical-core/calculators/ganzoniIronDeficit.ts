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
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';
import { WEIGHT_UNITS_KG } from '../units/converters.ts';

const weightField: NumberFieldDef = {
  id: 'weight',
  label: 'Peso corporal',
  type: 'number',
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  min: 3,
  max: 300,
  placeholder: '70',
  helpText: 'En obesidad importante, algunas fichas técnicas recomiendan usar peso ideal o ajustado.',
};

const hbActualField: NumberFieldDef = {
  id: 'hbActual',
  label: 'Hemoglobina real actual',
  type: 'number',
  canonicalUnit: 'g/dL',
  units: [
    { id: 'g_dl', label: 'g/dL', toCanonical: (v) => v, min: 2, max: 18, step: 0.1 },
    { id: 'g_l', label: 'g/L', toCanonical: (v) => v / 10, min: 20, max: 180, step: 1 },
  ],
  defaultUnitId: 'g_dl',
  min: 2,
  max: 18,
  placeholder: '8.6',
};

const hbTargetField: NumberFieldDef = {
  id: 'hbTarget',
  label: 'Hemoglobina objetivo',
  type: 'number',
  canonicalUnit: 'g/dL',
  units: [
    { id: 'g_dl', label: 'g/dL', toCanonical: (v) => v, min: 8, max: 17, step: 0.1 },
    { id: 'g_l', label: 'g/L', toCanonical: (v) => v / 10, min: 80, max: 170, step: 1 },
  ],
  defaultUnitId: 'g_dl',
  defaultValue: '15.0',
  min: 8,
  max: 17,
  placeholder: '15.0',
  helpText: 'Clásicamente 15 g/dL en adultos (13 g/dL en < 35 kg o según meta clínica individual).',
};

const storesModeField: SelectFieldDef = {
  id: 'storesMode',
  label: 'Depósitos de hierro a reponer',
  type: 'select',
  defaultValue: 'standard',
  options: [
    { value: 'standard', label: 'Estándar Ganzoni (500 mg si ≥ 35 kg; 15 mg/kg si < 35 kg)' },
    { value: 'none', label: '0 mg (solo déficit circulante de Hb)' },
  ],
};

export const ganzoniIronDeficitCalculator: CalculatorDefinition = {
  id: 'ganzoni-iron',
  name: 'Fórmula de Ganzoni (Déficit Total de Hierro en Anemia Ferropénica)',
  shortName: 'Fórmula de Ganzoni',
  primarySpecialty: 'hematologia',
  secondarySpecialties: ['medicina-interna', 'gineco-obstetricia', 'pediatria'],
  subcategory: 'dosificacion',
  keywords: ['ganzoni', 'hierro', 'ferropenia', 'anemia ferropenica', 'hierro intravenoso', 'carboximaltosa', 'sacarato'],
  description:
    'Estima el déficit total acumulado de hierro elemental (en mg) para planificar la dosis total de reposición parenteral en anemia ferropénica.',
  clinicalIndication:
    'Cálculo de la dosis acumulativa de hierro intravenoso (p. ej. hierro sacarato, hierro dextrán o carboximaltosa férrica cuando la ficha usa Ganzoni) en ferropenia documentada.',
  validatedPopulation: 'Adultos y pacientes pediátricos con anemia ferropénica confirmada.',
  requiredLabsNote: 'Requiere hemoglobina actual y confirmación bioquímica de deficiencia de hierro (ferritina / saturación de transferrina).',
  contraindications: [
    'Contraindicada la administración de hierro parenteral en sobrecarga férrica (hemocromatosis, hemosiderosis) o anemia no ferropénica.',
    'Evitar hierro IV durante bacteriemia activa no controlada.',
  ],
  limitations: [
    'Algunos preparados modernos (como carboximaltosa férrica o derisomaltosa) emplean tablas simplificadas por peso y rango de Hb en lugar de Ganzoni; verificar ficha técnica del fármaco disponible.',
    'No contabiliza pérdidas sanguíneas activas continuas (p. ej. sangrado digestivo o metrorragia persistente).',
  ],
  version: 'Ganzoni (1970)',
  references: [
    {
      citation:
        'Ganzoni AM. Intravenous iron-dextran: therapeutic and experimental possibilities. Schweiz Med Wochenschr. 1970;100(7):301-303.',
      year: 1970,
    },
  ],
  fields: [weightField, hbActualField, hbTargetField, storesModeField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(ganzoniIronDeficitCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const weight = getCanonicalNumberValue(weightField, inputs.weight as NumberInputValue).canonicalValue!;
    const hbActual = getCanonicalNumberValue(hbActualField, inputs.hbActual as NumberInputValue).canonicalValue!;
    const hbTarget = getCanonicalNumberValue(hbTargetField, inputs.hbTarget as NumberInputValue).canonicalValue!;
    const includeStores = inputs.storesMode !== 'none';

    const hbGap = Math.max(0, hbTarget - hbActual);
    const hbDeficitMg = weight * hbGap * 2.4;
    const storesMg = includeStores ? (weight >= 35 ? 500 : 15 * weight) : 0;
    const totalMg = roundClinical(hbDeficitMg + storesMg, 0);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (hbGap <= 0 && !includeStores) {
      severity = 'normal';
      riskClassification = 'Sin déficit calculado de Hb (0 mg)';
      clinicalInterpretation = 'La Hb actual alcanza o supera la Hb objetivo configurada.';
    } else if (totalMg < 1000) {
      severity = 'low';
      riskClassification = `Déficit leve-moderado (${totalMg} mg de hierro elemental)`;
      clinicalInterpretation = 'Déficit total inferior a 1,000 mg; valorar vía oral vs dosis IV fraccionada según tolerancia y etiología.';
    } else if (totalMg <= 1500) {
      severity = 'moderate';
      riskClassification = `Déficit significativo (${totalMg} mg de hierro elemental)`;
      clinicalInterpretation = 'Déficit férrico importante (1,000–1,500 mg) tributario de reposición estructurada y estudio de pérdidas.';
    } else {
      severity = 'high';
      riskClassification = `Déficit severo (${totalMg} mg de hierro elemental)`;
      clinicalInterpretation = 'Déficit elevado (> 1,500 mg); suele requerir esquema multidosis si se administra hierro IV según límite máximo por sesión.';
    }

    return {
      primaryResult: {
        label: 'Déficit Total de Hierro (Ganzoni)',
        value: totalMg,
        formattedValue: String(totalMg),
        unit: 'mg Fe elemental',
      },
      secondaryResults: [
        { label: 'Déficit por masa eritrocitaria', formattedValue: String(roundClinical(hbDeficitMg, 0)), unit: 'mg' },
        { label: 'Reposición de depósitos', formattedValue: String(roundClinical(storesMg, 0)), unit: 'mg' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: [
        'Investigar siempre la causa subyacente de la ferropenia (sangrado digestivo, ginecológico, malabsorción).',
        'Respetar la dosis máxima única y velocidad de infusión según la formulación parenteral específica.',
      ],
      guidanceDisclaimer: 'Orientativo para cálculo de dosis acumulada; confirmar ferropenia con perfil de hierro.',
      formulaUsed: 'Déficit Fe (mg) = Peso (kg) × (Hb objetivo − Hb real) × 2.4 + Depósitos (500 mg ó 15 mg/kg)',
      inputsSummary: `Peso: ${roundClinical(weight, 1)} kg · Hb real: ${formatClinicalNumber(hbActual, 1)} g/dL · Hb obj: ${formatClinicalNumber(hbTarget, 1)} g/dL · Depósitos: ${roundClinical(storesMg, 0)} mg`,
    };
  },
};
