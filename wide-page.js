// 每日鸡血 - 宽屏页面脚本

const STORAGE_KEYS = {
  QUOTES: 'dailyChicken_quotes',
  STORIES: 'dailyChicken_stories',
  TODAY_CONTENT: 'dailyChicken_todayContent'
};

let currentContent = null;

document.addEventListener('DOMContentLoaded', async () => {
  // 检查 chrome.runtime 是否可用
  if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
    console.error('Chrome extension API 不可用');
    document.getElementById('contentArea').innerHTML = '<p style="color:#757575;text-align:center;font-size:18px;">请在扩展环境中打开此页面</p>';
    return;
  }

  try {
    await loadContent();
    updateProgress();
    bindEvents();

    // Update progress every minute
    setInterval(updateProgress, 60000);
  } catch (error) {
    console.error('初始化失败:', error);
    document.getElementById('contentArea').innerHTML = '<p style="color:#757575;text-align:center;font-size:18px;">初始化失败，请刷新页面重试</p>';
  }
});

async function loadContent() {
  try {
    // 检查 chrome.storage 是否可用
    if (!chrome.storage || !chrome.storage.local) {
      throw new Error('Chrome storage API 不可用');
    }

    // 加载统计数据
    const quotesResult = await chrome.storage.local.get(STORAGE_KEYS.QUOTES);
    const storiesResult = await chrome.storage.local.get(STORAGE_KEYS.STORIES);

    const quotes = quotesResult[STORAGE_KEYS.QUOTES] || [];
    const stories = storiesResult[STORAGE_KEYS.STORIES] || [];

    document.getElementById('quoteCount').textContent = quotes.length;
    document.getElementById('storyCount').textContent = stories.length;

    // 优先显示今日已保存的内容
    const savedResult = await chrome.storage.local.get(STORAGE_KEYS.TODAY_CONTENT);
    const savedContent = savedResult[STORAGE_KEYS.TODAY_CONTENT];

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
  if (!content) {
    document.getElementById('contentArea').innerHTML = '<p style="color:#757575;font-size:14px;">暂无内容</p>';
    return;
  }

  const badgeText = content.type === 'quote' ? '每日金句' : '励志故事';
  document.getElementById('badgeText').textContent = badgeText;

  // 添加淡入动画
  const contentArea = document.getElementById('contentArea');
  contentArea.classList.remove('content-fade');
  void contentArea.offsetWidth; // 触发重绘
  contentArea.classList.add('content-fade');

  if (content.type === 'quote') {
    contentArea.innerHTML = `
      <div class="quote">"${escape(content.text || '')}"</div>
      <p class="author">${content.author ? '— ' + escape(content.author) : ''}</p>
    `;
  } else {
    contentArea.innerHTML = `
      <h2 class="story-title">${escape(content.title || '')}</h2>
      <p class="story-text">${escape(content.text || '')}</p>
    `;
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

      const quotesResult = await chrome.storage.local.get(STORAGE_KEYS.QUOTES);
      const storiesResult = await chrome.storage.local.get(STORAGE_KEYS.STORIES);

      await refreshContent(
        quotesResult[STORAGE_KEYS.QUOTES] || [],
        storiesResult[STORAGE_KEYS.STORIES] || []
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

    try {
      await navigator.clipboard.writeText(text);
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
      } catch (e) {
        console.error('复制失败:', e);
      }
      document.body.removeChild(textArea);
    }
  });

  // 打开设置页面
  document.getElementById('settingsBtn').addEventListener('click', () => {
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
  });

  document.getElementById('openOptionsBtn').addEventListener('click', () => {
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
  });
}

function escape(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

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

  // Update DOM
  updateProgressBar('day', dayPercent);
  updateProgressBar('month', monthPercent);
  updateProgressBar('year', yearPercent);
}

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
