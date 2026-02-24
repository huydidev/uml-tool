// src/apps/workspace/components/layout/SidePanel.jsx

import { useState, useRef } from 'react';
import { THEME } from '../../../../shared/constants/theme';
import { useHorizontalResize, useVerticalResize } from '../../../../shared/hooks/useResizable';
import { HorizontalResizeHandle, VerticalResizeHandle } from '../../../../shared/components/ResizeHandle';
import TableRow       from '../panel/TableRow';
import NodeProperties from '../panel/NodeProperties';
import SQLParserPanel from '../panel/SQLParserPanel';

function SectionHeader({ icon, label }) {
  return (
    <div className={`px-3 py-2.5 border-b ${THEME.border} shrink-0 flex items-center gap-2`}>
      {icon && <span className={THEME.accentViolet}>{icon}</span>}
      <p className={THEME.label}>{label}</p>
    </div>
  );
}

export default function SidePanel({
  nodes, edges,
  selectedNode, onCloseNode, onNodeUpdate,
  onSyncToCanvas,
}) {
  const [openTableId, setOpenTableId] = useState(null);
  const panelRef = useRef(null);

  const { width, onMouseDown: onHMouseDown }  = useHorizontalResize();
  const { topPct, onMouseDown: onVMouseDown } = useVerticalResize(panelRef);

  return (
    <div
      ref={panelRef}
      style={{ width }}
      className={`${THEME.bgPanel} border-r ${THEME.border} flex flex-col shrink-0 overflow-hidden relative`}
    >
      <HorizontalResizeHandle onMouseDown={onHMouseDown} />

      {/* Top: Tables / NodeProperties */}
      <div className="flex flex-col overflow-hidden" style={{ height: `${topPct}%` }}>
        {!selectedNode ? (
          <>
            <SectionHeader label={`Tables (${nodes.length})`} />
            <div className="flex-1 overflow-y-auto">
              {nodes.length === 0 && (
                <p className={`text-[10px] ${THEME.textGhost} italic px-3 py-4`}>
                  Gõ SQL bên dưới để tạo bảng
                </p>
              )}
              {nodes.map(node => (
                <TableRow
                  key={node.id}
                  node={node}
                  isOpen={openTableId === node.id}
                  onToggle={() => setOpenTableId(id => id === node.id ? null : node.id)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <NodeProperties
              node={selectedNode}
              onClose={onCloseNode}
              onUpdate={onNodeUpdate}
            />
          </div>
        )}
      </div>

      <VerticalResizeHandle onMouseDown={onVMouseDown} />

      {/* Bottom: SQL Editor */}
      <div className="flex flex-col overflow-hidden flex-1">
        <SectionHeader icon="⚡" label="SQL Editor" />
        <div className="flex-1 overflow-hidden">
          <SQLParserPanel onSyncToCanvas={onSyncToCanvas} />
        </div>
      </div>
    </div>
  );
}