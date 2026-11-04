import {test,expect} from '@playwright/test';
async function setup(page){
 const requests=[];await page.route('https://www.googletagmanager.com/**',route=>{requests.push(route.request().url());return route.fulfill({contentType:'text/javascript',body:''});});
 await page.goto('/index.html?respuesta=privada#secreto');
 await page.evaluate(async()=>{const {mountAnalytics}=await import('/site-analytics.mjs');mountAnalytics({hosts:['127.0.0.1']});});return requests;
}
test('Analytics espera consentimiento, permite rechazar y retirar sin recargar la máquina',async({page})=>{
 const requests=await setup(page);expect(requests).toHaveLength(0);
 await page.getByRole('button',{name:'Rechazar',exact:true}).click();expect(requests).toHaveLength(0);await expect(page.locator('.analytics-choice')).toHaveCount(0);
 await page.locator('.analytics-preferences').click();await page.getByRole('button',{name:'Aceptar',exact:true}).click();await expect.poll(()=>requests.length).toBe(1);
 const config=await page.evaluate(()=>Array.from(dataLayer.find(item=>item[0]==='config'))[2]);expect(config.page_location).toBe('http://127.0.0.1:4173/index.html');expect(config.allow_google_signals).toBe(false);expect(config.allow_ad_personalization_signals).toBe(false);
 await page.evaluate(()=>document.cookie='_ga=test; Path=/');await page.locator('.analytics-preferences').click();await page.getByRole('button',{name:'Rechazar',exact:true}).click();
 expect(await page.evaluate(()=>window['ga-disable-G-EDJP6K0JVY'])).toBe(true);expect(await page.evaluate(()=>document.cookie)).not.toContain('_ga=');expect(page.url()).toContain('respuesta=privada');
 await page.locator('.analytics-preferences').click();await page.getByRole('button',{name:'Aceptar',exact:true}).click();expect(await page.evaluate(()=>window['ga-disable-G-EDJP6K0JVY'])).toBe(false);expect(requests).toHaveLength(1);
});
test('Consentimiento legible y sin desbordamientos en móvil @mobile',async({page})=>{
 await setup(page);await expect(page.locator('.analytics-choice')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 await page.getByRole('button',{name:'Rechazar',exact:true}).click();await page.reload();expect(await page.locator('script[src*="googletagmanager"]').count()).toBe(0);
});
