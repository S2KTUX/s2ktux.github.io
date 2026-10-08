import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lab = join(root, 'laboratorios/linux-real');
const original = JSON.parse(await readFile(join(lab, 'publicacion.json'), 'utf8'));
const permitted = new Set(['licencias/LEEME.md', 'licencias/LEEME.html', 'v86-test.html', 'PRACTICAS_V86.html', 'GUIA_CURSO_LABORATORIO.md', 'GUIA_CURSO_LABORATORIO.html', 'v86-test.mjs', 'v86-check-runner.mjs', 'v86-exercise-panel.mjs', 'v86-exercises.mjs', 'v86-course-exercises.mjs', 'v86-extra-exercises.mjs']);
const additions = ['linux-real.css', 'v86-clipboard.mjs', 'v86-guest-console.mjs'];
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
  note: 'publicacion.json y los informes describen la validación local anterior. La integración usa el diseño compartido de la web, una entrada simplificada con prácticas, ayuda y opciones plegadas, copia por selección, pegado con clic derecho, un prompt configurado por Bash y un escenario de recuperación con guardado independiente. La configuración del prompt y la desactivación de autologin en el escenario se ejecutan en el Linux real, sobre sus discos locales; no se cambia la fábrica ni el motor.',
  sources: { url: 'https://github.com/S2KTUX/s2ktux.github.io/releases/download/linux-real-beta-2026-10-08/fuentes-laboratorio-v3.tar.gz', bytes: 811556382, sha256: 'a3d493ab84e278f8318a85b42c5bc588f778770206844f102db8470940eb1017' },
  kind: 'beta independiente', replacesCurrentTerminal: false,
  knownLimits: ['Debian, no RHEL', 'DNF con RPM locales, sin repositorios generales', 'Sin Internet general', 'Recuperación de contraseña: 613 segundos en la prueba local', 'Guardado manual local al navegador']
};
await writeFile(join(lab, 'deployment.json'), JSON.stringify(deployment, null, 2) + '\n');
console.log(`Paquete íntegro: ${original.files} archivos; ${changed.length} ajustes web y ${addedFiles.length} archivos de interfaz. Fábrica sin cambios.`);
