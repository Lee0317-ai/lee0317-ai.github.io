function toggleTheme() {
  const r = document.documentElement;
  const next = r.dataset.theme === 'dark' ? 'light' : 'dark';
  r.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
}
window.toggleTheme = toggleTheme;
