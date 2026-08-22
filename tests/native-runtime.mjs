import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testsDir, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const runtime = read("support.js");

// El fichero debe poder compilarse por sí solo y no contener el cargador antiguo.
new vm.Script(runtime, { filename: "support.js" });
assert.doesNotMatch(runtime, /\bunpkg\b/i, "support.js no debe apuntar a unpkg");
assert.doesNotMatch(runtime, /\bReact(?:DOM)?\b/i, "support.js no debe depender de bibliotecas de UI externas");
assert.doesNotMatch(runtime, /\bfetch\s*\(/, "support.js no debe volver a solicitar documentos o módulos");
assert.doesNotMatch(
  runtime,
  /location(?:\.href)?\s*\)/,
  "support.js no debe reconstruir la página solicitando location"
);

// Arranque mínimo: incluso sin x-dc el runtime expone su API y retira el estado
// de espera sin intentar acceder a la red.
const documentListeners = new Map();
const rootClasses = new Set();
const fakeDocument = {
  readyState: "loading",
  head: { appendChild() {} },
  documentElement: {
    classList: {
      add(name) { rootClasses.add(name); },
      remove(name) { rootClasses.delete(name); }
    }
  },
  createElement() {
    return {
      textContent: "",
      setAttribute() {},
      appendChild() {},
      replaceChildren() {}
    };
  },
  addEventListener(name, listener) { documentListeners.set(name, listener); },
  querySelector() { return null; }
};
let timeoutId = 0;
const fakeWindow = {
  setTimeout() { timeoutId += 1; return timeoutId; },
  clearTimeout() {},
  queueMicrotask(callback) { callback(); },
  addEventListener() {},
  dispatchEvent() {}
};
fakeWindow.window = fakeWindow;
const context = vm.createContext({
  document: fakeDocument,
  window: fakeWindow,
  location: { pathname: "/index.html" },
  Node: { TEXT_NODE: 3, ELEMENT_NODE: 1 },
  CustomEvent: class CustomEvent {},
  console
});
new vm.Script(runtime, { filename: "support.js" }).runInContext(context);
assert.equal(typeof fakeWindow.DCLogic, "function");
assert.equal(fakeWindow.StreamableLogic, fakeWindow.DCLogic);
assert.equal(fakeWindow.__dcNative, true);
assert.ok(rootClasses.has("dc-native-pending"));
documentListeners.get("DOMContentLoaded")();
assert.ok(!rootClasses.has("dc-native-pending"), "El arranque sin plantilla no deja la página oculta");

const logic = new fakeWindow.DCLogic({ page: "test" });
let requested = 0;
logic.__host = { requestRender() { requested += 1; } };
logic.setState({ ready: true });
logic.setState((state) => ({ passes: state.ready ? 1 : 0 }));
assert.deepEqual({ ...logic.state }, { ready: true, passes: 1 });
assert.equal(requested, 2);

// Contrato público que usan curso.html y leccion.html.
for (const token of [
  "window.DCLogic",
  "window.StreamableLogic",
  "window.__dcBoot",
  "window.__dcSetProps",
  'tag === "sc-if"',
  'tag === "sc-for"',
  'name === "ref"',
  "componentDidMount",
  "componentDidUpdate",
  "componentWillUnmount",
  "setState",
  "renderVals"
]) {
  assert.ok(runtime.includes(token), "Falta el contrato nativo: " + token);
}

const pageNames = [
  "index.html",
  "cursos.html",
  "curso.html",
  "leccion.html",
  "proyectos.html",
  "proyecto-proxmox.html",
  "proyecto-kubernetes.html",
  "sobre.html"
];

const expressionGrammar =
  /^(?:true|false|null|undefined|-?(?:\d+|\d*\.\d+)|[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)$/;
const customControls = new Set();

for (const pageName of pageNames) {
  const html = read(pageName);
  const supportPosition = html.indexOf('src="./support.js"');
  const componentPosition = html.indexOf("<x-dc");
  assert.ok(supportPosition >= 0, pageName + " debe cargar support.js");
  assert.ok(componentPosition > supportPosition, pageName + " debe cargar el runtime antes de x-dc");
  assert.match(html, /<x-dc(?:\s[^>]*)?>[\s\S]*<\/x-dc>/i, pageName + " conserva x-dc");
  if (/<helmet\b/i.test(html)) {
    assert.match(html, /<helmet(?:\s[^>]*)?>[\s\S]*<\/helmet>/i, pageName + " cierra helmet");
  }

  for (const match of html.matchAll(/<(sc-[a-z0-9-]+)\b/gi)) {
    customControls.add(match[1].toLowerCase());
  }
  for (const match of html.matchAll(/\{\{\s*([^{}]+?)\s*\}\}/g)) {
    const expression = match[1].trim();
    assert.match(
      expression,
      expressionGrammar,
      pageName + " usa una expresión fuera del contrato nativo: " + expression
    );
  }
}

assert.deepEqual(
  [...customControls].sort(),
  ["sc-for", "sc-if"],
  "Apareció un control de plantilla que el runtime nativo todavía no implementa"
);

const course = read("curso.html");
const lesson = read("leccion.html");
assert.ok(runtime.includes('querySelectorAll("helmet")'), "El runtime conserva el contrato de helmet");
for (const [name, html] of [["curso.html", course], ["leccion.html", lesson]]) {
  assert.match(html, /<script[^>]+data-dc-script[^>]*>[\s\S]*class Component extends DCLogic/);
  assert.equal(
    (html.match(/<script[^>]+data-dc-script/gi) || []).length,
    1,
    name + " debe tener una única clase de lógica"
  );
  const source = html.match(/<script[^>]+data-dc-script[^>]*>([\s\S]*?)<\/script>/i)[1];
  class TestLogic {
    constructor(props) { this.props = props || {}; this.state = {}; }
    setState() {}
  }
  const Logic = new Function(
    "DCLogic",
    "StreamableLogic",
    '"use strict";\n' + source + "\nreturn Component;"
  )(TestLogic, TestLogic);
  assert.equal(typeof Logic, "function", name + " compila su clase de lógica");
}

assert.match(course, /<sc-for\s+list="\{\{\s*modules\s*\}\}"\s+as="mod"/);
assert.match(course, /localStorage\.getItem\('s2ktux-read'\)/, "Se conserva el progreso del curso");
assert.match(lesson, /ref="\{\{\s*lessonRef\s*\}\}"/, "Se conserva la referencia del lector");
assert.match(lesson, /localStorage\.setItem\(KEY,\s*JSON\.stringify\(map\)\)/, "Se conserva el progreso de la lección");
assert.match(course, /s2ktux-theme/, "Se conserva el tema en el curso");
assert.match(lesson, /s2ktux-theme/, "Se conserva el tema en la lección");

console.log(
  "OK native-runtime: " + pageNames.length + " páginas, " +
  customControls.size + " controles y cero cargas duplicadas del runtime"
);
