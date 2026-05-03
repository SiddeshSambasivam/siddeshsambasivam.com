# siddeshsambasivam.com

[![Netlify Status](https://api.netlify.com/api/v1/badges/c6aada95-8bed-4417-b079-969ca0e46d71/deploy-status)](https://app.netlify.com/projects/siddeshsambasivam/deploys)

The source for my personal website — writing, projects, and a bit about what I'm working on. Built with [Hugo](https://gohugo.io/) and deployed on [Netlify](https://www.netlify.com/).

> Engineering lead at Hypotenuse AI, building LLM infrastructure for ecommerce product data at scale.

## Stack

- **[Hugo](https://gohugo.io/) v0.132+ (extended)** — static site generator
- **Vanilla CSS + JS** — no framework runtime, ~6KB JS, fingerprinted assets via Hugo Pipes
- **Source Serif 4 / Inter / JetBrains Mono** — Google Fonts
- **Netlify** — build, deploy, headers, redirects

## Run locally

```bash
# install hugo (extended)
brew install hugo

# start the dev server with drafts visible
hugo server -D

# production build
hugo --gc --minify
```

The site is served at `http://localhost:1313`.

## Project structure

```
.
├── archetypes/             # `hugo new` scaffolds (default, writing, projects)
├── assets/                 # processed by Hugo Pipes (fingerprinted)
│   ├── css/main.css
│   ├── js/main.js
│   └── media/              # source images (resized at build)
├── content/
│   ├── _index.md           # home
│   ├── about.md
│   ├── writing/            # blog posts
│   └── projects/           # project pages
├── data/
│   ├── work.yaml           # work history (rendered in the timeline)
│   └── publications.yaml   # selected publications
├── layouts/
│   ├── 404.html
│   ├── _default/           # base, list, single
│   ├── index.html          # home composition
│   ├── index.llms.txt      # llms.txt template
│   ├── partials/           # head, nav, footer, icons, jsonld, ...
│   └── sitemap.xml
├── static/                 # served as-is at the site root
│   ├── images/
│   └── robots.txt
├── hugo.toml               # site config (params, menu, geo, output formats)
└── netlify.toml            # build, headers, redirects
```

## Adding content

### A blog post

```bash
hugo new writing/my-post.md
```

Front matter fields the layout uses:

```yaml
title: "Post title"
date: 2026-01-01
subtitle: "One-line summary shown under the title and in feed rows."
status: "New"             # optional pill in the header
tags: ["systems", "llm"]
icon: pen                 # icon name from layouts/partials/icons.html
cover: /images/cover.png  # optional banner image
toc: true                 # opt out with `false`
```

### A project

```bash
hugo new projects/my-project.md
```

Front matter the project layout understands:

```yaml
title: "Project name"
oneliner: "Short pitch shown in the home feed row."
subtitle: "Longer description shown on the project page."
status: "Active"
tags: ["python", "ml"]
icon: stack
weight: 10                # controls order on home + index page
banner_label: "label"
banner_icon: stack
meta:
  - { label: "Language", value: "Python" }
  - { label: "Stars",    value: "9" }
actions:
  - { label: "Repository", url: "https://github.com/...", icon: "github", primary: true }
```

### Work history

Edit `data/work.yaml` — each entry renders as a timeline item with bullets:

```yaml
- id: hyp-lead
  when: "Apr 2026 - Present"
  role: Lead Software Engineer
  company: Hypotenuse AI
  current: true
  bullets:
    - "Bullet one."
    - "Bullet two."
```

## Site features

- **Light + dark theme** with localStorage persistence and a pre-paint script (no flash).
- **Sliding nav pill** that snaps to the active link and slides on click.
- **Animated timeline** (`grid-template-rows` trick — no max-height hacks).
- **Sticky footer**, responsive hero (centers on mobile), and per-viewport line-clamp on cards.
- **Search** on writing/projects index pages with `⌘/Ctrl-K` shortcut.
- **TOC sidebar** on long posts with active-section highlighting via `IntersectionObserver`.

## SEO, GEO, and LLM friendliness

- **JSON-LD structured data**: `Person` + `WebSite` on home, `BlogPosting` on posts, `CreativeWork` on projects, `BreadcrumbList` everywhere.
- **OpenGraph + Twitter cards** with auto-generated 1200×630 OG image (uses post `cover` if set).
- **Geo meta tags** (`geo.region`, `geo.position`, `ICBM`) driven by `params.geo`.
- **`/llms.txt`** generated via a custom Hugo output format ([llmstxt.org](https://llmstxt.org/) spec) with a discoverable `<link rel="alternate">`.
- **`robots.txt`** explicitly allows GPTBot, ChatGPT-User, OAI-SearchBot, PerplexityBot, ClaudeBot, Anthropic-AI, Google-Extended, CCBot, Applebot, Meta-ExternalAgent, cohere-ai, and Bytespider.
- **Custom sitemap** with per-section priorities and `changefreq`.

## Deployment

Pushes to `main` trigger a Netlify build. The build command and headers live in `netlify.toml`.

| Context        | Command                                     |
| -------------- | ------------------------------------------- |
| production     | `hugo --gc --minify`                        |
| deploy-preview | `hugo --gc --minify --buildFuture -b $URL`  |
| branch-deploy  | `hugo --gc --minify -b $URL`                |

Hugo version is pinned via `HUGO_VERSION` in `[build.environment]`.

## License

Code in this repository is licensed under the [MIT License](LICENSE). Written content (everything under `content/`) is © Siddesh Sambasivam Suseela — please don't repost wholesale, but feel free to quote with attribution.
