// src/apps/workspace/components/canvas/CollabCursors.jsx
// Hiển thị cursor real-time của các user khác trên canvas

import { useDiagramStore } from '../../../../shared/store/diagramStore';

export default function CollabCursors({ currentUserId }) {
  const onlineUsers = useDiagramStore(s => s.onlineUsers);

  return (
    <>
      {Object.values(onlineUsers)
        .filter(u => u.userId !== currentUserId && u.cursor)
        .map(user => (
          <div
            key={user.userId}
            style={{
              position:  'absolute',
              left:      user.cursor.x,
              top:       user.cursor.y,
              transform: 'translate(-2px, -2px)',
              pointerEvents: 'none',
              zIndex:    100,
              transition: 'left 0.05s linear, top 0.05s linear',
            }}
          >
            {/* Con trỏ chuột SVG */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M0 0L0 11.5L3.5 8.5L6 14L7.5 13.5L5 8H9.5L0 0Z"
                fill={user.color || '#3b82f6'}
                stroke="white"
                strokeWidth="1"
              />
            </svg>

            {/* Label tên user */}
            <div style={{
              position:        'absolute',
              left:            14,
              top:             10,
              backgroundColor: user.color || '#3b82f6',
              color:           '#ffffff',
              fontSize:        10,
              fontWeight:      600,
              padding:         '2px 6px',
              borderRadius:    4,
              whiteSpace:      'nowrap',
              boxShadow:       '0 1px 4px rgba(0,0,0,0.2)',
            }}>
              {user.userName || user.userId}
            </div>
          </div>
        ))}
    </>
  );
}