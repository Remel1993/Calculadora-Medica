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
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const modeField: SelectFieldDef = {
  id: 'mode',
  label: 'Modalidad preventiva',
  type: 'select',
  defaultValue: 'pep',
  options: [
    { value: 'pep', label: 'PEP — Profilaxis Post-Exposición (exposición reciente)' },
    { value: 'prep', label: 'PrEP — Profilaxis Pre-Exposición (prevención continua)' },
  ],
};

const hoursField: NumberFieldDef = {
  id: 'hoursSinceExposure',
  label: 'Tiempo transcurrido desde la exposición',
  type: 'number',
  canonicalUnit: 'h',
  units: [{ id: 'h', label: 'horas', toCanonical: (v) => v, min: 0.1, max: 240, step: 1 }],
  defaultUnitId: 'h',
  defaultValue: '12',
  visibleWhen: (inputs) => inputs.mode === 'pep',
  min: 0.1,
  max: 240,
  placeholder: '12',
  helpText: 'Ventana máxima estándar de eficacia: ≤ 72 horas (ideal < 2 horas).',
};

const exposureRiskField: SelectFieldDef = {
  id: 'exposureRisk',
  label: 'Tipo y riesgo de exposición',
  type: 'select',
  defaultValue: 'high',
  visibleWhen: (inputs) => inputs.mode === 'pep',
  options: [
    {
      value: 'high',
      label: 'Riesgo significativo (percutánea/mucosa con sangre/fluidos o sexo sin preservativo con fuente VIH+ detectable o desconocida de riesgo)',
    },
    {
      value: 'u_equals_u',
      label: 'Exposición sexual exclusiva con fuente VIH+ en TAR y Carga Viral INDETECTABLE (< 200 copias/mL)',
    },
    {
      value: 'negligible',
      label: 'Exposición sin riesgo (piel íntegra, saliva sin sangre, lágrimas, sudor, orina/heces sin sangre)',
    },
  ],
};

const crclField: NumberFieldDef = {
  id: 'renalCrCl',
  label: 'Aclaramiento de creatinina (Cockcroft-Gault)',
  type: 'number',
  canonicalUnit: 'mL/min',
  units: [{ id: 'ml_min', label: 'mL/min', toCanonical: (v) => v, min: 10, max: 200, step: 1 }],
  defaultUnitId: 'ml_min',
  defaultValue: '95',
  min: 10,
  max: 200,
  placeholder: '95',
  helpText: 'TDF/FTC requiere ClCr ≥ 60 mL/min (o ≥ 50 según ficha); TAF/FTC requiere ClCr ≥ 30 mL/min.',
};

const prepProfileField: SelectFieldDef = {
  id: 'prepProfile',
  label: 'Perfil clínico para PrEP',
  type: 'select',
  defaultValue: 'daily_general',
  visibleWhen: (inputs) => inputs.mode === 'prep',
  options: [
    { value: 'daily_general', label: 'PrEP diaria oral (sexo vaginal/anal o uso de drogas inyectables, ≥ 35 kg)' },
    { value: 'on_demand_211', label: 'PrEP a demanda 2-1-1 (solo HSH en sexo anal sin VHB crónica)' },
    { value: 'renal_bone', label: 'Alteración renal (ClCr 30–59 mL/min) u osteoporosis en HSH/mujer trans' },
  ],
};

const prepHivNegField: BooleanFieldDef = {
  id: 'prepHivNegConfirmed',
  label: '¿Prueba rápida o de 4.ª generación para VIH NEGATIVA documentada (y sin síntomas de síndrome retroviral agudo)?',
  type: 'boolean',
  defaultValue: true,
  visibleWhen: (inputs) => inputs.mode === 'prep',
};

export const hivPepPrepCalculator: CalculatorDefinition = {
  id: 'hiv-pep-prep',
  name: 'VIH: Profilaxis Post-Exposición (PEP) y Pre-Exposición (PrEP)',
  shortName: 'VIH: PEP y PrEP',
  primarySpecialty: 'infectologia',
  secondarySpecialties: ['urgencias', 'medicina-interna', 'gineco-obstetricia'],
  subcategory: 'dosificacion',
  keywords: [
    'pep',
    'prep',
    'vih',
    'exposicion',
    'accidente laboral',
    'pinchazo',
    'tenofovir',
    'tdf',
    'ftc',
    'dolutegravir',
    'indetectable',
    'violencia sexual',
    'ppe',
    'minsa',
    'nicaragua',
    'tld',
  ],
  description:
    'Evaluación de elegibilidad, ventana crítica de 72 horas, esquemas antirretrovirales (incluyendo PPE MINSA Nicaragua con TDF/3TC + DTG) y ajuste renal para PEP/PPE y PrEP.',
  clinicalIndication:
    'Atención urgente de accidentes biológicos ocupacionales, exposiciones sexuales sin preservativo/violencia sexual (PEP/PPE ≤ 72 h) e indicación preventiva en consulta externa (PrEP).',
  validatedPopulation: 'Adultos y adolescentes ≥ 35 kg VIH negativos.',
  contraindications: [
    'NUNCA iniciar PrEP (bitherapia TDF/FTC o TAF/FTC) sin descartar infección aguda o crónica por VIH, por alto riesgo de seleccionar mutaciones de resistencia (M184V/K65R).',
    'Evitar Tenofovir disoproxil fumarato (TDF) si ClCr < 60 mL/min; en insuficiencia renal usar TAF/FTC (ClCr ≥ 30 mL/min) o régimen alternativo con Infectología.',
  ],
  limitations: [
    'En exposición laboral percutánea con fuente VIH+ en TAR indetectable, aunque el riesgo es extremadamente bajo, los protocolos laborales (incl. MINSA) contemplan valoración individualizada de PPE.',
    'En embarazo, TDF/3TC (o TDF/FTC) + Dolutegravir o Raltegravir son esquemas aceptados para PPE (y TDF/FTC para PrEP diaria).',
  ],
  version: 'CDC nPEP/oPEP · CDC PrEP · WHO Consolidated Guidelines · MINSA Nicaragua PPE',
  references: [
    {
      citation:
        'Centers for Disease Control and Prevention (CDC). Updated Guidelines for Antiretroviral Postexposure Prophylaxis After Sexual, Injection Drug Use, or Other Nonoccupational Exposure to HIV — United States.',
      year: 2025,
    },
    {
      citation:
        'Centers for Disease Control and Prevention (CDC). US Public Health Service: Preexposure Prophylaxis for the Prevention of HIV Infection in the United States — 2021 Update.',
      year: 2021,
    },
    {
      citation:
        'Ministerio de Salud de Nicaragua (MINSA). Normativa de Atención Integral del VIH/SIDA y Profilaxis Post-Exposición (PPE ocupacional y por violencia sexual). Managua: MINSA.',
      year: 2023,
    },
  ],
  fields: [modeField, hoursField, exposureRiskField, prepProfileField, prepHivNegField, crclField],
  calculate(inputs: CalculatorInputsState) {
    const errors = validateCalculatorInputs(hivPepPrepCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors.map((e) => e.message).join(' '));
    }

    const mode = String(inputs.mode ?? 'pep');
    const crcl = roundClinical(
      getCanonicalNumberValue(crclField, inputs.renalCrCl as NumberInputValue).canonicalValue!,
      0,
    );

    if (mode === 'pep') {
      const hours = roundClinical(
        getCanonicalNumberValue(hoursField, inputs.hoursSinceExposure as NumberInputValue).canonicalValue!,
        1,
      );
      const risk = String(inputs.exposureRisk ?? 'high');

      if (risk === 'negligible' || risk === 'u_equals_u') {
        const isUu = risk === 'u_equals_u';
        return {
          primaryResult: {
            label: 'Indicación de PEP',
            value: 0,
            formattedValue: 'NO indicada PEP',
            unit: isUu ? 'Criterio I=I' : 'Riesgo despreciable',
          },
          secondaryResults: [
            { label: 'Tiempo desde exposición', formattedValue: `${formatClinicalNumber(hours, 1)} h`, unit: '' },
            { label: 'Seguimiento', formattedValue: isUu ? 'Tranquilizar y valorar PrEP si riesgo futuro' : 'Ninguno específico de VIH', unit: '' },
          ],
          severity: 'normal',
          riskClassification: isUu
            ? 'Exposición sexual sin riesgo de transmisión (Indetectable = Intransmisible)'
            : 'Exposición sin riesgo biológico para transmisión de VIH',
          clinicalInterpretation: isUu
            ? 'Cuando la fuente vive con VIH en tratamiento estable y mantiene carga viral indetectable (< 200 copias/mL), el riesgo de transmisión sexual es CERO (I=I / U=U). No se requiere PEP por exposición sexual consensuada (si hubo duda sobre adherencia o violencia sexual, ofrecer PEP ante incertidumbre).'
            : 'La piel íntegra o fluidos sin sangre visible (saliva, lágrimas, sudor, orina) NO transmiten VIH. No requiere PEP.',
          guidance: [
            'Considerar tamizaje basal de otras ITS (sífilis, gonorrea, clamidia) y vacunación VHB si exposición sexual no protegida.',
          ],
          formulaUsed: 'Evaluación CDC de tipo de fluido/vía de exposición + estado virológico fuente (I=I < 200 copias/mL)',
          inputsSummary: `Modo=PEP, Horas=${formatClinicalNumber(hours, 1)} h, Riesgo=${risk}`,
        };
      }

      if (hours > 72) {
        return {
          primaryResult: {
            label: 'Indicación de PEP',
            value: 0,
            formattedValue: 'Fuera de ventana (> 72 h)',
            unit: `${formatClinicalNumber(hours, 1)} h`,
          },
          secondaryResults: [
            { label: 'Límite máximo estándar', formattedValue: '≤ 72 horas', unit: '' },
            { label: 'Seguimiento serológico', formattedValue: 'Basal, 4–6 sem y 12 sem', unit: '' },
          ],
          severity: 'high',
          riskClassification: `Exposición de riesgo fuera de ventana PEP (${formatClinicalNumber(hours, 1)} h > 72 h)`,
          clinicalInterpretation:
            'Han transcurrido > 72 horas desde la exposición: la PEP estándar NO está recomendada porque pierde eficacia biológica una vez establecida la diseminación sistémica inicial.',
          guidance: [
            'Realizar serología basal de VIH (4.ª generación; idealmente añadir ARN-VIH si exposición muy reciente o síntomas agudos), VHB, VHC y sífilis.',
            'Repetir prueba de VIH a las 4–6 semanas y a las 12 semanas (3 meses) post-exposición; ofrecer PrEP si persiste riesgo futuro tras confirmar VIH negativo.',
          ],
          formulaUsed: 'Regla temporal CDC/OMS PEP: inicio efectivo ≤ 72 horas post-exposición',
          inputsSummary: `Modo=PEP, Horas=${formatClinicalNumber(hours, 1)} h, ClCr=${crcl} mL/min`,
        };
      }

      const renalAlt = crcl < 60;
      const regimen = renalAlt
        ? crcl >= 30
          ? 'TAF/FTC 25/200 mg + Dolutegravir 50 mg VO c/24 h (o BIC/FTC/TAF c/24 h) × 28 días'
          : 'ClCr < 30 mL/min: ajustar NRTI con Infectología (ej. AZT/3TC ajustados a TFG + Dolutegravir 50 mg/d) × 28 días'
        : 'TDF/3TC 300/300 mg (esquema TLD MINSA) o TDF/FTC 300/200 mg VO c/24 h + Dolutegravir 50 mg VO c/24 h (alternativa BIC/FTC/TAF o TDF/FTC + RAL 400 mg c/12 h) × 28 días';

      return {
        primaryResult: {
          label: 'Indicación de PEP',
          value: 28,
          formattedValue: 'INICIAR PEP URGENTE',
          unit: '28 días',
        },
        secondaryResults: [
          { label: 'Ventana transcurrida', formattedValue: `${formatClinicalNumber(hours, 1)} h (≤ 72 h)`, unit: '' },
          { label: 'Ajuste renal', formattedValue: renalAlt ? `Evitar TDF (ClCr ${crcl} mL/min)` : `Estándar (ClCr ${crcl} mL/min)`, unit: '' },
        ],
        severity: 'critical',
        riskClassification: `PEP / PPE INDICADA · Iniciar 1.ª dosis inmediatamente (${formatClinicalNumber(hours, 1)} h)`,
        clinicalInterpretation: `Exposición de riesgo dentro de la ventana de 72 horas (${formatClinicalNumber(hours, 1)} h). Iniciar primera dosis DE INMEDIATO (ideal < 2 h) sin esperar resultados basales de laboratorio (salvo prueba rápida VIH inmediata en punto de atención) y completar 28 días.`,
        guidance: [
          `Esquema recomendado: ${regimen}.`,
          'Laboratorios basales obligatorios: VIH (prueba rápida / 4.ª generación), HBsAg/anti-HBs, VHC, sífilis, creatinina/transaminasas y prueba de embarazo en mujer en edad fértil.',
          'Si exposición sexual/violencia sexual: añadir profilaxis de ITS (ej. Ceftriaxona + Doxiciclina/Azitromicina) y anticoncepción de emergencia si procede; en accidente laboral evaluar vacuna/Ig VHB (HBIG).',
          'Seguimiento serológico VIH: control a las 6 semanas, 3 meses (12 sem) y 6 meses según normativa institucional MINSA (especialmente si fuente VHC+ o duda de seroconversión tardía).',
        ],
        formulaUsed: 'PEP/PPE CDC · OMS · MINSA Nicaragua: 3 fármacos activos ≤ 72 h × 28 días con ajuste por ClCr',
        inputsSummary: `Modo=PEP, Horas=${formatClinicalNumber(hours, 1)} h, ClCr=${crcl} mL/min`,
      };
    }

    // PrEP mode
    const prepProfile = String(inputs.prepProfile ?? 'daily_general');
    const hivNegConfirmed = Boolean(inputs.prepHivNegConfirmed);

    if (!hivNegConfirmed) {
      return {
        primaryResult: {
          label: 'Elegibilidad PrEP',
          value: 0,
          formattedValue: 'DIFERIR PrEP (Descartar VIH)',
          unit: 'Requisito obligatorio',
        },
        secondaryResults: [
          { label: 'Acción inmediata', formattedValue: 'Prueba VIH 4.ª gen ± ARN-VIH', unit: '' },
        ],
        severity: 'critical',
        riskClassification: 'CONTRAINDICADO iniciar PrEP sin prueba de VIH negativa reciente',
        clinicalInterpretation:
          'No puede prescribirse PrEP (bitherapia NRTI) sin confirmar estado VIH negativo y ausencia de síntomas de infección aguda (fiebre, exantema, odinofagia, adenopatías tras exposición reciente), por riesgo de resistencia viral.',
        guidance: [
          'Solicitar prueba combinada Ag/Ac de 4.ª generación (y ARN-VIH si exposición en últimas 2–4 semanas o síntomas virales).',
          'Si la exposición fue hace ≤ 72 h, iniciar PEP triple (3 fármacos) en lugar de PrEP.',
        ],
        formulaUsed: 'Regla de seguridad PrEP CDC/OMS: exclusión obligatoria de infección por VIH previa',
        inputsSummary: `Modo=PrEP, VIH neg=No, ClCr=${crcl} mL/min`,
      };
    }

    let prepRegimen = 'TDF/FTC 300/200 mg VO 1 comp/día (oral diaria)';
    let severity: SeverityLevel = 'normal';

    if (crcl < 30) {
      prepRegimen = 'PrEP oral con TDF/FTC o TAF/FTC CONTRAINDICADA con ClCr < 30 mL/min (valorar Cabotegravir IM en centro especializado)';
      severity = 'high';
    } else if (prepProfile === 'renal_bone' || crcl < 60) {
      prepRegimen =
        'Evitar TDF (ClCr 30–59 mL/min o enfermedad ósea): usar TAF/FTC 25/200 mg VO c/24 h (aprobada en HSH/mujeres trans; NO usar TAF ni 2-1-1 para sexo vaginal receptivo)';
      severity = 'moderate';
    } else if (prepProfile === 'on_demand_211') {
      prepRegimen =
        'Esquema 2-1-1 (solo HSH en sexo anal, sin VHB crónica): 2 comp TDF/FTC 2–24 h antes del sexo + 1 comp a las 24 h + 1 comp a las 48 h';
      severity = 'low';
    }

    return {
      primaryResult: {
        label: 'Elegibilidad PrEP',
        value: 1,
        formattedValue: crcl < 30 ? 'No apto vía oral (ClCr < 30)' : 'APTO para PrEP',
        unit: crcl < 30 ? 'ClCr < 30' : 'VIH (-) confirmado',
      },
      secondaryResults: [
        { label: 'Esquema indicado', formattedValue: prepRegimen, unit: '' },
        { label: 'Control serológico y renal', formattedValue: 'VIH c/3 meses · ClCr c/6–12 m', unit: '' },
      ],
      severity,
      riskClassification:
        crcl < 30
          ? 'Contraindicación renal para PrEP oral (ClCr < 30 mL/min)'
          : 'Elegible para PrEP oral con seguimiento trimestral',
      clinicalInterpretation: `${prepRegimen}. En sexo anal receptivo la PrEP diaria con TDF/FTC alcanza protección óptima tras ~7 días; en sexo vaginal receptivo o uso de drogas inyectables requiere ~20–21 días de tomas diarias previas.`,
      guidance: [
        'Basal obligatorio: VIH 4.ª generación (-), creatinina sérica (ClCr), antígeno de superficie VHB (HBsAg) y tamizaje de ITS (sífilis, gonorrea, clamidia).',
        'Si HBsAg (+): NO usar esquema intermitente 2-1-1 por riesgo de rebote hepático grave al suspender TDF; utilizar pauta diaria continua con seguimiento hepatológico.',
        'Repetir prueba de VIH cada 3 meses antes de renovar prescripción y tamizaje de ITS c/3–6 meses.',
      ],
      formulaUsed: 'Guía CDC/OMS PrEP: TDF/FTC (ClCr ≥ 60) vs. TAF/FTC (ClCr ≥ 30 en HSH/trans) vs. 2-1-1',
      inputsSummary: `Modo=PrEP, Perfil=${prepProfile}, ClCr=${crcl} mL/min`,
    };
  },
};
