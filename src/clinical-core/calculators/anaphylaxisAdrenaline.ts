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
  min: 3,
  max: 250,
  placeholder: '70',
};

const crit1Field: BooleanFieldDef = {
  id: 'criterion1',
  label: 'Criterio 1 — Inicio agudo con piel/mucosas (urticaria, prurito, angioedema) + compromiso respiratorio O hipotensión/disfunción orgánica',
  type: 'boolean',
  trueLabel: 'Cumple',
  falseLabel: 'No',
  defaultValue: false,
};

const crit2Field: BooleanFieldDef = {
  id: 'criterion2',
  label: 'Criterio 2 — ≥ 2 sistemas tras exposición a alérgeno PROBABLE (piel/mucosas, respiratorio, hipotensión o GI persistentes: cólico/vómito)',
  type: 'boolean',
  trueLabel: 'Cumple',
  falseLabel: 'No',
  defaultValue: false,
};

const crit3Field: BooleanFieldDef = {
  id: 'criterion3',
  label: 'Criterio 3 — Hipotensión tras exposición a un alérgeno CONOCIDO para ese paciente (adultos PAS < 90 o caída > 30 %)',
  type: 'boolean',
  trueLabel: 'Cumple',
  falseLabel: 'No',
  defaultValue: false,
};

export const anaphylaxisAdrenalineCalculator: CalculatorDefinition = {
  id: 'anaphylaxis-adrenaline',
  name: 'Anafilaxia — Criterios Diagnósticos (WAO/Sampson) y Dosis de Adrenalina IM',
  shortName: 'Anafilaxia / Adrenalina IM',
  primarySpecialty: 'urgencias',
  secondarySpecialties: ['dermatologia', 'medicina-interna', 'pediatria'],
  subcategory: 'dosificacion',
  keywords: ['anafilaxia', 'adrenalina', 'epinefrina', 'alergia', 'choque anafilactico', 'angioedema', 'wao'],
  description:
    'Evalúa los criterios clínicos diagnósticos de anafilaxia (WAO 2020 / Sampson) y calcula la dosis inmediata de adrenalina intramuscular 1:1000 (1 mg/mL) ajustada por peso.',
  clinicalIndication:
    'Sospecha de reacción alérgica sistémica grave / anafilaxia en urgencias, consultorio, vacunación o ámbito prehospitalario.',
  validatedPopulation: 'Adultos y pacientes pediátricos (≥ 3 kg).',
  contraindications: [
    'NO existen contraindicaciones absolutas para adrenalina intramuscular en anafilaxia potencialmente mortal.',
    'NUNCA administrar adrenalina en bolo intravenoso sin dilución (riesgo de arritmias letales e hipertensión grave); la vía inicial de elección es INTRAMUSCULAR en cara anterolateral del muslo.',
  ],
  limitations: [
    'Hasta un 10–20 % de los casos pueden carecer de signos cutáneos iniciales (especialmente en choque rápido o pediatría); si existe duda clínica razonable ante exposición compatible con compromiso respiratorio o hemodinámico, no retrasar la adrenalina IM.',
    'En autoinyectores comerciales las dosis fijas estándar son 0.15 mg (aprox. 7.5–25 kg) y 0.30 mg (≥ 25–30 kg); con ampolla 1:1000 se calcula 0.01 mg/kg (máx. 0.50 mg por dosis en adultos y 0.30 mg en niños prepuberales según guía).',
  ],
  version: 'WAO Anaphylaxis Guidance (2020) / Sampson (2006)',
  references: [
    {
      citation:
        'Cardona V, Ansotegui IJ, Ebisawa M, et al. World Allergy Organization Anaphylaxis Guidance 2020. World Allergy Organ J. 2020;13(10):100472.',
      year: 2020,
    },
    {
      citation:
        'Sampson HA, Muñoz-Furlong A, Campbell RL, et al. Second symposium on the definition and management of anaphylaxis: summary report. J Allergy Clin Immunol. 2006;117(2):391-397.',
      year: 2006,
    },
  ],
  fields: [weightField, crit1Field, crit2Field, crit3Field],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(anaphylaxisAdrenalineCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const weight = getCanonicalNumberValue(weightField, inputs.weight as NumberInputValue).canonicalValue!;
    const metCount =
      Number(Boolean(inputs.criterion1)) +
      Number(Boolean(inputs.criterion2)) +
      Number(Boolean(inputs.criterion3));
    const isAnaphylaxis = metCount >= 1;

    const maxAdultOrPed = weight >= 50 ? 0.5 : 0.3;
    const rawMg = weight * 0.01;
    const doseMg = roundClinical(Math.min(0.5, rawMg), 2);
    const pedCappedMg = roundClinical(Math.min(maxAdultOrPed, rawMg), 2);
    const volumeMl = formatClinicalNumber(doseMg, 2);

    const autoinjector =
      weight < 15
        ? 'Preferir cálculo exacto con ampolla 1:1000 (0.1 mg o 0.15 mg según disponibilidad)'
        : weight < 30
          ? 'Autoinyector 0.15 mg'
          : 'Autoinyector 0.30 mg';

    const severity: SeverityLevel = isAnaphylaxis ? 'critical' : 'low';

    return {
      primaryResult: {
        label: 'Dosis Adrenalina IM (1:1000 = 1 mg/mL)',
        value: doseMg,
        formattedValue: `${formatClinicalNumber(doseMg, 2)} mg (${volumeMl} mL)`,
        unit: 'IM muslo anterolateral',
      },
      secondaryResults: [
        { label: 'Criterios clínicos WAO cumplidos', formattedValue: `${metCount} / 3`, unit: isAnaphylaxis ? 'ANAFILAXIA CONFIRMADA' : 'No cumple criterios' },
        { label: 'Equivalente autoinyector', formattedValue: autoinjector, unit: '' },
        ...(weight < 50 && doseMg > pedCappedMg
          ? [{ label: 'Tope pediátrico prepuberal habitual', formattedValue: `${formatClinicalNumber(pedCappedMg, 2)} mg`, unit: '(máx 0.30 mg en niños)' }]
          : []),
      ],
      severity,
      riskClassification: isAnaphylaxis
        ? `Criterios positivos de Anafilaxia (${metCount}/3) — Administrar Adrenalina IM de inmediato`
        : 'No cumple criterios WAO marcados (dosis de referencia calculada por peso)',
      clinicalInterpretation: isAnaphylaxis
        ? 'Emergencia médica: la adrenalina intramuscular precoz es el tratamiento de primera línea que reduce mortalidad y hospitalización.'
        : 'Si no cumple criterios de anafilaxia pero presenta síntomas progresivos o exposición de alto riesgo, vigilar estrechamente por posible evolución rápida.',
      guidance: isAnaphylaxis
        ? [
            `1. Administrar ${formatClinicalNumber(doseMg, 2)} mg (${volumeMl} mL de solución 1:1000) IM en cara anterolateral del muslo; puede repetirse cada 5–15 min si no hay respuesta.`,
            '2. Retirar agente causal, posición supina con piernas elevadas (o semisentado si disnea; decúbito lateral si vómitos), O₂ alto flujo y bolo de cristaloides si hipotensión.',
            '3. Antihistamínicos H1 y corticoides son solo coadyuvantes de segunda línea y NUNCA reemplazan ni deben retrasar la adrenalina; observar ≥ 4–8 h por riesgo bifásico.',
          ]
        : [
            'Vigilar signos de alarma respiratorios o hemodinámicos; ante progresión multisistémica administrar adrenalina IM sin demora.',
          ],
      guidanceDisclaimer: 'Verificar concentración de ampolla (1 mg/mL = 1:1000) antes de inyectar intramuscularmente.',
      formulaUsed: 'Adrenalina IM = 0.01 mg/kg (solución 1 mg/mL; máx. 0.5 mg/dosis adultos, 0.3 mg niños)',
      inputsSummary: `Peso: ${roundClinical(weight, 1)} kg · Dosis: ${formatClinicalNumber(doseMg, 2)} mg (${volumeMl} mL) · Criterios WAO: ${metCount}/3`,
    };
  },
};
