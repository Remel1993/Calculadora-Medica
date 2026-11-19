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
  Undo2,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

interface DrawPoint {
  x: number;
  y: number;
}

interface TouchDrawingPadProps {
  strokes: DrawPoint[][];
  onChangeStrokes: (next: DrawPoint[][]) => void;
  ariaLabel: string;
  placeholder?: string;
  heightClass?: string;
}

const TouchDrawingPad: React.FC<TouchDrawingPadProps> = ({
  strokes,
  onChangeStrokes,
  ariaLabel,
  placeholder,
  heightClass = 'h-48 sm:h-56',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeStrokeRef = useRef<DrawPoint[] | null>(null);
  const strokesRef = useRef<DrawPoint[][]>(strokes);
  strokesRef.current = strokes;

  const redraw = useCallback((liveStroke?: DrawPoint[] | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#0f172a';
    ctx.fillStyle = '#0f172a';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const allStrokes = liveStroke
      ? [...strokesRef.current, liveStroke]
      : strokesRef.current;

    for (const stroke of allStrokes) {
      if (stroke.length === 0) continue;
      if (stroke.length === 1) {
        const p = stroke[0];
        ctx.beginPath();
        ctx.arc(p.x * rect.width, p.y * rect.height, 1.8, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }

      ctx.beginPath();
      ctx.moveTo(stroke[0].x * rect.width, stroke[0].y * rect.height);
      for (let i = 1; i < stroke.length - 1; i++) {
        const currX = stroke[i].x * rect.width;
        const currY = stroke[i].y * rect.height;
        const nextX = stroke[i + 1].x * rect.width;
        const nextY = stroke[i + 1].y * rect.height;
        ctx.quadraticCurveTo(currX, currY, (currX + nextX) / 2, (currY + nextY) / 2);
      }
      const last = stroke[stroke.length - 1];
      ctx.lineTo(last.x * rect.width, last.y * rect.height);
      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    redraw(activeStrokeRef.current);
  }, [strokes, redraw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => redraw(activeStrokeRef.current));
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [redraw]);

  const toNormalizedPoint = (clientX: number, clientY: number): DrawPoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    const pt = toNormalizedPoint(e.clientX, e.clientY);
    if (!pt) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture is unsupported in WebView
    }
    activeStrokeRef.current = [pt];
    redraw(activeStrokeRef.current);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!activeStrokeRef.current) return;
    e.preventDefault();
    const pt = toNormalizedPoint(e.clientX, e.clientY);
    if (!pt) return;
    const stroke = activeStrokeRef.current;
    const prev = stroke[stroke.length - 1];
    if (prev && Math.hypot(pt.x - prev.x, pt.y - prev.y) < 0.004) {
      return;
    }
    stroke.push(pt);
    redraw(stroke);
  };

  const commitActiveStroke = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (!activeStrokeRef.current) return;
    if (e) {
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignore
      }
    }
    const finished = activeStrokeRef.current;
    activeStrokeRef.current = null;
    if (finished.length > 0) {
      onChangeStrokes([...strokesRef.current, finished]);
    }
  };

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        aria-label={ariaLabel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={commitActiveStroke}
        onPointerCancel={commitActiveStroke}
        className={`block w-full touch-none select-none rounded-lg border border-slate-300 bg-white shadow-inner cursor-crosshair ${heightClass}`}
      />
      {strokes.length === 0 && placeholder && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-slate-400">
          {placeholder}
        </div>
      )}
    </div>
  );
};

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
  const trailSeqRef = useRef<string[]>([]);
  trailSeqRef.current = trailSeq;
  const [trailFreehandStrokes, setTrailFreehandStrokes] = useState<DrawPoint[][]>([]);
  const [trailLiveStroke, setTrailLiveStroke] = useState<DrawPoint[] | null>(null);
  const trailLiveStrokeRef = useRef<DrawPoint[] | null>(null);
  const trailDrawingRef = useRef(false);
  const trailSvgRef = useRef<SVGSVGElement | null>(null);
  const [trailErrorNode, setTrailErrorNode] = useState<string | null>(null);
  const [trailOk, setTrailOk] = useState(false);
  const [cubeOk, setCubeOk] = useState(false);
  const [clockContour, setClockContour] = useState(false);
  const [clockNumbers, setClockNumbers] = useState(false);
  const [clockHands, setClockHands] = useState(false);

  // Separate persistent drawing strokes for Cube & Clock
  const [cubeStrokes, setCubeStrokes] = useState<DrawPoint[][]>([]);
  const [clockStrokes, setClockStrokes] = useState<DrawPoint[][]>([]);

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

  // Reset interactive guide when user presses "Limpiar campos"
  useEffect(() => {
    if (resetCounter === 0) return;
    setActiveStep(0);
    setPatientView(false);
    trailSeqRef.current = [];
    setTrailSeq([]);
    setTrailFreehandStrokes([]);
    trailLiveStrokeRef.current = null;
    setTrailLiveStroke(null);
    trailDrawingRef.current = false;
    setTrailErrorNode(null);
    setTrailOk(false);
    setCubeOk(false);
    setClockContour(false);
    setClockNumbers(false);
    setClockHands(false);
    setCubeStrokes([]);
    setClockStrokes([]);
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
    const prevSeq = trailSeqRef.current;
    const expectedNext = EXPECTED_TRAIL[prevSeq.length];
    if (!expectedNext) return;
    if (nodeId === expectedNext) {
      const nextSeq = [...prevSeq, nodeId];
      trailSeqRef.current = nextSeq;
      setTrailSeq(nextSeq);
      setTrailErrorNode(null);
      if (nextSeq.length === EXPECTED_TRAIL.length) {
        setTrailOk(true);
        syncVisuo(true, cubeOk, clockContour, clockNumbers, clockHands);
      }
    } else if (!prevSeq.includes(nodeId)) {
      setTrailErrorNode(nodeId);
      window.setTimeout(() => setTrailErrorNode(null), 450);
    }
  };

  const toTrailSvgPoint = (clientX: number, clientY: number): DrawPoint | null => {
    const svg = trailSvgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return {
      x: Math.max(0, Math.min(320, ((clientX - rect.left) / rect.width) * 320)),
      y: Math.max(0, Math.min(200, ((clientY - rect.top) / rect.height) * 200)),
    };
  };

  const checkTrailHit = (pt: DrawPoint) => {
    for (const node of TRAIL_NODES) {
      if (Math.hypot(pt.x - node.x, pt.y - node.y) <= 22) {
        handleTrailTap(node.id);
        break;
      }
    }
  };

  const handleTrailPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    const pt = toTrailSvgPoint(e.clientX, e.clientY);
    if (!pt) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if unsupported
    }
    trailDrawingRef.current = true;
    const initialStroke = [pt];
    trailLiveStrokeRef.current = initialStroke;
    setTrailLiveStroke(initialStroke);
    checkTrailHit(pt);
  };

  const handleTrailPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!trailDrawingRef.current) return;
    e.preventDefault();
    const pt = toTrailSvgPoint(e.clientX, e.clientY);
    if (!pt) return;
    const prev = trailLiveStrokeRef.current;
    if (!prev) {
      const next = [pt];
      trailLiveStrokeRef.current = next;
      setTrailLiveStroke(next);
    } else {
      const last = prev[prev.length - 1];
      if (!last || Math.hypot(pt.x - last.x, pt.y - last.y) >= 2) {
        const next = [...prev, pt];
        trailLiveStrokeRef.current = next;
        setTrailLiveStroke(next);
      }
    }
    checkTrailHit(pt);
  };

  const handleTrailPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!trailDrawingRef.current) return;
    trailDrawingRef.current = false;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }
    const live = trailLiveStrokeRef.current;
    trailLiveStrokeRef.current = null;
    setTrailLiveStroke(null);
    if (live && live.length > 1) {
      setTrailFreehandStrokes((prev) => [...prev, live]);
    }
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
            onClick={() => {
              const next = !patientView;
              setPatientView(next);
              if (next && activeStep > 1) {
                setActiveStep(0);
              }
            }}
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

      {/* Horizontal scrollable step tabs (in Patient View, allow switching between drawing Step 1 and animals Step 2) */}
      {patientView ? (
        <div className="mt-3 flex gap-1.5">
          {[
            { id: 0, label: '1. Dibujos (Trazo, Cubo y Reloj)' },
            { id: 1, label: '2. Identificar Animales' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveStep(tab.id)}
              className={`min-h-[38px] flex-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                activeStep === tab.id
                  ? 'border-sky-600 bg-sky-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : (
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

        {/* STEP 1: VISUOSPATIAL (3 DRAWING TASKS) */}
        {activeStep === 0 && (
          <div className="mt-2.5 space-y-4">
            {/* 1A: Interactive Trail Making (supports continuous finger drawing + tap) */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  {patientView
                    ? '1A. Dibuja una línea con el dedo (o toca en orden) alternando número y letra: 1 → A → 2 → B...'
                    : '1A. Trazo alternante (1 → A → 2 → B → 3 → C → 4 → D → 5 → E): dibuja con el dedo o toca en orden.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    trailDrawingRef.current = false;
                    trailSeqRef.current = [];
                    setTrailSeq([]);
                    setTrailFreehandStrokes([]);
                    trailLiveStrokeRef.current = null;
                    setTrailLiveStroke(null);
                    setTrailErrorNode(null);
                    setTrailOk(false);
                    syncVisuo(false, cubeOk, clockContour, clockNumbers, clockHands);
                  }}
                  className="inline-flex min-h-[34px] items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reiniciar trazo
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-2">
                <svg
                  ref={trailSvgRef}
                  viewBox="0 0 320 200"
                  onPointerDown={handleTrailPointerDown}
                  onPointerMove={handleTrailPointerMove}
                  onPointerUp={handleTrailPointerUp}
                  onPointerCancel={handleTrailPointerUp}
                  className="mx-auto w-full max-w-[380px] touch-none select-none cursor-crosshair"
                  role="group"
                  aria-label="Prueba interactiva de trazo alternante 1 a E"
                >
                  {/* Freehand finger trace */}
                  {[...trailFreehandStrokes, ...(trailLiveStroke ? [trailLiveStroke] : [])].map(
                    (stroke, idx) => (
                      <polyline
                        key={`fh-${idx}`}
                        points={stroke.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
                        fill="none"
                        stroke="#7dd3fc"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.7"
                      />
                    ),
                  )}

                  {/* Clean lines connecting validated node sequence */}
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
                      <g key={node.id} className="cursor-pointer">
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
                <div className="mt-1 flex items-center justify-between px-1 text-[11px] text-slate-500">
                  <span>
                    Progreso: {trailSeq.length}/{EXPECTED_TRAIL.length}
                    {trailSeq.length === EXPECTED_TRAIL.length ? ' (Secuencia completa)' : ''}
                  </span>
                  {trailSeq.length < EXPECTED_TRAIL.length && (
                    <span>Siguiente: {EXPECTED_TRAIL[trailSeq.length]}</span>
                  )}
                </div>
              </div>
            </div>

            {/* 1B: Necker Cube Model + Dedicated Persistent Cube Drawing Pad */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  1B. Copiar el cubo tridimensional
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={cubeStrokes.length === 0}
                    onClick={() => setCubeStrokes((prev) => prev.slice(0, -1))}
                    className="inline-flex min-h-[32px] items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <Undo2 className="h-3 w-3" />
                    Deshacer
                  </button>
                  <button
                    type="button"
                    disabled={cubeStrokes.length === 0}
                    onClick={() => setCubeStrokes([])}
                    className="inline-flex min-h-[32px] items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <Eraser className="h-3 w-3" />
                    Borrar
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[170px_1fr] sm:items-center">
                <div className="rounded-lg border border-slate-200 bg-white p-2">
                  <div className="mb-1 text-center text-[11px] font-medium text-slate-500">
                    Modelo a copiar
                  </div>
                  <NeckerCubeSvg />
                </div>

                <TouchDrawingPad
                  strokes={cubeStrokes}
                  onChangeStrokes={setCubeStrokes}
                  ariaLabel="Lienzo táctil para copiar el cubo"
                  placeholder="Dibuja aquí el cubo con el dedo o lápiz táctil"
                  heightClass="h-44 sm:h-48"
                />
              </div>
            </div>

            {/* 1C: Dedicated Persistent Clock Drawing Pad */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                    1C. Dibujar un reloj (marcando las 11:10)
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                    «Dibuja un reloj grande, coloca todos los números y pon las manecillas marcando las 11 y 10.»
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={clockStrokes.length === 0}
                    onClick={() => setClockStrokes((prev) => prev.slice(0, -1))}
                    className="inline-flex min-h-[32px] items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <Undo2 className="h-3 w-3" />
                    Deshacer
                  </button>
                  <button
                    type="button"
                    disabled={clockStrokes.length === 0}
                    onClick={() => setClockStrokes([])}
                    className="inline-flex min-h-[32px] items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <Eraser className="h-3 w-3" />
                    Borrar
                  </button>
                </div>
              </div>

              <TouchDrawingPad
                strokes={clockStrokes}
                onChangeStrokes={setClockStrokes}
                ariaLabel="Lienzo táctil para dibujar el reloj marcando las 11:10"
                placeholder="Dibuja aquí el círculo del reloj, los números 1–12 y las manecillas (11:10)"
                heightClass="h-56 sm:h-64"
              />
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
