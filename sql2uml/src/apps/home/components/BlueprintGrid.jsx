import { useState } from 'react'
import { THEME } from '../../../shared/constants/theme'
import { BlueprintCard, NewProjectCard } from './BlueprintCard'

export default function BlueprintGrid({ diagrams = [], onOpen, onNew, onDelete }) {
  const [viewMode, setViewMode] = useState('grid')

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 16,
      }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
          Active Blueprints
          <span style={{
            marginLeft: 8, fontSize: 11, fontWeight: 500,
            color: '#9ca3af',
          }}>
            ({diagrams.length})
          </span>
        </h2>

        <div style={{ display: 'flex', gap: 4 }}>
          {['grid', 'list'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                width: 28, height: 28, borderRadius: 7,
                border: `1px solid ${viewMode === mode ? THEME.colors.PRIMARY + '40' : '#e8eaed'}`,
                backgroundColor: viewMode === mode ? THEME.colors.PRIMARY + '10' : 'transparent',
                color: viewMode === mode ? THEME.colors.PRIMARY : '#9ca3af',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {mode === 'grid' ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: viewMode === 'grid'
          ? 'repeat(auto-fill, minmax(220px, 1fr))'
          : '1fr',
        gap: 14,
      }}>
        <NewProjectCard onClick={onNew} />
        {diagrams.map(diagram => (
          <BlueprintCard
            key={diagram.id}
            diagram={diagram}
            onClick={() => onOpen?.(diagram)}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Empty state */}
      {diagrams.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '48px 0',
          color: '#9ca3af', fontSize: 13,
        }}>
          Chưa có diagram nào — tạo mới để bắt đầu!
        </div>
      )}
    </div>
  )
}