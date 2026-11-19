import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const eyeField: SelectFieldDef = {
  id: 'eye',
  label: 'Apertura ocular (O)',
  type: 'select',
  defaultValue: '4',
  options: [
    { value: '4', label: '4 — Espontánea', points: 4 },
    { value: '3', label: '3 — Al estímulo verbal / grito', points: 3 },
    { value: '2', label: '2 — Al estímulo doloroso', points: 2 },
    { value: '1', label: '1 — Ninguna', points: 1 },
  ],
};

const verbalField: SelectFieldDef = {
  id: 'verbal',
  label: 'Respuesta verbal adaptada (lactante / niño preverbal < 2–5 años)',
  type: 'select',
  defaultValue: '5',
  options: [
    { value: '5', label: '5 — Balbuceo, arrullo, sonrisa social, fija y sigue objetos (o habla apropiada)', points: 5 },
    { value: '4', label: '4 — Llanto consolable, interacción reducida', points: 4 },
    { value: '3', label: '3 — Llanto persistente inconsolable o quejido al estímulo doloroso', points: 3 },
    { value: '2', label: '2 — Agitado, inquieto, gruñidos incomprensibles', points: 2 },
    { value: '1', label: '1 — Ninguna respuesta vocal', points: 1 },
  ],
};

const motorField: SelectFieldDef = {
  id: 'motor',
  label: 'Respuesta motora pediátrica (M)',
  type: 'select',
  defaultValue: '6',
  options: [
    { value: '6', label: '6 — Movimientos espontáneos normales (u obedece órdenes en mayores)', points: 6 },
    { value: '5', label: '5 — Se retira al contacto táctil suave / localiza el dolor', points: 5 },
    { value: '4', label: '4 — Se retira al estímulo doloroso', points: 4 },
    { value: '3', label: '3 — Flexión anormal al dolor (decorticación)', points: 3 },
    { value: '2', label: '2 — Extensión anormal al dolor (descerebración)', points: 2 },
    { value: '1', label: '1 — Ninguna respuesta motora', points: 1 },
  ],
};

export const glasgowPediatricCalculator: CalculatorDefinition = {
  id: 'glasgow-pediatric',
  name: 'Escala de Coma de Glasgow Pediátrica',
  shortName: 'Glasgow Pediátrica',
  primarySpecialty: 'pediatria',
  secondarySpecialties: ['neurologia', 'urgencias'],
  subcategory: 'gravedad',
  keywords: ['glasgow pediatrico', 'gcs', 'lactante', 'preverbal', 'tce pediatrico', 'coma'],
  description:
    'Adaptación pediátrica validada (James & Trauner / Reilly) para lactantes y preescolares preverbales (3–15 puntos).',
  clinicalIndication:
    'Evaluación neurológica en TCE pediátrico, convulsiones, infecciones del SNC o alteración aguda de conciencia en lactantes y niños pequeños.',
  validatedPopulation: 'Lactantes y niños preverbales (< 2–5 años; a partir de 5 años suele aplicarse la escala estándar).',
  contraindications: [
    'Sedación, relajación muscular o intubación limitan la evaluación verbal y motora.',
  ],
  limitations: [
    'El llanto por miedo al entorno hospitalario o hambre debe diferenciarse cuidadosamente de la irritabilidad neurológica con ayuda de los padres.',
  ],
  version: 'Reilly PL et al. (Childs Nerv Syst 1988) / PECARN',
  references: [
    {
      citation: 'Reilly PL, Simpson DA, Sprod R, Thomas L. Assessing the conscious level in infants and young children: a paediatric version of the Glasgow Coma Scale. Childs Nerv Syst. 1988;4(1):30-33.',
      year: 1988,
    },
  ],
  fields: [eyeField, verbalField, motorField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(glasgowPediatricCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const e = Number(inputs.eye);
    const v = Number(inputs.verbal);
    const m = Number(inputs.motor);
    const total = e + v + m;

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (total >= 13) {
      severity = total === 15 ? 'normal' : 'low';
      riskClassification = total === 15 ? 'Normal (15 / 15)' : `Compromiso neurológico leve (${total} / 15)`;
      clinicalInterpretation = 'En TCE pediátrico orienta a TCE leve (evaluar reglas PECARN para indicación de TC).';
    } else if (total >= 9) {
      severity = 'moderate';
      riskClassification = `Compromiso moderado (${total} / 15)`;
      clinicalInterpretation = 'Requiere observación estrecha, neuroimagen y reevaluación neurológica frecuente.';
    } else {
      severity = 'critical';
      riskClassification = `Compromiso grave / Coma pediátrico (${total} / 15)`;
      clinicalInterpretation = 'Riesgo elevado de pérdida de reflejos protectores de vía aérea e hipertensión intracraneal; valoración crítica inmediata.';
    }

    return {
      primaryResult: {
        label: 'Glasgow Pediátrica',
        value: total,
        formattedValue: String(total),
        unit: 'puntos (3 – 15)',
      },
      secondaryResults: [
        { label: 'Desglose (O · V · M)', formattedValue: `O${e} V${v} M${m}`, unit: '' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      formulaUsed: 'Ocular (1–4) + Verbal pediátrica (1–5) + Motora (1–6)',
      inputsSummary: `O${e} V${v} M${m} (Total: ${total}/15)`,
    };
  },
};
