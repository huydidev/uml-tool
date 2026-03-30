// src/apps/user/components/SaveDiagramModal.jsx

import { useState, useEffect, useRef } from 'react';

export default function SaveDiagramModal({ isOpen, onClose, onSave, defaultTitle = '' }) {
  const [title, setTitle] = useState(defaultTitle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(defaultTitle);
      setError('');
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, defaultTitle]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim()) { setError('Vui lòng nhập tên diagram!'); return; }
    setLoading(true);
    setError('');
    try {
      await onSave(title.trim());
      onClose();
    } catch (err) {
      setError('Lưu thất bại: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 text-lg">💾</span>
            <h2 className="text-white font-bold text-base">Lưu Diagram</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Tên Diagram
            </label>
            <input
              ref={inputRef}
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder="VD: Hệ thống quản lý sinh viên"
              className="bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all placeholder-slate-600"
            />
            {error && (
              <p className="text-red-400 text-xs">⚠ {error}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all flex items-center gap-2"
          >
            {loading && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {loading ? 'Đang lưu...' : '💾 Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}