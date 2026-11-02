import { useState, useMemo, type FC } from 'react';
import type { VocabWord } from '../data/vocabulary';
import { speakWord } from '../utils/speech';
import { 
  Search, 
  Volume2, 
  Star, 
  CheckCircle2, 
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface WordListProps {
  words: VocabWord[];
  unitNumber: number;
  starredIds: number[];
  masteredIds: number[];
  onToggleStar: (id: number) => void;
  onToggleMaster: (id: number) => void;
}

export const WordList: FC<WordListProps> = ({
  words,
  unitNumber,
  starredIds,
  masteredIds,
  onToggleStar,
  onToggleMaster,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'starred' | 'mastered'>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredWords = useMemo(() => {
    return words.filter((w) => {
      // Filter status
      if (filterType === 'starred' && !starredIds.includes(w.id)) return false;
      if (filterType === 'mastered' && !masteredIds.includes(w.id)) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        w.word.toLowerCase().includes(q) ||
        w.uzbek.toLowerCase().includes(q) ||
        w.definition.toLowerCase().includes(q) ||
        w.synonyms.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [words, searchQuery, filterType, starredIds, masteredIds]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {unitNumber === 0 ? 'Full SAT 400 Dictionary' : `Unit ${unitNumber} Vocabulary List`}
          </h1>
          <p className="text-xs text-slate-400">
            {filteredWords.length} of {words.length} terms displayed
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 self-start sm:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({words.length})
          </button>
          <button
            onClick={() => setFilterType('starred')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
              filterType === 'starred'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>Starred</span>
          </button>
          <button
            onClick={() => setFilterType('mastered')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
              filterType === 'mastered'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Mastered</span>
          </button>
        </div>
      </div>

      {/* Live Search Input */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by English word, Uzbek translation, synonym, or definition..."
          className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-3 text-xs text-slate-500 hover:text-slate-300"
          >
            Clear
          </button>
        )}
      </div>

      {/* Word Cards List */}
      <div className="space-y-3">
        {filteredWords.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-sm">No matching words found.</p>
          </div>
        ) : (
          filteredWords.map((w) => {
            const isStarred = starredIds.includes(w.id);
            const isMastered = masteredIds.includes(w.id);
            const isExpanded = expandedId === w.id;

            return (
              <div
                key={w.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 transition-all shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Word, POS, Uzbek */}
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      #{w.id}
                    </span>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-bold text-white tracking-tight">
                          {w.word}
                        </span>
                        <span className="text-xs font-mono text-indigo-400 bg-indigo-950/40 border border-indigo-500/20 px-2 py-0.5 rounded">
                          {w.pos}
                        </span>
                        <button
                          onClick={() => speakWord(w.word)}
                          className="p-1 rounded text-slate-400 hover:text-indigo-400 transition-colors"
                          title="Pronounce"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-sm font-semibold text-emerald-400 mt-0.5">
                        {w.uzbek}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => onToggleStar(w.id)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        isStarred
                          ? 'text-amber-400 bg-amber-950/40'
                          : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800'
                      }`}
                      title="Star word"
                    >
                      <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400' : ''}`} />
                    </button>

                    <button
                      onClick={() => onToggleMaster(w.id)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        isMastered
                          ? 'text-emerald-400 bg-emerald-950/40'
                          : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-800'
                      }`}
                      title="Mark mastered"
                    >
                      <CheckCircle2 className={`w-4 h-4 ${isMastered ? 'fill-emerald-400' : ''}`} />
                    </button>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : w.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Show details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Definition */}
                <div className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed pl-11">
                  <span className="text-slate-500 font-semibold mr-1">Def:</span>
                  {w.definition}
                </div>

                {/* Expanded Details: Synonyms & SAT Example */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 pl-11 space-y-3 animate-fadeIn">
                    {w.synonyms.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold text-slate-400">Synonyms:</span>
                        {w.synonyms.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {w.example && (
                      <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-xs text-slate-300 italic">
                        <span className="text-indigo-400 font-semibold not-italic mr-1.5">SAT Context:</span>
                        "{w.example}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
