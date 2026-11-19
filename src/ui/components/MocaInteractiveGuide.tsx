import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eraser,
  Eye,
  EyeOff,
  Pause,
  Play,
  RotateCcw,
  Timer,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import type { CalculatorInputsState, NumberInputValue } from '../../clinical-core/types/clinical.ts';

interface MocaInteractiveGuideProps {
  inputs: CalculatorInputsState;
  resetCounter: number;
  onUpdateNumber: (fieldId: string, value: string) => void;
  onUpdateBoolean: (fieldId: string, value: boolean) => void;
}

const TRAIL_NODES: Array<{ id: string; x: number; y: number }> = [
  { id: '1', x: 52, y: 146 },
  { id: 'A', x: 108, y: 54 },
  { id: '2', x: 178, y: 122 },
  { id: 'B', x: 242, y: 48 },
  { id: '3', x: 274, y: 148 },
  { id: 'C', x: 196, y: 174 },
  { id: '4', x: 112, y: 162 },
  { id: 'D', x: 54, y: 84 },
  { id: '5', x: 160, y: 42 },
  { id: 'E', x: 266, y: 96 },
];

const EXPECTED_TRAIL = ['1', 'A', '2', 'B', '3', 'C', '4', 'D', '5', 'E'];

const MEMORY_WORDS = ['ROSTRO', 'SEDA', 'IGLESIA', 'CLAVEL', 'ROJO'];

const STEPS = [
  { id: 0, short: '1. Visuo', title: '1. Visuoespacial / Ejecutiva (0–5 pts)' },
  { id: 1, short: '2. Animales', title: '2. Identificación / Denominación (0–3 pts)' },
  { id: 2, short: '3. Atención', title: '3. Memoria inmediata y Atención (0–6 pts)' },
  { id: 3, short: '4. Lenguaje', title: '4. Lenguaje y Fluidez (0–3 pts)' },
  { id: 4, short: '5. Abstrac.', title: '5. Abstracción (0–2 pts)' },
  { id: 5, short: '6. Recuerdo', title: '6. Recuerdo diferido sin pistas (0–5 pts)' },
  { id: 6, short: '7. Orient.', title: '7. Orientación y Escolaridad (0–6 pts)' },
];

const LionSvg: React.FC = () => (
  <svg
    viewBox="0 0 220 150"
    className="mx-auto h-36 w-full max-w-[240px] sm:h-44"
    role="img"
    aria-label="Ilustración lineal de animal 1"
  >
    <rect x="0" y="0" width="220" height="150" rx="10" fill="#ffffff" />
    {/* Tail */}
    <path
      d="M 164 82 C 186 78, 196 58, 186 44"
      fill="none"
      stroke="#0f172a"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <path
      d="M 186 44 C 192 38, 196 32, 188 28 C 180 32, 180 40, 186 44 Z"
      fill="#0f172a"
    />
    {/* Body */}
    <path
      d="M 74 72 C 95 66, 138 66, 160 76 C 168 80, 168 98, 160 104 L 154 134 L 142 134 L 143 106 L 100 106 L 98 134 L 86 134 L 88 104 L 74 134 L 62 134 L 68 96"
      fill="none"
      stroke="#0f172a"
      strokeWidth="2.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    {/* Back hind leg */}
    <path
      d="M 152 104 L 164 134 L 154 134"
      fill="none"
      stroke="#0f172a"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    {/* Fluffy Mane */}
    <path
      d="M 54 34 L 64 26 L 74 34 L 84 30 L 86 44 L 94 54 L 86 68 L 88 82 L 76 92 L 66 102 L 54 96 L 44 102 L 36 88 L 26 82 L 30 68 L 24 54 L 34 44 L 38 30 L 48 34 Z"
      fill="#f8fafc"
      stroke="#0f172a"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    {/* Inner face */}
    <circle cx="58" cy="64" r="18" fill="#ffffff" stroke="#0f172a" strokeWidth="2.2" />
    {/* Ears */}
    <circle cx="43" cy="48" r="5" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
    <circle cx="73" cy="48" r="5" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
    {/* Eyes */}
    <circle cx="51" cy="60" r="2" fill="#0f172a" />
    <circle cx="65" cy="60" r="2" fill="#0f172a" />
    {/* Nose & Muzzle */}
    <polygon points="54,67 62,67 58,72" fill="#0f172a" />
    <path d="M 58 72 L 58 76 M 58 76 C 54 79, 50 77, 49 74 M 58 76 C 62 79, 66 77, 67 74" fill="none" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />
    {/* Whiskers */}
    <path d="M 45 70 L 34 68 M 45 74 L 34 75 M 71 70 L 82 68 M 71 74 L 82 75" stroke="#0f172a" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const RhinoSvg: React.FC = () => (
  <svg
    viewBox="0 0 220 150"
    className="mx-auto h-36 w-full max-w-[240px] sm:h-44"
    role="img"
    aria-label="Ilustración lineal de animal 2"
  >
    <rect x="0" y="0" width="220" height="150" rx="10" fill="#ffffff" />
    {/* Large front horn & small second horn */}
    <path
      d="M 28 74 C 18 64, 16 44, 24 30 C 30 46, 36 58, 40 68 Z"
      fill="#f8fafc"
      stroke="#0f172a"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    <path
      d="M 42 66 C 40 58, 43 49, 48 45 C 50 53, 52 59, 53 65 Z"
      fill="#f8fafc"
      stroke="#0f172a"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    {/* Ears */}
    <path d="M 62 54 C 60 44, 66 38, 70 46 C 72 52, 68 56, 65 56" fill="#ffffff" stroke="#0f172a" strokeWidth="2.2" />
    <path d="M 70 54 C 72 45, 78 40, 80 48 C 80 53, 76 56, 73 56" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
    {/* Body outline */}
    <path
      d="M 28 74 C 24 84, 30 92, 42 94 L 58 96 L 62 132 L 78 132 L 80 104 L 94 104 L 96 132 L 108 132 L 108 106 L 146 106 L 148 132 L 162 132 L 164 104 L 176 132 L 188 132 L 184 92 C 190 80, 186 60, 168 54 C 146 46, 118 46, 94 52 C 80 55, 68 56, 54 64 L 40 68"
      fill="none"
      stroke="#0f172a"
      strokeWidth="2.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    {/* Armor folds */}
    <path d="M 88 54 C 86 72, 86 90, 90 102" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
    <path d="M 148 52 C 145 72, 146 90, 150 104" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
    {/* Eye & Mouth */}
    <circle cx="54" cy="72" r="2.2" fill="#0f172a" />
    <path d="M 28 84 C 34 86, 40 85, 44 82" fill="none" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />
    {/* Tail */}
    <path d="M 184 68 C 194 74, 196 88, 194 98" fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const CamelSvg: React.FC = () => (
  <svg
    viewBox="0 0 220 150"
    className="mx-auto h-36 w-full max-w-[240px] sm:h-44"
    role="img"
    aria-label="Ilustración lineal de animal 3"
  >
    <rect x="0" y="0" width="220" height="150" rx="10" fill="#ffffff" />
    {/* Body, curved neck, head, hump and legs */}
    <path
      d="M 48 56 C 40 56, 30 58, 28 64 C 28 70, 36 73, 46 72 C 52 72, 54 84, 58 96 C 62 108, 74 106, 82 96 L 84 136 L 94 136 L 95 96 L 104 136 L 114 136 L 108 94 C 122 96, 138 96, 152 92 L 154 136 L 164 136 L 165 92 L 176 136 L 186 136 L 176 84 C 178 72, 174 58, 162 52 C 148 44, 136 22, 120 22 C 104 22, 96 46, 84 64 C 76 76, 68 82, 64 70 C 62 60, 58 50, 52 50 C 48 50, 46 53, 48 56 Z"
      fill="none"
      stroke="#0f172a"
      strokeWidth="2.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    {/* Ear, Eye, Nostril */}
    <path d="M 52 50 C 54 44, 58 45, 58 51" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
    <circle cx="42" cy="60" r="2" fill="#0f172a" />
    <path d="M 29 66 L 36 66" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" />
    {/* Tail */}
    <path d="M 176 68 C 188 74, 190 92, 188 104" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const NeckerCubeSvg: React.FC = () => (
  <svg
    viewBox="0 0 180 140"
    className="mx-auto h-28 w-full max-w-[180px] sm:h-32"
    role="img"
    aria-label="Cubo tridimensional de Necker para copiar"
  >
    <rect x="0" y="0" width="180" height="140" rx="8" fill="#ffffff" />
    {/* Front square */}
    <rect x="42" y="42" width="66" height="66" fill="none" stroke="#0f172a" strokeWidth="2.4" />
    {/* Back square */}
    <rect x="72" y="22" width="66" height="66" fill="none" stroke="#0f172a" strokeWidth="2.4" />
    {/* Connecting edges */}
    <line x1="42" y1="42" x2="72" y2="22" stroke="#0f172a" strokeWidth="2.4" />
    <line x1="108" y1="42" x2="138" y2="22" stroke="#0f172a" strokeWidth="2.4" />
    <line x1="42" y1="108" x2="72" y2="88" stroke="#0f172a" strokeWidth="2.4" />
    <line x1="108" y1="108" x2="138" y2="88" stroke="#0f172a" strokeWidth="2.4" />
  </svg>
);

export const MocaInteractiveGuide: React.FC<MocaInteractiveGuideProps> = ({
  inputs,
  resetCounter,
  onUpdateNumber,
  onUpdateBoolean,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [patientView, setPatientView] = useState(false);

  // Step 1: Visuospatial (5 pts)
  const [trailSeq, setTrailSeq] = useState<string[]>([]);
  const [trailErrorNode, setTrailErrorNode] = useState<string | null>(null);
  const [trailOk, setTrailOk] = useState(false);
  const [cubeOk, setCubeOk] = useState(false);
  const [clockContour, setClockContour] = useState(false);
  const [clockNumbers, setClockNumbers] = useState(false);
  const [clockHands, setClockHands] = useState(false);

  // Step 2: Naming (3 pts)
  const [animalSlide, setAnimalSlide] = useState(0);
  const [lionOk, setLionOk] = useState(false);
  const [rhinoOk, setRhinoOk] = useState(false);
  const [camelOk, setCamelOk] = useState(false);

  // Step 3: Attention (6 pts)
  const [digitsForward, setDigitsForward] = useState(false);
  const [digitsBackward, setDigitsBackward] = useState(false);
  const [vigilanceA, setVigilanceA] = useState(false);
  const [serial7Points, setSerial7Points] = useState<number>(0);

  // Step 4: Language (3 pts)
  const [phrase1Ok, setPhrase1Ok] = useState(false);
  const [phrase2Ok, setPhrase2Ok] = useState(false);
  const [fluencyOk, setFluencyOk] = useState(false);
  const [fluencyWords, setFluencyWords] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);

  // Step 5: Abstraction (2 pts)
  const [abstraction1, setAbstraction1] = useState(false);
  const [abstraction2, setAbstraction2] = useState(false);

  // Step 6: Delayed recall (5 pts)
  const [recalledWords, setRecalledWords] = useState<boolean[]>([false, false, false, false, false]);

  // Step 7: Orientation (6 pts)
  const [orientationItems, setOrientationItems] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  // Sketch canvas for Cube / Clock on phone without paper
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const [sketchMode, setSketchMode] = useState<'clock' | 'cube'>('clock');

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    clearCanvas();
  }, [activeStep, sketchMode, resetCounter]);

  // Reset interactive guide when user presses "Limpiar campos"
  useEffect(() => {
    if (resetCounter === 0) return;
    setActiveStep(0);
    setPatientView(false);
    setTrailSeq([]);
    setTrailErrorNode(null);
    setTrailOk(false);
    setCubeOk(false);
    setClockContour(false);
    setClockNumbers(false);
    setClockHands(false);
    setAnimalSlide(0);
    setLionOk(false);
    setRhinoOk(false);
    setCamelOk(false);
    setDigitsForward(false);
    setDigitsBackward(false);
    setVigilanceA(false);
    setSerial7Points(0);
    setPhrase1Ok(false);
    setPhrase2Ok(false);
    setFluencyOk(false);
    setFluencyWords(0);
    setTimerSeconds(60);
    setTimerRunning(false);
    setAbstraction1(false);
    setAbstraction2(false);
    setRecalledWords([false, false, false, false, false]);
    setOrientationItems([false, false, false, false, false, false]);
  }, [resetCounter]);

  // Fluency 60s countdown
  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  // Sync each domain total directly into CalculatorView's `inputs`
  const syncVisuo = (t: boolean, c: boolean, cc: boolean, cn: boolean, ch: boolean) => {
    const sum = (t ? 1 : 0) + (c ? 1 : 0) + (cc ? 1 : 0) + (cn ? 1 : 0) + (ch ? 1 : 0);
    onUpdateNumber('visuospatial', String(sum));
  };

  const syncNaming = (l: boolean, r: boolean, cam: boolean) => {
    const sum = (l ? 1 : 0) + (r ? 1 : 0) + (cam ? 1 : 0);
    onUpdateNumber('naming', String(sum));
  };

  const syncAttention = (df: boolean, db: boolean, vig: boolean, s7: number) => {
    const sum = (df ? 1 : 0) + (db ? 1 : 0) + (vig ? 1 : 0) + s7;
    onUpdateNumber('attention', String(sum));
  };

  const syncLanguage = (p1: boolean, p2: boolean, fl: boolean) => {
    const sum = (p1 ? 1 : 0) + (p2 ? 1 : 0) + (fl ? 1 : 0);
    onUpdateNumber('language', String(sum));
  };

  const syncAbstraction = (a1: boolean, a2: boolean) => {
    onUpdateNumber('abstraction', String((a1 ? 1 : 0) + (a2 ? 1 : 0)));
  };

  const syncRecall = (arr: boolean[]) => {
    onUpdateNumber('recall', String(arr.filter(Boolean).length));
  };

  const syncOrientation = (arr: boolean[]) => {
    onUpdateNumber('orientation', String(arr.filter(Boolean).length));
  };

  const handleTrailTap = (nodeId: string) => {
    const expectedNext = EXPECTED_TRAIL[trailSeq.length];
    if (!expectedNext) return;
    if (nodeId === expectedNext) {
      const nextSeq = [...trailSeq, nodeId];
      setTrailSeq(nextSeq);
      setTrailErrorNode(null);
      if (nextSeq.length === EXPECTED_TRAIL.length) {
        setTrailOk(true);
        syncVisuo(true, cubeOk, clockContour, clockNumbers, clockHands);
      }
    } else if (!trailSeq.includes(nodeId)) {
      setTrailErrorNode(nodeId);
      window.setTimeout(() => setTrailErrorNode(null), 500);
    }
  };

  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handleCanvasDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPointerPos(e);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawingRef.current = true;
  };

  const handleCanvasMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPointerPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleCanvasUp = () => {
    isDrawingRef.current = false;
  };

  const getVal = (id: string) => Number((inputs[id] as NumberInputValue | undefined)?.value || 0);
  const lowEdu = inputs.lowEducation === true;
  const rawScore =
    getVal('visuospatial') +
    getVal('naming') +
    getVal('attention') +
    getVal('language') +
    getVal('abstraction') +
    getVal('recall') +
    getVal('orientation');
  const totalWithBonus = Math.min(30, rawScore + (lowEdu && rawScore < 30 ? 1 : 0));

  const animals = [
    { name: 'León', component: <LionSvg />, ok: lionOk, toggle: () => {
      const next = !lionOk;
      setLionOk(next);
      syncNaming(next, rhinoOk, camelOk);
    }},
    { name: 'Rinoceronte', component: <RhinoSvg />, ok: rhinoOk, toggle: () => {
      const next = !rhinoOk;
      setRhinoOk(next);
      syncNaming(lionOk, next, camelOk);
    }},
    { name: 'Camello / Dromedario', component: <CamelSvg />, ok: camelOk, toggle: () => {
      const next = !camelOk;
      setCamelOk(next);
      syncNaming(lionOk, rhinoOk, next);
    }},
  ];

  const CheckToggle: React.FC<{
    label: string;
    checked: boolean;
    pts?: string;
    onToggle: () => void;
  }> = ({ label, checked, pts = '+1', onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className={`flex min-h-[42px] w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs font-medium ${
        checked
          ? 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-200'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
      }`}
    >
      <span className="flex min-w-0 items-center gap-2">
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
            checked
              ? 'border-emerald-600 bg-emerald-600 text-white'
              : 'border-slate-400 bg-transparent'
          }`}
        >
          {checked && <Check className="h-3 w-3" />}
        </span>
        <span className="break-words leading-snug">{label}</span>
      </span>
      <span className="shrink-0 font-mono text-[11px] opacity-80">{pts}</span>
    </button>
  );

  return (
    <section className="w-full min-w-0 overflow-hidden rounded-xl border border-sky-200 bg-sky-50/40 p-3.5 sm:rounded-2xl sm:p-5 dark:border-sky-900/60 dark:bg-sky-950/20">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-900 sm:text-base dark:text-slate-100">
            Modo Guiado Interactivo (sin hoja impresa)
          </h2>
          <p className="text-[11px] text-slate-600 sm:text-xs dark:text-slate-400">
            Aplica el test paso a paso en tu teléfono; las casillas actualizan la puntuación abajo automáticamente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPatientView((prev) => !prev)}
            className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
              patientView
                ? 'border-sky-600 bg-sky-600 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
            }`}
          >
            {patientView ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span>{patientView ? 'Salir vista paciente' : 'Vista paciente'}</span>
          </button>

          <span className="rounded-lg border border-sky-200 bg-white px-2.5 py-1.5 font-mono text-xs font-bold tabular-nums text-sky-800 dark:border-sky-800 dark:bg-slate-900 dark:text-sky-300">
            {totalWithBonus}/30
          </span>
        </div>
      </div>

      {/* Horizontal scrollable step tabs (hidden in Patient View) */}
      {!patientView && (
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
          {STEPS.map((st) => {
            const active = activeStep === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setActiveStep(st.id)}
                className={`min-h-[36px] shrink-0 rounded-lg border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
                  active
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                {st.short}
              </button>
            );
          })}
        </div>
      )}

      {/* Step Content */}
      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 sm:p-4 dark:border-slate-800 dark:bg-slate-900">
        {!patientView && (
          <h3 className="text-xs font-bold uppercase tracking-wide text-sky-800 sm:text-sm dark:text-sky-300">
            {STEPS[activeStep].title}
          </h3>
        )}

        {/* STEP 1: VISUOSPATIAL */}
        {activeStep === 0 && (
          <div className="mt-2.5 space-y-4">
            {/* 1A: Interactive Trail Making */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  {patientView
                    ? 'Toca los círculos alternando número y letra en orden: 1 → A → 2 → B...'
                    : '1A. Trazo alternante (1 → A → 2 → B → 3 → C → 4 → D → 5 → E): pide al paciente tocar en orden.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTrailSeq([]);
                    setTrailErrorNode(null);
                  }}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reiniciar trazo
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-2">
                <svg
                  viewBox="0 0 320 200"
                  className="mx-auto w-full max-w-[360px] select-none touch-manipulation"
                  role="group"
                  aria-label="Prueba interactiva de trazo alternante 1 a E"
                >
                  {/* Lines connecting tapped sequence */}
                  {trailSeq.slice(1).map((id, idx) => {
                    const prev = TRAIL_NODES.find((n) => n.id === trailSeq[idx])!;
                    const curr = TRAIL_NODES.find((n) => n.id === id)!;
                    return (
                      <line
                        key={`${prev.id}-${curr.id}`}
                        x1={prev.x}
                        y1={prev.y}
                        x2={curr.x}
                        y2={curr.y}
                        stroke="#0284c7"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    );
                  })}

                  {TRAIL_NODES.map((node) => {
                    const done = trailSeq.includes(node.id);
                    const isErr = trailErrorNode === node.id;
                    return (
                      <g
                        key={node.id}
                        onClick={() => handleTrailTap(node.id)}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="20"
                          fill={isErr ? '#fee2e2' : done ? '#0284c7' : '#f8fafc'}
                          stroke={isErr ? '#e11d48' : done ? '#0369a1' : '#0f172a'}
                          strokeWidth="2.4"
                        />
                        <text
                          x={node.x}
                          y={node.y + 5}
                          textAnchor="middle"
                          fontSize="15"
                          fontWeight="700"
                          fill={done ? '#ffffff' : '#0f172a'}
                        >
                          {node.id}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* 1B + 1C: Necker Cube stimulus + Touch Sketch Pad */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {sketchMode === 'cube' ? 'Modelo: Copia este cubo' : 'Instrucción: Dibuja un reloj (11:10)'}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setSketchMode('cube')}
                      className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                        sketchMode === 'cube'
                          ? 'bg-sky-600 text-white'
                          : 'bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      Cubo
                    </button>
                    <button
                      type="button"
                      onClick={() => setSketchMode('clock')}
                      className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                        sketchMode === 'clock'
                          ? 'bg-sky-600 text-white'
                          : 'bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      Reloj
                    </button>
                  </div>
                </div>
                {sketchMode === 'cube' ? (
                  <NeckerCubeSvg />
                ) : (
                  <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-3 text-center text-xs text-slate-700 sm:h-32">
                    «Dibuja un reloj grande, coloca todos los números y pon las manecillas marcando las 11 y 10.»
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Lienzo táctil (dedo)
                  </span>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <Eraser className="h-3 w-3" />
                    Borrar
                  </button>
                </div>
                <canvas
                  ref={canvasRef}
                  width={320}
                  height={180}
                  onPointerDown={handleCanvasDown}
                  onPointerMove={handleCanvasMove}
                  onPointerUp={handleCanvasUp}
                  onPointerCancel={handleCanvasUp}
                  className="h-36 w-full touch-none rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

            {!patientView && (
              <div className="grid gap-1.5 sm:grid-cols-2">
                <CheckToggle
                  label="Trazo alternante correcto (sin errores)"
                  checked={trailOk}
                  onToggle={() => {
                    const next = !trailOk;
                    setTrailOk(next);
                    syncVisuo(next, cubeOk, clockContour, clockNumbers, clockHands);
                  }}
                />
                <CheckToggle
                  label="Cubo tridimensional correcto"
                  checked={cubeOk}
                  onToggle={() => {
                    const next = !cubeOk;
                    setCubeOk(next);
                    syncVisuo(trailOk, next, clockContour, clockNumbers, clockHands);
                  }}
                />
                <CheckToggle
                  label="Reloj: Contorno circular cerrado"
                  checked={clockContour}
                  onToggle={() => {
                    const next = !clockContour;
                    setClockContour(next);
                    syncVisuo(trailOk, cubeOk, next, clockNumbers, clockHands);
                  }}
                />
                <CheckToggle
                  label="Reloj: Números 1–12 completos en posición"
                  checked={clockNumbers}
                  onToggle={() => {
                    const next = !clockNumbers;
                    setClockNumbers(next);
                    syncVisuo(trailOk, cubeOk, clockContour, next, clockHands);
                  }}
                />
                <CheckToggle
                  label="Reloj: Manecillas marcan 11:10 (horaria más corta)"
                  checked={clockHands}
                  onToggle={() => {
                    const next = !clockHands;
                    setClockHands(next);
                    syncVisuo(trailOk, cubeOk, clockContour, clockNumbers, next);
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* STEP 2: NAMING (3 ANIMALS) */}
        {activeStep === 1 && (
          <div className="mt-2.5 space-y-3">
            {patientView ? (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 text-center">
                <p className="text-sm font-semibold text-slate-900">
                  ¿Cómo se llama este animal? ({animalSlide + 1} / 3)
                </p>
                {animals[animalSlide].component}
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAnimalSlide((prev) => (prev + 2) % 3)}
                    className="inline-flex min-h-[40px] items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnimalSlide((prev) => (prev + 1) % 3)}
                    className="inline-flex min-h-[40px] items-center gap-1 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Muestra cada ilustración al paciente (puedes pulsar <strong>Vista paciente</strong> arriba para ocultar los nombres) y marca las denominaciones correctas:
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {animals.map((animal) => (
                    <div
                      key={animal.name}
                      className="flex flex-col justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950"
                    >
                      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                        {animal.component}
                      </div>
                      <CheckToggle
                        label={animal.name}
                        checked={animal.ok}
                        onToggle={animal.toggle}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 3: MEMORY TRIAL + ATTENTION */}
        {activeStep === 2 && (
          <div className="mt-2.5 space-y-3">
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-900/60 dark:bg-amber-950/30">
              <p className="text-xs font-semibold text-amber-950 dark:text-amber-200">
                Memoria inmediata (sin puntaje aquí — se evalúa en el Paso 6):
              </p>
              <p className="mt-1 text-xs leading-relaxed text-amber-900 dark:text-amber-300">
                Lee esta lista 2 veces (1 palabra/seg) y pide repetirlas después de cada lectura:
              </p>
              <p className="mt-1.5 font-mono text-sm font-bold tracking-wide text-slate-900 dark:text-slate-100">
                {MEMORY_WORDS.join(' · ')}
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <CheckToggle
                label="Dígitos directo: 2 - 1 - 8 - 5 - 4"
                checked={digitsForward}
                onToggle={() => {
                  const next = !digitsForward;
                  setDigitsForward(next);
                  syncAttention(next, digitsBackward, vigilanceA, serial7Points);
                }}
              />
              <CheckToggle
                label="Dígitos inverso: 7 - 4 - 2 (respuesta: 2 - 4 - 7)"
                checked={digitsBackward}
                onToggle={() => {
                  const next = !digitsBackward;
                  setDigitsBackward(next);
                  syncAttention(digitsForward, next, vigilanceA, serial7Points);
                }}
              />
            </div>

            <div className="space-y-1.5">
              <p className="font-mono text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                Vigilancia (dar golpe al oír «A»): F B A C M N A A J K L B A F A K D E A A A J A M O F A A B
              </p>
              <CheckToggle
                label="Vigilancia letra «A» (0 o máximo 1 error)"
                checked={vigilanceA}
                onToggle={() => {
                  const next = !vigilanceA;
                  setVigilanceA(next);
                  syncAttention(digitsForward, digitsBackward, next, serial7Points);
                }}
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                Restas seriadas 100 − 7 (93, 86, 79, 72, 65):
              </p>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {[
                  { pts: 0, label: '0 correctas (0 pts)' },
                  { pts: 1, label: '1 correcta (1 pt)' },
                  { pts: 2, label: '2–3 correctas (2 pts)' },
                  { pts: 3, label: '4–5 correctas (3 pts)' },
                ].map((opt) => (
                  <button
                    key={opt.pts}
                    type="button"
                    onClick={() => {
                      setSerial7Points(opt.pts);
                      syncAttention(digitsForward, digitsBackward, vigilanceA, opt.pts);
                    }}
                    className={`min-h-[40px] rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                      serial7Points === opt.pts
                        ? 'border-sky-600 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/50 dark:text-sky-200'
                        : 'border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: LANGUAGE & 60s FLUENCY TIMER */}
        {activeStep === 3 && (
          <div className="mt-2.5 space-y-3">
            <div className="space-y-1.5">
              <CheckToggle
                label="Repite exacto: «El gato se esconde bajo el sofá cuando los perros entran en la sala.»"
                checked={phrase1Ok}
                onToggle={() => {
                  const next = !phrase1Ok;
                  setPhrase1Ok(next);
                  syncLanguage(next, phrase2Ok, fluencyOk);
                }}
              />
              <CheckToggle
                label="Repite exacto: «Espero que él le entregue el mensaje una vez que ella se lo pida.»"
                checked={phrase2Ok}
                onToggle={() => {
                  const next = !phrase2Ok;
                  setPhrase2Ok(next);
                  syncLanguage(phrase1Ok, next, fluencyOk);
                }}
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <Timer className="h-4 w-4 text-sky-600" />
                  <span>Fluidez verbal (1 min — palabras con «P» o «F», meta ≥ 11)</span>
                </div>
                <span className="font-mono text-base font-bold tabular-nums text-sky-700 dark:text-sky-300">
                  {timerSeconds}s · {fluencyWords} pal.
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTimerRunning((r) => !r)}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  {timerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  {timerRunning ? 'Pausar' : 'Iniciar 60s'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextWords = fluencyWords + 1;
                    setFluencyWords(nextWords);
                    if (nextWords >= 11 && !fluencyOk) {
                      setFluencyOk(true);
                      syncLanguage(phrase1Ok, phrase2Ok, true);
                    }
                  }}
                  className="inline-flex min-h-[38px] items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  +1 palabra ({fluencyWords})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerSeconds(60);
                    setFluencyWords(0);
                  }}
                  className="inline-flex min-h-[38px] items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reiniciar
                </button>
              </div>

              <div className="mt-2">
                <CheckToggle
                  label="Fluidez verbal ≥ 11 palabras válidas en 60 segundos"
                  checked={fluencyOk}
                  onToggle={() => {
                    const next = !fluencyOk;
                    setFluencyOk(next);
                    syncLanguage(phrase1Ok, phrase2Ok, next);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: ABSTRACTION */}
        {activeStep === 4 && (
          <div className="mt-2.5 space-y-2">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Ejemplo de práctica: «¿En qué se parecen un plátano y una naranja?» (Frutas). Evaluar los 2 pares siguientes:
            </p>
            <CheckToggle
              label="Par 1: Tren — Bicicleta (ej. medios de transporte / vehículos)"
              checked={abstraction1}
              onToggle={() => {
                const next = !abstraction1;
                setAbstraction1(next);
                syncAbstraction(next, abstraction2);
              }}
            />
            <CheckToggle
              label="Par 2: Reloj — Regla (ej. instrumentos de medición / para medir)"
              checked={abstraction2}
              onToggle={() => {
                const next = !abstraction2;
                setAbstraction2(next);
                syncAbstraction(abstraction1, next);
              }}
            />
          </div>
        )}

        {/* STEP 6: DELAYED RECALL */}
        {activeStep === 5 && (
          <div className="mt-2.5 space-y-2">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Pide al paciente recordar las 5 palabras del inicio <strong>sin pistas</strong> (solo puntúa el recuerdo espontáneo):
            </p>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {MEMORY_WORDS.map((word, idx) => (
                <CheckToggle
                  key={word}
                  label={word}
                  checked={recalledWords[idx]}
                  onToggle={() => {
                    const next = [...recalledWords];
                    next[idx] = !next[idx];
                    setRecalledWords(next);
                    syncRecall(next);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: ORIENTATION & EDUCATION */}
        {activeStep === 6 && (
          <div className="mt-2.5 space-y-2.5">
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {['Día del mes', 'Mes', 'Año', 'Día de la semana', 'Lugar / clínica', 'Ciudad / localidad'].map(
                (label, idx) => (
                  <CheckToggle
                    key={label}
                    label={label}
                    checked={orientationItems[idx]}
                    onToggle={() => {
                      const next = [...orientationItems];
                      next[idx] = !next[idx];
                      setOrientationItems(next);
                      syncOrientation(next);
                    }}
                  />
                ),
              )}
            </div>

            <CheckToggle
              label="Escolaridad total ≤ 12 años (+1 punto automático si puntuación bruta < 30)"
              checked={lowEdu}
              pts="+1 aj."
              onToggle={() => onUpdateBoolean('lowEducation', !lowEdu)}
            />
          </div>
        )}

        {/* Bottom Stepper Navigation */}
        {!patientView && (
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800">
            <button
              type="button"
              disabled={activeStep === 0}
              onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
              className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Anterior
            </button>
            <span className="text-[11px] font-medium text-slate-500">
              Paso {activeStep + 1} de {STEPS.length}
            </span>
            <button
              type="button"
              disabled={activeStep === STEPS.length - 1}
              onClick={() => setActiveStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="inline-flex min-h-[36px] items-center gap-1 rounded-lg bg-sky-600 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-40"
            >
              Siguiente
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
