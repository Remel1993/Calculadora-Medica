import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SecondaryResultItem,
  SelectFieldDef,
} from '../types/clinical.ts';

const scenarioField: SelectFieldDef = {
  id: 'scenario',
  label: 'Presentación clínica de Herpes Zóster',
  type: 'select',
  defaultValue: 'inmunocompetente',
  options: [
    {
      value: 'inmunocompetente',
      label: 'Herpes Zóster localizado en adulto inmunocompetente',
      description: 'Afectación unilateral de 1 dermatoma (torácico, lumbar o cervical) sin signos de alarma.',
    },
    {
      value: 'oftalmico_ramsay_hunt',
      label: 'Zóster oftálmico (V1) o Síndrome de Ramsay Hunt (VII–VIII)',
      description: 'Rama oftálmica del trigémino, punta nasal o parálisis facial + vesículas óticas.',
    },
    {
      value: 'inmunocomprometido_diseminado',
      label: 'Inmunocomprometido, diseminado o compromiso neurológico (SNC)',
      description: '≥ 20 vesículas fuera del dermatoma, múltiples dermatomas no contiguos o encefalitis/mielitis.',
    },
    {
      value: 'neuralgia_posherpetica',
      label: 'Dolor neuropático agudo y Neuralgia Posherpética (NPH)',
      description: 'Analgesia multimodal y prevención con vacuna recombinante RZV.',
    },
  ],
};

const timingField: SelectFieldDef = {
  id: 'hoursSinceRash',
  label: 'Tiempo desde la aparición del exantema vesicular',
  type: 'select',
  defaultValue: 'lte72',
  options: [
    {
      value: 'lte72',
      label: '≤ 72 horas (ventana óptima de inicio antiviral)',
    },
    {
      value: 'gt72',
      label: '> 72 horas desde el inicio de vesículas',
    },
  ],
};

const egfrField: SelectFieldDef = {
  id: 'egfrBand',
  label: 'Función renal estimada (TFG / ClCr)',
  type: 'select',
  defaultValue: 'ge50',
  options: [
    { value: 'ge50', label: '≥ 50 mL/min (función renal conservada)' },
    { value: '30_49', label: '30–49 mL/min (ERC moderada / ajuste intermedio)' },
    { value: '10_29', label: '10–29 mL/min (ERC grave)' },
    { value: 'lt10', label: '< 10 mL/min o hemodiálisis' },
  ],
};

const newLesionsField: BooleanFieldDef = {
  id: 'newLesionsStillForming',
  label: 'Persisten vesículas nuevas en formación o edad ≥ 50 años con dolor moderado-intenso',
  type: 'boolean',
  defaultValue: false,
};

const hutchinsonField: BooleanFieldDef = {
  id: 'hutchinsonSign',
  label: 'Signo de Hutchinson (vesículas en punta/ala nasal) o síntomas oculares (ojo rojo, fotofobia, baja agudeza visual)',
  type: 'boolean',
  defaultValue: false,
};

const ramsayHuntField: BooleanFieldDef = {
  id: 'facialPalsy',
  label: 'Parálisis facial periférica + otalgia o vesículas en pabellón/conducto auditivo (Ramsay Hunt)',
  type: 'boolean',
  defaultValue: false,
};

const pregnantField: BooleanFieldDef = {
  id: 'pregnant',
  label: 'Paciente embarazada',
  type: 'boolean',
  defaultValue: false,
};

function getValacyclovirDose(egfrBand: string): string {
  switch (egfrBand) {
    case '30_49':
      return '1,000 mg VO c/12 h × 7 días';
    case '10_29':
      return '1,000 mg VO c/24 h × 7 días';
    case 'lt10':
      return '500 mg VO c/24 h × 7 días (posdiálisis en HD)';
    default:
      return '1,000 mg VO c/8 h × 7 días';
  }
}

function getOralAcyclovirDose(egfrBand: string): string {
  switch (egfrBand) {
    case '10_29':
      return '800 mg VO c/8 h × 7–10 días';
    case 'lt10':
      return '800 mg VO c/12 h × 7–10 días';
    default:
      return '800 mg VO 5 veces/día (c/4 h omitiendo toma nocturna) × 7–10 días';
  }
}

function getFamciclovirDose(egfrBand: string): string {
  switch (egfrBand) {
    case '30_49':
      return '500 mg VO c/12–24 h × 7 días (c/12 h si 40–59; c/24 h si 20–39 mL/min)';
    case '10_29':
      return '500 mg VO c/24 h si ≥ 20 mL/min · 250 mg VO c/24 h si < 20 mL/min';
    case 'lt10':
      return '250 mg VO c/24 h × 7 días (posdiálisis)';
    default:
      return '500 mg VO c/8 h × 7 días';
  }
}

function getIvAcyclovirDose(egfrBand: string): string {
  switch (egfrBand) {
    case '30_49':
      return '10 mg/kg IV c/12 h (si ClCr 25–49 mL/min)';
    case '10_29':
      return '10 mg/kg IV c/24 h (si ClCr 10–24 mL/min)';
    case 'lt10':
      return '5 mg/kg IV c/24 h (posdiálisis en HD)';
    default:
      return '10 mg/kg IV c/8 h × 7–14 días (infusión en ≥ 1 h + hidratación)';
  }
}

export const herpesZosterCalculator: CalculatorDefinition = {
  id: 'herpes-zoster',
  name: 'Herpes Zóster (VVZ): Tratamiento Antiviral, Ajuste Renal, Oftálmico y NPH (CDC / S2k)',
  shortName: 'Herpes Zóster (VVZ)',
  primarySpecialty: 'infectologia',
  secondarySpecialties: ['dermatologia', 'medicina-interna', 'neurologia', 'urgencias'],
  subcategory: 'dosificacion',
  keywords: [
    'herpes zoster',
    'zóster',
    'culebrilla',
    'varicela zoster',
    'vvz',
    'valaciclovir',
    'aciclovir',
    'famciclovir',
    'hutchinson',
    'ramsay hunt',
    'oftalmico',
    'neuralgia posherpetica',
    'nph',
    'shingrix',
    'rzv',
  ],
  description:
    'Guía clínica interactiva para manejo de Herpes Zóster: indicación de antiviral según ventana de 72 h, ajuste renal exacto de valaciclovir/aciclovir/famciclovir, alertas de zóster oftálmico/Ramsay Hunt, terapia IV en inmunocomprometidos y analgesia de NPH.',
  clinicalIndication:
    'Selección rápida de esquema antiviral ajustado a función renal, detección de emergencias neuro-oftalmológicas y manejo del dolor neuropático agudo o posherpético.',
  validatedPopulation:
    'Adultos inmunocompetentes, adultos mayores, gestantes y pacientes inmunocomprometidos con reactivación de virus varicela-zóster (VVZ).',
  contraindications: [
    'NO prescribir aciclovir tópico (ineficaz en Herpes Zóster).',
    'Evitar corticosteroides sistémicos en pacientes inmunocomprometidos, infecciones bacterianas activas no controladas o sin cobertura antiviral simultánea.',
    'Vigilar nefrotoxicidad por cristaluria en aciclovir IV (asegurar hidratación adecuada e infusión en ≥ 60 min) y neurotoxicidad por valaciclovir/aciclovir si no se ajusta a TFG.',
  ],
  limitations: [
    'En pacientes inmunocompetentes que consultan > 72 h con lesiones ya en fase de costra y sin afectación oftálmica/ótica ni dolor grave, el antiviral oral aporta beneficio limitado.',
    'La eficacia sobre la incidencia de neuralgia posherpética disminuye si el antiviral se retrasa > 72 h, aunque los antivirales siguen indicados más allá de 72 h en zóster oftálmico, Ramsay Hunt, inmunocomprometidos o aparición continua de vesículas.',
  ],
  requiredLabsNote:
    'Diagnóstico habitualmente clínico; considerar creatinina/TFG previa en adultos mayores o ERC antes de dosis altas de valaciclovir/aciclovir. PCR de lesión si cuadro atípico o diseminado.',
  version: 'CDC Herpes Zoster · European S2k Guideline · IDSA Immunocompromised Guidelines',
  references: [
    {
      citation:
        'Werner RN, Nikkels AF, Marinović B, et al. European consensus-based (S2k) Guideline on the Management of Herpes Zoster — guided by the European Dermatology Forum (EDF) and EADV. J Eur Acad Dermatol Venereol. 2017;31(1):9-29.',
      year: 2017,
    },
    {
      citation:
        'Centers for Disease Control and Prevention (CDC). Shingles (Herpes Zoster): Clinical Overview & Recombinant Zoster Vaccine (Shingrix) Recommendations. Atlanta: CDC.',
      year: 2024,
    },
    {
      citation:
        'Cohen JI. Clinical practice: Herpes zoster. N Engl J Med. 2013;369(3):255-263.',
      year: 2013,
    },
  ],
  fields: [
    scenarioField,
    timingField,
    egfrField,
    newLesionsField,
    hutchinsonField,
    ramsayHuntField,
    pregnantField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(herpesZosterCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const scenario = String(inputs.scenario ?? 'inmunocompetente');
    const hours = String(inputs.hoursSinceRash ?? 'lte72');
    const egfrBand = String(inputs.egfrBand ?? 'ge50');
    const newLesions = inputs.newLesionsStillForming === true;
    const hutchinson = inputs.hutchinsonSign === true;
    const facialPalsy = inputs.facialPalsy === true;
    const pregnant = inputs.pregnant === true;

    const valacyclovir = getValacyclovirDose(egfrBand);
    const oralAcyclovir = getOralAcyclovirDose(egfrBand);
    const famciclovir = getFamciclovirDose(egfrBand);
    const ivAcyclovir = getIvAcyclovirDose(egfrBand);

    const isIvRequired = scenario === 'inmunocomprometido_diseminado';
    const isCranialEmergency =
      scenario === 'oftalmico_ramsay_hunt' || hutchinson || facialPalsy;

    const secondaryResults: SecondaryResultItem[] = isIvRequired
      ? [
          {
            label: 'Aciclovir IV (Esquema de elección)',
            formattedValue: ivAcyclovir,
            unit: `TFG ${egfrBand.replace('_', '–')}`,
            note: 'Mantener hasta mejoría clínica / ausencia de lesiones nuevas (7–14 d; pasar a VO tras control si inmunosupresión leve).',
          },
          {
            label: 'Aislamiento hospitalario',
            formattedValue: 'Aéreo + Contacto',
            unit: 'Hasta costra total',
            note: 'Evitar contacto con gestantes, neonatos prematuros e inmunocomprometidos seronegativos.',
          },
        ]
      : [
          {
            label: 'Valaciclovir VO (1.ª línea preferida)',
            formattedValue: valacyclovir,
            unit: 'Mayor biodisponibilidad',
            note: 'Menos tomas diarias y mejor adherencia que aciclovir oral.',
          },
          {
            label: 'Aciclovir VO (Alternativa estándar)',
            formattedValue: oralAcyclovir,
            unit: pregnant ? 'Preferido si embarazo' : 'Ajustado a TFG',
            note: 'Mayor experiencia de seguridad en el embarazo frente a valaciclovir/famciclovir.',
          },
          {
            label: 'Famciclovir VO (Alternativa)',
            formattedValue: famciclovir,
            unit: 'Ajustado a TFG',
            note: 'Opción equivalente en adultos no gestantes.',
          },
        ];

    if (isIvRequired) {
      return {
        primaryResult: {
          label: 'Tratamiento antiviral recomendado',
          value: 3,
          formattedValue: 'Aciclovir IV inmediato',
          unit: 'Ingreso + aislamiento',
        },
        secondaryResults,
        severity: 'critical',
        riskClassification: 'Herpes Zóster Grave / Inmunocomprometido / Diseminado o SNC',
        clinicalInterpretation:
          'Alto riesgo de diseminación visceral (neumonía, hepatitis), necrosis retiniana aguda o meningoencefalitis por VVZ. Requiere aciclovir IV independientemente del tiempo transcurrido desde el exantema.',
        guidance: [
          `Iniciar ${ivAcyclovir} con hidratación IV adecuada para prevenir cristaluria renal.`,
          'Instaurar precauciones aéreas y de contacto hasta que TODAS las lesiones estén en fase de costra; descartar compromiso ocular o meníngeo si cefalea, fotofobia o alteración visual.',
          'Evaluar reducción prudente de inmunosupresores si es clínicamente factible y vacunar tras recuperación con RZV (Shingrix®) en ≥ 18 años inmunocomprometidos.',
        ],
        formulaUsed: 'Guías S2k / IDSA: Aciclovir 10 mg/kg IV ajustado por TFG en diseminado/inmunocompromiso',
        inputsSummary: `Escenario: Grave/Inmunocomprometido · TFG: ${egfrBand} · Inicio: ${hours === 'lte72' ? '≤ 72 h' : '> 72 h'}`,
      };
    }

    if (isCranialEmergency) {
      return {
        primaryResult: {
          label: 'Conducta neuro-oftalmológica urgente',
          value: 2,
          formattedValue: hutchinson ? 'Oftalmología urgente' : 'Antiviral + Corticoide',
          unit: 'Iniciar aun si > 72 h',
        },
        secondaryResults,
        severity: 'high',
        riskClassification: hutchinson
          ? 'Herpes Zóster Oftálmico / Riesgo de Queratitis y Uveítis (Signo de Hutchinson)'
          : 'Síndrome de Ramsay Hunt / Afectación de Pares Craneales',
        clinicalInterpretation: hutchinson
          ? 'La presencia de vesículas en la punta o ala nasal (nervio nasociliar, rama V1) predice compromiso intraocular en > 50–70 % de los casos (queratitis, uveítis, hipertensión ocular).'
          : 'La afectación de V1 o ganglio geniculado (VII–VIII) conlleva riesgo de secuela visual, parálisis facial persistente o vértigo/hipoacusia.',
        guidance: [
          `Iniciar antiviral de inmediato (incluso si > 72 h): ${pregnant ? oralAcyclovir : valacyclovir}. En afectación oftálmica grave o inmunosupresión, usar aciclovir IV 10 mg/kg c/8 h.`,
          hutchinson
            ? 'VALORACIÓN OFTALMOLÓGICA URGENTE con lámpara de hendidura (dentro de las primeras 24 h) para descartar queratitis dendrítica/estromal o uveítis anterior; NO iniciar colirios corticoides sin oftalmología.'
            : 'En Síndrome de Ramsay Hunt sin contraindicación, asociar corticoide oral temprano (p. ej. Prednisona 1 mg/kg/día, máx 60 mg/d × 5–7 días con descenso) junto con el antiviral y protección corneal si lagoftalmos.',
        ],
        formulaUsed: 'S2k / CDC: Antiviral sistémico inmediato + ajuste renal (± corticoide en Ramsay Hunt)',
        inputsSummary: `Hutchinson/ocular: ${hutchinson ? 'Sí' : 'No'} · Parálisis facial: ${facialPalsy ? 'Sí' : 'No'} · TFG: ${egfrBand}`,
      };
    }

    if (scenario === 'neuralgia_posherpetica') {
      return {
        primaryResult: {
          label: 'Enfoque en dolor neuropático / NPH',
          value: 1,
          formattedValue: 'Analgesia multimodal',
          unit: 'Primera línea neuropática',
        },
        secondaryResults,
        severity: 'moderate',
        riskClassification: 'Dolor Neuropático Agudo / Neuralgia Posherpética (NPH > 90 días)',
        clinicalInterpretation:
          'El dolor persistente más allá de 90 días tras el inicio del exantema define NPH. El tratamiento precoz del dolor agudo intenso y la vacunación RZV reducen la carga de enfermedad.',
        guidance: [
          'Primera línea en NPH: Gabapentina (titular desde 300 mg/d hasta 1,200–3,600 mg/d en 3 tomas, ajustar a TFG), Pregabalina (75–300 mg c/12 h, ajustar a TFG), Amitriptilina/Nortriptilina (10–25 mg nocturnos, precaución en ancianos/cardiopatía) o parche de Lidocaína 5 % (solo sobre piel intacta sin vesículas).',
          'En fase aguda (≤ 72 h o vesículas nuevas activas), combinar el antiviral ajustado a función renal con analgesia escalonada (paracetamol/AINE si sin contraindicación ± neuromodulador si dolor neuropático intenso).',
          'Prevención secundaria/primaria: recomendar vacuna recombinante adyuvada RZV (Shingrix®, 2 dosis separadas 2–6 meses) en adultos ≥ 50 años o inmunocomprometidos ≥ 18 años tras resolver el episodio agudo.',
        ],
        formulaUsed: 'Algoritmo multimodal de dolor neuropático + dosis antiviral ajustada a TFG',
        inputsSummary: `Escenario: NPH / Dolor · TFG: ${egfrBand}`,
      };
    }

    const antiviralRecommended = hours === 'lte72' || newLesions || pregnant;

    return {
      primaryResult: {
        label: 'Indicación antiviral',
        value: antiviralRecommended ? 1 : 0,
        formattedValue: antiviralRecommended
          ? pregnant
            ? 'Aciclovir VO'
            : 'Valaciclovir VO'
          : 'Solo analgesia y vigilancia',
        unit: antiviralRecommended ? 'Ajustado a TFG' : '> 72 h sin vesículas nuevas',
      },
      secondaryResults,
      severity: antiviralRecommended ? 'moderate' : 'low',
      riskClassification: antiviralRecommended
        ? 'Herpes Zóster Localizado — Antiviral Sistémico Indicado'
        : 'Herpes Zóster > 72 h en Inmunocompetente sin Lesiones Nuevas',
      clinicalInterpretation: antiviralRecommended
        ? 'El inicio antiviral temprano (≤ 72 h o mientras sigan brotando vesículas activas) acorta la duración del exantema, reduce la diseminación viral y atenúa la gravedad del dolor agudo.'
        : 'Pasadas 72 h sin aparición de nuevas vesículas ni factores de riesgo (≥ 50 años, dolor intenso, oftálmico o inmunocompromiso), los antivirales sistémicos ofrecen beneficio clínico mínimo.',
      guidance: [
        antiviralRecommended
          ? `Esquema oral de elección (${pregnant ? 'embarazo: Aciclovir preferido' : 'adulto inmunocompetente'}): ${pregnant ? oralAcyclovir : valacyclovir}.`
          : 'Mantener lesiones limpias y secas (cubiertas para evitar transmisión por contacto a personas no inmunes/embarazadas) y tratar el dolor con paracetamol, AINEs o neuromoduladores según intensidad.',
        'Evitar ungüentos antivirales tópicos o antibióticos tópicos de rutina salvo sobreinfección bacteriana documentada (celulitis secundaria).',
        'Advertir signos de alarma para reconsulta inmediata: lesiones en punta nasal u ojo, dolor ocular/visión borrosa, parálisis facial, cefalea con rigidez nucal o diseminación > 20 lesiones fuera del dermatoma.',
      ],
      formulaUsed: 'Ventana 72 h + ajuste por TFG (CDC / European S2k Guideline)',
      inputsSummary: `Inicio: ${hours === 'lte72' ? '≤ 72 h' : '> 72 h'} · TFG: ${egfrBand} · Lesiones nuevas: ${newLesions ? 'Sí' : 'No'}`,
    };
  },
};
