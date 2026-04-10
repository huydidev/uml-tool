import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../shared/constants/Tokens";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Stat card ─────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }) {
  return (
    <div
      style={{
        backgroundColor: tokens.color.white,
        borderRadius: tokens.radius.xl,
        border: `1px solid ${tokens.color.border}`,
        padding: tokens.space.xl,
        boxShadow: tokens.shadow.sm,
        display: "flex",
        alignItems: "center",
        gap: tokens.space.lg,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: tokens.radius.lg,
          backgroundColor: color + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            fontSize: tokens.font.xs,
            fontWeight: tokens.weight.semibold,
            color: tokens.color.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 4,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: 28,
            fontWeight: tokens.weight.extrabold,
            color: tokens.color.textBase,
            lineHeight: 1,
          }}
        >
          {value?.toLocaleString() ?? "—"}
        </p>
      </div>
    </div>
  );
}

// ── Chart card wrapper ────────────────────────────────────────────
function ChartCard({ title, children }) {
  return (
    <div
      style={{
        backgroundColor: tokens.color.white,
        borderRadius: tokens.radius.xl,
        border: `1px solid ${tokens.color.border}`,
        padding: tokens.space.xl,
        boxShadow: tokens.shadow.sm,
      }}
    >
      <h3
        style={{
          fontSize: tokens.font.lg,
          fontWeight: tokens.weight.bold,
          color: tokens.color.textBase,
          marginBottom: tokens.space.lg,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

// ── Recent table ──────────────────────────────────────────────────
function RecentTable({ title, columns, rows }) {
  return (
    <div
      style={{
        backgroundColor: tokens.color.white,
        borderRadius: tokens.radius.xl,
        border: `1px solid ${tokens.color.border}`,
        boxShadow: tokens.shadow.sm,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: `${tokens.space.lg}px ${tokens.space.xl}px`,
          borderBottom: `1px solid ${tokens.color.border}`,
        }}
      >
        <h3
          style={{
            fontSize: tokens.font.lg,
            fontWeight: tokens.weight.bold,
            color: tokens.color.textBase,
          }}
        >
          {title}
        </h3>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: tokens.color.surface }}>
            {columns.map((col) => (
              <th
                key={col}
                style={{
                  padding: `${tokens.space.sm}px ${tokens.space.lg}px`,
                  textAlign: "left",
                  fontSize: tokens.font.sm,
                  fontWeight: tokens.weight.semibold,
                  color: tokens.color.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              style={{ borderTop: `1px solid ${tokens.color.border}` }}
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    padding: `${tokens.space.sm}px ${tokens.space.lg}px`,
                    fontSize: tokens.font.md,
                    color:
                      j === 0 ? tokens.color.textBase : tokens.color.textSub,
                    fontWeight:
                      j === 0 ? tokens.weight.medium : tokens.weight.normal,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Format ngày ngắn gọn cho chart ────────────────────────────────
function shortDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

// ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/auth");
      return;
    }
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          navigate("/auth");
          return;
        }
        if (res.status === 403) {
          navigate("/");
          return;
        }
        if (!res.ok) throw new Error("Không tải được stats");
        setStats(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading)
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: tokens.color.bg,
          fontSize: tokens.font.md,
          color: tokens.color.textMuted,
        }}
      >
        Đang tải...
      </div>
    );

  if (error)
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: tokens.color.bg,
          gap: tokens.space.lg,
        }}
      >
        <p style={{ color: tokens.color.danger, fontSize: tokens.font.lg }}>
          {error}
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: `${tokens.space.sm}px ${tokens.space.xl}px`,
            borderRadius: tokens.radius.md,
            border: "none",
            backgroundColor: tokens.color.primary,
            color: tokens.color.white,
            fontSize: tokens.font.md,
            fontWeight: tokens.weight.semibold,
            cursor: "pointer",
          }}
        >
          Về trang chủ
        </button>
      </div>
    );

  // Format chart data
  const userChartData = (stats?.newUsersLast7Days || []).map((d) => ({
    date: shortDate(d.date),
    count: d.count,
  }));
  const diagramChartData = (stats?.newDiagramsLast7Days || []).map((d) => ({
    date: shortDate(d.date),
    count: d.count,
  }));

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: tokens.color.bg,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 52,
          backgroundColor: tokens.color.white,
          borderBottom: `1px solid ${tokens.color.border}`,
          display: "flex",
          alignItems: "center",
          padding: `0 ${tokens.space.xl}px`,
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.space.md,
          }}
        >
          <button
            onClick={() => navigate("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: tokens.space.xs,
              border: "none",
              background: "none",
              color: tokens.color.textSub,
              cursor: "pointer",
              fontSize: tokens.font.md,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Quay lại
          </button>
          <span style={{ color: tokens.color.border }}>|</span>
          <h1
            style={{
              fontSize: tokens.font.lg,
              fontWeight: tokens.weight.bold,
              color: tokens.color.textBase,
            }}
          >
            Crystalline<span style={{ color: tokens.color.primary }}>UML</span>
          </h1>
        </div>
        <span
          style={{
            fontSize: tokens.font.sm,
            fontWeight: tokens.weight.bold,
            padding: "3px 10px",
            borderRadius: tokens.radius.sm,
            backgroundColor: tokens.color.primary + "15",
            color: tokens.color.primary,
          }}
        >
          ADMIN
        </span>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: tokens.space.xxl,
          display: "flex",
          flexDirection: "column",
          gap: tokens.space.xl,
        }}
      >
        {/* Title */}
        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: tokens.weight.extrabold,
              color: tokens.color.textBase,
              letterSpacing: "-0.02em",
              marginBottom: 6,
            }}
          >
            Analytics Dashboard
          </h1>
          <p style={{ fontSize: tokens.font.md, color: tokens.color.textSub }}>
            Tổng quan hoạt động của CrystallineUML
          </p>
        </div>

        {/* Stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: tokens.space.lg,
          }}
        >
          <StatCard
            label="Tổng người dùng"
            value={stats?.totalUsers}
            color={tokens.color.primary}
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={tokens.color.primary}
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
          <StatCard
            label="Tổng diagram"
            value={stats?.totalDiagrams}
            color={tokens.color.secondary}
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={tokens.color.secondary}
                strokeWidth="2"
                strokeLinecap="round"
              >
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
            }
          />
          <StatCard
            label="Diagram hôm nay"
            value={stats?.diagramsToday}
            color={tokens.color.success}
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={tokens.color.success}
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          />
          <StatCard
            label="User mới tuần này"
            value={stats?.newUsersThisWeek}
            color={tokens.color.warning}
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={tokens.color.warning}
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
          />
        </div>

        {/* Charts */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: tokens.space.lg,
          }}
        >
          <ChartCard title="Người dùng mới (7 ngày)">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={userChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={tokens.color.border}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: tokens.color.textMuted }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: tokens.color.textMuted }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: tokens.radius.md,
                    border: `1px solid ${tokens.color.border}`,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Users"
                  stroke={tokens.color.primary}
                  strokeWidth={2}
                  dot={{ fill: tokens.color.primary, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Diagram mới (7 ngày)">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={diagramChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={tokens.color.border}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: tokens.color.textMuted }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: tokens.color.textMuted }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: tokens.radius.md,
                    border: `1px solid ${tokens.color.border}`,
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Diagrams"
                  fill={tokens.color.secondary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Recent tables */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: tokens.space.lg,
          }}
        >
          <RecentTable
            title="Người dùng mới nhất"
            columns={["Tên", "Email", "Ngày đăng ký"]}
            rows={(stats?.recentUsers || []).map((u) => [
              u.name || "—",
              u.email,
              u.createdAt,
            ])}
          />
          <RecentTable
            title="Diagram cập nhật gần nhất"
            columns={["Tên", "Owner", "Cập nhật"]}
            rows={(stats?.recentDiagrams || []).map((d) => [
              d.title || "Untitled",
              d.ownerId,
              d.updatedAt,
            ])}
          />
        </div>
      </div>
    </div>
  );
}
