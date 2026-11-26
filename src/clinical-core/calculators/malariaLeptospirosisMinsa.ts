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
import { WEIGHT_UNITS_KG } from '../units/converters.ts';

const protocolModeField: SelectFieldDef = {
  id: 'protocolMode',
  label: 'Patología y escenario clínico (Normativa MINSA Nicaragua)',
  type: 'select',
  defaultValue: 'malaria_vivax',
  options: [
    {
      value: 'malaria_vivax',
      label: 'Malaria por Plasmodium vivax (Cloroquina + Primaquina 7 días)',
    },
    {
      value: 'malaria_falciparum_sensible',
      label: 'Malaria por Plasmodium falciparum sensible a cloroquina',
    },
    {
      value: 'malaria_falciparum_resistente',
      label: 'Malaria por P. falciparum resistente / mixta (Arteméter + Lumefantrina)',
    },
    {
      value: 'leptospirosis_leve',
      label: 'Leptospirosis leve / ambulatoria o sospecha temprana (< 5 días)',
    },
    {
      value: 'leptospirosis_grave',
      label: 'Leptospirosis moderada-grave / hospitalaria (Síndrome de Weil)',
    },
  ],
};

const weightField: NumberFieldDef = {
  id: 'weightKg',
  label: 'Peso corporal del paciente',
  type: 'number',
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  defaultValue: '60',
  min: 3,
  max: 200,
  placeholder: '60',
  helpText: 'Utilizado para calcular dosis exactas por kg/día en Malaria (Cloroquina/Primaquina/Coartem) y Leptospirosis pediátrica.',
};

const patientGroupField: SelectFieldDef = {
  id: 'patientGroup',
  label: 'Grupo poblacional / condición fisiológica',
  type: 'select',
  defaultValue: 'adult_adolescent',
  options: [
    { value: 'adult_adolescent', label: 'Adulto o adolescente ≥ 10 años (≥ 30–35 kg)' },
    { value: 'pediatric_ge6m', label: 'Niño / lactante ≥ 6 meses a < 10 años' },
    { value: 'infant_lt6m', label: 'Lactante < 6 meses (contraindicación de Primaquina)' },
    { value: 'pregnant_lactating', label: 'Embarazada o madre en lactancia materna' },
  ],
};

const doxyContraindicatedField: BooleanFieldDef = {
  id: 'doxyContraindicated',
  label: '¿Alergia, intolerancia gástrica grave o contraindicación a Doxiciclina?',
  type: 'boolean',
  defaultValue: false,
  visibleWhen: (inputs) => inputs.protocolMode === 'leptospirosis_leve',
};

const penicillinAllergyField: BooleanFieldDef = {
  id: 'penicillinAllergy',
  label: '¿Alergia documentada grave (anafilaxia/SSJ) a Penicilinas / Betalactámicos?',
  type: 'boolean',
  defaultValue: false,
  visibleWhen: (inputs) => inputs.protocolMode === 'leptospirosis_grave',
};

export const malariaLeptospirosisMinsaCalculator: CalculatorDefinition = {
  id: 'malaria-leptospirosis-minsa',
  name: 'Malaria y Leptospirosis: Esquemas Terapéuticos MINSA Nicaragua',
  shortName: 'Malaria y Leptospirosis (MINSA)',
  primarySpecialty: 'infectologia',
  secondarySpecialties: ['medicina-interna', 'pediatria', 'urgencias', 'gineco-obstetricia'],
  subcategory: 'dosificacion',
  keywords: [
    'malaria',
    'paludismo',
    'vivax',
    'falciparum',
    'cloroquina',
    'primaquina',
    'coartem',
    'artemeter',
    'lumefantrina',
    'col-vol',
    'leptospirosis',
    'doxiciclina',
    'penicilina cristalina',
    'amoxicilina',
    'weil',
    'jarisch-herxheimer',
    'minsa',
    'nicaragua',
  ],
  description:
    'Calculadora clínica y posológica según las normas del MINSA Nicaragua para Malaria (Plasmodium vivax, P. falciparum sensible/resistente, red Col-Vol) y Leptospirosis (leve, embarazo, pediatría y Síndrome de Weil).',
  clinicalIndication:
    'Prescripción rápida por peso y grupo etario/gestacional en atención primaria, UAF, brigadas Col-Vol y hospitalización en zonas endémicas.',
  validatedPopulation: 'Población pediátrica, gestantes/puérperas y adultos en zonas endémicas (Protocolos MINSA Nicaragua / OPS-OMS).',
  contraindications: [
    'PRIMAQUINA está estrictamente CONTRAINDICADA durante el embarazo, la lactancia materna y en lactantes < 6 meses por riesgo de hemólisis grave (déficit de G6PD).',
    'DOXICICLINA debe evitarse en embarazo, lactancia y niños < 8–10 años (usar Amoxicilina 30 mg/kg/día en niños o 500 mg c/6 h en gestantes).',
    'En Leptospirosis moderada-grave vigilar la reacción de Jarisch-Herxheimer tras la primera dosis de Penicilina G cristalina.',
  ],
  limitations: [
    'Ante signos de malaria grave (deterioro neurológico, convulsiones, choque, ictericia, dificultad respiratoria, anemia grave o hiperparasitemia) no usar vía oral: referir/iniciar Artesunato IV de inmediato.',
    'En Leptospirosis NO esperar confirmación serológica (ELISA/MAT) para iniciar antibiótico: la mayor eficacia ocurre dentro de los primeros 5 días desde el inicio de los síntomas.',
  ],
  version: 'Normativa Nacional MINSA Nicaragua (Malaria & Leptospirosis) · OPS/OMS',
  references: [
    {
      citation:
        'Ministerio de Salud de Nicaragua (MINSA). Norma y Guía para el Diagnóstico, Tratamiento y Control de la Malaria (Cloroquina, Primaquina, Arteméter/Lumefantrina y Red Col-Vol). Managua: MINSA.',
      year: 2022,
    },
    {
      citation:
        'Ministerio de Salud de Nicaragua (MINSA). Normativa de Abordaje y Manejo Clínico de la Leptospirosis Humana. Managua: MINSA.',
      year: 2020,
    },
    {
      citation:
        'Organización Panamericana de la Salud / OMS. Directrices para el tratamiento de la malaria y manejo de enfermedades transmitidas por vectores en las Américas.',
      year: 2022,
    },
  ],
  fields: [
    protocolModeField,
    weightField,
    patientGroupField,
    doxyContraindicatedField,
    penicillinAllergyField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(malariaLeptospirosisMinsaCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors.map((e) => e.message).join(' '));
    }

    const mode = String(inputs.protocolMode ?? 'malaria_vivax');
    const weightKg = roundClinical(
      getCanonicalNumberValue(weightField, inputs.weightKg as NumberInputValue).canonicalValue!,
      1,
    );
    const group = String(inputs.patientGroup ?? 'adult_adolescent');
    const doxyContraindicated = Boolean(inputs.doxyContraindicated);
    const penicillinAllergy = Boolean(inputs.penicillinAllergy);
    const isPregnantOrInfantLt6m = group === 'pregnant_lactating' || group === 'infant_lt6m';

    if (mode === 'malaria_vivax' || mode === 'malaria_falciparum_sensible') {
      const isVivax = mode === 'malaria_vivax';
      // Chloroquine 25 mg/kg base over 3 days: 10 mg/kg D1, 10 mg/kg D2, 5 mg/kg D3 (adult cap 600 / 600 / 300 mg = 1500 mg total)
      const cqD1 = Math.min(600, roundClinical(weightKg * 10, 0));
      const cqD2 = Math.min(600, roundClinical(weightKg * 10, 0));
      const cqD3 = Math.min(300, roundClinical(weightKg * 5, 0));
      const cqTotal = cqD1 + cqD2 + cqD3;

      const tabsD1 = roundClinical(cqD1 / 150, 1);
      const tabsD3 = roundClinical(cqD3 / 150, 1);

      let pqPrimary = '';
      let pqNote = '';
      let severity: SeverityLevel = 'moderate';
      const guidance: string[] = [];

      if (isPregnantOrInfantLt6m) {
        severity = 'high';
        pqPrimary = 'Cloroquina únicamente (Primaquina CONTRAINDICADA)';
        pqNote =
          group === 'pregnant_lactating'
            ? 'Embarazo/lactancia: PROHIBIDA la Primaquina (riesgo de hemólisis fetal/neonatal). Administrar solo Cloroquina en 3 días; en P. vivax valorar profilaxis semanal con Cloroquina 300 mg base/sem hasta concluir parto y lactancia (< 6 m) antes de dar cura radical con Primaquina.'
            : 'Lactante < 6 meses: CONTRAINDICADA la Primaquina por inmadurez enzimática y riesgo hemolítico. Administrar únicamente Cloroquina ajustada a peso y diferir Primaquina hasta superar los 6 meses.';
        guidance.push(pqNote);
      } else if (isVivax) {
        // P. vivax MINSA shortened 7-day regimen: 0.5 mg/kg/day x 7 days (cap 30 mg/day)
        const pqDaily = Math.min(30, roundClinical(weightKg * 0.5, 1));
        const pqTotal = roundClinical(pqDaily * 7, 0);
        pqPrimary = `${formatClinicalNumber(cqTotal, 0)} mg CQ + ${formatClinicalNumber(pqDaily, 1)} mg/d PQ × 7 d`;
        pqNote = `Primaquina (cura radical anti-hipnozoítos): ${formatClinicalNumber(pqDaily, 1)} mg/día VO × 7 días (0.5 mg/kg/día; tope 30 mg/d · total ${pqTotal} mg = 3.5 mg/kg).`;
        guidance.push(pqNote);
      } else {
        // P. falciparum chloroquine-sensitive gametocytocidal single dose: 0.75 mg/kg (max 45 mg) per MINSA/OPS
        const pqSingle = Math.min(45, roundClinical(weightKg * 0.75, 1));
        pqPrimary = `${formatClinicalNumber(cqTotal, 0)} mg CQ + ${formatClinicalNumber(pqSingle, 1)} mg PQ DU`;
        pqNote = `Primaquina gametocida (dosis única Día 1): ${formatClinicalNumber(pqSingle, 1)} mg VO (0.75 mg/kg, máx 45 mg; pauta OMS baja transmisión 0.25 mg/kg).`;
        guidance.push(pqNote);
      }

      guidance.push(
        `Cloroquina base (25 mg/kg en 3 días; tabletas de 150 mg base): Día 1 = ${cqD1} mg (${tabsD1} tab) · Día 2 = ${cqD2} mg (${tabsD1} tab) · Día 3 = ${cqD3} mg (${tabsD3} tab) → Total ${cqTotal} mg base.`,
        'Supervisión estricta por personal de salud o Col-Vol (Red Comunitaria MINSA); tomar después de alimentos para mejorar tolerancia gástrica. Si vomita dentro de los primeros 30 min, repetir dosis completa.',
        'Vigilar signos de hemólisis durante Primaquina (orina oscura/coluria, ictericia, palidez aguda) y signos de alarma de malaria grave.',
      );

      const secondaryResults: SecondaryResultItem[] = [
        {
          label: 'Cloroquina Día 1 y Día 2 (10 mg/kg/d · máx 600 mg)',
          formattedValue: `${cqD1} mg/día`,
          unit: `(${tabsD1} tab de 150 mg base)`,
        },
        {
          label: 'Cloroquina Día 3 (5 mg/kg · máx 300 mg)',
          formattedValue: `${cqD3} mg`,
          unit: `(${tabsD3} tab de 150 mg base)`,
        },
        {
          label: isVivax ? 'Primaquina (cura radical 7 días)' : 'Primaquina gametocida',
          formattedValue: isPregnantOrInfantLt6m ? 'CONTRAINDICADA' : pqPrimary.split('+ ')[1] ?? '',
          unit: isPregnantOrInfantLt6m ? 'Diferir posparto / ≥ 6 m' : '',
        },
      ];

      return {
        primaryResult: {
          label: isVivax ? 'Esquema Malaria P. vivax (MINSA)' : 'Esquema P. falciparum sensible (MINSA)',
          value: cqTotal,
          formattedValue: isPregnantOrInfantLt6m ? `${cqTotal} mg CQ (sin PQ)` : pqPrimary,
          unit: isPregnantOrInfantLt6m ? 'Primaquina bloqueada' : 'Total 3 d CQ',
        },
        secondaryResults,
        severity,
        riskClassification: isPregnantOrInfantLt6m
          ? 'Pauta segura en embarazo/lactancia o < 6 m (Sin Primaquina)'
          : isVivax
            ? 'Tratamiento completo supervisado P. vivax (3 d CQ + 7 d PQ)'
            : 'Tratamiento completo P. falciparum sensible (3 d CQ + PQ DU)',
        clinicalInterpretation: `Paciente de ${formatClinicalNumber(weightKg, 1)} kg con ${isVivax ? 'Malaria por Plasmodium vivax' : 'Malaria por Plasmodium falciparum sensible'}. ${pqNote}`,
        guidance,
        formulaUsed:
          'MINSA Nicaragua Malaria: Cloroquina 25 mg/kg (10/10/5 mg/kg, máx 1,500 mg base) + Primaquina 0.5 mg/kg/d × 7 d (vivax) o 0.75 mg/kg DU (falciparum)',
        inputsSummary: `Modo=${mode}, Peso=${formatClinicalNumber(weightKg, 1)} kg, Grupo=${group}`,
      };
    }

    if (mode === 'malaria_falciparum_resistente') {
      let tabsPerDose = 4;
      let bandLabel = '≥ 35 kg';
      if (weightKg < 5) {
        tabsPerDose = 0;
        bandLabel = '< 5 kg (valoración especializada)';
      } else if (weightKg < 15) {
        tabsPerDose = 1;
        bandLabel = '5 – 14.9 kg';
      } else if (weightKg < 25) {
        tabsPerDose = 2;
        bandLabel = '15 – 24.9 kg';
      } else if (weightKg < 35) {
        tabsPerDose = 3;
        bandLabel = '25 – 34.9 kg';
      }

      const totalTabs = tabsPerDose * 6;
      const severity: SeverityLevel = weightKg < 5 ? 'critical' : 'high';

      return {
        primaryResult: {
          label: 'Arteméter 20 mg / Lumefantrina 120 mg',
          value: tabsPerDose,
          formattedValue: weightKg < 5 ? 'Evaluar especialista (< 5 kg)' : `${tabsPerDose} tab/dosis (× 6 dosis)`,
          unit: weightKg < 5 ? 'Fuera de banda estándar' : `${totalTabs} tabletas totales en 3 días`,
        },
        secondaryResults: [
          {
            label: 'Banda de peso OMS / MINSA',
            formattedValue: bandLabel,
            unit: `${formatClinicalNumber(weightKg, 1)} kg`,
          },
          {
            label: 'Horario de 6 tomas (3 días)',
            formattedValue: '0 h · 8 h · 24 h · 36 h · 48 h · 60 h',
            unit: '(2 tomas/día)',
          },
        ],
        severity,
        riskClassification: 'Malaria por P. falciparum resistente o infección mixta — Coartem',
        clinicalInterpretation:
          weightKg < 5
            ? 'En menores de 5 kg la dosificación estándar de Arteméter-Lumefantrina requiere ajuste individualizado hospitalario o Artesunato IV según gravedad.'
            : `Administrar ${tabsPerDose} tableta(s) de Arteméter 20 mg / Lumefantrina 120 mg por dosis (total ${totalTabs} tabletas en 6 tomas durante 3 días).`,
        guidance: [
          'Administrar SIEMPRE acompañado de alimentos o bebida láctea/grasa para maximizar la absorción de lumefantrina (evitar jugo de toronja).',
          'En embarazo (2.º y 3.er trimestre, y aceptado por OMS en 1.er trimestre como alternativa segura frente a malaria por P. falciparum resistente), Arteméter-Lumefantrina es de elección; NO añadir Primaquina en embarazo ni < 6 meses.',
          'Ante cualquier criterio de malaria grave (alteración neurológica, vómitos incoercibles, choque, ictericia, IRA), iniciar Artesunato IV 2.4 mg/kg (3.0 mg/kg en < 20 kg) a las 0, 12 y 24 h en hospital.',
        ],
        formulaUsed: 'Bandas OMS/MINSA Coartem (20/120 mg): 5–14.9 kg (1 tab), 15–24.9 kg (2 tab), 25–34.9 kg (3 tab), ≥ 35 kg (4 tab) × 6 dosis',
        inputsSummary: `Modo=P. falciparum resistente, Peso=${formatClinicalNumber(weightKg, 1)} kg, Grupo=${group}`,
      };
    }

    if (mode === 'leptospirosis_leve') {
      const useAmoxicillin =
        group === 'pregnant_lactating' ||
        group === 'pediatric_ge6m' ||
        group === 'infant_lt6m' ||
        doxyContraindicated;

      let drugSummary = 'Doxiciclina 100 mg VO c/12 h × 7 días';
      let dailyDoseMg = 200;
      let detailNote = 'Adultos y ≥ 10 años sin embarazo/alergia: Doxiciclina 100 mg VO cada 12 horas por 7 días.';

      if (useAmoxicillin) {
        if (group === 'pediatric_ge6m' || group === 'infant_lt6m') {
          // MINSA pediatric standard 30-50 mg/kg/day divided q8h (baseline 30 mg/kg/d capped at 1500 mg/d)
          dailyDoseMg = Math.min(1500, roundClinical(weightKg * 30, 0));
          const doseQ8h = roundClinical(dailyDoseMg / 3, 0);
          drugSummary = `Amoxicilina ${doseQ8h} mg VO c/8 h × 7 d`;
          detailNote = `Niño (< 10 años): Amoxicilina ${dailyDoseMg} mg/día (30 mg/kg/día; rango 30–50 mg/kg/día) dividida cada 8 h (${doseQ8h} mg c/8 h) × 7 días.`;
        } else {
          dailyDoseMg = 2000;
          drugSummary = 'Amoxicilina 500 mg VO c/6 h × 7 días';
          detailNote =
            group === 'pregnant_lactating'
              ? 'Embarazo/lactancia (Doxiciclina contraindicada): Amoxicilina 500 mg VO cada 6 h × 7 días (alternativa Eritromicina/Azitromicina si alergia a penicilina).'
              : 'Intolerancia/contraindicación a Doxiciclina: Amoxicilina 500 mg VO cada 6 h (o Azitromicina 500 mg/día × 3–5 d si alergia a betalactámicos).';
        }
      }

      return {
        primaryResult: {
          label: 'Antibioticoterapia Leptospirosis Leve (MINSA)',
          value: dailyDoseMg,
          formattedValue: drugSummary,
          unit: '× 7 días',
        },
        secondaryResults: [
          {
            label: 'Ventana ideal de inicio',
            formattedValue: 'De inmediato (< 5 días del inicio)',
            unit: 'No esperar serología',
          },
          {
            label: 'Profilaxis comunitaria (brotes / inundaciones)',
            formattedValue: 'Doxiciclina 200 mg VO 1 vez/semana',
            unit: '(solo ≥ 10 años no gestantes)',
          },
        ],
        severity: 'moderate',
        riskClassification: 'Leptospirosis leve / fase anictérica ambulatoria (MINSA)',
        clinicalInterpretation: detailNote,
        guidance: [
          detailNote,
          'Iniciar antibiótico ante la sospecha clínica y nexo epidemiológico (exposición a agua estancada, lodo, lluvias o roedores) sin esperar ELISA/MAT.',
          'Signos de alarma para ingreso hospitalario inmediato: ictericia, oliguria/anuria, hemoptisis o disnea (hemorragia alveolar), hipotensión, dolor abdominal intenso o confusión.',
          'Seguimiento clínico diario las primeras 48–72 h; evitar AINEs/AAS por riesgo hemorrágico y nefrotoxicidad.',
        ],
        formulaUsed: 'Norma MINSA Nicaragua Leptospirosis leve: Doxiciclina 100 mg c/12 h (≥ 10 a) o Amoxicilina 30 mg/kg/d (< 10 a) / 500 mg c/6 h (embarazo)',
        inputsSummary: `Modo=Leptospirosis leve, Peso=${formatClinicalNumber(weightKg, 1)} kg, Grupo=${group}, ContraindDoxi=${doxyContraindicated ? 'Sí' : 'No'}`,
      };
    }

    // leptospirosis_grave
    const isPediatric = group === 'pediatric_ge6m' || group === 'infant_lt6m';
    let ivPrimary = '';
    let ivDetail = '';
    let numericUiOrMg = 0;

    if (penicillinAllergy) {
      if (isPediatric) {
        const ceftriaxoneDaily = Math.min(2000, roundClinical(weightKg * 75, 0));
        numericUiOrMg = ceftriaxoneDaily;
        ivPrimary = `Ceftriaxona ${ceftriaxoneDaily} mg IV/día (o Doxiciclina IV si ≥ 8–10 a)`;
        ivDetail = `Alergia a penicilina en pediatría: valorar Ceftriaxona 50–80 mg/kg/día IV (${ceftriaxoneDaily} mg/día; máx 2 g/d) si alergia no anafiláctica a cefalosporinas, o Macrólido/Cloranfenicol bajo valoración infectológica.`;
      } else {
        numericUiOrMg = 2000;
        ivPrimary = 'Ceftriaxona 1–2 g IV c/24 h (o Doxiciclina 100 mg IV/VO c/12 h)';
        ivDetail =
          group === 'pregnant_lactating'
            ? 'Alergia grave a penicilina en gestante: valorar Azitromicina/Eritromicina IV o desensibilización/Ceftriaxona según tipo de reacción bajo supervisión obstétrica e infectología.'
            : 'Alergia a penicilina en adulto: Ceftriaxona 1–2 g IV cada 24 h × 7 días (o Doxiciclina 100 mg IV/VO c/12 h si anafilaxia cruzada a betalactámicos).';
      }
    } else if (isPediatric) {
      // Penicilina G cristalina pediátrica: 250,000 UI/kg/día IV dividida c/4-6 h (tope 12-24 millones UI/día)
      const dailyUi = Math.min(16_000_000, roundClinical(weightKg * 250_000, 0));
      const doseQ6hUi = roundClinical(dailyUi / 4, 0);
      numericUiOrMg = dailyUi;
      ivPrimary = `Penicilina cristalina ${formatClinicalNumber(doseQ6hUi / 1_000_000, 2)} M UI IV c/6 h`;
      ivDetail = `Pediatría (< 10 años): Penicilina G sódica cristalina 250,000 UI/kg/día = ${dailyUi.toLocaleString('en-US')} UI/día IV divididas cada 4–6 h (${doseQ6hUi.toLocaleString('en-US')} UI IV c/6 h) × 7 días.`;
    } else {
      numericUiOrMg = 6_000_000;
      ivPrimary = 'Penicilina G cristalina 1.5–4 M UI IV c/4–6 h';
      ivDetail =
        'Adulto / Adolescente / Gestante (MINSA): Penicilina G sódica cristalina 1.5 millones UI IV cada 6 horas (hasta 2–4 millones UI IV c/4–6 h en Síndrome de Weil grave) × 7 días (alternativa Ceftriaxona 1–2 g IV c/24 h).';
    }

    return {
      primaryResult: {
        label: 'Esquema Hospitalario Leptospirosis Grave (MINSA)',
        value: numericUiOrMg,
        formattedValue: ivPrimary,
        unit: '× 7 días IV',
      },
      secondaryResults: [
        {
          label: 'Vigilancia obligatoria primeras horas',
          formattedValue: 'Reacción de Jarisch-Herxheimer',
          unit: 'Monitorizar PA, T° y SpO₂',
        },
        {
          label: 'Soporte crítico Síndrome de Weil',
          formattedValue: 'Balance hídrico · Creatinina/K⁺ · Plt',
          unit: 'Vigilar hemorragia pulmonar',
        },
      ],
      severity: 'critical',
      riskClassification: 'Leptospirosis moderada-grave / Síndrome de Weil — Hospitalización inmediata',
      clinicalInterpretation: ivDetail,
      guidance: [
        ivDetail,
        'Vigilar reacción de Jarisch-Herxheimer en las primeras 2–6 horas post-penicilina (fiebre, escalofríos, taquicardia, caída de PA): soporte hemodinámico y antipiréticos (paracetamol).',
        'Solicitar biometría hemática, creatinina, electrolitos, bilirrubinas, transaminasas, tiempos de coagulación, Rx de tórax y toma de muestra para ELISA IgM / MAT según norma MINSA.',
        'Monitorizar diuresis horaria (LRA no oligúrica vs oligúrica), hipopotasemia y signos de síndrome de hemorragia pulmonar grave (soporte ventilatorio temprano si hipoxemia).',
      ],
      formulaUsed: 'Norma MINSA Nicaragua Leptospirosis grave: Penicilina G cristalina 1.5–4 M UI IV c/4–6 h (adultos) o 250,000 UI/kg/d IV (niños)',
      inputsSummary: `Modo=Leptospirosis grave, Peso=${formatClinicalNumber(weightKg, 1)} kg, Grupo=${group}, AlergiaPen=${penicillinAllergy ? 'Sí' : 'No'}`,
    };
  },
};
