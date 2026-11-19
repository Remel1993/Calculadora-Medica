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
  SeverityLevel,
} from '../types/clinical.ts';
import { ALBUMIN_UNITS_G_DL, ELECTROLYTE_UNITS_MEQ_L } from '../units/converters.ts';

const sodiumField: NumberFieldDef = {
  id: 'sodium',
  label: 'Sodio sérico (Na⁺)',
  type: 'number',
  canonicalUnit: 'mEq/L',
  units: ELECTROLYTE_UNITS_MEQ_L,
  defaultUnitId: 'meq_l',
  min: 90,
  max: 200,
  placeholder: '140',
};

const chlorideField: NumberFieldDef = {
  id: 'chloride',
  label: 'Cloro sérico (Cl⁻)',
  type: 'number',
  canonicalUnit: 'mEq/L',
  units: ELECTROLYTE_UNITS_MEQ_L,
  defaultUnitId: 'meq_l',
  min: 50,
  max: 160,
  placeholder: '104',
};

const bicarbonateField: NumberFieldDef = {
  id: 'bicarbonate',
  label: 'Bicarbonato (HCO₃⁻)',
  type: 'number',
  canonicalUnit: 'mEq/L',
  units: ELECTROLYTE_UNITS_MEQ_L,
  defaultUnitId: 'meq_l',
  min: 2,
  max: 60,
  placeholder: '24',
};

const albuminField: NumberFieldDef = {
  id: 'albumin',
  label: 'Albúmina sérica (opcional)',
  type: 'number',
  canonicalUnit: 'g/dL',
  units: ALBUMIN_UNITS_G_DL,
  defaultUnitId: 'g_dl',
  min: 0.5,
  max: 7.0,
  placeholder: '4.0',
  required: false,
  helpText: 'Si se introduce, aplica la corrección de Figge (+2.5 mEq/L por cada 1 g/dL debajo de 4.0 g/dL).',
};

export const anionGapCalculator: CalculatorDefinition = {
  id: 'anion-gap',
  name: 'Anion Gap Sérico (con Corrección por Albúmina)',
  shortName: 'Anion Gap',
  primarySpecialty: 'medicina-interna',
  secondarySpecialties: ['endocrinologia', 'urgencias'],
  subcategory: 'liquidos',
  keywords: [
    'anion gap',
    'brecha anionica',
    'acidosis metabolica',
    'cetoacidosis',
    'lactato',
    'albumina',
    'figge',
    'electrolitos',
  ],
  description:
    'Diferencia entre cationes y aniones medidos para clasificar trastornos del equilibrio ácido-base, con ajuste opcional de Figge por albúmina.',
  clinicalIndication:
    'Evaluación inicial de acidosis metabólica y sospecha de aniones no medidos (cetoacidosis, acidosis láctica, uremia, intoxicaciones).',
  validatedPopulation: 'Población general con panel electrolítico sérico.',
  requiredLabsNote: 'Requiere Na⁺, Cl⁻ y HCO₃⁻ séricos simultáneos (y albúmina sérica para corrección en hipoalbuminemia).',
  contraindications: [
    'No interpretar de forma aislada sin gasometría arterial/venosa para confirmar el trastorno ácido-base primario.',
  ],
  limitations: [
    'El rango de referencia habitual sin potasio es de 8–12 mEq/L, aunque muchos analizadores con electrodos selectivos de iones (ISE) reportan valores normales de 4–12 mEq/L.',
    'La hipoalbuminemia reduce falsamente el Anion Gap medido y puede ocultar una acidosis metabólica grave si no se aplica corrección.',
    'La relación Delta-Delta es solo orientativa y tiene amplia variabilidad fisiológica en acidosis mixtas.',
  ],
  version: 'Fórmula estándar sin K⁺ + Figge (1998)',
  references: [
    {
      citation:
        'Figge J, Jabor A, Kazda A, Fencl V. Anion gap and hypoalbuminemia. Crit Care Med. 1998;26(11):1807-1810.',
      year: 1998,
    },
    {
      citation:
        'Kraut JA, Madias NE. Serum anion gap: its uses and limitations in clinical medicine. Clin J Am Soc Nephrol. 2007;2(1):162-174.',
      year: 2007,
    },
  ],
  fields: [sodiumField, chlorideField, bicarbonateField, albuminField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(anionGapCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const naRes = getCanonicalNumberValue(sodiumField, inputs.sodium as NumberInputValue);
    const clRes = getCanonicalNumberValue(chlorideField, inputs.chloride as NumberInputValue);
    const hco3Res = getCanonicalNumberValue(
      bicarbonateField,
      inputs.bicarbonate as NumberInputValue,
    );
    const albRes = getCanonicalNumberValue(albuminField, inputs.albumin as NumberInputValue);

    const na = naRes.canonicalValue!;
    const cl = clRes.canonicalValue!;
    const hco3 = hco3Res.canonicalValue!;

    const rawMeasuredAg = na - (cl + hco3);
    const measuredAg = roundClinical(rawMeasuredAg, 1);

    const hasAlbumin = albRes.canonicalValue !== null;
    const albGdl = albRes.canonicalValue;
    const rawCorrectedAg = hasAlbumin
      ? rawMeasuredAg + 2.5 * (4.0 - albGdl!)
      : rawMeasuredAg;
    const effectiveAg = roundClinical(rawCorrectedAg, 1);

    const secondaryResults: SecondaryResultItem[] = [];

    if (hasAlbumin) {
      secondaryResults.push({
        label: 'Anion Gap medido (sin corregir)',
        formattedValue: formatClinicalNumber(measuredAg, 1),
        unit: 'mEq/L',
      });
    }

    if (effectiveAg > 12) {
      const deltaGap = roundClinical(rawCorrectedAg - 12, 1);
      secondaryResults.push({
        label: 'Delta Gap (ΔAG respecto a 12)',
        formattedValue: `+${formatClinicalNumber(deltaGap, 1)}`,
        unit: 'mEq/L',
      });

      if (hco3 < 24) {
        const deltaDelta = roundClinical((rawCorrectedAg - 12) / (24 - hco3), 2);
        let deltaNote = 'Orientativo de acidosis con AG elevado pura (1.0 – 2.0)';
        if (deltaDelta < 1.0) {
          deltaNote = 'Sugiere posible acidosis hiperclorémica concomitante (< 1.0)';
        } else if (deltaDelta > 2.0) {
          deltaNote = 'Sugiere posible alcalosis metabólica concomitante (> 2.0)';
        }
        secondaryResults.push({
          label: 'Relación Delta-Delta (ΔAG / ΔHCO₃⁻)',
          formattedValue: formatClinicalNumber(deltaDelta, 2),
          unit: 'ratio',
          note: deltaNote,
        });
      }
    }

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (effectiveAg < 3) {
      severity = 'low';
      riskClassification = 'Anion Gap bajo (< 3 mEq/L)';
      clinicalInterpretation =
        'Valor por debajo del rango esperado. Considerar hipoalbuminemia (si no se corrigió), error analítico, hipercalcemia/hipermagnesemia, paraproteinemia IgG o intoxicación por litio/bromuro.';
    } else if (effectiveAg <= 12) {
      severity = 'normal';
      riskClassification = 'Anion Gap dentro de rango habitual (3 – 12 mEq/L)';
      clinicalInterpretation =
        'Sin elevación significativa de aniones no medidos respecto al rango convencional (8–12 mEq/L; 4–12 mEq/L en analizadores ISE modernos). Si existe acidosis metabólica, orienta a causa hiperclorémica.';
    } else if (effectiveAg <= 20) {
      severity = 'moderate';
      riskClassification = 'Anion Gap moderadamente elevado (> 12 – 20 mEq/L)';
      clinicalInterpretation =
        'Elevación moderada de aniones no medidos. Correlacionar con gasometría, lactato, cuerpos cetónicos y función renal.';
    } else {
      severity = 'critical';
      riskClassification = 'Anion Gap marcadamente elevado (> 20 mEq/L)';
      clinicalInterpretation =
        'Elevación marcada compatible con acidosis metabólica con brecha aniónica elevada significativa (cetoacidosis, acidosis láctica, falla renal avanzada o ingesta de tóxicos).';
    }

    return {
      primaryResult: {
        label: hasAlbumin ? 'Anion Gap corregido por albúmina' : 'Anion Gap medido',
        value: effectiveAg,
        formattedValue: formatClinicalNumber(effectiveAg, 1),
        unit: 'mEq/L',
      },
      secondaryResults: secondaryResults.length > 0 ? secondaryResults : undefined,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: [
        'Confirmar el pH y la PaCO₂ mediante gasometría antes de clasificar el trastorno ácido-base completo.',
      ],
      guidanceDisclaimer: 'Resultado analítico orientativo; verificar rangos de referencia del laboratorio local.',
      formulaUsed: hasAlbumin
        ? 'AG corr = [Na⁺ - (Cl⁻ + HCO₃⁻)] + 2.5 × (4.0 - Albúmina g/dL)'
        : 'AG = Na⁺ - (Cl⁻ + HCO₃⁻)',
      inputsSummary: `Na⁺: ${naRes.rawNumber} ${naRes.unitLabel} · Cl⁻: ${clRes.rawNumber} ${clRes.unitLabel} · HCO₃⁻: ${hco3Res.rawNumber} ${hco3Res.unitLabel}${hasAlbumin ? ` · Albúmina: ${albRes.rawNumber} ${albRes.unitLabel}` : ''}`,
    };
  },
};
