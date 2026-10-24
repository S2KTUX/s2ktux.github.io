import {parametrosPublicos,nivelDisponible,claseDisponible} from './disponibilidad-curso.mjs?v=972ae9a30819f731';
import {NIVELES,nivelDesdeURL} from './niveles.mjs?v=20261020-aprendizaje';
import {claseDesdeURL,clasesNivel} from './clases-curso.mjs?v=20261020-aprendizaje';
import {mountLabNotices} from '../../lab-notices.mjs';
mountLabNotices(document.querySelector('main'));
const $=id=>document.getElementById(id),url=new URL(location.href);
url.search=parametrosPublicos(url.search).toString();
if(['0','00'].includes(url.searchParams.get('clase')))url.searchParams.set('clase','1');
history.replaceState(history.state,'',url.href);
let preview=nivelDesdeURL(url.searchParams),mode=url.searchParams.get('view')==='exam'?'exam':'practice',loading=false;
function previewClass(){try{return preview===nivelDesdeURL(url.searchParams)?claseDesdeURL(url.searchParams,preview):clasesNivel(preview)[0].number;}catch{return null;}}
function available(){return nivelDisponible(preview)&&claseDisponible(previewClass());}
function paint(){
 $('lab-entry').hidden=false;$('practice-configuration').hidden=mode!=='practice';$('exam-configuration').hidden=mode!=='exam';
 $('mode-practice').setAttribute('aria-pressed',String(mode==='practice'));$('mode-exam').setAttribute('aria-pressed',String(mode==='exam'));
 document.querySelector('main').dataset.level=preview;
 for(const button of document.querySelectorAll('[data-choose-stage]'))button.setAttribute('aria-pressed',String(button.dataset.chooseStage===preview));
 $('entry-intro').hidden=available();$('entry-intro').textContent=available()?'':'Próximamente. Este laboratorio o la clase solicitada todavía no está disponible.';
 $('enter-lab').disabled=loading||!available();$('enter-lab').textContent=loading?'Abriendo laboratorio…':available()?'Abrir laboratorio '+NIVELES[preview].name.toLowerCase():'Próximamente';
 $('start-cluster').disabled=true;
}
for(const button of document.querySelectorAll('[data-choose-stage]')){button.querySelector('.level-name').dataset.levelName='';button.onclick=()=>{if(!loading){preview=button.dataset.chooseStage;paint();}};}
$('mode-practice').onclick=()=>{if(!loading){mode='practice';paint();}};
$('mode-exam').onclick=()=>{if(!loading){mode='exam';paint();}};
for(const button of document.querySelectorAll('[data-exam-language]'))button.onclick=()=>{
 const english=button.dataset.examLanguage==='en';for(const item of document.querySelectorAll('[data-exam-language]'))item.setAttribute('aria-pressed',String(item===button));
 $('exam-configuration').lang=english?'en':'es';$('exam-heading').textContent=english?'CKA mock exam':'Simulacro CKA';
 $('exam-description').textContent=english?'Two hours to complete hands-on Kubernetes administration tasks. A score of at least 66/100 is required to pass. We recommend completing the mock exam using only the official Kubernetes documentation.':'Dos horas para resolver tareas prácticas de administración de Kubernetes. Para aprobar se necesita al menos 66/100. Se recomienda realizar el simulacro consultando únicamente la documentación oficial de Kubernetes.';
 $('exam-pending').textContent=english?'Coming soon. The mock exam is not available yet.':'Próximamente. El simulacro todavía no está disponible.';
 $('start-exam').textContent=english?'Start exam · Coming soon':'Iniciar examen · Próximamente';
 $('exam-language-note').textContent=english?'* Spanish is a learning aid in this simulator, not an official CKA exam language.':'* El castellano es una ayuda de este simulacro; no es un idioma oficial del examen CKA.';
};
async function open(){
 if(loading||mode!=='practice'||!available())return;
 loading=true;paint();$('lab-loading').hidden=true;$('lab-retry').hidden=true;
 const target=new URL(location.href);target.searchParams.set('level',preview);target.searchParams.set('enter','1');
 target.search=parametrosPublicos(target.search).toString();
 const number=previewClass();
 target.searchParams.set('clase',String(number));history.replaceState(history.state,'',target.href);
 try{await import('./multinodo.mjs?v=3ba464e1cb317e64');}
 catch(error){loading=false;paint();$('lab-loading').hidden=false;$('lab-loading').textContent='No se ha podido abrir el laboratorio. Vuelve a intentarlo.';$('lab-retry').hidden=false;console.error('Carga del laboratorio:',error);}
}
$('enter-lab').onclick=open;$('lab-retry').onclick=()=>location.reload();paint();
if(url.searchParams.get('enter')==='1')queueMicrotask(open);
