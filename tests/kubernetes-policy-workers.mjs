import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {prepararPoliticasCurso} from '../laboratorios/kubernetes-real/debian/red-politicas-curso.mjs';
const calls=[];
const run=async(node,label,command)=>{
 calls.push({node,label,command});
 if(label==='Consultar el filtrado existente')return {ok:true};
 if(label==='Consultar la preparación persistente de red')return {ok:node==='worker1'};
 return {ok:true};
};
await prepararPoliticasCurso(run,{workers:['worker1','worker2'],prepareMissingWorkers:true});
assert.ok(calls.some(c=>c.node==='worker2'&&c.label==='Mantener los namespaces disponibles después de reiniciar'));
assert.equal(calls.some(c=>c.node==='worker1'&&c.label==='Instalar configuración nativa de red'),false);
assert.ok(calls.some(c=>c.node==='worker1'&&c.command.includes('sha256sum -c -')));
assert.equal(calls.filter(c=>c.label==='Instalar NetworkPolicies reales').length,0);
assert.equal(calls.at(-1).label,'Comprobar el filtrado sin modificarlo');
let writes=0;
await assert.rejects(prepararPoliticasCurso(async(node,label)=>{
 if(label==='Consultar el filtrado existente'||label==='Consultar la preparación persistente de red')return {ok:true};
 if(label==='Conservar la preparación de red sin sobrescribirla')return {ok:false};
 if(label==='Instalar configuración nativa de red')writes++;return {ok:true};
}),/Conservar la preparación/);
assert.equal(writes,0);
await assert.rejects(prepararPoliticasCurso(async(_node,label)=>({ok:label!=='Consultar la preparación persistente de red'})),/no se han reparado/);
await assert.rejects(prepararPoliticasCurso(run,{workers:['worker1','worker1']}));
const originalFetch=globalThis.fetch;
try{
 globalThis.fetch=async url=>{assert.ok(String(url).endsWith('/componentes/root/network-policies.yaml'));return new Response((await readFile(new URL('../laboratorios/kubernetes-real/componentes/root/network-policies.yaml',import.meta.url),'utf8')).replaceAll('\r\n','\n'));};
 const fresh=[];await prepararPoliticasCurso(async(node,label,command)=>{fresh.push({node,label,command});return {ok:!['Consultar el filtrado existente','Consultar la preparación persistente de red'].includes(label)};},{workers:['worker1','worker2']});
 for(const node of ['worker1','worker2'])assert.ok(fresh.some(c=>c.node===node&&c.label==='Mantener los namespaces disponibles después de reiniciar'));
 assert.equal(fresh.filter(c=>c.label==='Instalar NetworkPolicies reales').length,1);
}finally{globalThis.fetch=originalFetch;}
console.log('NetworkPolicies: preparar ambos workers, conservar archivos verificados y rechazar cambios ajenos sin repararlos.');
