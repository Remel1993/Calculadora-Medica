import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SecondaryResultItem,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const woundGradeField: SelectFieldDef = {
  id: 'woundGrade',
  label: 'Características de la herida y lesión ósea',
  type: 'select',
  defaultValue: '1',
  options: [
    {
      value: '1',
      label: 'Tipo I · Herida limpia < 1 cm, traumatismo de baja energía y conminución mínima',
      description: 'Mecanismo de dentro hacia afuera habitual; escasa lesión de partes blandas.',
    },
    {
      value: '2',
      label: 'Tipo II · Herida > 1 cm (generalmente 1–10 cm) sin daño extenso de partes blandas ni colgajos',
      description: 'Contaminación moderada y conminución leve-moderada sin pérdida de cobertura.',
    },
    {
      value: '3a',
      label: 'Tipo IIIA · Alta energía o > 10 cm, con cobertura ósea adecuada de partes blandas',
      description: 'Laceración extensa, colgajos o alta conminución pero permite cierre/cobertura local.',
    },
    {
      value: '3b',
      label: 'Tipo IIIB · Pérdida extensa de partes blandas con despegamiento perióstico y hueso expuesto',
      description: 'Contaminación masiva; suele requerir colgajo rotacional o libre para cobertura.',
    },
    {
      value: '3c',
      label: 'Tipo IIIC · Fractura abierta con lesión arterial mayor que requiere reparación vascular',
      description: 'Independientemente del tamaño cutáneo, compromete la viabilidad distal del miembro.',
    },
  ],
};

const specialContaminationField: BooleanFieldDef = {
  id: 'specialContamination',
  label: '¿Ambiente agrícola/tierra, agua estancada, arma de fuego o fractura segmentaria?',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Sí (→ Tipo III)',
  falseLabel: 'No',
  helpText:
    'Según Gustilo (1984), estos escenarios se clasifican automáticamente como mínimo Tipo III por alta energía o contaminación polimicrobiana/anaerobia.',
};

export const gustiloAndersonCalculator: CalculatorDefinition = {
  id: 'gustilo-anderson',
  name: 'Clasificación de Gustilo-Anderson de Fracturas Abiertas',
  shortName: 'Gustilo-Anderson',
  primarySpecialty: 'traumatologia',
  secondarySpecialties: ['urgencias', 'cirugia-general'],
  subcategory: 'gravedad',
  keywords: [
    'gustilo',
    'anderson',
    'fractura abierta',
    'fractura expuesta',
    'traumatologia',
    'ortopedia',
    'infeccion',
    'antibiotico',
  ],
  description:
    'Clasifica las fracturas abiertas (I, II, IIIA, IIIB, IIIC) según extensión de partes blandas, energía, contaminación y compromiso vascular.',
  clinicalIndication:
    'Evaluación inicial en urgencias y quirófano de toda fractura expuesta para estratificar riesgo de infección y orientar profilaxis antibiótica y reconstrucción ortoplástica.',
  validatedPopulation: 'Pacientes pediátricos y adultos con fracturas abiertas de extremidades.',
  contraindications: [
    'La clasificación definitiva debe establecerse DESPUÉS del desbridamiento quirúrgico en quirófano, no solo por la herida superficial en urgencias.',
  ],
  limitations: [
    'Presenta variabilidad interobservador moderada (~60%); heridas cutáneas pequeñas pueden ocultar un despegamiento profundo Tipo III.',
    'La elección exacta del esquema antimicrobiano y duración (24–72 h) debe adaptarse a alergias, función renal y protocolo local de infectología.',
  ],
  version: 'Gustilo & Anderson (1976) · Revisión Gustilo, Mendoza & Williams (1984)',
  references: [
    {
      citation:
        'Gustilo RB, Anderson JT. Prevention of infection in the treatment of one thousand and twenty-five open fractures of long bones: retrospective and prospective analyses. J Bone Joint Surg Am. 1976;58(4):453-458.',
      year: 1976,
    },
    {
      citation:
        'Gustilo RB, Mendoza RM, Williams DN. Problems in the management of type III (severe) open fractures: a new classification of type III open fractures. J Trauma. 1984;24(8):742-746.',
      year: 1984,
    },
  ],
  fields: [woundGradeField, specialContaminationField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(gustiloAndersonCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const rawGrade = String(inputs.woundGrade);
    const specialContam = Boolean(inputs.specialContamination);

    // Special contamination / high-energy mechanism upgrades I or II to at least IIIA
    const effectiveGrade =
      specialContam && (rawGrade === '1' || rawGrade === '2') ? '3a' : rawGrade;

    let label = 'Tipo I';
    let numericGrade = 1;
    let infectionRisk = '0–2%';
    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [
      'Administrar profilaxis antibiótica IV lo antes posible (idealmente < 1–3 h del traumatismo) y verificar inmunización antitetánica.',
      'Cubrir con apósito estéril humedecido en suero fisiológico, inmovilizar y evitar exploraciones o lavados repetidos no estériles en box.',
    ];

    if (effectiveGrade === '1') {
      label = 'Tipo I';
      numericGrade = 1;
      infectionRisk = '0–2%';
      severity = 'low';
      riskClassification = 'Fractura abierta Tipo I (baja energía)';
      clinicalInterpretation =
        'Lesión cutánea limpia < 1 cm con mínimo daño de partes blandas y bajo riesgo infeccioso tras lavado y desbridamiento quirúrgico.';
      guidance.push('Cobertura antimicrobiana habitual frente a Gram positivos (p. ej. cefazolina).');
    } else if (effectiveGrade === '2') {
      label = 'Tipo II';
      numericGrade = 2;
      infectionRisk = '2–7%';
      severity = 'moderate';
      riskClassification = 'Fractura abierta Tipo II (daño moderado)';
      clinicalInterpretation =
        'Laceración > 1 cm con lesión moderada de partes blandas sin despegamiento perióstico extenso ni pérdida de cobertura.';
      guidance.push('Cobertura frente a Gram positivos (cefazolina); ampliar según hallazgos en desbridamiento.');
    } else if (effectiveGrade === '3a') {
      label = 'Tipo IIIA';
      numericGrade = 3;
      infectionRisk = '7–10%';
      severity = 'high';
      riskClassification = 'Fractura abierta Tipo IIIA (alta energía / contaminación, con cobertura)';
      clinicalInterpretation =
        specialContam && (rawGrade === '1' || rawGrade === '2')
          ? 'Reclasificada a Tipo IIIA por contaminación agrícola/agua, arma de fuego o trazo segmentario pese a herida cutánea menor.'
          : 'Traumatismo de alta energía o herida > 10 cm que conserva suficiente tejido blando para cubrir el foco óseo.';
      guidance.push(
        'Cobertura antimicrobiana ampliada (Gram positivos + Gram negativos); añadir cobertura antianaerobia (p. ej. penicilina/piperacilina-tazobactam o metronidazol) si hubo contaminación por tierra o granja.',
      );
    } else if (effectiveGrade === '3b') {
      label = 'Tipo IIIB';
      numericGrade = 4;
      infectionRisk = '10–50%';
      severity = 'critical';
      riskClassification = 'Fractura abierta Tipo IIIB (exposición ósea sin cobertura)';
      clinicalInterpretation =
        'Pérdida extensa de partes blandas, despegamiento perióstico y exposición ósea; elevado riesgo de osteomielitis y pseudoartrosis.';
      guidance.push(
        'Requiere manejo ortoplástico conjunto precoz para desbridamiento seriado y cobertura con colgajo (local o libre), además de cobertura antibiótica de amplio espectro.',
      );
    } else {
      label = 'Tipo IIIC';
      numericGrade = 5;
      infectionRisk = '25–50% (+ riesgo de amputación)';
      severity = 'critical';
      riskClassification = 'Fractura abierta Tipo IIIC (lesión arterial reparable)';
      clinicalInterpretation =
        'Emergencia quirúrgica ortopédica y vascular: cualquier fractura abierta asociada a lesión arterial que compromete la perfusión distal.';
      guidance.push(
        'Activación inmediata de Cirugía Vascular y Traumatología para revascularización urgente (< 6 horas) y estabilización ósea (habitualmente fijación externa).',
      );
    }

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Riesgo histórico de infección',
        formattedValue: infectionRisk,
        unit: '',
      },
      {
        label: 'Cobertura antibiótica empírica',
        formattedValue: numericGrade >= 3 ? 'Gram+ y Gram− (+ anaerobios si tierra)' : 'Gram+',
        unit: '',
      },
    ];

    return {
      primaryResult: {
        label: 'Grado Gustilo-Anderson',
        value: numericGrade,
        formattedValue: label,
        unit: '',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'Clasificación morfológica tras desbridamiento de Gustilo-Anderson (I, II, IIIA, IIIB, IIIC)',
      inputsSummary: `${label}${specialContam ? ' (con contaminación especial)' : ''}`,
    };
  },
};
