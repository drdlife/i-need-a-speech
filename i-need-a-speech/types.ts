export enum SpeechTone {
  HEARTFELT = "Heartfelt & Emotional",
  FUNNY = "Funny & Witty",
  PROFESSIONAL = "Professional & Formal",
  INSPIRATIONAL = "Inspirational & Motivational",
  CASUAL = "Casual & Relaxed"
}
export enum SpeechLength {
  SHORT = "Short (1-2 mins)",
  MEDIUM = "Medium (3-5 mins)",
  LONG = "Long (5+ mins)"
}
export interface SpeechRequest {
  topic: string;
  tone: SpeechTone;
  length: SpeechLength;
  speakerName?: string;
  audience?: string;
}
export interface GeneratedSpeech {
  title: string;
  content: string;
  timestamp: number;
}
export type GenerationStatus = 'idle' | 'generating_text' | 'generating_audio' | 'completed' | 'error';
