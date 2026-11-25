import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SecondaryResultItem,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const sexField: SelectFieldDef = {
  id: 'sex',
  label: 'S · Sexo biológico',
  type: 'select',
  defaultValue: '2',
  options: [
    { value: '2', label: 'Masculino (+2 pts)', points: 2 },
    { value: '0', label: 'Femenino (0 pts)', points: 0 },
  ],
};

const timingField: SelectFieldDef = {
  id: 'timing',
  label: 'T · Tiempo desde inicio del dolor hasta la consulta',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '3', label: '< 6 horas (+3 pts)', points: 3 },
    { value: '1', label: '6 a 24 horas (+1 pt)', points: 1 },
    { value: '0', label: '> 24 horas (0 pts)', points: 0 },
  ],
};

const originField: SelectFieldDef = {
  id: 'origin',
  label: 'O · Origen / Etnia (variable del modelo original de Moore 2014)',
  type: 'select',
  defaultValue: '3',
  options: [
    { value: '3', label: 'No afrodescendiente (+3 pts)', points: 3 },
    { value: '0', label: 'Afrodescendiente (0 pts)', points: 0 },
  ],
  helpText:
    'Variable estadística incluida en la derivación original de Yale (2014); ver limitaciones sobre algoritmos basados en raza.',
};

const nauseaField: SelectFieldDef = {
  id: 'nausea',
  label: 'N · Náuseas y vómitos',
  type: 'select',
  defaultValue: '1',
  options: [
    { value: '0', label: 'Sin náuseas ni vómitos (0 pts)', points: 0 },
    { value: '1', label: 'Solo náuseas (+1 pt)', points: 1 },
    { value: '2', label: 'Vómitos presentes (+2 pts)', points: 2 },
  ],
};

const erythrocytesField: BooleanFieldDef = {
  id: 'erythrocytes',
  label: 'E · Eritrocitos / hematuria microscópica en orina (+3)',
  type: 'boolean',
  defaultValue: true,
  trueLabel: 'Positivo (+3)',
  falseLabel: 'Negativo',
  helpText: 'Tira reactiva positiva para sangre o sedimento urinario con eritrocitos.',
};

export const stoneScoreCalculator: CalculatorDefinition = {
  id: 'stone-score',
  name: 'STONE Score — Probabilidad de Litiasis Ureteral (Cólico Nefrítico)',
  shortName: 'STONE Score (Litiasis)',
  primarySpecialty: 'urologia',
  secondarySpecialties: ['urgencias'],
  subcategory: 'diagnostico',
  keywords: [
    'stone',
    'litiasis',
    'urolitiasis',
    'colico nefritico',
    'calculo renal',
    'hematuria',
    'urologia',
  ],
  description:
    'Estima la probabilidad clínica de litiasis ureteral no complicada en pacientes con dolor en flanco agudo (0 a 13 puntos).',
  clinicalIndication:
    'Pacientes adultos estables con sospecha de cólico nefrítico agudo para racionalizar la solicitud de TC abdomino-pélvica sin contraste.',
  validatedPopulation: 'Adultos ≥ 18 años en urgencias con dolor agudo en flanco sin sospecha clínica de infección urinaria ni sepsis.',
  contraindications: [
    'NO utilizar en pacientes con fiebre, escalofríos o sospecha de pielonefritis obstructiva / sepsis urinaria (requieren imagen y derivación urgente).',
    'No aplicar en embarazadas, monorrenos, trasplantados renales ni sospecha de aneurisma de aorta abdominal.',
  ],
  limitations: [
    'Controversia ética y metodológica: el modelo original de Moore (2014) incluye la variable raza/origen (+3 pts no afrodescendiente). Las guías actuales recomiendan cautela con variables raciales y priorizar la ecografía renal a pie de cama (hidronefrosis en protocolo STONE-PLUS).',
    'Un puntaje alto no descarta diagnósticos alternativos potencialmente graves (aneurisma aórtico, torsión ovárica, apendicitis retrocecal) en mayores de 50 años.',
  ],
  version: 'Moore et al. BMJ (2014)',
  references: [
    {
      citation:
        'Moore CL, Bomann S, Daniels B, et al. Derivation and validation of a clinical prediction rule for uncomplicated ureteral stone—the STONE score: retrospective and prospective observational cohort studies. BMJ. 2014;348:g2191.',
      year: 2014,
    },
    {
      citation:
        'Daniels B, Gross CP, Molinaro A, et al. STONE PLUS: Evaluation of emergency department patients with suspected renal colic, using a clinical prediction tool combined with point-of-care limited ultrasonography. Ann Emerg Med. 2016;67(4):439-448.',
      year: 2016,
    },
  ],
  fields: [sexField, timingField, originField, nauseaField, erythrocytesField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(stoneScoreCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const s = Number(inputs.sex);
    const t = Number(inputs.timing);
    const o = Number(inputs.origin);
    const n = Number(inputs.nausea);
    const e = inputs.erythrocytes ? 3 : 0;
    const total = s + t + o + n + e;

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let probability = '';
    const guidance: string[] = [];

    if (total <= 5) {
      severity = 'low';
      probability = '~8.3–9.2%';
      riskClassification = 'Probabilidad baja de litiasis ureteral (0–5 pts)';
      clinicalInterpretation =
        'Baja probabilidad de cálculo ureteral sintomático en la cohorte original; alta probabilidad de diagnóstico alternativo.';
      guidance.push(
        'Ampliar diagnóstico diferencial de dolor abdominal/lumbar (patología osteomuscular, digestiva, ginecológica o vascular en adultos mayores) antes de asumir cólico nefrítico.',
      );
    } else if (total <= 9) {
      severity = 'moderate';
      probability = '~51.3–51.6%';
      riskClassification = 'Probabilidad moderada de litiasis ureteral (6–9 pts)';
      clinicalInterpretation =
        'Probabilidad intermedia (~51%); la ecografía renal a pie de cama buscando hidronefrosis mejora sustancialmente la precisión diagnóstica.';
      guidance.push(
        'Considerar ecografía renal/vesical como primera imagen y TC de baja dosis sin contraste si persiste duda diagnóstica o dolor refractario.',
      );
    } else {
      severity = 'high';
      probability = '~88.6–89.6%';
      riskClassification = 'Probabilidad alta de litiasis ureteral (10–13 pts)';
      clinicalInterpretation =
        'Alta probabilidad (~89%) de litiasis ureteral no complicada; en menores de 50 años estables y sin fiebre puede evitarse TC inmediata si la ecografía es concordante.';
      guidance.push(
        'Asegurar analgesia eficaz (AINE IV salvo contraindicación renal), descartar infección en urocultivo/sedimento y vigilar signos de alarma (fiebre, anuria o dolor incoercible).',
      );
    }

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Prevalencia de litiasis (cohorte validación)',
        formattedValue: probability,
        unit: '',
      },
      {
        label: 'Desglose S-T-O-N-E',
        formattedValue: `${s} + ${t} + ${o} + ${n} + ${e}`,
        unit: 'pts',
      },
    ];

    return {
      primaryResult: {
        label: 'STONE Score',
        value: total,
        formattedValue: `${total} / 13`,
        unit: 'puntos',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'STONE = Sexo (0/2) + Tiempo (0/1/3) + Origen (0/3) + Náusea/Vómito (0/1/2) + Eritrocitos (0/3)',
      inputsSummary: `STONE ${total}/13 (${probability})`,
    };
  },
};
