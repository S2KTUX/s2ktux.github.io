import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {spawnSync} from 'node:child_process';
import {materialesHash,materialesURL,validarMateriales,ordenDescargarMateriales,ordenInstalarMateriales,comandosMateriales,archivoHash,archivoURL,ordenDescargarArchivo,ordenInstalarArchivo,prepararMaterialesCurso} from '../laboratorios/kubernetes-real/debian/materiales-curso.mjs';
const packed=readFileSync(new URL('../laboratorios/kubernetes-real/recursos/curso-debian-v1/materiales.json.gz',import.meta.url));
assert.equal(createHash('sha256').update(packed).digest('hex'),materialesHash);
const files=await validarMateriales(JSON.parse(gunzipSync(packed)));assert.ok(files.length>20);
const archive=readFileSync(new URL('../laboratorios/kubernetes-real/recursos/curso-debian-v1/materiales.tar.gz',import.meta.url));
assert.equal(createHash('sha256').update(archive).digest('hex'),archivoHash);assert.ok(archive.length<packed.length);
assert.match(archivoURL,/githubusercontent\.com\/S2KTUX\/s2ktux\.github\.io\/[a-f0-9]{40}\//);
const tar=gunzipSync(archive),entries=[];
for(let at=0;at<tar.length&&tar[at];){const h=tar.subarray(at,at+512),name=h.subarray(0,100).toString().replace(/\0.*$/s,''),size=parseInt(h.subarray(124,136).toString(),8);assert.equal(h[156],48,'Solo archivos normales, no enlaces');const f=files.find(f=>f.path===name);assert.ok(f,'Sin rutas nuevas');assert.deepEqual(tar.subarray(at+512,at+512+size),Buffer.from(f.data));entries.push(name);at+=512+Math.ceil(size/512)*512;}
assert.deepEqual(entries,files.map(f=>f.path),'Archivo equivalente byte por byte, incluidas licencias y originales');
assert.match(ordenInstalarArchivo,/sha256sum -c SHA256SUMS/);assert.match(ordenInstalarArchivo,/test ! -e \/opt\/curso/);
assert.match(materialesURL,/githubusercontent\.com\/S2KTUX\/s2ktux\.github\.io\/[a-f0-9]{40}\//);
assert.match(ordenDescargarMateriales,/--max-time 45/);assert.match(ordenInstalarMateriales,/sha256sum -c SHA256SUMS/);assert.match(ordenInstalarMateriales,/test ! -e \/opt\/curso/);
const quote=s=>"'"+s.replaceAll("'","'\\''")+"'";
for(const command of [ordenDescargarMateriales,ordenInstalarMateriales,ordenDescargarArchivo,ordenInstalarArchivo]){assert.ok(('/bin/sh -c '+quote('printf "\\n__KUBE_CHECK_000000000000000000000000_0_START\\n"; if /bin/sh -c '+quote('set -eu; '+command)+'; then rc=0; else rc=$?; fi; printf "\\n__KUBE_CHECK_000000000000000000000000_0=%s\\n" "$rc"')).length<3000);}
let count=0;for await(const command of comandosMateriales(files)){assert.ok(command.length<3000);count++;}assert.ok(count>400,'Se conserva el transporte UART si no hay Internet');
const bash=process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'bash',syntax=spawnSync(bash,['--noprofile','--norc','-n'],{input:ordenDescargarMateriales+'\n'+ordenInstalarMateriales,encoding:'utf8'});assert.equal(syntax.status,0,syntax.stderr);
console.log('Materiales: descarga inmutable, doble verificación y alternativa UART conservada; no acredita todavía el transporte nativo.');
const originalFetch=globalThis.fetch;globalThis.fetch=async()=>new Response(packed);
try{
 const calls=[];await prepararMaterialesCurso(async(id,label,command)=>{calls.push(command);return {ok:true};});assert.equal(calls.length,2);assert.equal(calls[0],ordenDescargarArchivo);
 const fallback=[];await prepararMaterialesCurso(async(id,label,command)=>{fallback.push(command);return {ok:command!==ordenDescargarArchivo};});assert.equal(fallback.length,3);assert.equal(fallback[1],ordenDescargarMateriales);
 const failed=[];await assert.rejects(()=>prepararMaterialesCurso(async(id,label,command)=>{failed.push(command);return {ok:command===ordenDescargarArchivo};}),/preparación parcial/);assert.equal(failed.length,2,'No sobrescribir tras una extracción fallida');
}finally{globalThis.fetch=originalFetch;}
