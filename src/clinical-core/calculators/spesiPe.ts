import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SecondaryResultItem,
  SeverityLevel,
} from '../types/clinical.ts';

const age80Field: BooleanFieldDef = {
  id: 'age80',
  label: 'Edad > 80 años (+1)',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Sí (+1)',
  falseLabel: 'No',
};

const cancerField: BooleanFieldDef = {
  id: 'cancer',
  label: 'Cáncer activo o antecedente de neoplasia maligna (+1)',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Sí (+1)',
  falseLabel: 'No',
};

const cardiopulmonaryField: BooleanFieldDef = {
  id: 'cardiopulmonary',
  label: 'Insuficiencia cardíaca crónica o enfermedad pulmonar crónica (+1)',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Sí (+1)',
  falseLabel: 'No',
};

const hr110Field: BooleanFieldDef = {
  id: 'hr110',
  label: 'Frecuencia cardíaca ≥ 110 lpm (+1)',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Sí (+1)',
  falseLabel: 'No',
};

const sbp100Field: BooleanFieldDef = {
  id: 'sbp100',
  label: 'Presión arterial sistólica < 100 mmHg (+1)',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Sí (+1)',
  falseLabel: 'No',
};

const spo290Field: BooleanFieldDef = {
  id: 'spo290',
  label: 'Saturación arterial de O₂ (SpO₂) < 90% (+1)',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Sí (+1)',
  falseLabel: 'No',
};

export const spesiPeCalculator: CalculatorDefinition = {
  id: 'spesi-tep',
  name: 'sPESI — Índice Simplificado de Gravedad en Tromboembolia Pulmonar (TEP)',
  shortName: 'sPESI (Gravedad TEP)',
  primarySpecialty: 'hematologia',
  secondarySpecialties: ['neumologia', 'urgencias', 'cardiologia'],
  subcategory: 'gravedad',
  keywords: [
    'spesi',
    'pesi',
    'tep',
    'embolia pulmonar',
    'tromboembolia',
    'pronostico',
    'hematologia',
    'neumologia',
  ],
  description:
    'Estratifica el riesgo de mortalidad a 30 días en pacientes con embolia pulmonar aguda confirmada mediante 6 variables clínicas.',
  clinicalIndication:
    'Estratificación pronóstica inicial de TEP aguda para decidir ingreso hospitalario, monitorización de disfunción de VD o valoración de manejo ambulatorio.',
  validatedPopulation: 'Adultos con tromboembolia pulmonar (TEP) aguda confirmada por imagen.',
  contraindications: [
    'No es una escala diagnóstica de TEP (para probabilidad diagnóstica usar Wells TEP o PERC).',
    'No aplicar de forma aislada en embarazadas ni para descartar trombectomía/trombólisis en TEP inestable.',
  ],
  limitations: [
    'Según guías ESC 2019, incluso con sPESI = 0 debe descartarse disfunción del ventrículo derecho (AngioTAC o ecocardiograma) y elevación de troponina antes de considerar el alta precoz (riesgo intermedio-bajo).',
    'Para manejo ambulatorio también se recomienda verificar criterios de Hestia (soporte social, ausencia de riesgo hemorrágico alto, función renal).',
  ],
  version: 'Jiménez et al. (2010) · Guías ESC TEP (2019)',
  references: [
    {
      citation:
        'Jiménez D, Aujesky D, Moores L, et al. Simplification of the pulmonary embolism severity index for prognostication in patients with acute symptomatic pulmonary embolism. Arch Intern Med. 2010;170(15):1383-1389.',
      year: 2010,
    },
    {
      citation:
        'Konstantinides SV, Meyer G, Becattini C, et al. 2019 ESC Guidelines for the diagnosis and management of acute pulmonary embolism. Eur Heart J. 2020;41(4):543-603.',
      year: 2020,
    },
  ],
  fields: [age80Field, cancerField, cardiopulmonaryField, hr110Field, sbp100Field, spo290Field],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(spesiPeCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const total =
      (inputs.age80 ? 1 : 0) +
      (inputs.cancer ? 1 : 0) +
      (inputs.cardiopulmonary ? 1 : 0) +
      (inputs.hr110 ? 1 : 0) +
      (inputs.sbp100 ? 1 : 0) +
      (inputs.spo290 ? 1 : 0);

    const unstable = Boolean(inputs.sbp100);

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (total === 0) {
      severity = 'low';
      riskClassification = 'Riesgo bajo (sPESI = 0 puntos)';
      clinicalInterpretation =
        'Mortalidad estimada a 30 días ~1.0% (IC 95%: 0.0–2.1%). Perfil clínico favorable en ausencia de disfunción ventricular derecha.';
      guidance.push(
        'Si AngioTAC/ecocardiograma y biomarcadores no muestran sobrecarga del VD y no hay criterios de exclusión (Hestia), puede valorarse alta precoz o manejo ambulatorio con anticoagulación.',
      );
    } else if (unstable) {
      severity = 'critical';
      riskClassification = `Riesgo alto / inestabilidad hemodinámica (sPESI = ${total})`;
      clinicalInterpretation =
        'Mortalidad a 30 días ~10.9% en cohorte sPESI ≥ 1; la presencia de PAS < 100 mmHg exige descartar TEP de alto riesgo (shock o hipotensión persistente).';
      guidance.push(
        'Evaluación urgente en cuidados críticos/reanimación; valorar ecocardiograma a pie de cama y estrategia de reperfusión si cumple criterios de TEP masiva/alto riesgo.',
      );
    } else {
      severity = 'high';
      riskClassification = `Riesgo elevado según sPESI (≥ 1 punto · ${total}/6)`;
      clinicalInterpretation =
        'Mortalidad estimada a 30 días ~10.9% (IC 95%: 8.5–13.2%). No candidato a manejo ambulatorio estándar.';
      guidance.push(
        'Requiere ingreso hospitalario, anticoagulación terapéutica y evaluación de ventrículo derecho y troponina para distinguir riesgo intermedio-bajo de intermedio-alto (guías ESC).',
      );
    }

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Mortalidad estimada a 30 días',
        formattedValue: total === 0 ? '~1.0%' : '~10.9%',
        unit: '',
      },
      {
        label: 'Estratificación ESC (base clínica)',
        formattedValue: total === 0 ? 'Bajo (verificar VD)' : 'Intermedio / Alto',
        unit: '',
      },
    ];

    return {
      primaryResult: {
        label: 'Score sPESI',
        value: total,
        formattedValue: `${total} / 6`,
        unit: 'puntos',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'sPESI = suma de 6 criterios (Edad >80, Cáncer, ICC/EPOC, FC ≥110, PAS <100, SpO₂ <90%)',
      inputsSummary: `sPESI ${total}/6${unstable ? ' (con PAS < 100 mmHg)' : ''}`,
    };
  },
};
