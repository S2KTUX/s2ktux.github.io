import {test,expect} from '@playwright/test';
const token='a'.repeat(32);
async function setup(page){
 const requests={cloudflare:[],google:[]};
 await page.route('https://static.cloudflareinsights.com/**',route=>{requests.cloudflare.push(route.request().url());return route.fulfill({contentType:'text/javascript',body:''});});
 await page.route(/https:\/\/(?:[a-z0-9-]+\.)?(?:googletagmanager|google-analytics)\.com\//,route=>{requests.google.push(route.request().url());return route.abort();});
 await page.goto('/index.html?respuesta=privada#secreto');
 await page.evaluate(async token=>{const {mountAnalytics}=await import('/site-analytics.mjs');mountAnalytics({sites:{'127.0.0.1':token}});},token);
 return requests;
}

test('Estadísticas sin aviso, sin Google y sin duplicar el beacon; conserva los datos del alumno',async({page})=>{
 await page.addInitScript(()=>{localStorage.setItem('s2ktux-analytics-consent-v1',JSON.stringify({value:'yes',at:Date.now()}));localStorage.setItem('practica-alumno','conservar');document.cookie='_ga=anterior; Path=/';document.cookie='preferencia-alumno=conservar; Path=/';});
 const requests=await setup(page);await expect.poll(()=>requests.cloudflare.length).toBe(1);
 await expect(page.locator('.analytics-choice,.analytics-preferences')).toHaveCount(0);
 expect(requests.google).toHaveLength(0);expect(page.url()).toContain('?respuesta=privada#secreto');
 const state=await page.evaluate(()=>({choice:localStorage.getItem('s2ktux-analytics-consent-v1'),practice:localStorage.getItem('practica-alumno'),cookies:document.cookie,config:JSON.parse(document.querySelector('script[data-cf-beacon]').getAttribute('data-cf-beacon'))}));
 expect(state.choice).toBeNull();expect(state.practice).toBe('conservar');expect(state.cookies).not.toMatch(/(?:^|;\s*)_ga=/);expect(state.cookies).toContain('preferencia-alumno=conservar');expect(state.config).toEqual({token,spa:false});
 await page.evaluate(async token=>{const {mountAnalytics}=await import('/site-analytics.mjs');mountAnalytics({sites:{'127.0.0.1':token}});},token);
 await expect(page.locator('script[data-cf-beacon]')).toHaveCount(1);expect(requests.cloudflare).toHaveLength(1);
});

test('Estadísticas respeta Do Not Track y excluye las consolas embebidas',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(navigator,'doNotTrack',{value:'1',configurable:true}));
 const requests=await setup(page);await expect(page.locator('script[data-cf-beacon]')).toHaveCount(0);expect(requests.cloudflare).toHaveLength(0);
 await page.evaluate(async token=>{Object.defineProperty(navigator,'doNotTrack',{value:'0',configurable:true});Object.defineProperty(navigator,'globalPrivacyControl',{value:true,configurable:true});const {mountAnalytics}=await import('/site-analytics.mjs');mountAnalytics({sites:{'127.0.0.1':token}});},token);
 await expect(page.locator('script[data-cf-beacon]')).toHaveCount(0);expect(requests.cloudflare).toHaveLength(0);
 await page.evaluate(async token=>{const {mountAnalytics}=await import('/site-analytics.mjs');const frame=document.createElement('iframe');document.body.append(frame);mountAnalytics({win:frame.contentWindow,doc:frame.contentDocument,sites:{'':token}});},token);
 expect(await page.evaluate(()=>document.querySelector('iframe').contentDocument.querySelectorAll('script[data-cf-beacon]').length)).toBe(0);
 await expect(page.locator('.analytics-choice,.analytics-preferences')).toHaveCount(0);
});

test('La página no muestra ventanas de estadísticas en móvil @mobile',async({page})=>{
 const requests=await setup(page);await expect.poll(()=>requests.cloudflare.length).toBe(1);await expect(page.locator('.analytics-choice,.analytics-preferences')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);expect(requests.google).toHaveLength(0);
});
