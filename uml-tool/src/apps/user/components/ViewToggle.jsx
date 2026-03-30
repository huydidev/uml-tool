// src/apps/user/components/ViewToggle.jsx

const VIEW_MODES = [
  { id: 'class', label: 'Class', icon: '⬜', desc: 'Đầy đủ: tên class, attributes, methods' },
  { id: 'erd',   label: 'ERD',   icon: '🗃',  desc: 'Chỉ tên bảng + columns' },
];

export default function ViewToggle({ viewMode, onChange, theme = 'dark' }) {
  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center rounded-lg p-0.5 gap-0.5 border transition-colors ${
      isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-100 border-gray-200'
    }`}>
      {VIEW_MODES.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onChange(mode.id)}
          title={mode.desc}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
            viewMode === mode.id
              ? isDark
                ? 'bg-slate-600 text-white shadow-inner'
                : 'bg-white text-gray-900 shadow-sm'
              : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>{mode.icon}</span>
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  );
}