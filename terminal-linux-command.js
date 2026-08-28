import {
  createFile,
  createDirectory,
  normalizeVirtualPath,
  resolveVirtualNode,
  resolveVirtualParent,
} from "./terminal-virtual-fs.js";

const clone = (value) => structuredClone(value);
const asSet = (value) =>
  value instanceof Set ? value : new Set(Array.isArray(value) ? value : []);
const randomId = () => Math.random().toString(16).slice(2, 14);

export const LINUX_WORKER_COMMANDS = Object.freeze([
  "labhosts",
  "getfacl",
  "setfacl",
  "getenforce",
  "setenforce",
  "sestatus",
  "getsebool",
  "setsebool",
  "semanage",
  "restorecon",
  "chcon",
  "chage",
  "timedatectl",
  "tuned-adm",
  "pvcreate",
  "vgcreate",
  "vgextend",
  "lvcreate",
  "lvextend",
  "lvresize",
  "lvreduce",
  "lvremove",
  "vgremove",
  "pvremove",
  "xfs_growfs",
  "resize2fs",
  "mkswap",
  "swapon",
  "getent",
  "useradd",
  "userdel",
  "usermod",
  "groupadd",
  "blkid",
  "mkfs.xfs",
  "mkfs.ext4",
  "mount",
  "umount",
  "pvs",
  "vgs",
  "lvs",
  "ifup",
  "ifdown",
  "firewall-cmd",
  "chronyc",
  "logger",
  "loginctl",
  "atq",
  "atrm",
  "bzip2",
  "bunzip2",
  "podman",
]);

export function repairLinuxState(value = {}) {
  value.users = value.users || {};
  value.groupsDb = asSet(value.groupsDb);
  value.installed = asSet(value.installed);
  value.disks = Array.isArray(value.disks) ? value.disks : [];
  value.lvm = value.lvm || { pvs: [], vgs: [], lvs: [] };
  value.lvm.pvs ||= [];
  value.lvm.vgs ||= [];
  value.lvm.lvs ||= [];
  value.net = value.net || {
    eth0: { up: true, ip: "", prefix: 24, gw: "", dns: "" },
  };
  value.selinux = value.selinux || { mode: "Enforcing", httpPorts: [80, 443] };
  value.fw = value.fw || {};
  for (const key of [
    "services",
    "ports",
    "permanentServices",
    "permanentPorts",
  ])
    value.fw[key] = asSet(value.fw[key]);
  value.systemSettings = value.systemSettings || {
    timezone: "Europe/Madrid",
    sebools: {},
    chage: {},
    atJobs: [],
    nextAtJob: 1,
  };
  value.systemSettings.sebools ||= {};
  value.systemSettings.chage ||= {};
  value.systemSettings.atJobs ||= [];
  value.linger = value.linger || {};
  value.userUnits = value.userUnits || {};
  value.journal = Array.isArray(value.journal) ? value.journal : [];
  value.timeline = Array.isArray(value.timeline) ? value.timeline : [];
  value.fs = value.fs || createDirectory({});
  value.cwd = Array.isArray(value.cwd) ? value.cwd : ["root"];
  value.currentUser = value.currentUser || "root";
  value.nextUid = Number.isInteger(value.nextUid) ? value.nextUid : 1001;
  value.images = Array.isArray(value.images) ? value.images : [];
  value.containers = Array.isArray(value.containers) ? value.containers : [];
  value.dockerNetworks = Array.isArray(value.dockerNetworks)
    ? value.dockerNetworks
    : [];
  value.dockerVolumes = Array.isArray(value.dockerVolumes)
    ? value.dockerVolumes
    : [];
  value.composeProjects = value.composeProjects || {};
  return value;
}

const sizeG = (value) => {
  const match = String(value || "")
    .trim()
    .match(/^([0-9.]+)\s*([KMGT])?B?$/i);
  if (!match) return 0;
  return (
    +match[1] *
    ({ K: 1 / 1048576, M: 1 / 1024, G: 1, T: 1024 }[
      String(match[2] || "G").toUpperCase()
    ] || 1)
  );
};
const niceG = (value) =>
  value >= 1
    ? value.toFixed(value % 1 ? 2 : 0) + "g"
    : Math.round(value * 1024) + "m";
const mapper = (volume) =>
  "/dev/mapper/" +
  volume.vg.replace(/-/g, "--") +
  "-" +
  volume.name.replace(/-/g, "--");

function context(state, payload) {
  const outputs = [],
    effects = [];
  let status = 0;
  const emit = (fd, text, color = "") => {
    outputs.push({ fd, text: String(text ?? ""), color });
    if (fd === 2 && status === 0) status = 1;
  };
  const out = (text, color) => emit(1, text, color),
    outMany = (lines, color) =>
      (lines || []).forEach((line) => out(line, color)),
    err = (text, code = 1) => {
      status = code;
      emit(2, text, "#ef8a7a");
    },
    ok = (text) => out(text, "#8fa876");
  const norm = (value) => normalizeVirtualPath(value, state.cwd, ["root"]),
    getNode = (value) =>
      resolveVirtualNode(state.fs, Array.isArray(value) ? value : norm(value)),
    getParent = (value) =>
      resolveVirtualParent(
        state.fs,
        Array.isArray(value) ? value : norm(value),
      );
  const findPart = (reference) =>
      state.disks
        .flatMap((disk) => disk.parts || [])
        .find((part) => "/dev/" + part.name === reference),
    findDisk = (reference) =>
      state.disks.find((disk) => "/dev/" + disk.name === reference);
  const findLv = (reference) =>
      state.lvm.lvs.find(
        (volume) =>
          reference === mapper(volume) ||
          reference === "/dev/" + volume.vg + "/" + volume.name ||
          reference === volume.name,
      ),
    findDevice = (reference) => findPart(reference) || findLv(reference);
  const journal = (unit, message, priority = 6) =>
    state.journal.push({
      unit,
      message,
      priority,
      ts: Date.now(),
      time: new Date().toLocaleTimeString(),
    });
  const rebuildAccounts = () => {
    const etc = getNode(["etc"]);
    if (!etc || etc.type !== "dir") return;
    etc.children.passwd = createFile(
      Object.entries(state.users)
        .map(
          ([name, user]) =>
            name +
            ":x:" +
            user.uid +
            ":" +
            user.gid +
            ":" +
            name +
            ":" +
            user.home +
            ":" +
            user.shell,
        )
        .join("\n"),
      { owner: "root", group: "root" },
    );
    etc.children.group = createFile(
      [...state.groupsDb]
        .map(
          (group, index) =>
            group +
            ":x:" +
            (group === "root" ? 0 : 1000 + index) +
            ":" +
            Object.entries(state.users)
              .filter(
                ([, user]) =>
                  (user.groups || []).includes(group) && group !== name,
              )
              .map(([name]) => name)
              .join(","),
        )
        .join("\n"),
      { owner: "root", group: "root" },
    );
  };
  return {
    state,
    payload,
    outputs,
    effects,
    out,
    outMany,
    err,
    ok,
    norm,
    getNode,
    getParent,
    findPart,
    findDisk,
    findLv,
    findDevice,
    journal,
    rebuildAccounts,
    get status() {
      return status;
    },
  };
}

export async function executeLinuxCommand(input, payload = {}) {
  const state = repairLinuxState(input),
    ctx = context(state, payload),
    {
      out,
      outMany,
      err,
      ok,
      norm,
      getNode,
      getParent,
      findPart,
      findDisk,
      findLv,
      findDevice,
      journal,
      rebuildAccounts,
      effects,
    } = ctx;
  const name = payload.name,
    args = payload.args || [],
    cmd = payload.cmd || [name, ...args].join(" "),
    valueOf = (flag) => {
      const exact = args.find((value) => value.startsWith(flag + "="));
      if (exact) return exact.slice(flag.length + 1);
      const index = args.indexOf(flag);
      return index < 0 ? "" : args[index + 1] || "";
    };
  if (!LINUX_WORKER_COMMANDS.includes(name))
    throw new Error("Comando Linux no soportado: " + name);
  if (name === "labhosts")
    outMany([
      "Red del laboratorio S2KTUX  (192.168.1.0/24)",
      "HOST    IP             USUARIO   CONTRASEÑA   ROL",
      "web1    192.168.1.10   alumno    alumno       Servidor web (Apache)",
      "node1   192.168.1.12   --        --           Próximamente (Ansible / Kubernetes)",
      "",
      "Configura primero tu red (nmcli/nmtui) y luego:  ssh alumno@web1",
    ]);
  else if (name === "getent") {
    const database = args[0],
      key = args[1];
    if (database === "passwd") {
      const rows =
        key && state.users[key]
          ? [[key, state.users[key]]]
          : Object.entries(state.users);
      rows.forEach(([user, data]) =>
        out(
          user +
            ":x:" +
            data.uid +
            ":" +
            data.gid +
            ":" +
            user +
            ":" +
            data.home +
            ":" +
            data.shell,
        ),
      );
    } else if (database === "group") {
      [...state.groupsDb]
        .filter((group) => !key || group === key)
        .forEach((group) =>
          out(
            group +
              ":x:1000:" +
              Object.entries(state.users)
                .filter(([, user]) => (user.groups || []).includes(group))
                .map(([user]) => user)
                .join(","),
          ),
        );
    } else err("getent: base de datos desconocida: " + (database || ""), 2);
  } else if (name === "groupadd") {
    const group = args.filter((value) => !value.startsWith("-"))[0];
    if (!group) err("groupadd: falta el nombre del grupo");
    else if (state.groupsDb.has(group))
      err("groupadd: el grupo «" + group + "» ya existe");
    else {
      state.groupsDb.add(group);
      rebuildAccounts();
    }
  } else if (name === "useradd") {
    const user = args
      .filter(
        (value, index) =>
          !value.startsWith("-") &&
          !["-u", "-s", "-G", "-g", "-d"].includes(args[index - 1]),
      )
      .at(-1);
    if (!user) err("useradd: falta el nombre");
    else if (state.users[user])
      err("useradd: el usuario «" + user + "» ya existe");
    else {
      const groups = (valueOf("-G") || "").split(",").filter(Boolean),
        missing = groups.find((group) => !state.groupsDb.has(group));
      if (missing) err("useradd: el grupo «" + missing + "» no existe");
      else {
        const uid = valueOf("-u")
          ? parseInt(valueOf("-u"), 10)
          : state.nextUid++;
        state.nextUid = Math.max(state.nextUid, uid + 1);
        const primary = valueOf("-g") || user,
          shell = valueOf("-s") || "/bin/bash",
          home = valueOf("-d") || "/home/" + user;
        state.groupsDb.add(primary);
        state.users[user] = {
          uid,
          gid: uid,
          primary,
          home,
          groups: [primary, ...groups],
          shell,
        };
        if (!args.includes("-M")) {
          const parent = getNode(["home"]);
          if (parent?.type === "dir")
            parent.children[user] = createDirectory(
              {},
              { owner: user, group: primary },
            );
        }
        rebuildAccounts();
      }
    }
  } else if (name === "userdel") {
    const user = args.filter((value) => !value.startsWith("-")).at(-1);
    if (!state.users[user]) err("userdel: no existe: " + (user || ""));
    else if (["root", "visitor"].includes(user))
      err("userdel: no se puede borrar " + user);
    else {
      delete state.users[user];
      if (args.includes("-r")) {
        const home = getNode(["home"]);
        if (home?.children) delete home.children[user];
      }
      rebuildAccounts();
    }
  } else if (name === "usermod") {
    const user = args.at(-1);
    if (!state.users[user])
      err("usermod: el usuario '" + (user || "") + "' no existe");
    else {
      const append = args.includes("-aG"),
        groupIndex = args.indexOf(append ? "-aG" : "-G");
      if (groupIndex >= 0) {
        const groups = (args[groupIndex + 1] || "").split(",").filter(Boolean),
          missing = groups.find((group) => !state.groupsDb.has(group));
        if (missing) err("usermod: el grupo «" + missing + "» no existe");
        else
          state.users[user].groups = append
            ? [...new Set([...(state.users[user].groups || []), ...groups])]
            : [state.users[user].primary || user, ...groups];
      }
      if (valueOf("-s")) state.users[user].shell = valueOf("-s");
      if (valueOf("-u")) state.users[user].uid = parseInt(valueOf("-u"), 10);
      rebuildAccounts();
    }
  } else if (name === "chage") {
    const user = args.at(-1);
    if (!state.users[user])
      err("chage: el usuario «" + (user || "") + "» no existe");
    else if (args.includes("-l")) {
      const data = state.systemSettings.chage[user] || {};
      outMany([
        "Último cambio de contraseña                    : " +
          (data.last || "nunca"),
        "La contraseña caduca                          : " +
          (data.max || "nunca"),
        "La cuenta caduca                              : " +
          (data.expire || "nunca"),
      ]);
    } else {
      const data =
        state.systemSettings.chage[user] ||
        (state.systemSettings.chage[user] = {});
      if (valueOf("-M")) data.max = valueOf("-M");
      if (valueOf("-m")) data.min = valueOf("-m");
      if (valueOf("-E")) data.expire = valueOf("-E");
      if (valueOf("-W")) data.warn = valueOf("-W");
    }
  } else if (name === "timedatectl") {
    if (args[0] === "set-timezone") {
      if (!args[1]) err("Failed to set time zone: Invalid time zone");
      else
        try {
          new Intl.DateTimeFormat("en", { timeZone: args[1] }).format();
          state.systemSettings.timezone = args[1];
        } catch {
          err(
            'Failed to set time zone: Invalid or not installed time zone "' +
              args[1] +
              '"',
          );
        }
    } else if (args[0] === "set-ntp")
      state.systemSettings.ntp = !/^(0|false|no)$/i.test(args[1] || "yes");
    else if (args[0] === "list-timezones")
      outMany([
        "Europe/Madrid",
        "Europe/London",
        "UTC",
        "America/New_York",
        "Asia/Tokyo",
      ]);
    else
      outMany([
        "               Local time: " +
          new Date().toLocaleString("en-GB", {
            timeZone: state.systemSettings.timezone,
          }),
        "                 Time zone: " + state.systemSettings.timezone,
        "System clock synchronized: " +
          (state.systemSettings.ntp === false ? "no" : "yes"),
        "              NTP service: " +
          (state.systemSettings.ntp === false ? "inactive" : "active"),
      ]);
  } else if (name === "tuned-adm") {
    if (args[0] === "active")
      out("Current active profile: " + state.tunedProfile);
    else if (args[0] === "recommend") out("virtual-host");
    else if (args[0] === "list")
      outMany([
        "Available profiles:",
        "- balanced",
        "- throughput-performance",
        "- virtual-guest",
        "- virtual-host",
      ]);
    else if (args[0] === "profile" && args[1]) {
      state.tunedProfile = args[1];
      ok("Profile " + args[1] + " activated.");
    } else err("tuned-adm: usa active | recommend | list | profile NOMBRE");
  } else if (name === "pvcreate") {
    const devices = args.filter((value) => value.startsWith("/dev/"));
    if (!devices.length) err("pvcreate: falta el dispositivo");
    else
      for (const device of devices) {
        if (state.lvm.pvs.some((pv) => pv.name === device)) {
          out("  Physical volume " + device + " not changed");
          continue;
        }
        const target = findPart(device) || findDisk(device);
        if (!target) {
          err("  Device " + device + " not found.");
          continue;
        }
        const size = sizeG(target.size);
        if ("fstype" in target) target.fstype = "LVM2_member";
        state.lvm.pvs.push({ name: device, vg: "", psize: size });
        ok('  Physical volume "' + device + '" successfully created.');
      }
  } else if (name === "vgcreate" || name === "vgextend") {
    const vg = args.find(
        (value) => !value.startsWith("-") && !value.startsWith("/dev/"),
      ),
      devices = args.filter((value) => value.startsWith("/dev/"));
    let group = state.lvm.vgs.find((item) => item.name === vg);
    if (!vg || !devices.length)
      err(name + ": uso: " + name + " <vg> <dispositivo...>");
    else if (name === "vgcreate" && group)
      err('  Volume group "' + vg + '" already exists');
    else if (name === "vgextend" && !group)
      err('  Volume group "' + vg + '" not found');
    else {
      if (!group) {
        group = { name: vg, pvs: [], vsize: 0, vfree: 0 };
        state.lvm.vgs.push(group);
      }
      for (const device of devices) {
        let pv = state.lvm.pvs.find((item) => item.name === device);
        if (!pv) {
          const target = findPart(device) || findDisk(device);
          if (!target) {
            err("  Device " + device + " not found.");
            continue;
          }
          pv = { name: device, vg: "", psize: sizeG(target.size) };
          state.lvm.pvs.push(pv);
        }
        if (pv.vg && pv.vg !== vg) {
          err(
            "  Physical volume " +
              device +
              " is already in volume group " +
              pv.vg,
          );
          continue;
        }
        pv.vg = vg;
        if (!group.pvs.includes(device)) {
          group.pvs.push(device);
          group.vsize += pv.psize;
          group.vfree += pv.psize;
        }
      }
      ok(
        '  Volume group "' +
          vg +
          '" successfully ' +
          (name === "vgcreate" ? "created" : "extended"),
      );
    }
  } else if (name === "lvcreate") {
    const vg = args.at(-1),
      group = state.lvm.vgs.find((item) => item.name === vg),
      nameIndex = args.indexOf("-n"),
      sizeIndex = args.indexOf("-L"),
      extentIndex = args.indexOf("-l");
    if (!group) err('  Volume group "' + vg + '" not found');
    else if (
      (sizeIndex >= 0 && extentIndex >= 0) ||
      (sizeIndex < 0 && extentIndex < 0)
    )
      err("  Specify either --size (-L) or --extents (-l), but not both.");
    else {
      const volumeName = nameIndex >= 0 ? args[nameIndex + 1] : "lvol0",
        raw = args[sizeIndex >= 0 ? sizeIndex + 1 : extentIndex + 1] || "",
        extentMatch = String(raw).match(/^(\d+)(?:%(FREE|VG))?$/i);
      let size = 0,
        extents = null;
      if (sizeIndex >= 0) size = sizeG(raw);
      else if (extentMatch) {
        const amount = +extentMatch[1],
          base = (extentMatch[2] || "").toUpperCase();
        size =
          base === "FREE"
            ? (group.vfree * amount) / 100
            : base === "VG"
              ? (group.vsize * amount) / 100
              : (amount * 4) / 1024;
        extents = base ? Math.ceil(size * 256) : amount;
      }
      if (!size)
        err(
          extentIndex >= 0
            ? "  Invalid argument for --extents: " + raw
            : "  Invalid logical volume size.",
        );
      else if (size > group.vfree + 1e-9)
        err('  Volume group "' + vg + '" has insufficient free space.');
      else {
        state.lvm.lvs.push({
          name: volumeName,
          vg,
          size,
          extents: extents || Math.ceil(size * 256),
          extentSizeM: 4,
          fstype: "",
          mount: "",
        });
        group.vfree -= size;
        ok('  Logical volume "' + volumeName + '" created.');
      }
    }
  } else if (["lvextend", "lvresize", "lvreduce"].includes(name)) {
    const reference = args.find((value) => value.startsWith("/dev/")),
      volume = findLv(reference),
      raw = valueOf("-L") || valueOf("-l");
    if (!volume) err("  Failed to find logical volume " + (reference || ""));
    else if (!raw) err("  " + name + ": falta -L o -l");
    else {
      const group = state.lvm.vgs.find((item) => item.name === volume.vg),
        old = volume.size;
      let desired = valueOf("-l")
        ? (parseInt(raw, 10) * 4) / 1024
        : sizeG(raw.replace(/^\+/, ""));
      if (raw.startsWith("+")) desired = old + desired;
      if (name === "lvreduce" && desired >= old)
        err("  New size must be smaller than existing size");
      else if (desired > old && desired - old > group.vfree)
        err("  Insufficient free space");
      else {
        group.vfree += old - desired;
        volume.size = desired;
        volume.extents = Math.ceil(desired * 256);
        if (desired < old) volume.reduced = true;
        ok(
          "  Size of logical volume " +
            mapper(volume) +
            " changed from " +
            niceG(old) +
            " to " +
            niceG(desired) +
            ".",
        );
      }
    }
  } else if (name === "lvremove") {
    const reference = args.find((value) => value.startsWith("/dev/")),
      volume = findLv(reference);
    if (!volume) err("  Failed to find logical volume " + (reference || ""));
    else {
      const group = state.lvm.vgs.find((item) => item.name === volume.vg);
      group.vfree += volume.size;
      state.lvm.lvs.splice(state.lvm.lvs.indexOf(volume), 1);
      ok('  Logical volume "' + volume.name + '" successfully removed.');
    }
  } else if (name === "vgremove") {
    const group = state.lvm.vgs.find((item) => item.name === args.at(-1));
    if (!group) err("  Volume group not found");
    else if (state.lvm.lvs.some((volume) => volume.vg === group.name))
      err(
        '  Volume group "' + group.name + '" still contains logical volume(s)',
      );
    else {
      group.pvs.forEach((device) => {
        const pv = state.lvm.pvs.find((item) => item.name === device);
        if (pv) pv.vg = "";
      });
      state.lvm.vgs.splice(state.lvm.vgs.indexOf(group), 1);
      ok('  Volume group "' + group.name + '" successfully removed');
    }
  } else if (name === "pvremove") {
    const device = args.find((value) => value.startsWith("/dev/")),
      index = state.lvm.pvs.findIndex((item) => item.name === device);
    if (index < 0) err("  No PV found on device " + (device || ""));
    else if (state.lvm.pvs[index].vg)
      err("  PV " + device + " is used by VG " + state.lvm.pvs[index].vg);
    else {
      state.lvm.pvs.splice(index, 1);
      ok('  Labels on physical volume "' + device + '" successfully wiped.');
    }
  } else if (name === "pvs") {
    out("  PV         VG   Fmt  Attr PSize   PFree");
    state.lvm.pvs.forEach((pv) => {
      const group = state.lvm.vgs.find((item) => item.name === pv.vg);
      out(
        "  " +
          pv.name.padEnd(12) +
          (pv.vg || "").padEnd(5) +
          "lvm2 " +
          (pv.vg ? "a--" : "---") +
          " " +
          niceG(pv.psize).padStart(8) +
          " " +
          niceG(group ? group.vfree : pv.psize).padStart(8),
      );
    });
  } else if (name === "vgs") {
    out("  VG   #PV #LV #SN Attr   VSize   VFree");
    state.lvm.vgs.forEach((group) =>
      out(
        "  " +
          group.name.padEnd(5) +
          String(group.pvs.length).padStart(3) +
          " " +
          String(
            state.lvm.lvs.filter((volume) => volume.vg === group.name).length,
          ).padStart(3) +
          "   0 wz--n- " +
          niceG(group.vsize).padStart(7) +
          " " +
          niceG(group.vfree).padStart(7),
      ),
    );
  } else if (name === "lvs") {
    out("  LV       VG       Attr       LSize");
    state.lvm.lvs.forEach((volume) =>
      out(
        "  " +
          volume.name.padEnd(8) +
          volume.vg.padEnd(9) +
          "-wi-ao---- " +
          (volume.size.toFixed(2) + "g").padStart(7),
      ),
    );
  } else if (name === "blkid") {
    const rows = [
      ...state.disks.flatMap((disk) => disk.parts || []),
      ...state.lvm.lvs,
    ];
    rows
      .filter((item) => item.fstype)
      .forEach((item) =>
        out(
          (item.vg ? mapper(item) : "/dev/" + item.name) +
            ': UUID="' +
            (item.uuid || randomId()) +
            '" TYPE="' +
            item.fstype +
            '"',
        ),
      );
  } else if (name === "mkfs.xfs" || name === "mkfs.ext4" || name === "mkswap") {
    const device = args.find((value) => value.startsWith("/dev/")),
      target = findDevice(device);
    if (!target)
      err(name + ": " + (device || "") + ": No such file or directory");
    else {
      target.fstype = name === "mkswap" ? "swap" : name.slice(5);
      target.uuid = randomId() + "-" + randomId();
      ok(
        name === "mkswap"
          ? "Setting up swapspace version 1, size " +
              niceG(sizeG(target.size || target.size + "G"))
          : "meta-data=" + device + " isize=512 agcount=4",
      );
    }
  } else if (name === "swapon") {
    if (args.includes("--show")) {
      out("NAME       TYPE      SIZE USED PRIO");
      [...state.disks.flatMap((disk) => disk.parts || []), ...state.lvm.lvs]
        .filter((item) => item.mount === "[SWAP]")
        .forEach((item) =>
          out(
            (
              "/dev/" + (item.vg ? item.vg + "/" + item.name : item.name)
            ).padEnd(11) +
              " partition " +
              String(item.size || "512M").padEnd(5) +
              " 0B   -2",
          ),
        );
    } else {
      const target = findDevice(
        args.find((value) => value.startsWith("/dev/")),
      );
      if (!target) err("swapon: no se puede abrir el dispositivo");
      else if (target.fstype !== "swap") err("swapon: firma de swap inválida");
      else target.mount = "[SWAP]";
    }
  } else if (name === "mount") {
    if (!args.length) {
      [...state.disks.flatMap((disk) => disk.parts || []), ...state.lvm.lvs]
        .filter((item) => item.mount && item.mount !== "[SWAP]")
        .forEach((item) =>
          out(
            (item.vg ? mapper(item) : "/dev/" + item.name) +
              " on " +
              item.mount +
              " type " +
              item.fstype +
              " (rw,relatime)",
          ),
        );
    } else {
      const target = findDevice(args[0]);
      if (!target) err("mount: dispositivo especial " + args[0] + " no existe");
      else if (!target.fstype)
        err("mount: tipo de sistema de archivos incorrecto");
      else if (!args[1]) err("mount: falta el punto de montaje");
      else {
        const segments = norm(args[1]);
        if (!getNode(segments)) {
          const parent = getParent(segments);
          if (parent?.type === "dir")
            parent.children[segments.at(-1)] = createDirectory(
              {},
              { owner: "root" },
            );
        }
        target.mount = args[1];
      }
    }
  } else if (name === "umount") {
    const reference = args[0],
      target = [
        ...state.disks.flatMap((disk) => disk.parts || []),
        ...state.lvm.lvs,
      ].find(
        (item) =>
          item.mount === reference ||
          "/dev/" + item.name === reference ||
          (item.vg && mapper(item) === reference),
      );
    if (!target) err("umount: " + (reference || "") + ": no está montado");
    else target.mount = "";
  } else if (name === "xfs_growfs" || name === "resize2fs") {
    const reference = args.at(-1),
      target =
        findLv(reference) ||
        [...state.disks.flatMap((disk) => disk.parts || [])].find(
          (item) => item.mount === reference,
        );
    if (!target)
      err(name + ": " + (reference || "") + ": No such file or directory");
    else if (name === "xfs_growfs" && target.fstype !== "xfs")
      err("xfs_growfs: " + reference + " is not a mounted XFS filesystem");
    else if (name === "resize2fs" && target.fstype !== "ext4")
      err("resize2fs: Bad magic number in super-block");
    else ok(name + ": filesystem resized successfully");
  } else if (name === "getenforce") out(state.selinux.mode);
  else if (name === "setenforce") {
    const value = args[0];
    if (!/^(0|1|Enforcing|Permissive)$/i.test(value || ""))
      err("setenforce: usage: setenforce [ Enforcing | Permissive | 1 | 0 ]");
    else
      state.selinux.mode = /^(1|Enforcing)$/i.test(value)
        ? "Enforcing"
        : "Permissive";
  } else if (name === "sestatus")
    outMany([
      "SELinux status:                 enabled",
      "Current mode:                   " + state.selinux.mode.toLowerCase(),
      "Mode from config file:          enforcing",
      "Policy from config file:        targeted",
    ]);
  else if (name === "getsebool") {
    const keys = args.includes("-a")
      ? Object.keys(state.systemSettings.sebools)
      : args.filter((value) => !value.startsWith("-"));
    keys.forEach((key) =>
      key in state.systemSettings.sebools
        ? out(
            key + " --> " + (state.systemSettings.sebools[key] ? "on" : "off"),
          )
        : err("getsebool:  SELinux boolean " + key + " is not defined"),
    );
  } else if (name === "setsebool") {
    const persist = args.includes("-P"),
      items = args.filter((value) => !value.startsWith("-"));
    if (items.length < 2) err("setsebool:  must specify boolean and value");
    else if (!(items[0] in state.systemSettings.sebools))
      err("Boolean " + items[0] + " is not defined");
    else {
      state.systemSettings.sebools[items[0]] = /^(1|on|true)$/i.test(items[1]);
      if (persist) journal("setsebool", "Committed pending booleans");
    }
  } else if (name === "chcon" || name === "restorecon") {
    const target = args.at(-1),
      node = getNode(norm(target));
    if (!node) err(name + ": no se puede acceder a «" + (target || "") + "»");
    else if (name === "chcon") {
      const type = valueOf("-t");
      if (!type) err("chcon: falta un tipo con -t");
      else node.context = type;
    } else {
      const path = "/" + norm(target).join("/");
      node.context = /^\/var\/www/.test(path)
        ? "httpd_sys_content_t"
        : /^\/home/.test(path)
          ? "user_home_t"
          : /^\/etc/.test(path)
            ? "etc_t"
            : "default_t";
      if (args.includes("-v"))
        out(
          "Relabeled " +
            target +
            " to system_u:object_r:" +
            node.context +
            ":s0",
        );
    }
  } else if (name === "semanage") {
    if (args[0] === "port") {
      const port = parseInt(args.at(-1), 10);
      if (!port) err("semanage port: falta un puerto");
      else if (args.includes("-d"))
        state.selinux.httpPorts = state.selinux.httpPorts.filter(
          (value) => value !== port,
        );
      else if (!state.selinux.httpPorts.includes(port))
        state.selinux.httpPorts.push(port);
    } else if (args[0] === "fcontext")
      ok("File context for " + args.at(-1) + " updated");
    else out("semanage: usa port | fcontext | boolean");
  } else if (name === "getfacl") {
    const target = args.filter((value) => !value.startsWith("-")).at(-1),
      node = getNode(norm(target));
    if (!node)
      err(
        "getfacl: " + (target || "") + ": No existe el fichero o el directorio",
      );
    else {
      outMany([
        "# file: " + String(target).replace(/^\//, ""),
        "# owner: " + node.owner,
        "# group: " + node.group,
        "user::" + (node.mode || "rw-r--r--").slice(0, 3),
      ]);
      (node.acl || []).forEach((entry) =>
        out(entry.type + ":" + entry.name + ":" + entry.perms),
      );
      out("other::" + (node.mode || "rw-r--r--").slice(6, 9));
    }
  } else if (name === "setfacl") {
    const target = args.at(-1),
      node = getNode(norm(target));
    if (!node)
      err(
        "setfacl: " + (target || "") + ": No existe el fichero o el directorio",
      );
    else if (args.includes("-b")) node.acl = [];
    else {
      const spec = valueOf("-m");
      if (!spec) err("setfacl: opción -m requiere un argumento");
      else {
        node.acl = node.acl || [];
        for (const raw of spec.split(",")) {
          const [kind, who, perms] = raw.split(":"),
            type = kind === "u" ? "user" : kind === "g" ? "group" : kind,
            index = node.acl.findIndex(
              (entry) => entry.type === type && entry.name === who,
            );
          const entry = { type, name: who, perms };
          index < 0 ? node.acl.push(entry) : node.acl.splice(index, 1, entry);
        }
      }
    }
  } else if (name === "ifup" || name === "ifdown") {
    if (args[0] !== "eth0")
      err(name + ": interfaz desconocida " + (args[0] || ""));
    else {
      state.net.eth0.up = name === "ifup";
      ok("eth0 " + (name === "ifup" ? "levantada" : "caída") + ".");
    }
  } else if (name === "firewall-cmd") {
    const permanent = args.includes("--permanent"),
      services = permanent ? state.fw.permanentServices : state.fw.services,
      ports = permanent ? state.fw.permanentPorts : state.fw.ports,
      get = (flag) => valueOf(flag);
    if (args.includes("--state")) out("running");
    else if (args.includes("--get-default-zone"))
      out(permanent ? state.fw.permanentZone : state.fw.zone);
    else if (args.includes("--get-zones"))
      out("block dmz drop external home internal public trusted work");
    else if (args.includes("--get-active-zones"))
      outMany([state.fw.zone, "  interfaces: eth0"]);
    else if (args.includes("--list-services")) out([...services].join(" "));
    else if (args.includes("--list-ports")) out([...ports].join(" "));
    else if (args.includes("--list-all"))
      outMany([
        (permanent ? state.fw.permanentZone : state.fw.zone) +
          (permanent ? "" : " (active)"),
        "  interfaces: " + (permanent ? "" : "eth0"),
        "  services: " + [...services].join(" "),
        "  ports: " + [...ports].join(" "),
      ]);
    else if (get("--add-service")) {
      services.add(get("--add-service"));
      ok("success");
    } else if (get("--remove-service")) {
      services.delete(get("--remove-service"));
      ok("success");
    } else if (get("--query-service")) {
      const exists = services.has(get("--query-service"));
      out(exists ? "yes" : "no");
      if (!exists) ctx.status = 1;
    } else if (get("--add-port")) {
      ports.add(get("--add-port"));
      ok("success");
    } else if (get("--remove-port")) {
      ports.delete(get("--remove-port"));
      ok("success");
    } else if (args.includes("--reload")) {
      state.fw.services = new Set(state.fw.permanentServices);
      state.fw.ports = new Set(state.fw.permanentPorts);
      state.fw.zone = state.fw.permanentZone;
      ok("success");
      journal("firewalld", "Reloaded firewalld configuration");
    } else if (args.includes("--runtime-to-permanent")) {
      state.fw.permanentServices = new Set(state.fw.services);
      state.fw.permanentPorts = new Set(state.fw.ports);
      state.fw.permanentZone = state.fw.zone;
      ok("success");
    } else err("firewall-cmd: error: no se ha indicado ninguna operación", 2);
  } else if (name === "chronyc") {
    if (args[0] === "tracking")
      outMany([
        "Reference ID    : C0A80101 (ntp1.s2ktux.local)",
        "Stratum         : 3",
        "System time     : 0.000001 seconds slow of NTP time",
      ]);
    else
      outMany([
        "MS Name/IP address         Stratum Poll Reach LastRx Last sample",
        "^* ntp1.s2ktux.local             2   6   377    23   +0.000012s",
      ]);
  } else if (name === "logger") {
    const message = args
        .filter(
          (value, index) => !value.startsWith("-") && args[index - 1] !== "-t",
        )
        .join(" "),
      tag = valueOf("-t") || state.currentUser,
      file = getNode(["var", "log", "messages"]);
    if (file?.type === "file")
      file.content +=
        "\n" + new Date().toLocaleTimeString() + " " + tag + ": " + message;
    journal(tag, message);
  } else if (name === "loginctl") {
    const operation = args.find((value) => !value.startsWith("-")) || "",
      user =
        args
          .filter((value) => !value.startsWith("-"))
          .slice(1)
          .at(-1) || state.currentUser;
    if (operation === "show-user") {
      if (!state.users[user])
        err(
          "Failed to get user: User ID " +
            user +
            " is not logged in or lingering",
        );
      else
        outMany([
          "UID=" + state.users[user].uid,
          "Name=" + user,
          "Linger=" + (state.linger[user] ? "yes" : "no"),
        ]);
    } else if (["enable-linger", "disable-linger"].includes(operation)) {
      if (state.currentUser !== "root")
        err("Could not change linger: Access denied");
      else if (!state.users[user])
        err("Failed to look up user " + user + ": No such user");
      else state.linger[user] = operation === "enable-linger";
    } else
      err(
        "loginctl: usa enable-linger USUARIO | disable-linger USUARIO | show-user USUARIO",
      );
  } else if (name === "atq")
    state.systemSettings.atJobs.forEach((job) =>
      out(
        job.id +
          "\t" +
          new Date(job.created).toString().slice(0, 24) +
          " a " +
          job.user,
      ),
    );
  else if (name === "atrm") {
    const id = parseInt(args[0], 10),
      index = state.systemSettings.atJobs.findIndex((job) => job.id === id);
    if (index < 0) err("atrm: " + (args[0] || "") + ": no existe ese trabajo");
    else state.systemSettings.atJobs.splice(index, 1);
  } else if (name === "bzip2" || name === "bunzip2") {
    const source = args.filter((value) => !value.startsWith("-"))[0],
      node = getNode(norm(source));
    if (!node || node.type !== "file")
      err(
        name + ": " + (source || "") + ": No existe el fichero o el directorio",
      );
    else {
      const segments = norm(source),
        parent = getParent(segments),
        leaf = segments.at(-1),
        decompress = name === "bunzip2" || args.includes("-d");
      if (decompress && !leaf.endsWith(".bz2"))
        err(name + ": " + source + " is not a bzip2 file.");
      else if (decompress) {
        parent.children[leaf.replace(/\.bz2$/, "")] = node;
        delete parent.children[leaf];
      } else {
        parent.children[leaf + ".bz2"] = node;
        delete parent.children[leaf];
        if (args.includes("-k"))
          parent.children[leaf] = createFile(node.content, {
            owner: state.currentUser,
          });
      }
    }
  } else if (name === "podman") {
    const { executeDockerCommand, repairDockerState } =
      await import("./terminal-docker-command.js");
    const dockerState = repairDockerState({
      images: state.images,
      containers: state.containers,
      networks: state.dockerNetworks,
      volumes: state.dockerVolumes,
      composeProjects: state.composeProjects,
      timeline: state.timeline,
      services: { docker: { active: true, enabled: true } },
      fs: state.fs,
      cwd: state.cwd,
      currentUser: state.currentUser,
      env: payload.env || {},
    });
    const result = await executeDockerCommand(dockerState, {
      ...payload,
      name: "docker",
      args,
      cmd: "docker " + args.join(" "),
      system: { DOCKER_VERSION: "4.9.4" },
    });
    state.images = result.state.images;
    state.containers = result.state.containers;
    state.dockerNetworks = result.state.networks;
    state.dockerVolumes = result.state.volumes;
    state.composeProjects = result.state.composeProjects;
    state.timeline = result.state.timeline;
    state.fs = result.state.fs;
    result.outputs.forEach((item) =>
      ctx.outputs.push({
        ...item,
        text: item.text
          .replace(/^docker:/, "podman:")
          .replace(/^Docker version 4\.9\.4.*$/, "podman version 4.9.4")
          .replace(/^Client: Docker$/, "Client: Podman"),
      }),
    );
    result.effects.forEach((effect) =>
      effects.push(
        effect.type === "container-shell"
          ? { ...effect, kind: "podman" }
          : effect,
      ),
    );
  }
  return {
    state: clone(state),
    outputs: ctx.outputs,
    effects,
    status: ctx.status,
  };
}
