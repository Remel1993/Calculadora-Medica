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
    id: 'vital-signs-by-age-table',
    title: 'Signos Vitales Normales y Umbrales de Alarma por Grupo Etario (Neonato a Adulto Mayor)',
    shortTitle: 'Signos Vitales por Grupo Etario',
    specialty: 'pediatria',
    secondarySpecialties: ['urgencias', 'medicina-interna', 'geriatria'],
    setting: 'ambos',
    guidelineVersion: 'AHA PALS 2020 · OMS AIEPI · Nelson 22.ª ed. · NEWS2',
    summary:
      'Parámetros fisiológicos normales en reposo (despierto) y puntos de corte exactos de taquipnea OMS e hipotensión arterial PALS/adulto por grupos de edad mutuamente excluyentes.',
    columns: [
      'Grupo etario',
      'FC despierto (lpm)',
      'FR (rpm) / Taquipnea',
      'PA normal / Hipotensión (mmHg)',
      'Temperatura y SpO₂',
    ],
    rows: [
      [
        { text: 'Recién nacido (0 a 28 días)', tone: 'neutral', emphasize: true },
        '100 – 180 lpm (dormido: 90–160; alarma < 100 o > 180 lpm)',
        '30 – 60 rpm · Taquipnea OMS: ≥ 60 rpm',
        'PAS 60–85 / PAD 35–55 · Hipotensión PALS: PAS < 60 mmHg (o PAM < edad gestacional en semanas)',
        '36.5 – 37.5 °C (fiebre ≥ 38.0 °C = alto riesgo sepsis neonatal) · SpO₂ posductal ≥ 95 % tras 24 h',
      ],
      [
        { text: 'Lactante (1 a 11 meses)', tone: 'neutral', emphasize: true },
        '100 – 160 lpm (dormido: 90–140; alarma < 90 o > 180 lpm)',
        '30 – 50 rpm · Taquipnea OMS: ≥ 60 rpm (< 2 m) o ≥ 50 rpm (2–11 m)',
        'PAS 72–104 / PAD 37–56 · Hipotensión PALS: PAS < 70 mmHg',
        '36.5 – 37.5 °C (fiebre ≥ 38.0 °C en < 3 m = cribado sepsis obligatorio) · SpO₂ ≥ 95 % (alerta < 92 %)',
      ],
      [
        { text: 'Niño pequeño (1 a 2 años [12–35 meses])', tone: 'neutral', emphasize: true },
        '98 – 140 lpm (dormido: 80–120)',
        '22 – 37 rpm · Taquipnea OMS: ≥ 40 rpm',
        'PAS 86–106 / PAD 42–63 · Hipotensión PALS: PAS < [70 + (2 × edad en años)] mmHg',
        '36.5 – 37.5 °C (fiebre ≥ 38.0 °C) · SpO₂ ≥ 95 % (alerta < 92 %)',
      ],
      [
        { text: 'Preescolar (3 a 5 años)', tone: 'neutral', emphasize: true },
        '80 – 120 lpm (dormido: 65–100)',
        '20 – 28 rpm · Taquipnea OMS: ≥ 40 rpm (12–59 meses)',
        'PAS 89–112 / PAD 46–72 · Hipotensión PALS: PAS < [70 + (2 × edad en años)] mmHg',
        '36.5 – 37.5 °C (fiebre ≥ 38.0 °C) · SpO₂ ≥ 95 % (alerta < 92 %)',
      ],
      [
        { text: 'Escolar (6 a 11 años)', tone: 'neutral', emphasize: true },
        '75 – 118 lpm (6–9 años) · 65 – 100 lpm (10–11 años)',
        '18 – 25 rpm · Taquipnea de alarma: ≥ 30 rpm',
        'PAS 97–120 / PAD 57–76 · Hipotensión PALS: < [70 + (2 × edad)] (< 10 a) o PAS < 90 mmHg (≥ 10 a)',
        '36.4 – 37.4 °C (fiebre ≥ 38.0 °C) · SpO₂ ≥ 95 % (alerta < 92 %)',
      ],
      [
        { text: 'Adolescente (12 a 17 años)', tone: 'neutral', emphasize: true },
        '60 – 100 lpm (dormido: 50–90)',
        '12 – 20 rpm · Taquipnea: > 20 rpm (alarma ≥ 25 rpm)',
        'PAS 110–131 / PAD 64–83 · Hipotensión: PAS < 90 mmHg (o PAM < 65 mmHg)',
        '36.1 – 37.4 °C (fiebre ≥ 38.0 °C) · SpO₂ ≥ 95 % (alerta < 92 %)',
      ],
      [
        { text: 'Adulto (18 a 64 años)', tone: 'normal', emphasize: true },
        '60 – 100 lpm (bradicardia < 60; taquicardia > 100)',
        '12 – 20 rpm (NEWS2 normal: 12–20; alerta ≤ 8 o ≥ 25 rpm)',
        'PA óptima/no elevada < 120/70–80 · Hipotensión: PAS < 90 mmHg, PAD < 60 mmHg o PAM < 65 mmHg',
        '36.1 – 37.5 °C (hipotermia < 35.0; fiebre ≥ 38.0–38.3 °C) · SpO₂ 95–100 % (EPOC hipercápnico: meta 88–92 %)',
      ],
      [
        { text: 'Adulto mayor (≥ 65 años)', tone: 'low', emphasize: true },
        '60 – 100 lpm (posible respuesta cronotrópica atenuada por betabloqueantes o disfunción sinusal)',
        '12 – 20 rpm (FR ≥ 22–25 rpm suele ser el signo más precoz de sepsis o neumonía)',
        'Hipotensión: PAS < 90 mmHg o caída ≥ 20–30 % sobre PA basal (en HTA crónica puede haber hipoperfusión con PAS 100–110 mmHg)',
        'Basal algo menor (~36.0–37.2 °C; infección grave puede cursar afebril o con ≥ 37.8 °C) · SpO₂ 94–98 %',
      ],
    ],
    keyManagementPearls: [
      'La fiebre eleva fisiológicamente la FC (~10 lpm por cada °C > 38 °C) y la FR (~2–3 rpm por °C); reevaluar siempre al niño calmado y tras control térmico.',
      'El llanto, dolor o ansiedad elevan transitoriamente FC, FR y PAS; medir la FR durante 60 segundos completos en lactantes antes de estimularlos.',
      'En altitud elevada (> 2,500 m s. n. m.), la SpO₂ basal normal disminuye (~90–94 %); interpretar junto al trabajo respiratorio y estado de perfusión.',
      'Para diagnosticar hipertensión arterial crónica en niños de 1 a 17 años deben usarse los percentiles AAP 2017 por sexo, edad y talla (disponibles en la calculadora de PA Pediátrica).',
    ],
    cautionNote:
      'La hipotensión arterial en pediatría es un signo TARDÍO de choque descompensado. El choque compensado debe identificarse precozmente ante taquicardia sostenida, relleno capilar > 2 s, pulsos periféricos débiles, frialdad distal y alteración del nivel de conciencia.',
    references: [
      {
        citation:
          'Topjian AA, Raymond TT, Atkins D, et al. Part 4: Pediatric Basic and Advanced Life Support: 2020 American Heart Association Guidelines for CPR and ECC. Circulation. 2020;142(16_suppl_2):S469-S523.',
        year: 2020,
      },
      {
        citation:
          'World Health Organization (WHO). Integrated Management of Childhood Illness (IMCI) Chart Booklet & Pocket Book of Hospital Care for Children (2nd ed.). 2013/2014.',
        year: 2014,
      },
      {
        citation:
          'Royal College of Physicians (RCP). National Early Warning Score (NEWS) 2: Standardising the assessment of acute-illness severity in the NHS. 2017.',
        year: 2017,
      },
    ],
  },
  {
    id: 'htn-esc-acc-table',
    title: 'Hipertensión Arterial Sistémica: Clasificación y Metas (ESC 2024 vs. ACC/AHA 2017)',
    shortTitle: 'Hipertensión Arterial (ESC / ACC)',
    specialty: 'cardiologia',
    secondarySpecialties: ['medicina-interna', 'urgencias'],
    setting: 'ambos',
    guidelineVersion: 'ESC 2024 / ACC-AHA 2017',
    summary:
      'Comparativa oficial con umbrales exactos y mutuamente excluyentes de presión arterial en consulta, crisis hipertensiva y metas terapéuticas.',
    columns: ['Categoría clínica', 'ESC 2024 (Europa)', 'ACC/AHA 2017 (EE. UU.)', 'Conducta inicial orientativa'],
    rows: [
      [
        { text: 'Normal / No elevada', tone: 'normal', emphasize: true },
        'PAS < 120 y PAD < 70 mmHg',
        'PAS < 120 y PAD < 80 mmHg',
        'Hábitos saludables y reevaluación cada 1–3 años (anual si ≥ 40 años o factores de riesgo).',
      ],
      [
        { text: 'PA Elevada', tone: 'low', emphasize: true },
        'PAS 120–139 o PAD 70–89 mmHg (sin llegar a ≥ 140/90)',
        'PAS 120–129 y PAD < 80 mmHg',
        'Estilo de vida; evaluar riesgo CV global (SCORE2/ASCVD) a 3 meses (ESC considera fármaco si riesgo alto y PA ≥ 130/80).',
      ],
      [
        { text: 'HTA Grado / Estadio 1', tone: 'moderate', emphasize: true },
        'PAS 140–159 o PAD 90–99 mmHg (ESC 2024: Hipertensión)',
        'PAS 130–139 o PAD 80–89 mmHg',
        'Iniciar IECA/ARA-II, BCC o tiazídico según riesgo CV (ESC inicia combinación dual en 1 comprimido si ≥ 140/90).',
      ],
      [
        { text: 'HTA Grado 2 (ESH) / Estadio 2 (ACC)', tone: 'high', emphasize: true },
        'PAS 160–179 o PAD 100–109 mmHg (Grado 3 ESH: ≥ 180/110)',
        'PAS ≥ 140 o PAD ≥ 90 mmHg',
        'Combinación dual en 1 comprimido (IECA/ARA-II + BCC o diurético) + tamizaje de daño a órgano blanco.',
      ],
      [
        { text: 'Crisis / Emergencia hipertensiva', tone: 'critical', emphasize: true },
        'PAS ≥ 180 o PAD ≥ 110 mmHg (Emergencia si daño orgánico agudo; HTA grave si sin daño)',
        'PAS > 180 o PAD > 120 mmHg (Urgencia sin daño vs. Emergencia con daño agudo)',
        'Sin daño agudo: reposo y ajuste oral gradual en 24–48 h. Con daño agudo (IAM, ACV, EPA, disección, IRA): antihipertensivo IV titulado en UCI/Urgencias.',
      ],
    ],
    keyManagementPearls: [
      'Confirmar siempre con MAPA (media 24 h ≥ 130/80 mmHg) o AMPA domiciliario (media ≥ 135/85 mmHg) antes de etiquetar HTA de bata blanca.',
      'Meta ESC 2024 bajo tratamiento si se tolera: PAS 120–129 mmHg y PAD 70–79 mmHg; en pacientes frágiles o ≥ 85 años individualizar a < 140/90 mmHg según tolerancia.',
      'En urgencia hipertensiva sin daño a órgano blanco, NO usar nifedipino sublingual ni descender la PA bruscamente (riesgo de isquemia cerebral, coronaria o renal).',
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
    title: 'Diabetes Mellitus y Prediabetes: Criterios Diagnósticos Oficiales (ADA 2024)',
    shortTitle: 'Diabetes Mellitus: Diagnóstico (ADA)',
    specialty: 'endocrinologia',
    secondarySpecialties: ['medicina-interna'],
    setting: 'consulta-externa',
    guidelineVersion: 'ADA Standards of Care 2024',
    summary:
      'Puntos de corte diagnósticos exactos para normoglucemia, prediabetes y diabetes mellitus en adultos no gestantes.',
    columns: ['Prueba diagnóstica', 'Normal', 'Prediabetes', 'Diabetes Mellitus'],
    rows: [
      [
        { text: 'Glucosa plasmática en ayuno (≥ 8 h sin calorías)', emphasize: true },
        '< 100 mg/dL (< 5.6 mmol/L)',
        { text: '100 – 125 mg/dL (5.6 – 6.9 mmol/L · GAA)', tone: 'low' },
        { text: '≥ 126 mg/dL (≥ 7.0 mmol/L)', tone: 'high' },
      ],
      [
        { text: 'PTOG 2 horas (carga oral de 75 g de glucosa anhidra)', emphasize: true },
        '< 140 mg/dL (< 7.8 mmol/L)',
        { text: '140 – 199 mg/dL (7.8 – 11.0 mmol/L · ITG)', tone: 'low' },
        { text: '≥ 200 mg/dL (≥ 11.1 mmol/L)', tone: 'high' },
      ],
      [
        { text: 'Hemoglobina glucosilada (HbA1c estandarizada NGSP)', emphasize: true },
        '< 5.7 % (< 39 mmol/mol)',
        { text: '5.7 – 6.4 % (39 – 47 mmol/mol)', tone: 'low' },
        { text: '≥ 6.5 % (≥ 48 mmol/mol)', tone: 'high' },
      ],
      [
        { text: 'Glucosa plasmática aleatoria (cualquier hora del día)', emphasize: true },
        'No diagnóstica de normalidad',
        'No aplica para prediabetes',
        { text: '≥ 200 mg/dL (≥ 11.1 mmol/L) + síntomas clásicos o crisis hiperglucémica', tone: 'critical' },
      ],
    ],
    keyManagementPearls: [
      'En ausencia de hiperglucemia inequívoca (síntomas clásicos + glucosa ≥ 200 mg/dL o crisis), el diagnóstico exige 2 resultados anormales (dos pruebas distintas en la misma muestra o la misma prueba repetida en otro día).',
      'Metas glucémicas generales ADA 2024 en adultos no gestantes: HbA1c < 7.0 %, glucosa capilar preprandial 80–130 mg/dL, pico posprandial (1–2 h tras inicio de comida) < 180 mg/dL y Tiempo en Rango (70–180 mg/dL) > 70 %. En adultos mayores frágiles o alto riesgo de hipoglucemia: individualizar a HbA1c < 7.5 % (o < 8.0 % si fragilidad grave).',
      'En pacientes con DM2 y ECV establecida, insuficiencia cardíaca o ERC: priorizar iSGLT2 y/o arGLP-1 con beneficio cardiorrenal demostrado independientemente de la HbA1c basal.',
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
      'Criterios diagnósticos exactos de CAD (leve, moderada y grave) frente a Estado Hiperosmolar Hiperglucémico (EHH) y secuencia inicial de reanimación.',
    columns: ['Criterio bioquímico / clínico', 'CAD Leve', 'CAD Moderada / Grave', 'Estado Hiperosmolar (EHH)'],
    rows: [
      [
        { text: 'Glucosa plasmática', emphasize: true },
        '≥ 200 mg/dL (o antecedente de DM; incluye CAD euglucémica si < 200)',
        '≥ 200 mg/dL (o antecedente de DM; incluye CAD euglucémica si < 200)',
        { text: '≥ 600 mg/dL (≥ 33.3 mmol/L)', tone: 'critical' },
      ],
      [
        { text: 'pH arterial o venoso', emphasize: true },
        '7.25 – 7.29 (o 7.30 si HCO₃⁻ < 18)',
        { text: 'Moderada: 7.00 – 7.24 · Grave: < 7.00', tone: 'critical' },
        '≥ 7.30',
      ],
      [
        { text: 'Bicarbonato sérico (HCO₃⁻)', emphasize: true },
        '15.0 – 17.9 mEq/L',
        { text: 'Moderada: 10.0 – 14.9 · Grave: < 10.0 mEq/L', tone: 'critical' },
        '≥ 15.0 mEq/L (con cetonas negativas/bajas)',
      ],
      [
        { text: 'Cetonas (β-hidroxibutirato / orina)', emphasize: true },
        'β-HB ≥ 3.0 mmol/L o cetonuria ≥ 2+',
        'β-HB ≥ 3.0 mmol/L o cetonuria ≥ 2+',
        'β-HB < 3.0 mmol/L y cetonuria < 2+',
      ],
      [
        { text: 'Osmolaridad sérica efectiva [2×Na⁺ + Glucosa/18]', emphasize: true },
        '≤ 300 mOsm/kg',
        'Habitualmente ≤ 300 mOsm/kg (si > 300 + criterios CAD: síndrome mixto CAD-EHH)',
        { text: '> 300 mOsm/kg (osmolaridad total > 320 mOsm/kg)', tone: 'critical' },
      ],
      [
        { text: 'Estado mental', emphasize: true },
        'Alerta',
        'Moderada: alerta o somnoliento · Grave: estupor o coma',
        { text: 'Obnubilación, estupor o coma', tone: 'high' },
      ],
    ],
    keyManagementPearls: [
      '1.º Líquidos IV: Cristaloides isotónicos (SS 0.9 % o Ringer Lactato) 500–1000 mL/h durante las primeras 2–4 h según estado hemodinámico (en EHH reposición hídrica cuidadosa; usar Na⁺ corregido para elegir solución posterior).',
      '2.º Potasio ANTES de insulina: Si K⁺ < 3.5 mEq/L, DIFERIR insulina y reponer K⁺ 20–40 mEq/h hasta K⁺ ≥ 3.5 mEq/L. Si K⁺ 3.5–5.5 mEq/L, agregar 20–30 mEq/L de KCl a cada litro de infusión. Si K⁺ > 5.5 mEq/L, no agregar K⁺ y vigilar cada 2 h.',
      '3.º Insulina y dextrosa: Insulina regular IV 0.1 U/kg/h (en EHH puro puede iniciarse 0.05 U/kg/h tras reposición inicial). Cuando glucosa < 250 mg/dL en CAD (o < 300 mg/dL en EHH), agregar dextrosa 5 %–10 % para mantener glucosa en 150–200 mg/dL (CAD) o 200–250 mg/dL (EHH) hasta resolución (CAD resuelta: pH ≥ 7.30, HCO₃⁻ ≥ 18 mEq/L y β-HB < 0.6 mmol/L).',
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
    title: 'Asma Bronquial: Clasificación de Gravedad de la Crisis Aguda y Manejo (GEMA 5.4 / GINA 2024)',
    shortTitle: 'Asma: Gravedad de Crisis (GEMA / GINA)',
    specialty: 'neumologia',
    secondarySpecialties: ['urgencias', 'medicina-interna'],
    setting: 'ambos',
    guidelineVersion: 'GEMA 5.4 (2024) · GINA 2024',
    summary:
      'Criterios objetivos mutuamente excluyentes para diferenciar crisis asmática leve, moderada, grave y de riesgo vital inminente en Urgencias y su tratamiento inmediato.',
    columns: [
      'Parámetro clínico',
      'Crisis Leve',
      'Crisis Moderada',
      'Crisis Grave',
      'Riesgo Vital Inminente',
    ],
    rows: [
      [
        { text: 'Disnea, habla y conciencia', emphasize: true },
        'Disnea al caminar; habla en párrafos completos; alerta (puede acostarse)',
        { text: 'Disnea al hablar (prefiere estar sentado); habla en frases; alerta', tone: 'low' },
        { text: 'Disnea en reposo (inclinado hacia adelante); habla solo palabras sueltas; agitado', tone: 'high' },
        { text: 'Incapaz de hablar; somnoliento, confuso, exhausto o en coma', tone: 'critical' },
      ],
      [
        { text: 'FR y musculatura accesoria', emphasize: true },
        'FR normal o < 20 rpm; sin uso de músculos accesorios',
        { text: 'FR 20 – 30 rpm; uso leve/moderado de músculos accesorios', tone: 'low' },
        { text: 'FR > 30 rpm; uso evidente de músculos accesorios (tiraje)', tone: 'high' },
        { text: 'Bradipnea, esfuerzo respiratorio débil o respiración paradójica', tone: 'critical' },
      ],
      [
        { text: 'FC y auscultación', emphasize: true },
        'FC < 100 lpm; sibilancias espiratorias leves',
        { text: 'FC 100 – 120 lpm; sibilancias intensas en toda la espiración', tone: 'low' },
        { text: 'FC > 120 lpm; sibilancias intensas inspiratorias y espiratorias', tone: 'high' },
        { text: 'Bradicardia, hipotensión arterial o tórax silente (sin ruidos)', tone: 'critical' },
      ],
      [
        { text: 'FEM (PEF) / FEV₁ y SpO₂', emphasize: true },
        'FEM > 70 % del predicho/mejor · SpO₂ > 95 %',
        { text: 'FEM 51 – 70 % · SpO₂ 90 – 95 %', tone: 'low' },
        { text: 'FEM 33 – 50 % · SpO₂ < 90 % (niños < 92 %)', tone: 'critical' },
        { text: 'FEM < 33 % (incapaz de soplar) · SpO₂ < 90 % con PaCO₂ > 45 mmHg', tone: 'critical' },
      ],
      [
        { text: 'Manejo agudo inmediato (Urgencias)', emphasize: true },
        'SABA 2–4 inhalaciones con cámara (c/20 min × 1 h si precisa); valorar alta con ICS-formoterol y plan escrito',
        'SABA 4–10 inhalaciones c/20 min × 1 h (o nebulizado) + Prednisona oral 40–50 mg (niños 1–2 mg/kg, máx 40 mg) + O₂ si SpO₂ < 93 %',
        'O₂ titulado (meta 93–95 % adulto; 94–98 % niño) + SABA + Bromuro de ipratropio + Corticoide sistémico inmediato + MgSO₄ 2 g IV en 20 min si refractaria a 1 h',
        'Activación UCI / vía aérea avanzada + SABA continuo + Ipratropio + Hidrocortisona 100 mg IV (o metilprednisolona) + MgSO₄ 2 g IV',
      ],
    ],
    keyManagementPearls: [
      'Un único parámetro en una categoría superior clasifica toda la crisis en ese nivel de gravedad. Aunque GINA 2024 agrupa la crisis leve y moderada en un mismo bloque operativo inicial, GEMA 5.4 y BTS/SIGN las separan con umbrales objetivos (FC < 100 vs 100–120 lpm, FR < 20 vs 20–30 rpm, FEM > 70 % vs 51–70 %, SpO₂ > 95 % vs 90–95 %) para graduar la intensidad broncodilatadora y la indicación de corticoide sistémico.',
      'Control ambulatorio GINA 2024 (≥ 12 años, Track 1 preferido): Pasos 1–2 = ICS-formoterol dosis baja a demanda; Paso 3 = ICS-formoterol dosis baja mantenimiento y rescate (MART); Paso 4 = ICS-formoterol dosis media MART; Paso 5 = agregar LAMA + derivación para fenotipado y biológicos.',
      'GINA 2024 contraindica el uso de SABA en monoterapia sin corticoide inhalado por incremento de exacerbaciones graves y mortalidad.',
    ],
    references: [
      {
        citation:
          'GEMA 5.4. Guía Española para el Manejo del Asma. Sociedad Española de Neumología y Cirugía Torácica (SEPAR), 2024.',
        year: 2024,
      },
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
      'Diagnóstico funcional (VEF₁/CVF < 0.70 posbroncodilatador), asignación inicial por grupos ABE y criterios objetivos de VNI en urgencias.',
    columns: ['Grupo / Escenario', 'Criterios clínicos objetivos', 'Terapia inicial recomendada (Consulta)', 'Exacerbación aguda (Urgencias)'],
    rows: [
      [
        { text: 'Grupo A (Pocos síntomas, bajo riesgo)', tone: 'normal', emphasize: true },
        '0 o 1 exacerbación moderada (sin hospitalización) en el último año · mMRC 0–1 Y CAT < 10',
        'Un broncodilatador (LAMA o LABA de acción prolongada preferible sobre SABA)',
        'SABA ± SAMA cada 4–6 h; investigar infección respiratoria o desencadenante.',
      ],
      [
        { text: 'Grupo B (Más síntomas, bajo riesgo)', tone: 'moderate', emphasize: true },
        '0 o 1 exacerbación moderada (sin hospitalización) en el último año · mMRC ≥ 2 O CAT ≥ 10',
        'Doble broncodilatación fija: LABA + LAMA en inhalador único',
        'Oxígeno suplementario titulado estrictamente a meta SpO₂ 88–92 % (evitar hiperoxia).',
      ],
      [
        { text: 'Grupo E (Alto riesgo de exacerbación)', tone: 'high', emphasize: true },
        '≥ 2 exacerbaciones moderadas O ≥ 1 exacerbación con hospitalización en el último año',
        'LABA + LAMA; considerar triple terapia (LABA+LAMA+ICS) desde el inicio si eosinófilos ≥ 300 cél/µL',
        'Prednisona 40 mg/día VO × 5 días + Antibiótico (5–7 d) si ↑ volumen/purulencia del esputo o requiere VNI.',
      ],
      [
        { text: 'Exacerbación con Insuficiencia Respiratoria Aguda', tone: 'critical', emphasize: true },
        'Acidosis respiratoria (pH ≤ 7.35 Y PaCO₂ ≥ 45 mmHg) o disnea grave con fatiga muscular / hipoxemia refractaria',
        'Al egreso: rehabilitación pulmonar, vacunación y valorar oxigenoterapia domiciliaria si PaO₂ ≤ 55 mmHg estable',
        'Ventilación Mecánica No Invasiva (VNI) de primera línea si no hay contraindicación; gasometría de control en 1–2 h.',
      ],
    ],
    keyManagementPearls: [
      'Gravedad espirométrica posbroncodilatador (requiere VEF₁/CVF < 0.70): GOLD 1 (VEF₁ ≥ 80 %), GOLD 2 (50–79 %), GOLD 3 (30–49 %), GOLD 4 (< 30 %).',
      'Umbrales de eosinófilos en sangre para añadir ICS al seguimiento: ≥ 300 cél/µL favorece firmemente ICS; 100–299 cél/µL valorar si ≥ 2 exacerbaciones moderadas/año; < 100 cél/µL evitar ICS (mayor riesgo de neumonía).',
      'En exacerbación aguda de EPOC, mantener SpO₂ 88–92 %: saturar > 92 % con alto flujo empeora la hipercapnia por pérdida de vasoconstricción hipóxica y efecto Haldane.',
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
      'Definiciones operativas Sepsis-3 y metas tiempo-dependientes para diagnóstico, antibióticos, fluidos y vasopresores.',
    columns: ['Elemento / Acción crítica', 'Objetivo / Umbral clínico exacto', 'Plazo / Conducta recomendada'],
    rows: [
      [
        { text: 'Definición Sepsis (Sepsis-3)', tone: 'high', emphasize: true },
        'Infección sospechada o documentada + incremento agudo ΔSOFA ≥ 2 puntos',
        'Evaluar disfunción orgánica inmediata (PaFi, plaquetas, bilirrubina, PAM/vasopresor, Glasgow, creatinina/diuresis).',
      ],
      [
        { text: 'Definición Choque Séptico', tone: 'critical', emphasize: true },
        'Hipotensión que requiere vasopresor para PAM ≥ 65 mmHg Y Lactato > 2.0 mmol/L (> 18 mg/dL) tras reanimación hídrica',
        'Mortalidad hospitalaria > 40 %; manejo inmediato en área de choque / UCI.',
      ],
      [
        { text: '1. Medición de lactato sérico', emphasize: true },
        'Medir basal; si lactato inicial ≥ 2.0 mmol/L, repetir cada 2–4 horas',
        'Guiar la reanimación buscando aclaramiento progresivo del lactato y normalización de perfusión capilar.',
      ],
      [
        { text: '2. Hemocultivos previos al antibiótico', emphasize: true },
        'Al menos 2 sets (aerobio + anaerobio) de sitios de punción distintos',
        'Tomar antes del antimicrobiano SIEMPRE que no retrase su administración > 45 minutos.',
      ],
      [
        { text: '3. Antimicrobianos IV de amplio espectro', tone: 'critical', emphasize: true },
        'Choque séptico o sepsis probable/confirmada: ≤ 1 hora · Sepsis posible sin choque: ≤ 3 horas (mientras se investiga)',
        'Cobertura empírica dirigida al foco sospechado y patrones locales de resistencia (MRSA/BLEE/Pseudomonas según riesgo).',
      ],
      [
        { text: '4. Reanimación hídrica', emphasize: true },
        'Cristaloides balanceados (Ringer Lactato / Plasma-Lyte) 30 mL/kg IV si hipoperfusión (lactato ≥ 4.0 mmol/L o hipotensión)',
        'Iniciar de inmediato y completar dentro de las primeras 3 horas reevaluando congestión/respuesta dinámica.',
      ],
      [
        { text: '5. Vasopresor (Norepinefrina 1.ª línea)', tone: 'high', emphasize: true },
        'Meta PAM ≥ 65 mmHg',
        'Iniciar precozmente (puede iniciarse por vía periférica proximal ≥ 18–20G de forma temporal) si persiste hipotensión.',
      ],
    ],
    keyManagementPearls: [
      'SSC 2021 recomienda NO usar qSOFA como herramienta única de tamizaje por su baja sensibilidad; preferir NEWS2, SIRS o MEWS junto al juicio clínico.',
      'Tras el bolo inicial, evaluar respuesta dinámica a fluidos (elevación pasiva de piernas, variación de presión de pulso o ecografía de vena cava/pulmón) antes de administrar más volumen.',
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
    title: 'Neumonía Adquirida en la Comunidad (NAC): Sitio de Cuidado y Esquema Empírico (ATS/IDSA)',
    shortTitle: 'Neumonía (NAC): Sitio y Esquema',
    specialty: 'infectologia',
    secondarySpecialties: ['neumologia', 'urgencias', 'medicina-interna'],
    setting: 'ambos',
    guidelineVersion: 'ATS / IDSA 2019',
    summary:
      'Criterios objetivos para definir ámbito de atención (ambulatorio, hospitalización en piso o UCI) y terapia empírica inicial en adultos.',
    columns: ['Escenario clínico', 'Criterios objetivos de clasificación', 'Esquema empírico inicial (adultos)'],
    rows: [
      [
        { text: 'Ambulatorio sin comorbilidades ni riesgo MRSA/Pseudomonas', tone: 'normal', emphasize: true },
        'CURB-65 0–1 (o PSI I–II), SpO₂ ≥ 92 % aire ambiente, hemodinamia estable, tolera vía oral',
        'Amoxicilina 1 g c/8 h VO, o Doxiciclina 100 mg c/12 h VO, o Macrólido (azitromicina 500 mg d1 luego 250 mg/d × 4 d) solo si resistencia local neumococo < 25 %.',
      ],
      [
        { text: 'Ambulatorio con comorbilidades (EPOC, DM, cardiopatía, hepatopatía, ERC)', tone: 'low', emphasize: true },
        'CURB-65 0–1, SpO₂ ≥ 92 %, estable y tolera vía oral (sin criterios de ingreso)',
        'Amoxicilina/clavulánico 875/125 mg c/12 h (o cefpodoxima/cefuroxima) + Macrólido o Doxiciclina; o Monoterapia con Fluoroquinolona respiratoria (levofloxacino 750 mg/d o moxifloxacino 400 mg/d).',
      ],
      [
        { text: 'Hospitalizado en sala general (NAC no grave)', tone: 'moderate', emphasize: true },
        'CURB-65 ≥ 2, PSI ≥ III, hipoxemia (SpO₂ < 92 % o PaO₂ < 60 mmHg) o intolerancia oral',
        'β-lactámico IV (Ceftriaxona 1–2 g c/24 h o Ampicilina/sulbactam) + Macrólido (o Doxiciclina); alternativa: Fluoroquinolona respiratoria IV/VO.',
      ],
      [
        { text: 'NAC Grave (UCI)', tone: 'critical', emphasize: true },
        '≥ 1 criterio mayor (choque séptico con vasopresor o ventilación mecánica invasiva) O ≥ 3 criterios menores ATS/IDSA',
        'β-lactámico IV + Macrólido o Fluoroquinolona respiratoria (añadir Vancomicina/Linezolid o cobertura antipseudomónica solo si factores de riesgo validados o aislamiento previo).',
      ],
    ],
    keyManagementPearls: [
      'Los 9 criterios menores ATS/IDSA de NAC grave: FR ≥ 30 rpm, PaO₂/FiO₂ ≤ 250 mmHg, infiltrados multilobares, confusión/desorientación, BUN ≥ 20 mg/dL (urea ≥ 43 mg/dL), leucocitos < 4,000/µL, plaquetas < 100,000/µL, temperatura < 36.0 °C, hipotensión que requiere reanimación agresiva con líquidos.',
      'Duración estándar de tratamiento: mínimo 5 días siempre que el paciente esté afebril 48–72 h y clínicamente estable (sin criterios de inestabilidad al alta).',
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
        { text: 'Bajo (1/año si ERC confirmada)', tone: 'normal' },
        { text: 'Moderado (1/año)', tone: 'low' },
        { text: 'Alto (2/año)', tone: 'high' },
      ],
      [
        { text: 'G2 — Ligeramente baja (60–89)', emphasize: true },
        { text: 'Bajo (1/año si ERC confirmada)', tone: 'normal' },
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
      'Criterios de derivación a Nefrología (KDIGO 2024): riesgo renal a 5 años (KFRE) ≥ 3 % (umbral KDIGO 3–5 %), TFGe < 30 mL/min/1.73 m² (G4–G5), CAC persistente ≥ 300 mg/g (A3) o proteína/creatinina ≥ 500 mg/g, descenso sostenido de TFGe > 20–25 % o > 5 mL/min/año, hematuria glomerular no urológica o HTA refractaria a ≥ 4 fármacos.',
      'El diagnóstico de ERC requiere persistencia > 3 meses de TFGe < 60 mL/min/1.73 m² y/o marcador de daño renal (CAC ≥ 30 mg/g, sedimento activo, alteración tubular o imagen renal anormal). G1–G2 con A1 aislado NO es ERC.',
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
      'Estadificación con límites horarios y bioquímicos no solapados (clasifica el criterio más grave entre creatinina y diuresis) y acciones inmediatas.',
    columns: ['Estadio KDIGO', 'Criterio de Creatinina Sérica', 'Criterio de Gasto Urinario', 'Acciones inmediatas'],
    rows: [
      [
        { text: 'Estadio 1', tone: 'low', emphasize: true },
        '1.5–1.9× valor basal (en ≤ 7 días) O incremento ≥ 0.3 mg/dL (en ≤ 48 h)',
        '< 0.5 mL/kg/h durante 6 a < 12 horas',
        'Evaluar volemia y perfusión, suspender AINEs/aminoglucósidos/nefrotóxicos, ajustar dosis renales, buscar foco séptico u obstructivo.',
      ],
      [
        { text: 'Estadio 2', tone: 'moderate', emphasize: true },
        '2.0 – 2.9× valor basal',
        '< 0.5 mL/kg/h durante ≥ 12 horas',
        'Control horario de diuresis, monitorizar K⁺, HCO₃⁻ y balance hídrico estricto; ecografía renal/vesical para descartar obstrucción.',
      ],
      [
        { text: 'Estadio 3', tone: 'critical', emphasize: true },
        '≥ 3.0× valor basal, O Cr ≥ 4.0 mg/dL (con incremento agudo), O inicio de TRR (en < 18 años: TFGe < 35 mL/min/1.73 m²)',
        '< 0.3 mL/kg/h durante ≥ 24 horas O anuria ≥ 12 horas',
        'Valoración prioritaria por Nefrología/UCI; vigilar indicaciones urgentes de diálisis (AEIOU).',
      ],
    ],
    keyManagementPearls: [
      'Indicaciones urgentes de Terapia de Reemplazo Renal (nemotecnia AEIOU): Acidosis metabólica grave refractaria (pH < 7.15), Electrolitos (hiperpotasemia refractaria a manejo médico), Intoxicaciones dializables (litio, metanol, etilenglicol, salicilatos), Sobrecarga hídrica (Overload) con edema pulmonar refractario a diuréticos, Uremia sintomática (encefalopatía, pericarditis o sangrado urémico).',
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
    id: 'hyponatremia-ese-esicm-table',
    title: 'Hiponatremia: Clasificación Bioquímica, Gravedad Clínica y Corrección Segura (ESE/ESICM 2014)',
    shortTitle: 'Hiponatremia: Clasificación y Manejo',
    specialty: 'medicina-interna',
    secondarySpecialties: ['urgencias', 'nefrologia'],
    setting: 'ambos',
    guidelineVersion: 'ESE / ESICM / ERA-EDTA 2014',
    summary:
      'Criterios bioquímicos exactos (sin solapamiento) y clasificación por gravedad clínica de síntomas para decidir bolos de SS 3 % y límites de seguridad en 24 h.',
    columns: ['Categoría (Bioquímica / Clínica)', 'Umbral exacto de Na⁺ y síntomas', 'Conducta inmediata y metas de seguridad'],
    rows: [
      [
        { text: 'Hiponatremia leve (bioquímica)', tone: 'low', emphasize: true },
        'Na⁺ 130 – 134 mEq/L sin síntomas moderados ni graves',
        'Estudio etiológico (osmolaridad plasmática/urinaria, Na⁺ urinario, volemia). Corregir causa, suspender tiazidas/fármacos inductores; NO requiere SS 3 %.',
      ],
      [
        { text: 'Hiponatremia moderada (bioquímica)', tone: 'moderate', emphasize: true },
        'Na⁺ 125 – 129 mEq/L sin síntomas moderados ni graves',
        'Estudio etiológico urgente; tratamiento dirigido según volemia (restricción hídrica en SIADH o SS 0.9 % si hipovolemia real) vigilando Na⁺ cada 6 h.',
      ],
      [
        { text: 'Hiponatremia profunda (sin síntomas moderados/graves)', tone: 'high', emphasize: true },
        'Na⁺ < 125 mEq/L asintomática o solo con síntomas crónicos leves',
        'Evitar bolos rápidos de SS 3 % si es crónica o asintomática. Ingresar/monitorizar Na⁺ cada 4–6 h, tratar etiología y restringir agua libre para NO sobrecorregir.',
      ],
      [
        { text: 'Hiponatremia con síntomas moderadamente graves', tone: 'high', emphasize: true },
        'Cualquier Na⁺ < 135 mEq/L con náuseas (sin vómitos), confusión o cefalea',
        'Administrar 1 bolo único de SS 3 % 150 mL IV en 20 min + estudio etiológico inmediato; controlar Na⁺ a la 1 h, 6 h y 12 h.',
      ],
      [
        { text: 'Hiponatremia con síntomas graves (Emergencia)', tone: 'critical', emphasize: true },
        'Cualquier Na⁺ < 135 mEq/L con vómitos, somnolencia anormal/estupor, convulsiones, coma (GCS ≤ 8) o distrés cardiorrespiratorio',
        'Bolo inmediato SS 3 % 150 mL IV en 20 min; controlar Na⁺ y repetir 150 mL en 20 min hasta lograr ascenso de +5 mEq/L en la 1.ª hora o mejoría neurológica.',
      ],
    ],
    keyManagementPearls: [
      'Límites máximos de corrección (ESE/ESICM 2014): NO exceder +10 mEq/L en las primeras 24 horas ni +8 mEq/L en cada periodo adicional de 24 h (ni +18 mEq/L acumulados en 48 h). En pacientes con alto riesgo de síndrome de desmielinización osmótica (alcoholismo, desnutrición, hepatopatía, hipokalemia o Na⁺ inicial < 105 mEq/L), limitar estrictamente a ≤ 6 mEq/L en 24 h (techo máximo absoluto 8 mEq/L).',
      'Clasificación por tiempo de evolución: Aguda (< 48 h documentada) vs. Crónica (≥ 48 h o duración desconocida: asumir y tratar SIEMPRE como crónica por seguridad).',
      'Descartar siempre pseudohiponatremia e hiponatremia translocacional por hiperglucemia (usar calculadora de Sodio corregido antes de clasificar).',
    ],
    references: [
      {
        citation:
          'Spasovski G, Vanholder R, Allolio B, et al. Clinical practice guideline on diagnosis and treatment of hyponatraemia. Eur J Endocrinol. 2014;170(3):G1-G47.',
        year: 2014,
      },
    ],
  },
  {
    id: 'hyperkalemia-kdigo-table',
    title: 'Hiperpotasemia Aguda: Clasificación por Potasio/ECG y Secuencia de Urgencias (KDIGO 2020)',
    shortTitle: 'Hiperpotasemia: Clasificación y Manejo',
    specialty: 'medicina-interna',
    secondarySpecialties: ['urgencias', 'nefrologia'],
    setting: 'ambos',
    guidelineVersion: 'KDIGO Dyskalemia 2020 / ERC 2021',
    summary:
      'Umbrales exactos de gravedad combinando concentración sérica de potasio y hallazgos electrocardiográficos, con secuencia terapéutica de 3 pasos.',
    columns: ['Categoría clínica', 'Potasio sérico (K⁺) y hallazgos ECG', 'Manejo inmediato y seguimiento'],
    rows: [
      [
        { text: 'Pseudohiperpotasemia (descartar antes de tratar agresivamente)', tone: 'neutral', emphasize: true },
        'K⁺ elevado sin clínica ni cambios ECG (hemólisis de muestra, torniquete prolongado, leucocitos > 100,000/µL o plaquetas > 500,000/µL)',
        'Repetir muestra sin torniquete ni agitación o confirmar en gasometría venosa/arterial (plasma heparinizado) si el paciente está estable y con ECG normal.',
      ],
      [
        { text: 'Hiperpotasemia leve', tone: 'low', emphasize: true },
        'K⁺ 5.0 – 5.9 mEq/L con ECG normal',
        'Revisar y suspender fármacos hiperkalemiantes (IECA/ARA-II/ARM/AINEs/TMP-SMX según riesgo), dieta baja en K⁺, optimizar diurético de asa o quelante oral (ciclosilicato de sodio-zirconio o patirómer).',
      ],
      [
        { text: 'Hiperpotasemia moderada', tone: 'moderate', emphasize: true },
        'K⁺ 6.0 – 6.4 mEq/L con ECG normal',
        'Monitorización cardíaca continua, iniciar redistribución rápida (insulina/dextrosa + salbutamol neb) + medidas de eliminación (furosemida IV si volemia/diuresis conservada, quelante oral); revalorar K⁺ en 1–2 h.',
      ],
      [
        { text: 'Hiperpotasemia grave o con toxicidad miocárdica', tone: 'critical', emphasize: true },
        'K⁺ ≥ 6.5 mEq/L (cualquier ECG) O K⁺ ≥ 5.5 mEq/L con cambios ECG (T picuda simétrica, P aplanada/ausente, PR > 200 ms, QRS > 120 ms, patrón sinusoidal)',
        '1) Estabilizar membrana: Gluconato de calcio 10 % 10 mL IV en 2–5 min (repetir en 5–10 min si persisten cambios ECG). 2) Redistribuir: Insulina regular 10 UI IV + Dextrosa 50 % 50 mL [25 g] (omitir dextrosa si glucemia ≥ 250 mg/dL; vigilar hipoglucemia 4–6 h) + Salbutamol neb 10–20 mg. 3) Eliminar: Furosemida IV / Hemodiálisis urgente si anuria o refractaria.',
      ],
    ],
    keyManagementPearls: [
      'El gluconato de calcio NO reduce el potasio sérico; su único efecto es estabilizar el potencial de membrana miocárdico durante 30–60 minutos mientras actúan la insulina y el salbutamol.',
      'El bicarbonato de sodio IV NO se recomienda de rutina en hiperpotasemia aislada; reservarlo únicamente si coexiste acidosis metabólica grave (pH < 7.20 o HCO₃⁻ < 15 mEq/L) y sobrecarga no limitante.',
    ],
    references: [
      {
        citation:
          'Clase CM, Carrero JJ, Ellison DH, et al. Potassium homeostasis and management of dyskalemia in kidney diseases: KDIGO Controversies Conference. Kidney Int. 2020;97(1):42-61.',
        year: 2020,
      },
      {
        citation:
          'Lott C, Truhlář A, Alfonzo A, et al. European Resuscitation Council Guidelines 2021: Cardiac arrest in special circumstances. Resuscitation. 2021;161:152-219.',
        year: 2021,
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
    guidelineVersion: 'ESC 2021 / ESC-EAS 2019',
    summary:
      'Objetivos exactos de colesterol LDL según categoría de riesgo cardiovascular y umbrales numéricos SCORE2 / SCORE2-OP por grupo de edad.',
    columns: ['Categoría de Riesgo CV', 'Criterios clínicos y umbrales SCORE2 exactos', 'Meta de c-LDL', 'Estrategia orientativa'],
    rows: [
      [
        { text: 'Riesgo Bajo', tone: 'normal', emphasize: true },
        'Sin ECV, sin DM ni ERC; SCORE2 < 2.5 % (< 50 a), < 5 % (50–69 a) o SCORE2-OP < 7.5 % (≥ 70 a) en extremo inferior (o SCORE < 1 %)',
        '< 116 mg/dL (< 3.0 mmol/L)',
        'Estilo de vida; considerar fármaco solo si c-LDL persiste ≥ 190 mg/dL tras intervención.',
      ],
      [
        { text: 'Riesgo Moderado', tone: 'low', emphasize: true },
        'DM1 < 35 a o DM2 < 50 a con duración < 10 años sin daño ni otros FRCV; o riesgo intermedio en rango bajo-moderado (SCORE 1–< 5 %)',
        '< 100 mg/dL (< 2.6 mmol/L)',
        'Estilo de vida + estatina de intensidad moderada si fuera de meta tras 3 meses.',
      ],
      [
        { text: 'Riesgo Alto', tone: 'high', emphasize: true },
        'CT > 310 mg/dL o c-LDL > 190 mg/dL o PA ≥ 180/110 mmHg; ERC moderada (TFGe 30–59); DM ≥ 10 a sin daño orgánico; o SCORE2 alto: 2.5–<7.5 % (< 50 a), 5–<10 % (50–69 a), 7.5–<15 % (≥ 70 a)',
        '< 70 mg/dL (< 1.8 mmol/L) Y reducción ≥ 50 % del basal',
        'Estatina de alta intensidad (atorvastatina 40–80 mg o rosuvastatina 20–40 mg); agregar ezetimiba 10 mg si no alcanza meta.',
      ],
      [
        { text: 'Riesgo Muy Alto', tone: 'critical', emphasize: true },
        'ECV aterosclerótica clínica (SCA, IAM, ACV/AIT, EAP, revascularización); DM con daño a órgano blanco o ≥ 3 FRCV; ERC grave (TFGe < 30); SCORE2 muy alto: ≥ 7.5 % (< 50 a), ≥ 10 % (50–69 a), ≥ 15 % (≥ 70 a)',
        '< 55 mg/dL (< 1.4 mmol/L) Y reducción ≥ 50 % del basal',
        'Estatina de alta intensidad + Ezetimiba 10 mg ± iPCSK9 (evolocumab/alirocumab/inclisirán) si persiste > 55 mg/dL.',
      ],
    ],
    keyManagementPearls: [
      'En prevención secundaria con un segundo evento vascular en ≤ 2 años pese a estatina máxima tolerada, puede plantearse una meta aún más estricta de c-LDL < 40 mg/dL (< 1.0 mmol/L).',
      'En hipertrigliceridemia grave (triglicéridos > 500 mg/dL, y especialmente > 880 mg/dL), priorizar la prevención de pancreatitis aguda (dieta sin alcohol ni azúcares simples + fibrato o ácidos grasos omega-3).',
    ],
    references: [
      {
        citation:
          'Mach F, Baigent C, Catapano AL, et al. 2019 ESC/EAS Guidelines for the management of dyslipidaemias. Eur Heart J. 2020;41(1):111-188.',
        year: 2020,
      },
      {
        citation:
          'Visseren FLJ, Mach F, Smulders YM, et al. 2021 ESC Guidelines on cardiovascular disease prevention in clinical practice. Eur Heart J. 2021;42(34):3227-3337.',
        year: 2021,
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
      'Diferenciación clínica entre cistitis no complicada, pielonefritis e IVU en gestación, con dosis y restricciones renales/gestacionales.',
    columns: ['Síndrome clínico', 'Criterios diagnósticos y estudios', 'Tratamiento empírico orientativo'],
    rows: [
      [
        { text: 'Cistitis aguda no complicada (mujer no gestante)', tone: 'normal', emphasize: true },
        'Disuria, polaquiuria y urgencia miccional sin fiebre, dolor lumbar ni secreción vaginal (no requiere urocultivo de rutina)',
        'Nitrofurantoína 100 mg c/12 h VO × 5 d (evitar si TFGe < 30 mL/min), o Fosfomicina trometamol 3 g VO dosis única, o TMP-SMX 160/800 mg c/12 h × 3 d (solo si resistencia local < 20 %).',
      ],
      [
        { text: 'Pielonefritis aguda no complicada (ambulatoria)', tone: 'moderate', emphasize: true },
        'Fiebre (> 38 °C), escalofríos, dolor en flanco o puñopercusión positiva + tolerancia oral (SIEMPRE solicitar urocultivo previo)',
        'Ciprofloxacino 500 mg c/12 h × 7 d o Levofloxacino 750 mg/d × 5 d (si resistencia local < 10 %); si resistencia > 10 %, iniciar dosis única Ceftriaxona 1 g IV/IM o gentamicina + β-lactámico oral 10–14 d según antibiograma.',
      ],
      [
        { text: 'Pielonefritis / IVU complicada hospitalaria', tone: 'high', emphasize: true },
        'Vómitos, sepsis, obstrucción/litiasis, sonda vesical, embarazo, sexo masculino o inmunosupresión (urocultivo + hemocultivos + ecografía)',
        'Ceftriaxona 1–2 g IV c/24 h (o Cefepima / Piperacilina-tazobactam / Meropenem si factores de riesgo BLEE o choque séptico); resolver de inmediato obstrucción si existe.',
      ],
      [
        { text: 'Bacteriuria asintomática / IVU en embarazo', tone: 'high', emphasize: true },
        'Urocultivo con ≥ 10⁵ UFC/mL de un mismo uropatógeno en gestante (tamizar y tratar SIEMPRE aunque esté asintomática)',
        'Cefalexina 500 mg c/6–8 h (5–7 d), Fosfomicina 3 g DU, Amoxicilina-clavulánico o Nitrofurantoína (evitar nitrofurantoína ≥ 38 SG/cerca del parto y déficit G6PD; evitar fluoroquinolonas todo el embarazo y TMP-SMX en 1.er trimestre y cerca del parto).',
      ],
    ],
    keyManagementPearls: [
      'NO tamizar ni tratar la bacteriuria asintomática en mujeres no gestantes, adultos mayores ni portadores crónicos de sonda vesical (únicas excepciones: embarazo y previo a procedimiento urológico con traumatismo mucoso).',
      'La nitrofurantoína NO alcanza niveles parenquimatosos renales adecuados: está CONTRAINDICADA en pielonefritis y en TFGe < 30 mL/min/1.73 m².',
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
    guidelineVersion: 'OMS / UNICEF / ESPGHAN',
    summary:
      'Clasificación con porcentajes de pérdida ponderal mutuamente excluyentes (< 5 %, 5–9 %, ≥ 10 %) y volúmenes exactos de reposición oral e intravenosa.',
    columns: ['Grado OMS / Pérdida de peso', 'Signos clínicos clave', 'Reposición de líquidos y seguimiento'],
    rows: [
      [
        { text: 'Sin deshidratación (< 5 % peso) · Plan A', tone: 'normal', emphasize: true },
        'Alerta, ojos normales, llanto con lágrimas, mucosas húmedas, bebe normal, pliegue cutáneo desaparece inmediato (< 1 s)',
        'Hogar: SRO baja osmolaridad (75 mEq/L Na⁺) tras cada evacuación (50–100 mL en < 2 años; 100–200 mL en 2–10 años; libre demanda en > 10 años) + mantener alimentación + Zinc VO × 10–14 d (10 mg/d en < 6 m; 20 mg/d en 6–59 m).',
      ],
      [
        { text: 'Algún grado / Leve a moderada (5 – 9 % peso) · Plan B', tone: 'moderate', emphasize: true },
        '≥ 2 signos: inquieto/irritable, ojos hundidos, sediento (bebe con avidez), mucosas secas, pliegue vuelve lento (1–2 s)',
        'Observación 4 h: SRO 75 mL/kg en 4 horas (rango 50–100 mL/kg) a cucharaditas o sorbos frecuentes. Reevaluar a las 4 h: si hidratado → Plan A; si persiste → repetir Plan B; si empeora → Plan C.',
      ],
      [
        { text: 'Deshidratación grave (≥ 10 % peso) o choque · Plan C', tone: 'critical', emphasize: true },
        '≥ 2 signos: letárgico/inconsciente, ojos muy hundidos, incapaz de beber/bebe mal, relleno capilar > 3 s, pulso débil, pliegue muy lento (> 2 s)',
        'Si choque franco: bolo rápido Ringer Lactato o SS 0.9 % 20 mL/kg IV/IO en 10–20 min (repetir si persiste choque). Esquema OMS Plan C total 100 mL/kg IV: en < 12 meses → 30 mL/kg en 1 h + 70 mL/kg en 5 h; en ≥ 12 meses → 30 mL/kg en 30 min + 70 mL/kg en 2.5 h.',
      ],
    ],
    keyManagementPearls: [
      'En niños mayores (> 10–15 kg) algunos textos (ESPGHAN/Nelson) utilizan puntos de corte de < 3 % (sin deshidratación), 3–9 % (leve-moderada) y > 9 % (grave); los criterios clínicos de Plan A, B y C OMS prevalecen para decidir vía oral vs. IV.',
      'No usar bebidas deportivas, jugos ni refrescos como rehidratación oral (hiperosmolares y pobres en sodio).',
      'En desnutrición aguda grave (kwashiorkor/marasmo) NO aplicar Plan C rápido estándar salvo choque establecido (usar ReSoMal o infusión lenta controlada).',
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
    title: 'Trastornos Hipertensivos del Embarazo, Preeclampsia y Normativa 109 MINSA (ACOG / ISSHP)',
    shortTitle: 'Preeclampsia y Crisis Obstétrica (MINSA 109)',
    specialty: 'gineco-obstetricia',
    secondarySpecialties: ['urgencias'],
    setting: 'ambos',
    guidelineVersion: 'Normativa 109 MINSA Nicaragua · ACOG PB 222 · ISSHP 2022',
    summary:
      'Criterios diagnósticos exactos desde las 20 semanas de gestación, esquema Zuspan Normativa 109 MINSA (4 g/200 mL carga + 8 g/420 mL SSN mantenimiento), y antihipertensivos de primera línea en emergencia obstétrica.',
    columns: ['Entidad clínica', 'Criterios diagnósticos exactos', 'Conducta urgente / Neuroprotección / Finalización'],
    rows: [
      [
        { text: 'Hipertensión gestacional', tone: 'low', emphasize: true },
        'PAS ≥ 140 o PAD ≥ 90 mmHg (en 2 tomas ≥ 4 h) tras ≥ 20 SG en mujer previamente normotensa, sin proteinuria ni criterios de gravedad',
        'Vigilancia materno-fetal semanal/bisemanal; considerar antihipertensivo oral (labetalol, nifedipino LP o metildopa) si PA sostenida ≥ 140/90; finalizar a las 37 0/7 SG.',
      ],
      [
        { text: 'Preeclampsia sin signos de gravedad', tone: 'moderate', emphasize: true },
        'PA ≥ 140/90 (sin alcanzar ≥ 160/110 sostenido) tras ≥ 20 SG + proteinuria (≥ 300 mg/24 h, o PCr ≥ 0.3 mg/mg [30 mg/mmol], o tira ≥ 2+ si no hay cuantificación)',
        'Hospitalización o control estrecho con laboratorios seriados (plaquetas, Cr, AST/ALT, LDH); finalizar gestación a las 37 0/7 SG (antes si aparecen signos de gravedad).',
      ],
      [
        { text: 'Preeclampsia con signos de gravedad', tone: 'critical', emphasize: true },
        'PAS ≥ 160 o PAD ≥ 110 mmHg (confirmada en ≥ 15 min) O HTA ≥ 140/90 tras ≥ 20 SG con ≥ 1 de: plaquetas < 100,000/µL, AST/ALT ≥ 2× LSN (o epigastralgia intensa), Cr > 1.1 mg/dL (o 2× basal), edema pulmonar, cefalea refractaria o escotomas',
        '1) MgSO₄ Zuspan Normativa 109 MINSA: carga 4 g al 10 % en 200 mL SSN/RL/D5% (5–15 min) + mantenimiento c/8 h con 8 g (80 mL) en 420 mL SSN = 500 mL a 60 microgotas/min (20 gotas/min = 1 g/h). 2) Si PA ≥ 160/110: Hidralazina 5 mg IV bolo lento c/15 min (máx 4 dosis), Labetalol IV o Nifedipino acción rápida 10 mg VÍA ORAL (NUNCA sublingual). 3) Finalizar ≥ 34 0/7 SG tras estabilización.',
      ],
      [
        { text: 'Eclampsia / Síndrome HELLP', tone: 'critical', emphasize: true },
        'Eclampsia: convulsiones tónico-clónicas nuevas sin otra causa. HELLP (Tennessee): LDH ≥ 600 U/L (o hemólisis) + AST/ALT ≥ 2× LSN + Plaquetas < 100,000/µL',
        'Vía aérea / decúbito lateral izquierdo + MgSO₄ IV inmediato (si recurre convulsión > 15 min poscarga: refuerzo de 2 g al 10 % en 100 mL en ~5 min) + control PA + finalización obstétrica prioritaria tras estabilización materna.',
      ],
    ],
    keyManagementPearls: [
      'Normativa 109 MINSA: durante infusión de MgSO₄ vigilar cada hora reflejos rotulianos presentes, FR ≥ 13 rpm (≥ 12–16 rpm ACOG) y diuresis ≥ 30 mL/h (en 4 h previas). Antídoto: Gluconato de calcio al 10 % 10 mL (1 g) IV lento en 3–5 min. Mantener MgSO₄ hasta 24 h posparto o última convulsión.',
      'Prevención en gestantes de alto riesgo: AAS 100–150 mg/noche iniciado entre 12 y 16 SG hasta las 36 semanas.',
    ],
    references: [
      {
        citation:
          'Ministerio de Salud de Nicaragua (MINSA). Normativa 109: Protocolos para la Atención de las Complicaciones Obstétricas. Managua: MINSA.',
        year: 2018,
      },
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
    title: 'Código Ictus / ACV Isquémico Agudo: Ventanas, Dosis, Metas de PA y Tiempos (AHA/ASA)',
    shortTitle: 'Código Ictus / ACV Agudo (AHA/ASA)',
    specialty: 'neurologia',
    secondarySpecialties: ['urgencias'],
    setting: 'urgencias',
    guidelineVersion: 'AHA/ASA Acute Stroke Guidelines',
    summary:
      'Metas cronológicas puerta-imagen-aguja, dosis trombolíticas y umbrales exactos de presión arterial según elegibilidad para reperfusión.',
    columns: ['Fase / Escenario', 'Meta de tiempo o umbral exacto', 'Conducta crítica en Urgencias'],
    rows: [
      [
        { text: 'Evaluación inicial y glucemia capilar', emphasize: true },
        '≤ 10 min desde llegada (puerta-médico)',
        'Aplicar NIHSS, fijar hora exacta de último visto bien (LKW) y corregir hipoglucemia (< 60 mg/dL) como imitador de ictus; meta glucémica 140–180 mg/dL.',
      ],
      [
        { text: 'TC de cráneo simple (sin contraste)', tone: 'high', emphasize: true },
        'Realizar ≤ 25 min · Interpretación ≤ 45 min',
        'Objetivo inmediato único: descartar hemorragia intracraneal para habilitar reperfusión sin demora.',
      ],
      [
        { text: 'Trombólisis IV (Alteplasa / Tenecteplasa)', tone: 'critical', emphasize: true },
        'Ventana ≤ 4.5 horas desde LKW (meta puerta-aguja ≤ 60 min; ideal ≤ 45 min)',
        'Exige PA < 185/110 mmHg ANTES del bolo y mantener < 180/105 mmHg durante 24 h (labetalol o nicardipino IV). Dosis: Alteplasa 0.9 mg/kg IV (máx 90 mg: 10 % bolo 1 min + 90 % en 60 min) o Tenecteplasa 0.25 mg/kg IV bolo único (máx 25 mg).',
      ],
      [
        { text: 'Trombectomía mecánica (oclusión de gran vaso)', tone: 'critical', emphasize: true },
        '≤ 6 horas estándar (o 6–24 h con TC perfusión / RM criterios DAWN-DEFUSE 3)',
        'Angio-TC urgente si déficit moderado-grave o sospecha de gran vaso; NO retrasar ni omitir trombólisis IV si es candidato.',
      ],
      [
        { text: 'Sin reperfusión (ACV isquémico no candidato)', tone: 'moderate', emphasize: true },
        'Primeras 24 – 48 horas',
        'Hipertensión permisiva: NO bajar PA salvo que alcance ≥ 220/120 mmHg (descenso máximo 15 % en 24 h) o exista emergencia concomitante (disección aórtica, IAM, edema pulmonar).',
      ],
    ],
    keyManagementPearls: [
      'En AIT de alto riesgo (ABCD2 ≥ 4 o estenosis sintomática) o ictus isquémico menor no cardioembólico (NIHSS ≤ 3) tras descartar hemorragia en TC: iniciar antiagregación dual temprana (AAS + clopidogrel × 21 días según CHANCE/POINT) dentro de las primeras 24 horas.',
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
    title: 'Dengue: Clasificación de Gravedad y Esquema de Líquidos (MINSA Normativa 147 · OPS / OMS)',
    shortTitle: 'Dengue: Grupos A, B y C (MINSA 147 / OPS)',
    specialty: 'infectologia',
    secondarySpecialties: ['urgencias', 'medicina-interna', 'pediatria'],
    setting: 'ambos',
    guidelineVersion: 'Normativa 147 MINSA Nicaragua · OPS / OMS Directrices Dengue',
    summary:
      'Criterios clínicos de triage y reposición hídrica exacta con Lactato de Ringer para manejo ambulatorio (Grupo A), UAF (Grupo B1), signos de alarma (Grupo B2: 7 mL/kg/h MINSA) y choque/dengue grave (Grupo C: 10 mL/kg/h MINSA).',
    columns: ['Grupo MINSA 147 / OPS', 'Criterios clínicos exactos', 'Manejo de líquidos y vigilancia'],
    rows: [
      [
        { text: 'Grupo A — Dengue sin signos de alarma ni comorbilidad', tone: 'normal', emphasize: true },
        'Fiebre + síntomas clásicos, tolera vía oral, diuresis adecuada (≥ 1 micción c/6 h), sin signos de alarma ni condición de riesgo',
        'Ambulatorio: hidratación oral abundante (SRO), paracetamol/acetaminofén; CONTRAINDICADOS AINEs, AAS, metamizol IM y corticoides. Control clínico y BH cada 24–48 h hasta 48 h posdefervescencia.',
      ],
      [
        { text: 'Grupo B1 — Sin alarma pero con condición asociada o riesgo social (UAF)', tone: 'low', emphasize: true },
        'Embarazo, < 1 año, ≥ 65 años, obesidad mórbida, DM, HTA, nefropatía, cardiopatía, hepatopatía, coagulopatía o riesgo social',
        'Ingreso u observación en UAF (Unidad de Atención a Febriles): priorizar vía oral supervisada (SRO) o mantenimiento IV con Lactato de Ringer/SSN si no tolera VO; vigilancia cada 4 h.',
      ],
      [
        { text: 'Grupo B2 — Dengue con signos de alarma', tone: 'high', emphasize: true },
        '≥ 1 signo: dolor abdominal intenso/continuo, vómitos persistentes (≥ 3 en 1 h o ≥ 4 en 6 h), ascitis/derrame pleural/pericárdico, sangrado mucosas, letargia/irritabilidad, hipotensión postural, hepatomegalia > 2 cm, ↑ Hto con caída rápida plaquetas',
        'Normativa 147 MINSA: Hospitalización inmediata y Lactato de Ringer (preferido sobre SSN 0.9 %) a 7 mL/kg en la 1.ª hora sobre peso ideal en sobrepeso/obesidad (OPS regional usa hasta 10 mL/kg en 1 h). Si mejora (diuresis ≥ 1 mL/kg/h), bajar gradualmente 5 → 3 → 2 mL/kg/h; si empeora repetir o pasar a Grupo C.',
      ],
      [
        { text: 'Grupo C — Dengue grave / Choque', tone: 'critical', emphasize: true },
        '≥ 1 criterio: choque por extravasación plasmática, distrés respiratorio por sobrecarga/derrame, sangrado grave o daño orgánico grave (AST/ALT ≥ 1000 U/L, alteración SNC, miocarditis)',
        'UCI / Reanimación: Normativa 147 MINSA inicia cargas vigiladas de Lactato de Ringer (o SSN 0.9 %) a 10 mL/kg en 1 hora (OPS 10–20 mL/kg en 15–30 min en choque descompensado) y descenso 7 → 5 → 3 mL/kg/h si mejora. Si persiste choque y CAE el Hto: sospechar hemorragia oculta y valorar transfusión de GR (o coloide si Hto elevado).',
      ],
    ],
    keyManagementPearls: [
      'Normativa 147 MINSA Nicaragua: calcular cargas IV con PESO IDEAL para la talla en sobrepeso/obesidad (peso real en bajo peso) y preferir Lactato de Ringer para evitar acidosis metabólica hiperclorémica por SSN 0.9 % prolongada.',
      'La fase crítica suele iniciar al caer la fiebre (días 3–7), NO en el pico febril. No transfundir plaquetas profilácticamente sin sangrado activo grave.',
    ],
    references: [
      {
        citation:
          'Ministerio de Salud de Nicaragua (MINSA). Normativa 147: Guía para el Manejo Clínico del Dengue en Pediatría y Adultos. Managua: MINSA.',
        year: 2020,
      },
      {
        citation:
          'Organización Panamericana de la Salud (OPS/OMS). Directrices para el diagnóstico clínico y el tratamiento del dengue, el chikunguña y el zika. Washington, D.C.: OPS; 2022.',
        year: 2022,
      },
    ],
  },
  {
    id: 'arterial-blood-gas-acid-base-table',
    title: 'Gasometría Arterial y Trastornos Ácido-Base: Valores Normales y Fórmulas de Compensación',
    shortTitle: 'Gasometría y Ácido-Base',
    specialty: 'urgencias',
    secondarySpecialties: ['medicina-interna', 'neumologia', 'nefrologia'],
    setting: 'ambos',
    guidelineVersion: 'Fisiología Ácido-Base Clínica (Winter / Henderson-Hasselbalch)',
    summary:
      'Rangos arteriales normales a nivel del mar y fórmulas exactas de compensación esperada para identificar trastornos ácido-base simples y mixtos.',
    columns: [
      'Parámetro / Trastorno primario',
      'Valor normal o fórmula de compensación',
      'Interpretación de trastorno mixto y claves clínicas',
    ],
    rows: [
      [
        { text: 'Gasometría arterial normal (FiO₂ 0.21, nivel del mar)', tone: 'normal', emphasize: true },
        'pH 7.35 – 7.45 · PaCO₂ 35 – 45 mmHg · HCO₃⁻ 22 – 26 mEq/L · PaO₂ 80 – 100 mmHg · SatO₂ 95 – 100 % · Lactato < 2.0 mmol/L',
        'Acidemia: pH < 7.35; Alcalemia: pH > 7.45. Un pH dentro de 7.35–7.45 con PaCO₂ y HCO₃⁻ muy alterados sugiere trastorno mixto (la compensación fisiológica casi nunca normaliza completamente el pH, salvo alcalosis respiratoria crónica).',
      ],
      [
        { text: 'Acidosis metabólica (Fórmula de Winter)', tone: 'high', emphasize: true },
        'PaCO₂ esperada = (1.5 × HCO₃⁻) + 8 ± 2 mmHg',
        'Si PaCO₂ medida > límite superior → acidosis respiratoria concomitante (agotamiento ventilatorio). Si PaCO₂ medida < límite inferior → alcalosis respiratoria añadida (sepsis, salicilatos, hepatopatía).',
      ],
      [
        { text: 'Alcalosis metabólica', tone: 'moderate', emphasize: true },
        'PaCO₂ esperada ≈ 40 + [0.7 × (HCO₃⁻ − 24)] ± 5 mmHg (aprox. +0.7 mmHg PaCO₂ por cada +1 mEq/L de HCO₃⁻)',
        'Si PaCO₂ medida es menor de lo esperado → alcalosis respiratoria coexistente. La hipoventilación compensatoria rara vez eleva la PaCO₂ por encima de 55–60 mmHg.',
      ],
      [
        { text: 'Acidosis respiratoria (Aguda vs. Crónica)', tone: 'high', emphasize: true },
        'Aguda (< 24–48 h): ↑ HCO₃⁻ 1 mEq/L por cada ↑ 10 mmHg de PaCO₂ sobre 40. Crónica (≥ 3–5 días): ↑ HCO₃⁻ 3.5 mEq/L (3–4) por cada ↑ 10 mmHg de PaCO₂',
        'Si el HCO₃⁻ medido es inferior al esperado → acidosis metabólica añadida (láctica, renal). Si es mayor al esperado → alcalosis metabólica concomitante (diuréticos, corticoides, vómitos).',
      ],
      [
        { text: 'Alcalosis respiratoria (Aguda vs. Crónica)', tone: 'low', emphasize: true },
        'Aguda: ↓ HCO₃⁻ 2 mEq/L por cada ↓ 10 mmHg de PaCO₂ bajo 40. Crónica: ↓ HCO₃⁻ 4–5 mEq/L por cada ↓ 10 mmHg de PaCO₂',
        'Si el HCO₃⁻ cae más de lo esperado → acidosis metabólica concomitante; si cae menos → alcalosis metabólica añadida.',
      ],
    ],
    keyManagementPearls: [
      'Corregir siempre el Anion Gap (AG = Na⁺ − [Cl⁻ + HCO₃⁻], normal 8–12 mEq/L sin K⁺) por albúmina: AG corregido = AG observado + 2.5 × (4.0 − Albúmina g/dL).',
      'En acidosis metabólica con AG elevado, calcular la relación Delta/Delta (ΔAG / ΔHCO₃⁻ = [AG_corr − 12] / [24 − HCO₃⁻]): < 1 sugiere acidosis hiperclorémica asociada; > 2 sugiere alcalosis metabólica oculta o acidosis respiratoria crónica.',
      'La gasometría venosa periférica estima adecuadamente pH (~0.03–0.04 menor que arterial) y HCO₃⁻ (~1–2 mEq/L mayor), pero NO sustituye a la arterial para valorar PaO₂ ni insuficiencia respiratoria hipercápnica grave.',
    ],
    references: [
      {
        citation:
          'Berend K, de Vries AP, Gans RO. Physiological approach to assessment of acid-base disturbances. N Engl J Med. 2014;371(15):1434-1445.',
        year: 2014,
      },
      {
        citation:
          'Seifter JL. Integration of acid-base and electrolyte disorders. N Engl J Med. 2014;371(19):1821-1831.',
        year: 2014,
      },
    ],
  },
  {
    id: 'hypokalemia-hypomagnesemia-table',
    title: 'Hipopotasemia e Hipomagnesemia: Clasificación y Reposición Segura (VO / IV)',
    shortTitle: 'Hipopotasemia e Hipomagnesemia',
    specialty: 'medicina-interna',
    secondarySpecialties: ['urgencias', 'nefrologia', 'cardiologia'],
    setting: 'ambos',
    guidelineVersion: 'Práctica Clínica Electrolítica · AHA ACLS',
    summary:
      'Puntos de corte exactos de déficit de potasio y magnesio, límites máximos de velocidad y concentración IV y prevención de flebitis o arritmias iatrogénicas.',
    columns: [
      'Trastorno y gravedad',
      'Nivel sérico / Criterio clínico',
      'Esquema de reposición y límites de seguridad',
    ],
    rows: [
      [
        { text: 'Hipopotasemia leve', tone: 'low', emphasize: true },
        'K⁺ 3.0 – 3.4 mEq/L (asintomática, sin cambios en ECG)',
        'Vía oral de elección: Cloruro de potasio (KCl) 40 – 80 mEq/día repartidos en 2–4 tomas con alimentos y agua; investigar diuréticos, pérdidas GI o alcalosis.',
      ],
      [
        { text: 'Hipopotasemia moderada', tone: 'moderate', emphasize: true },
        'K⁺ 2.5 – 2.9 mEq/L (sin arritmias ni parálisis)',
        'Si tolera VO: KCl 60 – 100 mEq/día fraccionado (máx 20–40 mEq/toma). Si no tolera VO: KCl IV en SS 0.9 % (evitar glucosada por liberación insulínica), ≤ 10 mEq/h por vía periférica.',
      ],
      [
        { text: 'Hipopotasemia grave o sintomática', tone: 'critical', emphasize: true },
        'K⁺ < 2.5 mEq/L O cualquier grado con cambios ECG (ondas U, descenso ST, QT largo, arritmias), debilidad muscular o cardiopatía isquémica',
        'Monitorización ECG continua: Vía periférica máx 10 mEq/h y concentración ≤ 40 mEq/L (riesgo flebitis/necrosis). Vía central con telemetría: 10 – 20 mEq/h (hasta 40 mEq/h solo en riesgo vital con K⁺ c/1–2 h).',
      ],
      [
        { text: 'Hipomagnesemia leve a moderada', tone: 'low', emphasize: true },
        'Mg²⁺ 1.2 – 1.7 mg/dL (0.50 – 0.70 mmol/L), asintomática o síntomas leves',
        'Ambulatorio: sales orales de magnesio (p. ej. citrato/óxido/lactato 240–400 mg Mg elemental/día en tomas divididas). Hospitalizado: Sulfato de magnesio 1 – 2 g IV en 100 mL SS 0.9 % en 1–2 h.',
      ],
      [
        { text: 'Hipomagnesemia grave o Torsades de Pointes', tone: 'critical', emphasize: true },
        'Mg²⁺ < 1.2 mg/dL (< 0.50 mmol/L) O arritmia ventricular polimórfica (Torsades), tetania o convulsiones',
        'Torsades de Pointes: MgSO₄ 2 g IV en 5–15 min (1–2 min si paro cardíaco), incluso con Mg²⁺ normal. Sin arritmia maligna: MgSO₄ 2 – 4 g IV en 4–12 h. Reducir dosis al 50 % si TFGe < 30 mL/min.',
      ],
    ],
    keyManagementPearls: [
      'Medir y corregir siempre el magnesio en toda hipopotasemia moderada-grave o refractaria: la hipomagnesemia abre los canales renales ROMK e impide retener el potasio administrado.',
      'Como orientación aproximada, cada 10 mEq de KCl elevan el K⁺ sérico ~0.1 mEq/L en ausencia de pérdidas continuas o desplazamiento intracelular; controlar K⁺ sérico tras cada 40–60 mEq IV.',
      'En cetoacidosis diabética o estado hiperosmolar con K⁺ < 3.3 mEq/L, posponer la insulina y reponer primero KCl IV (20–30 mEq/L/h) para evitar paro por hipopotasemia.',
    ],
    references: [
      {
        citation:
          'Kardalas E, Paschou SA, Anagnostis P, et al. Hypokalemia: a clinical update. Endocr Connect. 2018;7(4):R135-R146.',
        year: 2018,
      },
      {
        citation:
          'Panchal AR, Bartos JA, Cabañas JG, et al. Part 3: Adult Basic and Advanced Life Support: 2020 AHA Guidelines for CPR and ECC. Circulation. 2020;142(16_suppl_2):S366-S468.',
        year: 2020,
      },
    ],
  },
  {
    id: 'anemia-who-transfusion-aabb-table',
    title: 'Anemia (Umbrales OMS 2024 por Edad/Embarazo) y Transfusión Restrictiva (AABB 2023)',
    shortTitle: 'Anemia OMS y Transfusión (AABB)',
    specialty: 'hematologia',
    secondarySpecialties: ['medicina-interna', 'pediatria', 'gineco-obstetricia', 'urgencias'],
    setting: 'ambos',
    guidelineVersion: 'OMS 2024 · AABB International Red Blood Cell Transfusion Guidelines 2023',
    summary:
      'Criterios diagnósticos exactos de anemia por grupo etario y trimestre gestacional junto a umbrales transfusionales restrictivos en adultos estables.',
    columns: [
      'Población / Escenario clínico',
      'Umbral de Hb (a nivel del mar)',
      'Clasificación de gravedad o conducta transfusional',
    ],
    rows: [
      [
        { text: 'Niños de 6 a 59 meses (OMS 2024)', tone: 'neutral', emphasize: true },
        'Anemia: Hb < 11.0 g/dL',
        'Leve: 10.0 – 10.9 g/dL · Moderada: 7.0 – 9.9 g/dL · Grave: < 7.0 g/dL.',
      ],
      [
        { text: 'Niños de 5 a 11 años (OMS 2024)', tone: 'neutral', emphasize: true },
        'Anemia: Hb < 11.5 g/dL',
        'Leve: 11.0 – 11.4 g/dL · Moderada: 8.0 – 10.9 g/dL · Grave: < 8.0 g/dL.',
      ],
      [
        { text: 'Adolescentes 12–14 años y Mujeres no gestantes ≥ 15 años', tone: 'neutral', emphasize: true },
        'Anemia: Hb < 12.0 g/dL',
        'Leve: 11.0 – 11.9 g/dL · Moderada: 8.0 – 10.9 g/dL · Grave: < 8.0 g/dL.',
      ],
      [
        { text: 'Varones ≥ 15 años (OMS 2024)', tone: 'neutral', emphasize: true },
        'Anemia: Hb < 13.0 g/dL',
        'Leve: 11.0 – 12.9 g/dL · Moderada: 8.0 – 10.9 g/dL · Grave: < 8.0 g/dL.',
      ],
      [
        { text: 'Embarazo por trimestre (OMS 2024)', tone: 'low', emphasize: true },
        '1.º y 3.º trimestre: < 11.0 g/dL · 2.º trimestre: < 10.5 g/dL',
        'Grave en cualquier trimestre: < 7.0 g/dL. Investigar ferropenia (ferritina < 30 ng/mL) y otras carencias antes de suplementar a ciegas.',
      ],
      [
        { text: 'Transfusión — Adulto hospitalizado estable (AABB 2023)', tone: 'moderate', emphasize: true },
        'Umbral restrictivo: Hb < 7.0 g/dL',
        'Indicar 1 concentrado de hematíes a la vez y reevaluar clínica + Hb pos-transfusión (cada unidad eleva ~1.0 g/dL en adulto sin sangrado). No transfundir de rutina si Hb ≥ 7.0 g/dL y estable.',
      ],
      [
        { text: 'Transfusión — Cirugía cardíaca, ortopédica o cardiopatía estable', tone: 'high', emphasize: true },
        'Cirugía cardíaca: < 7.5 g/dL · Cirugía ortopédica o enfermedad CV preexistente: < 8.0 g/dL',
        'En síndrome coronario agudo (SCA) y hemorragia aguda masiva no existe un umbral numérico único seguro: decidir según isquemia activa, inestabilidad hemodinámica y velocidad de sangrado.',
      ],
    ],
    keyManagementPearls: [
      'En residentes a ≥ 1,000 m de altitud o fumadores activos, los umbrales OMS de hemoglobina se corrigen al alza según la tabla oficial OMS 2024 para evitar infradiagnóstico.',
      'En anemia ferropénica crónica estable (incluso Hb 5–6 g/dL bien tolerada en consulta), priorizar estudio etiológico (sangrado GI, ginecológico, celiaquía) y reposición con hierro (VO o IV) evitando transfusiones innecesarias.',
    ],
    references: [
      {
        citation:
          'World Health Organization (WHO). Guideline on haemoglobin cutoffs to define anaemia in individuals and populations. 2024.',
        year: 2024,
      },
      {
        citation:
          'Carson JL, Stanworth SJ, Guyatt G, et al. Red Blood Cell Transfusion: 2023 AABB International Guidelines. JAMA. 2023;330(19):1892-1902.',
        year: 2023,
      },
    ],
  },
  {
    id: 'anaphylaxis-wao-eaaci-table',
    title: 'Anafilaxia: Dosis de Adrenalina IM por Peso/Edad y Manejo Urgente (WAO / EAACI)',
    shortTitle: 'Anafilaxia: Adrenalina y Manejo',
    specialty: 'urgencias',
    secondarySpecialties: ['dermatologia', 'pediatria', 'medicina-interna'],
    setting: 'urgencias',
    guidelineVersion: 'WAO Anaphylaxis Guidance 2020 · EAACI 2021',
    summary:
      'Dosificación exacta de adrenalina intramuscular 1 mg/mL (1:1000) por rango de peso/edad, manejo del choque refractario y observación mínima segura.',
    columns: [
      'Grupo de peso / Escenario',
      'Dosis exacta de Adrenalina (1 mg/mL = 1:1000)',
      'Vía, repetición y medidas coadyuvantes',
    ],
    rows: [
      [
        { text: 'Lactante / Niño < 10 kg', tone: 'high', emphasize: true },
        '0.01 mg/kg (0.01 mL/kg) por dosis',
        'IM en cara anterolateral del muslo (vasto externo). Ej.: 7 kg → 0.07 mg (0.07 mL). Repetir c/5–15 min si persiste compromiso respiratorio o circulatorio.',
      ],
      [
        { text: 'Niño de 10 a 25 kg (~1 a 5 años)', tone: 'high', emphasize: true },
        '0.01 mg/kg (típico 0.15 mg = 0.15 mL; autoinyector 0.15 mg)',
        'IM en vasto externo (inclusive a través de ropa ligera si hay urgencia vital). Repetir cada 5–15 min ante respuesta insuficiente.',
      ],
      [
        { text: 'Niño de > 25 a 49 kg (~6 a 11 años)', tone: 'critical', emphasize: true },
        '0.01 mg/kg hasta máx 0.3 mg (0.3 mL); autoinyector 0.3 mg desde ≥ 25–30 kg',
        'IM en vasto externo. No retrasar la adrenalina por administrar antihistamínicos ni corticoides.',
      ],
      [
        { text: 'Adolescente y Adulto (≥ 50 kg o ≥ 12 años)', tone: 'critical', emphasize: true },
        '0.5 mg (0.5 mL) IM por dosis (autoinyectores: 0.3 mg o 0.5 mg según presentación)',
        'IM en vasto externo (mayor absorción que deltoides o vía subcutánea). Repetir cada 5–15 min si no revierte.',
      ],
      [
        { text: 'Choque anafiláctico refractario (tras ≥ 2–3 dosis IM)', tone: 'critical', emphasize: true },
        'Perfusión IV continua en bomba: Adulto 1 – 10 µg/min · Pediatría 0.05 – 0.1 µg/kg/min',
        'Requiere monitor ECG continuo + bolo rápido de SS 0.9 % o Ringer Lactato 20 mL/kg (500–1,000 mL en adultos, repetible). Si toma betabloqueantes y no responde: considerar glucagón 1–2 mg IV en 5 min (20–30 µg/kg en niños, máx 1 mg).',
      ],
      [
        { text: 'Coadyuvantes y observación mínima', tone: 'moderate', emphasize: true },
        'Posición + O₂ + broncodilatador + H1 (2.ª línea)',
        'Decúbito supino con piernas elevadas (sentado si disnea; decúbito lateral izquierdo en gestante). Salbutamol inhalado si broncoespasmo; antihistamínico H1 solo alivia prurito/habones. Observar 4–6 h mínimo (12–24 h si anafilaxia grave, asma o requerimiento de > 1 dosis de adrenalina).',
      ],
    ],
    keyManagementPearls: [
      'No existen contraindicaciones absolutas para adrenalina IM en anafilaxia aguda (el retraso en su administración es el principal factor asociado a mortalidad).',
      'Hasta un 10–20 % de los casos pueden carecer de lesiones cutáneas iniciales (urticaria/angioedema); sospechar anafilaxia ante broncoespasmo agudo o hipotensión súbita tras exposición a un alérgeno probable.',
      'Al alta, prescribir autoinyector de adrenalina, plan de acción escrito y derivación a Alergología.',
    ],
    references: [
      {
        citation:
          'Cardona V, Ansotegui IJ, Ebisawa M, et al. World Allergy Organization Anaphylaxis Guidance 2020. World Allergy Organ J. 2020;13(10):100472.',
        year: 2020,
      },
      {
        citation:
          'Muraro A, Worm M, Alviani C, et al. EAACI guidelines: Anaphylaxis (2021 update). Allergy. 2022;77(2):357-377.',
        year: 2022,
      },
    ],
  },
  {
    id: 'acs-esc-2023-table',
    title: 'Síndrome Coronario Agudo (IAMCEST y SCASEST): Tiempos de Reperfusión y Riesgo (ESC 2023)',
    shortTitle: 'SCA: Tiempos y Riesgo (ESC 2023)',
    specialty: 'cardiologia',
    secondarySpecialties: ['urgencias', 'medicina-interna'],
    setting: 'urgencias',
    guidelineVersion: 'ESC Guidelines for the Management of Acute Coronary Syndromes 2023',
    summary:
      'Metas cronológicas desde el primer contacto médico, elección entre ICP primaria vs. fibrinólisis y ventanas invasivas en SCASEST.',
    columns: [
      'Presentación / Estrato de riesgo',
      'Criterio objetivo / Meta temporal',
      'Conducta antitrombótica e invasiva inicial',
    ],
    rows: [
      [
        { text: 'Evaluación inicial ante dolor torácico agudo', tone: 'high', emphasize: true },
        'ECG de 12 derivaciones realizado e interpretado ≤ 10 min desde primer contacto médico',
        'Añadir V7–V9 si sospecha infarto posterior (descenso ST V1–V3) y V3R–V4R en IAM inferior. Iniciar troponina ultrasensible (algoritmo 0 h/1 h o 0 h/2 h) sin retrasar IAMCEST.',
      ],
      [
        { text: 'IAMCEST — ICP primaria disponible', tone: 'critical', emphasize: true },
        'Tiempo diagnóstico ECG → paso de guía ≤ 120 min (ideal ≤ 60 min en centro con ICP; ≤ 90 min si traslado)',
        'AAS 150–300 mg VO masticada + anticoagulación parenteral (HNF) + inhibidor P2Y12 potente (prasugrel o ticagrelor; clopidogrel si contraindicados o alto riesgo hemorrágico).',
      ],
      [
        { text: 'IAMCEST — Fibrinólisis (si ICP > 120 min)', tone: 'critical', emphasize: true },
        'Administrar bolo fibrinolítico ≤ 10 min desde el diagnóstico ECG (ideal en primeros < 12 h de síntomas)',
        'Tenecteplasa IV ajustada por peso (reducir dosis al 50 % si ≥ 75 años) + clopidogrel 300 mg (75 mg si ≥ 75 años) + enoxaparina/HNF; traslado inmediato a centro ICP (rescate si no hay resolución ST ≥ 50 % a los 60–90 min; si exitosa, angio en 2–24 h).',
      ],
      [
        { text: 'SCASEST — Riesgo MUY ALTO', tone: 'critical', emphasize: true },
        'Estrategia invasiva inmediata (< 2 horas)',
        'Inestabilidad hemodinámica/choque, angina refractaria, arritmia ventricular maligna, complicaciones mecánicas, IC aguda relacionada o descenso ST > 1 mm en ≥ 6 derivaciones + ascenso en aVR/V1.',
      ],
      [
        { text: 'SCASEST — Riesgo ALTO', tone: 'high', emphasize: true },
        'Estrategia invasiva temprana (< 24 horas)',
        'IAMSEST confirmado (troponina hs elevada con curva), cambios dinámicos del ST-T (sintomáticos o silentes) o puntuación GRACE > 140.',
      ],
      [
        { text: 'SCASEST — Riesgo NO alto (bajo/intermedio)', tone: 'moderate', emphasize: true },
        'Estrategia invasiva selectiva según clínica, troponinas y prueba no invasiva',
        'Descartar causas secundarias (taquiarritmia, anemia, sepsis). En pacientes sin pretratamiento rutinario con P2Y12 antes de conocer anatomía coronaria en SCASEST si coronariografía < 24 h (ESC 2023).',
      ],
    ],
    keyManagementPearls: [
      'En SCASEST que va a coronariografía temprana (< 24 h), ESC 2023 NO recomienda el pretratamiento sistemático con inhibidor P2Y12 antes de definir la anatomía coronaria.',
      'Evitar nitratos en sospecha de infarto de ventrículo derecho, estenosis aórtica grave, PAS < 90 mmHg o uso reciente de inhibidores de PDE5 (24–48 h).',
    ],
    references: [
      {
        citation:
          'Byrne RA, Rossello X, Coughlan JJ, et al. 2023 ESC Guidelines for the management of acute coronary syndromes. Eur Heart J. 2023;44(38):3720-3826.',
        year: 2023,
      },
    ],
  },
  {
    id: 'ugib-management-esge-baveno-table',
    title: 'Hemorragia Digestiva Alta (No Varicosa vs. Varicosa): Reanimación, Fármacos y Endoscopia',
    shortTitle: 'Hemorragia Digestiva Alta (ESGE/Baveno)',
    specialty: 'gastroenterologia',
    secondarySpecialties: ['urgencias', 'medicina-interna', 'cirugia-general'],
    setting: 'urgencias',
    guidelineVersion: 'ESGE 2021 · ACG 2021 · Baveno VII',
    summary:
      'Metas restrictivas de transfusión, terapia vasoactiva/antibiótica en cirrosis y tiempos exactos de endoscopia digestiva alta.',
    columns: [
      'Escenario clínico',
      'Umbral / Ventana temporal',
      'Conducta farmacológica, transfusional y endoscópica',
    ],
    rows: [
      [
        { text: 'Reanimación inicial y transfusión restrictiva', tone: 'high', emphasize: true },
        'Transfundir si Hb < 7.0 g/dL (meta 7.0 – 9.0 g/dL); umbral < 8.0 g/dL si enfermedad cardiovascular',
        '2 accesos venosos gruesos + cristaloides para restaurar perfusión sin sobrecarga agresiva (aumenta presión portal). Evaluar Glasgow-Blatchford desde el triaje.',
      ],
      [
        { text: 'HDA NO varicosa (úlcera péptica / erosiones)', tone: 'moderate', emphasize: true },
        'Endoscopia alta temprana ≤ 24 h tras estabilización hemodinámica',
        'IBP IV (omeprazol/pantoprazol 80 mg bolo seguido de infusión o bolos c/12 h). Si estigmas de alto riesgo (Forrest Ia–IIb), hemostasia endoscópica dual + IBP 72 h. No se recomienda endoscopia urgente rutinaria < 6 h si responde a reanimación.',
      ],
      [
        { text: 'Sospecha de HDA varicosa / Cirrosis (Baveno VII)', tone: 'critical', emphasize: true },
        'Fármacos inmediatos antes de endoscopia · Endoscopia ≤ 12 h tras estabilización',
        '1) Vasoactivo IV continuo (terlipresina, somatostatina u octreótido) durante 2–5 días. 2) Profilaxis antibiótica inmediata (ceftriaxona 1 g IV/24 h hasta 7 días en cirrosis avanzada). 3) Ligadura endoscópica con bandas.',
      ],
      [
        { text: 'Bajo riesgo candidato a manejo ambulatorio', tone: 'normal', emphasize: true },
        'Score Glasgow-Blatchford (GBS) 0 a 1 puntos',
        'Puede considerarse alta desde Urgencias con endoscopia ambulatoria diferida, IBP oral y signos claros de alarma por escrito (ESGE/ACG).',
      ],
    ],
    keyManagementPearls: [
      'Eritromicina IV (250 mg en 20–30 min, 30–120 min antes de endoscopia) mejora la visualización gástrica cuando se sospecha sangre abundante (descartando antes QT largo).',
      'No utilizar ácido tranexámico de forma rutinaria en HDA aguda (estudio HALT-IT no demostró reducción de mortalidad y sí aumento de eventos tromboembólicos).',
    ],
    references: [
      {
        citation:
          'Gralnek IM, Stanley AJ, Morris AJ, et al. Endoscopic diagnosis and management of nonvariceal upper gastrointestinal hemorrhage (NVUGIH): ESGE Guideline Update 2021. Endoscopy. 2021;53(3):300-332.',
        year: 2021,
      },
      {
        citation:
          'de Franchis R, Bosch J, Garcia-Tsao G, et al. Baveno VII - Renewing consensus in portal hypertension. J Hepatol. 2022;76(4):959-974.',
        year: 2022,
      },
    ],
  },
  {
    id: 'vte-diagnosis-risk-esc-table',
    title: 'Tromboembolismo Venoso (TEP y TVP): Algoritmo Diagnóstico y Estratificación Aguda (ESC / ASH)',
    shortTitle: 'TEP / TVP: Algoritmo y Riesgo',
    specialty: 'hematologia',
    secondarySpecialties: ['urgencias', 'neumologia', 'cardiologia', 'medicina-interna'],
    setting: 'ambos',
    guidelineVersion: 'ESC/ERS Pulmonary Embolism Guidelines 2019 · ASH VTE',
    summary:
      'Integración práctica de Wells, PERC, Dímero-D ajustado por edad y manejo diferenciado del TEP normotenso vs. inestable.',
    columns: [
      'Probabilidad clínica / Gravedad',
      'Criterio objetivo exacto',
      'Prueba diagnóstica y conducta terapéutica inmediata',
    ],
    rows: [
      [
        { text: 'TEP probabilidad baja + PERC negativo', tone: 'normal', emphasize: true },
        'Wells TEP ≤ 4 puntos (o baja probabilidad) Y 8/8 criterios PERC negativos',
        'Excluye TEP clínicamente con valor predictivo negativo > 98 %; NO requiere Dímero-D ni angio-TC pulmonar.',
      ],
      [
        { text: 'TVP o TEP probabilidad baja / intermedia', tone: 'low', emphasize: true },
        'Wells TVP < 2 o Wells TEP ≤ 4 puntos (sin cumplir PERC negativo)',
        'Solicitar Dímero-D cuantitativo: negativo si < 500 µg/L (en > 50 años usar corte ajustado por edad: edad × 10 µg/L). Si negativo → excluye TEV; si positivo → Angio-TC pulmonar o Eco Doppler venoso.',
      ],
      [
        { text: 'TVP o TEP probabilidad clínica ALTA', tone: 'high', emphasize: true },
        'Wells TVP ≥ 2 puntos o Wells TEP > 4 puntos (TEV probable)',
        'NO solicitar Dímero-D (un resultado negativo no descarta): realizar Angio-TC pulmonar o Eco Doppler venoso directo; iniciar anticoagulación empírica mientras se completa la imagen si no hay alto riesgo hemorrágico.',
      ],
      [
        { text: 'TEP estable de riesgo bajo o intermedio', tone: 'moderate', emphasize: true },
        'Normotenso (PAS ≥ 90 mmHg) sin choque',
        'Bajo riesgo (sPESI = 0 y sin disfunción VD): anticoagulación (ACOD/HBPM) y valorar manejo domiciliario precoz. Intermedio-alto (sPESI ≥ 1 + disfunción VD en angio-TC/eco + troponina elevada): anticoagulación parenteral (HBPM/HNF) y monitorización estrecha por riesgo de deterioro.',
      ],
      [
        { text: 'TEP de ALTO RIESGO (inestable / masivo)', tone: 'critical', emphasize: true },
        'Paro cardíaco, choque obstructivo o hipotensión sostenida (PAS < 90 mmHg ≥ 15 min o caída ≥ 40 mmHg sin otra causa)',
        'Anticoagulación inmediata con HNF IV + trombólisis sistémica urgente (p. ej., alteplasa 100 mg IV en 2 h o 0.6 mg/kg en 15 min en paro cardíaco) salvo contraindicación absoluta (considerar trombectomía mecánica o embolectomía quirúrgica).',
      ],
    ],
    keyManagementPearls: [
      'En el embarazo, evitar angio-TC innecesario mediante ecografía Doppler bilateral de miembros inferiores cuando hay síntomas de TVP; si es positiva confirma TEV y habilita anticoagulación con HBPM.',
      'El Dímero-D ajustado por edad (edad × 10 µg/L) solo se aplica en pacientes > 50 años con probabilidad clínica baja o intermedia (nunca en probabilidad alta).',
    ],
    references: [
      {
        citation:
          'Konstantinides SV, Meyer G, Becattini C, et al. 2019 ESC Guidelines for the diagnosis and management of acute pulmonary embolism. Eur Heart J. 2020;41(4):543-603.',
        year: 2020,
      },
      {
        citation:
          'Lim W, Le Gal G, Bates SM, et al. American Society of Hematology 2018 guidelines for management of venous thromboembolism: diagnosis of VTE. Blood Adv. 2018;2(22):3226-3256.',
        year: 2018,
      },
    ],
  },
  {
    id: 'seizures-status-epilepticus-table',
    title: 'Crisis Convulsivas y Estatus Epiléptico (Adulto y Pediatría): Protocolo por Fases (AES / ILAE)',
    shortTitle: 'Convulsiones y Estatus Epiléptico',
    specialty: 'urgencias',
    secondarySpecialties: ['neurologia', 'pediatria', 'medicina-interna'],
    setting: 'urgencias',
    guidelineVersion: 'American Epilepsy Society (AES) · ILAE · ESETT',
    summary:
      'Secuencia cronológica exacta desde el minuto 0 hasta el estatus refractario con dosis por peso, topes máximos de seguridad y manejo de causas reversibles o eclampsia.',
    columns: [
      'Fase / Tiempo operativo',
      'Fármacos y dosis exactas (Adulto y Pediatría)',
      'Condiciones críticas y precauciones en Urgencias',
    ],
    rows: [
      [
        { text: 'Fase 0: Estabilización inicial (0 – 5 min)', tone: 'moderate', emphasize: true },
        'ABC + O₂ + monitoreo ECG/SpO₂/PA + glucemia capilar inmediata. Si glucosa < 60 mg/dL (< 45 mg/dL en neonato): Adulto dextrosa 50 % 25–50 mL IV (o D10 % 250 mL); Pediatría D10 % 2–5 mL/kg IV',
        'Asegurar vía aérea sin forzar apertura bucal; extraer muestras (Na⁺, K⁺, Ca²⁺, Mg²⁺, gasometría, niveles de antiepilépticos, tóxico/embarazo). En etilismo/desnutrición administrar tiamina 100 mg IV antes o junto con glucosa.',
      ],
      [
        { text: 'Fase 1: Primera línea — Benzodiazepinas (5 – 20 min · t₁ = 5 min)', tone: 'high', emphasize: true },
        'Con acceso IV: Lorazepam 0.1 mg/kg IV (máx 4 mg/dosis, repetir 1 vez a los 5 min) O Diazepam 0.15–0.2 mg/kg IV (máx 10 mg/dosis, repetir 1 vez). SIN acceso IV: Midazolam IM 10 mg (≥ 40 kg) o 5 mg (13–39 kg), o 0.2 mg/kg intranasal/bucal (máx 10 mg); o Diazepam rectal 0.2–0.5 mg/kg (máx 20 mg)',
        'El error más frecuente es infradosificar la primera benzodiazepina. Vigilar depresión respiratoria e hipotensión; no administrar más de 2 dosis plenas antes de pasar a Fase 2.',
      ],
      [
        { text: 'Fase 2: Segunda línea — Antiepilépticos IV (20 – 40 min · t₂ = 30 min)', tone: 'critical', emphasize: true },
        'Elegir UN fármaco en carga IV única (eficacia equivalente en ESETT): Levetiracetam 60 mg/kg IV en 10–15 min (máx 4,500 mg) · O Fosfenitoína 20 mg PE/kg IV (máx 1,500 mg PE, ≤ 150 mg PE/min) / Fenitoína 20 mg/kg en SS 0.9 % (≤ 50 mg/min adulto; ≤ 1 mg/kg/min niño) · O Valproato 40 mg/kg IV en 10 min (máx 3,000 mg)',
        'Fenitoína/Fosfenitoína: monitorizar ECG y PA (riesgo arritmia/hipotensión; contraindicada en bloqueo AV o intoxicación por bloqueadores de Na⁺). Valproato: evitar en embarazo, hepatopatía y sospecha de mitocondriopatía en < 2 años. En neonatos, Fenobarbital 20 mg/kg IV es de primera línea.',
      ],
      [
        { text: 'Fase 3: Estatus epiléptico refractario (> 40 min)', tone: 'critical', emphasize: true },
        'Inducción anestésica + intubación + UCI + EEG continuo: Midazolam (bolo 0.2 mg/kg IV → infusión 0.05–2 mg/kg/h) · O Propofol (bolo 1–2 mg/kg → 2–10 mg/kg/h, evitar dosis altas prolongadas en niños por PRIS) · O Ketamina (bolo 1.5 mg/kg → 1–5 mg/kg/h)',
        'Si persiste estatus tras anestesia (superrefractario), descartar encefalitis autoinmune/infecciosa, lesión estructural aguda y mantener metas de perfusión cerebral.',
      ],
      [
        { text: 'Escenarios especiales: Eclampsia, Hiponatremia, Febril e Isoniazida', tone: 'high', emphasize: true },
        'Eclampsia: Sulfato de magnesio 4–6 g IV en 15–20 min + 1–2 g/h (NO usar fenitoína como monoterapia). Hiponatremia grave: NaCl 3 % 100–150 mL adulto (2 mL/kg niño) en 10–20 min. Isoniazida: Piridoxina IV gramo a gramo (o 5 g si dosis desconocida)',
        'Convulsión febril pediátrica (6–60 meses): Simple (< 15 min, generalizada, única en 24 h) suele autolimitarse y NO requiere neuroimagen ni EEG rutinario; Compleja (≥ 15 min, focal o recurrente en 24 h) requiere observación e investigar foco/infección del SNC.',
      ],
    ],
    keyManagementPearls: [
      'Una crisis tónico-clónica generalizada que dura ≥ 5 minutos (tiempo t₁ de la ILAE) tiene baja probabilidad de ceder espontáneamente y debe tratarse ya como estatus epiléptico.',
      'El ensayo ESETT demostró eficacia clínica equivalente (~45–47 % de cese a los 60 min) entre levetiracetam 60 mg/kg, fosfenitoína 20 mg PE/kg y valproato 40 mg/kg como segunda línea.',
      'Si el paciente recuperó el nivel de conciencia basal tras una primera crisis aislada, buscar desencadenantes metabólicos, abstinencia alcohólica/BZD, ictus, infección del SNC o lesión estructural antes del alta.',
    ],
    references: [
      {
        citation:
          'Glauser T, Shinnar S, Gloss D, et al. Evidence-Based Guideline: Treatment of Convulsive Status Epilepticus in Children and Adults: Report of the Guideline Committee of the American Epilepsy Society. Epilepsy Curr. 2016;16(1):48-61.',
        year: 2016,
      },
      {
        citation:
          'Kapur J, Elm J, Chamberlain JM, et al. Randomized Trial of Three Anticonvulsant Medications for Status Epilepticus (ESETT). N Engl J Med. 2019;381(22):2103-2113.',
        year: 2019,
      },
    ],
  },
  {
    id: 'rsi-airway-medications-table',
    title: 'Secuencia de Intubación Rápida (SIR) en Urgencias: Fármacos, Dosis y Contraindicaciones',
    shortTitle: 'Intubación Secuencia Rápida (SIR)',
    specialty: 'urgencias',
    secondarySpecialties: ['cirugia-general', 'pediatria'],
    setting: 'urgencias',
    guidelineVersion: 'Práctica Estándar de Vía Aérea de Emergencia',
    summary:
      'Guía rápida de dosificación por peso para inducción y bloqueo neuromuscular en Urgencias, con selección según estado hemodinámico y contraindicaciones críticas.',
    columns: [
      'Fármaco / Paso',
      'Dosis exacta IV (Adulto / Pediatría)',
      'Perfil hemodinámico y contraindicaciones clave',
    ],
    rows: [
      [
        { text: 'Preparación y preoxigenación', tone: 'neutral', emphasize: true },
        'O₂ al 100 % × 3–5 min (o 8 respiraciones a capacidad vital); optimizar PAS/PAM con bolo cristaloide o vasopresor ANTES de inducir',
        'Evitar desaturación e hipotensión peri-intubación ("resucitar antes de intubar"). Tener aspiración, videolaringoscopio/bougie y capnografía de onda listos.',
      ],
      [
        { text: 'Inductor — Etomidato', tone: 'normal', emphasize: true },
        '0.3 mg/kg IV en bolo rápido (inicio 15–45 s · duración 5–15 min)',
        'Neutro hemodinámicamente (de elección en hipotensión o TCE). Precaución: supresión suprarrenal transitoria con dosis única (relevancia clínica debatida en sepsis).',
      ],
      [
        { text: 'Inductor — Ketamina', tone: 'normal', emphasize: true },
        '1.5 – 2.0 mg/kg IV (inicio 45–60 s · duración 10–20 min)',
        'Estimula tono simpático y broncodilatador: excelente en choque, sepsis y asma grave. En depleción catecolaminérgica extrema puede desenmascarar depresión miocárdica.',
      ],
      [
        { text: 'Inductor — Propofol o Midazolam', tone: 'moderate', emphasize: true },
        'Propofol: 1.5 – 2.5 mg/kg IV (reducir a 0.5–1 mg/kg si anciano/frágil) · Midazolam: 0.1 – 0.3 mg/kg IV (inicio más lento 60–90 s)',
        'Ambos producen vasodilatación e hipotensión dependiente de dosis: EVITAR o reducir drásticamente en hipovolemia, choque o inestabilidad.',
      ],
      [
        { text: 'Bloqueante — Succinilcolina (despolarizante)', tone: 'high', emphasize: true },
        '1.5 mg/kg IV adulto (2 mg/kg en lactantes < 1 año; inicio 45 s · duración 6–10 min)',
        'CONTRAINDICACIONES ABSOLUTAS: hiperpotasemia conocida/sospechada (K⁺ > 5.5 mEq/L o ECG alterado), quemaduras graves > 24–48 h, aplastamiento/rabdomiólisis, denervación/lesión medular > 48 h, distrofias musculares, antecedente de hipertermia maligna.',
      ],
      [
        { text: 'Bloqueante — Rocuronio (no despolarizante)', tone: 'normal', emphasize: true },
        '1.2 mg/kg IV para SIR (inicio 45–60 s · duración 45–70 min)',
        'Alternativa segura sin riesgo de hiperpotasemia ni hipertermia maligna (reversible con sugammadex 16 mg/kg). Exige asegurar sedoanalgesia continua inmediata tras la intubación para evitar despertar bajo parálisis.',
      ],
    ],
    keyManagementPearls: [
      'Pretratamiento selectivo con Fentanilo (2–3 µg/kg IV lento 2–3 min antes) solo si está hemodinámicamente estable y requiere atenuar respuesta simpática (TCE grave, hemorragia intracraneal, disección aórtica, cardiopatía isquémica).',
      'La confirmación definitiva de intubación endotraqueal requiere capnografía de onda continua (EtCO₂ presente durante ≥ 5–6 respiraciones), nunca solo auscultación.',
    ],
    references: [
      {
        citation:
          'Brown CA III, Sakles JC, Mick NW. The Walls Manual of Emergency Airway Management (6th ed.). Wolters Kluwer; 2023.',
        year: 2023,
      },
      {
        citation:
          'Acquisto NM, Mosier JM, Bittner EA, et al. Society of Critical Care Medicine Clinical Practice Guidelines for Rapid Sequence Intubation in the Critically Ill Adult Patient. Crit Care Med. 2023;51(10):1411-1430.',
        year: 2023,
      },
    ],
  },
  {
    id: 'cardiac-arrest-vasopressors-aha-table',
    title: 'Paro Cardiorrespiratorio (ACLS / PALS) y Vasopresores en Choque (AHA 2020)',
    shortTitle: 'Paro Cardíaco (ACLS/PALS) y Vasopresores',
    specialty: 'urgencias',
    secondarySpecialties: ['cardiologia', 'pediatria'],
    setting: 'urgencias',
    guidelineVersion: 'AHA Guidelines for CPR and ECC 2020',
    summary:
      'Algoritmos esenciales de soporte vital avanzado adulto/pediátrico, causas reversibles (5H/5T) y dosificación inicial de vasopresores en choque.',
    columns: [
      'Escenario / Fármaco',
      'Dosis / Parámetros exactos',
      'Frecuencia, metas y notas críticas',
    ],
    rows: [
      [
        { text: 'RCP de alta calidad (Adulto y Pediatría)', tone: 'high', emphasize: true },
        'Frecuencia 100–120/min · Profundidad adulto 5–6 cm (niño ~5 cm; lactante ~4 cm) · 30:2 sin vía aérea avanzada (15:2 con 2 reanimadores en pediatría)',
        'Permitir reexpansión torácica completa, minimizar pausas (< 10 s), cambiar compresor c/2 min y evitar hiperventilación (con tubo: 1 ventilación c/6 s en adulto; 1 c/2–3 s [20–30/min] en pediatría).',
      ],
      [
        { text: 'FV / TV sin pulso (Ritmos desfibrilables)', tone: 'critical', emphasize: true },
        'Descarga bifásica: Adulto 120–200 J (máx 360 J) · Pediatría 2 J/kg → 4 J/kg (hasta máx 10 J/kg o dosis adulto). Adrenalina 1 mg IV/IO (0.01 mg/kg niño) tras 2.ª descarga c/3–5 min. Amiodarona 300 mg IV/IO tras 3.ª descarga (2.ª dosis 150 mg) [Pediatría 5 mg/kg] O Lidocaína 1–1.5 mg/kg',
        'Reiniciar compresiones inmediatamente tras cada descarga sin palpar pulso hasta completar el ciclo de 2 minutos.',
      ],
      [
        { text: 'Asistolia / AESP (Ritmos no desfibrilables)', tone: 'critical', emphasize: true },
        'NO desfibrilar. Adrenalina 1 mg IV/IO adulto (0.01 mg/kg = 0.1 mL/kg de 1:10,000 niño, máx 1 mg) LO ANTES POSIBLE y repetir cada 3–5 min',
        'Tratar activamente las 5H (Hipovolemia, Hipoxia, Hidrogeniones/acidosis, Hipo/Hiperpotasemia, Hipotermia) y 5T (Neumotórax a Tensión, Taponamiento, Tóxicos, Trombosis pulmonar, Trombosis coronaria).',
      ],
      [
        { text: 'Norepinefrina (1.ª línea en choque séptico / distributivo)', tone: 'high', emphasize: true },
        'Adulto: 0.05 – 1.0 µg/kg/min (o 2 – 30 µg/min titulado) · Pediatría: 0.05 – 1.0 µg/kg/min',
        'Meta estándar PAM ≥ 65 mmHg en adultos. Puede iniciarse de forma temporal por vía periférica proximal segura mientras se canaliza vía central (vigilar extravasación; antídoto fentolamina local).',
      ],
      [
        { text: 'Vasopresina, Adrenalina y Dobutamina (Choque / Post-ROSC)', tone: 'moderate', emphasize: true },
        'Vasopresina: 0.03 U/min IV dosis fija (coadyuvante en séptico refractario) · Adrenalina infusión: 0.05 – 0.5 µg/kg/min (anafilaxia/choque frío pediátrico/bradicardia) · Dobutamina: 2 – 20 µg/kg/min (bajo gasto cardiogénico con PA suficiente)',
        'En paro cardíaco por Torsades de Pointes o hipomagnesemia: MgSO₄ 1–2 g IV en 1–2 min. En hiperpotasemia: Gluconato cálcico + insulina/dextrosa + NaHCO₃ si acidosis.',
      ],
    ],
    keyManagementPearls: [
      'En embarazada con paro cardíaco y fondo uterino ≥ ombligo (~≥ 20 SG): realizar desplazamiento uterino manual a la izquierda continuo y preparar histerotomía resucitativa a los 4–5 minutos si no hay ROSC.',
      'Tras retorno de circulación espontánea (ROSC): evitar hiperoxia (titular O₂ para SpO₂ 92–98 %), evitar hipotensión (PAS ≥ 90 / PAM ≥ 65 mmHg), obtener ECG de 12 derivaciones y evitar fiebre.',
    ],
    references: [
      {
        citation:
          'Panchal AR, Bartos JA, Cabañas JG, et al. Part 3: Adult Basic and Advanced Life Support: 2020 AHA Guidelines for CPR and ECC. Circulation. 2020;142(16_suppl_2):S366-S468.',
        year: 2020,
      },
      {
        citation:
          'Topjian AA, Raymond TT, Atkins D, et al. Part 4: Pediatric Basic and Advanced Life Support: 2020 AHA Guidelines for CPR and ECC. Circulation. 2020;142(16_suppl_2):S469-S523.',
        year: 2020,
      },
    ],
  },
  {
    id: 'acute-arrhythmias-acls-table',
    title: 'Bradiarritmias y Taquiarritmias Agudas en Urgencias: Estable vs. Inestable (ACLS / ESC)',
    shortTitle: 'Arritmias Agudas (ACLS / ESC)',
    specialty: 'cardiologia',
    secondarySpecialties: ['urgencias', 'medicina-interna'],
    setting: 'urgencias',
    guidelineVersion: 'AHA ACLS 2020 · ESC Supraventricular/Ventricular Guidelines',
    summary:
      'Criterios objetivos de inestabilidad hemodinámica, dosis de atropina/adenosina/amiodarona y energías de cardioversión sincronizada.',
    columns: [
      'Arritmia / Estado clínico',
      'Criterio diagnóstico / De inestabilidad',
      'Conducta inmediata en Urgencias',
    ],
    rows: [
      [
        { text: 'Criterios de INESTABILIDAD hemodinámica (cualquier arritmia)', tone: 'critical', emphasize: true },
        '≥ 1 signo atribuible a la arritmia: hipotensión (PAS < 90 mmHg), alteración aguda de conciencia, choque/hipoperfusión, dolor torácico isquémico o edema pulmonar agudo',
        'Priorizar terapia eléctrica inmediata (cardioversión sincronizada en taquicardias con pulso; marcapasos/vasopresor en bradicardia refractaria) sin demorar con fármacos.',
      ],
      [
        { text: 'Bradiarritmia sintomática (FC < 50 lpm con síntomas)', tone: 'high', emphasize: true },
        'Bradicardia sinusal, bloqueo AV 2.º grado Mobitz II o bloqueo AV completo (3.º grado)',
        'Atropina 1 mg IV cada 3–5 min (dosis máx 3 mg; suele ser ineficaz en bloqueo AV infranodal Mobitz II / 3.º grado). Si no responde: marcapasos transcutáneo, Dopamina (5–20 µg/kg/min) o Adrenalina (2–10 µg/min).',
      ],
      [
        { text: 'Taquicardia INESTABLE con pulso (FC típicamente ≥ 150 lpm)', tone: 'critical', emphasize: true },
        'Taquiarritmia + ≥ 1 signo de inestabilidad (sedoanalgesia rápida si el estado del paciente lo permite sin retrasar descarga)',
        'Cardioversión eléctrica SINCRONIZADA (bifásica): QRS estrecho regular 50–100 J · QRS estrecho irregular (FA) 120–200 J · QRS ancho regular (TV monomorfa) 100 J · QRS ancho irregular (TV polimórfica/FV): DESFIBRILACIÓN no sincronizada (200 J).',
      ],
      [
        { text: 'Taquicardia QRS estrecho (< 120 ms) REGULAR y ESTABLE (TPSV)', tone: 'moderate', emphasize: true },
        'Ritmo regular rápido, ondas P ocultas o retrógradas (TRIN / TRAV)',
        '1) Maniobras vagales (Valsalva modificada). 2) Adenosina 6 mg IV bolo ultrarrápido (vía proximal + lavado 20 mL SS 0.9 %) → si persiste a los 1–2 min: 12 mg IV (repetible 12 mg). Contraindicada en asma grave/WPW con FA preexcitada.',
      ],
      [
        { text: 'Taquicardia QRS ancho (≥ 120 ms) ESTABLE', tone: 'high', emphasize: true },
        'Asumir Taquicardia Ventricular hasta demostrar lo contrario (especialmente si cardiopatía estructural)',
        'Monomorfa regular: Amiodarona 150 mg IV en 10 min (repetible, seguida de 1 mg/min × 6 h) o Procainamida (20–50 mg/min hasta máx 17 mg/kg). Si polimórfica + QT largo (Torsades): MgSO₄ 2 g IV en 10 min y suspender fármacos prolongadores de QT.',
      ],
    ],
    keyManagementPearls: [
      'En Fibrilación Auricular con preexcitación (síndrome de Wolff-Parkinson-White, QRS ancho e irregular muy rápido), están CONTRAINDICADOS los bloqueadores del nodo AV (adenosina, betabloqueantes, verapamilo, diltiazem, digoxina) por riesgo de degenerar en fibrilación ventricular: usar procainamida o cardioversión.',
      'En FA estable de inicio ≥ 48 h o desconocido, NO realizar cardioversión farmacológica ni eléctrica sin anticoagulación previa ≥ 3 semanas o ecocardiograma transesofágico negativo para trombo auricular.',
    ],
    references: [
      {
        citation:
          'Panchal AR, Bartos JA, Cabañas JG, et al. Part 3: Adult Basic and Advanced Life Support: 2020 AHA Guidelines for CPR and ECC. Circulation. 2020;142(16_suppl_2):S366-S468.',
        year: 2020,
      },
      {
        citation:
          'Brugada J, Katritsis DG, Arbelo E, et al. 2019 ESC Guidelines for the management of patients with supraventricular tachycardia. Eur Heart J. 2020;41(5):655-720.',
        year: 2020,
      },
    ],
  },
  {
    id: 'acute-toxicology-antidotes-table',
    title: 'Intoxicaciones Agudas y Antídotos Específicos en Urgencias',
    shortTitle: 'Intoxicaciones y Antídotos',
    specialty: 'urgencias',
    secondarySpecialties: ['medicina-interna', 'pediatria'],
    setting: 'urgencias',
    guidelineVersion: 'AACT / EAPCCT · AHA Toxicology 2023',
    summary:
      'Referencia rápida de toxíndromes, criterios de administración y dosis iniciales de los principales antídotos de emergencia.',
    columns: [
      'Tóxico / Toxíndrome',
      'Criterio de gravedad o indicación de antídoto',
      'Antídoto y esquema inicial en Urgencias',
    ],
    rows: [
      [
        { text: 'Paracetamol (Acetaminofén)', tone: 'high', emphasize: true },
        'Ingesta aguda ≥ 150 mg/kg (o ≥ 7.5–10 g en adulto) O nivel sérico ≥ línea de tratamiento de Rumack-Matthew (≥ 150 µg/mL a las 4 h) O transaminasas elevadas',
        'N-acetilcisteína (NAC) IV (máx eficacia si < 8 h): esquema estándar 21 h (150 mg/kg en 60 min → 50 mg/kg en 4 h → 100 mg/kg en 16 h) o esquema simplificado en 2 bolsas (200 mg/kg en 4 h → 100 mg/kg en 16 h). Carbón activado 1 g/kg VO si ingesta < 1–2 h (4 h si liberación prolongada).',
      ],
      [
        { text: 'Opioides (Sobredosis con depresión respiratoria)', tone: 'critical', emphasize: true },
        'FR < 12 rpm, apnea, miosis, estupor/coma',
        'Ventilar primero con bolsa-mascarilla + O₂. Naloxona titulada para restaurar ventilación (sin desencadenar abstinencia aguda violenta): 0.04 – 0.4 mg IV/IM/SC/IN (en paro cardíaco 2 mg). En opioides de acción larga (metadona, fentanilos) vigilar recurrencia e infusión continua (2/3 de dosis efectiva/hora).',
      ],
      [
        { text: 'Antidepresivos tricíclicos / Bloqueadores de canal de Na⁺', tone: 'critical', emphasize: true },
        'QRS > 100 ms (o > 120 ms = alto riesgo de arritmia/convulsión), onda R terminal en aVR > 3 mm, hipotensión o arritmia ventricular',
        'Bicarbonato de sodio 8.4 %: bolo 1 – 2 mEq/kg IV rápido; repetir hasta estrechar QRS y mantener pH arterial 7.45–7.55 (NO usar flumazenil si coingesta con BZD; NO usar amiodarona/procainamida). Si convulsiona: benzodiazepina.',
      ],
      [
        { text: 'Organofosforados / Carbamatos (Síndrome colinérgico)', tone: 'critical', emphasize: true },
        'Broncorrea, broncoespasmo, bradicardia, miosis, fasciculaciones, diaforesis',
        'Descontaminación cutánea/ropa con equipo de protección. Atropina IV: 1 – 2 mg (0.02–0.05 mg/kg niño) doblando dosis c/5 min hasta secar secreciones bronquiales (meta clínica, NO tamaño pupilar). En organofosforados añadir Pralidoxima (30 mg/kg bolo en 30 min → 8 mg/kg/h).',
      ],
      [
        { text: 'Betabloqueantes y Calcioantagonistas', tone: 'critical', emphasize: true },
        'Bradicardia refractaria, bloqueo AV, hipotensión / choque cardiogénico (hiperglucemia orienta a calcioantagonista)',
        '1) Líquidos + vasopresor + Gluconato cálcico 10 % (30 mL = 3 g IV; niño 0.6 mL/kg) o Cloruro cálcico 10 % (10–20 mL vía central). 2) Glucagón 3–5 mg IV en 1–2 min (betabloqueantes). 3) Terapia insulina-euglucemia dosis alta: insulina regular 1 U/kg bolo + 0.5–1 U/kg/h + dextrosa para euglucemia y vigilar K⁺.',
      ],
      [
        { text: 'Monóxido de carbono (CO) / Metahemoglobinemia', tone: 'high', emphasize: true },
        'CO: cefalea, síncope, embarazo, alteración neurológica o COHb > 25 % (> 15 % gestante). MetaHb: cianosis refractaria a O₂, sangre achocolatada, MetaHb > 20–30 % o sintomática',
        'CO: O₂ al 100 % con mascarilla no reinhalación de inmediato (reduce vida media de 4–5 h a ~60–90 min); valorar cámara hiperbárica si síncope, coma, isquemia o embarazo. MetaHb: Azul de metileno 1–2 mg/kg IV en 5 min (evitar en déficit grave de G6PD).',
      ],
    ],
    keyManagementPearls: [
      'Flumazenil en intoxicación por benzodiazepinas está CONTRAINDICADO ante coingesta desconocida, uso crónico de BZD (riesgo de estatus epiléptico refractario), antecedente de epilepsia o QRS ancho por tricíclicos.',
      'El carbón activado (1 g/kg, máx 50 g VO) solo está indicado en ingestas potencialmente tóxicas recientes (habitualmente ≤ 1–2 h) con vía aérea protegida o intubada, y es INEFICAZ en alcoholes, metales (hierro, litio, plomo), cáusticos e hidrocarburos.',
    ],
    references: [
      {
        citation:
          'Lavonas EJ, Akpunonu PD, Arens AM, et al. 2023 American Heart Association Focused Update on the Management of Patients With Cardiac Arrest or Life-Threatening Toxicity Due to Poisoning. Circulation. 2023;148(16):e149-e184.',
        year: 2023,
      },
      {
        citation:
          'Dart RC, Mullins ME, Matoushek T, et al. Management of Acetaminophen Poisoning in the US and Canada: A Consensus Statement. JAMA Netw Open. 2023;6(8):e2327739.',
        year: 2023,
      },
    ],
  },
  {
    id: 'major-trauma-atls-hemorrhage-table',
    title: 'Trauma Grave, Choque Hemorrágico (ATLS 10.ª ed.) y Reanimación Hemostática',
    shortTitle: 'Trauma Grave y Choque (ATLS)',
    specialty: 'urgencias',
    secondarySpecialties: ['traumatologia', 'cirugia-general'],
    setting: 'urgencias',
    guidelineVersion: 'ATLS 10.ª edición · CRASH-2 / CRASH-3 · BTF TCE',
    summary:
      'Clasificación fisiológica del choque hemorrágico en adultos, ventana del ácido tranexámico, transfusión masiva y metas de neuroprotección en TCE.',
    columns: [
      'Clase / Escenario de trauma',
      'Parámetros clínicos objetivos (Adulto ~70 kg)',
      'Conducta inmediata en sala de trauma',
    ],
    rows: [
      [
        { text: 'Choque Hemorrágico Clase I (< 15 % volemia · < 750 mL)', tone: 'normal', emphasize: true },
        'FC < 100 lpm · PAS normal · Presión de pulso normal/aumentada · FR 14–20 rpm · Diuresis > 30 mL/h · Ansiedad leve',
        'Cristaloide isotónico tibio inicial limitado (máx 1 L en adulto mientras se evalúa respuesta); búsqueda dirigida de sangrado oculto (tórax, abdomen/eFAST, pelvis, fémur).',
      ],
      [
        { text: 'Choque Hemorrágico Clase II (15 – 30 % · 750–1,500 mL)', tone: 'low', emphasize: true },
        'FC 100 – 120 lpm · PAS normal · Presión de pulso disminuida · FR 20–30 rpm · Diuresis 20–30 mL/h · Ansiedad moderada',
        'Cristaloide inicial (máx 1 L total; evitar dilución excesiva) + cruzar sangre + considerar ácido tranexámico si riesgo de hemorragia significativa.',
      ],
      [
        { text: 'Choque Hemorrágico Clase III (31 – 40 % · 1,500–2,000 mL)', tone: 'high', emphasize: true },
        'FC 121 – 140 lpm · PAS DISMINUIDA · Presión de pulso disminuida · FR 30–35 rpm · Diuresis 5–15 mL/h · Ansioso / confuso',
        'Activación precoz de hemoderivados (transfusión balanceada GR:PFC:Plaquetas 1:1:1) + control anatómico urgente del foco (torniquete, faja pélvica, quirófano/angioembolización).',
      ],
      [
        { text: 'Choque Hemorrágico Clase IV (> 40 % volemia · > 2,000 mL)', tone: 'critical', emphasize: true },
        'FC > 140 lpm · PAS muy baja · Presión de pulso muy estrecha · FR > 35 rpm · Anuria (< 5 mL/h) · Letárgico / obnubilado',
        'Protocolo de Transfusión Masiva (1:1:1) + Ácido tranexámico + corrección de hipocalcemia (Ca²⁺ ionizado < 1.1 mmol/L por citrato) + prevención activa de tríada letal (hipotermia, acidosis, coagulopatía).',
      ],
      [
        { text: 'Ácido tranexámico (TXA) en trauma / TCE (CRASH-2 y CRASH-3)', tone: 'high', emphasize: true },
        'Trauma con hemorragia significativa (PAS < 90 o FC > 110) o TCE moderado-leve (ECG 9–15 con hemorragia intracraneal): administrar ≤ 3 HORAS desde el trauma',
        'Adulto: 1 g IV en 10 min seguido de 1 g IV en 8 h (Pediatría: 15 mg/kg hasta máx 1 g en 10 min → 2 mg/kg/h × 8 h). NO iniciar si han pasado > 3 horas desde el accidente (asociado a mayor mortalidad).',
      ],
      [
        { text: 'Neumotórax a tensión y TCE grave (metas neuroprotectoras)', tone: 'critical', emphasize: true },
        'Neumotórax a tensión: choque obstructivo + ausencia de murmullo + desviación traqueal tardía. TCE grave (ECG ≤ 8): evitar hipoxia e hipotensión',
        'Neumotórax a tensión: descompresión inmediata SIN esperar radiografía (adultos ATLS 10: 4.º–5.º EIC línea axilar anterior/media; niños: 2.º EIC línea medioclavicular) seguida de tubo torácico. TCE grave: mantener SpO₂ > 90–94 %, PAS ≥ 100 mmHg (50–69 años) o ≥ 110 mmHg (15–49 o ≥ 70 años) y PaCO₂ 35–40 mmHg.',
      ],
    ],
    keyManagementPearls: [
      'En trauma penetrante sin TCE grave ni lesión medular se emplea hipotensión permisiva (PAS 80–90 mmHg) hasta control quirúrgico; en cambio, si hay TCE sospechado/confirmado, la hipotensión duplica la mortalidad y debe mantenerse PAS ≥ 100–110 mmHg.',
      'Limitar cristaloides a ≤ 1 L en adultos con hemorragia activa y cambiar precozmente a sangre/hemoderivados 1:1:1 para evitar coagulopatía dilucional y edema pulmonar.',
    ],
    references: [
      {
        citation:
          'American College of Surgeons Committee on Trauma. Advanced Trauma Life Support (ATLS) Student Course Manual (10th ed.). 2018.',
        year: 2018,
      },
      {
        citation:
          'CRASH-2 & CRASH-3 Trial Collaborators. Effects of tranexamic acid on death, vascular occlusive events, and blood transfusion in trauma patients with significant haemorrhage / TBI. Lancet. 2010/2019.',
        year: 2019,
      },
    ],
  },
  {
    id: 'bacterial-meningitis-cns-table',
    title: 'Meningitis Bacteriana Aguda: Tiempos Críticos, Dexametasona y Antibióticos (IDSA / ESCMID)',
    shortTitle: 'Meningitis Bacteriana Aguda',
    specialty: 'infectologia',
    secondarySpecialties: ['urgencias', 'neurologia', 'pediatria', 'medicina-interna'],
    setting: 'urgencias',
    guidelineVersion: 'IDSA / ESCMID Acute Bacterial Meningitis Guidelines',
    summary:
      'Secuencia de la primera hora en Urgencias, criterios para TC craneal antes de punción lumbar sin retrasar antibióticos y esquemas empíricos por edad.',
    columns: [
      'Paso / Grupo clínico',
      'Criterio o indicación exacta',
      'Conducta y dosis empírica urgente',
    ],
    rows: [
      [
        { text: 'Meta cronológica y Dexametasona coadyuvante', tone: 'critical', emphasize: true },
        'Antibiótico IV en ≤ 60 min desde llegada. Dexametasona indicada ANTES (10–20 min) o CON la 1.ª dosis antibiótica en sospecha de meningitis bacteriana (especialmente neumococo)',
        '2 hemocultivos inmediatos + Dexametasona 0.15 mg/kg IV (máx 10 mg) c/6 h × 4 días (suspender si se descarta S. pneumoniae / H. influenzae). Si se difiere punción lumbar por TC: extraer hemocultivos, dar dexametasona + antibiótico ANTES de ir a TC.',
      ],
      [
        { text: 'Criterios de TC craneal PREVIA a Punción Lumbar (PL)', tone: 'high', emphasize: true },
        '≥ 1 criterio: inmunodepresión grave, antecedente de lesión del SNC (masa, ictus, infección focal), convulsión de inicio reciente (< 1 semana), papiledema, alteración de conciencia (ECG ≤ 11–12) o déficit neurológico focal',
        'Realizar TC simple para descartar efecto de masa antes de la PL. Si ninguno está presente, realizar PL directa sin demorar antibióticos. Contraindicación de PL: coagulopatía grave (plaquetas < 50,000 o INR > 1.5), inestabilidad extrema o infección en sitio de punción.',
      ],
      [
        { text: 'Adulto 18 a 50 años inmunocompetente', tone: 'high', emphasize: true },
        'Patógenos principales: S. pneumoniae, N. meningitidis',
        'Ceftriaxona 2 g IV c/12 h (o Cefotaxima 2 g IV c/4–6 h) + Vancomicina 15–20 mg/kg IV c/8–12 h (dosis de carga 25–30 mg/kg si sepsis grave).',
      ],
      [
        { text: 'Adulto > 50 años, embarazada o inmunodeprimido / alcohólico', tone: 'critical', emphasize: true },
        'Cobertura adicional obligatoria para Listeria monocytogenes (y bacilos gramnegativos si inmunodepresión grave)',
        'Ceftriaxona 2 g IV c/12 h + Vancomicina 15–20 mg/kg IV c/8–12 h + AMPICILINA 2 g IV c/4 h. En neurocirugía reciente/derivación LCR/trauma penetrante: Cefepima 2 g c/8 h o Meropenem 2 g c/8 h + Vancomicina.',
      ],
      [
        { text: 'Pediatría (> 1 mes a 17 años) y Neonatos (< 1 mes)', tone: 'critical', emphasize: true },
        'Niños > 1 mes: S. pneumoniae, N. meningitidis · Neonatos (≤ 28 días): S. agalactiae, E. coli, Listeria',
        '> 1 mes: Ceftriaxona 50 mg/kg IV c/12 h (máx 2 g/dosis) + Vancomicina 15 mg/kg IV c/6 h. Neonatos (≤ 28 días): Ampicilina + Cefotaxima (o Gentamicina según protocolo neonatal; evitar ceftriaxona en neonato con hiperbilirrubinemia/calcio IV).',
      ],
    ],
    keyManagementPearls: [
      'Ante encefalopatía febril, crisis focales o alteración conductual sugestiva de encefalitis viral, añadir Aciclovir 10 mg/kg IV c/8 h (ajustado por función renal) desde Urgencias hasta descartar VHS por PCR en LCR.',
      'Quimioprofilaxis de contactos estrechos ante sospecha/confirmación de N. meningitidis: Rifampicina 600 mg VO c/12 h × 2 días (niños 10 mg/kg), Ciprofloxacino 500 mg VO dosis única (adultos) o Ceftriaxona 250 mg IM dosis única (125 mg en < 15 años, segura en embarazo).',
    ],
    references: [
      {
        citation:
          'van de Beek D, Cabellos C, Dzupova O, et al. ESCMID guideline: diagnosis and treatment of acute bacterial meningitis. Clin Microbiol Infect. 2016;22 Suppl 3:S37-S62.',
        year: 2016,
      },
      {
        citation:
          'Tunkel AR, Hartman BJ, Kaplan SL, et al. Practice guidelines for the management of bacterial meningitis (IDSA). Clin Infect Dis. 2004;39(9):1267-1284.',
        year: 2004,
      },
    ],
  },
  {
    id: 'rads-classifications-table',
    title: 'Sistemas RADS en Oncología e Imagen Diagnóstica (BI-RADS, TI-RADS, PI-RADS, O-RADS, LI-RADS)',
    shortTitle: 'Sistemas RADS (BI/TI/PI/O/LI)',
    specialty: 'oncologia',
    secondarySpecialties: ['gineco-obstetricia', 'urologia', 'endocrinologia', 'medicina-interna'],
    setting: 'ambos',
    guidelineVersion: 'ACR BI-RADS 5.ª ed. · TI-RADS 2017 · PI-RADS v2.1 · O-RADS US v2022 · LI-RADS',
    summary:
      'Resumen comparativo de categorías radiológicas estandarizadas, riesgo de malignidad y conducta clínica (biopsia vs. vigilancia vs. referencia oncológica).',
    columns: [
      'Sistema y Categoría',
      'Riesgo de malignidad / Definición',
      'Conducta recomendada en consulta',
    ],
    rows: [
      [
        { text: 'BI-RADS 0 / 1 / 2 (Mama)', tone: 'normal', emphasize: true },
        '0: Incompleta · 1: Negativo (0 %) · 2: Benigno (~0 %)',
        'BI-RADS 0: completar con proyecciones/ecografía. BI-RADS 1 y 2: continuar tamizaje rutinario anual/bienal (si hay masa palpable nueva en mama densa, solicitar ecografía).',
      ],
      [
        { text: 'BI-RADS 3 vs. 4A / 4B / 4C vs. 5 (Mama)', tone: 'high', emphasize: true },
        '3: ≤ 2 % · 4A: > 2–10 % · 4B: > 10–50 % · 4C: > 50–< 95 % · 5: ≥ 95 %',
        'BI-RADS 3: control de imagen a los 6, 12 y 24 meses. BI-RADS 4A/4B/4C y 5: BIOPSIA percutánea con aguja gruesa (tru-cut/vacío) + correlación radio-patológica; en 5 derivación inmediata a Oncología/Mastología.',
      ],
      [
        { text: 'ACR TI-RADS TR1–TR5 (Nódulo Tiroideo)', tone: 'moderate', emphasize: true },
        'TR1 (0 pts, ≤ 2 %) · TR2 (2 pts, ≤ 2 %) · TR3 (3 pts, ~4.8 %) · TR4 (4–6 pts, ~9.1 %) · TR5 (≥ 7 pts, ~35 %)',
        'PAAF indicada según tamaño: TR1–TR2 sin PAAF · TR3: PAAF ≥ 25 mm (seguimiento 15–24 mm) · TR4: PAAF ≥ 15 mm (seguimiento 10–14 mm) · TR5: PAAF ≥ 10 mm (seguimiento 5–9 mm).',
      ],
      [
        { text: 'PI-RADS v2.1 Cat 1–5 (RM Próstata)', tone: 'high', emphasize: true },
        '1–2: Ca significativo improbable · 3: Equívoco (~15 %) · 4: Probable (~50 %) · 5: Muy probable (≥ 75–90 %)',
        'PI-RADS 1–2: vigilancia con PSA/PSAD. PI-RADS 3: decidir biopsia según Densidad de PSA (PSAD ≥ 0.15 ng/mL² favorece biopsia). PI-RADS 4–5: biopsia dirigida (fusión) + sistemática.',
      ],
      [
        { text: 'O-RADS US v2022 (Masa Anexial / Ovario)', tone: 'high', emphasize: true },
        '1: Normal (0 %) · 2: Benigno (< 1 %) · 3: Bajo (1–< 10 %) · 4: Intermedio (10–< 50 %) · 5: Alto (≥ 50 %)',
        'O-RADS 1–2: conservador. O-RADS 3: manejo ginecológico. O-RADS 4: interconsulta con Ginecólogo Oncólogo o RM O-RADS + CA-125/ROMA. O-RADS 5: derivación directa a Ginecología Oncológica.',
      ],
      [
        { text: 'LI-RADS LR-1 a LR-5 / LR-M (Hígado en cirrosis/VHB)', tone: 'critical', emphasize: true },
        'LR-1/2: Benigno/Prob. benigno · LR-3: ~38 % CHC · LR-4: ~74 % CHC · LR-5: ~94 % CHC definitivo · LR-M: Maligno no CHC',
        'LR-1/2: vigilancia c/6 m. LR-3: control 3–6 m. LR-4: comité multidisciplinario (valorar biopsia). LR-5: diagnóstico no invasivo de CHC sin necesidad habitual de biopsia. LR-M: biopsia recomendada.',
      ],
    ],
    keyManagementPearls: [
      'LI-RADS solo es aplicable en pacientes con cirrosis hepática, infección crónica por VHB o antecedente de hepatocarcinoma; en hígado sano requiere diagnóstico histológico.',
      'En BI-RADS 1 o 2 con nódulo mamario palpable clínicamente nuevo o telorrea sanguinolenta unilateral, prevalece la sospecha clínica: realizar ecografía dirigida y biopsia.',
    ],
    references: [
      {
        citation:
          'American College of Radiology (ACR). BI-RADS Atlas 5th ed., TI-RADS 2017, PI-RADS v2.1 (2019), O-RADS US v2022 (Radiology 2023), CT/MRI LI-RADS v2018.',
        year: 2023,
      },
    ],
  },
  {
    id: 'cervical-pap-asccp-table',
    title: 'Manejo de PAP Alterado (Bethesda 2014) y Prueba de VPH (ASCCP 2019 / OMS)',
    shortTitle: 'PAP Alterado y VPH (ASCCP)',
    specialty: 'oncologia',
    secondarySpecialties: ['gineco-obstetricia', 'medicina-interna'],
    setting: 'consulta-externa',
    guidelineVersion: 'ASCCP Risk-Based Consensus 2019 · OMS 2021',
    summary:
      'Conducta diagnóstica inmediata ante citología cervical anormal según edad, prueba de VPH-AR y precauciones obligatorias en embarazo.',
    columns: [
      'Resultado PAP (Bethesda) + VPH',
      'Población / Riesgo NIC 3+',
      'Conducta clínica recomendada',
    ],
    rows: [
      [
        { text: 'NILM + VPH 16 o VPH 18 (+)', tone: 'high', emphasize: true },
        'Citología normal pero genotipo de máximo riesgo oncogénico',
        'COLPOSCOPIA inmediata (independiente de citología normal). En embarazo: colposcopia sin legrado endocervical (LEC).',
      ],
      [
        { text: 'NILM + Otros VPH-AR (+)', tone: 'moderate', emphasize: true },
        'Riesgo inmediato NIC 3+ < 4 % (en inmunocompetentes)',
        'Repetir cotest (VPH + PAP) en 12 meses; derivar a colposcopia si persiste VPH (+) o aparece citología ≥ ASC-US. (En VIH/inmunosupresión: umbral bajo para colposcopia).',
      ],
      [
        { text: 'ASC-US (con VPH-AR)', tone: 'moderate', emphasize: true },
        '≥ 25 años vs. < 25 años',
        '≥ 25 años: si VPH (-) -> control en 3 años; si VPH (+) -> Colposcopia (en embarazo puede diferirse a 6 sem posparto); si VPH desconocido -> solicitar VPH reflejo. En < 25 años: repetir citología en 12 meses (sin colposcopia inmediata).',
      ],
      [
        { text: 'LSIL (NIC 1 / efecto VPH)', tone: 'high', emphasize: true },
        '≥ 25 años vs. < 25 años',
        '< 25 años: repetir citología en 12 meses (alta regresión espontánea). ≥ 25 años: si VPH (-) en cotest -> repetir VPH/cotest en 1 año; si VPH (+) o desconocido -> Colposcopia (diferible al posparto si embarazada).',
      ],
      [
        { text: 'ASC-H (No se descarta HSIL)', tone: 'high', emphasize: true },
        'Riesgo significativo de NIC 2/3 oculta',
        'Colposcopia inmediata (si VPH positivo o desconocido). Solo si VPH (-) documentado sin historial de alto riesgo previo puede vigilarse con cotest/VPH a 1 año según ASCCP 2019.',
      ],
      [
        { text: 'HSIL (NIC 2 / NIC 3)', tone: 'critical', emphasize: true },
        'Alto riesgo inmediato de NIC 3+ (25–60 %)',
        '≥ 25 años no gestante: Colposcopia con biopsia O tratamiento escisional acelerado (LEEP) en casos seleccionados. < 25 años: colposcopia + biopsia (evitar see-and-treat). EMBARAZO: colposcopia sin LEC y diferir cono/LEEP al posparto salvo invasión.',
      ],
      [
        { text: 'AGC / AIS (Células glandulares atípicas)', tone: 'critical', emphasize: true },
        'Riesgo de adenocarcinoma endocervical, endometrial o NIC 2/3',
        'Colposcopia inmediata (sin importar VPH) + Legrado Endocervical (LEC) + Biopsia Endometrial si edad ≥ 35 años, sangrado anormal o células endometriales atípicas. En EMBARAZO: colposcopia únicamente (PROHIBIDO LEC y biopsia endometrial).',
      ],
    ],
    keyManagementPearls: [
      'Ante lesión cervical macroscópica exofítica, ulcerada o friable, realizar biopsia directa de la lesión y derivar a Ginecología Oncológica sin esperar resultado citológico (el PAP tiene falsos negativos por necrosis/sangre).',
      'En mujeres embarazadas está estrictamente CONTRAINDICADO el legrado endocervical (LEC); si se requiere escisión, solo se indica ante sospecha o confirmación de carcinoma microinvasor/invasor.',
    ],
    references: [
      {
        citation:
          'Perkins RB, Guido RS, Castle PE, et al. 2019 ASCCP Risk-Based Management Consensus Guidelines for Abnormal Cervical Cancer Screening Tests and Cancer Precursors. J Low Genit Tract Dis. 2020;24(2):102-131.',
        year: 2020,
      },
      {
        citation:
          'World Health Organization. WHO guideline for screening and treatment of cervical pre-cancer lesions for cervical cancer prevention, 2nd ed. 2021.',
        year: 2021,
      },
    ],
  },
  {
    id: 'gynecologic-oncology-figo-screening-table',
    title: 'Tamizaje Gineco-Oncológico, Sangrado Posmenopáusico y Estadificación FIGO Esencial',
    shortTitle: 'Gineco-Oncología: Tamizaje y FIGO',
    specialty: 'oncologia',
    secondarySpecialties: ['gineco-obstetricia', 'medicina-interna'],
    setting: 'consulta-externa',
    guidelineVersion: 'FIGO 2018 (Cérvix) · FIGO 2023 (Endometrio) · USPSTF / ACOG / ESGO',
    summary:
      'Criterios de sospecha y tamizaje en cáncer de mama, cérvix, endometrio y ovario, con umbrales ecográficos endometriales y esquema básico FIGO.',
    columns: [
      'Órgano / Escenario clínico',
      'Umbral diagnóstico / Tamizaje',
      'Evaluación y Estadificación FIGO esencial',
    ],
    rows: [
      [
        { text: 'Cáncer de Cérvix (Tamizaje y FIGO 2018)', tone: 'high', emphasize: true },
        'Tamizaje: Citología c/3 años (21–29 a) · VPH primario c/5 años o cotest c/5 años (30–65 a)',
        'FIGO I: confinado a cérvix (IA microscópico ≤ 5 mm profundidad; IB > 5 mm / visible) · FIGO II: rebasa útero sin pared pélvica ni 1/3 inf vagina · FIGO III: 1/3 inf vagina, pared pélvica, hidronefrosis o ganglios (IIIC1 pélvicos, IIIC2 paraaórticos) · FIGO IV: vejiga/recto o metástasis.',
      ],
      [
        { text: 'Sangrado Posmenopáusico y Endometrio', tone: 'critical', emphasize: true },
        'Eco transvaginal en sangrado posmenopáusico sin TRH: grosor endometrial ≤ 4 mm tiene VPN > 99 %; > 4 mm (o sangrado persistente/recurrente) -> BIOPSIA',
        'Biopsia endometrial ambulatoria (Pipelle) o histeroscopia + biopsia. En mujer posmenopáusica SIN sangrado, no realizar biopsia solo por endometrio incidental < 11 mm sin otros factores de riesgo (evaluar individualmente).',
      ],
      [
        { text: 'Masa Anexial / Cáncer de Ovario (FIGO)', tone: 'high', emphasize: true },
        'NO existe tamizaje efectivo poblacional en bajo riesgo (CA-125 + eco no reducen mortalidad)',
        'Ante masa sospechosa usar O-RADS US, RMI I (≥ 200) o ROMA. Estadificación quirúrgica/FIGO: I (limitado a ovarios/trompas), II (extensión pélvica), III (peritoneal extrapélvica o ganglios retroperitoneales), IV (derrame pleural positivo o metástasis parenquimatosas).',
      ],
      [
        { text: 'Cáncer de Mama (Tamizaje y Banderas Rojas)', tone: 'moderate', emphasize: true },
        'USPSTF 2024: mamografía bienal desde los 40 a 74 años (NCCN/ACR recomiendan anual desde 40 años; alto riesgo/BRCA inicia antes con RM)',
        'Toda masa palpable sólida nueva, retracción cutánea/pezón, piel de naranja o telorrea sanguinolenta unilateral requiere mamografía diagnóstica + ecografía + biopsia tru-cut aunque haya tenido tamizaje reciente negativo.',
      ],
    ],
    keyManagementPearls: [
      'Todo sangrado uterino posmenopáusico debe investigarse hasta descartar carcinoma endometrial; un grosor endometrial ≤ 4 mm en ecografía transvaginal adecuada permite conducta expectante solo si el episodio cede y no recurre.',
      'El cáncer de cuello uterino estadio IB3 (≥ 4 cm) a IVA se trata habitualmente con quimiorradioterapia concurrente (cisplatino) más braquiterapia, evitando histerectomía radical primaria con alta morbilidad añadida.',
    ],
    references: [
      {
        citation:
          'Bhatla N, Aoki D, Sharma DN, Sankaranarayanan R. Cancer of the cervix uteri: 2021 update (FIGO Cancer Report). Int J Gynaecol Obstet. 2021;155 Suppl 1:28-44.',
        year: 2021,
      },
      {
        citation:
          'ACOG Committee Opinion No. 734: The Role of Transvaginal Ultrasonography in Evaluating the Endometrium of Women With Postmenopausal Bleeding. Obstet Gynecol. 2018;131(5):e124-e129.',
        year: 2018,
      },
    ],
  },
  {
    id: 'oncologic-emergencies-table',
    title: 'Urgencias Oncológicas Críticas en Guardia (Neutropenia Febril, Lisis Tumoral, Compresión Medular, VCS e Hipercalcemia)',
    shortTitle: 'Urgencias Oncológicas en Guardia',
    specialty: 'oncologia',
    secondarySpecialties: ['urgencias', 'hematologia', 'medicina-interna'],
    setting: 'urgencias',
    guidelineVersion: 'ASCO / IDSA · NCCN · ESMO Oncologic Emergencies',
    summary:
      'Criterios diagnósticos y acciones terapéuticas inmediatas de las cinco principales emergencias oncológicas en Urgencias.',
    columns: [
      'Urgencia Oncológica',
      'Criterio diagnóstico en Urgencias',
      'Conducta inmediata y metas críticas',
    ],
    rows: [
      [
        { text: 'Neutropenia Febril', tone: 'critical', emphasize: true },
        'Fiebre ≥ 38.3 °C única (o ≥ 38.0 °C por ≥ 1 h) + RAN < 500 cél/µL (o < 1,000 con caída esperada < 500)',
        'Antibiótico IV antipseudomónico en ≤ 60 min (Cefepima 2 g c/8 h, Piperacilina-tazobactam 4.5 g c/6 h o Meropenem 1 g c/8 h) tras 2 hemocultivos. Aplicar Índice MASCC para estratificar riesgo.',
      ],
      [
        { text: 'Síndrome de Lisis Tumoral (Cairo-Bishop)', tone: 'critical', emphasize: true },
        '≥ 2 criterios de laboratorio (± 3 días antes a +7 d tras QT): Ác. úrico ≥ 8 mg/dL, K⁺ ≥ 6.0 mEq/L, Fósforo ≥ 4.5 mg/dL (≥ 6.5 en niños) o Calcio ≤ 7.0 mg/dL (o ↓ ≥ 25 %); SLT clínico si añade LRA, arritmia o convulsión',
        'Hidratación IV agresiva (2.5–3 L/m²/día, meta diuresis ≥ 100 mL/m²/h; SIN potasio ni calcio profiláctico). Alopurinol (profilaxis/bajo riesgo) o Rasburicasa (0.2 mg/kg IV dosis única si ácido úrico elevado / alto riesgo; descartar déficit G6PD). Tratar hiperpotasemia de inmediato.',
      ],
      [
        { text: 'Compresión Medular Maligna', tone: 'critical', emphasize: true },
        'Dolor dorsal/lumbar nuevo o progresivo en paciente con cáncer + debilidad de extremidades, nivel sensitivo o disfunción esfinteriana',
        'Dexametasona IV inmediata sin esperar imagen (carga estándar 10–16 mg IV seguida de 4 mg IV/VO c/6 h) + RM de columna COMPLETA urgente (< 24 h; inmediata si déficit motor progresivo) + interconsulta urgente a Radioterapia / Neurocirugía.',
      ],
      [
        { text: 'Síndrome de Vena Cava Superior (VCS)', tone: 'high', emphasize: true },
        'Edema facial/cuello/brazos, plétora facial, circulación colateral torácica; emergencia vital si estridor, edema laríngeo o edema cerebral',
        'Elevar cabecera 30–45°, O₂ si hipoxemia, TC torácica con contraste. Si obstrucción de vía aérea o edema cerebral (Grado 4): stent endovascular urgente + corticoides/radioterapia. En paciente estable SIN diagnóstico histológico previo: obtener biopsia antes de iniciar corticoides/QT si sospecha de linfoma.',
      ],
      [
        { text: 'Hipercalcemia Maligna (Ca²⁺ corregido > 12–14 mg/dL)', tone: 'high', emphasize: true },
        'Poliuria, deshidratación, somnolencia/confusión, estreñimiento, QT corto; frecuente en mieloma, mama, pulmón escamoso y renal',
        '1) Hidratación intensa con SS 0.9 % (200–300 mL/h inicial ajustado a volemia para lograr diuresis 100–150 mL/h; evitar furosemida salvo sobrecarga hídrica). 2) Bifosfonato IV (Ácido zoledrónico 4 mg IV en 15 min) o Denosumab (si LRA/refractaria). 3) Calcitonina (4 UI/kg c/12 h × 48 h) si grave/sintomática para descenso rápido.',
      ],
    ],
    keyManagementPearls: [
      'En neutropenia febril NO realizar tacto rectal ni colocar supositorios/enemas ni tomar temperatura rectal por riesgo de translocación bacteriana y sepsis por anaerobios/gramnegativos.',
      'En sospecha de linfoma mediastínico con síndrome de VCS estable (sin estridor ni compromiso neurológico), evitar administrar corticoides antes de la biopsia porque pueden lisar las células y hacer indistinguible el diagnóstico histológico.',
    ],
    references: [
      {
        citation:
          'Coiffier B, Altman A, Pui CH, Younes A, Cairo MS. Guidelines for the management of pediatric and adult tumor lysis syndrome: an evidence-based review. J Clin Oncol. 2008;26(16):2767-2778.',
        year: 2008,
      },
      {
        citation:
          'Lawton AJ, Lee KA, Cheville AL, et al. Assessment and Management of Patients With Metastatic Spinal Cord Compression: A Multidisciplinary Review. J Clin Oncol. 2019;37(1):61-71.',
        year: 2019,
      },
    ],
  },
  {
    id: 'hiv-diagnosis-cdc-staging-table',
    title: 'VIH/SIDA: Algoritmo Diagnóstico, Estadificación CDC/OMS y Paquete de Enfermedad Avanzada',
    shortTitle: 'VIH: Diagnóstico, Estadios CDC y EAV',
    specialty: 'infectologia',
    secondarySpecialties: ['medicina-interna', 'urgencias'],
    setting: 'ambos',
    guidelineVersion: 'CDC HIV Case Definition 2014 · CDC Diagnostic Algorithm · OMS AHD 2021–2024',
    summary:
      'Criterios de diagnóstico serológico/virológico, clasificación por CD4+ (Estadios 1–3), paquete obligatorio de Enfermedad Avanzada (CD4 < 200) y metas de carga viral (I=I).',
    columns: [
      'Etapa / Parámetro clínico',
      'Criterio objetivo de laboratorio / clínico',
      'Interpretación y conducta inicial',
    ],
    rows: [
      [
        { text: 'Tamizaje y Confirmación Diagnóstica (CDC)', tone: 'neutral', emphasize: true },
        '1) Inmunoensayo Ag/Ac de 4.ª generación (detecta Ac VIH-1/2 + Ag p24; ventana ~18–45 d). 2) Si reactivo: diferenciación Ac VIH-1/VIH-2. 3) Si negativo o indeterminado: ARN-VIH cuantitativo (PCR)',
        'Si síndrome retroviral agudo (fiebre, exantema, faringitis, adenopatías tras exposición en últimas 2–4 semanas) y 4.ª generación negativa: solicitar ARN-VIH directamente (carga viral suele ser muy alta > 100,000 copias/mL).',
      ],
      [
        { text: 'Estadio CDC 1 (≥ 6 años y adultos)', tone: 'normal', emphasize: true },
        'CD4 ≥ 500 cél/µL (o ≥ 26 % si falta recuento absoluto) y SIN condición definitoria de SIDA',
        'Iniciar TAR inmediato (mismo día o ≤ 7 días). Tamizaje de ITS, VHB, VHC, TB latente (IGRA/PPD) y vacunación (VHB, VPH, neumococo, influenza).',
      ],
      [
        { text: 'Estadio CDC 2 (≥ 6 años y adultos)', tone: 'moderate', emphasize: true },
        'CD4 200 – 499 cél/µL (o 14–25 % si falta absoluto) y SIN condición definitoria de SIDA',
        'Iniciar TAR inmediato. Evaluar adherencia, función renal/hepática, comorbilidades cardiovasculares y tamizaje cervical/anal según protocolo.',
      ],
      [
        { text: 'Estadio CDC 3 / SIDA y Enfermedad Avanzada (OMS)', tone: 'critical', emphasize: true },
        'CD4 < 200 cél/µL (o < 14 % si falta absoluto) O ≥ 1 condición definitoria de SIDA (PCP, TB extrapulmonar/diseminada, criptococosis extrapulmonar, toxoplasmosis cerebral, candidiasis esofágica, Kaposi, CMV visceral, LMP)',
        'Paquete OMS de Enfermedad Avanzada: 1) Tamizaje de TB (síntomas + LF-LAM urinario / Xpert MTB/RIF). 2) Antígeno criptocócico sérico (CrAg) si CD4 < 100–200. 3) Profilaxis TMP-SMX. 4) Inicio rápido de TAR salvo meningitis criptocócica o TB meníngea.',
      ],
      [
        { text: 'Metas de Carga Viral (ARN-VIH) y Criterio I=I', tone: 'low', emphasize: true },
        'Supresión virológica clínica: < 50 copias/mL (indetectable) · Criterio Indetectable = Intransmisible (I=I / U=U): < 200 copias/mL sostenido en TAR',
        'Control de carga viral a las 4–8 semanas de iniciar TAR, luego c/3–6 meses hasta supresión sostenida y posteriormente c/6 meses. Con ARN-VIH < 200 copias/mL sostenido y buena adherencia, el riesgo de transmisión sexual es CERO.',
      ],
    ],
    keyManagementPearls: [
      'En Nicaragua (MINSA/CNDR), una prueba rápida reactiva requiere algoritmo de confirmación nacional y toma de muestra basal de carga viral y CD4 remitida al CNDR sin retrasar la vinculación a TAR.',
      'La vacuna contra fiebre amarilla y otras vacunas de virus vivos atenuados (SRP/triple viral, varicela) están CONTRAINDICADAS cuando los CD4 son < 200 cél/µL (< 15 %).',
    ],
    references: [
      {
        citation:
          'Centers for Disease Control and Prevention (CDC). Revised Surveillance Case Definition for HIV Infection — United States, 2014. MMWR Recomm Rep. 2014;63(RR-03):1-10.',
        year: 2014,
      },
      {
        citation:
          'World Health Organization & Ministerio de Salud de Nicaragua (MINSA). Consolidated guidelines on HIV (WHO 2021) y Normativa de Atención Integral del VIH/SIDA (CNDR).',
        year: 2023,
      },
    ],
  },
  {
    id: 'hiv-art-regimens-interactions-table',
    title: 'Terapia Antirretroviral (TAR) de Primera Línea (MINSA TLD · DHHS), Embarazo e Interacciones',
    shortTitle: 'VIH: Esquemas TAR (TLD MINSA) e Interacciones',
    specialty: 'infectologia',
    secondarySpecialties: ['medicina-interna', 'gineco-obstetricia', 'urgencias'],
    setting: 'ambos',
    guidelineVersion: 'MINSA Nicaragua (TLD & Transmisión Vertical) · NIH/DHHS 2024 · WHO',
    summary:
      'Esquemas preferidos de inicio rápido (TLD MINSA: TDF/3TC/DTG y BIC/FTC/TAF), prevención materno-infantil MINSA, coinfección VHB/TB e interacciones críticas.',
    columns: [
      'Escenario clínico / Esquema',
      'Composición y Dosis estándar adulto',
      'Requisitos, ajustes y alertas críticas',
    ],
    rows: [
      [
        { text: '1.ª Línea Universal (MINSA Nicaragua TLD · OMS · DHHS)', tone: 'normal', emphasize: true },
        'TLD (Dosis Fija Combinada MINSA/OMS): TDF 300 mg + 3TC 300 mg + Dolutegravir (DTG) 50 mg VO 1 comp c/24 h · Alternativas DHHS: TDF/FTC + DTG o BIC 50 / FTC 200 / TAF 25 mg c/24 h',
        'Alta barrera genética a resistencia y excelente tolerancia. TLD (TDF/3TC/DTG) requiere ClCr ≥ 50–60 mL/min; BIC/FTC/TAF requiere ClCr ≥ 30 mL/min. Ambos tratan coinfección por VHB.',
      ],
      [
        { text: 'Régimen Dual (DTG / 3TC — Solo casos seleccionados)', tone: 'moderate', emphasize: true },
        'Dolutegravir 50 mg + Lamivudina 300 mg VO c/24 h (Dovato)',
        'NO usar en inicio rápido sin resultados basales. Requisitos obligatorios DHHS: ARN-VIH < 500,000 copias/mL, HBsAg NEGATIVO (no cubre VHB) y ausencia de resistencia conocida a 3TC/INSTI.',
      ],
      [
        { text: 'Coinfección VIH + Tuberculosis con Rifampicina', tone: 'high', emphasize: true },
        'TLD (TDF/3TC/DTG) c/24 h + 1 tableta adicional de Dolutegravir 50 mg a las 12 horas (= DTG 50 mg c/12 h) · Alternativa: TDF/FTC + EFV 600 mg/noche',
        'Rifampicina induce UGT1A1/CYP3A4: duplicar DTG a 50 mg c/12 h (hasta 2 sem tras fin de rifampicina). CONTRAINDICADO usar BIC/FTC/TAF estándar o inhibidores de proteasa potenciados con rifampicina.',
      ],
      [
        { text: 'Embarazo y Transmisión Materno-Infantil (MINSA Nicaragua / OMS)', tone: 'low', emphasize: true },
        'Tamizaje VIH desde 1.er control prenatal + inicio inmediato de TLD (TDF/3TC/DTG) independiente de CD4 (alternativas: RAL 400 mg c/12 h o DRV/r)',
        'Normativa MINSA Nicaragua: valorar cesárea electiva a las 38 SG si carga viral > 1,000 copias/mL o desconocida, SUSPENDER lactancia materna con provisión segura de fórmula infantil (sucedáneo) y dar profilaxis ARV neonatal (AZT ± 3TC ± NVP) desde las primeras horas de vida.',
      ],
      [
        { text: 'Interacciones Críticas en Urgencias / Consulta', tone: 'critical', emphasize: true },
        'Cationes polivalentes (Fe, Ca, Mg, Al, sucralfato) · Metformina · Estatinas/Corticoides inhalados con Ritonavir/Cobicistat',
        'Cationes (antiácidos, hierro, calcio) quelan DTG/BIC y anulan absorción: separar DTG 2 h antes o 6 h después (BIC 2 h antes/después con comida). Con DTG limitar metformina a ≤ 1,000 mg/día. Con Ritonavir/Cobicistat CONTRAINDICADAS simvastatina, lovastatina, fluticasona/budesonida inhalada (riesgo de síndrome de Cushing iatrogénico) y midazolam oral.',
      ],
    ],
    keyManagementPearls: [
      'Antes de prescribir Abacavir (ABC/3TC/DTG) es OBLIGATORIO disponer de prueba HLA-B*5701 negativa por riesgo de reacción de hipersensibilidad potencialmente mortal.',
      'El inicio rápido de TAR el mismo día está indicado en pacientes motivados sin síntomas meníngeos; ante cefalea, rigidez de nuca o fiebre alta en CD4 bajos, descartar primero meningitis criptocócica o tuberculosa.',
    ],
    references: [
      {
        citation:
          'Ministerio de Salud de Nicaragua (MINSA). Normativa de Atención Integral del VIH/SIDA y Prevención de la Transmisión Materno-Infantil de VIH y Sífilis (Esquema TLD). Managua: MINSA.',
        year: 2023,
      },
      {
        citation:
          'Panel on Antiretroviral Guidelines for Adults and Adolescents. Guidelines for the Use of Antiretroviral Agents in Adults and Adolescents with HIV (DHHS). 2024.',
        year: 2024,
      },
      {
        citation:
          'Liverpool HIV Drug Interactions Database & World Health Organization Consolidated HIV Guidelines. 2024.',
        year: 2024,
      },
    ],
  },
  {
    id: 'hiv-opportunistic-infections-table',
    title: 'Infecciones Oportunistas en VIH/SIDA: Diagnóstico, Tratamiento Agudo y Profilaxis por CD4',
    shortTitle: 'VIH: Infecciones Oportunistas (CD4)',
    specialty: 'infectologia',
    secondarySpecialties: ['urgencias', 'medicina-interna', 'neurologia'],
    setting: 'ambos',
    guidelineVersion: 'NIH / CDC / HIVMA-IDSA OI Guidelines 2024 · AMBITION-cm',
    summary:
      'Guía rápida por umbral de CD4 para el diagnóstico, tratamiento agudo de primera línea, uso exacto de corticoides y prevención de SIRI.',
    columns: [
      'Infección Oportunista y Umbral CD4',
      'Cuadro clínico y diagnóstico clave',
      'Tratamiento agudo y profilaxis secundaria/primaria',
    ],
    rows: [
      [
        { text: 'Neumonía por Pneumocystis jirovecii (PCP) · CD4 < 200', tone: 'high', emphasize: true },
        'Disnea subaguda progresiva, tos seca, fiebre, hipoxemia en esfuerzo, LDH elevada, infiltrados intersticiales bilaterales ("vidrio deslustrado")',
        '1.ª línea: TMP-SMX 15–20 mg/kg/día (componente TMP) IV/VO dividido c/6–8 h × 21 días. AÑADIR PREDNISONA (40 mg c/12 h × 5 d → 40 mg/d × 5 d → 20 mg/d × 11 d) si PaO₂ < 70 mmHg o gradiente A-a ≥ 35 mmHg. Profilaxis primaria (< 200): TMP-SMX 160/800 mg VO/día.',
      ],
      [
        { text: 'Toxoplasmosis Cerebral · CD4 < 100', tone: 'critical', emphasize: true },
        'Cefalea, focalidad neurológica, convulsiones, fiebre; RM/TC con múltiples lesiones en anillo en ganglios basales/unión corticosubcortical + IgG Toxoplasma (+)',
        '1.ª línea: Pirimetamina (carga 200 mg → 50–75 mg/d) + Sulfadiazina (1,000–1,500 mg c/6 h) + Ácido folínico (leucovorina 10–25 mg/d) × ≥ 6 sem (alternativa equivalente en muchos centros: TMP-SMX 5 mg/kg TMP IV/VO c/12 h). Corticoides SOLO si efecto de masa/edema grave.',
      ],
      [
        { text: 'Meningitis Criptocócica · CD4 < 100', tone: 'critical', emphasize: true },
        'Cefalea subaguda intensa, fiebre, parálisis de VI par, alteración visual; LCR con presión de apertura > 20–25 cmH₂O, CrAg (+) en suero/LCR y tinta china',
        'Inducción AMBITION/OMS: Anfotericina B liposomal 10 mg/kg IV dosis única + Flucitosina 100 mg/kg/d + Fluconazol 1,200 mg/d × 14 días (luego consolidación Fluconazol 800 mg/d × 8 sem → 200 mg/d). Punciones lumbares evacuadoras diarias si PIC ≥ 25 cmH₂O. DIFERIR TAR 4–6 SEMANAS (evitar SIRI mortal).',
      ],
      [
        { text: 'Tuberculosis (Pulmonar / Extrapulmonar / Meníngea) · Cualquier CD4', tone: 'high', emphasize: true },
        'Tos ≥ 2 sem, fiebre vespertina, pérdida de peso, adenopatías; baciloscopia/GeneXpert MTB/RIF, LF-LAM urinario en CD4 < 100–200',
        'Esquema estándar HRZE (2 m HRZE + 4 m HR; 9–12 m si SNC/ósea). Si TB NO meníngea y CD4 < 50: TAR en ≤ 2 sem (si CD4 ≥ 50: 2–8 sem). Si MENINGITIS TB: Dexametasona inmediata + DIFERIR TAR 4–8 semanas. Duplicar DTG (50 mg c/12 h) con rifampicina.',
      ],
      [
        { text: 'Complejo Mycobacterium avium (MAC) y CMV · CD4 < 50', tone: 'high', emphasize: true },
        'MAC: fiebre persistente, sudoración, diarrea, anemia, fosfatasa alcalina ↑, hemocultivo micobacteriano (+). CMV: retinitis ("pizza con queso y kétchup"), esofagitis/colitis con úlceras',
        'MAC tratamiento: Claritromicina 500 mg c/12 h (o Azitromicina 500–600 mg/d) + Etambutol 15 mg/kg/d (± Rifabutina). Profilaxis primaria MAC ya NO rutinaria si inicia TAR inmediato. CMV retinitis: Valganciclovir 900 mg VO c/12 h (o Ganciclovir IV 5 mg/kg c/12 h) × 14–21 días + TAR en 1–2 sem.',
      ],
    ],
    keyManagementPearls: [
      'Ante lesión focal cerebral en paciente con VIH y CD4 < 100 e IgG Toxoplasma (+), si no hay efecto de masa crítico ni sospecha inmediata de absceso bacteriano, suele iniciarse prueba terapéutica anti-Toxoplasma durante 10–14 días con control clínico/imagenológico antes de biopsia cerebral (diagnóstico diferencial principal: linfoma primario del SNC).',
      'En meningitis criptocócica NO usar dexametasona ni manitol de rutina: el control de la hipertensión intracraneal se realiza mediante drenaje mecánico de LCR (punción lumbar evacuadora diaria hasta estabilizar presión < 20 cmH₂O).',
    ],
    references: [
      {
        citation:
          'Panel on Opportunistic Infections in Adults and Adolescents with HIV. Guidelines for the Prevention and Treatment of Opportunistic Infections in Adults and Adolescents with HIV (NIH/CDC/IDSA). 2024.',
        year: 2024,
      },
      {
        citation:
          'Jarvis JN, Lawrence DS, Meya DB, et al. Single-Dose Liposomal Amphotericin B Treatment for Cryptococcal Meningitis (AMBITION-cm). N Engl J Med. 2022;386(12):1109-1120.',
        year: 2022,
      },
    ],
  },
  {
    id: 'hiv-pep-prep-prevention-table',
    title: 'Prevención de VIH: PEP / PPE (Post-Exposición ≤ 72 h MINSA), PrEP y Control Ocupacional/Sexual',
    shortTitle: 'VIH: PEP/PPE ≤ 72 h y PrEP (MINSA)',
    specialty: 'infectologia',
    secondarySpecialties: ['urgencias', 'medicina-interna', 'gineco-obstetricia'],
    setting: 'ambos',
    guidelineVersion: 'MINSA Nicaragua PPE · CDC PEP 2025 · CDC PrEP 2021 · OMS',
    summary:
      'Criterios de urgencia en exposiciones biológicas o violencia sexual, esquema completo de PPE/PEP (28 días con TDF/3TC o TDF/FTC + DTG), seguimiento MINSA (6 sem, 3 m y 6 m) y PrEP.',
    columns: [
      'Estrategia preventiva',
      'Criterios e indicaciones exactas',
      'Esquema farmacológico y seguimiento',
    ],
    rows: [
      [
        { text: 'PEP / PPE — Profilaxis Post-Exposición (URGENCIA ≤ 72 h)', tone: 'critical', emphasize: true },
        'Exposición percutánea/mucosa con sangre/semen/secreciones vaginales/LCR de fuente VIH+ detectable o desconocida de alto riesgo, dentro de las ≤ 72 horas (óptimo ≤ 2 h)',
        'Iniciar inmediatamente 3 fármacos × 28 DÍAS: TDF/3TC 300/300 mg (o TDF/FTC 300/200 mg) VO c/24 h + Dolutegravir 50 mg VO c/24 h (alternativas: BIC/FTC/TAF c/24 h o TDF/FTC + RAL 400 mg c/12 h). Si ClCr < 60: evitar TDF (usar TAF/FTC + DTG).',
      ],
      [
        { text: 'Exposición SIN riesgo / Criterio I=I', tone: 'normal', emphasize: true },
        'Piel íntegra, saliva sin sangre, orina/heces sin sangre, lágrimas; O exposición sexual exclusiva con fuente VIH+ en TAR y carga viral < 200 copias/mL confirmada',
        'NO requiere PEP por riesgo nulo de transmisión sexual (Indetectable = Intransmisible). Si existe duda sobre adherencia de la fuente, violencia sexual o exposición laboral punzocortante, valorar PPE por precaución.',
      ],
      [
        { text: 'Seguimiento Post-Exposición (MINSA / CDC) y Otras Infecciones', tone: 'moderate', emphasize: true },
        'Todo paciente evaluado por accidente biológico o exposición sexual de riesgo',
        'Basal: prueba rápida / 4.ª gen VIH, HBsAg/anti-HBs, VHC, sífilis, creatinina/PFH, test embarazo. Control serológico VIH MINSA: 6 semanas, 3 meses y 6 meses post-exposición. En accidente laboral sin inmunidad VHB: vacuna + HBIG.',
      ],
      [
        { text: 'PrEP Oral Diaria / A Demanda (2-1-1) / Inyectable', tone: 'low', emphasize: true },
        'Personas VIH negativas (4.ª generación negativa reciente sin síntomas agudos) con riesgo sexual o uso de drogas inyectables',
        'Oral diaria: TDF/FTC 300/200 mg VO/día (ClCr ≥ 60) o TAF/FTC 25/200 mg/día (ClCr ≥ 30, solo HSH/trans). Esquema 2-1-1 (solo HSH sexo anal sin VHB): 2 comp 2–24 h antes → 1 a las 24 h → 1 a las 48 h. Control VIH c/3 meses.',
      ],
    ],
    keyManagementPearls: [
      'En Urgencias y en kits de atención por violencia sexual (MINSA), la primera dosis de PPE NO debe retrasarse esperando resultados de laboratorio: administrar dentro de las primeras horas (ideal < 2 h).',
      'Nunca prescribir PrEP (2 fármacos) si existe sospecha clínica de infección aguda por VIH (síndrome mononucleósido tras exposición reciente) o prueba positiva/indeterminada.',
    ],
    references: [
      {
        citation:
          'Ministerio de Salud de Nicaragua (MINSA). Normativa de Atención Integral del VIH/SIDA y Profilaxis Post-Exposición (PPE). Managua: MINSA.',
        year: 2023,
      },
      {
        citation:
          'Centers for Disease Control and Prevention (CDC). Antiretroviral Postexposure Prophylaxis Guidelines (oPEP/nPEP) & Preexposure Prophylaxis for HIV Prevention.',
        year: 2025,
      },
      {
        citation:
          'World Health Organization. Consolidated HIV Prevention, Testing and Treatment Guidelines.',
        year: 2022,
      },
    ],
  },
  {
    id: 'minsa-nicaragua-immunization-table',
    title: 'Esquema Nacional de Vacunación MINSA Nicaragua (PAI — Norma Técnica 121) y Profilaxis Tétanos / Rabia',
    shortTitle: 'Vacunas MINSA Nicaragua + Tétanos/Rabia',
    specialty: 'infectologia',
    secondarySpecialties: ['pediatria', 'medicina-interna', 'gineco-obstetricia', 'urgencias'],
    setting: 'ambos',
    guidelineVersion: 'Norma Técnica de Inmunizaciones (Norma 121) PAI MINSA Nicaragua · OMS',
    summary:
      'Calendario oficial por edad y grupo de riesgo en Nicaragua (BCG, Hep B, Pentavalente, Neumococo 13v/23v, Rotavirus, fIPV/bOPV, SRP/MMR, DPT, VPH, dT e Influenza) junto con conducta antitetánica y antirrábica en urgencias.',
    columns: [
      'Edad o grupo objetivo',
      'Biológicos / Vacunas del esquema',
      'Vía, dosis y reglas críticas de seguridad',
    ],
    rows: [
      [
        { text: 'Recién nacido (< 24 h)', tone: 'high', emphasize: true },
        'BCG (dosis única) + Hepatitis B pediátrica (dosis al nacer)',
        'BCG: intradérmica deltoides izquierdo (SOLO si peso ≥ 2,000 g; si < 2,000 g diferir hasta alcanzar 2 kg). Hep B: 0.5 mL IM muslo derecho en primeras 24 h.',
      ],
      [
        { text: '2, 4 y 6 meses (Esquema primario)', tone: 'neutral', emphasize: true },
        '2 m: Pentavalente 1 + Neumococo 13v 1 + Polio (fIPV/IPV) 1 + Rotavirus 1. 4 m: 2.ª dosis de cada una. 6 m: Pentavalente 3 + Neumococo 13v 3 + bOPV 3 (+ Influenza 6–23 m)',
        'Pentavalente y Neumococo: 0.5 mL IM profunda en muslos separados. bOPV: 2 gotas VO. LÍMITE ROTAVIRUS: 1.ª dosis ≤ 15 semanas; última dosis antes de cumplir 8 meses (7 m 29 d).',
      ],
      [
        { text: '12 y 18 meses · 6 años (Refuerzos)', tone: 'moderate', emphasize: true },
        '12 m: SRP/MMR 1 + Neumococo 13v refuerzo. 18 m: DPT 1.er refuerzo + bOPV refuerzo + SRP/MMR 2.ª dosis. 6 años: DPT 2.º refuerzo escolar',
        'SRP: 0.5 mL SC brazo (virus vivos: contraindicada en inmunosupresión grave). DPT: 0.5 mL IM (no aplicar DPT en ≥ 7 años; usar dT).',
      ],
      [
        { text: '9 – 14 años · Embarazadas · Adultos ≥ 50 años', tone: 'low', emphasize: true },
        '9–14 años: VPH (2 dosis, intervalo 6 meses) + dT a los 10 años. Embarazadas: dT (esquema según antecedente) + Influenza estacional. Adulto ≥ 50 años/crónico: Neumococo 23v + Influenza anual + dT',
        'Sin esquema previo de dT en adulto/embarazada: 5 dosis MINSA (0, 1 mes, 6 meses, 1 año, 1 año). SRP contraindicada en embarazo.',
      ],
      [
        { text: 'Heridas (Tétanos) y Mordeduras (Rabia) en Urgencias', tone: 'critical', emphasize: true },
        'Herida sucia con < 3 dosis o desconocido: dT + TIG 250 UI IM. Mordedura Categoría III (transdérmica/mucosa/murciélago): Vacuna antirrábica + RIG',
        'Toda mordedura exige lavado inmediato ≥ 15 min con agua y jabón. Inmunoglobulinas (TIG o RIG) SIEMPRE en sitio anatómico distinto a la vacuna.',
      ],
    ],
    keyManagementPearls: [
      'El peso mínimo de 2,000 g aplica estrictamente para BCG; un prematuro estable < 2,000 g debe recibir su dosis de Hepatitis B dentro de las primeras 24 horas y la BCG al alcanzar los 2,000 g.',
      'La fiebre leve, infección respiratoria alta sin gravedad o tratamiento antibiótico NO contraindican posponer las vacunas del esquema PAI.',
    ],
    references: [
      {
        citation:
          'Ministerio de Salud de Nicaragua (MINSA). Norma Técnica de Inmunizaciones (Norma 121) y Esquema Nacional de Vacunación PAI. Managua: MINSA.',
        year: 2023,
      },
      {
        citation:
          'World Health Organization (WHO). Rabies & Tetanus vaccines: WHO position papers. Weekly Epidemiological Record.',
        year: 2018,
      },
    ],
  },
  {
    id: 'pediatric-broselow-pals-table',
    title: 'Reanimación Pediátrica Tipo Cinta de Broselow (Zonas de Color, Vía Aérea, Desfibrilación y Fármacos PALS)',
    shortTitle: 'Broselow: Vía Aérea y Dosis PALS',
    specialty: 'pediatria',
    secondarySpecialties: ['urgencias', 'cirugia-general'],
    setting: 'urgencias',
    guidelineVersion: 'Sistema Broselow-Luten · AHA PALS 2020',
    summary:
      'Referencia inmediata por talla (46–146 cm) y franja de color con calibre de tubo endotraqueal (con y sin balón), profundidad, laringoscopio, energía de desfibrilación y adrenalina IV/IO.',
    columns: [
      'Color Broselow · Talla y Peso',
      'Vía aérea (TET con/sin balón · Prof. · Hoja)',
      'Desfibrilación (2 → 4 J/kg) y Adrenalina 1:10,000 (0.1 mL/kg)',
    ],
    rows: [
      [
        { text: 'Gris · 46–59 cm (3–5 kg · ref. 4 kg)', tone: 'high', emphasize: true },
        'TET con balón 3.0 / sin balón 3.0–3.5 mm · Prof. 9–10 cm · Miller 0',
        'Desfib: 8 → 16 J · Adrenalina 1:10,000: 0.4 mL (0.04 mg) · Bolo SSN: 80 mL',
      ],
      [
        { text: 'Rosa · 60–65 cm (6–7 kg · ref. 6.5 kg)', tone: 'high', emphasize: true },
        'TET con balón 3.0 / sin balón 3.5 mm · Prof. 10.5–11 cm · Miller 1',
        'Desfib: 13 → 26 J · Adrenalina 1:10,000: 0.65 mL (0.065 mg) · Bolo SSN: 130 mL',
      ],
      [
        { text: 'Rojo · 66–73 cm (8–9 kg · ref. 8.5 kg)', tone: 'critical', emphasize: true },
        'TET con balón 3.5 / sin balón 3.5–4.0 mm · Prof. 11.5–12 cm · Miller 1 / Mac 1',
        'Desfib: 17 → 34 J · Adrenalina 1:10,000: 0.85 mL (0.085 mg) · Bolo SSN: 170 mL',
      ],
      [
        { text: 'Morado · 74–82 cm (10–11 kg · ref. 10.5 kg)', tone: 'moderate', emphasize: true },
        'TET con balón 3.5 / sin balón 4.0 mm · Prof. 12.5–13 cm · Miller 1 / Mac 2',
        'Desfib: 21 → 42 J · Adrenalina 1:10,000: 1.05 mL (0.105 mg) · Bolo SSN: 210 mL',
      ],
      [
        { text: 'Amarillo · 83–93 cm (12–14 kg · ref. 13 kg)', tone: 'moderate', emphasize: true },
        'TET con balón 4.0 / sin balón 4.5 mm · Prof. 13.5–14 cm · Mac 2 / Miller 2',
        'Desfib: 26 → 52 J · Adrenalina 1:10,000: 1.3 mL (0.13 mg) · Bolo SSN: 260 mL',
      ],
      [
        { text: 'Blanco · 94–107 cm (15–18 kg · ref. 16.5 kg)', tone: 'neutral', emphasize: true },
        'TET con balón 4.5 / sin balón 5.0 mm · Prof. 14.5–15 cm · Mac 2 / Miller 2',
        'Desfib: 33 → 66 J · Adrenalina 1:10,000: 1.65 mL (0.165 mg) · Bolo SSN: 330 mL',
      ],
      [
        { text: 'Azul · 108–118 cm (19–23 kg · ref. 21 kg)', tone: 'neutral', emphasize: true },
        'TET con balón 5.0 / sin balón 5.5 mm · Prof. 16–16.5 cm · Mac 2–3',
        'Desfib: 42 → 84 J · Adrenalina 1:10,000: 2.1 mL (0.21 mg) · Bolo SSN: 420 mL',
      ],
      [
        { text: 'Naranja · 119–132 cm (24–29 kg · ref. 26.5 kg)', tone: 'low', emphasize: true },
        'TET con balón 5.5 / sin balón 6.0 mm · Prof. 17–18 cm · Mac 2–3',
        'Desfib: 53 → 106 J · Adrenalina 1:10,000: 2.65 mL (0.265 mg) · Bolo SSN: 530 mL',
      ],
      [
        { text: 'Verde · 133–146 cm (30–36 kg · ref. 33 kg)', tone: 'low', emphasize: true },
        'TET con balón 6.0 / sin balón 6.5 mm · Prof. 19 cm · Mac 3',
        'Desfib: 66 → 132 J · Adrenalina 1:10,000: 3.3 mL (0.33 mg) · Bolo SSN: 660 mL',
      ],
    ],
    keyManagementPearls: [
      'Reglas rápidas PALS: Adrenalina paro IV/IO = 0.01 mg/kg (0.1 mL/kg de 1:10,000, máx 1 mg); Amiodarona = 5 mg/kg (máx 300 mg); Adenosina = 0.1 mg/kg (máx 6 mg) y 2.ª dosis 0.2 mg/kg (máx 12 mg).',
      'En niños > 36 kg o > 146 cm emplear dosificación de adulto con topes máximos.',
    ],
    references: [
      {
        citation:
          'Topjian AA, Raymond TT, Atkins D, et al. Pediatric Basic and Advanced Life Support: 2020 AHA Guidelines. Circulation. 2020;142(16_suppl_2):S469-S523.',
        year: 2020,
      },
      {
        citation:
          'Luten RC, Wears RL, Broselow J, et al. Length-based endotracheal tube and emergency equipment in pediatrics. Ann Emerg Med. 1992;21(8):900-904.',
        year: 1992,
      },
    ],
  },
  {
    id: 'neonatal-hyperbilirubinemia-aap2022-table',
    title: 'Hiperbilirrubinemia Neonatal (≥ 35 semanas): Fototerapia, Escalada y Exanguinotransfusión (AAP 2022)',
    shortTitle: 'Neonatología: Fototerapia y Exanguino (AAP 2022)',
    specialty: 'pediatria',
    secondarySpecialties: ['gineco-obstetricia', 'urgencias'],
    setting: 'ambos',
    guidelineVersion: 'AAP Clinical Practice Guideline Revision (Kemper et al., Pediatrics 2022)',
    summary:
      'Puntos de corte horarios de BST (mg/dL) para fototerapia, Zona de Escalada de Cuidados (≤ 2 mg/dL bajo exanguino), exanguinotransfusión y relación Bilirrubina/Albúmina.',
    columns: [
      'Perfil clínico / Edad gestacional',
      'Fototerapia BST (24 h / 48 h / 72 h / 96 h)',
      'Exanguinotransfusión, Escalada y Relación B/A',
    ],
    rows: [
      [
        { text: '≥ 38–40 sem SIN factores de riesgo de neurotoxicidad', tone: 'low', emphasize: true },
        '38 sem: 12.3 / 16.0 / 18.8 / 20.7 mg/dL · 40 sem: 13.3 / 17.0 / 19.8 / 21.8 mg/dL',
        'Exanguino ≥ 38 sem (sin FR): 21.4 / 24.0 / 25.9 / 27.0 mg/dL. Relación B/A corte ≥ 8.0.',
      ],
      [
        { text: '35 – 37 sem SIN factores adicionales de neurotoxicidad', tone: 'moderate', emphasize: true },
        '35 sem: 10.6 / 14.2 / 16.8 / 18.6 mg/dL · 36 sem: 11.2 / 14.8 / 17.5 / 19.3 · 37 sem: 11.7 / 15.4 / 18.1 / 20.0 mg/dL',
        'Exanguino (sin FR): 35 sem 17.9 / 20.7 / 22.9 / 24.5 · 36 sem 19.1 / 21.9 / 24.1 / 25.5 · 37 sem 20.3 / 23.1 / 25.2 / 26.6 mg/dL. Corte B/A ≥ 7.2.',
      ],
      [
        { text: '≥ 38 sem CON factores de riesgo de neurotoxicidad', tone: 'high', emphasize: true },
        '38–40 sem: 10.5 / 14.0 / 16.6 / 18.2 mg/dL',
        'FR: hemólisis isoinmune (Coombs+), G6PD, sepsis, inestabilidad < 24 h o albúmina < 3.0 g/dL. Exanguino ≥ 38 sem (con FR): 17.7 / 20.1 / 22.1 / 23.5 mg/dL. Corte B/A ≥ 7.2.',
      ],
      [
        { text: '35 – 37 sem CON factores de riesgo de neurotoxicidad', tone: 'critical', emphasize: true },
        '35 sem: 8.9 / 12.2 / 14.6 / 16.1 mg/dL · 36 sem: 9.4 / 12.8 / 15.4 / 16.9 · 37 sem: 10.0 / 13.5 / 16.1 / 17.6 mg/dL',
        'Exanguino (con FR): 35 sem 16.1 / 18.5 / 20.1 / 21.1 · 36 sem 16.6 / 19.1 / 20.9 / 22.1 · 37 sem 17.2 / 19.7 / 21.7 / 23.1 mg/dL. Corte B/A ≥ 6.8.',
      ],
      [
        { text: 'Escalada de Cuidados, EBA y Suspensión', tone: 'critical', emphasize: true },
        'Suspender fototerapia cuando BST descienda ≥ 2.0 mg/dL por debajo del umbral con el que se inició',
        'ESCALADA: BST dentro de 2 mg/dL bajo el umbral de exanguino → UCIN + fototerapia intensiva múltiple + hidratación IV + pruebas cruzadas. Signos de EBA → EXANGUINOTRANSFUSIÓN INMEDIATA.',
      ],
    ],
    keyManagementPearls: [
      'Usar SIEMPRE Bilirrubina Sérica Total (BST): nunca restar la bilirrubina directa/conjugada al tomar decisiones en las curvas AAP 2022.',
      'Toda ictericia visible en las primeras 24 horas de vida es patológica hasta demostrar lo contrario y exige descartar incompatibilidad ABO/Rh, déficit G6PD y sepsis.',
    ],
    references: [
      {
        citation:
          'Kemper AR, Newman TB, Slaughter JL, et al. Clinical Practice Guideline Revision: Management of Hyperbilirubinemia in the Newborn Infant 35 or More Weeks of Gestation. Pediatrics. 2022;150(3):e2022058859.',
        year: 2022,
      },
    ],
  },
  {
    id: 'daily-pharmacology-converters-table',
    title: 'Conversores Farmacológicos Diarios: Corticosteroides Sistémicos y Rotación de Opioides (MME CDC)',
    shortTitle: 'Conversores: Corticoides y Opioides (MME)',
    specialty: 'medicina-interna',
    secondarySpecialties: ['urgencias', 'oncologia', 'geriatria', 'cirugia-general'],
    setting: 'ambos',
    guidelineVersion: 'CDC Clinical Practice Guideline for Opioids 2022 · Tablas Glucocorticoides',
    summary:
      'Equipotencia antiinflamatoria, actividad mineralocorticoide y vida media de corticoides sistémicos, más factores MME CDC y regla de seguridad en rotación opioide.',
    columns: [
      'Fármaco y grupo',
      'Equivalencia / Factor MME estándar',
      'Seguridad clínica y notas clave de prescripción',
    ],
    rows: [
      [
        { text: 'Corticoides: Hidrocortisona · Prednisona / Prednisolona', tone: 'neutral', emphasize: true },
        'Hidrocortisona 20 mg (Gluco 1× · Mineralo 1.0 · 8–12 h) ≡ Prednisona/Prednisolona 5 mg (Gluco 4× · Mineralo 0.8 · 12–36 h)',
        'Hidrocortisona es de elección en insuficiencia suprarrenal primaria y choque séptico refractario por su efecto mineralocorticoide.',
      ],
      [
        { text: 'Corticoides: Metilprednisolona · Dexametasona · Betametasona', tone: 'moderate', emphasize: true },
        'Metilprednisolona 4 mg (Gluco 5× · Mineralo 0.5 · 12–36 h) ≡ Dexametasona 0.75 mg (Gluco 25× · Mineralo 0 · 36–72 h) ≡ Betametasona 0.6 mg',
        'Dexametasona carece de efecto mineralocorticoide (preferida en edema cerebral, compresión medular y COVID-19/meningitis). Evitar suspensión brusca si > 2–3 sem.',
      ],
      [
        { text: 'Opioides VO: Morfina · Tramadol · Codeína · Oxicodona · Hidromorfona', tone: 'high', emphasize: true },
        'Morfina VO: 1.0 · Tramadol VO: 0.2 · Codeína VO: 0.15 · Hidrocodona VO: 1.0 · Oxicodona VO: 1.5 · Hidromorfona VO: 5.0 · Morfina IV/SC: 3.0',
        'MME/día = Dosis diaria × Factor MME. Tramadol máx 400 mg/día. Alerta CDC: ≥ 50 MME/día duplica riesgo de sobredosis; ≥ 90 MME/día riesgo muy alto.',
      ],
      [
        { text: 'Rotación segura (Tolerancia cruzada incompleta) y Fentanilo TD', tone: 'critical', emphasize: true },
        'Reducir 25 % – 50 % la dosis equianalgésica teórica del opioide destino (50 % en ancianos/ERC/fragilidad)',
        'Parche Fentanilo 25 mcg/h ≈ 60–90 MME/día (EXCLUSIVO en pacientes ya tolerantes). NUNCA usar factores MME simples para convertir a Metadona.',
      ],
    ],
    keyManagementPearls: [
      'En enfermedad renal crónica (TFG < 30 mL/min) evitar morfina, codeína y tramadol por acumulación de metabolitos neurotóxicos (M3G/M6G); preferir fentanilo o buprenorfina con titulación cautelosa.',
    ],
    references: [
      {
        citation:
          'Dowell D, Ragan KR, Jones CM, Baldwin GT, Chou R. CDC Clinical Practice Guideline for Prescribing Opioids for Pain — United States, 2022. MMWR Recomm Rep. 2022;71(3):1-95.',
        year: 2022,
      },
      {
        citation:
          'Liu D, Ahmet A, Ward L, et al. A practical guide to the monitoring and management of the complications of systemic corticosteroid therapy. Allergy Asthma Clin Immunol. 2013;9(1):30.',
        year: 2013,
      },
    ],
  },
  {
    id: 'tuberculosis-oms-cdc-reference-table',
    title: 'Tuberculosis (MINSA Nicaragua · Normativa 054): SR, BAAR ×3, GeneXpert, 2HRZE/4HR, TAES y TPI',
    shortTitle: 'Tuberculosis (MINSA Nicaragua · Normativa 054)',
    specialty: 'infectologia',
    secondarySpecialties: ['neumologia', 'medicina-interna', 'pediatria', 'urgencias'],
    setting: 'ambos',
    guidelineVersion: 'Normativa 054 MINSA Nicaragua · Actualizaciones CNDR / OPS-OMS 2022–2024',
    summary:
      'Referencia clínica rápida offline alineada al Programa Nacional de Control de la Tuberculosis (MINSA Nicaragua): captación de Sintomático Respiratorio (SR), seriado BAAR ×3, GeneXpert CNDR, bandas DFC 2HRZE/4HR bajo TAES, control de focos (< 72 h) y quimioprofilaxis/TPI.',
    columns: [
      'Componente / Escenario MINSA',
      'Criterios, muestras o bandas de peso',
      'Conducta y notas clave de seguridad',
    ],
    rows: [
      [
        { text: 'Captación de SR y Diagnóstico (BAAR ×3 · GeneXpert CNDR)', tone: 'moderate', emphasize: true },
        'SR: tos con flema ≥ 15 días (cualquier tos si PVVIH) · Seriado BAAR ×3: 1.ª al momento de consulta, 2.ª en ayunas al día siguiente, 3.ª al entregar la 2.ª · GeneXpert MTB/RIF prioritario (PVVIH, antes tratados, recaídas, privados de libertad, personal de salud, contactos TB-DR, LCR/pediatría)',
        'LF-LAM en orina si PVVIH con CD4 ≤ 200 o gravedad. Un BAAR negativo NO descarta TB en niños (paucibacilar), PVVIH ni formas extrapulmonares. Mascarilla quirúrgica al SR y N95 para el personal.',
      ],
      [
        { text: 'Control de Focos (< 72 h), PPD / IGRA y Quimioprofilaxis (TPI)', tone: 'low', emphasize: true },
        'Control de focos obligatorio en < 72 horas · PPD (48–72 h, medir induración): ≥ 5 mm (PVVIH, contacto reciente, inmunosupresión), ≥ 10 mm (personal de salud, < 4–5 a, DM, ERC, área endémica), ≥ 15 mm (sin FR) · TPI MINSA: Isoniacida diaria × 6 meses (10 mg/kg en niños, 5 mg/kg adulto; máx 300 mg)',
        'Población prioritaria TPI: contactos < 5 años de caso bacilífero y PVVIH. NUNCA iniciar TPI/TPT (o esquemas acortados 3HP/3HR) sin descartar TB activa por clínica y Rx de tórax. Preferir IGRA si vacunado con BCG.',
      ],
      [
        { text: 'Esquema Primario Adulto (≥ 30 kg): 2HRZE / 4HR con DFC y TAES', tone: 'high', emphasize: true },
        'Fase intensiva 2HRZE (RHZE 150/75/400/275 mg) → Fase continuación 4HR (RH 150/75 mg): 30–37 kg: 2 tab · 38–54 kg: 3 tab · 55–70 kg: 4 tab · > 70 kg: 5 tab',
        'Administración estricta bajo estrategia TAES (observación directa). Validar modalidad del PNCT en fase de continuación (diaria con DFC o intermitente supervisada). Piridoxina (B6) 25–50 mg/d si PVVIH, embarazo, DM, desnutrición, ERC o alcohol.',
      ],
      [
        { text: 'Pediatría (< 25 kg): DFC Dispersable HRZ + Etambutol', tone: 'high', emphasize: true },
        'HRZ (50/75/150 mg) + E 100 mg (2 m) → HR (50/75 mg) (4 m; o 2 m en TB no grave 3 m–16 a): 2–2.9 kg: ½ tab · 3–3.9 kg: ¾ tab · 4–7.9 kg: 1 tab · 8–11.9 kg: 2 tab · 12–15.9 kg: 3 tab · 16–24.9 kg: 4 tab',
        'Metas mg/kg/día: H 10 (7–15), R 15 (10–20), Z 35 (30–40), E 20 (15–25). En ≥ 25 kg pasar a esquemas de adulto. Control mensual de peso y ajuste inmediato de banda.',
      ],
      [
        { text: 'TB Drogarresistente (RR / MDR-TB): BPaLM / Manejo CNDR', tone: 'critical', emphasize: true },
        'Resistencia a Rifampicina en GeneXpert → notificación inmediata al PNCT/CNDR y prueba rápida a fluoroquinolonas (LPA / Xpert XDR) · Esquema oral OMS BPaLM 6 meses (Bedaquilina + Pretomanid + Linezolid + Moxifloxacino; BPaL si resistencia a FQ)',
        'EXCLUSIÓN CRÍTICA: BPaLM/BPaL NO está aprobado en meningoencefalitis TB (SNC), TB osteoarticular ni miliar diseminada (requiere régimen individualizado con penetración en LCR). Aislamiento aéreo estricto.',
      ],
      [
        { text: 'Meningoencefalitis TB, Coinfección VIH-TB y Seguimiento', tone: 'critical', emphasize: true },
        'Meningitis TB / SNC: 2HRZE + 7–10HR (9–12 m total) + Dexametasona Thwaites (0.4→0.1 mg/kg/d en 6–8 sem) · VIH-TB: diferir TAR ≤ 2 sem si CD4 < 50 (no meníngea) o 4–8 sem si meningitis TB',
        'Con rifampicina duplicar Dolutegravir (DTG 50 mg c/12 h). Controles de BAAR: fin de fase intensiva (2.º mes), 4.º–5.º mes y egreso. Suspender fármacos hepatotóxicos si ictericia o ALT > 3× LSN con síntomas (> 5× asintomática).',
      ],
    ],
    keyManagementPearls: [
      'Normativa 054 MINSA Nicaragua: la captación oportuna del Sintomático Respiratorio (≥ 15 días de tos con expectoración), la estrategia TAES y el estudio de focos en < 72 horas son las piedras angulares para cortar la cadena de transmisión.',
      'En meningitis TB, iniciar anti-TB + dexametasona de inmediato reduce la mortalidad ~31 % (Thwaites) y diferir el TAR 4–8 semanas evita el SIRI cerebral grave.',
    ],
    cautionNote:
      'Nunca añadir un único medicamento a un esquema que fracasa. Verificar siempre las pautas operativas vigentes del Componente de Tuberculosis del MINSA Nicaragua y los resultados del CNDR.',
    references: [
      {
        citation:
          'Ministerio de Salud (MINSA) de Nicaragua. Normativa 054: Normas y Procedimientos para el Abordaje de la Tuberculosis (TAES, SR, BAAR ×3, Esquema 2HRZE/4HR, Control de Focos y Quimioprofilaxis). Managua: MINSA.',
        year: 2023,
      },
      {
        citation:
          'Organización Panamericana de la Salud / OMS. Directrices unificadas sobre la tuberculosis: Módulos 1, 3, 4 y 5 (2022–2024).',
        year: 2024,
      },
      {
        citation:
          'Thwaites GE, Nguyen DB, Nguyen HD, et al. Dexamethasone for the treatment of tuberculous meningitis in adolescents and adults. N Engl J Med. 2004;351(17):1741-1751.',
        year: 2004,
      },
    ],
  },
  {
    id: 'malaria-leptospirosis-minsa-table',
    title: 'Malaria (P. vivax / P. falciparum) y Leptospirosis: Esquemas Terapéuticos MINSA Nicaragua',
    shortTitle: 'Malaria y Leptospirosis (MINSA Nicaragua)',
    specialty: 'infectologia',
    secondarySpecialties: ['medicina-interna', 'pediatria', 'urgencias', 'gineco-obstetricia'],
    setting: 'ambos',
    guidelineVersion: 'Normativas Nacionales MINSA Nicaragua (Malaria & Leptospirosis) · OPS/OMS',
    summary:
      'Esquemas supervisados de Cloroquina + Primaquina (7 d / DU) y Coartem para Malaria (incl. Red Col-Vol y contraindicaciones en embarazo/< 6 m), junto con pautas de Doxiciclina, Amoxicilina y Penicilina cristalina en Leptospirosis.',
    columns: [
      'Patología / Escenario clínico',
      'Esquema terapéutico y dosis exacta (MINSA)',
      'Contraindicaciones, vigilancia y alertas críticas',
    ],
    rows: [
      [
        { text: 'Malaria por Plasmodium vivax (Cura radical)', tone: 'moderate', emphasize: true },
        'Cloroquina base 25 mg/kg total en 3 días (Día 1: 10 mg/kg [máx 600 mg] · Día 2: 10 mg/kg [máx 600 mg] · Día 3: 5 mg/kg [máx 300 mg]) + Primaquina 0.5 mg/kg/día VO × 7 días (máx 30 mg/d)',
        'Supervisión estricta por personal MINSA o Col-Vol. CONTRAINDICADA Primaquina en embarazo, lactancia y < 6 meses (dar solo Cloroquina y valorar profilaxis semanal con Cloroquina 300 mg base hasta finalizar gestación/lactancia). Vigilar hemólisis (coluria/ictericia).',
      ],
      [
        { text: 'Malaria por P. falciparum sensible vs. resistente/mixta', tone: 'high', emphasize: true },
        'Sensible: Cloroquina 25 mg/kg (3 días) + Primaquina 0.75 mg/kg (máx 45 mg) dosis única gametocida · Resistente/mixta: Arteméter 20 mg / Lumefantrina 120 mg (Coartem) 6 dosis en 3 días (0, 8, 24, 36, 48, 60 h): 5–14 kg (1 tab), 15–24 kg (2 tab), 25–34 kg (3 tab), ≥ 35 kg (4 tab)',
        'Administrar Arteméter-Lumefantrina con alimentos grasos/leche para asegurar absorción (evitar toronja). Ante signos de malaria grave (SNC, choque, ictericia, hiperparasitemia), hospitalizar e iniciar Artesunato IV 2.4 mg/kg (3 mg/kg si < 20 kg) a las 0, 12 y 24 h.',
      ],
      [
        { text: 'Leptospirosis Leve / Ambulatoria y Embarazo (MINSA)', tone: 'moderate', emphasize: true },
        '≥ 10 años y adultos: Doxiciclina 100 mg VO c/12 h × 7 días (profilaxis comunitaria en brotes: 200 mg VO/sem) · Embarazo y < 10 años: Amoxicilina 500 mg VO c/6 h × 7 d (embarazo/adulto) o 30–50 mg/kg/día VO c/8 h (niños)',
        'Iniciar antibiótico ante sospecha clínica (< 5 días de inicio) SIN esperar ELISA IgM ni MAT. Evitar AINEs/AAS. Derivar a hospital si aparece ictericia, oliguria, disnea/hemoptisis o hipotensión.',
      ],
      [
        { text: 'Leptospirosis Moderada-Grave / Síndrome de Weil', tone: 'critical', emphasize: true },
        'Adultos/gestantes: Penicilina G sódica cristalina 1.5 millones UI IV c/6 h (hasta 2–4 millones UI c/4–6 h en cuadros críticos) × 7 días · Pediatría: Penicilina G cristalina 250,000 UI/kg/día IV dividida c/4–6 h × 7 días · Alternativa: Ceftriaxona 1–2 g IV c/24 h',
        'Vigilar reacción de Jarisch-Herxheimer en primeras 2–6 h tras primera dosis de penicilina (fiebre, escalofríos, hipotensión). Control estricto de diuresis, K⁺ sérico, plaquetas y detección temprana de hemorragia alveolar pulmonar.',
      ],
    ],
    keyManagementPearls: [
      'En Nicaragua, el diagnóstico de gota gruesa y el seguimiento de esquemas supervisados en zonas endémicas se articula con la red comunitaria Col-Vol y las UAF.',
      'En Leptospirosis grave, la insuficiencia renal aguda suele ser no oligúrica e hipopotasémica inicialmente; la hemorragia pulmonar puede deteriorar rápidamente sin ictericia marcada.',
    ],
    references: [
      {
        citation:
          'Ministerio de Salud de Nicaragua (MINSA). Norma y Guía para el Diagnóstico, Tratamiento y Control de la Malaria (Red Col-Vol). Managua: MINSA.',
        year: 2022,
      },
      {
        citation:
          'Ministerio de Salud de Nicaragua (MINSA). Normativa de Abordaje y Manejo Clínico de la Leptospirosis Humana. Managua: MINSA.',
        year: 2020,
      },
    ],
  },
];
