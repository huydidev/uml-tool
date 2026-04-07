import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { THEME } from '../../../shared/constants/theme'


import HomeHeader from '../components/HomeHeader'
import Sidebar from '../components/Sidebar'
import BlueprintGrid from '../components/BlueprintGrid'
import ActivityPanel from '../components/ActitvityPanel'

export default function HomePage() {
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState('Projects')
  const [activeTool, setActiveTool] = useState('canvas')
  const [diagrams, setDiagrams]     = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [creating, setCreating]     = useState(false)

  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) { navigate('/auth'); return }
    const fetchDiagrams = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/diagrams', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 401) { navigate('/auth'); return }
        if (!res.ok) throw new Error('Không tải được danh sách diagram')
        setDiagrams(await res.json())
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchDiagrams()
  }, [token])

  // Mở diagram có sẵn
  const handleOpenDiagram = (diagram) => {
    navigate(`/editor/${diagram.id}`)
  }

  // Xóa diagram khỏi list sau khi delete thành công
  const handleDeleteDiagram = (id) => {
    setDiagrams(prev => prev.filter(d => d.id !== id))
  }

  // Tạo diagram mới → POST API → navigate vào editor
  const handleNewDiagram = async () => {
    if (!token) return
    setCreating(true)
    try {
      const res = await fetch('/api/diagrams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: 'Untitled Diagram',
          description: '',
          nodes: [],
          edges: [],
        }),
      })
      if (!res.ok) throw new Error('Không tạo được diagram')
      const data = await res.json()
      navigate(`/editor/${data.id}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      backgroundColor: '#f4f6f9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
    }}>
      <HomeHeader activePage={activePage} onNavChange={setActivePage} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar activeToolId={activeTool} onToolChange={setActiveTool} />

        <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>

          {/* Title + actions */}
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', marginBottom: 28,
          }}>
            <div>
              <h1 style={{
                fontSize: 28, fontWeight: 800, color: '#0f172a',
                letterSpacing: '-0.02em', marginBottom: 6,
              }}>
                Project Canvas
              </h1>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
                Manage your architectural blueprints and data models.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              <button style={{
                padding: '8px 16px', borderRadius: 10,
                border: '1px solid #e8eaed', backgroundColor: '#ffffff',
                fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer',
              }}>
                View Archive
              </button>

              <button
                onClick={handleNewDiagram}
                disabled={creating}
                style={{
                  padding: '8px 16px', borderRadius: 10, border: 'none',
                  backgroundColor: creating ? '#93c5fd' : THEME.colors.PRIMARY,
                  fontSize: 12, fontWeight: 600, color: '#ffffff',
                  cursor: creating ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'opacity 0.15s',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {creating ? 'Đang tạo...' : 'New Diagram'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 10, marginBottom: 20,
              backgroundColor: '#fff1f2', border: '1px solid #fecdd3',
              fontSize: 12, color: '#e11d48',
            }}>
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: 200, color: '#9ca3af', fontSize: 13,
            }}>
              Đang tải...
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <BlueprintGrid
                  diagrams={diagrams}
                  onOpen={handleOpenDiagram}
                  onNew={handleNewDiagram}
                  onDelete={handleDeleteDiagram}
                />
              </div>
              <ActivityPanel activities={activities} />
            </div>
          )}

        </div>
      </div>
    </div>
  )
}