import {
  formatClinicalNumber,
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
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const nstField: BooleanFieldDef = {
  id: 'nstReactive',
  label: '1. Prueba sin estrés (NST / Monitoreo fetal): ≥ 2 aceleraciones ≥ 15 lpm × ≥ 15 s en 20 min (≥ 32 sem)',
  type: 'boolean',
  trueLabel: 'Reactivo (2)',
  falseLabel: 'No reactivo (0)',
  pointsWhenTrue: 2,
  defaultValue: true,
};

const breathingField: BooleanFieldDef = {
  id: 'fetalBreathing',
  label: '2. Movimientos respiratorios fetales: ≥ 1 episodio continuo ≥ 30 segundos en 30 min',
  type: 'boolean',
  trueLabel: 'Presente (2)',
  falseLabel: 'Ausente (0)',
  pointsWhenTrue: 2,
  defaultValue: true,
};

const movementField: BooleanFieldDef = {
  id: 'fetalMovements',
  label: '3. Movimientos corporales fetales: ≥ 3 movimientos discretos (cuerpo/extremidades) en 30 min',
  type: 'boolean',
  trueLabel: 'Presente (2)',
  falseLabel: 'Ausente (0)',
  pointsWhenTrue: 2,
  defaultValue: true,
};

const toneField: BooleanFieldDef = {
  id: 'fetalTone',
  label: '4. Tono fetal: ≥ 1 episodio de extensión activa con retorno a flexión (o apertura/cierre de mano)',
  type: 'boolean',
  trueLabel: 'Normal (2)',
  falseLabel: 'Ausente (0)',
  pointsWhenTrue: 2,
  defaultValue: true,
};

const afMethodField: SelectFieldDef = {
  id: 'amnioticMethod',
  label: 'Método ecográfico de medición del líquido amniótico',
  type: 'select',
  defaultValue: 'sdp',
  options: [
    {
      value: 'sdp',
      label: 'Bolsillo Vertical Máximo (BVM / SDP en cm)',
      description: 'Criterio original Manning y método preferido ACOG (normal 2.0–7.9 cm; oligohidramnios < 2.0 cm).',
    },
    {
      value: 'afi',
      label: 'Índice de Líquido Amniótico de Phelan (ILA 4 cuadrantes)',
      description: 'Suma de 4 cuadrantes (normal 5.0–24.0 cm; oligohidramnios < 5.0 cm; polihidramnios > 24.0 cm).',
    },
  ],
};

const sdpField: NumberFieldDef = {
  id: 'sdpCm',
  label: 'Bolsillo vertical máximo (BVM)',
  type: 'number',
  canonicalUnit: 'cm',
  units: [{ id: 'cm', label: 'cm', toCanonical: (v) => v, min: 0, max: 25, step: 0.1 }],
  defaultUnitId: 'cm',
  defaultValue: '4.5',
  min: 0,
  max: 25,
  placeholder: '4.5',
  visibleWhen: (inputs) => (inputs.amnioticMethod as string) === 'sdp',
  helpText: 'Normal: 2.0–7.9 cm (otorga 2 puntos en PBF). Oligohidramnios < 2.0 cm (0 puntos). Polihidramnios ≥ 8.0 cm.',
};

const afiField: NumberFieldDef = {
  id: 'afiCm',
  label: 'Índice de líquido amniótico (ILA)',
  type: 'number',
  canonicalUnit: 'cm',
  units: [{ id: 'cm', label: 'cm', toCanonical: (v) => v, min: 0, max: 55, step: 0.5 }],
  defaultUnitId: 'cm',
  defaultValue: '12.5',
  min: 0,
  max: 55,
  placeholder: '12.5',
  visibleWhen: (inputs) => (inputs.amnioticMethod as string) === 'afi',
  helpText: 'Normal: 5.0–24.0 cm (2 puntos PBF si además BVM ≥ 2 cm). Oligohidramnios < 5.0 cm (0 puntos). Polihidramnios > 24.0 cm.',
};

export const fetalBiophysicalProfileCalculator: CalculatorDefinition = {
  id: 'fetal-biophysical-profile',
  name: 'Perfil Biofísico Fetal (Manning) y Líquido Amniótico (BVM / ILA)',
  shortName: 'Perfil Biofísico Fetal',
  primarySpecialty: 'gineco-obstetricia',
  secondarySpecialties: ['urgencias'],
  subcategory: 'gravedad',
  keywords: [
    'perfil biofisico',
    'manning',
    'liquido amniotico',
    'ila',
    'phelan',
    'bolsillo maximo',
    'oligohidramnios',
    'polihidramnios',
    'nst',
    'bienestar fetal',
    'obstetricia',
  ],
  description:
    'Calcula la puntuación del Perfil Biofísico Fetal de Manning (0–10 puntos) integrando bienestar fetal agudo (NST, respiración, movimientos, tono) y marcador crónico (líquido amniótico por BVM o ILA).',
  clinicalIndication:
    'Vigilancia fetal anteparto en embarazos de alto riesgo (RCIU, hipertensión/preeclampsia, diabetes, embarazo prolongado o disminución de movimientos fetales).',
  validatedPopulation: 'Gestaciones únicas a partir de la viabilidad fetal (habitualmente ≥ 28–32 semanas; en < 32 semanas las aceleraciones de NST son ≥ 10 lpm × ≥ 10 s).',
  contraindications: [
    'No sustituye el registro cardiotocográfico continuo intraparto ni la evaluación Doppler en RCIU precoz.',
    'La administración reciente de corticosteroides prenatales puede suprimir transitoriamente los movimientos respiratorios fetales durante 48 h sin implicar hipoxia.',
  ],
  limitations: [
    'El oligohidramnios aislado (< 2.0 cm de BVM o ILA < 5 cm) constituye una señal de alerta mayor independientemente de que el puntaje total sea 8/10.',
    'La sedación materna o sulfato de magnesio pueden disminuir transitoriamente los movimientos y la reactividad del NST.',
  ],
  version: 'Manning (1980/1990) · ACOG PB 229',
  references: [
    {
      citation:
        'Manning FA, Platt LD, Sipos L. Antepartum fetal evaluation: development of a fetal biophysical profile. Am J Obstet Gynecol. 1980;136(6):787-795.',
      year: 1980,
    },
    {
      citation:
        'ACOG Practice Bulletin No. 229: Antepartum Fetal Surveillance. Obstet Gynecol. 2021;137(6):e116-e127.',
      year: 2021,
    },
  ],
  fields: [
    nstField,
    breathingField,
    movementField,
    toneField,
    afMethodField,
    sdpField,
    afiField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(fetalBiophysicalProfileCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const nstPts = inputs.nstReactive === true ? 2 : 0;
    const breathPts = inputs.fetalBreathing === true ? 2 : 0;
    const movePts = inputs.fetalMovements === true ? 2 : 0;
    const tonePts = inputs.fetalTone === true ? 2 : 0;

    const method = inputs.amnioticMethod as string;
    let afPts = 0;
    let afClass = '';
    let afMeasureText = '';
    let oligo = false;
    let poly = false;

    if (method === 'sdp') {
      const sdp = getCanonicalNumberValue(sdpField, inputs.sdpCm as NumberInputValue).canonicalValue!;
      afMeasureText = `BVM ${formatClinicalNumber(sdp, 1)} cm`;
      if (sdp < 2.0) {
        afPts = 0;
        oligo = true;
        afClass = 'Oligohidramnios (BVM < 2.0 cm)';
      } else if (sdp >= 8.0) {
        afPts = 2;
        poly = true;
        afClass =
          sdp >= 16
            ? 'Polihidramnios severo (BVM ≥ 16 cm)'
            : sdp >= 12
              ? 'Polihidramnios moderado (BVM 12–15.9 cm)'
              : 'Polihidramnios leve (BVM 8.0–11.9 cm)';
      } else {
        afPts = 2;
        afClass = 'Líquido amniótico normal (BVM 2.0–7.9 cm)';
      }
    } else {
      const afi = getCanonicalNumberValue(afiField, inputs.afiCm as NumberInputValue).canonicalValue!;
      afMeasureText = `ILA ${formatClinicalNumber(afi, 1)} cm`;
      if (afi < 5.0) {
        afPts = 0;
        oligo = true;
        afClass = 'Oligohidramnios (ILA < 5.0 cm)';
      } else if (afi > 24.0) {
        afPts = 2;
        poly = true;
        afClass =
          afi >= 35
            ? 'Polihidramnios severo (ILA ≥ 35 cm)'
            : afi >= 30
              ? 'Polihidramnios moderado (ILA 30–34.9 cm)'
              : 'Polihidramnios leve (ILA 24.1–29.9 cm)';
      } else {
        afPts = 2;
        afClass = 'Líquido amniótico normal (ILA 5.0–24.0 cm)';
      }
    }

    const total = nstPts + breathPts + movePts + tonePts + afPts;
    const modifiedBppNormal = nstPts === 2 && !oligo;

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (total <= 2) {
      severity = 'critical';
      riskClassification = `${total}/10 — Asfixia fetal muy probable`;
      clinicalInterpretation =
        'Puntuación gravemente alterada con alta probabilidad de hipoxemia/acidemia fetal aguda y crónica.';
      guidance.push(
        'Evaluación obstétrica inmediata y finalización expedita del embarazo si feto viable tras estabilización materna.',
      );
    } else if (total <= 4) {
      severity = 'critical';
      riskClassification = `${total}/10 — Sospecha de asfixia fetal`;
      clinicalInterpretation =
        'Puntuación anormal (≤ 4/10) indicativa de compromiso fetal probable.';
      guidance.push(
        'En gestaciones ≥ 32–34 semanas se suele indicar interrupción inmediata; en edades muy precoces, valorar monitoreo continuo y maduración/neuroprotección según criterio materno-fetal.',
      );
    } else if (total === 6) {
      severity = oligo ? 'high' : 'moderate';
      riskClassification = oligo
        ? '6/10 con Oligohidramnios — Prueba anormal (riesgo de asfixia fetal)'
        : '6/10 con Líquido Normal — Resultado equívoco';
      clinicalInterpretation = oligo
        ? 'Un PBF de 6/10 acompañado de oligohidramnios se interpreta como anormal y se asocia con compromiso fetal significativo.'
        : 'Resultado equívoco con volumen de líquido amniótico conservado; requiere repetición temprana para descartar estado de sueño fetal fisiológico.';
      guidance.push(
        oligo
          ? 'Valorar interrupción si embarazo a término o cercano al término (≥ 36–37 sem) o estudio Doppler completo y vigilancia hospitalaria según edad gestacional.'
          : 'Repetir el Perfil Biofísico en 24 horas (o antes si persiste sin reactividad NST).',
      );
    } else {
      // 8 or 10
      if (oligo) {
        severity = 'high';
        riskClassification = '8/10 con Oligohidramnios — Alerta por disfunción placentaria crónica';
        clinicalInterpretation =
          'Aunque los marcadores agudos están conservados, el oligohidramnios (0 puntos en líquido amniótico) sugiere insuficiencia útero-placentaria crónica o rotura de membranas no advertida.';
        guidance.push(
          'Descartar rotura prematura de membranas, malformación renal fetal o RCIU mediante Doppler.',
          'En gestación a término o ≥ 36–37 semanas, el oligohidramnios aislado suele indicar finalización del embarazo (ACOG PB 229).',
        );
      } else {
        severity = poly ? 'low' : 'normal';
        riskClassification = `${total}/10 — Bienestar fetal normal (${afClass})`;
        clinicalInterpretation =
          'Puntuación biofísica tranquilizadora con bajo riesgo de asfixia fetal en los próximos 7 días en ausencia de cambio clínico agudo.';
        guidance.push(
          poly
            ? 'Evaluar causas de polihidramnios (diabetes gestacional, anomalías estructurales fetales, infección congénita) y vigilar riesgo de parto pretérmino.'
            : 'Continuar vigilancia antenatal según protocolo de frecuencia de la patología de base.',
        );
      }
    }

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Estado del líquido amniótico',
        formattedValue: afMeasureText,
        unit: `(${afPts} pts)`,
        note: afClass,
      },
      {
        label: 'Perfil Biofísico Modificado (NST + Líquido)',
        formattedValue: modifiedBppNormal ? 'Normal' : 'Anormal',
        unit: '',
        note: `NST ${nstPts === 2 ? 'Reactivo' : 'No reactivo'} + ${afMeasureText}.`,
      },
      {
        label: 'Desglose Manning (NST / Resp / Mov / Tono / LA)',
        formattedValue: `${nstPts} / ${breathPts} / ${movePts} / ${tonePts} / ${afPts}`,
        unit: 'pts',
      },
    ];

    return {
      primaryResult: {
        label: 'Perfil Biofísico Fetal (Manning)',
        value: total,
        formattedValue: `${total} / 10`,
        unit: oligo ? 'con oligohidramnios' : 'puntos',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer:
        'Un PBF normal refleja bajo riesgo agudo pero no excluye eventos súbitos (desprendimiento placentario, accidente de cordón).',
      formulaUsed: 'Suma de 5 parámetros dicotómicos de Manning (0 o 2 pts cada uno) + evaluación de LA',
      inputsSummary: `Total ${total}/10 (NST ${nstPts}, Resp ${breathPts}, Mov ${movePts}, Tono ${tonePts}, LA ${afPts}) · ${afMeasureText}`,
    };
  },
};
