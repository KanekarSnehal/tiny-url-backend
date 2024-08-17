/**
 * Generates a unique string by concatenating an IP address with the current timestamp.
 * 
 * @param ipAddress - The IP address to be used in the string.
 * @returns A unique string generated using the IP address and current timestamp.
 */
function generateUniqueString(ipAddress: string): string {
    const timestamp = Date.now().toString();
    return ipAddress + timestamp;
}

/**
 * Converts a hexadecimal string to a Base62 encoded string.
 * 
 * @param hexString - The hexadecimal number to convert.
 * @returns A Base62 encoded string.
 */
function hexToBase62(hexString: number) {
  const base62Chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  let value = BigInt("0x" + hexString);
  
  while (value > BigInt(0)) {
    result = base62Chars[Number(value % BigInt(62))] + result;
    value = value / BigInt(62);
  }
  
  return result;
}
  
  
/**
 * Generates a CRC32 hash for the given string.
 * 
 * @param data - The string to hash.
 * @returns A CRC32 hash as an unsigned integer.
*/
function crc32Hash(data: string): number {
  let crc = 0xFFFFFFFF;
  for (const byte of data) {
    crc ^= byte.charCodeAt(0);
    for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ ((crc & 1) * 0xEDB88320);
    }
  }
  crc = crc ^ 0xFFFFFFFF;
  return crc >>> 0; // Ensure unsigned integer
}
  
/**
 * Generates a unique Base62 encoded hash using the given IP address.
 * 
 * @param ipAddress - The IP address to generate the hash for.
 * @returns A unique Base62 encoded hash string.
*/
export function generateUniqueHash(ipAddress: string) {
  const uniqueString = generateUniqueString(ipAddress); // Generate a unique string using IP address and timestamp
  const generatedHash = crc32Hash(uniqueString); // Generate CRC32 hash
  const base62Hash = hexToBase62(generatedHash); // Convert CRC32 hash to Base62

  return base62Hash;
}
  