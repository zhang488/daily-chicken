// 每日鸡血 - Popup 脚本
// 点击扩展图标时打开宽屏页面

document.addEventListener('DOMContentLoaded', async () => {
  // 直接打开宽屏页面
  const url = chrome.runtime.getURL('wide-page.html');
  window.location.href = url;
});
