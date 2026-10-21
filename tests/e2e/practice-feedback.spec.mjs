import {test,expect} from '@playwright/test';

async function panel(page){
 // Se prueba la interfaz sin arrancar la VM; los resultados del corrector son casos controlados.
 await page.route('**/v86-test.mjs?*',route=>route.fulfill({contentType:'text/javascript',body:`
 import {mountExercisePanel} from './v86-exercise-panel.mjs?v=20261021-estados';
 globalThis.practiceResult={ok:false,results:[{label:'Existe el archivo /root/salida.txt',ok:false},{label:'Contenido de /root/salida.txt',ok:false}]};
 const panel=mountExercisePanel(document.querySelector('#exercise-panel'),async()=>globalThis.practiceResult);panel.setEnabled(true);`}));
 await page.goto('/laboratorios/linux-real/');
 await page.selectOption('#exercise-select-class','1');
 await expect(page.locator('[data-exercise-title]')).toHaveText('Redirecciones · I');
}
test('La práctica realizada queda verde sin convertir un fallo en aprobado',async({page})=>{
 await panel(page);const select=page.locator('#exercise-select'),feedback=page.locator('[data-exercise-feedback]');
 await expect(select).toHaveAttribute('data-progress','pending');
 await page.locator('[data-exercise-check]').click();
 await expect(feedback).toContainText('Ejercicio incompleto.');await expect(feedback).toContainText('No existe el archivo /root/salida.txt.');
 await expect(feedback.locator('li')).toHaveCount(1);await expect(feedback).not.toContainText('Pendiente:');await expect(feedback).not.toContainText('Resultado solicitado');
 await expect(select.locator('option:checked')).toHaveText('Resuelta · Redirecciones · I');await expect(select).toHaveCSS('background-color','rgb(228, 237, 220)');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('s2ktux-practice-progress-v1:linux-real'))['salida-i'])).toMatchObject({state:'completed',result:'failed',source:'check'});
 await expect(page.locator('.practice-progress')).not.toContainText('Por corregir');await expect(page.locator('.practice-progress')).not.toContainText('Últimas comprobaciones');
 await page.evaluate(()=>globalThis.practiceResult={ok:false,results:[{label:'Existe el archivo /root/salida.txt',ok:true},{label:'Contenido de /root/salida.txt',ok:false}]});
 await page.locator('[data-exercise-check]').click();await expect(feedback).toContainText('El archivo /root/salida.txt debe contener «Hola».');await expect(feedback).not.toContainText('No existe');
 await page.evaluate(()=>globalThis.practiceResult={ok:true,results:[{label:'Existe el archivo /root/salida.txt',ok:true},{label:'Contenido de /root/salida.txt',ok:true}]});
 await page.locator('[data-exercise-check]').click();await expect(feedback).toHaveText('Ejercicio resuelto.');await expect(select).toHaveCSS('background-color','rgb(228, 237, 220)');
 await expect(select.locator('option:checked')).toHaveText('Resuelta · Redirecciones · I');
 await page.reload();await page.selectOption('#exercise-select-class','1');await expect(select).toHaveAttribute('data-progress','completed');
 await page.locator('[data-theme-toggle]').click();await expect(select).toHaveCSS('background-color','rgb(37, 56, 35)');
 await page.selectOption('#exercise-select','salida-ii');await expect(select).toHaveAttribute('data-progress','pending');
 page.on('dialog',dialog=>dialog.accept());await page.locator('.lab-progress-clear').click();
 await page.selectOption('#exercise-select','salida-i');await expect(select).toHaveAttribute('data-progress','pending');await expect(select.locator('option:checked')).toHaveText('Redirecciones · I');
});
test('Una práctica hecha se marca en verde también en móvil @mobile',async({page})=>{
 await panel(page);await page.locator('[data-exercise-check]').click();
 await expect(page.locator('#exercise-select')).toHaveCSS('background-color','rgb(228, 237, 220)');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 await expect(page.locator('.practice-progress strong')).toHaveCount(0);
});
test('Las marcas antiguas se conservan como prácticas realizadas',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('s2ktux-practice-progress-v1:linux-real',JSON.stringify({'salida-i':{state:'failed'},'salida-ii':{state:'passed'},'grep-i':{state:'reviewed'}})));
 await panel(page);
 for(const id of ['salida-i','salida-ii','grep-i']){await page.selectOption('#exercise-select',id);await expect(page.locator('#exercise-select')).toHaveAttribute('data-progress','completed');await expect(page.locator('#exercise-select option:checked')).toContainText('Resuelta · ');}
});
test('Un error de comprobación no marca una práctica como realizada',async({page})=>{
 await panel(page);await page.evaluate(()=>globalThis.practiceResult={results:[]});
 await page.locator('[data-exercise-check]').click();await expect(page.locator('[data-exercise-feedback]')).toHaveAttribute('data-result','error');
 await expect(page.locator('#exercise-select')).toHaveAttribute('data-progress','pending');await expect(page.locator('#exercise-select option:checked')).toHaveText('Redirecciones · I');
});
