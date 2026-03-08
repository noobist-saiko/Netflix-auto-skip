
// 1. 定義要監控的按鈕特徵（Netflix 的類別名稱常變動，建議用 aria-label 或內容文字）

const targetSelectors = [

  '.watch-video--skip-content-button', // 略過介紹

  '.watch-video--next-episode-button', // 下一集

  '[aria-label="Skip Intro"]',

  '[aria-label="Next Episode"]',

  '[data-uia="next-episode-seamless-button-draining"]'

];



// 2. 建立觀察器

const observer = new MutationObserver((mutations) => {

  for (const selector of targetSelectors) {

    const button = document.querySelector(selector);

    if (button) {

      console.log('偵測到按鈕：', selector);

      button.click(); // 自動點擊
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