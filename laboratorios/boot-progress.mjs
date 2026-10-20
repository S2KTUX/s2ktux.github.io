// Refleja estados reales de carga; nunca inventa mensajes del kernel.
export function bootProgress(status,terminal,{ready=()=>false}={}){
 let active=false,last='',lastTime=0;
 const show=()=>{const text=status.textContent.trim();if(!active||ready()||!text||text===last)return;const now=Date.now();if(/\d+\s*%/.test(text)&&now-lastTime<700)return;last=text;lastTime=now;terminal.writeln('\r\n[Laboratorio] '+text);};
 const observer=new MutationObserver(show);observer.observe(status,{childList:true,subtree:true,characterData:true});
 return {start(){active=true;show();},stop(){active=false;},destroy(){observer.disconnect();}};
}
