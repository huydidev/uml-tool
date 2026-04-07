import { useState, useRef, useEffect } from 'react'
import { THEME } from '../../../shared/constants/theme'

const STATUS_STYLES = {
  URGENT:   { bg: '#fff1f2', color: '#e11d48' },
  DRAFT:    { bg: '#f1f5f9', color: '#64748b' },
  REVIEWED: { bg: '#f0fdf4', color: '#16a34a' },
}

const ICON_COLORS = ['#818cf8', '#f472b6', '#34d399', '#fb923c', '#60a5fa']

function Avatar({ index }) {
  const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#3b82f6']
  return (
    <div style={{
      width: 22, height: 22, borderRadius: '50%',
      backgroundColor: colors[index % colors.length],
      border: '2px solid #fff', marginLeft: index === 0 ? 0 : -6,
      flexShrink: 0, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff',
    }}>
      {String.fromCharCode(65 + index)}
    </div>
  )
}

// ── Confirm Delete ───────────────────────────────────────────────
function ConfirmDelete({ title, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: 14, padding: '24px 28px',
        width: 340, boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
          Xóa diagram?
        </h3>
        <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 20 }}>
          <strong style={{ color: '#374151' }}>{title}</strong> sẽ bị xóa vĩnh viễn.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '8px 18px', borderRadius: 8, border: '1px solid #e2e8f0',
            backgroundColor: '#f9fafb', fontSize: 12, fontWeight: 600,
            color: '#374151', cursor: 'pointer',
          }}>Hủy</button>
          <button onClick={onConfirm} style={{
            padding: '8px 18px', borderRadius: 8, border: 'none',
            backgroundColor: '#ef4444', fontSize: 12, fontWeight: 600,
            color: '#fff', cursor: 'pointer',
          }}>Xóa</button>
        </div>
      </div>
    </div>
  )
}

// ── Share Modal ──────────────────────────────────────────────────
function ShareModal({ diagram, onClose }) {
  const [userId, setUserId]   = useState('')
  const [role, setRole]       = useState('VIEWER')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [success, setSuccess] = useState(false)

  const handleShare = async (e) => {
    e.preventDefault()
    if (!userId.trim()) return
    setError(null)
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/share/${diagram.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: userId.trim(), role }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Chia sẻ thất bại')
      }
      setSuccess(true)
      setUserId('')
      setTimeout(() => setSuccess(false), 2500)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff', borderRadius: 16, padding: '24px 28px',
          width: 380, boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 3 }}>
              Chia sẻ diagram
            </h3>
            <p style={{ fontSize: 11, color: '#6b7280' }}>{diagram.title}</p>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 8, border: '1px solid #e2e8f0',
            backgroundColor: '#f9fafb', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Share link */}
        {diagram.shareToken && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 12px', borderRadius: 10,
            backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 18,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={THEME.colors.PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            <span style={{
              flex: 1, fontSize: 11, color: '#374151',
              fontFamily: 'monospace', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {window.location.origin}/shared/{diagram.shareToken}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/shared/${diagram.shareToken}`)}
              style={{
                fontSize: 10, fontWeight: 600, color: THEME.colors.PRIMARY,
                border: 'none', backgroundColor: 'transparent',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              Copy
            </button>
          </div>
        )}

        {/* Form invite */}
        <form onSubmit={handleShare} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              User ID
            </label>
            <input
              type="text"
              placeholder="Nhập User ID của người nhận"
              value={userId}
              onChange={e => { setUserId(e.target.value); setError(null) }}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '9px 12px', borderRadius: 9,
                border: '1px solid #e2e8f0', backgroundColor: '#f8fafc',
                fontSize: 13, color: '#111827', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = THEME.colors.PRIMARY}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          {/* Role toggle */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Quyền
            </label>
            <div style={{
              display: 'flex', border: '1px solid #e2e8f0',
              borderRadius: 9, overflow: 'hidden',
            }}>
              {['VIEWER', 'EDITOR'].map(r => (
                <button
                  key={r} type="button"
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1, padding: '8px 0', border: 'none',
                    fontSize: 12, fontWeight: 600,
                    backgroundColor: role === r ? THEME.colors.PRIMARY : '#f8fafc',
                    color: role === r ? '#fff' : '#6b7280',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {r === 'VIEWER' ? '👁 Xem' : '✏️ Chỉnh sửa'}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{
              padding: '8px 12px', borderRadius: 8,
              backgroundColor: '#fff1f2', border: '1px solid #fecdd3',
              fontSize: 12, color: '#e11d48',
            }}>{error}</div>
          )}

          {success && (
            <div style={{
              padding: '8px 12px', borderRadius: 8,
              backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
              fontSize: 12, color: '#16a34a',
            }}>Chia sẻ thành công!</div>
          )}

          <button
            type="submit"
            disabled={loading || !userId.trim()}
            style={{
              padding: '10px 0', borderRadius: 9, border: 'none',
              backgroundColor: loading || !userId.trim() ? '#93c5fd' : THEME.colors.PRIMARY,
              color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: loading || !userId.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Đang chia sẻ...' : 'Chia sẻ'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── BlueprintCard chính ──────────────────────────────────────────
export function BlueprintCard({ diagram: initialDiagram, onClick, onDelete }) {
  const [diagram, setDiagram]           = useState(initialDiagram)
  const [hovered, setHovered]           = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [showShare, setShowShare]       = useState(false)
  const [deleting, setDeleting]         = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleVal, setTitleVal]         = useState(diagram.title || '')
  const titleInputRef                   = useRef(null)

  const iconColor     = ICON_COLORS[(diagram.title?.charCodeAt(0) || 0) % ICON_COLORS.length]
  const status        = STATUS_STYLES[diagram.status] || STATUS_STYLES.DRAFT
  const collaborators = diagram.collaborators || 1
  const progress      = diagram.progress ?? 0

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus()
  }, [editingTitle])

  const handleTitleSave = async () => {
    const newTitle = titleVal.trim()
    if (!newTitle || newTitle === diagram.title) {
      setEditingTitle(false)
      setTitleVal(diagram.title)
      return
    }
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/diagrams/${diagram.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...diagram, title: newTitle }),
      })
      if (!res.ok) throw new Error()
      setDiagram(d => ({ ...d, title: newTitle }))
    } catch {
      setTitleVal(diagram.title)
    } finally {
      setEditingTitle(false)
    }
  }

  const handleDelete = async () => {
    setShowConfirm(false)
    setDeleting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/diagrams/${diagram.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      onDelete?.(diagram.id)
    } catch {
      setDeleting(false)
    }
  }

  return (
    <>
      {showConfirm && (
        <ConfirmDelete
          title={diagram.title}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      {showShare && (
        <ShareModal diagram={diagram} onClose={() => setShowShare(false)} />
      )}

      <div
        onClick={() => !editingTitle && onClick?.()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          backgroundColor: '#ffffff',
          border: `1px solid ${hovered ? THEME.colors.PRIMARY + '60' : '#e8eaed'}`,
          borderRadius: 14, padding: 18, cursor: 'pointer',
          transition: 'all 0.18s', display: 'flex',
          flexDirection: 'column', gap: 12, minHeight: 160,
          position: 'relative',
          boxShadow: hovered ? `0 4px 16px ${THEME.colors.PRIMARY}18` : 'none',
          transform: hovered ? 'translateY(-1px)' : 'none',
          opacity: deleting ? 0.4 : 1,
        }}
      >
        {/* 3 action buttons — hiện khi hover */}
        {hovered && !deleting && (
          <div
            style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 5 }}
            onClick={e => e.stopPropagation()}
          >
            <ActionBtn
              title="Đổi tên"
              color={THEME.colors.PRIMARY}
              border="#e2e8f0" bg="#f8fafc" hoverBg="#eff6ff"
              onClick={() => setEditingTitle(true)}
              icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              }
            />
            <ActionBtn
              title="Chia sẻ"
              color={THEME.colors.PRIMARY}
              border="#e2e8f0" bg="#f8fafc" hoverBg="#eff6ff"
              onClick={() => setShowShare(true)}
              icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              }
            />
            <ActionBtn
              title="Xóa"
              color="#ef4444"
              border="#fecdd3" bg="#fff1f2" hoverBg="#fee2e2"
              onClick={() => setShowConfirm(true)}
              icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              }
            />
          </div>
        )}

        {/* Icon + status */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            backgroundColor: iconColor + '18',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"/>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
          </div>
          {diagram.status && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
              backgroundColor: status.bg, color: status.color, letterSpacing: '0.05em',
              marginRight: hovered ? 94 : 0, transition: 'margin 0.15s',
            }}>
              {diagram.status}
            </span>
          )}
        </div>

        {/* Title inline edit */}
        <div>
          {editingTitle ? (
            <input
              ref={titleInputRef}
              value={titleVal}
              onChange={e => setTitleVal(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={e => {
                if (e.key === 'Enter') handleTitleSave()
                if (e.key === 'Escape') { setEditingTitle(false); setTitleVal(diagram.title) }
              }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', boxSizing: 'border-box',
                fontSize: 14, fontWeight: 600, color: '#111827',
                border: `1.5px solid ${THEME.colors.PRIMARY}`,
                borderRadius: 6, padding: '3px 7px',
                backgroundColor: '#f0f7ff', outline: 'none', marginBottom: 4,
              }}
            />
          ) : (
            <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
              {diagram.title || 'Untitled Diagram'}
            </p>
          )}
          <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
            {diagram.description || 'Không có mô tả'}
          </p>
        </div>

        {/* Avatars + progress */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {Array.from({ length: Math.min(collaborators, 3) }).map((_, i) => (
                <Avatar key={i} index={i} />
              ))}
              {collaborators > 3 && (
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  backgroundColor: '#f1f5f9', border: '2px solid #fff', marginLeft: -6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, fontWeight: 700, color: '#64748b',
                }}>
                  +{collaborators - 3}
                </div>
              )}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: progress >= 80 ? '#16a34a' : progress >= 40 ? THEME.colors.PRIMARY : '#64748b',
            }}>
              {progress}% Complete
            </span>
          </div>
          <div style={{ height: 4, borderRadius: 4, backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progress}%`, borderRadius: 4,
              backgroundColor: progress >= 80 ? '#16a34a' : THEME.colors.PRIMARY,
              transition: 'width 0.3s ease',
            }}/>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Helper: icon button nhỏ ──────────────────────────────────────
function ActionBtn({ title, icon, color, border, bg, hoverBg, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 26, height: 26, borderRadius: 7,
        border: `1px solid ${border}`,
        backgroundColor: hov ? hoverBg : bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color, transition: 'background 0.15s',
      }}
    >
      {icon}
    </button>
  )
}

// ── NewProjectCard ───────────────────────────────────────────────
export function NewProjectCard({ onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? THEME.colors.PRIMARY + '06' : '#fafbfc',
        border: `1.5px dashed ${hovered ? THEME.colors.PRIMARY : '#d1d5db'}`,
        borderRadius: 14, padding: 18, cursor: 'pointer', transition: 'all 0.18s',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 160,
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: '50%',
        border: `1.5px solid ${THEME.colors.PRIMARY}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: THEME.colors.PRIMARY,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 3 }}>New Diagram</p>
        <p style={{ fontSize: 11, color: '#9ca3af' }}>Start from a clean slate</p>
      </div>
    </div>
  )
}