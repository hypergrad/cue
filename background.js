/* global chrome */
chrome.runtime.onInstalled.addListener(() => {
  // Initialize storage if needed
  chrome.storage.local.get(['prompts', 'settings'], ({ prompts, settings }) => {
    if (!prompts) {
      chrome.storage.local.set({
        prompts: [
          { id: 'explain', title: '解释代码', text: '逐步解释以下代码逻辑，并指出边界情况与复杂度。' },
          { id: 'tests', title: '生成单元测试', text: '为以下函数生成单元测试，采用Arrange/Act/Assert结构。' }
        ]
      });
    }
    if (!settings) {
      chrome.storage.local.set({
        settings: {
          locale: 'zh',
          theme: 'chinese',
          panelWidth: 380
        }
      });
    }
  });
});

// Toggle panel via command or action
async function togglePanel(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    });
    await chrome.tabs.sendMessage(tabId, { type: 'CPRM_TOGGLE_PANEL' });
  } catch (e) {
    // Content may not be ready; inject then toggle
    try {
      await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
      await chrome.tabs.sendMessage(tabId, { type: 'CPRM_TOGGLE_PANEL' });
    } catch (err) {
      console.warn('Toggle panel failed', err);
    }
  }
}

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) togglePanel(tab.id);
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === 'toggle-panel' && tab && tab.id) {
    togglePanel(tab.id);
  }
});

