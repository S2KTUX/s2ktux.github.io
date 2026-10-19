import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lab = join(root, 'laboratorios/linux-real');
const original = JSON.parse(await readFile(join(lab, 'publicacion.json'), 'utf8'));
const permitted = new Set(['index.html', 'licencias/LEEME.md', 'licencias/LEEME.html', 'v86-test.html', 'PRACTICAS_V86.html', 'CHULETA_LINUX_REAL.html', 'GUIA_CURSO_LABORATORIO.html', 'v86-test.mjs', 'v86-check-runner.mjs', 'v86-exercise-panel.mjs', 'v86-exercises.mjs', 'v86-course-exercises.mjs', 'v86-extra-exercises.mjs']);
const obsoleteDocs=new Set(['CHULETA_LINUX_REAL.md','GUIA_CURSO_LABORATORIO.md','PRACTICAS_V86.md','COMO_SE_PUBLICA.md','ENTREGA_LINUX_REAL.md','ESTADO_VALIDACION.md']);
// Ajustes presentes ya en la publicación anterior: avisos de SoftFloat y
// normalización de finales de línea de xterm. Se fijan sus bytes conocidos;
// no se permite aquí ninguna modificación nueva de esas dependencias.
const inheritedFiles={
 'licencias/softfloat-con-avisos.c':'2d7fed55bea49ff38635f93770e99345ef7f86721b9fa5b9eeec2d829fe5d12b',
 'vendor/xterm.mjs':'b336ec65a086c056d4804b3d4c2347da5663d3f23c3f25be866467bd8857ad59',
 'vendor/xterm.css':'854a7c0fb70e8b1a083c16797ab827299fb18744f5ad34f227b48337e33293c6',
 'vendor/LICENSE-xterm.txt':'b569f629d00f2626a8100df2a1798210535621e42164dfd426a6fe5aac7b0ccd'
};
const additions = ['linux-real.css', 'v86-clipboard.mjs', 'v86-guest-console.mjs', 'examen.html', 'v86-exam.mjs', 'v86-exam-data.mjs', 'v86-exam-setup.mjs', 'v86-exam-fixtures.mjs', 'v86-exam-console.mjs', 'v86-network.mjs', 'v86-ethernet-internet.mjs', 'v86-restart.mjs'];
const changed = [];
const removedDocumentation=[];
const inheritedAdjustments=[];
let total = 0;
for (const record of original.records) {
  const file = resolve(lab, record.path);
  if (!file.startsWith(lab + '/'.replace('/', process.platform === 'win32' ? '\\' : '/'))) throw Error('Ruta fuera del paquete');
  let bytes;
  try{bytes=await readFile(file);}catch(error){
    if(error.code!=='ENOENT'||!obsoleteDocs.has(record.path))throw error;
    removedDocumentation.push({path:record.path,before:record.sha256,reason:'Documento de prototipo obsoleto; prácticas, referencia y licencias accesibles desde las páginas actuales.'});continue;
  }
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  total += bytes.length;
  if (sha256 !== record.sha256) {
    if(inheritedFiles[record.path]){
      if(sha256!==inheritedFiles[record.path])throw Error('Dependencia de publicación anterior alterada: '+record.path);
      inheritedAdjustments.push({path:record.path,before:record.sha256,sha256,bytes:bytes.length});continue;
    }
    if (!permitted.has(record.path)) throw Error('Cambio inesperado: ' + record.path);
    changed.push({ path: record.path, before: record.sha256, sha256, bytes: bytes.length });
  }
}
const image = JSON.parse(await readFile(join(lab, 'Resultado_entrega_v86_final_v3.json'), 'utf8'));
if (image.imageSha256 !== original.imageSha256) throw Error('Se mezclaron imágenes distintas');
const addedFiles = await Promise.all(additions.map(async path => {
  const bytes = await readFile(join(lab, path));
  return {path, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length};
}));
const deployment = {
  route: '/laboratorios/linux-real/', imageSha256: original.imageSha256,
  originalFileCount: original.files, originalBytes: original.bytes,
  verifiedPackageBytes: total, modifications: changed, addedFiles, removedDocumentation, inheritedAdjustments,
  note: 'Los informes históricos describen la validación anterior. 44 prácticas y examen independiente: dos VM nuevas, inicio explícito de la segunda, 22 tareas, 3 horas y rúbrica educativa de 300 puntos (aprobado desde 210). Una pregunta cada vez, sin pistas ni puntuación durante el intento. Puede finalizarse vacío o parcial; una segunda TTY consulta resultados reales sin interrumpir el editor del alumno. Avisos discretos con asterisco. Práctica nueva sin IP inicial: Internet IPv4 mediante relay.widgetry.org autorizado, con NAT y filtrado de respuestas a tráfico TCP/UDP/ICMP iniciado por la VM; DNS y ping reales. Sin selector externo ni respuestas de ping/NTP fabricadas. Examen en red privada, sin puente externo. Los guardados conservan su configuración. La fábrica y el motor no cambian.',
  sources: { url: 'https://github.com/S2KTUX/s2ktux.github.io/releases/download/linux-real-beta-2026-10-08/fuentes-laboratorio-v3.tar.gz', bytes: 811556382, sha256: 'a3d493ab84e278f8318a85b42c5bc588f778770206844f102db8470940eb1017' },
  kind: 'beta independiente', replacesCurrentTerminal: true,
  knownLimits: ['Debian i386, no RHEL; no equivale al examen oficial', 'DNF con RPM locales, no actualiza Debian', 'Internet de práctica depende de un relay público ajeno que podría observar tráfico sin cifrar; solo IPv4 TCP/UDP/echo ICMP de salida, sin entrada no solicitada, IPv6 externo ni fragmentos IPv4. Examen privado sin acceso externo.', 'Recuperación de root y reetiquetado: aproximadamente 5–10 minutos según equipo; puede tardar más', 'Guardado manual local; no conserva conexiones externas', 'Examen sin guardado automático, sin vigilancia ni protección antitrampas; necesita memoria para dos VM', 'Una VM bloqueada, apagada o en recuperación puede no responder al corrector; los errores de consulta no se presentan como aprobados']
};
await writeFile(join(lab, 'deployment.json'), JSON.stringify(deployment, null, 2) + '\n');
console.log(`Paquete íntegro: ${original.files} archivos; ${changed.length} ajustes web y ${addedFiles.length} archivos de interfaz. Fábrica sin cambios.`);
