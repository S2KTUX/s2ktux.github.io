const allowed = new Set(['linux', 'docker', 'kubernetes']);
const requested = new URLSearchParams(location.search).get('mode');

// La portada de selección no necesita cargar el simulador completo.
// El motor elegido se descarga únicamente después de entrar en una sala.
if (!requested || !allowed.has(requested)) {
  document.documentElement.dataset.terminalState = 'selector';
} else {
  const mode = requested;

  const [{ default: engine }, { startTerminal }] = await Promise.all([
    import(`./terminal-engine-${mode}.js`),
    import('./terminal-core.js')
  ]);

  startTerminal(engine);
}
