import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const ageGroupField: SelectFieldDef = {
  id: 'ageGroup',
  label: 'Grupo de edad de la paciente',
  type: 'select',
  defaultValue: '30_65',
  options: [
    { value: 'lt25', label: '< 25 años (21–24 años)' },
    { value: '25_29', label: '25 a 29 años' },
    { value: '30_65', label: '30 a 65 años' },
    { value: 'gt65', label: '> 65 años' },
  ],
};

const cytologyField: SelectFieldDef = {
  id: 'cytology',
  label: 'Resultado citológico (Sistema Bethesda 2014)',
  type: 'select',
  defaultValue: 'ascus',
  options: [
    { value: 'nilm', label: 'NILM — Negativo para lesión intraepitelial o malignidad' },
    { value: 'ascus', label: 'ASC-US — Células escamosas atípicas de significado indeterminado' },
    { value: 'lsil', label: 'LSIL — Lesión intraepitelial escamosa de bajo grado (NIC 1 / VPH)' },
    { value: 'asch', label: 'ASC-H — Células escamosas atípicas, no se puede descartar HSIL' },
    { value: 'hsil', label: 'HSIL — Lesión intraepitelial escamosa de alto grado (NIC 2 / NIC 3)' },
    { value: 'agc', label: 'AGC / AIS — Células glandulares atípicas o adenocarcinoma in situ' },
    { value: 'carcinoma', label: 'Sospecha de carcinoma invasor (escamoso o adenocarcinoma)' },
  ],
};

const hpvStatusField: SelectFieldDef = {
  id: 'hpvStatus',
  label: 'Estado de VPH de Alto Riesgo (VPH-AR)',
  type: 'select',
  defaultValue: 'unknown',
  options: [
    { value: 'unknown', label: 'No realizado / Desconocido' },
    { value: 'negative', label: 'VPH-AR Negativo' },
    { value: 'hpv16_18', label: 'VPH 16 y/o VPH 18 Positivo' },
    { value: 'other_hr', label: 'Otros VPH-AR Positivos (no 16/18)' },
  ],
};

const isPregnantField: BooleanFieldDef = {
  id: 'isPregnant',
  label: '¿Paciente actualmente embarazada?',
  type: 'boolean',
  defaultValue: false,
  helpText: 'Modifica el momento de la colposcopia y contraindica el legrado endocervical (LEC) y tratamientos escisionales rutinarios.',
};

const immunosuppressionField: BooleanFieldDef = {
  id: 'immunosuppressed',
  label: '¿Inmunosupresión (VIH, trasplante, tratamiento inmunosupresor)?',
  type: 'boolean',
  defaultValue: false,
  helpText: 'Las pacientes con VIH o inmunosupresión requieren umbrales de colposcopia más bajos y tamizaje más frecuente.',
};

const CYTOLOGY_LABELS: Record<string, string> = {
  nilm: 'NILM',
  ascus: 'ASC-US',
  lsil: 'LSIL',
  asch: 'ASC-H',
  hsil: 'HSIL',
  agc: 'AGC / AIS',
  carcinoma: 'Carcinoma sospechado',
};

export const cervicalPapBethesdaCalculator: CalculatorDefinition = {
  id: 'cervical-pap-asccp',
  name: 'PAP Alterado y VPH (Sistema Bethesda / ASCCP 2019 / OMS)',
  shortName: 'PAP Alterado y VPH (ASCCP)',
  primarySpecialty: 'oncologia',
  secondarySpecialties: ['gineco-obstetricia', 'infectologia', 'medicina-interna'],
  subcategory: 'diagnostico',
  keywords: [
    'pap',
    'papanicolaou',
    'citologia cervical',
    'bethesda',
    'ascus',
    'asc-us',
    'lsil',
    'hsil',
    'asc-h',
    'agc',
    'vph',
    'colposcopia',
    'asccp',
    'ginecooncologia',
    'cuello uterino',
  ],
  description:
    'Orientación clínica para Papanicolaou alterado según Sistema Bethesda, prueba de VPH-AR, grupo etario, embarazo e inmunosupresión basada en consenso ASCCP 2019 y guías OMS.',
  clinicalIndication:
    'Toma de decisiones en consulta externa ante resultados citológicos cervicales alterados o pruebas de VPH positivas.',
  validatedPopulation: 'Mujeres ≥ 21 años en tamizaje o seguimiento cervical (diferenciando < 25 años, embarazo e inmunosupresión).',
  contraindications: [
    'Ante lesión cervical macroscópica visible, sangrado postcoital persistente o masa exofítica, realizar biopsia directa y referencia oncológica SIN esperar al resultado del PAP (el PAP tiene falsos negativos en cáncer invasor necrótico/hemorrágico).',
    'El legrado endocervical (LEC) está CONTRAINDICADO durante el embarazo.',
  ],
  limitations: [
    'Las guías ASCCP 2019 utilizan riesgo acumulado de NIC 3+ considerando antecedentes previos (ej. VPH positivo previo o NIC 2/3 tratado); ante antecedentes de alto riesgo se debe intensificar vigilancia o colposcopia.',
    'La edad < 21 años no está incluida en tamizaje rutinario salvo situaciones especiales (ej. VIH).',
  ],
  version: 'Bethesda 2014 · ASCCP Risk-Based Consensus 2019 · OMS Screening 2021',
  references: [
    {
      citation:
        'Perkins RB, Guido RS, Castle PE, et al. 2019 ASCCP Risk-Based Management Consensus Guidelines for Abnormal Cervical Cancer Screening Tests and Cancer Precursors. J Low Genit Tract Dis. 2020;24(2):102-131.',
      year: 2020,
    },
    {
      citation:
        'World Health Organization. WHO guideline for screening and treatment of cervical pre-cancer lesions for cervical cancer prevention, 2nd ed. Geneva: WHO; 2021.',
      year: 2021,
    },
  ],
  fields: [
    ageGroupField,
    cytologyField,
    hpvStatusField,
    isPregnantField,
    immunosuppressionField,
  ],
  calculate(inputs: CalculatorInputsState) {
    const errors = validateCalculatorInputs(cervicalPapBethesdaCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors.map((e) => e.message).join(' '));
    }

    const ageGroup = String(inputs.ageGroup ?? '30_65');
    const cytology = String(inputs.cytology ?? 'ascus');
    const hpvStatus = String(inputs.hpvStatus ?? 'unknown');
    const isPregnant = Boolean(inputs.isPregnant);
    const immunosuppressed = Boolean(inputs.immunosuppressed);

    const hpvPositive = hpvStatus === 'hpv16_18' || hpvStatus === 'other_hr';

    let primaryCode = 'Seguimiento / Triaje';
    let riskScore = 1;
    let severity: SeverityLevel = 'low';
    let interpretation = '';
    const guidance: string[] = [];

    if (cytology === 'carcinoma') {
      primaryCode = 'Oncología Urgente';
      riskScore = 5;
      severity = 'critical';
      interpretation =
        'Citología sugestiva de carcinoma invasor (escamoso o adenocarcinoma). Requiere evaluación urgente por Ginecología Oncológica con colposcopia y biopsia dirigida inmediata.';
      guidance.push('Solicitar colposcopia y biopsia cervical dirigida de carácter prioritario (< 1–2 semanas).');
      if (isPregnant) {
        guidance.push('EMBARAZO: Prohibido el legrado endocervical (LEC). Evitar conización salvo indicación estricta en unidad de Ginecología Oncológica y Medicina Materno-Fetal para estadificación.');
      }
    } else if (cytology === 'agc') {
      primaryCode = isPregnant ? 'Colposcopia (sin LEC)' : 'Colposcopia + LEC';
      riskScore = 4;
      severity = 'critical';
      interpretation =
        'Células glandulares atípicas (AGC) o adenocarcinoma in situ (AIS): alto riesgo de neoplasia glandular endocervical, endometrial o lesión escamosa de alto grado oculta.';
      guidance.push('Colposcopia inmediata INDEPENDIENTEMENTE del resultado del VPH.');
      if (isPregnant) {
        guidance.push('EMBARAZO: Realizar colposcopia por colposcopista experto; CONTRAINDICADO el legrado endocervical (LEC) y la biopsia endometrial durante la gestación.');
      } else {
        guidance.push('Realizar muestreo endocervical (LEC) en todas las no embarazadas.');
        if (ageGroup === '30_65' || ageGroup === 'gt65') {
          guidance.push('Biopsia endometrial obligatoria si edad ≥ 35 años, sangrado uterino anormal, anovulación crónica o presencia de células endometriales atípicas.');
        } else {
          guidance.push('Si presenta sangrado uterino anormal o factores de riesgo de hiperplasia endometrial, añadir biopsia endometrial (aunque sea < 35 años).');
        }
      }
    } else if (cytology === 'hsil') {
      primaryCode = isPregnant ? 'Colposcopia (diferir LEEP)' : 'Colposcopia / LEEP';
      riskScore = 4;
      severity = 'critical';
      if (isPregnant) {
        interpretation =
          'HSIL en el embarazo: requiere colposcopia por especialista para descartar carcinoma invasor, pero se difiere cualquier procedimiento escisional (LEEP/cono) al posparto salvo sospecha histológica de invasión.';
        guidance.push('Colposcopia durante el embarazo con biopsia ÚNICAMENTE de lesiones sospechosas de alto grado o invasión; CONTRAINDICADO el LEC.');
        guidance.push('Reevaluación colposcópica y citológica a las 6 semanas posparto para definir escisión.');
      } else if (ageGroup === 'lt25') {
        interpretation =
          'HSIL en < 25 años: indicada colposcopia diagnóstica con biopsia dirigida. NO realizar tratamiento escisional inmediato sin biopsia previa ("see-and-treat" desaconsejado en < 25 años).';
        guidance.push('Si se confirma NIC 2 en < 25 años, suele preferirse vigilancia estrecha c/6 meses (si la unión escamocolumnar es visible y la paciente desea fertilidad) frente a escisión directa; en NIC 3 sí está indicado tratamiento.');
      } else {
        interpretation =
          'HSIL en ≥ 25 años: alto riesgo inmediato de NIC 3+ (≥ 25–60 % según VPH). Indicada colposcopia con biopsia o tratamiento escisional acelerado (LEEP) en pacientes seleccionadas con VPH 16+ y sin deseo gestacional inmediato que lo contraindique.';
        guidance.push('Realizar colposcopia inmediata (o LEEP acelerado según riesgo ASCCP 2019 y preferencia informada si VPH 16+ o sin cribado previo reciente).');
      }
    } else if (cytology === 'asch') {
      riskScore = 3;
      if (hpvStatus === 'negative' && !immunosuppressed && !isPregnant) {
        primaryCode = 'Cotest/VPH en 1 año (o Colposcopia si riesgo)';
        severity = 'moderate';
        interpretation =
          'ASC-H con VPH-AR negativo: según ASCCP 2019 el riesgo inmediato de NIC 3+ es ~3.4 % (justo por debajo del umbral de 4 % para colposcopia), por lo que puede indicarse vigilancia con prueba de VPH/cotest en 1 año (o colposcopia si hay antecedentes de riesgo previos).';
        guidance.push('Repetir prueba basada en VPH + citología en 12 meses (si persiste ASC-H o VPH se vuelve positivo -> colposcopia inmediata).');
      } else {
        primaryCode = 'Colposcopia Diagnóstica';
        severity = 'high';
        interpretation =
          'ASC-H (con VPH positivo, desconocido, inmunosupresión o embarazo): riesgo significativo de lesión de alto grado subyacente; indicada colposcopia.';
        guidance.push(
          isPregnant
            ? 'EMBARAZO: Realizar colposcopia (sin LEC); biopsiar solo lesiones sospechosas de alto grado/invasión y reevaluar a las 6 semanas posparto.'
            : 'Realizar colposcopia con biopsias dirigidas de cualquier área acetoblanca/sospechosa.',
        );
      }
    } else if (cytology === 'lsil') {
      if (ageGroup === 'lt25' && !immunosuppressed) {
        primaryCode = 'Repetir Citología en 12 meses';
        riskScore = 2;
        severity = 'moderate';
        interpretation =
          'LSIL en < 25 años inmunocompetente: la infección por VPH tiene altísima tasa de aclaramiento espontáneo en jóvenes. No está indicada colposcopia inmediata de rutina.';
        guidance.push('Repetir únicamente citología cervical a los 12 meses (y a los 24 meses si persiste ASC-US/LSIL); derivar a colposcopia si progresa a ASC-H/HSIL o persiste alteración ≥ 2 años.');
        if (isPregnant) {
          guidance.push('EMBARAZO (< 25 años): diferir control citológico/colposcópico hasta las 6 semanas posparto.');
        }
      } else if (hpvStatus === 'negative' && !immunosuppressed) {
        primaryCode = 'Repetir Cotest / VPH en 1 año';
        riskScore = 2;
        severity = 'low';
        interpretation =
          'LSIL con VPH-AR negativo (riesgo inmediato de NIC 3+ ~1.1 % < 4 %): no requiere colposcopia inmediata según ASCCP 2019.';
        guidance.push('Repetir prueba basada en VPH (preferiblemente cotest) en 12 meses.');
      } else {
        primaryCode = isPregnant ? 'Colposcopia (puede diferirse al posparto)' : 'Colposcopia Diagnóstica';
        riskScore = 3;
        severity = 'high';
        interpretation =
          'LSIL en ≥ 25 años con VPH positivo o desconocido (o paciente inmunocomprometida): indicada evaluación colposcópica para descartar NIC 2/3.';
        guidance.push(
          isPregnant
            ? 'EMBARAZO: En LSIL sin sospecha de alto grado es aceptable diferir la colposcopia a ≥ 6 semanas posparto (o realizarla sin LEC).'
            : 'Realizar colposcopia con biopsia de lesiones acetoblancas; si colposcopia es satisfactoria y negativa/NIC 1, seguimiento según ASCCP a 1 año.',
        );
      }
    } else if (cytology === 'ascus') {
      if (hpvStatus === 'negative' && !immunosuppressed) {
        primaryCode = 'Control en 3 años (VPH/Cotest)';
        riskScore = 1;
        severity = 'low';
        interpretation =
          'ASC-US con VPH-AR negativo: el riesgo de NIC 3+ es muy bajo; NO requiere colposcopia.';
        guidance.push('Repetir prueba basada en VPH (o cotest) en 3 años (no esperar 5 años por el antecedente de ASC-US).');
      } else if (ageGroup === 'lt25' && !immunosuppressed) {
        primaryCode = hpvStatus === 'unknown' ? 'VPH Reflejo o Citología en 1 año' : 'Repetir Citología en 1 año';
        riskScore = 2;
        severity = 'moderate';
        interpretation =
          'ASC-US en < 25 años inmunocompetente: incluso si el VPH es positivo, las guías ASCCP 2019 recomiendan repetir citología en 1 año antes que colposcopia inmediata.';
        guidance.push('Si citología de control a los 12 meses sigue alterada o persiste a los 24 meses -> colposcopia.');
      } else if (hpvPositive || immunosuppressed) {
        primaryCode = isPregnant ? 'Colposcopia (puede diferirse al posparto)' : 'Colposcopia Diagnóstica';
        riskScore = 3;
        severity = 'moderate';
        interpretation =
          'ASC-US con VPH-AR positivo (o paciente inmunocomprometida): supera el umbral de riesgo (≥ 4 %) para evaluación colposcópica.';
        guidance.push(
          isPregnant
            ? 'EMBARAZO: Puede diferirse la colposcopia a las 6 semanas posparto o realizarse sin LEC.'
            : 'Realizar colposcopia diagnóstica.',
        );
      } else {
        primaryCode = 'Solicitar VPH-AR Reflejo (Preferido)';
        riskScore = 2;
        severity = 'moderate';
        interpretation =
          'ASC-US con estado de VPH desconocido en ≥ 25 años: la estrategia preferida es realizar prueba refleja de VPH de alto riesgo.';
        guidance.push('Si VPH-AR resulta positivo -> Colposcopia. Si VPH-AR resulta negativo -> control con cotest/VPH en 3 años.');
        guidance.push('Si no se dispone de prueba de VPH en el medio: repetir citología en 6–12 meses o remitir a colposcopia según protocolo nacional.');
      }
    } else {
      // NILM
      if (hpvStatus === 'hpv16_18') {
        primaryCode = 'Colposcopia (VPH 16/18 +)';
        riskScore = 3;
        severity = 'high';
        interpretation =
          'Citología NILM normal pero con VPH 16 y/o 18 positivo: conlleva un riesgo significativo de lesión de alto grado o glandular oculta.';
        guidance.push(
          isPregnant
            ? 'EMBARAZO: Realizar colposcopia sin LEC (especialmente si VPH 16+) o valorar diferimiento controlado según acceso y criterio colposcópico.'
            : 'Colposcopia inmediata incluso con PAP normal.',
        );
      } else if (hpvStatus === 'other_hr') {
        primaryCode = immunosuppressed ? 'Colposcopia (Inmunosupresión)' : 'Repetir Cotest / VPH en 1 año';
        riskScore = 2;
        severity = 'moderate';
        interpretation = immunosuppressed
          ? 'En paciente inmunocomprometida/VIH con VPH-AR positivo se recomienda umbral bajo para colposcopia.'
          : 'Citología NILM con otros VPH-AR positivos (no 16/18): en población inmunocompetente el riesgo inmediato de NIC 3+ es < 4 %.';
        guidance.push(
          immunosuppressed
            ? 'Valorar colposcopia directa por inmunosupresión o seguimiento estrecho según guía VIH.'
            : 'Repetir prueba de VPH + citología en 12 meses; si persiste VPH+ o aparece citología alterada -> colposcopia.',
        );
      } else if (hpvStatus === 'negative') {
        primaryCode = immunosuppressed ? 'Tamizaje Anual / Estrecho' : 'Tamizaje Rutinario (5 años)';
        riskScore = 0;
        severity = 'normal';
        interpretation = 'Citología NILM y VPH-AR negativo (cotest negativo): riesgo mínimo de lesión precursora.';
        guidance.push(
          immunosuppressed
            ? 'En VIH/inmunosupresión mantener intervalo acortado (anual o cada 3 años tras 3 resultados consecutivos negativos según protocolo).'
            : 'Continuar tamizaje rutinario en 5 años con VPH/cotest hasta los 65 años (o salir del tamizaje tras ≥ 65 años con pruebas previas adecuadas negativas).',
        );
      } else {
        primaryCode = 'Tamizaje Rutinario (3 años citología)';
        riskScore = 0;
        severity = 'normal';
        interpretation = 'Citología NILM normal sin prueba de VPH disponible.';
        guidance.push(
          ageGroup === 'gt65'
            ? 'En > 65 años revisar historial de últimos 10 años (≥ 3 PAP negativos o ≥ 2 cotest/VPH negativos, el último en los últimos 5 años) antes de suspender tamizaje.'
            : 'Repetir citología en 3 años (o realizar prueba primaria de VPH cada 5 años si disponible en ≥ 25–30 años).',
        );
      }
    }

    if (immunosuppressed && riskScore >= 1) {
      guidance.push('Nota por inmunosupresión/VIH: cualquier resultado VPH+ o citología ≥ ASC-US persistente requiere seguimiento más estricto y menor umbral para colposcopia.');
    }

    return {
      primaryResult: {
        label: 'Conducta recomendada',
        value: riskScore,
        formattedValue: primaryCode,
        unit: CYTOLOGY_LABELS[cytology] ?? cytology,
      },
      secondaryResults: [
        {
          label: 'Citología / VPH',
          formattedValue: `${CYTOLOGY_LABELS[cytology]} · ${
            hpvStatus === 'hpv16_18'
              ? 'VPH 16/18 (+)'
              : hpvStatus === 'other_hr'
                ? 'Otros VPH-AR (+)'
                : hpvStatus === 'negative'
                  ? 'VPH-AR (-)'
                  : 'VPH desconocido'
          }`,
          unit: '',
        },
        {
          label: 'Contexto especial',
          formattedValue: isPregnant
            ? 'Embarazo activo (NO LEC)'
            : immunosuppressed
              ? 'Inmunosupresión'
              : 'Estándar',
          unit: '',
        },
      ],
      severity,
      riskClassification: `${primaryCode} · ${CYTOLOGY_LABELS[cytology]}`,
      clinicalInterpretation: interpretation,
      guidance,
      guidanceDisclaimer:
        'Algoritmo orientativo basado en ASCCP 2019 y OMS 2021. El historial previo de NIC 2/3, biopsias previas o VPH persistente modifica la estimación exacta de riesgo.',
      formulaUsed:
        'Triaje clínico Bethesda 2014 + VPH-AR + Edad + Embarazo/Inmunosupresión (ASCCP Risk-Based Guidelines)',
      inputsSummary: `Edad=${ageGroup}, PAP=${CYTOLOGY_LABELS[cytology]}, VPH=${hpvStatus}, Embarazo=${isPregnant ? 'Sí' : 'No'}`,
    };
  },
};
