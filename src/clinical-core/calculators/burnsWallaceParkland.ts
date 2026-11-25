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
import { WEIGHT_UNITS_KG } from '../units/converters.ts';

const weightField: NumberFieldDef = {
  id: 'weight',
  label: 'Peso corporal del paciente',
  type: 'number',
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  min: 20,
  max: 250,
  placeholder: '70',
};

const hoursElapsedField: NumberFieldDef = {
  id: 'hoursElapsed',
  label: 'Horas transcurridas desde la quemadura',
  type: 'number',
  canonicalUnit: 'horas',
  units: [{ id: 'h', label: 'horas', toCanonical: (v) => v, min: 0, max: 24, step: 0.5 }],
  defaultUnitId: 'h',
  defaultValue: '0',
  min: 0,
  max: 24,
  placeholder: '0',
  helpText: 'La primera mitad (50 %) de Parkland se repone en las primeras 8 horas desde el MOMENTO de la quemadura.',
};

const headField: SelectFieldDef = {
  id: 'head',
  label: 'Cabeza y cuello (2.º y 3.º grado)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 % (no afectada o 1.º grado)' },
    { value: '4.5', label: '4.5 % (afectación parcial)' },
    { value: '9', label: '9 % (completa)' },
  ],
};

const antTrunkField: SelectFieldDef = {
  id: 'antTrunk',
  label: 'Tronco anterior (tórax y abdomen)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 %' },
    { value: '9', label: '9 % (mitad)' },
    { value: '18', label: '18 % (completo)' },
  ],
};

const postTrunkField: SelectFieldDef = {
  id: 'postTrunk',
  label: 'Tronco posterior (espalda y glúteos)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 %' },
    { value: '9', label: '9 % (mitad)' },
    { value: '18', label: '18 % (completo)' },
  ],
};

const rightArmField: SelectFieldDef = {
  id: 'rightArm',
  label: 'Extremidad superior derecha',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 %' },
    { value: '4.5', label: '4.5 % (parcial)' },
    { value: '9', label: '9 % (completa)' },
  ],
};

const leftArmField: SelectFieldDef = {
  id: 'leftArm',
  label: 'Extremidad superior izquierda',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 %' },
    { value: '4.5', label: '4.5 % (parcial)' },
    { value: '9', label: '9 % (completa)' },
  ],
};

const rightLegField: SelectFieldDef = {
  id: 'rightLeg',
  label: 'Extremidad inferior derecha',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 %' },
    { value: '9', label: '9 % (parcial)' },
    { value: '18', label: '18 % (completa)' },
  ],
};

const leftLegField: SelectFieldDef = {
  id: 'leftLeg',
  label: 'Extremidad inferior izquierda',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 %' },
    { value: '9', label: '9 % (parcial)' },
    { value: '18', label: '18 % (completa)' },
  ],
};

const perineumField: SelectFieldDef = {
  id: 'perineum',
  label: 'Periné / área genital',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 %' },
    { value: '1', label: '1 %' },
  ],
};

export const burnsWallaceParklandCalculator: CalculatorDefinition = {
  id: 'burns-parkland',
  name: 'Quemaduras — Regla de los 9 de Wallace y Fórmula de Parkland',
  shortName: 'Quemaduras (Wallace / Parkland)',
  primarySpecialty: 'urgencias',
  secondarySpecialties: ['cirugia-general', 'dermatologia'],
  subcategory: 'liquidos',
  keywords: ['quemaduras', 'wallace', 'regla de los 9', 'parkland', 'scq', 'reposicion hidrica', 'ringer lactato'],
  description:
    'Estima el porcentaje de superficie corporal quemada (%SCQ) en adultos mediante la Regla de los 9 de Wallace y calcula la reposición inicial con Ringer Lactato según la fórmula de Parkland.',
  clinicalIndication:
    'Reanimación hídrica inicial en adultos con quemaduras térmicas de 2.º y 3.º grado que afectan ≥ 15–20 % de la superficie corporal.',
  validatedPopulation: 'Adultos (en niños la cabeza representa hasta ~18–19 % y cada pierna ~13–14 %, por lo que debe usarse la tabla de Lund-Browder).',
  contraindications: [
    'NO incluir quemaduras de 1.º grado (eritema superficial sin flictenas) en el cálculo del %SCQ.',
    'NO usar la Regla de los 9 de adultos en niños pequeños (usar Lund-Browder pediátrica).',
  ],
  limitations: [
    'Controversia/actualización clínica: Parkland clásica utiliza 4 mL/kg/%SCQ, mientras la guía ABA (American Burn Association) / ATLS 10.ª ed. inicia frecuentemente con 2 mL/kg/%SCQ en quemaduras térmicas de adultos (4 mL/kg en quemaduras eléctricas o pediatría) y ajusta hora a hora para evitar sobrecarga hídrica ("fluid creep").',
    'Titular siempre la velocidad real según diuresis objetivo (0.5 mL/kg/h en adultos; 1 mL/kg/h si rabdomiólisis o quemadura eléctrica).',
  ],
  version: 'Wallace (1951) & Parkland / Baxter (1968)',
  references: [
    {
      citation:
        'Baxter CR, Shires T. Physiological response to crystalloid resuscitation of severe burns. Ann N Y Acad Sci. 1968;150(3):874-894.',
      year: 1968,
    },
    {
      citation:
        'American Burn Association. Advanced Burn Life Support (ABLS) Course Manual & Practice Guidelines for Burn Shock Resuscitation. J Burn Care Res. 2024.',
      year: 2024,
    },
  ],
  fields: [
    weightField,
    hoursElapsedField,
    headField,
    antTrunkField,
    postTrunkField,
    rightArmField,
    leftArmField,
    rightLegField,
    leftLegField,
    perineumField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(burnsWallaceParklandCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const weight = getCanonicalNumberValue(weightField, inputs.weight as NumberInputValue).canonicalValue!;
    const hours = getCanonicalNumberValue(hoursElapsedField, inputs.hoursElapsed as NumberInputValue).canonicalValue!;

    const tbsa = roundClinical(
      Number(inputs.head) +
        Number(inputs.antTrunk) +
        Number(inputs.postTrunk) +
        Number(inputs.rightArm) +
        Number(inputs.leftArm) +
        Number(inputs.rightLeg) +
        Number(inputs.leftLeg) +
        Number(inputs.perineum),
      1,
    );

    const total24h = roundClinical(4 * weight * tbsa, 0);
    const half24h = roundClinical(total24h / 2, 0);
    const abaLow24h = roundClinical(2 * weight * tbsa, 0);

    const first8Rate =
      hours < 8 ? roundClinical(half24h / Math.max(0.5, 8 - hours), 0) : 0;
    const next16HoursRemaining = hours <= 8 ? 16 : Math.max(1, 24 - hours);
    const next16Rate = roundClinical(half24h / next16HoursRemaining, 0);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (tbsa === 0) {
      severity = 'normal';
      riskClassification = '0 % SCQ de 2.º/3.º grado';
      clinicalInterpretation = 'Sin superficie de 2.º/3.º grado registrada; no requiere reposición de Parkland.';
      guidance = ['Si presenta quemaduras solo de 1.º grado, analgesia e hidratación oral.'];
    } else if (tbsa < 15) {
      severity = 'low';
      riskClassification = `Quemadura menor (< 15 % SCQ: ${tbsa} %)`;
      clinicalInterpretation =
        'Por debajo del umbral estándar de reanimación IV formal (≥ 15–20 % SCQ), salvo lesiones en zonas especiales, inhalación o comorbilidad.';
      guidance = ['Valorar criterios de derivación a unidad de quemados (cara, manos, pies, genitales, articulaciones mayores, circunferenciales, eléctricas/químicas o lesión inhalatoria).'];
    } else if (tbsa < 30) {
      severity = 'high';
      riskClassification = `Quemadura moderada-grave (${tbsa} % SCQ) — Requiere reanimación IV`;
      clinicalInterpretation = `Superficie ≥ 15–20 % SCQ con riesgo de choque hipovolémico por fuga capilar; volumen Parkland 24 h = ${total24h} mL de Ringer Lactato.`;
      guidance = [
        'Administrar Ringer Lactato titulado por diuresis (meta adulto: 0.5 mL/kg/h; ajustar ritmo cada hora sin exceder lo necesario).',
        'Evaluar criterios de centro especializado de quemados, vía aérea (signos de lesión inhalatoria) y analgesia.',
      ];
    } else {
      severity = 'critical';
      riskClassification = `Gran quemado (${tbsa} % SCQ ≥ 30 %) — Emergencia crítica`;
      clinicalInterpretation = `Choque por quemadura grave; volumen Parkland 24 h = ${total24h} mL (estimación inicial 2–4 mL/kg/%SCQ según protocolo institucional).`;
      guidance = [
        'Dos accesos venosos de grueso calibre, sonda vesical para diuresis horaria estricta (0.5 mL/kg/h), valoración temprana de vía aérea y traslado a Unidad de Quemados.',
      ];
    }

    if (tbsa >= 15 && hours < 8 && (hours >= 6 || first8Rate >= 1500)) {
      guidance.unshift(
        `ALERTA DE SOBRECARGA HÍDRICA / LLEGADA TARDÍA (${hours} h desde el accidente → ritmo teórico ${first8Rate} mL/h): NO administrar en bolo rápido ni intentar "recuperar" precipitadamente horas previas sin descontar líquidos ya infundidos; riesgo grave de edema pulmonar, síndrome compartimental abdominal y de extremidades ("fluid creep"). Iniciar o ajustar estrictamente por perfusión y diuresis horaria (0.5 mL/kg/h).`,
      );
    } else if (tbsa >= 15 && hours >= 8) {
      guidance.unshift(
        `VENTANA DE PRIMERAS 8 h SUPERADA (${hours} h desde la quemadura): descontar volumen ya administrado desde la hora 0; si está hemodinámicamente estable y con diuresis adecuada, continuar directamente con la fase de las siguientes 16 h (≈ ${next16Rate} mL/h) titulando según diuresis.`,
      );
    }

    return {
      primaryResult: {
        label: 'Volumen Parkland 24 h (4 mL/kg/%SCQ)',
        value: total24h,
        formattedValue: tbsa > 0 ? `${total24h} mL` : '0 mL',
        unit: `(${tbsa} % SCQ)`,
      },
      secondaryResults: [
        { label: 'Superficie Corporal Quemada (%SCQ)', formattedValue: `${formatClinicalNumber(tbsa, 1)} %`, unit: '' },
        {
          label: hours < 8 ? `Primeras 8 h (50 % en ${roundClinical(8 - hours, 1)} h rest.)` : 'Ventana de primeras 8 h superada',
          formattedValue: hours < 8 && tbsa > 0 ? `${half24h} mL (${first8Rate} mL/h)` : `${half24h} mL`,
          unit: '',
          note:
            tbsa >= 15 && hours < 8 && (hours >= 6 || first8Rate >= 1500)
              ? 'Precaución: tasa calculada muy alta por ventana corta; descontar fluidos previos y titular por diuresis.'
              : undefined,
        },
        { label: `Siguientes 16 h (50 % en ${next16HoursRemaining} h)`, formattedValue: tbsa > 0 ? `${half24h} mL (${next16Rate} mL/h)` : '0 mL', unit: '' },
        { label: 'Referencia inicial ABA/ATLS (2 mL/kg/%SCQ)', formattedValue: tbsa > 0 ? `${abaLow24h} mL / 24 h` : '0 mL', unit: '' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'Restar líquidos ya administrados desde la hora 0 del accidente y titular estrictamente por diuresis.',
      formulaUsed: 'Parkland: 4 mL × Peso (kg) × %SCQ (50 % en primeras 8 h desde el evento, 50 % en las 16 h siguientes)',
      inputsSummary: `Peso: ${roundClinical(weight, 1)} kg · %SCQ: ${tbsa}% · Horas desde evento: ${hours} h`,
    };
  },
};
