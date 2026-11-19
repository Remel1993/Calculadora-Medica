import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SeverityLevel,
} from '../types/clinical.ts';

const confusionField: BooleanFieldDef = {
  id: 'confusion',
  label: 'C — Confusión mental de nueva aparición',
  helpText: 'Desorientación en tiempo, lugar o persona, o puntuación AMT ≤ 8.',
  type: 'boolean',
  trueLabel: 'Presente (+1)',
  falseLabel: 'Ausente (0)',
  pointsWhenTrue: 1,
  defaultValue: false,
};

const ureaField: BooleanFieldDef = {
  id: 'urea',
  label: 'U — Urea > 42 mg/dL (7 mmol/L) o BUN > 19 mg/dL',
  helpText: 'Requiere medición bioquímica sérica de urea o nitrógeno ureico.',
  type: 'boolean',
  trueLabel: 'Elevada (+1)',
  falseLabel: 'Normal (0)',
  pointsWhenTrue: 1,
  defaultValue: false,
};

const respRateField: BooleanFieldDef = {
  id: 'respRate',
  label: 'R — Frecuencia respiratoria ≥ 30 rpm',
  helpText: 'Taquipnea marcada al momento de la valoración.',
  type: 'boolean',
  trueLabel: '≥ 30 rpm (+1)',
  falseLabel: '< 30 rpm (0)',
  pointsWhenTrue: 1,
  defaultValue: false,
};

const bpField: BooleanFieldDef = {
  id: 'bloodPressure',
  label: 'B — Hipotensión arterial (PAS < 90 o PAD ≤ 60 mmHg)',
  helpText: 'Cualquiera de ambos criterios tensionales suma 1 punto.',
  type: 'boolean',
  trueLabel: 'Presente (+1)',
  falseLabel: 'Ausente (0)',
  pointsWhenTrue: 1,
  defaultValue: false,
};

const age65Field: BooleanFieldDef = {
  id: 'age65',
  label: '65 — Edad ≥ 65 años',
  type: 'boolean',
  trueLabel: '≥ 65 años (+1)',
  falseLabel: '< 65 años (0)',
  pointsWhenTrue: 1,
  defaultValue: false,
};

const MORTALITY_BY_SCORE: Record<number, string> = {
  0: '0.7 %',
  1: '2.1 %',
  2: '9.2 %',
  3: '14.5 %',
  4: '40.0 %',
  5: '57.0 %',
};

export const curb65Calculator: CalculatorDefinition = {
  id: 'curb-65',
  name: 'Escala CURB-65 (Neumonía Adquirida en la Comunidad)',
  shortName: 'CURB-65',
  primarySpecialty: 'neumologia',
  secondarySpecialties: ['infectologia', 'urgencias', 'medicina-interna'],
  subcategory: 'gravedad',
  keywords: [
    'curb-65',
    'curb65',
    'neumonia',
    'nac',
    'cap',
    'mortalidad',
    'ingreso',
    'respiratorio',
  ],
  description:
    'Regla de predicción clínica de mortalidad a 30 días y apoyo en la decisión del sitio de manejo en neumonía adquirida en la comunidad.',
  clinicalIndication:
    'Estratificación inicial de gravedad en adultos con diagnóstico clínico/radiológico de neumonía adquirida en la comunidad (NAC).',
  validatedPopulation: 'Adultos inmunocompetentes con NAC (cohorte original de Lim et al.).',
  requiredLabsNote:
    'Requiere resultado de urea o BUN sérico. Si no se dispone de laboratorio en atención primaria, utilizar la variante CRB-65 (sin urea).',
  contraindications: [
    'No validada para neumonía nosocomial/asociada a ventilación mecánica ni como único criterio en pacientes gravemente inmunodeprimidos.',
  ],
  limitations: [
    'No evalúa directamente hipoxemia (SpO₂/PaO₂), derrame pleural complicado, afectación multilobar ni incapacidad para tolerar vía oral.',
    'Un paciente con puntuación 0–1 pero hipoxémico o con soporte social precario puede requerir hospitalización igualmente.',
    'Las guías ATS/IDSA 2019 señalan mayor sensibilidad de PSI/PORT para identificar candidatos seguros a manejo ambulatorio.',
  ],
  version: 'Lim et al. (2003) / BTS',
  references: [
    {
      citation:
        'Lim WS, van der Eerden MM, Laing R, et al. Defining community acquired pneumonia severity on presentation to hospital: an international derivation and validation study. Thorax. 2003;58(5):377-382.',
      year: 2003,
    },
    {
      citation:
        'Metlay JP, Waterer GW, Long AC, et al. Diagnosis and Treatment of Adults with Community-acquired Pneumonia. Am J Respir Crit Care Med. 2019;200(7):e45-e67.',
      year: 2019,
    },
  ],
  fields: [confusionField, ureaField, respRateField, bpField, age65Field],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(curb65Calculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const activeCriteria: string[] = [];
    let score = 0;

    if (inputs.confusion === true) {
      score += 1;
      activeCriteria.push('Confusión');
    }
    if (inputs.urea === true) {
      score += 1;
      activeCriteria.push('Urea/BUN elevado');
    }
    if (inputs.respRate === true) {
      score += 1;
      activeCriteria.push('FR ≥ 30 rpm');
    }
    if (inputs.bloodPressure === true) {
      score += 1;
      activeCriteria.push('Hipotensión');
    }
    if (inputs.age65 === true) {
      score += 1;
      activeCriteria.push('Edad ≥ 65');
    }

    const mortality = MORTALITY_BY_SCORE[score] ?? 'N/D';

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (score <= 1) {
      severity = 'low';
      riskClassification = `Riesgo bajo (${score} / 5 puntos)`;
      clinicalInterpretation = `Mortalidad estimada a 30 días de ${mortality} en la cohorte de validación. Riesgo bajo de mortalidad temprana.`;
      guidance = [
        'Considerar manejo ambulatorio si no existe hipoxemia (SpO₂ < 92%), intolerancia oral, inestabilidad ni barreras sociofamiliares.',
      ];
    } else if (score === 2) {
      severity = 'moderate';
      riskClassification = 'Riesgo moderado (2 / 5 puntos)';
      clinicalInterpretation = `Mortalidad estimada a 30 días de ${mortality}. Riesgo intermedio que suele requerir vigilancia hospitalaria inicial.`;
      guidance = [
        'Considerar ingreso hospitalario breve o manejo estrechamente supervisado según evolución y oximetría.',
      ];
    } else {
      severity = score >= 4 ? 'critical' : 'high';
      riskClassification =
        score >= 4
          ? `Riesgo muy alto (${score} / 5 puntos)`
          : `Riesgo alto (${score} / 5 puntos)`;
      clinicalInterpretation = `Neumonía grave con mortalidad estimada a 30 días de ${mortality}.`;
      guidance = [
        'Hospitalización recomendada. Evaluar criterios mayores/menores de ingreso a UCI (ATS/IDSA) especialmente con ≥ 4 puntos.',
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación CURB-65',
        value: score,
        formattedValue: String(score),
        unit: 'puntos (de 5)',
      },
      secondaryResults: [
        {
          label: 'Mortalidad estimada a 30 días (Lim et al.)',
          formattedValue: mortality,
          unit: 'cohorte original',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer:
        'Apoyo para decidir sitio de cuidado; siempre integrar oximetría, comorbilidades, lactato y juicio clínico.',
      formulaUsed: 'Suma de 5 criterios dicotómicos (1 punto por cada criterio presente)',
      inputsSummary:
        activeCriteria.length > 0
          ? `Criterios presentes (${score}): ${activeCriteria.join(', ')}`
          : 'Ningún criterio presente (0 puntos)',
    };
  },
};
