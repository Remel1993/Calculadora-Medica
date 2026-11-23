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
    { value: 'migraine_without_aura', label: '1.1 / 1.3 Migraña sin aura y Migraña crónica' },
    { value: 'migraine_with_aura', label: '1.2 Migraña con aura (Típica, Troncoencefálica o Hemipléjica)' },
    { value: 'tension_headache', label: '2. Cefalea de tipo tensional (2.1 – 2.3)' },
    { value: 'cluster_headache', label: '3.1 Cefalea en racimos (Cluster / Trigémino-autonómica)' },
  ],
};

const redFlagsField: BooleanFieldDef = {
  id: 'redFlagsPresent',
  label: '¿Existen banderas rojas (SNNOOP10), déficit neurológico persistente o sospecha de cefalea secundaria?',
  helpText:
    'El criterio final de toda cefalea primaria ICHD-3 exige: «No mejor explicada por otro diagnóstico de la ICHD-3». Ante duda, aplicar la lista SNNOOP10.',
  type: 'boolean',
  trueLabel: 'Sí (requiere descartar causa secundaria)',
  falseLabel: 'No (banderas rojas descartadas)',
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
    { value: 'ge5', label: '≥ 5 ataques previos (cumple criterio A de 1.1)' },
    { value: '1to4', label: '1 a 4 ataques previos (compatible con 1.5.1 Migraña probable)' },
    { value: '0', label: 'Sin ataques con estas características' },
  ],
};

const duration4to72hField: BooleanFieldDef = {
  id: 'duration4to72h',
  label: 'B. Episodios de cefalea de 4 a 72 horas de duración (2–72 h en < 18 años) sin tratamiento o tratados sin éxito',
  helpText: 'Si un ataque típico supera 72 horas continuas sin remisión, valorar Estado Migrañoso (ICHD-3 1.4.1).',
  type: 'boolean',
  trueLabel: 'Sí (4–72 h)',
  falseLabel: 'No',
  defaultValue: true,
  visibleWhen: (i) => i.syndrome === 'migraine_without_aura',
};

const cUnilateralField: BooleanFieldDef = {
  id: 'cUnilateral',
  label: 'C1. Localización unilateral (hemicraneal; puede ser bilateral en niños/adolescentes)',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_without_aura',
};

const cPulsatileField: BooleanFieldDef = {
  id: 'cPulsatile',
  label: 'C2. Carácter pulsátil (latidos)',
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
  label: 'C4. Empeora con la actividad física habitual o condiciona su evitación (p. ej., caminar o subir escaleras)',
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
  helpText: 'ICHD-3 1.1 exige la presencia conjunta de fotofobia y fonofobia para cumplir D2.',
  type: 'boolean',
  trueLabel: 'Ambas presentes',
  falseLabel: 'No ambas',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_without_aura',
};

// --- 1.2 Migraña con aura ---
const auraAttacksField: SelectFieldDef = {
  id: 'auraAttacks',
  label: 'A. Número de ataques previos con síntomas de aura (criterios B y C)',
  type: 'select',
  defaultValue: 'ge2',
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura',
  options: [
    { value: 'ge2', label: '≥ 2 ataques previos (cumple criterio A de 1.2)' },
    { value: '1', label: '1 ataque previo (compatible con 1.5.2 Migraña probable con aura)' },
    { value: '0', label: 'Sin ataques de aura' },
  ],
};

const auraVisualField: BooleanFieldDef = {
  id: 'auraVisual',
  label: 'B1. Síntoma de aura VISUAL completamente reversible (espectros de fortificación, fosfenos, escotoma)',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura',
};

const auraSensoryField: BooleanFieldDef = {
  id: 'auraSensory',
  label: 'B2. Síntoma de aura SENSITIVO completamente reversible (parestesias progresivas / hipoestesia en «marcha»)',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura',
};

const auraSpeechField: BooleanFieldDef = {
  id: 'auraSpeech',
  label: 'B3. Síntoma de aura del HABLA y/o LENGUAJE completamente reversible (disfasia / parafasias)',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura',
};

const auraMotorField: BooleanFieldDef = {
  id: 'auraMotor',
  label: 'B4. Síntoma de aura MOTOR — Debilidad motora completamente reversible (ICHD-3 1.2.3 Migraña Hemipléjica)',
  helpText:
    'ATENCIÓN: Todo primer episodio de debilidad motora aguda debe evaluarse primero como ictus/AIT agudo (TC/RM urgente, Cincinnati/FAST y NIHSS).',
  type: 'boolean',
  trueLabel: 'Presente (debilidad motora)',
  falseLabel: 'Ausente',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura',
};

const familyHemiplegicField: BooleanFieldDef = {
  id: 'familyHemiplegic',
  label: 'Antecedente en ≥ 1 familiar de 1.º o 2.º grado con ataques de migraña con debilidad motora',
  type: 'boolean',
  trueLabel: 'Sí (Familiar — 1.2.3.1)',
  falseLabel: 'No (Esporádica — 1.2.3.2)',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura' && i.auraMotor === true,
};

const motorAtypicalOrFirstField: BooleanFieldDef = {
  id: 'motorAtypicalOrFirst',
  label: '¿Es el primer episodio de debilidad motora, inicio brusco (< 5 min) o dura > 72 horas?',
  type: 'boolean',
  trueLabel: 'Sí (alerta vascular / ictus)',
  falseLabel: 'No (episodios previos típicos reversibles)',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura' && i.auraMotor === true,
};

const auraBrainstemField: BooleanFieldDef = {
  id: 'auraBrainstem',
  label: 'B5. Aura TRONCOENCEFÁLICA (≥ 2 de: disartria, vértigo, acúfenos, hipoacusia, diplopía, ataxia, alteración conciencia; sin debilidad motora)',
  type: 'boolean',
  trueLabel: 'Presente (≥ 2 síntomas)',
  falseLabel: 'Ausente',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura',
};

const auraRetinalField: BooleanFieldDef = {
  id: 'auraRetinal',
  label: 'B6. Aura RETINIANA (fenómenos visuales estrictamente monoculares confirmados — centelleos, escotoma o ceguera reversible)',
  type: 'boolean',
  trueLabel: 'Presente (monocular)',
  falseLabel: 'Ausente',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura',
};

const acGradual5Field: BooleanFieldDef = {
  id: 'acGradual5',
  label: 'C1. Al menos un síntoma del aura se desarrolla gradualmente en ≥ 5 minutos',
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
  label: 'C3. Cada síntoma individual dura 5–60 minutos (síntoma motor en 1.2.3 suele durar < 72 h)',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura',
};

const acUnilateralField: BooleanFieldDef = {
  id: 'acUnilateral',
  label: 'C4. Al menos un síntoma del aura es unilateral (la afasia se considera siempre unilateral)',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura',
};

const acPositiveField: BooleanFieldDef = {
  id: 'acPositive',
  label: 'C5. Al menos un síntoma del aura es positivo (destellos, líneas en zigzag, hormigueo)',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura',
};

const acHeadache60Field: BooleanFieldDef = {
  id: 'acHeadache60',
  label: 'C6. El aura se acompaña de cefalea o es seguida por cefalea en ≤ 60 minutos',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No (aura sin cefalea)',
  defaultValue: true,
  visibleWhen: (i) => i.syndrome === 'migraine_with_aura',
};

// --- Cronicidad y sobreuso (compartido por ambos subtipos de migraña) ---
const chronicFrequencyField: BooleanFieldDef = {
  id: 'chronicFrequency',
  label: 'Cronicidad (ICHD-3 1.3): ≥ 15 días de cefalea/mes durante > 3 meses con ≥ 8 días/mes de migraña (o respuesta a triptán/ergótico)',
  type: 'boolean',
  trueLabel: 'Sí (≥ 15 d/mes y ≥ 8 d migraña)',
  falseLabel: 'No (episódica)',
  defaultValue: false,
  visibleWhen: (i) =>
    i.syndrome === 'migraine_without_aura' || i.syndrome === 'migraine_with_aura',
};

const medicationOveruseField: BooleanFieldDef = {
  id: 'medicationOveruse',
  label: 'Sobreuso analgésico (ICHD-3 8.2): ≥ 10 d/mes de triptanes/opioides/ergóticos/combinados o ≥ 15 d/mes de AINEs/paracetamol > 3 meses',
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
    { value: 'ge10_lt1', label: '≥ 10 episodios previos en < 1 día/mes (< 12 días/año) → 2.1 Infrecuente' },
    { value: 'ge10_1_14', label: '≥ 10 episodios en 1–14 días/mes durante > 3 meses → 2.2 Frecuente' },
    { value: 'ge15_gt3m', label: '≥ 15 días/mes durante > 3 meses (≥ 180 días/año) → 2.3 Crónica' },
    { value: 'lt10', label: '< 10 episodios previos en total (valorar 2.4 Probable)' },
  ],
};

const tthDurationField: BooleanFieldDef = {
  id: 'tthDuration',
  label: 'B. Duración del episodio de 30 minutos a 7 días (o horas a continua en 2.3 crónica)',
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
  label: 'C4. No empeora con la actividad física habitual (caminar o subir escaleras)',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'tension_headache',
};

const tthNoNauseaField: BooleanFieldDef = {
  id: 'tthNoNausea',
  label: 'D1. Sin náuseas ni vómitos (en 2.3 crónica se tolera náusea leve aislada sin fotofobia ni fonofobia)',
  type: 'boolean',
  trueLabel: 'Sin náuseas/vómitos',
  falseLabel: 'Presenta náuseas/vómitos',
  defaultValue: true,
  visibleWhen: (i) => i.syndrome === 'tension_headache',
};

const tthPhotoPhonoMaxOneField: BooleanFieldDef = {
  id: 'tthPhotoPhonoMaxOne',
  label: 'D2. Máximo uno de: fotofobia o fonofobia (nunca ambas simultáneas)',
  type: 'boolean',
  trueLabel: 'Ninguna o solo 1',
  falseLabel: 'Ambas presentes',
  defaultValue: true,
  visibleWhen: (i) => i.syndrome === 'tension_headache',
};

// --- 3.1 Cefalea en racimos ---
const clusterAttacksField: BooleanFieldDef = {
  id: 'clusterAttacks',
  label: 'A. Al menos 5 ataques previos cumpliendo criterios B–D',
  type: 'boolean',
  trueLabel: 'Sí (≥ 5 ataques)',
  falseLabel: 'No (< 5 ataques)',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'cluster_headache',
};

const clusterPainField: BooleanFieldDef = {
  id: 'clusterPain',
  label: 'B. Dolor unilateral severo o muy severo orbitario, supraorbitario y/o temporal de 15–180 min sin tratamiento',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'cluster_headache',
};

const clusterAutonomicField: BooleanFieldDef = {
  id: 'clusterAutonomic',
  label: 'C1. ≥ 1 signo autonómico ipsilateral (inyección conjuntival/lagrimeo, congestión nasal/rinorrea, edema palpebral, sudoración facial, miosis/ptosis)',
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
  label: 'D. Frecuencia entre 1 ataque cada 2 días y 8 ataques al día durante más de la mitad del brote activo',
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
    'Evaluación estructurada según la 3.ª Clasificación Internacional de Cefaleas (ICHD-3) para Migraña sin aura (1.1), Migraña con aura —típica, troncoencefálica y hemipléjica con debilidad motora— (1.2), Migraña crónica (1.3), Cefalea tensional (2) y Cefalea en racimos (3.1).',
  clinicalIndication:
    'Clasificación diagnóstica de cefaleas primarias en consulta externa, medicina interna, neurología y urgencias tras descartar signos de alarma (SNNOOP10).',
  validatedPopulation: 'Adultos y población pediátrica/adolescente (en < 18 años la duración de migraña sin aura puede ser 2–72 h).',
  contraindications: [
    'NUNCA diagnosticar una cefalea primaria si existen banderas rojas SNNOOP10 o sospecha de causa secundaria sin neuroimagen/estudio etiológico previo.',
    'En debilidad motora aguda de primera presentación (sospecha de migraña hemipléjica), descartar primero ictus/AIT agudo mediante protocolo de Código Ictus.',
  ],
  limitations: [
    'En migraña con aura hemipléjica (1.2.3) y aura del tronco encefálico (1.2.2), los triptanes y derivados ergóticos están clásicamente contraindicados por riesgo teórico de vasoconstricción cerebral.',
    'Un mismo paciente puede cumplir simultáneamente criterios de Migraña Crónica (1.3) y Cefalea por Uso Excesivo de Medicación (8.2); ICHD-3 indica codificar ambos diagnósticos.',
  ],
  version: 'ICHD-3 (International Headache Society, Cephalalgia 2018)',
  references: [
    {
      citation:
        'Headache Classification Committee of the International Headache Society (IHS). The International Classification of Headache Disorders, 3rd edition (ICHD-3). Cephalalgia. 2018;38(1):1-211.',
      year: 2018,
    },
    {
      citation:
        'Ashina M. Migraine. N Engl J Med. 2020;383(19):1866-1876.',
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

    let code = 'No concluyente';
    let title = 'No cumple criterios completos';
    let severity: SeverityLevel = 'info';
    let clinicalInterpretation = '';
    const guidance: string[] = [];
    const secondaryResults: { label: string; formattedValue: string; unit: string; note?: string }[] = [];
    let formulaUsed = '';
    let inputsSummary = '';

    if (syndrome === 'migraine_without_aura') {
      const attackCount = inputs.attackCount as 'ge5' | '1to4' | '0';
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

      secondaryResults.push(
        { label: 'Criterio B (Duración 4–72 h)', formattedValue: hasB ? 'Cumple' : 'No cumple', unit: '' },
        { label: 'Criterio C (Características ≥ 2/4)', formattedValue: `${cCount} / 4`, unit: hasC ? 'Cumple' : 'Insuficiente' },
        { label: 'Criterio D (Síntomas asociados ≥ 1/2)', formattedValue: hasD ? 'Cumple' : 'No cumple', unit: '' },
      );

      if (medicationOveruse) {
        secondaryResults.push({
          label: 'Comorbilidad medicamentosa',
          formattedValue: 'ICHD-3 8.2 Probable',
          unit: 'Sobreuso analgésico',
        });
      }

      if (redFlagsPresent) {
        code = 'Descartar Secundaria';
        title = 'Prioridad: Descartar cefalea secundaria antes de asignar ICHD-3 1.1';
        severity = 'critical';
        clinicalInterpretation =
          'La presencia de banderas rojas SNNOOP10 o déficit neurológico impide confirmar el criterio E («no mejor explicada por otro diagnóstico ICHD-3») hasta completar estudio etiológico.';
        guidance.push(
          'Aplicar inmediatamente la herramienta «Banderas Rojas en Cefalea (SNNOOP10)» y definir neuroimagen urgente (TC/RM) o punción lumbar según hallazgos.',
        );
      } else if (hasB && hasC && hasD && attackCount === 'ge5') {
        if (isChronic) {
          code = 'ICHD-3 1.3';
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
          title = 'Migraña sin aura (ICHD-3 1.1)';
          severity = 'moderate';
          clinicalInterpretation = `Cumple todos los criterios ICHD-3: ≥ 5 ataques, duración 4–72 h, ${cCount}/4 características de dolor y síntomas autonómicos/neurovegetativos asociados.`;
          guidance.push(
            'Tratamiento agudo escalonado precoz (AINEs/paracetamol en crisis leves o triptanes/gepantes en moderadas-graves, asociando antiemético si precisa).',
            'Valorar profilaxis si presenta ≥ 4 días de migraña/mes o discapacidad funcional relevante.',
          );
        }
      } else if (hasB && hasC && hasD && attackCount === '1to4') {
        code = 'ICHD-3 1.5.1';
        title = 'Migraña probable sin aura (ICHD-3 1.5.1)';
        severity = 'low';
        clinicalInterpretation =
          'Cumple características clínicas B, C y D, pero solo documenta 1–4 episodios (se requieren ≥ 5 para migraña sin aura definitiva).';
        guidance.push(
          'Reevaluar evolución con diario de cefaleas; si es el primer episodio intenso de inicio súbito, descartar previamente causas secundarias.',
        );
      } else {
        code = 'No cumple 1.1';
        title = 'No cumple criterios completos de Migraña sin aura';
        severity = 'info';
        clinicalInterpretation = `Criterios faltantes: ${[
          attackCount === '0' ? 'A (ataques)' : '',
          !hasB ? 'B (4–72 h)' : '',
          !hasC ? 'C (≥2/4 características)' : '',
          !hasD ? 'D (náuseas o foto+fonofobia)' : '',
        ]
          .filter(Boolean)
          .join(', ')}.`;
        guidance.push(
          'Evaluar otros fenotipos ICHD-3 (p. ej. Cefalea de tipo tensional [2] o Migraña con aura [1.2]).',
        );
      }

      formulaUsed = 'ICHD-3 1.1: A(≥5 ataques) + B(4–72 h) + C(≥2/4) + D(≥1/2) + E(sin causa secundaria)';
      inputsSummary = `ICHD-3 1.1 · Ataques:${attackCount} · B:${hasB ? 'S' : 'N'} · C:${cCount}/4 · D:${hasD ? 'S' : 'N'} · Crónica:${isChronic ? 'S' : 'N'}`;
    } else if (syndrome === 'migraine_with_aura') {
      const auraAttacks = inputs.auraAttacks as 'ge2' | '1' | '0';
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

      const modalities = [
        hasVisual ? 'Visual' : '',
        hasSensory ? 'Sensitivo' : '',
        hasSpeech ? 'Lenguaje' : '',
        hasMotor ? 'Motor (debilidad)' : '',
        hasBrainstem ? 'Troncoencefálico' : '',
        hasRetinal ? 'Retiniano' : '',
      ].filter(Boolean);

      secondaryResults.push(
        { label: 'Modalidades de aura (Criterio B)', formattedValue: modalities.length > 0 ? modalities.join(', ') : 'Ninguna', unit: '' },
        { label: 'Criterio C (Características ≥ 3/6)', formattedValue: `${cCount} / 6`, unit: hasC ? 'Cumple' : 'Insuficiente' },
      );

      if (redFlagsPresent || (hasMotor && motorFirstOrAtypical)) {
        code = 'ALERTA VASCULAR / 1.2.3';
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
      } else if (hasAnyB && hasC && (auraAttacks === 'ge2' || auraAttacks === '1')) {
        const isProbable = auraAttacks === '1';
        if (hasMotor) {
          const subtypeCode = familyHemiplegic ? 'ICHD-3 1.2.3.1' : 'ICHD-3 1.2.3.2';
          code = isProbable ? 'ICHD-3 1.5.2 (Hemipléjica)' : subtypeCode;
          title = isProbable
            ? 'Migraña probable con aura hemipléjica (1.5.2)'
            : familyHemiplegic
              ? 'Migraña Hemipléjica Familiar (ICHD-3 1.2.3.1)'
              : 'Migraña Hemipléjica Esporádica (ICHD-3 1.2.3.2)';
          severity = 'high';
          clinicalInterpretation =
            'Cumple criterios de Migraña con aura incluyendo debilidad motora completamente reversible (diagnóstico de exclusión tras haber descartado AIT/ictus, malformación vascular o canalopatías alternativas en episodios previos).';
          guidance.push(
            'Evitar triptanes y derivados ergóticos (contraindicación clásica en migraña hemipléjica); emplear AINEs, antieméticos o antagonistas CGRP según criterio especializado.',
            'Si aparece un déficit motor nuevo, más prolongado (> 72 h) o diferente al patrón habitual, reevaluar inmediatamente con neuroimagen.',
          );
        } else if (hasBrainstem) {
          code = isProbable ? 'ICHD-3 1.5.2' : 'ICHD-3 1.2.2';
          title = isProbable
            ? 'Migraña probable con aura troncoencefálica'
            : 'Migraña con aura del tronco encefálico (ICHD-3 1.2.2)';
          severity = 'high';
          clinicalInterpretation =
            'Aura con ≥ 2 síntomas de fosa posterior sin debilidad motora (disartria, vértigo, diplopía, ataxia o alteración de conciencia). Requiere exclusión de isquemia vertebrobasilar.';
          guidance.push(
            'Evitar triptanes y ergóticos por precaución vascular en aura troncoencefálica; valorar profilaxis si episodios frecuentes.',
          );
        } else if (hasRetinal) {
          code = isProbable ? 'ICHD-3 1.5.2' : 'ICHD-3 1.2.4';
          title = 'Migraña retiniana (ICHD-3 1.2.4)';
          severity = 'high';
          clinicalInterpretation =
            'Aura visual estrictamente monocular completamente reversible; requiere descartar amaurosis fugax, arteritis de células gigantes (> 50 años) y patología ocular.';
          guidance.push(
            'Confirmar que el fenómeno fue verdaderamente monocular (no hemianopsia homónima) y completar estudio neuro-oftalmológico/vascular si es de inicio reciente.',
          );
        } else if (isChronic && !isProbable) {
          code = 'ICHD-3 1.3';
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
          code = isProbable ? 'ICHD-3 1.5.2' : withHeadache ? 'ICHD-3 1.2.1.1' : 'ICHD-3 1.2.1.2';
          title = isProbable
            ? 'Migraña probable con aura (ICHD-3 1.5.2)'
            : withHeadache
              ? 'Migraña con aura típica acompañada de cefalea (ICHD-3 1.2.1.1)'
              : 'Aura típica sin cefalea (ICHD-3 1.2.1.2)';
          severity = 'moderate';
          clinicalInterpretation = `Cumple criterios de aura típica (${modalities.join(', ')}) con ${cCount}/6 características temporales y espaciales (ICHD-3 1.2).`;
          guidance.push(
            'Nota clínica: en mujeres con migraña con aura están contraindicados los anticonceptivos orales combinados con estrógenos por incremento del riesgo de ictus isquémico.',
            'En aura típica sin cefalea en pacientes > 50 años o con factores de riesgo vascular, descartar AIT mediante estudio neurovascular.',
          );
        }
      } else {
        code = 'No cumple 1.2';
        title = 'No cumple criterios completos de Migraña con aura';
        severity = 'info';
        clinicalInterpretation = `Faltan criterios: ${[
          auraAttacks === '0' ? 'A (≥2 ataques)' : '',
          !hasAnyB ? 'B (modalidad reversible de aura)' : '',
          !hasC ? 'C (≥3/6 características de aura)' : '',
        ]
          .filter(Boolean)
          .join(', ')}.`;
        guidance.push('Si los síntomas focales fueron de instauración súbita (segundos) sin progresión gradual, sospechar AIT/ictus o crisis epiléptica focal.');
      }

      formulaUsed = 'ICHD-3 1.2: A(≥2 ataques) + B(síntoma reversible) + C(≥3/6 características graduales/unilaterales) + D';
      inputsSummary = `ICHD-3 1.2 · Ataques:${auraAttacks} · B:[${modalities.join('+') || 'Ninguno'}] · C:${cCount}/6`;
    } else if (syndrome === 'tension_headache') {
      const freq = inputs.tthFrequency as 'ge10_lt1' | 'ge10_1_14' | 'ge15_gt3m' | 'lt10';
      const hasB = inputs.tthDuration === true;
      const cCount = [
        inputs.tthBilateral === true,
        inputs.tthPressing === true,
        inputs.tthMildMod === true,
        inputs.tthNoAggravation === true,
      ].filter(Boolean).length;
      const hasC = cCount >= 2;
      const hasD = inputs.tthNoNausea === true && inputs.tthPhotoPhonoMaxOne === true;

      secondaryResults.push(
        { label: 'Criterio B (Duración)', formattedValue: hasB ? 'Cumple' : 'No cumple', unit: '' },
        { label: 'Criterio C (≥ 2/4 características)', formattedValue: `${cCount} / 4`, unit: hasC ? 'Cumple' : 'Insuficiente' },
        { label: 'Criterio D (Sin náuseas/vómitos; ≤1 foto/fono)', formattedValue: hasD ? 'Cumple' : 'No cumple', unit: '' },
      );

      if (redFlagsPresent) {
        code = 'Descartar Secundaria';
        title = 'Banderas rojas presentes: No diagnosticar Cefalea Tensional sin descartar causa secundaria';
        severity = 'critical';
        clinicalInterpretation =
          'Especialmente en cefalea tensional de inicio > 50 años o progresiva, descartar arteritis de células gigantes, masa intracraneal o hipertensión intracraneal.';
        guidance.push('Aplicar protocolo SNNOOP10 y solicitar estudios de imagen/VSG-PCR según edad y clínica.');
      } else if (hasB && hasC && hasD) {
        if (freq === 'ge10_lt1') {
          code = 'ICHD-3 2.1';
          title = 'Cefalea de tipo tensional episódica infrecuente (ICHD-3 2.1)';
          severity = 'low';
        } else if (freq === 'ge10_1_14') {
          code = 'ICHD-3 2.2';
          title = 'Cefalea de tipo tensional episódica frecuente (ICHD-3 2.2)';
          severity = 'low';
        } else if (freq === 'ge15_gt3m') {
          code = 'ICHD-3 2.3';
          title = medicationOveruse
            ? 'Cefalea Tensional Crónica (2.3) + Sobreuso de medicación (8.2)'
            : 'Cefalea de tipo tensional crónica (ICHD-3 2.3)';
          severity = 'moderate';
        } else {
          code = 'ICHD-3 2.4';
          title = 'Cefalea de tipo tensional probable (ICHD-3 2.4)';
          severity = 'low';
        }
        clinicalInterpretation =
          'Cumple criterios de cefalea bilateral opresiva leve-moderada sin agravamiento por actividad física ni cortejo migrañoso completo.';
        guidance.push(
          freq === 'ge15_gt3m'
            ? 'Valorar profilaxis (p. ej., amitriptilina) y manejo no farmacológico (fisioterapia cervical, relajación), evitando uso frecuente de analgésicos.'
            : 'Analgésicos simples en episodios puntuales y medidas de higiene postural/estrés.',
        );
      } else {
        code = 'No cumple 2';
        title = 'No cumple criterios completos de Cefalea Tensional';
        severity = 'info';
        clinicalInterpretation =
          'Si existen náuseas, pulsabilidad, unilateralidad o fotofobia+fonofobia, reevaluar criterios de Migraña (ICHD-3 1.1).';
      }

      formulaUsed = 'ICHD-3 2: A(frecuencia) + B(30 min–7 d) + C(≥2/4: bilateral, opresiva, leve-mod, no empeora actividad) + D';
      inputsSummary = `ICHD-3 2 · Frec:${freq} · B:${hasB ? 'S' : 'N'} · C:${cCount}/4 · D:${hasD ? 'S' : 'N'}`;
    } else {
      // 3.1 Cluster Headache
      const hasA = inputs.clusterAttacks === true;
      const hasB = inputs.clusterPain === true;
      const hasAuto = inputs.clusterAutonomic === true;
      const hasRest = inputs.clusterRestlessness === true;
      const hasC = hasAuto || hasRest;
      const hasD = inputs.clusterFreq === true;

      secondaryResults.push(
        { label: 'Criterio A (≥ 5 ataques)', formattedValue: hasA ? 'Cumple' : 'No cumple', unit: '' },
        { label: 'Criterio B (Dolor severo 15–180 min)', formattedValue: hasB ? 'Cumple' : 'No cumple', unit: '' },
        { label: 'Criterio C (Autonómico o agitación)', formattedValue: hasC ? 'Cumple' : 'No cumple', unit: '' },
        { label: 'Criterio D (Frecuencia 1/2 d – 8/d)', formattedValue: hasD ? 'Cumple' : 'No cumple', unit: '' },
      );

      if (redFlagsPresent) {
        code = 'Descartar Secundaria';
        title = 'Banderas rojas presentes en cefalea trigémino-autonómica';
        severity = 'critical';
        clinicalInterpretation =
          'El ojo doloroso con signos autonómicos (P7 en SNNOOP10) obliga a descartar disección carotídea, lesión del seno cavernoso, patología hipofisaria o glaucoma agudo.';
        guidance.push('Realizar RM cerebral con énfasis en silla turca/seno cavernoso y estudio vascular (angio-RM/angio-TC) de forma prioritaria.');
      } else if (hasA && hasB && hasC && hasD) {
        code = 'ICHD-3 3.1';
        title = 'Cefalea en racimos (ICHD-3 3.1)';
        severity = 'high';
        clinicalInterpretation =
          'Cumple criterios ICHD-3 de cefalea trigémino-autonómica: dolor orbitario/temporal unilateral severo de 15–180 min con síntomas autonómicos ipsilaterales y/o agitación.';
        guidance.push(
          'Tratamiento agudo de primera línea: Oxígeno al 100 % a alto flujo (12–15 L/min durante 15–20 min con mascarilla reservorio) y/o sumatriptán subcutáneo/intranasal.',
          'Incluso con diagnóstico típico, las guías recomiendan RM cerebral inicial (con estudio selar/vascular) para descartar racimos secundarios; valorar terapia puente (corticoides) y preventivo (verapamilo con ECG basal).',
        );
      } else {
        code = 'No cumple 3.1';
        title = 'No cumple criterios completos de Cefalea en racimos';
        severity = 'info';
        clinicalInterpretation =
          'Si las crisis son más cortas (2–30 min) y mucho más frecuentes (> 5/día), valorar Hemicránea Paroxística (3.2) o SUNCT/SUNA (3.3).';
      }

      formulaUsed = 'ICHD-3 3.1: A(≥5) + B(unilateral severo 15–180 min) + C(autonómico o inquietud) + D(1/2d – 8/d)';
      inputsSummary = `ICHD-3 3.1 · A:${hasA ? 'S' : 'N'} · B:${hasB ? 'S' : 'N'} · C:${hasC ? 'S' : 'N'} · D:${hasD ? 'S' : 'N'}`;
    }

    return {
      primaryResult: {
        label: 'Clasificación ICHD-3',
        value: syndrome === 'migraine_without_aura' ? 1 : syndrome === 'migraine_with_aura' ? 2 : syndrome === 'tension_headache' ? 3 : 4,
        formattedValue: code,
        unit: '',
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
