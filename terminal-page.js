function activateCheatTab(tab, moveFocus = false) {
  if (!tab) return;
  const root = tab.closest('.cs');
  const key = tab.dataset.csTab;
  const tabs = [...root.querySelectorAll('.cs-tab:not([hidden])')];
  tabs.forEach((item) => {
    const active = item === tab;
    item.dataset.active = active ? '1' : '0';
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
  });
  root.querySelectorAll('.cs-panel').forEach((panel) => {
    const active = panel.dataset.csPanel === key;
    panel.dataset.active = active ? '1' : '0';
    panel.hidden = !active;
  });
  if (moveFocus) tab.focus();
}

function initCheatTabs() {
  document.querySelectorAll('.cs-tabs').forEach((list, groupIndex) => {
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', 'Secciones del cheatsheet');
    const tabs = [...list.querySelectorAll('.cs-tab')];
    tabs.forEach((tab, tabIndex) => {
      const panel = tab.closest('.cs').querySelector(`[data-cs-panel="${tab.dataset.csTab}"]`);
      tab.setAttribute('role', 'tab');
      tab.id = `cs-tab-${groupIndex}-${tabIndex}`;
      tab.tabIndex = tab.dataset.active === '1' ? 0 : -1;
      tab.setAttribute('aria-selected', String(tab.dataset.active === '1'));
      if (panel) {
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', tab.id);
        panel.hidden = panel.dataset.active !== '1';
      }
    });
    if (list.dataset.keyboardWired) return;
    list.dataset.keyboardWired = 'true';
    list.addEventListener('keydown', (event) => {
      const visible = tabs.filter((tab) => !tab.hidden && getComputedStyle(tab).display !== 'none');
      const index = visible.indexOf(document.activeElement);
      if (index < 0) return;
      let next = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % visible.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + visible.length) % visible.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = visible.length - 1;
      else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activateCheatTab(visible[index]);
        return;
      } else return;
      event.preventDefault();
      activateCheatTab(visible[next], true);
    });
  });
}

document.addEventListener('click', (event) => {
  const tab = event.target.closest?.('.cs-tab');
  if (tab) activateCheatTab(tab);
});

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'm') {
    const leave = document.querySelector('[data-change-mode]');
    if (leave) {
      event.preventDefault();
      leave.focus();
    }
  }
});

window.__syncCheatTabs = initCheatTabs;
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initCheatTabs, { once: true });
else initCheatTabs();
