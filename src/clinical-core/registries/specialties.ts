import type { SpecialtyId, SpecialtyMeta, SubcategoryId } from '../types/clinical.ts';

export const SPECIALTIES: SpecialtyMeta[] = [
  {
    id: 'medicina-interna',
    name: 'Medicina Interna',
    shortName: 'Med. Interna',
    description: 'Antropometría, equilibrio ácido-base, riesgo trombótico y scores generales.',
  },
  {
    id: 'urgencias',
    name: 'Urgencias y Emergencias',
    shortName: 'Urgencias',
    description: 'Triaje, gravedad aguda, sepsis, choque e infusiones.',
  },
  {
    id: 'cardiologia',
    name: 'Cardiología',
    shortName: 'Cardiología',
    description: 'Síndrome coronario, QTc, riesgo cardiovascular y hemodinamia.',
  },
  {
    id: 'nefrologia',
    name: 'Nefrología',
    shortName: 'Nefrología',
    description: 'Filtrado glomerular, lesión renal aguda e índices urinarios.',
  },
  {
    id: 'neurologia',
    name: 'Neurología',
    shortName: 'Neurología',
    description: 'Nivel de conciencia, ictus, AIT y hemorragia intracraneal.',
  },
  {
    id: 'pediatria',
    name: 'Pediatría',
    shortName: 'Pediatría',
    description: 'Líquidos, dosificación por peso, escalas pediátricas y crecimiento.',
  },
  {
    id: 'gineco-obstetricia',
    name: 'Ginecología y Obstetricia',
    shortName: 'Gineco-Obst.',
    description: 'Edad gestacional, parto, evaluación neonatal y choque obstétrico.',
  },
  {
    id: 'endocrinologia',
    name: 'Endocrinología',
    shortName: 'Endocrinología',
    description: 'Metabolismo glucémico, calcio, osmolaridad y protocolos de insulina.',
  },
  {
    id: 'cirugia-general',
    name: 'Cirugía General',
    shortName: 'Cirugía',
    description: 'Apendicitis, pancreatitis aguda, riesgo quirúrgico y tromboprofilaxis.',
  },
  {
    id: 'infectologia',
    name: 'Infectología',
    shortName: 'Infectología',
    description: 'Neumonía, faringoamigdalitis, sepsis e infecciones específicas.',
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
