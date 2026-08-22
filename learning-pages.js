const html = document.documentElement;
const THEME_KEY = 's2ktux-theme';

function syncThemeIcon() {
  const dark = html.classList.contains('dark');
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    const label = dark ? 'Activar tema claro' : 'Activar tema oscuro';
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
  });
}

try { if (localStorage.getItem(THEME_KEY) === 'dark') html.classList.add('dark'); } catch (_) {}

document.addEventListener('click', (event) => {
  const toggle = event.target.closest('[data-theme-toggle]');
  if (!toggle) return;
  html.classList.toggle('dark');
  try { localStorage.setItem(THEME_KEY, html.classList.contains('dark') ? 'dark' : 'light'); } catch (_) {}
  syncThemeIcon();
});

function wireCodeCopy() {
  document.querySelectorAll('.lesson-wrapper pre').forEach((pre) => {
    if (pre.closest('.codewrap')) return;
    const wrap = document.createElement('div');
    wrap.className = 'codewrap';
    pre.before(wrap);
    wrap.append(pre);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copybtn';
    button.textContent = 'Copiar';
    button.setAttribute('aria-label', 'Copiar código');
    button.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(pre.innerText); } catch (_) {
        const area = document.createElement('textarea'); area.value = pre.innerText; document.body.append(area); area.select(); document.execCommand('copy'); area.remove();
      }
      button.textContent = '✓ Copiado';
      setTimeout(() => { button.textContent = 'Copiar'; }, 1300);
    });
    wrap.append(button);
  });
}

function wireImages() {
  const images = [...document.querySelectorAll('.lesson-wrapper img')];
  images.forEach((image, index) => {
    image.decoding = 'async';
    if (index === 0) { image.loading = 'eager'; image.fetchPriority = 'high'; } else image.loading = 'lazy';
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', `Ampliar imagen${image.alt ? `: ${image.alt}` : ''}`);
  });
  if (!images.length) return;
  const lightbox = document.createElement('div');
  lightbox.id = 'img-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-hidden', 'true');
  lightbox.innerHTML = '<button type="button" aria-label="Cerrar">×</button><img alt="">';
  document.body.append(lightbox);
  let returnFocus = null;
  const close = () => { lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; returnFocus?.focus(); };
  const open = (image) => { returnFocus = image; const zoom = lightbox.querySelector('img'); zoom.src = image.currentSrc || image.src; zoom.alt = image.alt; lightbox.classList.add('open'); lightbox.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; lightbox.querySelector('button').focus(); };
  images.forEach((image) => { image.addEventListener('click', () => open(image)); image.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(image); } }); });
  lightbox.addEventListener('click', (event) => { if (event.target === lightbox || event.target.closest('button')) close(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && lightbox.classList.contains('open')) close(); });
}

function wireReadState() {
  const button = document.querySelector('[data-lesson-read]');
  if (!button) return;
  const key = button.dataset.lessonRead;
  const store = 's2ktux-read';
  const readMap = () => { try { return JSON.parse(localStorage.getItem(store) || '{}') || {}; } catch (_) { return {}; } };
  const paint = () => { const read = Boolean(readMap()[key]); button.dataset.read = String(read); button.textContent = read ? '✓ Leída' : 'Marcar como leída'; };
  button.addEventListener('click', () => { const map = readMap(); if (map[key]) delete map[key]; else map[key] = true; try { localStorage.setItem(store, JSON.stringify(map)); } catch (_) {} paint(); });
  paint();
}

function makeMobileToc() {
  const toc = document.querySelector('.lesson-toc');
  if (!toc || !matchMedia('(max-width: 820px)').matches) return;
  const details = document.createElement('details');
  details.className = 'mobile-toc';
  details.innerHTML = `<summary>Contenido de la clase</summary>${toc.querySelector('ul')?.outerHTML || ''}`;
  toc.replaceWith(details);
}

function wireSectionProgress() {
  const meter = document.querySelector('.lesson-section-meter');
  const links = [...document.querySelectorAll('.lesson-toc a,.mobile-toc a')];
  const sections = links.map((link) => document.querySelector(link.hash)).filter(Boolean);
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (meter) meter.style.width = `${max > 0 ? Math.min(100, scrollY / max * 100) : 100}%`;
    let current = sections[0];
    sections.forEach((section) => { if (section.getBoundingClientRect().top <= 150) current = section; });
    links.forEach((link) => link.setAttribute('aria-current', link.hash === `#${current?.id}` ? 'true' : 'false'));
  };
  addEventListener('scroll', update, { passive: true });
  update();
}

function wireBackTop() {
  const button = document.getElementById('backtop');
  if (!button) return;
  const update = () => button.classList.toggle('show', scrollY > 500);
  addEventListener('scroll', update, { passive: true });
  button.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  update();
}

document.addEventListener('DOMContentLoaded', () => {
  syncThemeIcon();
  makeMobileToc();
  wireCodeCopy();
  wireImages();
  wireReadState();
  wireSectionProgress();
  wireBackTop();
});
