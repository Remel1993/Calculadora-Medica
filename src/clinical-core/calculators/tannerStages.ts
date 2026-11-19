import { getCanonicalNumberValue, validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SecondaryResultItem,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const sexField: SelectFieldDef = {
  id: 'sex',
  label: 'Sexo biológico del paciente',
  type: 'select',
  defaultValue: 'female',
  options: [
    { value: 'female', label: 'Femenino (Desarrollo mamario B1–B5 y vello púbico P1–P5)' },
    { value: 'male', label: 'Masculino (Desarrollo genital G1–G5 y vello púbico P1–P5)' },
  ],
};

const ageField: NumberFieldDef = {
  id: 'age',
  label: 'Edad cronológica (opcional, para evaluar pubertad precoz o retrasada)',
  type: 'number',
  canonicalUnit: 'años',
  units: [{ id: 'years', label: 'años', toCanonical: (v) => v }],
  defaultUnitId: 'years',
  min: 1,
  max: 25,
  required: false,
  placeholder: '11.5',
  helpText: 'Si la introduces, detectará signos de adelanto (< 8 a niñas / < 9 a niños) o retraso puberal.',
};

const breastField: SelectFieldDef = {
  id: 'breastStage',
  label: 'Desarrollo mamario (M — B1 a B5)',
  type: 'select',
  defaultValue: '1',
  visibleWhen: (i) => i.sex === 'female',
  options: [
    {
      value: '1',
      label: 'Estadio 1 (B1 / Prepuberal)',
      description: 'Elevación solo del pezón; sin tejido glandular palpable.',
    },
    {
      value: '2',
      label: 'Estadio 2 (B2 / Botón mamario - Telarquia)',
      description: 'Nódulo subareolar palpable y discreta elevación de mama y papila; aumento del diámetro areolar.',
    },
    {
      value: '3',
      label: 'Estadio 3 (B3)',
      description: 'Mayor crecimiento y elevación de mama y areola sin separación de sus contornos.',
    },
    {
      value: '4',
      label: 'Estadio 4 (B4)',
      description: 'Proyección de areola y papila formando una elevación secundaria sobre el resto de la mama.',
    },
    {
      value: '5',
      label: 'Estadio 5 (B5 / Adulto)',
      description: 'Contorno mamario maduro; la areola vuelve al plano general de la mama y solo sobresale el pezón.',
    },
  ],
};

const genitalField: SelectFieldDef = {
  id: 'genitalStage',
  label: 'Desarrollo genital masculino (G1 a G5)',
  type: 'select',
  defaultValue: '1',
  visibleWhen: (i) => i.sex === 'male',
  options: [
    {
      value: '1',
      label: 'Estadio 1 (G1 / Prepuberal)',
      description: 'Testículos (< 4 mL), escroto y pene de tamaño y proporciones infantiles.',
    },
    {
      value: '2',
      label: 'Estadio 2 (G2 / Inicio puberal)',
      description: 'Volumen testicular ≥ 4 mL (orquidómetro de Prader), adelgazamiento y enrojecimiento escrotal; pene aún sin aumento franco.',
    },
    {
      value: '3',
      label: 'Estadio 3 (G3)',
      description: 'Aumento de longitud del pene, mayor crecimiento testicular (8–12 mL) y escrotal.',
    },
    {
      value: '4',
      label: 'Estadio 4 (G4)',
      description: 'Incremento en grosor y longitud del pene, desarrollo del glande, testículos 12–15 mL y escroto más pigmentado.',
    },
    {
      value: '5',
      label: 'Estadio 5 (G5 / Adulto)',
      description: 'Genitales de tamaño y proporciones adultas (volumen testicular ≥ 15–25 mL).',
    },
  ],
};

const pubicHairField: SelectFieldDef = {
  id: 'pubicHairStage',
  label: 'Vello púbico (P1 a P5)',
  type: 'select',
  defaultValue: '1',
  options: [
    {
      value: '1',
      label: 'Estadio 1 (P1 / Prepuberal)',
      description: 'Ausencia de vello púbico terminal (solo vello fino similar al abdominal).',
    },
    {
      value: '2',
      label: 'Estadio 2 (P2)',
      description: 'Vello escaso, largo, ligeramente pigmentado, lacio o poco rizado en labios mayores o base del pene.',
    },
    {
      value: '3',
      label: 'Estadio 3 (P3)',
      description: 'Vello más oscuro, grueso y rizado, extendido escasamente sobre la sínfisis del pubis.',
    },
    {
      value: '4',
      label: 'Estadio 4 (P4)',
      description: 'Vello de tipo adulto en grosor y densidad, sin extenderse aún a la cara interna de los muslos.',
    },
    {
      value: '5',
      label: 'Estadio 5 (P5 / Adulto)',
      description: 'Distribución triangular adulta que se extiende a la cara superointerna de los muslos.',
    },
  ],
};

export const tannerStagesCalculator: CalculatorDefinition = {
  id: 'tanner-stages',
  name: 'Estadios de Maduración Sexual de Tanner (Pubertad)',
  shortName: 'Escala de Tanner',
  primarySpecialty: 'pediatria',
  secondarySpecialties: ['endocrinologia', 'gineco-obstetricia'],
  subcategory: 'diagnostico',
  keywords: [
    'tanner',
    'pubertad',
    'maduracion sexual',
    'telarquia',
    'pubarquia',
    'pubertad precoz',
    'retraso puberal',
    'desarrollo puberal',
  ],
  description:
    'Clasificación clínica estándar de Marshall y Tanner (Estadios I–V) del desarrollo mamario/genital y del vello púbico, con verificación de cronología puberal.',
  clinicalIndication:
    'Control del crecimiento y desarrollo puberal en pediatría, adolescencia y endocrinología pediátrica; cribado de pubertad precoz o retrasada.',
  validatedPopulation: 'Niños, niñas y adolescentes (8–18 años; aplicable desde edad pediátrica ante sospecha de pubertad precoz).',
  contraindications: [
    'La telarquia o pubarquia aisladas antes de los 8 años requieren diferenciar variantes benignas (telarquia/adrenarquia prematura aislada) de pubertad precoz central.',
    'La adipomastia en pacientes con obesidad puede simular estadio B2/B3 a la inspección; confirmar mediante palpación glandular y orquidometría de Prader en varones.',
  ],
  limitations: [
    'El vello púbico (adrenarquia) y el desarrollo mamario/gonadal (gonadarquia) pueden progresar de forma asincrónica; por ello se documentan siempre por separado (ej. B3 P2 o G4 P3).',
  ],
  version: 'Marshall & Tanner (1969 / 1970)',
  references: [
    {
      citation: 'Marshall WA, Tanner JM. Variations in pattern of pubertal changes in girls. Arch Dis Child. 1969;44(235):291-303.',
      year: 1969,
    },
    {
      citation: 'Marshall WA, Tanner JM. Variations in the pattern of pubertal changes in boys. Arch Dis Child. 1970;45(239):13-23.',
      year: 1970,
    },
  ],
  fields: [sexField, ageField, breastField, genitalField, pubicHairField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(tannerStagesCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const sex = inputs.sex as 'female' | 'male';
    const primaryCode = sex === 'female' ? 'B' : 'G';
    const primaryStage = Number(sex === 'female' ? inputs.breastStage : inputs.genitalStage);
    const pubicStage = Number(inputs.pubicHairStage);
    const ageRes = getCanonicalNumberValue(ageField, inputs.age as NumberInputValue);
    const age = ageRes.canonicalValue;

    const notation = `${primaryCode}${primaryStage} P${pubicStage}`;
    const overallStage = Math.max(primaryStage, pubicStage);

    let phaseLabel = '';
    let interpretation = '';
    if (primaryStage === 1 && pubicStage === 1) {
      phaseLabel = 'Estadio I — Prepuberal';
      interpretation = 'Sin signos clínicos de activación puberal gonadal ni adrenal.';
    } else if (overallStage === 5 && primaryStage === 5) {
      phaseLabel = 'Estadio V — Maduración puberal completa';
      interpretation = 'Desarrollo sexual secundario completo correspondiente a morfología adulta.';
    } else if (primaryStage === 2 && pubicStage <= 2) {
      phaseLabel = 'Estadio II — Inicio de la pubertad';
      interpretation =
        sex === 'female'
          ? 'Inicio puberal femenino (telarquia B2); el pico de estirón puberal suele ocurrir entre B2 y B3, y la menarquia habitualmente en B4.'
          : 'Inicio puberal masculino (volumen testicular ≥ 4 mL); el pico de velocidad de crecimiento suele ocurrir entre G3 y G4.';
    } else {
      phaseLabel = `Estadio ${overallStage} — Pubertad en progresión (${notation})`;
      interpretation =
        sex === 'female'
          ? 'Progresión puberal intermedia en curso; correlacionar con velocidad de crecimiento (cm/año) y edad de menarquia.'
          : 'Progresión puberal intermedia en curso; correlacionar con volumen testicular (orquidómetro de Prader) y velocidad de crecimiento.';
    }

    let severity: SeverityLevel = 'info';
    let riskClassification = `${phaseLabel} (${notation})`;
    const guidance: string[] = [];
    const secondaryResults: SecondaryResultItem[] = [
      {
        label: sex === 'female' ? 'Desarrollo mamario' : 'Desarrollo genital',
        formattedValue: `${primaryCode}${primaryStage}`,
        unit: '',
      },
      {
        label: 'Vello púbico',
        formattedValue: `P${pubicStage}`,
        unit: '',
      },
    ];

    if (age !== null) {
      const precociousAge = sex === 'female' ? 8 : 9;
      const delayedAge = sex === 'female' ? 13 : 14;

      if (age < precociousAge && (primaryStage >= 2 || pubicStage >= 2)) {
        severity = 'high';
        riskClassification = `Alerta: Signos puberales precoces (${notation} a los ${age} años)`;
        interpretation += ` Aparición de caracteres sexuales secundarios antes de los ${precociousAge} años.`;
        guidance.push(
          'Evaluar edad ósea (Rx mano/muñeca izquierda), velocidad de crecimiento, LH/FSH basales o prueba de GnRH, estradiol/testosterona y valorar derivación a Endocrinología Pediátrica.',
        );
        secondaryResults.push({
          label: 'Evaluación cronológica',
          formattedValue: `Adelantada (< ${precociousAge} años)`,
          unit: '',
        });
      } else if (age >= delayedAge && primaryStage === 1) {
        severity = 'high';
        riskClassification = `Alerta: Posible retraso puberal (${notation} a los ${age} años)`;
        interpretation += ` Ausencia de ${sex === 'female' ? 'telarquia (B2)' : 'aumento testicular ≥ 4 mL (G2)'} a los ≥ ${delayedAge} años.`;
        guidance.push(
          'Estudiar talla/velocidad de crecimiento, edad ósea, gonadotropinas (LH/FSH), esteroides sexuales, prolactina, perfil tiroideo y antecedentes familiares (retraso constitucional vs hipogonadismo).',
        );
        secondaryResults.push({
          label: 'Evaluación cronológica',
          formattedValue: `Retrasada (≥ ${delayedAge} años sin ${primaryCode}2)`,
          unit: '',
        });
      } else {
        severity = 'normal';
        secondaryResults.push({
          label: 'Evaluación cronológica',
          formattedValue: 'Acorde con rango fisiológico esperado',
          unit: '',
        });
      }
    }

    return {
      primaryResult: {
        label: 'Estadio de Tanner',
        value: overallStage,
        formattedValue: notation,
        unit: `(máx. Estadio ${overallStage}/5)`,
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation: interpretation,
      guidance: guidance.length > 0 ? guidance : undefined,
      formulaUsed:
        sex === 'female'
          ? 'Notación de Marshall & Tanner: Mama (B1–B5) + Vello púbico (P1–P5)'
          : 'Notación de Marshall & Tanner: Genitales (G1–G5) + Vello púbico (P1–P5)',
      inputsSummary: `Sexo: ${sex === 'female' ? 'Femenino' : 'Masculino'} · ${notation}${age !== null ? ` · Edad: ${age} años` : ''}`,
    };
  },
};
