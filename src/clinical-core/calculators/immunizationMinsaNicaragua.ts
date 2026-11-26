import {
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

const modeField: SelectFieldDef = {
  id: 'mode',
  label: 'Módulo de inmunización y profilaxis (MINSA Nicaragua)',
  type: 'select',
  defaultValue: 'esquema_edad',
  options: [
    { value: 'esquema_edad', label: 'Calendario Nacional de Vacunación MINSA por edad / grupo' },
    { value: 'tetanos_herida', label: 'Profilaxis antitetánica en heridas (urgencias / consulta)' },
    { value: 'rabia_exposicion', label: 'Profilaxis post-exposición antirrábica (mordedura / contacto)' },
  ],
};

const ageGroupField: SelectFieldDef = {
  id: 'ageGroup',
  label: 'Edad o grupo poblacional (Esquema PAI MINSA)',
  type: 'select',
  defaultValue: '2_meses',
  visibleWhen: (inputs) => inputs.mode === 'esquema_edad',
  options: [
    { value: 'rn', label: 'Recién nacido (< 24 horas de vida)' },
    { value: '2_meses', label: '2 meses de edad' },
    { value: '4_meses', label: '4 meses de edad' },
    { value: '6_meses', label: '6 meses de edad' },
    { value: '12_meses', label: '12 meses (1 año)' },
    { value: '18_meses', label: '18 meses (1 año y medio)' },
    { value: '6_anios', label: '6 años (edad escolar)' },
    { value: 'adolescente_vph', label: '9 – 14 años (VPH y dT a los 10 años)' },
    { value: 'embarazada', label: 'Mujer embarazada (cualquier trimestre)' },
    { value: 'adulto_riesgo', label: 'Adulto / ≥ 50 años o con enfermedad crónica' },
  ],
};

const newbornWeightField: NumberFieldDef = {
  id: 'newbornWeightG',
  label: 'Peso actual del recién nacido (para evaluar BCG)',
  type: 'number',
  canonicalUnit: 'g',
  units: [{ id: 'g', label: 'gramos (g)', toCanonical: (v) => v, min: 500, max: 6000, step: 50 }],
  defaultUnitId: 'g',
  defaultValue: '3000',
  required: false,
  min: 500,
  max: 6000,
  placeholder: '3000',
  visibleWhen: (inputs) => inputs.mode === 'esquema_edad' && inputs.ageGroup === 'rn',
  helpText: 'Norma MINSA: aplicar BCG si peso ≥ 2,000 g; si < 2,000 g posponer hasta alcanzar 2 kg.',
};

const infantAgeWeeksField: NumberFieldDef = {
  id: 'infantAgeWeeks',
  label: 'Edad exacta en semanas (control de límite de Rotavirus, opcional)',
  type: 'number',
  canonicalUnit: 'semanas',
  units: [{ id: 'sem', label: 'semanas', toCanonical: (v) => v, min: 4, max: 52, step: 1 }],
  defaultUnitId: 'sem',
  defaultValue: '',
  required: false,
  min: 4,
  max: 52,
  placeholder: '8',
  visibleWhen: (inputs) =>
    inputs.mode === 'esquema_edad' &&
    (inputs.ageGroup === '2_meses' || inputs.ageGroup === '4_meses' || inputs.ageGroup === '6_meses'),
  helpText: 'Límite máximo operativo para 1.ª dosis de Rotavirus: ≤ 15 semanas; última dosis: < 8 meses (< 32 semanas).',
};

const woundTypeField: SelectFieldDef = {
  id: 'woundType',
  label: 'Características de la herida',
  type: 'select',
  defaultValue: 'dirty',
  visibleWhen: (inputs) => inputs.mode === 'tetanos_herida',
  options: [
    { value: 'clean', label: 'Herida limpia y menor (no contaminada)' },
    { value: 'dirty', label: 'Herida sucia, contaminada con tierra/heces, punzante, mordedura, quemadura o tejido desvitalizado' },
  ],
};

const tetanusDosesField: SelectFieldDef = {
  id: 'tetanusDoses',
  label: 'Antecedente documentado de dosis previas de toxoide tetánico (Pentavalente/DPT/dT)',
  type: 'select',
  defaultValue: 'unknown_lt3',
  visibleWhen: (inputs) => inputs.mode === 'tetanos_herida',
  options: [
    { value: 'unknown_lt3', label: 'Desconocido o < 3 dosis previas' },
    { value: 'ge3_le5y', label: '≥ 3 dosis y última dosis hace ≤ 5 años' },
    { value: 'ge3_6_10y', label: '≥ 3 dosis y última dosis hace > 5 a 10 años' },
    { value: 'ge3_gt10y', label: '≥ 3 dosis y última dosis hace > 10 años' },
  ],
};

const rabiesCategoryField: SelectFieldDef = {
  id: 'rabiesCategory',
  label: 'Categoría de exposición al animal (OMS / MINSA)',
  type: 'select',
  defaultValue: 'cat3',
  visibleWhen: (inputs) => inputs.mode === 'rabia_exposicion',
  options: [
    { value: 'cat1', label: 'Categoría I — Tocar/alimentar animal o lamedura sobre piel intacta' },
    { value: 'cat2', label: 'Categoría II — Mordisqueo de piel descubierta o rasguño/erosión leve sin sangrado' },
    { value: 'cat3', label: 'Categoría III — Mordedura transdérmica, rasguño sangrante, lamedura en mucosa/piel lesionada o contacto con murciélago' },
  ],
};

const animalStatusField: SelectFieldDef = {
  id: 'animalStatus',
  label: 'Condición y observabilidad del animal agresor',
  type: 'select',
  defaultValue: 'unobservable',
  visibleWhen: (inputs) => inputs.mode === 'rabia_exposicion',
  options: [
    { value: 'observable_healthy', label: 'Perro/gato doméstico sano y observable por 10 días' },
    { value: 'unobservable', label: 'Animal callejero, desaparecido, sacrificado, silvestre, murciélago o con signos de rabia' },
  ],
};

const priorRabiesPrepField: BooleanFieldDef = {
  id: 'priorRabiesPrep',
  label: '¿Paciente con esquema antirrábico completo previo documentado?',
  type: 'boolean',
  defaultValue: false,
  visibleWhen: (inputs) => inputs.mode === 'rabia_exposicion',
};

interface ScheduleEntry {
  title: string;
  vaccinesCount: number;
  vaccinesSummary: string;
  severity: SeverityLevel;
  details: string[];
  routeAndSite: string;
  contraindicationsOrAlerts: string[];
}

const MINSA_SCHEDULE: Record<string, ScheduleEntry> = {
  rn: {
    title: 'Recién nacido (< 24 h)',
    vaccinesCount: 2,
    vaccinesSummary: 'BCG + Hepatitis B RN',
    severity: 'info',
    details: [
      'BCG (dosis única): previene formas graves de tuberculosis (meningitis TB y TB miliar). Aplicar solo si peso ≥ 2,000 g.',
      'Hepatitis B pediátrica (dosis al nacer): 0.5 mL IM dentro de las primeras 24 horas de vida (imprescindible en prevención de transmisión vertical).',
    ],
    routeAndSite: 'BCG: intradérmica en deltoides izquierdo. Hepatitis B: IM profunda en cara anterolateral externa del muslo derecho.',
    contraindicationsOrAlerts: [
      'Si el recién nacido pesa < 2,000 g: diferir BCG hasta alcanzar ≥ 2,000 g; la dosis de Hepatitis B al nacer se mantiene (< 24 h; si madre HBsAg+ añadir HBIG en < 12 h).',
    ],
  },
  '2_meses': {
    title: '2 meses de edad',
    vaccinesCount: 4,
    vaccinesSummary: 'Pentavalente 1 · Neumococo 13v 1 · Polio (fIPV/IPV) 1 · Rotavirus 1',
    severity: 'info',
    details: [
      'Pentavalente 1.ª dosis (DPT + HB + Hib): 0.5 mL IM profunda, muslo derecho.',
      'Neumococo 13-valente 1.ª dosis: 0.5 mL IM profunda, muslo izquierdo.',
      'Antipolio inyectada (fIPV / IPV 1.ª dosis según norma PAI): deltoides o muslo según presentación.',
      'Rotavirus 1.ª dosis: vía oral (aplicar solo antes de las 15 semanas de edad).',
    ],
    routeAndSite: 'Administrar en sitios anatómicos separados (mínimo 2.5 cm entre inyecciones en el mismo muslo).',
    contraindicationsOrAlerts: [
      'Límite estricto Rotavirus: no iniciar la 1.ª dosis si el lactante superó las 15 semanas de vida (riesgo de invaginación intestinal).',
    ],
  },
  '4_meses': {
    title: '4 meses de edad',
    vaccinesCount: 4,
    vaccinesSummary: 'Pentavalente 2 · Neumococo 13v 2 · Polio 2 · Rotavirus 2',
    severity: 'info',
    details: [
      'Pentavalente 2.ª dosis (DPT + HB + Hib): 0.5 mL IM profunda, muslo derecho.',
      'Neumococo 13-valente 2.ª dosis: 0.5 mL IM profunda, muslo izquierdo.',
      'Antipolio 2.ª dosis (fIPV o bOPV según esquema vigente de transición PAI).',
      'Rotavirus 2.ª dosis: vía oral (completar antes de los 8 meses de edad).',
    ],
    routeAndSite: 'Intervalo mínimo de 4–8 semanas respecto a las dosis de los 2 meses.',
    contraindicationsOrAlerts: [
      'Si el niño tuvo invaginación intestinal previa o inmunodeficiencia combinada grave (IDCG), Rotavirus está contraindicado.',
    ],
  },
  '6_meses': {
    title: '6 meses de edad',
    vaccinesCount: 4,
    vaccinesSummary: 'Pentavalente 3 · Neumococo 13v 3 · bOPV 3 · Influenza (6–23 m)',
    severity: 'info',
    details: [
      'Pentavalente 3.ª dosis (DPT + HB + Hib): 0.5 mL IM profunda, muslo derecho.',
      'Neumococo 13-valente 3.ª dosis: 0.5 mL IM profunda, muslo izquierdo.',
      'bOPV 3.ª dosis (antipolio oral bivalente): 2 gotas vía oral.',
      'Influenza estacional (6–23 meses): 1.ª dosis en campaña/temporada (requiere 2.ª dosis a las 4 semanas en primovacunación).',
    ],
    routeAndSite: 'Pentavalente y Neumococo en muslos separados; bOPV vía oral.',
    contraindicationsOrAlerts: [
      'Verificar carnet para asegurar que el esquema primario de 3 dosis de Pentavalente quede completo.',
    ],
  },
  '12_meses': {
    title: '12 meses (1 año)',
    vaccinesCount: 2,
    vaccinesSummary: 'SRP / MMR 1.ª dosis + Neumococo 13v (refuerzo)',
    severity: 'info',
    details: [
      'SRP / MMR 1.ª dosis (Sarampión, Rubéola y Parotiditis): 0.5 mL vía subcutánea en región deltoidea.',
      'Neumococo 13-valente refuerzo anual: 0.5 mL IM profunda.',
      'Influenza estacional: refuerzo anual si corresponde temporada.',
    ],
    routeAndSite: 'SRP subcutánea en brazo; Neumococo IM en muslo o deltoides según masa muscular.',
    contraindicationsOrAlerts: [
      'SRP es vacuna de virus vivos atenuados: contraindicada en inmunosupresión grave; tras gammaglobulina/hemoderivados respetar intervalo de espera.',
    ],
  },
  '18_meses': {
    title: '18 meses',
    vaccinesCount: 3,
    vaccinesSummary: 'DPT 1.er refuerzo · bOPV refuerzo · SRP 2.ª dosis',
    severity: 'info',
    details: [
      'DPT (1.er refuerzo de Difteria, Tos ferina y Tétanos): 0.5 mL IM (aplicar al menos 6–12 meses después de Pentavalente 3).',
      'bOPV (refuerzo antipolio oral): 2 gotas vía oral.',
      'SRP / MMR (2.ª dosis / refuerzo): 0.5 mL vía subcutánea en brazo.',
    ],
    routeAndSite: 'DPT IM; SRP SC; bOPV oral.',
    contraindicationsOrAlerts: [
      'Ante encefalopatía en los 7 días posteriores a una dosis previa de DPT/Pentavalente, suspender componente pertussis (usar DT pediátrica).',
    ],
  },
  '6_anios': {
    title: '6 años (edad escolar)',
    vaccinesCount: 1,
    vaccinesSummary: 'DPT 2.º refuerzo escolar',
    severity: 'info',
    details: [
      'DPT (2.º refuerzo escolar): 0.5 mL IM en región deltoidea.',
      'Revisar carnet para completar dosis pendientes de SRP o bOPV si hubiese esquemas atrasados.',
    ],
    routeAndSite: 'Intramuscular en región deltoidea (brazo).',
    contraindicationsOrAlerts: [
      'En niños ≥ 7 años con esquema incompleto NO usar DPT de dosis completa pertussis; continuar con dT de adulto.',
    ],
  },
  adolescente_vph: {
    title: '9 – 14 años (VPH y dT)',
    vaccinesCount: 2,
    vaccinesSummary: 'VPH (2 dosis) + dT (10 años)',
    severity: 'info',
    details: [
      'Vacuna contra VPH (9–14 años, campañas escolares MINSA): 2 dosis de 0.5 mL IM en deltoides (intervalo estándar 6 meses entre 1.ª y 2.ª dosis).',
      'Vacuna dT (Tétanos y Difteria): dosis escolar a los 10 años de edad (0.5 mL IM en deltoides).',
    ],
    routeAndSite: 'Intramuscular en deltoides (observar 15 minutos post-aplicación en adolescentes por riesgo de síncope vasovagal).',
    contraindicationsOrAlerts: [
      'Si el esquema de VPH inicia ≥ 15 años o en personas inmunocomprometidas (incluyendo VIH), se requieren 3 dosis (0, 1–2 y 6 meses).',
    ],
  },
  embarazada: {
    title: 'Embarazada',
    vaccinesCount: 2,
    vaccinesSummary: 'dT (protección materno-neonatal) + Influenza estacional',
    severity: 'moderate',
    details: [
      'dT (Toxoide diftérico-tetánico, 0.5 mL IM en deltoides): si cuenta con esquema básico infantil completo, aplicar 1 dosis de refuerzo en el embarazo (idealmente tras 20 SG / o primer contacto); si NO tiene antecedente vacunal, iniciar esquema MINSA de 5 dosis (0, 1 mes, 6 meses, 1 año, 1 año).',
      'Influenza estacional: 1 dosis de 0.5 mL IM en cualquier trimestre de gestación durante campaña/temporada.',
      'Nota clínica complementaria: donde haya disponibilidad de Tdap (dTpa), aplicarla entre las 27–36 SG de cada embarazo protege adicionalmente al neonato contra tos ferina.',
    ],
    routeAndSite: 'Intramuscular en región deltoidea.',
    contraindicationsOrAlerts: [
      'CONTRAINDICADA SRP (Triple Viral) y vacunas de virus vivos durante el embarazo; posponer hasta el puerperio inmediato.',
    ],
  },
  adulto_riesgo: {
    title: 'Adulto / ≥ 50 años o crónico',
    vaccinesCount: 3,
    vaccinesSummary: 'Neumococo 23v (≥ 50 años crónicos) + Influenza + dT',
    severity: 'info',
    details: [
      'Neumococo 23-valente (MINSA Nicaragua): 0.5 mL IM en deltoides para personas ≥ 50 años con enfermedades crónicas (cardiopatía, neumopatía, diabetes, ERC) según lineamiento anual.',
      'Influenza estacional: 1 dosis anual (0.5 mL IM) en ≥ 50–60 años, enfermedades crónicas y personal de salud.',
      'dT adulto: refuerzo cada 10 años (0.5 mL IM); en personas sin antecedente comprobado, esquema de 5 dosis MINSA (0, 1 m, 6 m, 1 año, 1 año).',
    ],
    routeAndSite: 'Intramuscular profunda en deltoides.',
    contraindicationsOrAlerts: [
      'En adultos con VIH o esplenectomía valorar esquemas conjugados + polisacáridos y evitar vacunas vivas si CD4 < 200 cél/µL.',
    ],
  },
};

export const immunizationMinsaNicaraguaCalculator: CalculatorDefinition = {
  id: 'immunization-minsa-nicaragua',
  name: 'Inmunizaciones (Normativa MINSA Nicaragua) y Profilaxis Tétanos / Rabia',
  shortName: 'Vacunas MINSA + Tétanos/Rabia',
  primarySpecialty: 'infectologia',
  secondarySpecialties: ['pediatria', 'medicina-interna', 'gineco-obstetricia', 'urgencias'],
  subcategory: 'dosificacion',
  keywords: [
    'vacunas',
    'inmunizacion',
    'minsa',
    'nicaragua',
    'pai',
    'bcg',
    'pentavalente',
    'rotavirus',
    'neumococo',
    'srp',
    'dpt',
    'dt',
    'vph',
    'tetanos',
    'rabia',
    'mordedura',
  ],
  description:
    'Consulta rápida del Esquema Nacional de Vacunación del MINSA Nicaragua (PAI / Norma Técnica 121) por edad y grupo de riesgo, más calculadora de profilaxis antitetánica y antirrábica en urgencias.',
  clinicalIndication:
    'Control de niño sano, atención prenatal, vacunación de adultos de riesgo y toma de decisiones en heridas o mordeduras en urgencias.',
  validatedPopulation:
    'Población pediátrica, adolescente, embarazada y adulta atendida bajo el Esquema Nacional PAI del MINSA Nicaragua y guías OMS de tétanos/rabia.',
  contraindications: [
    'Anafilaxia grave previa a un componente de la vacuna (contraindicación absoluta para dosis subsecuentes del mismo biológico).',
    'Vacunas de virus vivos atenuados (BCG, SRP/MMR, bOPV, Rotavirus) están contraindicadas en inmunodeficiencia celular grave; SRP está contraindicada en embarazo.',
  ],
  limitations: [
    'En campañas nacionales extraordinarias (Jornadas Nacionales de Vacunación, COVID-19 o cohortes específicas de VPH/Influenza) verificar circular operativa vigente del SILAIS local.',
    'La fiebre leve, catarro común o tratamiento antibiótico NO contraindican la vacunación.',
  ],
  version: 'Norma Técnica de Inmunizaciones PAI MINSA Nicaragua · OMS Tétanos/Rabia',
  references: [
    {
      citation:
        'Ministerio de Salud de Nicaragua (MINSA). Norma Técnica de Inmunizaciones (Norma 121) y Esquema Nacional de Vacunación del Programa Ampliado de Inmunizaciones (PAI). Managua: MINSA.',
      year: 2023,
    },
    {
      citation:
        'World Health Organization (WHO). Rabies vaccines: WHO position paper & Tetanus vaccines: WHO position paper. Weekly Epidemiological Record.',
      year: 2018,
    },
  ],
  fields: [
    modeField,
    ageGroupField,
    newbornWeightField,
    infantAgeWeeksField,
    woundTypeField,
    tetanusDosesField,
    rabiesCategoryField,
    animalStatusField,
    priorRabiesPrepField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(immunizationMinsaNicaraguaCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const mode = String(inputs.mode);

    if (mode === 'esquema_edad') {
      const ageGroup = String(inputs.ageGroup);
      const entry = MINSA_SCHEDULE[ageGroup];
      const guidance = [...entry.details, `Vía y sitio: ${entry.routeAndSite}`, ...entry.contraindicationsOrAlerts];
      let severity: SeverityLevel = entry.severity;
      let statusSummary = entry.vaccinesSummary;

      if (ageGroup === 'rn') {
        const weightG = getCanonicalNumberValue(
          newbornWeightField,
          inputs.newbornWeightG as NumberInputValue,
        ).canonicalValue;
        if (weightG !== null && weightG < 2000) {
          severity = 'high';
          statusSummary = 'DIFERIR BCG (< 2,000 g) · Aplicar Hepatitis B RN';
          guidance.unshift(
            `ALERTA PESO (${roundClinical(weightG, 0)} g < 2,000 g): Posponer BCG hasta alcanzar ≥ 2,000 g según Norma MINSA. Aplicar Hepatitis B RN dentro de las primeras 24 h.`,
          );
        }
      }

      if (ageGroup === '2_meses' || ageGroup === '4_meses' || ageGroup === '6_meses') {
        const ageW = getCanonicalNumberValue(
          infantAgeWeeksField,
          inputs.infantAgeWeeks as NumberInputValue,
        ).canonicalValue;
        if (ageW !== null && ageGroup === '2_meses' && ageW > 15 && ageW < 32) {
          severity = 'moderate';
          guidance.unshift(
            `ALERTA ROTAVIRUS (${ageW} semanas > 15 sem): NO iniciar 1.ª dosis de Rotavirus por límite superior normativo (riesgo de invaginación). Aplicar Pentavalente, Neumococo y Polio normalmente.`,
          );
        } else if (ageW !== null && ageW >= 32) {
          severity = 'moderate';
          guidance.unshift(
            `ALERTA ROTAVIRUS (${ageW} semanas ≥ 32 sem / ~8 meses): Contraindicado administrar o completar dosis de Rotavirus después de los 7 meses y 29 días.`,
          );
        }
      }

      return {
        primaryResult: {
          label: `Esquema MINSA — ${entry.title}`,
          value: entry.vaccinesCount,
          formattedValue: statusSummary,
          unit: '',
        },
        secondaryResults: [
          {
            label: 'Biológicos programáticos en la etapa',
            formattedValue: String(entry.vaccinesCount),
            unit: 'vacunas',
          },
          {
            label: 'Vía / logística',
            formattedValue: entry.routeAndSite,
            unit: '',
          },
        ],
        severity,
        riskClassification: `Normativa PAI MINSA Nicaragua · ${entry.title}`,
        clinicalInterpretation: entry.details.join(' '),
        guidance,
        guidanceDisclaimer:
          'Verificar siempre el carnet físico de vacunación y registrar dosis, lote y fecha en el sistema PAI.',
        formulaUsed: 'Esquema Nacional de Vacunación PAI — Norma Técnica MINSA Nicaragua',
        inputsSummary: `Grupo: ${entry.title}`,
      };
    }

    if (mode === 'tetanos_herida') {
      const isDirty = inputs.woundType === 'dirty';
      const doses = String(inputs.tetanusDoses);

      let needsVaccine = false;
      let needsTig = false;
      let severity: SeverityLevel = 'normal';
      let action = 'No requiere dT ni inmunoglobulina';
      const guidance: string[] = [];

      if (doses === 'unknown_lt3') {
        needsVaccine = true;
        needsTig = isDirty;
        severity = isDirty ? 'critical' : 'high';
        action = isDirty ? 'dT + TIG (250 UI IM)' : 'Aplicar dT (0.5 mL IM)';
        guidance.push(
          'Administrar dT 0.5 mL IM en deltoides y citar para completar esquema completo de 5 dosis MINSA (0, 1 mes, 6 meses, 1 año, 1 año).',
        );
        if (isDirty) {
          guidance.push(
            'Administrar Inmunoglobulina Antitetánica Humana (TIG) 250 UI IM en extremidad/sitio anatómico DISTINTO al de la vacuna (con jeringa separada).',
          );
        }
      } else if (doses === 'ge3_le5y') {
        needsVaccine = false;
        needsTig = false;
        severity = 'normal';
        action = 'Protegido (no requiere dT ni TIG)';
        guidance.push('Con ≥ 3 dosis y último refuerzo ≤ 5 años, el paciente está protegido incluso ante heridas sucias.');
      } else if (doses === 'ge3_6_10y') {
        needsVaccine = isDirty;
        needsTig = false;
        severity = isDirty ? 'moderate' : 'normal';
        action = isDirty ? 'Aplicar dT de refuerzo (sin TIG)' : 'No requiere dT ni TIG';
        guidance.push(
          isDirty
            ? 'Por herida contaminada y > 5 años desde el último refuerzo, administrar 1 dosis de dT 0.5 mL IM (NO requiere TIG).'
            : 'En herida limpia con ≥ 3 dosis y último refuerzo ≤ 10 años no requiere refuerzo inmediato.',
        );
      } else {
        needsVaccine = true;
        needsTig = false;
        severity = isDirty ? 'high' : 'moderate';
        action = 'Aplicar dT de refuerzo (sin TIG)';
        guidance.push('Por haber transcurrido > 10 años desde el último refuerzo, administrar 1 dosis de dT 0.5 mL IM.');
      }

      guidance.push('Limpieza quirúrgica exhaustiva, irrigación con SSN y desbridamiento de tejido desvitalizado son prioritarios en toda herida tetanígena.');

      const secondaryResults: SecondaryResultItem[] = [
        { label: 'Toxoide dT (0.5 mL IM)', formattedValue: needsVaccine ? 'INDICADO' : 'No necesario', unit: '' },
        { label: 'Inmunoglobulina (TIG 250 UI IM)', formattedValue: needsTig ? 'INDICADA (sitio distinto)' : 'No indicada', unit: '' },
      ];

      return {
        primaryResult: {
          label: 'Conducta Antitetánica',
          value: needsTig ? 2 : needsVaccine ? 1 : 0,
          formattedValue: action,
          unit: '',
        },
        secondaryResults,
        severity,
        riskClassification: isDirty ? 'Herida tetanígena / contaminada' : 'Herida limpia y menor',
        clinicalInterpretation: `Conducta definida por estado vacunal (${doses}) y tipo de herida.`,
        guidance,
        formulaUsed: 'Matriz de profilaxis antitetánica OMS / CDC / MINSA (tipo de herida × esquema vacunal)',
        inputsSummary: `Herida: ${isDirty ? 'Sucia/contaminada' : 'Limpia'} · Antecedente: ${doses}`,
      };
    }

    // rabia_exposicion
    const cat = String(inputs.rabiesCategory);
    const observable = inputs.animalStatus === 'observable_healthy';
    const priorPrep = Boolean(inputs.priorRabiesPrep);

    let severity: SeverityLevel = 'normal';
    let headline = 'Sin profilaxis biológica (solo lavado)';
    let needsVaccine = false;
    let needsRig = false;
    const guidance: string[] = [
      'LAVADO INMEDIATO de la herida con agua abundante y jabón durante al menos 15 minutos + antiséptico (povidona yodada o clorhexidina). Evitar sutura primaria si es posible.',
    ];

    if (cat === 'cat1') {
      severity = 'normal';
      headline = 'Categoría I — Solo lavado (NO PEP antirrábica)';
      guidance.push('El contacto sin ruptura de piel intacta no transmite rabia. No aplicar vacuna ni inmunoglobulina.');
    } else if (cat === 'cat2') {
      needsVaccine = true;
      needsRig = false;
      severity = observable ? 'moderate' : 'high';
      headline = priorPrep
        ? 'Categoría II — Refuerzo antirrábico (días 0 y 3, sin RIG)'
        : observable
          ? 'Categoría II — Vacuna antirrábica (suspender si animal sano al día 10)'
          : 'Categoría II — Esquema completo de Vacuna Antirrábica';
      guidance.push(
        priorPrep
          ? 'Con esquema previo completo: 2 dosis de refuerzo IM días 0 y 3; NO requiere inmunoglobulina antirrábica (RIG).'
          : 'Iniciar vacuna antirrábica humana IM en deltoides (esquema Essen 4–5 dosis: días 0, 3, 7, 14 [y 28] o esquema normado vigente MINSA). NO requiere RIG.',
      );
      if (observable && !priorPrep) {
        guidance.push('Si perro/gato permanece sano durante 10 días de observación estricta, puede interrumpirse la serie vacunal según protocolo.');
      }
    } else {
      needsVaccine = true;
      needsRig = !priorPrep;
      severity = 'critical';
      headline = priorPrep
        ? 'Categoría III (con PrEP previo) — Vacuna días 0 y 3 (sin RIG)'
        : 'Categoría III — URGENCIA: Vacuna Antirrábica + Inmunoglobulina (RIG)';
      if (priorPrep) {
        guidance.push('Paciente previamente inmunizado: administrar refuerzos IM días 0 y 3. No administrar RIG.');
      } else {
        guidance.push(
          'Iniciar DE INMEDIATO Vacuna Antirrábica Humana IM (deltoides) + Inmunoglobulina Antirrábica (RIG humana 20 UI/kg o equina 40 UI/kg) infiltrada alrededor y dentro de todas las heridas (resto IM en sitio anatómico diferente a la vacuna).',
        );
        guidance.push('Evaluar conjuntamente profilaxis antitetánica (dT) y amoxicilina-clavulanato si mordedura profunda/mano/cara.');
      }
    }

    return {
      primaryResult: {
        label: 'Profilaxis Post-Exposición Antirrábica',
        value: needsRig ? 3 : needsVaccine ? 2 : 1,
        formattedValue: headline,
        unit: '',
      },
      secondaryResults: [
        { label: 'Vacuna antirrábica humana', formattedValue: needsVaccine ? 'INDICADA' : 'No requerida', unit: '' },
        { label: 'Inmunoglobulina antirrábica (RIG)', formattedValue: needsRig ? 'INDICADA (infiltración local)' : 'No indicada', unit: '' },
      ],
      severity,
      riskClassification: `Exposición ${cat.toUpperCase()} · ${observable ? 'Animal observable' : 'Animal no observable / silvestre'}`,
      clinicalInterpretation:
        'La rabia clínica es casi 100 % mortal; la profilaxis post-exposición oportuna (lavado + vacuna ± RIG) previene la enfermedad con eficacia cercana al 100 %.',
      guidance,
      formulaUsed: 'Categorización OMS / MINSA de exposición rábica (Categorías I–III)',
      inputsSummary: `${cat.toUpperCase()} · Animal: ${observable ? 'Observable' : 'No observable'} · PrEP previo: ${priorPrep ? 'Sí' : 'No'}`,
    };
  },
};
