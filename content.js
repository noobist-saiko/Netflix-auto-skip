
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
  nextEpisode: true,
  speed: 1.0
};

// read existing settings from storage
chrome.storage.sync.get(null, (items) => {
  if (items) {
    config = { ...config, ...items };
  }
  // apply initial speed after config is loaded
  applySpeed();
});

// update config when popup changes values
chrome.storage.onChanged.addListener((changes,area) => {
  if(area === 'sync') {
    for (let key in changes) {
      config[key] = changes[key].newValue;
      if (key === 'speed') {
        applySpeed();
      }
      if(key === 'enabled') {
        if(config.enabled){
          applySpeed();
        } else {resetSpeed();}
      }
    }
  }
});
// function to reset speed to default
function resetSpeed() {
  const videos = document.querySelectorAll('video');
  videos.forEach(video=>{ video.playbackRate = 1.0; });
}
// function to apply speed to video
function applySpeed() {
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    video.playbackRate = config.speed;
    console.log('Set video speed to:', config.speed);
  });
  if (videos.length > 0) {
    console.log('Applied speed:', config.speed, 'to', videos.length, 'video(s)');
  } else {
    console.log('No video elements found');
  }
}

const observer = new MutationObserver((mutations) => {

  if (!config.enabled) {
    return; // 已停用功能
  }
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    if (video.playbackRate !== config.speed) {
      video.playbackRate = config.speed;
      console.log('Netflix tried to reset speed, reapplying:', config.speed);
    }
  });

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