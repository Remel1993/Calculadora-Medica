import {
  formatClinicalNumber,
  getCanonicalNumberValue,
  roundClinical,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SecondaryResultItem,
  SeverityLevel,
} from '../types/clinical.ts';

const totalPsaField: NumberFieldDef = {
  id: 'totalPsa',
  label: 'PSA total sérico',
  type: 'number',
  canonicalUnit: 'ng/mL',
  units: [
    { id: 'ng_ml', label: 'ng/mL', toCanonical: (v) => v, min: 0.05, max: 1000, step: 0.1 },
    { id: 'ug_l', label: 'µg/L', toCanonical: (v) => v, min: 0.05, max: 1000, step: 0.1 },
  ],
  defaultUnitId: 'ng_ml',
  defaultValue: '6.5',
  min: 0.05,
  max: 1000,
  placeholder: '6.5',
};

const prostateVolumeField: NumberFieldDef = {
  id: 'prostateVolume',
  label: 'Volumen prostático (ecografía transrectal o RMmp)',
  type: 'number',
  canonicalUnit: 'cm³',
  units: [
    { id: 'cm3', label: 'cm³', toCanonical: (v) => v, min: 5, max: 400, step: 1 },
    { id: 'ml', label: 'mL', toCanonical: (v) => v, min: 5, max: 400, step: 1 },
  ],
  defaultUnitId: 'cm3',
  defaultValue: '42',
  min: 5,
  max: 400,
  placeholder: '42',
  helpText: 'Si se mide por elipsoide: L × AP × Transverso × 0.52.',
};

const freePsaField: NumberFieldDef = {
  id: 'freePsa',
  label: 'PSA libre sérico (opcional, útil en zona gris 4–10 ng/mL)',
  type: 'number',
  canonicalUnit: 'ng/mL',
  units: [
    { id: 'ng_ml', label: 'ng/mL', toCanonical: (v) => v, min: 0.01, max: 500, step: 0.05 },
  ],
  defaultUnitId: 'ng_ml',
  defaultValue: '',
  required: false,
  min: 0.01,
  max: 500,
  placeholder: 'Opcional (ej. 1.1)',
};

export const psaDensityCalculator: CalculatorDefinition = {
  id: 'psa-density',
  name: 'Densidad de PSA (PSAD) y Relación PSA Libre/Total',
  shortName: 'Densidad de PSA (PSAD)',
  primarySpecialty: 'urologia',
  secondarySpecialties: ['oncologia', 'medicina-interna'],
  subcategory: 'formulas',
  keywords: [
    'psa',
    'psad',
    'densidad psa',
    'prostata',
    'hpb',
    'cancer de prostata',
    'psa libre',
    'urologia',
  ],
  description:
    'Calcula la densidad del antígeno prostático específico (PSAD = PSA total / volumen prostático) y opcionalmente el porcentaje de PSA libre.',
  clinicalIndication:
    'Estratificación de riesgo de cáncer de próstata clínicamente significativo en varones con PSA elevado (especialmente zona gris 4–10 ng/mL) o hiperplasia prostática benigna.',
  validatedPopulation: 'Varones adultos en estudio urológico con medición sérica de PSA y volumen prostático por imagen.',
  contraindications: [
    'No interpretar PSA obtenido durante infección urinaria/prostatitis aguda, retención aguda de orina o tras instrumentación uretral reciente (esperar 4–6 semanas).',
  ],
  limitations: [
    'Los inhibidores de la 5-alfa-reductasa (finasterida, dutasterida) reducen el PSA sérico ~50% tras 6 meses de tratamiento; debe corregirse su interpretación.',
    'Según guías EAU/AUA, la PSAD complementa pero no reemplaza la resonancia magnética multiparamétrica (PI-RADS) ni la biopsia dirigida.',
  ],
  requiredLabsNote: 'PSA total (y opcionalmente PSA libre) más volumen prostático por RM o ecografía.',
  version: 'Benson et al. (1992) · Criterios EAU / AUA (2024)',
  references: [
    {
      citation:
        'Benson MC, Whang IS, Pantuck A, et al. Prostate specific antigen density: a means of distinguishing benign prostatic hypertrophy and prostate cancer. J Urol. 1992;147(3 Pt 2):815-816.',
      year: 1992,
    },
    {
      citation:
        'Cornford P, van den Bergh RCN, Briers E, et al. EAU-EANM-ESTRO-ESUR-ISUP-SIOG Guidelines on Prostate Cancer—2024 Update. Eur Urol. 2024;86(2):148-163.',
      year: 2024,
    },
  ],
  fields: [totalPsaField, prostateVolumeField, freePsaField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(psaDensityCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const totalPsa = getCanonicalNumberValue(totalPsaField, inputs.totalPsa as NumberInputValue).canonicalValue!;
    const volume = getCanonicalNumberValue(prostateVolumeField, inputs.prostateVolume as NumberInputValue).canonicalValue!;
    const freePsaCheck = getCanonicalNumberValue(freePsaField, inputs.freePsa as NumberInputValue);

    if (freePsaCheck.canonicalValue !== null && freePsaCheck.canonicalValue > totalPsa) {
      throw new Error('El PSA libre no puede superar al PSA total.');
    }

    const psad = roundClinical(totalPsa / volume, 3);
    const freeRatio =
      freePsaCheck.canonicalValue !== null
        ? roundClinical((freePsaCheck.canonicalValue / totalPsa) * 100, 1)
        : null;

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (psad < 0.1) {
      severity = 'low';
      riskClassification = 'PSAD baja (< 0.100 ng/mL/cm³)';
      clinicalInterpretation =
        'Baja densidad de PSA; en ausencia de tacto rectal sospechoso o lesión PI-RADS ≥ 3, sugiere elevación explicada por volumen prostático (HPB).';
      guidance.push(
        'En pacientes con RMmp PI-RADS 1–3 y PSAD < 0.10–0.15, las guías EAU suelen respaldar vigilancia sin biopsia inmediata tras decisión compartida.',
      );
    } else if (psad < 0.15) {
      severity = 'moderate';
      riskClassification = 'PSAD intermedia / indeterminada (0.100–0.149 ng/mL/cm³)';
      clinicalInterpretation =
        'Zona intermedia; riesgo moderado que requiere integrar tacto rectal, edad, antecedentes familiares y hallazgos en RM multiparamétrica.';
      guidance.push(
        'En PI-RADS 3, el umbral ≥ 0.150 (o ≥ 0.100 en protocolos conservadores) ayuda a decidir necesidad de biopsia prostática.',
      );
    } else if (psad < 0.2) {
      severity = 'high';
      riskClassification = 'PSAD elevada (0.150–0.199 ng/mL/cm³)';
      clinicalInterpretation =
        'Supera el punto de corte clásico de 0.150 ng/mL/cm³, asociándose a mayor probabilidad de adenocarcinoma prostático clínicamente significativo.';
      guidance.push(
        'Valoración urológica preferente para RM multiparamétrica y eventual biopsia prostática si no existe causa inflamatoria reversible.',
      );
    } else {
      severity = 'critical';
      riskClassification = 'PSAD muy elevada (≥ 0.200 ng/mL/cm³)';
      clinicalInterpretation =
        'Densidad de PSA marcadamente elevada; alta sospecha clínica si se han descartado prostatitis o retención urinaria reciente.';
      guidance.push(
        'Derivación urológica prioritaria para estadificación y biopsia dirigida según protocolo vigente.',
      );
    }

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Volumen prostático',
        formattedValue: formatClinicalNumber(volume, 0),
        unit: 'cm³',
      },
      {
        label: 'Umbral clásico de sospecha',
        formattedValue: '≥ 0.15',
        unit: 'ng/mL/cm³',
      },
    ];

    if (freeRatio !== null) {
      let ratioLabel = 'Zona intermedia (10–25%)';
      if (freeRatio < 10) ratioLabel = 'Muy sospechosa (< 10%)';
      else if (freeRatio > 25) ratioLabel = 'Sugiere HPB (> 25%)';

      secondaryResults.push({
        label: 'Relación PSA libre / total',
        formattedValue: `${formatClinicalNumber(freeRatio, 1)}% (${ratioLabel})`,
        unit: '',
      });
    }

    return {
      primaryResult: {
        label: 'Densidad de PSA (PSAD)',
        value: psad,
        formattedValue: formatClinicalNumber(psad, 3),
        unit: 'ng/mL/cm³',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'PSAD = PSA total (ng/mL) / Volumen prostático (cm³)',
      inputsSummary: `PSA ${formatClinicalNumber(totalPsa, 1)} ng/mL · Vol ${formatClinicalNumber(volume, 0)} cm³${
        freeRatio !== null ? ` · PSA libre ${formatClinicalNumber(freeRatio, 1)}%` : ''
      }`,
    };
  },
};
