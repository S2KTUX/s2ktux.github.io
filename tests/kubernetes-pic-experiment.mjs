import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fuentesExperimentoPIC,instalarExperimentoPIC} from '../scripts/kubernetes-pic-experiment.mjs';
const {manifest,wasm,modules}=await fuentesExperimentoPIC();
assert.equal(manifest.variant,'jit8192-pic-only-v1');assert.ok(wasm.byteLength>1048576&&wasm.byteLength<4*1048576);
assert.ok(WebAssembly.validate(wasm));
const original=readFileSync(new URL('../fixtures/kubernetes-pic-only/pic-original.rs',import.meta.url),'utf8').replaceAll('\r\n','\n');
const candidate=readFileSync(new URL('../fixtures/kubernetes-pic-only/pic.rs',import.meta.url),'utf8').replaceAll('\r\n','\n');
const before='        None => return None,\n    };\n\n    if pic.slave.irr == 0 {';
const after=`        // INTR can disappear after the master latched its cascade edge.
        // The real 8259A responds with its default IR7 vector, without
        // setting slave ISR7. The OS must still EOI master IRQ2. Dropping
        // the vector instead strands master ISR2 and blocks all slave IRQs.
        None => {
            pic.clear_irq(2);
            return Some(pic.slave.irq_map | 7);
        },
    };

    if pic.slave.irr == 0 {`;
assert.equal(original.split(before).length,2);assert.equal(candidate,original.replace(before,after),'La fuente candidata solo puede cambiar este caso de IRQ espuria');
assert.equal(modules.size,3);assert.match(modules.get('debian/cliente.mjs'),/solo admite la fábrica v6 de QA/);
assert.match(modules.get('perfil-motor.mjs'),new RegExp(manifest.wasmSha256));
assert.ok(!modules.has('debian/sesiones-cluster.mjs'),'No retocar identidades ni validación de guardados para hacer pasar el experimento');
const routes=[];const experiment=await instalarExperimentoPIC({route:async(pattern,handler)=>routes.push({pattern,handler})});
assert.equal(experiment.actualWasmSha256,manifest.wasmSha256);
let continued=false;
await routes[0].handler({request:()=>({url:()=> 'http://127.0.0.1:4189/laboratorios/kubernetes-real/debian/ejercicios-avanzados.mjs'}),continue:()=>{continued=true;}});
assert.equal(continued,true,'Nunca interceptar los enunciados o correctores');
let binary;
await routes[0].handler({request:()=>({url:()=> 'http://127.0.0.1:4189/laboratorios/kubernetes-real/motor-experimento/v86-pic-v1.wasm'}),fulfill:value=>{binary=value;}});
assert.equal(binary.contentType,'application/wasm');assert.ok(binary.body.equals(wasm));
console.log('PIC: motor candidato íntegro, TSC sin cambios, experimento solo QA y sin modificar guardados ni correctores. No acredita aún Linux ni compatibilidad de estado.');
