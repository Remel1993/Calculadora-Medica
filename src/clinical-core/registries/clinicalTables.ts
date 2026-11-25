import type { ClinicalReference, SpecialtyId } from '../types/clinical.ts';

export type ClinicalSetting = 'consulta-externa' | 'urgencias' | 'ambos';

export type TableTone = 'normal' | 'low' | 'moderate' | 'high' | 'critical' | 'neutral';

export interface ClinicalTableCell {
  text: string;
  tone?: TableTone;
  emphasize?: boolean;
}

export interface ClinicalReferenceTable {
  id: string;
  title: string;
  shortTitle: string;
  specialty: SpecialtyId;
  secondarySpecialties?: SpecialtyId[];
  setting: ClinicalSetting;
  guidelineVersion: string;
  summary: string;
  columns: string[];
  rows: (string | ClinicalTableCell)[][];
  keyManagementPearls: string[];
  cautionNote?: string;
  references: ClinicalReference[];
}

export const SETTING_LABELS: Record<ClinicalSetting, string> = {
  'consulta-externa': 'Consulta Externa',
  urgencias: 'Urgencias / Emergencias',
  ambos: 'Consulta Externa · Urgencias',
};

export const CLINICAL_REFERENCE_TABLES: ClinicalReferenceTable[] = [
  {
    id: 'htn-esc-acc-table',
    title: 'Hipertensión Arterial Sistémica: Clasificación y Metas (ESC 2024 vs. ACC/AHA 2017)',
    shortTitle: 'Hipertensión Arterial (ESC / ACC)',
    specialty: 'cardiologia',
    secondarySpecialties: ['medicina-interna', 'urgencias'],
    setting: 'ambos',
    guidelineVersion: 'ESC 2024 / ACC-AHA 2017',
    summary:
      'Comparativa oficial de umbrales de presión arterial en consulta, definición de crisis hipertensiva y metas terapéuticas.',
    columns: ['Categoría clínica', 'ESC 2024 (Europa)', 'ACC/AHA 2017 (EE. UU.)', 'Conducta inicial orientativa'],
    rows: [
      [
        { text: 'Normal / No elevada', tone: 'normal', emphasize: true },
        '< 120 y < 70 mmHg',
        '< 120 y < 80 mmHg',
        'Hábitos saludables y reevaluación periódica cada 1–3 años.',
      ],
      [
        { text: 'PA Elevada', tone: 'low', emphasize: true },
        '120–139 / 70–89 mmHg',
        '120–129 y < 80 mmHg',
        'Estilo de vida; evaluar riesgo CV global (SCORE2/ASCVD) a 3 meses.',
      ],
      [
        { text: 'HTA Grado / Estadio 1', tone: 'moderate', emphasize: true },
        '≥ 140 y/o ≥ 90 mmHg (HTA)',
        '130–139 o 80–89 mmHg',
        'Iniciar IECA/ARA-II, BCC o tiazídico según riesgo CV (ESC inicia combinación si ≥ 140/90).',
      ],
      [
        { text: 'HTA Grado / Estadio 2', tone: 'high', emphasize: true },
        '≥ 160 y/o ≥ 100 mmHg',
        '≥ 140 o ≥ 90 mmHg',
        'Combinación dual en 1 comprimido (IECA/ARA-II + BCC o diurético) + tamizaje órgano blanco.',
      ],
      [
        { text: 'Crisis hipertensiva (> 180/120)', tone: 'critical', emphasize: true },
        'Emergencia si daño orgánico agudo',
        'Urgencia (sin daño) vs. Emergencia (con daño)',
        'Sin daño: ajuste oral gradual (24–48 h). Con daño agudo: antihipertensivo IV titulado en UCI/Urgencias.',
      ],
    ],
    keyManagementPearls: [
      'Confirmar siempre con MAPA o AMPA domiciliario antes de etiquetar HTA de bata blanca.',
      'Meta ESC 2024 bajo tratamiento si se tolera: PAS 120–129 mmHg (≥ 70 mmHg PAD); en frágiles o ≥ 85 años individualizar.',
      'No reducir abruptamente la PA con nifedipino sublingual en urgencias hipertensivas sin daño orgánico (riesgo de isquemia cerebral/coronaria).',
    ],
    references: [
      {
        citation:
          'McEvoy JW, McCarthy CP, Bruno RM, et al. 2024 ESC Guidelines for the management of elevated blood pressure and hypertension. Eur Heart J. 2024;45(38):3912-4018.',
        year: 2024,
      },
      {
        citation:
          'Whelton PK, Carey RM, Aronow WS, et al. 2017 ACC/AHA Guideline for High Blood Pressure in Adults. Hypertension. 2018;71(6):e13-e115.',
        year: 2017,
      },
    ],
  },
  {
    id: 'dm2-ada-diagnosis-targets',
    title: 'Diabetes Mellitus y Prediabetes: Criterios Diagnósticos y Metas (ADA 2024)',
    shortTitle: 'Diabetes Mellitus: Diagnóstico y Metas',
    specialty: 'endocrinologia',
    secondarySpecialties: ['medicina-interna'],
    setting: 'consulta-externa',
    guidelineVersion: 'ADA Standards of Care 2024',
    summary:
      'Puntos de corte oficiales para tamizaje, diagnóstico de diabetes/prediabetes y objetivos glucémicos en adultos no gestantes.',
    columns: ['Prueba / Parámetro', 'Normal', 'Prediabetes', 'Diabetes Mellitus'],
    rows: [
      [
        { text: 'Glucosa plasmática en ayuno (≥ 8 h)', emphasize: true },
        '< 100 mg/dL',
        { text: '100 – 125 mg/dL (GAA)', tone: 'low' },
        { text: '≥ 126 mg/dL (≥ 7.0 mmol/L)', tone: 'high' },
      ],
      [
        { text: 'PTOG 2 h (carga 75 g glucosa)', emphasize: true },
        '< 140 mg/dL',
        { text: '140 – 199 mg/dL (ITG)', tone: 'low' },
        { text: '≥ 200 mg/dL (≥ 11.1 mmol/L)', tone: 'high' },
      ],
      [
        { text: 'Hemoglobina glucosilada (HbA1c)', emphasize: true },
        '< 5.7 %',
        { text: '5.7 – 6.4 %', tone: 'low' },
        { text: '≥ 6.5 % (48 mmol/mol)', tone: 'high' },
      ],
      [
        { text: 'Glucosa plasmática aleatoria', emphasize: true },
        '—',
        '—',
        { text: '≥ 200 mg/dL + síntomas clásicos o crisis', tone: 'critical' },
      ],
      [
        { text: 'Metas generales en DM2 controlada', emphasize: true },
        'HbA1c < 7.0 %',
        'Preprandial: 80–130 mg/dL',
        'Posprandial (1–2 h): < 180 mg/dL',
      ],
    ],
    keyManagementPearls: [
      'En ausencia de hiperglucemia inequívoca (síntomas + ≥ 200 mg/dL), el diagnóstico requiere confirmar con 2 resultados anormales (misma muestra o en 2 días distintos).',
      'En pacientes con ECV establecida, IC o ERC: priorizar iSGLT2 y/o arGLP-1 con beneficio cardiorrenal demostrado independientemente de la HbA1c basal.',
      'En adultos mayores frágiles o con alto riesgo de hipoglucemia, flexibilizar meta de HbA1c a < 7.5–8.0 %.',
    ],
    references: [
      {
        citation:
          'American Diabetes Association. Standards of Care in Diabetes—2024: Diagnosis and Classification of Diabetes & Glycemic Goals. Diabetes Care. 2024;47(Suppl. 1):S20-S42.',
        year: 2024,
      },
    ],
  },
  {
    id: 'hyperglycemic-crises-ada-2024',
    title: 'Crisis Hiperglucémicas: Cetoacidosis Diabética (CAD) vs. EHH (Consenso ADA 2024)',
    shortTitle: 'CAD vs. Estado Hiperosmolar (Urgencias)',
    specialty: 'urgencias',
    secondarySpecialties: ['endocrinologia', 'medicina-interna'],
    setting: 'urgencias',
    guidelineVersion: 'ADA/EASD/JBDS/DTS Consensus 2024',
    summary:
      'Criterios diagnósticos diferenciados de CAD (leve/moderada/grave) y EHH junto con secuencia inicial de reanimación.',
    columns: ['Criterio bioquímico / clínico', 'CAD Leve', 'CAD Moderada / Grave', 'Estado Hiperosmolar (EHH)'],
    rows: [
      [
        { text: 'Glucosa plasmática', emphasize: true },
        '≥ 200 mg/dL (o antecedente DM)',
        '≥ 200 mg/dL (o antecedente DM)',
        { text: '≥ 600 mg/dL (33.3 mmol/L)', tone: 'critical' },
      ],
      [
        { text: 'pH arterial o venoso', emphasize: true },
        '7.25 – 7.30',
        { text: 'Mod: 7.00–7.24 · Grave: < 7.00', tone: 'critical' },
        '> 7.30',
      ],
      [
        { text: 'Bicarbonato sérico (HCO₃⁻)', emphasize: true },
        '15 – 18 mEq/L',
        { text: 'Mod: 10–14.9 · Grave: < 10 mEq/L', tone: 'critical' },
        '> 15 mEq/L',
      ],
      [
        { text: 'Cetonas (β-hidroxibutirato / orina)', emphasize: true },
        'β-HB ≥ 3.0 mmol/L o ≥ 2+ orina',
        'β-HB ≥ 3.0 mmol/L o ≥ 2+ orina',
        'Ausentes o bajas (β-HB < 3.0)',
      ],
      [
        { text: 'Osmolaridad sérica efectiva', emphasize: true },
        'Variable (< 300 mOsm/kg)',
        'Variable',
        { text: '> 300 mOsm/kg (total > 320)', tone: 'critical' },
      ],
      [
        { text: 'Estado mental', emphasize: true },
        'Alerta',
        'Mod: alerta/somnoliento · Grave: estupor/coma',
        { text: 'Obnubilación / estupor / coma', tone: 'high' },
      ],
    ],
    keyManagementPearls: [
      '1.º Líquidos IV: Solución salina 0.9 % (500–1000 mL/h las primeras 2–4 h según estado hemodinámico) antes o junto a la evaluación de potasio.',
      '2.º Potasio antes de insulina: Si K⁺ < 3.5 mEq/L, REPONER K⁺ primero y diferir insulina hasta K⁺ ≥ 3.5 mEq/L (riesgo de arritmia mortal).',
      '3.º Insulina regular IV: 0.1 U/kg/h (en CAD leve-moderada puede considerarse análogo rápido SC). Al llegar glucosa < 250 mg/dL (CAD) o < 300 (EHH), agregar dextrosa 5 %.',
    ],
    references: [
      {
        citation:
          'Umpierrez GE, Davis GM, ElSayed NA, et al. Hyperglycaemic crises in adults with diabetes: a consensus report. Diabetes Care / Diabetologia. 2024;47(8):1257-1275.',
        year: 2024,
      },
    ],
  },
  {
    id: 'asthma-gina-2024-table',
    title: 'Asma Bronquial: Gravedad de Crisis Aguda y Escalones Terapéuticos (GINA 2024)',
    shortTitle: 'Asma: Crisis y Escalones (GINA 2024)',
    specialty: 'neumologia',
    secondarySpecialties: ['urgencias', 'medicina-interna'],
    setting: 'ambos',
    guidelineVersion: 'GINA 2024',
    summary:
      'Diferenciación rápida en urgencias entre crisis leve-moderada, grave y de riesgo vital, además del enfoque ambulatorio Track 1.',
    columns: ['Parámetro / Escenario', 'Crisis Leve a Moderada', 'Crisis Grave', 'Riesgo Vital Inminente'],
    rows: [
      [
        { text: 'Habla y estado de conciencia', emphasize: true },
        'Habla frases completas, prefiere sentado',
        { text: 'Habla palabras sueltas, agitado', tone: 'high' },
        { text: 'Somnoliento, confuso o tórax silente', tone: 'critical' },
      ],
      [
        { text: 'Signos vitales y FEM (PEF)', emphasize: true },
        'FR aumentada, FC 100–120 lpm, FEM > 50 %',
        { text: 'FR > 30 rpm, FC > 120 lpm, FEM ≤ 50 %', tone: 'high' },
        { text: 'Bradicardia, hipotensión, agotamiento', tone: 'critical' },
      ],
      [
        { text: 'Saturación O₂ (aire ambiente)', emphasize: true },
        'SpO₂ 90 – 95 %',
        { text: 'SpO₂ < 90 %', tone: 'critical' },
        { text: 'SpO₂ < 90 % / Hipercapnia', tone: 'critical' },
      ],
      [
        { text: 'Manejo agudo inmediato', emphasize: true },
        'SABA (4–10 inh c/20 min × 1 h) + Prednisona oral 40–50 mg',
        'SABA + Bromuro ipratropio + O₂ (meta 93–95 %) + Corticoide sistémico precoz + valorar MgSO₄ 2 g IV',
        'UCI / Intubación inmediata + SABA continuo + Ipratropio + Hidrocortisona IV + MgSO₄ IV',
      ],
      [
        { text: 'Control Consulta Externa (GINA)', emphasize: true },
        'Track 1 preferido: ICS-formoterol a demanda (Pasos 1–2)',
        'Paso 3: ICS-formoterol dosis baja MART · Paso 4: dosis media MART',
        'Paso 5: derivar a fenotipado (LAMA, biológicos anti-IgE/IL-5/IL-4R)',
      ],
    ],
    keyManagementPearls: [
      'GINA 2024 NO recomienda SABA solo sin corticoide inhalado en adultos/adolescentes por mayor riesgo de exacerbación grave.',
      'La respuesta al tratamiento inicial a la 1 hora (clínica + FEM + SpO₂) define mejor el alta o ingreso que la gravedad basal aislada.',
    ],
    references: [
      {
        citation:
          'Global Initiative for Asthma (GINA). Global Strategy for Asthma Management and Prevention (2024 Update).',
        year: 2024,
      },
    ],
  },
  {
    id: 'copd-gold-2024-table',
    title: 'EPOC: Clasificación Espirométrica, Grupos GOLD ABE y Exacerbación (GOLD 2024)',
    shortTitle: 'EPOC: GOLD ABE y Exacerbación',
    specialty: 'neumologia',
    secondarySpecialties: ['medicina-interna', 'urgencias'],
    setting: 'ambos',
    guidelineVersion: 'GOLD 2024',
    summary:
      'Diagnóstico funcional (VEF₁/CVF < 0.70 pos-BD), asignación inicial de tratamiento por grupos ABE y manejo agudo en urgencias.',
    columns: ['Grupo / Estadio', 'Criterios clínicos', 'Terapia inicial recomendada (Consulta)', 'Exacerbación aguda (Urgencias)'],
    rows: [
      [
        { text: 'Grupo A (Pocos síntomas, bajo riesgo)', tone: 'normal', emphasize: true },
        '0 o 1 exacerbación moderada (sin ingreso) · mMRC 0–1 y CAT < 10',
        'Un broncodilatador (LAMA o LABA preferible sobre SABA)',
        'SABA ± SAMA cada 4–6 h; valorar causa desencadenante',
      ],
      [
        { text: 'Grupo B (Más síntomas, bajo riesgo)', tone: 'moderate', emphasize: true },
        '0 o 1 exacerbación moderada (sin ingreso) · mMRC ≥ 2 o CAT ≥ 10',
        'Doble broncodilatación: LABA + LAMA en inhalador único',
        'O₂ titulado estrictamente a meta SpO₂ 88–92 % (evitar hiperoxia)',
      ],
      [
        { text: 'Grupo E (Alto riesgo de exacerbación)', tone: 'high', emphasize: true },
        '≥ 2 exacerbaciones moderadas o ≥ 1 con hospitalización en el último año',
        'LABA + LAMA; considerar triple terapia (LABA+LAMA+ICS) si eosinófilos ≥ 300 cél/µL',
        'Prednisona 40 mg/día VO × 5 días + ATB si ↑ purulencia esputo o VNI',
      ],
      [
        { text: 'Insuficiencia respiratoria hipercápnica', tone: 'critical', emphasize: true },
        'Acidosis respiratoria (pH ≤ 7.35 con PaCO₂ > 45 mmHg) o disnea grave',
        'Rehabilitación pulmonar + evaluar O₂ domiciliario crónico',
        'Ventilación Mecánica No Invasiva (VNI) de primera línea si no hay contraindicación',
      ],
    ],
    keyManagementPearls: [
      'Gravedad espirométrica posbroncodilatador (VEF₁/CVF < 0.70): GOLD 1 (≥ 80 %), GOLD 2 (50–79 %), GOLD 3 (30–49 %), GOLD 4 (< 30 %).',
      'En exacerbación grave, saturar por encima de 92 % empeora la hipercapnia por pérdida del estímulo hipóxico y efecto Haldane.',
    ],
    references: [
      {
        citation:
          'Global Initiative for Chronic Obstructive Lung Disease (GOLD). Global Strategy for the Diagnosis, Management, and Prevention of COPD (2024 Report).',
        year: 2024,
      },
    ],
  },
  {
    id: 'sepsis-ssc-2021-bundle',
    title: 'Sepsis y Choque Séptico: Criterios Sepsis-3 y Paquete de la 1.ª Hora (SSC 2021)',
    shortTitle: 'Sepsis: Criterios y Paquete Hora 1',
    specialty: 'urgencias',
    secondarySpecialties: ['infectologia', 'medicina-interna'],
    setting: 'urgencias',
    guidelineVersion: 'Surviving Sepsis Campaign 2021',
    summary:
      'Definiciones operativas Sepsis-3 y acciones críticas tiempo-dependientes durante la primera hora de atención.',
    columns: ['Elemento / Acción crítica', 'Objetivo / Umbral clínico', 'Plazo / Conducta recomendada'],
    rows: [
      [
        { text: 'Definición Sepsis (Sepsis-3)', tone: 'high', emphasize: true },
        'Infección sospechada/documentada + ΔSOFA ≥ 2 puntos',
        'Tamizar disfunción orgánica (lactato, Cr, bilirrubina, plaquetas, PaO₂/FiO₂, GCS)',
      ],
      [
        { text: 'Definición Choque Séptico', tone: 'critical', emphasize: true },
        'Vasopresor para PAM ≥ 65 mmHg + Lactato > 2 mmol/L tras líquidos',
        'Mortalidad hospitalaria > 40 %; manejo en área de reanimación / UCI',
      ],
      [
        { text: '1. Medición de lactato sérico', emphasize: true },
        'Medir basal; repetir en 2–4 h si lactato inicial ≥ 2 mmol/L',
        'Usar tendencia de aclaramiento de lactato como guía de perfusión',
      ],
      [
        { text: '2. Hemocultivos previos al antibiótico', emphasize: true },
        '≥ 2 sets (aerobio + anaerobio) de punciones periféricas distintas',
        'Tomar antes del antimicrobiano SIN retrasar su inicio > 45 min',
      ],
      [
        { text: '3. Antimicrobianos IV de amplio espectro', tone: 'critical', emphasize: true },
        'Cobertura empírica según foco sospechado y factores de resistencia',
        'Administrar en ≤ 1 hora en choque séptico o sepsis probable',
      ],
      [
        { text: '4. Reanimación hídrica', emphasize: true },
        'Cristaloides balanceados (Ringer lactato / Plasma-Lyte) 30 mL/kg',
        'Iniciar inmediatamente si hipotensión o lactato ≥ 4 mmol/L (completar ≤ 3 h)',
      ],
      [
        { text: '5. Vasopresor (Norepinefrina 1.ª línea)', tone: 'high', emphasize: true },
        'Meta PAM ≥ 65 mmHg',
        'Iniciar tempranamente (incluso por vía periférica proximal segura) si persiste hipotensión',
      ],
    ],
    keyManagementPearls: [
      'SSC 2021 recomienda NO usar qSOFA como herramienta única de tamizaje por su baja sensibilidad frente a NEWS2, SIRS o MEWS.',
      'Reevaluar respuesta dinámica a fluidos (elevación pasiva de piernas, variación de presión de pulso) tras los bolos iniciales para evitar sobrecarga hídrica.',
    ],
    references: [
      {
        citation:
          'Evans L, Rhodes A, Alhazzani W, et al. Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2021. Intensive Care Med. 2021;47(11):1181-1247.',
        year: 2021,
      },
    ],
  },
  {
    id: 'nac-ats-idsa-2019-table',
    title: 'Neumonía Adquirida en la Comunidad (NAC): Sitio de Cuidado y Manejo Empírico (ATS/IDSA)',
    shortTitle: 'Neumonía (NAC): Sitio y Esquema',
    specialty: 'infectologia',
    secondarySpecialties: ['neumologia', 'urgencias', 'medicina-interna'],
    setting: 'ambos',
    guidelineVersion: 'ATS / IDSA 2019',
    summary:
      'Selección del ámbito de atención (ambulatorio, sala general o UCI) y terapia antimicrobiana empírica inicial en adultos.',
    columns: ['Escenario clínico', 'Criterios orientativos', 'Esquema empírico inicial (adultos)'],
    rows: [
      [
        { text: 'Ambulatorio sin comorbilidades ni factores de riesgo', tone: 'normal', emphasize: true },
        'CURB-65 0–1 (o PSI I–II), SpO₂ ≥ 92 %, tolera vía oral',
        'Amoxicilina 1 g c/8 h VO, o Doxiciclina 100 mg c/12 h, o Macrólido (solo si resistencia local < 25 %)',
      ],
      [
        { text: 'Ambulatorio con comorbilidades (EPOC, DM, cardiopatía, ERC)', tone: 'low', emphasize: true },
        'Sin criterios de hipoxemia ni inestabilidad sistémica',
        'Amoxicilina/clavulánico (o cefuroxima/cefpodoxima) + Macrólido o Doxiciclina; o Fluoroquinolona respiratoria en monoterapia',
      ],
      [
        { text: 'Hospitalizado en piso (NAC no grave)', tone: 'moderate', emphasize: true },
        'CURB-65 ≥ 2, PSI ≥ III, hipoxemia o intolerancia oral',
        'β-lactámico IV (ceftriaxona o ampicilina/sulbactam) + Macrólido (o Doxiciclina); alternativa: Fluoroquinolona respiratoria',
      ],
      [
        { text: 'NAC Grave (UCI)', tone: 'critical', emphasize: true },
        'Choque séptico o VM (criterios mayores) o ≥ 3 criterios menores ATS/IDSA',
        'β-lactámico IV + Macrólido o Fluoroquinolona respiratoria (agregar cobertura MRSA/Pseudomonas solo si factores validados o cultivo previo)',
      ],
    ],
    keyManagementPearls: [
      'Criterios menores ATS/IDSA: FR ≥ 30, PaFi ≤ 250, infiltrados multilobares, confusión, BUN ≥ 20 mg/dL, leucopenia < 4,000, plaquetas < 100,000, T° < 36°C, hipotensión que requiere líquidos.',
      'Duración habitual: mínimo 5 días si hay estabilidad clínica y apirexia durante 48–72 h.',
    ],
    references: [
      {
        citation:
          'Metlay JP, Waterer GW, Long AC, et al. Diagnosis and Treatment of Adults with Community-acquired Pneumonia. Am J Respir Crit Care Med. 2019;200(7):e45-e67.',
        year: 2019,
      },
    ],
  },
  {
    id: 'kdigo-ckd-2024-heatmap',
    title: 'Enfermedad Renal Crónica (ERC): Mapa de Calor Pronóstico y Seguimiento (KDIGO 2024)',
    shortTitle: 'ERC KDIGO 2024 (Mapa de Calor)',
    specialty: 'nefrologia',
    secondarySpecialties: ['medicina-interna', 'endocrinologia'],
    setting: 'consulta-externa',
    guidelineVersion: 'KDIGO CKD 2024',
    summary:
      'Matriz pronóstica oficial combinando categoría de TFGe (G1–G5) y albuminuria persistente (A1–A3), con frecuencia anual de monitorización.',
    columns: [
      'Categoría TFGe (mL/min/1.73 m²)',
      'A1: Normal/Leve (< 30 mg/g)',
      'A2: Moderada (30–300 mg/g)',
      'A3: Grave (> 300 mg/g)',
    ],
    rows: [
      [
        { text: 'G1 — Normal o alta (≥ 90)', emphasize: true },
        { text: 'Bajo (1/año si otro daño)', tone: 'normal' },
        { text: 'Moderado (1/año)', tone: 'low' },
        { text: 'Alto (2/año)', tone: 'high' },
      ],
      [
        { text: 'G2 — Ligeramente baja (60–89)', emphasize: true },
        { text: 'Bajo (1/año si otro daño)', tone: 'normal' },
        { text: 'Moderado (1/año)', tone: 'low' },
        { text: 'Alto (2/año)', tone: 'high' },
      ],
      [
        { text: 'G3a — Leve a moderada (45–59)', emphasize: true },
        { text: 'Moderado (1/año)', tone: 'low' },
        { text: 'Alto (2/año)', tone: 'high' },
        { text: 'Muy alto (3/año)', tone: 'critical' },
      ],
      [
        { text: 'G3b — Moderada a grave (30–44)', emphasize: true },
        { text: 'Alto (2/año)', tone: 'high' },
        { text: 'Muy alto (3/año)', tone: 'critical' },
        { text: 'Muy alto (3/año)', tone: 'critical' },
      ],
      [
        { text: 'G4 — Gravemente baja (15–29)', emphasize: true },
        { text: 'Muy alto (3/año)', tone: 'critical' },
        { text: 'Muy alto (3/año)', tone: 'critical' },
        { text: 'Muy alto (4+/año)', tone: 'critical' },
      ],
      [
        { text: 'G5 — Fallo renal (< 15)', emphasize: true },
        { text: 'Muy alto (4+/año)', tone: 'critical' },
        { text: 'Muy alto (4+/año)', tone: 'critical' },
        { text: 'Muy alto (4+/año)', tone: 'critical' },
      ],
    ],
    keyManagementPearls: [
      'Criterios clave de derivación a Nefrología: TFGe < 30 mL/min/1.73 m² (G4–G5), CAC ≥ 300 mg/g (A3) persistente, caída de TFGe > 25 % con cambio de categoría o pérdida > 5 mL/min/año, hematuria glomerular o HTA refractaria.',
      'G1-A1 y G2-A1 no constituyen ERC salvo marcadores estructurales/urinarios persistentes > 3 meses.',
    ],
    references: [
      {
        citation:
          'KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease. Kidney Int. 2024;105(4S):S117-S314.',
        year: 2024,
      },
    ],
  },
  {
    id: 'kdigo-aki-2012-table',
    title: 'Lesión Renal Aguda (LRA): Criterios KDIGO y Manejo Inicial en Urgencias / Piso',
    shortTitle: 'Lesión Renal Aguda (KDIGO 2012)',
    specialty: 'nefrologia',
    secondarySpecialties: ['urgencias', 'medicina-interna'],
    setting: 'urgencias',
    guidelineVersion: 'KDIGO AKI 2012',
    summary:
      'Estadificación unificada (por el criterio más grave entre creatinina y diuresis) y acciones inmediatas de nefroprotección.',
    columns: ['Estadio KDIGO', 'Criterio de Creatinina Sérica', 'Criterio de Gasto Urinario', 'Acciones inmediatas'],
    rows: [
      [
        { text: 'Estadio 1', tone: 'low', emphasize: true },
        '1.5–1.9× basal (en 7 d) o incremento ≥ 0.3 mg/dL (en ≤ 48 h)',
        '< 0.5 mL/kg/h durante 6 – 12 h',
        'Evaluar volemia, suspender AINEs/nefrotóxicos, ajustar dosis renales, buscar foco obstructivo/séptico.',
      ],
      [
        { text: 'Estadio 2', tone: 'moderate', emphasize: true },
        '2.0 – 2.9× basal',
        '< 0.5 mL/kg/h durante ≥ 12 h',
        'Monitorizar K⁺, HCO₃⁻ y balance estricto; ecografía renal/vesical para descartar uropatía obstructiva.',
      ],
      [
        { text: 'Estadio 3', tone: 'critical', emphasize: true },
        '≥ 3.0× basal, o Cr ≥ 4.0 mg/dL (con subida aguda), o inicio de TRR',
        '< 0.3 mL/kg/h durante ≥ 24 h o anuria ≥ 12 h',
        'Valoración prioritaria por Nefrología/UCI; vigilar criterios urgentes de diálisis (AEIOU).',
      ],
    ],
    keyManagementPearls: [
      'Indicaciones urgentes de TRR (nemotecnia AEIOU): Acidosis grave refractaria (pH < 7.15), Electrolitos (hiperpotasemia refractaria), Intoxicaciones dializables, Sobrecarga (Overload) pulmonar refractaria a diuréticos, Uremia sintomática (encefalopatía, pericarditis).',
    ],
    references: [
      {
        citation:
          'KDIGO Acute Kidney Injury Work Group. KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl. 2012;2(1):1-138.',
        year: 2012,
      },
    ],
  },
  {
    id: 'electrolytes-na-k-table',
    title: 'Urgencias Electrolíticas: Hiponatremia Sintomática e Hiperpotasemia Aguda',
    shortTitle: 'Hiponatremia e Hiperpotasemia',
    specialty: 'medicina-interna',
    secondarySpecialties: ['urgencias', 'nefrologia'],
    setting: 'ambos',
    guidelineVersion: 'ESE/ESICM 2014 · KDIGO K⁺ 2020',
    summary:
      'Umbrales de gravedad, topes de seguridad en corrección de sodio y secuencia de tres pasos ante hiperpotasemia.',
    columns: ['Trastorno / Gravedad', 'Umbral diagnóstico / ECG', 'Manejo inmediato y límites de seguridad'],
    rows: [
      [
        { text: 'Hiponatremia leve a moderada (asintomática)', tone: 'low', emphasize: true },
        'Na⁺ 125–134 mEq/L sin síntomas neurológicos',
        'Evaluar volemia y osmolaridad (SIADH, tiazidas, pérdidas). Restricción hídrica o reposición lenta según etiología.',
      ],
      [
        { text: 'Hiponatremia grave o sintomática aguda', tone: 'critical', emphasize: true },
        'Convulsiones, estupor, vómitos o Na⁺ < 120–125 mEq/L',
        'Bolo SS 3 % 100–150 mL IV en 10–20 min (repetible hasta lograr ↑ Na⁺ 4–6 mEq/L). Tope máximo: ≤ 8 mEq/L en 24 h (4–6 si alto riesgo mielinólisis).',
      ],
      [
        { text: 'Hiperpotasemia leve-moderada sin cambios ECG', tone: 'moderate', emphasize: true },
        'K⁺ 5.0–6.4 mEq/L, ECG normal',
        'Retirar fármacos hiperkalemiantes/K⁺ dieta, diurético de asa si hipervolemia o quelantes orales (ciclosilicato de sodio-zirconio / patirómer).',
      ],
      [
        { text: 'Hiperpotasemia grave o con cambios ECG', tone: 'critical', emphasize: true },
        'K⁺ ≥ 6.5 mEq/L o T picuda, PR largo, QRS ancho, patrón sinusoidal',
        '1) Estabilizar membrana: Gluconato Ca²⁺ 10 % 10 mL IV en 2–5 min. 2) Redistribuir: Insulina regular 10 UI + Dextrosa 50 % 50 mL (si glucosa < 250) + Salbutamol neb 10–20 mg. 3) Eliminar: Furosemida / Hemodiálisis.',
      ],
    ],
    keyManagementPearls: [
      'El gluconato de calcio NO baja el potasio sérico; su efecto protector cardíaco dura 30–60 min mientras actúan insulina/salbutamol.',
      'En hiponatremia crónica con alcoholismo, desnutrición o hipokalemia, NO exceder 6–8 mEq/L de corrección en 24 h para prevenir el síndrome de desmielinización osmótica.',
    ],
    references: [
      {
        citation:
          'Spasovski G, Vanholder R, Allolio B, et al. Clinical practice guideline on diagnosis and treatment of hyponatraemia. Eur J Endocrinol. 2014;170(3):G1-G47.',
        year: 2014,
      },
      {
        citation:
          'Clase CM, Carrero JJ, Ellison DH, et al. Potassium homeostasis and management of dyskalemia in kidney diseases: KDIGO Controversies Conference. Kidney Int. 2020;97(1):42-61.',
        year: 2020,
      },
    ],
  },
  {
    id: 'dyslipidemia-ldl-targets',
    title: 'Dislipidemias: Metas de c-LDL y Terapia Hipolipemiante por Riesgo CV (ESC/EAS)',
    shortTitle: 'Dislipidemias y Metas de c-LDL',
    specialty: 'cardiologia',
    secondarySpecialties: ['endocrinologia', 'medicina-interna'],
    setting: 'consulta-externa',
    guidelineVersion: 'ESC/EAS 2019 / 2021',
    summary:
      'Objetivos terapéuticos de colesterol LDL según categoría de riesgo cardiovascular y escalonamiento farmacológico.',
    columns: ['Categoría de Riesgo CV', 'Criterios clínicos representativos', 'Meta de c-LDL', 'Estrategia orientativa'],
    rows: [
      [
        { text: 'Riesgo Bajo', tone: 'normal', emphasize: true },
        'SCORE2 < umbral de riesgo moderado, sin DM ni ERC',
        '< 116 mg/dL (< 3.0 mmol/L)',
        'Estilo de vida; considerar estatina solo si persiste ≥ 190 mg/dL o riesgo elevado.',
      ],
      [
        { text: 'Riesgo Moderado', tone: 'low', emphasize: true },
        'DM joven (< 50 a, duración < 10 a) sin daño ni otros FRCV; SCORE2 moderado',
        '< 100 mg/dL (< 2.6 mmol/L)',
        'Estilo de vida + estatina de intensidad moderada si fuera de meta.',
      ],
      [
        { text: 'Riesgo Alto', tone: 'high', emphasize: true },
        'CT > 310 o c-LDL > 190, ERC moderada (TFGe 30–59), DM ≥ 10 a sin daño blanco',
        '< 70 mg/dL + reducción ≥ 50 % del basal',
        'Estatina de alta intensidad (atorvastatina 40–80 mg o rosuvastatina 20–40 mg); agregar ezetimiba si no alcanza meta.',
      ],
      [
        { text: 'Riesgo Muy Alto', tone: 'critical', emphasize: true },
        'ECV aterosclerótica clínica (IAM, ACV, EAP), DM con daño orgánico, ERC grave (TFGe < 30)',
        '< 55 mg/dL + reducción ≥ 50 % del basal',
        'Estatina alta intensidad + Ezetimiba 10 mg ± iPCSK9 si persiste > 55 mg/dL.',
      ],
    ],
    keyManagementPearls: [
      'Para hipertrigliceridemia grave (> 500 mg/dL), priorizar prevención de pancreatitis aguda (dieta estricta sin alcohol/azúcares simples + fibrato o ácidos grasos omega-3).',
    ],
    references: [
      {
        citation:
          'Mach F, Baigent C, Catapano AL, et al. 2019 ESC/EAS Guidelines for the management of dyslipidaemias. Eur Heart J. 2020;41(1):111-188.',
        year: 2020,
      },
    ],
  },
  {
    id: 'uti-idsa-eau-table',
    title: 'Infección de Vías Urinarias (IVU): Cistitis, Pielonefritis y Embarazo (IDSA / EAU)',
    shortTitle: 'IVU: Cistitis y Pielonefritis',
    specialty: 'infectologia',
    secondarySpecialties: ['urologia', 'gineco-obstetricia', 'medicina-interna'],
    setting: 'ambos',
    guidelineVersion: 'IDSA / EAU 2024',
    summary:
      'Diferenciación clínica entre IVU baja no complicada, pielonefritis y bacteriuria en embarazo, con esquemas empíricos de primera línea.',
    columns: ['Síndrome clínico', 'Criterios y estudios', 'Tratamiento empírico orientativo'],
    rows: [
      [
        { text: 'Cistitis aguda no complicada (mujer no gestante)', tone: 'normal', emphasize: true },
        'Disuria, polaquiuria, urgencia sin fiebre ni dolor lumbar (no requiere urocultivo de rutina)',
        'Nitrofurantoína 100 mg c/12 h × 5 d, o Fosfomicina trometamol 3 g DU, o TMP-SMX × 3 d (si resistencia local < 20 %)',
      ],
      [
        { text: 'Pielonefritis aguda no complicada (ambulatoria)', tone: 'moderate', emphasize: true },
        'Fiebre, escalofríos, dolor en flanco/puñopercusión + tolera VO (SIEMPRE solicitar urocultivo)',
        'Dosis inicial Ceftriaxona 1 g IV/IM o aminoglucósido + Cefalosporina oral/Fluoroquinolona (según sensibilidad local, 7–14 d)',
      ],
      [
        { text: 'Pielonefritis / IVU complicada hospitalaria', tone: 'high', emphasize: true },
        'Vómitos, sepsis, obstrucción/litiasis, catéter, hombre o inmunosupresión (urocultivo + ecografía)',
        'Ceftriaxona 1–2 g c/24 h IV (o Piperacilina-tazobactam / Carbapenémico si riesgo BLEE); descartar uropatía obstructiva',
      ],
      [
        { text: 'Bacteriuria asintomática / IVU en embarazo', tone: 'high', emphasize: true },
        'Tamizar y tratar SIEMPRE bacteriuria asintomática en gestación (urocultivo)',
        'Nitrofurantoína (evitar en 3.er trimestre cerca del parto y déficit G6PD), Cefalexina o Fosfomicina; evitar fluoroquinolonas/TMP-SMX 1.er T',
      ],
    ],
    keyManagementPearls: [
      'NO tratar la bacteriuria asintomática en mujeres no gestantes, ancianos ni portadores crónicos de sonda vesical (excepto previo a procedimiento urológico con sangrado mucoso).',
      'La nitrofurantoína NO alcanza concentraciones adecuadas en parénquima renal ni está indicada en pielonefritis o TFGe < 30 mL/min.',
    ],
    references: [
      {
        citation:
          'Gupta K, Hooton TM, Naber KG, et al. International clinical practice guidelines for the treatment of acute uncomplicated cystitis and pyelonephritis. Clin Infect Dis. 2011;52(5):e103-e120.',
        year: 2011,
      },
      {
        citation: 'Bonkat G, Bartoletti R, Bruyère F, et al. EAU Guidelines on Urological Infections. 2024.',
        year: 2024,
      },
    ],
  },
  {
    id: 'pediatric-dehydration-who-table',
    title: 'Deshidratación Pediátrica por Diarrea Aguda: Planes A, B y C (OMS / ESPGHAN)',
    shortTitle: 'Deshidratación Pediátrica (Planes A-B-C)',
    specialty: 'pediatria',
    secondarySpecialties: ['urgencias'],
    setting: 'ambos',
    guidelineVersion: 'OMS / ESPGHAN',
    summary:
      'Valoración clínica del grado de deshidratación infantil y esquema de reposición con sales de rehidratación oral (SRO) o vía IV.',
    columns: ['Grado / Plan OMS', 'Signos clínicos clave', 'Reposición de líquidos y seguimiento'],
    rows: [
      [
        { text: 'Sin deshidratación (< 3–5 %) · Plan A', tone: 'normal', emphasize: true },
        'Alerta, ojos normales, llanto con lágrimas, mucosas húmedas, bebe normal, pliegue vuelve inmediato',
        'Manejo en casa: SRO baja osmolaridad tras cada evacuación (50–100 mL en < 2 a; 100–200 mL en 2–10 a) + mantener alimentación + Zinc 10–20 mg/d × 10–14 d.',
      ],
      [
        { text: 'Deshidratación leve a moderada (3–9 %) · Plan B', tone: 'moderate', emphasize: true },
        'Inquieto/irritable, ojos hundidos, bebe con avidez (sed), mucosas secas, pliegue vuelve lento (< 2 s)',
        'SRO 50–100 mL/kg en 4 horas en tomas pequeñas frecuentes (cucharadita/jeringa si vomita). Reevaluar a las 4 h y pasar a Plan A si mejora.',
      ],
      [
        { text: 'Deshidratación grave (≥ 10 %) o choque · Plan C', tone: 'critical', emphasize: true },
        'Letárgico/inconsciente, incapaz de beber, relleno capilar > 3 s, pulso débil, pliegue muy lento (> 2 s)',
        'Bolo IV/IO inmediato: Cristaloides isotónicos (SS 0.9 % o Ringer Lactato) 20 mL/kg rápido (10–20 min); repetir si persiste choque + luego corregir déficit restante.',
      ],
    ],
    keyManagementPearls: [
      'No usar bebidas deportivas, jugos ni refrescos como rehidratación oral (hiperosmolares y bajos en sodio).',
      'En vómitos persistentes sin choque que impiden Plan B, valorar gastroclisis por sonda nasogástrica u ondansetrón dosis única si protocolo local lo avala.',
    ],
    references: [
      {
        citation:
          'World Health Organization (WHO). The Treatment of Diarrhoea: A Manual for Physicians and Other Senior Health Workers (4th rev). 2005.',
        year: 2005,
      },
      {
        citation:
          'Guarino A, Ashkenazi S, Gendrel D, et al. ESPGHAN/ESPID Evidence-Based Guidelines for the Management of Acute Gastroenteritis in Children. J Pediatr Gastroenterol Nutr. 2014;59(1):132-152.',
        year: 2014,
      },
    ],
  },
  {
    id: 'preeclampsia-acog-table',
    title: 'Trastornos Hipertensivos del Embarazo y Preeclampsia (ACOG / ISSHP)',
    shortTitle: 'Preeclampsia y Crisis Obstétrica',
    specialty: 'gineco-obstetricia',
    secondarySpecialties: ['urgencias'],
    setting: 'ambos',
    guidelineVersion: 'ACOG Practice Bulletin 222 / ISSHP 2022',
    summary:
      'Criterios diagnósticos a partir de las 20 semanas de gestación, signos de gravedad y fármacos de primera línea en emergencia hipertensiva obstétrica.',
    columns: ['Entidad clínica', 'Criterios diagnósticos', 'Conducta urgente / Neuroprotección'],
    rows: [
      [
        { text: 'Hipertensión gestacional', tone: 'low', emphasize: true },
        'PAS ≥ 140 o PAD ≥ 90 mmHg (en 2 tomas ≥ 4 h) tras ≥ 20 SG, sin proteinuria ni daño orgánico',
        'Vigilancia materno-fetal estrecha semanal/bisemanal; considerar antihipertensivo oral (labetalol, nifedipino LP, metildopa) si ≥ 140/90 según meta.',
      ],
      [
        { text: 'Preeclampsia sin signos de gravedad', tone: 'moderate', emphasize: true },
        'HTA ≥ 140/90 tras ≥ 20 SG + proteinuria (≥ 300 mg/24 h o PCr ≥ 0.3 mg/mg o ≥ 2+ tira)',
        'Hospitalización/seguimiento estricto, laboratorios seriados (BH, Cr, TGO/TGP, LDH), finalizar gestación a las 37 semanas.',
      ],
      [
        { text: 'Preeclampsia con signos de gravedad', tone: 'critical', emphasize: true },
        'PAS ≥ 160 o PAD ≥ 110 (≥ 15 min) O plaquetas < 100,000, AST/ALT ≥ 2×, Cr > 1.1 (o 2× basal), edema pulmonar, cefalea/escotomas/epigastralgia',
        '1) MgSO₄ esquema Zuspan: 4 g IV en 15–20 min + 1 g/h. 2) Antihipertensivo rápido si ≥ 160/110: Labetalol IV, Nifedipino oral acción inmediata o Hidralazina IV. 3) Finalización tras estabilización (o maduración pulmonar si < 34 SG estable).',
      ],
      [
        { text: 'Eclampsia / Síndrome HELLP', tone: 'critical', emphasize: true },
        'Convulsiones tónico-clónicas nuevas (Eclampsia) o Hemólisis + Enzimas hepáticas elevadas + Plaquetas < 100,000 (HELLP)',
        'Vía aérea/decúbito lateral + MgSO₄ IV inmediato + control antihipertensivo + finalización obstétrica prioritaria.',
      ],
    ],
    keyManagementPearls: [
      'Durante infusión de MgSO₄ vigilar cada hora: reflejos osteotendinosos (abolición precoz de toxicidad), FR ≥ 12–16 rpm y diuresis ≥ 25–30 mL/h; antídoto: Gluconato de calcio 1 g IV.',
      'Prevención en gestantes de alto riesgo: AAS 100–150 mg/noche iniciado entre 12 y 16 SG hasta las 36 semanas.',
    ],
    references: [
      {
        citation:
          'ACOG Practice Bulletin No. 222: Gestational Hypertension and Preeclampsia. Obstet Gynecol. 2020;135(6):e237-e260.',
        year: 2020,
      },
      {
        citation:
          'Magee LA, Brown MA, Hall DR, et al. The 2021 International Society for the Study of Hypertension in Pregnancy (ISSHP) classification, diagnosis & management recommendations. Pregnancy Hypertens. 2022;27:148-169.',
        year: 2022,
      },
    ],
  },
  {
    id: 'stroke-code-aha-table',
    title: 'Código Ictus / ACV Isquémico Agudo: Ventanas, Metas de PA y Tiempos (AHA/ASA)',
    shortTitle: 'Código Ictus / ACV Agudo (AHA/ASA)',
    specialty: 'neurologia',
    secondarySpecialties: ['urgencias'],
    setting: 'urgencias',
    guidelineVersion: 'AHA/ASA Acute Stroke Guidelines',
    summary:
      'Metas cronológicas puerta-imagen-aguja y umbrales de presión arterial según elegibilidad para trombólisis o trombectomía.',
    columns: ['Fase / Escenario', 'Meta de tiempo o umbral', 'Conducta crítica en Urgencias'],
    rows: [
      [
        { text: 'Evaluación inicial y glucemia capilar', emphasize: true },
        '≤ 10 min desde llegada (puerta-médico)',
        'Aplicar escala NIHSS, hora exacta de último visto bien (LKW) y descartar hipoglucemia imitadora de ictus.',
      ],
      [
        { text: 'TC de cráneo simple (sin contraste)', tone: 'high', emphasize: true },
        'Realizar ≤ 25 min · Interpretación ≤ 45 min',
        'Único objetivo inmediato: descartar hemorragia intracraneal para habilitar reperfusión.',
      ],
      [
        { text: 'Trombólisis IV (Alteplasa / Tenecteplasa)', tone: 'critical', emphasize: true },
        'Ventana ≤ 4.5 horas (puerta-aguja ideal ≤ 60 min)',
        'Exige PA < 185/110 mmHg ANTES del bolo y mantener < 180/105 mmHg durante las primeras 24 h (labetalol o nicardipino IV).',
      ],
      [
        { text: 'Trombectomía mecánica (oclusión gran vaso)', tone: 'critical', emphasize: true },
        '≤ 6 horas (o hasta 24 h con TC perfusión / RM selectiva)',
        'Angio-TC urgente en déficit moderado-grave; no retrasar alteplasa IV si elegible.',
      ],
      [
        { text: 'Sin reperfusión (ACV isquémico no candidato)', tone: 'moderate', emphasize: true },
        'Primeras 24 – 48 horas',
        'Hipertensión permisiva: NO bajar PA salvo ≥ 220/120 mmHg (descenso máximo 15 % en 24 h) o emergencia concomitante (disección, IAM, edema pulmonar).',
      ],
    ],
    keyManagementPearls: [
      'En AIT de alto riesgo (ABCD2 ≥ 4 o estenosis sintomática) tras descartar hemorragia en TC: antiagregación dual temprana (AAS + clopidogrel × 21 días según ensayos CHANCE/POINT) y estudio carotídeo/cardioembólico urgente.',
    ],
    references: [
      {
        citation:
          'Powers WJ, Rabinstein AA, Ackerson T, et al. Guidelines for the Early Management of Patients With Acute Ischemic Stroke: 2019 Update. Stroke. 2019;50(12):e344-e418.',
        year: 2019,
      },
    ],
  },
  {
    id: 'dengue-paho-who-table',
    title: 'Dengue: Clasificación de Gravedad y Esquema de Líquidos (OPS / OMS)',
    shortTitle: 'Dengue: Grupos A, B y C (OPS/OMS)',
    specialty: 'infectologia',
    secondarySpecialties: ['urgencias', 'medicina-interna', 'pediatria'],
    setting: 'ambos',
    guidelineVersion: 'OPS / OMS (Edición vigente)',
    summary:
      'Criterios clínicos de triage para decidir manejo ambulatorio (Grupo A), hospitalización con signos de alarma (Grupo B2) o reanimación de choque (Grupo C).',
    columns: ['Grupo OPS / OMS', 'Criterios clínicos', 'Manejo de líquidos y vigilancia'],
    rows: [
      [
        { text: 'Grupo A — Dengue sin signos de alarma', tone: 'normal', emphasize: true },
        'Fiebre + síntomas clásicos, tolera VO, diuresis adecuada, sin comorbilidad de riesgo ni alarma',
        'Ambulatorio: hidratación oral abundante (SRO), paracetamol; CONTRAINDICADOS AINEs, AAS y corticoides. Control clínico y BH cada 24–48 h (vigilar defervescencia).',
      ],
      [
        { text: 'Grupo B1 — Sin alarma pero con condición asociada', tone: 'low', emphasize: true },
        'Embarazo, lactante, adulto mayor, obesidad mórbida, DM, nefropatía o riesgo social',
        'Observación / ingreso para asegurar hidratación oral o IV de mantenimiento (2–3 mL/kg/h) y vigilancia estrecha de signos de alarma.',
      ],
      [
        { text: 'Grupo B2 — Dengue con signos de alarma', tone: 'high', emphasize: true },
        'Dolor abdominal intenso/continuo, vómitos persistentes, derrames serosos, sangrado mucosas, letargia/irritabilidad, hepatomegalia > 2 cm, ↑ Hto con caída rápida plaquetas',
        'Hospitalización inmediata: Cristaloide isotónico IV 10 mL/kg en 1 h; reevaluar Hto y signos vitales; reducir gradualmente (5–7 → 3–5 → 2–3 mL/kg/h) según estabilidad.',
      ],
      [
        { text: 'Grupo C — Dengue grave', tone: 'critical', emphasize: true },
        'Choque por extravasación, distrés respiratorio, sangrado grave o falla orgánica grave (AST/ALT ≥ 1000, SNC, miocarditis)',
        'UCI/Reanimación: Bolo cristaloide isotónico 20 mL/kg IV en 15–30 min; repetir si persiste choque; evaluar coloides o transfusión si caída de Hto sin mejoría clínica.',
      ],
    ],
    keyManagementPearls: [
      'La fase crítica (extravasación plasmática y choque) suele iniciar al caer la fiebre (días 3–7), NO durante el pico febril inicial.',
      'Evitar transfusión profiláctica de plaquetas en ausencia de sangrado activo grave o procedimiento invasivo urgente.',
    ],
    references: [
      {
        citation:
          'Organización Panamericana de la Salud (OPS/OMS). Guías para la atención de enfermos con dengue en la Región de las Américas (2.ª ed.).',
        year: 2016,
      },
    ],
  },
];
