import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const partBytes = 8 * 1048576;

export async function habilitarExportacionHA(page, directory) {
  await fs.mkdir(path.dirname(directory), {recursive: true});
  await fs.mkdir(directory);
  const fragments = path.join(directory, 'fragmentos');
  await fs.mkdir(fragments);
  await page.exposeFunction('qaWriteHAPart', async (offset, encoded) => {
    const bytes = Buffer.from(encoded, 'base64');
    if (!bytes.length || bytes.length > partBytes) throw Error('Tamaño de fragmento inválido');
    const sha256 = hash(bytes);
    const file = sha256 + '.part';
    try {
      await fs.writeFile(path.join(fragments, file), bytes, {flag: 'wx'});
    } catch (error) {
      if (error.code !== 'EEXIST' || hash(await fs.readFile(path.join(fragments, file))) !== sha256) throw error;
    }
    return {offset, bytes: bytes.length, sha256, file};
  });
  await page.exposeFunction('qaFinishHAExport', async payload => {
    const bytes = Buffer.from(JSON.stringify(payload, null, 2) + '\n');
    await fs.writeFile(path.join(directory, 'cluster.json'), bytes, {flag: 'wx'});
    console.log('HA exportado', JSON.stringify({directory, sha256: hash(bytes), packedBytes: payload.nodes.reduce((n, node) => n + node.packedBytes, 0)}));
  });
  await page.addInitScript(({partBytes}) => {
    if (window.top !== window) return;
    globalThis.qaExportHACapture = async (captures, sourceRevision, sessions) => {
      const record = await sessions.write(captures);
      const nodes = [];
      for (const {packed, terminalText, ...node} of record.nodes) {
        if (terminalText) throw Error('La base no puede incluir texto de terminal');
        const parts = [];
        for (let offset = 0; offset < packed.size; offset += partBytes) {
          const encoded = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(packed.slice(offset, offset + partBytes));
          });
          parts.push(await globalThis.qaWriteHAPart(offset, encoded));
        }
        nodes.push({...node, parts});
      }
      await globalThis.qaFinishHAExport({format: 's2ktux-kubernetes-ha-clean-v1', sourceRevision, sha256: record.sha256, nodes});
      return record;
    };
  }, {partBytes});
}
