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

const diseaseField: SelectFieldDef = {
  id: 'exanthem',
  label: 'Varicela infantil o enfermedad exantemática pediátrica',
  type: 'select',
  defaultValue: 'varicella_pediatric',
  options: [
    { value: 'varicella_pediatric', label: 'Varicela en niños (Primoinfección por VVZ)' },
    { value: 'measles', label: 'Sarampión (Paramixovirus · 3 "C" y Koplik)' },
    { value: 'scarlet_fever', label: 'Escarlatina (Streptococcus pyogenes · Piel en lija)' },
    { value: 'rubella', label: 'Rubéola (Togavirus · Adenopatías retroauriculares)' },
    { value: 'roseola_hhv6', label: 'Exantema Súbito / Roséola Infantil (VHH-6 / VHH-7)' },
    { value: 'erythema_infectiosum_b19', label: 'Eritema Infeccioso / 5.ª Enfermedad (Parvovirus B19)' },
    { value: 'hand_foot_mouth', label: 'Enfermedad Mano-Pie-Boca (Coxsackie / Enterovirus)' },
    { value: 'kawasaki_alert', label: 'Alerta diferencial: Enfermedad de Kawasaki (IGIV + AAS)' },
  ],
};

const ageGroupField: SelectFieldDef = {
  id: 'ageBand',
  label: 'Grupo etario pediátrico',
  type: 'select',
  defaultValue: '1_11y',
  options: [
    { value: 'lt6m', label: '< 6 meses (o recién nacido)' },
    { value: '6_11m', label: '6–11 meses' },
    { value: '1_11y', label: '1–11 años' },
    { value: 'ge12y', label: '≥ 12 años (adolescente)' },
  ],
};

const weightField: NumberFieldDef = {
  id: 'weightKg',
  label: 'Peso del paciente pediátrico',
  type: 'number',
  required: true,
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  defaultValue: '18',
  min: 2,
  max: 120,
  placeholder: 'Ej. 18',
  helpText:
    'Calcula Aciclovir VO/IV (Varicela), Amoxicilina/Penicilina benzatínica (Escarlatina) o IGIV 2 g/kg (Kawasaki).',
};

const highRiskVaricellaField: BooleanFieldDef = {
  id: 'highRiskOrSevere',
  label: 'Factor de riesgo o complicación (inmunocompromiso, neumopatía/dermatopatía crónica, corticoides, 2.º caso familiar, varicela neonatal o signos de alarma)',
  type: 'boolean',
  defaultValue: false,
};

const penicillinAllergyField: BooleanFieldDef = {
  id: 'penicillinAllergy',
  label: 'Alergia a penicilina (si Escarlatina)',
  type: 'boolean',
  defaultValue: false,
  visibleWhen: (inputs) => inputs.exanthem === 'scarlet_fever',
};

export const pediatricVaricellaExanthemsCalculator: CalculatorDefinition = {
  id: 'pediatric-varicella-exanthems',
  name: 'Varicela Infantil (VVZ) y Enfermedades Exantemáticas de la Infancia (Diagnóstico y Dosis)',
  shortName: 'Varicela y Exantemáticas',
  primarySpecialty: 'pediatria',
  secondarySpecialties: ['infectologia', 'dermatologia', 'urgencias'],
  subcategory: 'dosificacion',
  keywords: [
    'varicela',
    'varicela niño',
    'exantematicas',
    'exantema',
    'sarampion',
    'koplik',
    'vitamina a',
    'escarlatina',
    'pastia',
    'filatov',
    'rubeola',
    'forchheimer',
    'roseola',
    'exantema subito',
    'vhh-6',
    'eritema infeccioso',
    'parvovirus b19',
    'mano pie boca',
    'kawasaki',
    'reye',
  ],
  description:
    'Diferenciación clínica de Varicela pediátrica y las principales enfermedades exantemáticas de la infancia (Sarampión, Escarlatina, Rubéola, Exantema Súbito, Eritema Infeccioso, Mano-Pie-Boca y Kawasaki), con cálculo automático por peso y edad.',
  clinicalIndication:
    'Diagnóstico diferencial rápido del exantema febril infantil, decisión de aciclovir en varicela pediátrica, dosis de Vitamina A OMS en sarampión, antibioticoterapia en escarlatina e identificación de Kawasaki.',
  validatedPopulation: 'Recién nacidos, lactantes, niños y adolescentes.',
  contraindications: [
    'En Varicela infantil: CONTRAINDICADO estrictamente ácido acetilsalicílico (AAS) por Síndrome de Reye y EVITAR ibuprofeno/AINEs por asociación con fascitis necrotizante/sobreinfección invasiva por Streptococcus pyogenes.',
    'En Sarampión: evitar antibióticos profilácticos innecesarios salvo sobreinfección bacteriana documentada (otitis media o neumonía bacteriana).',
  ],
  limitations: [
    'Todo exantema febril con petequias que no blanquean a la digitopresión o aspecto tóxico exige descartar primero meningococcemia, sepsis o rickettsiosis.',
    'La eficacia de Aciclovir oral en varicela no complicada requiere iniciarlo en las primeras 24 horas del exantema.',
  ],
  requiredLabsNote:
    'Diagnóstico clínico en la mayoría de casos; en Escarlatina confirmar con test rápido de estreptococo o cultivo faríngeo si disponible. En Kawasaki solicitar ecocardiograma, PCR/VSG, plaquetas y PFH.',
  version: 'AAP Red Book · OMS Sarampión (Vitamina A) · AHA Kawasaki Guidelines',
  references: [
    {
      citation:
        'American Academy of Pediatrics (AAP). Red Book: Report of the Committee on Infectious Diseases (Varicella-Zoster Virus, Measles, Group A Streptococcal Infections, Parvovirus B19). 32nd–33rd ed.',
      year: 2024,
    },
    {
      citation:
        'World Health Organization (WHO). Measles Fact Sheet & Pocket Book of Hospital Care for Children (Vitamin A supplementation protocol). Geneva: WHO.',
      year: 2023,
    },
    {
      citation:
        'McCrindle BW, Rowley AH, Newburger JW, et al. Diagnosis, Treatment, and Long-Term Management of Kawasaki Disease: AHA Scientific Statement. Circulation. 2017;135(17):e927-e999.',
      year: 2017,
    },
  ],
  fields: [diseaseField, ageGroupField, weightField, highRiskVaricellaField, penicillinAllergyField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(pediatricVaricellaExanthemsCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const exanthem = String(inputs.exanthem ?? 'varicella_pediatric');
    const ageBand = String(inputs.ageBand ?? '1_11y');
    const weightKg =
      getCanonicalNumberValue(weightField, inputs.weightKg as NumberInputValue).canonicalValue ??
      18;
    const highRisk = inputs.highRiskOrSevere === true;
    const penAllergy = inputs.penicillinAllergy === true;

    if (exanthem === 'varicella_pediatric') {
      const aciclovirPoDose = roundClinical(Math.min(weightKg * 20, 800), 0);
      const aciclovirIvDose = roundClinical(weightKg * 10, 0);
      const needsOral = ageBand === 'ge12y' || highRisk;

      const secondaryResults: SecondaryResultItem[] = [
        {
          label: 'Aciclovir VO (si > 12 a, crónico o 2.º caso familiar ≤ 24 h)',
          formattedValue: `${formatClinicalNumber(aciclovirPoDose, 0)} mg VO c/6 h × 5 d`,
          unit: '20 mg/kg/dosis (máx 800 mg/dosis)',
          note: 'En niños sanos 1–11 años NO se recomienda aciclovir de rutina; el manejo es sintomático.',
        },
        {
          label: 'Aciclovir IV (inmunocompromiso, neonatal o complicación)',
          formattedValue: `${formatClinicalNumber(aciclovirIvDose, 0)} mg IV c/8 h × 7–10 d`,
          unit: '10 mg/kg/dosis (o 500 mg/m² c/8 h)',
        },
      ];

      return {
        primaryResult: {
          label: 'Manejo Varicela Pediátrica',
          value: needsOral ? aciclovirPoDose : 0,
          formattedValue: highRisk
            ? 'Evaluar Aciclovir IV / VO'
            : ageBand === 'ge12y'
              ? `Aciclovir ${formatClinicalNumber(aciclovirPoDose, 0)} mg c/6 h`
              : 'Sostén (Paracetamol — NO AAS/Ibuprofeno)',
          unit: 'Exantema polimorfo "cielo estrellado"',
        },
        secondaryResults,
        severity: highRisk ? 'high' : 'moderate',
        riskClassification: highRisk
          ? 'Varicela en Población de Riesgo / Complicación / Neonatal'
          : 'Varicela Pediátrica Típica (Primoinfección por VVZ)',
        clinicalInterpretation:
          'Exantema pruriginoso cefalocaudal con coexistencia simultánea de máculas, pápulas, vesículas en "gota de rocío" y costras ("cielo estrellado"), afectando cuero cabelludo y mucosas. Contagia desde 48 h antes del exantema hasta que TODAS las vesículas estén en costra.',
        guidance: [
          'Control de fiebre EXCLUSIVAMENTE con Paracetamol (10–15 mg/kg/dosis c/6 h); PROHIBIDO AAS (Síndrome de Reye) y evitar ibuprofeno (riesgo de sobreinfección estreptocócica invasiva/fascitis).',
          highRisk
            ? 'Inmunocomprometidos, neumonía/ataxia cerebelosa o varicela neonatal (madre con exantema 5 d antes a 2 d posparto): hospitalizar, iniciar Aciclovir IV y administrar inmunoglobulina específica (VariZIG) en exposición neonatal perinatal.'
            : 'Mantener uñas cortas, baño tibio sin frotar, antihistamínico oral si prurito intenso y vigilar signos de sobreinfección bacteriana (eritema indurado creciente, reaparición de fiebre al día 4–5).',
        ],
        formulaUsed: 'AAP Red Book: Aciclovir VO 20 mg/kg (máx 800 mg) c/6 h · Aciclovir IV 10 mg/kg c/8 h',
        inputsSummary: `Varicela · Peso: ${formatClinicalNumber(weightKg, 1)} kg · Edad: ${ageBand} · Riesgo/alarma: ${highRisk ? 'Sí' : 'No'}`,
      };
    }

    if (exanthem === 'measles') {
      const vitADose = ageBand === 'lt6m' ? 50000 : ageBand === '6_11m' ? 100000 : 200000;
      return {
        primaryResult: {
          label: 'Vitamina A OMS (Sarampión)',
          value: vitADose,
          formattedValue: `${formatClinicalNumber(vitADose, 0)} UI VO/día × 2 días`,
          unit: 'Día 1 y Día 2 (+ 3.ª dosis a las 2–4 sem si signos oculares)',
        },
        secondaryResults: [
          {
            label: 'Aislamiento y notificación',
            formattedValue: 'Aislamiento aéreo (4 d antes a 4 d tras exantema)',
            unit: 'Notificación epidemiológica inmediata',
          },
        ],
        severity: highRisk ? 'critical' : 'high',
        riskClassification: 'Sarampión (Paramixovirus) — Alto Riesgo de Neumonía y Encefalitis',
        clinicalInterpretation:
          'Pródromo de fiebre alta + 3 "C" (tos/catarro, coriza, conjuntivitis) seguido de manchas de Koplik (pápulas blanco-azuladas en mucosa yugal) y exantema maculopapular rojo parduzco que inicia detrás de orejas/línea capilar y avanza en sentido cefalocaudal haciéndose confluente.',
        guidance: [
          `Administrar Vitamina A ${formatClinicalNumber(vitADose, 0)} UI VO una vez al día durante 2 días consecutivos (reduce significativamente la mortalidad y ceguera por xeroftalmía).`,
          'Vigilar complicaciones frecuentes: otitis media aguda, laringotraqueobronquitis (crup), neumonía (principal causa de muerte) y encefalitis aguda; usar antibióticos solo ante sobreinfección bacteriana confirmada/sospechada.',
        ],
        formulaUsed: 'OMS Sarampión: Vitamina A 50,000 UI (< 6 m) · 100,000 UI (6–11 m) · 200,000 UI (≥ 12 m) × 2 d',
        inputsSummary: `Sarampión · Edad: ${ageBand} · Peso: ${formatClinicalNumber(weightKg, 1)} kg`,
      };
    }

    if (exanthem === 'scarlet_fever') {
      const amoxDaily = roundClinical(Math.min(weightKg * 50, 1000), 0);
      const benzUi = weightKg < 27 ? 600000 : 1200000;
      const azithDaily = roundClinical(Math.min(weightKg * 12, 500), 0);

      return {
        primaryResult: {
          label: 'Antibioticoterapia Escarlatina (S. pyogenes)',
          value: penAllergy ? azithDaily : amoxDaily,
          formattedValue: penAllergy
            ? `Azitromicina ${formatClinicalNumber(azithDaily, 0)} mg/d × 5 d (o Cefalexina si no anafilaxia)`
            : `Amoxicilina ${formatClinicalNumber(amoxDaily, 0)} mg/día VO × 10 días`,
          unit: penAllergy ? '12 mg/kg/d (máx 500 mg)' : '50 mg/kg/d (c/12 h o c/24 h, máx 1 g/d)',
        },
        secondaryResults: [
          {
            label: 'Alternativa intramuscular dosis única',
            formattedValue: `Penicilina G benzatínica ${formatClinicalNumber(benzUi, 0)} UI IM DU`,
            unit: weightKg < 27 ? '< 27 kg: 600,000 UI' : '≥ 27 kg: 1,200,000 UI',
          },
        ],
        severity: 'moderate',
        riskClassification: 'Escarlatina (Estreptococo β-hemolítico Grupo A — Toxina Eritrogénica)',
        clinicalInterpretation:
          'Fiebre + odinofagia/amigdalitis exudativa + lengua aframbuesada + micropápulas eritematosas ásperas en "papel de lija" que blanquean a la presión, intensificadas en pliegues (líneas de Pastia) con palidez peribucal (triángulo de Filatov) y descamación laminar posterior.',
        guidance: [
          penAllergy
            ? 'En alergia no anafiláctica a penicilina puede usarse Cefalexina 40 mg/kg/d × 10 d; en anafilaxia usar Azitromicina 12 mg/kg/d × 5 d o Clindamicina 20 mg/kg/d c/8 h × 10 d.'
            : `Completar 10 días de Amoxicilina (${formatClinicalNumber(amoxDaily, 0)} mg/d) o Penicilina V (o dosis única IM de Penicilina G benzatínica) para erradicar el estreptococo y prevenir fiebre reumática aguda.`,
          'El niño deja de ser contagioso tras 12–24 horas de antibiótico efectivo.',
        ],
        formulaUsed: 'AAP Red Book: Amoxicilina 50 mg/kg/d (máx 1 g) × 10 d · Benzatínica 600k/1.2M UI',
        inputsSummary: `Escarlatina · Peso: ${formatClinicalNumber(weightKg, 1)} kg · Alergia penicilina: ${penAllergy ? 'Sí' : 'No'}`,
      };
    }

    if (exanthem === 'kawasaki_alert') {
      const ivigG = roundClinical(weightKg * 2, 1);
      return {
        primaryResult: {
          label: 'IGIV recomendada (Kawasaki)',
          value: ivigG,
          formattedValue: `${formatClinicalNumber(ivigG, 1)} g IV en infusión única (8–12 h)`,
          unit: '2 g/kg + AAS antiinflamatorio',
        },
        secondaryResults: [
          {
            label: 'Criterios diagnósticos AHA',
            formattedValue: 'Fiebre ≥ 5 d + ≥ 4 criterios clínicos',
            unit: 'Iniciar IGIV idealmente < día 10 de fiebre',
          },
        ],
        severity: 'critical',
        riskClassification: 'Sospecha de Enfermedad de Kawasaki — Urgencia Cardiológica Pediátrica',
        clinicalInterpretation:
          'Vasculitis sistémica febril que simula exantemáticas virales o escarlatina. Sin IGIV temprana antes del día 10, hasta 20–25 % desarrolla aneurismas de arterias coronarias.',
        guidance: [
          `Evaluación hospitalaria y cardiológica urgente con ecocardiograma basal: administrar Inmunoglobulina IV 2 g/kg (${formatClinicalNumber(ivigG, 1)} g) en infusión continua única + Ácido Acetilsalicílico según protocolo AHA (30–50 mg/kg/d inicialmente y luego 3–5 mg/kg/d antiagregante).`,
          'Recordar criterios: inyección conjuntival bilateral sin exudado, cambios orales (labios fisurados/lengua aframbuesada), exantema polimorfo, eritema/edema de manos y pies, adenopatía cervical unilateral ≥ 1.5 cm.',
        ],
        formulaUsed: 'AHA Kawasaki: IGIV 2 g/kg dosis única + AAS',
        inputsSummary: `Alerta Kawasaki · Peso: ${formatClinicalNumber(weightKg, 1)} kg`,
      };
    }

    if (exanthem === 'rubella') {
      return {
        primaryResult: {
          label: 'Manejo de Rubéola (Togavirus)',
          value: 0,
          formattedValue: 'Soporte + Aislamiento de gestantes',
          unit: 'Incubación 14–21 días',
        },
        secondaryResults: [
          {
            label: 'Clave clínica diferencial',
            formattedValue: 'Adenopatías retroauriculares y suboccipitales dolorosas',
            unit: 'Exantema rosado fino fugaz (3 días) · Manchas de Forchheimer',
          },
        ],
        severity: highRisk ? 'high' : 'low',
        riskClassification: 'Rubéola Posnatal — Riesgo Teratogénico Grave en Gestantes Susceptibles',
        clinicalInterpretation:
          'Cuadro pediátrico habitualmente benigno con febrícula, adenopatías retroauriculares/suboccipitales características y exantema cefalocaudal rápido que desaparece en ~3 días sin descamación.',
        guidance: [
          'Aislar al paciente (gotas) durante 7 días tras el inicio del exantema, evitando estrictamente el contacto con mujeres embarazadas no inmunes (riesgo de Síndrome de Rubéola Congénita: sordera, cataratas, persistencia del conducto arterioso).',
          'Notificación epidemiológica obligatoria y verificación de esquema SRP (MMR) en contactos.',
        ],
        formulaUsed: 'Vigilancia clínica AAP/OMS de Rubéola y prevención congénita',
        inputsSummary: `Rubéola · Edad: ${ageBand}`,
      };
    }

    if (exanthem === 'roseola_hhv6') {
      return {
        primaryResult: {
          label: 'Exantema Súbito (VHH-6 / VHH-7)',
          value: 0,
          formattedValue: 'Autolimitado · NO dar antibióticos',
          unit: 'Fiebre alta 3–5 d → cae al brotar exantema',
        },
        secondaryResults: [
          {
            label: 'Grupo típico',
            formattedValue: 'Lactantes 6–24 meses en buen estado general',
            unit: 'Causa frecuente de convulsión febril simple',
          },
        ],
        severity: 'low',
        riskClassification: 'Roséola Infantil (Sexta Enfermedad — VHH-6)',
        clinicalInterpretation:
          'Fiebre elevada (39–40 °C) durante 3–5 días con niño sorprendentemente activo; al ceder bruscamente la fiebre aparece un exantema maculopapular rosado en cuello/tronco que no suele confundirse con alergia antibiótica si no se prescribió amoxicilina innecesaria.',
        guidance: [
          'Manejo exclusivamente sintomático (hidratación y antipiréticos si disconfort); no requiere antibióticos ni aislamiento estricto una vez afebril.',
        ],
        formulaUsed: 'Criterio clínico clásico de Roséola infantil (fiebre 3–5 d + exantema tras defervescencia)',
        inputsSummary: `Roséola · Edad: ${ageBand}`,
      };
    }

    if (exanthem === 'erythema_infectiosum_b19') {
      return {
        primaryResult: {
          label: 'Eritema Infeccioso (Parvovirus B19)',
          value: 0,
          formattedValue: highRisk ? 'Vigilar anemia aplásica / embarazo' : 'Manejo sintomático',
          unit: '"Mejillas abofeteadas" + encaje reticular',
        },
        secondaryResults: [
          {
            label: 'Poblaciones de riesgo grave',
            formattedValue: 'Anemia falciforme / esferocitosis / embarazo',
            unit: 'Riesgo de crisis aplásica transitoria o hidrops fetal',
          },
        ],
        severity: highRisk ? 'high' : 'low',
        riskClassification: 'Eritema Infeccioso / Quinta Enfermedad (Parvovirus B19)',
        clinicalInterpretation:
          'Eritema intenso en ambas mejillas ("niño abofeteado") seguido de exantema reticular en encaje en tronco/extremidades que puede fluctuar semanas con calor o sol. Cuando brota el exantema, el niño inmunocompetente ya casi no es contagioso.',
        guidance: [
          highRisk
            ? 'En drepanocitosis, talasemia o esferocitosis hereditaria vigilar caída brusca de Hb con reticulocitopenia (crisis aplásica); si contacto con gestante susceptible solicitar IgM/IgG B19 y seguimiento ecográfico fetal por riesgo de hidrops.'
            : 'Manejo conservador con hidratación y paracetamol si febrícula o artralgias.',
        ],
        formulaUsed: 'AAP Red Book Parvovirus B19: Diagnóstico clínico y vigilancia de crisis aplásica/hidrops',
        inputsSummary: `Eritema infeccioso · Riesgo hematológico/obstétrico: ${highRisk ? 'Sí' : 'No'}`,
      };
    }

    // Hand-Foot-Mouth disease
    return {
      primaryResult: {
        label: 'Enfermedad Mano-Pie-Boca',
        value: 0,
        formattedValue: highRisk ? 'Vigilar miocarditis / encefalitis (EV-A71)' : 'Hidratación + Paracetamol',
        unit: 'Coxsackie A16 / Enterovirus',
      },
      secondaryResults: [
        {
          label: 'Lesiones características',
          formattedValue: 'Vesículas ovaladas palmoplantares + úlceras orales',
          unit: 'Puede afectar área del pañal; onicomadesis tardía benigna',
        },
      ],
      severity: highRisk ? 'high' : 'low',
      riskClassification: 'Enfermedad Mano-Pie-Boca (Enterovirus)',
      clinicalInterpretation:
        'Vesículas elípticas grisáceas dolorosas en palmas, plantas y mucosa oral/faringe posterior. La principal complicación ambulatoria es la deshidratación por odinofagia.',
      guidance: [
        'Priorizar líquidos fríos/tibios no ácidos y analgesia con paracetamol o ibuprofeno (si sin sospecha de dengue/varicela); evitar benzocaína tópica en menores.',
        'Derivar a urgencias si incapacidad total para hidratarse, letargia, mioclonías, taquicardia desproporcionada o signos de encefalitis/edema pulmonar neurogénico (Enterovirus A71).',
      ],
      formulaUsed: 'Criterio clínico AAP de Enfermedad Mano-Pie-Boca y signos de alarma enteroviral',
      inputsSummary: `Mano-Pie-Boca · Edad: ${ageBand} · Alarma: ${highRisk ? 'Sí' : 'No'}`,
    };
  },
};
