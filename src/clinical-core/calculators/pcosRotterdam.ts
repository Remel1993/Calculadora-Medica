import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SecondaryResultItem,
  SeverityLevel,
} from '../types/clinical.ts';

const ovulatoryDysfunctionField: BooleanFieldDef = {
  id: 'ovulatoryDysfunction',
  label: '1. Disfunción ovulatoria / oligo-anovulación (ciclos < 21 o > 35 días, o < 8 ciclos/año tras > 3 años posmenarquia)',
  type: 'boolean',
  defaultValue: true,
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
};

const hyperandrogenismField: BooleanFieldDef = {
  id: 'hyperandrogenism',
  label: '2. Hiperandrogenismo clínico (hirsutismo Ferriman-Gallwey modificado ≥ 4–6, acné grave o alopecia) o bioquímico (testosterona libre/FAI elevada)',
  type: 'boolean',
  defaultValue: true,
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
};

const pcomOrAmhField: BooleanFieldDef = {
  id: 'pcomOrAmh',
  label: '3. Morfología ovárica poliquística en ecografía (≥ 20 folículos/ovario o volumen ≥ 10 mL) o AMH elevada en adultas (Guía 2023)',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Presente',
  falseLabel: 'Ausente',
  helpText:
    'Según Guía Internacional SOP 2023: en adolescentes (< 8 años posmenarquia) NO se debe usar ecografía ni AMH por solapamiento fisiológico; requiere oligo-anovulación + hiperandrogenismo.',
};

const mimickersExcludedField: BooleanFieldDef = {
  id: 'mimickersExcluded',
  label: '¿Se han descartado diagnósticos diferenciales (hiperprolactinemia, disfunción tiroidea, hiperplasia suprarrenal congénita no clásica)?',
  type: 'boolean',
  defaultValue: true,
  trueLabel: 'Sí',
  falseLabel: 'Pendiente',
};

export const pcosRotterdamCalculator: CalculatorDefinition = {
  id: 'pcos-rotterdam',
  name: 'Criterios de Rotterdam y Fenotipos del Síndrome de Ovario Poliquístico (SOP 2023)',
  shortName: 'SOP (Rotterdam / Guía 2023)',
  primarySpecialty: 'gineco-obstetricia',
  secondarySpecialties: ['endocrinologia'],
  subcategory: 'diagnostico',
  keywords: [
    'sop',
    'pcos',
    'ovario poliquistico',
    'rotterdam',
    'hirsutismo',
    'oligoamenorrea',
    'hiperandrogenismo',
    'ginecologia',
    'endocrinologia',
  ],
  description:
    'Evalúa los criterios diagnósticos de Rotterdam actualizados según la Guía Internacional Basada en Evidencia para SOP (2023) y asigna el fenotipo clásico (A, B, C o D).',
  clinicalIndication:
    'Estudio ambulatorio de irregularidad menstrual, hirsutismo, acné resistente o infertilidad anovulatoria en mujeres en edad fértil.',
  validatedPopulation: 'Mujeres adultas (y adolescentes ≥ 8 años tras la menarquia; antes de 8 años solo oligo-anovulación + hiperandrogenismo).',
  contraindications: [
    'El SOP es un diagnóstico de exclusión: NO confirmar sin descartar embarazo, hipotiroidismo (TSH), hiperprolactinemia y 17-OH-progesterona (HSC no clásica).',
  ],
  limitations: [
    'En adolescentes (< 8 años posmenarquia), la morfología ovárica poliquística por ecografía y la AMH no deben utilizarse para el diagnóstico por alta tasa de falsos positivos fisiológicos.',
    'Si los tres criterios están presentes en una adulta con oligo-anovulación e hiperandrogenismo clínicos evidentes, la ecografía/AMH no es estrictamente indispensable para confirmar el diagnóstico (solo define fenotipo A vs. B).',
  ],
  version: 'Rotterdam (2003) · International PCOS Guideline (Teede et al., 2023)',
  references: [
    {
      citation:
        'Teede HJ, Tay CT, Laven JJE, et al. Recommendations from the 2023 International Evidence-based Guideline for the Assessment and Management of Polycystic Ovary Syndrome. Hum Reprod. 2023;38(9):1655-1679.',
      year: 2023,
    },
    {
      citation:
        'Rotterdam ESHRE/ASRM-Sponsored PCOS Consensus Workshop Group. Revised 2003 consensus on diagnostic criteria and long-term health risks related to polycystic ovary syndrome. Fertil Steril. 2004;81(1):19-25.',
      year: 2004,
    },
  ],
  fields: [ovulatoryDysfunctionField, hyperandrogenismField, pcomOrAmhField, mimickersExcludedField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(pcosRotterdamCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const od = Boolean(inputs.ovulatoryDysfunction);
    const ha = Boolean(inputs.hyperandrogenism);
    const pcom = Boolean(inputs.pcomOrAmh);
    const excluded = Boolean(inputs.mimickersExcluded);

    const count = (od ? 1 : 0) + (ha ? 1 : 0) + (pcom ? 1 : 0);

    let phenotype = 'No cumple SOP';
    if (od && ha && pcom) phenotype = 'Fenotipo A (Clásico completo: OD + HA + PCOM)';
    else if (od && ha && !pcom) phenotype = 'Fenotipo B (Clásico no poliquístico: OD + HA)';
    else if (!od && ha && pcom) phenotype = 'Fenotipo C (Ovulatorio: HA + PCOM)';
    else if (od && !ha && pcom) phenotype = 'Fenotipo D (Normoandrogénico: OD + PCOM)';

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (count < 2) {
      severity = count === 1 ? 'low' : 'normal';
      riskClassification = `No cumple criterios de Rotterdam (${count}/3 criterios)`;
      clinicalInterpretation =
        'Se requieren al menos 2 de los 3 criterios de Rotterdam para diagnosticar SOP en adultas.';
      guidance.push('Si solo existe un criterio, investigar causa aislada (p. ej. anovulación hipotalámica, hiperprolactinemia o hirsutismo idiopático).');
    } else if (!excluded) {
      severity = 'high';
      riskClassification = `Cumple ${count}/3 criterios pero FALTA exclusión de imitadores`;
      clinicalInterpretation =
        `Patrón compatible con ${phenotype}, pero el diagnóstico definitivo de SOP exige descartar antes otras causas endocrinas.`;
      guidance.push(
        'Solicitar TSH, prolactina, 17-OH-progesterona basal (fase folicular temprana) y prueba de embarazo si hay amenorrea antes de confirmar SOP.',
      );
    } else {
      severity = 'moderate';
      riskClassification = `Compatible con SOP — ${phenotype}`;
      clinicalInterpretation =
        'Reúne ≥ 2 criterios de Rotterdam tras excluir otras endocrinopatías imitadoras.';
      guidance.push(
        'Evaluar riesgo cardiometabólico basal según Guía 2023: IMC, presión arterial, perfil lipídico y cribado de intolerancia a la glucosa (PTOG 75 g o HbA1c/glucemia según factores de riesgo).',
        'Abordaje de primera línea: intervención en estilo de vida; considerar anticonceptivos orales combinados, metformina o antiandrógenos según deseo gestacional y síntoma predominante.',
      );
    }

    const secondaryResults: SecondaryResultItem[] = [
      { label: 'Criterios Rotterdam presentes', formattedValue: `${count} / 3`, unit: '(mín. 2)' },
      { label: 'Fenotipo asignado', formattedValue: count >= 2 ? phenotype.split(' (')[0] : 'No aplica', unit: '' },
    ];

    return {
      primaryResult: {
        label: 'Diagnóstico SOP (Rotterdam)',
        value: count,
        formattedValue: count >= 2 ? (excluded ? phenotype.split(' (')[0] : 'Estudiar exclusión') : 'No cumple',
        unit: `(${count}/3)`,
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'Criterios Rotterdam / SOP 2023: ≥ 2 de 3 (Disfunción ovulatoria, Hiperandrogenismo, PCOM/AMH) + exclusión',
      inputsSummary: `OD: ${od ? 'Sí' : 'No'} · HA: ${ha ? 'Sí' : 'No'} · PCOM/AMH: ${pcom ? 'Sí' : 'No'} · Exclusión: ${excluded ? 'Sí' : 'Pendiente'}`,
    };
  },
};
