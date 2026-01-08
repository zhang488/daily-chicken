// 每日鸡血 - 设置页面脚本

const STORAGE_KEYS = {
  SETTINGS: 'dailyChicken_settings',
  QUOTES: 'dailyChicken_quotes',
  STORIES: 'dailyChicken_stories'
};

// 默认数据
let defaultQuotes = [];
let defaultStories = [];

// 加载默认数据
async function loadDefaults() {
  if (defaultQuotes.length > 0 && defaultStories.length > 0) return;

  try {
    const quotesRes = await fetch(chrome.runtime.getURL('data/quotes.json'));
    defaultQuotes = await quotesRes.json();

    const storiesRes = await fetch(chrome.runtime.getURL('data/stories.json'));
    defaultStories = await storiesRes.json();
  } catch (e) {
    console.error('加载默认数据失败:', e);
    // 后备数据，防止文件加载失败
    defaultQuotes = [{ text: "加载失败", author: "系统" }];
    defaultStories = [{ title: "加载失败", content: "无法加载默认数据" }];
  }
}

// DOM 元素
let elements = {};

// 状态
let quotes = [];
let stories = [];
let editingQuoteIndex = -1;
let editingStoryIndex = -1;
let scrapedContent = null;

// 初始化
document.addEventListener('DOMContentLoaded', init);

function init() {
  cacheElements();
  bindEvents();
  loadSettings();
  loadContent();
}

function cacheElements() {
  elements = {
    // 设置
    enabledToggle: document.getElementById('enabledToggle'),
    notificationTime: document.getElementById('notificationTime'),
    notificationType: document.getElementById('notificationType'),
    soundToggle: document.getElementById('soundToggle'),

    // 番茄时钟设置
    workTime: document.getElementById('workTime'),
    breakTime: document.getElementById('breakTime'),
    decreaseWorkTime: document.getElementById('decreaseWorkTime'),
    increaseWorkTime: document.getElementById('increaseWorkTime'),
    decreaseBreakTime: document.getElementById('decreaseBreakTime'),
    increaseBreakTime: document.getElementById('increaseBreakTime'),
    pomodoroBackgroundToggle: document.getElementById('pomodoroBackgroundToggle'),
    pomodoroNotificationToggle: document.getElementById('pomodoroNotificationToggle'),

    // 内容统计
    quoteCount: document.getElementById('quoteCount'),
    storyCount: document.getElementById('storyCount'),

    // 列表
    quotesList: document.getElementById('quotesList'),
    storiesList: document.getElementById('storiesList'),

    // 按钮
    addQuoteBtn: document.getElementById('addQuoteBtn'),
    addStoryBtn: document.getElementById('addStoryBtn'),
    exportBtn: document.getElementById('exportBtn'),
    importBtn: document.getElementById('importBtn'),
    importFile: document.getElementById('importFile'),
    resetBtn: document.getElementById('resetBtn'),
    scrapeBtn: document.getElementById('scrapeBtn'),
    saveAsQuoteBtn: document.getElementById('saveAsQuoteBtn'),
    saveAsStoryBtn: document.getElementById('saveAsStoryBtn'),

    // 模态框按钮 (New)
    closeQuoteModalBtn: document.getElementById('closeQuoteModalBtn'),
    cancelQuoteBtn: document.getElementById('cancelQuoteBtn'),
    closeStoryModalBtn: document.getElementById('closeStoryModalBtn'),
    cancelStoryBtn: document.getElementById('cancelStoryBtn'),
    saveQuoteBtn: document.getElementById('saveQuoteBtn'),
    saveStoryBtn: document.getElementById('saveStoryBtn'),

    // 输入
    scrapeUrl: document.getElementById('scrapeUrl'),
    scrapePreview: document.getElementById('scrapePreview'),
    scrapeContent: document.getElementById('scrapeContent'),

    // 模态框
    quoteModal: document.getElementById('quoteModal'),
    storyModal: document.getElementById('storyModal'),

    // Toast
    toast: document.getElementById('toast')
  };
}

function bindEvents() {
  // 设置变更
  elements.enabledToggle.addEventListener('change', saveSettings);
  elements.notificationTime.addEventListener('change', saveSettings);
  elements.notificationType.addEventListener('change', saveSettings);
  elements.soundToggle.addEventListener('change', saveSettings);

  // 番茄时钟设置变更
  elements.workTime.addEventListener('change', saveSettings);
  elements.breakTime.addEventListener('change', saveSettings);
  elements.pomodoroBackgroundToggle.addEventListener('change', saveSettings);
  elements.pomodoroNotificationToggle.addEventListener('change', saveSettings);

  // 番茄时钟时间调整按钮
  elements.decreaseWorkTime.addEventListener('click', () => adjustPomodoroTime('workTime', -1));
  elements.increaseWorkTime.addEventListener('click', () => adjustPomodoroTime('workTime', 1));
  elements.decreaseBreakTime.addEventListener('click', () => adjustPomodoroTime('breakTime', -1));
  elements.increaseBreakTime.addEventListener('click', () => adjustPomodoroTime('breakTime', 1));

  // Tab 切换
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // 添加内容
  elements.addQuoteBtn.addEventListener('click', () => openQuoteModal());
  elements.addStoryBtn.addEventListener('click', () => openStoryModal());

  // 导入导出
  elements.exportBtn.addEventListener('click', exportData);
  elements.importBtn.addEventListener('click', () => elements.importFile.click());
  elements.importFile.addEventListener('change', importData);
  elements.resetBtn.addEventListener('click', resetData);

  // 抓取
  elements.scrapeBtn.addEventListener('click', scrapeUrl);
  elements.saveAsQuoteBtn.addEventListener('click', () => saveScrapedAsQuote());
  elements.saveAsStoryBtn.addEventListener('click', () => saveScrapedAsStory());

  // 保存表单
  elements.saveQuoteBtn.addEventListener('click', saveQuote);
  elements.saveStoryBtn.addEventListener('click', saveStory);

  // 关闭模态框 (New)
  elements.closeQuoteModalBtn.addEventListener('click', closeQuoteModal);
  elements.cancelQuoteBtn.addEventListener('click', closeQuoteModal);
  elements.closeStoryModalBtn.addEventListener('click', closeStoryModal);
  elements.cancelStoryBtn.addEventListener('click', closeStoryModal);

  // 列表事件委托 (New)
  elements.quotesList.addEventListener('click', handleQuoteListClick);
  elements.storiesList.addEventListener('click', handleStoryListClick);

  // 关闭模态框 (Overlay click)
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeQuoteModal();
        closeStoryModal();
      }
    });
  });

  // ESC 关闭模态框
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeQuoteModal();
      closeStoryModal();
    }
  });
}

// 处理名言列表点击
function handleQuoteListClick(e) {
  const btn = e.target.closest('button');
  if (!btn) return;

  const action = btn.dataset.action;
  const index = parseInt(btn.dataset.index);

  if (action === 'edit') {
    editQuote(index);
  } else if (action === 'delete') {
    deleteQuote(index);
  }
}

// 处理故事列表点击
function handleStoryListClick(e) {
  const btn = e.target.closest('button');
  if (!btn) return;

  const action = btn.dataset.action;
  const index = parseInt(btn.dataset.index);

  if (action === 'edit') {
    editStory(index);
  } else if (action === 'delete') {
    deleteStory(index);
  }
}

// 调整番茄时钟时间
function adjustPomodoroTime(type, delta) {
  const input = elements[type];
  let value = parseInt(input.value) + delta;
  value = Math.max(1, Math.min(60, value));
  input.value = value;
  saveSettings();
}

// 加载设置
async function loadSettings() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  const settings = result[STORAGE_KEYS.SETTINGS] || {
    enabled: true,
    time: '08:00',
    notificationType: 'both',
    sound: true,
    // 番茄时钟设置
    pomodoro: {
      workTime: 25,
      breakTime: 25,
      backgroundEnabled: true,
      notificationEnabled: true
    }
  };

  elements.enabledToggle.checked = settings.enabled;
  elements.notificationTime.value = settings.time || '08:00';
  elements.notificationType.value = settings.notificationType || 'both';
  elements.soundToggle.checked = settings.sound !== false;

  // 加载番茄时钟设置
  const pomodoroSettings = settings.pomodoro || {};
  elements.workTime.value = pomodoroSettings.workTime || 25;
  elements.breakTime.value = pomodoroSettings.breakTime || 25;
  elements.pomodoroBackgroundToggle.checked = pomodoroSettings.backgroundEnabled !== false;
  elements.pomodoroNotificationToggle.checked = pomodoroSettings.notificationEnabled !== false;
}

// 保存设置
async function saveSettings() {
  const settings = {
    enabled: elements.enabledToggle.checked,
    time: elements.notificationTime.value,
    notificationType: elements.notificationType.value,
    sound: elements.soundToggle.checked,
    // 番茄时钟设置
    pomodoro: {
      workTime: parseInt(elements.workTime.value),
      breakTime: parseInt(elements.breakTime.value),
      backgroundEnabled: elements.pomodoroBackgroundToggle.checked,
      notificationEnabled: elements.pomodoroNotificationToggle.checked
    }
  };

  await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings });

  showToast('设置已保存');
}

// 注意：background.js 会自动监听 storage 变化并更新闹钟

// 加载内容
async function loadContent() {
  const result = await chrome.storage.local.get([STORAGE_KEYS.QUOTES, STORAGE_KEYS.STORIES]);

  if (!result[STORAGE_KEYS.QUOTES] || !result[STORAGE_KEYS.STORIES]) {
    await loadDefaults();
  }

  quotes = result[STORAGE_KEYS.QUOTES] || [...defaultQuotes];
  stories = result[STORAGE_KEYS.STORIES] || [...defaultStories];

  renderQuotes();
  renderStories();
}

// 渲染名言列表
function renderQuotes() {
  elements.quoteCount.textContent = quotes.length;

  if (quotes.length === 0) {
    elements.quotesList.innerHTML = '<div class="empty-list">还没有名言，点击添加</div>';
    return;
  }

  elements.quotesList.innerHTML = quotes.map((quote, index) => `
    <div class="content-item">
      <div class="item-content">
        <p class="item-text">"${escapeHtml(quote.text || '')}"</p>
        <p class="item-author">— ${escapeHtml(quote.author || '匿名')}</p>
      </div>
      <div class="item-actions">
        <button class="btn-icon-sm" data-action="edit" data-index="${index}" title="编辑">
          <svg viewBox="0 0 24 24" width="16" height="16" style="pointer-events: none;">
            <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
        <button class="btn-icon-sm danger" data-action="delete" data-index="${index}" title="删除">
          <svg viewBox="0 0 24 24" width="16" height="16" style="pointer-events: none;">
            <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
}

// 渲染故事列表
function renderStories() {
  elements.storyCount.textContent = stories.length;

  if (stories.length === 0) {
    elements.storiesList.innerHTML = '<div class="empty-list">还没有故事，点击添加</div>';
    return;
  }

  elements.storiesList.innerHTML = stories.map((story, index) => `
    <div class="content-item">
      <div class="item-content">
        <p class="item-title">${escapeHtml(story.title || '')}</p>
        <p class="item-text">${escapeHtml((story.content || '').substring(0, 100))}${(story.content || '').length > 100 ? '...' : ''}</p>
      </div>
      <div class="item-actions">
        <button class="btn-icon-sm" data-action="edit" data-index="${index}" title="编辑">
          <svg viewBox="0 0 24 24" width="16" height="16" style="pointer-events: none;">
            <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
        <button class="btn-icon-sm danger" data-action="delete" data-index="${index}" title="删除">
          <svg viewBox="0 0 24 24" width="16" height="16" style="pointer-events: none;">
            <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
}

// Tab 切换
function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

  document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`${tabName}Panel`).classList.add('active');
}

// 打开名言弹窗
function openQuoteModal(index = -1) {
  editingQuoteIndex = index;
  const title = document.getElementById('quoteModalTitle');

  if (index >= 0) {
    title.textContent = '编辑名言';
    const quote = quotes[index];
    document.getElementById('quoteText').value = quote.text || '';
    document.getElementById('quoteAuthor').value = quote.author || '';
  } else {
    title.textContent = '添加名言';
    document.getElementById('quoteText').value = '';
    document.getElementById('quoteAuthor').value = '';
  }

  elements.quoteModal.classList.add('show');
  document.getElementById('quoteText').focus();
}

// 关闭名言弹窗
function closeQuoteModal() {
  elements.quoteModal.classList.remove('show');
  editingQuoteIndex = -1;
}

// 打开故事弹窗
function openStoryModal(index = -1) {
  editingStoryIndex = index;
  const title = document.getElementById('storyModalTitle');

  if (index >= 0) {
    title.textContent = '编辑故事';
    const story = stories[index];
    document.getElementById('storyTitle').value = story.title || '';
    document.getElementById('storyText').value = story.content || '';
  } else {
    title.textContent = '添加故事';
    document.getElementById('storyTitle').value = '';
    document.getElementById('storyText').value = '';
  }

  elements.storyModal.classList.add('show');
  document.getElementById('storyTitle').focus();
}

// 关闭故事弹窗
function closeStoryModal() {
  elements.storyModal.classList.remove('show');
  editingStoryIndex = -1;
}

// 保存名言
function saveQuote() {
  const text = document.getElementById('quoteText').value.trim();
  const author = document.getElementById('quoteAuthor').value.trim();

  if (!text) {
    showToast('请输入名言内容');
    return;
  }

  if (editingQuoteIndex >= 0) {
    quotes[editingQuoteIndex] = { text, author };
  } else {
    quotes.push({ text, author });
  }

  saveContent();
  closeQuoteModal();
  renderQuotes();
  showToast(editingQuoteIndex >= 0 ? '名言已更新' : '名言已添加');
}

// 保存故事
function saveStory() {
  const title = document.getElementById('storyTitle').value.trim();
  const content = document.getElementById('storyText').value.trim();

  if (!title || !content) {
    showToast('请填写标题和内容');
    return;
  }

  if (editingStoryIndex >= 0) {
    stories[editingStoryIndex] = { title, content };
  } else {
    stories.push({ title, content });
  }

  saveContent();
  closeStoryModal();
  renderStories();
  showToast(editingStoryIndex >= 0 ? '故事已更新' : '故事已添加');
}

// 编辑名言
function editQuote(index) {
  openQuoteModal(index);
}

// 删除名言
async function deleteQuote(index) {
  if (confirm('确定要删除这条名言吗？')) {
    quotes.splice(index, 1);
    await saveContent();
    renderQuotes();
    showToast('名言已删除');
  }
}

// 编辑故事
function editStory(index) {
  openStoryModal(index);
}

// 删除故事
async function deleteStory(index) {
  if (confirm('确定要删除这个故事吗？')) {
    stories.splice(index, 1);
    await saveContent();
    renderStories();
    showToast('故事已删除');
  }
}

// 保存内容
async function saveContent() {
  await chrome.storage.local.set({
    [STORAGE_KEYS.QUOTES]: quotes,
    [STORAGE_KEYS.STORIES]: stories
  });
}

// 导出数据
function exportData() {
  const data = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    quotes: quotes,
    stories: stories
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `daily-chicken-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  showToast('数据已导出');
}

// 导入数据
async function importData(e) {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (data.quotes && Array.isArray(data.quotes)) {
      quotes = data.quotes;
    }
    if (data.stories && Array.isArray(data.stories)) {
      stories = data.stories;
    }

    await saveContent();
    renderQuotes();
    renderStories();
    showToast('数据导入成功');
  } catch (err) {
    showToast('导入失败，请检查文件格式');
    console.error(err);
  }

  e.target.value = '';
}

// 重置数据
async function resetData() {
  if (!confirm('确定要恢复默认数据吗？这将删除所有自定义内容。')) {
    return;
  }

  await loadDefaults();

  quotes = [...defaultQuotes];
  stories = [...defaultStories];

  await saveContent();
  renderQuotes();
  renderStories();
  showToast('已恢复默认数据');
}

// 抓取网页
async function scrapeUrl() {
  const url = elements.scrapeUrl.value.trim();
  if (!url) {
    showToast('请输入网页地址');
    return;
  }

  elements.scrapeBtn.textContent = '抓取中...';
  elements.scrapeBtn.disabled = true;

  try {
    // 使用 fetch 抓取网页
    const response = await fetch(url);
    const text = await response.text();

    // 解析 HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    // 提取标题
    let title = doc.querySelector('title')?.textContent || '';
    title = title.split(/[|_]/)[0].trim();

    // 提取正文内容
    const contentElements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, article, .content, .post-content');
    let content = [];

    contentElements.forEach(el => {
      const text = el.textContent.trim();
      if (text.length > 20) {
        content.push(text);
      }
    });

    // 如果没有提取到内容，尝试获取 body 文本
    if (content.length === 0) {
      content.push(doc.body?.textContent?.substring(0, 500) || '未能提取到内容');
    }

    scrapedContent = {
      url: url,
      title: title,
      text: content.join('\n\n').substring(0, 2000)
    };

    // 显示预览
    elements.scrapeContent.innerHTML = `
      <p><strong>标题：</strong>${escapeHtml(title || '无标题')}</p>
      <p><strong>内容预览：</strong></p>
      <p>${escapeHtml(scrapedContent.text.substring(0, 300))}...</p>
    `;
    elements.scrapePreview.style.display = 'block';
    showToast('抓取成功');

  } catch (err) {
    showToast('抓取失败，请检查 URL 是否正确');
    console.error(err);
  }

  elements.scrapeBtn.textContent = '抓取';
  elements.scrapeBtn.disabled = false;
}

// 保存抓取内容为名言
function saveScrapedAsQuote() {
  if (!scrapedContent) return;

  const text = scrapedContent.title || (scrapedContent.text || '').substring(0, 200);
  quotes.push({
    text: text,
    author: scrapedContent.url
  });

  saveContent();
  renderQuotes();
  showToast('已保存为名言');

  clearScrapePreview();
}

// 保存抓取内容为故事
function saveScrapedAsStory() {
  if (!scrapedContent) return;

  stories.push({
    title: scrapedContent.title || '抓取的内容',
    content: scrapedContent.text
  });

  saveContent();
  renderStories();
  showToast('已保存为故事');

  clearScrapePreview();
}

// 清空抓取预览
function clearScrapePreview() {
  scrapedContent = null;
  elements.scrapePreview.style.display = 'none';
  elements.scrapeUrl.value = '';
}

// 显示 Toast
function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');

  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 2000);
}

// HTML 转义
function escapeHtml(text) {
  if (text == null) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}
