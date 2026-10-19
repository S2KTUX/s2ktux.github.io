// Adaptación de las pruebas antiguas del motor a la selección Clase → Pregunta.
// Las pruebas de la interfaz nueva realizan esos pasos explícitamente.
import {exercises as linux} from '../../laboratorios/linux-real/v86-exercises.mjs';
import {exercises as docker} from '../../laboratorios/docker-real/docker-exercises.mjs';
import {practiceClasses} from '../../laboratorios/lab-groups.mjs';
const linuxClasses=[4,8,2,10,9,6,7,1,6,7,11,1,9,9,5,5,5,4,3,10,11];
const dockerClasses=[1,1,1,1,1,1,1,2,2,2,2,3,2,2,3];
const dockerIds=['alpine','primer','ciclo','web','diagnostico','build','build-run','exportar','volumen','bind','red','limites','compose','compose-scale','multistage'];
const kubernetesClasses=[13,6,5,5,11,2,20,27,12,5,21,14,32,33,28,27,34];
export async function adaptLegacyPracticeSelection(page){
 await page.addInitScript(()=>{globalThis.__S2KTUX_TEST_FIXTURES__=true;});
 const original=page.selectOption.bind(page);
 page.selectOption=async(selector,value,...options)=>{
  if(selector==='#chal-select'&&await page.locator('#chal-select-class').count()){
   if(value===''){await original('#chal-select-class','free');return [];}
   const mode=new URL(page.url()).searchParams.get('mode')||'linux',index=Number(value);
   if(['linux','docker','kubernetes'].includes(mode)){
    const number=(mode==='linux'?linuxClasses:mode==='docker'?dockerClasses:kubernetesClasses)[index];
    await original('#chal-select-class',String(number));
    const source=mode==='linux'?'sim-'+String(index+1).padStart(2,'0'):mode==='docker'?dockerIds[index]:String(index);
    await page.waitForFunction(({selector,source})=>[...document.querySelector(selector).options].some(item=>item.dataset.sourceId===source),{selector,source});
    value=await page.locator(selector+' option').evaluateAll((items,source)=>items.find(item=>item.dataset.sourceId===source).value,source);
   }
  }else if(selector==='#exercise-select'||selector==='#exercise'){
   const mode=page.url().includes('/docker-real/')?'docker':page.url().includes('/linux-real/')?'linux':null;
   if(mode){const task=(mode==='linux'?linux:docker).find(task=>task.id===value&&!task.legacyOnly);if(task)await original(selector+'-class',task.practiceExam?'exam':String(practiceClasses(mode,task)[0]));}
  }
  return original(selector,value,...options);
 };
}
