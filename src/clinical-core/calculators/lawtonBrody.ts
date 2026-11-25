import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const telephoneField: SelectFieldDef = {
  id: 'telephone',
  label: '1. Uso del teléfono',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '1', label: '1 · Usa el teléfono por iniciativa propia (busca números y marca)', points: 1 },
    { value: '1_known', label: '1 · Marca solo unos pocos números bien conocidos o contesta sin marcar', points: 1 },
    { value: '0', label: '0 · No usa el teléfono en absoluto', points: 0 },
  ],
};

const shoppingField: SelectFieldDef = {
  id: 'shopping',
  label: '2. Hacer compras',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '1', label: '1 · Realiza todas las compras necesarias de forma independiente', points: 1 },
    { value: '0', label: '0 · Solo compras pequeñas, requiere acompañamiento o es incapaz de comprar', points: 0 },
  ],
};

const foodPrepField: SelectFieldDef = {
  id: 'foodPrep',
  label: '3. Preparación de la comida',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '1', label: '1 · Planea, prepara y sirve comidas adecuadas de forma independiente', points: 1 },
    { value: '0', label: '0 · Solo calienta/sirve o necesita que le preparen las comidas', points: 0 },
  ],
};

const housekeepingField: SelectFieldDef = {
  id: 'housekeeping',
  label: '4. Cuidado de la casa',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '1', label: '1 · Mantiene la casa solo o con ayuda ocasional para trabajos pesados', points: 1 },
    { value: '1_light', label: '1 · Realiza tareas ligeras (lavar platos, hacer cama) con orden adecuado', points: 1 },
    { value: '0', label: '0 · No participa en ninguna tarea doméstica o requiere supervisión constante', points: 0 },
  ],
};

const laundryField: SelectFieldDef = {
  id: 'laundry',
  label: '5. Lavado de la ropa',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '1', label: '1 · Lava toda su ropa o al menos prendas pequeñas de forma autónoma', points: 1 },
    { value: '0', label: '0 · Todo el lavado debe ser realizado por otra persona', points: 0 },
  ],
};

const transportField: SelectFieldDef = {
  id: 'transport',
  label: '6. Uso de medios de transporte',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '1', label: '1 · Viaja solo en transporte público o conduce su propio vehículo', points: 1 },
    { value: '1_taxi', label: '1 · Toma taxi solo (aunque no use transporte público) o viaja acompañado en transporte', points: 1 },
    { value: '0', label: '0 · Solo viaja en coche/taxi con ayuda ajena o no realiza desplazamientos', points: 0 },
  ],
};

const medicationField: SelectFieldDef = {
  id: 'medication',
  label: '7. Responsabilidad respecto a su medicación',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '1', label: '1 · Toma su medicación correctamente en dosis y horarios indicados', points: 1 },
    { value: '0', label: '0 · Solo si se la preparan previamente en pastillero o es incapaz de administrársela', points: 0 },
  ],
};

const financesField: SelectFieldDef = {
  id: 'finances',
  label: '8. Manejo de asuntos económicos / finanzas',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '1', label: '1 · Maneja dinero, pagos, banco y compras diarias de forma autónoma', points: 1 },
    { value: '1_small', label: '1 · Maneja gastos diarios menores, pero precisa ayuda para banco o pagos grandes', points: 1 },
    { value: '0', label: '0 · Incapaz de manejar dinero', points: 0 },
  ],
};

function pointsFromValue(val: string): number {
  return val.startsWith('1') ? 1 : 0;
}

export const lawtonBrodyCalculator: CalculatorDefinition = {
  id: 'lawton-brody',
  name: 'Escala de Lawton y Brody (Actividades Instrumentales — AIVD)',
  shortName: 'Lawton y Brody (AIVD)',
  primarySpecialty: 'geriatria',
  secondarySpecialties: ['medicina-interna', 'neurologia'],
  subcategory: 'gravedad',
  keywords: [
    'lawton',
    'brody',
    'aivd',
    'actividades instrumentales',
    'geriatria',
    'demencia',
    'autonomia',
    'consulta externa',
  ],
  description:
    'Evalúa 8 actividades instrumentales de la vida diaria (0 a 8 puntos) necesarias para vivir de forma independiente en la comunidad.',
  clinicalIndication:
    'Valoración geriátrica integral en consulta externa, detección precoz de deterioro cognitivo funcional (antes de perder ABVD) y evaluación de soporte domiciliario.',
  validatedPopulation: 'Adultos mayores ambulatorios o en transición comunitaria.',
  contraindications: [
    'No evalúa autocuidado básico (alimentación, baño, traslado; para ello emplear el Índice de Barthel).',
  ],
  limitations: [
    'Sesgo cultural y de género histórico: en varones que nunca han cocinado, lavado o limpiado por costumbre sociocultural (sin déficit físico ni cognitivo), tradicionalmente se han excluido esos 3 ítems (puntuación sobre 5 en lugar de 8) o se debe registrar "no realizaba previamente".',
    'La pérdida temprana en manejo de medicación, finanzas o teléfono suele ser un signo sensible de deterioro cognitivo incipiente.',
  ],
  version: 'Lawton & Brody (1969)',
  references: [
    {
      citation:
        'Lawton MP, Brody EM. Assessment of older people: self-maintaining and instrumental activities of daily living. Gerontologist. 1969;9(3):179-186.',
      year: 1969,
    },
  ],
  fields: [
    telephoneField,
    shoppingField,
    foodPrepField,
    housekeepingField,
    laundryField,
    transportField,
    medicationField,
    financesField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(lawtonBrodyCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const total =
      pointsFromValue(String(inputs.telephone)) +
      pointsFromValue(String(inputs.shopping)) +
      pointsFromValue(String(inputs.foodPrep)) +
      pointsFromValue(String(inputs.housekeeping)) +
      pointsFromValue(String(inputs.laundry)) +
      pointsFromValue(String(inputs.transport)) +
      pointsFromValue(String(inputs.medication)) +
      pointsFromValue(String(inputs.finances));

    const medFailed = pointsFromValue(String(inputs.medication)) === 0;
    const finFailed = pointsFromValue(String(inputs.finances)) === 0;

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (total === 8) {
      severity = 'normal';
      riskClassification = 'Independencia total en AIVD (8/8 puntos)';
      clinicalInterpretation =
        'Conserva autonomía completa para las 8 tareas instrumentales comunitarias evaluadas.';
      guidance.push('Mantener seguimiento preventivo habitual y fomentar vida activa.');
    } else if (total >= 6) {
      severity = 'low';
      riskClassification = `Dependencia instrumental leve (${total}/8 puntos)`;
      clinicalInterpretation =
        'Autonomía global preservada con pérdida puntual en 1–2 tareas complejas; evaluar si obedece a barrera física, sensorial, cognitiva o rol doméstico previo.';
      guidance.push(
        medFailed || finFailed
          ? 'Atención: el fallo en medicación o finanzas sugiere tamizaje cognitivo (Mini-Cog / MoCA) y supervisión del tratamiento.'
          : 'Confirmar si los ítems con 0 puntos corresponden a pérdida funcional real o a tareas no realizadas previamente.',
      );
    } else if (total >= 3) {
      severity = 'moderate';
      riskClassification = `Dependencia instrumental moderada (${total}/8 puntos)`;
      clinicalInterpretation =
        'Requiere apoyo regular de familiares o cuidadores para vivir en la comunidad de forma segura.';
      guidance.push(
        'Complementar con Índice de Barthel (ABVD), tamizaje cognitivo (MoCA/Mini-Cog), revisión de polifarmacia y valoración de sobrecarga del cuidador.',
      );
    } else {
      severity = 'high';
      riskClassification = `Dependencia instrumental grave / total (${total}/8 puntos)`;
      clinicalInterpretation =
        'Incapacidad o dependencia severa para las actividades instrumentales; alto riesgo de errores de medicación, desnutrición y aislamiento si vive solo.';
      guidance.push(
        'Establecer red de cuidados supervisados, simplificar pauta farmacológica y valorar recursos sociosanitarios domiciliarios.',
      );
    }

    return {
      primaryResult: {
        label: 'Escala de Lawton y Brody',
        value: total,
        formattedValue: `${total} / 8`,
        unit: 'puntos',
      },
      secondaryResults: [
        {
          label: 'Áreas críticas (Medicación / Finanzas)',
          formattedValue:
            medFailed || finFailed
              ? `Afectada (${medFailed ? 'Medicación' : ''}${medFailed && finFailed ? ' y ' : ''}${finFailed ? 'Finanzas' : ''})`
              : 'Conservadas',
          unit: '',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'Suma de 8 dominios AIVD de Lawton & Brody (0 = dependiente, 1 = independiente cada uno)',
      inputsSummary: `Lawton-Brody ${total}/8 pts`,
    };
  },
};
