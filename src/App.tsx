import { useState, useEffect, useMemo } from 'react';
import { VOCABULARY_DATA } from './data/vocabulary';
import type { VocabWord } from './data/vocabulary';
import type { StudyMode, UserStats } from './types';
import { loadUserStats, saveUserStats } from './utils/storage';
import { getInitialTheme, applyTheme, type Theme } from './utils/theme';
import { Navbar } from './components/Navbar';
import { Flashcards } from './components/Flashcards';
import { QuizLearn } from './components/QuizLearn';
import { MatchGame } from './components/MatchGame';
import { SpellingMode } from './components/SpellingMode';
import { WordList } from './components/WordList';
import { OralExamReport } from './components/OralExamReport';

export function App() {
  const [stats, setStats] = useState<UserStats>(loadUserStats);
  const [currentUnit, setCurrentUnit] = useState<number>(1);
  const [currentMode, setCurrentMode] = useState<StudyMode>('flashcards');
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Initialize theme on mount
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  // Save stats whenever they change
  useEffect(() => {
    saveUserStats(stats);
  }, [stats]);

  // Compute active words based on selected unit
  const activeWords = useMemo<VocabWord[]>(() => {
    if (currentUnit === 0) {
      return VOCABULARY_DATA;
    }
    if (currentUnit === -1) {
      return VOCABULARY_DATA.filter((w) => stats.starredIds.includes(w.id));
    }
    const start = (currentUnit - 1) * 25;
    const end = Math.min(currentUnit * 25, VOCABULARY_DATA.length);
    return VOCABULARY_DATA.slice(start, end);
  }, [currentUnit, stats.starredIds]);

  // Handlers for starring and mastering words
  const handleToggleStar = (id: number) => {
    setStats((prev) => {
      const exists = prev.starredIds.includes(id);
      const newStarred = exists
        ? prev.starredIds.filter((item) => item !== id)
        : [...prev.starredIds, id];
      return { ...prev, starredIds: newStarred };
    });
  };

  const handleToggleMaster = (id: number) => {
    setStats((prev) => {
      const exists = prev.masteredIds.includes(id);
      const newMastered = exists
        ? prev.masteredIds.filter((item) => item !== id)
        : [...prev.masteredIds, id];
      return { ...prev, masteredIds: newMastered };
    });
  };

  const handleFinishQuiz = (scorePercent: number) => {
    setStats((prev) => {
      const existing = prev.unitProgress[currentUnit] || {
        unit: currentUnit,
        bestScore: 0,
      };
      const updatedBest = Math.max(existing.bestScore, scorePercent);
      return {
        ...prev,
        unitProgress: {
          ...prev.unitProgress,
          [currentUnit]: {
            ...existing,
            bestScore: updatedBest,
            completedDate: new Date().toISOString(),
          },
        },
      };
    });
  };

  const currentUnitBestScore = stats.unitProgress[currentUnit]?.bestScore ?? null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        currentUnit={currentUnit}
        onSelectUnit={setCurrentUnit}
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        totalMastered={stats.masteredIds.length}
        totalStarred={stats.starredIds.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 py-4">
        {currentMode === 'flashcards' && (
          <Flashcards
            words={activeWords}
            starredIds={stats.starredIds}
            masteredIds={stats.masteredIds}
            onToggleStar={handleToggleStar}
            onToggleMaster={handleToggleMaster}
          />
        )}

        {currentMode === 'quiz' && (
          <QuizLearn
            words={activeWords}
            unitNumber={currentUnit}
            onFinishQuiz={handleFinishQuiz}
            onGoToOralExam={() => setCurrentMode('oral')}
            onGoToFlashcards={() => setCurrentMode('flashcards')}
          />
        )}

        {currentMode === 'match' && (
          <MatchGame
            words={activeWords}
            unitNumber={currentUnit}
          />
        )}

        {currentMode === 'spelling' && (
          <SpellingMode
            words={activeWords}
            unitNumber={currentUnit}
          />
        )}

        {currentMode === 'list' && (
          <WordList
            words={activeWords}
            unitNumber={currentUnit}
            starredIds={stats.starredIds}
            masteredIds={stats.masteredIds}
            onToggleStar={handleToggleStar}
            onToggleMaster={handleToggleMaster}
          />
        )}

        {currentMode === 'oral' && (
          <OralExamReport
            words={activeWords}
            unitNumber={currentUnit}
            latestScore={currentUnitBestScore}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950/60 py-6 text-center text-xs text-slate-500 dark:text-slate-400 print:hidden transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-medium">
          <div className="flex items-center space-x-2">
            <span>🐼 Panda SAT 400</span>
            <span>•</span>
            <span>The College Panda Vocabulary List</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">16 Units of 25 Words</span>
          </div>
          <div>
            Active Recall & Spaced Repetition • Offline LocalStorage Enabled
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
