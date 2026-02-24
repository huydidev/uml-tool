// src/apps/user/components/ResizeHandle.jsx

// import { THEME } from '../../../shared/constants/theme';
import { THEME } from "../constants/theme";

export function HorizontalResizeHandle({ onMouseDown }) {
  return (
    <div
      onMouseDown={onMouseDown}
      className={`absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize z-10 group ${THEME.resizeBgHover} transition-colors`}
    >
      <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-full ${THEME.resizeBarIdle} ${THEME.resizeBarHover} transition-colors`} />
    </div>
  );
}

export function VerticalResizeHandle({ onMouseDown }) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="h-2 shrink-0 cursor-row-resize flex items-center justify-center group hover:bg-slate-700/60 transition-colors border-y border-slate-700/40"
    >
      <div className={`w-8 h-0.5 rounded-full ${THEME.resizeBarIdle} ${THEME.resizeBarHover} transition-colors`} />
    </div>
  );
}