import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface VoiceInputProps {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
}

export default function VoiceInput({ onResult, onError }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onResult(transcript);
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          onError?.(event.error);
          setIsListening(false);
        };

        setRecognition(recognition);
      }
    }
  }, [onResult, onError]);

  const toggleListening = () => {
    if (!recognition) {
      onError?.('Speech recognition not supported');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
    setIsListening(!isListening);
  };

  return (
    <motion.button
      onClick={toggleListening}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
        isListening 
          ? 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/20' 
          : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20'
      }`}
    >
      <motion.div
        animate={isListening ? {
          scale: [1, 1.2, 1],
          opacity: [1, 0.5, 1]
        } : {}}
        transition={{
          duration: 1,
          repeat: Infinity
        }}
      >
        {isListening ? '🎤' : '🎙️'}
      </motion.div>
      {isListening ? 'Stop Listening' : 'Start Voice Input'}
    </motion.button>
  );
}