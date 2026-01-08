/**
 * 每日鸡血 - 宽屏页面脚本
 * @fileoverview 管理扩展的宽屏页面显示逻辑
 */

/**
 * 存储键名常量
 * @constant {Object}
 */
const STORAGE_KEYS = {
  QUOTES: 'dailyChicken_quotes',
  STORIES: 'dailyChicken_stories',
  TODAY_CONTENT: 'dailyChicken_todayContent'
};

/**
 * 当前显示的内容
 * @type {Object|null}
 */
let currentContent = null;

document.addEventListener('DOMContentLoaded', async () => {
  // 检查 chrome.runtime 是否可用
  if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
    console.error('Chrome extension API 不可用');
    document.getElementById('contentArea').innerHTML = '<p style="color:#757575;text-align:center;font-size:18px;">请在 Chrome 浏览器中打开此扩展</p>';
    return;
  }

  // 显示初始加载状态
  showLoadingState();

  try {
    await loadContent();
    updateProgress();
    bindEvents();

    // 使用优化的进度更新函数
    startProgressUpdates();
  } catch (error) {
    console.error('初始化失败:', error);
    showErrorState('初始化失败，请刷新页面重试');
  }
});

// 显示加载状态
function showLoadingState() {
  const contentArea = document.getElementById('contentArea');
  contentArea.innerHTML = '';

  const containerDiv = document.createElement('div');
  containerDiv.style.display = 'flex';
  containerDiv.style.justifyContent = 'center';
  containerDiv.style.alignItems = 'center';
  containerDiv.style.height = '160px';

  const spinnerDiv = document.createElement('div');
  spinnerDiv.style.width = '30px';
  spinnerDiv.style.height = '30px';
  spinnerDiv.style.border = '3px solid rgba(229,57,53,0.3)';
  spinnerDiv.style.borderTopColor = '#e53935';
  spinnerDiv.style.borderRadius = '50%';
  spinnerDiv.style.animation = 'spin 0.8s linear infinite';

  containerDiv.appendChild(spinnerDiv);
  contentArea.appendChild(containerDiv);
}

// 显示错误状态
function showErrorState(message) {
  const contentArea = document.getElementById('contentArea');
  contentArea.innerHTML = '';

  const errorPara = document.createElement('p');
  errorPara.style.color = '#757575';
  errorPara.style.textAlign = 'center';
  errorPara.style.fontSize = '18px';
  errorPara.textContent = message;
  contentArea.appendChild(errorPara);
}

async function loadContent() {
  try {
    // 检查 chrome.storage 是否可用
    if (!chrome.storage || !chrome.storage.local) {
      throw new Error('Chrome storage API 不可用');
    }

    // 合并存储API调用，一次性获取所有需要的数据
    const storageResult = await chrome.storage.local.get([
      STORAGE_KEYS.QUOTES,
      STORAGE_KEYS.STORIES,
      STORAGE_KEYS.TODAY_CONTENT
    ]);

    const quotes = storageResult[STORAGE_KEYS.QUOTES] || [];
    const stories = storageResult[STORAGE_KEYS.STORIES] || [];
    const savedContent = storageResult[STORAGE_KEYS.TODAY_CONTENT];

    document.getElementById('quoteCount').textContent = quotes.length;
    document.getElementById('storyCount').textContent = stories.length;

    // 优先显示今日已保存的内容
    if (savedContent) {
      const savedDate = savedContent.date;
      const today = new Date().toDateString();

      if (savedDate === today) {
        currentContent = savedContent;
        renderContent(currentContent);
        return;
      }
    }

    // 没有今日内容，随机获取
    await refreshContent(quotes, stories);
  } catch (error) {
    console.error('加载内容失败:', error);
    document.getElementById('contentArea').innerHTML = '<p style="color:#757575;text-align:center;font-size:18px;">加载失败，请刷新页面重试</p>';
    // 设置默认统计值
    try {
      document.getElementById('quoteCount').textContent = '0';
      document.getElementById('storyCount').textContent = '0';
    } catch (e) {
      // 忽略
    }
  }
}

async function refreshContent(quotes, stories) {
  try {
    if (quotes.length === 0 && stories.length === 0) {
      document.getElementById('contentArea').innerHTML = '<p style="color:#757575;text-align:center;font-size:18px;">请先在设置页面添加名言或故事</p>';
      return;
    }

    // 70% 概率显示名言，30% 概率显示故事
    const useQuote = Math.random() > 0.3;

    if (useQuote && quotes.length > 0) {
      const quote = quotes[Math.floor(Math.random() * quotes.length)];
      currentContent = {
        type: 'quote',
        text: quote.text || '',
        author: quote.author || '',
        date: new Date().toDateString()
      };
    } else if (stories.length > 0) {
      const story = stories[Math.floor(Math.random() * stories.length)];
      currentContent = {
        type: 'story',
        title: story.title || '',
        text: story.content || story.text || '',
        date: new Date().toDateString()
      };
    }

    // 保存今日内容
    try {
      if (chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ [STORAGE_KEYS.TODAY_CONTENT]: currentContent });
      }
    } catch (storageError) {
      console.warn('保存内容失败，但继续显示:', storageError);
    }

    renderContent(currentContent);
  } catch (error) {
    console.error('刷新内容失败:', error);
    document.getElementById('contentArea').innerHTML = '<p style="color:#757575;text-align:center;font-size:18px;">刷新失败，请重试</p>';
  }
}

function renderContent(content) {
  const contentArea = document.getElementById('contentArea');

  // 清空内容
  contentArea.innerHTML = '';

  if (!content) {
    const noContentPara = document.createElement('p');
    noContentPara.style.color = '#757575';
    noContentPara.style.fontSize = '14px';
    noContentPara.textContent = '暂无内容';
    contentArea.appendChild(noContentPara);
    return;
  }

  const badgeText = content.type === 'quote' ? '每日金句' : '励志故事';
  document.getElementById('badgeText').textContent = badgeText;

  // 添加淡入动画
  contentArea.classList.remove('content-fade');
  void contentArea.offsetWidth; // 触发重绘
  contentArea.classList.add('content-fade');

  if (content.type === 'quote') {
    // 创建名言元素
    const quoteDiv = document.createElement('div');
    quoteDiv.className = 'quote';
    quoteDiv.textContent = `"${content.text || ''}"`;
    contentArea.appendChild(quoteDiv);

    if (content.author) {
      const authorPara = document.createElement('p');
      authorPara.className = 'author';
      authorPara.textContent = `— ${content.author}`;
      contentArea.appendChild(authorPara);
    }
  } else {
    // 创建故事元素
    const titleH2 = document.createElement('h2');
    titleH2.className = 'story-title';
    titleH2.textContent = content.title || '';
    contentArea.appendChild(titleH2);

    const textPara = document.createElement('p');
    textPara.className = 'story-text';
    textPara.textContent = content.text || '';
    contentArea.appendChild(textPara);
  }
}

// 打开设置页面
function openOptionsPage() {
  try {
    if (chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'), '_blank');
    }
  } catch (error) {
    console.error('打开设置页面失败:', error);
    window.open(chrome.runtime.getURL('options.html'), '_blank');
  }
}

function bindEvents() {
  // 刷新内容
  document.getElementById('refreshBtn').addEventListener('click', async () => {
    const btn = document.getElementById('refreshBtn');
    btn.classList.add('btn-load');

    try {
      if (!chrome.storage || !chrome.storage.local) {
        throw new Error('Chrome storage API 不可用');
      }

      // 合并存储API调用
      const storageResult = await chrome.storage.local.get([
        STORAGE_KEYS.QUOTES,
        STORAGE_KEYS.STORIES
      ]);

      await refreshContent(
        storageResult[STORAGE_KEYS.QUOTES] || [],
        storageResult[STORAGE_KEYS.STORIES] || []
      );
    } catch (error) {
      console.error('刷新失败:', error);
      document.getElementById('contentArea').innerHTML = '<p style="color:#757575;text-align:center;font-size:18px;">刷新失败，请重试</p>';
    } finally {
      setTimeout(() => btn.classList.remove('btn-load'), 300);
    }
  });

  // 复制内容
  document.getElementById('copyBtn').addEventListener('click', async () => {
    if (!currentContent) return;

    const text = currentContent.type === 'quote'
      ? `"${currentContent.text || ''}" — ${currentContent.author || ''}`
      : `${currentContent.title || ''}\n\n${currentContent.text || ''}`;

    const copyBtn = document.getElementById('copyBtn');
    const originalHTML = copyBtn.innerHTML;
    let copySuccess = false;

    try {
      await navigator.clipboard.writeText(text);
      copySuccess = true;
    } catch (error) {
      console.error('复制失败:', error);
      // 降级方案：使用传统方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        copySuccess = true;
      } catch (e) {
        console.error('复制失败:', e);
      }
      document.body.removeChild(textArea);
    }

    // 显示复制成功反馈
    if (copySuccess) {
      copyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> 已复制';
      copyBtn.style.background = 'linear-gradient(135deg, #43a047, #2e7d32)';
      copyBtn.style.borderColor = '#2e7d32';
      copyBtn.style.borderBottomColor = '#1b5e20';
      copyBtn.style.boxShadow = '0 4px 8px rgba(67, 160, 71, 0.2)';

      // 3秒后恢复原始状态
      setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
        copyBtn.style.background = 'linear-gradient(135deg, #e53935, #d32f2f)';
        copyBtn.style.borderColor = '#c62828';
        copyBtn.style.borderBottomColor = '#8e0000';
        copyBtn.style.boxShadow = '0 4px 8px rgba(229, 57, 53, 0.2)';
      }, 3000);
    }
  });

  // 打开设置页面
  document.getElementById('settingsBtn').addEventListener('click', openOptionsPage);
  document.getElementById('openOptionsBtn').addEventListener('click', openOptionsPage);
}

/**
 * 更新所有进度条
 */
function updateProgress() {
  const now = new Date();

  // Day Progress (Remaining)
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const totalDayMs = endOfDay - startOfDay;
  const remainingDayMs = endOfDay - now;
  const dayPercent = Math.max(0, Math.min(100, (remainingDayMs / totalDayMs) * 100));

  // Month Progress (Remaining)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const totalMonthMs = endOfMonth - startOfMonth;
  const remainingMonthMs = endOfMonth - now;
  const monthPercent = Math.max(0, Math.min(100, (remainingMonthMs / totalMonthMs) * 100));

  // Year Progress (Remaining)
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
  const totalYearMs = endOfYear - startOfYear;
  const remainingYearMs = endOfYear - now;
  const yearPercent = Math.max(0, Math.min(100, (remainingYearMs / totalYearMs) * 100));

  // 使用requestAnimationFrame更新DOM
  requestAnimationFrame(() => {
    updateProgressBar('day', dayPercent);
    updateProgressBar('month', monthPercent);
    updateProgressBar('year', yearPercent);
  });
}

/**
 * 更新单个进度条
 * @param {string} idPrefix - 进度条ID前缀
 * @param {number} percent - 进度百分比（0-100）
 */
function updateProgressBar(idPrefix, percent) {
  const progressBar = document.getElementById(`${idPrefix}ProgressBar`);
  const progressText = document.getElementById(`${idPrefix}ProgressText`);

  if (progressBar && progressText) {
    // Format to 1 decimal place
    const formattedPercent = percent.toFixed(1) + '%';
    progressBar.style.width = formattedPercent;
    progressText.textContent = formattedPercent;
  }
}

/**
 * 进度更新动画ID
 * @type {number|null}
 */
let progressAnimationId = null;

/**
 * 启动进度条更新循环
 */
function startProgressUpdates() {
  // 清除之前的定时器
  if (progressAnimationId) {
    clearTimeout(progressAnimationId);
  }

  // 更新一次
  updateProgress();

  // 每分钟更新一次
  progressAnimationId = setTimeout(() => {
    startProgressUpdates();
  }, 60000);
}
