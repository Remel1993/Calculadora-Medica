import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SeverityLevel,
} from '../types/clinical.ts';

const swellingField: BooleanFieldDef = {
  id: 'swelling',
  label: '1. Inflamación o edema testicular (+2)',
  type: 'boolean',
  trueLabel: 'Sí (+2)',
  falseLabel: 'No (0)',
  defaultValue: false,
};

const hardTestisField: BooleanFieldDef = {
  id: 'hardTesticle',
  label: '2. Testículo duro a la palpación (+2)',
  type: 'boolean',
  trueLabel: 'Sí (+2)',
  falseLabel: 'No (0)',
  defaultValue: false,
};

const absentCremasterField: BooleanFieldDef = {
  id: 'absentCremaster',
  label: '3. Reflejo cremastérico ausente (+1)',
  type: 'boolean',
  trueLabel: 'Ausente (+1)',
  falseLabel: 'Presente (0)',
  defaultValue: false,
};

const nauseaField: BooleanFieldDef = {
  id: 'nauseaVomiting',
  label: '4. Náuseas o vómitos (+1)',
  type: 'boolean',
  trueLabel: 'Sí (+1)',
  falseLabel: 'No (0)',
  defaultValue: false,
};

const highRidingField: BooleanFieldDef = {
  id: 'highRiding',
  label: '5. Testículo ascendido / en posición alta (+1)',
  type: 'boolean',
  trueLabel: 'Sí (+1)',
  falseLabel: 'No (0)',
  defaultValue: false,
};

export const twistScoreCalculator: CalculatorDefinition = {
  id: 'twist-score',
  name: 'TWIST Score (Escroto Agudo / Sospecha de Torsión Testicular)',
  shortName: 'TWIST Score',
  primarySpecialty: 'urologia',
  secondarySpecialties: ['urgencias', 'pediatria'],
  subcategory: 'diagnostico',
  keywords: ['twist', 'escroto agudo', 'torsion testicular', 'urologia', 'testiculo', 'doppler'],
  description:
    'Escala clínica de 5 criterios (0–7 puntos) para estratificar la probabilidad de torsión testicular en el síndrome escrotal agudo sin depender inicialmente de pruebas de imagen.',
  clinicalIndication:
    'Evaluación urgente en niños, adolescentes y adultos jóvenes con dolor escrotal agudo.',
  validatedPopulation: 'Pacientes pediátricos, adolescentes y varones adultos jóvenes (validación original de 3 meses a 18 años, ampliada hasta adultos jóvenes).',
  contraindications: [
    'No utilizar para retrasar la exploración quirúrgica cuando la sospecha clínica es alta y el tiempo de isquemia se acerca a las 4–6 horas.',
  ],
  limitations: [
    'En neonatos o pacientes con exploración escrotal dudosa o dolor intenso de inicio súbito, una puntuación baja no excluye al 100 % torsión intermitente o temprana si la sospecha clínica persiste.',
  ],
  version: 'Barbosa et al. (J Urol, 2013)',
  references: [
    {
      citation:
        'Barbosa JA, Tiseo BC, Barayan GA, et al. Development and initial validation of a scoring system to diagnose testicular torsion in children. J Urol. 2013;189(5):1859-1864.',
      year: 2013,
    },
  ],
  fields: [swellingField, hardTestisField, absentCremasterField, nauseaField, highRidingField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(twistScoreCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const score =
      (inputs.swelling ? 2 : 0) +
      (inputs.hardTesticle ? 2 : 0) +
      (inputs.absentCremaster ? 1 : 0) +
      (inputs.nauseaVomiting ? 1 : 0) +
      (inputs.highRiding ? 1 : 0);

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (score <= 2) {
      severity = 'low';
      riskClassification = `Bajo riesgo de torsión testicular (TWIST ${score} / 7)`;
      clinicalInterpretation =
        'En las cohortes de validación, una puntuación 0–2 presenta valor predictivo negativo muy alto (~100 % en validación pediátrica inicial) para torsión testicular.';
      guidance = [
        'Evaluar diagnósticos diferenciales (epididimitis/orquiepididimitis, torsión de hidátide de Morgagni, hidrocele, trauma) y solicitar Doppler si persiste duda clínica.',
      ];
    } else if (score <= 4) {
      severity = 'moderate';
      riskClassification = `Riesgo intermedio (TWIST ${score} / 7)`;
      clinicalInterpretation = 'Riesgo intermedio de torsión testicular; requiere estudio de imagen urgente sin demora.';
      guidance = [
        'Solicitar ecografía Doppler escrotal de urgencia y mantener ayuno/valoración paralela por Urología o Cirugía Pediátrica.',
      ];
    } else {
      severity = 'critical';
      riskClassification = `Alto riesgo de torsión testicular (TWIST ${score} / 7 ≥ 5)`;
      clinicalInterpretation =
        'Valor predictivo positivo muy elevado para torsión testicular; ventana crítica de viabilidad testicular (~6 horas desde inicio del dolor).';
      guidance = [
        'EMERGENCIA QUIRÚRGICA: Interconsulta inmediata a Urología / Cirugía para exploración escrotal urgente; no retrasar cirugía esperando ecografía Doppler si no es inmediata.',
      ];
    }

    return {
      primaryResult: {
        label: 'Puntuación TWIST',
        value: score,
        formattedValue: String(score),
        unit: 'puntos (de 7)',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'En torsión testicular el tiempo es tejido ("time is testicle"); priorizar exploración ante alta sospecha.',
      formulaUsed: 'Edema (+2) + Testículo duro (+2) + Reflejo cremastérico ausente (+1) + Náusea/vómito (+1) + Testículo alto (+1)',
      inputsSummary: `TWIST: ${score}/7 (Edema:${inputs.swelling ? 2 : 0}, Duro:${inputs.hardTesticle ? 2 : 0}, Cremáster:${inputs.absentCremaster ? 1 : 0}, Náusea:${inputs.nauseaVomiting ? 1 : 0}, Alto:${inputs.highRiding ? 1 : 0})`,
    };
  },
};
