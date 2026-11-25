import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const avsStatusField: SelectFieldDef = {
  id: 'avsStatus',
  label: '1. Criterio de elegibilidad clínica (Síndrome Vestibular Agudo — SVA)',
  helpText:
    'HINTS solo está validado en SVA continuo con nistagmo espontáneo (vértigo agudo persistente, náuseas/vómitos, inestabilidad). No aplicar en vértigo posicional episódico breve (VPPB).',
  type: 'select',
  defaultValue: 'eligible',
  options: [
    {
      value: 'eligible',
      label: 'Cumple SVA continuo + nistagmo espontáneo (sin otra focalidad evidente)',
    },
    {
      value: 'focal_cns',
      label: 'Presenta focalidad neurológica o ataxia troncal grave (no se sostiene ni sentado)',
    },
    {
      value: 'episodic_no_nystagmus',
      label: 'No cumple SVA (vértigo episódico posicional / sin nistagmo espontáneo)',
    },
  ],
};

const headImpulseField: SelectFieldDef = {
  id: 'headImpulse',
  label: '2. HI — Prueba de Impulso Cefálico Horizontal (Head Impulse Test)',
  helpText:
    'Giro cefálico rápido de ~15–20° hacia el centro con mirada fija: en el SVA, un reflejo normal (sin sacada) es un signo de alarma central.',
  type: 'select',
  defaultValue: 'abnormal_catchup',
  visibleWhen: (i) => i.avsStatus === 'eligible',
  options: [
    {
      value: 'abnormal_catchup',
      label: 'Anormal (con sacada correctora evidente al girar hacia un lado — sugiere periférico)',
      points: 0,
    },
    {
      value: 'normal_no_saccade',
      label: 'Normal / intacto (SIN sacada correctora — signo paradójico CENTRAL)',
      points: 1,
    },
    {
      value: 'equivocal',
      label: 'Dudoso o no interpretable (tratar como no tranquilizador)',
      points: 1,
    },
  ],
};

const nystagmusField: SelectFieldDef = {
  id: 'nystagmus',
  label: '3. N — Características del Nistagmo espontáneo / a la mirada',
  helpText:
    'Evaluar dirección de la fase rápida en mirada primaria y en mirada lateral derecha/izquierda.',
  type: 'select',
  defaultValue: 'unidirectional_horizontal',
  visibleWhen: (i) => i.avsStatus === 'eligible',
  options: [
    {
      value: 'unidirectional_horizontal',
      label: 'Horizontal-torsional unidireccional (bate siempre hacia el mismo lado)',
      points: 0,
    },
    {
      value: 'direction_changing_vertical_torsional',
      label: 'Cambia de dirección con la mirada, puramente vertical o puramente torsional (CENTRAL)',
      points: 1,
    },
  ],
};

const testOfSkewField: SelectFieldDef = {
  id: 'testOfSkew',
  label: '4. TS — Test of Skew (desalineación ocular vertical en oclusión alternante)',
  helpText:
    'Al alternar la oclusión de cada ojo con el paciente fijando un punto frontal, observar si hay reajuste vertical hacia arriba o abajo.',
  type: 'select',
  defaultValue: 'absent',
  visibleWhen: (i) => i.avsStatus === 'eligible',
  options: [
    {
      value: 'absent',
      label: 'Ausente (sin refijación vertical — compatible con periférico)',
      points: 0,
    },
    {
      value: 'present',
      label: 'Presente (desviación vertical oblicua / skew — signo CENTRAL)',
      points: 1,
    },
  ],
};

const acuteHearingLossField: SelectFieldDef = {
  id: 'acuteHearingLoss',
  label: '5. Plus — Hipoacusia neurosensorial aguda unilateral nueva (HINTS Plus)',
  helpText:
    'Evaluar mediante frote de dedos (finger rub), diapasón (Rinne/Weber) o audiometría si pérdida auditiva aguda acompañante.',
  type: 'select',
  defaultValue: 'absent',
  visibleWhen: (i) => i.avsStatus === 'eligible',
  options: [
    {
      value: 'absent',
      label: 'Ausente (audición simétrica o sin pérdida aguda nueva)',
      points: 0,
    },
    {
      value: 'present_acute',
      label: 'Presente (hipoacusia aguda nueva — alerta de isquemia AICA / laberíntica)',
      points: 1,
    },
  ],
};

export const hintsPlusVertigoCalculator: CalculatorDefinition = {
  id: 'hints-plus-vertigo',
  name: 'Protocolo HINTS / HINTS Plus (Vértigo Agudo: Central vs. Periférico)',
  shortName: 'HINTS / HINTS Plus',
  primarySpecialty: 'neurologia',
  secondarySpecialties: ['urgencias', 'medicina-interna'],
  subcategory: 'diagnostico',
  keywords: [
    'hints',
    'hints plus',
    'hint',
    'vertigo',
    'sindrome vestibular agudo',
    'nistagmo',
    'impulso cefalico',
    'skew',
    'kattah',
    'fosa posterior',
    'ictus',
    'neuritis vestibular',
  ],
  description:
    'Evaluación clínica a pie de cama (Head-Impulse, Nystagmus, Test of Skew + Audición aguda) para diferenciar causas periféricas benignas (neuritis vestibular) de ictus de fosa posterior en el Síndrome Vestibular Agudo.',
  clinicalIndication:
    'Pacientes adultos con Síndrome Vestibular Agudo continuo (vértigo de inicio súbito persistente con nistagmo espontáneo, náuseas e inestabilidad) sin déficit neurológico focal evidente.',
  validatedPopulation:
    'Adultos con Síndrome Vestibular Agudo continuo y nistagmo espontáneo evaluados por personal entrenado (Kattah 2009 / Newman-Toker 2013).',
  contraindications: [
    'NO aplicar en vértigo episódico breve desencadenado por cambios posturales (sospecha de VPPB) ni en pacientes sin nistagmo espontáneo (usar maniobras de Dix-Hallpike / Roll Test).',
    'Si existen las "D" de alarma de fosa posterior (disartria, diplopía, disfagia, dismetría, déficit motor/sensitivo, Horner) o incapacidad de mantenerse sentado sin apoyo, asumir patología central sin esperar a HINTS.',
  ],
  limitations: [
    'Su precisión diagnóstica (~96.8–99 % de sensibilidad en SVA) depende de la correcta técnica exploratoria del impulso cefálico y del cumplimiento estricto de los criterios de SVA.',
    'La TC craneal simple sin contraste tiene muy baja sensibilidad (~16–42 %) para infarto agudo de fosa posterior; si HINTS o HINTS Plus sugiere origen central, la prueba de elección es la RM cerebral con difusión (DWI).',
    'Controversia práctica (guía GRACE-3, SAEM 2023): en urgencias por médicos no entrenados en oculomotricidad, un impulso cefálico dudoso no debe usarse para descartar ictus de forma aislada.',
  ],
  version: 'Kattah et al. (2009) · HINTS Plus Newman-Toker (2013)',
  references: [
    {
      citation:
        'Kattah JC, Talkad AV, Wang DZ, Hsieh YH, Newman-Toker DE. HINTS to diagnose stroke in the acute vestibular syndrome: three-step bedside oculomotor examination more sensitive than early MRI diffusion-weighted imaging. Stroke. 2009;40(11):3504-3510.',
      year: 2009,
    },
    {
      citation:
        'Newman-Toker DE, Kerber KA, Hsieh YH, et al. HINTS outperforms ABCD2 to screen for stroke in acute continuous vertigo and dizziness. Acad Emerg Med. 2013;20(10):986-996.',
      year: 2013,
    },
    {
      citation:
        'Edlow JA, Carpenter C, Akhter M, et al. Guidelines for reasonable and appropriate care in the emergency department 3 (GRACE-3): Acute dizziness and vertigo in the emergency department. Acad Emerg Med. 2023;30(5):442-486.',
      year: 2023,
    },
  ],
  fields: [
    avsStatusField,
    headImpulseField,
    nystagmusField,
    testOfSkewField,
    acuteHearingLossField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(hintsPlusVertigoCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const avsStatus = inputs.avsStatus as string;

    if (avsStatus === 'focal_cns') {
      return {
        primaryResult: {
          label: 'Resultado HINTS / SVA',
          value: 1,
          formattedValue: 'CENTRAL',
          unit: '(Focalidad / Ataxia grave)',
        },
        severity: 'critical' as SeverityLevel,
        riskClassification: 'Alta sospecha de Ictus de Fosa Posterior — Activación urgente',
        clinicalInterpretation:
          'La presencia de focalidad neurológica aguda o ataxia troncal grado 3 (incapacidad de mantenerse sentado/de pie sin apoyo) clasifica el cuadro directamente como sospecha de lesión central sin depender de la tríada HINTS.',
        guidance: [
          'Activar protocolo urgente de Código Ictus / valoración neurológica inmediata.',
          'Realizar neuroimagen urgente; recordar que la TC simple no descarta infarto precoz de tronco o cerebelo (se requiere RM con secuencia DWI o angio-TC según ventana).',
        ],
        guidanceDisclaimer: 'Nunca demorar el manejo de ictus ante focalidad de fosa posterior.',
        formulaUsed: 'Criterio de exclusión de seguridad SVA (presencia de signos focales del SNC)',
        inputsSummary: 'SVA con focalidad neurológica o ataxia troncal grave presente',
      };
    }

    if (avsStatus === 'episodic_no_nystagmus') {
      return {
        primaryResult: {
          label: 'Aplicabilidad HINTS / HINTS Plus',
          value: 0,
          formattedValue: 'No aplicable',
          unit: '(Fuera de SVA)',
        },
        severity: 'info' as SeverityLevel,
        riskClassification: 'HINTS no válido — Vértigo episódico o ausencia de nistagmo espontáneo',
        clinicalInterpretation:
          'El protocolo HINTS no es aplicable fuera del Síndrome Vestibular Agudo continuo. En pacientes con vértigo episódico posicional (p. ej., VPPB) un impulso cefálico normal es lo esperado y NO indica ictus; inversamente, en mareo sin nistagmo tampoco descarta causas cardiovasculares o AIT.',
        guidance: [
          'Si los episodios duran < 1 minuto con cambios de posición: realizar maniobra de Dix-Hallpike (canal posterior) o Supine Roll Test (canal horizontal) para diagnosticar VPPB.',
          'Si hubo episodios espontáneos breves en paciente con factores de riesgo vascular: descartar AIT vertebrobasilar, arritmia o hipotensión ortostática.',
        ],
        guidanceDisclaimer: 'Aplicar reglas diagnósticas según cronología y desencadenantes (ATTEST / TiTrATE).',
        formulaUsed: 'Verificación previa de Síndrome Vestibular Agudo (SVA continuo + nistagmo)',
        inputsSummary: 'Sin SVA continuo / sin nistagmo espontáneo (HINTS no aplicable)',
      };
    }

    const hi = inputs.headImpulse as string;
    const nyst = inputs.nystagmus as string;
    const skew = inputs.testOfSkew as string;
    const hearing = inputs.acuteHearingLoss as string;

    const hiCentral = hi !== 'abnormal_catchup';
    const nystCentral = nyst !== 'unidirectional_horizontal';
    const skewCentral = skew === 'present';
    const hearingCentral = hearing === 'present_acute';

    const centralFindings: string[] = [];
    if (hi === 'normal_no_saccade') {
      centralFindings.push('HI normal sin sacada correctora (INFARCT)');
    } else if (hi === 'equivocal') {
      centralFindings.push('HI dudoso / no concluyente');
    }
    if (nystCentral) {
      centralFindings.push('Nistagmo bidireccional, vertical o torsional puro');
    }
    if (skewCentral) {
      centralFindings.push('Test of Skew positivo (desalineación vertical)');
    }
    if (hearingCentral) {
      centralFindings.push('Hipoacusia neurosensorial aguda unilateral (HINTS Plus → territorio AICA)');
    }

    const centralCount = centralFindings.length;
    const isCentral = centralCount >= 1;

    if (!isCentral) {
      return {
        primaryResult: {
          label: 'Interpretación HINTS / HINTS Plus',
          value: 0,
          formattedValue: 'Periférico',
          unit: '(0 / 4 hallazgos centrales)',
        },
        secondaryResults: [
          {
            label: 'Impulso Cefálico (HI)',
            formattedValue: 'Anormal (sacada presente)',
            unit: 'Periférico',
          },
          {
            label: 'Nistagmo (N)',
            formattedValue: 'Unidireccional horizontal',
            unit: 'Periférico',
          },
          {
            label: 'Test of Skew (TS) y Audición (Plus)',
            formattedValue: 'Ambos negativos',
            unit: 'Periférico',
          },
        ],
        severity: 'low',
        riskClassification: 'Patrón HINTS Plus Periférico (compatible con Neuritis Vestibular)',
        clinicalInterpretation:
          'Los 4 componentes cumplen el perfil periférico benigno (HI anormal con sacada correctora, nistagmo horizontal-torsional unidireccional, ausencia de skew y sin hipoacusia aguda). En un SVA correctamente explorado, confiere muy alta probabilidad de vestibulopatía periférica aguda.',
        guidance: [
          'Confirmar antes del alta que el paciente tolera vía oral y puede sentarse y deambular sin ataxia troncal grave.',
          'Si la exploración del impulso cefálico fue realizada sin experiencia previa en oculomotricidad o el paciente tiene alto riesgo vascular y evolución atípica, mantener observación o valoración neurológica.',
          'Considerar manejo sintomático breve (máximo 48–72 h para no retrasar compensación vestibular) y corticoterapia precoz si neuritis vestibular confirmada.',
        ],
        guidanceDisclaimer: 'Solo válido si el paciente cumple SVA continuo y la técnica del impulso cefálico fue rigurosa.',
        formulaUsed: 'Regla INFARCT (Kattah 2009) + HINTS Plus (Newman-Toker 2013): 0 de 4 signos centrales',
        inputsSummary: 'SVA · HI anormal · Nistagmo unidireccional · Skew (−) · Audición normal',
      };
    }

    return {
      primaryResult: {
        label: 'Interpretación HINTS / HINTS Plus',
        value: centralCount,
        formattedValue: 'CENTRAL (+)',
        unit: `(${centralCount} / 4 signos de alarma)`,
      },
      secondaryResults: [
        {
          label: 'Hallazgos centrales detectados',
          formattedValue: `${centralCount}`,
          unit: 'criterios INFARCT / Plus',
          note: centralFindings.join(' · '),
        },
        {
          label: 'Desglose (HI · N · TS · Plus)',
          formattedValue: `${hiCentral ? 'CENTRAL' : 'Perif.'} · ${nystCentral ? 'CENTRAL' : 'Perif.'} · ${skewCentral ? 'CENTRAL' : 'Perif.'} · ${hearingCentral ? 'CENTRAL' : 'Normal'}`,
          unit: '',
        },
      ],
      severity: 'critical',
      riskClassification: 'HINTS / HINTS Plus POSITIVO — Alta sospecha de Ictus de Fosa Posterior',
      clinicalInterpretation:
        centralCount === 1 && hearingCentral
          ? 'Aunque los 3 signos oculomotores clásicos parezcan periféricos, la hipoacusia aguda unilateral nueva convierte el examen en HINTS Plus positivo por riesgo de isquemia en el territorio de la arteria cerebelosa anteroinferior (AICA) / arteria laberíntica.'
          : 'Basta 1 solo criterio central (acrónimo INFARCT: Impulse Normal, Fast-phase Alternating, Refixation on Cover Test, más hipoacusia aguda) para sospechar ictus isquémico o hemorrágico de tronco encefálico o cerebelo.',
      guidance: [
        'Activar valoración urgente por Neurología / protocolo de ictus de fosa posterior (evaluar ventana de reperfusión y vigilancia de edema cerebeloso).',
        'La TC craneal simple tiene sensibilidad limitada para infarto precoz de fosa posterior; solicitar RM cerebral con difusión (DWI) y estudio neurovascular (angio-TC/angio-RM).',
        'Nota diagnóstica: si la RM-DWI se realiza muy precozmente (< 24–48 h) y resulta negativa pese a HINTS central persistente, considerar repetir RM a las 48–72 h.',
      ],
      guidanceDisclaimer: 'En el SVA, un solo hallazgo central en HINTS / HINTS Plus obliga a descartar ictus.',
      formulaUsed: 'Regla INFARCT (≥ 1 signo central entre HI, Nistagmo, Skew o Hipoacusia aguda = Central)',
      inputsSummary: `SVA · ${centralFindings.join(' + ')}`,
    };
  },
};
