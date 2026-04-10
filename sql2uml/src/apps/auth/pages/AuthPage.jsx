import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { THEME } from "../../../shared/constants/theme";

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 13px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  backgroundColor: "#f8fafc",
  fontSize: 13,
  color: "#111827",
  outline: "none",
  transition: "border-color 0.15s",
};

const submitStyle = (loading) => ({
  width: "100%",
  padding: "11px 0",
  borderRadius: 10,
  border: "none",
  backgroundColor: loading ? "#93c5fd" : THEME.colors.PRIMARY,
  color: "#ffffff",
  fontSize: 13,
  fontWeight: 700,
  cursor: loading ? "not-allowed" : "pointer",
  marginTop: 4,
});

const linkStyle = {
  background: "none",
  border: "none",
  color: THEME.colors.PRIMARY,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  padding: 0,
};

function ErrorBox({ message }) {
  return (
    <div
      style={{
        padding: "9px 12px",
        borderRadius: 8,
        backgroundColor: "#fff1f2",
        border: "1px solid #fecdd3",
        fontSize: 12,
        color: "#e11d48",
      }}
    >
      {message}
    </div>
  );
}

// ── Redirect sau login: admin → /admin, user thường → / ───────────
function redirectAfterLogin(user, navigate) {
  if (user?.roles?.includes("ROLE_ADMIN")) {
    navigate("/admin");
  } else {
    navigate("/");
  }
}

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const navigate = useNavigate();

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setError(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || data || "Đăng nhập thất bại");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      redirectAfterLogin(data.user, navigate);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // 1. Register
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data || "Đăng ký thất bại");

      // 2. Tự động login sau khi register
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok)
        throw new Error("Đăng ký thành công, vui lòng đăng nhập lại");
      localStorage.setItem("token", loginData.token);
      localStorage.setItem("user", JSON.stringify(loginData.user));
      redirectAfterLogin(loginData.user, navigate);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError(null);
    setForm({ email: "", name: "", password: "" });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f6f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      }}
    >
      <div
        style={{
          width: 380,
          backgroundColor: "#ffffff",
          borderRadius: 16,
          border: "1px solid #e8eaed",
          padding: "36px 32px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.01em",
              marginBottom: 4,
            }}
          >
            Crystalline<span style={{ color: THEME.colors.PRIMARY }}>UML</span>
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280" }}>
            {mode === "login" ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
          </p>
        </div>

        {/* Toggle */}
        <div
          style={{
            display: "flex",
            backgroundColor: "#f1f5f9",
            borderRadius: 10,
            padding: 3,
            marginBottom: 24,
          }}
        >
          {["login", "register"].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                flex: 1,
                padding: "7px 0",
                borderRadius: 8,
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                backgroundColor: mode === m ? "#ffffff" : "transparent",
                color: mode === m ? THEME.colors.PRIMARY : "#6b7280",
                boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {m === "login" ? "Đăng nhập" : "Đăng ký"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form
          onSubmit={mode === "login" ? handleLogin : handleRegister}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              style={inputStyle}
              onFocus={(e) =>
                (e.target.style.borderColor = THEME.colors.PRIMARY)
              }
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          {mode === "register" && (
            <div>
              <label style={labelStyle}>Tên hiển thị</label>
              <input
                type="text"
                placeholder="Tên của bạn"
                value={form.name}
                onChange={set("name")}
                style={inputStyle}
                onFocus={(e) =>
                  (e.target.style.borderColor = THEME.colors.PRIMARY)
                }
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>
          )}

          <div>
            <label style={labelStyle}>Mật khẩu</label>
            <input
              type="password"
              required
              placeholder={
                mode === "register" ? "Tối thiểu 8 ký tự" : "••••••••"
              }
              value={form.password}
              onChange={set("password")}
              minLength={mode === "register" ? 8 : undefined}
              style={inputStyle}
              onFocus={(e) =>
                (e.target.style.borderColor = THEME.colors.PRIMARY)
              }
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          {error && <ErrorBox message={error} />}

          <button type="submit" disabled={loading} style={submitStyle(loading)}>
            {loading
              ? mode === "login"
                ? "Đang đăng nhập..."
                : "Đang tạo tài khoản..."
              : mode === "login"
                ? "Đăng nhập"
                : "Tạo tài khoản"}
          </button>
        </form>

        {/* Switch link */}
        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "#6b7280",
            marginTop: 16,
          }}
        >
          {mode === "login" ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
          <button
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
            style={linkStyle}
          >
            {mode === "login" ? "Đăng ký ngay" : "Đăng nhập"}
          </button>
        </p>
      </div>
    </div>
  );
}
