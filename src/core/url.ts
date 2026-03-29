// core/url.ts
export const urlEncode = (str: string): string => {
  return encodeURIComponent(str);
};

export const urlDecode = (str: string): string => {
  try {
    return decodeURIComponent(str);
  } catch (e) {
    throw new Error('Định dạng URL Encode không hợp lệ.');
  }
};

export const parseUrl = (urlStr: string): Record<string, any> => {
  let u = urlStr;
  if (!u.startsWith("http://") && !u.startsWith("https://")) u = "https://" + u;
  const parsed = new URL(u);
  
  const searchParams: Record<string, string> = {};
  parsed.searchParams.forEach((val, key) => {
    searchParams[key] = val;
  });

  return {
    protocol: parsed.protocol,
    host: parsed.host,
    hostname: parsed.hostname,
    port: parsed.port,
    pathname: parsed.pathname,
    search: parsed.search,
    searchParams,
    hash: parsed.hash,
    username: parsed.username,
    password: parsed.password,
    origin: parsed.origin,
  };
};
