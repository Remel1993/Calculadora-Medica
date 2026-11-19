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
  SeverityLevel,
} from '../types/clinical.ts';
import { BP_UNITS_MMHG, HR_UNITS_BPM } from '../units/converters.ts';

const hrField: NumberFieldDef = {
  id: 'hr',
  label: 'Frecuencia cardíaca materna (FC)',
  type: 'number',
  canonicalUnit: 'lpm',
  units: HR_UNITS_BPM,
  defaultUnitId: 'bpm',
  min: 30,
  max: 240,
  placeholder: '112',
};

const sbpField: NumberFieldDef = {
  id: 'sbp',
  label: 'Presión arterial sistólica materna (PAS)',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  min: 40,
  max: 260,
  placeholder: '98',
};

export const obstetricShockIndexCalculator: CalculatorDefinition = {
  id: 'obstetric-shock-index',
  name: 'Índice de Choque Obstétrico (OSI)',
  shortName: 'Índice Choque Obstétrico',
  primarySpecialty: 'gineco-obstetricia',
  secondarySpecialties: ['urgencias'],
  subcategory: 'gravedad',
  keywords: ['indice de choque obstetrico', 'osi', 'hemorragia posparto', 'hpp', 'codigo rojo', 'embarazo'],
  description:
    'Cociente FC / PAS calibrado específicamente para la fisiología del embarazo y posparto en la detección precoz de hemorragia obstétrica oculta.',
  clinicalIndication:
    'Vigilancia hemodinámica en hemorragia posparto (HPP), embarazo ectópico roto, placenta previa/abruptio y activación de Código Rojo obstétrico.',
  validatedPopulation: 'Gestantes y puérperas (por hipervolemia fisiológica del embarazo soportan pérdida de sangre sin hipotensión inicial; umbral normal < 0.9).',
  contraindications: [
    'La preeclampsia grave o el uso de labetalol/nifedipino/betabloqueadores pueden modificar falsamente la PAS o la FC, reduciendo la sensibilidad del índice.',
  ],
  limitations: [
    'En el embarazo normal el volumen plasmático aumenta ~40–50 %, por lo que la hipotensión (PAS < 90) aparece de forma tardía cuando ya se ha perdido > 1,500 mL.',
    'Un OSI ≥ 0.9 obliga a reevaluar el sangrado acumulado y el estado de perfusión; ≥ 1.7 se asocia a alto riesgo de transfusión masiva e ingreso a UCI (Nathan 2015 / FIGO).',
  ],
  version: 'Nathan HL et al. (BJOG 2015) / FIGO-OMS HPP',
  references: [
    {
      citation: 'Nathan HL, El Ayadi A, Hezelgrave NL, et al. Shock index: an effective predictor of outcome in postpartum haemorrhage? BJOG. 2015;122(2):268-275.',
      year: 2015,
    },
    {
      citation: 'Escobar MF, Nassar AH, Theron G, et al. FIGO recommendations on the management of postpartum hemorrhage 2022. Int J Gynaecol Obstet. 2022;157 Suppl 1:3-50.',
      year: 2022,
    },
  ],
  fields: [hrField, sbpField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(obstetricShockIndexCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const hr = getCanonicalNumberValue(hrField, inputs.hr as NumberInputValue).canonicalValue!;
    const sbp = getCanonicalNumberValue(sbpField, inputs.sbp as NumberInputValue).canonicalValue!;
    const osi = roundClinical(hr / sbp, 2);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (osi < 0.9) {
      severity = 'normal';
      riskClassification = `Rango normal en obstetricia (< 0.90: ${osi.toFixed(2)})`;
      clinicalInterpretation = 'Parámetro hemodinámico estable para gestación o posparto inmediato.';
    } else if (osi < 1.4) {
      severity = 'high';
      riskClassification = `Alerta obstétrica — OSI elevado (0.90 – 1.39: ${osi.toFixed(2)})`;
      clinicalInterpretation =
        'Primer signo de hipovolemia compensada en hemorragia obstétrica antes de la caída franca de la PAS.';
      guidance = [
        'Activar vigilancia estrecha / Código Rojo obstétrico, cuantificar sangrado, asegurar dos vías periféricas de grueso calibre, revisar tono uterino/causa (4 T) e iniciar cristaloides tibios y uterotónicos/ácido tranexámico según causa.',
      ];
    } else if (osi < 1.7) {
      severity = 'critical';
      riskClassification = `Alto riesgo de HPP grave (1.40 – 1.69: ${osi.toFixed(2)})`;
      clinicalInterpretation = 'Inestabilidad hemodinámica significativa con alta probabilidad de requerir hemoderivados.';
      guidance = ['Activar protocolo de Código Rojo, preparar paquete globular/hemoderivados, balón hemostático o manejo quirúrgico según etiología.'];
    } else {
      severity = 'critical';
      riskClassification = `Choque obstétrico crítico (≥ 1.70: ${osi.toFixed(2)})`;
      clinicalInterpretation = 'Riesgo muy elevado de transfusión masiva, coagulopatía dilucional/consumo, ingreso a UCI o mortalidad materna.';
      guidance = ['Reanimación hemostática inmediata con protocolo de transfusión masiva y control definitivo emergente del foco hemorrágico.'];
    }

    return {
      primaryResult: {
        label: 'Índice de Choque Obstétrico (FC / PAS)',
        value: osi,
        formattedValue: formatClinicalNumber(osi, 2),
        unit: 'ratio',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance: guidance.length > 0 ? guidance : undefined,
      formulaUsed: 'OSI = FC materna (lpm) / PAS materna (mmHg)',
      inputsSummary: `FC: ${hr} lpm · PAS: ${sbp} mmHg · OSI: ${osi.toFixed(2)}`,
    };
  },
};
