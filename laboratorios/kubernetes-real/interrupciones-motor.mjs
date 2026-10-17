// Instantánea de registros: no llama a ACK/EOI ni modifica dispositivos.
export function readInterruptState(vm){
 const cpu=vm?.v86?.cpu;
 if(!cpu?.wasm_memory?.buffer||typeof cpu.get_pic_addr_master!=='function'||typeof cpu.get_pic_addr_slave!=='function')throw Error('PIC no disponible para diagnóstico');
 const read=address=>{
  const bytes=new Uint8Array(cpu.wasm_memory.buffer,address,13);
  return {enabledMask:bytes[0],vectorBase:bytes[1],inService:bytes[2],pending:bytes[3],autoEOI:!!bytes[9],levelMask:bytes[10],inputLines:bytes[11]};
 };
 return {master:read(cpu.get_pic_addr_master()),slave:read(cpu.get_pic_addr_slave())};
}
