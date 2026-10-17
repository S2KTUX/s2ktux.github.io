export const materialesHash='880c795f3cbddbc6c4bd8539a5eeb7b8a435fc998a7dbd196d1179bcc8badb26';
const digest=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),byte=>byte.toString(16).padStart(2,'0')).join('');
export async function validarMateriales(value){
 if(value?.format!=='s2ktux-kubernetes-course-materials-v1'||!Array.isArray(value.files)||value.files.length<1||value.files.length>48)throw Error('Materiales de curso no válidos');
 const names=new Set(),files=[];let total=0;
 for(const file of value.files){
  if(typeof file.path!=='string'||!/^([A-Za-z0-9_-]+\/)*[A-Za-z0-9_.+-]+$/.test(file.path)||file.path.split('/').some(part=>part==='.'||part==='..')||names.has(file.path)||!Number.isSafeInteger(file.bytes)||file.bytes<1||file.bytes>1048576||!/^[a-f0-9]{64}$/.test(file.sha256)||typeof file.base64!=='string'||file.base64.length>1400000)throw Error('Archivo del curso no válido');
  const text=atob(file.base64),bytes=Uint8Array.from(text,char=>char.charCodeAt(0));if(bytes.length!==file.bytes||await digest(bytes)!==file.sha256)throw Error('Archivo de curso alterado');
  total+=bytes.length;if(total>4*1048576)throw Error('Materiales demasiado grandes');names.add(file.path);files.push({...file,data:bytes});
 }
 if(!names.has('SHA256SUMS')||!names.has('README.md'))throw Error('Materiales incompletos');return files;
}
export async function* comandosMateriales(files){
 files=await validarMateriales({format:'s2ktux-kubernetes-course-materials-v1',files});
 yield 'test ! -e /opt/curso && test ! -e /opt/.s2ktux-curso-preparando && mkdir -p /opt/.s2ktux-curso-preparando';
 for(const file of files){
  const compressed=new Uint8Array(await new Response(new Blob([file.data]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());let encoded='';
  for(let at=0;at<compressed.length;at+=4096)encoded+=String.fromCharCode(...compressed.subarray(at,at+4096));encoded=btoa(encoded);
  yield ': >/tmp/s2ktux-material.gz';
  for(let at=0;at<encoded.length;at+=2000)yield `printf '%s' '${encoded.slice(at,at+2000)}' | base64 -d >>/tmp/s2ktux-material.gz`;
  yield `gzip -dc /tmp/s2ktux-material.gz >/tmp/s2ktux-material && test "$(sha256sum /tmp/s2ktux-material | cut -d ' ' -f 1)" = ${file.sha256} && install -D -m 644 /tmp/s2ktux-material /opt/.s2ktux-curso-preparando/${file.path}`;
 }
 yield '(cd /opt/.s2ktux-curso-preparando && sha256sum -c SHA256SUMS) && test ! -e /opt/curso && mv -T -n /opt/.s2ktux-curso-preparando /opt/curso && test ! -e /opt/.s2ktux-curso-preparando';
}
export async function prepararMaterialesCurso(run){
 const response=await fetch(new URL('../recursos/curso-debian-v1/materiales.json.gz',import.meta.url));if(!response.ok)throw Error('Archivos del curso no disponibles');
 const packed=await response.arrayBuffer();if(packed.byteLength>1048576||await digest(packed)!==materialesHash)throw Error('Paquete de curso alterado');
 const raw=await new Response(new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'))).text();if(raw.length>8*1048576)throw Error('Paquete demasiado grande');
 const files=await validarMateriales(JSON.parse(raw));
 for await(const command of comandosMateriales(files)){
  const result=await run('controlplane','Preparar archivos del curso','set -eu; '+command,60000);
  if(result?.ok!==true)throw Error('No se pudieron preparar los archivos del curso; no se continúa');
 }
}
