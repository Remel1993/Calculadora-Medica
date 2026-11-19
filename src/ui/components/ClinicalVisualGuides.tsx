import { Eye, Info } from 'lucide-react';
import React from 'react';
import type { CalculatorInputsState } from '../../clinical-core/types/clinical.ts';

interface ClinicalVisualGuideProps {
  calculatorId: string;
  inputs: CalculatorInputsState;
  onSelectValue: (fieldId: string, value: string) => void;
}

export const SUPPORTED_VISUAL_GUIDE_IDS = new Set<string>([
  'mallampati',
  'diabetic-foot-wagner-pedis-wifi',
  'bristol-scale',
  'tanner-stages',
  'burns-parkland',
  'neonatal-jaundice',
  'ottawa-ankle-knee',
  'fisher-modificada',
  'silverman-andersen',
]);

/* -------------------------------------------------------------------------- */
/* 1. MALLAMPATI (Clases I - IV)                                              */
/* -------------------------------------------------------------------------- */
const MallampatiGuide: React.FC<{
  selected: string;
  onSelect: (val: string) => void;
}> = ({ selected, onSelect }) => {
  const classes: Array<{
    val: string;
    title: string;
    subtitle: string;
    tone: string;
    showPillars: boolean;
    uvulaHeight: number;
    softPalateVisible: boolean;
    tongueY: number;
  }> = [
    {
      val: '1',
      title: 'Clase I',
      subtitle: 'Paladar blando, úvula, fauces y pilares visibles',
      tone: 'text-emerald-700 dark:text-emerald-300',
      showPillars: true,
      uvulaHeight: 24,
      softPalateVisible: true,
      tongueY: 66,
    },
    {
      val: '2',
      title: 'Clase II',
      subtitle: 'Paladar blando, úvula y fauces (pilares ocultos)',
      tone: 'text-sky-700 dark:text-sky-300',
      showPillars: false,
      uvulaHeight: 22,
      softPalateVisible: true,
      tongueY: 57,
    },
    {
      val: '3',
      title: 'Clase III',
      subtitle: 'Solo paladar blando y base de la úvula visibles',
      tone: 'text-amber-700 dark:text-amber-300',
      showPillars: false,
      uvulaHeight: 10,
      softPalateVisible: true,
      tongueY: 47,
    },
    {
      val: '4',
      title: 'Clase IV',
      subtitle: 'Solo paladar duro visible (paladar blando oculto)',
      tone: 'text-rose-700 dark:text-rose-300',
      showPillars: false,
      uvulaHeight: 0,
      softPalateVisible: false,
      tongueY: 36,
    },
  ];

  return (
    <GuideShell
      title="Guía anatómica visual — Clasificación de Mallampati"
      hint="Toca una ilustración para seleccionar la clase orofaríngea (paciente sentado, sin fonación)."
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {classes.map((item) => {
          const active = selected === item.val;
          return (
            <button
              key={item.val}
              type="button"
              onClick={() => onSelect(item.val)}
              aria-pressed={active}
              className={`flex flex-col items-center rounded-xl border p-2.5 text-center transition-colors ${
                active
                  ? 'border-sky-600 bg-sky-50/90 ring-2 ring-sky-500/25 dark:border-sky-500 dark:bg-sky-950/50'
                  : 'border-slate-200 bg-white hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <svg viewBox="0 0 120 96" className="h-24 w-full max-w-[130px]" aria-hidden="true">
                {/* Lips / Outer mouth */}
                <ellipse cx="60" cy="48" rx="52" ry="40" fill="#7f1d1d" stroke="#f43f5e" strokeWidth="3" />
                {/* Upper teeth */}
                <path d="M 22 24 Q 60 12 98 24 L 94 31 Q 60 22 26 31 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                {/* Hard palate */}
                <path d="M 26 30 Q 60 20 94 30 L 90 38 Q 60 29 30 38 Z" fill="#fda4af" opacity="0.7" />
                {/* Pharynx backdrop */}
                <ellipse cx="60" cy="52" rx="34" ry="22" fill="#450a0a" />
                {/* Tonsillar pillars (Class I only) */}
                {item.showPillars && (
                  <>
                    <path d="M 32 34 Q 36 52 30 68" fill="none" stroke="#fecdd3" strokeWidth="2.8" strokeLinecap="round" />
                    <path d="M 88 34 Q 84 52 90 68" fill="none" stroke="#fecdd3" strokeWidth="2.8" strokeLinecap="round" />
                    <circle cx="34" cy="56" r="4" fill="#fb7185" opacity="0.85" />
                    <circle cx="86" cy="56" r="4" fill="#fb7185" opacity="0.85" />
                  </>
                )}
                {/* Soft palate & Uvula */}
                {item.softPalateVisible && (
                  <>
                    <path
                      d="M 26 36 Q 44 30 56 38 L 64 38 Q 76 30 94 36 L 94 29 Q 60 22 26 29 Z"
                      fill="#fb7185"
                    />
                    {item.uvulaHeight > 0 && (
                      <path
                        d={`M 55 37 L 55 ${37 + item.uvulaHeight - 4} Q 60 ${37 + item.uvulaHeight + 3} 65 ${37 + item.uvulaHeight - 4} L 65 37 Z`}
                        fill="#fda4af"
                        stroke="#be123c"
                        strokeWidth="1"
                      />
                    )}
                  </>
                )}
                {/* Tongue */}
                <path
                  d={`M 18 ${item.tongueY + 12} Q 60 ${item.tongueY - 12} 102 ${item.tongueY + 12} Q 96 86 60 86 Q 24 86 18 ${item.tongueY + 12} Z`}
                  fill="#e11d48"
                  stroke="#be123c"
                  strokeWidth="1.5"
                />
                {/* Tongue median sulcus */}
                <path
                  d={`M 60 ${item.tongueY + 2} L 60 81`}
                  stroke="#9f1239"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.6"
                />
              </svg>
              <span className={`mt-1 text-xs font-bold ${item.tone}`}>{item.title}</span>
              <span className="mt-0.5 text-[10px] leading-tight text-slate-600 dark:text-slate-300">
                {item.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </GuideShell>
  );
};

/* -------------------------------------------------------------------------- */
/* 2. PIE DIABÉTICO: WAGNER (0-5) & WIfI WOUND (W0-W3)                        */
/* -------------------------------------------------------------------------- */
const DiabeticFootGuide: React.FC<{
  mode: string;
  wagnerGrade: string;
  wifiWound: string;
  onSelect: (fieldId: string, val: string) => void;
}> = ({ mode, wagnerGrade, wifiWound, onSelect }) => {
  if (mode === 'wagner') {
    const grades: Array<{
      val: string;
      title: string;
      desc: string;
      depth: number; // 0 intact, 1 dermis, 2 tendon/bone, 3 abscess/osteo, 4 toe gangrene, 5 full foot gangrene
      badge: string;
    }> = [
      { val: '0', title: 'Grado 0', desc: 'Piel intacta; pie de riesgo o deformidad', depth: 0, badge: 'text-emerald-700 dark:text-emerald-300' },
      { val: '1', title: 'Grado 1', desc: 'Úlcera superficial (epidermis / dermis)', depth: 1, badge: 'text-sky-700 dark:text-sky-300' },
      { val: '2', title: 'Grado 2', desc: 'Úlcera profunda hasta tendón, cápsula o hueso', depth: 2, badge: 'text-amber-700 dark:text-amber-300' },
      { val: '3', title: 'Grado 3', desc: 'Absceso profundo, osteomielitis o artritis', depth: 3, badge: 'text-orange-700 dark:text-orange-300' },
      { val: '4', title: 'Grado 4', desc: 'Gangrena localizada (dedos o antepié)', depth: 4, badge: 'text-rose-700 dark:text-rose-300' },
      { val: '5', title: 'Grado 5', desc: 'Gangrena extensa de todo el pie', depth: 5, badge: 'text-rose-800 dark:text-rose-300' },
    ];

    return (
      <GuideShell
        title="Esquema didáctico — Profundidad y extensión en Escala de Wagner (0–5)"
        hint="Toca un grado para seleccionarlo directamente en el formulario."
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {grades.map((g) => {
            const active = wagnerGrade === g.val;
            return (
              <button
                key={g.val}
                type="button"
                onClick={() => onSelect('wagnerGrade', g.val)}
                aria-pressed={active}
                className={`flex flex-col items-center rounded-xl border p-2.5 text-center transition-colors ${
                  active
                    ? 'border-sky-600 bg-sky-50/90 ring-2 ring-sky-500/25 dark:border-sky-500 dark:bg-sky-950/50'
                    : 'border-slate-200 bg-white hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                {g.depth <= 3 ? (
                  <svg viewBox="0 0 120 76" className="h-18 w-full max-w-[130px]" aria-hidden="true">
                    {/* Epidermis/Dermis */}
                    <rect x="6" y="14" width="108" height="12" rx="2" fill="#fed7aa" />
                    {/* Subcutaneous fat */}
                    <rect x="6" y="26" width="108" height="14" fill="#fde047" opacity="0.7" />
                    {/* Tendon / fascia */}
                    <rect x="6" y="40" width="108" height="10" fill="#e2e8f0" />
                    {/* Bone */}
                    <rect x="22" y="52" width="76" height="16" rx="6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
                    {/* Callus for Grade 0 */}
                    {g.depth === 0 && (
                      <ellipse cx="60" cy="14" rx="18" ry="4" fill="#d97706" opacity="0.55" />
                    )}
                    {/* Ulcer crater */}
                    {g.depth === 1 && (
                      <path d="M 44 14 Q 60 27 76 14 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="1.2" />
                    )}
                    {g.depth === 2 && (
                      <path d="M 42 14 L 50 48 L 70 48 L 78 14 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1.2" />
                    )}
                    {g.depth === 3 && (
                      <>
                        <path d="M 40 14 L 46 58 L 74 58 L 80 14 Z" fill="#b91c1c" />
                        <ellipse cx="60" cy="48" rx="16" ry="7" fill="#facc15" opacity="0.9" />
                        <circle cx="52" cy="59" r="3" fill="#7f1d1d" />
                        <circle cx="65" cy="60" r="3.5" fill="#7f1d1d" />
                      </>
                    )}
                  </svg>
                ) : (
                  <svg viewBox="0 0 120 76" className="h-18 w-full max-w-[130px]" aria-hidden="true">
                    {/* Foot silhouette */}
                    <path
                      d="M 24 14 L 44 14 L 48 38 L 96 48 Q 108 52 104 60 Q 98 66 76 66 L 26 64 Q 16 62 18 46 Z"
                      fill={g.depth === 5 ? '#1e293b' : '#fed7aa'}
                      stroke="#64748b"
                      strokeWidth="1.5"
                    />
                    {/* Localized gangrene on toes/forefoot */}
                    {g.depth === 4 && (
                      <path
                        d="M 76 44 L 96 48 Q 108 52 104 60 Q 98 66 76 66 Z"
                        fill="#1e293b"
                      />
                    )}
                    {/* Demarcation erythema */}
                    {g.depth === 4 && (
                      <line x1="76" y1="43" x2="76" y2="66" stroke="#dc2626" strokeWidth="2.5" strokeDasharray="3 2" />
                    )}
                  </svg>
                )}
                <span className={`mt-1 text-xs font-bold ${g.badge}`}>{g.title}</span>
                <span className="mt-0.5 text-[10px] leading-tight text-slate-600 dark:text-slate-300">
                  {g.desc}
                </span>
              </button>
            );
          })}
        </div>
      </GuideShell>
    );
  }

  if (mode === 'wifi') {
    const wounds = [
      { val: '0', title: 'W0', desc: 'Sin úlcera ni gangrena (dolor isquémico)', color: 'fill-emerald-100', lesion: 'none' },
      { val: '1', title: 'W1', desc: 'Úlcera superficial sin exposición ósea', color: 'fill-amber-200', lesion: 'small' },
      { val: '2', title: 'W2', desc: 'Úlcera profunda / hueso o gangrena digital', color: 'fill-orange-300', lesion: 'deep' },
      { val: '3', title: 'W3', desc: 'Úlcera extensa, calcánea o gangrena extensa', color: 'fill-rose-400', lesion: 'extensive' },
    ];
    return (
      <GuideShell
        title="Esquema visual — Componente Herida (W) en SVS WIfI"
        hint="Toca una categoría W para seleccionarla (combínala abajo con Isquemia I e Infección fI)."
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {wounds.map((w) => {
            const active = wifiWound === w.val;
            return (
              <button
                key={w.val}
                type="button"
                onClick={() => onSelect('wifiWound', w.val)}
                aria-pressed={active}
                className={`flex flex-col items-center rounded-xl border p-2 text-center transition-colors ${
                  active
                    ? 'border-sky-600 bg-sky-50/90 ring-2 ring-sky-500/25 dark:border-sky-500 dark:bg-sky-950/50'
                    : 'border-slate-200 bg-white hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <svg viewBox="0 0 100 62" className="h-14 w-full max-w-[110px]" aria-hidden="true">
                  <path
                    d="M 18 10 L 35 10 L 38 30 L 82 40 Q 92 43 88 50 Q 82 55 62 55 L 20 53 Q 12 52 14 38 Z"
                    fill={w.lesion === 'extensive' ? '#334155' : '#fde68a'}
                    stroke="#64748b"
                    strokeWidth="1.5"
                  />
                  {w.lesion === 'small' && <circle cx="62" cy="48" r="5" fill="#ef4444" />}
                  {w.lesion === 'deep' && (
                    <>
                      <ellipse cx="64" cy="47" rx="8" ry="5.5" fill="#b91c1c" />
                      <path d="M 78 39 L 88 43 L 88 52 L 77 54 Z" fill="#1e293b" />
                    </>
                  )}
                  {w.lesion === 'extensive' && (
                    <ellipse cx="32" cy="47" rx="10" ry="5" fill="#dc2626" />
                  )}
                </svg>
                <span className="mt-1 text-xs font-bold text-slate-900 dark:text-slate-100">{w.title}</span>
                <span className="mt-0.5 text-[10px] leading-tight text-slate-600 dark:text-slate-300">
                  {w.desc}
                </span>
              </button>
            );
          })}
        </div>
      </GuideShell>
    );
  }

  return (
    <GuideShell
      title="Referencia visual rápida — Extensión del eritema en Infección PEDIS / IWGDF"
      hint="Mide el halo de celulitis desde el borde de la úlcera: ≤ 2 cm (Grado 2 leve) vs > 2 cm o tejidos profundos (Grado 3 moderada) vs SIRS (Grado 4 grave)."
    >
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Grado 2 (Leve)', sub: 'Eritema ≤ 2 cm', r: 16, col: '#fca5a5' },
          { label: 'Grado 3 (Moderada)', sub: 'Eritema > 2 cm / hueso', r: 24, col: '#ef4444' },
          { label: 'Grado 4 (Grave)', sub: 'Cualquier foco + ≥ 2 SIRS', r: 26, col: '#991b1b' },
        ].map((g) => (
          <div key={g.label} className="rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
            <svg viewBox="0 0 80 60" className="mx-auto h-12 w-full" aria-hidden="true">
              <circle cx="40" cy="30" r={g.r} fill={g.col} opacity="0.35" stroke={g.col} strokeDasharray="3 2" />
              <circle cx="40" cy="30" r="8" fill="#b91c1c" />
            </svg>
            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{g.label}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">{g.sub}</div>
          </div>
        ))}
      </div>
    </GuideShell>
  );
};

/* -------------------------------------------------------------------------- */
/* 3. ESCALA DE BRISTOL (Tipos 1 - 7)                                         */
/* -------------------------------------------------------------------------- */
const BristolGuide: React.FC<{
  selected: string;
  onSelect: (val: string) => void;
}> = ({ selected, onSelect }) => {
  const types = [
    { val: '1', title: 'Tipo 1', desc: 'Bolas duras separadas', tag: 'Estreñimiento', tagCls: 'text-amber-700 dark:text-amber-300' },
    { val: '2', title: 'Tipo 2', desc: 'Salchicha grumosa', tag: 'Estreñimiento', tagCls: 'text-amber-700 dark:text-amber-300' },
    { val: '3', title: 'Tipo 3', desc: 'Salchicha con grietas', tag: 'Normal', tagCls: 'text-emerald-700 dark:text-emerald-300' },
    { val: '4', title: 'Tipo 4', desc: 'Lisa y blanda (ideal)', tag: 'Ideal', tagCls: 'text-emerald-700 dark:text-emerald-300' },
    { val: '5', title: 'Tipo 5', desc: 'Trozos blandos definidos', tag: 'Blanda', tagCls: 'text-sky-700 dark:text-sky-300' },
    { val: '6', title: 'Tipo 6', desc: 'Pastosa / bordes irreg.', tag: 'Diarrea', tagCls: 'text-orange-700 dark:text-orange-300' },
    { val: '7', title: 'Tipo 7', desc: 'Acuosa sin sólidos', tag: 'Diarrea', tagCls: 'text-rose-700 dark:text-rose-300' },
  ];

  const renderShape = (val: string) => {
    switch (val) {
      case '1':
        return (
          <g fill="#78350f" stroke="#451a03" strokeWidth="1.2">
            <circle cx="28" cy="24" r="6" />
            <circle cx="48" cy="18" r="5.5" />
            <circle cx="68" cy="26" r="6" />
            <circle cx="38" cy="38" r="5.5" />
            <circle cx="58" cy="40" r="6.5" />
          </g>
        );
      case '2':
        return (
          <g fill="#78350f" stroke="#451a03" strokeWidth="1.2">
            <circle cx="22" cy="30" r="8" />
            <circle cx="34" cy="26" r="9" />
            <circle cx="48" cy="31" r="8.5" />
            <circle cx="62" cy="26" r="9" />
            <circle cx="75" cy="30" r="8" />
          </g>
        );
      case '3':
        return (
          <g>
            <rect x="14" y="21" width="72" height="18" rx="9" fill="#92400e" stroke="#451a03" strokeWidth="1.2" />
            <path d="M 28 21 L 31 28 M 44 39 L 47 31 M 58 21 L 56 29 M 72 39 L 69 32" stroke="#451a03" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        );
      case '4':
        return (
          <path
            d="M 14 33 Q 32 18 52 28 Q 72 38 86 24"
            fill="none"
            stroke="#92400e"
            strokeWidth="15"
            strokeLinecap="round"
          />
        );
      case '5':
        return (
          <g fill="#a16207" stroke="#713f12" strokeWidth="1">
            <ellipse cx="26" cy="24" rx="10" ry="6.5" />
            <ellipse cx="52" cy="22" rx="11" ry="6" />
            <ellipse cx="74" cy="30" rx="9" ry="6" />
            <ellipse cx="42" cy="39" rx="10" ry="5.5" />
          </g>
        );
      case '6':
        return (
          <g fill="#b45309" opacity="0.9">
            <path d="M 16 26 Q 22 16 32 22 Q 40 28 30 34 Q 18 35 16 26 Z" />
            <path d="M 42 20 Q 56 14 62 24 Q 64 33 50 34 Q 40 31 42 20 Z" />
            <path d="M 64 29 Q 76 22 84 31 Q 84 42 70 40 Q 60 37 64 29 Z" />
            <path d="M 28 38 Q 40 33 48 41 Q 44 48 30 46 Z" />
          </g>
        );
      default:
        return (
          <g>
            <ellipse cx="50" cy="31" rx="38" ry="15" fill="#ca8a04" opacity="0.55" stroke="#a16207" strokeWidth="1.2" />
            <ellipse cx="42" cy="29" rx="22" ry="8" fill="#eab308" opacity="0.5" />
          </g>
        );
    }
  };

  return (
    <GuideShell
      title="Guía visual morfológica — Escala de Heces de Bristol"
      hint="Muestra las figuras al paciente o toca el tipo correspondiente para seleccionarlo."
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {types.map((t) => {
          const active = selected === t.val;
          return (
            <button
              key={t.val}
              type="button"
              onClick={() => onSelect(t.val)}
              aria-pressed={active}
              className={`flex flex-col items-center rounded-xl border p-2 text-center transition-colors ${
                active
                  ? 'border-sky-600 bg-sky-50/90 ring-2 ring-sky-500/25 dark:border-sky-500 dark:bg-sky-950/50'
                  : 'border-slate-200 bg-white hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <svg viewBox="0 0 100 54" className="h-14 w-full max-w-[110px]" aria-hidden="true">
                {renderShape(t.val)}
              </svg>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{t.title}</span>
              <span className={`text-[10px] font-semibold ${t.tagCls}`}>{t.tag}</span>
              <span className="mt-0.5 text-[10px] leading-tight text-slate-500 dark:text-slate-400">
                {t.desc}
              </span>
            </button>
          );
        })}
      </div>
    </GuideShell>
  );
};

/* -------------------------------------------------------------------------- */
/* 4. ESTADIOS DE TANNER (I - V)                                              */
/* -------------------------------------------------------------------------- */
const TannerGuide: React.FC<{
  sex: string;
  primaryStage: string;
  pubicStage: string;
  onSelect: (fieldId: string, val: string) => void;
}> = ({ sex, primaryStage, pubicStage, onSelect }) => {
  const isFemale = sex !== 'male';
  const primaryField = isFemale ? 'breastStage' : 'genitalStage';
  const primaryStages = isFemale
    ? [
        { val: '1', label: 'B1', desc: 'Solo papila', r: 4, bud: false, doubleContour: false, mature: false },
        { val: '2', label: 'B2', desc: 'Botón mamario', r: 9, bud: true, doubleContour: false, mature: false },
        { val: '3', label: 'B3', desc: 'Contorno continuo', r: 15, bud: false, doubleContour: false, mature: false },
        { val: '4', label: 'B4', desc: 'Doble contorno', r: 18, bud: false, doubleContour: true, mature: false },
        { val: '5', label: 'B5', desc: 'Contorno adulto', r: 22, bud: false, doubleContour: false, mature: true },
      ]
    : [
        { val: '1', label: 'G1', desc: '< 4 mL infantil', scale: 0.55 },
        { val: '2', label: 'G2', desc: '≥ 4 mL escrotal', scale: 0.68 },
        { val: '3', label: 'G3', desc: '8–12 mL elong.', scale: 0.8 },
        { val: '4', label: 'G4', desc: '12–15 mL glande', scale: 0.92 },
        { val: '5', label: 'G5', desc: '≥ 15–25 mL adulto', scale: 1.04 },
      ];

  const pubicStages = [
    { val: '1', label: 'P1', desc: 'Sin vello terminal', density: 0 },
    { val: '2', label: 'P2', desc: 'Escaso en base/labios', density: 1 },
    { val: '3', label: 'P3', desc: 'Oscuro sobre pubis', density: 2 },
    { val: '4', label: 'P4', desc: 'Denso sin muslos', density: 3 },
    { val: '5', label: 'P5', desc: 'Triángulo adulto', density: 4 },
  ];

  return (
    <GuideShell
      title={`Esquema clínico — Estadios de Tanner (${isFemale ? 'Femenino B1–B5 / P1–P5' : 'Masculino G1–G5 / P1–P5'})`}
      hint="Toca cualquier estadio en las filas esquemáticas para seleccionarlo."
    >
      <div className="space-y-3">
        <div>
          <div className="mb-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            {isFemale ? 'Desarrollo mamario (B1–B5)' : 'Desarrollo genital y volumen testicular (G1–G5)'}
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {primaryStages.map((st) => {
              const active = primaryStage === st.val;
              return (
                <button
                  key={st.val}
                  type="button"
                  onClick={() => onSelect(primaryField, st.val)}
                  aria-pressed={active}
                  className={`flex flex-col items-center rounded-xl border p-1.5 text-center transition-colors ${
                    active
                      ? 'border-sky-600 bg-sky-50/90 ring-2 ring-sky-500/25 dark:border-sky-500 dark:bg-sky-950/50'
                      : 'border-slate-200 bg-white hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  {isFemale ? (
                    <svg viewBox="0 0 60 54" className="h-12 w-full" aria-hidden="true">
                      {/* Schematic lateral chest profile */}
                      <line x1="16" y1="6" x2="16" y2="48" stroke="#94a3b8" strokeWidth="2" />
                      {st.val === '1' && <path d="M 16 24 L 20 27 L 16 30" fill="#f472b6" />}
                      {st.val === '2' && (
                        <>
                          <path d="M 16 18 Q 27 27 16 36 Z" fill="#fbcfe8" stroke="#db2777" strokeWidth="1.2" />
                          <circle cx="22" cy="27" r="2.2" fill="#be185d" />
                        </>
                      )}
                      {st.val === '3' && (
                        <>
                          <path d="M 16 14 Q 35 27 16 40 Z" fill="#fbcfe8" stroke="#db2777" strokeWidth="1.2" />
                          <circle cx="26" cy="27" r="2.5" fill="#be185d" />
                        </>
                      )}
                      {st.val === '4' && (
                        <>
                          <path d="M 16 11 Q 38 25 16 43 Z" fill="#fbcfe8" stroke="#db2777" strokeWidth="1.2" />
                          <path d="M 28 21 Q 36 27 28 33" fill="#f472b6" stroke="#be185d" strokeWidth="1.2" />
                        </>
                      )}
                      {st.val === '5' && (
                        <>
                          <path d="M 16 9 Q 45 27 16 45 Z" fill="#fbcfe8" stroke="#db2777" strokeWidth="1.2" />
                          <circle cx="32" cy="27" r="2.5" fill="#be185d" />
                        </>
                      )}
                    </svg>
                  ) : (
                    <svg viewBox="0 0 60 54" className="h-12 w-full" aria-hidden="true">
                      {/* Schematic Prader orchidometer ellipsoid + volume reference */}
                      <g transform={`translate(30,27) scale(${(st as { scale: number }).scale})`}>
                        <ellipse cx="-6" cy="4" rx="8" ry="12" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.6" />
                        <ellipse cx="7" cy="4" rx="8" ry="12" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.6" />
                        <rect x="-3.5" y="-14" width="7" height="16" rx="3.5" fill="#bae6fd" stroke="#0369a1" strokeWidth="1.5" />
                      </g>
                    </svg>
                  )}
                  <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100">{st.label}</span>
                  <span className="text-[9px] leading-tight text-slate-500 dark:text-slate-400">{st.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Distribución esquemática de vello púbico (P1–P5)
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {pubicStages.map((p) => {
              const active = pubicStage === p.val;
              return (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => onSelect('pubicHairStage', p.val)}
                  aria-pressed={active}
                  className={`flex flex-col items-center rounded-xl border p-1.5 text-center transition-colors ${
                    active
                      ? 'border-sky-600 bg-sky-50/90 ring-2 ring-sky-500/25 dark:border-sky-500 dark:bg-sky-950/50'
                      : 'border-slate-200 bg-white hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <svg viewBox="0 0 60 44" className="h-10 w-full" aria-hidden="true">
                    <path d="M 10 8 L 50 8 L 42 36 L 30 40 L 18 36 Z" fill="#fef3c7" stroke="#cbd5e1" strokeWidth="1" />
                    {p.density >= 1 && (
                      <path d="M 27 30 L 29 35 M 31 30 L 33 35" stroke="#334155" strokeWidth="1.4" strokeLinecap="round" />
                    )}
                    {p.density >= 2 && (
                      <path d="M 23 23 Q 30 27 37 23 L 33 35 L 27 35 Z" fill="#475569" opacity="0.65" />
                    )}
                    {p.density >= 3 && (
                      <path d="M 18 16 L 42 16 L 34 36 L 26 36 Z" fill="#334155" opacity="0.82" />
                    )}
                    {p.density >= 4 && (
                      <path d="M 15 15 L 45 15 L 38 38 L 30 39 L 22 38 Z" fill="#1e293b" opacity="0.92" />
                    )}
                  </svg>
                  <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100">{p.label}</span>
                  <span className="text-[9px] leading-tight text-slate-500 dark:text-slate-400">{p.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </GuideShell>
  );
};

/* -------------------------------------------------------------------------- */
/* 5. REGLA DE LOS 9 DE WALLACE (Quemaduras)                                  */
/* -------------------------------------------------------------------------- */
const BurnsWallaceGuide: React.FC<{
  inputs: CalculatorInputsState;
  onSelect: (fieldId: string, val: string) => void;
}> = ({ inputs, onSelect }) => {
  const num = (k: string) => Number(inputs[k] || 0);
  const totalTbsa =
    num('head') +
    num('antTrunk') +
    num('postTrunk') +
    num('rightArm') +
    num('leftArm') +
    num('rightLeg') +
    num('leftLeg') +
    num('perineum');

  const cycle = (fieldId: string, values: string[]) => {
    const curr = String(inputs[fieldId] ?? '0');
    const idx = values.indexOf(curr);
    const next = values[(idx + 1) % values.length];
    onSelect(fieldId, next);
  };

  const regionFill = (val: number, max: number) => {
    if (val <= 0) return 'fill-slate-200 dark:fill-slate-700';
    if (val < max) return 'fill-amber-400 dark:fill-amber-500';
    return 'fill-rose-500 dark:fill-rose-500';
  };

  return (
    <GuideShell
      title={`Mapa corporal interactivo — Regla de los 9 de Wallace (${totalTbsa} % SCQ)`}
      hint="Toca cada región del esquema anterior o posterior para alternar 0 % / parcial / completo (solo 2.º y 3.º grado en adultos)."
    >
      <div className="grid grid-cols-2 gap-3">
        {/* Anterior View */}
        <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
          <span className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Vista Anterior
          </span>
          <svg viewBox="0 0 160 220" className="h-44 w-full max-w-[160px]" aria-label="Esquema corporal anterior Regla de los 9">
            {/* Head */}
            <circle
              cx="80"
              cy="22"
              r="16"
              onClick={() => cycle('head', ['0', '4.5', '9'])}
              className={`cursor-pointer stroke-slate-600 transition-colors ${regionFill(num('head'), 9)}`}
              strokeWidth="1.5"
            />
            <text x="80" y="25" textAnchor="middle" className="pointer-events-none fill-slate-900 text-[9px] font-bold">9%</text>

            {/* Anterior Trunk */}
            <rect
              x="54"
              y="42"
              width="52"
              height="68"
              rx="8"
              onClick={() => cycle('antTrunk', ['0', '9', '18'])}
              className={`cursor-pointer stroke-slate-600 transition-colors ${regionFill(num('antTrunk'), 18)}`}
              strokeWidth="1.5"
            />
            <text x="80" y="79" textAnchor="middle" className="pointer-events-none fill-slate-900 text-[10px] font-bold">18%</text>

            {/* Right Arm (patient right = viewer left) */}
            <rect
              x="26"
              y="44"
              width="22"
              height="68"
              rx="8"
              onClick={() => cycle('rightArm', ['0', '4.5', '9'])}
              className={`cursor-pointer stroke-slate-600 transition-colors ${regionFill(num('rightArm'), 9)}`}
              strokeWidth="1.5"
            />
            <text x="37" y="80" textAnchor="middle" className="pointer-events-none fill-slate-900 text-[8.5px] font-bold">9%</text>

            {/* Left Arm */}
            <rect
              x="112"
              y="44"
              width="22"
              height="68"
              rx="8"
              onClick={() => cycle('leftArm', ['0', '4.5', '9'])}
              className={`cursor-pointer stroke-slate-600 transition-colors ${regionFill(num('leftArm'), 9)}`}
              strokeWidth="1.5"
            />
            <text x="123" y="80" textAnchor="middle" className="pointer-events-none fill-slate-900 text-[8.5px] font-bold">9%</text>

            {/* Perineum */}
            <polygon
              points="72,110 88,110 80,124"
              onClick={() => cycle('perineum', ['0', '1'])}
              className={`cursor-pointer stroke-slate-600 transition-colors ${regionFill(num('perineum'), 1)}`}
              strokeWidth="1.5"
            />
            <text x="80" y="133" textAnchor="middle" className="pointer-events-none fill-slate-600 dark:fill-slate-300 text-[8px] font-bold">1%</text>

            {/* Right Leg */}
            <rect
              x="54"
              y="116"
              width="22"
              height="90"
              rx="8"
              onClick={() => cycle('rightLeg', ['0', '9', '18'])}
              className={`cursor-pointer stroke-slate-600 transition-colors ${regionFill(num('rightLeg'), 18)}`}
              strokeWidth="1.5"
            />
            <text x="65" y="164" textAnchor="middle" className="pointer-events-none fill-slate-900 text-[9px] font-bold">18%</text>

            {/* Left Leg */}
            <rect
              x="84"
              y="116"
              width="22"
              height="90"
              rx="8"
              onClick={() => cycle('leftLeg', ['0', '9', '18'])}
              className={`cursor-pointer stroke-slate-600 transition-colors ${regionFill(num('leftLeg'), 18)}`}
              strokeWidth="1.5"
            />
            <text x="95" y="164" textAnchor="middle" className="pointer-events-none fill-slate-900 text-[9px] font-bold">18%</text>
          </svg>
        </div>

        {/* Posterior View */}
        <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
          <span className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Vista Posterior
          </span>
          <svg viewBox="0 0 160 220" className="h-44 w-full max-w-[160px]" aria-label="Esquema corporal posterior Regla de los 9">
            <circle
              cx="80"
              cy="22"
              r="16"
              onClick={() => cycle('head', ['0', '4.5', '9'])}
              className={`cursor-pointer stroke-slate-600 transition-colors ${regionFill(num('head'), 9)}`}
              strokeWidth="1.5"
            />
            <text x="80" y="25" textAnchor="middle" className="pointer-events-none fill-slate-900 text-[9px] font-bold">Cabeza</text>

            {/* Posterior Trunk */}
            <rect
              x="54"
              y="42"
              width="52"
              height="68"
              rx="8"
              onClick={() => cycle('postTrunk', ['0', '9', '18'])}
              className={`cursor-pointer stroke-slate-600 transition-colors ${regionFill(num('postTrunk'), 18)}`}
              strokeWidth="1.5"
            />
            <text x="80" y="79" textAnchor="middle" className="pointer-events-none fill-slate-900 text-[10px] font-bold">18%</text>

            {/* Left Arm (posterior left) */}
            <rect
              x="26"
              y="44"
              width="22"
              height="68"
              rx="8"
              onClick={() => cycle('leftArm', ['0', '4.5', '9'])}
              className={`cursor-pointer stroke-slate-600 transition-colors ${regionFill(num('leftArm'), 9)}`}
              strokeWidth="1.5"
            />
            {/* Right Arm */}
            <rect
              x="112"
              y="44"
              width="22"
              height="68"
              rx="8"
              onClick={() => cycle('rightArm', ['0', '4.5', '9'])}
              className={`cursor-pointer stroke-slate-600 transition-colors ${regionFill(num('rightArm'), 9)}`}
              strokeWidth="1.5"
            />
            {/* Legs */}
            <rect
              x="54"
              y="116"
              width="22"
              height="90"
              rx="8"
              onClick={() => cycle('leftLeg', ['0', '9', '18'])}
              className={`cursor-pointer stroke-slate-600 transition-colors ${regionFill(num('leftLeg'), 18)}`}
              strokeWidth="1.5"
            />
            <rect
              x="84"
              y="116"
              width="22"
              height="90"
              rx="8"
              onClick={() => cycle('rightLeg', ['0', '9', '18'])}
              className={`cursor-pointer stroke-slate-600 transition-colors ${regionFill(num('rightLeg'), 18)}`}
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-xs bg-slate-300 dark:bg-slate-600" /> 0 %</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-xs bg-amber-400" /> Parcial</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-xs bg-rose-500" /> Completa</span>
      </div>
    </GuideShell>
  );
};

/* -------------------------------------------------------------------------- */
/* 6. ICTERICIA NEONATAL — ZONAS DE KRAMER (1 - 5)                            */
/* -------------------------------------------------------------------------- */
const KramerGuide: React.FC<{
  selected: string;
  onSelect: (val: string) => void;
}> = ({ selected, onSelect }) => {
  const zones = [
    { val: '1', title: 'Zona 1', desc: 'Cabeza y cuello (~4–8 mg/dL)' },
    { val: '2', title: 'Zona 2', desc: 'Hasta ombligo (~5–12 mg/dL)' },
    { val: '3', title: 'Zona 3', desc: 'Abdomen y muslos (~8–16 mg/dL)' },
    { val: '4', title: 'Zona 4', desc: 'Brazos y piernas (~11–18 mg/dL)' },
    { val: '5', title: 'Zona 5', desc: 'Palmas y plantas (> 15–20 mg/dL)' },
  ];

  return (
    <GuideShell
      title="Progresión cefalocaudal visual — Zonas de Kramer"
      hint="Toca hasta dónde se extiende la ictericia dérmica (siempre confirmar con BST/TcB)."
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {zones.map((z) => {
          const zNum = Number(z.val);
          const active = selected === z.val;
          const icteric = '#facc15';
          const normal = '#fce7f3';
          return (
            <button
              key={z.val}
              type="button"
              onClick={() => onSelect(z.val)}
              aria-pressed={active}
              className={`flex flex-col items-center rounded-xl border p-2 text-center transition-colors ${
                active
                  ? 'border-sky-600 bg-sky-50/90 ring-2 ring-sky-500/25 dark:border-sky-500 dark:bg-sky-950/50'
                  : 'border-slate-200 bg-white hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <svg viewBox="0 0 80 100" className="h-20 w-full max-w-[84px]" aria-hidden="true">
                {/* Head (Zone 1+) */}
                <circle cx="40" cy="18" r="12" fill={icteric} stroke="#94a3b8" strokeWidth="1.2" />
                {/* Upper trunk (Zone 2+) */}
                <rect x="27" y="31" width="26" height="17" rx="3" fill={zNum >= 2 ? icteric : normal} stroke="#94a3b8" strokeWidth="1" />
                {/* Lower trunk + thighs (Zone 3+) */}
                <rect x="27" y="48" width="26" height="15" rx="2" fill={zNum >= 3 ? icteric : normal} stroke="#94a3b8" strokeWidth="1" />
                <rect x="28" y="63" width="10" height="14" rx="3" fill={zNum >= 3 ? icteric : normal} stroke="#94a3b8" strokeWidth="1" />
                <rect x="42" y="63" width="10" height="14" rx="3" fill={zNum >= 3 ? icteric : normal} stroke="#94a3b8" strokeWidth="1" />
                {/* Arms & lower legs (Zone 4+) */}
                <rect x="16" y="33" width="9" height="24" rx="4" fill={zNum >= 4 ? icteric : normal} stroke="#94a3b8" strokeWidth="1" />
                <rect x="55" y="33" width="9" height="24" rx="4" fill={zNum >= 4 ? icteric : normal} stroke="#94a3b8" strokeWidth="1" />
                <rect x="29" y="77" width="8" height="13" rx="3" fill={zNum >= 4 ? icteric : normal} stroke="#94a3b8" strokeWidth="1" />
                <rect x="43" y="77" width="8" height="13" rx="3" fill={zNum >= 4 ? icteric : normal} stroke="#94a3b8" strokeWidth="1" />
                {/* Palms & soles (Zone 5) */}
                <circle cx="20.5" cy="59" r="4" fill={zNum >= 5 ? '#eab308' : normal} stroke="#94a3b8" strokeWidth="1" />
                <circle cx="59.5" cy="59" r="4" fill={zNum >= 5 ? '#eab308' : normal} stroke="#94a3b8" strokeWidth="1" />
                <ellipse cx="33" cy="93" rx="5.5" ry="3.5" fill={zNum >= 5 ? '#eab308' : normal} stroke="#94a3b8" strokeWidth="1" />
                <ellipse cx="47" cy="93" rx="5.5" ry="3.5" fill={zNum >= 5 ? '#eab308' : normal} stroke="#94a3b8" strokeWidth="1" />
              </svg>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{z.title}</span>
              <span className="mt-0.5 text-[10px] leading-tight text-slate-600 dark:text-slate-300">
                {z.desc}
              </span>
            </button>
          );
        })}
      </div>
    </GuideShell>
  );
};

/* -------------------------------------------------------------------------- */
/* 7. REGLAS DE OTTAWA (Tobillo/Pie vs Rodilla)                               */
/* -------------------------------------------------------------------------- */
const OttawaGuide: React.FC<{ region: string }> = ({ region }) => {
  const isKnee = region === 'knee';

  return (
    <GuideShell
      title={isKnee ? 'Puntos anatómicos de palpación — Ottawa Rodilla' : 'Zonas óseas de palpación — Ottawa Tobillo y Pie'}
      hint={
        isKnee
          ? 'Palpa la rótula aislada y la cabeza del peroné; verifica si flexiona ≥ 90° y si da 4 pasos.'
          : 'Palpa los 6 cm distales posteriores y punta de ambos maléolos, la base del 5.º metatarsiano y el navicular.'
      }
    >
      {isKnee ? (
        <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <svg viewBox="0 0 220 120" className="h-32 w-full max-w-[260px]" aria-hidden="true">
            {/* Femur + Tibia + Fibula schematic */}
            <path d="M 88 8 L 88 52 Q 86 60 95 60 L 114 60 Q 123 60 121 52 L 121 8" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.8" />
            <path d="M 90 66 L 90 112 L 118 112 L 118 66 Q 104 62 90 66 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.8" />
            {/* Fibula + fibular head */}
            <path d="M 74 72 L 74 112 L 84 112 L 84 72 Z" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
            <circle cx="79" cy="70" r="8" fill="#fef08a" stroke="#dc2626" strokeWidth="2" />
            {/* Patella */}
            <ellipse cx="105" cy="48" rx="12" ry="14" fill="#fef08a" stroke="#dc2626" strokeWidth="2" />
            <text x="124" y="49" className="fill-rose-700 dark:fill-rose-400 text-[9px] font-bold">Rótula aislada</text>
            <text x="6" y="73" className="fill-rose-700 dark:fill-rose-400 text-[9px] font-bold">Cabeza peroné</text>
          </svg>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              Cara Lateral (Maléolo ext. + 5.º MTT)
            </span>
            <svg viewBox="0 0 200 120" className="h-28 w-full max-w-[220px]" aria-hidden="true">
              {/* Lateral ankle & foot silhouette */}
              <path d="M 55 12 L 85 12 L 90 66 L 165 90 Q 178 96 170 106 L 44 106 Q 36 96 48 80 Z" fill="#f8fafc" stroke="#64748b" strokeWidth="1.6" />
              {/* Posterior 6cm malleolus zone */}
              <path d="M 57 32 L 57 74" stroke="#dc2626" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
              <circle cx="67" cy="74" r="6" fill="#fef08a" stroke="#dc2626" strokeWidth="2" />
              {/* Base of 5th metatarsal */}
              <circle cx="118" cy="96" r="6" fill="#fef08a" stroke="#0284c7" strokeWidth="2" />
              <text x="6" y="45" className="fill-rose-700 text-[8.5px] font-bold">6 cm post.</text>
              <text x="127" y="99" className="fill-sky-700 text-[8.5px] font-bold">Base 5.º MTT</text>
            </svg>
          </div>

          <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              Cara Medial (Maléolo int. + Navicular)
            </span>
            <svg viewBox="0 0 200 120" className="h-28 w-full max-w-[220px]" aria-hidden="true">
              <path d="M 55 12 L 85 12 L 90 66 L 165 90 Q 178 96 170 106 L 44 106 Q 36 96 48 80 Z" fill="#f8fafc" stroke="#64748b" strokeWidth="1.6" />
              <path d="M 57 32 L 57 72" stroke="#dc2626" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
              <circle cx="69" cy="72" r="6" fill="#fef08a" stroke="#dc2626" strokeWidth="2" />
              {/* Navicular */}
              <circle cx="108" cy="83" r="6" fill="#fef08a" stroke="#0284c7" strokeWidth="2" />
              <text x="6" y="45" className="fill-rose-700 text-[8.5px] font-bold">6 cm post.</text>
              <text x="116" y="80" className="fill-sky-700 text-[8.5px] font-bold">Navicular</text>
            </svg>
          </div>
        </div>
      )}
    </GuideShell>
  );
};

/* -------------------------------------------------------------------------- */
/* 8. ESCALA DE FISHER MODIFICADA (TC Axial HSA 0 - 4)                        */
/* -------------------------------------------------------------------------- */
const FisherModificadaGuide: React.FC<{
  selected: string;
  onSelect: (val: string) => void;
}> = ({ selected, onSelect }) => {
  const grades = [
    { val: '0', title: 'Grado 0', desc: 'Sin sangre en TC', cisternal: 'none', ivh: false },
    { val: '1', title: 'Grado 1', desc: 'HSA fina <1 mm sin HIV', cisternal: 'thin', ivh: false },
    { val: '2', title: 'Grado 2', desc: 'HSA fina <1 mm + HIV', cisternal: 'thin', ivh: true },
    { val: '3', title: 'Grado 3', desc: 'HSA gruesa ≥1 mm sin HIV', cisternal: 'thick', ivh: false },
    { val: '4', title: 'Grado 4', desc: 'HSA gruesa ≥1 mm + HIV', cisternal: 'thick', ivh: true },
  ];

  return (
    <GuideShell
      title="Esquema TC craneal axial — Escala de Fisher Modificada"
      hint="Toca la imagen de TC esquemática correspondiente (blanco brillante = sangre aguda hiperdensa)."
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {grades.map((g) => {
          const active = selected === g.val;
          return (
            <button
              key={g.val}
              type="button"
              onClick={() => onSelect(g.val)}
              aria-pressed={active}
              className={`flex flex-col items-center rounded-xl border p-2 text-center transition-colors ${
                active
                  ? 'border-sky-600 bg-sky-50/90 ring-2 ring-sky-500/25 dark:border-sky-500 dark:bg-sky-950/50'
                  : 'border-slate-200 bg-white hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <svg viewBox="0 0 80 86" className="h-20 w-full max-w-[84px]" aria-hidden="true">
                {/* Skull outer bone */}
                <ellipse cx="40" cy="43" rx="31" ry="37" fill="#334155" stroke="#f8fafc" strokeWidth="3.5" />
                {/* Parenchyma */}
                <ellipse cx="40" cy="43" rx="27" ry="33" fill="#475569" />
                {/* Basal cistern star */}
                {g.cisternal === 'thin' && (
                  <path
                    d="M 40 31 L 43 40 L 54 43 L 43 46 L 40 55 L 37 46 L 26 43 L 37 40 Z"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                  />
                )}
                {g.cisternal === 'thick' && (
                  <path
                    d="M 40 28 L 45 38 L 58 43 L 45 48 L 40 58 L 35 48 L 22 43 L 35 38 Z"
                    fill="#ffffff"
                  />
                )}
                {/* Lateral ventricles */}
                <path
                  d="M 33 24 Q 37 32 34 38 Q 29 33 33 24 Z M 47 24 Q 43 32 46 38 Q 51 33 47 24 Z"
                  fill={g.ivh ? '#ffffff' : '#0f172a'}
                />
                {/* Occipital horns */}
                <path
                  d="M 31 54 L 35 64 L 27 61 Z M 49 54 L 45 64 L 53 61 Z"
                  fill={g.ivh ? '#ffffff' : '#0f172a'}
                />
              </svg>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{g.title}</span>
              <span className="mt-0.5 text-[10px] leading-tight text-slate-600 dark:text-slate-300">
                {g.desc}
              </span>
            </button>
          );
        })}
      </div>
    </GuideShell>
  );
};

/* -------------------------------------------------------------------------- */
/* 9. SILVERMAN-ANDERSEN (Guía visual neonatal 0 = normal vs 2 = grave)       */
/* -------------------------------------------------------------------------- */
const SilvermanGuide: React.FC = () => (
  <GuideShell
    title="Guía visual de inspección neonatal — Silverman-Andersen"
    hint="Recuerda: 0 puntos = respiración normal sin esfuerzo; 2 puntos por parámetro = máximo distrés (total 10 = grave)."
  >
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {[
        {
          title: 'Disociación TA (2)',
          desc: '«En balancín»: hunde tórax al subir abdomen',
          svg: (
            <svg viewBox="0 0 90 54" className="h-12 w-full" aria-hidden="true">
              <path d="M 10 34 Q 30 40 46 28 Q 66 14 82 28" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
              <path d="M 28 16 L 28 28 M 24 24 L 28 28 L 32 24" stroke="#0284c7" strokeWidth="1.8" fill="none" />
              <path d="M 64 34 L 64 20 M 60 24 L 64 20 L 68 24" stroke="#dc2626" strokeWidth="1.8" fill="none" />
            </svg>
          ),
        },
        {
          title: 'Tiraje intercostal',
          desc: 'Hundimiento visible entre costillas al inspirar',
          svg: (
            <svg viewBox="0 0 90 54" className="h-12 w-full" aria-hidden="true">
              <path d="M 18 14 Q 45 20 72 14" stroke="#475569" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M 18 27 Q 45 33 72 27" stroke="#475569" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M 18 40 Q 45 46 72 40" stroke="#475569" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M 28 21 L 62 21 M 28 34 L 62 34" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="3 2" />
            </svg>
          ),
        },
        {
          title: 'Retracción xifoidea',
          desc: 'Depresión marcada bajo el apéndice xifoides',
          svg: (
            <svg viewBox="0 0 90 54" className="h-12 w-full" aria-hidden="true">
              <path d="M 38 8 L 38 28 L 45 35 L 52 28 L 52 8" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
              <circle cx="45" cy="39" r="7" fill="#fecaca" stroke="#dc2626" strokeWidth="2" />
            </svg>
          ),
        },
        {
          title: 'Aleteo nasal',
          desc: 'Apertura / dilatación de narinas en inspiración',
          svg: (
            <svg viewBox="0 0 90 54" className="h-12 w-full" aria-hidden="true">
              <path d="M 45 10 L 38 34 Q 32 42 40 42 L 50 42 Q 58 42 52 34 Z" fill="#fed7aa" stroke="#475569" strokeWidth="1.5" />
              <path d="M 26 37 L 34 37 M 64 37 L 56 37" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ),
        },
      ].map((card) => (
        <div
          key={card.title}
          className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-2 text-center dark:border-slate-800 dark:bg-slate-900"
        >
          {card.svg}
          <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100">{card.title}</span>
          <span className="mt-0.5 text-[10px] leading-tight text-slate-500 dark:text-slate-400">{card.desc}</span>
        </div>
      ))}
    </div>
  </GuideShell>
);

/* -------------------------------------------------------------------------- */
/* Shared Wrapper                                                             */
/* -------------------------------------------------------------------------- */
const GuideShell: React.FC<{
  title: string;
  hint: string;
  children: React.ReactNode;
}> = ({ title, hint, children }) => (
  <section className="w-full min-w-0 rounded-xl border border-sky-200/90 bg-sky-50/45 p-3 sm:rounded-2xl sm:p-4 dark:border-sky-900/60 dark:bg-sky-950/20">
    <div className="mb-2.5 flex items-start gap-2">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-900/70 dark:text-sky-300">
        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h3 className="text-xs font-bold text-slate-900 sm:text-sm dark:text-slate-100">
          {title}
        </h3>
        <p className="mt-0.5 flex items-start gap-1 text-[11px] leading-snug text-slate-600 dark:text-slate-400">
          <Info className="mt-0.5 h-3 w-3 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden="true" />
          <span>{hint}</span>
        </p>
      </div>
    </div>
    {children}
  </section>
);

export const ClinicalVisualGuide: React.FC<ClinicalVisualGuideProps> = ({
  calculatorId,
  inputs,
  onSelectValue,
}) => {
  switch (calculatorId) {
    case 'mallampati':
      return (
        <MallampatiGuide
          selected={String(inputs.mallampatiClass ?? '1')}
          onSelect={(val) => onSelectValue('mallampatiClass', val)}
        />
      );
    case 'diabetic-foot-wagner-pedis-wifi':
      return (
        <DiabeticFootGuide
          mode={String(inputs.scaleMode ?? 'wifi')}
          wagnerGrade={String(inputs.wagnerGrade ?? '1')}
          wifiWound={String(inputs.wifiWound ?? '1')}
          onSelect={onSelectValue}
        />
      );
    case 'bristol-scale':
      return (
        <BristolGuide
          selected={String(inputs.bristolType ?? '4')}
          onSelect={(val) => onSelectValue('bristolType', val)}
        />
      );
    case 'tanner-stages': {
      const sex = String(inputs.sex ?? 'female');
      return (
        <TannerGuide
          sex={sex}
          primaryStage={String(sex === 'male' ? inputs.genitalStage ?? '1' : inputs.breastStage ?? '1')}
          pubicStage={String(inputs.pubicHairStage ?? '1')}
          onSelect={onSelectValue}
        />
      );
    }
    case 'burns-parkland':
      return <BurnsWallaceGuide inputs={inputs} onSelect={onSelectValue} />;
    case 'neonatal-jaundice':
      return (
        <KramerGuide
          selected={String(inputs.kramerZone ?? '1')}
          onSelect={(val) => onSelectValue('kramerZone', val)}
        />
      );
    case 'ottawa-ankle-knee':
      return <OttawaGuide region={String(inputs.region ?? 'ankle_foot')} />;
    case 'fisher-modificada':
      return (
        <FisherModificadaGuide
          selected={String(inputs.grade ?? '1')}
          onSelect={(val) => onSelectValue('grade', val)}
        />
      );
    case 'silverman-andersen':
      return <SilvermanGuide />;
    default:
      return null;
  }
};
