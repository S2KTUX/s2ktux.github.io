import { exercises } from './v86-exercises.mjs';

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
  const finish = root.querySelector('[data-exam-finish]');
  const restart = root.querySelector('[data-exam-restart]');
  const modeNote = root.querySelector('[data-mode-note]');
  let enabled = false, checking = false, generation = 0;
  let mode = 'practice', practiceHelp = false, finished = false;
  const available = () => exercises.filter(e => (e.group === 'Simulacro adaptado') === (mode === 'exam'));
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
  const reviewAllowed = () => mode === 'practice' || finished;
  const sync = () => {
    check.disabled = !enabled || checking || !reviewAllowed();
    select.disabled = checking; toggle.hidden = !reviewAllowed();
    toggle.disabled = checking;
    for (const button of modes) {
      button.disabled = checking;
      button.setAttribute('aria-pressed', String(button.dataset.labMode === mode));
    }
    help.hidden = mode !== 'practice'; help.disabled = checking;
    help.textContent = practiceHelp ? 'Ocultar prácticas guiadas' : 'Abrir prácticas guiadas';
    help.setAttribute('aria-expanded', String(practiceHelp));
    card.hidden = mode === 'practice' && !practiceHelp;
    aid.hidden = mode === 'exam' && !finished;
    finish.hidden = mode !== 'exam' || finished; finish.disabled = checking;
    restart.hidden = mode !== 'exam' || !finished; restart.disabled = checking;
    modeNote.textContent = mode === 'practice'
      ? 'Prueba lo que quieras en la terminal. Las prácticas y las ayudas son opcionales.'
      : finished ? 'Intento terminado. Ahora puedes comprobar cada ejercicio y consultar su solución.'
      : 'Resuelve las 21 preguntas sin ayudas. Al terminar podrás comprobarlas y ver las soluciones. Es un simulacro de práctica, no un examen oficial.';
  };
  const render = () => {
    generation++;
    const exercise = selected();
    title.textContent = exercise.title; goal.textContent = exercise.goal;
    note.textContent = exercise.note || ''; note.hidden = !exercise.note;
    explanation.textContent = reviewAllowed() ? exercise.explanation : '';
    code.textContent = reviewAllowed() ? exercise.solution : '';
    solution.hidden = true; toggle.textContent = 'Ver solución'; toggle.setAttribute('aria-expanded', 'false');
    feedback.replaceChildren(); feedback.textContent = reviewAllowed()
      ? 'Haz la práctica en Linux y comprueba el resultado cuando termines.'
      : 'Las comprobaciones estarán disponibles al terminar el intento.';
    feedback.dataset.result = 'pending'; sync();
  };
  for (const button of modes) button.addEventListener('click', () => {
    if (checking || mode === button.dataset.labMode) return;
    mode = button.dataset.labMode; finished = false;
    populate(); render();
  });
  help.addEventListener('click', () => { practiceHelp = !practiceHelp; sync(); });
  finish.addEventListener('click', () => {
    if (checking || mode !== 'exam') return;
    finished = true; render();
  });
  restart.addEventListener('click', () => {
    if (checking || mode !== 'exam') return;
    finished = false; render();
  });
  select.addEventListener('change', render);
  toggle.addEventListener('click', () => {
    if (!reviewAllowed() || checking) return;
    solution.hidden = !solution.hidden;
    toggle.textContent = solution.hidden ? 'Ver solución' : 'Ocultar solución';
    toggle.setAttribute('aria-expanded', String(!solution.hidden));
  });
  check.addEventListener('click', async () => {
    if (!enabled || checking || !reviewAllowed()) return;
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
