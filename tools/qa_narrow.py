#!/usr/bin/env python3
"""Test true narrow-window rendering using Firefox's native screenshot mode.

Firefox Marionette can refuse window widths below roughly 500px. This separate
local-only check uses --window-size and temporarily instruments served HTML to
measure 280px/320px document geometry without modifying repository pages.

Run: python3 tools/qa_narrow.py /path/to/temporary/qa-output
"""
from __future__ import annotations

import http.server
import json
from pathlib import Path
import struct
import subprocess
import sys
import tempfile
import threading
import time
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
if len(sys.argv) != 2:
    raise SystemExit("Usage: qa_narrow.py <temporary-output-directory>")
OUT = Path(sys.argv[1]).resolve()
OUT.mkdir(parents=True, exist_ok=True)
AUDITS: list[dict] = []

MEASURE = r"""
<script>
document.addEventListener("DOMContentLoaded", () => {
  const rect = node => {
    const r = node.getBoundingClientRect();
    return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,
            width:r.width,height:r.height};
  };
  const viewport = document.documentElement.clientWidth;
  const outside = [...document.querySelectorAll("header *, main *, footer *")]
    .filter(node => {
      const style = getComputedStyle(node), bounds = node.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" &&
        style.position !== "absolute" && style.position !== "fixed" &&
        bounds.width > 1 && (bounds.right > viewport + 2 || bounds.left < -2);
    }).map(node => ({tag:node.tagName, className:String(node.className),
                    text:(node.textContent||"").trim().slice(0,50)})).slice(0,12);
  const brand = rect(document.querySelector(".brand img"));
  const controls = rect(document.querySelector(".header-tools"));
  const controlHeights = [...document.querySelectorAll(".header-tools .control")]
    .filter(node => getComputedStyle(node).display !== "none")
    .map(node => Math.round(node.getBoundingClientRect().height));
  const payload = {
    route:location.pathname, width:innerWidth, viewport,
    overflow:document.documentElement.scrollWidth - viewport,
    outside, brand, controls, controlHeights,
    language:document.documentElement.lang
  };
  navigator.sendBeacon("/__audit__/", new Blob([JSON.stringify(payload)],
                        {type:"application/json"}));
});
</script>
"""

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, *args):
        pass

    def do_POST(self):
        if self.path != "/__audit__/":
            return self.send_error(404)
        length = int(self.headers.get("Content-Length", "0"))
        if not 0 < length < 100000:
            return self.send_error(400)
        AUDITS.append(json.loads(self.rfile.read(length)))
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        route = urlparse(self.path).path
        path = (ROOT / route.lstrip("/")).resolve()
        if route.endswith("/") or path.is_dir():
            path = path / "index.html"
        if path.suffix == ".html" and path.is_file() and path.is_relative_to(ROOT):
            source = path.read_text(encoding="utf-8")
            assert "</body>" in source
            data = source.replace("</body>", MEASURE + "</body>").encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        else:
            super().do_GET()


def rectangles_overlap(a: dict, b: dict) -> bool:
    return (min(a["right"], b["right"]) > max(a["left"], b["left"]) + 1
            and min(a["bottom"], b["bottom"]) > max(a["top"], b["top"]) + 1)


POSTS = json.loads((ROOT / "about/posts.json").read_text(encoding="utf-8"))
assert POSTS and POSTS[0]["slug"]
ARTICLE = f"/about/notes/{POSTS[0]['slug']}/"
CASES = [
    ("/", 280, "de"), ("/", 320, "fr"), ("/", 360, "en"),
    ("/about/", 320, "fr"), ("/about/", 390, "pt-PT"),
    ("/about/notes/site-and-social-relaunch/", 320, "en"),
    ("/about/notes/site-and-social-relaunch/", 390, "fr"),
    ("/links/", 320, "de"), ("/links/", 390, "fr"),
    ("/news/", 320, "pt-PT"),
    (ARTICLE, 320, "de"),
    (ARTICLE, 390, "es")
]

server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), Handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
try:
    for index, (route, width, lang) in enumerate(CASES):
        with tempfile.TemporaryDirectory(prefix="k2040-mobile-qa-") as profile:
            Path(profile, "user.js").write_text(
                f'user_pref("ui.systemUsesDarkTheme",{index % 2});\n'
                f'user_pref("intl.accept_languages","{lang}");\n')
            label = route.strip("/").replace("/", "-") or "home"
            destination = OUT / f"mobile-{label}-{width}-{lang}.png"
            url = f"http://127.0.0.1:{server.server_address[1]}{route}"
            result = subprocess.run([
                "firefox", "--headless", "--no-remote", "--profile", profile,
                "--screenshot", str(destination), "--window-size",
                f"{width},820", url
            ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=30)
            assert result.returncode == 0 and destination.is_file(), (route, width)
            with destination.open("rb") as image:
                header = image.read(24)
            assert header[:8] == b"\x89PNG\r\n\x1a\n"
            assert struct.unpack(">I", header[16:20])[0] == width
            for _ in range(20):
                if len(AUDITS) > index:
                    break
                time.sleep(.1)
            assert len(AUDITS) == index + 1, f"No browser audit for {route} at {width}"
            record = AUDITS[-1]
            assert record["route"] == route and record["width"] == width, record
            assert record["language"] == lang, record
            assert record["overflow"] <= 2, record
            assert not record["outside"], record
            assert not rectangles_overlap(record["brand"], record["controls"]), record
            assert all(height >= 44 for height in record["controlHeights"]), record
finally:
    server.shutdown()

(OUT / "narrow-layout-results.json").write_text(
    json.dumps(AUDITS, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"PASS Firefox native narrow QA: {len(AUDITS)} layouts from 280–390px, "
      "no overflow, overlapping header elements or undersized controls")
