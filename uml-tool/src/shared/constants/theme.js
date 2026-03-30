// src/shared/constants/theme.js
// ── Chỉnh màu ở đây, toàn bộ app thay đổi theo ──────────────────────

export const THEME = {
  // ── Nền ────────────────────────────────────────────────────────────
  bgApp:         'bg-slate-950',        // toàn trang
  bgPanel:       'bg-white',        // sidebar, header, modal
  bgInput:       'bg-slate-800',        // input, textarea, code block
  bgHover:       'hover:bg-slate-800/60',
  bgSelected:    'bg-slate-700',

  // ── Border ─────────────────────────────────────────────────────────
  border:        'border-slate-700/60',
  borderLight:   'border-slate-700/40',
  borderInput:   'border-slate-700',
  borderFocus:   'focus:border-blue-500',

  // ── Text ───────────────────────────────────────────────────────────
  textPrimary:   'text-white',
  textSecondary: 'text-slate-200',
  textMuted:     'text-slate-400',
  textDim:       'text-slate-500',
  textGhost:     'text-slate-600',

  // ── Label nhỏ (section header) ─────────────────────────────────────
  label:         'text-[9px] font-bold uppercase tracking-widest text-slate-500',

  // ── Accent colors ──────────────────────────────────────────────────
  accentBlue:    'text-blue-400',       // highlight chính, node dot
  accentViolet:  'text-violet-400',     // SQL parser
  accentGreen:   'text-emerald-400',    // save status, success
  accentYellow:  'text-yellow-500',     // Primary key badge
  accentRed:     'text-red-400',        // delete, error

  // ── Buttons ────────────────────────────────────────────────────────
  btnPrimary:    'bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all',
  btnSecondary:  'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 transition-all',
  btnGhost:      'text-slate-400 hover:text-white hover:bg-slate-700 transition-all',
  btnDanger:     'text-slate-600 hover:text-red-400 transition-all',
  btnSuccess:    'bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all',
  btnViolet:     'bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all',

  // ── Resize handles ─────────────────────────────────────────────────
  resizeBarIdle:  'bg-slate-700',
  resizeBarHover: 'group-hover:bg-blue-400',
  resizeBgHover:  'hover:bg-blue-500/40',

  // ── Input / Textarea ───────────────────────────────────────────────
  input:         'bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-200 outline-none transition-all rounded-lg',
  inputMono:     'bg-slate-800 border border-slate-700 focus:border-blue-500 text-green-400 font-mono outline-none transition-all rounded-lg',

  // ── Node UML ───────────────────────────────────────────────────────
  nodeDot:       'bg-blue-400',         // chấm tròn đầu mỗi table row
  nodePkBadge:   'text-yellow-500',
};

// ── Panel sizes (kéo resize) ─────────────────────────────────────────
export const PANEL = {
  MIN_WIDTH:       220,
  MAX_WIDTH_RATIO: 0.5,    // 50% màn hình
  DEFAULT_WIDTH:   288,
  TOP_PCT_DEFAULT: 30,     // % section trên mặc định
  TOP_PCT_MIN:     10,
  TOP_PCT_MAX:     80,
};