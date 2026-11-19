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
  label: 'Patología biliar a evaluar (Guías de Tokio TG18)',
  type: 'select',
  defaultValue: 'cholecystitis',
  options: [
    { value: 'cholecystitis', label: 'Colecistitis Aguda (TG18)' },
    { value: 'cholangitis', label: 'Colangitis Aguda (TG18)' },
  ],
};

// Cholecystitis Diagnosis
const choleLocalField: BooleanFieldDef = {
  id: 'choleLocal',
  label: 'A. Signos locales de inflamación (Murphy positivo o masa/dolor/defensa en hipocondrio derecho)',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: true,
  visibleWhen: (i) => i.syndrome === 'cholecystitis',
};

const choleSystemicField: BooleanFieldDef = {
  id: 'choleSystemic',
  label: 'B. Inflamación sistémica (fiebre, PCR elevada o leucocitosis)',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: true,
  visibleWhen: (i) => i.syndrome === 'cholecystitis',
};

const choleImagingField: BooleanFieldDef = {
  id: 'choleImaging',
  label: 'C. Hallazgos de imagen característicos (ecografía/TC: pared engrosada, líquido pericolecístico, Murphy ecográfico, litiasis impactada)',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: true,
  visibleWhen: (i) => i.syndrome === 'cholecystitis',
};

// Cholecystitis Grade II
const choleWbc18Field: BooleanFieldDef = {
  id: 'choleWbc18',
  label: 'Grado II: Leucocitos > 18,000 /mm³',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'cholecystitis',
};

const choleMassField: BooleanFieldDef = {
  id: 'choleMass',
  label: 'Grado II: Masa palpable dolorosa en cuadrante superior derecho',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'cholecystitis',
};

const choleDuration72Field: BooleanFieldDef = {
  id: 'choleDuration72',
  label: 'Grado II: Duración de los síntomas > 72 horas',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'cholecystitis',
};

const choleMarkedLocalField: BooleanFieldDef = {
  id: 'choleMarkedLocal',
  label: 'Grado II: Inflamación local marcada (gangrenosa, enfisematosa, absceso pericolecístico/hepático o peritonitis biliar)',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'cholecystitis',
};

// Cholangitis Diagnosis
const cholanSystemicField: BooleanFieldDef = {
  id: 'cholanSystemic',
  label: 'A. Inflamación sistémica (fiebre/escalofríos o leucocitos < 4,000 / > 10,000 o PCR ≥ 1 mg/dL)',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: true,
  visibleWhen: (i) => i.syndrome === 'cholangitis',
};

const cholanCholestasisField: BooleanFieldDef = {
  id: 'cholanCholestasis',
  label: 'B. Colestasis (ictericia con Bilirrubina Total ≥ 2 mg/dL o FA/GGT/AST/ALT > 1.5× LSN)',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: true,
  visibleWhen: (i) => i.syndrome === 'cholangitis',
};

const cholanImagingField: BooleanFieldDef = {
  id: 'cholanImaging',
  label: 'C. Imagen biliar (dilatación de vía biliar o evidencia etiológica: coledocolitiasis, estenosis, prótesis)',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: true,
  visibleWhen: (i) => i.syndrome === 'cholangitis',
};

// Cholangitis Grade II (>= 2 of 5)
const cholanWbcField: BooleanFieldDef = {
  id: 'cholanWbc',
  label: 'Grado II: Leucocitos > 12,000 o < 4,000 /mm³',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'cholangitis',
};

const cholanFever39Field: BooleanFieldDef = {
  id: 'cholanFever39',
  label: 'Grado II: Fiebre alta (≥ 39 °C)',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'cholangitis',
};

const cholanAge75Field: BooleanFieldDef = {
  id: 'cholanAge75',
  label: 'Grado II: Edad ≥ 75 años',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'cholangitis',
};

const cholanBili5Field: BooleanFieldDef = {
  id: 'cholanBili5',
  label: 'Grado II: Hiperbilirrubinemia (Bilirrubina Total ≥ 5.0 mg/dL)',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'cholangitis',
};

const cholanAlbuminField: BooleanFieldDef = {
  id: 'cholanAlbumin',
  label: 'Grado II: Hipoalbuminemia (< 0.7 × límite inferior normal, aprox. < 2.5 g/dL)',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.syndrome === 'cholangitis',
};

// Shared Organ Dysfunction (Grade III)
const orgCvField: BooleanFieldDef = {
  id: 'orgCv',
  label: 'Grado III — Disfunción cardiovascular (hipotensión que requiere dopamina ≥ 5 µg/kg/min o cualquier dosis de noradrenalina)',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
};

const orgNeuroField: BooleanFieldDef = {
  id: 'orgNeuro',
  label: 'Grado III — Disfunción neurológica (alteración del nivel de conciencia)',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
};

const orgRespField: BooleanFieldDef = {
  id: 'orgResp',
  label: 'Grado III — Disfunción respiratoria (PaO₂/FiO₂ < 300)',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
};

const orgRenalField: BooleanFieldDef = {
  id: 'orgRenal',
  label: 'Grado III — Disfunción renal (oliguria o creatinina sérica > 2.0 mg/dL)',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
};

const orgHepaticField: BooleanFieldDef = {
  id: 'orgHepatic',
  label: 'Grado III — Disfunción hepática (TP-INR > 1.5)',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
};

const orgHemaField: BooleanFieldDef = {
  id: 'orgHema',
  label: 'Grado III — Disfunción hematológica (plaquetas < 100,000 /mm³)',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
};

export const tokyoGuidelinesCalculator: CalculatorDefinition = {
  id: 'tokyo-tg18',
  name: 'Criterios de Tokio (TG18) — Colecistitis Aguda y Colangitis Aguda',
  shortName: 'Criterios de Tokio (TG18)',
  primarySpecialty: 'cirugia-general',
  secondarySpecialties: ['gastroenterologia', 'urgencias'],
  subcategory: 'gravedad',
  keywords: [
    'tokio',
    'tokyo',
    'tg18',
    'tg13',
    'colecistitis',
    'colangitis',
    'vesicula',
    'via biliar',
    'cpre',
    'murphy',
  ],
  description:
    'Evalúa criterios diagnósticos (sospecha vs. definitivo) y estadificación de gravedad (Grado I leve, Grado II moderado, Grado III grave) según las Guías de Tokio 2018.',
  clinicalIndication:
    'Sospecha clínica de colecistitis aguda o colangitis aguda en urgencias, cirugía general y gastroenterología para definir urgencia quirúrgica o drenaje biliar.',
  validatedPopulation: 'Adultos con patología biliar aguda infecciosa/inflamatoria (Yokoe et al. y Kiriyama et al., TG18).',
  contraindications: [
    'La decisión quirúrgica final en colecistitis Grado II/III también requiere valorar riesgo anestésico/comorbilidades (ASA-PS e índice de Charlson).',
  ],
  limitations: [
    'En pacientes inmunosuprimidos o ancianos, la fiebre y la leucocitosis pueden estar atenuadas pese a inflamación biliar avanzada.',
  ],
  version: 'Tokyo Guidelines 2018 (TG18)',
  references: [
    {
      citation:
        'Yokoe M, Hata J, Takada T, et al. Tokyo Guidelines 2018: diagnostic criteria and severity grading of acute cholecystitis. J Hepatobiliary Pancreat Sci. 2018;25(1):41-54.',
      year: 2018,
    },
    {
      citation:
        'Kiriyama S, Kozaka K, Takada T, et al. Tokyo Guidelines 2018: diagnostic criteria and severity grading of acute cholangitis. J Hepatobiliary Pancreat Sci. 2018;25(1):17-30.',
      year: 2018,
    },
  ],
  fields: [
    syndromeField,
    choleLocalField,
    choleSystemicField,
    choleImagingField,
    choleWbc18Field,
    choleMassField,
    choleDuration72Field,
    choleMarkedLocalField,
    cholanSystemicField,
    cholanCholestasisField,
    cholanImagingField,
    cholanWbcField,
    cholanFever39Field,
    cholanAge75Field,
    cholanBili5Field,
    cholanAlbuminField,
    orgCvField,
    orgNeuroField,
    orgRespField,
    orgRenalField,
    orgHepaticField,
    orgHemaField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(tokyoGuidelinesCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const syndrome = inputs.syndrome as 'cholecystitis' | 'cholangitis';
    const organFailures = [
      inputs.orgCv === true,
      inputs.orgNeuro === true,
      inputs.orgResp === true,
      inputs.orgRenal === true,
      inputs.orgHepatic === true,
      inputs.orgHema === true,
    ].filter(Boolean).length;

    let diagStatus = '';
    let grade = 1;
    let gradeLabel = '';
    let severity: SeverityLevel = 'low';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (syndrome === 'cholecystitis') {
      const hasA = inputs.choleLocal === true;
      const hasB = inputs.choleSystemic === true;
      const hasC = inputs.choleImaging === true;

      if (hasA && hasB && hasC) {
        diagStatus = 'Diagnóstico definitivo de Colecistitis Aguda (A + B + C)';
      } else if (hasA && hasB) {
        diagStatus = 'Diagnóstico de sospecha de Colecistitis Aguda (A + B)';
      } else {
        diagStatus = 'No cumple criterios diagnósticos completos TG18 (requiere al menos A + B)';
      }

      const modCount = [
        inputs.choleWbc18 === true,
        inputs.choleMass === true,
        inputs.choleDuration72 === true,
        inputs.choleMarkedLocal === true,
      ].filter(Boolean).length;

      if (organFailures >= 1) {
        grade = 3;
        gradeLabel = 'Grado III — Colecistitis Aguda Grave';
        severity = 'critical';
        clinicalInterpretation = `Presenta ${organFailures} disfunción(es) orgánica(s) asociada(s) a colecistitis aguda.`;
        guidance = [
          'Soporte intensivo en UCI, antibioticoterapia empírica inmediata y descompresión/drenaje biliar urgente (colecistostomía percutánea) o colecistectomía temprana en centros expertos si el riesgo quirúrgico lo permite.',
        ];
      } else if (modCount >= 1) {
        grade = 2;
        gradeLabel = 'Grado II — Colecistitis Aguda Moderada';
        severity = 'high';
        clinicalInterpretation = `Cumple ${modCount} criterio(s) de inflamación local avanzada o duración > 72 h, sin falla orgánica.`;
        guidance = [
          'Antibioticoterapia sistémica y valoración quirúrgica temprana: colecistectomía laparoscópica precoz por equipo experimentado o drenaje vesicular si alto riesgo quirúrgico.',
        ];
      } else {
        grade = 1;
        gradeLabel = 'Grado I — Colecistitis Aguda Leve';
        severity = 'low';
        clinicalInterpretation = 'Sin criterios de Grado II ni disfunción orgánica.';
        guidance = [
          'Hidratación, analgesia, antibióticos según protocolo y colecistectomía laparoscópica temprana (idealmente en las primeras 72 horas si bajo riesgo quirúrgico).',
        ];
      }
    } else {
      const hasA = inputs.cholanSystemic === true;
      const hasB = inputs.cholanCholestasis === true;
      const hasC = inputs.cholanImaging === true;

      if (hasA && hasB && hasC) {
        diagStatus = 'Diagnóstico definitivo de Colangitis Aguda (A + B + C)';
      } else if (hasA && (hasB || hasC)) {
        diagStatus = 'Diagnóstico de sospecha de Colangitis Aguda (A + B o C)';
      } else {
        diagStatus = 'No cumple criterios diagnósticos completos TG18 (requiere A + B o C)';
      }

      const modCount = [
        inputs.cholanWbc === true,
        inputs.cholanFever39 === true,
        inputs.cholanAge75 === true,
        inputs.cholanBili5 === true,
        inputs.cholanAlbumin === true,
      ].filter(Boolean).length;

      if (organFailures >= 1) {
        grade = 3;
        gradeLabel = 'Grado III — Colangitis Aguda Grave';
        severity = 'critical';
        clinicalInterpretation = `Colangitis aguda acompañada de ${organFailures} disfunción(es) orgánica(s) (sepsis biliar grave).`;
        guidance = [
          'Manejo en UCI, reanimación, antibióticos IV inmediatos y DRENAJE BILIAR URGENTE (CPRE o drenaje percutáneo/endoscópico) tan pronto se logre estabilización inicial.',
        ];
      } else if (modCount >= 2) {
        grade = 2;
        gradeLabel = 'Grado II — Colangitis Aguda Moderada';
        severity = 'high';
        clinicalInterpretation = `Cumple ${modCount} de 5 criterios de riesgo moderado (requiere ≥ 2) sin falla orgánica establecida.`;
        guidance = [
          'Antibioticoterapia empírica inmediata y DRENAJE BILIAR TEMPRANO (CPRE en las primeras 24–48 horas) para prevenir progresión a Grado III.',
        ];
      } else {
        grade = 1;
        gradeLabel = 'Grado I — Colangitis Aguda Leve';
        severity = 'low';
        clinicalInterpretation = 'Cumple < 2 criterios de Grado II y sin falla orgánica.';
        guidance = [
          'Iniciar antibióticos y soporte médico; vigilar respuesta clínica a las 12–24 h (si no responde, escalar a drenaje biliar precoz) y resolver etiología obstructiva.',
        ];
      }
    }

    return {
      primaryResult: {
        label: 'Gravedad TG18',
        value: grade,
        formattedValue: `Grado ${grade}`,
        unit: grade === 1 ? '(Leve)' : grade === 2 ? '(Moderada)' : '(Grave)',
      },
      secondaryResults: [
        {
          label: 'Estado diagnóstico TG18',
          formattedValue: diagStatus,
          unit: '',
        },
        {
          label: 'Disfunciones orgánicas (Grado III)',
          formattedValue: String(organFailures),
          unit: 'sistemas',
        },
      ],
      severity,
      riskClassification: gradeLabel,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'Guías de Tokio 2018 (TG18); individualizar momento quirúrgico según estado basal del paciente.',
      formulaUsed:
        syndrome === 'cholecystitis'
          ? 'TG18 Colecistitis: Diagnóstico (A+B+C) y Gravedad (G-III falla orgánica, G-II ≥1 marcador local/sistémico)'
          : 'TG18 Colangitis: Diagnóstico (A+B+C) y Gravedad (G-III falla orgánica, G-II ≥2/5 criterios)',
      inputsSummary: `${syndrome === 'cholecystitis' ? 'Colecistitis' : 'Colangitis'} · ${diagStatus} · Grado ${grade}`,
    };
  },
};
