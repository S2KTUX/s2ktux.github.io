const clean=text=>text.replace(/\r/g,'').replace(/\x1b\[[0-?]*[ -/]*[@-~]/g,'');
export function promptReal(transcript){return /(?:^|\n)(\[[^\n@\]]+@[^\n\]]+ [^\n\]]*\][#$] )$/.exec(clean(transcript))?.[1]||null;}
// Solo presentación. No ejecuta órdenes, no fabrica un prompt ni cambia Linux.
export class PresentacionConsola{
 opened=false;text='';restored=false;lastPrompt=null;
 constructor(terminal){this.terminal=terminal;}
 restore(text){if(this.opened)throw Error('La consola ya está abierta');this.text=String(text||'').slice(-300000);this.restored=true;}
 write(text){if(!this.opened)return;this.text=(this.text+text).slice(-300000);this.terminal.write(text);}
 finish(text){
  const actual=promptReal(text),previous=promptReal(this.text);
  if(actual)this.lastPrompt=actual;
  if(!this.opened)return;
  if(actual&&actual===previous&&clean(text).trim()===actual.trim())return;
  this.write(text);
 }
 open(transcript,{diagnostic=false}={}){
  if(this.opened)return;
  const prompt=promptReal(transcript)||this.lastPrompt;
  if(!prompt&&!diagnostic)throw Error('El shell todavía no ha devuelto su prompt');
  this.opened=true;this.terminal.reset();
  if(this.restored){const saved=this.text;this.text='';this.write(saved);if(diagnostic)this.write('\r\n'+transcript.slice(-12000));else if(prompt&&promptReal(saved)!==prompt)this.write('\r\n'+prompt);}
  else{this.text='';this.write(diagnostic?transcript.slice(-12000):prompt);}
 }
}
