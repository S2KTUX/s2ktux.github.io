// En local se conservan las rutas originales. La entrega pública fija una
// revisión inmutable del MISMO repositorio para los archivos grandes.
const PUBLIC_BASE='https://raw.githubusercontent.com/S2KTUX/s2ktux.github.io/599f0e06c2301510bd498a2a9d1fd484c60aaf1c/kubernetes/v1/';
export function crearResolverRecursos(base){
 let remote;
 if(base!==null){
  remote=new URL(base);
  if(remote.origin!=='https://raw.githubusercontent.com'||!/^\/S2KTUX\/s2ktux\.github\.io\/[a-f0-9]{40}\/kubernetes\/v1\/$/.test(remote.pathname)||remote.search||remote.hash||remote.username||remote.password)throw Error('Origen de recursos no permitido');
 }
 return input=>{
  const url=new URL(input);
  if(!remote)return url;
  const file=url.pathname.split('/').at(-1);
  if(/^[a-f0-9]{64}\.(?:gz|part)$/.test(file))return new URL('fragmentos/'+file,remote);
  if(url.pathname.endsWith('/kernel/v1/vmlinuz'))return new URL('binarios/7266ac03849dd287b8e672d8ae9e882d6eb3c1bcd5e88d951132c2614b56cd96.bin',remote);
  if(url.pathname.endsWith('/kernel/highmem-v1/vmlinuz'))return new URL('binarios/356959ed6da96e90c2e446a7d3c74b6cfcb55a3785d5056e6f2ea22a0caaca25.bin',remote);
  if(url.pathname.endsWith('/kernel/highmem-net-v2/vmlinuz'))return new URL('binarios/709c16f5901b0474056926e79eae1f1822c1fb154104cd80872f7d049d269891.bin',remote);
  if(file==='v86-jit8192.wasm')return new URL('binarios/5f752e916bef9d76889fe0d14f73bb0e611abe2a5d6abdedca8b50da480bf3ac.wasm',remote);
  if(file==='v86-pic-v1.wasm')return new URL('binarios/2b81820d3c4f0c4928cdc13ed18312e4bb30ba674a6e2c04e5c2601d2ed705c9.wasm',remote);
  if(file==='v86-pic-only-v1.wasm')return new URL('binarios/b31b2045a1ac53ce90e2ead888455b993a24a8c3433a5985ed21e95da47eddef.wasm',remote);
  throw Error('Este recurso no forma parte de la entrega pública');
 };
}
export const recursoPesado=crearResolverRecursos(PUBLIC_BASE);
