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
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const compositionField: SelectFieldDef = {
  id: 'composition',
  label: '1. Composición ecográfica',
  type: 'select',
  defaultValue: 'solid',
  options: [
    { value: 'cystic', label: 'Quístico o casi completamente quístico (0 pts)', points: 0 },
    { value: 'spongiform', label: 'Espongiforme (> 50 % microquistes, 0 pts -> TR1 directo)', points: 0 },
    { value: 'mixed', label: 'Mixto quístico y sólido (+1 pt)', points: 1 },
    { value: 'solid', label: 'Sólido o casi completamente sólido (+2 pts)', points: 2 },
  ],
};

const echogenicityField: SelectFieldDef = {
  id: 'echogenicity',
  label: '2. Ecogenicidad (respecto al parénquima tiroideo)',
  type: 'select',
  defaultValue: 'hypoechoic',
  visibleWhen: (inputs) => inputs.composition !== 'spongiform',
  options: [
    { value: 'anechoic', label: 'Anecoico (0 pts)', points: 0 },
    { value: 'hyper_iso', label: 'Hiperecoico o isoecoico (+1 pt)', points: 1 },
    { value: 'hypoechoic', label: 'Hipoecoico (+2 pts)', points: 2 },
    { value: 'very_hypoechoic', label: 'Muy hipoecoico — menor que músculos pretiroideos (+3 pts)', points: 3 },
  ],
};

const shapeField: SelectFieldDef = {
  id: 'shape',
  label: '3. Forma (en plano transverso)',
  type: 'select',
  defaultValue: 'wider',
  visibleWhen: (inputs) => inputs.composition !== 'spongiform',
  options: [
    { value: 'wider', label: 'Más ancho que alto (0 pts)', points: 0 },
    { value: 'taller', label: 'Más alto que ancho — AP > Transverso (+3 pts)', points: 3 },
  ],
};

const marginField: SelectFieldDef = {
  id: 'margin',
  label: '4. Márgenes',
  type: 'select',
  defaultValue: 'smooth',
  visibleWhen: (inputs) => inputs.composition !== 'spongiform',
  options: [
    { value: 'smooth', label: 'Lisos / bien definidos (0 pts)', points: 0 },
    { value: 'ill_defined', label: 'Mal definidos (0 pts)', points: 0 },
    { value: 'lobulated', label: 'Lobulados o irregulares (+2 pts)', points: 2 },
    { value: 'ete', label: 'Extensión extratiroidea (+3 pts)', points: 3 },
  ],
};

const fociMacroField: BooleanFieldDef = {
  id: 'fociMacro',
  label: '5a. Macrocalcificaciones (+1 pt)',
  type: 'boolean',
  defaultValue: false,
  pointsWhenTrue: 1,
  visibleWhen: (inputs) => inputs.composition !== 'spongiform',
  helpText: 'En ACR TI-RADS los focos ecogénicos son aditivos. Artefactos en cola de cometa grandes suman 0 pts.',
};

const fociRimField: BooleanFieldDef = {
  id: 'fociRim',
  label: '5b. Calcificaciones periféricas / en cáscara de huevo (+2 pts)',
  type: 'boolean',
  defaultValue: false,
  pointsWhenTrue: 2,
  visibleWhen: (inputs) => inputs.composition !== 'spongiform',
};

const fociPunctateField: BooleanFieldDef = {
  id: 'fociPunctate',
  label: '5c. Focos ecogénicos puntiformes / microcalcificaciones (+3 pts)',
  type: 'boolean',
  defaultValue: false,
  pointsWhenTrue: 3,
  visibleWhen: (inputs) => inputs.composition !== 'spongiform',
};

const noduleSizeField: NumberFieldDef = {
  id: 'noduleSizeMm',
  label: 'Diámetro máximo del nódulo',
  type: 'number',
  canonicalUnit: 'mm',
  units: [
    { id: 'mm', label: 'mm', toCanonical: (v) => v, min: 1, max: 150, step: 1 },
    { id: 'cm', label: 'cm', toCanonical: (v) => v * 10, min: 0.1, max: 15, step: 0.1 },
  ],
  defaultUnitId: 'mm',
  defaultValue: '16',
  min: 1,
  max: 150,
  placeholder: '16',
};

function ptsForOption(field: SelectFieldDef, value: string): number {
  return field.options.find((o) => o.value === value)?.points ?? 0;
}

export const acrTiradsCalculator: CalculatorDefinition = {
  id: 'acr-tirads-thyroid',
  name: 'ACR TI-RADS (2017) — Estratificación de Nódulo Tiroideo',
  shortName: 'ACR TI-RADS (Tiroides)',
  primarySpecialty: 'oncologia',
  secondarySpecialties: ['endocrinologia', 'cirugia-general', 'medicina-interna'],
  subcategory: 'diagnostico',
  keywords: [
    'tirads',
    'ti-rads',
    'tiroides',
    'nodulo tiroideo',
    'paaf',
    'ecografia tiroidea',
    'rads',
    'oncologia',
    'cancer tiroides',
  ],
  description:
    'Sistema de puntuación ecográfica ACR TI-RADS (TR1–TR5) para estratificar el riesgo de malignidad tiroidea y definir el umbral exacto de tamaño para PAAF o seguimiento.',
  clinicalIndication:
    'Evaluación de nódulos tiroideos detectados por ecografía cervical en adultos para decidir biopsia por aspiración con aguja fina (PAAF) vs. vigilancia.',
  validatedPopulation: 'Adultos con nódulos tiroideos en ecografía de alta resolución.',
  contraindications: [
    'No sustituye la evaluación urgente ante adenopatías cervicales sospechosas, disfonía por parálisis de cuerda vocal o crecimiento rápido sugestivo de linfoma/carcinoma anaplásico.',
  ],
  limitations: [
    'Los nódulos espongiformes se asignan directamente a TR1 (0 puntos) sin sumar otras categorías ecográficas según el consenso ACR 2017.',
    'La decisión de PAAF debe integrar también factores de riesgo clínico (irradiación cervical previa, historia familiar de cáncer medular/MEN2 o PET-TC ávido focal).',
    'En pacientes con múltiples nódulos se recomienda biopsiar como máximo los 2 nódulos con mayor puntuación o que superen el umbral de su categoría.',
  ],
  version: 'ACR TI-RADS White Paper (Tessler et al., JACR 2017)',
  references: [
    {
      citation:
        'Tessler FN, Middleton WD, Grant EG, et al. ACR Thyroid Imaging, Reporting and Data System (TI-RADS): White Paper of the ACR TI-RADS Committee. J Am Coll Radiol. 2017;14(5):587-595.',
      year: 2017,
    },
    {
      citation:
        'Haugen BR, Alexander EK, Bible KC, et al. 2015 American Thyroid Association Management Guidelines for Adult Patients with Thyroid Nodules and Differentiated Thyroid Cancer. Thyroid. 2016;26(1):1-133.',
      year: 2016,
    },
  ],
  fields: [
    compositionField,
    echogenicityField,
    shapeField,
    marginField,
    fociMacroField,
    fociRimField,
    fociPunctateField,
    noduleSizeField,
  ],
  calculate(inputs: CalculatorInputsState) {
    const errors = validateCalculatorInputs(acrTiradsCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors.map((e) => e.message).join(' '));
    }

    const composition = String(inputs.composition ?? 'solid');
    const echogenicity = String(inputs.echogenicity ?? 'hypoechoic');
    const shape = String(inputs.shape ?? 'wider');
    const margin = String(inputs.margin ?? 'smooth');
    const fociMacro = Boolean(inputs.fociMacro);
    const fociRim = Boolean(inputs.fociRim);
    const fociPunctate = Boolean(inputs.fociPunctate);
    const sizeMm = getCanonicalNumberValue(
      noduleSizeField,
      inputs.noduleSizeMm as NumberInputValue,
    ).canonicalValue!;

    let totalPoints = 0;
    if (composition !== 'spongiform') {
      totalPoints =
        ptsForOption(compositionField, composition) +
        ptsForOption(echogenicityField, echogenicity) +
        ptsForOption(shapeField, shape) +
        ptsForOption(marginField, margin) +
        (fociMacro ? 1 : 0) +
        (fociRim ? 2 : 0) +
        (fociPunctate ? 3 : 0);
    }

    let trCategory = 'TR1';
    let trDescription = 'Benigno';
    let malignancyRisk = '≤ 2 % (típicamente < 1 %)';
    let action = 'No requiere PAAF ni seguimiento ecográfico de rutina';
    let severity: SeverityLevel = 'normal';

    if (totalPoints === 0) {
      trCategory = 'TR1';
      trDescription = 'Benigno';
      malignancyRisk = '≤ 2 % (típicamente ~0.3 %)';
      action = 'NO indicada PAAF ni seguimiento ecográfico de rutina.';
      severity = 'normal';
    } else if (totalPoints <= 2) {
      trCategory = 'TR2';
      trDescription = 'No sospechoso';
      malignancyRisk = '≤ 2 % (~1.5 %)';
      action = 'NO indicada PAAF ni seguimiento ecográfico de rutina.';
      severity = 'low';
    } else if (totalPoints === 3) {
      trCategory = 'TR3';
      trDescription = 'Levemente sospechoso';
      malignancyRisk = '~4.8 % (< 5 %)';
      if (sizeMm >= 25) {
        action = 'INDICADA PAAF (nódulo TR3 ≥ 25 mm).';
        severity = 'moderate';
      } else if (sizeMm >= 15) {
        action = 'Seguimiento ecográfico (a 1, 3 y 5 años) — PAAF solo si alcanza ≥ 25 mm o crecimiento significativo.';
        severity = 'low';
      } else {
        action = 'Sin PAAF ni seguimiento ecográfico obligatorio (< 15 mm).';
        severity = 'low';
      }
    } else if (totalPoints <= 6) {
      trCategory = 'TR4';
      trDescription = 'Moderadamente sospechoso';
      malignancyRisk = '~9.1 % (5–20 %)';
      if (sizeMm >= 15) {
        action = 'INDICADA PAAF (nódulo TR4 ≥ 15 mm).';
        severity = 'high';
      } else if (sizeMm >= 10) {
        action = 'Seguimiento ecográfico estrecho (a 1, 2, 3 y 5 años) — PAAF si crece a ≥ 15 mm.';
        severity = 'moderate';
      } else {
        action = 'Sin PAAF de rutina (< 10 mm); valorar vigilancia solo si existen factores de alto riesgo clínico.';
        severity = 'moderate';
      }
    } else {
      trCategory = 'TR5';
      trDescription = 'Altamente sospechoso';
      malignancyRisk = '~35 % (> 20 %)';
      if (sizeMm >= 10) {
        action = 'INDICADA PAAF prioritaria (nódulo TR5 ≥ 10 mm).';
        severity = 'critical';
      } else if (sizeMm >= 5) {
        action = 'Seguimiento ecográfico anual hasta 5 años (TR5 de 5–9 mm); considerar PAAF si adenopatía sospechosa o proximidad a tráquea/nervio laríngeo recurrente.';
        severity = 'high';
      } else {
        action = 'Vigilancia clínica sin PAAF inmediata habitual (< 5 mm), salvo sospecha ganglionar o invasión capsular.';
        severity = 'moderate';
      }
    }

    const roundedMm = roundClinical(sizeMm, 1);

    return {
      primaryResult: {
        label: 'Categoría ACR TI-RADS',
        value: totalPoints,
        formattedValue: `${trCategory} (${totalPoints} pts)`,
        unit: `${roundedMm} mm`,
      },
      secondaryResults: [
        {
          label: 'Nivel de sospecha',
          formattedValue: trDescription,
          unit: '',
        },
        {
          label: 'Riesgo estimado de malignidad',
          formattedValue: malignancyRisk,
          unit: '',
        },
        {
          label: 'Umbral de PAAF para esta categoría',
          formattedValue:
            trCategory === 'TR3'
              ? '≥ 25 mm'
              : trCategory === 'TR4'
                ? '≥ 15 mm'
                : trCategory === 'TR5'
                  ? '≥ 10 mm'
                  : 'No aplica PAAF',
          unit: '',
        },
      ],
      severity,
      riskClassification: `${trCategory} · ${trDescription} (${totalPoints} puntos)`,
      clinicalInterpretation: `Nódulo tiroideo de ${formatClinicalNumber(roundedMm, 1)} mm clasificado como ${trCategory} (${trDescription}, ${totalPoints} puntos ACR TI-RADS). Riesgo estimado de malignidad: ${malignancyRisk}. Conducta: ${action}`,
      guidance: [
        action,
        'Crecimiento significativo que justifica reevaluación/PAAF en seguimiento: aumento ≥ 20 % en al menos dos dimensiones con incremento mínimo ≥ 2 mm, o aumento ≥ 50 % del volumen.',
        'Ante adenopatía cervical sospechosa coexistente, realizar PAAF dirigida del ganglio (con tiroglobulina en lavado de aguja si procede) independientemente del tamaño nodular.',
      ],
      guidanceDisclaimer:
        'Orientación basada en ACR TI-RADS 2017. La decisión final de punción integra antecedentes de radiación, historia familiar, TSH y comorbilidades.',
      formulaUsed:
        composition === 'spongiform'
          ? 'Nódulo espongiforme = TR1 directo (0 puntos ACR TI-RADS)'
          : 'Puntos ACR TI-RADS = Composición + Ecogenicidad + Forma + Márgenes + Σ(Focos ecogénicos)',
      inputsSummary: `Composición=${composition}, Eco=${echogenicity}, Tamaño=${formatClinicalNumber(roundedMm, 1)} mm, Puntos=${totalPoints}`,
    };
  },
};
