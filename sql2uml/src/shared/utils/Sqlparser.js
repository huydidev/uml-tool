/**
 * Sqlparser.js — Tokenizer-based, không regex parse column
 * Không cần cài thêm thư viện nào
 */

// ── Generators ────────────────────────────────────────────────────────
export function genTableId() {
  return 'tbl_' + Math.random().toString(36).slice(2, 9);
}
function genEdgeId() {
  return 'edge_' + Math.random().toString(36).slice(2, 9);
}

// ── Maps ──────────────────────────────────────────────────────────────
export const RELATION_MAP  = { '-as':'association', '-in':'inheritance', '-ag':'aggregation', '-co':'composition' };
export const RELATION_CODE = { association:'-as', inheritance:'-in', aggregation:'-ag', composition:'-co' };

const SQL_TO_UML = {
  INT:'int', INTEGER:'int', BIGINT:'long', SMALLINT:'int', TINYINT:'boolean',
  MEDIUMINT:'int', SERIAL:'long',
  VARCHAR:'string', CHAR:'string', TEXT:'text', LONGTEXT:'text',
  MEDIUMTEXT:'text', TINYTEXT:'text', NVARCHAR:'string',
  BOOLEAN:'boolean', BOOL:'boolean',
  FLOAT:'float', DOUBLE:'double', DECIMAL:'decimal', NUMERIC:'decimal', REAL:'float',
  DATE:'date', DATETIME:'datetime', TIMESTAMP:'timestamp', TIME:'datetime', YEAR:'int',
  JSON:'text', JSONB:'text', UUID:'uuid', BLOB:'text', BINARY:'text', VARBINARY:'text',
};

export const UML_TO_SQL = {
  int:'INT', integer:'INT', long:'BIGINT',
  string:'VARCHAR(255)', str:'VARCHAR(255)', text:'TEXT',
  boolean:'BOOLEAN', bool:'BOOLEAN',
  float:'FLOAT', double:'DOUBLE',
  date:'DATE', datetime:'DATETIME', timestamp:'TIMESTAMP',
  uuid:'VARCHAR(36)', decimal:'DECIMAL(10,2)',
  number:'INT', varchar:'VARCHAR(255)',
};

// ─────────────────────────────────────────────────────────────────────
// TOKENIZER — scan char by char, không regex parse structure
// ─────────────────────────────────────────────────────────────────────
function tokenize(sql) {
  const tokens = [];
  let i = 0;

  while (i < sql.length) {
    const ch = sql[i];

    if (/[ \t\r\n]/.test(ch)) { i++; continue; }

    // -- comment
    if (ch === '-' && sql[i+1] === '-') {
      let j = i;
      while (j < sql.length && sql[j] !== '\n') j++;
      tokens.push({ type: 'COMMENT', value: sql.slice(i, j) });
      i = j; continue;
    }

    // backtick / double-quote identifier
    if (ch === '`' || ch === '"') {
      let j = i + 1;
      while (j < sql.length && sql[j] !== ch) j++;
      tokens.push({ type: 'WORD', value: sql.slice(i+1, j).toUpperCase(), raw: sql.slice(i+1, j) });
      i = j + 1; continue;
    }

    // single-quoted string
    if (ch === "'") {
      let j = i + 1;
      while (j < sql.length && sql[j] !== "'") { if (sql[j] === '\\') j++; j++; }
      tokens.push({ type: 'STRING', value: sql.slice(i+1, j) });
      i = j + 1; continue;
    }

    // punctuation
    if ('(),;'.includes(ch)) { tokens.push({ type: ch, value: ch }); i++; continue; }

    // word / keyword
    if (/[a-zA-Z_]/.test(ch)) {
      let j = i;
      while (j < sql.length && /[a-zA-Z0-9_]/.test(sql[j])) j++;
      const raw = sql.slice(i, j);
      tokens.push({ type: 'WORD', value: raw.toUpperCase(), raw });
      i = j; continue;
    }

    // number
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < sql.length && /[0-9.]/.test(sql[j])) j++;
      tokens.push({ type: 'NUMBER', value: sql.slice(i, j) });
      i = j; continue;
    }

    i++;
  }
  return tokens;
}

// ── Parse SQL type: INT, VARCHAR(255), DECIMAL(10,2) ─────────────────
function consumeType(tokens, pos) {
  const base = tokens[pos];
  if (!base || base.type !== 'WORD') return { sqlType:'VARCHAR(255)', umlType:'string', next: pos };

  let sqlType = base.value;
  let next    = pos + 1;

  if (tokens[next]?.type === '(') {
    let depth = 1, j = next + 1, parts = [];
    while (j < tokens.length && depth > 0) {
      if      (tokens[j].type === '(') depth++;
      else if (tokens[j].type === ')') { depth--; if (!depth) break; }
      parts.push(tokens[j].value);
      j++;
    }
    sqlType = `${base.value}(${parts.join(',')})`;
    next    = j + 1;
  }

  return { sqlType, umlType: SQL_TO_UML[base.value] || 'string', next };
}

// ── Skip đến ',' hoặc ')' cùng cấp ──────────────────────────────────
function skipToDelimiter(tokens, pos) {
  let depth = 0;
  while (pos < tokens.length) {
    if      (tokens[pos].type === '(') depth++;
    else if (tokens[pos].type === ')') { if (!depth) break; depth--; }
    else if (tokens[pos].type === ',' && !depth) break;
    pos++;
  }
  return pos;
}

// ── Parse 1 CREATE TABLE statement (token array) ─────────────────────
function parseCreateTable(tokens) {
  let pos = 0;

  // Tìm TABLE
  while (pos < tokens.length && tokens[pos].value !== 'TABLE') pos++;
  pos++;

  // IF NOT EXISTS
  if (tokens[pos]?.value === 'IF') pos += 3;

  // Table name
  const tableName = (tokens[pos]?.raw || tokens[pos]?.value || 'unknown').toLowerCase();
  pos++;

  // @id từ COMMENT token
  let tableId = null;
  for (let k = 0; k < tokens.length && k < pos + 6; k++) {
    if (tokens[k].type === 'COMMENT') {
      const m = tokens[k].value.match(/@id:([^\s)\n]+)/);
      if (m) { tableId = m[1]; break; }
    }
  }

  // Skip đến '('
  while (pos < tokens.length && tokens[pos].type !== '(') pos++;
  pos++;

  const attributes  = [];
  const foreignKeys = [];

  while (pos < tokens.length) {
    const tok = tokens[pos];
    if (tok.type === ')')       break;
    if (tok.type === ',')       { pos++; continue; }
    if (tok.type === 'COMMENT') { pos++; continue; }

    const kw = tok.value;

    // Table-level constraints / keys
    if (['PRIMARY','UNIQUE','INDEX','KEY','FULLTEXT','SPATIAL'].includes(kw)) {
      pos = skipToDelimiter(tokens, pos + 1);
      continue;
    }

    // FOREIGN KEY (...) REFERENCES table(...)
    if (kw === 'FOREIGN') {
      while (pos < tokens.length && tokens[pos].value !== 'REFERENCES') pos++;
      pos++;
      const ref = tokens[pos]?.raw || tokens[pos]?.value?.toLowerCase();
      if (ref) foreignKeys.push(ref);
      pos = skipToDelimiter(tokens, pos + 1);
      continue;
    }

    // CONSTRAINT name → skip name, re-loop để xử lý FOREIGN/PRIMARY tiếp theo
    if (kw === 'CONSTRAINT') { pos += 2; continue; }

    // ── Column definition ─────────────────────────────────────────
    const colName = tok.raw || tok.value.toLowerCase();
    pos++;

    // Chỉ có tên (đang gõ dở)
    if (!tokens[pos] || tokens[pos].type === ',' || tokens[pos].type === ')') {
      attributes.push(`- ${colName}?: string`);
      continue;
    }

    const { sqlType, umlType, next: afterType } = consumeType(tokens, pos);
    pos = afterType;

    let isPK    = colName.toLowerCase() === 'id';
    let notNull = isPK;

    // Column-level modifiers
    while (pos < tokens.length && tokens[pos].type !== ',' && tokens[pos].type !== ')') {
      const mod = tokens[pos].value;
      if (mod === 'PRIMARY')            { isPK = true; notNull = true; pos += 2; continue; }
      if (mod === 'NOT')                { notNull = true; pos += 2; continue; }
      if (['NULL','UNIQUE','UNSIGNED','ZEROFILL','AUTO_INCREMENT'].includes(mod)) { pos++; continue; }
      if (mod === 'DEFAULT') {
        pos++;
        if (tokens[pos]?.type === '(') { pos = skipToDelimiter(tokens, pos + 1) + 1; }
        else pos++;
        continue;
      }
      if (mod === 'REFERENCES') {
        pos++;
        const ref = tokens[pos]?.raw || tokens[pos]?.value?.toLowerCase();
        if (ref) foreignKeys.push(ref);
        pos++;
        if (tokens[pos]?.type === '(') {
          pos++;
          while (pos < tokens.length && tokens[pos].type !== ')') pos++;
          pos++;
        }
        continue;
      }
      if (mod === 'ON')      { pos += 3; continue; } // ON DELETE/UPDATE x
      if (mod === 'COMMENT') { pos += 2; continue; } // COMMENT 'str'
      if (mod === 'CHARACTER' || mod === 'COLLATE') { pos += 2; continue; }
      pos++;
    }

    const modifier = isPK ? '+' : '-';
    const optional = (!notNull && !isPK) ? '?' : '';
    attributes.push(`${modifier} ${colName}${optional}: ${umlType}`);
  }

  return { tableName, tableId, attributes, foreignKeys };
}

// ── Normalize: thêm ; sau ) khi depth=0 (SQL không có ;) ────────────
function normalizeStatements(sql) {
  const lines   = sql.split('\n');
  const result  = [];
  let depth     = 0;

  for (const line of lines) {
    const code = line.replace(/--[^\n]*/g, '');
    for (const ch of code) {
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
    }
    // Nếu depth=0 và dòng chứa ) mà chưa có ; → thêm ;
    if (depth === 0 && code.includes(')') && !line.trimEnd().endsWith(';')) {
      result.push(line + ';');
    } else {
      result.push(line);
    }
  }
  return result.join('\n');
}

// ── Split text thành statements (depth-aware, comment-aware) ─────────
function splitStatements(sql) {
  const result = [];
  let cur = '', depth = 0, inComment = false;

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (ch === '\n')                                   inComment = false;
    if (!inComment && ch === '-' && sql[i+1] === '-')  inComment = true;
    if (inComment)                                     { cur += ch; continue; }
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ';' && depth === 0) {
      if (cur.trim()) result.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) result.push(cur.trim());
  return result;
}

function autoPosition(index) {
  return { x: 80 + (index % 3) * 320, y: 80 + Math.floor(index / 3) * 280 };
}

// ─────────────────────────────────────────────────────────────────────
// preInjectAllIds — inject @id vào dòng CREATE TABLE chưa có
// ─────────────────────────────────────────────────────────────────────
export function preInjectAllIds(sqlText) {
  const lines    = sqlText.split('\n');
  const injected = [];

  const result = lines.map(line => {
    const m = line.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?(\w+)["`]?\s*\(/i);
    if (!m || /@id:[^\s)]+/i.test(line)) return line;

    const tableName = m[1];
    const tableId   = genTableId();
    injected.push({ tableName, tableId });

    return line.replace(
      /(\bCREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?\w+["`]?\s*\()/i,
      `$1 -- @id:${tableId}`
    );
  });

  return { text: result.join('\n'), injected };
}

// ─────────────────────────────────────────────────────────────────────
// parseSQLToNodes
// ─────────────────────────────────────────────────────────────────────
export function parseSQLToNodes(sqlText) {
  const nodes = [];
  const edges = [];

  // @relation comments
  const relLines = [];
  const relRe = /--\s*@relation:\s*(\w+)\s+(-as|-in|-ag|-co)\s+(\w+)/gi;
  let rm;
  while ((rm = relRe.exec(sqlText)) !== null) {
    relLines.push({ from: rm[1].toLowerCase(), code: rm[2].toLowerCase(), to: rm[3].toLowerCase() });
  }

  // Parse each CREATE TABLE
  for (const stmt of splitStatements(normalizeStatements(sqlText))) {
    if (!/CREATE\s+TABLE/i.test(stmt)) continue;

    const tokens = tokenize(stmt);
    const { tableName, tableId, attributes, foreignKeys } = parseCreateTable(tokens);

    if (!tableId) continue; // skip nếu chưa inject @id

    nodes.push({
      id:   tableId,
      type: 'umlClass',
      position: autoPosition(nodes.length),
      data: { label: tableName.toUpperCase(), tableName, tableId, attributes, methods: [], _fks: foreignKeys },
    });
  }

  // Build edges
  const seen = new Set();
  const addEdge = (from, to, type) => {
    const src = nodes.find(n => n.data.tableName === from);
    const tgt = nodes.find(n => n.data.tableName === to);
    if (!src || !tgt || src.id === tgt.id) return;
    const key = `${src.id}-${tgt.id}-${type}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ id: genEdgeId(), source: src.id, target: tgt.id, type });
  };

  for (const node of nodes) {
    for (const fk of (node.data._fks || [])) addEdge(node.data.tableName, fk, 'association');
    delete node.data._fks;
  }
  for (const rel of relLines) addEdge(rel.from, rel.to, RELATION_MAP[rel.code] || 'association');

  return { nodes, edges };
}

// ─────────────────────────────────────────────────────────────────────
// nodeToSQL
// ─────────────────────────────────────────────────────────────────────
function parseUmlAttr(line) {
  const clean = line.trim().replace(/^[-+#~]\s*/, '');
  const ci    = clean.indexOf(':');
  let name, rawType;
  if (ci !== -1) {
    name    = clean.slice(0, ci).replace(/\?$/, '').trim();
    rawType = clean.slice(ci + 1).trim().toLowerCase();
  } else {
    name    = clean.replace(/\?$/, '').trim();
    rawType = 'varchar';
  }
  name = name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
  if (!name) return null;
  return { name, sqlType: UML_TO_SQL[rawType] || 'VARCHAR(255)', isPK: name === 'id' };
}

export function nodeToSQL(node) {
  const tableName = node.data.tableName
    || node.data.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const tableId   = node.data.tableId || node.id;
  const attrs     = (node.data.attributes || []).filter(a => a.trim());
  const cols      = [];

  const hasId = attrs.some(a => {
    const n = a.replace(/^[-+#~]\s*/, '').split(':')[0].replace(/\?$/, '').trim().toLowerCase();
    return n === 'id';
  });
  if (!hasId) cols.push(`  id VARCHAR(36) PRIMARY KEY`);

  for (const attr of attrs) {
    const p = parseUmlAttr(attr);
    if (!p) continue;
    cols.push(p.isPK ? `  ${p.name} ${p.sqlType} PRIMARY KEY` : `  ${p.name} ${p.sqlType}`);
  }
  if (!cols.length) cols.push(`  id VARCHAR(36) PRIMARY KEY`);

  return `CREATE TABLE ${tableName} ( -- @id:${tableId}\n${cols.join(',\n')}\n)`;
}

// ─────────────────────────────────────────────────────────────────────
// updateTableInSQL
// ─────────────────────────────────────────────────────────────────────
export function updateTableInSQL(sqlText, tableId, node) {
  const newBlock = nodeToSQL(node);
  const lines    = sqlText.split('\n');

  const idLine = lines.findIndex(l => l.includes(`@id:${tableId}`));
  if (idLine === -1) {
    return sqlText.trimEnd() + (sqlText.trimEnd() ? '\n\n' : '') + newBlock;
  }

  let start = idLine;
  for (let j = idLine; j >= 0; j--) {
    if (/CREATE\s+TABLE/i.test(lines[j])) { start = j; break; }
  }

  let end = start, depth = 0, begun = false;
  for (let i = start; i < lines.length; i++) {
    for (const ch of lines[i].replace(/--[^\n]*/g, '')) {
      if (ch === '(') { depth++; begun = true; }
      else if (ch === ')') depth--;
    }
    if (begun && depth === 0) { end = i; break; }
  }

  const before = lines.slice(0, start);
  const after  = lines.slice(end + 1);
  while (before.length && !before.at(-1).trim()) before.pop();
  while (after.length  && !after[0].trim())       after.shift();

  return [
    ...(before.length ? [before.join('\n')] : []),
    newBlock,
    ...(after.length  ? [after.join('\n')]  : []),
  ].join('\n\n');
}

// ─────────────────────────────────────────────────────────────────────
// Relation helpers
// ─────────────────────────────────────────────────────────────────────
export function edgeToRelationComment(edge, nodes) {
  const src = nodes.find(n => n.id === edge.source);
  const tgt = nodes.find(n => n.id === edge.target);
  if (!src || !tgt) return null;
  const s = src.data.tableName || src.data.label.toLowerCase();
  const t = tgt.data.tableName || tgt.data.label.toLowerCase();
  return `-- @relation: ${s} ${RELATION_CODE[edge.type] || '-as'} ${t}`;
}

export function upsertRelationInSQL(sqlText, edge, nodes) {
  const comment = edgeToRelationComment(edge, nodes);
  if (!comment) return sqlText;
  const src = nodes.find(n => n.id === edge.source);
  const tgt = nodes.find(n => n.id === edge.target);
  if (!src || !tgt) return sqlText;
  const s  = src.data.tableName || src.data.label.toLowerCase();
  const t  = tgt.data.tableName || tgt.data.label.toLowerCase();
  const re = new RegExp(`--\\s*@relation:\\s*${s}\\s+(-as|-in|-ag|-co)\\s+${t}`, 'i');
  const lines = sqlText.split('\n');
  const idx   = lines.findIndex(l => re.test(l));
  if (idx !== -1) { lines[idx] = comment; return lines.join('\n'); }
  return sqlText.trimEnd() + '\n\n' + comment;
}

export function removeRelationInSQL(sqlText, edge, nodes) {
  const src = nodes.find(n => n.id === edge.source);
  const tgt = nodes.find(n => n.id === edge.target);
  if (!src || !tgt) return sqlText;
  const s = src.data.tableName || src.data.label.toLowerCase();
  const t = tgt.data.tableName || tgt.data.label.toLowerCase();
  return sqlText.replace(
    new RegExp(`\\n?--\\s*@relation:\\s*${s}\\s+(-as|-in|-ag|-co)\\s+${t}`, 'gi'), ''
  );
}

export function generateSQL(nodes, edges) {
  if (!nodes?.length) return '-- Chưa có class nào';
  const blocks = nodes.map(n => nodeToSQL(n));
  const rels   = (edges || []).map(e => edgeToRelationComment(e, nodes)).filter(Boolean);
  return [
    `-- Generated ${new Date().toISOString().slice(0, 10)}`, '',
    ...blocks,
    ...(rels.length ? ['', '-- Relations', ...rels] : []),
  ].join('\n');
}