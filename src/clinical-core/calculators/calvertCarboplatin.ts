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
} from '../types/clinical.ts';

const aucField: NumberFieldDef = {
  id: 'targetAuc',
  label: 'AUC objetivo (Área Bajo la Curva)',
  type: 'number',
  canonicalUnit: 'mg·min/mL',
  units: [{ id: 'auc', label: 'mg·min/mL (AUC)', toCanonical: (v) => v, min: 1, max: 8, step: 0.5 }],
  defaultUnitId: 'auc',
  defaultValue: '5',
  min: 1,
  max: 8,
  placeholder: '5',
  helpText: 'Ejemplos habituales: AUC 5–6 c/3 semanas (cáncer de ovario, pulmón) o AUC 2 semanal (radiosensibilización / regímenes semanales).',
};

const gfrField: NumberFieldDef = {
  id: 'gfr',
  label: 'Tasa de Filtración Glomerular (TFG absoluta)',
  type: 'number',
  canonicalUnit: 'mL/min',
  units: [{ id: 'ml_min', label: 'mL/min', toCanonical: (v) => v, min: 10, max: 250, step: 1 }],
  defaultUnitId: 'ml_min',
  defaultValue: '85',
  min: 10,
  max: 250,
  placeholder: '85',
  helpText: 'Usar TFG en mL/min sin indexar a 1.73 m² (ej. Cockcroft-Gault o CKD-EPI desindexado por SC/1.73). Tope máximo FDA/GOG: 125 mL/min.',
};

export const calvertCarboplatinCalculator: CalculatorDefinition = {
  id: 'calvert-carboplatin-auc',
  name: 'Fórmula de Calvert (Dosis de Carboplatino por AUC)',
  shortName: 'Calvert (Dosis Carboplatino)',
  primarySpecialty: 'oncologia',
  secondarySpecialties: ['gineco-obstetricia', 'nefrologia'],
  subcategory: 'dosificacion',
  keywords: [
    'calvert',
    'carboplatino',
    'auc',
    'quimioterapia',
    'tfg',
    'oncologia',
    'ovario',
    'pulmon',
    'ginecooncologia',
  ],
  description:
    'Cálculo individualizado de la dosis total de carboplatino (mg) mediante la fórmula de Calvert [AUC × (TFG + 25)] aplicando obligatoriamente el tope de seguridad FDA/GOG (TFG máx = 125 mL/min).',
  clinicalIndication:
    'Prescripción y verificación farmacéutica/oncológica de dosis de carboplatino en tumores ginecológicos (ovario, endometrio, cérvix), pulmón, mama y cabeza-cuello.',
  validatedPopulation: 'Adultos con función renal estable (TFG 10–125 mL/min; valores > 125 mL/min se limitan a 125 mL/min por normativa FDA).',
  contraindications: [
    'No utilizar en insuficiencia renal aguda rápidamente cambiante sin reevaluación directa de laboratorio o medición isotópica.',
    'La fórmula de Calvert NO debe calcularse usando creatinina sérica por debajo de 0.7 mg/dL sin política institucional explícita (muchos protocolos redondean SCr < 0.7 a 0.7 mg/dL para evitar sobredosificación por sarcopenia/desnutrición).',
  ],
  limitations: [
    'La dosis calculada es dosis TOTAL en mg (NO se multiplica por superficie corporal m²).',
    'Con métodos enzimáticos IDMS estandarizados, Cockcroft-Gault puede sobreestimar la TFG en obesidad si se usa peso corporal total; muchos centros emplean peso ajustado o CKD-EPI desindexado.',
  ],
  version: 'Calvert et al. (J Clin Oncol 1989) · FDA / GOG Capped GFR ≤ 125 mL/min',
  references: [
    {
      citation:
        'Calvert AH, Newell DR, Gumbrell LA, et al. Carboplatin dosage: prospective evaluation of a simple formula based on renal function. J Clin Oncol. 1989;7(11):1748-1756.',
      year: 1989,
    },
    {
      citation:
        'U.S. Food and Drug Administration (FDA) & Gynecologic Oncology Group (GOG). Carboplatin Dosing Update: Maximum GFR Cap of 125 mL/min for Calvert Formula.',
      year: 2010,
    },
  ],
  fields: [aucField, gfrField],
  calculate(inputs: CalculatorInputsState) {
    const errors = validateCalculatorInputs(calvertCarboplatinCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors.map((e) => e.message).join(' '));
    }

    const auc = getCanonicalNumberValue(aucField, inputs.targetAuc as NumberInputValue).canonicalValue!;
    const rawGfr = getCanonicalNumberValue(gfrField, inputs.gfr as NumberInputValue).canonicalValue!;
    const wasCapped = rawGfr > 125;
    const effectiveGfr = Math.min(rawGfr, 125);
    const doseMg = roundClinical(auc * (effectiveGfr + 25), 0);
    const uncappedDoseMg = roundClinical(auc * (rawGfr + 25), 0);

    return {
      primaryResult: {
        label: 'Dosis total de Carboplatino',
        value: doseMg,
        formattedValue: formatClinicalNumber(doseMg, 0),
        unit: 'mg',
      },
      secondaryResults: [
        {
          label: 'TFG aplicada en fórmula',
          formattedValue: formatClinicalNumber(effectiveGfr, 1),
          unit: wasCapped ? 'mL/min (Tope máx FDA)' : 'mL/min',
        },
        {
          label: 'Dosis máxima permitida para este AUC',
          formattedValue: formatClinicalNumber(roundClinical(auc * 150, 0), 0),
          unit: 'mg',
        },
        ...(wasCapped
          ? [
              {
                label: 'Dosis sin tope (NO usar por riesgo tóxico)',
                formattedValue: formatClinicalNumber(uncappedDoseMg, 0),
                unit: 'mg',
              },
            ]
          : []),
      ],
      severity: wasCapped ? 'high' : rawGfr < 30 ? 'moderate' : 'info',
      riskClassification: wasCapped
        ? 'TFG truncada al tope máximo de seguridad FDA (125 mL/min)'
        : rawGfr < 30
          ? 'TFG reducida (< 30 mL/min): verificar elegibilidad y riesgo de mielotoxicidad'
          : 'Dosis calculada dentro de rango estándar (TFG ≤ 125 mL/min)',
      clinicalInterpretation: wasCapped
        ? `La TFG introducida (${formatClinicalNumber(rawGfr, 1)} mL/min) supera el límite máximo FDA/GOG de 125 mL/min. Se ha aplicado el tope obligatorio (TFG = 125 mL/min) resultando una dosis segura de ${formatClinicalNumber(doseMg, 0)} mg para AUC ${formatClinicalNumber(auc, 1)}.`
        : `Para un AUC objetivo de ${formatClinicalNumber(auc, 1)} y TFG de ${formatClinicalNumber(effectiveGfr, 1)} mL/min, la dosis total de carboplatino es ${formatClinicalNumber(doseMg, 0)} mg.`,
      guidance: [
        'Verificar que la dosis calculada es dosis TOTAL (mg) y NO mg/m².',
        wasCapped
          ? 'ALERTA FDA/GOG: Nunca superar TFG = 125 mL/min (dosis máxima = AUC × 150 mg) debido al riesgo de trombocitopenia y mielosupresión potencialmente mortales.'
          : 'Confirmar que la TFG introducida no esté indexada a 1.73 m² en pacientes con obesidad o superficie corporal extrema.',
        'Validar siempre recuento plaquetario y neutrófilos previos al ciclo según protocolo oncológico.',
      ],
      guidanceDisclaimer:
        'La prescripción de citotóxicos requiere doble verificación por Oncología Médica / Ginecología Oncológica y Farmacia Oncológica.',
      formulaUsed: `Dosis (mg) = AUC × (min(TFG, 125) + 25) = ${formatClinicalNumber(auc, 1)} × (${formatClinicalNumber(effectiveGfr, 1)} + 25)`,
      inputsSummary: `AUC=${formatClinicalNumber(auc, 1)}, TFG=${formatClinicalNumber(rawGfr, 1)} mL/min (aplicada=${formatClinicalNumber(effectiveGfr, 1)})`,
    };
  },
};
