export default function EditorHeader({
  left,    // Nhét vào bên trái
  center,  // Nhét vào giữa
  right,   // Nhét vào bên phải
  onSave,
  onOpenShare, isShared,  
  saveStatusLabel, diagramTitle
}) {
  return (
    <div className="bg-primary h-12 border-b border-slate-700/40 shrink-0 flex items-center px-4 gap-4">
      
      {/* Trái */}
      <div className="flex items-center gap-3 shrink-0">
        {left}
        <h1 className="font-black text-base tracking-[0.2em] text-onPrimaryBg shrink-0">
        Sql2Uml
        </h1>
        <button className="text-onPrimaryBg text-[20px]">
          File(Tạm)
        </button>
      </div>

      {/* Giữa */}
      <div className="flex-1 flex items-center justify-center">
        {center}
        <div className="flex items-center gap-2 shrink-0 text-onPrimaryBg">
          <span>
            {diagramTitle || 'Untitled Diagram'}
          </span>
          {saveStatusLabel && (
            <span className={`text-[10px] font-semibold shrink-0 ${saveStatusLabel.color}`}>
              {saveStatusLabel.text}
            </span>
          )}
        </div>        
      </div>

      {/* Phải */}
      <div className="flex items-center gap-2 shrink-0">
        {right}
        <button
          onClick={onOpenShare}
          className={`text-xs font-bold px-3 py-1.5 transition-all ${
            isShared ? 'text-blue-400' : 'text-white'
          }`}
        >
          {isShared ? '🔗 Shared' : 'Share'}
        </button>

        <button
          
        >
        </button>
        <button
          onClick={onSave}
          className="hover:bg-primary-light text-onPrimaryBg border border-onPrimaryBg px-4 py-1.5 rounded text-xs font-bold transition-all"
        >
          Save
        </button>

        <button className="text-onPrimaryBg text-[20px]">
          User(Tạm)
        </button>
      </div>

    </div>
  );
}