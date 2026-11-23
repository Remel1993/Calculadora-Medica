import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SeverityLevel,
} from '../types/clinical.ts';

interface SnnoopItem {
  field: BooleanFieldDef;
  code: string;
  tier: 'emergency' | 'urgent' | 'overuse';
  suspicion: string;
}

const SNNOOP_ITEMS: SnnoopItem[] = [
  {
    code: 'S',
    tier: 'emergency',
    suspicion: 'Infección del SNC (meningitis/encefalitis/absceso), arteritis o enfermedad sistémica',
    field: {
      id: 'sSystemic',
      label: 'S — Síntomas sistémicos incluida fiebre (rigidez de nuca, pérdida ponderal, mialgias/claudicación mandibular)',
      type: 'boolean',
      trueLabel: 'Presente',
      falseLabel: 'Ausente',
      defaultValue: false,
    },
  },
  {
    code: 'N1',
    tier: 'urgent',
    suspicion: 'Metástasis cerebrales o carcinomatosis meníngea',
    field: {
      id: 'nNeoplasm',
      label: 'N — Antecedente de neoplasia (cáncer activo o previo)',
      type: 'boolean',
      trueLabel: 'Presente',
      falseLabel: 'Ausente',
      defaultValue: false,
    },
  },
  {
    code: 'N2',
    tier: 'emergency',
    suspicion: 'Ictus/AIT, hemorragia intracraneal, masa expansiva, trombosis venosa o absceso',
    field: {
      id: 'nNeuroDeficit',
      label: 'N — Déficit o disfunción neurológica (debilidad motora, afasia, ataxia, diplopía o alteración de conciencia)',
      helpText: 'Incluye cualquier focalidad motora o sensitiva nueva, asimetría facial/braquial o caída del nivel de conciencia.',
      type: 'boolean',
      trueLabel: 'Presente',
      falseLabel: 'Ausente',
      defaultValue: false,
    },
  },
  {
    code: 'O1',
    tier: 'emergency',
    suspicion: 'Hemorragia subaracnoidea (HSA), vasoconstricción cerebral reversible (RCVS), disección o trombosis venosa',
    field: {
      id: 'oOnsetSudden',
      label: 'O — Inicio súbito / abrupto «en trueno» (alcanza máxima intensidad en < 1 minuto)',
      type: 'boolean',
      trueLabel: 'Presente',
      falseLabel: 'Ausente',
      defaultValue: false,
    },
  },
  {
    code: 'O2',
    tier: 'urgent',
    suspicion: 'Arteritis de células gigantes (temporal), neoplasia o hematoma subdural crónico',
    field: {
      id: 'oOlderAge',
      label: 'O — Edad > 50 años en cefalea de inicio nuevo',
      type: 'boolean',
      trueLabel: 'Presente',
      falseLabel: 'Ausente',
      defaultValue: false,
    },
  },
  {
    code: 'P1',
    tier: 'urgent',
    suspicion: 'Lesión estructural, trombosis venosa cerebral o enfermedad vascular',
    field: {
      id: 'p1PatternChange',
      label: 'P1 — Cambio de patrón previo o cefalea de inicio reciente',
      type: 'boolean',
      trueLabel: 'Presente',
      falseLabel: 'Ausente',
      defaultValue: false,
    },
  },
  {
    code: 'P2',
    tier: 'urgent',
    suspicion: 'Hipotensión de LCR (empeora al incorporarse) o hipertensión intracraneal/masa (empeora en decúbito)',
    field: {
      id: 'p2Positional',
      label: 'P2 — Cefalea posicional (cambia significativamente al ponerse de pie o acostarse)',
      type: 'boolean',
      trueLabel: 'Presente',
      falseLabel: 'Ausente',
      defaultValue: false,
    },
  },
  {
    code: 'P3',
    tier: 'urgent',
    suspicion: 'Malformación de Chiari, lesión de fosa posterior, HSA o RCVS',
    field: {
      id: 'p3Precipitated',
      label: 'P3 — Precipitada por tos, estornudo, maniobra de Valsalva o ejercicio físico',
      type: 'boolean',
      trueLabel: 'Presente',
      falseLabel: 'Ausente',
      defaultValue: false,
    },
  },
  {
    code: 'P4',
    tier: 'emergency',
    suspicion: 'Hipertensión intracraneal (masa ocupante, trombosis venosa cerebral, hidrocefalia o HIC idiopática)',
    field: {
      id: 'p4Papilledema',
      label: 'P4 — Papiledema (edema de papila en fondo de ojo)',
      type: 'boolean',
      trueLabel: 'Presente',
      falseLabel: 'Ausente',
      defaultValue: false,
    },
  },
  {
    code: 'P5',
    tier: 'urgent',
    suspicion: 'Neoplasia, lesión ocupante de espacio o causa secundaria no clasificada',
    field: {
      id: 'p5Progressive',
      label: 'P5 — Cefalea progresiva (empeoramiento continuo) o presentación atípica',
      type: 'boolean',
      trueLabel: 'Presente',
      falseLabel: 'Ausente',
      defaultValue: false,
    },
  },
  {
    code: 'P6',
    tier: 'emergency',
    suspicion: 'Preeclampsia/eclampsia, trombosis venosa cerebral, RCVS o apoplejía hipofisaria',
    field: {
      id: 'p6Pregnancy',
      label: 'P6 — Embarazo o puerperio',
      type: 'boolean',
      trueLabel: 'Presente',
      falseLabel: 'Ausente',
      defaultValue: false,
    },
  },
  {
    code: 'P7',
    tier: 'emergency',
    suspicion: 'Glaucoma agudo de ángulo cerrado, patología de seno cavernoso/órbita, síndrome de Tolosa-Hunt o disección carotídea',
    field: {
      id: 'p7PainfulEye',
      label: 'P7 — Ojo doloroso con signos autonómicos (ojo rojo, miosis/ptosis, diplopía o pérdida visual)',
      type: 'boolean',
      trueLabel: 'Presente',
      falseLabel: 'Ausente',
      defaultValue: false,
    },
  },
  {
    code: 'P8',
    tier: 'emergency',
    suspicion: 'Hematoma subdural/epidural, hemorragia postraumática, disección arterial o fístula de LCR',
    field: {
      id: 'p8Posttraumatic',
      label: 'P8 — Inicio postraumático (traumatismo craneal o cervical reciente)',
      type: 'boolean',
      trueLabel: 'Presente',
      falseLabel: 'Ausente',
      defaultValue: false,
    },
  },
  {
    code: 'P9',
    tier: 'emergency',
    suspicion: 'Infecciones oportunistas del SNC (criptococosis, toxoplasmosis, LMP) o linfoma primario del SNC',
    field: {
      id: 'p9PathologyImmune',
      label: 'P9 — Patología del sistema inmune (VIH, inmunosupresión farmacológica o trasplante)',
      type: 'boolean',
      trueLabel: 'Presente',
      falseLabel: 'Ausente',
      defaultValue: false,
    },
  },
  {
    code: 'P10',
    tier: 'overuse',
    suspicion: 'Cefalea por uso excesivo de medicación (ICHD-3 8.2) o cefalea inducida por fármacos (nitratos, vasodilatadores)',
    field: {
      id: 'p10PainkillerOveruse',
      label: 'P10 — Uso excesivo de analgésicos o inicio de cefalea tras nuevo fármaco',
      type: 'boolean',
      trueLabel: 'Presente',
      falseLabel: 'Ausente',
      defaultValue: false,
    },
  },
];

export const headacheRedFlagsCalculator: CalculatorDefinition = {
  id: 'headache-red-flags-snnoop10',
  name: 'Banderas Rojas en Cefalea — Lista SNNOOP10',
  shortName: 'Banderas Rojas (SNNOOP10)',
  primarySpecialty: 'neurologia',
  secondarySpecialties: ['urgencias', 'medicina-interna'],
  subcategory: 'diagnostico',
  keywords: [
    'banderas rojas',
    'red flags',
    'snnoop10',
    'snoop',
    'cefalea secundaria',
    'cefalea en trueno',
    'hsa',
    'meningitis',
    'arteritis',
    'papiledema',
    'ichd3',
    'migrana',
  ],
  description:
    'Lista clínica validada de 15 banderas rojas y naranjas (acrónimo SNNOOP10) para detectar cefaleas secundarias potencialmente graves antes de atribuir una cefalea primaria (ICHD-3).',
  clinicalIndication:
    'Tamizaje sistemático en urgencias y consulta externa de todo paciente que consulta por cefalea aguda, subaguda o con cambio de patrón.',
  validatedPopulation: 'Adultos y adolescentes evaluados por cefalea en atención primaria, consulta externa o urgencias (Do et al., Neurology 2019).',
  contraindications: [
    'La ausencia de criterios SNNOOP10 no sustituye la anamnesis completa ni el examen neurológico y fundoscópico.',
  ],
  limitations: [
    'SNNOOP10 es una herramienta de cribado de alta sensibilidad diseñada para orientar la solicitud de neuroimagen, punción lumbar o marcadores inflamatorios; cada bandera positiva tiene diferente grado de urgencia (inmediata vs. estudio ambulatorio preferente).',
  ],
  version: 'Do TP et al. — SNNOOP10 (Neurology 2019)',
  references: [
    {
      citation:
        'Do TP, Remmers A, Schytz HW, et al. Red and orange flags for secondary headaches in clinical practice: SNNOOP10 list. Neurology. 2019;92(3):134-144.',
      year: 2019,
    },
    {
      citation:
        'Headache Classification Committee of the International Headache Society (IHS). The International Classification of Headache Disorders, 3rd edition (ICHD-3). Cephalalgia. 2018;38(1):1-211.',
      year: 2018,
    },
  ],
  fields: SNNOOP_ITEMS.map((item) => item.field),
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(headacheRedFlagsCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const activeItems = SNNOOP_ITEMS.filter((item) => inputs[item.field.id] === true);
    const total = activeItems.length;
    const emergencyItems = activeItems.filter((item) => item.tier === 'emergency');
    const urgentItems = activeItems.filter((item) => item.tier === 'urgent');
    const overuseItems = activeItems.filter((item) => item.tier === 'overuse');

    let severity: SeverityLevel = 'normal';
    let riskClassification = 'Sin banderas rojas SNNOOP10 (0 / 15)';
    let clinicalInterpretation =
      'No se identifican signos de alarma SNNOOP10; mayor probabilidad de cefalea primaria. Aplicar criterios diagnósticos ICHD-3 junto con exploración neurológica normal.';
    const guidance: string[] = [];

    if (emergencyItems.length > 0 || total >= 2) {
      severity = 'critical';
      riskClassification = `ALERTA CRÍTICA — ${total} bandera(s) roja(s) SNNOOP10`;
      clinicalInterpretation =
        'Presencia de signos de alarma de alto riesgo vital o neurológico (o múltiples banderas simultáneas). Se requiere descartar cefalea secundaria grave de manera inmediata antes de diagnosticar cefalea primaria.';

      if (inputs.oOnsetSudden === true) {
        guidance.push('Inicio en trueno (O1): TC craneal simple urgente (máxima sensibilidad en < 6 h); si TC negativa y alta sospecha de HSA, punción lumbar (espectrofotometría/xantocromía) o angio-TC.');
      }
      if (inputs.nNeuroDeficit === true) {
        guidance.push('Déficit neurológico / debilidad (N2): Exploración neurológica completa (Cincinnati/FAST, NIHSS, MRC) y neuroimagen urgente (TC/RM + estudio vascular si inicio agudo).');
      }
      if (inputs.sSystemic === true || inputs.p9PathologyImmune === true) {
        guidance.push('Fiebre / síntomas sistémicos o inmunosupresión (S / P9): Hemocultivos, analítica y neuroimagen previa a punción lumbar si existe focalidad o papiledema; no demorar antimicrobianos empíricos si sospecha de meningitis.');
      }
      if (inputs.p4Papilledema === true) {
        guidance.push('Papiledema (P4): RM cerebral + venografía por RM/TC urgente para descartar masa intracraneal o trombosis venosa cerebral antes de cualquier punción lumbar.');
      }
      if (inputs.p6Pregnancy === true) {
        guidance.push('Embarazo / puerperio (P6): Medir TA y proteinuria de inmediato (descartar preeclampsia/eclampsia) y considerar RM/venografía sin contraste si sospecha de TVC o RCVS.');
      }
      if (inputs.p7PainfulEye === true) {
        guidance.push('Ojo doloroso con signos autonómicos (P7): Descartar glaucoma agudo (presión intraocular), disección carotídea (síndrome de Horner doloroso) o patología de seno cavernoso.');
      }
      if (inputs.p8Posttraumatic === true) {
        guidance.push('Postraumática (P8): Valorar TC craneal (hematoma subdural/epidural) y angio-TC si trauma cervical o signos focales.');
      }
      if (urgentItems.length > 0 && guidance.length === 0) {
        guidance.push('Múltiples banderas rojas concurrentes: realizar neuroimagen cerebral urgente/preferente y analítica dirigida según sospecha clínica.');
      }
    } else if (urgentItems.length > 0) {
      severity = 'high';
      riskClassification = `Alerta prioritaria — ${total} bandera(s) SNNOOP10`;
      clinicalInterpretation =
        'Signo de alarma subagudo o estructural que justifica estudio etiológico dirigido (neuroimagen y/o laboratorio) antes de asumir cefalea primaria.';
      if (inputs.oOlderAge === true) {
        guidance.push('Inicio > 50 años (O2): Solicitar VSG, PCR y hemograma para descartar arteritis de células gigantes (junto con neuroimagen craneal).');
      }
      if (inputs.nNeoplasm === true || inputs.p1PatternChange === true || inputs.p5Progressive === true) {
        guidance.push('Neoplasia previa / cambio de patrón / progresiva (N1, P1, P5): RM cerebral con contraste (o TC con contraste si RM no disponible) de forma preferente.');
      }
      if (inputs.p2Positional === true || inputs.p3Precipitated === true) {
        guidance.push('Posicional / Valsalva (P2, P3): RM cerebral con contraste (y columna si hipotensión de LCR) para descartar fosa posterior, Chiari o hipertensión/hipotensión intracraneal.');
      }
    } else if (overuseItems.length > 0) {
      severity = 'moderate';
      riskClassification = 'Bandera naranja farmacológica (P10 — 1 / 15)';
      clinicalInterpretation =
        'Uso excesivo de medicación aguda o inicio tras nuevo fármaco (bandera naranja): frecuente causa de cronificación de cefalea primaria (ICHD-3 8.2).';
      guidance.push(
        'Cuantificar días/mes de triptanes, ergóticos, opioides, combinados (≥ 10 d/mes) o analgésicos simples/AINEs (≥ 15 d/mes), planificar retirada progresiva e iniciar profilaxis si precisa.',
      );
    } else {
      guidance.push(
        'Con exploración neurológica y fondo de ojo normales, continuar la clasificación en «Criterios Diagnósticos ICHD-3 — Migraña y Cefaleas Primarias».',
      );
    }

    return {
      primaryResult: {
        label: 'Banderas rojas SNNOOP10 positivas',
        value: total,
        formattedValue: `${total} / 15`,
        unit: emergencyItems.length > 0 ? 'URGENTE' : total > 0 ? 'Estudio dirigido' : 'Negativo',
      },
      secondaryResults: [
        {
          label: 'Criterios activos',
          formattedValue: total > 0 ? activeItems.map((i) => i.code).join(', ') : 'Ninguno',
          unit: '',
        },
        ...(total > 0
          ? [
              {
                label: 'Sospechas clínicas principales',
                formattedValue: activeItems.map((i) => i.suspicion).slice(0, 3).join(' · '),
                unit: '',
              },
            ]
          : []),
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer:
        'Lista SNNOOP10 de apoyo clínico; nunca sustituye la exploración neurológica ni el criterio médico en urgencias.',
      formulaUsed: 'Conteo SNNOOP10 (15 ítems) con estratificación por prioridad diagnóstica (emergencia vs. estudio preferente vs. sobreuso)',
      inputsSummary: `SNNOOP10: ${total}/15 activos (${activeItems.map((i) => i.code).join(', ') || 'ninguno'})`,
    };
  },
};
