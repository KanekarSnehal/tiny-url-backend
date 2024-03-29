// Function to generate a unique string using IP address and timestamp
function generateUniqueString(ipAddress) {
    const timestamp = Date.now().toString();
    return ipAddress + timestamp;
  }
  
  // Function to convert hexadecimal to base 62
  function hexToBase62(hexString) {
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
  
  
  function crc32Hash(data) {
      let crc = 0xFFFFFFFF;
      for (let i = 0; i < data.length; i++) {
          let byte = data.charCodeAt(i);
          crc ^= byte;
          for (let j = 0; j < 8; j++) {
              crc = (crc >>> 1) ^ ((crc & 1) * 0xEDB88320);
          }
      }
      crc = crc ^ 0xFFFFFFFF;
      return crc >>> 0; // Ensure unsigned integer
  }
  
  // Function to generate a short URL
  export function generateUniqueHash(ipAddress) {
    const uniqueString = generateUniqueString(ipAddress); // Generate a unique string using IP address and timestamp
    const md5Hash = crc32Hash(uniqueString); // Generate MD5 hash
    const base62Hash = hexToBase62(md5Hash); // Convert MD5 hash to Base62

    return base62Hash;
  }
  