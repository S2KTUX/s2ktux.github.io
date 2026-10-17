export function ordenPromptDinamico(nonce){
 if(!/^[a-f0-9]{24}$/.test(nonce))throw Error('Marcador de prompt inválido');
 return `export PS1='[\\u@$(hostname -s) \\W]\\$ '; printf '\\n__DEBIAN_PROMPT_${nonce}__\\n'\n`;
}
export function promptConfirmado(text,nonce,name){
 if(!/^[a-f0-9]{24}$/.test(nonce)||!/^cka-(?:w[12]|cp[123])$/.test(name))throw Error('Identidad del prompt inválida');
 const clean=text.replace(/\r/g,'').replace(/\x1b\[[0-?]*[ -/]*[@-~]/g,'');
 return clean.split('\n').includes(`__DEBIAN_PROMPT_${nonce}__`)&&clean.endsWith(`[root@${name} ~]# `);
}
