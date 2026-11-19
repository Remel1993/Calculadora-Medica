import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const bristolTypeField: SelectFieldDef = {
  id: 'bristolType',
  label: 'Aspecto morfológico de las heces (Escala de Bristol)',
  type: 'select',
  defaultValue: '4',
  options: [
    { value: '1', label: 'Tipo 1 — Bolas duras separadas, difíciles de evacuar', points: 1 },
    { value: '2', label: 'Tipo 2 — Forma de salchicha compuesta por grumos duros', points: 2 },
    { value: '3', label: 'Tipo 3 — Forma de salchicha con grietas en la superficie', points: 3 },
    { value: '4', label: 'Tipo 4 — Forma de salchicha o serpiente, lisa y blanda', points: 4 },
    { value: '5', label: 'Tipo 5 — Trozos blandos de bordes definidos, paso fácil', points: 5 },
    { value: '6', label: 'Tipo 6 — Pedazos esponjosos de bordes irregulares (pastosa)', points: 6 },
    { value: '7', label: 'Tipo 7 — Acuosa, totalmente líquida sin trozos sólidos', points: 7 },
  ],
};

export const bristolScaleCalculator: CalculatorDefinition = {
  id: 'bristol-scale',
  name: 'Escala de Heces de Bristol (Consistencia y Tránsito Intestinal)',
  shortName: 'Escala de Bristol',
  primarySpecialty: 'gastroenterologia',
  secondarySpecialties: ['medicina-interna', 'pediatria'],
  subcategory: 'diagnostico',
  keywords: ['bristol', 'heces', 'evacuaciones', 'estrenimiento', 'diarrea', 'intestino irritable', 'roma iv'],
  description:
    'Clasificación visual descriptiva de 7 tipos para estandarizar la consistencia de las heces y estimar el tiempo de tránsito colónico.',
  clinicalIndication:
    'Evaluación estandarizada de estreñimiento, diarrea y subtipificación del síndrome de intestino irritable (criterios Roma IV) en adultos y pediatría.',
  validatedPopulation: 'Población general (adultos y niños con lenguaje o apoyo de cuidadores).',
  contraindications: [
    'No evalúa signos de alarma (rectorragia, melena, fiebre, pérdida de peso o deshidratación).',
  ],
  limitations: [
    'Depende del reporte visual del paciente o cuidador; para subtipificar SII según Roma IV requiere registro de los días con evacuaciones anormales.',
  ],
  version: 'Lewis & Heaton (1997) / Roma IV',
  references: [
    {
      citation:
        'Lewis SJ, Heaton KW. Stool form scale as a useful guide to intestinal transit time. Scand J Gastroenterol. 1997;32(9):920-924.',
      year: 1997,
    },
  ],
  fields: [bristolTypeField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(bristolScaleCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const typeNum = Number(inputs.bristolType);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (typeNum <= 2) {
      severity = 'moderate';
      riskClassification = `Tipo ${typeNum} — Estreñimiento / Tránsito lento`;
      clinicalInterpretation =
        typeNum === 1
          ? 'Tránsito intestinal muy lento; heces fragmentadas y duras compatibles con estreñimiento marcado.'
          : 'Heces grumosas y duras compatibles con estreñimiento y tránsito colónico lento.';
      guidance = [
        'Evaluar ingesta hídrica, fibra dietética, fármacos astringentes y signos de alarma antes de indicar laxantes osmóticos si persiste.',
      ];
    } else if (typeNum <= 4) {
      severity = 'normal';
      riskClassification = `Tipo ${typeNum} — Consistencia normal / ideal`;
      clinicalInterpretation =
        typeNum === 4
          ? 'Consistencia óptima de tránsito intestinal normal.'
          : 'Consistencia normal con discreta tendencia firme, fisiológica si se evacúa sin esfuerzo excesivo.';
      guidance = ['Mantener hábitos de hidratación, fibra alimentaria y actividad física habitual.'];
    } else if (typeNum === 5) {
      severity = 'low';
      riskClassification = 'Tipo 5 — Blanda / Tránsito ligeramente rápido';
      clinicalInterpretation =
        'Heces blandas en fragmentos definidos; puede ser variante fisiológica con dieta alta en fibra o tránsito discretamente acelerado.';
      guidance = ['Correlacionar con frecuencia diaria y síntomas asociados (urgencia o dolor abdominal).'];
    } else {
      severity = typeNum === 7 ? 'high' : 'moderate';
      riskClassification = `Tipo ${typeNum} — Diarrea / Tránsito acelerado`;
      clinicalInterpretation =
        typeNum === 7
          ? 'Evacuación completamente líquida; vigilar estado de hidratación, pérdidas electrolíticas y causa infecciosa o inflamatoria.'
          : 'Heces pastosas/semilíquidas compatibles con diarrea leve a moderada.';
      guidance = [
        'Evaluar hidratación oral, duración (> 48 h vs crónica), fiebre o productos patológicos (sangre/moco).',
      ];
    }

    return {
      primaryResult: {
        label: 'Clasificación de Bristol',
        value: typeNum,
        formattedValue: `Tipo ${typeNum}`,
        unit: 'de 7',
      },
      secondaryResults: [
        {
          label: 'Tendencia de tránsito',
          formattedValue: typeNum <= 2 ? 'Lento' : typeNum <= 4 ? 'Normal' : 'Acelerado',
          unit: '',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'Utilizar junto con frecuencia evacuatoria y evaluación clínica integral.',
      formulaUsed: 'Clasificación morfológica directa (Tipos 1 a 7 de Bristol)',
      inputsSummary: `Bristol Tipo ${typeNum}`,
    };
  },
};
