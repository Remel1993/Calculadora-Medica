import React, { useCallback, useEffect, useRef, useState } from 'react';

interface TranslucentPageScrollerProps {
  viewKey: string;
  hasBottomNav?: boolean;
}

interface ScrollerMetrics {
  scrollable: boolean;
  maxScroll: number;
  scrollY: number;
  docHeight: number;
  viewportHeight: number;
}

function getActiveSectionLabel(): string {
  if (typeof document === 'undefined') return '';
  const headings = Array.from(document.querySelectorAll('main h1, main h2'));
  if (headings.length === 0) return '';

  const threshold = window.innerHeight * 0.38;
  let current = headings[0]?.textContent?.trim() ?? '';

  for (const heading of headings) {
    const rect = heading.getBoundingClientRect();
    if (rect.height === 0) continue;
    if (rect.top <= threshold) {
      const text = heading.textContent?.trim();
      if (text) current = text;
    } else {
      break;
    }
  }

  return current;
}

const DRAG_ACTIVATION_PX = 2;

export const TranslucentPageScroller: React.FC<TranslucentPageScrollerProps> = ({
  viewKey,
  hasBottomNav = true,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    pointerDown: boolean;
    dragging: boolean;
    pointerId: number | null;
    startClientY: number;
    lastClientY: number;
    pointerLocalY: number;
    clickedInsideThumb: boolean;
    clickDir: -1 | 0 | 1;
    virtualScrollY: number;
  }>({
    pointerDown: false,
    dragging: false,
    pointerId: null,
    startClientY: 0,
    lastClientY: 0,
    pointerLocalY: 0,
    clickedInsideThumb: false,
    clickDir: 0,
    virtualScrollY: 0,
  });

  const [metrics, setMetrics] = useState<ScrollerMetrics>({
    scrollable: false,
    maxScroll: 0,
    scrollY: 0,
    docHeight: 0,
    viewportHeight: 0,
  });
  const [trackHeight, setTrackHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isActiveScroll, setIsActiveScroll] = useState(false);
  const [sectionLabel, setSectionLabel] = useState('');
  const idleTimerRef = useRef<number | null>(null);

  const measure = useCallback(() => {
    if (typeof window === 'undefined') return;
    const docHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const maxScroll = Math.max(0, docHeight - viewportHeight);
    const scrollY = Math.min(maxScroll, Math.max(0, window.scrollY));
    const scrollable = maxScroll > 80;

    setMetrics((prev) => {
      if (
        prev.scrollable === scrollable &&
        prev.maxScroll === maxScroll &&
        Math.abs(prev.scrollY - scrollY) < 1 &&
        prev.docHeight === docHeight &&
        prev.viewportHeight === viewportHeight
      ) {
        return prev;
      }
      return { scrollable, maxScroll, scrollY, docHeight, viewportHeight };
    });

    if (trackRef.current) {
      const h = trackRef.current.clientHeight;
      setTrackHeight((prev) => (prev === h ? prev : h));
    }
  }, []);

  useEffect(() => {
    measure();
    const raf = window.requestAnimationFrame(measure);

    const handleScroll = () => {
      measure();
      setIsActiveScroll(true);
      if (dragStateRef.current.dragging) {
        setSectionLabel(getActiveSectionLabel());
      }
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = window.setTimeout(() => {
        setIsActiveScroll(false);
      }, 1100);
    };

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            measure();
          })
        : null;

    if (resizeObserver) {
      resizeObserver.observe(document.documentElement);
      const mainEl = document.querySelector('main');
      if (mainEl) resizeObserver.observe(mainEl);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', measure, { passive: true });

    return () => {
      window.cancelAnimationFrame(raf);
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
      }
      resizeObserver?.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', measure);
    };
  }, [measure, viewKey]);

  const effectiveTrackHeight = Math.max(120, trackHeight || 300);
  const thumbHeight =
    metrics.docHeight > 0
      ? Math.max(
          48,
          Math.min(
            116,
            Math.round((metrics.viewportHeight / metrics.docHeight) * effectiveTrackHeight),
          ),
        )
      : 56;
  const maxThumbTravel = Math.max(1, effectiveTrackHeight - thumbHeight);
  const scrollRatio = metrics.maxScroll > 0 ? metrics.scrollY / metrics.maxScroll : 0;
  const thumbTop = Math.round(scrollRatio * maxThumbTravel);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const trackEl = trackRef.current;
    if (!trackEl || metrics.maxScroll <= 0) return;
    event.preventDefault();

    const rect = trackEl.getBoundingClientRect();
    const pointerLocalY = event.clientY - rect.top;
    const insideThumb =
      pointerLocalY >= thumbTop - 12 && pointerLocalY <= thumbTop + thumbHeight + 12;
    const clickDir: -1 | 0 | 1 = insideThumb
      ? 0
      : pointerLocalY < thumbTop
        ? -1
        : 1;

    dragStateRef.current = {
      pointerDown: true,
      dragging: false,
      pointerId: event.pointerId,
      startClientY: event.clientY,
      lastClientY: event.clientY,
      pointerLocalY,
      clickedInsideThumb: insideThumb,
      clickDir,
      virtualScrollY: window.scrollY,
    };

    try {
      trackEl.setPointerCapture(event.pointerId);
    } catch {
      // Ignore if pointer capture is unavailable
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    const trackEl = trackRef.current;
    if (!state.pointerDown || !trackEl || metrics.maxScroll <= 0) return;
    event.preventDefault();

    const totalMoved = Math.abs(event.clientY - state.startClientY);
    if (!state.dragging) {
      if (totalMoved < DRAG_ACTIVATION_PX) {
        return;
      }
      state.dragging = true;
      state.lastClientY = event.clientY;
      state.virtualScrollY = window.scrollY;
      setIsDragging(true);
      setSectionLabel(getActiveSectionLabel());
    }

    const deltaY = event.clientY - state.lastClientY;
    state.lastClientY = event.clientY;
    if (Math.abs(deltaY) < 0.25) return;

    const localTravel = Math.max(1, trackEl.clientHeight - thumbHeight);
    const fullTrackScale = metrics.maxScroll / localTravel;

    const nextScrollY = Math.min(
      metrics.maxScroll,
      Math.max(0, state.virtualScrollY + deltaY * fullTrackScale),
    );
    state.virtualScrollY = nextScrollY;
    window.scrollTo({ top: nextScrollY, behavior: 'auto' });
    setSectionLabel(getActiveSectionLabel());
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    if (!state.pointerDown) return;

    const wasDragging = state.dragging;
    const tapDir = state.clickDir;
    const pointerLocalY = state.pointerLocalY;

    state.pointerDown = false;
    state.dragging = false;
    if (state.pointerId !== null) {
      try {
        trackRef.current?.releasePointerCapture(state.pointerId);
      } catch {
        // Ignore if already released
      }
      state.pointerId = null;
    }
    setIsDragging(false);

    if (!wasDragging && tapDir !== 0 && trackRef.current) {
      const localTravel = Math.max(1, trackRef.current.clientHeight - thumbHeight);
      const targetRatio = Math.min(
        1,
        Math.max(0, (pointerLocalY - thumbHeight / 2) / localTravel),
      );
      window.scrollTo({
        top: Math.round(targetRatio * metrics.maxScroll),
        behavior: 'smooth',
      });
    }

    event.stopPropagation();
  };

  if (!metrics.scrollable) {
    return null;
  }

  const pct = Math.round(scrollRatio * 100);

  return (
    <div
      className={`pointer-events-none fixed right-0.5 z-[45] select-none sm:right-1.5 ${
        hasBottomNav ? 'top-14 bottom-16 md:top-16 md:bottom-4' : 'top-14 bottom-4 md:top-16'
      }`}
      aria-label="Barra rápida de desplazamiento"
    >
      <div
        ref={trackRef}
        role="scrollbar"
        aria-orientation="vertical"
        aria-label="Desplazar pantalla rápidamente por apartados"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={`pointer-events-auto relative flex h-full w-5 touch-none items-start justify-end rounded-full transition-opacity duration-200 cursor-grab active:cursor-grabbing ${
          isDragging || isActiveScroll ? 'opacity-100' : 'opacity-65 hover:opacity-100'
        }`}
      >
        {/* Subtle translucent guide rail */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute top-1 right-1 bottom-1 w-2 rounded-full border transition-colors ${
            isDragging
              ? 'border-sky-400/50 bg-slate-900/15 backdrop-blur-md dark:border-sky-400/40 dark:bg-white/15'
              : 'border-slate-300/45 bg-slate-200/45 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/45'
          }`}
        />

        {/* Draggable translucent pill thumb */}
        <div
          style={{
            height: `${thumbHeight}px`,
            transform: `translateY(${thumbTop}px)`,
          }}
          className={`pointer-events-none relative mr-0.5 flex items-center justify-center rounded-full border backdrop-blur-md transition-[width,background-color,box-shadow] duration-150 ${
            isDragging
              ? 'w-3.5 border-sky-300/80 bg-sky-600/80 shadow-md shadow-sky-900/20 dark:border-sky-300/60 dark:bg-sky-400/80'
              : 'w-2.5 border-white/60 bg-slate-700/45 shadow-xs hover:w-3 hover:bg-sky-600/70 dark:border-slate-500/50 dark:bg-slate-200/40 dark:hover:bg-sky-400/70'
          }`}
        >
          <span
            aria-hidden="true"
            className="h-4 w-0.5 rounded-full bg-white/80 dark:bg-slate-950/70"
          />
        </div>

        {/* Live translucent apartado readout while dragging */}
        {isDragging && (
          <div
            style={{
              transform: `translateY(${Math.max(4, thumbTop + thumbHeight / 2 - 16)}px)`,
            }}
            className="pointer-events-none absolute right-6 max-w-[210px] rounded-xl border border-slate-200/80 bg-white/88 px-2.5 py-1.5 text-right shadow-lg backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/88"
          >
            <div className="flex items-center justify-end gap-1.5">
              {sectionLabel && (
                <span className="truncate text-[11px] font-semibold text-slate-800 dark:text-slate-100">
                  {sectionLabel}
                </span>
              )}
              <span className="shrink-0 font-mono text-[10px] font-bold tabular-nums text-sky-700 dark:text-sky-400">
                {pct}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
