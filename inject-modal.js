// 每日鸡血 - 弹框注入脚本
(function() {
  console.log('每日鸡血弹框脚本开始执行');

  // 防止重复注入
  if (document.getElementById('daily-chicken-modal')) {
    console.log('弹框已存在，跳过注入');
    return;
  }

  // 从 storage 读取内容
  let content = { type: 'error', text: '请先在设置页面添加名言或故事' };

  async function initModal() {
    console.log('开始初始化弹框');
    try {
      const result = await chrome.storage.local.get('dailyChicken_todayContent');
      console.log('读取 storage 结果:', result);
      if (result.dailyChicken_todayContent) {
        content = result.dailyChicken_todayContent;
        console.log('内容读取成功:', content);
      }
    } catch (e) {
      console.log('读取内容失败:', e);
    }

    showModal();
  }

  function showModal() {
    const styles = `
      #daily-chicken-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.75);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2147483647;
        animation: dc-fadeIn 0.2s ease;
      }
      #daily-chicken-modal {
        background: linear-gradient(180deg, #1a1a1a 0%, #151515 100%);
        border: 1px solid #333;
        border-radius: 16px;
        width: 100%;
        max-width: 480px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        position: relative;
        animation: dc-slideUp 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
      }
      @keyframes dc-fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes dc-slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      .dc-close-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 32px;
        height: 32px;
        border: none;
        background: rgba(255,255,255,0.05);
        color: #757575;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      .dc-close-btn:hover { background: #e53935; color: white; }
      .dc-card-body { padding: 32px 28px 20px; }
      .dc-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 14px;
        background: linear-gradient(135deg, #e53935, #ff6f00);
        color: white;
        font-size: 13px;
        font-weight: 500;
        border-radius: 20px;
        margin-bottom: 20px;
      }
      .dc-dot { width: 6px; height: 6px; background: white; border-radius: 50%; animation: dc-pulse 1.5s ease-in-out infinite; }
      @keyframes dc-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
      .dc-quote { font-size: 18px; line-height: 1.8; color: #fff; padding-left: 20px; border-left: 3px solid #e53935; margin-bottom: 16px; }
      .dc-author { text-align: right; font-size: 14px; color: #757575; font-style: italic; }
      .dc-story-title { font-size: 20px; font-weight: 600; color: #e53935; margin-bottom: 14px; display: flex; align-items: center; gap: 10px; }
      .dc-story-title::before { content: ''; width: 8px; height: 8px; background: linear-gradient(135deg, #e53935, #ff6f00); border-radius: 50%; }
      .dc-story-text { font-size: 15px; line-height: 1.8; color: #b0b0b0; text-align: justify; white-space: pre-wrap; }
      .dc-card-footer { display: flex; gap: 12px; padding: 16px 28px 24px; border-top: 1px solid #333; background: rgba(0,0,0,0.2); }
      .dc-btn {
        flex: 1;
        padding: 10px 20px;
        border: none;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s;
      }
      .dc-btn-sec { background: #242424; color: #fff; border: 1px solid #333; }
      .dc-btn-sec:hover { border-color: #e53935; color: #e53935; background: rgba(229,57,53,0.1); }
      .dc-btn-pri { background: linear-gradient(135deg, #e53935, #c62828); color: white; box-shadow: 0 4px 12px rgba(229,57,53,0.3); }
      .dc-btn-pri:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(229,57,53,0.4); }
      .dc-btn-load { opacity: 0.7; pointer-events: none; }
      .dc-btn-load::after { content: ''; width: 14px; height: 14px; border: 2px solid transparent; border-top-color: currentColor; border-radius: 50%; animation: dc-spin 0.6s linear infinite; margin-left: 4px; }
      @keyframes dc-spin { to { transform: rotate(360deg); } }
      .dc-toast {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: #1a1a1a;
        color: #fff;
        padding: 12px 24px;
        border-radius: 10px;
        font-size: 14px;
        z-index: 2147483648;
        border: 1px solid #e53935;
        opacity: 0;
        transition: all 0.3s;
      }
      .dc-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    const badgeText = content.type === 'quote' ? '每日金句' : (content.type === 'story' ? '励志故事' : '温馨提示');
    const quoteHTML = content.type === 'quote' ? `
      <div class="dc-quote">"${escapeHtml(content.text || '')}"</div>
      <p class="dc-author">${content.author ? '— ' + escapeHtml(content.author) : ''}</p>
    ` : '';
    const storyHTML = content.type === 'story' ? `
      <h2 class="dc-story-title">${escapeHtml(content.title || '')}</h2>
      <p class="dc-story-text">${escapeHtml(content.text || '')}</p>
    ` : '';
    const errorHTML = content.type === 'error' ? `
      <div class="dc-quote">"${escapeHtml(content.text || '')}"</div>
    ` : '';

    const modalHTML = `
      <div id="daily-chicken-overlay">
        <div id="daily-chicken-modal">
          <button class="dc-close-btn" id="dc-close">×</button>
          <div class="dc-card-body">
            <div class="dc-badge"><span class="dc-dot"></span><span id="dc-badge-text">${badgeText}</span></div>
            <div id="dc-content-area">
              ${quoteHTML || storyHTML || errorHTML}
            </div>
          </div>
          <div class="dc-card-footer">
            <button class="dc-btn dc-btn-sec" id="dc-refresh-btn">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
              换一批
            </button>
            <button class="dc-btn dc-btn-pri" id="dc-copy-btn">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
              复制
            </button>
          </div>
        </div>
      </div>
      <div class="dc-toast" id="dc-toast"></div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 播放音效
    playSound();

    // 绑定事件
    document.getElementById('dc-close').addEventListener('click', closeModal);
    document.getElementById('dc-refresh-btn').addEventListener('click', handleRefresh);
    document.getElementById('dc-copy-btn').addEventListener('click', handleCopy);

    // ESC 关闭
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    });
  }

  async function handleRefresh() {
    const btn = document.getElementById('dc-refresh-btn');
    btn.classList.add('dc-btn-load');
    try {
      const newContent = await chrome.runtime.sendMessage({ type: 'refresh' });
      if (newContent) {
        content = newContent;
        updateContent();
        playSound();
      }
    } catch (e) {
      console.log('刷新失败:', e);
    }
    btn.classList.remove('dc-btn-load');
  }

  function handleCopy() {
    const text = content.type === 'quote'
      ? `"${content.text || ''}" — ${content.author || ''}`
      : `${content.title || ''}\n\n${content.text || ''}`;
    navigator.clipboard.writeText(text).then(() => {
      showToast('已复制');
    }).catch(() => {
      showToast('复制失败');
    });
  }

  function updateContent() {
    const badgeText = content.type === 'quote' ? '每日金句' : '励志故事';
    document.getElementById('dc-badge-text').textContent = badgeText;

    const html = content.type === 'quote'
      ? `<div class="dc-quote">"${escapeHtml(content.text || '')}"</div><p class="dc-author">${content.author ? '— ' + escapeHtml(content.author) : ''}</p>`
      : `<h2 class="dc-story-title">${escapeHtml(content.title || '')}</h2><p class="dc-story-text">${escapeHtml(content.text || '')}</p>`;
    document.getElementById('dc-content-area').innerHTML = html;
  }

  function closeModal() {
    const overlay = document.getElementById('daily-chicken-overlay');
    if (overlay) overlay.remove();
    const toast = document.getElementById('dc-toast');
    if (toast) toast.remove();
  }

  function showToast(msg) {
    const toast = document.getElementById('dc-toast');
    if (toast) {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2000);
    }
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

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 初始化
  initModal();
})();
