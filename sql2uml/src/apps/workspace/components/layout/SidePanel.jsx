// src/apps/workspace/components/layout/SidePanel.jsx

import { useRef } from 'react'
import { THEME } from '../../../../shared/constants/theme'
import { useHorizontalResize } from '../../../../shared/hooks/useResizable'
import { HorizontalResizeHandle } from '../../../../shared/components/ResizeHandle'
import SQLParserPanel from '../panel/SQLParserPanel'

export default function SidePanel({
  onSyncToCanvas,
  sqlPanelRef,
}) {
  const panelRef = useRef(null)
  const { width, onMouseDown: onHMouseDown } = useHorizontalResize()

  return (
    <div
      ref={panelRef}
      style={{ width }}
      className={`${THEME.bgPanel} border-r ${THEME.border} flex flex-col shrink-0 overflow-hidden relative`}
    >
      <HorizontalResizeHandle onMouseDown={onHMouseDown} />

      {/* Header — khớp với thiết kế */}
      <div
        className={`px-3 py-2.5 border-b ${THEME.border} shrink-0 flex items-center justify-between`}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: THEME.colors.MUTED }}
        >
          SQL Schema Definition
        </span>
        <svg
          width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke={THEME.colors.MUTED} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="15 3 21 3 21 9"/>
          <polyline points="9 21 3 21 3 15"/>
          <line x1="21" y1="3" x2="14" y2="10"/>
          <line x1="3" y1="21" x2="10" y2="14"/>
        </svg>
      </div>

      {/* SQL Editor — full height */}
      <div className="flex-1 overflow-hidden">
        <SQLParserPanel
          ref={sqlPanelRef}
          onSyncToCanvas={onSyncToCanvas}
        />
      </div>
    </div>
  )
}