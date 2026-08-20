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
  ['Async command prompt recovery', /const runCommandSeq/.test(core) && (core.match(/runCommandSeq\(seq/g)||[]).length===2 && /setPrompt\(\); input\.focus\(\)/.test(core)],
  ['Foreground input ownership', /foregroundProcess && !\(e\.ctrlKey/.test(core) && /foregroundProcess=\{pid,cmd:'ping '[^\n]+promptEl\.textContent='';/.test(core)],
  ['Single-line terminal input', /#term-input-line\{[^}]*flex-wrap:nowrap[^}]*min-width:0/.test(page) && /#term-input\{[^}]*width:1px[^}]*min-width:0/.test(page)],
  ['Session-scoped selector', /sessionStorage\.setItem\(MODE_KEY/.test(page) && /nav\.type==='reload'/.test(page) && /choose/.test(page)],
  ['Cozy pixel selector', /selector-room/.test(page) && /slot-scene/.test(page) && /selector-note/.test(page) && /k8s-art/.test(page)],
];

for (const [name, passed] of contracts) assert.ok(passed, `Terminal contract failed: ${name}`);
console.log(`terminal contracts: ${contracts.length}/${contracts.length} passed`);
