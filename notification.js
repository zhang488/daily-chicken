// 每日鸡血 - 弹窗通知脚本

const STORAGE_KEYS = {
  QUOTES: 'dailyChicken_quotes',
  STORIES: 'dailyChicken_stories',
  TODAY_CONTENT: 'dailyChicken_todayContent'
};

// DOM 元素
const elements = {
  card: document.getElementById('card'),
  closeBtn: document.getElementById('closeBtn'),
  contentType: document.getElementById('contentType'),
  badgeText: document.getElementById('badgeText'),
  quoteContent: document.getElementById('quoteContent'),
  quoteText: document.getElementById('quoteText'),
  quoteAuthor: document.getElementById('quoteAuthor'),
  storyContent: document.getElementById('storyContent'),
  storyTitle: document.getElementById('storyTitle'),
  storyText: document.getElementById('storyText'),
  refreshBtn: document.getElementById('refreshBtn'),
  copyBtn: document.getElementById('copyBtn'),
  toast: document.getElementById('toast')
};

// 当前内容
let currentContent = null;

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  playNotificationSound();
  await loadContent();
  bindEvents();
  window.focus();
});

async function loadContent() {
  const savedResult = await chrome.storage.local.get(STORAGE_KEYS.TODAY_CONTENT);
  const savedContent = savedResult[STORAGE_KEYS.TODAY_CONTENT];
  const today = new Date().toDateString();

  if (savedContent && savedContent.date === today) {
    currentContent = savedContent;
    renderContent();
    return;
  }

  await refreshContent();
}

async function refreshContent() {
  const quotes = await getQuotes();
  const stories = await getStories();

  if (quotes.length === 0 && stories.length === 0) {
    showError();
    return;
  }

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

  await chrome.storage.local.set({ [STORAGE_KEYS.TODAY_CONTENT]: currentContent });
  renderContent();
}

function renderContent() {
  if (!currentContent) {
    showError();
    return;
  }

  if (currentContent.type === 'quote') {
    elements.badgeText.textContent = '每日金句';
    elements.quoteContent.style.display = 'block';
    elements.storyContent.style.display = 'none';
    elements.quoteText.textContent = currentContent.text || '';
    elements.quoteAuthor.textContent = currentContent.author ? `— ${currentContent.author}` : '';
  } else {
    elements.badgeText.textContent = '励志故事';
    elements.quoteContent.style.display = 'none';
    elements.storyContent.style.display = 'block';
    elements.storyTitle.textContent = currentContent.title || '';
    elements.storyText.textContent = currentContent.text || '';
  }
}

function showError() {
  elements.badgeText.textContent = '温馨提示';
  elements.quoteContent.style.display = 'block';
  elements.storyContent.style.display = 'none';
  elements.quoteText.textContent = '请先在设置页面添加名言或故事';
  elements.quoteAuthor.textContent = '';
}

async function getQuotes() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.QUOTES);
  return result[STORAGE_KEYS.QUOTES] || [];
}

async function getStories() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.STORIES);
  return result[STORAGE_KEYS.STORIES] || [];
}

function bindEvents() {
  elements.closeBtn.addEventListener('click', closeWindow);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeWindow();
    }
  });

  elements.refreshBtn.addEventListener('click', async () => {
    elements.refreshBtn.classList.add('loading');
    await refreshContent();
    playNotificationSound();
    setTimeout(() => elements.refreshBtn.classList.remove('loading'), 300);
  });

  elements.copyBtn.addEventListener('click', () => {
    const text = getContentText();
    copyToClipboard(text);
    showToast('已复制');
  });
}

function closeWindow() {
  window.close();
}

function getContentText() {
  if (!currentContent) return '';

  if (currentContent.type === 'quote') {
    return `"${currentContent.text || ''}"\n— ${currentContent.author || ''}`;
  } else {
    return `${currentContent.title || ''}\n\n${currentContent.text || ''}`;
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    console.error('复制失败:', e);
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');

  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 2000);
}

function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
    oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.6);
  } catch (e) {
    console.log('播放音效失败');
  }
}
