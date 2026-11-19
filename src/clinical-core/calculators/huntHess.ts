import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const gradeField: SelectFieldDef = {
  id: 'grade',
  label: 'Presentación clínica en hemorragia subaracnoidea (HSA)',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '1', label: 'Grado I — Asintomático o cefalea mínima y rigidez nucal leve', points: 1 },
    { value: '2', label: 'Grado II — Cefalea moderada a intensa, rigidez nucal, sin déficit salvo parálisis de par craneal', points: 2 },
    { value: '3', label: 'Grado III — Somnolencia, confusión o déficit neurológico focal leve', points: 3 },
    { value: '4', label: 'Grado IV — Estupor, hemiparesia moderada a grave o rigidez de descerebración incipiente', points: 4 },
    { value: '5', label: 'Grado V — Coma profundo, rigidez de descerebración, aspecto moribundo', points: 5 },
  ],
};

export const huntHessCalculator: CalculatorDefinition = {
  id: 'hunt-hess',
  name: 'Escala de Hunt y Hess (Hemorragia Subaracnoidea)',
  shortName: 'Hunt y Hess',
  primarySpecialty: 'neurologia',
  secondarySpecialties: ['urgencias'],
  subcategory: 'gravedad',
  keywords: ['hunt', 'hess', 'hsa', 'hemorragia subaracnoidea', 'aneurisma'],
  description:
    'Clasificación clínica clásica (Grados I–V) de la gravedad neurológica y mortalidad estimada en la hemorragia subaracnoidea aneurismática.',
  clinicalIndication:
    'Estratificación clínica inicial al ingreso en pacientes con HSA espontánea para estimar pronóstico y riesgo perioperatorio.',
  validatedPopulation: 'Adultos con hemorragia subaracnoidea aneurismática confirmada.',
  contraindications: [
    'No utilizar en hemorragia intraparenquimatosa primaria (usar ICH Score) ni en hematoma subdural/epidural traumático.',
  ],
  limitations: [
    'La publicación original de 1968 sugiere sumar 1 grado ante enfermedad sistémica grave (HTA severa, diabetes, aterosclerosis, EPOC) o vasoespasmo angiográfico grave.',
    'Las guías actuales suelen complementarla con la escala WFNS (World Federation of Neurosurgical Societies) basada en Glasgow, por ser menos subjetiva.',
  ],
  version: 'Hunt WE & Hess RM (J Neurosurg 1968)',
  references: [
    {
      citation: 'Hunt WE, Hess RM. Surgical risk as related to time of intervention in the repair of intracranial aneurysms. J Neurosurg. 1968;28(1):14-20.',
      year: 1968,
    },
  ],
  fields: [gradeField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(huntHessCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const grade = Number(inputs.grade);
    const data: Record<number, { roman: string; survival: string; mortality: string; sev: SeverityLevel; interp: string }> = {
      1: {
        roman: 'I',
        survival: '≈ 70 – 90 %',
        mortality: '≈ 1 – 10 % (moderna)',
        sev: 'low',
        interp: 'Buen grado clínico inicial; candidato a aseguramiento aneurismático precoz.',
      },
      2: {
        roman: 'II',
        survival: '≈ 60 – 85 %',
        mortality: '≈ 5 – 15 %',
        sev: 'low',
        interp: 'Grado favorable con cefalea intensa/meningismo; priorizar exclusión aneurismática temprana y profilaxis de vasoespasmo.',
      },
      3: {
        roman: 'III',
        survival: '≈ 50 – 70 %',
        mortality: '≈ 15 – 25 %',
        sev: 'moderate',
        interp: 'Compromiso del estado de alerta o focalidad leve; riesgo intermedio-alto de complicaciones (hidrocefalia, vasoespasmo).',
      },
      4: {
        roman: 'IV',
        survival: '≈ 20 – 40 %',
        mortality: '≈ 40 – 60 %',
        sev: 'high',
        interp: 'Grado clínico desfavorable (estupor/hemiparesia); requiere manejo en neurocríticos y valorar drenaje ventricular si hidrocefalia.',
      },
      5: {
        roman: 'V',
        survival: '≈ 10 %',
        mortality: '≈ 70 – 90 %',
        sev: 'critical',
        interp: 'Coma profundo con mortalidad muy elevada; estabilización neurocrítica inmediata y valoración individualizada por neurocirugía.',
      },
    };

    const item = data[grade] ?? data[1];

    return {
      primaryResult: {
        label: 'Grado Hunt y Hess',
        value: grade,
        formattedValue: `Grado ${item.roman}`,
        unit: 'de V',
      },
      secondaryResults: [
        { label: 'Supervivencia reportada (series históricas/contemporáneas)', formattedValue: item.survival, unit: '' },
      ],
      severity: item.sev,
      riskClassification: `Hunt y Hess Grado ${item.roman}`,
      clinicalInterpretation: item.interp,
      formulaUsed: 'Clasificación clínica categórica en grados I – V',
      inputsSummary: `Hunt y Hess Grado ${item.roman}`,
    };
  },
};
