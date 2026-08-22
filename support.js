"use strict";

/*
 * Runtime nativo y deliberadamente pequeño para las plantillas de S2KTUX.
 * Mantiene el contrato público de las páginas: x-dc, helmet, sc-if, sc-for,
 * interpolaciones, DCLogic y los ciclos de vida usados por curso y lección.
 */
(function () {
  const doc = document;
  const rootClass = "dc-native-pending";
  const expressionPattern = /\{\{\s*([^{}]+?)\s*\}\}/g;
  const wholeExpressionPattern = /^\s*\{\{\s*([^{}]+?)\s*\}\}\s*$/;
  let currentController = null;
  let booted = false;

  const baseStyle = doc.createElement("style");
  baseStyle.setAttribute("data-dc-native", "");
  baseStyle.textContent =
    "html,body{height:100%;margin:0}" +
    "#dc-root,#dc-root>.sc-host{height:100%}" +
    "." + rootClass + " x-dc{display:none!important}" +
    ".dc-native-error{max-width:760px;margin:48px auto;padding:24px;" +
    "border:3px solid #4a3627;background:#fbf3e2;color:#6b543f;" +
    "font:18px/1.5 monospace;box-shadow:5px 5px 0 #e7d3ae}" +
    ".dc-native-error strong{display:block;margin-bottom:8px;color:#7a4a2b}";
  doc.head.appendChild(baseStyle);
  doc.documentElement.classList.add(rootClass);

  /*
   * Si el documento queda esperando por otro recurso, nunca se deja una
   * pantalla vacía indefinidamente. El contenido fuente vuelve a ser visible.
   */
  const visibilityFallback = window.setTimeout(function () {
    doc.documentElement.classList.remove(rootClass);
  }, 4000);

  class NativeLogic {
    constructor(props) {
      this.props = props || {};
      this.state = {};
      this.__host = null;
    }

    setState(update, callback) {
      const previous = this.state && typeof this.state === "object" ? this.state : {};
      let patch = typeof update === "function" ? update(previous) : update;
      if (!patch || typeof patch !== "object") patch = {};
      this.state = Object.assign({}, previous, patch);
      if (this.__host) {
        this.__host.requestRender(callback);
      } else if (typeof callback === "function") {
        window.queueMicrotask(callback);
      }
    }

    forceUpdate(callback) {
      if (this.__host) this.__host.requestRender(callback);
      else if (typeof callback === "function") window.queueMicrotask(callback);
    }

    componentDidMount() {}
    componentDidUpdate() {}
    componentWillUnmount() {}
    renderVals() { return {}; }
  }

  window.DCLogic = NativeLogic;
  window.StreamableLogic = NativeLogic;

  function pageName() {
    let path = "";
    try {
      path = decodeURIComponent(location.pathname || "");
    } catch (_error) {
      path = location.pathname || "";
    }
    const file = path.split("/").pop() || "Root";
    return file.replace(/\.html?$/i, "") || "Root";
  }

  function parseProps(scriptElement) {
    if (!scriptElement) return {};
    const raw = scriptElement.getAttribute("data-props");
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
      const props = {};
      Object.keys(parsed).forEach(function (key) {
        if (key.charAt(0) !== "$") props[key] = parsed[key];
      });
      return props;
    } catch (_error) {
      return {};
    }
  }

  function adoptHelmet(container) {
    const helmets = Array.from(container.querySelectorAll("helmet"));
    helmets.forEach(function (helmet) {
      Array.from(helmet.childNodes).forEach(function (node) {
        if (node.nodeType === Node.TEXT_NODE && !node.nodeValue.trim()) {
          node.remove();
          return;
        }
        doc.head.appendChild(node);
      });
      helmet.remove();
    });
  }

  function compileLogic(scriptElement) {
    if (!scriptElement || !scriptElement.textContent.trim()) return NativeLogic;
    const source = scriptElement.textContent;
    const create = new Function(
      "DCLogic",
      "StreamableLogic",
      '"use strict";\n' + source +
        '\n;return typeof Component === "function" ? Component : undefined;'
    );
    const Logic = create(NativeLogic, NativeLogic);
    if (typeof Logic !== "function") {
      throw new Error("La lógica de la página no define Component.");
    }
    return Logic;
  }

  function valueAt(scope, expression) {
    const key = String(expression || "").trim();
    if (key === "true") return true;
    if (key === "false") return false;
    if (key === "null") return null;
    if (key === "undefined" || !key) return undefined;
    if (/^-?(?:\d+|\d*\.\d+)$/.test(key)) return Number(key);
    if (!/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/.test(key)) {
      return undefined;
    }
    const parts = key.split(".");
    let value = scope;
    for (let index = 0; index < parts.length; index += 1) {
      if (value == null) return undefined;
      value = value[parts[index]];
    }
    return value;
  }

  function interpolate(raw, scope) {
    const source = String(raw);
    const whole = source.match(wholeExpressionPattern);
    if (whole) return valueAt(scope, whole[1]);
    expressionPattern.lastIndex = 0;
    return source.replace(expressionPattern, function (_token, expression) {
      const value = valueAt(scope, expression);
      return value == null ? "" : String(value);
    });
  }

  function processChildren(parent, scope, refs) {
    Array.from(parent.childNodes).forEach(function (child) {
      processNode(child, scope, refs);
    });
  }

  function renderCondition(element, scope, refs) {
    const visible = Boolean(interpolate(element.getAttribute("value") || "", scope));
    if (!visible) {
      element.remove();
      return;
    }
    const fragment = doc.createDocumentFragment();
    while (element.firstChild) fragment.appendChild(element.firstChild);
    processChildren(fragment, scope, refs);
    element.replaceWith(fragment);
  }

  function renderLoop(element, scope, refs) {
    const rawList = interpolate(element.getAttribute("list") || "", scope);
    const list = Array.isArray(rawList) ? rawList : [];
    const alias = element.getAttribute("as") || "item";
    const templates = Array.from(element.childNodes);
    const output = doc.createDocumentFragment();

    list.forEach(function (item, index) {
      const itemScope = Object.create(scope || null);
      itemScope[alias] = item;
      itemScope.$index = index;
      const group = doc.createDocumentFragment();
      templates.forEach(function (templateNode) {
        group.appendChild(templateNode.cloneNode(true));
      });
      processChildren(group, itemScope, refs);
      output.appendChild(group);
    });
    element.replaceWith(output);
  }

  function processAttributes(element, scope, refs) {
    Array.from(element.attributes).forEach(function (attribute) {
      const name = attribute.name;
      if (name.indexOf("hint-") === 0) {
        element.removeAttribute(name);
        return;
      }
      if (name === "ref") {
        const callback = interpolate(attribute.value, scope);
        element.removeAttribute(name);
        if (typeof callback === "function") {
          refs.push(function () { callback(element); });
        }
        return;
      }
      if (attribute.value.indexOf("{{") === -1) return;
      const value = interpolate(attribute.value, scope);
      if (value == null || value === false) {
        element.removeAttribute(name);
      } else if (value === true) {
        element.setAttribute(name, "");
      } else {
        element.setAttribute(name, String(value));
      }
    });
  }

  function processNode(node, scope, refs) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.nodeValue.indexOf("{{") !== -1) {
        const value = interpolate(node.nodeValue, scope);
        node.nodeValue = value == null ? "" : String(value);
      }
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const element = node;
    const tag = element.localName;
    if (tag === "sc-if") {
      renderCondition(element, scope, refs);
      return;
    }
    if (tag === "sc-for") {
      renderLoop(element, scope, refs);
      return;
    }

    processAttributes(element, scope, refs);
    if (tag !== "script" && tag !== "style" && tag !== "textarea") {
      processChildren(element, scope, refs);
    }
  }

  function showRenderFailure(host, error) {
    console.error("[dc-native] No se pudo renderizar la página:", error);
    const panel = doc.createElement("div");
    panel.className = "dc-native-error";
    panel.setAttribute("role", "alert");
    const title = doc.createElement("strong");
    title.textContent = "No se pudo abrir esta página.";
    const detail = doc.createElement("span");
    detail.textContent = "Recarga la página. Si el problema continúa, vuelve al inicio.";
    panel.append(title, detail);
    host.replaceChildren(panel);
  }

  function createController(root, host, source, Logic, initialProps) {
    const controller = {
      root: root,
      host: host,
      source: source,
      Logic: Logic,
      props: initialProps,
      logic: null,
      mounted: false,
      scheduled: false,
      callbacks: [],
      destroyed: false,

      render: function () {
        const refs = [];
        const fragment = this.source.cloneNode(true);
        const values = Object.assign(
          {},
          this.props,
          (this.logic && this.logic.renderVals ? this.logic.renderVals() : {}) || {}
        );
        processChildren(fragment, values, refs);
        this.host.replaceChildren(fragment);
        refs.forEach(function (applyRef) {
          try { applyRef(); } catch (error) { console.error("[dc-native] ref:", error); }
        });
      },

      requestRender: function (callback) {
        if (typeof callback === "function") this.callbacks.push(callback);
        if (this.scheduled || this.destroyed) return;
        this.scheduled = true;
        window.queueMicrotask(function () {
          controller.scheduled = false;
          if (controller.destroyed) return;
          try {
            controller.render();
            if (controller.mounted && controller.logic.componentDidUpdate) {
              controller.logic.componentDidUpdate(controller.props);
            }
          } catch (error) {
            showRenderFailure(controller.host, error);
          }
          const callbacks = controller.callbacks.splice(0);
          callbacks.forEach(function (done) {
            try { done.call(controller.logic); } catch (error) { console.error(error); }
          });
        });
      },

      mount: function () {
        this.logic = new this.Logic(this.props);
        this.logic.props = this.props;
        this.logic.__host = this;
        this.render();
        this.mounted = true;
        if (this.logic.componentDidMount) this.logic.componentDidMount();
      },

      setProps: function (overrides) {
        this.props = Object.assign({}, this.props, overrides || {});
        if (this.logic) this.logic.props = this.props;
        this.requestRender();
      },

      destroy: function () {
        if (this.destroyed) return;
        this.destroyed = true;
        if (this.logic && this.logic.componentWillUnmount) {
          try { this.logic.componentWillUnmount(); } catch (error) { console.error(error); }
        }
      }
    };
    return controller;
  }

  function failBoot(container, error) {
    console.error("[dc-native] No se pudo iniciar la página:", error);
    let root = doc.getElementById("dc-root");
    let host;
    if (root) {
      host = doc.createElement("div");
      host.className = "sc-host";
      root.replaceChildren(host);
    } else {
      root = doc.createElement("div");
      root.id = "dc-root";
      host = doc.createElement("div");
      host.className = "sc-host";
      root.appendChild(host);
      if (container && container.isConnected) container.replaceWith(root);
      else doc.body.appendChild(root);
    }
    showRenderFailure(host, error);
    doc.documentElement.classList.remove(rootClass);
    window.clearTimeout(visibilityFallback);
  }

  function boot() {
    if (booted) return;
    booted = true;
    const container = doc.querySelector("x-dc");
    if (!container) {
      doc.documentElement.classList.remove(rootClass);
      window.clearTimeout(visibilityFallback);
      return;
    }

    try {
      adoptHelmet(container);
      const scriptElement = doc.querySelector("script[data-dc-script]");
      const Logic = compileLogic(scriptElement);
      const props = parseProps(scriptElement);
      const source = doc.createDocumentFragment();
      while (container.firstChild) source.appendChild(container.firstChild);

      const root = doc.createElement("div");
      root.id = "dc-root";
      const host = doc.createElement("div");
      host.className = "sc-host";
      host.setAttribute("data-sc-name", pageName());
      root.appendChild(host);
      container.replaceWith(root);

      currentController = createController(root, host, source, Logic, props);
      currentController.mount();

      doc.documentElement.classList.remove(rootClass);
      window.clearTimeout(visibilityFallback);
      window.dispatchEvent(new CustomEvent("dc-native-ready", {
        detail: { name: pageName() }
      }));
    } catch (error) {
      failBoot(container, error);
    }
  }

  window.__dcBoot = boot;
  window.__dcRootName = pageName;
  window.__dcSetProps = function (name, overrides) {
    if (currentController && name === pageName()) currentController.setProps(overrides);
  };
  window.__dcNative = true;

  window.addEventListener("pagehide", function () {
    if (currentController) currentController.destroy();
  }, { once: true });

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
