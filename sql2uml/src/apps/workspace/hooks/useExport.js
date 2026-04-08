// src/apps/workspace/hooks/useExport.js
// Xử lý export diagram ra PNG, SVG, SQL, JSON

import { useCallback } from 'react';
import { getNodesBounds, getViewportForBounds } from 'reactflow';
import { toPng, toSvg } from 'html-to-image';
import { generateSQL } from '../../../shared/utils/Sqlparser';

// ── Cài: npm install html-to-image ────────────────────────────────────

export function useExport({ nodes, edges, diagramTitle }) {

  // ── Export PNG ────────────────────────────────────────────────────
  const exportPNG = useCallback(async () => {
    const viewport = document.querySelector('.react-flow__viewport');
    if (!viewport) return;

    try {
      const dataUrl = await toPng(viewport, {
        backgroundColor: '#f8fafc',
        quality: 1,
        pixelRatio: 2,   // retina
      });
      download(dataUrl, `${diagramTitle || 'diagram'}.png`);
    } catch (e) {
      console.error('Export PNG failed:', e);
    }
  }, [diagramTitle]);

  // ── Export SVG ────────────────────────────────────────────────────
  const exportSVG = useCallback(async () => {
    const viewport = document.querySelector('.react-flow__viewport');
    if (!viewport) return;

    try {
      const dataUrl = await toSvg(viewport, {
        backgroundColor: '#f8fafc',
      });
      download(dataUrl, `${diagramTitle || 'diagram'}.svg`);
    } catch (e) {
      console.error('Export SVG failed:', e);
    }
  }, [diagramTitle]);

  // ── Export SQL ────────────────────────────────────────────────────
  const exportSQL = useCallback(() => {
    const sql = generateSQL(nodes, edges);
    const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
    download(URL.createObjectURL(blob), `${diagramTitle || 'diagram'}.sql`);
  }, [nodes, edges, diagramTitle]);

  // ── Export JSON ───────────────────────────────────────────────────
  const exportJSON = useCallback(() => {
    const data = {
      title:     diagramTitle || 'diagram',
      exportedAt: new Date().toISOString(),
      nodes: nodes.map(n => {
        const { onUpdate, lockedBy, lockedColor, currentUserId, ...data } = n.data;
        return {
          id:         n.id,
          type:       n.type,
          position:   n.position,
          data,
        };
      }),
      edges: edges.map(e => ({
        id:     e.id,
        source: e.source,
        target: e.target,
        type:   e.type,
        label:  e.label,
      })),
    };
    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: 'application/json' }
    );
    download(URL.createObjectURL(blob), `${diagramTitle || 'diagram'}.json`);
  }, [nodes, edges, diagramTitle]);

  // ── Handler chính — nhận label từ EditorHeader File menu ─────────
  const handleExport = useCallback((label) => {
    switch (label) {
      case 'Export PNG':  exportPNG();  break;
      case 'Export SVG':  exportSVG();  break;
      case 'Export SQL':  exportSQL();  break;
      case 'Export JSON': exportJSON(); break;
      default: break;
    }
  }, [exportPNG, exportSVG, exportSQL, exportJSON]);

  return { handleExport };
}

// ── Helper: trigger download ──────────────────────────────────────────
function download(url, filename) {
  const a = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  // Revoke object URL sau 1s để tránh memory leak
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}