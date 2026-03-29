// core/html.ts

export const htmlEncode = (text: string): string => {
  const map: Record<string, string> = { 
    '&': '&amp;', 
    '<': '&lt;', 
    '>': '&gt;', 
    '"': '&quot;', 
    "'": '&#39;' 
  };
  return text.replace(/[&<>"']/g, (m) => map[m]!);
};

export const htmlDecode = (text: string): string => {
  const map: Record<string, string> = { 
    '&amp;': '&', 
    '&lt;': '<', 
    '&gt;': '>', 
    '&quot;': '"', 
    '&#39;': "'" 
  };
  return text
    .replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, (m) => map[m]!)
    .replace(/&#([0-9]{1,5});/gi, (_, code) => String.fromCharCode(parseInt(code, 10)));
};
