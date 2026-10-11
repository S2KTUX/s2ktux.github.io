// Misma política de destinos públicos que el laboratorio Linux publicado.
export function isPublicIPv4(a){
 if(a.length!==4||a.some(n=>!Number.isInteger(n)||n<0||n>255))return false;
 const [x,y,z]=a;
 return !(x===0||x===10||x===127||x>=224||x===169&&y===254||x===172&&y>=16&&y<=31||x===192&&(y===168||y===0||y===2)||x===100&&y>=64&&y<=127||x===198&&(y===18||y===19||y===51&&z===100)||x===203&&y===0&&z===113);
}
