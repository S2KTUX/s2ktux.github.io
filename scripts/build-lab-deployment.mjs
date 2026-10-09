import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lab = join(root, 'laboratorios/linux-real');
const original = JSON.parse(await readFile(join(lab, 'publicacion.json'), 'utf8'));
const permitted = new Set(['licencias/LEEME.md', 'licencias/LEEME.html', 'v86-test.html', 'PRACTICAS_V86.html', 'GUIA_CURSO_LABORATORIO.md', 'GUIA_CURSO_LABORATORIO.html', 'v86-test.mjs', 'v86-check-runner.mjs', 'v86-exercise-panel.mjs', 'v86-exercises.mjs', 'v86-course-exercises.mjs', 'v86-extra-exercises.mjs']);
const additions = ['linux-real.css', 'v86-clipboard.mjs', 'v86-guest-console.mjs', 'examen.html', 'v86-exam.mjs', 'v86-exam-data.mjs', 'v86-exam-setup.mjs', 'v86-exam-console.mjs', 'v86-network.mjs', 'v86-restart.mjs'];
const changed = [];
let total = 0;
for (const record of original.records) {
  const file = resolve(lab, record.path);
  if (!file.startsWith(lab + '/'.replace('/', process.platform === 'win32' ? '\\' : '/'))) throw Error('Ruta fuera del paquete');
  const bytes = await readFile(file);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  total += bytes.length;
  if (sha256 !== record.sha256) {
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
  verifiedPackageBytes: total, modifications: changed, addedFiles,
  note: 'Los informes históricos describen la validación anterior. 44 prácticas y examen independiente: dos VM nuevas, inicio explícito de la segunda, 22 tareas, 3 horas y rúbrica educativa de 300 puntos (aprobado desde 210). Una pregunta cada vez, sin pistas ni puntuación durante el intento. Puede finalizarse vacío o parcial; una segunda TTY consulta resultados reales sin interrumpir el editor del alumno. Práctica nueva sin IP inicial: Internet TCP por Wisp público y DNS por Cloudflare se configura desde Linux, sin selector externo ni respuestas de ping/NTP fabricadas. Los guardados conservan su configuración. La fábrica y el motor no cambian.',
  sources: { url: 'https://github.com/S2KTUX/s2ktux.github.io/releases/download/linux-real-beta-2026-10-08/fuentes-laboratorio-v3.tar.gz', bytes: 811556382, sha256: 'a3d493ab84e278f8318a85b42c5bc588f778770206844f102db8470940eb1017' },
  kind: 'beta independiente', replacesCurrentTerminal: false,
  knownLimits: ['Debian i386, no RHEL; no equivale al examen oficial', 'DNF con RPM locales, no actualiza Debian', 'Internet experimental depende de un relay ajeno; TCP/IPv4 y DNS, sin ping/UDP externos ni puertos entrantes', 'Recuperación de root y reetiquetado: aproximadamente 5–10 minutos según equipo; puede tardar más', 'Guardado manual local; no conserva conexiones externas', 'Examen sin guardado automático, sin vigilancia ni protección antitrampas; necesita memoria para dos VM', 'Una VM bloqueada, apagada o en recuperación puede no responder al corrector; los errores de consulta no se presentan como aprobados']
};
await writeFile(join(lab, 'deployment.json'), JSON.stringify(deployment, null, 2) + '\n');
console.log(`Paquete íntegro: ${original.files} archivos; ${changed.length} ajustes web y ${addedFiles.length} archivos de interfaz. Fábrica sin cambios.`);
