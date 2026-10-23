import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../fixtures/kubernetes-pic-only/',import.meta.url);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function fuentesExperimentoPIC(){
 const manifest=JSON.parse(await readFile(new URL('manifest.json',root),'utf8'));
 if(manifest.status!=='qa-only-state-compatibility-experiment'||manifest.parentWasmSha256!=='5f752e916bef9d76889fe0d14f73bb0e611abe2a5d6abdedca8b50da480bf3ac')throw Error('Experimento PIC no identificado');
 const wasm=await readFile(new URL('v86.wasm',root));
 if(hash(wasm)!==manifest.wasmSha256)throw Error('WASM candidato alterado');
 for(const [file,key]of [['pic.rs','picSourceSha256'],['cpu.rs','unchangedCPUSourceSha256']])if(hash((await readFile(new URL(file,root),'utf8')).replaceAll('\r\n','\n'))!==manifest[key])throw Error('Fuentes candidatas alteradas');
 const moduleRoot=new URL('../laboratorios/kubernetes-real/',import.meta.url);
 const modules=new Map();
 const replace=(source,pattern,replacement)=>{const matches=source.match(new RegExp(pattern.source,pattern.flags.includes('g')?pattern.flags:pattern.flags+'g'));if(matches?.length!==1)throw Error('El experimento no reconoce el módulo original');return source.replace(pattern,replacement);};
 let client=await readFile(new URL('debian/cliente.mjs',moduleRoot),'utf8');
 client=replace(client,/const engineVariant=new URL\(location.href\).searchParams.get\('engine'\)\|\|'jit8192';engineHash\(engineVariant\);/,"const engineVariant='jit8192-pic-v1';engineHash(engineVariant);");
 client=replace(client,/^if\(engineVariant!=='jit8192'[^\n]+$/m,"if(engineVariant!=='jit8192-pic-v1'||base!=='v6'||factoryVersion!=='v6'||tlsMode!=='classical')throw Error('El experimento PIC solo admite la fábrica v6 de QA');");
 modules.set('debian/cliente.mjs',client);
 let engine=await readFile(new URL('perfil-motor.mjs',moduleRoot),'utf8');
 engine=replace(engine,/export const picEngineHash='[a-f0-9]{64}';/,"export const picEngineHash='"+manifest.wasmSha256+"';");modules.set('perfil-motor.mjs',engine);
 let resources=await readFile(new URL('recursos-publicados.mjs',moduleRoot),'utf8');
 resources=replace(resources,/  throw Error\('Este recurso no forma parte de la entrega pública'\);/,"  if(file==='v86-pic-v1.wasm')return url;\n  throw Error('Este recurso no forma parte de la entrega pública');");modules.set('recursos-publicados.mjs',resources);
 return {manifest,wasm,modules};
}
export async function instalarExperimentoPIC(context){
 const {manifest,wasm,modules}=await fuentesExperimentoPIC();
 // Solo la red del navegador de QA. Los tres módulos de producción se
 // mantienen intactos; no se falsifican respuestas Linux, API ni correctores.
 await context.route('**/laboratorios/kubernetes-real/**',async route=>{
  const url=new URL(route.request().url()),name=url.pathname.split('/laboratorios/kubernetes-real/')[1];
  if(name==='motor-experimento/v86-pic-v1.wasm')return route.fulfill({status:200,contentType:'application/wasm',body:wasm});
  if(modules.has(name))return route.fulfill({status:200,contentType:'text/javascript; charset=utf-8',body:modules.get(name)});
  return route.continue();
 });
 return {variant:manifest.variant,sourceFactory:'v6 (immutable, unchanged)',actualWasmSha256:manifest.wasmSha256,parentWasmSha256:manifest.parentWasmSha256,persistence:'not accepted; student sessions are not loaded'};
}
