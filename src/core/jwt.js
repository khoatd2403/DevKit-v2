// core/jwt.ts
/**
 * Decode a JSON Web Token (JWT) into its components.
 * @param token The encoded JWT string
 */
export const decodeJwt = (token) => {
    const parts = token.trim().split('.');
    if (parts.length !== 3)
        throw new Error('Invalid JWT: must have 3 parts');
    const decode = (s) => {
        // Basic base64url decode with padding fix
        const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
        // Works in browser (atob) and older Node environment
        const base64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
        // Polyfill for Node.js if atob is missing
        const decodedStr = (typeof atob === 'function')
            ? atob(base64)
            : Buffer.from(base64, 'base64').toString('binary');
        return JSON.parse(decodedStr);
    };
    return {
        header: decode(parts[0]),
        payload: decode(parts[1]),
        signature: parts[2],
    };
};
/**
 * Check if a token is expired.
 * @param exp Expiration time in seconds
 */
export const isTokenExpired = (exp) => {
    const date = new Date(exp * 1000);
    return {
        expired: date.getTime() < Date.now(),
        date
    };
};
