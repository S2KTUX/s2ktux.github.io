import { exercises } from './v86-exercises.mjs?v=20261019-revision';
import {renderSolutions} from '../lab-solutions.mjs?v=20261019-revision';
import {solutionsFor} from '../solution-options.mjs?v=20261019-revision';
import {mountGroups} from '../lab-groups.mjs?v=20261019-revision';

export function mountExercisePanel(root, runCheck) {
  const select = root.querySelector('select');
  const title = root.querySelector('[data-exercise-title]');
  const goal = root.querySelector('[data-exercise-goal]');
  const note = root.querySelector('[data-exercise-note]');
  const check = root.querySelector('[data-exercise-check]');
  const toggle = root.querySelector('[data-exercise-solution]');
  const solution = root.querySelector('[data-exercise-solution-body]');
  const feedback = root.querySelector('[data-exercise-feedback]');
  const card = root.querySelector('[data-exercise-card]');
  const prepare=document.createElement('button'),setup=document.createElement('div');prepare.type='button';prepare.textContent='Preparar ejercicio';setup.className='controls';setup.hidden=true;setup.append(prepare);check.parentElement.before(setup);
  let enabled = false, checking = false, generation = 0;
  const available = () => exercises;
  const populate = () => {
    select.replaceChildren();
    const free=document.createElement('option');free.value='';free.textContent='Práctica libre';select.append(free);
    const groups = new Map();
    for (const exercise of available()) {
      if (!groups.has(exercise.group)) {
        const group = document.createElement('optgroup'); group.label = exercise.group;
        select.append(group); groups.set(exercise.group, group);
      }
      const option = document.createElement('option');
      option.value = exercise.id; option.textContent = exercise.title; groups.get(exercise.group).append(option);
    }
  };
  const selected = () => available().find(exercise => exercise.id === select.value);
  const sync = () => {
    check.disabled = !enabled || checking;
    select.disabled = checking;
    const classSelect=document.getElementById(select.id+'-class');if(classSelect)classSelect.disabled=checking;
    toggle.disabled = checking;
    setup.hidden=!selected()?.prepare;prepare.disabled=!enabled||checking;
    card.hidden = !selected();
  };
  const render = () => {
    generation++;
    const exercise = selected();
    if(!exercise){card.hidden=true;feedback.replaceChildren();solution.hidden=true;sync();return;}
    title.textContent = exercise.title; goal.textContent = exercise.goal;
    note.textContent = exercise.note || ''; note.hidden = !exercise.note;
    renderSolutions(solution,solutionsFor('linux',exercise));
    solution.hidden = true; toggle.textContent = 'Ver solución'; toggle.setAttribute('aria-expanded', 'false');
    feedback.replaceChildren();
    feedback.dataset.result = 'pending'; sync();
  };
  select.addEventListener('change', render);
  prepare.addEventListener('click',async()=>{
    const exercise=selected();if(!enabled||checking||!exercise?.prepare)return;
    checking=true;sync();prepare.textContent='Preparando…';feedback.textContent='Preparando el servidor de apoyo; espera a que Linux termine.';
    try{const result=await runCheck({id:exercise.id+'-preparar',checks:[['Servidor de apoyo disponible','set -eu; '+exercise.prepare,60]]});feedback.textContent=result.ok?'Servidor de apoyo preparado. Ya puedes resolver el ejercicio.':'No se pudo preparar el servidor de apoyo. Comprueba que estás como root y que Linux ha vuelto al prompt.';}
    catch(error){feedback.textContent='No se pudo preparar: '+error.message;}
    finally{checking=false;prepare.textContent='Preparar ejercicio';sync();}
  });
  toggle.addEventListener('click', () => {
    if (checking) return;
    solution.hidden = !solution.hidden;
    toggle.textContent = solution.hidden ? 'Ver solución' : 'Ocultar solución';
    toggle.setAttribute('aria-expanded', String(!solution.hidden));
  });
  check.addEventListener('click', async () => {
    if (!enabled || checking) return;
    checking = true; sync();
    const current = generation, exercise = selected();
    feedback.textContent = 'Comprobando el estado real de Linux…'; feedback.dataset.result = 'pending';
    try {
      const result = await runCheck(exercise);
      if (generation !== current) return;
      feedback.replaceChildren();
      const message = document.createElement('p');
      message.textContent = result.ok ? 'Ejercicio comprobado: todas las condiciones se cumplen.' : 'Todavía falta corregir lo indicado abajo.';
      feedback.append(message);
      const list = document.createElement('ul');
      for (const condition of result.results) {
        const item = document.createElement('li');
        item.textContent = (condition.ok ? 'Correcto: ' : 'Pendiente: ') + condition.label;
        list.append(item);
      }
      feedback.append(list); feedback.dataset.result = result.ok ? 'passed' : 'failed';
    } catch (error) {
      if (generation === current) { feedback.textContent = error.message; feedback.dataset.result = 'error'; }
    } finally { checking = false; sync(); }
  });
  populate(); render();
  const classSelect=mountGroups({select,mode:'linux',tasks:exercises,onChange:render});
  return { setEnabled(value) { enabled = !!value; classSelect.disabled=checking; sync(); } };
}
