import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const site=new URL('../_site/',import.meta.url);
const assets=new URL('assets/terminal/',site);
const modes=['linux','docker','kubernetes'];
const LIMIT=260000;
const REQUIRED_MARGIN=8192;
const read=path=>readFile(new URL(path,assets));

const html=await readFile(new URL('terminal.html',site),'utf8');
assert.match(html,/assets\/terminal\/terminal-bootstrap\.min\.js/,'La página publicada no usa el bootstrap minificado');
assert.doesNotMatch(html,/src="\.\/terminal-bootstrap\.js/,'La página publicada todavía sirve el bootstrap fuente');

for(const source of ['terminal-core.js','terminal-runtime-linux.js','terminal-runtime-docker.js','terminal-runtime-kubernetes.js','terminal-kubernetes-command.js','terminal-worker-client.js']){
  await assert.rejects(stat(new URL(source,site)),{code:'ENOENT'},'El artefacto publica código fuente de terminal: '+source);
}

const report=JSON.parse(await read('build-report.json'));
assert.equal(report.limit,LIMIT);
assert.equal(report.requiredMargin,REQUIRED_MARGIN);
assert.match(report.tool,/^esbuild 0\.28\.2$/);

const actualSizes={};
for(const [name,expected] of Object.entries(report.assets)){
  const bytes=await read(name);
  actualSizes[name]={raw:bytes.byteLength,gzip:gzipSync(bytes).byteLength};
  assert.deepEqual(actualSizes[name],expected,'Tamaño no reproducible: '+name);
}

const closure=roots=>{
  const found=new Set();
  const queue=[...roots];
  while(queue.length){
    const current=queue.pop();
    if(found.has(current))continue;
    found.add(current);
    assert.ok(report.graph[current],'El grafo no describe '+current);
    queue.push(...report.graph[current]);
  }
  return found;
};

const totals={};
for(const mode of modes){
  const files=closure(['terminal-bootstrap.min.js','terminal-simulation-worker.min.js','terminal-'+mode+'.min.js']);
  const total=[...files].reduce((sum,name)=>sum+actualSizes[name].gzip,0);
  const margin=LIMIT-total;
  totals[mode]={total,margin};
  assert.equal(total,report.modes[mode].totalGzip,'Total distinto del informe: '+mode);
  assert.deepEqual([...files].sort(),report.modes[mode].files,'Grafo de carga distinto del informe: '+mode);
  assert.ok(margin>=REQUIRED_MARGIN,'El modo '+mode+' deja '+margin+' B; se exigen al menos '+REQUIRED_MARGIN+' B de margen');
}

assert.match(await readFile(new URL('sw.js',site),'utf8'),/const VERSION = 'v28-[a-f0-9]{12}';/);
assert.match(await readFile(new URL('sw.js',site),'utf8'),/assets\/terminal\/terminal-bootstrap\.min\.js/);
console.log('production budget: '+modes.map(mode=>mode+' '+totals[mode].total+' B gzip · margen '+totals[mode].margin+' B').join(' · ')+'; mínimo obligatorio '+REQUIRED_MARGIN+' B');
