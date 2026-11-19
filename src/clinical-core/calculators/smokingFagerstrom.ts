import {
  formatClinicalNumber,
  getCanonicalNumberValue,
  roundClinical,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const cigsPerDayField: NumberFieldDef = {
  id: 'cigsPerDay',
  label: 'Cigarrillos fumados al día (promedio)',
  type: 'number',
  canonicalUnit: 'cig/día',
  units: [{ id: 'cigs', label: 'cigarrillos/día', toCanonical: (v) => v, min: 1, max: 100, step: 1 }],
  defaultUnitId: 'cigs',
  min: 1,
  max: 100,
  placeholder: '15',
};

const yearsSmokingField: NumberFieldDef = {
  id: 'yearsSmoking',
  label: 'Años de consumo tabáquico',
  type: 'number',
  canonicalUnit: 'años',
  units: [{ id: 'years', label: 'años', toCanonical: (v) => v, min: 0.5, max: 90, step: 0.5 }],
  defaultUnitId: 'years',
  min: 0.5,
  max: 90,
  placeholder: '20',
};

const ftndQ1: SelectFieldDef = {
  id: 'q1',
  label: '1. ¿Cuánto tiempo pasa tras despertar hasta el primer cigarrillo?',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '3', label: '≤ 5 minutos (+3)', points: 3 },
    { value: '2', label: '6 – 30 minutos (+2)', points: 2 },
    { value: '1', label: '31 – 60 minutos (+1)', points: 1 },
    { value: '0', label: '> 60 minutos (0)', points: 0 },
  ],
};

const ftndQ2: SelectFieldDef = {
  id: 'q2',
  label: '2. ¿Le cuesta abstenerse en lugares prohibidos?',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'No (0)', points: 0 },
    { value: '1', label: 'Sí (+1)', points: 1 },
  ],
};

const ftndQ3: SelectFieldDef = {
  id: 'q3',
  label: '3. ¿Qué cigarrillo le costaría más dejar?',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '1', label: 'El primero de la mañana (+1)', points: 1 },
    { value: '0', label: 'Cualquier otro (0)', points: 0 },
  ],
};

const ftndQ4: SelectFieldDef = {
  id: 'q4',
  label: '4. ¿Cuántos cigarrillos fuma al día? (Fagerström)',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '0', label: '≤ 10 cigarrillos/día (0)', points: 0 },
    { value: '1', label: '11 – 20 cigarrillos/día (+1)', points: 1 },
    { value: '2', label: '21 – 30 cigarrillos/día (+2)', points: 2 },
    { value: '3', label: '≥ 31 cigarrillos/día (+3)', points: 3 },
  ],
};

const ftndQ5: SelectFieldDef = {
  id: 'q5',
  label: '5. ¿Fuma más durante las primeras horas tras despertar que el resto del día?',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'No (0)', points: 0 },
    { value: '1', label: 'Sí (+1)', points: 1 },
  ],
};

const ftndQ6: SelectFieldDef = {
  id: 'q6',
  label: '6. ¿Fuma incluso cuando está tan enfermo que pasa la mayor parte del día en cama?',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'No (0)', points: 0 },
    { value: '1', label: 'Sí (+1)', points: 1 },
  ],
};

export const smokingFagerstromCalculator: CalculatorDefinition = {
  id: 'smoking-fagerstrom',
  name: 'Índice Tabáquico (Paquetes-Año) y Test de Fagerström',
  shortName: 'Tabaquismo / Fagerström',
  primarySpecialty: 'neumologia',
  secondarySpecialties: ['psiquiatria', 'medicina-interna'],
  subcategory: 'diagnostico',
  keywords: ['tabaquismo', 'fagerstrom', 'paquetes ano', 'indice tabaquico', 'nicotina', 'epoc', 'cancer pulmon'],
  description:
    'Calcula la exposición acumulada al tabaco (paquetes-año) junto con el Test de Fagerström (0–10 puntos) para cuantificar dependencia física a la nicotina.',
  clinicalIndication:
    'Evaluación de riesgo acumulado de EPOC y neoplasia pulmonar (tamizaje con TC baja dosis en ≥ 20 paquetes-año según USPSTF) y planificación de cesación tabáquica.',
  validatedPopulation: 'Adultos fumadores activos o exfumadores (paquetes-año) y fumadores activos (Fagerström).',
  contraindications: [
    'El Test de Fagerström no está validado para cigarrillos electrónicos/vapeo ni tabaco sin humo sin adaptación específica.',
  ],
  limitations: [
    'El índice paquetes-año asume intensidad constante y cajetillas de 20 cigarrillos; en consumo variable conviene calcular por periodos.',
  ],
  version: 'Heatherton et al. FTND (1991)',
  references: [
    {
      citation:
        'Heatherton TF, Kozlowski LT, Frecker RC, Fagerström KO. The Fagerström Test for Nicotine Dependence: a revision of the Fagerström Tolerance Questionnaire. Br J Addict. 1991;86(9):1119-1127.',
      year: 1991,
    },
  ],
  fields: [cigsPerDayField, yearsSmokingField, ftndQ1, ftndQ2, ftndQ3, ftndQ4, ftndQ5, ftndQ6],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(smokingFagerstromCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const cigs = getCanonicalNumberValue(cigsPerDayField, inputs.cigsPerDay as NumberInputValue).canonicalValue!;
    const years = getCanonicalNumberValue(yearsSmokingField, inputs.yearsSmoking as NumberInputValue).canonicalValue!;
    const packYears = roundClinical((cigs / 20) * years, 1);

    const ftnd =
      Number(inputs.q1) +
      Number(inputs.q2) +
      Number(inputs.q3) +
      Number(inputs.q4) +
      Number(inputs.q5) +
      Number(inputs.q6);

    let depLabel = 'Dependencia muy baja';
    if (ftnd >= 8) depLabel = 'Dependencia muy alta';
    else if (ftnd >= 6) depLabel = 'Dependencia alta';
    else if (ftnd === 5) depLabel = 'Dependencia moderada';
    else if (ftnd >= 3) depLabel = 'Dependencia baja';

    let severity: SeverityLevel = 'low';
    if (packYears >= 20 || ftnd >= 6) severity = 'high';
    else if (packYears >= 10 || ftnd >= 4) severity = 'moderate';

    const riskClassification = `${formatClinicalNumber(packYears, 1)} paq-año · Fagerström ${ftnd}/10 (${depLabel})`;
    const clinicalInterpretation =
      packYears >= 20
        ? 'Exposición tabáquica acumulada elevada (≥ 20 paquetes-año): riesgo sustancial de EPOC, enfermedad cardiovascular y cáncer pulmonar.'
        : packYears >= 10
          ? 'Exposición tabáquica acumulada moderada (≥ 10 paquetes-año): amerita consejería intensiva para cese tabáquico y valoración clínica respiratoria.'
          : 'Exposición acumulada < 10 paquetes-año; ningún nivel de tabaquismo es seguro y el abandono temprano maximiza el beneficio.';

    const guidance = [
      ftnd >= 5
        ? 'Dependencia moderada-alta a nicotina: suele beneficiarse de farmacoterapia de primera línea (terapia de reemplazo nicotínico combinada, vareniclina o bupropión) junto con apoyo conductual.'
        : 'Ofrecer intervención breve (5A), fijar fecha de abandono y valorar terapia de apoyo según motivación y síntomas de abstinencia.',
    ];
    if (packYears >= 20) {
      guidance.push('En adultos 50–80 años con ≥ 20 paquetes-año (activos o exfumadores < 15 años), valorar tamizaje anual con TC torácica de baja dosis (USPSTF).');
    }

    return {
      primaryResult: {
        label: 'Índice Tabáquico',
        value: packYears,
        formattedValue: formatClinicalNumber(packYears, 1),
        unit: 'paquetes-año',
      },
      secondaryResults: [
        { label: 'Test de Fagerström (FTND)', formattedValue: `${ftnd} / 10`, unit: depLabel },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'Confirmar contraindicaciones individuales antes de prescribir farmacoterapia para cesación.',
      formulaUsed: 'Paquetes-año = (Cigarrillos/día ÷ 20) × Años · FTND = Suma 6 ítems (0–10)',
      inputsSummary: `${cigs} cig/día × ${years} años = ${formatClinicalNumber(packYears, 1)} paq-año · FTND: ${ftnd}/10`,
    };
  },
};
