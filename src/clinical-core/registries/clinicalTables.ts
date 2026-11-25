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
    title: 'Trastornos Hipertensivos del Embarazo y Preeclampsia (ACOG / ISSHP)',
    shortTitle: 'Preeclampsia y Crisis Obstétrica',
    specialty: 'gineco-obstetricia',
    secondarySpecialties: ['urgencias'],
    setting: 'ambos',
    guidelineVersion: 'ACOG Practice Bulletin 222 / ISSHP 2022',
    summary:
      'Criterios diagnósticos exactos desde las 20 semanas de gestación, definición de gravedad/HELLP y fármacos de primera línea en emergencia obstétrica.',
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
        '1) MgSO₄ Zuspan: 4 g IV en 15–20 min + 1 g/h IV. 2) Si PA ≥ 160/110: Labetalol 20→40→80 mg IV c/10 min, o Nifedipino acción inmediata 10 mg VO c/20 min, o Hidralazina 5–10 mg IV c/20 min (meta PAS 130–150 / PAD 80–100 mmHg). 3) Finalizar ≥ 34 0/7 SG tras estabilización (si < 34 SG estable, maduración pulmonar en 3.er nivel).',
      ],
      [
        { text: 'Eclampsia / Síndrome HELLP', tone: 'critical', emphasize: true },
        'Eclampsia: convulsiones tónico-clónicas nuevas sin otra causa. HELLP (Tennessee): LDH ≥ 600 U/L (o hemólisis) + AST/ALT ≥ 2× LSN + Plaquetas < 100,000/µL',
        'Vía aérea / decúbito lateral izquierdo + MgSO₄ IV inmediato (si convulsiona bajo infusión: bolo adicional 2 g IV) + control PA + finalización obstétrica prioritaria tras estabilización materna.',
      ],
    ],
    keyManagementPearls: [
      'Durante la infusión de MgSO₄ vigilar cada hora: reflejos osteotendinosos presentes (su abolición es el signo más precoz de toxicidad), frecuencia respiratoria ≥ 12 rpm (algunos protocolos exigen ≥ 14–16 rpm) y diuresis ≥ 30 mL/h (o ≥ 100 mL en 4 h). Antídoto: Gluconato de calcio 10 % 10 mL (1 g) IV lento en 3–5 min.',
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
    title: 'Dengue: Clasificación de Gravedad y Esquema de Líquidos (OPS / OMS)',
    shortTitle: 'Dengue: Grupos A, B y C (OPS/OMS)',
    specialty: 'infectologia',
    secondarySpecialties: ['urgencias', 'medicina-interna', 'pediatria'],
    setting: 'ambos',
    guidelineVersion: 'OPS / OMS (Edición vigente)',
    summary:
      'Criterios clínicos de triage para decidir manejo ambulatorio (Grupo A), observación (Grupo B1), hospitalización (Grupo B2) o reanimación (Grupo C).',
    columns: ['Grupo OPS / OMS', 'Criterios clínicos exactos', 'Manejo de líquidos y vigilancia'],
    rows: [
      [
        { text: 'Grupo A — Dengue sin signos de alarma ni comorbilidad', tone: 'normal', emphasize: true },
        'Fiebre + síntomas clásicos, tolera vía oral, diuresis adecuada (≥ 1 micción c/6 h), sin signos de alarma ni condición de riesgo',
        'Ambulatorio: hidratación oral abundante (SRO), paracetamol; CONTRAINDICADOS AINEs, AAS, metamizol IM y corticoides. Control clínico y BH cada 24–48 h hasta 48 h posdefervescencia.',
      ],
      [
        { text: 'Grupo B1 — Sin alarma pero con condición asociada o riesgo social', tone: 'low', emphasize: true },
        'Embarazo, < 1 año, ≥ 65 años, obesidad mórbida, DM, HTA, nefropatía, cardiopatía, hepatopatía, coagulopatía o riesgo social',
        'Observación o ingreso para asegurar hidratación oral o IV de mantenimiento (2–3 mL/kg/h) y vigilancia estrecha de aparición de signos de alarma.',
      ],
      [
        { text: 'Grupo B2 — Dengue con signos de alarma', tone: 'high', emphasize: true },
        '≥ 1 signo: dolor abdominal intenso/continuo, vómitos persistentes (≥ 3 en 1 h o ≥ 4 en 6 h), ascitis/derrame pleural/pericárdico, sangrado mucosas, letargia/irritabilidad, hipotensión postural, hepatomegalia > 2 cm, ↑ Hto con caída rápida plaquetas',
        'Hospitalización inmediata: Cristaloide isotónico (SS 0.9 % o Ringer Lactato) 10 mL/kg IV en 1 h; reevaluar Hto y signos vitales; si mejora reducir escalonadamente: 5–7 mL/kg/h (2–4 h) → 3–5 mL/kg/h (2–4 h) → 2–3 mL/kg/h.',
      ],
      [
        { text: 'Grupo C — Dengue grave', tone: 'critical', emphasize: true },
        '≥ 1 criterio: choque por extravasación plasmática, distrés respiratorio por sobrecarga/derrame, sangrado grave o daño orgánico grave (AST/ALT ≥ 1000 U/L, alteración SNC, miocarditis)',
        'UCI / Reanimación: Bolo cristaloide isotónico 20 mL/kg IV en 15–30 min; si mejora pasar a 10 mL/kg en 1 h y descenso escalonado. Si persiste choque tras 2–3 bolos de cristaloide, valorar coloide (10–20 mL/kg) o transfusión de GR (5–10 mL/kg) si cae Hto sin mejoría.',
      ],
    ],
    keyManagementPearls: [
      'La fase crítica (extravasación plasmática, hemoconcentración y choque) suele iniciar al caer la fiebre (días 3–7 de enfermedad), NO durante el pico febril inicial.',
      'NO transfundir plaquetas de forma profiláctica por trombocitopenia aislada sin sangrado activo grave ni procedimiento quirúrgico urgente.',
    ],
    references: [
      {
        citation:
          'Organización Panamericana de la Salud (OPS/OMS). Guías para la atención de enfermos con dengue en la Región de las Américas (2.ª ed.).',
        year: 2016,
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
];
