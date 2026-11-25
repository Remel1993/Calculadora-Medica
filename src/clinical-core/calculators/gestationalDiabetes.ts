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
import { GLUCOSE_UNITS_MG_DL } from '../units/converters.ts';

const protocolField: SelectFieldDef = {
  id: 'protocol',
  label: 'Protocolo diagnóstico aplicado',
  type: 'select',
  defaultValue: 'iadpsg_75g',
  options: [
    {
      value: 'iadpsg_75g',
      label: 'Estrategia en 1 paso: PTOG 75 g (ADA / IADPSG / OMS)',
      description: 'Diagnóstico con ≥ 1 valor igual o superior a: Basal ≥ 92, 1 h ≥ 180 o 2 h ≥ 153 mg/dL.',
    },
    {
      value: 'carpenter_coustan_100g',
      label: 'Estrategia en 2 pasos: PTOG 100 g (Carpenter-Coustan / ACOG)',
      description: 'Tras tamiz 50 g alterado: diagnóstico con ≥ 2 valores ≥ a 95 / 180 / 155 / 140 mg/dL.',
    },
    {
      value: 'screening_50g',
      label: 'Solo tamizaje inicial 50 g sin ayuno (O’Sullivan 1 h)',
      description: 'Prueba de cribado (1.er paso): determina si requiere curva diagnóstica de 100 g.',
    },
  ],
};

const fastingField: NumberFieldDef = {
  id: 'fastingGlucose',
  label: 'Glucemia en ayuno (Basal / 0 h)',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: GLUCOSE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  defaultValue: '88',
  min: 30,
  max: 600,
  placeholder: '88',
  visibleWhen: (inputs) => (inputs.protocol as string) !== 'screening_50g',
  helpText: 'IADPSG/OMS: ≥ 92 mg/dL · Carpenter-Coustan: ≥ 95 mg/dL · ≥ 126 mg/dL sugiere diabetes manifiesta preexistente.',
};

const g1hField: NumberFieldDef = {
  id: 'glucose1h',
  label: 'Glucemia a la 1 hora poscarga',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: GLUCOSE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  defaultValue: '165',
  min: 30,
  max: 700,
  placeholder: '165',
  visibleWhen: (inputs) => (inputs.protocol as string) !== 'screening_50g',
  helpText: 'Corte diagnóstico 1 h: ≥ 180 mg/dL (10.0 mmol/L) en ambos protocolos (75 g y 100 g).',
};

const g2hField: NumberFieldDef = {
  id: 'glucose2h',
  label: 'Glucemia a las 2 horas poscarga',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: GLUCOSE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  defaultValue: '138',
  min: 30,
  max: 700,
  placeholder: '138',
  visibleWhen: (inputs) => (inputs.protocol as string) !== 'screening_50g',
  helpText: 'IADPSG (75 g): ≥ 153 mg/dL (8.5 mmol/L) · Carpenter-Coustan (100 g): ≥ 155 mg/dL (8.6 mmol/L).',
};

const g3hField: NumberFieldDef = {
  id: 'glucose3h',
  label: 'Glucemia a las 3 horas poscarga (PTOG 100 g)',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: GLUCOSE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  defaultValue: '125',
  min: 30,
  max: 700,
  placeholder: '125',
  visibleWhen: (inputs) => (inputs.protocol as string) === 'carpenter_coustan_100g',
  helpText: 'Corte Carpenter-Coustan 3 h: ≥ 140 mg/dL (7.8 mmol/L).',
};

const screen50gField: NumberFieldDef = {
  id: 'screen50gGlucose',
  label: 'Glucemia a 1 h tras carga de 50 g (sin ayuno)',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: GLUCOSE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  defaultValue: '128',
  min: 30,
  max: 600,
  placeholder: '128',
  visibleWhen: (inputs) => (inputs.protocol as string) === 'screening_50g',
  helpText: 'Umbral estándar: ≥ 140 mg/dL (mayor especificidad) o ≥ 130 mg/dL (mayor sensibilidad). Valores ≥ 200 mg/dL son altamente sugestivos de DMG.',
};

const screenCutoffField: SelectFieldDef = {
  id: 'screenCutoff',
  label: 'Umbral institucional del tamizaje 50 g',
  type: 'select',
  defaultValue: '140',
  visibleWhen: (inputs) => (inputs.protocol as string) === 'screening_50g',
  options: [
    { value: '140', label: '≥ 140 mg/dL (estándar ACOG clásico)' },
    { value: '130', label: '≥ 130 mg/dL (alta sensibilidad)' },
  ],
};

export const gestationalDiabetesCalculator: CalculatorDefinition = {
  id: 'gestational-diabetes',
  name: 'Diabetes Gestacional — Criterios IADPSG/ADA (75 g) y Carpenter-Coustan (100 g)',
  shortName: 'Diabetes Gestacional',
  primarySpecialty: 'gineco-obstetricia',
  secondarySpecialties: ['endocrinologia', 'medicina-interna'],
  subcategory: 'diagnostico',
  keywords: [
    'diabetes gestacional',
    'ptog',
    'curva de tolerancia',
    'glucosa',
    'iadpsg',
    'ada',
    'carpenter coustan',
    'osullivan',
    '75 g',
    '100 g',
    'embarazo',
  ],
  description:
    'Interpreta la prueba de tolerancia oral a la glucosa en el embarazo según la estrategia de 1 paso (PTOG 75 g IADPSG/ADA/OMS), de 2 pasos (tamiz 50 g + PTOG 100 g Carpenter-Coustan/ACOG) y detecta diabetes manifiesta preexistente.',
  clinicalIndication:
    'Tamizaje y diagnóstico de diabetes mellitus gestacional (habitualmente entre las 24 y 28 semanas de gestación, o antes en pacientes de alto riesgo).',
  validatedPopulation: 'Gestantes sin diagnóstico previo de diabetes mellitus (validado para tamizaje universal a las 24–28 semanas).',
  contraindications: [
    'No realizar sobrecarga oral de glucosa si ya existe diagnóstico confirmado de diabetes pregestacional o glucemia basal repetida ≥ 126 mg/dL o casual ≥ 200 mg/dL con síntomas.',
    'En pacientes con cirugía bariátrica (especialmente bypass gástrico en Y de Roux), la PTOG estándar puede provocar síndrome de dumping e hipoglucemia reactiva; preferir automonitoreo glucémico.',
  ],
  limitations: [
    'Existe controversia vigente entre guías: ADA/IADPSG/OMS respaldan ampliamente 1 paso (PTOG 75 g, mayor sensibilidad diagnóstica), mientras ACOG suele preferir 2 pasos (50 g + 100 g Carpenter-Coustan). Aplicar el protocolo institucional vigente.',
    'La prueba diagnóstica requiere ayuno de 8–14 h (excepto tamizaje de 50 g), dieta sin restricción de carbohidratos los 3 días previos y reposo durante el estudio.',
    'Un valor aislado alterado en Carpenter-Coustan (100 g) no diagnostica DMG por criterios clásicos, pero identifica riesgo metabólico que amerita seguimiento nutricional.',
  ],
  requiredLabsNote: 'Glucemia venosa en laboratorio (en mg/dL o mmol/L) tras carga oral estandarizada.',
  version: 'ADA 2025 · IADPSG · ACOG / Carpenter-Coustan',
  references: [
    {
      citation:
        'American Diabetes Association. 2. Diagnosis and Classification of Diabetes: Standards of Care in Diabetes—2025. Diabetes Care. 2025;48(Suppl 1):S27-S49.',
      year: 2025,
    },
    {
      citation:
        'International Association of Diabetes and Pregnancy Study Groups Consensus Panel. International association of diabetes and pregnancy study groups recommendations on the diagnosis and classification of hyperglycemia in pregnancy. Diabetes Care. 2010;33(3):676-682.',
      year: 2010,
    },
    {
      citation:
        'ACOG Practice Bulletin No. 190: Gestational Diabetes Mellitus. Obstet Gynecol. 2018;131(2):e49-e64.',
      year: 2018,
    },
  ],
  fields: [
    protocolField,
    fastingField,
    g1hField,
    g2hField,
    g3hField,
    screen50gField,
    screenCutoffField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(gestationalDiabetesCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const protocol = inputs.protocol as string;

    if (protocol === 'screening_50g') {
      const val = getCanonicalNumberValue(screen50gField, inputs.screen50gGlucose as NumberInputValue).canonicalValue!;
      const cutoff = Number(inputs.screenCutoff || '140');
      const positive = val >= cutoff;
      const veryHigh = val >= 200;

      const severity: SeverityLevel = veryHigh ? 'high' : positive ? 'moderate' : 'normal';
      const badge = veryHigh ? 'Tamiz ≥ 200' : positive ? 'Tamiz Positivo' : 'Tamiz Normal';

      return {
        primaryResult: {
          label: 'Glucemia 1 h poscarga 50 g',
          value: roundClinical(val, 0),
          formattedValue: badge,
          unit: `${roundClinical(val, 0)} mg/dL (corte ≥ ${cutoff})`,
        },
        secondaryResults: [
          {
            label: 'Resultado en mmol/L',
            formattedValue: formatClinicalNumber(val / 18.0182, 1),
            unit: 'mmol/L',
          },
          {
            label: 'Siguiente paso diagnóstico',
            formattedValue: positive ? 'Realizar PTOG 100 g' : 'Sin criterios para curva',
            unit: '',
          },
        ],
        severity,
        riskClassification: veryHigh
          ? `Tamizaje O’Sullivan muy elevado (${roundClinical(val, 0)} mg/dL ≥ 200 mg/dL)`
          : positive
            ? `Tamizaje de 50 g positivo (≥ ${cutoff} mg/dL)`
            : `Tamizaje de 50 g negativo (< ${cutoff} mg/dL)`,
        clinicalInterpretation: veryHigh
          ? 'Un valor ≥ 200 mg/dL en el tamiz de 50 g presenta altísimo valor predictivo para diabetes gestacional; varios protocolos confirman DMG directamente o solicitan glucemia en ayuno antes de sobrecargar con 100 g.'
          : positive
            ? `Supera el umbral de ${cutoff} mg/dL. Debe realizarse prueba diagnóstica confirmatoria con PTOG de 100 g en ayuno (Carpenter-Coustan).`
            : `Valor inferior al corte de ${cutoff} mg/dL. No sugiere diabetes gestacional en este momento.`,
        guidance: positive
          ? [
              'Solicitar PTOG diagnóstica de 100 g (basal, 1 h, 2 h y 3 h) manteniendo dieta habitual los días previos.',
            ]
          : ['Continuar control prenatal habitual; repetir si aparecen factores clínicos (macrosomía o polihidramnios).'],
        formulaUsed: 'Cribado O’Sullivan 50 g (1 hora poscarga sin ayuno)',
        inputsSummary: `Tamiz 50 g: ${roundClinical(val, 0)} mg/dL · Corte: ${cutoff} mg/dL`,
      };
    }

    const fasting = getCanonicalNumberValue(fastingField, inputs.fastingGlucose as NumberInputValue).canonicalValue!;
    const g1h = getCanonicalNumberValue(g1hField, inputs.glucose1h as NumberInputValue).canonicalValue!;
    const g2h = getCanonicalNumberValue(g2hField, inputs.glucose2h as NumberInputValue).canonicalValue!;

    if (protocol === 'iadpsg_75g') {
      const overtDiabetes = fasting >= 126 || g2h >= 200;
      const altered: string[] = [];
      if (fasting >= 92) altered.push(`Ayuno ${roundClinical(fasting, 0)} ≥ 92`);
      if (g1h >= 180) altered.push(`1 h ${roundClinical(g1h, 0)} ≥ 180`);
      if (g2h >= 153) altered.push(`2 h ${roundClinical(g2h, 0)} ≥ 153`);

      const isDmg = altered.length >= 1;
      const severity: SeverityLevel = overtDiabetes ? 'high' : isDmg ? 'moderate' : 'normal';
      const badge = overtDiabetes ? 'DM Manifiesta' : isDmg ? 'DMG (+)' : 'Normal';

      const secondaryResults: SecondaryResultItem[] = [
        {
          label: 'Valores alterados (criterio ≥ 1 de 3)',
          formattedValue: `${altered.length} / 3`,
          unit: '',
          note: altered.length > 0 ? altered.join(' · ') + ' mg/dL' : 'Ayuno < 92, 1 h < 180 y 2 h < 153 mg/dL.',
        },
        {
          label: 'Desglose en mmol/L',
          formattedValue: `${formatClinicalNumber(fasting / 18.0182, 1)} / ${formatClinicalNumber(g1h / 18.0182, 1)} / ${formatClinicalNumber(g2h / 18.0182, 1)}`,
          unit: 'mmol/L (0/1/2 h)',
        },
      ];

      return {
        primaryResult: {
          label: 'Resultado PTOG 75 g (IADPSG / ADA)',
          value: altered.length,
          formattedValue: badge,
          unit: `${altered.length}/3 valores alterados`,
        },
        secondaryResults,
        severity,
        riskClassification: overtDiabetes
          ? 'Sospecha de diabetes manifiesta en el embarazo (ayuno ≥ 126 o 2 h ≥ 200 mg/dL)'
          : isDmg
            ? `Diabetes Mellitus Gestacional confirmada (${altered.length} valor/es alterado/s)`
            : 'PTOG 75 g normal (sin criterios IADPSG/ADA)',
        clinicalInterpretation: overtDiabetes
          ? 'Cifras en rango de diabetes pregestacional/manifiesta (OMS/IADPSG). Requiere manejo intensivo temprano, evaluación de HbA1c, retinopatía/función renal y tamizaje de anomalías fetales.'
          : isDmg
            ? `Con ≥ 1 punto alterado en la PTOG 75 g (${altered.join(', ')} mg/dL), se establece el diagnóstico de Diabetes Mellitus Gestacional según ADA/IADPSG/OMS.`
            : 'Los 3 puntos de la curva de 75 g se encuentran por debajo de los umbrales diagnósticos (92 / 180 / 153 mg/dL).',
        guidance: isDmg
          ? [
              'Iniciar terapia médico-nutricional individualizada, ejercicio moderado seguro y automonitoreo de glucemia capilar (metas habituales ADA: ayuno < 95, 1 h posprandial < 140 o 2 h < 120 mg/dL).',
              'Si tras 1–2 semanas de medidas no farmacológicas persisten glucemias fuera de meta, valorar inicio de insulina (primera línea en embarazo).',
              'Reclasificar estado glucémico materno con PTOG 75 g a las 4–12 semanas posparto.',
            ]
          : ['Continuar control prenatal estándar; reevaluar solo ante aparición de macrosomía o polihidramnios.'],
        formulaUsed: 'Criterios IADPSG / ADA / OMS (PTOG 75 g: ≥ 92 / ≥ 180 / ≥ 153 mg/dL)',
        inputsSummary: `PTOG 75 g · Basal ${roundClinical(fasting, 0)} · 1 h ${roundClinical(g1h, 0)} · 2 h ${roundClinical(g2h, 0)} mg/dL`,
      };
    }

    // Carpenter-Coustan 100 g
    const g3h = getCanonicalNumberValue(g3hField, inputs.glucose3h as NumberInputValue).canonicalValue!;
    const overtDiabetes = fasting >= 126;
    const altered: string[] = [];
    if (fasting >= 95) altered.push(`Ayuno ${roundClinical(fasting, 0)} ≥ 95`);
    if (g1h >= 180) altered.push(`1 h ${roundClinical(g1h, 0)} ≥ 180`);
    if (g2h >= 155) altered.push(`2 h ${roundClinical(g2h, 0)} ≥ 155`);
    if (g3h >= 140) altered.push(`3 h ${roundClinical(g3h, 0)} ≥ 140`);

    const isDmg = altered.length >= 2;
    const singleAbnormal = altered.length === 1;
    const severity: SeverityLevel = overtDiabetes
      ? 'high'
      : isDmg
        ? 'moderate'
        : singleAbnormal
          ? 'low'
          : 'normal';
    const badge = overtDiabetes
      ? 'DM Manifiesta'
      : isDmg
        ? 'DMG (+)'
        : singleAbnormal
          ? '1 Valor Alterado'
          : 'Normal';

    return {
      primaryResult: {
        label: 'Resultado PTOG 100 g (Carpenter-Coustan)',
        value: altered.length,
        formattedValue: badge,
        unit: `${altered.length}/4 valores alterados`,
      },
      secondaryResults: [
        {
          label: 'Valores alterados (criterio ≥ 2 de 4)',
          formattedValue: `${altered.length} / 4`,
          unit: '',
          note:
            altered.length > 0
              ? altered.join(' · ') + ' mg/dL'
              : 'Ayuno < 95, 1 h < 180, 2 h < 155 y 3 h < 140 mg/dL.',
        },
        {
          label: 'Valores ingresados (0/1/2/3 h)',
          formattedValue: `${roundClinical(fasting, 0)} / ${roundClinical(g1h, 0)} / ${roundClinical(g2h, 0)} / ${roundClinical(g3h, 0)}`,
          unit: 'mg/dL',
        },
      ],
      severity,
      riskClassification: overtDiabetes
        ? 'Glucemia en ayuno ≥ 126 mg/dL — Descartar diabetes manifiesta'
        : isDmg
          ? `Diabetes Mellitus Gestacional confirmada (${altered.length}/4 valores alterados)`
          : singleAbnormal
            ? 'Intolerancia gestacional con 1 valor alterado (no cumple ≥ 2 criterios Carpenter-Coustan)'
            : 'PTOG 100 g normal (0/4 valores alterados)',
      clinicalInterpretation: overtDiabetes
        ? 'Glucemia basal ≥ 126 mg/dL sugiere diabetes manifiesta pregestacional (confirmar sin sobrecarga adicional si no se ha hecho). Requiere manejo especializado temprano, HbA1c, evaluación renal/oftalmológica y tamizaje fetal.'
        : isDmg
          ? `Cumple ≥ 2 valores iguales o superiores a los puntos de corte de Carpenter-Coustan (${altered.join(', ')} mg/dL), confirmando Diabetes Mellitus Gestacional.`
          : singleAbnormal
            ? `Solo 1 valor alterado (${altered[0]} mg/dL). Aunque no cumple diagnóstico clásico de ≥ 2 puntos, ACOG señala mayor riesgo de macrosomía e intolerancia metabólica y sugiere vigilancia nutricional.`
            : 'Los 4 valores de la curva de 100 g están dentro de rango normal.',
      guidance: overtDiabetes
        ? [
            'Priorizar evaluación médica/endocrinológica inmediata para manejo intensivo de hiperglucemia manifiesta en el embarazo (plan nutricional, automonitoreo estricto y valoración temprana de insulinoterapia).',
            'Solicitar HbA1c basal, evaluación de fondo de ojo/función renal y seguimiento ecográfico fetal estrecho.',
          ]
        : isDmg
          ? [
              'Iniciar plan nutricional, actividad física supervisada y automonitoreo glucémico diario (metas ACOG: ayuno < 95, 1 h < 140, 2 h < 120 mg/dL).',
              'Valorar insulina como fármaco de elección si no alcanza metas con medidas higiénico-dietéticas.',
            ]
          : singleAbnormal
            ? ['Orientación nutricional preventiva y considerar repetir valoración si crecimiento fetal acelerado o polihidramnios.']
            : ['Continuar control prenatal habitual.'],
      formulaUsed: 'Criterios Carpenter-Coustan / ACOG PB 190 (PTOG 100 g: ≥ 95 / ≥ 180 / ≥ 155 / ≥ 140 mg/dL, ≥ 2 alterados)',
      inputsSummary: `PTOG 100 g · 0 h ${roundClinical(fasting, 0)} · 1 h ${roundClinical(g1h, 0)} · 2 h ${roundClinical(g2h, 0)} · 3 h ${roundClinical(g3h, 0)} mg/dL`,
    };
  },
};
