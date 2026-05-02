---
title: "Newscast API"
oneliner: "A simple REST API to fetch news articles for any query."
date: 2021-01-06
date_label: "2021 → 2022"
subtitle: "A small REST API that returns headlines, sources, URLs, timestamps, categories, and country tags for any query word — built when every existing option was either expensive or rate-limited into uselessness."
status: "Open source"
tags: ["python", "rest-api", "data", "crawling"]
icon: refresh
featured: true
weight: 40
banner_label: "newscastAPI · news search REST API"
banner_icon: refresh
meta:
  - { label: "Language", value: "Python" }
  - { label: "Stars", value: "3" }
  - { label: "Started", value: "2021" }
  - { label: "Docs", value: "ReadTheDocs" }
actions:
  - { label: "Repository", url: "https://github.com/SiddeshSambasivam/newscastAPI", icon: "github", primary: true }
  - { label: "Documentation", url: "https://newscastapi.readthedocs.io/en/latest/", icon: "doc" }
---

A small Python service that crawls news headlines for a given query word and returns a clean JSON payload. Each article comes with:

- Headline
- Source
- URL
- Published timestamp
- Category
- Country

## Why I built it

I wanted to track sentiment for a specific term across news and tweets for another project. Every commercial alternative was either too expensive or too restrictive for prototyping, so I built a small Google News crawler with a thin REST layer on top. Good enough for the use case, and a useful exercise in shipping a Python package with proper docs.
