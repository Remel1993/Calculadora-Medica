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
import { ELECTROLYTE_UNITS_MEQ_L, WEIGHT_UNITS_KG } from '../units/converters.ts';

const weightField: NumberFieldDef = {
  id: 'weight',
  label: 'Peso del paciente',
  type: 'number',
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  defaultValue: '70',
  min: 2,
  max: 250,
  placeholder: '70',
};

const currentHco3Field: NumberFieldDef = {
  id: 'currentHco3',
  label: 'Bicarbonato sérico actual (HCO₃⁻)',
  type: 'number',
  canonicalUnit: 'mEq/L',
  units: ELECTROLYTE_UNITS_MEQ_L,
  defaultUnitId: 'meq_l',
  defaultValue: '10',
  min: 1,
  max: 35,
  placeholder: '10',
};

const targetHco3Field: NumberFieldDef = {
  id: 'targetHco3',
  label: 'Bicarbonato objetivo inicial (habitualmente 15–18 mEq/L o 24 mEq/L para déficit total)',
  type: 'number',
  canonicalUnit: 'mEq/L',
  units: ELECTROLYTE_UNITS_MEQ_L,
  defaultUnitId: 'meq_l',
  defaultValue: '16',
  min: 8,
  max: 26,
  placeholder: '16',
  helpText: 'Para cálculo de corrección aguda segura suele fijarse meta parcial (p. ej. 15–18 mEq/L) y no 24 mEq/L de golpe.',
};

const vdFactorField: SelectFieldDef = {
  id: 'vdFactor',
  label: 'Volumen de distribución aparente del bicarbonato (Vd)',
  type: 'select',
  defaultValue: '0.5',
  options: [
    {
      value: '0.5',
      label: '0.5 × Peso (estándar en acidosis metabólica moderada-grave)',
      description: 'Factor clásico más usado (50 % del peso corporal cuando HCO₃⁻ es bajo).',
    },
    {
      value: '0.4',
      label: '0.4 × Peso (estimación conservadora / acidosis leve)',
      description: 'Útil para cálculos conservadores en hipernatremia o riesgo de sobrecarga.',
    },
  ],
};

export const bicarbonateDeficitCalculator: CalculatorDefinition = {
  id: 'bicarbonate-deficit',
  name: 'Déficit de Bicarbonato (Acidosis Metabólica)',
  shortName: 'Déficit de Bicarbonato',
  primarySpecialty: 'nefrologia',
  secondarySpecialties: ['urgencias', 'medicina-interna'],
  subcategory: 'liquidos',
  keywords: [
    'bicarbonato',
    'hco3',
    'deficit',
    'acidosis metabolica',
    'nahco3',
    'reposicion',
    'gasometria',
  ],
  description:
    'Calcula el déficit estimado de bicarbonato (mEq = Vd × Peso × [HCO₃⁻ objetivo − HCO₃⁻ actual]) y muestra la reposición inicial parcial (50 %) para prevenir alcalosis de rebote o sobrecarga sódica.',
  clinicalIndication:
    'Estimación orientativa en acidosis metabólica no anión-gap grave (hiperclorémica, pérdidas digestivas, ATR) o acidosis severa con pH < 7.10–7.15 en contexto seleccionado.',
  validatedPopulation: 'Adultos y pacientes pediátricos (en niños y cetoacidosis diabética el uso rutinario de bicarbonato está muy restringido).',
  contraindications: [
    'En cetoacidosis diabética (CAD) NO administrar bicarbonato salvo pH < 6.9–7.0 por riesgo de hipopotasemia grave, acidosis paradójica del SNC y edema cerebral en niños.',
    'En acidosis láctica por hipoperfusión la prioridad es corregir la causa (perfusión/oxigenación), no normalizar el bicarbonato con bolos.',
    'Precaución extrema en insuficiencia cardíaca, edema pulmonar, hipernatremia o hipocalcemia/hipopotasemia no corregidas.',
  ],
  limitations: [
    'El volumen de distribución del bicarbonato aumenta conforme más grave es la acidosis (hasta 0.5–0.8 L/kg en acidosis extremas); la fórmula es solo una aproximación inicial.',
    'La administración rápida eleva la PaCO₂ transitoriamente si el paciente no puede hiperventilar adecuadamente.',
  ],
  version: 'Fórmula fisiológica estándar (Vd 0.4–0.5)',
  references: [
    {
      citation:
        'Kraut JA, Madias NE. Treatment of acute metabolic acidosis: a pathophysiologic approach. Nat Rev Nephrol. 2012;8(10):589-601.',
      year: 2012,
    },
    {
      citation:
        'Adrogué HJ, Madias NE. Management of life-threatening acid-base disorders. First of two parts. N Engl J Med. 1998;338(1):26-34.',
      year: 1998,
    },
  ],
  fields: [weightField, currentHco3Field, targetHco3Field, vdFactorField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(bicarbonateDeficitCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const weight = getCanonicalNumberValue(weightField, inputs.weight as NumberInputValue).canonicalValue!;
    const currentHco3 = getCanonicalNumberValue(currentHco3Field, inputs.currentHco3 as NumberInputValue).canonicalValue!;
    const targetHco3 = getCanonicalNumberValue(targetHco3Field, inputs.targetHco3 as NumberInputValue).canonicalValue!;
    const vd = Number(inputs.vdFactor);

    const delta = targetHco3 - currentHco3;
    if (delta <= 0) {
      return {
        primaryResult: {
          label: 'Déficit calculado de HCO₃⁻',
          value: 0,
          formattedValue: '0',
          unit: 'mEq',
        },
        severity: 'normal' as SeverityLevel,
        riskClassification: 'Sin déficit respecto al objetivo seleccionado',
        clinicalInterpretation: `El bicarbonato actual (${formatClinicalNumber(currentHco3, 1)} mEq/L) es igual o superior al objetivo (${formatClinicalNumber(targetHco3, 1)} mEq/L). No procede reposición de bicarbonato.`,
        formulaUsed: 'Déficit (mEq) = Vd × Peso (kg) × (HCO₃⁻ objetivo − HCO₃⁻ actual)',
        inputsSummary: `Peso ${roundClinical(weight, 1)} kg · HCO₃⁻ ${currentHco3} → ${targetHco3} mEq/L`,
      };
    }

    const totalDeficit = roundClinical(vd * weight * delta, 0);
    const halfDeficit = roundClinical(totalDeficit / 2, 0);
    // Standard 8.4% NaHCO3 = 1 mEq/mL; 1/6 M (1.4%) = 0.167 mEq/mL
    const severity: SeverityLevel =
      currentHco3 < 8 ? 'critical' : currentHco3 < 12 ? 'high' : 'moderate';

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Reposición inicial sugerida (50 % del déficit en 4–8 h)',
        formattedValue: `${halfDeficit} mEq`,
        unit: `(${halfDeficit} mL de NaHCO₃ 8.4 % diluido)`,
        note: 'Equivale a 1 mEq/mL en ampolla al 8.4 % (diluir en glucosado 5 % o agua estéril para evitar hipertonicidad/flebitis) y reevaluar con gasometría.',
      },
      {
        label: 'Equivalente isotónico aproximado (1/6 Molar · 1.4 %)',
        formattedValue: `${roundClinical(halfDeficit / 0.167, 0)} mL`,
        unit: 'para el 50 % inicial',
      },
    ];

    return {
      primaryResult: {
        label: 'Déficit de bicarbonato hasta objetivo',
        value: totalDeficit,
        formattedValue: `${totalDeficit}`,
        unit: 'mEq de HCO₃⁻',
      },
      secondaryResults,
      severity,
      riskClassification:
        currentHco3 < 10
          ? `Acidemia / hipobicarbonatemia severa (HCO₃⁻ ${formatClinicalNumber(currentHco3, 1)} mEq/L)`
          : `Déficit de bicarbonato de ${totalDeficit} mEq hasta ${formatClinicalNumber(targetHco3, 1)} mEq/L`,
      clinicalInterpretation: `Se requieren aproximadamente ${totalDeficit} mEq totales para elevar el HCO₃⁻ de ${formatClinicalNumber(currentHco3, 1)} a ${formatClinicalNumber(targetHco3, 1)} mEq/L (usando Vd ${vd}). Habitualmente se repone como máximo el 50 % (${halfDeficit} mEq) inicialmente con control gasométrico y de K⁺/Ca²⁺.`,
      guidance: [
        'Verificar potasio y calcio ionizado antes de infundir bicarbonato (la alcalinización desplaza K⁺ al espacio intracelular y reduce el Ca²⁺ iónico).',
        'Asegurar adecuada ventilación alveolar (si el paciente retiene CO₂, el bicarbonato empeora la acidosis intracelular).',
      ],
      formulaUsed: `Déficit (mEq) = ${vd} × Peso (kg) × (HCO₃⁻ objetivo − HCO₃⁻ actual)`,
      inputsSummary: `Peso ${roundClinical(weight, 1)} kg · HCO₃⁻ actual ${currentHco3} → objetivo ${targetHco3} mEq/L · Vd ${vd}`,
    };
  },
};
