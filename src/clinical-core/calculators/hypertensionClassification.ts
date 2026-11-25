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
  SeverityLevel,
} from '../types/clinical.ts';
import { BP_UNITS_MMHG } from '../units/converters.ts';

const sbpField: NumberFieldDef = {
  id: 'sbp',
  label: 'Presión Arterial Sistólica (PAS)',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  min: 50,
  max: 300,
  placeholder: '136',
};

const dbpField: NumberFieldDef = {
  id: 'dbp',
  label: 'Presión Arterial Diastólica (PAD)',
  type: 'number',
  canonicalUnit: 'mmHg',
  units: BP_UNITS_MMHG,
  defaultUnitId: 'mmhg',
  min: 30,
  max: 180,
  placeholder: '86',
};

const targetOrganField: BooleanFieldDef = {
  id: 'targetOrganSymptoms',
  label: 'Signos/síntomas agudos de daño a órgano diana (dolor torácico, disnea/EAP, déficit neurológico, papiledema o oliguria aguda)',
  type: 'boolean',
  trueLabel: 'Presentes',
  falseLabel: 'Ausentes',
  defaultValue: false,
};

export const hypertensionClassificationCalculator: CalculatorDefinition = {
  id: 'hypertension-classification',
  name: 'Hipertensión Arterial — Clasificación Comparativa (ESH/ESC vs. ACC/AHA)',
  shortName: 'HTA (ESH/ESC vs ACC/AHA)',
  primarySpecialty: 'cardiologia',
  secondarySpecialties: ['medicina-interna', 'urgencias'],
  subcategory: 'diagnostico',
  keywords: ['hipertension', 'hta', 'esc', 'esh', 'acc', 'aha', 'presion arterial', 'crisis hipertensiva', 'presion pulso'],
  description:
    'Compara simultáneamente las categorías diagnósticas de las guías europeas (ESH 2023 y ESC 2024) y estadounidenses (ACC/AHA 2017), además de calcular presión de pulso, PAM y alerta de crisis hipertensiva.',
  clinicalIndication:
    'Clasificación de cifras de presión arterial en consulta externa o urgencias y reconocimiento de divergencias entre guías internacionales.',
  validatedPopulation: 'Adultos ≥ 18 años en mediciones de consulta (idealmente promedio de ≥ 2 lecturas en reposo en ≥ 2 visitas para diagnóstico crónico).',
  contraindications: [
    'Una sola lectura aislada en consulta NO confirma hipertensión crónica (salvo emergencia hipertensiva o cifras ≥ 180/110–120 confirmadas); usar MAPA o AMPA.',
    'No aplica para clasificación pediátrica ni criterios específicos de preeclampsia.',
  ],
  limitations: [
    'Controversia principal entre guías: ACC/AHA (2017) define HTA desde ≥ 130/80 mmHg (Estadio 1), mientras que ESH (2023) y ESC (2024) mantienen el diagnóstico de HTA en ≥ 140/90 mmHg (ESC 2024 introduce la categoría intermedia "PA elevada" de 120–139 / 70–89 mmHg).',
  ],
  version: 'ESH 2023 / ESC 2024 vs ACC/AHA 2017',
  references: [
    {
      citation:
        'Whelton PK, Carey RM, Aronow WS, et al. 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults. Hypertension. 2018;71(6):e13-e115.',
      year: 2018,
    },
    {
      citation:
        'McEvoy JW, McCarthy CP, Bruno RM, et al. 2024 ESC Guidelines for the management of elevated blood pressure and hypertension. Eur Heart J. 2024;45(38):3912-4018.',
      year: 2024,
    },
  ],
  fields: [sbpField, dbpField, targetOrganField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(hypertensionClassificationCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const sbp = getCanonicalNumberValue(sbpField, inputs.sbp as NumberInputValue).canonicalValue!;
    const dbp = getCanonicalNumberValue(dbpField, inputs.dbp as NumberInputValue).canonicalValue!;
    if (dbp >= sbp) {
      throw new Error('La PAS debe ser mayor que la PAD.');
    }
    const tod = Boolean(inputs.targetOrganSymptoms);

    const pp = roundClinical(sbp - dbp, 0);
    const map = roundClinical((sbp + 2 * dbp) / 3, 0);

    // ACC/AHA 2017
    let accCategory = 'Normal';
    if (sbp > 180 || dbp > 120) accCategory = 'Crisis hipertensiva (> 180 / > 120)';
    else if (sbp >= 140 || dbp >= 90) accCategory = 'HTA Estadio 2 (≥ 140 ó ≥ 90)';
    else if (sbp >= 130 || dbp >= 80) accCategory = 'HTA Estadio 1 (130–139 ó 80–89)';
    else if (sbp >= 120 && dbp < 80) accCategory = 'PA Elevada (120–129 y < 80)';

    // ESH 2023
    let eshCategory = 'Óptima';
    if (sbp >= 180 || dbp >= 110) eshCategory = 'HTA Grado 3 (≥ 180 ó ≥ 110)';
    else if (sbp >= 160 || dbp >= 100) eshCategory = 'HTA Grado 2 (160–179 ó 100–109)';
    else if (sbp >= 140 || dbp >= 90) eshCategory = 'HTA Grado 1 (140–159 ó 90–99)';
    else if (sbp >= 130 || dbp >= 85) eshCategory = 'Normal-alta (130–139 y/o 85–89)';
    else if (sbp >= 120 || dbp >= 80) eshCategory = 'Normal (120–129 y/o 80–84)';

    // ESC 2024
    let esc2024 = 'No elevada (< 120 / < 70)';
    if (sbp >= 140 || dbp >= 90) esc2024 = 'Hipertensión (≥ 140 ó ≥ 90)';
    else if (sbp >= 120 || dbp >= 70) esc2024 = 'PA Elevada (120–139 ó 70–89)';

    const severeRange = sbp >= 180 || dbp >= 110;
    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (tod && (sbp >= 160 || dbp >= 100)) {
      severity = 'critical';
      riskClassification = `EMERGENCIA HIPERTENSIVA SOSPECHADA (${sbp}/${dbp} mmHg + Daño agudo a órgano diana)`;
      clinicalInterpretation =
        'Elevación marcada de presión arterial con clínica de daño orgánico agudo; requiere monitorización intensiva y descenso titulado intravenoso (habitualmente no > 25 % en la 1.ª hora, salvo disección aórtica/EAP/ictus).';
      guidance = ['Atención en área de reanimación/urgencias: ECG, troponinas, función renal, fondo de ojo y neuroimagen según clínica; evitar descenso brusco con nifedipino sublingual.'];
    } else if (tod) {
      severity = sbp >= 140 || dbp >= 90 ? 'critical' : 'high';
      riskClassification = `DAÑO AGUDO A ÓRGANO DIANA REPORTADO (${sbp}/${dbp} mmHg) — Urgencia prioritaria`;
      clinicalInterpretation =
        'Aunque las cifras tensionales no alcanzan ≥ 160/100 mmHg, la presencia de signos o síntomas agudos de daño orgánico (dolor torácico, disnea/EAP, déficit neurológico, papiledema u oliguria) obliga a descartar de inmediato emergencia vascular, síndrome coronario agudo, ictus, disección o preeclampsia atípica.';
      guidance = [
        'Evaluación urgente en área de urgencias/reanimación (ECG, troponinas, neuroimagen, función renal y biomarcadores según órgano afectado); priorizar el protocolo de la patología aguda sobre la cifra tensional aislada.',
      ];
    } else if (sbp >= 180 || dbp >= 120) {
      severity = 'high';
      riskClassification = `Elevación grave sin daño orgánico referido (${sbp}/${dbp} mmHg)`;
      clinicalInterpretation =
        'Si se confirma tras reposo en ambiente tranquilo y sin lesión aguda de órgano diana ("urgencia hipertensiva" / HTA grave asintomática), el descenso debe ser gradual con medicación oral en 24–48 h.';
      guidance = ['Repetir medición tras 15–30 min de reposo, descartar daño agudo a órgano diana y evitar reducción agresiva aguda en consulta.'];
    } else if (sbp >= 140 || dbp >= 90) {
      severity = severeRange ? 'high' : 'moderate';
      riskClassification = `Hipertensión concordante en ambas guías (${sbp}/${dbp} mmHg)`;
      clinicalInterpretation = `Tanto ESC/ESH (${eshCategory}) como ACC/AHA (${accCategory}) clasifican estas cifras en rango hipertensivo.`;
      guidance = ['Confirmar con AMPA o MAPA de 24 h (salvo cifras muy altas confirmadas), evaluar daño orgánico subclínico y riesgo CV global.'];
    } else if (sbp >= 130 || dbp >= 80) {
      severity = 'low';
      riskClassification = `Zona de divergencia entre guías (${sbp}/${dbp} mmHg)`;
      clinicalInterpretation = `ACC/AHA clasifica como ${accCategory}, mientras ESH/ESC considera ${eshCategory} / ${esc2024}.`;
      guidance = ['Reforzar medidas higiénico-dietéticas (reducción de sodio, dieta DASH, ejercicio, control ponderal) y estratificar riesgo CV a 10 años para decidir fármacos según guía adoptada.'];
    } else if (sbp < 90 || dbp < 60) {
      severity = 'moderate';
      riskClassification = `Cifras bajas / posible hipotensión (${sbp}/${dbp} mmHg)`;
      clinicalInterpretation = 'Valorar síntomas de hipoperfusión, ortostatismo o sobretratamiento antihipertensivo.';
      guidance = ['Correlacionar con PAM, estado de volemia y síntomas.'];
    } else {
      severity = 'normal';
      riskClassification = `Presión arterial en rango óptimo / normal (${sbp}/${dbp} mmHg)`;
      clinicalInterpretation = `ESH: ${eshCategory} · ACC/AHA: ${accCategory}.`;
      guidance = ['Mantener estilo de vida saludable y tamizaje periódico.'];
    }

    if (pp > 60) {
      guidance.push(`Presión de pulso amplia (${pp} mmHg > 60): marcador de rigidez arterial en mayores de 60 años.`);
    }

    return {
      primaryResult: {
        label: 'PA Sistólica / Diastólica',
        value: sbp,
        formattedValue: `${sbp} / ${dbp}`,
        unit: 'mmHg',
      },
      secondaryResults: [
        { label: 'Clasificación ESH (2023)', formattedValue: eshCategory, unit: '' },
        { label: 'Clasificación ESC (2024)', formattedValue: esc2024, unit: '' },
        { label: 'Clasificación ACC/AHA (2017)', formattedValue: accCategory, unit: '' },
        { label: 'Presión de pulso / PAM', formattedValue: `${pp} mmHg / ${map} mmHg`, unit: '' },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'El diagnóstico definitivo de HTA crónica requiere mediciones estandarizadas repetidas o MAPA/AMPA.',
      formulaUsed: 'PP = PAS − PAD · PAM = (PAS + 2×PAD)/3 · Comparativa ESH/ESC vs ACC/AHA',
      inputsSummary: `PA: ${sbp}/${dbp} mmHg · PAM: ${map} · PP: ${pp} · Daño órgano diana: ${tod ? 'Sí' : 'No'}`,
    };
  },
};
