import { build, version as esbuildVersion } from 'esbuild';
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, '_site');
const terminalAssets = join(out, 'assets', 'terminal');
const generatedEntries = join(out, '.terminal-build-entries');
const modes = ['linux', 'docker', 'kubernetes'];
const excludedRoots = new Set(['.git', '.github', 'node_modules', 'tests', 'scripts', '_site', 'playwright-report', 'test-results']);
const excludedFiles = new Set(['.gitignore', 'package.json', 'package-lock.json', 'playwright.config.mjs']);
const posix = value => value.split(sep).join('/');

const isExcluded = source => {
  const rel = posix(relative(root, source));
  const first = rel.split('/')[0];
  if (excludedRoots.has(first) || excludedFiles.has(rel)) return true;
  if (/^terminal-.*\.js$/.test(rel)) return true;
  if (/^vendor\/xterm\/.*\.mjs$/.test(rel)) return true;
  return false;
};

async function copyTree(source, destination) {
  if (isExcluded(source)) return;
  const info = await stat(source);
  if (info.isDirectory()) {
    await mkdir(destination, { recursive:true });
    for (const name of await readdir(source)) await copyTree(join(source, name), join(destination, name));
    return;
  }
  await mkdir(dirname(destination), { recursive:true });
  await writeFile(destination, await readFile(source));
}

await rm(out, { recursive:true, force:true });
await mkdir(out, { recursive:true });
for (const name of await readdir(root)) await copyTree(join(root, name), join(out, name));
await mkdir(terminalAssets, { recursive:true });
await mkdir(generatedEntries, { recursive:true });

const entryPoints = {
  'terminal-bootstrap.min':join(root, 'terminal-bootstrap.js'),
  'terminal-simulation-worker.min':join(root, 'terminal-simulation-worker.js')
};
for (const mode of modes) {
  const source = [
    "import engine from '../../terminal-engine-" + mode + ".js';",
    "import runtime from '../../terminal-runtime-" + mode + ".js';",
    "export { startTerminal } from '../../terminal-core.js';",
    "export { createTerminalSimulationClient } from '../../terminal-worker-client.js';",
    "export { attachTerminalRenderer } from '../../terminal-xterm-renderer.js';",
    'export { engine, runtime };'
  ].join('\n');
  const entry = join(generatedEntries, 'terminal-' + mode + '.js');
  await writeFile(entry, source + '\n');
  entryPoints['terminal-' + mode + '.min'] = entry;
}

const result = await build({
  absWorkingDir:root,
  entryPoints,
  outdir:terminalAssets,
  entryNames:'[name]',
  chunkNames:'chunks/[hash]',
  bundle:true,
  splitting:true,
  minify:true,
  treeShaking:true,
  format:'esm',
  platform:'browser',
  target:['es2022'],
  charset:'utf8',
  legalComments:'none',
  sourcemap:false,
  define:{ __S2KTUX_PRODUCTION__:'true' },
  metafile:true,
  logLevel:'error'
});
await rm(generatedEntries, { recursive:true, force:true });

const terminalHtmlPath = join(out, 'terminal.html');
const terminalHtml = await readFile(terminalHtmlPath, 'utf8');
const sourceScript = '<script type="module" src="./terminal-bootstrap.js?v=20260826-phase5"></script>';
const builtScript = '<script type="module" src="./assets/terminal/terminal-bootstrap.min.js"></script>';
if (!terminalHtml.includes(sourceScript)) throw new Error('No se encontró el cargador fuente en terminal.html');
await writeFile(terminalHtmlPath, terminalHtml.replace(sourceScript, builtScript));

const metaByAbsolute = new Map(Object.entries(result.metafile.outputs).map(([path,meta])=>[resolve(root,path),meta]));
const bytesByAbsolute = new Map();
for (const path of metaByAbsolute.keys()) bytesByAbsolute.set(path, await readFile(path));

const resolveOutputImport = (from, imported) => {
  const beside = resolve(dirname(from), imported);
  if (metaByAbsolute.has(beside)) return beside;
  const fromRoot = resolve(root, imported);
  if (metaByAbsolute.has(fromRoot)) return fromRoot;
  throw new Error('Import generado no localizado: ' + imported + ' desde ' + from);
};
const dependencyClosure = (roots,includeDynamic=false) => {
  const found = new Set();
  const queue = [...roots];
  while (queue.length) {
    const current = queue.pop();
    if (found.has(current)) continue;
    found.add(current);
    const meta = metaByAbsolute.get(current);
    if (!meta) throw new Error('Salida sin metadatos: ' + current);
    for (const imported of meta.imports || []) {
      if (!imported.external && (includeDynamic || imported.kind !== 'dynamic-import')) queue.push(resolveOutputImport(current, imported.path));
    }
  }
  return found;
};
const namedOutput = name => {
  const match = [...metaByAbsolute.keys()].find(path=>path.endsWith(sep + name));
  if (!match) throw new Error('No se generó ' + name);
  return match;
};
const bootstrapOutput = namedOutput('terminal-bootstrap.min.js');
const workerOutput = namedOutput('terminal-simulation-worker.min.js');
const modeDynamicOutputs = mode => {
  const marker = mode==='kubernetes'?'terminal-kubernetes-command.js':mode==='docker'?'terminal-docker-command.js':'terminal-linux-command.js';
  const dynamicRoots=(metaByAbsolute.get(workerOutput).imports||[])
    .filter(item=>!item.external&&item.kind==='dynamic-import')
    .map(item=>resolveOutputImport(workerOutput,item.path));
  return dynamicRoots.filter(root=>{
    const inputs=[...dependencyClosure([root])].flatMap(path=>Object.keys(metaByAbsolute.get(path).inputs||{}));
    return inputs.some(input=>input.endsWith(marker))&&(mode!=='docker'||!inputs.some(input=>input.endsWith('terminal-linux-command.js')));
  });
};
const modeReports = {};
for (const mode of modes) {
  const loaded = dependencyClosure([bootstrapOutput, workerOutput, namedOutput('terminal-' + mode + '.min.js')]);
  for(const path of dependencyClosure(modeDynamicOutputs(mode)))loaded.add(path);
  const totalGzip = [...loaded].reduce((total,path)=>total+gzipSync(bytesByAbsolute.get(path)).byteLength,0);
  modeReports[mode] = {
    totalGzip,
    margin:260000-totalGzip,
    files:[...loaded].map(path=>posix(relative(terminalAssets,path))).sort()
  };
}

const generatedJs = [...bytesByAbsolute.entries()].sort(([a],[b])=>a.localeCompare(b));
const releaseHash = createHash('sha256').update(Buffer.concat(generatedJs.map(([,bytes])=>bytes))).digest('hex').slice(0, 12);
const swPath = join(out, 'sw.js');
let sw = await readFile(swPath, 'utf8');
if (!sw.includes("const VERSION = 'v28';")) throw new Error('No se encontró la versión esperada del service worker');
sw = sw.replace("const VERSION = 'v28';", "const VERSION = 'v28-" + releaseHash + "';");
sw = sw.replace("  'index.html',", "  'index.html',\n  'assets/terminal/terminal-bootstrap.min.js',");
await writeFile(swPath, sw);

const report = {
  tool:'esbuild ' + esbuildVersion,
  releaseHash,
  limit:260000,
  requiredMargin:8192,
  assets:Object.fromEntries(generatedJs.map(([path,bytes])=>[
    posix(relative(terminalAssets,path)),
    { raw:bytes.byteLength, gzip:gzipSync(bytes).byteLength }
  ])),
  graph:Object.fromEntries([...metaByAbsolute.entries()].map(([path,meta])=>[
    posix(relative(terminalAssets,path)),
    (meta.imports || []).filter(item=>!item.external && item.kind!=='dynamic-import').map(item=>posix(relative(terminalAssets,resolveOutputImport(path,item.path))))
  ])),
  dynamicGraph:Object.fromEntries([...metaByAbsolute.entries()].map(([path,meta])=>[
    posix(relative(terminalAssets,path)),
    (meta.imports || []).filter(item=>!item.external && item.kind==='dynamic-import').map(item=>posix(relative(terminalAssets,resolveOutputImport(path,item.path))))
  ])),
  modes:modeReports
};
await writeFile(join(terminalAssets, 'build-report.json'), JSON.stringify(report, null, 2)+'\n');
console.log('Producción: esbuild ' + esbuildVersion + ' · release ' + releaseHash);
for (const mode of modes) console.log(mode + ': ' + report.modes[mode].totalGzip + ' B gzip · margen ' + report.modes[mode].margin + ' B');
for (const mode of modes) if(report.modes[mode].margin<report.requiredMargin)throw new Error(mode+' incumple el margen obligatorio: '+report.modes[mode].margin+' B < '+report.requiredMargin+' B');
