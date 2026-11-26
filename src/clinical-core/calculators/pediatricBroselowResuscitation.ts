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
  SecondaryResultItem,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

interface BroselowZone {
  id: string;
  colorName: string;
  lengthMinCm: number;
  lengthMaxCm: number;
  weightMinKg: number;
  weightMaxKg: number;
  midpointWeightKg: number;
  ettUncuffed: string;
  ettCuffed: string;
  ettDepthCm: string;
  blade: string;
  lmaSize: string;
  suctionCatheterFr: string;
  ivCatheterGauge: string;
}

const BROSELOW_ZONES: BroselowZone[] = [
  {
    id: 'grey',
    colorName: 'Gris (3 – 5 kg)',
    lengthMinCm: 46,
    lengthMaxCm: 59,
    weightMinKg: 3,
    weightMaxKg: 5,
    midpointWeightKg: 4,
    ettUncuffed: '3.0 – 3.5 mm',
    ettCuffed: '3.0 mm (precaución / < 20–25 cmH₂O)',
    ettDepthCm: '9 – 10 cm',
    blade: 'Miller 0 (recta)',
    lmaSize: '1',
    suctionCatheterFr: '6 – 8 Fr',
    ivCatheterGauge: '24 – 22 G',
  },
  {
    id: 'pink',
    colorName: 'Rosa (6 – 7 kg)',
    lengthMinCm: 60,
    lengthMaxCm: 65,
    weightMinKg: 6,
    weightMaxKg: 7,
    midpointWeightKg: 6.5,
    ettUncuffed: '3.5 mm',
    ettCuffed: '3.0 mm',
    ettDepthCm: '10.5 – 11 cm',
    blade: 'Miller 1 (recta)',
    lmaSize: '1.5',
    suctionCatheterFr: '8 Fr',
    ivCatheterGauge: '24 – 22 G',
  },
  {
    id: 'red',
    colorName: 'Rojo (8 – 9 kg)',
    lengthMinCm: 66,
    lengthMaxCm: 73,
    weightMinKg: 8,
    weightMaxKg: 9,
    midpointWeightKg: 8.5,
    ettUncuffed: '3.5 – 4.0 mm',
    ettCuffed: '3.5 mm',
    ettDepthCm: '11.5 – 12 cm',
    blade: 'Miller 1 / Mac 1',
    lmaSize: '1.5',
    suctionCatheterFr: '8 – 10 Fr',
    ivCatheterGauge: '22 G',
  },
  {
    id: 'purple',
    colorName: 'Morado (10 – 11 kg)',
    lengthMinCm: 74,
    lengthMaxCm: 82,
    weightMinKg: 10,
    weightMaxKg: 11,
    midpointWeightKg: 10.5,
    ettUncuffed: '4.0 mm',
    ettCuffed: '3.5 mm',
    ettDepthCm: '12.5 – 13 cm',
    blade: 'Miller 1 / Mac 2',
    lmaSize: '2',
    suctionCatheterFr: '10 Fr',
    ivCatheterGauge: '22 – 20 G',
  },
  {
    id: 'yellow',
    colorName: 'Amarillo (12 – 14 kg)',
    lengthMinCm: 83,
    lengthMaxCm: 93,
    weightMinKg: 12,
    weightMaxKg: 14,
    midpointWeightKg: 13,
    ettUncuffed: '4.5 mm',
    ettCuffed: '4.0 mm',
    ettDepthCm: '13.5 – 14 cm',
    blade: 'Mac 2 / Miller 2',
    lmaSize: '2',
    suctionCatheterFr: '10 Fr',
    ivCatheterGauge: '22 – 20 G',
  },
  {
    id: 'white',
    colorName: 'Blanco (15 – 18 kg)',
    lengthMinCm: 94,
    lengthMaxCm: 107,
    weightMinKg: 15,
    weightMaxKg: 18,
    midpointWeightKg: 16.5,
    ettUncuffed: '5.0 mm',
    ettCuffed: '4.5 mm',
    ettDepthCm: '14.5 – 15 cm',
    blade: 'Mac 2 / Miller 2',
    lmaSize: '2',
    suctionCatheterFr: '10 Fr',
    ivCatheterGauge: '20 G',
  },
  {
    id: 'blue',
    colorName: 'Azul (19 – 23 kg)',
    lengthMinCm: 108,
    lengthMaxCm: 118,
    weightMinKg: 19,
    weightMaxKg: 23,
    midpointWeightKg: 21,
    ettUncuffed: '5.5 mm',
    ettCuffed: '5.0 mm',
    ettDepthCm: '16 – 16.5 cm',
    blade: 'Mac 2 – 3',
    lmaSize: '2.5',
    suctionCatheterFr: '10 – 12 Fr',
    ivCatheterGauge: '20 – 18 G',
  },
  {
    id: 'orange',
    colorName: 'Naranja (24 – 29 kg)',
    lengthMinCm: 119,
    lengthMaxCm: 132,
    weightMinKg: 24,
    weightMaxKg: 29,
    midpointWeightKg: 26.5,
    ettUncuffed: '6.0 mm',
    ettCuffed: '5.5 mm',
    ettDepthCm: '17 – 18 cm',
    blade: 'Mac 2 – 3',
    lmaSize: '2.5',
    suctionCatheterFr: '12 Fr',
    ivCatheterGauge: '20 – 18 G',
  },
  {
    id: 'green',
    colorName: 'Verde (30 – 36 kg)',
    lengthMinCm: 133,
    lengthMaxCm: 146,
    weightMinKg: 30,
    weightMaxKg: 36,
    midpointWeightKg: 33,
    ettUncuffed: '6.5 mm',
    ettCuffed: '6.0 mm',
    ettDepthCm: '19 cm',
    blade: 'Mac 3',
    lmaSize: '3',
    suctionCatheterFr: '12 – 14 Fr',
    ivCatheterGauge: '18 G',
  },
];

const estimationMethodField: SelectFieldDef = {
  id: 'method',
  label: 'Dato disponible para estimación rápida',
  type: 'select',
  defaultValue: 'by_length',
  options: [
    { value: 'by_length', label: 'Talla / longitud en decúbito (cm) — Cinta de Broselow' },
    { value: 'by_weight', label: 'Peso conocido o estimado (kg)' },
    { value: 'by_color', label: 'Selección directa por franja de color Broselow' },
  ],
};

const lengthField: NumberFieldDef = {
  id: 'lengthCm',
  label: 'Talla / Longitud corporal (vértice a talón)',
  type: 'number',
  canonicalUnit: 'cm',
  units: [{ id: 'cm', label: 'cm', toCanonical: (v) => v, min: 46, max: 146, step: 0.5 }],
  defaultUnitId: 'cm',
  defaultValue: '88',
  min: 46,
  max: 146,
  placeholder: '88',
  visibleWhen: (inputs) => inputs.method === 'by_length',
  helpText: 'Rango validado de la Cinta de Broselow: 46 a 146 cm (≈ 3 a 36 kg).',
};

const weightField: NumberFieldDef = {
  id: 'weightKg',
  label: 'Peso pediátrico (3 – 36 kg)',
  type: 'number',
  canonicalUnit: 'kg',
  units: [{ id: 'kg', label: 'kg', toCanonical: (v) => v, min: 3, max: 36, step: 0.5 }],
  defaultUnitId: 'kg',
  defaultValue: '13',
  min: 3,
  max: 36,
  placeholder: '13',
  visibleWhen: (inputs) => inputs.method === 'by_weight',
};

const colorZoneField: SelectFieldDef = {
  id: 'colorZone',
  label: 'Franja de color Broselow',
  type: 'select',
  defaultValue: 'yellow',
  visibleWhen: (inputs) => inputs.method === 'by_color',
  options: BROSELOW_ZONES.map((z) => ({
    value: z.id,
    label: `${z.colorName} · ${z.lengthMinCm}–${z.lengthMaxCm} cm`,
  })),
};

function findZoneByLength(cm: number): BroselowZone {
  if (cm < BROSELOW_ZONES[0].lengthMinCm) return BROSELOW_ZONES[0];
  for (let i = 0; i < BROSELOW_ZONES.length - 1; i += 1) {
    const boundary = (BROSELOW_ZONES[i].lengthMaxCm + BROSELOW_ZONES[i + 1].lengthMinCm) / 2;
    if (cm < boundary) return BROSELOW_ZONES[i];
  }
  return BROSELOW_ZONES[BROSELOW_ZONES.length - 1];
}

function findZoneByWeight(kg: number): BroselowZone {
  for (const z of BROSELOW_ZONES) {
    if (kg <= z.weightMaxKg) return z;
  }
  return BROSELOW_ZONES[BROSELOW_ZONES.length - 1];
}

export const pediatricBroselowResuscitationCalculator: CalculatorDefinition = {
  id: 'pediatric-broselow-resuscitation',
  name: 'Reanimación Pediátrica Tipo Cinta de Broselow (PALS / Vía Aérea y Dosis)',
  shortName: 'Broselow (Reanimación Pediátrica)',
  primarySpecialty: 'pediatria',
  secondarySpecialties: ['urgencias', 'cirugia-general'],
  subcategory: 'dosificacion',
  keywords: [
    'broselow',
    'reanimacion pediatrica',
    'pals',
    'tubo endotraqueal',
    'tet',
    'adrenalina pediatrica',
    'desfibrilacion',
    'laringoscopio',
    'paro pediatrico',
  ],
  description:
    'Determina al instante la franja de color tipo Cinta de Broselow, calibre de tubo endotraqueal (con y sin balón), profundidad de fijación, hoja de laringoscopio, energía de desfibrilación y dosis exactas de fármacos PALS.',
  clinicalIndication:
    'Paro cardiorrespiratorio pediátrico, secuencia de intubación rápida, choque, arritmias o trauma grave en niños de 46 a 146 cm (3 a 36 kg).',
  validatedPopulation:
    'Pacientes pediátricos con longitud entre 46 y 146 cm o peso entre 3 y 36 kg (no aplica para recién nacidos prematuros < 3 kg ni > 36 kg).',
  contraindications: [
    'En niños > 146 cm o > 36 kg usar directamente dosificación de adulto con topes máximos.',
    'En lactantes prematuros o < 3 kg usar cálculo neonatal específico (NRP) por peso exacto.',
  ],
  limitations: [
    'La talla estima masa magra/peso ideal: en obesidad pediátrica importante, los fármacos hidrofílicos de reanimación (adrenalina, amiodarona, adenosina) se dosifican mejor por el peso ideal de la cinta, mientras que el tamaño del tubo endotraqueal sigue dependiendo de la talla/edad.',
    'Confirmar siempre la presión del balón del TET (< 20–25 cmH₂O) y la posición por capnografía y auscultación.',
  ],
  version: 'Sistema Broselow-Luten + AHA PALS 2020',
  references: [
    {
      citation:
        'Topjian AA, Raymond TT, Atkins D, et al. Part 4: Pediatric Basic and Advanced Life Support: 2020 American Heart Association Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care. Circulation. 2020;142(16_suppl_2):S469-S523.',
      year: 2020,
    },
    {
      citation:
        'Luten RC, Wears RL, Broselow J, et al. Length-based endotracheal tube and emergency equipment in pediatrics. Ann Emerg Med. 1992;21(8):900-904.',
      year: 1992,
    },
  ],
  fields: [estimationMethodField, lengthField, weightField, colorZoneField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(pediatricBroselowResuscitationCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const method = String(inputs.method);
    let zone: BroselowZone;
    let workingWeightKg: number;
    let sourceDesc: string;

    if (method === 'by_length') {
      const lengthCm = getCanonicalNumberValue(lengthField, inputs.lengthCm as NumberInputValue).canonicalValue!;
      zone = findZoneByLength(lengthCm);
      workingWeightKg = zone.midpointWeightKg;
      sourceDesc = `Talla ${formatClinicalNumber(lengthCm, 1)} cm → Peso de trabajo ${workingWeightKg} kg`;
    } else if (method === 'by_weight') {
      const weightKg = getCanonicalNumberValue(weightField, inputs.weightKg as NumberInputValue).canonicalValue!;
      zone = findZoneByWeight(weightKg);
      workingWeightKg = roundClinical(weightKg, 1);
      sourceDesc = `Peso real ${workingWeightKg} kg`;
    } else {
      zone = BROSELOW_ZONES.find((z) => z.id === String(inputs.colorZone)) ?? BROSELOW_ZONES[4];
      workingWeightKg = zone.midpointWeightKg;
      sourceDesc = `Franja ${zone.colorName} (peso medio ${workingWeightKg} kg)`;
    }

    const epiMg = Math.min(1, roundClinical(workingWeightKg * 0.01, 3));
    const epiMl = Math.min(10, roundClinical(workingWeightKg * 0.1, 2));
    const defib2J = Math.min(200, Math.round(workingWeightKg * 2));
    const defib4J = Math.min(200, Math.round(workingWeightKg * 4));
    const cardioversion1J = Math.max(2, Math.round(workingWeightKg * 1));
    const amiodaroneMg = Math.min(300, roundClinical(workingWeightKg * 5, 0));
    const adenosine1Mg = Math.min(6, roundClinical(workingWeightKg * 0.1, 2));
    const adenosine2Mg = Math.min(12, roundClinical(workingWeightKg * 0.2, 2));
    const atropineMg = Math.min(0.5, Math.max(0.1, roundClinical(workingWeightKg * 0.02, 2)));
    const bolus20Ml = Math.round(workingWeightKg * 20);
    const bolus10Ml = Math.round(workingWeightKg * 10);
    const d10wMlLow = Math.round(workingWeightKg * 2);
    const d10wMlHigh = Math.round(workingWeightKg * 5);
    const ketamineLow = roundClinical(workingWeightKg * 1, 1);
    const ketamineHigh = roundClinical(workingWeightKg * 2, 1);
    const rocuroniumMg = roundClinical(workingWeightKg * 1, 1);
    const midazolamMg = roundClinical(workingWeightKg * 0.1, 2);

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Tubo Endotraqueal (con balón / sin balón)',
        formattedValue: `Con balón: ${zone.ettCuffed} · Sin balón: ${zone.ettUncuffed}`,
        unit: '',
        note: `Fijación en comisura: ${zone.ettDepthCm} · Laringoscopio: ${zone.blade}`,
      },
      {
        label: 'Adrenalina PARO IV/IO (1:10,000 = 0.1 mg/mL)',
        formattedValue: `${formatClinicalNumber(epiMg, 2)} mg (${formatClinicalNumber(epiMl, 1)} mL)`,
        unit: 'cada 3–5 min',
      },
      {
        label: 'Desfibrilación bifásica (FV / TV sin pulso)',
        formattedValue: `1.ª: ${defib2J} J → 2.ª+: ${defib4J} J`,
        unit: `(cardioversión: ${cardioversion1J} J)`,
      },
      {
        label: 'Bolo de cristaloides isotónicos (SSN 0.9% / RL)',
        formattedValue: `${bolus20Ml} mL (20 mL/kg)`,
        unit: `o ${bolus10Ml} mL si cardiopatía/riesgo sobrecarga`,
      },
      {
        label: 'Amiodarona (FV/TV refractaria) / Adenosina (TSV)',
        formattedValue: `Amiodarona: ${amiodaroneMg} mg`,
        unit: `Adenosina: ${adenosine1Mg} mg → ${adenosine2Mg} mg`,
      },
      {
        label: 'Atropina / Dextrosa 10% (hipoglucemia)',
        formattedValue: `Atropina: ${atropineMg} mg`,
        unit: `DAD 10%: ${d10wMlLow}–${d10wMlHigh} mL`,
        note: workingWeightKg < 5 ? 'Precaución < 5 kg: aunque AHA PALS mantiene dosis mínima de 0.1 mg, vigilar toxicidad anticolinérgica en neonatos/lactantes pequeños.' : undefined,
      },
    ];

    const severity: SeverityLevel = 'critical';

    return {
      primaryResult: {
        label: 'Zona Cinta de Broselow y Peso de Trabajo',
        value: workingWeightKg,
        formattedValue: `${zone.colorName}`,
        unit: `(${workingWeightKg} kg)`,
      },
      secondaryResults,
      severity,
      riskClassification: `Zona ${zone.colorName} · ${zone.lengthMinCm}–${zone.lengthMaxCm} cm`,
      clinicalInterpretation: `${sourceDesc}. Equipo de vía aérea: TET con balón ${zone.ettCuffed} (sin balón ${zone.ettUncuffed}), fijación a ${zone.ettDepthCm} en comisura labial, hoja ${zone.blade}, mascarilla laríngea n.º ${zone.lmaSize}, sonda aspiración ${zone.suctionCatheterFr}, acceso IV ${zone.ivCatheterGauge}.`,
      guidance: [
        `PARO CARDIORRESPIRATORIO: RCP alta calidad (100–120/min; 15:2 con 2 reanimadores) + Adrenalina 1:10,000 IV/IO ${formatClinicalNumber(epiMl, 1)} mL (${formatClinicalNumber(epiMg, 2)} mg) c/3–5 min.`,
        `RITMO DESFIBRILABLE (FV/TVsp): 1.ª descarga ${defib2J} J (2 J/kg) → siguientes ${defib4J} J (4 J/kg); Amiodarona ${amiodaroneMg} mg IV/IO en bolo tras 3.ª descarga.`,
        `SECUENCIA DE INTUBACIÓN RÁPIDA (SIR orientativa): Ketamina ${ketamineLow}–${ketamineHigh} mg IV (o Midazolam ${midazolamMg} mg IV si estable) + Rocuronio ${rocuroniumMg} mg IV.`,
        `HIPOGLUCEMIA (< 40–60 mg/dL): Dextrosa 10% ${d10wMlLow}–${d10wMlHigh} mL IV lento (2–5 mL/kg) y reevaluar glucemia.`,
      ],
      guidanceDisclaimer:
        'Verificar dilución exacta (Adrenalina 1:10,000 = 1 mg en 10 mL; NUNCA pasar 1:1,000 sin diluir por vía IV) y confirmar dosis contra el estado hemodinámico.',
      formulaUsed: 'Cinta Broselow-Luten (talla → zona/peso) + Dosis ponderales AHA PALS',
      inputsSummary: `${sourceDesc} · Zona ${zone.colorName}`,
    };
  },
};
