import { useState, useEffect } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import { Trash2, WrapText, Wand2, Sparkles, FileText } from 'lucide-react'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

const SAMPLE = '{"name":"John Doe","age":30,"email":"john@example.com","address":{"city":"New York","zip":"10001"},"hobbies":["reading","coding","hiking"]}'

export default function JsonFormatter() {
  const [input, setInput] = usePersistentState('tool-json-formatter-input', SAMPLE)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indent, setIndent] = usePersistentState('json-indent', 2)

  useEffect(() => {
    if (!input.trim()) { setOutput(''); setError(''); return }
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, indent))
      setError('')
    } catch (e) {
      setError((e as Error).message)
    }
  }, [input, indent])

  const handleAutoFix = () => {
    try {
      let s = input;

      // 1. Dọn dẹp cực mạnh: Loại bỏ ký tự điều khiển và chuẩn hóa khoảng trắng
      // \u00A0 là lỗi cực phổ biến khi copy từ web/pdf (Non-breaking space)
      s = s.replace(/\u00A0/g, ' ');

      // Loại bỏ các ký tự điều khiển ASCII 0-31, ngoại trừ tab/xuống dòng (sẽ xử lý sau)
      // kết hợp với việc xóa các ký tự Unicode gây nhiễu
      s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFEFF]/g, '');

      // 2. Chuyển đổi các ký tự xuống dòng thực tế bên trong chuỗi ("...") thành \n
      // JSON.parse sẽ chết nếu gặp mã xuống dòng thực (Enter) nằm giữa hai dấu ngoặc kép
      s = s.replace(/"([^"]*)"/g, (match) => {
        return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
      });

      // 3. Xóa Comments
      s = s.replace(/\/\/.*/g, '');
      s = s.replace(/\/\*[\s\S]*?\*\//g, '');

      // 4. Các ký tự ngoặc kép "thông minh" từ Office/iOS
      s = s.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"');

      const MAX_ATTEMPTS = 100;
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        // --- REGEX FIXES ---
        // Fix single quotes thành double quotes
        s = s.replace(/'((?:\\.|[^'])*)'/g, (_, g1: string) =>
          '"' + g1.replace(/"/g, '\\"').replace(/\\'/g, "'") + '"'
        );

        // Fix unquoted keys (bao gồm cả các ký tự đặc biệt trong key)
        s = s.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');

        // Xóa dấu phẩy thừa
        s = s.replace(/,\s*([}\]])/g, '$1');

        try {
          const parsed = JSON.parse(s);
          const beautified = JSON.stringify(parsed, null, indent);
          setInput(beautified);
          setOutput(beautified);
          setError('✨ Đã dọn dẹp sạch ký tự rác và định dạng lại JSON.');
          return; // Thoát nếu thành công
        } catch (err) {
          const msg = (err as Error).message;

          // Sửa lỗi thiếu ngoặc đóng
          if (msg.includes("Unexpected end") || msg.includes("unterminated")) {
            const openBraces = (s.match(/{/g) || []).length;
            const closeBraces = (s.match(/}/g) || []).length;
            if (openBraces > closeBraces) { s += '}'; continue; }
            const openBrackets = (s.match(/\[/g) || []).length;
            const closeBrackets = (s.match(/\]/g) || []).length;
            if (openBrackets > closeBrackets) { s += ']'; continue; }
          }

          const posMatch = msg.match(/position\s+(\d+)/);
          if (!posMatch) throw err;
          const errorPos = parseInt(posMatch[1], 10);

          // Xử lý các lỗi cụ thể tại vị trí báo lỗi
          if (msg.includes("Expected ','") || msg.includes("Expected '}'")) {
            let i = errorPos;
            while (i > 0 && /\s/.test(s[i - 1])) i--;
            s = s.slice(0, i) + ',' + s.slice(i);
          } else if (msg.includes("Expected ':'")) {
            s = s.slice(0, errorPos) + ':' + s.slice(errorPos);
          } else if (msg.includes("Unexpected token") || msg.includes("Expected property name")) {
            // Xử lý các hằng số None, True, False, undefined
            let start = errorPos;
            while (start > 0 && /[a-zA-Z0-9_$.]/.test(s[start - 1])) start--;
            let end = errorPos;
            while (end < s.length && /[a-zA-Z0-9_$.]/.test(s[end])) end++;

            if (end > start) {
              const word = s.slice(start, end);
              const map: any = { 'None': 'null', 'undefined': 'null', 'True': 'true', 'False': 'false', 'NaN': 'null' };
              s = s.slice(0, start) + (map[word] || `"${word}"`) + s.slice(end);
            } else {
              // Nếu không phải từ ngữ, có thể là ký tự lạ tại đó, xóa nó đi
              s = s.slice(0, errorPos) + s.slice(errorPos + 1);
            }
          } else {
            throw err;
          }
        }
      }
    } catch (e) {
      setError(`Auto-fix bó tay: ${(e as Error).message}`);
    }
  };

  const validate = () => {
    if (!input.trim()) { setError('Input is empty'); return }
    try {
      JSON.parse(input)
      setError('✅ Valid JSON')
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <WrapText size={14} />
          <span>Indent:</span>
          {[2, 4, '\t'].map(v => (
            <button
              key={v}
              onClick={() => setIndent(v as number)}
              className={`px-2 py-0.5 rounded text-xs border transition-colors ${indent === v
                ? 'bg-primary-100 dark:bg-primary-900 border-primary-400 text-primary-700 dark:text-primary-300'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}
            >
              {v === '\t' ? 'Tab' : `${v} spaces`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Input JSON</label>
            <div className="flex items-center gap-1">
              {output && !error && (
                <button onClick={() => setInput(output)} className="btn-ghost flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 font-medium">
                  <Wand2 size={12} /> Format code
                </button>
              )}
              <button onClick={() => setInput(SAMPLE)} className="btn-ghost text-xs gap-1 flex items-center">
                <FileText size={12} /> Load Example
              </button>
              <button onClick={() => { setInput(''); setOutput(''); setError('') }} className="btn-ghost text-xs gap-1 flex items-center">
                <Trash2 size={12} /> Clear
              </button>
            </div>
          </div>
          <FileDropTextarea
            className="h-80"
            placeholder='{"key": "value", "array": [1, 2, 3]}'
            value={input}
            onChange={setInput}
            accept=".json,text/plain,text/*"
          />
        </div>
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Formatted Output</label>
            <CopyButton text={output} toast="JSON copied" />
          </div>
          <textarea
            className="tool-textarea-output h-80"
            readOnly
            value={output}
            placeholder="Formatted JSON will appear here..."
          />
        </div>
      </div>

      {error && (
        <div className={`mt-4 p-3 rounded-lg flex items-center justify-between border ${error.includes('✨') ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400' : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400'}`}>
          <p className="text-sm font-medium">{error}</p>
          {!error.includes('✨') && error !== 'Input is empty' && input.trim() && (
            <button onClick={handleAutoFix} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors">
              <Sparkles size={13} /> Auto Fix
            </button>
          )}
        </div>
      )}
    </div>
  )
}
