import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SecondaryResultItem,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const feedingField: SelectFieldDef = {
  id: 'feeding',
  label: '1. Comer',
  type: 'select',
  defaultValue: '10',
  options: [
    { value: '10', label: 'Independiente (capaz de usar cubiertos y comer solo)', points: 10 },
    { value: '5', label: 'Necesita ayuda para cortar, untar o dieta modificada', points: 5 },
    { value: '0', label: 'Dependiente total (necesita ser alimentado)', points: 0 },
  ],
};

const bathingField: SelectFieldDef = {
  id: 'bathing',
  label: '2. Lavarse / Bañarse',
  type: 'select',
  defaultValue: '5',
  options: [
    { value: '5', label: 'Independiente (entra, sale y se baña sin supervisión)', points: 5 },
    { value: '0', label: 'Dependiente (necesita ayuda o supervisión)', points: 0 },
  ],
};

const groomingField: SelectFieldDef = {
  id: 'grooming',
  label: '3. Aseo personal (cara, pelo, dientes, afeitado)',
  type: 'select',
  defaultValue: '5',
  options: [
    { value: '5', label: 'Independiente (realiza aseo personal completo)', points: 5 },
    { value: '0', label: 'Dependiente (requiere asistencia)', points: 0 },
  ],
};

const dressingField: SelectFieldDef = {
  id: 'dressing',
  label: '4. Vestirse y desvestirse',
  type: 'select',
  defaultValue: '10',
  options: [
    { value: '10', label: 'Independiente (incluye botones, cremalleras y calzado)', points: 10 },
    { value: '5', label: 'Necesita ayuda pero realiza al menos la mitad de la tarea', points: 5 },
    { value: '0', label: 'Dependiente total', points: 0 },
  ],
};

const bowelsField: SelectFieldDef = {
  id: 'bowels',
  label: '5. Control intestinal (deposición)',
  type: 'select',
  defaultValue: '10',
  options: [
    { value: '10', label: 'Continente (sin episodios de incontinencia)', points: 10 },
    { value: '5', label: 'Accidente ocasional (≤ 1/semana) o precisa ayuda con supositorios', points: 5 },
    { value: '0', label: 'Incontinente o requiere enemas por terceros', points: 0 },
  ],
};

const bladderField: SelectFieldDef = {
  id: 'bladder',
  label: '6. Control vesical (micción)',
  type: 'select',
  defaultValue: '10',
  options: [
    { value: '10', label: 'Continente o maneja sonda/colector de forma autónoma', points: 10 },
    { value: '5', label: 'Accidente ocasional (máximo 1 cada 24 h) o ayuda con dispositivo', points: 5 },
    { value: '0', label: 'Incontinente o sondado incapaz de manejarlo solo', points: 0 },
  ],
};

const toiletField: SelectFieldDef = {
  id: 'toilet',
  label: '7. Uso del retrete / inodoro',
  type: 'select',
  defaultValue: '10',
  options: [
    { value: '10', label: 'Independiente (entra, sale, se limpia y se viste solo)', points: 10 },
    { value: '5', label: 'Necesita ayuda para mantener el equilibrio o limpiarse', points: 5 },
    { value: '0', label: 'Dependiente (usa cuña o asistencia completa)', points: 0 },
  ],
};

const transfersField: SelectFieldDef = {
  id: 'transfers',
  label: '8. Trasladarse (cama ↔ silla / sillón)',
  type: 'select',
  defaultValue: '15',
  options: [
    { value: '15', label: 'Independiente completo', points: 15 },
    { value: '10', label: 'Mínima ayuda física o supervisión verbal', points: 10 },
    { value: '5', label: 'Gran ayuda (puede sentarse pero requiere 1–2 personas para pasar)', points: 5 },
    { value: '0', label: 'Dependiente (incapaz de sentarse; requiere grúa o 2 personas)', points: 0 },
  ],
};

const mobilityField: SelectFieldDef = {
  id: 'mobility',
  label: '9. Deambulación / Desplazamiento (≥ 50 metros)',
  type: 'select',
  defaultValue: '15',
  options: [
    { value: '15', label: 'Independiente ≥ 50 m (puede usar bastón o andador sin ayuda)', points: 15 },
    { value: '10', label: 'Necesita ayuda física o supervisión de una persona ≥ 50 m', points: 10 },
    { value: '5', label: 'Independiente en silla de ruedas ≥ 50 m (giros y puertas)', points: 5 },
    { value: '0', label: 'Inmóvil o desplazamiento < 50 m dependiente', points: 0 },
  ],
};

const stairsField: SelectFieldDef = {
  id: 'stairs',
  label: '10. Subir y bajar escaleras',
  type: 'select',
  defaultValue: '10',
  options: [
    { value: '10', label: 'Independiente (puede apoyarse en pasamanos o bastón)', points: 10 },
    { value: '5', label: 'Necesita ayuda física o supervisión', points: 5 },
    { value: '0', label: 'Incapaz de subir/bajar escaleras', points: 0 },
  ],
};

export const barthelIndexCalculator: CalculatorDefinition = {
  id: 'barthel-index',
  name: 'Índice de Barthel (Actividades Básicas de la Vida Diaria)',
  shortName: 'Índice de Barthel',
  primarySpecialty: 'geriatria',
  secondarySpecialties: ['medicina-interna', 'neurologia'],
  subcategory: 'gravedad',
  keywords: [
    'barthel',
    'abvd',
    'funcionalidad',
    'dependencia',
    'geriatria',
    'rehabilitacion',
    'ictus',
    'autonomia',
  ],
  description:
    'Evalúa el grado de independencia funcional en 10 actividades básicas de la vida diaria (ABVD) sobre una escala de 0 a 100 puntos.',
  clinicalIndication:
    'Valoración geriátrica integral, seguimiento funcional tras ictus o fractura de cadera, planificación del alta hospitalaria y valoración de necesidad de cuidados.',
  validatedPopulation: 'Adultos mayores, pacientes en rehabilitación neurológica/ortopédica y hospitalización médica.',
  contraindications: [
    'No evalúa actividades instrumentales (finanzas, medicación, compras; para eso usar Lawton-Brody) ni deterioro cognitivo aislado.',
  ],
  limitations: [
    'Presenta efecto techo en pacientes ambulatorios con discapacidad leve o déficit cognitivo sin limitación motriz.',
    'Debe puntuar lo que el paciente HACE realmente en las últimas 24–48 h, no lo que teóricamente podría hacer.',
  ],
  version: 'Mahoney & Barthel (1965) · Cortes de Shah (1989)',
  references: [
    {
      citation:
        'Mahoney FI, Barthel DW. Functional evaluation: the Barthel Index. Md State Med J. 1965;14:61-65.',
      year: 1965,
    },
    {
      citation:
        'Shah S, Vanclay F, Cooper B. Improving the sensitivity of the Barthel Index for stroke rehabilitation. J Clin Epidemiol. 1989;42(8):703-709.',
      year: 1989,
    },
  ],
  fields: [
    feedingField,
    bathingField,
    groomingField,
    dressingField,
    bowelsField,
    bladderField,
    toiletField,
    transfersField,
    mobilityField,
    stairsField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(barthelIndexCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const feeding = Number(inputs.feeding);
    const bathing = Number(inputs.bathing);
    const grooming = Number(inputs.grooming);
    const dressing = Number(inputs.dressing);
    const bowels = Number(inputs.bowels);
    const bladder = Number(inputs.bladder);
    const toilet = Number(inputs.toilet);
    const transfers = Number(inputs.transfers);
    const mobility = Number(inputs.mobility);
    const stairs = Number(inputs.stairs);

    const total =
      feeding + bathing + grooming + dressing + bowels + bladder + toilet + transfers + mobility + stairs;

    const autocuidado = feeding + bathing + grooming + dressing + bowels + bladder + toilet; // max 60
    const movilidad = transfers + mobility + stairs; // max 40

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (total === 100) {
      severity = 'normal';
      riskClassification = 'Independencia total en ABVD (100/100)';
      clinicalInterpretation =
        'El paciente es completamente autónomo para todas las actividades básicas de autocuidado y movilidad evaluadas.';
      guidance.push(
        'Complementar con valoración de actividades instrumentales (AIVD) y tamizaje cognitivo si hay queja de memoria.',
      );
    } else if (total >= 91) {
      severity = 'low';
      riskClassification = 'Dependencia escasa / leve (91–99/100)';
      clinicalInterpretation =
        'Autonomía global preservada con requerimiento puntual de ayuda o supervisión mínima.';
      guidance.push(
        'Reforzar ayudas técnicas simples (barras en baño, calzado seguro) para mantener independencia.',
      );
    } else if (total >= 61) {
      severity = 'moderate';
      riskClassification = 'Dependencia moderada (61–90/100)';
      clinicalInterpretation =
        'Requiere apoyo regular de un cuidador o rehabilitación funcional para completar varias actividades básicas.';
      guidance.push(
        'Identificar dominios deficitarios (autocuidado vs. movilidad) para fisioterapia o terapia ocupacional dirigida.',
      );
    } else if (total >= 21) {
      severity = 'high';
      riskClassification = 'Dependencia grave (21–60/100)';
      clinicalInterpretation =
        'Limitación funcional importante; precisa asistencia sustancial diaria y plan estructurado de cuidados y prevención de complicaciones.';
      guidance.push(
        'Activar prevención de úlceras por presión (escala de Braden), prevención de caídas y valoración social/cuidador principal.',
      );
    } else {
      severity = 'critical';
      riskClassification = 'Dependencia total (0–20/100)';
      clinicalInterpretation =
        'Dependencia completa o casi completa para autocuidado y movilidad; alto riesgo de inmovilidad, úlceras por presión e infecciones.';
      guidance.push(
        'Establecer plan integral de cuidados de enfermería/cuidador (cambios posturales, higiene, prevención de broncoaspiración y tromboprofilaxis si procede).',
      );
    }

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Subscore de autocuidado y esfínteres',
        formattedValue: `${autocuidado} / 60`,
        unit: 'pts',
      },
      {
        label: 'Subscore de traslados y movilidad',
        formattedValue: `${movilidad} / 40`,
        unit: 'pts',
      },
    ];

    return {
      primaryResult: {
        label: 'Índice de Barthel total',
        value: total,
        formattedValue: `${total} / 100`,
        unit: 'puntos',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'Suma de 10 ítems ABVD de Mahoney & Barthel (0 a 100 pts) · Rangos de Shah',
      inputsSummary: `Barthel ${total}/100 (Autocuidado ${autocuidado}/60 · Movilidad ${movilidad}/40)`,
    };
  },
};
