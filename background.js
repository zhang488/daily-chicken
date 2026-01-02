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

// 默认名言库
const defaultQuotes = [
  { text: "今天的汗水，是明天的泪水。", author: "匿名" },
  { text: "失败只有一种，那就是放弃。", author: "托马斯·爱迪生" },
  { text: "你的时间有限，不要浪费时间活在别人的生活里。", author: "史蒂夫·乔布斯" },
  { text: "种一棵树最好的时间是十年前，其次是现在。", author: "非洲谚语" },
  { text: "不是因为有希望才坚持，而是因为坚持才有希望。", author: "匿名" },
  { text: "你今天的努力，是幸运的伏笔。当下的付出，是明日的花开。", author: "匿名" },
  { text: "生活不会辜负每一个努力的人。", author: "匿名" },
  { text: "成功的反面不是失败，而是什么都不做。", author: "迪斯尼" },
  { text: "乾坤未定，你我皆是黑马。", author: "匿名" },
  { text: "愿你出走半生，归来仍是少年。", author: "匿名" },
  { text: "星光不问赶路人，时光不负有心人。", author: "匿名" },
  { text: "你的负担将变成礼物，你受的苦将照亮你的路。", author: "泰戈尔" },
  { text: "即使慢，驰而不息，纵令落后，纵令失败，但一定可以达到他所向的目标。", author: "鲁迅" },
  { text: "天行健，君子以自强不息。", author: "《周易》" },
  { text: "为学须刚，不刚则隋隳，不刚则不进。", author: "程颐" }
];

// 默认故事库
const defaultStories = [
  {
    title: "温水煮青蛙",
    content: "把一只青蛙放进冷水里，然后慢慢加热。青蛙会因为舒适的水温而放松警惕，等它意识到危险时，已经没有力气跳出来了。这个故事告诉我们：生于忧患，死于安乐。不要在舒适的环境中失去斗志。"
  },
  {
    title: "一美元的奇迹",
    content: "美国作家杰克·伦敦在成名前，曾无数次收到退稿信。有一次他几乎要放弃了，但他想起母亲在病床上等着他寄钱回去。他咬牙坚持，继续写作，终于凭借《野性的呼唤》成名。成功有时只需要再坚持一下。"
  },
  {
    title: "老鹰的重生",
    content: "老鹰在40岁时面临生死抉择：要么等死，要么经历150天的蜕变。它会啄掉自己的羽毛、拔掉指甲、长出新羽毛。这个过程痛苦而漫长，但最终老鹰获得了30年的新生。有时候，我们需要打破旧有的自己，才能重获新生。"
  },
  {
    title: "竹子定律",
    content: "竹子在种下后的前4年，只能长3厘米。但从第5年开始，它以每天30厘米的速度疯狂生长，仅用6周就能长到15米。其实前4年，竹子一直在扎根，它的根系已经延伸了数米。成功需要积累，不要被前期的沉默所迷惑。"
  },
  {
    title: "渔夫与商人",
    content: "一个商人在海边看到一个渔夫躺着晒太阳。商人问：'你为什么不多捕点鱼？'渔夫反问：'然后呢？'商人说：'赚钱买更大的船。''然后呢？''赚更多钱。''然后呢？''就可以像我一样躺着晒太阳。'渔夫笑着说：'我现在就在晒太阳啊。'——人生的目标不是只有一种活法。"
  }
];

// 初始化扩展
async function init() {
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
