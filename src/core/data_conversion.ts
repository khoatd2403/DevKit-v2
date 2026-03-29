// core/data_conversion.ts
export const csvToJson = (csv: string, separator = ','): Record<string, string>[] => {
  const lines = csv.split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 2) throw new Error("CSV requires at least 2 lines (headers + data)");
  const headers = lines[0].split(separator).map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(separator);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => obj[h] = values[i]?.trim() || "");
    return obj;
  });
};

export const jsonToCsv = (jsonStr: string, separator = ','): string => {
  const data = JSON.parse(jsonStr);
  if (!Array.isArray(data) || data.length === 0) throw new Error("JSON must be a non-empty array of objects");
  const headers = Object.keys(data[0]);
  const rows = data.map(obj => headers.map(h => {
    let val = obj[h] === null || obj[h] === undefined ? "" : String(obj[h]);
    if (val.includes(separator) || val.includes('"') || val.includes('\n')) {
      val = `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  }).join(separator));
  return [headers.join(separator), ...rows].join('\n');
};

export const envToJson = (envStr: string): Record<string, string> => {
  const lines = envStr.split('\n');
  const result: Record<string, string> = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"') || val.startsWith("'") && val.endsWith("'")) {
        val = val.substring(1, val.length - 1);
      }
      result[key] = val;
    }
  }
  return result;
};

export const jsonToEnv = (jsonStr: string): string => {
  const data = JSON.parse(jsonStr);
  if (typeof data !== 'object' || Array.isArray(data)) throw new Error("JSON must be an object");
  return Object.entries(data)
    .map(([k, v]) => {
      let val = String(v);
      if (val.includes('\n') || val.includes(' ')) val = `"${val.replace(/"/g, '\\"')}"`;
      return `${k.toUpperCase().replace(/[^A-Z0-9_]/g, '_')}=${val}`;
    })
    .join('\n');
};

export const jsonDiff = (json1: string, json2: string): any => {
   const obj1 = JSON.parse(json1);
   const obj2 = JSON.parse(json2);
   const diff: any = { added: {}, removed: {}, changed: {} };
   Object.keys(obj2).forEach(k => {
     if (!(k in obj1)) diff.added[k] = obj2[k];
     else if (JSON.stringify(obj1[k]) !== JSON.stringify(obj2[k])) diff.changed[k] = { from: obj1[k], to: obj2[k] };
   });
   Object.keys(obj1).forEach(k => {
     if (!(k in obj2)) diff.removed[k] = obj1[k];
   });
   return diff;
};
