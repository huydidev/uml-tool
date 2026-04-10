
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import WorkspaceListPage from "../apps/workspace-mgmt/pages/WorkspaceListPage";
import WorkspaceDetailPage from "../apps/workspace-mgmt/pages/WorkspaceDetailPage";
import WorkspaceSettingsPage from "../apps/workspace-mgmt/pages/WorkspaceSettingsPage";

const AuthPage = lazy(() => import("../apps/auth/pages/AuthPage"));
const HomePage = lazy(() => import("../apps/home/pages/HomePage"));
const EditorPage = lazy(() => import("../apps/workspace/pages/EditorPage"));
const SharedViewerPage = lazy(
  () => import("../apps/workspace/pages/SharedViewerPage"),
);

const ProfilePage = lazy(() => import("../apps/profile/pages/ProfilePage"));
const SharedWithMePage = lazy(
  () => import("../shared/pages/SharedWithMePage"),
);
const AdminPage = lazy(() => import("../apps/admin/AdminPage"));

// ── Guard: redirect về /auth nếu chưa đăng nhập ──────────────────
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/auth" replace />;
}

// ── Guard: chỉ admin mới vào được ─────────────────────────────────
function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/auth" replace />;
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();
  const isAdmin = user?.roles?.includes("ROLE_ADMIN") ?? false;
  return isAdmin ? children : <Navigate to="/" replace />;
}

// ── Fallback khi đang lazy load trang ────────────────────────────
function PageLoader() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F4F6F9",
        fontSize: 13,
        color: "#9CA3AF",
      }}
    >
      Đang tải...
    </div>
  );
}

export default function AppRouter() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/shared/:token" element={<SharedViewerPage />} />

          {/* Private */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/editor/new"
            element={
              <PrivateRoute>
                <EditorPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/editor/:id"
            element={
              <PrivateRoute>
                <EditorPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/shared-with-me"
            element={
              <PrivateRoute>
                <SharedWithMePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/workspaces"
            element={
              <PrivateRoute>
                <WorkspaceListPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/workspaces/:id"
            element={
              <PrivateRoute>
                <WorkspaceDetailPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/workspaces/:id/settings"
            element={
              <PrivateRoute>
                <WorkspaceSettingsPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
