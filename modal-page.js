// 每日鸡血 - 弹框页面脚本
const STORAGE_KEY = 'dailyChicken_todayContent';

let content = { type: 'error', text: '请先在设置页面添加名言或故事' };

async function init() {
  // 读取内容
  const result = await chrome.storage.local.get(STORAGE_KEY);
  if (result[STORAGE_KEY]) {
    content = result[STORAGE_KEY];
  }

  render();
  playSound();

  // 绑定事件
  document.getElementById('closeBtn').addEventListener('click', () => window.close());
  document.getElementById('refreshBtn').addEventListener('click', handleRefresh);
  document.getElementById('copyBtn').addEventListener('click', handleCopy);

  // ESC 关闭
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.close();
  });
}

function render() {
  const badgeText = content.type === 'quote' ? '每日金句' : (content.type === 'story' ? '励志故事' : '温馨提示');
  document.getElementById('badgeText').textContent = badgeText;

  let html = '';
  if (content.type === 'quote') {
    html = `<div class="quote">"${escape(content.text || '')}"</div><p class="author">${content.author ? '— ' + escape(content.author) : ''}</p>`;
  } else if (content.type === 'story') {
    html = `<h2 class="story-title">${escape(content.title || '')}</h2><p class="story-text">${escape(content.text || '')}</p>`;
  } else {
    html = `<div class="quote">"${escape(content.text || '')}"</div>`;
  }
  document.getElementById('contentArea').innerHTML = html;
}

async function handleRefresh() {
  const btn = document.getElementById('refreshBtn');
  btn.classList.add('btn-load');
  try {
    const newContent = await chrome.runtime.sendMessage({ type: 'refresh' });
    if (newContent) {
      content = newContent;
      render();
      playSound();
    }
  } catch (e) {
    console.log('刷新失败:', e);
  }
  btn.classList.remove('btn-load');
}

function handleCopy() {
  const text = content.type === 'quote'
    ? `"${content.text || ''}" — ${content.author || ''}`
    : `${content.title || ''}\n\n${content.text || ''}`;
  navigator.clipboard.writeText(text).then(() => showToast('已复制')).catch(() => showToast('复制失败'));
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function playSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
    osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {}
}

function escape(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 初始化
init();
