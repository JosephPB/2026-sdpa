"""Serve the presenter deck and execute its examples using local Python.

python serve.py             # real API and webpage requests in request examples
python serve.py --saved     # explicitly use saved responses for those examples
"""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
import json
import subprocess
import sys

ROOT = Path(__file__).resolve().parent


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if self.path == '/runner-config':
            return self.send_json({'mode': 'saved' if self.server.saved else 'live'})
        return super().do_GET()

    def send_json(self, value, status=200):
        body = json.dumps(value).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        allowed = {f'http://127.0.0.1:{self.server.server_port}', f'http://localhost:{self.server.server_port}'}
        if (self.path != '/run' or self.headers.get('Origin') not in allowed
                or self.headers.get('X-SDPA-Run') != '1'
                or self.headers.get('Content-Type') != 'application/json'):
            return self.send_json({'error': 'Open the locally served presenter deck to run examples.'}, 403)
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 100000:
                raise ValueError('Expected a slide-sized example.')
            request = json.loads(self.rfile.read(length))
            request['saved'] = self.server.saved
            completed = subprocess.run(
                [sys.executable, str(ROOT / 'live/capture_slide.py')],
                input=json.dumps(request), text=True, capture_output=True,
                cwd=ROOT, timeout=90)
            if completed.returncode:
                raise RuntimeError(completed.stderr[-3000:])
            return self.send_json(json.loads(completed.stdout))
        except Exception as error:
            return self.send_json({'error': str(error)}, 500)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=4218)
    parser.add_argument('--saved', action='store_true')
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    server.saved = args.saved
    print(f'Open http://127.0.0.1:{args.port}/week8.html', flush=True)
    print('Request examples use ' + ('SAVED responses; no external requests.' if args.saved else 'LIVE requests.'), flush=True)
    server.serve_forever()
