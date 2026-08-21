#!/usr/bin/env python3
"""Render blog/*.md to blog/*.html and refresh the list in blog.html.

    python tools/render.py            # rebuild every post
    python tools/render.py blog/2026-08-21-hello.md

Post conventions, deliberately minimal:
  filename   blog/YYYY-MM-DD-slug.md   -> the date shown on the page
  title      the first "# heading" line, else the slug
"""
import re
import sys
from pathlib import Path

from markdown_it import MarkdownIt
from mdit_py_plugins.dollarmath import dollarmath_plugin
from mdit_py_plugins.footnote import footnote_plugin
import latex2mathml.converter

ROOT = Path(__file__).resolve().parent.parent
BLOG = ROOT / "blog"
TEMPLATE = Path(__file__).resolve().parent / "template.html"


def _math(tex, opts):
    """$...$ and $$...$$ become native MathML at build time: no JS on the page."""
    display = "block" if opts.get("display_mode") else "inline"
    try:
        return latex2mathml.converter.convert(tex, display=display)
    except Exception as e:                      # bad LaTeX: show it, don't crash
        return '<code>%s (%s)</code>' % (tex, e)


md = (
    MarkdownIt("gfm-like", {"html": True, "linkify": False, "typographer": False})
    .use(dollarmath_plugin, renderer=_math)
    .use(footnote_plugin)
)


def to_html(text):
    """Markdown -> HTML fragment. The single source of truth for both the
    editor's live preview and the files that get committed."""
    return md.render(text)


def title_of(text, fallback):
    for line in text.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return fallback


def date_of(name):
    m = re.match(r"(\d{4}-\d{2}-\d{2})", name)
    return m.group(1) if m else ""


def render_post(path):
    """Write blog/<slug>.html next to blog/<slug>.md. Returns (date, title, href)."""
    path = Path(path)
    text = path.read_text(encoding="utf-8")
    date = date_of(path.stem)
    title = title_of(text, path.stem)

    html = (TEMPLATE.read_text(encoding="utf-8")
            .replace("{{title}}", title)
            .replace("{{date}}", date)
            .replace("{{body}}", to_html(text)))

    out = path.with_suffix(".html")
    out.write_text(html, encoding="utf-8")
    return date, title, "blog/" + out.name


def posts():
    """Every post, newest first."""
    found = []
    for p in sorted(BLOG.glob("*.md")):
        text = p.read_text(encoding="utf-8")
        found.append((date_of(p.stem), title_of(text, p.stem), "blog/" + p.stem + ".html"))
    return sorted(found, reverse=True)


def update_index():
    """Rewrite the <li> list between the markers in blog.html. Everything
    outside the markers stays hand-written."""
    items = ["<ul>"]
    for date, title, href in posts():
        items.append('<li>%s &mdash; <a href="%s">%s</a></li>' % (date, href, title))
    items.append("</ul>")
    block = "<!-- POSTS_START -->\n" + "\n".join(items) + "\n<!-- POSTS_END -->"

    index = ROOT / "blog.html"
    text = index.read_text(encoding="utf-8")
    text = re.sub(r"<!-- POSTS_START -->.*?<!-- POSTS_END -->", block, text, flags=re.S)
    index.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    targets = [Path(a) for a in sys.argv[1:]] or sorted(BLOG.glob("*.md"))
    for t in targets:
        date, title, href = render_post(t)
        print("rendered", href, "-", title)
    update_index()
    print("updated blog.html")
