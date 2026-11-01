---
title: "OpenPlan"
oneliner: "A desktop app that makes coding agents agree on what to build before they build it."
date: 2026-10-30
date_label: "2026"
subtitle: "Every agent plan moves through fixed states. In Alignment, the agent asks you questions until you agree on what to build, why, and how. Only then does it get a todo list and start."
status: "Open source"
tags: ["tauri", "rust", "react", "agents", "mcp"]
icon: sparks
featured: true
banner_image: openplan-blog-hero.png
meta:
  - { label: "Stack", value: "Tauri + React" }
  - { label: "Platforms", value: "macOS, Windows, Linux" }
  - { label: "Agents", value: "Claude Code, Codex, Cursor" }
  - { label: "License", value: "MIT" }
actions:
  - { label: "Read the post", url: "/writing/building-openplan/", icon: "pen", primary: true }
  - { label: "Download", url: "/writing/building-openplan/#download", icon: "arrow" }
  - { label: "Repository", url: "https://github.com/SiddeshSambasivam/openplan", icon: "github" }
---

OpenPlan gives every coding-agent plan a lifecycle, with alignment as a gate before any code is written.

Coding agents write good code, but they work from a prompt, a repo and a few context files. They miss the context a team carries in its head, so they can build a clean answer to the wrong question. Reviewing the finished plan rarely catches that, because the misunderstanding happened before the plan existed.

## How it works

Agents file plans into a local **plan base**: plain Markdown files in a git repository at `~/.openplan`. Claude Code, Codex and Cursor all reach it through one MCP server, with the same tools and the same standards. You review plans in the OpenPlan app, and the agent working on a plan hears your comments and answers while its session is open.

| State | What happens |
|---|---|
| Draft | The agent files the first version. You review it with comments on the text. |
| Alignment | Each review round, the agent revises the plan and asks one to three questions. |
| In progress | You press **Build** once the alignment score reaches your target. The agent records the decisions, files the todos and starts. |
| In review | No todo is open. The work waits on you, a reviewer or CI. |

The longer argument for why alignment deserves its own state is in [the post](/writing/building-openplan/).
