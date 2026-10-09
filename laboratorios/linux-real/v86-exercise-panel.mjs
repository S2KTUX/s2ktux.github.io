import { exercises } from './v86-exercises.mjs?v=20261009-exam';

export function mountExercisePanel(root, runCheck) {
  const select = root.querySelector('select');
  const title = root.querySelector('[data-exercise-title]');
  const goal = root.querySelector('[data-exercise-goal]');
  const note = root.querySelector('[data-exercise-note]');
  const check = root.querySelector('[data-exercise-check]');
  const toggle = root.querySelector('[data-exercise-solution]');
  const solution = root.querySelector('[data-exercise-solution-body]');
  const explanation = root.querySelector('[data-exercise-explanation]');
  const code = root.querySelector('pre code');
  const feedback = root.querySelector('[data-exercise-feedback]');
  const modes = [...root.querySelectorAll('[data-lab-mode]')];
  const help = root.querySelector('[data-practice-help]');
  const card = root.querySelector('[data-exercise-card]');
  const aid = root.querySelector('[data-lab-aid]');
  const modeNote = root.querySelector('[data-mode-note]');
  let enabled = false, checking = false, generation = 0;
  let practiceHelp = false;
  const available = () => exercises;
  const populate = () => {
    select.replaceChildren();
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
    toggle.disabled = checking;
    for (const button of modes) {
      button.disabled = checking;
      button.setAttribute('aria-pressed', 'true');
    }
    help.disabled = checking;
    help.textContent = practiceHelp ? 'Ocultar prácticas guiadas' : 'Abrir prácticas guiadas';
    help.setAttribute('aria-expanded', String(practiceHelp));
    card.hidden = !practiceHelp;aid.hidden=false;
    modeNote.textContent='Prueba lo que quieras en la terminal. Las prácticas y las ayudas son opcionales.';
  };
  const render = () => {
    generation++;
    const exercise = selected();
    title.textContent = exercise.title; goal.textContent = exercise.goal;
    note.textContent = exercise.note || ''; note.hidden = !exercise.note;
    explanation.textContent = exercise.explanation;
    code.textContent = exercise.solution;
    solution.hidden = true; toggle.textContent = 'Ver solución'; toggle.setAttribute('aria-expanded', 'false');
    feedback.replaceChildren(); feedback.textContent='Haz la práctica en Linux y comprueba el resultado cuando termines.';
    feedback.dataset.result = 'pending'; sync();
  };
  for (const button of modes) button.addEventListener('click',()=>{practiceHelp=true;sync();});
  help.addEventListener('click', () => { practiceHelp = !practiceHelp; sync(); });
  select.addEventListener('change', render);
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
  return { setEnabled(value) { enabled = !!value; sync(); } };
}
