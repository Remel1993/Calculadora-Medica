import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const ruleField: SelectFieldDef = {
  id: 'rule',
  label: 'Regla clínica cervical',
  type: 'select',
  defaultValue: 'nexus',
  options: [
    { value: 'nexus', label: 'Criterios NEXUS (Bajo riesgo)' },
    { value: 'canadian_cspine', label: 'Canadian C-Spine Rule (CCR)' },
  ],
};

// NEXUS 5 criteria (True = criterion PRESENT / abnormal finding requiring imaging)
const nexusMidline: BooleanFieldDef = {
  id: 'nexusMidline',
  label: 'Sensibilidad en línea media cervical posterior',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
  visibleWhen: (i) => i.rule !== 'canadian_cspine',
};
const nexusNeuro: BooleanFieldDef = {
  id: 'nexusNeuro',
  label: 'Déficit neurológico focal',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
  visibleWhen: (i) => i.rule !== 'canadian_cspine',
};
const nexusAltered: BooleanFieldDef = {
  id: 'nexusAltered',
  label: 'Alteración del estado de alerta (GCS < 15 o desorientación)',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Normal',
  defaultValue: false,
  visibleWhen: (i) => i.rule !== 'canadian_cspine',
};
const nexusIntox: BooleanFieldDef = {
  id: 'nexusIntox',
  label: 'Evidencia de intoxicación (alcohol o drogas)',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
  visibleWhen: (i) => i.rule !== 'canadian_cspine',
};
const nexusDistracting: BooleanFieldDef = {
  id: 'nexusDistracting',
  label: 'Lesión dolorosa distractora (fractura larga, visceral, quemadura extensa, etc.)',
  type: 'boolean',
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  defaultValue: false,
  visibleWhen: (i) => i.rule !== 'canadian_cspine',
};

// Canadian C-Spine Rule (for alert GCS 15 stable patients)
const ccrHighRisk: BooleanFieldDef = {
  id: 'ccrHighRisk',
  label: '1. Factor de alto riesgo: Edad ≥ 65 años, mecanismo peligroso (caída ≥ 1 m/5 escalones, carga axial, alta velocidad ≥ 100 km/h, vuelco, eyección, bici/moto) o parestesias en extremidades',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.rule === 'canadian_cspine',
};
const ccrLowRiskFactor: BooleanFieldDef = {
  id: 'ccrLowRiskFactor',
  label: '2. Factor de bajo riesgo que permite explorar movilidad (colisión trasera simple, sentado en urgencias, caminó tras evento, dolor cervical tardío o ausencia de dolor en línea media)',
  type: 'boolean',
  trueLabel: 'Sí tiene',
  falseLabel: 'Ninguno',
  defaultValue: true,
  visibleWhen: (i) => i.rule === 'canadian_cspine',
};
const ccrRotate45: BooleanFieldDef = {
  id: 'ccrRotate45',
  label: '3. Capaz de rotar activamente el cuello 45° a izquierda y derecha',
  type: 'boolean',
  trueLabel: 'Sí (45°)',
  falseLabel: 'No puede',
  defaultValue: true,
  visibleWhen: (i) => i.rule === 'canadian_cspine',
};

export const cervicalTraumaCalculator: CalculatorDefinition = {
  id: 'cervical-trauma',
  name: 'Trauma Cervical Menor — Criterios NEXUS y Canadian C-Spine Rule',
  shortName: 'Columna Cervical (NEXUS/CCR)',
  primarySpecialty: 'traumatologia',
  secondarySpecialties: ['urgencias', 'neurologia'],
  subcategory: 'diagnostico',
  keywords: ['nexus', 'canadian c-spine', 'collarin', 'trauma cervical', 'columna cervical', 'latigazo'],
  description:
    'Permite decidir el retiro seguro de inmovilización cervical sin radiografías ni TAC en trauma cerrado estable mediante NEXUS o Canadian C-Spine Rule.',
  clinicalIndication:
    'Evaluación inicial de trauma cerrado cervical con paciente alerta y hemodinámicamente estable (GCS 15).',
  validatedPopulation: 'Adultos alertas y estables (Canadian C-Spine validada ≥ 16 años; NEXUS incluye población general estable, precaución en extremos de edad).',
  contraindications: [
    'No usar Canadian C-Spine Rule en trauma penetrante, GCS < 15, inestabilidad hemodinámica, enfermedad vertebral conocida (espondilitis anquilosante, AR) o parálisis aguda.',
    'Nunca forzar rotación cervical pasiva si existe dolor intenso o sospecha de fractura inestable.',
  ],
  limitations: [
    'En adultos mayores (≥ 65 años), Canadian C-Spine indica imagen automáticamente; NEXUS tiene menor sensibilidad reportada en ancianos con lesiones distractoras.',
  ],
  version: 'Hoffman et al. NEXUS (2000) & Stiell et al. CCR (2001)',
  references: [
    {
      citation:
        'Hoffman JR, Mower WR, Wolfson AB, Todd KH, Zucker MI. Validity of a set of clinical criteria to rule out injury to the cervical spine in patients with blunt trauma (NEXUS). N Engl J Med. 2000;343(2):94-99.',
      year: 2000,
    },
    {
      citation:
        'Stiell IG, Wells GA, Vandemheen KL, et al. The Canadian C-spine rule for radiography in alert and stable trauma patients. JAMA. 2001;286(15):1841-1848.',
      year: 2001,
    },
  ],
  fields: [
    ruleField,
    nexusMidline,
    nexusNeuro,
    nexusAltered,
    nexusIntox,
    nexusDistracting,
    ccrHighRisk,
    ccrLowRiskFactor,
    ccrRotate45,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(cervicalTraumaCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const isCcr = inputs.rule === 'canadian_cspine';
    let needsImaging = false;
    let detail = '';

    if (!isCcr) {
      const positives =
        Number(Boolean(inputs.nexusMidline)) +
        Number(Boolean(inputs.nexusNeuro)) +
        Number(Boolean(inputs.nexusAltered)) +
        Number(Boolean(inputs.nexusIntox)) +
        Number(Boolean(inputs.nexusDistracting));
      needsImaging = positives > 0;
      detail = needsImaging
        ? `${positives} criterio(s) NEXUS alterado(s)`
        : 'Cumple los 5 criterios NEXUS de bajo riesgo';
    } else {
      const high = Boolean(inputs.ccrHighRisk);
      const low = Boolean(inputs.ccrLowRiskFactor);
      const rot = Boolean(inputs.ccrRotate45);
      needsImaging = high || !low || !rot;
      if (high) detail = 'Factor de alto riesgo presente en Canadian C-Spine';
      else if (!low) detail = 'Sin factor de bajo riesgo que permita explorar rotación segura';
      else if (!rot) detail = 'Incapacidad para rotar el cuello 45° activamente a ambos lados';
      else detail = 'Sin alto riesgo, con factor de bajo riesgo y rotación activa de 45° conservada';
    }

    const severity: SeverityLevel = needsImaging ? 'high' : 'normal';
    return {
      primaryResult: {
        label: isCcr ? 'Canadian C-Spine Rule' : 'Criterios NEXUS',
        value: needsImaging ? 1 : 0,
        formattedValue: needsImaging ? 'Imagen indicada' : 'Despeje clínico',
        unit: '',
      },
      severity,
      riskClassification: needsImaging
        ? `No cumple despeje clínico — Mantener inmovilización e imagen`
        : 'Bajo riesgo — Imagen cervical NO indicada',
      clinicalInterpretation: needsImaging
        ? `${detail}. Se recomienda mantener protección cervical hasta descartar lesión mediante estudio de imagen (TAC o serie cervical según disponibilidad/riesgo).`
        : `${detail}. Alta sensibilidad para descartar lesión cervical clínicamente significativa; puede retirarse el collarín cervical de forma segura.`,
      guidance: needsImaging
        ? ['Mantener restricción de movimiento espinal y solicitar imagen de columna cervical.']
        : ['Retirar collarín cervical si estaba colocado y documentar exploración neurológica normal.'],
      guidanceDisclaimer: 'Nunca realizar rotación activa si hay factores de alto riesgo o déficit neurológico.',
      formulaUsed: isCcr
        ? 'CCR: Alto riesgo = Imagen | Sin bajo riesgo = Imagen | Sin rotación 45° = Imagen'
        : 'NEXUS: Cualquier criterio positivo de 5 = Imagen indicada',
      inputsSummary: `${isCcr ? 'Canadian C-Spine' : 'NEXUS'} · ${detail}`,
    };
  },
};
