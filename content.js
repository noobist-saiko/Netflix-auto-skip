const selectors = [
  '.watch-video--skip-content-button',
  '.watch-video--next-episode-button',
  '[aria-label="Skip Intro"]',
  '[aria-label="Next Episode"]'
];

function autoClick() {
  for (const selector of selectors) {
    const button = document.querySelector(selector);

    if (button && button.offsetParent !== null) {
      console.log("Auto click:", selector);
      button.click();
    }
  }

  requestAnimationFrame(autoClick);
}

autoClick();

console.log("Netflix Auto Skip enabled");