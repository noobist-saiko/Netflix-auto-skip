// Netflix Auto Skip (Optimized)

const introSelectors = [
  '.watch-video--skip-content-button',
  '[aria-label="Skip Intro"]'
];

const nextSelectors = [
  '.watch-video--next-episode-button',
  '[aria-label="Next Episode"]',
  '[data-uia="next-episode-seamless-button-draining"]'
];

let config = {
  enabled: false,
  skipIntro: true,
  nextEpisode: true,
  speed: 1.0
};

let cachedVideo = null;
let speedApplyTimer = null;

// load config
chrome.storage.sync.get(null, (items) => {
  if (items) config = { ...config, ...items };
});

// update config when popup changes — debounce speed changes to avoid stutter
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return;

  for (let key in changes) {
    config[key] = changes[key].newValue;
  }

  applySpeedDebounced();
});

function applySpeedDebounced() {
  if (speedApplyTimer) clearTimeout(speedApplyTimer);
  speedApplyTimer = setTimeout(() => {
    if (cachedVideo && config.enabled) {
      cachedVideo.playbackRate = config.speed;
    }
  }, 150);
}

// detect and cache video element, apply speed only if changed
function detectVideo(node) {
  if (node.tagName === 'VIDEO') {
    cachedVideo = node;
    if (config.enabled) {
      const target = config.speed;
      if (Math.abs(cachedVideo.playbackRate - target) > 0.01) {
        cachedVideo.playbackRate = target;
      }
    }
  }
}

// click matching button — check self AND children (Netflix adds buttons inside container divs)
function detectButtons(node) {
  if (!node.matches && !node.querySelector) return;

  if (config.skipIntro) {
    for (const sel of introSelectors) {
      if (node.matches && node.matches(sel)) { node.click(); return; }
      if (node.querySelector) {
        const btn = node.querySelector(sel);
        if (btn) { btn.click(); return; }
      }
    }
  }

  if (config.nextEpisode) {
    for (const sel of nextSelectors) {
      if (node.matches && node.matches(sel)) { node.click(); return; }
      if (node.querySelector) {
        const btn = node.querySelector(sel);
        if (btn) { btn.click(); return; }
      }
    }
  }
}

// batch and process mutations via requestAnimationFrame to stay off the hot path
let pendingNodes = [];
let rafScheduled = false;

function processPending() {
  rafScheduled = false;
  if (!config.enabled) { pendingNodes = []; return; }

  const nodes = pendingNodes;
  pendingNodes = [];

  for (const node of nodes) {
    detectVideo(node);
    detectButtons(node);
  }
}

const observer = new MutationObserver((mutations) => {
  if (!config.enabled) return;

  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType !== 1) continue; // element nodes only
      pendingNodes.push(node);

      // also capture a video nested inside the added node (e.g. initial load)
      if (node.querySelector) {
        const video = node.querySelector('video');
        if (video) pendingNodes.push(video);
      }
    }
  }

  if (!rafScheduled && pendingNodes.length) {
    rafScheduled = true;
    requestAnimationFrame(processPending);
  }
});

// wait for netflix player
function startObserver() {
  const player = document.querySelector('.watch-video');

  if (!player) {
    setTimeout(startObserver, 1000);
    return;
  }

  observer.observe(player, {
    childList: true,
    subtree: true
  });
}

startObserver();