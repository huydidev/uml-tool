import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../shared/constants/Tokens";
import { Plus } from "lucide-react";
import HomeHeader from "../components/HomeHeader";
import BlueprintGrid from "../components/BlueprintGrid";

export default function HomePage() {
  const navigate = useNavigate();
  const [diagrams, setDiagrams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/auth");
      return;
    }
    const fetch_ = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/diagrams", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          navigate("/auth");
          return;
        }
        if (!res.ok) throw new Error("Không tải được danh sách diagram");
        setDiagrams(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [token]);

  const handleOpenDiagram = (diagram) => navigate(`/editor/${diagram.id}`);
  const handleDeleteDiagram = (id) =>
    setDiagrams((prev) => prev.filter((d) => d.id !== id));

  const handleNewDiagram = async () => {
    if (!token) return;
    setCreating(true);
    try {
      const res = await fetch("/api/diagrams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: "Untitled Diagram",
          description: "",
          nodes: [],
          edges: [],
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      navigate(`/editor/${data.id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: tokens.color.bg,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      }}
    >
      <HomeHeader activePage="Projects" />

      <div style={{ flex: 1, overflow: "auto", padding: tokens.space.xxl }}>
        {/* Title + actions */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: tokens.space.xxl,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: tokens.color.textBase,
                letterSpacing: "-0.02em",
                marginBottom: 6,
              }}
            >
              Project Canvas
            </h1>
            <p
              style={{
                fontSize: tokens.font.md,
                color: tokens.color.textSub,
                lineHeight: 1.5,
              }}
            >
              Manage your architectural blueprints and data models.
            </p>
          </div>

          <button
            onClick={handleNewDiagram}
            disabled={creating}
            style={{
              ...tokens.button.primary,
              opacity: creating ? 0.6 : 1,
              cursor: creating ? "not-allowed" : "pointer",
            }}
          >
            <Plus size={13} />
            {creating ? "Đang tạo..." : "New Diagram"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: tokens.radius.md,
              marginBottom: tokens.space.lg,
              backgroundColor: "#fff1f2",
              border: "1px solid #fecdd3",
              fontSize: tokens.font.md,
              color: tokens.color.danger,
            }}
          >
            {error}
          </div>
        )}

        {/* Loading / Content */}
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 200,
              color: tokens.color.textMuted,
              fontSize: tokens.font.md,
            }}
          >
            Đang tải...
          </div>
        ) : (
          <BlueprintGrid
            diagrams={diagrams}
            onOpen={handleOpenDiagram}
            onNew={handleNewDiagram}
            onDelete={handleDeleteDiagram}
          />
        )}
      </div>
    </div>
  );
}
