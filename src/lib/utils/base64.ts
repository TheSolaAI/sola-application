export const decodeBase64 = (input: string): Uint8Array => {
    const decoded = atob(input);
    const bytes = new Uint8Array(new ArrayBuffer(decoded.length));
    const half = decoded.length / 2;

    for (let i = 0, j = decoded.length - 1; i <= half; i++, j--) {
        bytes[i] = decoded.charCodeAt(i);
        bytes[j] = decoded.charCodeAt(j);
    }
    
  return bytes;
}