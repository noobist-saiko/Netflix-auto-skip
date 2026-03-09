
// 1. 定義要監控的按鈕特徵。分為「跳過介紹」和「下一集」兩類，方便根據設定啟用/停用。

const introSelectors = [
  '.watch-video--skip-content-button', // 略過介紹
  '[aria-label="Skip Intro"]'
];

const nextSelectors = [
  '.watch-video--next-episode-button', // 下一集
  '[aria-label="Next Episode"]',
  '[data-uia="next-episode-seamless-button-draining"]'
];

// 合併以便遍歷
const targetSelectors = [...introSelectors, ...nextSelectors];

// configuration state with defaults
let config = {
  enabled: false,
  skipIntro: true,
  nextEpisode: true
};

// read existing settings from storage
chrome.storage.sync.get(config, (items) => {
  config = items;
});

// update config when popup changes values
chrome.storage.onChanged.addListener((changes) => {
  for (let key in changes) {
    config[key] = changes[key].newValue;
  }
});



// 2. 建立觀察器

const observer = new MutationObserver((mutations) => {

  if (!config.enabled) {
    return; // 已停用功能
  }

  for (const selector of targetSelectors) {
    if (introSelectors.includes(selector) && !config.skipIntro) {
      continue;
    }
    if (nextSelectors.includes(selector) && !config.nextEpisode) {
      continue;
    }

    const button = document.querySelector(selector);

    if (button) {
      console.log('偵測到按鈕：', selector);
      button.click();
      break;
    }
  }

});



// 3. 開始監控整個 body 的子節點變動

observer.observe(document.body, {

  childList: true,

  subtree: true

});



console.log('自動略過腳本已啟動...');