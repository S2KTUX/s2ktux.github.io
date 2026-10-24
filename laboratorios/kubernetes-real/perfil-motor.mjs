import {V86 as OriginalV86} from '/laboratorios/docker-real/motor/libv86-rhcsa.mjs';
import {hashBytes} from '/laboratorios/docker-real/v86-sessions.mjs';
import {recursoPesado} from './recursos-publicados.mjs';
export const originalEngineHash='c064c94714c4b8eeace32782a4013b6132a2331ba5c008abfd67274cc2d29caf';
export const extendedEngineHash='5f752e916bef9d76889fe0d14f73bb0e611abe2a5d6abdedca8b50da480bf3ac';
export const clockEngineHash='af9714105657e52b3a3b0046f3718f0d58c475060b4bdfd31973dfe3d9b1989f';
export const picEngineHash='2b81820d3c4f0c4928cdc13ed18312e4bb30ba674a6e2c04e5c2601d2ed705c9';
export const picOnlyEngineHash='b31b2045a1ac53ce90e2ead888455b993a24a8c3433a5985ed21e95da47eddef';
export function engineHash(variant='original'){
 if(variant==='original')return originalEngineHash;
 if(variant==='jit8192')return extendedEngineHash;
 if(variant==='jit8192-tsc-v1')return clockEngineHash;
 if(variant==='jit8192-pic-v1')return picEngineHash;
 if(variant==='jit8192-pic-only-v1')return picOnlyEngineHash;
 throw Error('Variante de motor no admitida');
}
export async function loadEngine(variant='original',onError=()=>{}){
 engineHash(variant);
 if(variant==='original')return {V86:OriginalV86};
 const front=new URL('motor-experimento/libv86-jit8192.mjs',import.meta.url),wasm=new URL(variant==='jit8192-pic-only-v1'?'motor-experimento/v86-pic-only-v1.wasm':variant==='jit8192-pic-v1'?'motor-experimento/v86-pic-v1.wasm':variant==='jit8192-tsc-v1'?'motor-experimento/v86-tsc-v2.wasm':'motor-experimento/v86-jit8192.wasm',import.meta.url);
 async function checked(url,expected){
  const response=await fetch(url);if(!response.ok)throw Error('El motor experimental no está disponible');
  const bytes=await response.arrayBuffer();if(await hashBytes(bytes)!==expected)throw Error('El motor experimental está alterado');return bytes;
 }
 const [,bytes]=await Promise.all([checked(front,'1ecbc7853d3da1331e935531424aa729216a2148690345a2ceda2983eb1f2659'),checked(recursoPesado(wasm),engineHash(variant))]);
 const {V86}=await import(front.href);
 return {V86,wasm_fn:async env=>{try{return (await WebAssembly.instantiate(bytes,env)).instance.exports;}catch(error){onError(error);throw error;}}};
}
