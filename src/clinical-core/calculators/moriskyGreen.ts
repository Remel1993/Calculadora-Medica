import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const q1Field: SelectFieldDef = {
  id: 'q1',
  label: '1. ¿Olvida alguna vez tomar los medicamentos para tratar su enfermedad?',
  type: 'select',
  defaultValue: 'adherent',
  options: [
    { value: 'adherent', label: 'No (cumplidor)', points: 1 },
    { value: 'non_adherent', label: 'Sí (olvido ocasional/frecuente)', points: 0 },
  ],
};

const q2Field: SelectFieldDef = {
  id: 'q2',
  label: '2. ¿Toma los medicamentos a las horas indicadas?',
  helpText: 'En el cuestionario validado en español (Val Jiménez), responder "Sí" refleja adherencia horaria.',
  type: 'select',
  defaultValue: 'adherent',
  options: [
    { value: 'adherent', label: 'Sí, a las horas indicadas (cumplidor)', points: 1 },
    { value: 'non_adherent', label: 'No, con descuido o fuera de horario', points: 0 },
  ],
};

const q3Field: SelectFieldDef = {
  id: 'q3',
  label: '3. Cuando se encuentra bien, ¿deja de tomar la medicación?',
  type: 'select',
  defaultValue: 'adherent',
  options: [
    { value: 'adherent', label: 'No (mantiene tratamiento)', points: 1 },
    { value: 'non_adherent', label: 'Sí (suspende al sentirse bien)', points: 0 },
  ],
};

const q4Field: SelectFieldDef = {
  id: 'q4',
  label: '4. Si alguna vez le sienta mal, ¿deja usted de tomarla?',
  type: 'select',
  defaultValue: 'adherent',
  options: [
    { value: 'adherent', label: 'No (consulta o continúa)', points: 1 },
    { value: 'non_adherent', label: 'Sí (suspende por efectos adversos)', points: 0 },
  ],
};

export const moriskyGreenCalculator: CalculatorDefinition = {
  id: 'morisky-green',
  name: 'Test de Morisky-Green (Adherencia Terapéutica — MMAS-4)',
  shortName: 'Morisky-Green',
  primarySpecialty: 'medicina-interna',
  secondarySpecialties: ['cardiologia', 'endocrinologia', 'geriatria'],
  subcategory: 'diagnostico',
  keywords: [
    'morisky',
    'morisky-green',
    'mmas-4',
    'adherencia',
    'cumplimiento',
    'tratamiento',
    'hta',
    'diabetes',
  ],
  description:
    'Cuestionario clínico breve de 4 preguntas (0–4 puntos) para detectar falta de adherencia terapéutica (no intencionada por olvido o intencionada por mejoría/efectos adversos).',
  clinicalIndication:
    'Control de enfermedades crónicas (hipertensión arterial, diabetes, dislipidemia, EPOC, insuficiencia cardíaca) especialmente ante mal control terapéutico antes de escalar dosis.',
  validatedPopulation: 'Adultos en tratamiento farmacológico crónico (Morisky et al., 1986; validación española Val Jiménez et al., 1992).',
  contraindications: [
    'No mide niveles plasmáticos ni recuento de comprimidos; puede sobreestimar la adherencia por sesgo de deseabilidad social si no se pregunta de forma empática.',
  ],
  limitations: [
    'Evalúa adherencia global autorreportada; si el paciente falla en los ítems 1–2 predomina el olvido (adherencia no intencionada), mientras que fallar en 3–4 sugiere abandono intencionado.',
  ],
  version: 'Morisky, Green & Levine (1986) / Val Jiménez (1992)',
  references: [
    {
      citation:
        'Morisky DE, Green LW, Levine DM. Concurrent and predictive validity of a self-reported measure of medication adherence. Med Care. 1986;24(1):67-74.',
      year: 1986,
    },
    {
      citation:
        'Val Jiménez A, Amorós Ballestero G, Martínez Visa P, Fernández Ferré ML, León Sanromà M. Estudio descriptivo del cumplimiento del tratamiento farmacológico antihipertensivo y validación del test de Morisky y Green. Aten Primaria. 1992;10(5):767-770.',
      year: 1992,
    },
  ],
  fields: [q1Field, q2Field, q3Field, q4Field],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(moriskyGreenCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const q1Ok = inputs.q1 === 'adherent';
    const q2Ok = inputs.q2 === 'adherent';
    const q3Ok = inputs.q3 === 'adherent';
    const q4Ok = inputs.q4 === 'adherent';

    const adherentCount = [q1Ok, q2Ok, q3Ok, q4Ok].filter(Boolean).length;
    const isCompliant = adherentCount === 4;

    const unintentionalIssues = (!q1Ok ? 1 : 0) + (!q2Ok ? 1 : 0);
    const intentionalIssues = (!q3Ok ? 1 : 0) + (!q4Ok ? 1 : 0);

    let pattern = 'Sin barreras detectadas';
    if (unintentionalIssues > 0 && intentionalIssues > 0) {
      pattern = 'Falta de adherencia mixta (olvidos/horario + suspensión voluntaria)';
    } else if (unintentionalIssues > 0) {
      pattern = 'Predominio no intencionado (olvidos / horarios)';
    } else if (intentionalIssues > 0) {
      pattern = 'Predominio intencionado (abandono por mejoría o efectos adversos)';
    }

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let interpretation = '';
    const guidance: string[] = [];

    if (isCompliant) {
      severity = 'normal';
      riskClassification = 'Cumplidor / Buena adherencia (4 / 4 respuestas adherentes)';
      interpretation =
        'El paciente responde correctamente a las 4 preguntas del test de Morisky-Green (0 conductas de incumplimiento declaradas).';
    } else if (adherentCount >= 2) {
      severity = 'moderate';
      riskClassification = `No cumplidor — Adherencia parcial/media (${adherentCount} / 4 respuestas adherentes)`;
      interpretation =
        'Según el criterio clásico de Morisky-Green / Val Jiménez, fallar ≥ 1 ítem clasifica al paciente como no adherente.';
    } else {
      severity = 'high';
      riskClassification = `No cumplidor — Baja adherencia (${adherentCount} / 4 respuestas adherentes)`;
      interpretation =
        'Múltiples barreras de adherencia que explican posible fracaso terapéutico o control subóptimo.';
    }

    if (!isCompliant) {
      if (unintentionalIssues > 0) {
        guidance.push('Para olvidos/horarios: simplificar pauta (combinaciones a dosis fija, tomas diarias), usar pastillero semanal o alarmas.');
      }
      if (intentionalIssues > 0) {
        guidance.push('Para abandono intencionado: reforzar educación sobre enfermedad crónica asintomática y revisar posibles efectos adversos para ajustar fármaco.');
      }
    }

    return {
      primaryResult: {
        label: 'Puntuación Morisky-Green',
        value: adherentCount,
        formattedValue: isCompliant ? 'Cumplidor (4/4)' : `No cumplidor (${adherentCount}/4)`,
        unit: '',
      },
      secondaryResults: [
        {
          label: 'Respuestas adherentes',
          formattedValue: `${adherentCount} de 4`,
          unit: '',
        },
        {
          label: 'Patrón identificado',
          formattedValue: pattern,
          unit: '',
        },
      ],
      severity,
      riskClassification,
      clinicalInterpretation: interpretation,
      guidance: guidance.length > 0 ? guidance : undefined,
      formulaUsed: 'Criterio Morisky-Green: 4/4 respuestas adherentes (No / Sí / No / No) = Cumplidor; ≤ 3/4 = No cumplidor',
      inputsSummary: `Morisky-Green: ${adherentCount}/4 ítems adherentes (${isCompliant ? 'Cumplidor' : 'No cumplidor'})`,
    };
  },
};
