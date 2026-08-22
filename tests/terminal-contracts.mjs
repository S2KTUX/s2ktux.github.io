import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describeDescriptorFlow, parseRedirections } from '../terminal-shell-parser.js';

const core = await readFile(new URL('../terminal-core.js', import.meta.url), 'utf8');
const runtimeLinux = await readFile(new URL('../terminal-runtime-linux.js', import.meta.url), 'utf8');
const runtimeDocker = await readFile(new URL('../terminal-runtime-docker.js', import.meta.url), 'utf8');
const runtimeKubernetes = await readFile(new URL('../terminal-runtime-kubernetes.js', import.meta.url), 'utf8');
const page = await readFile(new URL('../terminal.html', import.meta.url), 'utf8');
const bootstrap = await readFile(new URL('../terminal-bootstrap.js', import.meta.url), 'utf8');
const xtermRenderer = await readFile(new URL('../terminal-xterm-renderer.js', import.meta.url), 'utf8');
const joinedFlow = describeDescriptorFlow(parseRedirections('demo >out 2>&1').redirections);
const splitFlow = describeDescriptorFlow(parseRedirections('demo 2>&1 >out').redirections);
const redirectionForms = parseRedirections('cat <in >>out 2>>errors &>all').redirections;

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
  ['Ephemeral machine on reload', /function clearModeSession\(mode\)/.test(page) && /clearModeSession\(active\)/.test(page) && /clearModeSession\(restored\)/.test(page) && /F5 crea una máquina limpia/.test(page) && /internalData\.mode===active/.test(page) && /Date\.now\(\)-internalData\.at<10000/.test(page)],
  ['Selector modal isolation', /aria-modal="true"/.test(page) && /terminal-shell/.test(page) && /setAttribute\('inert'/.test(page) && /choose\(0,!getMode/.test(page)],
  ['Integrated terminal selector', /selector-room/.test(page) && /selector-machinebar/.test(page) && /selector-current-command/.test(page) && /linux-rhcsa/.test(page) && !/slot-scene/.test(page)],
  ['Mobile async input ownership', /input\.readOnly=true/.test(core) && /removeAttribute\('aria-busy'\)/.test(core) && /addEventListener\('beforeinput'/.test(core) && /foregroundProcess\|\|followTimer/.test(core)],
  ['Engine loading fallback', /try\s*\{/.test(bootstrap) && /No se pudo cargar esta máquina/.test(bootstrap) && /input\.disabled = true/.test(bootstrap)],
  ['Professional xterm renderer', /vendor\/xterm\/xterm\.mjs/.test(xtermRenderer) && /FitAddon/.test(xtermRenderer) && /screenReaderMode:true/.test(xtermRenderer) && /minimumContrastRatio:4\.5/.test(xtermRenderer) && /term\.onData/.test(xtermRenderer) && /requestFullscreen/.test(xtermRenderer) && /terminal-mobile-keys/.test(page) && /import\('\.\/terminal-xterm-renderer\.js(?:\?[^']+)?'\)/.test(bootstrap)],
  ['Optional explained mobile keys', /terminal-keys-toggle/.test(page) && /aria-expanded="false"/.test(page) && /data-term-key="CTRLC"/.test(page) && /Ctrl\+C cancela/.test(page) && /key === 'CTRLC'/.test(xtermRenderer) && !/data-term-key="CTRL"/.test(page)],
  ['Collapsed learning panels', /<details class="cs">/.test(page) && /<details class="cs" id="practice-panel">/.test(page) && !/<details class="cs"[^>]*\sopen/.test(page) && /practice\.open=false/.test(core)],
  ['SELinux causal diagnostics', /avcAudit/.test(core) && /case 'ausearch'/.test(core) && /case 'sealert'/.test(core)],
  ['Docker lifecycle state', /OOMKilled/.test(core) && /containerStatus/.test(core) && /restart policy activated/.test(core)],
  ['Kubernetes desired state', /endpointsFor/.test(core) && /readyForDeployment/.test(core) && /Deployment restored desired state/.test(core)],
  ['Complete persistence schema', /state-v14-/.test(core) && /schema:14/.test(core) && /state-v13-/.test(core) && /groupsDb:\[\.\.\.groupsDb\]/.test(core) && /linger,userUnits,labHosts,defaultTarget/.test(core) && /dnfCache/.test(core)],
  ['Reload state repair', /transientPids/.test(core) && /processes=\(processes\|\|\[\]\)\.filter/.test(core) && /p\.status==='Pending'\|\|p\.status==='ContainerCreating'/.test(core) && /p\.status==='ErrImagePull'/.test(core) && /recovering desired state/.test(core) && /reconcilePackages/.test(core)],
  ['Effective-root authorization', /const rootMutation=/.test(core) && /currentUser!=='root'&&rootMutation/.test(core) && /dockerd/.test(core) && /groups\|\|\[\]\)\.includes\('docker'\)/.test(core)],
  ['Package-backed commands', /const COMMAND_PACKAGES=/.test(core) && /const commandAvailable=/.test(core) && /finalizeDockerInstall\(\);out\('Eliminado:'/.test(core) && /docker-ce-cli/.test(core)],
  ['Bash builtins bypass packages', /const SHELL_BUILTINS=new Set/.test(core) && /SHELL_BUILTINS\.has\(name\).*commandAvailable/.test(core) && /echo es una orden interna del shell|es una orden interna del shell/.test(core) && /case 'command'/.test(core) && /case 'test': case '\['/.test(core)],
  ['Paste-safe builtins and multiline input', /normalizeCommandInput/.test(core) && /[\\u200B-\\u200D\\u2060\\uFEFF]/.test(core) && /normalizeTerminalPaste/.test(xtermRenderer) && /insertFromPaste/.test(xtermRenderer) && /clean\.split\('\\n'\)/.test(xtermRenderer) && /term\.hasSelection\(\)/.test(xtermRenderer)],
  ['Realistic Docker repository flow', /!installed\.has\('dnf-plugins-core'\)/.test(core) && /No such command: config-manager/.test(core) && /dockerRepoConfigured\(\)/.test(core) && /Unable to find a match/.test(core)],
  ['Everyday filesystem semantics', /const numbered=args\.includes\('-n'\)/.test(core) && /path==='\/proc\/uptime'/.test(core) && /se omite el directorio/.test(core) && /const rec=args\.some/.test(core) && /targets\.forEach\(tgt/.test(core)],
  ['Coherent identity databases', /const groupRows=/.test(core) && /const rebuildGroup=/.test(core) && /db==='group'/.test(core) && /rebuildPasswd\(\); rebuildGroup\(\)/.test(core)],
  ['Unknown systemd units', /const unitExists=/.test(core) && /LoadState=not-found/.test(core) && /Unit '\+svc\+'\.service could not be found/.test(core) && /const unitNames=/.test(core)],
  ['Flexible kubectl namespace flags', /scanEnd=args\.indexOf\('--'\)/.test(core) && /a\.startsWith\('--namespace='\)/.test(core) && /args\.splice\(i,count\)/.test(core) && /args\.splice\(i,1\)/.test(core)],
  ['Remote SSH identity', /const promptIsRoot=/.test(core) && /remoteHost\.user\+'@'\+remoteHost\.name\+'\: '/.test(core) && /Connection to '\+closed\+' closed/.test(core)],
  ['Packaged Kubernetes utilities', /crictl\(\{args\}\)/.test(runtimeKubernetes) && /kubelet\(\{args\}\)/.test(runtimeKubernetes) && /const jqFilter=/.test(core)],
  ['Ordered shell redirections', /import \{ parseRedirections \}/.test(core) && /const prepareRedirections=|const prepareRedirections =/.test(core) && /routeRedirectEvents/.test(core) && /ioEvents/.test(core) && !/let redir=null|writeRedirect|mergeErr|errRedir|inputRedir/.test(core) && joinedFlow[1] === 'file:out:truncate' && joinedFlow[2] === 'file:out:truncate' && splitFlow[1] === 'file:out:truncate' && splitFlow[2] === 'terminal:stdout'],
  ['Shell redirection forms and failures', redirectionForms.some(item=>item.fd===0&&item.operator==='<') && redirectionForms.some(item=>item.fd===1&&item.append) && redirectionForms.some(item=>item.fd===2&&item.append) && redirectionForms.some(item=>item.fd==='both') && /noclobber/.test(core) && /descriptor de fichero incorrecto/.test(core) && /Es un directorio/.test(core)],
  ['Engine-backed Rocky identity', /const SYSTEM=engine\.system/.test(core) && /const OS_NAME=/.test(core) && /syncSystemIdentity/.test(core) && /Operating System: '\+OS_NAME/.test(core) && /Kernel: Linux '\+KERNEL/.test(core) && /CERTIFICATION\|\|'RHCSA 9'/.test(core)],
  ['Engine-backed platform versions', /DOCKER_VERSION=SYSTEM\.docker\|\|'29\.7\.2'/.test(core) && /K8S_VERSION=SYSTEM\.kubernetes\|\|'1\.35\.0'/.test(core) && /Docker version '\+DOCKER_VERSION/.test(core) && /Client Version: '\+K8S_FULL/.test(core)],
  ['No obsolete simulated OS versions', !/S2KTUX OS|7\.1\.0-cozy|v1\.30(?:\.\d+)?|v1\.31(?:\.\d+)?|29\.6\.1/.test(core)],
  ['Cheatsheet and long-command accessibility', /window\.__syncCheatTabs/.test(core) && /#term-a11y-status/.test(core) && /Comando finalizado\. El prompt vuelve a estar disponible\./.test(core)],
  ['Reset command semantics', /reset:\['reinicializa la pantalla de la terminal'/.test(core) && /No borra ficheros ni reinicia la máquina/.test(core) && /case 'reset': \[\.\.\.body\.querySelectorAll/.test(core)],
  ['Runtime-owned practice catalogs', /createChallenges\(ctx\)/.test(runtimeLinux) && /createChallenges\(ctx\)/.test(runtimeDocker) && /createChallenges\(ctx\)/.test(runtimeKubernetes) && !/const (?:dockerChallenges|k8sChallenges|challenges)\s*=/.test(core)],
  ['Runtime-owned manuals and completions', /manuals:\s*\{/.test(runtimeLinux) && /manuals:\s*\{/.test(runtimeDocker) && /manuals:\s*\{/.test(runtimeKubernetes) && /runtime\.manuals/.test(core) && /runtime\.completions/.test(core)],
  ['Selected runtime loading', /import\(`\.\/terminal-runtime-\$\{mode\}\.js`\)/.test(bootstrap) && /startTerminal\(engine, runtime\)/.test(bootstrap) && !/terminal-runtime-(?:linux|docker|kubernetes)\.js['"]/.test(bootstrap)],
  ['Mode-specific boot immersion', /const systemBootLines/.test(core) && /systemd 252 running in system mode/.test(core) && /systemd-udevd\.service/.test(core) && /NetworkManager-wait-online\.service/.test(core) && /sshd\.service - OpenSSH server daemon/.test(core) && /docker\.service - Docker Application Container Engine/.test(core) && /kubelet\.service - kubelet/.test(core) && /login: root/.test(core)],
  ['Fast non-progressive boot', /const QUICK_BOOT=\{batch:6,delay:18\}/.test(core) && /systemBootLines\(\),\(\)=>\{/.test(core) && /\},QUICK_BOOT\)/.test(core)],
  ['Runtime command hooks', /runtime\.createCommands/.test(core) && !/case '(?:dockerd|kubelet|crictl|kubeadm|etcdctl)'/.test(core) && /dockerd\(\{args\}\)/.test(runtimeDocker) && /kubeadm\(\{args\}\)/.test(runtimeKubernetes) && /etcdctl\(\{args\}\)/.test(runtimeKubernetes)],
];

for (const [name, passed] of contracts) assert.ok(passed, `Terminal contract failed: ${name}`);
console.log(`terminal contracts: ${contracts.length}/${contracts.length} passed`);
