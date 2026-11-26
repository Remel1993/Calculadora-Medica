import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const scaleModeField: SelectFieldDef = {
  id: 'scaleMode',
  label: 'Sistema de clasificación de Pie Diabético',
  type: 'select',
  defaultValue: 'wifi',
  options: [
    { value: 'wifi', label: 'SVS WIfI (Herida, Isquemia e Infección — Riesgo amputación y revascularización)' },
    { value: 'wagner', label: 'Escala de Meggit-Wagner (Grados 0 – 5)' },
    { value: 'pedis', label: 'PEDIS / IWGDF-IDSA (Perfusión e Infección del pie)' },
  ],
};

// Wagner
const wagnerGradeField: SelectFieldDef = {
  id: 'wagnerGrade',
  label: 'Grado clínico de Meggit-Wagner',
  type: 'select',
  defaultValue: '1',
  visibleWhen: (i) => i.scaleMode === 'wagner',
  options: [
    { value: '0', label: 'Grado 0 — Pie en riesgo (sin lesión abierta; deformidad o hiperqueratosis)' },
    { value: '1', label: 'Grado 1 — Úlcera superficial (solo epidermis/dermis; sin tejido profundo)' },
    { value: '2', label: 'Grado 2 — Úlcera profunda (alcanza tendón, cápsula o hueso, sin absceso/osteomielitis)' },
    { value: '3', label: 'Grado 3 — Úlcera profunda con absceso, osteomielitis o artritis séptica' },
    { value: '4', label: 'Grado 4 — Gangrena localizada (dedos o antepié)' },
    { value: '5', label: 'Grado 5 — Gangrena extensa de todo el pie' },
  ],
};

// PEDIS / IWGDF
const pedisPerfusionField: SelectFieldDef = {
  id: 'pedisPerfusion',
  label: 'P — Perfusión arterial (PEDIS)',
  type: 'select',
  defaultValue: '1',
  visibleWhen: (i) => i.scaleMode === 'pedis',
  options: [
    { value: '1', label: 'Grado 1 — Sin síntomas ni signos de EAP (pulsos palpables / ITB ≥ 0.90)' },
    { value: '2', label: 'Grado 2 — EAP no crítica (pulsos disminuidos/ausentes o ITB 0.40–0.89 sin isquemia crítica)' },
    { value: '3', label: 'Grado 3 — Isquemia crítica de extremidad (PAS tobillo < 50 mmHg, dedo < 30 mmHg o TcPO₂ < 30 mmHg)' },
  ],
};

const pedisInfectionField: SelectFieldDef = {
  id: 'pedisInfection',
  label: 'I — Infección del pie (PEDIS / IWGDF-IDSA)',
  type: 'select',
  defaultValue: '1',
  visibleWhen: (i) => i.scaleMode === 'pedis',
  options: [
    { value: '1', label: 'Grado 1 — Sin infección (sin signos inflamatorios locales ni pus)' },
    { value: '2', label: 'Grado 2 — Infección leve (solo piel/celular subcutáneo; eritema ≤ 2 cm alrededor)' },
    { value: '3', label: 'Grado 3 — Infección moderada (eritema > 2 cm o compromiso profundo: absceso, fascia, músculo, articulación u hueso)' },
    { value: '4', label: 'Grado 4 — Infección grave (cualquier infección local asociada a ≥ 2 criterios de SIRS/sepsis)' },
  ],
};

// WIfI
const wifiWoundField: SelectFieldDef = {
  id: 'wifiWound',
  label: 'W — Herida / Pérdida tisular (0–3)',
  type: 'select',
  defaultValue: '1',
  visibleWhen: (i) => i.scaleMode === 'wifi',
  options: [
    { value: '0', label: 'W0 — Sin úlcera ni gangrena (dolor isquémico en reposo sin pérdida tisular)' },
    { value: '1', label: 'W1 — Úlcera pequeña/superficial en pierna o pie sin exposición ósea (salvo falange distal)' },
    { value: '2', label: 'W2 — Úlcera profunda con exposición ósea/articular/tendinosa o gangrena limitada a dedos' },
    { value: '3', label: 'W3 — Úlcera extensa/profunda en antepié o mediopié, úlcera calcánea profunda o gangrena extensa' },
  ],
};

const wifiIschemiaField: SelectFieldDef = {
  id: 'wifiIschemia',
  label: 'I — Isquemia (ITB / Presión tobillo o dedo / TcPO₂)',
  type: 'select',
  defaultValue: '0',
  visibleWhen: (i) => i.scaleMode === 'wifi',
  options: [
    { value: '0', label: 'I0 — Sin isquemia significativa (ITB ≥ 0.80, PAS tobillo > 100, dedo/TcPO₂ ≥ 60 mmHg)' },
    { value: '1', label: 'I1 — Isquemia leve (ITB 0.60–0.79, tobillo 70–100, dedo/TcPO₂ 40–59 mmHg)' },
    { value: '2', label: 'I2 — Isquemia moderada (ITB 0.40–0.59, tobillo 50–70, dedo/TcPO₂ 30–39 mmHg)' },
    { value: '3', label: 'I3 — Isquemia grave (ITB ≤ 0.39, tobillo < 50, dedo/TcPO₂ < 30 mmHg)' },
  ],
};

const wifiInfectionField: SelectFieldDef = {
  id: 'wifiInfection',
  label: 'fI — Infección del pie (IWGDF / IDSA)',
  type: 'select',
  defaultValue: '0',
  visibleWhen: (i) => i.scaleMode === 'wifi',
  options: [
    { value: '0', label: 'fI0 — Sin infección' },
    { value: '1', label: 'fI1 — Infección leve (celulitis ≤ 2 cm, superficial)' },
    { value: '2', label: 'fI2 — Infección moderada (celulitis > 2 cm o tejidos profundos/hueso sin SIRS)' },
    { value: '3', label: 'fI3 — Infección grave (manifestaciones sistémicas / ≥ 2 criterios de SIRS)' },
  ],
};

type WifiTier = 'VL' | 'L' | 'M' | 'H';

// Mills et al., J Vasc Surg 2014;59:220-234 — Table IVa: 1-year amputation risk [I][W][fI]
const WIFI_AMPUTATION_STAGE: Record<number, Record<number, [WifiTier, WifiTier, WifiTier, WifiTier]>> = {
  0: {
    0: ['VL', 'VL', 'L', 'M'],
    1: ['VL', 'VL', 'L', 'M'],
    2: ['L', 'L', 'M', 'H'],
    3: ['M', 'M', 'H', 'H'],
  },
  1: {
    0: ['VL', 'L', 'M', 'H'],
    1: ['VL', 'L', 'M', 'H'],
    2: ['M', 'M', 'H', 'H'],
    3: ['H', 'H', 'H', 'H'],
  },
  2: {
    0: ['L', 'L', 'M', 'H'],
    1: ['L', 'M', 'H', 'H'],
    2: ['M', 'H', 'H', 'H'],
    3: ['H', 'H', 'H', 'H'],
  },
  3: {
    0: ['L', 'M', 'M', 'H'],
    1: ['M', 'M', 'H', 'H'],
    2: ['H', 'H', 'H', 'H'],
    3: ['H', 'H', 'H', 'H'],
  },
};

// Mills et al., J Vasc Surg 2014 — Table IVb: Estimated benefit of revascularization [I][W][fI]
const WIFI_REVASC_BENEFIT: Record<number, Record<number, [WifiTier, WifiTier, WifiTier, WifiTier]>> = {
  0: {
    0: ['VL', 'VL', 'VL', 'VL'],
    1: ['VL', 'VL', 'VL', 'VL'],
    2: ['VL', 'VL', 'VL', 'VL'],
    3: ['VL', 'VL', 'VL', 'VL'],
  },
  1: {
    0: ['VL', 'VL', 'L', 'L'],
    1: ['VL', 'L', 'M', 'M'],
    2: ['M', 'M', 'H', 'H'],
    3: ['H', 'H', 'H', 'H'],
  },
  2: {
    0: ['L', 'L', 'M', 'H'],
    1: ['M', 'M', 'H', 'H'],
    2: ['M', 'H', 'H', 'H'],
    3: ['M', 'H', 'H', 'H'],
  },
  3: {
    0: ['M', 'M', 'H', 'H'],
    1: ['H', 'H', 'H', 'H'],
    2: ['H', 'H', 'H', 'H'],
    3: ['H', 'H', 'H', 'H'],
  },
};

const TIER_LABEL: Record<WifiTier, string> = {
  VL: 'Muy bajo (Estadio 1)',
  L: 'Bajo (Estadio 2)',
  M: 'Moderado (Estadio 3)',
  H: 'Alto (Estadio 4)',
};

const REVASC_LABEL: Record<WifiTier, string> = {
  VL: 'Muy bajo beneficio',
  L: 'Bajo beneficio',
  M: 'Beneficio moderado',
  H: 'Alto beneficio (prioritaria)',
};

export const diabeticFootScalesCalculator: CalculatorDefinition = {
  id: 'diabetic-foot-wagner-pedis-wifi',
  name: 'Pie Diabético — Escalas Meggit-Wagner, PEDIS (IWGDF) y SVS WIfI',
  shortName: 'Pie Diabético (Wagner/PEDIS/WIfI)',
  primarySpecialty: 'endocrinologia',
  secondarySpecialties: ['cirugia-general', 'medicina-interna', 'dermatologia'],
  subcategory: 'gravedad',
  keywords: [
    'pie diabetico',
    'wagner',
    'meggit wagner',
    'pedis',
    'wifi',
    'iwgdf',
    'ulcera',
    'amputacion',
    'isquemia',
    'osteomielitis',
  ],
  description:
    'Integra en un solo módulo las tres clasificaciones estándar del pie diabético: Meggit-Wagner (0–5), PEDIS / IWGDF-IDSA (perfusión e infección) y SVS WIfI (riesgo de amputación a 1 año y beneficio de revascularización).',
  clinicalIndication:
    'Evaluación inicial, estratificación del riesgo de amputación, necesidad de antibioticoterapia, desbridamiento y valoración vascular en úlcera de pie diabético o isquemia crítica.',
  validatedPopulation: 'Adultos con pie diabético ulcerado o en riesgo, e isquemia crónica amenazante de extremidad (WIfI).',
  contraindications: [
    'En pacientes diabéticos con calcificación arterial de Mönckeberg, el ITB puede estar falsamente elevado (> 1.30–1.40); en WIfI y PEDIS priorizar presión del dedo (TBI / dedo) o TcPO₂.',
  ],
  limitations: [
    'La escala de Wagner no separa adecuadamente la isquemia de la infección en úlceras superficiales; por ello las guías actuales (IWGDF/SVS) prefieren WIfI y PEDIS/IDSA para decisiones de revascularización y antibioterapia.',
  ],
  version: 'Wagner (1981) · PEDIS/IWGDF (2023) · SVS WIfI (Mills 2014)',
  references: [
    {
      citation: 'Mills JL Sr, Conte MS, Armstrong DG, et al. The Society for Vascular Surgery Lower Extremity Threatened Limb Classification System: WIfI. J Vasc Surg. 2014;59(1):220-234.',
      year: 2014,
    },
    {
      citation: 'Schaper NC, van Netten JJ, Apelqvist J, et al. Practical guidelines on the prevention and management of diabetes-related foot disease (IWGDF 2023 update). Diabetes Metab Res Rev. 2024;40(3):e3657.',
      year: 2024,
    },
    {
      citation: 'Wagner FW Jr. The dysvascular foot: a system for diagnosis and treatment. Foot Ankle. 1981;2(2):64-122.',
      year: 1981,
    },
  ],
  fields: [
    scaleModeField,
    wagnerGradeField,
    pedisPerfusionField,
    pedisInfectionField,
    wifiWoundField,
    wifiIschemiaField,
    wifiInfectionField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(diabeticFootScalesCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const mode = inputs.scaleMode as 'wifi' | 'wagner' | 'pedis';

    if (mode === 'wagner') {
      const grade = Number(inputs.wagnerGrade);
      let severity: SeverityLevel = 'normal';
      let riskClassification = '';
      let interpretation = '';
      let guidance: string[] = [];

      if (grade === 0) {
        severity = 'normal';
        riskClassification = 'Wagner Grado 0 — Pie de riesgo sin lesión abierta';
        interpretation = 'Piel íntegra con factores biomecánicos/neuropáticos de riesgo.';
        guidance = ['Educación podológica, calzado terapéutico/descarga de presiones y cribado vascular periódico.'];
      } else if (grade === 1) {
        severity = 'low';
        riskClassification = 'Wagner Grado 1 — Úlcera superficial';
        interpretation = 'Lesión limitada a planos superficiales sin afectación tendinosa ni ósea.';
        guidance = ['Descarga plantar (offloading), desbridamiento del tejido no viable y descartar isquemia/infección.'];
      } else if (grade === 2) {
        severity = 'moderate';
        riskClassification = 'Wagner Grado 2 — Úlcera profunda';
        interpretation = 'Extensión a tendón, cápsula o hueso sin signos de absceso profundo ni osteomielitis clínica.';
        guidance = ['Prueba de contacto óseo (probe-to-bone), descarga estricta, evaluación vascular (ITB/pulsos) y vigilancia estrecha de infección.'];
      } else if (grade === 3) {
        severity = 'high';
        riskClassification = 'Wagner Grado 3 — Infección profunda / Osteomielitis';
        interpretation = 'Úlcera complicada con absceso profundo, osteomielitis o artritis séptica.';
        guidance = ['Valoración quirúrgica urgente para drenaje/desbridamiento, toma de cultivos profundos/óseos y antibioticoterapia sistémica dirigida.'];
      } else if (grade === 4) {
        severity = 'critical';
        riskClassification = 'Wagner Grado 4 — Gangrena localizada';
        interpretation = 'Necrosis isquémica/infecciosa en dedos o antepié con alto riesgo de progresión.';
        guidance = ['Valoración urgente por Cirugía Vascular y equipo multidisciplinario de pie diabético para revascularización y delimitación quirúrgica.'];
      } else {
        severity = 'critical';
        riskClassification = 'Wagner Grado 5 — Gangrena extensa del pie';
        interpretation = 'Afectación necrótica extensa del pie que compromete la viabilidad de la extremidad y riesgo sistémico.';
        guidance = ['Hospitalización inmediata, cobertura antibiótica amplia y valoración quirúrgica/vascular urgente.'];
      }

      return {
        primaryResult: {
          label: 'Escala de Meggit-Wagner',
          value: grade,
          formattedValue: `Grado ${grade}`,
          unit: '(de 5)',
        },
        severity,
        riskClassification,
        clinicalInterpretation: interpretation,
        guidance,
        formulaUsed: 'Clasificación morfológica de Meggit-Wagner (Grados 0–5)',
        inputsSummary: `Meggit-Wagner Grado ${grade}`,
      };
    }

    if (mode === 'pedis') {
      const p = Number(inputs.pedisPerfusion);
      const inf = Number(inputs.pedisInfection);
      const maxVal = Math.max(p, inf);

      let severity: SeverityLevel = 'normal';
      if (inf === 4 || p === 3) severity = 'critical';
      else if (inf === 3) severity = 'high';
      else if (inf === 2 || p === 2) severity = 'moderate';
      else severity = 'normal';

      const guidance: string[] = [];
      if (inf === 1) {
        guidance.push('Sin infección clínica: no están indicados antibióticos sistémicos en ausencia de infección.');
      } else if (inf === 2) {
        guidance.push('Infección leve (IWGDF 2): manejo habitualmente ambulatorio con antibiótico oral dirigido a cocos grampositivos + cuidado local y descarga.');
      } else if (inf === 3) {
        guidance.push('Infección moderada (IWGDF 3): evaluar hospitalización inicial o terapia IV si celulitis extensa/osteomielitis, cultivos profundos y desbridamiento.');
      } else {
        guidance.push('Infección grave (IWGDF 4 / SIRS): hospitalización inmediata, antibióticos IV de amplio espectro y desbridamiento/drenaje quirúrgico urgente.');
      }
      if (p === 3) {
        guidance.push('Perfusión PEDIS 3 (isquemia crítica): evaluación prioritaria por Cirugía Vascular para estudio arterial y revascularización.');
      } else if (p === 2) {
        guidance.push('Perfusión PEDIS 2 (EAP no crítica): documentar ITB/TBI y vigilar cicatrización.');
      }

      return {
        primaryResult: {
          label: 'PEDIS / IWGDF-IDSA',
          value: maxVal,
          formattedValue: `P${p} · I${inf}`,
          unit: `(Infección Grado ${inf})`,
        },
        secondaryResults: [
          { label: 'Perfusión (P)', formattedValue: `Grado ${p}/3`, unit: '' },
          { label: 'Infección (IWGDF/IDSA)', formattedValue: `Grado ${inf}/4`, unit: '' },
        ],
        severity,
        riskClassification: `Infección IWGDF Grado ${inf} con Perfusión PEDIS ${p}`,
        clinicalInterpretation:
          inf >= 3 || p === 3
            ? 'Compromiso infeccioso profundo/sistémico o isquemia crítica que requiere manejo multidisciplinario urgente.'
            : 'Situación localizada sin infección grave ni isquemia crítica inmediata.',
        guidance,
        formulaUsed: 'Clasificación IWGDF/IDSA de Infección (1–4) y Perfusión PEDIS (1–3)',
        inputsSummary: `PEDIS Perfusión: ${p}/3 · Infección IWGDF: ${inf}/4`,
      };
    }

    // WIfI mode
    const w = Number(inputs.wifiWound);
    const isch = Number(inputs.wifiIschemia);
    const fi = Number(inputs.wifiInfection);

    const ampTier = WIFI_AMPUTATION_STAGE[isch][w][fi];
    const revascTier = WIFI_REVASC_BENEFIT[isch][w][fi];
    const stageNum = ampTier === 'VL' ? 1 : ampTier === 'L' ? 2 : ampTier === 'M' ? 3 : 4;

    const severityMap: Record<WifiTier, SeverityLevel> = {
      VL: 'low',
      L: 'moderate',
      M: 'high',
      H: 'critical',
    };

    const guidance: string[] = [];
    if (fi >= 2) {
      guidance.push('Control prioritario de la infección profunda/sistémica (drenaje quirúrgico y antibióticos) antes o en paralelo al abordaje vascular.');
    }
    if (revascTier === 'H' || revascTier === 'M') {
      guidance.push('Beneficio moderado-alto de revascularización: remitir a Cirugía Vascular para angiotomografía/arteriografía y reperfusión (endovascular o bypass).');
    } else {
      guidance.push('Priorizar descarga plantar, curación húmeda avanzada y control metabólico; beneficio limitado de revascularización arterial adicional.');
    }

    return {
      primaryResult: {
        label: 'Estadio Clínico SVS WIfI',
        value: stageNum,
        formattedValue: `Estadio ${stageNum}`,
        unit: `(W${w}-I${isch}-fI${fi})`,
      },
      secondaryResults: [
        {
          label: 'Riesgo de amputación mayor a 1 año',
          formattedValue: TIER_LABEL[ampTier],
          unit: '',
        },
        {
          label: 'Beneficio estimado de revascularización',
          formattedValue: REVASC_LABEL[revascTier],
          unit: '',
        },
      ],
      severity: severityMap[ampTier],
      riskClassification: `WIfI Estadio ${stageNum} — Riesgo ${TIER_LABEL[ampTier].split(' (')[0].toLowerCase()} de amputación`,
      clinicalInterpretation:
        `Perfil W${w}-I${isch}-fI${fi}: corresponde al Estadio clínico ${stageNum} de Mills et al. con ${REVASC_LABEL[revascTier].toLowerCase()} de revascularización.` +
        (w === 0 && isch === 3 && fi === 0
          ? ' Nota clínica: aunque W0-I3-fI0 mapea al Estadio 2 en el consenso 2014, el dolor isquémico en reposo amerita evaluación vascular prioritaria.'
          : ''),
      guidance,
      guidanceDisclaimer: 'Consenso SVS WIfI (Mills et al. 2014); valorar estado funcional y riesgo quirúrgico individual.',
      formulaUsed: 'Matriz 4×4×4 SVS WIfI (Herida W 0–3 × Isquemia I 0–3 × Infección fI 0–3)',
      inputsSummary: `SVS WIfI: W${w} I${isch} fI${fi} → Estadio ${stageNum}`,
    };
  },
};
