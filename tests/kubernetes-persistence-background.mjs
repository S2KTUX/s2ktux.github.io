import assert from 'node:assert/strict';
import {solicitarPersistenciaEnSegundoPlano} from '../laboratorios/kubernetes-real/debian/interfaz-niveles.mjs';
let requests=0;const unhandled=[];
const onUnhandled=error=>unhandled.push(error);process.on('unhandledRejection',onUnhandled);
try{
 assert.equal(solicitarPersistenciaEnSegundoPlano(()=>{requests++;return new Promise(()=>{});}),undefined);
 assert.equal(requests,0,'Pedir persistencia no interrumpe el turno de guardado');
 await Promise.resolve();assert.equal(requests,1,'La petición comienza sin esperar a que responda el navegador');
 solicitarPersistenciaEnSegundoPlano(()=>{throw Error('Permiso no disponible');});
 solicitarPersistenciaEnSegundoPlano(()=>Promise.reject(Error('Solicitud rechazada')));
 solicitarPersistenciaEnSegundoPlano(()=>undefined);
 await new Promise(resolve=>setImmediate(resolve));
 assert.deepEqual(unhandled,[],'Un permiso ausente, fallido o pendiente no debe romper el guardado');
}finally{process.off('unhandledRejection',onUnhandled);}
console.log('Persistencia Kubernetes: petición en segundo plano, sin espera y sin errores no gestionados. No abre navegador ni VM.');
