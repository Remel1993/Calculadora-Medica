import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const ageField: SelectFieldDef = {
  id: 'age',
  label: '1. Edad',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '< 45 años (0)', points: 0 },
    { value: '2', label: '45 – 54 años (+2)', points: 2 },
    { value: '3', label: '55 – 64 años (+3)', points: 3 },
    { value: '4', label: '> 64 años (+4)', points: 4 },
  ],
};

const bmiField: SelectFieldDef = {
  id: 'bmi',
  label: '2. Índice de masa corporal (IMC)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '< 25 kg/m² (0)', points: 0 },
    { value: '1', label: '25 – 30 kg/m² (+1)', points: 1 },
    { value: '3', label: '> 30 kg/m² (+3)', points: 3 },
  ],
};

const waistField: SelectFieldDef = {
  id: 'waist',
  label: '3. Perímetro de cintura (medido al nivel del ombligo)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Hombres < 94 cm / Mujeres < 80 cm (0)', points: 0 },
    { value: '3', label: 'Hombres 94–102 cm / Mujeres 80–88 cm (+3)', points: 3 },
    { value: '4', label: 'Hombres > 102 cm / Mujeres > 88 cm (+4)', points: 4 },
  ],
};

const activityField: SelectFieldDef = {
  id: 'activity',
  label: '4. ¿Realiza al menos 30 min diarios de actividad física?',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Sí (0)', points: 0 },
    { value: '2', label: 'No (+2)', points: 2 },
  ],
};

const dietField: SelectFieldDef = {
  id: 'diet',
  label: '5. ¿Con qué frecuencia come verduras o frutas?',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Todos los días (0)', points: 0 },
    { value: '1', label: 'No todos los días (+1)', points: 1 },
  ],
};

const bpMedsField: SelectFieldDef = {
  id: 'bpMeds',
  label: '6. ¿Ha tomado medicación para hipertensión arterial alguna vez?',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'No (0)', points: 0 },
    { value: '2', label: 'Sí (+2)', points: 2 },
  ],
};

const highGlucoseField: SelectFieldDef = {
  id: 'highGlucose',
  label: '7. ¿Le han detectado glucosa alta alguna vez (chequeo, enfermedad o embarazo)?',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'No (0)', points: 0 },
    { value: '5', label: 'Sí (+5)', points: 5 },
  ],
};

const familyHxField: SelectFieldDef = {
  id: 'familyHx',
  label: '8. Antecedente familiar de diabetes (tipo 1 o tipo 2)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'No (0)', points: 0 },
    { value: '3', label: 'Sí: abuelos, tíos o primos (+3)', points: 3 },
    { value: '5', label: 'Sí: padres, hermanos o hijos (+5)', points: 5 },
  ],
};

export const findriscCalculator: CalculatorDefinition = {
  id: 'findrisc',
  name: 'Escala FINDRISC (Riesgo de Diabetes Tipo 2 a 10 años)',
  shortName: 'FINDRISC',
  primarySpecialty: 'endocrinologia',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'diagnostico',
  keywords: ['findrisc', 'diabetes', 'tamizaje', 'riesgo diabetes', 'glucemia', 'prevencion'],
  description:
    'Cuestionario clínico de 8 ítems (0–26 puntos) sin necesidad de laboratorio para estimar el riesgo de desarrollar diabetes mellitus tipo 2 en los próximos 10 años.',
  clinicalIndication:
    'Cribado preventivo en atención primaria y medicina interna para seleccionar pacientes candidatos a tamizaje glucémico e intervención de estilo de vida.',
  validatedPopulation: 'Adultos sin diagnóstico previo de diabetes mellitus.',
  contraindications: [
    'No utilizar en pacientes con diagnóstico ya establecido de diabetes mellitus tipo 1 o tipo 2.',
  ],
  limitations: [
    'Desarrollada en población finlandesa; en poblaciones latinoamericanas y asiáticas algunos consensos locales utilizan puntos de corte de perímetro abdominal ligeramente menores o umbral ≥ 12 para cribado con glucemia/HbA1c.',
  ],
  version: 'Lindström & Tuomilehto (2003)',
  references: [
    {
      citation:
        'Lindström J, Tuomilehto J. The diabetes risk score: a practical tool to predict type 2 diabetes risk. Diabetes Care. 2003;26(3):725-731.',
      year: 2003,
    },
  ],
  fields: [ageField, bmiField, waistField, activityField, dietField, bpMedsField, highGlucoseField, familyHxField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(findriscCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const total =
      Number(inputs.age) +
      Number(inputs.bmi) +
      Number(inputs.waist) +
      Number(inputs.activity) +
      Number(inputs.diet) +
      Number(inputs.bpMeds) +
      Number(inputs.highGlucose) +
      Number(inputs.familyHx);

    let severity: SeverityLevel = 'normal';
    let risk10y = '~1 % (1 de cada 100)';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (total < 7) {
      severity = 'normal';
      risk10y = '~1 %';
      riskClassification = `Riesgo bajo (${total} / 26 puntos)`;
      clinicalInterpretation = 'Riesgo estimado a 10 años de ~1 %.';
      guidance = ['Mantener estilo de vida saludable y reevaluar cada 3–5 años.'];
    } else if (total <= 11) {
      severity = 'low';
      risk10y = '~4 %';
      riskClassification = `Riesgo ligeramente elevado (${total} / 26 puntos)`;
      clinicalInterpretation = 'Riesgo estimado a 10 años de ~4 % (1 de cada 25).';
      guidance = ['Reforzar hábitos de alimentación, peso saludable y actividad física regular.'];
    } else if (total <= 14) {
      severity = 'moderate';
      risk10y = '~17 %';
      riskClassification = `Riesgo moderado (${total} / 26 puntos)`;
      clinicalInterpretation = 'Riesgo estimado a 10 años de ~17 % (1 de cada 6).';
      guidance = [
        'Considerar tamizaje con glucemia plasmática en ayunas o HbA1c y consejería estructurada de estilo de vida.',
      ];
    } else if (total <= 20) {
      severity = 'high';
      risk10y = '~33 %';
      riskClassification = `Riesgo alto (${total} / 26 puntos)`;
      clinicalInterpretation = 'Riesgo estimado a 10 años de ~33 % (1 de cada 3).';
      guidance = [
        'Realizar estudio diagnóstico glucémico (glucemia en ayunas, HbA1c y/o PTOG 75 g) e intervención intensiva sobre peso y actividad física.',
      ];
    } else {
      severity = 'critical';
      riskClassification = `Riesgo muy alto (${total} / 26 puntos)`;
      risk10y = '~50 %';
      clinicalInterpretation = 'Riesgo estimado a 10 años de ~50 % (1 de cada 2); alta probabilidad de prediabetes o diabetes no diagnosticada.';
      guidance = [
        'Solicitar confirmación bioquímica prioritaria (glucemia en ayunas + HbA1c / PTOG 75 g) y programa intensivo de prevención o manejo metabólico.',
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación FINDRISC',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (de 26)',
      },
      secondaryResults: [{ label: 'Riesgo estimado a 10 años', formattedValue: risk10y, unit: '' }],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'Instrumento de tamizaje; no sustituye pruebas bioquímicas diagnósticas de diabetes.',
      formulaUsed: 'Suma de 8 ítems ponderados FINDRISC (0–26 pts)',
      inputsSummary: `FINDRISC total: ${total}/26 (Riesgo 10 años: ${risk10y})`,
    };
  },
};
