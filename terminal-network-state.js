const IPV4=/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

export function isIPv4Address(value){
  const match=String(value||'').match(IPV4);
  return Boolean(match&&match.slice(1).every(octet=>Number(octet)<=255));
}

export function sharesIpv4Subnet(left,right,prefix=24){
  if(!isIPv4Address(left)||!isIPv4Address(right)||prefix<0||prefix>32)return false;
  const asInt=value=>value.split('.').reduce((total,octet)=>(total<<8)+Number(octet),0)>>>0;
  const mask=prefix===0?0:(0xffffffff<<(32-prefix))>>>0;
  return (asInt(left)&mask)===(asInt(right)&mask);
}

export function parsePublishedPort(value){
  const match=String(value||'').trim().match(/^(?:(\d+\.\d+\.\d+\.\d+):)?(\d+):(\d+)(?:\/(tcp|udp))?$/);
  if(!match)return null;
  const hostIp=match[1]||'0.0.0.0',hostPort=Number(match[2]),containerPort=Number(match[3]);
  if(!isIPv4Address(hostIp)||hostPort<1||hostPort>65535||containerPort<1||containerPort>65535)return null;
  return {hostIp,hostPort,containerPort,protocol:match[4]||'tcp',explicitIp:Boolean(match[1])};
}

export function publishedPortEntries(spec){
  return String(spec||'').split(/\s*,\s*/).filter(Boolean).map(parsePublishedPort).filter(Boolean);
}

export function formatPublishedPorts(spec){
  const raw=String(spec||'');
  const entries=publishedPortEntries(raw);
  if(!entries.length)return raw;
  return entries.map(entry=>{
    const primary=`${entry.hostIp}:${entry.hostPort}->${entry.containerPort}/${entry.protocol}`;
    return entry.explicitIp?primary:`${primary}, [::]:${entry.hostPort}->${entry.containerPort}/${entry.protocol}`;
  }).join(', ');
}
