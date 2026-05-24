<%*
const slug = await tp.system.prompt("Series slug (kebab-case, e.g. visual-nla)");
if (!slug) { new Notice("Cancelled"); return; }
const title = slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
await tp.file.rename("_index");
await tp.file.move("/content/writing/" + slug + "/_index");
-%>
---
title: "<% title %>"
oneliner: ""
subtitle: ""
date: <% tp.date.now("YYYY-MM-DD") %>
status: "In progress"
tags: []
icon: book
weight: 10
draft: true
# Optional: link this series to a project page for context.
# Accepts a slug ("matterix") or a full path ("/projects/matterix/").
project: ""
meta:
  - { label: "Started", value: "" }
  - { label: "Cadence", value: "" }
actions:
  - { label: "Source", url: "https://", icon: "arrow", primary: true }
---

What this series is about, why you're writing it, and what you hope to learn.
