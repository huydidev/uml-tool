// src/apps/user/components/ShareModal.jsx

import { useState } from 'react';

const PERMISSION_OPTIONS = [
  { value: 'edit', label: 'Can edit',  desc: 'Xem và chỉnh sửa', icon: '✏️' },
  { value: 'view', label: 'Can view',  desc: 'Chỉ xem',          icon: '👁️' },
];

// ── Dropdown chọn quyền ──────────────────────────────────────────────
function PermissionSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const current = PERMISSION_OPTIONS.find(o => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-600 hover:border-slate-400 bg-slate-800 text-xs text-slate-200 transition-all"
      >
        <span>{current?.icon}</span>
        <span>{current?.label}</span>
        <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-slate-400">
          <polyline points="6,9 12,15 18,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-10 overflow-hidden w-36">
          {PERMISSION_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-all hover:bg-slate-700 ${
                value === opt.value ? 'text-blue-400' : 'text-slate-200'
              }`}
            >
              <span>{opt.icon}</span>
              <div className="text-left">
                <div className="font-semibold">{opt.label}</div>
                <div className="text-[10px] text-slate-400">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Row người được share ─────────────────────────────────────────────
function SharedMemberRow({ member, onPermissionChange, onRevoke }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-700/50 last:border-0">
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
        style={{ backgroundColor: member.color || '#3b82f6' }}
      >
        {member.email.slice(0, 2).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-200 font-medium truncate">{member.email}</p>
        {member.name && <p className="text-[10px] text-slate-500 truncate">{member.name}</p>}
      </div>

      {/* Permission */}
      <PermissionSelect
        value={member.permission}
        onChange={(val) => onPermissionChange(member.email, val)}
      />

      {/* Revoke */}
      <button
        onClick={() => onRevoke(member.email)}
        title="Thu hồi quyền"
        className="text-slate-600 hover:text-red-400 transition-all text-sm w-5 shrink-0"
      >
        ✕
      </button>
    </div>
  );
}

// ── Main Modal ───────────────────────────────────────────────────────
export default function ShareModal({ isOpen, onClose, diagramId, shareLink }) {
  const [tab, setTab]               = useState('link'); // 'link' | 'email'
  const [emailInput, setEmailInput] = useState('');
  const [emailPermission, setEmailPermission] = useState('edit');
  const [linkPermission, setLinkPermission]   = useState('edit');
  const [linkCopied, setLinkCopied] = useState(false);
  const [linkEnabled, setLinkEnabled] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [sharedMembers, setSharedMembers] = useState([
    // Mock data — sau này fetch từ API
    { email: 'alice@example.com', name: 'Alice', permission: 'edit', color: '#8b5cf6' },
    { email: 'bob@example.com',   name: 'Bob',   permission: 'view', color: '#f59e0b' },
  ]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink || window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleInviteEmail = () => {
    const email = emailInput.trim();
    if (!email) { setEmailError('Nhập email vào!'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Email không hợp lệ!'); return; }
    if (sharedMembers.find(m => m.email === email)) { setEmailError('Email này đã được share rồi!'); return; }

    setSharedMembers(prev => [...prev, {
      email,
      name: '',
      permission: emailPermission,
      color: '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0'),
    }]);
    setEmailInput('');
    setEmailError('');
    // TODO: gọi API invite
  };

  const handlePermissionChange = (email, newPermission) => {
    setSharedMembers(prev => prev.map(m => m.email === email ? { ...m, permission: newPermission } : m));
    // TODO: gọi API update permission
  };

  const handleRevoke = (email) => {
    setSharedMembers(prev => prev.filter(m => m.email !== email));
    // TODO: gọi API revoke
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 text-lg">🔗</span>
            <h2 className="text-white font-bold text-base">Share Diagram</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-all"
          >✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 shrink-0">
          {[
            { id: 'link',  label: '🔗 Share link' },
            { id: 'email', label: '📧 Invite email' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-xs font-bold transition-all ${
                tab === t.id
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

          {/* ── Link tab ── */}
          {tab === 'link' && (
            <div className="flex flex-col gap-4">
              {/* Toggle link */}
              <div className="flex items-center justify-between bg-slate-800 rounded-xl px-4 py-3 border border-slate-700">
                <div>
                  <p className="text-sm text-slate-200 font-medium">Share qua link</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {linkEnabled ? 'Ai có link đều truy cập được' : 'Link chưa được bật'}
                  </p>
                </div>
                {/* Toggle switch */}
                <button
                  onClick={() => setLinkEnabled(e => !e)}
                  className={`w-10 h-5 rounded-full transition-all relative ${
                    linkEnabled ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                    linkEnabled ? 'left-5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {linkEnabled && (
                <>
                  {/* Permission cho link */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Quyền của người có link</span>
                    <PermissionSelect value={linkPermission} onChange={setLinkPermission} />
                  </div>

                  {/* Link box */}
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={shareLink || window.location.href}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono outline-none truncate"
                    />
                    <button
                      onClick={handleCopyLink}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        linkCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {linkCopied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Email tab ── */}
          {tab === 'email' && (
            <div className="flex flex-col gap-4">
              {/* Input invite */}
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <input
                    value={emailInput}
                    onChange={(e) => { setEmailInput(e.target.value); setEmailError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleInviteEmail()}
                    placeholder="email@example.com"
                    className="flex-1 bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition-all placeholder-slate-600"
                  />
                  <PermissionSelect value={emailPermission} onChange={setEmailPermission} />
                  <button
                    onClick={handleInviteEmail}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shrink-0"
                  >
                    Invite
                  </button>
                </div>
                {emailError && <p className="text-red-400 text-[10px]">⚠ {emailError}</p>}
              </div>

              {/* Danh sách đã share */}
              {sharedMembers.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Đã share ({sharedMembers.length})
                  </p>
                  <div className="bg-slate-800/50 rounded-xl px-3 border border-slate-700/50">
                    {sharedMembers.map(member => (
                      <SharedMemberRow
                        key={member.email}
                        member={member}
                        onPermissionChange={handlePermissionChange}
                        onRevoke={handleRevoke}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-700 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}