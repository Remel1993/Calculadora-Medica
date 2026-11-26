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
  SeverityLevel,
} from '../types/clinical.ts';

const cd4CountField: NumberFieldDef = {
  id: 'cd4Count',
  label: 'Recuento absoluto de linfocitos T CD4+',
  type: 'number',
  canonicalUnit: 'cél/µL',
  units: [
    { id: 'cells_ul', label: 'cél/µL (/mm³)', toCanonical: (v) => v, min: 0, max: 3000, step: 5 },
  ],
  defaultUnitId: 'cells_ul',
  defaultValue: '165',
  min: 0,
  max: 3000,
  placeholder: '165',
};

const cd4PercentField: NumberFieldDef = {
  id: 'cd4Percent',
  label: 'Porcentaje de CD4+ (opcional)',
  type: 'number',
  canonicalUnit: '%',
  units: [{ id: 'pct', label: '%', toCanonical: (v) => v, min: 1, max: 85, step: 1 }],
  defaultUnitId: 'pct',
  defaultValue: '',
  required: false,
  min: 1,
  max: 85,
  placeholder: '18',
  helpText: 'En ≥ 6 años y adultos, el recuento absoluto de CD4 tiene prioridad sobre el porcentaje según CDC 2014.',
};

const stage3OiField: BooleanFieldDef = {
  id: 'hasStage3Oi',
  label: '¿Presenta condición definitoria de SIDA (Estadio 3)?',
  type: 'boolean',
  defaultValue: false,
  helpText: 'Ej. Pneumocystis jirovecii (PCP), candidiasis esofágica, toxoplasmosis cerebral, criptococosis extrapulmonar, sarcoma de Kaposi, TB extrapulmonar/diseminada o CMV visceral.',
};

const sulfaAllergyField: BooleanFieldDef = {
  id: 'sulfaAllergy',
  label: '¿Alergia o intolerancia grave previa a sulfonamidas (TMP-SMX)?',
  type: 'boolean',
  defaultValue: false,
};

const pregnantField: BooleanFieldDef = {
  id: 'isPregnant',
  label: '¿Paciente embarazada?',
  type: 'boolean',
  defaultValue: false,
};

export const hivCdcCd4ProphylaxisCalculator: CalculatorDefinition = {
  id: 'hiv-cdc-cd4-prophylaxis',
  name: 'VIH/SIDA: Estadificación CDC, Enfermedad Avanzada y Profilaxis de Oportunistas',
  shortName: 'VIH: Estadio CDC y Profilaxis IO',
  primarySpecialty: 'infectologia',
  secondarySpecialties: ['medicina-interna', 'urgencias'],
  subcategory: 'diagnostico',
  keywords: [
    'vih',
    'hiv',
    'sida',
    'cd4',
    'estadio cdc',
    'profilaxis',
    'pneumocystis',
    'pcp',
    'toxoplasmosis',
    'criptococo',
    'mac',
    'oportunistas',
    'tar',
    'tld',
    'minsa',
    'nicaragua',
    'transmision vertical',
  ],
  description:
    'Clasificación oficial CDC (Estadios 1, 2 y 3 / SIDA), identificación de Enfermedad Avanzada por VIH (OMS), esquema MINSA Nicaragua (TLD y prevención vertical) e indicación exacta de profilaxis primaria y tamizajes según recuento de CD4.',
  clinicalIndication:
    'Evaluación inicial y seguimiento de personas con VIH confirmado para definir estadio inmunológico, paquete de tamizaje (CrAg, TB-LAM/IGRA), profilaxis de infecciones oportunistas e inicio de TAR.',
  validatedPopulation: 'Adultos y adolescentes ≥ 6 años con infección por VIH confirmada (incluye lineamientos del Programa Nacional de ITS/VIH/SIDA del MINSA Nicaragua).',
  contraindications: [
    'No utilizar estos puntos de corte absolutos de CD4 en niños < 6 años (en menores de 5 años la inmunosupresión depende de porcentajes y umbrales específicos por edad).',
    'No iniciar profilaxis primaria sin descartar enfermedad oportunista activa (ej. descartar TB activa antes de terapia preventiva anti-TB; descartar MAC diseminada antes de macrólido).',
  ],
  limitations: [
    'En infección aguda por VIH (seroconversión) el recuento de CD4 puede descender transitoriamente sin reflejar inmunosupresión crónica permanente.',
    'La profilaxis frente a MAC (< 50 cél/µL) ya NO se indica de forma rutinaria si se inicia TAR efectivo inmediatamente.',
  ],
  version: 'CDC HIV Case Definition 2014 · NIH/DHHS 2024 · OMS AHD · MINSA Nicaragua (TLD)',
  references: [
    {
      citation:
        'Centers for Disease Control and Prevention (CDC). Revised Surveillance Case Definition for HIV Infection — United States, 2014. MMWR Recomm Rep. 2014;63(RR-03):1-10.',
      year: 2014,
    },
    {
      citation:
        'Panel on Opportunistic Infections in Adults and Adolescents with HIV. Guidelines for the Prevention and Treatment of Opportunistic Infections in Adults and Adolescents with HIV (NIH/CDC/HIVMA-IDSA).',
      year: 2024,
    },
    {
      citation:
        'World Health Organization & Ministerio de Salud de Nicaragua (MINSA). Consolidated guidelines on HIV (WHO 2021) y Normativa de Atención Integral / Prevención de Transmisión Materno-Infantil de VIH y Sífilis (TLD: TDF/3TC/DTG).',
      year: 2023,
    },
  ],
  fields: [cd4CountField, cd4PercentField, stage3OiField, sulfaAllergyField, pregnantField],
  calculate(inputs: CalculatorInputsState) {
    const errors = validateCalculatorInputs(hivCdcCd4ProphylaxisCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors.map((e) => e.message).join(' '));
    }

    const cd4 = roundClinical(
      getCanonicalNumberValue(cd4CountField, inputs.cd4Count as NumberInputValue).canonicalValue!,
      0,
    );
    const cd4Pct = getCanonicalNumberValue(
      cd4PercentField,
      inputs.cd4Percent as NumberInputValue | undefined,
    ).canonicalValue;
    const hasStage3Oi = Boolean(inputs.hasStage3Oi);
    const sulfaAllergy = Boolean(inputs.sulfaAllergy);
    const isPregnant = Boolean(inputs.isPregnant);

    let stageNum = 1;
    let stageLabel = 'Estadio 1 (CD4 ≥ 500 cél/µL)';
    let severity: SeverityLevel = 'low';

    if (hasStage3Oi || cd4 < 200) {
      stageNum = 3;
      stageLabel = hasStage3Oi && cd4 >= 200
        ? 'Estadio 3 / SIDA (por condición definitoria)'
        : 'Estadio 3 / SIDA (CD4 < 200 cél/µL)';
      severity = cd4 < 100 || hasStage3Oi ? 'critical' : 'high';
    } else if (cd4 < 500) {
      stageNum = 2;
      stageLabel = 'Estadio 2 (CD4 200–499 cél/µL)';
      severity = 'moderate';
    }

    const ahd = cd4 < 200 || hasStage3Oi;
    const guidance: string[] = [];

    // 1. PCP prophylaxis (< 200)
    if (cd4 < 200) {
      if (sulfaAllergy) {
        guidance.push(
          'PCP (CD4 < 200, alergia a sulfas): Valorar desensibilización a TMP-SMX (si no hubo SSJ/NET). Alternativas: Dapsona 100 mg VO c/24 h (descartar déficit G6PD antes) o Atovacuona 1,500 mg VO c/24 h con alimentos (o Pentamidina nebulizada 300 mg/mes).',
        );
      } else {
        guidance.push(
          'PCP (CD4 < 200): INDICADA profilaxis con TMP-SMX 160/800 mg (Forte/DS) 1 comp VO c/24 h (alternativa 1 comp 3 veces/semana o 80/400 mg c/24 h).',
        );
      }
    } else {
      guidance.push(
        'PCP: NO requiere profilaxis primaria rutinaria con CD4 ≥ 200 cél/µL (salvo descenso acelerado de CD4 o candidiasis orofaríngea recurrente sin causa alternativa).',
      );
    }

    // 2. Toxoplasma & Cryptococcus (< 100)
    if (cd4 < 100) {
      guidance.push(
        sulfaAllergy
          ? 'Toxoplasmosis (CD4 < 100): Si IgG anti-Toxoplasma (+) -> Dapsona 50 mg/día + Pirimetamina 50 mg/sem + Leucovorina 25 mg/sem (o Atovacuona 1,500 mg/día ± Pirimetamina/Leucovorina).'
          : 'Toxoplasmosis (CD4 < 100): Si IgG anti-Toxoplasma (+) -> TMP-SMX 160/800 mg VO c/24 h (ya cubre simultáneamente PCP y Toxoplasma).',
      );
      guidance.push(
        'Criptococosis (CD4 < 100): Solicitar Antígeno Criptocócico sérico (CrAg) ANTES de iniciar TAR; si CrAg (+) realizar punción lumbar para descartar meningitis criptocócica subclínica.',
      );
      guidance.push(
        'Tuberculosis (OMS EAV): Realizar tamizaje clínico de síntomas + LF-LAM urinario (si hospitalizado/síntomas o CD4 < 100–200 según OMS) antes de terapia preventiva con Isoniazida/3HP.',
      );
    } else if (cd4 < 200) {
      guidance.push(
        'Tamizaje TB (EAV): Descartar TB activa antes de iniciar TAR o terapia preventiva (TPT); en hospitalizados con CD4 < 200 valorar LF-LAM en orina.',
      );
    }

    // 3. MAC (< 50)
    if (cd4 < 50) {
      guidance.push(
        'MAC (CD4 < 50): Las guías NIH/DHHS NO recomiendan profilaxis primaria rutinaria si se inicia TAR efectivo de inmediato. Solo si se difiere el TAR o persiste viremia: Azitromicina 1,200 mg VO 1 vez/sem (tras descartar MAC diseminada).',
      );
      guidance.push(
        'CMV (CD4 < 50): Educación sobre síntomas visuales (miodesopsias/escotomas) y valoración oftalmológica para descartar retinitis por CMV.',
      );
    }

    // 4. Universal TAR & Pregnancy (incl. MINSA Nicaragua TLD & vertical transmission)
    guidance.push(
      isPregnant
        ? 'EMBARAZO (MINSA Nicaragua / OMS): Tamizaje universal desde el 1.er control prenatal e inicio INMEDIATO de TAR triple independiente de CD4 con esquema TLD (TDF 300 mg / 3TC 300 mg / DTG 50 mg VO c/24 h) o equivalente. Normativa MINSA de transmisión materno-infantil: valorar cesárea electiva si carga viral > 1,000 copias/mL o desconocida, SUSPENDER lactancia materna (sustitución segura con sucedáneo/fórmula infantil) e iniciar profilaxis ARV al recién nacido en primeras horas de vida.'
        : 'Inicio de TAR recomendado para TODA persona con VIH independientemente del recuento de CD4 (1.ª línea MINSA Nicaragua/OMS: TLD [Tenofovir 300 mg + Lamivudina 300 mg + Dolutegravir 50 mg] 1 comp VO c/24 h; en Estadio 3 / CD4 < 200 descartar antes meningitis TB y criptocócica).',
    );

    const pctNote =
      cd4Pct !== null
        ? ` (CD4% = ${formatClinicalNumber(cd4Pct, 0)} %; ${
            cd4Pct < 14 ? '< 14 %' : cd4Pct <= 25 ? '14–25 %' : '≥ 26 %'
          } — el recuento absoluto prevalece según CDC)`
        : '';

    return {
      primaryResult: {
        label: 'Clasificación CDC',
        value: stageNum,
        formattedValue: `Estadio ${stageNum}`,
        unit: stageNum === 3 ? 'SIDA / EAV' : `CD4 ${formatClinicalNumber(cd4, 0)} cél/µL`,
      },
      secondaryResults: [
        {
          label: 'Enfermedad Avanzada (OMS)',
          formattedValue: ahd ? 'SÍ (CD4 < 200 o Estadio 3)' : 'No',
          unit: '',
        },
        {
          label: 'Profilaxis PCP (< 200)',
          formattedValue: cd4 < 200 ? 'INDICADA' : 'No requerida',
          unit: '',
        },
        {
          label: 'Tamizaje CrAg / Profilaxis Toxo (< 100)',
          formattedValue: cd4 < 100 ? 'INDICADO' : 'No requerido',
          unit: '',
        },
      ],
      severity,
      riskClassification: stageLabel,
      clinicalInterpretation: `Recuento de CD4+ de ${formatClinicalNumber(cd4, 0)} cél/µL${pctNote}: clasificado como ${stageLabel}. ${
        ahd
          ? 'Cumple definición OMS de Enfermedad Avanzada por VIH (EAV): alto riesgo de infecciones oportunistas graves y mortalidad temprana; aplicar paquete de tamizaje rápido (TB y Criptococo) + profilaxis específica.'
          : 'Sin inmunosupresión avanzada (< 200), indicado iniciar TAR universal, tamizaje de TB latente, ITS, hepatitis B/C y vacunación según CD4.'
      }`,
      guidance,
      guidanceDisclaimer:
        'La profilaxis primaria de PCP y Toxoplasma puede suspenderse cuando la carga viral permanece suprimida con TAR y los CD4 superan 200 cél/µL durante ≥ 3 meses (o 100–200 en supresión viral sostenida para PCP según DHHS).',
      formulaUsed:
        'CDC 2014 (≥ 6 años): Estadio 1 (≥ 500), Estadio 2 (200–499), Estadio 3 (< 200 o condición definitoria de SIDA); umbrales IO: PCP < 200, Toxo/CrAg < 100, MAC/CMV < 50',
      inputsSummary: `CD4=${formatClinicalNumber(cd4, 0)} cél/µL, IO Estadio 3=${hasStage3Oi ? 'Sí' : 'No'}, Alergia sulfas=${sulfaAllergy ? 'Sí' : 'No'}, Embarazo=${isPregnant ? 'Sí' : 'No'}`,
    };
  },
};
