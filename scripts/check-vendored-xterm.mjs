import metadata from '../vendor/xterm/vendor-metadata.json' with { type: 'json' };

const warn = (message) => console.log(`::warning file=${metadata.vendoredFile}::${message}`);
let warned = false;
try {
  const registry = await fetch(`https://registry.npmjs.org/${encodeURIComponent(metadata.package)}/latest`);
  if (!registry.ok) throw new Error(`npm respondió ${registry.status}`);
  const latest = (await registry.json()).version;
  if (latest !== metadata.version) {
    warned = true;
    warn(`${metadata.package} vendorizado ${metadata.version}; estable disponible ${latest}. Revisar actualización manual.`);
  }
  const osv = await fetch('https://api.osv.dev/v1/query', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ package: { ecosystem: 'npm', name: metadata.package }, version: metadata.version }),
  });
  if (!osv.ok) throw new Error(`OSV respondió ${osv.status}`);
  const vulnerabilities = (await osv.json()).vulns || [];
  for (const vulnerability of vulnerabilities) {
    warned = true;
    warn(`Vulnerabilidad ${vulnerability.id}: ${vulnerability.summary || 'consultar OSV'}`);
  }
  if (!warned) console.log(`${metadata.package} ${metadata.version}: sin actualización estable ni vulnerabilidades conocidas.`);
} catch (error) {
  warn(`No se pudo completar la vigilancia automática: ${error.message}`);
  process.exitCode = 1;
}
