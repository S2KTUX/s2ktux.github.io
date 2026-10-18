export const courseGroups={
 linux:['Herramientas esenciales','Administración del software','Scripts de shell','Sistemas en funcionamiento','Almacenamiento local','Sistemas de archivos','Servicios y tareas','Redes básicas','Usuarios y grupos','Seguridad','Práctica adicional'],
 docker:['Fundamentos de Docker','Docker para el día a día','Docker profesional'],
};
const linuxClasses={archivo:1,usuarios:9,sgid:6,'archivo-tar':1,dnf:2,lvm:5,selinux:10,tuned:4,podman:11};
const simLinuxClasses=[4,8,2,10,9,6,7,1,6,7,11,1,9,9,5,5,5,4,3,10,11];
const simDockerClasses=[1,1,1,1,1,1,1,2,2,2,2,3,2,2,3];
// Las tareas que combinan temas van después de introducir todos sus conceptos.
const simKubernetesClasses=[0,6,5,5,11,2,20,27,12,5,21,14,32,33,28,27,34];
export function practiceClasses(mode,task,index){return task.classes||[task.class??linuxClasses[task.id]??(mode==='linux'?simLinuxClasses[index]:mode==='docker'?simDockerClasses[index]:simKubernetesClasses[index])??1];}
// Conserva los identificadores y los correctores. Solo filtra la vista.
export function mountGroups({select,mode,tasks,indexed=false,onChange=()=>{},loadTasks,groups=courseGroups[mode],firstClass=1}){
 const wrapper=document.createElement('div');wrapper.className='exercise-nav';
 const classField=document.createElement('div'),questionField=document.createElement('div');classField.className=questionField.className='exercise-field';
 const classSelect=document.createElement('select');classSelect.id=select.id+'-class';
 const label=document.createElement('label');label.htmlFor=classSelect.id;label.textContent='Clase';classField.append(label,classSelect);
 const questionLabel=document.createElement('label');questionLabel.htmlFor=select.id;questionLabel.textContent='Pregunta';
 select.before(wrapper);questionField.append(questionLabel,select);wrapper.append(classField,questionField);
 const option=(value,text)=>{const node=document.createElement('option');node.value=value;node.textContent=text;return node;};
 classSelect.append(option('all','Todas las clases'),...groups.map((name,i)=>{const number=i+firstClass,item=option(String(number),String(number).padStart(2,'0')+' — '+name);if(mode==='kubernetes'&&!tasks.some((task,index)=>practiceClasses(mode,task,index).includes(number))){item.disabled=true;item.textContent+=' · Próximamente';}return item;}));
 const originals=[...select.options].map(node=>node.cloneNode(true));
 function populate(){
  const previous=select.value,number=classSelect.value;select.replaceChildren();
  const free=originals.find(node=>node.value==='');if(free)select.append(free.cloneNode(true));
  const ordered=tasks.map((task,index)=>({task,index})).filter(({task,index})=>number==='all'||practiceClasses(mode,task,index).includes(Number(number))).sort((a,b)=>(a.task.order??100+a.index)-(b.task.order??100+b.index));
  for(const {task,index}of ordered){const value=indexed?String(index):task.id;const existing=originals.find(node=>node.value===value);if(existing)select.append(existing.cloneNode(true));}
  select.value=[...select.options].some(node=>node.value===previous)?previous:'';onChange();
 }
 let loaded=false;
 classSelect.onchange=async()=>{
  if(loadTasks&&!loaded){classSelect.disabled=true;try{const additions=await loadTasks();const first=tasks.length;tasks.push(...additions);additions.forEach((task,index)=>originals.push(option(indexed?String(first+index):task.id,task.title)));loaded=true;}catch{const error=document.createElement('p');error.setAttribute('role','alert');error.textContent='No se pudieron cargar las prácticas iniciales. Vuelve a elegir la clase.';wrapper.after(error);return;}finally{classSelect.disabled=false;}}
  populate();if(classSelect.value!=='all'&&select.options.length>1){select.selectedIndex=1;select.dispatchEvent(new Event('change'));}
 };
 populate();return classSelect;
}
