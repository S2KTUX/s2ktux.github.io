import {createCheckRunner,atShellPrompt} from './v86-check-runner.mjs?v=20261009-intuitive';
import {shellQuote} from './v86-exercises.mjs?v=20261009-intuitive';

// Los avisos del arranque pueden llegar divididos entre bloques de salida.
// Detectar únicamente los marcadores nuevos, no repetir uno que siga en la cola.
export function createExamBootDetector(onBoot){
  let tail='';
  return text=>{const previous=tail.length,combined=tail+text;for(const match of combined.matchAll(/GNU\s+GRUB|reboot:\s*Restarting system/g))if(match.index+match[0].length>previous)onBoot();tail=combined.slice(-64);};
}

// Segunda TTY real, únicamente en las máquinas desechables del examen.
// No escribe en el editor, login o comando que esté usando el alumno.
export function createExamConsole(vm){
  const cpu=vm.v86.cpu;
  if(cpu.devices.uart1)throw Error('La consola de comprobación ya existe.');
  cpu.devices.uart1=new cpu.devices.uart0.constructor(cpu,0x2f8,vm.emulator_bus);
  let transcript='';
  const send=text=>{for(const byte of new TextEncoder().encode(text))vm.bus.send('serial1-input',byte);};
  const runner=createCheckRunner(send,()=>atShellPrompt(transcript),300000);
  vm.add_listener('serial1-output-byte',byte=>{
    const text=String.fromCharCode(byte);transcript=(transcript+text).slice(-12000);runner.receive(text);
  });
  return {
    run:exercise=>runner.run(exercise),
    ready:()=>atShellPrompt(transcript),
    invalidate:()=>{transcript='';},
    reconnect:async()=>{if(!atShellPrompt(transcript)){send('\n');const start=Date.now();while(!atShellPrompt(transcript)&&Date.now()-start<5000)await new Promise(resolve=>setTimeout(resolve,100));}return atShellPrompt(transcript);},
    wait:async(timeout=30000)=>{
      const start=Date.now();
      while(!atShellPrompt(transcript)){
        if(Date.now()-start>timeout)throw Error('La consola de comprobación no está disponible.');
        await new Promise(resolve=>setTimeout(resolve,100));
      }
    },
  };
}

export function examConsoleSetupCommand(){
  const typeSerial=`import os,fcntl,struct
fd=os.open('/dev/ttyS1',os.O_RDWR|os.O_NONBLOCK|os.O_NOCTTY)
s=bytearray(60)
fcntl.ioctl(fd,0x541e,s,True)
struct.pack_into('<i',s,0,4)
fcntl.ioctl(fd,0x541f,s)
os.close(fd)`;
  const unit=`[Unit]
Description=Consola de comprobacion del examen
[Service]
ExecStart=/usr/bin/runcon unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023 /bin/bash --noprofile --norc -i
Environment="PS1=V86TEST# "
Environment=TERM=dumb
StandardInput=tty
StandardOutput=tty
StandardError=tty
TTYPath=/dev/ttyS1
TTYReset=yes
Restart=always
KillSignal=SIGHUP
TimeoutStopSec=3
[Install]
WantedBy=multi-user.target
`;
  return '/bin/sh -c '+shellQuote([
    'set -e', 'python3 -c '+shellQuote(typeSerial),
    'printf %s '+shellQuote(unit)+' > /etc/systemd/system/lab-exam-console.service',
    'restorecon /etc/systemd/system/lab-exam-console.service',
    'systemctl daemon-reload','systemctl enable --now lab-exam-console.service',
  ].join('\n'));
}
