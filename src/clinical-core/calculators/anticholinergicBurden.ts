import {
  getCanonicalNumberValue,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SecondaryResultItem,
  SeverityLevel,
} from '../types/clinical.ts';

// Curated outpatient medications with exact published ACB Scale scores (Boustani 2008 / Campbell 2013)
const acb3Items: BooleanFieldDef[] = [
  { id: 'acb3_amitriptilina', label: 'Amitriptilina / Nortriptilina / Imipramina (antidepresivos tricíclicos)', type: 'boolean', defaultValue: false, trueLabel: '+3', falseLabel: 'No', pointsWhenTrue: 3 },
  { id: 'acb3_paroxetina', label: 'Paroxetina (ISRS con alta carga anticolinérgica)', type: 'boolean', defaultValue: false, trueLabel: '+3', falseLabel: 'No', pointsWhenTrue: 3 },
  { id: 'acb3_hidroxizina', label: 'Hidroxizina / Clorfenamina / Difenhidramina / Dimenhidrinato', type: 'boolean', defaultValue: false, trueLabel: '+3', falseLabel: 'No', pointsWhenTrue: 3 },
  { id: 'acb3_oxibutinina', label: 'Oxibutinina / Tolterodina / Solifenacina / Fesoterodina (vejiga hiperactiva)', type: 'boolean', defaultValue: false, trueLabel: '+3', falseLabel: 'No', pointsWhenTrue: 3 },
  { id: 'acb3_escopolamina', label: 'Escopolamina / Butilescopolamina / Atropina / Diciclomina (espasmolíticos)', type: 'boolean', defaultValue: false, trueLabel: '+3', falseLabel: 'No', pointsWhenTrue: 3 },
  { id: 'acb3_antipsicoticos', label: 'Clozapina / Olanzapina / Quetiapina / Clorpromazina / Tioridazina', type: 'boolean', defaultValue: false, trueLabel: '+3', falseLabel: 'No', pointsWhenTrue: 3 },
  { id: 'acb3_ciclobenzaprina', label: 'Ciclobenzaprina / Orfenadrina / Trihexifenidilo / Biperideno', type: 'boolean', defaultValue: false, trueLabel: '+3', falseLabel: 'No', pointsWhenTrue: 3 },
];

const acb2Items: BooleanFieldDef[] = [
  { id: 'acb2_carbamazepina', label: 'Carbamazepina / Oxcarbazepina', type: 'boolean', defaultValue: false, trueLabel: '+2', falseLabel: 'No', pointsWhenTrue: 2 },
  { id: 'acb2_amantadina', label: 'Amantadina / Levomepromazina / Pimozida', type: 'boolean', defaultValue: false, trueLabel: '+2', falseLabel: 'No', pointsWhenTrue: 2 },
  { id: 'acb2_meperidina', label: 'Meperidina (petidina) / Loxapina / Cimetidina', type: 'boolean', defaultValue: false, trueLabel: '+2', falseLabel: 'No', pointsWhenTrue: 2 },
];

const acb1Items: BooleanFieldDef[] = [
  { id: 'acb1_furosemida', label: 'Furosemida / Clortalidona / Triamtereno / Digoxina / Nifedipino', type: 'boolean', defaultValue: false, trueLabel: '+1', falseLabel: 'No', pointsWhenTrue: 1 },
  { id: 'acb1_metformina_warfarina', label: 'Warfarina / Captopril / Atenolol / Metoprolol / Hidralazina', type: 'boolean', defaultValue: false, trueLabel: '+1', falseLabel: 'No', pointsWhenTrue: 1 },
  { id: 'acb1_bzd', label: 'Alprazolam / Diazepam / Trazodona / Haloperidol / Risperidona / Aripiprazol', type: 'boolean', defaultValue: false, trueLabel: '+1', falseLabel: 'No', pointsWhenTrue: 1 },
  { id: 'acb1_opioides_esteroides', label: 'Codeína / Morfina / Fentanilo / Prednisona / Metilprednisolona / Loperamida', type: 'boolean', defaultValue: false, trueLabel: '+1', falseLabel: 'No', pointsWhenTrue: 1 },
  { id: 'acb1_antihist_2g', label: 'Cetirizina / Desloratadina / Loratadina / Ranitidina / Metoclopramida', type: 'boolean', defaultValue: false, trueLabel: '+1', falseLabel: 'No', pointsWhenTrue: 1 },
];

const extraAcb1Field: NumberFieldDef = {
  id: 'extraAcb1',
  label: 'Fármacos adicionales ACB = 1 (si toma más de uno dentro de un mismo grupo o de la lista ampliada)',
  type: 'number',
  canonicalUnit: 'fármacos',
  units: [{ id: 'drugs', label: 'fármacos', toCanonical: (v) => v, min: 0, max: 10, step: 1 }],
  defaultUnitId: 'drugs',
  defaultValue: '0',
  min: 0,
  max: 10,
  placeholder: '0',
};

const extraAcb2Field: NumberFieldDef = {
  id: 'extraAcb2',
  label: 'Fármacos adicionales ACB = 2',
  type: 'number',
  canonicalUnit: 'fármacos',
  units: [{ id: 'drugs', label: 'fármacos', toCanonical: (v) => v, min: 0, max: 6, step: 1 }],
  defaultUnitId: 'drugs',
  defaultValue: '0',
  min: 0,
  max: 6,
  placeholder: '0',
};

const extraAcb3Field: NumberFieldDef = {
  id: 'extraAcb3',
  label: 'Fármacos adicionales ACB = 3',
  type: 'number',
  canonicalUnit: 'fármacos',
  units: [{ id: 'drugs', label: 'fármacos', toCanonical: (v) => v, min: 0, max: 6, step: 1 }],
  defaultUnitId: 'drugs',
  defaultValue: '0',
  min: 0,
  max: 6,
  placeholder: '0',
};

export const anticholinergicBurdenCalculator: CalculatorDefinition = {
  id: 'anticholinergic-acb',
  name: 'Escala de Carga Anticolinérgica (ACB — Boustani)',
  shortName: 'Carga Anticolinérgica (ACB)',
  primarySpecialty: 'geriatria',
  secondarySpecialties: ['medicina-interna', 'psiquiatria'],
  subcategory: 'dosificacion',
  keywords: [
    'acb',
    'anticolinergica',
    'carga anticolinergica',
    'polifarmacia',
    'desprescripcion',
    'beers',
    'delirium',
    'caidas',
    'geriatria',
  ],
  description:
    'Suma la carga anticolinérgica acumulada de la medicación crónica según la escala ACB (1 = posible, 2 = moderada, 3 = definida grave).',
  clinicalIndication:
    'Revisión de polifarmacia en consulta externa geriátrica, prevención de caídas, delirium, estreñimiento, retención urinaria y deterioro cognitivo inducido por fármacos.',
  validatedPopulation: 'Adultos mayores (≥ 65 años) con polifarmacia o deterioro cognitivo/caídas.',
  contraindications: [
    'No suspender abruptamente antipsicóticos, antiepilépticos o antidepresivos sin plan progresivo de desprescripción y valoración psiquiátrica/neurológica.',
  ],
  limitations: [
    'La escala ACB original evalúa potencia anticolinérgica por fármaco sin ajustar por dosis ni vía tópica/inhalada (p. ej. gotas oftálmicas o inhaladores de tiotropio tienen menor absorción sistémica que vía oral).',
    'Existen otras escalas (ARS, DBI) con ligeras diferencias en la puntuación de fármacos específicos como quetiapina, trazodona o furosemida.',
  ],
  version: 'ACB Scale (Boustani et al., 2008 · Actualización Campbell, 2013)',
  references: [
    {
      citation:
        'Boustani M, Campbell N, Munger S, Maidment I, Fox C. Impact of anticholinergics on the aging brain: a review and practical application. Aging Health. 2008;4(3):311-320.',
      year: 2008,
    },
    {
      citation:
        'Campbell NL, Maidment I, Fox C, Khan B, Boustani M. The 2012 update to the Anticholinergic Cognitive Burden Scale. J Am Geriatr Soc. 2013;61(S1):S142-S143.',
      year: 2013,
    },
  ],
  fields: [
    ...acb3Items,
    ...acb2Items,
    ...acb1Items,
    extraAcb1Field,
    extraAcb2Field,
    extraAcb3Field,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(anticholinergicBurdenCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const extra1 = Math.round(getCanonicalNumberValue(extraAcb1Field, inputs.extraAcb1 as NumberInputValue).canonicalValue ?? 0);
    const extra2 = Math.round(getCanonicalNumberValue(extraAcb2Field, inputs.extraAcb2 as NumberInputValue).canonicalValue ?? 0);
    const extra3 = Math.round(getCanonicalNumberValue(extraAcb3Field, inputs.extraAcb3 as NumberInputValue).canonicalValue ?? 0);

    const score3 =
      acb3Items.reduce((sum, f) => sum + (inputs[f.id] === true ? 3 : 0), 0) + extra3 * 3;
    const score2 =
      acb2Items.reduce((sum, f) => sum + (inputs[f.id] === true ? 2 : 0), 0) + extra2 * 2;
    const score1 =
      acb1Items.reduce((sum, f) => sum + (inputs[f.id] === true ? 1 : 0), 0) + extra1 * 1;

    const total = score3 + score2 + score1;
    const hasHighPotency = score3 > 0;

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (total === 0) {
      severity = 'normal';
      riskClassification = 'Sin carga anticolinérgica detectada (ACB = 0)';
      clinicalInterpretation =
        'Ninguno de los grupos seleccionados aporta actividad anticolinérgica conocida.';
      guidance.push('Recordar incluir fármacos de venta libre (antihistamínicos de 1.ª generación, relajantes musculares o inductores del sueño).');
    } else if (total <= 2) {
      severity = 'moderate';
      riskClassification = `Carga anticolinérgica baja-moderada (ACB = ${total})`;
      clinicalInterpretation =
        'Riesgo anticolinérgico leve a moderado; evitar añadir nuevos fármacos con actividad anticolinérgica que eleven la suma a ≥ 3.';
      guidance.push(
        'Revisar necesidad clínica vigente de cada fármaco y valorar alternativas sin carga (p. ej. sertralina/citalopram en lugar de paroxetina o tricíclicos).',
      );
    } else {
      severity = total >= 5 || hasHighPotency ? 'critical' : 'high';
      riskClassification = `Carga anticolinérgica clínicamente significativa (ACB ≥ 3 · Total ${total})`;
      clinicalInterpretation =
        'Un puntaje ACB acumulado ≥ 3 se asocia a incremento significativo de deterioro cognitivo, delirium, caídas, sequedad bucal, estreñimiento, retención urinaria y mortalidad en adultos mayores.';
      guidance.push(
        'Priorizar desprescripción o sustitución terapéutica progresiva de fármacos ACB = 3 (criterios Beers / STOPP-START): p. ej., evitar difenhidramina/hidroxizina, oxibutinina o tricíclicos salvo indicación insustituible.',
        'Monitorizar síntomas anticolinérgicos periféricos y centrales, y evitar retirada brusca en psicofármacos o antiepilépticos.',
      );
    }

    const secondaryResults: SecondaryResultItem[] = [
      { label: 'Aporte ACB = 3 (grave)', formattedValue: `${score3}`, unit: 'pts' },
      { label: 'Aporte ACB = 2 (moderada)', formattedValue: `${score2}`, unit: 'pts' },
      { label: 'Aporte ACB = 1 (posible)', formattedValue: `${score1}`, unit: 'pts' },
    ];

    return {
      primaryResult: {
        label: 'Carga Anticolinérgica Total (ACB)',
        value: total,
        formattedValue: `${total}`,
        unit: 'puntos',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'ACB total = Σ (Fármacos ACB 3 × 3) + (ACB 2 × 2) + (ACB 1 × 1)',
      inputsSummary: `ACB ${total} pts (Nivel 3: ${score3} · Nivel 2: ${score2} · Nivel 1: ${score1})`,
    };
  },
};
