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
import {
  BUN_OR_UREA_UNITS_MG_DL_BUN,
  ELECTROLYTE_UNITS_MEQ_L,
  ETHANOL_UNITS_MG_DL,
  GLUCOSE_UNITS_MG_DL,
  OSMOLARITY_UNITS_MOSM_KG,
} from '../units/converters.ts';

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

const glucoseField: NumberFieldDef = {
  id: 'glucose',
  label: 'Glucosa sérica',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: GLUCOSE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 15,
  max: 2000,
  placeholder: '95',
};

const bunField: NumberFieldDef = {
  id: 'bun',
  label: 'BUN o Urea sérica',
  type: 'number',
  canonicalUnit: 'BUN mg/dL',
  units: BUN_OR_UREA_UNITS_MG_DL_BUN,
  defaultUnitId: 'bun_mg_dl',
  min: 1,
  max: 300,
  placeholder: '14',
};

const measuredOsmField: NumberFieldDef = {
  id: 'measuredOsm',
  label: 'Osmolalidad medida en laboratorio (opcional)',
  type: 'number',
  canonicalUnit: 'mOsm/kg',
  units: OSMOLARITY_UNITS_MOSM_KG,
  defaultUnitId: 'mosm_kg',
  min: 200,
  max: 500,
  placeholder: '290',
  required: false,
  helpText: 'Si se introduce, calcula el Gap Osmolar (Osmolalidad medida - calculada).',
};

const ethanolField: NumberFieldDef = {
  id: 'ethanol',
  label: 'Etanol sérico (opcional)',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: ETHANOL_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 0,
  max: 800,
  placeholder: '0',
  required: false,
  helpText: 'Permite corregir el Gap Osmolar cuando hay ingesta etílica concomitante.',
};

export const plasmaOsmolarityCalculator: CalculatorDefinition = {
  id: 'plasma-osmolarity',
  name: 'Osmolaridad Plasmática Calculada y Gap Osmolar',
  shortName: 'Osmolaridad',
  primarySpecialty: 'medicina-interna',
  secondarySpecialties: ['endocrinologia', 'urgencias'],
  subcategory: 'liquidos',
  keywords: [
    'osmolaridad',
    'osmolalidad',
    'tonicidad',
    'gap osmolar',
    'hiperosmolar',
    'metanol',
    'etilenglicol',
  ],
  description:
    'Calcula la osmolaridad plasmática total, la osmolaridad efectiva (tonicidad) y opcionalmente el Gap Osmolar para sospecha de osmoles no medidos.',
  clinicalIndication:
    'Evaluación de estados hiperosmolares, hiponatremia (hipotónica vs. isotónica/hipertónica) y sospecha de intoxicación por alcoholes tóxicos.',
  validatedPopulation: 'Población general con perfil bioquímico sérico.',
  requiredLabsNote: 'Requiere Na⁺, glucosa y BUN/Urea séricos; para el Gap Osmolar requiere osmolalidad medida por osmómetro de punto de congelación.',
  contraindications: [
    'Un Gap Osmolar normal NO descarta completamente la intoxicación por metanol o etilenglicol (p. ej. fases tardías tras metabolización a ácidos orgánicos).',
  ],
  limitations: [
    'La urea atraviesa libremente las membranas celulares (osmol inefectivo); para evaluar riesgo de edema o deshidratación celular se debe usar la Osmolaridad Efectiva (tonicidad).',
    'El rango habitual de osmolaridad plasmática es 275–295 mOsm/kg; el Gap Osmolar normal suele ser < 10 mOsm/kg.',
    'La contribución osmolar empírica del etanol varía entre publicaciones (Etanol mg/dL / 3.7 según Purssell vs. / 4.6 molar estricto).',
  ],
  version: 'Ecuación estándar + Purssell (Etanol)',
  references: [
    {
      citation:
        'Kraut JA, Kurtz I. Toxic alcohol ingestions: clinical features, diagnosis, and management. Clin J Am Soc Nephrol. 2008;3(1):208-225.',
      year: 2008,
    },
    {
      citation:
        'Purssell RA, Pudek M, Brubacher J, Abu-Laban RB. Derivation and validation of a formula to calculate the contribution of ethanol to the osmolal gap. Ann Emerg Med. 2001;38(6):653-659.',
      year: 2001,
    },
  ],
  fields: [sodiumField, glucoseField, bunField, measuredOsmField, ethanolField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(plasmaOsmolarityCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const naRes = getCanonicalNumberValue(sodiumField, inputs.sodium as NumberInputValue);
    const gluRes = getCanonicalNumberValue(glucoseField, inputs.glucose as NumberInputValue);
    const bunRes = getCanonicalNumberValue(bunField, inputs.bun as NumberInputValue);
    const measRes = getCanonicalNumberValue(
      measuredOsmField,
      inputs.measuredOsm as NumberInputValue,
    );
    const ethRes = getCanonicalNumberValue(ethanolField, inputs.ethanol as NumberInputValue);

    const na = naRes.canonicalValue!;
    const glu = gluRes.canonicalValue!;
    const bun = bunRes.canonicalValue!;
    const hasMeasured = measRes.canonicalValue !== null;
    const ethMgDl = ethRes.canonicalValue ?? 0;

    const rawEffective = 2 * na + glu / 18;
    const rawCalc = rawEffective + bun / 2.8;
    const rawWithEthanol = rawCalc + (ethMgDl > 0 ? ethMgDl / 3.7 : 0);

    const osmCalc = roundClinical(rawCalc, 1);
    const osmEff = roundClinical(rawEffective, 1);

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Osmolaridad efectiva (Tonicidad)',
        formattedValue: formatClinicalNumber(osmEff, 1),
        unit: 'mOsm/kg',
        note: '2×Na⁺ + Glucosa/18 (excluye urea; referencia 275–295)',
      },
    ];

    let gapValue: number | null = null;
    if (hasMeasured) {
      const measured = measRes.canonicalValue!;
      gapValue = roundClinical(measured - rawWithEthanol, 1);
      secondaryResults.push({
        label: ethMgDl > 0 ? 'Gap Osmolar (ajustado por etanol)' : 'Gap Osmolar',
        formattedValue: `${gapValue >= 0 ? '+' : ''}${formatClinicalNumber(gapValue, 1)}`,
        unit: 'mOsm/kg',
        note: gapValue > 10 ? 'Elevado (> 10 mOsm/kg): sospechar osmoles no medidos' : 'Dentro de rango habitual (< 10 mOsm/kg)',
      });
    }

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (gapValue !== null && gapValue > 10) {
      severity = gapValue > 20 ? 'critical' : 'high';
      riskClassification = `Gap Osmolar elevado (${gapValue.toFixed(1)} mOsm/kg)`;
      clinicalInterpretation =
        'Presencia de osmoles no medidos. Considerar alcoholes tóxicos (metanol, etilenglicol, isopropanol), manitol, propilenglicol o cetoacidosis/acidosis láctica marcada.';
    } else if (osmCalc < 275) {
      severity = osmCalc < 260 ? 'high' : 'moderate';
      riskClassification = `Hipoosmolaridad (${osmCalc.toFixed(1)} mOsm/kg)`;
      clinicalInterpretation =
        'Estado hipoosmolar; en contexto de hiponatremia confirma hiponatremia hipotónica verdadera.';
    } else if (osmCalc <= 295) {
      severity = 'normal';
      riskClassification = `Osmolaridad calculada normal (${osmCalc.toFixed(1)} mOsm/kg)`;
      clinicalInterpretation =
        'Dentro del rango fisiológico habitual de referencia (275–295 mOsm/kg).';
    } else if (osmEff >= 320) {
      severity = 'critical';
      riskClassification = `Hipertonicidad grave (Tonicidad ${osmEff.toFixed(1)} mOsm/kg)`;
      clinicalInterpretation =
        'Hiperosmolaridad efectiva marcada (umbral clásico ≥ 320 mOsm/kg en estado hiperosmolar hiperglucémico o hipernatremia grave).';
    } else {
      severity = 'moderate';
      riskClassification = `Hiperosmolaridad (${osmCalc.toFixed(1)} mOsm/kg)`;
      clinicalInterpretation =
        'Por encima del rango de referencia. Evaluar contribución de sodio, glucosa y urea (tonicidad vs. hiperazoemia).';
    }

    return {
      primaryResult: {
        label: 'Osmolaridad plasmática calculada',
        value: osmCalc,
        formattedValue: formatClinicalNumber(osmCalc, 1),
        unit: 'mOsm/kg',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: [
        'Evaluar la tonicidad (osmolaridad efectiva) junto con el estado clínico neurológico y el Anion Gap.',
      ],
      guidanceDisclaimer: 'Cálculo bioquímico orientativo; correlacionar con gasometría y cuadro toxicológico/metabólico.',
      formulaUsed: 'Osm = 2×Na⁺ + (Glucosa mg/dL / 18) + (BUN mg/dL / 2.8)',
      inputsSummary: `Na⁺: ${naRes.rawNumber} · Glucosa: ${gluRes.rawNumber} ${gluRes.unitLabel} · BUN/Urea: ${bunRes.rawNumber} ${bunRes.unitLabel}`,
    };
  },
};
