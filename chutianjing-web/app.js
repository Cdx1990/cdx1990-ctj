'use strict';

(function () {
  const ALLOWED_USERNAME = 'qazwsx1995';
  const STORAGE_NAMESPACE = 'chutianjing-editable-v1';

  const loginView = document.getElementById('loginView');
  const appView = document.getElementById('appView');
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  const editToggle = document.getElementById('editToggle');
  const saveBtn = document.getElementById('saveBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');
  const resetBtn = document.getElementById('resetBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  const richToolbar = document.getElementById('richToolbar');
  const richEditor = document.getElementById('richEditor');

  const editableSelector = '[data-editable]';

  const defaultContentById = {
    heroTitle: '楚天镜智能风控系统',
    heroSubtitle: '一个可部署、可在线编辑预览的单页示例。登录后可在页面中直接修改内容并本地保存。',
    section1Title: '全行资产质量信用风险预警',
    section1Body: '<ul>\n  <li>机构风险预警</li>\n  <li>产品风险预警</li>\n  <li>行业风险预警</li>\n  <li>人员资产质量预警</li>\n</ul>',
    section2Title: '零售信用风险预警',
    section2Body: '<ul>\n  <li>消费金融预警</li>\n  <li>对私普惠预警</li>\n  <li>银行卡预警（卡片状态与交易风险）</li>\n</ul>',
    section3Title: 'AI 生成式风险报告',
    section3Body: '<p>整合指标与预警，生成重点领域、趋势与传导分析报告；支持PDF/Excel导出与电子签章（示例未接入）。</p>',
    richEditor: '在此区域可进行富文本编辑，支持粗体、斜体、下划线与列表。选中内容后点击上方按钮。'
  };

  function getStorageKey(id) {
    return `${STORAGE_NAMESPACE}:${id}`;
  }

  function readSavedContent(id) {
    return localStorage.getItem(getStorageKey(id));
  }

  function writeSavedContent(id, html) {
    localStorage.setItem(getStorageKey(id), html);
  }

  function clearAllSavedContent() {
    Object.keys(defaultContentById).forEach((id) => localStorage.removeItem(getStorageKey(id)));
  }

  function setLoggedIn(username) {
    sessionStorage.setItem('ctj-logged-in', username);
  }

  function getLoggedInUser() {
    return sessionStorage.getItem('ctj-logged-in');
  }

  function logout() {
    sessionStorage.removeItem('ctj-logged-in');
    window.location.reload();
  }

  function applyEditingState(enabled) {
    const nodes = document.querySelectorAll(editableSelector);
    nodes.forEach((node) => {
      node.contentEditable = String(enabled);
      node.classList.toggle('editing', enabled);
    });
  }

  function loadAllContent() {
    const nodes = document.querySelectorAll(editableSelector);
    nodes.forEach((node) => {
      const id = node.id;
      if (!id) return;
      const saved = readSavedContent(id);
      if (saved !== null) {
        node.innerHTML = saved;
      } else if (defaultContentById[id]) {
        node.innerHTML = defaultContentById[id];
      }
    });
  }

  function saveAllContent() {
    const nodes = document.querySelectorAll(editableSelector);
    nodes.forEach((node) => {
      const id = node.id;
      if (!id) return;
      writeSavedContent(id, node.innerHTML);
    });
  }

  function exportContent() {
    const data = {};
    Object.keys(defaultContentById).forEach((id) => {
      const node = document.getElementById(id);
      if (node) data[id] = node.innerHTML;
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chutianjing-content.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importContent(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        Object.keys(data).forEach((id) => {
          const node = document.getElementById(id);
          if (node) {
            node.innerHTML = data[id];
            writeSavedContent(id, data[id]);
          }
        });
      } catch (e) {
        alert('导入失败：文件格式不正确');
      }
    };
    reader.readAsText(file);
  }

  function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function initLogin() {
    const user = getLoggedInUser();
    if (user === ALLOWED_USERNAME) {
      loginView.classList.add('hidden');
      appView.classList.remove('hidden');
      initApp();
      return;
    }

    loginView.classList.remove('hidden');
    appView.classList.add('hidden');

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = (usernameInput.value || '').trim();
      if (username !== ALLOWED_USERNAME) {
        alert('仅允许账户 qazwsx1995 登录');
        return;
      }
      setLoggedIn(username);
      loginView.classList.add('hidden');
      appView.classList.remove('hidden');
      initApp();
    });
  }

  function initApp() {
    loadAllContent();
    applyEditingState(Boolean(editToggle.checked));

    const debouncedSave = debounce(() => saveAllContent(), 600);
    document.querySelectorAll(editableSelector).forEach((node) => {
      node.addEventListener('input', debouncedSave);
    });

    editToggle.addEventListener('change', () => {
      applyEditingState(Boolean(editToggle.checked));
    });

    saveBtn.addEventListener('click', () => {
      saveAllContent();
    });

    exportBtn.addEventListener('click', () => exportContent());

    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', () => {
      if (importFile.files && importFile.files[0]) {
        importContent(importFile.files[0]);
        importFile.value = '';
      }
    });

    resetBtn.addEventListener('click', () => {
      if (!confirm('确认将页面内容重置为默认？此操作会清除本地保存的修改。')) return;
      clearAllSavedContent();
      loadAllContent();
    });

    logoutBtn.addEventListener('click', logout);

    if (richToolbar && richEditor) {
      richToolbar.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        const cmd = target.getAttribute('data-cmd');
        const value = target.getAttribute('data-value') || undefined;
        if (!cmd) return;
        document.execCommand(cmd, false, value);
      });
    }
  }

  window.addEventListener('DOMContentLoaded', initLogin);
})();