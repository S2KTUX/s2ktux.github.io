const clean=text=>text.replace(/\r/g,'').replace(/\x1b\[[0-?]*[ -/]*[@-~]/g,'');
export class EstadoConsola{
 idle=false;
 receive(transcript){if(/(?:^|\n)\[[^\n@\]]+@[^\n\]]+ [^\n\]]*\][#$] $/.test(clean(transcript)))this.idle=true;}
 input(text){if(!/^\x1b\[\d+;\d+R$/.test(text))this.idle=false;}
}
