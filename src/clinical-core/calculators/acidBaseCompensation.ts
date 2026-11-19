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
import { BP_UNITS_MMHG, ELECTROLYTE_UNITS_MEQ_L } from '../units/converters.ts';

const phField: NumberFieldDef = {
  id: 'ph',
  label: 'pH arterial',
  type: 'number',
  canonicalUnit: 'pH',
  units: [{ id: 'ph', label: 'unidades pH', toCanonical: (v) => v, min: 6.6, max: 7.8, step: 0.01 }],
  defaultUnitId: 'ph',
  min: 6.6,
  max: 7.8,
  placeholder: '7.22',
};

const paco2Field: NumberFieldDef = {
  id: 'paco2',
  label: 'PaCO₂ arterial',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  min: 10,
  max: 140,
  placeholder: '24',
};

const hco3Field: NumberFieldDef = {
  id: 'hco3',
  label: 'Bicarbonato (HCO₃⁻)',
  type: 'number',
  canonicalUnit: 'mEq/L',
  units: ELECTROLYTE_UNITS_MEQ_L,
  defaultUnitId: 'meq_l',
  min: 2,
  max: 65,
  placeholder: '10',
};

const respTimingField: SelectFieldDef = {
  id: 'respTiming',
  label: 'Temporalidad (relevante si trastorno respiratorio primario)',
  type: 'select',
  defaultValue: 'acute',
  options: [
    { value: 'acute', label: 'Agudo (< 24–48 horas)' },
    { value: 'chronic', label: 'Crónico (≥ 3–5 días)' },
  ],
};

export const acidBaseCompensationCalculator: CalculatorDefinition = {
  id: 'acid-base-compensation',
  name: 'Equilibrio Ácido-Base — Fórmula de Winter y Reglas de Compensación',
  shortName: 'Ácido-Base / Winter',
  primarySpecialty: 'urgencias',
  secondarySpecialties: ['medicina-interna', 'nefrologia', 'neumologia'],
  subcategory: 'formulas',
  keywords: ['winter', 'acido base', 'gasometria', 'acidosis', 'alcalosis', 'compensacion', 'trastorno mixto'],
  description:
    'Identifica el trastorno ácido-base primario, calcula la compensación esperada (Fórmula de Winter y reglas metabólicas/respiratorias) y detecta trastornos mixtos.',
  clinicalIndication:
    'Interpretación sistemática de gasometría arterial en urgencias, UCI, nefrología y medicina interna.',
  validatedPopulation: 'Adultos y pediatría (valores de referencia clásicos a nivel del mar: pH 7.35–7.45, PaCO₂ 35–45 mmHg, HCO₃⁻ 22–26 mEq/L).',
  requiredLabsNote: 'Requiere gasometría arterial (pH, PaCO₂ y HCO₃⁻).',
  contraindications: [
    'La gasometría venosa periférica no es intercambiable directamente con la arterial para PaCO₂ y pH sin ajuste clínico.',
  ],
  limitations: [
    'Un pH dentro de 7.35–7.45 con PaCO₂ y HCO₃⁻ alterados sugiere trastorno mixto equilibrado o compensación crónica completa; la compensación fisiológica rara vez normaliza completamente el pH (salvo alcalosis respiratoria crónica).',
    'Para detectar trastornos metabólicos triples ocultos en acidosis metabólica, calcular además el Anion Gap y la relación Delta-Delta.',
  ],
  version: 'Winter (1967) & Reglas de Compensación Clásicas',
  references: [
    {
      citation:
        'Albert MS, Dell RB, Winters RW. Quantitative displacement of acid-base equilibrium in metabolic acidosis. Ann Intern Med. 1967;66(2):312-322.',
      year: 1967,
    },
    {
      citation:
        'Berend K, de Vries AP, Gans RO. Physiological approach to assessment of acid-base disturbances. N Engl J Med. 2014;371(15):1434-1445.',
      year: 2014,
    },
  ],
  fields: [phField, paco2Field, hco3Field, respTimingField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(acidBaseCompensationCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const ph = getCanonicalNumberValue(phField, inputs.ph as NumberInputValue).canonicalValue!;
    const paco2 = getCanonicalNumberValue(paco2Field, inputs.paco2 as NumberInputValue).canonicalValue!;
    const hco3 = getCanonicalNumberValue(hco3Field, inputs.hco3 as NumberInputValue).canonicalValue!;
    const isChronic = inputs.respTiming === 'chronic';

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let expectedLabel = 'Valores esperados';
    let expectedText = 'Dentro de rango basal';
    let formulaUsed = 'Evaluación pH (7.35–7.45), PaCO₂ (35–45) y HCO₃⁻ (22–26)';
    let primaryLabel = 'Equilibrio normal';
    let primaryVal = ph;
    let primaryFormatted = `pH ${formatClinicalNumber(ph, 2)}`;

    const guidance: string[] = [];

    const normalPh = ph >= 7.35 && ph <= 7.45;
    const normalCo2 = paco2 >= 35 && paco2 <= 45;
    const normalHco3 = hco3 >= 22 && hco3 <= 26;

    if (normalPh && normalCo2 && normalHco3) {
      severity = 'normal';
      riskClassification = 'Equilibrio ácido-base normal';
      clinicalInterpretation = 'pH, PaCO₂ y HCO₃⁻ dentro de límites fisiológicos normales.';
    } else if (ph < 7.35) {
      // Acidemia
      const respAcid = paco2 > 45;
      const metAcid = hco3 < 22;
      if (respAcid && metAcid) {
        severity = 'critical';
        primaryFormatted = 'Acidosis mixta';
        riskClassification = 'Acidemia grave — Trastorno mixto (Acidosis respiratoria + metabólica)';
        clinicalInterpretation =
          'Coexisten hipercapnia (PaCO₂ > 45 mmHg) e hipobicarbonatemia (HCO₃⁻ < 22 mEq/L), explicando una acidemia combinada.';
        guidance.push('Evaluar vía aérea/ventilación y calcular Anion Gap + lactato de inmediato.');
      } else if (metAcid) {
        const winterCenter = roundClinical(1.5 * hco3 + 8, 1);
        const winterLow = roundClinical(winterCenter - 2, 1);
        const winterHigh = roundClinical(winterCenter + 2, 1);
        expectedLabel = 'PaCO₂ esperada (Fórmula de Winter)';
        expectedText = `${formatClinicalNumber(winterCenter, 1)} ± 2 (${winterLow} – ${winterHigh} mmHg)`;
        formulaUsed = 'Winter: PaCO₂ esperada = (1.5 × HCO₃⁻) + 8 ± 2';
        primaryVal = winterCenter;
        primaryFormatted = `${formatClinicalNumber(winterCenter, 1)} mmHg`;
        primaryLabel = 'PaCO₂ esperada (Winter)';

        if (paco2 > winterHigh) {
          severity = ph < 7.2 ? 'critical' : 'high';
          riskClassification = 'Acidosis metabólica + Acidosis respiratoria agregada';
          clinicalInterpretation = `La PaCO₂ medida (${paco2} mmHg) supera el límite esperado de Winter (${winterLow}–${winterHigh} mmHg), indicando hipoventilación o trastorno respiratorio concomitante.`;
        } else if (paco2 < winterLow) {
          severity = ph < 7.2 ? 'critical' : 'high';
          riskClassification = 'Acidosis metabólica + Alcalosis respiratoria agregada';
          clinicalInterpretation = `La PaCO₂ medida (${paco2} mmHg) es menor al límite esperado de Winter (${winterLow}–${winterHigh} mmHg), indicando hiperventilación primaria asociada.`;
        } else {
          severity = ph < 7.2 ? 'critical' : 'high';
          riskClassification = 'Acidosis metabólica con compensación respiratoria adecuada';
          clinicalInterpretation = `La PaCO₂ medida (${paco2} mmHg) coincide con el rango esperado de Winter (${winterLow}–${winterHigh} mmHg).`;
        }
        guidance.push('Calcular Anion Gap y relación Delta-Delta para orientar etiología de la acidosis metabólica.');
      } else if (respAcid) {
        const deltaCo2 = paco2 - 40;
        const factor = isChronic ? 0.35 : 0.1;
        const expHco3 = roundClinical(24 + factor * deltaCo2, 1);
        const low = roundClinical(expHco3 - 2, 1);
        const high = roundClinical(expHco3 + (isChronic ? 3 : 2), 1);
        expectedLabel = `HCO₃⁻ esperado (Acidosis resp. ${isChronic ? 'crónica' : 'aguda'})`;
        expectedText = `${formatClinicalNumber(expHco3, 1)} (${low} – ${high} mEq/L)`;
        formulaUsed = isChronic
          ? 'Acidosis resp. crónica: HCO₃⁻ = 24 + 0.35 × (PaCO₂ − 40)'
          : 'Acidosis resp. aguda: HCO₃⁻ = 24 + 0.1 × (PaCO₂ − 40)';
        primaryVal = expHco3;
        primaryFormatted = `${formatClinicalNumber(expHco3, 1)} mEq/L`;
        primaryLabel = 'HCO₃⁻ esperado';

        if (hco3 < low) {
          severity = 'critical';
          riskClassification = 'Acidosis respiratoria + Acidosis metabólica oculta';
          clinicalInterpretation = `El HCO₃⁻ medido (${hco3}) es inferior al esperado (${low}–${high}), sugiriendo acidosis metabólica agregada (o proceso agudo sobre crónico).`;
        } else if (hco3 > high) {
          severity = 'high';
          riskClassification = 'Acidosis respiratoria + Alcalosis metabólica asociada';
          clinicalInterpretation = `El HCO₃⁻ medido (${hco3}) excede la compensación esperada (${low}–${high}), sugiriendo alcalosis metabólica concurrente.`;
        } else {
          severity = ph < 7.25 ? 'critical' : 'high';
          riskClassification = `Acidosis respiratoria ${isChronic ? 'crónica' : 'aguda'} adecuadamente compensada`;
          clinicalInterpretation = `El HCO₃⁻ (${hco3} mEq/L) concuerda con la respuesta renal esperada (${low}–${high} mEq/L).`;
        }
      } else {
        severity = 'moderate';
        riskClassification = 'Acidemia leve sin desviación franca aislada';
        clinicalInterpretation = 'Verificar integridad de datos gasométricos (ecuación de Henderson-Hasselbalch).';
      }
    } else if (ph > 7.45) {
      // Alcalemia
      const respAlk = paco2 < 35;
      const metAlk = hco3 > 26;
      if (respAlk && metAlk) {
        severity = 'high';
        primaryFormatted = 'Alcalosis mixta';
        riskClassification = 'Alcalemia — Trastorno mixto (Alcalosis respiratoria + metabólica)';
        clinicalInterpretation = 'Coexisten hipocapnia (PaCO₂ < 35) e hiperbicarbonatemia (HCO₃⁻ > 26), potenciando la alcalemia.';
      } else if (metAlk) {
        const expCo2 = roundClinical(40 + 0.7 * (hco3 - 24), 1);
        const low = roundClinical(expCo2 - 5, 1);
        const high = roundClinical(expCo2 + 5, 1);
        expectedLabel = 'PaCO₂ esperada (Alcalosis metabólica)';
        expectedText = `${formatClinicalNumber(expCo2, 1)} ± 5 (${low} – ${high} mmHg)`;
        formulaUsed = 'Alcalosis metabólica: PaCO₂ esperada = 40 + 0.7 × (HCO₃⁻ − 24) ± 5';
        primaryVal = expCo2;
        primaryFormatted = `${formatClinicalNumber(expCo2, 1)} mmHg`;
        primaryLabel = 'PaCO₂ esperada';

        if (paco2 < low) {
          severity = ph > 7.55 ? 'high' : 'moderate';
          riskClassification = 'Alcalosis metabólica + Alcalosis respiratoria agregada';
          clinicalInterpretation = `PaCO₂ (${paco2}) por debajo de lo esperado (${low}–${high} mmHg).`;
        } else if (paco2 > high) {
          severity = ph > 7.55 ? 'high' : 'moderate';
          riskClassification = 'Alcalosis metabólica + Acidosis respiratoria agregada';
          clinicalInterpretation = `PaCO₂ (${paco2}) mayor de lo esperado (${low}–${high} mmHg), sugiriendo retención primaria de CO₂ asociada.`;
        } else {
          severity = ph > 7.55 ? 'high' : 'moderate';
          riskClassification = 'Alcalosis metabólica compensada';
          clinicalInterpretation = `PaCO₂ medida (${paco2} mmHg) dentro del rango compensatorio esperado (${low}–${high} mmHg).`;
        }
      } else if (respAlk) {
        const drop = 40 - paco2;
        const factor = isChronic ? 0.5 : 0.2;
        const expHco3 = roundClinical(24 - factor * drop, 1);
        const low = roundClinical(expHco3 - 2, 1);
        const high = roundClinical(expHco3 + 2, 1);
        expectedLabel = `HCO₃⁻ esperado (Alcalosis resp. ${isChronic ? 'crónica' : 'aguda'})`;
        expectedText = `${formatClinicalNumber(expHco3, 1)} ± 2 (${low} – ${high} mEq/L)`;
        formulaUsed = isChronic
          ? 'Alcalosis resp. crónica: HCO₃⁻ = 24 − 0.5 × (40 − PaCO₂)'
          : 'Alcalosis resp. aguda: HCO₃⁻ = 24 − 0.2 × (40 − PaCO₂)';
        primaryVal = expHco3;
        primaryFormatted = `${formatClinicalNumber(expHco3, 1)} mEq/L`;
        primaryLabel = 'HCO₃⁻ esperado';

        if (hco3 < low) {
          severity = 'moderate';
          riskClassification = 'Alcalosis respiratoria + Acidosis metabólica asociada';
          clinicalInterpretation = `HCO₃⁻ (${hco3}) menor de lo esperado (${low}–${high} mEq/L), compatible con acidosis metabólica simultánea (p. ej. sepsis, intoxicación por salicilatos).`;
        } else if (hco3 > high) {
          severity = 'moderate';
          riskClassification = 'Alcalosis respiratoria + Alcalosis metabólica asociada';
          clinicalInterpretation = `HCO₃⁻ (${hco3}) superior al esperado (${low}–${high} mEq/L).`;
        } else {
          severity = ph > 7.55 ? 'high' : 'moderate';
          riskClassification = `Alcalosis respiratoria ${isChronic ? 'crónica' : 'aguda'} compensada`;
          clinicalInterpretation = `HCO₃⁻ (${hco3} mEq/L) dentro del descenso compensatorio esperado (${low}–${high} mEq/L).`;
        }
      } else {
        severity = 'moderate';
        riskClassification = 'Alcalemia leve';
        clinicalInterpretation = 'Corroborar congruencia pH-PaCO₂-HCO₃⁻.';
      }
    } else {
      // pH 7.35 - 7.45 but PaCO2 or HCO3 abnormal -> mixed balanced or complete chronic compensation
      severity = 'moderate';
      primaryFormatted = 'pH normal con trastorno';
      riskClassification = 'pH en rango normal con PaCO₂ y/o HCO₃⁻ alterados (trastorno mixto equilibrado o compensación crónica)';
      clinicalInterpretation =
        'Cuando PaCO₂ y HCO₃⁻ están alterados en la misma dirección con pH normal puede existir compensación completa (p. ej. alcalosis respiratoria crónica) o un trastorno mixto contrabalanceado. Si cambian en direcciones opuestas o hay Anion Gap elevado, existe trastorno mixto.';
      guidance.push('Calcular Anion Gap aunque el pH esté normal: un AG elevado puede revelar acidosis metabólica oculta.');
    }

    if (guidance.length === 0) {
      guidance.push('Correlacionar siempre con Anion Gap, electrolitos (K⁺, Cl⁻), lactato y situación hemodinámica/ventilatoria.');
    }

    return {
      primaryResult: {
        label: primaryLabel,
        value: primaryVal,
        formattedValue: primaryFormatted,
        unit: '',
      },
      secondaryResults: [
        { label: expectedLabel, formattedValue: expectedText, unit: '' },
        { label: 'Gasometría ingresada', formattedValue: `pH ${formatClinicalNumber(ph, 2)} · PaCO₂ ${paco2} · HCO₃⁻ ${hco3}`, unit: '' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'Verificar coherencia interna gasométrica (H⁺ ≈ 24 × PaCO₂ / HCO₃⁻).',
      formulaUsed,
      inputsSummary: `pH: ${formatClinicalNumber(ph, 2)} · PaCO₂: ${paco2} mmHg · HCO₃⁻: ${hco3} mEq/L (${isChronic ? 'Crónico' : 'Agudo'})`,
    };
  },
};
