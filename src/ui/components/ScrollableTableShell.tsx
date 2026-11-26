import { ArrowLeftRight, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

interface ScrollableTableShellProps {
  children: React.ReactNode;
  compactHeightClass?: string;
  expandedHeightClass?: string;
  allowExpand?: boolean;
  ariaLabel?: string;
  className?: string;
}

interface ScrollState {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  hasHorizontalOverflow: boolean;
  scrollLeft: number;
  maxScrollLeft: number;
  clientWidth: number;
  scrollWidth: number;
}

interface PinnedHeaderState {
  visible: boolean;
  topPx: number;
  leftPx: number;
  widthPx: number;
  tableWidthPx: number;
  colWidths: number[];
}

const INITIAL_SCROLL_STATE: ScrollState = {
  canScrollLeft: false,
  canScrollRight: false,
  hasHorizontalOverflow: false,
  scrollLeft: 0,
  maxScrollLeft: 0,
  clientWidth: 0,
  scrollWidth: 0,
};

const INITIAL_PINNED_HEADER: PinnedHeaderState = {
  visible: false,
  topPx: 0,
  leftPx: 0,
  widthPx: 0,
  tableWidthPx: 0,
  colWidths: [],
};

export const ScrollableTableShell: React.FC<ScrollableTableShellProps> = ({
  children,
  ariaLabel = 'Tabla clínica desplazable',
  className = '',
}) => {
  const shellCardRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const floatingHeaderScrollRef = useRef<HTMLDivElement | null>(null);
  const syncingScrollRef = useRef<'main' | 'header' | null>(null);

  const [scrollState, setScrollState] = useState<ScrollState>(INITIAL_SCROLL_STATE);
  const [pinnedHeader, setPinnedHeader] = useState<PinnedHeaderState>(INITIAL_PINNED_HEADER);

  const hTrackRef = useRef<HTMLDivElement | null>(null);
  const hDragRef = useRef<{
    pointerDown: boolean;
    dragging: boolean;
    pointerId: number | null;
    startClientX: number;
    lastClientX: number;
    tapDir: -1 | 0 | 1;
    virtualScrollLeft: number;
  }>({
    pointerDown: false,
    dragging: false,
    pointerId: null,
    startClientX: 0,
    lastClientX: 0,
    tapDir: 0,
    virtualScrollLeft: 0,
  });
  const [hTrackWidth, setHTrackWidth] = useState(0);
  const [isDraggingH, setIsDraggingH] = useState(false);

  const tableElement = useMemo(() => {
    if (React.isValidElement(children) && children.type === 'table') {
      return children as React.ReactElement<
        React.TableHTMLAttributes<HTMLTableElement> & { children?: React.ReactNode }
      >;
    }
    return null;
  }, [children]);

  const theadElement = useMemo(() => {
    if (!tableElement) return null;
    let found: React.ReactElement | null = null;
    React.Children.forEach(tableElement.props.children, (child) => {
      if (!found && React.isValidElement(child) && child.type === 'thead') {
        found = child;
      }
    });
    return found;
  }, [tableElement]);

  const syncFloatingScrollFromMain = useCallback(() => {
    const mainEl = scrollRef.current;
    const headerEl = floatingHeaderScrollRef.current;
    if (!mainEl || !headerEl) return;
    if (Math.abs(headerEl.scrollLeft - mainEl.scrollLeft) > 0.5) {
      syncingScrollRef.current = 'main';
      headerEl.scrollLeft = mainEl.scrollLeft;
      window.requestAnimationFrame(() => {
        if (syncingScrollRef.current === 'main') {
          syncingScrollRef.current = null;
        }
      });
    }
  }, []);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
    const hasHorizontalOverflow = maxScrollLeft > 4;

    if (hTrackRef.current) {
      const w = hTrackRef.current.clientWidth;
      setHTrackWidth((prev) => (prev === w ? prev : w));
    }

    syncFloatingScrollFromMain();

    setScrollState((prev) => {
      const next: ScrollState = {
        canScrollLeft: el.scrollLeft > 4,
        canScrollRight: el.scrollLeft < maxScrollLeft - 4,
        hasHorizontalOverflow,
        scrollLeft: el.scrollLeft,
        maxScrollLeft,
        clientWidth: el.clientWidth,
        scrollWidth: el.scrollWidth,
      };
      if (
        prev.canScrollLeft === next.canScrollLeft &&
        prev.canScrollRight === next.canScrollRight &&
        prev.hasHorizontalOverflow === next.hasHorizontalOverflow &&
        Math.abs(prev.scrollLeft - next.scrollLeft) < 1 &&
        prev.maxScrollLeft === next.maxScrollLeft &&
        prev.clientWidth === next.clientWidth &&
        prev.scrollWidth === next.scrollWidth
      ) {
        return prev;
      }
      return next;
    });
  }, [syncFloatingScrollFromMain]);

  const updatePinnedHeader = useCallback(() => {
    const cardEl = shellCardRef.current;
    const scrollEl = scrollRef.current;
    if (!cardEl || !scrollEl || !theadElement) {
      setPinnedHeader((prev) => (prev.visible ? INITIAL_PINNED_HEADER : prev));
      return;
    }

    const tableEl = scrollEl.querySelector('table');
    const theadEl = tableEl?.querySelector('thead');
    if (!tableEl || !theadEl) {
      setPinnedHeader((prev) => (prev.visible ? INITIAL_PINNED_HEADER : prev));
      return;
    }

    const appHeader = document.querySelector('header');
    const stickyTop =
      appHeader && appHeader.offsetHeight > 0
        ? Math.round(appHeader.getBoundingClientRect().bottom)
        : 0;

    const theadRect = theadEl.getBoundingClientRect();
    const tableRect = tableEl.getBoundingClientRect();
    const cardRect = cardEl.getBoundingClientRect();

    // Show pinned floating header once real <thead> passes behind the top bar,
    // and release smoothly as the bottom of the table reaches the sticky header.
    const shouldShow =
      theadRect.height > 0 &&
      theadRect.top < stickyTop - 0.5 &&
      tableRect.bottom > stickyTop + 14;

    if (!shouldShow) {
      setPinnedHeader((prev) => (prev.visible ? INITIAL_PINNED_HEADER : prev));
      return;
    }

    const topPx = Math.round(Math.min(stickyTop, tableRect.bottom - theadRect.height));
    const leftPx = Math.round(cardRect.left);
    const widthPx = Math.round(cardRect.width);
    const tableWidthPx = Math.round(tableRect.width * 10) / 10;
    const colWidths = Array.from(theadEl.querySelectorAll('th')).map(
      (th) => Math.round(th.getBoundingClientRect().width * 10) / 10,
    );

    setPinnedHeader((prev) => {
      const sameWidths =
        prev.colWidths.length === colWidths.length &&
        prev.colWidths.every((w, idx) => Math.abs(w - colWidths[idx]) < 0.5);
      if (
        prev.visible &&
        Math.abs(prev.topPx - topPx) < 0.5 &&
        Math.abs(prev.leftPx - leftPx) < 0.5 &&
        Math.abs(prev.widthPx - widthPx) < 0.5 &&
        Math.abs(prev.tableWidthPx - tableWidthPx) < 0.5 &&
        sameWidths
      ) {
        return prev;
      }
      return {
        visible: true,
        topPx,
        leftPx,
        widthPx,
        tableWidthPx,
        colWidths,
      };
    });
  }, [theadElement]);

  useLayoutEffect(() => {
    if (pinnedHeader.visible) {
      syncFloatingScrollFromMain();
    }
  }, [pinnedHeader.visible, syncFloatingScrollFromMain]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();
    updatePinnedHeader();

    let rafId: number | null = null;
    const schedulePinnedUpdate = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updatePinnedHeader();
      });
    };

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            updateScrollState();
            updatePinnedHeader();
          })
        : null;

    if (resizeObserver) {
      resizeObserver.observe(el);
      if (el.firstElementChild) {
        resizeObserver.observe(el.firstElementChild);
      }
    }

    window.addEventListener('scroll', schedulePinnedUpdate, { passive: true });
    window.addEventListener('resize', updateScrollState, { passive: true });
    window.addEventListener('resize', updatePinnedHeader, { passive: true });

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      resizeObserver?.disconnect();
      window.removeEventListener('scroll', schedulePinnedUpdate);
      window.removeEventListener('resize', updateScrollState);
      window.removeEventListener('resize', updatePinnedHeader);
    };
  }, [updateScrollState, updatePinnedHeader]);

  const scrollHorizontally = (direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.max(180, Math.round(el.clientWidth * 0.55));
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  const handleMainScroll = () => {
    if (syncingScrollRef.current === 'header') return;
    updateScrollState();
  };

  const handleFloatingHeaderScroll = () => {
    if (syncingScrollRef.current === 'main') return;
    const mainEl = scrollRef.current;
    const headerEl = floatingHeaderScrollRef.current;
    if (!mainEl || !headerEl) return;
    if (Math.abs(mainEl.scrollLeft - headerEl.scrollLeft) > 0.5) {
      syncingScrollRef.current = 'header';
      mainEl.scrollLeft = headerEl.scrollLeft;
      updateScrollState();
      window.requestAnimationFrame(() => {
        if (syncingScrollRef.current === 'header') {
          syncingScrollRef.current = null;
        }
      });
    }
  };

  const effectiveHTrackWidth = Math.max(120, hTrackWidth || scrollState.clientWidth || 260);
  const hThumbWidth =
    scrollState.scrollWidth > 0
      ? Math.max(
          44,
          Math.min(
            effectiveHTrackWidth * 0.75,
            Math.round((scrollState.clientWidth / scrollState.scrollWidth) * effectiveHTrackWidth),
          ),
        )
      : 56;
  const hTravel = Math.max(1, effectiveHTrackWidth - hThumbWidth);
  const hRatio = scrollState.maxScrollLeft > 0 ? scrollState.scrollLeft / scrollState.maxScrollLeft : 0;
  const hThumbLeft = Math.round(hRatio * hTravel);

  const handleHPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const trackEl = hTrackRef.current;
    const tableScroller = scrollRef.current;
    if (!trackEl || !tableScroller || scrollState.maxScrollLeft <= 0) return;
    event.preventDefault();
    const rect = trackEl.getBoundingClientRect();
    const pointerLocalX = event.clientX - rect.left;
    const insideThumb =
      pointerLocalX >= hThumbLeft - 10 && pointerLocalX <= hThumbLeft + hThumbWidth + 10;
    const tapDir: -1 | 0 | 1 = insideThumb ? 0 : pointerLocalX < hThumbLeft ? -1 : 1;

    hDragRef.current = {
      pointerDown: true,
      dragging: false,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      lastClientX: event.clientX,
      tapDir,
      virtualScrollLeft: tableScroller.scrollLeft,
    };

    try {
      trackEl.setPointerCapture(event.pointerId);
    } catch {
      // Ignore if pointer capture is unavailable
    }
  };

  const handleHPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = hDragRef.current;
    const trackEl = hTrackRef.current;
    const tableScroller = scrollRef.current;
    if (!state.pointerDown || !trackEl || !tableScroller || scrollState.maxScrollLeft <= 0) return;
    event.preventDefault();

    const movedTotal = Math.abs(event.clientX - state.startClientX);
    if (!state.dragging) {
      if (movedTotal < 3) return;
      state.dragging = true;
      state.lastClientX = event.clientX;
      state.virtualScrollLeft = tableScroller.scrollLeft;
      setIsDraggingH(true);
    }

    const dx = event.clientX - state.lastClientX;
    state.lastClientX = event.clientX;
    if (Math.abs(dx) < 0.2) return;

    const travel = Math.max(1, trackEl.clientWidth - hThumbWidth);
    const scale = scrollState.maxScrollLeft / travel;
    const nextScrollLeft = Math.min(
      scrollState.maxScrollLeft,
      Math.max(0, state.virtualScrollLeft + dx * scale),
    );
    state.virtualScrollLeft = nextScrollLeft;
    tableScroller.scrollLeft = nextScrollLeft;
  };

  const handleHPointerEnd = () => {
    const state = hDragRef.current;
    if (!state.pointerDown) return;

    const wasDragging = state.dragging;
    const tapDir = state.tapDir;

    state.pointerDown = false;
    state.dragging = false;
    if (state.pointerId !== null) {
      try {
        hTrackRef.current?.releasePointerCapture(state.pointerId);
      } catch {
        // Ignore if already released
      }
      state.pointerId = null;
    }
    setIsDraggingH(false);

    if (!wasDragging && tapDir !== 0) {
      scrollHorizontally(tapDir);
    }
  };

  return (
    <div className={`min-w-0 pl-7 pr-2 sm:px-0 ${className}`}>
      {scrollState.hasHorizontalOverflow && (
        <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex min-w-0 items-center gap-1.5">
            <ArrowLeftRight className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
            <span className="truncate sm:hidden">1.ª col. y cabecera fijas · Desliza →</span>
            <span className="hidden truncate sm:inline">
              1.ª columna y cabecera fijas al desplazarte
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollHorizontally(-1)}
              disabled={!scrollState.canScrollLeft}
              aria-label="Desplazar tabla a la izquierda"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollHorizontally(1)}
              disabled={!scrollState.canScrollRight}
              aria-label="Desplazar tabla a la derecha"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Window-Sticky Synced Table Header (appears when table header passes under top bar) */}
      {pinnedHeader.visible && tableElement && theadElement && (
        <div
          aria-hidden="true"
          style={{
            top: `${pinnedHeader.topPx}px`,
            left: `${pinnedHeader.leftPx}px`,
            width: `${pinnedHeader.widthPx}px`,
          }}
          className="fixed z-[35] overflow-hidden border-x border-slate-200 bg-slate-100 shadow-[0_4px_10px_-3px_rgba(15,23,42,0.14)] dark:border-slate-700 dark:bg-slate-800 dark:shadow-[0_4px_12px_-3px_rgba(0,0,0,0.5)]"
        >
          <div
            ref={floatingHeaderScrollRef}
            onScroll={handleFloatingHeaderScroll}
            data-scrolled-x={scrollState.canScrollLeft ? 'true' : 'false'}
            className="group/scroll w-full overflow-x-auto touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <table
              className={tableElement.props.className}
              style={{
                width: `${pinnedHeader.tableWidthPx}px`,
                minWidth: `${pinnedHeader.tableWidthPx}px`,
                tableLayout: 'fixed',
              }}
            >
              {pinnedHeader.colWidths.length > 0 && (
                <colgroup>
                  {pinnedHeader.colWidths.map((w, idx) => (
                    <col key={idx} style={{ width: `${w}px` }} />
                  ))}
                </colgroup>
              )}
              {theadElement}
            </table>
          </div>
        </div>
      )}

      <div
        ref={shellCardRef}
        className="relative overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      >
        <div
          ref={scrollRef}
          onScroll={handleMainScroll}
          role="region"
          aria-label={ariaLabel}
          tabIndex={0}
          data-scrolled-x={scrollState.canScrollLeft ? 'true' : 'false'}
          className="group/scroll w-full overflow-x-auto overscroll-auto touch-pan-x touch-pan-y focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          {children}
        </div>

        {scrollState.canScrollRight && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-[15] w-5 bg-gradient-to-l from-slate-900/[0.06] to-transparent dark:from-black/35"
          />
        )}

        {scrollState.hasHorizontalOverflow && (
          <div className="border-t border-slate-200/80 bg-slate-100/70 px-2 py-1.5 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/70">
            <div
              ref={hTrackRef}
              role="scrollbar"
              aria-orientation="horizontal"
              aria-label="Barra traslúcida horizontal de la tabla"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(hRatio * 100)}
              onPointerDown={handleHPointerDown}
              onPointerMove={handleHPointerMove}
              onPointerUp={handleHPointerEnd}
              onPointerCancel={handleHPointerEnd}
              className="relative flex h-3.5 w-full touch-none select-none items-center rounded-full bg-slate-200/70 backdrop-blur-sm cursor-grab active:cursor-grabbing dark:bg-slate-800/75"
            >
              <div
                style={{
                  width: `${hThumbWidth}px`,
                  transform: `translateX(${hThumbLeft}px)`,
                }}
                className={`pointer-events-none h-2.5 rounded-full border backdrop-blur-md transition-colors duration-150 ${
                  isDraggingH
                    ? 'border-sky-300/80 bg-sky-600/80 shadow-sm dark:border-sky-300/60 dark:bg-sky-400/80'
                    : 'border-white/70 bg-slate-600/45 hover:bg-sky-600/70 dark:border-slate-500/50 dark:bg-slate-300/40 dark:hover:bg-sky-400/70'
                }`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
