/**
 * SQL Parser - Stable ID + @relation
 *
 * Flow đúng:
 *   1. preInjectAllIds(sqlText)  → inject @id vào tất cả bảng chưa có
 *   2. parseSQLToNodes(text đã có @id) → parse bình thường, id luôn stable
 *
 * @relation syntax:
 *   -- @relation: src -as|-in|-ag|-co tgt
 */

export function genTableId() {
  return 'tbl_' + Math.random().toString(36).slice(2, 9);
}

function genEdgeId() {
  return 'edge_' + Math.random().toString(36).slice(2, 9);
}

export const RELATION_MAP = {
  '-as': 'association',
  '-in': 'inheritance',
  '-ag': 'aggregation',
  '-co': 'composition',
};

export const RELATION_CODE = {
  association: '-as',
  inheritance: '-in',
  aggregation: '-ag',
  composition: '-co',
};

const UML_TO_SQL = {
  int: 'INT', integer: 'INT', long: 'BIGINT',
  string: 'VARCHAR(255)', str: 'VARCHAR(255)', text: 'TEXT',
  boolean: 'BOOLEAN', bool: 'BOOLEAN',
  float: 'FLOAT', double: 'DOUBLE',
  date: 'DATE', datetime: 'DATETIME', timestamp: 'TIMESTAMP',
  uuid: 'VARCHAR(36)', decimal: 'DECIMAL(10,2)',
  number: 'INT', varchar: 'VARCHAR(255)',
};

const SQL_TO_UML = {
  'INT': 'int', 'INTEGER': 'int', 'BIGINT': 'long', 'SMALLINT': 'int',
  'VARCHAR': 'string', 'CHAR': 'string', 'TEXT': 'text', 'LONGTEXT': 'text',
  'BOOLEAN': 'boolean', 'BOOL': 'boolean', 'TINYINT': 'boolean',
  'FLOAT': 'float', 'DOUBLE': 'double', 'DECIMAL': 'decimal', 'NUMERIC': 'decimal',
  'DATE': 'date', 'DATETIME': 'datetime', 'TIMESTAMP': 'timestamp',
};

function sqlTypeToUml(sqlType) {
  const upper = sqlType.toUpperCase().trim();
  if (SQL_TO_UML[upper]) return SQL_TO_UML[upper];
  const base = upper.replace(/\(.*\)/, '').trim();
  return SQL_TO_UML[base] || sqlType.toLowerCase();
}

function normalizeSQL(sql) {
  return sql
    .replace(/\)\s*\n(\s*CREATE\s+TABLE)/gi, ');\n$1')
    .replace(/\)\s*\n(\s*ALTER\s+TABLE)/gi,  ');\n$1')
    .replace(/\)\s*$/s, ');')
    .replace(/;;+/g, ';');
}

function splitColumns(body) {
  const cols = [];
  let depth = 0, current = '';
  for (const ch of body) {
    if      (ch === '(')                { depth++; current += ch; }
    else if (ch === ')')                { depth--; current += ch; }
    else if (ch === ',' && depth === 0) { cols.push(current.trim()); current = ''; }
    else                                { current += ch; }
  }
  if (current.trim()) cols.push(current.trim());
  return cols;
}

function autoPosition(index) {
  return { x: 80 + (index % 3) * 320, y: 80 + Math.floor(index / 3) * 280 };
}

function parseUmlAttribute(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const withoutMod = trimmed.replace(/^[-+#~]\s*/, '');
  const colonIdx = withoutMod.indexOf(':');
  let name, rawType;
  if (colonIdx !== -1) {
    name    = withoutMod.slice(0, colonIdx).trim();
    rawType = withoutMod.slice(colonIdx + 1).trim().toLowerCase();
  } else {
    name    = withoutMod.trim();
    rawType = 'varchar';
  }
  name = name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
  return { name, sqlType: UML_TO_SQL[rawType] || 'VARCHAR(255)', isPK: name === 'id' };
}

// ─────────────────────────────────────────────────────────────────────
// preInjectAllIds
// Quét toàn bộ SQL text, tìm CREATE TABLE chưa có @id → inject ngay.
// Trả về { text: string (đã inject), injected: [{tableName, tableId}] }
// ─────────────────────────────────────────────────────────────────────
export function preInjectAllIds(sqlText) {
  // Match CREATE TABLE <name> ( không có @id trên cùng dòng
  // Dùng line-by-line để tránh multiline regex edge case
  const lines    = sqlText.split('\n');
  const injected = [];
  const result   = lines.map(line => {
    // Kiểm tra dòng có CREATE TABLE ... ( nhưng KHÔNG có @id
    const createMatch = line.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?(\w+)["`]?\s*\(/i);
    if (!createMatch) return line;
    if (/@id:tbl_/i.test(line)) return line; // đã có @id rồi
    const tableName = createMatch[1];
    const tableId   = genTableId();
    injected.push({ tableName, tableId });
    // Inject vào cuối phần trước dấu ( (thêm comment)
    return line.replace(
      /(\bCREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?\w+["`]?\s*\()/i,
      `$1 -- @id:${tableId}`
    );
  });
  return { text: result.join('\n'), injected };
}

// ─────────────────────────────────────────────────────────────────────
// parseSQLToNodes — parse text ĐÃ có @id
// ─────────────────────────────────────────────────────────────────────
export function parseSQLToNodes(sqlText) {
  const nodes       = [];
  const edges       = [];
  const fkRelations = [];
  const relLines    = [];

  // 1. Quét @relation comments
  const relRegex = /--\s*@relation:\s*(\w+)\s+(-as|-in|-ag|-co)\s+(\w+)/gi;
  let rm;
  while ((rm = relRegex.exec(sqlText)) !== null) {
    relLines.push({ from: rm[1].toLowerCase(), code: rm[2].toLowerCase(), to: rm[3].toLowerCase() });
  }

  // 2. Parse CREATE TABLE
  const normalized = normalizeSQL(sqlText);
  const cleaned    = normalized.replace(/\/\*[\s\S]*?\*\//g, '');
  const statements = cleaned.split(';').map(s => s.trim()).filter(Boolean);

  for (const stmt of statements) {
    if (!/CREATE\s+TABLE/i.test(stmt)) continue;

    // Đọc @id (luôn có sau khi preInject)
    const idMatch = stmt.match(/@id:(tbl_[a-z0-9]+)/i);
    if (!idMatch) continue; // bỏ qua nếu vẫn chưa có (không nên xảy ra)
    const tableId = idMatch[1];

    const stmtClean  = stmt.replace(/--[^\n]*/g, '');
    const tableMatch = stmtClean.match(
      /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"]?(\w+)[`"]?\s*\((.+)\)/is
    );
    if (!tableMatch) continue;

    const tableName  = tableMatch[1];
    const body       = tableMatch[2];
    const columnDefs = splitColumns(body);
    const attributes = [];

    for (const col of columnDefs) {
      const colTrim = col.trim();
      if (!colTrim) continue;
      if (/^(PRIMARY KEY|UNIQUE KEY|INDEX|KEY\s)/i.test(colTrim)) continue;

      if (/^(FOREIGN KEY|CONSTRAINT)/i.test(colTrim)) {
        const fkM = colTrim.match(/FOREIGN\s+KEY\s*\(\s*(\w+)\s*\)\s+REFERENCES\s+[`"]?(\w+)[`"]?/i);
        if (fkM) fkRelations.push({ from: tableName.toLowerCase(), to: fkM[2].toLowerCase(), type: 'association' });
        continue;
      }

      const parts = colTrim.match(/^[`"]?(\w+)[`"]?\s+([A-Za-z]+(?:\(\d+(?:,\d+)?\))?)(.*)?$/);
      if (!parts) continue;

      const colName   = parts[1];
      const colType   = parts[2];
      const rest      = (parts[3] || '');
      const restUpper = rest.toUpperCase();
      const isPK      = restUpper.includes('PRIMARY KEY') || colName.toLowerCase() === 'id';
      const isNotNull = restUpper.includes('NOT NULL');
      const umlType   = sqlTypeToUml(colType);

      const refM = rest.match(/REFERENCES\s+[`"]?(\w+)[`"]?/i);
      if (refM) fkRelations.push({ from: tableName.toLowerCase(), to: refM[1].toLowerCase(), type: 'association' });

      attributes.push(`${isPK ? '+' : '-'} ${colName}${isNotNull || isPK ? '' : '?'}: ${umlType}`);
    }

    nodes.push({
      id:   tableId,
      type: 'umlClass',
      position: autoPosition(nodes.length),
      data: {
        label: tableName.toUpperCase(),
        tableName: tableName.toLowerCase(),
        tableId,
        attributes,
        methods: [],
      },
    });
  }

  // ALTER TABLE
  for (const stmt of statements) {
    if (!/ALTER\s+TABLE/i.test(stmt) || !/REFERENCES/i.test(stmt)) continue;
    const altM = stmt.match(/ALTER\s+TABLE\s+[`"]?(\w+)[`"]?/i);
    const refM = stmt.match(/REFERENCES\s+[`"]?(\w+)[`"]?/i);
    if (altM && refM) fkRelations.push({ from: altM[1].toLowerCase(), to: refM[1].toLowerCase(), type: 'association' });
  }

  // 3. Build edges
  const seenEdges = new Set();
  const addEdge = (from, to, type) => {
    const src = nodes.find(n => n.data.tableName === from || n.data.label === from.toUpperCase());
    const tgt = nodes.find(n => n.data.tableName === to   || n.data.label === to.toUpperCase());
    if (!src || !tgt) return;
    const key = `${src.id}-${tgt.id}-${type}`;
    if (seenEdges.has(key)) return;
    seenEdges.add(key);
    edges.push({ id: genEdgeId(), source: src.id, target: tgt.id, type });
  };

  for (const fk  of fkRelations) addEdge(fk.from, fk.to, fk.type || 'association');
  for (const rel of relLines)     addEdge(rel.from, rel.to, RELATION_MAP[rel.code] || 'association');

  return { nodes, edges };
}

// ─────────────────────────────────────────────────────────────────────
// nodeToSQL
// ─────────────────────────────────────────────────────────────────────
export function nodeToSQL(node) {
  const tableName = node.data.tableName || node.data.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const tableId   = node.data.tableId || node.id;
  const attrs     = (node.data.attributes || []).filter(a => a.trim());
  const cols      = [];

  const hasId = attrs.some(a =>
    a.replace(/^[-+#~]\s*/, '').split(':')[0].trim().toLowerCase() === 'id'
  );
  if (!hasId) cols.push(`  id VARCHAR(36) PRIMARY KEY`);

  for (const attr of attrs) {
    const p = parseUmlAttribute(attr);
    if (!p) continue;
    cols.push(p.isPK
      ? `  ${p.name} ${p.sqlType} PRIMARY KEY`
      : `  ${p.name} ${p.sqlType}`
    );
  }
  if (cols.length === 0) cols.push(`  id VARCHAR(36) PRIMARY KEY`);

  return `CREATE TABLE ${tableName} ( -- @id:${tableId}\n${cols.join(',\n')}\n)`;
}

// ─────────────────────────────────────────────────────────────────────
// updateTableInSQL
// ─────────────────────────────────────────────────────────────────────
export function updateTableInSQL(sqlText, tableId, node) {
  const newBlock = nodeToSQL(node);
  const lines    = sqlText.split('\n');

  let idLineIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`@id:${tableId}`)) { idLineIdx = i; break; }
  }

  if (idLineIdx === -1) {
    const sep = sqlText.trimEnd() ? '\n\n' : '';
    return sqlText.trimEnd() + sep + newBlock;
  }

  let startLine = idLineIdx;
  for (let j = idLineIdx; j >= 0; j--) {
    if (/CREATE\s+TABLE/i.test(lines[j])) { startLine = j; break; }
  }

  let endLine = startLine, depth = 0, started = false;
  for (let i = startLine; i < lines.length; i++) {
    const codePart = lines[i].replace(/--[^\n]*/g, '');
    for (const ch of codePart) {
      if      (ch === '(') { depth++; started = true; }
      else if (ch === ')') { depth--; }
    }
    if (started && depth === 0) { endLine = i; break; }
  }

  const before = lines.slice(0, startLine);
  const after  = lines.slice(endLine + 1);
  while (before.length && before[before.length - 1].trim() === '') before.pop();
  while (after.length  && after[0].trim() === '')                   after.shift();

  const parts = [];
  if (before.length) parts.push(before.join('\n'));
  parts.push(newBlock);
  if (after.length)  parts.push(after.join('\n'));
  return parts.join('\n\n');
}

// ─────────────────────────────────────────────────────────────────────
// edgeToRelationComment
// ─────────────────────────────────────────────────────────────────────
export function edgeToRelationComment(edge, nodes) {
  const src = nodes.find(n => n.id === edge.source);
  const tgt = nodes.find(n => n.id === edge.target);
  if (!src || !tgt) return null;
  const srcName = src.data.tableName || src.data.label.toLowerCase();
  const tgtName = tgt.data.tableName || tgt.data.label.toLowerCase();
  const code    = RELATION_CODE[edge.type] || '-as';
  return `-- @relation: ${srcName} ${code} ${tgtName}`;
}

// ─────────────────────────────────────────────────────────────────────
// upsertRelationInSQL
// ─────────────────────────────────────────────────────────────────────
export function upsertRelationInSQL(sqlText, edge, nodes) {
  const comment = edgeToRelationComment(edge, nodes);
  if (!comment) return sqlText;

  const src = nodes.find(n => n.id === edge.source);
  const tgt = nodes.find(n => n.id === edge.target);
  if (!src || !tgt) return sqlText;

  const srcName = src.data.tableName || src.data.label.toLowerCase();
  const tgtName = tgt.data.tableName || tgt.data.label.toLowerCase();

  const existingRe = new RegExp(
    `--\\s*@relation:\\s*${srcName}\\s+(-as|-in|-ag|-co)\\s+${tgtName}`, 'i'
  );
  const lines = sqlText.split('\n');
  const idx   = lines.findIndex(l => existingRe.test(l));
  if (idx !== -1) { lines[idx] = comment; return lines.join('\n'); }

  const sep = sqlText.trimEnd() ? '\n' : '';
  return sqlText.trimEnd() + sep + '\n' + comment;
}

// ─────────────────────────────────────────────────────────────────────
// removeRelationInSQL
// ─────────────────────────────────────────────────────────────────────
export function removeRelationInSQL(sqlText, edge, nodes) {
  const src = nodes.find(n => n.id === edge.source);
  const tgt = nodes.find(n => n.id === edge.target);
  if (!src || !tgt) return sqlText;

  const srcName = src.data.tableName || src.data.label.toLowerCase();
  const tgtName = tgt.data.tableName || tgt.data.label.toLowerCase();

  const re = new RegExp(
    `\\n?--\\s*@relation:\\s*${srcName}\\s+(-as|-in|-ag|-co)\\s+${tgtName}`, 'gi'
  );
  return sqlText.replace(re, '');
}

// ─────────────────────────────────────────────────────────────────────
// generateSQL
// ─────────────────────────────────────────────────────────────────────
export function generateSQL(nodes, edges) {
  if (!nodes?.length) return '-- Chưa có class nào';
  const blocks        = nodes.map(n => nodeToSQL(n));
  const relationLines = (edges || []).map(e => edgeToRelationComment(e, nodes)).filter(Boolean);
  return [
    `-- Generated ${new Date().toISOString().slice(0, 10)}`, '',
    ...blocks,
    ...(relationLines.length ? ['', '-- Relations', ...relationLines] : []),
  ].join('\n');
}