My tiny slice of _www_.

Bare HTML, no framework, no build for the site.

- `index.html` fetches my GitHub profile README and renders it through GitHub's
  markdown API, in the browser.
- `blog/*.md` are rendered to `blog/*.html` locally and committed. Equations
  become MathML at render time, so the published pages run no JavaScript.

Install:
```bash
pip install -r requirements.txt
```
minimal dependencies.

Local server:
```bash
python tools/serve.py
```
then open, [http://localhost:8000](http://localhost:8000).

Writing a post:
open, [http://localhost:8000/edit](http://localhost:8000/edit).

Buttons explained:
- `Save` writes the `.md`, renders the `.html` and updates the list in `blog.html`
- `Rename` and `Delete` act on the post currently open in the dropdown
- also, renaming changes a post's URL and removes the old page
- commit and push; GitHub Pages serves the files as we pass `.nojekyll`.

Re-render:
```bash
python tools/render.py
```
re-renders every post, e.g. after editing a `.md` by hand.
