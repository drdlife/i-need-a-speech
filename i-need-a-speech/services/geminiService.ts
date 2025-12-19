import { GoogleGenAI, Modality, Type } from "@google/genai";
import { SpeechRequest, GeneratedSpeech } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const SYSTEM_INSTRUCTION = "You are a world-class speechwriter. Your goal is to write a speech that is engaging, appropriate for the tone and audience, and perfectly timed. Structure the speech clearly. Do not include 'Here is your speech' preambles. Just return the speech text.";

const parseSpeechResponse = (fullText: string): { title: string, content: string } => {
    const firstNewLineIndex = fullText.indexOf('\n');
    let title = "My Speech";
    let content = fullText;
    if (firstNewLineIndex !== -1 && firstNewLineIndex < 100) {
       title = fullText.substring(0, firstNewLineIndex).replace(/[*#]/g, '').trim();
       content = fullText.substring(firstNewLineIndex).trim();
    }
    return { title, content };
};

export const generateSpeechText = async (request: SpeechRequest): Promise<GeneratedSpeech> => {
  const prompt = \`Write a speech about: "\${request.topic}". Tone: \${request.tone}. Length: \${request.length}. \${request.speakerName ? "Speaker Name: " + request.speakerName : ''} \${request.audience ? "Audience: " + request.audience : ''}. Format output with Title on first line.\`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.7 }
    });
    const { title, content } = parseSpeechResponse(response.text || "");
    return { title, content, timestamp: Date.now() };
  } catch (error) { throw new Error("Failed to generate speech text."); }
};

export const reviseSpeech = async (currentSpeech: string, instruction: string): Promise<GeneratedSpeech> => {
  const prompt = \`Draft: "\${currentSpeech}". Instruction: "\${instruction}". Rewrite the speech. Format output with Title on first line.\`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.7 }
    });
    const { title, content } = parseSpeechResponse(response.text || "");
    return { title, content, timestamp: Date.now() };
  } catch (error) { throw new Error("Failed to revise speech."); }
};

export const generateSpeechAudio = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text.substring(0, 4000) }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data received.");
    return base64Audio;
  } catch (error) { throw new Error("Failed to generate audio."); }
};
