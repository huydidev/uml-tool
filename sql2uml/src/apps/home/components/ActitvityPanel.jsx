import { THEME } from "../../../shared/constants/theme"


const DOT_COLORS = {
  update:   THEME.colors.PRIMARY,
  share:    '#a855f7',
  backup:   '#9ca3af',
  conflict: '#ef4444',
}

function ActivityItem({ activity }) {
  const dotColor = DOT_COLORS[activity.type] || '#9ca3af'

  return (
    <div style={{
      display: 'flex', gap: 10,
      paddingTop: 10, paddingBottom: 10,
      borderBottom: '1px solid #f3f4f6',
    }}>
      {/* Dot */}
      <div style={{ paddingTop: 4, flexShrink: 0 }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          backgroundColor: dotColor,
        }}/>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 2 }}>
          {activity.title}
        </p>
        <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.4 }}>
          {activity.subtitle}
        </p>
        <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {activity.time}
        </p>
      </div>
    </div>
  )
}

export default function ActivityPanel({ activities = [] }) {
  return (
    <div style={{
      width: 240,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      {/* Recent Activities */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e8eaed',
        borderRadius: 14,
        padding: 16,
      }}>
        <h3 style={{
          fontSize: 13, fontWeight: 600,
          color: '#111827', marginBottom: 4,
        }}>
          Recent Activities
        </h3>

        <div>
          {activities.length === 0 ? (
            <p style={{ fontSize: 12, color: '#9ca3af', paddingTop: 12, textAlign: 'center' }}>
              Chưa có hoạt động nào
            </p>
          ) : (
            activities.map((a, i) => (
              <ActivityItem key={i} activity={a} />
            ))
          )}
        </div>

        <button style={{
          width: '100%', marginTop: 12,
          padding: '7px 0',
          borderRadius: 8,
          border: `1px solid #e8eaed`,
          backgroundColor: 'transparent',
          fontSize: 11, fontWeight: 600,
          color: THEME.colors.PRIMARY,
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = THEME.colors.PRIMARY + '08'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          View Audit Log
        </button>
      </div>
    </div>
  )
}