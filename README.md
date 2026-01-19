# UX Portfolio (Python + Jinja + Markdown) — starter template

This is a tiny Python-powered static site generator for a UX portfolio:
- Case studies written in Markdown (easy to edit)
- Jinja templates for layout control
- Clean, readable typography and semantic HTML
- Fast static output (no server required after build)

## Quick start

1) Create a virtualenv and install dependencies:

```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

2) Build the site:

```bash
python build.py
```

3) Preview locally:

```bash
python -m http.server 8000 --directory dist
```

Open: http://localhost:8000

## Where to edit content
- `content/index.md` → homepage intro
- `content/case-studies/*.md` → case studies

## Add a new case study
Duplicate one of the files in `content/case-studies/`, update the front matter:

```yaml
---
title: "My New Project"
slug: "my-new-project"
role: "UX Designer"
year: "2026"
tags: ["Research", "UI", "Testing"]
status: "Public"
---
```

Then run `python build.py` again.

## Deploy
Because the output is static HTML, you can deploy the `dist/` folder to:
- Netlify (drag-and-drop `dist/`)
- Vercel (static)
- GitHub Pages (use `dist/` as the publish directory)

## Notes
This template intentionally avoids heavy frameworks so you can:
- tweak typography and layout easily
- add motion/interaction only where it supports the story
- keep performance excellent
