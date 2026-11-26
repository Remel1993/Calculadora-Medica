export interface ClinicalAcronymEntry {
  sigla: string;
  significado: string;
  /** Optional alternate exact tokens that map to this entry */
  aliases?: string[];
}

export const CLINICAL_ACRONYMS: ClinicalAcronymEntry[] = [
  // Tuberculosis & Infectología (MINSA Nicaragua / OMS)
  { sigla: 'TB', significado: 'Tuberculosis' },
  { sigla: 'SR', significado: 'Sintomático Respiratorio (tos con expectoración ≥ 15 días)' },
  { sigla: 'BAAR', significado: 'Bacilo Ácido-Alcohol Resistente (baciloscopía de esputo)' },
  { sigla: 'TAES', significado: 'Tratamiento Acortado Estrictamente Supervisado (estrategia DOTS)' },
  { sigla: 'DOT', significado: 'Terapia Directamente Observada (supervisión de cada toma)' },
  { sigla: 'DFC', significado: 'Drogas Fijas Combinadas (tabletas con varios fármacos juntos)' },
  { sigla: 'HRZE', significado: 'Isoniacida (H) + Rifampicina (R) + Pirazinamida (Z) + Etambutol (E)', aliases: ['2HRZE'] },
  { sigla: 'RHZE', significado: 'Rifampicina (R) + Isoniacida (H) + Pirazinamida (Z) + Etambutol (E)' },
  { sigla: 'HRZ', significado: 'Isoniacida (H) + Rifampicina (R) + Pirazinamida (Z)', aliases: ['2HRZ'] },
  { sigla: 'HR', significado: 'Isoniacida (H) + Rifampicina (R)', aliases: ['4HR', '2HR'] },
  { sigla: 'RH', significado: 'Rifampicina (R) + Isoniacida (H)' },
  { sigla: 'TPI', significado: 'Terapia Preventiva con Isoniacida (quimioprofilaxis)' },
  { sigla: 'TPT', significado: 'Tratamiento Preventivo de la Tuberculosis' },
  { sigla: 'ITL', significado: 'Infección Tuberculosa Latente' },
  { sigla: 'PPD', significado: 'Derivado Proteico Purificado (prueba cutánea de tuberculina / Mantoux)' },
  { sigla: 'IGRA', significado: 'Ensayo de Liberación de Interferón Gamma (QuantiFERON / T-SPOT)' },
  { sigla: 'CNDR', significado: 'Centro Nacional de Diagnóstico y Referencia (MINSA Nicaragua)' },
  { sigla: 'MINSA', significado: 'Ministerio de Salud de Nicaragua' },
  { sigla: 'PNCT', significado: 'Programa Nacional de Control de la Tuberculosis' },
  { sigla: 'PAI', significado: 'Programa Ampliado de Inmunizaciones' },
  { sigla: 'PVVIH', significado: 'Personas que Viven con el VIH' },
  { sigla: 'RR-TB', significado: 'Tuberculosis Resistente a Rifampicina' },
  { sigla: 'MDR-TB', significado: 'Tuberculosis Multidrogorresistente (resistente a H y R)' },
  { sigla: 'TB-DR', significado: 'Tuberculosis Drogarresistente' },
  { sigla: 'BPaLM', significado: 'Bedaquilina + Pretomanid + Linezolid + Moxifloxacino' },
  { sigla: 'BPaL', significado: 'Bedaquilina + Pretomanid + Linezolid' },
  { sigla: 'LF-LAM', significado: 'Lipoarabinomanano de flujo lateral en orina (tamizaje TB en VIH)' },
  { sigla: 'mWRD', significado: 'Prueba molecular rápida recomendada por la OMS (p. ej. GeneXpert)' },
  { sigla: 'LPA', significado: 'Ensayo de Sonda en Línea (detección molecular de resistencias)' },
  { sigla: '3HP', significado: 'Isoniacida + Rifapentina semanal durante 3 meses (12 dosis)' },
  { sigla: '1HP', significado: 'Isoniacida + Rifapentina diaria durante 1 mes (28 dosis)' },
  { sigla: '3HR', significado: 'Isoniacida + Rifampicina diaria durante 3 meses' },
  { sigla: '4R', significado: 'Rifampicina diaria durante 4 meses' },
  { sigla: '6H', significado: 'Isoniacida diaria durante 6 meses' },
  { sigla: '9H', significado: 'Isoniacida diaria durante 9 meses' },
  { sigla: 'BCG', significado: 'Vacuna Bacilo de Calmette-Guérin contra formas graves de TB' },
  { sigla: 'ADA', significado: 'Adenosín Desaminasa (líquido pleural/peritoneal/LCR)' },

  // VIH / Infectología / Inmunización
  { sigla: 'VIH', significado: 'Virus de la Inmunodeficiencia Humana' },
  { sigla: 'SIDA', significado: 'Síndrome de Inmunodeficiencia Adquirida' },
  { sigla: 'TAR', significado: 'Terapia Antirretroviral' },
  { sigla: 'SIRI', significado: 'Síndrome Inflamatorio de Reconstitución Inmune' },
  { sigla: 'DTG', significado: 'Dolutegravir' },
  { sigla: 'TAF', significado: 'Tenofovir Alafenamida' },
  { sigla: 'TDF', significado: 'Tenofovir Disoproxil Fumarato' },
  { sigla: '3TC', significado: 'Lamivudina' },
  { sigla: 'FTC', significado: 'Emtricitabina' },
  { sigla: 'AZT', significado: 'Zidovudina' },
  { sigla: 'BIC', significado: 'Bictegravir' },
  { sigla: 'RAL', significado: 'Raltegravir' },
  { sigla: 'EFV', significado: 'Efavirenz' },
  { sigla: 'NVP', significado: 'Nevirapina' },
  { sigla: 'TLD', significado: 'Esquema fijo combinado: Tenofovir (TDF) + Lamivudina (3TC) + Dolutegravir (DTG)' },
  { sigla: 'ARV', significado: 'Antirretroviral' },
  { sigla: 'PEP', significado: 'Profilaxis Post-Exposición (en inglés Post-Exposure Prophylaxis)' },
  { sigla: 'PPE', significado: 'Profilaxis Post-Exposición (sigla institucional MINSA)' },
  { sigla: 'PrEP', significado: 'Profilaxis Pre-Exposición' },
  { sigla: 'PCP', significado: 'Neumonía por Pneumocystis jirovecii' },
  { sigla: 'MAC', significado: 'Complejo Mycobacterium avium' },
  { sigla: 'CMV', significado: 'Citomegalovirus' },
  { sigla: 'CrAg', significado: 'Antígeno criptocócico' },
  { sigla: 'TMP-SMX', significado: 'Trimetoprim-Sulfametoxazol' },
  { sigla: 'IO', significado: 'Infección Oportunista (o vía Intraósea según contexto)' },
  { sigla: 'VHB', significado: 'Virus de la Hepatitis B' },
  { sigla: 'VHC', significado: 'Virus de la Hepatitis C' },
  { sigla: 'HBsAg', significado: 'Antígeno de superficie del Virus de la Hepatitis B' },
  { sigla: 'HBIG', significado: 'Inmunoglobulina humana anti-Hepatitis B' },
  { sigla: 'UAF', significado: 'Unidad de Atención a Febriles (MINSA Nicaragua)' },
  { sigla: 'Col-Vol', significado: 'Colaborador Voluntario de la Red Comunitaria de Malaria (MINSA Nicaragua)' },
  { sigla: 'MAT', significado: 'Prueba de Aglutinación Microscópica (diagnóstico confirmatorio de Leptospirosis)' },
  { sigla: 'ELISA', significado: 'Ensayo por Inmunoabsorción Ligado a Enzimas' },

  // Signos vitales, Reanimación y Vías de administración
  { sigla: 'PAS', significado: 'Presión Arterial Sistólica' },
  { sigla: 'PAD', significado: 'Presión Arterial Diastólica' },
  { sigla: 'PAM', significado: 'Presión Arterial Media' },
  { sigla: 'PA', significado: 'Presión Arterial (o proyección Posteroanterior)' },
  { sigla: 'FC', significado: 'Frecuencia Cardíaca' },
  { sigla: 'FR', significado: 'Frecuencia Respiratoria (o Factor de Riesgo)' },
  { sigla: 'SpO₂', significado: 'Saturación periférica de oxígeno', aliases: ['SpO2'] },
  { sigla: 'PaO₂', significado: 'Presión arterial parcial de oxígeno', aliases: ['PaO2'] },
  { sigla: 'FiO₂', significado: 'Fracción inspirada de oxígeno', aliases: ['FiO2'] },
  { sigla: 'PaFi', significado: 'Relación PaO₂ / FiO₂' },
  { sigla: 'SaFi', significado: 'Relación SpO₂ / FiO₂' },
  { sigla: 'TET', significado: 'Tubo Endotraqueal' },
  { sigla: 'PALS', significado: 'Soporte Vital Avanzado Pediátrico' },
  { sigla: 'RCP', significado: 'Reanimación Cardiopulmonar' },
  { sigla: 'VO', significado: 'Vía Oral' },
  { sigla: 'IV', significado: 'Vía Intravenosa' },
  { sigla: 'IM', significado: 'Vía Intramuscular' },
  { sigla: 'SC', significado: 'Vía Subcutánea (o Superficie Corporal)' },
  { sigla: 'TD', significado: 'Transdérmico' },
  { sigla: 'PRN', significado: 'Por razón necesaria (según requerimiento)' },
  { sigla: 'UI', significado: 'Unidades Internacionales' },
  { sigla: 'RL', significado: 'Lactato de Ringer (Solución de Hartmann)' },
  { sigla: 'D5%', significado: 'Dextrosa al 5 % en agua' },
  { sigla: 'MgSO₄', significado: 'Sulfato de Magnesio', aliases: ['MgSO4'] },

  // Laboratorio, Órganos y Medicina Interna
  { sigla: 'SNC', significado: 'Sistema Nervioso Central' },
  { sigla: 'LCR', significado: 'Líquido Cefalorraquídeo' },
  { sigla: 'ERC', significado: 'Enfermedad Renal Crónica' },
  { sigla: 'LRA', significado: 'Lesión Renal Aguda' },
  { sigla: 'AKI', significado: 'Lesión Renal Aguda (Acute Kidney Injury)' },
  { sigla: 'TFG', significado: 'Tasa de Filtración Glomerular' },
  { sigla: 'ClCr', significado: 'Aclaramiento de Creatinina' },
  { sigla: 'AST', significado: 'Aspartato Aminotransferasa (TGO)' },
  { sigla: 'ALT', significado: 'Alanina Aminotransferasa (TGP)' },
  { sigla: 'LDH', significado: 'Lactato Deshidrogenasa' },
  { sigla: 'LSN', significado: 'Límite Superior de la Normalidad' },
  { sigla: 'IgG', significado: 'Inmunoglobulina G' },
  { sigla: 'INR', significado: 'Razón Normalizada Internacional (coagulación)' },
  { sigla: 'IMC', significado: 'Índice de Masa Corporal' },
  { sigla: 'BSA', significado: 'Superficie Corporal (Body Surface Area)' },
  { sigla: 'HbA1c', significado: 'Hemoglobina Glucosilada A1c' },
  { sigla: 'eAG', significado: 'Glucosa Promedio Estimada' },
  { sigla: 'DM', significado: 'Diabetes Mellitus' },
  { sigla: 'CAD', significado: 'Cetoacidosis Diabética' },
  { sigla: 'EHH', significado: 'Estado Hiperglucémico Hiperosmolar' },
  { sigla: 'HTA', significado: 'Hipertensión Arterial' },
  { sigla: 'ECV', significado: 'Enfermedad Cardiovascular' },
  { sigla: 'IAM', significado: 'Infarto Agudo de Miocardio' },
  { sigla: 'SCA', significado: 'Síndrome Coronario Agudo' },
  { sigla: 'ICC', significado: 'Insuficiencia Cardíaca Congestiva' },
  { sigla: 'FA', significado: 'Fibrilación Auricular' },
  { sigla: 'TVP', significado: 'Trombosis Venosa Profunda' },
  { sigla: 'TEP', significado: 'Tromboembolia Pulmonar' },
  { sigla: 'ACV', significado: 'Accidente Cerebrovascular (ictus)' },
  { sigla: 'AIT', significado: 'Ataque Isquémico Transitorio' },
  { sigla: 'EPOC', significado: 'Enfermedad Pulmonar Obstructiva Crónica' },
  { sigla: 'SAOS', significado: 'Síndrome de Apnea Obstructiva del Sueño' },
  { sigla: 'Rx', significado: 'Radiografía' },
  { sigla: 'TAC', significado: 'Tomografía Axial Computarizada' },
  { sigla: 'RM', significado: 'Resonancia Magnética' },
  { sigla: 'ECG', significado: 'Electrocardiograma' },
  { sigla: 'QTc', significado: 'Intervalo QT corregido' },
  { sigla: 'PCR', significado: 'Proteína C Reactiva (o Reacción en Cadena de Polimerasa / Paro)' },
  { sigla: 'MME', significado: 'Miligramos Equivalentes de Morfina' },
  { sigla: 'HPA', significado: 'Eje Hipotálamo-Hipófisis-Adrenal' },
  { sigla: 'CYP3A4', significado: 'Enzima hepática del citocromo P450 3A4' },

  // Pediatría, Neonatología y Gineco-Obstetricia
  { sigla: 'EDA', significado: 'Enfermedad Diarreica Aguda' },
  { sigla: 'SRO', significado: 'Sales de Rehidratación Oral' },
  { sigla: 'AIEPI', significado: 'Atención Integrada a las Enfermedades Prevalentes de la Infancia' },
  { sigla: 'RN', significado: 'Recién Nacido' },
  { sigla: 'EG', significado: 'Edad Gestacional' },
  { sigla: 'FUR', significado: 'Fecha de Última Regla (Menstruación)' },
  { sigla: 'FPP', significado: 'Fecha Probable de Parto' },
  { sigla: 'BST', significado: 'Bilirrubina Sérica Total' },
  { sigla: 'EBA', significado: 'Encefalopatía Bilirrubínica Aguda' },
  { sigla: 'UCIN', significado: 'Unidad de Cuidados Intensivos Neonatales' },
  { sigla: 'G6PD', significado: 'Glucosa-6-Fosfato Deshidrogenasa' },
  { sigla: 'AEG', significado: 'Peso Adecuado para la Edad Gestacional' },
  { sigla: 'PEG', significado: 'Pequeño para la Edad Gestacional' },
  { sigla: 'GEG', significado: 'Grande para la Edad Gestacional' },
  { sigla: 'DMG', significado: 'Diabetes Mellitus Gestacional' },
  { sigla: 'SOP', significado: 'Síndrome de Ovario Poliquístico' },
  { sigla: 'VPH', significado: 'Virus del Papiloma Humano' },
  { sigla: 'PAP', significado: 'Papanicolaou (citología cervical)' },

  // Hematología, Oncología, Escalas e Instituciones
  { sigla: 'RAN', significado: 'Recuento Absoluto de Neutrófilos' },
  { sigla: 'CID', significado: 'Coagulación Intravascular Diseminada' },
  { sigla: 'HIT', significado: 'Trombocitopenia Inducida por Heparina' },
  { sigla: 'TCE', significado: 'Traumatismo Craneoencefálico' },
  { sigla: 'AUC', significado: 'Área Bajo la Curva' },
  { sigla: 'ECOG', significado: 'Escala de Estado Funcional del Eastern Cooperative Oncology Group' },
  { sigla: 'BI-RADS', significado: 'Sistema de informes y registro de datos de imagen mamaria' },
  { sigla: 'TI-RADS', significado: 'Sistema de estratificación ecográfica de nódulos tiroideos' },
  { sigla: 'OMS', significado: 'Organización Mundial de la Salud' },
  { sigla: 'OPS', significado: 'Organización Panamericana de la Salud' },
  { sigla: 'CDC', significado: 'Centros para el Control y la Prevención de Enfermedades' },
  { sigla: 'AAP', significado: 'Academia Estadounidense de Pediatría' },
  { sigla: 'ADA', significado: 'Asociación Estadounidense de Diabetes' },
  { sigla: 'KDIGO', significado: 'Kidney Disease: Improving Global Outcomes' },
  { sigla: 'AHA', significado: 'Asociación Estadounidense del Corazón' },
  { sigla: 'GOLD', significado: 'Iniciativa Global para la EPOC' },
  { sigla: 'GINA', significado: 'Iniciativa Global para el Asma' },
  { sigla: 'NYHA', significado: 'Clasificación funcional de la New York Heart Association' },
  { sigla: 'NIHSS', significado: 'Escala de Ictus de los Institutos Nacionales de Salud' },
  { sigla: 'GCS', significado: 'Escala de Coma de Glasgow' },
  { sigla: 'UDVP', significado: 'Usuario de Drogas por Vía Parenteral' },
  { sigla: 'SSN', significado: 'Solución Salina Normal (Cloruro de Sodio al 0.9 %)' },
];

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const MATCHER_ENTRIES = CLINICAL_ACRONYMS.map((entry) => {
  const tokens = [entry.sigla, ...(entry.aliases ?? [])];
  // Match exact token bounded by non-letter/non-digit characters (handling Spanish accented letters safely)
  const pattern = new RegExp(
    `(?<![\\p{L}\\p{N}])(?:${tokens.map(escapeRegex).join('|')})(?![\\p{L}\\p{N}])`,
    'u',
  );
  return { entry, pattern };
});

/**
 * Extracts unique clinical acronyms present in the provided text, preserving appearance order
 * in the glossary table without noisy duplicates.
 */
export function extractAcronymsFromText(text: string): ClinicalAcronymEntry[] {
  if (!text) return [];
  const seen = new Set<string>();
  const matched: ClinicalAcronymEntry[] = [];

  for (const { entry, pattern } of MATCHER_ENTRIES) {
    if (seen.has(entry.sigla)) continue;
    if (pattern.test(text)) {
      seen.add(entry.sigla);
      matched.push(entry);
    }
  }
  return matched;
}
