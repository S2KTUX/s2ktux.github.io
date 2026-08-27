import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = normalize(join(process.cwd(), process.argv[2] || '.'));
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.webmanifest':'application/manifest+json' };
http.createServer(async (req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1');
    let pathname=decodeURIComponent(url.pathname);
    if(pathname==='/' ) pathname='/index.html';
    const file=normalize(join(root,pathname));
    if(!file.startsWith(root)){res.writeHead(403);res.end('Forbidden');return;}
    const info=await stat(file);
    const target=info.isDirectory()?join(file,'index.html'):file;
    const body=await readFile(target);
    const headers={'Content-Type':types[extname(target)]||'application/octet-stream','Cache-Control':'no-store'};
    if(process.env.S2KTUX_DISABLE_WORKER==='1')headers['Content-Security-Policy']="worker-src 'none'";
    res.writeHead(200,headers);
    res.end(body);
  }catch(error){res.writeHead(404);res.end('Not found');}
}).listen(4173,'127.0.0.1',()=>console.log('S2KTUX test server on 4173'));
