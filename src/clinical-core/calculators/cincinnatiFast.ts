import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const facialDroopField: BooleanFieldDef = {
  id: 'facialDroop',
  label: 'F (Face) — Asimetría facial al pedirle sonreír o mostrar los dientes',
  helpText: 'Anormal si un lado de la cara cae o no se mueve igual que el otro.',
  type: 'boolean',
  trueLabel: 'Anormal (+1)',
  falseLabel: 'Normal (0)',
  pointsWhenTrue: 1,
  defaultValue: false,
};

const armDriftField: BooleanFieldDef = {
  id: 'armDrift',
  label: 'A (Arm) — Caída o deriva de un brazo (extender ambos brazos 10 s con ojos cerrados)',
  helpText: 'Anormal si un brazo no se mueve, cae o prona respecto al contralateral.',
  type: 'boolean',
  trueLabel: 'Anormal (+1)',
  falseLabel: 'Normal (0)',
  pointsWhenTrue: 1,
  defaultValue: false,
};

const speechField: BooleanFieldDef = {
  id: 'speechAbnormal',
  label: 'S (Speech) — Alteración del habla (disartria, afasia o incapacidad para repetir frase)',
  helpText: 'Ej. frase estándar: «El perro del vecino ladra en el patio».',
  type: 'boolean',
  trueLabel: 'Anormal (+1)',
  falseLabel: 'Normal (0)',
  pointsWhenTrue: 1,
  defaultValue: false,
};

const timeWindowField: SelectFieldDef = {
  id: 'timeWindow',
  label: 'T (Time) — Tiempo desde la última vez visto asintomático (Last Known Well)',
  type: 'select',
  defaultValue: 'lt_4_5h',
  options: [
    {
      value: 'lt_4_5h',
      label: '< 4.5 horas (Ventana potencial de trombólisis IV y trombectomía)',
    },
    {
      value: '4_5_to_24h',
      label: '4.5 – 24 horas (Ventana extendida / valoración trombectomía o neuroimagen)',
    },
    {
      value: 'gt_24h_or_unknown',
      label: '> 24 horas o inicio desconocido (despertar) — Evaluar protocolo de Código Ictus',
    },
  ],
};

export const cincinnatiFastCalculator: CalculatorDefinition = {
  id: 'cincinnati-fast',
  name: 'Escala de Cincinnati / FAST (Cribado Rápido de Ictus / ACV)',
  shortName: 'Cincinnati / FAST',
  primarySpecialty: 'neurologia',
  secondarySpecialties: ['urgencias', 'medicina-interna'],
  subcategory: 'diagnostico',
  keywords: [
    'cincinnati',
    'cincinatti',
    'cpss',
    'fast',
    'be-fast',
    'ictus',
    'acv',
    'evc',
    'stroke',
    'codigo ictus',
    'trombolisis',
  ],
  description:
    'Escala prehospitalaria y de triaje de 3 signos cardinales (Asimetría facial, Debilidad en brazo y Alteración del habla) más ventana temporal (FAST) para detección temprana de evento vascular cerebral.',
  clinicalIndication:
    'Tamizaje inmediato en atención prehospitalaria, triaje de urgencias o consulta externa ante sospecha de ictus / ataque cerebrovascular agudo.',
  validatedPopulation: 'Adultos con sospecha aguda de evento vascular cerebral (Kothari et al., 1999; AHA/ASA).',
  contraindications: [
    'No descarta ictus cuando el puntaje es 0 si existen síntomas de circulación posterior (vértigo agudo, ataxia/marcha — Balance, diplopía/hemianopsia — Eyes del acrónimo BE-FAST).',
    'Descartar siempre hipoglucemia capilar inmediata como imitador metabólico reversible ("stroke mimic").',
  ],
  limitations: [
    'Con ≥ 1 de los 3 criterios alterados, la probabilidad estimada de ictus es ~72 % (y > 85 % si los 3 son positivos); si el paciente es candidato a reperfusión, cuantificar gravedad con NIHSS tras neuroimagen urgente.',
  ],
  version: 'Kothari et al. (CPSS 1999) / AHA-ASA FAST',
  references: [
    {
      citation:
        'Kothari RU, Pancioli A, Liu T, Brott T, Broderick J. Cincinnati Prehospital Stroke Scale: reproducibility and validity. Ann Emerg Med. 1999;33(4):373-378.',
      year: 1999,
    },
    {
      citation:
        'Powers WJ, Rabinstein AA, Ackerson T, et al. Guidelines for the Early Management of Patients With Acute Ischemic Stroke: 2019 Update. Stroke. 2019;50(12):e344-e418.',
      year: 2019,
    },
  ],
  fields: [facialDroopField, armDriftField, speechField, timeWindowField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(cincinnatiFastCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const f = inputs.facialDroop === true ? 1 : 0;
    const a = inputs.armDrift === true ? 1 : 0;
    const s = inputs.speechAbnormal === true ? 1 : 0;
    const total = f + a + s;
    const timeWin = inputs.timeWindow as 'lt_4_5h' | '4_5_to_24h' | 'gt_24h_or_unknown';

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let interpretation = '';
    let probabilityText = 'Baja en territorio anterior (no excluye circulación posterior)';
    const guidance: string[] = [];

    if (total === 0) {
      severity = 'low';
      riskClassification = 'Cincinnati / FAST Negativo (0 / 3 criterios)';
      interpretation =
        'Sin asimetría facial, paresia braquial ni alteración del habla en el cribado CPSS.';
      guidance.push(
        'Si persiste sospecha clínica (ataxia/inestabilidad — Balance o déficit visual/diplopía — Eyes según BE-FAST), continuar evaluación neurológica y descartar ictus vertebrobasilar.',
      );
    } else if (total === 1) {
      severity = 'high';
      probabilityText = '~72 % de probabilidad de ictus (con ≥ 1 criterio)';
      riskClassification = 'POSITIVO — Código Ictus (1 / 3 criterios Cincinnati/FAST)';
      interpretation =
        'Presencia de 1 hallazgo focal agudo: alta sospecha de evento vascular cerebral que obliga a activar ruta de Código Ictus sin demora.';
    } else {
      severity = 'critical';
      probabilityText = total === 3 ? '> 85 % de probabilidad de ictus' : 'Muy alta (> 72–85 %)';
      riskClassification = `POSITIVO — Alta Sospecha de Ictus (${total} / 3 criterios)`;
      interpretation =
        'Múltiples signos neurológicos focales agudos: probabilidad muy elevada de ictus isquémico o hemorrágico (valorar oclusión de gran vaso).';
    }

    if (total >= 1) {
      guidance.push('1. Verificar glucemia capilar de inmediato (descartar hipoglucemia imitadora).');
      guidance.push('2. Documentar hora exacta de último momento visto normal (Last Known Well) y activar Código Ictus / traslado urgente.');
      if (timeWin === 'lt_4_5h') {
        guidance.push('3. Ventana < 4.5 h: prioridad absoluta para TC craneal simple inmediata (descartar hemorragia), escala NIHSS y eventual trombólisis IV / trombectomía.');
      } else if (timeWin === '4_5_to_24h') {
        guidance.push('3. Ventana 4.5–24 h: TC simple + angio-TC / perfusión urgente para valorar trombectomía mecánica o protocolo de ventana extendida.');
      } else {
        guidance.push('3. Inicio > 24 h o desconocido (ictus del despertar): neuroimagen urgente según protocolo institucional (mismatch DWI-FLAIR / perfusión) y cálculo de NIHSS.');
      }
    }

    return {
      primaryResult: {
        label: 'Puntuación Cincinnati (CPSS / FAST)',
        value: total,
        formattedValue: `${total} / 3`,
        unit: total >= 1 ? 'POSITIVO' : 'Negativo',
      },
      secondaryResults: [
        {
          label: 'Probabilidad estimada de Ictus',
          formattedValue: probabilityText,
          unit: '',
        },
        {
          label: 'Desglose F · A · S',
          formattedValue: `F:${f} · A:${a} · S:${s}`,
          unit: '',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation: interpretation,
      guidance,
      guidanceDisclaimer: 'Tiempo es cerebro: la escala CPSS/FAST es para activación rápida y no sustituye al NIHSS ni a la TC craneal.',
      formulaUsed: 'Suma de 3 hallazgos focales (Cara + Brazo + Habla; ≥ 1 positivo = activar Código Ictus)',
      inputsSummary: `Cincinnati/FAST: Cara=${f}, Brazo=${a}, Habla=${s} (${total}/3) · Ventana: ${timeWin}`,
    };
  },
};
