import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const populationField: SelectFieldDef = {
  id: 'population',
  label: 'Grupo etario / Regla clínica',
  type: 'select',
  defaultValue: 'adult_ccthr',
  options: [
    { value: 'adult_ccthr', label: 'Adultos ≥ 16 años (Canadian CT Head Rule)' },
    { value: 'ped_lt2', label: 'Pediatría < 2 años (Regla PECARN)' },
    { value: 'ped_ge2', label: 'Pediatría 2 – 18 años (Regla PECARN)' },
  ],
};

// Adult CCTHR (GCS 13-15, LOC/amnesia/confusion)
const ccthrGcsLt15: BooleanFieldDef = {
  id: 'ccthrGcsLt15',
  label: '[Alto riesgo] GCS < 15 a las 2 horas del traumatismo',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.population === 'adult_ccthr',
};
const ccthrOpenSkull: BooleanFieldDef = {
  id: 'ccthrOpenSkull',
  label: '[Alto riesgo] Sospecha de fractura craneal abierta o deprimida',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.population === 'adult_ccthr',
};
const ccthrBasilar: BooleanFieldDef = {
  id: 'ccthrBasilar',
  label: '[Alto riesgo] Signos de fractura de base de cráneo (ojos de mapache, Battle, otorragia, rinolicuorrea)',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.population === 'adult_ccthr',
};
const ccthrVomiting2: BooleanFieldDef = {
  id: 'ccthrVomiting2',
  label: '[Alto riesgo] ≥ 2 episodios de vómito',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.population === 'adult_ccthr',
};
const ccthrAge65: BooleanFieldDef = {
  id: 'ccthrAge65',
  label: '[Alto riesgo] Edad ≥ 65 años',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.population === 'adult_ccthr',
};
const ccthrAmnesia30: BooleanFieldDef = {
  id: 'ccthrAmnesia30',
  label: '[Riesgo medio] Amnesia retrógrada previa al impacto ≥ 30 minutos',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.population === 'adult_ccthr',
};
const ccthrDangerMech: BooleanFieldDef = {
  id: 'ccthrDangerMech',
  label: '[Riesgo medio] Mecanismo peligroso (atropello, eyección de vehículo, caída > 90 cm / 5 escalones)',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.population === 'adult_ccthr',
};

// PECARN < 2 years
const pecarnLt2Ams: BooleanFieldDef = {
  id: 'pecarnLt2Ams',
  label: '[Alto riesgo] GCS ≤ 14, agitación, somnolencia, preguntas repetitivas o respuesta lenta',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.population === 'ped_lt2',
};
const pecarnLt2PalpableFx: BooleanFieldDef = {
  id: 'pecarnLt2PalpableFx',
  label: '[Alto riesgo] Fractura craneal palpable',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.population === 'ped_lt2',
};
const pecarnLt2Hematoma: BooleanFieldDef = {
  id: 'pecarnLt2Hematoma',
  label: '[Riesgo intermedio] Hematoma subgaleal occipital, parietal o temporal',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.population === 'ped_lt2',
};
const pecarnLt2Loc5: BooleanFieldDef = {
  id: 'pecarnLt2Loc5',
  label: '[Riesgo intermedio] Pérdida de conciencia ≥ 5 segundos',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.population === 'ped_lt2',
};
const pecarnLt2Mech: BooleanFieldDef = {
  id: 'pecarnLt2Mech',
  label: '[Riesgo intermedio] Mecanismo grave (accidente vial grave, caída > 90 cm, impacto alta energía)',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.population === 'ped_lt2',
};
const pecarnLt2AbnormalParent: BooleanFieldDef = {
  id: 'pecarnLt2AbnormalParent',
  label: '[Riesgo intermedio] No actúa normalmente según sus padres/cuidadores',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.population === 'ped_lt2',
};

// PECARN >= 2 years
const pecarnGe2Ams: BooleanFieldDef = {
  id: 'pecarnGe2Ams',
  label: '[Alto riesgo] GCS ≤ 14 o signos de alteración del estado mental',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.population === 'ped_ge2',
};
const pecarnGe2Basilar: BooleanFieldDef = {
  id: 'pecarnGe2Basilar',
  label: '[Alto riesgo] Signos de fractura de base de cráneo',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.population === 'ped_ge2',
};
const pecarnGe2Loc: BooleanFieldDef = {
  id: 'pecarnGe2Loc',
  label: '[Riesgo intermedio] Cualquier pérdida de conciencia',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.population === 'ped_ge2',
};
const pecarnGe2Vomit: BooleanFieldDef = {
  id: 'pecarnGe2Vomit',
  label: '[Riesgo intermedio] Antecedente de vómitos tras el trauma',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.population === 'ped_ge2',
};
const pecarnGe2Mech: BooleanFieldDef = {
  id: 'pecarnGe2Mech',
  label: '[Riesgo intermedio] Mecanismo grave (accidente vial grave, caída > 1.5 m, objeto de alta energía)',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.population === 'ped_ge2',
};
const pecarnGe2Headache: BooleanFieldDef = {
  id: 'pecarnGe2Headache',
  label: '[Riesgo intermedio] Cefalea intensa',
  type: 'boolean',
  trueLabel: 'Sí',
  falseLabel: 'No',
  defaultValue: false,
  visibleWhen: (i) => i.population === 'ped_ge2',
};

export const minorHeadTraumaCalculator: CalculatorDefinition = {
  id: 'minor-head-trauma',
  name: 'TCE Leve — Canadian CT Head Rule (Adultos) y PECARN (Pediatría)',
  shortName: 'TCE Leve (CCTHR / PECARN)',
  primarySpecialty: 'urgencias',
  secondarySpecialties: ['pediatria', 'neurologia'],
  subcategory: 'diagnostico',
  keywords: ['tce', 'traumatismo craneoencefalico', 'canadian ct head', 'pecarn', 'tac craneo', 'conmocion'],
  description:
    'Evalúa la indicación de tomografía axial computarizada (TAC) de cráneo en traumatismo craneoencefálico leve (GCS 13–15 en adultos; GCS 14–15 en pediatría) mediante Canadian CT Head Rule y PECARN.',
  clinicalIndication:
    'Decisión clínica en urgencias para optimizar TAC craneal y evitar radiación innecesaria en TCE leve.',
  validatedPopulation: 'Adultos ≥ 16 años con GCS 13–15 + pérdida de conciencia/amnesia/confusión (CCTHR); Pediatría < 18 años con GCS 14–15 dentro de las primeras 24 h (PECARN).',
  contraindications: [
    'NO aplicar Canadian CT Head Rule en pacientes anticoagulados (warfarina/DOACs), con coagulopatía, convulsión postraumática o déficit neurológico focal (suelen requerir TAC directa).',
    'NO aplicar en TCE moderado-grave (GCS ≤ 12 en adultos o ≤ 13 en PECARN): TAC craneal inmediata.',
  ],
  limitations: [
    'En pacientes bajo terapia antiagregante o anticoagulante, la mayoría de las guías (NICE, ACEP) recomiendan TAC de cráneo independientemente de las reglas.',
    'PECARN en riesgo intermedio permite optar entre observación clínica estrecha (4–6 h) o TAC según experiencia clínica, preferencia familiar y múltiples hallazgos.',
  ],
  version: 'CCTHR (Stiell 2001) & PECARN (Kuppermann 2009)',
  references: [
    {
      citation:
        'Stiell IG, Wells GA, Vandemheen K, et al. The Canadian CT Head Rule for patients with minor head injury. Lancet. 2001;357(9266):1391-1396.',
      year: 2001,
    },
    {
      citation:
        'Kuppermann N, Holmes JF, Dayan PS, et al. Identification of children at very low risk of clinically-important brain injuries after head trauma: a prospective cohort study. Lancet. 2009;374(9696):1160-1170.',
      year: 2009,
    },
  ],
  fields: [
    populationField,
    ccthrGcsLt15,
    ccthrOpenSkull,
    ccthrBasilar,
    ccthrVomiting2,
    ccthrAge65,
    ccthrAmnesia30,
    ccthrDangerMech,
    pecarnLt2Ams,
    pecarnLt2PalpableFx,
    pecarnLt2Hematoma,
    pecarnLt2Loc5,
    pecarnLt2Mech,
    pecarnLt2AbnormalParent,
    pecarnGe2Ams,
    pecarnGe2Basilar,
    pecarnGe2Loc,
    pecarnGe2Vomit,
    pecarnGe2Mech,
    pecarnGe2Headache,
  ],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(minorHeadTraumaCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const pop = inputs.population as string;
    let highCount = 0;
    let medCount = 0;

    if (pop === 'adult_ccthr') {
      highCount =
        Number(Boolean(inputs.ccthrGcsLt15)) +
        Number(Boolean(inputs.ccthrOpenSkull)) +
        Number(Boolean(inputs.ccthrBasilar)) +
        Number(Boolean(inputs.ccthrVomiting2)) +
        Number(Boolean(inputs.ccthrAge65));
      medCount =
        Number(Boolean(inputs.ccthrAmnesia30)) + Number(Boolean(inputs.ccthrDangerMech));
    } else if (pop === 'ped_lt2') {
      highCount =
        Number(Boolean(inputs.pecarnLt2Ams)) + Number(Boolean(inputs.pecarnLt2PalpableFx));
      medCount =
        Number(Boolean(inputs.pecarnLt2Hematoma)) +
        Number(Boolean(inputs.pecarnLt2Loc5)) +
        Number(Boolean(inputs.pecarnLt2Mech)) +
        Number(Boolean(inputs.pecarnLt2AbnormalParent));
    } else {
      highCount =
        Number(Boolean(inputs.pecarnGe2Ams)) + Number(Boolean(inputs.pecarnGe2Basilar));
      medCount =
        Number(Boolean(inputs.pecarnGe2Loc)) +
        Number(Boolean(inputs.pecarnGe2Vomit)) +
        Number(Boolean(inputs.pecarnGe2Mech)) +
        Number(Boolean(inputs.pecarnGe2Headache));
    }

    let severity: SeverityLevel = 'normal';
    let primaryFormatted = 'Sin TAC';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let guidance: string[] = [];

    if (highCount > 0) {
      severity = 'high';
      primaryFormatted = 'TAC recomendada';
      riskClassification =
        pop === 'adult_ccthr'
          ? `Alto riesgo CCTHR (${highCount} criterio[s] de neurointervención)`
          : `Alto riesgo PECARN (${highCount} criterio[s] mayores — riesgo ciTBI ~4.3–4.4 %)`;
      clinicalInterpretation =
        pop === 'adult_ccthr'
          ? 'Alta probabilidad de lesión intracraneal con potencial necesidad neuroquirúrgica; TAC de cráneo simple indicada.'
          : 'Riesgo elevado de lesión cerebral traumática clínicamente importante (ciTBI); TAC de cráneo recomendada.';
      guidance = ['Realizar TAC de cráneo simple sin contraste de forma prioritaria y reevaluar estado neurológico seriado.'];
    } else if (medCount > 0) {
      severity = 'moderate';
      primaryFormatted = pop === 'adult_ccthr' ? 'TAC indicada' : 'Observación vs TAC';
      riskClassification =
        pop === 'adult_ccthr'
          ? `Riesgo medio CCTHR (${medCount} criterio[s] positivos)`
          : `Riesgo intermedio PECARN (${medCount} criterio[s] — riesgo ciTBI ~0.8–0.9 %)`;
      clinicalInterpretation =
        pop === 'adult_ccthr'
          ? 'Criterio positivo de riesgo medio en Canadian CT Head Rule: indica TAC de cráneo para descartar lesión traumática en TC.'
          : 'Riesgo intermedio (~0.9 %): se recomienda observación clínica en urgencias (4–6 h) o TAC si hay múltiples hallazgos, empeoramiento clínico o edad muy pequeña (< 3 meses).';
      guidance =
        pop === 'adult_ccthr'
          ? ['Solicitar TAC de cráneo simple; vigilar signos de alarma neurológica.']
          : ['Considerar observación clínica estrecha vs TAC craneal según número de criterios, evolución y criterio médico.'];
    } else {
      severity = 'normal';
      primaryFormatted = 'TAC NO indicada';
      riskClassification =
        pop === 'adult_ccthr'
          ? 'Bajo riesgo CCTHR (0 criterios)'
          : 'Muy bajo riesgo PECARN (0 criterios — riesgo ciTBI < 0.05 %)';
      clinicalInterpretation =
        'No cumple criterios de alto ni intermedio riesgo. El valor predictivo negativo para lesión neuroquirúrgica o ciTBI es cercano al 100 %.';
      guidance = [
        'Evitar TAC rutinaria; entregar hoja escrita de signos de alarma neurológica y pautas de reconsulta al egreso.',
      ];
    }

    return {
      primaryResult: {
        label: pop === 'adult_ccthr' ? 'Canadian CT Head Rule' : pop === 'ped_lt2' ? 'PECARN (< 2 años)' : 'PECARN (2–18 años)',
        value: highCount * 10 + medCount,
        formattedValue: primaryFormatted,
        unit: `(${highCount} alto / ${medCount} medio)`,
      },
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      guidanceDisclaimer: 'Excluir anticoagulación/coagulopatía y déficit focal antes de aplicar reglas de no imagen.',
      formulaUsed:
        pop === 'adult_ccthr'
          ? 'CCTHR: Alto riesgo (5 criterios) + Riesgo medio (2 criterios)'
          : 'PECARN: Criterios de alto riesgo (TAC) vs riesgo intermedio (Observación/TAC) vs muy bajo riesgo',
      inputsSummary: `Regla: ${pop} · Alto riesgo: ${highCount} · Riesgo medio/intermedio: ${medCount}`,
    };
  },
};
