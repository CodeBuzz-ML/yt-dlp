
import os
import sys
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs

# Add the parent directory to sys.path so we can import yt_dlp
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

import yt_dlp

class DownloadHandler(BaseHTTPRequestHandler):
    def _send_response(self, message, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(message).encode())

    def do_OPTIONS(self):
        self._send_response({'status': 'ok'})

    def do_POST(self):
        if self.path != '/download':
            self._send_response({'error': 'Not Found'}, 404)
            return

        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))

        url = data.get('url')
        resolution = data.get('resolution', 'best')
        download_path = data.get('path', os.path.expanduser('~/Downloads'))

        if not url:
            self._send_response({'error': 'No URL provided'}, 400)
            return

        try:
            # Configure yt-dlp options
            ydl_opts = {
                'format': f'bestvideo[height<={resolution}]+bestaudio/best[height<={resolution}]' if resolution != 'best' else 'best',
                'outtmpl': os.path.join(download_path, '%(title)s.%(ext)s'),
                'quiet': True,
                'no_warnings': True,
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])

            self._send_response({'status': 'success', 'message': f'Downloaded to {download_path}'})
        except Exception as e:
            self._send_response({'status': 'error', 'message': str(e)}, 500)

def run(server_class=HTTPServer, handler_class=DownloadHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
