import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync,rmdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {EJERCICIOS_INICIALES} from '../laboratorios/kubernetes-real/debian/ejercicios-iniciales.mjs';
const task=EJERCICIOS_INICIALES.find(task=>task.check.includes('logs saludo'));
assert.ok(task);
const dir=mkdtempSync(join(tmpdir(),'s2ktux-logs-')),counter=join(dir,'counter');
try{
 for(const [mode,status,calls] of [['correcto',0,1],['recuperado',0,2],['incorrecto',1,1],['sin-transporte',1,3]]){
  writeFileSync(counter,'0');
  const mock=`kubectl(){
   if test "$3" = get; then echo '{}'; return 0; fi
   n=$(cat "$COUNTER"); n=$((n+1)); echo "$n" >"$COUNTER"
   if test "$MODE" = sin-transporte || { test "$MODE" = recuperado && test "$n" = 1; }; then echo 'Error from server: TLS handshake timeout' >&2; return 1; fi
   if test "$MODE" = incorrecto; then echo 'Otro mensaje'; else echo 'Hola Kubernetes'; fi
  }
  jq(){ cat >/dev/null; }; sleep(){ :; }
  `;
  const result=spawnSync(process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'bash',['--noprofile','--norc'],{input:mock+'\n'+task.check,encoding:'utf8',env:{...process.env,COUNTER:counter.replaceAll('\\','/'),MODE:mode}});
  assert.equal(result.status,status,mode+': '+result.stderr);
  assert.equal(Number(readFileSync(counter,'utf8')),calls,mode);
 }
}finally{rmSync(counter,{force:true});rmdirSync(dir);}
console.log('Logs: reintento limitado ante transporte, salida incorrecta rechazada sin reintentar y sin aprobación si fallan las tres lecturas. No ejecuta un clúster.');
