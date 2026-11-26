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

const conditionField: SelectFieldDef = {
  id: 'condition',
  label: 'Fiebre no endémica / importada o evaluación del viajero',
  type: 'select',
  defaultValue: 'traveler_triage',
  options: [
    {
      value: 'traveler_triage',
      label: 'Triaje del viajero febril / Fiebre no endémica por período de incubación',
    },
    {
      value: 'typhoid_enteric',
      label: 'Fiebre Tifoidea / Entérica (Salmonella Typhi / Paratyphi)',
    },
    {
      value: 'q_fever',
      label: 'Fiebre Q (Coxiella burnetii: aguda y endocarditis crónica)',
    },
    {
      value: 'babesiosis',
      label: 'Babesiosis (Babesia microti: hemólisis febril / asplenia)',
    },
  ],
};

const incubationField: SelectFieldDef = {
  id: 'incubationWindow',
  label: 'Tiempo desde el regreso de zona de riesgo / exposición',
  type: 'select',
  defaultValue: 'lt14',
  visibleWhen: (inputs) => inputs.condition === 'traveler_triage',
  options: [
    { value: 'lt14', label: '< 14 días desde el retorno' },
    { value: '14_21', label: '14–21 días desde el retorno' },
    { value: 'gt21', label: '> 21 días (o > 1 mes) desde el retorno' },
  ],
};

const weightField: NumberFieldDef = {
  id: 'weightKg',
  label: 'Peso del paciente',
  type: 'number',
  required: true,
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  defaultValue: '70',
  min: 3,
  max: 250,
  placeholder: 'Ej. 70',
  helpText:
    'Calcula dosis pediátricas y de adulto para Ceftriaxona/Azitromicina (Tifoidea) y Atovacuona/Azitromicina (Babesiosis).',
};

const severeField: BooleanFieldDef = {
  id: 'severeOrXdr',
  label: 'Cuadro grave / complicado (choque, encefalopatía, perforación, endocarditis, parasitemia ≥ 4–10 %, asplenia o sospecha XDR)',
  type: 'boolean',
  defaultValue: false,
};

const pediatricField: BooleanFieldDef = {
  id: 'pediatric',
  label: 'Paciente pediátrico (< 18 años / dosificación por kg)',
  type: 'boolean',
  defaultValue: false,
};

const pregnantField: BooleanFieldDef = {
  id: 'pregnant',
  label: 'Paciente embarazada',
  type: 'boolean',
  defaultValue: false,
};

export const nonEndemicImportedFeversCalculator: CalculatorDefinition = {
  id: 'non-endemic-imported-fevers',
  name: 'Fiebres No Endémicas, Importadas y del Viajero: Triaje, Fiebre Tifoidea, Fiebre Q y Babesiosis (CDC / OMS)',
  shortName: 'Fiebres No Endémicas / Viajero',
  primarySpecialty: 'infectologia',
  secondarySpecialties: ['medicina-interna', 'urgencias', 'pediatria'],
  subcategory: 'dosificacion',
  keywords: [
    'fiebre no endemica',
    'fiebre del viajero',
    'viajero febril',
    'fiebre importada',
    'tifoidea',
    'salmonella typhi',
    'xdr',
    'fiebre q',
    'coxiella burnetii',
    'babesiosis',
    'babesia',
    'atovacuona',
    'faget',
    'malaria importada',
  ],
  description:
    'Algoritmo diagnóstico por período de incubación en fiebres no endémicas o importadas, junto con dosificación antimicrobiana para Fiebre Tifoidea (incluyendo XDR), Fiebre Q y Babesiosis.',
  clinicalIndication:
    'Evaluación estructurada de pacientes febriles con antecedente de viaje o exposición inusual no endémica y cálculo rápido de regímenes de elección.',
  validatedPopulation:
    'Adultos, embarazadas y población pediátrica con síndrome febril importado o zoonosis cosmopolita.',
  contraindications: [
    'NO asumir cuadro viral benigno en un viajero febril procedente de área endémica de malaria sin descartar Plasmodium falciparum mediante gota gruesa/PDR seriada (hasta 3 muestras en 24–48 h).',
    'Evitar fluoroquinolonas empíricas (ciprofloxacino) en Fiebre Tifoidea adquirida en Asia Meridional/Sudeste Asiático por tasas de resistencia > 80–90 %.',
  ],
  limitations: [
    'En Fiebre Tifoidea, la reacción de Widal tiene muy baja especificidad en zonas endémicas y no debe sustituir al hemocultivo (mayor rendimiento en semana 1) o mielocultivo.',
    'La serología inicial de Fiebre Q (Coxiella) suele ser negativa los primeros 7–14 días; repetir títulos de fase I y II a las 2–3 semanas.',
  ],
  requiredLabsNote:
    'Viajero febril: gota gruesa/extensión fina + PDR malaria, hemocultivos ×2, biometría hemática, AST/ALT, bilirrubinas, creatinina y EGO; añadir RT-PCR FVH si viaje reciente a zona de brote (≤ 21 d).',
  version: 'CDC Yellow Book 2024 · IDSA Babesiosis 2020 · WHO Typhoid XDR Guidance',
  references: [
    {
      citation:
        'Centers for Disease Control and Prevention (CDC). CDC Yellow Book 2024: Health Information for International Travel (Fever in the Returned Traveler, Typhoid, Q Fever). New York: Oxford University Press.',
      year: 2023,
    },
    {
      citation:
        'Krause PJ, Auwaerter PG, Bannuru RR, et al. Clinical Practice Guidelines by the Infectious Diseases Society of America (IDSA): 2020 Guideline on Diagnosis and Management of Babesiosis. Clin Infect Dis. 2021;72(2):e49-e64.',
      year: 2021,
    },
    {
      citation:
        'World Health Organization (WHO). Typhoid and other invasive salmonellosis: Surveillance and XDR antimicrobial guidance. Geneva: WHO.',
      year: 2023,
    },
  ],
  fields: [conditionField, incubationField, weightField, severeField, pediatricField, pregnantField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(nonEndemicImportedFeversCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const condition = String(inputs.condition ?? 'traveler_triage');
    const incubation = String(inputs.incubationWindow ?? 'lt14');
    const weightKg =
      getCanonicalNumberValue(weightField, inputs.weightKg as NumberInputValue).canonicalValue ??
      70;
    const severe = inputs.severeOrXdr === true;
    const isPeds = inputs.pediatric === true || weightKg < 40;
    const pregnant = inputs.pregnant === true;

    if (condition === 'typhoid_enteric') {
      const ceftriMg = isPeds ? roundClinical(Math.min(weightKg * 75, 2000), 0) : 2000;
      const azithMg = isPeds ? roundClinical(Math.min(weightKg * 20, 1000), 0) : 1000;

      const secondaryResults: SecondaryResultItem[] = [
        {
          label: 'Ceftriaxona IV (Hospitalizado / Embarazo / Empírico)',
          formattedValue: `${formatClinicalNumber(ceftriMg, 0)} mg IV c/24 h × 10–14 d`,
          unit: isPeds ? '50–75 mg/kg/d (máx 2,000 mg/d)' : 'Dosis adulto estándar',
        },
        {
          label: 'Azitromicina VO (No complicada · alternativa sensible)',
          formattedValue: `${formatClinicalNumber(azithMg, 0)} mg VO c/24 h × 5–7 d`,
          unit: isPeds ? '20 mg/kg/d (máx 1,000 mg/d)' : '1,000 mg día 1 (o 500–1,000 mg/d)',
          note: 'Si antecedente de viaje a Pakistán o sospecha de S. Typhi XDR: utilizar Meropenem IV (20–40 mg/kg c/8 h) ± Azitromicina.',
        },
      ];

      return {
        primaryResult: {
          label: severe ? 'Manejo Tifoidea Grave / XDR' : 'Terapia inicial Fiebre Tifoidea',
          value: severe ? 3 : ceftriMg,
          formattedValue: severe
            ? 'Meropenem / Ceftriaxona IV + Dexametasona si SNC/choque'
            : `Ceftriaxona ${formatClinicalNumber(ceftriMg, 0)} mg IV/d`,
          unit: severe ? 'Vigilar perforación ileal (3.ª sem)' : 'O Azitromicina VO si leve',
        },
        secondaryResults,
        severity: severe ? 'critical' : 'high',
        riskClassification: severe
          ? 'Fiebre Tifoidea Grave, Complicada o Sospecha XDR'
          : 'Fiebre Tifoidea / Entérica — Alto Riesgo de Complicaciones Intestinales',
        clinicalInterpretation:
          'Fiebre prolongada en escalera con bradicardia relativa (signo de Faget), cefalea frontal y dolor abdominal; entre la 2.ª y 3.ª semana pueden aparecer enterorragia o perforación ileal (dolor súbito + aire libre subdiafragmático).',
        guidance: [
          'Tomar 2 juegos de hemocultivos antes de iniciar antibióticos (máxima sensibilidad en la 1.ª semana); NO confiar en prueba de Widal aislada.',
          severe
            ? 'Si encefalopatía tifoidea (delirio, estupor, coma) o choque séptico: añadir Dexametasona 3 mg/kg IV seguida de 1 mg/kg c/6 h × 8 dosis (48 h) junto con Meropenem o Ceftriaxona IV y valoración quirúrgica urgente si signos peritoneales.'
            : 'Evitar fluoroquinolonas empíricas en viajeros procedentes de Asia Meridional; ajustar esquema definitivo según antibiograma.',
        ],
        formulaUsed: 'WHO / CDC Typhoid Guidance: Ceftriaxona 50–75 mg/kg/d (máx 2 g) o Azitromicina 20 mg/kg/d (máx 1 g)',
        inputsSummary: `Entidad: Tifoidea · Peso: ${formatClinicalNumber(weightKg, 1)} kg · Grave/XDR: ${severe ? 'Sí' : 'No'}`,
      };
    }

    if (condition === 'q_fever') {
      return {
        primaryResult: {
          label: severe ? 'Fiebre Q Crónica / Endocarditis' : 'Fiebre Q Aguda',
          value: severe ? 3 : 100,
          formattedValue: severe
            ? 'Doxiciclina + Hidroxicloroquina ≥ 18–24 m'
            : pregnant
              ? 'TMP-SMX (valorar en embarazo)'
              : 'Doxiciclina 100 mg VO c/12 h × 14 d',
          unit: severe ? 'Endocarditis con hemocultivos negativos' : 'Incubación 2–3 semanas',
        },
        secondaryResults: [
          {
            label: 'Serología confirmatoria',
            formattedValue: 'IgG/IgM Fase II (aguda) vs. Fase I ≥ 1:800 (crónica)',
            unit: 'Repetir a las 2–3 semanas y ecocardiograma si valvulopatía',
          },
        ],
        severity: severe ? 'critical' : pregnant ? 'high' : 'moderate',
        riskClassification: severe
          ? 'Fiebre Q Crónica / Infección Vascular o Endocarditis'
          : 'Fiebre Q Aguda (Coxiella burnetii — Zoonosis Cosmopolita)',
        clinicalInterpretation:
          'Zoonosis no restringida al trópico adquirida por inhalación de aerosoles de rumiantes (ovejas, cabras, vacas). Cursa con síndrome pseudogripal, neumonía atípica o hepatitis febril; en valvulópatas, inmunocomprometidos o gestantes puede cronificar a endocarditis con hemocultivos negativos.',
        guidance: [
          pregnant
            ? 'En embarazo con Fiebre Q aguda: Trimetoprim-Sulfametoxazol 160/800 mg VO c/12 h (evitando último mes si riesgo kernícterus) y seguimiento serológico estrecho para prevenir infección placentaria y aborto.'
            : 'En Fiebre Q aguda: iniciar Doxiciclina 100 mg VO c/12 h × 14 días (en niños < 8 años valorar curso corto de doxiciclina 2.2 mg/kg c/12 h si grave o TMP-SMX si leve).',
          'Realizar ecocardiograma transtorácico y repetir serología de Fase I a los 3 y 6 meses en pacientes con valvulopatía o prótesis vascular para descartar progresión a endocarditis crónica.',
        ],
        formulaUsed: 'CDC Q Fever: Doxiciclina 100 mg c/12 h × 14 d (aguda) · + Hidroxicloroquina ≥ 18 m (crónica)',
        inputsSummary: `Entidad: Fiebre Q · Embarazo: ${pregnant ? 'Sí' : 'No'} · Crónica/endocarditis: ${severe ? 'Sí' : 'No'}`,
      };
    }

    if (condition === 'babesiosis') {
      const atovPer12h = isPeds ? roundClinical(Math.min(weightKg * 20, 750), 0) : 750;
      const azithD1 = isPeds ? roundClinical(Math.min(weightKg * 10, 500), 0) : 500;
      const azithMaint = isPeds ? roundClinical(Math.min(weightKg * 5, 250), 0) : 250;

      return {
        primaryResult: {
          label: severe ? 'Babesiosis Grave (IDSA 2020)' : 'Babesiosis Leve–Moderada',
          value: severe ? 3 : atovPer12h,
          formattedValue: severe
            ? 'Azitromicina IV + Atovacuona (± Clindamicina + Quinina)'
            : `Atovacuona ${formatClinicalNumber(atovPer12h, 0)} mg c/12 h + Azitromicina`,
          unit: severe ? 'Considerar exanguinotransfusión si ≥ 10 %' : '× 7–10 días',
        },
        secondaryResults: [
          {
            label: 'Pauta de Azitromicina por peso',
            formattedValue: `Día 1: ${formatClinicalNumber(azithD1, 0)} mg → Luego ${formatClinicalNumber(azithMaint, 0)} mg/d`,
            unit: severe ? '500–1,000 mg/d IV si grave' : '× 7–10 días VO',
          },
        ],
        severity: severe ? 'critical' : 'high',
        riskClassification: severe
          ? 'Babesiosis Grave / Asplenia / Hiperparasitemia (Riesgo de SDRA y Falla Multiorgánica)'
          : 'Babesiosis No Complicada — Confirmar Frotis / PCR',
        clinicalInterpretation:
          'Protozoo intraeritrocitario no endémico en trópicos (propio de zonas templadas con garrapatas Ixodes o postransfusional) que simula malaria en el frotis ("cruz de Malta" en tétradas, sin pigmento hemozoína).',
        guidance: [
          severe
            ? 'Hospitalizar en UCI: Azitromicina IV (500–1,000 mg/d) + Atovacuona VO (o Clindamicina 600 mg IV c/8 h + Quinina 650 mg VO c/8 h, preferida si embarazo o refractariedad) y valorar EXANGUINOTRANSFUSIÓN parcial/total si parasitemia ≥ 10 %, anemia hemolítica grave o disfunción renal/hepática/pulmonar.'
            : `Iniciar Atovacuona ${formatClinicalNumber(atovPer12h, 0)} mg VO c/12 h (con alimentos grasos) + Azitromicina durante 7–10 días; en inmunocomprometidos prolongar al menos 6 semanas hasta negativizar frotis/PCR por ≥ 2 semanas.`,
          'Investigar coinfección transmitida por Ixodes (enfermedad de Lyme / Borrelia burgdorferi y Anaplasma phagocytophilum).',
        ],
        formulaUsed: 'IDSA Babesiosis 2020: Atovacuona + Azitromicina (o Clindamicina + Quinina + exanguinotransfusión)',
        inputsSummary: `Entidad: Babesiosis · Peso: ${formatClinicalNumber(weightKg, 1)} kg · Grave/asplenia: ${severe ? 'Sí' : 'No'}`,
      };
    }

    // Traveler / Non-endemic fever triage
    const windowDetails =
      incubation === 'lt14'
        ? {
            title: 'Incubación Corta (< 14 días tras retorno)',
            differentials:
              'Malaria (P. falciparum), Dengue/Chikungunya/Zika, Fiebre Amarilla (3–6 d), Fiebre Tifoidea, Rickettsiosis, Leptospirosis, Influenza/COVID-19 y FVH tempranas (Ébola/Marburgo/Lassa/FHCC).',
            urgency: severe ? 'critical' : 'high',
          }
        : incubation === '14_21'
          ? {
              title: 'Incubación Intermedia (14–21 días tras retorno)',
              differentials:
                'Malaria (P. falciparum y P. vivax), Fiebre Tifoidea, Leptospirosis, Fiebre Q, Brucelosis, Hepatitis A, Citomegalovirus/EBV y límite de vigilancia de FVH (hasta 21 días para Ébola/Lassa/Marburgo).',
              urgency: severe ? 'critical' : 'high',
            }
          : {
              title: 'Incubación Prolongada (> 21 días tras retorno)',
              differentials:
                'Malaria por P. vivax / P. ovale / P. malariae (hipnozoítos hasta meses después), Absceso hepático amebiano, Tuberculosis, Brucelosis, Fiebre Q crónica, Leishmaniasis visceral, Esquistosomiasis (fiebre de Katayama) y VIH agudo.',
              urgency: severe ? 'critical' : 'moderate',
            };

    return {
      primaryResult: {
        label: 'Estratificación del Viajero Febril',
        value: incubation === 'lt14' ? 1 : incubation === '14_21' ? 2 : 3,
        formattedValue: windowDetails.title,
        unit: 'Descartar Malaria y FVH primero',
      },
      secondaryResults: [
        {
          label: 'Diagnósticos diferenciales prioritarios',
          formattedValue: windowDetails.differentials,
          unit: 'Según período de incubación',
        },
      ],
      severity: windowDetails.urgency as 'high' | 'moderate' | 'critical',
      riskClassification: `${windowDetails.title} — Algoritmo de Descarte de Fiebres No Endémicas`,
      clinicalInterpretation:
        'Todo síndrome febril en un viajero reciente o con patología no habitual de la región exige cruzar geografía de viaje, período exacto de incubación y exposiciones específicas (picaduras, agua dulce, lácteos no pasteurizados, cuevas, contacto sexual).',
      guidance: [
        'PASO 1 (Urgente): si procedió de área malárica (hasta 1 año previo), realizar gota gruesa + prueba rápida de malaria INMEDIATA; una primera gota gruesa negativa NO descarta malaria (repetir cada 12–24 h hasta 3 muestras).',
        'PASO 2 (Bioseguridad): si ≤ 21 días desde área con brote de fiebre hemorrágica viral (Ébola, Marburgo, Lassa, FHCC), aislar antes de puncionar y notificar a epidemiología.',
        'PASO 3 (Estudios base): biometría hemática (eosinofilia sugiere helmintos/Katayama; trombocitopenia sugiere malaria, dengue, rickettsia o FVH), 2 hemocultivos (tifoidea/brucela), AST/ALT, bilirrubinas, creatinina y radiografía de tórax.',
      ],
      formulaUsed: 'CDC Yellow Book: Clasificación de fiebre importada por ventana de incubación (< 14 d / 14–21 d / > 21 d)',
      inputsSummary: `Ventana: ${windowDetails.title} · Signos graves: ${severe ? 'Sí' : 'No'}`,
    };
  },
};
