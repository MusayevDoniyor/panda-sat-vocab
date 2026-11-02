export type Theme = 'dark' | 'light';

export const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem('panda_sat_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  } catch {}
  return 'dark';
};

export const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  try {
    localStorage.setItem('panda_sat_theme', theme);
  } catch {}
};
