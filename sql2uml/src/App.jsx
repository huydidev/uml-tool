import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EditorPage       from './apps/workspace/pages/EditorPage';
import SharedViewerPage from './apps/workspace/pages/SharedViewerPage';
import HomePage         from './apps/home/pages/HomePage';
import AuthPage         from './apps/auth/pages/AuthPage';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>

        {/* Auth */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Home */}
        <Route path="/" element={
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        }/>

        {/* Editor — tạo mới */}
        <Route path="/editor/new" element={
          <PrivateRoute>
            <EditorPage />
          </PrivateRoute>
        }/>

        {/* Editor — mở có sẵn */}
        <Route path="/editor/:id" element={
          <PrivateRoute>
            <EditorPage />
          </PrivateRoute>
        }/>

        {/* Shared viewer — không cần login, read-only */}
        <Route path="/shared/:token" element={<SharedViewerPage />} />

        {/* Admin */}
        <Route path="/admin" element={
          <div className="p-10 text-2xl">Admin Dashboard (Coming Soon)</div>
        }/>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}