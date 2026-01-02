// 每日鸡血 - 设置页面脚本

const STORAGE_KEYS = {
  SETTINGS: 'dailyChicken_settings',
  QUOTES: 'dailyChicken_quotes',
  STORIES: 'dailyChicken_stories'
};

// 默认数据
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
  },
  {
    title: "石头与钻石",
    content: "一块钻石在地下沉睡亿万年，等待被发现。而一块普通石头每天都在阳光下。但价值不在于位置，而在于内在的质地。是钻石总会发光，是金子总会发亮。耐得住寂寞，才能守得住繁华。"
  },
  {
    title: "两个和尚",
    content: "有两个和尚，一个穷一个富。穷和尚对富和尚说：'我想去南海朝圣。'富和尚说：'我这么多年都没去成，你凭什么去？'一年后，穷和尚从南海回来了，带着一路的经历和故事。富和尚还在准备。等待不如行动，条件是自己创造的。"
  },
  {
    title: "钉子的故事",
    content: "一个脾气暴躁的年轻人去找智者。智者说：'每次你生气，就往篱笆上钉一颗钉子。'年轻人照做了。一个月后，篱笆上全是钉子。智者又说：'每次你控制住脾气，就拔掉一颗钉子。'最后篱笆上只剩下几个洞。智者说：'伤害就像钉子，即使拔掉了，痕迹永远都在。'"
  },
  {
    title: "三文鱼的故事",
    content: "三文鱼成年后要逆流而上，回到出生地产卵。它们要跳跃无数次，跨越重重障碍，有些鱼会在途中死去。但它们从不放弃，因为那是它们的使命。生命中有些事，即使困难重重，也值得全力以赴。"
  },
  {
    title: "种子与大树",
    content: "有一颗种子落在地上，被泥土覆盖，看不到阳光。它很害怕，问泥土：'我会死吗？'泥土笑着说：'不会，你会发芽，会长大，会成为一棵大树。'种子问：'可是我什么都看不到。'泥土说：'成长需要时间，变强需要积累。'"
  },
  {
    title: "卖雨伞的故事",
    content: "有两个推销员去非洲卖鞋。第一个看到非洲人都光着脚，回去报告说：'这里没有市场，因为没有人穿鞋。'第二个看到后兴奋地报告：'这里市场巨大，因为所有人都没有鞋！'同样的情况，不同的视角，决定不同的结果。困难背后往往藏着机遇。"
  },
  {
    title: "铁匠与国王",
    content: "一个铁匠技艺精湛，国王请他打造一把宝剑。铁匠问：'陛下要多少钱？'国王说：'随便你开。'铁匠思考后说：'我不要钱，但请给我在全国最好的位置开一家店。'国王答应了。多年后，这家店成为全国最著名的铁匠铺。懂得投资自己的人，往往能获得更大的回报。"
  },
  {
    title: "最后的绳子",
    content: "一个探险家在沙漠中迷路了，只剩下半瓶水。他绝望地想：'完了，只剩半瓶水，我走不出去了。'另一个探险家遇到同样情况，却高兴地说：'太好了，还有半瓶水！'同样的处境，心态不同，结果可能完全不同。保持希望，是走出困境的第一步。"
  },
  {
    title: "造船的故事",
    content: "有个人想造船，但他不先收集木材，而是每天在海边散步，逢人就说：'我要造船。'别人问他：'木材呢？'他说：'木材会有的。'几年后，他还是没有造船。梦想需要行动来支撑，不然只是空想。空谈不如实干，行动是最好的宣言。"
  },
  {
    title: "最后一道门",
    content: "有个年轻人去面试，门口有九十九盏灯都亮着，只有最后一盏是灭的。面试官说：'你把最后一盏灯打开就可以进去了。'年轻人转身就走了。面试官追出来问：'为什么不试？'年轻人说：'九十九盏灯都亮了，说明开关在前九十九盏那里，最后一盏不需要开。'他被录取了。细节决定成败，善于观察的人更容易成功。"
  },
  {
    title: "禅师与兰花",
    content: "一位禅师在寺院里养了一盆珍贵的兰花。弟子不小心把花盆打碎了，兰花也死了。弟子很愧疚，等着受罚。禅师说：'我养花是为了开心，不是为了生气的。'弟子恍然大悟。执着于失去的东西，只会错过更多的美好。放下执念，才能活得轻松。"
  },
  {
    title: "两个推销员",
    content: "两家鞋厂分别派推销员去非洲开拓市场。第一个推销员看到非洲人都光着脚，认为没有市场。第二个推销员看到后欣喜若狂：'这里的市场太大了，因为所有人都不穿鞋！'同样的处境，不同的视角带来不同的结论。机遇往往藏在困难的外表下。"
  },
  {
    title: "农夫与石头",
    content: "农夫在田里发现一块大石头，他每天挖一点。邻居说：'这石头太大了，你挖不完的。'农夫说：'我不需要挖完，只要每天比昨天挖得更深就好。'一年后，石头被挖走了。积水成渊，跬步千里。每天进步一点点，终会达成目标。"
  },
  {
    title: "猎鹰与乌鸦",
    content: "国王有一只猎鹰和一只乌鸦。乌鸦每天被喂得饱饱的，猎鹰却常常饿肚子。有人问国王为什么，国王说：'等需要的时候，猎鹰才能发挥真正的价值。'后来国家遭遇危机，猎鹰带着消息飞越千里，而乌鸦只能待在笼子里。有价值的人，往往需要时间来证明自己。"
  },
  {
    title: "烧水的哲学",
    content: "有个人想烧水，水开后才发现没有茶叶。他只好重新烧。第二次水开了，发现没有水壶。他又重新烧。第三次终于准备好了，水却已经凉了。做好充分的准备，才能一次成功。机会只留给有准备的人。"
  },
  {
    title: "狮子与羚羊",
    content: "每天早上，羚羊醒来就知道自己必须跑得比最快的狮子还快，否则就会被吃掉。每天早上，狮子醒来就知道自己必须跑得比最慢的羚羊还快，否则就会饿死。无论是狮子还是羚羊，当太阳升起时，都必须开始奔跑。生活就是如此，要么淘汰别人，要么被人淘汰。"
  },
  {
    title: "教授与文盲",
    content: "一位教授在海边遇到一位老渔夫，教授问他：'你为什么不多捕点鱼？'渔夫反问：'然后呢？'教授说：'赚更多钱，买更大的船。''然后呢？''赚更多钱。''然后呢？''就可以退休享福了。'渔夫笑着说：'我现在就在享福啊。'幸福不在远方，就在当下。"
  },
  {
    title: "雕刻家",
    content: "一位雕刻家在完成一座伟大雕像后，别人问他：'你是怎么把石头变成艺术的？'雕刻家说：'我没有把石头变成艺术，我只是把多余的部分去掉。'每个人都是一座雕像，需要时间去掉那些多余的杂质，才能显现出真正的自己。"
  },
  {
    title: "落第秀才",
    content: "有个秀才第三次落榜后，想要跳河自尽。他看到一个老婆婆在河边洗棉絮，棉絮被水冲走了老婆婆也不着急。秀才问：'棉絮被冲走了，你不难过吗？'老婆婆说：'旧的不去，新的不来。'秀才恍然大悟，回家继续苦读，终于在第四年考中。失败不可怕，可怕的是放弃。"
  }
];

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
  document.getElementById('saveQuoteBtn').addEventListener('click', saveQuote);
  document.getElementById('saveStoryBtn').addEventListener('click', saveStory);

  // 关闭模态框
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

// 加载设置
async function loadSettings() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  const settings = result[STORAGE_KEYS.SETTINGS] || {
    enabled: true,
    time: '08:00',
    notificationType: 'both',
    sound: true
  };

  elements.enabledToggle.checked = settings.enabled;
  elements.notificationTime.value = settings.time || '08:00';
  elements.notificationType.value = settings.notificationType || 'both';
  elements.soundToggle.checked = settings.sound !== false;
}

// 保存设置
async function saveSettings() {
  const settings = {
    enabled: elements.enabledToggle.checked,
    time: elements.notificationTime.value,
    notificationType: elements.notificationType.value,
    sound: elements.soundToggle.checked
  };

  await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings });

  showToast('设置已保存');
}

// 注意：background.js 会自动监听 storage 变化并更新闹钟

// 加载内容
async function loadContent() {
  const result = await chrome.storage.local.get([STORAGE_KEYS.QUOTES, STORAGE_KEYS.STORIES]);
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
        <button class="btn-icon-sm" onclick="editQuote(${index})" title="编辑">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
        <button class="btn-icon-sm danger" onclick="deleteQuote(${index})" title="删除">
          <svg viewBox="0 0 24 24" width="16" height="16">
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
        <button class="btn-icon-sm" onclick="editStory(${index})" title="编辑">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
        <button class="btn-icon-sm danger" onclick="deleteStory(${index})" title="删除">
          <svg viewBox="0 0 24 24" width="16" height="16">
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

// 全局函数（供 HTML onclick 调用）
window.editQuote = editQuote;
window.deleteQuote = deleteQuote;
window.editStory = editStory;
window.deleteStory = deleteStory;
window.closeQuoteModal = closeQuoteModal;
window.closeStoryModal = closeStoryModal;
