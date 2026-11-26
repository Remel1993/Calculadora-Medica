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
  SecondaryResultItem,
  SelectFieldDef,
} from '../types/clinical.ts';
import { WEIGHT_UNITS_KG } from '../units/converters.ts';

const scenarioField: SelectFieldDef = {
  id: 'scenario',
  label: 'Escenario clínico',
  type: 'select',
  defaultValue: 'tratamiento_ribavirina',
  options: [
    {
      value: 'tratamiento_ribavirina',
      label: 'Fiebre de Lassa confirmada/probable: Esquema IV de Ribavirina',
      description: 'Cálculo exacto de dosis de carga y mantenimiento por peso (régimen McCormick / OMS).',
    },
    {
      value: 'sospecha_triaje',
      label: 'Sospecha clínica temprana y diagnóstico diferencial',
      description: 'Claves clínicas (faringitis, dolor retroesternal, proteinuria) y bioseguridad.',
    },
    {
      value: 'embarazo_complicaciones',
      label: 'Embarazo (alto riesgo) / Hipoacusia neurosensorial y gravedad',
      description: 'Manejo obstétrico y vigilancia de complicaciones.',
    },
  ],
};

const weightField: NumberFieldDef = {
  id: 'weightKg',
  label: 'Peso del paciente',
  type: 'number',
  required: true,
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  defaultValue: '60',
  min: 5,
  max: 250,
  placeholder: 'Ej. 60',
  helpText:
    'Usado para calcular dosis de Ribavirina IV con topes máximos estándar (carga máx 2,000 mg; c/6 h máx 1,000 mg; c/8 h máx 500 mg).',
};

const daysField: NumberFieldDef = {
  id: 'daysFromOnset',
  label: 'Días desde el inicio de los síntomas',
  type: 'number',
  required: true,
  canonicalUnit: 'días',
  units: [
    {
      id: 'days',
      label: 'días',
      toCanonical: (v) => v,
      min: 1,
      max: 30,
      step: 1,
    },
  ],
  defaultUnitId: 'days',
  defaultValue: '4',
  min: 1,
  max: 30,
  placeholder: 'Ej. 4',
  helpText:
    'La eficacia clínica de la ribavirina IV es máxima cuando se inicia dentro de los primeros 6 días de enfermedad (≤ 6 días).',
};

const endemicField: BooleanFieldDef = {
  id: 'endemicOrRodent',
  label: 'Estancia en África Occidental endémica o exposición a roedores (Mastomys natalensis) / fluidos humanos en últimos 6–21 días',
  type: 'boolean',
  defaultValue: false,
};

const clinicalCluesField: BooleanFieldDef = {
  id: 'pharyngitisOrChestPain',
  label: 'Claves sugestivas: faringitis exudativa, dolor retroesternal, edema facial/cervical o proteinuria',
  type: 'boolean',
  defaultValue: false,
};

const severeField: BooleanFieldDef = {
  id: 'severeSigns',
  label: 'Criterios de gravedad: sangrado mucoso, AST ≥ 150 U/L, trombocitopenia, hipoacusia, encefalopatía o embarazo',
  type: 'boolean',
  defaultValue: false,
};

export const lassaVirusCalculator: CalculatorDefinition = {
  id: 'lassa-virus',
  name: 'Fiebre de Lassa (Arenavirus): Triaje Clínico y Dosificación de Ribavirina IV (OMS / CDC)',
  shortName: 'Virus de Lassa (Ribavirina IV)',
  primarySpecialty: 'infectologia',
  secondarySpecialties: ['urgencias', 'medicina-interna', 'gineco-obstetricia', 'pediatria'],
  subcategory: 'dosificacion',
  keywords: [
    'lassa',
    'fiebre de lassa',
    'arenavirus',
    'mastomys',
    'ribavirina',
    'mccormick',
    'fiebre hemorragica',
    'hipoacusia',
    'faringitis exudativa',
  ],
  description:
    'Evaluación clínica de sospecha de Fiebre de Lassa (incubación 6–21 días) y cálculo exacto del régimen intravenoso estándar de Ribavirina (dosis de carga + días 1–4 + días 5–10) según guías OMS/CDC.',
  clinicalIndication:
    'Dosificación rápida de Ribavirina IV y estratificación de riesgo clínico-obstétrico en pacientes con Fiebre de Lassa confirmada o sospecha de alta probabilidad.',
  validatedPopulation:
    'Adultos, embarazadas y población pediátrica con exposición epidemiológica compatible y sospecha o confirmación por RT-PCR/ELISA de Fiebre de Lassa.',
  contraindications: [
    'Evitar AINEs, ácido acetilsalicílico e inyecciones intramusculares innecesarias por riesgo de sangrado mucoso y disfunción plaquetaria.',
    'La ribavirina es teratogénica y embriotóxica en embarazo de bajo riesgo o profilaxis rutinaria; sin embargo, en Fiebre de Lassa confirmada durante el embarazo la mortalidad materna supera el beneficio fetal teórico y las guías OMS avalan su uso valorando riesgo vital.',
  ],
  limitations: [
    'Controversia científica actual: el esquema clásico de McCormick (NEJM 1986) demostró beneficio especialmente en casos graves (AST ≥ 150 U/L o viremia alta) iniciados ≤ 6 días; revisiones recientes debaten su utilidad real en enfermedad leve sin factores de gravedad y señalan anemia hemolítica dosis-dependiente.',
    'Hasta ~80 % de las infecciones por virus de Lassa son asintomáticas o leves e indistinguibles de malaria o fiebre tifoidea sin pruebas moleculares (RT-PCR).',
  ],
  requiredLabsNote:
    'RT-PCR específica de virus de Lassa o detección de antígeno/IgM ELISA; vigilar hemoglobina, reticulocitos (anemia hemolítica por ribavirina), plaquetas, AST/ALT, creatinina y proteinuria.',
  version: 'OMS Lassa Fever Guidelines · CDC Lassa Clinical Guidance · Régimen McCormick',
  references: [
    {
      citation:
        'World Health Organization (WHO). Lassa fever: Fact sheet and clinical management guidance. Geneva: WHO.',
      year: 2023,
    },
    {
      citation:
        'Centers for Disease Control and Prevention (CDC). Lassa Fever: Clinical Guidance and Ribavirin Treatment Protocol. Atlanta: CDC.',
      year: 2024,
    },
    {
      citation:
        'McCormick JB, King IJ, Webb PA, et al. Lassa fever. Effective therapy with ribavirin. N Engl J Med. 1986;314(1):20-26.',
      year: 1986,
    },
  ],
  fields: [scenarioField, weightField, daysField, endemicField, clinicalCluesField, severeField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(lassaVirusCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const scenario = String(inputs.scenario ?? 'tratamiento_ribavirina');
    const weightKg =
      getCanonicalNumberValue(weightField, inputs.weightKg as NumberInputValue).canonicalValue ??
      60;
    const daysFromOnset =
      getCanonicalNumberValue(daysField, inputs.daysFromOnset as NumberInputValue).canonicalValue ??
      4;
    const endemicOrRodent = inputs.endemicOrRodent === true;
    const clinicalClues = inputs.pharyngitisOrChestPain === true;
    const severeSigns = inputs.severeSigns === true;

    const earlyWindow = daysFromOnset <= 6;
    const loadingMg = roundClinical(Math.min(weightKg * 30, 2000), 0);
    const maintD1To4Mg = roundClinical(Math.min(weightKg * 16, 1000), 0);
    const maintD5To10Mg = roundClinical(Math.min(weightKg * 8, 500), 0);

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Dosis de carga IV única (Ribavirina)',
        formattedValue: `${formatClinicalNumber(loadingMg, 0)} mg IV`,
        unit: '30 mg/kg (tope 2,000 mg)',
        note: 'Administrar en infusión IV lenta diluida tras confirmar acceso venoso.',
      },
      {
        label: 'Mantenimiento Días 1–4 (c/6 h × 16 dosis)',
        formattedValue: `${formatClinicalNumber(maintD1To4Mg, 0)} mg IV c/6 h`,
        unit: '16 mg/kg/dosis (tope 1,000 mg/dosis)',
        note: 'Iniciar 6 horas después de la dosis de carga.',
      },
      {
        label: 'Mantenimiento Días 5–10 (c/8 h × 18 dosis)',
        formattedValue: `${formatClinicalNumber(maintD5To10Mg, 0)} mg IV c/8 h`,
        unit: '8 mg/kg/dosis (tope 500 mg/dosis)',
        note: 'Completar 10 días totales vigilando hemoglobina (anemia hemolítica reversible).',
      },
    ];

    if (scenario === 'embarazo_complicaciones' || severeSigns) {
      return {
        primaryResult: {
          label: 'Carga Ribavirina IV (Alta prioridad)',
          value: loadingMg,
          formattedValue: `${formatClinicalNumber(loadingMg, 0)} mg IV`,
          unit: earlyWindow ? 'Ventana óptima ≤ 6 d' : 'Inicio tardío (> 6 d)',
        },
        secondaryResults,
        severity: 'critical',
        riskClassification: 'Fiebre de Lassa Grave / Embarazo — Alto Riesgo de Mortalidad',
        clinicalInterpretation:
          'Presencia de marcadores de gravedad (hemorragia, AST ≥ 150 U/L, compromiso neurológico, sordera VIII par o gestación). En embarazadas del 3.er trimestre la mortalidad materna sin manejo intensivo es muy elevada.',
        guidance: [
          `Iniciar Ribavirina IV: carga ${formatClinicalNumber(loadingMg, 0)} mg → ${formatClinicalNumber(maintD1To4Mg, 0)} mg c/6 h (días 1–4) → ${formatClinicalNumber(maintD5To10Mg, 0)} mg c/8 h (días 5–10). ${earlyWindow ? 'Ventana ≤ 6 días óptima para reducir mortalidad.' : 'Aunque han pasado > 6 días, en cuadros graves o AST elevada se mantiene la indicación clínica.'}`,
          'Embarazo: la evacuación uterina oportuna tras estabilización mejora significativamente la supervivencia materna en Lassa grave del tercer trimestre; coordinar con obstetricia y UCI bajo aislamiento estricto.',
          'Vigilar complicaciones frecuentes: hipoacusia neurosensorial (afecta ~25–30 % de los sobrevivientes, incluso en cuadros moderados), derrame pericárdico/pleural, edema facial y anemia hemolítica por ribavirina.',
          'Control estricto de infecciones (contacto y gotas/aerosoles), reposición cuidadosa de líquidos (evitar sobrecarga por fuga capilar) y soporte renal.',
        ],
        formulaUsed: 'Carga min(30×peso, 2000) mg · D1–4 min(16×peso, 1000) mg c/6 h · D5–10 min(8×peso, 500) mg c/8 h',
        inputsSummary: `Peso: ${formatClinicalNumber(weightKg, 1)} kg · Día de enfermedad: ${daysFromOnset} · Gravedad/embarazo: Sí`,
      };
    }

    if (scenario === 'sospecha_triaje') {
      const suspicionScore = (endemicOrRodent ? 1 : 0) + (clinicalClues ? 1 : 0);
      return {
        primaryResult: {
          label: 'Probabilidad de sospecha clínica',
          value: suspicionScore,
          formattedValue:
            suspicionScore === 2
              ? 'Sospecha Alta'
              : suspicionScore === 1
                ? 'Sospecha Intermedia'
                : 'Riesgo Bajo',
          unit: earlyWindow ? `Día ${daysFromOnset} (≤ 6 d)` : `Día ${daysFromOnset} (> 6 d)`,
        },
        secondaryResults,
        severity: suspicionScore === 2 ? 'high' : suspicionScore === 1 ? 'moderate' : 'low',
        riskClassification:
          suspicionScore === 2
            ? 'Alta sospecha clínica de Fiebre de Lassa — Aislar y Solicitar RT-PCR'
            : suspicionScore === 1
              ? 'Sospecha clínica parcial — Ampliar estudio diferencial'
              : 'Sin nexo ni tríada sugestiva de Lassa',
        clinicalInterpretation:
          suspicionScore === 2
            ? 'La combinación de exposición endémica (Mastomys natalensis o caso índice en los últimos 6–21 días) con faringitis exudativa, dolor retroesternal o proteinuria es altamente sugestiva frente a malaria o tifoidea.'
            : 'Descartar causas febriles comunes (malaria, fiebre tifoidea, dengue, leptospirosis). Si existió contacto de alto riesgo, aislar preventivamente hasta obtener RT-PCR.',
        guidance: [
          'Solicitar RT-PCR para virus de Lassa, frotis/gota gruesa para malaria, hemocultivos, AST/ALT y análisis de orina (la proteinuria y AST > 150 U/L orientan fuertemente).',
          'En contactos con exposición percutánea/mucosa de alto riesgo a fluidos de caso confirmado, valorar con infectología/salud pública el riesgo-beneficio de profilaxis oral con ribavirina (controvertida por toxicidad hematológica; preferir vigilancia estricta si bajo riesgo).',
        ],
        formulaUsed: 'Evaluación sindrómica (exposición 6–21 días + claves clínicas) + Régimen McCormick',
        inputsSummary: `Peso: ${formatClinicalNumber(weightKg, 1)} kg · Día: ${daysFromOnset} · Nexo: ${endemicOrRodent ? 'Sí' : 'No'} · Claves clínicas: ${clinicalClues ? 'Sí' : 'No'}`,
      };
    }

    return {
      primaryResult: {
        label: 'Dosis de carga Ribavirina IV',
        value: loadingMg,
        formattedValue: `${formatClinicalNumber(loadingMg, 0)} mg IV`,
        unit: earlyWindow ? 'Inicio oportuno (≤ 6 días)' : 'Inicio > 6 días',
      },
      secondaryResults,
      severity: earlyWindow ? 'moderate' : 'high',
      riskClassification: earlyWindow
        ? 'Esquema IV de Ribavirina en Ventana Terapéutica Óptima (≤ 6 días)'
        : 'Esquema IV de Ribavirina de Inicio Tardío (> 6 días)',
      clinicalInterpretation: earlyWindow
        ? 'El inicio dentro de los primeros 6 días de enfermedad logra la mayor reducción histórica de mortalidad en Fiebre de Lassa moderada-grave.'
        : 'Después del día 6 de evolución la eficacia antiviral desciende; mantener soporte clínico estrecho y vigilar hemólisis inducida por ribavirina.',
      guidance: [
        `Esquema calculado para ${formatClinicalNumber(weightKg, 1)} kg: Carga ${formatClinicalNumber(loadingMg, 0)} mg IV única → ${formatClinicalNumber(maintD1To4Mg, 0)} mg IV c/6 h días 1–4 → ${formatClinicalNumber(maintD5To10Mg, 0)} mg IV c/8 h días 5–10.`,
        'Realizar control de hemoglobina/hematocrito cada 48 h (descenso frecuente por anemia hemolítica reversible) y ajustar soporte hídrico sin inducir edema pulmonar.',
        'Aislamiento de contacto y gotas; usar EPP completo en aspiración de secreciones o procedimientos invasivos y manejo seguro de muestras de laboratorio.',
      ],
      formulaUsed: 'McCormick / OMS: Carga 30 mg/kg (máx 2 g) · D1–4: 16 mg/kg c/6 h (máx 1 g) · D5–10: 8 mg/kg c/8 h (máx 500 mg)',
      inputsSummary: `Peso: ${formatClinicalNumber(weightKg, 1)} kg · Día desde inicio: ${daysFromOnset}`,
    };
  },
};
