const THEME_KEY = 's2ktux-theme';
const root = document.documentElement;

function syncThemeControls() {
  const dark = root.classList.contains('dark');
  const label = dark ? 'Activar tema claro' : 'Activar tema oscuro';
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
  });
}

document.addEventListener('click', (event) => {
  const button = event.target.closest?.('[data-theme-toggle]');
  if (!button) return;
  event.preventDefault();
  root.classList.toggle('dark');
  try {
    localStorage.setItem(THEME_KEY, root.classList.contains('dark') ? 'dark' : 'light');
  } catch (_) {}
  syncThemeControls();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', syncThemeControls, { once: true });
} else {
  syncThemeControls();
}
