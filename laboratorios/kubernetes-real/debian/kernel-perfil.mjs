// Kernels inmutables. v2 solo se admite frío en administración privada.
const hashes=Object.freeze({v1:'7266ac03849dd287b8e672d8ae9e882d6eb3c1bcd5e88d951132c2614b56cd96',v2:'012b953b438b4a47699fd406c123ca5e4f3d7ed2257bdb324a3ee4cd7a051636'});
export function kernelSha256(version){if(!Object.hasOwn(hashes,version))throw Error('Kernel candidato desconocido');return hashes[version];}
