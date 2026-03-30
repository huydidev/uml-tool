// src/shared/constants/theme.js
// ================================================================
// ĐỔI MÀU TOÀN APP — chỉ cần sửa 3 dòng này
// ================================================================
const PRIMARY   = '#007AFF'  // Apple blue
const SECONDARY = '#5856D6'  // iOS indigo
const SURFACE   = '#F2F4F8'  // nền xám nhạt như ảnh
// ================================================================

const SUCCESS = '#34C759'  // iOS green
const WARNING = '#FF9500'  // iOS orange — primary key
const DANGER  = '#FF3B30'  // iOS red
const MUTED   = '#8E8E93'  // iOS gray

const s1 = '#FFFFFF'  // panel, card — trắng
const s2 = '#F2F4F8'  // input, hover — xám nhạt
const s3 = '#D1D5DB'  // border nhẹ
const s4 = '#6B7280'  // text phụ

export const THEME = {
  colors: { PRIMARY, SECONDARY, SURFACE, SUCCESS, WARNING, DANGER, MUTED },

  // ── Nền ──
  bgApp:      `bg-[${SURFACE}]`,
  bgPanel:    `bg-[${s1}]`,
  bgInput:    `bg-[${s2}]`,
  bgHover:    `hover:bg-[${s2}]`,
  bgSelected: `bg-[${s2}]`,

  // ── Border ──
  border:       `border-[${s3}]`,
  borderLight:  `border-[${s2}]`,
  borderInput:  `border-[${s3}]`,
  borderFocus:  `focus:border-[${PRIMARY}]`,
  borderAccent: `border-[${PRIMARY}]`,

  // ── Text ──
  textPrimary:   `text-[#1C1C1E]`,
  textSecondary: `text-[${s4}]`,
  textMuted:     `text-[${MUTED}]`,
  textDim:       `text-[${s3}]`,
  textGhost:     `text-[${s3}]`,

  // ── Label nhỏ ──
  label: `text-[9px] font-bold uppercase tracking-widest text-[${MUTED}]`,

  // ── Accent ──
  accentPrimary:   `text-[${PRIMARY}]`,
  accentSecondary: `text-[${SECONDARY}]`,
  accentSuccess:   `text-[${SUCCESS}]`,
  accentWarning:   `text-[${WARNING}]`,
  accentDanger:    `text-[${DANGER}]`,

  // ── Badge ──
  dotPrimary: `bg-[${PRIMARY}]`,
  dotSuccess: `bg-[${SUCCESS}]`,
  dotDanger:  `bg-[${DANGER}]`,
  pkBadge:    `text-[${WARNING}]`,

  // ── Buttons ──
  btnPrimary:   `bg-[${PRIMARY}] hover:opacity-90 text-white font-semibold transition-all`,
  btnSecondary: `bg-[${s2}] hover:bg-[${s3}] text-[#1C1C1E] border border-[${s3}] font-medium transition-all`,
  btnGhost:     `text-[${s4}] hover:text-[#1C1C1E] hover:bg-[${s2}] transition-all`,
  btnDanger:    `text-[${s4}] hover:text-[${DANGER}] transition-all`,
  btnSuccess:   `bg-[${SUCCESS}] hover:opacity-90 text-white font-semibold transition-all`,
  btnViolet:    `bg-[${SECONDARY}] hover:opacity-90 text-white font-semibold transition-all`,

  // ── Input ──
  input:     `bg-white border border-[${s3}] focus:border-[${PRIMARY}] text-[#1C1C1E] outline-none transition-all rounded-lg`,
  inputCode: `bg-[${s2}] border border-[${s3}] focus:border-[${SECONDARY}] text-blue-600 font-mono outline-none transition-all rounded-lg`,

  // ── Resize bar ──
  resizeBarIdle:  `bg-[${s3}]`,
  resizeBarHover: `group-hover:bg-[${PRIMARY}]`,
  resizeBgHover:  `hover:bg-[${PRIMARY}33]`,

  // ── Panel config ──
  panel: {
    minWidth:      220,
    maxWidthRatio: 0.5,
    defaultWidth:  288,
    topPctDefault: 30,
    topPctMin:     10,
    topPctMax:     80,
  },
}