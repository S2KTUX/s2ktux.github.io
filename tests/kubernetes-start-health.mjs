import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {ordenSaludInicial} from '../laboratorios/kubernetes-real/debian/salud-inicial.mjs';
const bash=process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'bash';
// jq sin entrada puede devolver éxito: se simula ese comportamiento adrede.
// No prueba el filtro de Ready, sino que una consulta fallida nunca lo alcance.
const command=ordenSaludInicial(2).replace('sleep 2','break');
const stubs=`curl(){ case "$*" in *readyz?verbose*) return 1;; *readyz*) printf '%s' "$QA_READY";; *api/v1/nodes*) printf '%s' "$QA_NODES"; return "$QA_CODE";; *) return 99;; esac; }; jq(){ cat >/dev/null; return 0; }; `;
for(const [ready,nodes,code,expected]of [['ok','{"items":[]}',0,0],['ok','',0,1],['ok','',7,1],['ok','{"items":[]}',7,1],['error','{"items":[]}',0,1]]){
 const result=spawnSync(bash,['--noprofile','--norc','-c',stubs+command],{env:{...process.env,QA_READY:ready,QA_NODES:nodes,QA_CODE:String(code)},encoding:'utf8'});
 assert.equal(result.status,expected,JSON.stringify({ready,nodes,code})+' '+result.stderr);
}
assert.match(command,/\(\.items\|length\)==2/);
assert.doesNotMatch(command,/restart|reset|patch|delete|apply/);
console.log('Arranque: una consulta de nodos vacía o fallida no puede anunciar que el clúster está listo.');
