// ==UserScript==
// @name         yt-dlp YouTube Downloader
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Add a download button to YouTube videos using local yt-dlp backend
// @author       Antigravity
// @match        *://*.youtube.com/watch*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @connect      localhost
// ==/UserScript==

(function() {
    'use strict';

    // Settings Management
    const getSettings = () => ({
        resolution: GM_getValue('resolution', '1080'),
        path: GM_getValue('path', '')
    });

    GM_registerMenuCommand("Set Resolution", () => {
        const res = prompt("Enter max resolution (e.g., 2160, 1440, 1080, 720):", GM_getValue('resolution', '1080'));
        if (res) GM_setValue('resolution', res);
    });

    GM_registerMenuCommand("Set Download Path", () => {
        const path = prompt("Enter full download path (e.g., /Users/name/Downloads):", GM_getValue('path', ''));
        if (path) GM_setValue('path', path);
    });

    function injectDownloadButton() {
        const container = document.querySelector('#top-level-buttons-computed, #actions-inner #menu-container #menu');
        if (!container || document.querySelector('#yt-dlp-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'yt-dlp-btn';
        btn.innerHTML = `
            <div style="display: flex; align-items: center; gap: 6px;">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17 18V19H6V18H17ZM16.5 11.4L15.8 10.7L12 14.4V4H11V14.4L7.2 10.6L6.5 11.3L11.5 16.3L16.5 11.4Z"></path></svg>
                <span>Download</span>
            </div>
        `;
        
        btn.style.cssText = `
            background: #ff0000;
            color: white;
            border: none;
            padding: 0 16px;
            height: 36px;
            border-radius: 18px;
            font-weight: 500;
            cursor: pointer;
            margin-left: 8px;
            font-family: "Roboto","Arial",sans-serif;
            font-size: 14px;
            transition: background 0.2s, transform 0.1s;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        btn.onmouseover = () => btn.style.background = '#cc0000';
        btn.onmouseout = () => btn.style.background = '#ff0000';
        btn.onmousedown = () => btn.style.transform = 'scale(0.95)';
        btn.onmouseup = () => btn.style.transform = 'scale(1)';

        btn.onclick = async () => {
            const settings = getSettings();
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Sending...';
            btn.disabled = true;

            GM_xmlhttpRequest({
                method: "POST",
                url: "http://localhost:8000/download",
                data: JSON.stringify({
                    url: window.location.href,
                    resolution: settings.resolution,
                    path: settings.path
                }),
                headers: { "Content-Type": "application/json" },
                onload: function(response) {
                    try {
                        const result = JSON.parse(response.responseText);
                        if (result.status === 'success') {
                            btn.innerHTML = 'Done! ✅';
                            setTimeout(() => {
                                btn.innerHTML = originalText;
                                btn.disabled = false;
                            }, 3000);
                        } else {
                            alert('Error: ' + result.message);
                            btn.innerHTML = originalText;
                            btn.disabled = false;
                        }
                    } catch(e) {
                        alert('Server error. Check if backend is running.');
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }
                },
                onerror: function() {
                    alert('Could not connect to backend server. Run server.py first!');
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            });
        };

        // Try to insert before the share button if it exists
        const shareBtn = container.querySelector('ytd-button-renderer');
        if (shareBtn) {
            container.insertBefore(btn, shareBtn);
        } else {
            container.appendChild(btn);
        }
    }

    // YouTube uses SPA navigation, so watch for changes
    const observer = new MutationObserver(injectDownloadButton);
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial injection
    setTimeout(injectDownloadButton, 2000);
})();
