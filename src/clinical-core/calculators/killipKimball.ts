import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const killipClassField: SelectFieldDef = {
  id: 'killipClass',
  label: 'Hallazgos clínicos en la exploración cardiopulmonar (Infarto Agudo de Miocardio)',
  type: 'select',
  defaultValue: '1',
  options: [
    {
      value: '1',
      label: 'Clase I — Sin insuficiencia cardíaca',
      description: 'Ausencia de estertores/crepitantes pulmonares y ausencia de tercer ruido cardíaco (S3).',
      points: 1,
    },
    {
      value: '2',
      label: 'Clase II — Insuficiencia cardíaca leve a moderada',
      description: 'Estertores/crepitantes en < 50 % de los campos pulmonares (bases), presencia de tercer ruido (S3) y/o ingurgitación yugular.',
      points: 2,
    },
    {
      value: '3',
      label: 'Clase III — Edema agudo de pulmón',
      description: 'Estertores/crepitantes húmedos en > 50 % de ambos campos pulmonares.',
      points: 3,
    },
    {
      value: '4',
      label: 'Clase IV — Choque cardiogénico',
      description: 'Hipotensión arterial (PAS < 90 mmHg) acompañada de signos de hipoperfusión periférica (oliguria, cianosis, diaforesis fría, alteración mental).',
      points: 4,
    },
  ],
};

export const killipKimballCalculator: CalculatorDefinition = {
  id: 'killip-kimball',
  name: 'Clasificación de Killip-Kimball (Infarto Agudo de Miocardio)',
  shortName: 'Killip-Kimball',
  primarySpecialty: 'cardiologia',
  secondarySpecialties: ['urgencias', 'medicina-interna'],
  subcategory: 'gravedad',
  keywords: [
    'killip',
    'kimball',
    'killip-kimball',
    'iam',
    'infarto',
    'sca',
    'choque cardiogenico',
    'edema pulmonar',
    'grace',
  ],
  description:
    'Clasificación clínica a pie de cama (Clases I–IV) de la insuficiencia cardíaca aguda secundaria a infarto agudo de miocardio, con valor pronóstico intrahospitalario y a 30 días.',
  clinicalIndication:
    'Estratificación clínica inicial en todo paciente con síndrome coronario agudo (IAMCEST o IAMSEST) al ingreso en urgencias o unidad coronaria (también integra el GRACE Score).',
  validatedPopulation: 'Adultos con infarto agudo de miocardio.',
  contraindications: [
    'No utilizar como escala de insuficiencia cardíaca crónica ambulatoria (para IC crónica usar NYHA).',
  ],
  limitations: [
    'Las tasas clásicas de mortalidad de 1967 (~6 %, 17 %, 38 % y 81 %) fueron previas a la reperfusión coronaria moderna; con angioplastia primaria actual la mortalidad absoluta es menor, aunque la gradiente pronóstica entre clases I–IV sigue siendo altamente significativa.',
  ],
  version: 'Killip & Kimball (Am J Cardiol 1967) / Guías ESC SCA',
  references: [
    {
      citation:
        'Killip T 3rd, Kimball JT. Treatment of myocardial infarction in a coronary care unit. A two year experience with 250 patients. Am J Cardiol. 1967;20(4):457-464.',
      year: 1967,
    },
  ],
  fields: [killipClassField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(killipKimballCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const cls = Number(inputs.killipClass);
    const roman = cls === 1 ? 'I' : cls === 2 ? 'II' : cls === 3 ? 'III' : 'IV';

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let interpretation = '';
    let mortalityNote = '';
    let guidance: string[] = [];

    if (cls === 1) {
      severity = 'normal';
      riskClassification = 'Killip I — Sin insuficiencia cardíaca clínica';
      mortalityNote = 'Histórica ~6 % (contemporánea ~1.5–3 % con reperfusión)';
      interpretation = 'Sin congestión pulmonar ni hipoperfusión clínica al examen físico inicial.';
      guidance = [
        'Continuar manejo estándar de SCA/reperfusión y reevaluación clínica seriada por posible aparición tardía de disfunción ventricular.',
      ];
    } else if (cls === 2) {
      severity = 'moderate';
      riskClassification = 'Killip II — Insuficiencia cardíaca leve-moderada';
      mortalityNote = 'Histórica ~17 % (contemporánea ~6–10 %)';
      interpretation = 'Congestión pulmonar basal (< 50 % campos) o galope S3 que indica disfunción ventricular izquierda aguda.';
      guidance = [
        'Monitorización hemodinámica y respiratoria estrecha, diuréticos de asa si congestión y evitar betabloqueantes IV agudos hasta estabilización.',
      ];
    } else if (cls === 3) {
      severity = 'high';
      riskClassification = 'Killip III — Edema agudo de pulmón';
      mortalityNote = 'Histórica ~38 % (contemporánea ~15–25 %)';
      interpretation = 'Insuficiencia cardíaca aguda grave con congestión pulmonar extensa (> 50 % de ambos campos).';
      guidance = [
        'Oxigenoterapia / ventilación mecánica no invasiva (CPAP/BiPAP) si distrés, vasodilatadores IV (si PAS lo permite), diurético IV y revascularización coronaria urgente.',
      ];
    } else {
      severity = 'critical';
      riskClassification = 'Killip IV — Choque cardiogénico';
      mortalityNote = 'Histórica ~67–81 % (contemporánea ~40–50 %)';
      interpretation = 'Estado crítico de bajo gasto e hipoperfusión tisular secundaria a fallo de bomba o complicación mecánica del IAM.';
      guidance = [
        'Ingreso inmediato a UCI/Unidad Coronaria, ecocardiograma urgente (descartar complicación mecánica), vasopresor/inotrópico según guías y coronariografía emergente.',
      ];
    }

    return {
      primaryResult: {
        label: 'Clase Killip-Kimball',
        value: cls,
        formattedValue: `Clase ${roman}`,
        unit: '(I – IV)',
      },
      secondaryResults: [
        {
          label: 'Mortalidad intrahospitalaria de referencia',
          formattedValue: mortalityNote,
          unit: '',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation: interpretation,
      guidance,
      formulaUsed: 'Clasificación clínica basada en auscultación pulmonar, S3 y presión arterial/perfusión',
      inputsSummary: `Killip-Kimball Clase ${roman}`,
    };
  },
};
