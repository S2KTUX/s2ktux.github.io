import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const core = await readFile(new URL('../terminal-core.js', import.meta.url), 'utf8');
const page = await readFile(new URL('../terminal.html', import.meta.url), 'utf8');
const bootstrap = await readFile(new URL('../terminal-bootstrap.js', import.meta.url), 'utf8');

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
  ['Reload-proof selector', /explicitEntry/.test(page) && /params\.delete\('enter'\)/.test(page) && /history\.replaceState/.test(page) && /pageshow/.test(page) && /e\.persisted/.test(page) && /&enter=1/.test(page)],
  ['Selector modal isolation', /aria-modal="true"/.test(page) && /terminal-shell/.test(page) && /setAttribute\('inert'/.test(page) && /choose\(0,!getMode/.test(page)],
  ['Integrated terminal selector', /selector-room/.test(page) && /selector-machinebar/.test(page) && /selector-current-command/.test(page) && /linux-rhcsa/.test(page) && !/slot-scene/.test(page)],
  ['Mobile async input ownership', /input\.readOnly=true/.test(core) && /removeAttribute\('aria-busy'\)/.test(core) && /addEventListener\('beforeinput'/.test(core) && /foregroundProcess\|\|followTimer/.test(core)],
  ['Engine loading fallback', /try\s*\{/.test(bootstrap) && /No se pudo cargar esta máquina/.test(bootstrap) && /input\.disabled = true/.test(bootstrap)],
  ['SELinux causal diagnostics', /avcAudit/.test(core) && /case 'ausearch'/.test(core) && /case 'sealert'/.test(core)],
  ['Docker lifecycle state', /OOMKilled/.test(core) && /containerStatus/.test(core) && /restart policy activated/.test(core)],
  ['Kubernetes desired state', /endpointsFor/.test(core) && /readyForDeployment/.test(core) && /Deployment restored desired state/.test(core)],
];

for (const [name, passed] of contracts) assert.ok(passed, `Terminal contract failed: ${name}`);
console.log(`terminal contracts: ${contracts.length}/${contracts.length} passed`);
