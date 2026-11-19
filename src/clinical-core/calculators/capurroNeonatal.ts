import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const earShapeField: SelectFieldDef = {
  id: 'earShape',
  label: '1. Forma de la oreja (pabellón auricular)',
  type: 'select',
  defaultValue: '16',
  options: [
    { value: '0', label: 'Aplanada, sin incurvación (0)', points: 0 },
    { value: '8', label: 'Borde superior parcialmente incurvado (+8)', points: 8 },
    { value: '16', label: 'Todo el borde superior incurvado (+16)', points: 16 },
    { value: '24', label: 'Pabellón totalmente incurvado (+24)', points: 24 },
  ],
};

const breastField: SelectFieldDef = {
  id: 'breastSize',
  label: '2. Tamaño de la glándula mamaria',
  type: 'select',
  defaultValue: '10',
  options: [
    { value: '0', label: 'No palpable (0)', points: 0 },
    { value: '5', label: 'Palpable < 5 mm (+5)', points: 5 },
    { value: '10', label: 'Palpable entre 5 y 10 mm (+10)', points: 10 },
    { value: '15', label: 'Palpable > 10 mm (+15)', points: 15 },
  ],
};

const nippleField: SelectFieldDef = {
  id: 'nipple',
  label: '3. Formación del pezón',
  type: 'select',
  defaultValue: '10',
  options: [
    { value: '0', label: 'Apenas visible, sin areola (0)', points: 0 },
    { value: '5', label: 'Diámetro < 7.5 mm, areola lisa y chata (+5)', points: 5 },
    { value: '10', label: 'Diámetro > 7.5 mm, areola punteada, borde no levantado (+10)', points: 10 },
    { value: '15', label: 'Diámetro > 7.5 mm, areola punteada, borde levantado (+15)', points: 15 },
  ],
};

const skinField: SelectFieldDef = {
  id: 'skinTexture',
  label: '4. Textura de la piel',
  type: 'select',
  defaultValue: '10',
  options: [
    { value: '0', label: 'Muy fina, gelatinosa (0)', points: 0 },
    { value: '5', label: 'Fina, lisa (+5)', points: 5 },
    { value: '10', label: 'Algo más gruesa, discreta descamación superficial (+10)', points: 10 },
    { value: '15', label: 'Gruesa, grietas superficiales, descamación manos/pies (+15)', points: 15 },
    { value: '20', label: 'Gruesa, apergaminada, con grietas profundas (+20)', points: 20 },
  ],
};

const plantarField: SelectFieldDef = {
  id: 'plantarCreases',
  label: '5. Pliegues plantares',
  type: 'select',
  defaultValue: '15',
  options: [
    { value: '0', label: 'Sin pliegues (0)', points: 0 },
    { value: '5', label: 'Marcas mal definidas en mitad anterior (+5)', points: 5 },
    { value: '10', label: 'Marcas bien definidas en mitad anterior y surcos en 1/3 anterior (+10)', points: 10 },
    { value: '15', label: 'Surcos en la mitad anterior de la planta (+15)', points: 15 },
    { value: '20', label: 'Surcos en más de la mitad anterior (+20)', points: 20 },
  ],
};

export const capurroNeonatalCalculator: CalculatorDefinition = {
  id: 'capurro-neonatal',
  name: 'Test de Capurro A (Edad Gestacional Neonatal)',
  shortName: 'Test de Capurro',
  primarySpecialty: 'pediatria',
  secondarySpecialties: ['gineco-obstetricia'],
  subcategory: 'diagnostico',
  keywords: ['capurro', 'edad gestacional', 'recien nacido', 'neonato', 'pretermino', 'termino', 'ballard'],
  description:
    'Estima la edad gestacional del recién nacido a partir de 5 signos somáticos (Capurro A: 204 + suma / 7), ideal cuando el neonato presenta depresión neurológica o no es posible evaluar tono.',
  clinicalIndication:
    'Estimación postnatal inmediata de edad gestacional cuando no se cuenta con ecografía obstétrica del primer trimestre confiable o para corroboración física neonatal.',
  validatedPopulation: 'Recién nacidos ≥ 29 semanas de gestación (primeras 24 horas de vida).',
  contraindications: [
    'En prematuros extremos (< 28–29 semanas), el Test de Ballard Expandido (New Ballard Score) ofrece mejor sensibilidad.',
  ],
  limitations: [
    'Margen de error aproximado de ± 9 a 18 días frente a la ecografía temprana del primer trimestre.',
    'La piel y los pliegues plantares pueden alterarse en restricción del crecimiento intrauterino o sufrimiento fetal crónico.',
  ],
  version: 'Capurro et al. (1978 — Método A Somático)',
  references: [
    {
      citation:
        'Capurro H, Konichezky S, Fonseca D, Caldeyro-Barcia R. A simplified method for diagnosis of gestational age in the newborn infant. J Pediatr. 1978;93(1):120-122.',
      year: 1978,
    },
  ],
  fields: [earShapeField, breastField, nippleField, skinField, plantarField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(capurroNeonatalCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const sum =
      Number(inputs.earShape) +
      Number(inputs.breastSize) +
      Number(inputs.nipple) +
      Number(inputs.skinTexture) +
      Number(inputs.plantarCreases);

    const totalDays = 204 + sum;
    const weeks = Math.floor(totalDays / 7);
    const remDays = totalDays % 7;
    const decimalWeeks = Number((totalDays / 7).toFixed(1));

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (weeks < 34) {
      severity = 'high';
      riskClassification = `Pretérmino moderado / temprano (${weeks} sem + ${remDays} d)`;
      clinicalInterpretation = 'Recién nacido prematuro (< 34 semanas); alto riesgo de dificultad respiratoria, hipotermia e hipoglucemia.';
    } else if (weeks < 37) {
      severity = 'moderate';
      riskClassification = `Pretérmino tardío (34 – 36+6 sem · ${weeks}+${remDays})`;
      clinicalInterpretation = 'Prematuro tardío; requiere vigilancia de termorregulación, glucemia, succión e hiperbilirrubinemia.';
    } else if (weeks < 39) {
      severity = 'low';
      riskClassification = `Término precoz (37 – 38+6 sem · ${weeks}+${remDays})`;
      clinicalInterpretation = 'Recién nacido a término precoz.';
    } else if (weeks <= 40) {
      severity = 'normal';
      riskClassification = `Término completo (39 – 40+6 sem · ${weeks}+${remDays})`;
      clinicalInterpretation = 'Recién nacido a término completo.';
    } else if (weeks === 41) {
      severity = 'low';
      riskClassification = `Término tardío (41 – 41+6 sem · ${weeks}+${remDays})`;
      clinicalInterpretation = 'Recién nacido a término tardío.';
    } else {
      severity = 'moderate';
      riskClassification = `Postérmino (≥ 42 sem · ${weeks}+${remDays})`;
      clinicalInterpretation = 'Edad gestacional estimada postérmino; vigilar hipoglucemia, policitemia y síndrome de posmadurez.';
    }

    return {
      primaryResult: {
        label: 'Edad Gestacional (Capurro A)',
        value: decimalWeeks,
        formattedValue: `${weeks} sem ${remDays} d`,
        unit: `(${totalDays} días)`,
      },
      secondaryResults: [
        { label: 'Suma de 5 signos somáticos', formattedValue: String(sum), unit: 'puntos (0–94)' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: [
        'Correlacionar peso al nacer con curvas neonatales (Fenton / INTERGROWTH-21st) para clasificar PEG, AEG o GEG.',
      ],
      guidanceDisclaimer: 'La ecografía obstétrica del primer trimestre sigue siendo el estándar de oro cuando está disponible.',
      formulaUsed: 'Edad gestacional (días) = 204 + Oreja + Glándula mamaria + Pezón + Piel + Pliegues plantares',
      inputsSummary: `Suma somática: ${sum} → 204 + ${sum} = ${totalDays} días (${weeks}s ${remDays}d)`,
    };
  },
};
