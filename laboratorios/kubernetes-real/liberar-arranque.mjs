// Llamar solo después de emulator-loaded: v86 ya ha copiado el estado a la
// RAM y a sus dispositivos. No modifica esa RAM, los discos ni guardados.
export function liberarEstadoInicial(settings){
 const initial=settings?.initial_state;
 if(!initial)return false;
 delete initial.buffer;
 delete settings.initial_state;
 return true;
}
