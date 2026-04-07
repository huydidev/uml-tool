import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { THEME } from '../../../shared/constants/theme'

const NAV_ITEMS = ['Projects', 'Templates', 'Collaborators']

export default function HomeHeader({ activePage = 'Projects', onNavChange }) {
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })()

  const initial = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  const handleLogout = async () => {
    const token = localStorage.getItem('token')
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch {}
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/auth')
  }

  return (
    <div style={{
      height: 52, backgroundColor: '#ffffff',
      borderBottom: '1px solid #e8eaed',
      display: 'flex', alignItems: 'center',
      paddingLeft: 24, paddingRight: 20, flexShrink: 0,
    }}>
      <span style={{
        fontWeight: 800, fontSize: 15, color: '#1a1a2e',
        letterSpacing: '-0.01em', marginRight: 32, flexShrink: 0,
      }}>
        Crystalline<span style={{ color: THEME.colors.PRIMARY }}>UML</span>
      </span>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const isActive = activePage === item
          return (
            <button key={item} onClick={() => onNavChange?.(item)} style={{
              padding: '6px 14px', borderRadius: 8,
              fontSize: 13, fontWeight: isActive ? 600 : 400,
              color: isActive ? THEME.colors.PRIMARY : '#6b7280',
              backgroundColor: isActive ? THEME.colors.PRIMARY + '12' : 'transparent',
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {item}
            </button>
          )
        })}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Notification */}
        <button style={{
          width: 34, height: 34, borderRadius: 10,
          border: '1px solid #e8eaed', backgroundColor: '#f9fafb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <div style={{
            position: 'absolute', top: 6, right: 6,
            width: 6, height: 6, borderRadius: '50%',
            backgroundColor: '#ef4444', border: '1.5px solid #fff',
          }}/>
        </button>

        {/* Settings */}
        <button style={{
          width: 34, height: 34, borderRadius: 10,
          border: '1px solid #e8eaed', backgroundColor: '#f9fafb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>

        {/* Avatar + dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              backgroundColor: THEME.colors.PRIMARY,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff',
              border: 'none', cursor: 'pointer', transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {initial}
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              width: 200, backgroundColor: '#ffffff',
              border: '1px solid #e8eaed', borderRadius: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
              overflow: 'hidden', zIndex: 100,
            }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>
                  {user?.name || 'User'}
                </p>
                <p style={{ fontSize: 11, color: '#6b7280' }}>{user?.email || ''}</p>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: 8,
                  border: 'none', backgroundColor: 'transparent',
                  fontSize: 13, color: '#ef4444',
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fff1f2'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}