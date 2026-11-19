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
import { BP_UNITS_MMHG } from '../units/converters.ts';

const brachialRightField: NumberFieldDef = {
  id: 'brachialRight',
  label: 'PAS Braquial Derecha',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  min: 40,
  max: 280,
  placeholder: '134',
};

const brachialLeftField: NumberFieldDef = {
  id: 'brachialLeft',
  label: 'PAS Braquial Izquierda (opcional si no medible)',
  type: 'number',
  required: false,
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  min: 40,
  max: 280,
  placeholder: '130',
  helpText: 'Se utiliza la PAS braquial más alta entre ambos brazos como denominador (criterio ACC/AHA y ESC).',
};

const dpField: NumberFieldDef = {
  id: 'dorsalisPedis',
  label: 'PAS Arteria Pedia (Dorsalis pedis) de la extremidad evaluada',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  min: 20,
  max: 320,
  placeholder: '104',
};

const ptField: NumberFieldDef = {
  id: 'posteriorTibial',
  label: 'PAS Arteria Tibial Posterior (opcional si no audible)',
  type: 'number',
  required: false,
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  min: 20,
  max: 320,
  placeholder: '108',
  helpText: 'Se toma la presión más alta entre pedia y tibial posterior de la pierna evaluada.',
};

export const ankleBrachialIndexCalculator: CalculatorDefinition = {
  id: 'abi-itb',
  name: 'Índice Tobillo-Brazo (ITB / ABI — Enfermedad Arterial Periférica)',
  shortName: 'Índice Tobillo-Brazo (ITB)',
  primarySpecialty: 'cardiologia',
  secondarySpecialties: ['medicina-interna', 'endocrinologia', 'cirugia-general'],
  subcategory: 'diagnostico',
  keywords: ['itb', 'abi', 'tobillo brazo', 'pie diabetico', 'claudicacion', 'isquemia', 'arterial periferica'],
  description:
    'Calcula el Índice Tobillo-Brazo (ITB) utilizando la mayor PAS braquial como denominador y la mayor PAS maleolar (pedia o tibial posterior) de la extremidad evaluada.',
  clinicalIndication:
    'Tamizaje y diagnóstico de enfermedad arterial periférica (EAP), evaluación vascular en pie diabético, úlceras de miembros inferiores y claudicación intermitente.',
  validatedPopulation: 'Adultos con factores de riesgo cardiovascular, diabetes mellitus, síntomas claudicantes o úlceras en miembros inferiores.',
  contraindications: [
    'Evitar compresión con manguito en extremidad con trombosis venosa profunda aguda, injerto/bypass reciente o dolor isquémico crítico intolerable.',
  ],
  limitations: [
    'En pacientes con diabetes de larga evolución o enfermedad renal crónica, la calcificación de la capa media arterial (esclerosis de Mönckeberg) produce arterias no compresibles (ITB > 1.40) que enmascaran la isquemia; en esos casos debe realizarse Índice Dedo-Brazo (IDB) o Doppler espectral.',
  ],
  version: 'ACC/AHA & ESC PAD Guidelines',
  references: [
    {
      citation:
        'Gerhard-Herman MD, Gornik HL, Barrett C, et al. 2016 AHA/ACC Guideline on the Management of Patients With Lower Extremity Peripheral Artery Disease. Circulation. 2017;135(12):e726-e779.',
      year: 2017,
    },
    {
      citation:
        'Mazzolai L, Teixido-Tura G, Lanzi S, et al. 2024 ESC Guidelines for the management of peripheral arterial and aortic diseases. Eur Heart J. 2024;45(36):3538-3700.',
      year: 2024,
    },
  ],
  fields: [brachialRightField, brachialLeftField, dpField, ptField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(ankleBrachialIndexCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const brR = getCanonicalNumberValue(brachialRightField, inputs.brachialRight as NumberInputValue).canonicalValue!;
    const brL = getCanonicalNumberValue(brachialLeftField, inputs.brachialLeft as NumberInputValue).canonicalValue;
    const dp = getCanonicalNumberValue(dpField, inputs.dorsalisPedis as NumberInputValue).canonicalValue!;
    const pt = getCanonicalNumberValue(ptField, inputs.posteriorTibial as NumberInputValue).canonicalValue;

    const maxBrachial = brL !== null ? Math.max(brR, brL) : brR;
    const maxAnkle = pt !== null ? Math.max(dp, pt) : dp;
    const abi = roundClinical(maxAnkle / maxBrachial, 2);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (abi > 1.4) {
      severity = 'moderate';
      riskClassification = `Arterias no compresibles (ITB ${formatClinicalNumber(abi, 2)} > 1.40)`;
      clinicalInterpretation =
        'Calcificación arterial medial probable (frecuente en diabetes y ERC); NO descarta enfermedad arterial periférica.';
      guidance = [
        'Solicitar Índice Dedo-Brazo (IDB, normal ≥ 0.70), análisis de onda Doppler o presión transcutánea de oxígeno (TcPO₂).',
      ];
    } else if (abi >= 1.0) {
      severity = 'normal';
      riskClassification = `ITB Normal (${formatClinicalNumber(abi, 2)} — 1.00 a 1.40)`;
      clinicalInterpretation =
        'Flujo arterial en reposo dentro de parámetros normales. Si existe claudicación típica, considerar ITB post-ejercicio.';
      guidance = ['Control habitual de factores de riesgo cardiovascular.'];
    } else if (abi >= 0.91) {
      severity = 'low';
      riskClassification = `ITB Limítrofe / Borderline (${formatClinicalNumber(abi, 2)} — 0.91 a 0.99)`;
      clinicalInterpretation =
        'Rango limítrofe asociado a mayor riesgo cardiovascular; no descarta EAP leve o enfermedad sintomática tras esfuerzo.';
      guidance = ['Si hay síntomas sugestivos, considerar ITB tras ejercicio o valoración Doppler vascular.'];
    } else if (abi > 0.4) {
      severity = abi <= 0.6 ? 'high' : 'moderate';
      riskClassification = `Enfermedad Arterial Periférica (ITB ${formatClinicalNumber(abi, 2)} ≤ 0.90)`;
      clinicalInterpretation =
        abi >= 0.7
          ? 'EAP leve (0.70–0.90); marcador de aterosclerosis sistémica de alto riesgo cardiovascular.'
          : 'EAP moderada (0.41–0.69); riesgo significativo de claudicación limitante y mala cicatrización de úlceras.';
      guidance = [
        'Prevención cardiovascular intensiva (cese tabáquico, estatina de alta intensidad, control glucémico/PA, antiagregación si sintomático/indicado) y caminata supervisada.',
        'Evitar vendajes compresivos fuertes en úlceras venosas mixtas sin valoración vascular cuando ITB < 0.80 (contraindicada compresión alta si ITB < 0.50–0.60).',
      ];
    } else {
      severity = 'critical';
      riskClassification = `EAP Grave / Riesgo de Isquemia Crítica (ITB ${formatClinicalNumber(abi, 2)} ≤ 0.40)`;
      clinicalInterpretation =
        'Hipoperfusión arterial severa con alto riesgo de necrosis tisular, dolor de reposo o pérdida de extremidad.';
      guidance = [
        'Derivación urgente/prioritaria a Cirugía Vascular para estudio anatómico y valoración de revascularización.',
      ];
    }

    const armDiff = brL !== null ? Math.abs(brR - brL) : 0;
    if (armDiff >= 15) {
      guidance.push(`Diferencia interbraquial ≥ 15 mmHg (${armDiff} mmHg): investigar estenosis subclavia o patología aórtica.`);
    }

    return {
      primaryResult: {
        label: 'Índice Tobillo-Brazo (ITB)',
        value: abi,
        formattedValue: formatClinicalNumber(abi, 2),
        unit: '',
      },
      secondaryResults: [
        { label: 'Mayor PAS en tobillo', formattedValue: String(maxAnkle), unit: 'mmHg' },
        { label: 'Mayor PAS braquial', formattedValue: String(maxBrachial), unit: 'mmHg' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'Medir tras 5–10 minutos de reposo en decúbito supino con sonda Doppler de 8–10 MHz.',
      formulaUsed: 'ITB = máx(PAS pedia, PAS tibial posterior) / máx(PAS braquial D, PAS braquial I)',
      inputsSummary: `Braquial máx: ${maxBrachial} mmHg · Tobillo máx: ${maxAnkle} mmHg → ITB: ${formatClinicalNumber(abi, 2)}`,
    };
  },
};
