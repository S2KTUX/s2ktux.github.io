// Operaciones puras del sistema de archivos virtual. No conocen el DOM,
// localStorage ni el modo activo y pueden ejecutarse fuera del hilo principal.
export const createDirectory=(children={},options={})=>({type:'dir',children,mode:options.mode||'rwxr-xr-x',owner:options.owner||'root',group:options.group||'root',mtime:options.mtime||Date.now()});
export const createFile=(content='',options={})=>({type:'file',content,mode:options.mode||'rw-r--r--',owner:options.owner||'root',group:options.group||'root',mtime:options.mtime||Date.now()});

export function normalizeVirtualPath(value,cwd=[],home=['root']){
  let path=String(value??''),segments;
  if(path.startsWith('/'))segments=[];
  else if(path==='~'||path.startsWith('~/')){segments=home.slice();path=path.slice(1);}
  else segments=cwd.slice();
  for(const part of path.split('/')){if(!part||part==='.')continue;if(part==='..')segments.pop();else segments.push(part);}
  return segments;
}

export function resolveVirtualNode(root,segments,followFinal=true,seen=new Set()){
  let node=root;const resolved=[];
  for(let index=0;index<segments.length;index+=1){
    const name=segments[index];
    if(!node||node.type!=='dir'||!node.children[name])return null;
    node=node.children[name];resolved.push(name);
    if(node.type!=='symlink'||(!followFinal&&index===segments.length-1))continue;
    const key=resolved.join('/');if(seen.has(key))return null;seen.add(key);
    const target=String(node.target||''),base=target.startsWith('/')?[]:resolved.slice(0,-1);
    for(const part of target.split('/')){if(!part||part==='.')continue;if(part==='..')base.pop();else base.push(part);}
    return resolveVirtualNode(root,base.concat(segments.slice(index+1)),followFinal,seen);
  }
  return node;
}

export const resolveVirtualParent=(root,segments)=>resolveVirtualNode(root,segments.slice(0,-1));

export function ensureVirtualDirectory(root,value,options={}){
  let node=root;
  for(const name of String(value).split('/').filter(Boolean)){
    if(!node||node.type!=='dir')return null;
    if(!node.children[name])node.children[name]=createDirectory({},options);
    node=node.children[name];
  }
  return node;
}

export function displayVirtualPath(segments,home=['root']){
  if(segments.length>=home.length&&home.every((part,index)=>segments[index]===part)){
    const rest=segments.slice(home.length);return '~'+(rest.length?'/'+rest.join('/'):'');
  }
  return '/'+segments.join('/');
}

export function hasVirtualPermission(node,permission,userName,users){
  if(!node)return false;if(userName==='root')return true;
  const user=users[userName]||{groups:[]},acl=node.acl||[];
  const direct=acl.find(entry=>entry.type==='user'&&entry.name===userName);
  const group=acl.find(entry=>entry.type==='group'&&(user.groups||[]).includes(entry.name));
  if(direct)return String(direct.perms||'').includes(permission);
  if(group)return String(group.perms||'').includes(permission);
  const mode=node.mode||'rw-r--r--',base=node.owner===userName?0:((user.groups||[]).includes(node.group)?3:6);
  return mode[base+({r:0,w:1,x:2})[permission]]===permission;
}

export function canTraverseVirtualPath(root,segments,userName,users){
  let node=root;
  for(const name of segments){if(!node||node.type!=='dir'||!hasVirtualPermission(node,'x',userName,users))return false;node=node.children[name];}
  return true;
}