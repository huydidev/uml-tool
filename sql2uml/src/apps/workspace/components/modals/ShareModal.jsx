// src/apps/workspace/components/modals/ShareModal.jsx
// Commit 10: Kết nối API thật — load shared users, invite, revoke

import { useState, useEffect } from 'react'
import { THEME } from '../../../../shared/constants/theme'

const ROLE_COLORS = { EDITOR: '#3b82f6', VIEWER: '#8b5cf6' }

function MemberRow({ member, onRevoke, isOwner }) {
  const [revoking, setRevoking] = useState(false)

  const handleRevoke = async () => {
    setRevoking(true)
    await onRevoke(member.userId)
    setRevoking(false)
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 0',
      borderBottom: '1px solid #f1f5f9',
    }}>
      {/* Avatar */}
      <div style={{
        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
        backgroundColor: ROLE_COLORS[member.role] || '#6b7280',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 700, color: '#ffffff',
      }}>
        {(member.userName || member.userId || '?').slice(0, 2).toUpperCase()}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 1 }}>
          {member.userName || member.userId}
        </p>
        <span style={{
          fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
          backgroundColor: (ROLE_COLORS[member.role] || '#6b7280') + '18',
          color: ROLE_COLORS[member.role] || '#6b7280',
        }}>
          {member.role}
        </span>
      </div>

      {/* Revoke */}
      {!isOwner && (
        <button
          onClick={handleRevoke}
          disabled={revoking}
          title="Thu hồi quyền"
          style={{
            width: 26, height: 26, borderRadius: 7,
            border: '1px solid #fecdd3', backgroundColor: '#fff1f2',
            cursor: revoking ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ef4444', opacity: revoking ? 0.5 : 1,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  )
}

export default function ShareModal({ isOpen, onClose, diagramId, shareLink }) {
  const [userId, setUserId]         = useState('')
  const [role, setRole]             = useState('VIEWER')
  const [sharedUsers, setSharedUsers] = useState([])
  const [loading, setLoading]       = useState(false)
  const [sharing, setSharing]       = useState(false)
  const [error, setError]           = useState(null)
  const [success, setSuccess]       = useState(false)
  const [copied, setCopied]         = useState(false)
  const token = localStorage.getItem('token')

  // Load danh sách users đã được share
  useEffect(() => {
    if (!isOpen || !diagramId) return
    const fetch_ = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/share/${diagramId}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error()
        setSharedUsers(await res.json())
      } catch {
        setSharedUsers([])
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [isOpen, diagramId])

  const handleShare = async (e) => {
    e.preventDefault()
    if (!userId.trim()) return
    setError(null)
    setSharing(true)
    try {
      const res = await fetch(`/api/share/${diagramId}`, {
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
      const data = await res.json()
      // Thêm vào list local
      setSharedUsers(prev => {
        const exists = prev.find(u => u.userId === userId.trim())
        if (exists) return prev.map(u => u.userId === userId.trim() ? data.data : u)
        return [...prev, data.data]
      })
      setUserId('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch (e) {
      setError(e.message)
    } finally {
      setSharing(false)
    }
  }

  const handleRevoke = async (targetUserId) => {
    try {
      await fetch(`/api/share/${diagramId}/users/${encodeURIComponent(targetUserId)}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch {}
    // Xóa khỏi list local
    setSharedUsers(prev => prev.filter(u => u.userId !== targetUserId))
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink || window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff', borderRadius: 16, width: 400,
          boxShadow: '0 16px 48px rgba(0,0,0,0.18)', border: '1px solid #e8eaed',
          display: 'flex', flexDirection: 'column', maxHeight: '80vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '18px 20px 14px', borderBottom: '1px solid #f1f5f9',
        }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2 }}>
              Chia sẻ diagram
            </h3>
            <p style={{ fontSize: 11, color: '#6b7280' }}>Mời người khác cùng làm việc</p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 8,
              border: '1px solid #e2e8f0', backgroundColor: '#f9fafb',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#6b7280',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Share link */}
          {shareLink && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 12px', borderRadius: 10,
              backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={THEME.colors.PRIMARY} strokeWidth="2" strokeLinecap="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              <span style={{
                flex: 1, fontSize: 11, color: '#374151',
                fontFamily: 'monospace', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {shareLink}
              </span>
              <button
                onClick={handleCopyLink}
                style={{
                  fontSize: 10, fontWeight: 600,
                  color: copied ? '#16a34a' : THEME.colors.PRIMARY,
                  border: 'none', backgroundColor: 'transparent',
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          )}

          {/* Invite form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
              Mời theo User ID (email)
            </label>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="email@example.com"
                value={userId}
                onChange={e => { setUserId(e.target.value); setError(null) }}
                onKeyDown={e => e.key === 'Enter' && handleShare(e)}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 9,
                  border: `1px solid ${error ? '#fecdd3' : '#e2e8f0'}`,
                  backgroundColor: '#f8fafc', fontSize: 12,
                  color: '#111827', outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = THEME.colors.PRIMARY}
                onBlur={e => e.target.style.borderColor = error ? '#fecdd3' : '#e2e8f0'}
              />

              {/* Role toggle */}
              <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: 9, overflow: 'hidden' }}>
                {['VIEWER', 'EDITOR'].map(r => (
                  <button
                    key={r} type="button"
                    onClick={() => setRole(r)}
                    style={{
                      padding: '8px 10px', border: 'none', fontSize: 11, fontWeight: 600,
                      backgroundColor: role === r ? THEME.colors.PRIMARY : '#f8fafc',
                      color: role === r ? '#fff' : '#6b7280',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {r === 'VIEWER' ? '👁' : '✏️'}
                  </button>
                ))}
              </div>

              <button
                onClick={handleShare}
                disabled={sharing || !userId.trim()}
                style={{
                  padding: '8px 14px', borderRadius: 9, border: 'none',
                  backgroundColor: sharing || !userId.trim() ? '#93c5fd' : THEME.colors.PRIMARY,
                  color: '#fff', fontSize: 12, fontWeight: 600,
                  cursor: sharing || !userId.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {sharing ? '...' : 'Mời'}
              </button>
            </div>

            {error && (
              <p style={{ fontSize: 11, color: '#e11d48' }}>{error}</p>
            )}
            {success && (
              <p style={{ fontSize: 11, color: '#16a34a' }}>✓ Đã chia sẻ thành công!</p>
            )}
          </div>

          {/* Shared users list */}
          {loading ? (
            <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>Đang tải...</p>
          ) : sharedUsers.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>
                Đã chia sẻ ({sharedUsers.length})
              </p>
              {sharedUsers.map(u => (
                <MemberRow
                  key={u.userId}
                  member={u}
                  onRevoke={handleRevoke}
                  isOwner={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid #f1f5f9',
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '7px 18px', borderRadius: 8,
              border: '1px solid #e2e8f0', backgroundColor: '#f9fafb',
              fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer',
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}