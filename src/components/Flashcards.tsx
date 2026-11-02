import { useState, useEffect, useCallback, type FC } from 'react';
import type { VocabWord } from '../data/vocabulary';
import { speakWord } from '../utils/speech';
import { sounds } from '../utils/audio';
import { 
  Volume2, 
  Star, 
  RotateCw, 
  Shuffle, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  Pause,
  Repeat
} from 'lucide-react';

interface FlashcardsProps {
  words: VocabWord[];
  starredIds: number[];
  masteredIds: number[];
  onToggleStar: (id: number) => void;
  onToggleMaster: (id: number) => void;
}

export const Flashcards: FC<FlashcardsProps> = ({
  words,
  starredIds,
  masteredIds,
  onToggleStar,
  onToggleMaster,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledWords, setShuffledWords] = useState<VocabWord[]>(words);
  const [isShuffled, setIsShuffled] = useState(false);
  const [swapSides, setSwapSides] = useState(false); // if true, show Uzbek/Def on front
  const [autoPlay, setAutoPlay] = useState(false);

  // Sync shuffledWords when input words change
  useEffect(() => {
    setShuffledWords(words);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [words]);

  const currentWord = shuffledWords[currentIndex] || words[0];

  const handleNext = useCallback(() => {
    sounds.playFlip();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % shuffledWords.length);
  }, [shuffledWords.length]);

  const handlePrev = useCallback(() => {
    sounds.playFlip();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + shuffledWords.length) % shuffledWords.length);
  }, [shuffledWords.length]);

  const handleFlip = useCallback(() => {
    sounds.playFlip();
    setIsFlipped((prev) => !prev);
  }, []);

  const handleShuffle = () => {
    if (isShuffled) {
      setShuffledWords(words);
      setIsShuffled(false);
    } else {
      const copy = [...words].sort(() => Math.random() - 0.5);
      setShuffledWords(copy);
      setIsShuffled(true);
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key.toLowerCase() === 's') {
        if (currentWord) onToggleStar(currentWord.id);
      } else if (e.key.toLowerCase() === 'm') {
        if (currentWord) onToggleMaster(currentWord.id);
      } else if (e.key.toLowerCase() === 'r') {
        handleShuffle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, currentWord, onToggleStar, onToggleMaster]);

  // Auto-play timer
  useEffect(() => {
    if (!autoPlay) return;

    const timer = setTimeout(() => {
      if (!isFlipped) {
        setIsFlipped(true);
      } else {
        handleNext();
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, [autoPlay, isFlipped, handleNext]);

  if (!currentWord) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">No words found in this category.</p>
      </div>
    );
  }

  const isStarred = starredIds.includes(currentWord.id);
  const isMastered = masteredIds.includes(currentWord.id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-200">
            Card {currentIndex + 1} of {shuffledWords.length}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-indigo-400 font-mono">Word #{currentWord.id}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSwapSides(!swapSides)}
            title="Swap Front / Back"
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              swapSides
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Repeat className="w-4 h-4" />
          </button>

          <button
            onClick={handleShuffle}
            title="Shuffle (R)"
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              isShuffled
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={() => setAutoPlay(!autoPlay)}
            title="Auto-play"
            className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center space-x-1 ${
              autoPlay
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="text-[11px] font-semibold">{autoPlay ? 'Pause' : 'Auto'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-1.5 mb-6 overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / shuffledWords.length) * 100}%` }}
        />
      </div>

      {/* 3D Flip Card Container */}
      <div
        className="relative w-full h-[380px] sm:h-[420px] perspective-1000 cursor-pointer select-none"
        onClick={handleFlip}
      >
        <div
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT OF CARD */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-8 flex flex-col justify-between shadow-2xl backface-hidden">
            {/* Top row */}
            <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Unit {currentWord.unit}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono text-slate-400 bg-slate-800">
                  {currentWord.pos}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onToggleStar(currentWord.id)}
                  title="Star word (S)"
                  className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Star className={`w-5 h-5 ${isStarred ? 'text-amber-400 fill-amber-400' : ''}`} />
                </button>
                <button
                  onClick={() => onToggleMaster(currentWord.id)}
                  title="Mark Mastered (M)"
                  className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className={`w-5 h-5 ${isMastered ? 'text-emerald-400 fill-emerald-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Center: Word */}
            <div className="text-center my-auto">
              {!swapSides ? (
                <>
                  <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
                    {currentWord.word}
                  </h2>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(currentWord.word);
                    }}
                    className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-indigo-300 text-xs font-medium border border-slate-700 transition-all hover:scale-105 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-indigo-400" />
                    <span>Pronounce</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="text-xs uppercase font-bold tracking-wider text-emerald-400 mb-2">
                    O'zbekcha Ma'nosi:
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    {currentWord.uzbek}
                  </h2>
                  <p className="text-slate-300 text-sm italic max-w-lg mx-auto">
                    "{currentWord.definition}"
                  </p>
                </>
              )}
            </div>

            {/* Bottom hint */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800/80">
              <span>Click or Space to flip</span>
              <span className="flex items-center space-x-1">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Flip to see details</span>
              </span>
            </div>
          </div>

          {/* BACK OF CARD */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl backface-hidden rotate-y-180 overflow-y-auto">
            {/* Top row */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-white">{currentWord.word}</span>
                <span className="text-xs font-mono text-indigo-400">({currentWord.pos})</span>
              </div>
              <button
                onClick={() => speakWord(currentWord.word)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 transition-colors cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Middle Details */}
            <div className="space-y-4 my-auto py-2">
              {/* Uzbek Translation Card */}
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                  O'zbekcha Tarjima:
                </div>
                <div className="text-base sm:text-lg font-bold text-emerald-200">
                  {currentWord.uzbek}
                </div>
              </div>

              {/* English Definition */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">
                  College Panda Definition:
                </div>
                <p className="text-slate-200 text-sm leading-relaxed">
                  {currentWord.definition}
                </p>
              </div>

              {/* Synonyms */}
              {currentWord.synonyms.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Synonyms:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentWord.synonyms.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-lg text-xs bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Example sentence */}
              {currentWord.example && (
                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 text-xs text-slate-300 italic">
                  <span className="text-amber-400 font-semibold not-italic mr-1.5">SAT Context:</span>
                  "{currentWord.example}"
                </div>
              )}
            </div>

            {/* Bottom hint */}
            <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-800/60">
              Click or Space to flip back
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4 mt-6">
        <button
          onClick={handlePrev}
          className="flex-1 flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl border border-slate-700 transition-all cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous (←)</span>
        </button>

        <button
          onClick={handleFlip}
          className="flex-1 flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <RotateCw className="w-4 h-4" />
          <span>Flip (Space)</span>
        </button>

        <button
          onClick={handleNext}
          className="flex-1 flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl border border-slate-700 transition-all cursor-pointer shadow-md"
        >
          <span>Next (→)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Rating buttons (SM-2 Spaced Repetition) */}
      <div className="mt-6 pt-5 border-t border-slate-800">
        <div className="text-[11px] font-semibold text-slate-400 text-center mb-3">
          Rate your recall for Spaced Repetition:
        </div>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => handleNext()}
            className="py-2 px-3 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-semibold transition-all cursor-pointer"
          >
            1. Again
          </button>
          <button
            onClick={() => handleNext()}
            className="py-2 px-3 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all cursor-pointer"
          >
            2. Hard
          </button>
          <button
            onClick={() => handleNext()}
            className="py-2 px-3 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/30 text-blue-300 text-xs font-semibold transition-all cursor-pointer"
          >
            3. Good
          </button>
          <button
            onClick={() => {
              sounds.playMatch();
              onToggleMaster(currentWord.id);
              handleNext();
            }}
            className="py-2 px-3 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all cursor-pointer"
          >
            4. Easy (Master)
          </button>
        </div>
      </div>
    </div>
  );
};
