// src/shared/hooks/useResizable.js

import { useState, useRef, useCallback } from 'react';
import { THEME } from '../constants/theme';

// ── Kéo ngang ────────────────────────────────────────────────────────
export function useHorizontalResize() {
  const [width, setWidth] = useState(THEME.panel.defaultWidth);
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
      const max = window.innerWidth * THEME.panel.maxWidthRatio;
      setWidth(Math.min(max, Math.max(THEME.panel.minWidth, startW.current + e.clientX - startX.current)));
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
  const [topPct, setTopPct] = useState(THEME.panel.topPctDefault);
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
      setTopPct(Math.min(THEME.panel.topPctMax, Math.max(THEME.panel.topPctMin, startP.current + (delta / h) * 100)));
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