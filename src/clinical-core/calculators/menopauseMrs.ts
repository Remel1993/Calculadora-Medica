import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SecondaryResultItem,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

function mrsSelect(id: string, label: string): SelectFieldDef {
  return {
    id,
    label,
    type: 'select',
    defaultValue: '0',
    options: [
      { value: '0', label: '0 · Ninguno', points: 0 },
      { value: '1', label: '1 · Leve', points: 1 },
      { value: '2', label: '2 · Moderado', points: 2 },
      { value: '3', label: '3 · Grave', points: 3 },
      { value: '4', label: '4 · Muy grave', points: 4 },
    ],
  };
}

// Somatic subscale (4 items: 1, 2, 3, 11 -> max 16)
const item1 = mrsSelect('m1', '1. Sofocos, bochornos o episodios de sudoración (Somático)');
const item2 = mrsSelect('m2', '2. Molestias cardíacas: palpitaciones, opresión o latidos rápidos (Somático)');
const item3 = mrsSelect('m3', '3. Problemas del sueño: dificultad para dormir, despertar frecuente o precoz (Somático)');
const item11 = mrsSelect('m11', '11. Molestias musculares y articulares (Somático)');

// Psychological subscale (4 items: 4, 5, 6, 7 -> max 16)
const item4 = mrsSelect('m4', '4. Estado de ánimo depresivo, tristeza o llanto fácil (Psicológico)');
const item5 = mrsSelect('m5', '5. Irritabilidad, nerviosismo o tensión interna (Psicológico)');
const item6 = mrsSelect('m6', '6. Ansiedad, inquietud o sensación de pánico (Psicológico)');
const item7 = mrsSelect('m7', '7. Agotamiento físico y mental, disminución de rendimiento o memoria (Psicológico)');

// Urogenital subscale (3 items: 8, 9, 10 -> max 12)
const item8 = mrsSelect('m8', '8. Problemas sexuales: disminución del deseo, actividad o satisfacción (Urogenital)');
const item9 = mrsSelect('m9', '9. Problemas urinarios: urgencia, disuria o escapes (Urogenital)');
const item10 = mrsSelect('m10', '10. Sequedad vaginal o molestias/dolor durante las relaciones (Urogenital)');

export const menopauseMrsCalculator: CalculatorDefinition = {
  id: 'menopause-mrs',
  name: 'MRS — Menopause Rating Scale (Síndrome Climatérico)',
  shortName: 'MRS (Menopausia)',
  primarySpecialty: 'gineco-obstetricia',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'gravedad',
  keywords: [
    'mrs',
    'menopausia',
    'climaterio',
    'sofocos',
    'bochornos',
    'calidad de vida',
    'ginecologia',
    'consulta externa',
  ],
  description:
    'Evalúa la gravedad de 11 síntomas climatéricos (0 a 44 puntos) divididos en tres dominios: somático-vegetativo, psicológico y urogenital.',
  clinicalIndication:
    'Consulta externa de ginecología y medicina familiar para cuantificar el impacto del síndrome climatérico/perimenopausia y monitorizar respuesta a terapia hormonal o no hormonal.',
  validatedPopulation: 'Mujeres en perimenopausia y posmenopausia (validación internacional incluyendo español).',
  contraindications: [
    'No evalúa contraindicaciones médicas para terapia hormonal de la menopausia (antecedente de cáncer hormono-dependiente, TEV, hepatopatía activa o sangrado uterino no estudiado).',
  ],
  limitations: [
    'Los síntomas depresivos o genitourinarios graves merecen evaluación clínica individual adicional (PHQ-9, urocultivo, examen ginecológico).',
  ],
  version: 'Heinemann et al. (2003 / 2004)',
  references: [
    {
      citation:
        'Heinemann LAJ, DoMinh T, Strelow F, Gerbsch S, Schnitker J, Schneider HPG. The Menopause Rating Scale (MRS) as outcome measure for hormone treatment? A validation study. Health Qual Life Outcomes. 2004;2:67.',
      year: 2004,
    },
    {
      citation:
        'Heinemann LAJ, Potthoff P, Schneider HPG. International versions of the Menopause Rating Scale (MRS). Health Qual Life Outcomes. 2003;1:28.',
      year: 2003,
    },
  ],
  fields: [item1, item2, item3, item4, item5, item6, item7, item8, item9, item10, item11],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(menopauseMrsCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const somatic = Number(inputs.m1) + Number(inputs.m2) + Number(inputs.m3) + Number(inputs.m11);
    const psychological = Number(inputs.m4) + Number(inputs.m5) + Number(inputs.m6) + Number(inputs.m7);
    const urogenital = Number(inputs.m8) + Number(inputs.m9) + Number(inputs.m10);
    const total = somatic + psychological + urogenital;

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (total <= 4) {
      severity = 'normal';
      riskClassification = 'Síntomas ausentes o mínimos (0–4 puntos)';
      clinicalInterpretation = 'Sin impacto relevante de síntomas climatéricos en la calidad de vida.';
      guidance.push('Promover estilo de vida saludable, salud ósea y cribados preventivos propios de la edad.');
    } else if (total <= 8) {
      severity = 'low';
      riskClassification = 'Síndrome climatérico leve (5–8 puntos)';
      clinicalInterpretation = 'Carga sintomática leve; suele responder a medidas conductuales y tratamientos locales si hay sequedad vaginal.';
      guidance.push('Identificar el dominio predominante (somático, psicológico o urogenital) para medidas dirigidas (p. ej. hidratantes/estrógenos locales si urogenital).');
    } else if (total <= 15) {
      severity = 'moderate';
      riskClassification = 'Síndrome climatérico moderado (9–15 puntos)';
      clinicalInterpretation = 'Afectación moderada de la calidad de vida que justifica abordar opciones terapéuticas específicas.';
      guidance.push(
        'Valorar preferencias de la paciente y perfil de riesgo-beneficio para terapia hormonal de la menopausia, alternativas no hormonales para síntomas vasomotores o terapia local genitourinaria.',
      );
    } else {
      severity = total >= 24 ? 'critical' : 'high';
      riskClassification = `Síndrome climatérico grave / severo (≥ 16 puntos · Total ${total}/44)`;
      clinicalInterpretation =
        'Carga sintomática intensa con deterioro sustancial del bienestar físico, emocional o urogenital.';
      guidance.push(
        'Evaluación ginecológica integral para tratamiento dirigido (descartando patología tiroidea, anemia o trastorno depresivo concomitante si el dominio psicológico es muy alto) y reevaluación con MRS a las 8–12 semanas.',
      );
    }

    const secondaryResults: SecondaryResultItem[] = [
      { label: 'Dominio somático-vegetativo', formattedValue: `${somatic} / 16`, unit: 'pts' },
      { label: 'Dominio psicológico', formattedValue: `${psychological} / 16`, unit: 'pts' },
      { label: 'Dominio urogenital', formattedValue: `${urogenital} / 12`, unit: 'pts' },
    ];

    return {
      primaryResult: {
        label: 'MRS Total',
        value: total,
        formattedValue: `${total} / 44`,
        unit: 'puntos',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'MRS = Somático (ítems 1–3,11) + Psicológico (4–7) + Urogenital (8–10)',
      inputsSummary: `MRS ${total}/44 (Som ${somatic}/16 · Psiq ${psychological}/16 · Urog ${urogenital}/12)`,
    };
  },
};
