from __future__ import annotations

import shutil
from pathlib import Path
from typing import Any, Dict

from jinja2 import Environment, FileSystemLoader, select_autoescape

import argparse
import webbrowser
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import os
import threading


ROOT = Path(__file__).parent
TEMPLATES_DIR = ROOT / "templates"
ASSETS_DIR = ROOT / "assets"
DIST_DIR = ROOT / "dist"


print("==== BUILD DEBUG ====")
print("BUILD.PY PATH:", Path(__file__).resolve())
print("ROOT:", ROOT.resolve())
print("ASSETS_DIR:", ASSETS_DIR.resolve(), "exists:", ASSETS_DIR.exists())
print("STYLES SOURCE:", (ASSETS_DIR / "styles.css").resolve(), "exists:", (ASSETS_DIR / "styles.css").exists())
print("DIST_DIR:", DIST_DIR.resolve())
print("=====================")


# ---------------- core helpers ----------------
def ensure_clean_dist():
    if DIST_DIR.exists():
        shutil.rmtree(DIST_DIR)
    DIST_DIR.mkdir(parents=True, exist_ok=True)


def copy_assets():
    if ASSETS_DIR.exists():
        shutil.copytree(ASSETS_DIR, DIST_DIR / "assets", dirs_exist_ok=True)


def render(env: Environment, template_name: str, out_path: Path, **ctx: Any):
    html = env.get_template(template_name).render(**ctx)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(html, encoding="utf-8")


# ---------------- site data ----------------
def site_context() -> Dict[str, Any]:
    return {
        "name": "Arefeh Ghadirinasab",
        "role": "UX/Graphic Designer",
        "location": "City, Country",
        "email": "arefeh.ghadirinasab@gmail.com",
        "links": {
            "LinkedIn": "https://www.linkedin.com/in/arefeh-ghadirinasab-45b4257a/?originalSubdomain=ir",
            "Instagram": "https://www.instagram.com/arefeh_ghadirinasab/",
        },
        "experience": [
            {
                "company": "Crosby",
                "title": "Senior UX Designer",
                "years": "2025 — Present",
                "summary": "Leading the design and strategy of Crosby’s retail POS tool across mobile and in-store platforms.",
            },
            {
                "company": "Norman & Co",
                "title": "Lead Product Designer",
                "years": "2018 — 2021",
                "summary": "Led product design for the core platform, improving onboarding and reducing time-to-value.",
            },
        ],
        "selected_work": [
            {
                "title": "Crosby: POS Tool Launch",
                "url": "/crosby-pos/",
                "year": "2026",
                "role": "Senior UX Designer",
                "summary": "End-to-end POS workflow improvements across mobile and in-store touchpoints.",
                "tags": ["UX", "Product", "Enterprise"],
            },
            {
                "title": "Norman & Co: Scout Product Launch",
                "url": "/norman-scout/",
                "year": "2025",
                "role": "Lead Product Designer",
                "summary": "Launched a new product experience with improved onboarding and faster time-to-value.",
                "tags": ["UX", "Strategy"],
            },
            {
                "title": "Gardona: Online Store Redesign",
                "url": "/gardona-store/",
                "year": "2024",
                "role": "UX / Visual Design",
                "summary": "Redesigned commerce flows and visual system to improve clarity and conversion.",
                "tags": ["E-commerce", "UI"],
            },
            {
                "title": "Carmine: Skycast App Launch",
                "url": "/carmine-skycast/",
                "year": "2024",
                "role": "Product Design",
                "summary": "Designed core interactions and visual hierarchy for a new app experience.",
                "tags": ["Mobile", "UI"],
            },
        ],
    }


# ---------------- build pages ----------------
def build_home(env: Environment):
    render(
        env,
        "index.html",
        DIST_DIR / "index.html",
        site=site_context(),
        page={"title": "Home", "description": ""},
    )


def build_work(env: Environment):
    render(
        env,
        "work.html",
        DIST_DIR / "work" / "index.html",
        site=site_context(),
        page={"title": "Work", "description": "Selected work"},
    )

def build_project_pages(env: Environment):
    render(env, "work/crosby.html", DIST_DIR / "work" / "crosby" / "index.html",
           site=site_context(), page={"title": "Crosby", "description": ""})

    render(env, "work/project-two.html", DIST_DIR / "work" / "project-two" / "index.html",
           site=site_context(), page={"title": "Project Two", "description": ""})





# ---------------- dev server ----------------
def serve_dist_blocking(port: int = 8000):
    dist_path = DIST_DIR.resolve()
    if not dist_path.exists():
        raise FileNotFoundError(f"dist folder not found: {dist_path}")

    os.chdir(dist_path)

    handler = SimpleHTTPRequestHandler
    httpd = ThreadingHTTPServer(("localhost", port), handler)

    url = f"http://localhost:{port}/"
    print(f"\nServing {dist_path} at {url}")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        httpd.server_close()


def open_browser(port: int = 8000):
    url = f"http://localhost:{port}/"
    print(f"Opening {url}")
    try:
        webbrowser.open(url, new=0, autoraise=True)
    except Exception as e:
        print("Could not open browser:", e)


# ---------------- main ----------------
# ---------------- main ----------------
def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8000, help="Port for local server (default: 8000)")
    parser.add_argument("--serve", action="store_true", help="Start local server after building")
    args = parser.parse_args(argv)

    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=select_autoescape(["html", "xml"]),
    )

    ensure_clean_dist()
    copy_assets()

    build_home(env)
    build_work(env)


    print(f"Built site -> {DIST_DIR}")

    # ✅ only run the local dev server when you explicitly want it
    if args.serve:
        server_thread = threading.Thread(target=serve_dist_blocking, args=(args.port,), daemon=True)
        server_thread.start()
        open_browser(args.port)
        server_thread.join()


if __name__ == "__main__":
    main()

