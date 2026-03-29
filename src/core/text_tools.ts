// core/text_tools.ts
export const sortLines = (text: string, order: 'asc' | 'desc' = 'asc', removeDuplicates: boolean = false): string => {
  let lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (removeDuplicates) lines = Array.from(new Set(lines));
  lines.sort();
  if (order === 'desc') lines.reverse();
  return lines.join('\n');
};

export const randomString = (length: number, charset: 'alphanumeric' | 'alpha' | 'numeric' | 'hex' = 'alphanumeric'): string => {
  let chars = '';
  switch (charset) {
    case 'alpha': chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'; break;
    case 'numeric': chars = '0123456789'; break;
    case 'hex': chars = '0123456789abcdef'; break;
    default: chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; break;
  }
  let res = '';
  for (let i = 0; i < Math.max(1, length); i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
  return res;
};

export const generateNanoid = (size: number = 21): string => {
  const alphabet = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
  let id = '';
  for (let i = 0; i < size; i++) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
};

export const robotsTxtGenerate = (allow: string[], disallow: string[], sitemapUrl?: string): string => {
  let txt = `User-agent: *\n`;
  allow.forEach(p => txt += `Allow: ${p}\n`);
  disallow.forEach(p => txt += `Disallow: ${p}\n`);
  if (sitemapUrl) txt += `Sitemap: ${sitemapUrl}\n`;
  return txt.trim();
};

export const htmlToMarkdownBasic = (html: string): string => {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (m, c) => c.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n'))
    .replace(/<strong[^>]*>(.*?)<\/strong>|<b[^>]*>(.*?)<\/b>/gi, '**$1$2**')
    .replace(/<em[^>]*>(.*?)<\/em>|<i[^>]*>(.*?)<\/i>/gi, '*$1$2*')
    .replace(/<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '') // Strip remaining tags
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};
