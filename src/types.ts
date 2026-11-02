import type { VocabWord } from './data/vocabulary';

export type StudyMode = 'flashcards' | 'quiz' | 'match' | 'spelling' | 'list' | 'oral';

export interface QuizQuestion {
  word: VocabWord;
  prompt: string;
  type: 'en-to-uz' | 'uz-to-en';
  options: {
    id: number;
    text: string;
    isCorrect: boolean;
  }[];
}

export interface UnitProgress {
  unit: number;
  bestScore: number; // percentage
  completedDate?: string;
  matchBestTime?: number; // seconds
}

export interface UserStats {
  masteredIds: number[];
  starredIds: number[];
  unitProgress: Record<number, UnitProgress>;
}
