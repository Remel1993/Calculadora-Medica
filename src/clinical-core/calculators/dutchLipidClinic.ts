import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SecondaryResultItem,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const familyHistoryField: SelectFieldDef = {
  id: 'familyHistory',
  label: '1. Historia familiar (puntuar solo el criterio de mayor puntaje)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 · Sin antecedentes familiares compatibles', points: 0 },
    {
      value: '1',
      label: '+1 · Familiar de 1.ᵉʳ grado con ECV prematura (< 55 a varón / < 60 a mujer) O con c-LDL > p95',
      points: 1,
    },
    {
      value: '2',
      label: '+2 · Familiar de 1.ᵉʳ grado con xantomas tendinosos / arco corneal O hijo < 18 años con c-LDL > p95',
      points: 2,
    },
  ],
};

const clinicalHistoryField: SelectFieldDef = {
  id: 'clinicalHistory',
  label: '2. Historia clínica personal (puntuar solo el de mayor puntaje)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 · Sin enfermedad vascular aterosclerótica prematura', points: 0 },
    {
      value: '1',
      label: '+1 · Enfermedad cerebrovascular o arterial periférica prematura (< 55 a varón / < 60 a mujer)',
      points: 1,
    },
    {
      value: '2',
      label: '+2 · Enfermedad arterial coronaria prematura (< 55 a varón / < 60 a mujer)',
      points: 2,
    },
  ],
};

const physicalExamField: SelectFieldDef = {
  id: 'physicalExam',
  label: '3. Exploración física (puntuar solo el de mayor puntaje)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 · Sin xantomas tendinosos ni arco corneal prematuro', points: 0 },
    { value: '4', label: '+4 · Arco corneal en menor de 45 años', points: 4 },
    { value: '6', label: '+6 · Xantomas tendinosos (Aquiles, extensores de los dedos)', points: 6 },
  ],
};

const ldlBaselineField: SelectFieldDef = {
  id: 'ldlBaseline',
  label: '4. c-LDL basal SIN tratamiento hipolipemiante',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 · c-LDL < 155 mg/dL (< 4.0 mmol/L)', points: 0 },
    { value: '1', label: '+1 · c-LDL 155–189 mg/dL (4.0–4.9 mmol/L)', points: 1 },
    { value: '3', label: '+3 · c-LDL 190–249 mg/dL (5.0–6.4 mmol/L)', points: 3 },
    { value: '5', label: '+5 · c-LDL 250–329 mg/dL (6.5–8.4 mmol/L)', points: 5 },
    { value: '8', label: '+8 · c-LDL ≥ 330 mg/dL (≥ 8.5 mmol/L)', points: 8 },
  ],
  helpText: 'Si el paciente ya toma estatina y no se conoce el c-LDL basal, debe estimarse con factores de corrección por potencia antes de aplicar DLCN.',
};

const geneticsField: SelectFieldDef = {
  id: 'genetics',
  label: '5. Análisis genético (mutación funcional en LDLR, APOB o PCSK9)',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 · No realizado o sin mutación patogénica identificada', points: 0 },
    { value: '8', label: '+8 · Mutación causal confirmada en gen LDLR, APOB o PCSK9', points: 8 },
  ],
};

export const dutchLipidClinicCalculator: CalculatorDefinition = {
  id: 'dutch-lipid-clinic',
  name: 'Criterios Dutch Lipid Clinic Network (Hipercolesterolemia Familiar)',
  shortName: 'DLCN (Hipercolesterolemia Fam.)',
  primarySpecialty: 'endocrinologia',
  secondarySpecialties: ['cardiologia', 'medicina-interna'],
  subcategory: 'diagnostico',
  keywords: [
    'dlcn',
    'dutch lipid',
    'hipercolesterolemia familiar',
    'hf',
    'ldl',
    'xantomas',
    'dislipidemia',
    'endocrinologia',
  ],
  description:
    'Estratifica el diagnóstico clínico de hipercolesterolemia familiar (HF) en adultos tomando únicamente la puntuación máxima dentro de cada uno de los 5 dominios.',
  clinicalIndication:
    'Sospecha de hipercolesterolemia familiar en consulta externa ante c-LDL ≥ 190 mg/dL, xantomas o enfermedad coronaria precoz personal o familiar.',
  validatedPopulation: 'Adultos (≥ 18 años) tras descartar causas secundarias de hipercolesterolemia (hipotiroidismo, síndrome nefrótico, colestasis).',
  contraindications: [
    'No está validado en niños ni adolescentes (en pediatría aplicar criterios de Simon Broome o puntos de corte pediátricos de c-LDL).',
  ],
  limitations: [
    'Requiere idealmente c-LDL basal previo al uso de estatinas/ezetimiba; usar c-LDL tratado sin ajuste subestima el diagnóstico.',
    'La regla oficial exige sumar SOLO el criterio de mayor puntuación dentro de cada grupo (no sumar dos ítems del mismo bloque).',
  ],
  version: 'WHO / Dutch Lipid Clinic Network (1999) · Guías ESC/EAS Dislipidemias',
  references: [
    {
      citation:
        'World Health Organization. Familial hypercholesterolaemia: report of a second WHO consultation. Geneva: WHO; 1999. (WHO/HGN/FH/CONS/99.2).',
      year: 1999,
    },
    {
      citation:
        'Mach F, Baigent C, Catapano AL, et al. 2019 ESC/EAS Guidelines for the management of dyslipidaemias. Eur Heart J. 2020;41(1):111-188.',
      year: 2020,
    },
  ],
  fields: [familyHistoryField, clinicalHistoryField, physicalExamField, ldlBaselineField, geneticsField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(dutchLipidClinicCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const pFam = Number(inputs.familyHistory);
    const pClin = Number(inputs.clinicalHistory);
    const pPhys = Number(inputs.physicalExam);
    const pLdl = Number(inputs.ldlBaseline);
    const pGen = Number(inputs.genetics);
    const total = pFam + pClin + pPhys + pLdl + pGen;

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (total < 3) {
      severity = 'low';
      riskClassification = 'HF Improbable (< 3 puntos)';
      clinicalInterpretation =
        'Baja probabilidad clínica de hipercolesterolemia familiar heterocigota monogénica.';
      guidance.push('Descartar causas secundarias y calcular riesgo CV global (p. ej. SCORE2) para orientar manejo lipídico.');
    } else if (total <= 5) {
      severity = 'moderate';
      riskClassification = 'HF Posible (3–5 puntos)';
      clinicalInterpretation =
        'Diagnóstico posible de hipercolesterolemia familiar; justifica estudio familiar en cascada lipídica y seguimiento estrecho.';
      guidance.push(
        'Descartar dislipidemia secundaria (TSH, perfil hepático, proteinuria), solicitar perfil lipídico a familiares de primer grado y considerar estudio genético si c-LDL ≥ 190 mg/dL.',
      );
    } else if (total <= 8) {
      severity = 'high';
      riskClassification = 'HF Probable (6–8 puntos)';
      clinicalInterpretation =
        'Alta probabilidad clínica de hipercolesterolemia familiar; no aplicar calculadoras de riesgo general como SCORE2 (riesgo CV intrínsecamente alto o muy alto).';
      guidance.push(
        'Iniciar terapia hipolipemiante de alta intensidad (estatina potente ± ezetimiba; considerar iPCSK9 según metas ESC/EAS) y cribado en cascada de familiares de primer grado.',
      );
    } else {
      severity = 'critical';
      riskClassification = 'HF Definitiva (> 8 puntos)';
      clinicalInterpretation =
        'Diagnóstico definitivo de hipercolesterolemia familiar; conlleva riesgo cardiovascular acumulado muy elevado desde edades tempranas.';
      guidance.push(
        'Tratamiento hipolipemiante intensivo combinado inmediato (objetivo c-LDL < 70 mg/dL o < 55 mg/dL si ECVA o factor de riesgo mayor), cribado genético/lipídico en cascada familiar y derivación a unidad de lípidos.',
      );
    }

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Desglose (Fam / Clín / Fís / LDL / Gen)',
        formattedValue: `${pFam} + ${pClin} + ${pPhys} + ${pLdl} + ${pGen}`,
        unit: 'pts',
      },
    ];

    return {
      primaryResult: {
        label: 'Puntaje DLCN',
        value: total,
        formattedValue: `${total}`,
        unit: 'puntos',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'Suma del máximo de cada uno de los 5 dominios DLCN (Improbable <3 · Posible 3–5 · Probable 6–8 · Definitiva >8)',
      inputsSummary: `DLCN ${total} pts (Fam ${pFam} · Clín ${pClin} · Fís ${pPhys} · LDL ${pLdl} · Gen ${pGen})`,
    };
  },
};
