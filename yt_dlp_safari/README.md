# yt-dlp Safari Extension

This project adds a "Download" button to YouTube in Safari, powered by `yt-dlp`.

## Components

1. **Backend Server**: A Python script (`server.py`) that runs locally and handles the actual downloading using the `yt-dlp` library.
2. **Safari Extension**: A Web Extension that injects a button into YouTube and sends download requests to the backend.

## Setup Instructions

### 1. Start the Backend Server

Run the local server to handle downloads:

```bash
python3 yt_dlp_safari/backend/server.py
```

_Note: Ensure the server is running while you use the extension._

### 2. Install the Safari Extension

Since Safari requires Web Extensions to be bundled within a Mac App for permanent installation, you can load this extension for development/testing:

1. Open **Safari**.
2. Go to **Safari > Settings > Advanced**.
3. Check **"Show features for web developers"** (or "Show Develop menu in menu bar").
4. In the menu bar, go to **Develop > Allow Unsigned Extensions**.
5. In the menu bar, go to **Develop > Extension Builder** (if available) or use the Safari Web Extension converter if you have Xcode installed:
   ```bash
   xcrun safari-web-extension-converter yt_dlp_safari/extension
   ```
   _If you don't have Xcode, you can use a browser like Chrome or Firefox to load the `extension` folder directly (Load Unpacked)._

### 3. Usage

- Go to any YouTube video.
- You will see a red **Download** button next to the "Subscribe" button.
- Click the extension icon in the toolbar to configure:
  - **Default Resolution**: Choose from 480p to 4K.
  - **Download Location**: Specify a full path (e.g., `/Users/yourname/Movies`).

## Features

- **Custom Location**: Downloads go directly to your chosen folder.
- **Resolution Control**: Automatically picks the best format matching your resolution cap.
- **Native performance**: Uses the source code of `yt-dlp` directly.
