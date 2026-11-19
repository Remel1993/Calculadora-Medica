import type { SpecialtyId, SpecialtyMeta, SubcategoryId } from '../types/clinical.ts';

export const SPECIALTIES: SpecialtyMeta[] = [
  {
    id: 'cardiologia',
    name: 'Cardiología',
    shortName: 'Cardiología',
    description: 'Síndrome coronario, QTc, fibrilación auricular, HTA, ITB y riesgo cardiovascular.',
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
    description: 'Anafilaxia, quemaduras, infecciones necrotizantes de partes blandas y cuidado cutáneo.',
  },
  {
    id: 'endocrinologia',
    name: 'Endocrinología y Metabolismo',
    shortName: 'Endocrinología',
    description: 'Diabetes, HbA1c, perfil lipídico, calcio, HOMA, peso ajustado y protocolos de insulina.',
  },
  {
    id: 'gastroenterologia',
    name: 'Gastroenterología y Hepatología',
    shortName: 'Gastro / Hepato',
    description: 'Hemorragia digestiva, cirrosis, FIB-4, MELD-Na, hepatitis alcohólica, pancreatitis y Bristol.',
  },
  {
    id: 'geriatria',
    name: 'Geriatría',
    shortName: 'Geriatría',
    description: 'Tamizaje cognitivo (Mini-Cog), riesgo de caídas (Morse/Downton) y úlceras por presión (Braden).',
  },
  {
    id: 'gineco-obstetricia',
    name: 'Ginecología y Obstetricia',
    shortName: 'Gineco-Obst.',
    description: 'Edad gestacional, FPP, Bishop, sulfato de magnesio y choque obstétrico.',
  },
  {
    id: 'hematologia',
    name: 'Hematología',
    shortName: 'Hematología',
    description: 'Anemia ferropénica (Ganzoni), microcitosis (Mentzer), RAN/neutropenia y riesgo trombo-hemorrágico.',
  },
  {
    id: 'infectologia',
    name: 'Infectología',
    shortName: 'Infectología',
    description: 'Faringoamigdalitis, neumonía, dengue, sepsis e infecciones graves.',
  },
  {
    id: 'medicina-interna',
    name: 'Medicina Interna',
    shortName: 'Med. Interna',
    description: 'Antropometría, electrolitos, osmolaridad, equilibrio ácido-base y medicina de consulta.',
  },
  {
    id: 'nefrologia',
    name: 'Nefrología',
    shortName: 'Nefrología',
    description: 'Filtrado glomerular (CKD-EPI, Cockcroft-Gault), lesión renal aguda e índices urinarios.',
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
    description: 'Nivel de conciencia, ictus, AIT, hemorragia intracraneal y dolor neuropático.',
  },
  {
    id: 'pediatria',
    name: 'Pediatría',
    shortName: 'Pediatría',
    description: 'Crup, bronquiolitis, ictericia, Capurro, crecimiento OMS, líquidos y dosificación infantil.',
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
    description: 'Reglas de Ottawa (tobillo, pie y rodilla), columna cervical (NEXUS/CCR) y dolor radicular.',
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
    description: 'Síntomas prostáticos / HPB (IPSS) y escroto agudo / torsión testicular (TWIST).',
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
