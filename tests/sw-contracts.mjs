import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../sw.js', import.meta.url), 'utf8');

for (const asset of [
  'site-shell.css?v=20260826-phase3',
  'visual-system.css?v=20260826-phase3',
  'site-shell.js?v=20260826-phase3',
  'fonts.css?v=20260822-local',
  'assets/fonts/press-start-2p-latin-400.woff2',
  'manifest.webmanifest',
  'assets/icon-192.png'
]) {
  assert.ok(source.includes(`'${asset}'`), `Missing offline dependency: ${asset}`);
}

for (const onDemandAsset of [
  'courses-data.js',
  'terminal-bootstrap.js',
  'terminal-shell-parser.js',
  'terminal-core.js',
  'terminal-command-schema.js',
  'terminal-virtual-fs.js',
  'terminal-process-state.js',
  'terminal-resource-limits.js',
  'terminal-network-state.js',
  'terminal-worker-client.js',
  'terminal-worker-protocol.js',
  'terminal-simulation-worker.js',
  'terminal-engine-linux.js',
  'terminal-engine-docker.js',
  'terminal-engine-kubernetes.js',
  'terminal-runtime-linux.js',
  'terminal-runtime-docker.js',
  'terminal-runtime-kubernetes.js',
  'terminal-xterm-renderer.js',
  'vendor/xterm/xterm.mjs'
]) {
  const precacheBody = source.match(/const PRECACHE = \[([\s\S]*?)\];/)?.[1] || '';
  assert.ok(!precacheBody.includes(`'${onDemandAsset}'`), `${onDemandAsset} must load only when its mode is opened`);
}

assert.match(source, /const VERSION = 'v(?:1[3-9]|[2-9]\d+)'/, 'Service worker cache version was not increased');
assert.match(source, /Promise\.allSettled\(PRECACHE\.map\(precacheOne\)\)/, 'Install must tolerate individual precache failures');
assert.doesNotMatch(source, /\bskipWaiting\s*\(/, 'A waiting worker must not replace an active session');
assert.doesNotMatch(source, /\bclients\.claim\s*\(/, 'A new worker must not claim already-open pages');
assert.match(source, /req\.mode==='navigate'\s*\?\s*caches\.match\('index\.html'\)\s*:\s*Response\.error\(\)/, 'Only navigations may fall back to index.html');
assert.match(source, /if \(req\.mode === 'navigate'\)[\s\S]*networkFirst\(req, PAGE_CACHE/, 'Navigations must be network-first');
assert.match(source, /isCode[\s\S]*cacheFirst\(req, STATIC_CACHE\)/, 'Same-origin code must be cache-first');
assert.match(source, /isMedia[\s\S]*staleWhileRevalidate\(event, MEDIA_CACHE/, 'Same-origin media must use stale-while-revalidate');
assert.doesNotMatch(source, /fonts\.googleapis\.com|fonts\.gstatic\.com/, 'The worker must not retain an external font dependency');
assert.doesNotMatch(source, /plausible\.io[^\n]*(?:cacheFirst|staleWhileRevalidate)/, 'Analytics must never be cached');
assert.match(source, /name\.startsWith\(CACHE_PREFIX\)/, 'Activation may delete only caches owned by this site');
assert.doesNotMatch(source, /(?:localStorage|sessionStorage|indexedDB)\.(?:clear|delete)/, 'Service worker must not erase user state');

const origin = 'https://example.test';
const scope = `${origin}/`;
const cacheKey = request => new URL(typeof request === 'string' ? request : request.url, scope).href;
const buckets = new Map();

class MemoryCache {
  constructor() { this.entries = new Map(); }
  async match(request) { return this.entries.get(cacheKey(request)); }
  async put(request, response) { this.entries.set(cacheKey(request), response); }
  async keys() { return [...this.entries.keys()].map(url => new Request(url)); }
  async delete(request) { return this.entries.delete(cacheKey(request)); }
}

const memoryCaches = {
  async open(name) {
    if (!buckets.has(name)) buckets.set(name, new MemoryCache());
    return buckets.get(name);
  },
  async keys() { return [...buckets.keys()]; },
  async delete(name) { return buckets.delete(name); },
  async match(request) {
    for (const cache of buckets.values()) {
      const response = await cache.match(request);
      if (response) return response;
    }
  }
};

const handlers = {};
let fetchImpl = async request => new Response(new URL(request.url).pathname, { status: 200 });
const self = {
  registration: { scope },
  location: { origin },
  addEventListener(type, handler) { handlers[type] = handler; }
};

vm.runInNewContext(source, {
  self,
  caches: memoryCaches,
  fetch: request => fetchImpl(request),
  Request,
  Response,
  URL,
  console
}, { filename: 'sw.js' });

const lifetimeEvent = () => {
  let promise;
  return {
    waitUntil(value) { promise = value; },
    done: () => promise
  };
};

// Una descarga fallida no invalida la instalación ni el resto del shell.
fetchImpl = async request => {
  if (request.url.endsWith('/assets/icon-512.png')) throw new Error('simulated network failure');
  return new Response(new URL(request.url).pathname, { status: 200 });
};
const installEvent = lifetimeEvent();
handlers.install(installEvent);
await installEvent.done();
assert.ok(await memoryCaches.match(`${scope}fonts.css?v=20260822-local`), 'Successful assets must survive a partial install failure');
assert.equal(await memoryCaches.match(`${scope}assets/icon-512.png`), undefined, 'A failed asset must not poison the cache');

async function dispatchFetch(request) {
  let responsePromise;
  const event = {
    request,
    respondWith(value) { responsePromise = value; },
    waitUntil() {}
  };
  handlers.fetch(event);
  return responsePromise ? responsePromise : null;
}

const onDemandEngine = {
  method: 'GET', mode: 'same-origin', destination: 'script',
  url: `${scope}terminal-engine-docker.js`, headers: new Headers({ accept: 'text/javascript' })
};
const engineResponse = await dispatchFetch(onDemandEngine);
assert.equal(await engineResponse.text(), '/terminal-engine-docker.js', 'The selected engine should load normally');
assert.ok(await memoryCaches.match(onDemandEngine.url), 'The selected engine should be cached after first use');

const terminalNavigation = {
  method: 'GET', mode: 'navigate', destination: 'document',
  url: `${scope}terminal.html?mode=docker`, headers: new Headers({ accept: 'text/html' })
};
const terminalOnline = await dispatchFetch(terminalNavigation);
assert.equal(await terminalOnline.text(), '/terminal.html', 'A visited terminal page should load normally');

fetchImpl = async () => { throw new Error('offline'); };
const terminalOffline = await dispatchFetch(terminalNavigation);
assert.equal(await terminalOffline.text(), '/terminal.html', 'Offline query navigation should reuse its matching base document');

const unknownNavigation = {
  ...terminalNavigation,
  url: `${scope}ruta-inexistente`
};
const indexOffline = await dispatchFetch(unknownNavigation);
assert.match(await indexOffline.text(), /^\/(?:index\.html)?$/, 'Unknown offline navigation should fall back to the app shell');

const missingScript = {
  method: 'GET', mode: 'same-origin', destination: 'script',
  url: `${scope}missing-module.js`, headers: new Headers({ accept: 'text/javascript' })
};
const scriptOffline = await dispatchFetch(missingScript);
assert.equal(scriptOffline.type, 'error', 'Offline JavaScript failure must be an error response, never HTML');

const thirdPartyAnalytics = {
  method: 'GET', mode: 'no-cors', destination: 'script',
  url: 'https://plausible.io/js/script.js', headers: new Headers()
};
assert.equal(await dispatchFetch(thirdPartyAnalytics), null, 'Non-allowlisted third parties must bypass Cache Storage');

await memoryCaches.open('unrelated-app-v1');
await memoryCaches.open('s2ktux-v12');
const activateEvent = lifetimeEvent();
handlers.activate(activateEvent);
await activateEvent.done();
assert.ok(buckets.has('unrelated-app-v1'), 'Activation must preserve caches not owned by S2KTUX');
assert.ok(!buckets.has('s2ktux-v12'), 'Activation must remove obsolete S2KTUX caches');

console.log('service worker contracts: versioning, routing, fallback and bounded caches are valid');
