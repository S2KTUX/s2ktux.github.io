import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {comandosEntornoPreparado} from '../laboratorios/kubernetes-real/debian/comprobar-entorno-preparado.mjs';
const bash=process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'bash',commands=comandosEntornoPreparado();
assert.doesNotMatch(commands[0],/crictl|systemctl restart|kubectl apply/);
assert.match(commands[0],/grep -q kubepods/);assert.match(commands[0],/GODEBUG=tlsmlkem=0/);
assert.equal(spawnSync(bash,['--noprofile','--norc','-n'],{input:commands.join('\n'),encoding:'utf8'}).status,0);
// Ensayar el filtro de procesos con archivos de fixture, no con el host.
const dir=mkdtempSync(join(tmpdir(),'s2ktux-proc-')),proc=join(dir,'123');mkdirSync(proc);
try{
 const check=commands[0].slice(commands[0].indexOf('for comm'),commands[0].indexOf('; sleep 2')).replaceAll('/proc/',dir.replaceAll('\\','/')+'/')+'; exit 1';
 const run=()=>spawnSync(bash,['--noprofile','--norc','-c',check],{encoding:'utf8'}).status;
 writeFileSync(join(proc,'comm'),'kube-apiserver\n');writeFileSync(join(proc,'cgroup'),'0::/kubepods.slice/pod-practica\n');writeFileSync(join(proc,'environ'),'GODEBUG=tlsmlkem=0\0OTRA=valor\0');
 assert.equal(run(),0,'Reconoce el proceso confinado con su entorno real');
 writeFileSync(join(proc,'environ'),'GODEBUG=distinto\0');assert.notEqual(run(),0,'No acepta un entorno distinto');
 writeFileSync(join(proc,'environ'),'GODEBUG=tlsmlkem=0\0');writeFileSync(join(proc,'cgroup'),'0::/system.slice/imitacion\n');assert.notEqual(run(),0,'No acepta un proceso ajeno a los Pods');
 writeFileSync(join(proc,'comm'),'otro-proceso\n');assert.notEqual(run(),0);
}finally{rmSync(dir,{recursive:true});}
console.log('Kubernetes: entorno de API Server comprobado mediante /proc, sin clientes CRI ni reinicios; casos positivos y negativos.');
