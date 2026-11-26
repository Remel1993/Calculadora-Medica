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

const scenarioField: SelectFieldDef = {
  id: 'scenario',
  label: 'Escenario clínico',
  type: 'select',
  defaultValue: 'triage_contacto',
  options: [
    {
      value: 'triage_contacto',
      label: 'Caso sospechoso / Triaje y contacto (≤ 21 días)',
      description: 'Evaluación inicial, definición de caso, aislamiento y toma de RT-PCR.',
    },
    {
      value: 'enfermedad_confirmada',
      label: 'EVE confirmada (Zaire ebolavirus): mAb y reposición hídrica',
      description: 'Cálculo de ansuvimab / REGN-EB3 y soporte hidroelectrolítico.',
    },
    {
      value: 'embarazo_lactancia',
      label: 'Embarazo, parto o lactancia materna en EVE',
      description: 'Consideraciones obstétricas, aislamiento y manejo neonatal.',
    },
  ],
};

const weightField: NumberFieldDef = {
  id: 'weightKg',
  label: 'Peso del paciente (opcional — cálculo de anticuerpos y bolos)',
  type: 'number',
  required: false,
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  defaultValue: '60',
  min: 2,
  max: 250,
  placeholder: 'Ej. 60',
  helpText:
    'Permite calcular dosis exacta de ansuvimab (50 mg/kg IV), REGN-EB3 (50 mg/kg de cada componente IV) y bolo cristaloide (20 mL/kg).',
};

const exposureField: BooleanFieldDef = {
  id: 'epiExposure',
  label: 'Exposición epidemiológica ≤ 21 días (contacto con caso confirmado/sospechoso, fluidos, funeral o área con brote)',
  type: 'boolean',
  defaultValue: false,
};

const feverField: BooleanFieldDef = {
  id: 'fever',
  label: 'Fiebre ≥ 38.0 °C (o antecedente febril reciente) + síntomas inespecíficos (astenia, mialgias, cefalea)',
  type: 'boolean',
  defaultValue: false,
};

const giLossField: BooleanFieldDef = {
  id: 'giLoss',
  label: 'Pérdidas gastrointestinales importantes (diarrea acuosa profusa o vómitos persistentes)',
  type: 'boolean',
  defaultValue: false,
};

const severityField: BooleanFieldDef = {
  id: 'bleedingOrShock',
  label: 'Signos de gravedad: sangrado inexplicable, choque/hipotensión, oliguria, hipoglucemia o encefalopatía',
  type: 'boolean',
  defaultValue: false,
};

export const ebolaVirusCalculator: CalculatorDefinition = {
  id: 'ebola-virus',
  name: 'Enfermedad por Virus del Ébola (EVE): Triaje, Terapia mAb y Soporte (OMS / CDC)',
  shortName: 'Virus del Ébola (EVE)',
  primarySpecialty: 'infectologia',
  secondarySpecialties: ['urgencias', 'medicina-interna', 'pediatria'],
  subcategory: 'diagnostico',
  keywords: [
    'ebola',
    'ébola',
    'ebov',
    'eve',
    'filovirus',
    'fiebre hemorragica',
    'ansuvimab',
    'mab114',
    'ebanga',
    'regn-eb3',
    'inmazeb',
    'ervebo',
    'rvsv-zebov',
    'rt-pcr',
  ],
  description:
    'Herramienta de evaluación clínica, bioseguridad, cálculo por peso de anticuerpos monoclonales específicos (ansuvimab y REGN-EB3 para Zaire ebolavirus) y reposición hidroelectrolítica según OMS y CDC.',
  clinicalIndication:
    'Triaje de casos sospechosos con antecedente epidemiológico (incubación 2–21 días) y cálculo de terapia específica y reanimación en Enfermedad por Virus del Ébola.',
  validatedPopulation:
    'Adultos, población pediátrica y gestantes en contacto o manejo de Enfermedad por Virus del Ébola (OMS Therapeutics 2022 / CDC).',
  contraindications: [
    'No utilizar anticuerpos monoclonales anti-Zaire (ansuvimab o REGN-EB3) asumiendo eficacia frente a otras especies de filovirus (Sudan ebolavirus, Bundibugyo o virus de Marburgo), ya que son específicos de Zaire ebolavirus.',
    'CONTRAINDICADOS AINEs (ibuprofeno, diclofenaco, ketorolaco), ácido acetilsalicílico (AAS) e inyecciones intramusculares innecesarias por riesgo grave de hemorragia digestiva y coagulopatía.',
  ],
  limitations: [
    'Un resultado de RT-PCR negativo en las primeras 48–72 horas de síntomas NO descarta EVE; repetir RT-PCR a las 72 h de inicio clínico si persiste sospecha.',
    'La persona infectada NO es contagiosa durante el período de incubación asintomático (2–21 días; media 8–10 días); la transmisión ocurre por contacto directo con sangre o fluidos corporales desde el inicio de síntomas.',
  ],
  requiredLabsNote:
    'Confirmación por RT-PCR en sangre total (o hisopado oral en fallecidos) bajo bioseguridad BSL-3/4; vigilar electrolitos (K⁺, Na⁺, Mg²⁺), glucemia, función renal, AST/ALT y coagulación.',
  version: 'OMS Ebola Therapeutics 2022 · OMS Clinical Management · CDC 2024',
  references: [
    {
      citation:
        'World Health Organization (WHO). Therapeutics for Ebola virus disease. Geneva: WHO; August 2022.',
      year: 2022,
    },
    {
      citation:
        'World Health Organization (WHO). Clinical management of patients with viral haemorrhagic fever: a pocket guide for front-line health workers. Geneva: WHO.',
      year: 2016,
    },
    {
      citation:
        'Centers for Disease Control and Prevention (CDC). Ebola Disease: Clinical Guidance, Diagnosis, and Treatment (Ebanga / Inmazeb / Ervebo). Atlanta: CDC.',
      year: 2024,
    },
  ],
  fields: [scenarioField, weightField, exposureField, feverField, giLossField, severityField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(ebolaVirusCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const scenario = String(inputs.scenario ?? 'triage_contacto');
    const weightKg = getCanonicalNumberValue(
      weightField,
      inputs.weightKg as NumberInputValue | undefined,
    ).canonicalValue;
    const epiExposure = inputs.epiExposure === true;
    const fever = inputs.fever === true;
    const giLoss = inputs.giLoss === true;
    const bleedingOrShock = inputs.bleedingOrShock === true;

    const secondaryResults: SecondaryResultItem[] = [];

    if (weightKg !== null) {
      const ansuvimabMg = roundClinical(weightKg * 50, 0);
      const regnEachMg = roundClinical(weightKg * 50, 0);
      const regnTotalMg = roundClinical(weightKg * 150, 0);
      const bolus20Ml = roundClinical(weightKg * 20, 0);

      secondaryResults.push(
        {
          label: 'Ansuvimab-zykl (mAb114 / Ebanga®)',
          formattedValue: `${formatClinicalNumber(ansuvimabMg, 0)} mg IV DU`,
          unit: `50 mg/kg × ${formatClinicalNumber(weightKg, 1)} kg`,
          note: 'Infusión IV única en 60 min (recomendación fuerte OMS en Zaire ebolavirus confirmado).',
        },
        {
          label: 'REGN-EB3 (Atoltivimab/Maftivimab/Odesivimab · Inmazeb®)',
          formattedValue: `${formatClinicalNumber(regnEachMg, 0)} mg c/u IV DU`,
          unit: `50/50/50 mg/kg (${formatClinicalNumber(regnTotalMg, 0)} mg totales)`,
          note: 'Infusión IV única (aprox. 2 horas); alternativa de primera línea equivalente a ansuvimab en Zaire ebolavirus.',
        },
        {
          label: 'Bolo cristaloide isotónico (si choque/hipoperfusión)',
          formattedValue: `${formatClinicalNumber(bolus20Ml, 0)} mL`,
          unit: `20 mL/kg (Lactato de Ringer o SSN 0.9 %)`,
          note: 'Reevaluar perfusión, crepitantes y diuresis tras cada bolo; reponer pérdidas GI volumen a volumen.',
        },
      );
    } else {
      secondaryResults.push(
        {
          label: 'Terapia mAb OMS (Zaire ebolavirus)',
          formattedValue: '50 mg/kg IV DU',
          unit: 'Ansuvimab o REGN-EB3 (50 mg/kg de cada mAb)',
          note: 'Ingrese peso en kg para calcular la dosis total en mg.',
        },
        {
          label: 'Bolo inicial en choque',
          formattedValue: '20 mL/kg IV',
          unit: 'Lactato de Ringer / SSN 0.9 %',
          note: 'Ingrese peso para obtener volumen en mL.',
        },
      );
    }

    if (scenario === 'embarazo_lactancia') {
      return {
        primaryResult: {
          label: 'Protocolo EVE en Gestación / Lactancia',
          value: bleedingOrShock ? 3 : 2,
          formattedValue: 'Alto riesgo materno-fetal',
          unit: 'Aislamiento + mAb + soporte intensivo',
        },
        secondaryResults,
        severity: bleedingOrShock ? 'critical' : 'high',
        riskClassification: 'EVE en Embarazo / Lactancia — Prioridad Obstétrica y Bioseguridad',
        clinicalInterpretation:
          'La EVE durante el embarazo conlleva elevada mortalidad materna y altísima tasa de pérdida fetal/infección neonatal; placenta, líquido amniótico y leche materna contienen alta carga viral.',
        guidance: [
          'OMS 2022: administrar ansuvimab (50 mg/kg IV DU) o REGN-EB3 (150 mg/kg totales IV DU) en gestantes con Zaire ebolavirus confirmado (el beneficio materno-fetal supera los riesgos teóricos).',
          'Atención obstétrica solo en centro de tratamiento con EPP completo de barrera impermeable; evitar episiotomías, fórceps o maniobras invasivas innecesarias y planificar hemostasia uterina activa.',
          'Lactancia materna: suspender lactancia directa mientras exista sospecha o EVE confirmada (reemplazar por sucedáneo seguro) hasta confirmar negativización viral en leche materna según protocolo OMS.',
          'Recién nacido de madre con EVE: alto riesgo de infección congénita/perinatal; aislar, evaluar RT-PCR neonatal y considerar tratamiento precoz con mAb si positivo.',
        ],
        formulaUsed: 'Protocolo OMS EVE en embarazo (mAb 50 mg/kg IV DU + soporte cristaloide 20 mL/kg)',
        inputsSummary: `Escenario: Embarazo/lactancia · Peso: ${weightKg !== null ? `${formatClinicalNumber(weightKg, 1)} kg` : 'no especificado'}`,
      };
    }

    if (scenario === 'enfermedad_confirmada' || bleedingOrShock) {
      return {
        primaryResult: {
          label: 'Estado clínico EVE',
          value: bleedingOrShock ? 3 : 2,
          formattedValue: bleedingOrShock ? 'EVE Crítica / Choque' : 'EVE Confirmada',
          unit: bleedingOrShock ? 'Soporte intensivo + mAb' : 'Terapia específica OMS',
        },
        secondaryResults,
        severity: bleedingOrShock ? 'critical' : 'high',
        riskClassification: bleedingOrShock
          ? 'Enfermedad por Virus del Ébola Grave / Choque Hipovolémico-Séptico'
          : 'Enfermedad por Virus del Ébola Confirmada (Tratamiento Específico)',
        clinicalInterpretation:
          bleedingOrShock
            ? 'Compromiso hemodinámico, hemorragia o disfunción orgánica. La hipovolemia por pérdidas gastrointestinales masivas y la hipokalemia/hipoglucemia son las principales causas reversibles de mortalidad.'
            : 'Caso confirmado de EVE (Zaire ebolavirus). La administración temprana de ansuvimab o REGN-EB3 junto con rehidratación agresiva reduce sustancialmente la mortalidad.',
        guidance: [
          'Iniciar lo antes posible ansuvimab (mAb114, 50 mg/kg IV dosis única) o REGN-EB3 (50/50/50 mg/kg IV dosis única); NO combinar ambos esquemas (OMS 2022).',
          'Rehidratación agresiva: SRO en pérdidas leves-moderadas sin vómitos; Lactato de Ringer (o SSN 0.9 %) IV en intolerancia oral, diarrea profusa (> 4–5 L/día posibles) o choque, corrigiendo K⁺, Mg²⁺ y glucemia.',
          'Cobertura empírica de sobreinfecciones frecuentes en zona endémica (antipalúdicos y antibióticos de amplio espectro si choque o fiebre persistente tras estabilización inicial) hasta descartar malaria/bacteriemia.',
          'Control de infecciones: aislamiento estricto, EPP completo, manejo seguro de excretas/cadáveres y consejería de supervivencia (persistencia viral en semen: preservativo/abstinencia ≥ 12 meses o 2 PCR negativas).',
        ],
        formulaUsed: 'OMS 2022 (Ansuvimab 50 mg/kg IV o REGN-EB3 150 mg/kg IV) + Reanimación 20 mL/kg',
        inputsSummary: `Escenario: ${scenario} · Choque/sangrado: ${bleedingOrShock ? 'Sí' : 'No'} · Pérdidas GI: ${giLoss ? 'Sí' : 'No'}`,
      };
    }

    const meetsSuspectPattern = epiExposure && (fever || giLoss);
    const feverOnlyWarning = !epiExposure && (fever || giLoss);

    return {
      primaryResult: {
        label: 'Resultado de triaje EVE',
        value: meetsSuspectPattern ? 2 : epiExposure ? 1 : 0,
        formattedValue: meetsSuspectPattern
          ? 'Caso Sospechoso'
          : epiExposure
            ? 'Contacto en Vigilancia'
            : 'Bajo riesgo epidemiológico',
        unit: meetsSuspectPattern
          ? 'Aislar + RT-PCR'
          : epiExposure
            ? 'Seguimiento 21 días'
            : 'Descartar causas comunes',
      },
      secondaryResults,
      severity: meetsSuspectPattern ? 'high' : epiExposure ? 'moderate' : 'low',
      riskClassification: meetsSuspectPattern
        ? 'Caso Sospechoso de EVE — Aislamiento Inmediato y Notificación'
        : epiExposure
          ? 'Contacto Asintomático (Período de Incubación 2–21 días)'
          : feverOnlyWarning
            ? 'Cuadro Febril sin Nexo Epidemiológico para Ébola'
            : 'Sin criterios de sospecha de EVE',
      clinicalInterpretation: meetsSuspectPattern
        ? 'Cumple definición operativa de caso sospechoso (fiebre/síntomas compatibles + nexo epidemiológico ≤ 21 días). Requiere aislamiento inmediato, notificación a vigilancia epidemiológica y RT-PCR.'
        : epiExposure
          ? 'Exposición epidemiológica sin síntomas febriles ni GI actuales. No transmite el virus mientras permanezca asintomático; requiere monitoreo térmico diario durante 21 días desde la última exposición.'
          : 'Sin nexo epidemiológico compatible en los últimos 21 días; investigar etiologías prevalentes locales (malaria, dengue, fiebre tifoidea, leptospirosis).',
      guidance: meetsSuspectPattern
        ? [
            'Aislar inmediatamente en habitación individual con precauciones de contacto y gotas/aerosoles ante procedimientos generadores; activar notificación urgente a salud pública.',
            'Solicitar RT-PCR para filovirus y descartar malaria/sepsis concomitante sin retrasar EPP; si la primera RT-PCR fue tomada < 72 h de inicio y sale negativa, repetir a las 72 h antes de retirar aislamiento.',
            'Evaluar vacunación en anillo con Ervebo® (rVSV-ZEBOV) para contactos elegibles según autoridad sanitaria.',
          ]
        : [
            'Vigilancia activa por 21 días desde el último contacto de riesgo (control térmico 2 veces/día) y educación para consulta inmediata (sin transporte público) si aparece fiebre ≥ 38.0 °C.',
            'Valorar elegibilidad para vacuna rVSV-ZEBOV (Ervebo®) en contactos de caso confirmado de Zaire ebolavirus.',
          ],
      formulaUsed: 'Definición operativa OMS/CDC: Nexo epidemiológico ≤ 21 días + Fiebre/síntomas agudos',
      inputsSummary: `Nexo ≤ 21 d: ${epiExposure ? 'Sí' : 'No'} · Fiebre: ${fever ? 'Sí' : 'No'} · Pérdidas GI: ${giLoss ? 'Sí' : 'No'}`,
    };
  },
};
