import LZString from 'lz-string';

/**
 * Encodes data for sharing via URL.
 * Uses LZ-string compression for efficiency and then Base64 for URL safety.
 *
 * @param data - The data to encode (usually a string or an object)
 * @returns The encoded string safe for URL fragments/search params
 */
export function encodeShareData(data: any): string {
  if (data === undefined || data === null || data === '') return '';
  const stringified = typeof data === 'string' ? data : JSON.stringify(data);
  // compressToEncodedURIComponent is slightly better for URLs than base64
  return LZString.compressToEncodedURIComponent(stringified);
}

/**
 * Decodes data from a share URL.
 *
 * @param encoded - The encoded string from the URL
 * @returns The original string (usually to be parsed back to JSON if needed)
 */
export function decodeShareData(encoded: string): string | null {
  if (!encoded) return null;
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(encoded);
    return decompressed; // returns null if decompression fails
  } catch (e) {
    console.error('Failed to decode share data:', e);
    return null;
  }
}

/**
 * Gets a specific parameter from the URL query string.
 */
export function getUrlParam(name: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * Sets a parameter in the URL and returns the new URL string.
 */
export function updateUrlParam(name: string, value: string): string {
  const url = new URL(window.location.href);
  if (value) {
    url.searchParams.set(name, value);
  } else {
    url.searchParams.delete(name);
  }
  return url.toString();
}
