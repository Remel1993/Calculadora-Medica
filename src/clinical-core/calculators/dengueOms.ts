import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
} from '../types/clinical.ts';

const warningSignsFields: BooleanFieldDef[] = [
  { id: 'ws_pain', label: 'Signo de alarma: Dolor abdominal intenso y continuo (o a la palpación)', type: 'boolean', defaultValue: false },
  { id: 'ws_vomiting', label: 'Signo de alarma: Vómitos persistentes', type: 'boolean', defaultValue: false },
  { id: 'ws_fluid', label: 'Signo de alarma: Acumulación clínica de líquidos (ascitis, derrame pleural/pericárdico)', type: 'boolean', defaultValue: false },
  { id: 'ws_bleed', label: 'Signo de alarma: Sangrado de mucosas (gingivorragia, epistaxis, metrorragia)', type: 'boolean', defaultValue: false },
  { id: 'ws_lethargy', label: 'Signo de alarma: Letargia o irritabilidad/inquietud', type: 'boolean', defaultValue: false },
  { id: 'ws_liver', label: 'Signo de alarma: Hepatomegalia > 2 cm por debajo del reborde costal', type: 'boolean', defaultValue: false },
  { id: 'ws_labs', label: 'Signo de alarma: Aumento progresivo del hematocrito junto con caída rápida de plaquetas', type: 'boolean', defaultValue: false },
];

const severeFields: BooleanFieldDef[] = [
  { id: 'sev_plasma', label: 'Dengue grave: Extravasación grave de plasma (choque por dengue o distrés respiratorio por acumulación de líquidos)', type: 'boolean', defaultValue: false },
  { id: 'sev_bleed', label: 'Dengue grave: Hemorragia grave según evaluación clínica', type: 'boolean', defaultValue: false },
  { id: 'sev_organ', label: 'Dengue grave: Compromiso grave de órganos (AST/ALT ≥ 1000 U/L, alteración de conciencia/SNC, miocarditis u otro órgano)', type: 'boolean', defaultValue: false },
];

const riskGroupField: BooleanFieldDef = {
  id: 'comorbidityOrSocial',
  label: 'Condición coexistente o riesgo social (Grupo B1): embarazo, lactante, adulto mayor, obesidad, diabetes, ERC, hepatopatía o vive solo/lejos',
  type: 'boolean',
  defaultValue: false,
};

export const dengueOmsCalculator: CalculatorDefinition = {
  id: 'dengue-oms',
  name: 'Clasificación de Gravedad del Dengue (OMS / OPS)',
  shortName: 'Dengue OMS/OPS',
  primarySpecialty: 'infectologia',
  secondarySpecialties: ['urgencias', 'pediatria'],
  subcategory: 'diagnostico',
  keywords: ['dengue', 'oms', 'ops', 'signos de alarma', 'dengue grave', 'arbovirus', 'choque'],
  description:
    'Clasificación clínica revisada de la OMS/OPS (2009/2016) en Dengue sin signos de alarma (Grupo A/B1), Dengue con signos de alarma (Grupo B2) y Dengue grave (Grupo C).',
  clinicalIndication:
    'Triaje y definición del nivel de vigilancia y reposición en pacientes con sospecha o confirmación clínica/laboratorial de dengue.',
  validatedPopulation: 'Adultos y población pediátrica en zonas endémicas o con antecedente epidemiológico compatible.',
  contraindications: [
    'La ausencia de signos de alarma en las primeras 48–72 h (fase febril) no descarta progresión durante la defervescencia (fase crítica); reevaluar diariamente.',
  ],
  limitations: [
    'Requiere sospecha clínica previa compatible (fiebre + ≥ 2 criterios: náuseas/vómitos, exantema, mialgias/artralgias, prueba del torniquete positiva, leucopenia) o confirmación diagnóstica.',
    'La clasificación orienta el grupo de manejo (A, B1, B2, C), pero la reposición de líquidos debe ajustarse hora a hora según hemodinamia y diuresis.',
  ],
  version: 'OMS (2009) / OPS Directrices Dengue',
  references: [
    {
      citation:
        'World Health Organization. Dengue: guidelines for diagnosis, treatment, prevention and control. New edition. Geneva: WHO; 2009.',
      year: 2009,
    },
    {
      citation:
        'Organización Panamericana de la Salud (OPS). Directrices para el diagnóstico clínico y el tratamiento del dengue, el chikunguña y el zika. Washington, D.C.: OPS; 2022.',
      year: 2022,
    },
  ],
  fields: [...severeFields, ...warningSignsFields, riskGroupField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(dengueOmsCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const severeCount = severeFields.filter((f) => inputs[f.id] === true).length;
    const warningCount = warningSignsFields.filter((f) => inputs[f.id] === true).length;
    const hasRiskGroup = inputs.comorbidityOrSocial === true;

    if (severeCount > 0) {
      return {
        primaryResult: {
          label: 'Clasificación OMS / OPS',
          value: 3,
          formattedValue: 'Dengue Grave (Grupo C)',
          unit: `${severeCount} criterio(s) grave(s)`,
        },
        severity: 'critical',
        riskClassification: 'Dengue Grave — Grupo de Manejo C',
        clinicalInterpretation:
          'Presencia de extravasación plasmática grave, hemorragia grave o disfunción orgánica grave. Emergencia médica con alto riesgo de choque refractario.',
        guidance: [
          'Hospitalización inmediata en área de reanimación/UCI, cristaloides isotónicos IV según protocolo de choque por dengue (OPS/OMS) y monitorización continua.',
        ],
        formulaUsed: 'Criterios clínicos OMS/OPS: presencia de ≥ 1 criterio de Dengue Grave',
        inputsSummary: `Criterios graves: ${severeCount} · Signos de alarma: ${warningCount}`,
      };
    }

    if (warningCount > 0) {
      return {
        primaryResult: {
          label: 'Clasificación OMS / OPS',
          value: 2,
          formattedValue: 'Con Signos de Alarma (B2)',
          unit: `${warningCount} signo(s)`,
        },
        severity: 'high',
        riskClassification: 'Dengue con Signos de Alarma — Grupo de Manejo B2',
        clinicalInterpretation:
          'Fase crítica inminente o en curso con aumento de permeabilidad capilar. Riesgo de progresión a choque si no se maneja oportunamente.',
        guidance: [
          'Ingreso hospitalario para hidratación intravenosa controlada con cristaloides isotónicos, vigilancia estricta de signos vitales, hematocrito y diuresis.',
        ],
        formulaUsed: 'Criterios OMS/OPS: ≥ 1 signo de alarma sin criterios de dengue grave',
        inputsSummary: `Signos de alarma: ${warningCount}`,
      };
    }

    if (hasRiskGroup) {
      return {
        primaryResult: {
          label: 'Clasificación OMS / OPS',
          value: 1,
          formattedValue: 'Sin Alarma + Riesgo (B1)',
          unit: 'Grupo B1',
        },
        severity: 'moderate',
        riskClassification: 'Dengue sin Signos de Alarma con Condición Asociada — Grupo B1',
        clinicalInterpretation:
          'Sin signos de alarma actuales, pero con comorbilidad o vulnerabilidad social que aumenta el riesgo de complicaciones.',
        guidance: [
          'Observación o internación para seguimiento estrecho, hidratación oral supervisada (o IV si no tolera vía oral) y educación sobre signos de alarma.',
        ],
        formulaUsed: 'Sin criterios graves ni signos de alarma + condición coexistente/riesgo social',
        inputsSummary: 'Sin alarma · Con condición asociada o riesgo social (Grupo B1)',
      };
    }

    return {
      primaryResult: {
        label: 'Clasificación OMS / OPS',
        value: 0,
        formattedValue: 'Sin Signos de Alarma (A)',
        unit: 'Grupo A',
      },
      severity: 'low',
      riskClassification: 'Dengue sin Signos de Alarma — Grupo de Manejo A',
      clinicalInterpretation:
        'Sin signos de alarma ni condiciones de riesgo social/clínico identificadas en esta valoración.',
      guidance: [
        'Manejo ambulatorio con hidratación oral abundante, control térmico con paracetamol (evitar AINEs/AAS), reposo y control clínico cada 24–48 h especialmente en la defervescencia.',
      ],
      formulaUsed: 'Sin criterios graves, sin signos de alarma y sin condiciones asociadas',
      inputsSummary: 'Grupo A (sin alarma ni riesgo asociado)',
    };
  },
};
