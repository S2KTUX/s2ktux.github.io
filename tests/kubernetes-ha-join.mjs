import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtemp,readFile,unlink,rmdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {incorporarControlPlaneHA,ordenReintentarEtcdHA} from '../laboratorios/kubernetes-real/debian/incorporacion-ha.mjs';
const calls=[];await incorporarControlPlaneHA({id:'worker1',fresh:true,background:async(...args)=>calls.push(args)});
assert.equal(calls.length,3);assert.match(calls[0][2],/phase preflight/);assert.match(calls[0][2],/phase control-plane-prepare all/);assert.match(calls[0][2],/phase kubelet-start/);assert.match(calls[1][2],/join phase etcd-join/);assert.match(calls[2][2],/--skip-phases=preflight,control-plane-prepare,kubelet-start,etcd-join/);assert.doesNotMatch(calls[2][2],/skip-phases=[^ ]*(wait-control-plane|kubelet-wait-bootstrap|control-plane-join)/);
let touched=false;for(const change of [{id:'controlplane',fresh:true},{id:'worker1',fresh:false}])await assert.rejects(incorporarControlPlaneHA({...change,background:()=>{touched=true;}}));assert.equal(touched,false);
const failure=Error('No se pudo incorporar etcd');let count=0;await assert.rejects(incorporarControlPlaneHA({id:'worker2',fresh:true,background:async()=>{if(++count===2)throw failure;}}),error=>error===failure);assert.equal(count,2,'No continuar sin una incorporación real de etcd');
const directory=await mkdtemp(join(tmpdir(),'s2ktux-ha-join-')),normalized=directory.replaceAll('\\','/');const quote=s=>"'"+s.replaceAll("'",`'\\''`)+"'";
const bash=process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'bash';
const cases=[{mode:'once',exit:0,count:2},{mode:'permanent',exit:17,count:1},{mode:'always',exit:17,count:3},{mode:'success',exit:0,count:1}];
try{for(const test of cases){
 const countFile=normalized+'/'+test.mode+'.count',logFile=normalized+'/'+test.mode+'.log';
 const header=`set -eu
counter=${quote(countFile)}
kubeadm(){ n=$(cat "$counter" 2>/dev/null || echo 0); n=$((n+1)); echo "$n" >"$counter"; case ${test.mode} in success) return 0;; once) if test "$n" -gt 1; then return 0; fi;; permanent) echo 'certificate signed by unknown authority'; return 17;; esac; echo 'context deadline exceeded'; return 17; }
sleep(){ :; }
`;
 const command=ordenReintentarEtcdHA().replaceAll('/var/log/ha-etcd-intento.log',()=>quote(logFile));assert.doesNotMatch(command,/insecure|unsafe|skip.*tls/);
 const exitFile=normalized+'/'+test.mode+'.exit';
 const wrapped=header+'set +e; '+command+'; rc=$?; echo \"$rc\" >'+quote(exitFile)+'; exit \"$rc\"';
 const check=spawnSync(bash,['--noprofile','--norc','-c',wrapped],{encoding:'utf8'});assert.equal(check.status,test.exit,check.stderr);assert.equal(Number(await readFile(countFile,'utf8')),test.count);assert.equal(Number(await readFile(exitFile,'utf8')),test.exit,'La fase devuelve el control al supervisor para registrar su salida');
}}finally{for(const test of cases)for(const ext of ['count','log','exit'])await unlink(join(directory,test.mode+'.'+ext)).catch(error=>{if(error.code!=='ENOENT')throw error;});await rmdir(directory);}
console.log('HA join: reintenta solo fallos de transporte, como máximo tres veces; conserva errores permanentes y no continúa sin etcd real ni omite TLS/bootstrap/healthchecks.');
