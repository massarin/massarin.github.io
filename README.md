My tiny slice of _www_.

Bare HTML, no framework, no build step for the site itself.

- `index.html` fetches my GitHub profile README and renders it through GitHub's
  markdown API, in the browser.
- `blog/*.md` are rendered to `blog/*.html` locally and committed. Equations
  become MathML at render time, so the published pages run no JavaScript.

Writing a post:

    pip install -r requirements.txt
    python tools/serve.py        # then open http://localhost:8000/edit

Save writes the `.md`, renders the `.html` and updates the list in `blog.html`;
rename and delete act on the post currently open in the dropdown. Renaming
changes a post's URL and removes the old page.
Commit and push; GitHub Pages serves the files as they are (`.nojekyll`).

`python tools/render.py` re-renders every post, e.g. after editing a `.md` by hand.
