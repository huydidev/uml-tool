// src/apps/workspace/components/modals/VersionHistoryPanel.jsx
// Hiển thị danh sách versions, preview và restore

import { useState, useEffect } from 'react'
import { THEME } from '../../../../shared/constants/theme'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function VersionHistoryPanel({ isOpen, onClose, diagramId, onRestore }) {
  const [versions, setVersions]   = useState([])
  const [loading, setLoading]     = useState(false)
  const [restoring, setRestoring] = useState(null)  // vNum đang restore
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!isOpen || !diagramId) return
    const fetch_ = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/diagrams/${diagramId}/versions`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error()
        setVersions(await res.json())
      } catch {
        setVersions([])
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [isOpen, diagramId])

  const handleRestore = async (vNum) => {
    if (!diagramId) return
    setRestoring(vNum)
    try {
      const res = await fetch(`/api/diagrams/${diagramId}/versions/${vNum}/restore`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      onRestore?.(data)   // truyền diagram state đã restore về EditorPage
      onClose()
    } catch {
      alert('Restore thất bại!')
    } finally {
      setRestoring(null)
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          width: 420,
          maxHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
          border: '1px solid #e8eaed',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px 14px',
          borderBottom: '1px solid #f1f5f9',
        }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2 }}>
              Version History
            </h3>
            <p style={{ fontSize: 11, color: '#6b7280' }}>
              {versions.length} version{versions.length !== 1 ? 's' : ''}
            </p>
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

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 13 }}>
              Đang tải...
            </div>
          ) : versions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 13 }}>
              Chưa có version nào — nhấn Save để tạo version đầu tiên
            </div>
          ) : (
            versions.map((v, i) => (
              <div
                key={v.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 10px',
                  borderRadius: 10,
                  marginBottom: 4,
                  backgroundColor: i === 0 ? THEME.colors.PRIMARY + '08' : 'transparent',
                  border: `1px solid ${i === 0 ? THEME.colors.PRIMARY + '30' : 'transparent'}`,
                  transition: 'background 0.15s',
                }}
              >
                {/* Version badge */}
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  backgroundColor: i === 0 ? THEME.colors.PRIMARY : '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                  color: i === 0 ? '#ffffff' : '#6b7280',
                }}>
                  v{v.versionNum}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 2 }}>
                    {v.label || `Version ${v.versionNum}`}
                    {i === 0 && (
                      <span style={{
                        marginLeft: 6, fontSize: 9, fontWeight: 700,
                        color: THEME.colors.PRIMARY,
                        backgroundColor: THEME.colors.PRIMARY + '15',
                        padding: '1px 6px', borderRadius: 4,
                      }}>
                        LATEST
                      </span>
                    )}
                  </p>
                  <p style={{ fontSize: 10, color: '#9ca3af' }}>
                    {formatDate(v.savedAt)} · {v.savedBy}
                  </p>
                </div>

                {/* Restore button */}
                {i !== 0 && (
                  <button
                    onClick={() => handleRestore(v.versionNum)}
                    disabled={restoring === v.versionNum}
                    style={{
                      padding: '5px 12px', borderRadius: 7,
                      border: `1px solid ${THEME.colors.PRIMARY}40`,
                      backgroundColor: restoring === v.versionNum ? '#f1f5f9' : THEME.colors.PRIMARY + '10',
                      color: THEME.colors.PRIMARY,
                      fontSize: 11, fontWeight: 600,
                      cursor: restoring === v.versionNum ? 'not-allowed' : 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.15s',
                    }}
                  >
                    {restoring === v.versionNum ? '...' : 'Restore'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '7px 18px', borderRadius: 8,
              border: '1px solid #e2e8f0', backgroundColor: '#f9fafb',
              fontSize: 12, fontWeight: 600, color: '#374151',
              cursor: 'pointer',
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}