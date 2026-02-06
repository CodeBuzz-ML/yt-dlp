
function injectDownloadButton() {
  const container = document.querySelector('#top-level-buttons-computed');
  if (!container || document.querySelector('#yt-dlp-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'yt-dlp-btn';
  btn.innerText = 'Download';
  btn.style.cssText = `
    background: #ff0000;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 18px;
    font-weight: bold;
    cursor: pointer;
    margin-left: 8px;
    font-family: inherit;
    font-size: 14px;
    transition: background 0.2s;
  `;

  btn.onmouseover = () => btn.style.background = '#cc0000';
  btn.onmouseout = () => btn.style.background = '#ff0000';

  btn.onclick = async () => {
    btn.innerText = 'Sending...';
    btn.disabled = true;

    const settings = await chrome.storage.sync.get(['resolution', 'path']);
    const url = window.location.href;

    try {
      const response = await fetch('http://localhost:8000/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          resolution: settings.resolution || 'best',
          path: settings.path || ''
        }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        btn.innerText = 'Download Started!';
        setTimeout(() => {
          btn.innerText = 'Download';
          btn.disabled = false;
        }, 3000);
      } else {
        alert('Error: ' + result.message);
        btn.innerText = 'Download';
        btn.disabled = false;
      }
    } catch (error) {
      alert('Local server not running? Please start server.py');
      btn.innerText = 'Download';
      btn.disabled = false;
    }
  };

  container.appendChild(btn);
}

// YouTube uses SPA navigation, so we need to check periodically or on transition
const observer = new MutationObserver(injectDownloadButton);
observer.observe(document.body, { childList: true, subtree: true });

// Initial injection
injectDownloadButton();
