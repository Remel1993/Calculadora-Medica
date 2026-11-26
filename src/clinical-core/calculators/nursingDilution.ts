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
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const unitFamilyField: SelectFieldDef = {
  id: 'unitFamily',
  label: 'Sistema de unidades del medicamento',
  type: 'select',
  defaultValue: 'mass',
  options: [
    { value: 'mass', label: 'Masa (g, mg, mcg) — antibióticos, analgésicos, corticoides, etc.' },
    { value: 'iu', label: 'Unidades Internacionales (UI) — heparina, insulina, penicilina G, etc.' },
    { value: 'meq', label: 'Miliequivalentes (mEq) — potasio, bicarbonato, sodio, magnesio' },
  ],
};

const MASS_UNITS = [
  { id: 'mg', label: 'mg', toCanonical: (v: number) => v, min: 0.001, max: 100000, step: 1 },
  { id: 'g', label: 'g', toCanonical: (v: number) => v * 1000, min: 0.001, max: 100, step: 0.1 },
  { id: 'mcg', label: 'mcg (µg)', toCanonical: (v: number) => v / 1000, min: 1, max: 100000000, step: 10 },
];

const prescribedMassField: NumberFieldDef = {
  id: 'prescribedMass',
  label: 'Dosis prescrita a administrar',
  type: 'number',
  canonicalUnit: 'mg',
  units: MASS_UNITS,
  defaultUnitId: 'mg',
  min: 0.001,
  max: 100000,
  placeholder: '750',
  visibleWhen: (i) => i.unitFamily === 'mass' || !i.unitFamily,
};

const vialAmountMassField: NumberFieldDef = {
  id: 'vialAmountMass',
  label: 'Cantidad total de fármaco en la ampolla o frasco',
  type: 'number',
  canonicalUnit: 'mg',
  units: MASS_UNITS,
  defaultUnitId: 'g',
  min: 0.001,
  max: 100000,
  placeholder: '1',
  helpText: 'Ej.: Ceftriaxona 1 g o Ampolla de 40 mg.',
  visibleWhen: (i) => i.unitFamily === 'mass' || !i.unitFamily,
};

const prescribedIuField: NumberFieldDef = {
  id: 'prescribedIu',
  label: 'Dosis prescrita a administrar (UI)',
  type: 'number',
  canonicalUnit: 'UI',
  units: [{ id: 'ui', label: 'UI', toCanonical: (v) => v, min: 0.1, max: 50000000, step: 100 }],
  defaultUnitId: 'ui',
  min: 0.1,
  max: 50000000,
  placeholder: '5000',
  visibleWhen: (i) => i.unitFamily === 'iu',
};

const vialAmountIuField: NumberFieldDef = {
  id: 'vialAmountIu',
  label: 'Contenido total en el frasco/ampolla (UI)',
  type: 'number',
  canonicalUnit: 'UI',
  units: [{ id: 'ui', label: 'UI', toCanonical: (v) => v, min: 1, max: 50000000, step: 500 }],
  defaultUnitId: 'ui',
  min: 1,
  max: 50000000,
  placeholder: '25000',
  visibleWhen: (i) => i.unitFamily === 'iu',
};

const prescribedMeqField: NumberFieldDef = {
  id: 'prescribedMeq',
  label: 'Dosis prescrita a administrar (mEq)',
  type: 'number',
  canonicalUnit: 'mEq',
  units: [{ id: 'meq', label: 'mEq', toCanonical: (v) => v, min: 0.1, max: 1000, step: 1 }],
  defaultUnitId: 'meq',
  min: 0.1,
  max: 1000,
  placeholder: '20',
  visibleWhen: (i) => i.unitFamily === 'meq',
};

const vialAmountMeqField: NumberFieldDef = {
  id: 'vialAmountMeq',
  label: 'Contenido total en la ampolla/frasco (mEq)',
  type: 'number',
  canonicalUnit: 'mEq',
  units: [{ id: 'meq', label: 'mEq', toCanonical: (v) => v, min: 0.1, max: 1000, step: 1 }],
  defaultUnitId: 'meq',
  min: 0.1,
  max: 1000,
  placeholder: '20',
  visibleWhen: (i) => i.unitFamily === 'meq',
};

const vialVolumeField: NumberFieldDef = {
  id: 'vialVolumeMl',
  label: 'Volumen de la ampolla o diluyente de reconstitución (mL)',
  type: 'number',
  canonicalUnit: 'mL',
  units: [{ id: 'ml', label: 'mL', toCanonical: (v) => v, min: 0.1, max: 1000, step: 0.5 }],
  defaultUnitId: 'ml',
  min: 0.1,
  max: 1000,
  placeholder: '10',
  helpText: 'Volumen líquido total en el que está disuelto el contenido del frasco/ampolla.',
};

const finalDilutionField: NumberFieldDef = {
  id: 'finalDilutionMl',
  label: 'Volumen final en jeringa, bureta o bolsa (opcional)',
  type: 'number',
  canonicalUnit: 'mL',
  units: [{ id: 'ml', label: 'mL', toCanonical: (v) => v, min: 1, max: 2000, step: 5 }],
  defaultUnitId: 'ml',
  min: 1,
  max: 2000,
  required: false,
  placeholder: '100',
  helpText: 'Opcional: si tras cargar la dosis se lleva a una bolsa/bureta de 50 o 100 mL para infusión.',
};

export const nursingDilutionCalculator: CalculatorDefinition = {
  id: 'nursing-drug-dilution',
  name: 'Regla de Tres, Reconstitución y Dilución de Fármacos (Enfermería)',
  shortName: 'Regla de Tres / Diluciones',
  primarySpecialty: 'urgencias',
  secondarySpecialties: ['pediatria', 'medicina-interna'],
  subcategory: 'dosificacion',
  keywords: [
    'regla de tres',
    'dilucion',
    'reconstitucion',
    'enfermeria',
    'ampolla',
    'vial',
    'dosis',
    'cargar',
    'jeringa',
    'concentracion',
    'medicamentos',
  ],
  description:
    'Cálculo exacto por regla de tres para determinar los mililitros a cargar desde un vial o ampolla (mg/mcg/g, UI o mEq), número de viales y concentración final tras dilución.',
  clinicalIndication:
    'Preparación segura de medicamentos parenterales y orales líquidos en enfermería, urgencias, pediatría y hospitalización.',
  validatedPopulation: 'Adultos y pediatría (verificando presentación comercial exacta y compatibilidad del diluyente).',
  contraindications: [
    'Nunca mezclar en el mismo cálculo unidades incompatibles (p. ej. mg frente a UI o mEq) ni obviar el volumen de desplazamiento del polvo liofilizado en viales neonatales críticos.',
  ],
  limitations: [
    'Verificar en ficha técnica si el fármaco requiere diluyente específico (agua estéril, SS 0.9 % o SG 5 %) y concentración máxima permitida por vía periférica.',
    'La regla de tres verifica equivalencia matemática, no sustituye la comprobación de la dosis terapéutica según peso o función renal.',
  ],
  version: 'Regla de tres dimensional · ISMP',
  references: [
    {
      citation:
        'Potter PA, Perry AG, Stockert PA, Hall AM. Fundamentals of Nursing (11th ed.). Medication Administration & Dosage Calculations. Elsevier; 2023.',
      year: 2023,
    },
    {
      citation:
        'Institute for Safe Medication Practices (ISMP). High-Alert Medications in Acute Care Settings & Safe Concentration Practices. 2024.',
      year: 2024,
    },
  ],
  fields: [
    unitFamilyField,
    prescribedMassField,
    vialAmountMassField,
    prescribedIuField,
    vialAmountIuField,
    prescribedMeqField,
    vialAmountMeqField,
    vialVolumeField,
    finalDilutionField,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(nursingDilutionCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const family = (inputs.unitFamily as string) || 'mass';
    let prescribed = 0;
    let vialAmount = 0;
    let unitName = 'mg';

    if (family === 'mass') {
      prescribed = getCanonicalNumberValue(
        prescribedMassField,
        inputs.prescribedMass as NumberInputValue,
      ).canonicalValue!;
      vialAmount = getCanonicalNumberValue(
        vialAmountMassField,
        inputs.vialAmountMass as NumberInputValue,
      ).canonicalValue!;
      unitName = 'mg';
    } else if (family === 'iu') {
      prescribed = getCanonicalNumberValue(
        prescribedIuField,
        inputs.prescribedIu as NumberInputValue,
      ).canonicalValue!;
      vialAmount = getCanonicalNumberValue(
        vialAmountIuField,
        inputs.vialAmountIu as NumberInputValue,
      ).canonicalValue!;
      unitName = 'UI';
    } else {
      prescribed = getCanonicalNumberValue(
        prescribedMeqField,
        inputs.prescribedMeq as NumberInputValue,
      ).canonicalValue!;
      vialAmount = getCanonicalNumberValue(
        vialAmountMeqField,
        inputs.vialAmountMeq as NumberInputValue,
      ).canonicalValue!;
      unitName = 'mEq';
    }

    const vialVolumeMl = getCanonicalNumberValue(
      vialVolumeField,
      inputs.vialVolumeMl as NumberInputValue,
    ).canonicalValue!;

    const finalDilutionParsed = getCanonicalNumberValue(
      finalDilutionField,
      inputs.finalDilutionMl as NumberInputValue | undefined,
    );
    const finalDilutionMl = finalDilutionParsed.canonicalValue;

    const volumeToDraw = (prescribed * vialVolumeMl) / vialAmount;
    const volumeDecimals = volumeToDraw < 1 ? 3 : volumeToDraw < 10 ? 2 : 1;
    const volumeRounded = roundClinical(volumeToDraw, volumeDecimals);

    if (finalDilutionMl !== null && finalDilutionMl < volumeRounded) {
      throw new Error(
        `El volumen final de dilución (${formatClinicalNumber(finalDilutionMl, 1)} mL) no puede ser menor que el volumen a cargar del vial (${formatClinicalNumber(volumeRounded, volumeDecimals)} mL).`,
      );
    }

    const vialConc = vialAmount / vialVolumeMl;
    const vialsNeeded = roundClinical(prescribed / vialAmount, 2);

    const secondaryResults = [
      {
        label: 'Concentración del vial/ampolla',
        formattedValue:
          family === 'mass'
            ? `${formatClinicalNumber(roundClinical(vialConc, 3), vialConc < 1 ? 3 : 2)} mg/mL (${formatClinicalNumber(roundClinical(vialConc * 1000, 1), 1)} mcg/mL)`
            : `${formatClinicalNumber(roundClinical(vialConc, 2), 2)} ${unitName}/mL`,
        unit: '',
      },
      {
        label: 'Frascos / ampollas requeridas',
        formattedValue: formatClinicalNumber(vialsNeeded, 2),
        unit: vialsNeeded > 1 ? 'unidades' : 'unidad',
      },
    ];

    if (finalDilutionMl !== null) {
      const extraDiluent = roundClinical(finalDilutionMl - volumeToDraw, 2);
      const finalConc = prescribed / finalDilutionMl;
      secondaryResults.push(
        {
          label: 'Diluyente adicional a añadir',
          formattedValue: formatClinicalNumber(Math.max(0, extraDiluent), 1),
          unit: 'mL',
        },
        {
          label: 'Concentración final diluida',
          formattedValue:
            family === 'mass'
              ? `${formatClinicalNumber(roundClinical(finalConc, 3), finalConc < 1 ? 3 : 2)} mg/mL (${formatClinicalNumber(roundClinical(finalConc * 1000, 1), 1)} mcg/mL)`
              : `${formatClinicalNumber(roundClinical(finalConc, 2), 2)} ${unitName}/mL`,
          unit: '',
        },
      );
    }

    let severity: SeverityLevel = 'info';
    let riskClassification = `Cargar ${formatClinicalNumber(volumeRounded, volumeDecimals)} mL del vial`;
    const guidance: string[] = [
      'Aplicar los correctos de administración segura (paciente, medicamento, dosis, vía, hora, diluyente y velocidad de infusión).',
    ];

    if (vialsNeeded > 10) {
      severity = 'high';
      riskClassification = `ALERTA DE VERIFICACIÓN: requiere ${formatClinicalNumber(vialsNeeded, 1)} ampollas/viales`;
      guidance.unshift(
        'DOBLE VERIFICACIÓN OBLIGATORIA: la dosis prescrita supera 10 veces el contenido de un vial; confirmar que no exista error de unidad (p. ej. mg vs mcg o g).',
      );
    } else if (volumeToDraw < 0.1) {
      severity = 'high';
      riskClassification = `ALERTA DE PRECISIÓN: volumen muy pequeño (${formatClinicalNumber(volumeRounded, volumeDecimals)} mL)`;
      guidance.unshift(
        'Volumen < 0.1 mL: alto riesgo de error de medición en jeringa estándar. Realizar doble dilución (p. ej. llevar a 10 mL primero) o utilizar jeringa graduada de 1 mL / tuberculina.',
      );
    }

    return {
      primaryResult: {
        label: 'Volumen a cargar del vial / ampolla',
        value: volumeRounded,
        formattedValue: formatClinicalNumber(volumeRounded, volumeDecimals),
        unit: 'mL',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation: `Para administrar ${prescribed} ${unitName} a partir de un vial de ${vialAmount} ${unitName} en ${vialVolumeMl} mL se deben cargar ${formatClinicalNumber(volumeRounded, volumeDecimals)} mL${finalDilutionMl !== null ? ` y completar con ${formatClinicalNumber(Math.max(0, roundClinical(finalDilutionMl - volumeToDraw, 2)), 1)} mL de diluyente compatible hasta ${formatClinicalNumber(finalDilutionMl, 1)} mL finales` : ''}.`,
      guidance,
      formulaUsed:
        'Regla de tres: Volumen a cargar (mL) = [Dosis prescrita × Volumen del vial (mL)] / Contenido del vial',
      inputsSummary: `Dosis: ${prescribed} ${unitName} · Vial: ${vialAmount} ${unitName}/${vialVolumeMl} mL${finalDilutionMl !== null ? ` → Diluido a ${finalDilutionMl} mL` : ''}`,
    };
  },
};
