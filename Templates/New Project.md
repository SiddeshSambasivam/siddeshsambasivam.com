<%*
const slug = await tp.system.prompt("Project slug (kebab-case, e.g. matterix)");
if (!slug) { new Notice("Cancelled"); return; }
const title = slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
await tp.file.rename(slug);
await tp.file.move("/content/projects/" + slug);
-%>
---
title: "<% title %>"
date: <% tp.date.now("YYYY-MM-DD") %>
draft: true
subtitle: ""
status: "Active"
tags: []
icon: sparks
featured: true
banner_label: ""
banner_icon: bolt
meta:
  - { label: "Status", value: "Active" }
  - { label: "Started", value: "" }
actions:
  - { label: "Repository", url: "https://github.com/", icon: "github", primary: true }
---

Project description.
