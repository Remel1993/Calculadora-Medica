import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const syndromeField: SelectFieldDef = {
  id: 'syndrome',
  label: 'Categoría ICHD-3 a evaluar',
  type: 'select',
  defaultValue: 'migraine_without_aura',
  options: [
    {
      value: 'migraine_without_aura',
      label: '1.1 / 1.3 Migraña sin aura y crónica',
      description: 'Incluye Migraña sin aura (1.1), Crónica (1.3) y Probable (1.5.1).',
    },
    {
      value: 'migraine_with_aura',
      label: '1.2 Migraña con aura',
      description: 'Típica (1.2.1), troncoencefálica (1.2.2), hemipléjica (1.2.3), retiniana (1.2.4) y probable (1.5.2).',
    },
    {
      value: 'tension_headache',
      label: '2. Cefalea de tipo tensional',
      description: 'Infrecuente (2.1), frecuente (2.2), crónica (2.3) y probable (2.4).',
    },
    {
      value: 'cluster_headache',
      label: '3.1 Cefalea en racimos (Cluster)',
      description: 'Cefalea trigémino-autonómica unilateral severa (3.1) y probable (3.5.1).',
    },
  ],
};

const redFlagsField: BooleanFieldDef = {
  id: 'redFlagsPresent',
  label: '¿Existen banderas rojas (SNNOOP10) o sospecha de cefalea secundaria?',
  helpText:
    'El último criterio de toda cefalea primaria ICHD-3 exige descartar otra causa («no mejor explicada por otro diagnóstico ICHD-3»).',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
};

// --- 1.1 Migraña sin aura ---
const attackCountField: SelectFieldDef = {
  id: 'attackCount',
  label: 'A. Número de ataques previos con características B–D',
  type: 'select',
  defaultValue: 'ge5',
  visibleWhen: (i) => i.syndrome === 'migraine_without_aura',
  options: [
    {
      value: 'ge5',
      label: '≥ 5 ataques previos',
      description: 'Cumple el criterio A definitivo de Migraña sin aura (ICHD-3 1.1).',
    },
    {
      value: '1to4',
      label: '1 a 4 ataques previos',
      description: 'Falla solo el criterio A; compatible con Migraña probable (1.5.1) si cumple B–D.',
    },
    {
      value: '0',
      label: 'Sin ataques típicos previos',
      description: 'No cumple criterio A.',
    },
  ],
};

const duration4to72hField: BooleanFieldDef = {
  id: 'duration4to72h',
  label: 'B. Episodios de 4 a 72 horas de duración (sin tratamiento o tratados sin éxito)',
  helpText: 'En < 18 años se acepta 2–72 h. Si un episodio dura > 72 h continuas, valorar Estado Migrañoso (1.4.1).',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: true,
  visibleWhen: (i) => i.syndrome === 'migraine_without_aura',
};

const cUnilateralField: BooleanFieldDef = {
  id: 'cUnilateral',
  label: 'C1. Localización unilateral (hemicraneal)',
  helpText: 'En niños y adolescentes puede ser bilateral.',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_without_aura',
};

const cPulsatileField: BooleanFieldDef = {
  id: 'cPulsatile',
  label: 'C2. Carácter pulsátil',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_without_aura',
};

const cModerateSevereField: BooleanFieldDef = {
  id: 'cModerateSevere',
  label: 'C3. Intensidad de dolor moderada o severa',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_without_aura',
};

const cAggravatedActivityField: BooleanFieldDef = {
  id: 'cAggravatedActivity',
  label: 'C4. Empeora con la actividad física habitual o obliga a evitarla',
  helpText: 'Por ejemplo, al caminar o subir escaleras.',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_without_aura',
};

const dNauseaVomitingField: BooleanFieldDef = {
  id: 'dNauseaVomiting',
  label: 'D1. Durante la cefalea: Náuseas y/o vómitos',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_without_aura',
};

const dPhotoPhonoField: BooleanFieldDef = {
  id: 'dPhotoPhono',
  label: 'D2. Durante la cefalea: Fotofobia Y fonofobia simultáneas',
  helpText: 'ICHD-3 1.1 exige ambas (fotofobia + fonofobia). Si solo hay una sin náuseas, clasifica como Migraña probable (1.5.1) cuando cumple A–C.',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_without_aura',
};

// --- 1.2 Migraña con aura ---
const auraAttacksField: SelectFieldDef = {
  id: 'auraAttacks',
  label: 'A. Número de ataques previos con síntomas de aura (B y C)',
  type: 'select',
  defaultValue: 'ge2',
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura',
  options: [
    {
      value: 'ge2',
      label: '≥ 2 ataques previos',
      description: 'Cumple el criterio A definitivo de Migraña con aura (ICHD-3 1.2).',
    },
    {
      value: '1',
      label: '1 ataque previo',
      description: 'Falla solo A; compatible con Migraña probable con aura (ICHD-3 1.5.2) si cumple B y C.',
    },
    {
      value: '0',
      label: 'Sin ataques previos de aura',
      description: 'No cumple criterio A.',
    },
  ],
};

const auraVisualField: BooleanFieldDef = {
  id: 'auraVisual',
  label: 'B1. Aura VISUAL completamente reversible',
  helpText: 'Espectros de fortificación, fosfenos, líneas en zigzag o escotoma.',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura',
};

const auraSensoryField: BooleanFieldDef = {
  id: 'auraSensory',
  label: 'B2. Aura SENSITIVA completamente reversible',
  helpText: 'Parestesias progresivas o hipoestesia en «marcha».',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura',
};

const auraSpeechField: BooleanFieldDef = {
  id: 'auraSpeech',
  label: 'B3. Aura del HABLA y/o LENGUAJE completamente reversible',
  helpText: 'Disfasia o parafasias transitorias.',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura',
};

const auraMotorField: BooleanFieldDef = {
  id: 'auraMotor',
  label: 'B4. Aura MOTORA — Debilidad motora reversible (Migraña Hemipléjica 1.2.3)',
  helpText:
    'ICHD-3 1.2.3 exige debilidad motora reversible acompañada de ≥ 1 síntoma visual, sensitivo o del lenguaje. Todo primer episodio motor agudo obliga a descartar ictus/AIT.',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura',
};

const familyHemiplegicField: BooleanFieldDef = {
  id: 'familyHemiplegic',
  label: 'Familiar de 1.º o 2.º grado con migraña + debilidad motora',
  helpText: 'Distingue Migraña Hemipléjica Familiar (1.2.3.1) de Esporádica (1.2.3.2).',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura' && i.auraMotor === true,
};

const motorAtypicalOrFirstField: BooleanFieldDef = {
  id: 'motorAtypicalOrFirst',
  label: '¿Es primer episodio motor, inicio brusco (< 5 min) o duración > 72 h?',
  helpText: 'Cualquiera de estas condiciones exige descartar evento vascular agudo.',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura' && i.auraMotor === true,
};

const auraBrainstemField: BooleanFieldDef = {
  id: 'auraBrainstem',
  label: 'B5. Aura TRONCOENCEFÁLICA (ICHD-3 1.2.2)',
  helpText: '≥ 2 de: disartria, vértigo, acúfenos, hipoacusia, diplopía, ataxia o disminución de conciencia (sin debilidad motora ni síntomas retinianos).',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura',
};

const auraRetinalField: BooleanFieldDef = {
  id: 'auraRetinal',
  label: 'B6. Aura RETINIANA monocular (ICHD-3 1.2.4)',
  helpText: 'Centelleos, escotoma o pérdida visual estrictamente monocular reversible.',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura',
};

const acGradual5Field: BooleanFieldDef = {
  id: 'acGradual5',
  label: 'C1. Al menos un síntoma del aura progresa gradualmente en ≥ 5 minutos',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura',
};

const acSuccessionField: BooleanFieldDef = {
  id: 'acSuccession',
  label: 'C2. Dos o más síntomas del aura ocurren en sucesión',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura',
};

const acDuration60Field: BooleanFieldDef = {
  id: 'acDuration60',
  label: 'C3. Cada síntoma individual del aura dura 5–60 minutos',
  helpText: 'Si concurren múltiples síntomas, la duración máxima aceptable es N × 60 min. El déficit motor en 1.2.3 puede durar hasta 72 h.',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura',
};

const acUnilateralField: BooleanFieldDef = {
  id: 'acUnilateral',
  label: 'C4. Al menos un síntoma del aura es unilateral',
  helpText: 'La afasia se considera siempre síntoma unilateral en ICHD-3.',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura',
};

const acPositiveField: BooleanFieldDef = {
  id: 'acPositive',
  label: 'C5. Al menos un síntoma del aura es positivo',
  helpText: 'Por ejemplo, destellos luminosos, líneas en zigzag o parestesias/hormigueo.',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura',
};

const acHeadache60Field: BooleanFieldDef = {
  id: 'acHeadache60',
  label: 'C6. El aura se acompaña de cefalea o es seguida por ella en ≤ 60 minutos',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: true,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura',
};

// --- Cronicidad y sobreuso ---
const chronicFrequencyField: BooleanFieldDef = {
  id: 'chronicFrequency',
  label: 'Cronicidad (ICHD-3 1.3): ≥ 15 días de cefalea/mes por > 3 meses con ≥ 8 días migrañosos/mes',
  helpText: 'Incluye días que cumplen criterios de migraña (1.1/1.2) o que responden a triptán/ergótico al inicio.',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) =>
    i.syndrome === 'migraine_without_aura' || i.syndrome === 'migraine_with_aura',
};

const medicationOveruseField: BooleanFieldDef = {
  id: 'medicationOveruse',
  label: 'Sobreuso analgésico concurrente (ICHD-3 8.2)',
  helpText: '≥ 10 d/mes de triptanes/opioides/ergóticos/combinados o ≥ 15 d/mes de AINEs/paracetamol durante > 3 meses.',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
  visibleWhen: (i) =>
    i.syndrome === 'migraine_without_aura' ||
    i.syndrome === 'migraine_with_aura' ||
    i.syndrome === 'tension_headache',
};

// --- 2. Cefalea tensional ---
const tthFrequencyField: SelectFieldDef = {
  id: 'tthFrequency',
  label: 'A. Frecuencia de episodios de cefalea tensional',
  type: 'select',
  defaultValue: 'ge10_1_14',
  visibleWhen: (i) => i.syndrome === 'tension_headache',
  options: [
    {
      value: 'ge10_lt1',
      label: '2.1 Episódica infrecuente',
      description: '≥ 10 episodios en < 1 día/mes (< 12 días/año).',
    },
    {
      value: 'ge10_1_14',
      label: '2.2 Episódica frecuente',
      description: '≥ 10 episodios en 1–14 días/mes durante > 3 meses.',
    },
    {
      value: 'ge15_gt3m',
      label: '2.3 Cefalea tensional crónica',
      description: '≥ 15 días/mes durante > 3 meses (≥ 180 días/año).',
    },
    {
      value: 'lt10',
      label: '< 10 episodios previos',
      description: 'Falla solo criterio A; evaluar Cefalea tensional probable (2.4) si cumple B–D.',
    },
  ],
};

const tthDurationField: BooleanFieldDef = {
  id: 'tthDuration',
  label: 'B. Duración del episodio de 30 minutos a 7 días (o continua en 2.3 crónica)',
  helpText: 'En la forma crónica (2.3) puede durar horas a días o ser continua.',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: true,
  visibleWhen: (i) => i.syndrome === 'tension_headache',
};

const tthBilateralField: BooleanFieldDef = {
  id: 'tthBilateral',
  label: 'C1. Localización bilateral',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'tension_headache',
};

const tthPressingField: BooleanFieldDef = {
  id: 'tthPressing',
  label: 'C2. Calidad opresiva o tensiva (no pulsátil)',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'tension_headache',
};

const tthMildModField: BooleanFieldDef = {
  id: 'tthMildMod',
  label: 'C3. Intensidad leve o moderada',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'tension_headache',
};

const tthNoAggravationField: BooleanFieldDef = {
  id: 'tthNoAggravation',
  label: 'C4. No empeora con la actividad física habitual',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'tension_headache',
};

const tthNoNauseaField: BooleanFieldDef = {
  id: 'tthNoNausea',
  label: 'D1. Sin náuseas moderadas/severas ni vómitos (en episódica, sin ninguna náusea)',
  helpText: 'En 2.1/2.2 se exige ausencia total de náuseas y vómitos; en 2.3 crónica se tolera náusea leve aislada si no hay fotofobia ni fonofobia.',
  type: 'boolean',
  trueLabel: 'Cumple',
  falseLabel: 'No cumple',
  defaultValue: true,
  visibleWhen: (i) => i.syndrome === 'tension_headache',
};

const tthPhotoPhonoMaxOneField: BooleanFieldDef = {
  id: 'tthPhotoPhonoMaxOne',
  label: 'D2. Máximo uno entre fotofobia o fonofobia (nunca ambas)',
  type: 'boolean',
  trueLabel: 'Cumple',
  falseLabel: 'No cumple',
  defaultValue: true,
  visibleWhen: (i) => i.syndrome === 'tension_headache',
};

// --- 3.1 Cefalea en racimos ---
const clusterAttacksField: BooleanFieldDef = {
  id: 'clusterAttacks',
  label: 'A. Al menos 5 ataques previos cumpliendo criterios B–D',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'cluster_headache',
};

const clusterPainField: BooleanFieldDef = {
  id: 'clusterPain',
  label: 'B. Dolor unilateral severo orbitario, supraorbitario y/o temporal de 15–180 min',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'cluster_headache',
};

const clusterAutonomicField: BooleanFieldDef = {
  id: 'clusterAutonomic',
  label: 'C1. ≥ 1 signo autonómico ipsilateral al dolor',
  helpText: 'Inyección conjuntival/lagrimeo, congestión nasal/rinorrea, edema palpebral, sudoración facial o miosis/ptosis.',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'cluster_headache',
};

const clusterRestlessnessField: BooleanFieldDef = {
  id: 'clusterRestlessness',
  label: 'C2. Sensación de inquietud o agitación motora durante la crisis',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'cluster_headache',
};

const clusterFreqField: BooleanFieldDef = {
  id: 'clusterFreq',
  label: 'D. Frecuencia entre 1 cada 2 días y 8 al día durante el brote',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'cluster_headache',
};

export const ichd3HeadacheCalculator: CalculatorDefinition = {
  id: 'ichd3-migraine-headache',
  name: 'Criterios Diagnósticos ICHD-3 — Migraña y Cefaleas Primarias',
  shortName: 'ICHD-3: Migraña y Cefaleas',
  primarySpecialty: 'neurologia',
  secondarySpecialties: ['medicina-interna', 'urgencias'],
  subcategory: 'diagnostico',
  keywords: [
    'ichd3',
    'ichd-3',
    'migrana',
    'migraña',
    'aura',
    'migrana hemiplejica',
    'migrana cronica',
    'cefalea',
    'cefalea tensional',
    'cefalea en racimos',
    'cluster',
    'dolor de cabeza',
    'debilidad motora',
  ],
  description:
    'Evaluación estructurada según la 3.ª Clasificación Internacional de Cefaleas (ICHD-3) para Migraña sin aura (1.1), con aura (1.2), crónica (1.3), Cefalea tensional (2), Cefalea en racimos (3.1) y formas probables (1.5.1, 1.5.2, 2.4, 3.5.1).',
  clinicalIndication:
    'Clasificación diagnóstica de cefaleas primarias en consulta externa, medicina interna, neurología y urgencias tras descartar signos de alarma (SNNOOP10).',
  validatedPopulation: 'Adultos y población pediátrica/adolescente (en < 18 años la duración de migraña sin aura puede ser 2–72 h).',
  contraindications: [
    'NUNCA diagnosticar una cefalea primaria si existen banderas rojas SNNOOP10 o sospecha de causa secundaria sin neuroimagen/estudio etiológico previo.',
    'En debilidad motora aguda de primera presentación (sospecha de migraña hemipléjica), descartar primero ictus/AIT agudo mediante protocolo de Código Ictus.',
  ],
  limitations: [
    'Según la ICHD-3, cuando un paciente cumple todos menos uno de los criterios diagnósticos (A–D) y no encaja en otra cefalea, se clasifica como forma PROBABLE (1.5.1, 1.5.2, 2.4 o 3.5.1).',
    'En migraña con aura hemipléjica (1.2.3) y aura del tronco encefálico (1.2.2), los triptanes y ergóticos están clásicamente contraindicados por riesgo teórico de vasoconstricción cerebral.',
    'Un mismo paciente puede cumplir simultáneamente criterios de Migraña Crónica (1.3) y Cefalea por Uso Excesivo de Medicación (8.2); ICHD-3 indica codificar ambos diagnósticos.',
  ],
  version: 'ICHD-3 (Cephalalgia 2018)',
  references: [
    {
      citation:
        'Headache Classification Committee of the International Headache Society (IHS). The International Classification of Headache Disorders, 3rd edition (ICHD-3). Cephalalgia. 2018;38(1):1-211.',
      year: 2018,
    },
    {
      citation: 'Ashina M. Migraine. N Engl J Med. 2020;383(19):1866-1876.',
      year: 2020,
    },
  ],
  fields: [
    syndromeField,
    redFlagsField,
    attackCountField,
    duration4to72hField,
    cUnilateralField,
    cPulsatileField,
    cModerateSevereField,
    cAggravatedActivityField,
    dNauseaVomitingField,
    dPhotoPhonoField,
    auraAttacksField,
    auraVisualField,
    auraSensoryField,
    auraSpeechField,
    auraMotorField,
    familyHemiplegicField,
    motorAtypicalOrFirstField,
    auraBrainstemField,
    auraRetinalField,
    acGradual5Field,
    acSuccessionField,
    acDuration60Field,
    acUnilateralField,
    acPositiveField,
    acHeadache60Field,
    chronicFrequencyField,
    tthFrequencyField,
    tthDurationField,
    tthBilateralField,
    tthPressingField,
    tthMildModField,
    tthNoAggravationField,
    tthNoNauseaField,
    tthPhotoPhonoMaxOneField,
    medicationOveruseField,
    clusterAttacksField,
    clusterPainField,
    clusterAutonomicField,
    clusterRestlessnessField,
    clusterFreqField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(ichd3HeadacheCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const syndrome = inputs.syndrome as
      | 'migraine_without_aura'
      | 'migraine_with_aura'
      | 'tension_headache'
      | 'cluster_headache';
    const redFlagsPresent = inputs.redFlagsPresent === true;
    const medicationOveruse = inputs.medicationOveruse === true;

    let code = 'No cumple';
    let primaryUnit = '';
    let title = 'No cumple criterios completos';
    let severity: SeverityLevel = 'info';
    let clinicalInterpretation = '';
    const guidance: string[] = [];
    const secondaryResults: { label: string; formattedValue: string; unit: string; note?: string }[] = [];
    let formulaUsed = '';
    let inputsSummary = '';

    if (syndrome === 'migraine_without_aura') {
      const attackCount = inputs.attackCount as 'ge5' | '1to4' | '0';
      const hasA = attackCount === 'ge5';
      const hasB = inputs.duration4to72h === true;
      const cCount = [
        inputs.cUnilateral === true,
        inputs.cPulsatile === true,
        inputs.cModerateSevere === true,
        inputs.cAggravatedActivity === true,
      ].filter(Boolean).length;
      const hasC = cCount >= 2;
      const hasD = inputs.dNauseaVomiting === true || inputs.dPhotoPhono === true;
      const isChronic = inputs.chronicFrequency === true;

      const missingCriteria = [
        !hasA ? (attackCount === '1to4' ? 'A (solo 1–4 ataques; requiere ≥ 5)' : 'A (sin ataques previos)') : '',
        !hasB ? 'B (duración 4–72 h)' : '',
        !hasC ? `C (solo ${cCount}/4; requiere ≥ 2/4)` : '',
        !hasD ? 'D (sin náuseas/vómitos ni foto+fonofobia)' : '',
      ].filter(Boolean);

      const metCount = [hasA, hasB, hasC, hasD].filter(Boolean).length;

      secondaryResults.push(
        { label: 'Criterio A (≥ 5 ataques)', formattedValue: hasA ? 'Cumple' : attackCount === '1to4' ? '1–4 ataques' : 'No cumple', unit: '' },
        { label: 'Criterio B (4–72 h)', formattedValue: hasB ? 'Cumple' : 'No cumple', unit: '' },
        { label: 'Criterio C (≥ 2/4)', formattedValue: `${cCount} / 4`, unit: hasC ? 'Cumple' : 'Insuf.' },
        { label: 'Criterio D (≥ 1/2)', formattedValue: hasD ? 'Cumple' : 'No cumple', unit: '' },
      );

      if (medicationOveruse) {
        secondaryResults.push({
          label: 'Comorbilidad medicamentosa',
          formattedValue: 'ICHD-3 8.2',
          unit: 'Sobreuso analgésico',
        });
      }

      if (redFlagsPresent) {
        code = 'Alerta 2.ª';
        primaryUnit = '(Descartar causa secundaria)';
        title = 'Prioridad: Descartar cefalea secundaria antes de asignar ICHD-3 1.1';
        severity = 'critical';
        clinicalInterpretation =
          'La presencia de banderas rojas SNNOOP10 o déficit neurológico impide confirmar el criterio E («no mejor explicada por otro diagnóstico ICHD-3») hasta completar estudio etiológico.';
        guidance.push(
          'Aplicar inmediatamente la herramienta «Banderas Rojas en Cefalea (SNNOOP10)» y definir neuroimagen urgente (TC/RM) o punción lumbar según hallazgos.',
        );
      } else if (metCount === 4) {
        if (isChronic) {
          code = 'ICHD-3 1.3';
          primaryUnit = medicationOveruse ? '+ 8.2 CUM' : '(Crónica)';
          title = medicationOveruse
            ? 'Migraña Crónica (1.3) + Cefalea por Uso Excesivo de Medicación (8.2)'
            : 'Migraña Crónica (ICHD-3 1.3)';
          severity = 'high';
          clinicalInterpretation =
            'Cumple criterios de migraña sin aura (1.1) con frecuencia ≥ 15 días/mes durante > 3 meses y ≥ 8 días/mes de características migrañosas.';
          guidance.push(
            'Indicar tratamiento preventivo (betabloqueantes, topiramato, amitriptilina, candesartán, anticuerpos anti-CGRP o toxina botulínica A según perfil clínico) y educación sobre desencadenantes.',
          );
          if (medicationOveruse) {
            guidance.push(
              'Abordar activamente el sobreuso de medicación aguda (ICHD-3 8.2) mediante plan de retirada gradual o puente terapéutico, ya que perpetúa la cronificación.',
            );
          }
        } else {
          code = 'ICHD-3 1.1';
          primaryUnit = '(Sin aura)';
          title = 'Migraña sin aura (ICHD-3 1.1)';
          severity = 'moderate';
          clinicalInterpretation = `Cumple todos los criterios ICHD-3: ≥ 5 ataques, duración 4–72 h, ${cCount}/4 características de dolor y síntomas autonómicos/neurovegetativos asociados.`;
          guidance.push(
            'Tratamiento agudo escalonado precoz (AINEs/paracetamol en crisis leves o triptanes/gepantes en moderadas-graves, asociando antiemético si precisa).',
            'Valorar profilaxis si presenta ≥ 4 días de migraña/mes o discapacidad funcional relevante.',
          );
        }
      } else if (metCount === 3 && attackCount !== '0') {
        code = 'ICHD-3 1.5.1';
        primaryUnit = '(Probable)';
        title = 'Migraña probable sin aura (ICHD-3 1.5.1)';
        severity = 'low';
        clinicalInterpretation = `Cumple 3 de los 4 criterios (todos menos uno: falta ${missingCriteria[0]}). Según ICHD-3 1.5.1, cuando se cumplen todos menos uno de los criterios A–D, corresponde clasificarla como Migraña probable sin aura.`;
        guidance.push(
          'Reevaluar con diario de cefaleas (por ejemplo, si el criterio B falló por alivio temprano con analgésicos/triptanes o si el criterio D falló por presentar solo fotofobia o fonofobia aislada).',
          'Si es el primer episodio intenso o de inicio súbito, descartar previamente causas secundarias.',
        );
      } else {
        code = 'No cumple 1.1';
        title = 'No cumple criterios de Migraña sin aura ni Migraña probable (1.5.1)';
        severity = 'info';
        clinicalInterpretation = `Faltan ≥ 2 criterios diagnósticos (${missingCriteria.join('; ')}).`;
        guidance.push(
          'Evaluar otros fenotipos ICHD-3 (p. ej. Cefalea de tipo tensional [2] o Migraña con aura [1.2]).',
        );
      }

      formulaUsed = 'ICHD-3 1.1: A(≥5 ataques) + B(4–72 h) + C(≥2/4) + D(≥1/2) + E | 1.5.1 Probable: cumple 3/4 de A–D';
      inputsSummary = `ICHD-3 1.1 · A:${attackCount} · B:${hasB ? 'S' : 'N'} · C:${cCount}/4 · D:${hasD ? 'S' : 'N'} · Crónica:${isChronic ? 'S' : 'N'}`;
    } else if (syndrome === 'migraine_with_aura') {
      const auraAttacks = inputs.auraAttacks as 'ge2' | '1' | '0';
      const hasA = auraAttacks === 'ge2';
      const hasVisual = inputs.auraVisual === true;
      const hasSensory = inputs.auraSensory === true;
      const hasSpeech = inputs.auraSpeech === true;
      const hasMotor = inputs.auraMotor === true;
      const hasBrainstem = inputs.auraBrainstem === true;
      const hasRetinal = inputs.auraRetinal === true;
      const hasAnyB = hasVisual || hasSensory || hasSpeech || hasMotor || hasBrainstem || hasRetinal;

      const cCount = [
        inputs.acGradual5 === true,
        inputs.acSuccession === true,
        inputs.acDuration60 === true,
        inputs.acUnilateral === true,
        inputs.acPositive === true,
        inputs.acHeadache60 === true,
      ].filter(Boolean).length;
      const hasC = cCount >= 3;
      const isChronic = inputs.chronicFrequency === true;
      const motorFirstOrAtypical = inputs.motorAtypicalOrFirst === true;
      const familyHemiplegic = inputs.familyHemiplegic === true;
      const hasConcomitantTypicalAura = hasVisual || hasSensory || hasSpeech;

      const modalities = [
        hasVisual ? 'Visual' : '',
        hasSensory ? 'Sensitivo' : '',
        hasSpeech ? 'Lenguaje' : '',
        hasMotor ? 'Motor' : '',
        hasBrainstem ? 'Troncoencefálico' : '',
        hasRetinal ? 'Retiniano' : '',
      ].filter(Boolean);

      const metCount = [hasA, hasAnyB, hasC].filter(Boolean).length;

      secondaryResults.push(
        { label: 'Criterio A (≥ 2 ataques)', formattedValue: hasA ? 'Cumple' : auraAttacks === '1' ? '1 ataque' : 'No cumple', unit: '' },
        { label: 'Modalidades de aura (B)', formattedValue: modalities.length > 0 ? modalities.join(', ') : 'Ninguna', unit: '' },
        { label: 'Criterio C (≥ 3/6)', formattedValue: `${cCount} / 6`, unit: hasC ? 'Cumple' : 'Insuf.' },
      );

      if (redFlagsPresent || (hasMotor && motorFirstOrAtypical)) {
        code = 'Alerta Ictus';
        primaryUnit = hasMotor ? '(Regla 1.2.3)' : '(Descartar 2.ª)';
        title = hasMotor
          ? 'URGENTE: Descartar Ictus / AIT antes de diagnosticar Migraña Hemipléjica (1.2.3)'
          : 'Prioridad: Descartar causa secundaria / evento vascular antes de ICHD-3 1.2';
        severity = 'critical';
        clinicalInterpretation = hasMotor
          ? 'La presencia de debilidad motora aguda (primer episodio, inicio brusco < 5 min o duración > 72 h) o banderas rojas es un IMITADOR DE ICTUS de alto riesgo. La migraña hemipléjica es un diagnóstico de exclusión tras neuroimagen.'
          : 'Existen banderas rojas SNNOOP10 asociadas a síntomas neurológicos focales; se requiere exclusión urgente de AIT, ictus, disección arterial o crisis comicial.';
        guidance.push(
          'Activar valoración neurológica urgente (aplicar Cincinnati/FAST y NIHSS) y realizar TC/RM craneal + estudio vascular antes de atribuir el déficit a aura migrañosa.',
          'CONTRAINDICADO administrar triptanes o ergóticos mientras exista déficit motor o sospecha de migraña hemipléjica / aura troncoencefálica.',
        );
      } else if (metCount === 3) {
        if (hasMotor) {
          const subtypeCode = familyHemiplegic ? 'ICHD-3 1.2.3.1' : 'ICHD-3 1.2.3.2';
          code = hasConcomitantTypicalAura ? subtypeCode : 'ICHD-3 1.5.2';
          primaryUnit = hasConcomitantTypicalAura ? '(Hemipléjica)' : '(Probable)';
          title = !hasConcomitantTypicalAura
            ? 'Migraña probable con aura hemipléjica (ICHD-3 1.5.2 — falta aura visual/sensitiva/lenguaje)'
            : familyHemiplegic
              ? 'Migraña Hemipléjica Familiar (ICHD-3 1.2.3.1)'
              : 'Migraña Hemipléjica Esporádica (ICHD-3 1.2.3.2)';
          severity = 'high';
          clinicalInterpretation = hasConcomitantTypicalAura
            ? 'Cumple criterios de Migraña con aura incluyendo debilidad motora completamente reversible y aura visual/sensitiva/del lenguaje (diagnóstico de exclusión tras haber descartado AIT/ictus).'
            : 'Presenta debilidad motora reversible sin síntoma visual, sensitivo o del lenguaje acompañante; estrictamente ICHD-3 1.2.3 requiere ambos componentes, por lo que requiere extrema cautela para descartar patología vascular/estructural.';
          guidance.push(
            'Evitar triptanes y derivados ergóticos (contraindicación clásica en migraña hemipléjica); emplear AINEs, antieméticos o antagonistas CGRP según criterio especializado.',
            'Si aparece un déficit motor nuevo, más prolongado (> 72 h) o diferente al patrón habitual, reevaluar inmediatamente con neuroimagen.',
          );
        } else if (hasBrainstem && !hasRetinal) {
          code = 'ICHD-3 1.2.2';
          primaryUnit = '(Troncoencéfalo)';
          title = 'Migraña con aura del tronco encefálico (ICHD-3 1.2.2)';
          severity = 'high';
          clinicalInterpretation =
            'Aura con ≥ 2 síntomas de fosa posterior sin debilidad motora ni síntomas retinianos (disartria, vértigo, diplopía, ataxia o alteración de conciencia). Requiere exclusión de isquemia vertebrobasilar.';
          guidance.push(
            'Evitar triptanes y ergóticos por precaución vascular en aura troncoencefálica; valorar profilaxis si episodios frecuentes.',
          );
        } else if (hasRetinal) {
          code = 'ICHD-3 1.2.4';
          primaryUnit = '(Retiniana)';
          title = 'Migraña retiniana (ICHD-3 1.2.4)';
          severity = 'high';
          clinicalInterpretation =
            'Aura visual estrictamente monocular completamente reversible; requiere descartar amaurosis fugax, arteritis de células gigantes (> 50 años) y patología ocular.';
          guidance.push(
            'Confirmar que el fenómeno fue verdaderamente monocular (no hemianopsia homónima) y completar estudio neuro-oftalmológico/vascular si es de inicio reciente.',
          );
        } else if (isChronic) {
          code = 'ICHD-3 1.3';
          primaryUnit = medicationOveruse ? '+ 8.2 CUM' : '(Crónica c/ aura)';
          title = medicationOveruse
            ? 'Migraña Crónica con aura (1.3) + Sobreuso de medicación (8.2)'
            : 'Migraña Crónica con aura (ICHD-3 1.3)';
          severity = 'high';
          clinicalInterpretation =
            'Cumple criterios de migraña con aura típica (1.2.1) junto con ≥ 15 días de cefalea/mes por > 3 meses y ≥ 8 días migrañosos/mes.';
          guidance.push(
            'Iniciar tratamiento preventivo y plan de retirada de sobreuso analgésico si aplica.',
          );
        } else {
          const withHeadache = inputs.acHeadache60 === true;
          code = withHeadache ? 'ICHD-3 1.2.1.1' : 'ICHD-3 1.2.1.2';
          primaryUnit = withHeadache ? '(Con cefalea)' : '(Sin cefalea)';
          title = withHeadache
            ? 'Migraña con aura típica acompañada de cefalea (ICHD-3 1.2.1.1)'
            : 'Aura típica sin cefalea (ICHD-3 1.2.1.2)';
          severity = 'moderate';
          clinicalInterpretation = `Cumple criterios de aura típica (${modalities.join(', ')}) con ${cCount}/6 características temporales y espaciales (ICHD-3 1.2).`;
          guidance.push(
            'Nota clínica: en mujeres con migraña con aura están contraindicados los anticonceptivos orales combinados con estrógenos por incremento del riesgo de ictus isquémico.',
            'En aura típica sin cefalea en pacientes > 50 años o con factores de riesgo vascular, descartar AIT mediante estudio neurovascular.',
          );
        }
      } else if (metCount === 2 && hasAnyB && auraAttacks !== '0') {
        code = 'ICHD-3 1.5.2';
        primaryUnit = '(Probable)';
        title = 'Migraña probable con aura (ICHD-3 1.5.2)';
        severity = hasMotor ? 'high' : 'low';
        clinicalInterpretation = !hasA
          ? 'Cumple criterios B y C de aura, pero solo documenta 1 episodio previo (requiere ≥ 2 para 1.2 definitivo).'
          : `Cumple ≥ 2 ataques con síntoma de aura (${modalities.join(', ')}), pero solo reúne ${cCount}/6 características en el criterio C (requiere ≥ 3/6 para 1.2 definitivo).`;
        guidance.push(
          hasC
            ? 'Vigilar evolución; en primer episodio de aura atípica o motora descartar AIT/ictus y crisis epiléptica focal.'
            : 'Si los síntomas focales fueron de instauración súbita (< 5 min) o atípicos, descartar AIT/ictus o crisis epiléptica focal mediante neuroimagen.',
        );
      } else {
        code = 'No cumple 1.2';
        title = 'No cumple criterios de Migraña con aura ni Probable (1.5.2)';
        severity = 'info';
        clinicalInterpretation = `Faltan criterios: ${[
          !hasA ? 'A (≥2 ataques)' : '',
          !hasAnyB ? 'B (modalidad reversible de aura)' : '',
          !hasC ? `C (${cCount}/6; requiere ≥3/6)` : '',
        ]
          .filter(Boolean)
          .join('; ')}.`;
        guidance.push('Si los síntomas focales fueron de instauración súbita sin progresión gradual, sospechar AIT/ictus o crisis epiléptica focal.');
      }

      formulaUsed = 'ICHD-3 1.2: A(≥2 ataques) + B(síntoma reversible) + C(≥3/6) + D | 1.5.2 Probable: cumple B + (A o C)';
      inputsSummary = `ICHD-3 1.2 · A:${auraAttacks} · B:[${modalities.join('+') || 'Ninguno'}] · C:${cCount}/6`;
    } else if (syndrome === 'tension_headache') {
      const freq = inputs.tthFrequency as 'ge10_lt1' | 'ge10_1_14' | 'ge15_gt3m' | 'lt10';
      const hasA = freq !== 'lt10';
      const hasB = inputs.tthDuration === true;
      const cCount = [
        inputs.tthBilateral === true,
        inputs.tthPressing === true,
        inputs.tthMildMod === true,
        inputs.tthNoAggravation === true,
      ].filter(Boolean).length;
      const hasC = cCount >= 2;
      const hasD = inputs.tthNoNausea === true && inputs.tthPhotoPhonoMaxOne === true;
      const metCount = [hasA, hasB, hasC, hasD].filter(Boolean).length;

      const missingTth = [
        !hasA ? 'A (< 10 episodios)' : '',
        !hasB ? 'B (duración)' : '',
        !hasC ? `C (${cCount}/4; requiere ≥ 2/4)` : '',
        !hasD ? 'D (náuseas/vómitos o foto+fonofobia simultáneas)' : '',
      ].filter(Boolean);

      secondaryResults.push(
        { label: 'Criterio A (Frecuencia)', formattedValue: hasA ? 'Cumple' : '< 10 episodios', unit: '' },
        { label: 'Criterio B (Duración)', formattedValue: hasB ? 'Cumple' : 'No cumple', unit: '' },
        { label: 'Criterio C (≥ 2/4)', formattedValue: `${cCount} / 4`, unit: hasC ? 'Cumple' : 'Insuf.' },
        { label: 'Criterio D (Sin náusea; ≤1 foto/fono)', formattedValue: hasD ? 'Cumple' : 'No cumple', unit: '' },
      );

      if (redFlagsPresent) {
        code = 'Alerta 2.ª';
        primaryUnit = '(Descartar causa secundaria)';
        title = 'Banderas rojas presentes: No diagnosticar Cefalea Tensional sin descartar causa secundaria';
        severity = 'critical';
        clinicalInterpretation =
          'Especialmente en cefalea tensional de inicio > 50 años o progresiva, descartar arteritis de células gigantes, masa intracraneal o hipertensión intracraneal.';
        guidance.push('Aplicar protocolo SNNOOP10 y solicitar estudios de imagen/VSG-PCR según edad y clínica.');
      } else if (metCount === 4) {
        if (freq === 'ge10_lt1') {
          code = 'ICHD-3 2.1';
          primaryUnit = '(Infrecuente)';
          title = 'Cefalea de tipo tensional episódica infrecuente (ICHD-3 2.1)';
          severity = 'low';
        } else if (freq === 'ge10_1_14') {
          code = 'ICHD-3 2.2';
          primaryUnit = '(Frecuente)';
          title = 'Cefalea de tipo tensional episódica frecuente (ICHD-3 2.2)';
          severity = 'low';
        } else {
          code = 'ICHD-3 2.3';
          primaryUnit = medicationOveruse ? '+ 8.2 CUM' : '(Crónica)';
          title = medicationOveruse
            ? 'Cefalea Tensional Crónica (2.3) + Sobreuso de medicación (8.2)'
            : 'Cefalea de tipo tensional crónica (ICHD-3 2.3)';
          severity = 'moderate';
        }
        clinicalInterpretation =
          'Cumple criterios de cefalea bilateral opresiva leve-moderada sin agravamiento por actividad física ni cortejo migrañoso completo.';
        guidance.push(
          freq === 'ge15_gt3m'
            ? 'Valorar profilaxis (p. ej., amitriptilina) y manejo no farmacológico (fisioterapia cervical, relajación), evitando uso frecuente de analgésicos.'
            : 'Analgésicos simples en episodios puntuales y medidas de higiene postural/estrés.',
        );
      } else if (metCount === 3) {
        code = 'ICHD-3 2.4';
        primaryUnit = '(Probable)';
        title = 'Cefalea de tipo tensional probable (ICHD-3 2.4)';
        severity = 'low';
        clinicalInterpretation = `Cumple 3 de 4 criterios (todos menos uno: falta ${missingTth[0]}). Según ICHD-3 2.4, cuando cumple todos menos uno de A–D y no cumple Migraña (1.1), se clasifica como Cefalea de tipo tensional probable.`;
        guidance.push(
          'Seguimiento clínico; si existen dudas con Migraña probable (1.5.1), evaluar presencia de síntomas vegetativos o agravamiento por actividad.',
        );
      } else {
        code = 'No cumple 2';
        title = 'No cumple criterios de Cefalea Tensional ni Probable (2.4)';
        severity = 'info';
        clinicalInterpretation = `Faltan ≥ 2 criterios (${missingTth.join('; ')}). Si existen náuseas, pulsabilidad, unilateralidad o fotofobia+fonofobia, reevaluar Migraña (ICHD-3 1.1).`;
      }

      formulaUsed = 'ICHD-3 2: A(frecuencia) + B(30 min–7 d) + C(≥2/4) + D | 2.4 Probable: cumple 3/4 de A–D';
      inputsSummary = `ICHD-3 2 · Frec:${freq} · B:${hasB ? 'S' : 'N'} · C:${cCount}/4 · D:${hasD ? 'S' : 'N'}`;
    } else {
      const hasA = inputs.clusterAttacks === true;
      const hasB = inputs.clusterPain === true;
      const hasAuto = inputs.clusterAutonomic === true;
      const hasRest = inputs.clusterRestlessness === true;
      const hasC = hasAuto || hasRest;
      const hasD = inputs.clusterFreq === true;
      const metCount = [hasA, hasB, hasC, hasD].filter(Boolean).length;

      const missingCluster = [
        !hasA ? 'A (≥ 5 ataques)' : '',
        !hasB ? 'B (dolor unilateral severo 15–180 min)' : '',
        !hasC ? 'C (signo autonómico ipsilateral o agitación)' : '',
        !hasD ? 'D (frecuencia 1/2 d – 8/d)' : '',
      ].filter(Boolean);

      secondaryResults.push(
        { label: 'Criterio A (≥ 5 ataques)', formattedValue: hasA ? 'Cumple' : 'No cumple', unit: '' },
        { label: 'Criterio B (15–180 min)', formattedValue: hasB ? 'Cumple' : 'No cumple', unit: '' },
        { label: 'Criterio C (Auton. o agitación)', formattedValue: hasC ? 'Cumple' : 'No cumple', unit: '' },
        { label: 'Criterio D (1/2 d – 8/d)', formattedValue: hasD ? 'Cumple' : 'No cumple', unit: '' },
      );

      if (redFlagsPresent) {
        code = 'Alerta 2.ª';
        primaryUnit = '(Descartar causa secundaria)';
        title = 'Banderas rojas presentes en cefalea trigémino-autonómica';
        severity = 'critical';
        clinicalInterpretation =
          'El ojo doloroso con signos autonómicos (P7 en SNNOOP10) obliga a descartar disección carotídea, lesión del seno cavernoso, patología hipofisaria o glaucoma agudo.';
        guidance.push('Realizar RM cerebral con énfasis en silla turca/seno cavernoso y estudio vascular (angio-RM/angio-TC) de forma prioritaria.');
      } else if (metCount === 4) {
        code = 'ICHD-3 3.1';
        primaryUnit = '(Racimos)';
        title = 'Cefalea en racimos (ICHD-3 3.1)';
        severity = 'high';
        clinicalInterpretation =
          'Cumple criterios ICHD-3 de cefalea trigémino-autonómica: dolor orbitario/temporal unilateral severo de 15–180 min con síntomas autonómicos ipsilaterales y/o agitación.';
        guidance.push(
          'Tratamiento agudo de primera línea: Oxígeno al 100 % a alto flujo (12–15 L/min durante 15–20 min con mascarilla reservorio) y/o sumatriptán subcutáneo/intranasal.',
          'Incluso con diagnóstico típico, las guías recomiendan RM cerebral inicial (con estudio selar/vascular) para descartar racimos secundarios; valorar terapia puente (corticoides) y preventivo (verapamilo con ECG basal).',
        );
      } else if (metCount === 3) {
        code = 'ICHD-3 3.5.1';
        primaryUnit = '(Probable)';
        title = 'Cefalea en racimos probable (ICHD-3 3.5.1)';
        severity = 'moderate';
        clinicalInterpretation = `Cumple 3 de 4 criterios (todos menos uno: falta ${missingCluster[0]}). Según ICHD-3 3.5.1, clasifica como Cefalea en racimos probable.`;
        guidance.push(
          'Solicitar RM cerebral con silla turca/seno cavernoso para descartar causas secundarias y vigilar evolución del brote.',
        );
      } else {
        code = 'No cumple 3.1';
        title = 'No cumple criterios de Cefalea en racimos ni Probable (3.5.1)';
        severity = 'info';
        clinicalInterpretation =
          `Faltan ≥ 2 criterios (${missingCluster.join('; ')}). Si las crisis son más cortas (2–30 min) y más frecuentes (> 5/día), valorar Hemicránea Paroxística (3.2) o SUNCT/SUNA (3.3).`;
      }

      formulaUsed = 'ICHD-3 3.1: A(≥5) + B(15–180 min) + C(autonómico o inquietud) + D(1/2d – 8/d) | 3.5.1 Probable: cumple 3/4';
      inputsSummary = `ICHD-3 3.1 · A:${hasA ? 'S' : 'N'} · B:${hasB ? 'S' : 'N'} · C:${hasC ? 'S' : 'N'} · D:${hasD ? 'S' : 'N'}`;
    }

    return {
      primaryResult: {
        label: 'Clasificación ICHD-3',
        value: syndrome === 'migraine_without_aura' ? 1 : syndrome === 'migraine_with_aura' ? 2 : syndrome === 'tension_headache' ? 3 : 4,
        formattedValue: code,
        unit: primaryUnit,
      },
      secondaryResults,
      severity,
      riskClassification: title,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer:
        'La ICHD-3 es una clasificación clínica diagnóstica: toda cefalea de inicio reciente o con signos de alarma (SNNOOP10) exige excluir etiología secundaria.',
      formulaUsed,
      inputsSummary,
    };
  },
};
