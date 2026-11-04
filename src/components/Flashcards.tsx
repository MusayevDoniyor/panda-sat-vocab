import { useState, useEffect, useCallback, useRef, type FC } from 'react';
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
  Pause
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
  const [swapSides, setSwapSides] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  // Mobile Touch Swipe references
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const didSwipeRef = useRef(false);

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

  const handleCardClick = () => {
    if (didSwipeRef.current) {
      didSwipeRef.current = false;
      return;
    }
    handleFlip();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    didSwipeRef.current = false;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Detect horizontal swipe (>45px and more horizontal than vertical)
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
      didSwipeRef.current = true;
      if (deltaX < 0) {
        handleNext(); // Swipe left -> Next card
      } else {
        handlePrev(); // Swipe right -> Previous card
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleShuffle = () => {
    sounds.playFlip();
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
        sounds.playFlip();
      } else {
        handleNext();
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, [autoPlay, isFlipped, handleNext]);

  if (!currentWord) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 dark:text-slate-400">No words found in this category.</p>
      </div>
    );
  }

  const isStarred = starredIds.includes(currentWord.id);
  const isMastered = masteredIds.includes(currentWord.id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Card {currentIndex + 1} of {shuffledWords.length}
          </span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">Word #{currentWord.id}</span>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Language Direction Toggle with Flags */}
          <button
            onClick={() => {
              sounds.playFlip();
              setSwapSides(!swapSides);
            }}
            title="Swap front/back language direction"
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer shadow-xs ${
              swapSides
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                : 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-500/40 text-indigo-800 dark:text-indigo-300'
            }`}
          >
            {!swapSides ? (
              <>
                <span className="text-sm leading-none">🇺🇸</span>
                <span className="text-[11px] font-extrabold">EN ➔</span>
                <span className="text-sm leading-none">🇺🇿</span>
                <span className="text-[11px] font-extrabold">UZ</span>
              </>
            ) : (
              <>
                <span className="text-sm leading-none">🇺🇿</span>
                <span className="text-[11px] font-extrabold">UZ ➔</span>
                <span className="text-sm leading-none">🇺🇸</span>
                <span className="text-[11px] font-extrabold">EN</span>
              </>
            )}
          </button>

          <button
            onClick={handleShuffle}
            title="Shuffle Cards (R)"
            className={`p-2 rounded-xl border transition-all cursor-pointer shadow-xs ${
              isShuffled
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sounds.playFlip();
              setAutoPlay(!autoPlay);
            }}
            title="Auto-play Cards"
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center space-x-1 shadow-xs ${
              autoPlay
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="text-[11px] font-bold hidden sm:inline">{autoPlay ? 'Pause' : 'Auto'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mb-5 sm:mb-6 overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / shuffledWords.length) * 100}%` }}
        />
      </div>

      {/* 3D Flip Card Container with Mobile Touch Swipe */}
      <div
        className="relative w-full h-[400px] sm:h-[420px] perspective-1000 cursor-pointer select-none touch-pan-y"
        onClick={handleCardClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT OF CARD */}
          <div className="absolute inset-0 w-full h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 flex flex-col justify-between shadow-lg dark:shadow-2xl backface-hidden transition-colors duration-200">
            {/* Top row */}
            <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                  Unit {currentWord.unit}
                </span>
                <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-transparent">
                  {currentWord.pos}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onToggleStar(currentWord.id)}
                  title="Star word (S)"
                  className="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Star className={`w-5 h-5 ${isStarred ? 'text-amber-500 fill-amber-500' : ''}`} />
                </button>
                <button
                  onClick={() => onToggleMaster(currentWord.id)}
                  title="Mark Mastered (M)"
                  className="p-2 rounded-xl text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className={`w-5 h-5 ${isMastered ? 'text-emerald-500 fill-emerald-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Center: Word */}
            <div className="text-center my-auto">
              {!swapSides ? (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 mb-3 shadow-2xs">
                    <span>🇺🇸</span>
                    <span>English SAT Word</span>
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                    {currentWord.word}
                  </h2>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(currentWord.word);
                    }}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 cursor-pointer shadow-xs"
                  >
                    <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Pronounce</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 mb-3 shadow-2xs">
                    <span>🇺🇿</span>
                    <span>O'zbekcha Ma'nosi</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
                    {currentWord.uzbek}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm italic max-w-lg mx-auto">
                    "{currentWord.definition}"
                  </p>
                </>
              )}
            </div>

            {/* Bottom hint */}
            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800/80 font-medium">
              <span>Swipe or click to flip</span>
              <span className="flex items-center space-x-1.5">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Flip for details</span>
              </span>
            </div>
          </div>

          {/* BACK OF CARD */}
          <div className="absolute inset-0 w-full h-full bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 border border-indigo-200 dark:border-indigo-500/30 rounded-3xl p-5 sm:p-8 flex flex-col justify-between shadow-lg dark:shadow-2xl backface-hidden rotate-y-180 overflow-y-auto transition-colors duration-200">
            {/* Top row */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{currentWord.word}</span>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">({currentWord.pos})</span>
              </div>
              <button
                onClick={() => speakWord(currentWord.word)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-300 transition-colors cursor-pointer"
                title="Pronounce"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Middle Details */}
            <div className="space-y-3.5 my-auto py-2">
              {/* Uzbek Translation Card with Flag */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-3 sm:p-4">
                <div className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
                  <span className="text-sm">🇺🇿</span>
                  <span>O'zbekcha Tarjimasi:</span>
                </div>
                <div className="text-sm sm:text-lg font-black text-emerald-950 dark:text-emerald-100">
                  {currentWord.uzbek}
                </div>
              </div>

              {/* English Definition with Flag */}
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-3 sm:p-4">
                <div className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1.5">
                  <span className="text-sm">🇺🇸</span>
                  <span>College Panda Definition:</span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed font-semibold">
                  {currentWord.definition}
                </p>
              </div>

              {/* Synonyms */}
              {currentWord.synonyms.length > 0 && (
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                    Synonyms:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentWord.synonyms.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Example sentence */}
              {currentWord.example && (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 italic font-medium">
                  <span className="text-amber-600 dark:text-amber-400 font-bold not-italic mr-1.5">SAT Context:</span>
                  "{currentWord.example}"
                </div>
              )}
            </div>

            {/* Bottom hint */}
            <div className="text-center text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              Click or Swipe to flip back
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 mt-6">
        <button
          onClick={handlePrev}
          className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-3.5 px-3 sm:px-4 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs text-xs sm:text-sm"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Prev</span>
          <span className="hidden sm:inline text-slate-400 font-normal">(←)</span>
        </button>

        <button
          onClick={handleFlip}
          className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-3 sm:px-4 rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer text-xs sm:text-sm"
        >
          <RotateCw className="w-4 h-4 shrink-0" />
          <span>Flip</span>
          <span className="hidden sm:inline text-indigo-200 font-normal">(Space)</span>
        </button>

        <button
          onClick={handleNext}
          className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-3.5 px-3 sm:px-4 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs text-xs sm:text-sm"
        >
          <span>Next</span>
          <span className="hidden sm:inline text-slate-400 font-normal">(→)</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>
      </div>

      {/* Rating buttons (SM-2 Spaced Repetition) */}
      <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 text-center mb-3 uppercase tracking-wider">
          Rate recall (Spaced Repetition):
        </div>
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          <button
            onClick={() => handleNext()}
            className="py-2.5 px-1 sm:px-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center"
          >
            1. Again
          </button>
          <button
            onClick={() => handleNext()}
            className="py-2.5 px-1 sm:px-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center"
          >
            2. Hard
          </button>
          <button
            onClick={() => handleNext()}
            className="py-2.5 px-1 sm:px-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center"
          >
            3. Good
          </button>
          <button
            onClick={() => {
              sounds.playMatch();
              onToggleMaster(currentWord.id);
              handleNext();
            }}
            className="py-2.5 px-1 sm:px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center"
          >
            4. Easy
          </button>
        </div>
      </div>
    </div>
  );
};
