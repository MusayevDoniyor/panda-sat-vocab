import { useState, type ReactNode, type FC } from 'react';
import type { StudyMode } from '../types';
import type { Theme } from '../utils/theme';
import { sounds } from '../utils/audio';
import { 
  BookOpen, 
  Layers, 
  HelpCircle, 
  Zap, 
  PenTool, 
  Award, 
  Star, 
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Volume2,
  VolumeX,
  Sun,
  Moon
} from 'lucide-react';

interface NavbarProps {
  currentUnit: number;
  onSelectUnit: (unit: number) => void;
  currentMode: StudyMode;
  onSelectMode: (mode: StudyMode) => void;
  totalMastered: number;
  totalStarred: number;
  theme: Theme;
  onToggleTheme: () => void;
}

export const Navbar: FC<NavbarProps> = ({
  currentUnit,
  onSelectUnit,
  currentMode,
  onSelectMode,
  totalMastered,
  totalStarred,
  theme,
  onToggleTheme,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(sounds.enabled);

  const handleToggleSound = () => {
    const newState = sounds.toggleSound();
    setSoundEnabled(newState);
  };

  const handlePrevUnit = () => {
    if (currentUnit <= 1) {
      onSelectUnit(16);
    } else {
      onSelectUnit(currentUnit - 1);
    }
  };

  const handleNextUnit = () => {
    if (currentUnit >= 16 || currentUnit <= 0) {
      onSelectUnit(1);
    } else {
      onSelectUnit(currentUnit + 1);
    }
  };

  const getUnitLabel = (u: number) => {
    if (u === 0) return 'All 400 Words';
    if (u === -1) return `Starred (${totalStarred})`;
    const start = (u - 1) * 25 + 1;
    const end = Math.min(u * 25, 400);
    return `Unit ${u} (${start}–${end})`;
  };

  const navItems: { mode: StudyMode; label: string; icon: ReactNode }[] = [
    { mode: 'flashcards', label: 'Flashcards', icon: <Layers className="w-4 h-4" /> },
    { mode: 'quiz', label: 'Quiz / Learn', icon: <HelpCircle className="w-4 h-4" /> },
    { mode: 'match', label: 'Speed Match', icon: <Zap className="w-4 h-4" /> },
    { mode: 'spelling', label: 'Spelling & Scramble', icon: <PenTool className="w-4 h-4" /> },
    { mode: 'list', label: 'Word List', icon: <BookOpen className="w-4 h-4" /> },
    { mode: 'oral', label: 'Teacher Oral Exam', icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-50 transition-colors duration-200 shadow-xs">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 text-2xl select-none">
            🐼
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                Panda SAT 400
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
                Digital SAT
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
              College Panda 400 Vocabulary • 25 Words per Lesson
            </p>
          </div>
        </div>

        {/* Center: Quick Unit Stepper & Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          {/* Prev Unit Button */}
          <button
            onClick={handlePrevUnit}
            title="Previous Unit"
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-white transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Unit Dropdown Button (Fixed Dark & Light background contrast) */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-900 dark:text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition-all cursor-pointer"
            >
              <span className="font-bold">{getUnitLabel(currentUnit)}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </button>

            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setDropdownOpen(false)} 
                />
                <div className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 mt-2 w-72 max-h-96 overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl z-50 p-2 divide-y divide-slate-100 dark:divide-slate-700">
                  <div className="pb-1.5 space-y-1">
                    <button
                      onClick={() => { onSelectUnit(0); setDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer ${
                        currentUnit === 0 
                          ? 'bg-indigo-600 text-white' 
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        All 400 Words
                      </span>
                      <span className="text-[10px] opacity-75">Full Course</span>
                    </button>
                    <button
                      onClick={() => { onSelectUnit(-1); setDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer ${
                        currentUnit === -1 
                          ? 'bg-amber-600 text-white' 
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        Starred Words
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-900 font-bold">
                        {totalStarred}
                      </span>
                    </button>
                  </div>

                  <div className="pt-2 space-y-0.5">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                      Teacher Units (25 words each)
                    </div>
                    <div className="grid grid-cols-2 gap-1 pt-1">
                      {Array.from({ length: 16 }, (_, i) => i + 1).map((u) => {
                        const start = (u - 1) * 25 + 1;
                        const end = Math.min(u * 25, 400);
                        const isSelected = currentUnit === u;
                        return (
                          <button
                            key={u}
                            onClick={() => { onSelectUnit(u); setDropdownOpen(false); }}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-indigo-600 text-white shadow-xs' 
                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            <span>Unit {u}</span>
                            <span className="text-[10px] opacity-60 font-mono">#{start}-{end}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Next Unit Button */}
          <button
            onClick={handleNextUnit}
            title="Next Unit"
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-white transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Suite: Theme, Sound, PDF, Mastered Badge */}
        <div className="flex items-center space-x-2">
          {/* Mastered Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{totalMastered} / 400 Mastered</span>
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-xl border transition-all cursor-pointer shadow-xs ${
              soundEnabled
                ? 'border-indigo-200 dark:border-indigo-500/40 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            title={soundEnabled ? 'Sound Effects Enabled (Click to Mute)' : 'Sound Effects Muted (Click to Unmute)'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Original College Panda PDF Link */}
          <a
            href="/College_Panda_400_SAT_Words.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
            title="Download Original College Panda PDF"
          >
            <FileDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>PDF</span>
          </a>
        </div>
      </div>

      {/* Bottom Mode Navigation Tabs */}
      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-1.5 py-1.5 no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentMode === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => onSelectMode(item.mode)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-[1.01]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.mode === 'oral' && (
                  <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-md bg-amber-400/20 text-amber-700 dark:text-amber-300 font-extrabold uppercase">
                    Oral
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
