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

type GaKey = '35' | '36' | '37' | '38' | '39' | '40';

const gaField: SelectFieldDef = {
  id: 'gestationalAgeWeeks',
  label: 'Edad gestacional al nacimiento (semanas cumplidas)',
  type: 'select',
  defaultValue: '38',
  options: [
    { value: '35', label: '35 semanas (35+0 a 35+6)' },
    { value: '36', label: '36 semanas (36+0 a 36+6)' },
    { value: '37', label: '37 semanas (37+0 a 37+6)' },
    { value: '38', label: '38 semanas (38+0 a 38+6)' },
    { value: '39', label: '39 semanas (39+0 a 39+6)' },
    { value: '40', label: '≥ 40 semanas (término completo)' },
  ],
};

const hoursField: NumberFieldDef = {
  id: 'hoursOfLife',
  label: 'Edad postnatal (horas de vida)',
  type: 'number',
  canonicalUnit: 'horas',
  units: [{ id: 'h', label: 'horas', toCanonical: (v) => v, min: 1, max: 240, step: 1 }],
  defaultUnitId: 'h',
  defaultValue: '48',
  min: 1,
  max: 240,
  placeholder: '48',
};

const tsbField: NumberFieldDef = {
  id: 'tsb',
  label: 'Bilirrubina Sérica Total (BST / TSB — NO restar directa)',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: [
    { id: 'mg_dl', label: 'mg/dL', toCanonical: (v) => v, min: 0.5, max: 45, step: 0.1 },
    { id: 'umol_l', label: 'µmol/L', toCanonical: (v) => v / 17.1, min: 8, max: 770, step: 1 },
  ],
  defaultUnitId: 'mg_dl',
  defaultValue: '15.5',
  min: 0.5,
  max: 45,
  placeholder: '15.5',
  helpText: 'La guía AAP 2022 exige usar la bilirrubina sérica TOTAL sin restar la fracción conjugada/directa.',
};

const albuminField: NumberFieldDef = {
  id: 'albumin',
  label: 'Albúmina sérica (g/dL, opcional — para relación B/A)',
  type: 'number',
  canonicalUnit: 'g/dL',
  units: [{ id: 'g_dl', label: 'g/dL', toCanonical: (v) => v, min: 1.0, max: 6.0, step: 0.1 }],
  defaultUnitId: 'g_dl',
  defaultValue: '',
  required: false,
  min: 1.0,
  max: 6.0,
  placeholder: '3.4',
  helpText: 'Si es < 3.0 g/dL constituye factor de riesgo de neurotoxicidad AAP 2022.',
};

const neuroRiskField: BooleanFieldDef = {
  id: 'hasNeuroRiskFactors',
  label: '¿Factores de riesgo de neurotoxicidad AAP 2022?',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Presentes',
  falseLabel: 'Ausentes',
  helpText: 'Enfermedad hemolítica isoinmune (Coombs+), déficit G6PD u otra hemólisis, sepsis, inestabilidad clínica en últimas 24 h o albúmina < 3.0 g/dL.',
};

const abeSignsField: BooleanFieldDef = {
  id: 'hasAbeSigns',
  label: '¿Signos clínicos de Encefalopatía Bilirrubínica Aguda (EBA)?',
  type: 'boolean',
  defaultValue: false,
  helpText: 'Letargo intenso, hipotonía o hipertonía/opistótonos, llanto agudo inconsolable, fiebre o rechazo al alimento.',
};

// Published AAP 2022 (Kemper et al., Pediatrics 2022) phototherapy anchor thresholds (mg/dL) at 24, 48, 72, 96 h
const PHOTO_ANCHOR_HOURS = [24, 48, 72, 96] as const;

const PHOTO_NO_RISK: Record<GaKey, readonly [number, number, number, number]> = {
  '35': [10.6, 14.2, 16.8, 18.6],
  '36': [11.2, 14.8, 17.5, 19.3],
  '37': [11.7, 15.4, 18.1, 20.0],
  '38': [12.3, 16.0, 18.8, 20.7],
  '39': [12.8, 16.5, 19.3, 21.3],
  '40': [13.3, 17.0, 19.8, 21.8],
};

const PHOTO_WITH_RISK: Record<GaKey, readonly [number, number, number, number]> = {
  '35': [8.9, 12.2, 14.6, 16.1],
  '36': [9.4, 12.8, 15.4, 16.9],
  '37': [10.0, 13.5, 16.1, 17.6],
  '38': [10.5, 14.0, 16.6, 18.2],
  '39': [10.5, 14.0, 16.6, 18.2],
  '40': [10.5, 14.0, 16.6, 18.2],
};

// Published AAP 2022 exchange transfusion anchor points without extra neurotoxicity risk factors (35w vs >=38w)
const EXCHANGE_NO_RISK: Record<'35' | '36_37' | '38_plus', readonly [number, number, number, number]> = {
  '35': [16.1, 18.5, 20.1, 21.1],
  '36_37': [16.9, 19.3, 21.1, 22.3],
  '38_plus': [17.7, 20.1, 22.1, 23.5],
};

function interpolateAtHours(anchors: readonly [number, number, number, number], hours: number): number {
  if (hours <= PHOTO_ANCHOR_HOURS[0]) return anchors[0];
  if (hours >= PHOTO_ANCHOR_HOURS[3]) return anchors[3];
  for (let i = 0; i < PHOTO_ANCHOR_HOURS.length - 1; i += 1) {
    const h0 = PHOTO_ANCHOR_HOURS[i];
    const h1 = PHOTO_ANCHOR_HOURS[i + 1];
    if (hours >= h0 && hours <= h1) {
      const ratio = (hours - h0) / (h1 - h0);
      return roundClinical(anchors[i] + ratio * (anchors[i + 1] - anchors[i]), 1);
    }
  }
  return anchors[3];
}

export const neonatalPhototherapyExchangeAap2022Calculator: CalculatorDefinition = {
  id: 'neonatal-phototherapy-exchange-aap2022',
  name: 'Neonatología: Criterios de Fototerapia y Exanguinotransfusión (AAP 2022)',
  shortName: 'Fototerapia y Exanguinotransfusión (AAP 2022)',
  primarySpecialty: 'pediatria',
  secondarySpecialties: ['gineco-obstetricia', 'urgencias'],
  subcategory: 'diagnostico',
  keywords: [
    'fototerapia',
    'exanguinotransfusion',
    'hiperbilirrubinemia',
    'ictericia neonatal',
    'aap 2022',
    'bilirrubina',
    'kernicterus',
    'escalada de cuidados',
    'neonatologia',
  ],
  description:
    'Evalúa la indicación exacta de fototerapia intensiva, Zona de Escalada de Cuidados (≤ 2 mg/dL bajo exanguino), exanguinotransfusión y relación Bilirrubina/Albúmina según la guía AAP 2022 (Kemper et al.).',
  clinicalIndication:
    'Recién nacidos ≥ 35 semanas de gestación con ictericia o hiperbilirrubinemia en las primeras 2 semanas de vida.',
  validatedPopulation: 'Recién nacidos ≥ 35 semanas de edad gestacional (no aplica en prematuros < 35 semanas).',
  contraindications: [
    'No aplicar en prematuros < 35 semanas de edad gestacional (requieren guías específicas por peso/edad como NICE o Maisels < 35 s).',
    'Nunca basar la decisión en bilirrubina transcutánea (TcB) una vez iniciada la fototerapia ni restar la bilirrubina directa.',
  ],
  limitations: [
    'Para edades entre 24 y 96 h se interpolan linealmente los puntos publicados de AAP 2022; antes de 24 h toda ictericia significativa es patológica y exige manejo urgente y verificación en la curva oficial horaria.',
    'Cuando existen factores de riesgo de neurotoxicidad adicionales, los umbrales de exanguinotransfusión descienden ~2–4 mg/dL respecto a la curva sin riesgo.',
  ],
  version: 'AAP Hyperbilirubinemia CPG (Kemper et al., Pediatrics 2022)',
  references: [
    {
      citation:
        'Kemper AR, Newman TB, Slaughter JL, et al. Clinical Practice Guideline Revision: Management of Hyperbilirubinemia in the Newborn Infant 35 or More Weeks of Gestation. Pediatrics. 2022;150(3):e2022058859.',
      year: 2022,
    },
  ],
  fields: [gaField, hoursField, tsbField, albuminField, neuroRiskField, abeSignsField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(neonatalPhototherapyExchangeAap2022Calculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const ga = String(inputs.gestationalAgeWeeks) as GaKey;
    const gaNum = Number(ga);
    const hours = getCanonicalNumberValue(hoursField, inputs.hoursOfLife as NumberInputValue).canonicalValue!;
    const tsb = roundClinical(
      getCanonicalNumberValue(tsbField, inputs.tsb as NumberInputValue).canonicalValue!,
      1,
    );
    const albumin = getCanonicalNumberValue(albuminField, inputs.albumin as NumberInputValue).canonicalValue;
    const lowAlbumin = albumin !== null && albumin < 3.0;
    const hasRisk = Boolean(inputs.hasNeuroRiskFactors) || lowAlbumin;
    const hasAbe = Boolean(inputs.hasAbeSigns);

    const photoAnchors = hasRisk ? PHOTO_WITH_RISK[ga] : PHOTO_NO_RISK[ga];
    const photoThreshold = interpolateAtHours(photoAnchors, hours);
    const stopPhotoThreshold = roundClinical(Math.max(0, photoThreshold - 2.0), 1);

    const exchGroup = gaNum === 35 ? '35' : gaNum <= 37 ? '36_37' : '38_plus';
    const baseExchangeThreshold = interpolateAtHours(EXCHANGE_NO_RISK[exchGroup], hours);
    // AAP 2022 lowers exchange curves by ~2.5 mg/dL (range 2-4 mg/dL) when neurotoxicity risk factors are present
    const effectiveExchangeRef = hasRisk ? roundClinical(baseExchangeThreshold - 2.5, 1) : baseExchangeThreshold;
    const escalationThreshold = roundClinical(effectiveExchangeRef - 2.0, 1);

    // Bilirubin / Albumin (B/A) ratio check
    let baRatio: number | null = null;
    const baCutoff = gaNum < 38 ? (hasRisk ? 6.8 : 7.2) : hasRisk ? 7.2 : 8.0;
    let baExceeded = false;
    if (albumin !== null && albumin > 0) {
      baRatio = roundClinical(tsb / albumin, 2);
      baExceeded = baRatio >= baCutoff;
    }

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (hasAbe) {
      severity = 'critical';
      riskClassification = 'EMERGENCIA: EXANGUINOTRANSFUSIÓN INMEDIATA (EBA)';
      clinicalInterpretation =
        'La presencia de signos de Encefalopatía Bilirrubínica Aguda (EBA) indica exanguinotransfusión urgente independientemente del valor de BST.';
      guidance.push(
        'Ingreso inmediato a UCIN, fototerapia intensiva máxima mientras se prepara sangre cruzada para exanguinotransfusión de doble volumen.',
      );
    } else if (tsb >= effectiveExchangeRef || baExceeded) {
      severity = 'critical';
      riskClassification = 'EXANGUINOTRANSFUSIÓN INDICADA (o umbral B/A superado)';
      clinicalInterpretation = `BST ${tsb} mg/dL ${tsb >= effectiveExchangeRef ? `alcanza o supera la referencia de exanguinotransfusión (~${effectiveExchangeRef} mg/dL)` : ''}${baExceeded ? `${tsb >= effectiveExchangeRef ? ' y ' : ''}relación B/A ${baRatio} ≥ ${baCutoff}` : ''}.`;
      guidance.push(
        'EMERGENCIA NEONATAL: Ingreso UCIN, fototerapia intensiva múltiple continua, hidratación IV, albúmina sérica/pruebas cruzadas y preparación inmediata para exanguinotransfusión.',
      );
    } else if (tsb >= escalationThreshold) {
      severity = 'critical';
      riskClassification = 'ZONA DE ESCALADA DE CUIDADOS (≤ 2 mg/dL del umbral de exanguino)';
      clinicalInterpretation = `BST ${tsb} mg/dL se encuentra dentro de los 2 mg/dL previos al umbral de exanguinotransfusión (~${effectiveExchangeRef} mg/dL).`;
      guidance.push(
        'ESCALADA DE CUIDADOS AAP 2022: Ingreso inmediato a UCIN, fototerapia intensiva máxima sin interrupciones, hidratación IV si procede, solicitar albúmina, grupo/Rh/Coombs y pruebas cruzadas; repetir BST en ≤ 2 h.',
      );
    } else if (tsb >= photoThreshold || hours < 24) {
      severity = hours < 24 ? 'high' : 'high';
      riskClassification =
        hours < 24 && tsb < photoThreshold
          ? 'ALERTA < 24 h: Ictericia precoz — Evaluar hemólisis e inicio de fototerapia'
          : 'FOTOTERAPIA INDICADA (AAP 2022)';
      clinicalInterpretation =
        hours < 24
          ? `Edad postnatal < 24 h (${hours} h) con BST ${tsb} mg/dL (umbral de referencia a las 24 h: ${photoThreshold} mg/dL). Toda ictericia < 24 h requiere descarte urgente de enfermedad hemolítica.`
          : `BST ${tsb} mg/dL ≥ umbral de fototerapia (${photoThreshold} mg/dL para ${ga} sem a las ${hours} h${hasRisk ? ' con FR' : ' sin FR'}).`;
      guidance.push(
        `Iniciar fototerapia intensiva (irradiancia ≥ 30 µW/cm²/nm, máxima superficie expuesta con protección ocular). Meta para suspender fototerapia: descenso a ≤ ${stopPhotoThreshold} mg/dL (2 mg/dL bajo umbral de inicio).`,
        'Mantener lactancia materna frecuente (8–12 tomas/día) y repetir BST en 4–12 h según velocidad de ascenso.',
      );
    } else {
      const deltaToPhoto = roundClinical(photoThreshold - tsb, 1);
      severity = deltaToPhoto <= 2.0 ? 'moderate' : 'low';
      riskClassification =
        deltaToPhoto <= 2.0
          ? 'Bajo umbral de fototerapia (seguimiento estrecho: delta ≤ 2.0 mg/dL)'
          : 'Bajo umbral de fototerapia (vigilancia clínica habitual)';
      clinicalInterpretation = `BST ${tsb} mg/dL está ${deltaToPhoto} mg/dL por debajo del umbral de fototerapia (${photoThreshold} mg/dL).`;
      guidance.push(
        deltaToPhoto <= 2.0
          ? 'Por cercanía al umbral (Δ ≤ 2 mg/dL), repetir TcB/BST en 12–24 h antes de egresar o en seguimiento precoz.'
          : 'Programar seguimiento ambulatorio según curva delta-BST (AAP Fig. 6–7) y reforzar signos de alarma y lactancia materna.',
      );
    }

    if (lowAlbumin && !inputs.hasNeuroRiskFactors) {
      guidance.push(
        `Se activó automáticamente el perfil CON riesgo de neurotoxicidad porque la albúmina sérica (${albumin} g/dL) es < 3.0 g/dL.`,
      );
    }

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Umbral de Fototerapia AAP 2022',
        formattedValue: `${formatClinicalNumber(photoThreshold, 1)} mg/dL`,
        unit: `(suspender si ≤ ${formatClinicalNumber(stopPhotoThreshold, 1)} mg/dL)`,
      },
      {
        label: 'Zona de Escalada de Cuidados',
        formattedValue: `≥ ${formatClinicalNumber(escalationThreshold, 1)} mg/dL`,
        unit: '(2 mg/dL bajo exanguino)',
      },
      {
        label: hasRisk
          ? 'Referencia Exanguinotransfusión (con FR orientativa)'
          : 'Umbral de Exanguinotransfusión (sin FR)',
        formattedValue: `${formatClinicalNumber(effectiveExchangeRef, 1)} mg/dL`,
        unit: hasRisk ? `(sin FR: ${formatClinicalNumber(baseExchangeThreshold, 1)} mg/dL)` : '',
      },
    ];

    if (baRatio !== null) {
      secondaryResults.push({
        label: 'Relación Bilirrubina / Albúmina (B/A)',
        formattedValue: `${formatClinicalNumber(baRatio, 2)}`,
        unit: `corte exanguino ≥ ${baCutoff}`,
        note: baExceeded ? 'SUPERADO el corte B/A de exanguinotransfusión' : 'Dentro de rango permitido',
      });
    }

    return {
      primaryResult: {
        label: 'Bilirrubina Sérica Total (BST) vs. Umbral',
        value: tsb,
        formattedValue: `${formatClinicalNumber(tsb, 1)} mg/dL`,
        unit: `(umbral foto: ${formatClinicalNumber(photoThreshold, 1)} mg/dL)`,
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer:
        'Para valores horarios extremos (< 24 h o > 96 h) o presencia simultánea de múltiples factores hemolíticos, corroborar en el nomograma continuo oficial AAP 2022.',
      formulaUsed:
        'Curvas horarias AAP 2022 (Kemper et al.) por EG y factores de neurotoxicidad + Escalada (Exanguino - 2 mg/dL) + Relación B/A',
      inputsSummary: `EG ${ga} sem · ${hours} h · BST ${tsb} mg/dL · FR neurotoxicidad: ${hasRisk ? 'Sí' : 'No'}`,
    };
  },
};
