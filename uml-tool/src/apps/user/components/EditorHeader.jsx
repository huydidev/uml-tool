
import ViewToggle from './ViewToggle';

export default function EditorHeader({
  onSave, onOpen, onOpenShare,
  viewMode, onViewModeChange,
  diagramTitle, saveStatusLabel,
  isShared,
  theme, onThemeToggle,
}) {
  const isDark = theme === 'dark';

  return (
    <header className={`h-12 border-b flex items-center px-5 gap-4 shrink-0 z-20 transition-colors duration-300 ${
      isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-gray-200'
    }`}>

      {/* Left: logo + title + save status */}
      <h1 className="font-black text-base tracking-[0.2em] text-blue-400 shrink-0">
        UML ARCHITECT
      </h1>
      <div className={`w-px h-5 shrink-0 ${isDark ? 'bg-slate-700' : 'bg-gray-300'}`} />
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs font-medium truncate max-w-[160px] ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
          {diagramTitle || 'Untitled Diagram'}
        </span>
        {saveStatusLabel && (
          <span className={`text-[10px] font-semibold shrink-0 ${saveStatusLabel.color}`}>
            {saveStatusLabel.text}
          </span>
        )}
      </div>

      {/* Center: view toggle */}
      <div className="flex-1 flex items-center justify-center">
        <ViewToggle viewMode={viewMode} onChange={onViewModeChange} theme={theme} />
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          title={isDark ? 'Light mode' : 'Dark mode'}
          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all text-base ${
            isDark
              ? 'border-slate-600 hover:border-slate-400 bg-slate-800 hover:bg-slate-700'
              : 'border-gray-300 hover:border-gray-400 bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {/* Share */}
        <button
          onClick={onOpenShare}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all border ${
            isShared
              ? 'bg-blue-600/20 border-blue-500 text-blue-400 hover:bg-blue-600/30'
              : isDark
                ? 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600'
                : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>🔗</span>
          <span>Share</span>
          {isShared && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
        </button>

        {/* Open */}
        <button
          onClick={onOpen}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-all border ${
            isDark
              ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
          }`}
        >
          Open
        </button>

        {/* Save */}
        <button
          onClick={onSave}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-xs font-bold transition-all"
        >
          Save
        </button>
      </div>
    </header>
  );
}