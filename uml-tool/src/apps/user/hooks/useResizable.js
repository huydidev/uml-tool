// src/apps/user/hooks/useResizable.js

import { useState, useRef, useCallback } from 'react';
import { PANEL } from '../../../shared/constants/theme';

// ── Kéo ngang ────────────────────────────────────────────────────────
export function useHorizontalResize() {
  const [width, setWidth] = useState(PANEL.DEFAULT_WIDTH);
  const dragging = useRef(false);
  const startX   = useRef(0);
  const startW   = useRef(0);

  const onMouseDown = useCallback((e) => {
    dragging.current = true;
    startX.current   = e.clientX;
    startW.current   = width;
    document.body.style.cursor     = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (e) => {
      if (!dragging.current) return;
      const max = window.innerWidth * PANEL.MAX_WIDTH_RATIO;
      setWidth(Math.min(max, Math.max(PANEL.MIN_WIDTH, startW.current + e.clientX - startX.current)));
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [width]);

  return { width, onMouseDown };
}

// ── Kéo dọc ──────────────────────────────────────────────────────────
export function useVerticalResize(panelRef) {
  const [topPct, setTopPct] = useState(PANEL.TOP_PCT_DEFAULT);
  const dragging = useRef(false);
  const startY   = useRef(0);
  const startP   = useRef(0);

  const onMouseDown = useCallback((e) => {
    dragging.current = true;
    startY.current   = e.clientY;
    startP.current   = topPct;
    document.body.style.cursor     = 'row-resize';
    document.body.style.userSelect = 'none';

    const onMove = (e) => {
      if (!dragging.current || !panelRef.current) return;
      const h     = panelRef.current.getBoundingClientRect().height;
      const delta = e.clientY - startY.current;
      setTopPct(Math.min(PANEL.TOP_PCT_MAX, Math.max(PANEL.TOP_PCT_MIN, startP.current + (delta / h) * 100)));
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [topPct, panelRef]);

  return { topPct, onMouseDown };
}