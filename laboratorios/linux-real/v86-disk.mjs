// Adaptador de bloques real: base inmutable por HTTPS y escrituras privadas en RAM.
// No necesita peticiones Range, WebSocket ni un backend que ejecute comandos.
export class ChunkDisk {
  constructor(manifest,base,onError=()=>{},capacity=192){
    if(manifest.format!=='s2ktux-blocks-v1'||manifest.chunkSize!==1048576||manifest.parts.length!==Math.ceil(manifest.bytes/manifest.chunkSize))throw Error('Disco inválido');
    this.manifest=manifest;this.base=base;this.byteLength=manifest.bytes;this.onload=null;this.onprogress=null;
    this.capacity=capacity;this.clean=new Map();this.dirty=new Map();this.pending=new Map();this.operations=new Set();this.onError=onError;this.failure=null;
    this.stats={requests:0,downloadedBytes:0,reads:0,writes:0};
  }
  load(){this.onload?.({});}
  async chunk(index){
    if(this.dirty.has(index))return this.dirty.get(index);
    if(this.clean.has(index)){const b=this.clean.get(index);this.clean.delete(index);this.clean.set(index,b);return b;}
    if(!this.pending.has(index))this.pending.set(index,(async()=>{
      const part=this.manifest.parts[index];if(!part)throw Error('Fragmento inexistente');
      let data;
      if(part.zero)data=new Uint8Array(part.bytes);
      else{
        const response=await fetch(new URL('fragmentos/'+part.file,this.base));if(!response.ok)throw Error('Descarga incompleta: '+response.status);
        const packed=new Uint8Array(await response.arrayBuffer());this.stats.requests++;this.stats.downloadedBytes+=packed.length;
        const hash=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
        if(await hash(packed)!==part.packedSha256)throw Error('Hash del fragmento comprimido incorrecto');
        data=new Uint8Array(await new Response(new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
        if(data.length!==part.bytes||await hash(data)!==part.sha256)throw Error('Fragmento alterado');
      }
      this.clean.set(index,data);if(this.clean.size>this.capacity)this.clean.delete(this.clean.keys().next().value);
      return data;
    })().finally(()=>this.pending.delete(index)));
    const downloaded=await this.pending.get(index);
    // Una escritura concurrente prevalece sobre el fragmento base descargado.
    return this.dirty.get(index)||downloaded;
  }
  bounds(offset,len){if(!Number.isSafeInteger(offset)||!Number.isSafeInteger(len)||offset<0||len<0||offset+len>this.byteLength)throw Error('Acceso fuera del disco');}
  get(offset,len,callback){
    this.bounds(offset,len);this.stats.reads++;
    const result=new Uint8Array(len),size=this.manifest.chunkSize;
    const indexes=[];for(let at=offset;at<offset+len;) {indexes.push(Math.floor(at/size));at=Math.min(offset+len,(Math.floor(at/size)+1)*size);}
    this.track(Promise.all(indexes.map(i=>this.chunk(i))).then(blocks=>{
      let done=0;for(let n=0;n<indexes.length;n++){const within=(offset+done)%size,amount=Math.min(len-done,blocks[n].length-within);result.set((this.dirty.get(indexes[n])||blocks[n]).subarray(within,within+amount),done);done+=amount;}
      callback(result);
    }));
  }
  set(offset,data,callback){
    this.bounds(offset,data.length);this.stats.writes++;
    const size=this.manifest.chunkSize,copy=data.slice();
    this.track((async()=>{
      for(let done=0;done<copy.length;){const at=offset+done,index=Math.floor(at/size),within=at%size,n=Math.min(copy.length-done,size-within);
        if(!this.dirty.has(index)){const initial=await this.chunk(index);if(!this.dirty.has(index))this.dirty.set(index,initial.slice());this.clean.delete(index);}
        this.dirty.get(index).set(copy.subarray(done,done+n),within);done+=n;
      }
      callback();
    })());
  }
  track(promise){
    this.operations.add(promise);
    promise.catch(error=>{this.failure=error;this.onError(error);}).finally(()=>this.operations.delete(promise));
  }
  async settle(){
    while(this.operations.size||this.pending.size)await Promise.all([...this.operations,...this.pending.values()]);
    if(this.failure)throw this.failure;
  }
  get_state(){return [Array.from(this.dirty,([i,b])=>[i,b])];}
  set_state(state){this.dirty=new Map(state[0]);this.clean.clear();}
}
