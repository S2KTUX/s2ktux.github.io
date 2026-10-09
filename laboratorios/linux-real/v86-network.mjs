// Wisp transporta TCP real. El motor también sabe fabricar ping/NTP: aquí
// se rechazan esos paquetes para no presentar respuestas ficticias como Internet.
export const INTERNET_RELAY='wisps://wisp.mercurywork.shop/v86/';
export const INTERNET_GATEWAY='10.42.0.1';
export function isPublicIPv4(a){
  if(a.length!==4||a.some(n=>!Number.isInteger(n)||n<0||n>255))return false;
  const [x,y,z]=a;
  return !(x===0||x===10||x===127||x>=224||x===169&&y===254||x===172&&y>=16&&y<=31||x===192&&(y===168||y===0||y===2)||x===100&&y>=64&&y<=127||x===198&&(y===18||y===19||y===51&&z===100)||x===203&&y===0&&z===113);
}
export function allowInternetFrame(bytes){
  if(!(bytes instanceof Uint8Array)||bytes.length<14)return false;
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),type=view.getUint16(12);
  if(type===0x0806)return bytes.length>=42&&view.getUint16(20)===1&&[...bytes.subarray(38,42)].join('.')===INTERNET_GATEWAY;
  if(type!==0x0800||bytes.length<34||bytes[14]>>4!==4)return false;
  const ihl=(bytes[14]&15)*4;
  if(ihl<20||bytes.length<14+ihl||view.getUint16(20)&0x3fff)return false;
  const dest=[...bytes.subarray(30,34)],protocol=bytes[23];
  if(protocol===6)return bytes.length>=14+ihl+20&&isPublicIPv4(dest);
  // DNS verdadero vía DoH. No UDP arbitrario, DHCP, NTP ni ICMP fabricados.
  if(protocol===17)return dest.join('.')===INTERNET_GATEWAY&&bytes.length>=14+ihl+8&&view.getUint16(14+ihl+2)===53;
  return false;
}
export function internetOptions(node){
  return {type:'ne2k',relay_url:INTERNET_RELAY,router_ip:INTERNET_GATEWAY,vm_ip:node==='2'?'10.42.0.11':'10.42.0.20',dns_method:'doh',doh_server:'cloudflare-dns.com'};
}
export function restrictInternetAdapter(adapter){
  if(!adapter||typeof adapter.send!=='function')throw Error('Este motor no ofrece el adaptador de red esperado.');
  const send=adapter.send.bind(adapter);
  adapter.send=bytes=>{
    if(!allowInternetFrame(bytes))return;
    // Linux reintentará la conexión. No enviar por un WebSocket aún cerrado
    // ni fabricar una respuesta de éxito cuando el puente no está disponible.
    if(bytes[12]===8&&bytes[13]===0&&bytes[23]===6&&adapter.wispws?.readyState!==1)return;
    send(bytes);
  };
}
