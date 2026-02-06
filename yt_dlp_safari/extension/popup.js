
document.addEventListener('DOMContentLoaded', () => {
  const resSelect = document.getElementById('resolution');
  const pathInput = document.getElementById('path');
  const saveBtn = document.getElementById('save');
  const status = document.getElementById('status');

  // Load saved settings
  chrome.storage.sync.get(['resolution', 'path'], (items) => {
    if (items.resolution) resSelect.value = items.resolution;
    if (items.path) pathInput.value = items.path;
  });

  saveBtn.addEventListener('click', () => {
    const resolution = resSelect.value;
    const path = pathInput.value;

    chrome.storage.sync.set({ resolution, path }, () => {
      status.textContent = 'Settings saved!';
      setTimeout(() => { status.textContent = ''; }, 2000);
    });
  });
});
