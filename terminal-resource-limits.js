// Límites físicos del sandbox. Mantenerlos en un módulo puro permite probarlos
// sin navegador y evita que una práctica accidental bloquee toda la pestaña.
export const TERMINAL_LIMITS = Object.freeze({
  virtualDiskBytes: 3 * 1024 * 1024,
  virtualFileBytes: 512 * 1024,
  virtualFsNodes: 4096,
  domScrollbackLines: 600,
  xtermScrollbackLines: 2500,
  pasteBytes: 64 * 1024,
  pasteLines: 200,
  inputBytes: 16 * 1024,
  processes: 256,
  jobs: 128,
  dockerImages: 64,
  dockerContainers: 64,
  dockerNetworks: 64,
  dockerVolumes: 64,
  kubernetesResources: 256,
  journalEntries: 500,
  timelineEntries: 700,
  kubernetesEvents: 500
});

export function utf8Bytes(value) {
  const text = String(value ?? '');
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(text).length;
  return Buffer.byteLength(text, 'utf8');
}

export function measureVirtualFileSystem(root) {
  const result = { bytes:0, nodes:0, files:0, directories:0, links:0 };
  const pending = root ? [root] : [];
  const seen = new Set();
  while (pending.length) {
    const node = pending.pop();
    if (!node || typeof node !== 'object' || seen.has(node)) continue;
    seen.add(node); result.nodes += 1;
    if (node.type === 'file') { result.files += 1; result.bytes += utf8Bytes(node.content); }
    else if (node.type === 'dir') { result.directories += 1; Object.values(node.children || {}).forEach(child => pending.push(child)); }
    else if (node.type === 'symlink') { result.links += 1; result.bytes += utf8Bytes(node.target); }
  }
  return result;
}

export function validateVirtualWrite(root, currentNode, nextContent, additionalNodes = 0, limits = TERMINAL_LIMITS) {
  const nextBytes = utf8Bytes(nextContent);
  if (nextBytes > limits.virtualFileBytes) return { ok:false, reason:'file', message:'El fichero excede el tamaño máximo del sandbox' };
  const usage = measureVirtualFileSystem(root);
  const currentBytes = currentNode?.type === 'file' ? utf8Bytes(currentNode.content) : 0;
  if (usage.nodes + additionalNodes > limits.virtualFsNodes) return { ok:false, reason:'nodes', message:'No queda espacio en el dispositivo' };
  if (usage.bytes - currentBytes + nextBytes > limits.virtualDiskBytes) return { ok:false, reason:'disk', message:'No queda espacio en el dispositivo' };
  return { ok:true, usage, nextBytes };
}

export function trimCollection(collection, maximum) {
  if (!Array.isArray(collection) || collection.length <= maximum) return collection;
  collection.splice(0, collection.length - maximum);
  return collection;
}

export function countKubernetesResources(state) {
  if (!state || typeof state !== 'object') return 0;
  return ['pods','deployments','replicasets','services','configmaps','secrets','namespaces','nodes','daemonsets','statefulsets','jobs','cronjobs','hpas','pvs','pvcs','storageclasses','roles','rolebindings','clusterroles','clusterrolebindings']
    .reduce((total, key) => total + (Array.isArray(state[key]) ? state[key].length : 0), 0);
}

export function validatePaste(value, limits = TERMINAL_LIMITS) {
  const text = String(value ?? '');
  const lines = text ? text.split('\n').length : 0;
  if (utf8Bytes(text) > limits.pasteBytes) return { ok:false, reason:'bytes' };
  if (lines > limits.pasteLines) return { ok:false, reason:'lines' };
  return { ok:true, lines };
}
