import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {ordenSaludAPIHA} from '../laboratorios/kubernetes-real/debian/salud-ha.mjs';
const command=ordenSaludAPIHA();
assert.match(command,/10\.77\.0\.10 10\.77\.0\.11 10\.77\.0\.12/);
assert.match(command,/--cacert/);assert.match(command,/--cert/);assert.match(command,/--key/);
assert.doesNotMatch(command,/insecure|skip.*tls|systemctl|kubeadm|kubectl|restart/);
const bash=process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'bash';
for(const bad of ['','not-ready']){
 const stub=`curl(){ case "$*" in *10.77.0.12*) echo '${bad}';; *) echo ok;; esac; }; sleep(){ exit 23; }; `;
 const result=spawnSync(bash,['--noprofile','--norc','-c',stub+command],{encoding:'utf8'});
 assert.equal(result.status,23,'No aceptar solo dos APIs saludables: '+result.stderr);
}
const healthy=spawnSync(bash,['--noprofile','--norc','-c','curl(){ echo ok; }; '+command],{encoding:'utf8'});
assert.equal(healthy.status,0,healthy.stderr);
console.log('HA: comprueba los tres APIs por HTTPS con certificados; rechaza respuestas vacías o parciales y no repara el clúster.');
