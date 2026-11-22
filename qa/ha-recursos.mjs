import fs from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {createGunzip} from 'node:zlib';
import {Readable} from 'node:stream';
import {validarBaseHA} from '../laboratorios/kubernetes-real/debian/fabrica-ha.mjs';
import {kubeadmHA} from '../laboratorios/kubernetes-real/debian/kubeadm-ha.mjs';

const [action, capture, stage] = process.argv.slice(2);
const backup = 'D:/RIVALIA/respaldos/s2ktux-recursos';
const origin = 'https://s2ktux-recursos.pages.dev';
const artifact = 'D:/RIVALIA/respaldos/kubeadm-ha-etcd60s-20261122/kubeadm-ha.tar.gz';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const hashFile = async file => {
  const digest = createHash('sha256');
  for await (const buffer of createReadStream(file)) digest.update(buffer);
  return digest.digest('hex');
};

if (!['stage', 'verify', 'backup'].includes(action) || !capture || !stage) throw Error('Uso: ha-recursos.mjs stage|verify|backup captura destino');
const manifestBytes = await fs.readFile(path.join(capture, 'cluster.json'));
const hash = sha(manifestBytes);
const manifest = JSON.parse(manifestBytes);
const config = {revision: manifest.sourceRevision, sourceRevision: manifest.sourceRevision, sha256: hash, url: origin + '/kubernetes/ha/' + hash + '/cluster.json'};
await validarBaseHA(manifest, config);
const prefix = 'kubernetes/ha/' + hash;
const kubeadmPath = 'kubernetes/kubeadm-ha-v1/' + kubeadmHA.archiveSha256 + '/kubeadm-ha.tar.gz';
const parts = new Map();
for (const node of manifest.nodes) {
  const digest = createHash('sha256');
  async function* verifiedParts() {
    for (const part of node.parts) {
      const bytes = await fs.readFile(path.join(capture, 'fragmentos', part.file));
      if (bytes.length !== part.bytes || sha(bytes) !== part.sha256) throw Error('Fragmento alterado: ' + part.file);
      parts.set(prefix + '/fragmentos/' + part.file, {sha256: part.sha256, bytes: part.bytes});
      digest.update(bytes);
      yield bytes;
    }
  }
  let rawBytes = 0;
  for await (const chunk of Readable.from(verifiedParts()).pipe(createGunzip())) {
    rawBytes += chunk.length;
    if (rawBytes > node.bytes) throw Error('Estado descomprimido excede su tamaño');
  }
  if (rawBytes !== node.bytes || digest.digest('hex') !== node.sha256) throw Error('Estado alterado: ' + node.id);
}
const combined = sha(JSON.stringify(manifest.nodes.map(({id,profile,identity,bytes,packedBytes,sha256})=>({id,profile,identity,bytes,packedBytes,sha256}))));
if (combined !== manifest.sha256) throw Error('El conjunto HA no coincide');
if (await hashFile(artifact) !== kubeadmHA.archiveSha256) throw Error('El paquete kubeadm no coincide');
const checks = new Map([[prefix + '/cluster.json', {sha256: hash, bytes: manifestBytes.length}], ...parts, [kubeadmPath, {sha256: kubeadmHA.archiveSha256, bytes: kubeadmHA.bytes}]]);

async function place(root) {
  const target = path.join(root, prefix);
  await fs.mkdir(path.dirname(target), {recursive:true});
  await fs.cp(capture,target,{recursive:true,force:false,errorOnExist:true});
  await fs.mkdir(path.dirname(path.join(root,kubeadmPath)), {recursive:true});
  await fs.copyFile(artifact,path.join(root,kubeadmPath));
  for (const [relative, expected] of checks) {
    const file = path.join(root, relative);
    if ((await fs.stat(file)).size !== expected.bytes || await hashFile(file) !== expected.sha256) throw Error('Copia alterada: ' + relative);
  }
}
const verifiedPath = path.join(capture, '..', 'ha-publicacion-recursos-verificada.json');
if (action === 'stage') {
  await fs.mkdir(stage);
  for (const item of ['_headers','linux','docker','kubernetes']) {
    await fs.cp(path.join(backup,item),path.join(stage,item),{recursive:true,force:false,errorOnExist:true});
  }
  let preserved = 0;
  for (const relative of await fs.readdir(backup,{recursive:true})) {
    if (relative !== '_headers' && !/^(linux|docker|kubernetes)[\\/]/.test(relative)) continue;
    const original = path.join(backup,relative);
    if (!(await fs.stat(original)).isFile()) continue;
    if (await hashFile(original) !== await hashFile(path.join(stage,relative))) throw Error('Recurso anterior alterado: ' + relative);
    preserved++;
  }
  await place(stage);
  let files = 0, bytes = 0;
  for (const relative of await fs.readdir(stage,{recursive:true})) {
    const stat = await fs.stat(path.join(stage,relative));
    if (!stat.isFile()) continue;
    files++; bytes += stat.size;
    if (stat.size > 25 * 1048576) throw Error('Archivo excede Pages: ' + relative);
  }
  if (files > 20000) throw Error('Demasiados archivos para Pages');
  console.log(JSON.stringify({config, stage:path.resolve(stage), preserved, files, bytes, packedBytes:manifest.nodes.reduce((n,x)=>n+x.packedBytes,0)}));
} else if (action === 'verify') {
  const entries = [...checks], verified = [];
  let next = 0;
  await Promise.all(Array.from({length:4},async()=>{
    while (next < entries.length) {
      const [relative, expected] = entries[next++];
      const url = origin+'/'+relative;
      const response = await fetch(url,{headers:{Origin:'https://s2ktux.github.io'},signal:AbortSignal.timeout(120000)});
      const bytes = Buffer.from(await response.arrayBuffer());
      if (!response.ok || response.headers.get('content-type')?.includes('text/html') ||
          response.headers.get('access-control-allow-origin') !== '*' || !response.headers.get('cache-control')?.includes('immutable') ||
          bytes.length !== expected.bytes || sha(bytes) !== expected.sha256) throw Error('Recurso remoto inválido: ' + url);
      verified.push({url,...expected});
    }
  }));
  await fs.writeFile(verifiedPath,JSON.stringify({config,verified},null,2));
  console.log('Recursos remotos verificados',verified.length);
} else {
  const evidence = JSON.parse(await fs.readFile(verifiedPath,'utf8'));
  if (evidence.config.sha256 !== hash || evidence.verified.length !== checks.size) throw Error('Primero verifica la entrega remota');
  await place(backup);
  console.log('Respaldo comprobado',path.join(backup,prefix));
}
