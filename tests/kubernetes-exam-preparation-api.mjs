import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {mkdtemp,writeFile} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {ordenPreparacionExamen} from '../laboratorios/kubernetes-real/debian/examen-runtime.mjs';
import {TAREAS_CKA} from '../laboratorios/kubernetes-real/debian/examen-cka-banco.mjs';
import {aplicar} from '../laboratorios/kubernetes-real/debian/herramientas-practicas.mjs';
const prefix="printf '%s\\n' ",suffix=' | kubectl apply -f -',decode=command=>JSON.parse(command.slice(prefix.length+1,-suffix.length-1).replaceAll("'\\''","'"));
const originals=TAREAS_CKA.flatMap(t=>t.prepare.slice(2)).filter(command=>command.startsWith(prefix));
originals.push(aplicar({apiVersion:'v1',kind:'Pod',metadata:{name:'comillas',namespace:'examen-01'},spec:{containers:[{name:'app',image:'busybox:1.37.0-musl',command:['echo',"it's literal; $(no-ejecutar)"]}]}}));
const commands=originals.map(command=>ordenPreparacionExamen(command));assert.equal(commands.length,14);
for(const command of commands){assert.match(command,/^curl --fail/);assert.match(command,/fieldValidation=Strict/);assert.match(command,/--cacert/);assert.doesNotMatch(command,/kubectl|--insecure/);assert.ok(command.length<2400);}
const bash=process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'bash';
const script=`export S2KTUX_CKA_CERT=/test/tls.crt S2KTUX_CKA_KEY=/test/tls.key
exec 3>&1
curl(){ while test "$#" -gt 0; do case "$1" in --data) printf '%s\\n' "$2" >&3; shift 2;; *) shift;; esac; done; }
${commands.join('\n')}`;
const directory=await mkdtemp(join(tmpdir(),'s2ktux-exam-api-')),file=join(directory,'preparar.sh');await writeFile(file,script+'\n');const shellFile=process.platform==='win32'?file.replaceAll('\\','/').replace(/^([A-Za-z]):/,(m,c)=>'/'+c.toLowerCase()):file;
const result=spawnSync(bash,['--noprofile','--norc',shellFile],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);assert.deepEqual(result.stdout.trim().split('\n').map(line=>JSON.parse(line)),originals.map(decode),'Conservar cada campo del JSON, incluidas comillas y texto literal');
for(const command of ['cat > /root/examen-backups.yaml <<\'EOF\'\ntexto\nEOF','kubectl apply -f archivo.yaml',prefix+"'null'"+suffix,aplicar({apiVersion:'v1',kind:'Secret',metadata:{name:'otro',namespace:'examen-01'}}),aplicar({apiVersion:'v1',kind:'Pod',metadata:{name:'otro',namespace:'kube-system'}})])assert.equal(ordenPreparacionExamen(command),command,'Conservar las demás preparaciones sin reinterpretarlas');
console.log('Preparación CKA: los manifiestos JSON conservan sus campos y comillas; POST nativo con validación estricta y TLS, solo en recursos nuevos del examen.');
