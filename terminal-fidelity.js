export function createTerminalFidelity(deps){
  const {
    getNode,norm,getParent,dir,file,hasPerm,virtualWrite,maskedMode,
    getCurrentUser,getUsers,getCwd,getLvm,getShadowMislabeled,
    localHostname,parseSizeG,fmtG,out,err,ok,dispatch
  }=deps;

  const selinuxContextFor=(segments,node)=>{
    const path='/'+segments.join('/');
    let type=node&&node.context?node.context:'default_t';
    if(!node?.context){
      if(/^\/home\//.test(path)||/^\/root(?:\/|$)/.test(path))type='user_home_t';
      else if(/^\/etc\/shadow$/.test(path))type=getShadowMislabeled()?'unlabeled_t':'shadow_t';
      else if(/^\/etc\/passwd$/.test(path))type='passwd_file_t';
      else if(/^\/etc(?:\/|$)/.test(path))type='etc_t';
      else if(/^\/var\/www(?:\/|$)/.test(path))type='httpd_sys_content_t';
      else if(/^\/var\/log(?:\/|$)/.test(path))type='var_log_t';
      else if(/^\/var(?:\/|$)/.test(path))type='var_t';
      else if(/^\/tmp(?:\/|$)/.test(path))type='tmp_t';
      else if(/^\/(?:usr\/bin|bin)(?:\/|$)/.test(path))type='bin_t';
    }
    const user=/^\/(?:home\/|root(?:\/|$))/.test(path)?'unconfined_u':'system_u';
    return user+':object_r:'+type+':s0';
  };

  const sudoersLines=()=>{
    const lines=[],main=getNode(['etc','sudoers']);
    if(main?.type==='file')lines.push(...main.content.split('\n'));
    if(main?.type==='file'&&/(?:#|@)includedir\s+\/etc\/sudoers\.d/.test(main.content)){
      const directory=getNode(['etc','sudoers.d']);
      if(directory?.type==='dir')Object.entries(directory.children).sort().forEach(([name,node])=>{
        if(node?.type==='file'&&!name.includes('.')&&!name.endsWith('~'))lines.push(...node.content.split('\n'));
      });
    }
    return lines;
  };
  const parseSudoersRule=raw=>{
    const line=String(raw).replace(/\s+#.*$/,'').trim();
    if(!line||line.startsWith('#')||line.startsWith('@')||/^Defaults(?:\s|$)/.test(line))return null;
    const match=line.match(/^(\S+)\s+(\S+)\s*=\s*(?:\(([^)]*)\)\s*)?(?:(NOPASSWD|PASSWD)\s*:\s*)?(.+)$/);
    return match?{subject:match[1],host:match[2],runas:match[3]||'root',nopasswd:match[4]==='NOPASSWD',commands:match[5].split(',').map(value=>value.trim())}:{invalid:true};
  };
  const sudoersRuleFor=(user,command='ALL')=>{
    let selected=null;
    const users=getUsers(),requested=String(command).trim().split(/\s+/)[0].replace(/^.*\//,'');
    for(const raw of sudoersLines()){
      const rule=parseSudoersRule(raw);
      if(!rule||rule.invalid)continue;
      const subject=rule.subject==='ALL'||rule.subject===user||(rule.subject.startsWith('%')&&(users[user]?.groups||[]).includes(rule.subject.slice(1)));
      const host=rule.host==='ALL'||rule.host===localHostname();
      const allowed=rule.commands.some(value=>value==='ALL'||value.replace(/^.*\//,'').split(/\s+/)[0]===requested);
      if(subject&&host&&allowed)selected=rule;
    }
    return selected;
  };
  const sudoersSyntaxError=content=>String(content).split('\n').findIndex(raw=>{
    const line=raw.trim();
    return !!line&&!line.startsWith('#')&&!line.startsWith('@')&&!/^Defaults(?:\s|$)/.test(line)&&parseSudoersRule(raw)?.invalid;
  });

  const runChmod=args=>{
    const recursive=args.includes('-R')||args.includes('--recursive');
    const operands=args.filter(value=>!value.startsWith('-')||/^[0-7]{3,4}$/.test(value));
    const spec=operands[0],target=operands.at(-1);
    if(!spec||operands.length<2){err('chmod: falta un operando después de «'+(spec||'')+'»');return;}
    const root=getNode(norm(target),false);
    if(!root){err("chmod: no se puede acceder a '"+target+"': No existe el fichero o el directorio");return;}
    const validOctal=/^[0-7]{3,4}$/.test(spec),symbolic=spec.match(/^([ugoa]*)([+\-=])([rwxst]+)$/);
    if(!validOctal&&!symbolic){err("chmod: modo incorrecto: '"+spec+"'");return;}
    const bits=mode=>({r:mode[0]!=='-',w:mode[1]!=='-',x:/[xst]/.test(mode[2]),s:/[sS]/.test(mode[2]),t:/[tT]/.test(mode[2])});
    const trip=(r,w,x,special,kind)=>(r?'r':'-')+(w?'w':'-')+(special?(x?(kind==='t'?'t':'s'):(kind==='t'?'T':'S')):(x?'x':'-'));
    const octal=value=>{const full=value.length===3?'0'+value:value,sp=+full[0],u=+full[1],g=+full[2],o=+full[3];return trip(u&4,u&2,u&1,sp&4,'s')+trip(g&4,g&2,g&1,sp&2,'s')+trip(o&4,o&2,o&1,sp&1,'t');};
    const apply=(node,label)=>{
      const currentUser=getCurrentUser();
      if(currentUser!=='root'&&node.owner!==currentUser){err("chmod: cambiando los permisos de '"+label+"': Operación no permitida");return;}
      if(validOctal)node.mode=octal(spec);
      else {
        const parts=(node.mode||'rw-r--r--').match(/.{3}/g),who=(symbolic[1]||'a').replace('a','ugo'),op=symbolic[2],permissions=symbolic[3],index={u:0,g:1,o:2};
        [...new Set(who)].forEach(key=>{const i=index[key];if(i===undefined)return;let value=op==='='?{r:false,w:false,x:false,s:false,t:false}:bits(parts[i]);for(const permission of permissions){const on=op!=='-';if(permission==='r')value.r=on;else if(permission==='w')value.w=on;else if(permission==='x')value.x=on;else if(permission==='s')value.s=on;else if(permission==='t')value.t=on;}parts[i]=trip(value.r,value.w,value.x,i===2?value.t:value.s,i===2?'t':'s');});
        node.mode=parts.join('');
      }
      if(recursive&&node.type==='dir')Object.entries(node.children||{}).forEach(([leaf,child])=>apply(child,label.replace(/\/$/,'')+'/'+leaf));
    };
    apply(root,target);
  };

  const runLvcreate=args=>{
    if(!args.length){err('lvcreate: uso: lvcreate -n <nombre> (-L <tamaño> | -l <extents>) <vg>');return;}
    const lvm=getLvm(),vg=args.at(-1),group=lvm.vgs.find(value=>value.name===vg);
    if(!group){err('  Volume group "'+vg+'" not found');return;}
    const nameIndex=args.indexOf('-n'),sizeIndex=args.indexOf('-L'),extentIndex=args.indexOf('-l');
    if(nameIndex!==-1&&!args[nameIndex+1]){err('  Option -n requires an argument.');return;}
    if((sizeIndex!==-1&&extentIndex!==-1)||(sizeIndex===-1&&extentIndex===-1)){err('  Specify either --size (-L) or --extents (-l), but not both.');return;}
    const name=nameIndex!==-1?args[nameIndex+1]:'lvol0',extentSizeG=4/1024;
    let size=0,extents=null;
    if(sizeIndex!==-1){if(!args[sizeIndex+1]){err('  Option -L requires an argument.');return;}size=parseSizeG(args[sizeIndex+1]);}
    else {
      const value=args[extentIndex+1]||'',match=String(value).match(/^(\d+)(?:%(FREE|VG))?$/i);
      if(!match||+match[1]<=0){err('  Invalid argument for --extents: '+(value||'<vacío>'));return;}
      const amount=+match[1],base=(match[2]||'').toUpperCase();
      if(base==='FREE')size=group.vfree*(amount/100);
      else if(base==='VG')size=group.vsize*(amount/100);
      else {extents=amount;size=amount*extentSizeG;}
    }
    if(!size||size<=0){err('  Invalid logical volume size.');return;}
    if(size>group.vfree+1e-9){err('  Volume group "'+vg+'" has insufficient free space ('+fmtG(group.vfree)+' libres).');return;}
    if(lvm.lvs.find(volume=>volume.vg===vg&&volume.name===name)){err('  Logical Volume "'+name+'" already exists in volume group "'+vg+'"');return;}
    lvm.lvs.push({name,vg,size,extents:extents||Math.ceil(size/extentSizeG),extentSizeM:4,fstype:'',mount:''});
    group.vfree-=size;
    ok('  Logical volume "'+name+'" created.');
  };

  const runTar=args=>{
    const flags=args.filter(value=>value.startsWith('-')).join(''),operands=args.filter(value=>!value.startsWith('-')),archiveName=operands[0],items=operands.slice(1);
    const has=flag=>flags.includes(flag),compression=has('z')?'gzip':has('j')?'bzip2':has('J')?'xz':'none';
    const readArchive=node=>{
      if(!node||node.type!=='file')return null;
      if(node.content.startsWith('TARJSON:')){const first=node.content.indexOf(':',8);try{return{compression:node.content.slice(8,first),entries:JSON.parse(node.content.slice(first+1))};}catch(_){return null;}}
      const match=node.content.match(/^TARLIST:(?:([a-z0-9]+):)?(.*)$/);
      return match?{compression:match[1]||'none',entries:match[2].split(',').filter(Boolean).map(path=>({path,node:null}))}:null;
    };
    if(!archiveName){err('tar: opción requiere un argumento -- f');return;}
    if(has('c')){
      if(!items.length){err('tar: Cowardly refusing to create an empty archive');return;}
      const entries=[];let missing='';
      for(const item of items){const node=getNode(norm(item),false),path=String(item).replace(/^\/+|^\.\//g,'').replace(/\/+/g,'/');if(!node||!path||path.split('/').includes('..')){missing=item;break;}entries.push({path,node:JSON.parse(JSON.stringify(node))});}
      if(missing){err('tar: '+missing+': No se puede efectuar stat: No existe el fichero o el directorio');err('tar: Exiting with failure status due to previous errors');return;}
      const segments=norm(archiveName),parent=getParent(segments),leaf=segments.at(-1),currentUser=getCurrentUser(),users=getUsers();
      if(!parent||parent.type!=='dir'||!hasPerm(parent,'w')){err('tar: '+archiveName+': No se puede abrir: Permiso denegado');return;}
      const content='TARJSON:'+compression+':'+JSON.stringify(entries);
      if(!virtualWrite(parent.children[leaf],content,archiveName))return;
      parent.children[leaf]=file(content,{owner:currentUser,group:users[currentUser]?.primary||currentUser,mode:maskedMode('666')});
      if(has('v'))entries.forEach(entry=>out(entry.path));
      return;
    }
    const archiveNode=getNode(norm(archiveName),false),archive=readArchive(archiveNode);
    if(!archiveNode){err('tar: '+archiveName+': No se puede abrir: No existe el fichero o el directorio');return;}
    if(!archive){err('tar: Esto no parece un archivo tar');err('tar: Saliendo con estado de fallo debido a errores anteriores');return;}
    if(has('t')){archive.entries.forEach(entry=>out(entry.path));return;}
    if(has('x')){
      const currentUser=getCurrentUser(),users=getUsers();
      for(const entry of archive.entries){
        const parts=String(entry.path).split('/').filter(Boolean);
        if(!parts.length||parts.includes('..')){err("tar: Se rechaza el nombre de miembro inseguro '"+entry.path+"'");continue;}
        let parent=getNode(getCwd());
        for(const part of parts.slice(0,-1)){if(!parent.children[part])parent.children[part]=dir({},{owner:currentUser,group:users[currentUser]?.primary||currentUser});if(parent.children[part].type!=='dir'){err('tar: '+entry.path+': No es un directorio');parent=null;break;}parent=parent.children[part];}
        if(!parent)continue;
        parent.children[parts.at(-1)]=entry.node?JSON.parse(JSON.stringify(entry.node)):file('',{owner:currentUser,group:users[currentUser]?.primary||currentUser});
        if(has('v'))out(entry.path);
      }
      return;
    }
    out('tar: Debe especificar una de las opciones -c, -x o -t');
  };

  return{selinuxContextFor,sudoersRuleFor,sudoersSyntaxError,runChmod,runLvcreate,runTar};
}
