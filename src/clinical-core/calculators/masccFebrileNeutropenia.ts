import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const burdenField: SelectFieldDef = {
  id: 'diseaseBurden',
  label: '1. Carga clínica de enfermedad por la neutropenia febril',
  type: 'select',
  defaultValue: 'mild',
  options: [
    { value: 'mild', label: 'Asintomático o síntomas leves (+5 pts)', points: 5 },
    { value: 'moderate', label: 'Síntomas moderados (+3 pts)', points: 3 },
    { value: 'severe', label: 'Síntomas graves o paciente moribundo (0 pts)', points: 0 },
  ],
};

const noHypotensionField: BooleanFieldDef = {
  id: 'noHypotension',
  label: '2. Sin hipotensión arterial (PAS ≥ 90 mmHg) (+5 pts)',
  type: 'boolean',
  defaultValue: true,
  pointsWhenTrue: 5,
};

const noCopdField: BooleanFieldDef = {
  id: 'noCopd',
  label: '3. Sin Enfermedad Pulmonar Obstructiva Crónica (EPOC) activa (+4 pts)',
  type: 'boolean',
  defaultValue: true,
  pointsWhenTrue: 4,
};

const solidOrNoFungalField: BooleanFieldDef = {
  id: 'solidOrNoFungal',
  label: '4. Tumor sólido O neoplasia hematológica sin infección fúngica previa (+4 pts)',
  type: 'boolean',
  defaultValue: true,
  pointsWhenTrue: 4,
};

const noDehydrationField: BooleanFieldDef = {
  id: 'noDehydration',
  label: '5. Sin deshidratación que requiera líquidos IV (+3 pts)',
  type: 'boolean',
  defaultValue: true,
  pointsWhenTrue: 3,
};

const outpatientField: BooleanFieldDef = {
  id: 'outpatientOnset',
  label: '6. Inicio ambulatorio de la fiebre (no hospitalizado al inicio) (+3 pts)',
  type: 'boolean',
  defaultValue: true,
  pointsWhenTrue: 3,
};

const ageLt60Field: BooleanFieldDef = {
  id: 'ageUnder60',
  label: '7. Edad < 60 años (+2 pts)',
  type: 'boolean',
  defaultValue: true,
  pointsWhenTrue: 2,
};

export const masccFebrileNeutropeniaCalculator: CalculatorDefinition = {
  id: 'mascc-febrile-neutropenia',
  name: 'Índice de Riesgo MASCC en Neutropenia Febril Oncológica',
  shortName: 'MASCC (Neutropenia Febril)',
  primarySpecialty: 'oncologia',
  secondarySpecialties: ['hematologia', 'infectologia', 'urgencias', 'medicina-interna'],
  subcategory: 'gravedad',
  keywords: [
    'mascc',
    'neutropenia febril',
    'fiebre',
    'quimioterapia',
    'urgencia oncologica',
    'ran',
    'ceftazidima',
    'cefepima',
    'oncologia',
  ],
  description:
    'Estratificación validada del riesgo de complicaciones médicas graves en pacientes adultos con neutropenia febril post-quimioterapia (puntuación 0–26).',
  clinicalIndication:
    'Evaluación inicial en Urgencias u Oncología de pacientes con fiebre (≥ 38.3 °C única o ≥ 38.0 °C sostenida ≥ 1 h) y neutropenia (RAN < 500 cél/µL o < 1,000 con caída prevista < 500).',
  validatedPopulation: 'Adultos ≥ 16–18 años con cáncer y neutropenia febril (tumores sólidos y hematológicos).',
  contraindications: [
    'No utilizar en población pediátrica ni para retrasar la primera dosis de antibiótico empírico en paciente inestable o séptico.',
  ],
  limitations: [
    'Un MASCC ≥ 21 NO autoriza automáticamente el alta si existe disfunción orgánica aguda, neumonía, infección de catéter, imposibilidad de tolerar vía oral, neutropenia prolongada prevista (> 7 días) o falta de soporte domiciliario 24 h.',
    'En tumores sólidos aparentemente estables con MASCC ≥ 21, NCCN/ESMO sugieren complementar con criterios CISNE antes de optar por manejo ambulatorio.',
  ],
  version: 'Klastersky et al. (J Clin Oncol 2000) · NCCN / ESMO / IDSA',
  references: [
    {
      citation:
        'Klastersky J, Paesmans M, Rubenstein EB, et al. The Multinational Association for Supportive Care in Cancer risk index: A multinational scoring system for identifying low-risk febrile neutropenic cancer patients. J Clin Oncol. 2000;18(16):3038-3051.',
      year: 2000,
    },
    {
      citation:
        'Taplitz RA, Kennedy EB, Bow EJ, et al. Outpatient Management of Fever and Neutropenia in Adults Treated for Malignancy: ASCO and IDSA Clinical Practice Guideline Update. J Clin Oncol. 2018;36(14):1443-1453.',
      year: 2018,
    },
  ],
  fields: [
    burdenField,
    noHypotensionField,
    noCopdField,
    solidOrNoFungalField,
    noDehydrationField,
    outpatientField,
    ageLt60Field,
  ],
  calculate(inputs: CalculatorInputsState) {
    const errors = validateCalculatorInputs(masccFebrileNeutropeniaCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors.map((e) => e.message).join(' '));
    }

    const burden = String(inputs.diseaseBurden ?? 'mild');
    const burdenPts = burdenField.options.find((o) => o.value === burden)?.points ?? 0;

    const score =
      burdenPts +
      (inputs.noHypotension ? 5 : 0) +
      (inputs.noCopd ? 4 : 0) +
      (inputs.solidOrNoFungal ? 4 : 0) +
      (inputs.noDehydration ? 3 : 0) +
      (inputs.outpatientOnset ? 3 : 0) +
      (inputs.ageUnder60 ? 2 : 0);

    const lowRisk = score >= 21;
    const severity: SeverityLevel = lowRisk ? 'moderate' : 'critical';

    return {
      primaryResult: {
        label: 'Puntuación MASCC',
        value: score,
        formattedValue: `${score} / 26`,
        unit: 'pts',
      },
      secondaryResults: [
        {
          label: 'Categoría de riesgo',
          formattedValue: lowRisk ? 'Bajo riesgo (≥ 21)' : 'Alto riesgo (< 21)',
          unit: '',
        },
        {
          label: 'Mortalidad / complicación grave esperada',
          formattedValue: lowRisk ? '< 5 % complicaciones / ~1 % mortalidad' : '> 20–30 % complicaciones graves',
          unit: '',
        },
      ],
      severity,
      riskClassification: lowRisk
        ? 'Bajo Riesgo de Complicaciones Graves (MASCC ≥ 21)'
        : 'ALTO RIESGO en Neutropenia Febril (MASCC < 21)',
      clinicalInterpretation: lowRisk
        ? `MASCC ${score}/26 (≥ 21 puntos): bajo riesgo de complicaciones médicas graves. Tras hemocultivos, exploración completa, observación inicial (≥ 4 h) y confirmación de ausencia de criterios clínicos de exclusión (CISNE, mucositis grave o barreras sociales), puede valorarse terapia oral ambulatoria supervisada.`
        : `MASCC ${score}/26 (< 21 puntos): ALTO RIESGO de sepsis grave, choque y mortalidad. Requiere hospitalización inmediata, toma de hemocultivos (periféricos + catéter si aplica) e inicio de antibiótico IV antipseudomónico en ≤ 60 minutos.`,
      guidance: lowRisk
        ? [
            'Extraer 2 sets de hemocultivos (periférico y de catéter central si existe), EGO/urocultivo y radiografía de tórax si síntomas respiratorios.',
            'Si elegible para manejo ambulatorio tras observación: pauta oral estándar (Ciprofloxacino 500–750 mg c/12 h + Amoxicilina-clavulánico 875/125 mg c/8–12 h, si no recibió profilaxis con fluoroquinolonas) con reevaluación obligatoria a las 48–72 h.',
          ]
        : [
            'URGENCIA ONCOLÓGICA (puerta-aguja ≤ 60 min): Cefepima 2 g IV c/8 h, Piperacilina-tazobactam 4.5 g IV c/6 h o Meropenem 1 g IV c/8 h.',
            'Añadir Vancomicina solo si sospecha de infección de catéter, piel/partes blandas, neumonía, colonización previa por SARM o inestabilidad hemodinámica.',
          ],
      guidanceDisclaimer:
        'La neutropenia febril es una emergencia médica; ante cualquier signo de sepsis (lactato elevado, hipotensión, taquipnea o confusión), iniciar soporte y antibiótico IV inmediato sin esperar el recuento final de neutrófilos.',
      formulaUsed:
        'MASCC = Carga sintomática (0/3/5) + Sin hipotensión (5) + Sin EPOC (4) + Tumor sólido/sin micosis previa (4) + Sin deshidratación IV (3) + Ambulatorio (3) + Edad < 60 a (2)',
      inputsSummary: `MASCC=${score}/26 (${lowRisk ? 'Bajo riesgo' : 'Alto riesgo'})`,
    };
  },
};
