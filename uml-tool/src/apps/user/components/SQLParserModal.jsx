// src/apps/user/components/SQLParserModal.jsx

import { useState } from 'react';
import { generateSQL, parseSQLToNodes } from '../../../shared/utils/Sqlparser';

export default function SQLParserModal({ isOpen, onClose, nodes, edges, onApplyToCanvas }) {
  const [sqlInput, setSqlInput]       = useState('');
  const [sqlOutput, setSqlOutput]     = useState('');
  const [parseResult, setParseResult] = useState(null);
  const [activeTab, setActiveTab]     = useState('input');
  const [parseError, setParseError]   = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setSqlInput(''); setSqlOutput('');
    setParseResult(null); setParseError('');
    setActiveTab('input');
    onClose();
  };

  const handleGenerateFromDiagram = () => {
    const sql = generateSQL(nodes, edges);
    setSqlOutput(sql);
    setParseResult(null);
    setActiveTab('output');
  };

  const handleParseSQL = () => {
    if (!sqlInput.trim()) { setParseError('Vui lòng paste SQL vào trước!'); return; }
    try {
      setParseError('');
      const result = parseSQLToNodes(sqlInput);
      if (result.nodes.length === 0) {
        setParseError('Không tìm thấy CREATE TABLE nào. Kiểm tra lại cú pháp SQL.');
        return;
      }
      setParseResult(result);
      setSqlOutput(result.formattedSQL);
      setActiveTab('output');
    } catch (err) {
      setParseError('Lỗi parse: ' + err.message);
    }
  };

  const handleApply = () => {
    if (!parseResult) return;
    onApplyToCanvas(parseResult.nodes, parseResult.edges);
    handleClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-2xl flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-violet-400 text-xl">⚡</span>
            <div>
              <h2 className="text-white font-bold text-base">SQL Parser</h2>
              <p className="text-slate-400 text-xs">Paste SQL → tạo diagram · hoặc generate SQL từ diagram</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-all text-lg"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 shrink-0">
          <button
            onClick={() => setActiveTab('input')}
            className={`flex-1 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'input'
                ? 'text-violet-400 border-b-2 border-violet-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Input SQL
          </button>
          <button
            onClick={() => setActiveTab('output')}
            className={`flex-1 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'output'
                ? 'text-violet-400 border-b-2 border-violet-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Output {parseResult ? `(${parseResult.nodes.length} tables)` : ''}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Input tab */}
          {activeTab === 'input' && (
            <div className="flex flex-col gap-4">
              <textarea
                value={sqlInput}
                onChange={(e) => { setSqlInput(e.target.value); setParseError(''); }}
                placeholder={'-- Paste SQL vào đây\nCREATE TABLE users (\n  id VARCHAR(36) PRIMARY KEY,\n  name VARCHAR(255)\n);'}
                className="w-full h-56 bg-slate-800 border border-slate-600 rounded-xl p-4 text-green-400 text-xs font-mono resize-none outline-none focus:border-violet-500 transition-all placeholder-slate-600"
              />
              {parseError && (
                <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-2 text-red-400 text-xs">
                  ⚠ {parseError}
                </div>
              )}
            </div>
          )}

          {/* Output tab */}
          {activeTab === 'output' && (
            <div className="flex flex-col gap-3">
              {parseResult && (
                <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg px-4 py-3 flex items-center justify-between">
                  <span className="text-emerald-400 text-xs font-bold">
                    ✓ {parseResult.nodes.length} tables · {parseResult.edges.length} relationships
                  </span>
                  <button
                    onClick={handleApply}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >
                    Áp dụng lên Canvas →
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Formatted SQL</span>
                <button
                  onClick={() => navigator.clipboard.writeText(sqlOutput)}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded-lg transition-all"
                >
                  Copy
                </button>
              </div>
              <pre className="bg-slate-800 border border-slate-600 rounded-xl p-4 text-green-400 text-xs font-mono overflow-auto max-h-64 whitespace-pre">
                {sqlOutput || '-- Output sẽ hiển thị ở đây'}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex gap-3 justify-between items-center shrink-0">
          <button
            onClick={handleGenerateFromDiagram}
            className="text-xs text-slate-400 hover:text-violet-400 transition-all underline"
          >
            Generate SQL từ diagram hiện tại
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            >
              Hủy
            </button>
            <button
              onClick={handleParseSQL}
              className="px-5 py-2 rounded-lg text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all"
            >
              ⚡ Parse SQL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}