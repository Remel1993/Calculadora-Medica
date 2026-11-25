import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  SecondaryResultItem,
  SeverityLevel,
} from '../types/clinical.ts';

const persistentField: BooleanFieldDef = {
  id: 'persistent10d',
  label: '1. Síntomas persistentes ≥ 10 días SIN evidencia de mejoría clínica (rinorrea purulenta/congestión + dolor facial)',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Sí (≥ 10 d)',
  falseLabel: 'No',
};

const severeOnsetField: BooleanFieldDef = {
  id: 'severeOnset',
  label: '2. Inicio grave: fiebre alta (≥ 39 °C) + secreción nasal purulenta o dolor facial intenso durante ≥ 3–4 días consecutivos al inicio',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Sí (Grave)',
  falseLabel: 'No',
};

const doubleSickeningField: BooleanFieldDef = {
  id: 'doubleSickening',
  label: '3. Empeoramiento bifásico ("double sickening"): nueva fiebre, cefalea o aumento de rinorrea tras mejoría inicial en infección viral de 5–6 días',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Sí (Bifásico)',
  falseLabel: 'No',
};

const redFlagsField: BooleanFieldDef = {
  id: 'redFlags',
  label: '4. Signos de alarma orbitaria/SNC (edema/eritema periorbitario, diplopía, proptosis, cefalea frontal intensa, rigidez nucal o alteración neurológica)',
  type: 'boolean',
  defaultValue: false,
  trueLabel: 'Sí (Alarma)',
  falseLabel: 'No',
};

export const acuteRhinosinusitisCalculator: CalculatorDefinition = {
  id: 'acute-rhinosinusitis',
  name: 'Criterios de Rinosinusitis Aguda Bacteriana vs. Viral (IDSA / EPOS)',
  shortName: 'Sinusitis Aguda (IDSA/EPOS)',
  primarySpecialty: 'infectologia',
  secondarySpecialties: ['medicina-interna', 'pediatria'],
  subcategory: 'diagnostico',
  keywords: [
    'sinusitis',
    'rinosinusitis',
    'idsa',
    'epos',
    'antibiotico',
    'catarro',
    'resfriado',
    'infectologia',
    'consulta externa',
  ],
  description:
    'Diferencia la rinosinusitis aguda viral (autolimitada) de la rinosinusitis bacteriana aguda que se beneficia de tratamiento antibiótico según guías IDSA y EPOS 2020.',
  clinicalIndication:
    'Uso racional de antibióticos en consulta externa y atención primaria ante rinorrea purulenta, congestión nasal y dolor/presión facial.',
  validatedPopulation: 'Niños y adultos inmunocompetentes con síntomas nasosinusales agudos (< 4 semanas).',
  contraindications: [
    'En pacientes inmunocomprometidos (neutropenia, diabetes mal controlada, trasplante) sospechar sinusitis fúngica invasiva ante síntomas agresivos o necrosis nasal.',
  ],
  limitations: [
    'La secreción nasal amarillenta o verdosa por sí sola durante los primeros 7–10 días NO indica infección bacteriana (refleja migración normal de neutrófilos en cuadros virales).',
    'La radiografía simple de senos paranasales no está recomendada de rutina en rinosinusitis aguda no complicada.',
  ],
  version: 'IDSA (Chow et al., 2012) · Consenso EPOS (2020)',
  references: [
    {
      citation:
        'Chow AW, Benninger MS, Brook I, et al. IDSA clinical practice guideline for acute bacterial rhinosinusitis in children and adults. Clin Infect Dis. 2012;54(8):e72-e112.',
      year: 2012,
    },
    {
      citation:
        'Fokkens WJ, Lund VJ, Hopkins C, et al. European Position Paper on Rhinosinusitis and Nasal Polyps 2020 (EPOS 2020). Rhinology. 2020;58(Suppl S29):1-464.',
      year: 2020,
    },
  ],
  fields: [persistentField, severeOnsetField, doubleSickeningField, redFlagsField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(acuteRhinosinusitisCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const p1 = Boolean(inputs.persistent10d);
    const p2 = Boolean(inputs.severeOnset);
    const p3 = Boolean(inputs.doubleSickening);
    const alarm = Boolean(inputs.redFlags);
    const bacterialCriteria = (p1 ? 1 : 0) + (p2 ? 1 : 0) + (p3 ? 1 : 0);

    let severity: SeverityLevel = 'normal';
    let riskClassification = '';
    let clinicalInterpretation = '';
    const guidance: string[] = [];

    if (alarm) {
      severity = 'critical';
      riskClassification = 'Alerta de complicación orbitaria / intracraneal';
      clinicalInterpretation =
        'La presencia de signos periorbitarios o neurológicos exige descartar celulitis orbitaria, absceso subperióstico o complicación intracraneal.';
      guidance.push(
        'Derivación urgente hospitalaria para TC de senos paranasales/órbita con contraste, valoración por ORL/Oftalmología y antibioterapia IV.',
      );
    } else if (bacterialCriteria >= 1) {
      severity = 'high';
      riskClassification = `Probable Rinosinusitis Bacteriana Aguda (${bacterialCriteria}/3 criterios IDSA)`;
      clinicalInterpretation =
        'Cumple al menos uno de los tres criterios clínicos clásicos de sobreinfección bacteriana (persistencia ≥ 10 días sin mejoría, inicio grave ≥ 3–4 días o empeoramiento bifásico).';
      guidance.push(
        'Valorar antibioticoterapia empírica de primera línea (habitualmente amoxicilina-clavulánico o amoxicilina según guías/resistencia local y alergias), asociada a lavados salinos y corticoide intranasal.',
      );
    } else {
      severity = 'low';
      riskClassification = 'Probable Rinosinusitis Viral Aguda (resfriado común / posviral)';
      clinicalInterpretation =
        'No cumple criterios de rinosinusitis bacteriana aguda; > 90% de estos cuadros se resuelven espontáneamente en 7–10 días sin antibióticos.';
      guidance.push(
        'Manejo sintomático exclusivo: lavados nasales con suero fisiológico, analgésicos/antipiréticos y corticoide tópico nasal si hay obstrucción molesta; NO prescribir antibióticos.',
        'Indicar reconsulta si supera 10 días sin mejoría, aparece fiebre alta persistente o empeoramiento tras mejoría previa.',
      );
    }

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Criterios bacterianos IDSA positivos',
        formattedValue: `${bacterialCriteria} / 3`,
        unit: '',
      },
      {
        label: 'Conducta antibiótica orientativa',
        formattedValue: alarm ? 'Hospitalaria / IV urgente' : bacterialCriteria >= 1 ? 'Considerar antibiótico' : 'Sin antibiótico',
        unit: '',
      },
    ];

    return {
      primaryResult: {
        label: 'Orientación diagnóstica',
        value: alarm ? 99 : bacterialCriteria,
        formattedValue: alarm ? 'Alarma / Urgente' : bacterialCriteria >= 1 ? 'Bacteriana' : 'Viral',
        unit: '',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: 'Criterios IDSA/EPOS: ≥1 de (Persistencia ≥10 d, Inicio grave ≥3–4 d, Doble empeoramiento)',
      inputsSummary: `≥10d: ${p1 ? 'Sí' : 'No'} · Grave: ${p2 ? 'Sí' : 'No'} · Bifásico: ${p3 ? 'Sí' : 'No'} · Alarma: ${alarm ? 'Sí' : 'No'}`,
    };
  },
};
