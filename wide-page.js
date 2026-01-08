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
  TODAY_CONTENT: 'dailyChicken_todayContent',
  SETTINGS: 'dailyChicken_settings'
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
    initPomodoro();

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

// 番茄时钟功能实现

/**
 * 番茄时钟状态
 * @typedef {Object} PomodoroState
 * @property {boolean} isRunning - 是否正在运行
 * @property {boolean} isPaused - 是否暂停
 * @property {boolean} isWorkTime - 是否为自律时间
 * @property {number} workTime - 自律时间（分钟）
 * @property {number} breakTime - 休息时间（分钟）
 * @property {number} remainingTime - 剩余时间（秒）
 * @property {number} totalTime - 总时间（秒）
 * @property {number} timerId - 定时器ID
 * @property {Object} settings - 番茄时钟设置
 */

/**
 * 番茄时钟状态
 * @type {PomodoroState}
 */
let pomodoroState = {
  isRunning: false,
  isPaused: false,
  isWorkTime: true,
  workTime: 25,
  breakTime: 25,
  remainingTime: 25 * 60,
  totalTime: 25 * 60,
  timerId: null,
  settings: {
    workTime: 25,
    breakTime: 25,
    backgroundEnabled: true,
    notificationEnabled: true
  }
};

/**
 * 音频上下文，用于播放通知音效
 * @type {AudioContext|null}
 */


/**
 * 从存储加载番茄时钟设置
 */
async function loadPomodoroSettings() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
    const settings = result[STORAGE_KEYS.SETTINGS] || {};
    const pomodoroSettings = settings.pomodoro || {};

    pomodoroState.settings = {
      workTime: pomodoroSettings.workTime || 25,
      breakTime: pomodoroSettings.breakTime || 25,
      backgroundEnabled: pomodoroSettings.backgroundEnabled !== false,
      notificationEnabled: pomodoroSettings.notificationEnabled !== false
    };

    pomodoroState.workTime = pomodoroState.settings.workTime;
    pomodoroState.breakTime = pomodoroState.settings.breakTime;
    pomodoroState.totalTime = pomodoroState.workTime * 60;
    pomodoroState.remainingTime = pomodoroState.totalTime;

    // 从存储加载番茄时钟状态
    const pomodoroResult = await chrome.storage.local.get('dailyChicken_pomodoroState');
    const savedState = pomodoroResult['dailyChicken_pomodoroState'];

    if (savedState) {
      // 检查状态是否过期
      const now = Date.now();
      const lastUpdate = savedState.lastUpdate;
      const elapsedSeconds = Math.floor((now - lastUpdate) / 1000);

      // 如果状态是运行中的，更新剩余时间
      if (savedState.isRunning && !savedState.isPaused) {
        pomodoroState.isRunning = true;
        pomodoroState.isPaused = false;
        pomodoroState.isWorkTime = savedState.isWorkTime;
        pomodoroState.remainingTime = Math.max(0, savedState.remainingTime - elapsedSeconds);

        // 如果时间已经结束，切换到下一个阶段
        if (pomodoroState.remainingTime <= 0) {
          pomodoroState.isWorkTime = !pomodoroState.isWorkTime;
          pomodoroState.totalTime = pomodoroState.isWorkTime
            ? pomodoroState.workTime * 60
            : pomodoroState.breakTime * 60;
          pomodoroState.remainingTime = pomodoroState.totalTime;
          pomodoroState.isRunning = false;
        } else {
          // 如果还有剩余时间，启动定时器
          startPomodoroTimer();
        }
      }
    }

    // 更新按钮状态
    updatePomodoroButtons();

    updatePomodoroDisplay();
  } catch (error) {
    console.error('加载番茄时钟设置失败:', error);
  }
}

/**
 * 保存番茄时钟状态到存储
 */
async function savePomodoroState() {
  try {
    const stateToSave = {
      isRunning: pomodoroState.isRunning,
      isPaused: pomodoroState.isPaused,
      isWorkTime: pomodoroState.isWorkTime,
      remainingTime: pomodoroState.remainingTime,
      lastUpdate: Date.now()
    };

    await chrome.storage.local.set({ 'dailyChicken_pomodoroState': stateToSave });
  } catch (error) {
    console.error('保存番茄时钟状态失败:', error);
  }
}

/**
 * 初始化番茄时钟
 */
async function initPomodoro() {
  // 加载设置
  await loadPomodoroSettings();

  // 获取DOM元素
  const startBtn = document.getElementById('startPomodoro');
  const pauseBtn = document.getElementById('pausePomodoro');
  const resetBtn = document.getElementById('resetPomodoro');

  // 初始化显示
  updatePomodoroDisplay();

  // 绑定事件监听器
  startBtn.addEventListener('click', startPomodoro);
  pauseBtn.addEventListener('click', pausePomodoro);
  resetBtn.addEventListener('click', resetPomodoro);

  // 监听设置变化
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes[STORAGE_KEYS.SETTINGS]) {
      const newSettings = changes[STORAGE_KEYS.SETTINGS].newValue;
      const newPomodoroSettings = newSettings.pomodoro || {};

      pomodoroState.settings = {
        workTime: newPomodoroSettings.workTime || 25,
        breakTime: newPomodoroSettings.breakTime || 25,
        backgroundEnabled: newPomodoroSettings.backgroundEnabled !== false,
        notificationEnabled: newPomodoroSettings.notificationEnabled !== false
      };

      // 如果未运行，更新时间设置
      if (!pomodoroState.isRunning) {
        pomodoroState.workTime = pomodoroState.settings.workTime;
        pomodoroState.breakTime = pomodoroState.settings.breakTime;
        pomodoroState.totalTime = pomodoroState.workTime * 60;
        pomodoroState.remainingTime = pomodoroState.totalTime;
        updatePomodoroDisplay();
      }
    }
  });
}

/**
 * 启动番茄时钟定时器
 */
function startPomodoroTimer() {
  // 清除可能存在的旧定时器
  if (pomodoroState.timerId) {
    clearInterval(pomodoroState.timerId);
  }

  // 发送状态变化消息给background.js
  sendPomodoroStateToBackground();

  // 开始计时
  pomodoroState.timerId = setInterval(() => {
    pomodoroState.remainingTime--;

    // 更新显示
    updatePomodoroDisplay();

    // 保存状态
    savePomodoroState();

    // 时间结束
    if (pomodoroState.remainingTime <= 0) {
      playNotificationSound();

      // 切换到下一个阶段
      pomodoroState.isWorkTime = !pomodoroState.isWorkTime;
      pomodoroState.totalTime = pomodoroState.isWorkTime
        ? pomodoroState.workTime * 60
        : pomodoroState.breakTime * 60;
      pomodoroState.remainingTime = pomodoroState.totalTime;

      // 更新显示
      updatePomodoroDisplay();

      // 保存状态
      savePomodoroState();

      // 发送状态变化消息给background.js
      sendPomodoroStateToBackground();
    }
  }, 1000);
}

/**
 * 发送番茄时钟状态给background.js
 */
function sendPomodoroStateToBackground() {
  if (pomodoroState.settings.backgroundEnabled) {
    try {
      chrome.runtime.sendMessage({
        type: 'pomodoroStateChange',
        state: {
          isRunning: pomodoroState.isRunning,
          isPaused: pomodoroState.isPaused,
          isWorkTime: pomodoroState.isWorkTime,
          remainingTime: pomodoroState.remainingTime,
          lastUpdate: Date.now()
        }
      });
    } catch (error) {
      console.error('发送消息给background.js失败:', error);
    }
  }
}

/**
 * 更新番茄时钟按钮状态
 */
function updatePomodoroButtons() {
  const startBtn = document.getElementById('startPomodoro');
  const pauseBtn = document.getElementById('pausePomodoro');
  const resetBtn = document.getElementById('resetPomodoro');

  if (pomodoroState.isRunning && !pomodoroState.isPaused) {
    // 运行中
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resetBtn.disabled = false;
  } else if (pomodoroState.isPaused) {
    // 已暂停
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = false;
  } else {
    // 未运行
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
  }
}

/**
 * 启动番茄时钟
 */
function startPomodoro() {
  if (pomodoroState.isRunning && !pomodoroState.isPaused) {
    return;
  }

  // 在用户交互时预先获取音频播放权限
  try {
    const tempAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    tempAudioContext.close();
  } catch (error) {
    console.error('获取音频权限失败:', error);
  }

  pomodoroState.isRunning = true;
  pomodoroState.isPaused = false;

  // 更新按钮状态
  updatePomodoroButtons();

  // 开始计时
  startPomodoroTimer();
}

/**
 * 暂停番茄时钟
 */
function pausePomodoro() {
  if (!pomodoroState.isRunning) {
    return;
  }

  pomodoroState.isRunning = false;
  pomodoroState.isPaused = true;

  // 清除定时器
  clearInterval(pomodoroState.timerId);
  pomodoroState.timerId = null;

  // 保存状态
  savePomodoroState();

  // 发送状态变化消息给background.js
  sendPomodoroStateToBackground();

  // 更新按钮状态
  updatePomodoroButtons();
}

/**
 * 重置番茄时钟
 */
function resetPomodoro() {
  // 清除定时器
  if (pomodoroState.timerId) {
    clearInterval(pomodoroState.timerId);
    pomodoroState.timerId = null;
  }

  // 重置状态
  pomodoroState.isRunning = false;
  pomodoroState.isPaused = false;
  pomodoroState.isWorkTime = true;
  pomodoroState.workTime = pomodoroState.settings.workTime;
  pomodoroState.breakTime = pomodoroState.settings.breakTime;
  pomodoroState.totalTime = pomodoroState.workTime * 60;
  pomodoroState.remainingTime = pomodoroState.totalTime;

  // 保存状态
  savePomodoroState();

  // 发送状态变化消息给background.js
  sendPomodoroStateToBackground();

  // 更新按钮状态
  updatePomodoroButtons();

  // 更新显示
  updatePomodoroDisplay();
}

/**
 * 更新番茄时钟显示
 */
function updatePomodoroDisplay() {
  // 更新状态文本
  const statusText = pomodoroState.isWorkTime ? '自律时间' : '休息时间';
  const stateText = pomodoroState.isRunning
    ? (pomodoroState.isPaused ? '已暂停' : '进行中')
    : '准备开始';

  document.getElementById('pomodoroStatus').textContent = `${statusText} - ${stateText}`;

  // 更新时间显示
  const minutes = Math.floor(pomodoroState.remainingTime / 60);
  const seconds = pomodoroState.remainingTime % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  document.getElementById('pomodoroTimer').textContent = timeString;

  // 更新进度条（倒计时模式 - 显示剩余时间比例）
  const progressPercent = (pomodoroState.remainingTime / pomodoroState.totalTime) * 100;
  document.getElementById('pomodoroProgressLabel').textContent = statusText;
  document.getElementById('pomodoroProgressText').textContent = `${progressPercent.toFixed(1)}%`;

  // 使用requestAnimationFrame更新进度条宽度
  requestAnimationFrame(() => {
    document.getElementById('pomodoroProgressBar').style.width = `${progressPercent}%`;
  });

  // 根据阶段更新颜色
  const isWorkTime = pomodoroState.isWorkTime;
  const timerElement = document.getElementById('pomodoroTimer');
  const progressBarElement = document.getElementById('pomodoroProgressBar');

  if (isWorkTime) {
    timerElement.style.color = '#e53935';
    progressBarElement.style.background = 'linear-gradient(90deg, #c62828, #e53935)';
  } else {
    timerElement.style.color = '#43a047';
    progressBarElement.style.background = 'linear-gradient(90deg, #2e7d32, #43a047)';
  }
}



/**
 * 播放通知音效
 */
function playNotificationSound() {
  try {
    // 每次调用时创建一个新的AudioContext，确保能正常播放
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // 设置音效参数，与notification.js保持一致
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
    oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);

    // 播放音效
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.6);
  } catch (error) {
    console.error('播放通知音效失败:', error);
  }
}
