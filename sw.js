const C='s2ktux-v3';
const CORE=['./','index.html','cursos.html','curso.html','leccion.html','terminal.html','proyectos.html','sobre.html','404.html','favicon.png','assets/og.png','assets/icon-192.png','assets/icon-512.png','courses-data.js','support.js','manifest.webmanifest'];
self.addEventListener('install',e=>{ self.skipWaiting(); e.waitUntil(caches.open(C).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))).catch(()=>{})); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{ const req=e.request; if(req.method!=='GET') return; const url=new URL(req.url); const isDoc = req.mode==='navigate' || (url.origin===location.origin && /\.(html|js|css|webmanifest|json)$/.test(url.pathname));
  if(url.origin===location.origin && isDoc){
    // network-first: siempre intenta la versión más reciente, cae a caché sin conexión
    e.respondWith(fetch(req).then(res=>{ const cp=res.clone(); caches.open(C).then(c=>{ try{c.put(req,cp);}catch(_){}}); return res; }).catch(()=> caches.match(req).then(h=> h || caches.match('index.html'))));
  } else {
    // recursos externos y binarios: stale-while-revalidate
    // (sirve la caché al instante pero revalida en segundo plano, así una
    //  entrada rota —p.ej. un 404 opaco cacheado— se auto-repara al recargar)
    e.respondWith(caches.match(req).then(hit=>{
      const net = fetch(req).then(res=>{ const cp=res.clone(); caches.open(C).then(c=>{ try{c.put(req,cp);}catch(_){}}); return res; }).catch(()=>hit);
      return hit || net;
    }));
  }
});
