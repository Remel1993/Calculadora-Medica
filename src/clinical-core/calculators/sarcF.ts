import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const strengthField: SelectFieldDef = {
  id: 'strength',
  label: 'S · Fuerza: ¿Qué tanta dificultad tiene para levantar o cargar 4.5 kg (10 lb)?',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 · Ninguna', points: 0 },
    { value: '1', label: '1 · Alguna dificultad', points: 1 },
    { value: '2', label: '2 · Mucha dificultad o incapaz de hacerlo', points: 2 },
  ],
};

const assistanceField: SelectFieldDef = {
  id: 'assistance',
  label: 'A · Asistencia para caminar: ¿Qué tanta dificultad tiene para cruzar una habitación caminando?',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 · Ninguna', points: 0 },
    { value: '1', label: '1 · Alguna dificultad', points: 1 },
    { value: '2', label: '2 · Mucha dificultad, requiere apoyo (bastón/persona) o incapaz', points: 2 },
  ],
};

const riseChairField: SelectFieldDef = {
  id: 'riseChair',
  label: 'R · Levantarse de una silla: ¿Qué tanta dificultad tiene para levantarse de una silla o cama?',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 · Ninguna', points: 0 },
    { value: '1', label: '1 · Alguna dificultad', points: 1 },
    { value: '2', label: '2 · Mucha dificultad o incapaz sin ayuda', points: 2 },
  ],
};

const climbStairsField: SelectFieldDef = {
  id: 'climbStairs',
  label: 'C · Subir escaleras: ¿Qué tanta dificultad tiene para subir un tramo de 10 escalones?',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 · Ninguna', points: 0 },
    { value: '1', label: '1 · Alguna dificultad', points: 1 },
    { value: '2', label: '2 · Mucha dificultad o incapaz', points: 2 },
  ],
};

const fallsField: SelectFieldDef = {
  id: 'falls',
  label: 'F · Caídas: ¿Cuántas veces se ha caído en el último año?',
  type: 'select',
  defaultValue: '0',
  options: [
    { value: '0', label: '0 · Ninguna caída', points: 0 },
    { value: '1', label: '1 · De 1 a 3 caídas', points: 1 },
    { value: '2', label: '2 · 4 o más caídas', points: 2 },
  ],
};

export const sarcFCalculator: CalculatorDefinition = {
  id: 'sarc-f',
  name: 'SARC-F — Cribado Rápido de Sarcopenia (EWGSOP2)',
  shortName: 'SARC-F (Sarcopenia)',
  primarySpecialty: 'geriatria',
  secondarySpecialties: ['medicina-interna'],
  subcategory: 'diagnostico',
  keywords: [
    'sarc-f',
    'sarcf',
    'sarcopenia',
    'masa muscular',
    'fuerza',
    'caidas',
    'ewgsop2',
    'geriatria',
  ],
  description:
    'Cuestionario de 5 preguntas (0 a 10 puntos) recomendado por el consenso europeo EWGSOP2 para el cribado rápido de sarcopenia en consulta externa.',
  clinicalIndication:
    'Tamizaje inicial en adultos mayores o pacientes con enfermedades crónicas debilitantes para identificar quién requiere medición de fuerza muscular (dinamometría / levantarse de la silla).',
  validatedPopulation: 'Adultos mayores de 65 años en atención primaria, geriatría y comunidad.',
  contraindications: [
    'Un resultado positivo es un cribado y NO confirma el diagnóstico sin demostrar baja fuerza y/o baja masa muscular (EWGSOP2).',
  ],
  limitations: [
    'Tiene muy alta especificidad (> 90%) pero sensibilidad moderada-baja (~25–50%): un SARC-F < 4 no descarta completamente sarcopenia temprana si hay sospecha clínica clara.',
  ],
  version: 'Malmstrom & Morley (2013) · Consenso EWGSOP2 (2019)',
  references: [
    {
      citation:
        'Malmstrom TK, Morley JE. SARC-F: a simple questionnaire to rapidly diagnose sarcopenia. J Am Med Dir Assoc. 2013;14(8):531-532.',
      year: 2013,
    },
    {
      citation:
        'Cruz-Jentoft AJ, Bahat G, Bauer J, et al. Sarcopenia: revised European consensus on definition and diagnosis (EWGSOP2). Age Ageing. 2019;48(1):16-31.',
      year: 2019,
    },
  ],
  fields: [strengthField, assistanceField, riseChairField, climbStairsField, fallsField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(sarcFCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const total =
      Number(inputs.strength) +
      Number(inputs.assistance) +
      Number(inputs.riseChair) +
      Number(inputs.climbStairs) +
      Number(inputs.falls);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (total < 4) {
      severity = total === 0 ? 'normal' : 'low';
      riskClassification = `Cribado SARC-F negativo (< 4 pts · Total ${total}/10)`;
      clinicalInterpretation =
        'Baja probabilidad clínica de sarcopenia moderada-grave en el cribado inicial.';
      guidance.push(
        'Fomentar ejercicio de resistencia muscular y consumo proteico adecuado; realizar pruebas funcionales (fuerza de prensión o test de 5 levantamientos de silla) si existe sospecha clínica pese a SARC-F < 4.',
      );
    } else {
      severity = total >= 7 ? 'critical' : 'high';
      riskClassification = `Cribado SARC-F positivo — Sospecha de sarcopenia (≥ 4 pts · Total ${total}/10)`;
      clinicalInterpretation =
        'Cribado positivo según algoritmo EWGSOP2; se asocia fuertemente a baja fuerza muscular, limitación funcional y mayor riesgo de caídas y hospitalización.';
      guidance.push(
        'Confirmar probable sarcopenia midiendo fuerza muscular (dinamometría de mano < 27 kg varones / < 16 kg mujeres, o prueba de 5 levantamientos de silla > 15 s).',
        'Prescribir ejercicio multicomponente con énfasis en fuerza progresiva, evaluar nutrición proteica (MNA-SF) y vitamina D si hay deficiencia.',
      );
    }

    return {
      primaryResult: {
        label: 'SARC-F Total',
        value: total,
        formattedValue: `${total} / 10`,
        unit: 'puntos',
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'SARC-F = S + A + R + C + F (cada ítem de 0 a 2 pts; corte ≥ 4)',
      inputsSummary: `SARC-F ${total}/10 pts`,
    };
  },
};
