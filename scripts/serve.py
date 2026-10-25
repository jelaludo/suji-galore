"""Serve the current project consistently, without stale preview assets."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class PreviewHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


root = Path(__file__).resolve().parent.parent
server = ThreadingHTTPServer(("localhost", 8137), partial(PreviewHandler, directory=str(root)))
print("Preview running at http://localhost:8137", flush=True)
try:
    server.serve_forever()
except KeyboardInterrupt:
    server.server_close()
