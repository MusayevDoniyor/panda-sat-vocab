import { useState, useEffect, useRef, type FC } from 'react';
import type { VocabWord } from '../data/vocabulary';
import { speakWord } from '../utils/speech';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  PenTool, 
  Check, 
  ArrowRight, 
  Eye, 
  Volume2
} from 'lucide-react';

interface SpellingModeProps {
  words: VocabWord[];
  unitNumber: number;
}

export const SpellingMode: FC<SpellingModeProps> = ({ words, unitNumber }) => {
  const [modeType, setModeType] = useState<'scramble' | 'type'>('scramble');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [scrambleLetters, setScrambleLetters] = useState<{ id: number; char: string; used: boolean }[]>([]);
  const [selectedLetterIds, setSelectedLetterIds] = useState<number[]>([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect' | 'revealed'>('idle');
  const [score, setScore] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const currentWord = words[currentIndex];

  useEffect(() => {
    if (!currentWord) return;
    const cleanWord = currentWord.word.toLowerCase().replace(/[^a-z]/g, '');
    const letterObjects = cleanWord
      .split('')
      .map((char, id) => ({ id, char, used: false }))
      .sort(() => Math.random() - 0.5);

    setScrambleLetters(letterObjects);
    setSelectedLetterIds([]);
    setUserInput('');
    setStatus('idle');
  }, [currentWord, modeType]);

  useEffect(() => {
    if (modeType === 'type') {
      inputRef.current?.focus();
    }
  }, [currentIndex, status, modeType]);

  if (!currentWord) {
    return <div className="text-center py-20 text-slate-400">No words available.</div>;
  }

  const cleanTarget = currentWord.word.toLowerCase().replace(/[^a-z]/g, '');

  const handleTileClick = (letterObj: { id: number; char: string; used: boolean }) => {
    if (status !== 'idle' || letterObj.used) return;

    sounds.playFlip();
    const nextSelected = [...selectedLetterIds, letterObj.id];
    setSelectedLetterIds(nextSelected);

    setScrambleLetters((prev) =>
      prev.map((l) => (l.id === letterObj.id ? { ...l, used: true } : l))
    );

    const formedWord = nextSelected
      .map((id) => scrambleLetters.find((l) => l.id === id)?.char || '')
      .join('');

    setUserInput(formedWord);

    if (formedWord.length === cleanTarget.length) {
      if (formedWord === cleanTarget) {
        setStatus('correct');
        sounds.playMatch();
        setScore((prev) => prev + 1);
        speakWord(currentWord.word);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } else {
        setStatus('incorrect');
        sounds.playError();
      }
    }
  };

  const handleBackspaceTile = () => {
    if (selectedLetterIds.length === 0 || status === 'correct') return;

    sounds.playFlip();
    const lastId = selectedLetterIds[selectedLetterIds.length - 1];
    setSelectedLetterIds((prev) => prev.slice(0, -1));

    setScrambleLetters((prev) =>
      prev.map((l) => (l.id === lastId ? { ...l, used: false } : l))
    );

    const nextWord = selectedLetterIds
      .slice(0, -1)
      .map((id) => scrambleLetters.find((l) => l.id === id)?.char || '')
      .join('');

    setUserInput(nextWord);
    setStatus('idle');
  };

  const handleTypeCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (status !== 'idle') return;

    const cleanInput = userInput.trim().toLowerCase().replace(/[^a-z]/g, '');

    if (cleanInput === cleanTarget) {
      setStatus('correct');
      sounds.playMatch();
      setScore((prev) => prev + 1);
      speakWord(currentWord.word);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } else {
      setStatus('incorrect');
      sounds.playError();
    }
  };

  const handleReveal = () => {
    setStatus('revealed');
    sounds.playFlip();
    speakWord(currentWord.word);
  };

  const handleNext = () => {
    setUserInput('');
    setStatus('idle');
    sounds.playFlip();
    setCurrentIndex((prev) => (prev + 1) % words.length);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-6">
        <div className="flex items-center gap-2">
          <PenTool className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Word {currentIndex + 1} of {words.length}</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="text-indigo-600 dark:text-indigo-400">Unit {unitNumber > 0 ? unitNumber : 'Set'}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setModeType('scramble')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                modeType === 'scramble'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Scramble
            </button>
            <button
              onClick={() => setModeType('type')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                modeType === 'type'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Typing
            </button>
          </div>

          <div className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-500/30">
            Accuracy: {score}
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg dark:shadow-2xl transition-colors duration-200">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          {modeType === 'scramble'
            ? 'Assemble the scrambled letters to spell the SAT word:'
            : 'Recall & type the English SAT word:'}
        </div>

        {/* Prompt Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 mb-6">
          <div className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
            <span className="text-sm">🇺🇿</span>
            <span>O'zbekcha Ma'nosi:</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
            {currentWord.uzbek}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 italic mb-3 font-medium flex items-center gap-1.5">
            <span className="not-italic text-sm">🇺🇸</span>
            <span>"{currentWord.definition}"</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 flex-wrap">
            <span className="bg-slate-200/80 dark:bg-slate-700/60 px-2 py-0.5 rounded-lg">
              POS: {currentWord.pos}
            </span>
            <span className="bg-slate-200/80 dark:bg-slate-700/60 px-2 py-0.5 rounded-lg">
              Length: {cleanTarget.length} letters
            </span>
            <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-500/20">
              Hint: starts with "{currentWord.word[0].toUpperCase()}"
            </span>
          </div>
        </div>

        {/* SCRAMBLE TILE MODE */}
        {modeType === 'scramble' ? (
          <div className="space-y-6">
            {/* Formed Word Slots */}
            <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap min-h-12 py-2">
              {Array.from({ length: cleanTarget.length }).map((_, i) => {
                const char = userInput[i] || '';
                return (
                  <div
                    key={i}
                    className={`w-8 h-10 sm:w-11 sm:h-13 rounded-xl border-2 flex items-center justify-center font-mono text-base sm:text-xl font-black uppercase transition-all ${
                      char
                        ? status === 'correct'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200'
                          : status === 'incorrect'
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200'
                          : 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>

            {/* Letter Tiles to Click */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
              {scrambleLetters.map((l) => (
                <button
                  key={l.id}
                  disabled={l.used || status === 'correct'}
                  onClick={() => handleTileClick(l)}
                  className={`w-9 h-11 sm:w-12 sm:h-14 rounded-2xl font-mono text-base sm:text-lg font-black uppercase transition-all duration-150 cursor-pointer shadow-xs ${
                    l.used
                      ? 'opacity-20 scale-95 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      : 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-800 dark:text-white hover:scale-105 active:scale-95 shadow-xs'
                  }`}
                >
                  {l.char}
                </button>
              ))}
            </div>

            {/* Scramble Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleBackspaceTile}
                disabled={selectedLetterIds.length === 0 || status === 'correct'}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 cursor-pointer disabled:opacity-40 transition-all"
              >
                ⌫ Backspace
              </button>

              <button
                type="button"
                onClick={handleReveal}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Reveal</span>
              </button>
            </div>
          </div>
        ) : (
          /* TYPE MODE */
          <form onSubmit={handleTypeCheck} className="space-y-4">
            <div>
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={status !== 'idle'}
                placeholder={`Type "${currentWord.word[0]}..."`}
                className={`w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border text-slate-900 dark:text-white font-mono text-lg focus:outline-none focus:ring-2 transition-all ${
                  status === 'correct'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20'
                    : status === 'incorrect' || status === 'revealed'
                    ? 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-50 dark:bg-rose-950/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/30'
                }`}
              />
            </div>

            <div className="flex gap-2.5">
              {status === 'idle' ? (
                <>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    Check Spelling
                  </button>
                  <button
                    type="button"
                    onClick={handleReveal}
                    className="py-3.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Reveal</span>
                  </button>
                </>
              ) : null}
            </div>
          </form>
        )}

        {/* FEEDBACK & NEXT BUTTON */}
        {status !== 'idle' && (
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
            {status === 'correct' ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Correct spelling!
                </span>
                <button
                  type="button"
                  onClick={() => speakWord(currentWord.word)}
                  className="p-1 rounded-lg bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-200 text-xs sm:text-sm space-y-1">
                <div className="text-[11px] text-rose-600 dark:text-rose-300 font-bold">
                  {status === 'revealed' ? 'Revealed Word:' : 'Correct Spelling:'}
                </div>
                <div className="text-lg font-mono font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>{currentWord.word}</span>
                  <button
                    type="button"
                    onClick={() => speakWord(currentWord.word)}
                    className="p-1 rounded-lg bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Next Word</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
