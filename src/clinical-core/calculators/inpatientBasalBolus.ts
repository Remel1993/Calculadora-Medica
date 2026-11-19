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
import { GLUCOSE_UNITS_MG_DL, WEIGHT_UNITS_KG } from '../units/converters.ts';

const weightField: NumberFieldDef = {
  id: 'weight',
  label: 'Peso corporal del paciente',
  type: 'number',
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  min: 30,
  max: 250,
  placeholder: '75',
};

const glucoseField: NumberFieldDef = {
  id: 'glucose',
  label: 'Glucemia actual / de ingreso',
  type: 'number',
  canonicalUnit: 'mg/dL',
  units: GLUCOSE_UNITS_MG_DL,
  defaultUnitId: 'mg_dl',
  min: 20,
  max: 1000,
  placeholder: '235',
};

const clinicalProfileField: SelectFieldDef = {
  id: 'clinicalProfile',
  label: 'Perfil clínico y sensibilidad estimada a la insulina',
  type: 'select',
  defaultValue: 'auto',
  options: [
    {
      value: 'auto',
      label: 'Estándar RABBIT-2 (según glucemia: 0.4 U/kg si 140–200; 0.5 U/kg si > 200 mg/dL)',
      description: 'Adulto hospitalizado no crítico sin insuficiencia renal ni riesgo alto de hipoglucemia.',
    },
    {
      value: 'sensitive',
      label: 'Alto riesgo de hipoglucemia / Sensible (0.3 U/kg/día)',
      description: 'Edad ≥ 70 años, TFGe < 45–60 mL/min/1.73 m², bajo peso o sin insulina previa.',
    },
    {
      value: 'very_sensitive',
      label: 'Muy frágil / ERC avanzada (0.2 U/kg/día)',
      description: 'ERC estadio 4–5 (TFGe < 30), insuficiencia hepática o desnutrición grave.',
    },
    {
      value: 'resistant',
      label: 'Insulinorresistencia marcada / Corticoides (0.6 U/kg/día)',
      description: 'Obesidad severa, infección aguda grave o uso de esteroides sistémicos a dosis moderadas-altas.',
    },
  ],
};

const oralIntakeField: SelectFieldDef = {
  id: 'oralIntake',
  label: 'Estado nutricional / Vía oral actual',
  type: 'select',
  defaultValue: 'eating',
  options: [
    {
      value: 'eating',
      label: 'Tolerando vía oral (Esquema Basal-Bolo 50% / 50% + corrección)',
    },
    {
      value: 'npo',
      label: 'Ayuno / NPO o ingesta incierta (Esquema Basal-Plus: solo basal + corrección)',
    },
  ],
};

export const inpatientBasalBolusCalculator: CalculatorDefinition = {
  id: 'inpatient-basal-bolus',
  name: 'Esquema Basal-Bolo Hospitalario por Peso (RABBIT-2 / ADA)',
  shortName: 'Basal-Bolo Hospitalario',
  primarySpecialty: 'medicina-interna',
  secondarySpecialties: ['endocrinologia', 'urgencias'],
  subcategory: 'dosificacion',
  keywords: [
    'rabbit 2',
    'basal bolo',
    'basal plus',
    'insulina hospitalaria',
    'insulina por peso',
    'hiperglucemia',
    'escala movil',
    'ada',
    'glargina',
  ],
  description:
    'Calcula la dosis diaria total inicial de insulina por peso (0.2–0.6 U/kg/día) y su distribución en insulina basal, prandial y factor de sensibilidad en pacientes hospitalizados no críticos (estudio RABBIT-2 y guías ADA).',
  clinicalIndication:
    'Inicio seguro de insulinoterapia subcutánea en sala general o área de observación cuando se desconoce la dosis habitual del paciente o al suspender antidiabéticos orales al ingreso.',
  validatedPopulation: 'Adultos hospitalizados en sala médica o quirúrgica no críticos con hiperglucemia (≥ 140 mg/dL).',
  contraindications: [
    'NUNCA administrar insulina si la glucemia es < 70 mg/dL (activar protocolo de hipoglucemia).',
    'No utilizar como sustituto de perfusión IV en Cetoacidosis Diabética (CAD) ni Estado Hiperosmolar (EHH).',
    'Evitar usar "escala móvil de insulina rápida sola" (sliding scale aislada) como único tratamiento, por su menor eficacia y mayor variabilidad glucémica.',
  ],
  limitations: [
    'Si el paciente ya usaba insulina ambulatoria, habitualmente se parte de su Dosis Diaria Total previa reducida un 20–25% ante cambio de dieta hospitalaria o enfermedad aguda.',
    'Las dosis calculadas se redondean a unidades enteras para verificación clínica segura.',
  ],
  version: 'RABBIT-2 (Umpierrez et al., 2007) / ADA Hospital Care (2024)',
  references: [
    {
      citation:
        'Umpierrez GE, Smiley D, Zisman A, et al. Randomized study of basal-bolus insulin therapy in the inpatient management of patients with type 2 diabetes (RABBIT 2 trial). Diabetes Care. 2007;30(9):2181-2186.',
      year: 2007,
    },
    {
      citation:
        'American Diabetes Association. Diabetes Care in the Hospital: Standards of Care in Diabetes—2024. Diabetes Care. 2024;47(Suppl. 1):S295-S306.',
      year: 2024,
    },
  ],
  fields: [weightField, glucoseField, clinicalProfileField, oralIntakeField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(inpatientBasalBolusCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const weight = getCanonicalNumberValue(weightField, inputs.weight as NumberInputValue).canonicalValue!;
    const glucose = getCanonicalNumberValue(glucoseField, inputs.glucose as NumberInputValue).canonicalValue!;
    const profile = inputs.clinicalProfile as 'auto' | 'sensitive' | 'very_sensitive' | 'resistant';
    const intake = inputs.oralIntake as 'eating' | 'npo';

    // Hypoglycemia safety lock
    if (glucose < 70) {
      return {
        primaryResult: {
          label: 'Bloqueo de seguridad por hipoglucemia',
          value: 0,
          formattedValue: '0 U (Diferir)',
          unit: 'Glucemia < 70 mg/dL',
        },
        severity: 'critical',
        riskClassification: 'Alerta de Hipoglucemia (< 70 mg/dL)',
        clinicalInterpretation:
          'Contraindicado iniciar esquema de insulina con glucemia < 70 mg/dL. Tratar hipoglucemia inmediatamente y reevaluar causa.',
        guidance: [
          'Administrar 15–20 g de carbohidratos de absorción rápida (o dextrosa IV si incapacidad de vía oral) y repetir glucemia capilar a los 15 minutos.',
        ],
        formulaUsed: 'Bloqueo de seguridad cuando Glucemia < 70 mg/dL',
        inputsSummary: `Peso: ${weight} kg · Glucemia: ${glucose} mg/dL`,
      };
    }

    let factor = 0.4;
    if (profile === 'auto') {
      factor = glucose > 200 ? 0.5 : 0.4;
    } else if (profile === 'sensitive') {
      factor = 0.3;
    } else if (profile === 'very_sensitive') {
      factor = 0.2;
    } else {
      factor = 0.6;
    }

    const fullTdd = Math.max(4, Math.round(weight * factor));
    const basalUnits = Math.max(2, Math.round(fullTdd * 0.5));
    const prandialTotal = intake === 'eating' ? Math.max(3, fullTdd - basalUnits) : 0;
    const perMealUnits = intake === 'eating' ? Math.max(1, Math.round(prandialTotal / 3)) : 0;
    const effectiveTdd = basalUnits + perMealUnits * 3;
    const estimatedFsi = roundClinical(1800 / fullTdd, 0);

    // Simple corrective scale when BG > 180 mg/dL (starting above target 140-180)
    const corrStep = Math.max(1, Math.round(50 / estimatedFsi));
    const corr180 = corrStep;
    const corr230 = corrStep * 2;
    const corr280 = corrStep * 3;

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    if (glucose < 140) {
      severity = 'low';
      riskClassification = 'Glucemia en rango normal/objetivo (< 140 mg/dL)';
    } else if (glucose <= 200) {
      severity = 'moderate';
      riskClassification = `Hiperglucemia hospitalaria leve-moderada (${factor} U/kg/día)`;
    } else {
      severity = 'high';
      riskClassification = `Hiperglucemia hospitalaria significativa (${factor} U/kg/día)`;
    }

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Insulina Basal (50% DDT — c/24 h o NPH c/12 h)',
        formattedValue: String(basalUnits),
        unit: 'U/día',
      },
      {
        label:
          intake === 'eating'
            ? 'Insulina Prandial rápida (50% DDT ÷ 3 comidas)'
            : 'Insulina Prandial fija (NPO)',
        formattedValue: intake === 'eating' ? `${perMealUnits} U` : '0 U (omitir)',
        unit: intake === 'eating' ? 'antes de c/comida' : 'paciente en ayuno',
      },
      {
        label: 'Factor de sensibilidad estimado (Regla 1800)',
        formattedValue: `1 U por ${estimatedFsi} mg/dL`,
        unit: '',
        note: `Corrección orientativa si >180: +${corr180} U (181–230), +${corr230} U (231–280), +${corr280} U (>280)`,
      },
    ];

    const guidance: string[] = [];
    if (glucose < 140) {
      guidance.push(
        'Con glucemia < 140 mg/dL sin tratamiento previo agresivo, valorar monitorización capilar preprandial antes de iniciar dosis fijas completas.',
      );
    }
    if (intake === 'npo') {
      guidance.push(
        `Paciente en ayuno (NPO): esquema Basal-Plus (${basalUnits} U de insulina basal + correcciones cada 6 h si glucemia > 180 mg/dL); NO administrar bolos prandiales fijos.`,
      );
    } else {
      guidance.push(
        `Objetivo glucémico hospitalario estándar (ADA 2024): 140–180 mg/dL en la mayoría de pacientes no críticos.`,
      );
    }
    if (glucose >= 250) {
      guidance.push(
        'Con glucemia ≥ 250 mg/dL descartar cetoacidosis (cetonas/gasometría) y estado hiperosmolar antes de optar por esquema subcutáneo.',
      );
    }

    return {
      primaryResult: {
        label:
          intake === 'eating'
            ? `Dosis Diaria Total Inicial (${factor} U/kg/día)`
            : `Dosis Basal Inicial en NPO (50% de ${fullTdd} U)`,
        value: intake === 'eating' ? effectiveTdd : basalUnits,
        formattedValue: String(intake === 'eating' ? effectiveTdd : basalUnits),
        unit: 'U/día',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation:
        intake === 'eating'
          ? `Esquema Basal-Bolo: ${basalUnits} U de insulina basal + ${perMealUnits} U de análogo rápido antes de desayuno, comida y cena (total ${effectiveTdd} U/día).`
          : `Esquema Basal-Plus (NPO): ${basalUnits} U de insulina basal al día + escala de corrección subcutánea cada 6 horas sin dosis prandiales fijas.`,
      guidance,
      guidanceDisclaimer: 'Ajustar dosis diariamente según controles capilares y cambios en ingesta o función renal.',
      formulaUsed: `DDT = Peso × ${factor} U/kg/día; Basal = 50% DDT; Prandial = 50% DDT ÷ 3 (si vía oral)`,
      inputsSummary: `Peso: ${weight} kg · Gluc: ${glucose} mg/dL · Perfil: ${factor} U/kg · Vía oral: ${intake === 'eating' ? 'Sí' : 'NPO'}`,
    };
  },
};
