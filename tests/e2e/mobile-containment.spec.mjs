import {test,expect} from '@playwright/test';
import {readdir} from 'node:fs/promises';

const paths=['/','/cursos.html','/sobre.html','/proyectos.html','/proyecto-kubernetes.html','/proyecto-proxmox.html','/terminal.html','/404.html','/laboratorios/linux-real/','/laboratorios/linux-real/examen.html','/laboratorios/docker-real/','/laboratorios/kubernetes-real/'];
for(const course of await readdir('cursos')){
 paths.push('/cursos/'+course+'/');
 for(const item of await readdir('cursos/'+course,{withFileTypes:true}))if(item.isDirectory())paths.push('/cursos/'+course+'/'+item.name+'/');
}

for(const width of [320,375,430,768])test(`Móvil · contenido dentro de sus recuadros a ${width}px @mobile`,async({page})=>{
 test.setTimeout(120_000);await page.setViewportSize({width,height:850});
 for(const path of paths){
  await page.goto(path);await page.evaluate(()=>document.fonts.ready);
  if(path==='/sobre.html')await page.locator('details').evaluateAll(nodes=>nodes.forEach(node=>node.open=true));
  for(const dark of [false,true]){
   await page.evaluate(value=>document.documentElement.classList.toggle('dark',value),dark);
   const overflow=await page.evaluate(()=>{
    const intentional=node=>{
     if(node.closest('pre,code,table,svg,.xterm,.skip-link,[aria-hidden=true],.console-scroll,.console,#img-lightbox'))return true;
     // La cinta animada y los bloques desplazables conservan su propio scroll.
     for(let parent=node;parent&&parent!==document.body;parent=parent.parentElement){
      if(['auto','scroll'].includes(getComputedStyle(parent).overflowX))return true;
      if(parent.classList.contains('u-inline-d67fb46887'))return true;
     }return false;
    };
    return [...document.querySelectorAll('main *,[role=main] *,.coursecard,.site-header-inner,.site-nav,.site-footer,.selector-current,.selector-command-wrap')].filter(node=>{
     if(intentional(node)||!node.getClientRects().length||['SCRIPT','STYLE','LINK','META'].includes(node.tagName))return false;
     const style=getComputedStyle(node),rect=node.getBoundingClientRect();
     if(style.position==='fixed'||['hidden','clip'].includes(style.overflowX))return false;
     return node.clientWidth>0&&node.scrollWidth>node.clientWidth+3||rect.right>innerWidth+3||rect.left< -3;
    }).map(node=>({tag:node.tagName,id:node.id,cls:node.className,text:node.textContent.trim().slice(0,50)})).slice(-8);
   });
   expect(overflow,`${path} · ${width}px · ${dark?'oscuro':'claro'}: texto o contenido desbordado`).toEqual([]);
  }
 }
});
