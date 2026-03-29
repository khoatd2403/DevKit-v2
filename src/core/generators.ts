// core/generators.ts

export interface PasswordOptions {
  uppercase?: boolean;
  lowercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
}

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

export const generatePassword = (length: number, options: PasswordOptions = { uppercase: true, lowercase: true, numbers: true, symbols: true }): string => {
  const charset = Object.entries(options)
    .filter(([, v]) => v)
    .map(([k]) => CHARSETS[k as keyof typeof CHARSETS])
    .join('');
    
  if (!charset) throw new Error("At least one charset option must be selected");
  
  let password = '';
  // Use Web Crypto API available in browsers & Node >= 19
  const randomValues = new Uint32Array(length);
  globalThis.crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i]! % charset.length];
  }
  return password;
};

export const generateUuid = (): string => {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  // Basic fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
