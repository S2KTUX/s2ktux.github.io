import {comandosArchivoSerie} from '../archivos-serie.mjs';
// El getty conserva su shell padre y el terminal. Solo el Bash interactivo
// hijo usa una slice propia de peso 20; los servicios y Pods no se mueven.
export const consolaCgroup='/s2ktuxconsole.slice/';
export const perfilSlice='[Unit]\nDescription=S2KTUX interactive laboratory console\n[Slice]\nCPUWeight=20\n';
export const perfilConsola=`# S2KTUX: sesión interactiva independiente de system.slice.
case "$-" in
 *i*)
  if [ "\${S2KTUX_CONSOLE_SCOPE-}" != 1 ] && [ "$(id -u)" = 0 ] && [ "$(tty)" = /dev/ttyS0 ] && command -v systemd-run >/dev/null 2>&1; then
   if S2KTUX_CONSOLE_SCOPE=1 systemd-run --scope --quiet --slice=s2ktuxconsole.slice /bin/bash --login; then
    exit
   fi
  fi
 ;;
esac
`;
export function prepararPerfilConsola(){
 const temp='/tmp/s2ktux-console-scope.sh',target='/etc/profile.d/80-s2ktux-console.sh',sliceTemp='/tmp/s2ktuxconsole.slice',sliceTarget='/etc/systemd/system/s2ktuxconsole.slice';
 return [...comandosArchivoSerie(temp,perfilConsola),...comandosArchivoSerie(sliceTemp,perfilSlice),`set -eu; if test -e ${target}; then cmp -s ${temp} ${target}; fi; if test -e ${sliceTarget}; then cmp -s ${sliceTemp} ${sliceTarget}; fi; mkdir -p /etc/profile.d /etc/systemd/system; if test ! -e ${target}; then install -m 644 ${temp} ${target}; fi; if test ! -e ${sliceTarget}; then install -m 644 ${sliceTemp} ${sliceTarget}; fi; systemctl daemon-reload`];
}
export function ordenCambiarConsola(nonce){
 if(!/^[a-f0-9]{24}$/.test(nonce))throw Error('Marcador de consola inválido');
 return `if S2KTUX_CONSOLE_SCOPE=1 systemd-run --scope --quiet --slice=s2ktuxconsole.slice /bin/bash -lc 'printf "\\n__S2KTUX_CONSOLE_${nonce}__\\n"; exec /bin/bash --login'; then exit; fi\n`;
}
export function consolaConfirmada(text,nonce){
 ordenCambiarConsola(nonce);
 const clean=text.replace(/\r/g,'').replace(/\x1b\[[0-?]*[ -/]*[@-~]/g,'');
 return clean.split('\n').includes(`__S2KTUX_CONSOLE_${nonce}__`)&&/\[root@[^\n\]]+ ~\]# $/.test(clean);
}
