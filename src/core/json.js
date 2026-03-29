// core/json.ts
/**
 * Format string as beautified JSON.
 * @param input The JSON string to format
 * @param indent Number of spaces or '\t'
 */
export const formatJson = (input, indent = 2) => {
    if (!input.trim())
        return { output: '', error: '' };
    try {
        const parsed = JSON.parse(input);
        return {
            output: JSON.stringify(parsed, null, indent),
            error: ''
        };
    }
    catch (e) {
        return {
            output: '',
            error: e.message
        };
    }
};
/**
 * Validate if a string is valid JSON
 */
export const validateJson = (input) => {
    if (!input.trim())
        return 'Input is empty';
    try {
        JSON.parse(input);
        return '✅ Valid JSON';
    }
    catch (e) {
        return e.message;
    }
};
/**
 * High-performance JSON fixer to clean common syntax errors.
 */
export const autoFixJson = (input, indent = 2) => {
    if (!input.trim())
        return { output: '', error: 'Input is empty' };
    try {
        let s = input;
        // Clean non-breaking spaces and other control characters
        s = s.replace(/\u00A0/g, ' ');
        s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFEFF]/g, '');
        // Fix common JSON formatting issues in values
        s = s.replace(/"([^"]*)"/g, (match) => {
            return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
        });
        // Remove comments
        s = s.replace(/\/\/.*/g, '');
        s = s.replace(/\/\*[\s\S]*?\*\//g, '');
        // Replace smart quotes
        s = s.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"');
        const MAX_ATTEMPTS = 100;
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            // Single quotes to double quotes for strings
            s = s.replace(/'((?:\\.|[^'])*)'/g, (_, g1) => '"' + g1.replace(/"/g, '\\"').replace(/\\'/g, "'") + '"');
            // Unquoted keys to quoted keys
            s = s.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
            // Remove trailing commas
            s = s.replace(/,\s*([}\]])/g, '$1');
            try {
                const parsed = JSON.parse(s);
                return {
                    output: JSON.stringify(parsed, null, indent),
                    error: '✨ Đã dọn dẹp sạch ký tự rác và định dạng lại JSON.'
                };
            }
            catch (err) {
                const msg = err.message;
                // Handle unexpected ends (missing braces/brackets)
                if (msg.includes("Unexpected end") || msg.includes("unterminated")) {
                    const openBraces = (s.match(/{/g) || []).length;
                    const closeBraces = (s.match(/}/g) || []).length;
                    if (openBraces > closeBraces) {
                        s += '}';
                        continue;
                    }
                    const openBrackets = (s.match(/\[/g) || []).length;
                    const closeBrackets = (s.match(/\]/g) || []).length;
                    if (openBrackets > closeBrackets) {
                        s += ']';
                        continue;
                    }
                }
                const posMatch = msg.match(/position\s+(\d+)/);
                if (!posMatch)
                    throw err;
                const errorPos = parseInt(posMatch[1], 10);
                // Handle common missing tokens
                if (msg.includes("Expected ','") || msg.includes("Expected '}'")) {
                    let i = errorPos;
                    while (i > 0 && /\s/.test(s[i - 1]))
                        i--;
                    s = s.slice(0, i) + ',' + s.slice(i);
                }
                else if (msg.includes("Expected ':'")) {
                    s = s.slice(0, errorPos) + ':' + s.slice(errorPos);
                }
                else if (msg.includes("Unexpected token") || msg.includes("Expected property name")) {
                    let start = errorPos;
                    while (start > 0 && /[a-zA-Z0-9_$.]/.test(s[start - 1]))
                        start--;
                    let end = errorPos;
                    while (end < s.length && /[a-zA-Z0-9_$.]/.test(s[end]))
                        end++;
                    if (end > start) {
                        const word = s.slice(start, end);
                        const map = { 'None': 'null', 'undefined': 'null', 'True': 'true', 'False': 'false', 'NaN': 'null' };
                        s = s.slice(0, start) + (map[word] || `"${word}"`) + s.slice(end);
                    }
                    else {
                        s = s.slice(0, errorPos) + s.slice(errorPos + 1);
                    }
                }
                else {
                    throw err;
                }
            }
        }
        return { output: '', error: 'Auto-fix exceeded maximum attempts' };
    }
    catch (e) {
        return { output: '', error: `Auto-fix bó tay: ${e.message}` };
    }
};
