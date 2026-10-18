import {parseDockerImageReference,defaultDockerImageCommand} from './terminal-docker-state.js';

export function dockerHttpRoot(container){
 const {repo}=parseDockerImageReference(container?.image);
 const command=container?.cmd||defaultDockerImageCommand(repo);
 if(repo==='nginx'&&/(?:^|\s)nginx(?:\s|$)/.test(command))return '/usr/share/nginx/html';
 if(repo==='httpd'&&/httpd/.test(command))return '/usr/local/apache2/htdocs';
 return '';
}

export function dockerImageFiles(reference){
 const root=dockerHttpRoot({image:reference});
 return root?{[root+'/index.html']:'<!DOCTYPE html><html><body><h1>'+(root.includes('nginx')?'Welcome to nginx!':'It works!')+'</h1></body></html>\n'}:{};
}

export function dockerHttpDocument(container,pathname='/',readHost=()=>undefined,readVolume=()=>undefined){
 const root=dockerHttpRoot(container);
 if(!root)return undefined;
 const path=root+(pathname.endsWith('/')?pathname+'index.html':pathname);
 const mount=(container.mounts||[]).filter(item=>path===item.target||path.startsWith(item.target+'/')).sort((a,b)=>b.target.length-a.target.length)[0];
 if(mount){
  const relative=path.slice(mount.target.length)||'/';
  return mount.type==='bind'?readHost(mount.source+relative):readVolume(mount.source,relative);
 }
 return container.fs?.[path];
}
