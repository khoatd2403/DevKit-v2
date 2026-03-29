// core/network.ts

import dns from "node:dns/promises";

export interface CidrInfo {
  ip: string;
  mask: number;
  networkAddress: string;
  broadcastAddress: string;
  firstUsable: string;
  lastUsable: string;
  totalHosts: number;
  usableHosts: number;
  subnetMask: string;
}

export const calculateCidr = (cidr: string): CidrInfo => {
  const [ipStr, maskStr] = cidr.split("/");
  if (!ipStr || !maskStr) throw new Error("Invalid CIDR format (expected IP/MASK, e.g. 192.168.1.0/24)");
  
  const mask = parseInt(maskStr, 10);
  if (isNaN(mask) || mask < 0 || mask > 32) throw new Error("Invalid subnet mask (must be 0-32)");

  const ipParts = ipStr.split(".").map(Number);
  if (ipParts.length !== 4 || ipParts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    throw new Error("Invalid IPv4 address");
  }

  // Convert IP to 32-bit integer
  const ipInt = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
  
  const maskInt = mask === 0 ? 0 : (~0 << (32 - mask));
  const networkInt = ipInt & maskInt;
  const broadcastInt = networkInt | ~maskInt;

  const intToIp = (int: number) => 
    `${(int >>> 24) & 255}.${(int >>> 16) & 255}.${(int >>> 8) & 255}.${int & 255}`;

  return {
    ip: ipStr,
    mask,
    networkAddress: intToIp(networkInt),
    broadcastAddress: intToIp(broadcastInt),
    firstUsable: mask >= 31 ? intToIp(networkInt) : intToIp(networkInt + 1),
    lastUsable: mask >= 31 ? intToIp(broadcastInt) : intToIp(broadcastInt - 1),
    totalHosts: Math.pow(2, 32 - mask),
    usableHosts: mask >= 31 ? 0 : Math.pow(2, 32 - mask) - 2,
    subnetMask: intToIp(maskInt),
  };
};

export const lookupDns = async (domain: string, type: string = "ANY"): Promise<any> => {
  if (type === "ANY") {
    try {
      return await dns.resolveAny(domain);
    } catch (e: any) {
      if (e.code === 'ENODATA' || e.code === 'ENOTFOUND') {
        // Fallback to basic A record
        return await dns.resolve(domain, 'A');
      }
      throw e;
    }
  } else {
    return await dns.resolve(domain, type);
  }
};
