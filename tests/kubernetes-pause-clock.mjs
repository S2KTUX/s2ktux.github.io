import assert from 'node:assert/strict';
import {relojPausable,motorConRelojPausable} from '../laboratorios/kubernetes-real/reloj-pausable.mjs';
let host=100;const clock=relojPausable(()=>host);assert.equal(clock.now(),100);host=200;clock.pause();host+=3600000;assert.equal(clock.now(),200);clock.pause();clock.resume();assert.equal(clock.now(),200);host+=20;assert.equal(clock.now(),220);clock.resume();assert.equal(clock.now(),220);
class Fake{constructor(settings){this.settings=settings;this.events={};this.v86={constructor:{microtick:()=>0}};this.run=()=>true;this.destroy=()=>true;}add_listener(name,fn){this.events[name]=fn;}}
const events=new EventTarget(),Wrapped=motorConRelojPausable(Fake,async env=>env.env.microtick(),events),vm=new Wrapped({});vm.events['emulator-loaded']();const before=vm.v86.constructor.microtick();vm.events['emulator-stopped']();assert.ok(vm.v86.constructor.microtick()>=before);assert.equal(vm.run(),true);assert.equal(vm.destroy(),true);
const realDateNow=Date.now;let importedClock;
const Coupled=motorConRelojPausable(Fake,async env=>{importedClock=env.env.microtick;assert.equal(env.env.unchanged,42);},events),coupled=new Coupled({});
await coupled.settings.wasm_fn({env:{microtick:()=>-1,unchanged:42}});coupled.events['emulator-loaded']();assert.equal(coupled.v86.constructor.microtick,importedClock,'CPU y dispositivos deben compartir exactamente el mismo reloj');
events.dispatchEvent(new Event('freeze'));const stopped=importedClock();await new Promise(r=>setTimeout(r,20));assert.equal(importedClock(),stopped);events.dispatchEvent(new Event('resume'));assert.ok(importedClock()>=stopped);assert.equal(Date.now,realDateNow,'No modificar el tiempo real del examen');coupled.destroy();
console.log('El hardware excluye pausas explícitas; no modifica Date.now ni el cronómetro del examen.');
