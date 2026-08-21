#!/usr/bin/env python3
"""Local editor + preview server. Nothing here is published: it only exists
so you can write posts in the browser, then commit the generated .html.

    pip install -r requirements.txt
    python tools/serve.py            # http://localhost:8000/edit

Save writes blog/<name>.md, renders blog/<name>.html and refreshes blog.html.
Then: git add -A && git commit && git push.
"""
import json
import re
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse, parse_qs

sys.path.insert(0, str(Path(__file__).resolve().parent))
import render

ROOT = render.ROOT
BLOG = render.BLOG
EDITOR = Path(__file__).resolve().parent / "edit.html"
PORT = 8000


def safe_name(name):
    """blog/YYYY-MM-DD-slug, and nothing that escapes blog/."""
    name = re.sub(r"\.md$", "", name.strip())
    if not re.fullmatch(r"[A-Za-z0-9._-]+", name):
        raise ValueError("bad name: %r (use letters, digits, . _ -)" % name)
    return name


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    def _send(self, body, ctype="text/html; charset=utf-8", code=200):
        body = body.encode("utf-8") if isinstance(body, str) else body
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")   # always see the latest edit
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urlparse(self.path).path
        query = parse_qs(urlparse(self.path).query)

        if path == "/edit":
            return self._send(EDITOR.read_text(encoding="utf-8"))

        if path in ("/blog.html", "/blog"):
            # The published blog.html has no link to /edit, because /edit only
            # exists while this server is running. Add it on the way out.
            html = (ROOT / "blog.html").read_text(encoding="utf-8")
            return self._send(html.replace(
                "<!-- POSTS_END -->",
                '<!-- POSTS_END -->\n<p><a href="/edit">write a post</a></p>'))

        if path == "/api/posts":
            names = sorted((p.stem for p in BLOG.glob("*.md")), reverse=True)
            return self._send(json.dumps(names), "application/json")

        if path == "/api/post":
            name = safe_name(query.get("name", [""])[0])
            f = BLOG / (name + ".md")
            return self._send(f.read_text(encoding="utf-8") if f.exists() else "",
                              "text/plain; charset=utf-8")

        return super().do_GET()          # everything else: plain static files

    def do_POST(self):
        path = urlparse(self.path).path
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length).decode("utf-8")

        # Live preview: same renderer as the committed files, so what you see is
        # what gets published. Local, so no rate limit to worry about.
        if path == "/api/render":
            return self._send(render.to_html(raw))

        if path == "/api/save":
            data = json.loads(raw)
            try:
                name = safe_name(data["name"])
            except ValueError as e:
                return self._send(str(e), "text/plain; charset=utf-8", 400)
            md_path = BLOG / (name + ".md")
            md_path.write_text(data["text"], encoding="utf-8")
            _, title, href = render.render_post(md_path)
            render.update_index()
            print("saved", md_path.name, "->", href, flush=True)
            return self._send(json.dumps({"href": href, "title": title}),
                              "application/json")

        if path == "/api/delete":
            data = json.loads(raw)
            try:
                name = safe_name(data["name"])
            except ValueError as e:
                return self._send(str(e), "text/plain; charset=utf-8", 400)
            for f in (BLOG / (name + ".md"), BLOG / (name + ".html")):
                if f.exists():
                    f.unlink()
            render.update_index()
            print("deleted", name, flush=True)
            return self._send(json.dumps({"deleted": name}), "application/json")

        if path == "/api/rename":
            data = json.loads(raw)
            try:
                old_name = safe_name(data["old"])
                new_name = safe_name(data["new"])
            except ValueError as e:
                return self._send(str(e), "text/plain; charset=utf-8", 400)
            src = BLOG / (old_name + ".md")
            dst = BLOG / (new_name + ".md")
            if not src.exists():
                return self._send("no such post: " + old_name,
                                  "text/plain; charset=utf-8", 404)
            if dst.exists():
                return self._send("already exists: " + new_name,
                                  "text/plain; charset=utf-8", 409)
            src.rename(dst)
            stale = BLOG / (old_name + ".html")      # its URL changes: drop it
            if stale.exists():
                stale.unlink()
            _, title, href = render.render_post(dst)
            render.update_index()
            print("renamed", old_name, "->", new_name, flush=True)
            return self._send(json.dumps({"href": href, "title": title,
                                          "name": new_name}), "application/json")

        return self._send("no such endpoint", "text/plain; charset=utf-8", 404)

    def log_message(self, *a):
        pass                              # the interesting lines are printed above


if __name__ == "__main__":
    print("editor  http://localhost:%d/edit" % PORT)
    print("site    http://localhost:%d/" % PORT)
    HTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
