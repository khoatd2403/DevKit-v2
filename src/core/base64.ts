// core/base64.ts

export const base64Encode = (input: string): string => {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(input, 'utf-8').toString('base64');
  }
  // Browser fallback handling utf-8
  return btoa(unescape(encodeURIComponent(input)));
};

export const base64Decode = (input: string): string => {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(input, 'base64').toString('utf-8');
  }
  return decodeURIComponent(escape(atob(input)));
};
