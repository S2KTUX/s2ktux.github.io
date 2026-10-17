// En local se conservan las rutas originales. La entrega pública fija una
// revisión inmutable del MISMO repositorio para los archivos grandes.
const PUBLIC_BASE='https://raw.githubusercontent.com/S2KTUX/s2ktux.github.io/82f7db652c378f6599658cc102c3d56d83fa90d0/kubernetes/v1/';
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
  if(file==='v86-jit8192.wasm')return new URL('binarios/5f752e916bef9d76889fe0d14f73bb0e611abe2a5d6abdedca8b50da480bf3ac.wasm',remote);
  throw Error('Este recurso no forma parte de la entrega pública');
 };
}
export const recursoPesado=crearResolverRecursos(PUBLIC_BASE);
