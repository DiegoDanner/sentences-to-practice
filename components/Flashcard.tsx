"use client";

import { useState, useRef } from "react";
import { motion } from "motion/react";
import { Volume2, Loader2 } from "lucide-react";
import Image from "next/image";
import { GoogleGenAI, Modality } from "@google/genai";

interface FlashcardProps {
  english: string;
  portuguese: string;
  imageKeyword: string;
  startLanguage: "english" | "portuguese";
}

export default function Flashcard({ english, portuguese, imageKeyword, startLanguage }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const playAudio = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent flipping when clicking the audio button
    
    if (isPlaying || isLoadingAudio) return;

    setIsLoadingAudio(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: english }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        throw new Error("Failed to generate audio");
      }

      // Decode base64 to ArrayBuffer
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const audioContext = audioContextRef.current;
      
      // Resume context if it was suspended (browser policy)
      if (audioContext.state === 'suspended') {
         await audioContext.resume();
      }

      // Gemini TTS returns raw 16-bit PCM audio at 24kHz
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = audioContext.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      source.onended = () => {
        setIsPlaying(false);
      };

      setIsPlaying(true);
      source.start(0);

    } catch (error) {
      console.error("Error playing audio:", error);
      alert("Could not play audio. Please try again.");
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const frontText = startLanguage === "english" ? english : portuguese;
  const backText = startLanguage === "english" ? portuguese : english;
  
  const showAudioOnFront = startLanguage === "english";
  const showAudioOnBack = startLanguage === "portuguese";

  return (
    <div className="relative w-full max-w-md aspect-[3/4] perspective-1000 cursor-pointer" onClick={handleFlip}>
      <motion.div
        className="w-full h-full relative preserve-3d duration-500"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Front */}
        <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col overflow-hidden">
          <div className="relative w-full h-1/2 bg-gray-100">
             <Image
                src={`https://picsum.photos/seed/${imageKeyword}/400/300`}
                alt="Flashcard visual"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
             />
          </div>
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center relative">
            <p className="text-2xl font-medium text-gray-800">{frontText}</p>
            {showAudioOnFront && (
              <button
                onClick={playAudio}
                disabled={isLoadingAudio || isPlaying}
                className="absolute bottom-6 right-6 p-3 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
                aria-label="Play audio"
              >
                {isLoadingAudio ? <Loader2 className="w-6 h-6 animate-spin" /> : <Volume2 className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Back */}
        <div className="absolute w-full h-full backface-hidden bg-blue-600 rounded-2xl shadow-xl border border-blue-500 flex flex-col items-center justify-center p-8 text-center [transform:rotateY(180deg)]">
          <p className="text-3xl font-medium text-white">{backText}</p>
          {showAudioOnBack && (
            <button
              onClick={playAudio}
              disabled={isLoadingAudio || isPlaying}
              className="absolute bottom-6 right-6 p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors disabled:opacity-50"
              aria-label="Play audio"
            >
              {isLoadingAudio ? <Loader2 className="w-6 h-6 animate-spin" /> : <Volume2 className="w-6 h-6" />}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
