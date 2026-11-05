import React, { useState, useEffect, useRef } from 'react';
import {
  FiPlay,
  FiPause,
  FiSquare,
  FiVolume2,
  FiVolumeX,
  FiFastForward,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const AudioArticleReader = ({ title, content, authorName }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [progress, setProgress] = useState(0);

  const utteranceRef = useRef(null);
  const textChunksRef = useRef([]);
  const currentChunkIndexRef = useRef(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const updateVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
        if (available.length > 0 && !selectedVoice) {
          const defaultVoice =
            available.find((v) => v.lang.startsWith('en') && v.name.includes('Natural')) ||
            available.find((v) => v.lang.startsWith('en')) ||
            available[0];
          if (defaultVoice) setSelectedVoice(defaultVoice.name);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isSupported) return null;

  // Clean markdown to readable text
  const cleanMarkdownForAudio = (raw) => {
    return (raw || '')
      .replace(/```[\s\S]*?```/g, ' [Code snippet omitted for audio reading] ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/[#*>\-_~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const startSpeaking = () => {
    window.speechSynthesis.cancel();

    const cleanBody = cleanMarkdownForAudio(content);
    const fullNarrative = `Article: ${title}. Written by ${authorName || 'BlogHub creator'}. ${cleanBody}`;

    // Split into readable paragraphs/sentences to avoid WebSpeech browser truncation limits
    const sentences = fullNarrative.match(/[^.!?]+[.!?]+(\s|$)/g) || [fullNarrative];
    textChunksRef.current = sentences;
    currentChunkIndexRef.current = 0;

    speakChunk(0);
  };

  const speakChunk = (index) => {
    if (index >= textChunksRef.current.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      return;
    }

    currentChunkIndexRef.current = index;
    const chunkText = textChunksRef.current[index];
    const utterance = new SpeechSynthesisUtterance(chunkText);
    utteranceRef.current = utterance;

    if (selectedVoice) {
      const voiceObj = voices.find((v) => v.name === selectedVoice);
      if (voiceObj) utterance.voice = voiceObj;
    }

    utterance.rate = rate;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setProgress(
        Math.round((index / Math.max(1, textChunksRef.current.length)) * 100)
      );
    };

    utterance.onend = () => {
      speakChunk(index + 1);
    };

    utterance.onerror = (e) => {
      if (e.error !== 'canceled') {
        console.error('Speech synthesis error:', e);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleTogglePlay = () => {
    if (!isPlaying) {
      startSpeaking();
    } else if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
  };

  const cycleRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const nextRate = rates[(rates.indexOf(rate) + 1) % rates.length];
    setRate(nextRate);
    toast(`Audio playback set to ${nextRate}x`);
    if (isPlaying) {
      // Re-trigger with new rate from current chunk
      window.speechSynthesis.cancel();
      speakChunk(currentChunkIndexRef.current);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-950 to-purple-950 text-white shadow-xl shadow-brand-500/10 border border-brand-800/50 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Info & Waveform */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-brand-300">
            <FiVolume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
                Audio Reader
              </span>
              {isPlaying && !isPaused && (
                <span className="flex items-center space-x-0.5">
                  <span className="w-1 h-3 bg-brand-400 rounded-full animate-bounce" />
                  <span className="w-1 h-4 bg-purple-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 line-clamp-1">
              Listen to "{title}" narrated via Speech API
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center space-x-2">
          {/* Rate Button */}
          <button
            onClick={cycleRate}
            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition"
            title="Toggle playback speed"
          >
            {rate}x
          </button>

          {/* Voice Selector if multiple */}
          {voices.length > 1 && (
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="max-w-[130px] px-2 py-1.5 rounded-xl bg-white/10 text-white text-[11px] border border-white/10 focus:outline-none focus:bg-navy-900 truncate"
            >
              {voices
                .filter((v) => v.lang.startsWith('en'))
                .slice(0, 8)
                .map((v) => (
                  <option key={v.name} value={v.name} className="bg-navy-900 text-white">
                    {v.name.replace(/Microsoft|Google|Apple/g, '').trim()}
                  </option>
                ))}
            </select>
          )}

          {/* Play/Pause */}
          <button
            onClick={handleTogglePlay}
            className="w-9 h-9 rounded-2xl bg-white text-navy-950 hover:bg-brand-100 flex items-center justify-center font-bold shadow-md transition"
            title={isPlaying && !isPaused ? 'Pause narration' : 'Play audio narration'}
          >
            {isPlaying && !isPaused ? (
              <FiPause className="w-4 h-4 text-brand-700" />
            ) : (
              <FiPlay className="w-4 h-4 text-brand-700 ml-0.5" />
            )}
          </button>

          {/* Stop */}
          {isPlaying && (
            <button
              onClick={handleStop}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition"
              title="Stop playback"
            >
              <FiSquare className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {isPlaying && (
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-brand-400 to-purple-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default AudioArticleReader;
