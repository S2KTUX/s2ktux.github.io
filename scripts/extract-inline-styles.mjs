import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const cssUrl=new URL('../visual-system.css',import.meta.url);
const begin='/* S2KTUX_EXTRACTED_INLINE_STYLES_BEGIN */';
const end='/* S2KTUX_EXTRACTED_INLINE_STYLES_END */';
const originalCss=await readFile(cssUrl,'utf8');
const styles=new Map();
for(const match of originalCss.matchAll(/\.(u-inline-[a-f0-9]+)\{([^}]*)\}/g))styles.set(match[1],match[2]);

const walk=async directory=>{
  const entries=await readdir(directory,{withFileTypes:true});
  const files=[];
  for(const entry of entries){
    if(['.git','_site','node_modules','playwright-report','test-results'].includes(entry.name))continue;
    const path=join(directory,entry.name);
    if(entry.isDirectory())files.push(...await walk(path));
    else if(['.html','.inc'].includes(extname(entry.name)))files.push(path);
  }
  return files;
};

const classFor=style=>{
  const normalized=style.trim().replace(/\s*;?\s*$/,';');
  const name='u-inline-'+createHash('sha256').update(normalized).digest('hex').slice(0,10);
  styles.set(name,normalized);
  return name;
};

for(const path of await walk(root)){
  const source=await readFile(path,'utf8');
  const output=source.replace(/<[^>]*\sstyle="[^"]*"[^>]*>/g,tag=>{
    const match=tag.match(/\sstyle="([^"]*)"/);
    if(!match)return tag;
    const name=classFor(match[1]);
    let next=tag.replace(match[0],'');
    if(/\sclass="[^"]*"/.test(next))next=next.replace(/\sclass="([^"]*)"/,(_,value)=>` class="${value} ${name}"`);
    else next=next.replace(/^<([\w-]+)/,`<$1 class="${name}"`);
    return next;
  });
  if(output!==source)await writeFile(path,output);
}

const rules=[...styles].sort(([a],[b])=>a.localeCompare(b)).map(([name,style])=>`.${name}{${style}}`).join('\n');
const pattern=new RegExp(`${begin.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`);
const block=`${begin}\n${rules}\n${end}`;
await writeFile(cssUrl,pattern.test(originalCss)?originalCss.replace(pattern,block):originalCss.trimEnd()+`\n\n${block}\n`);

console.log(`Extraídos ${styles.size} estilos únicos a visual-system.css`);
