import { parseRedirections } from './terminal-shell-parser.js';

export function startTerminal(engine, runtime = {}) {
    const body = document.querySelector('#term-body');
    const line = document.querySelector('#term-input-line');
    const input = document.querySelector('#term-input');
    const promptEl = document.querySelector('#term-prompt');
    const titleEl = document.querySelector('#term-title');
    const a11yStatus = document.querySelector('#term-a11y-status');
    if (!body || !input) return;

    const MODE=engine.mode;
    if(runtime.mode && runtime.mode!==MODE) throw new Error('Runtime incompatible con el motor '+MODE);
    const PROFILE=runtime.profile||{};
    const IS_EXAM=MODE==='kubernetes'&&new URLSearchParams(location.search).get('exam')==='1';
    const ENV=engine.environment;
    const SYSTEM=engine.system||{};
    const DISTRO=SYSTEM.distribution||'Rocky Linux', RELEASE=SYSTEM.release||'9.4', CODENAME=SYSTEM.codename||'Blue Onyx', OS_ID=SYSTEM.id||'rocky';
    const KERNEL=SYSTEM.kernel||'5.14.0-427.el9.x86_64', ARCH=SYSTEM.architecture||'x86_64', INITIAL_HOST=SYSTEM.host||ENV.host;
    const OS_NAME=DISTRO+' '+RELEASE+(CODENAME?' ('+CODENAME+')':''), CERTIFICATION=SYSTEM.certification||'';
    const DOCKER_VERSION=SYSTEM.docker||'29.7.2', K8S_VERSION=SYSTEM.kubernetes||'1.35.0', K8S_FULL='v'+K8S_VERSION;
    const [K8S_MAJOR,K8S_MINOR]=K8S_VERSION.split('.');
    const K8S_UPGRADE='v'+K8S_VERSION.replace(/(\d+)$/,n=>String(Number(n)+1));
    const announce=(message)=>{if(a11yStatus){a11yStatus.textContent='';setTimeout(()=>{a11yStatus.textContent=message;},0);}};
    const setText=(id,value)=>{ const el=document.getElementById(id); if(el) el.textContent=value; };
    setText('term-eyebrow',ENV.eyebrow); setText('term-heading',ENV.heading); setText('term-machine-label',ENV.machine); setText('term-os-label',ENV.os); setText('cheatsheet-title',ENV.cheat); setText('practice-title',ENV.practice);
    { const cs=document.querySelector('details.cs'); if(cs) cs.setAttribute('data-mode',MODE); const practice=document.getElementById('practice-panel'); if(practice) practice.open=true; }
    { const d=document.getElementById('term-description'); if(d) d.textContent=ENV.description; const pageTitle=new URLSearchParams(location.search).get('mode')?(ENV.heading+' · S2KTUX'):'Terminales Linux, Docker y Kubernetes · S2KTUX'; document.title=pageTitle; setTimeout(()=>{document.title=pageTitle;},500); }
    { const sel=document.getElementById('mode-select'); if(sel){ const m=new URLSearchParams(location.search).get('mode'); sel.style.display = m?'none':'flex'; input.disabled=!m; } }
    document.querySelectorAll('.cs-tab').forEach(t=>{ const modes=(t.getAttribute('data-modes')||'').split(','); const show=modes.indexOf(MODE)!==-1; t.hidden=!show; t.style.display=show?'':'none'; });
    { const tabs=[...document.querySelectorAll('.cs-tab')].filter(t=>!t.hidden); const panels=[...document.querySelectorAll('.cs-panel')];
      tabs.forEach((t,i)=>t.setAttribute('data-active', i===0?'1':'0'));
      const firstKey = tabs[0] && tabs[0].getAttribute('data-cs-tab');
      const allowed=new Set(tabs.map(t=>t.getAttribute('data-cs-tab')));
      panels.forEach(p=>{ const key=p.getAttribute('data-cs-panel'); p.hidden=!allowed.has(key); p.setAttribute('aria-hidden',allowed.has(key)?'false':'true'); p.setAttribute('data-active',key===firstKey?'1':'0'); });
    }
    if(typeof window.__syncCheatTabs==='function')window.__syncCheatTabs();
    if(MODE!=='linux') document.querySelectorAll('#term-reboot,#term-solved').forEach(b=>{ if(b) b.style.display='none'; });

    const dir = (children, o) => ({ type:'dir', children:children||{}, mode:'rwxr-xr-x', owner:(o&&o.owner)||'root', group:(o&&o.group)||'root' });
    const file = (content, o) => ({ type:'file', content:content||'', mode:(o&&o.mode)||'rw-r--r--', owner:(o&&o.owner)||'root', group:(o&&o.group)||'root' });
    const mkdirp = (path) => { const segs=String(path).split('/').filter(Boolean); let n=fs; for(const s of segs){ if(!n||n.type!=='dir') return null; if(!n.children[s]) n.children[s]=dir({},{owner:'root',group:'root'}); n=n.children[s]; } return n; };
    const syncMounts = () => { try{ (disks||[]).forEach(d=>d.parts.forEach(p=>{ if(p.mount && p.mount!=='[SWAP]' && p.mount!=='') mkdirp(p.mount); })); ((lvm&&lvm.lvs)||[]).forEach(l=>{ if(l.mount && l.mount!=='[SWAP]' && l.mount!=='' && l.mount!=='/') mkdirp(l.mount); }); }catch(e){} };

    // ---------------- default state builders ----------------
    const defaultUsers = () => ({
      root:    { uid:0,    gid:0,    home:'/root',          groups:['root'], password:'2423' },
      visitor: { uid:1000, gid:1000, home:'/home/visitor',  groups:['visitor','wheel'], password:'visitor' },
    });
    const defaultFs = () => dir({
      bin: dir({ bash:file(''), sh:file(''), ls:file(''), cat:file(''), cp:file(''), mv:file(''), rm:file(''), grep:file(''), sed:file(''), awk:file(''), tar:file(''), gzip:file(''), find:file(''), sort:file(''), vi:file(''), nano:file(''), ssh:file(''), scp:file(''), ping:file(''), systemctl:file(''), dnf:file(''), rpm:file(''), python3:file('') }),
      sbin: dir({ init:file(''), reboot:file(''), fdisk:file(''), parted:file(''), 'mkfs.xfs':file(''), 'mkfs.ext4':file(''), lvm:file(''), ip:file(''), fsck:file(''), sshd:file(''), mount:file(''), swapon:file('') }),
      lib: dir({ systemd: dir({ system: dir({}) }), modules: dir({ [KERNEL]: dir({}) }), 'libc.so.6': file('') }),
      lib64: dir({ 'ld-linux-x86-64.so.2': file(''), 'libc.so.6': file(''), 'libssl.so.3': file('') }),
      boot: dir({ ['vmlinuz-'+KERNEL]: file(''), ['initramfs-'+KERNEL+'.img']: file(''), ['config-'+KERNEL]: file('# kernel config'), ['System.map-'+KERNEL]: file(''), grub2: dir({ 'grub.cfg': file('# GRUB2 configuration'), grubenv: file('# GRUB Environment Block') }), efi: dir({ EFI: dir({ rocky: dir({ 'grubx64.efi': file('') }) }) }) }),
      dev: dir({ null: file(''), zero: file(''), random: file(''), urandom: file(''), tty: file(''), tty1: file(''), console: file(''), sda: file(''), sda1: file(''), sda2: file(''), sdb: file(''), 'mapper': dir({ 'vg0-root': file(''), 'vg0-home': file(''), 'vg0-swap': file('') }) }),
      etc: dir({
        'os-release': file('NAME="'+DISTRO+'"\nVERSION="'+RELEASE+(CODENAME?' ('+CODENAME+')':'')+'"\nID='+OS_ID+'\nVERSION_ID="'+RELEASE+'"\nPRETTY_NAME="'+OS_NAME+'"'),
        hostname: file(INITIAL_HOST),
        passwd: file('root:x:0:0:root:/root:/bin/bash\nbin:x:1:1:bin:/bin:/sbin/nologin\ndaemon:x:2:2:daemon:/sbin:/sbin/nologin\nvisitor:x:1000:1000:visitor:/home/visitor:/bin/bash'),
        group: file('root:x:0:\nwheel:x:10:visitor\nvisitor:x:1000:'),
        shadow: file('(protegido)', { mode:'rw-------', owner:'root' }),
        fstab: file('/dev/mapper/vg0-root  /       xfs   defaults        0 0\nUUID=a1b2-c3d4        /boot   xfs   defaults        0 0\n/dev/mapper/vg0-home  /home   xfs   defaults        0 0\n/dev/mapper/vg0-swap  none    swap  defaults        0 0\nUUID=d4t4-5678        /data   xfs   defaults        0 0'),
        hosts: file('127.0.0.1   localhost localhost.localdomain\n::1         localhost localhost.localdomain\n192.168.1.10 web1'),
        ssh: dir({ 'sshd_config': file('#\tOpenSSH server configuration\nPort 22\nPermitRootLogin no\nPasswordAuthentication yes\nUsePAM yes\nSubsystem sftp /usr/libexec/openssh/sftp-server') }),
        selinux: dir({ config: file('# This file controls the state of SELinux on the system.\nSELINUX=enforcing\n# SELINUXTYPE= can take one of these three values:\nSELINUXTYPE=targeted') }),
        'chrony.conf': file('# Use public servers from the pool.ntp.org project.\npool 2.rhel.pool.ntp.org iburst\ndriftfile /var/lib/chrony/drift\nmakestep 1.0 3\nrtcsync'),
        'sudoers': file('## Allow root to run any commands anywhere\nroot\tALL=(ALL)\tALL\n%wheel\tALL=(ALL)\tALL\n#includedir /etc/sudoers.d', { mode:'r--r-----', owner:'root' }),
        'sudoers.d': dir({ README: file('# Ficheros de reglas sudo. Ej: harry ALL=(ALL) NOPASSWD: ALL', { owner:'root' }) }, { owner:'root' }),
        sysconfig: dir({ network: file('# Created by anaconda\nNETWORKING=yes'), 'network-scripts': dir({}) }),
        'resolv.conf': file('# Generated by NetworkManager\n'),
        'yum.repos.d': dir({ 'rocky.repo': file('[baseos]\nname='+DISTRO+' '+RELEASE+' - BaseOS\nbaseurl=file:///mnt/BaseOS\nenabled=1\ngpgcheck=1\ngpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-Rocky-9\n\n[appstream]\nname='+DISTRO+' '+RELEASE+' - AppStream\nbaseurl=file:///mnt/AppStream\nenabled=1\ngpgcheck=1\ngpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-Rocky-9') }),
        'auto.master': file('# /etc/auto.master  ·  ejemplo:  /misdatos  /etc/auto.misdatos'),
        httpd: dir({ conf: dir({ 'httpd.conf': file('# Apache HTTP Server configuration\nServerRoot "/etc/httpd"\nListen 80\nUser apache\nGroup apache\nServerAdmin root@localhost\nDocumentRoot "/var/www/html"\n<Directory "/var/www/html">\n    AllowOverride None\n    Require all granted\n</Directory>\nIncludeOptional conf.d/*.conf') }), 'conf.d': dir({}), 'conf.modules.d': dir({}) }),
        systemd: dir({ system: dir({}) }),
      }),
      home: dir({ visitor: dir({
        'bienvenida.txt': file('Bienvenido a la terminal de S2KTUX.\nEntorno realista: practica sin miedo.\nPrueba: cd / && ls, useradd ana, su - ana, ps -ef, parted /dev/sdb mklabel gpt', { owner:'visitor', group:'visitor' }),
        apuntes: dir({
          'linux.md': file('# Basico\nls cd pwd cat man\nchmod chown\nsystemctl journalctl', { owner:'visitor', group:'visitor' }),
          'permisos.md': file('rwx=read write execute\n755=rwxr-xr-x\nchmod u+x script.sh\nchown root:root f', { owner:'visitor', group:'visitor' }),
        }, { owner:'visitor', group:'visitor' }),
        labs: dir({ 'hola.sh': file('#!/bin/bash\n# script de ejemplo\necho "Hola desde el lab de S2KTUX"\necho "Usuario actual:"\nwhoami\necho "Fecha:"\ndate', { mode:'rwxr-xr-x', owner:'visitor', group:'visitor' }) }, { owner:'visitor', group:'visitor' }),
        '.bashrc': file('export PS1="\\u@\\h:\\w$ "\nalias ll="ls -la"\nalias ..="cd .."', { owner:'visitor', group:'visitor' }),
        '.bash_history': file('ls -la\ncd apuntes\nsystemctl status sshd\ncat /etc/os-release\nclear\nexit', { owner:'visitor', group:'visitor' }),
      }, { owner:'visitor', group:'visitor' }) }),
      root: dir({ '.bashrc': file('# root bashrc', { owner:'root' }), 'anaconda-ks.cfg': file('# kickstart', { owner:'root' }), '.credenciales': file('root: (contrase\u00f1a rotada tras el \u00faltimo incidente \u2014 ya no se guarda aqu\u00ed)\nnota: usar un gestor de secretos', { mode:'rw-------', owner:'root', group:'root' }) }, { owner:'root', group:'root' }),
      media: dir({}), mnt: dir({}), opt: dir({ 'rh': dir({}) }), srv: dir({}), run: dir({ 'sshd.pid': file('842'), lock: dir({}), log: dir({}), user: dir({}) }),
      proc: dir({ cpuinfo: file('processor\t: 0\nmodel name\t: Cozy CPU @ 3.2GHz\ncpu cores\t: 4\nprocessor\t: 1\nmodel name\t: Cozy CPU @ 3.2GHz'), meminfo: file('MemTotal:        3987654 kB\nMemFree:         1998765 kB\nMemAvailable:    2456780 kB\nSwapTotal:       5242880 kB\nSwapFree:        5242880 kB'), version: file('Linux version '+KERNEL+' (mockbuild@rocky) (gcc 11.4.1) #1 SMP PREEMPT_DYNAMIC '+ARCH), uptime: file('43210.12 165432.88'), loadavg: file('0.01 0.02 0.00 1/213 843'), mounts: file('/dev/mapper/vg0-root / xfs rw,relatime 0 0\n/dev/sda1 /boot xfs rw,relatime 0 0'), cmdline: file('BOOT_IMAGE=(hd0,gpt2)/vmlinuz-'+KERNEL+' root=/dev/mapper/vg0-root ro rhgb quiet'), sys: dir({ kernel: dir({ hostname: file(INITIAL_HOST) }) }) }),
      sys: dir({ class: dir({ net: dir({ eth0: dir({}), lo: dir({}) }) }), block: dir({ sda: dir({}), sdb: dir({}) }), kernel: dir({}), devices: dir({}), module: dir({}) }), tmp: dir({ '.ICE-unix': dir({}), '.X11-unix': dir({}) }),
      usr: dir({ bin: dir({}), sbin: dir({}), lib: dir({}), lib64: dir({}), local: dir({ bin: dir({}), sbin: dir({}), share: dir({}) }), share: dir({ doc: dir({}), man: dir({ man1: dir({}), man5: dir({}), man8: dir({}) }), dict: dir({ words: file('aback\nabandon\nzurich\nmunich\nrich\nwhich\nsandwich\nostrich\nenrich\nrichard') }), zoneinfo: dir({ 'UTC': file('') }) }), src: dir({ kernels: dir({}) }) }),
      var: dir({
        log: dir({ messages: file('[ok] Started Journal Service.\n[ok] Reached target Local File Systems.\n[ok] Started OpenSSH server daemon.\n[ok] Reached target Multi-User System.'), secure: file('sshd[842]: Server listening on 0.0.0.0 port 22.'), 'boot.log': file('[  OK  ] Reached target Basic System.'), dnf: dir({ 'dnf.log': file('') }), audit: dir({ 'audit.log': file('type=DAEMON_START msg=audit: op=start') }), httpd: dir({ 'access_log': file(''), 'error_log': file('') }) }),
        www: dir({ html: dir({ 'index.html': file('<h1>S2KTUX</h1>') }), 'cgi-bin': dir({}) }),
        lib: dir({ 'systemd': dir({}), rpm: dir({}), containers: dir({}) }), cache: dir({ dnf: dir({}) }), spool: dir({ cron: dir({}), mail: dir({}) }), tmp: dir({}), 'run': dir({}), empty: dir({}), ftp: dir({ pub: dir({}) }),
      }),
    });
    const defaultProcs = () => ([
      {pid:1,ppid:0,user:'root',cpu:0.0,mem:0.4,vsz:171200,rss:13800,stat:'Ss',start:'09:00',time:'0:03',cmd:'/usr/lib/systemd/systemd --switched-root --system'},
      {pid:2,ppid:0,user:'root',cpu:0.0,mem:0.0,vsz:0,rss:0,stat:'S',start:'09:00',time:'0:00',cmd:'[kthreadd]'},
      {pid:3,ppid:2,user:'root',cpu:0.0,mem:0.0,vsz:0,rss:0,stat:'I<',start:'09:00',time:'0:00',cmd:'[rcu_gp]'},
      {pid:11,ppid:2,user:'root',cpu:0.0,mem:0.0,vsz:0,rss:0,stat:'S',start:'09:00',time:'0:00',cmd:'[ksoftirqd/0]'},
      {pid:14,ppid:2,user:'root',cpu:0.0,mem:0.0,vsz:0,rss:0,stat:'I',start:'09:00',time:'0:01',cmd:'[kworker/0:1]'},
      {pid:410,ppid:1,user:'root',cpu:0.0,mem:0.3,vsz:225800,rss:9800,stat:'Ss',start:'09:00',time:'0:01',cmd:'/usr/lib/systemd/systemd-journald'},
      {pid:435,ppid:1,user:'root',cpu:0.0,mem:0.2,vsz:88300,rss:7100,stat:'Ss',start:'09:00',time:'0:00',cmd:'/usr/lib/systemd/systemd-udevd'},
      {pid:610,ppid:1,user:'root',cpu:0.0,mem:0.6,vsz:398200,rss:22400,stat:'Ssl',start:'09:00',time:'0:02',cmd:'/usr/sbin/NetworkManager --no-daemon'},
      {pid:640,ppid:1,user:'chrony',cpu:0.0,mem:0.1,vsz:23800,rss:2900,stat:'S',start:'09:00',time:'0:00',cmd:'/usr/sbin/chronyd -F 2'},
      {pid:660,ppid:1,user:'root',cpu:0.0,mem:0.1,vsz:26100,rss:3600,stat:'Ss',start:'09:00',time:'0:00',cmd:'/usr/sbin/crond -n'},
      {pid:680,ppid:1,user:'dbus',cpu:0.0,mem:0.1,vsz:10200,rss:4800,stat:'Ss',start:'09:00',time:'0:00',cmd:'/usr/bin/dbus-broker-launch --scope system'},
      {pid:700,ppid:1,user:'polkitd',cpu:0.0,mem:0.4,vsz:220100,rss:14200,stat:'Ssl',start:'09:00',time:'0:00',cmd:'/usr/lib/polkit-1/polkitd --no-debug'},
      {pid:720,ppid:1,user:'root',cpu:0.0,mem:0.2,vsz:78400,rss:5600,stat:'Ss',start:'09:00',time:'0:00',cmd:'/usr/sbin/rsyslogd -n'},
      {pid:420,ppid:1,user:'root',cpu:0.0,mem:0.2,vsz:92500,rss:7200,stat:'Ss',start:'09:00',time:'0:00',cmd:'/usr/sbin/sshd -D'},
      {pid:760,ppid:1,user:'root',cpu:0.0,mem:0.0,vsz:12100,rss:2100,stat:'Ss+',start:'09:00',time:'0:00',cmd:'/usr/sbin/agetty -o -p -- \\u --noclear tty1 linux'},
      {pid:820,ppid:420,user:'root',cpu:0.0,mem:0.2,vsz:94800,rss:8100,stat:'Ss',start:'09:12',time:'0:00',cmd:'sshd: visitor [priv]'},
      {pid:825,ppid:820,user:'visitor',cpu:0.0,mem:0.1,vsz:94800,rss:5200,stat:'S',start:'09:12',time:'0:00',cmd:'sshd: visitor@pts/0'},
      {pid:888,ppid:825,user:'visitor',cpu:0.0,mem:0.1,vsz:12800,rss:3600,stat:'Ss',start:'09:12',time:'0:00',cmd:'-bash'},
    ]);
    const defaultDisks = () => ([
      { name:'sda', size:'80G', parts:[
        { name:'sda1', size:'1G',  fstype:'xfs',          uuid:'a1b2-c3d4', mount:'/boot' },
        { name:'sda2', size:'79G', fstype:'LVM2_member',  uuid:'e5f6-a7b8', mount:'' },
      ], labeled:true },
      { name:'sdb', size:'10G', parts:[], labeled:false },
    ]);
    const defaultLvm = () => ({
      pvs: [ { name:'/dev/sda2', vg:'vg0', psize:79.0 } ],
      vgs: [ { name:'vg0', pvs:['/dev/sda2'], vsize:79.0, vfree:6.0 } ],
      lvs: [ { name:'root', vg:'vg0', size:18.0, fstype:'xfs',  mount:'/', uuid:'11aa-22bb' },
             { name:'home', vg:'vg0', size:50.0, fstype:'xfs',  mount:'/home', uuid:'33cc-44dd' },
             { name:'swap', vg:'vg0', size:5.0,  fstype:'swap', mount:'[SWAP]', uuid:'55ee-66ff' } ]
    });
    const defaultLabHosts = () => ({
      web1:{ ip:'192.168.1.10', role:'web', user:'alumno', pass:'alumno', authKeys:'', services:{httpd:{active:true,enabled:true},sshd:{active:true,enabled:true}}, ports:[22,80],
        files:{ '/home/alumno/LEEME.txt':'Servidor WEB de practicas (Apache/httpd).\nDocumentRoot: /var/www/html  ·  edita index.html y prueba con: curl localhost', '/var/www/html/index.html':'<h1>web1 - Apache en S2KTUX Lab</h1>\n<p>Funciona! Servido desde /var/www/html</p>' } }
    });
    const defaultInstalled = () => Array.isArray(PROFILE.packages)
      ? PROFILE.packages.slice()
      : ['bash','coreutils','glibc','systemd','dnf','rpm','util-linux','findutils','procps-ng','iproute','iputils','NetworkManager','openssh-server','openssh-clients','curl','tar','gzip','bzip2','vim-minimal','nano'];
    const defaultK8s = () => ({
      namespace:'default', nextIp:10,
      nodes:[
        {name:'control-plane',status:'Ready',role:'control-plane',version:K8S_FULL,schedulable:true,labels:{'node-role.kubernetes.io/control-plane':'','kubernetes.io/hostname':'control-plane'}},
        {name:'worker-1',status:'Ready',role:'<none>',version:K8S_FULL,schedulable:true,labels:{'kubernetes.io/hostname':'worker-1','disk':'ssd'}},
        {name:'worker-2',status:'NotReady',role:'<none>',version:K8S_FULL,schedulable:true,labels:{'kubernetes.io/hostname':'worker-2','disk':'hdd'},taints:[]}
      ],
      namespaces:['default','kube-system','kube-public','kube-node-lease'], pods:[{name:'api-broken',namespace:'default',image:'demo/api:broken',status:'CrashLoopBackOff',ready:'0/1',restarts:5,node:'worker-1',ip:'10.244.1.21'},{name:'coredns-7db6d8ff4d-2wz9p',namespace:'kube-system',image:'registry.k8s.io/coredns:v1.11.1',status:'Running',ready:'1/1',restarts:0,node:'control-plane',ip:'10.244.0.3'}], deployments:[], services:[{name:'kubernetes',namespace:'default',type:'ClusterIP',clusterIp:'10.96.0.1',port:'443/TCP',selector:{}}], configmaps:[], secrets:[], serviceaccounts:[{name:'default',namespace:'default'}], roles:[], rolebindings:[], pvcs:[], pvs:[], storageclasses:[{name:'local-path',provisioner:'rancher.io/local-path',default:true}], ingresses:[], networkpolicies:[], events:[{reason:'BackOff',object:'pod/api-broken',message:'Back-off restarting failed container api'},{reason:'NodeNotReady',object:'node/worker-2',message:'Node worker-2 status is now: NodeNotReady'}], actions:[], etcdSnapshot:false, upgraded:false
    });
    const stateNode = (segs) => { let n=fs; for(const s of segs){ if(!n||n.type!=='dir'||!n.children[s])return null; n=n.children[s]; } return n; };

    // ---------------- mutable state ----------------
    let fs, users, nextUid, currentUser, userStack, cwd, history, processes, nextPid, services, installed, images, containers, disks, net, selinux, fw, lvm;
    let dockerInstalled, dockerNetworks, dockerVolumes, composeProjects, k8s;
    let shellVars, exportedVars, jobs, nextJob, journal, timeline, bootId, bootStartedAt, bootHistory, loginRecords, sudoUntil, aliases, shellOptions, shellFunctions;
    let hIdx = -1;
    let lastFail = false;
    let lastStatus = 0;
    let expansionStatus = 0;
    let recovery = null;
    let rootRecovered = false;
    let loggedIn = false;
    let shadowMislabeled = false;
    let revSearch = null;
    let defaultTarget = 'multi-user.target';
    let labHosts, remoteHost=null, containerShell=null;
    let tunedProfile='virtual-guest';
    let sshdCfg={port:22,permitRoot:'no'};
    let dnfUpdated=false;
    let dnfCache=42;
    let linger={};
    let userUnits={};
    let groupsDb;
    const seedConfigs = () => {
      const C={
        '/etc/profile':'# /etc/profile — entorno global\nexport PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\numask 022\nHISTSIZE=1000\nHISTFILESIZE=2000\nalias ll="ls -l"\nexport LANG=es_ES.UTF-8',
        '/etc/bashrc':'# /etc/bashrc — funciones y alias del sistema\nif [ "$UID" -gt 199 ] && [ "$(id -gn)" = "$(id -un)" ]; then umask 002; else umask 022; fi\nalias ll="ls -l --color=auto"\nalias grep="grep --color=auto"',
        '/etc/environment':'LANG=es_ES.UTF-8',
        '/etc/skel/.bashrc':'# .bashrc\n[ -f /etc/bashrc ] && . /etc/bashrc\nalias ll="ls -l"',
        '/etc/skel/.bash_profile':'# .bash_profile\n[ -f ~/.bashrc ] && . ~/.bashrc\nexport PATH=$PATH:$HOME/.local/bin:$HOME/bin',
        '/etc/motd':'Bienvenido a '+INITIAL_HOST+' — Sistema de prácticas '+(CERTIFICATION||'Linux'),
        '/etc/issue':OS_NAME+'\nKernel \\r on an \\m',
        '/etc/sysctl.conf':'# sysctl — parámetros del kernel\nvm.swappiness = 10\nnet.ipv4.ip_forward = 0',
        '/etc/security/limits.conf':'# <dominio> <tipo> <item> <valor>\n*    soft    nofile    4096\n*    hard    nofile    8192\n@developers  soft  nproc  2048',
        '/etc/sysconfig/network':'NETWORKING=yes\nHOSTNAME=nodo1.lab.local',
        '/etc/sysconfig/network-scripts/ifcfg-eth0':'TYPE=Ethernet\nBOOTPROTO=none\nNAME=eth0\nDEVICE=eth0\nONBOOT=yes\n# La IP se gestiona con NetworkManager (nmcli). En blanco hasta configurar.',
        '/etc/NetworkManager/NetworkManager.conf':'[main]\nplugins=keyfile\ndns=default',
        '/etc/rsyslog.conf':'# rsyslog\nmodule(load="imuxsock")\nmodule(load="imjournal")\n*.info;mail.none;authpriv.none;cron.none  /var/log/messages\nauthpriv.*  /var/log/secure\ncron.*  /var/log/cron\nlocal7.*  /var/log/boot.log',
        '/etc/logrotate.conf':'weekly\nrotate 4\ncreate\ndateext\ninclude /etc/logrotate.d',
        '/etc/logrotate.d/httpd':'/var/log/httpd/*log {\n    missingok\n    notifempty\n    sharedscripts\n    postrotate\n        /bin/systemctl reload httpd > /dev/null 2>/dev/null || true\n    endscript\n}',
        '/etc/nsswitch.conf':'passwd:     files sss\ngroup:      files sss\nhosts:      files dns myhostname\nsudoers:    files',
        '/etc/dnf/dnf.conf':'[main]\ngpgcheck=1\ninstallonly_limit=3\nclean_requirements_on_remove=True\nbest=True\nskip_if_unavailable=False',
        '/etc/firewalld/firewalld.conf':'DefaultZone=public\nCleanupOnExit=yes\nFirewallBackend=nftables',
        '/etc/firewalld/zones/public.xml':'<?xml version="1.0" encoding="utf-8"?>\n<zone>\n  <short>Public</short>\n  <service name="ssh"/>\n  <service name="dhcpv6-client"/>\n  <service name="http"/>\n  <port protocol="tcp" port="8080"/>\n</zone>',
        '/etc/tuned/active_profile':'virtual-guest',
        '/etc/default/grub':'GRUB_TIMEOUT=5\nGRUB_DISTRIBUTOR="Rocky Linux"\nGRUB_DEFAULT=saved\nGRUB_CMDLINE_LINUX="rhgb quiet"\nGRUB_DISABLE_RECOVERY="false"',
        '/etc/lvm/lvm.conf':'devices {\n    # filter = [ "a|.*|" ]\n}\nglobal {\n    issue_discards = 0\n}',
        '/etc/vsftpd/vsftpd.conf':'anonymous_enable=NO\nlocal_enable=YES\nwrite_enable=YES\nlocal_umask=022\nlisten=YES\nlisten_ipv6=NO\npam_service_name=vsftpd\nuserlist_enable=YES',
        '/etc/exports':'/srv/nfs   192.168.1.0/24(rw,sync,no_root_squash)\n/home/zeus 192.168.1.11(rw,sync)',
        '/etc/auto.master':'/misdatos  /etc/auto.datos  --timeout=60\n+auto.master',
        '/etc/auto.datos':'*  -rw,sync  192.168.1.100:/export/&',
        '/etc/postfix/main.cf':'myhostname = nodo1.lab.local\nmydomain = lab.local\nmyorigin = $mydomain\ninet_interfaces = loopback-only\nmydestination = $myhostname, localhost.$mydomain, localhost\nhome_mailbox = Maildir/',
        '/etc/nginx/nginx.conf':'user nginx;\nworker_processes auto;\nerror_log /var/log/nginx/error.log;\npid /run/nginx.pid;\nevents { worker_connections 1024; }\nhttp {\n    include /etc/nginx/mime.types;\n    default_type application/octet-stream;\n    server {\n        listen 80;\n        server_name localhost;\n        root /usr/share/nginx/html;\n        location / { index index.html; }\n    }\n}',
        '/usr/share/nginx/html/index.html':'<html><body><h1>nginx en Rocky Linux</h1></body></html>',
        '/etc/systemd/journald.conf':'[Journal]\nStorage=persistent\nSystemMaxUse=500M',
        '/etc/systemd/logind.conf':'[Login]\nNAutoVTs=6\nKillUserProcesses=no',
        '/etc/docker/daemon.json':'{\n  "storage-driver": "overlay2",\n  "log-driver": "json-file",\n  "log-opts": { "max-size": "10m", "max-file": "3" },\n  "insecure-registries": ["192.168.1.100:5000"]\n}',
        '/etc/containers/registries.conf':'unqualified-search-registries = ["registry.access.redhat.com", "docker.io"]\n\n[[registry]]\nprefix = "docker.io"\nlocation = "docker.io"\nblocked = false',
        '/etc/containers/storage.conf':'[storage]\ndriver = "overlay"\nrunroot = "/run/containers/storage"\ngraphroot = "/var/lib/containers/storage"',
        '/etc/containers/containers.conf':'[engine]\ncgroup_manager = "systemd"\nevents_logger = "journald"',
        '/root/containers/Dockerfile':'FROM rockylinux:9\nRUN dnf install -y httpd && dnf clean all\nCOPY index.html /var/www/html/\nEXPOSE 80\nCMD ["httpd", "-DFOREGROUND"]',
        '/root/containers/index.html':'<h1>Contenedor Apache</h1>',
        '/root/containers/docker-compose.yml':'version: "3.8"\nservices:\n  web:\n    image: httpd:latest\n    ports:\n      - "8080:80"\n    volumes:\n      - ./html:/usr/local/apache2/htdocs\n  db:\n    image: mariadb:10.5\n    environment:\n      MARIADB_ROOT_PASSWORD: secret\n    volumes:\n      - db_data:/var/lib/mysql\nvolumes:\n  db_data:',
        '/var/log/cron':'Jul 23 10:01:01 nodo1 CROND[1123]: (root) CMD (run-parts /etc/cron.hourly)\nJul 23 10:05:01 nodo1 CROND[1140]: (zeus) CMD (logger "Backup diario")',
        '/var/log/nginx/error.log':'2026/07/23 10:12:44 [notice] 812#812: nginx/1.20.1',
        '/var/log/messages':'Jul 23 09:58:01 nodo1 systemd[1]: Started Journal Service.\nJul 23 09:58:07 nodo1 NetworkManager[842]: <info> device (eth0): carrier is UP\nJul 23 09:58:09 nodo1 sshd[901]: Server listening on 0.0.0.0 port 22.\nJul 23 10:02:11 nodo1 systemd[1]: Started The Apache HTTP Server.\nJul 23 10:05:33 nodo1 chronyd[860]: Selected source 192.168.1.254\nJul 23 10:11:02 nodo1 sudo[1201]: zeus : USER=root ; COMMAND=/bin/systemctl restart httpd',
        '/var/log/secure':'Jul 23 10:03:12 nodo1 sshd[955]: Accepted publickey for zeus from 192.168.1.50 port 51222 ssh2\nJul 23 10:07:41 nodo1 sshd[978]: Failed password for invalid user admin from 10.0.0.9 port 40122 ssh2',
        '/etc/pam.d/system-auth':'# system-auth — PAM ('+DISTRO+')\nauth        required      pam_env.so\nauth        sufficient    pam_unix.so nullok try_first_pass\nauth        required      pam_deny.so\naccount     required      pam_unix.so\npassword    requisite     pam_pwquality.so retry=3\npassword    sufficient    pam_unix.so sha512 shadow use_authtok\nsession     required      pam_limits.so\nsession     required      pam_unix.so',
        '/var/log/dnf.log':'2026-07-23T07:55:10Z SUBPROCESS: Installed: httpd-2.4.57-8.el9.x86_64\n2026-07-23T07:55:12Z SUBPROCESS: Installed: mariadb-server-10.5.22-1.el9.x86_64\n2026-07-23T07:55:15Z SUBPROCESS: Installed: podman-4.9.4-1.el9.x86_64\n2026-07-23T07:55:18Z INFO Transaction Summary: 18 Packages Installed',
        '/proc/loadavg':'0.12 0.08 0.02 1/180 1420',
        '/proc/uptime':'14250.20 28100.40',
        '/proc/version':'Linux version '+KERNEL+' (mockbuild@rocky) (gcc 11.4.1) #1 SMP PREEMPT_DYNAMIC '+ARCH,
        '/etc/ssh/banner':'------------------------------------------------------------\n Acceso autorizado solo a personal certificado RHCSA / LPIC\n Todos los accesos quedan registrados.\n------------------------------------------------------------',
        '/etc/firewalld/zones/trusted.xml':'<?xml version="1.0" encoding="utf-8"?>\n<zone target="ACCEPT">\n  <short>Trusted</short>\n  <source address="192.168.1.0/24"/>\n</zone>',
        '/etc/yum.repos.d/epel.repo':'[epel]\nname=Extra Packages for Enterprise Linux 9\nbaseurl=https://dl.fedoraproject.org/pub/epel/9/Everything/x86_64/\nenabled=0\ngpgcheck=1\ngpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-9',
        '/etc/krb5.conf':'[libdefaults]\n    default_realm = LAB.LOCAL\n    dns_lookup_realm = false\n    ticket_lifetime = 24h\n\n[realms]\n    LAB.LOCAL = {\n        kdc = nodo1.lab.local\n        admin_server = nodo1.lab.local\n    }',
        '/etc/sssd/sssd.conf':'[sssd]\nservices = nss, pam\ndomains = LAB.LOCAL\n\n[domain/LAB.LOCAL]\nid_provider = ldap\nauth_provider = ldap\nldap_uri = ldap://nodo1.lab.local\nldap_search_base = dc=lab,dc=local',
        '/etc/mdadm.conf':'MAILADDR root\nAUTO +imsm +1.x -all',
        '/etc/iscsi/iscsid.conf':'node.startup = automatic\nnode.session.auth.authmethod = None',
        '/etc/sysconfig/httpd':'# OPTIONS para httpd\nOPTIONS=-DFOREGROUND\nLANG=C',
        '/etc/sysconfig/chronyd':'OPTIONS="-F 2"',
        '/etc/containers/policy.json':'{\n  "default": [ { "type": "insecureAcceptAnything" } ]\n}',
        '/root/.docker/config.json':'{\n  "auths": {\n    "https://index.docker.io/v1/": { "auth": "dXNlcjpwYXNz" }\n  }\n}',
        '/etc/cni/net.d/87-podman-bridge.conflist':'{\n  "cniVersion": "0.4.0",\n  "name": "podman",\n  "plugins": [\n    { "type": "bridge", "bridge": "cni-podman0", "isGateway": true, "ipMasq": true,\n      "ipam": { "type": "host-local", "routes": [{ "dst": "0.0.0.0/0" }], "ranges": [[{ "subnet": "10.88.0.0/16" }]] } }\n  ]\n}',
        '/etc/systemd/system/httpd.service.d/override.conf':'[Service]\nEnvironment=LANG=C',
        '/etc/httpd/conf.d/welcome.conf':'<LocationMatch "^/+$">\n    Options -Indexes\n    ErrorDocument 403 /error/noindex.html\n</LocationMatch>',
        '/etc/httpd/conf.d/ssl.conf':'Listen 443 https\n<VirtualHost _default_:443>\n    ServerName nodo1.lab.local:443\n    DocumentRoot "/var/www/html"\n    SSLEngine on\n    SSLCertificateFile /etc/pki/tls/certs/localhost.crt\n    SSLCertificateKeyFile /etc/pki/tls/private/localhost.key\n</VirtualHost>',
        '/etc/issue.net':OS_NAME,
        '/etc/sysctl.d/99-sysctl.conf':'# ver /etc/sysctl.conf'
      };
      Object.keys(C).forEach(p=>{ const segs=p.split('/').filter(Boolean); let n=fs; for(let i=0;i<segs.length-1;i++){ if(n.type!=='dir')return; if(!n.children[segs[i]]) n.children[segs[i]]=dir({},{owner:'root',group:'root'}); n=n.children[segs[i]]; } if(n&&n.type==='dir') n.children[segs[segs.length-1]]=file(C[p],{owner:'root',group:'root'}); });

    };
        const resetState = () => {
      fs = defaultFs(); seedConfigs(); users = defaultUsers(); nextUid = 1001; currentUser=PROFILE.initialUser||'root'; userStack=[];
      cwd = Array.isArray(PROFILE.cwd)?PROFILE.cwd.slice():['root']; history = []; processes = defaultProcs(); nextPid = 1200; services = {sshd:{active:true,enabled:true,pid:420},NetworkManager:{active:true,enabled:true,pid:610},chronyd:{active:true,enabled:true,pid:640},crond:{active:true,enabled:true,pid:660},rsyslog:{active:true,enabled:true,pid:720}};
      installed = new Set(defaultInstalled());
      images = MODE==='linux' ? [ {repo:'registry.access.redhat.com/ubi9', tag:'latest', id:'a1b2c3d4e5f6', size:'214MB'} ] : [];
      containers = [];
      dockerInstalled=false; dockerNetworks=[{id:'172f0b9a1c21',name:'bridge',driver:'bridge',scope:'local'},{id:'8ad2c59d92aa',name:'host',driver:'host',scope:'local'},{id:'d4496a187c35',name:'none',driver:'null',scope:'local'}]; dockerVolumes=[]; composeProjects={};
      k8s=defaultK8s();
      disks = defaultDisks(); lvm = defaultLvm();
      net = { eth0:{ up:true, ip:'', prefix:24, gw:'', dns:'', method:'', autoconnect:false } };
      selinux = { mode:'Enforcing', httpPorts:[80,443,8080] };
      fw = { services:new Set(['ssh','dhcpv6-client','http']), ports:new Set(['8080/tcp']), zone:'public' };
      recovery = null; rootRecovered = false; shadowMislabeled = false;
      labHosts = defaultLabHosts(); remoteHost = null; tunedProfile='virtual-guest'; sshdCfg={port:22,permitRoot:'no'}; dnfUpdated=false; dnfCache=42;
      groupsDb = new Set(['root','wheel','bin','daemon','sys','adm','users','operador']); linger={}; userUnits={};
      shellVars={PATH:'/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',LANG:'es_ES.UTF-8',HISTSIZE:'500',HISTCONTROL:'ignoredups'};
      exportedVars=new Set(['PATH','LANG','HISTSIZE','HISTCONTROL']); jobs=[]; nextJob=1;
      bootId=Math.random().toString(16).slice(2).padEnd(32,'0').slice(0,32); bootStartedAt=Date.now(); bootHistory=[]; timeline=[]; loginRecords=[]; sudoUntil={}; aliases={ll:'ls -la','..':'cd ..'}; shellOptions={errexit:false,nounset:false,pipefail:false,xtrace:false,noclobber:false};shellFunctions={};
      journal=[{unit:'systemd',priority:6,message:'Reached target Multi-User System.',bootId,time:new Date().toLocaleTimeString(),ts:Date.now()},{unit:'NetworkManager',priority:6,message:'NetworkManager state is now CONNECTED_GLOBAL',bootId,time:new Date().toLocaleTimeString(),ts:Date.now()}];
      loggedIn = MODE!=='linux';
      { const hn=stateNode(['etc','hostname']); if(hn) hn.content=INITIAL_HOST; const motd=stateNode(['etc','motd']); if(motd) motd.content=PROFILE.motd||('Bienvenido a '+INITIAL_HOST+' — Sistema de prácticas '+(CERTIFICATION||'Linux')); }
      if(PROFILE.network) net.eth0=Object.assign({},PROFILE.network);
      if(MODE==='kubernetes'){
        net.eth0={up:true,ip:'10.10.0.10',prefix:24,gw:'10.10.0.1',dns:'10.96.0.10',method:'auto',autoconnect:true}; services.kubelet={active:true,enabled:true,pid:1024};
        installed.add('kubectl'); installed.add('kubelet'); installed.add('kubeadm'); installed.add('etcd'); installed.add('cri-tools');
        labHosts['worker-2']={ip:'10.10.0.22',role:'node',user:'root',pass:'cka',authKeys:'',services:{kubelet:{active:false,enabled:true}},ports:[22,10250],files:{'/var/log/messages':'kubelet: failed to update node lease: context deadline exceeded'}};
        const hosts=stateNode(['etc','hosts']); if(hosts)hosts.content+='\n10.10.0.22 worker-2';
        const root=stateNode(['root']); if(root)root.children.manifests=dir({
          'pod-config.yaml':file('apiVersion: v1\nkind: Pod\nmetadata:\n  name: app-configurada\nspec:\n  containers:\n  - name: app\n    image: nginx:1.27\n    envFrom:\n    - configMapRef:\n        name: app-config\n    - secretRef:\n        name: app-secret'),
          'storage.yaml':file('apiVersion: storage.k8s.io/v1\nkind: StorageClass\nmetadata:\n  name: cka-local\nprovisioner: kubernetes.io/no-provisioner\n---\napiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: datos-app\nspec:\n  storageClassName: cka-local\n  accessModes: [ReadWriteOnce]\n  resources:\n    requests:\n      storage: 1Gi'),
          'network.yaml':file('apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: app-ingress\nspec:\n  rules:\n  - host: app.lab.local\n---\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: solo-lab\nspec:\n  podSelector: {}\n  policyTypes: [Ingress]')
        },{owner:'root',group:'root'});
      }
      syncMounts();
    };

    const syncSystemIdentity = () => {
      const replaceFile=(path,content)=>{const n=stateNode(path);if(n&&n.type==='file')n.content=content;};
      replaceFile(['etc','os-release'],'NAME="'+DISTRO+'"\nVERSION="'+RELEASE+(CODENAME?' ('+CODENAME+')':'')+'"\nID='+OS_ID+'\nVERSION_ID="'+RELEASE+'"\nPRETTY_NAME="'+OS_NAME+'"');
      replaceFile(['etc','issue'],OS_NAME+'\nKernel \\r on an \\m');
      replaceFile(['etc','issue.net'],OS_NAME);
      replaceFile(['proc','version'],'Linux version '+KERNEL+' (mockbuild@rocky) (gcc 11.4.1) #1 SMP PREEMPT_DYNAMIC '+ARCH);
      replaceFile(['proc','cmdline'],'BOOT_IMAGE=(hd0,gpt2)/vmlinuz-'+KERNEL+' root=/dev/mapper/vg0-root ro rhgb quiet');
      const motd=stateNode(['etc','motd']);
      if(MODE==='linux'&&motd&&motd.type==='file'&&/Sistema de prácticas RHCSA$/.test(motd.content.trim()))motd.content='Bienvenido a '+INITIAL_HOST+' — Sistema de prácticas '+(CERTIFICATION||'RHCSA 9');
      const legacyKernel=['7','1','0-cozy'].join('.');
      const modules=stateNode(['lib','modules']);
      if(modules&&modules.type==='dir'){
        const stale=modules.children[legacyKernel];
        if(stale&&!modules.children[KERNEL])modules.children[KERNEL]=stale;
        delete modules.children[legacyKernel];
      }
      const boot=stateNode(['boot']);
      if(boot&&boot.type==='dir'){
        [['vmlinuz-'+legacyKernel,'vmlinuz-'+KERNEL],['initramfs-'+legacyKernel+'.img','initramfs-'+KERNEL+'.img'],['initramfs-'+legacyKernel+'-rescue.img','initramfs-'+KERNEL+'-rescue.img'],['config-'+legacyKernel,'config-'+KERNEL],['System.map-'+legacyKernel,'System.map-'+KERNEL]].forEach(([oldName,newName])=>{if(boot.children[oldName]&&!boot.children[newName])boot.children[newName]=boot.children[oldName];delete boot.children[oldName];});
        const efi=boot.children.efi&&boot.children.efi.children&&boot.children.efi.children.EFI;
        if(efi&&efi.type==='dir'&&efi.children.s2ktux){if(!efi.children.rocky)efi.children.rocky=efi.children.s2ktux;delete efi.children.s2ktux;}
      }
      const repos=stateNode(['etc','yum.repos.d']);
      if(repos&&repos.type==='dir'){
        const rocky='[baseos]\nname='+DISTRO+' '+RELEASE+' - BaseOS\nbaseurl=file:///mnt/BaseOS\nenabled=1\ngpgcheck=1\ngpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-Rocky-9\n\n[appstream]\nname='+DISTRO+' '+RELEASE+' - AppStream\nbaseurl=file:///mnt/AppStream\nenabled=1\ngpgcheck=1\ngpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-Rocky-9';
        if(repos.children['rhel.repo']&&!repos.children['rocky.repo'])repos.children['rocky.repo']=file(rocky,{owner:'root'});
        else if(repos.children['rocky.repo']&&repos.children['rocky.repo'].type==='file')repos.children['rocky.repo'].content=rocky;
        delete repos.children['rhel.repo'];
      }
      const hostname=stateNode(['etc','hostname']);
      const procHostname=stateNode(['proc','sys','kernel','hostname']);
      if(procHostname&&procHostname.type==='file')procHostname.content=(hostname&&hostname.content||INITIAL_HOST).trim();
      if(k8s&&Array.isArray(k8s.nodes))k8s.nodes.forEach(node=>{if(/^v1\.(?:30|31)(?:\.|$)/.test(node.version||''))node.version=K8S_FULL;});
    };

    // ---------------- persistence (localStorage: sobrevive a F5 / recarga) ----------------
    const STORE = 's2ktux-term-state-v14-'+MODE+(IS_EXAM?'-exam':'');
    const LEGACY_STORES = IS_EXAM
      ? ['s2ktux-term-state-v13-'+MODE+'-exam','s2ktux-term-state-v12-'+MODE+'-exam','s2ktux-term-state-v11-'+MODE+'-exam']
      : ['s2ktux-term-state-v13-'+MODE,'s2ktux-term-state-v12-'+MODE,'s2ktux-term-state-v11-'+MODE,'s2ktux-term-state-v10-'+MODE+'-principal','s2ktux-term-state-v9-'+MODE];
    let savedScroll = null;
    resetState();
    {
      try{ let raw=localStorage.getItem(STORE),legacy=''; if(!raw){ legacy=LEGACY_STORES.find(k=>localStorage.getItem(k))||''; if(legacy)raw=localStorage.getItem(legacy); } let s;try{s=JSON.parse(raw||'null');}catch(corrupt){raw=localStorage.getItem(STORE+'-backup');s=JSON.parse(raw||'null');}
        if(s){ fs=s.fs||fs; users=s.users||users; nextUid=s.nextUid||nextUid; currentUser=s.currentUser; if(!users||!users[currentUser]) currentUser='root'; userStack=s.userStack||[]; cwd=Array.isArray(s.cwd)?s.cwd:cwd; history=s.history||[]; processes=Array.isArray(s.processes)?s.processes:defaultProcs(); nextPid=s.nextPid||nextPid; services=s.services||{}; installed=new Set(Array.isArray(s.installed)?s.installed:[...installed]); if((s.schema||0)<13)defaultInstalled().forEach(p=>installed.add(p)); images=s.images||[]; containers=s.containers||[]; disks=Array.isArray(s.disks)?s.disks:disks; net=s.net||net; selinux=s.selinux||selinux; fw=s.fw?{services:new Set(s.fw.services||[]),ports:new Set(s.fw.ports||[]),zone:s.fw.zone||'public'}:fw; lvm=s.lvm||lvm; rootRecovered=!!s.rootRecovered; shadowMislabeled=!!s.shadowMislabeled; loggedIn=!!s.loggedIn||MODE!=='linux'; if(s.tunedProfile)tunedProfile=s.tunedProfile; if(s.sshdCfg)sshdCfg=s.sshdCfg; dnfUpdated=!!s.dnfUpdated; dnfCache=Number.isFinite(s.dnfCache)?s.dnfCache:dnfCache; dockerInstalled=!!s.dockerInstalled; dockerNetworks=s.dockerNetworks||dockerNetworks; dockerVolumes=s.dockerVolumes||dockerVolumes; composeProjects=s.composeProjects||{}; k8s=s.k8s||k8s; shellVars=s.shellVars||shellVars; exportedVars=new Set(s.exportedVars||[...exportedVars]); jobs=Array.isArray(s.jobs)?s.jobs:[]; nextJob=s.nextJob||1; journal=s.journal||journal; timeline=s.timeline||[]; bootId=s.bootId||bootId; bootStartedAt=s.bootStartedAt||bootStartedAt; bootHistory=s.bootHistory||[]; loginRecords=s.loginRecords||[]; sudoUntil=s.sudoUntil||{}; aliases=s.aliases||aliases; shellOptions=s.shellOptions||shellOptions;shellFunctions=s.shellFunctions||{}; groupsDb=new Set(Array.isArray(s.groupsDb)?s.groupsDb:[...groupsDb]); linger=s.linger&&typeof s.linger==='object'?s.linger:{}; userUnits=s.userUnits&&typeof s.userUnits==='object'?s.userUnits:{}; labHosts=s.labHosts&&typeof s.labHosts==='object'?Object.assign(labHosts,s.labHosts):labHosts; defaultTarget=typeof s.defaultTarget==='string'?s.defaultTarget:defaultTarget; recovery=null; savedScroll=(s.schema||0)>=14?(s.scroll||null):null; }
        if(raw&&legacy){ localStorage.setItem(STORE,raw); LEGACY_STORES.forEach(k=>localStorage.removeItem(k)); }
      }catch(e){}
      if(!services.sshd)services.sshd={active:true,enabled:true,pid:420};
      if(!services.NetworkManager)services.NetworkManager={active:true,enabled:true,pid:610};
      {const oldGroup=stateNode(['etc','group']);if(oldGroup&&oldGroup.type==='file')oldGroup.content.split('\n').forEach(row=>{const name=row.split(':')[0];if(name)groupsDb.add(name);});}
      Object.entries(users||{}).forEach(([name,u])=>{ groupsDb.add(name); (u.groups||[]).forEach(g=>groupsDb.add(g)); });
      // Los callbacks y temporizadores no sobreviven a una recarga. Eliminamos
      // procesos de trabajos transitorios y resolvemos estados de Pod intermedios
      // para que la máquina nunca reaparezca congelada para siempre.
      { const transientPids=new Set((jobs||[]).map(j=>j.pid)); processes=(processes||[]).filter(p=>!transientPids.has(p.pid)&&!/^(?:ping|sleep)\b/.test(String(p.cmd||''))); jobs=[]; }
      if(k8s&&!Number.isFinite(k8s.nextIp))k8s.nextIp=10;
      if(k8s&&!Array.isArray(k8s.events))k8s.events=[];
      if(k8s&&Array.isArray(k8s.pods))k8s.pods.forEach(p=>{if(p.status==='ErrImagePull'){p.status='ImagePullBackOff';p.ready='0/1';p.lastState='Waiting: ImagePullBackOff';}else if(p.status==='Pending'||p.status==='ContainerCreating'){if(/missing|notfound|does-not-exist/i.test(p.image||'')){p.status='ImagePullBackOff';p.ready='0/1';p.lastState='Waiting: ImagePullBackOff';}else if(/broken|crash/i.test(p.image||'')){p.status='CrashLoopBackOff';p.ready='0/1';p.restarts=Math.max(1,p.restarts||0);p.lastState='Terminated: Error (exit code 1)';}else{p.status='Running';p.ready='1/1';if(!p.ip||p.ip==='<none>')p.ip='10.244.1.'+(k8s.nextIp++);}}});
      if(k8s&&Array.isArray(k8s.deployments)&&Array.isArray(k8s.pods))k8s.deployments.forEach(d=>{const owned=k8s.pods.filter(p=>p.namespace===d.namespace&&(p.owner===d.name||(!p.owner&&p.name.startsWith(d.name+'-'))));for(let i=owned.length;i<(d.replicas||1);i++){const name=d.name+'-'+Math.random().toString(36).slice(2,10);k8s.pods.push({name,namespace:d.namespace||'default',image:d.image||'nginx:latest',status:'Running',ready:'1/1',restarts:0,node:'worker-1',ip:'10.244.1.'+(k8s.nextIp++),owner:d.name,labels:d.selector||{app:d.name},createdAt:Date.now(),lastState:''});k8s.events.push({reason:'SuccessfulCreate',object:'replicaset/'+d.name,message:'Created pod '+name+' while recovering desired state'});}});
      syncSystemIdentity();
      syncMounts();
    }
    const save = () => { try{ const scroll=[...body.querySelectorAll('.term-out')].slice(-180).map(d=>({h:d.innerHTML,c:d.style.color})); const raw=JSON.stringify({schema:14,fs,users,nextUid,currentUser,userStack,cwd,history:history.slice(-500),processes,nextPid,services,installed:[...installed],images,containers,disks,net,selinux,fw:{services:[...fw.services],ports:[...fw.ports],zone:fw.zone},lvm,rootRecovered,shadowMislabeled,loggedIn,tunedProfile,sshdCfg,dnfUpdated,dnfCache,dockerInstalled,dockerNetworks,dockerVolumes,composeProjects,k8s,shellVars,exportedVars:[...exportedVars],jobs,nextJob,journal:journal.slice(-500),timeline:timeline.slice(-700),bootId,bootStartedAt,bootHistory:bootHistory.slice(-12),loginRecords:loginRecords.slice(-80),sudoUntil,aliases,shellOptions,shellFunctions,groupsDb:[...groupsDb],linger,userUnits,labHosts,defaultTarget,scroll}); localStorage.setItem(STORE+'-backup',localStorage.getItem(STORE)||raw);localStorage.setItem(STORE,raw); }catch(e){} };

    // ---------------- path helpers ----------------
    const homeSegs = () => (users[currentUser]?.home||'/root').split('/').filter(Boolean);
    const norm = (p) => {
      let segs;
      if (p.startsWith('/')) segs = [];
      else if (p === '~' || p.startsWith('~/')) { segs = homeSegs(); p = p.slice(1); }
      else segs = cwd.slice();
      for (const raw of p.split('/')) { if (raw===''||raw==='.') continue; if (raw==='..'){ if(segs.length) segs.pop(); } else segs.push(raw); }
      return segs;
    };
    const getNode = (segs) => { let n=fs; for(const s of segs){ if(n.type!=='dir'||!n.children[s]) return null; n=n.children[s]; } return n; };
    const getParent = (segs) => getNode(segs.slice(0,-1));
    const pretty = (segs) => { const h=homeSegs(); if(segs.length>=h.length && h.every((s,i)=>segs[i]===s)){ const rest=segs.slice(h.length); return '~'+(rest.length?'/'+rest.join('/'):''); } return '/'+segs.join('/'); };
    const hasPerm=(node,perm)=>{if(!node)return false;if(currentUser==='root')return true;const mode=node.mode||'rw-r--r--';const u=users[currentUser]||{groups:[]};const base=node.owner===currentUser?0:((u.groups||[]).includes(node.group)?3:6);const off={r:0,w:1,x:2}[perm];return mode[base+off]===perm;};
    const canTraverse=(segs)=>{let n=fs;for(const s of segs){if(!n||n.type!=='dir'||!hasPerm(n,'x'))return false;n=n.children[s];}return true;};

    // ---------------- output (con captura para tuberías) ----------------
    let cap = null, errCap = null, ioEvents = null;
    const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const out = (t,c) => { const text=t==null?'':String(t); if(cap){ cap.push(text); if(ioEvents)ioEvents.push({fd:1,text}); return; } const d=document.createElement('div'); d.className='term-out'; if(c) d.style.color=c; d.innerHTML=(t===''||t==null)?'&nbsp;':esc(t); body.insertBefore(d,line); };
    const outMany = (a,c)=>a.forEach(l=>out(l,c));
    const err = (t,status=1)=>{ const text=t==null?'':String(t); lastFail=true; lastStatus=status; if(errCap){errCap.push(text);if(ioEvents)ioEvents.push({fd:2,text});return;} return out(text,'#ef8a7a'); };
    const ok = (t)=>out(t,'#8fa876');
    const localHostname=()=>((getNode(['etc','hostname'])||{}).content||INITIAL_HOST).trim();
    const remotePretty = () => { const h=remoteHost; let p=h.cwd; const home=h.user==='root'?'/root':'/home/'+h.user; if(p===home) p='~'; else if(p.indexOf(home+'/')===0) p='~'+p.slice(home.length); return p; };
    const promptStr = () => recovery ? (recovery.kind==='rdbreak' ? (recovery.chrooted?'sh-5.1#':'switch_root:/#') : 'bash-5.1#') : containerShell ? ('root@'+containerShell.name+':'+containerShell.cwd+'#') : remoteHost ? (remoteHost.user+'@'+remoteHost.name+':'+remotePretty()+(remoteHost.user==='root'?'#':'$')) : currentUser+'@'+localHostname()+':'+pretty(cwd)+(currentUser==='root'?'#':'$');
    const promptIsRoot=()=>!!(recovery||containerShell||(remoteHost?remoteHost.user==='root':currentUser==='root'));
    const echoCmd = (raw)=>{ const d=document.createElement('div'); d.className='term-out'; d.innerHTML='<span style="color:'+(promptIsRoot()?'#e08a2e':'#8fa876')+'">'+esc(promptStr())+'</span> <span style="color:#e9ddc7">'+esc(raw)+'</span>'; body.insertBefore(d,line); };
    const scroll=()=>{ body.scrollTop=body.scrollHeight; };
    const setPrompt=()=>{ if(recovery){ setRecoveryPrompt(); return; } promptEl.textContent=promptStr(); promptEl.style.color=promptIsRoot()?'#e08a2e':'#8fa876'; if(titleEl) titleEl.textContent=containerShell?('root@'+containerShell.name+': '+containerShell.cwd):remoteHost?(remoteHost.user+'@'+remoteHost.name+': '+remotePretty()):(currentUser+'@'+localHostname()+': '+pretty(cwd)); };

    // ---------------- entrada interactiva (passwd, fdisk, editor) ----------------
    let interactive = null; // { promptText, masked, onLine, color }
    const startInteractive = (promptText, masked, onLine, color) => { interactive = { promptText, masked, onLine, color: color||'#e0a458' }; promptEl.textContent = promptText; promptEl.style.color = interactive.color; input.value=''; input.style.color = masked ? 'transparent' : ''; scroll(); };
    const endInteractive = () => { interactive = null; input.style.color=''; setPrompt(); };
    const echoInteractive = (v) => { const shown = interactive.masked ? '' : v; const d=document.createElement('div'); d.className='term-out'; d.innerHTML='<span style="color:'+interactive.color+'">'+esc(interactive.promptText)+'</span> <span style="color:#e9ddc7">'+esc(shown)+'</span>'; body.insertBefore(d,line); };

    const octalToSym=(o)=>{ const m=['---','--x','-w-','-wx','r--','r-x','rw-','rwx']; if(!/^[0-7]{3}$/.test(o)) return null; return m[+o[0]]+m[+o[1]]+m[+o[2]]; };
    const addX=(mode)=>mode.split('').map((c,i)=>((i%3===2)&&c==='-')?'x':c).join('');
    const uidToName = {}; // filled lazily

    const treeLines=(node,prefix,acc)=>{ const ks=Object.keys(node.children); ks.forEach((k,i)=>{ const last=i===ks.length-1; const ch=node.children[k]; acc.push(prefix+(last?'└── ':'├── ')+k+(ch.type==='dir'?'/':'')); if(ch.type==='dir') treeLines(ch,prefix+(last?'    ':'│   '),acc); }); return acc; };
    const findLines=(node,base,pat,acc)=>{ for(const k of Object.keys(node.children)){ const ch=node.children[k]; const path=base+'/'+k; if(!pat||k.includes(pat)) acc.push(path.replace(/^\/+/, './')); if(ch.type==='dir') findLines(ch,path,pat,acc);} return acc; };
    const rebuildPasswd=()=>{ const lines=['root:x:0:0:root:/root:/bin/bash','bin:x:1:1:bin:/bin:/sbin/nologin','daemon:x:2:2:daemon:/sbin:/sbin/nologin']; for(const u of Object.keys(users)){ if(u==='root') continue; const i=users[u]; lines.push(u+':x:'+i.uid+':'+i.gid+':'+u+':'+i.home+':'+(i.shell||'/bin/bash')); } getNode(['etc']).children.passwd.content=lines.join('\n'); };
    const groupRows=()=>{ const existing=getNode(['etc','group']),known={root:0,wheel:10,bin:1,daemon:2,sys:3,adm:4,users:100}; if(existing&&existing.type==='file')existing.content.split('\n').forEach(l=>{const c=l.split(':');if(c[0]&&/^\d+$/.test(c[2]||''))known[c[0]]=+c[2];}); Object.entries(users).forEach(([name,u])=>{groupsDb.add(name);(u.groups||[]).forEach(g=>groupsDb.add(g));if(Number.isFinite(u.gid))known[name]=u.gid;}); let gid=1000; return [...groupsDb].map(name=>{while(Object.values(known).includes(gid))gid++;const id=known[name]??gid++;const members=Object.entries(users).filter(([user,u])=>user!==name&&(u.groups||[]).includes(name)).map(([user])=>user);return name+':x:'+id+':'+members.join(',');}); };
    const rebuildGroup=()=>{ const n=getNode(['etc','group']); if(n&&n.type==='file')n.content=groupRows().join('\n'); };
    rebuildPasswd(); rebuildGroup();

    const findPart=(devPath)=>{ const nm=devPath.replace('/dev/',''); for(const d of disks){ const p=d.parts.find(p=>p.name===nm); if(p) return p; } return null; };
    const fmtG=(n)=>(Math.round(n*100)/100).toFixed(2)+'g';
    const parseSizeG=(s)=>{ const m=String(s).match(/^\+?(\d+(?:\.\d+)?)\s*([KMGTP])?/i); if(!m) return null; let v=parseFloat(m[1]); const u=(m[2]||'M').toUpperCase(); if(u==='K')v/=1048576; else if(u==='M')v/=1024; else if(u==='T')v*=1024; else if(u==='P')v*=1048576; return v; };
    const vgByName=(n)=>lvm.vgs.find(v=>v.name===n);
    const lvByDev=(dev)=>{ let m=dev.match(/^\/dev\/mapper\/(.+)-([^-]+)$/); if(m){ const l=lvm.lvs.find(x=>x.vg===m[1]&&x.name===m[2]); if(l) return l; } m=dev.match(/^\/dev\/([^/]+)\/(.+)$/); if(m){ const l=lvm.lvs.find(x=>x.vg===m[1]&&x.name===m[2]); if(l) return l; } return null; };
    const resolveDev=(dev)=> findPart(dev) || lvByDev(dev);
    const httpdCfg=()=>{ let port=80, docroot='/var/www/html'; const files=[]; const conf=getNode(['etc','httpd','conf','httpd.conf']); if(conf&&conf.type==='file')files.push(conf.content); const cd=getNode(['etc','httpd','conf.d']); if(cd&&cd.type==='dir')Object.keys(cd.children).forEach(k=>{ const f=cd.children[k]; if(f&&f.type==='file')files.push(f.content); }); files.forEach(c=>c.split('\n').forEach(l=>{ const w=l.trim().split(/\s+/); if(w[0]&&w[0].toLowerCase()==='listen'&&w[1])port=parseInt(w[1])||port; if(w[0]&&w[0].toLowerCase()==='documentroot'&&w[1])docroot=w[1].replace(/"/g,'').replace(/\/$/,''); })); return {port,docroot}; };
    const applySshd=()=>{ const f=getNode(['etc','ssh','sshd_config']); const cfg={port:22,permitRoot:'no'}; if(f&&f.type==='file'){ f.content.split('\n').forEach(l=>{ l=l.trim(); if(/^Port\s+\d+/i.test(l)) cfg.port=parseInt(l.split(/\s+/)[1])||22; if(/^PermitRootLogin\s+/i.test(l)) cfg.permitRoot=l.split(/\s+/)[1].toLowerCase(); }); } sshdCfg=cfg; return cfg; };
    const lvMapper=(l)=>'/dev/mapper/'+l.vg+'-'+l.name;

    const REPO = new Set(['httpd','httpd-tools','mod_ssl','nginx','mariadb','mariadb-server','postgresql','postgresql-server','vsftpd','firewalld','git','vim','vim-enhanced','nano','emacs','tmux','screen','htop','tree','wget','curl','autofs','at','chrony','cronie','acl','nfs-utils','podman','buildah','skopeo','docker-ce','docker-ce-cli','containerd.io','docker-buildx-plugin','docker-compose-plugin','dnf-plugins-core','samba','samba-client','cifs-utils','bind','bind-utils','openssh-server','openssh-clients','python3','python3-pip','gcc','gcc-c++','make','cmake','tar','unzip','zip','gzip','bzip2','net-tools','tcpdump','sysstat','cockpit','cockpit-podman','container-tools','kernel','kernel-devel','policycoreutils','policycoreutils-python-utils','setools-console','setroubleshoot-server','rsync','lvm2','xfsprogs','e2fsprogs','parted','gdisk','util-linux','man-db','man-pages','bash-completion','wireshark-cli','nmap','nmap-ncat','telnet','lsof','strace','ltrace','ansible','ansible-core','sshpass','kubernetes','kubernetes-client','kubeadm','kubelet','kubectl','cri-o','cri-tools','etcd','helm','sssd','sssd-client','realmd','oddjob','oddjob-mkhomedir','adcli','krb5-workstation','samba-common-tools','quota','targetcli','iscsi-initiator-utils','cryptsetup','mdadm','dnf-utils','yum-utils','createrepo_c','rpm-build','rpmdevtools','audit','aide','tuned','rsyslog','logrotate','postfix','dovec','squid','haproxy','keepalived','stunnel','mtr','traceroute','iproute','iputils','jq','less','procps-ng','psmisc','findutils']);
    const svcForPkg = { httpd:'httpd', nginx:'nginx', mariadb:'mariadb', 'mariadb-server':'mariadb', vsftpd:'vsftpd', firewalld:'firewalld', 'bind':'named', NetworkManager:'NetworkManager', chrony:'chronyd', cronie:'crond', 'nfs-utils':'nfs-server', 'docker-ce':'docker', 'containerd.io':'containerd', kubelet:'kubelet', 'postgresql-server':'postgresql', sssd:'sssd', 'openssh-server':'sshd', autofs:'autofs', at:'atd', cockpit:'cockpit', smb:'smb', samba:'smb', tuned:'tuned', rsyslog:'rsyslog', postfix:'postfix', squid:'squid', haproxy:'haproxy' };
    const DOCKER_PACKAGES=['docker-ce','docker-ce-cli','containerd.io','docker-buildx-plugin','docker-compose-plugin'];
    const COMMAND_PACKAGES={nano:'nano',tree:'tree',jq:'jq',docker:'docker-ce-cli',dockerd:'docker-ce','docker-compose':'docker-compose-plugin',podman:'podman',kubectl:'kubectl',kubeadm:'kubeadm',kubelet:'kubelet',etcdctl:'etcd',crictl:'cri-tools','firewall-cmd':'firewalld',getfacl:'acl',setfacl:'acl',getenforce:'policycoreutils',setenforce:'policycoreutils',sestatus:'policycoreutils',getsebool:'policycoreutils',setsebool:'policycoreutils',semanage:'policycoreutils-python-utils',restorecon:'policycoreutils',ausearch:'audit',sealert:'setroubleshoot-server',fdisk:'util-linux',blkid:'util-linux',lsblk:'util-linux',mount:'util-linux',umount:'util-linux',mkswap:'util-linux',swapon:'util-linux',logger:'util-linux',parted:'parted','mkfs.xfs':'xfsprogs','mkfs.ext4':'e2fsprogs',pvs:'lvm2',vgs:'lvm2',lvs:'lvm2',pvcreate:'lvm2',vgcreate:'lvm2',vgextend:'lvm2',lvcreate:'lvm2',lvextend:'lvm2',lvresize:'lvm2',lvreduce:'lvm2',lvremove:'lvm2',vgremove:'lvm2',pvremove:'lvm2',xfs_growfs:'xfsprogs',resize2fs:'e2fsprogs',nmcli:'NetworkManager',nmtui:'NetworkManager',ifup:'NetworkManager',ifdown:'NetworkManager',chronyc:'chrony','tuned-adm':'tuned',crontab:'cronie',at:'at',atq:'at',atrm:'at',ssh:'openssh-clients',scp:'openssh-clients','ssh-keygen':'openssh-clients','ssh-copy-id':'openssh-clients',wget:'wget',curl:'curl',dig:'bind-utils',host:'bind-utils',nslookup:'bind-utils',lsof:'lsof',nc:'nmap-ncat',ncat:'nmap-ncat',ip:'iproute',ss:'iproute',ping:'iputils',ps:'procps-ng',top:'procps-ng',pgrep:'procps-ng',find:'findutils',tar:'tar',gzip:'gzip',gunzip:'gzip',bzip2:'bzip2',bunzip2:'bzip2',vi:'vim-minimal',dnf:'dnf',rpm:'rpm',systemctl:'systemd',journalctl:'systemd',hostnamectl:'systemd',timedatectl:'systemd',loginctl:'systemd','systemd-run':'systemd','systemd-analyze':'systemd'};
    const BASE_UNITS=new Set(['systemd-journald']);
    const commandAvailable=(name)=>!COMMAND_PACKAGES[name]||installed.has(COMMAND_PACKAGES[name]);
    const unitFile=(svc)=>getNode(['etc','systemd','system',svc+'.service'])||getNode(['usr','lib','systemd','system',svc+'.service']);
    const unitExists=(svc)=>!!(svc&&(services[svc]||BASE_UNITS.has(svc)||unitFile(svc)||Object.keys(svcForPkg).some(p=>svcForPkg[p]===svc&&installed.has(p))||(svc==='containerd'&&installed.has('containerd.io'))));
    const unitNames=()=>{const names=new Set([...BASE_UNITS,...Object.keys(services)]);Object.entries(svcForPkg).forEach(([pkg,svc])=>{if(installed.has(pkg))names.add(svc);});if(installed.has('containerd.io'))names.add('containerd');[['etc','systemd','system'],['usr','lib','systemd','system']].forEach(path=>{const d=getNode(path);if(d&&d.type==='dir')Object.keys(d.children).filter(n=>n.endsWith('.service')).forEach(n=>names.add(n.replace(/\.service$/,'')));});return [...names].sort();};
    const packageVersion=(p)=>({'docker-ce':'3:'+DOCKER_VERSION+'-1.el9','docker-ce-cli':'1:'+DOCKER_VERSION+'-1.el9','containerd.io':'2.2.1-1.el9','docker-buildx-plugin':'0.31.1-1.el9','docker-compose-plugin':'5.1.0-1.el9','dnf-plugins-core':'4.3.0-20.el9'}[p]||'1.0-1.el9');
    const dockerRepoConfigured=()=>{const n=getNode(['etc','yum.repos.d','docker-ce.repo']);return !!(n&&n.type==='file'&&/\[docker-ce-stable\]/.test(n.content)&&/enabled\s*=\s*1/.test(n.content));};
    const configureDockerRepo=()=>{let d=getNode(['etc','yum.repos.d']);if(!d){const e=getNode(['etc']);if(e&&e.type==='dir'){e.children['yum.repos.d']=dir({},{owner:'root'});d=getNode(['etc','yum.repos.d']);}}if(d&&d.type==='dir')d.children['docker-ce.repo']=file('[docker-ce-stable]\nname=Docker CE Stable - x86_64\nbaseurl=https://download.docker.com/linux/centos/$releasever/$basearch/stable\nenabled=1\ngpgcheck=1\ngpgkey=https://download.docker.com/linux/centos/gpg',{owner:'root'});};
    const dropService=(svc)=>{const s=services[svc];if(s&&s.pid)processes=processes.filter(p=>p.pid!==s.pid);delete services[svc];};
    const reconcilePackages=()=>{
      if(MODE==='kubernetes'&&installed.has('etcdctl')){installed.delete('etcdctl');installed.add('etcd');}
      const providerServices=new Set(Object.values(svcForPkg));
      providerServices.forEach(svc=>{const providers=Object.entries(svcForPkg).filter(([,unit])=>unit===svc).map(([pkg])=>pkg);if(!providers.some(pkg=>installed.has(pkg))&&!BASE_UNITS.has(svc)&&!unitFile(svc))dropService(svc);});
      Object.keys(services).forEach(svc=>{const provided=Object.entries(svcForPkg).some(([pkg,unit])=>unit===svc&&installed.has(pkg));if(!BASE_UNITS.has(svc)&&!provided&&!unitFile(svc))dropService(svc);});
      if(!installed.has('docker-ce'))dropService('docker');
      if(!installed.has('containerd.io'))dropService('containerd');
      dockerInstalled=DOCKER_PACKAGES.every(p=>installed.has(p));
    };
    const finalizeDockerInstall=()=>{reconcilePackages();if(installed.has('docker-ce')){groupsDb.add('docker');rebuildGroup();}if(!dockerInstalled)return;services.docker=services.docker||{enabled:false,active:false,pid:null};services.containerd=services.containerd||{enabled:false,active:false,pid:null};const v=getNode(['var','lib']);if(v&&v.type==='dir'){if(!v.children.docker)v.children.docker=dir({},{owner:'root'});if(!v.children.containerd)v.children.containerd=dir({},{owner:'root'});}};
    finalizeDockerInstall();
    const eventAdd=(source,type,message,data)=>{ const ev={ts:Date.now(),bootId,source,type,message,data:data||{}}; timeline.push(ev); if(timeline.length>700)timeline.shift(); return ev; };
    const journalAdd=(unit,message,priority=6)=>{ const e={unit,priority,message,time:new Date().toLocaleTimeString(),ts:Date.now(),bootId}; journal.push(e); eventAdd('journal',unit,message,{priority}); return e; };
    const secureLog=(message,priority=5)=>{ const n=getNode(['var','log','secure']); if(n&&n.type==='file')n.content+=(n.content?'\n':'')+new Date().toLocaleString()+' '+localHostname()+' '+message; journalAdd('audit',message,priority); };
    const avcAudit=(operation,target,source='httpd_t',tclass='tcp_socket')=>{const serial=1000+((Math.random()*8999)|0),stamp=(Date.now()/1000).toFixed(3),msg='type=AVC msg=audit('+stamp+':'+serial+'): avc:  denied  { '+operation+' } for  pid='+(services.httpd&&services.httpd.pid||nextPid)+' comm="httpd" dest='+target+' scontext=system_u:system_r:'+source+':s0 tcontext=system_u:object_r:unreserved_port_t:s0 tclass='+tclass+' permissive='+(selinux.mode==='Enforcing'?'0':'1');const n=getNode(['var','log','audit','audit.log']);if(n&&n.type==='file')n.content+=(n.content?'\n':'')+msg;journalAdd('audit',msg,3);eventAdd('selinux','avc','SELinux denied '+operation,{target,source,tclass});return msg;};
    const dockerConfigError=()=>{const n=getNode(['etc','docker','daemon.json']);if(!n||n.type!=='file'||!n.content.trim())return '';try{const cfg=JSON.parse(n.content);if(cfg&&cfg['log-driver']&&typeof cfg['log-driver']!=='string')return 'json: cannot unmarshal '+typeof cfg['log-driver']+' into Go value of type string';return '';}catch(e){return 'failed to decode configuration JSON: '+String(e.message).replace(/^JSON\.parse:\s*/,'');}};
    const failService=(svc,message)=>{const s=services[svc]||(services[svc]={enabled:false});s.active=false;s.failed=true;s.result='exit-code';s.exitStatus=1;s.error=message;const i=processes.findIndex(p=>p.pid===s.pid);if(i!==-1)processes.splice(i,1);s.pid=null;journalAdd(svc,message,3);journalAdd('systemd',svc+'.service: Main process exited, code=exited, status=1/FAILURE',3);journalAdd('systemd',svc+'.service: Failed with result \'exit-code\'.',3);};

    const MAN = {"ls":{"name":"ls - lista el contenido de directorios","sec":"1","s":"ls [OPCIÓN]... [FICHERO]...","d":"Lista información de los FICHEROS (del directorio actual por defecto), ordenados alfabéticamente.","o":[["-l","usa un formato largo: tipo, permisos, propietario, grupo, tamaño y nombre"],["-a","no oculta las entradas que empiezan por punto"],["-la","listado largo incluyendo los ficheros ocultos"]],"e":"ls -la /etc"},"cd":{"name":"cd - cambia el directorio de trabajo","sec":"1","s":"cd [DIRECTORIO]","d":"Cambia el directorio actual. Sin argumento va a $HOME. Acepta rutas absolutas, relativas, .. y ~.","o":null,"e":"cd /var/log\ncd ..\ncd ~"},"pwd":{"name":"pwd - muestra el directorio de trabajo","sec":"1","s":"pwd","d":"Escribe la ruta absoluta completa del directorio de trabajo actual.","o":null,"e":null},"cat":{"name":"cat - concatena y muestra ficheros","sec":"1","s":"cat [FICHERO]...","d":"Muestra el contenido de un fichero por la salida estándar. Falla si no tienes permiso de lectura.","o":null,"e":"cat /etc/passwd"},"head":{"name":"head - muestra el principio de un fichero","sec":"1","s":"head [-n N] FICHERO","d":"Muestra las primeras líneas de un fichero (10 por defecto).","o":[["-n N","muestra las primeras N líneas"]],"e":"head -n 5 /etc/passwd"},"tail":{"name":"tail - muestra el final de un fichero","sec":"1","s":"tail [-n N] FICHERO","d":"Muestra las últimas líneas de un fichero (10 por defecto).","o":[["-n N","muestra las últimas N líneas"]],"e":"tail -n 20 /var/log/messages"},"tree":{"name":"tree - lista el contenido en forma de árbol","sec":"1","s":"tree [DIRECTORIO]","d":"Muestra de forma recursiva el contenido del directorio como un árbol indentado.","o":null,"e":null},"mkdir":{"name":"mkdir - crea directorios","sec":"1","s":"mkdir DIRECTORIO...","d":"Crea uno o más directorios si no existen ya.","o":null,"e":"mkdir proyecto"},"rmdir":{"name":"rmdir - elimina directorios vacíos","sec":"1","s":"rmdir DIRECTORIO...","d":"Elimina directorios, siempre que estén vacíos.","o":null,"e":null},"touch":{"name":"touch - crea ficheros vacíos o actualiza su fecha","sec":"1","s":"touch FICHERO...","d":"Crea el fichero si no existe; si existe, actualiza su marca de tiempo.","o":null,"e":null},"rm":{"name":"rm - elimina ficheros y directorios","sec":"1","s":"rm [-r] [-f] FICHERO...","d":"Borra ficheros. Para borrar un directorio y su contenido se necesita -r.","o":[["-r","borrado recursivo (directorios y su contenido)"],["-f","no pregunta y no avisa de los que no existen"]],"e":"rm -r carpeta"},"cp":{"name":"cp - copia ficheros y directorios","sec":"1","s":"cp ORIGEN DESTINO","d":"Copia ORIGEN en DESTINO. Si DESTINO es un directorio, copia dentro de él.","o":null,"e":"cp fichero.txt /tmp/"},"mv":{"name":"mv - mueve o renombra ficheros","sec":"1","s":"mv ORIGEN DESTINO","d":"Mueve o renombra ficheros y directorios.","o":null,"e":"mv viejo.txt nuevo.txt"},"ln":{"name":"ln - crea enlaces entre ficheros","sec":"1","s":"ln [-s] OBJETIVO NOMBRE","d":"Crea un enlace. Con -s crea un enlace simbólico (blando).","o":[["-s","crea un enlace simbólico en lugar de uno duro"]],"e":"ln -s /opt/app/bin/app /usr/local/bin/app"},"find":{"name":"find - busca ficheros en una jerarquía","sec":"1","s":"find [RUTA] [-name PATRÓN]","d":"Recorre el árbol de directorios buscando ficheros que cumplan la condición.","o":[["-name P","coincide por nombre de fichero"]],"e":"find /etc -name \"*.conf\""},"grep":{"name":"grep - busca patrones en texto","sec":"1","s":"grep [-i] PATRÓN FICHERO","d":"Muestra las líneas del fichero que contienen el patrón. También funciona tras una tubería.","o":[["-i","ignora mayúsculas/minúsculas"],["-v","invierte: muestra las líneas que NO coinciden"],["-c","cuenta las líneas coincidentes"]],"e":"grep -i error /var/log/messages"},"wc":{"name":"wc - cuenta líneas, palabras y bytes","sec":"1","s":"wc [-l] FICHERO","d":"Cuenta líneas, palabras y bytes de un fichero.","o":[["-l","solo cuenta las líneas"]],"e":null},"stat":{"name":"stat - muestra el estado de un fichero","sec":"1","s":"stat FICHERO","d":"Muestra información detallada: tamaño, tipo, permisos, propietario y grupo.","o":null,"e":null},"file":{"name":"file - determina el tipo de un fichero","sec":"1","s":"file FICHERO","d":"Intenta identificar el tipo de contenido de un fichero.","o":null,"e":null},"echo":{"name":"echo - muestra una línea de texto","sec":"1","s":"echo TEXTO [> fichero]","d":"Escribe el texto. Con > redirige a un fichero (sobrescribe) y con >> añade al final.","o":null,"e":"echo \"hola\" > saludo.txt"},"chmod":{"name":"chmod - cambia los permisos de un fichero","sec":"1","s":"chmod MODO FICHERO","d":"Cambia los bits de permiso. El modo puede ser octal (755) o simbólico (u+x).","o":[["755","rwxr-xr-x"],["u+x","añade permiso de ejecución al propietario"]],"e":"chmod 640 secreto.txt\nchmod u+x script.sh"},"chown":{"name":"chown - cambia propietario y grupo","sec":"1","s":"chown USUARIO[:GRUPO] FICHERO","d":"Cambia el propietario (y opcionalmente el grupo) de un fichero.","o":null,"e":"chown ana:equipo informe.txt"},"chgrp":{"name":"chgrp - cambia el grupo de un fichero","sec":"1","s":"chgrp GRUPO FICHERO","d":"Cambia el grupo propietario de un fichero.","o":null,"e":null},"umask":{"name":"umask - máscara de permisos por defecto","sec":"1","s":"umask","d":"Muestra la máscara que determina los permisos por defecto de los ficheros nuevos.","o":null,"e":null},"getfacl":{"name":"getfacl - obtiene las ACL de un fichero","sec":"1","s":"getfacl FICHERO","d":"Muestra las listas de control de acceso (ACL): propietario, grupo, entradas extra y otros.","o":null,"e":"getfacl /srv"},"setfacl":{"name":"setfacl - modifica las ACL de un fichero","sec":"1","s":"setfacl {-m|-x|-b} REGLA FICHERO","d":"Define permisos ACL más finos que ugo/rwx para usuarios o grupos concretos.","o":[["-m","modifica/añade una entrada, p.ej. u:ana:rwx"],["-x","elimina una entrada concreta"],["-b","elimina todas las ACL extendidas"]],"e":"setfacl -m u:ana:rwx /srv"},"whoami":{"name":"whoami - muestra el usuario efectivo","sec":"1","s":"whoami","d":"Escribe el nombre del usuario asociado al identificador efectivo actual.","o":null,"e":null},"id":{"name":"id - muestra UID, GID y grupos","sec":"1","s":"id [USUARIO]","d":"Muestra el identificador de usuario, de grupo y los grupos a los que pertenece.","o":null,"e":null},"useradd":{"name":"useradd - crea una cuenta de usuario","sec":"8","s":"useradd NOMBRE","d":"Crea un usuario nuevo, su UID/GID y su directorio personal. Requiere privilegios.","o":null,"e":"sudo useradd ana"},"userdel":{"name":"userdel - elimina una cuenta de usuario","sec":"8","s":"userdel NOMBRE","d":"Elimina un usuario del sistema.","o":null,"e":null},"usermod":{"name":"usermod - modifica una cuenta de usuario","sec":"8","s":"usermod [-aG GRUPO] NOMBRE","d":"Modifica una cuenta. Con -aG añade el usuario a un grupo secundario sin sacarlo de los demás.","o":[["-aG G","añade (append) el usuario al grupo suplementario G"]],"e":"usermod -aG wheel ana"},"groupadd":{"name":"groupadd - crea un grupo","sec":"8","s":"groupadd NOMBRE","d":"Crea un grupo nuevo en el sistema.","o":null,"e":null},"passwd":{"name":"passwd - cambia la contraseña","sec":"1","s":"passwd [USUARIO]","d":"Cambia la contraseña. Un usuario normal solo puede cambiar la suya; root la de cualquiera.","o":null,"e":null},"su":{"name":"su - cambia de usuario","sec":"1","s":"su [-] [USUARIO]","d":"Inicia una sesión con otro usuario (root por defecto). Con - carga su entorno de login.","o":[["-","simula un inicio de sesión completo (carga entorno y va a su HOME)"]],"e":"su - ana"},"sudo":{"name":"sudo - ejecuta un comando como otro usuario","sec":"8","s":"sudo COMANDO","d":"Ejecuta un comando con privilegios de root. Requiere pertenecer al grupo wheel y la contraseña.","o":[["-i","abre una shell de login como root"],["-l","lista los permisos sudo del usuario"]],"e":"sudo systemctl restart sshd"},"ps":{"name":"ps - informa del estado de los procesos","sec":"1","s":"ps [aux|-ef]","d":"Muestra una instantánea de los procesos en ejecución.","o":[["aux","todos los procesos, formato BSD con %CPU y %MEM"],["-ef","todos los procesos, formato completo con PPID"]],"e":"ps aux"},"top":{"name":"top - procesos en tiempo real","sec":"1","s":"top","d":"Muestra los procesos y el uso de CPU y memoria, ordenados por consumo.","o":null,"e":null},"kill":{"name":"kill - envía una señal a un proceso","sec":"1","s":"kill [-SEÑAL] PID","d":"Envía una señal (TERM por defecto) a un proceso identificado por su PID.","o":null,"e":"kill 1234"},"pgrep":{"name":"pgrep - busca procesos por nombre","sec":"1","s":"pgrep PATRÓN","d":"Muestra los PID de los procesos cuyo nombre coincide con el patrón.","o":null,"e":null},"systemctl":{"name":"systemctl - controla systemd y los servicios","sec":"1","s":"systemctl SUBCOMANDO [SERVICIO]","d":"Gestiona servicios (units): consulta estado, arranca, para, habilita en el arranque.","o":[["status","estado detallado del servicio"],["start / stop","arranca / detiene el servicio ahora"],["enable / disable","lo activa / desactiva en el arranque (--now también lo arranca)"],["restart","reinicia el servicio"]],"e":"systemctl enable --now httpd"},"journalctl":{"name":"journalctl - consulta el registro de systemd","sec":"1","s":"journalctl [-u SERVICIO]","d":"Muestra los mensajes del journal. Con -u filtra por una unidad concreta.","o":[["-u S","muestra solo los logs del servicio S"]],"e":"journalctl -u sshd"},"crontab":{"name":"crontab - gestiona tareas programadas","sec":"1","s":"crontab {-l|-e}","d":"Programa comandos para ejecutarse periódicamente.","o":[["-l","lista las tareas del usuario"],["-e","edita la tabla de tareas"]],"e":null},"dnf":{"name":"dnf - gestor de paquetes","sec":"8","s":"dnf SUBCOMANDO [PAQUETE]","d":"Instala, elimina, busca y actualiza software desde los repositorios.","o":[["install","instala uno o más paquetes"],["remove","desinstala paquetes"],["search","busca paquetes por nombre"],["info","muestra información de un paquete"],["list installed|available","lista paquetes"],["update","actualiza el sistema"]],"e":"dnf install httpd"},"rpm":{"name":"rpm - gestor de paquetes RPM de bajo nivel","sec":"8","s":"rpm {-qa|-q PAQUETE}","d":"Consulta la base de datos de paquetes instalados.","o":[["-qa","lista todos los paquetes instalados"],["-q P","consulta si el paquete P está instalado"]],"e":null},"mount":{"name":"mount - monta un sistema de archivos","sec":"8","s":"mount [DISPOSITIVO PUNTO]","d":"Sin argumentos lista lo montado. Con dispositivo y punto de montaje, lo monta.","o":null,"e":"mount /dev/sdb1 /mnt/data"},"umount":{"name":"umount - desmonta un sistema de archivos","sec":"8","s":"umount {DISPOSITIVO|PUNTO}","d":"Desmonta un sistema de archivos previamente montado.","o":null,"e":null},"lsblk":{"name":"lsblk - lista los dispositivos de bloque","sec":"8","s":"lsblk","d":"Muestra discos y particiones en forma de árbol, con tamaño y punto de montaje.","o":null,"e":null},"fdisk":{"name":"fdisk - manipula la tabla de particiones","sec":"8","s":"fdisk [-l] [DISPOSITIVO]","d":"Con -l lista las particiones; con un disco abre el modo interactivo (m para ayuda).","o":[["-l","lista las tablas de particiones"]],"e":"fdisk /dev/sdb"},"parted":{"name":"parted - editor de particiones","sec":"8","s":"parted DISPOSITIVO ORDEN","d":"Crea y gestiona particiones también en discos grandes (GPT).","o":[["mklabel gpt","crea una tabla de particiones GPT"],["mkpart","crea una partición"],["print","muestra las particiones"],["rm N","elimina la partición N"]],"e":"parted /dev/sdb mklabel gpt"},"mkfs":{"name":"mkfs - crea un sistema de archivos","sec":"8","s":"mkfs.TIPO DISPOSITIVO","d":"Formatea una partición con el sistema de archivos indicado (xfs, ext4...).","o":null,"e":"mkfs.xfs /dev/sdb1"},"df":{"name":"df - espacio libre en disco","sec":"1","s":"df [-h]","d":"Muestra el uso de espacio de los sistemas de archivos montados.","o":[["-h","tamaños legibles (K, M, G)"]],"e":null},"du":{"name":"du - uso de espacio de ficheros","sec":"1","s":"du [-sh] [RUTA]","d":"Estima el espacio ocupado por ficheros y directorios.","o":[["-s","solo el total"],["-h","tamaños legibles"]],"e":null},"ip":{"name":"ip - muestra y configura la red","sec":"8","s":"ip OBJETO [ORDEN]","d":"Gestiona interfaces, direcciones y rutas.","o":[["a / addr","muestra las direcciones IP"],["route","muestra la tabla de rutas"],["link set eth0 up|down","levanta o tumba la interfaz"]],"e":"ip a\nip link set eth0 down"},"ping":{"name":"ping - comprueba la conectividad","sec":"8","s":"ping HOST","d":"Envía paquetes ICMP para comprobar si un host responde. Falla si la red está caída.","o":null,"e":"ping localhost"},"ss":{"name":"ss - muestra sockets y puertos","sec":"8","s":"ss [-tuln]","d":"Muestra los sockets. -tuln lista los puertos TCP/UDP en escucha de forma numérica.","o":null,"e":"ss -tuln"},"nmcli":{"name":"nmcli - controla NetworkManager","sec":"1","s":"nmcli [dev|con] ...","d":"Gestiona conexiones y dispositivos de red.","o":null,"e":null},"firewall-cmd":{"name":"firewall-cmd - gestiona firewalld","sec":"1","s":"firewall-cmd [OPCIONES]","d":"Consulta y modifica las reglas del cortafuegos firewalld.","o":[["--state","indica si firewalld está activo"],["--list-all","muestra la zona activa y sus reglas"],["--add-service=X --permanent","abre un servicio de forma permanente"],["--reload","recarga las reglas"]],"e":"firewall-cmd --add-service=http --permanent"},"getenforce":{"name":"getenforce - muestra el modo de SELinux","sec":"8","s":"getenforce","d":"Escribe el modo actual de SELinux: Enforcing, Permissive o Disabled.","o":null,"e":null},"setenforce":{"name":"setenforce - cambia el modo de SELinux","sec":"8","s":"setenforce {0|1}","d":"Cambia SELinux entre Permissive (0) y Enforcing (1) de forma temporal.","o":null,"e":"setenforce 0"},"sestatus":{"name":"sestatus - estado de SELinux","sec":"8","s":"sestatus","d":"Muestra si SELinux está activo, la política cargada y el modo actual.","o":null,"e":null},"semanage":{"name":"semanage - gestiona la política de SELinux","sec":"8","s":"semanage {port|fcontext} ...","d":"Cambios persistentes de SELinux: etiquetas de puerto y de contexto de fichero.","o":null,"e":"semanage port -l"},"restorecon":{"name":"restorecon - restaura contextos SELinux","sec":"8","s":"restorecon [-Rv] RUTA","d":"Vuelve a aplicar el contexto SELinux por defecto a los ficheros indicados.","o":null,"e":null},"chage":{"name":"chage - caducidad de contraseñas","sec":"1","s":"chage [-l] USUARIO","d":"Muestra o cambia la información de caducidad de la contraseña de un usuario.","o":[["-l","lista la información de caducidad"]],"e":null},"tar":{"name":"tar - archiva y comprime ficheros","sec":"1","s":"tar [-czf|-xzf] FICHERO.tar.gz","d":"Crea o extrae archivos comprimidos.","o":[["-czf","crea un archivo comprimido"],["-xzf","extrae un archivo comprimido"]],"e":"tar -czf copia.tar.gz /home/visitor"},"man":{"name":"man - muestra las páginas del manual","sec":"1","s":"man COMANDO","d":"Muestra la documentación de un comando: nombre, sinopsis, descripción y opciones.","o":null,"e":"man chmod"}};

    MAN.vi = { name:'vi - editor de texto modal', sec:'1', s:'vi FICHERO', d:'Editor modal: en modo NORMAL las teclas son órdenes; con i/a/o entras en INSERTAR para escribir; Esc vuelve a NORMAL; con : das órdenes.', o:[['i / a','entra en modo insertar'],['o','abre una línea nueva e inserta'],['Esc','vuelve al modo normal'],['dd','borra la línea'],[':w / :q / :wq','guarda / sale / guarda y sale (:q! fuerza)']], e:'vi notas.txt' };
    MAN.nano = { name:'nano - editor de texto sencillo', sec:'1', s:'nano FICHERO', d:'Editor sencillo: escribe directamente y usa atajos con Ctrl para guardar y salir.', o:[['^O','guarda (WriteOut)'],['^X','sale']] };
    Object.assign(MAN, {
      ssh:{ name:'ssh - cliente de shell segura (SSH)', sec:'1', s:'ssh [-p PUERTO] [-i CLAVE] [usuario@]host', d:'Inicia una sesión remota cifrada. En el laboratorio puedes conectar a los hosts publicados por labhosts.', o:[['-p PUERTO','puerto del servidor (por defecto 22)'],['-i CLAVE','usa una clave privada concreta'],['usuario@host','usuario y host de destino']] },
      'ssh-keygen':{ name:'ssh-keygen - genera claves SSH', sec:'1', s:'ssh-keygen [-t tipo]', d:'Genera un par de claves en ~/.ssh.', o:[['-t rsa|ed25519','tipo de clave'],['-f FICHERO','ruta de salida']] },
      'ssh-copy-id':{ name:'ssh-copy-id - instala tu clave pública en un host', sec:'1', s:'ssh-copy-id [usuario@]host', d:'Copia tu clave pública a authorized_keys para entrar sin contraseña.', o:[] },
      scp:{ name:'scp - copia segura de ficheros', sec:'1', s:'scp [-r] ORIGEN [usuario@]host:/ruta', d:'Copia ficheros entre tu máquina y un host a través de SSH.', o:[['-r','copia carpetas de forma recursiva']] },
      sed:{ name:'sed - editor de flujo', sec:'1', s:"sed 's/patrón/reemplazo/[g]' FICHERO", d:'Transforma texto línea a línea. Con -i edita el fichero en el sitio.', o:[['-i','edita el fichero directamente'],['s/a/b/g','sustituye a por b en toda la línea']] },
      awk:{ name:'awk - procesado de texto por columnas', sec:'1', s:"awk [-F sep] '{print $N}' FICHERO", d:'Procesa texto por campos. $1, $2… son las columnas; $0 la línea completa.', o:[['-F SEP','separador de campos'],['{print $2}','imprime la segunda columna']] }
    }, runtime.manuals||{});
    const wrapT=(t,w)=>{ const words=String(t).split(' '); const out2=[]; let cur=''; words.forEach(word=>{ if((cur?cur.length+1:0)+word.length>w){ if(cur)out2.push(cur); cur=word; } else cur=cur?cur+' '+word:word; }); if(cur)out2.push(cur); return out2.length?out2:['']; };
    const MAN_BRIEF = {
      help:['muestra la ayuda rápida de comandos','help','Lista por categorías los comandos disponibles en el sandbox.'],
      clear:['limpia la pantalla de la terminal','clear','Borra todas las líneas visibles (Ctrl+L hace lo mismo).'],
      reset:['reinicializa la pantalla de la terminal','reset','Restablece el estado visual del terminal y limpia la pantalla. No borra ficheros ni reinicia la máquina; para eso usa el botón «Resetear terminal».'],
      groups:['muestra los grupos de un usuario','groups [USUARIO]','Imprime los grupos a los que pertenece el usuario indicado (o el actual).'],
      hostname:['muestra o fija el nombre del equipo','hostname [NOMBRE]','Muestra el hostname actual.'],
      hostnamectl:['controla el nombre del equipo','hostnamectl [set-hostname NOMBRE]','Consulta o cambia el nombre del sistema de forma persistente.'],
      date:['muestra o fija la fecha y hora','date','Imprime la fecha y hora del sistema.'],
      uptime:['tiempo que lleva encendido el sistema','uptime','Muestra la hora, el tiempo encendido y la carga media.'],
      free:['memoria libre y usada','free [-h]','Muestra el uso de memoria RAM y swap.'],
      env:['variables de entorno','env','Lista las variables de entorno de la sesión.'],
      which:['ubica un ejecutable','which ORDEN','Muestra la ruta del binario que se ejecutaría.'],
      sort:['ordena líneas de texto','sort [FICHERO]','Ordena alfabética o numéricamente las líneas.'],
      uniq:['elimina líneas duplicadas contiguas','uniq [FICHERO]','Colapsa líneas repetidas consecutivas (úsalo tras sort).'],
      nl:['numera las líneas','nl FICHERO','Muestra el fichero con números de línea.'],
      getsebool:['muestra booleanos de SELinux','getsebool -a','Lista el estado de los booleanos de SELinux.'],
      setsebool:['cambia booleanos de SELinux','setsebool [-P] booleano on|off','Activa o desactiva un booleano; con -P de forma persistente.'],
      chcon:['cambia el contexto SELinux (temporal)','chcon -t TIPO FICHERO','Cambia el contexto de un fichero; se pierde al reetiquetar (usa semanage+restorecon para persistir).'],
      timedatectl:['gestiona fecha, hora y zona','timedatectl [set-timezone ZONA]','Consulta o ajusta la hora y la zona horaria.'],
      getent:['consulta bases de datos del sistema','getent passwd|group|hosts CLAVE','Consulta passwd, group, hosts, etc.'],
      visudo:['edita /etc/sudoers de forma segura','visudo','Edita la configuración de sudo comprobando la sintaxis.'],
      xfs_growfs:['amplía un sistema de archivos XFS','xfs_growfs PUNTO','Aumenta un FS XFS al tamaño del volumen (no se puede reducir).'],
      resize2fs:['redimensiona un sistema ext2/3/4','resize2fs DISPOSITIVO [TAM]','Amplía o reduce un FS ext.'],
      lvresize:['cambia el tamaño de un volumen lógico','lvresize -L TAM /dev/VG/LV','Amplía o reduce un LV (usa -r para el FS).'],
      lvremove:['elimina un volumen lógico','lvremove /dev/VG/LV','Borra un volumen lógico y libera su espacio.'],
      vgremove:['elimina un grupo de volúmenes','vgremove VG','Borra un VG (y sus LV).'],
      pvremove:['borra la etiqueta LVM de un dispositivo','pvremove DISPOSITIVO','Quita la marca de volumen físico.'],
      getenforce:['muestra el modo de SELinux','getenforce','Imprime Enforcing, Permissive o Disabled.'],
      setenforce:['cambia el modo de SELinux','setenforce 0|1','0 = Permissive, 1 = Enforcing (temporal).'],
      sestatus:['estado de SELinux','sestatus','Muestra si SELinux está activo y en qué modo.'],
      semanage:['gestiona la política de SELinux','semanage port|fcontext|boolean ...','Cambios persistentes de SELinux (puertos, contextos, booleanos).'],
      restorecon:['restaura contextos SELinux','restorecon -Rv RUTA','Reetiqueta ficheros con su contexto por defecto.'],
      blkid:['muestra UUID y tipo de los dispositivos','blkid [DISPOSITIVO]','Lista UUID y tipo de sistema de archivos de los bloques.'],
      df:['espacio libre en disco','df -h','Muestra el uso de los sistemas de archivos montados.'],
      du:['uso de espacio de ficheros','du -sh RUTA','Calcula el tamaño ocupado por ficheros y carpetas.'],
      ping:['comprueba conectividad de red','ping HOST','Envía paquetes ICMP para verificar que un host responde.'],
      ss:['sockets y puertos en escucha','ss -tlnp','Muestra conexiones y puertos abiertos.'],
      ip:['configuración de red','ip a | ip route','Muestra o configura interfaces, direcciones y rutas.'],
      ifup:['activa una interfaz de red','ifup DISPOSITIVO','Levanta una interfaz (equivale a nmcli con up).'],
      ifdown:['desactiva una interfaz de red','ifdown DISPOSITIVO','Baja una interfaz de red.'],
      nmcli:['gestiona NetworkManager','nmcli con|dev ...','Configura conexiones de red (IP estática, gateway, etc.).'],
      'firewall-cmd':['gestiona el cortafuegos firewalld','firewall-cmd --list-all','Añade/quita servicios y puertos; usa --permanent y --reload.'],
      timedatectl:['fecha, hora y zona horaria','timedatectl','Consulta o ajusta la hora y zona del sistema.'],
      yum:['gestor de paquetes (heredado)','yum ...','Obsoleto en RHEL 9; usa dnf.'],
      rpm:['gestiona paquetes RPM','rpm -qa | -q | -ql','Consulta e instala paquetes RPM a bajo nivel.'],
      dnf:['gestor de paquetes de RHEL','dnf install|remove|update PAQUETE','Instala, elimina y actualiza software y resuelve dependencias.'],
      systemctl:['controla servicios y targets de systemd','systemctl start|enable|status UNIDAD','Gestiona servicios, el arranque y los targets.'],
      journalctl:['consulta los registros del sistema','journalctl -u UNIDAD','Muestra los logs de systemd.'],
      crontab:['programa tareas periódicas','crontab -e | -l | -r','Edita, lista o borra las tareas de cron del usuario.'],
      nice:['lanza un proceso con prioridad','nice -n N ORDEN','Ejecuta un comando con prioridad ajustada.'],
      renice:['cambia la prioridad de un proceso','renice N -p PID','Reajusta el nice de un proceso en marcha.'],
      atq:['lista trabajos de at pendientes','atq','Muestra la cola de tareas programadas con at.'],
      atrm:['borra un trabajo de at','atrm N','Elimina una tarea programada con at.'],
      labhosts:['lista los hosts del laboratorio','labhosts','Muestra web1, db1 y node1 con su IP, usuario y rol.'],
      neofetch:['muestra información del sistema','neofetch','Resumen visual del sistema (distro, kernel, etc.).'],
      poweroff:['apaga el sistema','poweroff','Detiene la máquina.'],
      chroot:['cambia el directorio raíz','chroot DIRECTORIO','Ejecuta con otra raíz (se usa en la recuperación de root).'],
      'systemd-run':['lanza una unidad transitoria','systemd-run --on-active=Ns ORDEN','Programa una tarea puntual con un temporizador de systemd.'],
      ps:['muestra procesos en ejecución','ps aux | -ef','Lista los procesos del sistema.'],
      top:['procesos en tiempo real','top','Monitor interactivo de procesos y recursos.'],
      pgrep:['busca procesos por nombre','pgrep NOMBRE','Devuelve los PID que coinciden con el nombre.'],
      kill:['envía una señal a un proceso','kill [-SEÑAL] PID','Termina o señaliza un proceso por su PID.'],
      exit:['cierra la sesión actual','exit','Sale de la sesión o del shell actual.'],
      logout:['cierra la sesión','logout','Cierra la sesión del usuario.'],
      su:['cambia de usuario','su [-] [USUARIO]','Abre una shell como otro usuario (root por defecto).'],
      sudo:['ejecuta como otro usuario','sudo ORDEN','Ejecuta un comando con privilegios (requiere estar en wheel).'],
      timedatectl:['fecha/hora/zona','timedatectl','Consulta o ajusta hora y zona horaria.']
    };
    Object.assign(MAN_BRIEF, runtime.manualBriefs||{});
    Object.keys(MAN_BRIEF).forEach(k=>{ if(!MAN[k]){ const b=MAN_BRIEF[k]; MAN[k]={ name:k+' - '+b[0], sec:'1', s:b[1], d:b[2], o:[] }; } });
    const renderMan=(key)=>{ let m=MAN[key]; if(!m && MAN_BRIEF[key]){ const b=MAN_BRIEF[key]; m={ name:key+' - '+b[0], sec:'1', s:b[1], d:b[2], o:[] }; } if(!m && (typeof CMDS!=='undefined' && CMDS.indexOf(key)!==-1)){ m={ name:key, sec:'1', s:key+' [OPCIONES]...', d:'Orden disponible en '+OS_NAME+'. Consulta el cheatsheet de abajo o usa '+key+' --help para ver su uso.', o:[] }; } if(!m){ err('No hay ninguna entrada de manual para '+key); out('Prueba con «help» o mira el cheatsheet de abajo.','#a2957d'); return; } const sec=m.sec||'1'; const head=key.toUpperCase()+'('+sec+')'; out(head+' '.repeat(Math.max(4,54-head.length))+'Manual de '+DISTRO+' / S2KTUX'+' '.repeat(Math.max(4,54-head.length))+head,'#8fa876'); out(''); out('NOMBRE','#e0a458'); out('       '+(m.name||key)); out(''); out('SINOPSIS','#e0a458'); String(m.s).split('\n').forEach(l=>out('       '+l)); out(''); out('DESCRIPCIÓN','#e0a458'); wrapT(m.d,66).forEach(l=>out('       '+l)); if(m.o&&m.o.length){ out(''); out('OPCIONES','#e0a458'); m.o.forEach(pair=>{ out('       '+pair[0]); wrapT(pair[1],58).forEach(l=>out('              '+l)); }); } if(m.e){ out(''); out('EJEMPLOS','#e0a458'); String(m.e).split('\n').forEach(l=>out('       '+l)); } out(''); out(OS_NAME+' '.repeat(Math.max(4,36-OS_NAME.length))+'agosto 2026'+' '.repeat(20)+head,'#a2957d'); };

    // ---------------- ps formatting ----------------
    const psAux = () => { out('USER       PID %CPU %MEM    VSZ   RSS TTY   STAT START   TIME COMMAND'); processes.forEach(p=>out(p.user.padEnd(9)+' '+String(p.pid).padStart(5)+' '+p.cpu.toFixed(1).padStart(4)+' '+p.mem.toFixed(1).padStart(4)+' '+String(p.vsz).padStart(6)+' '+String(p.rss).padStart(5)+' ?     '+p.stat.padEnd(4)+' '+p.start+' '+p.time.padStart(5)+' '+p.cmd)); };
    const psEf = () => { out('UID          PID    PPID  C STIME TTY          TIME CMD'); processes.forEach(p=>out(p.user.padEnd(9)+' '+String(p.pid).padStart(6)+'  '+String(p.ppid).padStart(6)+'  0 '+p.start.padEnd(5)+' ?        00:'+p.time.replace(':','0:').padStart(5,'0').slice(-5)+' '+p.cmd)); };

    // ---------------- disk views ----------------
    const lsblkView = () => {
      out('NAME              MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS');
      let maj=8, min=0, lvmin=0;
      disks.forEach((d)=>{
        out(d.name.padEnd(17)+' '+maj+':'+min+'    0  '+d.size.padStart(4)+'  0 disk');
        d.parts.forEach((p,pi)=>{ min++; const branch=(pi===d.parts.length-1)?'└─':'├─'; const mp=(p.fstype&&p.fstype!=='LVM2_member'&&p.mount)?' '+p.mount:''; out(branch+p.name.padEnd(15)+' '+maj+':'+min+'    0  '+p.size.padStart(4)+'  0 part'+mp);
          if(p.fstype==='LVM2_member'){ const pv=lvm.pvs.find(x=>x.name==='/dev/'+p.name); if(pv&&pv.vg){ const lvs=lvm.lvs.filter(l=>l.vg===pv.vg); lvs.forEach((l,li)=>{ const lb=(li===lvs.length-1)?'  └─':'  ├─'; const lm=l.mount==='[SWAP]'?'[SWAP]':(l.mount||''); out((lb+l.vg+'-'+l.name).padEnd(17)+' 253:'+(lvmin++)+'    0  '+(Math.round(l.size)+'G').padStart(4)+'  0 lvm  '+lm); }); } }
        });
        maj+=16; min=0;
      });
    };
    const dfView = () => {
      out('Filesystem              Size  Used Avail Use% Mounted on');
      lvm.lvs.forEach(l=>{ if(l.mount && l.mount!=='[SWAP]'){ const sz=Math.round(l.size); out(('/dev/mapper/'+l.vg+'-'+l.name).padEnd(23)+' '+(sz+'G').padStart(4)+'  '+(Math.round(sz*0.24)+'G').padStart(4)+'  '+(Math.round(sz*0.76)+'G').padStart(4)+'  24% '+l.mount); } });
      out('/dev/sda1               1.0G  180M  845M  18% /boot');
      out('tmpfs                   1.9G     0  1.9G   0% /dev/shm');
      disks.forEach(d=>d.parts.forEach(p=>{ if(p.mount && p.mount!=='/boot'){ out(('/dev/'+p.name).padEnd(23)+' '+p.size.padStart(4)+'   32M  '+p.size.padStart(4)+'   1% '+p.mount); } }));
    };
    const mountView = () => {
      lvm.lvs.forEach(l=>{ if(l.mount && l.mount!=='[SWAP]') out(lvMapper(l)+' on '+l.mount+' type '+(l.fstype||'xfs')+' (rw,relatime)'); });
      out('/dev/sda1 on /boot type xfs (rw,relatime)');
      disks.forEach(d=>d.parts.forEach(p=>{ if(p.mount && p.mount!=='/boot') out('/dev/'+p.name+' on '+p.mount+' type '+(p.fstype||'xfs')+' (rw,relatime)'); }));
    };
    const blkidView = () => { disks.forEach(d=>d.parts.forEach(p=>{ if(p.fstype) out('/dev/'+p.name+': UUID="'+(p.uuid||'----')+'" TYPE="'+p.fstype+'"'); })); lvm.lvs.forEach(l=>{ if(l.fstype&&l.fstype!=='swap') out(lvMapper(l)+': UUID="'+(l.uuid||(l.vg+l.name))+'" TYPE="'+l.fstype+'"'); else if(l.fstype==='swap') out(lvMapper(l)+': UUID="'+(l.uuid||'')+'" TYPE="swap"'); }); };
    const fsTypeName = (p) => { const t=(p.fstype||'').toLowerCase(); if(t.includes('lvm')) return 'Linux LVM'; if(t==='linux-swap'||t==='swap') return 'Linux swap'; return 'Linux filesystem'; };
    const niceGiB = (sz) => sz.replace('K',' KiB').replace('M',' MiB').replace('G',' GiB').replace('T',' TiB');
    const fdiskDisk = (d) => {
      const bytes = Math.round(sizeToGB(d.size)*1073741824); const sectors = Math.round(bytes/512);
      out('Disk /dev/'+d.name+': '+niceGiB(d.size)+', '+bytes+' bytes, '+sectors+' sectors');
      out('Units: sectors of 1 * 512 = 512 bytes');
      out('Sector size (logical/physical): 512 bytes / 512 bytes');
      out('I/O size (minimum/optimal): 512 bytes / 512 bytes');
      if(d.labeled){ out('Disklabel type: gpt'); out('Disk identifier: '+(d.id||('D'+d.name.toUpperCase()+'-1A2B-3C4D-5E6F-7890'))); }
      if(d.parts.length){ out(''); out('Device'.padEnd(15)+'Start'.padStart(9)+'End'.padStart(11)+'Sectors'.padStart(11)+'Size'.padStart(6)+'  Type'); let start=2048; d.parts.forEach(p=>{ const psec=Math.round(sizeToGB(p.size)*1073741824/512); const end=start+psec-1; out(('/dev/'+p.name).padEnd(15)+String(start).padStart(9)+String(end).padStart(11)+String(psec).padStart(11)+p.size.padStart(6)+'  '+fsTypeName(p)); start=end+1; }); }
    };
    const fdiskView = () => { disks.forEach((d,i)=>{ if(i) out(''); fdiskDisk(d); }); };

    // ---------------- network state helpers ----------------
    const ifState = () => net.eth0;

    // ---------------- red / conectividad ----------------
    const linkUp=()=> !!net.eth0.up;
    const online=()=> linkUp() && !!net.eth0.gw;
    const dnsOk=()=> online() && !!net.eth0.dns;
    const isIP=(s)=>/^\d{1,3}(\.\d{1,3}){3}$/.test(s||'');
    const sameSubnet=(ip)=>{ if(!isIP(ip)||!net.eth0.ip) return false; const a=ip.split('.').slice(0,3).join('.'); const b=net.eth0.ip.split('.').slice(0,3).join('.'); return a===b; };
    const listeningSockets=()=>{const rows=[];const add=(port,proc,pid,addr='0.0.0.0')=>{port=+port;if(port&&!rows.some(r=>r.port===port&&r.addr===addr))rows.push({proto:'tcp',addr,port,proc,pid:pid||1});};if(services.sshd&&services.sshd.active)add(sshdCfg.port||22,'sshd',services.sshd.pid);if(services.httpd&&services.httpd.active)add(services.httpd.port||httpdCfg().port||80,'httpd',services.httpd.pid);if(services.nginx&&services.nginx.active)add(80,'nginx',services.nginx.pid);if(services.mariadb&&services.mariadb.active)add(3306,'mariadbd',services.mariadb.pid,'127.0.0.1');if(services.docker&&services.docker.active)containers.filter(c=>c.running&&c.ports).forEach(c=>{const m=String(c.ports).match(/(?:[\d.]+:)?(\d+):(\d+)/);if(m)add(m[1],'docker-proxy',services.docker.pid);});if(MODE==='kubernetes')add(6443,'kube-apiserver',1020,net.eth0.ip||'0.0.0.0');return rows.sort((a,b)=>a.port-b.port);};
    const portOpen=(host,port)=>{if(['localhost','127.0.0.1','::1',net.eth0.ip,localHostname()].includes(host))return listeningSockets().find(r=>r.port===+port);const h=Object.values(labHosts||{}).find(x=>x.ip===host)||labHosts?.[host];return h&&(h.ports||[]).includes(+port)?{port:+port,proc:'remote'}:null;};
    // ---------------- ping (streaming) ----------------
    let pingTimer=null; let followTimer=null; let foregroundProcess=null; let pagerState=null;
    const stopFollow=()=>{ if(followTimer){ clearInterval(followTimer); followTimer=null; } };
    const startFollow=(gen)=>{ stopFollow(); booting=false; let k=0; followTimer=setInterval(()=>{ const ln=gen(k++); if(ln!==null && ln!==undefined) out(ln,'#a2957d'); scroll(); }, 1300); out('(pulsa Ctrl-C para dejar de seguir)','#6f6250'); };
    const endForeground=(status,signal)=>{ if(!foregroundProcess)return; const p=foregroundProcess;if(p.timer)clearInterval(p.timer);if(p.timeout)clearTimeout(p.timeout);const idx=processes.findIndex(x=>x.pid===p.pid);if(idx!==-1)processes.splice(idx,1);foregroundProcess=null;lastStatus=status||0;lastFail=lastStatus!==0;if(signal)out('^'+signal,'#a2957d');setPrompt();scroll();save(); };
    const suspendForeground=()=>{if(!foregroundProcess)return false;const p=foregroundProcess;if(p.timer)clearInterval(p.timer);if(p.timeout)clearTimeout(p.timeout);const job={id:nextJob++,pid:p.pid,cmd:p.cmd,status:'Stopped',user:currentUser,resume:p.resume||null};jobs.push(job);const proc=processes.find(x=>x.pid===p.pid);if(proc)proc.stat='T';out('^Z','#a2957d');out('['+job.id+']+  Stopped                 '+job.cmd);foregroundProcess=null;setPrompt();save();return true;};
    let nmtuiState=null;
    const nmtuiDraw = () => {
      const s=nmtuiState; clearBody();
      const box=(txt)=>gline(txt,'#8fa876');
      gline(' NetworkManager TUI ','#1a2410');
      gline('');
      if(s.screen==='menu'){
        box('┌───────────────────────────────────────────┐');
        box('│  Editar una conexión                        │');
        const items=['Editar una conexión','Activar una conexión','Definir el nombre de máquina','Salir'];
        clearBody(); gline(' NetworkManager TUI ','#e9ddc7'); gline('');
        box('┌─────────────────────────────────────────────┐');
        items.forEach((it,idx)=>{ const on=idx===s.sel; gline('│  '+(on?'\u25b8 ':'  ')+it.padEnd(38)+'│', on?'#e9ddc7':'#a99a86'); });
        box('└─────────────────────────────────────────────┘');
        gline('');
        gline('  ↑/↓ moverse · Enter seleccionar · Esc salir','#a2957d');
      } else if(s.screen==='edit'){
        const e0=net.eth0;
        const fields=[
          ['Método','method',(s.method==='manual'?'<Manual>':'<Automático (DHCP)>')],
          ['Dirección/máscara','ip',(s.ip||'')+(s.ip?'/'+s.prefix:'')],
          ['Puerta de enlace','gw',s.gw||''],
          ['Servidores DNS','dns',s.dns||''],
        ];
        gline(' Editar la conexión  ·  eth0 (ethernet) ','#e9ddc7'); gline('');
        box('┌─ CONFIGURACIÓN IPv4 ────────────────────────┐');
        fields.forEach((f,idx)=>{ const on=idx===s.sel && s.editing===false; const ed=idx===s.sel && s.editing; const val = ed ? (s.buf+'\u2588') : f[2]; gline('│ '+(on?'\u25b8':' ')+' '+f[0].padEnd(20)+' '+String(val).padEnd(18).slice(0,18)+'│', (on||ed)?'#e9ddc7':'#cdc0a8'); });
        box('│                                             │');
        const okOn=s.sel===4; const caOn=s.sel===5;
        gline('│   '+(okOn?'\u25b8':' ')+' <Aceptar>        '+(caOn?'\u25b8':' ')+' <Cancelar>       │', '#e9ddc7');
        box('└─────────────────────────────────────────────┘');
        gline('');
        if(s.editing) gline('  Escribe el valor y pulsa Enter (Esc cancela)','#a2957d');
        else gline('  ↑/↓ moverse · Enter editar/confirmar · en Método Enter alterna · Esc atrás','#a2957d');
      } else if(s.screen==='hostname'){
        gline(' Definir el nombre de máquina ','#e9ddc7'); gline('');
        box('┌─────────────────────────────────────────────┐');
        gline('│  Nombre: '+((s.buf||'')+'\u2588').padEnd(34)+'│','#e9ddc7');
        box('└─────────────────────────────────────────────┘');
        gline('  Escribe el nombre y pulsa Enter · Esc cancela','#a2957d');
      }
      scroll();
    };
    const nmtui = () => {
      const e0=net.eth0;
      nmtuiState={ screen:'menu', sel:0, editing:false, buf:'', method:e0.method||'auto', ip:e0.ip||'', prefix:e0.prefix||24, gw:e0.gw||'', dns:e0.dns||'' };
      if(titleEl) titleEl.textContent='nmtui'; promptEl.textContent=''; input.value='';
      nmtuiDraw();
    };
    const nmtuiExit = () => { nmtuiState=null; if(titleEl) titleEl.textContent='visitor@s2ktux: ~'; clearBody(); setPrompt(); };
    const nmtuiKey = (ev) => {
      const s=nmtuiState; const k=ev.key; ev.preventDefault();
      if(s.screen==='menu'){
        if(k==='ArrowUp'){ s.sel=(s.sel+3)%4; nmtuiDraw(); }
        else if(k==='ArrowDown'){ s.sel=(s.sel+1)%4; nmtuiDraw(); }
        else if(k==='Escape'){ nmtuiExit(); }
        else if(k==='Enter'){ if(s.sel===0){ s.screen='edit'; s.sel=0; s.editing=false; nmtuiDraw(); } else if(s.sel===1){ net.eth0.up=true; nmtuiExit(); out('Conexión «eth0» activada.','#8fa876'); } else if(s.sel===2){ s.screen='hostname'; s.buf=''; nmtuiDraw(); } else { nmtuiExit(); } }
        return;
      }
      if(s.screen==='hostname'){
        if(k==='Escape'){ s.screen='menu'; s.sel=0; nmtuiDraw(); }
        else if(k==='Enter'){ if(s.buf.trim()){ const f=getNode(['etc','hostname']); if(f)f.content=s.buf.trim(); } s.screen='menu'; s.sel=0; nmtuiDraw(); }
        else if(k==='Backspace'){ s.buf=s.buf.slice(0,-1); nmtuiDraw(); }
        else if(k.length===1&&!ev.ctrlKey&&!ev.metaKey){ s.buf+=k; nmtuiDraw(); }
        return;
      }
      // edit screen
      if(s.editing){
        if(k==='Escape'){ s.editing=false; s.buf=''; nmtuiDraw(); }
        else if(k==='Enter'){ const v=s.buf.trim(); if(s.sel===1){ const m=v.match(/([0-9.]+)(?:\/(\d+))?/); if(m){ s.ip=m[1]; if(m[2])s.prefix=+m[2]; } } else if(s.sel===2){ s.gw=v; } else if(s.sel===3){ s.dns=v; } s.editing=false; s.buf=''; nmtuiDraw(); }
        else if(k==='Backspace'){ s.buf=s.buf.slice(0,-1); nmtuiDraw(); }
        else if(k.length===1&&!ev.ctrlKey&&!ev.metaKey){ s.buf+=k; nmtuiDraw(); }
        return;
      }
      if(k==='ArrowUp'){ s.sel=(s.sel+5)%6; nmtuiDraw(); }
      else if(k==='ArrowDown'){ s.sel=(s.sel+1)%6; nmtuiDraw(); }
      else if(k==='Escape'){ s.screen='menu'; s.sel=0; nmtuiDraw(); }
      else if(k==='Enter'){
        if(s.sel===0){ s.method=(s.method==='manual'?'auto':'manual'); nmtuiDraw(); }
        else if(s.sel>=1&&s.sel<=3){ s.editing=true; s.buf=(s.sel===1?s.ip:s.sel===2?s.gw:s.dns)||''; nmtuiDraw(); }
        else if(s.sel===4){ const e0=net.eth0; e0.method=s.method; if(s.method==='manual'){ e0.ip=s.ip; e0.prefix=s.prefix; e0.gw=s.gw; e0.dns=s.dns; } else { e0.ip='192.168.1.50'; e0.prefix=24; e0.gw='192.168.1.1'; e0.dns='8.8.8.8'; } e0.up=true; nmtuiExit(); out('Conexión eth0 guardada y aplicada.','#8fa876'); }
        else if(s.sel===5){ s.screen='menu'; s.sel=0; nmtuiDraw(); }
      }
    };;
    const streamPing = (target, opts) => {
      opts=opts||{}; const loss=!!opts.loss; const ttl=opts.ttl||(opts.internet?55:64);
      out('PING '+target+' ('+target+') 56(84) bytes of data.');
      let seq=1; const total=opts.count==null?Infinity:opts.count; let recv=0; const t0=Date.now(); const pid=nextPid++;
      if(pingTimer) clearInterval(pingTimer);
      processes.push({pid,ppid:888,user:currentUser,cpu:0.1,mem:0.1,vsz:7800,rss:1100,stat:'S+',start:new Date().toLocaleTimeString().slice(0,5),time:'0:00',cmd:'ping '+target});
      const summary=()=>{const sent=seq-1,elapsed=Date.now()-t0;out('');out('--- '+target+' ping statistics ---');out(sent+' packets transmitted, '+recv+' received, '+(loss&&recv===0?'+'+sent+' errors, ':'')+(sent?Math.round((sent-recv)/sent*100):0)+'% packet loss, time '+elapsed+'ms');if(recv)out('rtt min/avg/max/mdev = '+(opts.internet?'11.2/13.8/16.1/1.9':'0.201/0.312/0.502/0.101')+' ms');};
      pingTimer=setInterval(()=>{
        if(seq>total){ clearInterval(pingTimer); pingTimer=null;summary();endForeground(0);return; }
        if(loss){ out('From '+(net.eth0.ip||'0.0.0.0')+' icmp_seq='+seq+' Destination Host Unreachable'); }
        else { recv++; const base=opts.internet?(11+Math.random()*5):(0.2+Math.random()*0.6); out('64 bytes from '+target+': icmp_seq='+seq+' ttl='+ttl+' time='+base.toFixed(opts.internet?1:2)+' ms'); }
        seq++; scroll();
      }, 320);
      foregroundProcess={pid,cmd:'ping '+target,timer:pingTimer,onInterrupt:summary}; promptEl.textContent=''; input.value='';
    };

    // ---------------- filters (pipes) ----------------
    const jqFilter=(argv,lines)=>{if(!commandAvailable('jq')){err('-bash: jq: orden no encontrada',127);return[];}const raw=argv.includes('-r'),expr=(argv.find(a=>!a.startsWith('-'))||'.').replace(/^['"]|['"]$/g,'');let value;try{value=JSON.parse(lines.join('\n'));}catch(e){err('parse error: Invalid numeric literal at line 1, column 1',4);return[];}if(expr!=='.'){const segments=expr.replace(/^\./,'').split('.').filter(Boolean);let values=[value];segments.forEach(seg=>{const many=seg.endsWith('[]'),key=seg.replace(/\[\]$/,'');values=values.flatMap(v=>{const next=key?(v==null?undefined:v[key]):v;if(many)return Array.isArray(next)?next:[];return[next];}).filter(v=>v!==undefined);});value=values.length===1?values[0]:values;}const vals=Array.isArray(value)&&expr.includes('[]')?value:[value];return vals.map(v=>raw&&typeof v!=='object'?String(v):JSON.stringify(v,null,2)).flatMap(v=>v.split('\n'));};
    const applyFilter = (stage, lines) => {
      const t=stage.split(/\s+/).filter(Boolean); const c=t[0]; const a=t.slice(1);
      if(c==='grep'){ const inv=a.includes('-v'); const ic=a.includes('-i')||a.includes('-iv'); const cnt=a.includes('-c'); const pat=a.filter(x=>!x.startsWith('-')).join(' '); let r=lines.filter(l=>{ const hay=ic?l.toLowerCase():l; const nd=ic?pat.toLowerCase():pat; const m=hay.indexOf(nd)!==-1; return inv?!m:m; }); return cnt?[String(r.length)]:r; }
      if(c==='wc'){ if(a.includes('-l')) return [String(lines.length)]; const w=lines.join(' ').split(/\s+/).filter(Boolean).length; return [lines.length+' '+w+' '+lines.join('\n').length]; }
      if(c==='head'){ const n=a.includes('-n')?+a[a.indexOf('-n')+1]:10; return lines.slice(0,n); }
      if(c==='tail'){ const n=a.includes('-n')?+a[a.indexOf('-n')+1]:10; return lines.slice(-n); }
      if(c==='sort'){ let r=lines.slice(); if(a.includes('-n')) r.sort((x,y)=>parseFloat(x)-parseFloat(y)); else r.sort(); if(a.includes('-r')) r.reverse(); return r; }
      if(c==='uniq'){ const r=[]; lines.forEach(l=>{ if(r[r.length-1]!==l) r.push(l); }); return r; }
      if(c==='nl'){ return lines.map((l,i)=>String(i+1).padStart(6)+'  '+l); }
      if(c==='jq')return jqFilter(a,lines);
      if(c==='cat'||c==='more'||c==='less'||c==='tee') return lines;
      return lines;
    };

    // ---------------- fdisk interactivo ----------------
    const parseSize = (line) => { const m=String(line).match(/^\+?(\d+)\s*([KMGTP])/i); return m ? (m[1]+m[2].toUpperCase()) : null; };
    const sizeToGB = (s) => { const m=String(s).match(/(\d+(?:\.\d+)?)\s*([KMGTP])/i); if(!m) return 0; const v=parseFloat(m[1]); const u=m[2].toUpperCase(); return u==='K'?v/1048576:u==='M'?v/1024:u==='G'?v:u==='T'?v*1024:v*1048576; };
    const gbToNice = (g) => g>=1 ? (Number.isInteger(g)?g:g.toFixed(1))+'G' : Math.round(g*1024)+'M';
    const diskUsedGB = (parts) => parts.reduce((s,p)=>s+sizeToGB(p.size||'0'),0);
    const fdiskRepl = (disk) => {
      clearBody();
      out('Bienvenido a fdisk (util-linux 2.37.4).','#8fa876');
      out('Los cambios solo permanecerán en la memoria hasta que decida escribirlos.','#a2957d');
      out('Tenga cuidado antes de usar la orden de escritura (w).','#a2957d');
      out('');
      const work = JSON.parse(JSON.stringify(disk.parts));
      let labeled = disk.labeled; let step='cmd'; let tmp={};
      const prompt = () => startInteractive('Orden (m para obtener ayuda):', false, handle, '#8fa876');
      const printTable = () => { const bytes=Math.round(sizeToGB(disk.size)*1073741824); const sectors=Math.round(bytes/512); out('Disco /dev/'+disk.name+': '+niceGiB(disk.size)+', '+bytes+' bytes, '+sectors+' sectores'); out('Unidades: sectores de 1 * 512 = 512 bytes'); out('Tipo de etiqueta de disco: '+(labeled?'gpt':'(sin etiqueta)')); if(work.length){ out(''); out('Dispositivo'.padEnd(15)+'Start'.padStart(9)+'End'.padStart(11)+'Sectors'.padStart(11)+'Size'.padStart(6)+'  Type'); let start=2048; work.forEach(p=>{ const psec=Math.round(sizeToGB(p.size||'0')*1073741824/512); const end=start+psec-1; out(('/dev/'+p.name).padEnd(15)+String(start).padStart(9)+String(end).padStart(11)+String(psec).padStart(11)+(p.size||'?').padStart(6)+'  '+(p.typeName||'Linux filesystem')); start=end+1; }); } };
      const handle = (line) => {
        line = line.trim();
        if(step==='cmd'){
          switch(line){
            case '': prompt(); return;
            case 'm': outMany(['Ayuda:','   g   crear una nueva tabla de particiones GPT vacía','   n   añadir una nueva partición','   d   suprimir una partición','   t   cambiar el tipo de una partición','   l   listar los tipos conocidos','   p   imprimir la tabla de particiones','   w   escribir los cambios y salir','   q   salir sin guardar los cambios']); prompt(); return;
            case 'g': labeled=true; work.length=0; ok('Se ha creado una nueva etiqueta de disco GPT.'); prompt(); return;
            case 'p': printTable(); prompt(); return;
            case 'l': outMany(['  83  Linux filesystem     8e  Linux LVM','  82  Linux swap          fd  Linux RAID','   b  W95 FAT32            7  HPFS/NTFS']); prompt(); return;
            case 'n': if(!labeled){ err('El disco no contiene una tabla de particiones reconocida. Usa «g» primero.'); prompt(); return; } tmp={num:work.length+1}; step='n_last'; startInteractive('Último sector, +/-sectores o +/-tamaño{K,M,G,T,P} (Enter = todo el disco):', false, handle, '#8fa876'); return;
            case 'd': if(!work.length){ err('No hay ninguna partición que suprimir.'); prompt(); return; } step='d_num'; startInteractive('Número de partición a suprimir:', false, handle, '#8fa876'); return;
            case 't': if(!work.length){ err('No hay ninguna partición.'); prompt(); return; } step='t_num'; startInteractive('Número de partición:', false, handle, '#8fa876'); return;
            case 'w': disk.parts=work; disk.labeled=labeled; ok('Se ha modificado la tabla de particiones.'); ok('Llamando a ioctl() para volver a leer la tabla de particiones.'); ok('Se están sincronizando los discos.'); endInteractive(); return;
            case 'q': out('Saliendo sin guardar los cambios.'); endInteractive(); return;
            default: err('«'+line+'» no es una orden válida. Escribe «m» para la ayuda.'); prompt(); return;
          }
        }
        if(step==='n_last'){ const totalGB=sizeToGB(disk.size); const freeGB=totalGB-diskUsedGB(work); if(freeGB<=0.001){ err('No queda espacio libre en el disco. Elimina alguna partición primero.'); step='cmd'; prompt(); return; } let sz=parseSize(line); if(sz){ const reqGB=sizeToGB(sz); if(reqGB>freeGB+0.001){ err('El valor «'+line+'» está fuera de rango.'); err('Sólo quedan '+gbToNice(freeGB)+' libres en /dev/'+disk.name+' ('+disk.size+' en total).'); step='cmd'; prompt(); return; } } else { sz=gbToNice(freeGB); } work.push({name:disk.name+tmp.num, size:sz, fstype:'', uuid:'', mount:'', typeName:'Linux filesystem', typeCode:'83'}); ok('Se ha creado la partición '+tmp.num+' (/dev/'+disk.name+tmp.num+') de tamaño '+sz+'.'); step='cmd'; prompt(); return; }
        if(step==='d_num'){ const i=parseInt(line)-1; if(work[i]){ work.splice(i,1); work.forEach((p,idx)=>p.name=disk.name+(idx+1)); ok('Se ha suprimido la partición '+(i+1)+'.'); } else err('Número de partición no válido.'); step='cmd'; prompt(); return; }
        if(step==='t_num'){ const i=parseInt(line)-1; if(work[i]){ tmp={ti:i}; step='t_code'; startInteractive('Código hex (l para listar; 83=Linux, 8e=LVM, 82=swap):', false, handle, '#8fa876'); } else { err('Número de partición no válido.'); step='cmd'; prompt(); } return; }
        if(step==='t_code'){ if(line==='l'){ outMany(['  83 Linux   8e Linux LVM   82 Linux swap   fd Linux RAID']); startInteractive('Código hex:', false, handle, '#8fa876'); return; } const map={'83':['Linux filesystem','83'],'8e':['Linux LVM','8e'],'82':['Linux swap','82'],'fd':['Linux RAID','fd'],'7':['HPFS/NTFS','7'],'b':['W95 FAT32','b']}; const m=map[line.toLowerCase()]; if(m){ work[tmp.ti].typeName=m[0]; work[tmp.ti].typeCode=m[1]; if(m[1]==='82') work[tmp.ti].fstype=work[tmp.ti].fstype; ok('Se ha cambiado el tipo de la partición a «'+m[0]+'».'); } else err('Código de tipo no válido.'); step='cmd'; prompt(); return; }
      };
      out('Bienvenido a fdisk (util-linux).'); out('Los cambios solo permanecerán en memoria hasta que decida escribirlos con «w».'); out(''); prompt();
    };

    // ---------------- editor de pantalla completa (vi / nano) ----------------
    let edState=null, edSaved=null;
    const edEsc=(s)=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const editorRows=()=> Math.max(8, Math.floor((body.clientHeight-40)/24));
    const editorEnter=(kind,path)=>{
      const segs=norm(path); const parent=getParent(segs); const fn=segs[segs.length-1];
      if(!parent||parent.type!=='dir'){ err(kind+': no se puede abrir '+path); return; }
      const existing=parent.children[fn];
      if(existing&&existing.type==='dir'){ err(kind+': '+path+' es un directorio'); return; }
      const lines=(existing&&existing.type==='file')?existing.content.split('\n'):[''];
      edState={kind,path,parent,fn,lines,row:0,col:0,top:0,mode:kind==='vi'?'normal':'insert',cmd:'',msg:'',viMsg:'',dirty:false,cut:'',help:false,pending:'',prompt:null};
      edSaved=[...body.children].filter(c=>c!==line);
      edSaved.forEach(c=>{ c.__d=c.style.display; c.style.display='none'; });
      promptEl.style.display='none';
      edState.inputCss=input.style.cssText;
      input.style.cssText+=';position:absolute;left:-9999px;width:1px;height:1px;opacity:0;';
      body.style.overflow='hidden';
      edState.el=document.createElement('div'); edState.el.id='term-editor';
      edState.el.style.cssText='white-space:pre;font-family:inherit;font-size:inherit;line-height:24px;color:#d8cbad;height:'+(body.clientHeight-40)+'px;overflow:hidden';
      body.insertBefore(edState.el, line);
      interactive={editor:true};
      if(titleEl) titleEl.textContent=(kind==='vi'?'vi ':'nano ')+path;
      editorRender(); input.focus();
    };
    const editorExit=(msg)=>{
      const cssBak=edState?edState.inputCss:'';
      if(edState&&edState.el) edState.el.remove();
      if(edSaved) edSaved.forEach(c=>{ c.style.display=c.__d||''; });
      promptEl.style.display=''; input.style.cssText=cssBak; body.style.overflow='auto';
      edState=null; edSaved=null; endInteractive();
      if(msg) out(msg,'#a2957d'); scroll();
    };
    const editorSave=(toPath)=>{
      const s=edState; let parent=s.parent, fn=s.fn;
      if(toPath && toPath!==s.path){ const segs=norm(toPath); parent=getParent(segs); fn=segs[segs.length-1]; if(parent&&parent.type==='dir'){ s.parent=parent; s.fn=fn; s.path=toPath; } }
      if(!parent||parent.type!=='dir') return false;
      if(!parent.children[fn]) parent.children[fn]=file('',{owner:currentUser,group:currentUser});
      parent.children[fn].content=s.lines.join('\n'); s.dirty=false; save(); return true;
    };
    const lineWithCursor=(text,col,active)=>{
      if(!active) return edEsc(text)||' ';
      const c=col<text.length?text[col]:' ';
      return edEsc(text.slice(0,col))+'<span style="background:#d8cbad;color:#12100b">'+edEsc(c)+'</span>'+edEsc(text.slice(col+1));
    };
    const editorRender=()=>{
      const s=edState; if(!s) return; const rows=editorRows(); const H=[];
      if(s.row<s.top) s.top=s.row;
      if(s.kind==='vi'){
        const textRows=rows-1;
        if(s.row>=s.top+textRows) s.top=s.row-textRows+1;
        for(let i=0;i<textRows;i++){ const idx=s.top+i; if(idx<s.lines.length){ H.push(lineWithCursor(s.lines[idx], s.row===idx?s.col:-1, s.row===idx)); } else { H.push('<span style="color:#3f5566">~</span>'); } }
        let st;
        if(s.mode==='cmd'){ st=edEsc(':'+s.cmd)+'<span style="background:#d8cbad;color:#12100b"> </span>'; }
        else { const left=s.viMsg?s.viMsg:((s.mode==='insert')?'-- INSERTAR --':('"'+s.path+'" '+s.lines.length+'L')); const right=(s.row+1)+','+(s.col+1); const pad=Math.max(1,64-left.length-right.length); st='<span style="color:'+(s.viMsg?'#ef8a7a':'#8fa876')+'">'+edEsc(left)+'</span>'+' '.repeat(pad)+edEsc(right); }
        H.push(st);
      } else {
        const footRows=s.help?4:3; const textRows=rows-1-footRows;
        H.push('<span style="background:#d8cbad;color:#12100b">  GNU nano 7.2'+' '.repeat(8)+edEsc(s.path)+(s.dirty?'   Modificado':'')+'  </span>');
        if(s.row>=s.top+textRows) s.top=s.row-textRows+1;
        for(let i=0;i<textRows;i++){ const idx=s.top+i; if(idx<s.lines.length){ H.push(lineWithCursor(s.lines[idx], s.row===idx?s.col:-1, s.row===idx)); } else { H.push(''); } }
        H.push('<span style="color:#8fa876">'+edEsc(s.msg||'')+'</span>');
        if(s.help) H.push('<span style="color:#a2957d">Ctrl+tecla ejecuta la orden. Escribe texto y muévete con las flechas. Enter parte la línea.</span>');
        H.push('<span style="background:#241d13;color:#8fa876">^G</span> Ayuda    <span style="background:#241d13;color:#8fa876">^O</span> Guardar  <span style="background:#241d13;color:#8fa876">^W</span> Buscar   <span style="background:#241d13;color:#8fa876">^K</span> Cortar');
        H.push('<span style="background:#241d13;color:#8fa876">^X</span> Salir    <span style="background:#241d13;color:#8fa876">^U</span> Pegar    <span style="background:#241d13;color:#8fa876">^C</span> Posición <span style="background:#241d13;color:#8fa876">^G</span> Ayuda');
      }
      s.el.innerHTML=H.join('\n');
    };
    const editorKey=(e)=>{ if(!edState) return; if(edState.kind==='vi') editorViKey(e); else editorNanoKey(e); };
    const editorViKey=(e)=>{
      const s=edState; const k=e.key; e.preventDefault(); s.viMsg='';
      const cur=()=>s.lines[s.row];
      if(s.mode==='cmd'){
        if(k==='Enter'){ const t2=s.cmd; s.mode='normal'; s.cmd='';
          if(t2==='w'||/^w\s+/.test(t2)){ editorSave(t2.slice(1).trim()||undefined); s.viMsg='"'+s.path+'" '+s.lines.length+'L escrito'; editorRender(); return; }
          if(t2==='wq'||t2==='x'||t2==='wq!'){ editorSave(); editorExit('"'+s.path+'" '+s.lines.length+'L escrito'); return; }
          if(t2==='q'){ if(s.dirty){ s.viMsg='E37: no se guardó el último cambio (usa :q! para forzar)'; editorRender(); return; } editorExit('(salido de vi)'); return; }
          if(t2==='q!'){ editorExit('(salido de vi sin guardar)'); return; }
          s.viMsg='E492: no es una orden del editor: '+t2; editorRender(); return;
        }
        if(k==='Escape'){ s.mode='normal'; s.cmd=''; editorRender(); return; }
        if(k==='Backspace'){ if(s.cmd.length) s.cmd=s.cmd.slice(0,-1); else s.mode='normal'; editorRender(); return; }
        if(k.length===1&&!e.ctrlKey&&!e.metaKey){ s.cmd+=k; editorRender(); }
        return;
      }
      if(s.mode==='insert'){
        if(k==='Escape'){ s.mode='normal'; s.col=Math.max(0,s.col-1); editorRender(); return; }
        if(k==='ArrowLeft'){ s.col=Math.max(0,s.col-1); editorRender(); return; }
        if(k==='ArrowRight'){ s.col=Math.min(cur().length,s.col+1); editorRender(); return; }
        if(k==='ArrowUp'){ if(s.row>0){ s.row--; s.col=Math.min(s.col,cur().length); } editorRender(); return; }
        if(k==='ArrowDown'){ if(s.row<s.lines.length-1){ s.row++; s.col=Math.min(s.col,cur().length); } editorRender(); return; }
        if(k==='Enter'){ const l=cur(); const rest=l.slice(s.col); s.lines[s.row]=l.slice(0,s.col); s.lines.splice(s.row+1,0,rest); s.row++; s.col=0; s.dirty=true; editorRender(); return; }
        if(k==='Backspace'){ if(s.col>0){ const l=cur(); s.lines[s.row]=l.slice(0,s.col-1)+l.slice(s.col); s.col--; } else if(s.row>0){ const prev=s.lines[s.row-1]; s.col=prev.length; s.lines[s.row-1]=prev+cur(); s.lines.splice(s.row,1); s.row--; } s.dirty=true; editorRender(); return; }
        if(k==='Tab'){ const l=cur(); s.lines[s.row]=l.slice(0,s.col)+'    '+l.slice(s.col); s.col+=4; s.dirty=true; editorRender(); return; }
        if(k.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey){ const l=cur(); s.lines[s.row]=l.slice(0,s.col)+k+l.slice(s.col); s.col++; s.dirty=true; editorRender(); }
        return;
      }
      // normal
      if(k==='i'){ s.mode='insert'; }
      else if(k==='a'){ s.col=Math.min(cur().length,s.col+1); s.mode='insert'; }
      else if(k==='A'){ s.col=cur().length; s.mode='insert'; }
      else if(k==='I'){ s.col=0; s.mode='insert'; }
      else if(k==='o'){ s.lines.splice(s.row+1,0,''); s.row++; s.col=0; s.mode='insert'; s.dirty=true; }
      else if(k==='O'){ s.lines.splice(s.row,0,''); s.col=0; s.mode='insert'; s.dirty=true; }
      else if(k==='h'||k==='ArrowLeft'){ s.col=Math.max(0,s.col-1); }
      else if(k==='l'||k==='ArrowRight'){ s.col=Math.min(Math.max(0,cur().length-1),s.col+1); }
      else if(k==='j'||k==='ArrowDown'){ if(s.row<s.lines.length-1) s.row++; }
      else if(k==='k'||k==='ArrowUp'){ if(s.row>0) s.row--; }
      else if(k==='0'){ s.col=0; }
      else if(k==='$'){ s.col=Math.max(0,cur().length-1); }
      else if(k==='G'){ s.row=s.lines.length-1; s.col=0; }
      else if(k==='g'){ if(s.pending==='g'){ s.row=0; s.col=0; } s.pending=(s.pending==='g')?'':'g'; }
      else if(k==='x'){ const l=cur(); if(s.col<l.length){ s.lines[s.row]=l.slice(0,s.col)+l.slice(s.col+1); s.dirty=true; } }
      else if(k==='D'){ s.lines[s.row]=cur().slice(0,s.col); s.dirty=true; }
      else if(k==='d'){ if(s.pending==='d'){ s.cut=cur(); s.lines.splice(s.row,1); if(!s.lines.length) s.lines=['']; if(s.row>=s.lines.length) s.row=s.lines.length-1; s.col=0; s.dirty=true; s.pending=''; } else { s.pending='d'; } }
      else if(k==='p'){ if(s.cut){ s.lines.splice(s.row+1,0,s.cut); s.row++; s.dirty=true; } }
      else if(k===':'){ s.mode='cmd'; s.cmd=''; }
      else if(k==='Escape'){ s.pending=''; }
      if(k!=='g'&&k!=='d') s.pending='';
      { const len=s.lines[s.row].length; const max=(s.mode==='insert')?len:Math.max(0,len-1); if(s.col>max) s.col=max; if(s.col<0) s.col=0; }
      editorRender();
    };
    const editorNanoKey=(e)=>{
      const s=edState; const k=e.key; const cur=()=>s.lines[s.row];
      if(s.prompt){
        if(k==='Enter'){ e.preventDefault(); const pr=s.prompt; s.prompt=null;
          if(pr.type==='write'){ editorSave(pr.buf||s.path); if(pr.exit){ editorExit('[ Escrito · salir de nano ]'); return; } s.msg='[ Escritas '+s.lines.length+' líneas ]'; editorRender(); return; }
          if(pr.type==='search'){ const q=pr.buf; let j=-1; for(let i=s.row+1;i<s.lines.length;i++){ if(s.lines[i].includes(q)){ j=i; break; } } if(j===-1) j=s.lines.findIndex(l=>l.includes(q)); if(j!==-1){ s.row=j; s.col=Math.max(0,s.lines[j].indexOf(q)); s.msg=''; } else s.msg='[ "'+q+'" no encontrado ]'; editorRender(); return; }
          editorRender(); return; }
        if(k==='Escape'){ e.preventDefault(); s.prompt=null; s.msg='[ Cancelado ]'; editorRender(); return; }
        if(k==='Backspace'){ e.preventDefault(); s.prompt.buf=s.prompt.buf.slice(0,-1); s.msg=s.prompt.label+s.prompt.buf; editorRender(); return; }
        if(k.length===1&&!e.ctrlKey&&!e.metaKey){ e.preventDefault(); s.prompt.buf+=k; s.msg=s.prompt.label+s.prompt.buf; editorRender(); return; }
        e.preventDefault(); return;
      }
      if(e.ctrlKey){ const c=k.toLowerCase(); e.preventDefault(); s.msg='';
        if(c==='o'){ s.prompt={type:'write',buf:s.path,label:'Nombre de fichero a escribir: '}; s.msg='Nombre de fichero a escribir: '+s.path; }
        else if(c==='x'){ if(s.dirty){ s.prompt={type:'write',buf:s.path,label:'Guardar en: ',exit:true}; s.msg='¿Guardar el búfer modificado? Nombre y Enter (Esc cancela): '+s.path; } else { editorExit('[ Salir de nano ]'); return; } }
        else if(c==='k'){ s.cut=cur(); s.lines.splice(s.row,1); if(!s.lines.length) s.lines=['']; if(s.row>=s.lines.length) s.row=s.lines.length-1; s.col=0; s.dirty=true; s.msg='[ línea cortada ]'; }
        else if(c==='u'){ if(s.cut){ s.lines.splice(s.row,0,s.cut); s.dirty=true; s.msg='[ línea pegada ]'; } }
        else if(c==='w'){ s.prompt={type:'search',buf:'',label:'Buscar: '}; s.msg='Buscar: '; }
        else if(c==='g'){ s.help=!s.help; }
        else if(c==='c'){ s.msg='[ línea '+(s.row+1)+'/'+s.lines.length+', col '+(s.col+1)+' ]'; }
        editorRender(); return;
      }
      e.preventDefault(); s.msg='';
      if(k==='ArrowLeft'){ s.col=Math.max(0,s.col-1); }
      else if(k==='ArrowRight'){ s.col=Math.min(cur().length,s.col+1); }
      else if(k==='ArrowUp'){ if(s.row>0){ s.row--; s.col=Math.min(s.col,cur().length); } }
      else if(k==='ArrowDown'){ if(s.row<s.lines.length-1){ s.row++; s.col=Math.min(s.col,cur().length); } }
      else if(k==='Home'){ s.col=0; }
      else if(k==='End'){ s.col=cur().length; }
      else if(k==='Enter'){ const l=cur(); const rest=l.slice(s.col); s.lines[s.row]=l.slice(0,s.col); s.lines.splice(s.row+1,0,rest); s.row++; s.col=0; s.dirty=true; }
      else if(k==='Backspace'){ if(s.col>0){ const l=cur(); s.lines[s.row]=l.slice(0,s.col-1)+l.slice(s.col); s.col--; } else if(s.row>0){ const prev=s.lines[s.row-1]; s.col=prev.length; s.lines[s.row-1]=prev+cur(); s.lines.splice(s.row,1); s.row--; } s.dirty=true; }
      else if(k==='Tab'){ const l=cur(); s.lines[s.row]=l.slice(0,s.col)+'    '+l.slice(s.col); s.col+=4; s.dirty=true; }
      else if(k.length===1&&!e.metaKey&&!e.altKey){ const l=cur(); s.lines[s.row]=l.slice(0,s.col)+k+l.slice(s.col); s.col++; s.dirty=true; }
      editorRender();
    };

    // ---------------- paginador / pantalla alternativa (less, man, top) ----------------
    const pagerRender=()=>{const s=pagerState;if(!s)return;const rows=Math.max(6,Math.floor((body.clientHeight-40)/24)-1);const view=s.lines.slice(s.top,s.top+rows);s.el.innerHTML=view.map(edEsc).join('\n')+'\n<span style="background:#241d13;color:#e9ddc7">'+edEsc(s.label+'  '+Math.min(100,Math.round((s.top+rows)/Math.max(1,s.lines.length)*100))+'%  (q salir)')+'</span>';};
    const pagerEnter=(lines,label,refresh)=>{if(pagerState)return;const saved=[...body.children].filter(c=>c!==line);saved.forEach(c=>{c.__pd=c.style.display;c.style.display='none';});promptEl.style.display='none';const inputCss=input.style.cssText;input.style.cssText+=';position:absolute;left:-9999px;width:1px;height:1px;opacity:0;';body.style.overflow='hidden';const el=document.createElement('div');el.style.cssText='white-space:pre;font-family:inherit;font-size:inherit;line-height:24px;color:#d8cbad;height:'+(body.clientHeight-40)+'px;overflow:hidden';body.insertBefore(el,line);pagerState={lines,top:0,label,saved,inputCss,el,timer:null};if(refresh)pagerState.timer=setInterval(()=>{if(!pagerState)return;pagerState.lines=refresh();pagerRender();},1000);if(titleEl)titleEl.textContent=label;pagerRender();input.focus();};
    const pagerExit=()=>{const s=pagerState;if(!s)return;if(s.timer)clearInterval(s.timer);s.el.remove();s.saved.forEach(c=>c.style.display=c.__pd||'');promptEl.style.display='';input.style.cssText=s.inputCss;body.style.overflow='auto';pagerState=null;setPrompt();scroll();};
    const pagerKey=e=>{const s=pagerState;if(!s)return;e.preventDefault();const rows=Math.max(5,Math.floor((body.clientHeight-40)/24)-2);if(e.key==='q'||e.key==='Escape'||(e.ctrlKey&&e.key.toLowerCase()==='c')){pagerExit();return;}if(e.key==='ArrowDown'||e.key==='Enter')s.top=Math.min(Math.max(0,s.lines.length-rows),s.top+1);else if(e.key==='ArrowUp')s.top=Math.max(0,s.top-1);else if(e.key==='PageDown'||e.key===' ')s.top=Math.min(Math.max(0,s.lines.length-rows),s.top+rows);else if(e.key==='PageUp')s.top=Math.max(0,s.top-rows);else if(e.key==='Home'||e.key==='g')s.top=0;else if(e.key==='End'||e.key==='G')s.top=Math.max(0,s.lines.length-rows);pagerRender();};
    const topLines=()=>{const sec=Math.max(1,Math.floor((Date.now()-bootStartedAt)/1000));const rows=['top - '+new Date().toLocaleTimeString()+' up '+Math.floor(sec/60)+' min,  1 user,  load average: 0.08, 0.03, 0.01','Tasks: '+processes.length+' total,   1 running, '+Math.max(0,processes.length-1)+' sleeping,   0 stopped,   0 zombie','%Cpu(s):  2.0 us,  0.7 sy,  0.0 ni, 97.0 id,  0.3 wa,  0.0 hi,  0.0 si','MiB Mem :   3894.1 total,   1998.2 free,   1123.4 used,    772.5 buff/cache','MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   2456.9 avail Mem','','    PID USER      PR  NI    VIRT    RES  %CPU  %MEM     TIME+ COMMAND'];processes.slice().sort((a,b)=>b.mem-a.mem).slice(0,30).forEach(p=>rows.push(String(p.pid).padStart(7)+' '+p.user.padEnd(9)+' 20   0 '+String(p.vsz).padStart(7)+' '+String(p.rss).padStart(6)+' '+p.cpu.toFixed(1).padStart(5)+' '+p.mem.toFixed(1).padStart(5)+'   '+p.time+'  '+p.cmd.replace(/^[-/].*\//,'').replace(/^-/,'').split(' ')[0]));return rows;};

    // ---------------- docker compose ----------------
    const composeHandler = (a) => {
      if(MODE!=='docker'||!installed.has('docker-ce-cli')||!installed.has('docker-compose-plugin')){ err('-bash: docker compose: orden no encontrada'); return; }
      if(!services.docker||!services.docker.active){ err('Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?'); return; }
      const sub=a[0];
      if(!sub||sub==='--help'){ outMany(['Uso: docker compose [-f fichero] COMANDO','','  up [-d]     crea y arranca los servicios (‑d en segundo plano)','  down        para y elimina servicios, redes y (con -v) volúmenes','  ps          lista los servicios en ejecución','  logs [-f]   muestra los logs de los servicios','  build       construye las imágenes de los servicios','  pull        descarga las imágenes de los servicios','','Lee docker-compose.yml del directorio actual.']); return; }
      if(sub==='up'){ composeProjects.app={running:true}; out('[+] Running 3/3'); out(' \u2714 Network app_default   Created'); out(' \u2714 Container app-db-1     Started'); out(' \u2714 Container app-web-1    Started'); if(!a.includes('-d')) out('web-1  | listo, escuchando en :80   (Ctrl-C para parar)','#a2957d'); }
      else if(sub==='down'){ composeProjects.app={running:false}; out('[+] Running 3/3'); out(' \u2714 Container app-web-1    Removed'); out(' \u2714 Container app-db-1     Removed'); out(' \u2714 Network app_default   Removed'); }
      else if(sub==='ps'){ out('NAME        IMAGE          COMMAND                  SERVICE   STATUS         PORTS'); out('app-db-1    mariadb:11     "docker-entrypoint..."   db        Up 12 seconds  3306/tcp'); out('app-web-1   nginx:latest   "nginx -g daemon..."     web       Up 12 seconds  0.0.0.0:8080->80/tcp'); }
      else if(sub==='logs'){ out('app-db-1   | [Note] mariadbd: ready for connections. port: 3306'); out('app-web-1  | listo, escuchando en :80'); if(a.includes('-f')) startFollow(k=>['app-web-1  | GET / 200','app-db-1   | connection accepted','app-web-1  | healthcheck ok'][k%3]); }
      else if(sub==='build'){ out('[+] Building 2/2'); out(' \u2714 web  Built'); out(' \u2714 db   Built'); ok('servicios construidos.'); }
      else if(sub==='pull'){ ok('imágenes de los servicios descargadas.'); }
      else out("docker compose: '"+sub+"' no reconocido. Usa up | down | ps | logs | build | pull");
    };

    // ---------------- arranque / GRUB / login / rescate ----------------
    let grubState=null, awaitReboot=false, loginUser=null, booting=false;
    const clearBody = () => { [...body.querySelectorAll('.term-out')].forEach(d=>d.remove()); };
    const gline = (txt,color) => { const d=document.createElement('div'); d.className='term-out'; d.style.color=color||'#d8cbad'; d.innerHTML=(esc(txt)===''?'&nbsp;':esc(txt)); body.insertBefore(d,line); };
    const stripLinux = (s) => { s=(s||'').trim(); return s.startsWith('linux') ? s.slice(5).trim() : s; };
    const runSeq = (lines, cb) => {
      booting=true; input.readOnly=true; input.setAttribute('aria-busy','true'); promptEl.textContent=''; input.value=''; input.style.color='';
      let i=0;
      const step=()=>{ if(i>=lines.length){ booting=false; input.readOnly=false; input.removeAttribute('aria-busy'); cb&&cb(); return; } const ln=lines[i++]; const c = ln.startsWith('[  OK  ]')?'#8fa876' : (ln.startsWith('[FAILED]')||ln.startsWith('[ ERROR ]'))?'#ef8a7a' : ln.startsWith('reboot:')?'#a99a86' : '#a2957d'; gline(ln,c); scroll(); setTimeout(step, 70+Math.random()*70); };
      step();
    };
    const runCommandSeq = (lines, cb) => runSeq(lines, ()=>{
      cb&&cb();
      if(!booting&&!grubState&&!awaitReboot&&!interactive&&!pagerState&&!nmtuiState&&!foregroundProcess){ setPrompt(); input.focus(); }
      announce('Comando finalizado. El prompt vuelve a estar disponible.');
      scroll(); save();
    });
    const GRUB_ENTRIES = () => ([
      { title:DISTRO+' ('+KERNEL+')', editable:true, kind:'normal', lines:[
        "setparams '"+DISTRO+' ('+KERNEL+")'", "",
        "        load_video", "        set gfxpayload=keep", "        insmod gzio",
        "        insmod part_gpt", "        insmod xfs", "        set root='hd0,gpt2'",
        "        linux ($root)/vmlinuz-"+KERNEL+" root=/dev/mapper/vg0-root ro rhgb quiet",
        "        initrd ($root)/initramfs-"+KERNEL+".img" ]},
      { title:DISTRO+' rescue ('+KERNEL+')', editable:true, kind:'rescue', lines:[
        "setparams '"+DISTRO+' rescue ('+KERNEL+")'", "",
        "        load_video", "        insmod gzio", "        insmod part_gpt",
        "        insmod xfs", "        set root='hd0,gpt2'",
        "        linux ($root)/vmlinuz-"+KERNEL+" root=/dev/mapper/vg0-root ro rhgb quiet systemd.unit=rescue.target",
        "        initrd ($root)/initramfs-"+KERNEL+"-rescue.img" ]},
      { title:'Ajustes del firmware del sistema (UEFI)', editable:false, kind:'firmware', lines:null }
    ]);
    const startGrub = () => {
      interactive=null; recovery=null; grubState=null; input.style.color=''; loggedIn=false;
      clearBody();
      runSeq(['Se está reiniciando el sistema...','[  OK  ] Removed slice User Slice of root.','[  OK  ] Stopped target Multi-User System.','[  OK  ] Stopped Session 1 of user root.','[  OK  ] Unmounted /home.','[  OK  ] Unmounted /boot.','[  OK  ] Reached target Unmount All Filesystems.','[  OK  ] Reached target Shutdown.','[  OK  ] Reached target Final Step.','reboot: Restarting system','reboot: machine restart','','SeaBIOS (version s2ktux-1.16)','Máquina S2KTUX — POST','Booting from Hard Disk...','GRUB loading...','Welcome to GRUB!',''], ()=>enterGrubMenu());
    };
    const persistBoot = () => {
      const f=getNode(['etc','fstab']); const fst=(f&&f.type==='file')?f.content:'';
      const lines=fst.split(String.fromCharCode(10)).map(function(l){return l.trim();}).filter(function(l){return l && l.charAt(0)!=='#';});
      const inFstab=function(dev,mp){ for(var k=0;k<lines.length;k++){ var c=lines[k].split(/[ \t]+/); if(c[0]===dev||c[1]===mp) return true; } return false; };
      const snap=function(p){ const mn=getNode(norm(p.mount)); if(mn&&mn.type==='dir'){ p.data=JSON.parse(JSON.stringify(mn.children||{})); mn.children={}; } };
      disks.forEach(function(d){ d.parts.forEach(function(p){ if(p.mount && p.mount!=='/boot' && !inFstab('/dev/'+p.name,p.mount)){ snap(p); p.mount=''; } }); });
      lvm.lvs.forEach(function(l){ if(l.mount && l.mount!=='/' && l.mount!=='/home' && l.mount!=='[SWAP]' && !inFstab(lvMapper(l),l.mount)){ snap(l); l.mount=''; } });
      const sc=getNode(['etc','selinux','config']);
      if(sc&&sc.type==='file'){ sc.content.split(String.fromCharCode(10)).forEach(function(l){ l=l.trim(); if(l.indexOf('SELINUX=')===0){ var v=l.slice(8).toLowerCase(); if(v==='enforcing')selinux.mode='Enforcing'; else if(v==='permissive')selinux.mode='Permissive'; else if(v==='disabled')selinux.mode='Disabled'; } }); }
      Object.keys(services).forEach(function(s){ if(services[s]){ if(services[s].active && !services[s].enabled) services[s].active=false; if(services[s].enabled) services[s].active=true; } });
    };
    const beginNewBoot = () => {
      bootHistory.push({id:bootId,start:bootStartedAt,end:Date.now()});
      bootId=Math.random().toString(16).slice(2).padEnd(32,'0').slice(0,32); bootStartedAt=Date.now(); sudoUntil={}; jobs=[];
      const runDir=getNode(['run']); if(runDir&&runDir.type==='dir')runDir.children={lock:dir({}),log:dir({}),user:dir({})};
      processes=defaultProcs(); nextPid=1200;
      Object.keys(services).forEach(s=>{ const svc=services[s]; svc.active=!!svc.enabled; svc.failed=false; svc.error=''; if(svc.active){svc.pid=nextPid++;processes.push({pid:svc.pid,ppid:1,user:'root',cpu:0.1,mem:0.4,vsz:90000,rss:7000,stat:'Ss',start:new Date().toLocaleTimeString().slice(0,5),time:'0:00',cmd:'/usr/sbin/'+s});}else svc.pid=null; });
      containers.forEach(c=>{c.running=['always','unless-stopped','on-failure'].includes(c.restart||''); if(c.running)eventAdd('docker','start','container start',{id:c.id,name:c.name,reason:'restart-policy'});});
      if(MODE==='kubernetes') k8s.pods.forEach(p=>{ if(p.status!=='CrashLoopBackOff'){p.status='Pending';p.ready='0/1';setTimeout(()=>{p.status='Running';p.ready='1/1';k8s.events.push({reason:'Started',object:'pod/'+p.name,message:'Started container '+p.name});eventAdd('kubernetes','reconcile','Pod became Running',{pod:p.name});save();},900);}});
      journalAdd('systemd','Linux boot '+bootId+' started.',6); journalAdd('systemd','Reached target Multi-User System.',6); eventAdd('kernel','boot','System boot completed',{bootId});
    };
    const rebootMachine = () => {
      booting=true; recovery=null; grubState=null; interactive=null; loggedIn=false; clearBody(); promptEl.textContent=''; input.value='';
      const finish=()=>{ persistBoot(); beginNewBoot(); if(MODE==='linux') applyFstabAtBoot(()=>startLogin()); else { loggedIn=true; currentUser='root'; cwd=['root']; loginRecords.push({user:'root',tty:'tty1',host:'',login:Date.now(),active:true}); out(OS_NAME+' ('+INITIAL_HOST+')','#8fa876'); out('Last login: '+new Date().toString().slice(0,24)+' on tty1','#a2957d'); out(''); setPrompt(); save(); } };
      runSeq(['','Se está reiniciando el sistema...','[  OK  ] Stopped target Multi-User System.','[  OK  ] Unmounted /home.','[  OK  ] Reached target Shutdown.','reboot: Restarting system','','SeaBIOS (version s2ktux-1.16)','Booting from Hard Disk...','Cargando '+OS_NAME+'...','[  OK  ] Reached target Local File Systems.','[  OK  ] Reached target Multi-User System.',''], finish);
    };
    const bootStart = () => startGrub();
    const enterGrubMenu = () => {
      grubState={ phase:'menu', entrySel:0, sel:0, entries:GRUB_ENTRIES(), lines:null, orig:null, kind:null, count:5 };
      if(titleEl) titleEl.textContent='GNU GRUB'; input.value=''; input.style.color='';
      redrawGrub();
      grubState.timer=setInterval(()=>{ if(!grubState||grubState.phase!=='menu'){ return; } grubState.count--; if(grubState.count<=0){ clearInterval(grubState.timer); const en=grubState.entries[0]; grubState=null; bootFromLines(en.lines.slice(), en); } else redrawGrub(); }, 1000);
    };
    const redrawGrub = () => {
      clearBody(); const g=grubState;
      if(g.phase==='menu'){
        gline('                      GNU GRUB  versión 2.06','#8fa876'); gline('');
        gline('  ┌────────────────────────────────────────────────────────────┐','#8fa876');
        g.entries.forEach((e,i)=>{ const on=i===g.entrySel; gline('  │ '+(on?'▶ ':'  ')+e.title.padEnd(56)+' │', on?'#e9ddc7':'#a99a86'); });
        for(let kk=g.entries.length;kk<5;kk++) gline('  │'+' '.repeat(60)+'│','#a99a86');
        gline('  └────────────────────────────────────────────────────────────┘','#8fa876'); gline('');
        gline("   Usa las teclas ↑ y ↓ para seleccionar y Enter para arrancar.",'#a2957d');
        gline("   Pulsa  e  para editar los comandos de la entrada seleccionada.",'#a2957d');
        if(g.count>0) gline('   El sistema arrancará automáticamente en '+g.count+'s...','#e0a458');
      } else {
        gline('  GNU GRUB  versión 2.06','#8fa876'); gline('');
        g.lines.forEach((l,i)=>{ if(i===g.sel){ const d=document.createElement('div'); d.className='term-out'; d.style.color='#e9ddc7'; d.innerHTML=(esc(l)||'')+'<span style="animation:blink 1s step-start infinite;color:#e0a458">█</span>'; body.insertBefore(d,line); } else gline(l,'#a99a86'); });
        for(let kk=g.lines.length;kk<12;kk++) gline('');
        gline('   Ctrl-X arranca   ·   Retroceso borra   ·   Esc vuelve al menú','#a2957d');
      }
      scroll();
    };
    const grubError = (msg) => { clearBody(); outMany(['',msg,''],'#ef8a7a'); gline('   Pulsa una tecla para volver...','#a2957d'); booting=true; setTimeout(()=>{ booting=false; enterGrubMenu(); }, 1600); };
    const kernelPanic = (params) => {
      clearBody();
      runSeq(['[    0.000000] Linux version '+KERNEL,'[    0.000000] Kernel command line: '+params,'[    2.104512] VFS: Cannot open root device or unknown-block(0,0)','[    2.104513] Please append a correct "root=" boot option','[ ERROR ] Kernel panic - not syncing: VFS: Unable to mount root fs on unknown-block(0,0)','[    2.104514] ---[ end Kernel panic - not syncing ]---'], ()=>{ outMany(['','No se pudo arrancar: la línea "linux" quedó mal.','','--- Pulsa Enter para reiniciar ---']); awaitReboot=true; promptEl.textContent=''; scroll(); });
    };
    const bootUnknownParam = (extra) => {
      clearBody();
      runSeq(['[    0.000000] Kernel command line: root=/dev/mapper/vg0-root ro rhgb quiet '+extra,'[    5.402100] dracut-initqueue[812]: Warning: parámetro de arranque no reconocido: '+extra,'[  120.51] dracut-initqueue[812]: Warning: Could not boot.','[ ERROR ] dracut: FATAL: Dropping to emergency shell. No se pudo continuar.'], ()=>{ outMany(['','El arranque ha fallado por un parámetro inválido.','','--- Pulsa Enter para reiniciar ---']); awaitReboot=true; promptEl.textContent=''; scroll(); });
    };
    const bootFromLines = (lines, en, orig) => {
      booting=false;
      const findLinux = arr => arr.find(l=>l.trim().startsWith('linux '));
      const lx = findLinux(lines);
      if(!lx){ grubError('error: you need to load the kernel first.'); return; }
      const base = orig || en.lines || lines;
      const origLinux = findLinux(base) || '';
      let otherChanged=false;
      for(let i=0;i<lines.length;i++){ const cur=lines[i].trim(); const ref=(base[i]||'').trim(); if(cur!==ref && !cur.startsWith('linux ')){ otherChanged=true; break; } }
      if(otherChanged){ kernelPanic('(configuración de arranque alterada)'); return; }
      const cur=lx.trim(), o=origLinux.trim();
      if(!cur.includes('root=/dev/mapper/vg0-root')){ kernelPanic(stripLinux(cur)); return; }
      if(!cur.startsWith(o)){ kernelPanic(stripLinux(cur)); return; }
      const extra = cur.slice(o.length).trim();
      if(extra===''){ booted(en.kind, null); return; }
      if(extra==='rd.break'){ booted(en.kind, 'rdbreak'); return; }
      if(extra==='init=/bin/bash'){ booted(en.kind, 'initbash'); return; }
      bootUnknownParam(extra);
    };
    const grubKey = (e) => {
      const g=grubState;
      if(g.timer){ clearInterval(g.timer); g.timer=null; g.count=0; if(g.phase==='menu') redrawGrub(); }
      if(g.phase==='menu'){
        if(e.key==='ArrowUp'){ e.preventDefault(); g.entrySel=(g.entrySel+g.entries.length-1)%g.entries.length; redrawGrub(); }
        else if(e.key==='ArrowDown'){ e.preventDefault(); g.entrySel=(g.entrySel+1)%g.entries.length; redrawGrub(); }
        else if(e.key==='e'||e.key==='E'){ e.preventDefault(); const en=g.entries[g.entrySel]; if(!en.editable){ return; } g.orig=en.lines.slice(); g.lines=en.lines.slice(); g.kind=en.kind; g.sel=0; g.phase='edit'; redrawGrub(); }
        else if(e.key==='Enter'){ e.preventDefault(); const en=g.entries[g.entrySel]; grubState=null; if(en.kind==='firmware'){ bootFirmware(); return; } bootFromLines(en.lines.slice(), en); }
        else e.preventDefault();
        return;
      }
      if(e.key==='ArrowUp'){ e.preventDefault(); g.sel=Math.max(0,g.sel-1); redrawGrub(); }
      else if(e.key==='ArrowDown'){ e.preventDefault(); g.sel=Math.min(g.lines.length-1,g.sel+1); redrawGrub(); }
      else if(e.key==='Backspace'){ e.preventDefault(); g.lines[g.sel]=g.lines[g.sel].slice(0,-1); redrawGrub(); }
      else if((e.ctrlKey && (e.key==='x'||e.key==='X'))||e.key==='F10'){ e.preventDefault(); const lines=g.lines.slice(), orig=g.orig.slice(), kind=g.kind; grubState=null; bootFromLines(lines, {kind}, orig); }
      else if(e.key==='Escape'){ e.preventDefault(); g.phase='menu'; redrawGrub(); }
      else if(e.key.length===1 && !e.ctrlKey && !e.metaKey && !e.altKey){ e.preventDefault(); g.lines[g.sel]+=e.key; redrawGrub(); }
      else e.preventDefault();
    };
    const bootFirmware = () => { clearBody(); runSeq(['Entrando en la configuración del firmware (UEFI)...','(no disponible en el sandbox)','','Reiniciando...',''], ()=>enterGrubMenu()); };
    const booted = (entryKind, recoveryKind) => {
      clearBody();
      const kern=['Cargando el kernel de Linux '+KERNEL+'...','Cargando el disco RAM inicial...','[    0.000000] Linux version '+KERNEL,'[    1.204100] Freeing unused kernel image memory','[  OK  ] Started udev Kernel Device Manager.',''];
      if(recoveryKind){ runSeq(kern, ()=>bootEmergency(recoveryKind)); return; }
      if(entryKind==='rescue'){ runSeq(kern.concat(['[  OK  ] Reached target Rescue Mode.','']), ()=>rescueMaintenance()); return; }
      runSeq(kern.concat(['[  OK  ] Reached target Local File Systems.','[  OK  ] Started Login Service.','[  OK  ] Reached target Multi-User System.','']), ()=>{ applyFstabAtBoot(()=>startLogin()); });
    };
    const rescueMaintenance = () => {
      interactive=null;
      outMany(['You are in rescue mode. After logging in, type "journalctl -xb" to view','system logs, "systemctl reboot" to reboot, or "exit" to boot into default mode.','']);
      const ask=()=>startInteractive('Give root password for maintenance (or press Enter to continue):', true, (pw)=>{ endInteractive(); if(!pw){ applyFstabAtBoot(()=>startLogin()); return; } if(pw===users.root.password){ out(''); doLogin(); } else { out('Login incorrect.','#ef8a7a'); ask(); } });
      ask();
    };
    const setRecoveryPrompt = () => { const p = recovery.kind==='rdbreak' ? (recovery.chrooted?'sh-5.1# ':'switch_root:/# ') : 'bash-5.1# '; promptEl.textContent=p; promptEl.style.color='#e08a2e'; if(titleEl) titleEl.textContent='emergency shell'; };
    const bootEmergency = (kind) => {
      interactive=null;
      if(kind==='rdbreak'){ outMany(['','Generando "/run/initramfs/rdsosreport.txt"','','Entrando en el shell de emergencia. El sistema real está montado en /sysroot','en modo SOLO LECTURA.','Escribe  help  para ver los pasos.','']); recovery={kind:'rdbreak', rw:false, chrooted:false, relabel:false, pw:false}; }
      else { outMany(['','Kernel arrancado con init=/bin/bash: shell de root, sin servicios.','La raíz "/" está montada en SOLO LECTURA.','Escribe  help  para ver los pasos.','']); recovery={kind:'initbash', rw:false, chrooted:true, relabel:false, pw:false}; }
      currentUser='root'; setRecoveryPrompt();
    };
    const bootFinish = () => { const rel=recovery && recovery.relabel; if(rel) shadowMislabeled=false; recovery=null; clearBody(); const seq=['','Reiniciando el sistema...','[  OK  ] Reached target Shutdown.','reboot: Restarting system']; if(rel){ seq.push('*** Warning -- SELinux targeted policy relabel is required. ***'); seq.push('*** Relabeling could take a very long time. ***'); seq.push('[####################] reetiquetado completado.'); } seq.push(''); runSeq(seq, ()=>applyFstabAtBoot(()=>startLogin())); };
    const recoveryDispatch = (cmd, name, args) => {
      const r=recovery;
      const target = r.kind==='rdbreak' ? '/sysroot' : '/';
      if(name==='mount'){ if(cmd.includes('remount') && cmd.includes('rw')){ if(cmd.includes(target)){ r.rw=true; ok(target+' remontado en modo lectura/escritura.'); } else { out('mount: remonta el objetivo correcto:  mount -o remount,rw '+target); } } else { out('En el rescate:  mount -o remount,rw '+target,'#a2957d'); } return; }
      if(name==='chroot'){ if(r.kind!=='rdbreak'){ out('chroot: no hace falta con init=/bin/bash (ya estás en el sistema real).','#a2957d'); return; } if(!r.rw){ err('chroot: primero remonta /sysroot en lectura/escritura.'); return; } if(args[0] && args[0].includes('sysroot')){ r.chrooted=true; setRecoveryPrompt(); ok('chroot a /sysroot: ahora estás dentro del sistema real.'); } else { out('chroot: uso:  chroot /sysroot'); } return; }
      if(name==='passwd'){ if(r.kind==='rdbreak' && !r.chrooted){ err('passwd: orden no encontrada (primero  chroot /sysroot).'); return; } if(!r.rw){ err('passwd: Authentication token manipulation error (sistema de solo lectura; remonta con rw primero).'); return; } startInteractive('Nueva contraseña de root: ', true, (p1)=>{ if(!p1){ endInteractive(); err('passwd: sin cambios.'); return; } startInteractive('Vuelve a escribirla: ', true, (p2)=>{ endInteractive(); if(p1!==p2){ err('passwd: las contraseñas no coinciden.'); return; } users.root.password=p1; r.pw=true; rootRecovered=true; shadowMislabeled=true; ok('passwd: contraseña de root actualizada correctamente.'); if(selinux.mode==='Enforcing') out('AVISO: has escrito /etc/shadow desde el rescate; su contexto SELinux quedará mal. Ejecuta  touch /.autorelabel  antes de reiniciar o no podrás entrar.','#e0a458'); save(); }); }); return; }
      if(name==='touch'){ if(cmd.includes('autorelabel')){ r.relabel=true; ok('creado /.autorelabel (SELinux se reetiquetará en el próximo arranque).'); } else { ok(''); } return; }
      if(name==='ls'){ out('bin  boot  dev  etc  home  proc  root  run  sys  sysroot  usr  var'); return; }
      if(name==='pwd'){ out('/'); return; }
      if(name==='cat'||name==='vi'||name==='nano'){ out('('+name+' no disponible en el shell de emergencia)','#a2957d'); return; }
      if(name==='help'){ outMany(['Shell de emergencia — pasos para recuperar la contraseña de root:', r.kind==='rdbreak' ? '  1) mount -o remount,rw /sysroot' : '  1) mount -o remount,rw /', r.kind==='rdbreak' ? '  2) chroot /sysroot' : '  2) (no hace falta chroot con init=/bin/bash)', '  3) passwd', '  4) touch /.autorelabel', '  5) exit'+(r.kind==='rdbreak'?' dos veces (sales del chroot y reinicias)':'  o  reboot')],'#a2957d'); return; }
      if(name==='exit'||name==='logout'){ if(r.kind==='rdbreak' && r.chrooted){ r.chrooted=false; setRecoveryPrompt(); out('(has salido del chroot)','#a2957d'); return; } bootFinish(); return; }
      if(name==='reboot'||name==='poweroff'||cmd.trim()==='exec /sbin/init'){ bootFinish(); return; }
      err(name+': orden no disponible aquí. Solo  mount, chroot, passwd, touch, exit/reboot. Escribe  help.');
    };
    const applyFstabAtBoot = (cb) => {
      const f=getNode(['etc','fstab']); if(!f){ cb(); return; }
      const rows=f.content.split('\n').map(l=>l.trim()).filter(l=>l && !l.startsWith('#'));
      let bad=null;
      rows.forEach(l=>{ const p=l.split(/\s+/); const dev=p[0], mp=p[1]; if(!dev||!mp||mp==='swap'||mp==='none') return; if(dev.startsWith('/dev/sdb')){ const nm=dev.replace('/dev/',''); let found=null; disks.forEach(d=>d.parts.forEach(pt=>{ if(pt.name===nm) found=pt; })); if(found && found.fstype){ if(!getNode(mp.split('/').filter(Boolean))){ const seg=mp.split('/').filter(Boolean); const par=getNode(seg.slice(0,-1)); if(par&&par.type==='dir') par.children[seg[seg.length-1]]=dir({},{owner:'root'}); } found.mount=mp; } else { bad=dev; } } });
      if(bad){ outMany(['[FAILED] Failed to mount '+bad+'.','[DEPEND] Dependency failed for Local File Systems.','','Estás en modo de emergencia. El montaje de /etc/fstab ha fallado.','Da la contraseña de root para mantenimiento (o pulsa Enter para continuar):']); interactive=null; startInteractive('', true, (pw)=>{ endInteractive(); if(!pw){ cb(); return; } if(pw===users.root.password){ out('Corrige /etc/fstab (por ejemplo con  vi /etc/fstab ) y reinicia con  reboot.','#a2957d'); doLogin(); } else { out('Login incorrect.','#ef8a7a'); applyFstabAtBoot(cb); } }); return; }
      cb();
    };
    const showWelcome = () => { out(OS_NAME+' — entorno de práctica '+(CERTIFICATION||'Linux'),'#8fa876'); out("FS raíz montado. 'help' para comandos · 'man <comando>' para la ayuda de uno · el cheatsheet y las prácticas están abajo.",'#a2957d'); out(''); };
    const doLogin = () => { clearBody(); currentUser='root'; cwd=['root']; loggedIn=true; loginUser=null; grubState=null; recovery=null; interactive=null; input.style.color='';loginRecords.push({user:'root',tty:'tty1',host:'',login:Date.now(),active:true});secureLog('login: pam_unix(login:session): session opened for user root',5);out('Last login: '+new Date().toString().slice(0,24)+' on tty1','#a2957d'); showWelcome(); setPrompt(); save(); };
    const startLogin = () => {
      loggedIn=false; recovery=null; grubState=null; awaitReboot=false; interactive=null; input.style.color='';
      clearBody();
      outMany([OS_NAME+'  (kernel '+KERNEL+')'+(CERTIFICATION?' · '+CERTIFICATION:''),'','']);
      out('# Sesión bloqueada. Entra como  root  con tu contraseña.','#6f6250');
      out('# ¿No la conoces? Pulsa el botón «Reiniciar → GRUB» de abajo (o escribe  reboot  aquí) para recuperarla.','#6f6250');
      out('');
      const askUser=()=>{const hn=stateNode(['etc','hostname']);startInteractive(((hn&&hn.content)||INITIAL_HOST).trim()+' login:', false, onUser, '#8fa876');};
      const onUser=(v)=>{ const u=(v||'').trim(); if(u==='reboot'||u==='reiniciar'){ endInteractive(); startGrub(); return; } loginUser = u || 'root'; startInteractive('Password:', true, onPass, '#8fa876'); };
      const onPass=(v)=>{ endInteractive();
        if(loginUser==='root' && v===users.root.password){
          if(shadowMislabeled && selinux.mode==='Enforcing'){ out('Login incorrect','#ef8a7a'); out('# SELinux: el contexto de /etc/shadow es incorrecto y la autenticación falla aunque la contraseña sea válida.','#6f6250'); out('# Arranca de nuevo en rescate y ejecuta  touch /.autorelabel  (o pon SELinux en Permissive).','#6f6250'); out(''); askUser(); return; }
          doLogin();
          if(shadowMislabeled) out('AVISO: /etc/shadow tiene un contexto SELinux incorrecto; has entrado solo porque SELinux no está en Enforcing. Corrígelo con  restorecon /etc/shadow  y  touch /.autorelabel.','#e0a458');
        } else { out('Login incorrect','#ef8a7a');secureLog('login: FAILED LOGIN 1 FROM tty1 FOR '+(loginUser||'UNKNOWN'),4);out(''); askUser(); }
      };
      askUser();
    };

    // ---------------- sesión remota en hosts del laboratorio ----------------
    const enterRemote = (host, user) => {
      const h = labHosts[host];
      remoteHost = { name:host, user, role:h.role, host:h, cwd:(user==='root'?'/root':'/home/'+user) };
      loginRecords.push({user,tty:'pts/1',host,login:Date.now(),active:true,remote:true});secureLog('sshd: pam_unix(sshd:session): session opened for user '+user,5);
      out('Welcome to S2KTUX Lab · '+host+'  ('+(h.role==='web'?'servidor web':h.role==='db'?'base de datos':'nodo')+')','#8fa876');
      out('Last login: '+new Date().toString().slice(0,24)+' from 192.168.1.50','#a2957d');
      out("Escribe 'help' para ver qué puedes hacer aquí · 'exit' para volver a tu máquina.",'#a2957d');
      setPrompt(); save();
    };
    const rHome = () => remoteHost.user==='root'?'/root':'/home/'+remoteHost.user;
    const rNorm = (p) => { p=p||''; let base; if(p.startsWith('/')) base=[]; else if(p==='~'||p.startsWith('~/')){ base=rHome().split('/').filter(Boolean); p=p.slice(1); } else base=remoteHost.cwd.split('/').filter(Boolean); for(const s of p.split('/')){ if(s===''||s==='.') continue; if(s==='..'){ base.pop(); } else base.push(s); } return '/'+base.join('/'); };
    const rDirs = () => { const set=new Set(['/','/home','/home/'+remoteHost.user,'/root','/etc','/var','/var/www','/var/www/html','/tmp','/usr','/usr/bin']); Object.keys(remoteHost.host.files).forEach(p=>{ const parts=p.split('/'); for(let i=1;i<parts.length;i++){ set.add('/'+parts.slice(1,i).join('/')); } }); return set; };
    const sqlGrid = (cols, rows) => {
      const w = cols.map((c,i)=>Math.max(String(c).length, ...rows.map(r=>String(r[i]==null?'NULL':r[i]).length)));
      const sep = '+'+w.map(x=>'-'.repeat(x+2)).join('+')+'+';
      out(sep); out('| '+cols.map((c,i)=>String(c).padEnd(w[i])).join(' | ')+' |'); out(sep);
      rows.forEach(r=> out('| '+r.map((v,i)=>String(v==null?'NULL':v).padEnd(w[i])).join(' | ')+' |'));
      out(sep); out(rows.length+' row'+(rows.length===1?'':'s')+' in set (0.001 sec)','#a2957d');
    };
    const sqlRun = (stmt) => {
      const db = remoteHost.host.db; const s = stmt.trim().replace(/;$/,''); if(!s) return; const up=s.toUpperCase(); let m;
      if(up==='SHOW DATABASES'){ sqlGrid(['Database'], Object.keys(db.dbs).map(d=>[d])); return; }
      if((m=s.match(/^CREATE\s+DATABASE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)$/i))){ if(db.dbs[m[1]]){ out("ERROR 1007 (HY000): No se puede crear la base '"+m[1]+"'; ya existe",'#ef8a7a'); return; } db.dbs[m[1]]={}; out('Query OK, 1 row affected (0.002 sec)','#a2957d'); return; }
      if((m=s.match(/^DROP\s+DATABASE\s+(?:IF\s+EXISTS\s+)?(\w+)$/i))){ if(!db.dbs[m[1]]){ out("ERROR 1008 (HY000): No se puede borrar '"+m[1]+"'; no existe",'#ef8a7a'); return; } delete db.dbs[m[1]]; if(db.cur===m[1])db.cur=null; out('Query OK, 0 rows affected (0.003 sec)','#a2957d'); return; }
      if((m=s.match(/^USE\s+(\w+)$/i))){ if(!db.dbs[m[1]]){ out("ERROR 1049 (42000): Unknown database '"+m[1]+"'",'#ef8a7a'); return; } db.cur=m[1]; out('Database changed'); return; }
      if(up==='SELECT VERSION()'){ sqlGrid(['version()'],[['11.4.2-MariaDB']]); return; }
      if(up==='SHOW TABLES'){ if(!db.cur){ out('ERROR 1046 (3D000): No database selected','#ef8a7a'); return; } sqlGrid(['Tables_in_'+db.cur], Object.keys(db.dbs[db.cur]).map(tb=>[tb])); return; }
      if((m=s.match(/^DESC(?:RIBE)?\s+(\w+)$/i))){ if(!db.cur||!db.dbs[db.cur][m[1]]){ out('ERROR 1146 (42S02): Table does not exist','#ef8a7a'); return; } sqlGrid(['Field','Type'], db.dbs[db.cur][m[1]].cols.map(c=>[c,'varchar(64)'])); return; }
      if((m=s.match(/^CREATE\s+TABLE\s+(\w+)\s*\((.+)\)$/i))){ if(!db.cur){ out('ERROR 1046 (3D000): No database selected','#ef8a7a'); return; } const cols=m[2].split(',').map(c=>c.trim().split(/\s+/)[0]); db.dbs[db.cur][m[1]]={cols, rows:[]}; out('Query OK, 0 rows affected (0.01 sec)','#a2957d'); return; }
      if((m=s.match(/^INSERT\s+INTO\s+(\w+)\s*(?:\(([^)]+)\))?\s*VALUES?\s*\((.+)\)$/i))){ if(!db.cur||!db.dbs[db.cur][m[1]]){ out("ERROR 1146 (42S02): Table '"+m[1]+"' does not exist",'#ef8a7a'); return; } const tb=db.dbs[db.cur][m[1]]; const vals=m[3].split(',').map(v=>{ v=v.trim().replace(/^['"]|['"]$/g,''); return /^\d+(\.\d+)?$/.test(v)?Number(v):v; }); tb.rows.push(vals); out('Query OK, 1 row affected (0.002 sec)','#a2957d'); return; }
      if((m=s.match(/^SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(\w+)\s*=\s*['"]?([^'"]+)['"]?)?$/i))){ if(!db.cur||!db.dbs[db.cur][m[2]]){ out("ERROR 1146 (42S02): Table '"+m[2]+"' does not exist",'#ef8a7a'); return; } const tb=db.dbs[db.cur][m[2]]; let cols = m[1].trim()==='*'?tb.cols:m[1].split(',').map(x=>x.trim()); let rows=tb.rows.map(r=>r); if(m[3]){ const ci=tb.cols.indexOf(m[3]); rows=rows.filter(r=>String(r[ci])===m[4]); } const idx=cols.map(c=>tb.cols.indexOf(c)); sqlGrid(cols, rows.map(r=>idx.map(i=>r[i]))); return; }
      if((m=s.match(/^DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(\w+)\s*=\s*['"]?([^'"]+)['"]?)?$/i))){ if(!db.cur||!db.dbs[db.cur][m[1]]){ out('ERROR 1146 (42S02): Table does not exist','#ef8a7a'); return; } const tb=db.dbs[db.cur][m[1]]; const before=tb.rows.length; if(m[2]){ const ci=tb.cols.indexOf(m[2]); tb.rows=tb.rows.filter(r=>String(r[ci])!==m[3]); } else tb.rows=[]; out('Query OK, '+(before-tb.rows.length)+' rows affected (0.002 sec)','#a2957d'); return; }
      if(up==='SHOW GRANTS'||up.indexOf('GRANT')===0||up.indexOf('CREATE USER')===0||up.indexOf('FLUSH')===0){ out('Query OK, 0 rows affected (0.001 sec)','#a2957d'); return; }
      if(up==='HELP'||s==='\\h'){ out('List of MariaDB commands: SHOW DATABASES; USE db; SHOW TABLES; SELECT ...; \\q para salir.','#a2957d'); return; }
      out("ERROR 1064 (42000): You have an error in your SQL syntax near '"+s.slice(0,24)+"'",'#ef8a7a');
    };
    const sqlShell = () => {
      const db=remoteHost.host.db;
      const loop=()=>startInteractive('MariaDB ['+(db.cur||'(none)')+']> ', false, (lineIn)=>{ endInteractive(); const line=(lineIn||'').trim(); if(/^(exit|quit|\\q)\s*;?$/i.test(line)){ out('Bye'); return; } if(!line){ loop(); return; } line.split(';').map(x=>x.trim()).filter(Boolean).forEach(sqlRun); loop(); });
      out('Welcome to the MariaDB monitor.  Commands end with ; or \\g.'); out('Server version: 11.4.2-MariaDB','#a2957d'); out(''); loop();
    };
    const remoteDispatch = (cmd, name, args) => {
      const h=remoteHost.host; const rest=args.filter(a=>!a.startsWith('-'));
      switch(name){
        case 'exit': case 'logout': {const closed=remoteHost.name;out('logout');out('Connection to '+closed+' closed.','#a2957d');loginRecords.filter(r=>r.active&&r.remote&&r.host===closed).forEach(r=>{r.active=false;r.logout=Date.now();});secureLog('sshd: pam_unix(sshd:session): session closed for user '+remoteHost.user,5);remoteHost=null;setPrompt();save();return;}
        case 'clear': [...body.querySelectorAll('.term-out')].forEach(d=>d.remove()); return;
        case 'help': outMany(['En '+remoteHost.name+' puedes usar: hostname whoami id pwd ls cd cat uname uptime date echo','systemctl <status|start|stop> <servicio>   ss -tlnp   ping <host>', remoteHost.role==='web'?'curl localhost   (sirve /var/www/html/index.html)':remoteHost.role==='db'?'mysql -u root -p   (abre el monitor de MariaDB, contraseña alumno)':'kubectl (próximamente), nodo listo para Ansible','exit para volver a tu máquina.'],'#a2957d'); return;
        case 'hostname': out(remoteHost.name); return;
        case 'whoami': out(remoteHost.user); return;
        case 'id': out('uid='+(remoteHost.user==='root'?0:1000)+'('+remoteHost.user+') gid='+(remoteHost.user==='root'?0:1000)+'('+remoteHost.user+')'); return;
        case 'pwd': out(remoteHost.cwd); return;
        case 'uname': out(args.includes('-a')?('Linux '+remoteHost.name+' '+KERNEL+' #1 SMP PREEMPT_DYNAMIC '+ARCH+' GNU/Linux'):args.includes('-r')?KERNEL:args.includes('-m')?ARCH:args.includes('-n')?remoteHost.name:'Linux'); return;
        case 'uptime': out(' '+new Date().toLocaleTimeString()+'  up 5 days,  1 user,  load average: 0.01, 0.02, 0.00'); return;
        case 'date': out(new Date().toString()); return;
        case 'echo': out(cmd.slice(4).trim().replace(/^"([\s\S]*)"$/,'$1')); return;
        case 'cd': { const p=rest[0]||rHome(); const np=rNorm(p)||'/'; if(rDirs().has(np)){ remoteHost.cwd=np;setPrompt(); } else { err('-bash: cd: '+p+': No existe el fichero o el directorio'); } return; }
        case 'ls': { const base=rNorm(rest[0]||'.')||'/'; const kids=new Set(); rDirs().forEach(d=>{ if(d!==base && (base==='/'?(d.lastIndexOf('/')===0&&d!=='/'):d.indexOf(base+'/')===0)){ const r=d.slice(base==='/'?1:base.length+1); if(r&&r.indexOf('/')===-1) kids.add(r+'/'); } }); Object.keys(h.files).forEach(f=>{ const dir=f.slice(0,f.lastIndexOf('/'))||'/'; if(dir===base) kids.add(f.split('/').pop()); }); const arr=[...kids].sort(); if(arr.length) out(arr.join('   ')); return; }
        case 'cat': { const p=rNorm(rest[0]||''); const c=h.files[p]; if(c==null){ err('cat: '+(rest[0]||'')+': No existe el fichero o el directorio'); } else c.split('\n').forEach(l=>out(l)); return; }
        case 'systemctl': { const sub=rest[0]; const svc=(rest[1]||'').replace('.service',''); if(['start','stop','restart','enable','disable'].includes(sub)&&remoteHost.user!=='root'){err('Failed to '+sub+' '+svc+'.service: Access denied');return;}if(sub==='status'){ const s=h.services[svc]; if(!s){ err('Unit '+svc+'.service could not be found.'); return; } out('● '+svc+'.service', s.active?'#8fa876':undefined); out('   Active: '+(s.active?'active (running)':'inactive (dead)'), s.active?'#8fa876':'#a2957d'); if(!s.active&&svc==='kubelet')out('   Error: failed to update node lease; connection timed out','#ef8a7a'); } else if(sub==='start'){ if(h.services[svc])h.services[svc].active=true; ok(''); } else if(sub==='stop'){ if(h.services[svc])h.services[svc].active=false; ok(''); } else if(sub==='restart'||sub==='enable'||sub==='disable'){ if(h.services[svc])h.services[svc].active=sub!=='disable'; if(MODE==='kubernetes'&&remoteHost.name==='worker-2'&&svc==='kubelet'&&sub==='restart'){const n=k8s.nodes.find(x=>x.name==='worker-2');if(n)n.status='Ready';k8s.events=k8s.events.filter(e=>e.reason!=='NodeNotReady');if(!k8s.actions.includes('restart-kubelet'))k8s.actions.push('restart-kubelet');out('Job for kubelet.service restarted successfully.');}else ok(''); } else out('systemctl: usa status/start/stop <servicio>'); return; }
        case 'ss': { out('State   Recv-Q  Send-Q  Local Address:Port'); (h.ports||[]).forEach(p=>out('LISTEN  0       128     0.0.0.0:'+p)); return; }
        case 'ping': { streamPing(rest[0]||remoteHost.name); return; }
        case 'curl': { if(remoteHost.role!=='web'){ err('curl: (7) Failed to connect'); return; } const u=(rest[0]||'localhost'); if(/localhost|127\.0\.0\.1|web1|:80/.test(u)){ const idx=h.files['/var/www/html/index.html']; if(idx!=null) idx.split('\n').forEach(l=>out(l)); else err('curl: (7) empty reply from server'); } else err('curl: (6) Could not resolve host: '+u); return; }
        case 'mysql': case 'mariadb': { if(remoteHost.role!=='db'){ err(name+': orden no encontrada'); return; } sqlShell(); return; }
        case 'kubectl': { if(remoteHost.role==='node'){ out('kubectl: el clúster de Kubernetes llegará próximamente a node1.','#e0a458'); } else err('kubectl: orden no encontrada'); return; }
        case 'vi': case 'nano': out('('+name+' no disponible en esta demo remota; usa cat para ver ficheros)','#a2957d'); return;
        case 'sudo': {if(!args.length){out('usage: sudo <command>');return;}const inner=args.join(' '),innerName=args[0],innerArgs=args.slice(1);if(remoteHost.user==='root'){remoteDispatch(inner,innerName,innerArgs);return;}const loginUser=remoteHost.user;startInteractive('[sudo] password for '+loginUser+':',true,pw=>{endInteractive();if(pw!==h.pass){err('Sorry, try again.');return;}remoteHost.user='root';remoteDispatch(inner,innerName,innerArgs);remoteHost.user=loginUser;setPrompt();save();});return;}
        default: err('-bash: '+name+': orden no encontrada'); return;
      }
    };

    const enterContainerShell=(name,image,kind)=>{containerShell={name,image:image||'linux',kind:kind||'docker',cwd:'/'};out('root@'+name+':/#','#8fa876');setPrompt();};
    const containerDispatch=(cmd,name,args)=>{const c=containerShell;if(name==='exit'||name==='logout'){out('exit');containerShell=null;setPrompt();return;}if(name==='pwd'){out(c.cwd);return;}if(name==='cd'){let p=args[0]||'/root';if(p==='..')p=c.cwd.replace(/\/[^/]+\/?$/,'')||'/';else if(!p.startsWith('/'))p=(c.cwd==='/'?'/':c.cwd+'/')+p;c.cwd=p.replace(/\/+/g,'/');setPrompt();return;}if(name==='whoami'){out('root');return;}if(name==='hostname'){out(c.name);return;}if(name==='id'){out('uid=0(root) gid=0(root) groups=0(root)');return;}if(name==='uname'){out(args.includes('-a')?'Linux '+c.name+' '+KERNEL+' #1 SMP '+ARCH+' GNU/Linux':args.includes('-r')?KERNEL:args.includes('-m')?ARCH:args.includes('-n')?c.name:'Linux');return;}if(name==='env'||name==='printenv'){outMany(['HOSTNAME='+c.name,'HOME=/root','PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin','PWD='+c.cwd]);return;}if(name==='ps'){outMany(['PID   USER     TIME  COMMAND','    1 root      0:00 '+(c.kind==='kubernetes'?'/pause':'/bin/sh'),'   12 root      0:00 sh','   19 root      0:00 ps']);return;}if(name==='ls'){out(c.cwd==='/'?'bin  dev  etc  home  proc  root  run  tmp  usr  var':c.cwd==='/etc'?'hosts  hostname  os-release  resolv.conf':'');return;}if(name==='cat'){const f=args[0]||'';if(f==='/etc/os-release')outMany(['NAME="'+DISTRO+'"','VERSION="'+RELEASE+(CODENAME?' ('+CODENAME+')':'')+'"','ID="'+OS_ID+'"','PRETTY_NAME="'+OS_NAME+'"']);else if(f==='/etc/hostname')out(c.name);else if(f==='/etc/hosts')outMany(['127.0.0.1 localhost','10.244.1.10 '+c.name]);else err('cat: '+f+': No such file or directory');return;}if(name==='echo'){out(args.join(' '));return;}if(name==='clear'){clearBody();return;}err('sh: '+name+': not found',127);};

    // ---------------- dispatch ----------------
    let tokenQuoted=[];
    const tokenize = (str) => { const o=[]; tokenQuoted=[]; let cur='', q='', had=false,quoted=false; for(let i=0;i<str.length;i++){ const c=str[i]; if(c==='\\'&&q!=="'"){ if(i+1<str.length){const nx=str[i+1];if(q==='"'&&!['$','`','"','\\','\n'].includes(nx)){cur+='\\';had=true;}else{cur+=nx;i++;had=true;}} continue; } if(q){ if(c===q){ q=''; quoted=true; } else cur+=c; } else if(c==='"'||c==="'"){ q=c; had=true; quoted=true; } else if(/\s/.test(c)){ if(cur!==''||had){ o.push(cur); tokenQuoted.push(quoted); cur=''; had=false; quoted=false; } } else cur+=c; } if(cur!==''||had){o.push(cur);tokenQuoted.push(quoted);} return o; };
    const shellEnv=()=>({USER:currentUser,LOGNAME:currentUser,HOME:users[currentUser]?.home||'/root',SHELL:'/bin/bash',TERM:'xterm-256color',COLORTERM:'truecolor',COLUMNS:String(Math.max(40,Math.floor(body.clientWidth/10))),LINES:String(Math.max(12,Math.floor(body.clientHeight/24))),PWD:'/'+cwd.join('/'),OLDPWD:shellVars.OLDPWD||'',HOSTNAME:localHostname(),UID:String(users[currentUser]?.uid??0),HISTFILE:(users[currentUser]?.home||'/root')+'/.bash_history',...shellVars});
    const captureCommand=(text)=>{ const oldCap=cap,oldErr=errCap,oldEvents=ioEvents; cap=[];errCap=[];ioEvents=null;dispatch(text.trim());const result=cap.join('\n').replace(/\n+$/,'');cap=oldCap;errCap=oldErr;ioEvents=oldEvents;return result; };
    const arithmetic=(expr)=>{ const vars=shellEnv(); const cooked=expr.replace(/\b[A-Za-z_][A-Za-z0-9_]*\b/g,n=>String(parseInt(vars[n]||'0')||0)); if(!/^[\d\s+\-*/%<>=!&|^~()?:.]+$/.test(cooked))return '0'; try{return String(Function('"use strict";return Number('+cooked+')')()||0);}catch(e){return '0';} };
    const expandVariables=(src)=>{ const vars=shellEnv(); let res='',q=''; for(let i=0;i<src.length;i++){const c=src[i]; if(c==='\\'&&q!=="'"){if(i+1<src.length){const nx=src[i+1];if(q==='"'&&!['$','`','"','\\','\n'].includes(nx))res+='\\';else{i++;res+=nx;}}continue;} if(c==='"'||c==="'"){if(!q)q=c;else if(q===c)q='';res+=c;continue;} if(c==='$'&&q!=="'"){
        if(src.slice(i,i+3)==='$(('){let depth=1,j=i+3;for(;j<src.length-1;j++){if(src.slice(j,j+2)==='(('){depth++;j++;}else if(src.slice(j,j+2)==='))'){depth--;if(depth===0)break;j++;}}if(depth===0){res+=arithmetic(src.slice(i+3,j));i=j+1;continue;}}
        if(src.slice(i,i+2)==='$('){let depth=1,j=i+2,qq='';for(;j<src.length;j++){const x=src[j];if((x==='"'||x==="'")&&!qq)qq=x;else if(x===qq)qq='';else if(!qq&&x==='(')depth++;else if(!qq&&x===')'){depth--;if(depth===0)break;}}if(depth===0){res+=captureCommand(src.slice(i+2,j));i=j;continue;}}
        if(src[i+1]==='$'){res+='888';i++;continue;} if(src[i+1]==='?'){res+=String(expansionStatus);i++;continue;} if(src[i+1]==='!'){res+=String(jobs[jobs.length-1]?.pid||'');i++;continue;} if(src[i+1]==='#'){res+=shellVars['#']||'0';i++;continue;}if(/[0-9]/.test(src[i+1]||'')){res+=shellVars[src[i+1]]||'';i++;continue;}
        const br=src.slice(i).match(/^\$\{([A-Za-z_][A-Za-z0-9_]*)(?:(:-|:=|:\+|:\?)([^}]*))?\}/); const len=src.slice(i).match(/^\$\{#([A-Za-z_][A-Za-z0-9_]*)\}/); const nm=src.slice(i).match(/^\$([A-Za-z_][A-Za-z0-9_]*)/);
        if(len){res+=String((vars[len[1]]||'').length);i+=len[0].length-1;continue;} if(br){const v=vars[br[1]]??'';let value=v;if(br[2]===':-'&&!v)value=br[3];else if(br[2]===':='&&!v){value=br[3];shellVars[br[1]]=value;}else if(br[2]===':+'&&v)value=br[3];else if(br[2]===':?'&&!v){err('-bash: '+br[1]+': '+(br[3]||'parámetro nulo o no establecido'));value='';}res+=value;i+=br[0].length-1;continue;} if(nm){res+=vars[nm[1]]??'';i+=nm[0].length-1;continue;}}
      res+=c;} return res; };
    const braceExpand=(src)=>{const m=src.match(/\{([^{}]+)\}/);if(!m)return[src];let vals=[];const range=m[1].match(/^(-?\d+)\.\.(-?\d+)(?:\.\.(-?\d+))?$/);if(range){let a=+range[1],b=+range[2],step=range[3]?+range[3]:(a<=b?1:-1);if(!step)step=1;for(let n=a;(step>0?n<=b:n>=b)&&vals.length<200;n+=step)vals.push(String(n));}else vals=m[1].split(',');return vals.flatMap(v=>braceExpand(src.slice(0,m.index)+v+src.slice(m.index+m[0].length)));};
    const globArgs=(parts)=>{ const match=(s,p)=>new RegExp('^'+p.replace(/[.+^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*').replace(/\?/g,'.')+'$').test(s); const result=[]; parts.forEach((arg,i)=>{if(i===0||tokenQuoted[i]||!/[?*]/.test(arg)){result.push(arg);return;} const slash=arg.lastIndexOf('/'); const base=slash>=0?arg.slice(0,slash)||'/':'.'; const pat=slash>=0?arg.slice(slash+1):arg; const dirNode=getNode(norm(base)); if(!dirNode||dirNode.type!=='dir'){result.push(arg);return;} const hits=Object.keys(dirNode.children).filter(n=>(pat[0]==='.'||n[0]!=='.')&&match(n,pat)).sort().map(n=>(slash>=0?arg.slice(0,slash+1):'')+n); result.push(...(hits.length?hits:[arg]));}); return result; };
    const splitOutside=(src,pipeOnly=false)=>{const outParts=[];let cur='',q='';for(let i=0;i<src.length;i++){const c=src[i];if(c==='\\'){cur+=c;if(i+1<src.length)cur+=src[++i];continue;}if(c==='"'||c==="'"){if(!q)q=c;else if(q===c)q='';cur+=c;continue;}if(!q){const two=src.slice(i,i+2);if(!pipeOnly&&(two==='&&'||two==='||')){outParts.push(cur.trim(),two);cur='';i++;continue;}if(!pipeOnly&&c===';'){outParts.push(cur.trim(),';');cur='';continue;}if(pipeOnly&&c==='|'&&two!=='||'){outParts.push(cur.trim(),'|');cur='';continue;}}cur+=c;}outParts.push(cur.trim());return {parts:outParts.filter(x=>x!==''),unclosed:q};};
    const rootMutation=(name,args)=>{
      if(['useradd','userdel','usermod','groupadd','chown','setenforce','setsebool','semanage','restorecon','chcon','mount','umount','mkswap','swapon','fdisk','parted','pvcreate','vgcreate','vgextend','lvcreate','lvextend','lvresize','lvreduce','lvremove','vgremove','pvremove','xfs_growfs','resize2fs','nmtui','reboot','poweroff','shutdown'].includes(name)||name.startsWith('mkfs'))return true;
      if(name==='hostnamectl')return args[0]==='set-hostname';
      if(name==='dockerd')return true;
      if(name==='kubeadm')return !['','version','--version','help','--help'].includes(args[0]||'');
      if(name==='chage')return !args.includes('-l');
      if(name==='dnf')return ['install','remove','update','upgrade','reinstall','downgrade','config-manager','clean','makecache'].includes(args.find(a=>!a.startsWith('-'))||'');
      if(name==='firewall-cmd')return args.some(a=>/^--(?:add|remove|reload|runtime-to-permanent|set-default-zone)/.test(a));
      if(name==='nmcli')return ['mod','modify','up','down','add','delete','del','reload'].includes(args[1])||['networking','radio'].includes(args[0]);
      if(name==='ip')return args.includes('set')||args.includes('add')||args.includes('del')||args.includes('delete');
      if(name==='tuned-adm')return args[0]==='profile';
      return false;
    };
    const runtimeState={};
    const exposeRuntimeState=(name,getter)=>Object.defineProperty(runtimeState,name,{enumerable:true,get:getter});
    exposeRuntimeState('rootRecovered',()=>rootRecovered); exposeRuntimeState('users',()=>users); exposeRuntimeState('net',()=>net);
    exposeRuntimeState('history',()=>history); exposeRuntimeState('services',()=>services); exposeRuntimeState('installed',()=>installed);
    exposeRuntimeState('images',()=>images); exposeRuntimeState('containers',()=>containers); exposeRuntimeState('disks',()=>disks);
    exposeRuntimeState('selinux',()=>selinux); exposeRuntimeState('fw',()=>fw); exposeRuntimeState('lvm',()=>lvm);
    exposeRuntimeState('dockerInstalled',()=>dockerInstalled); exposeRuntimeState('dockerNetworks',()=>dockerNetworks);
    exposeRuntimeState('dockerVolumes',()=>dockerVolumes); exposeRuntimeState('composeProjects',()=>composeProjects);
    exposeRuntimeState('k8s',()=>k8s); exposeRuntimeState('groupsDb',()=>groupsDb); exposeRuntimeState('linger',()=>linger);
    exposeRuntimeState('userUnits',()=>userUnits); exposeRuntimeState('tunedProfile',()=>tunedProfile);
    const runtimeContext=Object.freeze({
      state:runtimeState, getNode,
      io:Object.freeze({out,outMany,err,ok}),
      fs:Object.freeze({norm,getParent,file}),
      system:Object.freeze({K8S_FULL,K8S_MAJOR,K8S_MINOR,K8S_UPGRADE,ARCH}),
      helpers:Object.freeze({dockerConfigError})
    });
    const runtimeCommands=typeof runtime.createCommands==='function'?(runtime.createCommands(runtimeContext)||{}):{};
    const dispatch = (cmd) => {
      let parts = tokenize(cmd); parts=globArgs(parts); const name=parts[0]; const args=parts.slice(1);
      if(!name) return;
      if(aliases[name] && !shellVars.__aliasExpanding){shellVars.__aliasExpanding='1';dispatch(aliases[name]+(args.length?' '+args.join(' '):''));delete shellVars.__aliasExpanding;return;}
      if(shellFunctions[name]){const saved={};for(let i=0;i<=9;i++){saved[i]=shellVars[i];shellVars[i]=i===0?name:(args[i-1]||'');}saved['#']=shellVars['#'];shellVars['#']=String(args.length);shellFunctions[name].split(';').map(x=>x.trim()).filter(Boolean).forEach(x=>dispatch(expandVariables(x)));for(let i=0;i<=9;i++){if(saved[i]===undefined)delete shellVars[i];else shellVars[i]=saved[i];}if(saved['#']===undefined)delete shellVars['#'];else shellVars['#']=saved['#'];return;}
      if(/^[A-Za-z_][A-Za-z0-9_]*=/.test(name) && parts.length===1){const at=name.indexOf('=');shellVars[name.slice(0,at)]=name.slice(at+1);return;}
      if(containerShell){containerDispatch(cmd,name,args);return;}
      if(remoteHost){ remoteDispatch(cmd, name, args); return; }
      if(recovery){ recoveryDispatch(cmd, name, args); return; }
      if(name!=='docker'&&!commandAvailable(name)){err('-bash: '+name+': orden no encontrada',127);return;}
      if(currentUser!=='root'&&rootMutation(name,args)){err(name+': Permiso denegado: se requieren privilegios de superusuario.',1);return;}
      if(MODE!=='linux'&&!CMDS.includes(name)&&!(name.startsWith('./')||name.startsWith('/')||name.startsWith('~'))){err('-bash: '+name+': orden no encontrada',127);const suggestion=typeof closestCmd==='function'?closestCmd(name):'';if(suggestion)out('¿Quisiste decir «'+suggestion+'»?','#a2957d');return;}
      // route special-name commands
      if(name.startsWith('mkfs')){ const fst=name.includes('.')?name.split('.')[1]:( (args.indexOf('-t')!==-1)?args[args.indexOf('-t')+1]:'xfs'); const dev=args.filter(a=>a.startsWith('/dev/'))[0]; const p=dev?resolveDev(dev):null; if(!p){ err('mkfs: no existe el dispositivo: '+(dev||'')); return; } if(p.mount){ err('mkfs.'+fst+': '+dev+' está montado en '+p.mount+'; está EN USO. Desmóntalo con  umount  antes de formatear (así se protege el sistema).'); return; } if((dev||'').indexOf('/dev/sda')===0){ err('mkfs.'+fst+': '+dev+' pertenece al DISCO DEL SISTEMA. Formatearlo destruiría el sistema; usa el disco de prácticas /dev/sdb.'); return; } p.fstype=fst; p.data=null; p.uuid=Math.random().toString(16).slice(2,6)+'-'+Math.random().toString(16).slice(2,6); ok('meta-data='+(dev)+'  isize=512, agcount=4, agsize='+Math.round(sizeToGB(p.size)*65536)+' blks'); ok('Filesystem '+fst+' creado en '+dev+' (todos los datos anteriores se han borrado).'); return; }
      if((name.startsWith('./')||name.startsWith('/')||name.startsWith('~'))){ runScript(name, args); return; }

      if(args.includes('--help') && name!=='docker' && name!=='podman'){ const k=name.replace(/\..*/,''); renderMan(MAN[k]?k:name.replace(/\..*/,'')); return; }

      if(typeof runtimeCommands[name]==='function'){ runtimeCommands[name]({name,args,cmd}); return; }

      switch(name){
        case 'help':
          ok('FICHEROS:     ls cd pwd tree cat head tail mkdir touch rm cp mv echo find grep wc stat file');
          ok('SISTEMA:      ps top kill systemctl journalctl dnf rpm ip ss ping hostnamectl');
          if(MODE==='linux'){ok((CERTIFICATION||'RHCSA 9').padEnd(14)+': usuarios · permisos/ACL · SELinux · firewalld · LVM · cron · GRUB');ok('ALMACEN.:     lsblk fdisk blkid parted mkfs.xfs mount umount pvs vgs lvs lvcreate lvextend');}
          if(MODE==='docker'){ok('DOCKER:       docker info|pull|images|run|ps|logs|exec|inspect|build|network|volume');ok('COMPOSE:      docker compose up -d | ps | logs | down');}
          if(MODE==='kubernetes'){ok('KUBERNETES:   kubectl get|describe|logs|create|run|apply|delete|scale|rollout');ok('CLÚSTER:      kubectl cordon|drain|uncordon · kubeadm upgrade · etcdctl snapshot');}
          ok('OTROS:        man which history env date uptime free uname sudo vi nano tar clear reset');
          out('man <comando> para ayuda concreta · history conserva el historial de Bash · el cheatsheet está debajo.', '#a2957d'); break;

        case 'clear': [...body.querySelectorAll('.term-out')].forEach(d=>d.remove()); break;
        case 'labhosts': { out('Red del laboratorio S2KTUX  (192.168.1.0/24)','#8fa876'); out('HOST    IP             USUARIO   CONTRASEÑA   ROL'); out('web1    192.168.1.10   alumno    alumno       Servidor web (Apache)'); out('node1   192.168.1.12   --        --           Próximamente (Ansible / Kubernetes)'); out(''); out('Configura primero tu red (nmcli/nmtui) y luego:  ssh alumno@web1','#a2957d'); break; }
        case 'reset': [...body.querySelectorAll('.term-out')].forEach(d=>d.remove()); setPrompt(); break;
        case 'reboot': case 'poweroff': case 'shutdown': if(MODE==='linux')bootStart();else rebootMachine(); return;
        case 'pwd': out('/'+cwd.join('/')); break;
        case 'whoami': out(currentUser); break;
        case 'id': { const tgt=args.filter(a=>!a.startsWith('-'))[0]||currentUser; const u=users[tgt]; if(!u){err("id: '"+tgt+"': no existe ese usuario");break;} const gl=[...new Set([tgt,...u.groups])]; out('uid='+u.uid+'('+tgt+') gid='+u.gid+'('+tgt+') grupos='+u.uid+'('+tgt+')'+(gl.filter(g=>g!==tgt).length?','+gl.filter(g=>g!==tgt).map(g=>g).join(','):'')); break; }
        case 'groups': { const tgt=args[0]||currentUser; const u=users[tgt]; if(!u){err("groups: '"+tgt+"': no existe ese usuario");break;} out([...new Set([tgt,...u.groups])].join(' ')); break; }
        case 'uname': {const flags=args.join('');if(!flags){out('Linux');break;}if(flags.includes('a')){out('Linux '+localHostname()+' '+KERNEL+' #1 SMP PREEMPT_DYNAMIC '+ARCH+' GNU/Linux');break;}const values=[];if(flags.includes('s'))values.push('Linux');if(flags.includes('n'))values.push(localHostname());if(flags.includes('r'))values.push(KERNEL);if(flags.includes('v'))values.push('#1 SMP PREEMPT_DYNAMIC');if(flags.includes('m')||flags.includes('p')||flags.includes('i'))values.push(ARCH);if(flags.includes('o'))values.push('GNU/Linux');if(!values.length){err("uname: opción no válida -- '"+(flags.replace(/-/g,'')[0]||'')+"'");break;}out(values.join(' '));break;}
        case 'hostname': out(localHostname()); break;
        case 'hostnamectl': { if(args[0]==='set-hostname'){ const hn=args.filter(a=>!a.startsWith('-'))[1]; if(!hn){ err('hostnamectl: falta el nombre'); break; } const f=getNode(['etc','hostname']); if(f)f.content=hn; else { const e=getNode(['etc']); if(e)e.children.hostname=file(hn,{owner:'root'}); } const ph=getNode(['proc','sys','kernel','hostname']);if(ph&&ph.type==='file')ph.content=hn;setPrompt();break; } outMany(['   Static hostname: '+localHostname(),'         Icon name: computer-vm','   Operating System: '+OS_NAME,'            Kernel: Linux '+KERNEL,'      Architecture: '+ARCH.replace(/_/g,'-')]); break; }
        case 'date': out(new Date().toString()); break;
        case 'uptime': { const sec=Math.max(1,Math.floor((Date.now()-bootStartedAt)/1000)); const days=Math.floor(sec/86400),hours=Math.floor(sec%86400/3600),mins=Math.floor(sec%3600/60); const up=(days?days+' day'+(days===1?'':'s')+', ':'')+hours+':'+String(mins).padStart(2,'0'); const active=loginRecords.filter(r=>r.active).length||1; out(' '+new Date().toLocaleTimeString()+'  up '+up+',  '+active+' user'+(active===1?'':'s')+',  load average: 0.08, 0.03, 0.01'); break; }
        case 'free': outMany(['              total        used        free      shared  buff/cache   available','Mem:          3.8Gi       1.1Gi       1.9Gi       120Mi       800Mi       2.4Gi','Swap:         2.0Gi          0B       2.0Gi']); break;
        case 'env': case 'printenv': { const vars=shellEnv(); const visible=name==='env'?[...new Set(['USER','HOME','SHELL','PWD','PATH','LANG','HISTSIZE','HISTFILE',...exportedVars])]:args.length?args:[...new Set(['USER','HOME','SHELL','PWD',...exportedVars])]; if(name==='printenv'&&args.length===1){if(vars[args[0]]==null)err('',1);else out(vars[args[0]]);break;} visible.filter(k=>vars[k]!=null).sort().forEach(k=>out(k+'='+vars[k])); break; }
        case 'export': { if(!args.length){[...exportedVars].sort().forEach(k=>out('declare -x '+k+'="'+String(shellEnv()[k]??'').replace(/"/g,'\\"')+'"'));break;} args.forEach(a=>{const m=a.match(/^([A-Za-z_][A-Za-z0-9_]*)(?:=(.*))?$/);if(!m){err('bash: export: «'+a+'»: no es un identificador válido');return;}if(m[2]!==undefined)shellVars[m[1]]=m[2];exportedVars.add(m[1]);}); break; }
        case 'unset': args.forEach(k=>{delete shellVars[k];exportedVars.delete(k);}); break;
        case 'set': { if(args[0]==='-o'||args[0]==='+o'){ if(args[1]){const key={e:'errexit',u:'nounset','pipefail':'pipefail',x:'xtrace',C:'noclobber'}[args[1]]||args[1];if(key in shellOptions)shellOptions[key]=args[0]==='-o';else err('bash: set: '+args[1]+': nombre de opción inválido');}else Object.keys(shellOptions).forEach(k=>out(k.padEnd(18)+(shellOptions[k]?'on':'off'))); } else if(args.length&&/^-[euxC]$/.test(args[0]))args[0].slice(1).split('').forEach(x=>shellOptions[{e:'errexit',u:'nounset',x:'xtrace',C:'noclobber'}[x]]=true); else Object.keys(shellVars).sort().forEach(k=>out(k+'='+shellVars[k])); break; }
        case 'alias': { if(!args.length){Object.keys(aliases).sort().forEach(k=>out("alias "+k+"='"+aliases[k]+"'"));break;} args.forEach(a=>{const m=a.match(/^([A-Za-z_][A-Za-z0-9_-]*)=(.*)$/);if(m)aliases[m[1]]=m[2].replace(/^['"]|['"]$/g,'');else if(aliases[a])out("alias "+a+"='"+aliases[a]+"'");else err('-bash: alias: '+a+': no encontrado');});break; }
        case 'unalias': args.forEach(a=>{if(a==='-a')aliases={};else if(aliases[a])delete aliases[a];else err('-bash: unalias: '+a+': no encontrado');});break;
        case 'type': case 'which': { args.forEach(a=>{if(aliases[a])out(a+" es un alias de `"+aliases[a]+"'");else if(shellFunctions[a])out(a+' es una función');else if((CMDS.includes(a)||Object.prototype.hasOwnProperty.call(COMMAND_PACKAGES,a))&&commandAvailable(a))out(name==='which'?'/usr/bin/'+a:a+' es /usr/bin/'+a);else err('-bash: type: '+a+': no encontrado');});break; }
        case 'printf': { let fmt=args.shift()||'';let i=0;const rendered=fmt.replace(/%[sd]/g,m=>{const v=args[i++]||'';return m==='%d'?String(parseInt(v)||0):v;}).replace(/\\n/g,'\n').replace(/\\t/g,'\t').replace(/\\x([0-9a-fA-F]{2})/g,(_,h)=>String.fromCharCode(parseInt(h,16)));rendered.split('\n').forEach((l,j,a)=>{if(j<a.length-1||l)out(l);});break; }
        case 'true': lastStatus=0;lastFail=false;break;
        case 'false': lastStatus=1;lastFail=true;break;
        case 'who': loginRecords.filter(r=>r.active).forEach(r=>out(r.user.padEnd(9)+(r.tty||'pts/0').padEnd(12)+new Date(r.login).toLocaleString())); if(!loginRecords.some(r=>r.active))out(currentUser.padEnd(9)+'pts/0       '+new Date().toLocaleString()); break;
        case 'w': { out(' '+new Date().toLocaleTimeString()+' up '+Math.floor((Date.now()-bootStartedAt)/60000)+' min, '+(loginRecords.filter(r=>r.active).length||1)+' user, load average: 0.08, 0.03, 0.01');out('USER      TTY        FROM             LOGIN@   IDLE   JCPU   PCPU WHAT');const rows=loginRecords.filter(r=>r.active);(rows.length?rows:[{user:currentUser,tty:'pts/0',host:'-',login:Date.now()}]).forEach(r=>out(r.user.padEnd(10)+(r.tty||'pts/0').padEnd(11)+(r.host||'-').padEnd(17)+new Date(r.login).toLocaleTimeString().slice(0,5)+'    0.00s  0.02s  0.00s -bash'));break; }
        case 'last': loginRecords.slice().reverse().slice(0,20).forEach(r=>out(r.user.padEnd(10)+(r.tty||'pts/0').padEnd(12)+(r.host||'').padEnd(16)+new Date(r.login).toString().slice(0,16)+(r.active?'   still logged in':' - '+new Date(r.logout||r.login).toString().slice(11,16))));out('wtmp begins '+new Date(bootStartedAt).toString().slice(0,24));break;
        case 'history': {
          const opt=args[0]||'';
          const histPath=norm((users[currentUser]?.home||'/root')+'/.bash_history');
          if(opt==='-c'){ history.length=0; hIdx=0; break; }
          if(opt==='-d'){
            const offset=parseInt(args[1],10);
            if(!Number.isInteger(offset)||offset<1||offset>history.length){err('history: '+(args[1]||'')+': posición de historial fuera de rango');break;}
            history.splice(offset-1,1); hIdx=history.length; break;
          }
          if(opt==='-w'){
            const parent=getParent(histPath), fn=histPath[histPath.length-1];
            if(!parent||parent.type!=='dir'){err('history: no se puede crear el archivo de historial');break;}
            parent.children[fn]=file(history.join('\n')+(history.length?'\n':''),{owner:currentUser,group:currentUser,mode:'600'}); break;
          }
          if(opt==='-r'){
            const n=getNode(histPath);
            if(!n||n.type!=='file'){err('history: '+(users[currentUser]?.home||'/root')+'/.bash_history: no existe el archivo o el directorio');break;}
            n.content.split('\n').filter(Boolean).forEach(h=>{if(history[history.length-1]!==h)history.push(h);});
            if(history.length>500)history.splice(0,history.length-500); hIdx=history.length; break;
          }
          if(opt&&opt.startsWith('-')){err('history: '+opt+': opción no válida');break;}
          const count=opt?parseInt(opt,10):history.length;
          if(opt&&(!Number.isInteger(count)||count<0)){err('history: '+opt+': argumento numérico requerido');break;}
          const start=Math.max(0,history.length-count);
          history.slice(start).forEach((h,i)=>out(String(start+i+1).padStart(5)+'  '+h)); break;
        }
        case 'man': { const key=(args.filter(a=>!a.startsWith('-')).pop()||'').replace(/\..*/,''); if(!key){ err('¿Qué página de manual desea?'); break; } const prev=cap;cap=[];renderMan(key);const lines=cap;cap=prev;if(lines.length)pagerEnter(lines,'man '+key);break; }
        case 'less': case 'more': {const f=args.filter(a=>!a.startsWith('-'))[0];const n=f?getNode(norm(f)):null;if(!n||n.type!=='file'){err(name+': '+(f||'')+': No existe el fichero o el directorio');break;}pagerEnter(n.content.split('\n'),f);return;}
        case 'which': { const q=args[0]; if(!q){err('which: falta argumento');break;} if((CMDS.includes(q)||Object.prototype.hasOwnProperty.call(COMMAND_PACKAGES,q))&&commandAvailable(q))out('/usr/bin/'+q); else err('which: no '+q+' in ('+shellEnv().PATH+')',1); break; }
        case 'echo': {
          const e=args[0]==='-e'; let s=(e?args.slice(1):args).join(' '); if(e)s=s.replace(/\\n/g,'\n').replace(/\\t/g,'\t').replace(/\\r/g,'\r'); s.split('\n').forEach(l=>out(l)); break;
        }
        case 'ls': {
          const flags=args.filter(a=>a.startsWith('-')).join(''); const rest=args.filter(a=>!a.startsWith('-'));
          const segs=rest[0]?norm(rest[0]):cwd.slice(); const node=getNode(segs);
          if(!node){err('ls: no existe: '+(rest[0]||''));break;}
          if(node.type==='file'){out(rest[0]);break;}
          let ks=Object.keys(node.children);
          if(!flags.includes('a')) ks=ks.filter(k=>!k.startsWith('.')); else ks=['.','..'].concat(ks);
          if(ks.length===0) break;
          const seContext=(k,ch)=>{ const p='/'+segs.concat(k).join('/'); let type='default_t'; if(/^\/home\//.test(p)||/^\/root/.test(p)) type='user_home_t'; else if(/^\/etc\/shadow/.test(p)) type= shadowMislabeled?'unlabeled_t':'shadow_t'; else if(/^\/etc\/passwd/.test(p)) type='passwd_file_t'; else if(/^\/etc/.test(p)) type='etc_t'; else if(/^\/var\/www/.test(p)) type='httpd_sys_content_t'; else if(/^\/var\/log/.test(p)) type='var_log_t'; else if(/^\/var/.test(p)) type='var_t'; else if(/^\/tmp/.test(p)) type='tmp_t'; else if(/^\/usr\/bin|^\/bin/.test(p)) type='bin_t'; else if(ch.type==='dir') type='default_t'; const user=(/^\/home\/|^\/root/.test(p))?'unconfined_u':'system_u'; return user+':object_r:'+type+':s0'; };
          if(flags.includes('Z')){
            if(flags.includes('l')){ out('total '+(ks.length*4)); ks.forEach(k=>{ const ch=(k==='.'||k==='..')?{type:'dir',mode:'rwxr-xr-x',owner:'root',group:'root'}:node.children[k]; const isDir=ch.type==='dir'; out((isDir?'d':'-')+(ch.mode||'rw-r--r--')+'  '+(ch.owner||'root').padEnd(7)+' '+(ch.group||'root').padEnd(7)+' '+seContext(k,ch).padEnd(34)+' '+k+(isDir?'/':'')); }); break; }
            ks.forEach(k=>{ const ch=(k==='.'||k==='..')?{type:'dir'}:node.children[k]; out(seContext(k,ch)+' '+k+(ch.type==='dir'?'/':'')); }); break;
          }
          if(flags.includes('l')){ out('total '+(ks.length*4)); ks.forEach(k=>{ const ch=(k==='.'||k==='..')?{type:'dir',mode:'rwxr-xr-x',owner:'root',group:'root'}:node.children[k]; const isDir=ch.type==='dir'; const size=isDir?4096:(ch.content?ch.content.length:0); out((isDir?'d':'-')+(ch.mode||'rw-r--r--')+'  1 '+(ch.owner||'root').padEnd(7)+' '+(ch.group||'root').padEnd(7)+' '+String(size).padStart(6)+'  '+k+(isDir?'/':'')); }); }
          else out(ks.map(k=>{ const ch=(k==='.'||k==='..')?{type:'dir'}:node.children[k]; return k+(ch.type==='dir'?'/':''); }).join('   ')); break;
        }
        case 'cd': { const t=args[0]==='-'?(shellVars.OLDPWD||'~'):(args[0]||'~'); const segs=norm(t); const node=getNode(segs); if(!node){err('bash: cd: '+t+': No existe el fichero o el directorio');break;} if(node.type!=='dir'){err('bash: cd: '+t+': No es un directorio');break;} if(!canTraverse(segs)||!hasPerm(node,'x')){err('bash: cd: '+t+': Permiso denegado');break;} shellVars.OLDPWD='/'+cwd.join('/'); cwd=segs; if(args[0]==='-')out('/'+cwd.join('/')); setPrompt(); break; }
        case 'cat': { if(!args[0]){err('cat: falta el fichero');break;} const segs=norm(args[0]),n=getNode(segs); if(!n){err('cat: '+args[0]+': No existe el fichero o el directorio');break;} if(n.type==='dir'){err('cat: '+args[0]+': Es un directorio');break;} if(!canTraverse(segs.slice(0,-1))||!hasPerm(n,'r')){err('cat: '+args[0]+': Permiso denegado');break;} n.content.split('\n').forEach(l=>out(l)); break; }
        case 'head': case 'tail': { const fol=name==='tail'&&(args.includes('-f')||args.includes('-F')); let num=10; const ni=args.indexOf('-n'); if(ni!==-1)num=+args[ni+1]; const fi=args.filter(a=>!a.startsWith('-')&&!/^\d+$/.test(a))[0]; const n=getNode(norm(fi||'')); if(!n||n.type!=='file'){err(name+': no se puede abrir '+(fi||'')+' para lectura: No existe el fichero o el directorio');break;} const L=n.content.split('\n'); (name==='head'?L.slice(0,num):L.slice(-num)).forEach(l=>out(l)); if(fol){ const msgs=['nueva conexión aceptada','petición procesada (200)','tarea completada','heartbeat ok']; startFollow((k)=>new Date().toLocaleTimeString()+' '+(fi.split('/').pop())+': '+msgs[k%msgs.length]); } break; }
        case 'wc': { const lf=args.includes('-l'); const fi=args.filter(a=>!a.startsWith('-'))[0]; const n=getNode(norm(fi||'')); if(!n||n.type!=='file'){err('wc: '+(fi||'')+': no es un fichero');break;} const c=n.content; out(lf?c.split('\n').length+' '+fi:c.split('\n').length+' '+c.split(/\s+/).filter(Boolean).length+' '+c.length+' '+fi); break; }
        case 'sort': case 'uniq': case 'nl': { const fi=args.filter(a=>!a.startsWith('-')).pop(); const n=fi?getNode(norm(fi)):null; if(!n||n.type!=='file'){ err(name+': '+(fi||'')+': no es un fichero'); break; } applyFilter(name+' '+args.filter(a=>a.startsWith('-')).join(' '), n.content.split('\n')).forEach(l=>out(l)); break; }
        case 'mkdir': { const recursive=args.includes('-p'); const mk=(rel)=>{ const segs=norm(rel); if(recursive){ let cur=fs; for(const s of segs){ if(cur.type!=='dir'||!hasPerm(cur,'x')){err('mkdir: no se puede crear «'+rel+'»: Permiso denegado');return;} if(!cur.children[s]){if(!hasPerm(cur,'w')){err('mkdir: no se puede crear «'+rel+'»: Permiso denegado');return;}cur.children[s]=dir({},{owner:currentUser,group:currentUser});} cur=cur.children[s]; } return; } const p=getParent(segs); const nm=segs[segs.length-1]; if(!p||p.type!=='dir'){err('mkdir: no se puede crear el directorio «'+rel+'»: No existe el fichero o el directorio');return;} if(!hasPerm(p,'w')||!hasPerm(p,'x')){err('mkdir: no se puede crear el directorio «'+rel+'»: Permiso denegado');return;} if(p.children[nm]){err('mkdir: no se puede crear el directorio «'+rel+'»: El fichero ya existe');return;} p.children[nm]=dir({},{owner:currentUser,group:currentUser}); }; const targets=args.filter(a=>!a.startsWith('-')); if(!targets.length){err('mkdir: falta un operando');break;} targets.forEach(mk); break; }
        case 'rmdir': { const segs=norm(args[0]||''); const p=getParent(segs); const nm=segs[segs.length-1]; if(!p||!p.children[nm]){err('rmdir: no existe');break;} if(p.children[nm].type!=='dir'){err('rmdir: no es un directorio');break;} if(Object.keys(p.children[nm].children).length){err('rmdir: el directorio no esta vacio');break;} delete p.children[nm]; break; }
        case 'touch': { const targets=args.filter(a=>!a.startsWith('-'));if(!targets.length){err('touch: falta un operando de fichero');break;} targets.forEach(target=>{const segs=norm(target);const p=getParent(segs);const nm=segs[segs.length-1];if(!p||p.type!=='dir'){err('touch: no se puede efectuar touch sobre «'+target+'»: No existe el fichero o el directorio');return;}const ex=p.children[nm];if((ex&&!hasPerm(ex,'w'))||(!ex&&(!hasPerm(p,'w')||!hasPerm(p,'x')))){err('touch: no se puede efectuar touch sobre «'+target+'»: Permiso denegado');return;}if(!ex)p.children[nm]=file('',{owner:currentUser,group:currentUser});});break; }
        case 'rm': { const rec=args.some(a=>/^-.*r/.test(a)); const tgt=args.filter(a=>!a.startsWith('-'))[0]; if(!tgt){err('rm: falta la ruta');break;} const segs=norm(tgt); const p=getParent(segs); const nm=segs[segs.length-1]; if(!p||!p.children[nm]){err('rm: no se puede borrar «'+tgt+'»: No existe el fichero o el directorio');break;} if(!hasPerm(p,'w')||!hasPerm(p,'x')){err('rm: no se puede borrar «'+tgt+'»: Permiso denegado');break;} if(p.children[nm].type==='dir'&&!rec){err('rm: no se puede borrar «'+tgt+'»: Es un directorio');break;} delete p.children[nm]; break; }
        case 'cp': case 'mv': { if(args.length<2){err(name+': faltan argumentos');break;} const ss=norm(args[0]); const sp=getParent(ss); const sn=ss[ss.length-1]; if(!sp||!sp.children[sn]){err(name+': no existe: '+args[0]);break;} const ds=norm(args[1]); let dp=getParent(ds); let dn=ds[ds.length-1]; const dnode=getNode(ds); if(dnode&&dnode.type==='dir'){dp=dnode;dn=sn;} if(!dp||dp.type!=='dir'){err(name+': destino no valido');break;} dp.children[dn]=JSON.parse(JSON.stringify(sp.children[sn])); if(name==='mv') delete sp.children[sn]; break; }
        case 'ln': { const rest=args.filter(a=>!a.startsWith('-')); if(rest.length<2){err('ln: faltan argumentos');break;} const ds=norm(rest[1]); const dp=getParent(ds); const dn=ds[ds.length-1]; if(!dp||dp.type!=='dir'){err('ln: destino no valido');break;} dp.children[dn]=file('-> '+rest[0],{owner:currentUser}); ok((args.includes('-s')?'enlace simbolico':'enlace')+' creado: '+rest[1]+' -> '+rest[0]); break; }
        case 'find': { const base=args[0]&&!args[0].startsWith('-')?args[0]:'.'; const node=getNode(norm(base)); if(!node){ err('find: '+base+': No existe el fichero o el directorio'); break; } const gv=(f)=>{ const i=args.indexOf(f); return i!==-1?args[i+1]:null; }; const nameP=gv('-name'), userP=gv('-user'), typeP=gv('-type'), permP=gv('-perm'); const symOct=(m)=>{ m=m||'rw-r--r--'; let o=''; for(let i=0;i<3;i++){ const p=m.slice(i*3,i*3+3); o+=((p[0]!=='-'?4:0)+(p[1]!=='-'?2:0)+(p[2]!=='-'?1:0)); } return o; }; const esc2=(x)=>x.replace(/[.+^()|\[\]\\]/g,'\\$&').replace(/\*/g,'.*').replace(/\?/g,'.'); const rx=nameP?new RegExp('^'+esc2(nameP)+'$'):null; const match=(n,nm)=>{ if(rx&&!rx.test(nm)) return false; if(userP&&(n.owner||'root')!==userP) return false; if(typeP==='f'&&n.type!=='file') return false; if(typeP==='d'&&n.type!=='dir') return false; if(permP&&symOct(n.mode)!==permP.replace(/^[-\/]/,'')) return false; return true; }; const walk=(n,p)=>{ const nm=p==='.'?'.':p.split('/').pop(); if(match(n,nm)) out(p); if(n.type==='dir'){ Object.keys(n.children).forEach(k=> walk(n.children[k], (p==='/'?'':p)+'/'+k)); } }; walk(node, base); break; }
        case 'grep': { if(args.length<2){err('grep: uso: grep <patron> <fichero>');break;} const n=getNode(norm(args[args.length-1])); if(!n||n.type!=='file'){err('grep: '+args[args.length-1]+': no es un fichero');break;} const ic=args.includes('-i'); const pat=args.filter(a=>!a.startsWith('-')).slice(0,-1).join(' '); n.content.split('\n').filter(l=>ic?l.toLowerCase().includes(pat.toLowerCase()):l.includes(pat)).forEach(l=>out(l)); break; }
        case 'stat': { const n=getNode(norm(args[0]||'')); if(!n){err('stat: no existe');break;} out('  File: '+(args[0]||'')); out('  Size: '+(n.type==='file'?n.content.length:4096)+'   '+(n.type==='dir'?'directory':'regular file')); out('Access: ('+(n.mode||'rw-r--r--')+')  Uid: ('+(users[n.owner]?users[n.owner].uid:1000)+'/'+(n.owner||'root')+')  Gid: ('+(n.group||'root')+')'); break; }
        case 'file': { const n=getNode(norm(args[0]||'')); if(!n){err('file: no existe');break;} out((args[0]||'')+': '+(n.type==='dir'?'directory':(n.content.startsWith('#!')?'a '+n.content.split('\n')[0].slice(2)+' script, ASCII text executable':'ASCII text'))); break; }
        case 'tree': out(pretty(cwd)); treeLines(getNode(cwd),'',[]).forEach(l=>out(l)); break;
        case 'umask': out('0022'); break;

        case 'chmod': { const rec=args.includes('-R')||args.includes('--recursive'); const rest2=args.filter(a=>!a.startsWith('-')||/^[0-7]{3,4}$/.test(a)); const spec=rest2[0]; const tgt=rest2[rest2.length-1]; if(!spec||rest2.length<2){err('chmod: uso: chmod [-R] <octal|simbólico> <fichero>');break;} const n=getNode(norm(tgt)); if(!n){err('chmod: no se puede acceder a \''+tgt+'\': No existe el fichero o el directorio');break;} if(currentUser!=='root'&&n.owner!==currentUser){err('chmod: cambiando los permisos de \''+tgt+'\': Operación no permitida');break;}
          const permBits=(m)=>({r:m[0]!=='-',w:m[1]!=='-',x:(m[2]==='x'||m[2]==='s'||m[2]==='t'),s:(m[2]==='s'||m[2]==='S'),t:(m[2]==='t'||m[2]==='T')});
          const buildTrip=(r,w,x,special,kind)=>{ let c3; if(special){ c3 = x ? (kind==='t'?'t':'s') : (kind==='t'?'T':'S'); } else c3 = x?'x':'-'; return (r?'r':'-')+(w?'w':'-')+c3; };
          const applyOctal=(o)=>{ let s=o; if(s.length===3)s='0'+s; const sp=+s[0], u=+s[1], g=+s[2], o2=+s[3]; const t1=buildTrip(u&4,u&2,u&1,sp&4,'s'); const t2=buildTrip(g&4,g&2,g&1,sp&2,'s'); const t3=buildTrip(o2&4,o2&2,o2&1,sp&1,'t'); return t1+t2+t3; };
          const cur=(n.mode||'rw-r--r--'); const trips=[cur.slice(0,3),cur.slice(3,6),cur.slice(6,9)];
          if(/^[0-7]{3,4}$/.test(spec)){ n.mode=applyOctal(spec); }
          else if(/^([ugoa]*)([+\-=])([rwxst]+)$/.test(spec)){ const mm=spec.match(/^([ugoa]*)([+\-=])([rwxst]+)$/); let who=mm[1]||'a'; if(who==='a')who='ugo'; const op=mm[2]; const perms=mm[3]; const idx={u:0,g:1,o:2}; who.split('').forEach(wc=>{ if(idx[wc]===undefined)return; const i=idx[wc]; let b=permBits(trips[i]); perms.split('').forEach(pc=>{ const on=op!=='-'; if(pc==='r')b.r=on; else if(pc==='w')b.w=on; else if(pc==='x')b.x=on; else if(pc==='s')b.s=on; else if(pc==='t')b.t=on; }); if(op==='='){ b={r:perms.includes('r'),w:perms.includes('w'),x:perms.includes('x'),s:perms.includes('s'),t:perms.includes('t')}; } trips[i]=buildTrip(b.r,b.w,b.x,(i===2?b.t:b.s),(i===2?'t':'s')); }); n.mode=trips.join(''); }
          else {err('chmod: modo incorrecto: '+spec);break;} break; }
        case 'chown': { if(args.length<2){err('chown: uso: chown user[:grp] fichero');break;} const n=getNode(norm(args[args.length-1])); if(!n){err('chown: no existe: '+args[args.length-1]);break;} const ug=args[0].split(':'); n.owner=ug[0]; if(ug[1]) n.group=ug[1]; break; }
        case 'chgrp': { const group=args[0],tgt=args[args.length-1]||'',n=getNode(norm(tgt)); if(!n){err('chgrp: no se puede acceder a \''+tgt+'\': No existe el fichero o el directorio');break;} if(!groupsDb.has(group)){err("chgrp: grupo inválido: ‘"+group+"’");break;} if(currentUser!=='root'&&(n.owner!==currentUser||!(users[currentUser]?.groups||[]).includes(group))){err('chgrp: cambiando el grupo de \''+tgt+'\': Operación no permitida');break;} n.group=group; break; }
        case 'getfacl': { const tgt=args.filter(a=>!a.startsWith('-'))[0]; if(!tgt){ err('getfacl: uso: getfacl [-aceEsRLPtpndvh] fichero ...'); break; } const n=getNode(norm(tgt)); if(!n){err('getfacl: '+tgt+': No existe el fichero o el directorio');break;} out('# file: '+tgt.replace(/^\//,'')); out('# owner: '+(n.owner||'root')); out('# group: '+(n.group||'root')); const m=n.mode||'rw-r--r--'; out('user::'+m.slice(0,3)); (n.acl||[]).filter(a=>a.type==='user').forEach(a=>out('user:'+a.name+':'+a.perms)); out('group::'+m.slice(3,6)); (n.acl||[]).filter(a=>a.type==='group').forEach(a=>out('group:'+a.name+':'+a.perms)); if(n.acl&&n.acl.length) out('mask::rwx'); out('other::'+m.slice(6,9)); out(''); break; }
        case 'setfacl': { const tgt=args[args.length-1]; const n=getNode(norm(tgt)); if(!n){err('setfacl: '+tgt+': no existe');break;} if(currentUser!=='root'&&n.owner!==currentUser){err('setfacl: '+tgt+': Operación no permitida');break;} n.acl=n.acl||[]; if(args.includes('-b')){ n.acl=[]; ok('ACLs eliminadas de '+tgt); break; } const mi=args.indexOf('-m'); const xi=args.indexOf('-x'); if(mi!==-1){ const spec=args[mi+1]; const p=spec.split(':'); const type=p[0]==='u'||p[0]==='user'?'user':'group'; const nm=p[1]; const perms=p[2]||'rwx'; n.acl=n.acl.filter(a=>!(a.type===type&&a.name===nm)); n.acl.push({type,name:nm,perms}); } else if(xi!==-1){ const spec=args[xi+1]; const p=spec.split(':'); const type=p[0]==='u'||p[0]==='user'?'user':'group'; n.acl=n.acl.filter(a=>!(a.type===type&&a.name===p[1])); } else { err('setfacl: usa -m u:usuario:rwx <f>, -x u:usuario <f> o -b <f>'); } break; }
        case 'getenforce': out(selinux.mode); break;
        case 'setenforce': { const v=args[0]; if(v==='0'||/permissive/i.test(v)) selinux.mode='Permissive'; else if(v==='1'||/enforcing/i.test(v)) selinux.mode='Enforcing'; else { err('setenforce: uso: setenforce [ Enforcing | Permissive | 1 | 0 ]'); break; } ok(''); break; }
        case 'sestatus': outMany(['SELinux status:                 enabled','SELinuxfs mount:                /sys/fs/selinux','Loaded policy name:             targeted','Current mode:                   '+selinux.mode.toLowerCase(),'Mode from config file:          enforcing','Policy MLS status:              enabled','Max kernel policy version:      33']); break;
        case 'getsebool': { if(args.includes('-a')){ outMany(['httpd_can_network_connect --> off','httpd_enable_homedirs --> off','ftp_home_dir --> off','ssh_sysadm_login --> off']); } else out((args[0]||'httpd_can_network_connect')+' --> off'); break; }
        case 'setsebool': ok(''); break;
        case 'semanage': { const t=args[0]; if(t==='port'&&args.includes('-l')){ out('SELinux Port Type              Proto    Port Number'); out('http_port_t                    tcp      80, 443, 8080'); out('ssh_port_t                     tcp      22'); } else if(t==='port'&&args.includes('-a')){ const portTok=args[args.length-1]; const port=parseInt(portTok); if(port){ selinux.httpPorts=(selinux.httpPorts||[80,443,8080]).concat(port); ok('Puerto '+port+' añadido'+(args.includes('http_port_t')?' al tipo http_port_t':'')+'.'); } else { ok('puerto añadido al tipo SELinux (simulado).'); } } else if(t==='fcontext'&&args.includes('-a')){ const pth=args.filter(a=>a.startsWith('/'))[0]; if(pth){ selinux.fcontexts=selinux.fcontexts||[]; selinux.fcontexts.push(pth.replace(/\(.*/,'').replace(/\/$/,'')); } ok('contexto de fichero añadido. Aplícalo con: restorecon -Rv '+(pth||'RUTA')); } else out('semanage: usa port -l | port -a | fcontext -a'); break; }
        case 'restorecon': { const tg=args.filter(a=>!a.startsWith('-')).join(' ')||'/ruta'; if(/shadow|\/etc/.test(tg)) shadowMislabeled=false; if(args.includes('-v')||args.includes('-Rv')||args.includes('-vR')) out('Relabeled '+tg); break; }
        case 'chcon': break;
        case 'ls-z': case 'lsz': out('unconfined_u:object_r:user_home_t:s0'); break;
        case 'chage': { if(args.includes('-l')){ const u=args[args.length-1]; out('Último cambio de contraseña                            : '+new Date().toDateString()); out('La contraseña caduca                                   : nunca'); out('Contraseña inactiva                                    : nunca'); out('La cuenta caduca                                       : nunca'); out('Número mínimo de días entre cambio de contraseña       : 0'); out('Número máximo de días entre cambio de contraseña       : 99999'); out('Número de días de aviso antes de que caduque la contraseña : 7'); } else ok('información de envejecimiento cambiada.'); break; }
        case 'crontab': { const ui=args.indexOf('-u'); const cronUser=ui!==-1?args[ui+1]:currentUser; if(ui!==-1&&currentUser!=='root'){ err('crontab: solo root puede usar -u'); break; } const dirSeg=['var','spool','cron']; const ensure=()=>{ let p=getNode(dirSeg); if(!p){ const sp=getNode(['var','spool']); if(sp&&sp.type==='dir'){ sp.children.cron=dir({},{owner:'root'}); p=sp.children.cron; } } return p; }; if(args.includes('-l')){ const n=getNode(dirSeg.concat(cronUser)); if(n&&n.type==='file'&&n.content.trim()){ n.content.split('\n').forEach(l=>out(l)); } else out('no crontab for '+cronUser); } else if(args.includes('-r')){ const p=getNode(dirSeg); if(p&&p.children[cronUser]) delete p.children[cronUser]; } else if(args.includes('-e')){ ensure(); editorEnter('nano', '/var/spool/cron/'+cronUser); return; } else out('crontab: usa -l (listar), -e (editar) o -r (borrar)'); break; }
        case 'timedatectl': outMany(['               Local time: '+new Date().toString(),'           Universal time: '+new Date().toUTCString(),'                 Time zone: Europe/Madrid (CEST, +0200)','System clock synchronized: yes','              NTP service: active']); break;
        case 'pvcreate': { const devs=args.filter(a=>a.startsWith('/dev/')); if(!devs.length){err('pvcreate: falta el dispositivo. Ej: pvcreate /dev/sdb1');break;} devs.forEach(dv=>{ if(lvm.pvs.find(p=>p.name===dv)){ out('  Physical volume '+dv+' not changed'); return; } const part=findPart(dv); const dsk=disks.find(d=>('/dev/'+d.name)===dv); if(!part&&!dsk){ err('  Device '+dv+' not found.'); return; } const size=part?sizeToGB(part.size):sizeToGB(dsk.size); if(part) part.fstype='LVM2_member'; lvm.pvs.push({name:dv,vg:'',psize:size}); ok('  Physical volume "'+dv+'" successfully created.'); }); break; }
        case 'vgcreate': { const vg=args.find(a=>!a.startsWith('-')&&!a.startsWith('/dev/')); const devs=args.filter(a=>a.startsWith('/dev/')); if(!vg||!devs.length){err('vgcreate: uso: vgcreate <vg> <dispositivo...>');break;} if(vgByName(vg)){err('  Volume group "'+vg+'" already exists');break;} let sz=0, bad=false; devs.forEach(dv=>{ let pv=lvm.pvs.find(p=>p.name===dv); if(!pv){ const part=findPart(dv); if(part){ part.fstype='LVM2_member'; pv={name:dv,vg:'',psize:sizeToGB(part.size)}; lvm.pvs.push(pv);} else { err('  Device '+dv+' not found.'); bad=true; return; } } pv.vg=vg; sz+=pv.psize; }); if(bad)break; lvm.vgs.push({name:vg,pvs:devs.slice(),vsize:sz,vfree:sz}); ok('  Volume group "'+vg+'" successfully created'); break; }
        case 'vgextend': { const vg=args.find(a=>!a.startsWith('-')&&!a.startsWith('/dev/')); const devs=args.filter(a=>a.startsWith('/dev/')); if(!vg||!devs.length){ err('vgextend: uso: vgextend <vg> <dispositivo...>'); break; } const g=vgByName(vg); if(!g){err('  Volume group "'+vg+'" not found');break;} devs.forEach(dv=>{ let pv=lvm.pvs.find(p=>p.name===dv); if(!pv){ const part=findPart(dv); if(part){ part.fstype='LVM2_member'; pv={name:dv,vg:vg,psize:sizeToGB(part.size)}; lvm.pvs.push(pv);} else { err('  Device '+dv+' not found.'); return; } } pv.vg=vg; if(!g.pvs.includes(dv))g.pvs.push(dv); g.vsize+=pv.psize; g.vfree+=pv.psize; }); ok('  Volume group "'+vg+'" successfully extended'); break; }
        case 'lvcreate': { const vg=args[args.length-1]; if(!args.length){ err('lvcreate: uso: lvcreate -n <nombre> -L <tamaño> <vg>'); break; } const g=vgByName(vg); if(!g){err('lvcreate: grupo de volúmenes "'+vg+'" no encontrado. Uso: lvcreate -n datos -L 5G <vg>');break;} const ni=args.indexOf('-n'); const name=ni!==-1?args[ni+1]:'lvol0'; let size=0; const Li=args.indexOf('-L'); const li=args.indexOf('-l'); if(Li!==-1){ size=parseSizeG(args[Li+1]); } else if(li!==-1){ const ex=args[li+1]; const pm=String(ex).match(/(\d+)%/); if(/free/i.test(ex)){ size=pm?g.vfree*(parseInt(pm[1])/100):g.vfree; } else if(pm){ size=g.vsize*(parseInt(pm[1])/100); } } if(!size||size<=0){err('lvcreate: indica el tamaño con -L (p.ej. -L 5G) o -l (p.ej. -l 100%FREE)');break;} if(size>g.vfree+0.01){err('  Volume group "'+vg+'" has insufficient free space ('+fmtG(g.vfree)+' libres).');break;} if(lvm.lvs.find(l=>l.vg===vg&&l.name===name)){err('  Logical Volume "'+name+'" already exists in volume group "'+vg+'"');break;} lvm.lvs.push({name,vg,size,fstype:'',mount:''}); g.vfree-=size; ok('  Logical volume "'+name+'" created.'); break; }
        case 'lvextend': case 'lvresize': { const dev=args.find(a=>a.startsWith('/dev/')); const lv=dev?lvByDev(dev):null; if(!lv){err('lvextend: volumen lógico no encontrado. Uso: lvextend -L +2G /dev/vg0/datos  (añade -r para ampliar también el FS)');break;} const g=vgByName(lv.vg); const Li=args.indexOf('-L'); const li=args.indexOf('-l'); let add=0, setTo=null; if(Li!==-1){ const v=args[Li+1]; if(String(v).startsWith('+')) add=parseSizeG(v); else setTo=parseSizeG(v); } else if(li!==-1){ const ex=args[li+1]; const pm=String(ex).match(/(\d+)%/); if(/free/i.test(ex)) add=g.vfree*(pm?parseInt(pm[1])/100:1); } if(setTo!=null) add=setTo-lv.size; if(!add||add<=0){err('lvextend: indica cuánto ampliar, p.ej. -L +2G');break;} if(add>g.vfree+0.01){err('  Insufficient free space: necesitas '+fmtG(add)+' pero solo hay '+fmtG(g.vfree)+' libres en '+lv.vg+'.');break;} lv.size+=add; g.vfree-=add; ok('  Size of logical volume '+lv.vg+'/'+lv.name+' changed to '+fmtG(lv.size)+'.'); if(args.includes('-r')){ ok('  '+(lv.fstype==='ext4'?'resize2fs':'xfs_growfs')+': sistema de archivos ampliado a '+fmtG(lv.size)+'.'); } else { out('  Recuerda ampliar el sistema de archivos:  xfs_growfs '+(lv.mount||'<punto>')+'   o   resize2fs '+dev+'   (o usa  -r).','#a2957d'); } break; }
        case 'lvreduce': { const dev=args.find(a=>a.startsWith('/dev/')); const lv=dev?lvByDev(dev):null; if(!lv){err('lvreduce: volumen lógico no encontrado. Uso: lvreduce -r -L 4G /dev/vg0/datos');break;} const g=vgByName(lv.vg); const Li=args.indexOf('-L'); let sub=0,target=null; if(Li!==-1){ const v=args[Li+1]; if(String(v).startsWith('-')) sub=parseSizeG(v.slice(1)); else target=parseSizeG(v); } if(target!=null) sub=lv.size-target; if(!sub||sub<=0){err('lvreduce: indica el nuevo tamaño (-L 4G) o cuánto quitar (-L -2G)');break;} if(sub>=lv.size){err('lvreduce: el tamaño resultante no es válido');break;} if(args.includes('-r') && lv.fstype==='xfs'){ err('  XFS no permite reducir el sistema de archivos. En el examen se reduce sobre ext4 (o se recrea).'); break; } if(!args.includes('-r')&&!args.includes('-f')){ out('  WARNING: Reducir un volumen puede causar pérdida de datos. Añade -r para reducir también el FS.','#e0a458'); } lv.size-=sub; lv.reduced=true; if(g)g.vfree+=sub; ok('  Size of logical volume '+lv.vg+'/'+lv.name+' changed to '+fmtG(lv.size)+'.'); if(args.includes('-r')) ok('  resize2fs: sistema de archivos ('+(lv.fstype||'ext4')+') reducido a '+fmtG(lv.size)+'.'); break; }
        case 'lvremove': { const dev=args.find(a=>a.startsWith('/dev/')); const lv=dev?lvByDev(dev):null; if(!lv){err('lvremove: volumen no encontrado');break;} const g=vgByName(lv.vg); if(g)g.vfree+=lv.size; lvm.lvs.splice(lvm.lvs.indexOf(lv),1); ok('  Logical volume "'+lv.name+'" successfully removed'); break; }
        case 'vgremove': { const vg=args.find(a=>!a.startsWith('-')); if(!vg){ err('vgremove: falta el nombre del grupo de volúmenes'); break; } const g=vgByName(vg); if(!g){err('  Volume group "'+vg+'" not found');break;} lvm.lvs=lvm.lvs.filter(l=>l.vg!==vg); lvm.pvs.forEach(p=>{ if(p.vg===vg)p.vg=''; }); lvm.vgs.splice(lvm.vgs.indexOf(g),1); ok('  Volume group "'+vg+'" successfully removed'); break; }
        case 'pvremove': { const dev=args.find(a=>a.startsWith('/dev/')); if(!dev){ err('pvremove: uso: pvremove <dispositivo>'); break; } const i=lvm.pvs.findIndex(p=>p.name===dev); if(i===-1){err('  No PV label found on '+dev);break;} lvm.pvs.splice(i,1); const part=findPart(dev); if(part&&part.fstype==='LVM2_member')part.fstype=''; ok('  Labels on physical volume "'+dev+'" successfully wiped.'); break; }
        case 'xfs_growfs': ok('data blocks changed. Sistema de archivos XFS ampliado al tamaño del volumen.'); break;
        case 'resize2fs': ok('The filesystem is now larger. Sistema de archivos ext ampliado.'); break;
        case 'mkswap': { const dev=args.find(a=>a.startsWith('/dev/')); const p=dev?resolveDev(dev):null; if(!p){ err('mkswap: dispositivo no encontrado: '+(dev||'')); break; } if(p.mount){ err('mkswap: '+dev+' está en uso'); break; } p.fstype='swap'; p.uuid=Math.random().toString(16).slice(2,6)+'-'+Math.random().toString(16).slice(2,6); ok('Configurando espacio de intercambio versión 1, tamaño = '+(p.size||'?')+', UUID='+p.uuid); break; }
        case 'swapon': { if(args.includes('--show')||args.includes('-s')){ out('NAME           TYPE      SIZE USED PRIO'); lvm.lvs.forEach(l=>{ if(l.fstype==='swap') out((lvMapper(l)).padEnd(14)+' lvm       '+(Math.round(l.size)+'G').padStart(4)+' 0B   -2'); }); disks.forEach(d=>d.parts.forEach(p=>{ if(p.fstype==='swap'&&p.mount==='[SWAP]') out(('/dev/'+p.name).padEnd(14)+' partition '+String(p.size).padStart(4)+' 0B   -3'); })); } else { const dev=args.find(a=>a.startsWith('/dev/')); if(dev){ const p=resolveDev(dev); if(p&&p.fstype==='swap'){ p.mount='[SWAP]'; ok(''); } else err('swapon: '+dev+': No se pudo encontrar un espacio de intercambio (usa mkswap primero)'); } else ok(''); } break; }
        case 'getent': { const db=args[0]; const key=args[1]; if(!db){ err('getent: uso: getent <passwd|group|hosts> [clave]'); break; } if(db==='passwd'){ const u=users[key]; if(u) out(key+':x:'+u.uid+':'+u.gid+':'+key+':'+u.home+':'+(u.shell||'/bin/bash')); else if(!key){ Object.keys(users).forEach(k=>out(k+':x:'+users[k].uid+':'+users[k].gid+'::'+users[k].home+':'+(users[k].shell||'/bin/bash'))); } else {lastFail=true;lastStatus=2;} } else if(db==='group'){ const rows=groupRows(),matches=key?rows.filter(l=>l.startsWith(key+':')):rows; if(matches.length)matches.forEach(l=>out(l));else{lastFail=true;lastStatus=2;} } else if(db==='hosts'){ out('127.0.0.1       '+(key||'localhost')); } else out('getent: base de datos no soportada: '+db); break; }
        case 'curl': {const u=args.filter(a=>!a.startsWith('-')).pop()||'';let parsed;try{parsed=new URL(/^https?:\/\//.test(u)?u:'http://'+u);}catch(e){err('curl: (3) URL rejected: Malformed input');break;}const host=parsed.hostname,port=+(parsed.port||(parsed.protocol==='https:'?443:80));if(!['localhost','127.0.0.1','::1',localHostname(),net.eth0.ip].includes(host)&&!online()){err('curl: (7) Failed to connect: Network is unreachable');break;}const socket=portOpen(host,port);if(!socket){err('curl: (7) Failed to connect to '+host+' port '+port+': Connection refused');break;}if(socket.proc==='httpd'||socket.proc==='nginx'||socket.proc==='docker-proxy'){const hc=httpdCfg(),idx=getNode(hc.docroot.split('/').filter(Boolean).concat('index.html'));if(idx&&idx.type==='file')idx.content.split('\n').forEach(l=>out(l));else out('<!DOCTYPE html><html><body><h1>It works!</h1></body></html>');}else if(port===6443)out('{"kind":"Status","apiVersion":"v1","status":"Failure","message":"Unauthorized","reason":"Unauthorized","code":401}');else err('curl: (1) Received HTTP/0.9 when not allowed');break;}
        case 'wget': { const u=args.filter(a=>!a.startsWith('-')).pop()||''; if(!net.eth0.ip){ err('wget: no se pudo resolver «'+u+'» (La red es inaccesible)'); break; } out('--'+new Date().toISOString()+'--  '+u); out('Resolviendo... conectado.'); out('HTTP/1.1 200 OK'); ok('«'+(u.split('/').pop()||'index.html')+'» guardado'); break; }
        case 'tuned-adm': { if(args[0]==='active') out('Current active profile: '+tunedProfile); else if(args[0]==='list') outMany(['Available profiles:','- balanced','- powersave','- throughput-performance','- virtual-guest','- network-latency','Current active profile: '+tunedProfile]); else if(args[0]==='recommend'){ out('virtual-guest'); } else if(args[0]==='profile'){ const p=args[1]; if(!p){ err('tuned-adm: falta el perfil'); break; } tunedProfile=p; ok('perfil '+p+' activado.'); } else out('tuned-adm: usa active, list, recommend, profile <nombre>'); break; }

        case 'useradd': { const nm=args.filter(a=>!a.startsWith('-')).pop(); if(!nm){err('useradd: falta el nombre');break;} if(users[nm]){err('useradd: el usuario «'+nm+'» ya existe');break;} const gv=(f)=>{ const i=args.indexOf(f); return i!==-1?args[i+1]:null; }; const extra=(gv('-G')||'').split(',').filter(Boolean),missing=extra.filter(g=>!groupsDb.has(g)); if(missing.length){err('useradd: el grupo «'+missing[0]+'» no existe');break;} let uid=gv('-u')?parseInt(gv('-u')):nextUid++; if(uid>=nextUid)nextUid=uid+1; const shell=gv('-s')||'/bin/bash'; const nologin=/nologin|false/.test(shell); users[nm]={uid,gid:uid,home:'/home/'+nm,groups:[nm].concat(extra),shell}; groupsDb.add(nm); if(!args.includes('-M')&&!nologin){ getNode(['home']).children[nm]=dir({},{owner:nm,group:nm}); } rebuildPasswd(); rebuildGroup(); break; }
        case 'userdel': { const nm=args.filter(a=>!a.startsWith('-')).pop(); if(!users[nm]){err('userdel: no existe: '+nm);break;} if(nm==='root'||nm==='visitor'){err('userdel: no se puede borrar '+nm);break;} delete users[nm]; const home=getNode(['home']);if(home&&home.children&&args.includes('-r'))delete home.children[nm];if(!Object.values(users).some(u=>(u.groups||[]).includes(nm)))groupsDb.delete(nm);rebuildPasswd();rebuildGroup();break; }
        case 'usermod': { const nm=args[args.length-1]; if(!args.length||nm.startsWith('-')){ err('usermod: uso: usermod [-aG grupo | -G grupos | -L | -U] <usuario>'); break; } if(!users[nm]){err("usermod: el usuario '"+nm+"' no existe");break;} const ai=args.indexOf('-aG'); const Gi=args.indexOf('-G'),requested=(args[(ai!==-1?ai:Gi)+1]||'').split(',').filter(Boolean),missing=requested.filter(g=>!groupsDb.has(g));if((ai!==-1||Gi!==-1)&&missing.length){err('usermod: el grupo «'+missing[0]+'» no existe');break;} if(ai!==-1){requested.forEach(g=>{if(!users[nm].groups.includes(g))users[nm].groups.push(g);});}else if(Gi!==-1){users[nm].groups=[...new Set([nm,...requested])];}rebuildGroup();break; }
        case 'groupadd': { const g=args.filter(a=>!a.startsWith('-'))[0]; if(!g){err('groupadd: falta el nombre del grupo');break;} if(groupsDb.has(g)){err('groupadd: el grupo «'+g+'» ya existe');break;} groupsDb.add(g);rebuildGroup();break; }
        case 'passwd': { const nm=args.filter(a=>!a.startsWith('-'))[0]||currentUser; if(!users[nm]){err('passwd: el usuario '+nm+' no existe');break;} if(currentUser!=='root'&&nm!==currentUser){err('passwd: Sólo root puede cambiar la contraseña de otro usuario.');break;} out('Cambiando la contraseña del usuario '+nm+'.'); startInteractive('Nueva contraseña:', true, (p1)=>{ if(p1===''){ err('passwd: no se ha cambiado la contraseña.'); endInteractive(); return; } startInteractive('Vuelva a escribir la nueva contraseña:', true, (p2)=>{ endInteractive(); if(p1!==p2){ err('passwd: Lo sentimos, las contraseñas no coinciden.'); err('passwd: se ha agotado el número máximo de intentos de autenticación'); return; } users[nm].password=p1; ok('passwd: todos los tokens de autenticación se actualizaron correctamente.'); }); }); return; }
        case 'su': { const dash=args.includes('-'); const nm=args.filter(a=>a!=='-'&&!a.startsWith('-')).pop()||'root'; if(!users[nm]){err('su: el usuario '+nm+' no existe');break;} const doSwitch=()=>{ userStack.push({user:currentUser,cwd:cwd.slice()}); currentUser=nm; if(dash){ cwd=users[nm].home.split('/').filter(Boolean); } setPrompt(); }; if(users[nm].password && currentUser!=='root'){ startInteractive('Contraseña:', true, (pw)=>{ endInteractive(); if(pw===users[nm].password){ doSwitch(); } else { err('su: Fallo de autenticación'); } }); return; } doSwitch(); break; }
        case 'exit': case 'logout': { if(userStack.length){ const prev=userStack.pop(); currentUser=prev.user; cwd=prev.cwd; setPrompt(); } else out('(no hay sesión su que cerrar)','#a2957d'); break; }

        case 'ps': {
          const a=args.join(' ');
          if(/\baux\b/.test(a)||a.includes('-aux')) psAux();
          else if(a.includes('-e')||a.includes('-A')||a.includes('ef')||a.includes('-f')) psEf();
          else { out('    PID TTY          TIME CMD'); out('    888 pts/0    00:00:00 bash'); out('   '+(nextPid)+' pts/0    00:00:00 ps'); }
          break;
        }
        case 'top': pagerEnter(topLines(),'top',topLines);return;
        case 'pgrep': { const q=args[args.length-1]; processes.filter(p=>p.cmd.includes(q)).forEach(p=>out(String(p.pid))); break; }
        case 'sleep': { if(!args[0]||!/^[0-9]+(?:\.[0-9]+)?[smhd]?$/.test(args[0])){err('sleep: operando de tiempo no válido «'+(args[0]||'')+'»');break;}const m=args[0].match(/^([0-9.]+)([smhd]?)$/),factor={s:1000,m:60000,h:3600000,d:86400000}[m[2]||'s'],ms=parseFloat(m[1])*factor,pid=nextPid++;processes.push({pid,ppid:888,user:currentUser,cpu:0,mem:0.1,vsz:6200,rss:700,stat:'S+',start:new Date().toLocaleTimeString().slice(0,5),time:'0:00',cmd:'sleep '+args[0]});const timeout=setTimeout(()=>endForeground(0),ms);foregroundProcess={pid,cmd:'sleep '+args[0],timeout};promptEl.textContent='';input.value='';return; }
        case 'jobs': { jobs.forEach((j,i)=>out('['+j.id+']'+(i===jobs.length-1?'+':'-')+'  '+j.status.padEnd(9)+'              '+j.cmd)); break; }
        case 'disown': {const spec=(args[0]||'%'+(jobs[jobs.length-1]?.id||'')).replace(/^%/,'');const j=jobs.find(x=>String(x.id)===spec);if(!j){err('-bash: disown: '+(args[0]||'actual')+': no existe ese trabajo');break;}jobs.splice(jobs.indexOf(j),1);break;}
        case 'nohup': {if(!args.length){err('nohup: falta un operando');break;}out('nohup: se ignora la entrada y se añade la salida a ‘nohup.out’','#a2957d');const inner=args.join(' '),pid=nextPid++,job={id:nextJob++,pid,cmd:inner,status:'Running',user:currentUser,nohup:true};jobs.push(job);processes.push({pid,ppid:888,user:currentUser,cpu:0,mem:0.1,vsz:8200,rss:900,stat:'S',start:new Date().toLocaleTimeString().slice(0,5),time:'0:00',cmd:inner});out('['+job.id+'] '+pid);break;}
        case 'fg': case 'bg': { const spec=(args[0]||'%'+(jobs[jobs.length-1]?.id||'')).replace(/^%/,''); const job=jobs.find(j=>String(j.id)===spec); if(!job){err('bash: '+name+': '+(args[0]||'actual')+': no existe ese trabajo');break;} job.status='Running'; const proc=processes.find(p=>p.pid===job.pid);if(proc)proc.stat='S';out(job.cmd);if(name==='fg'){jobs.splice(jobs.indexOf(job),1);if(proc)processes.splice(processes.indexOf(proc),1);} break; }
        case 'wait': { const wanted=args[0]?(args[0].replace(/^%/,'')):null; const done=wanted?jobs.filter(j=>String(j.id)===wanted||String(j.pid)===wanted):jobs.slice(); if(wanted&&!done.length){err('bash: wait: «'+args[0]+'»: no es un pid o una especificación de trabajo');break;} done.forEach(j=>{const p=processes.findIndex(x=>x.pid===j.pid);if(p!==-1)processes.splice(p,1);const q=jobs.indexOf(j);if(q!==-1)jobs.splice(q,1);}); break; }
        case 'kill': { if(args.includes('-l')){out(' 1) SIGHUP  2) SIGINT  3) SIGQUIT  9) SIGKILL  15) SIGTERM  18) SIGCONT  19) SIGSTOP  20) SIGTSTP');break;} const sigArg=args.find(a=>/^-(?:[A-Za-z]+|\d+)$/.test(a))||'-TERM'; const sigName=sigArg.slice(1).toUpperCase().replace(/^SIG/,''); const sigMap={HUP:1,INT:2,QUIT:3,KILL:9,TERM:15,CONT:18,STOP:19,TSTP:20}; const sig=sigMap[sigName]||(+sigName||0); if(!sig){err('bash: kill: '+sigArg+': especificación de señal inválida');break;} const target=args.filter(a=>!a.startsWith('-')).pop(); const pid=+target; const idx=processes.findIndex(p=>p.pid===pid); if(idx===-1){err('bash: kill: ('+target+') - No existe el proceso');break;} const proc=processes[idx]; if(pid<=2||(currentUser!=='root'&&proc.user!==currentUser)){err('bash: kill: ('+pid+') - Operación no permitida');break;} const job=jobs.find(j=>j.pid===pid); if(sig===19||sig===20){proc.stat='T';if(job)job.status='Stopped';}else if(sig===18){proc.stat='S';if(job)job.status='Running';}else{processes.splice(idx,1);if(job)jobs.splice(jobs.indexOf(job),1);} break; }

        case 'systemctl': { const nf=args.filter(a=>!a.startsWith('-')); const sub=nf[0]; const svc=(nf[1]||'').replace('.service','');
          const rootSubs=['start','stop','restart','reload','enable','disable','mask','unmask','set-default','isolate','daemon-reload'];
          if(!args.includes('--user') && rootSubs.indexOf(sub)!==-1 && currentUser!=='root'){ err('Failed to '+sub+' '+svc+'.service: Access denied'); out('==== AUTHENTICATING FOR org.freedesktop.systemd1.manage-units ====','#a2957d'); err('Authentication is required to manage system services. (usa sudo o el usuario root)'); break; }
          if(args.includes('--user')){ const uunit=(nf[1]||'').replace('.service',''); const uhome=users[currentUser]?users[currentUser].home:'/root'; const ufile=getNode(norm(uhome+'/.config/systemd/user/'+uunit+'.service'));
            if(sub==='daemon-reload'){ ok(''); break; }
            if(sub==='status'){ const a=userUnits[currentUser]&&userUnits[currentUser][uunit]; out('\u25cf '+uunit+'.service - Podman '+uunit, a&&a.active?'#8fa876':undefined); out('   Loaded: '+(ufile?'loaded ('+uhome+'/.config/systemd/user/'+uunit+'.service; '+(a&&a.enabled?'enabled':'disabled')+')':'not-found')); out('   Active: '+(a&&a.active?'active (running)':'inactive (dead)'), a&&a.active?'#8fa876':'#a2957d'); break; }
            if(sub==='enable'||sub==='start'||sub==='restart'){ if(!ufile){ err('Failed to enable unit: Unit '+uunit+'.service does not exist (mueve el .service a ~/.config/systemd/user/).'); break; } userUnits[currentUser]=userUnits[currentUser]||{}; userUnits[currentUser][uunit]={enabled:sub==='enable',active:true}; ok(''); break; }
            if(sub==='disable'||sub==='stop'){ if(userUnits[currentUser]&&userUnits[currentUser][uunit]){ if(sub==='stop')userUnits[currentUser][uunit].active=false; else userUnits[currentUser][uunit].enabled=false; } ok(''); break; }
            out('systemctl --user: usa daemon-reload | enable --now UNIDAD | status | stop'); break;
          }
          const missing=(action)=>{err('Failed to '+action+' '+svc+'.service: Unit '+svc+'.service not found.',4);};
          const activate=()=>{if(!unitExists(svc)){missing('start');return false;}if(svc==='httpd'){const hc=httpdCfg(),dr=getNode(hc.docroot.split('/').filter(Boolean));if(!dr){failService('httpd','DocumentRoot '+hc.docroot+' does not exist');err('Job for httpd.service failed: DocumentRoot '+hc.docroot+' no existe.');return false;}if(selinux.mode==='Enforcing'&&!(selinux.httpPorts||[80,443,8080]).includes(hc.port)){avcAudit('name_bind',hc.port);failService('httpd','AVC denied { name_bind } for port='+hc.port);err('Job for httpd.service failed because the control process exited with error code.');err('AVC: denied { name_bind } for port='+hc.port+' comm="httpd" scontext=system_u:system_r:httpd_t:s0 tclass=tcp_socket');return false;}}if(svc==='docker'){const cfgError=dockerConfigError();if(cfgError){failService('docker',cfgError);err('Job for docker.service failed because the control process exited with error code.');out('See "systemctl status docker.service" and "journalctl -xeu docker.service" for details.','#a2957d');return false;}}if(!services[svc])services[svc]={enabled:false,active:false,pid:null};if(svc==='sshd')applySshd();if(svc==='docker'&&services.containerd)services.containerd.active=true;if(!services[svc].active){services[svc].active=true;services[svc].failed=false;services[svc].result='success';services[svc].error='';services[svc].pid=nextPid++;if(svc==='httpd')services[svc].port=httpdCfg().port;processes.push({pid:services[svc].pid,ppid:1,user:'root',cpu:0.1,mem:0.5,vsz:120000,rss:9000,stat:'Ss',start:new Date().toLocaleTimeString().slice(0,5),time:'0:00',cmd:'/usr/sbin/'+svc});journalAdd(svc,'Started '+svc+'.');}return true;};
          if(sub==='status'){if(!unitExists(svc)){err('Unit '+svc+'.service could not be found.',4);break;}const s=services[svc]||{};const active=!!s.active,failed=!!s.failed;out('\u25cf '+svc+'.service - '+svc,active?'#8fa876':failed?'#ef8a7a':undefined);out('   Loaded: loaded ('+(getNode(['etc','systemd','system',svc+'.service'])?'/etc/systemd/system/':'/usr/lib/systemd/system/')+svc+'.service; '+(s.enabled?'enabled':'disabled')+'; preset: disabled)');out('   Active: '+(failed?'failed (Result: '+(s.result||'exit-code')+')':active?'active (running)':'inactive (dead)')+(active?' since '+new Date().toLocaleTimeString():''),active?'#8fa876':failed?'#ef8a7a':'#a2957d');if(active&&s.pid)out('   Main PID: '+s.pid+' ('+svc+')');if(failed){const exec=svc==='docker'?'/usr/bin/dockerd -H fd://':'/usr/sbin/'+svc+' -DFOREGROUND';out('  Process: '+(s.pid||nextPid)+' ExecStart='+exec+' (code=exited, status='+(s.exitStatus||1)+'/FAILURE)');out('     Error: '+s.error,'#ef8a7a');lastFail=true;lastStatus=3;}}
          else if(sub==='cat'){const uf=unitFile(svc);if(!uf||uf.type!=='file'){err('No files found for '+svc+'.service.',1);break;}out('# '+(getNode(['etc','systemd','system',svc+'.service'])?'/etc':'/usr/lib')+'/systemd/system/'+svc+'.service','#a2957d');uf.content.split('\n').forEach(l=>out(l));}
          else if(sub==='show'){if(!unitExists(svc)){out('Id='+svc+'.service');out('LoadState=not-found');out('ActiveState=inactive');out('SubState=dead');lastFail=true;lastStatus=1;break;}const s=services[svc]||{};out('Id='+svc+'.service');out('LoadState=loaded');out('ActiveState='+(s.failed?'failed':s.active?'active':'inactive'));out('SubState='+(s.active?'running':s.failed?'failed':'dead'));out('Result='+(s.result||'success'));out('MainPID='+(s.pid||0));out('ExecMainStatus='+(s.exitStatus||0));}
          else if(sub==='daemon-reload'||sub==='daemon-reexec'){ ok(''); }
          else if(sub==='start'){activate();}
          else if(sub==='stop'){if(!unitExists(svc)){missing('stop');break;}const s=services[svc];if(s){s.active=false;if(s.pid)processes=processes.filter(p=>p.pid!==s.pid);s.pid=null;journalAdd(svc,'Stopped '+svc+'.');}}
          else if(sub==='enable'||sub==='disable'){if(!unitExists(svc)){missing(sub);break;}if(!services[svc])services[svc]={active:false,pid:null};services[svc].enabled=sub==='enable';if(args.includes('--now')){if(sub==='enable'){if(!activate())break;}else if(services[svc].active){if(services[svc].pid)processes=processes.filter(p=>p.pid!==services[svc].pid);services[svc].active=false;services[svc].pid=null;journalAdd(svc,'Stopped '+svc+'.');}}if(sub==='enable')ok('Created symlink /etc/systemd/system/multi-user.target.wants/'+svc+'.service → /usr/lib/systemd/system/'+svc+'.service.');else ok('Removed /etc/systemd/system/multi-user.target.wants/'+svc+'.service.');}
          else if(sub==='restart'){if(!unitExists(svc)){missing('restart');break;}if(services[svc]&&services[svc].active)journalAdd(svc,'Stopped '+svc+'.');if(services[svc])services[svc].active=false;activate();}
          else if(sub==='reload'){if(!unitExists(svc)){missing('reload');break;}if(!services[svc]||!services[svc].active){err('Unit '+svc+'.service is not running, cannot reload.');break;}if(svc==='sshd')applySshd();journalAdd(svc,'Reloaded '+svc+'.');}
          else if(sub==='get-default'){ out(defaultTarget); }
          else if(sub==='set-default'){ const tg=nf[1]; if(tg){ defaultTarget=tg.includes('.target')?tg:tg+'.target'; ok('Removed /etc/systemd/system/default.target.'); ok('Created symlink /etc/systemd/system/default.target → /usr/lib/systemd/system/'+defaultTarget+'.'); } else err('systemctl: falta el target (p.ej. multi-user.target)'); }
          else if(sub==='isolate'){ ok('cambiado al target '+(nf[1]||'')+'.'); }
          else if(sub==='list-units'){out('UNIT                      LOAD   ACTIVE SUB     DESCRIPTION');unitNames().filter(s=>services[s]&&services[s].active).forEach(s=>out((s+'.service').padEnd(26)+' loaded active running '+s));}
          else if(sub==='list-unit-files'){out('UNIT FILE'.padEnd(32)+'STATE');unitNames().forEach(s=>out((s+'.service').padEnd(32)+((services[s]&&services[s].enabled)?'enabled':'disabled')));}
          else if(sub==='is-active'){if(!unitExists(svc)){out('unknown');lastFail=true;lastStatus=4;break;}const active=services[svc]&&services[svc].active;out(active?'active':'inactive');if(!active){lastFail=true;lastStatus=3;}}
          else if(sub==='is-enabled'){if(!unitExists(svc)){err('Failed to get unit file state for '+svc+'.service: No such file or directory',1);break;}const enabled=services[svc]&&services[svc].enabled;out(enabled?'enabled':'disabled');if(!enabled){lastFail=true;lastStatus=1;}}
          else if(sub==='reset-failed'){if(svc){if(!unitExists(svc)){err('Failed to reset failed state of unit '+svc+'.service: Unit '+svc+'.service not loaded.');break;}if(services[svc]){services[svc].failed=false;services[svc].result='success';services[svc].error='';}}else Object.values(services).forEach(s=>{s.failed=false;s.result='success';s.error='';});}
          else out('systemctl: usa status/start/stop/enable/disable/restart/get-default/set-default/isolate <servicio|target>'); break;
        }
        case 'journalctl': {const ui=args.indexOf('-u'),xeu=args.find(a=>a.startsWith('-')&&a.includes('u'));const u=ui!==-1?(args[ui+1]||'').replace('.service',''):(xeu&&args[args.indexOf(xeu)+1]?(args[args.indexOf(xeu)+1]||'').replace('.service',''):null),fol=args.includes('-f'),pi=args.indexOf('-p'),prio=pi!==-1?args[pi+1]:null,bi=args.indexOf('-b'),bootArg=bi!==-1?(args[bi+1]&&!args[bi+1].startsWith('-')?args[bi+1]:'0'):null;if(args.includes('--list-boots')){bootHistory.forEach((b,i)=>out(String(i-bootHistory.length).padStart(3)+' '+b.id+' '+new Date(b.start).toString().slice(0,24)+'—'+new Date(b.end).toString().slice(0,24)));out('  0 '+bootId+' '+new Date(bootStartedAt).toString().slice(0,24)+'—'+new Date().toString().slice(0,24));break;}let selectedBoot=null;if(bootArg&&bootArg!=='0'){if(/^-[0-9]+$/.test(bootArg)){const n=Math.abs(parseInt(bootArg));selectedBoot=bootHistory[bootHistory.length-n]?.id;}else selectedBoot=bootArg;}else if(bootArg==='0')selectedBoot=bootId;out('-- Journal begins at '+new Date((journal[0]&&journal[0].ts)||bootStartedAt).toString().slice(0,24)+(bootArg!==null?', boot '+bootArg:'')+'. --');const maxPrio=prio&&/^(err|3)$/.test(prio)?3:7;const rows=journal.filter(e=>(!u||e.unit===u||e.message.startsWith(u+'.service'))&&e.priority<=maxPrio&&(!selectedBoot||e.bootId===selectedBoot));rows.slice(-(args.includes('-n')?(parseInt(args[args.indexOf('-n')+1])||10):30)).forEach(e=>out((e.time||new Date(e.ts||Date.now()).toLocaleTimeString())+' '+localHostname()+' '+e.unit+'['+(e.unit==='systemd'?1:nextPid)+']: '+e.message,e.priority<=3?'#ef8a7a':undefined));if(!rows.length)out('-- No entries --','#a2957d');if(fol)startFollow(k=>new Date().toLocaleTimeString()+' '+localHostname()+' '+(u||'systemd')+'['+nextPid+']: '+['petición atendida','conexión cerrada','heartbeat','recarga de configuración'][k%4]);break;}
        case 'ausearch': {const n=getNode(['var','log','audit','audit.log']),rows=n&&n.type==='file'?n.content.split('\n').filter(Boolean):[],wantAvc=args.includes('AVC')||args.includes('avc')||args.includes('-m');const selected=wantAvc?rows.filter(l=>/type=AVC/.test(l)):rows;if(!selected.length){out('<no matches>');lastFail=true;lastStatus=1;}else selected.slice(-25).forEach(l=>out('----\n'+l,l.includes('denied')?'#ef8a7a':undefined));break;}
        case 'sealert': {const n=getNode(['var','log','audit','audit.log']),rows=n&&n.type==='file'?n.content.split('\n').filter(l=>/type=AVC/.test(l)):[];if(!rows.length){out('100% done\nfound 0 alerts in '+(args[args.length-1]||'/var/log/audit/audit.log'));break;}const last=rows[rows.length-1],port=(last.match(/dest=(\d+)/)||[])[1]||'<puerto>';out('SELinux está evitando que httpd use la capacidad name_bind sobre el puerto '+port+'.','#ef8a7a');out('*****  Plugin bind_ports (92.2 confidence) sugiere  ********************');out('Si quieres permitir que httpd escuche en ese puerto, ejecuta:');out('  semanage port -a -t http_port_t -p tcp '+port,'#8fa876');out('Después reinicia el servicio y comprueba journalctl -u httpd.','#a2957d');break;}
        case 'systemd-analyze': {if(args[0]!=='verify'){out('systemd-analyze: usa verify FICHERO.service');break;}const target=args.filter(a=>!a.startsWith('-')&&a!=='verify')[0],n=target?getNode(norm(target)):null;if(!n||n.type!=='file'){err('Failed to open '+(target||'')+': No such file or directory');break;}const errors=[];if(!/^\[Unit\]/m.test(n.content))errors.push('Missing [Unit] section');if(!/^\[Service\]/m.test(n.content))errors.push('Missing [Service] section');if(!/^ExecStart=/m.test(n.content))errors.push('Service has no ExecStart= setting');const bad=n.content.match(/^([A-Za-z][A-Za-z0-9]+)\s+(.+)$/m);if(bad)errors.push('Unknown key name \''+bad[1]+'\' in section');if(errors.length){errors.forEach(e=>err((target||'unit')+': '+e));lastStatus=1;lastFail=true;}else out((target||'unit')+': OK','#8fa876');break;}
        case 'logger': { const ti=args.indexOf('-t'); const tagL=ti!==-1?args[ti+1]:currentUser; const msg=args.filter((a,idx)=>!a.startsWith('-')&&idx!==(ti!==-1?ti+1:-1)).join(' ')||''; const lf=getNode(['var','log','messages']); if(lf&&lf.type==='file'){ lf.content+='\n'+new Date().toLocaleTimeString()+' '+localHostname()+' '+tagL+'['+(500+((Math.random()*99)|0))+']: '+msg; }journalAdd(tagL,msg,6);break; }
        case 'ssh': {
          const rest=args.filter(x=>!x.startsWith('-')); const pIdx=args.indexOf('-p'); const port=pIdx!==-1?args[pIdx+1]:'22';
          let tgt=rest.find(x=>x!==port); if(!tgt){ out('usage: ssh [-p puerto] [-i clave] [usuario@]host'); break; }
          let user=currentUser, host=tgt; if(tgt.includes('@')){ const q=tgt.split('@'); user=q[0]||currentUser; host=q[1]; }
          const own=['localhost','127.0.0.1','::1',localHostname(),net.eth0.ip];
          const isOwn=own.includes(host);
          const hostsMap=(()=>{ const m={}; const hf=getNode(['etc','hosts']); if(hf&&hf.type==='file') hf.content.split('\n').forEach(l=>{ l=l.trim(); if(!l||l[0]==='#')return; const c=l.split(/\s+/); for(let z=1;z<c.length;z++) m[c[z]]=c[0]; }); return m; })(); if(!isOwn){ const dstIp = isIP(host)?host:(hostsMap[host]||null); if(!dstIp){ err('ssh: Could not resolve hostname '+host+': Name or service not known'); break; } if(!linkUp()||!net.eth0.ip){ err('ssh: connect to host '+host+' port '+port+': Network is unreachable'); break; } if(!sameSubnet(dstIp) && !online()){ err('ssh: connect to host '+host+' port '+port+': Network is unreachable'); break; } const reachable = !!labHosts[host] || Object.values(labHosts).some(x=>x.ip===dstIp) || dstIp===net.eth0.ip; if(!reachable){ err('ssh: connect to host '+host+' port '+port+': No route to host'); break; } }
          const home=users[currentUser]?users[currentUser].home:'/root';
          const sshDir=()=>{ const seg=norm(home+'/.ssh'); let d=getNode(seg); if(!d){ const par=getParent(seg); if(par&&par.type==='dir'){ par.children['.ssh']=dir({},{owner:currentUser,group:currentUser}); } d=getNode(seg); } return d; };
          const khNode=()=>{ const d=sshDir(); if(!d) return null; return d.children['known_hosts']||(d.children['known_hosts']=file('',{mode:'rw-r--r--',owner:currentUser,group:currentUser})); };
          const kh=getNode(norm(home+'/.ssh/known_hosts'));
          const known = kh && kh.type==='file' && kh.content.split('\n').some(l=>l.split(' ')[0]===host);
          const havePriv=getNode(norm(home+'/.ssh/id_rsa'));
          const pub=getNode(norm(home+'/.ssh/id_rsa.pub'));
          const lab = labHosts[host];
          const keyAuth = (isOwn && havePriv && pub && (()=>{ const th=(users[user]?users[user].home:('/home/'+user)); const ak=getNode(norm(th+'/.ssh/authorized_keys')); return ak && ak.type==='file' && ak.content.includes((pub.content||'').slice(0,40)); })()) || (!!lab && !!pub && !!lab.authKeys && lab.authKeys.includes((pub.content||'').slice(0,40)));
          const finish=()=>{
            if(isOwn){
              if(!users[user]){ err('Permission denied (publickey,password).'); return; }
              if(user==='root' && (sshdCfg.permitRoot==='no'||sshdCfg.permitRoot==='prohibit-password') && !keyAuth){ err('root@'+host+': Permission denied (PermitRootLogin '+sshdCfg.permitRoot+' en /etc/ssh/sshd_config).'); return; }
              out('Last login: '+new Date().toString().slice(0,24)+' from 192.168.1.50','#a2957d');
              userStack.push(currentUser); currentUser=user; cwd=(users[user]?users[user].home:'/home/'+user).split('/').filter(Boolean); setPrompt();
              out('(sesión SSH abierta en tu propia máquina — escribe  exit  para cerrarla)','#a2957d'); save();
            } else if(lab){ enterRemote(host, user); }
            else { err('ssh: connect to host '+host+' port '+port+': No route to host'); }
          };
          const authenticate=()=>{ if(keyAuth){ out('Authenticated with partial success (publickey).','#a2957d'); finish(); return; }
            startInteractive(user+'@'+host+"'s password: ", true, (pw)=>{ endInteractive(); if(isOwn){ if(users[user] && users[user].password===pw){ finish(); } else { out('Permission denied, please try again.','#ef8a7a'); } } else if(lab){ if(pw===lab.pass){ finish(); } else { out('Permission denied, please try again.','#ef8a7a'); } } else { finish(); } });
          };
          if(!known){ const shownIp=isOwn?(net.eth0.ip||'127.0.0.1'):(isIP(host)?host:(hostsMap[host]||net.eth0.ip)); out("The authenticity of host '"+host+" ("+shownIp+")' can't be established."); out('ED25519 key fingerprint is SHA256:'+Math.random().toString(36).slice(2,13)+Math.random().toString(36).slice(2,13)+'.'); out('This key is not known by any other names.'); startInteractive('Are you sure you want to continue connecting (yes/no/[fingerprint])? ', false, (ans)=>{ endInteractive(); if(/^y(es)?$/i.test((ans||'').trim())){ const n=khNode(); if(n) n.content+=(n.content?'\n':'')+host+' ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA'; out("Warning: Permanently added '"+host+"' (ED25519) to the list of known hosts.",'#a2957d'); authenticate(); } else { out('Host key verification failed.','#ef8a7a'); } }); }
          else { authenticate(); }
          return;
        }
        case 'ssh-keygen': {
          const home=users[currentUser]?users[currentUser].home:'/root';
          const mk=(path,pass)=>{ const parts=path.split('/'); const fn=parts.pop(); const dseg=norm(parts.join('/')||'/'); let d=getNode(dseg); if(!d){ const par=getParent(dseg); if(par&&par.type==='dir'){ par.children[dseg[dseg.length-1]]=dir({},{owner:currentUser,group:currentUser}); } d=getNode(dseg); } if(d&&d.type==='dir'){ d.children[fn]=file('-----BEGIN OPENSSH PRIVATE KEY-----\n'+(pass?'(clave cifrada con passphrase)':'(clave sin passphrase)')+'\n-----END OPENSSH PRIVATE KEY-----',{mode:'rw-------',owner:currentUser,group:currentUser}); d.children[fn+'.pub']=file('ssh-ed25519 AAAAC3NzaC1lZDI1NTE5'+Math.random().toString(36).slice(2,14)+' '+currentUser+'@s2ktux',{mode:'rw-r--r--',owner:currentUser,group:currentUser}); } };
          startInteractive('Enter file in which to save the key ('+home+'/.ssh/id_rsa): ', false, (f)=>{ endInteractive(); const path=((f||'').trim()||home+'/.ssh/id_rsa');
            startInteractive('Enter passphrase (empty for no passphrase): ', true, (p1)=>{ endInteractive();
              startInteractive('Enter same passphrase again: ', true, (p2)=>{ endInteractive(); if(p1!==p2){ err('Passphrases do not match.  Try again.'); return; } out('Generating public/private ed25519 key pair.'); mk(path,p1); out('Your identification has been saved in '+path); out('Your public key has been saved in '+path+'.pub'); out('The key fingerprint is:'); out('SHA256:'+Math.random().toString(36).slice(2,16)+' '+currentUser+'@s2ktux'); out("The key's randomart image is:"); out('+--[ED25519 256]--+'); out('|      .o+=*.      |'); out('|       o.=.o      |'); out('|        + o .     |'); out('|       .S* .      |'); out('|       o=B o      |'); out('+----[SHA256]-----+'); ok('Par de claves generado.'); save(); });
            });
          });
          return;
        }
        case 'ssh-copy-id': {
          const rest=args.filter(x=>!x.startsWith('-')); const tgt=rest[0]; if(!tgt){ out('usage: ssh-copy-id [-i clave] [usuario@]host'); break; }
          let user=currentUser, host=tgt; if(tgt.includes('@')){ const q=tgt.split('@'); user=q[0]||currentUser; host=q[1]; }
          const home=users[currentUser]?users[currentUser].home:'/root';
          const pub=getNode(norm(home+'/.ssh/id_rsa.pub'));
          if(!pub){ err('ERROR: No identities found. Genera una clave primero con  ssh-keygen.'); break; }
          const own=['localhost','127.0.0.1','::1','s2ktux',net.eth0.ip];
          out('/usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: "'+home+'/.ssh/id_rsa.pub"');
          out('/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed');
          startInteractive(user+'@'+host+"'s password: ", true, (pw)=>{ endInteractive();
            const lab=labHosts[host]; if(own.includes(host)){ if(!users[user]||users[user].password!==pw){ err('Permission denied, please try again.'); return; } const th=users[user].home; const seg=norm(th+'/.ssh'); let d=getNode(seg); if(!d){ const par=getParent(seg); if(par&&par.type==='dir'){ par.children['.ssh']=dir({},{owner:user,group:user}); } d=getNode(seg); } if(d&&d.type==='dir'){ const ak=d.children['authorized_keys']||(d.children['authorized_keys']=file('',{mode:'rw-------',owner:user,group:user})); ak.content+=(ak.content?'\n':'')+pub.content; } } else if(lab){ if(pw!==lab.pass){ err('Permission denied, please try again.'); return; } lab.authKeys+=(lab.authKeys?'\n':'')+pub.content; }
            out('/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed');
            out('Number of key(s) added: 1'); out(''); out('Now try logging into the machine, with:   "ssh '+tgt+'"'); out('and check to make sure that only the key(s) you wanted were added.','#a2957d'); save();
          });
          return;
        }
        case 'scp': { const a2=args.filter(x=>!x.startsWith('-')); if(a2.length<2){ out('usage: scp [-r] origen [usuario@]host:/ruta'); break; } const src=a2[0], dst=a2[a2.length-1]; const rmt=dst.includes(':')?dst:(src.includes(':')?src:null); if(rmt){ const hp=rmt.split(':'); let hn=hp[0]; if(hn.includes('@')) hn=hn.split('@')[1]; const lab=labHosts[hn]; if(lab){ if(dst.includes(':')){ const local=getNode(norm(src)); const rpath=hp[1]||('/home/'+lab.user+'/'+src.split('/').pop()); lab.files[rpath]=local&&local.type==='file'?local.content:''; out(src.split('/').pop()+'                      100%  '+((local&&local.content)?local.content.length:0)+'     1.2KB/s   00:00'); ok('copiado a '+hn+':'+rpath); } else { const rpath=hp[1]; const c=lab.files[rpath]; if(c==null){ err('scp: '+rpath+': No such file or directory'); break; } const seg=norm(dst); const par=getParent(seg); const fn=seg[seg.length-1]; if(par&&par.type==='dir'){ par.children[fn]=file(c,{owner:currentUser,group:currentUser}); } out(rpath.split('/').pop()+'                      100%  '+c.length+'     1.1KB/s   00:00'); ok('copiado desde '+hn); } } else { out('ssh: Could not resolve hostname '+hn,'#ef8a7a'); } } else { ok(src+' -> '+dst+'  (100%)  copia local.'); } break; }
        case 'nice': { const c=args.filter(a=>!a.startsWith('-')); out('(sandbox) ejecutaría con prioridad ajustada: '+(c.join(' ')||'<comando>')); break; }
        case 'renice': { ok('proceso reajustado de prioridad (nice) '+(args.join(' '))+'.'); break; }
        case 'chronyc': { const s=args[0]; if(s==='sources'||!s){ out('MS Name/IP address         Stratum Poll Reach LastRx Last sample'); out('^* ntp1.s2ktux.local             2   6   377    23   +0.000012s'); } else if(s==='tracking'){ out('Reference ID    : C0A80101 (ntp1.s2ktux.local)'); out('Stratum         : 3'); out('System time     : 0.000001 seconds slow of NTP time'); } else ok(''); break; }

        case 'dnf': { const sub=args.find(a=>!a.startsWith('-')); const subIndex=args.indexOf(sub); const pkgs=args.slice(subIndex+1).filter(a=>!a.startsWith('-'));
          const netOps=['install','remove','update','upgrade','search','info','list','provides','group','check-update','reinstall','downgrade','makecache'];
          if(netOps.indexOf(sub)!==-1 && !net.eth0.ip){ err('Error: Failed to download metadata for repo \'baseos\': Cannot prepare internal mirrorlist: Curl error (6): Could not resolve host: mirrors.rockylinux.org'); break; }
          if(sub==='install'||sub==='upgrade'||sub==='update'||sub==='search'||sub==='list'||sub==='info'){ const rd=getNode(['etc','yum.repos.d']); let enabledOk=false; if(rd&&rd.type==='dir'){ Object.keys(rd.children).forEach(fn=>{ const f=rd.children[fn]; if(!f||f.type!=='file')return; f.content.split(/\n\s*\n/).forEach(block=>{ if(/^\s*\[/.test(block) && /enabled\s*=\s*1/.test(block)){ if(!/gpgcheck\s*=\s*1/.test(block) || /gpgkey\s*=/.test(block)) enabledOk=true; } }); }); } if(!enabledOk){ err('Error: There are no enabled repos.'); out(' Run "dnf repolist all" to see the repos you have.','#a2957d'); break; } }
          if(sub==='install'){ if(!pkgs.length){err('dnf: falta el paquete');break;} out('Última comprobación de metadatos hecha hace 0:01:12 atrás el '+new Date().toString().slice(0,21)+'.'); const needsDockerRepo=pkgs.some(p=>DOCKER_PACKAGES.includes(p)); if(needsDockerRepo&&!dockerRepoConfigured()){pkgs.filter(p=>DOCKER_PACKAGES.includes(p)).forEach(p=>err('No match for argument: '+p));err('Error: Unable to find a match: '+pkgs.filter(p=>DOCKER_PACKAGES.includes(p)).join(' '));break;} const bad=pkgs.filter(p=>!REPO.has(p)&&!installed.has(p)); if(bad.length){ bad.forEach(p=>err('No match for argument: '+p)); err('Error: Unable to find a match: '+bad.join(' ')); break; } const yes=pkgs.filter(p=>installed.has(p)); const todo=pkgs.filter(p=>!installed.has(p)); yes.forEach(p=>out('El paquete '+p+'-'+packageVersion(p)+'.x86_64 ya está instalado.')); if(!todo.length){ ok('Dependencias resueltas.'); out('Nada que hacer.'); ok('¡Listo!'); break; }
            out('Dependencias resueltas.'); out('================================================================================'); out(' Paquete'.padEnd(24)+'Arq.'.padEnd(9)+'Versión'.padEnd(18)+'Repositorio'.padEnd(15)+'Tam.'); out('================================================================================'); out('Instalando:'); todo.forEach(p=>out(' '+p.padEnd(22)+' x86_64   '+packageVersion(p).padEnd(16)+' '+(DOCKER_PACKAGES.includes(p)?'docker-ce-stable':'rocky-baseos').padEnd(17)+'  1.2 M')); out(''); out('Resumen de la transacción'); out('================================================================================'); out('Instalar  '+todo.length+' Paquete'+(todo.length>1?'s':'')); out(''); out('Tamaño total de la descarga: '+(todo.length*1.2).toFixed(1)+' M'); out('Tamaño instalado: '+(todo.length*3.4).toFixed(1)+' M');
            const perform=()=>{ const seq=['Descargando paquetes:']; seq.push('--------------------------------------------------------------------------------'); seq.push('Total'.padEnd(50)+'3.4 MB/s | '+(todo.length*1.2).toFixed(1)+' MB  00:0'+Math.max(1,todo.length)); seq.push('Ejecutando comprobación de la transacción'); seq.push('Transacción verificada.'); seq.push('Ejecutando prueba de transacción'); seq.push('La prueba de transacción tuvo éxito.'); seq.push('Ejecutando transacción'); let st=1; const tot=todo.length*2+1; seq.push(('  Preparando           :').padEnd(40)+' '+st+'/'+tot); todo.forEach(p=>seq.push(('  Instalando           : '+p+'-'+packageVersion(p)).padEnd(52)+' '+(++st)+'/'+tot)); todo.forEach(p=>seq.push(('  Comprobando          : '+p+'-'+packageVersion(p)).padEnd(52)+' '+(++st)+'/'+tot)); runCommandSeq(seq, ()=>{ todo.forEach(p=>{ installed.add(p); if(svcForPkg[p]&&!services[svcForPkg[p]]) services[svcForPkg[p]]={enabled:false,active:false}; }); finalizeDockerInstall(); out(''); out('Instalado:','#8fa876'); todo.forEach(p=>out('  '+p+'-'+packageVersion(p)+'.x86_64')); out(''); ok('¡Listo!'); }); };
            if(args.includes('-y')||args.includes('--assumeyes')){ out(''); perform(); }
            else { startInteractive('¿Está de acuerdo con esto? [s/N]: ', false, (r)=>{ endInteractive(); const a=(r||'').trim().toLowerCase(); if(a==='s'||a==='si'||a==='sí'||a==='y'||a==='yes'){ perform(); } else { out('La operación fue cancelada.'); } }); }
          }
          else if(sub==='remove'){if(!pkgs.length){err('dnf: falta el paquete');break;}const present=pkgs.filter(p=>installed.has(p));pkgs.filter(p=>!installed.has(p)).forEach(p=>out('No match for argument: '+p));if(!present.length){out('No packages marked for removal.');out('Dependencies resolved.');out('Nothing to do.');ok('Complete!');break;}present.forEach(p=>installed.delete(p));finalizeDockerInstall();out('Eliminado:','#8fa876');present.forEach(p=>out('  '+p+'-'+packageVersion(p)+'.x86_64'));out('');ok('¡Listo!');}
          else if(sub==='config-manager'){ const u=args.find(a=>a.startsWith('http')||a.startsWith('file')); if(u&&/download\.docker\.com\/linux\/centos\/docker-ce\.repo/.test(u)){configureDockerRepo();ok('Adding repo from: '+u);break;} const nm=(u?u.split('/').filter(Boolean).pop():'nuevo').replace(/[^a-z0-9]/gi,'')||'repo'; let d=getNode(['etc','yum.repos.d']); if(!d){ const e=getNode(['etc']); if(e&&e.type==='dir'){ e.children['yum.repos.d']=dir({},{owner:'root'}); d=getNode(['etc','yum.repos.d']); } } if(d&&d.type==='dir'){ d.children[nm+'.repo']=file('['+nm+']\nname='+nm+'\nbaseurl='+(u||'file:///mnt')+'\nenabled=1\ngpgcheck=0',{owner:'root'}); } ok('Repositorio añadido en /etc/yum.repos.d/'+nm+'.repo'); }
          else if(sub==='search'){ const q=pkgs[0]||''; const hits=[...REPO].filter(p=>p.includes(q)); if(hits.length){ out('====== Coincidencias: '+q+' ======'); hits.slice(0,12).forEach(p=>out(p+'.x86_64 : paquete '+p)); } else out('No se encontró: '+q); }
          else if(sub==='info'){ const p=pkgs[0]; if(!REPO.has(p)&&!installed.has(p)){err('No matching packages to list');break;} out('Name         : '+p); out('Version      : 1.0'); out('Release      : 1.el9'); out('Architecture : '+ARCH); out('Repository   : '+(installed.has(p)?'@System':'rocky-baseos')); out('Summary      : paquete '+p); }
          else if(sub==='list'){ const which=args[1]; if(which==='installed'){ out('Installed Packages'); [...installed].sort().forEach(p=>out((p+'.'+ARCH).padEnd(30)+' 1.0-1.el9'.padEnd(16)+' @System')); } else if(which==='available'){ out('Available Packages'); [...REPO].sort().slice(0,20).forEach(p=>out((p+'.'+ARCH).padEnd(30)+' 1.0-1.el9'.padEnd(16)+' rocky-baseos')); } else { out('usa: dnf list installed | available'); } }
          else if(sub==='update'||sub==='upgrade'){ out('Última comprobación de metadatos hecha hace 0:00:03 atrás el '+new Date().toString().slice(0,21)+'.');
            if(dnfUpdated){ ok('Dependencias resueltas.'); out('Nada que hacer.'); ok('¡Listo!'); break; }
            const ups=['kernel','systemd','glibc','openssl','sudo','dnf','python3','vim-enhanced','NetworkManager','firewalld','tzdata','ca-certificates','bash','coreutils']; out('Dependencias resueltas.'); out('================================================================================'); out(' Paquete'.padEnd(22)+'Arq.'.padEnd(8)+'Versión'.padEnd(16)+'Repositorio'.padEnd(14)+'Tam.'); out('================================================================================'); out('Actualizando:'); ups.forEach(p=>out(' '+p.padEnd(20)+' '+ARCH.padEnd(8)+'1.0-2.el9'.padEnd(16)+' rocky-baseos'.padEnd(14)+'  '+(1+Math.floor(Math.random()*8))+'.'+Math.floor(Math.random()*9)+' M')); out(''); out('Resumen de la transacción'); out('================================================================================'); out('Actualizar  '+ups.length+' Paquetes'); out(''); out('Tamaño total de la descarga: 78 M');
            const perform=()=>{ const seq=['Descargando paquetes:','--------------------------------------------------------------------------------','Total'.padEnd(50)+'9.6 MB/s |  78 MB  00:08','Ejecutando comprobación de la transacción','Transacción verificada.','Ejecutando prueba de transacción','La prueba de transacción tuvo éxito.','Ejecutando transacción']; let st=1; const tot=ups.length*2+2; seq.push('  Preparando           :'.padEnd(40)+' '+st+'/'+tot); ups.forEach(p=>seq.push(('  Actualizando         : '+p+'-1.0-2.el9').padEnd(46)+' '+(++st)+'/'+tot)); ups.forEach(p=>seq.push(('  Limpiando            : '+p+'-1.0-1.el9').padEnd(46)+' '+(++st)+'/'+tot)); seq.push(('  Ejecutando scriptlet : kernel-'+KERNEL).padEnd(46)+' '+(++st)+'/'+tot); runCommandSeq(seq, ()=>{ out(''); out('Actualizado:','#8fa876'); ups.forEach(p=>out('  '+p+'-1.0-2.el9.'+ARCH)); out(''); ok('¡Listo!'); dnfUpdated=true; }); };
            if(args.includes('-y')||args.includes('--assumeyes')){ out(''); perform(); }
            else { startInteractive('¿Está de acuerdo con esto? [s/N]: ', false, (r)=>{ endInteractive(); const a=(r||'').trim().toLowerCase(); if(a==='s'||a==='si'||a==='sí'||a==='y'||a==='yes'){ perform(); } else { out('La operación fue cancelada.'); } }); }
          }
          else if(sub==='repolist'){ out('repo id                 repo name'); if(dockerRepoConfigured())out('docker-ce-stable        Docker CE Stable - '+ARCH); out('baseos                  '+DISTRO+' '+RELEASE+' - BaseOS'); out('appstream               '+DISTRO+' '+RELEASE+' - AppStream'); }
          else if(sub==='provides'){ out('/usr/bin/'+(pkgs[0]||'x')+' : perteneceria a un paquete del repo'); }
          else if(sub==='clean'){ const all=args.includes('all'); if(dnfCache>0){ out((dnfCache)+' files removed'); dnfCache=0; } else { out('0 files removed'); } if(!all&&!args.length) out('dnf clean: indica qué limpiar (all, metadata, packages, dbcache)'); }
          else if(sub==='makecache'){ out((DISTRO+' '+RELEASE+' - BaseOS').padEnd(48)+' 3.1 MB/s | 2.8 MB     00:00'); out((DISTRO+' '+RELEASE+' - AppStream').padEnd(48)+' 5.4 MB/s | 8.4 MB     00:01'); dnfCache=46; ok('Metadata cache created.'); }
          else out('dnf: usa install/remove/search/info/list/update/repolist/provides/clean/makecache'); break;
        }
        case 'yum': out("yum es un alias de compatibilidad en "+DISTRO+" 9. Usa 'dnf' para gestionar paquetes.", '#eab86a'); break;
        case 'apt': case 'apt-get': case 'dpkg': case 'aptitude': out('-bash: '+name+': orden no encontrada','#ef8a7a'); out('Esto es '+OS_NAME+'. Usa  dnf  (o rpm) para gestionar paquetes.','#a2957d'); break;
        case '__apt_old': { const sub=args[0]; const pkg=args[1]; if(sub==='install'){ out('Reading package lists... Done'); out('Building dependency tree... Done'); if(pkg){ ok('Setting up '+pkg+' ...'); installed.add(pkg);} } else if(sub==='update'){ ok('Reading package lists... Done'); } else if(sub==='remove'){ installed.delete(pkg); ok(pkg+' removed.'); } else out('apt: usa install/update/remove <paquete>'); break; }
        case 'rpm': { const has=(f)=>args.includes(f); const pkg=args.filter(a=>!a.startsWith('-'))[0];
          if(has('-qa')){ [...installed].sort().forEach(p=>out(p+'-1.0-1.el9.'+ARCH)); }
          else if(has('-qf')){ const f=pkg||''; out('/'+f.replace(/^\//,'')+' pertenece a '+(f.includes('httpd')?'httpd':f.includes('ssh')?'openssh':'coreutils')+'-1.0-1.el9.'+ARCH); }
          else if(has('-ql')){ if(!pkg){ out('rpm: uso: rpm -ql <paquete>'); break; } if(!installed.has(pkg)){ out('el paquete '+pkg+' no está instalado'); break; } outMany(['/usr/bin/'+pkg,'/usr/lib/systemd/system/'+pkg+'.service','/etc/'+pkg,'/usr/share/doc/'+pkg,'/usr/share/man/man1/'+pkg+'.1.gz']); }
          else if(has('-qi')){ if(!pkg){ out('rpm: uso: rpm -qi <paquete>'); break; } if(!installed.has(pkg)){ out('el paquete '+pkg+' no está instalado'); break; } outMany(['Name        : '+pkg,'Version     : 1.0','Release     : 1.el9','Architecture: '+ARCH,'Install Date: '+new Date().toDateString(),'Group       : System Environment','Size        : 1245184','License     : GPLv2+','Signature   : RSA/SHA256','Source RPM  : '+pkg+'-1.0-1.el9.src.rpm','Summary     : paquete '+pkg]); }
          else if(has('-V')){ if(!pkg){ out('rpm: uso: rpm -V <paquete>'); break; } if(!installed.has(pkg)){ out('el paquete '+pkg+' no está instalado'); break; } /* sin salida = sin cambios, como en real */ }
          else if(has('-q')){ const queries=args.filter(a=>!a.startsWith('-'));if(!queries.length){out('rpm: uso: rpm -q <paquete>');break;}queries.forEach(p=>{if(installed.has(p))out(p+'-'+packageVersion(p)+'.x86_64');else err('el paquete '+p+' no está instalado');}); }
          else if(has('-ivh')||has('-Uvh')||has('-i')){ out('Verifying...                         ################################# [100%]'); out('Preparando...                        ################################# [100%]'); const nm=(pkg||'paquete').replace(/\.rpm$/,'').replace(/-1\.0.*/,''); installed.add(nm); out('Actualizando / instalando...'); out('   1:'+nm+'-1.0-1'.padEnd(30)+'################################# [100%]'); }
          else out('rpm: usa -qa · -q PAQ · -ql PAQ · -qf FICHERO · -qi PAQ · -V PAQ · -ivh FICHERO.rpm'); break; }

        case 'df': dfView(); break;
        case 'du': out('4.0K\t'+(args.filter(a=>!a.startsWith('-'))[0]||'.')); break;
        case 'lsblk': lsblkView(); break;
        case 'blkid': blkidView(); break;
        case 'fdisk': { if(args.includes('-l')){ const dv=args.find(a=>a.startsWith('/dev/')); if(dv){ const d=disks.find(x=>x.name===dv.replace('/dev/','')); if(!d){ err('fdisk: no se puede abrir '+dv+': No existe el fichero o el directorio'); break; } fdiskDisk(d); } else fdiskView(); break; } const dev=args.find(a=>a.startsWith('/dev/')); if(!dev){ out('fdisk: uso: fdisk -l [dispositivo]  |  fdisk /dev/sdX'); break; } const disk=disks.find(d=>d.name===dev.replace('/dev/','')); if(!disk){ err('fdisk: no se puede abrir '+dev+': No existe el fichero o el directorio'); break; } fdiskRepl(disk); return; }
        case 'parted': { const dev=args.find(a=>a.startsWith('/dev/')); const disk=dev?disks.find(d=>d.name===dev.replace('/dev/','')):null; if(!disk){err('parted: dispositivo no encontrado. Ej: parted /dev/sdb mklabel gpt');break;} const sub=args[args.indexOf(dev)+1];
          if(sub==='mklabel'||sub==='mktable'){ disk.labeled=true; ok('Información: tabla de particiones '+(args[args.indexOf(dev)+2]||'gpt')+' creada en /dev/'+disk.name+'.'); }
          else if(sub==='mkpart'){ if(!disk.labeled){err('Error: /dev/'+disk.name+' no tiene tabla de particiones. Usa mklabel gpt primero.');break;} const totalGB=sizeToGB(disk.size); const freeGB=totalGB-diskUsedGB(disk.parts); if(freeGB<=0.001){err('Error: no queda espacio libre en /dev/'+disk.name+'.');break;} const num=disk.parts.length+1; const fst=args.find(a=>['xfs','ext4','ext3','btrfs','linux-swap'].includes(a))||''; const szTok=args.find(a=>/^\+?\d+\s*[KMGTP]$/i.test(a)); let sz; if(szTok){ const reqGB=sizeToGB(szTok); if(reqGB>freeGB+0.001){ err('Error: el tamaño solicitado ('+szTok+') supera el espacio libre ('+gbToNice(freeGB)+') en /dev/'+disk.name+'.'); break; } sz=parseSize(szTok); } else { sz=gbToNice(freeGB); } disk.parts.push({name:disk.name+num, size:sz, fstype:'', uuid:'', mount:''}); ok('Información: partición /dev/'+disk.name+num+' ('+sz+') creada. Formatéala con mkfs.'+(fst||'xfs')+' /dev/'+disk.name+num+'.'); }
          else if(sub==='print'){ out('Model: Virtio Block Device'); out('Disk /dev/'+disk.name+': '+disk.size); out('Partition Table: '+(disk.labeled?'gpt':'unknown')); out(''); if(disk.parts.length){ out('Number  Size    File system  Name'); disk.parts.forEach((p,i)=>out(String(i+1).padEnd(8)+p.size.padEnd(8)+(p.fstype||'').padEnd(13)+'primary')); } }
          else if(sub==='rm'){ const idx=+args[args.indexOf(dev)+2]-1; if(disk.parts[idx]){ disk.parts.splice(idx,1); ok('partición eliminada.'); } else err('parted: número de partición no válido'); }
          else out('parted: usa mklabel gpt | mkpart primary xfs 0% 100% | print | rm N'); break;
        }
        case 'mount': { if(args.length===0){ mountView(); break; } const dev=args[0]; const mp=args[1]; const p=resolveDev(dev); if(!p){err('mount: dispositivo especial '+dev+' no existe');break;} if(!p.fstype){err('mount: tipo de sistema de archivos incorrecto en '+dev+' (formatéalo con mkfs primero)');break;} if(!mp){err('mount: falta el punto de montaje');break;} const seg=norm(mp); if(!getNode(seg)){ const par=getParent(seg); const nm=seg[seg.length-1]; if(par&&par.type==='dir') par.children[nm]=dir({},{owner:'root'}); } p.mount=mp; const mn=getNode(seg); if(mn&&mn.type==='dir'&&p.data){ mn.children=JSON.parse(JSON.stringify(p.data)); p.data=null; } break; }
        case 'umount': { const tgt=args[0]; if(!tgt){ err('umount: falta el argumento. Uso: umount <dispositivo|punto>'); break; } let done=false; const snap=(p)=>{ const mn=getNode(norm(p.mount)); if(mn&&mn.type==='dir'){ p.data=JSON.parse(JSON.stringify(mn.children||{})); mn.children={}; } }; disks.forEach(d=>d.parts.forEach(p=>{ if(('/dev/'+p.name)===tgt||p.mount===tgt){ snap(p); p.mount=''; done=true; } })); lvm.lvs.forEach(l=>{ if(lvMapper(l)===tgt||('/dev/'+l.vg+'/'+l.name)===tgt||l.mount===tgt){ snap(l); l.mount=''; done=true; } }); if(!done) err('umount: '+tgt+': no está montado'); break; }
        case 'pvs': { out('  PV         VG   Fmt  Attr PSize   PFree'); lvm.pvs.forEach(p=>{ const g=vgByName(p.vg); out('  '+p.name.replace('/dev/','').padEnd(10)+' '+(p.vg||'').padEnd(4)+' lvm2 '+(p.vg?'a--':'---')+'  '+fmtG(p.psize).padStart(7)+' '+fmtG(p.vg&&g?g.vfree:p.psize).padStart(7)); }); break; }
        case 'vgs': { out('  VG   #PV #LV #SN Attr   VSize   VFree'); lvm.vgs.forEach(g=>{ const nlv=lvm.lvs.filter(l=>l.vg===g.name).length; out('  '+g.name.padEnd(4)+' '+String(g.pvs.length).padStart(3)+' '+String(nlv).padStart(3)+'   0 wz--n- '+fmtG(g.vsize).padStart(7)+' '+fmtG(g.vfree).padStart(7)); }); break; }
        case 'lvs': { out('  LV   VG   Attr       LSize'); lvm.lvs.forEach(l=>{ out('  '+l.name.padEnd(4)+' '+l.vg.padEnd(4)+' -wi-ao---- '+fmtG(l.size).padStart(7)); }); break; }

        case 'ip': { if(!args.length){ out('Uso: ip [ OPCIONES ] OBJETO { COMMAND | help }'); out('donde  OBJETO := { link | address | route | neigh }','#a2957d'); break; } const sub=args[0];
          if(sub==='link'){ const set=args.indexOf('set'); if(set!==-1){ const dev=args[set+1]; const st=args[set+2]; if(dev==='eth0'){ net.eth0.up=(st==='up'); ok(''); } else err('ip: dispositivo '+dev+' no existe'); } else { out('1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536'); out('2: eth0: <BROADCAST,MULTICAST'+(net.eth0.up?',UP,LOWER_UP':'')+'> mtu 1500 state '+(net.eth0.up?'UP':'DOWN')); } }
          else if(sub==='route'||sub==='r'){ if(net.eth0.up){ if(net.eth0.gw) out('default via '+net.eth0.gw+' dev eth0 proto static metric 100'); out(net.eth0.ip.split('.').slice(0,3).join('.')+'.0/'+net.eth0.prefix+' dev eth0 proto kernel scope link src '+net.eth0.ip);(net.eth0.ip.replace(/\.\d+$/,'.0')+'/'+net.eth0.prefix+' dev eth0 proto kernel scope link src '+net.eth0.ip); } else out('(sin rutas — eth0 está DOWN)'); }
          else { out('1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536'); out('    inet 127.0.0.1/8 scope host lo'); out('2: eth0: <BROADCAST,MULTICAST'+(net.eth0.up?',UP,LOWER_UP':'')+'> mtu 1500 state '+(net.eth0.up?'UP':'DOWN')); out('    link/ether 52:54:00:ab:cd:ef'); if(net.eth0.up) out('    inet '+net.eth0.ip+'/'+net.eth0.prefix+' brd '+net.eth0.ip.replace(/\.\d+$/,'.255')+' scope global eth0'); else out('    (interfaz caída — sin IP activa)'); }
          break;
        }
        case 'ifup': if(args[0]==='eth0'){ net.eth0.up=true; ok('eth0 levantada.'); } break;
        case 'ifdown': if(args[0]==='eth0'){ net.eth0.up=false; ok('eth0 caída.'); } break;
        case 'ss': {out('Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port Process');listeningSockets().forEach(s=>out(s.proto.padEnd(6)+'LISTEN 0      128    '+(s.addr+':'+s.port).padEnd(20)+'0.0.0.0:*       '+(args.some(a=>a.includes('p'))?'users:(("'+s.proc+'",pid='+s.pid+',fd=3))':'')));break;}
        case 'lsof': {if(!args.some(a=>a.startsWith('-i'))){err('lsof: usa lsof -i[:PUERTO]');break;}const pm=args.join(' ').match(/-i(?::(\d+))?/),port=pm&&pm[1]?+pm[1]:null;out('COMMAND       PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME');listeningSockets().filter(s=>!port||s.port===port).forEach(s=>out(s.proc.padEnd(12)+String(s.pid).padEnd(4)+' root    3u  IPv4  19283      0t0  TCP *:'+s.port+' (LISTEN)'));break;}
        case 'nc': case 'ncat': {const host=args.filter(a=>!a.startsWith('-'))[0],port=+(args.filter(a=>!a.startsWith('-'))[1]||0);if(!host||!port){err('Ncat: falta host o puerto');break;}if(portOpen(host,port))out('Ncat: Connected to '+host+':'+port+'.','#8fa876');else err('Ncat: Connection refused.');break;}
        case 'dig': case 'host': case 'nslookup': {const q=args.filter(a=>!a.startsWith('-')&&a!=='short')[0];if(!q){err(name+': falta el nombre');break;}const hostsFile=getNode(['etc','hosts']);const hm=hostsFile&&hostsFile.content.split('\n').map(l=>l.trim().split(/\s+/)).find(x=>x.slice(1).includes(q));const known={localhost:'127.0.0.1',web1:'192.168.1.10',[localHostname()]:net.eth0.ip};const ip=known[q]||(hm&&hm[0]);if(!ip&&!dnsOk()){err(';; communications error to '+(net.eth0.dns||'127.0.0.1')+'#53: network unreachable');break;}if(!ip){out('** server can\'t find '+q+': NXDOMAIN');break;}if(args.includes('+short'))out(ip);else if(name==='host')out(q+' has address '+ip);else out('Server: '+(net.eth0.dns||'127.0.0.1')+'\nAddress: '+(net.eth0.dns||'127.0.0.1')+'#53\n\nName: '+q+'\nAddress: '+ip);break;}
        case 'ping': {
          const ci=args.indexOf('-c'), count=ci!==-1?Math.max(1,parseInt(args[ci+1])||0):null, pingOpts=o=>Object.assign({},o||{},count==null?{}:{count});
          const raw=args.filter(a=>!a.startsWith('-') && !/^\d+$/.test(a))[0]||'';
          if(!raw){ err('ping: falta el destino. Uso: ping <host|ip>'); break; }
          const RESP=new Set(['8.8.8.8','8.8.4.4','1.1.1.1','1.0.0.1','9.9.9.9','208.67.222.222']);
          const HOSTS={'localhost':'127.0.0.1','127.0.0.1':'127.0.0.1','web1':'192.168.1.10','s2ktux':(net.eth0.ip||'127.0.1.1')};
          const octetsOk=(s)=>/^\d{1,3}(\.\d{1,3}){3}$/.test(s) && s.split('.').every(o=>+o<=255);
          const looksDotted=/^\d{1,3}(\.\d{1,3}){3}$/.test(raw);
          let ip=null, label=raw;
          if(looksDotted){ if(!octetsOk(raw)){ err('ping: '+raw+': Nombre o servicio desconocido'); break; } ip=raw; }
          else if(HOSTS[raw]!==undefined){ ip=HOSTS[raw]; }
          else { if(!dnsOk()){ err('ping: '+raw+': Fallo temporal en la resolución del nombre'); break; } err('ping: '+raw+': Nombre o servicio desconocido'); break; }
          if(ip==='127.0.0.1'){ streamPing('127.0.0.1',pingOpts()); break; }
          if(!linkUp()){ err('ping: connect: La red es inaccesible'); break; }
          if(!net.eth0.ip){ err('ping: connect: La red es inaccesible'); break; }
          if(sameSubnet(ip)){ const alive=(ip==='192.168.1.10')||(ip===net.eth0.ip); streamPing(ip,pingOpts(alive?{}:{loss:true})); break; }
          if(!online()){ err('connect: La red es inaccesible'); break; }
          streamPing(ip,pingOpts(RESP.has(ip)?{internet:true}:{loss:true})); break; }
        case 'nmcli': { const e=net.eth0; const sub=args[0]||''; const two=(args[1]||'');
          if(sub==='' || sub==='general'){ out('STATE      CONNECTIVITY  WIFI-HW  WIFI     WWAN-HW  WWAN'); out((online()?'connected ':'disconnected')+'  '+(online()?'full         ':'none         ')+'  missing  enabled  missing  enabled'); break; }
          if(sub==='networking'){ if(two==='off'){ e.up=false; } else if(two==='on'){ e.up=true; } else out(e.up?'enabled':'disabled'); break; }
          if(sub==='dev'||sub==='device'){ out('DEVICE  TYPE      STATE                   CONNECTION'); out('eth0    ethernet  '+(e.up?'connected               eth0':'disconnected            --')); out('lo      loopback  connected (externally)  lo'); break; }
          if((sub==='con'||sub==='connection')){
            if(two==='up'){ e.up=true; ok('Conexión activada correctamente (dispositivo activo «eth0»).'); break; }
            if(two==='down'){ e.up=false; out('Conexión «eth0» desactivada correctamente.'); break; }
            if(two==='mod'||two==='modify'){ const m=cmd.match(/ipv4\.addresses\s+([0-9.]+)(?:\/(\d+))?/); if(m){ e.ip=m[1]; if(m[2])e.prefix=+m[2]; } const g=cmd.match(/ipv4\.gateway\s+([0-9.]+)/); if(g)e.gw=g[1]; const d=cmd.match(/ipv4\.dns\s+"?([0-9. ]+)"?/); if(d)e.dns=d[1].trim().split(/\s+/)[0]; if(/ipv4\.method\s+manual/.test(cmd))e.method='manual'; if(/ipv4\.method\s+auto/.test(cmd)){e.method='auto';} if(/ipv4\.gateway\s+""/.test(cmd))e.gw=''; if(/ipv4\.dns\s+""/.test(cmd))e.dns=''; out('Cambios guardados. Aplícalos con:  nmcli con up eth0'); break; }
            if(two==='show'||two===''){ const c3=args[2]; if(c3==='eth0'||c3==='--active'){ outMany(['connection.id:                          eth0','connection.type:                        802-3-ethernet','connection.interface-name:              eth0','connection.autoconnect:                 '+(e.autoconnect?'yes':'no'),'ipv4.method:                            '+e.method,'ipv4.addresses:                         '+e.ip+'/'+e.prefix,'ipv4.gateway:                           '+(e.gw||'--'),'ipv4.dns:                               '+(e.dns||'--'),'GENERAL.STATE:                          '+(e.up?'activated':'deactivated')]); break; } out('NAME  UUID                                  TYPE      DEVICE'); out('eth0  5f2a1b3c-7d8e-4f90-a1b2-c3d4e5f6a7b8  ethernet  '+(e.up?'eth0':'--')); break; }
          }
          out('nmcli: usa  general | networking | dev status | con show [eth0] | con mod eth0 ipv4.* | con up/down eth0'); break; }
        case 'nmtui': { nmtui(); return; }
        case 'firewall-cmd': { const perm=cmd.includes('--permanent'); const getV=(k)=>{ const m=cmd.match(new RegExp(k+'=([^ ]+)')); return m?m[1]:''; };
          if(cmd.includes('--state')){ out('running'); }
          else if(cmd.includes('--get-default-zone')){ out(fw.zone); }
          else if(cmd.includes('--get-zones')){ out('block dmz drop external home internal public trusted work'); }
          else if(cmd.includes('--get-active-zones')){ out(fw.zone); out('  interfaces: eth0'); }
          else if(cmd.includes('--list-services')){ out([...fw.services].join(' ')); }
          else if(cmd.includes('--list-ports')){ out([...fw.ports].join(' ')); }
          else if(cmd.includes('--list-all')){ outMany([fw.zone+' (active)','  target: default','  icmp-block-inversion: no','  interfaces: eth0','  sources: ','  services: '+[...fw.services].join(' '),'  ports: '+[...fw.ports].join(' '),'  protocols: ','  forward: yes','  masquerade: no','  forward-ports: ','  source-ports: ','  icmp-blocks: ','  rich rules: ']); }
          else if(cmd.includes('--add-service')){ fw.services.add(getV('--add-service')); ok('success'); }
          else if(cmd.includes('--remove-service')){ fw.services.delete(getV('--remove-service')); ok('success'); }
          else if(cmd.includes('--query-service')){ out(fw.services.has(getV('--query-service'))?'yes':'no'); }
          else if(cmd.includes('--add-port')){ fw.ports.add(getV('--add-port')); ok('success'); }
          else if(cmd.includes('--remove-port')){ fw.ports.delete(getV('--remove-port')); ok('success'); }
          else if(cmd.includes('--reload')||cmd.includes('--runtime-to-permanent')){ ok('success'); }
          else if(cmd.includes('--help')){ outMany(['Uso: firewall-cmd [OPCIONES]','  --state','  --get-default-zone | --get-zones | --get-active-zones','  --list-all | --list-services | --list-ports','  --add-service=NOMBRE [--permanent]','  --remove-service=NOMBRE','  --add-port=PUERTO/tcp','  --reload | --runtime-to-permanent']); }
          else out('firewall-cmd: prueba --state, --list-all, --add-service=http --permanent, --reload');
          if(perm && (cmd.includes('--add')||cmd.includes('--remove'))) out('(regla permanente — usa --reload para aplicarla ahora)','#a2957d');
          break; }

        case 'docker': case 'podman': { const engine=name; const sub=args[0];
          if((engine==='docker'&&MODE!=='docker')||(engine==='podman'&&MODE!=='linux')){err('-bash: '+engine+': orden no encontrada',127);break;}
          if(!commandAvailable(engine)){err('-bash: '+engine+': orden no encontrada',127);if(engine==='docker')out('Docker CLI no está instalada en este host. Instala docker-ce-cli desde la práctica guiada.','#a2957d');break;}
          if(engine==='docker'&&currentUser!=='root'&&!(users[currentUser]?.groups||[]).includes('docker')){err('permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: connect: permission denied');break;}
          if(engine==='docker'&&!(services.docker&&services.docker.active)&&!['version','--version','help','--help'].includes(sub)){err('Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?');break;}
          const findC=(ref)=>containers.find(c=>c.name===ref||c.id.startsWith(ref||'~'));
          const stopContainer=(c,exitCode=0,reason='exited')=>{c.running=false;c.paused=false;c.status=reason;c.exitCode=exitCode;c.finishedAt=Date.now();eventAdd('docker','die','container died',{id:c.id,name:c.name,exitCode});};
          const startContainer=(c)=>{c.running=true;c.paused=false;c.status='running';c.exitCode=0;c.oomKilled=false;c.startedAt=Date.now();eventAdd('docker','start','container started',{id:c.id,name:c.name});};
          const containerStatus=(c)=>c.paused?'Up 2 minutes (Paused)':c.running?'Up 2 minutes'+(c.health?' ('+c.health+')':''):'Exited ('+(c.exitCode==null?0:c.exitCode)+') '+(c.finishedAt?'a few seconds ago':'1 minute ago');
          if(!sub||sub==='--help'||sub==='help'){ outMany(['Uso:  '+engine+' [OPCIONES] COMANDO','','Gestión de contenedores e imágenes'+(engine==='podman'?' (rootless, sin daemon)':'')+'.','','Comandos comunes:','  run       Crea y arranca un contenedor desde una imagen','  ps        Lista contenedores (-a incluye los parados)','  images    Lista imágenes locales','  pull      Descarga una imagen de un registro','  build     Construye una imagen desde un Dockerfile','  exec      Ejecuta un comando dentro de un contenedor','  logs      Muestra los logs de un contenedor','  compose   Define y ejecuta apps multi-contenedor','',"Ejecuta '"+engine+" COMANDO --help' para más información."]); break; }
          if(sub==='ps'){ out('CONTAINER ID   IMAGE           COMMAND        STATUS                         PORTS                    NAMES'); const list=args.includes('-a')?containers:containers.filter(c=>c.running); if(!list.length){ break; } list.forEach(c=>out(c.id+'   '+c.image.padEnd(15)+' "'+(c.cmd||'/bin/sh').slice(0,12)+'"  '+containerStatus(c).padEnd(31)+' '+(c.ports||'').padEnd(24)+' '+c.name)); break; }
          if(sub==='images'||(sub==='image'&&args[1]==='ls')){ out('REPOSITORY                              TAG       IMAGE ID       SIZE'); images.forEach(i=>out(i.repo.padEnd(39)+' '+i.tag.padEnd(9)+' '+i.id+'   '+i.size)); break; }
          if(sub==='search'){ const q=args[1]||''; const cat={mariadb:['MariaDB is a community-developed fork of MySQL','5.1K','[OK]'],mysql:['MySQL open source relational database','14K','[OK]'],nginx:['Official build of Nginx','19K','[OK]'],httpd:['The Apache HTTP Server','4.5K','[OK]'],redis:['Redis in-memory data store','12K','[OK]'],postgres:['The PostgreSQL object-relational DB','13K','[OK]'],python:['Python programming language','9K','[OK]'],node:['Node.js JavaScript runtime','13K','[OK]'],ubuntu:['Ubuntu base image','17K','[OK]'],alpine:['A minimal image based on Alpine Linux','11K','[OK]']}; out('NAME'.padEnd(24)+'DESCRIPTION'.padEnd(46)+'STARS   OFFICIAL'); const keys=Object.keys(cat).filter(k=>k.includes(q)); if(!keys.length){ out('(sin resultados para "'+q+'")','#a2957d'); break; } keys.slice(0,8).forEach(k=>out(k.padEnd(24)+cat[k][0].slice(0,45).padEnd(46)+cat[k][1].padEnd(8)+cat[k][2])); break; }
          if(sub==='pull'){ let img=args.filter(a=>!a.startsWith('-')&&a!=='pull').pop()||'image'; const tag=img.includes(':')?img.split(':')[1]:'latest'; const repo=img.split(':')[0]; out('Trying to pull docker.io/library/'+repo+':'+tag+'...'); out('Getting image source signatures'); ['e2a8cd','7b41c9','c0ffee'].forEach(b=>out('Copying blob sha256:'+b+Math.random().toString(16).slice(2,10))); out('Copying config sha256:'+Math.random().toString(16).slice(2,14)); out('Writing manifest to image destination'); if(!images.find(i=>i.repo===repo&&i.tag===tag)) images.push({repo,tag,id:Math.random().toString(16).slice(2,14),size:(50+Math.floor(Math.random()*180))+'MB'}); ok('Status: Downloaded newer image for '+repo+':'+tag); break; }
          if(sub==='run'){ const has=(f)=>args.includes(f); const valOf=(...fs)=>{ for(const f of fs){ const i=args.indexOf(f); if(i!==-1&&args[i+1]) return args[i+1]; const eq=args.find(a=>a.startsWith(f+'=')); if(eq) return eq.split('=').slice(1).join('='); } return ''; };
            const detach=has('-d')||has('--detach'); const rm=has('--rm'); const it=has('-it')||has('-i')||has('-t');
            const nameV=valOf('--name'), portV=valOf('-p','--publish'), volV=valOf('-v','--volume'), envV=valOf('-e','--env'), restartV=valOf('--restart'), memV=valOf('-m','--memory'), cpuV=valOf('--cpus'), netV=valOf('--network','--net'), healthCmd=valOf('--health-cmd');
            if(nameV&&containers.some(c=>c.name===nameV)){err('docker: Error response from daemon: Conflict. The container name "/'+nameV+'" is already in use.');break;}
            if(portV){const pm=portV.match(/(?:[\d.]+:)?(\d+):(\d+)/),hostPort=pm&&+pm[1];if(hostPort&&listeningSockets().some(s=>s.port===hostPort)){err('docker: Error response from daemon: driver failed programming external connectivity: Bind for 0.0.0.0:'+hostPort+' failed: port is already allocated');break;}}
            const valueFlags=new Set(['--name','-p','--publish','-v','--volume','-e','--env','--restart','-m','--memory','--cpus','--network','--net','-w','--workdir','-u','--user','--health-cmd','--health-interval','--health-timeout','--health-retries']);let img='image',containerCmd=[];for(let i=1;i<args.length;i++){const a=args[i];if(a.startsWith('-')){if(valueFlags.has(a))i++;continue;}img=a;containerCmd=args.slice(i+1);break;}
            const repo=img.split(':')[0]; if(!images.find(i=>i.repo===repo)){ out('Unable to find image \''+img+'\' locally'); out((img.split(':')[1]||'latest')+': Pulling from library/'+repo); images.push({repo,tag:(img.split(':')[1]||'latest'),id:Math.random().toString(16).slice(2,14),size:'120MB'}); }
            const id=Math.random().toString(16).slice(2,14); const nm=nameV||(repo.replace(/[^a-z0-9]/gi,'_')+'_'+id.slice(0,4));
            const volumeName=volV&&volV.indexOf('/')!==0?volV.split(':')[0]:''; if(volumeName&&!dockerVolumes.some(v=>v.name===volumeName)) dockerVolumes.push({name:volumeName,driver:'local',data:{}});
            const c={id,image:img,cmd:containerCmd.join(' ')||'/bin/sh',running:true,paused:false,status:'running',exitCode:0,oomKilled:false,health:healthCmd?(/false|exit\s+1|fail/i.test(healthCmd)?'unhealthy':'healthy'):'',healthCmd,name:nm,ports:portV,restart:restartV||'no',mem:memV,cpus:cpuV,net:netV||'bridge',volume:volumeName,bind:volV&&volV.indexOf('/')===0?volV:'',rm,createdAt:Date.now(),startedAt:Date.now()}; containers.push(c);eventAdd('docker','create','container create',{id,name:nm,image:img});eventAdd('docker','start','container start',{id,name:nm});
            const cmdText=containerCmd.join(' '),vm=(cmdText.match(/--vm-bytes\s+([^\s]+)/)||[])[1],oom=!!(memV&&vm&&parseSizeG(vm)>parseSizeG(memV));
            if(repo==='hello-world'){ out(''); out('Hello from Docker!','#8fa876'); out('This message shows that your installation appears to be working correctly.'); stopContainer(c,0); }
            else if(oom){stopContainer(c,137,'oom-killed');c.oomKilled=true;c.error='Container killed by the OOM killer';journalAdd('docker','container '+nm+' ran out of memory and was killed',3);}
            else if(/(?:^|\s)(?:sh\s+-c\s+)?exit\s+(\d+)/.test(cmdText)){stopContainer(c,parseInt(RegExp.$1)||0);}
            if(detach){out(id);if(!c.running&&(c.restart==='always'||c.restart==='unless-stopped'||(c.restart==='on-failure'&&c.exitCode!==0)))setTimeout(()=>{if(!containers.includes(c))return;c.restartCount=(c.restartCount||0)+1;startContainer(c);eventAdd('docker','restart','restart policy activated',{id:c.id,name:c.name,count:c.restartCount});save();},700);}else if(it&&c.running&&(!containerCmd.length||['sh','bash','/bin/sh','/bin/bash'].includes(containerCmd[0]))){enterContainerShell(nm,img,'docker');return;}else if(repo!=='hello-world'){if(c.oomKilled)err('Killed',137);else if(cmdText)out(cmdText);if(c.running)stopContainer(c,0);if(rm)containers.splice(containers.indexOf(c),1);}break; }
          if(sub==='create'){ const nmeq=args.indexOf('--name'); const img=args.filter(a=>!a.startsWith('-')&&a!=='create'&&a!==(nmeq!==-1?args[nmeq+1]:'')).pop()||'image'; const id=Math.random().toString(16).slice(2,14); const nm=(nmeq!==-1?args[nmeq+1]:'')||('cont_'+id.slice(0,4)); containers.push({id,image:img,cmd:'/bin/sh',running:false,paused:false,status:'created',exitCode:0,oomKilled:false,name:nm,ports:'',restart:'no'}); out(id); break; }
          if(sub==='start'||sub==='stop'||sub==='restart'||sub==='pause'||sub==='unpause'||sub==='kill'||sub==='wait'){ const nm=args.filter(a=>!a.startsWith('-')).pop(); const c=findC(nm); if(!c){err('Error: No such container: '+nm);break;} if(sub==='wait'){out(String(c.exitCode==null?0:c.exitCode));break;}if(sub==='start'||sub==='restart')startContainer(c);else if(sub==='pause'){if(!c.running){err('Error response from daemon: container '+nm+' is not running');break;}c.paused=true;c.status='paused';}else if(sub==='unpause'){if(!c.paused){err('Error response from daemon: container '+nm+' is not paused');break;}c.paused=false;c.running=true;c.status='running';}else if(sub==='stop')stopContainer(c,0);else if(sub==='kill')stopContainer(c,137,'killed');eventAdd('docker',sub,'container '+sub,{id:c.id,name:c.name});out(nm); break; }
          if(sub==='events'){const rows=timeline.filter(e=>e.source==='docker');rows.slice(-30).forEach(e=>out(new Date(e.ts).toISOString()+' container '+e.type+' '+(e.data.id||'')+' (name='+(e.data.name||'')+')'));if(!rows.length)out('(sin eventos)','#a2957d');break;}
          if(sub==='rm'){ const force=args.includes('-f'); const nm=args.filter(a=>!a.startsWith('-')).pop(); const c=findC(nm); if(!c){err('Error: No such container: '+nm);break;} if(c.running&&!force){err('Error response from daemon: cannot remove a running container '+nm+' — detenlo o usa -f');break;} containers.splice(containers.indexOf(c),1); out(nm); break; }
          if(sub==='attach'){ const c=findC(args[args.length-1]); if(!c){err('Error: No such container: '+(args[args.length-1]||''));break;} if(!c.running){err('You cannot attach to a stopped container, start it first');break;} enterContainerShell(c.name,c.image,'docker');return; }
          if(sub==='exec'){const non=args.filter(a=>!a.startsWith('-')),ref=non[1],c=findC(ref);if(!c){err('Error response from daemon: No such container: '+(ref||''));break;}if(!c.running){err('Error response from daemon: container '+ref+' is not running');break;}const pos=args.indexOf(ref),inside=args.slice(pos+1);if(!inside.length){err('docker: "docker exec" requires at least 2 arguments');break;}if(['sh','bash','/bin/sh','/bin/bash'].includes(inside[0])){enterContainerShell(c.name,c.image,'docker');return;}const old=containerShell;containerShell={name:c.name,image:c.image,kind:'docker',cwd:'/'};containerDispatch(inside.join(' '),inside[0],inside.slice(1));containerShell=old;setPrompt();break;}
          if(sub==='logs'){ const c=findC(args.filter(a=>!a.startsWith('-')).pop());if(!c){err('Error response from daemon: No such container');break;}out(new Date(c.startedAt||c.createdAt||Date.now()).toISOString()+' [notice] container '+c.name+' started');if(c.oomKilled)out('fatal: memory allocation failed; process terminated by SIGKILL','#ef8a7a');else if(c.exitCode)out('process exited with status '+c.exitCode,'#ef8a7a');else out(new Date().toISOString()+' [info] '+c.image.split(':')[0]+' ready');if((args.includes('-f')||args.includes('--follow'))&&c.running)startFollow(k=>new Date().toISOString()+' '+c.name+' | '+['GET / 200','healthcheck '+(c.health||'ok'),'request completed','worker heartbeat'][k%4]);break; }
          if(sub==='inspect'){ const c=findC(args[args.length-1]); if(!c){err('Error: No such object: '+(args[args.length-1]||''));break;} const health=c.health?', "Health": { "Status": "'+c.health+'" }':'';outMany(['[ {','  "Id": "'+c.id+'",','  "Image": "'+c.image+'",','  "State": { "Status": "'+(c.paused?'paused':c.running?'running':c.status||'exited')+'", "Running": '+c.running+', "Paused": '+!!c.paused+', "OOMKilled": '+!!c.oomKilled+', "ExitCode": '+(c.exitCode||0)+health+' },','  "HostConfig": { "Memory": "'+(c.mem||'0')+'", "NanoCpus": "'+(c.cpus||'0')+'", "NetworkMode": "'+(c.net||'bridge')+'", "RestartPolicy": { "Name": "'+(c.restart||'no')+'" } },','  "Name": "/'+c.name+'"','} ]']); break; }
          if(sub==='top'){ out('UID    PID   PPID   C   STIME   TTY   TIME    CMD'); out('root   1     0      0   10:00   ?     0:00    /bin/sh'); break; }
          if(sub==='stats'){const statsLines=()=>{const rows=['CONTAINER   CPU %   MEM USAGE / LIMIT     MEM %   NET I/O       BLOCK I/O'];containers.filter(c=>c.running).forEach(c=>{const lim=c.mem||'512MiB';rows.push(c.name.slice(0,11).padEnd(11)+' '+(Math.random()*3).toFixed(2)+'%   '+(20+Math.floor(Math.random()*60))+'MiB / '+String(lim).padEnd(9)+' '+(Math.random()*15).toFixed(1)+'%   1.2kB / 800B   0B / 0B');});return rows;};if(args.includes('--no-stream'))statsLines().forEach(l=>out(l));else{pagerEnter(statsLines(),'docker stats',statsLines);return;}break;}
          if(sub==='update'){ const c=findC(args[args.length-1]); if(c){ const mi=args.indexOf('--memory'); if(mi!==-1)c.mem=args[mi+1]; const ci=args.indexOf('--cpus'); if(ci!==-1)c.cpus=args[ci+1]; out(c.name); } else err('Error: No such container'); break; }
          if(sub==='build'){ const ti=args.indexOf('-t'); const tag=ti!==-1?args[ti+1]:'imagen:latest'; out('STEP 1/5: FROM ubi9'); out('STEP 2/5: WORKDIR /app'); out('STEP 3/5: COPY . .'); out('STEP 4/5: RUN dnf install -y ...'); out('  --> Using cache'); out('STEP 5/5: CMD ["./app"]'); const repo=tag.split(':')[0]; const tg=tag.split(':')[1]||'latest'; images.push({repo,tag:tg,id:Math.random().toString(16).slice(2,14),size:'88MB'}); ok('Successfully tagged '+repo+':'+tg); break; }
          if(sub==='commit'){ const tag=args[args.length-1]||'nueva-imagen'; const repo=tag.split(':')[0]; images.push({repo,tag:(tag.split(':')[1]||'latest'),id:Math.random().toString(16).slice(2,14),size:'96MB'}); out('sha256:'+Math.random().toString(16).slice(2,20)); break; }
          if(sub==='tag'){ const src=images.find(i=>i.repo===(args[1]||'').split(':')[0]); if(args[2]){ const repo=args[2].split(':')[0]; images.push({repo,tag:(args[2].split(':')[1]||'latest'),id:(src?src.id:Math.random().toString(16).slice(2,14)),size:src?src.size:'100MB'}); } ok(''); break; }
          if(sub==='push'){ const ref=args[args.length-1]||'usuario/imagen'; out('The push refers to repository [docker.io/'+(ref.includes('/')?'':'library/')+ref.split(':')[0]+']'); ['a1b2c3','d4e5f6','7890ab'].forEach(l=>out(l+Math.random().toString(16).slice(2,6)+': Pushed')); out((ref.split(':')[1]||'latest')+': digest: sha256:'+Math.random().toString(16).slice(2,18)+' size: 1573'); break; }
          if(sub==='save'){ const oi=args.indexOf('-o'); const f=oi!==-1?args[oi+1]:'imagen.tar'; ok('imagen guardada en '+f+' (docker save, simulado).'); break; }
          if(sub==='load'){ const ii=args.indexOf('-i'); const f=ii!==-1?args[ii+1]:'imagen.tar'; out('Loaded image: imagen:latest'); ok('imagen cargada desde '+f+' (docker load, simulado).'); break; }
          if(sub==='history'){ out('IMAGE          CREATED       CREATED BY                     SIZE'); out('a1b2c3d4e5f6   2 days ago    CMD ["./app"]                  0B'); out('<missing>      2 days ago    COPY . /app                    12MB'); out('<missing>      3 days ago    RUN dnf install -y ...         76MB'); out('<missing>      3 days ago    FROM ubi9                      214MB'); break; }
          if(sub==='rmi'||(sub==='image'&&args[1]==='rm')){ const nm=(sub==='image'?args[2]:args[args.length-1])||''; const i=images.findIndex(im=>im.repo===nm.split(':')[0]||im.id.startsWith(nm)); if(i===-1){err('Error: No such image: '+nm);break;} images.splice(i,1); out('Untagged: '+nm); break; }
          if(sub==='cp'){ out((args[1]||'')+' -> '+(args[2]||'')); ok('copiado entre host y contenedor (simulado).'); break; }
          if(sub==='port'){ const c=findC(args[1]); out(c&&c.ports?c.ports:'(sin puertos publicados)'); break; }
          if(sub==='rename'){ const c=findC(args[1]); if(c){ c.name=args[2]; out(''); } else err('Error: No such container: '+(args[1]||'')); break; }
          if(sub==='network'){ const s2=args[1]; const target=args[args.length-1]; if(s2==='ls'){ out('NETWORK ID     NAME      DRIVER    SCOPE'); dockerNetworks.forEach(n=>out(n.id+'   '+n.name.padEnd(9)+' '+n.driver.padEnd(9)+' '+n.scope)); } else if(s2==='create'){ const di=args.indexOf('--driver'); const drv=di!==-1?args[di+1]:'bridge'; const nm=target; if(dockerNetworks.some(n=>n.name===nm)){ err('Error response from daemon: network with name '+nm+' already exists'); break; } const n={id:Math.random().toString(16).slice(2,14),name:nm,driver:drv,scope:'local'}; dockerNetworks.push(n); out(n.id); } else if(s2==='inspect'){ const n=dockerNetworks.find(n=>n.name===args[2]||n.id.startsWith(args[2]||'~')); if(!n){ err('Error: No such network: '+(args[2]||'')); break; } out('[ { "Name": "'+n.name+'", "Id": "'+n.id+'", "Driver": "'+n.driver+'", "Scope": "'+n.scope+'", "Containers": {} } ]'); } else if(s2==='rm'){ const i=dockerNetworks.findIndex(n=>n.name===args[2]||n.id.startsWith(args[2]||'~')); if(i<3){ err('Error response from daemon: '+(args[2]||'')+' is a pre-defined network and cannot be removed'); break; } if(i===-1){ err('Error response from daemon: network '+(args[2]||'')+' not found'); break; } out(dockerNetworks[i].name); dockerNetworks.splice(i,1); } else if(s2==='connect'||s2==='disconnect'){ const n=dockerNetworks.find(n=>n.name===args[2]); const c=findC(args[3]); if(!n||!c){ err('Error response from daemon: network or container not found'); break; } c.net=s2==='connect'?n.name:'bridge'; } else if(s2==='prune'){ const before=dockerNetworks.length; dockerNetworks=dockerNetworks.filter((n,i)=>i<3||containers.some(c=>c.net===n.name)); ok('Deleted Networks: '+(before-dockerNetworks.length)); } else out(engine+' network: usa ls | create | inspect | connect | disconnect | rm | prune'); break; }
          if(sub==='volume'){ const s2=args[1]; const target=args[2]; if(s2==='ls'){ out('DRIVER    VOLUME NAME'); dockerVolumes.forEach(v=>out(v.driver.padEnd(10)+v.name)); } else if(s2==='create'){ const nm=target||('volume_'+Math.random().toString(16).slice(2,8)); if(!dockerVolumes.some(v=>v.name===nm)) dockerVolumes.push({name:nm,driver:'local',data:{}}); out(nm); } else if(s2==='inspect'){ const v=dockerVolumes.find(v=>v.name===target); if(!v){ err('Error: No such volume: '+(target||'')); break; } out('[ { "CreatedAt": "'+new Date().toISOString()+'", "Driver": "local", "Mountpoint": "/var/lib/docker/volumes/'+v.name+'/_data", "Name": "'+v.name+'", "Scope": "local" } ]'); } else if(s2==='rm'){ const i=dockerVolumes.findIndex(v=>v.name===target); if(i===-1){ err('Error: No such volume: '+(target||'')); break; } dockerVolumes.splice(i,1); out(target); } else if(s2==='prune'){ const used=new Set(containers.map(c=>c.volume).filter(Boolean)); const old=dockerVolumes.length; dockerVolumes=dockerVolumes.filter(v=>used.has(v.name)); ok('Total reclaimed space: '+((old-dockerVolumes.length)*16)+'MB'); } else out(engine+' volume: usa ls | create NOMBRE | inspect NOMBRE | rm NOMBRE | prune'); break; }
          if(sub==='container'&&args[1]==='prune'){ const n=containers.filter(c=>!c.running).length; containers=containers.filter(c=>c.running); ok('Deleted Containers: '+n+'. Total reclaimed space: '+(n*12)+'MB'); break; }
          if(sub==='image'&&args[1]==='prune'){ ok('Total reclaimed space: 0B'); break; }
          if(sub==='system'){ if(args[1]==='df'){ out('TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE'); out('Images          '+images.length+'         '+images.length+'         420MB     120MB (28%)'); out('Containers      '+containers.length+'         '+containers.filter(c=>c.running).length+'         12MB      6MB (50%)'); out('Local Volumes   2         1         48MB      24MB (50%)'); } else if(args[1]==='prune'){ const n=containers.filter(c=>!c.running).length; containers=containers.filter(c=>c.running); ok('Total reclaimed space: '+(n*12+120)+'MB'); } else out(engine+' system: usa df | prune'); break; }
          if(sub==='prune'){ ok('Total reclaimed space: 0B'); break; }
          if(sub==='login'||sub==='logout'){ ok(sub==='login'?'Login Succeeded':'Removing login credentials for docker.io'); break; }
          if(sub==='version'||sub==='--version'){if(engine==='podman'){out('podman version 4.9.4');if(sub==='version')out('Version:      4.9.4\nAPI Version:  4.9.4\nGo Version:   go1.21.11\nOS/Arch:      linux/amd64');break;}out('Docker version '+DOCKER_VERSION+', build rocky-lab');if(sub==='version'&&services.docker&&services.docker.active){out('Server: Docker Engine - Community');out(' Engine: Version: '+DOCKER_VERSION+' · API version: 1.53 · Storage Driver: overlay2');}else if(sub==='version'){err('Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?');}break;}
          if(sub==='generate'&&args[1]==='systemd'){ const ni=args.indexOf('--name'); const nm=ni!==-1?args[ni+1]:(args.filter(a=>!a.startsWith('-')&&a!=='generate'&&a!=='systemd').pop()||''); const c=findC(nm); if(!nm){ err('Error: se requiere --name NOMBRE'); break; } const unit='container-'+nm+'.service'; const files=args.includes('--files'); if(files){ const seg=norm((cwd.join('/')?'/'+cwd.join('/'):'')+'/'+unit); const par=getParent(seg); if(par&&par.type==='dir') par.children[unit]=file('# '+unit+' - generado por Podman\n[Unit]\nDescription=Podman '+unit+'\nWants=network-online.target\n\n[Service]\nRestart=on-failure\nExecStartPre=/bin/rm -f %t/'+nm+'.pid\nExecStart=/usr/bin/podman run --cidfile=%t/'+nm+'.ctr-id --name '+nm+' '+(c&&c.ports?'-p '+c.ports+' ':'')+(c?c.image:'IMAGEN')+'\nExecStop=/usr/bin/podman stop --ignore --cidfile=%t/'+nm+'.ctr-id\nType=notify\n\n[Install]\nWantedBy=default.target',{owner:currentUser,group:currentUser}); out(unit); out('(fichero .service creado en '+ (cwd.join('/')?'/'+cwd.join('/'):'/') +')','#a2957d'); if(args.includes('--new')) out('(--new): recuerda eliminar el contenedor con  podman rm -f '+nm+'  para evitar conflictos','#a2957d'); } else { out('# '+unit+' (usa --files para escribir el fichero)'); } break; }
          if(sub==='info'){ outMany(['Client: '+engine,' Version: '+(engine==='podman'?'4.9.0':DOCKER_VERSION),'Server:',' Containers: '+containers.length,'  Running: '+containers.filter(c=>c.running).length,'  Stopped: '+containers.filter(c=>!c.running).length,' Images: '+images.length,' Storage Driver: overlay2',' Registries: registry.access.redhat.com, docker.io']); break; }
          if(sub==='compose'){ composeHandler(args.slice(1)); break; }
          out(engine+": '"+sub+"' no es un comando de "+engine+".  Prueba '"+engine+" --help'."); break;
        }
        case 'docker-compose': { composeHandler(args); break; }
        case 'jq': {if(args.includes('--version')){out('jq-1.6');break;}const non=args.filter(a=>!a.startsWith('-')),expr=non[0]||'.',path=non[1];if(!path){err('jq: error: no se recibió JSON por la entrada estándar ni se indicó un fichero',2);break;}const n=getNode(norm(path));if(!n||n.type!=='file'){err('jq: error: Could not open file '+path+': No such file or directory',2);break;}jqFilter((args.includes('-r')?['-r']:[]).concat(expr),n.content.split('\n')).forEach(l=>out(l));break;}
        case 'kubectl': {
          if(MODE!=='kubernetes'){ err('-bash: kubectl: orden no encontrada'); break; }
          let ns=k8s.namespace,all=false,scanEnd=args.indexOf('--');if(scanEnd===-1)scanEnd=args.length;
          for(let i=0;i<scanEnd;){const a=args[i];if(a==='-n'||a==='--namespace'){ns=args[i+1]||'default';const count=i+1<scanEnd?2:1;args.splice(i,count);scanEnd-=count;continue;}if(a.startsWith('--namespace=')){ns=a.slice('--namespace='.length)||'default';args.splice(i,1);scanEnd--;continue;}if(a==='-A'||a==='--all-namespaces'){all=true;args.splice(i,1);scanEnd--;continue;}i++;}
          const sub=args[0]||''; const rawRes=args[1]||''; const aliases={po:'pods',pod:'pods',pods:'pods',no:'nodes',node:'nodes',nodes:'nodes',deploy:'deployments',deployment:'deployments',deployments:'deployments',svc:'services',service:'services',services:'services',ep:'endpoints',endpoint:'endpoints',endpoints:'endpoints',ns:'namespaces',namespace:'namespaces',namespaces:'namespaces',cm:'configmaps',configmap:'configmaps',configmaps:'configmaps',secret:'secrets',secrets:'secrets',sa:'serviceaccounts',serviceaccount:'serviceaccounts',serviceaccounts:'serviceaccounts',role:'roles',roles:'roles',rolebinding:'rolebindings',rolebindings:'rolebindings',pv:'pvs',pvs:'pvs',pvc:'pvcs',pvcs:'pvcs',sc:'storageclasses',storageclass:'storageclasses',storageclasses:'storageclasses',ing:'ingresses',ingress:'ingresses',ingresses:'ingresses',netpol:'networkpolicies',networkpolicy:'networkpolicies',networkpolicies:'networkpolicies'};
          const res=aliases[rawRes]||rawRes;
          const val=(key,def='')=>{ const eq=args.find(a=>a.startsWith(key+'=')); if(eq)return eq.slice(key.length+1); const i=args.indexOf(key); return i!==-1?(args[i+1]||def):def; };
          const act=(a)=>{ if(!k8s.actions.includes(a))k8s.actions.push(a); };
          const arrFor=(r)=>({pods:k8s.pods,deployments:k8s.deployments,services:k8s.services,configmaps:k8s.configmaps,secrets:k8s.secrets,serviceaccounts:k8s.serviceaccounts,roles:k8s.roles,rolebindings:k8s.rolebindings,pvs:k8s.pvs,pvcs:k8s.pvcs,storageclasses:k8s.storageclasses,ingresses:k8s.ingresses,networkpolicies:k8s.networkpolicies}[r]);
          const namespaced=(a)=>all?a:a.filter(x=>(x.namespace||'default')===ns);
          const podReady=(p)=>p.status==='Running'&&String(p.ready||'').startsWith('1/');
          const deploymentPods=(d)=>{const owned=k8s.pods.filter(p=>p.namespace===d.namespace&&p.owner===d.name);return owned.length?owned:k8s.pods.filter(p=>p.namespace===d.namespace&&!p.owner&&p.name.startsWith(d.name+'-'));};
          const readyForDeployment=(d)=>deploymentPods(d).filter(podReady).length;
          const endpointsFor=(s)=>{const selector=Object.entries(s.selector||{});if(!selector.length)return s.name==='kubernetes'?['10.10.0.10:6443']:[];return k8s.pods.filter(p=>p.namespace===s.namespace&&podReady(p)&&selector.every(([k,v])=>(p.labels||{})[k]===v)).map(p=>p.ip+':'+String(s.port||'80/TCP').split('/')[0]);};
          const createPod=(nm,image,status='Pending',owner='',labels={})=>{ const p={name:nm,namespace:ns,image:image||'nginx:latest',status,ready:status==='Running'?'1/1':'0/1',restarts:0,node:'worker-1',ip:'<none>',owner,labels,createdAt:Date.now(),lastState:''};k8s.pods.push(p);k8s.events.push({reason:'Scheduled',object:'pod/'+nm,message:'Successfully assigned '+ns+'/'+nm+' to worker-1'});eventAdd('kubernetes','scheduled','Pod scheduled',{pod:nm,namespace:ns,node:'worker-1'});if(status!=='Running'){setTimeout(()=>{if(!k8s.pods.includes(p))return;p.status='ContainerCreating';k8s.events.push({reason:'Pulling',object:'pod/'+nm,message:'Pulling image "'+p.image+'"'});save();},260);setTimeout(()=>{if(!k8s.pods.includes(p))return;p.ip='10.244.1.'+(k8s.nextIp++);if(/missing|notfound|does-not-exist/i.test(p.image)){p.status='ErrImagePull';p.ready='0/1';p.lastState='Waiting: ErrImagePull';k8s.events.push({reason:'Failed',object:'pod/'+nm,message:'Failed to pull image "'+p.image+'": manifest unknown'});eventAdd('kubernetes','image-pull-failed','Image pull failed',{pod:nm,image:p.image});setTimeout(()=>{if(!k8s.pods.includes(p))return;p.status='ImagePullBackOff';p.lastState='Waiting: ImagePullBackOff';p.restarts=0;k8s.events.push({reason:'BackOff',object:'pod/'+nm,message:'Back-off pulling image "'+p.image+'"'});save();},650);}else{p.status='Running';p.ready='1/1';k8s.events.push({reason:'Started',object:'pod/'+nm,message:'Started container '+nm});eventAdd('kubernetes','reconcile','Pod became Running',{pod:nm,namespace:ns});if(/broken|crash/i.test(p.image)){setTimeout(()=>{if(!k8s.pods.includes(p))return;p.status='CrashLoopBackOff';p.ready='0/1';p.restarts=(p.restarts||0)+1;p.lastState='Terminated: Error (exit code 1)';k8s.events.push({reason:'BackOff',object:'pod/'+nm,message:'Back-off restarting failed container '+nm});eventAdd('kubernetes','container-crash','Container entered CrashLoopBackOff',{pod:nm,image:p.image});save();},500);}}save();},900);}return p; };
          if(!sub||sub==='help'||sub==='--help'){ outMany(['kubectl controls the Kubernetes cluster manager.','','Basic Commands:','  create · run · expose · set · get · edit · delete','Deploy Commands:','  rollout · scale · autoscale','Cluster Management:','  cluster-info · cordon · drain · uncordon · taint','Troubleshooting:','  describe · logs · exec · top · events','','Use "kubectl <command> --help" for more information.']); break; }
          if(sub==='version'){ out('Client Version: '+K8S_FULL); out('Kustomize Version: v5.7.1'); out('Server Version: '+K8S_FULL); act('version'); break; }
          if(sub==='cluster-info'){ out('Kubernetes control plane is running at https://10.10.0.10:6443','#8fa876'); out('CoreDNS is running at https://10.10.0.10:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy'); act('cluster-info'); break; }
          if(sub==='get'){
            if(res==='nodes'){ out('NAME'.padEnd(18)+'STATUS'.padEnd(12)+'ROLES'.padEnd(18)+'AGE   VERSION'); k8s.nodes.forEach(n=>out(n.name.padEnd(18)+n.status.padEnd(12)+n.role.padEnd(18)+'12d   '+n.version)); act('get-nodes'); break; }
            if(res==='namespaces'){ out('NAME'.padEnd(24)+'STATUS   AGE'); k8s.namespaces.forEach(n=>out(n.padEnd(24)+'Active   12d')); break; }
            if(res==='events'||rawRes==='events'){ out('LAST SEEN   TYPE      REASON          OBJECT              MESSAGE'); k8s.events.forEach(e=>out('42s'.padEnd(12)+((/BackOff|NotReady/.test(e.reason))?'Warning':'Normal').padEnd(10)+e.reason.padEnd(16)+e.object.padEnd(20)+e.message)); act('events'); break; }
            if(res==='pods'){ out((all?'NAMESPACE'.padEnd(16):'')+'NAME'.padEnd(34)+'READY   STATUS'.padEnd(21)+'RESTARTS   NODE'); namespaced(k8s.pods).forEach(p=>out((all?(p.namespace||'default').padEnd(16):'')+p.name.padEnd(34)+(p.ready||'1/1').padEnd(8)+(p.status||'Running').padEnd(21)+String(p.restarts||0).padEnd(11)+(p.node||'worker-1'))); act('get-pods'); break; }
            if(res==='deployments'){ out('NAME'.padEnd(24)+'READY   UP-TO-DATE   AVAILABLE   AGE'); namespaced(k8s.deployments).forEach(d=>{const ready=readyForDeployment(d);out(d.name.padEnd(24)+(ready+'/'+d.replicas).padEnd(8)+String(deploymentPods(d).length).padEnd(13)+String(ready).padEnd(12)+'2m');}); break; }
            if(res==='services'){ out('NAME'.padEnd(24)+'TYPE'.padEnd(14)+'CLUSTER-IP'.padEnd(16)+'EXTERNAL-IP   PORT(S)'); namespaced(k8s.services).forEach(s=>out(s.name.padEnd(24)+s.type.padEnd(14)+s.clusterIp.padEnd(16)+'<none>'.padEnd(14)+s.port)); break; }
            if(res==='endpoints'){out('NAME'.padEnd(24)+'ENDPOINTS'.padEnd(42)+'AGE');namespaced(k8s.services).forEach(s=>out(s.name.padEnd(24)+(endpointsFor(s).join(',')||'<none>').padEnd(42)+'2m'));break;}
            if(res==='pvs'){ out('NAME'.padEnd(20)+'CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM'); k8s.pvs.forEach(x=>out(x.name.padEnd(20)+(x.capacity||'1Gi').padEnd(11)+(x.access||'RWO').padEnd(15)+'Delete'.padEnd(17)+(x.status||'Available'))); break; }
            if(res==='pvcs'){ out('NAME'.padEnd(22)+'STATUS   VOLUME'.padEnd(24)+'CAPACITY   ACCESS MODES   STORAGECLASS'); namespaced(k8s.pvcs).forEach(x=>out(x.name.padEnd(22)+(x.status||'Bound').padEnd(9)+(x.volume||'pvc-'+x.name).padEnd(24)+(x.capacity||'1Gi').padEnd(11)+'RWO'.padEnd(15)+(x.storageClass||'local-path'))); break; }
            const ar=arrFor(res); if(ar){ out('NAME'.padEnd(28)+(res==='secrets'?'TYPE'.padEnd(24)+'DATA':'AGE')); namespaced(ar).forEach(x=>out(x.name.padEnd(28)+(res==='secrets'?'Opaque'.padEnd(24)+Object.keys(x.data||{}).length:'1m'))); break; }
            if(res==='all'){ dispatch('kubectl get pods'+(all?' -A':'')); dispatch('kubectl get deployments'); dispatch('kubectl get services'); break; }
            err('error: the server doesn\'t have a resource type "'+rawRes+'"'); break;
          }
          if(sub==='run'){ const nm=args[1]; if(!nm){err('error: NAME is required');break;} if(k8s.pods.some(p=>p.name===nm&&p.namespace===ns)){err('Error from server (AlreadyExists): pods "'+nm+'" already exists');break;} createPod(nm,val('--image','nginx:latest')); ok('pod/'+nm+' created'); act('run'); break; }
          if(sub==='create'){
            const kind=aliases[args[1]]||args[1]; const nm=args[2]; if(kind==='namespaces'){ if(!k8s.namespaces.includes(nm))k8s.namespaces.push(nm); ok('namespace/'+nm+' created'); break; }
            if(kind==='deployments'){ const replicas=parseInt(val('--replicas','1'))||1,image=val('--image','nginx:latest'); k8s.deployments.push({name:nm,namespace:ns,image,replicas,revision:1,selector:{app:nm}}); for(let i=0;i<replicas;i++)createPod(nm+'-'+Math.random().toString(36).slice(2,10),image,'Pending',nm,{app:nm}); ok('deployment.apps/'+nm+' created'); act('deployment'); break; }
            if(kind==='configmaps'){ const lit=val('--from-literal','key=value').split('='); k8s.configmaps.push({name:nm,namespace:ns,data:{[lit[0]]:lit.slice(1).join('=')}}); ok('configmap/'+nm+' created'); act('configmap'); break; }
            if(kind==='secrets' || args[1]==='secret'){ const realName=args[1]==='secret'?args[3]:nm; const lit=val('--from-literal','key=value').split('='); k8s.secrets.push({name:realName,namespace:ns,data:{[lit[0]]:lit.slice(1).join('=')}}); ok('secret/'+realName+' created'); act('secret'); break; }
            if(kind==='serviceaccounts'){ k8s.serviceaccounts.push({name:nm,namespace:ns}); ok('serviceaccount/'+nm+' created'); act('serviceaccount'); break; }
            if(kind==='roles'){ k8s.roles.push({name:nm,namespace:ns,verbs:(val('--verb','get').split(',')),resources:(val('--resource','pods').split(','))}); ok('role.rbac.authorization.k8s.io/'+nm+' created'); act('role'); break; }
            if(kind==='rolebindings'){ k8s.rolebindings.push({name:nm,namespace:ns,role:val('--role'),serviceaccount:val('--serviceaccount')}); ok('rolebinding.rbac.authorization.k8s.io/'+nm+' created'); act('rolebinding'); break; }
            if(kind==='storageclasses'){ k8s.storageclasses.push({name:nm,provisioner:val('--provisioner','kubernetes.io/no-provisioner')}); ok('storageclass.storage.k8s.io/'+nm+' created'); break; }
            err('error: unknown resource type "'+(args[1]||'')+'"'); break;
          }
          if(sub==='apply'){
            const path=val('-f',val('--filename','')); const yn=path?getNode(norm(path)):null;
            if(!path){err('error: must specify one of -f and -k');break;}
            if(!yn||yn.type!=='file'){err('error: the path "'+path+'" does not exist');break;}
            const docs=yn.content.split(/^---\s*$/m).filter(x=>x.trim()); let applied=0;
            docs.forEach(doc=>{
              const km=doc.match(/^kind:\s*([^\s#]+)/mi), mm=doc.match(/^\s{0,4}name:\s*([^\s#]+)/mi); if(!km||!mm)return;
              const kind=km[1].toLowerCase(), nm=mm[1], img=(doc.match(/image:\s*([^\s#]+)/i)||[])[1]||'nginx:latest', rep=parseInt((doc.match(/replicas:\s*(\d+)/i)||[])[1]||'1')||1;
              const upsert=(arr,obj)=>{const old=arr.find(x=>x.name===nm&&(!obj.namespace||x.namespace===obj.namespace));if(old)Object.assign(old,obj);else arr.push(obj);};
              if(kind==='deployment'){const app=(doc.match(/\bapp:\s*([^\s#]+)/i)||[])[1]||nm;upsert(k8s.deployments,{name:nm,namespace:ns,image:img,replicas:rep,revision:1,selector:{app}});k8s.pods=k8s.pods.filter(p=>!(p.namespace===ns&&(p.owner===nm||p.name.startsWith(nm+'-'))));for(let i=0;i<rep;i++)createPod(nm+'-'+Math.random().toString(36).slice(2,10),img,'Pending',nm,{app});act('deployment');}
              else if(kind==='pod'){const old=k8s.pods.find(p=>p.name===nm&&p.namespace===ns);if(old){old.image=img;old.status='Running';old.ready='1/1';old.restarts=0;}else createPod(nm,img);act('apply-pod');}
              else if(kind==='service'){const port=(doc.match(/port:\s*(\d+)/i)||[])[1]||'80',app=(doc.match(/selector:\s*[\r\n]+\s+app:\s*([^\s#]+)/i)||[])[1]||nm;upsert(k8s.services,{name:nm,namespace:ns,type:(doc.match(/type:\s*([^\s#]+)/i)||[])[1]||'ClusterIP',clusterIp:'10.96.0.'+(20+k8s.services.length),port:port+'/TCP',selector:{app}});act('service');}
              else if(kind==='configmap'){upsert(k8s.configmaps,{name:nm,namespace:ns,data:{configured:'true'}});act('configmap');}
              else if(kind==='secret'){upsert(k8s.secrets,{name:nm,namespace:ns,data:{secret:'c2VjcmV0'}});act('secret');}
              else if(kind==='persistentvolumeclaim'){const cap=(doc.match(/storage:\s*([^\s#]+)/i)||[])[1]||'1Gi', sc=(doc.match(/storageClassName:\s*([^\s#]+)/i)||[])[1]||'local-path';upsert(k8s.pvcs,{name:nm,namespace:ns,status:'Bound',volume:'pvc-'+nm,capacity:cap,storageClass:sc});act('pvc');}
              else if(kind==='persistentvolume'){upsert(k8s.pvs,{name:nm,status:'Available',capacity:(doc.match(/storage:\s*([^\s#]+)/i)||[])[1]||'1Gi',access:'RWO'});act('pv');}
              else if(kind==='storageclass'){upsert(k8s.storageclasses,{name:nm,provisioner:(doc.match(/provisioner:\s*([^\s#]+)/i)||[])[1]||'kubernetes.io/no-provisioner'});act('storageclass');}
              else if(kind==='ingress'){upsert(k8s.ingresses,{name:nm,namespace:ns});act('ingress');}
              else if(kind==='networkpolicy'){upsert(k8s.networkpolicies,{name:nm,namespace:ns});act('networkpolicy');}
              else return;
              applied++; out(kind.toLowerCase()+'/'+nm+(applied?' configured':' created'));
            });
            if(!applied)err('error: unable to recognize any Kubernetes objects in "'+path+'"');
            break;
          }
          if(sub==='expose'){ const nm=args[2]; const d=k8s.deployments.find(x=>x.name===nm&&x.namespace===ns); if(!d){err('Error from server (NotFound): deployments.apps "'+nm+'" not found');break;} const port=val('--port','80'); const type=val('--type','ClusterIP'); k8s.services.push({name:nm,namespace:ns,type,clusterIp:'10.96.0.'+(20+k8s.services.length),port:port+'/TCP',selector:{app:nm}}); ok('service/'+nm+' exposed'); act('service'); break; }
          if(sub==='scale'){ const nm=args[2]; const d=k8s.deployments.find(x=>x.name===nm&&x.namespace===ns); if(!d){err('Error from server (NotFound): deployments.apps "'+nm+'" not found');break;} const n=parseInt(val('--replicas','1'))||1; d.replicas=n; const pods=deploymentPods(d); while(pods.length<n)pods.push(createPod(nm+'-'+Math.random().toString(36).slice(2,10),d.image,'Pending',nm,d.selector||{app:nm})); while(pods.length>n){ const p=pods.pop(); k8s.pods.splice(k8s.pods.indexOf(p),1); } ok('deployment.apps/'+nm+' scaled'); act('scale'); break; }
          if(sub==='set'&&args[1]==='image'){ const ref=args[2]||''; const nm=ref.split('/')[1]||ref; const image=(args[3]||'').split('=').pop(); const d=k8s.deployments.find(x=>x.name===nm&&x.namespace===ns); const p=k8s.pods.find(x=>x.name===nm&&x.namespace===ns); if(d){d.image=image;d.revision=(d.revision||1)+1;deploymentPods(d).forEach(x=>{const i=k8s.pods.indexOf(x);if(i!==-1)k8s.pods.splice(i,1);});for(let i=0;i<d.replicas;i++)createPod(nm+'-'+Math.random().toString(36).slice(2,10),image,'Pending',nm,d.selector||{app:nm});ok('deployment.apps/'+nm+' image updated');act('rollout');} else if(p){p.image=image;p.status=/missing|notfound/.test(image)?'ImagePullBackOff':/broken|bad|crash/.test(image)?'CrashLoopBackOff':'Running';p.ready=p.status==='Running'?'1/1':'0/1';p.restarts=p.status==='Running'?0:(p.restarts||0)+1;ok('pod/'+nm+' image updated');act('fix-pod');} else err('Error from server (NotFound): resource "'+nm+'" not found'); break; }
          if(sub==='rollout'){ const op=args[1], ref=args[2]||'', nm=ref.split('/')[1]||ref, d=k8s.deployments.find(x=>x.name===nm&&x.namespace===ns); if(!d){err('Error from server (NotFound): deployments.apps "'+nm+'" not found');break;} if(op==='status'){const ready=readyForDeployment(d);if(ready===d.replicas)out('deployment "'+nm+'" successfully rolled out');else{out('Waiting for deployment "'+nm+'" rollout to finish: '+ready+' of '+d.replicas+' updated replicas are available...','#e0a458');lastFail=true;lastStatus=1;}} else if(op==='history'){out('REVISION  CHANGE-CAUSE');out(String(d.revision||1).padEnd(10)+'<none>');} else if(op==='undo'){d.revision=Math.max(1,(d.revision||1)-1);ok('deployment.apps/'+nm+' rolled back');} else out('kubectl rollout: usa status | history | undo'); break; }
          if(sub==='label'&&res==='nodes'){ const n=k8s.nodes.find(x=>x.name===args[2]); const kv=args[3]||''; if(!n||!kv.includes('=')){err('error: node and label key=value required');break;} const z=kv.split('=');n.labels[z[0]]=z.slice(1).join('=');ok('node/'+n.name+' labeled');act('label-node');break; }
          if(sub==='taint'&&res==='nodes'){ const n=k8s.nodes.find(x=>x.name===args[2]); if(!n){err('Error from server (NotFound): node not found');break;} n.taints=n.taints||[]; n.taints.push(args[3]); ok('node/'+n.name+' tainted'); act('taint-node'); break; }
          if(['cordon','uncordon','drain'].includes(sub)){ const n=k8s.nodes.find(x=>x.name===args[1]); if(!n){err('Error from server (NotFound): nodes "'+(args[1]||'')+'" not found');break;} n.schedulable=sub==='uncordon'; out('node/'+n.name+(sub==='uncordon'?' uncordoned':sub==='cordon'?' cordoned':' cordoned')); if(sub==='drain')out('node/'+n.name+' drained'); act(sub); break; }
          if(sub==='describe'){ const kind=aliases[args[1]]||args[1], nm=args[2]; if(kind==='pods'){ const p=k8s.pods.find(x=>x.name===nm&&x.namespace===ns); if(!p){err('Error from server (NotFound): pods "'+nm+'" not found');break;} out('Name:         '+p.name);out('Namespace:    '+p.namespace);out('Node:         '+p.node);out('Labels:       '+(Object.entries(p.labels||{}).map(x=>x.join('=')).join(',')||'<none>'));out('Status:       '+p.status);out('IP:           '+p.ip);out('Containers:');out('  Image:      '+p.image);out('  Ready:      '+(podReady(p)?'True':'False'));out('  Restart Count: '+(p.restarts||0));if(p.lastState)out('  Last State: '+p.lastState,'#ef8a7a');out('Conditions:');out('  Ready            '+(podReady(p)?'True':'False'),podReady(p)?'#8fa876':'#ef8a7a');out('Events:');const ev=k8s.events.filter(e=>e.object==='pod/'+p.name).slice(-5);if(ev.length)ev.forEach(e=>out('  '+((/BackOff|Failed/.test(e.reason))?'Warning':'Normal').padEnd(9)+e.reason.padEnd(18)+e.message,/BackOff|Failed/.test(e.reason)?'#ef8a7a':undefined));else out('  <none>');act('describe-pod'); } else if(kind==='nodes'){ const n=k8s.nodes.find(x=>x.name===nm); if(!n){err('node not found');break;} out('Name: '+n.name);out('Roles: '+n.role);out('Labels: '+Object.entries(n.labels||{}).map(x=>x[0]+'='+x[1]).join(','));out('Taints: '+((n.taints||[]).join(',')||'<none>'));out('Conditions:');out('  Ready  '+(n.status==='Ready'?'True':'False'),n.status==='Ready'?'#8fa876':'#ef8a7a');out('Unschedulable: '+(!n.schedulable)); act('describe-node'); } else if(kind==='services'){ const s=k8s.services.find(x=>x.name===nm&&x.namespace===ns);if(!s){err('Error from server (NotFound): services "'+nm+'" not found');break;}out('Name:              '+s.name);out('Namespace:         '+s.namespace);out('Type:              '+s.type);out('IP:                '+s.clusterIp);out('Port:              <unset>  '+s.port);out('Selector:          '+Object.entries(s.selector||{}).map(x=>x.join('=')).join(','));out('Endpoints:         '+(endpointsFor(s).join(',')||'<none>'));out('Events:            <none>'); } else if(kind==='pvcs'){ const p=k8s.pvcs.find(x=>x.name===nm&&x.namespace===ns);if(!p){err('Error from server (NotFound): persistentvolumeclaims "'+nm+'" not found');break;}out('Name:          '+p.name);out('Namespace:     '+p.namespace);out('StorageClass:  '+p.storageClass);out('Status:        '+p.status);out('Volume:        '+p.volume);out('Capacity:      '+p.capacity);out('Access Modes:  RWO');out('Events:        Normal  ProvisioningSucceeded  Successfully provisioned volume'); } else if(kind==='deployments'){ const d=k8s.deployments.find(x=>x.name===nm&&x.namespace===ns);if(!d){err('Error from server (NotFound): deployments.apps "'+nm+'" not found');break;}const ready=readyForDeployment(d);out('Name:                   '+d.name);out('Namespace:              '+d.namespace);out('Selector:               '+Object.entries(d.selector||{app:d.name}).map(x=>x.join('=')).join(','));out('Replicas:               '+d.replicas+' desired | '+deploymentPods(d).length+' updated | '+ready+' available');out('Pod Template:');out('  Containers:  '+d.image);out('Conditions:');out('  Available  '+(ready===d.replicas?'True  MinimumReplicasAvailable':'False  MinimumReplicasUnavailable'),ready===d.replicas?'#8fa876':'#ef8a7a'); } else err('error: the server doesn\'t have a resource type "'+(args[1]||'')+'"'); break; }
          if(sub==='logs'){ const nm=args.filter(a=>!a.startsWith('-'))[1],p=k8s.pods.find(x=>x.name===nm&&x.namespace===ns); if(!p){err('Error from server (NotFound): pods "'+(nm||'')+'" not found');break;} if(p.status==='CrashLoopBackOff'){out('FATAL: required environment variable DATABASE_URL is not set','#ef8a7a');}else{out(new Date().toISOString()+' INFO server started on :8080');} act('logs'); break; }
          if(sub==='exec'){const non=args.filter(a=>!a.startsWith('-')&&a!=='--'),nm=non[1],p=k8s.pods.find(x=>x.name===nm&&x.namespace===ns);if(!p){err('Error from server (NotFound): pods "'+(nm||'')+'" not found');break;}if(p.status!=='Running'){err('error: unable to upgrade connection: container not found (pod is '+p.status+')');break;}const di=args.indexOf('--'),inside=di!==-1?args.slice(di+1):non.slice(2);if(!inside.length){err('error: you must specify at least one command for the container');break;}if(['sh','bash','/bin/sh','/bin/bash'].includes(inside[0])){enterContainerShell(p.name,p.image,'kubernetes');act('exec');return;}const old=containerShell;containerShell={name:p.name,image:p.image,kind:'kubernetes',cwd:'/'};containerDispatch(inside.join(' '),inside[0],inside.slice(1));containerShell=old;setPrompt();act('exec');break;}
          if(sub==='auth'&&args[1]==='can-i'){ const verb=args[2],resource=args[3],as=val('--as',''); const sa=as.split(':').pop(); const bindings=k8s.rolebindings.filter(b=>b.namespace===ns&&(!sa||b.serviceaccount===sa||b.serviceaccount.endsWith(':'+sa))); const allowed=bindings.some(b=>{const r=k8s.roles.find(x=>x.name===b.role&&x.namespace===ns);return r&&(r.verbs.includes(verb)||r.verbs.includes('*'))&&(r.resources.includes(resource)||r.resources.includes('*'));}); out(allowed?'yes':'no'); act('auth'); break; }
          if(sub==='config'){ if(args[1]==='current-context')out('kubernetes-admin@cka-lab'); else if(args[1]==='get-contexts')out('*         kubernetes-admin@cka-lab   cka-lab   kubernetes-admin   default'); else if(args[1]==='use-context')ok('Switched to context "'+(args[2]||'')+'".'); break; }
          if(sub==='explain'){ out('KIND:       '+(args[1]||'Pod'));out('VERSION:    v1');out('DESCRIPTION:');out('    Kubernetes API resource. Use --recursive to display all fields.'); act('explain'); break; }
          if(sub==='delete'){ const ar=arrFor(res),nm=args[2]; if(!ar){err('error: unknown resource type "'+rawRes+'"');break;} const i=ar.findIndex(x=>x.name===nm&&(!x.namespace||x.namespace===ns)); if(i===-1){err('Error from server (NotFound): '+rawRes+' "'+nm+'" not found');break;} const removed=ar[i],owner=res==='pods'&&removed.owner;ar.splice(i,1);ok(rawRes.replace(/s$/,'')+'/'+nm+' deleted');if(owner){const d=k8s.deployments.find(x=>x.name===owner&&x.namespace===ns);if(d)setTimeout(()=>{if(deploymentPods(d).length<d.replicas){createPod(owner+'-'+Math.random().toString(36).slice(2,10),d.image,'Pending',owner,d.selector||{app:owner});k8s.events.push({reason:'SuccessfulCreate',object:'replicaset/'+owner,message:'Created pod to restore desired replicas'});eventAdd('kubernetes','reconcile','Deployment restored desired state',{deployment:owner});save();}},350);}break; }
          if(sub==='top'){ if(res==='nodes'){out('NAME'.padEnd(18)+'CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%');k8s.nodes.forEach((n,i)=>out(n.name.padEnd(18)+((180+i*40)+'m').padEnd(13)+'4%'.padEnd(7)+((900+i*150)+'Mi').padEnd(16)+'23%'));}else{out('NAME'.padEnd(30)+'CPU(cores)   MEMORY(bytes)');namespaced(k8s.pods).forEach((p,i)=>out(p.name.padEnd(30)+((8+i*3)+'m').padEnd(13)+((24+i*4)+'Mi')));}break; }
          err('error: unknown command "'+sub+'" for "kubectl"'); break;
        }
        case 'sudo': {
          if(currentUser==='root'){ if(args.length) dispatch(args.join(' ')); break; }
          if(!args.length){ out('uso: sudo <comando>  ·  sudo -i  ·  sudo su -'); break; }
          const inner = args.join(' ').trim();
          if(args[0]==='-k'){delete sudoUntil[currentUser];break;}
          if(args[0]==='-l'){out('El usuario '+currentUser+' puede ejecutar las siguientes órdenes en '+localHostname()+':');out('    (ALL) ALL');break;}
          const inWheel = (users[currentUser].groups||[]).includes('wheel');
          if(!inWheel){ err(currentUser+' no está en el fichero sudoers. Se informará de este incidente.');secureLog('sudo: '+currentUser+' : user NOT in sudoers ; TTY=pts/0 ; COMMAND='+inner,3);break; }
          const becomeRoot = /^(-i|-s|su|su\s+-l?|su\s+-\s*root?)$/.test(inner);
          const executeSudo=()=>{secureLog('sudo: '+currentUser+' : TTY=pts/0 ; PWD=/'+cwd.join('/')+' ; USER=root ; COMMAND='+inner,5);sudoUntil[currentUser]=Date.now()+300000;if(becomeRoot){userStack.push({user:currentUser,cwd:cwd.slice()});currentUser='root';cwd=['root'];setPrompt();}else{const orig=currentUser;currentUser='root';dispatch(inner);currentUser=orig;setPrompt();}};
          if((sudoUntil[currentUser]||0)>Date.now()){executeSudo();break;}
          startInteractive('[sudo] contraseña para '+currentUser+':', true, (pw)=>{
            endInteractive();
            if(pw!==(users[currentUser].password||'')){ err('Lo siento, vuelve a intentarlo.'); err('sudo: 1 intento de contraseña incorrecto');secureLog('sudo: '+currentUser+' : 1 incorrect password attempt ; COMMAND='+inner,4);return; }
            executeSudo();
          });
          return;
        }
        case 'vi': case 'nano': { const f=args.filter(a=>!a.startsWith('-'))[0]; if(!f){ out(name+': uso: '+name+' <fichero>'); break; } editorEnter(name, f); return; }
        case 'systemd-run': { let sec=5; const oa=args.find(a=>a.startsWith('--on-active=')); if(oa){ const v=oa.split('=')[1]; sec=parseInt(v)||5; } const runCmd=args.filter(a=>!a.startsWith('--')).join(' '); if(!runCmd){ out('systemd-run: uso: systemd-run --on-active=5s <comando>'); break; } const unit='run-r'+Math.random().toString(16).slice(2,7); const wait=Math.min(sec,8); out('Running as unit: '+unit+'.service'); out('Se ejecutará mediante el temporizador '+unit+'.timer en ~'+wait+'s.','#a2957d'); setTimeout(()=>{ out('[timer] '+unit+' disparado → '+runCmd,'#8fa876'); dispatch(runCmd); scroll(); save(); }, wait*1000); break; }
        case 'sed': { const inplace=args.includes('-i'); const nonflag=args.filter(a=>!a.startsWith('-')); const expr=nonflag[0]; const fi=nonflag[nonflag.length-1]; const n=fi?getNode(norm(fi)):null; if(!n||n.type!=='file'){ err('sed: '+(fi||'')+': no es un fichero'); break; } const m=expr&&expr.match(/^s(.)([\s\S]*?)\1([\s\S]*?)\1(g?i?)$/); if(!m){ err('sed: solo se admite  s/patrón/reemplazo/[g]'); break; } let flags=''; if(m[4].includes('g'))flags+='g'; if(m[4].includes('i'))flags+='i'; let re; try{ re=new RegExp(m[2],flags); }catch(e){ err('sed: expresión regular inválida'); break; } const res=n.content.split('\n').map(l=>l.replace(re,m[3])); if(inplace){ n.content=res.join('\n'); } else res.forEach(l=>out(l)); break; }
        case 'awk': { const nonflag=args.filter(a=>!a.startsWith('-')); const prog=nonflag[0]||''; const fi=nonflag[nonflag.length-1]; const Fi=args.indexOf('-F'); const FS=Fi!==-1?args[Fi+1]:null; const n=(fi&&fi!==prog)?getNode(norm(fi)):null; if(!n||n.type!=='file'){ err('awk: '+(fi||'')+': no es un fichero'); break; } const pm=prog.match(/\{\s*print\s+([\s\S]+?)\}/); n.content.split('\n').forEach(l=>{ if(l==='') return; const f=FS?l.split(FS):l.split(/\s+/).filter(Boolean); if(pm){ const o=pm[1].split(',').map(tok=>{ tok=tok.trim(); const mm=tok.match(/^\$(\d+)$/); if(mm) return mm[1]==='0'?l:(f[+mm[1]-1]||''); return tok.replace(/^["']|["']$/g,''); }).join(' '); out(o); } else out(l); }); break; }
        case 'at': { const when=args.filter(a=>!a.startsWith('-')).join(' ')||'now'; out('warning: commands will be executed using /bin/sh'); ok('job 1 at '+new Date().toString().slice(0,24)+'  ('+when+')'); out('(en un sistema real escribirías comandos y terminarías con Ctrl-D)','#a2957d'); break; }
        case 'atq': out('1\t'+new Date().toString().slice(0,24)+' a '+currentUser); break;
        case 'atrm': ok('trabajo '+(args[0]||'')+' eliminado.'); break;
        case 'loginctl': { const sub=args.find(a=>!a.startsWith('-'))||'',u=args.filter(a=>!a.startsWith('-')).slice(1).pop()||currentUser; if(sub==='show-user'){ if(!users[u]){err('Failed to get user: User ID '+u+' is not logged in or lingering');break;} out('UID='+users[u].uid);out('Name='+u);out('Linger='+(linger[u]?'yes':'no'));break;} if(sub==='enable-linger'||sub==='disable-linger'){if(currentUser!=='root'){err('Could not '+(sub==='enable-linger'?'enable':'disable')+' linger: Access denied');out('('+sub+' requiere privilegios de root)','#a2957d');break;}if(!users[u]){err('Failed to look up user '+u+': No such user');break;}linger[u]=sub==='enable-linger';break;} out('loginctl: usa enable-linger USUARIO | disable-linger USUARIO | show-user USUARIO'); break; }
        case 'tar': { const flags=args.filter(a=>a.startsWith('-')).join(''); const nonflag=args.filter(a=>!a.startsWith('-')); const arch=nonflag[0]; const items=nonflag.slice(1); const has=(ch)=>flags.includes(ch); const comp=has('z')?'gzip':has('j')?'bzip2':has('J')?'xz':'none';
          if(has('c')){ if(!arch){ err('tar: Cowardly refusing to create an empty archive (falta -f)'); break; } const seg=norm(arch); const par=getParent(seg); const nm=seg[seg.length-1]; if(!par||par.type!=='dir'){ err('tar: '+arch+': no se puede crear'); break; } par.children[nm]=file('TARLIST:'+comp+':'+items.join(','),{owner:currentUser,group:currentUser}); if(has('v')) items.forEach(x=>out(x)); }
          else if(has('t')){ const n=arch?getNode(norm(arch)):null; if(!n||n.type!=='file'){ err('tar: '+(arch||'')+': No existe el fichero o el directorio'); break; } const m=n.content.match(/^TARLIST:(?:[a-z0-9]+:)?(.*)$/); (m?m[1].split(',').filter(Boolean):[]).forEach(x=>out(x)); }
          else if(has('x')){ const n=arch?getNode(norm(arch)):null; if(!n){ err('tar: '+(arch||'')+': No existe el fichero o el directorio'); break; } if(has('v')){ const m=n.content.match(/^TARLIST:(?:[a-z0-9]+:)?(.*)$/); (m?m[1].split(',').filter(Boolean):[]).forEach(x=>out(x)); } }
          else out('tar: uso: -c crear · -x extraer · -t listar · -f fichero · -z gzip · -j bzip2 · -J xz · -v detallado'); break; }
        case 'gzip': { const f=args.filter(a=>!a.startsWith('-'))[0]; if(args.includes('-l')||args.includes('--list')){ out('         compressed        uncompressed  ratio uncompressed_name'); break; } const n=f?getNode(norm(f)):null; if(!n||n.type!=='file'){ err('gzip: '+(f||'')+': No existe el fichero o el directorio'); break; } const seg=norm(f); const par=getParent(seg); const nm=seg[seg.length-1]; if(args.includes('-d')||args.includes('--decompress')){ if(!nm.endsWith('.gz')){ err('gzip: '+f+': unknown suffix -- ignored'); break; } par.children[nm.replace(/\.gz$/,'')]=par.children[nm]; delete par.children[nm]; } else if(!nm.endsWith('.gz')){ par.children[nm+'.gz']=par.children[nm]; delete par.children[nm]; if(args.includes('-k')) par.children[nm]=file(par.children[nm+'.gz'].content,{owner:currentUser}); } break; }
        case 'gunzip': { const f=args.filter(a=>!a.startsWith('-'))[0]; const n=f?getNode(norm(f)):null; if(!n){ err('gunzip: '+(f||'')+': No existe el fichero o el directorio'); break; } const seg=norm(f); const par=getParent(seg); const nm=seg[seg.length-1]; if(!nm.endsWith('.gz')){ err('gunzip: '+f+': unknown suffix -- ignored'); break; } par.children[nm.replace(/\.gz$/,'')]=par.children[nm]; delete par.children[nm]; break; }
        case 'bzip2': { const f=args.filter(a=>!a.startsWith('-'))[0]; const n=f?getNode(norm(f)):null; if(!n||n.type!=='file'){ err('bzip2: '+(f||'')+': No existe el fichero o el directorio'); break; } const seg=norm(f); const par=getParent(seg); const nm=seg[seg.length-1]; if(args.includes('-d')){ if(!nm.endsWith('.bz2')){ err('bzip2: '+f+' is not a bzip2 file.'); break; } par.children[nm.replace(/\.bz2$/,'')]=par.children[nm]; delete par.children[nm]; } else { par.children[nm+'.bz2']=par.children[nm]; delete par.children[nm]; if(args.includes('-k')) par.children[nm]=file(par.children[nm+'.bz2'].content,{owner:currentUser}); } break; }
        case 'bunzip2': { const f=args.filter(a=>!a.startsWith('-'))[0]; const n=f?getNode(norm(f)):null; if(!n){ err('bunzip2: '+(f||'')+': No existe el fichero o el directorio'); break; } const seg=norm(f); const par=getParent(seg); const nm=seg[seg.length-1]; if(!nm.endsWith('.bz2')){ err('bunzip2: '+f+' is not a bzip2 file.'); break; } par.children[nm.replace(/\.bz2$/,'')]=par.children[nm]; delete par.children[nm]; break; }
        case 'neofetch': outMany(['        _nnnn_         '+currentUser+'@'+localHostname(),'       dGGGGMMb        ---------------','      @p~qp~~qMb       OS: '+OS_NAME,'      M|@||@) M|       Kernel: '+KERNEL,'      @,----.JM|       Shell: bash 5.1','     JS^\\__/  qKL      Packages: '+installed.size+' (dnf)','    dZP        qKRb    CPU: Cozy CPU x4','   dZP          qKKb   Mem: 1123MiB / 3894MiB'],'#8fa876'); break;
        default: { const suggestion=typeof closestCmd==='function'?closestCmd(name):''; err('-bash: '+name+': orden no encontrada',127); if(suggestion)out('¿Quisiste decir «'+suggestion+'»?','#a2957d'); }
      }
    };

    const runScript = (path, args) => {
      const n = getNode(norm(path));
      if(!n){ err('bash: '+path+': No existe el fichero o el directorio'); return; }
      if(n.type==='dir'){ err('bash: '+path+': Es un directorio'); return; }
      if(!n.mode || n.mode[2]!=='x'){ err('bash: '+path+': Permiso denegado'); return; }
      const oldPos={};for(let i=0;i<=9;i++){oldPos[i]=shellVars[i];shellVars[i]=i===0?path:(args[i-1]||'');}oldPos['#']=shellVars['#'];shellVars['#']=String(args.length);
      const lines = n.content.split('\n');
      for(let i=0;i<lines.length;i++){ const l=lines[i].trim(); if(i===0&&l.startsWith('#!')) continue; if(l===''||l.startsWith('#')) continue;if(l.startsWith('exit ')){lastStatus=parseInt(expandVariables(l.slice(5)))||0;lastFail=lastStatus!==0;break;}dispatch(expandVariables(l));if(shellOptions.errexit&&lastFail)break; }
      for(let i=0;i<=9;i++){if(oldPos[i]===undefined)delete shellVars[i];else shellVars[i]=oldPos[i];}if(oldPos['#']===undefined)delete shellVars['#'];else shellVars['#']=oldPos['#'];
    };

    const expandBang = (s) => {
      if(recovery || s[0]!=='!' ) return s;
      if(s==='!!'){ return history.length?history[history.length-1]:null; }
      const mNum=s.match(/^!(-?\d+)$/); if(mNum){ let i=parseInt(mNum[1]); if(i<0) i=history.length+i; else i=i-1; return (i>=0&&i<history.length)?history[i]:null; }
      const pref=s.slice(1); for(let i=history.length-1;i>=0;i--){ if(history[i].startsWith(pref)) return history[i]; } return null;
    };
    const prepareRedirections = (redirections) => {
      const terminalOut={kind:'terminal',fd:1},terminalErr={kind:'terminal',fd:2};
      const fds={0:{kind:'terminal',fd:0},1:terminalOut,2:terminalErr};
      for(const item of redirections){
        if(item.kind==='duplicate'){
          const target=fds[item.targetFd];
          if(!target){err('-bash: '+item.targetFd+': descriptor de fichero incorrecto');return null;}
          if(item.fd==='both'){fds[1]=target;fds[2]=target;}else fds[item.fd]=target;
          continue;
        }
        const segs=norm(item.target),parentSegs=segs.slice(0,-1),parent=getParent(segs),name=segs[segs.length-1];
        if(!name||!parent||parent.type!=='dir'){err('-bash: '+item.target+': No existe el fichero o el directorio');return null;}
        if(!canTraverse(parentSegs)){err('-bash: '+item.target+': Permiso denegado');return null;}
        const existing=parent.children[name];
        if(item.operator.includes('<')){
          if(!existing){err('-bash: '+item.target+': No existe el fichero o el directorio');return null;}
          if(existing.type==='dir'){err('-bash: '+item.target+': Es un directorio');return null;}
          if(!hasPerm(existing,'r')){err('-bash: '+item.target+': Permiso denegado');return null;}
          const sink={kind:'input',node:existing,target:item.target};
          if(item.fd==='both'){fds[1]=sink;fds[2]=sink;}else fds[item.fd]=sink;
          continue;
        }
        if(existing&&existing.type==='dir'){err('-bash: '+item.target+': Es un directorio');return null;}
        if(!hasPerm(parent,'w')||!hasPerm(parent,'x')||(existing&&!hasPerm(existing,'w'))){err('-bash: '+item.target+': Permiso denegado');return null;}
        if(existing&&shellOptions.noclobber&&!item.append){err('-bash: '+item.target+': no se puede sobrescribir el fichero existente');return null;}
        const node=existing||file('',{owner:currentUser,group:(users[currentUser]?.groups||[currentUser])[0]||currentUser});
        if(!existing)parent.children[name]=node;
        if(!item.append)node.content='';
        const sink={kind:'file',node,target:item.target,append:item.append,wrote:false,needsSeparator:item.append&&node.content!==''&&!node.content.endsWith('\n')};
        if(item.fd==='both'){fds[1]=sink;fds[2]=sink;}else fds[item.fd]=sink;
      }
      return {fds};
    };
    const redirectInputLines = (plan) => {
      const source=plan&&plan.fds[0];
      return source&&source.kind==='input'?source.node.content.split('\n'):null;
    };
    const routeRedirectEvents = (plan,events) => {
      (events||[]).forEach(event=>{
        const sink=plan.fds[event.fd]||{kind:'terminal',fd:event.fd};
        if(sink.kind==='terminal'){out(event.text,sink.fd===2?'#ef8a7a':undefined);return;}
        if(sink.kind!=='file'){err('-bash: '+event.fd+': descriptor de fichero incorrecto');return;}
        const text=event.text==null?'':String(event.text);
        if(sink.needsSeparator||sink.wrote)sink.node.content+='\n';
        sink.node.content+=text;
        sink.needsSeparator=false;sink.wrote=true;
      });
    };
    const run = (raw) => {
      let cmd = raw.trim();
      if(cmd[0]==='!' && !recovery){ const ex=expandBang(cmd); if(ex===null){ echoCmd(raw); err('bash: '+cmd+': event not found'); save(); return; } cmd=ex; }
      const hd=cmd.match(/<<-?\s*(['"]?)([A-Za-z_][A-Za-z0-9_]*)\1/);
      if(hd){echoCmd(cmd);history.push(cmd);const delimiter=hd[2],literal=!!hd[1],lines=[];const om=cmd.match(/(?:^|\s)(?:>|1>)\s*([^\s]+)(?![\s\S]*>)/);startInteractive('>',false,v=>{if(v!==delimiter){lines.push(literal?v:expandVariables(v));return;}endInteractive();const target=om&&om[1];if(target){const segs=norm(target),parent=getParent(segs),fn=segs[segs.length-1];if(!parent||parent.type!=='dir')err('-bash: '+target+': No existe el fichero o el directorio');else parent.children[fn]=file(lines.join('\n')+'\n',{owner:currentUser,group:currentUser});}else lines.forEach(l=>out(l));save();});return;}
      echoCmd(cmd);
      if(!cmd){ save(); return; }
      if(history[history.length-1]!==cmd) history.push(cmd);
      const fn=cmd.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*\)\s*\{([\s\S]*)\}\s*$/);if(fn){shellFunctions[fn[1]]=fn[2].trim().replace(/;\s*$/,'');save();return;}
      hIdx = history.length;
      expansionStatus=lastStatus;
      lastFail=false; lastStatus=0;
      const syntax=splitOutside(cmd);
      if(syntax.unclosed){err("bash: error sintáctico: comilla "+syntax.unclosed+' sin cerrar',2);save();return;}
      if(MODE==='docker' && /^curl\s+.*https:\/\/get\.docker\.com\s*\|\s*(?:sudo\s+)?sh\s*$/.test(expandVariables(cmd))){
        out('# Executing docker install script, commit: 7cae5f8','#a2957d');
        if(dockerInstalled)out('Warning: the "docker" command appears to already exist on this system.','#eab86a');
        out('+ sh -c \'dnf -y -q install dnf-plugins-core\'');
        installed.add('dnf-plugins-core');
        out('+ sh -c \'dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo\'');
        configureDockerRepo();
        out('+ sh -c \'dnf -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin\'');
        dispatch('dnf -y install '+DOCKER_PACKAGES.join(' ')); return;
      }
      const tokens = splitOutside(cmd).parts;
      let prevOp=null;
      for(let i=0;i<tokens.length;i++){
        const t=tokens[i];
        if(t===';'||t==='&&'||t==='||'){ prevOp=t; continue; }
        if(prevOp==='&&'&&lastFail){ prevOp=null; continue; }
        if(prevOp==='||'&&!lastFail){ prevOp=null; continue; }
        prevOp=null; lastFail=false; lastStatus=0;
        let seg=t.trim();
        if(seg.includes('{')){ const words=tokenize(seg), quoted=tokenQuoted.slice(); seg=words.flatMap((w,wi)=>quoted[wi]?[w]:braceExpand(w)).map(w=>/\s/.test(w)?'"'+w.replace(/"/g,'\\"')+'"':w).join(' '); }
        seg=expandVariables(seg);
        const background=/\s&\s*$/.test(seg); if(background)seg=seg.replace(/\s&\s*$/,'').trim();
        const parsed=parseRedirections(seg);
        if(parsed.error){err('-bash: error sintáctico cerca de la redirección: '+parsed.error,2);continue;}
        seg=parsed.command;
        const redirectPlan=prepareRedirections(parsed.redirections);
        if(!redirectPlan)continue;
        if(background){const pid=nextPid++;const job={id:nextJob++,pid,cmd:seg,status:'Running',user:currentUser};jobs.push(job);processes.push({pid,ppid:888,user:currentUser,cpu:0,mem:0.1,vsz:8200,rss:900,stat:'S',start:new Date().toLocaleTimeString().slice(0,5),time:'0:00',cmd:seg});out('['+job.id+'] '+pid);expansionStatus=0;continue;}
        const stages = splitOutside(seg,true).parts.filter(s=>s!=='|');
        let buf=null;
        const hasRedirections=parsed.redirections.length>0;
        const inputLines=redirectInputLines(redirectPlan);
        const streamCommand=(stage)=>/^(?:cat|grep|wc|head|tail|sort|uniq|nl|jq|more|less|tee)(?:\s|$)/.test((stage||'').trim());
        if(hasRedirections){
          const oldCap=cap,oldErr=errCap,oldEvents=ioEvents;
          cap=[];errCap=[];ioEvents=[];
          try{
            if(stages.length>1){
              let b;
              if(inputLines&&streamCommand(stages[0]))b=applyFilter(stages[0],inputLines.slice());
              else{dispatch(stages[0]);b=cap.slice();}
              for(let j=1;j<stages.length;j++)b=applyFilter(stages[j],b);
              ioEvents=ioEvents.filter(event=>event.fd===2);
              b.forEach(text=>ioEvents.push({fd:1,text}));
            }else if(inputLines&&streamCommand(stages[0])){
              const b=applyFilter(stages[0],inputLines.slice());
              b.forEach(text=>ioEvents.push({fd:1,text}));
            }else if(stages[0])dispatch(stages[0]);
            const events=ioEvents.slice();
            cap=oldCap;errCap=oldErr;ioEvents=oldEvents;
            routeRedirectEvents(redirectPlan,events);
          }finally{cap=oldCap;errCap=oldErr;ioEvents=oldEvents;}
        }else if(stages.length>1){ cap=[]; dispatch(stages[0]); let b=cap; cap=null; for(let j=1;j<stages.length;j++) b=applyFilter(stages[j],b); buf=b; }
        else if(stages[0]){ dispatch(seg); }
        if(buf)buf.forEach(l=>out(l));
        expansionStatus=lastStatus;
      }
      save();
    };

    // ---------------- restore scrollback ----------------
    if(savedScroll && loggedIn){ [...body.querySelectorAll('.term-out')].forEach(d=>d.remove()); savedScroll.forEach(it=>{ const d=document.createElement('div'); d.className='term-out'; if(it.c) d.style.color=it.c; d.innerHTML=it.h; body.insertBefore(d,line); }); }

    const COMMON_CMDS=['help','clear','reset','pwd','whoami','id','groups','who','w','last','uname','hostname','hostnamectl','date','uptime','free','env','printenv','export','unset','set','alias','unalias','type','printf','true','false','history','man','less','more','which','echo','ls','cd','cat','head','tail','wc','sort','uniq','nl','mkdir','rmdir','touch','rm','cp','mv','ln','find','grep','stat','file','tree','umask','chmod','chown','chgrp','ps','top','pgrep','kill','jobs','fg','bg','wait','disown','nohup','sleep','systemctl','journalctl','dnf','rpm','df','du','lsblk','ip','ss','lsof','nc','ncat','dig','host','nslookup','ping','nmcli','sudo','vi','nano','tar','neofetch','reboot','poweroff','shutdown','exit','logout','ssh','scp','sed','awk','gzip','gunzip','curl','wget'];
    const MODE_CMDS=COMMON_CMDS.concat(engine.commands||[]);
    const CMDS=[...new Set(MODE_CMDS)].sort();
    const editDistance=(a,b)=>{ const m=Array.from({length:b.length+1},(_,i)=>i); for(let i=1;i<=a.length;i++){let prev=m[0];m[0]=i;for(let j=1;j<=b.length;j++){const old=m[j];m[j]=Math.min(m[j]+1,m[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));prev=old;}}return m[b.length];};
    const closestCmd=(name)=>{ let best='',dist=4; CMDS.forEach(c=>{const d=editDistance(name,c);if(d<dist){dist=d;best=c;}});return dist<=2?best:''; };
    CMDS.forEach(k=>{ const kk=k.replace(/\..*/,''); if(!MAN[kk]) MAN[kk]={ name:kk, sec:'1', s:kk+' [OPCIONES]...', d:'Orden disponible en '+OS_NAME+'. Usa '+kk+' --help o consulta el cheatsheet de abajo para ver su uso.', o:[] }; });
    const COMPLETIONS = {
      journalctl:['-u','-f','-b','-n','-p','-k','-x','--since','--no-pager'],
      systemctl:['status','start','stop','restart','reload','enable','disable','--now','is-active','is-enabled','list-units','list-unit-files','daemon-reload'],
      'firewall-cmd':['--state','--reload','--permanent','--get-default-zone','--get-zones','--get-active-zones','--list-all','--list-services','--list-ports','--add-service=','--remove-service=','--query-service=','--add-port=','--remove-port=','--runtime-to-permanent','--help'],
      dnf:['install','remove','search','info','list','update','upgrade','repolist','provides','clean','installed','available'],
      ip:['a','addr','link','route','neigh'],
      parted:['mklabel','mkpart','print','rm','unit','resizepart'],
      nmcli:['dev','con','connection','general','networking','radio'],
      semanage:['port','fcontext','user','login','boolean'],
      'tuned-adm':['active','list','profile'],
      crontab:['-l','-e','-r'],
      ps:['aux','-ef','-e','-f'],
      chage:['-l','-M','-m','-E','-W'],
      rpm:['-qa','-q','-ql','-qf','-V'],
      apt:['install','remove','update','upgrade','search'],
      setenforce:['0','1','Enforcing','Permissive'],
      getsebool:['-a'],
      chmod:['u+x','g+x','o+x','+x','755','644','700','640'],
      lvcreate:['-n','-L','-l']
    };
    Object.assign(COMPLETIONS, runtime.completions||{});
    Object.keys(MAN).forEach(k=>{ const o=(MAN[k].o||[]).map(p=>String(p[0]).split(/[ \/]/)[0]).filter(x=>x&&x!=='755'||true).filter(Boolean); if(o.length){ COMPLETIONS[k]=Array.from(new Set([...(COMPLETIONS[k]||[]), ...o])); } });
    const revRender=()=>{ promptEl.textContent="(reverse-i-search)`"+revSearch.q+"': "; promptEl.style.color='#a2957d'; };
    let killBuffer='';
    const revFrom=(start)=>{ for(let i=start;i>=0;i--){ if(history[i] && history[i].includes(revSearch.q)){ revSearch.pos=i; input.value=history[i]; return true; } } return false; };
    const revStart=()=>{ if(!history.length) return; revSearch={q:'',pos:history.length-1}; input.value=''; revRender(); };
    const revEnd=(clear)=>{ revSearch=null; if(clear) input.value=''; setPrompt(); };
    const revKey=(e)=>{ const k=e.key;
      if(k==='Escape'||(e.ctrlKey&&k.toLowerCase()==='c')){ e.preventDefault(); revEnd(true); return; }
      if(e.ctrlKey&&k.toLowerCase()==='r'){ e.preventDefault(); revFrom(revSearch.pos-1); revRender(); return; }
      if(k==='Enter'){ e.preventDefault(); const v=input.value; revEnd(true); if(v.trim()){ run(v); scroll(); } return; }
      if(k==='ArrowLeft'||k==='ArrowRight'||k==='Home'||k==='End'){ revEnd(false); return; }
      if(k==='Backspace'){ e.preventDefault(); revSearch.q=revSearch.q.slice(0,-1); revFrom(history.length-1); revRender(); return; }
      if(k.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey){ e.preventDefault(); revSearch.q+=k; revFrom(revSearch.pos); revRender(); return; }
    };
    input.addEventListener('beforeinput', (e) => {
      if(booting||awaitReboot||grubState||pagerState||nmtuiState||foregroundProcess||followTimer) e.preventDefault();
    });
    input.addEventListener('keydown', (e) => {
      if(booting){ e.preventDefault(); return; }
      if(revSearch){ revKey(e); return; }
      if(awaitReboot){ if(e.key==='Enter'){ e.preventDefault(); awaitReboot=false; startGrub(); } else { e.preventDefault(); } return; }
      if(grubState){ grubKey(e); return; }
      if(pagerState){ pagerKey(e); return; }
      if(nmtuiState){ nmtuiKey(e); return; }
      if(interactive && interactive.editor){ editorKey(e); return; }
      if(foregroundProcess && !(e.ctrlKey && !e.altKey && ['c','z'].includes(e.key.toLowerCase()))){ e.preventDefault(); return; }
      if(e.ctrlKey && !e.altKey){ const k=e.key.toLowerCase();
        if(k==='l'){ e.preventDefault(); [...body.querySelectorAll('.term-out')].forEach(d=>d.remove()); return; }
        if(k==='c'){ e.preventDefault(); if(foregroundProcess){const p=foregroundProcess;if(p.onInterrupt)p.onInterrupt();if(pingTimer){clearInterval(pingTimer);pingTimer=null;}endForeground(130,'C');return;} if(followTimer){ stopFollow(); out('^C','#a2957d'); setPrompt(); scroll(); return; } if(interactive){ echoInteractive(input.value); endInteractive(); } else { echoCmd(input.value+'^C'); } input.value=''; lastStatus=130;scroll(); return; }
        if(k==='z'){e.preventDefault();if(suspendForeground())return;echoCmd(input.value+'^Z');input.value='';scroll();return;}
        if(k==='d'){e.preventDefault();if(input.value){return;}if(interactive){const cb=interactive.onLine;echoInteractive('');cb('');return;}if(remoteHost){out('logout');remoteHost=null;setPrompt();return;}if(currentUser==='root'&&userStack.length){const s=userStack.pop();currentUser=s.user;cwd=s.cwd;setPrompt();return;}out('logout');loggedIn=false;loginRecords.filter(r=>r.active&&r.user===currentUser).forEach(r=>{r.active=false;r.logout=Date.now();});if(MODE==='linux')startLogin();else{loggedIn=true;setPrompt();}return;}
        if(k==='u'){ e.preventDefault(); input.value=''; return; }
        if(k==='w'){e.preventDefault();const pos=input.selectionStart??input.value.length,left=input.value.slice(0,pos),m=left.match(/\s*\S+\s*$/);killBuffer=m?m[0]:'';input.value=left.slice(0,left.length-killBuffer.length)+input.value.slice(pos);const np=pos-killBuffer.length;input.setSelectionRange(np,np);return;}
        if(k==='k'){e.preventDefault();const pos=input.selectionStart??input.value.length;killBuffer=input.value.slice(pos);input.value=input.value.slice(0,pos);input.setSelectionRange(pos,pos);return;}
        if(k==='y'){e.preventDefault();const pos=input.selectionStart??input.value.length;input.value=input.value.slice(0,pos)+killBuffer+input.value.slice(pos);input.setSelectionRange(pos+killBuffer.length,pos+killBuffer.length);return;}
        if(k==='a'){ e.preventDefault(); input.setSelectionRange(0,0); return; }
        if(k==='e'){ e.preventDefault(); const L=input.value.length; input.setSelectionRange(L,L); return; }
        if(k==='r'){ e.preventDefault(); if(!interactive) revStart(); return; }
      }
      if(interactive){ if(e.key==='Enter'){ const v=input.value; echoInteractive(v); input.value=''; const cb=interactive.onLine; cb(v); scroll(); save(); } else if(e.key==='ArrowUp'||e.key==='ArrowDown'||e.key==='Tab'){ e.preventDefault(); } return; }
      if(e.key==='Enter'){ run(input.value); input.value=''; scroll(); }
      else if(e.key==='ArrowUp'){ e.preventDefault(); if(history.length&&hIdx>0){ hIdx--; input.value=history[hIdx]; } }
      else if(e.key==='ArrowDown'){ e.preventDefault(); if(hIdx<history.length-1){ hIdx++; input.value=history[hIdx]; } else { hIdx=history.length; input.value=''; } }
      else if(e.key==='Tab'){ e.preventDefault(); const val=input.value; if(val.trim()===''){ return; } const parts=val.split(/\s+/); const endsSpace=/\s$/.test(val); const tok=endsSpace?'':parts[parts.length-1]; const cmd=parts[0];
        if(parts.length<=1 && !endsSpace){ const m=CMDS.filter(c=>c.startsWith(tok)); if(m.length===1){ input.value=m[0]+' '; } else if(m.length>1){ out(m.join('   ')); scroll(); } return; }
        const opts=COMPLETIONS[cmd]; if(opts){ const m=opts.filter(o=>o.startsWith(tok)); if(m.length===1){ const base=endsSpace?val:val.slice(0,val.length-tok.length); input.value=base+m[0]+(m[0].endsWith('=')?'':' '); return; } else if(m.length>0){ out(m.join('   ')); scroll(); return; } }
        const seg=tok.replace(/^\.\//,''); const node=getNode(cwd); if(node&&node.type==='dir'&&seg){ const m=Object.keys(node.children).filter(k=>k.startsWith(seg)); if(m.length===1){ const ch=node.children[m[0]]; const prefix=val.slice(0,val.length-tok.length); const dotslash=tok.startsWith('./')?'./':''; input.value=prefix+dotslash+m[0]+(ch.type==='dir'?'/':' '); } else if(m.length>1){ out(m.join('   ')); scroll(); } } }
    });
    body.addEventListener('click', ()=>input.focus());
    const applySolved = () => {
      resetState();
      const e0=net.eth0; e0.up=true; e0.method='manual'; e0.ip='192.168.1.20'; e0.prefix=24; e0.gw='192.168.1.1'; e0.dns='192.168.1.254';
      const setF=(segs,content,opts)=>{ const par=getNode(segs.slice(0,-1)); if(par&&par.type==='dir') par.children[segs[segs.length-1]]=file(content,opts||{owner:'root',group:'root'}); };
      const hn=getNode(['etc','hostname']); if(hn)hn.content='nodo1.lab.local';
      // repos
      const rd=getNode(['etc','yum.repos.d']); if(rd) rd.children['lab.repo']=file('[baseos]\nname=Rocky 9 BaseOS\nbaseurl=http://mirror.lab.local/rocky9/x86_64/BaseOS\nenabled=1\ngpgcheck=0\n\n[appstream]\nname=Rocky 9 AppStream\nbaseurl=http://mirror.lab.local/rocky9/x86_64/AppStream\nenabled=1\ngpgcheck=0',{owner:'root'});
      // usuarios y grupos
      groupsDb.add('olimpo'); groupsDb.add('datavg');
      users.zeus={uid:1101,gid:1101,home:'/home/zeus',groups:['zeus','olimpo'],shell:'/bin/bash',password:'cambiame1'};
      users.hera={uid:1102,gid:1102,home:'/home/hera',groups:['hera','olimpo'],shell:'/bin/bash',password:'cambiame1'};
      users.ares={uid:1103,gid:1103,home:'/home/ares',groups:['ares'],shell:'/sbin/nologin',password:'cambiame1'};
      users.apolo={uid:4120,gid:4120,home:'/home/apolo',groups:['apolo'],shell:'/bin/bash',password:'orquidea3'};
      users.hermes={uid:1104,gid:1104,home:'/home/hermes',groups:['hermes'],shell:'/bin/bash',password:'cambiame1'};
      ['zeus','hera','apolo','hermes'].forEach(u=>{ mkdirp('/home/'+u); const h=getNode(['home',u]); if(h){h.owner=u;h.group=u;} });
      rebuildPasswd&&rebuildPasswd();
      // directorio colaborativo SGID
      mkdirp('/datos/olimpo'); const di=getNode(['datos','olimpo']); if(di){ di.group='olimpo'; di.mode='rwxrws---'; }
      // cron hera
      mkdirp('/var/spool/cron'); const cr=getNode(['var','spool','cron']); if(cr) cr.children['hera']=file('* * * * * logger "Backup diario"',{owner:'hera',group:'hera'});
      // tar bzip2
      setF(['root','varlog-backup.tar.bz2'],'TARLIST:bzip2:/var/log');
      // permisos /var/tmp/hosts
      mkdirp('/var/tmp'); const hostsC=(getNode(['etc','hosts'])||{content:''}).content; const vt=getNode(['var','tmp']); if(vt){ vt.children['hosts']=file(hostsC,{owner:'root',group:'root'}); vt.children['hosts'].mode='rw-r-----'; vt.children['hosts'].acl=[{type:'user',name:'zeus',perms:'rw-'},{type:'user',name:'ares',perms:'---'}]; }
      // chrony
      const ch=getNode(['etc','chrony.conf']); if(ch)ch.content+='\nserver ntp.lab.local iburst';
      services.chronyd={enabled:true,active:true};
      // find hera
      mkdirp('/root/herafiles');
      // grep coincidencias
      setF(['root','coincidencias'],'rich\nostrich\nenrich\nrichard');
      // sudoers zeus
      const sdd=getNode(['etc','sudoers.d']); if(sdd) sdd.children['zeus']=file('zeus ALL=(ALL) NOPASSWD: ALL',{owner:'root'});
      // LVM appvol
      lvm.vgs.push({name:'datavg',pvs:['/dev/sdb1'],vsize:9.5,vfree:9.0}); lvm.pvs.push({name:'/dev/sdb1',vg:'datavg',psize:9.5});
      const sdb=disks.find(d=>d.name==='sdb'); if(sdb&&!sdb.parts.length){ sdb.parts.push({name:'sdb1',size:'9G',fstype:'LVM2_member',uuid:'lvm0-sdb1',mount:''}); sdb.labeled=true; }
      lvm.lvs.push({name:'appvol',vg:'datavg',size:0.47,fstype:'ext4',mount:'/mnt/appvol',uuid:'app0-vol'}); mkdirp('/mnt/appvol');
      // LV reducido ~250MB
      lvm.lvs.push({name:'redu',vg:'datavg',size:0.244,fstype:'ext4',mount:'/mnt/redu',reduced:true,uuid:'red0-vol'}); mkdirp('/mnt/redu');
      // swap 512M en sdb + fstab
      if(sdb) sdb.parts.push({name:'sdb2',size:'512M',fstype:'swap',uuid:'swap-0512',mount:'[SWAP]'});
      const fs=getNode(['etc','fstab']); if(fs) fs.content+='\n/dev/mapper/datavg-appvol  /mnt/appvol  ext4  defaults  0 0\n/dev/sdb2  none  swap  defaults  0 0';
      // tuned
      tunedProfile='throughput-performance';
      // script saludo
      mkdirp('/usr/local/bin'); const ulb=getNode(['usr','local','bin']); if(ulb){ ulb.children['saludo']=file('#!/bin/bash\necho "Hola equipo olimpo"',{owner:'root'}); ulb.children['saludo'].mode='rwxr-xr-x'; }
      // httpd /sitio/web + puerto 8090
      mkdirp('/sitio/web'); setF(['sitio','web','index.html'],'<h1>Sitio del laboratorio</h1>');
      const conf=getNode(['etc','httpd','conf','httpd.conf']); if(conf)conf.content=conf.content.replace(/DocumentRoot\s+"[^"]*"/,'DocumentRoot "/sitio/web"');
      const cdp=getNode(['etc','httpd','conf.d']); if(cdp)cdp.children['port.conf']=file('Listen 8090',{owner:'root'});
      selinux.httpPorts=(selinux.httpPorts||[80,443,8080]).concat(8090);
      fw.services.add('http');
      services.httpd={enabled:true,active:true,port:8090};
      // podman rootless hermes
      linger['hermes']=true; userUnits['hermes']={'container-webapp':{enabled:true,active:true}};
      mkdirp('/home/hermes/.config/systemd/user'); const usd=getNode(['home','hermes','.config','systemd','user']); if(usd)usd.children['container-webapp.service']=file('[Unit]\nDescription=Podman container-webapp\n[Service]\nExecStart=/usr/bin/podman start webapp\n[Install]\nWantedBy=default.target',{owner:'hermes',group:'hermes'});
      // P1
      rootRecovered=true; users.root.password='titanio7';
      // historial de comandos (para investigar cómo se resolvió)
      history = ['nmcli con mod eth0 ipv4.method manual ipv4.addresses 192.168.1.20/24 ipv4.gateway 192.168.1.1 ipv4.dns 192.168.1.254','nmcli con up eth0','hostnamectl set-hostname nodo1.lab.local','groupadd olimpo','useradd -G olimpo zeus','useradd -G olimpo hera','useradd -s /sbin/nologin ares','useradd -u 4120 apolo','mkdir -p /datos/olimpo','chgrp olimpo /datos/olimpo','chmod 2770 /datos/olimpo','crontab -e -u hera','tar -cjf /root/varlog-backup.tar.bz2 /var/log','cp /etc/hosts /var/tmp/hosts','chmod 640 /var/tmp/hosts','setfacl -m u:zeus:rw /var/tmp/hosts','setfacl -m u:ares:0 /var/tmp/hosts','systemctl enable --now chronyd','find / -user hera -exec cp -r {} /root/herafiles \\;','grep rich /usr/share/dict/words > /root/coincidencias','echo "zeus ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/zeus','vgcreate datavg /dev/sdb1','lvcreate -n appvol -l 60 datavg','mkfs.ext4 /dev/datavg/appvol','mount /dev/datavg/appvol /mnt/appvol','mkswap /dev/sdb2','swapon /dev/sdb2','tuned-adm profile throughput-performance','vi /usr/local/bin/saludo','chmod 755 /usr/local/bin/saludo','semanage port -a -t http_port_t -p tcp 8090','firewall-cmd --add-service=http --permanent','systemctl enable --now httpd','loginctl enable-linger hermes'];
      hIdx=history.length;
      currentUser='root'; cwd=['root']; loggedIn=true; recovery=null;
      try{ const done={}; for(let i=0;i<21;i++)done[i]=true; localStorage.setItem('s2ktux-chal-done-v12-linux',JSON.stringify(done)); }catch(e){}
      const selE=document.querySelector('#chal-select'); if(selE){ [...selE.options].forEach((o)=>{ if(!o.textContent.startsWith('✔')) o.textContent='✔ '+o.textContent; }); }
      { const pr=document.querySelector('#chal-progress'); if(pr) pr.innerHTML='<div style="display:flex;justify-content:space-between;align-items:baseline;font-family:&quot;Press Start 2P&quot;,monospace;font-size:10px;color:var(--head);margin-bottom:8px"><span>PROGRESO</span><span style="color:#8fa876">21 / 21  (100%)</span></div><div style="height:16px;background:var(--surface);border:3px solid var(--line);box-shadow:3px 3px 0 var(--surface2);padding:2px"><div style="height:100%;width:100%;background:repeating-linear-gradient(90deg,#8fa876 0 10px,#7d9866 10px 12px)"></div></div>'; const cg=document.querySelector('#chal-congrats'); if(cg){ cg.style.display='none'; cg.innerHTML=''; } }
      clearBody();
      out(OS_NAME+' · '+(CERTIFICATION||'Linux')+' — MÁQUINA RESUELTA','#8fa876');
      out('# Todas las prácticas están hechas. Investiga cómo: revisa  history , los usuarios (cat /etc/passwd, id zeus), los ficheros creados, /etc/fstab, systemctl status, etc.','#6f6250');
      out('# La contraseña de root es  titanio7 . Compara tu solución con este sistema ya resuelto.','#6f6250');
      out('Last login: '+new Date().toString().slice(0,24)+' on tty1','#a2957d'); out('');
      setPrompt(); save(); scroll(); input.focus();
    };
    { const rb=document.querySelector('#term-reboot'); if(rb) rb.addEventListener('click', ()=>{ if(!grubState&&!booting){ startGrub(); } input.focus(); }); }
    { const rm=document.querySelector('#term-rebootm'); if(rm) rm.addEventListener('click', ()=>{ if(!grubState&&!booting){ rebootMachine(); } input.focus(); }); }
    { const sv=document.querySelector('#term-solved'); if(sv) sv.addEventListener('click', ()=>{ if(booting||grubState) return; booting=true; recovery=null; grubState=null; interactive=null; clearBody(); promptEl.textContent=''; input.value='';
      const pasos=['Restaurando estado de la máquina...','Aplicando configuración de red...','Creando usuarios y grupos...','Desplegando servicios y almacenamiento...','Cargando historial de comandos...','Máquina lista.'];
      const bar=document.createElement('div'); bar.className='term-out'; bar.style.color='#8fa876'; body.insertBefore(bar,line);
      const lbl=document.createElement('div'); lbl.className='term-out'; lbl.style.color='#a2957d'; body.insertBefore(lbl,line);
      let pct=0; const iv=setInterval(()=>{ pct+=Math.floor(6+Math.random()*11); if(pct>100)pct=100; const f=Math.round(pct/5); bar.textContent='['+'#'.repeat(f)+'.'.repeat(20-f)+'] '+String(pct).padStart(3)+'%'; lbl.textContent=pasos[Math.min(pasos.length-1,Math.floor(pct/(100/pasos.length)))]; scroll(); if(pct>=100){ clearInterval(iv); booting=false; applySolved(); } }, 150);
      input.focus(); }); }
    { const rs=document.querySelector('#term-reset'); let resetArmed=false,resetArmTimer=null; const resetLabel=rs?rs.textContent:''; if(rs) rs.addEventListener('click', ()=>{ if(booting)return; if(!resetArmed){resetArmed=true;rs.textContent='⚠ Confirmar borrado';rs.style.color='#c0392b';resetArmTimer=setTimeout(()=>{resetArmed=false;rs.textContent=resetLabel;rs.style.color='var(--head)';},4000);return;} clearTimeout(resetArmTimer);resetArmed=false; booting=true; recovery=null; grubState=null; interactive=null; clearBody(); promptEl.textContent=''; input.value='';
      const pasos=['Deteniendo servicios del sistema...','Cerrando sesiones de usuario...','Desmontando sistemas de archivos...','Borrando datos de /home y /root...','Restableciendo la configuración...','Reinicializando el disco de prácticas...','Máquina restaurada a fábrica.'];
      const bar=document.createElement('div'); bar.className='term-out'; bar.style.color='#8fa876'; body.insertBefore(bar,line);
      const lbl=document.createElement('div'); lbl.className='term-out'; lbl.style.color='#a2957d'; body.insertBefore(lbl,line);
      let pct=0; const iv=setInterval(()=>{ pct+=Math.floor(5+Math.random()*10); if(pct>100)pct=100; const f=Math.round(pct/5); bar.textContent='['+'#'.repeat(f)+'.'.repeat(20-f)+'] '+String(pct).padStart(3)+'%'; lbl.textContent=pasos[Math.min(pasos.length-1, Math.floor(pct/(100/pasos.length)))]; scroll(); if(pct>=100){ clearInterval(iv); setTimeout(()=>{ try{ localStorage.removeItem(STORE);localStorage.removeItem(STORE+'-backup'); LEGACY_STORES.forEach(k=>localStorage.removeItem(k)); ['s2ktux-chal-done-v12-'+MODE,'s2ktux-chal-manual-v12-'+MODE,'s2ktux-chal-done-v11-'+MODE+'-principal','s2ktux-chal-manual-v11-'+MODE+'-principal','s2ktux-chal-done-v10-'+MODE,'s2ktux-chal-manual-v10-'+MODE,'s2ktux-reports-v2-'+MODE,'s2ktux-reports-v1-'+MODE+'-principal'].forEach(k=>localStorage.removeItem(k));sessionStorage.setItem('s2ktux-terminal-internal-reload','1'); }catch(e){} location.reload(); }, 550); } }, 170);
      input.focus(); }); }

    if(MODE==='linux'){
      if(loggedIn)setPrompt();else startLogin();
    } else {
      currentUser='root'; loggedIn=true;
      if(!savedScroll){
        out(OS_NAME,'#8fa876');
        out('Kernel '+KERNEL+' on an '+ARCH); out('');
        if(MODE==='docker'){ out('Docker Lab · '+localHostname(),'#e0a458'); out(dockerInstalled?'Docker Engine '+DOCKER_VERSION+' instalado.':'Docker Engine no está instalado. Prepara el host desde la práctica guiada o consulta el cheatsheet del entorno.','#a2957d'); }
        else { out('CKA Lab · control-plane','#e0a458'); out('Cluster activo: 3 nodos · avisos pendientes en worker-2 y pod/api-broken.','#a2957d'); out('Inspecciona el estado del clúster y decide por dónde empezar.','#a2957d'); }
        out('');
      }
      setPrompt(); save();
    }
    setTimeout(()=>{ input.focus(); scroll(); },100);

    // ---------------- prácticas guiadas (propiedad del runtime elegido) ----------------
    const CH=typeof runtime.createChallenges==='function'?runtime.createChallenges(runtimeContext):[];
    // ---------------- evaluación del trabajo realizado ----------------
    const REPORT_KEY='s2ktux-reports-v2-'+MODE+(IS_EXAM?'-exam':''); let reports=[]; try{reports=JSON.parse(localStorage.getItem(REPORT_KEY)||'[]')||[];}catch(e){}
    const scoreChallenge=(c,r)=>{ if(r&&r.ok)return 100; const div=document.createElement('div');div.innerHTML=c.goal; const targets=[...div.querySelectorAll('code,b')].map(x=>x.textContent.trim().toLowerCase()).filter(x=>x.length>1); const log=history.join('\n').toLowerCase(); const hits=targets.filter(t=>log.includes(t)||log.includes(t.split(/[\s/:]/)[0])).length; const prefix=MODE==='kubernetes'?'kubectl':MODE==='docker'?'docker':''; const relevant=history.slice(-30).filter(h=>!prefix||h.startsWith(prefix)||h.startsWith('systemctl')||h.startsWith('curl ')).length; const activity=Math.min(60,relevant*15); const evidence=targets.length?Math.round((hits/targets.length)*8)*10:0; return Math.min(80,Math.max(activity,evidence)); };
    const saveReports=()=>{ try{localStorage.setItem(REPORT_KEY,JSON.stringify(reports.slice(-80)));}catch(e){} };
    const selEl=document.querySelector('#chal-select'), bodyEl=document.querySelector('#chal-body'), resEl=document.querySelector('#chal-result'), btnEl=document.querySelector('#chal-check');
    if(selEl && bodyEl && btnEl){
      const examPanel=document.querySelector('#exam-panel'),examStart=document.querySelector('#exam-start'),examFinish=document.querySelector('#exam-finish'),examClock=document.querySelector('#exam-clock');
      const EXAM_KEY='s2ktux-exam-v2'; let examState=null,examTimer=null; try{examState=JSON.parse(localStorage.getItem(EXAM_KEY)||'null');}catch(e){}
      if(MODE==='kubernetes'&&examPanel)examPanel.dataset.show='1';
      if(MODE==='kubernetes'&&new URLSearchParams(location.search).get('exam')==='1'&&!examState){ examState={active:true,started:Date.now(),ends:Date.now()+7200000}; try{localStorage.setItem(EXAM_KEY,JSON.stringify(examState));}catch(e){} }
      let examActive=!!(examState&&examState.active);
      const finishExam=(automatic)=>{ if(!examState)return; const results=CH.map((c,i)=>{let r;try{r=c.check();}catch(e){r={ok:false,msg:'No se pudo validar esta tarea.'};}return{type:'exam',index:i,title:c.title,score:scoreChallenge(c,r),message:r.msg,at:Date.now()};}); const total=Math.round(results.reduce((a,r)=>a+r.score,0)/results.length); reports=reports.concat(results); reports.push({type:'exam-summary',index:-1,title:'Simulacro CKA',score:total,message:(automatic?'Tiempo agotado. ':'')+(total>=74?'Resultado orientativo: aprobado.':'Resultado orientativo: sigue practicando las tareas pendientes.'),at:Date.now()}); saveReports(); examState.active=false;examState.finished=Date.now();examState.score=total;try{localStorage.setItem(EXAM_KEY,JSON.stringify(examState));}catch(e){} examActive=false;if(examTimer)clearInterval(examTimer);btnEl.style.display='';if(examFinish)examFinish.style.display='none';if(examStart)examStart.style.display='';if(examClock)examClock.textContent='Resultado: '+total+'%';resEl.innerHTML='<span style="font-family:&quot;Press Start 2P&quot;,monospace;font-size:11px;color:#8fa876">SIMULACRO FINALIZADO · '+total+'%</span>'; };
      const tickExam=()=>{ if(!examState||!examState.active)return; const left=Math.max(0,examState.ends-Date.now()); const h=Math.floor(left/3600000),m=Math.floor(left%3600000/60000),s=Math.floor(left%60000/1000); if(examClock)examClock.textContent='Tiempo restante · '+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0'); if(left<=0)finishExam(true); };
      const syncExamUI=()=>{ if(MODE!=='kubernetes')return; if(examActive){btnEl.style.display='none';if(examStart)examStart.style.display='none';if(examFinish)examFinish.style.display='';tickExam();examTimer=setInterval(tickExam,1000);} else if(examState&&examState.score!=null&&examClock)examClock.textContent='Último resultado · '+examState.score+'%'; };
      if(examStart)examStart.addEventListener('click',()=>{ if(!confirm('El simulacro abrirá un clúster limpio. Tendrás dos horas y las comprobaciones quedarán ocultas hasta el final.'))return; try{localStorage.removeItem('s2ktux-term-state-v11-kubernetes-exam');localStorage.removeItem('s2ktux-chal-done-v12-kubernetes-exam');localStorage.removeItem('s2ktux-chal-manual-v12-kubernetes-exam');localStorage.removeItem(REPORT_KEY);localStorage.removeItem(EXAM_KEY);}catch(e){}location.href='terminal.html?mode=kubernetes&exam=1&enter=1'; });
      if(examFinish)examFinish.addEventListener('click',()=>{if(confirm('¿Finalizar y corregir ahora el simulacro?'))finishExam(false);});
      const CHKEY='s2ktux-chal-done-v12-'+MODE+(IS_EXAM?'-exam':''); let chalDone={}; try{ const legacy=!IS_EXAM?(localStorage.getItem('s2ktux-chal-done-v11-'+MODE+'-principal')||localStorage.getItem('s2ktux-chal-done-v10-'+MODE)):null; chalDone=JSON.parse(localStorage.getItem(CHKEY)||legacy||'{}')||{}; }catch(e){}
      const updateProgress=()=>{ const pr=document.querySelector('#chal-progress'); if(!pr) return; const total=CH.length; let done=0; for(let i=0;i<total;i++){ if(chalDone[i]) done++; } const pct=Math.round(done/total*100); pr.innerHTML='<div style="display:flex;justify-content:space-between;align-items:baseline;font-family:&quot;Press Start 2P&quot;,monospace;font-size:10px;color:var(--head);margin-bottom:8px"><span>PROGRESO</span><span style="color:#8fa876">'+done+' / '+total+'  ('+pct+'%)</span></div><div style="height:16px;background:var(--surface);border:3px solid var(--line);box-shadow:3px 3px 0 var(--surface2);padding:2px"><div style="height:100%;width:'+pct+'%;background:repeating-linear-gradient(90deg,#8fa876 0 10px,#7d9866 10px 12px);transition:width .3s"></div></div>'; };
      selEl.replaceChildren();
      CH.forEach((c,i)=>{ const o=document.createElement('option'); o.value=i; o.textContent=(chalDone[i]?'✔ ':'')+(i+1)+'. '+c.title; selEl.appendChild(o); });
      const publicResult=(r)=>r.ok?r:{ok:false,msg:MODE==='linux'?r.msg:'El estado actual todavía no cumple todos los requisitos del enunciado.'};
      const showResult=(r)=>{ r=publicResult(r); resEl.innerHTML='<span style="font-family:&quot;Press Start 2P&quot;,monospace;font-size:11px;color:'+(r.ok?'#5a8a3c':'#c0392b')+'">'+(r.ok?'✔ CONSEGUIDO':'✗ TODAVÍA NO')+'</span> &nbsp;<span style="color:var(--text)">'+r.msg+'</span>'; };
      const renderChal=()=>{ const i=selEl.value||'0'; const c=CH[Number(i)]; if(!c){ bodyEl.textContent='No se han podido cargar las prácticas de este entorno.'; btnEl.disabled=true; return; } bodyEl.innerHTML='<div style="font-family:&quot;Press Start 2P&quot;,monospace;font-size:9px;color:#d97757;margin-bottom:12px">'+c.badge+(chalDone[i]?'  ✔ completado':'')+'</div><div style="font-family:&quot;Press Start 2P&quot;,monospace;font-size:13px;color:var(--head);line-height:1.5;margin-bottom:14px">'+c.title+'</div><div style="font-size:19px;color:var(--text);line-height:1.45;margin-bottom:12px">'+c.goal+'</div>'; if(examActive){resEl.innerHTML='<span style="color:var(--muted)">Validación oculta durante el simulacro.</span>';}else if(chalDone[i]){ showResult({ok:true,msg:'Ya lo conseguiste antes.'}); } else { resEl.innerHTML=''; } };
      selEl.addEventListener('change', renderChal); renderChal(); updateProgress();
      const MKEY='s2ktux-chal-manual-v12-'+MODE+(IS_EXAM?'-exam':''); let manualDone={}; try{ const legacy=!IS_EXAM?(localStorage.getItem('s2ktux-chal-manual-v11-'+MODE+'-principal')||localStorage.getItem('s2ktux-chal-manual-v10-'+MODE)):null; manualDone=JSON.parse(localStorage.getItem(MKEY)||legacy||'{}')||{}; }catch(e){}
      const congrats=()=>{ const total=CH.length; let m=0; for(let i=0;i<total;i++) if(manualDone[i]) m++; if(m>=total){ const d=document.querySelector('#chal-congrats'); if(d){ d.style.display='block'; const cert=MODE==='kubernetes'?'ESTÁS PREPARADO PARA EL CKA':MODE==='docker'?'DOMINAS LOS FUNDAMENTOS DE DOCKER':'ESTÁS PREPARADO PARA '+(CERTIFICATION||'RHCSA 9'); d.innerHTML='<div style="margin-top:18px;padding:20px 22px;background:#1a2410;border:3px solid #8fa876;box-shadow:5px 5px 0 var(--line);text-align:center"><div style="font-family:&quot;Press Start 2P&quot;,monospace;font-size:15px;color:#8fa876;line-height:1.6">🏆 FELICIDADES</div><div style="font-family:&quot;Press Start 2P&quot;,monospace;font-size:12px;color:#e9ddc7;line-height:1.7;margin-top:12px">'+cert+'</div><div style="font-family:&quot;Share Tech Mono&quot;,monospace;font-size:15px;color:#a2957d;margin-top:12px">Has completado las '+total+' prácticas por tu cuenta.</div></div>'; } } };
      btnEl.addEventListener('click', ()=>{ if(examActive)return; const i=selEl.value; const c=CH[i]; if(!c)return; let r; try{ r=c.check(); }catch(e){ r={ok:false,msg:'No se pudo comprobar esta práctica.'}; } const score=scoreChallenge(c,r), visible=publicResult(r); reports.push({type:'practice',index:Number(i),title:c.title,score,message:visible.msg,at:Date.now()}); saveReports(); if(r.ok && !chalDone[i]){ chalDone[i]=true; manualDone[i]=true; try{ localStorage.setItem(CHKEY, JSON.stringify(chalDone)); localStorage.setItem(MKEY, JSON.stringify(manualDone)); }catch(e){} selEl.options[i].textContent='✔ '+(Number(i)+1)+'. '+c.title; updateProgress(); congrats(); } showResult(visible); });
      congrats(); syncExamUI(); renderChal();
    }
}
