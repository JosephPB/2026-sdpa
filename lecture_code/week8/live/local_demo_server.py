"""A local teaching API and HTML page. This never writes to a public service.

python live/local_demo_server.py
GET /traffic             -> HTML teaching fixture
GET /observations        -> current in-memory records
POST /observations       -> create a record; restart server to reset
"""
from pathlib import Path
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlsplit, parse_qs
from threading import Lock
import argparse
import json

ROOT = Path(__file__).resolve().parents[1]
RECORDS = [{'id': 1, 'site': 'A38', 'cars': 182},
           {'id': 2, 'site': 'A38', 'cars': 233}]
LOCK = Lock()


class Handler(BaseHTTPRequestHandler):
    def send(self, code, body, content_type='application/json', location=None):
        data = body if isinstance(body, bytes) else json.dumps(body).encode()
        self.send_response(code)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(data)))
        if location:
            self.send_header('Location', location)
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        url = urlsplit(self.path)
        if url.path == '/traffic':
            self.send(200, (ROOT / 'data/traffic-page.html').read_bytes(), 'text/html; charset=utf-8')
        elif url.path == '/observations':
            site = parse_qs(url.query).get('site', [None])[0]
            with LOCK:
                rows = [r.copy() for r in RECORDS if site is None or r['site'] == site]
            self.send(200, rows)
        elif url.path.startswith('/observations/'):
            record_id = url.path.rsplit('/', 1)[-1]
            with LOCK:
                row = next((r.copy() for r in RECORDS if str(r['id']) == record_id), None)
            self.send(200 if row else 404, row or {'error': 'Unknown observation'})
        else:
            self.send(404, {'error': 'Unknown teaching route'})

    def do_POST(self):
        if urlsplit(self.path).path != '/observations':
            self.send(404, {'error': 'Unknown teaching route'})
            return
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 10000:
                raise ValueError('Expected a short JSON body')
            row = json.loads(self.rfile.read(length))
            if not isinstance(row, dict) or not isinstance(row.get('site'), str):
                raise ValueError('site must be text')
            if type(row.get('cars')) is not int or row['cars'] < 0:
                raise ValueError('cars must be a nonnegative integer')
            with LOCK:
                created = {'id': len(RECORDS) + 1, 'site': row['site'], 'cars': row['cars']}
                RECORDS.append(created)
            self.send(201, created, location=f'/observations/{created["id"]}')
        except (ValueError, TypeError) as error:
            self.send(400, {'error': str(error)})


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=4209)
    args = parser.parse_args()
    print(f'Local teaching server: http://127.0.0.1:{args.port}', flush=True)
    ThreadingHTTPServer(('127.0.0.1', args.port), Handler).serve_forever()
