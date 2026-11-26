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
  id: 'disease',
  label: 'Fiebre endémica tropical o zoonosis vectorial',
  type: 'select',
  defaultValue: 'chikungunya',
  options: [
    { value: 'chikungunya', label: 'Chikungunya (Alfavirus: fase aguda, subaguda y crónica)' },
    { value: 'zika', label: 'Virus Zika (Flavivirus: embarazo, SGB y prevención sexual)' },
    { value: 'chagas_acute', label: 'Enfermedad de Chagas Aguda / Oral (Trypanosoma cruzi)' },
    { value: 'rickettsiosis', label: 'Rickettsiosis / Fiebre Manchada (Rickettsia rickettsii)' },
    { value: 'brucellosis', label: 'Brucelosis (Brucella spp. — fiebre ondulante)' },
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
  defaultValue: '60',
  min: 2,
  max: 250,
  placeholder: 'Ej. 60',
  helpText:
    'Calcula dosis exactas por peso de Benznidazol/Nifurtimox (Chagas), Doxiciclina pediátrica (Rickettsiosis) y Estreptomicina/Gentamicina (Brucelosis).',
};

const pediatricField: BooleanFieldDef = {
  id: 'pediatricUnder8Or45',
  label: 'Paciente pediátrico (< 8 años o < 45 kg)',
  type: 'boolean',
  defaultValue: false,
};

const pregnantField: BooleanFieldDef = {
  id: 'pregnant',
  label: 'Paciente embarazada (contraindica tetraciclinas y tripanocidas salvo riesgo vital)',
  type: 'boolean',
  defaultValue: false,
};

const severeField: BooleanFieldDef = {
  id: 'severeComplications',
  label: 'Complicación grave o atípica (miocarditis, meningoencefalitis, SGB, endocarditis, trombocitopenia/CID o transmisión vertical)',
  type: 'boolean',
  defaultValue: false,
};

export const endemicArbovirusesCalculator: CalculatorDefinition = {
  id: 'endemic-arboviruses-fevers',
  name: 'Fiebres Endémicas Tropicales y Zoonosis: Chikungunya, Zika, Chagas Agudo, Rickettsiosis y Brucelosis',
  shortName: 'Fiebres Endémicas',
  primarySpecialty: 'infectologia',
  secondarySpecialties: ['medicina-interna', 'pediatria', 'gineco-obstetricia', 'urgencias'],
  subcategory: 'dosificacion',
  keywords: [
    'fiebres endemicas',
    'chikungunya',
    'zika',
    'guillain barre',
    'microcefalia',
    'chagas',
    'trypanosoma cruzi',
    'benznidazol',
    'nifurtimox',
    'rickettsia',
    'rickettsiosis',
    'fiebre manchada',
    'brucelosis',
    'brucella',
    'doxiciclina',
  ],
  description:
    'Abordaje diagnóstico, cálculo terapéutico por peso y prevención de complicaciones graves en fiebres endémicas de áreas tropicales/subtropicales (complementario a Dengue, Malaria y Leptospirosis).',
  clinicalIndication:
    'Diagnóstico diferencial del síndrome febril endémico, ajuste antibiótico/antiparasitario por peso y manejo de complicaciones en embarazo y pediatría.',
  validatedPopulation:
    'Adultos, embarazadas y pacientes pediátricos en áreas endémicas (guías OPS/OMS, CDC y AAP Red Book).',
  contraindications: [
    'En Chikungunya o Zika durante fase febril aguda: CONTRAINDICADOS AINEs y AAS hasta haber descartado Dengue por riesgo hemorrágico.',
    'En embarazo: CONTRAINDICADA Doxiciclina en Brucelosis (preferir TMP-SMX + Rifampicina) y CONTRAINDICADOS Benznidazol/Nifurtimox en Chagas crónico o leve (diferir hasta posparto; valorar solo en Chagas agudo grave con riesgo vital materno).',
    'NO retrasar Doxiciclina en sospecha de Rickettsiosis/Fiebre Manchada esperando serología: la mortalidad se dispara si se inicia después del día 5 (cursos cortos ≤ 21 d de doxiciclina son seguros en < 8 años según AAP/CDC).',
  ],
  limitations: [
    'En los primeros 5–7 días, Chikungunya, Zika y Dengue comparten síntomas inespecíficos; priorizar la vigilancia de signos de alarma de dengue.',
    'Las serologías para Rickettsia y Brucella pueden ser negativas en la primera semana; iniciar manejo empírico ante alta sospecha clínica.',
  ],
  requiredLabsNote:
    'Chikungunya/Zika: RT-PCR (días 1–5) o IgM (> 5 d) + biometría hemática para descartar dengue. Chagas agudo: microhematocrito/gota gruesa/Strout/PCR. Brucelosis: hemocultivos prolongados + Rosa de Bengala/SAT. Rickettsiosis: clínica + IFI pareada.',
  version: 'OPS/OMS Arbovirosis & Chagas · CDC Rickettsial Diseases · AAP Red Book',
  references: [
    {
      citation:
        'Organización Panamericana de la Salud (OPS). Directrices para el diagnóstico clínico y el tratamiento del dengue, el chikunguña y el zika; y Guía para el diagnóstico y el tratamiento de la enfermedad de Chagas. Washington, D.C.: OPS.',
      year: 2022,
    },
    {
      citation:
        'Biggs HM, Behravesh CB, Bradley KK, et al. Diagnosis and Management of Tickborne Rickettsial Diseases: Rocky Mountain Spotted Fever and Other Spotted Fever Group Rickettsioses. MMWR Recomm Rep. 2016;65(2):1-44.',
      year: 2016,
    },
    {
      citation:
        'Centers for Disease Control and Prevention (CDC) & WHO. Zika Virus Clinical Guidance & Brucellosis Reference Guide.',
      year: 2024,
    },
  ],
  fields: [diseaseField, weightField, pediatricField, pregnantField, severeField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(endemicArbovirusesCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const disease = String(inputs.disease ?? 'chikungunya');
    const weightKg =
      getCanonicalNumberValue(weightField, inputs.weightKg as NumberInputValue).canonicalValue ??
      60;
    const isPeds = inputs.pediatricUnder8Or45 === true || weightKg < 45;
    const pregnant = inputs.pregnant === true;
    const severe = inputs.severeComplications === true;

    if (disease === 'chagas_acute') {
      const benzLow = roundClinical(Math.min(weightKg * 5, 300), 0);
      const benzHigh = roundClinical(Math.min(weightKg * (isPeds ? 10 : 7), isPeds ? 400 : 350), 0);
      const nifuLow = roundClinical(weightKg * (isPeds ? 10 : 8), 0);
      const nifuHigh = roundClinical(Math.min(weightKg * (isPeds ? 15 : 10), 700), 0);

      const secondaryResults: SecondaryResultItem[] = [
        {
          label: 'Benznidazol (1.ª línea OPS · × 60 días)',
          formattedValue: `${formatClinicalNumber(benzLow, 0)}–${formatClinicalNumber(benzHigh, 0)} mg/día VO`,
          unit: 'Dividido c/12 h (después de comidas)',
          note: isPeds
            ? 'Pediatría/neonatos: 5–10 mg/kg/día (en neonatos iniciar 5 mg/kg/d y escalar si buena tolerancia).'
            : 'Adultos: 5–7 mg/kg/día (habitualmente tope 300–400 mg/día). Vigilar dermatitis, neuropatía y neutropenia.',
        },
        {
          label: 'Nifurtimox (Alternativa · × 60 días)',
          formattedValue: `${formatClinicalNumber(nifuLow, 0)}–${formatClinicalNumber(nifuHigh, 0)} mg/día VO`,
          unit: 'Dividido c/8 h',
          note: 'Vigilar anorexia, pérdida de peso, cefalea y síntomas neuropsiquiátricos.',
        },
      ];

      return {
        primaryResult: {
          label: 'Benznidazol dosis total diaria',
          value: benzLow,
          formattedValue: `${formatClinicalNumber(benzLow, 0)}–${formatClinicalNumber(benzHigh, 0)} mg/d`,
          unit: pregnant ? 'Valorar riesgo-beneficio en embarazo' : '× 60 días (c/12 h)',
        },
        secondaryResults,
        severity: severe ? 'critical' : 'high',
        riskClassification: severe
          ? 'Chagas Agudo Complicado (Miocarditis / Meningoencefalitis / Reactivación)'
          : 'Enfermedad de Chagas Aguda / Transmisión Oral — Indicación Absoluta de Tratamiento',
        clinicalInterpretation:
          'La fase aguda (especialmente brotes por transmisión oral y reactivación en VIH/inmunocompromiso) tiene alta parasitemia, cursa con fiebre prolongada y edema palpebral/miocarditis, y logra tasas de curación > 80 % si se trata precozmente.',
        guidance: [
          pregnant
            ? 'En embarazo, los tripanocidas están contraindicados de rutina; solo considerar en Chagas agudo con miocarditis/encefalitis potencialmente mortal tras junta médica, o iniciar Benznidazol inmediatamente en el posparto y evaluar al recién nacido por micrométodo/PCR.'
            : `Iniciar Benznidazol ${formatClinicalNumber(benzLow, 0)}–${formatClinicalNumber(benzHigh, 0)} mg/día dividido c/12 h × 60 días con biometría hemática y pruebas hepáticas basales y a las 3 semanas.`,
          'Si miocarditis aguda (taquicardia desproporcionada, bloqueo AV, derrame pericárdico) o meningoencefalitis (VIH): manejo en hospital/UCI junto con el tratamiento etiológico.',
        ],
        formulaUsed: 'OPS Chagas: Benznidazol 5–7 mg/kg/d adultos (5–10 mg/kg/d niños) × 60 d',
        inputsSummary: `Patología: Chagas agudo · Peso: ${formatClinicalNumber(weightKg, 1)} kg · Embarazo: ${pregnant ? 'Sí' : 'No'}`,
      };
    }

    if (disease === 'rickettsiosis') {
      const doxyDosePer12h = isPeds ? roundClinical(Math.min(weightKg * 2.2, 100), 0) : 100;
      const chloramPer6h = roundClinical(Math.min(weightKg * 12.5, 750), 0);

      return {
        primaryResult: {
          label: 'Doxiciclina de elección (SIN esperar serología)',
          value: doxyDosePer12h,
          formattedValue: `${formatClinicalNumber(doxyDosePer12h, 0)} mg VO/IV c/12 h`,
          unit: isPeds ? '2.2 mg/kg c/12 h (< 45 kg)' : 'Dosis adulto estándar',
        },
        secondaryResults: [
          {
            label: 'Duración mínima recomendada',
            formattedValue: '7–10 días (y ≥ 3 días afebril)',
            unit: 'Seguro en < 8 años (< 21 días)',
          },
          {
            label: 'Alternativa extrema (solo embarazo grave si no tolera doxiciclina)',
            formattedValue: `Cloranfenicol ${formatClinicalNumber(chloramPer6h, 0)} mg IV c/6 h`,
            unit: '12.5 mg/kg c/6 h (evitar cerca del parto: síndrome gris)',
            note: 'En Rickettsiosis grave en embarazo, el CDC acepta cursos cortos de doxiciclina si el riesgo materno-fetal supera otras opciones.',
          },
        ],
        severity: severe ? 'critical' : 'high',
        riskClassification: severe
          ? 'Rickettsiosis / Fiebre Manchada Grave (Vasculitis / CID / Choque)'
          : 'Sospecha de Rickettsiosis — Urgencia Antibiótica (Ventana Crítica ≤ 5 días)',
        clinicalInterpretation:
          'Rickettsia rickettsii causa lesión endotelial sistémica con fiebre alta, cefalea intensa, mialgias y exantema que inicia en muñecas/tobillos afectando palmas y plantas; la hiponatremia y trombocitopenia apoyan el diagnóstico.',
        guidance: [
          `Iniciar INMEDIATAMENTE Doxiciclina ${formatClinicalNumber(doxyDosePer12h, 0)} mg c/12 h (IV si vómitos, encefalopatía o choque) ante la sospecha clínica; esperar resultados de IFI retrasa el tratamiento más allá del día 5 y eleva drásticamente la mortalidad.`,
          'Evitar sulfonamidas (TMP-SMX): pueden empeorar la gravedad clínica de las rickettsiosis.',
        ],
        formulaUsed: 'CDC/AAP: Doxiciclina 100 mg c/12 h (≥ 45 kg) o 2.2 mg/kg c/12 h (< 45 kg)',
        inputsSummary: `Patología: Rickettsiosis · Peso: ${formatClinicalNumber(weightKg, 1)} kg · Pediátrico: ${isPeds ? 'Sí' : 'No'}`,
      };
    }

    if (disease === 'brucellosis') {
      const strepMg = roundClinical(Math.min(weightKg * 15, 1000), 0);
      const gentMg = roundClinical(weightKg * 5, 0);
      const useAlternative = pregnant || weightKg < 30;

      return {
        primaryResult: {
          label: 'Esquema combinado Brucelosis',
          value: useAlternative ? 6 : 100,
          formattedValue: useAlternative ? 'TMP-SMX + Rifampicina × 6 sem' : 'Doxiciclina 100 mg c/12 h × 6 sem',
          unit: useAlternative ? 'Seguro en < 8 a / embarazo' : '+ Aminoglucósido o Rifampicina',
        },
        secondaryResults: [
          {
            label: 'Segundo fármaco (adulto / ≥ 8 años)',
            formattedValue: `Estreptomicina ${formatClinicalNumber(strepMg, 0)} mg IM/d (14–21 d)`,
            unit: `o Gentamicina ${formatClinicalNumber(gentMg, 0)} mg IV/IM/d (7–14 d)`,
            note: 'La combinación Doxiciclina + Aminoglucósido ofrece menor tasa de recaída que Doxiciclina + Rifampicina (600–900 mg/d × 6 sem).',
          },
        ],
        severity: severe ? 'critical' : 'moderate',
        riskClassification: severe
          ? 'Brucelosis Complicada (Endocarditis / Neurobrucelosis / Espondilitis)'
          : 'Brucelosis Aguda o Subaguda — Terapia Dual Prolongada',
        clinicalInterpretation:
          'Fiebre ondulante asociada a lácteos no pasteurizados o ganado; la monoterapia conlleva tasas muy altas de recaída (> 30 %) y riesgo de localización osteoarticular (sacroileítis) o endocarditis.',
        guidance: [
          useAlternative
            ? 'En menores de 8 años o embarazo: evitar doxiciclina y estreptomicina; indicar Trimetoprim-Sulfametoxazol (TMP 8–10 mg/kg/d en niños; 160/800 mg c/12 h en embarazo sin déficit G6PD, evitando último mes si riesgo kernícterus) + Rifampicina × 6 semanas.'
            : 'Adultos y ≥ 8 años: Doxiciclina 100 mg VO c/12 h × 6 semanas + Estreptomicina IM (14–21 d) o Gentamicina (7–14 d) o Rifampicina × 6 semanas.',
          'Si endocarditis (soplo nuevo, falla cardíaca) o neurobrucelosis: triple esquema (Doxiciclina + Rifampicina + Ceftriaxona/TMP-SMX o aminoglucósido) por 3–6 meses y valoración quirúrgica valvular.',
        ],
        formulaUsed: 'OMS/CDC Brucelosis: Terapia dual × 6 semanas (Doxiciclina + Aminoglucósido/Rifampicina)',
        inputsSummary: `Patología: Brucelosis · Peso: ${formatClinicalNumber(weightKg, 1)} kg · Embarazo/< 8 a: ${useAlternative ? 'Sí' : 'No'}`,
      };
    }

    if (disease === 'zika') {
      return {
        primaryResult: {
          label: 'Prioridad clínica Virus Zika',
          value: pregnant || severe ? 2 : 1,
          formattedValue: pregnant ? 'Tamizaje fetal + RT-PCR/IgM' : severe ? 'Vigilar SGB / Neuropatía' : 'Manejo sintomático + Barrera',
          unit: 'Incubación 3–14 días',
        },
        secondaryResults: [
          {
            label: 'Prevención de transmisión sexual',
            formattedValue: 'Hombres: 3 meses · Mujeres: 2 meses',
            unit: 'Preservativo o abstinencia (CDC / OMS)',
          },
        ],
        severity: severe ? 'critical' : pregnant ? 'high' : 'low',
        riskClassification: pregnant
          ? 'Virus Zika en Embarazo — Riesgo de Síndrome Congénito por Zika'
          : severe
            ? 'Complicación Neurológica Asociada a Zika (Síndrome de Guillain-Barré)'
            : 'Infección Aguda por Virus Zika (Adulto No Gestante)',
        clinicalInterpretation:
          'Aunque suele ser un cuadro leve autolimitado (exantema maculopapular, conjuntivitis no purulenta, febrícula), el virus Zika es neurotrópico y teratogénico (microcefalia, calcificaciones intracraneales, pérdida fetal) y desencadena Síndrome de Guillain-Barré.',
        guidance: [
          'Control térmico y analgésico solo con Paracetamol hasta descartar Dengue (evitar AINEs/AAS en fase febril).',
          pregnant
            ? 'En embarazo: confirmar con RT-PCR/IgM, realizar ecografía morfológica seriada fetal cada 3–4 semanas (circunferencia cefálica, ventrículos, calcificaciones) y seguimiento neonatal neurosensorial al nacer.'
            : 'Vigilar aparición de parestesias o debilidad ascendente simétrica en las 2–4 semanas siguientes (SGB: hospitalizar para monitoreo de capacidad vital e inmunoglobulina IV/plasmaféresis).',
        ],
        formulaUsed: 'Guías OPS/CDC Zika: Vigilancia obstétrica, SGB y prevención sexual (3 m / 2 m)',
        inputsSummary: `Patología: Zika · Embarazo: ${pregnant ? 'Sí' : 'No'} · Complicación: ${severe ? 'Sí' : 'No'}`,
      };
    }

    // Chikungunya
    return {
      primaryResult: {
        label: 'Manejo de Chikungunya',
        value: severe ? 3 : 1,
        formattedValue: severe ? 'Forma Atípica Grave / Intraparto' : 'Fase Aguda: Paracetamol (NO AINEs)',
        unit: 'Incubación 3–7 días',
      },
      secondaryResults: [
        {
          label: 'Fases articulares (OPS)',
          formattedValue: 'Aguda ≤ 21 d · Subaguda 22–90 d · Crónica > 3 m',
          unit: 'AINEs/corticoides solo tras fase aguda y sin dengue',
        },
      ],
      severity: severe ? 'critical' : pregnant ? 'high' : 'moderate',
      riskClassification: severe
        ? 'Chikungunya Atípico / Grave (Miocarditis, Encefalitis o Transmisión Vertical Intraparto)'
        : 'Chikungunya Agudo — Prioridad Descartar Dengue y Prevenir Cronicidad',
      clinicalInterpretation:
        'Fiebre súbita > 38.5 °C con poliartralgia simétrica distal incapacitante. En > 30–40 % de adultos evoluciona a artritis subaguda o crónica; en embarazadas cercanas al parto puede causar infección neonatal grave (encefalopatía, trombocitopenia, miocardiopatía).',
      guidance: [
        'Fase aguda (primeros 7–14 días): hidratación oral y Paracetamol únicamente; EVITAR AINEs, AAS y corticoides sistémicos hasta descartar dengue y por riesgo de rebote articular.',
        'Fase subaguda (> 21 días, dengue descartado) / crónica (> 3 meses): AINEs pautados, fisioterapia y, si sinovitis persistente refractaria, cursos cortos de prednisona o valoración reumatológica (metotrexato/hidroxicloroquina).',
        pregnant
          ? 'Si la gestante presenta fiebre/viremia intraparto: observar estrechamente al recién nacido hospitalizado durante al menos 5–7 días tras el nacimiento (la cesárea electiva no elimina completamente el riesgo pero el parto con viremia exige monitoreo neonatal en UCIN).'
          : 'Vigilar signos de alarma atípicos: dolor torácico/arritmias (miocarditis), confusión/convulsiones (encefalitis) o lesiones ampollosas extensas en lactantes.',
      ],
      formulaUsed: 'Guías OPS Chikungunya: Estratificación aguda/subaguda/crónica + seguridad frente a dengue',
      inputsSummary: `Patología: Chikungunya · Embarazo: ${pregnant ? 'Sí' : 'No'} · Grave/atípica: ${severe ? 'Sí' : 'No'}`,
    };
  },
};
