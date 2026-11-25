import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SecondaryResultItem,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const centralFlagsField: BooleanFieldDef = {
  id: 'centralFlags',
  label:
    '¿Existen banderas rojas centrales? (nistagmo vertical puro sin latencia/inagotable, sin vértigo acompañante, vértigo continuo en reposo o focalidad neurológica)',
  helpText:
    'Si hay cualquier signo de alarma del SNC, NO diagnosticar VPPB benigno ni realizar maniobras hasta descartar lesión de fosa posterior.',
  type: 'boolean',
  trueLabel: 'Sí (Alerta central)',
  falseLabel: 'No (Típico posicional)',
  defaultValue: false,
};

const maneuverField: SelectFieldDef = {
  id: 'maneuver',
  label: 'Hallazgo en maniobras de provocación posicional',
  helpText:
    'Realizar primero Dix-Hallpike (canal posterior); si es negativo y persiste sospecha, realizar Supine Roll Test / Pagnini-McClure (canal horizontal).',
  type: 'select',
  defaultValue: 'dix_hallpike_right',
  visibleWhen: (i) => i.centralFlags !== true,
  options: [
    {
      value: 'dix_hallpike_right',
      label: 'Dix-Hallpike DERECHO (+): nistagmo hacia arriba + torsional derecho (< 60 s, con latencia)',
    },
    {
      value: 'dix_hallpike_left',
      label: 'Dix-Hallpike IZQUIERDO (+): nistagmo hacia arriba + torsional izquierdo (< 60 s, con latencia)',
    },
    {
      value: 'roll_geotropic',
      label: 'Supine Roll (+): nistagmo horizontal GEOTRÓPICO (bate hacia el suelo en ambos lados, < 60 s)',
    },
    {
      value: 'roll_apogeotropic',
      label: 'Supine Roll (+): nistagmo horizontal APOGEOTRÓPICO (bate hacia el techo, suele durar > 60 s)',
    },
    {
      value: 'anterior_canal',
      label: 'Dix-Hallpike (+): nistagmo hacia abajo (downbeating) con componente torsional leve',
    },
    {
      value: 'negative',
      label: 'Dix-Hallpike y Supine Roll negativos (sin nistagmo provocado)',
    },
  ],
};

const strongerSideField: SelectFieldDef = {
  id: 'strongerSide',
  label: 'En el Supine Roll Test, ¿en qué giro cefálico fue MÁS INTENSO el nistagmo/vértigo?',
  helpText:
    'En variante GEOTRÓPICA el oído afectado es el de MAYOR intensidad; en variante APOGEOTRÓPICA el oído afectado suele ser el de MENOR intensidad (confirmable con Bow and Lean Test).',
  type: 'select',
  defaultValue: 'right',
  visibleWhen: (i) =>
    i.centralFlags !== true &&
    (i.maneuver === 'roll_geotropic' || i.maneuver === 'roll_apogeotropic'),
  options: [
    { value: 'right', label: 'Más intenso al girar cabeza a la DERECHA' },
    { value: 'left', label: 'Más intenso al girar cabeza a la IZQUIERDA' },
    { value: 'unclear', label: 'Simétrico o dudoso (requiere Bow and Lean Test)' },
  ],
};

const cervicalPrecautionField: BooleanFieldDef = {
  id: 'cervicalPrecaution',
  label:
    '¿Contraindicación o precaución física para hiperextensión/rotación cervical? (estenosis cervical grave, trauma/cirugía cervical, desprendimiento de retina o estenosis carotídea grave)',
  type: 'boolean',
  trueLabel: 'Sí (Precaución)',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.centralFlags !== true && i.maneuver !== 'negative',
};

export const vppbManipulationCalculator: CalculatorDefinition = {
  id: 'vppb-dix-hallpike-epley',
  name: 'VPPB — Diagnóstico (Dix-Hallpike / Roll Test) y Maniobra de Reposición',
  shortName: 'VPPB (Dix-Hallpike / Epley)',
  primarySpecialty: 'neurologia',
  secondarySpecialties: ['medicina-interna', 'urgencias'],
  subcategory: 'diagnostico',
  keywords: [
    'vppb',
    'bppv',
    'vertigo posicional',
    'dix hallpike',
    'dix-hallpike',
    'epley',
    'semont',
    'roll test',
    'lempert',
    'barbecue',
    'gufoni',
    'otolitos',
    'canal posterior',
    'canal horizontal',
  ],
  description:
    'Identifica el canal semicircular y el oído afectados en el Vértigo Posicional Paroxístico Benigno según los criterios de la Bárány Society (2015) y guía AAO-HNS (2017), indicando la maniobra de reposición canalicular paso a paso.',
  clinicalIndication:
    'Episodios breves y recurrentes (< 1 minuto) de vértigo rotatorio desencadenados por cambios posturales (acostarse, girar en la cama, mirar hacia arriba) sin focalidad neurológica.',
  validatedPopulation: 'Adultos con sospecha de vértigo posicional episódico (Bárány Society 2015 / AAO-HNS 2017).',
  contraindications: [
    'No diagnosticar VPPB si el vértigo es continuo en reposo (usar HINTS / HINTS Plus), hay nistagmo sin vértigo, nistagmo vertical puro sin latencia o signos neurológicos focales.',
    'Evitar maniobras con hiperextensión/rotación cervical forzada en trauma cervical inestable, mielopatía cervical, disección arterial o cirugía ocular reciente.',
  ],
  limitations: [
    'Un Dix-Hallpike negativo no excluye completamente VPPB (sensibilidad ~79 % en una sola exploración); si la clínica es típica, evaluar canal horizontal (Roll Test) o repetir en control.',
    'El nistagmo posicional hacia abajo (downbeating) obliga a descartar patología cerebelosa o de unión craneocervical antes de asumir VPPB del canal anterior (~1–2 % de los casos).',
    'La guía AAO-HNS recomienda NO indicar restricciones posturales rígidas ni collarín tras una maniobra de Epley exitosa, ni usar depresores vestibulares (betahistina/dimenhidrinato) como tratamiento de fondo.',
  ],
  version: 'Bárány Society (2015) · AAO-HNS (2017)',
  references: [
    {
      citation:
        'Bhattacharyya N, Gubbels SP, Schwartz SR, et al. Clinical Practice Guideline: Benign Paroxysmal Positional Vertigo (Update). Otolaryngol Head Neck Surg. 2017;156(3_suppl):S1-S47.',
      year: 2017,
    },
    {
      citation:
        'von Brevern M, Bertholon P, Brandt T, et al. Benign paroxysmal positional vertigo: Diagnostic criteria. J Vestib Res. 2015;25(3-4):105-117.',
      year: 2015,
    },
  ],
  fields: [centralFlagsField, maneuverField, strongerSideField, cervicalPrecautionField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(vppbManipulationCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    if (inputs.centralFlags === true) {
      return {
        primaryResult: {
          label: 'Sospecha diagnóstica',
          value: 1,
          formattedValue: 'CENTRAL / Atípico',
          unit: '(Banderas rojas)',
        },
        severity: 'critical' as SeverityLevel,
        riskClassification: 'Nistagmo o cuadro posicional ATÍPICO — Descartar causa central',
        clinicalInterpretation:
          'Los hallazgos referidos (ausencia de latencia, falta de fatigabilidad, nistagmo vertical puro sin componente torsional, disociación nistagmo-vértigo o focalidad neurológica) no corresponden a VPPB típico y sugieren lesión de fosa posterior (cerebelo/tronco) o síndrome vestibular agudo.',
        guidance: [
          'Suspender maniobras de reposición canalicular.',
          'Evaluar con protocolo HINTS (si es SVA continuo con nistagmo espontáneo) y exploración neurológica completa.',
          'Solicitar valoración urgente por Neurología y neuroimagen (RM cerebral con difusión preferentemente frente a TC simple en fosa posterior).',
        ],
        guidanceDisclaimer: 'Un nistagmo posicional atípico puede simular VPPB en infartos o tumores cerebelosos.',
        formulaUsed: 'Filtro de exclusión clínica Bárány Society / AAO-HNS',
        inputsSummary: 'Banderas rojas centrales presentes',
      };
    }

    const maneuver = inputs.maneuver as string;
    const strongerSide = (inputs.strongerSide as string) || 'right';
    const cervicalWarn = inputs.cervicalPrecaution === true;

    const cervicalNote = cervicalWarn
      ? 'PRECAUCIÓN CERVICAL ACTIVA: no hiperextender ni rotar forzadamente el cuello; realizar en camilla basculante (Trendelenburg) girando el cuerpo en bloque o derivar a ORL/rehabilitación vestibular.'
      : null;

    if (maneuver === 'negative') {
      return {
        primaryResult: {
          label: 'Resultado de provocación posicional',
          value: 0,
          formattedValue: 'Sin VPPB objetivo',
          unit: '(Maniobras negativas)',
        },
        severity: 'info' as SeverityLevel,
        riskClassification: 'Pruebas posicionales negativas — VPPB no confirmado',
        clinicalInterpretation:
          'Ausencia de nistagmo y vértigo provocado tanto en Dix-Hallpike bilateral como en Supine Roll Test. Puede tratarse de VPPB en remisión, VPPB subjetivo o vértigo de otro origen.',
        guidance: [
          'Si los episodios son posicionales típicos (< 1 min al girar/acostarse): repetir Dix-Hallpike en otra consulta o tras un intervalo breve.',
          'Si el cuadro es episódico espontáneo o continuo: evaluar migraña vestibular, hipotensión ortostática, arritmia o síndrome vestibular agudo.',
          'Evitar prescribir sedantes vestibulares de forma prolongada (retrasan la compensación).',
        ],
        formulaUsed: 'Evaluación diagnóstica negativa (Dix-Hallpike + Supine Roll Test)',
        inputsSummary: 'Dix-Hallpike y Supine Roll Test negativos',
      };
    }

    if (maneuver === 'anterior_canal') {
      return {
        primaryResult: {
          label: 'Canal probablemente implicado',
          value: 2,
          formattedValue: 'Canal Anterior (?)',
          unit: '(Nistagmo downbeating)',
        },
        secondaryResults: [
          {
            label: 'Prioridad clínica',
            formattedValue: 'Descartar causa central',
            unit: '',
            note: 'El nistagmo posicional hacia abajo (downbeating) obliga primero a excluir patología de cerebelo / fosa posterior.',
          },
          ...(cervicalNote
            ? [{ label: 'Precaución cervical', formattedValue: 'Activa', unit: '', note: cervicalNote }]
            : []),
        ],
        severity: 'high' as SeverityLevel,
        riskClassification: 'Sospecha de VPPB Canal Anterior (poco frecuente) vs. Nistagmo Central',
        clinicalInterpretation:
          'El VPPB del canal anterior es raro (1–2 %). Dado que el nistagmo hacia abajo (downbeating) también ocurre en lesiones del flóculo/nódulo cerebeloso o malformación de Chiari, exige confirmar ausencia de signos centrales.',
        guidance: [
          ...(cervicalNote ? [cervicalNote] : []),
          'Descartar patología central (exploración cerebelosa/pares craneales y considerar RM cerebral si atipias, ausencia de componente torsional o falta de respuesta).',
          'Si se confirma origen periférico de canal anterior por especialista: suele tratarse con Maniobra de Yacovino (independiente del lado afectado).',
        ],
        formulaUsed: 'Criterios Bárány Society para variante infrecuente de canal anterior',
        inputsSummary: `Dix-Hallpike con nistagmo downbeating · Precaución cervical: ${cervicalWarn ? 'Sí' : 'No'}`,
      };
    }

    if (maneuver === 'dix_hallpike_right' || maneuver === 'dix_hallpike_left') {
      const isRight = maneuver === 'dix_hallpike_right';
      const sideLabel = isRight ? 'Derecho' : 'Izquierdo';
      const oppLabel = isRight ? 'izquierdo' : 'derecho';
      const sideDeg = isRight ? '45° a la derecha' : '45° a la izquierda';
      const oppDeg = isRight ? '45° a la izquierda' : '45° a la derecha';

      const secondaryResults: SecondaryResultItem[] = [
        {
          label: 'Diagnóstico canalicular',
          formattedValue: `Canal Posterior ${sideLabel}`,
          unit: '(~85–90 % de VPPB)',
        },
        {
          label: 'Maniobra de 1.ª línea',
          formattedValue: `Epley ${sideLabel}`,
          unit: 'Alternativa: Sémont',
        },
      ];
      if (cervicalNote) {
        secondaryResults.push({
          label: 'Precaución física',
          formattedValue: 'Adaptar técnica',
          unit: '',
          note: cervicalNote,
        });
      }

      return {
        primaryResult: {
          label: 'Diagnóstico y tratamiento indicado',
          value: 1,
          formattedValue: `Epley ${sideLabel}`,
          unit: `(Canal Posterior ${sideLabel})`,
        },
        secondaryResults,
        severity: 'low',
        riskClassification: `VPPB Canal Posterior ${sideLabel} — Canalolitiasis confirmada`,
        clinicalInterpretation:
          `Patrón clásico de canalolitiasis del canal semicircular posterior ${sideLabel.toLowerCase()} (nistagmo geotrópico vertical hacia arriba + torsional con latencia y duración < 60 s). Alta tasa de resolución (> 80 %) tras 1–2 maniobras de Epley.`,
        guidance: [
          ...(cervicalNote ? [cervicalNote] : []),
          `Paso 1 (Epley ${sideLabel}): Sentado con cabeza rotada ${sideDeg}, acostar rápido hacia atrás con cabeza extendida ~20–30° colgando del borde; mantener 30–60 s hasta que cese el vértigo/nistagmo.`,
          `Paso 2: Sin levantar la cabeza, rotar 90° hacia el lado ${oppLabel} (quedando ${oppDeg}); mantener 30–60 s.`,
          `Paso 3: Girar cuerpo y cabeza otros 90° en decúbito lateral ${oppLabel} (mirando ~45° hacia el suelo); mantener 30–60 s.`,
          `Paso 4: Sentar al paciente suavemente manteniendo el mentón ligeramente inclinado hacia abajo y permanecer sentado ~1–2 min.`,
          'No es necesario collarín ni dormir incorporado (AAO-HNS 2017); reevaluar Dix-Hallpike si persisten síntomas.',
        ],
        guidanceDisclaimer: 'Realizar únicamente si el paciente no presenta contraindicación cervical/vascular.',
        formulaUsed: 'Criterios Bárány Society (2015) + Maniobra de Epley (AAO-HNS 2017)',
        inputsSummary: `Dix-Hallpike ${sideLabel} (+) → Maniobra de Epley ${sideLabel}`,
      };
    }

    // Horizontal canal (geotropic or apogeotropic)
    const isGeotropic = maneuver === 'roll_geotropic';
    let affectedEar: 'Derecho' | 'Izquierdo' | 'Indeterminado' = 'Indeterminado';
    if (strongerSide === 'right') {
      affectedEar = isGeotropic ? 'Derecho' : 'Izquierdo';
    } else if (strongerSide === 'left') {
      affectedEar = isGeotropic ? 'Izquierdo' : 'Derecho';
    }

    const healthyEar =
      affectedEar === 'Derecho'
        ? 'Izquierdo'
        : affectedEar === 'Izquierdo'
          ? 'Derecho'
          : 'contralateral';

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Variante fisiopatológica',
        formattedValue: isGeotropic ? 'Geotrópico (Canalolitiasis)' : 'Apogeotrópico (Cupulolitiasis)',
        unit: 'Canal Horizontal',
      },
      {
        label: 'Oído probablemente afectado (2.ª Ley de Ewald)',
        formattedValue: affectedEar,
        unit:
          affectedEar === 'Indeterminado'
            ? 'Usar Bow and Lean Test'
            : isGeotropic
              ? '(lado de mayor intensidad)'
              : '(lado de menor intensidad)',
      },
    ];
    if (cervicalNote) {
      secondaryResults.push({
        label: 'Precaución física',
        formattedValue: 'Adaptar técnica',
        unit: '',
        note: cervicalNote,
      });
    }

    const guidance: string[] = [];
    if (cervicalNote) guidance.push(cervicalNote);

    if (affectedEar === 'Indeterminado') {
      guidance.push(
        'Antes de ejecutar reposición, realizar el Bow and Lean Test (paciente sentado: flexionar cabeza 90° adelante y luego extender 45° atrás) para identificar hacia qué lado bate el nistagmo y determinar el oído afectado.',
      );
      guidance.push(
        isGeotropic
          ? 'Una vez lateralizado el oído: aplicar Maniobra de Lempert (Barbecue 270–360°) girando en sentido contrario al oído afectado, o Maniobra de Gufoni acostando sobre el oído sano.'
          : 'Una vez lateralizado el oído: aplicar Maniobra de Gufoni modificada acostando sobre el oído afectado (nariz 45° arriba) para desprender partículas de la cúpula.',
      );
    } else if (isGeotropic) {
      guidance.push(
        `Opción A — Maniobra de Lempert (Barbecue) para oído ${affectedEar}: en decúbito supino, girar 90° hacia el lado sano (${healthyEar.toLowerCase()}) cada 30–60 s completando 270–360° hasta volver a posición inicial.`,
      );
      guidance.push(
        `Opción B — Maniobra de Gufoni (más rápida/simple en mayores): desde sentado, acostar rápidamente de lado sobre el oído SANO (${healthyEar}); esperar 1–2 min, girar la cabeza 45° hacia el suelo (2 min) y sentar.`,
      );
    } else {
      guidance.push(
        `Variante apogeotrópica (oído afectado probable: ${affectedEar}, donde el nistagmo fue más débil): aplicar Maniobra de Gufoni modificada: desde sentado, acostar rápidamente sobre el oído AFECTADO (${affectedEar}) 1–2 min y girar cabeza 45° hacia ARRIBA (hacia el techo) 2 min antes de sentar.`,
      );
      guidance.push(
        'Si tras la maniobra el nistagmo cambia a geotrópico, reevaluar el oído más intenso y completar con Lempert/Gufoni estándar; si no responde, considerar valoración ORL.',
      );
    }

    return {
      primaryResult: {
        label: 'Maniobra indicada (Canal Horizontal)',
        value: affectedEar === 'Indeterminado' ? 0 : 1,
        formattedValue:
          affectedEar === 'Indeterminado'
            ? 'Lateralizar (Bow & Lean)'
            : isGeotropic
              ? `Lempert / Gufoni (${affectedEar})`
              : `Gufoni mod. (${affectedEar})`,
        unit: isGeotropic ? 'Geotrópico' : 'Apogeotrópico',
      },
      secondaryResults,
      severity: affectedEar === 'Indeterminado' ? 'moderate' : 'low',
      riskClassification: `VPPB Canal Horizontal ${isGeotropic ? 'Geotrópico' : 'Apogeotrópico'} — Oído ${affectedEar}`,
      clinicalInterpretation: isGeotropic
        ? 'Nistagmo horizontal geotrópico en el Supine Roll Test: compatible con canalolitiasis del conducto semicircular horizontal (el oído con nistagmo más intenso corresponde al lado lesionado).'
        : 'Nistagmo horizontal apogeotrópico (bate hacia el oído superior): sugiere cupulolitiasis o restos en el brazo anterior del canal horizontal; por la 2.ª ley de Ewald, el oído afectado suele ser el del lado con MENOR intensidad de nistagmo.',
      guidance,
      guidanceDisclaimer: 'Confirmar lateralidad si hay dudas antes de realizar rotaciones de reposición.',
      formulaUsed: 'Criterios Bárány Society (2015) + 2.ª Ley de Ewald · AAO-HNS (2017)',
      inputsSummary: `Supine Roll ${isGeotropic ? 'Geotrópico' : 'Apogeotrópico'} · Mayor intensidad: ${strongerSide} → Oído afectado: ${affectedEar}`,
    };
  },
};
