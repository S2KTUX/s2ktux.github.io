export const materialesHash='880c795f3cbddbc6c4bd8539a5eeb7b8a435fc998a7dbd196d1179bcc8badb26';
export const materialesURL='https://raw.githubusercontent.com/S2KTUX/s2ktux.github.io/239a46e5f457236bb18b52993e654879e14bda39/laboratorios/kubernetes-real/recursos/curso-debian-v1/materiales.json.gz';
const cached='/tmp/s2ktux-materiales-'+materialesHash.slice(0,16)+'.json.gz';
export const ordenDescargarMateriales='if test -e '+cached+'; then test -f '+cached+'; else curl --fail --location --connect-timeout 10 --max-time 45 '+materialesURL+' -o '+cached+'; fi && test "$(sha256sum '+cached+' | cut -d " " -f 1)" = '+materialesHash;
export const ordenInstalarMateriales='set -eu; test ! -e /opt/curso && test ! -e /opt/.s2ktux-curso-preparando; test "$(sha256sum '+cached+' | cut -d " " -f 1)" = '+materialesHash+'; gzip -dc '+cached+' | jq -r \'.files[] | [.path,.sha256,.base64] | @tsv\' > /tmp/s2ktux-materiales.tsv; mkdir /opt/.s2ktux-curso-preparando; while IFS="$(printf "\\t")" read -r name checksum content; do printf "%s" "$content" | base64 -d > /tmp/s2ktux-material; test "$(sha256sum /tmp/s2ktux-material | cut -d " " -f 1)" = "$checksum"; install -D -m 644 /tmp/s2ktux-material "/opt/.s2ktux-curso-preparando/$name"; done < /tmp/s2ktux-materiales.tsv; (cd /opt/.s2ktux-curso-preparando && sha256sum -c SHA256SUMS); test ! -e /opt/curso && mv -T -n /opt/.s2ktux-curso-preparando /opt/curso && test ! -e /opt/.s2ktux-curso-preparando';
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
 // La máquina puede descargar el mismo paquete inmutable y verificado. Evita
 // cientos de envíos UART; sin Internet se conserva el transporte del navegador.
 const direct=await run('controlplane','Descargar los materiales desde Linux',ordenDescargarMateriales,90000);
 if(direct?.ok===true){
  const installed=await run('controlplane','Instalar los materiales verificados','set -eu; '+ordenInstalarMateriales,240000);
  if(installed?.ok!==true)throw Error('No se han podido instalar los materiales; no se sobrescribe la preparación parcial');return;
 }
 if(direct?.ok!==false)throw Error('No se pudo comprobar la descarga de materiales');
 for await(const command of comandosMateriales(files)){
  const result=await run('controlplane','Preparar archivos del curso','set -eu; '+command,60000);
  if(result?.ok!==true)throw Error('No se pudieron preparar los archivos del curso; no se continúa');
 }
}
