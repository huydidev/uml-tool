// src/apps/workspace/components/layout/OnlineAvatars.jsx
// Hiển thị stack avatars của users đang online trong room

import { useDiagramStore } from '../../../../shared/store/diagramStore';

export default function OnlineAvatars({ currentUserId }) {
  const onlineUsers = useDiagramStore(s => s.onlineUsers);

  const others = Object.values(onlineUsers).filter(u => u.userId !== currentUserId);

  if (others.length === 0) return null;

  const MAX_SHOW = 3;
  const visible  = others.slice(0, MAX_SHOW);
  const overflow = others.length - MAX_SHOW;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {/* Chấm xanh "live" */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        gap:            4,
        padding:        '3px 8px',
        borderRadius:   20,
        backgroundColor: '#dcfce7',
        border:         '1px solid #bbf7d0',
      }}>
        <div style={{
          width:           6,
          height:          6,
          borderRadius:    '50%',
          backgroundColor: '#16a34a',
          animation:       'pulse 2s infinite',
        }}/>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#16a34a' }}>
          Live
        </span>
      </div>

      {/* Stack avatars */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {visible.map((user, i) => (
          <div
            key={user.userId}
            title={user.userName || user.userId}
            style={{
              width:           26,
              height:          26,
              borderRadius:    '50%',
              backgroundColor: user.color || '#3b82f6',
              border:          '2px solid #ffffff',
              marginLeft:      i === 0 ? 0 : -8,
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              fontSize:        9,
              fontWeight:      700,
              color:           '#ffffff',
              cursor:          'default',
              zIndex:          visible.length - i,
              position:        'relative',
            }}
          >
            {(user.userName || user.userId || '?').slice(0, 2).toUpperCase()}
          </div>
        ))}

        {/* +N nếu có nhiều hơn MAX_SHOW */}
        {overflow > 0 && (
          <div style={{
            width:           26,
            height:          26,
            borderRadius:    '50%',
            backgroundColor: '#f1f5f9',
            border:          '2px solid #ffffff',
            marginLeft:      -8,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            fontSize:        9,
            fontWeight:      700,
            color:           '#64748b',
          }}>
            +{overflow}
          </div>
        )}
      </div>
    </div>
  );
}