#!/usr/bin/env python3
"""Static site server."""

from __future__ import annotations

import socket
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PORT = 8150
ROOT = Path(__file__).resolve().parent


class SiteHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)


def _lan_urls(port: int) -> list[str]:
    urls = [f"http://127.0.0.1:{port}/"]
    seen: set[str] = set()
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            ip = info[4][0]
            if ip.startswith(("127.", "169.254.")) or ip in seen:
                continue
            seen.add(ip)
            urls.append(f"http://{ip}:{port}/")
    except OSError:
        pass
    return urls


if __name__ == "__main__":
    with ThreadingHTTPServer(("0.0.0.0", PORT), SiteHandler) as httpd:
        print(f"Serving {ROOT}")
        print(f"  http://127.0.0.1:{PORT}/")
        httpd.serve_forever()