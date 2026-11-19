import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SeverityLevel,
} from '../types/clinical.ts';

const chfField: BooleanFieldDef = {
  id: 'chf',
  label: 'C — Antecedente de insuficiencia cardíaca congestiva (ICC)',
  type: 'boolean',
  trueLabel: 'Sí (+1)',
  falseLabel: 'No (0)',
  defaultValue: false,
};

const hctField: BooleanFieldDef = {
  id: 'hctLt30',
  label: 'H — Hematocrito < 30 % (o hemoglobina aprox. < 10 g/dL)',
  type: 'boolean',
  trueLabel: 'Sí (+1)',
  falseLabel: 'No (0)',
  defaultValue: false,
};

const ecgField: BooleanFieldDef = {
  id: 'abnormalEcg',
  label: 'E — ECG anormal (ritmo no sinusal o cualquier cambio nuevo respecto a ECG previo)',
  type: 'boolean',
  trueLabel: 'Sí (+1)',
  falseLabel: 'No (0)',
  defaultValue: false,
};

const sobField: BooleanFieldDef = {
  id: 'shortnessOfBreath',
  label: 'S — Disnea (falta de aire asociada)',
  type: 'boolean',
  trueLabel: 'Sí (+1)',
  falseLabel: 'No (0)',
  defaultValue: false,
};

const sbpField: BooleanFieldDef = {
  id: 'sbpLt90',
  label: 'S — Presión arterial sistólica < 90 mmHg en el triaje inicial',
  type: 'boolean',
  trueLabel: 'Sí (+1)',
  falseLabel: 'No (0)',
  defaultValue: false,
};

export const sanFranciscoSyncopeCalculator: CalculatorDefinition = {
  id: 'san-francisco-syncope',
  name: 'Regla de Síncope de San Francisco (CHESS — Urgencias)',
  shortName: 'San Francisco Síncope',
  primarySpecialty: 'urgencias',
  secondarySpecialties: ['cardiologia', 'medicina-interna'],
  subcategory: 'gravedad',
  keywords: ['sincope', 'san francisco', 'chess', 'desmayo', 'urgencias', 'arritmia'],
  description:
    'Regla clínica de 5 criterios (mnemotecnia CHESS) para identificar pacientes con síncope en urgencias en riesgo de eventos graves a corto plazo (7–30 días).',
  clinicalIndication:
    'Estratificación inicial de riesgo en adultos que consultan a urgencias tras un episodio de síncope.',
  validatedPopulation: 'Adultos ≥ 18 años atendidos en urgencias por síncope agudo.',
  requiredLabsNote: 'Requiere ECG de 12 derivaciones, signos vitales y hematocrito.',
  contraindications: [
    'No aplicar si la causa del episodio no fue síncope verdadero (convulsión, trauma craneal previo, intoxicación o hipoglucemia).',
  ],
  limitations: [
    'Aunque en la cohorte original alcanzó sensibilidad ~96 %, metaanálisis externos (Serrano et al., Ann Emerg Med 2010) mostraron sensibilidad combinada ~87 %, por lo que un resultado 0/5 NO sustituye el juicio clínico (p. ej. síncope durante el ejercicio, historia familiar de muerte súbita o soplo grave).',
  ],
  version: 'Quinn et al. (2004 / 2006)',
  references: [
    {
      citation:
        'Quinn JV, Stiell IG, McDermott DA, et al. Derivation of the San Francisco Syncope Rule to predict patients with short-term serious outcomes. Ann Emerg Med. 2004;43(2):224-232.',
      year: 2004,
    },
    {
      citation:
        'Quinn J, McDermott D, Stiell I, Kohn M, Wells G. Prospective validation of the San Francisco Syncope Rule to predict patients with serious outcomes. Ann Emerg Med. 2006;47(5):448-454.',
      year: 2006,
    },
  ],
  fields: [chfField, hctField, ecgField, sobField, sbpField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(sanFranciscoSyncopeCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const items = [
      Boolean(inputs.chf),
      Boolean(inputs.hctLt30),
      Boolean(inputs.abnormalEcg),
      Boolean(inputs.shortnessOfBreath),
      Boolean(inputs.sbpLt90),
    ];
    const count = items.filter(Boolean).length;
    const highRisk = count >= 1;

    const severity: SeverityLevel = count >= 2 ? 'critical' : highRisk ? 'high' : 'low';

    return {
      primaryResult: {
        label: 'Criterios CHESS positivos',
        value: count,
        formattedValue: `${count} / 5`,
        unit: highRisk ? '(Alto riesgo)' : '(Bajo riesgo)',
      },
      severity,
      riskClassification: highRisk
        ? `Alto riesgo de evento grave a corto plazo (${count} / 5 criterios)`
        : 'Bajo riesgo según regla de San Francisco (0 / 5 criterios)',
      clinicalInterpretation: highRisk
        ? 'Presenta al menos un factor CHESS; riesgo incrementado de evento cardiovascular, hemorrágico o neurológico grave en los próximos 7–30 días.'
        : 'No cumple criterios CHESS; menor probabilidad de evento adverso grave a corto plazo (integrar siempre con historia clínica y riesgo arrítmico).',
      guidance: highRisk
        ? [
            'Observación con monitorización electrocardiográfica, estudio etiológico dirigido (troponina/ecocardiograma/hemograma según hallazgos) y valoración de ingreso.',
          ]
        : [
            'Verificar ausencia de datos de alarma clínicos no incluidos en CHESS (síncope de esfuerzo, en decúbito, antecedente familiar de muerte súbita, valvulopatía grave) antes de decidir manejo ambulatorio.',
          ],
      guidanceDisclaimer: 'Regla de apoyo; nunca anula hallazgos clínicos o electrocardiográficos de alto riesgo.',
      formulaUsed: 'CHESS: ICC (+1) + Hto <30% (+1) + ECG anormal (+1) + Disnea (+1) + PAS <90 (+1); ≥1 = Alto riesgo',
      inputsSummary: `Criterios CHESS: ${count}/5 (ICC:${items[0] ? 'S' : 'N'}, Hto:${items[1] ? 'S' : 'N'}, ECG:${items[2] ? 'S' : 'N'}, Disnea:${items[3] ? 'S' : 'N'}, PAS<90:${items[4] ? 'S' : 'N'})`,
    };
  },
};
