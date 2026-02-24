// src/shared/constants/theme.js
// ================================================================
// ĐỔI MÀU TOÀN APP — chỉ cần sửa 3 dòng này
// ================================================================
// ĐỔI 3 DÒNG NÀY
const PRIMARY   = '#3b82f6'  // xanh dương — giữ nguyên
const SECONDARY = '#6366f1'  // indigo — phụ
const SURFACE   = '#f8fafc'  // trắng ngã xám — nền chính
// ================================================================

// ── 4 màu hỗ trợ (không cần đổi) ────────────────────────────────
const SUCCESS = '#10b981'  // xanh lá  → save, success
const WARNING = '#f59e0b'  // vàng     → primary key, warning
const DANGER  = '#ef4444'  // đỏ       → delete, error
const MUTED   = '#64748b'  // xám      → text phụ

// ── Shade tự động từ SURFACE ─────────────────────────────────────
const s1 = '#1e293b'  // panel, header, modal
const s2 = '#334155'  // input, hover, selected
const s3 = '#475569'  // border, icon mờ

// ================================================================
// THEME OBJECT — toàn bộ app import từ đây
// ================================================================
export const THEME = {

  // ── Màu gốc (dùng khi cần inline style) ──────────────────────
  colors: { PRIMARY, SECONDARY, SURFACE, SUCCESS, WARNING, DANGER, MUTED },

  // ── Nền ──────────────────────────────────────────────────────
  bgApp:      `bg-[${SURFACE}]`,
  bgPanel:    `bg-[${s1}]`,
  bgInput:    `bg-[${s2}]`,
  bgHover:    `hover:bg-[${s2}]`,
  bgSelected: `bg-[${s2}]`,

  // ── Border ───────────────────────────────────────────────────
  border:       `border-[${s3}]`,
  borderLight:  `border-[${s2}]`,
  borderInput:  `border-[${s3}]`,
  borderFocus:  `focus:border-[${PRIMARY}]`,
  borderAccent: `border-[${PRIMARY}]`,

  // ── Text ─────────────────────────────────────────────────────
  textPrimary:   'text-white',
  textSecondary: 'text-slate-200',
  textMuted:     `text-[${MUTED}]`,
  textDim:       `text-[${s3}]`,
  textGhost:     `text-[${s3}]`,

  // ── Label nhỏ (section header) ───────────────────────────────
  label: `text-[9px] font-bold uppercase tracking-widest text-[${MUTED}]`,

  // ── Accent ───────────────────────────────────────────────────
  accentPrimary:   `text-[${PRIMARY}]`,
  accentSecondary: `text-[${SECONDARY}]`,
  accentSuccess:   `text-[${SUCCESS}]`,
  accentWarning:   `text-[${WARNING}]`,
  accentDanger:    `text-[${DANGER}]`,

  // ── Dot / Badge ───────────────────────────────────────────────
  dotPrimary: `bg-[${PRIMARY}]`,
  dotSuccess: `bg-[${SUCCESS}]`,
  dotDanger:  `bg-[${DANGER}]`,
  pkBadge:    `text-[${WARNING}]`,

  // ── Buttons ──────────────────────────────────────────────────
  btnPrimary:    `bg-[${PRIMARY}] hover:opacity-90 text-white font-bold transition-all`,
  btnSecondary:  `bg-[${s2}] hover:bg-[${s3}] text-white border border-[${s3}] font-semibold transition-all`,
  btnGhost:      `text-[${MUTED}] hover:text-white hover:bg-[${s2}] transition-all`,
  btnDanger:     `text-[${s3}] hover:text-[${DANGER}] transition-all`,
  btnSuccess:    `bg-[${SUCCESS}] hover:opacity-90 text-white font-bold transition-all`,
  btnViolet:     `bg-[${SECONDARY}] hover:opacity-90 text-white font-bold transition-all`,

  // ── Input / Textarea ─────────────────────────────────────────
  input:     `bg-[${s2}] border border-[${s3}] focus:border-[${PRIMARY}] text-white outline-none transition-all rounded-lg`,
  inputCode: `bg-[${s2}] border border-[${s3}] focus:border-[${SECONDARY}] text-green-400 font-mono outline-none transition-all rounded-lg`,

  // ── Resize ───────────────────────────────────────────────────
  resizeBarIdle:  `bg-[${s3}]`,
  resizeBarHover: `group-hover:bg-[${PRIMARY}]`,
  resizeBgHover:  `hover:bg-[${PRIMARY}33]`,

  // ── Panel config ─────────────────────────────────────────────
  panel: {
    minWidth:      220,
    maxWidthRatio: 0.5,
    defaultWidth:  288,
    topPctDefault: 30,
    topPctMin:     10,
    topPctMax:     80,
  },
};