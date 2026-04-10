import { useNavigate } from "react-router-dom";
import { tokens } from "../../../shared/constants/Tokens";

const NAV_ITEMS = ["Projects", "Workspaces", "Collaborators"];

export default function NavBar({ activePage = "Projects" }) {
  const navigate = useNavigate();

  const handleClick = (item) => {
    if (item === "Projects") navigate("/");
    if (item === "Workspaces") navigate("/workspaces");
    if (item === "Collaborators") navigate("/shared-with-me");
  };

  return (
    <nav style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
      {NAV_ITEMS.map((item) => {
        const isActive = activePage === item;
        return (
          <button
            key={item}
            style={tokens.button.nav(isActive)}
            onClick={() => handleClick(item)}
            onMouseEnter={(e) => {
              if (!isActive)
                e.currentTarget.style.backgroundColor =
                  tokens.color.primary + "08";
            }}
            onMouseLeave={(e) => {
              if (!isActive)
                e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {item}
          </button>
        );
      })}
    </nav>
  );
}
