import type { SpecialtyId, SpecialtyMeta, SubcategoryId } from '../types/clinical.ts';

export const SPECIALTIES: SpecialtyMeta[] = [
  {
    id: 'cardiologia',
    name: 'Cardiología',
    shortName: 'Cardiología',
    description: 'Síndrome coronario, SCORE2, QTc, fibrilación auricular, HTA, ITB y riesgo cardiovascular.',
  },
  {
    id: 'cirugia-general',
    name: 'Cirugía General',
    shortName: 'Cirugía',
    description: 'Apendicitis, vía aérea, riesgo quirúrgico (ASA) y tromboprofilaxis.',
  },
  {
    id: 'dermatologia',
    name: 'Dermatología y Alergología',
    shortName: 'Derma / Alergia',
    description: 'Anafilaxia, quemaduras, SCORTEN (SSJ/NET), UAS7 (urticaria), infecciones necrotizantes y cuidado cutáneo.',
  },
  {
    id: 'endocrinologia',
    name: 'Endocrinología y Metabolismo',
    shortName: 'Endocrinología',
    description: 'Diabetes, HbA1c, perfil lipídico, hipercolesterolemia familiar (DLCN), calcio, HOMA y protocolos de insulina.',
  },
  {
    id: 'gastroenterologia',
    name: 'Gastroenterología y Hepatología',
    shortName: 'Gastro / Hepato',
    description: 'Hemorragia digestiva, MASLD/fibrosis (FIB-4, NFS, APRI), MELD-Na, Roma IV (SII/estreñimiento) y Bristol.',
  },
  {
    id: 'geriatria',
    name: 'Geriatría',
    shortName: 'Geriatría',
    description: 'Fragilidad (CFS), Barthel, Lawton-Brody, carga anticolinérgica (ACB), MNA-SF, SARC-F, Yesavage GDS-15, Charlson y cognición.',
  },
  {
    id: 'gineco-obstetricia',
    name: 'Ginecología y Obstetricia',
    shortName: 'Gineco-Obst.',
    description: 'Edad gestacional, ganancia ponderal/fetal, preeclampsia/HELLP, DMG, menopausia (MRS), SOP (Rotterdam) y MgSO₄.',
  },
  {
    id: 'hematologia',
    name: 'Hematología',
    shortName: 'Hematología',
    description: 'Anemia (Ganzoni, Mentzer), RAN/neutropenia, Score 4Ts (HIT), ISTH CID, sPESI y riesgo trombo-hemorrágico.',
  },
  {
    id: 'infectologia',
    name: 'Infectología',
    shortName: 'Infectología',
    description: 'Faringoamigdalitis, rinosinusitis aguda (IDSA/EPOS), neumonía, dengue, sepsis e infecciones graves.',
  },
  {
    id: 'medicina-interna',
    name: 'Medicina Interna',
    shortName: 'Med. Interna',
    description: 'Antropometría, electrolitos, osteoporosis (OMS/OSTA), fibromialgia ACR, AR (DAS28) y medicina de consulta.',
  },
  {
    id: 'nefrologia',
    name: 'Nefrología',
    shortName: 'Nefrología',
    description: 'Filtrado glomerular (CKD-EPI, Cockcroft-Gault, Schwartz pediátrico), LRA/ERC KDIGO, índices urinarios y déficit de HCO₃⁻.',
  },
  {
    id: 'neumologia',
    name: 'Neumología',
    shortName: 'Neumología',
    description: 'Asma, EPOC GOLD, SAOS (STOP-BANG/Epworth), tabaquismo, oxigenación y neumonía.',
  },
  {
    id: 'neurologia',
    name: 'Neurología',
    shortName: 'Neurología',
    description: 'Nivel de conciencia, ictus, cefaleas/migrañas (ICHD-3), banderas rojas (SNNOOP10), debilidad (MRC) y dolor neuropático.',
  },
  {
    id: 'pediatria',
    name: 'Pediatría',
    shortName: 'Pediatría',
    description: 'Crecimiento OMS, PA pediátrica (AAP), talla diana/velocidad, M-CHAT-R, crup, bronquiolitis, líquidos y dosificación infantil.',
  },
  {
    id: 'psiquiatria',
    name: 'Psiquiatría y Salud Mental',
    shortName: 'Psiquiatría',
    description: 'Depresión (PHQ-9), ansiedad (GAD-7, Hamilton), riesgo suicida (SAD PERSONS), AUDIT y CIWA-Ar.',
  },
  {
    id: 'traumatologia',
    name: 'Traumatología y Ortopedia',
    shortName: 'Traumatología',
    description: 'Fracturas abiertas (Gustilo-Anderson), extremidad grave (MESS), reglas de Ottawa, columna cervical y dolor radicular.',
  },
  {
    id: 'urgencias',
    name: 'Urgencias y Emergencias',
    shortName: 'Urgencias',
    description: 'Triaje, gravedad aguda, sepsis, choque, TCE, intoxicaciones, quemaduras e infusiones.',
  },
  {
    id: 'urologia',
    name: 'Urología',
    shortName: 'Urología',
    description: 'Litiasis ureteral (STONE), densidad de PSA, síntomas prostáticos (IPSS) y escroto agudo (TWIST).',
  },
];

export const SPECIALTY_MAP: Record<SpecialtyId, SpecialtyMeta> = SPECIALTIES.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<SpecialtyId, SpecialtyMeta>,
);

export const SUBCATEGORY_LABELS: Record<SubcategoryId, string> = {
  formulas: 'Fórmula fisiológica',
  gravedad: 'Escala de gravedad y pronóstico',
  diagnostico: 'Criterio diagnóstico / riesgo',
  liquidos: 'Líquidos y electrolitos',
  dosificacion: 'Dosificación e infusiones',
};
