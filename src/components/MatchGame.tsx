import { useState, useEffect, useRef, useCallback, type FC } from 'react';
import type { VocabWord } from '../data/vocabulary';
import { speakWord } from '../utils/speech';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Zap, 
  Timer, 
  Trophy, 
  RotateCcw, 
  Flame
} from 'lucide-react';

interface MatchGameProps {
  words: VocabWord[];
  unitNumber: number;
}

interface Tile {
  id: string;
  wordId: number;
  type: 'word' | 'meaning';
  text: string;
  isMatched: boolean;
}

export const MatchGame: FC<MatchGameProps> = ({ words, unitNumber }) => {
  const [gridSize, setGridSize] = useState<4 | 6 | 8>(6);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [wrongMatchIds, setWrongMatchIds] = useState<string[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [penaltyTime, setPenaltyTime] = useState(0);
  const [showPenaltyNotice, setShowPenaltyNotice] = useState(false);
  const [combo, setCombo] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [bestTime, setBestTime] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);
  const lastMatchTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Load best time
  useEffect(() => {
    const key = `panda_match_best_${gridSize}_unit_${unitNumber}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setBestTime(parseFloat(saved));
    } else {
      setBestTime(null);
    }
  }, [unitNumber, gridSize]);

  // Setup game
  const initGame = useCallback(() => {
    if (words.length < 4) return;

    const count = Math.min(gridSize, words.length);
    const pickedWords = [...words]
      .sort(() => Math.random() - 0.5)
      .slice(0, count);

    const gameTiles: Tile[] = [];

    pickedWords.forEach((w) => {
      gameTiles.push({
        id: `w-${w.id}`,
        wordId: w.id,
        type: 'word',
        text: w.word,
        isMatched: false,
      });

      gameTiles.push({
        id: `m-${w.id}`,
        wordId: w.id,
        type: 'meaning',
        text: `${w.uzbek}\n(${w.definition})`,
        isMatched: false,
      });
    });

    // Shuffle tiles
    setTiles(gameTiles.sort(() => Math.random() - 0.5));
    setSelectedTileId(null);
    setWrongMatchIds([]);
    setMatchedCount(0);
    setTimerSeconds(0);
    setPenaltyTime(0);
    setShowPenaltyNotice(false);
    setCombo(1);
    setMaxCombo(1);
    setIsCompleted(false);

    if (timerRef.current) clearInterval(timerRef.current);
    startTimeRef.current = Date.now();
    lastMatchTimeRef.current = Date.now();

    timerRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setTimerSeconds(Math.round(elapsed * 10) / 10);
    }, 100);
  }, [words, gridSize]);

  useEffect(() => {
    initGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [initGame]);

  const handleTileClick = (clickedTile: Tile) => {
    if (clickedTile.isMatched || wrongMatchIds.length > 0) return;

    // First tile click
    if (!selectedTileId) {
      setSelectedTileId(clickedTile.id);
      sounds.playFlip();
      if (clickedTile.type === 'word') {
        const found = words.find((w) => w.id === clickedTile.wordId);
        if (found) speakWord(found.word);
      }
      return;
    }

    // Clicked same tile
    if (selectedTileId === clickedTile.id) {
      setSelectedTileId(null);
      return;
    }

    const firstTile = tiles.find((t) => t.id === selectedTileId);
    if (!firstTile) return;

    // Matching pair test
    if (firstTile.wordId === clickedTile.wordId && firstTile.type !== clickedTile.type) {
      // MATCH SUCCESS
      const now = Date.now();
      const timeSinceLast = (now - lastMatchTimeRef.current) / 1000;
      lastMatchTimeRef.current = now;

      let nextCombo = 1;
      if (timeSinceLast < 2.8) {
        nextCombo = combo + 1;
      }
      setCombo(nextCombo);
      setMaxCombo((prev) => Math.max(prev, nextCombo));

      sounds.playMatch(nextCombo);

      setTiles((prev) =>
        prev.map((t) =>
          t.wordId === clickedTile.wordId ? { ...t, isMatched: true } : t
        )
      );
      setSelectedTileId(null);

      const targetCount = Math.min(gridSize, words.length);
      setMatchedCount((prev) => {
        const next = prev + 1;
        if (next >= targetCount) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsCompleted(true);
          sounds.playVictory();
          confetti({ particleCount: 150, spread: 85, origin: { y: 0.6 } });

          const finalTotalTime = timerSeconds + penaltyTime;
          const key = `panda_match_best_${gridSize}_unit_${unitNumber}`;
          if (bestTime === null || finalTotalTime < bestTime) {
            setBestTime(finalTotalTime);
            localStorage.setItem(key, finalTotalTime.toString());
          }
        }
        return next;
      });
    } else {
      // MISMATCH
      sounds.playError();
      setCombo(1);
      setWrongMatchIds([firstTile.id, clickedTile.id]);

      setPenaltyTime((prev) => prev + 1.0);
      setShowPenaltyNotice(true);
      setTimeout(() => setShowPenaltyNotice(false), 900);

      setTimeout(() => {
        setWrongMatchIds([]);
        setSelectedTileId(null);
      }, 650);
    }
  };

  const totalEffectiveTime = (timerSeconds + penaltyTime).toFixed(1);
  const targetPairs = Math.min(gridSize, words.length);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top Header & Settings */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-gradient-to-br dark:from-purple-500/20 dark:to-indigo-500/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 shadow-md">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Speed Match</span>
              {combo >= 2 && (
                <span className="flex items-center gap-1 text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/40 px-2.5 py-0.5 rounded-full animate-pulse">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{combo}x Combo!</span>
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Match the English SAT word with its definition & Uzbek translation
            </p>
          </div>
        </div>

        {/* Controls & Metrics */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Difficulty / Grid Size Picker */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 rounded-2xl p-1 border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <span className="px-2 text-slate-500 dark:text-slate-400 hidden sm:inline">Pairs:</span>
            {[4, 6, 8].map((size) => (
              <button
                key={size}
                onClick={() => setGridSize(size as 4 | 6 | 8)}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  gridSize === size
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Live Timer with Penalty Indicator */}
          <div className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-xs">
            <Timer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-mono text-base font-black text-indigo-600 dark:text-indigo-300">
              {totalEffectiveTime}s
            </span>
            {showPenaltyNotice && (
              <span className="absolute -top-3 -right-2 bg-rose-600 text-white font-mono font-bold text-[10px] px-1.5 py-0.2 rounded-full animate-bounce shadow">
                +1.0s
              </span>
            )}
          </div>

          {/* Best Record */}
          {bestTime !== null && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold">
              <Trophy className="w-3.5 h-3.5" />
              <span>Record: {bestTime.toFixed(1)}s</span>
            </div>
          )}

          <button
            onClick={initGame}
            className="p-2 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-xs"
            title="Restart Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MATCHED PROGRESS BAR */}
      <div className="w-full bg-slate-200 dark:bg-slate-800/80 rounded-full h-1.5 mb-6 overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${(matchedCount / targetPairs) * 100}%` }}
        />
      </div>

      {/* GAME OVER CARD */}
      {isCompleted ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors duration-200">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-amber-500" />
          
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 dark:bg-gradient-to-br dark:from-emerald-500/20 dark:to-indigo-500/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-4xl mb-4 shadow-inner">
            🏆
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1">
            Phenomenal Recall!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-6 font-medium">
            All {targetPairs} pairs matched successfully in Unit {unitNumber > 0 ? unitNumber : 'Custom'}
          </p>

          {/* Stats Breakdown */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 mb-6">
            <div>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {totalEffectiveTime}s
              </div>
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Time
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-amber-500 dark:text-amber-400">
                {maxCombo}x 🔥
              </div>
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Max Combo
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {penaltyTime > 0 ? `+${penaltyTime.toFixed(0)}s` : '0s'}
              </div>
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Penalties
              </div>
            </div>
          </div>

          <button
            onClick={initGame}
            className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Next Set</span>
          </button>
        </div>
      ) : (
        /* TILES GRID */
        <div
          className={`grid gap-3.5 select-none ${
            gridSize === 4
              ? 'grid-cols-2 sm:grid-cols-4'
              : gridSize === 6
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
              : 'grid-cols-2 sm:grid-cols-4'
          }`}
        >
          {tiles.map((tile) => {
            const isSelected = selectedTileId === tile.id;
            const isWrong = wrongMatchIds.includes(tile.id);

            if (tile.isMatched) {
              return (
                <div
                  key={tile.id}
                  className="h-28 sm:h-32 rounded-2xl border border-slate-200/40 dark:border-slate-800/20 bg-slate-100/10 dark:bg-slate-900/10 opacity-0 pointer-events-none transition-all duration-500"
                />
              );
            }

            let tileClasses =
              'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-xs dark:bg-slate-850 dark:hover:bg-slate-800 dark:border-slate-750 dark:text-slate-200';

            if (isSelected) {
              tileClasses =
                'bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/40 shadow-md scale-[1.03] dark:bg-indigo-950/90 dark:border-indigo-400 dark:text-white dark:ring-indigo-500/50 dark:shadow-xl dark:shadow-indigo-500/30';
            } else if (isWrong) {
              tileClasses =
                'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-500/40 animate-shake dark:bg-rose-950/90 dark:border-rose-500 dark:text-rose-200 dark:ring-rose-500/50';
            }

            return (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile)}
                className={`h-28 sm:h-32 p-3 sm:p-4 rounded-2xl border transition-all duration-150 flex flex-col justify-center items-center text-center cursor-pointer ${tileClasses}`}
              >
                {tile.type === 'word' ? (
                  <span className="text-base sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    {tile.text}
                  </span>
                ) : (
                  <span className="text-xs sm:text-sm font-semibold leading-snug line-clamp-4 text-slate-700 dark:text-slate-200 whitespace-pre-line">
                    {tile.text}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
