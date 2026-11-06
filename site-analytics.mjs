// Estadísticas agregadas sin cookies; nunca dentro de las consolas embebidas.
export const ANALYTICS_SITES={
 's2ktux.github.io':'ff24e78f74664e0e93fa6a8ac86f055e',
 's2ktux.s2ktux.workers.dev':'c431b14eb2c342b89f9223bd53fce039',
};
export function mountAnalytics({win=window,doc=document,sites=ANALYTICS_SITES}={}){
 if(win.self!==win.top)return;
 // Retirar únicamente los restos de nuestra integración anterior de Google.
 win['ga-disable-G-EDJP6K0JVY']=true;
 try{win.localStorage.removeItem('s2ktux-analytics-consent-v1');}catch{}
 for(const cookie of doc.cookie.split(';')){
  const name=cookie.split('=')[0].trim();if(!/^_ga(?:_|$)/.test(name))continue;
  for(const domain of ['',win.location.hostname,'.'+win.location.hostname])doc.cookie=name+'=; Max-Age=0; Path=/'+(domain?'; Domain='+domain:'');
 }
 const token=sites[win.location.hostname];
 if(!/^[a-f0-9]{32}$/.test(token||'')||win.navigator.globalPrivacyControl===true||win.navigator.doNotTrack==='1'||doc.querySelector('script[data-cf-beacon]'))return;
 const script=doc.createElement('script');script.type='module';script.async=true;
 script.src='https://static.cloudflareinsights.com/beacon.min.js';
 script.setAttribute('data-cf-beacon',JSON.stringify({token,spa:false}));
 doc.head.append(script);
 return {provider:'cloudflare'};
}
