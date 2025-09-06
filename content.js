(function () {
  if (window.__CPRM_CONTENT_LOADED__) return;
  window.__CPRM_CONTENT_LOADED__ = true;

  const ID_PANEL = 'cprm-side-panel';
  const ID_STYLE = 'cprm-side-style';
  const STORAGE = chrome.storage?.local;
  let currentLocale = 'zh';

  const STRINGS = {
    en: {
      title: 'Cue',
      copy: 'Copy',
      apply: 'Apply',
      save: 'Save',
      close: 'Close',
      placeholder: 'Type or paste your prompt...',
      titlePlaceholder: 'Title (optional)',
      history: 'History',
      histLoad: 'Load to Panel',
      histCopy: 'Copy',
      histEdit: 'Edit',
      histDelete: 'Delete',
      histApply: 'Apply',
      toastCopied: 'Copied to clipboard',
      toastSaved: 'Saved',
      toastEmpty: 'Empty content',
      toastNoInput: 'No input field found',
      toastApplied: 'Filled into the page',
      editTitle: 'Edit title',
      editContent: 'Edit content',
      untitled: 'Untitled',
      slogan: 'Your Magic Wand for AI'
    },
    zh: {
      title: 'Cue',
      copy: '复制',
      apply: '应用',
      save: '保存',
      close: '关闭',
      placeholder: '输入或粘贴提示词...',
      titlePlaceholder: '标题（可选）',
      history: '历史提示词',
      histLoad: '载入到面板',
      histCopy: '复制',
      histEdit: '编辑',
      histDelete: '删除',
      histApply: '应用',
      toastCopied: '已复制到剪贴板',
      toastSaved: '已保存',
      toastEmpty: '内容为空',
      toastNoInput: '未找到可输入的框',
      toastApplied: '已填充到页面',
      editTitle: '编辑标题',
      editContent: '编辑内容',
      untitled: '未命名',
      slogan: '你的AI魔法棒'
    }
  };

  function msg(key) {
    const dict = STRINGS[currentLocale] || STRINGS.zh;
    return dict[key] || '';
  }

  function injectStyle() {
    if (document.getElementById(ID_STYLE)) return;
    const style = document.createElement('style');
    style.id = ID_STYLE;
    style.textContent = `
      #${ID_PANEL} { position: fixed; top: 0; right: 0; height: 100vh; width: 380px; max-width: 100vw; z-index: 2147483647; box-shadow: -2px 0 10px rgba(0,0,0,.1); background: #fff; color: #333; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; display: none; }
      #${ID_PANEL}.open { display: flex; }
      #${ID_PANEL} .cprm-wrap { display: flex; flex-direction: column; width: 100%; height: 100%; }
      #${ID_PANEL} header { display:flex; align-items:center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #eee; background: #fafafa; }
      #${ID_PANEL} header .title-section { display: flex; flex-direction: column; }
      #${ID_PANEL} header .title { font-weight: 600; font-size: 18px; }
      #${ID_PANEL} header .slogan { font-size: 12px; color: #666; font-style: italic; margin-top: 2px; }
      #${ID_PANEL} header .actions { display:flex; gap:8px; }
      #${ID_PANEL} main { padding: 12px; display: flex; flex-direction: column; gap: 8px; overflow: auto; }
      #${ID_PANEL} textarea { width: 100%; min-height: 120px; resize: vertical; padding:8px; border:1px solid #ddd; border-radius: 6px; font-size: 14px; }
      #${ID_PANEL} input[type="text"] { width: 100%; padding:8px; border:1px solid #ddd; border-radius:6px; }
      #${ID_PANEL} .btn { padding: 6px 10px; border: 1px solid #ddd; background: #fff; border-radius: 6px; cursor: pointer; }
      #${ID_PANEL} .btn.primary { background: #1677ff; color: #fff; border-color: #1677ff; }
      #${ID_PANEL} .row { display:flex; gap:8px; flex-wrap: wrap; }
      #${ID_PANEL} .history { border-top:1px dashed #eee; padding-top: 8px; margin-top: 8px; }
      #${ID_PANEL} .item { padding:8px; border:1px solid #eee; border-radius:6px; margin:6px 0; }
      #${ID_PANEL} .item .meta { display:flex; justify-content: space-between; align-items:center; margin-bottom:6px; }
      #${ID_PANEL} .muted { color:#888; font-size: 12px; }
      /* theme: dark */
      #${ID_PANEL}[data-theme="dark"] { background: #111; color: #eee; }
      #${ID_PANEL}[data-theme="dark"] header { background: #181818; border-bottom-color: #222; }
      #${ID_PANEL}[data-theme="dark"] header .slogan { color: #aaa; }
      #${ID_PANEL}[data-theme="dark"] textarea, #${ID_PANEL}[data-theme="dark"] input[type="text"] { background:#1b1b1b; color:#eee; border-color:#333; }
      #${ID_PANEL}[data-theme="dark"] .btn { background:#222; color:#eee; border-color:#333; }
      #${ID_PANEL}[data-theme="dark"] .btn.primary { background:#1677ff; color:#fff; border-color:#1677ff; }
      #${ID_PANEL}[data-theme="dark"] .item { border-color:#222; }
      #${ID_PANEL}[data-theme="dark"] .muted { color:#aaa; }
      /* theme: chinese */
      #${ID_PANEL}[data-theme="chinese"] { 
        background: #f7f4e9; 
        color: #1a1a1a; 
        font-family: "Noto Serif SC", "Songti SC", "SimSun", "STSong", serif;
        background-image: radial-gradient(rgba(0,0,0,0.02) 1px, transparent 1px);
        background-size: 6px 6px;
      }
      #${ID_PANEL}[data-theme="chinese"] header { 
        background: #fffaf0; 
        border-bottom: 2px solid #a61b29; 
      }
      #${ID_PANEL}[data-theme="chinese"] header .title { letter-spacing: 1px; color: #a61b29; }
      #${ID_PANEL}[data-theme="chinese"] header .slogan { color: #8b4513; font-family: "KaiTi", "楷体", serif; }
      #${ID_PANEL}[data-theme="chinese"] .btn { 
        background: #fff;
        border: 1px solid #d8c3a5;
        color: #1a1a1a;
        border-radius: 8px;
      }
      #${ID_PANEL}[data-theme="chinese"] .btn.primary { 
        background: #a61b29; 
        color: #fff; 
        border-color: #a61b29;
      }
      #${ID_PANEL}[data-theme="chinese"] textarea, 
      #${ID_PANEL}[data-theme="chinese"] input[type="text"] {
        background: #fffdf6; 
        border-color: #e8d9c3; 
      }
      #${ID_PANEL}[data-theme="chinese"] .item { 
        border-color: #e8d9c3; 
        background: #fffef9;
      }
      #${ID_PANEL}[data-theme="chinese"] .muted { color: #6f6a60; }
      
      /* Edit Modal Styles */
      .cprm-edit-modal { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 2147483648; display: none; }
      .cprm-edit-modal.open { display: flex; align-items: center; justify-content: center; }
      .cprm-edit-content { background: #fff; border-radius: 12px; padding: 24px; width: 90%; max-width: 500px; max-height: 80vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
      .cprm-edit-header { margin-bottom: 20px; }
      .cprm-edit-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
      .cprm-edit-field { margin-bottom: 16px; }
      .cprm-edit-label { display: block; margin-bottom: 6px; font-weight: 500; color: #555; }
      .cprm-edit-input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box; }
      .cprm-edit-textarea { width: 100%; min-height: 120px; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; resize: vertical; box-sizing: border-box; font-family: inherit; }
      .cprm-edit-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
      .cprm-edit-btn { padding: 10px 20px; border: 1px solid #ddd; background: #fff; border-radius: 6px; cursor: pointer; font-size: 14px; }
      .cprm-edit-btn.primary { background: #1677ff; color: #fff; border-color: #1677ff; }
      .cprm-edit-btn.primary:hover { background: #0056b3; }
      .cprm-edit-btn:hover { background: #f5f5f5; }
      
      /* Dark theme for modal */
      [data-theme="dark"] .cprm-edit-content { background: #1a1a1a; color: #eee; }
      [data-theme="dark"] .cprm-edit-input, [data-theme="dark"] .cprm-edit-textarea { background: #2a2a2a; color: #eee; border-color: #444; }
      [data-theme="dark"] .cprm-edit-btn { background: #333; color: #eee; border-color: #555; }
      [data-theme="dark"] .cprm-edit-btn:hover { background: #444; }
      
      /* Chinese theme for modal */
      [data-theme="chinese"] .cprm-edit-content { background: #f7f4e9; color: #1a1a1a; border: 2px solid #d8c3a5; }
      [data-theme="chinese"] .cprm-edit-input, [data-theme="chinese"] .cprm-edit-textarea { background: #fffdf6; border-color: #e8d9c3; }
      [data-theme="chinese"] .cprm-edit-btn { background: #fff; border-color: #d8c3a5; color: #1a1a1a; }
      [data-theme="chinese"] .cprm-edit-btn.primary { background: #a61b29; color: #fff; border-color: #a61b29; }
    `;
    document.head.appendChild(style);
  }

  function createPanel() {
    if (document.getElementById(ID_PANEL)) return document.getElementById(ID_PANEL);
    injectStyle();
    const panel = document.createElement('div');
    panel.id = ID_PANEL;
    panel.innerHTML = `
      <div class="cprm-wrap">
        <header>
          <div class="title-section">
            <div class="title">CUE</div>
            <div class="slogan">Your Magic Wand for AI</div>
          </div>
          <div class="actions">
            <button class="btn" id="cprm-copy">复制</button>
            <button class="btn" id="cprm-apply">应用</button>
            <button class="btn" id="cprm-save">保存</button>
            <button class="btn" id="cprm-close">关闭</button>
          </div>
        </header>
        <main>
          <textarea id="cprm-input" placeholder="输入或粘贴提示词..."></textarea>
          <div class="row">
            <input id="cprm-title" type="text" placeholder="标题（可选）" />
          </div>
          <section class="history">
            <div class="muted">历史提示词</div>
            <div id="cprm-list"></div>
          </section>
        </main>
      </div>
    `;
    document.body.appendChild(panel);
    wireEvents(panel);
    loadData(panel);
    applySettings(panel);
    return panel;
  }

  function wireEvents(panel) {
    panel.querySelector('#cprm-close').addEventListener('click', () => toggle(false));
    panel.querySelector('#cprm-copy').addEventListener('click', () => {
      const val = /** @type {HTMLTextAreaElement} */(panel.querySelector('#cprm-input')).value;
      navigator.clipboard.writeText(val || '').then(() => {
        toast(msg('toastCopied'));
      });
    });
    panel.querySelector('#cprm-apply').addEventListener('click', () => applyToPage());
    panel.querySelector('#cprm-save').addEventListener('click', () => saveCurrent(panel));
  }

  function toast(msg) {
    try {
      const el = document.createElement('div');
      el.textContent = msg;
      el.style.cssText = 'position:fixed;right:8px;top:8px;background:rgba(0,0,0,.75);color:#fff;padding:6px 10px;border-radius:6px;z-index:2147483647;';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1200);
    } catch {}
  }

  async function loadData(panel) {
    const listEl = panel.querySelector('#cprm-list');
    const inputEl = panel.querySelector('#cprm-input');
    const titleEl = panel.querySelector('#cprm-title');
    STORAGE.get(['prompts'], ({ prompts }) => {
      const items = Array.isArray(prompts) ? prompts : [];
      renderList(items, listEl, inputEl, titleEl);
    });
  }

  function renderList(items, listEl, inputEl, titleEl) {
    listEl.innerHTML = '';
    items.forEach((p, idx) => {
      const item = document.createElement('div');
      item.className = 'item';
      item.innerHTML = `
        <div class="meta"><strong>${escapeHtml(p.title || p.id || '无标题')}</strong>
          <div>
            <button class="btn" data-act="load" data-idx="${idx}">${escapeHtml(msg('histLoad'))}</button>
            <button class="btn" data-act="copy" data-idx="${idx}">${escapeHtml(msg('histCopy'))}</button>
            <button class="btn" data-act="edit" data-idx="${idx}">${escapeHtml(msg('histEdit'))}</button>
            <button class="btn" data-act="del" data-idx="${idx}">${escapeHtml(msg('histDelete'))}</button>
            <button class="btn" data-act="apply" data-idx="${idx}">${escapeHtml(msg('histApply'))}</button>
          </div>
        </div>
        <div class="muted">${escapeHtml((p.text || '').slice(0, 120))}</div>
      `;
      listEl.appendChild(item);
    });

    listEl.addEventListener('click', (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const act = t.getAttribute('data-act');
      const idx = Number(t.getAttribute('data-idx'));
      if (!act || Number.isNaN(idx)) return;
      STORAGE.get(['prompts'], ({ prompts }) => {
        const items = Array.isArray(prompts) ? prompts : [];
        const p = items[idx];
        if (!p) return;
        if (act === 'load') {
          inputEl.value = p.text || '';
          titleEl.value = p.title || '';
        } else if (act === 'copy') {
          navigator.clipboard.writeText(p.text || '').then(() => toast(msg('toastCopied')));
        } else if (act === 'edit') {
          showEditModal(p, idx, items, () => loadData(document.getElementById(ID_PANEL)));
        } else if (act === 'del') {
          items.splice(idx, 1);
          STORAGE.set({ prompts: items }, () => loadData(document.getElementById(ID_PANEL)));
        } else if (act === 'apply') {
          inputEl.value = p.text || '';
          titleEl.value = p.title || '';
          applyToPage();
        }
      });
    });
  }

  function saveCurrent(panel) {
    const inputEl = panel.querySelector('#cprm-input');
    const titleEl = panel.querySelector('#cprm-title');
    const text = inputEl.value.trim();
    if (!text) return toast(msg('toastEmpty'));
    const title = (titleEl.value || msg('untitled')).trim();
    STORAGE.get(['prompts'], ({ prompts }) => {
      const items = Array.isArray(prompts) ? prompts : [];
      const id = slug(title) + '-' + Date.now().toString(36);
      items.unshift({ id, title, text });
      STORAGE.set({ prompts: items.slice(0, 200) }, () => {
        toast(msg('toastSaved'));
        loadData(panel);
      });
    });
  }

  function slug(s) {
    return (s || 'item').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  }

  function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]||c));
  }

  function toggle(force) {
    const panel = createPanel();
    if (typeof force === 'boolean') {
      panel.classList.toggle('open', force);
    } else {
      panel.classList.toggle('open');
    }
  }

  function setValue(el, val) {
    el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function applyToPage() {
    const text = /** @type {HTMLTextAreaElement} */(document.querySelector('#cprm-input')).value || '';
    if (!text) return toast(msg('toastEmpty'));
    // Known platforms selectors
    const selectors = [
      // Deepseek (example)
      'textarea[placeholder*="Message" i]',
      // Kimi (example)
      'textarea, div[contenteditable="true"]',
      // 豆包 (example)
      'textarea[placeholder*="输入"], textarea[placeholder*="说点什么"], input[type="text"]'
    ];
    let target = null;
    for (const sel of selectors) {
      target = document.querySelector(sel);
      if (target) break;
    }
    if (!target) {
      // Fallback to biggest visible textarea/input
      target = Array.from(document.querySelectorAll('textarea,input[type="text"],div[contenteditable="true"]'))
        .filter((n) => n.offsetParent !== null)
        .sort((a, b) => (b.clientWidth * b.clientHeight) - (a.clientWidth * a.clientHeight))[0] || null;
    }
    if (!target) return toast(msg('toastNoInput'));
    if ('value' in target) {
      setValue(target, text);
    } else if (target.getAttribute('contenteditable') === 'true') {
      target.focus();
      document.execCommand('selectAll', false, undefined);
      document.execCommand('insertText', false, text);
    }
    toast(msg('toastApplied'));
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === 'CPRM_TOGGLE_PANEL') toggle();
  });

  function applySettings(panel) {
    STORAGE.get(['settings'], ({ settings }) => {
      settings = settings || { locale: 'zh', theme: 'chinese', panelWidth: 380 };
      currentLocale = settings.locale || 'zh';
      // width and theme
      const width = Number(settings.panelWidth) || 380;
      panel.style.width = Math.max(280, Math.min(600, width)) + 'px';
      panel.setAttribute('data-theme', (settings.theme || 'chinese'));
      updateUILanguage(panel);
    });
  }

  function updateUILanguage(panel) {
    const titleEl = panel.querySelector('header .title-section .title');
    const sloganEl = panel.querySelector('header .title-section .slogan');
    const copyBtn = panel.querySelector('#cprm-copy');
    const applyBtn = panel.querySelector('#cprm-apply');
    const saveBtn = panel.querySelector('#cprm-save');
    const closeBtn = panel.querySelector('#cprm-close');
    const inputEl = panel.querySelector('#cprm-input');
    const nameEl = panel.querySelector('#cprm-title');
    const histLabel = panel.querySelector('.history .muted');
    if (titleEl) titleEl.textContent = msg('title');
    if (sloganEl) sloganEl.textContent = msg('slogan');
    if (copyBtn) copyBtn.textContent = msg('copy');
    if (applyBtn) applyBtn.textContent = msg('apply');
    if (saveBtn) saveBtn.textContent = msg('save');
    if (closeBtn) closeBtn.textContent = msg('close');
    if (inputEl) inputEl.setAttribute('placeholder', msg('placeholder'));
    if (nameEl) nameEl.setAttribute('placeholder', msg('titlePlaceholder'));
    if (histLabel) histLabel.textContent = msg('history');
  }

     function showEditModal(prompt, idx, items, callback) {
    // 若已有编辑弹窗，先移除避免叠加
    document.querySelectorAll('.cprm-edit-modal').forEach((el) => el.remove());
    // 创建弹窗
    const modal = document.createElement('div');
      modal.className = 'cprm-edit-modal';
      modal.innerHTML = `
        <div class="cprm-edit-content">
          <div class="cprm-edit-header">
            <div class="cprm-edit-title">${msg('editTitle')}</div>
          </div>
          <div class="cprm-edit-field">
            <label class="cprm-edit-label">标题</label>
            <input type="text" class="cprm-edit-input" id="edit-title" value="${escapeHtml(prompt.title || '')}" />
          </div>
          <div class="cprm-edit-field">
            <label class="cprm-edit-label">内容</label>
            <textarea class="cprm-edit-textarea" id="edit-content">${escapeHtml(prompt.text || '')}</textarea>
          </div>
          <div class="cprm-edit-actions">
            <button class="cprm-edit-btn" id="edit-cancel">取消</button>
            <button class="cprm-edit-btn primary" id="edit-save">保存</button>
          </div>
        </div>
      `;
 
      document.body.appendChild(modal);
 
      // 应用当前主题
      const panel = document.getElementById(ID_PANEL);
      if (panel) {
        const theme = panel.getAttribute('data-theme');
        if (theme) {
          modal.setAttribute('data-theme', theme);
        }
      }
 
      // 显示弹窗
      setTimeout(() => modal.classList.add('open'), 10);
 
      // 聚焦到标题输入框
      const titleInput = modal.querySelector('#edit-title');
      titleInput.focus();
      titleInput.select();
      
      // 统一关闭逻辑：移除弹窗并解绑 ESC 监听
      function escHandler(e) {
        if (e.key === 'Escape') {
          close();
        }
      }
      const close = () => {
        modal.remove();
        document.removeEventListener('keydown', escHandler);
      };
      document.addEventListener('keydown', escHandler);

      // 绑定保存按钮事件
      const saveBtn = modal.querySelector('#edit-save');
      saveBtn.addEventListener('click', () => {
        const titleInput = modal.querySelector('#edit-title');
        const contentInput = modal.querySelector('#edit-content');
 
        const newTitle = titleInput.value.trim();
        const newText = contentInput.value.trim();
 
        if (!newText) {
          toast(msg('toastEmpty'));
          return;
        }
 
        // 更新items数组
        items[idx] = { ...prompt, title: newTitle, text: newText };
 
        // 保存到存储
        STORAGE.set({ prompts: items }, () => {
          toast(msg('toastSaved'));
          close();
          // 刷新面板数据
          if (callback) callback();
        });
      });
 
      // 绑定取消按钮事件
      const cancelBtn = modal.querySelector('#edit-cancel');
      cancelBtn.addEventListener('click', () => {
        close();
      });
 
      // 点击背景关闭弹窗
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          close();
        }
      });
    }
})();

