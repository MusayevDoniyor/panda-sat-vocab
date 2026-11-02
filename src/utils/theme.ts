export type Theme = 'dark' | 'light';

export const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem('panda_sat_theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {}
  // Default to light mode as requested!
  return 'light';
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
