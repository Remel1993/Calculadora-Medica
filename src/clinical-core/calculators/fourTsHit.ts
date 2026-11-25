import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SecondaryResultItem,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

const thrombocytopeniaField: SelectFieldDef = {
  id: 'thrombocytopenia',
  label: '1. Trombocitopenia (magnitud de la caída y nadir)',
  type: 'select',
  defaultValue: '0',
  options: [
    {
      value: '2',
      label: '+2 · Caída > 50% y nadir ≥ 20 ×10⁹/L (20 000/µL)',
      points: 2,
    },
    {
      value: '1',
      label: '+1 · Caída 30–50% o nadir 10–19 ×10⁹/L',
      points: 1,
    },
    {
      value: '0',
      label: '0 · Caída < 30% o nadir < 10 ×10⁹/L',
      points: 0,
    },
  ],
};

const timingField: SelectFieldDef = {
  id: 'timing',
  label: '2. Tiempo (Timing) desde el inicio de heparina',
  type: 'select',
  defaultValue: '0',
  options: [
    {
      value: '2',
      label: '+2 · Inicio días 5–10, o caída ≤ 1 día con exposición a heparina en últimos 30 d',
      points: 2,
    },
    {
      value: '1',
      label: '+1 · Compatible días 5–10 pero incierto, inicio > día 10, o ≤ 1 día (exposición 31–100 d)',
      points: 1,
    },
    {
      value: '0',
      label: '0 · Caída < 4 días sin exposición previa reciente a heparina',
      points: 0,
    },
  ],
};

const thrombosisField: SelectFieldDef = {
  id: 'thrombosis',
  label: '3. Trombosis u otras secuelas clínicas',
  type: 'select',
  defaultValue: '0',
  options: [
    {
      value: '2',
      label: '+2 · Nueva trombosis confirmada, necrosis cutánea o reacción aguda tras bolo IV',
      points: 2,
    },
    {
      value: '1',
      label: '+1 · Trombosis progresiva/recurrente, lesión cutánea eritematosa o sospecha no confirmada',
      points: 1,
    },
    {
      value: '0',
      label: '0 · Ninguna',
      points: 0,
    },
  ],
};

const otherCausesField: SelectFieldDef = {
  id: 'otherCauses',
  label: '4. Otras causas (oTher) de trombocitopenia',
  type: 'select',
  defaultValue: '0',
  options: [
    {
      value: '2',
      label: '+2 · Ninguna otra causa evidente',
      points: 2,
    },
    {
      value: '1',
      label: '+1 · Posible otra causa (sepsis, fármacos, circulación extracorpórea)',
      points: 1,
    },
    {
      value: '0',
      label: '0 · Causa alternativa definitiva presente',
      points: 0,
    },
  ],
};

export const fourTsHitCalculator: CalculatorDefinition = {
  id: 'four-ts-hit',
  name: 'Score 4Ts — Probabilidad de Trombocitopenia Inducida por Heparina (TIH/HIT)',
  shortName: 'Score 4Ts (HIT)',
  primarySpecialty: 'hematologia',
  secondarySpecialties: ['medicina-interna', 'urgencias'],
  subcategory: 'diagnostico',
  keywords: [
    '4ts',
    'hit',
    'tih',
    'heparina',
    'trombocitopenia',
    'plaquetas',
    'pf4',
    'hematologia',
  ],
  description:
    'Estima la probabilidad clínica pretest de trombocitopenia inducida por heparina (TIH/HIT) mediante cuatro dominios (0 a 8 puntos).',
  clinicalIndication:
    'Sospecha clínica de TIH en pacientes expuestos a heparina no fraccionada o HBPM que desarrollan trombocitopenia o nueva trombosis.',
  validatedPopulation: 'Adultos hospitalizados expuestos a heparina no fraccionada (HNF) o heparina de bajo peso molecular (HBPM).',
  contraindications: [
    'No sustituye la confirmación inmunológica/funcional (anti-PF4/heparina y SRA/HIPA) en probabilidad intermedia o alta.',
  ],
  limitations: [
    'Su principal fortaleza es el alto valor predictivo negativo (≥ 99%) en puntuaciones bajas (0–3 puntos).',
    'En UCI, posoperatorio cardíaco y sepsis puede haber causas concurrentes que reducen la especificidad.',
  ],
  version: 'Lo et al. (2006) · Guías ASH HIT',
  references: [
    {
      citation:
        'Lo GK, Juhl D, Warkentin TE, Sigouin CS, Eichler P, Greinacher A. Evaluation of pretest clinical score (4 T\'s) for the diagnosis of heparin-induced thrombocytopenia. J Thromb Haemost. 2006;4(4):759-765.',
      year: 2006,
    },
    {
      citation:
        'Cuker A, Arepally GM, Chong BH, et al. American Society of Hematology 2018 guidelines for management of venous thromboembolism: heparin-induced thrombocytopenia. Blood Adv. 2018;2(22):3360-3392.',
      year: 2018,
    },
  ],
  fields: [thrombocytopeniaField, timingField, thrombosisField, otherCausesField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(fourTsHitCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const t1 = Number(inputs.thrombocytopenia);
    const t2 = Number(inputs.timing);
    const t3 = Number(inputs.thrombosis);
    const t4 = Number(inputs.otherCauses);
    const total = t1 + t2 + t3 + t4;

    let severity: SeverityLevel = 'low';
    let riskClassification = '';
    let clinicalInterpretation = '';
    let probability = '< 5%';
    const guidance: string[] = [];

    if (total <= 3) {
      severity = 'low';
      probability = '< 5% (VPN ~99.8%)';
      riskClassification = 'Probabilidad baja de TIH (0–3 puntos)';
      clinicalInterpretation =
        'Muy baja probabilidad de trombocitopenia inducida por heparina; prácticamente descarta el cuadro.';
      guidance.push(
        'Según guías ASH, no suele indicarse determinación de anticuerpos anti-PF4 ni suspensión empírica de heparina, salvo hallazgos clínicos atípicos.',
      );
    } else if (total <= 5) {
      severity = 'high';
      probability = '~14% (rango 7–21%)';
      riskClassification = 'Probabilidad intermedia de TIH (4–5 puntos)';
      clinicalInterpretation =
        'Probabilidad clínica intermedia; requiere confirmación diagnóstica y valoración inmediata del riesgo trombótico vs. hemorrágico.';
      guidance.push(
        'Solicitar inmunoensayo anti-PF4/heparina; suspender heparina y cambiar a anticoagulante no heparínico (argatroban, bivalirudina, fondaparinux o ACOD según función renal/hepática) si no hay riesgo hemorrágico prohibitivo.',
      );
    } else {
      severity = 'critical';
      probability = '~64% (hasta 70–80%)';
      riskClassification = 'Probabilidad alta de TIH (6–8 puntos)';
      clinicalInterpretation =
        'Alta sospecha clínica de TIH; existe riesgo elevado de trombosis arterial o venosa potencialmente mortal.';
      guidance.push(
        'Suspender inmediatamente TODA exposición a heparina (incluidos sellados de catéter) e iniciar anticoagulación alternativa no heparínica en espera de anti-PF4 y prueba funcional (SRA/HIPA).',
        'Evitar transfusión profiláctica de plaquetas (salvo hemorragia activa grave) y no iniciar warfarina/AVK hasta recuperación plaquetaria (> 150 ×10⁹/L).',
      );
    }

    const secondaryResults: SecondaryResultItem[] = [
      {
        label: 'Probabilidad estimada de TIH',
        formattedValue: probability,
        unit: '',
      },
      {
        label: 'Desglose (T-T-T-O)',
        formattedValue: `${t1} + ${t2} + ${t3} + ${t4}`,
        unit: 'pts',
      },
    ];

    return {
      primaryResult: {
        label: 'Score 4Ts total',
        value: total,
        formattedValue: `${total} / 8`,
        unit: 'puntos',
      },
      secondaryResults,
      severity,
      riskClassification,
      clinicalInterpretation,
      guidance,
      formulaUsed: '4Ts = Trombocitopenia (0–2) + Tiempo (0–2) + Trombosis (0–2) + Otras causas (0–2)',
      inputsSummary: `4Ts ${total}/8 (Caída ${t1} · Tiempo ${t2} · Trombosis ${t3} · Otras ${t4})`,
    };
  },
};
