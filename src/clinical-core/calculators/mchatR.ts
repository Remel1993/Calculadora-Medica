import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SecondaryResultItem,
  SeverityLevel,
} from '../types/clinical.ts';

// M-CHAT-R (Robins et al. 2014): 20 items; items 2, 5, 12 are reverse-scored (Yes = 1 pt risk)
const mchatItems: Array<BooleanFieldDef & { riskOnTrue: boolean }> = [
  { id: 'm1', label: '1. Si usted señala algo al otro lado de la habitación, ¿su hijo/a lo mira?', type: 'boolean', defaultValue: true, trueLabel: 'Sí (0)', falseLabel: 'No (+1)', riskOnTrue: false },
  { id: 'm2', label: '2. ¿Se ha preguntado alguna vez si su hijo/a pudiera estar sordo/a? (Invertido)', type: 'boolean', defaultValue: false, trueLabel: 'Sí (+1)', falseLabel: 'No (0)', riskOnTrue: true },
  { id: 'm3', label: '3. ¿Su hijo/a juega a simular o hacer juego simbólico (ej. beber de taza vacía, dar de comer a muñeco)?', type: 'boolean', defaultValue: true, trueLabel: 'Sí (0)', falseLabel: 'No (+1)', riskOnTrue: false },
  { id: 'm4', label: '4. ¿A su hijo/a le gusta treparse a las cosas (muebles, escaleras, juegos)?', type: 'boolean', defaultValue: true, trueLabel: 'Sí (0)', falseLabel: 'No (+1)', riskOnTrue: false },
  { id: 'm5', label: '5. ¿Su hijo/a hace movimientos inusuales con los dedos cerca de sus ojos? (Invertido)', type: 'boolean', defaultValue: false, trueLabel: 'Sí (+1)', falseLabel: 'No (0)', riskOnTrue: true },
  { id: 'm6', label: '6. ¿Su hijo/a señala con un dedo para pedir algo o conseguir ayuda?', type: 'boolean', defaultValue: true, trueLabel: 'Sí (0)', falseLabel: 'No (+1)', riskOnTrue: false },
  { id: 'm7', label: '7. ¿Su hijo/a señala con un dedo para mostrarle algo interesante (sin pedirlo)?', type: 'boolean', defaultValue: true, trueLabel: 'Sí (0)', falseLabel: 'No (+1)', riskOnTrue: false },
  { id: 'm8', label: '8. ¿Su hijo/a se interesa por otros niños (los observa, les sonríe o se acerca)?', type: 'boolean', defaultValue: true, trueLabel: 'Sí (0)', falseLabel: 'No (+1)', riskOnTrue: false },
  { id: 'm9', label: '9. ¿Su hijo/a le muestra cosas trayéndolas o levantándolas solo para compartirlas (no para pedir ayuda)?', type: 'boolean', defaultValue: true, trueLabel: 'Sí (0)', falseLabel: 'No (+1)', riskOnTrue: false },
  { id: 'm10', label: '10. ¿Su hijo/a responde cuando lo llaman por su nombre?', type: 'boolean', defaultValue: true, trueLabel: 'Sí (0)', falseLabel: 'No (+1)', riskOnTrue: false },
  { id: 'm11', label: '11. Cuando usted le sonríe a su hijo/a, ¿le devuelve la sonrisa?', type: 'boolean', defaultValue: true, trueLabel: 'Sí (0)', falseLabel: 'No (+1)', riskOnTrue: false },
  { id: 'm12', label: '12. ¿Se altera o molesta excesivamente su hijo/a con ruidos cotidianos (aspiradora, licuadora, música fuerte)? (Invertido)', type: 'boolean', defaultValue: false, trueLabel: 'Sí (+1)', falseLabel: 'No (0)', riskOnTrue: true },
  { id: 'm13', label: '13. ¿Su hijo/a camina solo/a?', type: 'boolean', defaultValue: true, trueLabel: 'Sí (0)', falseLabel: 'No (+1)', riskOnTrue: false },
  { id: 'm14', label: '14. ¿Su hijo/a lo mira a los ojos cuando le habla, juega o lo viste?', type: 'boolean', defaultValue: true, trueLabel: 'Sí (0)', falseLabel: 'No (+1)', riskOnTrue: false },
  { id: 'm15', label: '15. ¿Su hijo/a intenta imitar lo que usted hace (decir adiós, aplaudir, hacer un sonido)?', type: 'boolean', defaultValue: true, trueLabel: 'Sí (0)', falseLabel: 'No (+1)', riskOnTrue: false },
  { id: 'm16', label: '16. Si usted gira la cabeza para mirar algo, ¿su hijo/a mira alrededor para ver qué está mirando usted?', type: 'boolean', defaultValue: true, trueLabel: 'Sí (0)', falseLabel: 'No (+1)', riskOnTrue: false },
  { id: 'm17', label: '17. ¿Su hijo/a intenta que usted lo mire para elogiarlo ("mírame")?', type: 'boolean', defaultValue: true, trueLabel: 'Sí (0)', falseLabel: 'No (+1)', riskOnTrue: false },
  { id: 'm18', label: '18. ¿Su hijo/a comprende cuando usted le pide algo sin señalar ("pon el libro en la silla")?', type: 'boolean', defaultValue: true, trueLabel: 'Sí (0)', falseLabel: 'No (+1)', riskOnTrue: false },
  { id: 'm19', label: '19. Si ocurre algo nuevo o extraño, ¿su hijo/a le mira a la cara para ver cómo reacciona usted?', type: 'boolean', defaultValue: true, trueLabel: 'Sí (0)', falseLabel: 'No (+1)', riskOnTrue: false },
  { id: 'm20', label: '20. ¿A su hijo/a le gustan las actividades de movimiento (balancearlo o hacerlo rebotar en sus rodillas)?', type: 'boolean', defaultValue: true, trueLabel: 'Sí (0)', falseLabel: 'No (+1)', riskOnTrue: false },
];

export const mchatRCalculator: CalculatorDefinition = {
  id: 'mchat-r',
  name: 'M-CHAT-R — Cribado de Trastorno del Espectro Autista (16–30 meses)',
  shortName: 'M-CHAT-R (Cribado TEA)',
  primarySpecialty: 'pediatria',
  secondarySpecialties: ['psiquiatria', 'neurologia'],
  subcategory: 'diagnostico',
  keywords: [
    'm-chat',
    'mchat',
    'autismo',
    'tea',
    'neurodesarrollo',
    'nino sano',
    'pediatria',
    'cribado',
  ],
  description:
    'Cuestionario de cribado del desarrollo de 20 ítems (Robins et al., 2014) para detectar signos tempranos de riesgo de Trastorno del Espectro Autista (TEA) en niños de 16 a 30 meses.',
  clinicalIndication:
    'Control universal de niño sano a los 18 y 24 meses (guías AAP) o ante cualquier preocupación parental o clínica sobre comunicación, lenguaje o interacción social.',
  validatedPopulation: 'Niños pequeños de 16 a 30 meses de edad (ajustar por edad corregida si prematuridad, y considerar limitaciones si hay sordera o déficit motor severo no corregido).',
  contraindications: [
    'NO es una herramienta diagnóstica: un resultado alterado indica riesgo de TEA u otro retraso del desarrollo que requiere entrevista de seguimiento y evaluación especializada.',
  ],
  limitations: [
    'En riesgo medio (3–7 puntos) es obligatorio administrar la Entrevista de Seguimiento (M-CHAT-R/F) antes de concluir que el cribado es positivo.',
    'Ítems 2, 5 y 12 puntúan al revés (la respuesta "Sí" suma 1 punto de riesgo; en los otros 17 ítems la respuesta "No" suma 1 punto).',
  ],
  version: 'M-CHAT-R (Robins et al., Pediatrics 2014)',
  references: [
    {
      citation:
        'Robins DL, Casagrande K, Barton M, Chen CM, Dumont-Mathieu T, Fein D. Validation of the modified checklist for Autism in toddlers, revised with follow-up (M-CHAT-R/F). Pediatrics. 2014;133(1):37-45.',
      year: 2014,
    },
  ],
  fields: mchatItems,
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(mchatRCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const total = mchatItems.reduce((sum, item) => {
      const val = Boolean(inputs[item.id]);
      const isRisk = item.riskOnTrue ? val : !val;
      return sum + (isRisk ? 1 : 0);
    }, 0);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (total <= 2) {
      severity = 'normal';
      riskClassification = `Riesgo bajo en M-CHAT-R (0–2 puntos · Total ${total}/20)`;
      clinicalInterpretation =
        'Baja probabilidad de Trastorno del Espectro Autista en este cribado.';
      guidance.push(
        'Si el niño es menor de 24 meses, repetir obligatoriamente el cribado a los 24 meses según recomendaciones AAP; mantener vigilancia del desarrollo en cada visita.',
      );
    } else if (total <= 7) {
      severity = 'moderate';
      riskClassification = `Riesgo medio en M-CHAT-R (3–7 puntos · Total ${total}/20)`;
      clinicalInterpretation =
        'Requiere aplicar la Entrevista de Seguimiento estructurada (M-CHAT-R/F) para verificar los ítems fallados antes de decidir derivación directa.';
      guidance.push(
        'Realizar la Entrevista de Seguimiento M-CHAT-R/F: si tras la entrevista persisten ≥ 2 puntos, derivar inmediatamente a evaluación diagnóstica especializada y atención temprana.',
        'Evaluar también audición (potenciales/audiometría infantil) si hay sospecha de hipoacusia.',
      );
    } else {
      severity = 'high';
      riskClassification = `Riesgo alto en M-CHAT-R (8–20 puntos · Total ${total}/20)`;
      clinicalInterpretation =
        'Alta probabilidad de TEA u otro trastorno relevante del neurodesarrollo; no es necesario esperar a la entrevista de seguimiento para actuar.';
      guidance.push(
        'Derivar de inmediato para evaluación diagnóstica integral (Neuropediatría / Psiquiatría Infantil / equipo de desarrollo) e iniciar intervención de atención temprana sin demora, además de descartar hipoacusia.',
      );
    }

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Requiere Entrevista de Seguimiento (M-CHAT-R/F)',
        formattedValue: total >= 3 && total <= 7 ? 'Sí (obligatoria)' : total >= 8 ? 'Opcional (derivar directo)' : 'No',
        unit: '',
      },
    ];

    return {
      primaryResult: {
        label: 'M-CHAT-R Total',
        value: total,
        formattedValue: `${total} / 20`,
        unit: 'puntos de riesgo',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'M-CHAT-R (0–20): Sí = +1 en ítems 2, 5, 12; No = +1 en los demás 17 ítems',
      inputsSummary: `M-CHAT-R ${total}/20 pts de riesgo`,
    };
  },
};
