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

interface SteroidAgent {
  id: string;
  label: string;
  equivMg: number;
  glucoPotency: number;
  mineraloPotency: string;
  halfLife: string;
}

const STEROID_AGENTS: Record<string, SteroidAgent> = {
  hydrocortisone: {
    id: 'hydrocortisone',
    label: 'Hidrocortisona (cortisol)',
    equivMg: 20,
    glucoPotency: 1,
    mineraloPotency: '1.0 (alta — retención Na⁺/agua)',
    halfLife: 'Corta (8–12 h)',
  },
  prednisone: {
    id: 'prednisone',
    label: 'Prednisona VO',
    equivMg: 5,
    glucoPotency: 4,
    mineraloPotency: '0.8 (leve)',
    halfLife: 'Intermedia (12–36 h)',
  },
  prednisolone: {
    id: 'prednisolone',
    label: 'Prednisolona',
    equivMg: 5,
    glucoPotency: 4,
    mineraloPotency: '0.8 (leve)',
    halfLife: 'Intermedia (12–36 h)',
  },
  methylprednisolone: {
    id: 'methylprednisolone',
    label: 'Metilprednisolona',
    equivMg: 4,
    glucoPotency: 5,
    mineraloPotency: '0.5 (mínima)',
    halfLife: 'Intermedia (12–36 h)',
  },
  triamcinolone: {
    id: 'triamcinolone',
    label: 'Triamcinolona',
    equivMg: 4,
    glucoPotency: 5,
    mineraloPotency: '0 (nula)',
    halfLife: 'Intermedia (12–36 h)',
  },
  dexamethasone: {
    id: 'dexamethasone',
    label: 'Dexametasona',
    equivMg: 0.75,
    glucoPotency: 25,
    mineraloPotency: '0 (nula)',
    halfLife: 'Prolongada (36–72 h)',
  },
  betamethasone: {
    id: 'betamethasone',
    label: 'Betametasona',
    equivMg: 0.6,
    glucoPotency: 25,
    mineraloPotency: '0 (nula)',
    halfLife: 'Prolongada (36–72 h)',
  },
};

interface OpioidAgent {
  id: string;
  label: string;
  mmeFactor: number;
  maxDailyNote?: string;
}

const OPIOID_AGENTS: Record<string, OpioidAgent> = {
  morphine_po: { id: 'morphine_po', label: 'Morfina oral (VO)', mmeFactor: 1.0 },
  morphine_iv: { id: 'morphine_iv', label: 'Morfina IV / SC (equivalencia 3:1 frente a VO)', mmeFactor: 3.0 },
  tramadol_po: { id: 'tramadol_po', label: 'Tramadol oral (VO)', mmeFactor: 0.2, maxDailyNote: 'Tope máximo diario: 400 mg/día (factor CDC 2022: 0.2)' },
  codeine_po: { id: 'codeine_po', label: 'Codeína oral (VO)', mmeFactor: 0.15 },
  oxycodone_po: { id: 'oxycodone_po', label: 'Oxicodona oral (VO)', mmeFactor: 1.5 },
  hydrocodone_po: { id: 'hydrocodone_po', label: 'Hidrocodona oral (VO)', mmeFactor: 1.0 },
  hydromorphone_po: { id: 'hydromorphone_po', label: 'Hidromorfona oral (VO)', mmeFactor: 5.0 },
};

const converterModeField: SelectFieldDef = {
  id: 'converterMode',
  label: 'Conversor farmacológico diario',
  type: 'select',
  defaultValue: 'corticoides',
  options: [
    { value: 'corticoides', label: 'Corticosteroides sistémicos (equipotencia antiinflamatoria y mineralocorticoide)' },
    { value: 'opioides', label: 'Opioides (carga diaria MME CDC y rotación segura con tolerancia cruzada)' },
  ],
};

const sourceSteroidField: SelectFieldDef = {
  id: 'sourceSteroid',
  label: 'Corticoide actual (origen)',
  type: 'select',
  defaultValue: 'prednisone',
  visibleWhen: (inputs) => inputs.converterMode === 'corticoides',
  options: Object.values(STEROID_AGENTS).map((s) => ({
    value: s.id,
    label: `${s.label} (equiv. ${s.equivMg} mg)`,
  })),
};

const targetSteroidField: SelectFieldDef = {
  id: 'targetSteroid',
  label: 'Corticoide destino',
  type: 'select',
  defaultValue: 'dexamethasone',
  visibleWhen: (inputs) => inputs.converterMode === 'corticoides',
  options: Object.values(STEROID_AGENTS).map((s) => ({
    value: s.id,
    label: `${s.label} (equiv. ${s.equivMg} mg)`,
  })),
};

const steroidDoseField: NumberFieldDef = {
  id: 'steroidDoseMg',
  label: 'Dosis del corticoide actual (mg)',
  type: 'number',
  canonicalUnit: 'mg',
  units: [{ id: 'mg', label: 'mg', toCanonical: (v) => v, min: 0.1, max: 2000, step: 0.5 }],
  defaultUnitId: 'mg',
  defaultValue: '40',
  min: 0.1,
  max: 2000,
  placeholder: '40',
  visibleWhen: (inputs) => inputs.converterMode === 'corticoides',
};

const sourceOpioidField: SelectFieldDef = {
  id: 'sourceOpioid',
  label: 'Opioide actual (origen)',
  type: 'select',
  defaultValue: 'tramadol_po',
  visibleWhen: (inputs) => inputs.converterMode === 'opioides',
  options: Object.values(OPIOID_AGENTS).map((o) => ({
    value: o.id,
    label: `${o.label} · factor MME ${o.mmeFactor}`,
  })),
};

const opioidDailyDoseField: NumberFieldDef = {
  id: 'opioidDailyDoseMg',
  label: 'Dosis total diaria en 24 horas del opioide actual (mg/día)',
  type: 'number',
  canonicalUnit: 'mg/día',
  units: [{ id: 'mg_d', label: 'mg/día', toCanonical: (v) => v, min: 0.5, max: 2000, step: 1 }],
  defaultUnitId: 'mg_d',
  defaultValue: '200',
  min: 0.5,
  max: 2000,
  placeholder: '200',
  visibleWhen: (inputs) => inputs.converterMode === 'opioides',
};

const targetOpioidField: SelectFieldDef = {
  id: 'targetOpioid',
  label: 'Opioide destino para rotación',
  type: 'select',
  defaultValue: 'morphine_po',
  visibleWhen: (inputs) => inputs.converterMode === 'opioides',
  options: Object.values(OPIOID_AGENTS).map((o) => ({
    value: o.id,
    label: `${o.label} · factor MME ${o.mmeFactor}`,
  })),
};

const crossToleranceReductionField: SelectFieldDef = {
  id: 'crossTolerancePct',
  label: 'Reducción de seguridad por tolerancia cruzada incompleta',
  type: 'select',
  defaultValue: '30',
  visibleWhen: (inputs) => inputs.converterMode === 'opioides',
  options: [
    { value: '25', label: '25 % de reducción (mínima estándar)' },
    { value: '30', label: '30 % de reducción (recomendada en práctica clínica)' },
    { value: '50', label: '50 % de reducción (ancianos, fragilidad, ERC/hepatopatía o dosis altas)' },
    { value: '0', label: '0 % (solo cálculo teórico equianalgésico — NO rotar sin ajuste)' },
  ],
};

export const dailyDrugConvertersCalculator: CalculatorDefinition = {
  id: 'daily-drug-converters',
  name: 'Conversores Farmacológicos Diarios (Corticoides Sistémicos y Opioides MME)',
  shortName: 'Conversor Corticoides y Opioides',
  primarySpecialty: 'medicina-interna',
  secondarySpecialties: ['urgencias', 'oncologia', 'geriatria', 'cirugia-general'],
  subcategory: 'dosificacion',
  keywords: [
    'corticoides',
    'corticosteroides',
    'prednisona',
    'dexametasona',
    'hidrocortisona',
    'metilprednisolona',
    'opioides',
    'mme',
    'morfina',
    'tramadol',
    'oxicodona',
    'equianalgesia',
    'rotacion opioides',
  ],
  description:
    'Calcula la equipotencia antiinflamatoria entre corticosteroides sistémicos (con potencia mineralocorticoide y vida media) y realiza la conversión a Miligramos Equivalentes de Morfina (MME) y rotación segura de opioides.',
  clinicalIndication:
    'Cambio de vía o de principio activo de corticoides (p. ej. paso de IV a VO) y cálculo de carga analgésica MME / rotación de opioides en dolor agudo, crónico o cuidados paliativos.',
  validatedPopulation: 'Pacientes adultos (en pediatría y hepatopatía/ERC ajustar dosis individualmente).',
  contraindications: [
    'NO usar estos factores simples para convertir hacia o desde METADONA (farmacocinética no lineal) ni para iniciar parches de FENTANILO en pacientes sin tolerancia previa a opioides.',
    'En insuficiencia suprarrenal primaria, NO sustituir hidrocortisona por dexametasona sin cobertura mineralocorticoide (fludrocortisona).',
  ],
  limitations: [
    'La equivalencia de corticoides refleja potencia glucocorticoide aproximada y no sustituye las diferencias en penetración pulmonar/SNC ni en duración biológica (8–12 h vs 36–72 h).',
    'Al rotar opioides existe tolerancia cruzada incompleta: reducir entre 25 % y 50 % la dosis equianalgésica teórica y titular con rescates.',
  ],
  version: 'Tablas estándar de glucocorticoides · CDC Opioid MME Guidelines',
  references: [
    {
      citation:
        'Dowell D, Ragan KR, Jones CM, Baldwin GT, Chou R. CDC Clinical Practice Guideline for Prescribing Opioids for Pain — United States, 2022. MMWR Recomm Rep. 2022;71(3):1-95.',
      year: 2022,
    },
    {
      citation:
        'Liu D, Ahmet A, Ward L, et al. A practical guide to the monitoring and management of the complications of systemic corticosteroid therapy. Allergy Asthma Clin Immunol. 2013;9(1):30.',
      year: 2013,
    },
  ],
  fields: [
    converterModeField,
    sourceSteroidField,
    targetSteroidField,
    steroidDoseField,
    sourceOpioidField,
    opioidDailyDoseField,
    targetOpioidField,
    crossToleranceReductionField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(dailyDrugConvertersCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const mode = String(inputs.converterMode);

    if (mode === 'corticoides') {
      const src = STEROID_AGENTS[String(inputs.sourceSteroid)] ?? STEROID_AGENTS.prednisone;
      const tgt = STEROID_AGENTS[String(inputs.targetSteroid)] ?? STEROID_AGENTS.dexamethasone;
      const doseMg = getCanonicalNumberValue(
        steroidDoseField,
        inputs.steroidDoseMg as NumberInputValue,
      ).canonicalValue!;

      const predEquiv = roundClinical((doseMg / src.equivMg) * 5, 2);
      const targetMg = roundClinical((doseMg / src.equivMg) * tgt.equivMg, 2);
      const hydroEquiv = roundClinical((doseMg / src.equivMg) * 20, 1);

      const severity: SeverityLevel =
        predEquiv >= 40 ? 'high' : predEquiv >= 20 ? 'moderate' : 'info';

      const secondaryResults: SecondaryResultItem[] = [
        {
          label: 'Equivalente en Prednisona',
          formattedValue: `${formatClinicalNumber(predEquiv, 1)} mg`,
          unit: '',
        },
        {
          label: 'Equivalente en Hidrocortisona',
          formattedValue: `${formatClinicalNumber(hydroEquiv, 1)} mg`,
          unit: '',
        },
        {
          label: `Perfil de ${tgt.label}`,
          formattedValue: `Potencia gluco ${tgt.glucoPotency}× · ${tgt.halfLife}`,
          unit: `Mineralo: ${tgt.mineraloPotency}`,
        },
      ];

      const guidance: string[] = [
        `${formatClinicalNumber(doseMg, 1)} mg de ${src.label} equivalen en potencia antiinflamatoria a ${formatClinicalNumber(targetMg, 2)} mg de ${tgt.label}.`,
        `Considerar la vida media biológica: ${src.label} (${src.halfLife}) → ${tgt.label} (${tgt.halfLife}) para ajustar el intervalo entre tomas.`,
      ];
      if (predEquiv >= 20) {
        guidance.push(
          'Equivalente ≥ 20 mg/día de prednisona: si la duración supera 2–3 semanas existe riesgo de supresión del eje HPA (no suspender bruscamente) y valorar profilaxis gástrica/PCP según contexto.',
        );
      }
      if (tgt.id === 'dexamethasone' || tgt.id === 'betamethasone') {
        guidance.push(
          'Dexametasona/Betametasona tienen actividad mineralocorticoide NULA (útiles en edema cerebral o si se desea evitar retención hidrosalina, pero insuficientes por sí solas en insuficiencia suprarrenal primaria).',
        );
      }

      return {
        primaryResult: {
          label: `Dosis equivalente de ${tgt.label}`,
          value: targetMg,
          formattedValue: `${formatClinicalNumber(targetMg, 2)} mg`,
          unit: '',
        },
        secondaryResults,
        severity,
        riskClassification: `Equipotencia glucocorticoide (${formatClinicalNumber(predEquiv, 1)} mg eq. prednisona)`,
        clinicalInterpretation: `${formatClinicalNumber(doseMg, 1)} mg de ${src.label} ≈ ${formatClinicalNumber(targetMg, 2)} mg de ${tgt.label}.`,
        guidance,
        formulaUsed: 'Dosis destino = Dosis origen × (Equiv. destino / Equiv. origen) [Ref.: Hidrocortisona 20 = Prednisona 5 = Metilpred 4 = Dexa 0.75]',
        inputsSummary: `${doseMg} mg ${src.label} → ${tgt.label}`,
      };
    }

    // opioides
    const srcOp = OPIOID_AGENTS[String(inputs.sourceOpioid)] ?? OPIOID_AGENTS.tramadol_po;
    const tgtOp = OPIOID_AGENTS[String(inputs.targetOpioid)] ?? OPIOID_AGENTS.morphine_po;
    const dailyDose = getCanonicalNumberValue(
      opioidDailyDoseField,
      inputs.opioidDailyDoseMg as NumberInputValue,
    ).canonicalValue!;
    const reductionPct = Number(inputs.crossTolerancePct);

    const totalMme = roundClinical(dailyDose * srcOp.mmeFactor, 1);
    const theoreticalTargetMg = roundClinical(totalMme / tgtOp.mmeFactor, 1);
    const safeTargetMg = roundClinical(theoreticalTargetMg * (1 - reductionPct / 100), 1);

    let severity: SeverityLevel = 'info';
    let riskClass = `Carga analgésica: ${formatClinicalNumber(totalMme, 1)} MME/día (< 50 MME/día)`;
    if (totalMme >= 90) {
      severity = 'critical';
      riskClass = `RIESGO MUY ALTO CDC (≥ 90 MME/día): ${formatClinicalNumber(totalMme, 1)} MME/día`;
    } else if (totalMme >= 50) {
      severity = 'high';
      riskClass = `RIESGO AUMENTADO CDC (≥ 50 MME/día): ${formatClinicalNumber(totalMme, 1)} MME/día`;
    }

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Carga diaria equivalente en Morfina VO (MME)',
        formattedValue: `${formatClinicalNumber(totalMme, 1)} MME/día`,
        unit: '',
      },
      {
        label: `Dosis teórica 100 % de ${tgtOp.label}`,
        formattedValue: `${formatClinicalNumber(theoreticalTargetMg, 1)} mg/día`,
        unit: '(sin reducción)',
      },
      {
        label: `Dosis inicial segura (-${reductionPct}% tolerancia cruzada)`,
        formattedValue: `${formatClinicalNumber(safeTargetMg, 1)} mg/día`,
        unit: `dividida en tomas c/4–12 h según liberación`,
      },
    ];

    const guidance: string[] = [
      `Rotación sugerida: iniciar ${formatClinicalNumber(safeTargetMg, 1)} mg/día de ${tgtOp.label} (reducción del ${reductionPct}% respecto a ${formatClinicalNumber(theoreticalTargetMg, 1)} mg/día teóricos) + dosis de rescate (10–15% de la dosis diaria cada 2–4 h PRN).`,
      'Parche de fentanilo transdérmico (referencia CDC orientativa): 25 mcg/h equivale aproximadamente a 60–90 MME/día (uso exclusivo en pacientes ya tolerantes a opioides; NO usar en dolor agudo ni en pacientes vírgenes a opioides).',
    ];
    if (srcOp.id === 'tramadol_po' && dailyDose > 400) {
      guidance.unshift(
        `ALERTA TRAMADOL (${dailyDose} mg/día > 400 mg/día): supera el tope máximo diario recomendado (riesgo de convulsiones y síndrome serotoninérgico).`,
      );
    }
    if (totalMme >= 50) {
      guidance.push(
        'Por carga ≥ 50 MME/día (CDC 2022): vigilar sedación/depresión respiratoria, evitar benzodiacepinas concomitantes y valorar disponibilidad de naloxona.',
      );
    }

    return {
      primaryResult: {
        label: `Dosis inicial recomendada de ${tgtOp.label}`,
        value: safeTargetMg,
        formattedValue: `${formatClinicalNumber(safeTargetMg, 1)} mg/día`,
        unit: `(${formatClinicalNumber(totalMme, 1)} MME/día)`,
      },
      secondaryResults,
      severity,
      riskClassification: riskClass,
      clinicalInterpretation: `${formatClinicalNumber(dailyDose, 1)} mg/día de ${srcOp.label} equivalen a ${formatClinicalNumber(totalMme, 1)} MME/día. Tras reducción del ${reductionPct}% por tolerancia cruzada incompleta: iniciar ${formatClinicalNumber(safeTargetMg, 1)} mg/día de ${tgtOp.label}.`,
      guidance,
      guidanceDisclaimer:
        'En insuficiencia renal (ERC) evitar morfina/codeína/tramadol por acumulación de metabolitos activos neurotóxicos; monitorizar estrechamente durante las primeras 24–72 h tras rotar.',
      formulaUsed: 'MME = Dosis × Factor MME CDC · Dosis segura = (MME / Factor destino) × (1 - % reducción)',
      inputsSummary: `${dailyDose} mg/d ${srcOp.label} → ${tgtOp.label} (-${reductionPct}%)`,
    };
  },
};
