import {test,expect} from '@playwright/test';
import {readdirSync} from 'node:fs';

const topics=readdirSync(new URL('../../cursos/lpic-1/',import.meta.url)).filter(s=>s.startsWith('tema-'));
async function checkCourse(page){
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 for(const topic of topics){
  const response=await page.goto('/cursos/lpic-1/'+topic+'/');
  expect(response.status()).toBe(200);
  await expect(page.locator('h1')).toBeVisible();
  const links=page.locator('.lesson-toc a,.mobile-toc a');
  await expect(links.first()).toHaveAttribute('aria-current','true');
  // Los IDs «101.1» son válidos en HTML, pero no selectores CSS sin escapar.
  const id=await page.locator('.lesson-section').nth(1).getAttribute('id');
  await page.evaluate(id=>scrollTo(0,document.getElementById(id).getBoundingClientRect().top+scrollY-100),id);
  await expect(page.locator('.lesson-toc a[aria-current="true"],.mobile-toc a[aria-current="true"]')).toHaveAttribute('href','#'+id);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 }
 expect(errors).toEqual([]);
}
test('Los diez temas LPIC conservan el índice numérico y el contenido visible',async({page})=>checkCourse(page));
test('Los diez temas LPIC caben en móvil y su índice sigue la sección @mobile',async({page})=>checkCourse(page));
