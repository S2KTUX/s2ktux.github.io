// Fixture exclusiva de las pruebas. No forma parte de las opciones del alumno.
export function applySolvedFixture({net,getNode,file,groupsDb,users,mkdirp,rebuildPasswd,lvm,disks,linuxWorkerEnabled,selinux,fw,services,images,containers,linger,userUnits}){
 let tunedProfile,rootRecovered,history;
    const e0 = net.eth0;
    e0.up = true;
    e0.method = "manual";
    e0.ip = "192.168.1.20";
    e0.prefix = 24;
    e0.gw = "192.168.1.1";
    e0.dns = "192.168.1.254";
    const setF = (segs, content, opts) => {
      const par = getNode(segs.slice(0, -1));
      if (par && par.type === "dir")
        par.children[segs[segs.length - 1]] = file(
          content,
          opts || { owner: "root", group: "root" },
        );
    };
    const hn = getNode(["etc", "hostname"]);
    if (hn) hn.content = "nodo1.lab.local";
    // repos
    const rd = getNode(["etc", "yum.repos.d"]);
    if (rd)
      rd.children["lab.repo"] = file(
        "[baseos]\nname=Rocky 9 BaseOS\nbaseurl=http://mirror.lab.local/rocky9/x86_64/BaseOS\nenabled=1\ngpgcheck=0\n\n[appstream]\nname=Rocky 9 AppStream\nbaseurl=http://mirror.lab.local/rocky9/x86_64/AppStream\nenabled=1\ngpgcheck=0",
        { owner: "root" },
      );
    // usuarios y grupos
    groupsDb.add("olimpo");
    groupsDb.add("datavg");
    users.zeus = {
      uid: 1101,
      gid: 1101,
      home: "/home/zeus",
      groups: ["zeus", "olimpo"],
      shell: "/bin/bash",
      password: "cambiame1",
    };
    users.hera = {
      uid: 1102,
      gid: 1102,
      home: "/home/hera",
      groups: ["hera", "olimpo"],
      shell: "/bin/bash",
      password: "cambiame1",
    };
    users.ares = {
      uid: 1103,
      gid: 1103,
      home: "/home/ares",
      groups: ["ares"],
      shell: "/sbin/nologin",
      password: "cambiame1",
    };
    users.apolo = {
      uid: 4120,
      gid: 4120,
      home: "/home/apolo",
      groups: ["apolo"],
      shell: "/bin/bash",
      password: "orquidea3",
    };
    users.hermes = {
      uid: 1104,
      gid: 1104,
      home: "/home/hermes",
      groups: ["hermes"],
      shell: "/bin/bash",
      password: "cambiame1",
    };
    ["zeus", "hera", "apolo", "hermes"].forEach((u) => {
      mkdirp("/home/" + u);
      const h = getNode(["home", u]);
      if (h) {
        h.owner = u;
        h.group = u;
      }
    });
    rebuildPasswd && rebuildPasswd();
    // directorio colaborativo SGID
    mkdirp("/datos/olimpo");
    const di = getNode(["datos", "olimpo"]);
    if (di) {
      di.group = "olimpo";
      di.mode = "rwxrws---";
    }
    // cron hera
    mkdirp("/var/spool/cron");
    const cr = getNode(["var", "spool", "cron"]);
    if (cr)
      cr.children["hera"] = file('* * * * * logger "Backup diario"', {
        owner: "hera",
        group: "hera",
      });
    // tar bzip2
    setF(["root", "varlog-backup.tar.bz2"], "TARJSON:bzip2:" + JSON.stringify([{path:"var/log",node:getNode(["var","log"])}]));
    // permisos /var/tmp/hosts
    mkdirp("/var/tmp");
    const hostsC = (getNode(["etc", "hosts"]) || { content: "" }).content;
    const vt = getNode(["var", "tmp"]);
    if (vt) {
      vt.children["hosts"] = file(hostsC, { owner: "root", group: "root" });
      vt.children["hosts"].mode = "rw-rw-r--";
      vt.children["hosts"].acl = [
        { type: "user", name: "zeus", perms: "rw-" },
        { type: "user", name: "ares", perms: "---" },
      ];
    }
    // chrony
    const ch = getNode(["etc", "chrony.conf"]);
    if (ch) ch.content += "\nserver ntp.lab.local iburst";
    services.chronyd = { enabled: true, active: true };
    // find hera
    mkdirp("/root/herafiles");
    const ownedByHera=[];
    const collectHera=(node,path=[])=>{
      if(!node||path.join('/').startsWith('root/herafiles'))return;
      if(node.owner==='hera')ownedByHera.push([path,node]);
      if(node.type==='dir')for(const [name,child] of Object.entries(node.children))collectHera(child,path.concat(name));
    };
    collectHera(getNode([]));
    for(const [path,node] of ownedByHera){
      const destination=['root','herafiles',...path];mkdirp('/'+destination.slice(0,-1).join('/'));
      getNode(destination.slice(0,-1)).children[destination.at(-1)]=JSON.parse(JSON.stringify(node));
    }
    // grep coincidencias
    setF(["root", "coincidencias"], (getNode(['usr','share','dict','words'])?.content||'').split('\n').filter(line=>line.includes('rich')).join('\n'));
    // sudoers zeus
    const sdd = getNode(["etc", "sudoers.d"]);
    if (sdd)
      sdd.children["zeus"] = file("zeus ALL=(ALL) NOPASSWD: ALL", {
        owner: "root",
      });
    // LVM appvol
    lvm.vgs.push({
      name: "datavg",
      pvs: ["/dev/sdb1"],
      vsize: 9.5,
      vfree: 9.0,
    });
    lvm.pvs.push({ name: "/dev/sdb1", vg: "datavg", psize: 9.5 });
    const sdb = disks.find((d) => d.name === "sdb");
    if (sdb && !sdb.parts.length) {
      sdb.parts.push({
        name: "sdb1",
        size: "9G",
        fstype: "LVM2_member",
        uuid: "lvm0-sdb1",
        mount: "",
      });
      sdb.labeled = true;
    }
    lvm.lvs.push({
      name: "appvol",
      vg: "datavg",
      size: 60 * (4 / 1024),
      extents: 60,
      extentSizeM: 4,
      fstype: "ext4",
      mount: "/mnt/appvol",
      uuid: "app0-vol",
    });
    mkdirp("/mnt/appvol");
    // LV reducido ~250MB
    lvm.lvs.push({
      name: "redu",
      vg: "datavg",
      size: 0.244,
      fstype: "ext4",
      mount: "/mnt/redu",
      reduced: true,
      uuid: "red0-vol",
    });
    mkdirp("/mnt/redu");
    // swap 512M en sdb + fstab
    if (sdb)
      sdb.parts.push({
        name: "sdb2",
        size: "512M",
        fstype: "swap",
        uuid: "swap-0512",
        mount: "[SWAP]",
      });
    const fs = getNode(["etc", "fstab"]);
    if (fs)
      fs.content +=
        "\n/dev/mapper/datavg-appvol  /mnt/appvol  ext4  defaults  0 0\n/dev/sdb2  none  swap  defaults  0 0";
    // tuned
    tunedProfile = linuxWorkerEnabled ? "virtual-host" : "virtual-guest";
    // script saludo
    mkdirp("/usr/local/bin");
    const ulb = getNode(["usr", "local", "bin"]);
    if (ulb) {
      ulb.children["saludo"] = file('#!/bin/bash\necho "Hola equipo olimpo"', {
        owner: "root",
      });
      ulb.children["saludo"].mode = "rwxr-xr-x";
    }
    // httpd /sitio/web + puerto 8090
    mkdirp("/sitio/web");
    setF(["sitio", "web", "index.html"], "<h1>Sitio del laboratorio</h1>");
    getNode(['sitio','web']).context='httpd_sys_content_t';
    getNode(['sitio','web','index.html']).context='httpd_sys_content_t';
    const conf = getNode(["etc", "httpd", "conf", "httpd.conf"]);
    if (conf)
      conf.content = conf.content.replace(
        /DocumentRoot\s+"[^"]*"/,
        'DocumentRoot "/sitio/web"',
      );
    const cdp = getNode(["etc", "httpd", "conf.d"]);
    if (cdp) cdp.children["port.conf"] = file("Listen 8090", { owner: "root" });
    selinux.httpPorts = (selinux.httpPorts || [80, 443, 8080]).concat(8090);
    fw.services.add("http");
    services.httpd = { enabled: true, active: true, port: 8090 };
    // podman rootless hermes
    if(!images.some(image=>image.repo==='httpd'&&image.tag==='latest'))images.push({repo:'httpd',tag:'latest',id:'solved-httpd',size:'148MB'});
    containers.push({id:'solved-webapp',name:'webapp',image:'httpd:latest',owner:'hermes',engine:'podman',running:true,mounts:[{type:'bind',source:'/opt/entrada',target:'/data/in'},{type:'bind',source:'/opt/salida',target:'/data/out'}],ports:'',networks:{}});
    linger["hermes"] = true;
    userUnits["hermes"] = {
      "container-webapp": { enabled: true, active: true },
    };
    mkdirp("/home/hermes/.config/systemd/user");
    const usd = getNode(["home", "hermes", ".config", "systemd", "user"]);
    if (usd)
      usd.children["container-webapp.service"] = file(
        "[Unit]\nDescription=Podman container-webapp\n[Service]\nExecStart=/usr/bin/podman start webapp\n[Install]\nWantedBy=default.target",
        { owner: "hermes", group: "hermes" },
      );
    // P1
    rootRecovered = true;
    users.root.password = "titanio7";
    // historial de comandos (para investigar cómo se resolvió)
    history = [
      "nmcli con mod eth0 ipv4.method manual ipv4.addresses 192.168.1.20/24 ipv4.gateway 192.168.1.1 ipv4.dns 192.168.1.254",
      "nmcli con up eth0",
      "hostnamectl set-hostname nodo1.lab.local",
      "groupadd olimpo",
      "useradd -G olimpo zeus",
      "useradd -G olimpo hera",
      "useradd -s /sbin/nologin ares",
      "useradd -u 4120 apolo",
      "mkdir -p /datos/olimpo",
      "chgrp olimpo /datos/olimpo",
      "chmod 2770 /datos/olimpo",
      "crontab -e -u hera",
      "tar -cjf /root/varlog-backup.tar.bz2 /var/log",
      "cp /etc/hosts /var/tmp/hosts",
      "chmod 640 /var/tmp/hosts",
      "setfacl -m u:zeus:rw /var/tmp/hosts",
      "setfacl -m u:ares:0 /var/tmp/hosts",
      "systemctl enable --now chronyd",
      "find / -user hera -exec cp -r {} /root/herafiles \\;",
      "grep rich /usr/share/dict/words > /root/coincidencias",
      'echo "zeus ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/zeus',
      "vgcreate datavg /dev/sdb1",
      "lvcreate -n appvol -l 60 datavg",
      "mkfs.ext4 /dev/datavg/appvol",
      "mount /dev/datavg/appvol /mnt/appvol",
      "mkswap /dev/sdb2",
      "swapon /dev/sdb2",
      "tuned-adm profile throughput-performance",
      "vi /usr/local/bin/saludo",
      "chmod 755 /usr/local/bin/saludo",
      "semanage port -a -t http_port_t -p tcp 8090",
      "firewall-cmd --add-service=http --permanent",
      "systemctl enable --now httpd",
      "loginctl enable-linger hermes",
    ];

 return {tunedProfile,rootRecovered,history};
}
