import { useState, useEffect, useCallback, type FC } from 'react';
import type { VocabWord } from '../data/vocabulary';
import { speakWord } from '../utils/speech';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  XCircle, 
  Flame, 
  ArrowRight, 
  RotateCcw, 
  Award, 
  Volume2, 
  Sparkles
} from 'lucide-react';

interface QuizLearnProps {
  words: VocabWord[];
  unitNumber: number;
  onFinishQuiz: (scorePercent: number) => void;
  onGoToOralExam: () => void;
  onGoToFlashcards: () => void;
}

interface Question {
  targetWord: VocabWord;
  promptType: 'word-to-uzbek' | 'uzbek-to-word';
  options: {
    id: number;
    text: string;
    isCorrect: boolean;
    wordObj: VocabWord;
    hidden?: boolean;
  }[];
}

export const QuizLearn: FC<QuizLearnProps> = ({
  words,
  unitNumber,
  onFinishQuiz,
  onGoToOralExam,
  onGoToFlashcards,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [incorrectWords, setIncorrectWords] = useState<VocabWord[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [usedLifeline, setUsedLifeline] = useState(false);

  // Generate quiz questions with POS-aligned smart distractors
  const generateQuestions = useCallback(() => {
    if (words.length === 0) return;

    const shuffledTargets = [...words].sort(() => Math.random() - 0.5);
    const newQuestions: Question[] = shuffledTargets.map((target) => {
      const promptType = Math.random() > 0.4 ? 'word-to-uzbek' : 'uzbek-to-word';

      // Smart distractor selection: prioritize same POS if available
      const samePos = words.filter((w) => w.id !== target.id && w.pos === target.pos);
      const otherWords = words.filter((w) => w.id !== target.id && w.pos !== target.pos);

      const candidateDistractors = [
        ...samePos.sort(() => Math.random() - 0.5),
        ...otherWords.sort(() => Math.random() - 0.5),
      ];

      const distractors = candidateDistractors.slice(0, 3);
      const allChoices = [target, ...distractors].sort(() => Math.random() - 0.5);

      const options = allChoices.map((c, i) => {
        const isCorrect = c.id === target.id;
        const text =
          promptType === 'word-to-uzbek'
            ? `${c.uzbek} — "${c.definition}"`
            : `${c.word} (${c.pos})`;
        return { id: i, text, isCorrect, wordObj: c, hidden: false };
      });

      return {
        targetWord: target,
        promptType,
        options,
      };
    });

    setQuestions(newQuestions);
    setCurrentIdx(0);
    setSelectedOptionIdx(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setIncorrectWords([]);
    setIsFinished(false);
    setUsedLifeline(false);
  }, [words]);

  useEffect(() => {
    generateQuestions();
  }, [generateQuestions]);

  const currentQ = questions[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered || !currentQ || currentQ.options[idx].hidden) return;

    setSelectedOptionIdx(idx);
    setIsAnswered(true);

    const isCorrect = currentQ.options[idx].isCorrect;
    speakWord(currentQ.targetWord.word);

    if (isCorrect) {
      sounds.playMatch(streak + 1);
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
    } else {
      sounds.playError();
      setStreak(0);
      setIncorrectWords((prev) => [...prev, currentQ.targetWord]);
    }
  };

  const handle5050Lifeline = () => {
    if (usedLifeline || isAnswered || !currentQ) return;
    setUsedLifeline(true);
    sounds.playFlip();

    // Hide 2 incorrect options
    const incorrectIndices = currentQ.options
      .map((opt, i) => (opt.isCorrect ? -1 : i))
      .filter((i) => i !== -1)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    setQuestions((prev) => {
      const copy = [...prev];
      copy[currentIdx] = {
        ...copy[currentIdx],
        options: copy[currentIdx].options.map((opt, i) =>
          incorrectIndices.includes(i) ? { ...opt, hidden: true } : opt
        ),
      };
      return copy;
    });
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOptionIdx(null);
      setIsAnswered(false);
      setUsedLifeline(false);
      sounds.playFlip();
    } else {
      setIsFinished(true);
      const finalScorePct = Math.round(
        ((score + (currentQ?.options[selectedOptionIdx!]?.isCorrect ? 1 : 0)) / questions.length) * 100
      );
      onFinishQuiz(finalScorePct);
      if (finalScorePct >= 80) {
        sounds.playVictory();
        confetti({
          particleCount: 120,
          spread: 75,
          origin: { y: 0.6 },
        });
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished || !currentQ) return;

      if (!isAnswered) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const idx = parseInt(e.key) - 1;
          if (idx < currentQ.options.length) {
            handleSelectOption(idx);
          }
        } else if (e.key.toLowerCase() === 'h') {
          handle5050Lifeline();
        }
      } else {
        if (e.key === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!currentQ && !isFinished) {
    return (
      <div className="text-center py-20 text-slate-400">
        Loading quiz questions...
      </div>
    );
  }

  // FINISHED STATE / RESULTS CARD
  if (isFinished) {
    const totalQ = questions.length;
    const finalPct = Math.round((score / totalQ) * 100);
    const isPassing = finalPct >= 80;

    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-4xl mb-4 shadow-inner">
            {finalPct >= 95 ? '🏆' : finalPct >= 80 ? '🌟' : '📚'}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
            {finalPct === 100 ? 'Flawless 100% Mastery!' : finalPct >= 80 ? 'Ready for Oral Exam!' : 'Keep Practicing!'}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-6">
            Unit {unitNumber > 0 ? unitNumber : 'Custom'} Quiz Completed
          </p>

          {/* Score Box */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 mb-6">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-400">{score}/{totalQ}</div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Score</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">{finalPct}%</div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Accuracy</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400">{maxStreak}🔥</div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Max Streak</div>
            </div>
          </div>

          {/* Oral Exam Ready Recommendation */}
          <div className={`p-4 rounded-2xl text-left border mb-6 ${
            isPassing 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' 
              : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
          }`}>
            <div className="font-bold text-sm flex items-center gap-2 mb-1">
              <Award className="w-4 h-4" />
              <span>{isPassing ? 'Oral Exam Recommendation: Ready!' : 'Review Missed Words'}</span>
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              {isPassing
                ? 'Your recall is sharp and ready for testing! Open the Teacher Oral Exam tab to inspect your official report sheet or send it to your teacher.'
                : `You missed ${incorrectWords.length} words. Review flashcards or retake the test to reach 80% before testing orally.`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={onGoToOralExam}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Award className="w-4 h-4" />
              <span>Show Teacher Oral Exam Sheet & Certificate</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={generateQuestions}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>
              <button
                onClick={onGoToFlashcards}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Practice Cards</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Quiz Header Bar */}
      <div className="flex items-center justify-between gap-4 mb-4 text-xs font-semibold">
        <div className="flex items-center gap-2 text-slate-400">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <span className="text-slate-600">•</span>
          <span className="text-indigo-400 font-mono">Word #{currentQ.targetWord.id}</span>
        </div>

        <div className="flex items-center gap-3">
          {streak >= 2 && (
            <span className="flex items-center gap-1 text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{streak} Streak!</span>
            </span>
          )}

          {/* 50/50 Lifeline Button */}
          {!isAnswered && (
            <button
              onClick={handle5050Lifeline}
              disabled={usedLifeline}
              title="50/50 Lifeline (Press H)"
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                usedLifeline
                  ? 'bg-slate-800/40 border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-purple-950/60 border-purple-500/30 text-purple-300 hover:bg-purple-900/60'
              }`}
            >
              50:50
            </button>
          )}

          <span className="text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/30">
            Score: {score}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-1.5 mb-6 overflow-hidden">
        <div
          className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {currentQ.promptType === 'word-to-uzbek'
              ? 'Select the correct Uzbek meaning & definition:'
              : 'Select the correct English SAT word:'}
          </span>
          <button
            onClick={() => speakWord(currentQ.targetWord.word)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 transition-colors cursor-pointer"
            title="Pronounce target word"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Prompt Word / Meaning */}
        <div className="mb-6">
          {currentQ.promptType === 'word-to-uzbek' ? (
            <div className="flex items-baseline gap-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {currentQ.targetWord.word}
              </h2>
              <span className="text-xs font-mono text-indigo-400 bg-indigo-950/40 border border-indigo-500/30 px-2 py-0.5 rounded">
                {currentQ.targetWord.pos}
              </span>
            </div>
          ) : (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                O'zbekcha:
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {currentQ.targetWord.uzbek}
              </h2>
              <p className="text-slate-300 text-sm italic">
                "{currentQ.targetWord.definition}"
              </p>
            </div>
          )}
        </div>

        {/* 4 Choices */}
        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            if (opt.hidden) {
              return (
                <div
                  key={idx}
                  className="h-14 rounded-2xl border border-slate-800/40 bg-slate-900/30 opacity-30 flex items-center px-4 text-xs text-slate-600 font-mono select-none"
                >
                  [Eliminated by 50/50]
                </div>
              );
            }

            let optionStyles = 'bg-slate-800/80 hover:bg-slate-750 border-slate-700 text-slate-200';

            if (isAnswered) {
              if (opt.isCorrect) {
                optionStyles = 'bg-emerald-950/80 border-emerald-500 text-emerald-100 shadow-md shadow-emerald-500/20';
              } else if (idx === selectedOptionIdx) {
                optionStyles = 'bg-rose-950/80 border-rose-500 text-rose-100 shadow-md shadow-rose-500/20';
              } else {
                optionStyles = 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${optionStyles}`}
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium leading-relaxed">{opt.text}</span>
                </div>

                {isAnswered && (
                  <div className="shrink-0 pt-0.5">
                    {opt.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : idx === selectedOptionIdx ? (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Answer Breakdown / SAT Context */}
        {isAnswered && (
          <div className="mt-6 pt-5 border-t border-slate-800 space-y-3 animate-fadeIn">
            <div className="bg-slate-800/70 rounded-2xl p-4 border border-slate-700/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-400">Word Review:</span>
                <span className="text-[11px] font-mono text-slate-400">ID #{currentQ.targetWord.id}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-2">
                <strong className="text-white">{currentQ.targetWord.word}</strong>: {currentQ.targetWord.definition}
              </p>
              <p className="text-xs text-emerald-300 font-semibold mb-2">
                O'zbekcha: {currentQ.targetWord.uzbek}
              </p>
              {currentQ.targetWord.example && (
                <p className="text-xs text-slate-400 italic">
                  "{currentQ.targetWord.example}"
                </p>
              )}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>{currentIdx + 1 < questions.length ? 'Next Question' : 'View Results'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-slate-500">
        Keys: 1, 2, 3, 4 to choose • H for 50/50 • Enter to advance
      </div>
    </div>
  );
};
