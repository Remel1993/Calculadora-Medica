import {
  getCanonicalNumberValue,
  roundClinical,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SecondaryResultItem,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';
import { BP_UNITS_MMHG } from '../units/converters.ts';

// AAP 2017 Table 6: Screening BP Values Requiring Further Evaluation (Flynn et al., Pediatrics 2017)
const AAP_SCREENING_TABLE_6: Record<number, { male: [number, number]; female: [number, number] }> = {
  1: { male: [98, 52], female: [98, 54] },
  2: { male: [100, 55], female: [101, 58] },
  3: { male: [101, 58], female: [102, 60] },
  4: { male: [102, 60], female: [103, 62] },
  5: { male: [103, 63], female: [104, 64] },
  6: { male: [105, 66], female: [105, 67] },
  7: { male: [106, 68], female: [106, 68] },
  8: { male: [107, 69], female: [107, 69] },
  9: { male: [107, 70], female: [108, 71] },
  10: { male: [108, 72], female: [109, 72] },
  11: { male: [110, 74], female: [111, 74] },
  12: { male: [113, 75], female: [114, 75] },
};

const sexField: SelectFieldDef = {
  id: 'sex',
  label: 'Sexo biológico',
  type: 'select',
  defaultValue: 'male',
  options: [
    { value: 'male', label: 'Niño / Varón' },
    { value: 'female', label: 'Niña / Mujer' },
  ],
};

const ageField: NumberFieldDef = {
  id: 'ageYears',
  label: 'Edad (1 a 17 años)',
  type: 'number',
  canonicalUnit: 'años',
  units: [{ id: 'years', label: 'años', toCanonical: (v) => v, min: 1, max: 17, step: 1 }],
  defaultUnitId: 'years',
  defaultValue: '8',
  min: 1,
  max: 17,
  placeholder: '8',
  helpText: 'De 1 a 12 años usa Tabla 6 de cribado AAP 2017 (percentil 90 para talla p5). De 13 a 17 años usa cortes absolutos AAP 2017.',
};

const sbpField: NumberFieldDef = {
  id: 'sbp',
  label: 'Presión arterial sistólica (PAS)',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  defaultValue: '102',
  min: 50,
  max: 240,
  placeholder: '102',
};

const dbpField: NumberFieldDef = {
  id: 'dbp',
  label: 'Presión arterial diastólica (PAD)',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  defaultValue: '64',
  min: 25,
  max: 160,
  placeholder: '64',
};

export const pediatricBloodPressureCalculator: CalculatorDefinition = {
  id: 'pediatric-bp-aap',
  name: 'Presión Arterial Pediátrica — Cribado y Estadificación AAP 2017',
  shortName: 'Presión Arterial Pediátrica',
  primarySpecialty: 'pediatria',
  secondarySpecialties: ['cardiologia', 'nefrologia'],
  subcategory: 'diagnostico',
  keywords: [
    'presion arterial pediatrica',
    'hipertension infantil',
    'aap 2017',
    'flynn',
    'nino sano',
    'pediatria',
    'consulta externa',
  ],
  description:
    'Evalúa la presión arterial en consulta pediátrica según la Guía AAP 2017 (Flynn et al.): tabla simplificada de cribado (1–12 años) y clasificación diagnóstica exacta en adolescentes (13–17 años).',
  clinicalIndication:
    'Control de niño sano (≥ 3 años anualmente, o desde 1 año en alto riesgo renal/cardíaco) para detectar cifras que requieren evaluación ampliada o estadificación hipertensiva.',
  validatedPopulation: 'Niños y adolescentes de 1 a 17 años.',
  contraindications: [
    'No utilizar en lactantes < 1 año (requieren tablas neonatales específicas).',
    'En < 13 años, superar el corte de Tabla 6 es un CRIBADO positivo, NO un diagnóstico automático de HTA: requiere repetir por auscultación y consultar percentiles exactos de talla.',
  ],
  limitations: [
    'La Tabla 6 AAP 2017 corresponde al percentil 90 para niños en el percentil 5 de talla (VPN > 99% para descartar HTA); niños altos con cifras por encima de la tabla pueden estar dentro de percentiles normales al ajustar por su talla.',
    'Confirmar siempre con manguito del tamaño adecuado (ancho 40% y largo 80–100% de la circunferencia del brazo) y método auscultatorio si el oscilométrico resulta elevado.',
  ],
  version: 'AAP Clinical Practice Guideline (Flynn et al., Pediatrics 2017)',
  references: [
    {
      citation:
        'Flynn JT, Kaelber DC, Baker-Smith CM, et al. Clinical Practice Guideline for Screening and Management of High Blood Pressure in Children and Adolescents. Pediatrics. 2017;140(3):e20171904.',
      year: 2017,
    },
  ],
  fields: [sexField, ageField, sbpField, dbpField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(pediatricBloodPressureCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const sex = inputs.sex === 'female' ? 'female' : 'male';
    const age = Math.floor(getCanonicalNumberValue(ageField, inputs.ageYears as NumberInputValue).canonicalValue!);
    const sbp = roundClinical(getCanonicalNumberValue(sbpField, inputs.sbp as NumberInputValue).canonicalValue!, 0);
    const dbp = roundClinical(getCanonicalNumberValue(dbpField, inputs.dbp as NumberInputValue).canonicalValue!, 0);

    if (dbp >= sbp) {
      throw new Error('La presión arterial diastólica debe ser menor que la sistólica.');
    }

    // Adolescents >= 13 years: exact absolute AAP 2017 staging
    if (age >= 13) {
      let severity: SeverityLevel = 'normal';
      let category = 'PA Normal';
      let riskClassification = '';
      let clinicalInterpretation = '';
      const guidance: string[] = [];

      if (sbp >= 140 || dbp >= 90) {
        severity = 'critical';
        category = 'HTA Estadio 2';
        riskClassification = `Hipertensión Arterial Estadio 2 (≥ 140/90 mmHg · ${sbp}/${dbp})`;
        clinicalInterpretation =
          'Cifras en rango de HTA Estadio 2 según AAP 2017 en ≥ 13 años.';
        guidance.push(
          'Repetir medición en ambos brazos y miembro inferior (descartar coartación), buscar síntomas de órgano blanco (si hay síntomas agudos, derivar a urgencias) e iniciar estudio etiológico/nefrología pediátrica en < 1 semana.',
        );
      } else if (sbp >= 130 || dbp >= 80) {
        severity = 'high';
        category = 'HTA Estadio 1';
        riskClassification = `Hipertensión Arterial Estadio 1 (130–139 / 80–89 mmHg · ${sbp}/${dbp})`;
        clinicalInterpretation =
          'Cifras en rango de HTA Estadio 1 según AAP 2017 en ≥ 13 años; requiere confirmación en 3 visitas separadas (o MAPA).';
        guidance.push(
          'Confirmar por auscultación, repetir en 1–2 semanas y considerar monitorización ambulatoria de presión arterial (MAPA) antes de etiquetar HTA crónica.',
        );
      } else if (sbp >= 120 && dbp < 80) {
        severity = 'moderate';
        category = 'PA Elevada';
        riskClassification = `Presión Arterial Elevada (120–129 / < 80 mmHg · ${sbp}/${dbp})`;
        clinicalInterpretation =
          'Rango de PA elevada en adolescentes ≥ 13 años según AAP 2017.';
        guidance.push(
          'Indicar cambios en estilo de vida (reducción de sodio, actividad física, control ponderal) y reevaluar PA en 6 meses.',
        );
      } else {
        severity = 'normal';
        category = 'PA Normal';
        riskClassification = `Presión Arterial Normal (< 120/80 mmHg · ${sbp}/${dbp})`;
        clinicalInterpretation = 'Cifras normales para adolescente ≥ 13 años según guía AAP 2017.';
        guidance.push('Repetir cribado anual en control de salud.');
      }

      return {
        primaryResult: {
          label: `AAP 2017 (≥ 13 años): ${category}`,
          value: sbp,
          formattedValue: `${sbp}/${dbp}`,
          unit: 'mmHg',
        },
        secondaryResults: [
          { label: 'Categoría AAP 2017', formattedValue: category, unit: '' },
          { label: 'Corte normal ≥ 13 años', formattedValue: '< 120 / < 80', unit: 'mmHg' },
        ],
        severity,
        riskClassification,
        clinicalInterpretation,
        guidance,
        formulaUsed: 'Guía AAP 2017 para ≥ 13 años (Normal <120/80 · Elevada 120–129/<80 · HTA1 130–139/80–89 · HTA2 ≥140/90)',
        inputsSummary: `${sex === 'male' ? 'Varón' : 'Mujer'}, ${age} años · PA ${sbp}/${dbp} mmHg`,
      };
    }

    // 1 to 12 years: AAP 2017 Table 6 screening thresholds
    const clampedAge = Math.max(1, Math.min(12, age));
    const [cutSbp, cutDbp] = AAP_SCREENING_TABLE_6[clampedAge][sex];
    const sbpFlag = sbp >= cutSbp;
    const dbpFlag = dbp >= cutDbp;
    const needsEval = sbpFlag || dbpFlag;

    let severity: SeverityLevel = needsEval ? 'high' : 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (!needsEval) {
      severity = 'normal';
      riskClassification = `Cribado normal para ${clampedAge} años (< ${cutSbp}/${cutDbp} mmHg)`;
      clinicalInterpretation =
        `Tanto la PAS (${sbp}) como la PAD (${dbp}) están por debajo del umbral de cribado Tabla 6 AAP 2017 (${cutSbp}/${cutDbp} mmHg), con valor predictivo negativo > 99%.`;
      guidance.push('Mantener control anual habitual en consulta de niño sano (desde los 3 años).');
    } else {
      const marginSbp = sbp - cutSbp;
      const marginDbp = dbp - cutDbp;
      if (marginSbp >= 20 || marginDbp >= 15) {
        severity = 'critical';
      } else {
        severity = 'high';
      }
      riskClassification = `Cribado POSITIVO — Supera umbral Tabla 6 AAP 2017 (≥ ${cutSbp}/${cutDbp} mmHg)`;
      clinicalInterpretation =
        `Al menos una cifra (${sbpFlag ? `PAS ${sbp} ≥ ${cutSbp}` : ''}${sbpFlag && dbpFlag ? ' y ' : ''}${dbpFlag ? `PAD ${dbp} ≥ ${cutDbp}` : ''}) requiere evaluación detallada por percentil exacto de talla, sexo y edad.`;
      guidance.push(
        'Repetir 2 mediciones adicionales por método auscultatorio en reposo con manguito adecuado y promediar.',
        'Consultar las tablas normativas completas AAP 2017 ajustadas por percentil de talla del niño para distinguir PA normal en talla alta vs. PA elevada o HTA Estadio 1/2.',
      );
    }

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: `Umbral de cribado Tabla 6 (${clampedAge} a, ${sex === 'male' ? 'niño' : 'niña'})`,
        formattedValue: `≥ ${cutSbp} / ≥ ${cutDbp}`,
        unit: 'mmHg',
      },
      {
        label: 'Resultado del cribado',
        formattedValue: needsEval ? 'Requiere evaluación por talla' : 'Normal (VPN > 99%)',
        unit: '',
      },
    ];

    return {
      primaryResult: {
        label: 'Cribado PA Pediátrica (AAP 2017)',
        value: sbp,
        formattedValue: `${sbp}/${dbp}`,
        unit: 'mmHg',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: `AAP 2017 Tabla 6 (${clampedAge} años, ${sex === 'male' ? 'niño' : 'niña'}): ≥ ${cutSbp}/${cutDbp} mmHg`,
      inputsSummary: `${sex === 'male' ? 'Niño' : 'Niña'}, ${clampedAge} años · PA ${sbp}/${dbp} mmHg`,
    };
  },
};
