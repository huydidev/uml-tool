// src/apps/user/components/TableRow.jsx

// import { THEME } from '../../../shared/constants/theme';
import { THEME } from "../../../../shared/constants/theme";

export default function TableRow({ node, isOpen, onToggle }) {
  const { label, attributes = [], methods = [] } = node.data;

  return (
    <div className={`border-b ${THEME.borderLight} last:border-0`}>

      {/* Header */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-3 py-2.5 ${THEME.bgHover} transition-all group`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-sm ${THEME.nodeDot} shrink-0`} />
          <span className={`text-xs font-semibold ${THEME.textSecondary} group-hover:${THEME.textPrimary}`}>
            {label}
          </span>
          <span className={`text-[9px] ${THEME.textDim}`}>
            {attributes.filter(a => a.trim()).length} cols
          </span>
        </div>
        <svg
          viewBox="0 0 24 24" fill="none"
          className={`w-3 h-3 ${THEME.textDim} transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
        >
          <polyline points="9,6 15,12 9,18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Expanded */}
      {isOpen && (
        <div className="px-3 pb-3 flex flex-col gap-1">
          {attributes.filter(a => a.trim()).map((attr, i) => {
            const clean = attr.replace(/^[-+#~]\s*/, '');
            const [name, type] = clean.split(':').map(s => s.trim());
            const isPK = name?.toLowerCase() === 'id';
            return (
              <div key={i} className="flex items-center justify-between text-[10px] font-mono">
                <span className={`flex items-center gap-1 ${THEME.textMuted}`}>
                  {isPK && <span className={`${THEME.nodePkBadge} text-[8px] font-bold`}>PK</span>}
                  {name}
                </span>
                <span className={THEME.textGhost}>{type || 'string'}</span>
              </div>
            );
          })}

          {methods.filter(m => m.trim()).length > 0 && (
            <>
              <div className={`border-t ${THEME.borderLight} my-1`} />
              {methods.filter(m => m.trim()).map((method, i) => (
                <div key={i} className={`text-[10px] font-mono ${THEME.textDim}`}>
                  {method.replace(/^[-+#~]\s*/, '')}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}