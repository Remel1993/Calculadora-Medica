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
} from '../types/clinical.ts';
import { WEIGHT_UNITS_KG } from '../units/converters.ts';

const pathogenField: SelectFieldDef = {
  id: 'pathogen',
  label: 'Fiebre hemorrágica viral o cuadro grave',
  type: 'select',
  defaultValue: 'yellow_fever',
  options: [
    {
      value: 'yellow_fever',
      label: 'Fiebre Amarilla (Flavivirus: fase tóxica, ictericia y Faget)',
    },
    {
      value: 'marburg',
      label: 'Enfermedad por Virus de Marburgo (Filovirus · BSL-4)',
    },
    {
      value: 'cchf',
      label: 'Fiebre Hemorrágica de Crimea-Congo (FHCC · Nairovirus)',
    },
    {
      value: 'hantavirus',
      label: 'Hantavirus: Síndrome Cardiopulmonar (SCPH) y FHSR',
    },
    {
      value: 'south_american_arenavirus',
      label: 'Arenavirus Sudamericanos (Junín / FHA, Machupo, Guanarito, Sabiá)',
    },
  ],
};

const weightField: NumberFieldDef = {
  id: 'weightKg',
  label: 'Peso del paciente (opcional — cálculo de dosis y bolos)',
  type: 'number',
  required: false,
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  defaultValue: '65',
  min: 3,
  max: 250,
  placeholder: 'Ej. 65',
  helpText:
    'Calcula dosis IV de Ribavirina por peso (FHCC/arenavirus) y referencia de bolo 20 mL/kg (contraindicado en exceso si SCPH por Hantavirus).',
};

const daysField: NumberFieldDef = {
  id: 'daysFromOnset',
  label: 'Días desde el inicio de síntomas',
  type: 'number',
  required: true,
  canonicalUnit: 'días',
  units: [
    {
      id: 'days',
      label: 'días',
      toCanonical: (v) => v,
      min: 1,
      max: 30,
      step: 1,
    },
  ],
  defaultUnitId: 'days',
  defaultValue: '4',
  min: 1,
  max: 30,
  placeholder: 'Ej. 4',
  helpText:
    'Crítico en Junín (plasma inmune ≤ 8 días) y FHCC/arenavirus (ventana temprana de Ribavirina ≤ 6 días).',
};

const severeFlagsField: BooleanFieldDef = {
  id: 'severeComplications',
  label: 'Complicaciones graves: hemorragia mucosa/GI, ictericia, AST/ALT > 5×, plaquetas < 50,000/µL, LRA, disnea/edema pulmonar o choque',
  type: 'boolean',
  defaultValue: false,
};

const pregnancyField: BooleanFieldDef = {
  id: 'pregnantOrHighRisk',
  label: 'Embarazo, inmunocompromiso o exposición ocupacional/vectorial de alto riesgo',
  type: 'boolean',
  defaultValue: false,
};

export const vhfCriticalSuiteCalculator: CalculatorDefinition = {
  id: 'vhf-critical-suite',
  name: 'Fiebres Hemorrágicas Virales de Importancia Médica (Marburgo, Fiebre Amarilla, FHCC, Hantavirus y Arenavirus)',
  shortName: 'Fiebres Hemorrágicas Graves',
  primarySpecialty: 'infectologia',
  secondarySpecialties: ['urgencias', 'medicina-interna', 'pediatria', 'gineco-obstetricia'],
  subcategory: 'diagnostico',
  keywords: [
    'fiebre hemorragica',
    'marburgo',
    'marburg',
    'fiebre amarilla',
    'yellow fever',
    'faget',
    'crimea congo',
    'fhcc',
    'cchf',
    'hantavirus',
    'scph',
    'fhsr',
    'junin',
    'machupo',
    'guanarito',
    'sabia',
    'arenavirus',
    'ribavirina',
  ],
  description:
    'Guía clínica operativa para las principales fiebres hemorrágicas virales y síndromes febriles graves (complementaria a Ébola y Lassa): incubación, criterios de gravedad, bioseguridad, restricciones hídricas en Hantavirus y esquemas específicos.',
  clinicalIndication:
    'Evaluación de emergencia, prevención de yatrogenia (p. ej. sobrecarga hídrica letal en SCPH por Hantavirus) y soporte específico en fiebres hemorrágicas virales.',
  validatedPopulation:
    'Adultos, población pediátrica y gestantes con sospecha o confirmación de fiebre hemorrágica viral en áreas endémicas o viajeros.',
  contraindications: [
    'CONTRAINDICADOS AINEs, ácido acetilsalicílico (AAS) e inyecciones intramusculares innecesarias por riesgo grave de hemorragia y disfunción plaquetaria.',
    'En Síndrome Cardiopulmonar por Hantavirus (SCPH): EVITAR cargas cristaloides repetidas sin monitoreo hemodinámico porque precipitan edema pulmonar agudo no cardiogénico mortal.',
    'La vacuna contra Fiebre Amarilla (cepa 17D viva atenuada) está CONTRAINDICADA en < 6 meses, inmunosupresión grave, enfermedad tímica/timoma y anafilaxia al huevo.',
  ],
  limitations: [
    'La eficacia de la ribavirina en Fiebre Hemorrágica de Crimea-Congo (FHCC) sigue siendo objeto de debate (evidencia principalmente observacional frente a ensayos pequeños heterogéneos), aunque sigue contemplada por OMS/clínica en casos tempranos graves.',
    'Las pruebas serológicas (IgM/IgG) pueden resultar negativas en los primeros 4–5 días; la confirmación temprana exige RT-PCR en centro de referencia con bioseguridad adecuada.',
  ],
  requiredLabsNote:
    'Biometría hemática (hematocrito/hemoconcentración, trombocitopenia, inmunoblastos en Hantavirus), AST/ALT, bilirrubinas, creatinina, fibrinógeno/TP/TTPa, EGO (proteinuria) y RT-PCR específica.',
  version: 'OMS Viral Haemorrhagic Fevers · CDC · OPS Fiebre Amarilla / Hantavirus',
  references: [
    {
      citation:
        'World Health Organization (WHO). Marburg virus disease, Yellow fever, and Crimean-Congo haemorrhagic fever: Clinical management and outbreak guidelines. Geneva: WHO.',
      year: 2023,
    },
    {
      citation:
        'Organización Panamericana de la Salud (OPS). Manejo clínico de la fiebre amarilla y guía para el diagnóstico y tratamiento del síndrome cardiopulmonar por hantavirus en las Américas. Washington, D.C.: OPS.',
      year: 2022,
    },
    {
      citation:
        'Centers for Disease Control and Prevention (CDC). Viral Hemorrhagic Fevers & Hantavirus Pulmonary Syndrome Clinical Guidance. Atlanta: CDC.',
      year: 2024,
    },
  ],
  fields: [pathogenField, weightField, daysField, severeFlagsField, pregnancyField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(vhfCriticalSuiteCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const pathogen = String(inputs.pathogen ?? 'yellow_fever');
    const weightKg = getCanonicalNumberValue(
      weightField,
      inputs.weightKg as NumberInputValue | undefined,
    ).canonicalValue;
    const days =
      getCanonicalNumberValue(daysField, inputs.daysFromOnset as NumberInputValue).canonicalValue ??
      4;
    const severe = inputs.severeComplications === true;
    const highRisk = inputs.pregnantOrHighRisk === true;

    const ribaLoad = weightKg !== null ? roundClinical(Math.min(weightKg * 30, 2000), 0) : null;
    const ribaD14 = weightKg !== null ? roundClinical(Math.min(weightKg * 16, 1000), 0) : null;
    const ribaD510 = weightKg !== null ? roundClinical(Math.min(weightKg * 8, 500), 0) : null;
    const bolus20Ml = weightKg !== null ? roundClinical(weightKg * 20, 0) : null;

    if (pathogen === 'hantavirus') {
      const secondaryResults: SecondaryResultItem[] = [
        {
          label: 'Estrategia hídrica crítica (SCPH)',
          formattedValue: 'Restricción hídrica + Vasopresores',
          unit: 'Evitar sobrecarga pulmonar',
          note: 'En SCPH la fuga capilar pulmonar es extrema; si choque, titular norepinefrina/dobutamina temprana y considerar ECMO venoarterial.',
        },
        {
          label: 'Diferencia clínica clave',
          formattedValue: 'SCPH (Américas) vs. FHSR (Eurasia)',
          unit: 'Andes / Sin Nombre vs. Hantaan / Dobrava',
        },
      ];
      return {
        primaryResult: {
          label: 'Alerta clínica Hantavirus',
          value: severe ? 3 : 2,
          formattedValue: severe ? 'SCPH / FHSR Grave (UCI)' : 'Sospecha de Hantavirus',
          unit: 'Incubación 1–8 semanas',
        },
        secondaryResults,
        severity: severe ? 'critical' : 'high',
        riskClassification: severe
          ? 'Síndrome Cardiopulmonar (SCPH) o FHSR Grave — Alto Riesgo de Edema Pulmonar/Choque'
          : 'Fase Prodrómica de Hantavirus — Monitorización Cardiorrespiratoria Estrecha',
        clinicalInterpretation:
          'Tras un pródromo febril de 3–5 días (fiebre, mialgias, náuseas, trombocitopenia + hemoconcentración + desviación izquierda e inmunoblastos > 10 %), el SCPH puede evolucionar en horas a edema pulmonar no cardiogénico y choque cardiogénico/distributivo.',
        guidance: [
          'En SCPH: NO administrar grandes bolos de cristaloides empíricos; mantener balance hídrico neutro/restrictivo, oxígeno temprano, intubación protectora si hipoxemia progresiva y traslado inmediato a centro con UCI/ECMO.',
          'En FHSR (Hantaan/Puumala/Dobrava): vigilar fase hipotensiva seguida de fase oligúrica (LRA aguda que puede requerir hemodiálisis) y fase poliúrica posterior con pérdida masiva de electrolitos.',
          'En virus Andes (Sudamérica), aplicar además precauciones estrictas de gotas/aerosoles ante casos documentados de transmisión persona-persona.',
        ],
        formulaUsed: 'Criterios clínicos SCPH/FHSR (OPS/CDC): Tríada hematológica + fuga capilar pulmonar o renal',
        inputsSummary: `Patógeno: Hantavirus · Día ${days} · Gravedad: ${severe ? 'Sí' : 'No'}`,
      };
    }

    if (pathogen === 'yellow_fever') {
      return {
        primaryResult: {
          label: 'Estadio clínico Fiebre Amarilla',
          value: severe ? 3 : 2,
          formattedValue: severe ? 'Fase de Intoxicación (Grave)' : 'Fase de Infección / Remisión',
          unit: 'Incubación 3–6 días',
        },
        secondaryResults: [
          {
            label: 'Marcador clásico hepatocelular',
            formattedValue: 'AST > ALT (a menudo > 1,000 U/L)',
            unit: 'Ictericia + albuminuria + Faget',
            note: 'La bradicardia relativa con fiebre alta (signo de Faget) y proteinuria intensa orientan temprano.',
          },
          {
            label: 'Prevención vacunal (cepa 17D)',
            formattedValue: '1 dosis SC/IM (protección de por vida)',
            unit: 'Contraindicada en < 6 m e inmunosupresión grave',
          },
        ],
        severity: severe ? 'critical' : 'high',
        riskClassification: severe
          ? 'Fiebre Amarilla en Fase Tóxica — Mortalidad 20–50 % (UCI)'
          : 'Fiebre Amarilla Sospechosa — Riesgo de Reaparición Tóxica tras Remisión',
        clinicalInterpretation:
          severe
            ? 'La fase de intoxicación (días 3–6 tras aparente mejoría breve) cursa con hepatitis necrotizante (AST > ALT), diátesis hemorrágica ("vómito negro"), lesión renal aguda, acidosis metabólica y encefalopatía.'
            : 'Hasta el 15–25 % de los pacientes evolucionan tras 24–48 h de aparente remisión hacia fase tóxica fulminante; todo caso sospechoso debe vigilarse en medio hospitalario.',
        guidance: [
          'Manejo en UCI sin antiviral específico aprobado: hidratación isotónica cuidadosa (corregir hipoglucemia frecuente por falla hepática), vitamina K + plasma/crioprecipitado solo si sangrado activo o procedimiento invasivo, IBP IV para profilaxis digestiva y terapia de reemplazo renal si oliguria/hiperpotasemia.',
          'Proteger al paciente bajo mosquitero los primeros 5 días febriles para cortar la transmisión urbana por Aedes aegypti y notificar inmediatamente a vigilancia epidemiológica.',
          'No administrar AINEs, AAS ni fármacos hepatotóxicos (evitar dosis altas de paracetamol si AST/ALT muy elevadas).',
        ],
        formulaUsed: 'Criterios clínicos OPS/OMS de Fiebre Amarilla (Fases Infección / Remisión / Intoxicación)',
        inputsSummary: `Patógeno: Fiebre Amarilla · Día ${days} · Signos de fase tóxica: ${severe ? 'Sí' : 'No'}`,
      };
    }

    if (pathogen === 'cchf') {
      const secondaryResults: SecondaryResultItem[] = [
        {
          label: 'Ribavirina IV (uso clínico OMS/endémico)',
          formattedValue:
            ribaLoad !== null
              ? `Carga ${formatClinicalNumber(ribaLoad, 0)} mg → ${formatClinicalNumber(ribaD14!, 0)} mg c/6 h`
              : 'Carga 30 mg/kg (máx 2 g) → 16 mg/kg c/6 h',
          unit:
            ribaD510 !== null
              ? `D5–10: ${formatClinicalNumber(ribaD510, 0)} mg IV c/8 h`
              : 'D5–10: 8 mg/kg IV c/8 h',
          note: 'Evidencia observacional de mayor beneficio en ≤ 4–6 días (resultados heterogéneos en ensayos; vigilar hemólisis).',
        },
        {
          label: 'Criterios de mal pronóstico (Swanepoel)',
          formattedValue: 'Plaq < 20k · AST ≥ 200 · TTPa ≥ 60 s',
          unit: 'Leucocitos ≥ 10,000/µL · Fibrinógeno ≤ 110 mg/dL',
        },
      ];
      return {
        primaryResult: {
          label: 'Riesgo clínico FHCC',
          value: severe ? 3 : 2,
          formattedValue: severe ? 'FHCC Grave / Coagulopatía' : 'FHCC Sospechosa / Temprana',
          unit: 'Incubación 1–13 días',
        },
        secondaryResults,
        severity: severe ? 'critical' : 'high',
        riskClassification: severe
          ? 'Fiebre Hemorrágica de Crimea-Congo Grave (Alto Riesgo Hemorrágico)'
          : 'Sospecha de FHCC — Aislamiento y Estudio Virológico Urgente',
        clinicalInterpretation:
          'Infección transmitida por garrapatas Hyalomma o fluidos de ganado/pacientes; destaca por trombocitopenia profunda, equimosis extensas en zonas de punción y alta transmisibilidad nosocomial.',
        guidance: [
          'Aislamiento estricto (contacto + gotas/EPP completo) y restricción absoluta de venopunciones innecesarias o inyecciones IM.',
          'Soporte transfusional guiado por sangrado y laboratorio (concentrado plaquetario si < 20,000–50,000/µL con sangrado, plasma fresco congelado o crioprecipitado si CID) y considerar Ribavirina IV temprana según protocolo institucional.',
        ],
        formulaUsed: 'Criterios Swanepoel/OMS de FHCC + régimen IV de Ribavirina por peso',
        inputsSummary: `Patógeno: FHCC · Día ${days} · Peso: ${weightKg !== null ? `${formatClinicalNumber(weightKg, 1)} kg` : 'N/E'}`,
      };
    }

    if (pathogen === 'south_american_arenavirus') {
      const withinPlasmaWindow = days <= 8;
      return {
        primaryResult: {
          label: 'Ventana terapéutica Arenavirus SA',
          value: withinPlasmaWindow ? 2 : 3,
          formattedValue: withinPlasmaWindow ? 'Ventana ≤ 8 días (Óptima)' : 'Presentación Tardía (> 8 d)',
          unit: 'Incubación 6–14 días',
        },
        secondaryResults: [
          {
            label: 'Junín (Fiebre Hemorrágica Argentina)',
            formattedValue: withinPlasmaWindow
              ? 'Plasma inmune específico ≤ 8 días'
              : 'Soporte intensivo (plasma > 8 d menos eficaz)',
            unit: 'Reduce mortalidad de 15–30 % a < 1–3 %',
            note: 'Vacuna preventiva Candid #1 en áreas endémicas de Argentina (contraindicada en embarazo e inmunocompromiso).',
          },
          {
            label: 'Machupo / Guanarito / Sabiá',
            formattedValue:
              ribaLoad !== null
                ? `Ribavirina IV: ${formatClinicalNumber(ribaLoad, 0)} mg carga`
                : 'Ribavirina IV 30 mg/kg carga',
            unit:
              ribaD14 !== null
                ? `${formatClinicalNumber(ribaD14, 0)} mg c/6 h D1–4 → ${formatClinicalNumber(ribaD510!, 0)} mg c/8 h D5–10`
                : 'Esquema estándar 10 días',
          },
        ],
        severity: severe || !withinPlasmaWindow ? 'critical' : 'high',
        riskClassification: 'Fiebre Hemorrágica por Arenavirus Sudamericano (Junín / Machupo / Guanarito / Sabiá)',
        clinicalInterpretation:
          'Combinación típica de fiebre, petequias en paladar/axilas, leucopenia (< 2,500/µL), trombocitopenia (< 100,000/µL) y signos neurológicos (ataxia, temblor lingual/manual, hiporreflexia).',
        guidance: [
          withinPlasmaWindow
            ? 'En Fiebre Hemorrágica Argentina (Junín): administrar plasma inmune de convaleciente titulado de inmediato (≤ 8 días del inicio); vigilar síndrome neurológico tardío benigno (10 % a las 3–6 semanas).'
            : 'Pasados los 8 días, el plasma inmune pierde eficacia y aumenta riesgo de síndrome neurológico; priorizar soporte crítico, hemoderivados si sangrado y control de sobreinfecciones.',
          'En Machupo (Bolivia), Guanarito (Venezuela) o Sabiá (Brasil): valorar Ribavirina IV temprana (≤ 6 días), aislamiento hospitalario y notificación epidemiológica urgente.',
        ],
        formulaUsed: 'Criterios clínicos OPS/ANLIS Maiztegui (plasma inmune ≤ 8 d) + esquema Ribavirina IV',
        inputsSummary: `Patógeno: Arenavirus SA · Día ${days} · Gravedad: ${severe ? 'Sí' : 'No'}`,
      };
    }

    // Marburg virus disease
    return {
      primaryResult: {
        label: 'Manejo Virus de Marburgo (BSL-4)',
        value: severe ? 3 : 2,
        formattedValue: severe ? 'Marburgo Grave / Choque' : 'Sospecha / Confirmado Marburgo',
        unit: 'Incubación 2–21 días',
      },
      secondaryResults: [
        {
          label: 'Reanimación inicial si choque',
          formattedValue:
            bolus20Ml !== null ? `${formatClinicalNumber(bolus20Ml, 0)} mL cristaloide` : '20 mL/kg IV',
          unit: 'Lactato de Ringer / SSN 0.9 %',
          note: 'Reponer pérdidas gastrointestinales masivas, K⁺, Mg²⁺ y glucosa; sin mAb específico comercial aprobado aún.',
        },
        {
          label: 'Alerta terapéutica crítica',
          formattedValue: 'NO usar mAb anti-Zaire (Ebanga/Inmazeb)',
          unit: 'No neutralizan filovirus Marburgo',
        },
      ],
      severity: severe ? 'critical' : highRisk ? 'high' : 'high',
      riskClassification: 'Enfermedad por Virus de Marburgo — Bioseguridad Máxima y Soporte Intensivo',
      clinicalInterpretation:
        'Filovirus de altísima letalidad (24–88 %) clínicamente superponible a Ébola, asociado a exposición a murciélagos frugívoros (Rousettus aegyptiacus) en cuevas/minas o fluidos humanos infectados.',
      guidance: [
        'Aislamiento estricto inmediato con EPP completo de barrera impermeable y toma de RT-PCR específica para Marburgvirus (repetir a las 72 h si negativa precoz).',
        'El soporte intensivo precoz (hidratación oral/IV agresiva, corrección electrolítica y cobertura empírica de malaria/bacteriemia mientras llegan resultados) es la medida con mayor impacto en supervivencia.',
        'En gestantes y sobrevivientes aplicar seguimiento de persistencia viral en semen/fluidos similar a EVE (≥ 12 meses o 2 PCR negativas).',
      ],
      formulaUsed: 'OMS Filovirus Guidelines: Aislamiento BSL-4 + Soporte hidroelectrolítico 20 mL/kg',
      inputsSummary: `Patógeno: Marburgo · Día ${days} · Gravedad: ${severe ? 'Sí' : 'No'}`,
    };
  },
};
