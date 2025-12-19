import { GoogleGenAI, Modality, Type } from "@google/genai";
import { SpeechRequest, GeneratedSpeech } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a world-class speechwriter. 
Your goal is to write a speech that is engaging, appropriate for the tone and audience, and perfectly timed.
Structure the speech clearly with an introduction, body, and conclusion.
Do not include any "Here is your speech" preambles. Just return the speech text directly.
If the user provides a "Speaker Name", refer to themself or sign off appropriately if needed.
`;

const parseSpeechResponse = (fullText: string): { title: string, content: string } => {
    const firstNewLineIndex = fullText.indexOf('\n');
    let title = "My Speech";
    let content = fullText;

    if (firstNewLineIndex !== -1 && firstNewLineIndex < 100) {
       // Assume first line is title if it's reasonably short
       title = fullText.substring(0, firstNewLineIndex).replace(/[*#]/g, '').trim();
       content = fullText.substring(firstNewLineIndex).trim();
    }
    return { title, content };
};

export const generateSpeechText = async (request: SpeechRequest): Promise<GeneratedSpeech> => {
  const prompt = `
    Write a speech about: "${request.topic}".
    Tone: ${request.tone}.
    Target Length: ${request.length}.
    ${request.speakerName ? `Speaker Name: ${request.speakerName}` : ''}
    ${request.audience ? `Audience: ${request.audience}` : ''}
    
    Format the output with a suggested Title on the first line, followed by a double newline, then the speech content.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, // Creativity balance
      }
    });

    const { title, content } = parseSpeechResponse(response.text || "");

    return {
      title,
      content,
      timestamp: Date.now()
    };

  } catch (error) {
    console.error("Text Generation Error:", error);
    throw new Error("Failed to generate speech text. Please try again.");
  }
};

export const reviseSpeech = async (currentSpeech: string, instruction: string): Promise<GeneratedSpeech> => {
  const prompt = `
    Here is a draft speech:
    "${currentSpeech}"

    User Instruction for Revision: "${instruction}"

    Task: Rewrite the speech to satisfy the user's instruction.
    Maintain the core message unless told otherwise, but fully integrate the requested changes (e.g., tone shift, adding/removing parts).
    
    Format the output with a suggested Title on the first line (you can keep the old one or change it if appropriate), followed by a double newline, then the speech content.
    Do not include any conversational filler like "Here is the revised speech". Just the title and the speech.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    const { title, content } = parseSpeechResponse(response.text || "");

    return {
      title,
      content,
      timestamp: Date.now()
    };

  } catch (error) {
    console.error("Revision Error:", error);
    throw new Error("Failed to revise speech. Please try again.");
  }
};

export const generateSpeechAudio = async (text: string): Promise<string> => {
  try {
    // Gemini 2.5 Flash TTS
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text.substring(0, 4000) }] }], // Limit char count for safety/latency
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' } // 'Kore', 'Fenrir', 'Puck', 'Zephyr', 'Charon'
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data received from Gemini.");
    }

    return base64Audio;
  } catch (error) {
    console.error("Audio Generation Error:", error);
    throw new Error("Failed to generate audio. Please try again.");
  }
};
