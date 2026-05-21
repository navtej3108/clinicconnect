import { useState, useEffect } from 'react';

export function useTheme() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('clinicconnect-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('clinicconnect-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return { dark, toggleTheme: () => setDark(d => !d) };
}
