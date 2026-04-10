import { useNavigate } from "react-router-dom";
import { tokens } from "../../../shared/constants/Tokens";
import { User, LayoutDashboard, LogOut } from "lucide-react";

export default function DropdownMenu({ user, isAdmin, onLogout, onClose }) {
  const navigate = useNavigate();

  const items = [
    {
      icon: <User size={14} />,
      label: "Hồ sơ cá nhân",
      onClick: () => navigate("/profile"),
      show: true,
      style: tokens.dropdown.item,
      hoverBg: tokens.color.surface,
    },
    {
      icon: <LayoutDashboard size={14} />,
      label: "Admin Dashboard",
      onClick: () => navigate("/admin"),
      show: isAdmin,
      style: tokens.dropdown.item,
      hoverBg: tokens.color.surface,
    },
    {
      icon: <LogOut size={14} />,
      label: "Đăng xuất",
      onClick: onLogout,
      show: true,
      style: tokens.dropdown.itemDanger,
      hoverBg: "#fff1f2",
    },
  ];
  return (
    <div style={tokens.dropdown.container}>
      {/* user info */}
      <div style={tokens.dropdown.header}>
        <p
          style={{
            fontSize: tokens.font.md,
            fontWeight: tokens.weight.semibold,
            color: tokens.color.textBase,
            marginBottom: 2,
          }}
        >
          {user?.name || "User"}
        </p>
        <p style={{ fontSize: tokens.font.sm, color: tokens.color.textSub }}>
          {user?.email || ""}
        </p>
      </div>
      {/* Menu items */}
      {items
        .filter((i) => i.show)
        .map((item) => (
          <button
            key={item.label}
            onClick={() => {
              onClose();
              item.onClick();
            }}
            style={item.style}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = item.hoverBg)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            {item.icon}
            {item.label}
          </button>
        ))}
    </div>
  );
}
