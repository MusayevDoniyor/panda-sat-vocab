import type { UserStats } from '../types';

const STORAGE_KEY = 'panda_sat_vocab_stats_v1';

const defaultStats: UserStats = {
  masteredIds: [],
  starredIds: [],
  unitProgress: {},
};

export const loadUserStats = (): UserStats => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStats;
    return { ...defaultStats, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load stats from localStorage:', e);
    return defaultStats;
  }
};

export const saveUserStats = (stats: UserStats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats to localStorage:', e);
  }
};
