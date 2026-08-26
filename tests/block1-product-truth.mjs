import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read=(path)=>readFileSync(path,'utf8');
assert.ok(existsSync('LICENSE'),'LICENSE debe existir');
assert.match(read('LICENSE'),/MIT License/,'LICENSE debe conservar MIT para el código');
assert.match(read('LICENSE'),/CC BY-NC-SA 4\.0/,'LICENSE debe conservar CC BY-NC-SA 4.0 para el contenido');
assert.match(read('sobre.html'),/código del simulador[\s\S]*licencia MIT[\s\S]*CC BY-NC-SA 4\.0/i,'Sobre debe explicar el alcance de la licencia dual');
assert.match(read('sobre.html'),/Plausible Analytics/);
assert.ok(read('ROADMAP.md').includes('solución definitiva mientras S2KTUX viva exclusivamente en \u0060s2ktux.github.io\u0060'));
assert.equal((read('ROADMAP.md').match(/\*\*Estado: completada y validada\.\*\*/g)||[]).length,5,'las cinco fases deben figurar completadas');

for(const path of ['_lpic/101/1.inc','_lpic/103/3.inc','cursos/lpic-1/tema-101-arquitectura-del-sistema/index.html','cursos/lpic-1/tema-103-comandos-gnu-y-unix/index.html']){
  const html=read(path);
  assert.doesNotMatch(html,/VER VIDEO YOUTUBE|youtu\.be\/enwp35IHCic|class=\"video-card\"/,path+' no debe anunciar vídeo');
}

const routes=read('_redirects').split(/\r?\n/).map(line=>line.trim()).filter(line=>line.startsWith('/')).map(line=>line.split(/\s+/));
assert.equal(routes.length,25);
for(const [oldPath,newPath] of routes){
  const html=read(oldPath.slice(1));
  assert.ok(html.includes('<meta http-equiv=\"refresh\" content=\"0;url='+newPath+'\">'),oldPath+' debe redirigir sin demora');
  assert.ok(html.includes('<link rel=\"canonical\" href=\"https://s2ktux.github.io'+newPath+'\">'),oldPath+' debe canonizar hacia la URL nueva');
  assert.ok(!html.includes('<link rel=\"canonical\" href=\"https://s2ktux.github.io'+oldPath+'\">'),oldPath+' no puede canonizar hacia sí misma');
}
console.log('✓ Bloque 1: producto, privacidad, fases y 25 puentes verificados');
