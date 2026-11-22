import pathlib,tarfile,hashlib,json,gzip,io
root=pathlib.Path('/home/s2ktux/kubernetes-browser-build-20261012/kubernetes-1.35.9')
out=pathlib.Path('/mnt/d/RIVALIA/s2ktux-publicacion/qa/evidencia/kubeadm-ha-etcd60s')
binary=out/'kubeadm'
digest=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
(out/'SHA256SUMS').write_text(digest(binary)+'  kubeadm\n')
buffer=io.BytesIO()
with tarfile.open(fileobj=buffer,mode='w') as tar:
    for name in ['kubeadm','SHA256SUMS','LICENSE','NOTICE','fuente.json','etcd.go']:
        if (out/name).exists():tar.add(out/name,arcname=name)
    for file in (root/'vendor').rglob('*'):
        if file.is_file() and file.name.upper().startswith(('LICENSE','NOTICE','COPYING','COPYRIGHT')):
            tar.add(file,arcname='licencias/'+str(file.relative_to(root)))
archive=out/'kubeadm-ha.tar.gz'
archive.write_bytes(gzip.compress(buffer.getvalue(),mtime=0))
metadata={'bytes':archive.stat().st_size,'archiveSha256':digest(archive),'binarySha256':digest(binary),'version':'v1.35.9+s2ktux.ha.etcd60s'}
(out/'paquete.json').write_text(json.dumps(metadata,indent=2))
print(json.dumps(metadata))
