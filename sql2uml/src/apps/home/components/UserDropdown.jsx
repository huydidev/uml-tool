import { useState, useRef, useEffect } from "react";
import { tokens } from "../../../shared/constants/Tokens";
import DropdownMenu from "./DropdownMenu";

export default function UserDropdown({ user, isAdmin, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const initial = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* avatar */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          backgroundColor: tokens.color.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: tokens.font.sm,
          fontWeight: tokens.weight.bold,
          color: tokens.color.white,
          border: "none",
          cursor: "pointer",
        }}
      >
        {initial}
      </button>
      {/* menu */}
      {open && (
        <DropdownMenu
          user={user}
          isAdmin={isAdmin}
          onLogout={onLogout}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
