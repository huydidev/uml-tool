// src/shared/constants/edgeConfigs.js

export const EDGE_CONFIGS = [
  { type: 'association', label: 'Association', icon: '→',  desc: 'Liên kết thông thường',       color: '#60a5fa' },
  { type: 'inheritance', label: 'Inheritance', icon: '▷',  desc: 'Kế thừa (extends)',            color: '#a78bfa' },
  { type: 'aggregation', label: 'Aggregation', icon: '◇→', desc: 'Tổng hợp (has-a)',             color: '#fbbf24' },
  { type: 'composition', label: 'Composition', icon: '◆→', desc: 'Thành phần (owns, cascade)',   color: '#f87171' },
];