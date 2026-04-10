
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { tokens } from '../constants/Tokens'
import HomeHeader from '../../apps/home/components/HomeHeader'
import Sidebar from '../../apps/home/components/Sidebar'

// ── Card cho diagram được share ───────────────────────────────────
function SharedDiagramCard({ diagram, onClick }) {
  const [hovered, setHovered] = useState(false)

  const iconColor = ['#818cf8', '#f472b6', '#34d399', '#fb923c', '#60a5fa'][
    (diagram.title?.charCodeAt(0) || 0) % 5
  ]

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: tokens.color.white,
        border: `1px solid ${hovered ? tokens.color.primary + '60' : tokens.color.border}`,
        borderRadius: tokens.radius.xl,
        padding: tokens.space.lg,
        cursor: 'pointer',
        transition: 'all 0.18s',
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.space.md,
        minHeight: 140,
        boxShadow: hovered ? tokens.shadow.md : tokens.shadow.sm,
        transform: hovered ? 'translateY(-1px)' : 'none',
      }}
    >
      {/* Icon + badge role */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 38, height: 38, borderRadius: tokens.radius.md,
          backgroundColor: iconColor + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke={iconColor} strokeWidth="2" strokeLinecap="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
        </div>

        {/* Role badge */}
        <span style={{
          fontSize: tokens.font.xs,
          fontWeight: tokens.weight.bold,
          padding: '3px 8px',
          borderRadius: tokens.radius.sm,
          backgroundColor: diagram.role === 'EDITOR' ? '#dbeafe' : '#f3e8ff',
          color: diagram.role === 'EDITOR' ? '#1d4ed8' : '#7c3aed',
        }}>
          {diagram.role === 'EDITOR' ? '✏️ Editor' : '👁 Viewer'}
        </span>
      </div>

      {/* Title + description */}
      <div>
        <p style={{
          fontSize: tokens.font.lg,
          fontWeight: tokens.weight.semibold,
          color: tokens.color.textBase,
          marginBottom: 4,
        }}>
          {diagram.title || 'Untitled Diagram'}
        </p>
        <p style={{
          fontSize: tokens.font.md,
          color: tokens.color.textSub,
          lineHeight: 1.5,
        }}>
          {diagram.description || 'Không có mô tả'}
        </p>
      </div>

      {/* Owner info */}
      <div style={{
        marginTop: 'auto',
        display: 'flex', alignItems: 'center', gap: tokens.space.xs,
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%',
          backgroundColor: tokens.color.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 8, fontWeight: tokens.weight.bold, color: tokens.color.white,
        }}>
          {(diagram.ownerId || '?').slice(0, 2).toUpperCase()}
        </div>
        <span style={{ fontSize: tokens.font.sm, color: tokens.color.textMuted }}>
          {diagram.ownerId}
        </span>
      </div>
        </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '80px 0', gap: tokens.space.lg,
      color: tokens.color.textMuted,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        backgroundColor: tokens.color.surface,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke={tokens.color.textMuted} strokeWidth="1.5" strokeLinecap="round">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontSize: tokens.font.lg,
          fontWeight: tokens.weight.semibold,
          color: tokens.color.textSub,
          marginBottom: 6,
        }}>
          Chưa có diagram nào được chia sẻ
        </p>
        <p style={{ fontSize: tokens.font.md, color: tokens.color.textMuted }}>
          Khi ai đó chia sẻ diagram với bạn, nó sẽ xuất hiện ở đây
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────

export default function SharedWithMePage() {
  const navigate  = useNavigate()
  const token     = localStorage.getItem('token')

  const [diagrams, setDiagrams] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    if (!token) { navigate('/auth'); return }
    const fetchShared = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/share/received', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 401) { navigate('/auth'); return }
        if (!res.ok) throw new Error('Không tải được danh sách')
        setDiagrams(await res.json())
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchShared()
  }, [token])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      backgroundColor: tokens.color.bg,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
    }}>
      <HomeHeader
        activePage="Collaborators"
        onNavChange={(page) => {
          if (page === 'Projects') navigate('/')
        }}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar activeToolId="" onToolChange={() => {}} />
        <div style={{ flex: 1, overflow: 'auto', padding: tokens.space.xxl }}>

        {/* Title */}
        <div style={{ marginBottom: tokens.space.xxl }}>
          <h1 style={{
            fontSize: 28,
            fontWeight: tokens.weight.extrabold,
            color: tokens.color.textBase,
            letterSpacing: '-0.02em',
            marginBottom: 6,
          }}>
            Shared with me
          </h1>
          <p style={{ fontSize: tokens.font.md, color: tokens.color.textSub }}>
            Các diagram người khác đã chia sẻ với bạn.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: tokens.radius.md,
            marginBottom: tokens.space.lg,
            backgroundColor: '#fff1f2',
            border: '1px solid #fecdd3',
            fontSize: tokens.font.md, color: tokens.color.danger,
          }}>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: 200, color: tokens.color.textMuted, fontSize: tokens.font.md,
          }}>
            Đang tải...
          </div>
        ) : diagrams.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Count */}
            <p style={{
              fontSize: tokens.font.md,
              color: tokens.color.textSub,
              marginBottom: tokens.space.lg,
            }}>
              {diagrams.length} diagram được chia sẻ
            </p>

            {/* Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: tokens.space.lg,
            }}>
              {diagrams.map(diagram => (
                <SharedDiagramCard
                  key={diagram.id}
                  diagram={diagram}
                  onClick={() => navigate(`/editor/${diagram.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
    </div>
  )
}