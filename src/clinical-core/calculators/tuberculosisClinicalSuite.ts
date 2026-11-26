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
  SeverityLevel,
} from '../types/clinical.ts';

interface AdultBand {
  label: string;
  tablets: string;
  numericTablets: number;
  rhzeComposition: string;
  rhComposition: string;
}

interface PediatricBand {
  label: string;
  tablets: string;
  numericTablets: number;
  hrzDose: string;
  ethambutolDose: string;
  hrContinuation: string;
}

function getAdultWeightBand(weightKg: number): AdultBand | null {
  if (weightKg >= 71) {
    return {
      label: '> 70 kg',
      tablets: '5 tabletas/día',
      numericTablets: 5,
      rhzeComposition: 'R 750 mg / H 375 mg / Z 2,000 mg / E 1,375 mg',
      rhComposition: 'R 750 mg / H 375 mg',
    };
  }
  if (weightKg >= 55) {
    return {
      label: '55 – 70 kg',
      tablets: '4 tabletas/día',
      numericTablets: 4,
      rhzeComposition: 'R 600 mg / H 300 mg / Z 1,600 mg / E 1,100 mg',
      rhComposition: 'R 600 mg / H 300 mg',
    };
  }
  if (weightKg >= 38) {
    return {
      label: '38 – 54 kg',
      tablets: '3 tabletas/día',
      numericTablets: 3,
      rhzeComposition: 'R 450 mg / H 225 mg / Z 1,200 mg / E 825 mg',
      rhComposition: 'R 450 mg / H 225 mg',
    };
  }
  if (weightKg >= 30) {
    return {
      label: '30 – 37 kg',
      tablets: '2 tabletas/día',
      numericTablets: 2,
      rhzeComposition: 'R 300 mg / H 150 mg / Z 800 mg / E 550 mg',
      rhComposition: 'R 300 mg / H 150 mg',
    };
  }
  return null;
}

function getPediatricWeightBand(weightKg: number): PediatricBand {
  if (weightKg >= 16) {
    return {
      label: '16.0 – 24.9 kg',
      tablets: '4 tabletas/día',
      numericTablets: 4,
      hrzDose: '4 tab dispersables HRZ (H 200 / R 300 / Z 600 mg)',
      ethambutolDose: '4 tab Etambutol 100 mg (400 mg)',
      hrContinuation: '4 tab dispersables HR (H 200 / R 300 mg)',
    };
  }
  if (weightKg >= 12) {
    return {
      label: '12.0 – 15.9 kg',
      tablets: '3 tabletas/día',
      numericTablets: 3,
      hrzDose: '3 tab dispersables HRZ (H 150 / R 225 / Z 450 mg)',
      ethambutolDose: '3 tab Etambutol 100 mg (300 mg)',
      hrContinuation: '3 tab dispersables HR (H 150 / R 225 mg)',
    };
  }
  if (weightKg >= 8) {
    return {
      label: '8.0 – 11.9 kg',
      tablets: '2 tabletas/día',
      numericTablets: 2,
      hrzDose: '2 tab dispersables HRZ (H 100 / R 150 / Z 300 mg)',
      ethambutolDose: '2 tab Etambutol 100 mg (200 mg)',
      hrContinuation: '2 tab dispersables HR (H 100 / R 150 mg)',
    };
  }
  if (weightKg >= 4) {
    return {
      label: '4.0 – 7.9 kg',
      tablets: '1 tableta/día',
      numericTablets: 1,
      hrzDose: '1 tab dispersable HRZ (H 50 / R 75 / Z 150 mg)',
      ethambutolDose: '1 tab Etambutol 100 mg (100 mg)',
      hrContinuation: '1 tab dispersable HR (H 50 / R 75 mg)',
    };
  }
  if (weightKg >= 3) {
    return {
      label: '3.0 – 3.9 kg',
      tablets: '¾ tableta/día',
      numericTablets: 0.75,
      hrzDose: '¾ tab dispersable HRZ (H 37.5 / R 56.25 / Z 112.5 mg)',
      ethambutolDose: '¾ tab Etambutol 100 mg (75 mg)',
      hrContinuation: '¾ tab dispersable HR (H 37.5 / R 56.25 mg)',
    };
  }
  return {
    label: '2.0 – 2.9 kg',
    tablets: '½ tableta/día',
    numericTablets: 0.5,
    hrzDose: '½ tab dispersable HRZ (H 25 / R 37.5 / Z 75 mg)',
    ethambutolDose: '½ tab Etambutol 100 mg (50 mg)',
    hrContinuation: '½ tab dispersable HR (H 25 / R 37.5 mg)',
  };
}

function getTptRegimenSummary(weightKg: number): string {
  const dailyIsoniazidMg =
    weightKg < 30 ? Math.min(300, roundClinical(weightKg * 10, 0)) : Math.min(300, roundClinical(weightKg * 5, 0));

  if (weightKg >= 50) {
    return `TPI Normativa 054 MINSA: Isoniacida ${dailyIsoniazidMg} mg/día × 6 meses · Opción acortada OMS/OPS: 3HP (H 900 mg + Rifapentina 900 mg semanal × 12 sem)`;
  }
  if (weightKg >= 31) {
    return `TPI Normativa 054 MINSA: Isoniacida ${dailyIsoniazidMg} mg/día × 6 meses · Opción 3HP: en > 14 a H 900 + Rpt 900 mg/sem (2–14 a: H 700 + Rpt 750 mg/sem)`;
  }
  if (weightKg >= 24) {
    return `TPI Normativa 054 MINSA: Isoniacida ${dailyIsoniazidMg} mg/día × 6 meses · Opción 3HP (2–14 a): H 600 mg + Rpt 600 mg/sem`;
  }
  if (weightKg >= 16) {
    return `TPI Normativa 054 MINSA: Isoniacida ${dailyIsoniazidMg} mg/día × 6 meses · Opción 3HP (2–14 a): H 500 mg + Rpt 450 mg/sem`;
  }
  if (weightKg >= 10) {
    return `TPI Normativa 054 MINSA: Isoniacida ${dailyIsoniazidMg} mg/día × 6 meses · Opción 3HP (2–14 a): H 300 mg + Rpt 300 mg/sem`;
  }
  return `TPI Normativa 054 MINSA (< 10 kg): Isoniacida ${dailyIsoniazidMg} mg/día (10 mg/kg/día, máx 300 mg) × 6 meses o 3HR (H 10 + R 15 mg/kg/día × 3 meses)`;
}

const tbModeField: SelectFieldDef = {
  id: 'tbMode',
  label: 'Módulo clínico de Tuberculosis (Normativa 054 MINSA Nicaragua · OPS/OMS)',
  type: 'select',
  defaultValue: 'tb_active_dosing',
  options: [
    {
      value: 'tb_active_dosing',
      label: 'TB Activa Sensible: Esquema Primario 2HRZE / 4HR (DFC y TAES MINSA) por peso',
    },
    {
      value: 'ltbi_tst_tpt',
      label: 'Control de Focos (< 72 h), PPD/IGRA y Quimioprofilaxis / TPI (MINSA / OMS)',
    },
    {
      value: 'tb_dx_isolation',
      label: 'Sintomático Respiratorio (SR ≥ 15 d), BAAR × 3, GeneXpert CNDR y Aislamiento',
    },
  ],
};

// --- Active TB Dosing fields ---
const weightKgField: NumberFieldDef = {
  id: 'weightKg',
  label: 'Peso corporal del paciente',
  type: 'number',
  canonicalUnit: 'kg',
  units: [
    { id: 'kg', label: 'kg', toCanonical: (v) => v, min: 2, max: 200, step: 0.5 },
    { id: 'lb', label: 'lb', toCanonical: (v) => v / 2.2046226218, min: 4.4, max: 440, step: 1 },
  ],
  defaultUnitId: 'kg',
  defaultValue: '60',
  min: 2,
  max: 200,
  placeholder: '60',
  visibleWhen: (inputs) =>
    inputs.tbMode === 'tb_active_dosing' || inputs.tbMode === 'ltbi_tst_tpt',
  helpText:
    'Esquemas DFC por banda de peso: pediátrico dispersable (< 25 kg) y tabletas DFC de adulto (≥ 30 kg) bajo supervisión TAES.',
};

const activeSiteField: SelectFieldDef = {
  id: 'activeSite',
  label: 'Forma clínica de TB sensible (Normativa 054 MINSA)',
  type: 'select',
  defaultValue: 'pulmonary_standard',
  visibleWhen: (inputs) => inputs.tbMode === 'tb_active_dosing',
  options: [
    {
      value: 'pulmonary_standard',
      label: 'Caso nuevo TB pulmonar o extrapulmonar estándar (Esquema Primario 2HRZE / 4HR)',
    },
    {
      value: 'pediatric_nonsevere',
      label: 'Niño/adolescente (3 m – 16 a) con TB NO grave (opción acortada OPS/OMS 4 meses: 2HRZ(E)/2HR)',
    },
    {
      value: 'cns_meningeal',
      label: 'Meningoencefalitis TB / TB del SNC (9–12 meses + Dexametasona Thwaites obligatoria)',
    },
    {
      value: 'osteo_pericardial',
      label: 'TB osteoarticular, espinal o pericarditis TB (duración extendida / valorar corticoide)',
    },
  ],
};

const b6RiskField: BooleanFieldDef = {
  id: 'b6Risk',
  label: '¿Factor de riesgo de neuropatía por isoniazida (PVVIH, embarazo, DM, desnutrición, ERC o alcohol)?',
  type: 'boolean',
  defaultValue: false,
  visibleWhen: (inputs) =>
    inputs.tbMode === 'tb_active_dosing' || inputs.tbMode === 'ltbi_tst_tpt',
  helpText: 'Indica Piridoxina (Vitamina B6) 25–50 mg/día VO durante todo el esquema.',
};

// --- LTBI / TST / TPT fields ---
const tstRiskGroupField: SelectFieldDef = {
  id: 'tstRiskGroup',
  label: 'Grupo de riesgo clínico para interpretación de PPD (Mantoux)',
  type: 'select',
  defaultValue: 'cutoff_10mm',
  visibleWhen: (inputs) => inputs.tbMode === 'ltbi_tst_tpt',
  options: [
    {
      value: 'cutoff_5mm',
      label: 'Corte ≥ 5 mm: PVVIH, contacto domiciliario reciente de caso bacilífero, Rx fibrótica o inmunosupresión (≥ 15 mg/d prednisona, anti-TNF, trasplante)',
    },
    {
      value: 'cutoff_10mm',
      label: 'Corte ≥ 10 mm: nacido en área endémica, personal de salud/CNDR, privados de libertad/albergues, UDVP, < 4–5 años, DM, ERC o silicosis',
    },
    {
      value: 'cutoff_15mm',
      label: 'Corte ≥ 15 mm: adulto sin factores de riesgo conocidos para TB',
    },
  ],
};

const ppdIndurationField: NumberFieldDef = {
  id: 'ppdMm',
  label: 'Induración PPD / Mantoux a las 48–72 h (opcional si usa IGRA o contacto < 5 años)',
  type: 'number',
  canonicalUnit: 'mm',
  units: [{ id: 'mm', label: 'mm', toCanonical: (v) => v, min: 0, max: 60, step: 1 }],
  defaultUnitId: 'mm',
  defaultValue: '12',
  required: false,
  min: 0,
  max: 60,
  placeholder: '12',
  visibleWhen: (inputs) => inputs.tbMode === 'ltbi_tst_tpt',
  helpText: 'Medir exclusivamente el diámetro transversal de la INDURACIÓN en mm (no el eritema).',
};

const igraStatusField: SelectFieldDef = {
  id: 'igraStatus',
  label: 'Resultado de IGRA (QuantiFERON-TB / T-SPOT.TB, si disponible)',
  type: 'select',
  defaultValue: 'not_done',
  visibleWhen: (inputs) => inputs.tbMode === 'ltbi_tst_tpt',
  options: [
    { value: 'not_done', label: 'No realizado / Solo PPD o estudio de foco' },
    { value: 'positive', label: 'IGRA Positivo (sin interferencia por vacuna BCG)' },
    { value: 'negative', label: 'IGRA Negativo' },
    { value: 'indeterminate', label: 'IGRA Indeterminado / Limítrofe' },
  ],
};

const activeTbExcludedField: BooleanFieldDef = {
  id: 'activeTbExcluded',
  label: '¿Se descartó TB activa (sin síntomas de SR, exploración física normal y Rx de tórax sin lesiones activas)?',
  type: 'boolean',
  defaultValue: true,
  visibleWhen: (inputs) => inputs.tbMode === 'ltbi_tst_tpt',
  helpText: 'Normativa 054 MINSA: NUNCA iniciar quimioprofilaxis (TPI/TPT) sin descartar primero TB activa.',
};

// --- Diagnostic & Isolation fields ---
const fourSymptomPositiveField: BooleanFieldDef = {
  id: 'fourSymptomsPositive',
  label: '¿Es Sintomático Respiratorio (SR: tos con flema ≥ 15 días) o presenta fiebre, baja de peso o sudoración nocturna (cualquier tos si PVVIH)?',
  type: 'boolean',
  defaultValue: true,
  visibleWhen: (inputs) => inputs.tbMode === 'tb_dx_isolation',
};

const hivStatusDxField: SelectFieldDef = {
  id: 'hivStatusDx',
  label: 'Grupo prioritario MINSA / Estado de VIH',
  type: 'select',
  defaultValue: 'negative',
  visibleWhen: (inputs) => inputs.tbMode === 'tb_dx_isolation',
  options: [
    { value: 'negative', label: 'Población general sin criterios de alto riesgo de TB-DR/VIH' },
    { value: 'hiv_stable', label: 'Grupo prioritario GeneXpert (PVVIH con CD4 > 200, antes tratado/recaída, privado de libertad, personal de salud o contacto TB-DR)' },
    { value: 'hiv_advanced', label: 'PVVIH con CD4 ≤ 200 cél/µL, enfermedad avanzada o paciente hospitalizado grave' },
  ],
};

const xpertResultField: SelectFieldDef = {
  id: 'xpertResult',
  label: 'Resultado de GeneXpert MTB/RIF (CNDR/red MINSA) o Baciloscopía BAAR seriada (×3)',
  type: 'select',
  defaultValue: 'pending',
  visibleWhen: (inputs) => inputs.tbMode === 'tb_dx_isolation',
  options: [
    { value: 'pending', label: 'Pendiente / Captación inicial de SR' },
    { value: 'mtb_r_sensitive', label: 'BAAR (+) o GeneXpert MTB detectado · Sensible a Rifampicina' },
    { value: 'mtb_r_resistant', label: 'GeneXpert MTB detectado · Resistente a Rifampicina (RR/MDR-TB)' },
    { value: 'mtb_trace_negative', label: 'BAAR (-) × 3 o GeneXpert no detectado / Trazas' },
  ],
};

const cnsOrDisseminatedField: BooleanFieldDef = {
  id: 'cnsOrDisseminated',
  label: '¿Sospecha o confirmación de meningoencefalitis TB (SNC), TB osteoarticular o miliar diseminada?',
  type: 'boolean',
  defaultValue: false,
  visibleWhen: (inputs) => inputs.tbMode === 'tb_dx_isolation',
};

export const tuberculosisClinicalSuiteCalculator: CalculatorDefinition = {
  id: 'tuberculosis-clinical-suite',
  name: 'Tuberculosis (MINSA Nicaragua · Normativa 054): HRZE, TAES, SR, TPI y GeneXpert',
  shortName: 'Tuberculosis (MINSA Nic.)',
  primarySpecialty: 'infectologia',
  secondarySpecialties: ['neumologia', 'medicina-interna', 'pediatria', 'urgencias'],
  subcategory: 'dosificacion',
  keywords: [
    'tuberculosis',
    'tb',
    'minsa',
    'nicaragua',
    'normativa 054',
    'taes',
    'dots',
    'sintomatico respiratorio',
    'sr',
    'baar',
    'hrze',
    'rhze',
    'dfc',
    'isoniacida',
    'rifampicina',
    'pirazinamida',
    'etambutol',
    'ppd',
    'mantoux',
    'igra',
    'tpi',
    'tpt',
    'quimioprofilaxis',
    'control de focos',
    'cndr',
    'genexpert',
    'xpert',
    'bpalm',
    'meningitis tuberculosa',
    'lam',
  ],
  description:
    'Herramienta clínica alineada a la Normativa 054 del MINSA Nicaragua y guías OPS/OMS: dosificación de esquema primario 2HRZE/4HR con Drogas Fijas Combinadas (DFC) bajo estrategia TAES, estudio de Sintomático Respiratorio (SR ≥ 15 días), BAAR seriado ×3, GeneXpert CNDR, control de focos (< 72 h) y quimioprofilaxis/TPI.',
  clinicalIndication:
    'Atención primaria (ESAFC/centros de salud), consulta externa, neumología, infectología, pediatría y urgencias para captación de SR, inicio de TAES por banda de peso, manejo de contactos y detección de RR-TB.',
  validatedPopulation: 'Adultos, adolescentes y pacientes pediátricos ≥ 2 kg conforme a normativa nacional MINSA / OPS-OMS.',
  contraindications: [
    'NUNCA iniciar quimioprofilaxis / TPI (Isoniacida) sin descartar primero tuberculosis activa mediante clínica y radiografía de tórax (evita inducir farmacorresistencia).',
    'En RR/MDR-TB del SNC (meningoencefalitis), TB osteoarticular o miliar diseminada NO utilizar el esquema acortado BPaLM/BPaL de 6 meses (excluido por penetración insuficiente en LCR).',
    'Rifampicina y Rifapentina inducen CYP3A4/UGT1A1: con rifampicina en PVVIH duplicar Dolutegravir (50 mg c/12 h) y verificar interacciones con IP potenciados, TAF, anticonceptivos y warfarina.',
  ],
  limitations: [
    'En la fase de continuación (4HR) verificar la disponibilidad local del PNCT MINSA entre tabletas DFC diarias o administración supervisada bisemanal/trisemanal según modalidad vigente de la unidad de salud.',
    'La baciloscopía BAAR negativa NO excluye TB en niños (paucibacilar), PVVIH ni formas extrapulmonares; priorizar GeneXpert MTB/RIF y cultivo en el CNDR.',
  ],
  version: 'Normativa 054 MINSA Nicaragua (TB) · Actualizaciones CNDR / OPS-OMS 2022–2024',
  references: [
    {
      citation:
        'Ministerio de Salud (MINSA) de Nicaragua. Normativa 054: Normas y Procedimientos para el Abordaje de la Tuberculosis (Estrategia TAES, SR, BAAR seriado ×3, Esquema Primario 2HRZE/4HR, Control de Focos y Quimioprofilaxis). Managua: MINSA.',
      year: 2023,
    },
    {
      citation:
        'Organización Panamericana de la Salud / OMS. Directrices unificadas sobre la tuberculosis: Tratamiento de la TB farmacosensible y farmacorresistente (Módulos 1, 3, 4 y 5, 2022–2024).',
      year: 2024,
    },
    {
      citation:
        'Thwaites GE, Nguyen DB, Nguyen HD, et al. Dexamethasone for the treatment of tuberculous meningitis in adolescents and adults. N Engl J Med. 2004;351(17):1741-1751.',
      year: 2004,
    },
  ],
  fields: [
    tbModeField,
    weightKgField,
    activeSiteField,
    tstRiskGroupField,
    ppdIndurationField,
    igraStatusField,
    activeTbExcludedField,
    b6RiskField,
    fourSymptomPositiveField,
    hivStatusDxField,
    xpertResultField,
    cnsOrDisseminatedField,
  ],
  calculate(inputs: CalculatorInputsState) {
    const errors = validateCalculatorInputs(tuberculosisClinicalSuiteCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors.map((e) => e.message).join(' '));
    }

    const mode = String(inputs.tbMode ?? 'tb_active_dosing');

    if (mode === 'tb_active_dosing') {
      const weightKg = roundClinical(
        getCanonicalNumberValue(weightKgField, inputs.weightKg as NumberInputValue).canonicalValue!,
        1,
      );
      const site = String(inputs.activeSite ?? 'pulmonary_standard');
      const b6Risk = Boolean(inputs.b6Risk);

      const isPediatricBand = weightKg < 25;
      const adultBand = getAdultWeightBand(weightKg);
      const isTransitionBand = weightKg >= 25 && weightKg < 30;
      const pedBand = isPediatricBand ? getPediatricWeightBand(weightKg) : null;

      let durationText = '6 meses (Esquema Primario MINSA: 2HRZE fase intensiva + 4HR continuación bajo TAES)';
      if (site === 'pediatric_nonsevere') {
        durationText = '4 meses (2HRZ(E) + 2HR — opción OPS/OMS en 3 m–16 a con TB no grave y sin sospecha de TB-DR)';
      } else if (site === 'cns_meningeal') {
        durationText = '9–12 meses (2HRZE + 7–10HR) + Dexametasona adyuvante 6–8 sem';
      } else if (site === 'osteo_pericardial') {
        durationText = '9–12 meses en TB osteoarticular/espinal (6–12 m en pericarditis + valorar corticoide)';
      }

      const secondaryResults: SecondaryResultItem[] = [];
      let primaryValue = 0;
      let primaryFormatted = '';
      let bandLabel = '';

      if (isPediatricBand && pedBand) {
        primaryValue = pedBand.numericTablets;
        primaryFormatted = pedBand.tablets;
        bandLabel = `Banda pediátrica ${pedBand.label} (< 25 kg)`;

        const hTarget = roundClinical(weightKg * 10, 0);
        const rTarget = roundClinical(weightKg * 15, 0);
        const zTarget = roundClinical(weightKg * 35, 0);
        const eTarget = roundClinical(weightKg * 20, 0);

        secondaryResults.push(
          {
            label: 'Fase intensiva (2 meses) — DFC dispersable pediátrica',
            formattedValue: pedBand.hrzDose,
            unit: `+ ${pedBand.ethambutolDose}`,
          },
          {
            label: 'Fase de continuación — DFC dispersable pediátrica',
            formattedValue: pedBand.hrContinuation,
            unit: site === 'pediatric_nonsevere' ? '(2 meses si no grave)' : '(4 meses estándar)',
          },
          {
            label: 'Metas mg/kg/día OMS/MINSA (H 10 · R 15 · Z 35 · E 20 mg/kg)',
            formattedValue: `H ${hTarget} · R ${rTarget} · Z ${zTarget} · E ${eTarget} mg`,
            unit: 'topes: H 300, R 600, Z 2,000, E 1,200 mg/d',
          },
        );
      } else if (isTransitionBand) {
        primaryValue = 2;
        primaryFormatted = 'Transición 25–29.9 kg (individualizar mg/kg)';
        bandLabel = 'Zona de transición 25 – 29.9 kg';

        const hCalc = Math.min(300, roundClinical(weightKg * 5, 0));
        const rCalc = Math.min(600, roundClinical(weightKg * 10, 0));
        const zCalc = Math.min(2000, roundClinical(weightKg * 25, 0));
        const eCalc = Math.min(1600, roundClinical(weightKg * 15, 0));

        secondaryResults.push(
          {
            label: 'Dosis objetivo por peso (adulto/adolescente)',
            formattedValue: `H ${hCalc} mg · R ${rCalc} mg · Z ${zCalc} mg · E ${eCalc} mg/día`,
            unit: 'H 5, R 10, Z 25, E 15 mg/kg/d',
          },
          {
            label: 'Referencia DFC adulto',
            formattedValue: '2 tab RHZE 150/75/400/275 mg aportan R 300 / H 150 / Z 800 / E 550 mg',
            unit: 'ajustar según tolerancia y norma PNCT',
          },
        );
      } else if (adultBand) {
        primaryValue = adultBand.numericTablets;
        primaryFormatted = adultBand.tablets;
        bandLabel = `Banda adulto DFC ${adultBand.label}`;

        secondaryResults.push(
          {
            label: 'Fase intensiva (2HRZE) — DFC RHZE (150/75/400/275 mg)',
            formattedValue: `${adultBand.tablets} (${adultBand.rhzeComposition})`,
            unit: 'toma supervisada bajo TAES (lunes–sábado o diaria según PNCT)',
          },
          {
            label: 'Fase de continuación (4HR) — DFC RH (150/75 mg)',
            formattedValue: `${adultBand.tablets} (${adultBand.rhComposition})`,
            unit: '4 meses (7–10 m si SNC); validar pauta diaria o intermitente del PNCT',
          },
          {
            label: 'Duración total y estrategia',
            formattedValue: durationText,
            unit: '',
          },
        );
      }

      if (b6Risk) {
        secondaryResults.push({
          label: 'Profilaxis de neuropatía periférica',
          formattedValue: 'Piridoxina (Vitamina B6) 25–50 mg/día VO',
          unit: 'mientras reciba isoniazida',
        });
      }

      const guidance: string[] = [
        'Estrategia TAES (Normativa 054 MINSA): toda dosis debe ingerirse bajo observación directa del personal de salud o colaborador comunitario capacitado, en una sola toma diaria (preferiblemente en ayunas o con comida ligera si hay intolerancia).',
        'Control bacteriológico y de focos MINSA: realizar baciloscopía de control al finalizar la fase intensiva (2.º mes), al 4.º–5.º mes y al finalizar el tratamiento; completar estudio de contactos domiciliarios en < 72 horas.',
        'Laboratorios basales y vigilancia: solicitar AST/ALT, bilirrubinas, creatinina, prueba rápida de VIH y glucemia. Suspender fármacos hepatotóxicos si hay ictericia, vómitos persistentes o ALT > 3× LSN con síntomas (> 5× LSN asintomática).',
        'Orientar al paciente que la coloración naranja-rojiza de orina, sudor y lágrimas por Rifampicina es esperada e inofensiva.',
      ];

      if (site === 'cns_meningeal') {
        guidance.unshift(
          'MENINGOENCEFALITIS TB: Iniciar Dexametasona adyuvante inmediata (esquema Thwaites: 0.4 mg/kg/d sem 1–2 → 0.3 mg/kg/d sem 3–4 → 0.2 mg/kg/d sem 5–6 → 0.1 mg/kg/d sem 7 → 3–4 mg/d sem 8 y suspender). En PVVIH diferir TAR 4–8 semanas para prevenir SIRI mortal.',
        );
      } else if (site === 'osteo_pericardial') {
        guidance.push(
          'En pericarditis tuberculosa valorar prednisona adyuvante en pauta descendente (~6 semanas) para reducir riesgo de pericarditis constrictiva.',
        );
      }

      const severity: SeverityLevel =
        site === 'cns_meningeal' ? 'critical' : site === 'osteo_pericardial' ? 'high' : 'moderate';

      return {
        primaryResult: {
          label: 'Dosis diaria recomendada (DFC / TAES MINSA)',
          value: primaryValue,
          formattedValue: primaryFormatted,
          unit: bandLabel,
        },
        secondaryResults,
        severity,
        riskClassification: `${bandLabel} · ${durationText}`,
        clinicalInterpretation: `Paciente de ${formatClinicalNumber(weightKg, 1)} kg asignado a ${bandLabel}. ${durationText}.`,
        guidance,
        guidanceDisclaimer:
          'Confirmar sensibilidad a rifampicina mediante GeneXpert MTB/RIF en grupos prioritarios del MINSA/CNDR. Pesar mensualmente al paciente para actualizar banda de peso.',
        formulaUsed: 'Normativa 054 MINSA Nicaragua (2HRZE/4HR, TAES y DFC) + Bandas ponderales OPS/OMS',
        inputsSummary: `${weightKg} kg · ${site}${b6Risk ? ' · Piridoxina B6' : ''}`,
      };
    }

    if (mode === 'ltbi_tst_tpt') {
      const weightKg = roundClinical(
        getCanonicalNumberValue(weightKgField, inputs.weightKg as NumberInputValue).canonicalValue!,
        1,
      );
      const riskGroup = String(inputs.tstRiskGroup ?? 'cutoff_10mm');
      const ppdMm = getCanonicalNumberValue(
        ppdIndurationField,
        inputs.ppdMm as NumberInputValue | undefined,
      ).canonicalValue;
      const igra = String(inputs.igraStatus ?? 'not_done');
      const activeExcluded = Boolean(inputs.activeTbExcluded);
      const b6Risk = Boolean(inputs.b6Risk);

      const cutoffMm = riskGroup === 'cutoff_5mm' ? 5 : riskGroup === 'cutoff_15mm' ? 15 : 10;
      const ppdPositive = typeof ppdMm === 'number' && ppdMm >= cutoffMm;
      const igraPositive = igra === 'positive';
      const isLtbiPositive = ppdPositive || igraPositive;

      let primaryFormatted = 'Negativo para ITL';
      const primaryVal = typeof ppdMm === 'number' ? roundClinical(ppdMm, 0) : igraPositive ? 1 : 0;
      let severity: SeverityLevel = 'normal';
      let riskClass = `PPD < ${cutoffMm} mm sin IGRA positivo`;

      if (!activeExcluded && isLtbiPositive) {
        severity = 'critical';
        primaryFormatted = 'DESCARTAR TB ACTIVA ANTES DE TPI/TPT';
        riskClass = 'ALERTA NORMATIVA 054 · Prohibido iniciar quimioprofilaxis sin descartar TB activa';
      } else if (isLtbiPositive) {
        severity = 'high';
        primaryFormatted = igraPositive
          ? 'Positivo para ITL (IGRA+)'
          : `PPD Positivo (${ppdMm} mm ≥ ${cutoffMm} mm)`;
        riskClass = `Infección Tuberculosa Latente (ITL) · Indicación de Quimioprofilaxis / TPI (corte ${cutoffMm} mm)`;
      } else if (igra === 'indeterminate') {
        severity = 'moderate';
        primaryFormatted = 'IGRA Indeterminado (repetir o valorar PPD)';
        riskClass = 'Resultado no concluyente — evaluar clínica y nexo epidemiológico';
      } else if (typeof ppdMm === 'number') {
        primaryFormatted = `PPD Negativo (${ppdMm} mm < ${cutoffMm} mm)`;
      }

      const secondaryResults: SecondaryResultItem[] = [
        {
          label: 'Umbral aplicado para PPD (Mantoux 48–72 h)',
          formattedValue: `≥ ${cutoffMm} mm de induración`,
          unit: typeof ppdMm === 'number' ? `medido: ${ppdMm} mm` : 'solo IGRA / foco',
        },
        {
          label: 'Quimioprofilaxis MINSA (TPI) y opciones acortadas OMS',
          formattedValue: getTptRegimenSummary(weightKg),
          unit: 'siempre tras descartar TB activa',
        },
        {
          label: 'Población prioritaria de quimioprofilaxis en Nicaragua (MINSA)',
          formattedValue: 'Contactos < 5 años de caso bacilífero y PVVIH (estudio de focos < 72 h)',
          unit: 'aun con PPD negativa inicial en < 5 a / PVVIH en ventana',
        },
      ];

      if (b6Risk) {
        secondaryResults.push({
          label: 'Piridoxina (Vitamina B6)',
          formattedValue: '25–50 mg/día VO',
          unit: 'mientras reciba isoniazida',
        });
      }

      const guidance: string[] = [];
      if (!activeExcluded) {
        guidance.push(
          'PASO OBLIGATORIO (Normativa 054 MINSA): Evaluar síntomas de SR, ganancia ponderal en niños y radiografía de tórax PA antes de prescribir TPI/TPT. Si hay síntomas o lesión sospechosa, tomar BAAR × 3 / GeneXpert.',
        );
      }
      guidance.push(
        'Control de focos MINSA (< 72 horas): censar y examinar a todos los contactos intradomiciliarios del caso índice. En niños < 5 años y PVVIH contactos de TB pulmonar bacilífera, iniciar quimioprofilaxis con Isoniacida por 6 meses una vez descartada TB activa.',
      );
      if (isLtbiPositive) {
        guidance.push(
          'En vacunados con BCG al nacer (esquema PAI Nicaragua), una induración PPD ≥ 10 mm en contacto o personal de salud suele reflejar infección real; el IGRA evita falsos positivos por BCG.',
        );
      } else {
        guidance.push(
          'Si el PPD inicial es negativo en contacto estrecho reciente (< 8–10 semanas de exposición), repetir a las 8–10 semanas y mantener TPI de ventana en menores de 5 años y PVVIH.',
        );
      }

      return {
        primaryResult: {
          label: 'Evaluación de ITL / Quimioprofilaxis (TPI)',
          value: primaryVal,
          formattedValue: primaryFormatted,
          unit: `peso ${formatClinicalNumber(weightKg, 1)} kg`,
        },
        secondaryResults,
        severity,
        riskClassification: riskClass,
        clinicalInterpretation: isLtbiPositive
          ? `Criterios positivos para Infección Tuberculosa Latente (umbral PPD ≥ ${cutoffMm} mm${igraPositive ? ' / IGRA+' : ''}). ${activeExcluded ? 'TB activa descartada: candidato a quimioprofilaxis.' : 'Pendiente descartar TB activa antes de iniciar TPI/TPT.'}`
          : `Sin positividad en la prueba ingresada para el umbral ≥ ${cutoffMm} mm. Valorar control de focos si es contacto < 5 años o PVVIH.`,
        guidance,
        guidanceDisclaimer:
          'Vigilar tolerancia hepática y neuropatía durante los 6 meses de TPI. Con esquemas con rifapentina (3HP) evitar inhibidores de proteasa y nevirapina.',
        formulaUsed: 'Normativa 054 MINSA Nicaragua (Control de Focos < 72 h y TPI 6 meses) + Cortes Mantoux / TPT OMS',
        inputsSummary: `PPD ${ppdMm ?? 'N/D'} mm (corte ${cutoffMm}) · IGRA ${igra} · ${weightKg} kg`,
      };
    }

    // tb_dx_isolation
    const sympPos = Boolean(inputs.fourSymptomsPositive);
    const hiv = String(inputs.hivStatusDx ?? 'negative');
    const xpert = String(inputs.xpertResult ?? 'pending');
    const cnsDissem = Boolean(inputs.cnsOrDisseminated);

    let primaryNum = 0;
    let primaryFormatted = 'Estudio diagnóstico inicial';
    let severity: SeverityLevel = 'info';
    let riskClass = 'Evaluación diagnóstica según Normativa 054 MINSA';
    const guidance: string[] = [];

    if (xpert === 'mtb_r_resistant') {
      primaryNum = 3;
      primaryFormatted = 'RR / MDR-TB Confirmada';
      severity = 'critical';
      riskClass = 'ALERTA TB-DR · Resistencia a Rifampicina detectada (notificación inmediata)';
      guidance.push(
        cnsDissem
          ? 'EXCLUSIÓN CRÍTICA OMS 2022–2024: El esquema oral BPaLM/BPaL de 6 meses NO está aprobado en meningoencefalitis TB (SNC), TB osteoarticular ni diseminada; coordinar con comité clínico nacional/CNDR un régimen individualizado con penetración en LCR.'
          : 'Notificar al componente nacional de TB-DR (MINSA/CNDR), realizar pruebas de susceptibilidad a fluoroquinolonas (LPA / Xpert XDR) y valorar esquema acortado totalmente oral BPaLM (6 meses) o esquema programático nacional para TB-DR.',
      );
      guidance.push(
        'Aislamiento aéreo estricto (habitación ventilada / presión negativa, respiradores N95 para el personal y mascarilla quirúrgica al paciente) hasta conversión bacteriológica confirmada.',
      );
    } else if (xpert === 'mtb_r_sensitive') {
      primaryNum = 2;
      primaryFormatted = 'TB Confirmada · Sensible a R';
      severity = 'high';
      riskClass = 'Caso de TB bacteriológicamente confirmado (sensible a Rifampicina)';
      guidance.push(
        'Iniciar Esquema Primario MINSA 2HRZE / 4HR por banda de peso bajo estrategia TAES estricta (cambiar al módulo de dosificación HRZE).',
      );
      guidance.push(
        'Ejecutar control de focos en < 72 horas (censo de contactos domiciliarios, cribado de SR y quimioprofilaxis con isoniacida a < 5 años y PVVIH tras descartar TB activa).',
      );
    } else if (sympPos || hiv === 'hiv_advanced') {
      primaryNum = 1;
      primaryFormatted = 'Sintomático Respiratorio (SR)';
      severity = hiv === 'hiv_advanced' ? 'high' : 'moderate';
      riskClass = 'SR captado (Normativa 054 MINSA) — indicar BAAR × 3 / GeneXpert';
      guidance.push(
        'PROTOCOLO DE SERIADO BAAR × 3 (MINSA Nicaragua): 1.ª muestra inmediata en el establecimiento de salud al captar al SR; 2.ª muestra matutina en ayunas al día siguiente en domicilio; 3.ª muestra en la unidad al entregar la segunda.',
      );
      guidance.push(
        hiv !== 'negative' || cnsDissem
          ? 'PRIORIDAD DE GENEXPERT MTB/RIF (CNDR / red MINSA): Por tratarse de grupo de alto riesgo (PVVIH, antes tratado, privado de libertad, personal de salud, contacto TB-DR o muestra extrapulmonar/LCR), enviar muestra prioritaria para GeneXpert + cultivo.'
          : 'Solicitar radiografía de tórax y valorar envío de muestra para GeneXpert MTB/RIF según criterios de priorización del establecimiento y cultivo micobacteriano si persiste sospecha.',
      );
      if (hiv === 'hiv_advanced') {
        guidance.push(
          'PVVIH CON CD4 ≤ 200 O GRAVEDAD: Indicar además LF-LAM en orina si está disponible y descartar infección oportunista del SNC antes de iniciar TAR.',
        );
      }
      guidance.push(
        'Aplicar medidas de control de infecciones (mascarilla quirúrgica al SR en sala de espera, atención prioritaria en área ventilada y respirador N95 para el personal en toma de muestras).',
      );
    } else {
      primaryFormatted = 'No cumple definición de SR';
      severity = 'low';
      riskClass = 'Sin tos ≥ 15 días ni criterios de sospecha en cribado actual';
      guidance.push(
        'Si persiste sospecha clínica pese a BAAR (-) × 3 o en niños (< 15 años, enfermedad paucibacilar), realizar valoración clínica integral, nexo de foco, PPD, Rx de tórax y aspirado gástrico/GeneXpert según criterio pediátrico.',
      );
    }

    return {
      primaryResult: {
        label: 'Clasificación diagnóstica (Normativa 054 MINSA)',
        value: primaryNum,
        formattedValue: primaryFormatted,
        unit: cnsDissem ? 'sospecha SNC / diseminada' : 'evaluación SR / TB',
      },
      secondaryResults: [
        {
          label: 'Muestreo bacteriológico y molecular MINSA',
          formattedValue: 'Seriado BAAR × 3 + GeneXpert MTB/RIF en grupos prioritarios (CNDR)',
          unit: hiv === 'hiv_advanced' ? '+ LF-LAM en orina si PVVIH grave' : 'notificación y tarjeta TAES si (+)',
        },
        {
          label: 'Control de infecciones y contactos',
          formattedValue:
            xpert === 'mtb_r_sensitive' || xpert === 'mtb_r_resistant' || sympPos
              ? 'Mascarilla al paciente · N95 personal · Control de focos < 72 h'
              : 'Precauciones estándar y vigilancia de síntomas',
          unit: 'priorizar contactos < 5 a y PVVIH',
        },
      ],
      severity,
      riskClassification: riskClass,
      clinicalInterpretation:
        xpert === 'mtb_r_resistant'
          ? 'Resistencia a rifampicina detectada: requiere manejo especializado de TB-DR y evaluación de fluoroquinolonas.'
          : xpert === 'mtb_r_sensitive'
            ? 'TB confirmada sensible a rifampicina: iniciar 2HRZE/4HR bajo TAES y activar control de focos (< 72 h).'
            : sympPos
              ? 'Paciente cumple definición de Sintomático Respiratorio (SR): completar seriado BAAR × 3 y GeneXpert prioritario según grupo de riesgo.'
              : 'Completar evaluación clínica si persisten síntomas o antecedente de contacto bacilífero.',
      guidance,
      formulaUsed: 'Normativa 054 MINSA Nicaragua (SR ≥ 15 d, BAAR × 3, GeneXpert CNDR, Control de Focos < 72 h) + OPS/OMS',
      inputsSummary: `SR/4-síntomas: ${sympPos ? 'Sí' : 'No'} · Grupo: ${hiv} · Resultado: ${xpert}`,
    };
  },
};
