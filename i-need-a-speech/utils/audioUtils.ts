/**
 * Decodes a base64 string into a Uint8Array
 */
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Converts raw PCM data (Int16) to a WAV file Blob.
 * This is necessary because Gemini returns raw PCM without headers.
 */
export function pcmToWav(pcmData: Int16Array, sampleRate: number = 24000, numChannels: number = 1): Blob {
  const buffer = new ArrayBuffer(44 + pcmData.length * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // RIFF chunk length
  view.setUint32(4, 36 + pcmData.length * 2, true);
  // WAVE identifier
  writeString(view, 8, 'WAVE');
  // fmt chunk identifier
  writeString(view, 12, 'fmt ');
  // fmt chunk length
  view.setUint32(16, 16, true);
  // Sample format (1 is PCM)
  view.setUint16(20, 1, true);
  // Channel count
  view.setUint16(22, numChannels, true);
  // Sample rate
  view.setUint32(24, sampleRate, true);
  // Byte rate (SampleRate * BlockAlign)
  view.setUint32(28, sampleRate * numChannels * 2, true);
  // Block align (ChannelCount * BytesPerSample)
  view.setUint16(32, numChannels * 2, true);
  // Bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, pcmData.length * 2, true);

  // Write PCM samples
  const offset = 44;
  for (let i = 0; i < pcmData.length; i++) {
    view.setInt16(offset + i * 2, pcmData[i], true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Converts a Uint8Array of bytes (raw output from API) to Int16Array
 * Assuming Little Endian formatting from the API
 */
export function bytesToInt16(bytes: Uint8Array): Int16Array {
  const int16Array = new Int16Array(bytes.length / 2);
  const dataView = new DataView(bytes.buffer);
  for (let i = 0; i < int16Array.length; i++) {
    int16Array[i] = dataView.getInt16(i * 2, true); // Assuming little-endian
  }
  return int16Array;
}
