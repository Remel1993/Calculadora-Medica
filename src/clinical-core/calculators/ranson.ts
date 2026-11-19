import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const etiologyField: SelectFieldDef = {
  id: 'etiology',
  label: 'Etiología de la pancreatitis aguda',
  type: 'select',
  defaultValue: 'non_biliary',
  options: [
    { value: 'non_biliary', label: 'No biliar / Alcohólica / Idiopática (11 criterios)' },
    { value: 'biliary', label: 'Biliar / Litiásica (10 criterios; omite PaO₂)' },
  ],
};

const timingField: SelectFieldDef = {
  id: 'timing',
  label: 'Momento de evaluación',
  type: 'select',
  defaultValue: 'full48h',
  options: [
    { value: 'admission0h', label: 'Solo criterios al ingreso (0 horas)' },
    { value: 'full48h', label: 'Evaluación completa (0 horas + 48 horas)' },
  ],
};

// Non-biliary 0h (5)
const nb0hFields: BooleanFieldDef[] = [
  { id: 'nb_age55', label: '0 h: Edad > 55 años (+1)', type: 'boolean', defaultValue: false, visibleWhen: (i) => i.etiology === 'non_biliary' },
  { id: 'nb_wbc16', label: '0 h: Leucocitos > 16,000 /µL (+1)', type: 'boolean', defaultValue: false, visibleWhen: (i) => i.etiology === 'non_biliary' },
  { id: 'nb_glu200', label: '0 h: Glucosa > 200 mg/dL (> 11.1 mmol/L) (+1)', type: 'boolean', defaultValue: false, visibleWhen: (i) => i.etiology === 'non_biliary' },
  { id: 'nb_ldh350', label: '0 h: LDH sérica > 350 UI/L (+1)', type: 'boolean', defaultValue: false, visibleWhen: (i) => i.etiology === 'non_biliary' },
  { id: 'nb_ast250', label: '0 h: AST (TGO) > 250 UI/L (+1)', type: 'boolean', defaultValue: false, visibleWhen: (i) => i.etiology === 'non_biliary' },
];

// Non-biliary 48h (6)
const nb48hFields: BooleanFieldDef[] = [
  { id: 'nb_hctDrop10', label: '48 h: Descenso del hematocrito > 10 puntos porcentuales (+1)', type: 'boolean', defaultValue: false, visibleWhen: (i) => i.etiology === 'non_biliary' && i.timing === 'full48h' },
  { id: 'nb_bunRise5', label: '48 h: Incremento de BUN > 5 mg/dL (> 1.8 mmol/L) pese a fluidos (+1)', type: 'boolean', defaultValue: false, visibleWhen: (i) => i.etiology === 'non_biliary' && i.timing === 'full48h' },
  { id: 'nb_ca8', label: '48 h: Calcio sérico < 8.0 mg/dL (< 2.0 mmol/L) (+1)', type: 'boolean', defaultValue: false, visibleWhen: (i) => i.etiology === 'non_biliary' && i.timing === 'full48h' },
  { id: 'nb_pao2_60', label: '48 h: PaO₂ arterial < 60 mmHg (+1)', type: 'boolean', defaultValue: false, visibleWhen: (i) => i.etiology === 'non_biliary' && i.timing === 'full48h' },
  { id: 'nb_baseDef4', label: '48 h: Déficit de base > 4 mEq/L (+1)', type: 'boolean', defaultValue: false, visibleWhen: (i) => i.etiology === 'non_biliary' && i.timing === 'full48h' },
  { id: 'nb_fluid6', label: '48 h: Secuestro estimado de líquidos > 6 litros (+1)', type: 'boolean', defaultValue: false, visibleWhen: (i) => i.etiology === 'non_biliary' && i.timing === 'full48h' },
];

// Biliary 0h (5)
const b0hFields: BooleanFieldDef[] = [
  { id: 'b_age70', label: '0 h: Edad > 70 años (+1)', type: 'boolean', defaultValue: false, visibleWhen: (i) => i.etiology === 'biliary' },
  { id: 'b_wbc18', label: '0 h: Leucocitos > 18,000 /µL (+1)', type: 'boolean', defaultValue: false, visibleWhen: (i) => i.etiology === 'biliary' },
  { id: 'b_glu220', label: '0 h: Glucosa > 220 mg/dL (> 12.2 mmol/L) (+1)', type: 'boolean', defaultValue: false, visibleWhen: (i) => i.etiology === 'biliary' },
  { id: 'b_ldh400', label: '0 h: LDH sérica > 400 UI/L (+1)', type: 'boolean', defaultValue: false, visibleWhen: (i) => i.etiology === 'biliary' },
  { id: 'b_ast250', label: '0 h: AST (TGO) > 250 UI/L (+1)', type: 'boolean', defaultValue: false, visibleWhen: (i) => i.etiology === 'biliary' },
];

// Biliary 48h (5 — PaO2 omitted in Ranson 1979 gallstone version)
const b48hFields: BooleanFieldDef[] = [
  { id: 'b_hctDrop10', label: '48 h: Descenso del hematocrito > 10 puntos porcentuales (+1)', type: 'boolean', defaultValue: false, visibleWhen: (i) => i.etiology === 'biliary' && i.timing === 'full48h' },
  { id: 'b_bunRise2', label: '48 h: Incremento de BUN ≥ 2 mg/dL (≥ 0.7 mmol/L) pese a fluidos (+1)', type: 'boolean', defaultValue: false, visibleWhen: (i) => i.etiology === 'biliary' && i.timing === 'full48h' },
  { id: 'b_ca8', label: '48 h: Calcio sérico < 8.0 mg/dL (< 2.0 mmol/L) (+1)', type: 'boolean', defaultValue: false, visibleWhen: (i) => i.etiology === 'biliary' && i.timing === 'full48h' },
  { id: 'b_baseDef5', label: '48 h: Déficit de base > 5 mEq/L (+1)', type: 'boolean', defaultValue: false, visibleWhen: (i) => i.etiology === 'biliary' && i.timing === 'full48h' },
  { id: 'b_fluid4', label: '48 h: Secuestro estimado de líquidos > 4 litros (+1)', type: 'boolean', defaultValue: false, visibleWhen: (i) => i.etiology === 'biliary' && i.timing === 'full48h' },
];

export const ransonCalculator: CalculatorDefinition = {
  id: 'ranson',
  name: 'Criterios de Ranson (Pancreatitis Aguda — 0 h y 48 h)',
  shortName: 'Ranson',
  primarySpecialty: 'gastroenterologia',
  secondarySpecialties: ['cirugia-general', 'urgencias'],
  subcategory: 'gravedad',
  keywords: ['ranson', 'pancreatitis', 'biliar', 'mortalidad', '48 horas'],
  description:
    'Estratificación pronóstica clásica de pancreatitis aguda diferenciada por etiología no biliar (11 criterios) y biliar (10 criterios) al ingreso y a las 48 horas.',
  clinicalIndication:
    'Evaluación pronóstica de gravedad y mortalidad estimada en pancreatitis aguda tras completar las primeras 48 horas.',
  validatedPopulation: 'Adultos con diagnóstico confirmado de pancreatitis aguda.',
  requiredLabsNote: 'Requiere biometría hemática, glucosa, LDH, AST, BUN, calcio, gasometría arterial y balance hídrico a 0 h y 48 h.',
  contraindications: [
    'Un puntaje parcial a las 0 h < 3 NO descarta pancreatitis grave (faltan los criterios evolutivos de las 48 h). Para triaje inmediato al ingreso usar BISAP y la Clasificación de Atlanta Revisada (fallo orgánico persistente).',
  ],
  limitations: [
    'Requiere esperar 48 horas para completar el cálculo definitivo, lo que retrasa decisiones tempranas de reanimación o ingreso a UCI.',
  ],
  version: 'Ranson JHC (1974 No biliar / 1979 Biliar)',
  references: [
    {
      citation: 'Ranson JH, Rifkind KM, Roses DF, Fink SD, Eng K, Spencer FC. Prognostic signs and the role of operative management in acute pancreatitis. Surg Gynecol Obstet. 1974;139(1):69-81.',
      year: 1974,
    },
    {
      citation: 'Ranson JH. The timing of biliary surgery in acute pancreatitis. Ann Surg. 1979;189(5):654-663.',
      year: 1979,
    },
  ],
  fields: [etiologyField, timingField, ...nb0hFields, ...nb48hFields, ...b0hFields, ...b48hFields],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(ransonCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const isBiliary = inputs.etiology === 'biliary';
    const isFull = inputs.timing === 'full48h';

    const f0 = isBiliary ? b0hFields : nb0hFields;
    const f48 = isBiliary ? b48hFields : nb48hFields;

    const score0h = f0.filter((f) => inputs[f.id] === true).length;
    const score48h = isFull ? f48.filter((f) => inputs[f.id] === true).length : 0;
    const total = score0h + score48h;
    const maxPts = isFull ? (isBiliary ? 10 : 11) : 5;

    let mortality = '< 1 %';
    let severity: SeverityLevel = 'low';
    if (total <= 2) {
      mortality = '≈ 0 – 2 %';
      severity = isFull ? 'low' : 'moderate';
    } else if (total <= 4) {
      mortality = '≈ 15 %';
      severity = 'high';
    } else if (total <= 6) {
      mortality = '≈ 40 %';
      severity = 'critical';
    } else {
      mortality = '≈ 100 %';
      severity = 'critical';
    }

    return {
      primaryResult: {
        label: `Criterios de Ranson (${isBiliary ? 'Biliar' : 'No biliar'}${isFull ? '' : ' — Parcial 0 h'})`,
        value: total,
        formattedValue: String(total),
        unit: `puntos (de ${maxPts})`,
      },
      secondaryResults: [
        { label: 'Mortalidad aproximada (si puntaje completo)', formattedValue: mortality, unit: '' },
        ...(isFull ? [{ label: 'Desglose (0 h / 48 h)', formattedValue: `${score0h} + ${score48h}`, unit: 'pts' }] : []),
      ],
      severity,
      riskClassification:
        total >= 3
          ? `Pancreatitis potencialmente grave (Ranson ≥ 3: ${total} pts)`
          : isFull
            ? `Ranson < 3 (${total} pts) — Bajo riesgo`
            : `Parcial 0 h: ${total} / 5 pts (Pendiente evaluación a 48 h)`,
      clinicalInterpretation:
        !isFull && total < 3
          ? 'Puntuación parcial al ingreso: aún no es concluyente porque faltan los criterios de 48 horas. Complementar con BISAP y monitorización hemodinámica/renal.'
          : total >= 3
            ? `Puntuación ≥ 3 asociada a pancreatitis aguda grave con mortalidad estimada de ${mortality}. Valorar ingreso en cuidados intermedios/UCI.`
            : 'Riesgo bajo de complicaciones sistémicas graves o mortalidad en la cohorte clásica de Ranson.',
      formulaUsed: isBiliary ? 'Versión biliar (10 criterios: 5 ingreso + 5 a 48 h)' : 'Versión no biliar (11 criterios: 5 ingreso + 6 a 48 h)',
      inputsSummary: `Ranson ${isBiliary ? 'Biliar' : 'No biliar'} (${isFull ? '48 h' : '0 h'}): ${total} / ${maxPts}`,
    };
  },
};
