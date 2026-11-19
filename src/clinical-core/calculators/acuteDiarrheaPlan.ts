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
  SecondaryResultItem,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';
import { WEIGHT_UNITS_KG } from '../units/converters.ts';

const ageField: NumberFieldDef = {
  id: 'ageMonths',
  label: 'Edad del paciente',
  type: 'number',
  canonicalUnit: 'meses',
  units: [
    { id: 'months', label: 'meses (0–228)', toCanonical: (v) => v, min: 0, max: 1200, step: 1 },
    { id: 'years', label: 'años', toCanonical: (v) => v * 12, min: 0, max: 100, step: 0.5 },
  ],
  defaultUnitId: 'months',
  min: 0,
  max: 1200,
  placeholder: '18',
  helpText: 'Define la pauta de Plan C (< 12 m vs ≥ 12 m), volumen de SRO en Plan A y dosis de zinc (< 6 m vs ≥ 6 m).',
};

const weightField: NumberFieldDef = {
  id: 'weight',
  label: 'Peso corporal actual',
  type: 'number',
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  min: 1.5,
  max: 180,
  placeholder: '11',
};

const generalStateField: SelectFieldDef = {
  id: 'generalState',
  label: '1. Estado general y neurológico (OMS / CDS)',
  type: 'select',
  defaultValue: 'normal',
  options: [
    { value: 'normal', label: 'Alerta, activo y reactivo', points: 0 },
    { value: 'irritable', label: 'Inquieto, sediento o irritable al estímulo', points: 1 },
    { value: 'lethargic', label: 'Letárgico, somnoliento, hipotónico o inconsciente', points: 2 },
  ],
};

const eyesField: SelectFieldDef = {
  id: 'eyes',
  label: '2. Aspecto de los ojos (OMS / CDS)',
  type: 'select',
  defaultValue: 'normal',
  options: [
    { value: 'normal', label: 'Normales', points: 0 },
    { value: 'sunken', label: 'Hundidos / ligeramente hundidos', points: 1 },
    { value: 'deeply_sunken', label: 'Muy hundidos y secos', points: 2 },
  ],
};

const thirstField: SelectFieldDef = {
  id: 'thirst',
  label: '3. Sed y tolerancia a la ingesta (OMS)',
  type: 'select',
  defaultValue: 'normal',
  options: [
    { value: 'normal', label: 'Bebe normalmente, sin sed aumentada' },
    { value: 'eager', label: 'Sediento, bebe con avidez / desesperación' },
    { value: 'poor', label: 'Bebe mal, rechaza líquidos o es incapaz de beber' },
  ],
};

const skinPinchField: SelectFieldDef = {
  id: 'skinPinch',
  label: '4. Signo del pliegue cutáneo abdominal (OMS)',
  type: 'select',
  defaultValue: 'fast',
  options: [
    { value: 'fast', label: 'Desaparece inmediatamente (< 1 s)' },
    { value: 'slow', label: 'Desaparece lentamente (1–2 s)' },
    { value: 'very_slow', label: 'Desaparece muy lentamente (> 2 s)' },
  ],
};

const mucousField: SelectFieldDef = {
  id: 'mucousMembranes',
  label: '5. Mucosa oral y lengua (Escala CDS Friedman)',
  type: 'select',
  defaultValue: 'moist',
  options: [
    { value: 'moist', label: 'Húmeda', points: 0 },
    { value: 'sticky', label: 'Pegajosa o discretamente seca', points: 1 },
    { value: 'dry', label: 'Muy seca / acartonada', points: 2 },
  ],
};

const tearsField: SelectFieldDef = {
  id: 'tears',
  label: '6. Lágrimas al llanto (Escala CDS Friedman)',
  type: 'select',
  defaultValue: 'present',
  options: [
    { value: 'present', label: 'Presentes', points: 0 },
    { value: 'decreased', label: 'Disminuidas', points: 1 },
    { value: 'absent', label: 'Ausentes', points: 2 },
  ],
};

const stoolTypeField: SelectFieldDef = {
  id: 'stoolType',
  label: '7. Características de las evacuaciones (tamizaje etiológico)',
  type: 'select',
  defaultValue: 'watery',
  options: [
    { value: 'watery', label: 'Diarrea acuosa (sin sangre visible — probable viral/toxigénica)' },
    { value: 'mucoid', label: 'Evacuaciones con moco sin sangre macroscópica' },
    { value: 'dysentery', label: 'Disentería (sangre macroscópica y/o moco + tenesmo)' },
  ],
};

const persistentVomitingField: BooleanFieldDef = {
  id: 'persistentVomiting',
  label: 'Vómitos incoercibles / fracaso previo a terapia de rehidratación oral',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
};

const highFeverSepsisField: BooleanFieldDef = {
  id: 'highFeverSepsis',
  label: 'Datos de alarma infecciosa / choque (fiebre > 39 °C, aspecto tóxico, llenado capilar > 3 s o edad < 3 meses)',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
};

const severeMalnutritionField: BooleanFieldDef = {
  id: 'severeMalnutrition',
  label: 'Sospecha de desnutrición aguda grave (marasmo / kwashiorkor / edema bilateral)',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  helpText: 'Modifica de forma crítica la pauta de líquidos IV y contraindica cargas rápidas estándar salvo choque establecido.',
};

export const acuteDiarrheaPlanCalculator: CalculatorDefinition = {
  id: 'acute-diarrhea-plan',
  name: 'Enfermedad Diarreica Aguda (EDA): Tamizaje OMS / Escala CDS y Plan A, B, C',
  shortName: 'EDA: Tamizaje y Plan A/B/C',
  primarySpecialty: 'pediatria',
  secondarySpecialties: ['urgencias', 'infectologia', 'gastroenterologia', 'medicina-interna'],
  subcategory: 'liquidos',
  keywords: [
    'eda',
    'diarrea',
    'diarrea aguda',
    'gastroenteritis',
    'plan a',
    'plan b',
    'plan c',
    'sro',
    'vida suero oral',
    'deshidratacion',
    'cds',
    'friedman',
    'zinc',
    'disenteria',
    'aiepi',
    'oms',
  ],
  description:
    'Tamizaje clínico integral de la Enfermedad Diarreica Aguda (OMS/AIEPI + Escala Clínica de Deshidratación CDS de Friedman 0–8 puntos + tamizaje etiológico) que determina automáticamente el Plan A, B o C con volúmenes exactos por peso y edad.',
  clinicalIndication:
    'Evaluación inicial en consulta externa y urgencias de pacientes con diarrea aguda (< 14 días) para estratificar deshidratación, decidir vía de rehidratación, calcular SRO/IV, dosis de zinc y detectar datos de alarma o disentería.',
  validatedPopulation: 'Lactantes, niños y adolescentes (OMS AIEPI / CDS validada principalmente de 1 a 36 meses; Plan A/B/C aplicable en EDA pediátrica y general).',
  contraindications: [
    'Antidiarreicos inhibidores de la motilidad (loperamida, difenoxilato) están CONTRAINDICADOS en pediatría y en cualquier diarrea con fiebre o sangre por riesgo de íleo paralítico y megacolon tóxico.',
    'En desnutrición aguda grave (kwashiorkor/marasmo) NO aplicar Plan C IV rápido estándar salvo choque establecido; utilizar ReSoMal e hidratación lenta bajo protocolo específico.',
    'En sospecha de Escherichia coli productora de toxina Shiga (STEC O157:H7: diarrea sanguinolenta sin fiebre alta) evitar antibióticos empíricos por mayor riesgo de Síndrome Urémico Hemolítico (SHU).',
  ],
  limitations: [
    'El signo del pliegue puede dar falsos positivos en niños con marasmo (pérdida de grasa subcutánea) y falsos negativos en obesidad o deshidratación hipernatrémica.',
    'Si persiste intolerancia oral o alto gasto fecal (> 10 mL/kg/h) durante el Plan B tras 4 horas, reevaluar cambio a sonda nasogástrica o vía intravenosa.',
  ],
  version: 'OMS / UNICEF AIEPI + CDS Friedman (2004) + ESPGHAN/IDSA',
  references: [
    {
      citation:
        'World Health Organization & UNICEF. The Treatment of Diarrhoea: A Manual for Physicians and Other Senior Health Workers (4th rev). Geneva: WHO; 2005 (incl. Plan A, Plan B, Plan C & Zinc).',
      year: 2005,
    },
    {
      citation:
        'Friedman JN, Goldman RD, Srivastava R, Parkin PC. Development of a clinical dehydration scale for use in children between 1 and 36 months of age. J Pediatr. 2004;145(2):201-207.',
      year: 2004,
    },
    {
      citation:
        'Shane AL, Mody RK, Crump JA, et al. 2017 Infectious Diseases Society of America Clinical Practice Guidelines for the Diagnosis and Management of Infectious Diarrhea. Clin Infect Dis. 2017;65(12):e45-e80.',
      year: 2017,
    },
  ],
  fields: [
    ageField,
    weightField,
    generalStateField,
    eyesField,
    thirstField,
    skinPinchField,
    mucousField,
    tearsField,
    stoolTypeField,
    persistentVomitingField,
    highFeverSepsisField,
    severeMalnutritionField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(acuteDiarrheaPlanCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const ageMonths = getCanonicalNumberValue(ageField, inputs.ageMonths as NumberInputValue).canonicalValue!;
    const weightKg = getCanonicalNumberValue(weightField, inputs.weight as NumberInputValue).canonicalValue!;
    const generalState = inputs.generalState as string;
    const eyes = inputs.eyes as string;
    const thirst = inputs.thirst as string;
    const skinPinch = inputs.skinPinch as string;
    const mucousMembranes = inputs.mucousMembranes as string;
    const tears = inputs.tears as string;
    const stoolType = inputs.stoolType as string;
    const persistentVomiting = inputs.persistentVomiting === true;
    const highFeverSepsis = inputs.highFeverSepsis === true;
    const severeMalnutrition = inputs.severeMalnutrition === true;

    // 1. Friedman Clinical Dehydration Scale (CDS, 0-8 pts)
    const cdsGeneral = generalState === 'lethargic' ? 2 : generalState === 'irritable' ? 1 : 0;
    const cdsEyes = eyes === 'deeply_sunken' ? 2 : eyes === 'sunken' ? 1 : 0;
    const cdsMucous = mucousMembranes === 'dry' ? 2 : mucousMembranes === 'sticky' ? 1 : 0;
    const cdsTears = tears === 'absent' ? 2 : tears === 'decreased' ? 1 : 0;
    const cdsScore = cdsGeneral + cdsEyes + cdsMucous + cdsTears;

    let cdsLabel = 'Sin deshidratación (0 pts · < 3 % déficit)';
    if (cdsScore >= 5) {
      cdsLabel = `Deshidratación moderada a grave (${cdsScore}/8 pts · > 6 % déficit)`;
    } else if (cdsScore >= 1) {
      cdsLabel = `Deshidratación leve / algún grado (${cdsScore}/8 pts · 3–6 % déficit)`;
    }

    // 2. WHO / AIEPI Hydration Classification -> Plan A / B / C
    const severeWhoSigns = [
      generalState === 'lethargic',
      eyes === 'deeply_sunken',
      thirst === 'poor',
      skinPinch === 'very_slow',
    ].filter(Boolean).length;

    const moderateOrSevereWhoSigns = [
      generalState !== 'normal',
      eyes !== 'normal',
      thirst !== 'normal',
      skinPinch !== 'fast',
    ].filter(Boolean).length;

    let plan: 'A' | 'B' | 'C' = 'A';
    if (severeWhoSigns >= 2 || (generalState === 'lethargic' && moderateOrSevereWhoSigns >= 2) || (highFeverSepsis && severeWhoSigns >= 1)) {
      plan = 'C';
    } else if (moderateOrSevereWhoSigns >= 2 || persistentVomiting || cdsScore >= 5) {
      plan = 'B';
    } else {
      plan = 'A';
    }

    // If persistent vomiting + high CDS (>= 5) or inability to drink -> escalate to Plan C / IV
    if (persistentVomiting && (thirst === 'poor' || cdsScore >= 5)) {
      plan = 'C';
    }

    // 3. Exact Fluid & Zinc calculations
    const planBSroTotalMl = roundClinical(75 * weightKg, 0);
    const planBSroPerHour = roundClinical(planBSroTotalMl / 4, 0);
    const planBSroPer30Min = roundClinical(planBSroTotalMl / 8, 0);

    const planCPhase1Ml = roundClinical(30 * weightKg, 0);
    const planCPhase2Ml = roundClinical(70 * weightKg, 0);
    const planCTotalMl = planCPhase1Ml + planCPhase2Ml;
    const isInfantUnder12m = ageMonths < 12;
    const planCPhase1Time = isInfantUnder12m ? '1 hora' : '30 minutos';
    const planCPhase2Time = isInfantUnder12m ? '5 horas' : '2.5 horas';
    const planCPhase2Rate = roundClinical(planCPhase2Ml / (isInfantUnder12m ? 5 : 2.5), 0);

    const ongoingStoolLossMl = roundClinical(10 * weightKg, 0);
    const ongoingVomitLossMl = roundClinical(2 * weightKg, 0);

    const zincNote =
      ageMonths < 6
        ? '10 mg/día vía oral durante 10–14 días (< 6 meses)'
        : ageMonths < 60
          ? '20 mg/día vía oral durante 10–14 días (6–59 meses)'
          : 'No requerido de rutina en ≥ 5 años (salvo deficiencia nutricional)';

    const planASroPerStool =
      ageMonths < 24
        ? `50–100 mL tras cada evacuación (≈ ${ongoingStoolLossMl} mL a 10 mL/kg)`
        : ageMonths < 120
          ? `100–200 mL tras cada evacuación (≈ ${ongoingStoolLossMl} mL a 10 mL/kg)`
          : 'A libre demanda (todo lo que desee beber tras cada evacuación)';

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Escala Clínica de Deshidratación (CDS Friedman)',
        formattedValue: `${cdsScore}/8`,
        unit: 'puntos',
        note: cdsLabel,
      },
      {
        label: 'Signos OMS de deshidratación',
        formattedValue: `${moderateOrSevereWhoSigns}/4`,
        unit: `(${severeWhoSigns} graves)`,
      },
    ];
    const guidance: string[] = [];

    if (plan === 'A') {
      severity = cdsScore >= 1 || highFeverSepsis || stoolType === 'dysentery' ? 'low' : 'normal';
      riskClassification = 'PLAN A — Sin deshidratación clínica (Manejo ambulatorio en hogar)';
      clinicalInterpretation =
        cdsScore >= 1
          ? 'No cumple criterios OMS de deshidratación establecida, aunque la escala CDS sugiere signos leves iniciales; iniciar Plan A estricto y vigilar tolerancia.'
          : 'Sin signos clínicos de deshidratación. El objetivo es prevenir la deshidratación y la desnutrición manteniendo hidratación oral y alimentación continua.';

      secondaryResults.push(
        {
          label: 'SRO baja osmolaridad tras cada evacuación',
          formattedValue: planASroPerStool,
          unit: '',
        },
        {
          label: 'Reposición por cada vómito (ref. 2 mL/kg)',
          formattedValue: `${ongoingVomitLossMl}`,
          unit: 'mL (sorbos lentos)',
        },
        {
          label: 'Suplementación con Zinc (OMS)',
          formattedValue: zincNote,
          unit: '',
        },
      );

      guidance.push(
        `Administrar Vida Suero Oral / SRO hipoosmolar (75 mEq/L Na⁺): ${planASroPerStool}; evitar refrescos, jugos industriales o bebidas deportivas hipertónicas.`,
        `Zinc elemental: ${zincNote}.`,
        'Mantener lactancia materna a libre demanda y alimentación habitual fraccionada (sin ayuno ni dilución de fórmula).',
        'Datos de alarma para regresar de inmediato a urgencias: sed intensa, vómitos repetidos, fiebre alta persistente, sangre en evacuaciones, rechazo a la vía oral, ojos hundidos o decaimiento.',
      );
    } else if (plan === 'B') {
      severity = 'moderate';
      riskClassification = 'PLAN B — Algún grado de deshidratación (Rehidratación oral supervisada en 4 h)';
      clinicalInterpretation =
        'Presenta signos clínicos de deshidratación leve a moderada. El tratamiento de primera línea es la terapia de rehidratación oral supervisada en sala de observación durante 4 horas.';

      secondaryResults.push(
        {
          label: 'SRO total en 4 horas (75 mL/kg)',
          formattedValue: `${formatClinicalNumber(planBSroTotalMl, 0)}`,
          unit: 'mL',
          note: `≈ ${formatClinicalNumber(planBSroPerHour, 0)} mL/h · ≈ ${formatClinicalNumber(planBSroPer30Min, 0)} mL cada 30 min (a cucharaditas o sorbos).`,
        },
        {
          label: 'Suplementación con Zinc (al tolerar VO)',
          formattedValue: zincNote,
          unit: '',
        },
      );

      guidance.push(
        `Administrar SRO baja osmolaridad: ${planBSroTotalMl} mL en 4 horas (${planBSroPerHour} mL/h o ${planBSroPer30Min} mL cada 30 min) con cucharita o jeringa en sorbos pequeños.`,
        'Si presenta vómito aislado: pausar 10 minutos y reanudar más despacio (1 cucharadita cada 2–3 min). En vómito persistente que impide SRO sin choque, valorar gastroclisis por SNG o antiemético (ondansetrón según protocolo/edad).',
        'Reevaluar estado de hidratación a las 4 horas: si está hidratado → pasar a Plan A; si persiste deshidratación moderada → repetir Plan B; si aparecen signos graves → escalar a Plan C IV.',
        `Iniciar Zinc al tolerar vía oral: ${zincNote}.`,
      );
    } else {
      severity = 'critical';
      riskClassification = severeMalnutrition
        ? 'PLAN C MODIFICADO — Deshidratación grave CON desnutrición aguda grave (¡Precaución IV!)'
        : 'PLAN C — Deshidratación grave / Riesgo de choque (Rehidratación IV urgente)';
      clinicalInterpretation = severeMalnutrition
        ? 'Deshidratación grave en contexto de desnutrición aguda grave: las cargas IV rápidas estándar pueden precipitar insuficiencia cardíaca y edema pulmonar.'
        : 'Deshidratación grave (≥ 10 % o incapacidad para beber/letargia). Requiere reanimación intravenosa inmediata con cristaloide isotónico y monitorización estrecha.';

      if (severeMalnutrition) {
        secondaryResults.push({
          label: 'Pauta especial en Desnutrición Aguda Grave',
          formattedValue: 'ReSoMal / Infusión lenta',
          unit: '',
          note: 'Evitar carga estándar 100 mL/kg rápida. Si hay choque franco: 15 mL/kg en 1 hora (≈ ' + roundClinical(15 * weightKg, 0) + ' mL) bajo vigilancia estricta; si tolera VO/SNG, usar ReSoMal.',
        });
        guidance.push(
          `ALERTA DESNUTRICIÓN GRAVE: NO infundir Plan C rápido estándar. Si no hay choque establecido usar ReSoMal VO/SNG (5 mL/kg cada 30 min × 2 h = ${roundClinical(5 * weightKg, 0)} mL/toma); si hay choque franco administrar 15 mL/kg IV en 1 h (${roundClinical(15 * weightKg, 0)} mL) vigilando frecuencia respiratoria y pulso.`,
          'Descartar y corregir hipoglucemia e hipotermia de forma inmediata.',
        );
      } else {
        secondaryResults.push(
          {
            label: `Fase 1 IV — 30 mL/kg en ${planCPhase1Time} (Ringer Lactato o NaCl 0.9 %)`,
            formattedValue: `${formatClinicalNumber(planCPhase1Ml, 0)}`,
            unit: 'mL',
          },
          {
            label: `Fase 2 IV — 70 mL/kg en ${planCPhase2Time}`,
            formattedValue: `${formatClinicalNumber(planCPhase2Ml, 0)}`,
            unit: `mL (${formatClinicalNumber(planCPhase2Rate, 0)} mL/h)`,
          },
          {
            label: 'Volumen total Plan C (100 mL/kg)',
            formattedValue: `${formatClinicalNumber(planCTotalMl, 0)}`,
            unit: 'mL',
          },
        );
        guidance.push(
          `Iniciar inmediatamente acceso IV (o intraóseo si choque sin vena): Ringer Lactato o NaCl 0.9 %: Fase 1 = ${planCPhase1Ml} mL en ${planCPhase1Time}; continuar con Fase 2 = ${planCPhase2Ml} mL en ${planCPhase2Time} (${planCPhase2Rate} mL/h).`,
          'Reevaluar cada 15–30 minutos pulso radial, llenado capilar y estado de alerta; si persiste pulso débil tras la Fase 1, repetir 30 mL/kg.',
          `Apenas el paciente pueda beber (habitualmente tras 3–4 h en lactantes o 1–2 h en mayores), ofrecer SRO a 5 mL/kg/h (${roundClinical(5 * weightKg, 0)} mL/h) mientras completa la hidratación.`,
          `Si no se logra acceso IV inmediato: iniciar SRO por sonda nasogástrica a 20 mL/kg/h (${roundClinical(20 * weightKg, 0)} mL/h) durante 6 h mientras se traslada o canaliza.`,
        );
      }
    }

    // 4. Etiological screening & warning flags
    if (stoolType === 'dysentery') {
      secondaryResults.push({
        label: 'Tamizaje etiológico (Disentería)',
        formattedValue: 'Diarrea con sangre',
        unit: '',
        note: 'Valorar etiología bacteriana invasiva (Shigella, Campylobacter) vs STEC (E. coli O157:H7). Evitar antidiarreicos.',
      });
      guidance.push(
        'DISENTERÍA: solicitar valoración médica/coprocultivo. Si no hay fiebre alta ni sepsis y se sospecha STEC, evitar antibióticos por riesgo de SHU; si sospecha clínica de shigelosis/sepsis grave, usar esquema dirigido según guía local.',
      );
    } else if (stoolType === 'watery' && !highFeverSepsis) {
      secondaryResults.push({
        label: 'Tamizaje etiológico (Diarrea acuosa)',
        formattedValue: 'No requiere antibiótico',
        unit: '',
        note: 'Cuadro compatible con etiología viral/enterotoxigénica autolimitada; la base del manejo es hidratación + zinc.',
      });
    }

    if (highFeverSepsis || ageMonths < 3) {
      guidance.push(
        ageMonths < 3
          ? 'EDAD < 3 MESES o datos tóxicos/fiebre > 39 °C: requiere valoración médica urgente presencial para descartar bacteriemia o infección bacteriana grave.'
          : 'FIEBRE > 39 °C o ASPECTO TÓXICO / SEPSIS: tomar estudios dirigidos y valorar hospitalización y cobertura antimicrobiana según contexto clínico.',
      );
    }

    return {
      primaryResult: {
        label: 'Conducta recomendada OMS',
        value: plan === 'A' ? 1 : plan === 'B' ? 2 : 3,
        formattedValue: `Plan ${plan}`,
        unit: `· Escala CDS ${cdsScore}/8`,
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer:
        'Pautas OMS/UNICEF AIEPI y ESPGHAN/IDSA. No administrar loperamida ni otros inhibidores de motilidad en niños; ajustar antibióticos únicamente ante indicación clínica precisa.',
      formulaUsed:
        'Tamizaje OMS/AIEPI (Plan A / B: 75 mL/kg en 4 h / C: 30 + 70 mL/kg) + Escala Clínica de Deshidratación CDS (0–8 pts)',
      inputsSummary: `Edad: ${formatClinicalNumber(ageMonths, 0)} m · Peso: ${formatClinicalNumber(weightKg, 1)} kg · Plan ${plan} · CDS: ${cdsScore}/8 · Evacuación: ${stoolType}`,
    };
  },
};
