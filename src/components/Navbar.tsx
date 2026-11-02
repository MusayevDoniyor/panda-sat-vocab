import { useState } from 'react';
import type { ReactNode, FC } from 'react';
import type { StudyMode } from '../types';
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
  FileDown,
  Volume2,
  VolumeX
} from 'lucide-react';

interface NavbarProps {
  currentUnit: number; // 0 means all, -1 means starred
  onSelectUnit: (unit: number) => void;
  currentMode: StudyMode;
  onSelectMode: (mode: StudyMode) => void;
  totalMastered: number;
  totalStarred: number;
}

export const Navbar: FC<NavbarProps> = ({
  currentUnit,
  onSelectUnit,
  currentMode,
  onSelectMode,
  totalMastered,
  totalStarred,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(sounds.enabled);

  const handleToggleSound = () => {
    const newState = sounds.toggleSound();
    setSoundEnabled(newState);
  };

  const getUnitLabel = (u: number) => {
    if (u === 0) return 'All 400 Words';
    if (u === -1) return `Starred Words (${totalStarred})`;
    const start = (u - 1) * 25 + 1;
    const end = Math.min(u * 25, 400);
    return `Unit ${u} (${start}–${end})`;
  };

  const navItems: { mode: StudyMode; label: string; icon: ReactNode }[] = [
    { mode: 'flashcards', label: 'Flashcards', icon: <Layers className="w-4 h-4" /> },
    { mode: 'quiz', label: 'Quiz / Learn', icon: <HelpCircle className="w-4 h-4" /> },
    { mode: 'match', label: 'Match Game', icon: <Zap className="w-4 h-4" /> },
    { mode: 'spelling', label: 'Spelling', icon: <PenTool className="w-4 h-4" /> },
    { mode: 'list', label: 'Word List', icon: <BookOpen className="w-4 h-4" /> },
    { mode: 'oral', label: 'Teacher Oral Exam', icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-2xl">
            🐼
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg text-white tracking-tight">Panda SAT 400</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Digital SAT
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              College Panda 400 High-Frequency Vocabulary with Uzbek Definitions
            </p>
          </div>
        </div>

        {/* Unit Selector & Global Stats */}
        <div className="flex items-center space-x-3">
          {/* Unit Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700/80 text-slate-100 text-sm font-semibold px-3.5 py-2 rounded-xl border border-slate-700 shadow-sm transition-all cursor-pointer"
            >
              <span>{getUnitLabel(currentUnit)}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setDropdownOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-64 max-h-96 overflow-y-auto bg-slate-800 rounded-xl border border-slate-700 shadow-2xl z-50 p-2 divide-y divide-slate-700/50">
                  <div className="pb-1.5 space-y-1">
                    <button
                      onClick={() => { onSelectUnit(0); setDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between ${
                        currentUnit === 0 ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        All 400 Words
                      </span>
                      <span className="text-[10px] opacity-75">Full Course</span>
                    </button>
                    <button
                      onClick={() => { onSelectUnit(-1); setDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between ${
                        currentUnit === -1 ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        Starred Words
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900/50">{totalStarred}</span>
                    </button>
                  </div>

                  <div className="pt-1.5 space-y-0.5">
                    <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Teacher Units (25 words each)
                    </div>
                    {Array.from({ length: 16 }, (_, i) => i + 1).map((u) => {
                      const start = (u - 1) * 25 + 1;
                      const end = Math.min(u * 25, 400);
                      return (
                        <button
                          key={u}
                          onClick={() => { onSelectUnit(u); setDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                            currentUnit === u ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700/60'
                          }`}
                        >
                          <span>Unit {u}</span>
                          <span className="text-[11px] text-slate-400">#{start}–#{end}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mastered Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{totalMastered} / 400 Mastered</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-indigo-400 hover:bg-slate-750'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={soundEnabled ? 'Sound Effects Enabled (Click to Mute)' : 'Sound Effects Muted (Click to Unmute)'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Original PDF Link */}
          <a
            href="/College_Panda_400_SAT_Words.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
            title="Open Original College Panda PDF"
          >
            <FileDown className="w-3.5 h-3.5 text-indigo-400" />
            <span>PDF</span>
          </a>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-1 py-1 no-scrollbar">
        {navItems.map((item) => {
          const isActive = currentMode === item.mode;
          return (
            <button
              key={item.mode}
              onClick={() => onSelectMode(item.mode)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.mode === 'oral' && (
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 font-bold">
                  Teacher
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
