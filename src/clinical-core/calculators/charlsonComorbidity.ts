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
import { AGE_UNITS_YEARS } from '../units/converters.ts';

const ageField: NumberFieldDef = {
  id: 'age',
  label: 'Edad del paciente',
  type: 'number',
  canonicalUnit: 'años',
  units: AGE_UNITS_YEARS,
  defaultUnitId: 'years',
  defaultValue: '68',
  min: 18,
  max: 110,
  placeholder: '68',
  helpText: 'Ajuste por edad (Charlson 1994): +1 pt por década desde los 50 años (máx. +4 pts en ≥ 80 años).',
};

const miField: BooleanFieldDef = {
  id: 'mi',
  label: 'Infarto agudo de miocardio previo (historia documentada)',
  type: 'boolean',
  trueLabel: 'Sí (+1)',
  falseLabel: 'No',
  pointsWhenTrue: 1,
  defaultValue: false,
};

const chfField: BooleanFieldDef = {
  id: 'chf',
  label: 'Insuficiencia cardíaca congestiva (disnea paroxística o FEVI reducida)',
  type: 'boolean',
  trueLabel: 'Sí (+1)',
  falseLabel: 'No',
  pointsWhenTrue: 1,
  defaultValue: false,
};

const pvdField: BooleanFieldDef = {
  id: 'pvd',
  label: 'Enfermedad vascular periférica (claudicación, bypass, aneurisma aórtico ≥ 6 cm)',
  type: 'boolean',
  trueLabel: 'Sí (+1)',
  falseLabel: 'No',
  pointsWhenTrue: 1,
  defaultValue: false,
};

const cvaField: BooleanFieldDef = {
  id: 'cva',
  label: 'Enfermedad cerebrovascular (ictus o AIT previo)',
  type: 'boolean',
  trueLabel: 'Sí (+1)',
  falseLabel: 'No',
  pointsWhenTrue: 1,
  defaultValue: false,
};

const dementiaField: BooleanFieldDef = {
  id: 'dementia',
  label: 'Demencia / deterioro neurocognitivo mayor crónico',
  type: 'boolean',
  trueLabel: 'Sí (+1)',
  falseLabel: 'No',
  pointsWhenTrue: 1,
  defaultValue: false,
};

const copdField: BooleanFieldDef = {
  id: 'copd',
  label: 'Enfermedad pulmonar crónica (EPOC, asma grave o fibrosis)',
  type: 'boolean',
  trueLabel: 'Sí (+1)',
  falseLabel: 'No',
  pointsWhenTrue: 1,
  defaultValue: false,
};

const ctdField: BooleanFieldDef = {
  id: 'ctd',
  label: 'Enfermedad del tejido conectivo (LES, AR, polimialgia, esclerodermia)',
  type: 'boolean',
  trueLabel: 'Sí (+1)',
  falseLabel: 'No',
  pointsWhenTrue: 1,
  defaultValue: false,
};

const pudField: BooleanFieldDef = {
  id: 'pud',
  label: 'Enfermedad ulcerosa péptica (antecedente de tratamiento o sangrado)',
  type: 'boolean',
  trueLabel: 'Sí (+1)',
  falseLabel: 'No',
  pointsWhenTrue: 1,
  defaultValue: false,
};

const hemiplegiaField: BooleanFieldDef = {
  id: 'hemiplegia',
  label: 'Hemiplejía o paraplejía',
  type: 'boolean',
  trueLabel: 'Sí (+2)',
  falseLabel: 'No',
  pointsWhenTrue: 2,
  defaultValue: false,
};

const ckdField: BooleanFieldDef = {
  id: 'ckd',
  label: 'Enfermedad renal crónica moderada-grave (Cr > 3 mg/dL, diálisis o trasplante)',
  type: 'boolean',
  trueLabel: 'Sí (+2)',
  falseLabel: 'No',
  pointsWhenTrue: 2,
  defaultValue: false,
};

const diabetesField: SelectFieldDef = {
  id: 'diabetes',
  label: 'Diabetes mellitus',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Ausente', points: 0 },
    { value: '1', label: 'Sin daño a órgano blanco (tratada con fármacos)', points: 1 },
    { value: '2', label: 'Con daño a órgano blanco (retinopatía, neuropatía o nefropatía)', points: 2 },
  ],
};

const liverField: SelectFieldDef = {
  id: 'liver',
  label: 'Hepatopatía crónica',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Ausente', points: 0 },
    { value: '1', label: 'Leve (hepatitis crónica o cirrosis sin hipertensión portal)', points: 1 },
    { value: '3', label: 'Moderada a grave (cirrosis con hipertensión portal / ascitis / varices)', points: 3 },
  ],
};

const tumorField: SelectFieldDef = {
  id: 'tumor',
  label: 'Neoplasia sólida',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Sin tumor sólido activo (o > 5 años libre)', points: 0 },
    { value: '2', label: 'Tumor sólido localizado (sin metástasis)', points: 2 },
    { value: '6', label: 'Tumor sólido metastásico', points: 6 },
  ],
};

const leukemiaField: BooleanFieldDef = {
  id: 'leukemia',
  label: 'Leucemia (aguda o crónica)',
  type: 'boolean',
  trueLabel: 'Sí (+2)',
  falseLabel: 'No',
  pointsWhenTrue: 2,
  defaultValue: false,
};

const lymphomaField: BooleanFieldDef = {
  id: 'lymphoma',
  label: 'Linfoma (Hodgkin, no Hodgkin o mieloma múltiple)',
  type: 'boolean',
  trueLabel: 'Sí (+2)',
  falseLabel: 'No',
  pointsWhenTrue: 2,
  defaultValue: false,
};

const aidsField: BooleanFieldDef = {
  id: 'aids',
  label: 'SIDA (VIH con enfermedades definitorias de SIDA)',
  type: 'boolean',
  trueLabel: 'Sí (+6)',
  falseLabel: 'No',
  pointsWhenTrue: 6,
  defaultValue: false,
};

export const charlsonComorbidityCalculator: CalculatorDefinition = {
  id: 'charlson-comorbidity',
  name: 'Índice de Comorbilidad de Charlson (Ajustado por Edad)',
  shortName: 'Índice de Charlson',
  primarySpecialty: 'geriatria',
  secondarySpecialties: ['medicina-interna', 'cirugia-general'],
  subcategory: 'gravedad',
  keywords: [
    'charlson',
    'comorbilidad',
    'supervivencia',
    'pronostico',
    'geriatria',
    'riesgo quirurgico',
    'edad',
  ],
  description:
    'Cuantifica la carga de comorbilidad crónica (19 condiciones ponderadas de 1 a 6 puntos más ajuste por edad) y estima la probabilidad de supervivencia a 10 años.',
  clinicalIndication:
    'Estratificación pronóstica basal en medicina interna, geriatría, valoración preoperatoria y decisiones de proporcionalidad terapéutica.',
  validatedPopulation: 'Adultos hospitalizados y ambulatorios (modelo original 1987 y ajustado por edad 1994).',
  contraindications: [
    'No mide gravedad aguda fisiológica (para riesgo agudo hospitalario usar NEWS2, SOFA o APACHE II).',
  ],
  limitations: [
    'La supervivencia estimada a 10 años proviene de cohortes históricas (1987/1994); terapias modernas en VIH, oncología, insuficiencia cardíaca o EPOC han mejorado el pronóstico real respecto al cálculo original.',
    'Las categorías mutuamente excluyentes (diabetes, hepatopatía y tumor sólido) están agrupadas en selectores para evitar doble puntuación.',
  ],
  version: 'Charlson (1987 / 1994 Ajustado por Edad)',
  references: [
    {
      citation:
        'Charlson ME, Pompei P, Ales KL, MacKenzie CR. A new method of classifying prognostic comorbidity in longitudinal studies: development and validation. J Chronic Dis. 1987;40(5):373-383.',
      year: 1987,
    },
    {
      citation:
        'Charlson M, Szatrowski TP, Peterson J, Gold J. Validation of a combined comorbidity index. J Clin Epidemiol. 1994;47(11):1245-1251.',
      year: 1994,
    },
  ],
  fields: [
    ageField,
    miField,
    chfField,
    pvdField,
    cvaField,
    dementiaField,
    copdField,
    ctdField,
    pudField,
    hemiplegiaField,
    ckdField,
    diabetesField,
    liverField,
    tumorField,
    leukemiaField,
    lymphomaField,
    aidsField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(charlsonComorbidityCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const age = getCanonicalNumberValue(ageField, inputs.age as NumberInputValue).canonicalValue!;
    let agePoints = 0;
    if (age >= 80) agePoints = 4;
    else if (age >= 70) agePoints = 3;
    else if (age >= 60) agePoints = 2;
    else if (age >= 50) agePoints = 1;

    const comorbidityPoints =
      (inputs.mi === true ? 1 : 0) +
      (inputs.chf === true ? 1 : 0) +
      (inputs.pvd === true ? 1 : 0) +
      (inputs.cva === true ? 1 : 0) +
      (inputs.dementia === true ? 1 : 0) +
      (inputs.copd === true ? 1 : 0) +
      (inputs.ctd === true ? 1 : 0) +
      (inputs.pud === true ? 1 : 0) +
      (inputs.hemiplegia === true ? 2 : 0) +
      (inputs.ckd === true ? 2 : 0) +
      Number(inputs.diabetes) +
      Number(inputs.liver) +
      Number(inputs.tumor) +
      (inputs.leukemia === true ? 2 : 0) +
      (inputs.lymphoma === true ? 2 : 0) +
      (inputs.aids === true ? 6 : 0);

    const total = comorbidityPoints + agePoints;
    const survival10y = roundClinical(Math.pow(0.983, Math.exp(total * 0.9)) * 100, 1);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (total === 0) {
      severity = 'normal';
      riskClassification = 'Ausencia de comorbilidad relevante (0 pts)';
      clinicalInterpretation =
        'Carga basal de comorbilidad mínima; supervivencia estimada a 10 años cercana al 98.3 %.';
    } else if (total <= 2) {
      severity = 'low';
      riskClassification = `Comorbilidad baja (${total} pts)`;
      clinicalInterpretation =
        'Carga comórbida baja según modelo histórico de Charlson; buen perfil basal para intervenciones estándar.';
    } else if (total <= 4) {
      severity = 'moderate';
      riskClassification = `Comorbilidad moderada (${total} pts)`;
      clinicalInterpretation =
        'Carga comórbida intermedia que incrementa el riesgo de complicaciones hospitalarias y mortalidad a largo plazo.';
    } else {
      severity = total >= 7 ? 'critical' : 'high';
      riskClassification = `Comorbilidad alta / severa (${total} pts)`;
      clinicalInterpretation =
        'Alta carga de enfermedad crónica combinada con edad. Se recomienda valoración geriátrica/multidisciplinaria y revisión de objetivos de cuidado y polifarmacia.';
    }

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Supervivencia estimada a 10 años (modelo original)',
        formattedValue: `${formatClinicalNumber(survival10y, 1)} %`,
        unit: '',
        note: 'Calculada con 0.983 ^ exp(Charlson × 0.9); interpretar con cautela en la era terapéutica actual.',
      },
      {
        label: 'Desglose (Comorbilidades + Edad)',
        formattedValue: `${comorbidityPoints} + ${agePoints}`,
        unit: `= ${total} pts`,
      },
    ];

    return {
      primaryResult: {
        label: 'Índice de Charlson Ajustado',
        value: total,
        formattedValue: `${total}`,
        unit: 'puntos',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: [
        'Integrar con la situación funcional basal (Barthel / Escala de Fragilidad Clínica) para tomar decisiones individualizadas y evitar decisiones basadas solo en la edad.',
      ],
      formulaUsed: 'Suma ponderada Charlson (1–6 pts) + ajuste etario (+1/década desde 50 años)',
      inputsSummary: `Edad ${roundClinical(age, 0)} años (+${agePoints}) · Comorbilidades +${comorbidityPoints} · Total ${total} pts`,
    };
  },
};
