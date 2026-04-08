// src/apps/workspace/pages/SharedViewerPage.jsx
// Trang xem diagram qua shareToken — không cần đăng nhập, read-only

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ReactFlowProvider, useReactFlow } from 'reactflow'
import { THEME } from '../../../shared/constants/theme'
import EditorCanvas from '../components/canvas/EditorCanvas'
import { useDiagramStore } from '../../../shared/store/diagramStore'

function apiNodesToFlow(apiNodes = []) {
  return apiNodes.map(n => ({
    id:       n.id,
    type:     n.type || 'umlClass',
    position: { x: n.x ?? 0, y: n.y ?? 0 },
    width:    n.width,
    height:   n.height,
    data: {
      label:      n.label || 'TABLE',
      tableName:  (n.label || 'table').toLowerCase().replace(/[^a-z0-9]/g, '_'),
      tableId:    n.id,
      attributes: (n.attributes || []).map(a =>
        typeof a === 'string' ? a
          : `${a.isPK ? '+' : '-'} ${a.name}: ${(a.type || 'string').toLowerCase()}`
      ),
      methods:  [],
      viewMode: 'class',
    },
  }))
}

function apiEdgesToFlow(apiEdges = []) {
  return apiEdges.map(e => ({
    id:     e.id,
    source: e.from,
    target: e.to,
    type:   'association',
    label:  e.label || '',
    data:   { cardinality: e.cardinality },
  }))
}

function SharedViewerInner() {
  useReactFlow()
  const { token }  = useParams()
  const navigate   = useNavigate()
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [title, setTitle]       = useState('')

  const nodes = useDiagramStore(s => s.nodes)
  const edges = useDiagramStore(s => s.edges)
  const store = useDiagramStore.getState

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/diagrams/shared/${token}`)
        if (!res.ok) throw new Error('Link không hợp lệ hoặc đã hết hạn')
        const data = await res.json()
        setTitle(data.title || 'Untitled Diagram')
        store().loadDiagram(
          apiNodesToFlow(data.nodes || []),
          apiEdgesToFlow(data.edges || [])
        )
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    init()
    return () => store().reset()
  }, [token])

  if (loading) {
    return (
      <div className={`w-screen h-screen flex items-center justify-center ${THEME.bgApp}`}>
        <p className={`text-sm ${THEME.textSecondary}`}>Đang tải diagram...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`w-screen h-screen flex flex-col items-center justify-center gap-4 ${THEME.bgApp}`}>
        <p style={{ fontSize: 14, color: '#ef4444', fontWeight: 600 }}>{error}</p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '8px 20px', borderRadius: 9,
            backgroundColor: THEME.colors.PRIMARY,
            color: '#fff', fontSize: 13, fontWeight: 600,
            border: 'none', cursor: 'pointer',
          }}
        >
          Về trang chủ
        </button>
      </div>
    )
  }

  return (
    <div className={`w-screen h-screen flex flex-col overflow-hidden ${THEME.bgApp}`}>
      {/* Header read-only */}
      <div className={`${THEME.bgPanel} h-12 shrink-0 flex items-center px-4 gap-3 border-b ${THEME.border}`}>
        <h1 className="font-black text-sm tracking-[0.18em]" style={{ color: THEME.colors.PRIMARY }}>
          Sql2Uml
        </h1>
        <span className={`w-px h-4 ${THEME.resizeBarIdle} opacity-50`} />
        <span className={`text-sm font-medium ${THEME.textPrimary}`}>{title}</span>
        <span style={{
          fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
          backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a',
        }}>
          READ ONLY
        </span>

        <div style={{ flex: 1 }} />

        <button
          onClick={() => navigate('/')}
          style={{
            padding: '6px 14px', borderRadius: 8,
            border: `1px solid ${THEME.colors.PRIMARY}40`,
            backgroundColor: THEME.colors.PRIMARY + '10',
            color: THEME.colors.PRIMARY,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Đăng nhập để chỉnh sửa
        </button>
      </div>

      {/* Canvas — read-only: disable tất cả edit handlers */}
      <EditorCanvas
        nodes={nodes}
        edges={edges}
        setNodes={() => {}}
        setEdges={() => {}}
        selectedEdgeType="association"
        onEdgeTypeChange={() => {}}
        onNodeClick={() => {}}
        onPaneClick={() => {}}
        onAddNode={() => {}}
        onDeleteNode={() => {}}
        onEdgeConnect={() => {}}
        onEdgesDelete={() => {}}
        onNodeDragStart={() => {}}
        onNodeDragStop={() => {}}
        onCursorMove={null}
        viewMode="class"
        onViewModeChange={() => {}}
        currentUserId={null}
      />
    </div>
  )
}

export default function SharedViewerPage() {
  return <ReactFlowProvider><SharedViewerInner /></ReactFlowProvider>
}