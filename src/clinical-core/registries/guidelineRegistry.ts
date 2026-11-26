import {
  formatClinicalNumber,
  getCanonicalNumberValue,
  roundClinical,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorFieldDef,
  CalculatorInputsState,
  ClinicalGuidelineCoverage,
  GuidelineScope,
  NumberFieldDef,
  NumberInputValue,
  SecondaryResultItem,
  SeverityLevel,
} from '../types/clinical.ts';
import type { ClinicalReferenceTable } from './clinicalTables.ts';

export const NICARAGUA_ONLY_CALCULATOR_IDS = new Set<string>([]);

export const DUAL_CALCULATOR_IDS = new Set<string>([
  'dengue-oms',
  'obstetric-mgso4',
  'preeclampsia-hellp',
  'hiv-cdc-cd4-prophylaxis',
  'hiv-pep-prep',
  'hiv-opportunistic-art-timing',
  'tuberculosis-clinical-suite',
  'malaria-leptospirosis-minsa',
  'immunization-minsa-nicaragua',
]);

export const NICARAGUA_ONLY_TABLE_IDS = new Set<string>([]);

export const DUAL_TABLE_IDS = new Set<string>([
  'preeclampsia-acog-table',
  'dengue-paho-who-table',
  'hiv-art-regimens-interactions-table',
  'hiv-pep-prep-prevention-table',
  'tuberculosis-oms-cdc-reference-table',
  'malaria-leptospirosis-minsa-table',
  'minsa-nicaragua-immunization-table',
]);

export function getCalculatorGuidelineCoverage(id: string): ClinicalGuidelineCoverage {
  if (NICARAGUA_ONLY_CALCULATOR_IDS.has(id)) return 'nicaragua-only';
  if (DUAL_CALCULATOR_IDS.has(id)) return 'dual';
  return 'universal';
}

export function isDualCalculator(id: string): boolean {
  return DUAL_CALCULATOR_IDS.has(id);
}

export function isCalculatorVisibleForScope(id: string, scope: GuidelineScope): boolean {
  if (scope === 'nicaragua') return true;
  return !NICARAGUA_ONLY_CALCULATOR_IDS.has(id);
}

export function getTableGuidelineCoverage(id: string): ClinicalGuidelineCoverage {
  if (NICARAGUA_ONLY_TABLE_IDS.has(id)) return 'nicaragua-only';
  if (DUAL_TABLE_IDS.has(id)) return 'dual';
  return 'universal';
}

export function isDualTable(id: string): boolean {
  return DUAL_TABLE_IDS.has(id);
}

export function isTableVisibleForScope(id: string, scope: GuidelineScope): boolean {
  if (scope === 'nicaragua') return true;
  return !NICARAGUA_ONLY_TABLE_IDS.has(id);
}

function patchFields(
  fields: CalculatorFieldDef[],
  patches: Record<
    string,
    {
      label?: string;
      helpText?: string;
      placeholder?: string;
      defaultValue?: string;
      optionLabels?: Record<string, string>;
    }
  >,
): CalculatorFieldDef[] {
  return fields.map((field) => {
    const patch = patches[field.id];
    if (!patch) return field;

    if (field.type === 'select') {
      return {
        ...field,
        label: patch.label ?? field.label,
        helpText: patch.helpText ?? field.helpText,
        defaultValue: patch.defaultValue ?? field.defaultValue,
        options: patch.optionLabels
          ? field.options.map((opt) => ({
              ...opt,
              label: patch.optionLabels?.[opt.value] ?? opt.label,
            }))
          : field.options,
      };
    }

    if (field.type === 'number') {
      return {
        ...field,
        label: patch.label ?? field.label,
        helpText: patch.helpText ?? field.helpText,
        placeholder: patch.placeholder ?? field.placeholder,
        defaultValue: patch.defaultValue ?? field.defaultValue,
      };
    }

    return {
      ...field,
      label: patch.label ?? field.label,
      helpText: patch.helpText ?? field.helpText,
    };
  });
}

function resolveDengueInternational(calc: CalculatorDefinition): CalculatorDefinition {
  const weightField = calc.fields.find((f): f is NumberFieldDef => f.id === 'weightKg');
  const fields = patchFields(calc.fields, {
    weightKg: {
      label: 'Peso para cálculo de líquidos (opcional — OPS / OMS)',
      helpText:
        'Opcional: calcula cargas IV según guías OPS/OMS (usar peso ideal para la talla en sobrepeso/obesidad y peso real en bajo peso).',
    },
    comorbidityOrSocial: {
      label:
        'Condición coexistente o riesgo social (Grupo B1): embarazo, lactante, adulto mayor, obesidad, diabetes, ERC, hepatopatía o vive solo/lejos',
    },
  });

  return {
    ...calc,
    name: 'Clasificación y Manejo de Líquidos del Dengue (OMS / OPS)',
    shortName: 'Dengue (OMS / OPS)',
    keywords: calc.keywords.filter((k) => !['minsa', 'normativa 147', 'nicaragua', 'uaf'].includes(k)),
    description:
      'Clasificación clínica en Grupos A, B1, B2 y C e hidratación IV recomendada según las directrices regionales OPS 2022 y OMS (cargas de 10 mL/kg en B2 y 10–20 mL/kg en choque con cristaloides isotónicos sobre peso ideal).',
    validatedPopulation:
      'Adultos, embarazadas y población pediátrica en zonas endémicas (OMS / OPS).',
    limitations: [
      'En pacientes con sobrepeso u obesidad, calcular las cargas IV con el PESO IDEAL para la talla (OPS/OMS) para evitar sobrecarga pulmonar; en bajo peso usar peso real.',
      'Algunos protocolos nacionales (como la Normativa 147 MINSA Nicaragua) utilizan cargas iniciales más conservadoras de 7 mL/kg en B2 y 10 mL/kg en Grupo C; puedes alternar al perfil Nicaragua (MINSA) si aplicas dicha norma.',
    ],
    version: 'OMS / OPS Directrices Dengue 2022',
    references: calc.references.filter((r) => !r.citation.includes('MINSA')),
    fields,
    calculate: (inputs: CalculatorInputsState) => {
      const errors = validateCalculatorInputs(calc, inputs);
      if (errors.length > 0) {
        throw new Error(errors[0].message);
      }

      const weightKg = weightField
        ? getCanonicalNumberValue(weightField, inputs.weightKg as NumberInputValue | undefined)
            .canonicalValue
        : null;
      const severeCount = ['sev_plasma', 'sev_bleed', 'sev_organ'].filter(
        (id) => inputs[id] === true,
      ).length;
      const warningCount = [
        'ws_pain',
        'ws_vomiting',
        'ws_fluid',
        'ws_bleed',
        'ws_lethargy',
        'ws_liver',
        'ws_labs',
      ].filter((id) => inputs[id] === true).length;
      const hasRiskGroup = inputs.comorbidityOrSocial === true;

      const buildFluidSecondary = (
        mlPerKg: number,
        label: string,
        durationText: string,
      ): SecondaryResultItem[] => {
        if (weightKg === null) return [];
        const volMl = roundClinical(weightKg * mlPerKg, 0);
        return [
          {
            label,
            formattedValue: `${formatClinicalNumber(volMl, 0)} mL`,
            unit: `${durationText} (${mlPerKg} mL/kg × ${formatClinicalNumber(weightKg, 1)} kg)`,
            note: 'Solución recomendada OPS/OMS: cristaloide isotónico (Lactato de Ringer o SSN 0.9 %).',
          },
        ];
      };

      if (severeCount > 0) {
        const bolus20Ml = weightKg !== null ? roundClinical(weightKg * 20, 0) : null;
        return {
          primaryResult: {
            label: 'Clasificación OMS / OPS',
            value: 3,
            formattedValue: 'Dengue Grave (Grupo C)',
            unit: `${severeCount} criterio(s) grave(s)`,
          },
          secondaryResults: buildFluidSecondary(
            20,
            'Bolo inicial Grupo C (OPS / OMS · 20 mL/kg en choque)',
            'en 15–30 min',
          ),
          severity: 'critical',
          riskClassification: 'Dengue Grave — Grupo de Manejo C (UCI / Reanimación)',
          clinicalInterpretation:
            'Presencia de extravasación plasmática grave, hemorragia grave o disfunción orgánica grave. Emergencia médica con alto riesgo de choque refractario.',
          guidance: [
            bolus20Ml !== null
              ? `Directrices OPS / OMS: Administrar bolo inicial de cristaloide isotónico (Lactato de Ringer o SSN 0.9 %) a 20 mL/kg en 15–30 min si choque hipotensivo = ${bolus20Ml} mL (o 10 mL/kg en 1 h si choque compensado). Reevaluar pulso, PA, llenado capilar, diuresis (≥ 0.5–1 mL/kg/h) y hematocrito.`
              : 'Directrices OPS / OMS: Administrar bolo inicial de cristaloide isotónico (Lactato de Ringer o SSN 0.9 %) a 20 mL/kg en 15–30 min si choque hipotensivo (o 10 mL/kg/h si choque compensado), con descenso escalonado si mejora.',
            'Si el choque persiste tras 2 bolos y CAE el hematocrito: sospechar HEMORRAGIA OCULTA y valorar transfusión de paquete globular (si Hto sube con choque refractario, valorar coloide).',
            'Retirar líquidos IV progresivamente cuando cedan signos de choque, diuresis ≥ 1 mL/kg/h y mejore el hematocrito para evitar edema pulmonar.',
          ],
          formulaUsed:
            'Directrices OPS/OMS Dengue (Grupo C: 10–20 mL/kg con cristaloide isotónico sobre peso ideal)',
          inputsSummary: `Criterios graves: ${severeCount} · Signos de alarma: ${warningCount}${weightKg !== null ? ` · Peso: ${formatClinicalNumber(weightKg, 1)} kg` : ''}`,
        };
      }

      if (warningCount > 0) {
        const charge10Ml = weightKg !== null ? roundClinical(weightKg * 10, 0) : null;
        return {
          primaryResult: {
            label: 'Clasificación OMS / OPS',
            value: 2,
            formattedValue: 'Con Signos de Alarma (B2)',
            unit: `${warningCount} signo(s)`,
          },
          secondaryResults: buildFluidSecondary(
            10,
            'Carga inicial Grupo B2 (OPS / OMS · 10 mL/kg/h)',
            'en 1 hora',
          ),
          severity: 'high',
          riskClassification: 'Dengue con Signos de Alarma — Grupo de Manejo B2',
          clinicalInterpretation:
            'Fase crítica inminente o en curso con aumento de permeabilidad capilar. Riesgo de progresión a choque si no se maneja oportunamente.',
          guidance: [
            charge10Ml !== null
              ? `Directrices OPS / OMS: Hospitalización inmediata e iniciar cristaloide isotónico (Lactato de Ringer o SSN 0.9 %) a 10 mL/kg en la 1.ª hora = ${charge10Ml} mL (calculado sobre peso ideal en sobrepeso/obesidad).`
              : 'Directrices OPS / OMS: Hospitalización inmediata e iniciar cristaloide isotónico (Lactato de Ringer o SSN 0.9 %) a 10 mL/kg en la 1.ª hora (sobre peso ideal en sobrepeso/obesidad).',
            'Reevaluar al finalizar la 1.ª hora: si hay mejoría clínica y diuresis adecuada, descender a 5–7 mL/kg/h (2–4 h) → 3–5 mL/kg/h → 2–3 mL/kg/h; si persiste o empeora, repetir 10 mL/kg/h o reclasificar a Grupo C.',
            'Monitorizar signos vitales horarios, balance hídrico estricto y hematocrito/plaquetas seriados.',
          ],
          formulaUsed:
            'Directrices OPS/OMS Dengue (Grupo B2: 10 mL/kg en 1.ª h con cristaloide isotónico)',
          inputsSummary: `Signos de alarma: ${warningCount}${weightKg !== null ? ` · Peso: ${formatClinicalNumber(weightKg, 1)} kg` : ''}`,
        };
      }

      if (hasRiskGroup) {
        return {
          primaryResult: {
            label: 'Clasificación OMS / OPS',
            value: 1,
            formattedValue: 'Sin Alarma + Riesgo (B1)',
            unit: 'Grupo B1',
          },
          severity: 'moderate',
          riskClassification:
            'Dengue sin Signos de Alarma con Condición Asociada — Grupo B1',
          clinicalInterpretation:
            'Sin signos de alarma actuales, pero con comorbilidad o vulnerabilidad social que aumenta el riesgo de complicaciones.',
          guidance: [
            'Observación o ingreso hospitalario para seguimiento estrecho y reevaluación clínica frecuente.',
            'Priorizar hidratación oral supervisada (SRO); usar líquidos IV de mantenimiento (Lactato de Ringer o SSN 0.9 %) únicamente si no tolera la vía oral.',
            'Vigilar cada 4 h aparición de signos de alarma (especialmente al caer la fiebre) y biometría hemática seriada.',
          ],
          formulaUsed:
            'Sin criterios graves ni signos de alarma + condición coexistente/riesgo social (Grupo B1 OPS/OMS)',
          inputsSummary: `Sin alarma · Con condición asociada o riesgo social (Grupo B1)${weightKg !== null ? ` · Peso: ${formatClinicalNumber(weightKg, 1)} kg` : ''}`,
        };
      }

      return {
        primaryResult: {
          label: 'Clasificación OMS / OPS',
          value: 0,
          formattedValue: 'Sin Signos de Alarma (A)',
          unit: 'Grupo A',
        },
        severity: 'low',
        riskClassification: 'Dengue sin Signos de Alarma — Grupo de Manejo A',
        clinicalInterpretation:
          'Sin signos de alarma ni condiciones de riesgo social/clínico identificadas en esta valoración.',
        guidance: [
          'Manejo ambulatorio con hidratación oral abundante (SRO, agua, líquidos sin exceso de azúcar), control térmico con paracetamol/acetaminofén y medios físicos.',
          'Evitar estrictamente AINEs, aspirina, corticoides e inyecciones IM; cita médica de control cada 24–48 h hasta 48 h posdefervescencia.',
        ],
        formulaUsed: 'Sin criterios graves, sin signos de alarma y sin condiciones asociadas (Grupo A)',
        inputsSummary: `Grupo A (sin alarma ni riesgo asociado)${weightKg !== null ? ` · Peso: ${formatClinicalNumber(weightKg, 1)} kg` : ''}`,
      };
    },
  };
}

function resolveMgso4ForScope(
  calc: CalculatorDefinition,
  scope: GuidelineScope,
): CalculatorDefinition {
  if (scope === 'nicaragua') {
    const fields = patchFields(calc.fields, {
      loadingPrep: { defaultValue: '200ml' },
      bagPrep: { defaultValue: '8g_420ml' },
    });
    return {
      ...calc,
      fields,
    };
  }

  const fields = patchFields(calc.fields, {
    loadingPrep: {
      defaultValue: '100ml',
      optionLabels: {
        '100ml': '100 mL de SS 0.9 % / RL (estándar internacional OMS / ACOG)',
        '200ml': '200 mL de SSN / RL / D5% (dilución de mayor volumen)',
      },
    },
    bagPrep: {
      defaultValue: '20g_500ml',
      optionLabels: {
        '20g_500ml': '20 g de MgSO₄ en 500 mL de SS 0.9 % / RL (40 mg/mL · estándar OMS/ACOG)',
        '10g_500ml': '10 g de MgSO₄ en 500 mL de SS 0.9 % / RL (20 mg/mL)',
        '10g_250ml': '10 g de MgSO₄ en 250 mL de SS 0.9 % / RL (40 mg/mL)',
        '8g_420ml': '8 g de MgSO₄ al 10 % (80 mL) + 420 mL de SSN = 500 mL (16 mg/mL)',
      },
    },
  });

  return {
    ...calc,
    name: 'Sulfato de Magnesio Obstétrico (Esquema Zuspan / Sibai · OMS / ACOG)',
    shortName: 'MgSO₄ Obstétrico (Zuspan)',
    keywords: calc.keywords.filter((k) => !['normativa 109', 'minsa', 'nicaragua'].includes(k)),
    description:
      'Cálculo seguro de preparación, gotas/microgotas y velocidad en bomba (mL/h) para impregnación y mantenimiento IV con MgSO₄ según Esquema Zuspan / Sibai (OMS / ACOG PB 222).',
    limitations: [
      'Nunca administrar la dosis de carga en bolo rápido sin control: la infusión rápida puede causar parada cardiorrespiratoria o hipotensión grave.',
      'Verificar cada hora: reflejo rotuliano presente, frecuencia respiratoria (≥ 12–16 rpm según ACOG / OMS) y diuresis ≥ 30 mL/h. Tener disponible Gluconato de Calcio 1 g (10 mL al 10 %) IV como antídoto.',
    ],
    version: 'Esquema Zuspan · OMS / ACOG PB 222',
    references: calc.references.filter((r) => !r.citation.includes('MINSA')),
    fields,
    calculate: (inputs: CalculatorInputsState) => {
      const base = calc.calculate(inputs);
      return {
        ...base,
        guidance: [
          'Esquema Zuspan estándar (OMS / ACOG): Carga de 4 g IV (o 6 g en esquema Sibai) diluidos en 100 mL de SS 0.9 % o RL en 15–20 min, seguida de infusión continua de 1 g/h (o 2 g/h en Sibai) hasta 24 h posparto o última convulsión. Si recurre convulsión, valorar refuerzo de 2 g IV en 5–10 min.',
          'Suspender inmediatamente el mantenimiento si abolición de reflejos osteotendinosos, FR < 12–16 rpm o diuresis < 30 mL/h (en 4 h previas). Control estricto de líquidos IV totales.',
          'Emergencia hipertensiva (PAS ≥ 160 o PAD ≥ 110 mmHg): Labetalol IV (20 mg inicial), Hidralazina 5 mg IV bolo lento o Nifedipino de liberación inmediata VÍA ORAL únicamente (NUNCA sublingual).',
        ],
        formulaUsed: 'Velocidad (mL/h) = Dosis horaria (g/h) / Concentración (g/mL) · Esquema Zuspan / Sibai (OMS / ACOG)',
      };
    },
  };
}

function resolvePreeclampsiaInternational(calc: CalculatorDefinition): CalculatorDefinition {
  return {
    ...calc,
    references: calc.references.filter((r) => !r.citation.includes('MINSA')),
    calculate: (inputs: CalculatorInputsState) => {
      const base = calc.calculate(inputs);
      return {
        ...base,
        guidance: base.guidance?.map((item) =>
          item
            .replace(' [MINSA Normativa 109: 4 g en 200 mL en 5–15 min]', '')
            .replace('MINSA Normativa 109 / Zuspan', 'Zuspan / OMS / ACOG'),
        ),
      };
    },
  };
}

function resolveHivCd4International(calc: CalculatorDefinition): CalculatorDefinition {
  return {
    ...calc,
    keywords: calc.keywords.filter((k) => !['minsa', 'nicaragua'].includes(k)),
    description:
      'Clasificación oficial CDC (Estadios 1, 2 y 3 / SIDA), identificación de Enfermedad Avanzada por VIH (OMS), inicio universal de TAR e indicación exacta de profilaxis primaria y tamizajes según recuento de CD4.',
    validatedPopulation:
      'Adultos y adolescentes ≥ 6 años con infección por VIH confirmada (CDC / NIH-DHHS / OMS).',
    version: 'CDC HIV Case Definition 2014 · NIH/DHHS 2024 · WHO AHD',
    references: [
      ...calc.references.filter((r) => !r.citation.includes('MINSA')),
      {
        citation:
          'World Health Organization. Consolidated guidelines on HIV prevention, testing, treatment, service delivery and monitoring. Geneva: WHO; 2021.',
        year: 2021,
      },
    ],
    calculate: (inputs: CalculatorInputsState) => {
      const base = calc.calculate(inputs);
      const isPregnant = Boolean(inputs.isPregnant);
      return {
        ...base,
        guidance: base.guidance?.map((item) => {
          if (item.startsWith('EMBARAZO')) {
            return isPregnant
              ? 'EMBARAZO (OMS / DHHS): Tamizaje universal desde el 1.er control prenatal e inicio INMEDIATO de TAR triple independiente de CD4 (preferidos OMS/DHHS: TDF/FTC o TDF/3TC + Dolutegravir 50 mg VO c/24 h). Valorar cesárea electiva a las 38 SG si ARN-VIH > 1,000 copias/mL cerca del parto y profilaxis ARV neonatal según riesgo virológico; consejería de lactancia según guías locales y supresión viral.'
              : item;
          }
          if (item.includes('MINSA Nicaragua/OMS')) {
            return 'Inicio de TAR recomendado para TODA persona con VIH independientemente del recuento de CD4 (1.ª línea OMS/DHHS: TDF/3TC/DTG o TDF/FTC + DTG 50 mg o BIC/FTC/TAF VO c/24 h; en Estadio 3 / CD4 < 200 descartar antes meningitis TB y criptocócica).';
          }
          return item;
        }),
      };
    },
  };
}

function resolveHivPepPrepInternational(calc: CalculatorDefinition): CalculatorDefinition {
  return {
    ...calc,
    keywords: calc.keywords.filter((k) => !['minsa', 'nicaragua', 'ppe'].includes(k)),
    description:
      'Evaluación de elegibilidad, ventana crítica de 72 horas, esquemas antirretrovirales de primera línea (CDC / OMS) y ajuste renal para PEP y PrEP.',
    limitations: calc.limitations.map((l) =>
      l.replace('los protocolos laborales (incl. MINSA)', 'algunos protocolos institucionales laborales'),
    ),
    version: 'CDC nPEP/oPEP 2025 · CDC PrEP · WHO Consolidated Guidelines',
    references: calc.references.filter((r) => !r.citation.includes('MINSA')),
    calculate: (inputs: CalculatorInputsState) => {
      const base = calc.calculate(inputs);
      return {
        ...base,
        riskClassification: base.riskClassification.replace('PEP / PPE INDICADA', 'PEP INDICADA'),
        guidance: base.guidance?.map((item) => {
          if (item.startsWith('Esquema recomendado:')) {
            return item.replace('TDF/3TC 300/300 mg (esquema TLD MINSA) o ', '');
          }
          if (item.includes('normativa institucional MINSA')) {
            return 'Seguimiento serológico VIH (CDC 2025): control con prueba de 4.ª generación (y ARN-VIH si síntomas agudos o alto riesgo) a las 4–6 semanas y a las 12 semanas post-exposición (extender a 6 meses si coinfección/exposición simultánea a VHC que retrase seroconversión).';
          }
          return item;
        }),
        formulaUsed: base.formulaUsed.replace('PEP/PPE CDC · OMS · MINSA Nicaragua', 'PEP CDC 2025 · OMS'),
      };
    },
  };
}

function resolveHivArtTimingInternational(calc: CalculatorDefinition): CalculatorDefinition {
  return {
    ...calc,
    calculate: (inputs: CalculatorInputsState) => {
      const base = calc.calculate(inputs);
      return {
        ...base,
        riskClassification: base.riskClassification.replace(' (OMS / DHHS / MINSA)', ' (OMS / DHHS)'),
        guidance: base.guidance?.map((item) =>
          item
            .replace(' (referencia CNDR en red pública)', '')
            .replace('AJUSTE POR RIFAMPICINA (MINSA / OMS): En pacientes con esquema TLD (TDF/3TC/DTG),', 'AJUSTE POR RIFAMPICINA (DHHS / OMS): En pacientes que reciben Dolutegravir (TDF/3TC/DTG o TDF/FTC + DTG),')
            .replace(' a las 12 horas de la dosis fija combinada TLD', ''),
        ),
        clinicalInterpretation: base.clinicalInterpretation.replace(
          '1.ª línea MINSA Nicaragua/OMS: TLD [TDF 300 / 3TC 300 / DTG 50 mg] 1 comp VO c/24 h; alternativa BIC/FTC/TAF',
          '1.ª línea DHHS/OMS: BIC/FTC/TAF o TDF/FTC + DTG 50 mg (o TDF/3TC/DTG) 1 comp VO c/24 h',
        ),
      };
    },
  };
}

function resolveTuberculosisInternational(calc: CalculatorDefinition): CalculatorDefinition {
  const fields = patchFields(calc.fields, {
    tbMode: {
      optionLabels: {
        tb_active_dosing: 'TB Activa Sensible: Esquema 2HRZE / 4HR (DFC y DOT) por peso',
        ltbi_tst_tpt: 'TB Latente (LTBI): PPD / IGRA y Terapia Preventiva (3HP / 3HR / 6H)',
        tb_dx_isolation: 'Sospecha Clínica, Baciloscopía / GeneXpert MTB/RIF, BPaLM y Aislamiento',
      },
    },
    activeSite: { label: 'Forma clínica de TB sensible (OMS / ATS-IDSA)' },
    tstRiskGroup: {
      optionLabels: {
        cutoff_10mm:
          'Corte ≥ 10 mm: nacido en área endémica, personal de salud, residencias/prisiones, UDVP, < 4–5 años, DM, ERC o silicosis',
      },
    },
    activeTbExcluded: {
      helpText:
        'Regla clínica OMS/CDC: NUNCA iniciar terapia preventiva (TPT: 3HP/1HP/3HR/6H) sin descartar primero TB activa.',
    },
    prioritizedGroup: { label: 'Grupo de alto riesgo / Estado de VIH' },
    xpertResult: { label: 'Resultado de GeneXpert MTB/RIF (o Xpert Ultra) o Baciloscopía BAAR' },
  });

  return {
    ...calc,
    name: 'Tuberculosis: Esquema 2HRZE/4HR, PPD/IGRA y Diagnóstico Molecular (OMS / CDC)',
    shortName: 'Tuberculosis (OMS / CDC)',
    keywords: calc.keywords.filter(
      (k) => !['minsa', 'normativa 054', 'nicaragua', 'cndr', 'taes'].includes(k),
    ),
    description:
      'Herramienta clínica alineada a las directrices unificadas de la OMS y CDC/ATS/IDSA: dosificación del esquema 2HRZE/4HR con tabletas de Dosis Fija Combinada (DFC), interpretación de PPD/IGRA, terapia preventiva (3HP/1HP/3HR/6H), GeneXpert MTB/RIF y esquema BPaLM.',
    validatedPopulation:
      'Adultos, adolescentes y pacientes pediátricos ≥ 2 kg según directrices OMS y CDC/ATS/IDSA.',
    limitations: [
      'En la fase de continuación (4HR) se recomienda administración diaria con DFC bajo observación directa (DOT) o soporte digital; evitar pautas intermitentes en PVVIH o enfermedad cavitaria.',
      'La baciloscopía BAAR negativa NO excluye TB en niños (paucibacilar), PVVIH ni formas extrapulmonares; priorizar pruebas moleculares rápidas (GeneXpert MTB/RIF o Ultra) y cultivo.',
    ],
    version: 'OMS Directrices TB 2022–2024 · CDC / ATS / IDSA',
    references: calc.references.filter((r) => !r.citation.includes('MINSA')),
    fields,
    calculate: (inputs: CalculatorInputsState) => {
      const base = calc.calculate(inputs);
      const replaceClean = (text: string): string =>
        text
          .replace(/Normativa 054 MINSA Nicaragua/g, 'Directrices OMS / CDC')
          .replace(/Normativa 054 MINSA/g, 'Directrices OMS / CDC')
          .replace(/Esquema Primario MINSA 2HRZE \/ 4HR/g, 'Esquema estándar OMS 2HRZE / 4HR')
          .replace(/Esquema Primario MINSA:/g, 'Esquema estándar OMS:')
          .replace(/DFC \/ TAES MINSA/g, 'DFC / DOT OMS')
          .replace(/estrategia TAES estricta/g, 'observación directa (DOT)')
          .replace(/estrategia TAES/g, 'observación directa (DOT)')
          .replace(/bajo TAES/g, 'bajo DOT')
          .replace(/\(Normativa 054 MINSA\)/g, '(OMS)')
          .replace(/Control de focos MINSA \(< 72 horas\)/g, 'Estudio de contactos (< 72 horas)')
          .replace(/Control bacteriológico y de focos MINSA/g, 'Control bacteriológico y estudio de contactos OMS')
          .replace(/Quimioprofilaxis MINSA \(TPI\) y opciones acortadas OMS/g, 'Terapia preventiva TB (TPT: 3HP / 1HP / 3HR / 6H)')
          .replace(/Población prioritaria de quimioprofilaxis en Nicaragua \(MINSA\)/g, 'Población prioritaria para TPT (OMS / CDC)')
          .replace(/Muestreo bacteriológico y molecular MINSA/g, 'Muestreo bacteriológico y molecular (OMS)')
          .replace(/en Nicaragua \(MINSA\)/g, 'en grupos prioritarios')
          .replace(/\(esquema PAI Nicaragua\)/g, '(esquema infantil)')
          .replace(/grupos prioritarios del MINSA\/CNDR/g, 'todo caso sospechoso según OMS')
          .replace(/al componente nacional de TB-DR \(MINSA\/CNDR\)/g, 'al programa especializado de TB-DR')
          .replace(/comité clínico nacional\/CNDR/g, 'comité clínico de TB-DR')
          .replace(/\(CNDR \/ red MINSA\)/g, '(OMS / red de referencia)')
          .replace(/SR captado \(Normativa 054 MINSA\) — indicar BAAR × 3 \/ GeneXpert/g, 'Sospecha clínica de TB — indicar GeneXpert MTB/RIF / BAAR')
          .replace(/PROTOCOLO DE SERIADO BAAR × 3 \(MINSA Nicaragua\)/g, 'PROTOCOLO DE MUESTRAS RESPIRATORIAS (OMS / CDC)')
          .replace(/al captar al SR/g, 'en la evaluación inicial')
          .replace(/Evaluación diagnóstica según Normativa 054 MINSA/g, 'Evaluación diagnóstica TB según OMS / CDC')
          .replace(/MINSA/g, 'OMS');

      return {
        ...base,
        primaryResult: {
          ...base.primaryResult,
          label: replaceClean(base.primaryResult.label),
          formattedValue: replaceClean(base.primaryResult.formattedValue),
          unit: replaceClean(base.primaryResult.unit),
        },
        secondaryResults: base.secondaryResults?.map((r) => ({
          ...r,
          label: replaceClean(r.label),
          formattedValue: replaceClean(r.formattedValue),
          unit: replaceClean(r.unit),
          note: r.note ? replaceClean(r.note) : undefined,
        })),
        riskClassification: replaceClean(base.riskClassification),
        clinicalInterpretation: replaceClean(base.clinicalInterpretation),
        guidance: base.guidance?.map(replaceClean),
        formulaUsed: replaceClean(base.formulaUsed),
      };
    },
  };
}

function resolveMalariaLeptospirosisInternational(
  calc: CalculatorDefinition,
): CalculatorDefinition {
  const weightField = calc.fields.find((f): f is NumberFieldDef => f.id === 'weightKg');
  const fields = patchFields(calc.fields, {
    protocolMode: {
      label: 'Patología y escenario clínico (OMS / OPS / CDC)',
      optionLabels: {
        malaria_vivax: 'Malaria por Plasmodium vivax (Cloroquina + Primaquina 14 días OMS)',
        malaria_falciparum_sensible:
          'Malaria por P. falciparum sensible a cloroquina (Mesoamérica / Haití)',
        malaria_falciparum_resistente:
          'Malaria por P. falciparum (ACT 1.ª línea OMS: Arteméter + Lumefantrina)',
        leptospirosis_leve: 'Leptospirosis leve / ambulatoria o sospecha temprana (< 5 días)',
        leptospirosis_grave: 'Leptospirosis moderada-grave / hospitalaria (Síndrome de Weil)',
      },
    },
  });

  return {
    ...calc,
    name: 'Malaria y Leptospirosis: Esquemas Terapéuticos (OMS / OPS / CDC)',
    shortName: 'Malaria y Leptospirosis (OMS)',
    keywords: calc.keywords.filter((k) => !['minsa', 'nicaragua', 'col-vol'].includes(k)),
    description:
      'Calculadora clínica y posológica según directrices internacionales (OMS, OPS y CDC) para Malaria (Plasmodium vivax, P. falciparum) y Leptospirosis (leve, embarazo, pediatría y Síndrome de Weil).',
    clinicalIndication:
      'Prescripción rápida por peso y grupo etario/gestacional en atención primaria, consulta externa, urgencias y hospitalización.',
    validatedPopulation:
      'Población pediátrica, gestantes/puérperas y adultos según directrices OMS / OPS y CDC.',
    version: 'WHO Guidelines for Malaria 2023–2024 · WHO / CDC Leptospirosis',
    references: [
      ...calc.references.filter((r) => !r.citation.includes('MINSA')),
      {
        citation:
          'World Health Organization (WHO). WHO Guidelines for malaria (updated 2023–2024). Geneva: WHO; 2024.',
        year: 2024,
      },
      {
        citation:
          'World Health Organization (WHO) & International Leptospirosis Society. Human leptospirosis: guidance for diagnosis, surveillance and control; CDC Yellow Book: Leptospirosis. 2024.',
        year: 2024,
      },
    ],
    fields,
    calculate: (inputs: CalculatorInputsState) => {
      const errors = validateCalculatorInputs(calc, inputs);
      if (errors.length > 0) {
        throw new Error(errors.map((e) => e.message).join(' '));
      }

      const mode = String(inputs.protocolMode ?? 'malaria_vivax');
      const weightKg = weightField
        ? roundClinical(
            getCanonicalNumberValue(weightField, inputs.weightKg as NumberInputValue).canonicalValue!,
            1,
          )
        : 60;
      const group = String(inputs.patientGroup ?? 'adult_adolescent');
      const doxyContraindicated = Boolean(inputs.doxyContraindicated);
      const penicillinAllergy = Boolean(inputs.penicillinAllergy);
      const isPregnantOrInfantLt6m = group === 'pregnant_lactating' || group === 'infant_lt6m';

      if (mode === 'malaria_vivax' || mode === 'malaria_falciparum_sensible') {
        const isVivax = mode === 'malaria_vivax';
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
              ? 'Embarazo/lactancia: PROHIBIDA la Primaquina (riesgo de hemólisis fetal/neonatal). Administrar solo Cloroquina en 3 días; en P. vivax la OMS recomienda quimioprofilaxis semanal con Cloroquina 300 mg base hasta finalizar embarazo y lactancia (< 6 meses) antes de cura radical.'
              : 'Lactante < 6 meses: CONTRAINDICADA la Primaquina por inmadurez enzimática y riesgo hemolítico. Administrar únicamente Cloroquina ajustada a peso y diferir Primaquina hasta ≥ 6 meses.';
          guidance.push(pqNote);
        } else if (isVivax) {
          // WHO standard 14-day radical cure: 0.25 mg/kg/day x 14 days (cap 15 mg/day; 0.5 mg/kg/d in high-relapse regions)
          const pqDaily = Math.min(15, roundClinical(weightKg * 0.25, 1));
          const pqTotal = roundClinical(pqDaily * 14, 0);
          pqPrimary = `${formatClinicalNumber(cqTotal, 0)} mg CQ + ${formatClinicalNumber(pqDaily, 1)} mg/d PQ × 14 d`;
          pqNote = `Primaquina estándar OMS (cura radical 14 días): ${formatClinicalNumber(pqDaily, 1)} mg/día VO × 14 días (0.25 mg/kg/día; máx 15 mg/d · total ${pqTotal} mg; usar 0.5 mg/kg/d × 14 d en cepas tropicales/Oceanía de alta recaída tras tamizaje G6PD).`;
          guidance.push(pqNote);
        } else {
          // WHO single low-dose gametocytocidal Primaquine: 0.25 mg/kg single dose (max 15 mg)
          const pqSingle = Math.min(15, roundClinical(weightKg * 0.25, 1));
          pqPrimary = `${formatClinicalNumber(cqTotal, 0)} mg CQ + ${formatClinicalNumber(pqSingle, 1)} mg PQ DU`;
          pqNote = `Primaquina gametocida dosis baja OMS (Día 1): ${formatClinicalNumber(pqSingle, 1)} mg VO dosis única (0.25 mg/kg, máx 15 mg; segura sin prueba previa de G6PD en áreas de baja transmisión). Nota: Cloroquina solo en Mesoamérica/Haití sin resistencia; en el resto del mundo usar ACT.`;
          guidance.push(pqNote);
        }

        guidance.push(
          `Cloroquina base (25 mg/kg en 3 días; tabletas de 150 mg base): Día 1 = ${cqD1} mg (${tabsD1} tab) · Día 2 = ${cqD2} mg (${tabsD1} tab) · Día 3 = ${cqD3} mg (${tabsD3} tab) → Total ${cqTotal} mg base.`,
          'Tomar después de alimentos; si vomita en los primeros 30 min, repetir dosis completa. Cuando esté disponible, realizar tamizaje de G6PD antes de Primaquina diaria.',
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
            label: isVivax ? 'Primaquina estándar OMS (14 días)' : 'Primaquina gametocida OMS (0.25 mg/kg)',
            formattedValue: isPregnantOrInfantLt6m ? 'CONTRAINDICADA' : pqPrimary.split('+ ')[1] ?? '',
            unit: isPregnantOrInfantLt6m ? 'Diferir posparto / ≥ 6 m' : '',
          },
        ];

        return {
          primaryResult: {
            label: isVivax ? 'Esquema Malaria P. vivax (OMS)' : 'Esquema P. falciparum sensible (OMS)',
            value: cqTotal,
            formattedValue: isPregnantOrInfantLt6m ? `${cqTotal} mg CQ (sin PQ)` : pqPrimary,
            unit: isPregnantOrInfantLt6m ? 'Primaquina bloqueada' : 'Total 3 d CQ',
          },
          secondaryResults,
          severity,
          riskClassification: isPregnantOrInfantLt6m
            ? 'Pauta segura en embarazo/lactancia o < 6 m (Sin Primaquina)'
            : isVivax
              ? 'Tratamiento estándar OMS P. vivax (3 d CQ + 14 d PQ)'
              : 'Tratamiento P. falciparum sensible (3 d CQ + PQ 0.25 mg/kg DU)',
          clinicalInterpretation: `Paciente de ${formatClinicalNumber(weightKg, 1)} kg con ${isVivax ? 'Malaria por Plasmodium vivax' : 'Malaria por Plasmodium falciparum sensible'}. ${pqNote}`,
          guidance,
          formulaUsed:
            'OMS Malaria Guidelines: Cloroquina 25 mg/kg (10/10/5 mg/kg) + Primaquina 0.25 mg/kg/d × 14 d (vivax) o 0.25 mg/kg DU (falciparum)',
          inputsSummary: `Modo=${mode}, Peso=${formatClinicalNumber(weightKg, 1)} kg, Grupo=${group}`,
        };
      }

      if (mode === 'malaria_falciparum_resistente') {
        const base = calc.calculate(inputs);
        const pqSingle = Math.min(15, roundClinical(weightKg * 0.25, 1));
        return {
          ...base,
          secondaryResults: base.secondaryResults?.map((r) => ({
            ...r,
            label: r.label.replace('OMS / MINSA', 'OMS'),
          })),
          guidance: [
            ...(base.guidance ?? []),
            isPregnantOrInfantLt6m
              ? 'En embarazo (incl. 1.er trimestre según OMS 2022–2024) y lactantes < 6 meses, usar Arteméter-Lumefantrina SIN Primaquina.'
              : `En áreas de baja transmisión o eliminación, la OMS sugiere añadir Primaquina dosis única baja 0.25 mg/kg (${formatClinicalNumber(pqSingle, 1)} mg VO, máx 15 mg) el Día 1 para bloquear transmisión.`,
          ],
          formulaUsed:
            'Bandas OMS Coartem (20/120 mg): 5–14.9 kg (1 tab), 15–24.9 kg (2 tab), 25–34.9 kg (3 tab), ≥ 35 kg (4 tab) × 6 dosis',
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
        let detailNote =
          'Adultos y ≥ 8–10 años sin embarazo/alergia (OMS / CDC / IDSA): Doxiciclina 100 mg VO cada 12 horas por 7 días (alternativas: Amoxicilina 500 mg c/8 h × 7 d o Azitromicina 500 mg/día × 3 d).';

        if (useAmoxicillin) {
          if (group === 'pediatric_ge6m' || group === 'infant_lt6m') {
            dailyDoseMg = Math.min(1500, roundClinical(weightKg * 30, 0));
            const doseQ8h = roundClinical(dailyDoseMg / 3, 0);
            drugSummary = `Amoxicilina ${doseQ8h} mg VO c/8 h × 7 d`;
            detailNote = `Niño (< 8–10 años, OMS/IDSA): Amoxicilina ${dailyDoseMg} mg/día (30–50 mg/kg/día) dividida cada 8 h (${doseQ8h} mg c/8 h) × 7 días (alternativa: Azitromicina 10 mg/kg Día 1, luego 5 mg/kg/día Días 2–3).`;
          } else {
            dailyDoseMg = 1500;
            drugSummary = 'Amoxicilina 500 mg VO c/8 h × 7 días';
            detailNote =
              group === 'pregnant_lactating'
                ? 'Embarazo/lactancia (Doxiciclina contraindicada): Amoxicilina 500 mg VO cada 8 h × 7 días (alternativa Azitromicina 500 mg VO c/24 h × 3 días si alergia a penicilina).'
                : 'Intolerancia/contraindicación a Doxiciclina: Amoxicilina 500 mg VO cada 8 h × 7 días (o Azitromicina 500 mg VO c/24 h × 3 días si alergia a betalactámicos).';
          }
        }

        return {
          primaryResult: {
            label: 'Antibioticoterapia Leptospirosis Leve (OMS / CDC)',
            value: dailyDoseMg,
            formattedValue: drugSummary,
            unit: '× 7 días',
          },
          secondaryResults: [
            {
              label: 'Ventana ideal de inicio',
              formattedValue: 'De inmediato (< 5 días del inicio)',
              unit: 'No esperar ELISA/MAT',
            },
            {
              label: 'Profilaxis corta de exposición (CDC)',
              formattedValue: 'Doxiciclina 200 mg VO 1 vez/semana',
              unit: '(solo alto riesgo puntual, ≥ 8 a no gestantes)',
            },
          ],
          severity: 'moderate',
          riskClassification: 'Leptospirosis leve / fase anictérica ambulatoria (OMS / CDC)',
          clinicalInterpretation: detailNote,
          guidance: [
            detailNote,
            'Iniciar antibiótico ante la sospecha clínica y nexo epidemiológico (agua estancada, inundaciones, lodo, roedores) sin esperar confirmación serológica.',
            'Signos de alarma para ingreso hospitalario inmediato: ictericia, oliguria/anuria, hemoptisis o disnea (hemorragia alveolar), hipotensión, dolor abdominal intenso o alteración mental.',
            'Seguimiento clínico en las primeras 48–72 h; evitar AINEs y AAS por riesgo hemorrágico y nefrotoxicidad.',
          ],
          formulaUsed:
            'OMS / CDC / IDSA Leptospirosis leve: Doxiciclina 100 mg c/12 h (adultos), Amoxicilina 500 mg c/8 h (embarazo) o 30–50 mg/kg/d (pediatría) × 7 días',
          inputsSummary: `Modo=Leptospirosis leve, Peso=${formatClinicalNumber(weightKg, 1)} kg, Grupo=${group}, ContraindDoxi=${doxyContraindicated ? 'Sí' : 'No'}`,
        };
      }

      // leptospirosis_grave (WHO / CDC / IDSA)
      const base = calc.calculate(inputs);
      return {
        ...base,
        primaryResult: {
          ...base.primaryResult,
          label: 'Esquema Hospitalario Leptospirosis Grave (OMS / CDC)',
        },
        clinicalInterpretation: base.clinicalInterpretation
          .replace('(MINSA):', '(OMS / CDC):')
          .replace(
            '× 7 días (alternativa Ceftriaxona 1–2 g IV c/24 h).',
            'o Ceftriaxona 1–2 g IV c/24 h (o Cefotaxima 1 g IV c/6 h) × 7 días con eficacia clínica equivalente.',
          ),
        guidance: base.guidance?.map((g) =>
          g
            .replace('(MINSA):', '(OMS / CDC):')
            .replace('según norma MINSA', 'según protocolo hospitalario / OMS')
            .replace(
              '× 7 días (alternativa Ceftriaxona 1–2 g IV c/24 h).',
              'o Ceftriaxona 1–2 g IV c/24 h (o Cefotaxima 1 g IV c/6 h) × 7 días.',
            ),
        ),
        formulaUsed:
          'OMS / CDC Leptospirosis grave: Penicilina G cristalina 1.5–4 M UI IV c/4–6 h o Ceftriaxona 1–2 g IV c/24 h (niños: Penicilina G 250,000 UI/kg/d o Ceftriaxona 50–80 mg/kg/d IV)',
      };
    },
  };
}

const WHO_IMMUNIZATION_SCHEDULE: Record<
  string,
  {
    title: string;
    vaccinesCount: number;
    vaccinesSummary: string;
    severity: SeverityLevel;
    details: string[];
    routeAndSite: string;
    alerts: string[];
  }
> = {
  rn: {
    title: 'Recién nacido (< 24 h)',
    vaccinesCount: 2,
    vaccinesSummary: 'BCG (zonas endémicas) + Hepatitis B dosis al nacer',
    severity: 'info',
    details: [
      'Hepatitis B dosis al nacer (OMS): 0.5 mL IM dentro de las primeras 24 horas de vida en TODOS los recién nacidos para prevenir transmisión vertical.',
      'BCG (dosis única): recomendada por OMS en países/contextos de alta incidencia de TB (aplicar si peso ≥ 2,000 g).',
    ],
    routeAndSite: 'BCG intradérmica (deltoides); Hepatitis B IM profunda (muslo anterolateral).',
    alerts: [
      'Si el recién nacido pesa < 2,000 g: diferir BCG hasta alcanzar ≥ 2,000 g; mantener Hepatitis B (< 24 h; añadir HBIG < 12 h si madre HBsAg+).',
    ],
  },
  '2_meses': {
    title: '2 meses de edad (1.ª serie primaria OMS)',
    vaccinesCount: 4,
    vaccinesSummary: 'DTP-HepB-Hib 1 · PCV 1 · Polio (IPV/OPV) 1 · Rotavirus 1',
    severity: 'info',
    details: [
      'DTP-HepB-Hib (Pentavalente o Hexavalente): 1.ª dosis IM (en países con esquema EPI 6–10–14 sem inicia a las 6 semanas).',
      'PCV (Neumococo conjugada 10v/13v/15v/20v): 1.ª dosis IM.',
      'Polio (IPV / bOPV según transición global OMS): 1.ª dosis (mínimo 2 dosis de IPV en el esquema infantil OMS).',
      'Rotavirus: 1.ª dosis oral (aplicar preferentemente antes de las 15 semanas de vida).',
    ],
    routeAndSite: 'Inyectables IM en muslos separados (≥ 2.5 cm); Rotavirus vía oral.',
    alerts: [
      'No iniciar Rotavirus si hay antecedente de invaginación intestinal o IDCG; respetar límite operativo de 15 semanas para 1.ª dosis.',
    ],
  },
  '4_meses': {
    title: '4 meses de edad (2.ª serie primaria OMS)',
    vaccinesCount: 4,
    vaccinesSummary: 'DTP-HepB-Hib 2 · PCV 2 · Polio 2 · Rotavirus 2',
    severity: 'info',
    details: [
      'DTP-HepB-Hib 2.ª dosis IM.',
      'PCV (Neumococo conjugada) 2.ª dosis IM.',
      'Polio 2.ª dosis (IPV o bOPV según pauta nacional).',
      'Rotavirus 2.ª dosis oral (completar serie antes de los 8 meses de vida).',
    ],
    routeAndSite: 'Intervalo mínimo de 4 semanas respecto a la 1.ª serie.',
    alerts: [
      'Si se usa esquema OMS de 2 dosis primarias + refuerzo (2p+1) para PCV, la 3.ª dosis pasa a los 9–15 meses.',
    ],
  },
  '6_meses': {
    title: '6 meses de edad (3.ª serie primaria OMS)',
    vaccinesCount: 4,
    vaccinesSummary: 'DTP-HepB-Hib 3 · PCV 3 · Polio 3 · Influenza (≥ 6 m)',
    severity: 'info',
    details: [
      'DTP-HepB-Hib 3.ª dosis IM.',
      'PCV 3.ª dosis (en esquemas 3p+0) o completar serie según calendario local.',
      'Polio 3.ª dosis (bOPV / IPV).',
      'Influenza estacional: elegible desde los 6 meses (2 dosis separadas por 4 semanas en primovacunación).',
    ],
    routeAndSite: 'Muslos separados IM; polio oral/IM según presentación.',
    alerts: [
      'Asegurar al menos 2 dosis de IPV en todo esquema infantil según recomendación OMS 2022–2024.',
    ],
  },
  '12_meses': {
    title: '9 – 15 meses (1 año · OMS)',
    vaccinesCount: 2,
    vaccinesSummary: 'SRP / MMR 1.ª dosis (MCV1) + Refuerzo PCV',
    severity: 'info',
    details: [
      'SRP / MMR (Sarampión, Rubéola, Parotiditis — MCV1): 1.ª dosis a los 9–12 meses (12 meses en zonas sin transmisión endémica intensa).',
      'PCV (Neumococo conjugada): dosis de refuerzo en esquema 2p+1 (9–15 meses).',
      'Considerar Varicela / Hepatitis A / Fiebre Amarilla según endemicidad regional.',
    ],
    routeAndSite: 'SRP subcutánea o IM según fabricante; PCV IM.',
    alerts: [
      'SRP contiene virus vivos atenuados: contraindicada en inmunosupresión grave o embarazo.',
    ],
  },
  '18_meses': {
    title: '15 – 18 meses (Refuerzos OMS)',
    vaccinesCount: 3,
    vaccinesSummary: 'DTP/DTaP refuerzo · Polio refuerzo · SRP 2.ª dosis (MCV2)',
    severity: 'info',
    details: [
      'DTP / DTaP (1.er refuerzo): 1 dosis IM entre los 12–23 meses.',
      'SRP / MMR 2.ª dosis (MCV2): OMS recomienda 2.ª dosis a los 15–18 meses para asegurar ≥ 95 % de inmunidad.',
      'Polio (IPV / bOPV) dosis de refuerzo según calendario nacional.',
    ],
    routeAndSite: 'DTP IM; SRP SC/IM.',
    alerts: [
      'Si hubo reacción anafiláctica o encefalopatía en los 7 días previos tras DTP, omitir componente pertussis.',
    ],
  },
  '6_anios': {
    title: '4 – 7 años (Refuerzo preescolar/escolar OMS)',
    vaccinesCount: 2,
    vaccinesSummary: 'DTaP/DTP (2.º refuerzo) + Polio refuerzo (y MCV2 si pendiente)',
    severity: 'info',
    details: [
      'DTaP / DTP refuerzo preescolar/escolar (4–7 años): refuerza inmunidad contra difteria, tétanos y tos ferina.',
      'Polio refuerzo y verificación de 2 dosis documentadas de SRP/MMR.',
    ],
    routeAndSite: 'Intramuscular en región deltoidea.',
    alerts: [
      'En ≥ 7 años usar formulaciones con dosis reducida de toxoide diftérico y pertussis (Tdap o Td).',
    ],
  },
  adolescente_vph: {
    title: '9 – 14 años (VPH + Tdap/Td OMS)',
    vaccinesCount: 2,
    vaccinesSummary: 'VPH (1 o 2 dosis OMS) + Refuerzo Tdap / Td',
    severity: 'info',
    details: [
      'Vacuna contra VPH (OMS 2022–2024): pauta alternativa de 1 dosis única o esquema estándar de 2 dosis (0 y 6 meses) en niñas/adolescentes de 9–14 años.',
      'Tdap / Td (dosis adolescente 9–15 años): refuerzo contra tétanos, difteria y tos ferina.',
    ],
    routeAndSite: 'IM en deltoides (observar 15 min por síncope vasovagal en adolescentes).',
    alerts: [
      'En personas inmunocomprometidas (incl. VIH) o ≥ 15–20 años, la OMS recomienda al menos 2 dosis (3 dosis en inmunocompromiso).',
    ],
  },
  embarazada: {
    title: 'Embarazada (OMS / ACOG / CDC)',
    vaccinesCount: 3,
    vaccinesSummary: 'Tdap (27–36 SG) + Influenza estacional + COVID-19/VRS según guía',
    severity: 'moderate',
    details: [
      'Tdap (dTpa): 1 dosis IM entre las 27–36 semanas de CADA embarazo para transferir anticuerpos contra tos ferina al recién nacido (si sin esquema previo de tétanos, completar serie Td/TT).',
      'Influenza estacional inactivada: 1 dosis IM en cualquier trimestre del embarazo.',
      'Valorar vacuna VRS materna (RSVpreF a las 32–36 SG) y COVID-19 según disponibilidad y temporada.',
    ],
    routeAndSite: 'Intramuscular en deltoides.',
    alerts: [
      'CONTRAINDICADAS vacunas de virus vivos (SRP/MMR, Varicela, Fiebre Amarilla salvo alto riesgo) durante el embarazo.',
    ],
  },
  adulto_riesgo: {
    title: 'Adulto / ≥ 60–65 años o con comorbilidades (OMS / CDC)',
    vaccinesCount: 3,
    vaccinesSummary: 'Influenza anual + Neumococo (PCV20 / PPSV23) + Td/Tdap c/10 a',
    severity: 'info',
    details: [
      'Influenza estacional: 1 dosis IM anual (prioritaria en ≥ 60–65 años, embarazadas, crónicos y personal de salud).',
      'Neumococo en adultos ≥ 60–65 años o alto riesgo: PCV20 dosis única (o PCV15 seguido de PPSV23, o PPSV23 según disponibilidad nacional).',
      'Td o Tdap: refuerzo cada 10 años; Hepatitis B en adultos no inmunes con factores de riesgo.',
    ],
    routeAndSite: 'Intramuscular profunda en deltoides.',
    alerts: [
      'En adultos con VIH (CD4 < 200) o inmunosupresión evitar vacunas vivas atenuadas.',
    ],
  },
};

function resolveImmunizationInternational(calc: CalculatorDefinition): CalculatorDefinition {
  const newbornWeightField = calc.fields.find((f): f is NumberFieldDef => f.id === 'newbornWeightG');
  const infantAgeWeeksField = calc.fields.find((f): f is NumberFieldDef => f.id === 'infantAgeWeeks');
  const fields = patchFields(calc.fields, {
    mode: {
      label: 'Módulo de inmunización y profilaxis (OMS / CDC)',
      optionLabels: {
        esquema_edad: 'Calendario de Inmunizaciones Rutinarias OMS (EPI) por edad / grupo',
      },
    },
    ageGroup: { label: 'Edad o grupo poblacional (Recomendaciones OMS)' },
    newbornWeightG: {
      helpText: 'Recomendación OMS: aplicar BCG (en zonas endémicas) si peso ≥ 2,000 g; si < 2,000 g diferir BCG y mantener Hepatitis B al nacer.',
    },
    rabiesCategory: { label: 'Categoría de exposición al animal (OMS)' },
  });

  return {
    ...calc,
    name: 'Inmunizaciones (Calendario OMS / PAI) y Profilaxis Tétanos / Rabia',
    shortName: 'Vacunas OMS + Tétanos/Rabia',
    keywords: calc.keywords.filter((k) => !['minsa', 'nicaragua'].includes(k)),
    description:
      'Referencia clínica del calendario de inmunizaciones rutinarias de la OMS (EPI/PAI) por edad y grupo de riesgo, más calculadora de profilaxis antitetánica en heridas y post-exposición antirrábica (OMS / CDC).',
    validatedPopulation:
      'Población pediátrica, adolescente, embarazada y adulta según recomendaciones globales de la OMS y CDC.',
    version: 'WHO Routine Immunization Recommendations (2023–2024) · WHO Tetanus & Rabies',
    references: [
      ...calc.references.filter((r) => !r.citation.includes('MINSA')),
      {
        citation:
          'World Health Organization (WHO). Summary of WHO Position Papers — Recommendations for Routine Immunization. Geneva: WHO; 2024.',
        year: 2024,
      },
    ],
    fields,
    calculate: (inputs: CalculatorInputsState) => {
      const errors = validateCalculatorInputs(calc, inputs);
      if (errors.length > 0) {
        throw new Error(errors[0].message);
      }

      const mode = String(inputs.mode);
      if (mode === 'esquema_edad') {
        const ageGroup = String(inputs.ageGroup);
        const entry = WHO_IMMUNIZATION_SCHEDULE[ageGroup];
        const guidance = [
          ...entry.details,
          `Vía y sitio: ${entry.routeAndSite}`,
          ...entry.alerts,
        ];
        let severity: SeverityLevel = entry.severity;
        let statusSummary = entry.vaccinesSummary;

        if (ageGroup === 'rn' && newbornWeightField) {
          const weightG = getCanonicalNumberValue(
            newbornWeightField,
            inputs.newbornWeightG as NumberInputValue,
          ).canonicalValue;
          if (weightG !== null && weightG < 2000) {
            severity = 'high';
            statusSummary = 'DIFERIR BCG (< 2,000 g) · Aplicar Hepatitis B RN';
            guidance.unshift(
              `ALERTA PESO (${roundClinical(weightG, 0)} g < 2,000 g): Diferir BCG hasta alcanzar ≥ 2,000 g (OMS). Mantener dosis de Hepatitis B al nacer (< 24 h).`,
            );
          }
        }

        if (
          (ageGroup === '2_meses' || ageGroup === '4_meses' || ageGroup === '6_meses') &&
          infantAgeWeeksField
        ) {
          const ageW = getCanonicalNumberValue(
            infantAgeWeeksField,
            inputs.infantAgeWeeks as NumberInputValue,
          ).canonicalValue;
          if (ageW !== null && ageGroup === '2_meses' && ageW > 15 && ageW < 32) {
            severity = 'moderate';
            guidance.unshift(
              `ALERTA ROTAVIRUS (${ageW} semanas > 15 sem): Muchas guías nacionales/CDC recomiendan no iniciar Rotavirus > 15 sem (la OMS permite valorar beneficio/riesgo en alta mortalidad infantil < 24 m).`,
            );
          } else if (ageW !== null && ageW >= 32) {
            severity = 'moderate';
            guidance.unshift(
              `ALERTA ROTAVIRUS (${ageW} semanas ≥ 32 sem / ~8 meses): Según límite estándar CDC/OPS, no administrar Rotavirus después de los 8 meses de vida.`,
            );
          }
        }

        return {
          primaryResult: {
            label: `Esquema OMS — ${entry.title}`,
            value: entry.vaccinesCount,
            formattedValue: statusSummary,
            unit: '',
          },
          secondaryResults: [
            {
              label: 'Biológicos recomendados en la etapa',
              formattedValue: String(entry.vaccinesCount),
              unit: 'vacunas',
            },
            {
              label: 'Vía / administración',
              formattedValue: entry.routeAndSite,
              unit: '',
            },
          ],
          severity,
          riskClassification: `Recomendaciones OMS de Inmunización Rutinaria · ${entry.title}`,
          clinicalInterpretation: entry.details.join(' '),
          guidance,
          guidanceDisclaimer:
            'Adaptar siempre el intervalo y marcas disponibles al calendario nacional vigente del país donde ejerces.',
          formulaUsed: 'Recomendaciones Globales de Inmunización Rutinaria — OMS (WHO Position Papers)',
          inputsSummary: `Grupo: ${entry.title}`,
        };
      }

      const base = calc.calculate(inputs);
      return {
        ...base,
        guidance: base.guidance?.map((g) =>
          g
            .replace('esquema completo de 5 dosis MINSA (0, 1 mes, 6 meses, 1 año, 1 año)', 'serie primaria completa de 3 dosis (OMS / CDC)')
            .replace('esquema Essen 4–5 dosis: días 0, 3, 7, 14 [y 28] o esquema normado vigente MINSA', 'esquema Essen 4–5 dosis: días 0, 3, 7, 14 [y 28], o pauta intradérmica OMS de 1 semana'),
        ),
        formulaUsed: base.formulaUsed.replace('OMS / CDC / MINSA', 'OMS / CDC').replace('OMS / MINSA', 'OMS / CDC'),
      };
    },
  };
}

export function resolveCalculatorForGuideline(
  calc: CalculatorDefinition,
  scope: GuidelineScope,
): CalculatorDefinition {
  if (scope === 'nicaragua') {
    if (calc.id === 'obstetric-mgso4') {
      return resolveMgso4ForScope(calc, 'nicaragua');
    }
    return calc;
  }

  switch (calc.id) {
    case 'dengue-oms':
      return resolveDengueInternational(calc);
    case 'obstetric-mgso4':
      return resolveMgso4ForScope(calc, 'international');
    case 'preeclampsia-hellp':
      return resolvePreeclampsiaInternational(calc);
    case 'hiv-cdc-cd4-prophylaxis':
      return resolveHivCd4International(calc);
    case 'hiv-pep-prep':
      return resolveHivPepPrepInternational(calc);
    case 'hiv-opportunistic-art-timing':
      return resolveHivArtTimingInternational(calc);
    case 'tuberculosis-clinical-suite':
      return resolveTuberculosisInternational(calc);
    case 'malaria-leptospirosis-minsa':
      return resolveMalariaLeptospirosisInternational(calc);
    case 'immunization-minsa-nicaragua':
      return resolveImmunizationInternational(calc);
    default:
      return calc;
  }
}

export function resolveTableForGuideline(
  table: ClinicalReferenceTable,
  scope: GuidelineScope,
): ClinicalReferenceTable {
  if (scope === 'nicaragua' || !DUAL_TABLE_IDS.has(table.id)) {
    return table;
  }

  switch (table.id) {
    case 'preeclampsia-acog-table':
      return {
        ...table,
        title: 'Trastornos Hipertensivos del Embarazo, Preeclampsia y Manejo MgSO₄ (ACOG / ISSHP / OMS)',
        shortTitle: 'Preeclampsia y Crisis Obstétrica (ACOG / OMS)',
        guidelineVersion: 'ACOG PB 222 · ISSHP 2022 · OMS',
        summary:
          'Criterios diagnósticos exactos desde las 20 semanas de gestación, esquema Zuspan estándar (4 g carga + 1–2 g/h en bomba 20 g/500 mL) y antihipertensivos de primera línea en emergencia obstétrica.',
        rows: table.rows.map((row, idx) => {
          if (idx !== 2) return row;
          return [
            row[0],
            row[1],
            '1) MgSO₄ Zuspan (OMS / ACOG): carga 4 g IV (o 6 g Sibai) en 100 mL SS 0.9 %/RL en 15–20 min + mantenimiento 1–2 g/h (ej. 20 g en 500 mL a 25–50 mL/h). 2) Si PA ≥ 160/110: Labetalol IV (20 mg inicial), Hidralazina 5 mg IV o Nifedipino liberación inmediata 10 mg VÍA ORAL (NUNCA sublingual). 3) Finalizar ≥ 34 0/7 SG tras estabilización.',
          ];
        }),
        keyManagementPearls: [
          'Durante la infusión de MgSO₄ vigilar cada hora reflejos rotulianos presentes, FR ≥ 12–16 rpm y diuresis ≥ 30 mL/h (en 4 h previas). Antídoto: Gluconato de calcio al 10 % 10 mL (1 g) IV lento en 3–5 min. Mantener MgSO₄ hasta 24 h posparto o última convulsión.',
          table.keyManagementPearls[1],
        ],
        references: table.references.filter((r) => !r.citation.includes('MINSA')),
      };

    case 'dengue-paho-who-table':
      return {
        ...table,
        title: 'Dengue: Clasificación de Gravedad y Esquema de Líquidos (OPS / OMS)',
        shortTitle: 'Dengue: Grupos A, B y C (OPS / OMS)',
        guidelineVersion: 'OPS / OMS Directrices Dengue 2022',
        summary:
          'Criterios clínicos de triage y reposición hídrica exacta con cristaloides isotónicos para manejo ambulatorio (Grupo A), condición asociada (Grupo B1), signos de alarma (Grupo B2: 10 mL/kg/h) y choque/dengue grave (Grupo C: 10–20 mL/kg).',
        columns: ['Grupo OPS / OMS', 'Criterios clínicos exactos', 'Manejo de líquidos y vigilancia'],
        rows: [
          table.rows[0],
          [
            { text: 'Grupo B1 — Sin alarma pero con condición asociada o riesgo social', tone: 'low', emphasize: true },
            table.rows[1][1],
            'Observación o ingreso hospitalario: priorizar vía oral supervisada (SRO) o mantenimiento IV con cristaloide isotónico (Lactato de Ringer / SSN 0.9 %) si no tolera VO; vigilancia clínica cada 4 h.',
          ],
          [
            table.rows[2][0],
            table.rows[2][1],
            'Directrices OPS / OMS: Hospitalización inmediata y cristaloide isotónico (Lactato de Ringer o SSN 0.9 %) a 10 mL/kg en la 1.ª hora sobre peso ideal en sobrepeso/obesidad. Si mejora (diuresis ≥ 1 mL/kg/h), bajar gradualmente 5–7 → 3–5 → 2–3 mL/kg/h; si empeora repetir o pasar a Grupo C.',
          ],
          [
            table.rows[3][0],
            table.rows[3][1],
            'UCI / Reanimación: Bolo inicial de cristaloide isotónico a 20 mL/kg en 15–30 min si choque hipotensivo (o 10 mL/kg en 1 h si choque compensado) y descenso escalonado si mejora. Si persiste choque y CAE el Hto: sospechar hemorragia oculta y valorar transfusión de GR (o coloide si Hto elevado).',
          ],
        ],
        keyManagementPearls: [
          'OPS / OMS: calcular cargas IV con PESO IDEAL para la talla en sobrepeso/obesidad (peso real en bajo peso) y preferir Lactato de Ringer para evitar acidosis metabólica hiperclorémica por SSN 0.9 % prolongada.',
          table.keyManagementPearls[1],
        ],
        references: table.references.filter((r) => !r.citation.includes('MINSA')),
      };

    case 'hiv-art-regimens-interactions-table':
      return {
        ...table,
        title: 'Terapia Antirretroviral (TAR) de Primera Línea (OMS · DHHS), Embarazo e Interacciones',
        shortTitle: 'VIH: Esquemas TAR e Interacciones (OMS / DHHS)',
        guidelineVersion: 'NIH/DHHS 2024 · WHO Consolidated HIV Guidelines',
        summary:
          'Esquemas preferidos de inicio rápido (BIC/FTC/TAF, TDF/FTC + DTG y TDF/3TC/DTG), prevención materno-infantil, coinfección VHB/TB e interacciones críticas.',
        rows: [
          [
            { text: '1.ª Línea Universal (OMS · DHHS)', tone: 'normal', emphasize: true },
            'BIC 50 / FTC 200 / TAF 25 mg VO c/24 h · TDF/FTC + Dolutegravir (DTG) 50 mg VO c/24 h · o TLD OMS (TDF 300 / 3TC 300 / DTG 50 mg c/24 h)',
            table.rows[0][2],
          ],
          table.rows[1],
          [
            table.rows[2][0],
            'TDF/3TC/DTG (o TDF/FTC + DTG) c/24 h + 1 tableta adicional de Dolutegravir 50 mg a las 12 horas (= DTG 50 mg c/12 h) · Alternativa: TDF/FTC + EFV 600 mg/noche',
            table.rows[2][2],
          ],
          [
            { text: 'Embarazo y Transmisión Materno-Infantil (OMS / DHHS)', tone: 'low', emphasize: true },
            'Tamizaje VIH desde 1.er control prenatal + inicio inmediato de TAR triple con DTG (TDF/FTC + DTG o TDF/3TC/DTG) independiente de CD4 (alternativas: RAL 400 mg c/12 h o DRV/r)',
            'Valorar cesárea electiva a las 38 SG si ARN-VIH > 1,000 copias/mL cerca del parto y profilaxis ARV neonatal según estratificación de riesgo virológico; consejería de lactancia acorde a carga viral suprimida y guías locales.',
          ],
          table.rows[4],
        ],
        references: table.references.filter((r) => !r.citation.includes('MINSA')),
      };

    case 'hiv-pep-prep-prevention-table':
      return {
        ...table,
        title: 'Prevención de VIH: PEP (Post-Exposición ≤ 72 h CDC/OMS), PrEP y Seguimiento',
        shortTitle: 'VIH: PEP ≤ 72 h y PrEP (CDC / OMS)',
        guidelineVersion: 'CDC PEP 2025 · CDC PrEP 2021 · OMS',
        summary:
          'Criterios de urgencia en exposiciones biológicas o sexuales, esquema completo de PEP (28 días con TDF/FTC + DTG o BIC/FTC/TAF), seguimiento CDC 2025 (4–6 sem y 12 sem) y PrEP.',
        rows: [
          [
            { text: 'PEP — Profilaxis Post-Exposición (URGENCIA ≤ 72 h)', tone: 'critical', emphasize: true },
            table.rows[0][1],
            'Iniciar inmediatamente 3 fármacos × 28 DÍAS: BIC/FTC/TAF c/24 h, o TDF/FTC 300/200 mg (o TDF/3TC) VO c/24 h + Dolutegravir 50 mg VO c/24 h (alternativa RAL 400 mg c/12 h). Si ClCr < 60: evitar TDF (usar TAF/FTC + DTG).',
          ],
          [
            table.rows[1][0],
            table.rows[1][1],
            'NO requiere PEP por riesgo nulo de transmisión sexual (Indetectable = Intransmisible). Si existe duda sobre adherencia de la fuente, violencia sexual o exposición laboral punzocortante, valorar PEP por precaución.',
          ],
          [
            { text: 'Seguimiento Post-Exposición (CDC 2025 / OMS) y Otras Infecciones', tone: 'moderate', emphasize: true },
            table.rows[2][1],
            'Basal: prueba 4.ª gen VIH, HBsAg/anti-HBs, VHC, sífilis, creatinina/PFH, test embarazo. Control serológico VIH CDC 2025: 4–6 semanas y 12 semanas (3 meses) post-exposición (extender a 6 meses si exposición concomitante a VHC). En accidente laboral sin inmunidad VHB: vacuna + HBIG.',
          ],
          table.rows[3],
        ],
        keyManagementPearls: [
          'En Urgencias, la primera dosis de PEP NO debe retrasarse esperando resultados de laboratorio: administrar dentro de las primeras horas (ideal < 2 h).',
          table.keyManagementPearls[1],
        ],
        references: table.references.filter((r) => !r.citation.includes('MINSA')),
      };

    case 'tuberculosis-oms-cdc-reference-table':
      return {
        ...table,
        title: 'Tuberculosis (OMS · CDC / ATS / IDSA): Diagnóstico Molecular, 2HRZE/4HR, TPT y BPaLM',
        shortTitle: 'Tuberculosis: Diagnóstico, HRZE y BPaLM (OMS / CDC)',
        guidelineVersion: 'Directrices Unificadas OMS 2022–2024 · CDC / ATS / IDSA',
        summary:
          'Referencia clínica rápida offline alineada a la OMS y CDC: tamizaje sintomático, GeneXpert MTB/RIF / baciloscopía, bandas DFC 2HRZE/4HR bajo DOT, estudio de contactos (< 72 h) y terapia preventiva (TPT: 3HP, 1HP, 3HR, 6H).',
        columns: [
          'Componente / Escenario OMS',
          'Criterios, muestras o bandas de peso',
          'Conducta y notas clave de seguridad',
        ],
        rows: [
          [
            { text: 'Sospecha Clínica y Diagnóstico (GeneXpert MTB/RIF · BAAR)', tone: 'moderate', emphasize: true },
            'Tos ≥ 2–3 semanas, fiebre, sudoración nocturna o pérdida de peso (cualquier síntoma en PVVIH) · Prueba molecular rápida inicial recomendada por OMS: GeneXpert MTB/RIF o Xpert Ultra (+ cultivo y baciloscopía BAAR)',
            table.rows[0][2],
          ],
          [
            { text: 'Estudio de Contactos (< 72 h), PPD / IGRA y Terapia Preventiva (TPT)', tone: 'low', emphasize: true },
            'Estudio de contactos en < 72 h · PPD (48–72 h): ≥ 5 mm (PVVIH, contacto reciente, inmunosupresión), ≥ 10 mm (personal de salud, < 5 a, DM, ERC, área endémica), ≥ 15 mm (sin FR) · TPT OMS/CDC: 3HP (12 sem), 3HR (3 meses), 1HP o 6H (Isoniacida 6 meses)',
            'Población prioritaria TPT: contactos < 5 años de caso bacilífero y PVVIH. NUNCA iniciar TPT sin descartar TB activa por clínica y Rx de tórax. Preferir IGRA en vacunados con BCG.',
          ],
          [
            { text: 'Esquema Estándar Adulto (≥ 30 kg): 2HRZE / 4HR con DFC y DOT', tone: 'high', emphasize: true },
            table.rows[2][1],
            'Administración diaria con DFC bajo observación directa (DOT) o soporte digital. Piridoxina (B6) 25–50 mg/d si PVVIH, embarazo, DM, desnutrición, ERC o alcohol.',
          ],
          table.rows[3],
          [
            { text: 'TB Drogarresistente (RR / MDR-TB): BPaLM / Xpert XDR', tone: 'critical', emphasize: true },
            'Resistencia a Rifampicina en GeneXpert → notificación y prueba rápida a fluoroquinolonas (LPA / Xpert XDR) · Esquema oral OMS BPaLM 6 meses (Bedaquilina + Pretomanid + Linezolid + Moxifloxacino; BPaL si resistencia a FQ)',
            table.rows[4][2],
          ],
          table.rows[5],
        ],
        keyManagementPearls: [
          'Directrices OMS: priorizar pruebas moleculares rápidas (GeneXpert MTB/RIF o Ultra) para diagnóstico inicial simultáneo de TB y resistencia a rifampicina, junto con el estudio de contactos en < 72 horas.',
          table.keyManagementPearls[1],
        ],
        cautionNote:
          'Nunca añadir un único medicamento a un esquema que fracasa. Confirmar siempre sensibilidad a rifampicina/fluoroquinolonas ante recaídas o fracaso terapéutico.',
        references: table.references.filter((r) => !r.citation.includes('MINSA')),
      };

    case 'malaria-leptospirosis-minsa-table':
      return {
        ...table,
        title: 'Malaria (P. vivax / P. falciparum) y Leptospirosis: Esquemas Terapéuticos (OMS / OPS / CDC)',
        shortTitle: 'Malaria y Leptospirosis (OMS / CDC)',
        guidelineVersion: 'WHO Guidelines for Malaria 2024 · WHO / CDC Leptospirosis',
        summary:
          'Esquemas internacionales para Malaria (Cloroquina + Primaquina 14 d en P. vivax y ACT 1.ª línea + Primaquina dosis baja 0.25 mg/kg en P. falciparum) y Leptospirosis (Doxiciclina, Amoxicilina/Azitromicina y Penicilina G o Ceftriaxona en Síndrome de Weil).',
        columns: [
          'Patología / Escenario clínico',
          'Esquema terapéutico y dosis exacta (OMS / CDC)',
          'Contraindicaciones, vigilancia y alertas críticas',
        ],
        rows: [
          [
            { text: 'Malaria por Plasmodium vivax (Cura radical OMS)', tone: 'moderate', emphasize: true },
            'Cloroquina base 25 mg/kg en 3 días (10 / 10 / 5 mg/kg; máx 1,500 mg) + Primaquina 0.25 mg/kg/día VO × 14 días (máx 15 mg/d; 0.5 mg/kg/d × 14 d en cepas de alta recaída)',
            'Realizar tamizaje G6PD cuando esté disponible antes de Primaquina 14 d. CONTRAINDICADA Primaquina en embarazo, lactancia y < 6 meses (dar solo Cloroquina y valorar profilaxis semanal 300 mg base).',
          ],
          [
            { text: 'Malaria por P. falciparum (ACT 1.ª línea OMS vs. sensible)', tone: 'high', emphasize: true },
            'Estándar global OMS (ACT): Arteméter 20 mg / Lumefantrina 120 mg (Coartem) 6 dosis en 3 días (5–14 kg: 1 tab; 15–24 kg: 2 tab; 25–34 kg: 3 tab; ≥ 35 kg: 4 tab) + Primaquina gametocida 0.25 mg/kg DU en baja transmisión · Cloroquina solo en Mesoamérica/Haití sin resistencia',
            'Administrar Arteméter-Lumefantrina con alimentos grasos/leche (aceptado por OMS también en 1.er trimestre de embarazo). En malaria grave iniciar Artesunato IV 2.4 mg/kg (3 mg/kg < 20 kg) a las 0, 12 y 24 h.',
          ],
          [
            { text: 'Leptospirosis Leve / Ambulatoria y Embarazo (OMS / CDC)', tone: 'moderate', emphasize: true },
            'Adultos y ≥ 8–10 años: Doxiciclina 100 mg VO c/12 h × 7 días (o Azitromicina 500 mg/día × 3 d / Amoxicilina 500 mg c/8 h × 7 d) · Embarazo y < 8–10 años: Amoxicilina 500 mg VO c/8 h × 7 d (embarazo) o 30–50 mg/kg/día VO c/8 h (niños)',
            'Iniciar antibiótico ante sospecha clínica (< 5 días de inicio) SIN esperar ELISA IgM ni MAT. Evitar AINEs/AAS. Derivar a hospital si aparece ictericia, oliguria, disnea/hemoptisis o hipotensión.',
          ],
          [
            { text: 'Leptospirosis Moderada-Grave / Síndrome de Weil (OMS / CDC)', tone: 'critical', emphasize: true },
            'Adultos/gestantes: Penicilina G cristalina 1.5 millones UI IV c/6 h (hasta 2–4 M UI c/4–6 h) O Ceftriaxona 1–2 g IV c/24 h (o Cefotaxima 1 g IV c/6 h) × 7 días · Pediatría: Penicilina G 250,000 UI/kg/d IV c/4–6 h o Ceftriaxona 50–80 mg/kg/d IV',
            'Penicilina G y Ceftriaxona tienen eficacia equivalente. Vigilar reacción de Jarisch-Herxheimer en primeras 2–6 h, balance hídrico, K⁺ sérico y detección temprana de hemorragia alveolar pulmonar.',
          ],
        ],
        keyManagementPearls: [
          'En zonas no endémicas o con resistencia a cloroquina, la OMS establece los tratamientos combinados con artemisinina (ACT) como primera línea obligatoria para Plasmodium falciparum.',
          table.keyManagementPearls[1],
        ],
        references: [
          {
            citation:
              'World Health Organization (WHO). WHO Guidelines for malaria (updated 2023–2024). Geneva: WHO; 2024.',
            year: 2024,
          },
          {
            citation:
              'World Health Organization (WHO) & CDC Yellow Book. Human Leptospirosis: guidance for diagnosis, surveillance and clinical management. 2024.',
            year: 2024,
          },
        ],
      };

    case 'minsa-nicaragua-immunization-table':
      return {
        ...table,
        title: 'Esquema de Inmunizaciones Rutinarias (OMS) y Profilaxis Tétanos / Rabia',
        shortTitle: 'Vacunas OMS + Tétanos/Rabia',
        guidelineVersion: 'WHO Routine Immunization Recommendations 2024 · WHO Tetanus & Rabies',
        summary:
          'Calendario rutinario recomendado por la OMS (BCG en zonas endémicas, Hep B al nacer, DTP-HepB-Hib, PCV, IPV/bOPV, Rotavirus, SRP/MCV1–2, VPH, Tdap en embarazo, neumococo e influenza en adultos) junto con profilaxis antitetánica y antirrábica.',
        columns: [
          'Edad o grupo objetivo',
          'Biológicos / Vacunas recomendadas (OMS)',
          'Vía, dosis y reglas críticas de seguridad',
        ],
        rows: [
          [
            { text: 'Recién nacido (< 24 h)', tone: 'high', emphasize: true },
            'Hepatitis B dosis al nacer (universal) + BCG (en zonas endémicas de TB)',
            'BCG: intradérmica (SOLO si peso ≥ 2,000 g; si < 2,000 g diferir hasta alcanzar 2 kg). Hep B: 0.5 mL IM muslo en primeras 24 h (añadir HBIG < 12 h si madre HBsAg+).',
          ],
          [
            { text: '2, 4 y 6 meses (Serie primaria infantil)', tone: 'neutral', emphasize: true },
            'DTP-HepB-Hib (Pentavalente/Hexavalente) 1–3 · Neumococo conjugada (PCV) · Polio (mínimo 2 dosis IPV + bOPV/IPV) · Rotavirus (2 o 3 dosis)',
            'Inyectables IM en muslos separados. Rotavirus VO: respetar límite estándar de 1.ª dosis ≤ 15 semanas y completar antes de los 8 meses según presentación.',
          ],
          [
            { text: '12–18 meses · 4–7 años (Refuerzos)', tone: 'moderate', emphasize: true },
            '9–12 m: SRP/MMR 1.ª dosis (MCV1) + refuerzo PCV (si esquema 2p+1). 15–18 m: DTP/DTaP 1.er refuerzo + Polio + SRP 2.ª dosis (MCV2). 4–7 años: DTaP/DTP + Polio refuerzo',
            'SRP es vacuna de virus vivos atenuados (contraindicada en inmunosupresión grave). No usar DTP de dosis completa pertussis en ≥ 7 años (usar Tdap/Td).',
          ],
          [
            { text: '9–14 años · Embarazadas · Adultos ≥ 60–65 años', tone: 'low', emphasize: true },
            '9–14 años: VPH (1 o 2 dosis OMS) + Tdap/Td. Embarazadas: Tdap (27–36 SG cada embarazo) + Influenza estacional. Adulto ≥ 60–65 a/riesgo: Influenza anual + Neumococo (PCV20 o PCV15+PPSV23) + Td/Tdap c/10 a',
            'Tdap entre 27–36 SG protege al recién nacido contra tos ferina grave. SRP contraindicada en embarazo.',
          ],
          table.rows[4],
        ],
        keyManagementPearls: [
          'El peso mínimo de 2,000 g aplica para BCG; un prematuro estable < 2,000 g debe recibir Hepatitis B dentro de las primeras 24 h y diferir BCG.',
          'La fiebre leve, resfriado común o tratamiento antibiótico NO son contraindicaciones para vacunar.',
        ],
        references: [
          {
            citation:
              'World Health Organization (WHO). Summary of WHO Position Papers — Recommendations for Routine Immunization. Geneva: WHO; 2024.',
            year: 2024,
          },
          {
            citation:
              'World Health Organization (WHO). Rabies & Tetanus vaccines: WHO position papers. Weekly Epidemiological Record.',
            year: 2018,
          },
        ],
      };

    default:
      return table;
  }
}
