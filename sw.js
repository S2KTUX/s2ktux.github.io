const C='s2ktux-v1';
const CORE=['./','index.html','cursos.html','curso.html','leccion.html','terminal.html','proyectos.html','sobre.html','404.html','favicon.png','assets/og.png','assets/icon-192.png','assets/icon-512.png','courses-data.js','support.js','manifest.webmanifest'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(C).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()).catch(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{ const req=e.request; if(req.method!=='GET') return; const url=new URL(req.url);
  if(url.origin===location.origin){
    e.respondWith(caches.match(req).then(hit=> hit || fetch(req).then(res=>{ const cp=res.clone(); caches.open(C).then(c=>{ try{c.put(req,cp);}catch(_){}}); return res; }).catch(()=> caches.match('index.html'))));
  } else {
    e.respondWith(fetch(req).then(res=>{ const cp=res.clone(); caches.open(C).then(c=>{ try{c.put(req,cp);}catch(_){}}); return res; }).catch(()=> caches.match(req)));
  }
});