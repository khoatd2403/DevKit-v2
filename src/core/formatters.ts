// core/formatters.ts
export const minifyHtml = (html: string): string => {
  return html.replace(/\s+/g, ' ')
             .replace(/> \s*</g, '><')
             .replace(/<!--.*?-->/g, '')
             .trim();
};

export const minifyCss = (css: string): string => {
  return css.replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
            .replace(/\s+/g, ' ')             // Collapse whitespace
            .replace(/\s*([\{\}\:\;\,])\s*/g, '$1') // Remove spaces around syntax
            .trim();
};

export const minifyJson = (jsonStr: string): string => {
  try { return JSON.stringify(JSON.parse(jsonStr)); }
  catch { throw new Error("Invalid JSON"); }
};

export const minifyXml = (xml: string): string => {
  return xml.replace(/>\s+</g, '><')
            .replace(/<!--[\s\S]*?-->/g, '')
            .trim();
};

export const escapeString = (str: string): string => {
  return str.replace(/\\/g, '\\\\')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t')
            .replace(/"/g, '\\"')
            .replace(/'/g, "\\'");
};

export const unescapeString = (str: string): string => {
  return str.replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'")
            .replace(/\\\\/g, '\\');
};
