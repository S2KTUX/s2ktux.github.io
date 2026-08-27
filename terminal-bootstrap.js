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
    const labelledImport = (label, loader) => loader().catch((error) => {
      loadStage = label;
      throw error;
    });
    const production = typeof __S2KTUX_PRODUCTION__ !== 'undefined' && __S2KTUX_PRODUCTION__;
    const importBuilt = path => import(path);
    const sourceLoaders = {
      linux:()=>Promise.all([import('./terminal-engine-linux.js?v=20260825-phase1-main'),import('./terminal-runtime-linux.js?v=20260825-phase1-main')]),
      docker:()=>Promise.all([import('./terminal-engine-docker.js?v=20260825-phase1-main'),import('./terminal-runtime-docker.js?v=20260825-phase1-main')]),
      kubernetes:()=>Promise.all([import('./terminal-engine-kubernetes.js?v=20260825-phase1-main'),import('./terminal-runtime-kubernetes.js?v=20260825-phase1-main')])
    };
    const components = production
      ? await labelledImport('paquete de producción',()=>importBuilt('./terminal-'+mode+'.min.js'))
      : await (async()=>{
          const [{default:engine},{default:runtime}]=await labelledImport('entorno seleccionado',sourceLoaders[mode]);
          const [{startTerminal},{createTerminalSimulationClient},{attachTerminalRenderer}]=await Promise.all([
            labelledImport('núcleo de terminal',()=>import('./terminal-core.js?v=20260826-phase5')),
            labelledImport('aislamiento de simulación',()=>import('./terminal-worker-client.js?v=20260825-phase2')),
            labelledImport('renderizador',()=>import('./terminal-xterm-renderer.js?v=20260826-phase5'))
          ]);
          return {engine,runtime,startTerminal,createTerminalSimulationClient,attachTerminalRenderer};
        })();
    const {engine,runtime,startTerminal,createTerminalSimulationClient,attachTerminalRenderer}=components;
    const workerUrl=production?new URL('./terminal-simulation-worker.min.js',import.meta.url):undefined;
    const simulation=await labelledImport('aislamiento de simulación',()=>createTerminalSimulationClient(mode,{workerUrl}));
    loadStage = 'motor';
    startTerminal(engine, runtime, { simulation });
    document.documentElement.dataset.terminalEngineThread=simulation.kind;
    try {
      loadStage = 'renderizador';
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
