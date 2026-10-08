import assert from 'node:assert/strict';
import {atShellPrompt, createCheckRunner} from '../laboratorios/linux-real/v86-check-runner.mjs';
import {consoleSetupCommand} from '../laboratorios/linux-real/v86-guest-console.mjs';
for (const prompt of ['V86TEST# ', 'V86USER$ ', '[root@laboratorio ~]# ', '[ana@nodo1 etc]$ ', 'ana@nodo1:/home/ana$ ']) {
  assert.equal(atShellPrompt('\r\n\x1b[?2004h'+prompt), true, prompt);
  assert.equal(atShellPrompt('\n'+prompt+'ls'), false, 'Línea no vacía');
  assert.equal(atShellPrompt('\n'+prompt+' '), false, 'No enviar comprobaciones sobre una línea escrita');
}
for (const text of ['Password: ', 'Retype new password: ', 'login: ', 'grub> ', 'switch_root:/# ', 'bash-5.2# ', '[root@nodo ~]# vim /etc/fstab']) assert.equal(atShellPrompt(text), false, text);
const runner=createCheckRunner(text=>{const nonce=/__SETUP_([a-f0-9]{24})/.exec(text)[1];queueMicrotask(()=>runner.receive(`\n__SETUP_${nonce}=0\n\x1b[?2004h[root@nodo ~]# `));},()=>true);
const result=await runner.run({checks:[]},'true');
assert.match(result.output,/__SETUP_/);assert.match(result.serial,/\x1b\[\?2004h/);
const setup=consoleSetupCommand(false);
assert.match(setup,/export PS1=/);assert.doesNotMatch(setup,/chpasswd|autologin|recovery-ready/);
const recovery=consoleSetupCommand(true,'a'.repeat(48));
assert.match(recovery,/chpasswd/);assert.match(recovery,/zz-recovery\.conf/);assert.doesNotMatch(recovery,/--autologin/);
assert.throws(()=>consoleSetupCommand(true,'unsafe; value'));
console.log('✓ Consola Linux: prompt real, línea vacía, setup comprobado y recuperación sin autologin.');
