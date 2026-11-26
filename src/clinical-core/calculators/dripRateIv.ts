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

const modeField: SelectFieldDef = {
  id: 'mode',
  label: 'Tipo de cálculo de goteo',
  type: 'select',
  defaultValue: 'vol_time_to_drops',
  options: [
    { value: 'vol_time_to_drops', label: 'Volumen + Tiempo → Gotas/min y mL/h' },
    { value: 'drops_to_time', label: 'Gotas/min + Volumen → Tiempo de infusión' },
    { value: 'rate_to_drops', label: 'Velocidad de bomba (mL/h) → Gotas/min y Microgotas/min' },
  ],
};

const dropFactorField: SelectFieldDef = {
  id: 'dropFactor',
  label: 'Equipo de venoclisis (factor de goteo)',
  type: 'select',
  defaultValue: '20',
  options: [
    { value: '20', label: 'Normogotero / Macrogotero estándar — 20 gotas/mL' },
    { value: '15', label: 'Macrogotero — 15 gotas/mL' },
    { value: '10', label: 'Macrogotero / Equipo de sangre — 10 gotas/mL' },
    { value: '60', label: 'Microgotero — 60 microgotas/mL (1 microgota/min = 1 mL/h)' },
  ],
};

const volumeField: NumberFieldDef = {
  id: 'volumeMl',
  label: 'Volumen total a infundir',
  type: 'number',
  canonicalUnit: 'mL',
  units: [
    { id: 'ml', label: 'mL', toCanonical: (v) => v, min: 1, max: 10000, step: 10 },
    { id: 'l', label: 'L', toCanonical: (v) => v * 1000, min: 0.01, max: 10, step: 0.1 },
  ],
  defaultUnitId: 'ml',
  min: 1,
  max: 10000,
  placeholder: '1000',
  visibleWhen: (i) => i.mode !== 'rate_to_drops',
};

const infusionTimeField: NumberFieldDef = {
  id: 'infusionTime',
  label: 'Tiempo total de infusión',
  type: 'number',
  canonicalUnit: 'min',
  units: [
    { id: 'h', label: 'horas', toCanonical: (v) => v * 60, min: 0.1, max: 240, step: 0.5 },
    { id: 'min', label: 'min', toCanonical: (v) => v, min: 5, max: 14400, step: 5 },
  ],
  defaultUnitId: 'h',
  min: 5,
  max: 14400,
  placeholder: '8',
  visibleWhen: (i) => i.mode === 'vol_time_to_drops',
};

const dropsPerMinField: NumberFieldDef = {
  id: 'dropsPerMin',
  label: 'Goteo actual medido',
  type: 'number',
  canonicalUnit: 'gotas/min',
  units: [
    { id: 'gts_min', label: 'gotas o microgotas/min', toCanonical: (v) => v, min: 1, max: 600, step: 1 },
  ],
  defaultUnitId: 'gts_min',
  min: 1,
  max: 600,
  placeholder: '42',
  visibleWhen: (i) => i.mode === 'drops_to_time',
};

const pumpRateField: NumberFieldDef = {
  id: 'pumpRateMlH',
  label: 'Velocidad programada o indicada (mL/h)',
  type: 'number',
  canonicalUnit: 'mL/h',
  units: [{ id: 'ml_h', label: 'mL/h', toCanonical: (v) => v, min: 0.5, max: 2000, step: 1 }],
  defaultUnitId: 'ml_h',
  min: 0.5,
  max: 2000,
  placeholder: '125',
  visibleWhen: (i) => i.mode === 'rate_to_drops',
};

function formatDurationHoursMinutes(totalMinutes: number): string {
  const roundedMin = Math.round(totalMinutes);
  const hours = Math.floor(roundedMin / 60);
  const mins = roundedMin % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} h`;
  return `${hours} h ${mins} min`;
}

export const dripRateIvCalculator: CalculatorDefinition = {
  id: 'drip-rate-iv',
  name: 'Cálculo de Goteo y Microgoteo IV (Enfermería)',
  shortName: 'Goteo / Microgoteo IV',
  primarySpecialty: 'urgencias',
  secondarySpecialties: ['medicina-interna', 'pediatria'],
  subcategory: 'dosificacion',
  keywords: [
    'goteo',
    'microgoteo',
    'macrogoteo',
    'normogotero',
    'gotas',
    'gotas por minuto',
    'enfermeria',
    'venoclisis',
    'suero',
    'tiempo de infusion',
    'ml/h',
  ],
  description:
    'Cálculo clínico de gotas por minuto, microgotas/min, cadencia en segundos por gota, velocidad en mL/h y duración de soluciones intravenosas.',
  clinicalIndication:
    'Programación manual de venoclisis por gravedad (macrogotero 10/15/20 gotas/mL y microgotero 60 microgotas/mL), verificación de bombas y cálculo de duración de soluciones en enfermería, urgencias y hospitalización.',
  validatedPopulation: 'Adultos y pediatría (verificando el factor de goteo impreso en el empaque del equipo de venoclisis).',
  contraindications: [
    'No administrar fármacos de alto riesgo o estrecho margen terapéutico (vasopresores, insulina IV, KCl concentrado, heparina, oxitocina o citotóxicos) por goteo gravitacional libre sin bomba de infusión.',
  ],
  limitations: [
    'El goteo por gravedad varía con la altura del frasco, viscosidad de la solución (coloides, sangre, dextrosa hipertónica), calibre del catéter y posición del miembro.',
    'Confirmar siempre el factor de goteo exacto (10, 15, 20 o 60 gotas/mL) en la etiqueta del equipo utilizado.',
  ],
  version: 'Fórmula volumétrica estándar de enfermería',
  references: [
    {
      citation:
        'Potter PA, Perry AG, Stockert PA, Hall AM. Fundamentals of Nursing (11th ed.). Parenteral Medication Administration & IV Flow Rate Calculations. Elsevier; 2023.',
      year: 2023,
    },
    {
      citation:
        'Infusion Nurses Society (INS). Infusion Therapy Standards of Practice (9th ed.). J Infus Nurs. 2024;47(Suppl 1):S1-S285.',
      year: 2024,
    },
  ],
  fields: [
    modeField,
    dropFactorField,
    volumeField,
    infusionTimeField,
    dropsPerMinField,
    pumpRateField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(dripRateIvCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const mode = inputs.mode as string;
    const dropFactor = Number(inputs.dropFactor);
    const isMicro = dropFactor === 60;
    const dropUnitLabel = isMicro ? 'microgotas/min' : 'gotas/min';

    if (mode === 'drops_to_time') {
      const volumeMl = getCanonicalNumberValue(volumeField, inputs.volumeMl as NumberInputValue)
        .canonicalValue!;
      const dropsPerMin = getCanonicalNumberValue(
        dropsPerMinField,
        inputs.dropsPerMin as NumberInputValue,
      ).canonicalValue!;

      const totalMinutes = (volumeMl * dropFactor) / dropsPerMin;
      const totalHours = roundClinical(totalMinutes / 60, 2);
      const mlPerHour = roundClinical((dropsPerMin * 60) / dropFactor, 1);
      const secondsPerDrop = roundClinical(60 / dropsPerMin, 1);

      let severity: SeverityLevel = 'info';
      let riskClassification = `Duración estimada: ${formatDurationHoursMinutes(totalMinutes)}`;
      const guidance: string[] = [
        `Cada gota debe caer aproximadamente cada ${formatClinicalNumber(secondsPerDrop, 1)} segundos.`,
        'Rotular el frasco/bolsa con hora de inicio, velocidad y hora prevista de término.',
      ];

      if (mlPerHour > 500) {
        severity = 'high';
        riskClassification = `ALERTA: Velocidad muy alta (${formatClinicalNumber(mlPerHour, 1)} mL/h)`;
        guidance.unshift(
          'Velocidad > 500 mL/h: confirmar si corresponde a bolo de reanimación y vigilar sobrecarga hídrica.',
        );
      }

      return {
        primaryResult: {
          label: 'Tiempo total de infusión',
          value: totalHours,
          formattedValue: formatDurationHoursMinutes(totalMinutes),
          unit: `(${formatClinicalNumber(totalHours, 2)} h)`,
        },
        secondaryResults: [
          {
            label: 'Velocidad equivalente (bomba)',
            formattedValue: formatClinicalNumber(mlPerHour, 1),
            unit: 'mL/h',
          },
          {
            label: 'Cadencia visual',
            formattedValue: `1 ${isMicro ? 'microgota' : 'gota'} c/ ${formatClinicalNumber(secondsPerDrop, 1)}`,
            unit: 's',
          },
        ],
        severity,
        riskClassification,
        clinicalInterpretation: `Infundir ${formatClinicalNumber(volumeMl, 0)} mL a ${formatClinicalNumber(dropsPerMin, 0)} ${dropUnitLabel} con equipo de ${dropFactor} ${dropUnitLabel.replace('/min', '/mL')} tomará ${formatDurationHoursMinutes(totalMinutes)} (equivalente a ${formatClinicalNumber(mlPerHour, 1)} mL/h).`,
        guidance,
        formulaUsed: 'Tiempo (min) = [Volumen (mL) × Factor de goteo] / Gotas por minuto',
        inputsSummary: `${formatClinicalNumber(volumeMl, 0)} mL · ${formatClinicalNumber(dropsPerMin, 0)} ${dropUnitLabel} · Equipo ${dropFactor}`,
      };
    }

    let mlPerHourExact = 0;
    let volumeMl = 0;
    let timeMin = 0;

    if (mode === 'vol_time_to_drops') {
      volumeMl = getCanonicalNumberValue(volumeField, inputs.volumeMl as NumberInputValue)
        .canonicalValue!;
      timeMin = getCanonicalNumberValue(
        infusionTimeField,
        inputs.infusionTime as NumberInputValue,
      ).canonicalValue!;
      mlPerHourExact = (volumeMl * 60) / timeMin;
    } else {
      mlPerHourExact = getCanonicalNumberValue(
        pumpRateField,
        inputs.pumpRateMlH as NumberInputValue,
      ).canonicalValue!;
    }

    const dropsExact = (mlPerHourExact * dropFactor) / 60;
    const dropsRounded = Math.max(1, Math.round(dropsExact));
    const mlPerHourRounded = roundClinical(mlPerHourExact, 1);
    const microDropsRounded = Math.max(1, Math.round(mlPerHourExact));
    const normoDropsRounded = Math.max(1, Math.round((mlPerHourExact * 20) / 60));
    const secondsPerDrop = roundClinical(60 / dropsRounded, 1);

    let severity: SeverityLevel = 'info';
    let riskClassification = `${dropsRounded} ${dropUnitLabel} (${formatClinicalNumber(mlPerHourRounded, 1)} mL/h)`;
    const guidance: string[] = [
      `Ajustar el regulador contando ${dropsRounded} ${dropUnitLabel} (≈ 1 ${isMicro ? 'microgota' : 'gota'} cada ${formatClinicalNumber(secondsPerDrop, 1)} segundos) y reconfirmar el goteo tras 5–10 minutos.`,
    ];

    if (mlPerHourRounded > 500 || dropsRounded > 150) {
      severity = 'high';
      riskClassification = `ALERTA DE VERIFICACIÓN: flujo elevado (${dropsRounded} ${dropUnitLabel})`;
      guidance.unshift(
        'Flujo elevado (> 500 mL/h o > 150 gotas/min): difícil de medir con precisión manual por goteo; confirmar indicación médica y usar bomba volumétrica o equipo de alto flujo.',
      );
    } else if (!isMicro && dropsExact < 5) {
      severity = 'moderate';
      riskClassification = `Goteo muy lento (${formatClinicalNumber(roundClinical(dropsExact, 1), 1)} gotas/min): usar microgotero o bomba`;
      guidance.unshift(
        `Menos de 5 macrogotas/min es impreciso por gravedad y favorece obstrucción del catéter; cambiar a microgotero (${microDropsRounded} microgotas/min) o bomba de infusión (${formatClinicalNumber(mlPerHourRounded, 1)} mL/h).`,
      );
    }

    return {
      primaryResult: {
        label: `Ritmo de goteo (${dropFactor} ${isMicro ? 'microgotas/mL' : 'gotas/mL'})`,
        value: dropsRounded,
        formattedValue: String(dropsRounded),
        unit: dropUnitLabel,
      },
      secondaryResults: [
        {
          label: 'Cálculo exacto / Velocidad en bomba',
          formattedValue: `${formatClinicalNumber(roundClinical(dropsExact, 2), 2)} ${dropUnitLabel} · ${formatClinicalNumber(mlPerHourRounded, 1)}`,
          unit: 'mL/h',
        },
        {
          label: isMicro ? 'Equivalencia normogotero (20 gts/mL)' : 'Equivalencia microgotero (60 mcgts/mL)',
          formattedValue: isMicro ? `${normoDropsRounded} gotas/min` : `${microDropsRounded} microgotas/min`,
          unit: '',
        },
        {
          label: 'Cadencia con reloj',
          formattedValue: `1 ${isMicro ? 'microgota' : 'gota'} c/ ${formatClinicalNumber(secondsPerDrop, 1)}`,
          unit: 'segundos',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation:
        mode === 'vol_time_to_drops'
          ? `Para infundir ${formatClinicalNumber(volumeMl, 0)} mL en ${formatDurationHoursMinutes(timeMin)} con equipo de ${dropFactor} ${isMicro ? 'microgotas/mL' : 'gotas/mL'} se requieren ${dropsRounded} ${dropUnitLabel} (equivale a ${formatClinicalNumber(mlPerHourRounded, 1)} mL/h).`
          : `Una velocidad de ${formatClinicalNumber(mlPerHourRounded, 1)} mL/h equivale a ${dropsRounded} ${dropUnitLabel} en equipo de ${dropFactor} ${isMicro ? 'microgotas/mL' : 'gotas/mL'}.`,
      guidance,
      formulaUsed:
        mode === 'vol_time_to_drops'
          ? 'Gotas/min = [Volumen (mL) × Factor de goteo] / Tiempo (min) · mL/h = Microgotas/min'
          : 'Gotas/min = [Velocidad (mL/h) × Factor de goteo] / 60',
      inputsSummary:
        mode === 'vol_time_to_drops'
          ? `${formatClinicalNumber(volumeMl, 0)} mL en ${formatDurationHoursMinutes(timeMin)} · Equipo ${dropFactor}`
          : `${formatClinicalNumber(mlPerHourRounded, 1)} mL/h · Equipo ${dropFactor}`,
    };
  },
};
