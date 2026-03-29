// core/number.ts

export const convertNumberBase = (input: string, fromBase: number, toBase: number): string => {
  if (fromBase < 2 || fromBase > 36) throw new Error("fromBase must be between 2 and 36");
  if (toBase < 2 || toBase > 36) throw new Error("toBase must be between 2 and 36");

  // Remove potential prefixes
  let cleanInput = input.trim();
  if (fromBase === 16 && cleanInput.toLowerCase().startsWith('0x')) cleanInput = cleanInput.slice(2);
  if (fromBase === 2 && cleanInput.toLowerCase().startsWith('0b')) cleanInput = cleanInput.slice(2);
  if (fromBase === 8 && cleanInput.toLowerCase().startsWith('0o')) cleanInput = cleanInput.slice(2);

  const parsed = parseInt(cleanInput, fromBase);
  if (isNaN(parsed)) throw new Error(`Invalid number '${input}' for base ${fromBase}`);
  
  return parsed.toString(toBase);
};

export const convertBytes = (bytes: number): Record<string, number | string> => {
  if (bytes < 0) throw new Error("Bytes cannot be negative");
  if (bytes === 0) return { bytes: 0, kilobytes: 0, megabytes: 0, gigabytes: 0, formatted: "0 B" };

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const formatted = parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];

  return { 
    bytes, 
    kilobytes: bytes / 1024, 
    megabytes: bytes / (1024 * 1024), 
    gigabytes: bytes / (1024 * 1024 * 1024), 
    formatted 
  };
};
