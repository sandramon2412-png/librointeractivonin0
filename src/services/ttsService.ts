import { GoogleGenAI, Modality } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY no configurada.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

let sharedAudioContext: AudioContext | null = null;

function getAudioContext() {
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  return sharedAudioContext;
}

const audioBufferCache: Record<string, AudioBuffer> = {};

export async function speakText(text: string, useIA: boolean = true, voice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr' = 'Kore') {
  if (!text) return;

  const cacheKey = `${text.toLowerCase().trim()}_${voice}`;
  const ctx = getAudioContext();

  if (audioBufferCache[cacheKey]) {
    playAudioBuffer(audioBufferCache[cacheKey]);
    return;
  }

  if (!useIA) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    return;
  }

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Diga: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioBuffer = await decodePCM(base64Audio, ctx);
      audioBufferCache[cacheKey] = audioBuffer;
      playAudioBuffer(audioBuffer);
    }
  } catch (error: any) {
    console.error("Error IA, usando fallback nativo:", error);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    throw error;
  }
}

async function decodePCM(base64Data: string, ctx: AudioContext): Promise<AudioBuffer> {
  const binaryString = window.atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Ensure we don't have an odd number of bytes for Int16Array
  const bufferLength = Math.floor(bytes.byteLength / 2);
  const int16Array = new Int16Array(bytes.buffer, 0, bufferLength);
  const float32Array = new Float32Array(int16Array.length);
  
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768;
  }
  
  const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
  audioBuffer.getChannelData(0).set(float32Array);
  return audioBuffer;
}

function playAudioBuffer(buffer: AudioBuffer) {
  const ctx = getAudioContext();
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
}
