import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {spawnSync} from 'node:child_process';
import {materialesHash,materialesURL,validarMateriales,ordenDescargarMateriales,ordenInstalarMateriales,comandosMateriales} from '../laboratorios/kubernetes-real/debian/materiales-curso.mjs';
const packed=readFileSync(new URL('../laboratorios/kubernetes-real/recursos/curso-debian-v1/materiales.json.gz',import.meta.url));
assert.equal(createHash('sha256').update(packed).digest('hex'),materialesHash);
const files=await validarMateriales(JSON.parse(gunzipSync(packed)));assert.ok(files.length>20);
assert.match(materialesURL,/githubusercontent\.com\/S2KTUX\/s2ktux\.github\.io\/[a-f0-9]{40}\//);
assert.match(ordenDescargarMateriales,/--max-time 45/);assert.match(ordenInstalarMateriales,/sha256sum -c SHA256SUMS/);assert.match(ordenInstalarMateriales,/test ! -e \/opt\/curso/);
const quote=s=>"'"+s.replaceAll("'","'\\''")+"'";
for(const command of [ordenDescargarMateriales,ordenInstalarMateriales]){assert.ok(('/bin/sh -c '+quote('printf "\\n__KUBE_CHECK_000000000000000000000000_0_START\\n"; if /bin/sh -c '+quote('set -eu; '+command)+'; then rc=0; else rc=$?; fi; printf "\\n__KUBE_CHECK_000000000000000000000000_0=%s\\n" "$rc"')).length<3000);}
let count=0;for await(const command of comandosMateriales(files)){assert.ok(command.length<3000);count++;}assert.ok(count>400,'Se conserva el transporte UART si no hay Internet');
const bash=process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'bash',syntax=spawnSync(bash,['--noprofile','--norc','-n'],{input:ordenDescargarMateriales+'\n'+ordenInstalarMateriales,encoding:'utf8'});assert.equal(syntax.status,0,syntax.stderr);
console.log('Materiales: descarga inmutable, doble verificación y alternativa UART conservada; no acredita todavía el transporte nativo.');
