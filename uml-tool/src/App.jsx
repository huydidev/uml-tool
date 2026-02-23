import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EditorPage from './apps/user/pages/EditorPage';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Mặc định vào thẳng trang vẽ sơ đồ */}
        <Route path="/" element={<EditorPage />} />
        
        {/* Sau này thêm trang Admin tại đây */}
        <Route path="/admin" element={<div className="p-10 text-2xl">Admin Dashboard (Coming Soon)</div>} />
      </Routes>
    </Router>
  );
}