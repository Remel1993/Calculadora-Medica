import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const MRC_GRADE_OPTIONS = [
  { value: '5', label: '5/5 — Fuerza normal contra resistencia completa', points: 5 },
  { value: '4', label: '4/5 — Movimiento contra gravedad y resistencia moderada', points: 4 },
  { value: '3', label: '3/5 — Movimiento activo solo contra la gravedad', points: 3 },
  { value: '2', label: '2/5 — Movimiento activo eliminando la gravedad', points: 2 },
  { value: '1', label: '1/5 — Contracción muscular visible/palpable sin movimiento articular', points: 1 },
  { value: '0', label: '0/5 — Sin contracción muscular (plejía)', points: 0 },
];

const onsetTempoField: SelectFieldDef = {
  id: 'onsetTempo',
  label: 'Temporalidad / forma de instauración de la debilidad',
  type: 'select',
  defaultValue: 'acute_subacute',
  options: [
    { value: 'hyperacute', label: 'Hiperaguda / súbita (< 24 h, minutos u horas) — Alerta vascular / medular' },
    { value: 'acute_subacute', label: 'Aguda / subaguda progresiva (días a < 4 semanas)' },
    { value: 'chronic_fluctuating', label: 'Crónica (> 4 semanas) o fluctuante con fatigabilidad' },
    { value: 'icu_critical', label: 'Paciente crítico / UCI (tamizaje de debilidad adquirida en UCI)' },
  ],
};

const neuroPatternField: SelectFieldDef = {
  id: 'neuroPattern',
  label: 'Hallazgos neurológicos acompañantes (orientación topográfica)',
  type: 'select',
  defaultValue: 'none_untested',
  options: [
    { value: 'none_untested', label: 'Solo cuantificación de fuerza MRC (sin patrón especificado)' },
    { value: 'umn', label: '1.ª Motoneurona / SNC (hiperreflexia, espasticidad, Babinski +, nivel sensitivo o déficit cortical)' },
    { value: 'lmn', label: '2.ª Motoneurona / SNP (hiporreflexia/arreflexia, hipotonía, fasciculaciones, atrofia)' },
    { value: 'nmj', label: 'Unión neuromuscular (fluctuación, fatigabilidad, ptosis/diplopía, reflejos normales)' },
    { value: 'myopathic', label: 'Patrón miopático (debilidad proximal simétrica, sensibilidad normal, reflejos conservados)' },
  ],
};

function makeMrcField(id: string, label: string): SelectFieldDef {
  return {
    id,
    label,
    type: 'select',
    defaultValue: '5',
    options: MRC_GRADE_OPTIONS,
  };
}

const rShoulderField = makeMrcField('rShoulder', '1. Abducción de hombro DERECHO (Deltoides, C5)');
const lShoulderField = makeMrcField('lShoulder', '2. Abducción de hombro IZQUIERDO (Deltoides, C5)');
const rElbowField = makeMrcField('rElbow', '3. Flexión de codo DERECHO (Bíceps, C5–C6)');
const lElbowField = makeMrcField('lElbow', '4. Flexión de codo IZQUIERDO (Bíceps, C5–C6)');
const rWristField = makeMrcField('rWrist', '5. Extensión de muñeca DERECHA (Extensores del carpo, C6–C7)');
const lWristField = makeMrcField('lWrist', '6. Extensión de muñeca IZQUIERDA (Extensores del carpo, C6–C7)');
const rHipField = makeMrcField('rHip', '7. Flexión de cadera DERECHA (Iliopsoas, L1–L2)');
const lHipField = makeMrcField('lHip', '8. Flexión de cadera IZQUIERDA (Iliopsoas, L1–L2)');
const rKneeField = makeMrcField('rKnee', '9. Extensión de rodilla DERECHA (Cuádriceps, L3–L4)');
const lKneeField = makeMrcField('lKnee', '10. Extensión de rodilla IZQUIERDA (Cuádriceps, L3–L4)');
const rAnkleField = makeMrcField('rAnkle', '11. Dorsiflexión de tobillo DERECHO (Tibial anterior, L4–L5)');
const lAnkleField = makeMrcField('lAnkle', '12. Dorsiflexión de tobillo IZQUIERDO (Tibial anterior, L4–L5)');

const MUSCLE_FIELDS = [
  rShoulderField,
  lShoulderField,
  rElbowField,
  lElbowField,
  rWristField,
  lWristField,
  rHipField,
  lHipField,
  rKneeField,
  lKneeField,
  rAnkleField,
  lAnkleField,
];

export const mrcNeurologicalWeaknessCalculator: CalculatorDefinition = {
  id: 'mrc-neurological-weakness',
  name: 'Debilidad Neurológica — Escala MRC Sum Score (0–60) y Topografía',
  shortName: 'Debilidad Neurológica (MRC)',
  primarySpecialty: 'neurologia',
  secondarySpecialties: ['urgencias', 'medicina-interna'],
  subcategory: 'gravedad',
  keywords: [
    'debilidad',
    'debilidad neurologica',
    'fuerza muscular',
    'mrc',
    'mrc sum score',
    'paresia',
    'hemiparesia',
    'paraparesia',
    'tetraparesia',
    'guillain barre',
    'icuaw',
    'motoneurona',
    'miopatia',
  ],
  description:
    'Cuantificación estandarizada de la fuerza muscular en los 12 grupos bilaterales del Medical Research Council (MRC Sum Score, 0–60 puntos) con detección automática de asimetría/patrón topográfico (hemiparesia, paraparesia, tetraparesia, proximal vs. distal) y orientación diagnóstica.',
  clinicalIndication:
    'Evaluación de debilidad motora focal o generalizada en urgencias, neurología, medicina interna y UCI (ictus, síndrome de Guillain-Barré, mielopatías, miopatías, miastenia y debilidad adquirida en UCI).',
  validatedPopulation: 'Adultos y niños colaboradores capaces de seguir órdenes motoras (Medical Research Council / Kleyweg et al. 1991 / De Jonghe et al. 2002).',
  contraindications: [
    'No es fiable en pacientes con coma, delirio grave, sedación profunda o dolor articular/postquirúrgico limitante (falsa debilidad por inhibición álgica).',
  ],
  limitations: [
    'MRC-SS evalúa 6 grupos musculares bilaterales de extremidades y NO incluye musculatura craneal, cervical ni diafragmática/respiratoria (valorar siempre disfagia, disnea, tos débil y capacidad vital forzada).',
    'La escala MRC estándar utiliza grados enteros 0–5; en déficit focal leve de origen central (ictus) complementar siempre con NIHSS.',
  ],
  version: 'MRC Sum Score (Kleyweg 1991 / De Jonghe 2002)',
  references: [
    {
      citation:
        'Medical Research Council. Aids to the Examination of the Peripheral Nervous System. Memorandum No. 45. London: HMSO; 1976.',
      year: 1976,
    },
    {
      citation:
        'Kleyweg RP, van der Meché FGA, Schmitz PIM. Interobserver agreement in the assessment of muscle strength and functional abilities in Guillain-Barré syndrome. Muscle Nerve. 1991;14(11):1103-1109.',
      year: 1991,
    },
    {
      citation:
        'De Jonghe B, Sharshar T, Lefaucheur JP, et al. Paresis acquired in the intensive care unit: a prospective multicenter study. JAMA. 2002;288(22):2859-2867.',
      year: 2002,
    },
  ],
  fields: [onsetTempoField, neuroPatternField, ...MUSCLE_FIELDS],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(mrcNeurologicalWeaknessCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const onset = inputs.onsetTempo as 'hyperacute' | 'acute_subacute' | 'chronic_fluctuating' | 'icu_critical';
    const neuroPattern = inputs.neuroPattern as 'none_untested' | 'umn' | 'lmn' | 'nmj' | 'myopathic';

    const rs = Number(inputs.rShoulder ?? 5);
    const ls = Number(inputs.lShoulder ?? 5);
    const re = Number(inputs.rElbow ?? 5);
    const le = Number(inputs.lElbow ?? 5);
    const rw = Number(inputs.rWrist ?? 5);
    const lw = Number(inputs.lWrist ?? 5);
    const rh = Number(inputs.rHip ?? 5);
    const lh = Number(inputs.lHip ?? 5);
    const rk = Number(inputs.rKnee ?? 5);
    const lk = Number(inputs.lKnee ?? 5);
    const ra = Number(inputs.rAnkle ?? 5);
    const la = Number(inputs.lAnkle ?? 5);

    const total = rs + ls + re + le + rw + lw + rh + lh + rk + lk + ra + la;
    const rightSide = rs + re + rw + rh + rk + ra; // max 30
    const leftSide = ls + le + lw + lh + lk + la; // max 30
    const upperLimbs = rs + ls + re + le + rw + lw; // max 30
    const lowerLimbs = rh + lh + rk + lk + ra + la; // max 30

    const rightUpper = rs + re + rw; // max 15
    const leftUpper = ls + le + lw; // max 15
    const rightLower = rh + rk + ra; // max 15
    const leftLower = lh + lk + la; // max 15

    const proximalScore = rs + ls + rh + lh; // 4 proximal girdles, max 20
    const distalScore = rw + lw + ra + la; // 4 distal groups, max 20

    // Topographic distribution detection
    let distributionPattern = 'Fuerza muscular conservada (sin paresia en los 12 grupos)';
    if (total < 60) {
      const rightWeak = rightSide < 30;
      const leftWeak = leftSide < 30;
      const upperWeak = upperLimbs < 30;
      const lowerWeak = lowerLimbs < 30;

      if (rightWeak && !leftWeak) {
        distributionPattern =
          rightUpper < 15 && rightLower < 15
            ? 'Hemiparesia DERECHA (braquial y crural)'
            : rightUpper < 15
              ? 'Monoparesia braquial DERECHA'
              : 'Monoparesia crural DERECHA';
      } else if (leftWeak && !rightWeak) {
        distributionPattern =
          leftUpper < 15 && leftLower < 15
            ? 'Hemiparesia IZQUIERDA (braquial y crural)'
            : leftUpper < 15
              ? 'Monoparesia braquial IZQUIERDA'
              : 'Monoparesia crural IZQUIERDA';
      } else if (lowerWeak && !upperWeak) {
        distributionPattern = 'Paraparesia (afectación selectiva de miembros inferiores)';
      } else if (upperWeak && !lowerWeak) {
        distributionPattern = 'Diparesia braquial (afectación selectiva de miembros superiores)';
      } else if (Math.abs(rightSide - leftSide) >= 4) {
        distributionPattern =
          rightSide < leftSide
            ? 'Debilidad asimétrica con predominio DERECHO'
            : 'Debilidad asimétrica con predominio IZQUIERDO';
      } else if (proximalScore <= distalScore - 3) {
        distributionPattern = 'Tetraparesia de predominio PROXIMAL (cintura escapular/pélvica)';
      } else if (distalScore <= proximalScore - 3) {
        distributionPattern = 'Tetraparesia de predominio DISTAL (muñecas/tobillos)';
      } else {
        distributionPattern = 'Tetraparesia / debilidad generalizada bilateral';
      }
    }

    // Severity & clinical interpretation
    let severity: SeverityLevel = 'normal';
    let riskClassification = 'Fuerza muscular normal (MRC-SS 60 / 60)';
    let clinicalInterpretation = 'Sin déficit motor detectable en los 12 grupos musculares evaluados.';
    const guidance: string[] = [];

    if (total === 60) {
      if (onset === 'hyperacute') {
        severity = 'low';
        riskClassification = 'MRC-SS 60 / 60 — Sin paresia cuantificada en 12 grupos';
        clinicalInterpretation =
          'No se detecta pérdida de fuerza en los 12 grupos MRC; descartar déficits finos no incluidos (paresia facial, musculatura ocular/bulbar, ataxia o clínica sensitiva).';
      }
    } else if (onset === 'hyperacute') {
      severity = 'critical';
      riskClassification = `EMERGENCIA NEUROLÓGICA — ${distributionPattern} (MRC ${total}/60)`;
      clinicalInterpretation =
        'Debilidad neurológica de instauración hiperaguda/súbita: alta sospecha de evento vascular cerebral (ictus/AIT), hemorragia o síndrome medular agudo.';
      guidance.push(
        'Activar Código Ictus de inmediato si el patrón sugiere territorio cerebral (hemiparesia/monoparesia): glucemia capilar, Cincinnati/FAST, NIHSS y TC craneal urgente.',
        'Si presenta paraparesia o tetraparesia con nivel sensitivo o disfunción esfinteriana, descartar compresión medular aguda mediante RM urgente.',
        'Nota cefalea: si coexiste con cefalea, aplicar SNNOOP10 y descartar causa vascular antes de considerar migraña hemipléjica (ICHD-3 1.2.3).',
      );
    } else if (total < 36) {
      severity = 'critical';
      riskClassification = `Debilidad neurológica GRAVE (MRC-SS ${total} / 60 < 36)`;
      clinicalInterpretation =
        'Puntuación MRC Sum Score < 36/60: paresia grave con elevado riesgo de insuficiencia ventilatoria neuromuscular, disfagia/aspiración y dependencia funcional.';
      guidance.push(
        'Monitorizar función respiratoria de inmediato (capacidad vital forzada, fuerza tusígena, signos de fatiga diafragmática y riesgo de vía aérea) y valoración por Neurología/UCI.',
      );
    } else if (total < 48) {
      severity = 'high';
      riskClassification =
        onset === 'icu_critical'
          ? `Debilidad Adquirida en UCI — ICUAW positiva (MRC-SS ${total} / 60 < 48)`
          : `Debilidad clínica significativa (MRC-SS ${total} / 60 < 48)`;
      clinicalInterpretation =
        'MRC Sum Score < 48/60 cumple el umbral diagnóstico validado de debilidad neuromuscular significativa (De Jonghe et al., 2002).';
      guidance.push(
        'Vigilar progresión ascendente o compromiso bulbar/respiratorio; solicitar ionograma (K+, PO4-, Mg2+, Ca2+), CPK y estudio neurofisiológico/neuroimagen según patrón.',
      );
    } else {
      const hasAsymmetry = Math.abs(rightSide - leftSide) >= 2 || (lowerLimbs < 30 && upperLimbs === 30);
      severity = hasAsymmetry ? 'moderate' : 'low';
      riskClassification = `Debilidad leve o focal (${distributionPattern} · MRC-SS ${total} / 60)`;
      clinicalInterpretation =
        'Puntuación global ≥ 48/60 pero con déficit focal o leve en uno o más grupos musculares; interpretar según distribución anatómica y evolución.';
      guidance.push(
        'Documentar distribución exacta (miotoma/nervio periférico vs. patrón piramidal/medular) y vigilar evolución clínica seriada.',
      );
    }

    // Add pattern-specific orientation when weakness exists
    if (total < 60) {
      if (neuroPattern === 'umn') {
        guidance.push('Patrón de 1.ª Motoneurona (SNC): orienta a lesión encefálica o medular (ictus, tumor, mielopatía compresiva/inflamatoria, enfermedad desmielinizante). Priorizar neuroimagen (TC/RM).');
      } else if (neuroPattern === 'lmn') {
        guidance.push('Patrón de 2.ª Motoneurona (SNP): en cuadro agudo ascendente arrefléxico descartar Síndrome de Guillain-Barré (vigilar disautonomía y capacidad vital); en focal, radiculopatía o plexopatía/neuropatía.');
      } else if (neuroPattern === 'nmj') {
        guidance.push('Patrón de Unión Neuromuscular: orienta a Miastenia Gravis o síndrome miasténico; evitar fármacos bloqueantes neuromusculares (aminoglucósidos, magnesio IV, fluoroquinolonas) y vigilar crisis miasténica.');
      } else if (neuroPattern === 'myopathic') {
        guidance.push('Patrón Miopático (proximal simétrico): solicitar CPK, TSH, electrolitos (K+, P, Mg), perfil hepático/renal y revisión de fármacos miotóxicos (estatinas, corticoides).');
      }
    }

    return {
      primaryResult: {
        label: 'MRC Sum Score (0–60)',
        value: total,
        formattedValue: `${total} / 60`,
        unit: total < 36 ? '(Grave)' : total < 48 ? '(Significativa <48)' : total < 60 ? '(Leve/Focal)' : '(Normal)',
      },
      secondaryResults: [
        { label: 'Patrón de distribución', formattedValue: distributionPattern, unit: '' },
        { label: 'Hemicuerpo Der / Izq', formattedValue: `${rightSide}/30 · ${leftSide}/30`, unit: 'pts' },
        { label: 'MMSS / MMII', formattedValue: `${upperLimbs}/30 · ${lowerLimbs}/30`, unit: 'pts' },
        { label: 'Proximal / Distal', formattedValue: `${proximalScore}/20 · ${distalScore}/20`, unit: 'pts' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer:
        'El MRC Sum Score cuantifica fuerza en extremidades; evaluar siempre pares craneales, reflejos, sensibilidad y función ventilatoria.',
      formulaUsed: 'Suma de 12 grupos musculares bilaterales (escala MRC 0–5 c/u; rango 0–60; umbral ICUAW < 48; grave < 36)',
      inputsSummary: `MRC-SS: ${total}/60 (Der:${rightSide}, Izq:${leftSide}, MMSS:${upperLimbs}, MMII:${lowerLimbs}) · Inicio:${onset} · Patrón:${neuroPattern}`,
    };
  },
};
