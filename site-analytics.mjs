// Solo páginas públicas y consentimiento explícito; nunca las consolas embebidas.
export const MEASUREMENT_ID='G-EDJP6K0JVY';
export function mountAnalytics({win=window,doc=document,id=MEASUREMENT_ID,hosts=['s2ktux.github.io','s2ktux.s2ktux.workers.dev']}={}){
 if(win.self!==win.top||!hosts.includes(win.location.hostname)||!/^G-[A-Z0-9]+$/.test(id))return;
 const key='s2ktux-analytics-consent-v1',age=180*86400000;
 let loaded=false,panel;
 const saved=()=>{try{const v=JSON.parse(win.localStorage.getItem(key));return v&&['yes','no'].includes(v.value)&&Date.now()-v.at>=0&&Date.now()-v.at<age?v.value:null;}catch{return null;}};
 function start(){
  win['ga-disable-'+id]=false;if(loaded)return;loaded=true;
  win.dataLayer=win.dataLayer||[];
  win.gtag=function(){win.dataLayer.push(arguments);};
  win.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  win.gtag('js',new Date());
  let referrer='';try{referrer=new URL(doc.referrer).origin;}catch{}
  win.gtag('config',id,{page_location:win.location.origin+win.location.pathname,page_referrer:referrer,allow_google_signals:false,allow_ad_personalization_signals:false,cookie_expires:180*86400});
  const script=doc.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+id;doc.head.append(script);
 }
 function choose(value){
  try{win.localStorage.setItem(key,JSON.stringify({value,at:Date.now()}));}catch{}
  if(value==='yes')start();else{
   win['ga-disable-'+id]=true;
   for(const cookie of doc.cookie.split(';')){const name=cookie.split('=')[0].trim();if(!/^_ga(?:_|$)/.test(name))continue;
    for(const domain of ['',win.location.hostname,'.'+win.location.hostname])doc.cookie=name+'=; Max-Age=0; Path=/'+(domain?'; Domain='+domain:'');
   }
  }
  panel?.remove();panel=null;
 }
 function show(){
  if(panel){panel.querySelector('button').focus();return;}
  panel=doc.createElement('section');panel.className='analytics-choice';panel.setAttribute('aria-label','Estadísticas de visitas');
  const text=doc.createElement('p');text.textContent='¿Permites estadísticas de visitas con Google Analytics? Puedes usar toda la página sin aceptarlas.';
  const more=doc.createElement('a');more.href='/sobre.html#privacidad';more.textContent='Más información';text.append(' ',more);panel.append(text);
  for(const [label,value]of [['Aceptar','yes'],['Rechazar','no']]){const button=doc.createElement('button');button.type='button';button.textContent=label;button.onclick=()=>choose(value);panel.append(button);}
  doc.body.append(panel);
 }
 const control=doc.createElement('button');control.type='button';control.className='analytics-preferences';control.textContent='Estadísticas de visitas';control.onclick=show;
 const footer=doc.querySelector('footer');(footer||doc.body).append(control);
 if(saved()==='yes')start();else if(!saved())show();
 return {show};
}
