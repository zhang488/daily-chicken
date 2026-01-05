// 每日鸡血 - 后台服务
// 使用 chrome.alarms API 实现定时任务

const ALARM_NAME = 'daily-chicken-notification';
const STORAGE_KEYS = {
  SETTINGS: 'dailyChicken_settings',
  QUOTES: 'dailyChicken_quotes',
  STORIES: 'dailyChicken_stories',
  TODAY_CONTENT: 'dailyChicken_todayContent'
};

// 默认设置
const defaultSettings = {
  enabled: true,
  time: '08:00',
  frequency: 'daily',
  notificationType: 'both',
  sound: true,
  darkMode: false
};

// 默认名言库 - 将从 data/quotes.json 加载
let defaultQuotes = [];

// 默认故事库 - 将从 data/stories.json 加载
let defaultStories = [];

// 初始化扩展
async function init() {
  // 加载默认数据
  try {
    const quotesRes = await fetch(chrome.runtime.getURL('data/quotes.json'));
    defaultQuotes = await quotesRes.json();
    
    const storiesRes = await fetch(chrome.runtime.getURL('data/stories.json'));
    defaultStories = await storiesRes.json();
  } catch (e) {
    console.error('加载默认数据失败:', e);
  }

  // 初始化存储
  await initializeStorage();

  // 加载设置并设置闹钟
  const settings = await getSettings();
  if (settings.enabled) {
    scheduleNotification(settings.time);
  }

  // 监听设置变化
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes[STORAGE_KEYS.SETTINGS]) {
      const newSettings = changes[STORAGE_KEYS.SETTINGS].newValue;
      if (newSettings.enabled) {
        scheduleNotification(newSettings.time);
      } else {
        chrome.alarms.clear(ALARM_NAME);
      }
    }
  });
}

// 初始化存储
async function initializeStorage() {
  const result = await chrome.storage.local.get([
    STORAGE_KEYS.SETTINGS,
    STORAGE_KEYS.QUOTES,
    STORAGE_KEYS.STORIES
  ]);

  if (!result[STORAGE_KEYS.SETTINGS]) {
    await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: defaultSettings });
  }

  if (!result[STORAGE_KEYS.QUOTES]) {
    await chrome.storage.local.set({ [STORAGE_KEYS.QUOTES]: defaultQuotes });
  }

  if (!result[STORAGE_KEYS.STORIES]) {
    await chrome.storage.local.set({ [STORAGE_KEYS.STORIES]: defaultStories });
  }
}

// 获取设置
async function getSettings() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  return result[STORAGE_KEYS.SETTINGS] || defaultSettings;
}

// 获取名言列表
async function getQuotes() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.QUOTES);
  return result[STORAGE_KEYS.QUOTES] || [];
}

// 获取故事列表
async function getStories() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.STORIES);
  return result[STORAGE_KEYS.STORIES] || [];
}

// 解析时间
function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);

  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime() - now.getTime();
}

// 安排通知
function scheduleNotification(time) {
  chrome.alarms.clear(ALARM_NAME);

  const delay = parseTime(time);

  chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: delay / 60000,
    periodInMinutes: 24 * 60 // 每天重复
  });

  console.log(`每日鸡血已安排: ${time}, ${Math.round(delay / 60000)}分钟后触发`);
}

// 监听闹钟
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    await sendNotification();
  }
});

// 发送通知
async function sendNotification() {
  const settings = await getSettings();
  if (!settings.enabled) return;

  // 随机选择名言或故事
  const quotes = await getQuotes();
  const stories = await getStories();
  const useQuote = Math.random() > 0.3;

  let content;
  if (useQuote && quotes.length > 0) {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    content = {
      type: 'quote',
      text: quote.text,
      author: quote.author
    };
  } else if (stories.length > 0) {
    const story = stories[Math.floor(Math.random() * stories.length)];
    content = {
      type: 'story',
      title: story.title,
      text: story.content
    };
  }

  // 保存今日内容
  await chrome.storage.local.set({ [STORAGE_KEYS.TODAY_CONTENT]: content });

  // 根据设置选择通知类型
  if (settings.notificationType === 'toast' || settings.notificationType === 'both') {
    showToastNotification(content, settings);
  }

  if (settings.notificationType === 'modal' || settings.notificationType === 'both') {
    showModalNotification(content, settings);
  }
}

// Toast 通知
function showToastNotification(content, settings) {
  if (!content) return;

  const icon = 'icons/icon48.png';
  const text = content.type === 'quote'
    ? `"${(content.text || '').substring(0, 50)}${(content.text || '').length > 50 ? '...' : ''}"\n— ${content.author || ''}`
    : (content.title || '');

  chrome.notifications.create({
    type: 'basic',
    iconUrl: icon,
    title: '每日鸡血 ✨',
    message: text,
    priority: 1,
    requireInteraction: false
  });
}

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'refresh') {
    handleRefresh().then(content => sendResponse(content));
    return true; // 异步响应
  }
});

// 获取随机内容
async function handleRefresh() {
  const quotes = await getQuotes();
  const stories = await getStories();
  const useQuote = Math.random() > 0.3;

  if (useQuote && quotes.length > 0) {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    return { type: 'quote', text: quote.text || '', author: quote.author || '' };
  } else if (stories.length > 0) {
    const story = stories[Math.floor(Math.random() * stories.length)];
    return { type: 'story', title: story.title || '', text: story.content || story.text || '' };
  }
  return { type: 'error', text: '请先在设置页面添加名言或故事' };
}

// 模态弹窗通知 - 使用新标签页显示
async function showModalNotification(content, settings) {
  try {
    // 直接打开新标签页显示弹框
    const modalUrl = chrome.runtime.getURL('modal-page.html');
    console.log('打开弹框页面:', modalUrl);

    chrome.tabs.create({ url: modalUrl }, (tab) => {
      console.log('弹框标签页已创建:', tab.id);
    });
  } catch (err) {
    console.log('打开弹框失败:', err);
  }
}

// 初始化
init();
