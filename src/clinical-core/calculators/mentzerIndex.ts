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
  SeverityLevel,
} from '../types/clinical.ts';

const mcvField: NumberFieldDef = {
  id: 'mcv',
  label: 'Volumen corpuscular medio (VCM)',
  type: 'number',
  canonicalUnit: 'fL',
  units: [{ id: 'fl', label: 'fL', toCanonical: (v) => v, min: 40, max: 130, step: 0.1 }],
  defaultUnitId: 'fl',
  min: 40,
  max: 130,
  placeholder: '68',
  helpText: 'El índice de Mentzer se aplica en presencia de microcitosis (VCM < 80 fL en adultos).',
};

const rbcField: NumberFieldDef = {
  id: 'rbc',
  label: 'Recuento de eritrocitos (RBC)',
  type: 'number',
  canonicalUnit: '×10⁶/µL',
  units: [{ id: '10e6_ul', label: '×10⁶/µL (10¹²/L)', toCanonical: (v) => v, min: 1.0, max: 10.0, step: 0.01 }],
  defaultUnitId: '10e6_ul',
  min: 1.0,
  max: 10.0,
  placeholder: '5.8',
};

export const mentzerIndexCalculator: CalculatorDefinition = {
  id: 'mentzer-index',
  name: 'Índice de Mentzer (Ferropenia vs. Rasgo Talasémico en Microcitosis)',
  shortName: 'Índice de Mentzer',
  primarySpecialty: 'hematologia',
  secondarySpecialties: ['medicina-interna', 'pediatria'],
  subcategory: 'diagnostico',
  keywords: ['mentzer', 'microcitosis', 'talasemia', 'ferropenia', 'vcm', 'eritrocitos', 'anemia'],
  description:
    'Cociente VCM / Recuento eritrocitario para orientar el diagnóstico diferencial inicial de la anemia microcítica entre deficiencia de hierro y rasgo talasémico.',
  clinicalIndication:
    'Estudio inicial de microcitosis (VCM bajo) en biometría hemática de consulta externa o pediatría.',
  validatedPopulation: 'Adultos y niños con anemia microcítica aislada.',
  requiredLabsNote: 'Requiere biometría hemática completa (VCM en fL y eritrocitos en millones/µL).',
  contraindications: [
    'No utilizar en anemia normocítica o macrocítica (VCM ≥ 80 fL en adultos).',
    'Pierde validez tras transfusión sanguínea reciente, durante terapia con hierro o si coexisten ferropenia y talasemia.',
  ],
  limitations: [
    'Es una herramienta de orientación inicial; no confirma ni descarta rasgo talasémico por sí sola (requiere perfil férrico completo y electroforesis/HPLC de hemoglobina).',
  ],
  version: 'Mentzer (Lancet, 1973)',
  references: [
    {
      citation:
        'Mentzer WC Jr. Differentiation of iron deficiency from thalassaemia trait. Lancet. 1973;1(7808):882.',
      year: 1973,
    },
  ],
  fields: [mcvField, rbcField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(mentzerIndexCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const mcv = getCanonicalNumberValue(mcvField, inputs.mcv as NumberInputValue).canonicalValue!;
    const rbc = getCanonicalNumberValue(rbcField, inputs.rbc as NumberInputValue).canonicalValue!;
    const index = roundClinical(mcv / rbc, 2);

    let severity: SeverityLevel = 'info';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (mcv >= 80) {
      severity = 'info';
      riskClassification = `VCM no microcítico en adultos (${mcv} fL) — Índice = ${formatClinicalNumber(index, 2)}`;
      clinicalInterpretation =
        'El índice de Mentzer está validado para anemia microcítica (VCM < 80 fL en adultos; en pediatría verificar umbral por edad).';
    } else if (index < 13) {
      severity = 'moderate';
      riskClassification = `Orientación hacia Rasgo Talasémico (Mentzer = ${formatClinicalNumber(index, 2)} < 13)`;
      clinicalInterpretation =
        'Un cociente < 13 (microcitosis marcada con recuento eritrocitario conservado o elevado) sugiere rasgo talasémico menor.';
    } else if (index === 13) {
      severity = 'moderate';
      riskClassification = 'Zona limítrofe / indeterminada (Mentzer = 13.00)';
      clinicalInterpretation =
        'Valor exactamente en el punto de corte (13); se requieren estudios confirmatorios para diferenciar ferropenia de talasemia.';
    } else {
      severity = 'moderate';
      riskClassification = `Orientación hacia Anemia Ferropénica (Mentzer = ${formatClinicalNumber(index, 2)} > 13)`;
      clinicalInterpretation =
        'Un cociente > 13 (descenso proporcional del recuento eritrocitario junto con microcitosis) orienta a deficiencia de hierro.';
    }

    return {
      primaryResult: {
        label: 'Índice de Mentzer',
        value: index,
        formattedValue: formatClinicalNumber(index, 2),
        unit: '(VCM / RBC)',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: [
        'Confirmar siempre con cinética de hierro (ferritina sérica, hierro sérico, TIBC/% saturación) y, si persiste sospecha de talasemia con hierro normal, solicitar electroforesis/HPLC de hemoglobina (HbA₂).',
      ],
      guidanceDisclaimer: 'Indicador de cribado en biometría hemática; no constituye diagnóstico definitivo.',
      formulaUsed: 'Índice de Mentzer = VCM (fL) / Eritrocitos (×10⁶/µL)',
      inputsSummary: `VCM: ${mcv} fL · Eritrocitos: ${rbc} ×10⁶/µL`,
    };
  },
};
