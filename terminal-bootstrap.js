const allowed = new Set(['linux', 'docker', 'kubernetes']);
const requested = new URLSearchParams(location.search).get('mode');

// La portada de selección no necesita cargar el simulador completo.
// El motor elegido se descarga únicamente después de entrar en una sala.
if (!requested || !allowed.has(requested)) {
  document.documentElement.dataset.terminalState = 'selector';
} else {
  const mode = requested;
  performance.mark('s2ktux-terminal-load-start');
  let loadStage = 'módulos';
  try {
    const labelledImport = (label, path) => import(path).catch((error) => {
      loadStage = label;
      throw error;
    });
    const [{ default: engine }, { default: runtime }, { startTerminal }, simulation] = await Promise.all([
      labelledImport('motor de configuración', `./terminal-engine-${mode}.js?v=20260825-phase1-main`),
      labelledImport('contenido del entorno', `./terminal-runtime-${mode}.js?v=20260825-phase1-main`),
      labelledImport('núcleo de terminal', './terminal-core.js?v=20260826-phase5'),
      labelledImport('aislamiento de simulación', './terminal-worker-client.js?v=20260825-phase2').then(module=>module.createTerminalSimulationClient(mode))
    ]);
    loadStage = 'motor';
    startTerminal(engine, runtime, { simulation });
    document.documentElement.dataset.terminalEngineThread=simulation.kind;
    try {
      loadStage = 'renderizador';
      const { attachTerminalRenderer } = await import('./terminal-xterm-renderer.js?v=20260826-phase5');
      await attachTerminalRenderer();
    } catch (rendererError) {
      console.warn('Se usa el renderizador de compatibilidad de la terminal.', rendererError);
      document.documentElement.dataset.terminalRendererError = rendererError instanceof Error
        ? rendererError.message
        : String(rendererError);
    }
    document.documentElement.dataset.terminalReady = 'true';
    performance.mark('s2ktux-terminal-interactive');
    performance.measure('s2ktux-time-to-terminal-interactive','s2ktux-terminal-load-start','s2ktux-terminal-interactive');
    document.dispatchEvent(new CustomEvent('s2ktux-terminal-ready',{detail:{mode}}));
  } catch (error) {
    console.error('No se pudo cargar el motor de terminal.', error);
    document.documentElement.dataset.terminalState = 'error';
    document.documentElement.dataset.terminalError = loadStage+': '+(error instanceof Error ? (error.stack || error.message) : String(error));
    const body = document.getElementById('term-body');
    const line = document.getElementById('term-input-line');
    const input = document.getElementById('term-input');
    const prompt = document.getElementById('term-prompt');
    if (body && line) {
      const message = document.createElement('div');
      message.className = 'term-out';
      message.style.color = '#ef8a7a';
      message.textContent = 'No se pudo cargar esta máquina. Comprueba la conexión y vuelve a intentarlo.';
      body.insertBefore(message, line);
    }
    if (prompt) prompt.textContent = '';
    if (input) { input.disabled = true; input.removeAttribute('autofocus'); }
  }
}
