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
import { BP_UNITS_MMHG } from '../units/converters.ts';

const pao2Field: NumberFieldDef = {
  id: 'pao2',
  label: 'PaO₂ arterial (gasometría)',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  min: 15,
  max: 650,
  placeholder: '72',
};

const fio2Field: NumberFieldDef = {
  id: 'fio2',
  label: 'FiO₂ administrada',
  type: 'number',
  canonicalUnit: 'fracción',
  units: [
    { id: 'percent', label: '% (21–100)', toCanonical: (v) => v / 100, min: 21, max: 100, step: 1 },
    { id: 'fraction', label: 'fracción (0.21–1.0)', toCanonical: (v) => v, min: 0.21, max: 1.0, step: 0.01 },
  ],
  defaultUnitId: 'percent',
  min: 0.21,
  max: 1.0,
  placeholder: '21',
};

const paco2Field: NumberFieldDef = {
  id: 'paco2',
  label: 'PaCO₂ arterial',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  min: 10,
  max: 150,
  placeholder: '40',
};

const ageField: NumberFieldDef = {
  id: 'age',
  label: 'Edad (para gradiente A-a esperado)',
  type: 'number',
  canonicalUnit: 'años',
  units: [{ id: 'years', label: 'años', toCanonical: (v) => v, min: 1, max: 115, step: 1 }],
  defaultUnitId: 'years',
  min: 1,
  max: 115,
  placeholder: '45',
};

const spo2Field: NumberFieldDef = {
  id: 'spo2',
  label: 'SpO₂ por pulsioximetría (opcional, para SaFi)',
  type: 'number',
  required: false,
  canonicalUnit: '%',
  units: [{ id: 'pct', label: '%', toCanonical: (v) => v, min: 40, max: 100, step: 1 }],
  defaultUnitId: 'pct',
  min: 40,
  max: 100,
  placeholder: '92',
};

const patmField: NumberFieldDef = {
  id: 'patm',
  label: 'Presión barométrica (Patm)',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  defaultValue: '760',
  min: 450,
  max: 800,
  placeholder: '760',
  helpText: '760 mmHg a nivel del mar; ajustar en ciudades de altitud (p. ej. 585 mmHg a 2240 m).',
};

export const oxygenationPafiSafiAaCalculator: CalculatorDefinition = {
  id: 'pafi-safi-aa',
  name: 'Oxigenación: PaFi (PaO₂/FiO₂), SaFi (SpO₂/FiO₂) y Gradiente A-a',
  shortName: 'PaFi / SaFi / Gradiente A-a',
  primarySpecialty: 'neumologia',
  secondarySpecialties: ['urgencias', 'medicina-interna'],
  subcategory: 'formulas',
  keywords: ['pafi', 'safi', 'gradiente a-a', 'alveolo arterial', 'gasometria', 'hipoxemia', 'sdra', 'berlin'],
  description:
    'Calcula de forma integrada la relación PaO₂/FiO₂ (PaFi), la relación SpO₂/FiO₂ (SaFi) y el gradiente alvéolo-arterial de oxígeno [P(A-a)O₂] corregido por presión barométrica y edad.',
  clinicalIndication:
    'Evaluación de insuficiencia respiratoria aguda, síndrome de distrés respiratorio agudo (SDRA) y diagnóstico diferencial de hipoxemia (hipoventilación vs alteración V/Q, shunt o difusión).',
  validatedPopulation: 'Adultos y pediatría (gradiente esperado por edad validado principalmente en adultos respirando aire ambiente).',
  requiredLabsNote: 'Requiere gasometría arterial (PaO₂ y PaCO₂) y FiO₂ conocida.',
  contraindications: [
    'La relación SaFi pierde precisión cuando la SpO₂ es ≥ 97–98 % (meseta plana de la curva de disociación de la hemoglobina).',
    'En dispositivos de bajo flujo (cánula nasal o mascarilla simple), la FiO₂ real varía con el volumen minuto del paciente.',
  ],
  limitations: [
    'El gradiente A-a normal estimado [(Edad/4) + 4] aplica en aire ambiente (FiO₂ 21 %); con FiO₂ suplementaria el gradiente fisiológico aumenta fisiológicamente.',
    'Criterios de Berlín para SDRA requieren además PEEP/CPAP ≥ 5 cmH₂O y exclusión de edema hidrostático puro.',
  ],
  version: 'Ecuación del gas alveolar / Berlín SDRA',
  references: [
    {
      citation:
        'ARDS Definition Task Force, Ranieri VM, Rubenfeld GD, et al. Acute respiratory distress syndrome: the Berlin Definition. JAMA. 2012;307(23):2526-2533.',
      year: 2012,
    },
    {
      citation:
        'Rice TW, Wheeler AP, Bernard GR, et al. Comparison of the SpO2/FIO2 ratio and the PaO2/FIO2 ratio in patients with acute lung injury or ARDS. Chest. 2007;132(2):410-417.',
      year: 2007,
    },
  ],
  fields: [pao2Field, fio2Field, paco2Field, ageField, spo2Field, patmField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(oxygenationPafiSafiAaCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const pao2 = getCanonicalNumberValue(pao2Field, inputs.pao2 as NumberInputValue).canonicalValue!;
    const fio2 = getCanonicalNumberValue(fio2Field, inputs.fio2 as NumberInputValue).canonicalValue!;
    const paco2 = getCanonicalNumberValue(paco2Field, inputs.paco2 as NumberInputValue).canonicalValue!;
    const age = getCanonicalNumberValue(ageField, inputs.age as NumberInputValue).canonicalValue!;
    const spo2 = getCanonicalNumberValue(spo2Field, inputs.spo2 as NumberInputValue).canonicalValue;
    const patm = getCanonicalNumberValue(patmField, inputs.patm as NumberInputValue).canonicalValue!;

    const pafi = roundClinical(pao2 / fio2, 0);
    const safi = spo2 !== null ? roundClinical(spo2 / fio2, 0) : null;
    const pAo2 = roundClinical(fio2 * (patm - 47) - paco2 / 0.8, 1);
    const aaGrad = roundClinical(pAo2 - pao2, 1);
    const expectedAa = roundClinical(age / 4 + 4, 1);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (pafi >= 400) {
      severity = 'normal';
      riskClassification = `Oxigenación conservada (PaFi ${pafi} mmHg)`;
      clinicalInterpretation = 'Intercambio gaseoso arterial dentro de parámetros esperados.';
    } else if (pafi >= 300) {
      severity = 'low';
      riskClassification = `Alteración leve de oxigenación (PaFi ${pafi} mmHg)`;
      clinicalInterpretation = 'Descenso leve de la PaO₂/FiO₂; vigilar evolución clínica.';
    } else if (pafi > 200) {
      severity = 'moderate';
      riskClassification = `Hipoxemia moderada / Rango SDRA leve (PaFi ${pafi} mmHg)`;
      clinicalInterpretation = 'PaFi 201–300 mmHg: compromiso moderado del intercambio gaseoso.';
    } else if (pafi > 100) {
      severity = 'high';
      riskClassification = `Hipoxemia grave / Rango SDRA moderado (PaFi ${pafi} mmHg)`;
      clinicalInterpretation = 'PaFi 101–200 mmHg: insuficiencia respiratoria hipoxémica significativa.';
    } else {
      severity = 'critical';
      riskClassification = `Hipoxemia crítica / Rango SDRA grave (PaFi ${pafi} mmHg)`;
      clinicalInterpretation = 'PaFi ≤ 100 mmHg: trastorno grave de oxigenación que requiere soporte ventilatorio avanzado.';
    }

    const aaNote =
      fio2 <= 0.22
        ? aaGrad > expectedAa
          ? `Elevado para la edad (esperado ≤ ${expectedAa} mmHg): sugiere alteración V/Q, shunt o difusión.`
          : `Normal para la edad (esperado ≤ ${expectedAa} mmHg): si hay hipoxemia, sugiere hipoventilación o baja PiO₂.`
        : 'Calculado con O₂ suplementario (referencia por edad aplica estrictamente a FiO₂ 21 %).';

    return {
      primaryResult: {
        label: 'Índice PaFi (PaO₂ / FiO₂)',
        value: pafi,
        formattedValue: String(pafi),
        unit: 'mmHg',
      },
      secondaryResults: [
        ...(safi !== null
          ? [{ label: 'Índice SaFi (SpO₂ / FiO₂)', formattedValue: String(safi), unit: 'mmHg eq.', note: spo2! >= 97 ? 'Precaución: SpO₂ ≥ 97 % atenúa sensibilidad de SaFi' : undefined }]
          : []),
        { label: 'Gradiente A-a [P(A-a)O₂]', formattedValue: formatClinicalNumber(aaGrad, 1), unit: 'mmHg', note: aaNote },
        { label: 'Presión alveolar de O₂ (PAO₂)', formattedValue: formatClinicalNumber(pAo2, 1), unit: 'mmHg' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: [
        'Evaluar PaCO₂ y pH junto con el gradiente A-a para diferenciar falla ventilatoria (hipercapnia) de falla parenquimatosa/vascular.',
      ],
      guidanceDisclaimer: 'Correlacionar con clínica, PEEP aplicada e imagen pulmonar.',
      formulaUsed: 'PaFi = PaO₂/FiO₂ · PAO₂ = FiO₂×(Patm−47) − PaCO₂/0.8 · Gradiente A-a = PAO₂ − PaO₂',
      inputsSummary: `PaO₂: ${pao2} mmHg · FiO₂: ${Math.round(fio2 * 100)}% · PaCO₂: ${paco2} mmHg · Edad: ${age} · Patm: ${patm}`,
    };
  },
};
