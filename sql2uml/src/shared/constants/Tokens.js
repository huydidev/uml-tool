import { colors } from "./colors";

export const tokens = {
  // colors
  color: colors, // để dùng thành style={{color: tokens.color.primary}}

  // boder radius
  // dùng dạng style={{borderRadius: tokens.radius.md}}
  radius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 16,
    full: 9999,
  },

  // fontsize
  //  style={{fontSize: tokens.font.sm}}
  font: {
    xs: 10,
    sm: 11,
    base: 12,
    md: 13,
    lg: 14,
    xl: 16,
  },

  // font weight
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // shadow
  shadow: {
    sm: "0 1px 4px rgba(0,0,0,0.06)",
    md: "0 4px 16px rgba(0,0,0,0.08)",
    lg: "0 16px 48px rgba(0,0,0,0.18)",
  },

  // spacing
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  // panel config
  panel: {
    minWidth: 220,
    maxRatio: 0.5,
    defaultWidth: 288,
    topPctDefault: 30,
    topPcMin: 10,
    topPctMax: 80,
  },

  button: {
    // Dùng như: style={tokens.button.primary}
    primary: {
      padding: "8px 18px",
      borderRadius: 10,
      border: "none",
      backgroundColor: colors.primary,
      color: colors.white,
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.15s",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
    },

    secondary: {
      padding: "8px 18px",
      borderRadius: 10,
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.white,
      color: colors.textBase,
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.15s",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
    },

    danger: {
      padding: "8px 18px",
      borderRadius: 10,
      border: "none",
      backgroundColor: colors.danger,
      color: colors.white,
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.15s",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
    },

    ghost: {
      padding: "8px 18px",
      borderRadius: 10,
      border: "none",
      backgroundColor: "transparent",
      color: colors.textSub,
      fontSize: 13,
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.15s",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
    },

    // Icon button vuông nhỏ
    icon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.surface,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "all 0.15s",
      flexShrink: 0,
    },

    // Size variants — spread thêm vào
    sm: {
      padding: "5px 12px",
      fontSize: 11,
      borderRadius: 8,
    },

    lg: {
      padding: "10px 24px",
      fontSize: 14,
      borderRadius: 12,
    },
    nav: (isActive, color = colors.primary) => ({
      padding: "6px 14px",
      borderRadius: 10,
      border: "none",
      backgroundColor: isActive ? color + "12" : "transparent",
      color: isActive ? color : colors.textSub,
      fontSize: 13,
      fontWeight: isActive ? 600 : 400,
      cursor: "pointer",
      transition: "all 0.15s",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
    }),
  },
  // Tokens.js — thêm vào tokens

  dropdown: {
    // Container dropdown
    container: {
      position: "absolute",
      right: 0,
      top: "calc(100% + 8px)",
      width: 200,
      backgroundColor: colors.white,
      border: `1px solid ${colors.border}`,
      borderRadius: 14,
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      overflow: "hidden",
      zIndex: 100,
    },

    // Header user info
    header: {
      padding: "12px 14px",
      borderBottom: `1px solid ${colors.surface}`,
    },

    // Item button thường
    item: {
      width: "100%",
      padding: "10px 14px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      border: "none",
      backgroundColor: "transparent",
      fontSize: 13,
      color: colors.textBase,
      cursor: "pointer",
      textAlign: "left",
      transition: "background 0.15s",
    },

    // Item button danger (logout)
    itemDanger: {
      width: "100%",
      padding: "10px 14px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      border: "none",
      borderTop: `1px solid ${colors.surface}`,
      backgroundColor: "transparent",
      fontSize: 13,
      color: colors.danger,
      cursor: "pointer",
      textAlign: "left",
      transition: "background 0.15s",
    },
  },
};
