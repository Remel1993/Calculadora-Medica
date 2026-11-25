import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SecondaryResultItem,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const skeletalSoftTissueField: SelectFieldDef = {
  id: 'skeletalSoftTissue',
  label: '1. Lesión esquelética y de partes blandas',
  type: 'select',
  defaultValue: '1',
  options: [
    {
      value: '1',
      label: 'Baja energía (+1) · Fractura simple, herida por arma de fuego civil o incisa limpia',
      points: 1,
    },
    {
      value: '2',
      label: 'Energía media (+2) · Fracturas abiertas o múltiples, luxación',
      points: 2,
    },
    {
      value: '3',
      label: 'Alta energía (+3) · Escopeta a corta distancia, arma militar o aplastamiento',
      points: 3,
    },
    {
      value: '4',
      label: 'Muy alta energía (+4) · Igual que anterior + contaminación masiva y avulsión extensa',
      points: 4,
    },
  ],
};

const ischemiaField: SelectFieldDef = {
  id: 'ischemia',
  label: '2. Isquemia de la extremidad (valor base antes de duplicar si > 6 h)',
  type: 'select',
  defaultValue: '1',
  options: [
    {
      value: '0',
      label: 'Sin isquemia (0) · Pulsos conservados y perfusión distal normal',
      points: 0,
    },
    {
      value: '1',
      label: 'Leve (+1) · Pulso disminuido o ausente pero perfusión distal conservada',
      points: 1,
    },
    {
      value: '2',
      label: 'Moderada (+2) · Sin pulso, parestesias y relleno capilar disminuido',
      points: 2,
    },
    {
      value: '3',
      label: 'Grave (+3) · Extremidad fría, paralizada, insensible y entumecida',
      points: 3,
    },
  ],
};

const ischemiaGt6hField: BooleanFieldDef = {
  id: 'ischemiaGt6h',
  label: '¿Duración de la isquemia > 6 horas? (Duplica el puntaje de isquemia)',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Sí (×2)',
  falseLabel: 'No',
};

const shockField: SelectFieldDef = {
  id: 'shock',
  label: '3. Choque sistémico (presión arterial sistólica)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: 'Normotenso (0) · PAS > 90 mmHg mantenida', points: 0 },
    { value: '1', label: 'Hipotensión transitoria (+1) · Responde a volumen', points: 1 },
    { value: '2', label: 'Hipotensión persistente (+2) · PAS < 90 mmHg refractaria', points: 2 },
  ],
};

const ageField: SelectFieldDef = {
  id: 'age',
  label: '4. Edad del paciente',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '< 30 años (0 pts)', points: 0 },
    { value: '1', label: '30 a 50 años (+1 pt)', points: 1 },
    { value: '2', label: '> 50 años (+2 pts)', points: 2 },
  ],
};

export const messScoreCalculator: CalculatorDefinition = {
  id: 'mess-extremity',
  name: 'MESS — Mangled Extremity Severity Score (Extremidad Catastrófica)',
  shortName: 'MESS (Extremidad Grave)',
  primarySpecialty: 'traumatologia',
  secondarySpecialties: ['urgencias', 'cirugia-general'],
  subcategory: 'gravedad',
  keywords: [
    'mess',
    'extremidad catastrofica',
    'amputacion',
    'isquemia',
    'traumatologia',
    'trauma vascular',
    'aplastamiento',
  ],
  description:
    'Evalúa la gravedad de traumatismos graves de extremidades integrando daño óseo/blando, isquemia (duplicada si > 6 h), choque y edad (1 a 14 puntos).',
  clinicalIndication:
    'Documentación estandarizada de la gravedad inicial y apoyo multidisciplinario en traumatismos complejos de extremidad con compromiso vascular.',
  validatedPopulation: 'Adultos con traumatismo grave abierto o vascular de extremidad (validación original predominantemente en miembro inferior).',
  contraindications: [
    'NO debe emplearse como único criterio para indicar amputación primaria.',
  ],
  limitations: [
    'Advertencia crítica (Estudio LEAP, Bosse et al. 2002; Guías BOAST): en la medicina moderna, un MESS ≥ 7 tiene baja sensibilidad para predecir amputación inevitable gracias a técnicas actuales de revascularización y colgajos libres.',
    'La decisión de salvamento vs. amputación debe tomarla el equipo ortoplástico y vascular evaluando la lesión del nervio tibial/ciático, comorbilidades y pronóstico funcional.',
  ],
  version: 'Johansen et al. (1990) · Con advertencia LEAP/BOAST',
  references: [
    {
      citation:
        'Johansen K, Daines M, Howey T, Helfet D, Hansen ST Jr. Objective criteria accurately predict amputation following lower extremity trauma. J Trauma. 1990;30(5):568-572.',
      year: 1990,
    },
    {
      citation:
        'Bosse MJ, MacKenzie EJ, Kellam JF, et al. A prospective evaluation of the clinical utility of the lower-extremity injury-severity scores (LEAP Study). N Engl J Med. 2001 / J Bone Joint Surg Am. 2001;83(1):3-14.',
      year: 2001,
    },
  ],
  fields: [skeletalSoftTissueField, ischemiaField, ischemiaGt6hField, shockField, ageField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(messScoreCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const skel = Number(inputs.skeletalSoftTissue);
    const ischBase = Number(inputs.ischemia);
    const ischGt6h = Boolean(inputs.ischemiaGt6h);
    const ischPts = ischBase * (ischGt6h ? 2 : 1);
    const shock = Number(inputs.shock);
    const age = Number(inputs.age);
    const total = skel + ischPts + shock + age;

    let severity: SeverityLevel = 'moderate';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (total < 7) {
      severity = total <= 4 ? 'moderate' : 'high';
      riskClassification = `MESS < 7 (${total} pts) · Alta probabilidad de viabilidad en cohorte original`;
      clinicalInterpretation =
        'En la serie histórica de Johansen (1990), una puntuación < 7 se asoció con salvamento exitoso de la extremidad tras estabilización y revascularización.';
      guidance.push(
        'Priorizar reanimación hemodinámica, control hemorrágico y reparación vascular/ortopédica precoz si existe isquemia.',
      );
    } else {
      severity = 'critical';
      riskClassification = `MESS ≥ 7 (${total} pts) · Extremidad en riesgo crítico`;
      clinicalInterpretation =
        'En la cohorte original de 1990, ≥ 7 puntos predijo necesidad de amputación; sin embargo, estudios prospectivos modernos (LEAP) demuestran que muchas extremidades con MESS ≥ 7 son salvables con cirugía ortoplástica.';
      guidance.push(
        'No usar MESS ≥ 7 de forma aislada para decidir amputación primaria: realizar valoración inmediata conjunta por Traumatología, Cirugía Vascular y Cirugía Plástica.',
        'Monitorizar síndrome compartimental, rabdomiólisis e hiperpotasemia tras reperfusión.',
      );
    }

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Puntos por isquemia',
        formattedValue: `${ischPts} pts${ischGt6h && ischBase > 0 ? ' (×2 por > 6 h)' : ''}`,
        unit: '',
      },
      {
        label: 'Umbral histórico de Johansen',
        formattedValue: '≥ 7 pts',
        unit: '',
      },
    ];

    return {
      primaryResult: {
        label: 'MESS Total',
        value: total,
        formattedValue: `${total} / 14`,
        unit: 'puntos',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'MESS = Óseo/Blandos (1–4) + Isquemia (0–3 × 2 si >6 h) + Choque (0–2) + Edad (0–2)',
      inputsSummary: `MESS ${total}/14 (Lesión ${skel} · Isquemia ${ischPts} · Choque ${shock} · Edad ${age})`,
    };
  },
};
