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

const modeField: SelectFieldDef = {
  id: 'mode',
  label: 'Modelo clínico a calcular',
  type: 'select',
  defaultValue: 'rmi',
  options: [
    { value: 'rmi', label: 'Índice RMI I (Jacobs: Ecografía × Menopausia × CA-125)' },
    { value: 'roma', label: 'Algoritmo ROMA (CA-125 + HE4 + Estado menopáusico)' },
  ],
};

const menopausalField: SelectFieldDef = {
  id: 'menopausalStatus',
  label: 'Estado menopáusico',
  type: 'select',
  defaultValue: 'post',
  options: [
    { value: 'pre', label: 'Premenopáusica (M = 1 en RMI)' },
    { value: 'post', label: 'Posmenopáusica — ≥ 1 año amenorrea o > 50 años si histerectomizada (M = 3)' },
  ],
};

const ultrasoundField: SelectFieldDef = {
  id: 'ultrasoundFeatures',
  label: 'Características ecográficas sospechosas (U)',
  type: 'select',
  defaultValue: '3',
  visibleWhen: (inputs) => inputs.mode === 'rmi',
  helpText: 'Criterios (1 pt cada uno): quiste multilocular, áreas sólidas, metástasis, ascitis o lesión bilateral.',
  options: [
    { value: '0', label: '0 características sospechosas (U = 0)' },
    { value: '1', label: '1 característica sospechosa (U = 1)' },
    { value: '3', label: '≥ 2 características sospechosas (U = 3)' },
  ],
};

const ca125Field: NumberFieldDef = {
  id: 'ca125',
  label: 'CA-125 sérico',
  type: 'number',
  canonicalUnit: 'U/mL',
  units: [
    { id: 'u_ml', label: 'U/mL', toCanonical: (v) => v, min: 0.5, max: 50000, step: 0.5 },
    { id: 'ku_l', label: 'kU/L', toCanonical: (v) => v, min: 0.5, max: 50000, step: 0.5 },
  ],
  defaultUnitId: 'u_ml',
  defaultValue: '48',
  min: 0.5,
  max: 50000,
  placeholder: '48',
};

const he4Field: NumberFieldDef = {
  id: 'he4',
  label: 'HE4 sérico (Human Epididymis Protein 4)',
  type: 'number',
  canonicalUnit: 'pmol/L',
  units: [{ id: 'pmol_l', label: 'pmol/L', toCanonical: (v) => v, min: 5, max: 20000, step: 1 }],
  defaultUnitId: 'pmol_l',
  defaultValue: '95',
  visibleWhen: (inputs) => inputs.mode === 'roma',
  min: 5,
  max: 20000,
  placeholder: '95',
};

export const ovarianRmiRomaCalculator: CalculatorDefinition = {
  id: 'ovarian-roma-rmi',
  name: 'Masa Anexial: Índice RMI I (Jacobs) y Algoritmo ROMA (CA-125 + HE4)',
  shortName: 'RMI I / ROMA (Masa Anexial)',
  primarySpecialty: 'oncologia',
  secondarySpecialties: ['gineco-obstetricia', 'cirugia-general'],
  subcategory: 'diagnostico',
  keywords: [
    'rmi',
    'roma',
    'ca125',
    'ca-125',
    'he4',
    'ovario',
    'masa anexial',
    'cancer de ovario',
    'ginecooncologia',
    'jacobs',
  ],
  description:
    'Estratificación preoperatoria del riesgo de malignidad epitelial ovárica ante una masa anexial mediante Índice RMI I (Jacobs) o Algoritmo ROMA.',
  clinicalIndication:
    'Decisión de derivación a Ginecología Oncológica ante tumoración o quiste anexial complejo detectado por imagen.',
  validatedPopulation: 'Mujeres adultas ≥ 18 años con masa anexial confirmada por imagen programadas para evaluación quirúrgica o seguimiento.',
  contraindications: [
    'No utilizar como prueba de tamizaje en mujeres asintomáticas sin masa anexial.',
    'En pacientes jóvenes (< 30 años) con sospecha de tumor de células germinales solicitar además AFP, β-hCG y LDH.',
  ],
  limitations: [
    'CA-125 se eleva en causas benignas frecuentes (endometriosis, enfermedad pélvica inflamatoria, miomas, embarazo, ascitis hepática o insuficiencia cardíaca), reduciendo la especificidad en premenopáusicas.',
    'HE4 se eleva falsamente en enfermedad renal crónica (TFGe reducida) y tabaquismo intenso; en insuficiencia renal preferir criterios ecográficos O-RADS/IOTA.',
    'Los puntos de corte del algoritmo ROMA varían según el inmunoensayo de laboratorio (Roche Elecsys: ≥ 11.4 % pre / ≥ 29.9 % post vs. Abbott Architect: ≥ 7.4 % pre / ≥ 25.3 % post).',
  ],
  version: 'RMI I (Jacobs et al., BJOG 1990) · ROMA (Moore et al., Gynecol Oncol 2009)',
  references: [
    {
      citation:
        'Jacobs I, Oram D, Fairbanks J, Turner J, Frost C, Grudzinskas JG. A risk of malignancy index incorporating CA 125, ultrasound and menopausal status for the accurate preoperative diagnosis of ovarian cancer. Br J Obstet Gynaecol. 1990;97(10):922-929.',
      year: 1990,
    },
    {
      citation:
        'Moore RG, McMeekin DS, Brown AK, et al. A novel multiple marker bioassay utilizing HE4 and CA125 for the prediction of ovarian cancer in patients with a pelvic mass. Gynecol Oncol. 2009;112(1):40-46.',
      year: 2009,
    },
    {
      citation:
        'Royal College of Obstetricians and Gynaecologists (RCOG). Management of Suspected Ovarian Masses in Premenopausal Women (Green-top Guideline No. 62) & Postmenopausal Women (No. 34).',
      year: 2016,
    },
  ],
  fields: [modeField, menopausalField, ultrasoundField, ca125Field, he4Field],
  calculate(inputs: CalculatorInputsState) {
    const errors = validateCalculatorInputs(ovarianRmiRomaCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors.map((e) => e.message).join(' '));
    }

    const mode = String(inputs.mode ?? 'rmi');
    const menopausal = String(inputs.menopausalStatus ?? 'post');
    const ca125 = getCanonicalNumberValue(ca125Field, inputs.ca125 as NumberInputValue).canonicalValue!;

    if (mode === 'rmi') {
      const u = Number(inputs.ultrasoundFeatures ?? '3');
      const m = menopausal === 'post' ? 3 : 1;
      const rmi = roundClinical(u * m * ca125, 1);

      let severity: SeverityLevel = 'low';
      let riskClass = 'Bajo riesgo (RMI I < 25)';
      let guidanceLine = 'Probabilidad de malignidad < 3 %. Manejo habitual por Ginecología general / seguimiento o cirugía laparoscópica conservadora si indicada.';

      if (rmi >= 200) {
        severity = 'critical';
        riskClass = 'Alto riesgo de malignidad (RMI I ≥ 200)';
        guidanceLine = 'Probabilidad estimada de cáncer ovárico > 75 %: derivar prioritariamente a Ginecología Oncológica (TC estadificadora y planificación de cirugía oncológica / citorreducción).';
      } else if (rmi >= 25) {
        severity = 'moderate';
        riskClass = 'Riesgo intermedio (RMI I 25–199)';
        guidanceLine = 'Riesgo estimado ~20 %: completar valoración con criterios ecográficos O-RADS / IOTA o RM pélvica y valoración conjunta con Ginecología Oncológica.';
      }

      return {
        primaryResult: {
          label: 'Índice RMI I (Jacobs)',
          value: rmi,
          formattedValue: formatClinicalNumber(rmi, 1),
          unit: 'pts',
        },
        secondaryResults: [
          { label: 'Factor ecográfico (U)', formattedValue: String(u), unit: '' },
          { label: 'Factor menopáusico (M)', formattedValue: String(m), unit: menopausal === 'post' ? 'Posmenopausia' : 'Premenopausia' },
          { label: 'CA-125', formattedValue: formatClinicalNumber(ca125, 1), unit: 'U/mL' },
        ],
        severity,
        riskClassification: riskClass,
        clinicalInterpretation: `RMI I = ${formatClinicalNumber(rmi, 1)} (U=${u} × M=${m} × CA-125=${formatClinicalNumber(ca125, 1)}). ${guidanceLine}`,
        guidance: [
          guidanceLine,
          'El umbral estándar RCOG/NICE para derivación directa a equipo oncológico es RMI I ≥ 200 (algunas guías usan ≥ 250 para mayor especificidad).',
          'En menores de 40 años con masa sólida o compleja, añadir AFP, β-hCG y LDH para descartar tumores germinales.',
        ],
        guidanceDisclaimer:
          'Correlacionar siempre con evaluación ecográfica experta (O-RADS / IOTA ADNEX) para no infravalorar tumores mucinosos o borderline con CA-125 normal.',
        formulaUsed: 'RMI I = U × M × CA-125 (U ∈ {0, 1, 3}; M = 1 premenopáusica o 3 posmenopáusica)',
        inputsSummary: `Modo=RMI I, M=${m}, U=${u}, CA-125=${formatClinicalNumber(ca125, 1)} U/mL`,
      };
    }

    // ROMA mode (Moore et al. 2009)
    const he4 = getCanonicalNumberValue(he4Field, inputs.he4 as NumberInputValue).canonicalValue!;
    const pi =
      menopausal === 'post'
        ? -8.09 + 1.04 * Math.log(he4) + 0.732 * Math.log(ca125)
        : -12.0 + 2.38 * Math.log(he4) + 0.0626 * Math.log(ca125);
    const romaPercent = roundClinical((Math.exp(pi) / (1 + Math.exp(pi))) * 100, 1);

    const elecsysCutoff = menopausal === 'post' ? 29.9 : 11.4;
    const architectCutoff = menopausal === 'post' ? 25.3 : 7.4;
    const highRiskElecsys = romaPercent >= elecsysCutoff;
    const borderlineArchitect = !highRiskElecsys && romaPercent >= architectCutoff;

    const severity: SeverityLevel = highRiskElecsys
      ? 'high'
      : borderlineArchitect
        ? 'moderate'
        : 'low';

    const riskClass = highRiskElecsys
      ? `Alto riesgo de malignidad epitelial (ROMA ≥ ${elecsysCutoff} %)`
      : borderlineArchitect
        ? `Zona limítrofe según ensayo (≥ ${architectCutoff} % Architect / < ${elecsysCutoff} % Elecsys)`
        : `Bajo riesgo (ROMA < ${architectCutoff} %)`;

    return {
      primaryResult: {
        label: 'Índice ROMA',
        value: romaPercent,
        formattedValue: formatClinicalNumber(romaPercent, 1),
        unit: '%',
      },
      secondaryResults: [
        {
          label: 'Índice predictivo (PI)',
          formattedValue: formatClinicalNumber(roundClinical(pi, 3), 3),
          unit: '',
        },
        {
          label: 'Punto de corte Elecsys (Roche)',
          formattedValue: `≥ ${elecsysCutoff} %`,
          unit: menopausal === 'post' ? 'Posmenopausia' : 'Premenopausia',
        },
        {
          label: 'Punto de corte Architect (Abbott)',
          formattedValue: `≥ ${architectCutoff} %`,
          unit: menopausal === 'post' ? 'Posmenopausia' : 'Premenopausia',
        },
      ],
      severity,
      riskClassification: riskClass,
      clinicalInterpretation: `Algoritmo ROMA = ${formatClinicalNumber(romaPercent, 1)} % en paciente ${
        menopausal === 'post' ? 'posmenopáusica' : 'premenopáusica'
      }. ${
        highRiskElecsys
          ? 'Supera los umbrales de alto riesgo de carcinoma epitelial de ovario: derivar a Ginecología Oncológica.'
          : borderlineArchitect
            ? 'Supera el umbral del ensayo Abbott Architect pero no Roche Elecsys: verificar plataforma de laboratorio y correlacionar con ecografía O-RADS.'
            : 'Por debajo de los puntos de corte estándar de alto riesgo.'
      }`,
      guidance: [
        highRiskElecsys
          ? 'Referencia prioritaria a Ginecología Oncológica y evaluación imagenológica completa (O-RADS / TC).'
          : 'Confirmar qué plataforma analítica realizó el HE4/CA-125 (Roche Elecsys vs. Abbott Architect) e integrar siempre con la morfología ecográfica O-RADS.',
        'Recordar que la insuficiencia renal crónica eleva falsamente la HE4 y dispara el ROMA.',
      ],
      guidanceDisclaimer:
        'ROMA predice riesgo de cáncer epitelial de ovario y no detecta de forma fiable tumores germinales, del estroma ni metástasis ováricas mucinosas.',
      formulaUsed:
        menopausal === 'post'
          ? 'PI = −8.09 + 1.04·ln(HE4) + 0.732·ln(CA-125); ROMA = exp(PI)/(1+exp(PI)) × 100'
          : 'PI = −12.0 + 2.38·ln(HE4) + 0.0626·ln(CA-125); ROMA = exp(PI)/(1+exp(PI)) × 100',
      inputsSummary: `Modo=ROMA, Menopausia=${menopausal}, CA-125=${formatClinicalNumber(ca125, 1)} U/mL, HE4=${formatClinicalNumber(he4, 1)} pmol/L`,
    };
  },
};
