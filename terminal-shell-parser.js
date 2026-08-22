// Analizador pequeño y determinista para operadores del shell.
// No ejecuta nada: conserva el orden exacto de las redirecciones para que
// `cmd >salida 2>&1` y `cmd 2>&1 >salida` no se comporten igual.

const isSpace = value => /\s/.test(value || '');

// Bash no ejecuta una orden incompleta: cambia de PS1 a PS2 y continúa
// leyendo líneas. Este analizador solo decide si falta entrada; la expansión
// y la ejecución siguen perteneciendo al motor principal.
export function analyzeShellInput(source) {
  source = String(source ?? '');
  let quote = '';
  let escaped = false;
  let commandSubstitution = 0;
  let parameterExpansion = 0;
  let parens = 0;
  let braces = 0;
  let lastOperator = '';

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1] || '';
    if (escaped) { escaped = false; continue; }
    if (char === '\\' && quote !== "'") { escaped = true; continue; }
    if (quote) {
      if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'") { quote = char; continue; }
    if (char === '$' && next === '(') { commandSubstitution += 1; index += 1; continue; }
    if (char === '$' && next === '{') { parameterExpansion += 1; index += 1; continue; }
    if (commandSubstitution && char === '(') { commandSubstitution += 1; continue; }
    if (commandSubstitution && char === ')') { commandSubstitution -= 1; continue; }
    if (parameterExpansion && char === '}') { parameterExpansion -= 1; continue; }
    if (!commandSubstitution && !parameterExpansion) {
      if (char === '(') parens += 1;
      else if (char === ')' && parens) parens -= 1;
      else if (char === '{') braces += 1;
      else if (char === '}' && braces) braces -= 1;
    }
  }

  const tail = source.trimEnd();
  if (escaped && tail.endsWith('\\')) return { complete:false, reason:'backslash' };
  if (quote) return { complete:false, reason:quote === "'" ? 'single-quote' : 'double-quote' };
  if (commandSubstitution) return { complete:false, reason:'command-substitution' };
  if (parameterExpansion) return { complete:false, reason:'parameter-expansion' };
  if (parens) return { complete:false, reason:'parenthesis' };
  if (braces) return { complete:false, reason:'brace' };

  // Un operador de control al final necesita otro pipeline. Un único '&'
  // lanza en segundo plano y sí constituye una orden completa.
  const operatorMatch = tail.match(/(?:\|\||&&|\|)\s*$/);
  const escapedOperator = operatorMatch
    ? ((tail.slice(0, operatorMatch.index).match(/\\+$/)?.[0].length || 0) % 2 === 1)
    : false;
  const operator = operatorMatch && !escapedOperator ? operatorMatch[0].trim() : '';
  lastOperator = operator;
  if (lastOperator) return { complete:false, reason:'operator', operator:lastOperator };
  return { complete:true, reason:'' };
}

export function joinShellLines(lines) {
  return (lines || []).join('\n').replace(/\\\n/g, '');
}

function readShellWord(source, start) {
  let raw = '';
  let cooked = '';
  let quote = '';
  let escaped = false;
  let index = start;

  for (; index < source.length; index += 1) {
    const char = source[index];
    if (escaped) {
      raw += char;
      cooked += char;
      escaped = false;
      continue;
    }
    if (char === '\\' && quote !== "'") {
      raw += char;
      escaped = true;
      continue;
    }
    if (quote) {
      raw += char;
      if (char === quote) quote = '';
      else cooked += char;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      raw += char;
      continue;
    }
    if (isSpace(char) || char === '>' || char === '<') break;
    raw += char;
    cooked += char;
  }

  return { raw, value: cooked, end: index, unclosedQuote: quote || null };
}

function fdPrefixAt(source, operatorIndex) {
  let start = operatorIndex;
  while (start > 0 && /\d/.test(source[start - 1])) start -= 1;
  if (start === operatorIndex) return null;
  if (start > 0 && !isSpace(source[start - 1])) return null;
  return { start, value: Number(source.slice(start, operatorIndex)) };
}

export function parseRedirections(source) {
  const redirections = [];
  const command = [];
  let quote = '';
  let escaped = false;
  let substitutionDepth = 0;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (escaped) {
      command.push(char);
      escaped = false;
      continue;
    }
    if (char === '\\' && quote !== "'") {
      command.push(char);
      escaped = true;
      continue;
    }
    if (quote) {
      command.push(char);
      if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      command.push(char);
      continue;
    }
    if (source.slice(index, index + 2) === '$(') {
      substitutionDepth += 1;
      command.push('$(');
      index += 1;
      continue;
    }
    if (substitutionDepth && char === '(') {
      substitutionDepth += 1;
      command.push(char);
      continue;
    }
    if (substitutionDepth && char === ')') {
      substitutionDepth -= 1;
      command.push(char);
      continue;
    }
    if (substitutionDepth) {
      command.push(char);
      continue;
    }

    const both = char === '&' && source[index + 1] === '>';
    if (char !== '>' && char !== '<' && !both) {
      command.push(char);
      continue;
    }

    let fd = char === '<' ? 0 : 1;
    let operatorStart = index;
    if (both) {
      fd = 'both';
    } else {
      const prefix = fdPrefixAt(source, index);
      if (prefix) {
        fd = prefix.value;
        operatorStart = prefix.start;
        command.splice(Math.max(0, command.length - (index - prefix.start)), index - prefix.start);
      }
    }

    let operator = both ? '&>' : char;
    let cursor = index + (both ? 2 : 1);
    if (source[cursor] === '>') {
      operator += '>';
      cursor += 1;
    }
    while (isSpace(source[cursor])) cursor += 1;

    if (source[cursor] === '&' && /\d/.test(source[cursor + 1] || '')) {
      let end = cursor + 1;
      while (/\d/.test(source[end] || '')) end += 1;
      redirections.push({ fd, operator, kind: 'duplicate', targetFd: Number(source.slice(cursor + 1, end)), position: operatorStart });
      index = end - 1;
      continue;
    }

    const word = readShellWord(source, cursor);
    if (!word.raw) {
      return { command: command.join('').trim(), redirections, error: `falta el destino de ${operator}` };
    }
    redirections.push({ fd, operator, kind: 'file', target: word.value, rawTarget: word.raw, append: operator.endsWith('>>'), position: operatorStart });
    index = word.end - 1;
  }

  return { command: command.join('').replace(/\s+/g, ' ').trim(), redirections, error: quote ? `comilla ${quote} sin cerrar` : null };
}

export function describeDescriptorFlow(redirections) {
  const descriptors = { 0: 'terminal:stdin', 1: 'terminal:stdout', 2: 'terminal:stderr' };
  for (const item of redirections) {
    if (item.kind === 'duplicate') {
      const target = descriptors[item.targetFd] || `fd:${item.targetFd}`;
      if (item.fd === 'both') {
        descriptors[1] = target;
        descriptors[2] = target;
      } else descriptors[item.fd] = target;
      continue;
    }
    const destination = `file:${item.target}${item.append ? ':append' : ':truncate'}`;
    if (item.fd === 'both') {
      descriptors[1] = destination;
      descriptors[2] = destination;
    } else descriptors[item.fd] = destination;
  }
  return descriptors;
}

