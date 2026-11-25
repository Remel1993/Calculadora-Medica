import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const intakeField: SelectFieldDef = {
  id: 'intake',
  label: 'A. ¿Ha comido menos por pérdida de apetito, problemas digestivos o dificultad para masticar/tragar en los últimos 3 meses?',
  type: 'select',
  defaultValue: '2',
  options: [
    { value: '0', label: '0 · Ha comido mucho menos', points: 0 },
    { value: '1', label: '1 · Ha comido menos (disminución moderada)', points: 1 },
    { value: '2', label: '2 · Ha comido igual (sin disminución)', points: 2 },
  ],
};

const weightLossField: SelectFieldDef = {
  id: 'weightLoss',
  label: 'B. Pérdida involuntaria de peso en los últimos 3 meses',
  type: 'select',
  defaultValue: '3',
  options: [
    { value: '0', label: '0 · Pérdida de peso > 3 kg', points: 0 },
    { value: '1', label: '1 · No lo sabe', points: 1 },
    { value: '2', label: '2 · Pérdida de peso entre 1 y 3 kg', points: 2 },
    { value: '3', label: '3 · Sin pérdida de peso', points: 3 },
  ],
};

const mobilityField: SelectFieldDef = {
  id: 'mobility',
  label: 'C. Movilidad',
  type: 'select',
  defaultValue: '2',
  options: [
    { value: '0', label: '0 · De la cama al sillón (confinado en cama/silla)', points: 0 },
    { value: '1', label: '1 · Autónomo en el interior, pero no sale de casa', points: 1 },
    { value: '2', label: '2 · Sale del domicilio', points: 2 },
  ],
};

const acuteStressField: SelectFieldDef = {
  id: 'acuteStress',
  label: 'D. ¿Ha tenido enfermedad aguda o situación de estrés psicológico en los últimos 3 meses?',
  type: 'select',
  defaultValue: '2',
  options: [
    { value: '0', label: '0 · Sí', points: 0 },
    { value: '2', label: '2 · No', points: 2 },
  ],
};

const neuropsychField: SelectFieldDef = {
  id: 'neuropsych',
  label: 'E. Problemas neuropsicológicos',
  type: 'select',
  defaultValue: '2',
  options: [
    { value: '0', label: '0 · Demencia o depresión grave', points: 0 },
    { value: '1', label: '1 · Demencia leve', points: 1 },
    { value: '2', label: '2 · Sin problemas psicológicos / cognitivos', points: 2 },
  ],
};

const bmiOrCalfField: SelectFieldDef = {
  id: 'bmiOrCalf',
  label: 'F. Índice de Masa Corporal (IMC) o Circunferencia de Pantorrilla (CP si no es posible tallar/pesar)',
  type: 'select',
  defaultValue: '3',
  options: [
    { value: '0', label: '0 · IMC < 19 kg/m² (o CP < 31 cm)', points: 0 },
    { value: '1', label: '1 · IMC 19 a < 21 kg/m²', points: 1 },
    { value: '2', label: '2 · IMC 21 a < 23 kg/m²', points: 2 },
    { value: '3', label: '3 · IMC ≥ 23 kg/m² (o CP ≥ 31 cm)', points: 3 },
  ],
};

export const mnaSfCalculator: CalculatorDefinition = {
  id: 'mna-sf',
  name: 'MNA-SF — Cribado Nutricional Geriátrico Abreviado',
  shortName: 'MNA-SF (Nutrición)',
  primarySpecialty: 'geriatria',
  secondarySpecialties: ['medicina-interna', 'endocrinologia'],
  subcategory: 'diagnostico',
  keywords: [
    'mna',
    'mna-sf',
    'desnutricion',
    'nutricion',
    'geriatria',
    'perdida de peso',
    'cribado nutricional',
  ],
  description:
    'Herramienta de cribado nutricional rápido validada en adultos mayores de 65 años (0 a 14 puntos).',
  clinicalIndication:
    'Detección sistemática anual en consulta externa geriátrica, al ingreso hospitalario o ante pérdida ponderal, fragilidad o anorexia.',
  validatedPopulation: 'Adultos mayores ≥ 65 años en comunidad, residencias u hospitalización.',
  contraindications: [
    'No reemplaza una evaluación nutricional completa (MNA completo o criterios GLIM) cuando el cribado resulta alterado.',
  ],
  limitations: [
    'Si se utiliza circunferencia de pantorrilla (< 31 cm = 0; ≥ 31 cm = 3) en pacientes con edema de miembros inferiores, puede sobreestimar la reserva muscular.',
  ],
  version: 'MNA-SF revisado (Kaiser et al., 2009)',
  references: [
    {
      citation:
        'Kaiser MJ, Bauer JM, Ramsch C, et al. Validation of the Mini Nutritional Assessment short-form (MNA-SF): a practical tool for identification of nutritional status. J Nutr Health Aging. 2009;13(9):782-788.',
      year: 2009,
    },
    {
      citation:
        'Rubenstein LZ, Harker JO, Salvà A, Guigoz Y, Vellas B. Screening for undernutrition in geriatric practice: developing the short-form mini-nutritional assessment (MNA-SF). J Gerontol A Biol Sci Med Sci. 2001;56(6):M366-M372.',
      year: 2001,
    },
  ],
  fields: [intakeField, weightLossField, mobilityField, acuteStressField, neuropsychField, bmiOrCalfField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(mnaSfCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const total =
      Number(inputs.intake) +
      Number(inputs.weightLoss) +
      Number(inputs.mobility) +
      Number(inputs.acuteStress) +
      Number(inputs.neuropsych) +
      Number(inputs.bmiOrCalf);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (total >= 12) {
      severity = 'normal';
      riskClassification = 'Estado nutricional normal (12–14 puntos)';
      clinicalInterpretation =
        'Sin evidencia actual de desnutrición ni riesgo nutricional en el cribado.';
      guidance.push('Reevaluar anualmente en consulta externa o tras cualquier evento agudo u hospitalización.');
    } else if (total >= 8) {
      severity = 'moderate';
      riskClassification = 'Riesgo de desnutrición (8–11 puntos)';
      clinicalInterpretation =
        'Cribado alterado que indica riesgo nutricional; requiere intervención dietética temprana antes de evolucionar a desnutrición establecida.';
      guidance.push(
        'Investigar causas reversibles (salud bucal, disfagia, polifarmacia, depresión, aislamiento social), enriquecer dieta proteica (1.0–1.2 g/kg/día si TFG lo permite) y realizar seguimiento ponderal en 4–8 semanas.',
      );
    } else {
      severity = 'high';
      riskClassification = 'Desnutrición (0–7 puntos)';
      clinicalInterpretation =
        'Alta probabilidad de desnutrición calórico-proteica establecida; aumenta riesgo de sarcopenia, caídas, infecciones y mortalidad.';
      guidance.push(
        'Completar valoración nutricional (criterios GLIM / MNA completo), descartar patología orgánica oculta, derivar a Nutrición Clínica y valorar suplementación nutricional oral junto con ejercicio de fuerza.',
      );
    }

    return {
      primaryResult: {
        label: 'MNA-SF Total',
        value: total,
        formattedValue: `${total} / 14`,
        unit: 'puntos',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'Suma de 6 ítems MNA-SF (0 a 14 puntos)',
      inputsSummary: `MNA-SF ${total}/14 pts`,
    };
  },
};
