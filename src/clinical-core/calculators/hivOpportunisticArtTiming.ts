import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const scenarioField: SelectFieldDef = {
  id: 'clinicalScenario',
  label: 'Escenario clínico al diagnóstico de VIH',
  type: 'select',
  defaultValue: 'uncomplicated',
  options: [
    {
      value: 'uncomplicated',
      label: 'Sin infección oportunista del SNC ni TB/criptococosis activa',
    },
    {
      value: 'pcp_toxo_other',
      label: 'Neumonía por Pneumocystis (PCP), Toxoplasmosis o IO no meníngea',
    },
    {
      value: 'tb_pulmonary_low_cd4',
      label: 'Tuberculosis pulmonar / extrapulmonar NO meníngea con CD4 < 50 cél/µL',
    },
    {
      value: 'tb_pulmonary_high_cd4',
      label: 'Tuberculosis pulmonar / extrapulmonar NO meníngea con CD4 ≥ 50 cél/µL',
    },
    {
      value: 'tb_meningitis',
      label: 'Meningitis tuberculosa (TB del Sistema Nervioso Central)',
    },
    {
      value: 'cryptococcal_meningitis',
      label: 'Meningitis criptocócica (SNC)',
    },
    {
      value: 'cmv_retinitis',
      label: 'Retinitis por Citomegalovirus (CMV)',
    },
  ],
};

const rifampinField: BooleanFieldDef = {
  id: 'onRifampin',
  label: '¿Recibe Rifampicina dentro del esquema antituberculoso?',
  type: 'boolean',
  defaultValue: true,
  visibleWhen: (inputs) =>
    inputs.clinicalScenario === 'tb_pulmonary_low_cd4' ||
    inputs.clinicalScenario === 'tb_pulmonary_high_cd4' ||
    inputs.clinicalScenario === 'tb_meningitis',
  helpText: 'La rifampicina induce UGT1A1/CYP3A4: obliga a ajustar dosis de Dolutegravir (50 mg c/12 h) y contraindica Bictegravir y TAF (salvo evaluación experta) o IP potenciados estándar.',
};

export const hivOpportunisticArtTimingCalculator: CalculatorDefinition = {
  id: 'hiv-opportunistic-art-timing',
  name: 'VIH: Momento Óptimo de Inicio de TAR y Prevención de SIRI Mortal',
  shortName: 'VIH: Inicio TAR y SIRI',
  primarySpecialty: 'infectologia',
  secondarySpecialties: ['medicina-interna', 'urgencias'],
  subcategory: 'dosificacion',
  keywords: [
    'tar',
    'antirretroviral',
    'siri',
    'iris',
    'criptococo',
    'meningitis tuberculosa',
    'tuberculosis',
    'rifampicina',
    'dolutegravir',
    'vih',
    'inicio rapido',
  ],
  description:
    'Determina cuándo iniciar la Terapia Antirretroviral (TAR) en pacientes con infecciones oportunistas activas para reducir mortalidad sin desencadenar Síndrome Inflamatorio de Reconstitución Inmune (SIRI) intracraneal.',
  clinicalIndication:
    'Planificación del inicio de TAR en urgencias, hospitalización o consulta externa tras diagnóstico reciente de VIH e infecciones oportunistas coexistentes.',
  validatedPopulation: 'Adultos y adolescentes con infección por VIH sin TAR previo o en reinicio tras abandono.',
  contraindications: [
    'NUNCA iniciar TAR el día 1 en pacientes con sospecha o confirmación de meningitis criptocócica ni meningitis tuberculosa sin tratamiento específico previo y ventana de estabilización (riesgo de SIRI cerebral mortal).',
  ],
  limitations: [
    'Si el paciente presenta signos meníngeos o CD4 < 100, descartar siempre criptococosis (CrAg sérico/LCR) y tuberculosis antes del inicio rápido de TAR.',
  ],
  version: 'NIH/DHHS ART & OI Guidelines 2024 · WHO Rapid ART 2021 · COAT / CAMELIA',
  references: [
    {
      citation:
        'Panel on Antiretroviral Guidelines for Adults and Adolescents. Guidelines for the Use of Antiretroviral Agents in Adults and Adolescents with HIV (DHHS).',
      year: 2024,
    },
    {
      citation:
        'Boulware DR, Meya DB, Muzoora C, et al. Timing of antiretroviral therapy after diagnosis of cryptococcal meningitis (COAT trial). N Engl J Med. 2014;370(26):2487-2498.',
      year: 2014,
    },
    {
      citation:
        'Blanc FX, Sok T, Laureillard D, et al. Earlier versus later start of antiretroviral therapy in HIV-infected adults with tuberculosis (CAMELIA). N Engl J Med. 2011;365(16):1471-1481.',
      year: 2011,
    },
  ],
  fields: [scenarioField, rifampinField],
  calculate(inputs: CalculatorInputsState) {
    const errors = validateCalculatorInputs(hivOpportunisticArtTimingCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors.map((e) => e.message).join(' '));
    }

    const scenario = String(inputs.clinicalScenario ?? 'uncomplicated');
    const onRifampin = Boolean(inputs.onRifampin);

    let timingLabel = 'Inicio inmediato (≤ 7 días)';
    let timingDays = 1;
    let severity: SeverityLevel = 'low';
    let riskClass = 'Inicio rápido de TAR indicado';
    let interpretation = '';
    const guidance: string[] = [];

    if (scenario === 'cryptococcal_meningitis') {
      timingLabel = 'DIFERIR TAR 4–6 semanas';
      timingDays = 28;
      severity = 'critical';
      riskClass = 'ALERTA SIRI INTRACRANEAL · Diferir TAR 4–6 semanas';
      interpretation =
        'En meningitis criptocócica, iniciar TAR precozmente (< 2 semanas) AUMENTA significativamente la mortalidad por SIRI intracraneal e hipertensión endocraneana (ensayo COAT). Debe completarse primero la inducción antifúngica y controlar la presión intracraneal.';
      guidance.push('Inducción antifúngica inmediata: Anfotericina B liposomal 10 mg/kg IV dosis única + Flucitosina 100 mg/kg/día + Fluconazol 1,200 mg/día × 14 días (esquema OMS/AMBITION-cm) o Anfotericina B liposomal 3–4 mg/kg/d + Flucitosina × 7–14 días.');
      guidance.push('Punciones lumbares terapéuticas seriadas si presión de apertura ≥ 25 cmH₂O o síntomas de hipertensión intracraneal (NO usar dexametasona de rutina en meningitis criptocócica).');
      guidance.push('Iniciar TAR a las 4–6 semanas cuando haya respuesta clínica y esterilización/mejoría del LCR.');
    } else if (scenario === 'tb_meningitis') {
      timingLabel = 'DIFERIR TAR 4–8 semanas';
      timingDays = 28;
      severity = 'critical';
      riskClass = 'ALERTA SIRI DEL SNC · Diferir TAR 4–8 semanas';
      interpretation =
        'En meningitis tuberculosa el inicio temprano de TAR incrementa eventos neurológicos graves y SIRI potencialmente fatal del SNC. Iniciar tratamiento anti-TB + corticoide adyuvante de inmediato y diferir TAR 4 a 8 semanas.';
      guidance.push('Iniciar esquema anti-TB de inmediato + Dexametasona IV/VO (protocolo Thwaites 0.3–0.4 mg/kg/día en pauta descendente × 6–8 semanas).');
      guidance.push('Iniciar TAR entre las semanas 4 y 8 (en guías OMS/DHHS una vez lograda estabilización neurológica inicial).');
    } else if (scenario === 'tb_pulmonary_low_cd4') {
      timingLabel = 'TAR dentro de ≤ 2 semanas';
      timingDays = 14;
      severity = 'high';
      riskClass = 'TB no meníngea con CD4 < 50 · Inicio temprano de TAR (≤ 2 sem)';
      interpretation =
        'En tuberculosis pulmonar/extrapulmonar NO meníngea con CD4 < 50 cél/µL, el inicio del TAR dentro de las primeras 2 semanas tras comenzar anti-TB reduce significativamente la mortalidad (ensayos CAMELIA/STRIDE/SAPiT).';
      guidance.push('Iniciar tratamiento anti-TB primero y agregar TAR dentro de los primeros 7–14 días (vigilando síntomas de SIRI paradójico benigno; prednisona profiláctica en casos seleccionados con CD4 ≤ 100 mejora incidencia de SIRI).');
    } else if (scenario === 'tb_pulmonary_high_cd4') {
      timingLabel = 'TAR entre 2–8 semanas';
      timingDays = 21;
      severity = 'moderate';
      riskClass = 'TB no meníngea con CD4 ≥ 50 · TAR dentro de 2–8 semanas';
      interpretation =
        'Iniciar primero el tratamiento antituberculoso y comenzar el TAR dentro de las primeras 2 semanas (OMS) o entre 2 y 8 semanas (DHHS según tolerancia hepática/gastrointestinal).';
      guidance.push('Priorizar adherencia y tolerancia al esquema anti-TB durante los primeros días antes de sumar TAR.');
    } else if (scenario === 'pcp_toxo_other') {
      timingLabel = 'TAR dentro de ≤ 2 semanas';
      timingDays = 14;
      severity = 'high';
      riskClass = 'IO aguda no criptocócica · TAR temprano (≤ 2 semanas)';
      interpretation =
        'En neumonía por Pneumocystis (PCP) o toxoplasmosis cerebral, iniciar el tratamiento específico de la IO de inmediato y comenzar TAR dentro de las primeras 2 semanas (ensayo ACTG A5164 demostró menor progresión a SIDA/muerte).';
      guidance.push('PCP hipoxémica (PaO₂ < 70 mmHg o gradiente A-a ≥ 35 mmHg): asociar Prednisona 40 mg c/12 h × 5 d → 40 mg/d × 5 d → 20 mg/d × 11 d con la primera dosis de TMP-SMX.');
    } else if (scenario === 'cmv_retinitis') {
      timingLabel = 'TAR en 1–2 semanas';
      timingDays = 10;
      severity = 'high';
      riskClass = 'Retinitis por CMV · Inducción antiviral + TAR en 1–2 sem';
      interpretation =
        'Iniciar terapia anti-CMV sistémica (ganciclovir IV / valganciclovir VO ± terapia intravítrea si amenaza macular) e iniciar TAR en 1–2 semanas con seguimiento oftalmológico estrecho por riesgo de uveítis/vitritis por recuperación inmune.';
      guidance.push('Coordinar vigilancia oftalmológica seriada tras el inicio de TAR.');
    } else {
      timingLabel = 'Inicio inmediato (mismo día / ≤ 7 días)';
      timingDays = 1;
      severity = 'low';
      riskClass = 'Inicio rápido de TAR (OMS / DHHS / MINSA)';
      interpretation =
        'Sin signos de meningitis ni infección oportunista del SNC/micobacteriana que obligue a diferir: iniciar TAR el mismo día o dentro de los ≤ 7 días del diagnóstico (1.ª línea MINSA Nicaragua/OMS: TLD [TDF 300 / 3TC 300 / DTG 50 mg] 1 comp VO c/24 h; alternativa BIC/FTC/TAF).';
      guidance.push('Extraer muestra basal para carga viral / CD4 (referencia CNDR en red pública), bioquímica renal/hepática, HBsAg/VHC y tamizaje clínico de TB/CrAg (sin demorar inicio si está estable).');
    }

    if (
      onRifampin &&
      (scenario === 'tb_pulmonary_low_cd4' ||
        scenario === 'tb_pulmonary_high_cd4' ||
        scenario === 'tb_meningitis')
    ) {
      guidance.push(
        'AJUSTE POR RIFAMPICINA (MINSA / OMS): En pacientes con esquema TLD (TDF/3TC/DTG), DUPLICAR Dolutegravir a DTG 50 mg cada 12 horas (añadir 1 tableta de DTG 50 mg a las 12 horas de la dosis fija combinada TLD) durante todo el tratamiento con rifampicina y hasta 2 semanas después de suspenderla. NO usar Bictegravir ni TAF estándar ni IP potenciados con rifampicina.',
      );
    }

    return {
      primaryResult: {
        label: 'Ventana recomendada para iniciar TAR',
        value: timingDays,
        formattedValue: timingLabel,
        unit: '',
      },
      secondaryResults: [
        {
          label: 'Riesgo de SIRI grave',
          formattedValue:
            scenario === 'cryptococcal_meningitis' || scenario === 'tb_meningitis'
              ? 'ALTO (SNC — Diferimiento obligatorio)'
              : 'Moderado / Manejable (No diferir > 2 sem)',
          unit: '',
        },
      ],
      severity,
      riskClassification: riskClass,
      clinicalInterpretation: interpretation,
      guidance,
      guidanceDisclaimer:
        'Evaluar función renal (ClCr), serología de Hepatitis B (no suspender TDF/3TC en coinfección VHB sin alternativa activa) e interacciones farmacológicas antes de prescribir TAR.',
      formulaUsed:
        'Algoritmo NIH/DHHS & OMS 2024 de momento de inicio de TAR según infección oportunista y riesgo de SIRI del SNC',
      inputsSummary: `Escenario=${scenario}, Rifampicina=${onRifampin ? 'Sí' : 'No'}`,
    };
  },
};
