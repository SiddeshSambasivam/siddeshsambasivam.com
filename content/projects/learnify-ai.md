---
title: "Learnify AI"
oneliner: "Turn your study notes into an interactive knowledge graph."
date: 2020-08-31
date_label: "2020 → 2023"
subtitle: "A web app that extracts keywords from lecture notes, summarizes each topic, and renders the result as a knowledge graph — then recommends what to revise based on the time you have."
status: "Open source"
tags: ["javascript", "knowledge-graph", "nlp", "edtech"]
icon: sparks
featured: true
weight: 20
banner_label: "learnify · notes → knowledge graph"
banner_icon: sparks
meta:
  - { label: "Stack", value: "Flask + React" }
  - { label: "Stars", value: "7" }
  - { label: "Started", value: "2020" }
  - { label: "Topic", value: "EdTech" }
actions:
  - {
      label: "Repository",
      url: "https://github.com/SiddeshSambasivam/Learnify.AI",
      icon: "github",
      primary: true,
    }
---

Learnify AI is a web app for students. You feed it lecture notes; it extracts keywords, summarizes the concepts behind each one, and renders the relationships as an interactive knowledge graph.

## What it does

- **Keyword extraction** from raw lecture text.
- **Per-topic summarization** so you can scan instead of re-read.
- **Knowledge graph view** that surfaces how concepts connect — useful both as a study aid and a retention check.
- **Time-aware revision** — given how long you have to study, the app recommends the topics worth prioritising.

## Stack

A Flask backend handles the NLP pipeline; the frontend is a React app that renders the graph and the revision flow. Built as a side project to explore graph-shaped UIs for learning — the prototype that turned into a longer interest in retrieval and structured representations of unstructured text.
