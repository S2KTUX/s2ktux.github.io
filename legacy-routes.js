(function () {
  const routes = window.S2KTUX_LEARNING_ROUTES || {};
  const page = location.pathname.split('/').pop();
  const params = new URLSearchParams(location.search);
  let target = '';

  if (page === 'curso.html') {
    const course = params.get('c') || 'rhcsa';
    target = routes.courses && routes.courses[course];
  } else if (page === 'leccion.html') {
    const course = params.get('c') || 'rhcsa';
    const rawIndex = params.get('m') || '0';
    if (/^(?:0|[1-9]\d*)$/.test(rawIndex)) target = routes.lessons && routes.lessons[`${course}:${rawIndex}`];
  }

  if (target) location.replace(new URL(target, location.origin).href);
})();
