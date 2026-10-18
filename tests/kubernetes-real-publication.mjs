import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {crearResolverRecursos} from '../laboratorios/kubernetes-real/recursos-publicados.mjs';
const base=new URL('../laboratorios/kubernetes-real/',import.meta.url),read=p=>readFile(new URL(p,base),'utf8');
const deployment=JSON.parse(await read('publicacion.json'));
assert.equal(deployment.kind,'beta');assert.equal(deployment.replacesCurrentTerminal,false);assert.match(deployment.assetCommit,/^[a-f0-9]{40}$/);
assert.ok(deployment.files.length>40);let total=0;
for(const record of deployment.files){assert.ok(!record.path.split('/').includes('..'));const data=await readFile(new URL(record.path,base));assert.equal(data.length,record.bytes,record.path);assert.equal(createHash('sha256').update(data).digest('hex'),record.sha256,record.path);total+=data.length;assert.doesNotMatch(record.path,/(?:^|\/)(?:qa-|Resultado|diagnosticar|probar-|ha-privado)/);}
assert.ok(total<4*1048576,'Solo la interfaz y los manifiestos van a Pages');
const resolve=crearResolverRecursos(`https://raw.githubusercontent.com/S2KTUX/s2ktux.github.io/${deployment.assetCommit}/kubernetes/v1/`);
for(const file of ['debian/disco-v6/disco-fragmentado.json','componentes/disco-v7/disco-fragmentado.json','componentes/disco-v8/disco-fragmentado.json','debian/fabrica/v6/estado-fragmentado.json']){
 const manifest=JSON.parse(await read(file));assert.ok(manifest.parts.length);
 for(const part of manifest.parts)if(part.file){assert.match(part.file,/^[a-f0-9]{64}\.(gz|part)$/);assert.equal(resolve(new URL('fragmentos/'+part.file,new URL(file,base))).hostname,'raw.githubusercontent.com');}
}
const page=await read('debian/multinodo.html'),hub=await readFile(new URL('../terminal.html',import.meta.url),'utf8');
const uiRevision=async path=>createHash('sha256').update((await read(path)).replaceAll('\r\n','\n')).digest('hex').slice(0,16);
assert.ok(page.includes('src="entrada-laboratorio.mjs?v='+await uiRevision('debian/entrada-laboratorio.mjs')+'"'));
assert.ok(page.includes('href="niveles.css?v='+await uiRevision('debian/niveles.css')+'"'));
assert.ok((await read('debian/entrada-laboratorio.mjs')).includes("import('./multinodo.mjs?v="+await uiRevision('debian/multinodo.mjs')+"')"));
assert.ok((await read('debian/multinodo.mjs')).includes("from './interfaz-niveles.mjs?v="+await uiRevision('debian/interfaz-niveles.mjs')+"'"));
assert.match(page,/Versión preliminar/);assert.doesNotMatch(page,/Prototipo local|pendientes|completo de CKA/i);assert.match(hub,/href="\/laboratorios\/kubernetes-real\/"/);
assert.match(await readFile(new URL('../sw.js',import.meta.url),'utf8'),/pathname\.startsWith\('\/laboratorios\/kubernetes-real\/'\)/);
assert.match(await read('perfil-motor.mjs'),/checked\(recursoPesado\(wasm\)/);
assert.match(await read('disco-kubernetes.mjs'),/packed\.length!==part\.packedBytes\|\|await digest\(packed\)!==part\.packedSha256/);
console.log('✓ Kubernetes beta: interfaz íntegra, recursos inmutables, sin perfiles/informes privados y sin sustituir la terminal actual.');
