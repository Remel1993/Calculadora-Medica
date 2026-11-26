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

const syndromeField: SelectFieldDef = {
  id: 'syndrome',
  label: 'Síndrome clínico por Neisseria gonorrhoeae',
  type: 'select',
  defaultValue: 'uncomplicated_urogenital_rectal',
  options: [
    {
      value: 'uncomplicated_urogenital_rectal',
      label: 'Uretritis, cervicitis o proctitis no complicada',
    },
    {
      value: 'pharyngeal',
      label: 'Infección gonocócica faríngea (requiere prueba de curación)',
    },
    {
      value: 'pid_epididymitis',
      label: 'Enfermedad inflamatoria pélvica (EIP) o epididimitis aguda',
    },
    {
      value: 'disseminated_dgi',
      label: 'Infección gonocócica diseminada (IGD: artritis-dermatitis / SNC / endocarditis)',
    },
    {
      value: 'neonatal_ophthalmia',
      label: 'Oftalmía neonatal gonocócica (recién nacido)',
    },
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
  min: 1,
  max: 280,
  placeholder: 'Ej. 70 (≥ 150 kg duplica dosis a 1 g)',
  helpText:
    'CDC STI 2021: Ceftriaxona 500 mg IM si < 150 kg y 1,000 mg (1 g) IM si ≥ 150 kg. En recién nacidos: 25–50 mg/kg IV/IM.',
};

const chlamydiaExcludedField: BooleanFieldDef = {
  id: 'chlamydiaExcluded',
  label: 'Coinfección por Chlamydia trachomatis descartada por prueba NAAT/PCR negativa',
  type: 'boolean',
  defaultValue: false,
};

const pregnantField: BooleanFieldDef = {
  id: 'pregnant',
  label: 'Paciente embarazada (contraindica doxiciclina)',
  type: 'boolean',
  defaultValue: false,
};

const allergyField: BooleanFieldDef = {
  id: 'severeCephalosporinAllergy',
  label: 'Alergia grave (anafilaxia / reacción IgE mediada) a cefalosporinas',
  type: 'boolean',
  defaultValue: false,
};

const dgiCnsField: BooleanFieldDef = {
  id: 'dgiCnsOrEndocarditis',
  label: 'Compromiso meníngeo o endocárdico (si IGD)',
  type: 'boolean',
  defaultValue: false,
  visibleWhen: (inputs) => inputs.syndrome === 'disseminated_dgi',
};

export const gonorrheaCalculator: CalculatorDefinition = {
  id: 'gonorrhea-sti',
  name: 'Infección por Neisseria gonorrhoeae (Gonorrea): Esquemas de Tratamiento (CDC STI 2021 / OMS)',
  shortName: 'Gonorrea (CDC / OMS)',
  primarySpecialty: 'infectologia',
  secondarySpecialties: ['urologia', 'gineco-obstetricia', 'urgencias', 'medicina-interna'],
  subcategory: 'dosificacion',
  keywords: [
    'gonorrea',
    'neisseria gonorrhoeae',
    'ceftriaxona',
    'uretritis',
    'cervicitis',
    'proctitis',
    'faringea',
    'chlamydia',
    'doxiciclina',
    'azitromicina',
    'gentamicina',
    'eip',
    'epididimitis',
    'igd',
    'oftalmia neonatal',
    'its',
    'cdc',
  ],
  description:
    'Selección y dosificación de antimicrobianos para gonorrea no complicada, faríngea, EIP/epididimitis, infección diseminada y oftalmía neonatal según guías CDC STI 2021 y actualización OMS.',
  clinicalIndication:
    'Prescripción empírica o dirigida en infección gonocócica con ajuste por peso (≥ 150 kg), embarazo, alergia grave a cefalosporinas y cobertura de Chlamydia.',
  validatedPopulation:
    'Adultos, adolescentes, embarazadas y recién nacidos con sospecha sindrómica o confirmación microbiológica de N. gonorrhoeae.',
  contraindications: [
    'NO usar azitromicina ni fluoroquinolonas (ciprofloxacino) en monoterapia empírica por alta resistencia antimicrobiana global.',
    'CONTRAINDICADA Doxiciclina durante el embarazo; sustituir por Azitromicina 1 g VO dosis única cuando no se haya descartado Chlamydia.',
    'En neonatos con hiperbilirrubinemia o infusión simultánea de calcio IV, evitar Ceftriaxona y utilizar Cefotaxima.',
  ],
  limitations: [
    'Diferencia entre guías: CDC 2021 elevó Ceftriaxona a 500 mg IM (1 g si ≥ 150 kg) y reemplazó Azitromicina por Doxiciclina 7 días si Chlamydia no está descartada; las guías OMS (2024) en abordaje sindrómico sin NAAT mantienen Ceftriaxona IM + Azitromicina 1 g VO en dosis única.',
    'En alergia grave a cefalosporinas, el esquema Gentamicina 240 mg IM + Azitromicina 2 g VO tiene menor eficacia en gonorrea faríngea y exige prueba de curación obligatoria.',
  ],
  requiredLabsNote:
    'Idealmente NAAT/PCR en orina, exudado cervical/uretral, rectal o faríngeo previo al antibiótico, además de tamizaje para VIH y sífilis (VDRL/RPR). Cultivo + antibiograma si fracaso terapéutico o IGD.',
  version: 'CDC STI Treatment Guidelines 2021 · WHO STI Guidelines 2024',
  references: [
    {
      citation:
        'Workowski KA, Bachmann LH, Chan PA, et al. Sexually Transmitted Infections Treatment Guidelines, 2021 (Gonococcal Infections). MMWR Recomm Rep. 2021;70(4):1-187.',
      year: 2021,
    },
    {
      citation:
        'World Health Organization (WHO). Updated recommendations for the treatment of Neisseria gonorrhoeae, Chlamydia trachomatis, and Treponema pallidum. Geneva: WHO; 2024.',
      year: 2024,
    },
  ],
  fields: [
    syndromeField,
    weightField,
    chlamydiaExcludedField,
    pregnantField,
    allergyField,
    dgiCnsField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(gonorrheaCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const syndrome = String(inputs.syndrome ?? 'uncomplicated_urogenital_rectal');
    const weightKg =
      getCanonicalNumberValue(weightField, inputs.weightKg as NumberInputValue).canonicalValue ??
      70;
    const chlamydiaExcluded = inputs.chlamydiaExcluded === true;
    const pregnant = inputs.pregnant === true;
    const severeAllergy = inputs.severeCephalosporinAllergy === true;
    const dgiCns = inputs.dgiCnsOrEndocarditis === true;

    const ceftriaxoneMg = weightKg >= 150 ? 1000 : 500;
    const chlamydiaCotreatment = chlamydiaExcluded
      ? 'No requerida (Chlamydia descartada por NAAT negativa)'
      : pregnant
        ? 'Azitromicina 1 g VO dosis única (segura en embarazo)'
        : 'Doxiciclina 100 mg VO c/12 h × 7 días (CDC) · Alternativa OMS sindrómica: Azitromicina 1 g VO DU';

    if (syndrome === 'neonatal_ophthalmia') {
      const minDose = roundClinical(Math.min(weightKg * 25, 125), 0);
      const maxDose = roundClinical(Math.min(weightKg * 50, 125), 0);
      const whoMaxDose = roundClinical(Math.min(weightKg * 50, 250), 0);
      return {
        primaryResult: {
          label: 'Ceftriaxona neonatal (CDC)',
          value: maxDose,
          formattedValue:
            minDose === maxDose
              ? `${formatClinicalNumber(maxDose, 0)} mg IV/IM DU`
              : `${formatClinicalNumber(minDose, 0)}–${formatClinicalNumber(maxDose, 0)} mg IV/IM DU`,
          unit: '25–50 mg/kg (tope 125 mg CDC / 250 mg OMS)',
        },
        secondaryResults: [
          {
            label: 'Rango pediátrico OMS (tope 250 mg)',
            formattedValue: `${formatClinicalNumber(minDose, 0)}–${formatClinicalNumber(whoMaxDose, 0)} mg`,
            unit: 'IV o IM dosis única',
            note: 'Si ictericia/hiperbilirrubinemia o calcio IV simultáneo: usar Cefotaxima 100 mg/kg IV/IM DU (alternativa segura).',
          },
        ],
        severity: 'critical',
        riskClassification: 'Oftalmía Neonatal Gonocócica — Emergencia Oftalmológica Pediátrica',
        clinicalInterpretation:
          'Riesgo rápido de ulceración corneal, perforación y ceguera irreversible si no se administra cefalosporina sistémica urgente.',
        guidance: [
          'Hospitalizar al recién nacido, tomar cultivo/Tinción de Gram de exudado conjuntival y descartar bacteriemia/meningitis.',
          'Administrar Ceftriaxona sistémica inmediata + irrigación ocular frecuente con solución salina fisiológica (el tratamiento tópico aislado es insuficiente).',
          'Evaluar y tratar simultáneamente a la madre y su(s) pareja(s) sexual(es) para N. gonorrhoeae y C. trachomatis.',
        ],
        formulaUsed: 'Ceftriaxona 25–50 mg/kg IV/IM DU (tope 125 mg CDC / 250 mg OMS)',
        inputsSummary: `Peso RN: ${formatClinicalNumber(weightKg, 1)} kg · Síndrome: Oftalmía neonatal`,
      };
    }

    if (syndrome === 'disseminated_dgi') {
      const doseText = dgiCns ? 'Ceftriaxona 2 g IV c/12 h' : 'Ceftriaxona 1 g IV o IM c/24 h';
      return {
        primaryResult: {
          label: 'Esquema parenteral IGD',
          value: dgiCns ? 2000 : 1000,
          formattedValue: doseText,
          unit: dgiCns ? 'Meningitis (10–14 d) / Endocarditis (≥ 4 sem)' : 'Artritis-dermatitis',
        },
        secondaryResults: [
          {
            label: 'Cobertura Chlamydia asociada',
            formattedValue: chlamydiaExcluded ? 'No requerida' : pregnant ? 'Azitromicina 1 g DU' : 'Doxiciclina × 7 d',
            unit: 'Según NAAT y embarazo',
          },
        ],
        severity: 'critical',
        riskClassification: dgiCns
          ? 'Infección Gonocócica Diseminada con Compromiso de SNC o Endocardio'
          : 'Infección Gonocócica Diseminada (Síndrome Artritis-Dermatitis)',
        clinicalInterpretation:
          'Bacteriemia gonocócica con riesgo de destrucción articular séptica, meningitis o endocarditis valvular.',
        guidance: [
          dgiCns
            ? 'Hospitalización en cuidados intermedios/UCI: Ceftriaxona 2 g IV c/12 h (10–14 días en meningitis; al menos 4 semanas en endocarditis) + valoración por infectología/cardiología.'
            : 'Hospitalizar inicialmente con Ceftriaxona 1 g IV o IM c/24 h; tras 24–48 h de mejoría clínica sostenida puede completarse terapia (≥ 7 días totales) con esquema oral guiado por antibiograma.',
          'Obtener hemocultivos, cultivo de líquido sinovial si artritis, NAAT en sitios mucosos (genital, rectal, faríngeo) y tamizaje de VIH/sífilis.',
        ],
        formulaUsed: dgiCns ? 'CDC STI 2021: Ceftriaxona 2 g IV c/12 h' : 'CDC STI 2021: Ceftriaxona 1 g IV/IM c/24 h',
        inputsSummary: `Síndrome: IGD · SNC/Endocardio: ${dgiCns ? 'Sí' : 'No'} · Chlamydia descartada: ${chlamydiaExcluded ? 'Sí' : 'No'}`,
      };
    }

    if (syndrome === 'pid_epididymitis') {
      return {
        primaryResult: {
          label: 'Ceftriaxona + Doxiciclina 14 d',
          value: ceftriaxoneMg,
          formattedValue: `Ceftriaxona ${ceftriaxoneMg} mg IM DU`,
          unit: `${weightKg >= 150 ? '≥ 150 kg' : '< 150 kg'} + Doxiciclina 14 d`,
        },
        secondaryResults: [
          {
            label: 'Esquema oral complementario',
            formattedValue: pregnant ? 'Evaluar ingreso IV (no Doxiciclina)' : 'Doxiciclina 100 mg c/12 h × 14 d',
            unit: '± Metronidazol 500 mg c/12 h × 14 d en EIP',
            note: 'En EIP ambulatoria CDC 2021 recomienda añadir Metronidazol para cobertura anaerobia.',
          },
        ],
        severity: 'high',
        riskClassification: 'EIP / Epididimitis Aguda Asociada a ITS',
        clinicalInterpretation:
          'Infección ascendente del tracto genital superior con riesgo de absceso tuboovárico, dolor pélvico crónico, embarazo ectópico o infertilidad.',
        guidance: [
          `Administrar Ceftriaxona ${ceftriaxoneMg} mg IM dosis única (${weightKg >= 150 ? 'peso ≥ 150 kg' : 'peso < 150 kg'}).`,
          pregnant
            ? 'En EIP durante el embarazo se recomienda hospitalización e inicio de esquema parenteral seguro en gestación (contraindicada doxiciclina).'
            : 'Completar Doxiciclina 100 mg VO c/12 h × 14 días; si es EIP, asociar Metronidazol 500 mg VO c/12 h × 14 días.',
          'Reevaluar respuesta clínica a las 48–72 h (si empeora o persiste fiebre/dolor, descartar absceso tuboovárico o torsión testicular y hospitalizar para vía IV).',
        ],
        formulaUsed: 'CDC STI 2021: Ceftriaxona (500 mg ó 1,000 mg si ≥ 150 kg) + Doxiciclina 14 d ± Metronidazol',
        inputsSummary: `Síndrome: EIP/Epididimitis · Peso: ${formatClinicalNumber(weightKg, 1)} kg · Embarazo: ${pregnant ? 'Sí' : 'No'}`,
      };
    }

    if (severeAllergy) {
      return {
        primaryResult: {
          label: 'Alternativa por alergia grave',
          value: 240,
          formattedValue: 'Gentamicina 240 mg IM + Azitromicina 2 g VO',
          unit: 'Dosis única (requiere TOC si faríngea)',
        },
        secondaryResults: [
          {
            label: 'Cobertura Chlamydia',
            formattedValue: 'Cubierta con Azitromicina 2 g',
            unit: 'Dosis única',
            note: pregnant ? 'Precaución: evitar gentamicina en embarazo; consultar infectología/desensibilización.' : undefined,
          },
        ],
        severity: 'high',
        riskClassification: 'Gonorrea con Alergia Grave a Cefalosporinas',
        clinicalInterpretation:
          'Esquema alternativo CDC para anafilaxia/alergia IgE a cefalosporinas. Tiene menor tasa de curación en infecciones faríngeas y mayor intolerancia gastrointestinal por Azitromicina 2 g.',
        guidance: [
          pregnant
            ? 'En embarazo con alergia grave a cefalosporinas evitar gentamicina por riesgo otonefrotóxico fetal: consultar infectología para prueba de tolerancia o desensibilización a ceftriaxona.'
            : 'Administrar Gentamicina 240 mg IM dosis única + Azitromicina 2 g VO dosis única (dar con alimentos para reducir náuseas/vómitos).',
          'Realizar prueba de curación (TOC) obligatoria a los 7–14 días si hay compromiso faríngeo o síntomas persistentes.',
        ],
        formulaUsed: 'CDC STI 2021 alternativa: Gentamicina 240 mg IM DU + Azitromicina 2 g VO DU',
        inputsSummary: `Síndrome: ${syndrome} · Alergia grave cefalosporinas: Sí · Embarazo: ${pregnant ? 'Sí' : 'No'}`,
      };
    }

    const isPharyngeal = syndrome === 'pharyngeal';

    return {
      primaryResult: {
        label: 'Tratamiento de primera línea (CDC 2021)',
        value: ceftriaxoneMg,
        formattedValue: `Ceftriaxona ${ceftriaxoneMg} mg IM DU`,
        unit: weightKg >= 150 ? 'Dosis ajustada (≥ 150 kg)' : 'Dosis estándar (< 150 kg)',
      },
      secondaryResults: [
        {
          label: 'Coinfección por Chlamydia trachomatis',
          formattedValue: chlamydiaExcluded
            ? 'No requiere antibiótico adicional'
            : pregnant
              ? 'Azitromicina 1 g VO DU'
              : 'Doxiciclina 100 mg VO c/12 h × 7 d',
          unit: chlamydiaExcluded ? 'NAAT negativa' : 'Cobertura empírica',
          note: chlamydiaCotreatment,
        },
        {
          label: 'Prueba de curación (TOC)',
          formattedValue: isPharyngeal ? 'OBLIGATORIA (7–14 días)' : 'No de rutina si resuelve',
          unit: isPharyngeal ? 'Cultivo o NAAT faríngeo' : 'Re-tamizaje ITS a los 3 meses',
        },
      ],
      severity: isPharyngeal ? 'moderate' : 'low',
      riskClassification: isPharyngeal
        ? 'Infección Gonocócica Faríngea — Mayor Tasa de Falla Terapéutica'
        : 'Infección Gonocócica No Complicada (Urogenital / Rectal)',
      clinicalInterpretation: isPharyngeal
        ? 'La gonorrea faríngea suele ser asintomática y presenta menor penetración antibiótica y mayor riesgo de resistencia; exige Ceftriaxona IM y prueba de curación obligatoria a los 7–14 días.'
        : 'Ceftriaxona IM en dosis única ajustada por peso (500 mg o 1,000 mg si ≥ 150 kg) ofrece eficacia > 99 % en infección urogenital/rectal sensible.',
      guidance: [
        `Administrar Ceftriaxona ${ceftriaxoneMg} mg IM dosis única${chlamydiaExcluded ? '.' : ` más ${pregnant ? 'Azitromicina 1 g VO dosis única' : 'Doxiciclina 100 mg VO c/12 h × 7 días'}.`}`,
        'Notificar y tratar a todas las parejas sexuales de los últimos 60 días; indicar abstinencia sexual hasta 7 días después de completar tratamiento y desaparición de síntomas en ambos.',
        'Tamizaje sistemático de VIH, sífilis y hepatitis B/C; programar nueva prueba para descartar reinfección a los 3 meses.',
      ],
      formulaUsed: 'CDC STI 2021: Ceftriaxona 500 mg IM (< 150 kg) o 1,000 mg IM (≥ 150 kg) ± cobertura Chlamydia',
      inputsSummary: `Sitio: ${isPharyngeal ? 'Faríngeo' : 'Urogenital/rectal'} · Peso: ${formatClinicalNumber(weightKg, 1)} kg · Chlamydia descartada: ${chlamydiaExcluded ? 'Sí' : 'No'}`,
    };
  },
};
