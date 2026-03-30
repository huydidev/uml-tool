// src/apps/user/components/SQLParserPanel.jsx

import { useState } from 'react';
import { generateSQL, parseSQLToNodes } from '../../../shared/utils/sqlParser';

export default function SQLParserPanel({ nodes, edges, onApplyToCanvas }) {
  const [sqlInput, setSqlInput]     = useState('');
  const [sqlOutput, setSqlOutput]   = useState('');
  const [parseResult, setParseResult] = useState(null);
  const [activeTab, setActiveTab]   = useState('input'); // 'input' | 'output'
  const [parseError, setParseError] = useState('');

  const handleGenerateFromDiagram = () => {
    const sql = generateSQL(nodes, edges);
    setSqlOutput(sql);
    setParseResult(null);
    setActiveTab('output');
  };

  const handleParseSQL = () => {
    if (!sqlInput.trim()) { setParseError('Paste SQL vào trước!'); return; }
    try {
      setParseError('');
      const result = parseSQLToNodes(sqlInput);
      if (result.nodes.length === 0) {
        setParseError('Không tìm thấy CREATE TABLE nào.');
        return;
      }
      setParseResult(result);
      setSqlOutput(result.formattedSQL);
      setActiveTab('output');
    } catch (err) {
      setParseError('Lỗi: ' + err.message);
    }
  };

  const handleApply = () => {
    if (!parseResult) return;
    onApplyToCanvas(parseResult.nodes, parseResult.edges);
    setParseResult(null);
    setSqlInput('');
    setSqlOutput('');
    setActiveTab('input');
  };

  return (
    <div className="flex flex-col h-full">

      {/* Tabs */}
      <div className="flex border-b border-slate-700/60 shrink-0">
        {['input', 'output'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-1.5 text-[10px] font-bold transition-all capitalize ${
              activeTab === t
                ? 'text-violet-400 border-b-2 border-violet-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t === 'input' ? 'Input' : `Output${parseResult ? ` (${parseResult.nodes.length})` : ''}`}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex flex-col p-2 gap-2">

        {activeTab === 'input' && (
          <>
            <textarea
              value={sqlInput}
              onChange={(e) => { setSqlInput(e.target.value); setParseError(''); }}
              placeholder={'-- Paste SQL vào đây\nCREATE TABLE users (\n  id VARCHAR(36) PRIMARY KEY\n);'}
              className="flex-1 bg-white border border-slate-700 focus:border-violet-500 rounded-lg p-2 text-[10px] text-green-400 font-mono resize-none outline-none transition-all placeholder-slate-600"
            />
            {parseError && (
              <p className="text-red-400 text-[9px] shrink-0">⚠ {parseError}</p>
            )}
          </>
        )}

        {activeTab === 'output' && (
          <>
            {parseResult && (
              <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-lg px-2 py-1.5 flex items-center justify-between shrink-0">
                <span className="text-emerald-400 text-[9px] font-bold">
                  ✓ {parseResult.nodes.length} tables · {parseResult.edges.length} relations
                </span>
                <button
                  onClick={handleApply}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded text-[9px] font-bold transition-all"
                >
                  Apply →
                </button>
              </div>
            )}
            <div className="flex items-center justify-between shrink-0">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest">SQL</span>
              <button
                onClick={() => navigator.clipboard.writeText(sqlOutput)}
                className="text-[9px] bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-0.5 rounded transition-all"
              >
                Copy
              </button>
            </div>
            <pre className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-[10px] text-green-400 font-mono overflow-auto whitespace-pre">
              {sqlOutput || '-- Output hiện ở đây'}
            </pre>
          </>
        )}
      </div>

      {/* Footer actions */}
      <div className="px-2 py-2 border-t border-slate-700/60 flex gap-1.5 shrink-0">
        <button
          onClick={handleGenerateFromDiagram}
          className="flex-1 py-1.5 rounded-lg text-[10px] font-bold border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 transition-all"
        >
          Diagram → SQL
        </button>
        <button
          onClick={handleParseSQL}
          className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all"
        >
          ⚡ Parse SQL
        </button>
      </div>
    </div>
  );
}