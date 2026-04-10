import { tokens } from "../constants/Tokens";
export default function Logo({ size = 30 }) {
  return (
    <span
      style={{
        fontWeight: tokens.weight.extrabold,
        fontSize: size,
        color: tokens.color.textBase,
        letterSpacing: "-0.02em",
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      P<span style={{ color: tokens.color.primary }}>Uml</span>
    </span>
  );
}
