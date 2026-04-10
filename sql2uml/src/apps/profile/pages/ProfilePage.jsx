// src/apps/profile/pages/ProfilePage.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../shared/constants/Tokens";
// ── Reusable input component ──────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontSize: tokens.font.sm,
          fontWeight: tokens.weight.semibold,
          color: tokens.color.textSub,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder, disabled }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        padding: `${tokens.space.sm}px ${tokens.space.md}px`,
        borderRadius: tokens.radius.md,
        border: `1px solid ${focused ? tokens.color.primary : tokens.color.border}`,
        backgroundColor: disabled ? tokens.color.surface : tokens.color.white,
        fontSize: tokens.font.md,
        color: disabled ? tokens.color.textSub : tokens.color.textBase,
        outline: "none",
        transition: "border-color 0.15s",
        width: "100%",
        boxSizing: "border-box",
        cursor: disabled ? "not-allowed" : "text",
      }}
    />
  );
}

function SaveButton({ loading, disabled, onClick, children }) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        padding: `${tokens.space.sm}px ${tokens.space.xl}px`,
        borderRadius: tokens.radius.md,
        border: "none",
        backgroundColor:
          loading || disabled ? tokens.color.border : tokens.color.primary,
        color: tokens.color.white,
        fontSize: tokens.font.md,
        fontWeight: tokens.weight.semibold,
        cursor: loading || disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s",
        alignSelf: "flex-start",
      }}
    >
      {loading ? "Đang lưu..." : children}
    </button>
  );
}

function AlertBox({ type, message }) {
  const styles = {
    success: { bg: "#f0fdf4", border: "#bbf7d0", color: "#16a34a" },
    error: { bg: "#fff1f2", border: "#fecdd3", color: "#e11d48" },
  };
  const s = styles[type];
  return (
    <div
      style={{
        padding: `${tokens.space.sm}px ${tokens.space.md}px`,
        borderRadius: tokens.radius.md,
        backgroundColor: s.bg,
        border: `1px solid ${s.border}`,
        fontSize: tokens.font.base,
        color: s.color,
      }}
    >
      {message}
    </div>
  );
}

// ── Section card wrapper ──────────────────────────────────────────
function Card({ title, subtitle, children }) {
  return (
    <div
      style={{
        backgroundColor: tokens.color.white,
        borderRadius: tokens.radius.xl,
        border: `1px solid ${tokens.color.border}`,
        padding: tokens.space.xxl,
        boxShadow: tokens.shadow.sm,
        display: "flex",
        flexDirection: "column",
        gap: tokens.space.lg,
      }}
    >
      <div>
        <h2
          style={{
            fontSize: tokens.font.lg,
            fontWeight: tokens.weight.bold,
            color: tokens.color.textBase,
            marginBottom: 4,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            style={{ fontSize: tokens.font.sm, color: tokens.color.textMuted }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ── Profile state ─────────────────────────────────────────────
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null); // { type, text }

  // ── Password state ────────────────────────────────────────────
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null);

  // ── Load user info khi mount ──────────────────────────────────
  useEffect(() => {
    if (!token) {
      navigate("/auth");
      return;
    }
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          navigate("/auth");
          return;
        }
        const data = await res.json();
        setName(data.name || "");
        setEmail(data.email || "");
        // Cập nhật localStorage để header hiện đúng tên
        localStorage.setItem("user", JSON.stringify(data));
      } catch {}
    };
    fetchMe();
  }, [token]);

  // ── Đổi tên ───────────────────────────────────────────────────
  const handleUpdateProfile = async () => {
    if (!name.trim()) return;
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cập nhật thất bại");
      localStorage.setItem("user", JSON.stringify(data));
      setProfileMsg({ type: "success", text: "Cập nhật thành công!" });
    } catch (e) {
      setProfileMsg({ type: "error", text: e.message });
    } finally {
      setProfileLoading(false);
      setTimeout(() => setProfileMsg(null), 3000);
    }
  };

  // ── Đổi mật khẩu ─────────────────────────────────────────────
  const handleUpdatePassword = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdMsg({ type: "error", text: "Vui lòng điền đầy đủ" });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: "error", text: "Mật khẩu mới không khớp" });
      return;
    }
    if (newPwd.length < 8) {
      setPwdMsg({
        type: "error",
        text: "Mật khẩu mới phải có ít nhất 8 ký tự",
      });
      return;
    }

    setPwdLoading(true);
    setPwdMsg(null);
    try {
      const res = await fetch("/api/users/me/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: currentPwd,
          newPassword: newPwd,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Đổi mật khẩu thất bại");
      }
      setPwdMsg({ type: "success", text: "Đổi mật khẩu thành công!" });
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (e) {
      setPwdMsg({ type: "error", text: e.message });
    } finally {
      setPwdLoading(false);
      setTimeout(() => setPwdMsg(null), 3000);
    }
  };

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

      {/* Content */}
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: tokens.space.xxl,
          display: "flex",
          flexDirection: "column",
          gap: tokens.space.lg,
        }}
      >
        {/* Avatar + tên */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.space.lg,
            padding: tokens.space.xl,
            backgroundColor: tokens.color.white,
            borderRadius: tokens.radius.xl,
            border: `1px solid ${tokens.color.border}`,
            boxShadow: tokens.shadow.sm,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: tokens.color.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: tokens.weight.bold,
              color: tokens.color.white,
              flexShrink: 0,
            }}
          >
            {name ? name.slice(0, 2).toUpperCase() : "?"}
          </div>
          <div>
            <p
              style={{
                fontSize: tokens.font.xl,
                fontWeight: tokens.weight.bold,
                color: tokens.color.textBase,
                marginBottom: 4,
              }}
            >
              {name || "Chưa có tên"}
            </p>
            <p
              style={{ fontSize: tokens.font.md, color: tokens.color.textSub }}
            >
              {email}
            </p>
          </div>
        </div>

        {/* Card đổi tên */}
        <Card
          title="Thông tin cá nhân"
          subtitle="Cập nhật tên hiển thị của bạn"
        >
          <Field label="Email">
            <Input value={email} disabled />
          </Field>
          <Field label="Tên hiển thị">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên của bạn"
            />
          </Field>
          {profileMsg && (
            <AlertBox type={profileMsg.type} message={profileMsg.text} />
          )}
          <SaveButton loading={profileLoading} onClick={handleUpdateProfile}>
            Lưu thay đổi
          </SaveButton>
        </Card>

        {/* Card đổi mật khẩu */}
        <Card
          title="Đổi mật khẩu"
          subtitle="Mật khẩu mới phải có ít nhất 8 ký tự"
        >
          <Field label="Mật khẩu hiện tại">
            <Input
              type="password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              placeholder="••••••••"
            />
          </Field>
          <Field label="Mật khẩu mới">
            <Input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
            />
          </Field>
          <Field label="Xác nhận mật khẩu mới">
            <Input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
            />
          </Field>
          {pwdMsg && <AlertBox type={pwdMsg.type} message={pwdMsg.text} />}
          <SaveButton loading={pwdLoading} onClick={handleUpdatePassword}>
            Đổi mật khẩu
          </SaveButton>
        </Card>
      </div>
    </div>
  );
}
