export const float32ArrayToBase64 = (
  audioData: Float32Array,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const sampleRate = 16000;
    const wavBlob = float32ArrayToWav(audioData, sampleRate);

    const reader = new FileReader();
    reader.readAsDataURL(wavBlob);

    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result as string);
      } else {
        reject(new Error('Failed to convert audio to Base64'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading Blob as Data URL'));
    };
  });
};

const float32ArrayToWav = (
  float32Array: Float32Array,
  sampleRate: number,
): Blob => {
  const buffer = new ArrayBuffer(44 + float32Array.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + float32Array.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono channel
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align (16-bit mono)
  view.setUint16(34, 16, true); // Bits per sample
  writeString(36, 'data');
  view.setUint32(40, float32Array.length * 2, true); // Data chunk size

  // Convert Float32Array PCM to 16-bit PCM
  const pcmData = new DataView(buffer, 44);
  for (let i = 0; i < float32Array.length; i++) {
    let s = Math.max(-1, Math.min(1, float32Array[i])); // Clamp values between -1 and 1
    pcmData.setInt16(i * 2, s * 0x7fff, true); // Convert to 16-bit PCM
  }

  return new Blob([buffer], { type: 'audio/wav' });
};
