import {
  computeHadlockEfw1985,
  evaluateFetalWeight,
  evaluateMaternalFetalBalance,
  evaluateMaternalWeightGain,
  type PregnancyPlurality,
} from '../data/obstetricWeightStandards.ts';
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
import { HEIGHT_UNITS_M, WEIGHT_UNITS_KG } from '../units/converters.ts';

const weeksField: NumberFieldDef = {
  id: 'gestationalWeeks',
  label: 'Edad gestacional actual',
  type: 'number',
  canonicalUnit: 'semanas',
  units: [
    { id: 'weeks', label: 'semanas (4–42)', toCanonical: (v) => v, min: 4, max: 42, step: 0.5 },
  ],
  defaultUnitId: 'weeks',
  defaultValue: '28',
  min: 4,
  max: 42,
  placeholder: '28',
  helpText: 'Semanas de gestación confirmadas por FUM confiable o ecografía del 1.er trimestre.',
};

const pluralityField: SelectFieldDef = {
  id: 'plurality',
  label: 'Tipo de gestación',
  type: 'select',
  defaultValue: 'singleton',
  options: [
    {
      value: 'singleton',
      label: 'Embarazo único',
      description: 'Metas oficiales IOM/NAM 2009 para feto único y curvas Hadlock 1991.',
    },
    {
      value: 'twin',
      label: 'Embarazo gemelar',
      description: 'Metas provisionales IOM 2009 para gestación doble (normopeso, sobrepeso, obesidad).',
    },
  ],
};

const preWeightField: NumberFieldDef = {
  id: 'preWeight',
  label: 'Peso materno pregestacional (o del 1.er control < 10 sem)',
  type: 'number',
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  defaultValue: '62',
  min: 30,
  max: 250,
  placeholder: '62',
};

const heightField: NumberFieldDef = {
  id: 'height',
  label: 'Estatura materna',
  type: 'number',
  canonicalUnit: 'm',
  units: HEIGHT_UNITS_M,
  defaultUnitId: 'cm',
  defaultValue: '162',
  min: 1.1,
  max: 2.2,
  placeholder: '162',
};

const currentWeightField: NumberFieldDef = {
  id: 'currentWeight',
  label: 'Peso materno actual',
  type: 'number',
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  defaultValue: '70',
  min: 30,
  max: 280,
  placeholder: '70',
};

const fetalModeField: SelectFieldDef = {
  id: 'fetalInputMode',
  label: 'Evaluación del peso fetal estimado (PFE)',
  type: 'select',
  defaultValue: 'direct',
  options: [
    {
      value: 'direct',
      label: 'PFE ecográfico directo (gramos)',
      description: 'Introduce directamente el peso fetal estimado reportado en la ecografía.',
    },
    {
      value: 'biometry',
      label: 'Calcular PFE por biometría (Hadlock 4 parámetros)',
      description: 'Estima el peso fetal a partir de DBP, CC, CA y LF en milímetros.',
    },
    {
      value: 'none',
      label: 'Evaluar solo ganancia materna',
      description: 'Omitir cálculo de peso fetal si aún no hay ecografía biométrica disponible.',
    },
  ],
};

const efwDirectField: NumberFieldDef = {
  id: 'efwGrams',
  label: 'Peso fetal estimado (PFE)',
  type: 'number',
  required: false,
  canonicalUnit: 'g',
  units: [
    { id: 'g', label: 'gramos (g)', toCanonical: (v) => v, min: 30, max: 6500, step: 10 },
    { id: 'kg', label: 'kg', toCanonical: (v) => v * 1000, min: 0.03, max: 6.5, step: 0.05 },
  ],
  defaultUnitId: 'g',
  defaultValue: '1210',
  min: 30,
  max: 6500,
  placeholder: '1210',
  visibleWhen: (inputs) => (inputs.fetalInputMode as string) === 'direct',
  helpText: 'Aplicable a partir de las 10 semanas de gestación (estándar Hadlock 1991 hasta 40 sem).',
};

const bpdField: NumberFieldDef = {
  id: 'bpdMm',
  label: 'Diámetro biparietal (DBP)',
  type: 'number',
  canonicalUnit: 'mm',
  units: [
    { id: 'mm', label: 'mm', toCanonical: (v) => v, min: 15, max: 120, step: 1 },
    { id: 'cm', label: 'cm', toCanonical: (v) => v * 10, min: 1.5, max: 12.0, step: 0.1 },
  ],
  defaultUnitId: 'mm',
  defaultValue: '71',
  min: 15,
  max: 120,
  placeholder: '71',
  visibleWhen: (inputs) => (inputs.fetalInputMode as string) === 'biometry',
};

const hcField: NumberFieldDef = {
  id: 'hcMm',
  label: 'Circunferencia cefálica (CC / HC)',
  type: 'number',
  canonicalUnit: 'mm',
  units: [
    { id: 'mm', label: 'mm', toCanonical: (v) => v, min: 60, max: 420, step: 1 },
    { id: 'cm', label: 'cm', toCanonical: (v) => v * 10, min: 6.0, max: 42.0, step: 0.1 },
  ],
  defaultUnitId: 'mm',
  defaultValue: '263',
  min: 60,
  max: 420,
  placeholder: '263',
  visibleWhen: (inputs) => (inputs.fetalInputMode as string) === 'biometry',
};

const acField: NumberFieldDef = {
  id: 'acMm',
  label: 'Circunferencia abdominal (CA / AC)',
  type: 'number',
  canonicalUnit: 'mm',
  units: [
    { id: 'mm', label: 'mm', toCanonical: (v) => v, min: 50, max: 450, step: 1 },
    { id: 'cm', label: 'cm', toCanonical: (v) => v * 10, min: 5.0, max: 45.0, step: 0.1 },
  ],
  defaultUnitId: 'mm',
  defaultValue: '240',
  min: 50,
  max: 450,
  placeholder: '240',
  visibleWhen: (inputs) => (inputs.fetalInputMode as string) === 'biometry',
};

const flField: NumberFieldDef = {
  id: 'flMm',
  label: 'Longitud femoral (LF / FL)',
  type: 'number',
  canonicalUnit: 'mm',
  units: [
    { id: 'mm', label: 'mm', toCanonical: (v) => v, min: 10, max: 95, step: 1 },
    { id: 'cm', label: 'cm', toCanonical: (v) => v * 10, min: 1.0, max: 9.5, step: 0.1 },
  ],
  defaultUnitId: 'mm',
  defaultValue: '53',
  min: 10,
  max: 95,
  placeholder: '53',
  visibleWhen: (inputs) => (inputs.fetalInputMode as string) === 'biometry',
};

const SEVERITY_RANK: Record<SeverityLevel, number> = {
  normal: 0,
  info: 1,
  low: 2,
  moderate: 3,
  high: 4,
  critical: 5,
};

export const obstetricWeightGainCalculator: CalculatorDefinition = {
  id: 'obstetric-weight-gain',
  name: 'Ganancia de Peso Gestacional y Peso Fetal (Curvas IOM / Hadlock)',
  shortName: 'Peso Materno y Fetal',
  primarySpecialty: 'gineco-obstetricia',
  secondarySpecialties: ['medicina-interna', 'endocrinologia'],
  subcategory: 'formulas',
  keywords: [
    'ganancia de peso',
    'embarazo',
    'peso fetal',
    'peso materno',
    'grafica',
    'curva',
    'iom',
    'hadlock',
    'rciu',
    'peg',
    'macrosomia',
    'imc pregestacional',
    'obstetricia',
    'control prenatal',
  ],
  description:
    'Evalúa la ganancia ponderal materna según el IMC pregestacional (guía IOM/NAM 2009), calcula o clasifica el peso fetal estimado (Hadlock 1985/1991) e integra gráficas interactivas de curvas maternas y fetales por semana gestacional.',
  clinicalIndication:
    'Control prenatal longitudinal, detección de ganancia ponderal insuficiente o excesiva, tamizaje de restricción de crecimiento intrauterino (RCIU/PEG) o macrosomía fetal (GEG) y valoración de la proporción materno-fetal.',
  validatedPopulation:
    'Gestantes con embarazo único (4–42 semanas, IOM 2009) o gemelar (normopeso, sobrepeso y obesidad). Estándar de peso fetal Hadlock validado de 10 a 40 semanas.',
  contraindications: [
    'Un aumento brusco de peso materno (> 1 kg/semana en 3.er trimestre) acompañado de edema generalizado o cefalea requiere descartar preeclampsia/retención hídrica antes de interpretarlo como ganancia nutricional.',
    'La fórmula biométrica de Hadlock pierde precisión en oligohidramnios severo, presentación profundamente encajada, embarazo múltiple avanzado o macrosomía extrema (margen de error ecográfico habitual ±10–15 %).',
  ],
  limitations: [
    'Para embarazo gemelar con bajo peso pregestacional (IMC < 18.5 kg/m²), el IOM 2009 no estableció un rango oficial por insuficiencia de datos; la gráfica muestra una referencia orientativa y debe individualizarse.',
    'En obesidad grado II–III (IMC ≥ 35 kg/m²) existe debate clínico sobre si metas ligeramente inferiores a 5–9 kg son seguras en ausencia de RCIU; la guía oficial IOM 2009 mantiene 5.0–9.0 kg para todo IMC ≥ 30 kg/m².',
    'La relación ganancia materna menos peso fetal es orientativa: no mide directamente el peso placentario, líquido amniótico ni edema intersticial.',
  ],
  version: 'IOM/NAM 2009 · Hadlock 1985/1991',
  references: [
    {
      citation:
        'Institute of Medicine (US) and National Research Council (US) Committee to Reexamine IOM Pregnancy Weight Guidelines; Rasmussen KM, Yaktine AL, eds. Weight Gain During Pregnancy: Reexamining the Guidelines. Washington (DC): National Academies Press; 2009.',
      year: 2009,
    },
    {
      citation:
        'Hadlock FP, Harrist RB, Martinez-Poyer J. In utero analysis of fetal growth: a sonographic weight standard. Radiology. 1991;181(1):129-133.',
      year: 1991,
    },
    {
      citation:
        'Hadlock FP, Harrist RB, Sharman RS, Deter RL, Park SK. Estimation of fetal weight with the use of head, body, and femur measurements—a prospective study. Am J Obstet Gynecol. 1985;151(3):333-337.',
      year: 1985,
    },
  ],
  fields: [
    weeksField,
    pluralityField,
    preWeightField,
    heightField,
    currentWeightField,
    fetalModeField,
    efwDirectField,
    bpdField,
    hcField,
    acField,
    flField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(obstetricWeightGainCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const weeks = getCanonicalNumberValue(
      weeksField,
      inputs.gestationalWeeks as NumberInputValue,
    ).canonicalValue!;
    const plurality: PregnancyPlurality =
      inputs.plurality === 'twin' ? 'twin' : 'singleton';
    const preWeightKg = getCanonicalNumberValue(
      preWeightField,
      inputs.preWeight as NumberInputValue,
    ).canonicalValue!;
    const heightM = getCanonicalNumberValue(
      heightField,
      inputs.height as NumberInputValue,
    ).canonicalValue!;
    const currentWeightKg = getCanonicalNumberValue(
      currentWeightField,
      inputs.currentWeight as NumberInputValue,
    ).canonicalValue!;

    const maternalEval = evaluateMaternalWeightGain({
      preWeightKg,
      currentWeightKg,
      heightM,
      weeks,
      plurality,
    });

    const fetalMode = (inputs.fetalInputMode as string) || 'direct';
    let efwGrams: number | null = null;
    let efwSourceNote = '';

    if (fetalMode === 'direct') {
      const directVal = getCanonicalNumberValue(
        efwDirectField,
        inputs.efwGrams as NumberInputValue,
      ).canonicalValue;
      if (directVal !== null && directVal > 0) {
        efwGrams = roundClinical(directVal, 0);
        efwSourceNote = 'Peso fetal ingresado directamente';
      }
    } else if (fetalMode === 'biometry') {
      const bpdMm = getCanonicalNumberValue(bpdField, inputs.bpdMm as NumberInputValue)
        .canonicalValue!;
      const hcMm = getCanonicalNumberValue(hcField, inputs.hcMm as NumberInputValue)
        .canonicalValue!;
      const acMm = getCanonicalNumberValue(acField, inputs.acMm as NumberInputValue)
        .canonicalValue!;
      const flMm = getCanonicalNumberValue(flField, inputs.flMm as NumberInputValue)
        .canonicalValue!;
      efwGrams = computeHadlockEfw1985({ bpdMm, hcMm, acMm, flMm });
      efwSourceNote = `Calculado por Hadlock 4 parámetros (DBP ${roundClinical(bpdMm, 0)}, CC ${roundClinical(hcMm, 0)}, CA ${roundClinical(acMm, 0)}, LF ${roundClinical(flMm, 0)} mm)`;
    }

    const fetalEval =
      efwGrams !== null && weeks >= 10
        ? evaluateFetalWeight(efwGrams, weeks)
        : null;

    const balance =
      efwGrams !== null
        ? evaluateMaternalFetalBalance(maternalEval.actualGainKg, efwGrams, plurality)
        : null;

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'IMC pregestacional y categoría IOM',
        formattedValue: `${formatClinicalNumber(maternalEval.prePregnancyBmi, 1)} kg/m²`,
        unit: `(${maternalEval.bmiMeta.label})`,
        note:
          plurality === 'twin' && !maternalEval.expected.hasOfficialTwinTarget
            ? 'El IOM 2009 no publicó rango específico para gemelar con IMC < 18.5 kg/m²; vigilar soporte nutricional estrecho.'
            : `Meta total al término (${plurality === 'twin' ? 'gemelar' : 'único'}): ${maternalEval.expected.totalMinKg}–${maternalEval.expected.totalMaxKg} kg.`,
      },
      {
        label: `Rango IOM esperado a las ${formatClinicalNumber(weeks, 1)} sem`,
        formattedValue: `${formatClinicalNumber(maternalEval.expected.minKg, 1)} – ${formatClinicalNumber(maternalEval.expected.maxKg, 1)} kg`,
        unit: `(media ${formatClinicalNumber(maternalEval.expected.midKg, 1)} kg)`,
        note: `Ritmo recomendado 2.º–3.er trimestre: ${formatClinicalNumber(maternalEval.expected.weeklyMinKg, 2)}–${formatClinicalNumber(maternalEval.expected.weeklyMaxKg, 2)} kg/semana${
          maternalEval.observedWeeklyRate2nd3rdTri !== null
            ? ` · Ritmo observado aprox.: ${formatClinicalNumber(maternalEval.observedWeeklyRate2nd3rdTri, 2)} kg/sem`
            : ''
        }.`,
      },
    ];

    if (fetalEval) {
      secondaryResults.push({
        label: `Peso fetal estimado y percentil (${formatClinicalNumber(weeks, 1)} sem)`,
        formattedValue: `${fetalEval.efwGrams} g`,
        unit: `(${fetalEval.percentileFormatted} · Z ${fetalEval.zScore > 0 ? '+' : ''}${formatClinicalNumber(fetalEval.zScore, 2)})`,
        note: `${fetalEval.classification}. Rango P10–P90 Hadlock: ${fetalEval.bands.p10}–${fetalEval.bands.p90} g (P50: ${fetalEval.bands.p50} g). ${efwSourceNote}.`,
      });
    } else if (efwGrams !== null && weeks < 10) {
      secondaryResults.push({
        label: 'Peso fetal estimado',
        formattedValue: `${efwGrams} g`,
        unit: '(sin percentil < 10 sem)',
        note: 'La referencia sonográfica de Hadlock (1991) inicia a las 10 semanas de gestación.',
      });
    }

    if (balance) {
      secondaryResults.push({
        label: 'Ganancia materna neta descontando peso fetal',
        formattedValue: `${balance.netMaternalExclFetusKg >= 0 ? '+' : ''}${formatClinicalNumber(balance.netMaternalExclFetusKg, 1)} kg`,
        unit:
          balance.fetalShareOfGainPct !== null
            ? `(feto = ${formatClinicalNumber(balance.fetalShareOfGainPct, 0)} % del incremento)`
            : '',
        note: balance.interpretation,
      });
    }

    let overallSeverity: SeverityLevel = maternalEval.severity;
    if (fetalEval && SEVERITY_RANK[fetalEval.severity] > SEVERITY_RANK[overallSeverity]) {
      overallSeverity = fetalEval.severity;
    }

    const signedGain = `${maternalEval.actualGainKg >= 0 ? '+' : ''}${formatClinicalNumber(maternalEval.actualGainKg, 1)}`;

    const guidance: string[] = [
      'Consulta la gráfica interactiva inferior para visualizar simultáneamente la curva de ganancia materna IOM (2009), los percentiles de peso fetal Hadlock (1991) y la tabla semanal.',
    ];
    if (maternalEval.status === 'below') {
      guidance.push(
        'Ganancia materna por debajo de lo esperado: revisar ingesta calórico-proteica, hiperémesis o malabsorción y asegurar seguimiento biométrico fetal para descartar RCIU.',
      );
    } else if (maternalEval.status === 'above') {
      guidance.push(
        'Ganancia materna por encima de la meta IOM: evaluar presencia de edema/preeclampsia si el aumento fue rápido, tamizar diabetes gestacional y orientar plan alimentario equilibrado (evitar restricción calórica agresiva para perder peso durante el embarazo).',
      );
    }
    if (fetalEval && fetalEval.percentile < 10) {
      guidance.push(
        'Peso fetal < P10: realizar evaluación Doppler (arteria umbilical, arteria cerebral media y arterias uterinas) y vigilancia seriada cada 1–2 semanas según protocolo de RCIU/PEG.',
      );
    } else if (fetalEval && (fetalEval.percentile > 90 || fetalEval.efwGrams >= 4000)) {
      guidance.push(
        'Peso fetal > P90 o ≥ 4,000 g: verificar tamizaje glucémico materno (PTOG), evaluar líquido amniótico y planificar asesoría sobre vía del parto según estimación clínica y ecográfica.',
      );
    }

    const riskHeadline = fetalEval
      ? `${maternalEval.statusLabel} · Feto ${fetalEval.percentileFormatted} (${fetalEval.efwGrams} g)`
      : maternalEval.statusLabel;

    const clinicalInterpretation = [
      `Con IMC pregestacional de ${formatClinicalNumber(maternalEval.prePregnancyBmi, 1)} kg/m² (${maternalEval.bmiMeta.label}), la ganancia acumulada de ${signedGain} kg a las ${formatClinicalNumber(weeks, 1)} semanas se compara con la banda esperada de ${formatClinicalNumber(maternalEval.expected.minKg, 1)}–${formatClinicalNumber(maternalEval.expected.maxKg, 1)} kg.`,
      fetalEval ? fetalEval.explanation : null,
    ]
      .filter(Boolean)
      .join(' ');

    return {
      primaryResult: {
        label: 'Ganancia ponderal materna acumulada',
        value: maternalEval.actualGainKg,
        formattedValue: signedGain,
        unit: `kg (${formatClinicalNumber(weeks, 1)} sem · meta ${formatClinicalNumber(maternalEval.expected.minKg, 1)}–${formatClinicalNumber(maternalEval.expected.maxKg, 1)} kg)`,
      },
      secondaryResults,
      severity: overallSeverity,
      riskClassification: riskHeadline,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer:
        'La evaluación ponderal orienta la nutrición prenatal y el seguimiento ecográfico; toda desviación debe correlacionarse con biometría seriada, presión arterial, glucemia y contexto clínico.',
      formulaUsed:
        fetalMode === 'biometry'
          ? 'IOM/NAM 2009 por IMC pregestacional + Hadlock 4-parámetros (1985) y estándar Hadlock (1991)'
          : 'IOM/NAM 2009 por IMC pregestacional + estándar sonográfico fetal Hadlock (1991)',
      inputsSummary: `EG: ${weeks} sem · ${plurality === 'twin' ? 'Gemelar' : 'Único'} · Peso pre: ${roundClinical(preWeightKg, 1)} kg · Actual: ${roundClinical(currentWeightKg, 1)} kg (${signedGain} kg)${efwGrams ? ` · PFE: ${efwGrams} g` : ''}`,
    };
  },
};
