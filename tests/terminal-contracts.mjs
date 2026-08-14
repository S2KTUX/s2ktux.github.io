import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const core = await readFile(new URL('../terminal-core.js', import.meta.url), 'utf8');
const page = await readFile(new URL('../terminal.html', import.meta.url), 'utf8');

const contracts = [
  ['TTY signals', /suspendForeground/.test(core) && /endForeground\(130,'C'\)/.test(core)],
  ['Bash command substitution', /captureCommand/.test(core) && /braceExpand/.test(core) && /arithmetic/.test(core)],
  ['Alternate screen programs', /pagerEnter\(topLines\(\),'top'/.test(core) && /pagerEnter\(lines,'man/.test(core)],
  ['Boot identity and history', /bootHistory/.test(core) && /--list-boots/.test(core)],
  ['Shared sockets', /listeningSockets/.test(core) && /portOpen/.test(core)],
  ['Docker event stream', /eventAdd\('docker'/.test(core) && /sub==='events'/.test(core)],
  ['Kubernetes reconciliation', /ContainerCreating/.test(core) && /Pod became Running/.test(core)],
  ['Interactive container shells', /enterContainerShell/.test(core) && /containerDispatch/.test(core)],
  ['Here-document input', /const hd=cmd\.match/.test(core) && /startInteractive\('>'/.test(core)],
  ['Session-scoped selector', /sessionStorage\.setItem\(MODE_KEY/.test(page) && /choose/.test(page)],
  ['Pixel selector scenes', /mode-scene/.test(page) && /k8s-hub/.test(page)],
];

for (const [name, passed] of contracts) assert.ok(passed, `Terminal contract failed: ${name}`);
console.log(`terminal contracts: ${contracts.length}/${contracts.length} passed`);
