import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lab = join(root, 'laboratorios/linux-real');
const original = JSON.parse(await readFile(join(lab, 'publicacion.json'), 'utf8'));
const permitted = new Set(['licencias/LEEME.md', 'licencias/LEEME.html', 'v86-test.html', 'PRACTICAS_V86.html', 'GUIA_CURSO_LABORATORIO.md', 'GUIA_CURSO_LABORATORIO.html']);
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
const deployment = {
  route: '/laboratorios/linux-real/', imageSha256: original.imageSha256,
  originalFileCount: original.files, originalBytes: original.bytes,
  verifiedPackageBytes: total, modifications: changed,
  note: 'publicacion.json y los informes describen la validación local anterior; este archivo identifica la integración web. Se añaden el enlace público de fuentes, atributos de seguridad de enlaces, tipos de botones y la configuración explícita de MAC distintas al usar dos copias del estado preparado. La máquina y el motor no se modifican.',
  sources: { url: 'https://github.com/S2KTUX/s2ktux.github.io/releases/download/linux-real-beta-2026-10-08/fuentes-laboratorio-v3.tar.gz', bytes: 811556382, sha256: 'a3d493ab84e278f8318a85b42c5bc588f778770206844f102db8470940eb1017' },
  kind: 'beta independiente', replacesCurrentTerminal: false,
  knownLimits: ['Debian, no RHEL', 'DNF con RPM locales, sin repositorios generales', 'Sin Internet general', 'Recuperación de contraseña: 613 segundos en la prueba local', 'Guardado manual local al navegador']
};
await writeFile(join(lab, 'deployment.json'), JSON.stringify(deployment, null, 2) + '\n');
console.log(`Paquete íntegro: ${original.files} archivos; ${changed.length} cambios de documentación.`);
