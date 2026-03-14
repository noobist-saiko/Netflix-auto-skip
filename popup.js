// read and write configuration using chrome.storage.sync

const defaults = {
  enabled: false,
  skipIntro: true,
  nextEpisode: true,
  speed: 1.0
};

function saveOption(key, value) {
  const obj = {};
  obj[key] = value;
  chrome.storage.sync.set(obj);
}

window.addEventListener('DOMContentLoaded', () => {
  const controls = document.querySelectorAll('[data-key]');
  
  // Attach change listeners immediately (no waiting for storage)
  controls.forEach(control => {
    const key = control.dataset.key;
    control.addEventListener(control.type === 'checkbox' ? 'change' : 'input', (e) => {
      const value = control.type === 'checkbox' ? e.target.checked : parseFloat(e.target.value);
      
      // Validate speed range
      if (key === 'speed' && (isNaN(value) || value < 0.5 || value > 3)) {
        return;
      }
      
      saveOption(key, value);
    });
  });
  
  // Load values asynchronously (won't block initial paint)
  chrome.storage.sync.get(defaults, (items) => {
    controls.forEach(control => {
      const key = control.dataset.key;
      if (control.type === 'checkbox') {
        control.checked = items[key];
      } else {
        control.value = items[key];
      }
    });
  });
});