import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {perfilNodoHA,validarPerfilHA,identidadNodoHA,miembrosHA} from '../laboratorios/kubernetes-real/debian/perfil-ha.mjs';
import {configuracionHA} from '../laboratorios/kubernetes-real/debian/ha-configuracion.mjs';
import {configuracionInitHA,configuracionJoinHA} from '../laboratorios/kubernetes-real/debian/configuracion-admin-curso.mjs';
import {unidadRutasHA} from '../laboratorios/kubernetes-real/debian/ha-rutas.mjs';
import {validarContextoHA,prepararClusterHA,clienteHAQuery} from '../laboratorios/kubernetes-real/debian/ha-curso.mjs';
import {escenarioCurso,entornoEjercicio,urlEscenarioCurso} from '../laboratorios/kubernetes-real/debian/escenarios-curso.mjs';
import {parametrosPublicos,avanzadoPublicado} from '../laboratorios/kubernetes-real/debian/disponibilidad-curso.mjs';
import {EJERCICIOS_HA} from '../laboratorios/kubernetes-real/debian/ejercicios-ha.mjs';
import {comprobarPractica,prepararPractica} from '../laboratorios/kubernetes-real/debian/motor-practicas.mjs';
const options={factoryVersion:'v14',base:'admin-v3',components:'v7',withKube:true,clustered:true,schedulingAPI:true,tlsMode:'classical',engineVariant:'jit8192-pic-only-v1',kernelVariant:'highmem-net-v2',diskMode:'dma',sharedCode:false,warm:false,threaded:true,worker:null};
for(const member of ['1','2','3'])assert.equal(validarPerfilHA(options,member).memoryMiB,1536);
for(const change of [{factoryVersion:'v13'},{kernelVariant:'highmem-v1'},{warm:true},{worker:'1'},{clustered:false},{threaded:false},{tlsMode:null},{base:'admin-v2'},{schedulingAPI:false},{diskMode:'pio'},{sharedCode:true},{components:'v8'}])assert.throws(()=>validarPerfilHA({...options,...change},'1'));
assert.equal(validarPerfilHA(options,null),null);assert.throws(()=>validarPerfilHA(options,'01'));
assert.equal(new Set(await Promise.all(miembrosHA.map(identidadNodoHA))).size,3);
assert.equal(new Set(miembrosHA.map(id=>perfilNodoHA(id).mac)).size,3);
assert.deepEqual(miembrosHA.map(id=>perfilNodoHA(id).name),['cka-cp1','cka-cp2','cka-cp3']);
for(const index of [1,2,3]){
 const config=configuracionHA(index);assert.equal((config.haproxy.match(/ check inter /g)||[]).length,3);
 assert.match(config.keepalivedUnit,/BindsTo=haproxy.service/);assert.doesNotMatch(config.keepalived,/vrrp_script|pgrep/);
 assert.match(clienteHAQuery(index),new RegExp('ha-member='+index+'$'));
}
for(const index of [0,4,1.5])assert.throws(()=>clienteHAQuery(index));
const original=readFileSync(new URL('../laboratorios/kubernetes-real/debian/materiales-ha/kubeadm.yaml',import.meta.url),'utf8'),init=configuracionInitHA(original);
assert.match(init,/controlPlaneEndpoint: 10\.77\.0\.100:8443/);assert.match(init,/cgroupDriver: systemd/);
assert.match(init,/name: election-timeout\n        value: "10000"/);assert.match(init,/name: heartbeat-interval\n        value: "1000"/);
assert.equal((init.match(/name: leader-elect-lease-duration\n      value: 180s/g)||[]).length,2);
assert.equal((init.match(/name: leader-elect-renew-deadline\n      value: 120s/g)||[]).length,2);
assert.equal((init.match(/name: leader-elect-retry-period\n      value: 5s/g)||[]).length,2);
assert.doesNotMatch(init,/leader-elect[^\n]*false|unsafeSkip|insecure-skip/);
assert.throws(()=>configuracionInitHA(init));
const credentials={token:'abcdef.0123456789abcdef',hash:'a'.repeat(64),certificateKey:'b'.repeat(64)},join=configuracionJoinHA(2,credentials);
assert.match(join,/controlPlane:\n  certificateKey/);assert.match(join,/caCertHashes:\n      - sha256:/);assert.doesNotMatch(join,/unsafeSkip|insecure/);
assert.throws(()=>configuracionJoinHA(2,{...credentials,token:'injection; command'}));
assert.throws(()=>unidadRutasHA(1,['10.244.0.0/24','10.244.0.0/24','10.244.2.0/24']));
assert.throws(()=>unidadRutasHA(1,['10.244.0.0/24','10.244.1.0/24','10.244.999.0/24']));
const context={scenario:'ha-cluster',fresh:true,studentSession:false,nodeCount:0};validarContextoHA(context);
for(const change of [{scenario:'study'},{fresh:false},{studentSession:true},{nodeCount:3}]){
 let touched=false;await assert.rejects(prepararClusterHA({context:{...context,...change},create:()=>{touched=true;}}));assert.equal(touched,false);
}
const scene=escenarioCurso('ha-cluster',{factoryVersion:'v14',level:'avanzado'});assert.equal(scene.ha,true);
assert.throws(()=>escenarioCurso('ha-cluster',{factoryVersion:'v13',level:'avanzado'}));
const href=urlEscenarioCurso('https://s2ktux.github.io/laboratorios/kubernetes-real/debian/multinodo.html?level=avanzado',scene.id);
assert.equal(parametrosPublicos(new URL(href).search).get('factory'),'v14');
const [task]=EJERCICIOS_HA,state={factoryVersion:'v14',level:'avanzado',scenarioIndependent:true,scenarioId:scene.id};
assert.equal(entornoEjercicio(task,state),'ha-cluster');assert.equal(entornoEjercicio(task,{...state,scenarioId:'study'}),'course');
let touched=false;await assert.rejects(prepararPractica(task,()=>{touched=true;}));assert.equal(touched,false);
assert.equal((await comprobarPractica(task,async node=>({ok:node!=='worker2'}))).state,'incomplete','Una sola API no acredita los otros miembros');
assert.equal((await comprobarPractica(task,async()=>({ok:true}))).state,'correct');
const bash=process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'bash';
for(const command of [task.check,...task.checkSteps.map(step=>step.command)]){const result=spawnSync(bash,['--noprofile','--norc','-n'],{input:command,encoding:'utf8'});assert.equal(result.status,0,result.stderr);}
assert.equal(avanzadoPublicado,false);
console.log('HA: perfiles y MAC propios, guardas antes de escribir, TLS y quorum auténticos, corrector multinodo; avanzado cerrado hasta aceptar el recorrido nativo.');
