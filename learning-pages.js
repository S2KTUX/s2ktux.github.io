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
  const sections = links.map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1)))).filter(Boolean);
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

function youtubeId(url) {
  try {
    const parsed = new URL(url, location.href);
    if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1).split('/')[0];
    if (parsed.hostname.endsWith('youtube.com')) return parsed.searchParams.get('v') || parsed.pathname.split('/embed/')[1]?.split('/')[0];
  } catch (_) {}
  return '';
}

function wireYouTubeFacades() {
  document.querySelectorAll('a.video-card[href*="youtu"]').forEach((facade) => {
    const id = youtubeId(facade.href);
    if (!/^[\w-]{11}$/.test(id)) return;
    facade.classList.add('youtube-facade');
    facade.removeAttribute('target');
    facade.dataset.youtubeId = id;
    facade.setAttribute('aria-label', `${facade.textContent.trim()}. Reproducir vídeo de YouTube`);
    facade.addEventListener('click', (event) => {
      event.preventDefault();
      const frame = document.createElement('iframe');
      frame.className = 'youtube-embed';
      frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
      frame.title = facade.textContent.trim();
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.allowFullscreen = true;
      facade.replaceWith(frame);
      frame.focus();
    }, { once: true });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  makeMobileToc();
  wireCodeCopy();
  wireImages();
  wireSectionProgress();
  wireBackTop();
  wireYouTubeFacades();
});
