// src/apps/workspace/components/layout/EditorHeader.jsx
// Commit 9: Thêm OnlineAvatars + hiển thị đúng tên/avatar user đang login

import { useState, useRef, useEffect } from 'react'
import { THEME } from '../../../../shared/constants/theme'
import OnlineAvatars from './OnlineAvatars'

const FILE_MENU = [
  { icon: <IconImage />, label: 'Export PNG'  },
  { icon: <IconSvg />,   label: 'Export SVG'  },
  { icon: <IconSql />,   label: 'Export SQL'  },
  { icon: <IconJson />,  label: 'Export JSON' },
]

export default function EditorHeader({
  left, center, right,
  onSave, onOpenShare, isShared,
  saveStatusLabel, diagramTitle,
  onExport,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onOpenHistory,
  currentUserId,
}) {
  const [fileOpen, setFileOpen] = useState(false)
  const fileRef = useRef(null)

  const userInfo = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })()

  const userInitial = userInfo?.name
    ? userInfo.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : (userInfo?.email?.[0] || 'U').toUpperCase()

  useEffect(() => {
    if (!fileOpen) return
    const handler = (e) => {
      if (fileRef.current && !fileRef.current.contains(e.target))
        setFileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [fileOpen])

  return (
    <div className={`${THEME.bgPanel} h-12 shrink-0 flex items-center px-4 gap-3 border-b ${THEME.border}`}>

      {/* ── Trái ── */}
      <div className="flex items-center gap-2 shrink-0">
        {left}

        <h1
          className="font-black text-sm tracking-[0.18em] shrink-0"
          style={{ color: THEME.colors.PRIMARY }}
        >
          Sql2Uml
        </h1>

        <span className={`w-px h-4 ${THEME.resizeBarIdle} opacity-50`} />

        {/* File dropdown */}
        <div className="relative" ref={fileRef}>
          <button
            onClick={() => setFileOpen(v => !v)}
            className={`
              flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md
              ${THEME.bgHover} ${THEME.textSecondary}
              border ${fileOpen ? THEME.borderAccent : 'border-transparent'} transition-all
            `}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            File
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: fileOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {fileOpen && (
            <div className={`
              absolute left-0 top-full mt-1.5 w-44 z-50
              ${THEME.bgPanel} border ${THEME.border} rounded-xl shadow-lg overflow-hidden
            `}>
              {FILE_MENU.map(({ icon, label }) => (
                <button
                  key={label}
                  onClick={() => { onExport?.(label); setFileOpen(false) }}
                  className={`
                    w-full flex items-center gap-2.5 px-3 py-2
                    text-xs font-medium ${THEME.textSecondary} ${THEME.bgHover}
                    transition-colors text-left
                  `}
                >
                  <span className={THEME.accentPrimary}>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className={`w-px h-4 ${THEME.resizeBarIdle} opacity-50`} />

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`
              w-7 h-7 flex items-center justify-center rounded-md border transition-all
              ${canUndo
                ? `${THEME.textSecondary} ${THEME.bgHover} border-transparent`
                : `opacity-30 cursor-not-allowed border-transparent ${THEME.textSecondary}`
              }
            `}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6"/>
              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
            </svg>
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`
              w-7 h-7 flex items-center justify-center rounded-md border transition-all
              ${canRedo
                ? `${THEME.textSecondary} ${THEME.bgHover} border-transparent`
                : `opacity-30 cursor-not-allowed border-transparent ${THEME.textSecondary}`
              }
            `}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 7v6h-6"/>
              <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/>
            </svg>
          </button>
        </div>

        <span className={`w-px h-4 ${THEME.resizeBarIdle} opacity-50`} />

        {/* History */}
        <button
          onClick={onOpenHistory}
          title="Version History (Ctrl+H)"
          className={`
            w-7 h-7 flex items-center justify-center rounded-md
            border border-transparent transition-all
            ${THEME.textSecondary} ${THEME.bgHover}
          `}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v5h5"/>
            <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/>
            <path d="M12 7v5l4 2"/>
          </svg>
        </button>
      </div>

      {/* ── Giữa: title + status ── */}
      <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
        {center}
        <span className={`text-sm font-medium ${THEME.textPrimary} truncate`}>
          {diagramTitle || 'Untitled Diagram'}
        </span>
        {saveStatusLabel && (
          <span className={`text-[10px] font-semibold shrink-0 ${saveStatusLabel.color}`}>
            {saveStatusLabel.text}
          </span>
        )}
      </div>

      {/* ── Phải ── */}
      <div className="flex items-center gap-3 shrink-0">
        {right}

        {/* Online avatars của user khác trong room */}
        <OnlineAvatars currentUserId={currentUserId} />

        {/* Share */}
        <button
          onClick={onOpenShare}
          className={`
            text-xs font-medium px-3 py-1.5 rounded-md transition-all
            ${isShared
              ? `${THEME.accentPrimary} bg-[${THEME.colors.PRIMARY}14]`
              : `${THEME.textSecondary} ${THEME.bgHover}`
            }
          `}
        >
          {isShared ? 'Shared' : 'Share'}
        </button>

        {/* Save */}
        <button
          onClick={onSave}
          className={`${THEME.btnPrimary} text-xs px-4 py-1.5 rounded-md`}
        >
          Save
        </button>

        {/* Avatar user đang login */}
        <div
          title={userInfo?.name || userInfo?.email || 'User'}
          className={`
            w-7 h-7 rounded-full flex items-center justify-center
            text-xs font-bold cursor-pointer
            hover:opacity-80 transition-all
          `}
          style={{ backgroundColor: THEME.colors.PRIMARY, color: '#ffffff' }}
        >
          {userInitial}
        </div>
      </div>
    </div>
  )
}

function IconImage() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  )
}
function IconSvg() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7"/>
      <line x1="9" y1="20" x2="15" y2="20"/>
      <line x1="12" y1="4" x2="12" y2="20"/>
    </svg>
  )
}
function IconSql() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  )
}
function IconJson() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="16" y2="17"/>
    </svg>
  )
}