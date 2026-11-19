import {
  Baby,
  Brain,
  Heart,
  Stethoscope,
} from 'lucide-react';
import React from 'react';
import type { SpecialtyId } from '../../clinical-core/types/clinical.ts';

// Custom offline medical SVG icons
const KidneysIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M9.5 6.5C7.2 5 4.5 6.8 4.5 10c0 3 2.2 4.8 4.4 4.2 1.2-.3 1.4-1.5 1-2.5-.3-.8-.2-1.7.4-2.3.7-.7.5-2.1-.8-2.9Z" fill="currentColor" fillOpacity="0.18" />
    <path d="M14.5 6.5C16.8 5 19.5 6.8 19.5 10c0 3-2.2 4.8-4.4 4.2-1.2-.3-1.4-1.5-1-2.5.3-.8.2-1.7-.4-2.3-.7-.7-.5-2.1.8-2.9Z" fill="currentColor" fillOpacity="0.18" />
    <path d="M10.5 11.5v5.5c0 1.4.4 2.5.8 3" />
    <path d="M13.5 11.5v5.5c0 1.4-.4 2.5-.8 3" />
  </svg>
);

const GlucometerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="6.5" y="3" width="11" height="15" rx="4" fill="currentColor" fillOpacity="0.14" />
    <rect x="9" y="5.5" width="6" height="4.5" rx="1" />
    <path d="M12 18v3" />
    <circle cx="12" cy="13.5" r="1.3" fill="currentColor" />
  </svg>
);

const ScalpelIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M19.5 4.5 9.5 14.5l-2 2-3.5 1.5 1.5-3.5 2-2 10-10a1.4 1.4 0 0 1 2 2Z" fill="currentColor" fillOpacity="0.18" />
    <path d="M4 20h14" />
  </svg>
);

const MicrobeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.2" />
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    <circle cx="10.5" cy="11" r="0.8" fill="currentColor" />
    <circle cx="13.8" cy="13.2" r="0.8" fill="currentColor" />
  </svg>
);

const SirenIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M7 18v-5a5 5 0 0 1 10 0v5" fill="currentColor" fillOpacity="0.2" />
    <path d="M5 18h14v2H5z" />
    <path d="M12 3v2M5.2 6.2l1.4 1.4M18.8 6.2l-1.4 1.4M3 12h2M19 12h2" />
  </svg>
);

const ObstetricsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="12" cy="5.5" r="2.2" fill="currentColor" fillOpacity="0.2" />
    <path d="M9.5 9.5h4.2c1.2 0 2.1.8 2.1 2.2 0 2.5-1.2 4.3-2.5 5.3V21h-3.8v-4c-1.1-.8-1.5-2.2-1.5-4.3 0-1.9.7-3.2 1.5-3.2Z" fill="currentColor" fillOpacity="0.16" />
  </svg>
);

const LungsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M12 3.5v8" />
    <path d="M12 10.5 8.5 13" />
    <path d="M12 10.5 15.5 13" />
    <path d="M9.8 8.2C7.4 8 4.2 11.4 4 16c-.1 2.2 1.1 3.5 2.8 3.5 1.8 0 3.2-1 3.2-3.2V9.8c0-1-.1-1.5-.2-1.6Z" fill="currentColor" fillOpacity="0.18" />
    <path d="M14.2 8.2c2.4-.2 5.6 3.2 5.8 7.8.1 2.2-1.1 3.5-2.8 3.5-1.8 0-3.2-1-3.2-3.2V9.8c0-1 .1-1.5.2-1.6Z" fill="currentColor" fillOpacity="0.18" />
  </svg>
);

const GastroIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M9.5 4v3.2c0 1.4-2.8 2.4-3.8 5.2-1 2.8.5 6.4 4.2 7.1 3.6.7 7.1-1.5 8-5.1.8-3.2-.6-6.2-3.3-6.7-1.4-.3-2.1.6-2.1 1.7v.6" fill="currentColor" fillOpacity="0.17" />
    <path d="M11 19.5c.3 1 .8 1.5 1.8 1.8" />
  </svg>
);

const HematologyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M12 3.5C12 3.5 6 10.2 6 14.5a6 6 0 0 0 12 0C18 10.2 12 3.5 12 3.5Z" fill="currentColor" fillOpacity="0.2" />
    <circle cx="12" cy="14.8" r="2.2" />
  </svg>
);

const DermatologyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M4 9.5c2.5-1.5 5.5-1.5 8 0s5.5 1.5 8 0" />
    <path d="M4 14c2.5-1.5 5.5-1.5 8 0s5.5 1.5 8 0" />
    <path d="M4 18.5c2.5-1.5 5.5-1.5 8 0s5.5 1.5 8 0" />
    <circle cx="12" cy="5.5" r="2" fill="currentColor" fillOpacity="0.25" />
  </svg>
);

const BoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M17.2 4.3a2.2 2.2 0 0 1 2.5 3.4 2.2 2.2 0 0 1-1.9 3.4l-6.7 6.7a2.2 2.2 0 0 1-3.4 1.9 2.2 2.2 0 0 1-3.4-2.5 2.2 2.2 0 0 1 1.9-3.4l6.7-6.7a2.2 2.2 0 0 1 3.4-1.9Z" fill="currentColor" fillOpacity="0.18" />
  </svg>
);

const PsychiatryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M12 4a6.5 6.5 0 0 0-6.5 6.5c0 2.3 1.2 4.3 3 5.5v3h7v-3c1.8-1.2 3-3.2 3-5.5A6.5 6.5 0 0 0 12 4Z" fill="currentColor" fillOpacity="0.16" />
    <path d="M8.5 11h2l1.2-2.2L13 13l1.3-2h1.7" />
  </svg>
);

const GeriatricsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="9" cy="5.5" r="2" fill="currentColor" fillOpacity="0.22" />
    <path d="M7.5 10.5c0-1.1.9-2 2-2h1.2c1.1 0 2 .8 2.2 1.9l.8 4.1" />
    <path d="M8.5 14.5 7 20.5" />
    <path d="M11 14.5 12.2 20.5" />
    <path d="M17.5 20.5V12a2 2 0 1 0-4 0" />
  </svg>
);

const UrologyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M7 4c0 2.5 2 3.8 2 6.5" />
    <path d="M17 4c0 2.5-2 3.8-2 6.5" />
    <path d="M6.5 12.2c0-2.1 2.4-3.7 5.5-3.7s5.5 1.6 5.5 3.7c0 2.6-2.3 4.8-5.5 5.3-3.2-.5-5.5-2.7-5.5-5.3Z" fill="currentColor" fillOpacity="0.18" />
    <path d="M12 17.5V21" />
  </svg>
);

export interface SpecialtyVisual {
  id: SpecialtyId;
  shortLabel: string;
  bgClass: string;
  badgeBgClass: string;
  iconClass: string;
  renderIcon: (cls: string) => React.ReactNode;
}

export const SPECIALTY_VISUALS: Record<SpecialtyId, SpecialtyVisual> = {
  'medicina-interna': {
    id: 'medicina-interna',
    shortLabel: 'Medicina Interna',
    bgClass: 'bg-sky-100/90 border-sky-200/80 dark:bg-sky-950/50 dark:border-sky-800/70',
    badgeBgClass: 'bg-sky-100 dark:bg-sky-950/70',
    iconClass: 'text-sky-700 dark:text-sky-300',
    renderIcon: (cls) => <Stethoscope className={cls} />,
  },
  cardiologia: {
    id: 'cardiologia',
    shortLabel: 'Cardiología',
    bgClass: 'bg-rose-100/90 border-rose-200/80 dark:bg-rose-950/50 dark:border-rose-800/70',
    badgeBgClass: 'bg-rose-100 dark:bg-rose-950/70',
    iconClass: 'text-rose-600 dark:text-rose-300',
    renderIcon: (cls) => <Heart className={`${cls} fill-current/20`} />,
  },
  pediatria: {
    id: 'pediatria',
    shortLabel: 'Pediatría',
    bgClass: 'bg-emerald-100/90 border-emerald-200/80 dark:bg-emerald-950/50 dark:border-emerald-800/70',
    badgeBgClass: 'bg-emerald-100 dark:bg-emerald-950/70',
    iconClass: 'text-emerald-700 dark:text-emerald-300',
    renderIcon: (cls) => <Baby className={cls} />,
  },
  'gineco-obstetricia': {
    id: 'gineco-obstetricia',
    shortLabel: 'Ginecología y Obstetricia',
    bgClass: 'bg-purple-100/90 border-purple-200/80 dark:bg-purple-950/50 dark:border-purple-800/70',
    badgeBgClass: 'bg-purple-100 dark:bg-purple-950/70',
    iconClass: 'text-purple-700 dark:text-purple-300',
    renderIcon: (cls) => <ObstetricsIcon className={cls} />,
  },
  neurologia: {
    id: 'neurologia',
    shortLabel: 'Neurología',
    bgClass: 'bg-orange-100/90 border-orange-200/80 dark:bg-orange-950/50 dark:border-orange-800/70',
    badgeBgClass: 'bg-orange-100 dark:bg-orange-950/70',
    iconClass: 'text-orange-600 dark:text-orange-300',
    renderIcon: (cls) => <Brain className={cls} />,
  },
  nefrologia: {
    id: 'nefrologia',
    shortLabel: 'Nefrología',
    bgClass: 'bg-cyan-100/90 border-cyan-200/80 dark:bg-cyan-950/50 dark:border-cyan-800/70',
    badgeBgClass: 'bg-cyan-100 dark:bg-cyan-950/70',
    iconClass: 'text-teal-700 dark:text-teal-300',
    renderIcon: (cls) => <KidneysIcon className={cls} />,
  },
  endocrinologia: {
    id: 'endocrinologia',
    shortLabel: 'Endocrinología',
    bgClass: 'bg-indigo-100/90 border-indigo-200/80 dark:bg-indigo-950/50 dark:border-indigo-800/70',
    badgeBgClass: 'bg-indigo-100 dark:bg-indigo-950/70',
    iconClass: 'text-indigo-700 dark:text-indigo-300',
    renderIcon: (cls) => <GlucometerIcon className={cls} />,
  },
  'cirugia-general': {
    id: 'cirugia-general',
    shortLabel: 'Cirugía General',
    bgClass: 'bg-blue-100/90 border-blue-200/80 dark:bg-blue-950/50 dark:border-blue-800/70',
    badgeBgClass: 'bg-blue-100 dark:bg-blue-950/70',
    iconClass: 'text-blue-700 dark:text-blue-300',
    renderIcon: (cls) => <ScalpelIcon className={cls} />,
  },
  infectologia: {
    id: 'infectologia',
    shortLabel: 'Infectología',
    bgClass: 'bg-lime-100/85 border-lime-200/80 dark:bg-emerald-950/50 dark:border-emerald-800/70',
    badgeBgClass: 'bg-lime-100 dark:bg-emerald-950/70',
    iconClass: 'text-emerald-700 dark:text-emerald-300',
    renderIcon: (cls) => <MicrobeIcon className={cls} />,
  },
  urgencias: {
    id: 'urgencias',
    shortLabel: 'Urgencias y Emergencias',
    bgClass: 'bg-red-100/90 border-red-200/80 dark:bg-red-950/50 dark:border-red-800/70',
    badgeBgClass: 'bg-red-100 dark:bg-red-950/70',
    iconClass: 'text-red-600 dark:text-red-300',
    renderIcon: (cls) => <SirenIcon className={cls} />,
  },
  neumologia: {
    id: 'neumologia',
    shortLabel: 'Neumología',
    bgClass: 'bg-teal-100/90 border-teal-200/80 dark:bg-teal-950/50 dark:border-teal-800/70',
    badgeBgClass: 'bg-teal-100 dark:bg-teal-950/70',
    iconClass: 'text-teal-700 dark:text-teal-300',
    renderIcon: (cls) => <LungsIcon className={cls} />,
  },
  gastroenterologia: {
    id: 'gastroenterologia',
    shortLabel: 'Gastroenterología',
    bgClass: 'bg-amber-100/90 border-amber-200/80 dark:bg-amber-950/50 dark:border-amber-800/70',
    badgeBgClass: 'bg-amber-100 dark:bg-amber-950/70',
    iconClass: 'text-amber-700 dark:text-amber-300',
    renderIcon: (cls) => <GastroIcon className={cls} />,
  },
  hematologia: {
    id: 'hematologia',
    shortLabel: 'Hematología',
    bgClass: 'bg-pink-100/90 border-pink-200/80 dark:bg-pink-950/50 dark:border-pink-800/70',
    badgeBgClass: 'bg-pink-100 dark:bg-pink-950/70',
    iconClass: 'text-rose-700 dark:text-rose-300',
    renderIcon: (cls) => <HematologyIcon className={cls} />,
  },
  dermatologia: {
    id: 'dermatologia',
    shortLabel: 'Dermatología y Alergología',
    bgClass: 'bg-fuchsia-100/85 border-fuchsia-200/80 dark:bg-fuchsia-950/50 dark:border-fuchsia-800/70',
    badgeBgClass: 'bg-fuchsia-100 dark:bg-fuchsia-950/70',
    iconClass: 'text-fuchsia-700 dark:text-fuchsia-300',
    renderIcon: (cls) => <DermatologyIcon className={cls} />,
  },
  traumatologia: {
    id: 'traumatologia',
    shortLabel: 'Traumatología',
    bgClass: 'bg-slate-200/80 border-slate-300/80 dark:bg-slate-800/80 dark:border-slate-700',
    badgeBgClass: 'bg-slate-200/80 dark:bg-slate-800',
    iconClass: 'text-slate-700 dark:text-slate-200',
    renderIcon: (cls) => <BoneIcon className={cls} />,
  },
  psiquiatria: {
    id: 'psiquiatria',
    shortLabel: 'Psiquiatría',
    bgClass: 'bg-violet-100/90 border-violet-200/80 dark:bg-violet-950/50 dark:border-violet-800/70',
    badgeBgClass: 'bg-violet-100 dark:bg-violet-950/70',
    iconClass: 'text-violet-700 dark:text-violet-300',
    renderIcon: (cls) => <PsychiatryIcon className={cls} />,
  },
  geriatria: {
    id: 'geriatria',
    shortLabel: 'Geriatría',
    bgClass: 'bg-yellow-100/85 border-yellow-200/80 dark:bg-yellow-950/45 dark:border-yellow-800/70',
    badgeBgClass: 'bg-yellow-100 dark:bg-yellow-950/70',
    iconClass: 'text-amber-800 dark:text-amber-300',
    renderIcon: (cls) => <GeriatricsIcon className={cls} />,
  },
  urologia: {
    id: 'urologia',
    shortLabel: 'Urología',
    bgClass: 'bg-sky-100/75 border-sky-200/80 dark:bg-sky-950/45 dark:border-sky-800/70',
    badgeBgClass: 'bg-sky-100 dark:bg-sky-950/70',
    iconClass: 'text-blue-700 dark:text-sky-300',
    renderIcon: (cls) => <UrologyIcon className={cls} />,
  },
};

export const HOME_SPECIALTY_ORDER: SpecialtyId[] = [
  'medicina-interna',
  'cardiologia',
  'pediatria',
  'gineco-obstetricia',
  'neurologia',
  'nefrologia',
  'endocrinologia',
  'cirugia-general',
  'infectologia',
  'urgencias',
  'neumologia',
  'gastroenterologia',
  'hematologia',
  'dermatologia',
  'traumatologia',
  'psiquiatria',
  'geriatria',
  'urologia',
];
