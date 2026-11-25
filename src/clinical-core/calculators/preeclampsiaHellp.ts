import {
  formatClinicalNumber,
  getCanonicalNumberValue,
  roundClinical,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SecondaryResultItem,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';
import { BP_UNITS_MMHG, CREATININE_UNITS_MG_DL } from '../units/converters.ts';

const contextField: SelectFieldDef = {
  id: 'gestationalContext',
  label: 'Momento gestacional y antecedente hipertensivo',
  type: 'select',
  defaultValue: 'ge20_new',
  options: [
    {
      value: 'ge20_new',
      label: '≥ 20 semanas o puerperio (normotensa previa)',
      description: 'Hipertensión de novo a partir de la semana 20 o hasta 6 semanas posparto.',
    },
    {
      value: 'chronic_htn',
      label: 'HTA crónica previa (< 20 semanas o conocida)',
      description: 'Evalúa posible preeclampsia sobreañadida ante deterioro clínico o analítico.',
    },
  ],
};

const sbpField: NumberFieldDef = {
  id: 'sbp',
  label: 'Presión arterial sistólica (PAS máxima confirmada)',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  defaultValue: '148',
  min: 70,
  max: 260,
  placeholder: '148',
  helpText: 'Confirmar en 2 tomas separadas ≥ 4 h (o ≥ 15 min si PAS ≥ 160 mmHg para inicio rápido de antihipertensivo).',
};

const dbpField: NumberFieldDef = {
  id: 'dbp',
  label: 'Presión arterial diastólica (PAD máxima confirmada)',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  defaultValue: '94',
  min: 40,
  max: 160,
  placeholder: '94',
};

const proteinuriaField: SelectFieldDef = {
  id: 'proteinuria',
  label: 'Proteinuria diagnóstica (ACOG PB 222)',
  type: 'select',
  defaultValue: 'positive',
  options: [
    {
      value: 'negative',
      label: 'Negativa (< 300 mg/24 h · IPC < 0.3 mg/mg · Tira 0/trazas)',
      description: 'Ausencia de proteinuria significativa.',
    },
    {
      value: 'positive',
      label: 'Positiva (≥ 300 mg/24 h · IPC ≥ 0.3 mg/mg · Tira ≥ 2+)',
      description: 'Cumple criterio de proteinuria significativa en embarazo.',
    },
  ],
};

const plateletsField: NumberFieldDef = {
  id: 'platelets',
  label: 'Recuento plaquetario',
  type: 'number',
  canonicalUnit: '×10³/µL',
  units: [
    { id: 'k_ul', label: '×10³/µL (miles/mm³)', toCanonical: (v) => v, min: 5, max: 700, step: 1 },
    { id: 'cells_ul', label: 'células/µL', toCanonical: (v) => v / 1000, min: 5000, max: 700000, step: 1000 },
  ],
  defaultUnitId: 'k_ul',
  defaultValue: '190',
  min: 5,
  max: 700,
  placeholder: '190',
  helpText: 'Criterio de severidad ACOG / HELLP Tennessee: < 100 ×10³/µL (< 100,000/µL).',
};

const astAltField: NumberFieldDef = {
  id: 'astAltMax',
  label: 'Transaminasa mayor (AST o ALT)',
  type: 'number',
  canonicalUnit: 'U/L',
  units: [{ id: 'ul', label: 'U/L', toCanonical: (v) => v, min: 5, max: 4000, step: 1 }],
  defaultUnitId: 'ul',
  defaultValue: '28',
  min: 5,
  max: 4000,
  placeholder: '28',
  helpText: 'ACOG severidad: ≥ 2× límite superior normal (habitualmente ≥ 70 U/L); criterio Tennessee HELLP ≥ 70 U/L.',
};

const ldhField: NumberFieldDef = {
  id: 'ldh',
  label: 'Lactato deshidrogenasa (LDH)',
  type: 'number',
  required: false,
  canonicalUnit: 'U/L',
  units: [{ id: 'ul', label: 'U/L', toCanonical: (v) => v, min: 50, max: 6000, step: 10 }],
  defaultUnitId: 'ul',
  defaultValue: '240',
  min: 50,
  max: 6000,
  placeholder: '240',
  helpText: 'Opcional pero clave para HELLP: LDH ≥ 600 U/L (criterio Tennessee de hemólisis).',
};

const creatinineField: NumberFieldDef = {
  id: 'creatinine',
  label: 'Creatinina sérica',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: CREATININE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  defaultValue: '0.7',
  min: 0.2,
  max: 15,
  placeholder: '0.7',
  helpText: 'Severidad ACOG: > 1.1 mg/dL (> 97 µmol/L) o duplicación de la basal en ausencia de nefropatía previa.',
};

const crDoubledField: BooleanFieldDef = {
  id: 'creatinineDoubled',
  label: '¿Duplicación de creatinina sérica respecto a basal previa?',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
};

const hemolysisSmearField: BooleanFieldDef = {
  id: 'hemolysisEvidence',
  label: 'Evidencia adicional de hemólisis microangiopática (esquistocitos, bilirrubina ≥ 1.2 mg/dL o haptoglobina baja)',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
};

const neuroVisualField: BooleanFieldDef = {
  id: 'neuroVisualSymptoms',
  label: 'Cefalea intensa refractaria o alteraciones visuales (escotomas, fosfenos, visión borrosa)',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
};

const epigastricPainField: BooleanFieldDef = {
  id: 'epigastricPain',
  label: 'Epigastralgia intensa persistente o dolor en cuadrante superior derecho sin otra causa',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
};

const pulmonaryEdemaField: BooleanFieldDef = {
  id: 'pulmonaryEdema',
  label: 'Edema agudo de pulmón',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
};

const eclampsiaField: BooleanFieldDef = {
  id: 'eclampsiaSeizures',
  label: 'Convulsiones tónico-clónicas de novo o coma sin otra causa (Eclampsia)',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
};

export const preeclampsiaHellpCalculator: CalculatorDefinition = {
  id: 'preeclampsia-hellp',
  name: 'Preeclampsia, Criterios de Severidad y Síndrome HELLP (ACOG / Tennessee)',
  shortName: 'Preeclampsia / HELLP',
  primarySpecialty: 'gineco-obstetricia',
  secondarySpecialties: ['urgencias', 'medicina-interna'],
  subcategory: 'diagnostico',
  keywords: [
    'preeclampsia',
    'eclampsia',
    'hellp',
    'hipertension gestacional',
    'severidad',
    'proteinuria',
    'plaquetas',
    'transaminasas',
    'acog',
    'tennessee',
    'mississippi',
    'obstetricia',
  ],
  description:
    'Clasifica los trastornos hipertensivos del embarazo (HTA gestacional, preeclampsia sin/con criterios de severidad, eclampsia y síndrome HELLP completo o parcial) integrando criterios ACOG PB 222, Tennessee y Mississippi.',
  clinicalIndication:
    'Evaluación diagnóstica y estratificación de gravedad en gestantes ≥ 20 semanas o puérperas con hipertensión arterial o sospecha de preeclampsia/HELLP.',
  validatedPopulation: 'Gestantes ≥ 20 semanas y puérperas hasta las 6–12 semanas posparto (incluye hipertensión crónica con sospecha de preeclampsia sobreañadida).',
  contraindications: [
    'Antes de las 20 semanas, la hipertensión sugiere HTA crónica salvo enfermedad trofoblástica gestacional (mola) o embarazo múltiple/SAF grave.',
    'Descartar diagnósticos diferenciales imitadores de HELLP: hígado graso agudo del embarazo (AFLP), PTT/SHU, lupus activo o colestasis/hepatitis viral.',
  ],
  limitations: [
    'La preeclampsia puede presentarse SIN proteinuria si existe hipertensión ≥ 140/90 mmHg asociada a al menos un criterio de daño a órgano blanco (criterio ACOG 2020).',
    'Los criterios diagnósticos de la tabla de Tennessee para HELLP requieren simultáneamente hemólisis (LDH ≥ 600 U/L o esquistocitos/bilirrubina ≥ 1.2 mg/dL), AST/ALT ≥ 70 U/L y plaquetas < 100 ×10³/µL; si faltan 1–2 criterios se clasifica como HELLP parcial.',
    'Complementar siempre el manejo de crisis hipertensiva y profilaxis de convulsiones con la calculadora de Sulfato de Magnesio Obstétrico (Esquema Zuspan / Sibai).',
  ],
  requiredLabsNote: 'Biometría hemática (plaquetas), AST/ALT, creatinina sérica, LDH y proteinuria (IPC o 24 h).',
  version: 'ACOG PB 222 (2020) · Tennessee / Mississippi',
  references: [
    {
      citation:
        'ACOG Practice Bulletin No. 222: Gestational Hypertension and Preeclampsia. Obstet Gynecol. 2020;135(6):e237-e260.',
      year: 2020,
    },
    {
      citation:
        'Sibai BM. Diagnosis, controversies, and management of the syndrome of hemolysis, elevated liver enzymes, and low platelet count. Obstet Gynecol. 2004;103(5 Pt 1):981-991.',
      year: 2004,
    },
    {
      citation:
        'Martin JN Jr, Blake PG, Perry KG Jr, et al. The natural history of HELLP syndrome: patterns of disease progression and regression. Am J Obstet Gynecol. 1991;164(6 Pt 1):1500-1509.',
      year: 1991,
    },
  ],
  fields: [
    contextField,
    sbpField,
    dbpField,
    proteinuriaField,
    plateletsField,
    astAltField,
    ldhField,
    creatinineField,
    crDoubledField,
    hemolysisSmearField,
    neuroVisualField,
    epigastricPainField,
    pulmonaryEdemaField,
    eclampsiaField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(preeclampsiaHellpCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const context = inputs.gestationalContext as string;
    const sbp = getCanonicalNumberValue(sbpField, inputs.sbp as NumberInputValue).canonicalValue!;
    const dbp = getCanonicalNumberValue(dbpField, inputs.dbp as NumberInputValue).canonicalValue!;
    const hasProteinuria = inputs.proteinuria === 'positive';
    const platelets = getCanonicalNumberValue(plateletsField, inputs.platelets as NumberInputValue).canonicalValue!;
    const astAlt = getCanonicalNumberValue(astAltField, inputs.astAltMax as NumberInputValue).canonicalValue!;
    const ldh = getCanonicalNumberValue(ldhField, inputs.ldh as NumberInputValue).canonicalValue;
    const creatinine = getCanonicalNumberValue(creatinineField, inputs.creatinine as NumberInputValue).canonicalValue!;

    const crDoubled = inputs.creatinineDoubled === true;
    const hemolysisExtra = inputs.hemolysisEvidence === true;
    const neuroVisual = inputs.neuroVisualSymptoms === true;
    const epigastric = inputs.epigastricPain === true;
    const pulmonaryEdema = inputs.pulmonaryEdema === true;
    const eclampsia = inputs.eclampsiaSeizures === true;

    const htnPresent = sbp >= 140 || dbp >= 90;
    const severeBp = sbp >= 160 || dbp >= 110;
    const lowPltSeverity = platelets < 100;
    const liverSeverity = astAlt >= 70;
    const renalSeverity = creatinine > 1.1 || crDoubled;
    const hemolysisTennessee = (ldh !== null && ldh >= 600) || hemolysisExtra;

    const severityFeatures: string[] = [];
    if (severeBp) severityFeatures.push(`PA en rango severo (${roundClinical(sbp, 0)}/${roundClinical(dbp, 0)} mmHg)`);
    if (lowPltSeverity) severityFeatures.push(`Trombocitopenia < 100 ×10³/µL (${roundClinical(platelets, 0)})`);
    if (liverSeverity) severityFeatures.push(`Transaminasas ≥ 2× LSN (${roundClinical(astAlt, 0)} U/L)`);
    if (renalSeverity) severityFeatures.push(`Disfunción renal (Cr ${formatClinicalNumber(creatinine, 2)} mg/dL${crDoubled ? ' / 2× basal' : ''})`);
    if (pulmonaryEdema) severityFeatures.push('Edema agudo de pulmón');
    if (neuroVisual) severityFeatures.push('Síntomas neurológicos / visuales persistentes');
    if (epigastric) severityFeatures.push('Epigastralgia intensa o dolor en CSD');

    // HELLP evaluation (Tennessee & Mississippi)
    const hellpCount =
      (hemolysisTennessee ? 1 : 0) +
      (astAlt >= 70 ? 1 : 0) +
      (platelets < 100 ? 1 : 0);
    const completeHellp = hellpCount === 3;
    const partialHellp = !completeHellp && hellpCount >= 1 && (hemolysisTennessee || (astAlt >= 70 && platelets < 150));

    let mississippiClass = 'No aplica';
    if (completeHellp || (platelets < 150 && (hemolysisTennessee || astAlt >= 40))) {
      if (platelets <= 50) mississippiClass = 'Mississippi Clase 1 (plaquetas ≤ 50 ×10³/µL)';
      else if (platelets <= 100) mississippiClass = 'Mississippi Clase 2 (plaquetas 50–100 ×10³/µL)';
      else if (platelets <= 150) mississippiClass = 'Mississippi Clase 3 (plaquetas 100–150 ×10³/µL)';
    }

    let badge = 'Sin criterios';
    let severity: SeverityLevel = 'normal';
    let riskClassification = 'Normotensión / Sin criterios actuales de preeclampsia ni HELLP';
    let clinicalInterpretation =
      'Las cifras tensionales y los marcadores bioquímicos ingresados no cumplen criterios de hipertensión gestacional, preeclampsia ni síndrome HELLP.';
    const guidance: string[] = [];

    if (eclampsia) {
      badge = 'Eclampsia';
      severity = 'critical';
      riskClassification = completeHellp
        ? 'Eclampsia + Síndrome HELLP completo'
        : 'Eclampsia (emergencia obstétrica)';
      clinicalInterpretation =
        'Presencia de convulsiones de novo en paciente gestante/puérpera. Constituye una emergencia obstétrica vital que requiere estabilización materna inmediata, sulfato de magnesio IV y finalización oportuna del embarazo.';
      guidance.push(
        'Iniciar esquema de Sulfato de Magnesio IV inmediato (impregnación 4–6 g en 20 min + mantenimiento 1–2 g/h) y asegurar vía aérea/oxigenación.',
        'Si PA ≥ 160/110 mmHg, administrar antihipertensivo IV de acción rápida (labetalol o hidralazina IV, o nifedipino oral de liberación inmediata).',
        'Estabilizar a la madre antes de decidir la vía y momento de interrupción del embarazo.',
      );
    } else if (completeHellp) {
      badge = 'HELLP Completo';
      severity = 'critical';
      riskClassification = `Síndrome HELLP completo (3/3 Tennessee) · ${mississippiClass}`;
      clinicalInterpretation =
        'Cumple la tríada diagnóstica completa de Tennessee: hemólisis microangiopática, elevación de enzimas hepáticas (AST/ALT ≥ 70 U/L) y trombocitopenia (< 100 ×10³/µL). Puede ocurrir incluso sin hipertensión marcada o sin proteinuria.';
      guidance.push(
        'Hospitalización urgente en área crítica/obstétrica de alta complejidad, sulfato de magnesio IV para neuroprofilaxis y control estricto de presión arterial.',
        'Evaluar maduración pulmonar fetal si < 34 semanas según estabilidad materna; en ≥ 34 semanas o ante deterioro materno/fetal se indica interrupción tras estabilización.',
        'Reservar hemoderivados (plaquetas si < 50 ×10³/µL antes de cesárea o < 20 ×10³/µL si sangrado activo).',
      );
    } else if (htnPresent && severityFeatures.length > 0) {
      badge = context === 'chronic_htn' ? 'PE Sobreañadida Severa' : 'PE Severa';
      severity = 'critical';
      riskClassification =
        context === 'chronic_htn'
          ? 'Hipertensión crónica con preeclampsia sobreañadida con criterios de severidad'
          : 'Preeclampsia con criterios de severidad (ACOG PB 222)';
      clinicalInterpretation = `Hipertensión arterial (${roundClinical(sbp, 0)}/${roundClinical(dbp, 0)} mmHg) acompañada de ${severityFeatures.length} criterio(s) de severidad ACOG (${severityFeatures.join('; ')}).`;
      guidance.push(
        'Iniciar profilaxis de eclampsia con Sulfato de Magnesio IV (consultar calculadora MgSO₄ Obstétrico).',
        'Si PA ≥ 160/110 mmHg persistente ≥ 15 min, iniciar terapia antihipertensiva urgente (labetalol IV, hidralazina IV o nifedipino VO) buscando rango 140–150/90–100 mmHg sin descensos bruscos.',
        'Ingreso hospitalario, balance hídrico estricto (evitar sobrecarga IV), vigilancia fetal continua y valoración de interrupción (≥ 34 sem o antes si inestabilidad materna/fetal).',
      );
    } else if (partialHellp) {
      badge = 'HELLP Parcial';
      severity = 'high';
      riskClassification = `Alteración hepato-hematológica compatible con HELLP parcial / disfunción orgánica`;
      clinicalInterpretation =
        'Existen componentes aislados del espectro HELLP sin completar la tríada de Tennessee. Requiere ingreso/observación estrecha y repetición analítica en 6–12 h porque puede progresar a HELLP completo.';
      guidance.push(
        'Repetir biometría hemática, transaminasas, LDH y creatinina cada 6–12 h y descartar diagnósticos alternativos.',
        'Considerar sulfato de magnesio si hay síntomas de severidad o cifras tensionales elevadas.',
      );
    } else if (htnPresent && hasProteinuria) {
      badge = context === 'chronic_htn' ? 'PE Sobreañadida' : 'Preeclampsia';
      severity = 'high';
      riskClassification =
        context === 'chronic_htn'
          ? 'HTA crónica con preeclampsia sobreañadida (sin criterios actuales de severidad)'
          : 'Preeclampsia sin criterios de severidad (ACOG PB 222)';
      clinicalInterpretation =
        'Cumple diagnóstico de preeclampsia por hipertensión ≥ 140/90 mmHg asociada a proteinuria significativa, sin datos clínicos ni bioquímicos actuales de daño severo a órgano blanco.';
      guidance.push(
        'Vigilancia materno-fetal estrecha (tensión arterial frecuente, síntomas de alarma, perfil bioquímico semanal/bisemanal y bienestar fetal).',
        'Según ACOG PB 222, en preeclampsia sin criterios de severidad se recomienda finalización del embarazo a las 37 0/7 semanas.',
      );
    } else if (htnPresent) {
      badge = context === 'chronic_htn' ? 'HTA Crónica' : 'HTA Gestacional';
      severity = 'moderate';
      riskClassification =
        context === 'chronic_htn'
          ? 'Hipertensión arterial crónica sin criterios actuales de preeclampsia sobreañadida'
          : 'Hipertensión gestacional (sin proteinuria ni daño a órgano)';
      clinicalInterpretation =
        'Hipertensión arterial confirmada sin proteinuria ni criterios de severidad bioquímica/clínica al momento actual. Hasta 25–50 % de las hipertensas gestacionales pueden progresar a preeclampsia.';
      guidance.push(
        'Reevaluar semanalmente tensión arterial, proteinuria, plaquetas, enzimas hepáticas y creatinina para vigilar evolución a preeclampsia.',
        'Educar sobre signos de alarma (cefalea intensa, fosfenos, epigastralgia, edema súbito o disminución de movimientos fetales).',
      );
    } else if (hasProteinuria) {
      badge = 'Proteinuria Aislada';
      severity = 'low';
      riskClassification = 'Proteinuria significativa sin hipertensión ni criterios HELLP';
      clinicalInterpretation =
        'La proteinuria aislada sin hipertensión ni disfunción orgánica no define preeclampsia por sí sola, pero requiere seguimiento tensional cercano y descartar nefropatía primaria.';
      guidance.push('Vigilar cifras de presión arterial de forma seriada y valorar nefropatía subyacente.');
    }

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Presión arterial máxima ingresada',
        formattedValue: `${roundClinical(sbp, 0)}/${roundClinical(dbp, 0)} mmHg`,
        unit: severeBp ? '(Rango severo ≥ 160/110)' : htnPresent ? '(Hipertensión ≥ 140/90)' : '(Normotensa)',
      },
      {
        label: 'Criterios de severidad ACOG presentes',
        formattedValue: `${severityFeatures.length}`,
        unit: severityFeatures.length > 0 ? 'criterio(s)' : 'ninguno',
        note: severityFeatures.length > 0 ? severityFeatures.join(' · ') : 'Sin hipertensión severa ni daño a órgano blanco reportado.',
      },
      {
        label: 'Evaluación espectro HELLP (Tennessee)',
        formattedValue: `${hellpCount} / 3`,
        unit: completeHellp ? '(Completo)' : partialHellp ? '(Parcial)' : '(Negativo)',
        note: `Plaquetas ${roundClinical(platelets, 0)} ×10³/µL · AST/ALT ${roundClinical(astAlt, 0)} U/L · Hemólisis ${hemolysisTennessee ? 'Sí' : 'No'}${mississippiClass !== 'No aplica' ? ` · ${mississippiClass}` : ''}.`,
      },
    ];

    return {
      primaryResult: {
        label: 'Clasificación diagnóstica hipertensiva',
        value: eclampsia ? 5 : completeHellp ? 4 : severeBp || severityFeatures.length > 0 ? 3 : htnPresent && hasProteinuria ? 2 : htnPresent ? 1 : 0,
        formattedValue: badge,
        unit: severityFeatures.length > 0 ? `${severityFeatures.length} criterio(s) severidad` : '',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: guidance.length > 0 ? guidance : ['Continuar control prenatal habitual según edad gestacional.'],
      guidanceDisclaimer:
        'Los criterios de severidad pueden aparecer de forma abrupta; una preeclampsia clasificada hoy sin severidad requiere vigilancia continua.',
      formulaUsed: 'Criterios ACOG Practice Bulletin No. 222 (2020) + Clasificación HELLP Tennessee y Mississippi',
      inputsSummary: `PA ${roundClinical(sbp, 0)}/${roundClinical(dbp, 0)} mmHg · Proteinuria ${hasProteinuria ? '+' : '−'} · Plt ${roundClinical(platelets, 0)}k · AST/ALT ${roundClinical(astAlt, 0)} · Cr ${formatClinicalNumber(creatinine, 2)}`,
    };
  },
};
