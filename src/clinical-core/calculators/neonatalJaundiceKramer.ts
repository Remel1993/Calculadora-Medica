import {
  getCanonicalNumberValue,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const kramerZoneField: SelectFieldDef = {
  id: 'kramerZone',
  label: 'Extensión cefalocaudal de la ictericia (Zonas de Kramer)',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '1', label: 'Zona 1 — Cabeza y cuello', points: 1 },
    { value: '2', label: 'Zona 2 — Tronco superior hasta ombligo', points: 2 },
    { value: '3', label: 'Zona 3 — Abdomen inferior y muslos', points: 3 },
    { value: '4', label: 'Zona 4 — Brazos y piernas (debajo rodillas/codos)', points: 4 },
    { value: '5', label: 'Zona 5 — Palmas de manos y plantas de pies', points: 5 },
  ],
};

const hoursField: NumberFieldDef = {
  id: 'hoursOfLife',
  label: 'Edad postnatal (horas de vida)',
  type: 'number',
  canonicalUnit: 'horas',
  units: [{ id: 'hours', label: 'horas', toCanonical: (v) => v, min: 1, max: 500, step: 1 }],
  defaultUnitId: 'hours',
  min: 1,
  max: 500,
  placeholder: '48',
};

const gaField: SelectFieldDef = {
  id: 'gestationalAge',
  label: 'Edad gestacional al nacer',
  type: 'select',
  defaultValue: 'term38',
  options: [
    { value: 'term38', label: '≥ 38 semanas' },
    { value: 'late35_37', label: '35 – 37 semanas 6 días' },
  ],
};

const neuroRiskField: BooleanFieldDef = {
  id: 'neuroRisk',
  label: 'Factores de riesgo de neurotoxicidad AAP (hemólisis/isoimmunización, déficit G6PD, sepsis, albúmina < 3.0 g/dL o inestabilidad clínica)',
  type: 'boolean',
  trueLabel: 'Presentes',
  falseLabel: 'Ausentes',
  defaultValue: false,
};

const KRAMER_RANGES: Record<number, { region: string; approxMgDl: string }> = {
  1: { region: 'Cabeza y cuello', approxMgDl: '~4 – 8 mg/dL (estimación visual)' },
  2: { region: 'Tronco superior hasta ombligo', approxMgDl: '~5 – 12 mg/dL (estimación visual)' },
  3: { region: 'Abdomen inferior y muslos', approxMgDl: '~8 – 16 mg/dL (estimación visual)' },
  4: { region: 'Antebrazos y piernas', approxMgDl: '~11 – 18 mg/dL (estimación visual)' },
  5: { region: 'Palmas y plantas', approxMgDl: '> 15 – 20 mg/dL (estimación visual)' },
};

export const neonatalJaundiceKramerCalculator: CalculatorDefinition = {
  id: 'neonatal-jaundice',
  name: 'Ictericia Neonatal — Zona Dérmica de Kramer y Alerta de Riesgo (AAP)',
  shortName: 'Ictericia Neonatal (Kramer)',
  primarySpecialty: 'pediatria',
  secondarySpecialties: ['gineco-obstetricia', 'urgencias'],
  subcategory: 'diagnostico',
  keywords: ['kramer', 'ictericia neonatal', 'bilirrubina', 'fototerapia', 'kernicterus', 'aap', 'recien nacido'],
  description:
    'Registra la progresión cefalocaudal clínica mediante las zonas de Kramer (I–V) integrada con las horas de vida y factores de neurotoxicidad de la guía AAP 2022.',
  clinicalIndication:
    'Tamizaje visual rápido al pie de cama para decidir medición urgente de bilirrubina sérica total (BST) o transcutánea (TcB) en recién nacidos ≥ 35 semanas.',
  validatedPopulation: 'Recién nacidos ≥ 35 semanas de edad gestacional (primera semana de vida).',
  contraindications: [
    'La estimación visual de Kramer NUNCA sustituye la medición cuantitativa de bilirrubina sérica (BST) o transcutánea (TcB) para indicar fototerapia o exanguinotransfusión.',
    'Inaplicable una vez iniciada la fototerapia (blanqueamiento cutáneo) o en prematuros < 35 semanas.',
  ],
  limitations: [
    'La inspección visual subestima o sobreestima la bilirrubina real, especialmente en neonatos con piel oscura.',
    'Toda ictericia visible en las primeras 24 horas de vida se considera patológica hasta demostrar lo contrario y exige BST urgente.',
  ],
  version: 'Kramer (1969) + Orientación AAP (2022)',
  references: [
    {
      citation:
        'Kramer LI. Advancement of dermal icterus in the jaundiced newborn. Am J Dis Child. 1969;118(3):454-458.',
      year: 1969,
    },
    {
      citation:
        'Kemper AR, Newman TB, Slaughter JL, et al. Clinical Practice Guideline Revision: Management of Hyperbilirubinemia in the Newborn Infant 35 or More Weeks of Gestation. Pediatrics. 2022;150(3):e2022058859.',
      year: 2022,
    },
  ],
  fields: [kramerZoneField, hoursField, gaField, neuroRiskField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(neonatalJaundiceKramerCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const zone = Number(inputs.kramerZone);
    const hours = getCanonicalNumberValue(hoursField, inputs.hoursOfLife as NumberInputValue).canonicalValue!;
    const isLatePreterm = inputs.gestationalAge === 'late35_37';
    const hasNeuroRisk = Boolean(inputs.neuroRisk);
    const kramerInfo = KRAMER_RANGES[zone];

    const earlyJaundice = hours < 24;
    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (earlyJaundice) {
      severity = 'critical';
      riskClassification = `ALERTA: Ictericia precoz (< 24 h de vida) — Zona Kramer ${zone}`;
      clinicalInterpretation =
        'Cualquier ictericia clínica antes de las 24 horas de vida es patológica (alto riesgo de enfermedad hemolítica o sepsis).';
      guidance = [
        'Solicitar DE INMEDIATO bilirrubina sérica total/fraccionada (BST), grupo/Rh, Coombs directo y hemograma.',
        'Evaluar umbrales horarios AAP 2022 según edad gestacional y factores de neurotoxicidad para inicio inmediato de fototerapia.',
      ];
    } else if (zone >= 4 || (zone >= 3 && (isLatePreterm || hasNeuroRisk))) {
      severity = zone === 5 ? 'critical' : 'high';
      riskClassification = `Alto riesgo clínico — Zona Kramer ${zone} (${hours} h de vida)`;
      clinicalInterpretation =
        `Progresión distal (${kramerInfo.region}) con aproximación visual ${kramerInfo.approxMgDl}. Combinada con ${hours} h de vida${isLatePreterm ? ', prematuridad tardía' : ''}${hasNeuroRisk ? ' y factores de neurotoxicidad' : ''}, requiere cuantificación urgente.`;
      guidance = [
        'Obtener bilirrubina sérica total (BST) sin demora (preferir BST directa sobre TcB si se sospecha rango elevado o > 15 mg/dL).',
        'Contrastar el valor de BST con los nomogramas horarios exactos de fototerapia / exanguinotransfusión AAP 2022.',
      ];
    } else if (zone === 3 || isLatePreterm || hasNeuroRisk) {
      severity = 'moderate';
      riskClassification = `Riesgo moderado / vigilancia estrecha — Zona Kramer ${zone}`;
      clinicalInterpretation = `Ictericia hasta ${kramerInfo.region} a las ${hours} h de vida (${kramerInfo.approxMgDl}).`;
      guidance = [
        'Medir TcB o BST para ubicación exacta en la curva horaria AAP 2022.',
        'Asegurar adecuada frecuencia de tomas (8–12 veces/día) y seguimiento en ≤ 24 h si egresa.',
      ];
    } else {
      severity = 'low';
      riskClassification = `Extensión cefálica/troncular inicial — Zona Kramer ${zone}`;
      clinicalInterpretation = `Ictericia limitada a ${kramerInfo.region} (${kramerInfo.approxMgDl}) tras ≥ 24 h de vida sin factores de neurotoxicidad reportados.`;
      guidance = [
        'Realizar tamizaje objetivo con TcB o BST antes del alta hospitalaria (AAP 2022 recomienda cribado universal) y vigilar signos de alarma (somnolencia, rechazo al alimento, progresión distal).',
      ];
    }

    return {
      primaryResult: {
        label: 'Zona Dérmica de Kramer',
        value: zone,
        formattedValue: `Zona ${zone}`,
        unit: `(${kramerInfo.region})`,
      },
      secondaryResults: [
        { label: 'Rango orientativo de bilirrubina', formattedValue: kramerInfo.approxMgDl, unit: '' },
        { label: 'Horas de vida / Edad gestacional', formattedValue: `${hours} h`, unit: isLatePreterm ? '35–37+6 sem' : '≥ 38 sem' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'La decisión de fototerapia SIEMPRE debe basarse en bilirrubina sérica medida y curva AAP 2022, nunca solo en Kramer.',
      formulaUsed: 'Evaluación cefalocaudal Kramer (Zonas I–V) + Edad en horas + Factores AAP 2022',
      inputsSummary: `Kramer Zona ${zone} · ${hours} h · ${isLatePreterm ? '35–37s' : '≥38s'} · Riesgo neurotoxicidad: ${hasNeuroRisk ? 'Sí' : 'No'}`,
    };
  },
};
