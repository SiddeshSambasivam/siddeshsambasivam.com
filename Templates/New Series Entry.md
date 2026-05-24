<%*
const series = await tp.system.prompt("Series slug (folder under content/writing)");
if (!series) { new Notice("Cancelled"); return; }
const slug = await tp.system.prompt("Entry slug (kebab-case)");
if (!slug) { new Notice("Cancelled"); return; }
const title = slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
await tp.file.rename(slug);
await tp.file.move("/content/writing/" + series + "/" + slug);
-%>
---
title: "<% title %>"
date: <% tp.date.now("YYYY-MM-DD") %>
draft: true
subtitle: ""
tags: []
icon: pen
weight: 10
toc: false
---

Entry notes.
