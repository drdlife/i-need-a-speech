export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
  return bytes;
}
export function pcmToWav(pcmData: Int16Array, sampleRate: number = 24000, numChannels: number = 1): Blob {
  const buffer = new ArrayBuffer(44 + pcmData.length * 2);
  const view = new DataView(buffer);
  const writeString = (view: DataView, offset: number, string: string) => { for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i)); };
  writeString(view, 0, 'RIFF'); view.setUint32(4, 36 + pcmData.length * 2, true); writeString(view, 8, 'WAVE'); writeString(view, 12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, numChannels, true); view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * numChannels * 2, true); view.setUint16(32, numChannels * 2, true); view.setUint16(34, 16, true); writeString(view, 36, 'data'); view.setUint32(40, pcmData.length * 2, true);
  const offset = 44; for (let i = 0; i < pcmData.length; i++) { view.setInt16(offset + i * 2, pcmData[i], true); }
  return new Blob([view], { type: 'audio/wav' });
}
export function bytesToInt16(bytes: Uint8Array): Int16Array {
  const int16Array = new Int16Array(bytes.length / 2);
  const dataView = new DataView(bytes.buffer);
  for (let i = 0; i < int16Array.length; i++) { int16Array[i] = dataView.getInt16(i * 2, true); }
  return int16Array;
}
