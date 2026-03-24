import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import { Upload, Eraser, AlignJustify, Columns2, ArrowLeftRight, ChevronUp, ChevronDown, WrapText, ChevronsUpDown } from 'lucide-react';
import CopyButton from '../components/CopyButton';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';

const LANGUAGES = [
  { label: 'Plain text', id: '' },
  { label: 'JavaScript', id: 'javascript' },
  { label: 'TypeScript', id: 'typescript' },
  { label: 'JSX', id: 'jsx' },
  { label: 'TSX', id: 'tsx' },
  { label: 'HTML', id: 'markup' },
  { label: 'CSS', id: 'css' },
  { label: 'JSON', id: 'json' },
  { label: 'Python', id: 'python' },
  { label: 'SQL', id: 'sql' },
  { label: 'Bash', id: 'bash' },
  { label: 'Go', id: 'go' },
  { label: 'Rust', id: 'rust' },
  { label: 'Java', id: 'java' },
  { label: 'C#', id: 'csharp' },
];

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightLine(line: string, langId: string): string {
  if (!langId) return escapeHtml(line);
  const grammar = Prism.languages[langId];
  if (!grammar) return escapeHtml(line);
  return Prism.highlight(line, grammar, langId);
}

// ─── Line-level Diff Engine ──────────────────────────────────────────────────

type DiffOp = { type: 'equal' | 'insert' | 'delete'; value: string };

function lcsLineDiff(oldLines: string[], newLines: string[]): DiffOp[] {
  const m = oldLines.length;
  const n = newLines.length;

  const dp: Uint32Array[] = Array.from({ length: m + 1 }, () => new Uint32Array(n + 1));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i]![j] =
        oldLines[i - 1] === newLines[j - 1]
          ? dp[i - 1]![j - 1]! + 1
          : Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
    }
  }

  const ops: DiffOp[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      ops.unshift({ type: 'equal', value: oldLines[i - 1]! }); i--; j--;
    } else if (j > 0 && (i === 0 || dp[i]![j - 1]! >= dp[i - 1]![j]!)) {
      ops.unshift({ type: 'insert', value: newLines[j - 1]! }); j--;
    } else {
      ops.unshift({ type: 'delete', value: oldLines[i - 1]! }); i--;
    }
  }
  return ops;
}

function normalise(line: string, ignoreWs: boolean, ignoreCase: boolean): string {
  let s = line;
  if (ignoreWs) s = s.replace(/\s+/g, ' ').trim();
  if (ignoreCase) s = s.toLowerCase();
  return s;
}

// ─── Inline (hybrid word→char) Diff Engine ──────────────────────────────────

type InlineOp = { type: 'equal' | 'del' | 'ins'; text: string };

function tokenize(s: string): string[] {
  return s.match(/\w+|\s+|[^\w\s]/g) ?? (s.length ? [s] : []);
}

function lcsStringDiff(a: string[], b: string[]): { type: 'equal' | 'delete' | 'insert'; tok: string }[] {
  const m = a.length, n = b.length;
  if (m * n > 40_000) {
    return [...a.map(t => ({ type: 'delete' as const, tok: t })),
            ...b.map(t => ({ type: 'insert' as const, tok: t }))];
  }
  const dp: Uint16Array[] = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i]![j] = a[i - 1] === b[j - 1]
        ? dp[i - 1]![j - 1]! + 1
        : Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
    }
  }
  const ops: { type: 'equal' | 'delete' | 'insert'; tok: string }[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.unshift({ type: 'equal', tok: a[i - 1]! }); i--; j--;
    } else if (j > 0 && (i === 0 || dp[i]![j - 1]! >= dp[i - 1]![j]!)) {
      ops.unshift({ type: 'insert', tok: b[j - 1]! }); j--;
    } else {
      ops.unshift({ type: 'delete', tok: a[i - 1]! }); i--;
    }
  }
  return ops;
}

function charLevelDiff(a: string, b: string): { left: InlineOp[]; right: InlineOp[] } {
  const ops = lcsStringDiff(a.split(''), b.split(''));
  const left: InlineOp[] = [], right: InlineOp[] = [];
  for (const op of ops) {
    if (op.type === 'equal') { left.push({ type: 'equal', text: op.tok }); right.push({ type: 'equal', text: op.tok }); }
    else if (op.type === 'delete') left.push({ type: 'del', text: op.tok });
    else right.push({ type: 'ins', text: op.tok });
  }
  return { left, right };
}

function inlineDiff(a: string, b: string): { left: InlineOp[]; right: InlineOp[] } {
  const wordOps = lcsStringDiff(tokenize(a), tokenize(b));
  const left: InlineOp[] = [], right: InlineOp[] = [];
  let i = 0;
  while (i < wordOps.length) {
    const op = wordOps[i]!;
    if (op.type === 'equal') {
      left.push({ type: 'equal', text: op.tok });
      right.push({ type: 'equal', text: op.tok });
      i++;
    } else {
      const dels: string[] = [], ins: string[] = [];
      while (i < wordOps.length && (wordOps[i]!.type === 'delete' || wordOps[i]!.type === 'insert')) {
        if (wordOps[i]!.type === 'delete') dels.push(wordOps[i]!.tok);
        else ins.push(wordOps[i]!.tok);
        i++;
      }
      const pairCount = Math.min(dels.length, ins.length);
      for (let k = 0; k < pairCount; k++) {
        const { left: cl, right: cr } = charLevelDiff(dels[k]!, ins[k]!);
        left.push(...cl);
        right.push(...cr);
      }
      for (let k = pairCount; k < dels.length; k++) left.push({ type: 'del', text: dels[k]! });
      for (let k = pairCount; k < ins.length; k++) right.push({ type: 'ins', text: ins[k]! });
    }
  }
  return { left, right };
}

function InlineSpans({ ops }: { ops: InlineOp[] }) {
  return (
    <>
      {ops.map((op, i) => {
        if (op.type === 'equal') return <span key={i}>{op.text}</span>;
        if (op.type === 'del')
          return <mark key={i} className="bg-red-300/70 text-red-950 rounded-sm">{op.text}</mark>;
        return <mark key={i} className="bg-emerald-300/70 text-emerald-950 rounded-sm">{op.text}</mark>;
      })}
    </>
  );
}

// ─── Side-by-side row types ──────────────────────────────────────────────────

interface SideBySideRow {
  type: 'equal' | 'change' | 'insert' | 'delete';
  left: string | null;
  right: string | null;
  leftNo: number | null;
  rightNo: number | null;
}

function buildSideBySide(ops: DiffOp[]): SideBySideRow[] {
  const rows: SideBySideRow[] = [];
  let l = 1, r = 1;
  let i = 0;

  while (i < ops.length) {
    const op = ops[i]!;
    if (op.type === 'equal') {
      rows.push({ type: 'equal', left: op.value, right: op.value, leftNo: l++, rightNo: r++ });
      i++;
    } else {
      const deletes: string[] = [];
      const inserts: string[] = [];
      while (i < ops.length && (ops[i]!.type === 'delete' || ops[i]!.type === 'insert')) {
        if (ops[i]!.type === 'delete') deletes.push(ops[i]!.value);
        else inserts.push(ops[i]!.value);
        i++;
      }
      const maxLen = Math.max(deletes.length, inserts.length);
      for (let k = 0; k < maxLen; k++) {
        const hasBoth = k < deletes.length && k < inserts.length;
        rows.push({
          type: hasBoth ? 'change' : k < deletes.length ? 'delete' : 'insert',
          left: k < deletes.length ? deletes[k]! : null,
          right: k < inserts.length ? inserts[k]! : null,
          leftNo: k < deletes.length ? l++ : null,
          rightNo: k < inserts.length ? r++ : null,
        });
      }
    }
  }
  return rows;
}

// ─── Unified display rows ────────────────────────────────────────────────────

interface UnifiedDisplayRow {
  type: 'hunk' | 'context' | 'delete' | 'insert';
  text: string;
  pairText?: string;
  hunkHeader?: string;
  hunkIndex?: number;
  canExpand?: boolean;
}

function buildUnifiedDisplayRows(ops: DiffOp[], context = 3, expandedHunks = new Set<number>()): UnifiedDisplayRow[] {
  const rows: UnifiedDisplayRow[] = [];

  const lineNums: { a: number; b: number }[] = [];
  let la = 1, lb = 1;
  for (const op of ops) {
    lineNums.push({ a: la, b: lb });
    if (op.type === 'equal' || op.type === 'delete') la++;
    if (op.type === 'equal' || op.type === 'insert') lb++;
  }

  let pos = 0;
  let hunkIndex = 0;

  while (pos < ops.length) {
    let s = pos;
    while (s < ops.length && ops[s]!.type === 'equal') s++;
    if (s === ops.length) break;

    const availableBefore = s - pos;

    let end = s;
    let gap = 0;
    for (let k = s; k < ops.length; k++) {
      if (ops[k]!.type !== 'equal') { end = k; gap = 0; }
      else { gap++; if (gap > context) break; }
    }

    let trueTrailing = 0;
    for (let k = end + 1; k < ops.length && ops[k]!.type === 'equal'; k++) trueTrailing++;

    const isExpanded = expandedHunks.has(hunkIndex);
    const ctxBefore = isExpanded ? availableBefore : Math.min(context, availableBefore);
    const ctxAfter  = isExpanded ? trueTrailing    : Math.min(context, trueTrailing);

    const sliceStart = s - ctxBefore;
    const sliceEnd   = end + ctxAfter + 1;
    const hunk = ops.slice(sliceStart, sliceEnd);

    const canExpand = !isExpanded && (availableBefore > context || trueTrailing > context);

    const startA = lineNums[sliceStart]!.a;
    const startB = lineNums[sliceStart]!.b;
    const countA = hunk.filter(o => o.type !== 'insert').length;
    const countB = hunk.filter(o => o.type !== 'delete').length;
    const hunkHeader = `@@ -${startA},${countA} +${startB},${countB} @@`;

    rows.push({ type: 'hunk', text: '', hunkHeader, hunkIndex, canExpand });
    for (const op of hunk) {
      if (op.type === 'equal') rows.push({ type: 'context', text: op.value });
      else if (op.type === 'delete') rows.push({ type: 'delete', text: op.value });
      else rows.push({ type: 'insert', text: op.value });
    }

    pos = end + Math.min(context, trueTrailing) + 1;
    hunkIndex++;
  }

  for (let i = 0; i < rows.length; i++) {
    if (rows[i]!.type !== 'delete') continue;
    let di = i;
    while (di < rows.length && rows[di]!.type === 'delete') di++;
    let ii2 = di;
    while (ii2 < rows.length && rows[ii2]!.type === 'insert') ii2++;
    const pairCount = Math.min(di - i, ii2 - di);
    for (let k = 0; k < pairCount; k++) {
      rows[i + k]!.pairText = rows[di + k]!.text;
      rows[di + k]!.pairText = rows[i + k]!.text;
    }
    i = ii2 - 1;
  }

  return rows;
}

function buildUnifiedPatch(ops: DiffOp[], context = 3): string {
  const lines: string[] = [];

  const lineNums: { a: number; b: number }[] = [];
  let la = 1, lb = 1;
  for (const op of ops) {
    lineNums.push({ a: la, b: lb });
    if (op.type === 'equal' || op.type === 'delete') la++;
    if (op.type === 'equal' || op.type === 'insert') lb++;
  }

  let hunkStart = 0;
  while (hunkStart < ops.length) {
    let s = hunkStart;
    while (s < ops.length && ops[s]!.type === 'equal') s++;
    if (s === ops.length) break;

    const ctxBefore = Math.min(context, s - hunkStart);
    let end = s;
    let trailing = 0;
    for (let k = s; k < ops.length; k++) {
      if (ops[k]!.type !== 'equal') { end = k; trailing = 0; }
      else { trailing++; if (trailing > context) break; }
    }
    const sliceStart = s - ctxBefore;
    const sliceEnd = end + Math.min(context, trailing) + 1;
    const hunk = ops.slice(sliceStart, sliceEnd);

    const startA = lineNums[sliceStart]!.a;
    const startB = lineNums[sliceStart]!.b;
    const countA = hunk.filter(op => op.type !== 'insert').length;
    const countB = hunk.filter(op => op.type !== 'delete').length;
    lines.push(`@@ -${startA},${countA} +${startB},${countB} @@`);

    for (const op of hunk) {
      if (op.type === 'equal') lines.push(' ' + op.value);
      else if (op.type === 'delete') lines.push('-' + op.value);
      else lines.push('+' + op.value);
    }
    hunkStart = sliceEnd;
  }
  return lines.join('\n');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MAX_LINES = 5_000;

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Component ───────────────────────────────────────────────────────────────

type ViewMode = 'sidebyside' | 'unified';

export default function TextDiff({ initialData }: { initialData?: string | null }) {
  const [left, setLeft] = usePersistentState('tool-textdiff-left', initialData ?? 'The quick brown fox jumps over the lazy dog');
  const [right, setRight] = usePersistentState('tool-textdiff-right', 'The quick brown cat jumps over the lazy cat');
  const [ignoreWs, setIgnoreWs] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [hideEqual, setHideEqual] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('sidebyside');
  const [activeHunk, setActiveHunk] = useState(0);
  const [expandedHunks, setExpandedHunks] = useState<Set<number>>(new Set());
  const [wordWrap, setWordWrap] = useState(true);
  const [lang, setLang] = useState('');
  const [leftDragOver, setLeftDragOver] = useState(false);
  const [rightDragOver, setRightDragOver] = useState(false);

  const leftFileRef = useRef<HTMLInputElement>(null);
  const rightFileRef = useRef<HTMLInputElement>(null);

  const dLeft = useDebounced(left, 400);
  const dRight = useDebounced(right, 400);

  const readFile = useCallback((file: File, setter: (v: string) => void) => {
    const reader = new FileReader();
    reader.onload = e => setter((e.target?.result as string) ?? '');
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, setter: (v: string) => void, setDrag: (v: boolean) => void) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file, setter);
  }, [readFile]);

  const { ops, stats, tooLarge } = useMemo(() => {
    const leftLines = dLeft.split(/\r?\n/);
    const rightLines = dRight.split(/\r?\n/);

    if (leftLines.length > MAX_LINES || rightLines.length > MAX_LINES) {
      return { ops: [] as DiffOp[], stats: { added: 0, removed: 0, equal: 0 }, tooLarge: { left: leftLines.length, right: rightLines.length } };
    }

    const normLeft = leftLines.map(line => normalise(line, ignoreWs, ignoreCase));
    const normRight = rightLines.map(line => normalise(line, ignoreWs, ignoreCase));
    const normOps = lcsLineDiff(normLeft, normRight);

    const remapped: DiffOp[] = [];
    let ll = 0, rr = 0;
    for (const op of normOps) {
      if (op.type === 'equal') { remapped.push({ type: 'equal', value: leftLines[ll] ?? '' }); ll++; rr++; }
      else if (op.type === 'delete') { remapped.push({ type: 'delete', value: leftLines[ll] ?? '' }); ll++; }
      else { remapped.push({ type: 'insert', value: rightLines[rr] ?? '' }); rr++; }
    }

    const added = remapped.filter(o => o.type === 'insert').length;
    const removed = remapped.filter(o => o.type === 'delete').length;
    const equal = remapped.filter(o => o.type === 'equal').length;
    return { ops: remapped, stats: { added, removed, equal }, tooLarge: null };
  }, [dLeft, dRight, ignoreWs, ignoreCase]);

  const rows = useMemo(() => {
    const all = buildSideBySide(ops);
    return hideEqual ? all.filter(r => r.type !== 'equal') : all;
  }, [ops, hideEqual]);

  const unifiedRows = useMemo(() => buildUnifiedDisplayRows(ops, 3, expandedHunks), [ops, expandedHunks]);
  const unifiedPatch = useMemo(() => buildUnifiedPatch(ops), [ops]);

  const hunkCount = useMemo(() => {
    if (viewMode === 'sidebyside') {
      let count = 0;
      for (let i = 0; i < rows.length; i++) {
        if (rows[i]!.type !== 'equal' && (i === 0 || rows[i - 1]!.type === 'equal')) count++;
      }
      return count;
    }
    return unifiedRows.filter(r => r.type === 'hunk').length;
  }, [rows, unifiedRows, viewMode]);

  useEffect(() => { setActiveHunk(0); setExpandedHunks(new Set()); }, [ops, viewMode]);

  const onExpandHunk = useCallback((idx: number) => {
    setExpandedHunks(prev => { const next = new Set(prev); next.add(idx); return next; });
  }, []);

  const hasDiff = stats.added > 0 || stats.removed > 0;

  return (
    <div className="space-y-4">
      {/* Options bar */}
      <div className="flex flex-wrap items-center gap-3">
        {[
          { label: 'Ignore whitespace', value: ignoreWs, set: setIgnoreWs },
          { label: 'Ignore case', value: ignoreCase, set: setIgnoreCase },
          { label: 'Hide unchanged', value: hideEqual, set: setHideEqual },
        ].map(({ label, value, set }) => (
          <label key={label} className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              checked={value} onChange={e => set(e.target.checked)} />
            <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
          </label>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <select
            value={lang}
            onChange={e => setLang(e.target.value)}
            className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-400"
            title="Syntax highlighting language"
          >
            {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
          <button type="button" onClick={() => setWordWrap(w => !w)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
              wordWrap
                ? 'bg-primary-50 dark:bg-primary-900/40 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-400'
            }`}>
            <WrapText size={13} /> Wrap
          </button>
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
            <button type="button" onClick={() => setViewMode('sidebyside')}
              className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                viewMode === 'sidebyside' ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
              <Columns2 size={13} /> Side by side
            </button>
            <button type="button" onClick={() => setViewMode('unified')}
              className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                viewMode === 'unified' ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
              <AlignJustify size={13} /> Unified
            </button>
          </div>
        </div>
      </div>

      {/* Input panels */}
      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4">
        {([
          { label: 'Original (A)', value: left, setter: setLeft, fileRef: leftFileRef, dragOver: leftDragOver, setDragOver: setLeftDragOver },
          { label: 'Modified (B)', value: right, setter: setRight, fileRef: rightFileRef, dragOver: rightDragOver, setDragOver: setRightDragOver },
        ] as const).map(({ label, value, setter, fileRef, dragOver, setDragOver }) => (
          <div key={label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="btn-ghost text-xs flex items-center gap-1">
                  <Upload size={11} /> Import
                </button>
                <button type="button" onClick={() => setter('')}
                  className="btn-ghost text-xs flex items-center gap-1">
                  <Eraser size={11} /> Clear
                </button>
              </div>
            </div>
            <textarea
              value={value}
              onChange={e => setter(e.target.value)}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => handleDrop(e, setter, setDragOver)}
              placeholder={dragOver ? 'Drop file here…' : `Paste ${label.toLowerCase()} or drop a file…`}
              className={`tool-textarea h-52 resize-none font-mono text-xs transition-colors ${
                dragOver ? '!border-primary-400 !ring-primary-400 bg-primary-50 dark:bg-primary-950/20' : ''
              }`}
              spellCheck={false}
            />
            <input ref={fileRef} type="file" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f, setter); e.target.value = ''; }} />
          </div>
        ))}

        {/* Swap button */}
        <button type="button" onClick={() => { setLeft(right); setRight(left); }} title="Swap A ↔ B"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:flex w-8 h-8 items-center justify-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm text-gray-400 hover:text-primary-600 hover:border-primary-400 transition-all">
          <ArrowLeftRight size={14} />
        </button>
      </div>

      {/* Too large warning */}
      {tooLarge && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-sm">
          <span className="text-amber-600 dark:text-amber-400 font-medium">
            ⚠️ File quá lớn — A: {tooLarge.left.toLocaleString()} dòng, B: {tooLarge.right.toLocaleString()} dòng (giới hạn {MAX_LINES.toLocaleString()} dòng/file)
          </span>
          <button
            type="button"
            onClick={() => {
              setLeft(left.split(/\r?\n/).slice(0, MAX_LINES).join('\n'));
              setRight(right.split(/\r?\n/).slice(0, MAX_LINES).join('\n'));
            }}
            className="ml-auto px-3 py-1.5 text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
          >
            Cắt {MAX_LINES.toLocaleString()} dòng đầu và diff
          </button>
        </div>
      )}

      {/* Stats bar */}
      {!tooLarge && (left || right) && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs">
          <span className="text-green-600 dark:text-green-400 font-medium">+{stats.added} added</span>
          <span className="text-red-500 dark:text-red-400 font-medium">-{stats.removed} removed</span>
          <span className="text-gray-400">{stats.equal} unchanged</span>
          {!hasDiff && left && right && (
            <span className="text-primary-600 dark:text-primary-400 font-medium">✓ Identical</span>
          )}

          <div className="ml-auto flex items-center gap-2">
            {hasDiff && hunkCount > 0 && (
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setActiveHunk(h => Math.max(0, h - 1))}
                  disabled={activeHunk === 0}
                  className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <ChevronUp size={14} />
                </button>
                <span className="text-gray-500 tabular-nums min-w-[2.5rem] text-center">
                  {activeHunk + 1}/{hunkCount}
                </span>
                <button type="button" onClick={() => setActiveHunk(h => Math.min(hunkCount - 1, h + 1))}
                  disabled={activeHunk === hunkCount - 1}
                  className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <ChevronDown size={14} />
                </button>
              </div>
            )}
            <CopyButton text={unifiedPatch} label="Copy patch" toast="Patch copied" />
          </div>
        </div>
      )}

      {/* Diff output */}
      {!tooLarge && (left || right) && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          {viewMode === 'sidebyside' ? (
            <SideBySideView rows={rows} activeHunk={activeHunk} wordWrap={wordWrap} lang={lang} />
          ) : (
            <UnifiedView rows={unifiedRows} activeHunk={activeHunk} wordWrap={wordWrap} onExpandHunk={onExpandHunk} lang={lang} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Side-by-side view ───────────────────────────────────────────────────────

function SideBySideView({ rows, activeHunk, wordWrap, lang }: { rows: SideBySideRow[]; activeHunk: number; wordWrap: boolean; lang: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hunkRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  const rowToHunkId = useMemo(() => {
    const map = new Map<number, number>();
    let hunkId = 0;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i]!.type !== 'equal' && (i === 0 || rows[i - 1]!.type === 'equal')) {
        map.set(i, hunkId++);
      }
    }
    return map;
  }, [rows]);

  useEffect(() => {
    const el = hunkRefs.current[activeHunk];
    const container = scrollRef.current;
    if (!el || !container) return;
    container.scrollTo({ top: Math.max(0, el.offsetTop - 48), behavior: 'smooth' });
  }, [activeHunk]);

  if (rows.length === 0) {
    return <div className="py-12 text-center text-gray-400 text-sm">No differences to show</div>;
  }

  return (
    <div ref={scrollRef} className="overflow-auto max-h-[600px]">
      <table className={`w-full border-collapse font-mono text-xs ${wordWrap ? 'table-fixed' : ''}`}>
        <colgroup>
          <col className="w-10" />
          <col className="w-1/2" />
          <col className="w-10" />
          <col className="w-1/2" />
        </colgroup>
        <thead className="sticky top-0 z-10">
          <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <th className="px-2 py-2 text-[10px] font-medium text-gray-400 text-right">#</th>
            <th className="px-3 py-2 text-[10px] font-medium text-gray-500 dark:text-gray-400 text-left">Original (A)</th>
            <th className="px-2 py-2 text-[10px] font-medium text-gray-400 text-right">#</th>
            <th className="px-3 py-2 text-[10px] font-medium text-gray-500 dark:text-gray-400 text-left">Modified (B)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const hunkId = rowToHunkId.get(idx);
            const isActive = hunkId === activeHunk && row.type !== 'equal';
            const inline = row.type === 'change' && row.left !== null && row.right !== null
              ? inlineDiff(row.left, row.right) : null;

            return (
              <tr
                key={idx}
                ref={hunkId !== undefined ? (el => { hunkRefs.current[hunkId] = el; }) : undefined}
                className={`border-b border-gray-100 dark:border-gray-800 ${
                  isActive ? 'ring-2 ring-inset ring-blue-400 dark:ring-blue-500' : ''
                } ${row.type === 'equal' ? 'bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900' : ''}`}
              >
                {/* Left line no */}
                <td className={`px-2 py-0.5 text-right select-none border-r text-[10px] ${
                  row.type === 'delete' || row.type === 'change'
                    ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-400'
                    : row.left === null ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-300' : 'border-gray-100 dark:border-gray-800 text-gray-400'
                }`}>
                  {row.leftNo}
                </td>
                {/* Left content */}
                <td className={`px-3 py-0.5 align-top ${wordWrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'} ${
                  row.type === 'delete' || row.type === 'change' ? 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200' :
                  row.left === null ? 'bg-gray-50 dark:bg-gray-900' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {(row.type === 'delete' || row.type === 'change') && row.left !== null ? (
                    <span><span className="text-red-400 select-none mr-1">-</span>{lang ? <span dangerouslySetInnerHTML={{ __html: highlightLine(row.left, lang) }} /> : inline ? <InlineSpans ops={inline.left} /> : row.left}</span>
                  ) : row.left !== null ? <span>{lang ? <span dangerouslySetInnerHTML={{ __html: highlightLine(row.left, lang) }} /> : row.left}</span> : null}
                </td>
                {/* Right line no */}
                <td className={`px-2 py-0.5 text-right select-none border-r border-l text-[10px] ${
                  row.type === 'insert' || row.type === 'change'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-400'
                    : row.right === null ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-300' : 'border-gray-100 dark:border-gray-800 text-gray-400'
                }`}>
                  {row.rightNo}
                </td>
                {/* Right content */}
                <td className={`px-3 py-0.5 align-top ${wordWrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'} ${
                  row.type === 'insert' || row.type === 'change' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200' :
                  row.right === null ? 'bg-gray-50 dark:bg-gray-900' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {(row.type === 'insert' || row.type === 'change') && row.right !== null ? (
                    <span><span className="text-emerald-500 select-none mr-1">+</span>{lang ? <span dangerouslySetInnerHTML={{ __html: highlightLine(row.right, lang) }} /> : inline ? <InlineSpans ops={inline.right} /> : row.right}</span>
                  ) : row.right !== null ? <span>{lang ? <span dangerouslySetInnerHTML={{ __html: highlightLine(row.right, lang) }} /> : row.right}</span> : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Unified view ────────────────────────────────────────────────────────────

function UnifiedView({ rows, activeHunk, wordWrap, onExpandHunk, lang }: {
  rows: UnifiedDisplayRow[];
  activeHunk: number;
  wordWrap: boolean;
  onExpandHunk: (idx: number) => void;
  lang: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hunkRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  useEffect(() => {
    const el = hunkRefs.current[activeHunk];
    const container = scrollRef.current;
    if (!el || !container) return;
    container.scrollTo({ top: Math.max(0, el.offsetTop - 48), behavior: 'smooth' });
  }, [activeHunk]);

  if (rows.length === 0) {
    return <div className="py-12 text-center text-gray-400 text-sm">No differences to show</div>;
  }

  let hunkCounter = -1;

  return (
    <div ref={scrollRef} className="overflow-auto max-h-[600px]">
      <table className={`w-full border-collapse font-mono text-xs ${wordWrap ? 'table-fixed' : ''}`}>
        <colgroup>
          <col className="w-8" />
          <col className="w-full" />
        </colgroup>
        <tbody>
          {rows.map((row, i) => {
            if (row.type === 'hunk') {
              hunkCounter++;
              const currentHunk = hunkCounter;
              const isActive = currentHunk === activeHunk;
              return (
                <tr key={i} ref={el => { hunkRefs.current[currentHunk] = el; }}
                  className={`border-b border-gray-700 ${isActive ? 'bg-blue-900/80' : 'bg-gray-800'}`}>
                  <td className="px-2 py-1 text-gray-500 select-none text-center text-[10px]">⋯</td>
                  <td className="px-3 py-1 text-gray-300 font-mono text-[11px]">
                    <span className="mr-3">{row.hunkHeader}</span>
                    {row.canExpand && (
                      <button type="button" onClick={() => onExpandHunk(row.hunkIndex!)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-gray-400 hover:text-white hover:bg-gray-600 transition-all">
                        <ChevronsUpDown size={11} /> more context
                      </button>
                    )}
                  </td>
                </tr>
              );
            }

            if (row.type === 'context') {
              return (
                <tr key={i} className="bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                  <td className="px-2 py-0.5 text-gray-300 select-none text-center border-r border-gray-100 dark:border-gray-800" />
                  <td className={`px-3 py-0.5 text-gray-600 dark:text-gray-400 ${wordWrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'}`}>{lang ? <span dangerouslySetInnerHTML={{ __html: highlightLine(row.text, lang) }} /> : row.text}</td>
                </tr>
              );
            }

            if (row.type === 'delete') {
              const ops = row.pairText !== undefined ? inlineDiff(row.text, row.pairText).left : null;
              return (
                <tr key={i} className="bg-red-50 dark:bg-red-950/30 border-b border-red-100 dark:border-red-900">
                  <td className="px-2 py-0.5 text-red-400 select-none text-center border-r border-red-100 dark:border-red-900">-</td>
                  <td className={`px-3 py-0.5 text-red-800 dark:text-red-200 ${wordWrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'}`}>
                    {lang ? <span dangerouslySetInnerHTML={{ __html: highlightLine(row.text, lang) }} /> : ops ? <InlineSpans ops={ops} /> : row.text}
                  </td>
                </tr>
              );
            }

            // insert
            const ops = row.pairText !== undefined ? inlineDiff(row.pairText, row.text).right : null;
            return (
              <tr key={i} className="bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900">
                <td className="px-2 py-0.5 text-emerald-500 select-none text-center border-r border-emerald-100 dark:border-emerald-900">+</td>
                <td className={`px-3 py-0.5 text-emerald-800 dark:text-emerald-200 ${wordWrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'}`}>
                  {lang ? <span dangerouslySetInnerHTML={{ __html: highlightLine(row.text, lang) }} /> : ops ? <InlineSpans ops={ops} /> : row.text}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
