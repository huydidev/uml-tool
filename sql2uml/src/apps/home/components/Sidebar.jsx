import { useState } from 'react'
import { THEME } from "../../../shared/constants/theme"

const TOOLS = [
  {
    id: 'canvas',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    id: 'connect',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/>
        <path d="M9 12h6"/><circle cx="12" cy="5" r="2"/><circle cx="12" cy="19" r="2"/>
        <path d="M12 7v3M12 14v3"/>
      </svg>
    ),
  },
  {
    id: 'group',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="9" height="9" rx="1"/><rect x="13" y="7" width="9" height="9" rx="1"/>
        <path d="M6.5 7V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v2"/>
      </svg>
    ),
  },
  {
    id: 'note',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/>
      </svg>
    ),
  },
]

export default function Sidebar({ activeToolId = 'canvas', onToolChange }) {
  return (
    <div style={{
      width: 52,
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e8eaed',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 16,
      paddingBottom: 16,
      gap: 6,
      flexShrink: 0,
    }}>
      {TOOLS.map(tool => {
        const isActive = activeToolId === tool.id
        return (
          <button
            key={tool.id}
            onClick={() => onToolChange?.(tool.id)}
            style={{
              width: 36, height: 36,
              borderRadius: 10,
              border: `1px solid ${isActive ? THEME.colors.PRIMARY + '50' : 'transparent'}`,
              backgroundColor: isActive ? THEME.colors.PRIMARY : 'transparent',
              color: isActive ? '#ffffff' : '#9ca3af',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {tool.icon}
          </button>
        )
      })}

      {/* Add button ở dưới cùng */}
      <div style={{ flex: 1 }} />
      <button style={{
        width: 36, height: 36,
        borderRadius: 10,
        border: '1.5px dashed #d1d5db',
        backgroundColor: 'transparent',
        color: '#9ca3af',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontSize: 20, lineHeight: 1,
      }}>
        +
      </button>
    </div>
  )
}