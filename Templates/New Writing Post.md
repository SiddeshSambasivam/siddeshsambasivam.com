<%*
const slug = await tp.system.prompt("Post slug (kebab-case, e.g. my-new-post)");
if (!slug) { new Notice("Cancelled"); return; }
const title = slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
await tp.file.rename(slug);
await tp.file.move("/content/writing/" + slug);
-%>
---
title: "<% title %>"
date: <% tp.date.now("YYYY-MM-DD") %>
draft: true
subtitle: ""
tags: []
icon: pen
toc: true
---

Write here.
