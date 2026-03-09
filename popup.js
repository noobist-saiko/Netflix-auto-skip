// read and write configuration using chrome.storage.sync

const defaults = {
  enabled: false,
  skipIntro: true,
  nextEpisode: true
};

function restoreOptions() {
  chrome.storage.sync.get(defaults, (items) => {
    document.getElementById('enableToggle').checked = items.enabled;
    document.getElementById('skipIntroToggle').checked = items.skipIntro;
    document.getElementById('nextEpisodeToggle').checked = items.nextEpisode;
  });
}

function saveOption(key, value) {
  const obj = {};
  obj[key] = value;
  chrome.storage.sync.set(obj);
}

window.addEventListener('DOMContentLoaded', () => {
  restoreOptions();

  document.getElementById('enableToggle').addEventListener('change', (e) => {
    saveOption('enabled', e.target.checked);
  });

  document.getElementById('skipIntroToggle').addEventListener('change', (e) => {
    saveOption('skipIntro', e.target.checked);
  });

  document.getElementById('nextEpisodeToggle').addEventListener('change', (e) => {
    saveOption('nextEpisode', e.target.checked);
  });
});