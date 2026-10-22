import {readFile,writeFile} from 'node:fs/promises';
import {gunzipSync,gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {validarMateriales,materialesHash} from '../laboratorios/kubernetes-real/debian/materiales-curso.mjs';
const root=new URL('../laboratorios/kubernetes-real/recursos/curso-debian-v1/',import.meta.url);
const original=await readFile(new URL('materiales.json.gz',root));
if(createHash('sha256').update(original).digest('hex')!==materialesHash)throw Error('Fuente alterada');
const files=await validarMateriales(JSON.parse(gunzipSync(original)));
// USTAR determinista: únicamente archivos normales, sin enlaces ni rutas externas.
const chunks=[];
for(const file of files){
 const header=Buffer.alloc(512),data=Buffer.from(file.data);
 if(Buffer.byteLength(file.path)>99)throw Error('Ruta demasiado larga');
 header.write(file.path);header.write('0000644\0',100);header.write('0000000\0',108);header.write('0000000\0',116);
 header.write(data.length.toString(8).padStart(11,'0')+'\0',124);header.write('00000000000\0',136);header.fill(32,148,156);header.write('0',156);header.write('ustar\0',257);header.write('00',263);
 header.write([...header].reduce((a,b)=>a+b,0).toString(8).padStart(6,'0')+'\0 ',148);
 chunks.push(header,data,Buffer.alloc((512-data.length%512)%512));
}
chunks.push(Buffer.alloc(1024));
const packed=gzipSync(Buffer.concat(chunks),{level:9});
await writeFile(new URL('materiales.tar.gz',root),packed);
console.log(JSON.stringify({bytes:packed.length,sha256:createHash('sha256').update(packed).digest('hex'),files:files.length}));
