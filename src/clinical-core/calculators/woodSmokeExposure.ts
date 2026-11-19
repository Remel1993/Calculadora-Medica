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
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const hoursPerDayField: NumberFieldDef = {
  id: 'hoursPerDay',
  label: 'Promedio de horas diarias de exposición',
  type: 'number',
  canonicalUnit: 'h/día',
  units: [{ id: 'h_day', label: 'horas/día', toCanonical: (v) => v, min: 0.5, max: 24, step: 0.5 }],
  defaultUnitId: 'h_day',
  min: 0.5,
  max: 24,
  placeholder: '4',
  helpText: 'Horas promedio al día cocinando o permaneciendo en ambiente con humo de leña o biomasa.',
};

const yearsExposedField: NumberFieldDef = {
  id: 'yearsExposed',
  label: 'Años totales de exposición',
  type: 'number',
  canonicalUnit: 'años',
  units: [{ id: 'years', label: 'años', toCanonical: (v) => v, min: 0.5, max: 90, step: 0.5 }],
  defaultUnitId: 'years',
  min: 0.5,
  max: 90,
  placeholder: '25',
  helpText: 'Tiempo acumulado a lo largo de la vida expuesto a combustión de leña o biomasa.',
};

const ventilationField: SelectFieldDef = {
  id: 'ventilation',
  label: 'Tipo de fogón y ventilación del recinto',
  type: 'select',
  defaultValue: 'closed',
  options: [
    { value: 'closed', label: 'Cocina cerrada / fogón tradicional sin chimenea' },
    { value: 'partial', label: 'Ventilación parcial o estufa mejorada con chimenea' },
    { value: 'outdoor', label: 'Exposición en exterior o área ampliamente ventilada' },
  ],
};

const concomitantSmokingField: BooleanFieldDef = {
  id: 'concomitantSmoking',
  label: 'Tabaquismo concomitante (exposición mixta)',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Sí',
  falseLabel: 'No',
  helpText: 'La combinación de humo de leña y tabaco tiene efecto aditivo/sinérgico sobre el daño bronquial.',
};

export const woodSmokeExposureCalculator: CalculatorDefinition = {
  id: 'wood-smoke-exposure',
  name: 'Índice de Exposición al Humo de Leña (Horas-Año)',
  shortName: 'Exposición Humo de Leña',
  primarySpecialty: 'neumologia',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'diagnostico',
  keywords: [
    'humo de lena',
    'lena',
    'biomasa',
    'indice de biomasa',
    'exposicion',
    'horas ano',
    'epoc',
    'bronquitis cronica',
    'fogon',
    'estufa',
    'iner',
    'perez padilla',
  ],
  description:
    'Cuantifica la exposición acumulada a humo de leña o biomasa en horas-año (Horas/día × Años) para estratificar el riesgo de bronquitis crónica y EPOC asociada a biomasa.',
  clinicalIndication:
    'Anamnesis respiratoria en pacientes con antecedentes de cocción o calefacción con leña/biomasa, estudio de tos crónica, disnea o sospecha de EPOC en no fumadores.',
  validatedPopulation: 'Adultos con antecedente de exposición doméstica u ocupacional a humo de leña/biomasa.',
  contraindications: [
    'No constituye por sí mismo un diagnóstico de EPOC: la obstrucción crónica requiere confirmación mediante espirometría posbroncodilatador (FEV₁/FVC < 0.70).',
  ],
  limitations: [
    'Asume una exposición diaria homogénea durante los años reportados; si existieron etapas con distinta intensidad, conviene calcular por periodos y sumar los parciales.',
    'No mide directamente la concentración de partículas finas (PM₂.₅) ni monóxido de carbono, la cual varía ampliamente según ventilación, humedad de la madera y uso de chimenea.',
    'En guías latinoamericanas también se emplea el criterio práctico de ≥ 10 años de exposición cotidiana en cocina cerrada como antecedente relevante de cribado.',
  ],
  version: 'Pérez-Padilla et al. (1996) / GOLD Biomasa',
  references: [
    {
      citation:
        'Pérez-Padilla R, Regalado J, Vedal S, et al. Exposure to biomass smoke and chronic airway disease in Mexican women. A case-control study. Am J Respir Crit Care Med. 1996;154(3 Pt 1):701-706.',
      year: 1996,
    },
    {
      citation:
        'Ramírez-Venegas A, Sansores RH, Pérez-Padilla R, et al. Survival of patients with chronic obstructive pulmonary disease due to biomass smoke and tobacco. Am J Respir Crit Care Med. 2006;173(4):393-398.',
      year: 2006,
    },
    {
      citation:
        'Global Initiative for Chronic Obstructive Lung Disease (GOLD). Global Strategy for Prevention, Diagnosis and Management of COPD: 2024 Report.',
      year: 2024,
    },
  ],
  fields: [hoursPerDayField, yearsExposedField, ventilationField, concomitantSmokingField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(woodSmokeExposureCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const hoursPerDay = getCanonicalNumberValue(
      hoursPerDayField,
      inputs.hoursPerDay as NumberInputValue,
    ).canonicalValue!;
    const yearsExposed = getCanonicalNumberValue(
      yearsExposedField,
      inputs.yearsExposed as NumberInputValue,
    ).canonicalValue!;
    const ventilation = String(inputs.ventilation || 'closed');
    const concomitantSmoking = Boolean(inputs.concomitantSmoking);

    const hourYears = roundClinical(hoursPerDay * yearsExposed, 1);

    const ventilationLabel =
      ventilation === 'closed'
        ? 'Cocina cerrada / sin chimenea (mayor concentración de PM₂.₅)'
        : ventilation === 'partial'
          ? 'Ventilación parcial o chimenea'
          : 'Exterior / bien ventilado';

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';

    if (hourYears >= 200) {
      severity = 'high';
      riskClassification = 'Exposición intensa (≥ 200 horas-año) — Riesgo muy elevado';
      clinicalInterpretation =
        'Exposición acumulada intensa al humo de leña/biomasa (≥ 200 horas-año), fuertemente asociada en estudios epidemiológicos con bronquitis crónica, obstrucción al flujo aéreo (EPOC por biomasa), hiperreactividad bronquial e hipertensión pulmonar secundaria.';
    } else if (hourYears >= 100) {
      severity = concomitantSmoking ? 'high' : 'moderate';
      riskClassification =
        'Exposición significativa (100 – 199.9 horas-año) — Umbral de riesgo clínico';
      clinicalInterpretation =
        'Supera el umbral clásico de ≥ 100 horas-año descrito para riesgo incrementado de bronquitis crónica y EPOC por humo de biomasa.';
    } else if (yearsExposed >= 10 || concomitantSmoking) {
      severity = 'moderate';
      riskClassification =
        'Exposición acumulada < 100 horas-año con factores agravantes';
      clinicalInterpretation =
        'Aunque el índice cuantitativo es < 100 horas-año, la duración ≥ 10 años o el tabaquismo concomitante justifican interrogatorio dirigido de síntomas respiratorios.';
    } else {
      severity = 'low';
      riskClassification = 'Exposición acumulada baja (< 100 horas-año)';
      clinicalInterpretation =
        'Exposición por debajo del umbral epidemiológico clásico de 100 horas-año para EPOC por biomasa; aun así, la ausencia de ventilación adecuada incrementa la exposición real a partículas.';
    }

    const guidance: string[] = [
      hourYears >= 100 || concomitantSmoking
        ? 'Ante tos crónica, expectoración o disnea de esfuerzo, solicitar espirometría posbroncodilatador para confirmar o descartar EPOC (FEV₁/FVC < 0.70).'
        : 'Vigilar aparición de síntomas respiratorios crónicos y reevaluar si persiste la exposición intradomiciliaria.',
      ventilation === 'closed'
        ? 'Priorizar transición a combustibles limpios (gas/electricidad) o instalación de estufas mejoradas con chimenea exterior y ventilación cruzada.'
        : 'Mantener medidas de ventilación y reducción de exposición intradomiciliaria al humo de biomasa.',
    ];

    if (concomitantSmoking) {
      guidance.push(
        'Exposición mixta (biomasa + tabaco): cuantificar también el Índice Tabáquico (paquetes-año) y ofrecer intervención estructurada para cesación tabáquica.',
      );
    }

    return {
      primaryResult: {
        label: 'Índice de Exposición al Humo de Leña',
        value: hourYears,
        formattedValue: formatClinicalNumber(hourYears, 1),
        unit: 'horas-año',
      },
      secondaryResults: [
        {
          label: 'Umbral de riesgo significativo (Pérez-Padilla)',
          formattedValue: hourYears >= 100 ? 'Superado (≥ 100)' : 'Por debajo (< 100)',
          unit: 'horas-año',
        },
        {
          label: 'Duración acumulada',
          formattedValue: formatClinicalNumber(yearsExposed, 1),
          unit: yearsExposed >= 10 ? 'años (≥ 10 años)' : 'años',
        },
        {
          label: 'Condición ambiental',
          formattedValue: ventilationLabel,
          unit: '',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer:
        'Herramienta de evaluación epidemiológica de exposición; el diagnóstico de EPOC requiere confirmación espirométrica.',
      formulaUsed: 'IEHL (horas-año) = Promedio de horas diarias × Años de exposición',
      inputsSummary: `${formatClinicalNumber(hoursPerDay, 1)} h/día × ${formatClinicalNumber(yearsExposed, 1)} años = ${formatClinicalNumber(hourYears, 1)} horas-año · ${ventilation === 'closed' ? 'Cocina cerrada' : ventilation === 'partial' ? 'Ventilación parcial' : 'Exterior'}${concomitantSmoking ? ' · Tabaquismo (+)' : ''}`,
    };
  },
};
